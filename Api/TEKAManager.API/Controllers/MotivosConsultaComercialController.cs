using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TEKAManager.API.Security;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

[ApiController]
[Route("api/auxiliares/motivos-consulta-comercial")]
[Authorize]
[RequirePermission("Comercial", "Ver")]
public sealed class MotivosConsultaComercialController(TekaDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var conn = db.Database.GetDbConnection();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT MotivoConsultaId, Nombre, OrdenVisual, Activo FROM dbo.MotivoConsultaComercial ORDER BY OrdenVisual, Nombre";
        if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync();
        var rows = new List<object>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            rows.Add(new { motivoConsultaId = reader.GetInt32(0), nombre = reader.GetString(1), ordenVisual = reader.GetInt32(2), activo = reader.GetBoolean(3) });
        return Ok(rows);
    }
}
