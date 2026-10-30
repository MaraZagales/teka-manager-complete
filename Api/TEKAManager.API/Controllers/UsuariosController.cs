using Microsoft.AspNetCore.Authorization;
using TEKAManager.API.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/usuarios")]
[Produces("application/json")]
[Authorize]
[RequirePermission("Usuarios", "Ver")]
public class UsuariosController : ControllerBase
{
    private readonly ISeguridadService _seguridadService;
    private readonly IPasswordRecoveryService _passwordRecoveryService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(
        ISeguridadService seguridadService,
        IPasswordRecoveryService passwordRecoveryService,
        ILogger<UsuariosController> logger)
    {
        _seguridadService = seguridadService;
        _passwordRecoveryService = passwordRecoveryService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var usuarios = await _seguridadService.GetUsuariosAsync();
        return Ok(usuarios);
    }

    [HttpGet("lookup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLookup()
    {
        var usuarios = await _seguridadService.GetUsuariosLookupAsync();
        return Ok(usuarios);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var usuario = await _seguridadService.GetUsuarioByIdAsync(id);

        if (usuario is null)
            return NotFound(new { mensaje = $"Usuario con ID {id} no encontrado." });

        return Ok(usuario);
    }

    [HttpPost]
    [RequirePermission("Usuarios", "Crear")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Insert([FromBody] UsuarioInsertRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id = await _seguridadService.InsertUsuarioAsync(request);
            var mailEnviado = true;
            string? mensaje = null;

            try
            {
                await _passwordRecoveryService.SolicitarAsync(new PasswordRecoveryStartRequest
                {
                    UsuarioOEmail = request.Email
                });
            }
            catch (Exception ex)
            {
                mailEnviado = false;
                mensaje = "El usuario fue creado, pero no se pudo enviar el mail para configurar la contraseña. Podés reenviarlo desde Seguridad.";
                _logger.LogWarning(ex, "Usuario {Id} creado sin poder enviar mail de configuración inicial.", id);
            }

            return CreatedAtAction(nameof(GetById), new { id }, new { usuarioId = id, mailEnviado, mensaje });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogWarning(ex, "Error SQL al insertar usuario.");
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al insertar usuario.");
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioUpdateRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _seguridadService.UpdateUsuarioAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogWarning(ex, "Error SQL al actualizar usuario {Id}.", id);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar usuario {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Usuarios", "Inactivar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(int id, [FromBody] UsuarioInactivarRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _seguridadService.DeleteUsuarioAsync(id, request);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogWarning(ex, "Error SQL al inactivar usuario {Id}.", id);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al inactivar usuario {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }

    [HttpPost("{id:int}/activar")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Activar(int id)
    {
        try
        {
            await _seguridadService.ActivarUsuarioAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (SqlException ex)
        {
            _logger.LogWarning(ex, "Error SQL al activar usuario {Id}.", id);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al activar usuario {Id}.", id);
            return StatusCode(500, new { mensaje = ex.Message, detalle = ex.InnerException?.Message });
        }
    }





    [HttpPost("{id:int}/bloquear")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Bloquear(int id)
    {
        try
        {
            await _seguridadService.BloquearUsuarioAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPost("{id:int}/desbloquear")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Desbloquear(int id)
    {
        try
        {
            await _seguridadService.DesbloquearUsuarioAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpPost("{id:int}/enviar-restablecimiento-password")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EnviarRestablecimientoPassword(int id)
    {
        try
        {
            var usuario = await _seguridadService.GetUsuarioByIdAsync(id);
            if (usuario is null)
                return NotFound(new { mensaje = "Usuario no encontrado." });

            if (!usuario.Activo)
                return BadRequest(new { mensaje = "El usuario está inactivo. Activá la cuenta antes de enviar el restablecimiento." });

            await _passwordRecoveryService.SolicitarAsync(new PasswordRecoveryStartRequest
            {
                UsuarioOEmail = usuario.Email
            });

            return Ok(new { mensaje = "Enviamos el mail para restablecer la contraseña." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar restablecimiento de contraseña para el usuario {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo enviar el mail de restablecimiento." });
        }
    }

    [HttpGet("{id:int}/roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles(int id)
    {
        var roles = await _seguridadService.GetRolesByUsuarioAsync(id);
        return Ok(roles);
    }

    [HttpPost("{id:int}/roles")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddRol(int id, [FromBody] UsuarioRolRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var usuarioRolId = await _seguridadService.AddRolToUsuarioAsync(id, request);
            return CreatedAtAction(nameof(GetRoles), new { id }, new { usuarioRolId });
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("roles/{usuarioRolId:int}")]
    [RequirePermission("Usuarios", "Editar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteRol(int usuarioRolId)
    {
        try
        {
            await _seguridadService.DeleteUsuarioRolAsync(usuarioRolId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

}
