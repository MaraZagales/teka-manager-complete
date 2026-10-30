using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuxiliaresController : ControllerBase
{
    private readonly IAuxiliarService _auxiliarService;
    private readonly ILogger<AuxiliaresController> _logger;

    public AuxiliaresController(IAuxiliarService auxiliarService, ILogger<AuxiliaresController> logger)
    {
        _auxiliarService = auxiliarService;
        _logger = logger;
    }

    /// <summary>Obtiene todas las unidades de medida activas (lookup).</summary>
    [HttpGet("unidades-medida")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnidadesMedida()
    {
        var items = await _auxiliarService.GetUnidadesMedidaAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los colores activos (lookup).</summary>
    [HttpGet("colores")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetColores()
    {
        var items = await _auxiliarService.GetColoresAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de producto activos (lookup).</summary>
    [HttpGet("tipos-producto")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposProducto()
    {
        var items = await _auxiliarService.GetTiposProductoAsync();
        return Ok(items);
    }

    /// <summary>Obtiene los nombres activos de productos para una categoría.</summary>
    [HttpGet("nombres-producto")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetNombresProducto([FromQuery] int tipoProductoId)
    {
        if (tipoProductoId <= 0)
            return BadRequest(new { mensaje = "Seleccioná una categoría válida." });

        return Ok(await _auxiliarService.GetNombresProductoAsync(tipoProductoId));
    }

    /// <summary>Obtiene todos los tipos de insumo activos (lookup).</summary>
    [HttpGet("tipos-insumo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposInsumo()
    {
        var items = await _auxiliarService.GetTiposInsumoAsync();
        return Ok(items);
    }

    /// <summary>Obtiene los nombres activos del catálogo para el tipo de insumo seleccionado.</summary>
    [HttpGet("nombres-insumo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetNombresInsumo([FromQuery] int tipoInsumoId)
    {
        if (tipoInsumoId <= 0)
            return BadRequest(new { mensaje = "Seleccioná un tipo de insumo válido." });

        return Ok(await _auxiliarService.GetNombresInsumoAsync(tipoInsumoId));
    }

    /// <summary>Obtiene todos los depósitos activos (lookup).</summary>
    [HttpGet("depositos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDepositos()
    {
        var items = await _auxiliarService.GetDepositosAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los motivos de inactivación activos (lookup).</summary>
    [HttpGet("motivos-inactivacion")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMotivosInactivacion()
    {
        var items = await _auxiliarService.GetMotivosInactivacionAsync();
        return Ok(items);
    }

    [HttpGet("motivos-inactivacion-usuario")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMotivosInactivacionUsuario()
    {
        var items = await _auxiliarService.GetMotivosInactivacionUsuarioAsync();
        return Ok(items);
    }

    /// <summary>Motivos activos disponibles para movimientos manuales de stock.</summary>
    [HttpGet("motivos-movimiento-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMotivosMovimientoStock()
    {
        var items = await _auxiliarService.GetMotivosMovimientoStockAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de movimiento de stock activos (lookup).</summary>
    [HttpGet("tipos-movimiento-stock")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposMovimientoStock()
    {
        var items = await _auxiliarService.GetTiposMovimientoStockAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los canales de venta activos (lookup).</summary>
    [HttpGet("canales-venta")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCanalesVenta()
    {
        var items = await _auxiliarService.GetCanalesVentaAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los estados de pedido activos (lookup).</summary>
    [HttpGet("estados-pedido")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstadosPedido()
    {
        var items = await _auxiliarService.GetEstadosPedidoAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de documento activos (lookup).</summary>
    [HttpGet("tipos-documento")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposDocumento()
    {
        var items = await _auxiliarService.GetTiposDocumentoAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de comprobante activos (lookup).</summary>
    [HttpGet("tipos-comprobante")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposComprobante()
    {
        var items = await _auxiliarService.GetTiposComprobanteAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todas las condiciones IVA activas (lookup).</summary>
    [HttpGet("condiciones-iva")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCondicionesIVA()
    {
        var items = await _auxiliarService.GetCondicionesIVAAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todas las alicuotas IVA activas (lookup).</summary>
    [HttpGet("alicuotas-iva")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAlicuotasIVA()
    {
        var items = await _auxiliarService.GetAlicuotasIVAAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todas las monedas activas (lookup).</summary>
    [HttpGet("monedas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMonedas()
    {
        var items = await _auxiliarService.GetMonedasAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los conceptos de comprobante activos (lookup).</summary>
    [HttpGet("conceptos-comprobante")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConceptosComprobante()
    {
        var items = await _auxiliarService.GetConceptosComprobanteAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los clientes activos (lookup).</summary>
    [HttpGet("clientes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClientes()
    {
        var items = await _auxiliarService.GetClientesAsync();
        return Ok(items);
    }

    [HttpGet("provincias"), Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Ventas", "Ver")]
    public async Task<IActionResult> GetProvincias() => Ok(await _auxiliarService.GetProvinciasAsync());

    [HttpGet("localidades"), Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Ventas", "Ver")]
    public async Task<IActionResult> GetLocalidades([FromQuery] int provinciaId)
    {
        if (provinciaId <= 0) return BadRequest(new { mensaje = "Seleccioná una provincia válida." });
        return Ok(await _auxiliarService.GetLocalidadesAsync(provinciaId));
    }

    /// <summary>Obtiene todos los medios de cobro activos (lookup).</summary>
    [HttpGet("medios-cobro")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMediosCobro()
    {
        var items = await _auxiliarService.GetMediosCobroAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los estados de cobro activos (lookup).</summary>
    [HttpGet("estados-cobro")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstadosCobro()
    {
        var items = await _auxiliarService.GetEstadosCobroAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todas las cajas activas (lookup).</summary>
    [HttpGet("cajas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCajas()
    {
        var items = await _auxiliarService.GetCajasAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de movimiento de cuenta corriente activos (lookup).</summary>
    [HttpGet("tipos-movimiento-cuenta-corriente")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposMovimientoCuentaCorriente()
    {
        var items = await _auxiliarService.GetTiposMovimientoCuentaCorrienteAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los estados de orden de produccion activos (lookup).</summary>
    [HttpGet("estados-orden-produccion")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstadosOrdenProduccion()
    {
        var items = await _auxiliarService.GetEstadosOrdenProduccionAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de produccion activos (lookup).</summary>
    [HttpGet("tipos-produccion")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposProduccion()
    {
        var items = await _auxiliarService.GetTiposProduccionAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los tipos de recorte activos (lookup).</summary>
    [HttpGet("tipos-recorte")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTiposRecorte()
    {
        var items = await _auxiliarService.GetTiposRecorteAsync();
        return Ok(items);
    }

    /// <summary>Obtiene todos los estados de recorte activos (lookup).</summary>
    [HttpGet("estados-recorte")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstadosRecorte()
    {
        var items = await _auxiliarService.GetEstadosRecorteAsync();
        return Ok(items);
    }
}
