using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/comprobantes")]
[Produces("application/json")]
public class ComprobantesController : ControllerBase
{
    private readonly IComprobanteService _comprobanteService;
    private readonly ILogger<ComprobantesController> _logger;

    public ComprobantesController(
        IComprobanteService comprobanteService,
        ILogger<ComprobantesController> logger)
    {
        _comprobanteService = comprobanteService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var comprobantes = await _comprobanteService.GetAllAsync();
        return Ok(comprobantes);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var comprobante = await _comprobanteService.GetByIdAsync(id);

        if (comprobante is null)
            return NotFound(new { mensaje = $"Comprobante con ID {id} no encontrado." });

        return Ok(comprobante);
    }

    [HttpPost("desde-pedido")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> InsertDesdePedido([FromBody] ComprobanteDesdePedidoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _comprobanteService.InsertDesdePedidoAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { comprobanteId = id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al emitir comprobante desde pedido {PedidoId}.", request.PedidoId);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/nota-credito")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> EmitirNotaCredito(int id, [FromBody] NotaComprobanteRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var notaId = await _comprobanteService.EmitirNotaCreditoAsync(id, request);
            return CreatedAtAction(nameof(GetById), new { id = notaId }, new { comprobanteId = notaId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al emitir nota de credito desde comprobante {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/nota-debito")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> EmitirNotaDebito(int id, [FromBody] NotaComprobanteRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var notaId = await _comprobanteService.EmitirNotaDebitoAsync(id, request);
            return CreatedAtAction(nameof(GetById), new { id = notaId }, new { comprobanteId = notaId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al emitir nota de debito desde comprobante {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }
}
