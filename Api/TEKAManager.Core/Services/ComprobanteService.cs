using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class ComprobanteService : IComprobanteService
{
    private readonly TekaDbContext _db;
    private readonly IPedidoService _pedidoService;

    public ComprobanteService(TekaDbContext db, IPedidoService pedidoService)
    {
        _db = db;
        _pedidoService = pedidoService;
    }

    public async Task<IEnumerable<ComprobanteDTO>> GetAllAsync()
    {
        var comprobantes = await _db.Database
            .SqlQueryRaw<ComprobanteResumen>("EXEC dbo.sp_Comprobante_GetAll")
            .ToListAsync();

        return comprobantes.Select(MapToDTO);
    }

    public async Task<ComprobanteConDetalleDTO?> GetByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_Comprobante_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ComprobanteId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var comprobante = new ComprobanteConDetalleDTO
        {
            ComprobanteId = reader.GetInt32(reader.GetOrdinal("ComprobanteId")),
            PedidoId = GetNullableInt(reader, "PedidoId"),
            ClienteId = reader.GetInt32(reader.GetOrdinal("ClienteId")),
            ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
            ClienteApellido = GetNullableString(reader, "ClienteApellido"),
            TipoComprobanteId = reader.GetInt32(reader.GetOrdinal("TipoComprobanteId")),
            TipoComprobanteNombre = reader.GetString(reader.GetOrdinal("TipoComprobanteNombre")),
            PuntoVenta = reader.GetInt32(reader.GetOrdinal("PuntoVenta")),
            NumeroComprobante = GetNullableLong(reader, "NumeroComprobante"),
            FechaComprobante = reader.GetDateTime(reader.GetOrdinal("FechaComprobante")),
            TipoDocumentoId = reader.GetInt32(reader.GetOrdinal("TipoDocumentoId")),
            TipoDocumentoNombre = reader.GetString(reader.GetOrdinal("TipoDocumentoNombre")),
            DocumentoReceptor = reader.GetInt64(reader.GetOrdinal("DocumentoReceptor")),
            CondicionIVAId = GetNullableInt(reader, "CondicionIVAId"),
            CondicionIVANombre = GetNullableString(reader, "CondicionIVANombre"),
            ConceptoComprobanteId = reader.GetInt32(reader.GetOrdinal("ConceptoComprobanteId")),
            ConceptoComprobanteNombre = reader.GetString(reader.GetOrdinal("ConceptoComprobanteNombre")),
            MonedaId = reader.GetInt32(reader.GetOrdinal("MonedaId")),
            MonedaNombre = reader.GetString(reader.GetOrdinal("MonedaNombre")),
            ImporteNoGravado = reader.GetDecimal(reader.GetOrdinal("ImporteNoGravado")),
            ImporteExento = reader.GetDecimal(reader.GetOrdinal("ImporteExento")),
            ImporteNetoGravado = reader.GetDecimal(reader.GetOrdinal("ImporteNetoGravado")),
            ImporteIVA = reader.GetDecimal(reader.GetOrdinal("ImporteIVA")),
            ImporteTributos = reader.GetDecimal(reader.GetOrdinal("ImporteTributos")),
            ImporteTotal = reader.GetDecimal(reader.GetOrdinal("ImporteTotal")),
            CAE = GetNullableString(reader, "CAE"),
            FechaVencimientoCAE = GetNullableDateTime(reader, "FechaVencimientoCAE"),
            CAEA = GetNullableString(reader, "CAEA"),
            ResultadoARCA = GetNullableString(reader, "ResultadoARCA"),
            EstadoComprobante = reader.GetString(reader.GetOrdinal("EstadoComprobante")),
            Observaciones = GetNullableString(reader, "Observaciones")
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            comprobante.Detalles.Add(new DetalleComprobanteDTO
            {
                DetalleComprobanteId = reader.GetInt32(reader.GetOrdinal("DetalleComprobanteId")),
                ComprobanteId = reader.GetInt32(reader.GetOrdinal("ComprobanteId")),
                ProductoId = GetNullableInt(reader, "ProductoId"),
                DescripcionItem = reader.GetString(reader.GetOrdinal("DescripcionItem")),
                Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
                PrecioUnitario = reader.GetDecimal(reader.GetOrdinal("PrecioUnitario")),
                BonificacionImporte = reader.GetDecimal(reader.GetOrdinal("BonificacionImporte")),
                ImporteNetoItem = reader.GetDecimal(reader.GetOrdinal("ImporteNetoItem")),
                AlicuotaIVAId = GetNullableInt(reader, "AlicuotaIVAId"),
                AlicuotaIVANombre = GetNullableString(reader, "AlicuotaIVANombre"),
                BaseImponibleIVA = GetNullableDecimal(reader, "BaseImponibleIVA"),
                ImporteIVAItem = GetNullableDecimal(reader, "ImporteIVAItem"),
                ImporteTotalItem = reader.GetDecimal(reader.GetOrdinal("ImporteTotalItem"))
            });
        }

        return comprobante;
    }

    public async Task<int> InsertDesdePedidoAsync(ComprobanteDesdePedidoRequest request)
    {
        await ValidatePedidoFacturableAsync(request.PedidoId);

        var pPedido = new SqlParameter("@PedidoId", request.PedidoId);
        var pTipo = new SqlParameter("@TipoComprobanteId", request.TipoComprobanteId);
        var pPunto = new SqlParameter("@PuntoVenta", request.PuntoVenta);
        var pNumero = new SqlParameter("@NumeroComprobante", (object?)request.NumeroComprobante ?? DBNull.Value);
        var pConcepto = new SqlParameter("@ConceptoComprobanteId", request.ConceptoComprobanteId);
        var pMoneda = new SqlParameter("@MonedaId", request.MonedaId);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_Comprobante_InsertDesdePedido @PedidoId, @TipoComprobanteId, @PuntoVenta, @NumeroComprobante, @ConceptoComprobanteId, @MonedaId, @Observaciones",
                pPedido, pTipo, pPunto, pNumero, pConcepto, pMoneda, pObservaciones)
            .ToListAsync();

        return result.FirstOrDefault();
    }

    public Task<int> EmitirNotaCreditoAsync(int comprobanteOrigenId, NotaComprobanteRequest request)
    {
        // Las notas de credito de ventas deben tramitarse exclusivamente mediante
        // la anulacion integral B4 (reintegro + reposicion de inventario).
        return Task.FromException<int>(new InvalidOperationException(
            "La nota de credito interna se emite unicamente mediante la anulacion integral de la venta (POST /api/ventas/{id}/anulacion-integral)."));
    }

    public async Task<int> EmitirNotaDebitoAsync(int comprobanteOrigenId, NotaComprobanteRequest request)
    {
        await ValidateComprobanteOrigenAsync(comprobanteOrigenId);
        return await EmitirNotaAsync("EXEC dbo.sp_Comprobante_EmitirNotaDebito @ComprobanteOrigenId, @TipoComprobanteId, @PuntoVenta, @NumeroComprobante, @Observaciones", comprobanteOrigenId, request);
    }

    private async Task<int> EmitirNotaAsync(string sql, int comprobanteOrigenId, NotaComprobanteRequest request)
    {
        var pOrigen = new SqlParameter("@ComprobanteOrigenId", comprobanteOrigenId);
        var pTipo = new SqlParameter("@TipoComprobanteId", request.TipoComprobanteId);
        var pPunto = new SqlParameter("@PuntoVenta", request.PuntoVenta);
        var pNumero = new SqlParameter("@NumeroComprobante", (object?)request.NumeroComprobante ?? DBNull.Value);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(sql, pOrigen, pTipo, pPunto, pNumero, pObservaciones)
            .ToListAsync();

        return result.FirstOrDefault();
    }

    private async Task ValidatePedidoFacturableAsync(int pedidoId)
    {
        var pedido = await _pedidoService.GetByIdAsync(pedidoId);

        if (pedido is null)
            throw new InvalidOperationException("El pedido indicado no existe.");

        if (pedido.Detalles.Count == 0)
            throw new InvalidOperationException("No se puede emitir comprobante de un pedido sin detalles.");

        if (!string.Equals(pedido.EstadoPedidoNombre, "Entregado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("El comprobante interno solo puede emitirse despues de confirmar la entrega del remito.");

        var saldo = await _pedidoService.GetSaldoAsync(pedidoId);
        if (saldo is null || saldo.Saldo > 0.01m)
            throw new InvalidOperationException("El pedido tiene saldo pendiente.");
    }

    private async Task ValidateComprobanteOrigenAsync(int comprobanteId)
    {
        var comprobante = await GetByIdAsync(comprobanteId);

        if (comprobante is null)
            throw new InvalidOperationException("El comprobante de origen no existe.");
    }

    private static ComprobanteDTO MapToDTO(ComprobanteResumen c) => new()
    {
        ComprobanteId = c.ComprobanteId,
        PedidoId = c.PedidoId,
        ClienteId = c.ClienteId,
        ClienteNombre = c.ClienteNombre,
        ClienteApellido = c.ClienteApellido,
        TipoComprobanteId = c.TipoComprobanteId,
        TipoComprobanteNombre = c.TipoComprobanteNombre,
        PuntoVenta = c.PuntoVenta,
        NumeroComprobante = c.NumeroComprobante,
        FechaComprobante = c.FechaComprobante,
        ImporteTotal = c.ImporteTotal,
        EstadoComprobante = c.EstadoComprobante,
        CAE = c.CAE,
        ResultadoARCA = c.ResultadoARCA,
        Observaciones = c.Observaciones
    };

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static int? GetNullableInt(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
    }

    private static long? GetNullableLong(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt64(ordinal);
    }

    private static decimal? GetNullableDecimal(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
    }

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }
}
