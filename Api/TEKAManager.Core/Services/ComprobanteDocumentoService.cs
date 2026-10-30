using System.Data;
using System.Net;
using System.Net.Mail;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public sealed record EnvioComprobanteDto(long EnvioComprobanteCorreoId, int ComprobanteId,
    int? UsuarioId, string Destinatario, string Asunto, string Estado,
    DateTime FechaSolicitud, DateTime? FechaResultado, string? MensajeError, string? IdentificadorExterno);

public sealed class ComprobanteDocumentoService
{
    private readonly IComprobanteService _comprobantes;
    private readonly IEmailService _email;
    private readonly TekaDbContext _db;
    public ComprobanteDocumentoService(IComprobanteService comprobantes, IEmailService email, TekaDbContext db)
    { _comprobantes = comprobantes; _email = email; _db = db; }

    private async Task<ComprobanteConDetalleDTO> GetEmitidoAsync(int id)
    {
        var c = await _comprobantes.GetByIdAsync(id);
        if (c is null) throw new KeyNotFoundException("El comprobante no existe.");
        // La descripción comercial puede variar (tildes, sufijos "- Egreso", etc.).
        // La habilitación depende de que sea un documento interno admitido y esté emitido.
        var tipo = c.TipoComprobanteNombre.Normalize(System.Text.NormalizationForm.FormD);
        tipo = new string(tipo.Where(ch => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch) !=
            System.Globalization.UnicodeCategory.NonSpacingMark).ToArray()).ToLowerInvariant();
        var esInterno = tipo.Contains("comprobante interno") ||
                       (tipo.Contains("nota") && tipo.Contains("credito") && tipo.Contains("interna"));
        if (!string.Equals(c.EstadoComprobante?.Trim(), "EMITIDO", StringComparison.OrdinalIgnoreCase) || !esInterno)
            throw new InvalidOperationException("Solo se permite enviar o imprimir comprobantes internos y notas de crédito internas emitidos.");
        return c;
    }

    public async Task<byte[]> GenerarPdfAsync(int id) =>
        ComprobantePdfGenerator.Generate(await GetEmitidoAsync(id));

    private SqlConnection Connection() => new(_db.Database.GetConnectionString());

    public async Task<IReadOnlyList<EnvioComprobanteDto>> HistorialAsync(int comprobanteId, CancellationToken ct = default)
    {
        await GetEmitidoAsync(comprobanteId);
        var items = new List<EnvioComprobanteDto>();
        await using var cn = Connection();
        await cn.OpenAsync(ct);
        await using var cmd = new SqlCommand("dbo.sp_TEKA_ComprobanteCorreo_Listar", cn)
        { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.Add("@ComprobanteId", SqlDbType.Int).Value = comprobanteId;
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            items.Add(new EnvioComprobanteDto(
                reader.GetInt64(reader.GetOrdinal("EnvioComprobanteCorreoId")),
                reader.GetInt32(reader.GetOrdinal("ComprobanteId")),
                reader.IsDBNull(reader.GetOrdinal("UsuarioId")) ? null : reader.GetInt32(reader.GetOrdinal("UsuarioId")),
                reader.GetString(reader.GetOrdinal("Destinatario")),
                reader.GetString(reader.GetOrdinal("Asunto")),
                reader.GetString(reader.GetOrdinal("Estado")),
                reader.GetDateTime(reader.GetOrdinal("FechaSolicitud")),
                reader.IsDBNull(reader.GetOrdinal("FechaResultado")) ? null : reader.GetDateTime(reader.GetOrdinal("FechaResultado")),
                reader.IsDBNull(reader.GetOrdinal("MensajeError")) ? null : reader.GetString(reader.GetOrdinal("MensajeError")),
                reader.IsDBNull(reader.GetOrdinal("IdentificadorExterno")) ? null : reader.GetString(reader.GetOrdinal("IdentificadorExterno"))));
        }
        return items;
    }

    public async Task<long> EnviarAsync(int comprobanteId, string destinatario, int usuarioId, CancellationToken ct = default)
    {
        var c = await GetEmitidoAsync(comprobanteId);
        if (usuarioId <= 0) throw new UnauthorizedAccessException("No se identificó al usuario.");
        destinatario = (destinatario ?? "").Trim();
        if (destinatario.Length > 254) throw new ArgumentException("Correo demasiado largo.");
        try { var addr = new MailAddress(destinatario); if (addr.Address != destinatario) throw new FormatException(); }
        catch (FormatException) { throw new ArgumentException("Ingresá una dirección de correo válida."); }

        var tipoDocumento = c.TipoComprobanteNombre;
        var asunto = $"TEKA - {tipoDocumento} {c.PuntoVenta:0000}-{c.NumeroComprobante.GetValueOrDefault():00000000}";
        var pdf = ComprobantePdfGenerator.Generate(c);
        long envioId;
        await using (var cn = Connection())
        {
            await cn.OpenAsync(ct);
            await using var cmd = new SqlCommand("dbo.sp_TEKA_ComprobanteCorreo_RegistrarSolicitud", cn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add("@ComprobanteId", SqlDbType.Int).Value = comprobanteId;
            cmd.Parameters.Add("@Destinatario", SqlDbType.VarChar, 254).Value = destinatario;
            cmd.Parameters.Add("@Asunto", SqlDbType.NVarChar, 250).Value = asunto;
            cmd.Parameters.Add("@UsuarioId", SqlDbType.Int).Value = usuarioId;
            envioId = Convert.ToInt64(await cmd.ExecuteScalarAsync(ct));
        }

        Exception? error = null;
        try
        {
            var nombre = $"TEKA-{(c.TipoComprobanteNombre.Contains("crédito", StringComparison.OrdinalIgnoreCase) ? "Nota-Credito" : "Comprobante")}-{c.PuntoVenta:0000}-{c.NumeroComprobante.GetValueOrDefault():00000000}.pdf";
            await _email.SendWithAttachmentAsync(destinatario, asunto,
                "<p>Adjuntamos el documento interno de TEKA: " + WebUtility.HtmlEncode(tipoDocumento) + ".</p>" +
                "<p>Este documento es administrativo y no constituye una factura fiscal.</p>", pdf, nombre);
        }
        catch (Exception ex) { error = ex; }

        try
        {
            // Registrar resultado aun si se cancela la petición HTTP después del envío SMTP.
            await using var cn = Connection();
            await cn.OpenAsync(CancellationToken.None);
            await using var cmd = new SqlCommand("dbo.sp_TEKA_ComprobanteCorreo_RegistrarResultado", cn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add("@EnvioComprobanteCorreoId", SqlDbType.BigInt).Value = envioId;
            cmd.Parameters.Add("@Enviado", SqlDbType.Bit).Value = error is null;
            cmd.Parameters.Add("@MensajeError", SqlDbType.NVarChar, 1000).Value =
                error is null ? DBNull.Value : (object)error.Message[..Math.Min(error.Message.Length, 1000)];
            cmd.Parameters.Add("@IdentificadorExterno", SqlDbType.NVarChar, 255).Value = DBNull.Value;
            await cmd.ExecuteNonQueryAsync(CancellationToken.None);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("No se pudo registrar el resultado del envío en B6. Revisá el historial antes de reintentar para evitar duplicados.", ex);
        }
        if (error is not null)
            throw new InvalidOperationException($"El correo no se envió. Intento {envioId} registrado como ERROR: {error.Message}", error);
        return envioId;
    }
}
