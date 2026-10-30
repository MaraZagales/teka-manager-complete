using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[AllowAnonymous]
[EnableRateLimiting("public-commerce")]
[Route("api/ecommerce/consultas")]
public sealed class ConsultasPublicasController(IInteresComercialService service, ILogger<ConsultasPublicasController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Registrar(ConsultaPublicaRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await service.RegistrarConsultaPublicaAsync(request, cancellationToken);
            var body = new { result.InteresComercialId, result.Duplicada, mensaje = "Consulta recibida." };
            return result.Duplicada ? Ok(body) : Created("api/ecommerce/consultas/" + result.InteresComercialId, body);
        }
        catch (InvalidOperationException exception) { return BadRequest(new { mensaje = exception.Message }); }
        catch (SqlException exception) when (exception.Number == 51001) { return BadRequest(new { mensaje = exception.Message }); }
        catch (Exception exception)
        {
            logger.LogError(exception, "Error registrando consulta pública {SolicitudId}", request.SolicitudId);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { mensaje = "No se pudo registrar la consulta." });
        }
    }
}
