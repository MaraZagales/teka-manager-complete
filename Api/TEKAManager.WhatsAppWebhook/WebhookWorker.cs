using TEKAManager.Core.Services;
namespace TEKAManager.WhatsAppWebhook;
public sealed class WebhookWorker(IWhatsAppWebhookQueue queue,IServiceScopeFactory scopes,ILogger<WebhookWorker> logger):BackgroundService
{
 protected override async Task ExecuteAsync(CancellationToken ct){while(!ct.IsCancellationRequested){var item=await queue.DequeueAsync(ct);try{await using var scope=scopes.CreateAsyncScope();await scope.ServiceProvider.GetRequiredService<IWhatsAppService>().ProcessWebhookAsync(item.Body,ct);}catch(OperationCanceledException)when(ct.IsCancellationRequested){}catch(Exception ex){logger.LogError(ex,"No se pudo procesar un webhook firmado de WhatsApp.");}}}
}
