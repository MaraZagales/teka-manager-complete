using System.Security.Cryptography;
using System.Text.Json;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public sealed record MotivoTecnico(string Codigo, string Severidad, string Detalle,
    int? OrdenPieza = null, int? RecorteId = null);

public sealed record ResultadoTecnico(string Resultado, string VersionValidador,
    DateTime FechaUtc, byte[] ContenidoHash, IReadOnlyList<string> ReglasAplicadas,
    IReadOnlyList<MotivoTecnico> Motivos)
{
    public bool EsValida => Resultado == "Valida";
}

public sealed record InsumoDisponibilidad(int InsumoId, bool Activo, decimal StockDisponible);

/// <summary>
/// Verifica un despiece posicionado. No certifica acabado, ensamblaje ni estabilidad;
/// por ello nunca emite Valida en esta version.
/// </summary>
public sealed class RecortePropuestaValidador
{
    public const string Version = "2B.1";
    private const string Error = "Error";
    private const string Pendiente = "Pendiente";
    private const string Advertencia = "Advertencia";

    public ResultadoTecnico Evaluar(RecorteDisenoDraft d,
        IReadOnlyCollection<RecorteCandidatoSnapshot> snapshot,
        IReadOnlyCollection<RecorteCandidatoSnapshot> inventarioActual,
        IReadOnlyDictionary<int, InsumoDisponibilidad>? insumosActuales = null)
    {
        var motivos = new List<MotivoTecnico>();
        var reglas = new[] { "DIMENSIONES_2_DECIMALES", "UNIDAD_FISICA_UNICA", "SNAPSHOT_VIGENTE",
            "MATERIAL_COLOR_ESPESOR", "VETA_ROTACION", "CONTENCION_CON_KERF_MARGEN_TOLERANCIA",
            "NO_SUPERPOSICION", "CANTIDAD_DE_PIEZAS", "COSTOS_CON_FUENTE" };
        var snap = snapshot.ToDictionary(x => x.RecorteId);
        var live = inventarioActual.ToDictionary(x => x.RecorteId);
        var pieces = d.Piezas.GroupBy(x => x.OrdenPieza).ToDictionary(x => x.Key, x => x.First());
        var placements = new Dictionary<int, List<(RecorteDisenoAsignacionDraft Cut, decimal Gap)>>();

        if (d.LargoExteriorMm <= 0 || d.AnchoExteriorMm <= 0 || d.AltoExteriorMm <= 0 ||
            d.CantidadSugerida <= 0 || d.Piezas.Count == 0 ||
            !Mm(d.LargoExteriorMm) || !Mm(d.AnchoExteriorMm) || !Mm(d.AltoExteriorMm))
            motivos.Add(new("DISENO_DIMENSION_INVALIDA", Error, "Dimensiones exteriores o cantidad invalidas."));

        foreach (var p in d.Piezas)
        {
            if (p.Cantidad <= 0 || p.LargoMm <= 0 || p.AnchoMm <= 0 || p.EspesorMm <= 0 ||
                !Mm(p.LargoMm) || !Mm(p.AnchoMm) || !Mm(p.EspesorMm) ||
                p.OrientacionVeta is not ("Indiferente" or "Largo" or "Ancho"))
                motivos.Add(new("PIEZA_DIMENSION_INVALIDA", Error, "Medidas, cantidad o veta invalidas.", p.OrdenPieza));
            if (p.Origen == "Recorte")
            {
                var count = d.Asignaciones.Where(a => a.OrdenPieza == p.OrdenPieza).Sum(a => a.CantidadPiezas);
                if (count != (long)p.Cantidad * d.CantidadSugerida)
                    motivos.Add(new("PIEZA_CANTIDAD_SIN_CUBRIR", Error,
                        "Las asignaciones no cubren todas las piezas a fabricar.", p.OrdenPieza));
            }
        }

        foreach (var a in d.Asignaciones)
        {
            if (!pieces.TryGetValue(a.OrdenPieza, out var p) || p.Origen != "Recorte")
            {
                motivos.Add(new("ASIGNACION_SIN_PIEZA", Error, "Asignacion sin pieza de recorte.", a.OrdenPieza, a.RecorteId));
                continue;
            }
            if (!snap.TryGetValue(a.RecorteId, out var r))
            {
                motivos.Add(new("RECORTE_FUERA_SNAPSHOT", Error, "Recorte no incluido en el snapshot previo.", p.OrdenPieza, a.RecorteId));
                continue;
            }
            if (!live.TryGetValue(a.RecorteId, out var actual) || !MismoInventario(r, actual))
                motivos.Add(new("INVENTARIO_CAMBIO", Error,
                    "El recorte fue consumido, movido o cambio desde la captura.", p.OrdenPieza, a.RecorteId));
            if (r.UnidadNombre != "Unidad" || r.CantidadRegistrada != 1 || r.CantidadDisponible != 1 ||
                r.EstadoNombre != "Disponible" || r.TipoInsumoNombre != "Melamina")
                motivos.Add(new("RECORTE_NO_UNITARIO", Error,
                    "No hay identidad confiable de una unica pieza fisica disponible.", p.OrdenPieza, a.RecorteId));
            if (r.LargoMm is not > 0 || r.AnchoMm is not > 0 || r.EspesorMm is not > 0 ||
                r.OrientacionVeta is not ("Indiferente" or "Largo" or "Ancho"))
            {
                motivos.Add(new("RECORTE_GEOMETRIA_INCOMPLETA", Error,
                    "Geometria del recorte incompleta o invalida.", p.OrdenPieza, a.RecorteId));
                continue;
            }
            if (p.InsumoId != r.InsumoId)
                motivos.Add(new("MATERIAL_DIFERENTE", Error, "Insumo/material incompatible.", p.OrdenPieza, a.RecorteId));
            if (p.ColorId is null || r.ColorId is null || p.ColorId != r.ColorId ||
                (r.InsumoColorId is not null && r.InsumoColorId != r.ColorId))
                motivos.Add(new("COLOR_DIFERENTE", Error, "Color no identificable o incompatible.", p.OrdenPieza, a.RecorteId));
            if (p.EspesorMm != r.EspesorMm)
                motivos.Add(new("ESPESOR_DIFERENTE", Error, "Espesor incompatible.", p.OrdenPieza, a.RecorteId));
            if (p.OrientacionVeta != "Indiferente")
            {
                var expected = a.Giro90 ? (p.OrientacionVeta == "Largo" ? "Ancho" : "Largo") : p.OrientacionVeta;
                if (r.OrientacionVeta == "Indiferente")
                    motivos.Add(new("VETA_NO_VERIFICABLE", Pendiente,
                        "La veta del recorte es indiferente pero la pieza exige direccion.", p.OrdenPieza, a.RecorteId));
                else if (expected != r.OrientacionVeta)
                    motivos.Add(new("ROTACION_VETA_PROHIBIDA", Error,
                        "La rotacion contradice la orientacion de veta.", p.OrdenPieza, a.RecorteId));
            }
            if (a.CantidadPiezas != 1)
                motivos.Add(new("ASIGNACION_AGRUPADA", Error,
                    "Cada posicion debe identificar una sola pieza.", p.OrdenPieza, a.RecorteId));
            if (a.AnchoSierraMm is null || a.MargenSeguridadMm is null || a.ToleranciaMm is null)
            {
                motivos.Add(new("PARAMETROS_CORTE_FALTANTES", Pendiente,
                    "Faltan sierra, margen o tolerancia medidos.", p.OrdenPieza, a.RecorteId));
                continue;
            }
            var kerf = a.AnchoSierraMm.Value;
            var margin = a.MargenSeguridadMm.Value;
            var tolerance = a.ToleranciaMm.Value;
            if (kerf <= 0 || margin < 0 || tolerance < 0 || !Mm(kerf) || !Mm(margin) || !Mm(tolerance) ||
                a.PosicionXmm < 0 || a.PosicionYmm < 0 || a.LargoCorteMm <= 0 || a.AnchoCorteMm <= 0 ||
                !Mm(a.PosicionXmm) || !Mm(a.PosicionYmm) || !Mm(a.LargoCorteMm) || !Mm(a.AnchoCorteMm))
            {
                motivos.Add(new("CORTE_PARAMETRO_INVALIDO", Error,
                    "Coordenadas o parametros de corte invalidos.", p.OrdenPieza, a.RecorteId));
                continue;
            }
            var expectedLength = a.Giro90 ? p.AnchoMm : p.LargoMm;
            var expectedWidth = a.Giro90 ? p.LargoMm : p.AnchoMm;
            if (Math.Abs(a.LargoCorteMm - expectedLength) > tolerance ||
                Math.Abs(a.AnchoCorteMm - expectedWidth) > tolerance)
                motivos.Add(new("CORTE_NO_COINCIDE_PIEZA", Error,
                    "El corte no coincide con la pieza y su rotacion.", p.OrdenPieza, a.RecorteId));
            var gap = margin + tolerance + kerf / 2m;
            if (a.PosicionXmm < gap || a.PosicionYmm < gap ||
                a.PosicionXmm + a.LargoCorteMm + gap > r.LargoMm.Value ||
                a.PosicionYmm + a.AnchoCorteMm + gap > r.AnchoMm.Value)
                motivos.Add(new("PIEZA_FUERA_RECORTE", Error,
                    "El corte sobresale al incluir sierra, margen y tolerancia.", p.OrdenPieza, a.RecorteId));
            if (!placements.TryGetValue(a.RecorteId, out var list)) placements[a.RecorteId] = list = [];
            list.Add((a, gap));
        }

        foreach (var (recorteId, list) in placements)
            for (var i = 0; i < list.Count; i++)
                for (var j = i + 1; j < list.Count; j++)
                {
                    var left = list[i].Cut;
                    var right = list[j].Cut;
                    var clearance = Math.Max(left.AnchoSierraMm!.Value, right.AnchoSierraMm!.Value)
                        + left.MargenSeguridadMm!.Value + right.MargenSeguridadMm!.Value
                        + left.ToleranciaMm!.Value + right.ToleranciaMm!.Value;
                    var separated = left.PosicionXmm + left.LargoCorteMm + clearance <= right.PosicionXmm ||
                        right.PosicionXmm + right.LargoCorteMm + clearance <= left.PosicionXmm ||
                        left.PosicionYmm + left.AnchoCorteMm + clearance <= right.PosicionYmm ||
                        right.PosicionYmm + right.AnchoCorteMm + clearance <= left.PosicionYmm;
                    if (!separated)
                        motivos.Add(new("CORTES_SUPERPUESTOS", Error,
                            "Dos posiciones se superponen o no dejan ancho de sierra suficiente.",
                            left.OrdenPieza, recorteId));
                }

        if (d.Asignaciones.Count == 0)
            motivos.Add(new("SIN_RECORTES", Error, "La propuesta no utiliza recortes."));
        var used = d.Asignaciones.Select(x => x.RecorteId).Distinct()
            .Where(snap.ContainsKey).Select(x => snap[x]).ToArray();
        if (used.Select(x => x.ColorId).Distinct().Count() > 1 ||
            used.Select(x => x.InsumoId).Distinct().Count() > 1 ||
            used.Select(x => x.EspesorMm).Distinct().Count() > 1)
            motivos.Add(new("RECORTES_INCOMPATIBLES", Error,
                "Los recortes combinados deben compartir material, color y espesor."));
        if (used.Any(x => d.MaterialInsumoId != x.InsumoId || d.ColorId != x.ColorId))
            motivos.Add(new("DISENO_MATERIAL_COLOR", Error,
                "Material o color del diseno no coincide con los recortes."));
        if (d.Costos.Any(c => c.CostoUnitario is null || c.Subtotal is null))
            motivos.Add(new("COSTO_INCOMPLETO", Advertencia,
                "Hay componentes sin fuente verificable; no se infiere costo cero."));
        if (used.Length > 0 && !d.Costos.Any(c => c.Tipo == "Recorte"))
            motivos.Add(new("COSTO_RECORTE_FALTANTE", Advertencia,
                "El despiece usa recortes sin una fuente de costo estimado."));
        foreach (var supply in d.InsumosComplementarios)
        {
            if (insumosActuales is null || !insumosActuales.TryGetValue(supply.InsumoId, out var current))
                motivos.Add(new("INSUMO_NO_VERIFICADO", Pendiente,
                    "No se verifico el insumo complementario en inventario."));
            else if (!current.Activo || current.StockDisponible < supply.Cantidad * d.CantidadSugerida)
                motivos.Add(new("INSUMO_INSUFICIENTE", Error,
                    "Insumo complementario inactivo o con stock insuficiente."));
            if (!d.Costos.Any(c => c.Tipo == "Insumo" && c.InsumoId == supply.InsumoId))
                motivos.Add(new("COSTO_INSUMO_FALTANTE", Advertencia,
                    "El insumo complementario no tiene componente de costo."));
        }
        if (d.Piezas.Any(x => x.Origen == "Insumo"))
            motivos.Add(new("PIEZA_INSUMO_SIN_DISTRIBUCION", Pendiente,
                "No se verifica el corte de piezas provenientes de placas nuevas."));
        motivos.Add(new("ACABADO_NO_ESTRUCTURADO", Pendiente,
            "El acabado no tiene catalogo verificable en Recorte/Insumo."));
        motivos.Add(new("ENSAMBLE_ESTABILIDAD_PENDIENTE", Pendiente,
            "No existe verificacion certificada de ensamble y estabilidad del mueble."));
        motivos.Add(new("EXTERIOR_DESPIECE_PENDIENTE", Pendiente,
            "No se verifico la coherencia constructiva del despiece con las dimensiones exteriores."));
        motivos.Add(new("PLAN_CORTE_MAQUINA_PENDIENTE", Pendiente,
            "La distribucion espacial no certifica que la maquinaria disponible pueda ejecutar la secuencia de cortes."));
        foreach (var warning in d.Advertencias.Where(x => !string.IsNullOrWhiteSpace(x)))
            motivos.Add(new("ADVERTENCIA_PROVEEDOR", Advertencia, warning));
        foreach (var assumption in d.Supuestos.Where(x => !string.IsNullOrWhiteSpace(x)))
            motivos.Add(new("SUPUESTO_PROVEEDOR", "Supuesto", assumption));
        var result = motivos.Any(x => x.Severidad == Error) ? "Invalida" : "PendienteGeometria";
        return new(result, Version, DateTime.UtcNow,
            SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(d)), reglas, motivos);
    }

    private static bool Mm(decimal value) => decimal.Round(value, 2) == value;

    private static bool MismoInventario(RecorteCandidatoSnapshot a, RecorteCandidatoSnapshot b) =>
        a.RecorteId == b.RecorteId && a.InsumoId == b.InsumoId &&
        a.TipoInsumoId == b.TipoInsumoId && a.ColorId == b.ColorId &&
        a.InsumoColorId == b.InsumoColorId && a.EstadoRecorteId == b.EstadoRecorteId &&
        a.DepositoId == b.DepositoId && a.UnidadMedidaId == b.UnidadMedidaId &&
        a.CantidadRegistrada == b.CantidadRegistrada &&
        a.CantidadDisponible == b.CantidadDisponible && a.LargoMm == b.LargoMm &&
        a.AnchoMm == b.AnchoMm && a.EspesorMm == b.EspesorMm &&
        a.OrientacionVeta == b.OrientacionVeta && a.EstadoNombre == b.EstadoNombre &&
        a.UnidadNombre == b.UnidadNombre && a.TipoInsumoNombre == b.TipoInsumoNombre;
}
