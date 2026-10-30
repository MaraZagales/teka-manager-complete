using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/roles")]
[Produces("application/json")]
[Authorize]
[RequirePermission("Roles y accesos", "Ver")]
public class RolesController : ControllerBase
{
    private readonly ISeguridadService _seguridadService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(ISeguridadService seguridadService, ILogger<RolesController> logger)
    {
        _seguridadService = seguridadService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _seguridadService.GetRolesAsync();
        return Ok(roles);
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        var roles = await _seguridadService.GetRolesLookupAsync();
        return Ok(roles);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var rol = await _seguridadService.GetRolByIdAsync(id);

        if (rol is null)
            return NotFound(new { mensaje = $"Rol con ID {id} no encontrado." });

        return Ok(rol);
    }

    [HttpPost]
    [RequirePermission("Roles y accesos", "Crear")]
    public async Task<IActionResult> Insert([FromBody] RolRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _seguridadService.InsertRolAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { rolId = id });
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Roles y accesos", "Editar")]
    public async Task<IActionResult> Update(int id, [FromBody] RolRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _seguridadService.UpdateRolAsync(id, request);
            return NoContent();
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Roles y accesos", "Inactivar")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _seguridadService.DeleteRolAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar rol {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpGet("{id:int}/permisos")]
    public async Task<IActionResult> GetPermisos(int id)
    {
        try
        {
            var permisos = await _seguridadService.GetPermisosByRolAsync(id);
            return Ok(permisos);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPost("{id:int}/permisos")]
    [RequirePermission("Roles y accesos", "Administrar")]
    public async Task<IActionResult> AddPermiso(int id, [FromBody] RolPermisoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var rolPermisoId = await _seguridadService.AddPermisoToRolAsync(id, request);
            return CreatedAtAction(nameof(GetPermisos), new { id }, new { rolPermisoId });
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("permisos/{rolPermisoId:int}")]
    [RequirePermission("Roles y accesos", "Administrar")]
    public async Task<IActionResult> DeletePermiso(int rolPermisoId)
    {
        try
        {
            await _seguridadService.DeleteRolPermisoAsync(rolPermisoId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al quitar permiso de rol {Id}.", rolPermisoId);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }
}
