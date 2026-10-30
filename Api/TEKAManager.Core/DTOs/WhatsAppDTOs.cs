namespace TEKAManager.Core.DTOs;

public sealed class WhatsAppConversationDTO
{
    public long ConversacionId { get; set; }
    public long ContactoId { get; set; }
    public int? ClienteId { get; set; }
    public string WhatsAppId { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? NombrePerfil { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? UsuarioResponsableId { get; set; }
    public string? ResponsableNombre { get; set; }
    public int? InteresComercialId { get; set; }
    public int NoLeidos { get; set; }
    public DateTime FechaUltimaActividad { get; set; }
    public DateTime? UltimoMensajeEntrante { get; set; }
    public string? UltimoMensaje { get; set; }
}

public sealed class WhatsAppMessageDTO
{
    public long MensajeId { get; set; }
    public string? MensajeMetaId { get; set; }
    public Guid? SolicitudClienteId { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string? Texto { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? ErrorCodigo { get; set; }
    public string? ErrorDescripcion { get; set; }
    public DateTime FechaMensaje { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public sealed class WhatsAppConversationDetailDTO
{
    public WhatsAppConversationDTO Conversation { get; set; } = new();
    public List<WhatsAppMessageDTO> Messages { get; set; } = [];
}

public sealed record WhatsAppSendResult(long MensajeId, string? MensajeMetaId, string Estado, bool Duplicado);

public sealed class WhatsAppAssigneeDTO
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
}
