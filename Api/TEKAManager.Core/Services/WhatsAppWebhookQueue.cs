using System.Threading.Channels;

namespace TEKAManager.Core.Services;

public sealed class WhatsAppWebhookQueue : IWhatsAppWebhookQueue
{
    private readonly Channel<WhatsAppWebhookWorkItem> _channel = Channel.CreateBounded<WhatsAppWebhookWorkItem>(
        new BoundedChannelOptions(200) { SingleReader = true, FullMode = BoundedChannelFullMode.Wait });

    public bool TryEnqueue(WhatsAppWebhookWorkItem item) => _channel.Writer.TryWrite(item);
    public ValueTask<WhatsAppWebhookWorkItem> DequeueAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAsync(cancellationToken);
}
