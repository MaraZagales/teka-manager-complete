namespace TEKAManager.Core.Entities;

public class Pedido
{
    public int PedidoId { get; set; }
    public DateTime FechaPedido { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public int CanalVentaId { get; set; }
    public string CanalVentaNombre { get; set; } = string.Empty;
    public int EstadoPedidoId { get; set; }
    public string EstadoPedidoNombre { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string? Observaciones { get; set; }
}
