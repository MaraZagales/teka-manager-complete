namespace TEKAManager.Core.Entities;

public class OportunidadComercial
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

public class OportunidadResumen
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

public class OportunidadFunnel
{
    public int EstadoOportunidadComercialId { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int Orden { get; set; }
    public int Cantidad { get; set; }
    public decimal MontoEstimado { get; set; }
}

public class MotivoPerdidaResumen
{
    public int MotivoPerdidaOportunidadId { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal MontoEstimado { get; set; }
}

public class PanelComercialResumen
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

public class ConversionOportunidadPedido
{
    public int PedidoId { get; set; }
    public int ClienteId { get; set; }
}
