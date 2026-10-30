using System.ComponentModel.DataAnnotations.Schema;

namespace TEKAManager.Core.DTOs;

public class RecortePrevistoConfiguracionDTO
{
    public int ListaMaterialesRecortePrevistoId { get; set; }
    public int ListaMaterialesId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? TipoRecorteId { get; set; }
    public string? TipoRecorteNombre { get; set; }
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public decimal? Dimension { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal CantidadPorUnidad { get; set; }
    public string? Observaciones { get; set; }
}

public class InicioOrdenPreviewDTO
{
    public int OrdenProduccionId { get; set; }
    public int EstadoOrdenProduccionId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public List<InicioOrdenModeloDTO> Modelos { get; set; } = new();
    public List<InicioOrdenMaterialDTO> Materiales { get; set; } = new();
    public List<InicioOrdenRecorteDTO> Recortes { get; set; } = new();
    public bool TieneFaltantes => Materiales.Any(x => x.Faltante > 0) || Recortes.Any(x => x.Faltante != 0);
}

public class InicioOrdenModeloDTO
{
    public int OrdenProduccionDetalleId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal CantidadPlanificada { get; set; }
    public int? ListaMaterialesId { get; set; }
}

public class InicioOrdenMaterialDTO
{
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public string Unidad { get; set; } = string.Empty;
    public decimal CantidadRequerida { get; set; }
    public int DepositoId { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
    public decimal CantidadDisponible { get; set; }
    public decimal Faltante { get; set; }
}

public class InicioOrdenRecorteDTO : InicioOrdenMaterialDTO
{
    public int RecorteId { get; set; }
    public decimal? Dimension { get; set; }
}

public class FinalizacionOrdenPreviewDTO
{
    public List<FinalizacionModeloDTO> Modelos { get; set; } = new();
    public List<FinalizacionRecortePrevistoDTO> RecortesPrevistos { get; set; } = new();
    public List<RecorteRecuperadoOrdenDTO> RecortesRecuperados { get; set; } = new();
}

public class FinalizacionModeloDTO
{
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal CantidadPlanificada { get; set; }
}

public class FinalizacionRecortePrevistoDTO
{
    public int OrdenProduccionRecortePrevistoSnapshotId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? TipoRecorteId { get; set; }
    public string? TipoRecorteNombre { get; set; }
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public decimal? Dimension { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal CantidadPorUnidad { get; set; }
    public decimal CantidadSugerida { get; set; }
    public string? Observaciones { get; set; }
}

public class RecorteRecuperadoOrdenDTO
{
    public int RecorteId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public int? TipoRecorteId { get; set; }
    public string? TipoRecorteNombre { get; set; }
    public int EstadoRecorteId { get; set; }
    public string EstadoRecorteNombre { get; set; } = string.Empty;
    public int? ColorId { get; set; }
    public string? ColorNombre { get; set; }
    public decimal? Dimension { get; set; }
    public decimal? LargoMm { get; set; }
    public decimal? AnchoMm { get; set; }
    public decimal? EspesorMm { get; set; }
    public string? OrientacionVeta { get; set; }
    public int UnidadMedidaId { get; set; }
    public string UnidadMedidaNombre { get; set; } = string.Empty;
    public string UnidadMedidaAbreviatura { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? Observaciones { get; set; }
}

public class PlantillaOrdenDTO
{
    public int PlantillaOrdenProduccionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public bool Activa { get; set; }
    public DateTime FechaAlta { get; set; }
    public int CantidadModelos { get; set; }
    public decimal CantidadTotal { get; set; }
    [NotMapped]
    public List<PlantillaOrdenDetalleDTO> Detalles { get; set; } = new();
}

public class PlantillaOrdenDetalleDTO
{
    public int PlantillaOrdenProduccionDetalleId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
}

public class ReporteConsumoProduccionDTO
{
    public DateTime FechaConsumo { get; set; }
    public int OrdenProduccionId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public string Unidad { get; set; } = string.Empty;
    public decimal CantidadConsumida { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
}

public class ReporteModeloProduccionDTO
{
    public DateTime FechaResultado { get; set; }
    public int OrdenProduccionId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoCodigo { get; set; } = string.Empty;
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal CantidadPlanificada { get; set; }
    public decimal CantidadIngresada { get; set; }
    public decimal Diferencia { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
}

public class ReporteRecorteProduccionDTO
{
    public DateTime Fecha { get; set; }
    public int OrdenProduccionId { get; set; }
    public int RecorteId { get; set; }
    public int InsumoId { get; set; }
    public string InsumoCodigo { get; set; } = string.Empty;
    public string InsumoNombre { get; set; } = string.Empty;
    public decimal? Dimension { get; set; }
    public string Unidad { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string DepositoNombre { get; set; } = string.Empty;
}
