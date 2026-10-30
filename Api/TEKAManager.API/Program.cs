using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TEKAManager.API.Security;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.Services;
using System.Threading.RateLimiting;
using TEKAManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Base de datos ──────────────────────────────────────────
builder.Services.AddDbContext<TekaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Servicios de inventario ────────────────────────────────
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IInsumoService, InsumoService>();
builder.Services.AddScoped<IStockService, StockService>();
// Consultas historicas de Existencias (solo lectura).
builder.Services.AddScoped<IExistenciasHistoricoService, ExistenciasHistoricoService>();
builder.Services.AddScoped<IMovimientoStockService, MovimientoStockService>();
builder.Services.AddScoped<MovimientosAnaliticaService>();
builder.Services.AddScoped<IAuxiliarService, AuxiliarService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<ClienteFichaConsultaService>();
builder.Services.AddScoped<ICobroService, CobroService>();
// Caja: servicio aislado, sin modificar Cobros ni Ventas.
builder.Services.AddScoped<CajaSqlService>();
builder.Services.AddScoped<IDomicilioClienteService, DomicilioClienteService>();
builder.Services.AddScoped<TipoDomicilioService>();
builder.Services.AddScoped<IPrecioVentaService, PrecioVentaService>();
builder.Services.AddScoped<PrecioVentaCalculoRegistroService>();
builder.Services.AddScoped<ParametroCostoPrecioService>();
builder.Services.AddScoped<CostoProductoEstimadoService>();
builder.Services.AddScoped<IComprobanteService, ComprobanteService>();
builder.Services.AddScoped<ComprobanteDocumentoService>();
builder.Services.AddScoped<IRemitoService, RemitoService>();
builder.Services.AddScoped<IProduccionService, ProduccionService>();
builder.Services.AddScoped<ProductionCutPlanner>();
builder.Services.AddScoped<ProductionFabricationPreviewService>();
builder.Services.AddScoped<ProductionTechnicalCatalogService>();
builder.Services.AddScoped<IRecorteService, RecorteService>();
builder.Services.AddScoped<RecorteDisenoService>();
builder.Services.AddScoped<RecorteSnapshotService>();
builder.Services.AddScoped<TEKAManager.Core.Requests.IRecorteGeneracionSnapshotPrevio, RecorteSnapshotService>();
builder.Services.AddScoped<TEKAManager.Core.Requests.IRecorteGeneracionResultadoStore, RecorteDisenoService>();
builder.Services.AddScoped<TEKAManager.Core.Requests.IRecorteGeneracionGate, RecorteGeneracionSqlGate>();
builder.Services.AddScoped<RecortePropuestaValidador>();
builder.Services.AddScoped<RecorteMotorGeneracionService>();
builder.Services.AddOptions<OpenAiRecorteOptions>()
    .Bind(builder.Configuration.GetSection("OpenAI"))
    .Validate(x => (!x.Enabled || !string.IsNullOrWhiteSpace(x.Model)) &&
        x.MaxRecortes is >= 1 and <= 100 && x.MaxOutputTokens is >= 1000 and <= 20000 &&
        x.TimeoutSeconds is >= 10 and <= 180 && x.MaxImages is >= 0 and <= 5 &&
        x.PendingTimeoutMinutes is >= 5 and <= 1440 &&
        (!x.ImagesEnabled || x.MaxImages > 0 && !string.IsNullOrWhiteSpace(x.ImageModel)),
        "Configuración de OpenAI para Recortes inválida.")
    .ValidateOnStart();
builder.Services.AddHttpClient<OpenAiRecorteProvider>(client => client.Timeout = Timeout.InfiniteTimeSpan);
builder.Services.AddHttpClient<OpenAiRecorteImages>(client => client.Timeout = Timeout.InfiniteTimeSpan);
builder.Services.AddScoped<IRecorteImagenes>(provider => provider.GetRequiredService<OpenAiRecorteImages>());
builder.Services.AddScoped<TEKAManager.Core.Requests.IRecorteGeneradorPropuestas>(provider =>
    provider.GetRequiredService<OpenAiRecorteProvider>());
builder.Services.AddScoped<ISeguridadService, SeguridadService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IPasswordRecoveryService, PasswordRecoveryService>();
builder.Services.AddScoped<IOportunidadService, OportunidadService>();
builder.Services.AddScoped<IInteresComercialService, InteresComercialService>();
builder.Services.AddScoped<ICarritoService, CarritoService>();
builder.Services.AddOptions<ComercialDigitalOptions>()
    .Bind(builder.Configuration.GetSection(ComercialDigitalOptions.SectionName))
    .Validate(x => x.HorasCarritoAbandonado > 0, "HorasCarritoAbandonado debe ser mayor a cero.")
    .Validate(x => x.HorasCheckoutInterrumpido > 0, "HorasCheckoutInterrumpido debe ser mayor a cero.")
    .Validate(x => x.IntervaloProcesamientoMinutos > 0, "IntervaloProcesamientoMinutos debe ser mayor a cero.")
    .ValidateOnStart();
builder.Services.AddHostedService<ComercialDigitalBackgroundService>();
builder.Services.AddOptions<WhatsAppOptions>()
    .Bind(builder.Configuration.GetSection(WhatsAppOptions.SectionName));
builder.Services.AddSingleton<IWhatsAppWebhookQueue, WhatsAppWebhookQueue>();
builder.Services.AddHttpClient<IWhatsAppService, WhatsAppService>(client =>
{
    client.BaseAddress = new Uri("https://graph.facebook.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddHostedService<WhatsAppWebhookBackgroundService>();

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<AuditActionFilter>();
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Falta Jwt:Key.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o => { o.TokenValidationParameters = new TokenValidationParameters { ValidateIssuer=true, ValidateAudience=true, ValidateLifetime=true, ValidateIssuerSigningKey=true, ValidIssuer=builder.Configuration["Jwt:Issuer"]??"TEKA", ValidAudience=builder.Configuration["Jwt:Audience"]??"TEKA-Manager", IssuerSigningKey=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), ClockSkew=TimeSpan.FromMinutes(1) }; });

// ── Controllers + Swagger ──────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "http://localhost:8081",
                "http://127.0.0.1:8081")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("public-commerce", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
            AutoReplenishment = true
        }));
    options.AddPolicy("recortes-generation", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 3,
            Window = TimeSpan.FromMinutes(10),
            QueueLimit = 0,
            AutoReplenishment = true
        }));
});

// JWT independiente para compradores del e-commerce.
builder.Services.AddEcommerceJwt(builder.Configuration);
builder.Services.AddControllers(o => o.Filters.AddService<AuditActionFilter>());
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title   = "TEKA Manager API",
        Version = "v1",
        Description = "API REST para el sistema de gestión de Mueblería TEKA. " +
                      "Módulo de Inventario: productos, insumos, stock y movimientos."
    });
});

var app = builder.Build();

// ── Pipeline ───────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TEKA Manager API v1");
        c.RoutePrefix = string.Empty; // Swagger en raíz
    });
}

app.UseHttpsRedirection();
// Sirve fotografías cargadas en wwwroot/ecommerce para TEKA Manager y Expo.
app.UseStaticFiles();
app.UseCors("FrontendDev");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
