using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MovimientosStockController : ControllerBase
{
    private readonly IMovimientoStockService _movimientoService;
    private readonly ILogger<MovimientosStockController> _logger;

    public MovimientosStockController(
        IMovimientoStockService movimientoService,
        ILogger<MovimientosStockController> logger)
    {
        _movimientoService = movimientoService;
        _logger = logger;
    }

    // ── Consultas ──────────────────────────────────────────────

    /// <summary>Obtiene todos los movimientos de stock.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var movimientos = await _movimientoService.GetAllAsync();
        return Ok(movimientos);
    }

    /// <summary>Obtiene un movimiento de stock por ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var movimiento = await _movimientoService.GetByIdAsync(id);
        if (movimiento is null)
            return NotFound(new { mensaje = $"Movimiento con ID {id} no encontrado." });

        return Ok(movimiento);
    }

    /// <summary>Obtiene los movimientos de stock de un producto.</summary>
    [HttpGet("por-producto/{productoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByProducto(int productoId)
    {
        var movimientos = await _movimientoService.GetByProductoAsync(productoId);
        return Ok(movimientos);
    }

    /// <summary>Obtiene los movimientos de stock de un insumo.</summary>
    [HttpGet("por-insumo/{insumoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByInsumo(int insumoId)
    {
        var movimientos = await _movimientoService.GetByInsumoAsync(insumoId);
        return Ok(movimientos);
    }

    // ── Registrar movimientos ──────────────────────────────────

    /// <summary>
    /// Registra un movimiento de stock de producto (origen: proceso de negocio).
    /// Bloquea si no hay stock suficiente para una salida.
    /// </summary>
    [HttpPost("producto")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarProducto([FromBody] MovimientoProductoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.RegistrarProductoAsync(request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar movimiento de producto.");
            return StatusCode(500, new { mensaje = "Error interno. Posiblemente stock insuficiente." });
        }
    }

    /// <summary>
    /// Registra un movimiento de stock de insumo (origen: proceso de negocio).
    /// Bloquea si no hay stock suficiente para una salida.
    /// </summary>
    [HttpPost("insumo")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarInsumo([FromBody] MovimientoInsumoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.RegistrarInsumoAsync(request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar movimiento de insumo.");
            return StatusCode(500, new { mensaje = "Error interno. Posiblemente stock insuficiente." });
        }
    }

    /// <summary>
    /// Registra un ajuste manual de stock de producto.
    /// El motivo es OBLIGATORIO para trazabilidad.
    /// </summary>
    [HttpPost("producto/manual")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarProductoManual([FromBody] MovimientoProductoManualRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.RegistrarProductoManualAsync(request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar ajuste manual de producto.");
            return StatusCode(500, new { mensaje = "Error interno al registrar ajuste manual." });
        }
    }

    /// <summary>
    /// Registra un ajuste manual de stock de insumo.
    /// El motivo es OBLIGATORIO para trazabilidad.
    /// </summary>
    [HttpPost("insumo/manual")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarInsumoManual([FromBody] MovimientoInsumoManualRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.RegistrarInsumoManualAsync(request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar ajuste manual de insumo.");
            return StatusCode(500, new { mensaje = "Error interno al registrar ajuste manual." });
        }
    }

    // ── Anulaciones ────────────────────────────────────────────

    /// <summary>
    /// Anula un movimiento de stock de producto.
    /// Genera una reversa automática. No se puede anular dos veces.
    /// </summary>
    [HttpPost("{id:int}/anular/producto")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AnularProducto(int id, [FromBody] AnularMovimientoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.AnularProductoAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al anular movimiento de producto {Id}.", id);
            return StatusCode(500, new { mensaje = "Error interno al anular el movimiento." });
        }
    }

    /// <summary>
    /// Anula un movimiento de stock de insumo.
    /// Genera una reversa automática. No se puede anular dos veces.
    /// </summary>
    [HttpPost("{id:int}/anular/insumo")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AnularInsumo(int id, [FromBody] AnularMovimientoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _movimientoService.AnularInsumoAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            _logger.LogWarning(ex, "Regla de negocio de inventario rechazada: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 547 or 2601 or 2627)
        {
            _logger.LogWarning(ex, "Restricción de integridad al operar inventario: {Numero}.", ex.Number);
            return BadRequest(new { mensaje = "La operación no cumple las restricciones de integridad del inventario." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al anular movimiento de insumo {Id}.", id);
            return StatusCode(500, new { mensaje = "Error interno al anular el movimiento." });
        }
    }
}
