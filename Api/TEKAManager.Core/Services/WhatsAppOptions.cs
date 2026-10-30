namespace TEKAManager.Core.Services;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";
    public bool Enabled { get; set; }
    public string AppId { get; set; } = string.Empty;
    public string AppSecret { get; set; } = string.Empty;
    public string PhoneNumberId { get; set; } = string.Empty;
    public string WhatsAppBusinessAccountId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string WebhookVerifyToken { get; set; } = string.Empty;
    public string GraphApiVersion { get; set; } = string.Empty;
    public int FreeFormWindowHours { get; set; } = 24;

    public bool HasWebhookConfiguration => Enabled &&
        !string.IsNullOrWhiteSpace(AppId) && !string.IsNullOrWhiteSpace(AppSecret) &&
        !string.IsNullOrWhiteSpace(PhoneNumberId) && !string.IsNullOrWhiteSpace(WhatsAppBusinessAccountId) &&
        !string.IsNullOrWhiteSpace(AccessToken) && !string.IsNullOrWhiteSpace(WebhookVerifyToken) &&
        !string.IsNullOrWhiteSpace(GraphApiVersion);

    public bool HasSendingConfiguration => HasWebhookConfiguration;
}
