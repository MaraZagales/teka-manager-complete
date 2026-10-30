namespace TEKAManager.Core.DTOs;

public class DetalleRemitoDTO
{
    public int DetalleRemitoId { get; set; }
    public int RemitoId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
}
