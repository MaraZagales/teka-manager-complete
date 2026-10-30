using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using TEKAManager.Core.Requests;

namespace TEKAManager.API.Services;

public sealed class OpenAiRecorteOptions
{
    public bool Enabled { get; set; } = true;
    public string Model { get; set; } = "gpt-4o-mini";
    public int MaxRecortes { get; set; } = 40;
    public int MaxOutputTokens { get; set; } = 8000;
    public int TimeoutSeconds { get; set; } = 90;
    public bool ImagesEnabled { get; set; }
    public string? ImageModel { get; set; }
    public int MaxImages { get; set; } = 0;
    public int PendingTimeoutMinutes { get; set; } = 15;
}

/// <summary>Proveedor oficial Responses API. El resultado técnico lo calcula TEKA.</summary>
public sealed class OpenAiRecorteProvider(HttpClient http, IOptions<OpenAiRecorteOptions> settings,
    IConfiguration configuration,
    IRecorteImagenes images, ILogger<OpenAiRecorteProvider> logger) : IRecorteGeneradorConArchivos
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private readonly OpenAiRecorteOptions _options = settings.Value;

    public async Task<RecorteDisenoGeneration> GenerarAsync(RecorteGeneracionSnapshot context,
        CancellationToken ct = default)
    {
        var configuredKey = configuration["OpenAI:ApiKey"];
        var key = string.IsNullOrWhiteSpace(configuredKey)
            ? Environment.GetEnvironmentVariable("OPENAI_API_KEY") : configuredKey;
        if (!_options.Enabled || string.IsNullOrWhiteSpace(key))
            throw new RecorteProveedorException("PROVEEDOR_DESHABILITADO", "OpenAI no está habilitado en el servidor.");
        if (context.Recortes.Count > _options.MaxRecortes)
            throw new RecorteProveedorException("CONTEXTO_EXCESIVO", "El inventario elegible supera el límite configurado por generación.");

        var inventory = context.Recortes.Select(r => new
        {
            r.RecorteId, r.InsumoId, r.TipoInsumoId, r.TipoInsumoNombre,
            r.ColorId, r.LargoMm, r.AnchoMm, r.EspesorMm, r.OrientacionVeta,
            r.CantidadDisponible, r.DepositoId
        });
        var prompt = """
            Proponé entre una y cinco alternativas NUEVAS de muebles pequeños de melamina para una fábrica de Córdoba:
            organizadores, estantes, mesas auxiliares o mesas de luz. Usá únicamente los recortes del JSON adjunto.
            Las medidas y coordenadas son milímetros con hasta dos decimales. Cada asignación posiciona una pieza;
            indicá ancho de sierra, margen y tolerancia explícitos. No supongas precios, compras, herramientas,
            acabados, insumos complementarios ni colores que no estén en el contexto. Si no conocés el ID real
            de un insumo complementario, dejá la lista vacía e indicá la necesidad en advertencias.
            No declares factibilidad ni estado de aprobación: TEKA verificará todo el despiece y el inventario.
            No uses un recorte fuera del listado ni afirmes que una imagen es un plano técnico.
            Inventario persistido antes de esta solicitud:
            """ + JsonSerializer.Serialize(inventory, Json);
        var payload = new
        {
            model = _options.Model,
            instructions = "Sos un diseñador industrial. Respondé solo mediante el esquema JSON proporcionado.",
            input = prompt,
            text = new { format = new { type = "json_schema", name = "teka_recortes_2b_1",
                strict = true, schema = OpenAiRecorteSchema.Value } },
            max_output_tokens = _options.MaxOutputTokens,
            store = false
        };
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses")
        { Content = JsonContent.Create(payload, options: Json) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
        timeout.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));
        HttpResponseMessage response;
        try { response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, timeout.Token); }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        { throw new RecorteProveedorException("PROVEEDOR_TIMEOUT", "OpenAI excedió el tiempo de espera."); }
        catch (HttpRequestException)
        { throw new RecorteProveedorException("PROVEEDOR_RED", "No se pudo contactar a OpenAI."); }
        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var code = response.StatusCode switch
                {
                    HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden => "PROVEEDOR_AUTENTICACION",
                    HttpStatusCode.TooManyRequests => "PROVEEDOR_LIMITE",
                    _ => "PROVEEDOR_HTTP"
                };
                logger.LogWarning("OpenAI Responses devolvió HTTP {StatusCode}", (int)response.StatusCode);
                throw new RecorteProveedorException(code, "El proveedor no pudo generar propuestas.");
            }
            JsonDocument doc;
            try
            {
                await using var stream = await response.Content.ReadAsStreamAsync(timeout.Token);
                doc = await JsonDocument.ParseAsync(stream, new JsonDocumentOptions { MaxDepth = 48 }, timeout.Token);
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            { throw new RecorteProveedorException("PROVEEDOR_TIMEOUT", "OpenAI excedió el tiempo de espera."); }
            catch (JsonException)
            { throw new RecorteProveedorException("RESPUESTA_INVALIDA", "OpenAI devolvió JSON inválido."); }
            using (doc)
            {
            var root = doc.RootElement;
            if (!root.TryGetProperty("status", out var status) || status.GetString() != "completed" ||
                !root.TryGetProperty("output", out var output) || output.ValueKind != JsonValueKind.Array)
                throw new RecorteProveedorException("RESPUESTA_INCOMPLETA", "OpenAI no completó la respuesta estructurada.");
            string? content = null;
            foreach (var item in output.EnumerateArray())
            {
                if (!item.TryGetProperty("content", out var parts) || parts.ValueKind != JsonValueKind.Array) continue;
                foreach (var part in parts.EnumerateArray())
                {
                    var type = part.TryGetProperty("type", out var kind) ? kind.GetString() : null;
                    if (type == "refusal")
                        throw new RecorteProveedorException("PROVEEDOR_RECHAZO", "OpenAI rechazó la generación.");
                    if (type == "output_text" && part.TryGetProperty("text", out var text))
                        content = text.GetString();
                }
            }
            if (string.IsNullOrWhiteSpace(content) || content.Length > 1_000_000)
                throw new RecorteProveedorException("RESPUESTA_INVALIDA", "OpenAI devolvió una respuesta vacía o excesiva.");
            ProviderEnvelope? envelope;
            try { envelope = JsonSerializer.Deserialize<ProviderEnvelope>(content, Json); }
            catch (JsonException) { throw new RecorteProveedorException("RESPUESTA_INVALIDA", "OpenAI devolvió JSON inválido."); }
            if (envelope?.Propuestas is null || envelope.Propuestas.Count is < 1 or > 5 ||
                envelope.Propuestas.Any(p => p is null || p.Piezas is null || p.Asignaciones is null ||
                    p.InsumosComplementarios is null || p.Advertencias is null || p.Supuestos is null ||
                    p.Piezas.Count > 20 || p.Asignaciones.Count > 80))
                throw new RecorteProveedorException("RESPUESTA_INVALIDA", "OpenAI devolvió propuestas incompletas.");
            var generation = new RecorteDisenoGeneration
            {
                ContratoUid = context.SolicitudUid, SolicitudUid = context.SolicitudUid,
                SnapshotPrevioGeneracionId = context.SnapshotId,
                UsuarioId = context.UsuarioId,
                RecortesConsiderados = context.Recortes.Select(x => x.RecorteId).ToList(),
                Propuestas = envelope.Propuestas.Select(Map).ToList()
            };
            try { TEKAManager.Core.Services.RecorteDisenoService.ValidarContrato(generation); }
            catch (Exception ex) when (ex is InvalidOperationException or ArgumentException)
            { throw new RecorteProveedorException("RESPUESTA_INVALIDA", "OpenAI devolvió un despiece estructuralmente inválido."); }
            if (_options.ImagesEnabled)
            {
                foreach (var design in generation.Propuestas.Take(_options.MaxImages))
                {
                    try
                    {
                        var reference = await images.GenerarAsync(context.GeneracionId, design, ct);
                        design.Imagenes.Add(new RecorteDisenoImagenDraft
                        { Referencia = reference, Tipo = "Ilustrativa", Origen = "OpenAI" });
                    }
                    catch (OperationCanceledException) when (ct.IsCancellationRequested)
                    {
                        try { await LimpiarArchivosAsync(generation, CancellationToken.None); }
                        catch (Exception cleanupError)
                        { logger.LogWarning("No se pudieron limpiar imágenes de una generación cancelada: {ErrorType}", cleanupError.GetType().Name); }
                        throw;
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning("No se generó una imagen ilustrativa: {ErrorType}", ex.GetType().Name);
                        design.Advertencias.Add("Imagen ilustrativa no disponible; el despiece puede consultarse igualmente.");
                    }
                }
            }
            return generation;
            }
        }
    }

    public async Task LimpiarArchivosAsync(RecorteDisenoGeneration generation, CancellationToken ct = default)
    {
        foreach (var reference in generation.Propuestas.SelectMany(x => x.Imagenes).Select(x => x.Referencia))
            await images.EliminarAsync(reference, ct);
    }

    private static RecorteDisenoDraft Map(ProviderDesign p)
    {
        var costs = p.Asignaciones.Select(a => a.RecorteId).Distinct().Select(_ => new RecorteDisenoCostoDraft
        { Tipo = "Recorte", Cantidad = 1, MotivoIncompleto = "No existe una fuente verificable de costo del recorte." }).ToList();
        costs.AddRange(p.InsumosComplementarios.Select(i => new RecorteDisenoCostoDraft
        { Tipo = "Insumo", InsumoId = i.InsumoId, Cantidad = i.Cantidad,
          MotivoIncompleto = "No se consultó una compra válida para este insumo." }));
        return new RecorteDisenoDraft
        {
            FamiliaUid = Guid.NewGuid(), Nombre = p.Nombre, Descripcion = p.Descripcion,
            MaterialInsumoId = p.MaterialInsumoId, ColorId = p.ColorId,
            LargoExteriorMm = p.LargoExteriorMm, AnchoExteriorMm = p.AnchoExteriorMm,
            AltoExteriorMm = p.AltoExteriorMm, CantidadSugerida = p.CantidadSugerida,
            Piezas = p.Piezas, Asignaciones = p.Asignaciones,
            InsumosComplementarios = p.InsumosComplementarios,
            Advertencias = p.Advertencias, Supuestos = p.Supuestos, Costos = costs
        };
    }

    private sealed class ProviderEnvelope
    {
        public List<ProviderDesign> Propuestas { get; set; } = [];
    }
    private sealed class ProviderDesign
    {
        public string Nombre { get; set; } = "";
        public string Descripcion { get; set; } = "";
        public int? MaterialInsumoId { get; set; }
        public int? ColorId { get; set; }
        public decimal LargoExteriorMm { get; set; }
        public decimal AnchoExteriorMm { get; set; }
        public decimal AltoExteriorMm { get; set; }
        public int CantidadSugerida { get; set; }
        public List<RecorteDisenoPiezaDraft> Piezas { get; set; } = [];
        public List<RecorteDisenoAsignacionDraft> Asignaciones { get; set; } = [];
        public List<RecorteDisenoInsumoDraft> InsumosComplementarios { get; set; } = [];
        public List<string> Advertencias { get; set; } = [];
        public List<string> Supuestos { get; set; } = [];
    }
}
