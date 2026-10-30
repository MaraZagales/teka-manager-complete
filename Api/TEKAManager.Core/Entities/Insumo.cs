namespace TEKAManager.Core.Entities;

public class Insumo
{
    public int InsumoId { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public int? NombreInsumoId { get; set; }
    public string? NombreCatalogo { get; set; }
    public string? Descripcion { get; set; }
    public int TipoInsumoId { get; set; }
    public string TipoInsumoNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public string? CodigoHex { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal StockMinimo { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaAlta { get; set; }
    public int? MotivoInactivacionId { get; set; }
    public string? MotivoInactivacionNombre { get; set; }
    public string? ObservacionInactivacion { get; set; }
    public DateTime? FechaInactivacion { get; set; }
}
