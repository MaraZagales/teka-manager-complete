using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IRemitoService
{
    Task<IEnumerable<RemitoDTO>> GetAllAsync();
    Task<RemitoConDetalleDTO?> GetByIdAsync(int id);
    Task<int> InsertDesdePedidoAsync(RemitoDesdePedidoRequest request);
    Task EditarAsync(int id, RemitoEditarRequest request);
    Task AnularAsync(int id, RemitoAnularRequest request, string? usuario);
    Task MarcarEntregadoAsync(int id, RemitoMarcarEntregadoRequest request);
}
