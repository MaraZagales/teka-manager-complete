using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Controllers;

[ApiController]
[Authorize]
[Route("api/ecommerce/catalogo/{productoId:int}/imagenes/archivo")]
public sealed class EcommerceImagenArchivoController : ControllerBase
{
    private readonly TekaDbContext _db;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<EcommerceImagenArchivoController> _logger;
    private const long MaxBytes = 5 * 1024 * 1024;

    public EcommerceImagenArchivoController(TekaDbContext db, IWebHostEnvironment environment, ILogger<EcommerceImagenArchivoController> logger)
    { _db = db; _environment = environment; _logger = logger; }

    [HttpPost]
    [RequestSizeLimit(MaxBytes + 65536)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Subir(int productoId, [FromForm] IFormFile archivo,
        [FromForm] bool esPrincipal = false, [FromForm] int ordenVisual = 0,
        [FromForm] string? textoAlternativo = null, CancellationToken ct = default)
    {
        if (archivo is null || archivo.Length == 0 || archivo.Length > MaxBytes)
            return BadRequest(new { mensaje = "La fotografía debe tener entre 1 byte y 5 MB." });
        if (ordenVisual < 0 || (textoAlternativo?.Length ?? 0) > 250)
            return BadRequest(new { mensaje = "Orden o texto alternativo inválidos." });

        var ext = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        var mime = archivo.ContentType.ToLowerInvariant();
        if (!((ext is ".jpg" or ".jpeg") && mime == "image/jpeg" ||
              ext == ".png" && mime == "image/png" ||
              ext == ".webp" && mime == "image/webp"))
            return BadRequest(new { mensaje = "Solo se aceptan archivos JPG, PNG o WebP." });
        // No confiar únicamente en extensión ni Content-Type: comprobar firma binaria.
        var firma = new byte[12];
        await using (var input = archivo.OpenReadStream())
        {
            var leidos = await input.ReadAsync(firma.AsMemory(0, firma.Length), ct);
            bool jpeg = leidos >= 3 && firma[0] == 0xFF && firma[1] == 0xD8 && firma[2] == 0xFF;
            bool png = leidos >= 8 && firma.AsSpan(0, 8).SequenceEqual(new byte[] {137,80,78,71,13,10,26,10});
            bool webp = leidos >= 12 && System.Text.Encoding.ASCII.GetString(firma, 0, 4) == "RIFF" &&
                        System.Text.Encoding.ASCII.GetString(firma, 8, 4) == "WEBP";
            if (!((ext is ".jpg" or ".jpeg") && jpeg || ext == ".png" && png || ext == ".webp" && webp))
                return BadRequest(new { mensaje = "El contenido del archivo no coincide con el formato declarado." });
        }
        string? ruta = null;
        try
        {
            var conn = (SqlConnection)_db.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync(ct);
            await using (var validar = new SqlCommand("SELECT COUNT(1) FROM dbo.Producto WHERE ProductoId=@id", conn))
            {
                validar.Parameters.AddWithValue("@id", productoId);
                if (Convert.ToInt32(await validar.ExecuteScalarAsync(ct)) == 0)
                    return NotFound(new { mensaje = "El producto no existe." });
            }
            await using (var contar = new SqlCommand("SELECT COUNT(1) FROM dbo.ProductoImagen WHERE ProductoId=@id", conn))
            {
                contar.Parameters.AddWithValue("@id", productoId);
                if (Convert.ToInt32(await contar.ExecuteScalarAsync(ct)) >= 3)
                    return Conflict(new { mensaje = "El producto ya tiene tres fotografías." });
            }
            var webroot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var carpeta = Path.Combine(webroot, "ecommerce", "productos", productoId.ToString());
            Directory.CreateDirectory(carpeta);
            var nombre = Guid.NewGuid().ToString("N") + ext;
            ruta = Path.Combine(carpeta, nombre);
            await using (var salida = new FileStream(ruta, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                await archivo.CopyToAsync(salida, ct);
            var urlRelativa = $"{Request.Scheme}://{Request.Host}/ecommerce/productos/{productoId}/{nombre}";
            await using var cmd = new SqlCommand("dbo.sp_Ecommerce_Imagen_Guardar", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@ProductoId", productoId);
            cmd.Parameters.AddWithValue("@ProductoImagenId", DBNull.Value);
            cmd.Parameters.AddWithValue("@UrlArchivo", urlRelativa);
            cmd.Parameters.AddWithValue("@TextoAlternativo", (object?)textoAlternativo ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@EsPrincipal", esPrincipal);
            cmd.Parameters.AddWithValue("@OrdenVisual", ordenVisual);
            var id = Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
            return Ok(new { productoImagenId = id, urlArchivo = urlRelativa });
        }
        catch (SqlException ex) when (ex.Number is >= 51010 and <= 51012)
        {
            if (ruta is not null && System.IO.File.Exists(ruta)) System.IO.File.Delete(ruta);
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception ex)
        {
            if (ruta is not null && System.IO.File.Exists(ruta)) System.IO.File.Delete(ruta);
            _logger.LogError(ex, "Error al subir fotografía de producto {ProductoId}", productoId);
            return StatusCode(500, new { mensaje = "No se pudo subir la fotografía." });
        }
    }
}
