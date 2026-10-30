namespace TEKAManager.Core.Entities;

public class Color
{
    public int ColorId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? CodigoHex { get; set; }
    public bool Activo { get; set; }
}
