using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

public sealed class EnviarComprobanteRequest
{
    [Required, EmailAddress, MaxLength(254)]
    public string Destinatario { get; set; } = string.Empty;
}

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/comprobantes")]
public sealed class ComprobanteDocumentosController : ControllerBase
{
    private readonly ComprobanteDocumentoService _service;
    private readonly ILogger<ComprobanteDocumentosController> _logger;
    public ComprobanteDocumentosController(ComprobanteDocumentoService service,
        ILogger<ComprobanteDocumentosController> logger)
    { _service = service; _logger = logger; }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> Pdf(int id)
    {
        try
        {
            var bytes = await _service.GenerarPdfAsync(id);
            return File(bytes, "application/pdf", $"TEKA-Comprobante-{id}.pdf");
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpGet("{id:int}/envios")]
    public async Task<IActionResult> Historial(int id, CancellationToken ct)
    {
        try { return Ok(await _service.HistorialAsync(id, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("{id:int}/enviar-correo")]
    public async Task<IActionResult> Enviar(int id, [FromBody] EnviarComprobanteRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) || usuarioId <= 0)
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario." });
        try
        {
            var envioId = await _service.EnviarAsync(id, request.Destinatario, usuarioId, ct);
            return Ok(new { envioComprobanteCorreoId = envioId, estado = "ENVIADO" });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "No se completó el envío del comprobante {ComprobanteId}", id);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al enviar comprobante {ComprobanteId}", id);
            return StatusCode(500, new { mensaje = "Error interno al enviar el comprobante. Consultá el historial antes de reintentar." });
        }
    }
}
