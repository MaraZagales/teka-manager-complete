using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

/// <summary>Administración y consultas de promociones y beneficios por recortes.</summary>
[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[Route("api/ecommerce/promociones-beneficios")]
public sealed class EcommercePromocionesBeneficiosController(
    TekaDbContext db, ILogger<EcommercePromocionesBeneficiosController> logger) : ControllerBase
{
    public sealed record PromocionRequest(int? PromocionId, string Nombre, string? Descripcion,
        string TipoDescuento, decimal ValorDescuento, DateTime FechaDesde, DateTime FechaHasta, bool Activa);
    public sealed record AsignacionRequest(int PromocionId, int ProductoId, bool Asignar);
    public sealed record ConfiguracionRequest(decimal UmbralGratuidad, bool Activo);
    public sealed record ProductoRecorteRequest(int? ProductoRecorteId, int OrdenProduccionId,
        decimal CantidadHabilitada, decimal PrecioSimbolico, bool Activo);
    public sealed record CotizacionRecorteRequest(int ProductoRecorteId, decimal SubtotalCatalogoNeto);

    [HttpGet("promociones")]
    public Task<IActionResult> Promociones(CancellationToken ct) => Ejecutar("sp_EcommercePromocion_Listar", [], ct);

    [HttpPost("promociones")]
    public Task<IActionResult> GuardarPromocion([FromBody] PromocionRequest r, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(r.Nombre) || r.Nombre.Length > 120 || r.Descripcion?.Length > 500 ||
            r.TipoDescuento is not ("PORCENTAJE" or "FIJO") || r.ValorDescuento <= 0 ||
            (r.TipoDescuento == "PORCENTAJE" && r.ValorDescuento > 100) || r.FechaHasta < r.FechaDesde || r.PromocionId is <= 0)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Datos de promoción inválidos." }));
        return Ejecutar("sp_EcommercePromocion_Guardar", [P("@PromocionId", SqlDbType.Int, r.PromocionId),
            P("@Nombre", SqlDbType.NVarChar, r.Nombre), P("@Descripcion", SqlDbType.NVarChar, r.Descripcion),
            P("@TipoDescuento", SqlDbType.VarChar, r.TipoDescuento), P("@ValorDescuento", SqlDbType.Decimal, r.ValorDescuento),
            P("@FechaDesde", SqlDbType.DateTime2, r.FechaDesde), P("@FechaHasta", SqlDbType.DateTime2, r.FechaHasta),
            P("@Activa", SqlDbType.Bit, r.Activa)], ct);
    }

    [HttpPost("promociones/productos")]
    public Task<IActionResult> AsignarProducto([FromBody] AsignacionRequest r, CancellationToken ct) =>
        r.PromocionId <= 0 || r.ProductoId <= 0
            ? Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Identificadores inválidos." }))
            : Ejecutar("sp_EcommercePromocion_AsignarProducto", [P("@PromocionId", SqlDbType.Int, r.PromocionId),
                P("@ProductoId", SqlDbType.Int, r.ProductoId), P("@Asignar", SqlDbType.Bit, r.Asignar)], ct);

    [HttpGet("promociones/{promocionId:int}/productos")]
    public Task<IActionResult> ProductosPromocion(int promocionId, CancellationToken ct) =>
        promocionId <= 0 ? Task.FromResult<IActionResult>(BadRequest()) :
        Ejecutar("sp_EcommercePromocion_Productos", [P("@PromocionId", SqlDbType.Int, promocionId)], ct);

    [HttpPost("promociones/{promocionId:int}/desactivar")]
    public Task<IActionResult> DesactivarPromocion(int promocionId, CancellationToken ct) =>
        promocionId <= 0 ? Task.FromResult<IActionResult>(BadRequest()) :
        Ejecutar("sp_EcommercePromocion_Desactivar", [P("@PromocionId", SqlDbType.Int, promocionId)], ct);

    [HttpGet("promociones/cotizar-carrito/{carritoId:int}")]
    public Task<IActionResult> CotizarCarrito(int carritoId, CancellationToken ct) =>
        carritoId <= 0 ? Task.FromResult<IActionResult>(BadRequest()) :
        Ejecutar("sp_EcommercePromocion_CotizarCarrito", [P("@CarritoId", SqlDbType.Int, carritoId)], ct);

    [HttpGet("recortes")]
    public Task<IActionResult> Recortes(CancellationToken ct) => Ejecutar("sp_EcommerceBeneficioRecorte_Listar", [], ct);

    [HttpGet("recortes/disponibles")]
    public Task<IActionResult> RecortesDisponibles(CancellationToken ct) => Ejecutar("sp_EcommerceBeneficioRecorte_Disponibles", [], ct);

    [HttpPost("recortes/configuracion")]
    public Task<IActionResult> Configurar([FromBody] ConfiguracionRequest r, CancellationToken ct) =>
        r.UmbralGratuidad < 0 ? Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Umbral inválido." })) :
        Ejecutar("sp_EcommerceBeneficioRecorte_Configurar", [P("@UmbralGratuidad", SqlDbType.Decimal, r.UmbralGratuidad),
            P("@Activo", SqlDbType.Bit, r.Activo)], ct);

    [HttpPost("recortes/productos")]
    public Task<IActionResult> GuardarRecorte([FromBody] ProductoRecorteRequest r, CancellationToken ct) =>
        r.ProductoRecorteId is <= 0 || r.OrdenProduccionId <= 0 || r.CantidadHabilitada <= 0 || r.PrecioSimbolico < 0
            ? Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Datos del producto de recortes inválidos." })) :
        Ejecutar("sp_EcommerceBeneficioRecorte_GuardarProducto", [P("@ProductoRecorteId", SqlDbType.Int, r.ProductoRecorteId),
            P("@OrdenProduccionId", SqlDbType.Int, r.OrdenProduccionId),
            P("@CantidadHabilitada", SqlDbType.Decimal, r.CantidadHabilitada),
            P("@PrecioSimbolico", SqlDbType.Decimal, r.PrecioSimbolico), P("@Activo", SqlDbType.Bit, r.Activo)], ct);

    [HttpPost("recortes/cotizar")]
    public Task<IActionResult> CotizarRecorte([FromBody] CotizacionRecorteRequest r, CancellationToken ct) =>
        r.ProductoRecorteId <= 0 || r.SubtotalCatalogoNeto < 0
            ? Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Datos de cotización inválidos." })) :
        Ejecutar("sp_EcommerceBeneficioRecorte_Cotizar", [P("@ProductoRecorteId", SqlDbType.Int, r.ProductoRecorteId),
            P("@SubtotalCatalogoNeto", SqlDbType.Decimal, r.SubtotalCatalogoNeto)], ct);

    [HttpPost("recortes/{productoRecorteId:int}/desactivar")]
    public Task<IActionResult> DesactivarRecorte(int productoRecorteId, CancellationToken ct) =>
        productoRecorteId <= 0 ? Task.FromResult<IActionResult>(BadRequest()) :
        Ejecutar("sp_EcommerceBeneficioRecorte_Desactivar", [P("@ProductoRecorteId", SqlDbType.Int, productoRecorteId)], ct);

    [HttpGet("recortes/reporte")]
    public Task<IActionResult> Reporte([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct) =>
        desde > hasta ? Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Rango de fechas inválido." })) :
        Ejecutar("sp_EcommerceBeneficioRecorte_Reporte", [P("@Desde", SqlDbType.Date, desde?.Date),
            P("@Hasta", SqlDbType.Date, hasta?.Date)], ct);

    private static (string Name, SqlDbType Type, object? Value) P(string name, SqlDbType type, object? value) => (name, type, value);

    private async Task<IActionResult> Ejecutar(string procedure,
        List<(string Name, SqlDbType Type, object? Value)> args, CancellationToken ct)
    {
        try
        {
            var sets = new List<List<Dictionary<string, object?>>>();
            var connection = (SqlConnection)db.Database.GetDbConnection();
            var close = connection.State != ConnectionState.Open;
            try
            {
                if (close) await connection.OpenAsync(ct);
                await using var cmd = new SqlCommand("dbo." + procedure, connection)
                    { CommandType = CommandType.StoredProcedure, CommandTimeout = 60 };
                foreach (var a in args)
                {
                    var p = cmd.Parameters.Add(a.Name, a.Type);
                    if (a.Type == SqlDbType.Decimal) { p.Precision = 18; p.Scale = 2; }
                    p.Value = a.Value ?? DBNull.Value;
                }
                await using var reader = await cmd.ExecuteReaderAsync(ct);
                do
                {
                    if (reader.FieldCount == 0) continue;
                    var rows = new List<Dictionary<string, object?>>();
                    while (await reader.ReadAsync(ct))
                    {
                        var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
                        for (var i = 0; i < reader.FieldCount; i++)
                            row[reader.GetName(i)] = await reader.IsDBNullAsync(i, ct) ? null : reader.GetValue(i);
                        rows.Add(row);
                    }
                    sets.Add(rows);
                } while (await reader.NextResultAsync(ct));
            }
            finally { if (close) await connection.CloseAsync(); }
            return Ok(new { conjuntos = sets });
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 53000)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error en {Procedimiento}", procedure);
            return StatusCode(500, new { mensaje = "No se pudo completar la operación." });
        }
    }
}
