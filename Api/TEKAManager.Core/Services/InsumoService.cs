using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class InsumoService : IInsumoService
{
    private readonly TekaDbContext _db;

    public InsumoService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<InsumoDTO>> GetAllAsync()
    {
        var insumos = await _db.Database
            .SqlQueryRaw<Insumo>("EXEC dbo.sp_Insumo_GetAll")
            .ToListAsync();

        return insumos.Select(MapToDTO);
    }

    public async Task<InsumoDTO?> GetByIdAsync(int id)
    {
        var param = new SqlParameter("@InsumoId", id);

        var insumos = await _db.Database
            .SqlQueryRaw<Insumo>("EXEC dbo.sp_Insumo_GetById @InsumoId", param)
            .ToListAsync();

        var insumo = insumos.FirstOrDefault();
        return insumo is null ? null : MapToDTO(insumo);
    }

    public async Task<int> InsertAsync(InsumoInsertRequest request)
    {
        if (request.StockMinimo < 0)
            throw new InvalidOperationException("El stock mínimo no puede ser negativo.");

        await ValidateUnidadMelaminaAsync(request.TipoInsumoId, request.UnidadMedidaId);
        var nombre = await ResolveNombreAsync(request.TipoInsumoId, request.NombreInsumoId, request.Nombre, request.ColorId);

        var pNombre = new SqlParameter("@Nombre", nombre);
        var pDescripcion = new SqlParameter("@Descripcion", (object?)request.Descripcion ?? DBNull.Value);
        var pTipoInsumo = new SqlParameter("@TipoInsumoId", request.TipoInsumoId);
        var pColor = new SqlParameter("@ColorId", (object?)request.ColorId ?? DBNull.Value);
        var pUnidad = new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId);
        var pStockMinimo = new SqlParameter("@StockMinimo", request.StockMinimo);
        var pNombreInsumoId = new SqlParameter("@NombreInsumoId", (object?)request.NombreInsumoId ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_Insumo_Insert @Nombre=@Nombre, @Descripcion=@Descripcion, @TipoInsumoId=@TipoInsumoId, @ColorId=@ColorId, @UnidadMedidaId=@UnidadMedidaId, @StockMinimo=@StockMinimo, @NombreInsumoId=@NombreInsumoId",
                pNombre, pDescripcion, pTipoInsumo, pColor, pUnidad, pStockMinimo, pNombreInsumoId)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateAsync(int id, InsumoUpdateRequest request)
    {
        if (request.StockMinimo < 0)
            throw new InvalidOperationException("El stock mínimo no puede ser negativo.");

        await ValidateUnidadMelaminaAsync(request.TipoInsumoId, request.UnidadMedidaId);
        var nombre = await ResolveNombreAsync(request.TipoInsumoId, request.NombreInsumoId, request.Nombre, request.ColorId);

        var pId = new SqlParameter("@InsumoId", id);
        var pNombre = new SqlParameter("@Nombre", nombre);
        var pDescripcion = new SqlParameter("@Descripcion", (object?)request.Descripcion ?? DBNull.Value);
        var pTipoInsumo = new SqlParameter("@TipoInsumoId", request.TipoInsumoId);
        var pColor = new SqlParameter("@ColorId", (object?)request.ColorId ?? DBNull.Value);
        var pUnidad = new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId);
        var pStockMinimo = new SqlParameter("@StockMinimo", request.StockMinimo);
        var pNombreInsumoId = new SqlParameter("@NombreInsumoId", (object?)request.NombreInsumoId ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Insumo_Update @InsumoId=@InsumoId, @Nombre=@Nombre, @Descripcion=@Descripcion, @TipoInsumoId=@TipoInsumoId, @ColorId=@ColorId, @UnidadMedidaId=@UnidadMedidaId, @StockMinimo=@StockMinimo, @NombreInsumoId=@NombreInsumoId",
             pId, pNombre, pDescripcion, pTipoInsumo, pColor, pUnidad, pStockMinimo, pNombreInsumoId);
    }

    public async Task DeleteAsync(int id, InsumoDeleteRequest request)
    {
        var pId = new SqlParameter("@InsumoId", id);
        var pMotivo = new SqlParameter("@MotivoInactivacionId", request.MotivoInactivacionId);
        var pObs = new SqlParameter("@ObservacionInactivacion", (object?)request.ObservacionInactivacion ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Insumo_Delete @InsumoId, @MotivoInactivacionId, @ObservacionInactivacion",
            pId, pMotivo, pObs);
    }

    public async Task ActivateAsync(int id)
    {
        var pId = new SqlParameter("@InsumoId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Insumo_Activar @InsumoId",
            pId);
    }

    private async Task<string> ResolveNombreAsync(int tipoInsumoId, int? nombreInsumoId, string? nombreAnterior, int? colorId)
    {
        // Los clientes anteriores pueden seguir enviando Nombre sin NombreInsumoId.
        // En las nuevas pantallas, el nombre proviene exclusivamente del catálogo SQL.
        if (!nombreInsumoId.HasValue)
        {
            if (string.IsNullOrWhiteSpace(nombreAnterior))
                throw new InvalidOperationException("Seleccioná un nombre de insumo.");
            return nombreAnterior.Trim();
        }

        var nombres = await _db.Database
            .SqlQueryRaw<LookupDTO>(
                "EXEC dbo.sp_NombreInsumoCatalogo_GetLookup @TipoInsumoId={0}", tipoInsumoId)
            .ToListAsync();
        var seleccionado = nombres.FirstOrDefault(x => x.Id == nombreInsumoId.Value)
            ?? throw new InvalidOperationException("El nombre seleccionado no pertenece al tipo de insumo o está inactivo.");

        string? color = null;
        if (colorId.HasValue)
        {
            var colores = await _db.Database.SqlQueryRaw<ColorLookupDTO>("EXEC dbo.sp_Color_GetLookup").ToListAsync();
            color = colores.FirstOrDefault(x => x.Id == colorId.Value)?.Descripcion
                ?? throw new InvalidOperationException("El color seleccionado no existe o está inactivo.");
        }

        var nombre = string.IsNullOrWhiteSpace(color) ? seleccionado.Descripcion : $"{seleccionado.Descripcion} {color}";
        if (nombre.Length > 120)
            throw new InvalidOperationException("El nombre comercial supera los 120 caracteres.");
        return nombre;
    }

    private async Task ValidateUnidadMelaminaAsync(int tipoInsumoId, int unidadMedidaId)
    {
        var tipos = await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_TipoInsumo_GetLookup")
            .ToListAsync();

        var tipo = tipos.FirstOrDefault(t => t.Id == tipoInsumoId)
            ?? throw new InvalidOperationException("El tipo de insumo indicado no existe o no esta activo.");

        if (!string.Equals(tipo.Descripcion, "Melamina", StringComparison.OrdinalIgnoreCase))
            return;

        var unidades = await _db.Database
            .SqlQueryRaw<UnidadMedidaLookupDTO>("EXEC dbo.sp_UnidadMedida_GetLookup")
            .ToListAsync();

        var unidad = unidades.FirstOrDefault(u => u.Id == unidadMedidaId);
        if (unidad is null || !EsMetroCuadrado(unidad))
            throw new InvalidOperationException("La melamina debe registrarse siempre en metros cuadrados (m2).");
    }

    private static bool EsMetroCuadrado(UnidadMedidaLookupDTO unidad) =>
        unidad.Abreviatura.Replace("²", "2", StringComparison.Ordinal).Equals("m2", StringComparison.OrdinalIgnoreCase)
        || unidad.Descripcion.Contains("cuadrado", StringComparison.OrdinalIgnoreCase);

    private static InsumoDTO MapToDTO(Insumo i) => new()
    {
        InsumoId = i.InsumoId,
        Codigo = i.Codigo,
        Nombre = i.Nombre,
        NombreInsumoId = i.NombreInsumoId,
        NombreCatalogo = i.NombreCatalogo,
        Descripcion = i.Descripcion,
        TipoInsumoId = i.TipoInsumoId,
        TipoInsumoNombre = i.TipoInsumoNombre,
        ColorId = i.ColorId,
        ColorNombre = i.ColorNombre,
        CodigoHex = i.CodigoHex,
        UnidadMedidaId = i.UnidadMedidaId,
        UnidadMedidaNombre = i.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = i.UnidadMedidaAbreviatura,
        StockMinimo = i.StockMinimo,
        Activo = i.Activo,
        FechaAlta = i.FechaAlta,
        MotivoInactivacionId = i.MotivoInactivacionId,
        MotivoInactivacionNombre = i.MotivoInactivacionNombre,
        ObservacionInactivacion = i.ObservacionInactivacion,
        FechaInactivacion = i.FechaInactivacion
    };
}
