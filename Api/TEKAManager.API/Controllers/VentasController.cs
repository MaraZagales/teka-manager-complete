using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;
using System.Security.Claims;
using TEKAManager.API.Security;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/ventas")]
[Produces("application/json")]
public class VentasController : ControllerBase
{
    private readonly IPedidoService _pedidoService;
    private readonly ILogger<VentasController> _logger;

    public VentasController(
        IPedidoService pedidoService,
        ILogger<VentasController> logger)
    {
        _pedidoService = pedidoService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var pedidos = await _pedidoService.GetAllAsync();
        return Ok(pedidos);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await _pedidoService.GetByIdAsync(id);

        if (pedido is null)
            return NotFound(new { mensaje = $"Pedido/Venta con ID {id} no encontrado." });

        return Ok(pedido);
    }

    [HttpGet("{id:int}/saldo")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSaldo(int id)
    {
        var saldo = await _pedidoService.GetSaldoAsync(id);
        return saldo is null ? NotFound(new { mensaje = "Pedido no encontrado." }) : Ok(saldo);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Insert([FromBody] PedidoInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _pedidoService.InsertAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id },
                new { pedidoId = id }
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al insertar pedido/venta.");

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("{id:int}/confirmar-pagado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ConfirmarPagado(int id, [FromBody] PedidoConfirmarPagadoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _pedidoService.ConfirmarPagadoAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al confirmar pedido/venta {Id}.", id);

            return StatusCode(500, new
            {
                mensaje = ex.Message,
                detalle = ex.InnerException?.Message
            });
        }
    }

    [HttpPost("{id:int}/detalles")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AgregarDetalle(int id, [FromBody] PedidoDetalleInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _pedidoService.AgregarDetalleAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al agregar detalle al pedido/venta {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPut("detalles/{detalleId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ActualizarDetalle(int detalleId, [FromBody] PedidoDetalleUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _pedidoService.ActualizarDetalleAsync(detalleId, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar detalle {DetalleId}.", detalleId);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpDelete("detalles/{detalleId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> EliminarDetalle(int detalleId)
    {
        try
        {
            await _pedidoService.EliminarDetalleAsync(detalleId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar detalle {DetalleId}.", detalleId);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    /// <summary>Anula exclusivamente una venta pagada y entregada, con devolución física, reintegro y nota de crédito.</summary>
    [HttpPost("{id:int}/anulacion-integral")]
    [RequirePermission("Ventas", "Inactivar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AnularIntegral(int id, [FromBody] PedidoAnulacionIntegralRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0) return Unauthorized();
        request.UsuarioId = usuarioId;
        try
        {
            var resultado = await _pedidoService.AnularIntegralAsync(id, request);
            return Ok(resultado);
        }
        catch (PedidoAnulacionSchemaException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number >= 53000 && ex.Number <= 53999)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en anulacion integral del pedido {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo completar la anulacion integral." });
        }
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Ventas", "Inactivar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Cancelar(int id, [FromBody] PedidoCancelarRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0) return Unauthorized();
        request.UsuarioId = usuarioId;

        try
        {
            await _pedidoService.CancelarAsync(id, request);
            return NoContent();
        }
        catch (PedidoAnulacionSchemaException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number >= 53000 && ex.Number <= 53999)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cancelar pedido/venta {Id}.", id);

            return StatusCode(500, new { mensaje = "No se pudo cancelar el pedido. Consultá su estado antes de reintentar." });
        }
    }
}
