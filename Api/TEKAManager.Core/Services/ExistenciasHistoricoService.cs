using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public sealed class ExistenciasHistoricoService : IExistenciasHistoricoService
{
    private readonly TekaDbContext _db;
    public ExistenciasHistoricoService(TekaDbContext db) => _db = db;

    private static SqlParameter P(string name, SqlDbType type, object? value) =>
        new(name, type) { Value = value ?? DBNull.Value };

    public Task<List<ExistenciasActividadDTO>> ActividadAsync(string clase, DateTime desde, DateTime hasta,
        int? depositoId, int? articuloId, bool consolidarDepositos) =>
        _db.Database.SqlQueryRaw<ExistenciasActividadDTO>(
            "EXEC dbo.pa_Existencias_ActividadPeriodo @Clase, @Desde, @Hasta, @DepositoId, @ArticuloId, @ConsolidarDepositos",
            P("@Clase", SqlDbType.VarChar, clase), P("@Desde", SqlDbType.Date, desde.Date),
            P("@Hasta", SqlDbType.Date, hasta.Date), P("@DepositoId", SqlDbType.Int, depositoId),
            P("@ArticuloId", SqlDbType.Int, articuloId), P("@ConsolidarDepositos", SqlDbType.Bit, consolidarDepositos))
        .ToListAsync();

    public Task<List<ExistenciasStockFechaDTO>> StockFechaAsync(string clase, DateTime fecha,
        int? depositoId, int? articuloId, bool consolidarDepositos) =>
        _db.Database.SqlQueryRaw<ExistenciasStockFechaDTO>(
            "EXEC dbo.pa_Existencias_StockFecha @Clase, @Fecha, @DepositoId, @ArticuloId, @ConsolidarDepositos",
            P("@Clase", SqlDbType.VarChar, clase), P("@Fecha", SqlDbType.Date, fecha.Date),
            P("@DepositoId", SqlDbType.Int, depositoId), P("@ArticuloId", SqlDbType.Int, articuloId),
            P("@ConsolidarDepositos", SqlDbType.Bit, consolidarDepositos))
        .ToListAsync();

    public Task<List<ExistenciasEvolucionDTO>> EvolucionAsync(string clase, int articuloId,
        DateTime desde, DateTime hasta, int? depositoId, string agrupacion) =>
        _db.Database.SqlQueryRaw<ExistenciasEvolucionDTO>(
            "EXEC dbo.pa_Existencias_Evolucion @Clase, @ArticuloId, @Desde, @Hasta, @DepositoId, @Agrupacion",
            P("@Clase", SqlDbType.VarChar, clase), P("@ArticuloId", SqlDbType.Int, articuloId),
            P("@Desde", SqlDbType.Date, desde.Date), P("@Hasta", SqlDbType.Date, hasta.Date),
            P("@DepositoId", SqlDbType.Int, depositoId), P("@Agrupacion", SqlDbType.VarChar, agrupacion))
        .ToListAsync();
}
