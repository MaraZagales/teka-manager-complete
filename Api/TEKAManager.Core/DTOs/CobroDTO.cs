namespace TEKAManager.Core.DTOs;

public class CobroDTO
{
    public int CobroId { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public int? PedidoId { get; set; }
    public int? CajaId { get; set; }
    public string? CajaNombre { get; set; }
    public int MedioCobroId { get; set; }
    public string MedioCobroNombre { get; set; } = string.Empty;
    public bool RequiereReferencia { get; set; }
    public int EstadoCobroId { get; set; }
    public string EstadoCobroNombre { get; set; } = string.Empty;
    public DateTime FechaCobro { get; set; }
    public decimal ImporteBase { get; set; }
    public decimal PorcentajeAplicado { get; set; }
    public decimal ImporteAjuste { get; set; }
    public decimal ImporteFinal { get; set; }
    public string? ReferenciaExterna { get; set; }
    public string? Observaciones { get; set; }
}
