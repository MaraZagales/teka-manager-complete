using Microsoft.EntityFrameworkCore;

namespace TEKAManager.Core.Entities;

public class ListaMateriales
{
    public int ListaMaterialesId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Version { get; set; }
    public bool Activa { get; set; }
    public DateTime FechaAlta { get; set; }
}

public class DetalleListaMateriales
{
    public int DetalleListaMaterialesId { get; set; }
    public int ListaMaterialesId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string? Observaciones { get; set; }
}

public class OrdenProduccion
{
    public int OrdenProduccionId { get; set; }
    public int TipoProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadModelos { get; set; }
    [Precision(18, 2)]
    public decimal CantidadTotalPlanificada { get; set; }
}

public class HistorialEstadoOrdenProduccion
{
    public int HistorialEstadoOrdenProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string EstadoOrdenProduccionNombre { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public string? Observaciones { get; set; }
}

public class ConsumoProduccion
{
    public int ConsumoProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaConsumo { get; set; }
    [Precision(18, 2)]
    public decimal CantidadConsumida { get; set; }
    public string? Observaciones { get; set; }
}

public class ResultadoProduccion
{
    public int ResultadoProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaResultado { get; set; }
    [Precision(18, 2)]
    public decimal CantidadIngresada { get; set; }
    public string? Observaciones { get; set; }
}
