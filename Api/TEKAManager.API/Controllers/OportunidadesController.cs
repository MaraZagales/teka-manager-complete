using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/oportunidades")]
[Produces("application/json")]
[Authorize]
[RequirePermission("Comercial", "Ver")]
public class OportunidadesController : ControllerBase
{
    private readonly IOportunidadService _oportunidadService;
    private readonly ILogger<OportunidadesController> _logger;

    public OportunidadesController(
        IOportunidadService oportunidadService,
        ILogger<OportunidadesController> logger)
    {
        _oportunidadService = oportunidadService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var oportunidades = await _oportunidadService.GetAllAsync();
        return Ok(oportunidades);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var oportunidad = await _oportunidadService.GetByIdAsync(id);

        if (oportunidad is null)
            return NotFound(new { mensaje = $"Oportunidad comercial con ID {id} no encontrada." });

        return Ok(oportunidad);
    }

    [HttpPost]
    [RequirePermission("Comercial", "Crear")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Insert([FromBody] OportunidadComercialInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _oportunidadService.InsertAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id },
                new { oportunidadComercialId = id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al insertar oportunidad comercial.");
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Comercial", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(int id, [FromBody] OportunidadComercialUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _oportunidadService.UpdateAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar oportunidad comercial {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/visitas")]
    [RequirePermission("Comercial", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegistrarVisita(int id, [FromBody] VisitaOportunidadInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _oportunidadService.RegistrarVisitaAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar visita de oportunidad {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/perder")]
    [RequirePermission("Comercial", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> MarcarPerdida(int id, [FromBody] OportunidadMarcarPerdidaRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _oportunidadService.MarcarPerdidaAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al marcar oportunidad {Id} como perdida.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/cancelar")]
    [RequirePermission("Comercial", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Cancelar(int id, [FromBody] OportunidadCancelarRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _oportunidadService.CancelarAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cancelar oportunidad {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/convertir-en-pedido")]
    [RequirePermission("Comercial", "Editar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ConvertirEnPedido(int id, [FromBody] OportunidadConvertirEnPedidoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var conversion = await _oportunidadService.ConvertirEnPedidoAsync(id, request);
            return Ok(conversion);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al convertir oportunidad {Id} en pedido.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id:int}/productos")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> GuardarProducto(int id, [FromBody] OportunidadProductoRequest request)
    {
        try { await _oportunidadService.GuardarProductoAsync(id, request); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpDelete("{id:int}/productos/{productoId:int}")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> EliminarProducto(int id, int productoId)
    {
        try { await _oportunidadService.EliminarProductoAsync(id, productoId); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("{id:int}/asignar-responsable")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> AsignarResponsable(int id, [FromBody] OportunidadAsignarResponsableRequest request)
    {
        try { await _oportunidadService.AsignarResponsableAsync(id, request.UsuarioResponsableId); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpGet("lookups/estados")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstadosLookup()
    {
        var estados = await _oportunidadService.GetEstadosLookupAsync();
        return Ok(estados);
    }

    [HttpGet("lookups/motivos-perdida")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMotivosPerdidaLookup()
    {
        var motivos = await _oportunidadService.GetMotivosPerdidaLookupAsync();
        return Ok(motivos);
    }

    [HttpGet("resumen")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResumen()
    {
        var resumen = await _oportunidadService.GetResumenAsync();
        return Ok(resumen);
    }

    [HttpGet("funnel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFunnel()
    {
        var funnel = await _oportunidadService.GetFunnelAsync();
        return Ok(funnel);
    }

    [HttpGet("motivos-perdida/resumen")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMotivosPerdidaResumen()
    {
        var motivos = await _oportunidadService.GetMotivosPerdidaResumenAsync();
        return Ok(motivos);
    }

    [HttpGet("panel-comercial/resumen-mensual")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPanelComercialResumenMensual()
    {
        var resumen = await _oportunidadService.GetPanelComercialResumenMensualAsync();
        return Ok(resumen);
    }
}
