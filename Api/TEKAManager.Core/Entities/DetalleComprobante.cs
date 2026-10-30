namespace TEKAManager.Core.Entities;

public class DetalleComprobante
{
    public int DetalleComprobanteId { get; set; }
    public int ComprobanteId { get; set; }
    public int? ProductoId { get; set; }
    public string DescripcionItem { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal BonificacionImporte { get; set; }
    public decimal ImporteNetoItem { get; set; }
    public int? AlicuotaIVAId { get; set; }
    public string? AlicuotaIVANombre { get; set; }
    public decimal? BaseImponibleIVA { get; set; }
    public decimal? ImporteIVAItem { get; set; }
    public decimal ImporteTotalItem { get; set; }
}
