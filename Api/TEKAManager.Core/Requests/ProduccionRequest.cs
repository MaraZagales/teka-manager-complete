using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class ListaMaterialesRequest
{
    [Required]
    public int ProductoId { get; set; }

    [Required]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Version { get; set; }
}

public class DetalleListaMaterialesRequest
{
    [Required]
    public int InsumoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class OrdenProduccionProductoRequest
{
    [Required] public int ProductoId { get; set; }
    public int? ListaMaterialesId { get; set; }
    [Range(0.01, double.MaxValue)] public decimal CantidadPlanificada { get; set; }
}

public class OrdenProduccionRecortePlanRequest
{
    [Required]
    public int RecorteId { get; set; }
    [Range(typeof(decimal), "0.01", "999999999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal Cantidad { get; set; }
}

public class OrdenProduccionResultadoRealRequest
{
    [Required]
    public int ProductoId { get; set; }
    [Range(typeof(decimal), "0", "999999999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal Cantidad { get; set; }
}

public class OrdenProduccionRecorteConfirmadoRequest
{
    [Required]
    public int InsumoId { get; set; }
    public int? TipoRecorteId { get; set; }
    [Required]
    public int EstadoRecorteId { get; set; }
    public int? ColorId { get; set; }
    public decimal? LargoMm { get; set; }
    public decimal? AnchoMm { get; set; }
    public decimal? EspesorMm { get; set; }
    public string? OrientacionVeta { get; set; }
    [Range(typeof(decimal), "0.01", "999999999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal? Dimension { get; set; }
    [Required]
    public int UnidadMedidaId { get; set; }
    [Range(typeof(decimal), "0.01", "999999999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal Cantidad { get; set; }
    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class OrdenProduccionInsertRequest
{
    public int ProductoId { get; set; }
    public int? ListaMaterialesId { get; set; }
    public List<OrdenProduccionProductoRequest>? Productos { get; set; }
    public List<OrdenProduccionRecortePlanRequest>? Recortes { get; set; }

    [Required]
    public int TipoProduccionId { get; set; }

    public decimal CantidadPlanificada { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class OrdenProduccionEstadoRequest
{
    public List<OrdenProduccionRecortePlanRequest>? Recortes { get; set; }
    public List<OrdenProduccionResultadoRealRequest>? Resultados { get; set; }
    public List<OrdenProduccionRecorteConfirmadoRequest>? RecortesConfirmados { get; set; }
    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class ConsumoProduccionRequest
{
    [Required]
    public int InsumoId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad consumida debe ser mayor a cero.")]
    public decimal CantidadConsumida { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class ResultadoProduccionRequest
{
    [Required]
    public int ProductoId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad ingresada debe ser mayor a cero.")]
    public decimal CantidadIngresada { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

// Prevalidación de producción desde diseño aprobado; no genera OP ni movimientos.
public sealed class OrdenDesdeDisenoValidacionDTO
{
    public long RecorteDisenoId { get; set; }
    public int? ProductoId { get; set; }
    public string EstadoRevision { get; set; } = string.Empty;
    public int CantidadAsignaciones { get; set; }
    public int CantidadInsumosComplementarios { get; set; }
    public int CantidadSugerida { get; set; }
    public int RecortesAsignados { get; set; }
    public int RecortesNoDisponibles { get; set; }
    public int? ListaMaterialesId { get; set; }
    public int? PlantillaFabricacionId { get; set; }
    public int? OrdenProduccionId { get; set; }
    public bool CircuitoHabilitado { get; set; }
    public bool PuedeContinuar { get; set; }
    public List<string> Bloqueantes { get; set; } = new();
}
