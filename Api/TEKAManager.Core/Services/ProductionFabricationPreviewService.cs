using System.Text.Json;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record FabricationTemplateSummary(
    int PlantillaFabricacionId, int ProductoId, int NombreProductoId, string ProductoNombre,
    int? ProductoColorId, string Version, string Estado, int? ListaMaterialesId,
    bool ProductoActivo, bool? BomActiva, int Piezas);

public sealed record FabricationPreviewLine(int PlantillaFabricacionId, int Cantidad);
public sealed record FabricationMaterialGrain(int InsumoId, string OrientacionVeta);
public sealed record FabricationPreviewRequest(
    IReadOnlyList<FabricationPreviewLine> Lineas,
    IReadOnlyList<FabricationMaterialGrain> VetaPlacaPorInsumo,
    decimal MargenMm, decimal AnchoSierraMm = 3m);
public sealed record FabricationPieceVersionInput(string Nombre, int InsumoId,
    int CantidadPorUnidad, decimal LargoMm, decimal AnchoMm, decimal EspesorMm,
    string OrientacionVeta, string CantosTerminados, string? Observaciones);
public sealed record FabricationVersionRequest(IReadOnlyList<FabricationPieceVersionInput> Piezas);
public sealed record FabricationMaterialRequirement(
    int InsumoId, int ColorId, int PlacasNuevas, decimal MetrosCuadrados,
    decimal? StockDisponibleM2, decimal? FaltanteM2);
public sealed record FabricationBomRequirement(int InsumoId, string Unidad,
    decimal CantidadRequerida, decimal StockDisponible, decimal Faltante);
public sealed record FabricationCostLine(int ProductoId, int Cantidad,
    string Estado, decimal? CostoMaterialesUnitario, decimal? CostoMaterialesLote,
    IReadOnlyList<string> Advertencias);
public sealed record FabricationPiecePreview(int PiezaId, int ProductoId, int InsumoId,
    int? ColorId, string Nombre, int CantidadPorUnidad, decimal LargoMm,
    decimal AnchoMm, decimal EspesorMm, string OrientacionVeta,
    string CantosTerminados, string? Observaciones, bool Persistida);
public sealed record FabricationPreview(
    IReadOnlyList<FabricationTemplateSummary> Plantillas,
    IReadOnlyList<FabricationPiecePreview> Piezas,
    ProductionCutPlan? Corte,
    IReadOnlyList<FabricationMaterialRequirement> Materiales,
    IReadOnlyList<FabricationCostLine> Costos,
    IReadOnlyList<string> Pendientes,
    ProductionCutPlan? PlanPersistido = null,
    IReadOnlyList<FabricationBomRequirement>? InsumosBom = null)
{
    public bool Habilitable => Corte?.IsComplete == true && Pendientes.Count == 0 &&
        Plantillas.All(x => x.Estado == "Aprobada" && x.ProductoActivo &&
            x.ListaMaterialesId.HasValue && x.BomActiva == true && x.Piezas > 0) &&
        Materiales.All(x => x.FaltanteM2 == 0) &&
        InsumosBom is { Count: > 0 } && InsumosBom.All(x => x.Faltante == 0);
}

/// <summary>
/// Read-only preview. No BOM, production order, stock or cut movement is persisted here.
/// </summary>
public sealed class ProductionFabricationPreviewService(
    TekaDbContext db, RecorteSnapshotService cuts, ProductionCutPlanner planner,
    CostoProductoEstimadoService costs)
{
    private sealed class TemplateRow
    {
        public int PlantillaFabricacionId { get; set; }
        public int ProductoId { get; set; }
        public int NombreProductoId { get; set; }
        public string ProductoNombre { get; set; } = "";
        public int? ProductoColorId { get; set; }
        public string Version { get; set; } = "";
        public string Estado { get; set; } = "";
        public int? ListaMaterialesId { get; set; }
        public bool ProductoActivo { get; set; }
        public bool? BomActiva { get; set; }
        public int Piezas { get; set; }
    }
    private sealed class PieceRow
    {
        public int PlantillaFabricacionId { get; set; }
        public int PlantillaFabricacionPiezaId { get; set; }
        public string NombrePieza { get; set; } = "";
        public string? CantosTerminados { get; set; }
        public string? Observaciones { get; set; }
        public bool Persistida { get; set; } = true;
        public int ProductoId { get; set; }
        public int InsumoId { get; set; }
        public int? ColorId { get; set; }
        public bool InsumoActivo { get; set; }
        public int CantidadPorUnidad { get; set; }
        public decimal LargoMm { get; set; }
        public decimal AnchoMm { get; set; }
        public decimal EspesorMm { get; set; }
        public string OrientacionVeta { get; set; } = "";
    }
    private sealed class StockRow
    {
        public int InsumoId { get; set; }
        public string Unidad { get; set; } = "";
        public decimal Disponible { get; set; }
    }
    private sealed class BomRow
    {
        public int ListaMaterialesId { get; set; }
        public int InsumoId { get; set; }
        public decimal Cantidad { get; set; }
        public string Unidad { get; set; } = "";
        public decimal StockDisponible { get; set; }
    }
    private sealed class PlateRow
    {
        public int InsumoId { get; set; }
        public int ColorId { get; set; }
    }
    private sealed class StoredPlanRow
    {
        public int PlantillaFabricacionPlanCorteId { get; set; }
        public int InsumoId { get; set; }
        public int ColorId { get; set; }
        public decimal LargoPlacaMm { get; set; }
        public decimal AnchoPlacaMm { get; set; }
        public decimal EspesorPlacaMm { get; set; }
        public decimal AnchoSierraMm { get; set; }
        public int CantidadPlacasPorLote { get; set; }
    }
    private sealed class StoredPositionRow
    {
        public int PlantillaFabricacionPlanCorteId { get; set; }
        public int PlantillaFabricacionPiezaId { get; set; }
        public int ProductoId { get; set; }
        public int NumeroPlaca { get; set; }
        public decimal PosicionXmm { get; set; }
        public decimal PosicionYmm { get; set; }
        public decimal LargoMm { get; set; }
        public decimal AnchoMm { get; set; }
        public bool Rotada { get; set; }
    }
    private sealed class StoredRemainderRow
    {
        public int PlantillaFabricacionPlanCorteId { get; set; }
        public int NumeroPlaca { get; set; }
        public decimal PosicionXmm { get; set; }
        public decimal PosicionYmm { get; set; }
        public decimal LargoMm { get; set; }
        public decimal AnchoMm { get; set; }
    }

    // Validación informativa: nunca modifica estado, BOM ni inventario.
    public sealed record FabricationApprovalCheck(
        int PlantillaFabricacionId, string Estado, bool PuedeAprobar,
        IReadOnlyList<string> Bloqueantes, IReadOnlyList<string> Advertencias);

    public async Task<FabricationApprovalCheck> CheckApprovalAsync(int templateId, CancellationToken ct = default)
    {
        if (templateId <= 0) throw new InvalidOperationException("Identificador de plantilla inválido.");
        var templates = await GetPlantillasAsync(ct);
        var template = templates.FirstOrDefault(x => x.PlantillaFabricacionId == templateId)
            ?? throw new InvalidOperationException("Plantilla inexistente.");
        var blocks = new List<string>();
        var warnings = new List<string>();
        if (template.Estado != "Borrador") blocks.Add("La plantilla no está en Borrador.");
        if (!template.ProductoActivo) blocks.Add("El producto está inactivo.");
        if (template.Piezas <= 0) blocks.Add("La plantilla no tiene piezas persistidas.");
        if (!template.ListaMaterialesId.HasValue) blocks.Add("No hay BOM vinculada.");
        if (template.Version.StartsWith("EST-", StringComparison.OrdinalIgnoreCase))
            blocks.Add("La plantilla EST es preliminar: falta validar medidas, herrajes y construcción con el taller.");

        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var cmd = new SqlCommand("""
            SELECT
              (SELECT COUNT(*) FROM dbo.PlantillaFabricacionPlanCorte WHERE PlantillaFabricacionId=@id),
              (SELECT COUNT(*) FROM dbo.DetalleListaMateriales WHERE ListaMaterialesId=@bom),
              (SELECT COUNT(*) FROM dbo.PlantillaFabricacionPieza p
                 LEFT JOIN dbo.Insumo i ON i.InsumoId=p.InsumoId
                 WHERE p.PlantillaFabricacionId=@id AND
                   (i.InsumoId IS NULL OR i.Activo=0 OR p.CantidadPorUnidad<=0 OR
                    p.LargoMm<=0 OR p.AnchoMm<=0 OR p.EspesorMm<>18)),
              (SELECT COUNT(*) FROM dbo.DetalleListaMateriales d
                 LEFT JOIN dbo.Insumo i ON i.InsumoId=d.InsumoId
                 WHERE d.ListaMaterialesId=@bom AND
                   (i.InsumoId IS NULL OR i.Activo=0 OR d.Cantidad<=0))
            """, connection);
        cmd.Parameters.Add("@id", SqlDbType.Int).Value = templateId;
        cmd.Parameters.Add("@bom", SqlDbType.Int).Value = (object?)template.ListaMaterialesId ?? DBNull.Value;
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (await reader.ReadAsync(ct))
        {
            if (reader.GetInt32(0) == 0) blocks.Add("No hay planes de corte persistidos.");
            if (reader.GetInt32(1) == 0) blocks.Add("La BOM no tiene materiales.");
            if (reader.GetInt32(2) > 0) blocks.Add("Hay piezas inválidas o insumos de piezas inactivos.");
            if (reader.GetInt32(3) > 0) blocks.Add("Hay materiales inválidos o inactivos en la BOM.");
        }
        if (template.BomActiva != true)
            warnings.Add("La BOM está inactiva. Aprobar una plantilla no activa automáticamente la lista de materiales.");
        warnings.Add("La disponibilidad de stock se verifica al iniciar la OP, no al aprobar.");
        return new FabricationApprovalCheck(templateId, template.Estado, blocks.Count == 0,
            blocks, warnings);
    }

    // Aprobación explícita y transaccional. Nunca activa la BOM ni modifica stock.
    public async Task ApproveTemplateAsync(int templateId, int userId, CancellationToken ct = default)
    {
        if (userId <= 0) throw new InvalidOperationException("No se identificó al usuario aprobador.");
        var validation = await CheckApprovalAsync(templateId, ct);
        if (!validation.PuedeAprobar)
            throw new InvalidOperationException("No se puede aprobar: " + string.Join("; ", validation.Bloqueantes));

        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            // La versión y su contenido no pueden cambiar entre validación y aprobación.
            await using var lockCommand = new SqlCommand("""
                SELECT Estado,Version FROM dbo.PlantillaFabricacion WITH (UPDLOCK,HOLDLOCK)
                WHERE PlantillaFabricacionId=@id
                """, connection, transaction);
            lockCommand.Parameters.Add("@id", SqlDbType.Int).Value = templateId;
            await using (var reader = await lockCommand.ExecuteReaderAsync(ct))
            {
                if (!await reader.ReadAsync(ct) || reader.GetString(0) != "Borrador" ||
                    reader.GetString(1).StartsWith("EST-", StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("La plantilla no puede aprobarse en su estado o versión actual.");
            }
            await using var update = new SqlCommand("""
                UPDATE dbo.PlantillaFabricacion
                   SET Estado='Aprobada', FechaAprobacion=SYSUTCDATETIME()
                 WHERE PlantillaFabricacionId=@id AND Estado='Borrador'
                   AND Version NOT LIKE 'EST-%'
                """, connection, transaction);
            update.Parameters.Add("@id", SqlDbType.Int).Value = templateId;
            if (await update.ExecuteNonQueryAsync(ct) != 1)
                throw new InvalidOperationException("La plantilla fue modificada. Volvé a validar.");
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public sealed record BomActivationCheck(int PlantillaFabricacionId, int ListaMaterialesId,
        int? BomActivaAnteriorId, bool PuedeActivar, IReadOnlyList<string> Bloqueantes);

    public async Task<BomActivationCheck> CheckBomActivationAsync(int templateId, CancellationToken ct = default)
    {
        var templates = await GetPlantillasAsync(ct);
        var template = templates.FirstOrDefault(t => t.PlantillaFabricacionId == templateId)
            ?? throw new InvalidOperationException("Plantilla inexistente.");
        var blocks = new List<string>();
        if (template.Estado != "Aprobada") blocks.Add("La plantilla debe estar aprobada.");
        if (!template.ProductoActivo) blocks.Add("El producto está inactivo.");
        if (!template.ListaMaterialesId.HasValue) blocks.Add("La plantilla no tiene lista de materiales vinculada.");
        if (template.BomActiva == true) blocks.Add("La lista de materiales ya está activa.");
        int? previous = null;
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using (var cmd = new SqlCommand("SELECT TOP (1) ListaMaterialesId FROM dbo.ListaMateriales WHERE ProductoId=@producto AND Activa=1 ORDER BY ListaMaterialesId DESC", connection))
        {
            cmd.Parameters.Add("@producto", SqlDbType.Int).Value = template.ProductoId;
            var found = await cmd.ExecuteScalarAsync(ct);
            if (found is not null && found != DBNull.Value) previous = Convert.ToInt32(found);
        }
        if (template.ListaMaterialesId.HasValue)
        {
            await using var cmd = new SqlCommand("SELECT COUNT(*) FROM dbo.DetalleListaMateriales WHERE ListaMaterialesId=@bom", connection);
            cmd.Parameters.Add("@bom", SqlDbType.Int).Value = template.ListaMaterialesId.Value;
            if (Convert.ToInt32(await cmd.ExecuteScalarAsync(ct)) == 0)
                blocks.Add("La lista de materiales no tiene insumos.");
        }
        return new BomActivationCheck(templateId, template.ListaMaterialesId ?? 0, previous, blocks.Count == 0, blocks);
    }

    public async Task<IReadOnlyList<FabricationTemplateSummary>> GetPlantillasAsync(
        CancellationToken ct = default)
    {
        var rows = await db.Database.SqlQueryRaw<TemplateRow>("""
            SELECT t.PlantillaFabricacionId,t.ProductoId,p.NombreProductoId,p.Nombre ProductoNombre,
             p.ColorId ProductoColorId,t.Version,t.Estado,t.ListaMaterialesId,
             p.Activo ProductoActivo,l.Activa BomActiva,
             (SELECT COUNT(*) FROM dbo.PlantillaFabricacionPieza x
              WHERE x.PlantillaFabricacionId=t.PlantillaFabricacionId) Piezas
            FROM dbo.PlantillaFabricacion t
            JOIN dbo.Producto p ON p.ProductoId=t.ProductoId
            LEFT JOIN dbo.ListaMateriales l ON l.ListaMaterialesId=t.ListaMaterialesId
            ORDER BY t.ProductoId,t.PlantillaFabricacionId
            """).ToListAsync(ct);
        return rows.Select(Map).ToArray();
    }

    public async Task<FabricationPreview> PreviewAsync(
        FabricationPreviewRequest request, CancellationToken ct = default)
    {
        if (request.Lineas is null || request.Lineas.Count == 0 ||
            request.Lineas.Any(x => x.PlantillaFabricacionId <= 0 || x.Cantidad <= 0) ||
            request.Lineas.Select(x => x.PlantillaFabricacionId).Distinct().Count() != request.Lineas.Count ||
            request.MargenMm < 0 || request.AnchoSierraMm < 0 ||
            decimal.Round(request.MargenMm, 2) != request.MargenMm ||
            decimal.Round(request.AnchoSierraMm, 2) != request.AnchoSierraMm)
            throw new InvalidOperationException("Plantillas, cantidades, margen o sierra invalidos.");
        var grainMap = (request.VetaPlacaPorInsumo ?? [])
            .GroupBy(x => x.InsumoId).ToDictionary(x => x.Key, x => x.ToArray());
        if (grainMap.Any(x => x.Key <= 0 || x.Value.Length != 1 ||
            x.Value[0].OrientacionVeta is not ("Largo" or "Ancho" or "Indiferente")))
            throw new InvalidOperationException("Orientacion de placas ambigua o invalida.");

        var all = await GetPlantillasAsync(ct);
        var ids = request.Lineas.Select(x => x.PlantillaFabricacionId).ToHashSet();
        var selected = all.Where(x => ids.Contains(x.PlantillaFabricacionId)).ToArray();
        if (selected.Length != request.Lineas.Count ||
            selected.Select(x => x.ProductoId).Distinct().Count() != selected.Length)
            throw new InvalidOperationException("Plantilla inexistente o producto repetido.");

        var pending = new List<string>();
        foreach (var template in selected)
        {
            if (template.Estado != "Aprobada")
                pending.Add($"Producto {template.ProductoId}: plantilla {template.Version} no aprobada.");
            if (!template.ProductoActivo)
                pending.Add($"Producto {template.ProductoId}: producto inactivo.");
            if (template.ListaMaterialesId is null || template.BomActiva != true)
                pending.Add($"Producto {template.ProductoId}: BOM vinculada y activa pendiente.");
            if (template.Piezas == 0)
                pending.Add($"Producto {template.ProductoId}: despiece pendiente.");
            if (template.Version == "EST-01")
                pending.AddRange(ProductionEstimatedPatterns.Get(template.NombreProductoId)
                    .Assumptions.Select(x => $"Producto {template.ProductoId}: estimación pendiente: {x}"));
        }

        var json = JsonSerializer.Serialize(ids);
        var pieces = await db.Database.SqlQueryRaw<PieceRow>("""
            SELECT x.PlantillaFabricacionId,x.PlantillaFabricacionPiezaId,
             x.NombrePieza,x.CantosTerminados,x.Observaciones,CAST(1 AS bit) Persistida,
             t.ProductoId,x.InsumoId,i.ColorId,i.Activo InsumoActivo,
             x.CantidadPorUnidad,x.LargoMm,x.AnchoMm,x.EspesorMm,x.OrientacionVeta
            FROM dbo.PlantillaFabricacionPieza x
            JOIN dbo.PlantillaFabricacion t ON t.PlantillaFabricacionId=x.PlantillaFabricacionId
            JOIN dbo.Insumo i ON i.InsumoId=x.InsumoId
            WHERE x.PlantillaFabricacionId IN
             (SELECT CONVERT(int,[value]) FROM OPENJSON(@ids))
            ORDER BY x.PlantillaFabricacionId,x.PlantillaFabricacionPiezaId
            """, new SqlParameter("@ids", json)).ToListAsync(ct);
        if (selected.Any(x => x.Piezas == 0))
        {
            var plates = await db.Database.SqlQueryRaw<PlateRow>("""
                SELECT i.InsumoId,i.ColorId FROM dbo.Insumo i
                JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId AND ti.Nombre='Melamina'
                JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId AND u.Nombre='Metro cuadrado'
                WHERE i.Activo=1 AND i.NombreInsumoId=2
                 AND i.ColorId IN (1,2,5)
                """).ToListAsync(ct);
            var byColor = plates.GroupBy(x => x.ColorId).ToDictionary(x => x.Key, x => x.ToArray());
            foreach (var template in selected.Where(x => x.Piezas == 0 && x.Version == "EST-01"))
            {
                if (template.ProductoColorId is not (1 or 2 or 5) ||
                    !byColor.TryGetValue(template.ProductoColorId.Value, out var main) || main.Length != 1 ||
                    template.NombreProductoId == 2 && (!byColor.TryGetValue(5, out var wood) || wood.Length != 1))
                {
                    pending.Add($"Producto {template.ProductoId}: placa real no identificada univocamente.");
                    continue;
                }
                var pattern = ProductionEstimatedPatterns.Get(template.NombreProductoId);
                for (var ordinal = 0; ordinal < pattern.Pieces.Count; ordinal++)
                {
                    var candidate = pattern.Pieces[ordinal];
                    var plate = candidate.SecondaryMaterial ? byColor[5][0] : main[0];
                    pieces.Add(new PieceRow {
                        PlantillaFabricacionId = template.PlantillaFabricacionId,
                        PlantillaFabricacionPiezaId = checked(template.PlantillaFabricacionId * 100 + ordinal + 1),
                        NombrePieza = candidate.Name, CantosTerminados = candidate.Edges,
                        Observaciones = candidate.Assumption ?? "Medida constructiva preliminar.",
                        Persistida = false,
                        ProductoId = template.ProductoId, InsumoId = plate.InsumoId,
                        ColorId = plate.ColorId, InsumoActivo = true,
                        CantidadPorUnidad = candidate.Quantity, LargoMm = candidate.LengthMm,
                        AnchoMm = candidate.WidthMm, EspesorMm = 18,
                        OrientacionVeta = plate.ColorId == 5 ? "Largo" : "Indiferente"
                    });
                }
                pending.Add($"Producto {template.ProductoId}: plano estimado en memoria; persistencia y revisión pendientes.");
            }
        }
        if (pieces.Any(x => !x.InsumoActivo || x.ColorId is null))
            pending.Add("Hay piezas con insumo inactivo o color sin identificar.");
        foreach (var supply in pieces.GroupBy(x => x.InsumoId))
            if (!grainMap.ContainsKey(supply.Key))
            {
                var color = supply.First().ColorId;
                if (color is not (1 or 2 or 5))
                    pending.Add($"Insumo {supply.Key}: indicar orientacion verificada de la placa.");
                else
                {
                    grainMap[supply.Key] = [new FabricationMaterialGrain(supply.Key,
                        color == 5 ? "Largo" : "Indiferente")];
                    if (color == 5)
                        pending.Add($"Insumo {supply.Key}: veta longitudinal Olmo estimada; confirmar sentido real de placa.");
                }
            }
        var piecePreviews = pieces.Select((x, index) => new FabricationPiecePreview(
            index + 1, x.ProductoId, x.InsumoId, x.ColorId,
            x.NombrePieza, x.CantidadPorUnidad, x.LargoMm, x.AnchoMm,
            x.EspesorMm, x.OrientacionVeta, x.CantosTerminados ?? "",
            x.Observaciones, x.Persistida)).ToArray();
        var storedPlan = request.Lineas.Count == 1 && request.Lineas[0].Cantidad == 1
            ? await ReadStoredPlanAsync(selected[0].PlantillaFabricacionId, pieces, ct)
            : null;
        var counts = request.Lineas.ToDictionary(x => x.PlantillaFabricacionId, x => x.Cantidad);
        var bomIds = selected.Where(x => x.ListaMaterialesId.HasValue)
            .Select(x => x.ListaMaterialesId!.Value).ToArray();
        var bomRows = bomIds.Length == 0 ? [] : await db.Database.SqlQueryRaw<BomRow>("""
            SELECT d.ListaMaterialesId,d.InsumoId,d.Cantidad,u.Nombre Unidad,
             COALESCE((SELECT SUM(s.CantidadActual) FROM dbo.StockInsumo s
               JOIN dbo.Deposito dep ON dep.DepositoId=s.DepositoId
               WHERE s.InsumoId=d.InsumoId AND dep.Activo=1
                AND dep.Nombre=N'Pañol de Insumos'),0) StockDisponible
            FROM dbo.DetalleListaMateriales d
            JOIN dbo.Insumo i ON i.InsumoId=d.InsumoId
            JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId
            WHERE d.ListaMaterialesId IN (SELECT CONVERT(int,[value]) FROM OPENJSON(@ids))
            """, new SqlParameter("@ids", JsonSerializer.Serialize(bomIds))).ToArrayAsync(ct);
        var quantities = selected.Where(x => x.ListaMaterialesId.HasValue)
            .ToDictionary(x => x.ListaMaterialesId!.Value,
                x => counts[x.PlantillaFabricacionId]);
        var bomSupplies = bomRows.GroupBy(x => (x.InsumoId, x.Unidad))
            .Select(g =>
            {
                var required = g.Sum(x => x.Cantidad * quantities[x.ListaMaterialesId]);
                var available = g.First().StockDisponible;
                return new FabricationBomRequirement(g.Key.InsumoId, g.Key.Unidad,
                    required, available, Math.Max(0, required - available));
            }).OrderBy(x => x.InsumoId).ToArray();
        if (bomSupplies.Any(x => x.Faltante > 0))
            pending.Add("La BOM tiene materiales faltantes; se revalidarán al iniciar la OP.");
        if (piecePreviews.Any(x => x.ColorId == 5 && !string.IsNullOrWhiteSpace(x.CantosTerminados)))
            pending.Add("Hay cantos Olmo expuestos sin tapacanto de color identificable en el catalogo.");
        if (pieces.Count == 0 || pending.Any(x => x.Contains("orientacion verificada") ||
            x.Contains("color sin identificar")))
            return new(selected, piecePreviews, null, [], [], pending, storedPlan, bomSupplies);

        var cutPieces = pieces.Select((x, index) => new ProductionCutPiece(
            index + 1, x.ProductoId, x.InsumoId, x.ColorId!.Value,
            x.LargoMm, x.AnchoMm, x.EspesorMm, x.OrientacionVeta,
            checked(x.CantidadPorUnidad * counts[x.PlantillaFabricacionId]))).ToArray();
        var materials = pieces.GroupBy(x => (x.InsumoId, ColorId: x.ColorId!.Value, x.EspesorMm))
            .Select(g => new ProductionCutMaterial(g.Key.InsumoId, g.Key.ColorId,
                g.Key.EspesorMm, grainMap[g.Key.InsumoId][0].OrientacionVeta)).ToArray();
        var eligible = await cuts.ConsultarElegiblesAsync(ct);
        var remnants = eligible.Where(x => x.ColorId.HasValue && x.LargoMm.HasValue &&
            x.AnchoMm.HasValue && x.EspesorMm.HasValue && x.OrientacionVeta is not null)
            .Select(x => new ProductionCutRemnant(x.RecorteId, x.InsumoId,
                x.ColorId!.Value, x.LargoMm!.Value, x.AnchoMm!.Value,
                x.EspesorMm!.Value, x.OrientacionVeta!, x.CantidadRegistrada,
                x.CantidadDisponible, x.EstadoNombre)).ToArray();
        var plan = planner.Plan(cutPieces, materials, remnants,
            new ProductionCutSettings(2750, 1830, request.AnchoSierraMm, request.MargenMm));
        pending.AddRange(plan.Errors);

        var stock = await db.Database.SqlQueryRaw<StockRow>("""
            SELECT i.InsumoId,u.Nombre Unidad,
             COALESCE(SUM(CASE WHEN d.Activo=1 AND d.Nombre=N'Pañol de Insumos'
              THEN s.CantidadActual ELSE 0 END),0) Disponible
            FROM dbo.Insumo i
            JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId
            LEFT JOIN dbo.StockInsumo s ON s.InsumoId=i.InsumoId
            LEFT JOIN dbo.Deposito d ON d.DepositoId=s.DepositoId
            WHERE i.InsumoId IN (SELECT CONVERT(int,[value]) FROM OPENJSON(@ids))
            GROUP BY i.InsumoId,u.Nombre
            """, new SqlParameter("@ids",
                JsonSerializer.Serialize(materials.Select(x => x.SupplyId).Distinct()))).ToListAsync(ct);
        var bySupply = stock.ToDictionary(x => x.InsumoId);
        var required = plan.Surfaces.Where(x => x.CutId is null)
            .GroupBy(x => (x.SupplyId, x.ColorId))
            .Select(g =>
            {
                var count = g.Count();
                var m2 = decimal.Ceiling(count * 2750m * 1830m / 10_000m) / 100m;
                var source = bySupply.GetValueOrDefault(g.Key.SupplyId);
                var available = source?.Unidad == "Metro cuadrado" ? source.Disponible : (decimal?)null;
                if (available is null)
                    pending.Add($"Insumo {g.Key.SupplyId}: stock en m2 no verificable.");
                return new FabricationMaterialRequirement(g.Key.SupplyId, g.Key.ColorId,
                    count, m2, available,
                    available is null ? null : Math.Max(0, m2 - available.Value));
            }).ToArray();
        if (required.Any(x => x.FaltanteM2 > 0))
            pending.Add("Stock de placas insuficiente; se revalidara al iniciar la OP.");
        if (required.Length > 0)
            pending.Add("Las placas completas se aproximan al alza en m2; confirmar la equivalencia de stock antes de activar la BOM.");
        var costLines = new List<FabricationCostLine>();
        foreach (var template in selected)
        {
            var quantity = counts[template.PlantillaFabricacionId];
            if (!template.ProductoActivo)
            {
                costLines.Add(new(template.ProductoId, quantity, "PRODUCTO_INACTIVO", null, null,
                    ["No se estima el costo de un producto inactivo."]));
                continue;
            }
            var estimate = await costs.CalcularAsync(template.ProductoId, ct);
            costLines.Add(new(template.ProductoId, quantity, estimate.Estado,
                estimate.CostoMateriales, estimate.CostoMateriales * quantity,
                estimate.Advertencias));
            if (estimate.Estado != "COMPLETO" || estimate.ListaMaterialesId != template.ListaMaterialesId)
                pending.Add($"Producto {template.ProductoId}: costo de BOM incompleto o vinculado a otra version.");
        }
        return new(selected, piecePreviews, plan, required, costLines, pending, storedPlan, bomSupplies);
    }

    private async Task<ProductionCutPlan?> ReadStoredPlanAsync(int templateId,
        IReadOnlyList<PieceRow> pieces, CancellationToken ct)
    {
        if (pieces.Count == 0 || pieces.Any(x => !x.Persistida)) return null;
        var id = new SqlParameter("@id", templateId);
        var plans = await db.Database.SqlQueryRaw<StoredPlanRow>("""
            SELECT p.PlantillaFabricacionPlanCorteId,p.InsumoId,i.ColorId,
             p.LargoPlacaMm,p.AnchoPlacaMm,p.EspesorPlacaMm,p.AnchoSierraMm,
             p.CantidadPlacasPorLote
            FROM dbo.PlantillaFabricacionPlanCorte p
            JOIN dbo.Insumo i ON i.InsumoId=p.InsumoId
            WHERE p.PlantillaFabricacionId=@id
            ORDER BY p.PlantillaFabricacionPlanCorteId
            """, id).ToListAsync(ct);
        if (plans.Count == 0) return null;
        var positions = await db.Database.SqlQueryRaw<StoredPositionRow>("""
            SELECT c.PlantillaFabricacionPlanCorteId,c.PlantillaFabricacionPiezaId,
             t.ProductoId,c.NumeroPlaca,c.PosicionXmm,c.PosicionYmm,
             CASE WHEN c.Rotada=1 THEN x.AnchoMm ELSE x.LargoMm END LargoMm,
             CASE WHEN c.Rotada=1 THEN x.LargoMm ELSE x.AnchoMm END AnchoMm,c.Rotada
            FROM dbo.PlantillaFabricacionCortePieza c
            JOIN dbo.PlantillaFabricacionPlanCorte p ON p.PlantillaFabricacionPlanCorteId=c.PlantillaFabricacionPlanCorteId
            JOIN dbo.PlantillaFabricacion t ON t.PlantillaFabricacionId=p.PlantillaFabricacionId
            JOIN dbo.PlantillaFabricacionPieza x ON x.PlantillaFabricacionPiezaId=c.PlantillaFabricacionPiezaId
            WHERE p.PlantillaFabricacionId=@id
            """, new SqlParameter("@id", templateId)).ToListAsync(ct);
        var remainders = await db.Database.SqlQueryRaw<StoredRemainderRow>("""
            SELECT r.PlantillaFabricacionPlanCorteId,r.NumeroPlaca,
             r.PosicionXmm,r.PosicionYmm,r.LargoMm,r.AnchoMm
            FROM dbo.PlantillaFabricacionRecortePrevisto r
            JOIN dbo.PlantillaFabricacionPlanCorte p ON p.PlantillaFabricacionPlanCorteId=r.PlantillaFabricacionPlanCorteId
            WHERE p.PlantillaFabricacionId=@id
            """, new SqlParameter("@id", templateId)).ToListAsync(ct);
        var pieceIds = pieces.Select((x, index) => (x.PlantillaFabricacionPiezaId, Id: index + 1))
            .ToDictionary(x => x.PlantillaFabricacionPiezaId, x => x.Id);
        var surfaces = new List<ProductionCutSurfaceResult>();
        var placements = new List<ProductionCutPlacement>();
        var errors = new List<string>();
        foreach (var plan in plans)
        {
            for (var sheet = 1; sheet <= plan.CantidadPlacasPorLote; sheet++)
            {
                var number = surfaces.Count + 1;
                surfaces.Add(new(number, null, plan.InsumoId, plan.ColorId,
                    plan.EspesorPlacaMm, plan.LargoPlacaMm, plan.AnchoPlacaMm,
                    remainders.Where(x => x.PlantillaFabricacionPlanCorteId == plan.PlantillaFabricacionPlanCorteId &&
                        x.NumeroPlaca == sheet)
                        .Select(x => new ProductionCutRectangle(x.PosicionXmm, x.PosicionYmm,
                            x.LargoMm, x.AnchoMm)).ToArray()));
                foreach (var position in positions.Where(x =>
                    x.PlantillaFabricacionPlanCorteId == plan.PlantillaFabricacionPlanCorteId &&
                    x.NumeroPlaca == sheet))
                {
                    if (!pieceIds.TryGetValue(position.PlantillaFabricacionPiezaId, out var pieceId))
                    {
                        errors.Add("El plano persistido referencia una pieza ajena a la plantilla.");
                        continue;
                    }
                    placements.Add(new(pieceId, position.ProductoId, number, null,
                        position.PosicionXmm, position.PosicionYmm, position.LargoMm,
                        position.AnchoMm, position.Rotada));
                }
            }
        }
        if (positions.Count != placements.Count ||
            placements.GroupBy(x => x.PieceId).Any(g =>
                g.Count() != pieces[g.Key - 1].CantidadPorUnidad))
            errors.Add("El plano persistido no cubre exactamente el despiece de una unidad.");
        foreach (var surface in surfaces)
        {
            var placed = placements.Where(x => x.SurfaceNumber == surface.Number).ToArray();
            if (placed.Any(x => x.Xmm < 0 || x.Ymm < 0 || x.LengthMm <= 0 || x.WidthMm <= 0 ||
                x.Xmm + x.LengthMm > surface.LengthMm || x.Ymm + x.WidthMm > surface.WidthMm))
                errors.Add("El plano persistido tiene piezas fuera de la placa.");
            for (var a = 0; a < placed.Length; a++)
                for (var b = a + 1; b < placed.Length; b++)
                    if (placed[a].Xmm < placed[b].Xmm + placed[b].LengthMm &&
                        placed[b].Xmm < placed[a].Xmm + placed[a].LengthMm &&
                        placed[a].Ymm < placed[b].Ymm + placed[b].WidthMm &&
                        placed[b].Ymm < placed[a].Ymm + placed[a].WidthMm)
                        errors.Add("El plano persistido tiene piezas superpuestas.");
        }
        return new(placements, surfaces, errors);
    }

    public async Task<int> CreateDraftVersionAsync(int templateId,
        FabricationVersionRequest request, int userId, CancellationToken ct = default)
    {
        if (templateId <= 0 || userId <= 0 || request.Piezas is null ||
            request.Piezas.Count is < 1 or > 100 ||
            request.Piezas.Select(x => x.Nombre?.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).Count() != request.Piezas.Count ||
            request.Piezas.Any(x => string.IsNullOrWhiteSpace(x.Nombre) || x.Nombre.Length > 120 ||
                x.InsumoId <= 0 || x.CantidadPorUnidad <= 0 || x.LargoMm <= 0 ||
                x.AnchoMm <= 0 || x.EspesorMm != 18 || x.LargoMm > 2750 || x.AnchoMm > 2750 ||
                decimal.Round(x.LargoMm, 2) != x.LargoMm ||
                decimal.Round(x.AnchoMm, 2) != x.AnchoMm ||
                x.OrientacionVeta is not ("Indiferente" or "Largo" or "Ancho") ||
                x.CantosTerminados is null || x.CantosTerminados.Length > 120 ||
                x.Observaciones?.Length > 250 || !ValidEdges(x.CantosTerminados)))
            throw new InvalidOperationException("Piezas, medidas, veta o cantos invalidos.");

        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var tx = (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            int productId;
            int familyId;
            int? productColor;
            decimal width, height, depth;
            await using (var source = new SqlCommand("""
                SELECT t.ProductoId,p.NombreProductoId,p.ColorId,t.AnchoProductoMm,t.AltoProductoMm,t.ProfundidadProductoMm
                FROM dbo.PlantillaFabricacion t WITH(UPDLOCK,HOLDLOCK)
                JOIN dbo.Producto p ON p.ProductoId=t.ProductoId
                WHERE t.PlantillaFabricacionId=@id
                """, connection, tx))
            {
                source.Parameters.Add("@id", SqlDbType.Int).Value = templateId;
                await using var reader = await source.ExecuteReaderAsync(ct);
                if (!await reader.ReadAsync(ct)) throw new InvalidOperationException("Plantilla de origen inexistente.");
                productId = reader.GetInt32(0);
                if (reader.IsDBNull(1)) throw new InvalidOperationException("La familia del producto no esta identificada.");
                familyId = reader.GetInt32(1);
                productColor = reader.IsDBNull(2) ? null : reader.GetInt32(2);
                if (reader.IsDBNull(3) || reader.IsDBNull(4) || reader.IsDBNull(5))
                    throw new InvalidOperationException("La plantilla no tiene dimensiones exteriores completas.");
                width = reader.GetDecimal(3); height = reader.GetDecimal(4); depth = reader.GetDecimal(5);
            }
            await using (var check = new SqlCommand("""
                SELECT i.InsumoId,i.ColorId,i.Activo,ti.Nombre,u.Nombre
                FROM dbo.Insumo i JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId
                JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId
                WHERE i.InsumoId IN (SELECT CONVERT(int,[value]) FROM OPENJSON(@ids))
                """, connection, tx))
            {
                check.Parameters.Add("@ids", SqlDbType.NVarChar, -1).Value =
                    JsonSerializer.Serialize(request.Piezas.Select(x => x.InsumoId).Distinct());
                var valid = new HashSet<int>();
                await using var reader = await check.ExecuteReaderAsync(ct);
                while (await reader.ReadAsync(ct))
                {
                    var color = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1);
                    if (reader.GetBoolean(2) && reader.GetString(3) == "Melamina" &&
                        reader.GetString(4) == "Metro cuadrado" &&
                        (color == productColor || familyId == 2 && color == 5))
                        valid.Add(reader.GetInt32(0));
                }
                if (request.Piezas.Any(x => !valid.Contains(x.InsumoId)))
                    throw new InvalidOperationException("Una pieza usa insumo inexistente, inactivo o de color incompatible.");
            }
            var lockResult = new SqlParameter("@result", SqlDbType.Int) { Direction = ParameterDirection.Output };
            await using (var locker = new SqlCommand("""
                EXEC @result=sys.sp_getapplock @Resource=@resource,@LockMode='Exclusive',
                 @LockOwner='Transaction',@LockTimeout=15000
                """, connection, tx))
            {
                locker.Parameters.Add(lockResult);
                locker.Parameters.Add("@resource", SqlDbType.NVarChar, 255).Value = "TEKA:PlantillaFabricacion:" + productId;
                await locker.ExecuteNonQueryAsync(ct);
                if ((int)lockResult.Value < 0)
                    throw new InvalidOperationException("No se pudo bloquear el versionado de la plantilla.");
            }
            var next = 1;
            await using (var versions = new SqlCommand("""
                SELECT COALESCE(MAX(TRY_CONVERT(int,SUBSTRING(Version,5,16))),0)+1
                FROM dbo.PlantillaFabricacion WITH(UPDLOCK,HOLDLOCK)
                WHERE ProductoId=@product AND Version LIKE 'EST-%'
                """, connection, tx))
            {
                versions.Parameters.Add("@product", SqlDbType.Int).Value = productId;
                next = Convert.ToInt32(await versions.ExecuteScalarAsync(ct));
            }
            var version = $"EST-{next:00}";
            if (version.Length > 20) throw new InvalidOperationException("Se agoto el rango de versiones.");
            int created;
            await using (var insert = new SqlCommand("""
                INSERT dbo.PlantillaFabricacion(ProductoId,ListaMaterialesId,Nombre,Version,
                 Estado,UnidadesPorLote,AnchoProductoMm,AltoProductoMm,ProfundidadProductoMm,
                 Observaciones,FechaCreacion,FechaAprobacion)
                OUTPUT INSERTED.PlantillaFabricacionId
                VALUES(@product,NULL,@name,@version,'Borrador',1,@width,@height,@depth,
                 @note,SYSDATETIME(),NULL)
                """, connection, tx))
            {
                insert.Parameters.Add("@product", SqlDbType.Int).Value = productId;
                insert.Parameters.Add("@name", SqlDbType.VarChar, 120).Value = "Revision estimada " + version;
                insert.Parameters.Add("@version", SqlDbType.VarChar, 20).Value = version;
                insert.Parameters.Add("@width", SqlDbType.Decimal).Value = width;
                insert.Parameters.Add("@height", SqlDbType.Decimal).Value = height;
                insert.Parameters.Add("@depth", SqlDbType.Decimal).Value = depth;
                insert.Parameters.Add("@note", SqlDbType.VarChar, 500).Value =
                    $"Derivada de plantilla {templateId} por usuario {userId}. Despiece estimado; BOM, corte y validacion pendientes.";
                created = Convert.ToInt32(await insert.ExecuteScalarAsync(ct));
            }
            foreach (var part in request.Piezas)
            {
                await using var insert = new SqlCommand("""
                    INSERT dbo.PlantillaFabricacionPieza(PlantillaFabricacionId,InsumoId,
                     NombrePieza,CantidadPorUnidad,LargoMm,AnchoMm,EspesorMm,CantosTerminados,
                     OrientacionVeta,Observaciones)
                    VALUES(@template,@supply,@name,@quantity,@length,@width,18,@edges,@grain,@note)
                    """, connection, tx);
                insert.Parameters.Add("@template", SqlDbType.Int).Value = created;
                insert.Parameters.Add("@supply", SqlDbType.Int).Value = part.InsumoId;
                insert.Parameters.Add("@name", SqlDbType.VarChar, 120).Value = part.Nombre.Trim();
                insert.Parameters.Add("@quantity", SqlDbType.Int).Value = part.CantidadPorUnidad;
                insert.Parameters.Add("@length", SqlDbType.Decimal).Value = part.LargoMm;
                insert.Parameters.Add("@width", SqlDbType.Decimal).Value = part.AnchoMm;
                insert.Parameters.Add("@edges", SqlDbType.VarChar, 120).Value = part.CantosTerminados;
                insert.Parameters.Add("@grain", SqlDbType.VarChar, 20).Value = part.OrientacionVeta;
                insert.Parameters.Add("@note", SqlDbType.VarChar, 250).Value =
                    (object?)part.Observaciones ?? DBNull.Value;
                await insert.ExecuteNonQueryAsync(ct);
            }
            await tx.CommitAsync(ct);
            return created;
        }
        catch
        {
            await tx.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    private static bool ValidEdges(string value) => value.Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(x => x.Trim()).GroupBy(x => x).All(g => g.Count() == 1 &&
            g.Key is "L1" or "L2" or "A1" or "A2");

    private static FabricationTemplateSummary Map(TemplateRow x) =>
        new(x.PlantillaFabricacionId, x.ProductoId, x.NombreProductoId, x.ProductoNombre,
            x.ProductoColorId, x.Version, x.Estado, x.ListaMaterialesId,
            x.ProductoActivo, x.BomActiva, x.Piezas);
}
