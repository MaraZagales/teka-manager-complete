using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/produccion")]
[Produces("application/json")]
public class ProduccionController : ControllerBase
{
    private readonly IProduccionService _produccionService;
    private readonly ILogger<ProduccionController> _logger;
    private readonly ProductionFabricationPreviewService _fabricacion;

    public ProduccionController(IProduccionService produccionService, ILogger<ProduccionController> logger,
        ProductionFabricationPreviewService fabricacion)
    {
        _produccionService = produccionService;
        _logger = logger;
        _fabricacion = fabricacion;
    }

    [HttpGet("fabricacion/plantillas"), Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Ver")]
    public async Task<IActionResult> GetPlantillasFabricacion(CancellationToken ct) =>
        Ok(await _fabricacion.GetPlantillasAsync(ct));

    [HttpGet("fabricacion/plantillas/{id:int}/validacion-aprobacion"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Ver")]
    public async Task<IActionResult> ValidarAprobacionFabricacion(int id, CancellationToken ct)
    {
        try { return Ok(await _fabricacion.CheckApprovalAsync(id, ct)); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("fabricacion/plantillas/{id:int}/aprobar"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Editar")]
    public async Task<IActionResult> AprobarPlantillaFabricacion(int id, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();
        try
        {
            await _fabricacion.ApproveTemplateAsync(id, userId, ct);
            return Ok(new { plantillaFabricacionId = id, estado = "Aprobada", bomActivada = false });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpGet("fabricacion/plantillas/{id:int}/activacion-bom"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Ver")]
    public async Task<IActionResult> ConsultarActivacionBom(int id, CancellationToken ct)
    {
        try { return Ok(await _fabricacion.CheckBomActivationAsync(id, ct)); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    public sealed record ConfirmarActivacionBomRequest(int? BomActivaAnteriorId);

    [HttpPost("fabricacion/plantillas/{id:int}/activar-bom"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Editar")]
    public async Task<IActionResult> ActivarBomDePlantilla(int id, [FromBody] ConfirmarActivacionBomRequest request, CancellationToken ct)
    {
        try
        {
            var check = await _fabricacion.CheckBomActivationAsync(id, ct);
            if (!check.PuedeActivar) return Conflict(new { mensaje = string.Join(" ", check.Bloqueantes) });
            if (check.BomActivaAnteriorId != request.BomActivaAnteriorId)
                return Conflict(new { mensaje = "La BOM activa cambió. Actualizá la consulta antes de confirmar." });
            await _produccionService.ActivarConfiguracionAsync(check.ListaMaterialesId);
            return Ok(new { listaMaterialesId = check.ListaMaterialesId, activada = true });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("fabricacion/plan-corte"), Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Ver")]
    public async Task<IActionResult> PrevisualizarPlanCorte([FromBody] FabricationPreviewRequest request, CancellationToken ct)
    {
        try { return Ok(await _fabricacion.PreviewAsync(request, ct)); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpPost("fabricacion/plantillas/{id:int}/versiones"), Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Editar")]
    public async Task<IActionResult> CrearVersionBorrador(int id,
        [FromBody] FabricationVersionRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();
        try
        {
            var created = await _fabricacion.CreateDraftVersionAsync(id, request, userId, ct);
            return Ok(new { plantillaFabricacionId = created, estado = "Borrador" });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
    }

    [HttpGet("listas-materiales")]
    public async Task<IActionResult> GetListasMateriales() => Ok(await _produccionService.GetListasMaterialesAsync());

    [HttpGet("listas-materiales/{id:int}")]
    public async Task<IActionResult> GetListaMaterialesById(int id)
    {
        var lista = await _produccionService.GetListaMaterialesByIdAsync(id);
        return lista is null ? NotFound(new { mensaje = $"Lista de materiales con ID {id} no encontrada." }) : Ok(lista);
    }

    [HttpGet("productos/{productoId:int}/listas-materiales")]
    public async Task<IActionResult> GetListasMaterialesByProducto(int productoId) =>
        Ok(await _produccionService.GetListasMaterialesByProductoAsync(productoId));

    [HttpPost("listas-materiales")]
    public async Task<IActionResult> InsertListaMateriales([FromBody] ListaMaterialesRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _produccionService.InsertListaMaterialesAsync(request);
            return CreatedAtAction(nameof(GetListaMaterialesById), new { id }, new { listaMaterialesId = id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar lista de materiales."); return StatusCode(500, Error(ex)); }
    }

    [HttpPut("listas-materiales/{id:int}")]
    public async Task<IActionResult> UpdateListaMateriales(int id, [FromBody] ListaMaterialesRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await _produccionService.UpdateListaMaterialesAsync(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al actualizar lista de materiales {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpDelete("listas-materiales/{id:int}")]
    public async Task<IActionResult> DeleteListaMateriales(int id)
    {
        try { await _produccionService.DeleteListaMaterialesAsync(id); return NoContent(); }
        catch (Exception ex) { _logger.LogError(ex, "Error al eliminar lista de materiales {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("listas-materiales/{listaId:int}/detalles")]
    public async Task<IActionResult> GetDetallesListaMateriales(int listaId) =>
        Ok(await _produccionService.GetDetallesListaMaterialesAsync(listaId));

    [HttpGet("detalles-lista-materiales/{id:int}")]
    public async Task<IActionResult> GetDetalleListaMaterialesById(int id)
    {
        var detalle = await _produccionService.GetDetalleListaMaterialesByIdAsync(id);
        return detalle is null ? NotFound(new { mensaje = $"Detalle de lista con ID {id} no encontrado." }) : Ok(detalle);
    }

    [HttpPost("listas-materiales/{listaId:int}/detalles")]
    public async Task<IActionResult> InsertDetalleListaMateriales(int listaId, [FromBody] DetalleListaMaterialesRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _produccionService.InsertDetalleListaMaterialesAsync(listaId, request);
            return CreatedAtAction(nameof(GetDetalleListaMaterialesById), new { id }, new { detalleListaMaterialesId = id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar detalle de lista {ListaId}.", listaId); return StatusCode(500, Error(ex)); }
    }

    [HttpPut("detalles-lista-materiales/{id:int}")]
    public async Task<IActionResult> UpdateDetalleListaMateriales(int id, [FromBody] DetalleListaMaterialesRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await _produccionService.UpdateDetalleListaMaterialesAsync(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al actualizar detalle de lista {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpDelete("detalles-lista-materiales/{id:int}")]
    public async Task<IActionResult> DeleteDetalleListaMateriales(int id)
    {
        try { await _produccionService.DeleteDetalleListaMaterialesAsync(id); return NoContent(); }
        catch (Exception ex) { _logger.LogError(ex, "Error al eliminar detalle de lista {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("ordenes")]
    public async Task<IActionResult> GetOrdenes() => Ok(await _produccionService.GetOrdenesAsync());

    [HttpGet("ordenes/{id:int}")]
    public async Task<IActionResult> GetOrdenById(int id)
    {
        var orden = await _produccionService.GetOrdenByIdAsync(id);
        return orden is null ? NotFound(new { mensaje = $"Orden de produccion con ID {id} no encontrada." }) : Ok(orden);
    }

    [HttpGet("ordenes/desde-diseno/{recorteDisenoId:long}/validacion"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Ver")]
    public async Task<IActionResult> ValidarOrdenDesdeDiseno(long recorteDisenoId, CancellationToken ct)
    {
        try { return Ok(await _produccionService.ValidarOrdenDesdeDisenoAsync(recorteDisenoId, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (ArgumentOutOfRangeException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al validar diseño {Id}", recorteDisenoId); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("ordenes/desde-diseno/{recorteDisenoId:long}"),
     Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Producción", "Crear"),
     RequirePermission("Recortes / GIR", "Editar")]
    public async Task<IActionResult> CrearOrdenDesdeDiseno(long recorteDisenoId, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId)) return Unauthorized();
        try
        {
            var id = await _produccionService.CrearOrdenDesdeDisenoAsync(recorteDisenoId, usuarioId, ct);
            return CreatedAtAction(nameof(GetOrdenById), new { id }, new { ordenProduccionId = id });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (ArgumentOutOfRangeException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (SqlException ex) when (ex.Number is >= 58000 and <= 64599)
        { return Conflict(new { mensaje = ex.Message }); }
        catch (Exception ex)
        { _logger.LogError(ex, "Error al crear OP desde diseño GIR {Id}", recorteDisenoId); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("ordenes")]
    public async Task<IActionResult> InsertOrden([FromBody] OrdenProduccionInsertRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _produccionService.InsertOrdenAsync(request);
            return CreatedAtAction(nameof(GetOrdenById), new { id }, new { ordenProduccionId = id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar orden de produccion."); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("ordenes/{id:int}/iniciar")]
    public async Task<IActionResult> IniciarOrden(int id, [FromBody] OrdenProduccionEstadoRequest request) =>
        await ExecuteEstado(id, request, _produccionService.IniciarOrdenAsync, "iniciar");

    [HttpPost("ordenes/{id:int}/finalizar")]
    public async Task<IActionResult> FinalizarOrden(int id, [FromBody] OrdenProduccionEstadoRequest request) =>
        await ExecuteEstado(id, request, _produccionService.FinalizarOrdenAsync, "finalizar");

    [HttpPost("ordenes/{id:int}/cancelar")]
    public async Task<IActionResult> CancelarOrden(int id, [FromBody] OrdenProduccionEstadoRequest request) =>
        await ExecuteEstado(id, request, _produccionService.CancelarOrdenAsync, "cancelar");

    [HttpGet("ordenes/{ordenId:int}/consumos")]
    public async Task<IActionResult> GetConsumosByOrden(int ordenId) => Ok(await _produccionService.GetConsumosByOrdenAsync(ordenId));

    [HttpGet("ordenes/{ordenId:int}/resultados")]
    public async Task<IActionResult> GetResultadosByOrden(int ordenId) => Ok(await _produccionService.GetResultadosByOrdenAsync(ordenId));

    [HttpPost("configuraciones/versiones")]
    public async Task<IActionResult> GuardarVersionConfiguracion([FromBody] ConfiguracionFabricacionGuardarRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { var id = await _produccionService.GuardarVersionConfiguracionAsync(request); return CreatedAtAction(nameof(GetListaMaterialesById), new { id }, new { listaMaterialesId = id }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al guardar versión de fabricación."); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("listas-materiales/{id:int}/activar")]
    public async Task<IActionResult> ActivarConfiguracion(int id) => await ExecuteSimple(() => _produccionService.ActivarConfiguracionAsync(id), "activar configuración");

    [HttpPost("listas-materiales/{id:int}/inactivar")]
    public async Task<IActionResult> InactivarConfiguracion(int id) => await ExecuteSimple(() => _produccionService.InactivarConfiguracionAsync(id), "inactivar configuración");

    [HttpGet("listas-materiales/{id:int}/recortes-previstos")]
    public async Task<IActionResult> GetRecortesPrevistosConfiguracion(int id) => Ok(await _produccionService.GetRecortesPrevistosConfiguracionAsync(id));

    [HttpGet("ordenes/{id:int}/inicio")]
    public async Task<IActionResult> GetInicioPreview(int id)
    {
        var result = await _produccionService.GetInicioPreviewAsync(id);
        return result is null ? NotFound(new { mensaje = $"Orden de producción con ID {id} no encontrada." }) : Ok(result);
    }

    [HttpGet("ordenes/{id:int}/finalizacion")]
    public async Task<IActionResult> GetFinalizacionPreview(int id)
    {
        var result = await _produccionService.GetFinalizacionPreviewAsync(id);
        return result is null ? NotFound(new { mensaje = $"Orden de producción con ID {id} no encontrada." }) : Ok(result);
    }

    [HttpGet("ordenes/{id:int}/historial")]
    public async Task<IActionResult> GetHistorialOrden(int id) => Ok(await _produccionService.GetHistorialOrdenAsync(id));

    [HttpGet("plantillas")]
    public async Task<IActionResult> GetPlantillas() => Ok(await _produccionService.GetPlantillasAsync());

    [HttpGet("plantillas/{id:int}")]
    public async Task<IActionResult> GetPlantilla(int id)
    {
        var result = await _produccionService.GetPlantillaAsync(id);
        return result is null ? NotFound(new { mensaje = $"Plantilla con ID {id} no encontrada." }) : Ok(result);
    }

    [HttpPost("plantillas")]
    public async Task<IActionResult> GuardarPlantilla([FromBody] PlantillaOrdenGuardarRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { var id = await _produccionService.GuardarPlantillaAsync(request); return CreatedAtAction(nameof(GetPlantilla), new { id }, new { plantillaOrdenProduccionId = id }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al guardar plantilla de orden."); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("plantillas/{id:int}/inactivar")]
    public async Task<IActionResult> InactivarPlantilla(int id) => await ExecuteSimple(() => _produccionService.InactivarPlantillaAsync(id), "inactivar plantilla");

    [HttpGet("reportes/consumos")]
    public async Task<IActionResult> ReporteConsumos([FromQuery] DateTime desde, [FromQuery] DateTime hasta) => await ExecuteRead(() => _produccionService.GetReporteConsumosAsync(desde, hasta), "consultar consumos de producción");

    [HttpGet("reportes/modelos")]
    public async Task<IActionResult> ReporteModelos([FromQuery] DateTime desde, [FromQuery] DateTime hasta) => await ExecuteRead(() => _produccionService.GetReporteModelosAsync(desde, hasta), "consultar producción por modelo");

    [HttpGet("reportes/recortes-consumidos")]
    public async Task<IActionResult> ReporteRecortesConsumidos([FromQuery] DateTime desde, [FromQuery] DateTime hasta) => await ExecuteRead(() => _produccionService.GetReporteRecortesConsumidosAsync(desde, hasta), "consultar recortes consumidos");

    [HttpGet("reportes/recortes-recuperados")]
    public async Task<IActionResult> ReporteRecortesRecuperados([FromQuery] DateTime desde, [FromQuery] DateTime hasta) => await ExecuteRead(() => _produccionService.GetReporteRecortesRecuperadosAsync(desde, hasta), "consultar recortes recuperados");

    private async Task<IActionResult> ExecuteRead<T>(Func<Task<IEnumerable<T>>> action, string accion)
    {
        try { return Ok(await action()); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al {Accion}.", accion); return StatusCode(500, Error(ex)); }
    }

    private async Task<IActionResult> ExecuteEstado(int id, OrdenProduccionEstadoRequest request, Func<int, OrdenProduccionEstadoRequest, Task> action, string accion)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await action(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al {Accion} orden de produccion {Id}.", accion, id); return StatusCode(500, Error(ex)); }
    }

    private async Task<IActionResult> ExecuteSimple(Func<Task> action, string accion)
    {
        try { await action(); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al {Accion}.", accion); return StatusCode(500, Error(ex)); }
    }

    private static object Error(Exception ex) => new { mensaje = ex.Message, detalle = ex.InnerException?.Message };
}
