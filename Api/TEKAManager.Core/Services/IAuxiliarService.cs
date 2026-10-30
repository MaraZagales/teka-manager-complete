using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public interface IAuxiliarService
{
    // UnidadMedida
    Task<IEnumerable<UnidadMedidaLookupDTO>> GetUnidadesMedidaAsync();

    // Color
    Task<IEnumerable<ColorLookupDTO>> GetColoresAsync();

    // TipoProducto
    Task<IEnumerable<LookupDTO>> GetTiposProductoAsync();
    Task<IEnumerable<LookupDTO>> GetNombresProductoAsync(int tipoProductoId);

    // TipoInsumo
    Task<IEnumerable<LookupDTO>> GetTiposInsumoAsync();
    Task<IEnumerable<LookupDTO>> GetNombresInsumoAsync(int tipoInsumoId);

    // Deposito
    Task<IEnumerable<LookupDTO>> GetDepositosAsync();

    // MotivoInactivacion
    Task<IEnumerable<LookupDTO>> GetMotivosInactivacionAsync();

    // MotivoInactivacion Usuarios
    Task<IEnumerable<LookupDTO>> GetMotivosInactivacionUsuarioAsync();

    Task<IEnumerable<LookupDTO>> GetMotivosMovimientoStockAsync();

    // TipoMovimientoStock
    Task<IEnumerable<TipoMovimientoStockLookupDTO>> GetTiposMovimientoStockAsync();

    // Ventas
    Task<IEnumerable<LookupDTO>> GetCanalesVentaAsync();
    Task<IEnumerable<LookupDTO>> GetEstadosPedidoAsync();
    Task<IEnumerable<TipoDocumentoLookupDTO>> GetTiposDocumentoAsync();
    Task<IEnumerable<TipoComprobanteLookupDTO>> GetTiposComprobanteAsync();
    Task<IEnumerable<CondicionIVALookupDTO>> GetCondicionesIVAAsync();
    Task<IEnumerable<AlicuotaIVALookupDTO>> GetAlicuotasIVAAsync();
    Task<IEnumerable<MonedaLookupDTO>> GetMonedasAsync();
    Task<IEnumerable<CodigoArcaIntLookupDTO>> GetConceptosComprobanteAsync();
    Task<IEnumerable<ClienteLookupDTO>> GetClientesAsync();
    Task<IEnumerable<LookupDTO>> GetProvinciasAsync();
    Task<IEnumerable<LookupDTO>> GetLocalidadesAsync(int provinciaId);

    // Cobros
    Task<IEnumerable<MedioCobroLookupDTO>> GetMediosCobroAsync();
    Task<IEnumerable<LookupDTO>> GetEstadosCobroAsync();
    Task<IEnumerable<LookupDTO>> GetCajasAsync();
    Task<IEnumerable<TipoMovimientoCuentaCorrienteLookupDTO>> GetTiposMovimientoCuentaCorrienteAsync();

    // Produccion
    Task<IEnumerable<LookupDTO>> GetEstadosOrdenProduccionAsync();
    Task<IEnumerable<LookupDTO>> GetTiposProduccionAsync();

    // Recortes
    Task<IEnumerable<LookupDTO>> GetTiposRecorteAsync();
    Task<IEnumerable<LookupDTO>> GetEstadosRecorteAsync();
}
