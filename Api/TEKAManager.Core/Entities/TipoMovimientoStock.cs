namespace TEKAManager.Core.Entities;

public class TipoMovimientoStock
{
    public int TipoMovimientoStockId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public short Signo { get; set; }
    public bool Activo { get; set; }
}
