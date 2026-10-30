using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IOportunidadService
{
    Task<IEnumerable<OportunidadComercialDTO>> GetAllAsync();
    Task<OportunidadComercialConDetalleDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(OportunidadComercialInsertRequest request);
    Task UpdateAsync(int id, OportunidadComercialUpdateRequest request);
    Task RegistrarVisitaAsync(int id, VisitaOportunidadInsertRequest request);
    Task MarcarPerdidaAsync(int id, OportunidadMarcarPerdidaRequest request);
    Task CancelarAsync(int id, OportunidadCancelarRequest request);
    Task<ConversionOportunidadPedidoDTO> ConvertirEnPedidoAsync(int id, OportunidadConvertirEnPedidoRequest request);
    Task<IEnumerable<LookupDTO>> GetEstadosLookupAsync();
    Task<IEnumerable<LookupDTO>> GetMotivosPerdidaLookupAsync();
    Task<OportunidadResumenDTO?> GetResumenAsync();
    Task<IEnumerable<OportunidadFunnelDTO>> GetFunnelAsync();
    Task<IEnumerable<MotivoPerdidaResumenDTO>> GetMotivosPerdidaResumenAsync();
    Task<PanelComercialResumenDTO?> GetPanelComercialResumenMensualAsync();
    Task GuardarProductoAsync(int id, OportunidadProductoRequest request);
    Task EliminarProductoAsync(int id, int productoId);
    Task AsignarResponsableAsync(int id, int usuarioResponsableId);
}
