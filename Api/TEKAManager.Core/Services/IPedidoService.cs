using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IPedidoService
{
    Task<IEnumerable<PedidoDTO>> GetAllAsync();
    Task<PedidoConDetalleDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(PedidoInsertRequest request);
    Task<PedidoSaldoDTO?> GetSaldoAsync(int id);
    Task AgregarDetalleAsync(int id, PedidoDetalleInsertRequest request);
    Task ActualizarDetalleAsync(int detalleId, PedidoDetalleUpdateRequest request);
    Task EliminarDetalleAsync(int detalleId);
    Task ConfirmarPagadoAsync(int id, PedidoConfirmarPagadoRequest request);
    Task<PedidoAnulacionIntegralResultado> AnularIntegralAsync(int pedidoId, PedidoAnulacionIntegralRequest request);
    Task CancelarAsync(int id, PedidoCancelarRequest request);
}
