using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;
using TEKAManager.API.Security;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/cobros")]
[Produces("application/json")]
public class CobrosController : ControllerBase
{
    private readonly ICobroService _cobroService;
    private readonly ILogger<CobrosController> _logger;

    public CobrosController(
        ICobroService cobroService,
        ILogger<CobrosController> logger)
    {
        _cobroService = cobroService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var cobros = await _cobroService.GetAllAsync();
        return Ok(cobros);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var cobro = await _cobroService.GetByIdAsync(id);

        if (cobro is null)
            return NotFound(new { mensaje = $"Cobro con ID {id} no encontrado." });

        return Ok(cobro);
    }

    [HttpPost, RequirePermission("Cobros", "Crear")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Registrar([FromBody] CobroRegistrarRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _cobroService.RegistrarAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id },
                new { cobroId = id }
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar cobro.");

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("{id:int}/confirmar"), RequirePermission("Cobros", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Confirmar(int id, [FromBody] CobroConfirmarRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId<=0)
            return Unauthorized();

        try
        {
            await _cobroService.ConfirmarAsync(id, request, usuarioId);
            return NoContent();
        }
        catch (CobroIntegracionSchemaException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al confirmar cobro {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpPut("{id:int}"), RequirePermission("Cobros", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ActualizarPendiente(int id, [FromBody] CobroActualizarPendienteRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId<=0)
            return Unauthorized();

        try
        {
            await _cobroService.ActualizarPendienteAsync(id, request, usuarioId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al editar cobro pendiente {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo editar el cobro. Intentá nuevamente." });
        }
    }

    [HttpDelete("{id:int}"), RequirePermission("Cobros", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Anular(int id, [FromBody] CobroAnularRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _cobroService.AnularAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al anular cobro {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("{id:int}/aplicaciones")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAplicaciones(int id)
    {
        var aplicaciones = await _cobroService.GetAplicacionesByCobroAsync(id);
        return Ok(aplicaciones);
    }

    [HttpPost("{id:int}/aplicaciones"), RequirePermission("Cobros", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Aplicar(int id, [FromBody] AplicacionCobroRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _cobroService.AplicarAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al aplicar cobro {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("cuenta-corriente")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCuentaCorriente([FromQuery] int? clienteId)
    {
        var movimientos = await _cobroService.GetCuentaCorrienteAsync(clienteId);
        return Ok(movimientos);
    }
}
