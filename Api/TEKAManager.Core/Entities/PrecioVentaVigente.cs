namespace TEKAManager.Core.Entities;

public class PrecioVentaVigente
{
    public int PrecioVentaId { get; set; }
    public int ProductoId { get; set; }
    public DateTime FechaVigenciaDesde { get; set; }
    public DateTime? FechaVigenciaHasta { get; set; }
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
}
