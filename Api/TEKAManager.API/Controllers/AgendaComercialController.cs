using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.API.Security;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

public sealed record CrearActividadRequest(int ClienteId, string Tipo, string Titulo, DateTime FechaProgramada, int? OportunidadComercialId, int? PresupuestoComercialId, int? UsuarioResponsableId, string? Descripcion, int? InteresComercialId = null);
public sealed record ReprogramarActividadRequest(DateTime FechaProgramada, string? Descripcion);
public sealed record FinalizarActividadRequest(string Resultado);

[ApiController]
[Route("api/agenda-comercial")]
[Authorize]
[RequirePermission("Comercial", "Ver")]
public sealed class AgendaComercialController(TekaDbContext db, ILogger<AgendaComercialController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, [FromQuery] int? usuarioResponsableId, [FromQuery] int? interesComercialId, CancellationToken ct)
    {
        if (desde > hasta) return BadRequest(new { mensaje = "El rango de fechas es inválido." });
        return await Run("dbo.sp_ActividadComercial_Listar", [P("@Desde", desde), P("@Hasta", hasta), P("@UsuarioResponsableId", usuarioResponsableId), P("@InteresComercialId", interesComercialId)], true, ct);
    }

    [HttpPost]
    [RequirePermission("Comercial", "Crear")]
    public async Task<IActionResult> Crear(CrearActividadRequest request, CancellationToken ct)
    {
        if (request.ClienteId <= 0 || request.FechaProgramada == default || string.IsNullOrWhiteSpace(request.Titulo) || request.Titulo.Length > 150 || request.Descripcion?.Length > 1000)
            return BadRequest(new { mensaje = "Cliente, título, fecha o descripción inválidos." });
        return await Run("dbo.sp_ActividadComercial_Crear", [P("@ClienteId", request.ClienteId), P("@Tipo", request.Tipo), P("@Titulo", request.Titulo.Trim()), P("@FechaProgramada", request.FechaProgramada), P("@OportunidadComercialId", request.OportunidadComercialId), P("@PresupuestoComercialId", request.PresupuestoComercialId), P("@UsuarioResponsableId", request.UsuarioResponsableId), P("@Descripcion", request.Descripcion), P("@InteresComercialId", request.InteresComercialId)], false, ct, true);
    }

    [HttpPost("{id:int}/reprogramar")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> Reprogramar(int id, ReprogramarActividadRequest request, CancellationToken ct)
        => id <= 0 || request.FechaProgramada == default || request.Descripcion?.Length > 1000
            ? BadRequest(new { mensaje = "Fecha o descripción inválidas." })
            : await Run("dbo.sp_ActividadComercial_Reprogramar", [P("@ActividadComercialId", id), P("@FechaProgramada", request.FechaProgramada), P("@Descripcion", request.Descripcion)], false, ct);

    [HttpPost("{id:int}/finalizar")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> Finalizar(int id, FinalizarActividadRequest request, CancellationToken ct)
        => id <= 0 || string.IsNullOrWhiteSpace(request.Resultado) || request.Resultado.Length > 1000
            ? BadRequest(new { mensaje = "Debe registrar un resultado válido." })
            : await Run("dbo.sp_ActividadComercial_Finalizar", [P("@ActividadComercialId", id), P("@Resultado", request.Resultado.Trim())], false, ct);

    [HttpPost("{id:int}/cancelar")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> Cancelar(int id, CancellationToken ct)
        => id <= 0 ? BadRequest(new { mensaje = "Identificador inválido." })
            : await Run("dbo.sp_ActividadComercial_Cancelar", [P("@ActividadComercialId", id)], false, ct);

    private static SqlParameter P(string name, object? value) => new(name, value ?? DBNull.Value);

    private async Task<IActionResult> Run(string procedure, SqlParameter[] args, bool isList, CancellationToken ct, bool created = false)
    {
        try
        {
            var conn = db.Database.GetDbConnection();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = procedure;
            cmd.CommandType = CommandType.StoredProcedure;
            foreach (var arg in args) cmd.Parameters.Add(arg);
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
            if (!isList && !created)
            {
                await cmd.ExecuteNonQueryAsync(ct);
                return NoContent();
            }
            var rows = new List<Dictionary<string, object?>>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                for (var i = 0; i < reader.FieldCount; i++) row[char.ToLowerInvariant(reader.GetName(i)[0]) + reader.GetName(i)[1..]] = await reader.IsDBNullAsync(i, ct) ? null : reader.GetValue(i);
                rows.Add(row);
            }
            return created ? StatusCode(201, rows.Count > 0 ? rows[0] : new { mensaje = "No se recibió el identificador." }) : Ok(rows);
        }
        catch (SqlException ex) when (ex.Number is >= 51000 and <= 51999)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error de Agenda en {Procedimiento}.", procedure);
            return StatusCode(500, new { mensaje = "No se pudo completar la operación de Agenda." });
        }
    }
}
