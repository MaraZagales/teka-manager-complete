using TEKAManager.Core.Services;

namespace TEKAManager.API.Services;

public sealed class WhatsAppWebhookBackgroundService(
    IWhatsAppWebhookQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<WhatsAppWebhookBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var item = await queue.DequeueAsync(stoppingToken);
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                await scope.ServiceProvider.GetRequiredService<IWhatsAppService>().ProcessWebhookAsync(item.Body, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { }
            catch (Exception ex) { logger.LogError(ex, "No se pudo procesar un webhook firmado de WhatsApp."); }
        }
    }
}
