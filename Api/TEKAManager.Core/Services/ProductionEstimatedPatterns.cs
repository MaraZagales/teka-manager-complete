namespace TEKAManager.Core.Services;

public sealed record ProductionEstimatedPiece(
    string Name, int Quantity, decimal LengthMm, decimal WidthMm,
    string Edges, bool SecondaryMaterial = false, bool VerticalGrain = false,
    string? Assumption = null);

public sealed record ProductionEstimatedPattern(
    int FamilyId, string Model, decimal ExteriorWidthMm, decimal ExteriorHeightMm,
    decimal ExteriorDepthMm, IReadOnlyList<ProductionEstimatedPiece> Pieces,
    int HingeCount, int SlidePairCount, int EstimatedJoints,
    IReadOnlyList<string> Assumptions)
{
    // L1/L2 are lengthwise exposed edges; A1/A2 are widthwise edges.
    public decimal EdgingMeters => EdgeMeters(Pieces);
    public decimal MainEdgingMeters => EdgeMeters(Pieces.Where(x => !x.SecondaryMaterial));
    public decimal SecondaryEdgingMeters => EdgeMeters(Pieces.Where(x => x.SecondaryMaterial));
    private static decimal EdgeMeters(IEnumerable<ProductionEstimatedPiece> pieces) =>
        pieces.Sum(p => p.Quantity *
            ((p.Edges.Split(',', StringSplitOptions.RemoveEmptyEntries).Count(e => e is "L1" or "L2") * p.LengthMm) +
             (p.Edges.Split(',', StringSplitOptions.RemoveEmptyEntries).Count(e => e is "A1" or "A2") * p.WidthMm))) / 1000m;
}

/// <summary>
/// EST-01 visible layout reviewed against Fotos productos.zip. Outer dimensions and
/// 18 mm stock are confirmed; internal dimensions and construction remain estimates.
/// These patterns are reviewable drafts, not certified fabrication drawings.
/// </summary>
public static class ProductionEstimatedPatterns
{
    private static ProductionEstimatedPiece P(string name, int quantity, decimal length,
        decimal width, string edges = "", bool secondary = false, bool vertical = false,
        string? assumption = null) =>
        new(name, quantity, length, width, edges, secondary, vertical, assumption);

    public static IReadOnlyList<ProductionEstimatedPattern> All { get; } =
    [
        new(1, "Mesa ratona", 750, 400, 400,
        [
            P("Tapa",1,750,400,"L1,L2,A1,A2"),
            P("Lateral",2,382,400,"L1",vertical:true),
            P("Piso abierto",1,714,382,"L1",assumption:"Piso visible en la abertura frontal; profundidad estimada."),
            P("Faja superior Olmo",1,714,70,"L1,L2",secondary:true,
                assumption:"Faja decorativa bajo la tapa observada en fotografia."),
            P("Zocalo Olmo",1,750,70,"L1",secondary:true,
                assumption:"Zocalo frontal visible; altura y fijacion estimadas.")
        ],0,0,6,["Foto: abertura frontal, piso inferior, faja y zocalo Olmo; no se observa puerta.","Uniones, profundidad del piso y estabilidad pendientes de comprobacion."]),

        new(2, "Rack TV", 1400, 520, 365,
        [
            P("Tapa",1,1400,365,"L1,L2,A1,A2"),
            P("Piso",1,1400,365,"L1"),
            P("Lateral",2,484,365,"L1",vertical:true),
            P("Division lateral",2,484,347,"L1",vertical:true),
            P("Fondo trasero",1,1364,484,assumption:"La foto muestra fondo central; continuidad detras de las puertas por confirmar."),
            P("Estante central",1,430,347,"L1",assumption:"Un estante visible en el vano central."),
            P("Puerta lateral",2,400,430,"L1,L2,A1,A2",vertical:true,
                assumption:"Dos puertas laterales del color principal; ancho y luces estimados."),
            P("Faja superior Olmo",1,1364,55,"L1,L2",secondary:true,
                assumption:"Faja Olmo horizontal visible debajo de la tapa."),
            P("Zocalo Olmo",1,1400,70,"L1",secondary:true,
                assumption:"Zocalo Olmo visible; altura y ensamblaje por confirmar.")
        ],4,0,14,["Foto: dos puertas laterales, vano con un estante y franjas Olmo superior e inferior.","Confirmar fondo trasero, pasacables, dimensiones de puertas y orientacion real de la veta.","Contrastar el rendimiento de dos racks por placa principal con la geometria recalculada; no se impone al optimizador."]),

        new(3, "Cajonera doble", 1200, 780, 450,
        [
            P("Tapa",1,1200,450,"L1,L2,A1,A2"),
            P("Piso",1,1164,450,"L1"),
            P("Lateral",2,744,450,"L1",vertical:true),
            P("Division central",1,744,450,"L1",vertical:true),
            P("Fondo trasero",1,1164,744),
            P("Frente de cajon",6,210,579,"L1,L2,A1,A2",vertical:true,
                assumption:"Foto: dos columnas por tres filas; altura de frente y luces estimadas."),
            P("Lateral de cajon",12,400,150,"L1"),
            P("Frente interior de cajon",6,511,150),
            P("Trasera de cajon",6,511,150),
            P("Fondo de cajon 18 mm",6,547,400),
            P("Faja superior Olmo",1,1164,35,"L1",secondary:true,
                assumption:"Franja Olmo bajo tapa visible en la foto."),
            P("Zocalo Olmo",1,1200,60,"L1",secondary:true,
                assumption:"Zocalo frontal Olmo visible en la foto.")
        ],0,6,38,["Foto: seis cajones, dos columnas por tres filas, franja superior y zocalo Olmo.","Alturas de frentes, holguras de correderas de 400 mm y uniones de fondos pendientes de medir."]),

        new(4, "Mesa de luz", 500, 550, 370,
        [
            P("Tapa",1,500,370,"L1,L2,A1,A2"),
            P("Piso",1,464,370,"L1"),
            P("Lateral",2,514,370,"L1",vertical:true),
            P("Fondo trasero",1,464,514),
            P("Separador bajo cajon",1,464,352,"L1",assumption:"Separador entre el cajon superior y vano abierto."),
            P("Frente de cajon Olmo",1,460,160,"L1,L2,A1,A2",secondary:true,
                assumption:"Foto: un cajon superior con frente Olmo de veta horizontal."),
            P("Lateral de cajon",2,300,120,"L1"),
            P("Frente interior de cajon",1,410,120),
            P("Trasera de cajon",1,410,120),
            P("Fondo de cajon 18 mm",1,446,300),
            P("Zocalo Olmo",1,464,70,"L1",secondary:true,
                assumption:"Zocalo frontal Olmo visible.")
        ],0,0,12,["Foto: cajon superior Olmo y vano abierto inferior; no es una mesa sin cajon.","La corredera catalogada de 400 mm no cabe en 370 mm exteriores: falta identificar una corredera corta real antes de habilitar la BOM.","Altura de frente, profundidad util y fijaciones del cajon por medir."]),

        new(5, "Escritorio", 1200, 760, 500,
        [
            P("Tapa de trabajo",1,1200,500,"L1,L2,A1,A2"),
            P("Lateral de apoyo",2,742,500,"L1",vertical:true),
            P("Faldon posterior",1,1164,250,"L1,L2",assumption:"Faldon visible; altura estimada."),
            P("Division del cajon",1,400,180,"L1",vertical:true,
                assumption:"Cierre lateral del unico cajon bajo la tapa."),
            P("Frente de cajon Olmo",1,360,160,"L1,L2,A1,A2",secondary:true,
                assumption:"Foto: frente Olmo del cajon lateral."),
            P("Lateral de cajon",2,400,120,"L1"),
            P("Frente interior de cajon",1,310,120),
            P("Trasera de cajon",1,310,120),
            P("Fondo de cajon 18 mm",1,346,400),
            P("Bandeja movil Olmo",1,400,300,"L1",secondary:true,
                assumption:"Foto: bandeja inferior separada; confirmar si integra el escritorio."),
            P("Lateral de bandeja Olmo",2,400,60,"L1",secondary:true),
            P("Testero de bandeja Olmo",2,300,60,"L1",secondary:true)
        ],0,1,16,["Foto: un cajon lateral Olmo, faldon posterior, soportes laterales y bandeja inferior separada.","Confirmar si la bandeja se entrega con el escritorio; sus ruedas o deslizadores no tienen insumo identificado.","Pasacables, rigidez del faldon y holguras del cajon pendientes de medir."]),

        new(6, "Mesa comedor", 1400, 760, 1400,
        [
            P("Tablero superior",1,1400,1400,"L1,L2,A1,A2"),
            P("Pedestal frente y trasera",2,724,500,"L1",vertical:true,
                assumption:"Foto: pedestal central cerrado; ancho de 500 mm estimado."),
            P("Pedestal laterales",2,724,464,"L1",vertical:true),
            P("Arriostre superior",1,464,464),
            P("Base del pedestal",1,464,464),
            P("Faja perimetral Olmo",4,1364,50,"L1",secondary:true,
                assumption:"Faja de contraste observada bajo el tablero.")
        ],0,0,16,["Foto: tablero de 1400 x 1400 mm sobre pedestal central, sin cuatro patas separadas.","Pedestal, arriostres y faja Olmo son un esquema preliminar; comprobar vuelco, flexion, uniones y resistencia con calculo o documentacion del fabricante."]),

        new(7, "Vajillero", 1400, 780, 400,
        [
            P("Tapa",1,1400,400,"L1,L2,A1,A2"),
            P("Piso",1,1364,400,"L1"),
            P("Lateral",2,744,400,"L1",vertical:true),
            P("Division entre vanos",2,744,382,"L1",vertical:true),
            P("Fondo trasero",1,1364,744),
            P("Estante vano derecho",2,440,382,"L1",
                assumption:"Dos estantes visibles al abrir la puerta derecha; otros vanos no comprobados."),
            P("Puerta",3,700,448,"L1,L2,A1,A2",vertical:true,
                assumption:"Foto: tres puertas; anchos y luces estimados."),
            P("Faja superior Olmo",1,1364,60,"L1",secondary:true,
                assumption:"Faja Olmo continua bajo tapa visible."),
            P("Zocalo Olmo",1,1400,70,"L1",secondary:true)
        ],6,0,18,["Foto: tres puertas, franja superior y zocalo Olmo; dos estantes visibles en el vano derecho.","Interior de los otros vanos, separaciones, bisagras y luces pendientes de medir."]),

        new(8, "Biblioteca", 500, 1700, 370,
        [
            P("Lateral alto",2,1700,370,"L1",vertical:true),
            P("Tapa",1,464,370,"L1"),
            P("Piso",1,464,370,"L1"),
            P("Fondo trasero",1,464,1664),
            P("Estante y separador",3,464,352,"L1",assumption:"Dos estantes abiertos y un separador del vano inferior."),
            P("Puerta inferior",1,380,460,"L1,L2,A1,A2",vertical:true,
                assumption:"Foto: puerta inferior; altura y luces estimadas."),
            P("Faja sobre puerta Olmo",1,464,45,"L1",secondary:true),
            P("Zocalo Olmo",1,500,70,"L1",secondary:true)
        ],2,0,14,["Foto: tres espacios abiertos encima de un vano inferior con puerta; dos estantes mas su separador.","Bisagras de la puerta, fijacion del fondo, cargas y anclaje antivuelco pendientes de revision."])
    ];

    public static ProductionEstimatedPattern Get(int familyId) =>
        All.Single(x => x.FamilyId == familyId);
}
