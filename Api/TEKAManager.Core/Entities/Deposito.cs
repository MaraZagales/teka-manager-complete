namespace TEKAManager.Core.Entities;

public class Deposito
{
    public int DepositoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Ubicacion { get; set; }
    public bool Activo { get; set; }
}
