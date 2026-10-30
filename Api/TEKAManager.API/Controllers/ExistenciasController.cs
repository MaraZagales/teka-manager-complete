using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class ExistenciasController : ControllerBase
{
    private readonly IExistenciasHistoricoService _service;
    public ExistenciasController(IExistenciasHistoricoService service) => _service = service;

    private static bool ClaseValida(string? clase) =>
        clase is not null && (clase.Equals("PRODUCTO", StringComparison.OrdinalIgnoreCase) ||
                              clase.Equals("INSUMO", StringComparison.OrdinalIgnoreCase));
    private static bool IdValido(int? id) => !id.HasValue || id.Value > 0;

    [HttpGet("actividad")]
    public async Task<IActionResult> Actividad([FromQuery] string clase, [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta, [FromQuery] int? depositoId, [FromQuery] int? articuloId,
        [FromQuery] bool consolidarDepositos = false)
    {
        if (!ClaseValida(clase) || !desde.HasValue || !hasta.HasValue || desde.Value.Date > hasta.Value.Date ||
            hasta.Value.Date > DateTime.Today || !IdValido(depositoId) || !IdValido(articuloId))
            return BadRequest("Clase, fechas o identificadores invalidos.");
        return Ok(await _service.ActividadAsync(clase.ToUpperInvariant(), desde.Value, hasta.Value,
            depositoId, articuloId, consolidarDepositos));
    }

    [HttpGet("stock-fecha")]
    public async Task<IActionResult> StockFecha([FromQuery] string clase, [FromQuery] DateTime? fecha,
        [FromQuery] int? depositoId, [FromQuery] int? articuloId, [FromQuery] bool consolidarDepositos = false)
    {
        if (!ClaseValida(clase) || !fecha.HasValue || fecha.Value.Date > DateTime.Today ||
            !IdValido(depositoId) || !IdValido(articuloId))
            return BadRequest("Clase, fecha o identificadores invalidos.");
        return Ok(await _service.StockFechaAsync(clase.ToUpperInvariant(), fecha.Value,
            depositoId, articuloId, consolidarDepositos));
    }

    [HttpGet("evolucion")]
    public async Task<IActionResult> Evolucion([FromQuery] string clase, [FromQuery] int? articuloId,
        [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] int? depositoId, [FromQuery] string agrupacion = "DIA")
    {
        if (!ClaseValida(clase) || !articuloId.HasValue || articuloId.Value <= 0 ||
            !desde.HasValue || !hasta.HasValue || desde.Value.Date > hasta.Value.Date ||
            hasta.Value.Date > DateTime.Today || !IdValido(depositoId) ||
            !(agrupacion.Equals("DIA", StringComparison.OrdinalIgnoreCase) || agrupacion.Equals("MES", StringComparison.OrdinalIgnoreCase)))
            return BadRequest("Parametros de evolucion invalidos.");
        return Ok(await _service.EvolucionAsync(clase.ToUpperInvariant(), articuloId.Value,
            desde.Value, hasta.Value, depositoId, agrupacion.ToUpperInvariant()));
    }
}
