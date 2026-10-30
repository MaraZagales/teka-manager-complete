namespace TEKAManager.Core.Services;

public sealed record ProductionCutPiece(
    int PieceId, int ProductId, int SupplyId, int ColorId,
    decimal LengthMm, decimal WidthMm, decimal ThicknessMm,
    string Grain, int Quantity);

public sealed record ProductionCutMaterial(
    int SupplyId, int ColorId, decimal ThicknessMm, string Grain);

public sealed record ProductionCutRemnant(
    int CutId, int SupplyId, int ColorId, decimal LengthMm, decimal WidthMm,
    decimal ThicknessMm, string Grain, decimal RegisteredQuantity,
    decimal AvailableQuantity, string State);

public sealed record ProductionCutSettings(
    decimal SheetLengthMm, decimal SheetWidthMm, decimal KerfMm, decimal MarginMm);

public sealed record ProductionCutRectangle(decimal Xmm, decimal Ymm, decimal LengthMm, decimal WidthMm);

public sealed record ProductionCutPlacement(
    int PieceId, int ProductId, int SurfaceNumber, int? CutId,
    decimal Xmm, decimal Ymm, decimal LengthMm, decimal WidthMm, bool Rotated);

public sealed record ProductionCutSurfaceResult(
    int Number, int? CutId, int SupplyId, int ColorId, decimal ThicknessMm,
    decimal LengthMm, decimal WidthMm, IReadOnlyList<ProductionCutRectangle> Remainders);

public sealed record ProductionCutPlan(
    IReadOnlyList<ProductionCutPlacement> Placements,
    IReadOnlyList<ProductionCutSurfaceResult> Surfaces,
    IReadOnlyList<string> Errors)
{
    public bool IsComplete => Errors.Count == 0;
    public int NewSheetCount => Surfaces.Count(x => x.CutId is null);
    public IReadOnlyList<int> PlannedCutIds => Surfaces.Where(x => x.CutId.HasValue)
        .Select(x => x.CutId!.Value).ToArray();
}

/// <summary>
/// Deterministic guillotine packing heuristic. A placement is spatially valid;
/// global minimum sheets, cut sequence, assembly and certified waste are not inferred.
/// </summary>
public sealed class ProductionCutPlanner
{
    private sealed class Surface
    {
        public required int Number { get; init; }
        public required int? CutId { get; init; }
        public required int SupplyId { get; init; }
        public required int ColorId { get; init; }
        public required decimal ThicknessMm { get; init; }
        public required decimal LengthMm { get; init; }
        public required decimal WidthMm { get; init; }
        public required string Grain { get; init; }
        public List<ProductionCutRectangle> Free { get; } = [];
        public bool Used { get; set; }
    }

    private sealed record Choice(Surface Surface, int FreeIndex, decimal Length, decimal Width,
        bool Rotated, decimal Waste, decimal Reusable);

    public ProductionCutPlan Plan(
        IReadOnlyCollection<ProductionCutPiece> pieces,
        IReadOnlyCollection<ProductionCutMaterial> materials,
        IReadOnlyCollection<ProductionCutRemnant> remnants,
        ProductionCutSettings settings)
    {
        if (settings.SheetLengthMm <= 0 || settings.SheetWidthMm <= 0 ||
            settings.KerfMm < 0 || settings.MarginMm < 0 ||
            settings.MarginMm * 2 >= settings.SheetLengthMm ||
            settings.MarginMm * 2 >= settings.SheetWidthMm ||
            !Mm(settings.SheetLengthMm) || !Mm(settings.SheetWidthMm) ||
            !Mm(settings.KerfMm) || !Mm(settings.MarginMm))
            throw new ArgumentException("Medidas de placa, sierra o margen invalidos.", nameof(settings));
        if (pieces.Count == 0 || pieces.Any(p => p.PieceId <= 0 || p.ProductId <= 0 ||
            p.SupplyId <= 0 || p.ColorId <= 0 || p.LengthMm <= 0 || p.WidthMm <= 0 ||
            p.ThicknessMm <= 0 || p.Quantity <= 0 || !Mm(p.LengthMm) ||
            !Mm(p.WidthMm) || !Mm(p.ThicknessMm) || !Grain(p.Grain)) ||
            pieces.Select(p => p.PieceId).Distinct().Count() != pieces.Count)
            throw new ArgumentException("Despiece invalido o con identificadores repetidos.", nameof(pieces));
        if (materials.Any(m => m.SupplyId <= 0 || m.ColorId <= 0 ||
            m.ThicknessMm <= 0 || !Mm(m.ThicknessMm) || !Grain(m.Grain)) ||
            materials.GroupBy(m => (m.SupplyId, m.ColorId, m.ThicknessMm)).Any(g => g.Count() != 1))
            throw new ArgumentException("Catalogo de placas invalido o ambiguo.", nameof(materials));

        var surfaces = new List<Surface>();
        var number = 0;
        foreach (var remnant in remnants.OrderBy(r => r.LengthMm * r.WidthMm).ThenBy(r => r.CutId))
        {
            // A grouped balance does not identify one physical piece and cannot be assigned.
            if (remnant.CutId <= 0 || remnant.RegisteredQuantity != 1 ||
                remnant.AvailableQuantity != 1 || remnant.State != "Disponible" ||
                remnant.SupplyId <= 0 || remnant.ColorId <= 0 ||
                remnant.LengthMm <= 0 || remnant.WidthMm <= 0 ||
                remnant.ThicknessMm <= 0 || !Grain(remnant.Grain) ||
                !Mm(remnant.LengthMm) || !Mm(remnant.WidthMm) || !Mm(remnant.ThicknessMm))
                continue;
            var surface = Create(++number, remnant.CutId, remnant.SupplyId,
                remnant.ColorId, remnant.ThicknessMm, remnant.Grain,
                remnant.LengthMm, remnant.WidthMm, settings.MarginMm);
            if (surface.Free.Count > 0) surfaces.Add(surface);
        }
        if (surfaces.Where(s => s.CutId.HasValue).Select(s => s.CutId).Distinct().Count() != surfaces.Count)
            throw new ArgumentException("Recortes fisicos repetidos.", nameof(remnants));

        var placements = new List<ProductionCutPlacement>();
        var errors = new List<string>();
        var materialMap = materials.ToDictionary(m => (m.SupplyId, m.ColorId, m.ThicknessMm));
        var units = pieces.SelectMany(p => Enumerable.Range(0, p.Quantity).Select(n => (Piece: p, Unit: n)))
            .OrderByDescending(x => Math.Max(x.Piece.LengthMm, x.Piece.WidthMm))
            .ThenByDescending(x => x.Piece.LengthMm * x.Piece.WidthMm)
            .ThenBy(x => x.Piece.PieceId).ThenBy(x => x.Unit);
        foreach (var (piece, _) in units)
        {
            if (!materialMap.TryGetValue((piece.SupplyId, piece.ColorId, piece.ThicknessMm), out var material))
            {
                errors.Add($"Pieza {piece.PieceId}: placa compatible sin identificar.");
                continue;
            }

            Choice? chosen = Best(surfaces.Where(s => s.CutId.HasValue), piece)
                ?? Best(surfaces.Where(s => s.CutId is null), piece);
            if (chosen is null)
            {
                var fresh = Create(++number, null, material.SupplyId, material.ColorId,
                    material.ThicknessMm, material.Grain, settings.SheetLengthMm,
                    settings.SheetWidthMm, settings.MarginMm);
                chosen = Best([fresh], piece);
                if (chosen is null)
                {
                    errors.Add($"Pieza {piece.PieceId}: no entra en una placa compatible.");
                    continue;
                }
                surfaces.Add(fresh);
            }

            var surfaceUsed = chosen.Surface;
            var free = surfaceUsed.Free[chosen.FreeIndex];
            surfaceUsed.Free.RemoveAt(chosen.FreeIndex);
            Split(surfaceUsed.Free, free, chosen.Length, chosen.Width, settings.KerfMm);
            surfaceUsed.Used = true;
            placements.Add(new(piece.PieceId, piece.ProductId, surfaceUsed.Number,
                surfaceUsed.CutId, free.Xmm, free.Ymm, chosen.Length,
                chosen.Width, chosen.Rotated));
        }

        return new(placements, surfaces.Where(s => s.Used).Select(s =>
            new ProductionCutSurfaceResult(s.Number, s.CutId, s.SupplyId, s.ColorId,
                s.ThicknessMm, s.LengthMm, s.WidthMm, s.Free.ToArray())).ToArray(),
            errors);
    }

    private static Surface Create(int number, int? cutId, int supplyId, int colorId,
        decimal thickness, string grain, decimal length, decimal width, decimal margin)
    {
        var surface = new Surface { Number = number, CutId = cutId, SupplyId = supplyId,
            ColorId = colorId, ThicknessMm = thickness, Grain = grain,
            LengthMm = length, WidthMm = width };
        if (length > 2 * margin && width > 2 * margin)
            surface.Free.Add(new(margin, margin, length - 2 * margin, width - 2 * margin));
        return surface;
    }

    private static Choice? Best(IEnumerable<Surface> surfaces, ProductionCutPiece piece)
    {
        Choice? best = null;
        foreach (var surface in surfaces)
        {
            if (surface.SupplyId != piece.SupplyId || surface.ColorId != piece.ColorId ||
                surface.ThicknessMm != piece.ThicknessMm) continue;
            for (var i = 0; i < surface.Free.Count; i++)
            {
                var free = surface.Free[i];
                for (var rotation = 0; rotation < 2; rotation++)
                {
                    if (rotation == 1 && piece.LengthMm == piece.WidthMm) continue;
                    if (!GrainMatches(piece.Grain, surface.Grain, rotation == 1)) continue;
                    var length = rotation == 1 ? piece.WidthMm : piece.LengthMm;
                    var width = rotation == 1 ? piece.LengthMm : piece.WidthMm;
                    if (length > free.LengthMm || width > free.WidthMm) continue;
                    var waste = free.LengthMm * free.WidthMm - length * width;
                    var reusable = Math.Max((free.LengthMm - length) * width,
                        free.LengthMm * (free.WidthMm - width));
                    var candidate = new Choice(surface, i, length, width, rotation == 1, waste, reusable);
                    if (best is null || candidate.Waste < best.Waste ||
                        candidate.Waste == best.Waste && candidate.Reusable > best.Reusable ||
                        candidate.Waste == best.Waste && candidate.Reusable == best.Reusable &&
                        candidate.Surface.Number < best.Surface.Number)
                        best = candidate;
                }
            }
        }
        return best;
    }

    private static void Split(List<ProductionCutRectangle> free, ProductionCutRectangle source,
        decimal length, decimal width, decimal kerf)
    {
        var right = source.LengthMm - length - kerf;
        var below = source.WidthMm - width - kerf;
        if (right > 0)
            free.Add(new(source.Xmm + length + kerf, source.Ymm, right, width));
        if (below > 0)
            free.Add(new(source.Xmm, source.Ymm + width + kerf, source.LengthMm, below));
    }

    private static bool GrainMatches(string piece, string surface, bool rotated)
    {
        if (piece == "Indiferente") return true;
        if (surface == "Indiferente") return false;
        var oriented = rotated ? piece == "Largo" ? "Ancho" : "Largo" : piece;
        return oriented == surface;
    }

    private static bool Grain(string value) => value is "Largo" or "Ancho" or "Indiferente";
    private static bool Mm(decimal value) => decimal.Round(value, 2) == value;
}
