namespace TEKAManager.Core.DTOs;

public class StockInsumoDTO
{
    public int StockInsumoId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public decimal CantidadActual { get; set; }
    public decimal StockMinimo { get; set; }
    public bool EsStockCritico { get; set; }
}
