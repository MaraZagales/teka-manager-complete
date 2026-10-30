namespace TEKAManager.Core.DTOs;

public class ListaMaterialesDTO
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

public class DetalleListaMaterialesDTO
{
    public int DetalleListaMaterialesId { get; set; }
    public int ListaMaterialesId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string? Observaciones { get; set; }
}

public class ListaMaterialesConDetalleDTO : ListaMaterialesDTO
{
    public List<DetalleListaMaterialesDTO> Detalles { get; set; } = new();
}

public class OrdenProduccionDTO
{
    public int OrdenProduccionId { get; set; }
    public int TipoProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string EstadoOrdenProduccionNombre { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? Observaciones { get; set; }
    public int CantidadModelos { get; set; }
    public decimal CantidadTotalPlanificada { get; set; }
}

public class OrdenProduccionProductoDTO
{
    public int OrdenProduccionDetalleId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public int? ListaMaterialesId { get; set; }
    public decimal CantidadPlanificada { get; set; }
    public int? ProductoCircularId { get; set; }
    public decimal CantidadProducida { get; set; }
}

public class OrdenProduccionRecortePlanDTO
{
    public int RecorteId { get; set; }
    public decimal CantidadPlanificada { get; set; }
}

public class HistorialEstadoOrdenProduccionDTO
{
    public int HistorialEstadoOrdenProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string EstadoOrdenProduccionNombre { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public string? Observaciones { get; set; }
}

public class ConsumoProduccionDTO
{
    public int ConsumoProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaConsumo { get; set; }
    public decimal CantidadConsumida { get; set; }
    public string? Observaciones { get; set; }
}

public class ResultadoProduccionDTO
{
    public int ResultadoProduccionId { get; set; }
    public int OrdenProduccionId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public DateTime FechaResultado { get; set; }
    public decimal CantidadIngresada { get; set; }
    public string? Observaciones { get; set; }
}

public class OrdenProduccionConDetalleDTO
{
    public int OrdenProduccionId { get; set; }
    public int TipoProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string EstadoOrdenProduccionNombre { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public string? Observaciones { get; set; }
    public List<OrdenProduccionProductoDTO> Productos { get; set; } = new();
    public List<OrdenProduccionRecortePlanDTO> RecortesPlanificados { get; set; } = new();
}
