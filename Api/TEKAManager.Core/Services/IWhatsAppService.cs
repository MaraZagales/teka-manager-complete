using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IWhatsAppService
{
    Task<IReadOnlyList<WhatsAppConversationDTO>> GetConversationsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WhatsAppAssigneeDTO>> GetAssigneesAsync(CancellationToken cancellationToken = default);
    Task<WhatsAppConversationDetailDTO?> GetConversationAsync(long id, CancellationToken cancellationToken = default);
    Task<WhatsAppSendResult> SendTextAsync(long conversationId, WhatsAppSendMessageRequest request, CancellationToken cancellationToken = default);
    Task AssignAsync(long conversationId, int? userId, CancellationToken cancellationToken = default);
    Task LinkCustomerAsync(long conversationId, int customerId, CancellationToken cancellationToken = default);
    Task LinkConsultationAsync(long conversationId, int consultationId, CancellationToken cancellationToken = default);
    Task<int> CreateConsultationAsync(long conversationId, WhatsAppCreateConsultationRequest request, CancellationToken cancellationToken = default);
    Task ProcessWebhookAsync(string body, CancellationToken cancellationToken = default);
}

public sealed record WhatsAppWebhookWorkItem(string Body);

public interface IWhatsAppWebhookQueue
{
    bool TryEnqueue(WhatsAppWebhookWorkItem item);
    ValueTask<WhatsAppWebhookWorkItem> DequeueAsync(CancellationToken cancellationToken);
}
