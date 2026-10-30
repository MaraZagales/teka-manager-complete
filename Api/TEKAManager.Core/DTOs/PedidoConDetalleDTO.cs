namespace TEKAManager.Core.DTOs;

public class PedidoConDetalleDTO : PedidoDTO
{
    public List<PedidoDetalleDTO> Detalles { get; set; } = new();
    public List<HistorialEstadoPedidoDTO> HistorialEstados { get; set; } = new();
}
