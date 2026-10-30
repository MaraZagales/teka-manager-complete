using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/recortes")]
[Produces("application/json")]
public class RecortesController : ControllerBase
{
    private readonly IRecorteService _recorteService;
    private readonly ILogger<RecortesController> _logger;

    public RecortesController(IRecorteService recorteService, ILogger<RecortesController> logger)
    {
        _recorteService = recorteService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _recorteService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var recorte = await _recorteService.GetByIdAsync(id);
        return recorte is null ? NotFound(new { mensaje = $"Recorte con ID {id} no encontrado." }) : Ok(recorte);
    }

    [HttpPost]
    public async Task<IActionResult> Insert([FromBody] RecorteRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _recorteService.InsertAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { recorteId = id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar recorte."); return StatusCode(500, Error(ex)); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RecorteRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await _recorteService.UpdateAsync(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al actualizar recorte {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpPost("{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] RecorteCambiarEstadoRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await _recorteService.CambiarEstadoAsync(id, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al cambiar estado de recorte {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock() => Ok(await _recorteService.GetStockAsync());

    [HttpGet("{recorteId:int}/stock")]
    public async Task<IActionResult> GetStockByRecorte(int recorteId) => Ok(await _recorteService.GetStockByRecorteAsync(recorteId));

    [HttpGet("movimientos")]
    public async Task<IActionResult> GetMovimientos() => Ok(await _recorteService.GetMovimientosAsync());

    [HttpGet("{recorteId:int}/movimientos")]
    public async Task<IActionResult> GetMovimientosByRecorte(int recorteId) => Ok(await _recorteService.GetMovimientosByRecorteAsync(recorteId));

    [HttpPost("{recorteId:int}/movimientos")]
    public async Task<IActionResult> RegistrarMovimiento(int recorteId, [FromBody] MovimientoRecorteRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try { await _recorteService.RegistrarMovimientoAsync(recorteId, request); return NoContent(); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al registrar movimiento de recorte {RecorteId}.", recorteId); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("{recorteId:int}/historial")]
    public async Task<IActionResult> GetHistorial(int recorteId) => Ok(await _recorteService.GetHistorialAsync(recorteId));

    [HttpGet("ordenes/{ordenId:int}/consumos")]
    public async Task<IActionResult> GetConsumosByOrden(int ordenId) => Ok(await _recorteService.GetConsumosByOrdenAsync(ordenId));

    [HttpGet("sugerencias")]
    public async Task<IActionResult> GetSugerencias() => Ok(await _recorteService.GetSugerenciasAsync());

    [HttpGet("sugerencias/{id:int}")]
    public async Task<IActionResult> GetSugerenciaById(int id)
    {
        var sugerencia = await _recorteService.GetSugerenciaByIdAsync(id);
        return sugerencia is null ? NotFound(new { mensaje = $"Sugerencia con ID {id} no encontrada." }) : Ok(sugerencia);
    }

    [HttpPost("sugerencias")]
    public async Task<IActionResult> InsertSugerencia([FromBody] SugerenciaRecorteRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _recorteService.InsertSugerenciaAsync(request);
            return CreatedAtAction(nameof(GetSugerenciaById), new { id }, new { sugerenciaRecorteId = id });
        }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar sugerencia de recorte."); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("sugerencias/{sugerenciaId:int}/productos")]
    public async Task<IActionResult> GetProductosSugeridos(int sugerenciaId) => Ok(await _recorteService.GetProductosSugeridosAsync(sugerenciaId));

    [HttpGet("productos-sugeridos/{id:int}")]
    public async Task<IActionResult> GetProductoSugeridoById(int id)
    {
        var item = await _recorteService.GetProductoSugeridoByIdAsync(id);
        return item is null ? NotFound(new { mensaje = $"Producto sugerido con ID {id} no encontrado." }) : Ok(item);
    }

    [HttpPost("sugerencias/{sugerenciaId:int}/productos")]
    public async Task<IActionResult> InsertProductoSugerido(int sugerenciaId, [FromBody] RecorteProductoSugeridoRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var id = await _recorteService.InsertProductoSugeridoAsync(sugerenciaId, request);
            return CreatedAtAction(nameof(GetProductoSugeridoById), new { id }, new { recorteProductoSugeridoId = id });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) { _logger.LogError(ex, "Error al insertar producto sugerido de recorte."); return StatusCode(500, Error(ex)); }
    }

    [HttpDelete("productos-sugeridos/{id:int}")]
    public async Task<IActionResult> DeleteProductoSugerido(int id)
    {
        try { await _recorteService.DeleteProductoSugeridoAsync(id); return NoContent(); }
        catch (Exception ex) { _logger.LogError(ex, "Error al eliminar producto sugerido {Id}.", id); return StatusCode(500, Error(ex)); }
    }

    [HttpGet("sugerencias-disponibles-para-orden")]
    public async Task<IActionResult> GetSugerenciasDisponiblesParaOrden() =>
        Ok(await _recorteService.GetSugerenciasDisponiblesParaOrdenAsync());

    private static object Error(Exception ex) => new { mensaje = ex.Message, detalle = ex.InnerException?.Message };
}
