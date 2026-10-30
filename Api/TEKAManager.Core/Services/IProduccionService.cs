using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IProduccionService
{
    Task<IEnumerable<ListaMaterialesDTO>> GetListasMaterialesAsync();
    Task<ListaMaterialesConDetalleDTO?> GetListaMaterialesByIdAsync(int id);
    Task<IEnumerable<ListaMaterialesDTO>> GetListasMaterialesByProductoAsync(int productoId);
    Task<int> InsertListaMaterialesAsync(ListaMaterialesRequest request);
    Task UpdateListaMaterialesAsync(int id, ListaMaterialesRequest request);
    Task DeleteListaMaterialesAsync(int id);
    Task<IEnumerable<DetalleListaMaterialesDTO>> GetDetallesListaMaterialesAsync(int listaMaterialesId);
    Task<DetalleListaMaterialesDTO?> GetDetalleListaMaterialesByIdAsync(int id);
    Task<int> InsertDetalleListaMaterialesAsync(int listaMaterialesId, DetalleListaMaterialesRequest request);
    Task UpdateDetalleListaMaterialesAsync(int id, DetalleListaMaterialesRequest request);
    Task DeleteDetalleListaMaterialesAsync(int id);
    Task<IEnumerable<OrdenProduccionDTO>> GetOrdenesAsync();
    Task<OrdenProduccionConDetalleDTO?> GetOrdenByIdAsync(int id);
    Task<int> InsertOrdenAsync(OrdenProduccionInsertRequest request);
    Task<OrdenDesdeDisenoValidacionDTO> ValidarOrdenDesdeDisenoAsync(long recorteDisenoId, CancellationToken ct);
    Task<int> CrearOrdenDesdeDisenoAsync(long recorteDisenoId, int usuarioId, CancellationToken ct);
    Task IniciarOrdenAsync(int id, OrdenProduccionEstadoRequest request);
    Task FinalizarOrdenAsync(int id, OrdenProduccionEstadoRequest request);
    Task CancelarOrdenAsync(int id, OrdenProduccionEstadoRequest request);
    Task<IEnumerable<ConsumoProduccionDTO>> GetConsumosByOrdenAsync(int ordenId);
    Task<IEnumerable<ResultadoProduccionDTO>> GetResultadosByOrdenAsync(int ordenId);
    Task<int> GuardarVersionConfiguracionAsync(ConfiguracionFabricacionGuardarRequest request);
    Task ActivarConfiguracionAsync(int id);
    Task InactivarConfiguracionAsync(int id);
    Task<IEnumerable<RecortePrevistoConfiguracionDTO>> GetRecortesPrevistosConfiguracionAsync(int id);
    Task<InicioOrdenPreviewDTO?> GetInicioPreviewAsync(int ordenId);
    Task<FinalizacionOrdenPreviewDTO?> GetFinalizacionPreviewAsync(int ordenId);
    Task<IEnumerable<HistorialEstadoOrdenProduccionDTO>> GetHistorialOrdenAsync(int ordenId);
    Task<IEnumerable<PlantillaOrdenDTO>> GetPlantillasAsync();
    Task<PlantillaOrdenDTO?> GetPlantillaAsync(int id);
    Task<int> GuardarPlantillaAsync(PlantillaOrdenGuardarRequest request);
    Task InactivarPlantillaAsync(int id);
    Task<IEnumerable<ReporteConsumoProduccionDTO>> GetReporteConsumosAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<ReporteModeloProduccionDTO>> GetReporteModelosAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<ReporteRecorteProduccionDTO>> GetReporteRecortesConsumidosAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<ReporteRecorteProduccionDTO>> GetReporteRecortesRecuperadosAsync(DateTime desde, DateTime hasta);
}
