namespace TEKAManager.Core.DTOs;

public class PedidoDetalleDTO
{
    public int DetallePedidoId { get; set; }
    public int PedidoId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}
