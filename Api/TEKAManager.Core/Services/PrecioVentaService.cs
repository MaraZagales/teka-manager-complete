using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class PrecioVentaService : IPrecioVentaService
{
    private readonly TekaDbContext _db;

    public PrecioVentaService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<PrecioVentaDTO>> GetAllAsync()
    {
        var precios = await _db.Database
            .SqlQueryRaw<PrecioVenta>("EXEC dbo.sp_PrecioVenta_GetAll")
            .ToListAsync();

        return precios.Select(MapToDTO);
    }

    public async Task<IEnumerable<PrecioVentaDTO>> GetByProductoAsync(int productoId)
    {
        var pProducto = new SqlParameter("@ProductoId", productoId);

        var precios = await _db.Database
            .SqlQueryRaw<PrecioVenta>("EXEC dbo.sp_PrecioVenta_GetByProducto @ProductoId", pProducto)
            .ToListAsync();

        return precios.Select(MapToDTO);
    }

    public async Task<PrecioVentaDTO?> GetVigenteAsync(int productoId)
    {
        var pProducto = new SqlParameter("@ProductoId", productoId);

        var precios = await _db.Database
            .SqlQueryRaw<PrecioVentaVigente>("EXEC dbo.sp_PrecioVenta_GetVigente @ProductoId", pProducto)
            .ToListAsync();

        var precio = precios.FirstOrDefault();
        return precio is null ? null : MapToDTO(precio);
    }

    public async Task<IEnumerable<PrecioVentaCorreccionDTO>> GetCorreccionesByProductoAsync(int productoId)
    {
        var pProducto = new SqlParameter("@ProductoId", productoId);
        try
        {
            return await _db.Database
                .SqlQueryRaw<PrecioVentaCorreccionDTO>(
                    "EXEC dbo.sp_PrecioVentaCorreccion_GetByProducto @ProductoId", pProducto)
                .ToListAsync();
        }
        catch (SqlException ex)
        {
            throw Translate(ex);
        }
    }

    public async Task<int> InsertAsync(PrecioVentaInsertRequest request, int usuarioId)
    {
        ValidatePrice(request.Precio);
        if (usuarioId <= 0) throw new InvalidOperationException("No se pudo identificar al usuario responsable.");

        var pProducto = new SqlParameter("@ProductoId", request.ProductoId);
        var pPrecio = new SqlParameter("@Precio", System.Data.SqlDbType.Decimal) { Precision = 18, Scale = 2, Value = request.Precio };
        var pUsuario = new SqlParameter("@UsuarioId", usuarioId);

        try
        {
            var result = await _db.Database
                .SqlQueryRaw<int>(
                    "EXEC dbo.sp_PrecioVenta_Insert @ProductoId, @Precio, @UsuarioId",
                    pProducto, pPrecio, pUsuario)
                .ToListAsync();
            return result.Single();
        }
        catch (SqlException ex)
        {
            throw Translate(ex);
        }
    }

    public async Task CorrectAsync(int id, PrecioVentaCorrectionRequest request, int usuarioId)
    {
        ValidatePrice(request.Precio);
        var motivo = request.Motivo.Trim();
        if (motivo.Length < 5) throw new InvalidOperationException("El motivo debe tener al menos 5 caracteres.");
        if (usuarioId <= 0) throw new InvalidOperationException("No se pudo identificar al usuario responsable.");

        var pId = new SqlParameter("@PrecioVentaId", id);
        var pPrecio = new SqlParameter("@Precio", System.Data.SqlDbType.Decimal) { Precision = 18, Scale = 2, Value = request.Precio };
        var pMotivo = new SqlParameter("@Motivo", System.Data.SqlDbType.NVarChar, 500) { Value = motivo };
        var pUsuario = new SqlParameter("@UsuarioId", usuarioId);

        try
        {
            await _db.Database.ExecuteSqlRawAsync(
                "EXEC dbo.sp_PrecioVenta_Corregir @PrecioVentaId, @Precio, @Motivo, @UsuarioId",
                pId, pPrecio, pMotivo, pUsuario);
        }
        catch (SqlException ex)
        {
            throw Translate(ex);
        }
    }

    private static void ValidatePrice(decimal price)
    {
        if (price <= 0 || price > 9999999999999999.99m)
            throw new InvalidOperationException("El precio debe ser mayor a cero y compatible con el formato monetario.");
        if (decimal.Round(price, 2) != price)
            throw new InvalidOperationException("El precio admite hasta dos decimales.");
    }

    private static Exception Translate(SqlException ex) => ex.Number switch
    {
        51001 or 51003 => new KeyNotFoundException(ex.Message, ex),
        2601 or 2627 or 51008 => new PrecioVentaConflictException("El precio cambió durante la operación. Actualizá la pantalla e intentá nuevamente."),
        51002 or 51004 or 51005 or 51006 or 51007 => new InvalidOperationException(ex.Message, ex),
        201 or 2812 or 8144 => new InvalidOperationException("La actualización SQL de Precios de venta todavía no fue aplicada.", ex),
        _ => ex
    };

    private static PrecioVentaDTO MapToDTO(PrecioVenta p) => new()
    {
        PrecioVentaId = p.PrecioVentaId,
        ProductoId = p.ProductoId,
        ProductoCodigo = p.ProductoCodigo,
        ProductoNombre = p.ProductoNombre,
        FechaVigenciaDesde = p.FechaVigenciaDesde,
        FechaVigenciaHasta = p.FechaVigenciaHasta,
        Precio = p.Precio,
        Activo = p.Activo
    };

    private static PrecioVentaDTO MapToDTO(PrecioVentaVigente p) => new()
    {
        PrecioVentaId = p.PrecioVentaId,
        ProductoId = p.ProductoId,
        FechaVigenciaDesde = p.FechaVigenciaDesde,
        FechaVigenciaHasta = p.FechaVigenciaHasta,
        Precio = p.Precio,
        Activo = p.Activo
    };
}
