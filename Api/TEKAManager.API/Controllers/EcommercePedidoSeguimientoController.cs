using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using TEKAManager.Core.Data;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

/// <summary>Consulta informativa; no cambia pedidos, cobros, reservas ni remitos.</summary>
[ApiController]
[Authorize]
[Route("api/ecommerce/pedidos")]
public sealed class EcommercePedidoSeguimientoController(
    TekaDbContext db, IPedidoService pedidos, ICobroService cobros,
    IRemitoService remitos, ILogger<EcommercePedidoSeguimientoController> logger) : ControllerBase
{
    [HttpGet("{id:int}/seguimiento")]
    public async Task<IActionResult> Obtener(int id, CancellationToken ct)
    {
        if (id <= 0) return BadRequest(new { mensaje = "Pedido inválido." });
        try
        {
            var pedido = await pedidos.GetByIdAsync(id);
            if (pedido is null) return NotFound(new { mensaje = "Pedido inexistente." });
            // Cobros y remitos: servicios existentes, filtrados por el identificador real del pedido.
            var cobrosPedido = (await cobros.GetAllAsync()).Where(c => c.PedidoId == id)
                .Select(c => new { c.CobroId, c.EstadoCobroNombre, c.MedioCobroNombre,
                    c.FechaCobro, c.ImporteFinal, c.ReferenciaExterna }).ToArray();
            var remitosPedido = (await remitos.GetAllAsync()).Where(r => r.PedidoId == id)
                .Select(r => new { r.RemitoId, r.NumeroRemito, r.FechaRemito,
                    r.DomicilioEntrega, r.Entregado, r.FechaEntrega }).ToArray();
            var reservas = new List<object>();
            const string sql = @"SELECT r.ReservaStockOnlineId, r.ProductoId, p.Codigo, p.Nombre,
 r.DepositoId, d.Nombre AS DepositoNombre, r.Cantidad, r.Estado,
 r.FechaReserva, r.FechaCierre
 FROM dbo.ReservaStockOnline r
 JOIN dbo.Producto p ON p.ProductoId=r.ProductoId
 JOIN dbo.Deposito d ON d.DepositoId=r.DepositoId
 WHERE r.PedidoId=@PedidoId ORDER BY r.ReservaStockOnlineId";
            var conn = (SqlConnection)db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
            await using (var cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.Add("@PedidoId", SqlDbType.Int).Value = id;
                await using var rd = await cmd.ExecuteReaderAsync(ct);
                while (await rd.ReadAsync(ct)) reservas.Add(new {
                    ReservaStockOnlineId = rd.GetInt32(0), ProductoId = rd.GetInt32(1),
                    ProductoCodigo = rd.GetString(2), ProductoNombre = rd.GetString(3),
                    DepositoId = rd.GetInt32(4), DepositoNombre = rd.GetString(5),
                    Cantidad = rd.GetDecimal(6), Estado = rd.GetString(7),
                    FechaReserva = rd.GetDateTime(8),
                    FechaCierre = rd.IsDBNull(9) ? (DateTime?)null : rd.GetDateTime(9)
                });
            }
            return Ok(new { PedidoId = id, Cobros = cobrosPedido, Reservas = reservas,
                Remitos = remitosPedido });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al consultar seguimiento del pedido {PedidoId}", id);
            return StatusCode(500, new { mensaje = "No se pudo consultar el seguimiento del pedido." });
        }
    }
}
