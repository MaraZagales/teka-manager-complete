using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.Services;
using TEKAManager.WhatsAppWebhook;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TekaDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddOptions<WhatsAppOptions>().Bind(builder.Configuration.GetSection(WhatsAppOptions.SectionName));
builder.Services.AddSingleton<IWhatsAppWebhookQueue, WhatsAppWebhookQueue>();
builder.Services.AddHttpClient<IWhatsAppService, WhatsAppService>(client => { client.BaseAddress=new Uri("https://graph.facebook.com/"); client.Timeout=TimeSpan.FromSeconds(30); });
builder.Services.AddHostedService<WebhookWorker>();
builder.Services.AddControllers();
var app=builder.Build();
// Cloudflare termina TLS en el extremo público y reenvía exclusivamente este
// receptor por HTTP local. Redirigir aquí devolvería 307 al challenge de Meta.
app.MapControllers();
app.Run();

public partial class Program { }
