using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IRecorteService
{
    Task<IEnumerable<RecorteDTO>> GetAllAsync();
    Task<RecorteConDetalleDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(RecorteRequest request);
    Task UpdateAsync(int id, RecorteRequest request);
    Task CambiarEstadoAsync(int id, RecorteCambiarEstadoRequest request);
    Task<IEnumerable<StockRecorteDTO>> GetStockAsync();
    Task<IEnumerable<StockRecorteDTO>> GetStockByRecorteAsync(int recorteId);
    Task<IEnumerable<MovimientoRecorteDTO>> GetMovimientosAsync();
    Task<IEnumerable<MovimientoRecorteDTO>> GetMovimientosByRecorteAsync(int recorteId);
    Task RegistrarMovimientoAsync(int recorteId, MovimientoRecorteRequest request);
    Task<IEnumerable<HistorialEstadoRecorteDTO>> GetHistorialAsync(int recorteId);
    Task<IEnumerable<ConsumoRecorteProduccionDTO>> GetConsumosByOrdenAsync(int ordenId);
    Task<IEnumerable<SugerenciaRecorteDTO>> GetSugerenciasAsync();
    Task<SugerenciaRecorteConDetalleDTO?> GetSugerenciaByIdAsync(int id);
    Task<int> InsertSugerenciaAsync(SugerenciaRecorteRequest request);
    Task<IEnumerable<RecorteProductoSugeridoDTO>> GetProductosSugeridosAsync(int sugerenciaId);
    Task<RecorteProductoSugeridoDTO?> GetProductoSugeridoByIdAsync(int id);
    Task<int> InsertProductoSugeridoAsync(int sugerenciaId, RecorteProductoSugeridoRequest request);
    Task DeleteProductoSugeridoAsync(int id);
    Task<IEnumerable<RecorteProductoSugeridoDTO>> GetSugerenciasDisponiblesParaOrdenAsync();
}
