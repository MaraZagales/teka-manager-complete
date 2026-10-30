namespace TEKAManager.Core.DTOs;

public class MovimientoStockDTO
{
    public int MovimientoStockId { get; set; }
    public DateTime FechaMovimiento { get; set; }
    public int TipoMovimientoStockId { get; set; }
    public string TipoMovimientoNombre { get; set; } = string.Empty;
    public short Signo { get; set; }
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public int? ProductoId { get; set; }
    public string? ProductoCodigo { get; set; }
    public string? ProductoNombre { get; set; }
    public int? InsumoId { get; set; }
    public string? InsumoCodigo { get; set; }
    public string? InsumoNombre { get; set; }
    public decimal Cantidad { get; set; }
    public string? Motivo { get; set; }
    public string? EntidadOrigen { get; set; }
    public int? OrigenId { get; set; }
    public bool Activo { get; set; }
    public DateTime? FechaAnulacion { get; set; }
    public string? MotivoAnulacion { get; set; }
    public string? ObservacionAnulacion { get; set; }
    public int? MovimientoStockIdReversaDe { get; set; }
}
