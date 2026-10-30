using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class RemitoDesdePedidoRequest
{
    [Required]
    public int PedidoId { get; set; }

    [StringLength(30)]
    public string? NumeroRemito { get; set; }

    [StringLength(200)]
    public string? DomicilioEntrega { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class RemitoMarcarEntregadoRequest
{
    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class RemitoEditarRequest
{
    [Required, StringLength(200)]
    public string DomicilioEntrega { get; set; } = string.Empty;
    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class RemitoAnularRequest
{
    [Required, StringLength(250, MinimumLength = 3)]
    public string Motivo { get; set; } = string.Empty;
}
