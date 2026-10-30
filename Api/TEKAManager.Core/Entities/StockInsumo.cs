using Microsoft.EntityFrameworkCore;

namespace TEKAManager.Core.Entities;

public class StockInsumo
{
    public int StockInsumoId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    [Precision(18, 2)]
    public decimal CantidadActual { get; set; }
    [Precision(18, 2)]
    public decimal StockMinimo { get; set; }
    public int EsStockCritico { get; set; }
}
