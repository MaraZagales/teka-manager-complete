using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;

namespace TEKAManager.Core.Services;

public class StockService : IStockService
{
    private readonly TekaDbContext _db;

    public StockService(TekaDbContext db)
    {
        _db = db;
    }

    // ── StockProducto ──────────────────────────────────────────

    public async Task<IEnumerable<StockProductoDTO>> GetAllStockProductoAsync()
    {
        var stock = await _db.Database
            .SqlQueryRaw<StockProducto>("EXEC dbo.sp_StockProducto_GetAll")
            .ToListAsync();

        return stock.Select(MapStockProductoToDTO);
    }

    public async Task<IEnumerable<StockProductoDTO>> GetStockProductoByProductoAsync(int productoId)
    {
        var param = new SqlParameter("@ProductoId", productoId);

        var stock = await _db.Database
            .SqlQueryRaw<StockProducto>(
                "EXEC dbo.sp_StockProducto_GetByProducto @ProductoId",
                param)
            .ToListAsync();

        return stock.Select(MapStockProductoToDTO);
    }

    public async Task<IEnumerable<StockProductoDTO>> GetStockProductoByDepositoAsync(int depositoId)
    {
        var param = new SqlParameter("@DepositoId", depositoId);

        var stock = await _db.Database
            .SqlQueryRaw<StockProducto>(
                "EXEC dbo.sp_StockProducto_GetByDeposito @DepositoId",
                param)
            .ToListAsync();

        return stock.Select(MapStockProductoToDTO);
    }

    // ── StockInsumo ────────────────────────────────────────────

    public async Task<IEnumerable<StockInsumoDTO>> GetAllStockInsumoAsync()
    {
        var stock = await _db.Database
            .SqlQueryRaw<StockInsumo>("EXEC dbo.sp_StockInsumo_GetAll")
            .ToListAsync();

        return stock.Select(MapStockInsumoToDTO);
    }

    public async Task<IEnumerable<StockInsumoDTO>> GetStockInsumoByInsumoAsync(int insumoId)
    {
        var param = new SqlParameter("@InsumoId", insumoId);

        var stock = await _db.Database
            .SqlQueryRaw<StockInsumo>(
                "EXEC dbo.sp_StockInsumo_GetByInsumo @InsumoId",
                param)
            .ToListAsync();

        return stock.Select(MapStockInsumoToDTO);
    }

    public async Task<IEnumerable<StockInsumoDTO>> GetStockInsumoByDepositoAsync(int depositoId)
    {
        var param = new SqlParameter("@DepositoId", depositoId);

        var stock = await _db.Database
            .SqlQueryRaw<StockInsumo>(
                "EXEC dbo.sp_StockInsumo_GetByDeposito @DepositoId",
                param)
            .ToListAsync();

        return stock.Select(MapStockInsumoToDTO);
    }

    // ── Mappers ────────────────────────────────────────────────

    private static StockProductoDTO MapStockProductoToDTO(StockProducto s) => new()
    {
        StockProductoId = s.StockProductoId,
        ProductoId = s.ProductoId,
        ProductoCodigo = s.ProductoCodigo,
        ProductoNombre = s.ProductoNombre,
        DepositoId = s.DepositoId,
        DepositoNombre = s.DepositoNombre,
        CantidadActual = s.CantidadActual,
        StockMinimo = s.StockMinimo,

        // ✅ CORRECTO
        EsStockCritico = s.EsStockCritico == 1
    };

    private static StockInsumoDTO MapStockInsumoToDTO(StockInsumo s) => new()
    {
        StockInsumoId = s.StockInsumoId,
        InsumoId = s.InsumoId,
        InsumoCodigo = s.InsumoCodigo,
        InsumoNombre = s.InsumoNombre,
        DepositoId = s.DepositoId,
        DepositoNombre = s.DepositoNombre,
        CantidadActual = s.CantidadActual,
        StockMinimo = s.StockMinimo,

        // ✅ CORRECTO
        EsStockCritico = s.EsStockCritico == 1
    };
}