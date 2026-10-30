using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/permisos")]
[Produces("application/json")]
[Authorize]
[RequirePermission("Roles y accesos", "Ver")]
public class PermisosController : ControllerBase
{
    private readonly ISeguridadService _seguridadService;
    private readonly ILogger<PermisosController> _logger;

    public PermisosController(ISeguridadService seguridadService, ILogger<PermisosController> logger)
    {
        _seguridadService = seguridadService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var permisos = await _seguridadService.GetPermisosAsync();
        return Ok(permisos);
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        var permisos = await _seguridadService.GetPermisosLookupAsync();
        return Ok(permisos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var permiso = await _seguridadService.GetPermisoByIdAsync(id);

        if (permiso is null)
            return NotFound(new { mensaje = $"Permiso con ID {id} no encontrado." });

        return Ok(permiso);
    }

    [HttpPost]
    public async Task<IActionResult> Insert([FromBody] PermisoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _seguridadService.InsertPermisoAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { permisoId = id });
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PermisoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _seguridadService.UpdatePermisoAsync(id, request);
            return NoContent();
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _seguridadService.DeletePermisoAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar permiso {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }
}
