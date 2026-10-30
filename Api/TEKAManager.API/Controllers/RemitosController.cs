using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/remitos")]
[Produces("application/json")]
public class RemitosController : ControllerBase
{
    private readonly IRemitoService _remitoService;
    private readonly ILogger<RemitosController> _logger;

    public RemitosController(
        IRemitoService remitoService,
        ILogger<RemitosController> logger)
    {
        _remitoService = remitoService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var remitos = await _remitoService.GetAllAsync();
        return Ok(remitos);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var remito = await _remitoService.GetByIdAsync(id);

        if (remito is null)
            return NotFound(new { mensaje = $"Remito con ID {id} no encontrado." });

        return Ok(remito);
    }

    [HttpPost("desde-pedido")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> InsertDesdePedido([FromBody] RemitoDesdePedidoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _remitoService.InsertDesdePedidoAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { remitoId = id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al emitir remito desde pedido {PedidoId}.", request.PedidoId);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] RemitoEditarRequest request)
    {
        try { await _remitoService.EditarAsync(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number >= 53100 && ex.Number <= 53199)
        { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("{id:int}/anular")]
    public async Task<IActionResult> Anular(int id, [FromBody] RemitoAnularRequest request)
    {
        try { await _remitoService.AnularAsync(id, request, User.Identity?.Name ?? User.FindFirst("sub")?.Value); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number >= 53100 && ex.Number <= 53199)
        { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("{id:int}/marcar-entregado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> MarcarEntregado(int id, [FromBody] RemitoMarcarEntregadoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _remitoService.MarcarEntregadoAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al marcar entregado remito {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }
}
