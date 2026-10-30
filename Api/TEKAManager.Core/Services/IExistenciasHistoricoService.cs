using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public interface IExistenciasHistoricoService
{
    Task<List<ExistenciasActividadDTO>> ActividadAsync(string clase, DateTime desde, DateTime hasta, int? depositoId, int? articuloId, bool consolidarDepositos);
    Task<List<ExistenciasStockFechaDTO>> StockFechaAsync(string clase, DateTime fecha, int? depositoId, int? articuloId, bool consolidarDepositos);
    Task<List<ExistenciasEvolucionDTO>> EvolucionAsync(string clase, int articuloId, DateTime desde, DateTime hasta, int? depositoId, string agrupacion);
}
