using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class CobroRegistrarRequest
{
    [Required]
    public int ClienteId { get; set; }

    public int? PedidoId { get; set; }

    public int? CajaId { get; set; }

    [Required]
    public int MedioCobroId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El importe base debe ser mayor a cero.")]
    public decimal ImporteBase { get; set; }

    [Range(0, 100, ErrorMessage = "El recargo debe estar entre 0 y 100%.")]
    public decimal PorcentajeRecargoTarjeta { get; set; }

    [StringLength(100)]
    public string? ReferenciaExterna { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class CobroConfirmarRequest
{
    public int? DepositoId { get; set; }

    [Range(1,int.MaxValue)]
    public int? CuentaBancariaId { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class CobroActualizarPendienteRequest
{
    public int? CajaId { get; set; }

    [Required]
    public int MedioCobroId { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "El importe base debe ser mayor a cero.")]
    public decimal ImporteBase { get; set; }

    [Range(0, 100, ErrorMessage = "El recargo debe estar entre 0 y 100%.")]
    public decimal PorcentajeRecargoTarjeta { get; set; }

    [StringLength(100)]
    public string? ReferenciaExterna { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class CobroAnularRequest
{
    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class AplicacionCobroRequest
{
    [Required]
    public int ComprobanteId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "El importe aplicado debe ser mayor a cero.")]
    public decimal ImporteAplicado { get; set; }
}
