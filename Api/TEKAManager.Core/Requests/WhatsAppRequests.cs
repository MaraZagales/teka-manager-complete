using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public sealed class WhatsAppSendMessageRequest
{
    [Required] public Guid SolicitudClienteId { get; set; }
    [Required, StringLength(4096, MinimumLength = 1)] public string Texto { get; set; } = string.Empty;
}

public sealed class WhatsAppAssignRequest
{
    public int? UsuarioResponsableId { get; set; }
}

public sealed class WhatsAppLinkConsultationRequest
{
    [Range(1, int.MaxValue)] public int InteresComercialId { get; set; }
}

public sealed class WhatsAppCreateConsultationRequest
{
    [Required, StringLength(500, MinimumLength = 3)] public string Descripcion { get; set; } = string.Empty;
    public int? MotivoConsultaId { get; set; }
    public int? ProductoConsultadoId { get; set; }
    [Range(0, double.MaxValue)] public decimal MontoPotencial { get; set; }
}

public sealed class WhatsAppLinkCustomerRequest
{
    [Range(1, int.MaxValue)] public int ClienteId { get; set; }
}
