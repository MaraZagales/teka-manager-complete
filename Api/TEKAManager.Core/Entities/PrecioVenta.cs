namespace TEKAManager.Core.Entities;

public class PrecioVenta
{
    public int PrecioVentaId { get; set; }
    public int ProductoId { get; set; }
    public string? ProductoCodigo { get; set; }
    public string? ProductoNombre { get; set; }
    public DateTime FechaVigenciaDesde { get; set; }
    public DateTime? FechaVigenciaHasta { get; set; }
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
}
