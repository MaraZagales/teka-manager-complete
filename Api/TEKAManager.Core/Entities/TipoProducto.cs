namespace TEKAManager.Core.Entities;

public class TipoProducto
{
    public int TipoProductoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}
