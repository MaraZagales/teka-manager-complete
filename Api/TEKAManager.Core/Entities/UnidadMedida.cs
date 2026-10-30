namespace TEKAManager.Core.Entities;

public class UnidadMedida
{
    public int UnidadMedidaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Abreviatura { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
