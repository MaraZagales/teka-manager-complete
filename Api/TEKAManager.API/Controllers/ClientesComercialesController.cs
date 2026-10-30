using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.API.Security;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

public sealed record ClienteComercialSugerencia(int ClienteId, string Nombre, string? Apellido, string? Documento, string? Telefono);

[ApiController]
[Route("api/comercial/clientes")]
[Authorize(AuthenticationSchemes = "Bearer")]
[RequirePermission("Comercial", "Ver")]
public sealed class ClientesComercialesController(TekaDbContext db) : ControllerBase
{
    [HttpGet("buscar")]
    public async Task<IActionResult> Buscar([FromQuery] string? q, [FromQuery] int? clienteId, CancellationToken ct)
    {
        var term = q?.Trim();
        if (clienteId is null && (term is null || term.Length < 2)) return Ok(Array.Empty<ClienteComercialSugerencia>());
        if (clienteId is <= 0) return BadRequest(new { mensaje = "El cliente indicado no es válido." });

        var id = new SqlParameter("@ClienteId", (object?)clienteId ?? DBNull.Value);
        var search = new SqlParameter("@Buscar", (object?)term ?? DBNull.Value);
        const string sql = """
            SELECT TOP (20) ClienteId, Nombre, Apellido, Documento, Telefono
            FROM dbo.Cliente
            WHERE Activo=1
              AND (@ClienteId IS NULL OR ClienteId=@ClienteId)
              AND (@Buscar IS NULL OR CONCAT(Nombre,' ',COALESCE(Apellido,'')) LIKE '%'+@Buscar+'%'
                   OR Documento LIKE '%'+@Buscar+'%')
            ORDER BY CASE WHEN @ClienteId=ClienteId THEN 0 ELSE 1 END, Nombre, Apellido, ClienteId
            """;
        var rows = await db.Database.SqlQueryRaw<ClienteComercialSugerencia>(sql, id, search).ToListAsync(ct);
        return Ok(rows);
    }
}
