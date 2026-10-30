using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/carritos")]
[Authorize(AuthenticationSchemes = "Bearer," + EcommerceJwtSetup.Scheme)]
public class CarritosController(ICarritoService service, IOptions<ComercialDigitalOptions> options) : ControllerBase
{
    [HttpPost("obtener-o-crear"), RequirePermission("Comercial", "Ver")]
    public async Task<IActionResult> ObtenerOCrear(CarritoObtenerOCrearRequest request) { try { return Ok(await service.ObtenerOCrearAsync(request)); } catch (Exception e) { return BadRequest(new { mensaje = e.Message }); } }

    [HttpGet("{id:int}"), RequirePermission("Comercial", "Ver")]
    public async Task<IActionResult> Get(int id) { var result = await service.GetByIdAsync(id); return result is null ? NotFound() : Ok(result); }

    [HttpPut("{id:int}/items"), RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> Item(int id, CarritoItemRequest request) { try { await service.GuardarItemAsync(id, request); return NoContent(); } catch (Exception e) { return BadRequest(new { mensaje = e.Message }); } }

    [HttpDelete("{id:int}/items/{productoId:int}"), RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> DeleteItem(int id, int productoId) { try { await service.EliminarItemAsync(id, productoId); return NoContent(); } catch (Exception e) { return BadRequest(new { mensaje = e.Message }); } }

    [HttpPost("{id:int}/asignar-cliente"), RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> Cliente(int id, CarritoAsignarClienteRequest request) { try { await service.AsignarClienteAsync(id, request.ClienteId); return NoContent(); } catch (Exception e) { return BadRequest(new { mensaje = e.Message }); } }

    [AllowAnonymous, EnableRateLimiting("public-commerce")]
    [HttpPost("{id:int}/checkout/iniciar")]
    public async Task<IActionResult> IniciarCheckout(int id, CheckoutSeguimientoRequest request, CancellationToken cancellationToken)
    {
        try { await service.IniciarCheckoutAsync(id, request, BuyerClienteId(), cancellationToken); return Accepted(); }
        catch (Exception e) { return BadRequest(new { mensaje = e.Message }); }
    }

    [AllowAnonymous, EnableRateLimiting("public-commerce")]
    [HttpPost("{id:int}/checkout/actividad")]
    public async Task<IActionResult> ActividadCheckout(int id, CheckoutActividadRequest request, CancellationToken cancellationToken)
    {
        try { await service.RegistrarActividadCheckoutAsync(id, request.IdentificadorSesion, BuyerClienteId(), cancellationToken); return NoContent(); }
        catch (Exception e) { return BadRequest(new { mensaje = e.Message }); }
    }

    [HttpPost("{id:int}/checkout"), RequirePermission("Comercial", "Crear")]
    public async Task<IActionResult> Checkout(int id, CheckoutCarritoRequest request) { try { return Ok(await service.CheckoutAsync(id, request.Observaciones)); } catch (Exception e) { return BadRequest(new { mensaje = e.Message }); } }

    [HttpPost("procesar-abandonados"), RequirePermission("Comercial", "Administrar")]
    public async Task<IActionResult> Procesar([FromQuery] int? horas = null, [FromQuery] int? horasCheckout = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var settings = options.Value;
            var count = await service.ProcesarAbandonadosAsync(horas ?? settings.HorasCarritoAbandonado, horasCheckout ?? settings.HorasCheckoutInterrumpido, cancellationToken);
            return Ok(new { interesesCreados = count });
        }
        catch (Exception e) { return BadRequest(new { mensaje = e.Message }); }
    }

    private int? BuyerClienteId() => User.FindFirst("identity_type")?.Value == "buyer" && int.TryParse(User.FindFirst("cliente_id")?.Value, out var id) ? id : null;
}
