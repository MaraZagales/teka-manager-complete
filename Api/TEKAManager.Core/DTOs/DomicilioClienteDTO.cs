namespace TEKAManager.Core.DTOs;

public class DomicilioClienteDTO
{
    public int DomicilioClienteId { get; set; }
    public int ClienteId { get; set; }
    public string TipoDomicilio { get; set; } = string.Empty;
    public int? TipoDomicilioId { get; set; }
    public string Direccion { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string Altura { get; set; } = string.Empty;
    public string? PisoDepto { get; set; }
    public string? Barrio { get; set; }
    public string? CodigoPostal { get; set; }
    public int LocalidadId { get; set; }
    public string LocalidadNombre { get; set; } = string.Empty;
    public int ProvinciaId { get; set; }
    public string ProvinciaNombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
