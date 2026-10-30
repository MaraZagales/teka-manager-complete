using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Ventas", "Ver")]
[Route("api/tipos-domicilio")]
public sealed class TiposDomicilioController(TipoDomicilioService service, ILogger<TiposDomicilioController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool soloActivos = false) => Ok(await service.GetAllAsync(soloActivos));

    [HttpPost, RequirePermission("Configuración", "Ver"), RequirePermission("Ventas", "Crear")]
    public async Task<IActionResult> Insert([FromBody] TipoDomicilioRequest request)
    {
        try { var id = await service.InsertAsync(request.Nombre); return Created($"/api/tipos-domicilio/{id}", new { tipoDomicilioId = id }); }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (SqlException ex) when (ex.Number is 2601 or 2627) { return Conflict(new { mensaje = "Ya existe un tipo de domicilio con ese nombre." }); }
        catch (Exception ex) { logger.LogError(ex, "Error al registrar tipo de domicilio."); return StatusCode(500, new { mensaje = "No se pudo registrar el tipo de domicilio." }); }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await service.GetByIdAsync(id);
        return item is null ? NotFound(new { mensaje = "No se encontró el tipo de domicilio." }) : Ok(item);
    }

    [HttpPut("{id:int}"), RequirePermission("Configuración", "Ver"), RequirePermission("Ventas", "Editar")]
    public async Task<IActionResult> Update(int id, [FromBody] TipoDomicilioRequest request)
    {
        try { await service.UpdateAsync(id, request.Nombre); return NoContent(); }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (SqlException ex) when (ex.Number is 2601 or 2627) { return Conflict(new { mensaje = "Ya existe un tipo de domicilio con ese nombre." }); }
        catch (Exception ex) { logger.LogError(ex, "Error al modificar tipo de domicilio."); return StatusCode(500, new { mensaje = "No se pudo modificar el tipo de domicilio." }); }
    }

    [HttpDelete("{id:int}"), RequirePermission("Configuración", "Ver"), RequirePermission("Ventas", "Inactivar")]
    public Task<IActionResult> Inactivate(int id) => SetActive(id, false);

    [HttpPost("{id:int}/activar"), RequirePermission("Configuración", "Ver"), RequirePermission("Ventas", "Editar")]
    public Task<IActionResult> Activate(int id) => SetActive(id, true);

    private async Task<IActionResult> SetActive(int id, bool active)
    {
        try { await service.SetActiveAsync(id, active); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (Exception ex) { logger.LogError(ex, "Error al cambiar estado del tipo de domicilio."); return StatusCode(500, new { mensaje = "No se pudo cambiar el estado del tipo de domicilio." }); }
    }
}
