using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IComprobanteService
{
    Task<IEnumerable<ComprobanteDTO>> GetAllAsync();
    Task<ComprobanteConDetalleDTO?> GetByIdAsync(int id);
    Task<int> InsertDesdePedidoAsync(ComprobanteDesdePedidoRequest request);
    Task<int> EmitirNotaCreditoAsync(int comprobanteOrigenId, NotaComprobanteRequest request);
    Task<int> EmitirNotaDebitoAsync(int comprobanteOrigenId, NotaComprobanteRequest request);
}
