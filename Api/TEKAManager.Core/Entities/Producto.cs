namespace TEKAManager.Core.Entities;

public class Producto
{
    public int ProductoId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? NombreProductoId { get; set; }
    public string? NombreCatalogo { get; set; }
    public string? Descripcion { get; set; }
    public int TipoProductoId { get; set; }
    public string TipoProductoNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public string? CodigoHex { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal StockMinimo { get; set; }
    // Null para productos historicos sin ficha tecnica.
    public decimal? AnchoCm { get; set; }
    public decimal? AltoCm { get; set; }
    public decimal? ProfundidadCm { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaAlta { get; set; }
    public int? MotivoInactivacionId { get; set; }
    public string? MotivoInactivacionNombre { get; set; }
    public string? ObservacionInactivacion { get; set; }
    public DateTime? FechaInactivacion { get; set; }
}
