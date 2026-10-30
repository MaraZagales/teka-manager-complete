using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class OportunidadComercialInsertRequest
{
    public int? ClienteId { get; set; }

    [Required]
    [StringLength(100)]
    public string ClienteNombre { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ClienteApellido { get; set; }

    [Required]
    [StringLength(20)]
    public string TipoCliente { get; set; } = "particular";

    [Required]
    public int CanalVentaId { get; set; }

    [Required]
    [StringLength(150)]
    public string Interes { get; set; } = string.Empty;

    public int? EstadoOportunidadComercialId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El monto estimado no puede ser negativo.")]
    public decimal MontoEstimado { get; set; }

    [Range(0, 100, ErrorMessage = "La probabilidad debe estar entre 0 y 100.")]
    public int Probabilidad { get; set; }

    [StringLength(250)]
    public string? ProximaAccion { get; set; }

    public DateTime? FechaProximaAccion { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class OportunidadComercialUpdateRequest
{
    public int? ClienteId { get; set; }

    [Required]
    [StringLength(100)]
    public string ClienteNombre { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ClienteApellido { get; set; }

    [Required]
    [StringLength(20)]
    public string TipoCliente { get; set; } = "particular";

    [Required]
    public int CanalVentaId { get; set; }

    [Required]
    [StringLength(150)]
    public string Interes { get; set; } = string.Empty;

    [Required]
    public int EstadoOportunidadComercialId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El monto estimado no puede ser negativo.")]
    public decimal MontoEstimado { get; set; }

    [Range(0, 100, ErrorMessage = "La probabilidad debe estar entre 0 y 100.")]
    public int Probabilidad { get; set; }

    [StringLength(250)]
    public string? ProximaAccion { get; set; }

    public DateTime? FechaProximaAccion { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class VisitaOportunidadInsertRequest
{
    [Required]
    public DateTime FechaVisita { get; set; }

    [Required]
    [StringLength(30)]
    public string TipoVisita { get; set; } = string.Empty;

    [StringLength(250)]
    public string? ResultadoEsperado { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class OportunidadMarcarPerdidaRequest
{
    [Required]
    public int MotivoPerdidaOportunidadId { get; set; }

    [StringLength(500)]
    public string? ObservacionPerdida { get; set; }
}

public class OportunidadCancelarRequest
{
    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class OportunidadConvertirEnPedidoRequest
{
    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class OportunidadProductoRequest
{
    [Required] public int ProductoId { get; set; }
    [Range(0.01, double.MaxValue)] public decimal Cantidad { get; set; }
}
public class OportunidadAsignarResponsableRequest
{
    [Required] public int UsuarioResponsableId { get; set; }
}
