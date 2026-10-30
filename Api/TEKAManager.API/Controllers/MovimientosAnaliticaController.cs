using Microsoft.AspNetCore.Mvc;
using TEKAManager.Core.Services;
namespace TEKAManager.API.Controllers;
[ApiController]
[Route("api/MovimientosStock/analitica")]
public sealed class MovimientosAnaliticaController : ControllerBase {
 private readonly MovimientosAnaliticaService _service;
 public MovimientosAnaliticaController(MovimientosAnaliticaService service) => _service=service;
 private static string? Normalizar(string? valor) => string.IsNullOrWhiteSpace(valor)?null:valor.Trim();
 private static string? Error(DateTime desde,DateTime hasta,string? clase,string? estado,string? modalidad,int? articuloId,int pagina,int tamanoPagina,string? buscar) {
  if(desde==default || hasta==default || hasta<desde || hasta.Date==DateTime.MaxValue.Date) return "Periodo invalido.";
  if(clase is not null && clase!="PRODUCTO" && clase!="INSUMO") return "Clase invalida.";
  if(estado is not null && estado!="VIGENTE" && estado!="ANULADO" && estado!="REVERSA") return "Estado invalido.";
  if(modalidad is not null && modalidad!="MANUAL" && modalidad!="AUTOMATICO" && modalidad!="REVERSA") return "Modalidad invalida.";
  if(articuloId.HasValue && clase is null) return "Para filtrar por articuloId, indicar clase.";
  if(pagina<1 || tamanoPagina<1 || tamanoPagina>100) return "Paginacion invalida.";
  if(buscar?.Length>120) return "Buscar supera 120 caracteres.";
  return null;
 }
 [HttpGet("movimientos")]
 public async Task<IActionResult> Movimientos([FromQuery] DateTime desde,[FromQuery] DateTime hasta,[FromQuery] string? clase=null,[FromQuery] int? depositoId=null,[FromQuery] int? articuloId=null,[FromQuery] string? origen=null,[FromQuery] string? estado=null,[FromQuery] string? modalidad=null,[FromQuery] string? buscar=null,[FromQuery] int pagina=1,[FromQuery] int tamanoPagina=25) {
  clase=Normalizar(clase)?.ToUpperInvariant();estado=Normalizar(estado)?.ToUpperInvariant();modalidad=Normalizar(modalidad)?.ToUpperInvariant();origen=Normalizar(origen);buscar=Normalizar(buscar);
  var error=Error(desde,hasta,clase,estado,modalidad,articuloId,pagina,tamanoPagina,buscar);
  if(error is not null) return BadRequest(new{mensaje=error});
  var items=await _service.Consultar(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar,pagina,tamanoPagina);
  return Ok(new{pagina,tamanoPagina,totalFilas=items.Count>0?items[0].TotalFilas:0,items});
 }
 [HttpGet("resumen")]
 public async Task<IActionResult> Resumen([FromQuery] DateTime desde,[FromQuery] DateTime hasta,[FromQuery] string? clase=null,[FromQuery] int? depositoId=null,[FromQuery] int? articuloId=null,[FromQuery] string? origen=null,[FromQuery] string? estado=null,[FromQuery] string? modalidad=null,[FromQuery] string? buscar=null) {
  clase=Normalizar(clase)?.ToUpperInvariant();estado=Normalizar(estado)?.ToUpperInvariant();modalidad=Normalizar(modalidad)?.ToUpperInvariant();origen=Normalizar(origen);buscar=Normalizar(buscar);
  var error=Error(desde,hasta,clase,estado,modalidad,articuloId,1,25,buscar);if(error is not null)return BadRequest(new{mensaje=error});
  return Ok(await _service.Resumen(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar));
 }
 [HttpGet("series")]
 public async Task<IActionResult> Series([FromQuery] DateTime desde,[FromQuery] DateTime hasta,[FromQuery] string? clase=null,[FromQuery] int? depositoId=null,[FromQuery] int? articuloId=null,[FromQuery] string? origen=null,[FromQuery] string? estado=null,[FromQuery] string? modalidad=null,[FromQuery] string? buscar=null) {
  clase=Normalizar(clase)?.ToUpperInvariant();estado=Normalizar(estado)?.ToUpperInvariant();modalidad=Normalizar(modalidad)?.ToUpperInvariant();origen=Normalizar(origen);buscar=Normalizar(buscar);
  var error=Error(desde,hasta,clase,estado,modalidad,articuloId,1,25,buscar);if(error is not null)return BadRequest(new{mensaje=error});
  return Ok(await _service.Series(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar));
 }
}
