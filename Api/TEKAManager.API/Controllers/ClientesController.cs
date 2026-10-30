using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Ventas", "Ver")]
[ApiController]
[Route("api/clientes")]
[Produces("application/json")]
public class ClientesController(IClienteService clienteService, ClienteFichaConsultaService ficha,
    ILogger<ClientesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await clienteService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cliente = await clienteService.GetByIdAsync(id);
        return cliente is null ? NotFound(new { mensaje = "No se encontró el cliente solicitado." }) : Ok(cliente);
    }

    [HttpGet("{id:int}/pedidos-recientes")]
    public async Task<IActionResult> GetPedidosRecientes(int id, CancellationToken ct)
    {
        if (await clienteService.GetByIdAsync(id) is null)
            return NotFound(new { mensaje = "No se encontró el cliente solicitado." });
        return Ok(await ficha.PedidosRecientesAsync(id, ct));
    }

    [HttpPost, RequirePermission("Ventas", "Crear")]
    public async Task<IActionResult> Insert([FromBody] ClienteInsertRequest request)
    {
        try
        {
            var id = await clienteService.InsertAsync(request);
            return CreatedAtAction(nameof(GetById), new { id }, new { clienteId = id });
        }
        catch (DuplicateCustomerDocumentException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al registrar cliente.");
            return StatusCode(500, new { mensaje = "No se pudo registrar el cliente." });
        }
    }

    [HttpPut("{id:int}"), RequirePermission("Ventas", "Editar")]
    public async Task<IActionResult> Update(int id, [FromBody] ClienteUpdateRequest request)
    {
        try { await clienteService.UpdateAsync(id, request); return NoContent(); }
        catch (DuplicateCustomerDocumentException ex) { return Conflict(new { mensaje = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al actualizar cliente {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo actualizar el cliente." });
        }
    }

    [HttpDelete("{id:int}"), RequirePermission("Ventas", "Inactivar")]
    public async Task<IActionResult> Delete(int id, [FromBody] ClienteDeleteRequest request)
    {
        try { await clienteService.DeleteAsync(id, request); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al inactivar cliente {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo inactivar el cliente." });
        }
    }

    [HttpPost("{id:int}/activar"), RequirePermission("Ventas", "Editar")]
    public async Task<IActionResult> Activate(int id)
    {
        try { await clienteService.ActivateAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { mensaje = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al reactivar cliente {Id}.", id);
            return StatusCode(500, new { mensaje = "No se pudo reactivar el cliente." });
        }
    }
}
