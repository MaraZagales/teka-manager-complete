using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class RecorteService : IRecorteService
{
    private static readonly HashSet<string> TiposMovimientoValidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "Alta", "Baja", "AjustePositivo", "AjusteNegativo"
    };

    private readonly TekaDbContext _db;

    public RecorteService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<RecorteDTO>> GetAllAsync()
    {
        var recortes = await _db.Database.SqlQueryRaw<Recorte>("EXEC dbo.sp_Recorte_GetAll").ToListAsync();
        return recortes.Select(MapToDTO);
    }

    public async Task<RecorteConDetalleDTO?> GetByIdAsync(int id)
    {
        var pRecorte = new SqlParameter("@RecorteId", id);
        var recortes = await _db.Database
            .SqlQueryRaw<Recorte>("EXEC dbo.sp_Recorte_GetById @RecorteId", pRecorte)
            .ToListAsync();

        var recorte = recortes.FirstOrDefault();
        if (recorte is null)
            return null;

        var dto = MapToConDetalleDTO(recorte);
        dto.Stocks.AddRange(await GetStockByRecorteAsync(id));
        dto.Movimientos.AddRange(await GetMovimientosByRecorteAsync(id));
        dto.HistorialEstados.AddRange(await GetHistorialAsync(id));
        return dto;
    }

    public async Task<int> InsertAsync(RecorteRequest request)
    {
        await ValidateRecorteAsync(request);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Recorte_Insert @OrdenProduccionId, @InsumoId, @TipoRecorteId, @EstadoRecorteId, @ColorId, @Dimension, @UnidadMedidaId, @Cantidad, @Observaciones",
                ToParam("@OrdenProduccionId", request.OrdenProduccionId),
                new SqlParameter("@InsumoId", request.InsumoId),
                ToParam("@TipoRecorteId", request.TipoRecorteId),
                new SqlParameter("@EstadoRecorteId", request.EstadoRecorteId),
                ToParam("@ColorId", request.ColorId),
                ToParam("@Dimension", request.Dimension),
                new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId),
                new SqlParameter("@Cantidad", request.Cantidad),
                ToParam("@Observaciones", request.Observaciones))
            .ToListAsync();

        var recorteId = Convert.ToInt32(result.FirstOrDefault());

        await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_HistorialEstadoRecorte_Registrar @RecorteId, @EstadoRecorteId, @Observaciones",
                new SqlParameter("@RecorteId", recorteId),
                new SqlParameter("@EstadoRecorteId", request.EstadoRecorteId),
                new SqlParameter("@Observaciones", "Recorte creado"))
            .ToListAsync();

        await transaction.CommitAsync();
        return recorteId;
    }

    public async Task UpdateAsync(int id, RecorteRequest request)
    {
        await ValidateRecorteAsync(request);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Recorte_Update @RecorteId, @OrdenProduccionId, @InsumoId, @TipoRecorteId, @EstadoRecorteId, @ColorId, @Dimension, @UnidadMedidaId, @Cantidad, @Observaciones",
            new SqlParameter("@RecorteId", id),
            ToParam("@OrdenProduccionId", request.OrdenProduccionId),
            new SqlParameter("@InsumoId", request.InsumoId),
            ToParam("@TipoRecorteId", request.TipoRecorteId),
            new SqlParameter("@EstadoRecorteId", request.EstadoRecorteId),
            ToParam("@ColorId", request.ColorId),
            ToParam("@Dimension", request.Dimension),
            new SqlParameter("@UnidadMedidaId", request.UnidadMedidaId),
            new SqlParameter("@Cantidad", request.Cantidad),
            ToParam("@Observaciones", request.Observaciones));
    }

    public async Task CambiarEstadoAsync(int id, RecorteCambiarEstadoRequest request)
    {
        var recorte = await ValidateRecorteExistenteAsync(id);
        await ValidateCambioEstadoOperativoAsync(recorte, request.EstadoRecorteId);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_HistorialEstadoRecorte_Registrar @RecorteId, @EstadoRecorteId, @Observaciones",
                new SqlParameter("@RecorteId", id),
                new SqlParameter("@EstadoRecorteId", request.EstadoRecorteId),
                ToParam("@Observaciones", request.Observaciones))
            .ToListAsync();

        _ = result.FirstOrDefault();
    }

    public async Task<IEnumerable<StockRecorteDTO>> GetStockAsync()
    {
        var stocks = await _db.Database.SqlQueryRaw<StockRecorte>("EXEC dbo.sp_StockRecorte_GetAll").ToListAsync();
        return stocks.Select(MapToDTO);
    }

    public async Task<IEnumerable<StockRecorteDTO>> GetStockByRecorteAsync(int recorteId)
    {
        var pRecorte = new SqlParameter("@RecorteId", recorteId);
        var stocks = await _db.Database
            .SqlQueryRaw<StockRecorte>("EXEC dbo.sp_StockRecorte_GetByRecorte @RecorteId", pRecorte)
            .ToListAsync();

        return stocks.Select(MapToDTO);
    }

    public async Task<IEnumerable<MovimientoRecorteDTO>> GetMovimientosAsync()
    {
        var movimientos = await _db.Database.SqlQueryRaw<MovimientoRecorte>("EXEC dbo.sp_MovimientoRecorte_GetAll").ToListAsync();
        return movimientos.Select(MapToDTO);
    }

    public async Task<IEnumerable<MovimientoRecorteDTO>> GetMovimientosByRecorteAsync(int recorteId)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_MovimientoRecorte_GetByRecorte";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@RecorteId", recorteId));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();
        var movimientos = new List<MovimientoRecorteDTO>();

        while (await reader.ReadAsync())
            movimientos.Add(MapMovimiento(reader));

        return movimientos;
    }

    public async Task RegistrarMovimientoAsync(int recorteId, MovimientoRecorteRequest request)
    {
        await ValidateRecorteExistenteAsync(recorteId);
        ValidateMovimiento(request);

        await using var transaction = await _db.Database.BeginTransactionAsync();

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_MovimientoRecorte_Registrar @RecorteId, @DepositoId, @TipoMovimiento, @Cantidad, @Observaciones",
            new SqlParameter("@RecorteId", recorteId),
            new SqlParameter("@DepositoId", request.DepositoId),
            new SqlParameter("@TipoMovimiento", request.TipoMovimiento),
            new SqlParameter("@Cantidad", request.Cantidad),
            ToParam("@Observaciones", request.Observaciones));

        await transaction.CommitAsync();
    }

    public async Task<IEnumerable<HistorialEstadoRecorteDTO>> GetHistorialAsync(int recorteId)
    {
        var pRecorte = new SqlParameter("@RecorteId", recorteId);
        var historiales = await _db.Database
            .SqlQueryRaw<HistorialEstadoRecorte>("EXEC dbo.sp_HistorialEstadoRecorte_GetByRecorte @RecorteId", pRecorte)
            .ToListAsync();

        return historiales.Select(MapToDTO);
    }

    public async Task<IEnumerable<ConsumoRecorteProduccionDTO>> GetConsumosByOrdenAsync(int ordenId)
    {
        var pOrden = new SqlParameter("@OrdenProduccionId", ordenId);
        var consumos = await _db.Database
            .SqlQueryRaw<ConsumoRecorteProduccion>("EXEC dbo.sp_ConsumoRecorteProduccion_GetByOrden @OrdenProduccionId", pOrden)
            .ToListAsync();

        return consumos.Select(MapToDTO);
    }

    public async Task<IEnumerable<SugerenciaRecorteDTO>> GetSugerenciasAsync()
    {
        var sugerencias = await _db.Database.SqlQueryRaw<SugerenciaRecorte>("EXEC dbo.sp_SugerenciaRecorte_GetAll").ToListAsync();
        return sugerencias.Select(MapToDTO);
    }

    public async Task<SugerenciaRecorteConDetalleDTO?> GetSugerenciaByIdAsync(int id)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_SugerenciaRecorte_GetById";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@SugerenciaRecorteId", id));

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        var sugerencia = new SugerenciaRecorteConDetalleDTO
        {
            SugerenciaRecorteId = reader.GetInt32(reader.GetOrdinal("SugerenciaRecorteId")),
            FechaSugerencia = reader.GetDateTime(reader.GetOrdinal("FechaSugerencia")),
            Observaciones = GetNullableString(reader, "Observaciones")
        };

        await reader.NextResultAsync();
        while (await reader.ReadAsync())
            sugerencia.ProductosSugeridos.Add(MapProductoSugerido(reader));

        sugerencia.CantidadSugerencias = sugerencia.ProductosSugeridos.Count;
        return sugerencia;
    }

    public async Task<int> InsertSugerenciaAsync(SugerenciaRecorteRequest request)
    {
        var result = await _db.Database
            .SqlQueryRaw<decimal>("EXEC dbo.sp_SugerenciaRecorte_Insert @Observaciones", ToParam("@Observaciones", request.Observaciones))
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task<IEnumerable<RecorteProductoSugeridoDTO>> GetProductosSugeridosAsync(int sugerenciaId)
    {
        return await QueryProductosSugeridosAsync("dbo.sp_RecorteProductoSugerido_GetBySugerencia", new SqlParameter("@SugerenciaRecorteId", sugerenciaId));
    }

    public async Task<RecorteProductoSugeridoDTO?> GetProductoSugeridoByIdAsync(int id)
    {
        var items = await QueryProductosSugeridosAsync("dbo.sp_RecorteProductoSugerido_GetById", new SqlParameter("@RecorteProductoSugeridoId", id));
        return items.FirstOrDefault();
    }

    public async Task<int> InsertProductoSugeridoAsync(int sugerenciaId, RecorteProductoSugeridoRequest request)
    {
        if (request.PuntajeCompatibilidad is < 0 or > 100)
            throw new InvalidOperationException("El puntaje de compatibilidad debe estar entre 0 y 100.");

        await ValidateRecorteDisponibleParaSugerirAsync(request.RecorteId);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_RecorteProductoSugerido_Insert @SugerenciaRecorteId, @RecorteId, @ProductoId, @PuntajeCompatibilidad, @Observaciones",
                new SqlParameter("@SugerenciaRecorteId", sugerenciaId),
                new SqlParameter("@RecorteId", request.RecorteId),
                new SqlParameter("@ProductoId", request.ProductoId),
                ToParam("@PuntajeCompatibilidad", request.PuntajeCompatibilidad),
                ToParam("@Observaciones", request.Observaciones))
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task DeleteProductoSugeridoAsync(int id)
    {
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_RecorteProductoSugerido_Delete @RecorteProductoSugeridoId",
            new SqlParameter("@RecorteProductoSugeridoId", id));
    }

    public async Task<IEnumerable<RecorteProductoSugeridoDTO>> GetSugerenciasDisponiblesParaOrdenAsync()
    {
        return await QueryProductosSugeridosAsync("dbo.sp_RecorteProductoSugerido_GetDisponiblesParaOrden");
    }

    private async Task<IEnumerable<RecorteProductoSugeridoDTO>> QueryProductosSugeridosAsync(string storedProcedure, params SqlParameter[] parameters)
    {
        var connection = _db.Database.GetDbConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = storedProcedure;
        command.CommandType = CommandType.StoredProcedure;

        foreach (var parameter in parameters)
            command.Parameters.Add(parameter);

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();
        var items = new List<RecorteProductoSugeridoDTO>();

        while (await reader.ReadAsync())
            items.Add(MapProductoSugerido(reader));

        return items;
    }

    private async Task<RecorteConDetalleDTO> ValidateRecorteExistenteAsync(int recorteId)
    {
        var recorte = await GetByIdAsync(recorteId);
        if (recorte is null)
            throw new InvalidOperationException("El recorte indicado no existe.");

        return recorte;
    }

    private async Task ValidateRecorteDisponibleParaSugerirAsync(int recorteId)
    {
        var recorte = await ValidateRecorteExistenteAsync(recorteId);
        if (!string.Equals(recorte.EstadoRecorteNombre, "Disponible", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Solo se pueden sugerir recortes en estado Disponible.");

        var stocks = (await GetStockByRecorteAsync(recorteId)).ToList();
        if (stocks.Count == 0 || stocks.Sum(s => s.CantidadActual) <= 0)
            throw new InvalidOperationException("No se puede sugerir un recorte sin stock disponible.");
    }

    private async Task ValidateCambioEstadoOperativoAsync(RecorteConDetalleDTO recorte, int estadoRecorteId)
    {
        var estados = await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoRecorte_GetLookup")
            .ToListAsync();

        var estadoDestino = estados.FirstOrDefault(e => e.Id == estadoRecorteId)
            ?? throw new InvalidOperationException("El estado de recorte indicado no existe o no esta activo.");

        if (estadoDestino.Descripcion.Contains("Reserv", StringComparison.OrdinalIgnoreCase)
            || estadoDestino.Descripcion.Contains("Compromet", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Los recortes no se reservan. Permanecen disponibles hasta iniciar la produccion.");
        }

        if (estadoDestino.Descripcion.Equals("Utilizado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("El estado Utilizado solo puede asignarse al consumir el recorte al iniciar una orden de produccion.");

        if (recorte.EstadoRecorteNombre.Equals("Utilizado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Un recorte utilizado no puede volver a un estado operativo.");
    }

    private async Task ValidateRecorteAsync(RecorteRequest request)
    {
        RecorteGeometria.ValidarEntrada(request.LargoMm, request.AnchoMm, request.EspesorMm, request.OrientacionVeta);
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad del recorte debe ser mayor a cero.");

        if (request.Dimension.HasValue && request.Dimension.Value <= 0)
            throw new InvalidOperationException("La dimension del recorte debe ser positiva.");

        var estados = await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoRecorte_GetLookup")
            .ToListAsync();

        var estado = estados.FirstOrDefault(e => e.Id == request.EstadoRecorteId)
            ?? throw new InvalidOperationException("El estado de recorte indicado no existe o no esta activo.");

        if (estado.Descripcion.Contains("Reserv", StringComparison.OrdinalIgnoreCase)
            || estado.Descripcion.Contains("Compromet", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Los recortes no se reservan. Permanecen disponibles hasta iniciar la produccion.");
        }

        if (estado.Descripcion.Equals("Utilizado", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("El estado Utilizado solo puede asignarse al consumir el recorte al iniciar una orden de produccion.");

        var unidades = await _db.Database
            .SqlQueryRaw<UnidadMedidaLookupDTO>("EXEC dbo.sp_UnidadMedida_GetLookup")
            .ToListAsync();

        var unidad = unidades.FirstOrDefault(u => u.Id == request.UnidadMedidaId);
        if (unidad is null
            || !(unidad.Abreviatura.Replace("²", "2", StringComparison.Ordinal).Equals("m2", StringComparison.OrdinalIgnoreCase)
                 || unidad.Descripcion.Contains("cuadrado", StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("Los recortes de melamina deben registrarse siempre en metros cuadrados (m2).");
        }
    }

    private static void ValidateMovimiento(MovimientoRecorteRequest request)
    {
        if (request.Cantidad <= 0)
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");

        if (string.Equals(request.TipoMovimiento, "Reserva", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Los recortes no se reservan. Permanecen disponibles hasta iniciar la produccion.");

        if (string.Equals(request.TipoMovimiento, "Uso", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("El uso de recortes solo puede registrarse al iniciar una orden de produccion.");

        if (!TiposMovimientoValidos.Contains(request.TipoMovimiento))
            throw new InvalidOperationException("El tipo de movimiento de recorte no es valido.");
    }

    private static SqlParameter ToParam(string name, object? value) => new(name, value ?? DBNull.Value);

    private static string? GetNullableString(IDataRecord reader, string name)
    {
        if (!HasColumn(reader, name))
            return null;

        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static int? GetNullableInt(IDataRecord reader, string name)
    {
        if (!HasColumn(reader, name))
            return null;

        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetInt32(ordinal);
    }

    private static decimal? GetNullableDecimal(IDataRecord reader, string name)
    {
        if (!HasColumn(reader, name))
            return null;

        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDecimal(ordinal);
    }

    private static DateTime? GetNullableDateTime(IDataRecord reader, string name)
    {
        if (!HasColumn(reader, name))
            return null;

        var ordinal = reader.GetOrdinal(name);
        return reader.IsDBNull(ordinal) ? null : reader.GetDateTime(ordinal);
    }

    private static bool HasColumn(IDataRecord reader, string name)
    {
        for (var i = 0; i < reader.FieldCount; i++)
            if (string.Equals(reader.GetName(i), name, StringComparison.OrdinalIgnoreCase))
                return true;

        return false;
    }

    private static RecorteDTO MapToDTO(Recorte r) => new()
    {
        RecorteId = r.RecorteId,
        OrdenProduccionId = r.OrdenProduccionId,
        InsumoId = r.InsumoId,
        InsumoCodigo = r.InsumoCodigo,
        InsumoNombre = r.InsumoNombre,
        TipoRecorteId = r.TipoRecorteId,
        TipoRecorteNombre = r.TipoRecorteNombre,
        EstadoRecorteId = r.EstadoRecorteId,
        EstadoRecorteNombre = r.EstadoRecorteNombre,
        ColorId = r.ColorId,
        ColorNombre = r.ColorNombre,
        CodigoHex = r.CodigoHex,
        Dimension = r.Dimension,
        LargoMm = r.LargoMm,
        AnchoMm = r.AnchoMm,
        EspesorMm = r.EspesorMm,
        OrientacionVeta = r.OrientacionVeta,
        CalidadGeometrica = RecorteGeometria.Clasificar(r.LargoMm, r.AnchoMm, r.EspesorMm, r.OrientacionVeta, r.InsumoId, r.ColorId, r.InsumoColorId is null || r.InsumoColorId == r.ColorId),
        ElegibleParaIa = RecorteGeometria.EsElegible(r.StockDisponible, r.EstadoRecorteNombre, r.TipoInsumoNombre, r.LargoMm, r.AnchoMm, r.EspesorMm, r.OrientacionVeta, r.InsumoId, r.ColorId, r.InsumoColorId is null || r.InsumoColorId == r.ColorId),
        UnidadMedidaId = r.UnidadMedidaId,
        UnidadMedidaNombre = r.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = r.UnidadMedidaAbreviatura,
        Cantidad = r.Cantidad,
        Observaciones = r.Observaciones,
        FechaAlta = r.FechaAlta
    };

    private static RecorteConDetalleDTO MapToConDetalleDTO(Recorte r) => new()
    {
        RecorteId = r.RecorteId,
        OrdenProduccionId = r.OrdenProduccionId,
        InsumoId = r.InsumoId,
        InsumoCodigo = r.InsumoCodigo,
        InsumoNombre = r.InsumoNombre,
        TipoRecorteId = r.TipoRecorteId,
        TipoRecorteNombre = r.TipoRecorteNombre,
        EstadoRecorteId = r.EstadoRecorteId,
        EstadoRecorteNombre = r.EstadoRecorteNombre,
        ColorId = r.ColorId,
        ColorNombre = r.ColorNombre,
        CodigoHex = r.CodigoHex,
        Dimension = r.Dimension,
        LargoMm = r.LargoMm,
        AnchoMm = r.AnchoMm,
        EspesorMm = r.EspesorMm,
        OrientacionVeta = r.OrientacionVeta,
        CalidadGeometrica = RecorteGeometria.Clasificar(r.LargoMm, r.AnchoMm, r.EspesorMm, r.OrientacionVeta, r.InsumoId, r.ColorId, r.InsumoColorId is null || r.InsumoColorId == r.ColorId),
        ElegibleParaIa = RecorteGeometria.EsElegible(r.StockDisponible, r.EstadoRecorteNombre, r.TipoInsumoNombre, r.LargoMm, r.AnchoMm, r.EspesorMm, r.OrientacionVeta, r.InsumoId, r.ColorId, r.InsumoColorId is null || r.InsumoColorId == r.ColorId),
        UnidadMedidaId = r.UnidadMedidaId,
        UnidadMedidaNombre = r.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = r.UnidadMedidaAbreviatura,
        Cantidad = r.Cantidad,
        Observaciones = r.Observaciones,
        FechaAlta = r.FechaAlta
    };

    private static StockRecorteDTO MapToDTO(StockRecorte s) => new()
    {
        StockRecorteId = s.StockRecorteId,
        RecorteId = s.RecorteId,
        OrdenProduccionId = s.OrdenProduccionId,
        InsumoId = s.InsumoId,
        InsumoCodigo = s.InsumoCodigo,
        InsumoNombre = s.InsumoNombre,
        TipoRecorteId = s.TipoRecorteId,
        TipoRecorteNombre = s.TipoRecorteNombre,
        EstadoRecorteId = s.EstadoRecorteId,
        EstadoRecorteNombre = s.EstadoRecorteNombre,
        ColorId = s.ColorId,
        ColorNombre = s.ColorNombre,
        CodigoHex = s.CodigoHex,
        Dimension = s.Dimension,
        LargoMm = s.LargoMm,
        AnchoMm = s.AnchoMm,
        EspesorMm = s.EspesorMm,
        OrientacionVeta = s.OrientacionVeta,
        CalidadGeometrica = RecorteGeometria.Clasificar(s.LargoMm, s.AnchoMm, s.EspesorMm, s.OrientacionVeta, s.InsumoId, s.ColorId, s.InsumoColorId is null || s.InsumoColorId == s.ColorId),
        ElegibleParaIa = RecorteGeometria.EsElegible(s.CantidadActual, s.EstadoRecorteNombre, s.TipoInsumoNombre, s.LargoMm, s.AnchoMm, s.EspesorMm, s.OrientacionVeta, s.InsumoId, s.ColorId, s.InsumoColorId is null || s.InsumoColorId == s.ColorId),
        UnidadMedidaId = s.UnidadMedidaId,
        UnidadMedidaNombre = s.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = s.UnidadMedidaAbreviatura,
        DepositoId = s.DepositoId,
        DepositoNombre = s.DepositoNombre,
        CantidadActual = s.CantidadActual,
        Cantidad = s.CantidadActual,
        Observaciones = s.Observaciones,
        FechaAlta = s.FechaAlta
    };

    private static MovimientoRecorteDTO MapToDTO(MovimientoRecorte m) => new()
    {
        MovimientoRecorteId = m.MovimientoRecorteId,
        RecorteId = m.RecorteId,
        DepositoId = m.DepositoId,
        DepositoNombre = m.DepositoNombre,
        FechaMovimiento = m.FechaMovimiento,
        TipoMovimiento = m.TipoMovimiento,
        Cantidad = m.Cantidad,
        Observaciones = m.Observaciones,
        InsumoId = m.InsumoId,
        InsumoCodigo = m.InsumoCodigo,
        InsumoNombre = m.InsumoNombre,
        Dimension = m.Dimension,
        UnidadMedidaId = m.UnidadMedidaId,
        UnidadMedidaNombre = m.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = m.UnidadMedidaAbreviatura
    };

    private static HistorialEstadoRecorteDTO MapToDTO(HistorialEstadoRecorte h) => new()
    {
        HistorialEstadoRecorteId = h.HistorialEstadoRecorteId,
        RecorteId = h.RecorteId,
        EstadoRecorteId = h.EstadoRecorteId,
        EstadoRecorteNombre = h.EstadoRecorteNombre,
        FechaCambio = h.FechaCambio,
        Observaciones = h.Observaciones
    };

    private static ConsumoRecorteProduccionDTO MapToDTO(ConsumoRecorteProduccion c) => new()
    {
        ConsumoRecorteProduccionId = c.ConsumoRecorteProduccionId,
        OrdenProduccionId = c.OrdenProduccionId,
        RecorteId = c.RecorteId,
        DepositoId = c.DepositoId,
        DepositoNombre = c.DepositoNombre,
        FechaConsumo = c.FechaConsumo,
        CantidadConsumida = c.CantidadConsumida,
        Observaciones = c.Observaciones,
        InsumoId = c.InsumoId,
        InsumoCodigo = c.InsumoCodigo,
        InsumoNombre = c.InsumoNombre,
        Dimension = c.Dimension,
        UnidadMedidaId = c.UnidadMedidaId,
        UnidadMedidaNombre = c.UnidadMedidaNombre,
        UnidadMedidaAbreviatura = c.UnidadMedidaAbreviatura
    };

    private static SugerenciaRecorteDTO MapToDTO(SugerenciaRecorte s) => new()
    {
        SugerenciaRecorteId = s.SugerenciaRecorteId,
        FechaSugerencia = s.FechaSugerencia,
        Observaciones = s.Observaciones,
        CantidadSugerencias = s.CantidadSugerencias
    };

    private static MovimientoRecorteDTO MapMovimiento(IDataRecord reader) => new()
    {
        MovimientoRecorteId = reader.GetInt32(reader.GetOrdinal("MovimientoRecorteId")),
        RecorteId = reader.GetInt32(reader.GetOrdinal("RecorteId")),
        DepositoId = reader.GetInt32(reader.GetOrdinal("DepositoId")),
        DepositoNombre = reader.GetString(reader.GetOrdinal("DepositoNombre")),
        FechaMovimiento = reader.GetDateTime(reader.GetOrdinal("FechaMovimiento")),
        TipoMovimiento = reader.GetString(reader.GetOrdinal("TipoMovimiento")),
        Cantidad = reader.GetDecimal(reader.GetOrdinal("Cantidad")),
        Observaciones = GetNullableString(reader, "Observaciones")
    };

    private static RecorteProductoSugeridoDTO MapProductoSugerido(IDataRecord reader) => new()
    {
        RecorteProductoSugeridoId = reader.GetInt32(reader.GetOrdinal("RecorteProductoSugeridoId")),
        SugerenciaRecorteId = reader.GetInt32(reader.GetOrdinal("SugerenciaRecorteId")),
        FechaSugerencia = GetNullableDateTime(reader, "FechaSugerencia"),
        RecorteId = reader.GetInt32(reader.GetOrdinal("RecorteId")),
        InsumoId = reader.GetInt32(reader.GetOrdinal("InsumoId")),
        InsumoCodigo = reader.GetString(reader.GetOrdinal("InsumoCodigo")),
        InsumoNombre = reader.GetString(reader.GetOrdinal("InsumoNombre")),
        ColorId = GetNullableInt(reader, "ColorId"),
        ColorNombre = GetNullableString(reader, "ColorNombre"),
        Dimension = GetNullableDecimal(reader, "Dimension"),
        UnidadMedidaId = reader.GetInt32(reader.GetOrdinal("UnidadMedidaId")),
        UnidadMedidaNombre = reader.GetString(reader.GetOrdinal("UnidadMedidaNombre")),
        UnidadMedidaAbreviatura = reader.GetString(reader.GetOrdinal("UnidadMedidaAbreviatura")),
        ProductoId = reader.GetInt32(reader.GetOrdinal("ProductoId")),
        ProductoCodigo = reader.GetString(reader.GetOrdinal("ProductoCodigo")),
        ProductoNombre = reader.GetString(reader.GetOrdinal("ProductoNombre")),
        PuntajeCompatibilidad = GetNullableDecimal(reader, "PuntajeCompatibilidad"),
        Observaciones = GetNullableString(reader, "Observaciones")
    };
}
