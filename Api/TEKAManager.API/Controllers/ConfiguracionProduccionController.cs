using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes="Bearer")]
[RequirePermission("Configuración","Ver")]
[Route("api/configuracion/produccion")]
public sealed class ConfiguracionProduccionController(ProductionTechnicalCatalogService service,ILogger<ConfiguracionProduccionController> logger):ControllerBase
{
    public sealed record CutTypeRequest(string Nombre);
    [HttpGet("plantillas-despiece")]
    public async Task<IActionResult> Plantillas(CancellationToken ct)=>await Read(()=>service.ListTemplatesAsync(ct));
    [HttpGet("plantillas-despiece/{id:int}")]
    public async Task<IActionResult> Plantilla(int id,CancellationToken ct){var result=await service.GetTemplateAsync(id,ct);return result is null?NotFound(new { mensaje="Plantilla inexistente." }):Ok(result);}

    [HttpPost("plantillas-despiece"),RequirePermission("Configuración","Crear")]
    public async Task<IActionResult> Crear([FromBody] TechnicalTemplateSaveRequest request,CancellationToken ct)=>await Write(async user=>new { plantillaDespieceId=await service.SaveTemplateAsync(request,user,ct) });

    [HttpPut("plantillas-despiece/{id:int}"),RequirePermission("Configuración","Editar")]
    public async Task<IActionResult> Editar(int id,[FromBody] TechnicalTemplateSaveRequest request,CancellationToken ct)=>await Write(async user=>new { plantillaDespieceId=await service.SaveTemplateAsync(request with { PlantillaDespieceId=id },user,ct) });

    [HttpPost("plantillas-despiece/{id:int}/aprobar"),RequirePermission("Configuración","Editar")]
    public async Task<IActionResult> Aprobar(int id,CancellationToken ct)=>await Write(async user=>{await service.ApproveAsync(id,user,ct);return new { plantillaDespieceId=id,estado="Aprobada" };});

    [HttpPost("plantillas-despiece/{id:int}/versiones"),RequirePermission("Configuración","Crear")]
    public async Task<IActionResult> NuevaVersion(int id,CancellationToken ct)=>await Write(async user=>new { plantillaDespieceVersionId=await service.CreateVersionAsync(id,user,ct) });

    [HttpGet("formatos-placa")]
    public async Task<IActionResult> Formatos(CancellationToken ct)=>await Read(()=>service.ListFormatsAsync(ct));

    [HttpPost("formatos-placa"),RequirePermission("Configuración","Crear")]
    [HttpPut("formatos-placa/{id:int}"),RequirePermission("Configuración","Editar")]
    public async Task<IActionResult> GuardarFormato(int? id,[FromBody] BoardFormatSaveRequest request,CancellationToken ct)=>await Write(async user=>new { formatoPlacaInsumoId=await service.SaveFormatAsync(request with { FormatoPlacaInsumoId=id??request.FormatoPlacaInsumoId },user,ct) });

    [HttpGet("parametros-corte")]
    public async Task<IActionResult> Parametros(CancellationToken ct)=>await Read(()=>service.ListParametersAsync(ct));

    [HttpPost("parametros-corte"),RequirePermission("Configuración","Crear")]
    public async Task<IActionResult> GuardarParametros([FromBody] CutParameterSaveRequest request,CancellationToken ct)=>await Write(async user=>new { parametroCorteProduccionId=await service.SaveParameterAsync(request,user,ct) });

    [HttpGet("tipos-recorte")]
    public async Task<IActionResult> TiposRecorte(CancellationToken ct)=>await Read(()=>service.ListCutTypesAsync(ct));
    [HttpPost("tipos-recorte"),RequirePermission("Configuración","Crear")]
    public async Task<IActionResult> CrearTipo([FromBody] CutTypeRequest request,CancellationToken ct)=>await Write(async _=>new { tipoRecorteId=await service.SaveCutTypeAsync(null,request.Nombre,ct) });
    [HttpPut("tipos-recorte/{id:int}"),RequirePermission("Configuración","Editar")]
    public async Task<IActionResult> EditarTipo(int id,[FromBody] CutTypeRequest request,CancellationToken ct)=>await Write(async _=>new { tipoRecorteId=await service.SaveCutTypeAsync(id,request.Nombre,ct) });
    [HttpPost("tipos-recorte/{id:int}/inactivar"),RequirePermission("Configuración","Inactivar")]
    public async Task<IActionResult> InactivarTipo(int id,CancellationToken ct)=>await Write(async _=>{await service.InactivateCutTypeAsync(id,ct);return new { tipoRecorteId=id,activo=false };});

    private async Task<IActionResult> Read<T>(Func<Task<T>> action){try{return Ok(await action());}catch(SqlException ex)when(ex.Number==208){return StatusCode(503,new { mensaje="El catalogo tecnico de Produccion todavia no fue instalado en la base de datos." });}catch(Exception ex){logger.LogError(ex,"Error al consultar configuracion de Produccion");return StatusCode(500,new { mensaje="No se pudo consultar la configuracion de Produccion." });}}
    private async Task<IActionResult> Write(Func<int,Task<object>> action){if(!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier),out var user)||user<=0)return Unauthorized();try{return Ok(await action(user));}catch(ArgumentException ex){return BadRequest(new { mensaje=ex.Message });}catch(InvalidOperationException ex){return Conflict(new { mensaje=ex.Message });}catch(SqlException ex)when(ex.Number==208){return StatusCode(503,new { mensaje="El catalogo tecnico de Produccion todavia no fue instalado en la base de datos." });}catch(SqlException ex)when(ex.Number is 2601 or 2627 or >=63100 and <=63199){return Conflict(new { mensaje=ex.Message });}catch(Exception ex){logger.LogError(ex,"Error al modificar configuracion de Produccion");return StatusCode(500,new { mensaje="No se pudo guardar la configuracion de Produccion." });}}
}
