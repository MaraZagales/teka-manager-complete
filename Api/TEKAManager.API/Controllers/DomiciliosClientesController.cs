using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Ventas", "Ver")]
[ApiController]
[Produces("application/json")]
public class DomiciliosClientesController(IDomicilioClienteService service, ILogger<DomiciliosClientesController> logger) : ControllerBase
{
    [HttpGet("api/clientes/{clienteId:int}/domicilios")]
    public async Task<IActionResult> GetByCliente(int clienteId) => Ok(await service.GetByClienteAsync(clienteId));

    [HttpGet("api/domicilios-clientes/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var domicilio = await service.GetByIdAsync(id);
        return domicilio is null ? NotFound(new { mensaje = "No se encontró el domicilio solicitado." }) : Ok(domicilio);
    }

    [HttpPost("api/clientes/{clienteId:int}/domicilios"), RequirePermission("Ventas", "Crear")]
    public async Task<IActionResult> Insert(int clienteId, [FromBody] DomicilioClienteRequest request)
    {
        try { var id=await service.InsertAsync(clienteId,request);return CreatedAtAction(nameof(GetById),new{id},new{domicilioClienteId=id}); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (SqlException ex) when (ex.Number == 51010) { return BadRequest(new { mensaje="Seleccioná un tipo de domicilio activo." }); }
        catch (Exception ex) { logger.LogError(ex,"Error al registrar domicilio para cliente {ClienteId}.",clienteId);return StatusCode(500,new{mensaje="No se pudo registrar el domicilio."}); }
    }

    [HttpPut("api/domicilios-clientes/{id:int}"), RequirePermission("Ventas", "Editar")]
    public async Task<IActionResult> Update(int id,[FromBody] DomicilioClienteRequest request)
    {
        try { await service.UpdateAsync(id,request);return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (SqlException ex) when (ex.Number == 51011) { return BadRequest(new { mensaje="Seleccioná un tipo de domicilio activo." }); }
        catch (SqlException ex) when (ex.Number == 51012) { return NotFound(new { mensaje="No se encontró el domicilio solicitado." }); }
        catch (Exception ex) { logger.LogError(ex,"Error al actualizar domicilio {Id}.",id);return StatusCode(500,new{mensaje="No se pudo actualizar el domicilio."}); }
    }

    [HttpDelete("api/domicilios-clientes/{id:int}"), RequirePermission("Ventas", "Inactivar")]
    public async Task<IActionResult> Delete(int id)
    {
        try { await service.DeleteAsync(id);return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (Exception ex) { logger.LogError(ex,"Error al inactivar domicilio {Id}.",id);return StatusCode(500,new{mensaje="No se pudo inactivar el domicilio."}); }
    }

    [HttpPost("api/domicilios-clientes/{id:int}/activar"), RequirePermission("Ventas", "Editar")]
    public async Task<IActionResult> Activate(int id)
    {
        try { await service.ActivateAsync(id);return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje=ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje=ex.Message }); }
        catch (Exception ex) { logger.LogError(ex,"Error al reactivar domicilio {Id}.",id);return StatusCode(500,new{mensaje="No se pudo reactivar el domicilio."}); }
    }
}
