using System.Data;
using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public partial class ProduccionService : IProduccionService
{
    private readonly TekaDbContext _db;

    public ProduccionService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ListaMaterialesDTO>> GetListasMaterialesAsync()
    {
        var listas = await _db.Database.SqlQueryRaw<ListaMateriales>("EXEC dbo.sp_ListaMateriales_GetAll").ToListAsync();
        return listas.Select(MapToDTO);
    }

    public async Task<ListaMaterialesConDetalleDTO?> GetListaMaterialesByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_ListaMateriales_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@ListaMaterialesId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        var lista = new ListaMaterialesConDetalleDTO
        {
            ListaMaterialesId = reader.GetInt32(reader.GetOrdinal("ListaMaterialesId")),
            ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
            ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
            ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
            Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
            Version = GetNullableString(reader, "Version"),
            Activa = reader.GetBoolean(reader.GetOrdinal("Activa")),
            FechaAlta = reader.GetDateTime(reader.GetOrdinal("FechaAlta"))
        };

        await reader.NextResultAsync();

        while (await reader.ReadAsync())
            lista.Detalles.Add(MapDetalle(reader));

        return lista;
    }

    public async Task<IEnumerable<ListaMaterialesDTO>> GetListasMaterialesByProductoAsync(int productoId)
    {
        var pProducto = new SqlParameter("@ProductoId", productoId);
        var listas = await _db.Database
            .SqlQueryRaw<ListaMateriales>("EXEC dbo.sp_ListaMateriales_GetByProducto @ProductoId", pProducto)
            .ToListAsync();

        return listas.Select(MapToDTO);
    }

    public async Task<int> InsertListaMaterialesAsync(ListaMaterialesRequest request)
    {
        ValidateLista(request);

        var pProducto = new SqlParameter("@ProductoId", request.ProductoId);
        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pVersion = new SqlParameter("@Version", (object?)request.Version ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<decimal>("EXEC dbo.sp_ListaMateriales_Insert @ProductoId, @Nombre, @Version", pProducto, pNombre, pVersion)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateListaMaterialesAsync(int id, ListaMaterialesRequest request)
    {
        ValidateLista(request);

        var pId = new SqlParameter("@ListaMaterialesId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre);
        var pVersion = new SqlParameter("@Version", (object?)request.Version ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_ListaMateriales_Update @ListaMaterialesId, @Nombre, @Version",
            pId, pNombre, pVersion);
    }

    public async Task DeleteListaMaterialesAsync(int id)
    {
        var pId = new SqlParameter("@ListaMaterialesId", id);
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_ListaMateriales_Delete @ListaMaterialesId", pId);
    }

    public async Task<IEnumerable<DetalleListaMaterialesDTO>> GetDetallesListaMaterialesAsync(int listaMaterialesId)
    {
        var pLista = new SqlParameter("@ListaMaterialesId", listaMaterialesId);
        var detalles = await _db.Database
            .SqlQueryRaw<DetalleListaMateriales>("EXEC dbo.sp_DetalleListaMateriales_GetByListaMateriales @ListaMaterialesId", pLista)
            .ToListAsync();

        return detalles.Select(MapToDTO);
    }

    public async Task<DetalleListaMaterialesDTO?> GetDetalleListaMaterialesByIdAsync(int id)
    {
        var pId = new SqlParameter("@DetalleListaMaterialesId", id);
        var detalles = await _db.Database
            .SqlQueryRaw<DetalleListaMateriales>("EXEC dbo.sp_DetalleListaMateriales_GetById @DetalleListaMaterialesId", pId)
            .ToListAsync();

        var detalle = detalles.FirstOrDefault();
        return detalle is null ? null : MapToDTO(detalle);
    }

    public async Task<int> InsertDetalleListaMaterialesAsync(int listaMaterialesId, DetalleListaMaterialesRequest request)
    {
        ValidateDetalleLista(request);

        var pLista = new SqlParameter("@ListaMaterialesId", listaMaterialesId);
        var pInsumo = new SqlParameter("@InsumoId", request.InsumoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_DetalleListaMateriales_Insert @ListaMaterialesId, @InsumoId, @Cantidad, @Observaciones",
                pLista, pInsumo, pCantidad, pObservaciones)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateDetalleListaMaterialesAsync(int id, DetalleListaMaterialesRequest request)
    {
        ValidateDetalleLista(request);

        var pId = new SqlParameter("@DetalleListaMaterialesId", id);
        var pInsumo = new SqlParameter("@InsumoId", request.InsumoId);
        var pCantidad = new SqlParameter("@Cantidad", request.Cantidad);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_DetalleListaMateriales_Update @DetalleListaMaterialesId, @InsumoId, @Cantidad, @Observaciones",
            pId, pInsumo, pCantidad, pObservaciones);
    }

    public async Task DeleteDetalleListaMaterialesAsync(int id)
    {
        var pId = new SqlParameter("@DetalleListaMaterialesId", id);
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_DetalleListaMateriales_Delete @DetalleListaMaterialesId", pId);
    }

    public async Task<IEnumerable<OrdenProduccionDTO>> GetOrdenesAsync()
    {
        var ordenes = await _db.Database.SqlQueryRaw<OrdenProduccion>("EXEC dbo.sp_OrdenProduccion_GetAll").ToListAsync();
        return ordenes.Select(MapToDTO);
    }

    public async Task<OrdenProduccionConDetalleDTO?> GetOrdenByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "dbo.sp_OrdenProduccion_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@OrdenProduccionId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        DbDataReader reader;
        try
        {
            reader = await command.ExecuteReaderAsync();
        }
        catch (SqlException ex) when (ex.Number == 59501)
        {
            return null;
        }

        await using (reader)
        {
            if (!await reader.ReadAsync())
                return null;

            var orden = MapOrdenConDetalle(reader);

            await reader.NextResultAsync();
            while (await reader.ReadAsync())
                orden.Productos.Add(MapOrdenProducto(reader));

            await reader.NextResultAsync();
            while (await reader.ReadAsync())
                orden.RecortesPlanificados.Add(new OrdenProduccionRecortePlanDTO
                {
                    RecorteId = reader.GetInt32(reader.GetOrdinal("RecorteId")),
                    CantidadPlanificada = reader.GetDecimal(reader.GetOrdinal("CantidadPlanificada"))
                });

            return orden;
        }
    }

    public async Task<int> InsertOrdenAsync(OrdenProduccionInsertRequest request)
    {
        var items = request.Productos is { Count: > 0 }
            ? request.Productos
            : new List<OrdenProduccionProductoRequest> {
                new() { ProductoId = request.ProductoId, ListaMaterialesId = request.ListaMaterialesId, CantidadPlanificada = request.CantidadPlanificada }
            };
        if (items.Count == 0 || items.Any(x => x.ProductoId <= 0 || x.CantidadPlanificada <= 0)
            || items.Select(x => x.ProductoId).Distinct().Count() != items.Count)
            throw new InvalidOperationException("La OP requiere productos únicos y cantidades planificadas positivas.");
        if (request.Recortes is { Count: > 0 } && (request.Recortes.Any(x => x.RecorteId <= 0 || x.Cantidad <= 0)
            || request.Recortes.Select(x => x.RecorteId).Distinct().Count() != request.Recortes.Count))
            throw new InvalidOperationException("El plan de recortes requiere recortes únicos y cantidades positivas.");
        foreach (var item in items.Where(x => !x.ListaMaterialesId.HasValue))
        {
            var templateCount = await _db.Database.SqlQueryRaw<int>("""
                SELECT COUNT(*) AS [Value] FROM dbo.PlantillaFabricacion WHERE ProductoId=@id
                """, new SqlParameter("@id", item.ProductoId)).SingleAsync();
            if (templateCount != 0)
                throw new InvalidOperationException("Seleccioná una BOM activa explícita para el producto con plantilla de fabricación.");
        }
        foreach (var item in items.Where(x => x.ListaMaterialesId.HasValue))
        {
            var lista = await GetListaMaterialesByIdAsync(item.ListaMaterialesId!.Value);
            if (lista is null || !lista.Activa || lista.ProductoId != item.ProductoId || lista.Detalles.Count == 0)
                throw new InvalidOperationException("La BOM indicada no está activa o no corresponde al producto.");
            var draftLinks = await _db.Database.SqlQueryRaw<int>("""
                SELECT COUNT(*) AS [Value] FROM dbo.PlantillaFabricacion
                WHERE ListaMaterialesId=@id AND (Estado<>N'Aprobada' OR Estado IS NULL)
                """, new SqlParameter("@id", item.ListaMaterialesId.Value)).SingleAsync();
            if (draftLinks != 0)
                throw new InvalidOperationException("La BOM está vinculada a una plantilla de fabricación no aprobada.");
        }
        var detalleJson = System.Text.Json.JsonSerializer.Serialize(items.Select(x => new {
            x.ProductoId, x.ListaMaterialesId, x.CantidadPlanificada
        }));
        var recortesJson = System.Text.Json.JsonSerializer.Serialize(request.Recortes ?? new());
        try
        {
            int? approvedTemplateId = null;
            if (items.Count == 1 && items[0].ListaMaterialesId.HasValue)
            {
                var linked = await _db.Database.SqlQueryRaw<int>("""
                    SELECT PlantillaFabricacionId AS [Value] FROM dbo.PlantillaFabricacion
                    WHERE ListaMaterialesId=@id AND ProductoId=@producto AND Estado=N'Aprobada'
                    """, new SqlParameter("@id", items[0].ListaMaterialesId!.Value),
                    new SqlParameter("@producto", items[0].ProductoId)).ToListAsync();
                if (linked.Count > 1)
                    throw new InvalidOperationException("La BOM tiene más de una plantilla aprobada; no se puede fijar una versión única.");
                approvedTemplateId = linked.SingleOrDefault();
                if (approvedTemplateId == 0) approvedTemplateId = null;
            }
            await using var tx = approvedTemplateId.HasValue
                ? await _db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted)
                : null;
            var resultado = await _db.Database.SqlQueryRaw<int>(
                "EXEC dbo.sp_TEKA_OP_CrearMultiproducto @TipoProduccionId, @DetalleJson, @Observaciones, @RecortesJson",
                new SqlParameter("@TipoProduccionId", request.TipoProduccionId),
                new SqlParameter("@DetalleJson", SqlDbType.NVarChar, -1) { Value = detalleJson },
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value),
                new SqlParameter("@RecortesJson", SqlDbType.NVarChar, -1) { Value = recortesJson }
            ).ToListAsync();
            var orderId = resultado.Single();
            if (approvedTemplateId.HasValue)
            {
                var updated = await _db.Database.ExecuteSqlRawAsync("""
                    UPDATE dbo.OrdenProduccion SET PlantillaFabricacionId=@plantilla
                    WHERE OrdenProduccionId=@orden AND PlantillaFabricacionId IS NULL
                    """, new SqlParameter("@plantilla", approvedTemplateId.Value),
                    new SqlParameter("@orden", orderId));
                if (updated != 1)
                    throw new InvalidOperationException("No se pudo fijar la versión de fabricación en la OP.");
            }
            if (tx is not null) await tx.CommitAsync();
            return orderId;
        }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    public async Task IniciarOrdenAsync(int id, OrdenProduccionEstadoRequest request)
    {
        ValidarObservacionesEstado(request);
        var orden = await ValidateOrdenOperableAsync(id);
        if (orden.EstadoOrdenProduccionNombre != "Pendiente")
            throw new InvalidOperationException("Solo se puede iniciar una orden pendiente.");
        if (request.Recortes is { Count: > 0 } && (request.Recortes.Any(x => x.RecorteId <= 0 || x.Cantidad <= 0)
            || request.Recortes.Select(x => x.RecorteId).Distinct().Count() != request.Recortes.Count))
            throw new InvalidOperationException("Los recortes de inicio son inválidos o están repetidos.");
        try
        {
            await _db.Database.ExecuteSqlRawAsync(
                "EXEC dbo.sp_TEKA_OP_IniciarIntegral @OrdenProduccionId, @RecortesJson, @Observaciones",
                new SqlParameter("@OrdenProduccionId", id),
                new SqlParameter("@RecortesJson", SqlDbType.NVarChar, -1) { Value = System.Text.Json.JsonSerializer.Serialize(request.Recortes ?? new()) },
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value));
        }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    public async Task FinalizarOrdenAsync(int id, OrdenProduccionEstadoRequest request)
    {
        ValidarObservacionesEstado(request);
        var orden = await ValidateOrdenOperableAsync(id);
        if (orden.EstadoOrdenProduccionNombre != "En Proceso")
            throw new InvalidOperationException("Solo se puede finalizar una OP en proceso.");
        if (request.Resultados is not { Count: > 0 } || request.Resultados.All(x => x.Cantidad <= 0)
            || request.Resultados.Any(x => x.ProductoId <= 0 || x.Cantidad < 0)
            || request.Resultados.Select(x => x.ProductoId).Distinct().Count() != request.Resultados.Count)
            throw new InvalidOperationException("Indicá cantidades reales válidas por cada producto de la OP.");
        if (request.Resultados.Count != orden.Productos.Count || request.Resultados.Any(result =>
            orden.Productos.All(item => item.ProductoId != result.ProductoId) ||
            result.Cantidad > orden.Productos.Single(item => item.ProductoId == result.ProductoId).CantidadPlanificada))
            throw new InvalidOperationException("La cantidad fabricada no puede superar la planificada y deben informarse todos los modelos de la orden.");
        if (request.RecortesConfirmados is { Count: > 0 } && request.RecortesConfirmados.Any(x =>
            x.InsumoId <= 0 || x.EstadoRecorteId <= 0 || x.UnidadMedidaId <= 0 || x.Cantidad <= 0 || x.Dimension is <= 0))
            throw new InvalidOperationException("Los recortes recuperados contienen valores inválidos.");
        foreach (var recorte in request.RecortesConfirmados ?? new())
            RecorteGeometria.ValidarEntrada(recorte.LargoMm, recorte.AnchoMm, recorte.EspesorMm, recorte.OrientacionVeta);
        try
        {
            await _db.Database.ExecuteSqlRawAsync(
                "EXEC dbo.sp_TEKA_OP_FinalizarIntegral @OrdenProduccionId, @ResultadosJson, @RecortesJson, @Observaciones",
                new SqlParameter("@OrdenProduccionId", id),
                new SqlParameter("@ResultadosJson", SqlDbType.NVarChar, -1) { Value = System.Text.Json.JsonSerializer.Serialize(request.Resultados) },
                new SqlParameter("@RecortesJson", SqlDbType.NVarChar, -1) { Value = System.Text.Json.JsonSerializer.Serialize(request.RecortesConfirmados ?? new()) },
                new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value));
        }
        catch (SqlException ex) { throw new InvalidOperationException(ex.Message, ex); }
    }

    public async Task CancelarOrdenAsync(int id, OrdenProduccionEstadoRequest request)
    {
        ValidarObservacionesEstado(request);
        await ValidateOrdenOperableAsync(id);

        var pOrden = new SqlParameter("@OrdenProduccionId", id);
        var pObservaciones = new SqlParameter("@Observaciones", (object?)request.Observaciones ?? DBNull.Value);

        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_OrdenProduccion_Cancelar @OrdenProduccionId, @Observaciones", pOrden, pObservaciones);
    }

    public async Task<IEnumerable<ConsumoProduccionDTO>> GetConsumosByOrdenAsync(int ordenId)
    {
        var pOrden = new SqlParameter("@OrdenProduccionId", ordenId);
        var consumos = await _db.Database
            .SqlQueryRaw<ConsumoProduccion>("EXEC dbo.sp_ConsumoProduccion_GetByOrden @OrdenProduccionId", pOrden)
            .ToListAsync();

        return consumos.Select(MapToDTO);
    }

    public async Task<IEnumerable<ResultadoProduccionDTO>> GetResultadosByOrdenAsync(int ordenId)
    {
        var pOrden = new SqlParameter("@OrdenProduccionId", ordenId);
        var resultados = await _db.Database
            .SqlQueryRaw<ResultadoProduccion>("EXEC dbo.sp_ResultadoProduccion_GetByOrden @OrdenProduccionId", pOrden)
            .ToListAsync();

        return resultados.Select(MapToDTO);
    }

    // Validación uniforme antes de ejecutar procedimientos con efectos sobre inventario.
    // No sustituye las validaciones transaccionales de los procedimientos almacenados.
    private static void ValidarObservacionesEstado(OrdenProduccionEstadoRequest request)
    {
        if (request is null)
            throw new InvalidOperationException("La solicitud de cambio de estado es obligatoria.");
        if (request.Observaciones?.Length > 250)
            throw new InvalidOperationException("Las observaciones no pueden superar 250 caracteres.");
    }

    private async Task<OrdenProduccionConDetalleDTO> ValidateOrdenOperableAsync(int id)
    {
        var orden = await GetOrdenByIdAsync(id);

        if (orden is null)
            throw new InvalidOperationException("La orden de produccion indicada no existe.");

        if (orden.EstadoOrdenProduccionNombre is "Finalizada" or "Cancelada")
            throw new InvalidOperationException("No se puede operar sobre una orden finalizada o cancelada.");

        return orden;
    }

    private static void ValidateLista(ListaMaterialesRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nombre))
            throw new InvalidOperationException("El nombre de la lista de materiales es obligatorio.");
    }

    private static void ValidateDetalleLista(DetalleListaMaterialesRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");
    }

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }

    private static int? GetNullableInt32(IDataRecord reader, string name)
    {
        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
    }

    private static ListaMaterialesDTO MapToDTO(ListaMateriales l) => new()
    {
        ListaMaterialesId = l.ListaMaterialesId,
        ProductoId = l.ProductoId,
        ProductoCodigo = l.ProductoCodigo,
        ProductoNombre = l.ProductoNombre,
        Nombre = l.Nombre,
        Version = l.Version,
        Activa = l.Activa,
        FechaAlta = l.FechaAlta
    };

    private static DetalleListaMaterialesDTO MapToDTO(DetalleListaMateriales d) => new()
    {
        DetalleListaMaterialesId = d.DetalleListaMaterialesId,
        ListaMaterialesId = d.ListaMaterialesId,
        InsumoId = d.InsumoId,
        InsumoCodigo = d.InsumoCodigo,
        InsumoNombre = d.InsumoNombre,
        Cantidad = d.Cantidad,
        Observaciones = d.Observaciones
    };

    private static OrdenProduccionDTO MapToDTO(OrdenProduccion o) => new()
    {
        OrdenProduccionId = o.OrdenProduccionId,
        TipoProduccionId = o.TipoProduccionId,
        EstadoOrdenProduccionId = o.EstadoOrdenProduccionId,
        EstadoOrdenProduccionNombre = o.Estado,
        FechaCreacion = o.FechaCreacion,
        FechaInicio = o.FechaInicio,
        FechaFin = o.FechaFin,
        Observaciones = o.Observaciones,
        CantidadModelos = o.CantidadModelos,
        CantidadTotalPlanificada = o.CantidadTotalPlanificada
    };

    private static ConsumoProduccionDTO MapToDTO(ConsumoProduccion c) => new()
    {
        ConsumoProduccionId = c.ConsumoProduccionId,
        OrdenProduccionId = c.OrdenProduccionId,
        InsumoId = c.InsumoId,
        InsumoCodigo = c.InsumoCodigo,
        InsumoNombre = c.InsumoNombre,
        DepositoId = c.DepositoId,
        DepositoNombre = c.DepositoNombre,
        FechaConsumo = c.FechaConsumo,
        CantidadConsumida = c.CantidadConsumida,
        Observaciones = c.Observaciones
    };

    private static ResultadoProduccionDTO MapToDTO(ResultadoProduccion r) => new()
    {
        ResultadoProduccionId = r.ResultadoProduccionId,
        OrdenProduccionId = r.OrdenProduccionId,
        ProductoId = r.ProductoId,
        ProductoCodigo = r.ProductoCodigo,
        ProductoNombre = r.ProductoNombre,
        DepositoId = r.DepositoId,
        DepositoNombre = r.DepositoNombre,
        FechaResultado = r.FechaResultado,
        CantidadIngresada = r.CantidadIngresada,
        Observaciones = r.Observaciones
    };

    private static DetalleListaMaterialesDTO MapDetalle(IDataRecord reader) => new()
    {
        DetalleListaMaterialesId = reader.GetInt32(reader.GetOrdinal("DetalleListaMaterialesId")),
        ListaMaterialesId = reader.GetInt32(reader.GetOrdinal("ListaMaterialesId")),
        InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")),
        InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")),
        InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
        Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
        Observaciones = GetNullableString(reader, "Observaciones")
    };

    private static OrdenProduccionConDetalleDTO MapOrdenConDetalle(IDataRecord reader) => new()
    {
        OrdenProduccionId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionId")),
        TipoProduccionId = reader.GetInt32(reader.GetOrdinal("TipoProduccionId")),
        EstadoOrdenProduccionId = reader.GetInt32(reader.GetOrdinal("EstadoOrdenProduccionId")),
        EstadoOrdenProduccionNombre = reader.GetString(reader.GetOrdinal("Estado")),
        FechaCreacion = reader.GetDateTime(reader.GetOrdinal("FechaCreacion")),
        FechaInicio = GetNullableDateTime(reader, "FechaInicio"),
        FechaFin = GetNullableDateTime(reader, "FechaFin"),
        Observaciones = GetNullableString(reader, "Observaciones")
    };

    private static OrdenProduccionProductoDTO MapOrdenProducto(IDataRecord reader) => new()
    {
        OrdenProduccionDetalleId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionDetalleId")),
        OrdenProduccionId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionId")),
        ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
        ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
        ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
        ListaMaterialesId = GetNullableInt32(reader, "ListaMaterialesId"),
        CantidadPlanificada = reader.GetDecimal(reader.GetOrdinal("CantidadPlanificada")),
        ProductoCircularId = GetNullableInt32(reader, "ProductoCircularId"),
        CantidadProducida = reader.GetDecimal(reader.GetOrdinal("CantidadProducida"))
    };

    private static ConsumoProduccionDTO MapConsumo(IDataRecord reader) => new()
    {
        ConsumoProduccionId = reader.GetInt32(reader.GetOrdinal("ConsumoProduccionId")),
        OrdenProduccionId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionId")),
        InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")),
        InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")),
        InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
        DepositoId = reader.GetInt32(reader.GetOrdinal("DepositoId")),
        DepositoNombre = reader.GetString(reader.GetOrdinal("DepositoNombre")),
        FechaConsumo = reader.GetDateTime(reader.GetOrdinal("FechaConsumo")),
        CantidadConsumida = reader.GetDecimal(reader.GetOrdinal("CantidadConsumida")),
        Observaciones = GetNullableString(reader, "Observaciones")
    };

    private static ResultadoProduccionDTO MapResultado(IDataRecord reader) => new()
    {
        ResultadoProduccionId = reader.GetInt32(reader.GetOrdinal("ResultadoProduccionId")),
        OrdenProduccionId = reader.GetInt32(reader.GetOrdinal("OrdenProduccionId")),
        ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
        ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
        ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
        DepositoId = reader.GetInt32(reader.GetOrdinal("DepositoId")),
        DepositoNombre = reader.GetString(reader.GetOrdinal("DepositoNombre")),
        FechaResultado = reader.GetDateTime(reader.GetOrdinal("FechaResultado")),
        CantidadIngresada = reader.GetDecimal(reader.GetOrdinal("CantidadIngresada")),
        Observaciones = GetNullableString(reader, "Observaciones")
    };
}
