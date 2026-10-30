using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class OportunidadService : IOportunidadService
{
    private readonly TekaDbContext _db;

    public OportunidadService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<OportunidadComercialDTO>> GetAllAsync()
    {
        var oportunidades = await _db.Database
            .SqlQueryRaw<OportunidadComercial>("EXEC dbo.sp_OportunidadComercial_GetAll")
            .ToListAsync();
        var result = oportunidades.Select(MapToDTO).ToList();
        var probabilities = await CalculateProbabilitiesAsync();
        foreach (var opportunity in result)
            if (probabilities.TryGetValue(opportunity.OportunidadComercialId, out var value))
                opportunity.Probabilidad = value;
        return result;
    }

    public async Task<OportunidadComercialConDetalleDTO?> GetByIdAsync(int id)
    {
        var probabilities = await CalculateProbabilitiesAsync(id);
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_OportunidadComercial_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@OportunidadComercialId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var oportunidad = new OportunidadComercialConDetalleDTO
        {
            OportunidadComercialId = reader.GetInt32(reader.GetOrdinal("OportunidadComercialId")),
            ClienteId = GetNullableInt(reader, "ClienteId"),
            ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
            ClienteApellido = GetNullableString(reader, "ClienteApellido"),
            TipoCliente = reader.GetString(reader.GetOrdinal("TipoCliente")),
            CanalVentaId = reader.GetInt32(reader.GetOrdinal("CanalVentaId")),
            CanalVentaNombre = reader.GetString(reader.GetOrdinal("CanalVentaNombre")),
            Interes = reader.GetString(reader.GetOrdinal("Interes")),
            EstadoOportunidadComercialId = reader.GetInt32(reader.GetOrdinal("EstadoOportunidadComercialId")),
            EstadoOportunidadNombre = reader.GetString(reader.GetOrdinal("EstadoOportunidadNombre")),
            MontoEstimado = reader.GetDecimal(reader.GetOrdinal("MontoEstimado")),
            Probabilidad = probabilities.GetValueOrDefault(id, reader.GetInt32(reader.GetOrdinal("Probabilidad"))),
            FechaAlta = reader.GetDateTime(reader.GetOrdinal("FechaAlta")),
            ProximaAccion = GetNullableString(reader, "ProximaAccion"),
            FechaProximaAccion = GetNullableDateTime(reader, "FechaProximaAccion"),
            Observaciones = GetNullableString(reader, "Observaciones"),
            MotivoPerdidaOportunidadId = GetNullableInt(reader, "MotivoPerdidaOportunidadId"),
            MotivoPerdidaNombre = GetNullableString(reader, "MotivoPerdidaNombre"),
            ObservacionPerdida = GetNullableString(reader, "ObservacionPerdida"),
            FechaPerdida = GetNullableDateTime(reader, "FechaPerdida"),
            PedidoIdConvertido = GetNullableInt(reader, "PedidoIdConvertido"),
            FechaConversion = GetNullableDateTime(reader, "FechaConversion"),
            Activo = reader.GetBoolean(reader.GetOrdinal("Activo")),
            UsuarioResponsableId = GetNullableInt(reader, "UsuarioResponsableId"),
            ResponsableNombre = GetNullableString(reader, "ResponsableNombre"),
            InteresComercialId = GetNullableInt(reader, "InteresComercialId")
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            oportunidad.HistorialEstados.Add(new HistorialEstadoOportunidadDTO
            {
                HistorialEstadoOportunidadId = reader.GetInt32(reader.GetOrdinal("HistorialEstadoOportunidadId")),
                OportunidadComercialId = reader.GetInt32(reader.GetOrdinal("OportunidadComercialId")),
                EstadoOportunidadComercialId = reader.GetInt32(reader.GetOrdinal("EstadoOportunidadComercialId")),
                EstadoOportunidadNombre = reader.GetString(reader.GetOrdinal("EstadoOportunidadNombre")),
                FechaCambio = reader.GetDateTime(reader.GetOrdinal("FechaCambio")),
                Observaciones = GetNullableString(reader, "Observaciones")
            });
        }

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
        {
            oportunidad.Visitas.Add(new VisitaOportunidadDTO
            {
                VisitaOportunidadId = reader.GetInt32(reader.GetOrdinal("VisitaOportunidadId")),
                OportunidadComercialId = reader.GetInt32(reader.GetOrdinal("OportunidadComercialId")),
                FechaVisita = reader.GetDateTime(reader.GetOrdinal("FechaVisita")),
                TipoVisita = reader.GetString(reader.GetOrdinal("TipoVisita")),
                ResultadoEsperado = GetNullableString(reader, "ResultadoEsperado"),
                Observaciones = GetNullableString(reader, "Observaciones"),
                Activo = reader.GetBoolean(reader.GetOrdinal("Activo"))
            });
        }

        await reader.NextResultAsync();
        while (await reader.ReadAsync())
        {
            oportunidad.Productos.Add(new OportunidadProductoDTO
            {
                OportunidadProductoId = reader.GetInt32(reader.GetOrdinal("OportunidadProductoId")),
                ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
                ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
                Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
                PrecioReferencia = reader.IsDBNull(reader.GetOrdinal("PrecioReferencia")) ? null : reader.GetDecimal(reader.GetOrdinal("PrecioReferencia"))
            });
        }
        return oportunidad;
    }

    public async Task<int> InsertAsync(OportunidadComercialInsertRequest request)
    {
        ValidateTipoCliente(request.TipoCliente);

        var result = await _db.Database
            .SqlQueryRaw<int>(
                "EXEC dbo.sp_OportunidadComercial_Insert @ClienteId, @ClienteNombre, @ClienteApellido, @TipoCliente, @CanalVentaId, @Interes, @EstadoOportunidadComercialId, @MontoEstimado, @Probabilidad, @ProximaAccion, @FechaProximaAccion, @Observaciones",
                new SqlParameter("@ClienteId", (object?)request.ClienteId ?? DBNull.Value),
                new SqlParameter("@ClienteNombre", request.ClienteNombre),
                new SqlParameter("@ClienteApellido", (object?)request.ClienteApellido ?? DBNull.Value),
                new SqlParameter("@TipoCliente", request.TipoCliente),
                new SqlParameter("@CanalVentaId", request.CanalVentaId),
                new SqlParameter("@Interes", request.Interes),
                new SqlParameter("@EstadoOportunidadComercialId", (object?)request.EstadoOportunidadComercialId ?? DBNull.Value),
                new SqlParameter("@MontoEstimado", request.MontoEstimado),
                new SqlParameter("@Probabilidad", 10),
                new SqlParameter("@ProximaAccion", (object?)request.ProximaAccion ?? DBNull.Value),
                new SqlParameter("@FechaProximaAccion", (object?)request.FechaProximaAccion?.Date ?? DBNull.Value),
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value))
            .ToListAsync();

        return result.FirstOrDefault();
    }

    public async Task UpdateAsync(int id, OportunidadComercialUpdateRequest request)
    {
        ValidateTipoCliente(request.TipoCliente);
        var probabilities = await CalculateProbabilitiesAsync(id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_OportunidadComercial_Update @OportunidadComercialId, @ClienteId, @ClienteNombre, @ClienteApellido, @TipoCliente, @CanalVentaId, @Interes, @EstadoOportunidadComercialId, @MontoEstimado, @Probabilidad, @ProximaAccion, @FechaProximaAccion, @Observaciones",
            new SqlParameter("@OportunidadComercialId", id),
            new SqlParameter("@ClienteId", (object?)request.ClienteId ?? DBNull.Value),
            new SqlParameter("@ClienteNombre", request.ClienteNombre),
            new SqlParameter("@ClienteApellido", (object?)request.ClienteApellido ?? DBNull.Value),
            new SqlParameter("@TipoCliente", request.TipoCliente),
            new SqlParameter("@CanalVentaId", request.CanalVentaId),
            new SqlParameter("@Interes", request.Interes),
            new SqlParameter("@EstadoOportunidadComercialId", request.EstadoOportunidadComercialId),
            new SqlParameter("@MontoEstimado", request.MontoEstimado),
            new SqlParameter("@Probabilidad", probabilities.GetValueOrDefault(id, 10)),
            new SqlParameter("@ProximaAccion", (object?)request.ProximaAccion ?? DBNull.Value),
            new SqlParameter("@FechaProximaAccion", (object?)request.FechaProximaAccion?.Date ?? DBNull.Value),
            new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value));
    }

    public async Task RegistrarVisitaAsync(int id, VisitaOportunidadInsertRequest request)
    {
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_OportunidadComercial_RegistrarVisita @OportunidadComercialId, @FechaVisita, @TipoVisita, @ResultadoEsperado, @Observaciones",
            new SqlParameter("@OportunidadComercialId", id),
            new SqlParameter("@FechaVisita", request.FechaVisita),
            new SqlParameter("@TipoVisita", request.TipoVisita),
            new SqlParameter("@ResultadoEsperado", (object?)request.ResultadoEsperado ?? DBNull.Value),
            new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value));
    }

    public async Task MarcarPerdidaAsync(int id, OportunidadMarcarPerdidaRequest request)
    {
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_OportunidadComercial_MarcarPerdida @OportunidadComercialId, @MotivoPerdidaOportunidadId, @ObservacionPerdida",
            new SqlParameter("@OportunidadComercialId", id),
            new SqlParameter("@MotivoPerdidaOportunidadId", request.MotivoPerdidaOportunidadId),
            new SqlParameter("@ObservacionPerdida", (object?)request.ObservacionPerdida ?? DBNull.Value));
    }

    public async Task CancelarAsync(int id, OportunidadCancelarRequest request)
    {
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_OportunidadComercial_Cancelar @OportunidadComercialId, @Observaciones",
            new SqlParameter("@OportunidadComercialId", id),
            new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value));
    }

    public async Task<ConversionOportunidadPedidoDTO> ConvertirEnPedidoAsync(int id, OportunidadConvertirEnPedidoRequest request)
    {
        var result = await _db.Database
            .SqlQueryRaw<ConversionOportunidadPedido>(
                "EXEC dbo.sp_OportunidadComercial_ConvertirEnPedido @OportunidadComercialId, @Observaciones",
                new SqlParameter("@OportunidadComercialId", id),
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value))
            .ToListAsync();

        var conversion = result.FirstOrDefault()
            ?? throw new InvalidOperationException("No se pudo convertir la oportunidad en pedido.");

        return new ConversionOportunidadPedidoDTO
        {
            PedidoId = conversion.PedidoId,
            ClienteId = conversion.ClienteId
        };
    }

    public async Task<IEnumerable<LookupDTO>> GetEstadosLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoOportunidadComercial_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetMotivosPerdidaLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_MotivoPerdidaOportunidad_GetLookup")
            .ToListAsync();
    }

    public async Task<OportunidadResumenDTO?> GetResumenAsync()
    {
        var result = await _db.Database
            .SqlQueryRaw<OportunidadResumen>("EXEC dbo.sp_OportunidadComercial_Resumen")
            .ToListAsync();

        var resumen = result.FirstOrDefault();
        return resumen is null ? null : new OportunidadResumenDTO
        {
            TotalOportunidades = resumen.TotalOportunidades,
            OportunidadesAbiertas = resumen.OportunidadesAbiertas,
            OportunidadesConvertidas = resumen.OportunidadesConvertidas,
            OportunidadesNoConcretadas = resumen.OportunidadesNoConcretadas,
            MontoEstimadoTotal = resumen.MontoEstimadoTotal,
            MontoAbierto = resumen.MontoAbierto,
            MontoConvertido = resumen.MontoConvertido,
            TasaConversion = resumen.TasaConversion
        };
    }

    public async Task<IEnumerable<OportunidadFunnelDTO>> GetFunnelAsync()
    {
        var result = await _db.Database
            .SqlQueryRaw<OportunidadFunnel>("EXEC dbo.sp_OportunidadComercial_Funnel")
            .ToListAsync();

        return result.Select(x => new OportunidadFunnelDTO
        {
            EstadoOportunidadComercialId = x.EstadoOportunidadComercialId,
            Estado = x.Estado,
            Orden = x.Orden,
            Cantidad = x.Cantidad,
            MontoEstimado = x.MontoEstimado
        });
    }

    public async Task<IEnumerable<MotivoPerdidaResumenDTO>> GetMotivosPerdidaResumenAsync()
    {
        var result = await _db.Database
            .SqlQueryRaw<MotivoPerdidaResumen>("EXEC dbo.sp_OportunidadComercial_MotivosPerdidaResumen")
            .ToListAsync();

        return result.Select(x => new MotivoPerdidaResumenDTO
        {
            MotivoPerdidaOportunidadId = x.MotivoPerdidaOportunidadId,
            Motivo = x.Motivo,
            Cantidad = x.Cantidad,
            MontoEstimado = x.MontoEstimado
        });
    }

    public async Task<PanelComercialResumenDTO?> GetPanelComercialResumenMensualAsync()
    {
        var result = await _db.Database
            .SqlQueryRaw<PanelComercialResumen>("EXEC dbo.sp_PanelComercial_ResumenMensual")
            .ToListAsync();

        var panel = result.FirstOrDefault();
        return panel is null ? null : new PanelComercialResumenDTO
        {
            PedidosMes = panel.PedidosMes,
            VariacionPedidosPorcentaje = panel.VariacionPedidosPorcentaje,
            TotalVendido = panel.TotalVendido,
            VariacionTotalVendidoPorcentaje = panel.VariacionTotalVendidoPorcentaje,
            OportunidadesAbiertas = panel.OportunidadesAbiertas,
            VariacionOportunidadesAbiertasPorcentaje = panel.VariacionOportunidadesAbiertasPorcentaje,
            NoConcretadas = panel.NoConcretadas,
            VariacionNoConcretadasPorcentaje = panel.VariacionNoConcretadasPorcentaje
        };
    }

    public async Task GuardarProductoAsync(int id, OportunidadProductoRequest request)
    {
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_OportunidadProducto_Guardar @p0, @p1, @p2", id, request.ProductoId, request.Cantidad);
    }

    public async Task EliminarProductoAsync(int id, int productoId)
    {
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_OportunidadProducto_Eliminar @p0, @p1", id, productoId);
    }

    public async Task AsignarResponsableAsync(int id, int usuarioResponsableId)
    {
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_OportunidadComercial_AsignarResponsable @p0, @p1", id, usuarioResponsableId);
    }

    private static void ValidateTipoCliente(string tipoCliente)
    {
        if (!string.Equals(tipoCliente, "particular", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(tipoCliente, "empresa", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("El tipo de cliente debe ser particular o empresa.");
        }
    }

    private async Task<Dictionary<int, int>> CalculateProbabilitiesAsync(int? opportunityId = null)
    {
        var result = new Dictionary<int, int>();
        var connection = _db.Database.GetDbConnection();
        var closeConnection = connection.State != ConnectionState.Open;
        if (closeConnection) await connection.OpenAsync();
        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = """
                SELECT o.OportunidadComercialId,
                    CASE
                        WHEN eo.Nombre = 'Convertida' THEN 100
                        WHEN eo.Nombre IN ('Perdida', 'Cancelada') THEN 0
                        ELSE 10
                            + CASE WHEN EXISTS (SELECT 1 FROM dbo.OportunidadProducto op WHERE op.OportunidadComercialId = o.OportunidadComercialId) THEN 10 ELSE 0 END
                            + CASE WHEN EXISTS (SELECT 1 FROM dbo.ActividadComercial ac WHERE ac.OportunidadComercialId = o.OportunidadComercialId AND ac.Estado = 'Realizada') THEN 15 ELSE 0 END
                            + CASE WHEN EXISTS (SELECT 1 FROM dbo.PresupuestoComercial pc WHERE pc.OportunidadComercialId = o.OportunidadComercialId) THEN 15 ELSE 0 END
                            + CASE WHEN EXISTS (SELECT 1 FROM dbo.PresupuestoComercial pc WHERE pc.OportunidadComercialId = o.OportunidadComercialId AND pc.Estado = 'Aceptado') THEN 30 ELSE 0 END
                    END AS Probabilidad
                FROM dbo.OportunidadComercial o
                JOIN dbo.EstadoOportunidadComercial eo ON eo.EstadoOportunidadComercialId = o.EstadoOportunidadComercialId
                WHERE @OportunidadComercialId IS NULL OR o.OportunidadComercialId = @OportunidadComercialId;
                """;
            command.Parameters.Add(new SqlParameter("@OportunidadComercialId", SqlDbType.Int) { Value = (object?)opportunityId ?? DBNull.Value });
            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync()) result[reader.GetInt32(0)] = reader.GetInt32(1);
            return result;
        }
        finally { if (closeConnection) await connection.CloseAsync(); }
    }

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

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }

    private static OportunidadComercialDTO MapToDTO(OportunidadComercial o) => new()
    {
        OportunidadComercialId = o.OportunidadComercialId,
        ClienteId = o.ClienteId,
        ClienteNombre = o.ClienteNombre,
        ClienteApellido = o.ClienteApellido,
        TipoCliente = o.TipoCliente,
        CanalVentaId = o.CanalVentaId,
        CanalVentaNombre = o.CanalVentaNombre,
        Interes = o.Interes,
        EstadoOportunidadComercialId = o.EstadoOportunidadComercialId,
        EstadoOportunidadNombre = o.EstadoOportunidadNombre,
        MontoEstimado = o.MontoEstimado,
        Probabilidad = o.Probabilidad,
        FechaAlta = o.FechaAlta,
        ProximaAccion = o.ProximaAccion,
        FechaProximaAccion = o.FechaProximaAccion,
        Observaciones = o.Observaciones,
        MotivoPerdidaOportunidadId = o.MotivoPerdidaOportunidadId,
        MotivoPerdidaNombre = o.MotivoPerdidaNombre,
        ObservacionPerdida = o.ObservacionPerdida,
        FechaPerdida = o.FechaPerdida,
        PedidoIdConvertido = o.PedidoIdConvertido,
        FechaConversion = o.FechaConversion,
        Activo = o.Activo,
        UsuarioResponsableId = o.UsuarioResponsableId,
        ResponsableNombre = o.ResponsableNombre,
        InteresComercialId = o.InteresComercialId
    };
}
