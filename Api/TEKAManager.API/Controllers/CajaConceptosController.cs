using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.API.Services;

namespace TEKAManager.API.Controllers;

[ApiController,Authorize(AuthenticationSchemes="Bearer"),Route("api/caja-conceptos")]
public sealed class CajaConceptosController(CajaSqlService sql,ILogger<CajaConceptosController> logger):ControllerBase
{
    [HttpGet,RequirePermission("Caja","Ver")]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        try {
            var ready=await sql.ConceptosDisponiblesAsync(ct);
            var rows=ready?await sql.ConsultarCajaJsonAsync("SELECT COALESCE((SELECT c.*,CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.CajaMovimiento m WHERE m.CajaConceptoId=c.CajaConceptoId) THEN 1 ELSE 0 END AS bit) Utilizado FROM dbo.CajaConcepto c ORDER BY c.Nombre FOR JSON PATH),'[]')",[],ct):System.Text.Json.JsonSerializer.SerializeToElement(Array.Empty<object>());
            return Ok(new {disponible=ready,mensaje=ready?null:"El catálogo requiere aplicar la migración SQL aprobada.",tipos=CajaSqlService.TiposManuales,conceptos=rows});
        } catch(Exception ex) when(ex is not OperationCanceledException){logger.LogError(ex,"Consulta de conceptos de Caja");return StatusCode(500,new{mensaje="No se pudo consultar el catálogo de conceptos."});}
    }
    [HttpPost,RequirePermission("Caja","Crear")]
    public Task<IActionResult> Crear(ConceptoCajaRequest r,CancellationToken ct)=>Guardar(null,r,ct);
    [HttpPut("{id:int}"),RequirePermission("Caja","Editar")]
    public Task<IActionResult> Editar(int id,ConceptoCajaRequest r,CancellationToken ct)=>Guardar(id,r,ct);
    private Task<IActionResult> Guardar(int? id,ConceptoCajaRequest r,CancellationToken ct)
    {
        if(id<=0||string.IsNullOrWhiteSpace(r.Codigo)||r.Codigo.Length>30||string.IsNullOrWhiteSpace(r.Nombre)||r.Nombre.Length>120||!CajaSqlService.TiposManuales.Any(t=>t.Codigo==r.Tipo))
            return Task.FromResult<IActionResult>(BadRequest(new{mensaje="Revisá código (30), nombre (120) y tipo del concepto."}));
        return Write("dbo.sp_CajaConcepto_Guardar",new(){["CajaConceptoId"]=id,["Codigo"]=r.Codigo.Trim(),["Nombre"]=r.Nombre.Trim(),["Tipo"]=r.Tipo},ct);
    }
    [HttpPut("{id:int}/estado"),RequirePermission("Caja","Inactivar")]
    public Task<IActionResult> Estado(int id,ConceptoCajaEstadoRequest r,CancellationToken ct)=>id<=0||!r.Activo.HasValue?Task.FromResult<IActionResult>(BadRequest(new{mensaje="Concepto o estado inválidos."})):Write("dbo.sp_CajaConcepto_Estado",new(){["CajaConceptoId"]=id,["Activo"]=r.Activo},ct);
    private async Task<IActionResult> Write(string sp,Dictionary<string,object?> p,CancellationToken ct)
    {
        if(!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier),out var uid)||uid<=0)return Unauthorized();
        try {
            if(!await sql.ConceptosDisponiblesAsync(ct))return Conflict(new{mensaje="El catálogo requiere aplicar la migración SQL aprobada."});
            p["UsuarioId"]=uid;return Ok(await sql.EjecutarAsync(sp,p,ct));
        } catch(SqlException ex) when(ex.Number is 2601 or 2627){return Conflict(new{mensaje="Ya existe un concepto con ese código."});}
        catch(SqlException ex) when(ex.Number is >=50000 and <54000){return BadRequest(new{mensaje=ex.Message});}
        catch(Exception ex) when(ex is not OperationCanceledException){logger.LogError(ex,"Administración de conceptos de Caja");return StatusCode(500,new{mensaje="No se pudo guardar el concepto."});}
    }
}
public sealed record ConceptoCajaRequest(string? Codigo,string? Nombre,string? Tipo);
public sealed record ConceptoCajaEstadoRequest(bool? Activo);
