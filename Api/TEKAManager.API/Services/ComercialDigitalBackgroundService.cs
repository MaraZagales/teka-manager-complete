using Microsoft.Extensions.Options;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Services;

public sealed class ComercialDigitalBackgroundService(
    IServiceScopeFactory scopeFactory,
    IOptions<ComercialDigitalOptions> options,
    ILogger<ComercialDigitalBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        if (!settings.ProcesamientoAutomaticoHabilitado)
        {
            logger.LogInformation("Procesamiento comercial automático deshabilitado.");
            return;
        }

        if (settings.HorasCarritoAbandonado < 1 || settings.HorasCheckoutInterrumpido < 1 || settings.IntervaloProcesamientoMinutos < 1)
            throw new InvalidOperationException("La configuración ComercialDigital debe contener valores mayores a cero.");

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(settings.IntervaloProcesamientoMinutos));
        do
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<ICarritoService>();
                var count = await service.ProcesarAbandonadosAsync(settings.HorasCarritoAbandonado, settings.HorasCheckoutInterrumpido, stoppingToken);
                logger.LogInformation("Procesamiento comercial finalizado: {Cantidad} pendientes creados.", count);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception exception) { logger.LogError(exception, "Falló el procesamiento automático de pendientes comerciales."); }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
