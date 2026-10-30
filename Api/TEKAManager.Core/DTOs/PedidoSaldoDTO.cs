namespace TEKAManager.Core.DTOs;

/// <summary>Importes calculados por dbo.sp_TEKA_Ventas_SaldoPedido.</summary>
public sealed class PedidoSaldoDTO
{
    public int PedidoId { get; set; }
    public decimal TotalPedido { get; set; }
    public decimal TotalCobrado { get; set; }
    public decimal Saldo { get; set; }
}
