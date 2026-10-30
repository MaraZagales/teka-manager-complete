using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class ConfiguracionFabricacionGuardarRequest
{
    [Required] public int ProductoId { get; set; }
    [Required, StringLength(120)] public string Nombre { get; set; } = string.Empty;
    [Required, StringLength(20)] public string Version { get; set; } = string.Empty;
    public bool Activar { get; set; } = true;
    [MinLength(1)] public List<ConfiguracionMaterialRequest> Materiales { get; set; } = new();
    public List<ConfiguracionRecortePrevistoRequest> RecortesPrevistos { get; set; } = new();
}

public class ConfiguracionMaterialRequest
{
    [Required] public int InsumoId { get; set; }
    [Range(typeof(decimal), "0.01", "999999999999.99", ParseLimitsInInvariantCulture = true)] public decimal Cantidad { get; set; }
    [StringLength(250)] public string? Observaciones { get; set; }
}

public class ConfiguracionRecortePrevistoRequest
{
    [Required] public int InsumoId { get; set; }
    public int? TipoRecorteId { get; set; }
    public int? ColorId { get; set; }
    public decimal? Dimension { get; set; }
    [Required] public int UnidadMedidaId { get; set; }
    [Range(typeof(decimal), "0.0001", "999999999999.9999", ParseLimitsInInvariantCulture = true)] public decimal CantidadPorUnidad { get; set; }
    [StringLength(250)] public string? Observaciones { get; set; }
}

public class PlantillaOrdenGuardarRequest
{
    public int? PlantillaOrdenProduccionId { get; set; }
    [Required, StringLength(120)] public string Nombre { get; set; } = string.Empty;
    [StringLength(500)] public string? Observaciones { get; set; }
    [MinLength(1)] public List<PlantillaOrdenLineaRequest> Detalles { get; set; } = new();
}

public class PlantillaOrdenLineaRequest
{
    [Required] public int ProductoId { get; set; }
    [Range(typeof(decimal), "0.01", "999999999999.99", ParseLimitsInInvariantCulture = true)] public decimal Cantidad { get; set; }
}
