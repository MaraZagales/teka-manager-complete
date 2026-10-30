using Microsoft.EntityFrameworkCore;

namespace TEKAManager.Core.Entities;

public class Recorte
{
    public int RecorteId { get; set; }
    public int? OrdenProduccionId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? TipoRecorteId { get; set; }
    public string? TipoRecorteNombre { get; set; }
    public int EstadoRecorteId { get; set; }
    public string EstadoRecorteNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public string? CodigoHex { get; set; }
    public decimal? Dimension { get; set; }
    public decimal? LargoMm { get; set; }
    public decimal? AnchoMm { get; set; }
    public decimal? EspesorMm { get; set; }
    public string? OrientacionVeta { get; set; }
    public int? InsumoColorId { get; set; }
    public string TipoInsumoNombre { get; set; } = string.Empty;
    public decimal StockDisponible { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaAlta { get; set; }
}

public class StockRecorte
{
    public int StockRecorteId { get; set; }
    public int RecorteId { get; set; }
    public int? OrdenProduccionId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? TipoRecorteId { get; set; }
    public string? TipoRecorteNombre { get; set; }
    public int EstadoRecorteId { get; set; }
    public string EstadoRecorteNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public string? CodigoHex { get; set; }
    public decimal? Dimension { get; set; }
    public decimal? LargoMm { get; set; }
    public decimal? AnchoMm { get; set; }
    public decimal? EspesorMm { get; set; }
    public string? OrientacionVeta { get; set; }
    public int? InsumoColorId { get; set; }
    public string TipoInsumoNombre { get; set; } = string.Empty;
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public decimal CantidadActual { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaAlta { get; set; }
}

public class MovimientoRecorte
{
    public int MovimientoRecorteId { get; set; }
    public int RecorteId { get; set; }
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaMovimiento { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string? Observaciones { get; set; }
    public int? InsumoId { get; set; }
    public string? InsumoCodigo { get; set; }
    public string? InsumoNombre { get; set; }
    public decimal? Dimension { get; set; }
    public int? UnidadMedidaId { get; set; }
    public string? UnidadMedidaNombre { get; set; }
    public string? UnidadMedidaAbreviatura { get; set; }
}

public class HistorialEstadoRecorte
{
    public int HistorialEstadoRecorteId { get; set; }
    public int RecorteId { get; set; }
    public int EstadoRecorteId { get; set; }
    public string EstadoRecorteNombre { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public string? Observaciones { get; set; }
}

public class ConsumoRecorteProduccion
{
    public int ConsumoRecorteProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int RecorteId { get; set; }
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaConsumo { get; set; }
    [Precision(18, 2)]
    public decimal CantidadConsumida { get; set; }
    public string? Observaciones { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    [Precision(18, 2)]
    public decimal? Dimension { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
}

public class SugerenciaRecorte
{
    public int SugerenciaRecorteId { get; set; }
    public DateTime FechaSugerencia { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadSugerencias { get; set; }
}

public class RecorteProductoSugerido
{
    public int RecorteProductoSugeridoId { get; set; }
    public int SugerenciaRecorteId { get; set; }
    public DateTime? FechaSugerencia { get; set; }
    public int RecorteId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public decimal? Dimension { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal? PuntajeCompatibilidad { get; set; }
    public string? Observaciones { get; set; }
}
