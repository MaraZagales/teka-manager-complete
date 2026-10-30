namespace TEKAManager.Core.DTOs;

public class PrecioVentaDTO
{
    public int PrecioVentaId { get; set; }
    public int ProductoId { get; set; }
    public string? ProductoCodigo { get; set; }
    public string? ProductoNombre { get; set; }
    public DateTime FechaVigenciaDesde { get; set; }
    public DateTime? FechaVigenciaHasta { get; set; }
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
}

public class PrecioVentaCorreccionDTO
{
    public int PrecioVentaCorreccionId { get; set; }
    public int PrecioVentaId { get; set; }
    public int ProductoId { get; set; }
    public decimal ImporteAnterior { get; set; }
    public decimal ImporteNuevo { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public DateTime FechaCorreccion { get; set; }
}
