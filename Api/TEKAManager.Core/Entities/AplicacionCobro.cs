namespace TEKAManager.Core.Entities;

public class AplicacionCobro
{
    public int AplicacionCobroId { get; set; }
    public int CobroId { get; set; }
    public DateTime? FechaCobro { get; set; }
    public decimal? ImporteFinal { get; set; }
    public int ComprobanteId { get; set; }
    public long? NumeroComprobante { get; set; }
    public DateTime? FechaComprobante { get; set; }
    public decimal? ImporteTotal { get; set; }
    public decimal ImporteAplicado { get; set; }
}
