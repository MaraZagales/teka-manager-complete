namespace TEKAManager.Core.Entities;

public class MotivoInactivacion
{
    public int MotivoInactivacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}
