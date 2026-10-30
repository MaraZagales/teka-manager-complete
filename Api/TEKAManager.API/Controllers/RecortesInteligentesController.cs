using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using TEKAManager.API.Services;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/recortes-inteligentes")]
[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Recortes / GIR", "Ver")]
public sealed class RecortesInteligentesController(RecorteDisenoService service,
    RecorteSnapshotService snapshots, RecorteMotorGeneracionService motor,
    IRecorteGeneradorPropuestas proveedor, IOptions<OpenAiRecorteOptions> options,
    IRecorteImagenes imagenes, IRecorteGeneracionGate gate, IConfiguration configuration,
    ILogger<RecortesInteligentesController> logger) : ControllerBase
{
    public sealed record GenerarRequest(Guid SolicitudUid, IReadOnlyList<int> RecorteIds);
    public sealed record EvidenciaCertificacion(long MotivoId, string Evidencia);
    public sealed record CertificarRequest(IReadOnlyList<EvidenciaCertificacion> Evidencias);
    public sealed record VincularRecetaRequest(int ProductoId, int ListaMaterialesId, int PlantillaFabricacionId);
    private bool ProveedorConfigurado => options.Value.Enabled &&
        (!string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"]) ||
         !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OPENAI_API_KEY")));

    [HttpGet("imagenes/{generacionId:long}/{archivo}")]
    public async Task<IActionResult> Imagen(long generacionId, string archivo, CancellationToken ct)
    {
        var data = await imagenes.LeerAutorizadaAsync(generacionId, archivo, ct);
        Response.Headers.CacheControl = "private, max-age=300";
        return data is null ? NotFound() : File(data, "image/webp");
    }

    [HttpGet("configuracion")]
    public async Task<IActionResult> Configuracion(CancellationToken ct) => Ok(new
    {
        habilitado = ProveedorConfigurado,
        maxPropuestas = 5, maxRecortes = options.Value.MaxRecortes,
        maxImagenes = options.Value.ImagesEnabled ? options.Value.MaxImages : 0,
        circuitoFabricacionHabilitado = await service.CircuitoFabricacionInstaladoAsync(ct),
        pendingTimeoutMinutes = options.Value.PendingTimeoutMinutes,
        imagenesHabilitadas = ProveedorConfigurado && options.Value.ImagesEnabled && options.Value.MaxImages > 0 &&
            !string.IsNullOrWhiteSpace(options.Value.ImageModel),
        motivoImagenes = !options.Value.ImagesEnabled ? "La generación de imágenes está desactivada en el servidor."
            : options.Value.MaxImages == 0 || string.IsNullOrWhiteSpace(options.Value.ImageModel)
                ? "Falta configurar el modelo o el límite de imágenes." : !ProveedorConfigurado
                    ? "El proveedor de OpenAI no está configurado." : null
    });

    [HttpGet("recortes-elegibles")]
    public async Task<IActionResult> Elegibles(CancellationToken ct)
    {
        var rows = await snapshots.ConsultarElegiblesAsync(ct);
        return Ok(new { total = rows.Count, recortes = rows });
    }

    [HttpPost("generaciones")]
    [EnableRateLimiting("recortes-generation")]
    [RequirePermission("Recortes / GIR", "Crear")]
    public async Task<IActionResult> Generar([FromBody] GenerarRequest request, CancellationToken ct)
    {
        if (!ProveedorConfigurado)
            return StatusCode(503, new { mensaje = "La generación con OpenAI no está habilitada." });
        if (request.SolicitudUid == Guid.Empty) return BadRequest(new { mensaje = "Solicitud inválida." });
        if (request.RecorteIds is null || request.RecorteIds.Count is < 1 or > 100 ||
            request.RecorteIds.Count > options.Value.MaxRecortes ||
            request.RecorteIds.Any(id => id <= 0) ||
            request.RecorteIds.Distinct().Count() != request.RecorteIds.Count)
            return BadRequest(new { mensaje = "Seleccioná recortes únicos y respetá el límite configurado." });
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        try
        {
            var id = await motor.GenerarAsync(request.SolicitudUid, userId, request.RecorteIds, proveedor, ct);
            return Ok(await service.GeneracionAsync(id, ct));
        }
        catch (RecorteGeneracionEnCursoException)
        { return Conflict(new { mensaje = "La generación ya está en curso. Consultá su estado antes de reintentar." }); }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Conflicto al generar propuestas de recortes");
            return Conflict(new { mensaje = "La selección cambió o la solicitud ya tiene otro resultado. Actualizá los recortes elegibles y volvé a intentarlo." });
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al generar propuestas de recortes");
            return StatusCode(500, new { mensaje = "No se pudo completar la generación." });
        }
    }

    [HttpGet("generaciones/{id:long}")]
    public async Task<IActionResult> Generacion(long id, CancellationToken ct)
    {
        var row = await service.GeneracionAsync(id, ct);
        return row is null ? NotFound(new { mensaje = "Generación no encontrada." }) : Ok(row);
    }

    [HttpGet("generaciones")]
    public async Task<IActionResult> Generaciones([FromQuery] int pagina = 1, [FromQuery] int tamano = 50,
        CancellationToken ct = default) => PaginaValida(pagina, tamano)
        ? Ok(await service.GeneracionesAsync(pagina, tamano, ct)) : BadRequest(new { mensaje = "Paginacion invalida." });

    [HttpPost("generaciones/recuperar-pendientes")]
    [RequirePermission("Recortes / GIR", "Editar")]
    public async Task<IActionResult> RecuperarPendientes(CancellationToken ct)
    {
        var recovered = 0;
        foreach (var item in await service.PendientesObsoletasAsync(options.Value.PendingTimeoutMinutes, ct))
        {
            try
            {
                await using var generationLock = await gate.EntrarAsync(item.SolicitudUid, ct);
                recovered += await service.MarcarErrorAsync(item.Id, item.SolicitudUid, item.UsuarioId,
                    "GENERACION_INTERRUMPIDA", "La generación se interrumpió antes de guardar un resultado.", ct);
            }
            catch (RecorteGeneracionEnCursoException) { /* La solicitud sigue ejecutándose. */ }
        }
        return Ok(new { recuperadas = recovered });
    }

    [HttpGet("propuestas")]
    public async Task<IActionResult> Propuestas([FromQuery] int pagina = 1, [FromQuery] int tamano = 50,
        CancellationToken ct = default) => PaginaValida(pagina, tamano)
        ? Ok(await service.PropuestasAsync(pagina, tamano, ct)) : BadRequest(new { mensaje = "Paginacion invalida." });

    [HttpGet("propuestas/{id:long}")]
    public async Task<IActionResult> Detalle(long id, CancellationToken ct)
    {
        var detail = await service.DetalleAsync(id, ct);
        return detail is null ? NotFound(new { mensaje = "Propuesta no encontrada." }) : Ok(detail);
    }

    [HttpGet("propuestas/{id:long}/piezas")]
    public async Task<IActionResult> Piezas(long id, CancellationToken ct) => Ok(await service.PiezasAsync(id, ct));

    [HttpGet("propuestas/{id:long}/asignaciones")]
    public async Task<IActionResult> Asignaciones(long id, CancellationToken ct) => Ok(await service.AsignacionesAsync(id, ct));

    [HttpGet("propuestas/{id:long}/validaciones")]
    public async Task<IActionResult> Validaciones(long id, CancellationToken ct) => Ok(await service.ValidacionesAsync(id, ct));

    [HttpGet("catalogo")]
    public async Task<IActionResult> Catalogo([FromQuery] int pagina = 1, [FromQuery] int tamano = 50,
        CancellationToken ct = default) => PaginaValida(pagina, tamano)
        ? Ok(await service.CatalogoAsync(pagina, tamano, ct)) : BadRequest(new { mensaje = "Paginacion invalida." });

    private static bool PaginaValida(int page, int size) => page > 0 && size is >= 1 and <= 200 &&
        (long)(page - 1) * size <= int.MaxValue;

    [HttpPost("propuestas/{id:long}/aprobar")]
    [RequirePermission("Recortes / GIR", "Editar")]
    public Task<IActionResult> Aprobar(long id, CancellationToken ct) => Decidir(id, "Aprobar", null, ct);

    [HttpPost("propuestas/{id:long}/certificar")]
    [RequirePermission("Recortes / GIR", "Editar")]
    public async Task<IActionResult> Certificar(long id, [FromBody] CertificarRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        if (!await service.CircuitoFabricacionInstaladoAsync(ct))
            return StatusCode(503, new { mensaje = "La certificación requiere aplicar el incremental GIR aprobado." });
        try
        {
            await service.CertificarAsync(id, userId,
                request.Evidencias?.Select(x => (x.MotivoId, x.Evidencia)).ToArray() ?? [], ct);
            return NoContent();
        }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (SqlException ex) when (ex.Number is >= 64520 and <= 64541)
        { return Conflict(new { mensaje = ex.Message }); }
        catch (Exception ex)
        { logger.LogError(ex, "Error al certificar diseño {Id}", id); return StatusCode(500, new { mensaje = "No se pudo certificar el diseño." }); }
    }

    [HttpPost("propuestas/{id:long}/vincular-receta")]
    [RequirePermission("Recortes / GIR", "Editar")]
    [RequirePermission("Producción", "Editar")]
    public async Task<IActionResult> VincularReceta(long id, [FromBody] VincularRecetaRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        if (!await service.CircuitoFabricacionInstaladoAsync(ct))
            return StatusCode(503, new { mensaje = "El vínculo con Producción requiere aplicar el incremental GIR aprobado." });
        try
        {
            await service.VincularRecetaAsync(id, request.ProductoId, request.ListaMaterialesId,
                request.PlantillaFabricacionId, userId, ct);
            return NoContent();
        }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (SqlException ex) when (ex.Number is >= 64550 and <= 64562)
        { return Conflict(new { mensaje = ex.Message }); }
        catch (Exception ex)
        { logger.LogError(ex, "Error al vincular receta GIR {Id}", id); return StatusCode(500, new { mensaje = "No se pudo vincular la receta." }); }
    }

    [HttpPost("propuestas/{id:long}/rechazar")]
    [RequirePermission("Recortes / GIR", "Editar")]
    public Task<IActionResult> Rechazar(long id, [FromBody] RecorteDisenoDecision request, CancellationToken ct) =>
        Decidir(id, "Rechazar", request.Motivo, ct);

    [HttpPost("propuestas/{id:long}/descartar")]
    [RequirePermission("Recortes / GIR", "Editar")]
    public Task<IActionResult> Descartar(long id, [FromBody] RecorteDisenoDecision request, CancellationToken ct) =>
        Decidir(id, "Descartar", request.Motivo, ct);

    private async Task<IActionResult> Decidir(long id, string action, string? reason, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)) return Unauthorized();
        try
        {
            await service.DecidirAsync(id, action, userId, reason, ct);
            return NoContent();
        }
        catch (SqlException ex) when (ex.Number is >= 64110 and <= 64116)
        {
            return ex.Number == 64112 ? NotFound(new { mensaje = ex.Message }) : Conflict(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al decidir propuesta {PropuestaId}", id);
            return StatusCode(500, new { mensaje = "No se pudo registrar la decision." });
        }
    }
}
