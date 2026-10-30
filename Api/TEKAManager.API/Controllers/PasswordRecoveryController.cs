using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/auth/password-recovery")]
public class PasswordRecoveryController : ControllerBase
{
    private readonly IPasswordRecoveryService _service;
    private readonly ILogger<PasswordRecoveryController> _logger;

    public PasswordRecoveryController(
        IPasswordRecoveryService service,
        ILogger<PasswordRecoveryController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestPasswordRecovery(
        [FromBody] PasswordRecoveryStartRequest request)
    {
        try
        {
            await _service.SolicitarAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "No se pudo procesar el correo de recuperación.");
        }

        return Ok(new
        {
            mensaje = "Si existe una cuenta activa asociada a esos datos, te enviaremos un enlace para recuperar el acceso."
        });
    }

    [HttpGet("validate")]
    public async Task<IActionResult> Validate([FromQuery] string token)
    {
        return Ok(new
        {
            valido = await _service.ValidarTokenAsync(token)
        });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset(
        [FromBody] PasswordRecoveryResetRequest request)
    {
        try
        {
            await _service.RestablecerAsync(request);

            return Ok(new
            {
                mensaje = "Contraseña actualizada correctamente. Ya podés iniciar sesión."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                mensaje = ex.Message
            });
        }
    }
}