using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class MovimientoStockService : IMovimientoStockService
{
    private readonly TekaDbContext _db;

    public MovimientoStockService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<MovimientoStockDTO>> GetAllAsync()
    {
        var movimientos = await _db.Database
            .SqlQueryRaw<MovimientoStock>("EXEC dbo.sp_MovimientoStock_GetAll")
            .ToListAsync();

        return movimientos.Select(MapToDTO);
    }

    public async Task<MovimientoStockDTO?> GetByIdAsync(int id)
    {
        var param = new SqlParameter("@MovimientoStockId", id);

        var movimientos = await _db.Database
            .SqlQueryRaw<MovimientoStock>(
                "EXEC dbo.sp_MovimientoStock_GetById @MovimientoStockId",
                param)
            .ToListAsync();

        var m = movimientos.FirstOrDefault();
        return m is null ? null : MapToDTO(m);
    }

    // ✅ CORREGIDO
    public async Task<IEnumerable<MovimientoStockProductoDTO>> GetByProductoAsync(int productoId)
    {
        var param = new SqlParameter("@ProductoId", productoId);

        var items = await _db.Database
            .SqlQueryRaw<MovimientoStockProductoDTO>(
                "EXEC dbo.sp_MovimientoStock_GetByProducto @ProductoId",
                param)
            .ToListAsync();

        return items;
    }

    public async Task<IEnumerable<MovimientoStockDTO>> GetByInsumoAsync(int insumoId)
    {
        var param = new SqlParameter("@InsumoId", insumoId);

        var movimientos = await _db.Database
            .SqlQueryRaw<MovimientoStock>(
                "EXEC dbo.sp_MovimientoStock_GetByInsumo @InsumoId",
                param)
            .ToListAsync();

        return movimientos.Select(MapToDTO);
    }

    public async Task RegistrarProductoAsync(MovimientoProductoRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        ValidateOrigen(request.Motivo, request.EntidadOrigen, request.OrigenId);

        var pTipo = new SqlParameter("@TipoMovimientoStockId", request.TipoMovimientoStockId);
        var pDeposito = new SqlParameter("@DepositoId", request.DepositoId);
        var pProducto = new SqlParameter("@ProductoId", request.ProductoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pMotivo = new SqlParameter("@Motivo", (object?)request.Motivo ?? DBNull.Value);
        var pEntidad = new SqlParameter("@EntidadOrigen", (object?)request.EntidadOrigen ?? DBNull.Value);
        var pOrigen = new SqlParameter("@OrigenId", (object?)request.OrigenId ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId, @DepositoId, @ProductoId, @Cantidad, @Motivo, @EntidadOrigen, @OrigenId",
            pTipo, pDeposito, pProducto, pCantidad, pMotivo, pEntidad, pOrigen);
    }

    public async Task RegistrarInsumoAsync(MovimientoInsumoRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        ValidateOrigen(request.Motivo, request.EntidadOrigen, request.OrigenId);

        var pTipo = new SqlParameter("@TipoMovimientoStockId", request.TipoMovimientoStockId);
        var pDeposito = new SqlParameter("@DepositoId", request.DepositoId);
        var pInsumo = new SqlParameter("@InsumoId", request.InsumoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pMotivo = new SqlParameter("@Motivo", (object?)request.Motivo ?? DBNull.Value);
        var pEntidad = new SqlParameter("@EntidadOrigen", (object?)request.EntidadOrigen ?? DBNull.Value);
        var pOrigen = new SqlParameter("@OrigenId", (object?)request.OrigenId ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_RegistrarInsumo @TipoMovimientoStockId, @DepositoId, @InsumoId, @Cantidad, @Motivo, @EntidadOrigen, @OrigenId",
            pTipo, pDeposito, pInsumo, pCantidad, pMotivo, pEntidad, pOrigen);
    }

    public async Task RegistrarProductoManualAsync(MovimientoProductoManualRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Motivo))
            throw new InvalidOperationException("El motivo es obligatorio para ajustes manuales.");

        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        var pTipo = new SqlParameter("@TipoMovimientoStockId", request.TipoMovimientoStockId);
        var pDeposito = new SqlParameter("@DepositoId", request.DepositoId);
        var pProducto = new SqlParameter("@ProductoId", request.ProductoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pMotivo = new SqlParameter("@Motivo", request.Motivo);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_RegistrarProductoManual @TipoMovimientoStockId, @DepositoId, @ProductoId, @Cantidad, @Motivo",
            pTipo, pDeposito, pProducto, pCantidad, pMotivo);
    }

    public async Task RegistrarInsumoManualAsync(MovimientoInsumoManualRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Motivo))
            throw new InvalidOperationException("El motivo es obligatorio para ajustes manuales.");

        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        var pTipo = new SqlParameter("@TipoMovimientoStockId", request.TipoMovimientoStockId);
        var pDeposito = new SqlParameter("@DepositoId", request.DepositoId);
        var pInsumo = new SqlParameter("@InsumoId", request.InsumoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pMotivo = new SqlParameter("@Motivo", request.Motivo);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_RegistrarInsumoManual @TipoMovimientoStockId, @DepositoId, @InsumoId, @Cantidad, @Motivo",
            pTipo, pDeposito, pInsumo, pCantidad, pMotivo);
    }

    public async Task AnularProductoAsync(int movimientoId, AnularMovimientoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MotivoAnulacion))
            throw new InvalidOperationException("El motivo de anulación es obligatorio.");

        var pId = new SqlParameter("@MovimientoStockId", movimientoId);
        var pMotivo = new SqlParameter("@MotivoAnulacion", request.MotivoAnulacion);
        var pObs = new SqlParameter("@ObservacionAnulacion", (object?)request.ObservacionAnulacion ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_AnularProducto @MovimientoStockId, @MotivoAnulacion, @ObservacionAnulacion",
            pId, pMotivo, pObs);
    }

    public async Task AnularInsumoAsync(int movimientoId, AnularMovimientoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MotivoAnulacion))
            throw new InvalidOperationException("El motivo de anulación es obligatorio.");

        var pId = new SqlParameter("@MovimientoStockId", movimientoId);
        var pMotivo = new SqlParameter("@MotivoAnulacion", request.MotivoAnulacion);
        var pObs = new SqlParameter("@ObservacionAnulacion", (object?)request.ObservacionAnulacion ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoStock_AnularInsumo @MovimientoStockId, @MotivoAnulacion, @ObservacionAnulacion",
            pId, pMotivo, pObs);
    }

    private static void ValidateOrigen(string? motivo, string? entidadOrigen, int? origenId)
    {
        var tieneOrigen = !string.IsNullOrWhiteSpace(entidadOrigen) && origenId is > 0;
        var tieneMotivo = !string.IsNullOrWhiteSpace(motivo);

        if (!tieneOrigen && !tieneMotivo)
            throw new InvalidOperationException("Todo movimiento de stock debe indicar un origen valido o un motivo de ajuste.");

        if ((!string.IsNullOrWhiteSpace(entidadOrigen) && origenId is not > 0)
            || (string.IsNullOrWhiteSpace(entidadOrigen) && origenId is > 0))
        {
            throw new InvalidOperationException("La entidad de origen y su identificador deben informarse juntos.");
        }
    }

    private static MovimientoStockDTO MapToDTO(MovimientoStock m) => new()
    {
        MovimientoStockId = m.MovimientoStockId,
        FechaMovimiento = m.FechaMovimiento,
        TipoMovimientoStockId = m.TipoMovimientoStockId,
        TipoMovimientoNombre = m.TipoMovimientoNombre,
        Signo = m.Signo,
        DepositoId = m.DepositoId,
        DepositoNombre = m.DepositoNombre,
        ProductoId = m.ProductoId,
        ProductoCodigo = m.ProductoCodigo,
        ProductoNombre = m.ProductoNombre,
        InsumoId = m.InsumoId,
        InsumoCodigo = m.InsumoCodigo,
        InsumoNombre = m.InsumoNombre,
        Cantidad = m.Cantidad,
        Motivo = m.Motivo,
        EntidadOrigen = m.EntidadOrigen,
        OrigenId = m.OrigenId,
        Activo = m.Activo,
        FechaAnulacion = m.FechaAnulacion,
        MotivoAnulacion = m.MotivoAnulacion,
        ObservacionAnulacion = m.ObservacionAnulacion,
        MovimientoStockIdReversaDe = m.MovimientoStockIdReversaDe
    };
}
