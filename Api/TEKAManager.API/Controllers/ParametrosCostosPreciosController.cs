using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes="Bearer")]
[RequirePermission("Costos y precios","Ver")]
[Route("api/parametros-costos-precios")]
public sealed class ParametrosCostosPreciosController : ControllerBase
{
    private readonly ParametroCostoPrecioService _service;
    private readonly CostoProductoEstimadoService _costos;
    private readonly ILogger<ParametrosCostosPreciosController> _logger;
    public ParametrosCostosPreciosController(ParametroCostoPrecioService service, CostoProductoEstimadoService costos, ILogger<ParametrosCostosPreciosController> logger)
    { _service=service; _costos=costos; _logger=logger; }

    [HttpGet("producto/{productoId:int}/costo-estimado")]
    public async Task<IActionResult> CostoEstimado(int productoId, CancellationToken ct)
    {
        try { return Ok(await _costos.CalcularAsync(productoId,ct)); }
        catch(ArgumentException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch(KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch(OverflowException) { return BadRequest(new { mensaje="El costo excede el importe permitido." }); }
        catch(SqlException ex) { _logger.LogError(ex,"Error al calcular costo estimado del producto {ProductoId}",productoId); return StatusCode(500,new { mensaje="No se pudo calcular el costo estimado." }); }
    }

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct) => Ok(await _service.ListarAsync(ct));

    [HttpPut]
    [RequirePermission("Costos y precios","Administrar")]
    public async Task<IActionResult> Guardar([FromBody] GuardarParametroCostoPrecioRequest request, CancellationToken ct)
    {
        if(!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier),out var userId) || userId<=0) return Unauthorized();
        try { return Ok(await _service.GuardarAsync(request,userId,ct)); }
        catch(ArgumentException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch(SqlException ex) when(ex.Number is 2601 or 2627) { return Conflict(new { mensaje="La configuración fue modificada por otro usuario. Actualizá la pantalla." }); }
        catch(SqlException ex) when(ex.Number==53101) { return BadRequest(new { mensaje=ex.Message }); }
        catch(SqlException ex) { _logger.LogError(ex,"Error al guardar parámetros de costos"); return StatusCode(500,new { mensaje="No se pudieron guardar los parámetros." }); }
    }

    [HttpPost("simular-con-costo-informado")]
    public async Task<IActionResult> Simular([FromBody] CalculoPrecioRequest request,CancellationToken ct)
    {
        try { return Ok(await _service.CalcularConCostoInformadoAsync(request,ct)); }
        catch(ArgumentException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch(KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch(OverflowException) { return BadRequest(new { mensaje="El cálculo excede el importe permitido." }); }
    }
}
