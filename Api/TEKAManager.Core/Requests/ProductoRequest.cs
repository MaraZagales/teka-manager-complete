using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class ProductoInsertRequest
{
    [Required]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    public int TipoProductoId { get; set; }

    [Range(1, int.MaxValue)]
    public int? NombreProductoId { get; set; }

    public int? ColorId { get; set; }

    [Required]
    public int UnidadMedidaId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public decimal StockMinimo { get; set; }

    // Dimensiones fisicas del producto estandar, en centimetros.
    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "El ancho debe ser mayor que cero.")]
    public decimal? AnchoCm { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "El alto debe ser mayor que cero.")]
    public decimal? AltoCm { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "La profundidad debe ser mayor que cero.")]
    public decimal? ProfundidadCm { get; set; }
}

public class ProductoUpdateRequest
{
    [Required]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    public int TipoProductoId { get; set; }

    [Range(1, int.MaxValue)]
    public int? NombreProductoId { get; set; }

    public int? ColorId { get; set; }

    [Required]
    public int UnidadMedidaId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public decimal StockMinimo { get; set; }

    // Dimensiones fisicas del producto estandar, en centimetros.
    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "El ancho debe ser mayor que cero.")]
    public decimal? AnchoCm { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "El alto debe ser mayor que cero.")]
    public decimal? AltoCm { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true, ErrorMessage = "La profundidad debe ser mayor que cero.")]
    public decimal? ProfundidadCm { get; set; }
}

public class ProductoDeleteRequest
{
    [Required]
    public int MotivoInactivacionId { get; set; }

    [StringLength(250)]
    public string? ObservacionInactivacion { get; set; }
}