using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Authorization;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IJwtTokenService _tokens;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, IJwtTokenService tokens)
    {
        _authService = authService;
        _logger = logger;
        _tokens = tokens;
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var ipOrigen = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.LoginAsync(request, ipOrigen);
            if (result.Exitoso && result.Usuario is not null) result.AccessToken = _tokens.Create(result.Usuario);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error SQL al iniciar sesion para {Username}.", request.Username);
            return StatusCode(500, new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al iniciar sesion para {Username}.", request.Username);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _authService.CerrarSesionAsync(request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error SQL al cerrar sesion {AuditoriaSesionId}.", request.AuditoriaSesionId);
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("usuarios/{usuarioId:int}/permisos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPermisosEfectivos(int usuarioId)
    {
        try
        {
            var permisos = await _authService.GetPermisosEfectivosAsync(usuarioId);
            return Ok(permisos);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error SQL al obtener permisos efectivos del usuario {UsuarioId}.", usuarioId);
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("usuarios/{usuarioId:int}/menus/{menuId:int}/acceso")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ValidarAccesoMenu(int usuarioId, int menuId, [FromQuery] string permiso)
    {
        try
        {
            var acceso = await _authService.ValidarAccesoMenuAsync(usuarioId, menuId, permiso);
            return Ok(acceso);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogError(ex, "Error SQL al validar acceso del usuario {UsuarioId} al menu {MenuId}.", usuarioId, menuId);
            return StatusCode(500, new { mensaje = ex.Message });
        }
    }
}
