using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class PrecioVentaInsertRequest
{
    [Required]
    public int ProductoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a cero.")]
    public decimal Precio { get; set; }
}

public class PrecioVentaCorrectionRequest
{
    [Required]
    [Range(0.01, 9999999999999999.99, ErrorMessage = "El precio debe ser mayor a cero y compatible con el formato monetario.")]
    public decimal Precio { get; set; }

    [Required(ErrorMessage = "Ingresá el motivo de la corrección.")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "El motivo debe tener entre 5 y 500 caracteres.")]
    public string Motivo { get; set; } = string.Empty;
}
