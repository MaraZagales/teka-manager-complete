namespace TEKAManager.Core.Services;

public static class RecorteGeometria
{
    public const string Completa = "Completa";
    public const string Incompleta = "Incompleta";
    public const string Inconsistente = "Inconsistente";

    public static string Clasificar(decimal? largoMm, decimal? anchoMm, decimal? espesorMm,
        string? orientacionVeta, int insumoId, int? colorId, bool colorCompatible)
    {
        if (largoMm is <= 0 || anchoMm is <= 0 || espesorMm is <= 0 ||
            (orientacionVeta is not null && orientacionVeta is not ("Indiferente" or "Largo" or "Ancho")) ||
            !colorCompatible)
            return Inconsistente;

        if (largoMm is null || anchoMm is null || espesorMm is null ||
            orientacionVeta is null || insumoId <= 0 || colorId is null)
            return Incompleta;

        return Completa;
    }

    public static void ValidarEntrada(decimal? largoMm, decimal? anchoMm, decimal? espesorMm,
        string? orientacionVeta)
    {
        if (largoMm is <= 0 || anchoMm is <= 0 || espesorMm is <= 0)
            throw new InvalidOperationException("Las medidas informadas deben ser mayores que cero.");
        if (largoMm is > 9999999999.99m || anchoMm is > 9999999999.99m || espesorMm is > 999999.99m ||
            !TieneDosDecimales(largoMm) || !TieneDosDecimales(anchoMm) || !TieneDosDecimales(espesorMm))
            throw new InvalidOperationException("Las medidas deben expresarse en milimetros con hasta dos decimales.");
        if (orientacionVeta is not null && orientacionVeta is not ("Indiferente" or "Largo" or "Ancho"))
            throw new InvalidOperationException("La orientacion de veta debe ser Indiferente, Largo o Ancho.");
    }

    public static bool EsElegible(decimal stock, string estado, string tipoInsumo,
        decimal? largoMm, decimal? anchoMm, decimal? espesorMm, string? orientacionVeta,
        int insumoId, int? colorId, bool colorCompatible) =>
        stock > 0 && estado.Equals("Disponible", StringComparison.OrdinalIgnoreCase)
        && tipoInsumo.Equals("Melamina", StringComparison.OrdinalIgnoreCase)
        && Clasificar(largoMm, anchoMm, espesorMm, orientacionVeta, insumoId, colorId, colorCompatible) == Completa;

    private static bool TieneDosDecimales(decimal? value) =>
        value is null || decimal.Round(value.Value, 2) == value.Value;
}
