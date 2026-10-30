using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class MovimientoProductoRequest
{
    [Required]
    public int TipoMovimientoStockId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    public int ProductoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [StringLength(250)]
    public string? Motivo { get; set; }

    [StringLength(50)]
    public string? EntidadOrigen { get; set; }

    public int? OrigenId { get; set; }
}

public class MovimientoProductoManualRequest
{
    [Required]
    public int TipoMovimientoStockId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    public int ProductoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [Required(AllowEmptyStrings = false, ErrorMessage = "El motivo es obligatorio para ajustes manuales.")]
    [StringLength(250)]
    public string Motivo { get; set; } = string.Empty;
}

public class MovimientoInsumoRequest
{
    [Required]
    public int TipoMovimientoStockId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    public int InsumoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [StringLength(250)]
    public string? Motivo { get; set; }

    [StringLength(50)]
    public string? EntidadOrigen { get; set; }

    public int? OrigenId { get; set; }
}

public class MovimientoInsumoManualRequest
{
    [Required]
    public int TipoMovimientoStockId { get; set; }

    [Required]
    public int DepositoId { get; set; }

    [Required]
    public int InsumoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }

    [Required(AllowEmptyStrings = false, ErrorMessage = "El motivo es obligatorio para ajustes manuales.")]
    [StringLength(250)]
    public string Motivo { get; set; } = string.Empty;
}

public class AnularMovimientoRequest
{
    [Required(AllowEmptyStrings = false, ErrorMessage = "El motivo de anulación es obligatorio.")]
    [StringLength(250)]
    public string MotivoAnulacion { get; set; } = string.Empty;

    [StringLength(250)]
    public string? ObservacionAnulacion { get; set; }
}
