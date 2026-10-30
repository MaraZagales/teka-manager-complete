namespace TEKAManager.Core.Services;

public sealed class ComercialDigitalOptions
{
    public const string SectionName = "ComercialDigital";
    public int HorasCarritoAbandonado { get; set; }
    public int HorasCheckoutInterrumpido { get; set; }
    public int IntervaloProcesamientoMinutos { get; set; }
    public bool ProcesamientoAutomaticoHabilitado { get; set; }
}
