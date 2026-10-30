using System.Data;
using System.Data.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.API.Security;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

public sealed record CrearPresupuestoRequest(int OportunidadComercialId, DateTime FechaVencimiento, int? UsuarioResponsableId, string? Observaciones);
public sealed record CrearPresupuestoDirectoRequest(int ClienteId, DateTime FechaVencimiento, string? Observaciones, List<ProductoPresupuestoRequest> Productos, int? InteresComercialId = null, int? OportunidadComercialId = null);
public sealed record ProductoPresupuestoRequest(int ProductoId, decimal Cantidad, decimal PrecioUnitario, decimal DescuentoPorcentaje, string? Observaciones);
public sealed record CambiarEstadoPresupuestoRequest(string EstadoNuevo, string? Observaciones);

[ApiController]
[Route("api/presupuestos-comerciales")]
[Authorize]
[RequirePermission("Comercial", "Ver")]
public sealed class PresupuestosComercialesController(TekaDbContext db, ILogger<PresupuestosComercialesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? oportunidadComercialId, [FromQuery] int? interesComercialId, [FromQuery] string? estado, CancellationToken ct)
        => await Consultar("dbo.sp_PresupuestoComercial_Listar", [
            P("@OportunidadComercialId", oportunidadComercialId), P("@Estado", estado), P("@InteresComercialId", interesComercialId)], ct);

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detalle(int id, CancellationToken ct)
    {
        if (id <= 0) return BadRequest(new { mensaje = "Identificador inválido." });
        var cabecera = await ConsultarDatos(@"SELECT p.*, c.Nombre AS ClienteNombre, c.Apellido AS ClienteApellido,
            (SELECT COUNT(*) FROM dbo.PresupuestoComercialDetalle d WHERE d.PresupuestoComercialId=p.PresupuestoComercialId) AS CantidadRenglones,
            (SELECT COALESCE(SUM(d.Cantidad*d.PrecioUnitario*(1-d.DescuentoPorcentaje/100.0)),0) FROM dbo.PresupuestoComercialDetalle d WHERE d.PresupuestoComercialId=p.PresupuestoComercialId) AS Total
            FROM dbo.PresupuestoComercial p INNER JOIN dbo.Cliente c ON c.ClienteId=p.ClienteId
            WHERE p.PresupuestoComercialId=@Id", CommandType.Text, [P("@Id", id)], ct);
        if (cabecera.Count == 0) return NotFound(new { mensaje = "Presupuesto no encontrado." });
        var productos = await ConsultarDatos("SELECT * FROM dbo.PresupuestoComercialDetalle WHERE PresupuestoComercialId=@Id ORDER BY PresupuestoComercialDetalleId", CommandType.Text, [P("@Id", id)], ct);
        var historial = await ConsultarDatos("SELECT * FROM dbo.PresupuestoComercialHistorial WHERE PresupuestoComercialId=@Id ORDER BY Fecha DESC,PresupuestoComercialHistorialId DESC", CommandType.Text, [P("@Id", id)], ct);
        return Ok(new { presupuesto = cabecera[0], productos, historial });
    }

    [HttpPost]
    [RequirePermission("Comercial", "Crear")]
    public async Task<IActionResult> Crear(CrearPresupuestoRequest request, CancellationToken ct)
    {
        if (request.OportunidadComercialId <= 0 || request.FechaVencimiento == default || request.Observaciones?.Length > 1000)
            return BadRequest(new { mensaje = "Oportunidad, vencimiento u observaciones inválidos." });
        return await Ejecutar("dbo.sp_PresupuestoComercial_Crear", [P("@OportunidadComercialId", request.OportunidadComercialId), P("@FechaVencimiento", request.FechaVencimiento.Date), P("@UsuarioResponsableId", request.UsuarioResponsableId), P("@Observaciones", request.Observaciones)], true, ct);
    }

    [HttpPost("directo")]
    [RequirePermission("Comercial", "Crear")]
    public async Task<IActionResult> CrearDirecto(CrearPresupuestoDirectoRequest request, CancellationToken ct)
    {
        if (request.ClienteId <= 0 || request.FechaVencimiento == default || request.Observaciones?.Length > 1000 || request.Productos is null || request.Productos.Count == 0 || request.Productos.Any(p => p.ProductoId <= 0 || (p.Cantidad <= 0 || p.Cantidad != decimal.Truncate(p.Cantidad)) || p.PrecioUnitario < 0 || p.DescuentoPorcentaje < 0 || p.DescuentoPorcentaje > 100))
            return BadRequest(new { mensaje = "Cliente, vencimiento o productos inválidos." });
        var json = System.Text.Json.JsonSerializer.Serialize(request.Productos, new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));
        return await Ejecutar("dbo.sp_PresupuestoComercial_CrearDirecto", [P("@ClienteId", request.ClienteId), P("@FechaVencimiento", request.FechaVencimiento.Date), P("@Observaciones", request.Observaciones), P("@ProductosJson", json), P("@InteresComercialId", request.InteresComercialId), P("@OportunidadComercialId", request.OportunidadComercialId)], true, ct);
    }

    [HttpPut("{id:int}/productos")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> GuardarProducto(int id, ProductoPresupuestoRequest request, CancellationToken ct)
    {
        if (id <= 0 || request.ProductoId <= 0 || (request.Cantidad <= 0 || request.Cantidad != decimal.Truncate(request.Cantidad)) || request.PrecioUnitario < 0 || request.DescuentoPorcentaje < 0 || request.DescuentoPorcentaje > 100 || request.Observaciones?.Length > 300)
            return BadRequest(new { mensaje = "Producto, cantidad, precio o descuento inválidos." });
        return await Ejecutar("dbo.sp_PresupuestoComercial_GuardarProducto", [P("@PresupuestoComercialId", id), P("@ProductoId", request.ProductoId), P("@Cantidad", request.Cantidad), P("@PrecioUnitario", request.PrecioUnitario), P("@DescuentoPorcentaje", request.DescuentoPorcentaje), P("@Observaciones", request.Observaciones)], false, ct);
    }

    [HttpDelete("{id:int}/productos/{productoId:int}")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> EliminarProducto(int id, int productoId, CancellationToken ct)
    {
        if (id <= 0 || productoId <= 0) return BadRequest(new { mensaje = "Identificador inválido." });
        try
        {
            var conn = db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
            await using var transaction = await conn.BeginTransactionAsync(ct);
            try
            {
                await using var cmd = conn.CreateCommand();
                cmd.Transaction = transaction;
                cmd.CommandType = CommandType.Text;
                cmd.CommandText = @"DELETE d FROM dbo.PresupuestoComercialDetalle d
                    INNER JOIN dbo.PresupuestoComercial p ON p.PresupuestoComercialId = d.PresupuestoComercialId
                    WHERE d.PresupuestoComercialId = @Id AND d.ProductoId = @ProductoId
                    AND p.Estado = 'Borrador'";
                cmd.Parameters.Add(P("@Id", id));
                cmd.Parameters.Add(P("@ProductoId", productoId));
                var affected = await cmd.ExecuteNonQueryAsync(ct);
                if (affected == 0) { await transaction.RollbackAsync(ct); return Conflict(new { mensaje = "El producto no existe o el presupuesto ya no está en borrador." }); }
                await transaction.CommitAsync(ct);
                return NoContent();
            }
            catch { await transaction.RollbackAsync(ct); throw; }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al eliminar producto del presupuesto {Id}", id);
            return StatusCode(500, new { mensaje = "No se pudo quitar el producto del presupuesto." });
        }
    }

    [HttpPost("{id:int}/estado")]
    [RequirePermission("Comercial", "Editar")]
    public async Task<IActionResult> CambiarEstado(int id, CambiarEstadoPresupuestoRequest request, CancellationToken ct)
    {
        if (id <= 0 || request.EstadoNuevo is null || !new[] { "Enviado", "Aceptado", "Rechazado", "Vencido", "Cancelado" }.Contains(request.EstadoNuevo) || request.Observaciones?.Length > 500)
            return BadRequest(new { mensaje = "Estado u observaciones inválidos." });
        return await Ejecutar("dbo.sp_PresupuestoComercial_CambiarEstado", [P("@PresupuestoComercialId", id), P("@EstadoNuevo", request.EstadoNuevo), P("@UsuarioId", null), P("@Observaciones", request.Observaciones)], false, ct);
    }

    private static SqlParameter P(string name, object? value) => new(name, value ?? DBNull.Value);

    private async Task<IActionResult> Consultar(string procedure, SqlParameter[] args, CancellationToken ct)
        => Ok(await ConsultarDatos(procedure, CommandType.StoredProcedure, args, ct));

    private async Task<List<Dictionary<string, object?>>> ConsultarDatos(string query, CommandType type, SqlParameter[] args, CancellationToken ct)
    {
        var conn = db.Database.GetDbConnection();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = query;
        cmd.CommandType = type;
        foreach (var arg in args) cmd.Parameters.Add(arg);
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
        var rows = new List<Dictionary<string, object?>>();
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < reader.FieldCount; i++) row[char.ToLowerInvariant(reader.GetName(i)[0]) + reader.GetName(i)[1..]] = await reader.IsDBNullAsync(i, ct) ? null : reader.GetValue(i);
            rows.Add(row);
        }
        return rows;
    }

    private async Task<IActionResult> Ejecutar(string procedure, SqlParameter[] args, bool returnsId, CancellationToken ct)
    {
        try
        {
            var rows = await ConsultarDatos(procedure, CommandType.StoredProcedure, args, ct);
            return returnsId ? StatusCode(201, rows.Count > 0 ? rows[0] : new { mensaje = "No se recibió el identificador." }) : NoContent();
        }
        catch (SqlException ex) when (ex.Number is >= 51000 and <= 51999)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al ejecutar {Procedimiento}.", procedure);
            return StatusCode(500, new { mensaje = "No se pudo completar la operación comercial." });
        }
    }
}
