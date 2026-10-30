using Microsoft.AspNetCore.Authorization; using Microsoft.AspNetCore.Mvc; using TEKAManager.API.Security; using TEKAManager.Core.Requests; using TEKAManager.Core.Services;
namespace TEKAManager.API.Controllers;
[ApiController,Route("api/intereses-comerciales"),Authorize,RequirePermission("Comercial","Ver")]
public class InteresesComercialesController(IInteresComercialService service):ControllerBase {
 [HttpGet] public async Task<IActionResult> GetAll()=>Ok(await service.GetAllAsync());
 [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id){var item=await service.GetByIdAsync(id);return item is null?NotFound(new{mensaje="Consulta comercial no encontrada."}):Ok(item);}
 [HttpPost,RequirePermission("Comercial","Crear")] public async Task<IActionResult> Insert(InteresComercialInsertRequest r){try{var id=await service.InsertAsync(r);return Created($"api/intereses-comerciales/{id}",new{interesComercialId=id});}catch(Exception e){return BadRequest(new{mensaje=e.Message});}}
 [HttpPut("{id:int}"),RequirePermission("Comercial","Editar")] public async Task<IActionResult> Update(int id,InteresComercialUpdateRequest r){try{await service.UpdateAsync(id,r);return NoContent();}catch(Exception e){return BadRequest(new{mensaje=e.Message});}}
 [HttpPost("{id:int}/tomar"),RequirePermission("Comercial","Editar")] public async Task<IActionResult> Tomar(int id,InteresTomarRequest r){try{await service.TomarAsync(id,r.UsuarioResponsableId);return NoContent();}catch(Exception e){return BadRequest(new{mensaje=e.Message});}}
 [HttpPost("{id:int}/vincular-cliente"),RequirePermission("Comercial","Editar")]
 public async Task<IActionResult> VincularCliente(int id, InteresVincularClienteRequest r){
  try {
   var usuarioId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
   if(!int.TryParse(usuarioId,out var uid) || uid<=0) return Forbid();
   await service.VincularClienteAsync(id,r.ClienteId,uid);
   return NoContent();
  }catch(Exception e){return BadRequest(new{mensaje=e.Message});}
 }
 [HttpPost("{id:int}/descartar"),RequirePermission("Comercial","Inactivar")] public async Task<IActionResult> Descartar(int id,InteresDescartarRequest r){try{await service.DescartarAsync(id,r.Motivo);return NoContent();}catch(Exception e){return BadRequest(new{mensaje=e.Message});}}
 [HttpPost("{id:int}/calificar"),RequirePermission("Comercial","Crear")] public async Task<IActionResult> Calificar(int id,InteresCalificarRequest r){try{var oid=await service.CalificarAsync(id,r);return Ok(new{oportunidadComercialId=oid});}catch(Exception e){return BadRequest(new{mensaje=e.Message});}}
}
