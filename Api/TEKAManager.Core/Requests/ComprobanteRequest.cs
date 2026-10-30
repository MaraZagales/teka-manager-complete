using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class ComprobanteDesdePedidoRequest
{
    [Required]
    public int PedidoId { get; set; }

    [Required]
    public int TipoComprobanteId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "El punto de venta debe ser mayor a cero.")]
    public int PuntoVenta { get; set; }

    public long? NumeroComprobante { get; set; }

    [Required]
    public int ConceptoComprobanteId { get; set; }

    [Required]
    public int MonedaId { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class NotaComprobanteRequest
{
    [Required]
    public int TipoComprobanteId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "El punto de venta debe ser mayor a cero.")]
    public int PuntoVenta { get; set; }

    public long? NumeroComprobante { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}
