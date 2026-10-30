using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class InsumoInsertRequest
{
    // Compatibilidad con consumidores anteriores. Para la pantalla nueva, enviar NombreInsumoId.
    [StringLength(120)]
    public string? Nombre { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Seleccioná un nombre de insumo válido.")]
    public int? NombreInsumoId { get; set; }

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    public int TipoInsumoId { get; set; }

    public int? ColorId { get; set; }

    [Required]
    public int UnidadMedidaId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public decimal StockMinimo { get; set; }
}

public class InsumoUpdateRequest
{
    // Compatibilidad con consumidores anteriores. Para la pantalla nueva, enviar NombreInsumoId.
    [StringLength(120)]
    public string? Nombre { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Seleccioná un nombre de insumo válido.")]
    public int? NombreInsumoId { get; set; }

    [StringLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    public int TipoInsumoId { get; set; }

    public int? ColorId { get; set; }

    [Required]
    public int UnidadMedidaId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock mínimo no puede ser negativo.")]
    public decimal StockMinimo { get; set; }
}

public class InsumoDeleteRequest
{
    [Required]
    public int MotivoInactivacionId { get; set; }

    [StringLength(250)]
    public string? ObservacionInactivacion { get; set; }
}