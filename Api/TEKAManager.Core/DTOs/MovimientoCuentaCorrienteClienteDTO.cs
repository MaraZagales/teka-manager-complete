namespace TEKAManager.Core.DTOs;

public class MovimientoCuentaCorrienteClienteDTO
{
    public int MovimientoCuentaCorrienteClienteId { get; set; }
    public int ClienteId { get; set; }
    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteApellido { get; set; }
    public int TipoMovimientoCuentaCorrienteId { get; set; }
    public string TipoMovimientoNombre { get; set; } = string.Empty;
    public short Signo { get; set; }
    public DateTime FechaMovimiento { get; set; }
    public int? PedidoId { get; set; }
    public int? ComprobanteId { get; set; }
    public int? CobroId { get; set; }
    public decimal Importe { get; set; }
    public string? Observaciones { get; set; }
}
