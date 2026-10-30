using System.Data;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TEKAManager.Core.Data;
using TEKAManager.Core.Requests;

namespace TEKAManager.API.Services;

public interface IRecorteImagenes
{
    Task<string> GenerarAsync(long generationId, RecorteDisenoDraft design, CancellationToken ct);
    Task EliminarAsync(string reference, CancellationToken ct);
    Task<byte[]?> LeerAutorizadaAsync(long generationId, string fileName, CancellationToken ct);
}

/// <summary>Guarda imágenes ilustrativas fuera de wwwroot; la lectura exige permiso del módulo.</summary>
public sealed class OpenAiRecorteImages(HttpClient http, IOptions<OpenAiRecorteOptions> settings,
    IWebHostEnvironment environment, TekaDbContext db, IConfiguration configuration,
    ILogger<OpenAiRecorteImages> logger) : IRecorteImagenes
{
    private readonly OpenAiRecorteOptions _options = settings.Value;
    private static readonly Regex SafeName = new("^[a-f0-9]{32}\\.webp$", RegexOptions.Compiled);
    private string Root => Path.Combine(environment.ContentRootPath, "PrivateImages", "Recortes");

    public async Task<string> GenerarAsync(long generationId, RecorteDisenoDraft design, CancellationToken ct)
    {
        var configuredKey = configuration["OpenAI:ApiKey"];
        var key = string.IsNullOrWhiteSpace(configuredKey)
            ? Environment.GetEnvironmentVariable("OPENAI_API_KEY") : configuredKey;
        if (!_options.ImagesEnabled || _options.MaxImages == 0 ||
            string.IsNullOrWhiteSpace(_options.ImageModel) || string.IsNullOrWhiteSpace(key))
            throw new RecorteProveedorException("IMAGEN_DESHABILITADA", "La generación de imágenes no está configurada.");
        string? color = null;
        if (design.ColorId is int colorId)
        {
            await using var connection = new SqlConnection(db.Database.GetConnectionString());
            await connection.OpenAsync(ct);
            await using var command = new SqlCommand(
                "SELECT Nombre FROM dbo.Color WHERE ColorId=@id AND Activo=1", connection);
            command.Parameters.Add("@id", SqlDbType.Int).Value = colorId;
            color = await command.ExecuteScalarAsync(ct) as string;
        }
        var pieces = string.Join("; ", design.Piezas.OrderBy(x => x.OrdenPieza).Take(20)
            .Select(x => $"{x.Cantidad} {x.Nombre} ({x.LargoMm} x {x.AnchoMm} x {x.EspesorMm} mm)"));
        var prompt = $"Imagen conceptual de un único mueble pequeño nuevo de melamina: {design.Nombre}. " +
            $"Descripción: {design.Descripcion}. Medidas exteriores {design.LargoExteriorMm} x " +
            $"{design.AnchoExteriorMm} x {design.AltoExteriorMm} mm. " +
            $"Piezas visibles y estructura propuestas: {pieces}. " +
            (color is null ? "El color exacto no está verificado. " : $"Color del material: {color}. ") +
            "Respetar la distribución de puertas, cajones, estantes y apoyos indicada por las piezas. " +
            "Vista en perspectiva sobre fondo neutro, sin cotas, marcas, texto ni detalles constructivos inventados. " +
            "Es una ilustración, no un plano técnico de fabricación.";
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/images/generations")
        {
            Content = JsonContent.Create(new { model = _options.ImageModel, prompt,
                n = 1, size = "1024x1024", quality = "low", output_format = "webp" })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));
        HttpResponseMessage response;
        try { response = await http.SendAsync(request, timeout.Token); }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        { throw new RecorteProveedorException("IMAGEN_TIMEOUT", "La imagen excedió el tiempo de espera."); }
        catch (HttpRequestException)
        { throw new RecorteProveedorException("IMAGEN_RED", "No se pudo contactar al servicio de imágenes."); }
        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("OpenAI Images devolvió HTTP {StatusCode}", (int)response.StatusCode);
                throw new RecorteProveedorException("IMAGEN_HTTP", "No se pudo generar la imagen ilustrativa.");
            }
            await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: timeout.Token);
            if (!document.RootElement.TryGetProperty("data", out var data) ||
                data.ValueKind != JsonValueKind.Array || data.GetArrayLength() != 1 ||
                !data[0].TryGetProperty("b64_json", out var base64) ||
                base64.ValueKind != JsonValueKind.String || base64.GetString() is not { } encoded ||
                encoded.Length > 8_000_000)
                throw new RecorteProveedorException("IMAGEN_INVALIDA", "La imagen no tiene el formato esperado.");
            byte[] bytes;
            try { bytes = Convert.FromBase64String(encoded); }
            catch (FormatException) { throw new RecorteProveedorException("IMAGEN_INVALIDA", "La imagen no se pudo decodificar."); }
            if (bytes.Length is < 12 or > 5_000_000 ||
                !bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) ||
                !bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8))
                throw new RecorteProveedorException("IMAGEN_INVALIDA", "La imagen no es WebP válido.");
            var directory = Path.Combine(Root, generationId.ToString());
            Directory.CreateDirectory(directory);
            var fileName = Guid.NewGuid().ToString("N") + ".webp";
            var path = Path.Combine(directory, fileName);
            try { await File.WriteAllBytesAsync(path, bytes, ct); }
            catch
            {
                try { if (File.Exists(path)) File.Delete(path); }
                catch (IOException) { /* La limpieza posterior puede recuperar el archivo parcial. */ }
                throw;
            }
            return $"/api/recortes-inteligentes/imagenes/{generationId}/{fileName}";
        }
    }

    public Task EliminarAsync(string reference, CancellationToken ct)
    {
        var parts = reference.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 5 && parts[0] == "api" && parts[1] == "recortes-inteligentes" &&
            parts[2] == "imagenes" && long.TryParse(parts[3], out var generationId) &&
            generationId > 0 && SafeName.IsMatch(parts[4]))
        {
            var path = Path.Combine(Root, generationId.ToString(), parts[4]);
            if (File.Exists(path)) File.Delete(path);
        }
        return Task.CompletedTask;
    }

    public async Task<byte[]?> LeerAutorizadaAsync(long generationId, string fileName, CancellationToken ct)
    {
        if (generationId <= 0 || !SafeName.IsMatch(fileName)) return null;
        var reference = $"/api/recortes-inteligentes/imagenes/{generationId}/{fileName}";
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var command = new SqlCommand("""
            SELECT COUNT(*) FROM dbo.RecorteDisenoImagen i
            JOIN dbo.RecorteDiseno d ON d.RecorteDisenoId=i.RecorteDisenoId
            WHERE d.RecorteGeneracionId=@generation AND i.Referencia=@reference
            """, connection);
        command.Parameters.Add("@generation", SqlDbType.BigInt).Value = generationId;
        command.Parameters.Add("@reference", SqlDbType.NVarChar, 500).Value = reference;
        if (Convert.ToInt32(await command.ExecuteScalarAsync(ct)) != 1) return null;
        var path = Path.Combine(Root, generationId.ToString(), fileName);
        return File.Exists(path) ? await File.ReadAllBytesAsync(path, ct) : null;
    }
}
