namespace TEKAManager.Core.DTOs;

public sealed class ExistenciasActividadDTO
{
    public string Clase { get; set; } = "";
    public int ArticuloId { get; set; }
    public int? DepositoId { get; set; }
    public decimal SaldoInicial { get; set; }
    public decimal Entradas { get; set; }
    public decimal Salidas { get; set; }
    public decimal VariacionNeta { get; set; }
    public decimal SaldoFinal { get; set; }
    public int CantidadMovimientos { get; set; }
    public string Tendencia { get; set; } = "";
    public bool HistorialConciliado { get; set; }
}

public sealed class ExistenciasStockFechaDTO
{
    public string Clase { get; set; } = "";
    public int ArticuloId { get; set; }
    public int? DepositoId { get; set; }
    public decimal SaldoLibroFecha { get; set; }
    public bool HistorialConciliado { get; set; }
}

public sealed class ExistenciasEvolucionDTO
{
    public DateTime Periodo { get; set; }
    public decimal Variacion { get; set; }
    public decimal SaldoFinal { get; set; }
    public bool HistorialConciliado { get; set; }
}
