namespace TEKAManager.Core.DTOs;

public class OportunidadComercialDTO
{
    public int OportunidadComercialId { get; set; }
    public int? ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public string TipoCliente { get; set; } = string.Empty;
    public int CanalVentaId { get; set; }
    public string CanalVentaNombre { get; set; } = string.Empty;
    public string Interes { get; set; } = string.Empty;
    public int EstadoOportunidadComercialId { get; set; }
    public string EstadoOportunidadNombre { get; set; } = string.Empty;
    public decimal MontoEstimado { get; set; }
    public int Probabilidad { get; set; }
    public DateTime FechaAlta { get; set; }
    public string? ProximaAccion { get; set; }
    public DateTime? FechaProximaAccion { get; set; }
    public string? Observaciones { get; set; }
    public int? MotivoPerdidaOportunidadId { get; set; }
    public string? MotivoPerdidaNombre { get; set; }
    public string? ObservacionPerdida { get; set; }
    public DateTime? FechaPerdida { get; set; }
    public int? PedidoIdConvertido { get; set; }
    public DateTime? FechaConversion { get; set; }
    public bool Activo { get; set; }
    public int? UsuarioResponsableId { get; set; }
    public string? ResponsableNombre { get; set; }
    public int? InteresComercialId { get; set; }
}

public class OportunidadComercialConDetalleDTO : OportunidadComercialDTO
{
    public List<HistorialEstadoOportunidadDTO> HistorialEstados { get; set; } = new();
    public List<VisitaOportunidadDTO> Visitas { get; set; } = new();
    public List<OportunidadProductoDTO> Productos { get; set; } = new();
}

public class HistorialEstadoOportunidadDTO
{
    public int HistorialEstadoOportunidadId { get; set; }
    public int OportunidadComercialId { get; set; }
    public int EstadoOportunidadComercialId { get; set; }
    public string EstadoOportunidadNombre { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public string? Observaciones { get; set; }
}

public class VisitaOportunidadDTO
{
    public int VisitaOportunidadId { get; set; }
    public int OportunidadComercialId { get; set; }
    public DateTime FechaVisita { get; set; }
    public string TipoVisita { get; set; } = string.Empty;
    public string? ResultadoEsperado { get; set; }
    public string? Observaciones { get; set; }
    public bool Activo { get; set; }
}

public class OportunidadResumenDTO
{
    public int TotalOportunidades { get; set; }
    public int OportunidadesAbiertas { get; set; }
    public int OportunidadesConvertidas { get; set; }
    public int OportunidadesNoConcretadas { get; set; }
    public decimal MontoEstimadoTotal { get; set; }
    public decimal MontoAbierto { get; set; }
    public decimal MontoConvertido { get; set; }
    public decimal TasaConversion { get; set; }
}

public class OportunidadFunnelDTO
{
    public int EstadoOportunidadComercialId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int Orden { get; set; }
    public int Cantidad { get; set; }
    public decimal MontoEstimado { get; set; }
}

public class MotivoPerdidaResumenDTO
{
    public int MotivoPerdidaOportunidadId { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal MontoEstimado { get; set; }
}

public class PanelComercialResumenDTO
{
    public int PedidosMes { get; set; }
    public decimal VariacionPedidosPorcentaje { get; set; }
    public decimal TotalVendido { get; set; }
    public decimal VariacionTotalVendidoPorcentaje { get; set; }
    public int OportunidadesAbiertas { get; set; }
    public decimal VariacionOportunidadesAbiertasPorcentaje { get; set; }
    public int NoConcretadas { get; set; }
    public decimal VariacionNoConcretadasPorcentaje { get; set; }
}

public class ConversionOportunidadPedidoDTO
{
    public int PedidoId { get; set; }
    public int ClienteId { get; set; }
}

public class OportunidadProductoDTO
{
    public int OportunidadProductoId { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal? PrecioReferencia { get; set; }
}
