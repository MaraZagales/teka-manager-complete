namespace TEKAManager.Core.DTOs;

public sealed class ConsultaPublicaResultadoDTO { public int InteresComercialId { get; set; } public bool Duplicada { get; set; } }

public class InteresComercialDTO
{
    public int InteresComercialId { get; set; }
    public int? ClienteId { get; set; }
    public int? MotivoConsultaId { get; set; }
    public string? MotivoConsultaNombre { get; set; }
    public int? ProductoConsultadoId { get; set; }
    public string? TipoPendiente { get; set; }
    public string? ClienteNombre { get; set; }
    public string? ClienteApellido { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public int CanalVentaId { get; set; }
    public string CanalVentaNombre { get; set; } = "";
    public int EstadoInteresComercialId { get; set; }
    public string EstadoNombre { get; set; } = "";
    public string TipoOrigen { get; set; } = "";
    public string? ReferenciaOrigen { get; set; }
    public int? CarritoId { get; set; }
    public string Descripcion { get; set; } = "";
    public decimal MontoPotencial { get; set; }
    public int? UsuarioResponsableId { get; set; }
    public string? ResponsableNombre { get; set; }
    public int? OportunidadComercialId { get; set; }
    public DateTime FechaAlta { get; set; }
    public DateTime FechaUltimaActividad { get; set; }
    public DateTime? FechaAtencion { get; set; }
    public DateTime? FechaCierre { get; set; }
    public string? MotivoDescarte { get; set; }
    public bool Activo { get; set; }
}

public class CarritoDTO
{
    public int CarritoId { get; set; }
    public int? ClienteId { get; set; }
    public Guid IdentificadorSesion { get; set; }
    public string Estado { get; set; } = "";
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaUltimaActividad { get; set; }
    public DateTime? FechaAbandono { get; set; }
    public DateTime? FechaConversion { get; set; }
    public int? PedidoIdConvertido { get; set; }
    public DateTime? FechaInicioCheckout { get; set; }
    public DateTime? FechaUltimaActividadCheckout { get; set; }
    public DateTime? CheckoutCompletadoFecha { get; set; }
    public decimal TotalReferencia { get; set; }
    public List<DetalleCarritoDTO> Items { get; set; } = new();
}

public class DetalleCarritoDTO { public int DetalleCarritoId { get; set; } public int ProductoId { get; set; } public string ProductoNombre { get; set; } = ""; public decimal Cantidad { get; set; } public decimal? PrecioReferencia { get; set; } public DateTime FechaActualizacion { get; set; } }
public class CheckoutCarritoDTO { public int PedidoId { get; set; } public int ClienteId { get; set; } public decimal Total { get; set; } }
