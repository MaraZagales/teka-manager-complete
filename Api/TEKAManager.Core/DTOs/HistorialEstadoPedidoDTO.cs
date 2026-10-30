namespace TEKAManager.Core.DTOs;

public class HistorialEstadoPedidoDTO
{
    public int HistorialEstadoPedidoId { get; set; }
    public int PedidoId { get; set; }
    public int EstadoPedidoId { get; set; }
    public string EstadoPedidoNombre { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public string? Observaciones { get; set; }
}
