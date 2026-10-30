using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class PedidoInsertRequest
{
    [Required]
    public int ClienteId { get; set; }

    [Required]
    public int CanalVentaId { get; set; }

    [Range(1, int.MaxValue)]
    public int? OportunidadComercialId { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "El pedido debe tener al menos un detalle.")]
    public List<PedidoDetalleInsertRequest> Detalles { get; set; } = new();
}

public class PedidoDetalleInsertRequest
{
    [Required]
    public int ProductoId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }
}

public class PedidoDetalleUpdateRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a cero.")]
    public decimal Cantidad { get; set; }
}

public class PedidoConfirmarPagadoRequest
{
    [Required]
    public int DepositoId { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

public class PedidoCancelarRequest
{
    [System.Text.Json.Serialization.JsonIgnore]
    public int UsuarioId { get; set; }

    [StringLength(250)]
    public string? Observaciones { get; set; }
}

/// <summary>Anula el pedido y, si hubo cobros, registra su reintegro efectivo completo.</summary>
public class PedidoAnulacionIntegralRequest
{
    // El controlador lo obtiene del JWT; nunca se acepta el responsable del cuerpo HTTP.
    [System.Text.Json.Serialization.JsonIgnore]
    public int UsuarioId { get; set; }

    [Required, StringLength(250, MinimumLength = 1)]
    public string Motivo { get; set; } = string.Empty;

    [RegularExpression("^(Efectivo|Transferencia|Tarjeta|Plataforma)$")]
    public string? MedioReintegro { get; set; }

    [Range(1, int.MaxValue)]
    public int? CajaId { get; set; }

    [Range(1, int.MaxValue)]
    public int? CuentaBancariaId { get; set; }

    [StringLength(100)]
    public string? ReferenciaReintegro { get; set; }

    // SQL exige recepción física solo si el remito/pedido acredita entrega.
    public bool MercaderiaRecibidaApta { get; set; }

    // SQL exige reintegro solo cuando existen importes efectivamente cobrados.
    public bool ReintegroRealizado { get; set; }
}

public class PedidoAnulacionIntegralResultado
{
    public int PedidoId { get; set; }
    public int? NotaCreditoId { get; set; }
    public long? NumeroNotaCredito { get; set; }
    public int? DevolucionVentaIntegralId { get; set; }
    public decimal ImporteReintegrado { get; set; }
    public decimal? ImporteComprobante { get; set; }
}
