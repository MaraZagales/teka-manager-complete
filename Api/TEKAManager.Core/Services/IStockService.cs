using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public interface IStockService
{
    Task<IEnumerable<StockProductoDTO>> GetAllStockProductoAsync();
    Task<IEnumerable<StockProductoDTO>> GetStockProductoByProductoAsync(int productoId);
    Task<IEnumerable<StockProductoDTO>> GetStockProductoByDepositoAsync(int depositoId);

    Task<IEnumerable<StockInsumoDTO>> GetAllStockInsumoAsync();
    Task<IEnumerable<StockInsumoDTO>> GetStockInsumoByInsumoAsync(int insumoId);
    Task<IEnumerable<StockInsumoDTO>> GetStockInsumoByDepositoAsync(int depositoId);
}
