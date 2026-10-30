using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/menus")]
[Produces("application/json")]
[Authorize]
[RequirePermission("Roles y accesos", "Ver")]
public class MenusController : ControllerBase
{
    private readonly ISeguridadService _seguridadService;
    private readonly ILogger<MenusController> _logger;

    public MenusController(ISeguridadService seguridadService, ILogger<MenusController> logger)
    {
        _seguridadService = seguridadService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menus = await _seguridadService.GetMenusAsync();
        return Ok(menus);
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        var menus = await _seguridadService.GetMenusLookupAsync();
        return Ok(menus);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var menu = await _seguridadService.GetMenuByIdAsync(id);

        if (menu is null)
            return NotFound(new { mensaje = $"Menu con ID {id} no encontrado." });

        return Ok(menu);
    }

    [HttpPost]
    public async Task<IActionResult> Insert([FromBody] MenuRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _seguridadService.InsertMenuAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { menuId = id });
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] MenuRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _seguridadService.UpdateMenuAsync(id, request);
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
            await _seguridadService.DeleteMenuAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar menu {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }
}
