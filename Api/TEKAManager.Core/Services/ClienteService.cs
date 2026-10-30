using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.RegularExpressions;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class ClienteService : IClienteService
{
    private readonly TekaDbContext _db;

    public ClienteService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ClienteDTO>> GetAllAsync()
    {
        var clientes = await _db.Database
            .SqlQueryRaw<Cliente>("EXEC dbo.sp_Cliente_GetAll")
            .ToListAsync();

        return clientes.Select(MapToDTO);
    }

    public async Task<ClienteDTO?> GetByIdAsync(int id)
    {
        var pId = new SqlParameter("@ClienteId", id);

        var clientes = await _db.Database
            .SqlQueryRaw<Cliente>("EXEC dbo.sp_Cliente_GetById @ClienteId", pId)
            .ToListAsync();

        var cliente = clientes.FirstOrDefault();
        return cliente is null ? null : MapToDTO(cliente);
    }

    public async Task<int> InsertAsync(ClienteInsertRequest request)
    {
        NormalizeAndValidate(request);
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        await ValidateDocumentoUnicoAsync(request.TipoDocumentoId, request.Documento, null);

        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pApellido = new SqlParameter("@Apellido", (object?)request.Apellido ?? DBNull.Value);
        var pTipoDocumento = new SqlParameter("@TipoDocumentoId", request.TipoDocumentoId);
        var pDocumento = new SqlParameter("@Documento", (object?)request.Documento ?? DBNull.Value);
        var pTelefono = new SqlParameter("@Telefono", (object?)request.Telefono ?? DBNull.Value);
        var pEmail = new SqlParameter("@Email", (object?)request.Email ?? DBNull.Value);
        var pCondicionIVA = new SqlParameter("@CondicionIVAId", request.CondicionIVAId);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Cliente_Insert @Nombre, @Apellido, @TipoDocumentoId, @Documento, @Telefono, @Email, @CondicionIVAId, @Observaciones",
                pNombre, pApellido, pTipoDocumento, pDocumento, pTelefono, pEmail, pCondicionIVA, pObservaciones)
            .ToListAsync();

        var id = Convert.ToInt32(result.FirstOrDefault());
        await transaction.CommitAsync();
        return id;
    }

    public async Task UpdateAsync(int id, ClienteUpdateRequest request)
    {
        NormalizeAndValidate(request);
        if (await GetByIdAsync(id) is null) throw new KeyNotFoundException("No se encontró el cliente solicitado.");
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        await ValidateDocumentoUnicoAsync(request.TipoDocumentoId, request.Documento, id);

        var pId = new SqlParameter("@ClienteId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pApellido = new SqlParameter("@Apellido", (object?)request.Apellido ?? DBNull.Value);
        var pTipoDocumento = new SqlParameter("@TipoDocumentoId", request.TipoDocumentoId);
        var pDocumento = new SqlParameter("@Documento", (object?)request.Documento ?? DBNull.Value);
        var pTelefono = new SqlParameter("@Telefono", (object?)request.Telefono ?? DBNull.Value);
        var pEmail = new SqlParameter("@Email", (object?)request.Email ?? DBNull.Value);
        var pCondicionIVA = new SqlParameter("@CondicionIVAId", request.CondicionIVAId);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cliente_Update @ClienteId, @Nombre, @Apellido, @TipoDocumentoId, @Documento, @Telefono, @Email, @CondicionIVAId, @Observaciones",
            pId, pNombre, pApellido, pTipoDocumento, pDocumento, pTelefono, pEmail, pCondicionIVA, pObservaciones);
        await transaction.CommitAsync();
    }

    public async Task DeleteAsync(int id, ClienteDeleteRequest request)
    {
        var cliente = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el cliente solicitado.");
        if (!cliente.Activo) throw new InvalidOperationException("El cliente ya se encuentra inactivo.");
        var reasonExists = await _db.Database.SqlQueryRaw<int>("SELECT COUNT(1) AS Value FROM dbo.MotivoInactivacion WHERE MotivoInactivacionId={0} AND Activo=1", request.MotivoInactivacionId).SingleAsync();
        if (reasonExists == 0) throw new InvalidOperationException("Seleccioná un motivo de inactivación válido.");
        var pId = new SqlParameter("@ClienteId", id);
        var pMotivo = new SqlParameter("@MotivoInactivacionId", request.MotivoInactivacionId);
        var pObservacion = new SqlParameter("@ObservacionInactivacion", (object?)request.ObservacionInactivacion ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cliente_Delete @ClienteId, @MotivoInactivacionId, @ObservacionInactivacion",
            pId, pMotivo, pObservacion);
    }

    private static void NormalizeAndValidate(ClienteInsertRequest request)
    {
        request.Nombre = request.Nombre.Trim();
        request.Apellido = NullIfWhiteSpace(request.Apellido);
        request.Documento = NullIfWhiteSpace(request.Documento);
        request.Telefono = NullIfWhiteSpace(request.Telefono);
        request.Email = NullIfWhiteSpace(request.Email)?.ToLowerInvariant();
        request.Observaciones = NullIfWhiteSpace(request.Observaciones);
        if (request.Nombre.Length == 0) throw new InvalidOperationException("El nombre del cliente es obligatorio.");
        if (request.Telefono is null && request.Email is null) throw new InvalidOperationException("Informá al menos un teléfono o correo electrónico.");
        if (request.Documento is not null && !Regex.IsMatch(request.Documento, @"^[\p{L}\p{N}\s.\-/()]+$"))
            throw new InvalidOperationException("El documento contiene caracteres no válidos.");
    }

    private async Task ValidateDocumentoUnicoAsync(int tipoDocumentoId, string? documento, int? clienteId)
    {
        var typeCode = await _db.Database.SqlQueryRaw<int>("SELECT CodigoARCA AS Value FROM dbo.TipoDocumento WHERE TipoDocumentoId={0} AND Activo=1", tipoDocumentoId).ToListAsync();
        if (typeCode.Count == 0) throw new InvalidOperationException("Seleccioná un tipo de documento válido.");
        if (documento is null) return;
        var normalized = NormalizeDocument(documento);
        if (normalized.Length == 0) throw new InvalidOperationException("Ingresá un número de documento válido.");
        if (!normalized.All(char.IsDigit)) throw new InvalidOperationException("El documento solo puede contener números y separadores.");
        var pType = new SqlParameter("@TipoDocumentoId", tipoDocumentoId);
        var pDocument = new SqlParameter("@Documento", normalized);
        var pCustomer = new SqlParameter("@ClienteId", (object?)clienteId ?? DBNull.Value);
        const string sql = """
            SELECT COUNT(1) AS Value FROM dbo.Cliente WITH (UPDLOCK,HOLDLOCK)
            WHERE TipoDocumentoId=@TipoDocumentoId AND (@ClienteId IS NULL OR ClienteId<>@ClienteId)
              AND NULLIF(LTRIM(RTRIM(Documento)),'') IS NOT NULL
              AND UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(Documento)),'.',''),'-',''),'/',''),' ',''),'(',''),')',''))=@Documento
            """;
        var duplicate = await _db.Database.SqlQueryRaw<int>(sql, pType, pCustomer, pDocument).SingleAsync();
        if (duplicate > 0) throw new DuplicateCustomerDocumentException();
    }

    private static string NormalizeDocument(string value) => new(value.Normalize().Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
    private static string? NullIfWhiteSpace(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ClienteDTO MapToDTO(Cliente c) => new()
    {
        ClienteId = c.ClienteId,
        Nombre = c.Nombre,
        Apellido = c.Apellido,
        TipoDocumentoId = c.TipoDocumentoId,
        TipoDocumentoNombre = c.TipoDocumentoNombre,
        TipoDocumentoCodigoARCA = c.TipoDocumentoCodigoARCA,
        Documento = c.Documento,
        Telefono = c.Telefono,
        Email = c.Email,
        CondicionIVAId = c.CondicionIVAId,
        CondicionIVANombre = c.CondicionIVANombre,
        CondicionIVACodigoAFIP = c.CondicionIVACodigoAFIP,
        Observaciones = c.Observaciones,
        Activo = c.Activo,
        FechaAlta = c.FechaAlta,
        MotivoInactivacionId = c.MotivoInactivacionId,
        MotivoInactivacionNombre = c.MotivoInactivacionNombre,
        ObservacionInactivacion = c.ObservacionInactivacion,
        FechaInactivacion = c.FechaInactivacion
    };

    public async Task ActivateAsync(int id)
    {
        var cliente = await GetByIdAsync(id) ?? throw new KeyNotFoundException("No se encontró el cliente solicitado.");
        if (cliente.Activo) throw new InvalidOperationException("El cliente ya se encuentra activo.");
        var pId = new SqlParameter("@ClienteId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cliente_Activar @ClienteId",
            pId);
    }
}
