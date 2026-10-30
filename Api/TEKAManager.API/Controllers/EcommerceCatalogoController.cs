using Microsoft.AspNetCore.Authorization;
using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

// Administración del catálogo: no expone todavía el checkout ni el catálogo público.
// Mantener detrás de la autenticación/permisos administrativos al habilitar el canal.
[ApiController]
[Authorize]
[Route("api/ecommerce/catalogo")]
public sealed class EcommerceCatalogoController : ControllerBase
{
    private readonly TekaDbContext _db;
    private readonly ILogger<EcommerceCatalogoController> _logger;

    public EcommerceCatalogoController(TekaDbContext db, ILogger<EcommerceCatalogoController> logger)
    {
        _db = db;
        _logger = logger;
    }

    public sealed record FichaRequest(
        bool Publicado, bool Destacado, int OrdenVisual, string? DescripcionComercial,
        int? DepositoId, decimal? CupoOnline,
        string? UrlGlb, string? UrlUsdz, bool EscalaValidada,
        decimal? AnchoCm, decimal? AltoCm, decimal? ProfundidadCm);

    public sealed record ImagenRequest(
        string UrlArchivo, string? TextoAlternativo, bool EsPrincipal, int OrdenVisual);

    private async Task<SqlConnection> AbrirConexion(CancellationToken ct)
    {
        var conn = (SqlConnection)_db.Database.GetDbConnection();
        if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
        return conn;
    }

    private static SqlParameter Param(string name, object? value) =>
        new(name, value ?? DBNull.Value);

    private static object? Valor(SqlDataReader reader, string name)
    {
        var index = reader.GetOrdinal(name);
        return reader.IsDBNull(index) ? null : reader.GetValue(index);
    }

    // Una consulta para el listado administrativo; no reemplaza la ficha detallada.
    [HttpGet("resumen")]
    public async Task<IActionResult> Resumen(CancellationToken ct)
    {
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Catalogo_Resumen", conn)
            { CommandType = CommandType.StoredProcedure };
            var items = new List<object>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
                items.Add(new {
                    ProductoId = Valor(reader, "ProductoId"),
                    Configurado = Valor(reader, "Configurado"),
                    Publicado = Valor(reader, "Publicado"),
                    UrlPortada = Valor(reader, "UrlPortada")
                });
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar resumen ecommerce");
            return StatusCode(500, new { mensaje = "No se pudo consultar el resumen comercial." });
        }
    }

    // Lectura pública: no expone productos ocultos ni inactivos.
    [AllowAnonymous]
    [HttpGet("publico")]
    public async Task<IActionResult> Publico(CancellationToken ct)
    {
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Catalogo_Publico", conn)
            { CommandType = CommandType.StoredProcedure };
            var items = new List<object>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
                items.Add(new {
                    ProductoId = Valor(reader, "ProductoId"), Codigo = Valor(reader, "Codigo"),
                    Nombre = Valor(reader, "Nombre"), DescripcionComercial = Valor(reader, "DescripcionComercial"),
                    Precio = Valor(reader, "Precio"), AnchoCm = Valor(reader, "AnchoCm"),
                    AltoCm = Valor(reader, "AltoCm"), ProfundidadCm = Valor(reader, "ProfundidadCm"),
                    DepositoId = Valor(reader, "DepositoId"), CupoOnline = Valor(reader, "CupoOnline"),
                    UrlPortada = Valor(reader, "UrlPortada"), Destacado = Valor(reader, "Destacado"),
                    OrdenVisual = Valor(reader, "OrdenVisual")
                });
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar catálogo público");
            return StatusCode(500, new { mensaje = "No se pudo consultar el catálogo público." });
        }
    }

    [HttpGet("{productoId:int}")]
    public async Task<IActionResult> Obtener(int productoId, CancellationToken ct)
    {
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Producto_Get", conn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add(Param("@ProductoId", productoId));
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct)) return NotFound();
            var ficha = new
            {
                ProductoId = Valor(reader, "ProductoId"),
                Publicado = Valor(reader, "Publicado"),
                Destacado = Valor(reader, "Destacado"),
                OrdenVisual = Valor(reader, "OrdenVisual"),
                DescripcionComercial = Valor(reader, "DescripcionComercial"),
                AnchoCm = Valor(reader, "AnchoCm"),
                AltoCm = Valor(reader, "AltoCm"),
                ProfundidadCm = Valor(reader, "ProfundidadCm"),
                DepositoId = Valor(reader, "DepositoId"),
                CupoOnline = Valor(reader, "CupoOnline"),
                UrlGlb = Valor(reader, "UrlGlb"),
                UrlUsdz = Valor(reader, "UrlUsdz"),
                EscalaValidada = Valor(reader, "EscalaValidada")
            };
            var imagenes = new List<object>();
            await reader.NextResultAsync(ct);
            while (await reader.ReadAsync(ct))
                imagenes.Add(new {
                    ProductoImagenId = Valor(reader, "ProductoImagenId"),
                    UrlArchivo = Valor(reader, "UrlArchivo"),
                    TextoAlternativo = Valor(reader, "TextoAlternativo"),
                    EsPrincipal = Valor(reader, "EsPrincipal"),
                    OrdenVisual = Valor(reader, "OrdenVisual")
                });
            return Ok(new { Ficha = ficha, Imagenes = imagenes });
        }
        catch (SqlException ex) when (ex.Number == 51000) { return NotFound(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al consultar ficha ecommerce {ProductoId}", productoId);
            return StatusCode(500, new { mensaje = "No se pudo consultar la ficha comercial." });
        }
    }

    [HttpPut("{productoId:int}")]
    public async Task<IActionResult> Guardar(int productoId, [FromBody] FichaRequest request, CancellationToken ct)
    {
        if (request.OrdenVisual < 0 || (request.Destacado && !request.Publicado))
            return BadRequest(new { mensaje = "Orden o publicación inválidos." });
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Producto_Guardar", conn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add(Param("@ProductoId", productoId));
            cmd.Parameters.Add(Param("@Publicado", request.Publicado));
            cmd.Parameters.Add(Param("@Destacado", request.Destacado));
            cmd.Parameters.Add(Param("@OrdenVisual", request.OrdenVisual));
            cmd.Parameters.Add(Param("@DescripcionComercial", request.DescripcionComercial));
            cmd.Parameters.Add(Param("@AnchoCm", request.AnchoCm));
            cmd.Parameters.Add(Param("@AltoCm", request.AltoCm));
            cmd.Parameters.Add(Param("@ProfundidadCm", request.ProfundidadCm));
            cmd.Parameters.Add(Param("@DepositoId", request.DepositoId));
            cmd.Parameters.Add(Param("@CupoOnline", request.CupoOnline));
            cmd.Parameters.Add(Param("@UrlGlb", request.UrlGlb));
            cmd.Parameters.Add(Param("@UrlUsdz", request.UrlUsdz));
            cmd.Parameters.Add(Param("@EscalaValidada", request.EscalaValidada));
            await cmd.ExecuteNonQueryAsync(ct);
            return NoContent();
        }
        catch (SqlException ex) when (ex.Number is >= 51001 and <= 51009)
        { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar ficha ecommerce {ProductoId}", productoId);
            return StatusCode(500, new { mensaje = "No se pudo guardar la ficha comercial." });
        }
    }

    [HttpPost("{productoId:int}/imagenes")]
    public async Task<IActionResult> AgregarImagen(int productoId, [FromBody] ImagenRequest request, CancellationToken ct)
        => await GuardarImagen(productoId, null, request, ct);

    [HttpPut("{productoId:int}/imagenes/{imagenId:int}")]
    public async Task<IActionResult> EditarImagen(int productoId, int imagenId, [FromBody] ImagenRequest request, CancellationToken ct)
        => await GuardarImagen(productoId, imagenId, request, ct);

    private async Task<IActionResult> GuardarImagen(int productoId, int? imagenId, ImagenRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.UrlArchivo) || request.OrdenVisual < 0)
            return BadRequest(new { mensaje = "La URL y el orden de imagen son obligatorios." });
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Imagen_Guardar", conn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add(Param("@ProductoId", productoId));
            cmd.Parameters.Add(Param("@ProductoImagenId", imagenId));
            cmd.Parameters.Add(Param("@UrlArchivo", request.UrlArchivo));
            cmd.Parameters.Add(Param("@TextoAlternativo", request.TextoAlternativo));
            cmd.Parameters.Add(Param("@EsPrincipal", request.EsPrincipal));
            cmd.Parameters.Add(Param("@OrdenVisual", request.OrdenVisual));
            var id = await cmd.ExecuteScalarAsync(ct);
            return Ok(new { ProductoImagenId = id });
        }
        catch (SqlException ex) when (ex.Number is >= 51010 and <= 51012)
        { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar imagen ecommerce {ProductoId}", productoId);
            return StatusCode(500, new { mensaje = "No se pudo guardar la imagen." });
        }
    }

    [HttpDelete("{productoId:int}/imagenes/{imagenId:int}")]
    public async Task<IActionResult> EliminarImagen(int productoId, int imagenId, CancellationToken ct)
    {
        try
        {
            var conn = await AbrirConexion(ct);
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Imagen_Eliminar", conn)
            { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.Add(Param("@ProductoId", productoId));
            cmd.Parameters.Add(Param("@ProductoImagenId", imagenId));
            await cmd.ExecuteNonQueryAsync(ct);
            return NoContent();
        }
        catch (SqlException ex) when (ex.Number == 51013)
        { return NotFound(new { mensaje = ex.Message }); }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar imagen ecommerce {ImagenId}", imagenId);
            return StatusCode(500, new { mensaje = "No se pudo eliminar la imagen." });
        }
    }
}
