using System.Data;
using System.Data.Common;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public partial class ProduccionService
{
    public async Task<int> GuardarVersionConfiguracionAsync(ConfiguracionFabricacionGuardarRequest request)
    {
        if (request.ProductoId <= 0 || request.Materiales.Count == 0 || request.Materiales.Any(x => x.InsumoId <= 0 || x.Cantidad <= 0))
            throw new InvalidOperationException("La configuración requiere un producto y materiales válidos.");
        if (request.Materiales.Select(x => x.InsumoId).Distinct().Count() != request.Materiales.Count)
            throw new InvalidOperationException("Un material no puede repetirse dentro de la configuración.");
        if (request.RecortesPrevistos.Any(x => x.InsumoId <= 0 || x.UnidadMedidaId <= 0 || x.CantidadPorUnidad <= 0 || x.Dimension <= 0))
            throw new InvalidOperationException("Los recortes previstos contienen valores inválidos.");

        try
        {
            var result = await _db.Database.SqlQueryRaw<int>(
                "EXEC dbo.sp_TEKA_ListaMateriales_GuardarVersion @ProductoId,@Nombre,@Version,@MaterialesJson,@RecortesPrevistosJson,@Activar",
                new SqlParameter("@ProductoId", request.ProductoId),
                new SqlParameter("@Nombre", request.Nombre.Trim()),
                new SqlParameter("@Version", request.Version.Trim()),
                JsonParameter("@MaterialesJson", request.Materiales),
                JsonParameter("@RecortesPrevistosJson", request.RecortesPrevistos),
                new SqlParameter("@Activar", request.Activar)).ToListAsync();
            return result.Single();
        }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    public async Task ActivarConfiguracionAsync(int id)
    {
        var draftLinks = await _db.Database.SqlQueryRaw<int>("""
            SELECT COUNT(*) AS [Value] FROM dbo.PlantillaFabricacion
            WHERE ListaMaterialesId=@id AND (Estado<>N'Aprobada' OR Estado IS NULL)
            """, new SqlParameter("@id", id)).SingleAsync();
        if (draftLinks != 0)
            throw new InvalidOperationException("No se puede activar una BOM vinculada a una plantilla de fabricación en Borrador.");
        await ExecuteBusinessProcedureAsync("EXEC dbo.sp_TEKA_ListaMateriales_Activar @ListaMaterialesId", new SqlParameter("@ListaMaterialesId", id));
    }
    public Task InactivarConfiguracionAsync(int id) => ExecuteBusinessProcedureAsync("EXEC dbo.sp_TEKA_ListaMateriales_Inactivar @ListaMaterialesId", new SqlParameter("@ListaMaterialesId", id));

    public async Task<IEnumerable<RecortePrevistoConfiguracionDTO>> GetRecortesPrevistosConfiguracionAsync(int id) =>
        await _db.Database.SqlQueryRaw<RecortePrevistoConfiguracionDTO>("EXEC dbo.sp_TEKA_ListaMateriales_RecortesPrevistos_Get @ListaMaterialesId", new SqlParameter("@ListaMaterialesId", id)).ToListAsync();

    public async Task<InicioOrdenPreviewDTO?> GetInicioPreviewAsync(int ordenId)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = StoredProcedure(connection, "dbo.sp_TEKA_OP_InicioPreview", new SqlParameter("@OrdenProduccionId", ordenId));
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        try
        {
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return null;
            var result = new InicioOrdenPreviewDTO {
                OrdenProduccionId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionId")),
                EstadoOrdenProduccionId = reader.GetInt32(reader.GetOrdinal("EstadoOrdenProduccionId")),
                Estado = reader.GetString(reader.GetOrdinal("Estado")),
                FechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion"))
            };
            await reader.NextResultAsync();
            while (await reader.ReadAsync()) result.Modelos.Add(new InicioOrdenModeloDTO {
                OrdenProduccionDetalleId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionDetalleId")), ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
                ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")), ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
                CantidadPlanificada = reader.GetDecimal(reader.GetOrdinal("CantidadPlanificada")), ListaMaterialesId = GetNullableInt32(reader, "ListaMaterialesId")
            });
            await reader.NextResultAsync();
            while (await reader.ReadAsync()) result.Materiales.Add(MapInicioMaterial(reader));
            await reader.NextResultAsync();
            while (await reader.ReadAsync()) result.Recortes.Add(new InicioOrdenRecorteDTO {
                RecorteId = reader.GetInt32(reader.GetOrdinal("RecorteId")), InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")),
                InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")), InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
                Dimension = GetNullableDecimal(reader, "Dimension"), Unidad = reader.GetString(reader.GetOrdinal("Unidad")),
                CantidadRequerida = reader.GetDecimal(reader.GetOrdinal("CantidadRequerida")), DepositoId = reader.GetInt32(reader.GetOrdinal("DepositoId")),
                DepositoNombre = reader.GetString(reader.GetOrdinal("DepositoNombre")), CantidadDisponible = reader.GetDecimal(reader.GetOrdinal("CantidadDisponible")), Faltante = reader.GetDecimal(reader.GetOrdinal("Faltante"))
            });
            return result;
        }
        catch (SqlException ex) when (ex.Number == 59501) { return null; }
    }

    public async Task<FinalizacionOrdenPreviewDTO?> GetFinalizacionPreviewAsync(int ordenId)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = StoredProcedure(connection, "dbo.sp_TEKA_OP_FinalizacionPreview", new SqlParameter("@OrdenProduccionId", ordenId));
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        try
        {
            await using var reader = await command.ExecuteReaderAsync();
            var result = new FinalizacionOrdenPreviewDTO();
            while (await reader.ReadAsync()) result.Modelos.Add(new FinalizacionModeloDTO {
                ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")), ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
                ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")), CantidadPlanificada = reader.GetDecimal(reader.GetOrdinal("CantidadPlanificada"))
            });
            if (result.Modelos.Count == 0) return null;
            await reader.NextResultAsync();
            while (await reader.ReadAsync()) result.RecortesPrevistos.Add(new FinalizacionRecortePrevistoDTO {
                OrdenProduccionRecortePrevistoSnapshotId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionRecortePrevistoSnapshotId")),
                InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")), InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")), InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
                TipoRecorteId = GetNullableInt32(reader, "TipoRecorteId"), TipoRecorteNombre = GetNullableString(reader, "TipoRecorteNombre"), ColorId = GetNullableInt32(reader, "ColorId"), ColorNombre = GetNullableString(reader, "ColorNombre"),
                Dimension = GetNullableDecimal(reader, "Dimension"), UnidadMedidaId = reader.GetInt32(reader.GetOrdinal("UnidadMedidaId")), UnidadMedidaNombre = reader.GetString(reader.GetOrdinal("UnidadMedidaNombre")),
                UnidadMedidaAbreviatura = reader.GetString(reader.GetOrdinal("UnidadMedidaAbreviatura")), CantidadPorUnidad = reader.GetDecimal(reader.GetOrdinal("CantidadPorUnidad")), CantidadSugerida = reader.GetDecimal(reader.GetOrdinal("CantidadSugerida")), Observaciones = GetNullableString(reader, "Observaciones")
            });
            await reader.NextResultAsync();
            while (await reader.ReadAsync()) result.RecortesRecuperados.Add(new RecorteRecuperadoOrdenDTO {
                RecorteId = reader.GetInt32(reader.GetOrdinal("RecorteId")), InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")),
                InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")), InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
                TipoRecorteId = GetNullableInt32(reader, "TipoRecorteId"), TipoRecorteNombre = GetNullableString(reader, "TipoRecorteNombre"),
                EstadoRecorteId = reader.GetInt32(reader.GetOrdinal("EstadoRecorteId")), EstadoRecorteNombre = reader.GetString(reader.GetOrdinal("EstadoRecorteNombre")),
                ColorId = GetNullableInt32(reader, "ColorId"), ColorNombre = GetNullableString(reader, "ColorNombre"), Dimension = GetNullableDecimal(reader, "Dimension"),
                LargoMm = GetNullableDecimal(reader, "LargoMm"), AnchoMm = GetNullableDecimal(reader, "AnchoMm"),
                EspesorMm = GetNullableDecimal(reader, "EspesorMm"), OrientacionVeta = GetNullableString(reader, "OrientacionVeta"),
                UnidadMedidaId = reader.GetInt32(reader.GetOrdinal("UnidadMedidaId")), UnidadMedidaNombre = reader.GetString(reader.GetOrdinal("UnidadMedidaNombre")),
                UnidadMedidaAbreviatura = reader.GetString(reader.GetOrdinal("UnidadMedidaAbreviatura")), Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
                FechaAlta = reader.GetDateTime(reader.GetOrdinal("FechaAlta")), Observaciones = GetNullableString(reader, "Observaciones")
            });
            return result;
        }
        catch (SqlException ex) when (ex.Number == 59501) { return null; }
    }

    public async Task<IEnumerable<HistorialEstadoOrdenProduccionDTO>> GetHistorialOrdenAsync(int ordenId)
    {
        // SQL Server no permite componer SELECT sobre EXEC de un procedimiento almacenado.
        // Materializamos el resultado primero y proyectamos el DTO en memoria.
        var rows = await _db.Database.SqlQueryRaw<HistorialEstadoOrdenProduccion>(
            "EXEC dbo.sp_TEKA_OP_Historial_Get @OrdenProduccionId",
            new SqlParameter("@OrdenProduccionId", ordenId)).ToListAsync();

        return rows.Select(x => new HistorialEstadoOrdenProduccionDTO {
            HistorialEstadoOrdenProduccionId = x.HistorialEstadoOrdenProduccionId,
            OrdenProduccionId = x.OrdenProduccionId,
            EstadoOrdenProduccionId = x.EstadoOrdenProduccionId,
            EstadoOrdenProduccionNombre = x.EstadoOrdenProduccionNombre,
            FechaCambio = x.FechaCambio,
            Observaciones = x.Observaciones
        }).ToList();
    }

    public async Task<IEnumerable<PlantillaOrdenDTO>> GetPlantillasAsync()
    {
        var rows = await _db.Database.SqlQueryRaw<PlantillaOrdenSummaryRow>("EXEC dbo.sp_TEKA_PlantillaOP_GetAll").ToListAsync();
        return rows.Select(x => new PlantillaOrdenDTO {
            PlantillaOrdenProduccionId = x.PlantillaOrdenProduccionId, Nombre = x.Nombre, Observaciones = x.Observaciones,
            Activa = x.Activa, FechaAlta = x.FechaAlta, CantidadModelos = x.CantidadModelos, CantidadTotal = x.CantidadTotal
        }).ToList();
    }

    public async Task<PlantillaOrdenDTO?> GetPlantillaAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = StoredProcedure(connection, "dbo.sp_TEKA_PlantillaOP_GetById", new SqlParameter("@Id", id));
        if (connection.State != ConnectionState.Open) await connection.OpenAsync();
        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;
        var result = new PlantillaOrdenDTO { PlantillaOrdenProduccionId = reader.GetInt32(0), Nombre = reader.GetString(1), Observaciones = reader.IsDBNull(2) ? null : reader.GetString(2), Activa = reader.GetBoolean(3), FechaAlta = reader.GetDateTime(4) };
        await reader.NextResultAsync();
        while (await reader.ReadAsync()) result.Detalles.Add(new PlantillaOrdenDetalleDTO { PlantillaOrdenProduccionDetalleId = reader.GetInt32(0), ProductoId = reader.GetInt32(1), ProductoCodigo = reader.GetString(2), ProductoNombre = reader.GetString(3), Cantidad = reader.GetDecimal(4) });
        result.CantidadModelos = result.Detalles.Count; result.CantidadTotal = result.Detalles.Sum(x => x.Cantidad); return result;
    }

    public async Task<int> GuardarPlantillaAsync(PlantillaOrdenGuardarRequest request)
    {
        if (request.Detalles.Count == 0 || request.Detalles.Any(x => x.ProductoId <= 0 || x.Cantidad <= 0) || request.Detalles.Select(x => x.ProductoId).Distinct().Count() != request.Detalles.Count)
            throw new InvalidOperationException("La plantilla requiere modelos únicos y cantidades positivas.");
        try
        {
            var result = await _db.Database.SqlQueryRaw<int>("EXEC dbo.sp_TEKA_PlantillaOP_Guardar @Id,@Nombre,@Observaciones,@DetalleJson",
                new SqlParameter("@Id", (object?)request.PlantillaOrdenProduccionId ?? DBNull.Value), new SqlParameter("@Nombre", request.Nombre.Trim()),
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value), JsonParameter("@DetalleJson", request.Detalles)).ToListAsync();
            return result.Single();
        }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    public Task InactivarPlantillaAsync(int id) => ExecuteBusinessProcedureAsync("EXEC dbo.sp_TEKA_PlantillaOP_Inactivar @Id", new SqlParameter("@Id", id));
    public Task<IEnumerable<ReporteConsumoProduccionDTO>> GetReporteConsumosAsync(DateTime desde, DateTime hasta) => ReportAsync<ReporteConsumoProduccionDTO>("dbo.sp_TEKA_Produccion_ReporteConsumos", desde, hasta);
    public Task<IEnumerable<ReporteModeloProduccionDTO>> GetReporteModelosAsync(DateTime desde, DateTime hasta) => ReportAsync<ReporteModeloProduccionDTO>("dbo.sp_TEKA_Produccion_ReporteModelos", desde, hasta);
    public Task<IEnumerable<ReporteRecorteProduccionDTO>> GetReporteRecortesConsumidosAsync(DateTime desde, DateTime hasta) => ReportAsync<ReporteRecorteProduccionDTO>("dbo.sp_TEKA_Produccion_ReporteRecortesConsumidos", desde, hasta);
    public Task<IEnumerable<ReporteRecorteProduccionDTO>> GetReporteRecortesRecuperadosAsync(DateTime desde, DateTime hasta) => ReportAsync<ReporteRecorteProduccionDTO>("dbo.sp_TEKA_Produccion_ReporteRecortesRecuperados", desde, hasta);

    private async Task<IEnumerable<T>> ReportAsync<T>(string procedure, DateTime desde, DateTime hasta) where T : class
    {
        if (desde.Date > hasta.Date) throw new InvalidOperationException("La fecha Desde no puede ser posterior a Hasta.");
        var sql = procedure switch {
            "dbo.sp_TEKA_Produccion_ReporteConsumos" => "EXEC dbo.sp_TEKA_Produccion_ReporteConsumos @Desde,@Hasta",
            "dbo.sp_TEKA_Produccion_ReporteModelos" => "EXEC dbo.sp_TEKA_Produccion_ReporteModelos @Desde,@Hasta",
            "dbo.sp_TEKA_Produccion_ReporteRecortesConsumidos" => "EXEC dbo.sp_TEKA_Produccion_ReporteRecortesConsumidos @Desde,@Hasta",
            "dbo.sp_TEKA_Produccion_ReporteRecortesRecuperados" => "EXEC dbo.sp_TEKA_Produccion_ReporteRecortesRecuperados @Desde,@Hasta",
            _ => throw new InvalidOperationException("Reporte de producción no permitido.")
        };
        return await _db.Database.SqlQueryRaw<T>(sql, new SqlParameter("@Desde", desde.Date), new SqlParameter("@Hasta", hasta.Date)).ToListAsync();
    }

    private async Task ExecuteBusinessProcedureAsync(string sql, params object[] parameters)
    {
        try { await _db.Database.ExecuteSqlRawAsync(sql, parameters); }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    private static SqlParameter JsonParameter(string name, object value) => new(name, SqlDbType.NVarChar, -1) { Value = JsonSerializer.Serialize(value) };
    private static DbCommand StoredProcedure(DbConnection connection, string name, params DbParameter[] parameters) { var command = connection.CreateCommand(); command.CommandText = name; command.CommandType = CommandType.StoredProcedure; foreach (var parameter in parameters) command.Parameters.Add(parameter); return command; }
    private static decimal? GetNullableDecimal(IDataRecord reader, string name) { var ordinal = reader.GetOrdinal(name); return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal); }
    private static InicioOrdenMaterialDTO MapInicioMaterial(IDataRecord reader) => new() {
        InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")), InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")), InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
        Unidad = reader.GetString(reader.GetOrdinal("Unidad")), CantidadRequerida = reader.GetDecimal(reader.GetOrdinal("CantidadRequerida")), DepositoId = reader.GetInt32(reader.GetOrdinal("DepositoId")),
        DepositoNombre = reader.GetString(reader.GetOrdinal("DepositoNombre")), CantidadDisponible = reader.GetDecimal(reader.GetOrdinal("CantidadDisponible")), Faltante = reader.GetDecimal(reader.GetOrdinal("Faltante"))
    };

    private sealed class PlantillaOrdenSummaryRow
    {
        public int PlantillaOrdenProduccionId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public bool Activa { get; set; }
        public DateTime FechaAlta { get; set; }
        public int CantidadModelos { get; set; }
        public decimal CantidadTotal { get; set; }
    }
}
