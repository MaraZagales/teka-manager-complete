namespace TEKAManager.Core.DTOs;

public class StockProductoDTO
{
    public int StockProductoId { get; set; }

    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;

    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;

    public decimal CantidadActual { get; set; }
    public decimal StockMinimo { get; set; }

    public bool EsStockCritico { get; set; }
}