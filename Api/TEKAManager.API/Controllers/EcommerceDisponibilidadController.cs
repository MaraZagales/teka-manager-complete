using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

/// <summary>Lectura de disponibilidad por producto y depósito. No realiza reservas.</summary>
[ApiController]
[Authorize]
[Route("api/ecommerce/disponibilidad")]
public sealed class EcommerceDisponibilidadController(TekaDbContext db, ILogger<EcommerceDisponibilidadController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Obtener(CancellationToken ct)
    {
        const string sql = @"
SELECT pdo.ProductoId, pdo.DepositoId, d.Nombre AS DepositoNombre,
       CAST(pdo.CupoOnline AS decimal(18,2)) AS CupoOnline,
       CAST(COALESCE(sp.CantidadActual,0) AS decimal(18,2)) AS StockFisico,
       CAST(COALESCE(r.Reservado,0) AS decimal(18,2)) AS Reservado,
       CAST(CASE WHEN COALESCE(sp.CantidadActual,0) - COALESCE(r.Reservado,0) > 0
                 THEN COALESCE(sp.CantidadActual,0) - COALESCE(r.Reservado,0) ELSE 0 END AS decimal(18,2)) AS StockLibre,
       CAST(CASE WHEN pdo.CupoOnline IS NULL OR pdo.CupoOnline - COALESCE(r.Reservado,0) <= 0
                 OR COALESCE(sp.CantidadActual,0) - COALESCE(r.Reservado,0) <= 0 THEN 0
                 WHEN pdo.CupoOnline - COALESCE(r.Reservado,0) < COALESCE(sp.CantidadActual,0) - COALESCE(r.Reservado,0)
                 THEN pdo.CupoOnline - COALESCE(r.Reservado,0)
                 ELSE COALESCE(sp.CantidadActual,0) - COALESCE(r.Reservado,0) END AS decimal(18,2)) AS DisponibleOnline
FROM dbo.ProductoDisponibilidadOnline pdo
INNER JOIN dbo.Producto p ON p.ProductoId = pdo.ProductoId AND p.Activo = 1
INNER JOIN dbo.Deposito d ON d.DepositoId = pdo.DepositoId
LEFT JOIN dbo.StockProducto sp ON sp.ProductoId = pdo.ProductoId AND sp.DepositoId = pdo.DepositoId
OUTER APPLY (
    SELECT SUM(rs.Cantidad) AS Reservado
    FROM dbo.ReservaStockOnline rs
    WHERE rs.ProductoId = pdo.ProductoId AND rs.DepositoId = pdo.DepositoId AND rs.Estado = 'Activa'
) r
ORDER BY pdo.ProductoId;";
        try
        {
            var conn = (SqlConnection)db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
            await using var cmd = new SqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            var resultado = new List<object>();
            while (await reader.ReadAsync(ct))
                resultado.Add(new {
                    ProductoId = reader.GetInt32(0), DepositoId = reader.GetInt32(1), DepositoNombre = reader.GetString(2),
                    CupoOnline = reader.IsDBNull(3) ? (decimal?)null : reader.GetDecimal(3),
                    StockFisico = reader.GetDecimal(4), Reservado = reader.GetDecimal(5),
                    StockLibre = reader.GetDecimal(6), DisponibleOnline = reader.GetDecimal(7)
                });
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "No se pudo calcular disponibilidad online");
            return StatusCode(500, new { mensaje = "No se pudo consultar la disponibilidad online." });
        }
    }
}
