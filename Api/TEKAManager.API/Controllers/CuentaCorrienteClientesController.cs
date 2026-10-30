using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.API.Security;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Cobros", "Ver")]
[ApiController]
[Route("api/clientes/{clienteId:int}/cuenta-corriente")]
public sealed class CuentaCorrienteClientesController(IClienteService clientes, ClienteFichaConsultaService consulta) : ControllerBase
{
    [HttpGet("resumen")]
    public async Task<IActionResult> Resumen(int clienteId, CancellationToken ct)
    {
        if (await clientes.GetByIdAsync(clienteId) is null)
            return NotFound(new { mensaje = "No se encontró el cliente solicitado." });
        return Ok(await consulta.ResumenAsync(clienteId, ct));
    }

    [HttpGet("movimientos")]
    public async Task<IActionResult> Movimientos(int clienteId, [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta, [FromQuery] int? tipoMovimientoId,
        [FromQuery] int pagina = 1, [FromQuery] int tamano = 10, CancellationToken ct = default)
    {
        if (pagina < 1 || tamano is < 1 or > 100 || tipoMovimientoId is <= 0 ||
            (desde.HasValue && hasta.HasValue && desde.Value.Date > hasta.Value.Date))
            return BadRequest(new { mensaje = "Los filtros de la consulta no son válidos." });
        if (await clientes.GetByIdAsync(clienteId) is null)
            return NotFound(new { mensaje = "No se encontró el cliente solicitado." });
        return Ok(await consulta.MovimientosAsync(clienteId, desde, hasta, tipoMovimientoId, pagina, tamano, ct));
    }
}
