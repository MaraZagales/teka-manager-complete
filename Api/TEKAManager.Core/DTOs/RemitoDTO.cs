namespace TEKAManager.Core.DTOs;

public class RemitoDTO
{
    public int RemitoId { get; set; }
    public int PedidoId { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public DateTime FechaRemito { get; set; }
    public string? NumeroRemito { get; set; }
    public string? DomicilioEntrega { get; set; }
    public bool Anulado { get; set; }
    public string? MotivoAnulacion { get; set; }
    public DateTime? FechaAnulacion { get; set; }
    public string? UsuarioAnulacion { get; set; }
    public bool Entregado { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string? Observaciones { get; set; }
}
