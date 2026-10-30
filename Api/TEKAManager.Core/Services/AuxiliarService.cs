using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;

namespace TEKAManager.Core.Services;

public class AuxiliarService : IAuxiliarService
{
    private readonly TekaDbContext _db;

    public AuxiliarService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<UnidadMedidaLookupDTO>> GetUnidadesMedidaAsync()
    {
        return await _db.Database
            .SqlQueryRaw<UnidadMedidaLookupDTO>("EXEC dbo.sp_UnidadMedida_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<ColorLookupDTO>> GetColoresAsync()
    {
        return await _db.Database
            .SqlQueryRaw<ColorLookupDTO>("EXEC dbo.sp_Color_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetTiposProductoAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_TipoProducto_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetNombresProductoAsync(int tipoProductoId)
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>(
                "EXEC dbo.sp_NombreProductoCatalogo_GetLookup @TipoProductoId={0}", tipoProductoId)
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetNombresInsumoAsync(int tipoInsumoId)
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>(
                "EXEC dbo.sp_NombreInsumoCatalogo_GetLookup @TipoInsumoId={0}", tipoInsumoId)
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetTiposInsumoAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_TipoInsumo_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetDepositosAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_Deposito_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetMotivosInactivacionAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_MotivoInactivacion_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetMotivosInactivacionUsuarioAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_MotivoInactivacionUsuario_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetMotivosMovimientoStockAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_MotivoMovimientoStock_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<TipoMovimientoStockLookupDTO>> GetTiposMovimientoStockAsync()
    {
        return await _db.Database
            .SqlQueryRaw<TipoMovimientoStockLookupDTO>("EXEC dbo.sp_TipoMovimientoStock_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetCanalesVentaAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_CanalVenta_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetEstadosPedidoAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoPedido_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<TipoDocumentoLookupDTO>> GetTiposDocumentoAsync()
    {
        return await _db.Database
            .SqlQueryRaw<TipoDocumentoLookupDTO>("EXEC dbo.sp_TipoDocumento_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<TipoComprobanteLookupDTO>> GetTiposComprobanteAsync()
    {
        return await _db.Database
            .SqlQueryRaw<TipoComprobanteLookupDTO>("EXEC dbo.sp_TipoComprobante_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<CondicionIVALookupDTO>> GetCondicionesIVAAsync()
    {
        return await _db.Database
            .SqlQueryRaw<CondicionIVALookupDTO>("EXEC dbo.sp_CondicionIVA_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<AlicuotaIVALookupDTO>> GetAlicuotasIVAAsync()
    {
        return await _db.Database
            .SqlQueryRaw<AlicuotaIVALookupDTO>("EXEC dbo.sp_AlicuotaIVA_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<MonedaLookupDTO>> GetMonedasAsync()
    {
        return await _db.Database
            .SqlQueryRaw<MonedaLookupDTO>("EXEC dbo.sp_Moneda_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<CodigoArcaIntLookupDTO>> GetConceptosComprobanteAsync()
    {
        return await _db.Database
            .SqlQueryRaw<CodigoArcaIntLookupDTO>("EXEC dbo.sp_ConceptoComprobante_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<ClienteLookupDTO>> GetClientesAsync()
    {
        return await _db.Database
            .SqlQueryRaw<ClienteLookupDTO>("EXEC dbo.sp_Cliente_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetProvinciasAsync()
    {
        return await _db.Database.SqlQueryRaw<LookupDTO>(
            "SELECT ProvinciaId AS Id, Nombre AS Descripcion FROM dbo.Provincia WHERE Activo=1 ORDER BY Nombre").ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetLocalidadesAsync(int provinciaId)
    {
        return await _db.Database.SqlQueryRaw<LookupDTO>(
            "SELECT LocalidadId AS Id, Nombre AS Descripcion FROM dbo.Localidad WHERE Activo=1 AND ProvinciaId={0} ORDER BY Nombre", provinciaId).ToListAsync();
    }

    public async Task<IEnumerable<MedioCobroLookupDTO>> GetMediosCobroAsync()
    {
        return await _db.Database
            .SqlQueryRaw<MedioCobroLookupDTO>("EXEC dbo.sp_MedioCobro_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetEstadosCobroAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoCobro_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetCajasAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_Caja_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<TipoMovimientoCuentaCorrienteLookupDTO>> GetTiposMovimientoCuentaCorrienteAsync()
    {
        return await _db.Database
            .SqlQueryRaw<TipoMovimientoCuentaCorrienteLookupDTO>("EXEC dbo.sp_TipoMovimientoCuentaCorriente_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetEstadosOrdenProduccionAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoOrdenProduccion_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetTiposProduccionAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_TipoProduccion_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetTiposRecorteAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_TipoRecorte_GetLookup")
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDTO>> GetEstadosRecorteAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_EstadoRecorte_GetLookup")
            .ToListAsync();
    }
}
