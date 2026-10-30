using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

/// <summary>Analítica de clientes E-commerce. Solo lectura; requiere JWT.</summary>
[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[Route("api/ecommerce/clientes/analitica")]
[Produces("application/json")]
public sealed class EcommerceClientesAnaliticaController(
    TekaDbContext db, ILogger<EcommerceClientesAnaliticaController> logger) : ControllerBase
{
    [HttpGet("resumen")]
    public Task<IActionResult> Resumen([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct) =>
        Ejecutar("sp_Ecommerce_ClientesOnline_Resumen", Fechas(desde, hasta), ct);

    [HttpGet("explorador")]
    public Task<IActionResult> Explorador([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] string? busqueda, [FromQuery] string segmento = "TODOS", [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 25, CancellationToken ct = default)
    {
        if (pagina < 1 || tamanoPagina < 1 || tamanoPagina > 200)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Paginación inválida." }));
        if (busqueda?.Length > 150 || segmento.Length > 20)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Filtro demasiado largo." }));
        var args = Fechas(desde, hasta);
        args.Add(("@Busqueda", SqlDbType.NVarChar, busqueda));
        args.Add(("@Segmento", SqlDbType.VarChar, segmento));
        args.Add(("@Pagina", SqlDbType.Int, pagina));
        args.Add(("@TamanoPagina", SqlDbType.Int, tamanoPagina));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Explorador", args, ct);
    }

    [HttpGet("productos")]
    public Task<IActionResult> Productos([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] int? clienteId, [FromQuery] int top = 20, CancellationToken ct = default)
    {
        if (top < 1 || top > 500 || clienteId is <= 0)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Parámetros inválidos." }));
        var args = Fechas(desde, hasta);
        args.Add(("@ClienteId", SqlDbType.Int, clienteId));
        args.Add(("@Top", SqlDbType.Int, top));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Productos", args, ct);
    }

    [HttpGet("evolucion")]
    public Task<IActionResult> Evolucion([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct) =>
        Ejecutar("sp_Ecommerce_ClientesOnline_Evolucion", Fechas(desde, hasta), ct);

    [HttpGet("segmentos")]
    public Task<IActionResult> Segmentos([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] DateTime? fechaCorte, [FromQuery] int diasInactividad = 90, CancellationToken ct = default)
    {
        if (diasInactividad < 1 || diasInactividad > 3650)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Días de inactividad inválidos." }));
        var args = Fechas(desde, hasta);
        args.Add(("@FechaCorte", SqlDbType.Date, fechaCorte?.Date));
        args.Add(("@DiasInactividad", SqlDbType.Int, diasInactividad));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Segmentos", args, ct);
    }

    [HttpGet("ranking")]
    public Task<IActionResult> Ranking([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] int top = 50, CancellationToken ct = default)
    {
        if (top < 1 || top > 500)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Top inválido." }));
        var args = Fechas(desde, hasta);
        args.Add(("@Top", SqlDbType.Int, top));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Ranking", args, ct);
    }

    [HttpGet("ficha/{clienteId:int}")]
    public Task<IActionResult> Ficha(int clienteId, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct)
    {
        if (clienteId <= 0) return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Cliente inválido." }));
        var args = Fechas(desde, hasta);
        args.Add(("@ClienteId", SqlDbType.Int, clienteId));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Ficha", args, ct, true);
    }

    [HttpGet("cuentas")]
    public Task<IActionResult> Cuentas([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] bool? soloSinCompras, CancellationToken ct)
    {
        var args = Fechas(desde, hasta);
        args.Add(("@SoloSinCompras", SqlDbType.Bit, soloSinCompras));
        return Ejecutar("sp_Ecommerce_ClientesOnline_Cuentas", args, ct);
    }

    [HttpGet("exportacion")]
    public Task<IActionResult> Exportacion([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] int? clienteId, [FromQuery] bool incluirSinFecha = false, CancellationToken ct = default)
    {
        if (clienteId is <= 0) return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Cliente inválido." }));
        var args = Fechas(desde, hasta);
        args.Add(("@ClienteId", SqlDbType.Int, clienteId));
        args.Add(("@IncluirSinFecha", SqlDbType.Bit, incluirSinFecha));
        return Ejecutar("sp_Ecommerce_ClientesOnline_DetalleExportacion", args, ct);
    }

    private static List<(string Name, SqlDbType Type, object? Value)> Fechas(DateTime? desde, DateTime? hasta) =>
        [("@Desde", SqlDbType.Date, desde?.Date), ("@Hasta", SqlDbType.Date, hasta?.Date)];

    private async Task<IActionResult> Ejecutar(string procedimiento,
        List<(string Name, SqlDbType Type, object? Value)> args, CancellationToken ct, bool ficha = false)
    {
        var desde = args.FirstOrDefault(a => a.Name == "@Desde").Value as DateTime?;
        var hasta = args.FirstOrDefault(a => a.Name == "@Hasta").Value as DateTime?;
        if (desde.HasValue && hasta.HasValue && desde > hasta)
            return BadRequest(new { mensaje = "La fecha Desde no puede superar Hasta." });

        try
        {
            var sets = new List<List<Dictionary<string, object?>>>();
            var connection = (SqlConnection)db.Database.GetDbConnection();
            var cerrar = connection.State != ConnectionState.Open;
            try
            {
                if (cerrar) await connection.OpenAsync(ct);
                await using var command = new SqlCommand("dbo." + procedimiento, connection)
                { CommandType = CommandType.StoredProcedure, CommandTimeout = 60 };
                foreach (var arg in args)
                    command.Parameters.Add(arg.Name, arg.Type).Value = arg.Value ?? DBNull.Value;
                await using var reader = await command.ExecuteReaderAsync(ct);
                do
                {
                    if (reader.FieldCount == 0) continue;
                    var rows = new List<Dictionary<string, object?>>();
                    while (await reader.ReadAsync(ct))
                    {
                        var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                        for (int i = 0; i < reader.FieldCount; i++)
                            row[reader.GetName(i)] = await reader.IsDBNullAsync(i, ct) ? null : reader.GetValue(i);
                        rows.Add(row);
                    }
                    sets.Add(rows);
                } while (await reader.NextResultAsync(ct));
            }
            finally { if (cerrar) await connection.CloseAsync(); }
            if (ficha && (sets.Count == 0 || sets[0].Count == 0))
                return NotFound(new { mensaje = "Cliente inexistente." });
            // Cada conjunto de resultados se conserva por separado; evita perder datos de Resumen/Ficha.
            return Ok(new { conjuntos = sets });
        }
        catch (SqlException ex) when (ex.Number is >= 51000 and <= 51099)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error en analítica de clientes: {Procedimiento}", procedimiento);
            return StatusCode(500, new { mensaje = "No se pudo obtener la analítica de clientes." });
        }
    }
}
