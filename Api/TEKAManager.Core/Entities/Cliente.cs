namespace TEKAManager.Core.Entities;

public class Cliente
{
    public int ClienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public int TipoDocumentoId { get; set; }
    public string TipoDocumentoNombre { get; set; } = string.Empty;
    public int TipoDocumentoCodigoARCA { get; set; }
    public string? Documento { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public int CondicionIVAId { get; set; }
    public string CondicionIVANombre { get; set; } = string.Empty;
    public string? CondicionIVACodigoAFIP { get; set; }
    public string? Observaciones { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaAlta { get; set; }
    public int? MotivoInactivacionId { get; set; }
    public string? MotivoInactivacionNombre { get; set; }
    public string? ObservacionInactivacion { get; set; }
    public DateTime? FechaInactivacion { get; set; }
}
