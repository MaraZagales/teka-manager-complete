using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IMovimientoStockService
{
    Task<IEnumerable<MovimientoStockDTO>> GetAllAsync();
    Task<MovimientoStockDTO?> GetByIdAsync(int id);

      Task<IEnumerable<MovimientoStockProductoDTO>> GetByProductoAsync(int productoId);

    Task<IEnumerable<MovimientoStockDTO>> GetByInsumoAsync(int insumoId);

    Task RegistrarProductoAsync(MovimientoProductoRequest request);
    Task RegistrarInsumoAsync(MovimientoInsumoRequest request);

    Task RegistrarProductoManualAsync(MovimientoProductoManualRequest request);
    Task RegistrarInsumoManualAsync(MovimientoInsumoManualRequest request);

    Task AnularProductoAsync(int movimientoId, AnularMovimientoRequest request);
    Task AnularInsumoAsync(int movimientoId, AnularMovimientoRequest request);
}