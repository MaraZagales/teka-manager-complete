using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Costos y precios", "Ver")]
[Route("api/precios-venta")]
[Produces("application/json")]
public class PreciosVentaController : ControllerBase
{
    private readonly IPrecioVentaService _precioVentaService;
    private readonly ILogger<PreciosVentaController> _logger;
    private readonly PrecioVentaCalculoRegistroService _registroCalculo;

    public PreciosVentaController(
        IPrecioVentaService precioVentaService,
        ILogger<PreciosVentaController> logger,
        PrecioVentaCalculoRegistroService registroCalculo)
    {
        _precioVentaService = precioVentaService;
        _logger = logger;
        _registroCalculo = registroCalculo;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var precios = await _precioVentaService.GetAllAsync();
        return Ok(precios);
    }

    [HttpGet("producto/{productoId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByProducto(int productoId)
    {
        var precios = await _precioVentaService.GetByProductoAsync(productoId);
        return Ok(precios);
    }

    [HttpGet("producto/{productoId:int}/correcciones")]
    public async Task<IActionResult> GetCorrecciones(int productoId)
    {
        try { return Ok(await _precioVentaService.GetCorreccionesByProductoAsync(productoId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
    }

    [HttpGet("producto/{productoId:int}/vigente")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVigente(int productoId)
    {
        var precio = await _precioVentaService.GetVigenteAsync(productoId);

        if (precio is null)
            return NotFound(new { mensaje = $"No hay precio vigente para producto ID {productoId}." });

        return Ok(precio);
    }

    [HttpPost]
    [RequirePermission("Costos y precios", "Crear")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Insert([FromBody] PrecioVentaInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0)
                return Unauthorized();
            var id = await _precioVentaService.InsertAsync(request, usuarioId);
            return Created(string.Empty, new { precioVentaId = id });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (PrecioVentaConflictException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error al insertar precio de venta.");
            return StatusCode(500, new { mensaje = "No se pudo registrar el precio." });
        }
    }

    [HttpPost("con-calculo")]
    [RequirePermission("Costos y precios", "Crear")]
    public async Task<IActionResult> RegistrarConCalculo([FromBody] RegistrarPrecioConCalculoRequest request, CancellationToken ct)
    {
        try
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0)
                return Unauthorized();
            var id=await _registroCalculo.RegistrarAsync(request,usuarioId,ct);
            return Created(string.Empty,new { precioVentaId=id });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (SqlException ex)
        {
            _logger.LogError(ex,"Error al registrar precio con fotografía de costos.");
            return StatusCode(500,new { mensaje="No se pudo registrar el precio y su cálculo." });
        }
    }

    [HttpPost("{id:int}/correcciones")]
    [RequirePermission("Costos y precios", "Administrar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Correct(int id, [FromBody] PrecioVentaCorrectionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0)
                return Unauthorized();
            await _precioVentaService.CorrectAsync(id, request, usuarioId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (PrecioVentaConflictException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error al corregir precio de venta {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo corregir el precio." });
        }
    }
}
