using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class RecorteRequest
{
    public int? OrdenProduccionId { get; set; }

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

    public decimal? Dimension { get; set; }

    [Required]
    public int UnidadMedidaId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class RecorteCambiarEstadoRequest
{
    [Required]
    public int EstadoRecorteId { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class MovimientoRecorteRequest
{
    public int? OrdenProduccionId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    [StringLength(50)]
    public string TipoMovimiento { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class ConsumoRecorteProduccionRequest
{
    [Required]
    public int RecorteId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad consumida debe ser mayor a cero.")]
    public decimal CantidadConsumida { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class SugerenciaRecorteRequest
{
    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class RecorteProductoSugeridoRequest
{
    [Required]
    public int RecorteId { get; set; }

    [Required]
    public int ProductoId { get; set; }

    [Range(0, 100, ErrorMessage = "El puntaje de compatibilidad debe estar entre 0 y 100.")]
    public decimal? PuntajeCompatibilidad { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}
