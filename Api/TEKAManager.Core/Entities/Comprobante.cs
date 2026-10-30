namespace TEKAManager.Core.Entities;

public class Comprobante : ComprobanteResumen
{
    public int TipoDocumentoId { get; set; }
    public string TipoDocumentoNombre { get; set; } = string.Empty;
    public long DocumentoReceptor { get; set; }
    public int? CondicionIVAId { get; set; }
    public string? CondicionIVANombre { get; set; }
    public int ConceptoComprobanteId { get; set; }
    public string ConceptoComprobanteNombre { get; set; } = string.Empty;
    public int MonedaId { get; set; }
    public string MonedaNombre { get; set; } = string.Empty;
    public decimal ImporteNoGravado { get; set; }
    public decimal ImporteExento { get; set; }
    public decimal ImporteNetoGravado { get; set; }
    public decimal ImporteIVA { get; set; }
    public decimal ImporteTributos { get; set; }
    public DateTime? FechaVencimientoCAE { get; set; }
    public string? CAEA { get; set; }
}
