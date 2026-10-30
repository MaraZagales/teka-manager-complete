using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class DomicilioClienteRequest
{
    [StringLength(30)]
    public string? TipoDomicilio { get; set; }

    public int? TipoDomicilioId { get; set; }

    public string? Direccion { get; set; }

    [Required]
    [StringLength(120)]
    public string Calle { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Altura { get; set; } = string.Empty;

    [StringLength(50)]
    public string? PisoDepto { get; set; }

    [StringLength(100)]
    public string? Barrio { get; set; }

    [StringLength(20)]
    public string? CodigoPostal { get; set; }

    [Required]
    public int LocalidadId { get; set; }

    [Required]
    public int ProvinciaId { get; set; }
}
