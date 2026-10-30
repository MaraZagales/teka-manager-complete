using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class ClienteInsertRequest
{
    [Required]
    [StringLength(100)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Apellido { get; set; }

    [Required]
    public int TipoDocumentoId { get; set; }

    [StringLength(20)]
    public string? Documento { get; set; }

    [StringLength(30)]
    [Phone]
    public string? Telefono { get; set; }

    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [Required]
    public int CondicionIVAId { get; set; }

    [StringLength(500)]
    public string? Observaciones { get; set; }
}

public class ClienteUpdateRequest : ClienteInsertRequest
{
}

public class ClienteDeleteRequest
{
    [Required]
    public int MotivoInactivacionId { get; set; }

    [StringLength(250)]
    public string? ObservacionInactivacion { get; set; }
}
