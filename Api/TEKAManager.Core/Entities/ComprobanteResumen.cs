namespace TEKAManager.Core.Entities;

public class ComprobanteResumen
{
    public int ComprobanteId { get; set; }
    public int? PedidoId { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public int TipoComprobanteId { get; set; }
    public string TipoComprobanteNombre { get; set; } = string.Empty;
    public int PuntoVenta { get; set; }
    public long? NumeroComprobante { get; set; }
    public DateTime FechaComprobante { get; set; }
    public decimal ImporteTotal { get; set; }
    public string EstadoComprobante { get; set; } = string.Empty;
    public string? CAE { get; set; }
    public string? ResultadoARCA { get; set; }
    public string? Observaciones { get; set; }
}
