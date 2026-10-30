using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class ProductoService : IProductoService
{
    private readonly TekaDbContext _db;

    public ProductoService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ProductoDTO>> GetAllAsync()
    {
        var productos = await _db.Database
            .SqlQueryRaw<Producto>("EXEC dbo.sp_Producto_GetAll")
            .ToListAsync();

        return productos.Select(MapToDTO);
    }

    public async Task<ProductoDTO?> GetByIdAsync(int id)
    {
        var param = new SqlParameter("@ProductoId", id);

        var productos = await _db.Database
            .SqlQueryRaw<Producto>(
                "EXEC dbo.sp_Producto_GetById @ProductoId",
                param)
            .ToListAsync();

        var producto = productos.FirstOrDefault();
        return producto is null ? null : MapToDTO(producto);
    }

    // ✅ CORREGIDO (decimal → int)
    public async Task<int> InsertAsync(ProductoInsertRequest request)
    {
        if (request.StockMinimo < 0)
            throw new InvalidOperationException("El stock mínimo no puede ser negativo.");

        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pNombreProductoId = new SqlParameter("@NombreProductoId", (object?)request.NombreProductoId ?? DBNull.Value);
        var pDescripcion = new SqlParameter("@Descripcion", (object?)request.Descripcion ?? DBNull.Value);
        var pTipo = new SqlParameter("@TipoProductoId", request.TipoProductoId);
        var pColor = new SqlParameter("@ColorId", (object?)request.ColorId ?? DBNull.Value);
        var pUnidad = new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId);
        var pStockMinimo = new SqlParameter("@StockMinimo", request.StockMinimo);
        var pAncho = new SqlParameter("@AnchoCm", request.AnchoCm!.Value);
        var pAlto = new SqlParameter("@AltoCm", request.AltoCm!.Value);
        var pProfundidad = new SqlParameter("@ProfundidadCm", request.ProfundidadCm!.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_Producto_Insert @Nombre, @Descripcion, @TipoProductoId, @ColorId, @UnidadMedidaId, @StockMinimo, @AnchoCm, @AltoCm, @ProfundidadCm, @NombreProductoId",
                pNombre, pDescripcion, pTipo, pColor, pUnidad, pStockMinimo, pAncho, pAlto, pProfundidad, pNombreProductoId)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateAsync(int id, ProductoUpdateRequest request)
    {
        if (request.StockMinimo < 0)
            throw new InvalidOperationException("El stock mínimo no puede ser negativo.");

        var pId = new SqlParameter("@ProductoId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pNombreProductoId = new SqlParameter("@NombreProductoId", (object?)request.NombreProductoId ?? DBNull.Value);
        var pDescripcion = new SqlParameter("@Descripcion", (object?)request.Descripcion ?? DBNull.Value);
        var pTipo = new SqlParameter("@TipoProductoId", request.TipoProductoId);
        var pColor = new SqlParameter("@ColorId", (object?)request.ColorId ?? DBNull.Value);
        var pUnidad = new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId);
        var pStockMinimo = new SqlParameter("@StockMinimo", request.StockMinimo);
        var pAncho = new SqlParameter("@AnchoCm", request.AnchoCm!.Value);
        var pAlto = new SqlParameter("@AltoCm", request.AltoCm!.Value);
        var pProfundidad = new SqlParameter("@ProfundidadCm", request.ProfundidadCm!.Value);

        await _db.Database.ExecuteSqlRawAsync(
           "EXEC dbo.sp_Producto_Update @ProductoId, @Nombre, @Descripcion, @TipoProductoId, @ColorId, @UnidadMedidaId, @StockMinimo, @AnchoCm, @AltoCm, @ProfundidadCm, @NombreProductoId",
            pId, pNombre, pDescripcion, pTipo, pColor, pUnidad, pStockMinimo, pAncho, pAlto, pProfundidad, pNombreProductoId);
    }

    public async Task DeleteAsync(int id, ProductoDeleteRequest request)
    {
        var pId = new SqlParameter("@ProductoId", id);
        var pMotivo = new SqlParameter("@MotivoInactivacionId", request.MotivoInactivacionId);
        var pObs = new SqlParameter("@ObservacionInactivacion", (object?)request.ObservacionInactivacion ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Producto_Delete @ProductoId, @MotivoInactivacionId, @ObservacionInactivacion",
            pId, pMotivo, pObs);
    }

    public async Task ActivateAsync(int id)
    {
        var pId = new SqlParameter("@ProductoId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Producto_Activar @ProductoId",
            pId);
    }

    private static ProductoDTO MapToDTO(Producto p) => new()
    {
        ProductoId = p.ProductoId,
        Codigo = p.Codigo,
        Nombre = p.Nombre,
        NombreProductoId = p.NombreProductoId,
        NombreCatalogo = p.NombreCatalogo,
        Descripcion = p.Descripcion,
        TipoProductoId = p.TipoProductoId,
        TipoProductoNombre = p.TipoProductoNombre,
        ColorId = p.ColorId,
        ColorNombre = p.ColorNombre,
        CodigoHex = p.CodigoHex,
        UnidadMedidaId = p.UnidadMedidaId,
        UnidadMedidaNombre = p.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = p.UnidadMedidaAbreviatura,
        StockMinimo = p.StockMinimo,
        AnchoCm = p.AnchoCm,
        AltoCm = p.AltoCm,
        ProfundidadCm = p.ProfundidadCm,
        Activo = p.Activo,
        FechaAlta = p.FechaAlta,
        MotivoInactivacionId = p.MotivoInactivacionId,
        MotivoInactivacionNombre = p.MotivoInactivacionNombre,
        ObservacionInactivacion = p.ObservacionInactivacion,
        FechaInactivacion = p.FechaInactivacion
    };
}