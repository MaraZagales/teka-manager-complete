using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public partial class ProduccionService
{
    // Reutiliza el creador multiproducto; la OP queda Pendiente y el vínculo GIR
    // se confirma en la misma transacción. No reserva ni consume recortes.
    public async Task<int> CrearOrdenDesdeDisenoAsync(long recorteDisenoId, int usuarioId, CancellationToken ct)
    {
        if (recorteDisenoId <= 0 || usuarioId <= 0)
            throw new ArgumentOutOfRangeException(nameof(recorteDisenoId));
        var installed = await _db.Database.SqlQueryRaw<int>("""
            SELECT CASE WHEN OBJECT_ID('dbo.OrdenProduccionGIR','U') IS NOT NULL
             AND COL_LENGTH('dbo.RecorteDisenoProducto','ListaMaterialesId') IS NOT NULL
             AND OBJECT_ID('dbo.sp_GIR_VincularReceta','P') IS NOT NULL
             THEN 1 ELSE 0 END AS [Value]
            """).SingleAsync(ct);
        if (installed != 1)
            throw new InvalidOperationException("El circuito GIR/OP requiere el incremental aprobado.");
        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var rows = await _db.Database.SqlQueryRaw<DisenoOrdenRow>("""
            SELECT d.RecorteDisenoId,d.EstadoRevision,d.ContenidoHash,d.CantidadSugerida,
                   v.ProductoId,v.ListaMaterialesId,v.PlantillaFabricacionId,
                   CASE WHEN p.Activo=1 AND b.Activa=1 AND t.Estado=N'Aprobada'
                     AND b.ProductoId=v.ProductoId AND t.ProductoId=v.ProductoId
                     AND t.ListaMaterialesId=v.ListaMaterialesId THEN 1 ELSE 0 END AS RecetaHabilitada
            FROM dbo.RecorteDiseno d WITH(UPDLOCK,HOLDLOCK)
            LEFT JOIN dbo.RecorteDisenoProducto v ON v.RecorteDisenoId=d.RecorteDisenoId
            LEFT JOIN dbo.Producto p ON p.ProductoId=v.ProductoId
            LEFT JOIN dbo.ListaMateriales b ON b.ListaMaterialesId=v.ListaMaterialesId
            LEFT JOIN dbo.PlantillaFabricacion t ON t.PlantillaFabricacionId=v.PlantillaFabricacionId
            WHERE d.RecorteDisenoId=@id
            """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct);
        var row = rows.SingleOrDefault() ?? throw new KeyNotFoundException("Diseño GIR inexistente.");
        var previous = await _db.Database.SqlQueryRaw<int>("""
            SELECT OrdenProduccionId AS [Value] FROM dbo.OrdenProduccionGIR
            WHERE RecorteDisenoId=@id
            """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct);
        if (previous.Count == 1)
        {
            await tx.CommitAsync(ct);
            return previous[0];
        }
        if (row.EstadoRevision != "Aprobada" || row.RecetaHabilitada != 1 ||
            row.ProductoId is null || row.ListaMaterialesId is null ||
            row.PlantillaFabricacionId is null || row.CantidadSugerida <= 0)
            throw new InvalidOperationException("El diseño debe estar aprobado y vinculado a una receta activa y certificada.");
        var certified = await _db.Database.SqlQueryRaw<int>("""
            SELECT CASE WHEN EXISTS(SELECT 1 FROM dbo.RecorteDisenoCertificacion c
                WHERE c.RecorteDisenoId=@id AND c.ContenidoHash=@hash)
              AND EXISTS(SELECT 1 FROM dbo.RecorteDisenoValidacion v
                WHERE v.RecorteDisenoId=@id AND v.Resultado='Valida' AND v.ContenidoHash=@hash
                 AND v.RecorteDisenoValidacionId=(SELECT MAX(v2.RecorteDisenoValidacionId)
                    FROM dbo.RecorteDisenoValidacion v2 WHERE v2.RecorteDisenoId=@id))
              THEN 1 ELSE 0 END AS [Value]
            """, new SqlParameter("@id", recorteDisenoId),
            new SqlParameter("@hash", SqlDbType.Binary, 32) { Value = row.ContenidoHash }).SingleAsync(ct);
        if (certified != 1)
            throw new InvalidOperationException("La certificación técnica ya no coincide con el diseño.");
        var cutIds = await _db.Database.SqlQueryRaw<int>("""
            SELECT DISTINCT RecorteId AS [Value] FROM dbo.RecorteDisenoAsignacion
            WHERE RecorteDisenoId=@id ORDER BY RecorteId
            """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct);
        if (cutIds.Count == 0) throw new InvalidOperationException("El diseño no tiene recortes asignados.");
        var unavailable = await _db.Database.SqlQueryRaw<int>("""
            SELECT COUNT(*) AS [Value] FROM (
              SELECT DISTINCT a.RecorteId FROM dbo.RecorteDisenoAsignacion a
              WHERE a.RecorteDisenoId=@id
            ) x
            JOIN dbo.RecorteDiseno d ON d.RecorteDisenoId=@id
            LEFT JOIN dbo.Recorte r WITH(UPDLOCK,HOLDLOCK) ON r.RecorteId=x.RecorteId
            LEFT JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
            LEFT JOIN dbo.RecorteGeneracionInventario snap
              ON snap.RecorteGeneracionId=d.RecorteGeneracionId AND snap.RecorteId=x.RecorteId
            OUTER APPLY(SELECT COALESCE(SUM(s.CantidadActual),0) AS Cantidad
              FROM dbo.StockRecorte s WITH(UPDLOCK,HOLDLOCK) WHERE s.RecorteId=x.RecorteId) stock
            WHERE r.RecorteId IS NULL OR e.Nombre<>'Disponible' OR r.Cantidad<>1 OR
             stock.Cantidad<>1 OR snap.RecorteId IS NULL OR snap.CantidadDisponible<>1 OR
             r.InsumoId<>snap.InsumoId OR ISNULL(r.ColorId,-1)<>ISNULL(snap.ColorId,-1) OR
             ISNULL(r.LargoMm,-1)<>ISNULL(snap.LargoMm,-1) OR
             ISNULL(r.AnchoMm,-1)<>ISNULL(snap.AnchoMm,-1) OR
             ISNULL(r.EspesorMm,-1)<>ISNULL(snap.EspesorMm,-1) OR
             ISNULL(r.OrientacionVeta,'')<>ISNULL(snap.OrientacionVeta,'') OR
             EXISTS(SELECT 1 FROM dbo.ConsumoRecorteProduccion c
              WHERE c.RecorteId=x.RecorteId)
            """, new SqlParameter("@id", recorteDisenoId)).SingleAsync(ct);
        if (unavailable != 0)
            throw new InvalidOperationException("Uno o más recortes ya no están disponibles. No se creó la OP.");
        var typeIds = await _db.Database.SqlQueryRaw<int>("""
            SELECT TipoProduccionId AS [Value] FROM dbo.TipoProduccion
            WHERE Nombre=N'Desde recorte' AND Activo=1
            """).ToListAsync(ct);
        if (typeIds.Count != 1)
            throw new InvalidOperationException("El tipo de producción desde recorte no está configurado de forma única.");
        var detailJson = JsonSerializer.Serialize(new[] { new {
            ProductoId = row.ProductoId.Value, ListaMaterialesId = row.ListaMaterialesId.Value,
            CantidadPlanificada = (decimal)row.CantidadSugerida
        } });
        var cutsJson = JsonSerializer.Serialize(cutIds.Select(id => new { RecorteId = id, Cantidad = 1m }));
        var result = await _db.Database.SqlQueryRaw<int>(
            "EXEC dbo.sp_TEKA_OP_CrearMultiproducto @TipoProduccionId,@DetalleJson,@Observaciones,@RecortesJson",
            new SqlParameter("@TipoProduccionId", typeIds[0]),
            new SqlParameter("@DetalleJson", SqlDbType.NVarChar, -1) { Value = detailJson },
            new SqlParameter("@Observaciones", SqlDbType.VarChar, 500) { Value = $"Diseño GIR #{recorteDisenoId}" },
            new SqlParameter("@RecortesJson", SqlDbType.NVarChar, -1) { Value = cutsJson }).ToListAsync(ct);
        var orderId = result.Single();
        var updated = await _db.Database.ExecuteSqlRawAsync("""
            UPDATE dbo.OrdenProduccion SET PlantillaFabricacionId=@template
            WHERE OrdenProduccionId=@order AND PlantillaFabricacionId IS NULL
            """, new SqlParameter("@template", row.PlantillaFabricacionId.Value),
            new SqlParameter("@order", orderId));
        if (updated != 1) throw new InvalidOperationException("No se pudo fijar la plantilla aprobada en la OP.");
        await _db.Database.ExecuteSqlRawAsync("""
            INSERT dbo.OrdenProduccionGIR(RecorteDisenoId,OrdenProduccionId,ProductoId,
             ListaMaterialesId,PlantillaFabricacionId,ContenidoHash,CantidadPlanificada,UsuarioId)
            VALUES(@design,@order,@product,@bom,@template,@hash,@quantity,@user)
            """, new SqlParameter("@design", recorteDisenoId), new SqlParameter("@order", orderId),
            new SqlParameter("@product", row.ProductoId.Value),
            new SqlParameter("@bom", row.ListaMaterialesId.Value),
            new SqlParameter("@template", row.PlantillaFabricacionId.Value),
            new SqlParameter("@hash", SqlDbType.Binary, 32) { Value = row.ContenidoHash },
            new SqlParameter("@quantity", row.CantidadSugerida), new SqlParameter("@user", usuarioId));
        await tx.CommitAsync(ct);
        return orderId;
    }

    // Solo lectura. La creación real requiere adaptar los procedimientos de inicio y sus snapshots.
    public async Task<OrdenDesdeDisenoValidacionDTO> ValidarOrdenDesdeDisenoAsync(long recorteDisenoId, CancellationToken ct)
    {
        if (recorteDisenoId <= 0) throw new ArgumentOutOfRangeException(nameof(recorteDisenoId));
        var rows = await _db.Database.SqlQueryRaw<DisenoEstadoRow>("""
            SELECT d.RecorteDisenoId, d.EstadoRevision, d.CantidadSugerida, v.ProductoId,
                   (SELECT COUNT(*) FROM dbo.RecorteDisenoAsignacion a WHERE a.RecorteDisenoId=d.RecorteDisenoId) AS CantidadAsignaciones,
                   (SELECT COUNT(*) FROM dbo.RecorteDisenoInsumo i WHERE i.RecorteDisenoId=d.RecorteDisenoId) AS CantidadInsumosComplementarios,
                   CASE WHEN p.ProductoId IS NOT NULL AND p.Activo=1 THEN 1 ELSE 0 END AS ProductoActivo
            FROM dbo.RecorteDiseno d
            LEFT JOIN dbo.RecorteDisenoProducto v ON v.RecorteDisenoId=d.RecorteDisenoId
            LEFT JOIN dbo.Producto p ON p.ProductoId=v.ProductoId
            WHERE d.RecorteDisenoId=@id
            """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct);
        var row = rows.SingleOrDefault();
        if (row is null) throw new KeyNotFoundException("No existe el diseño indicado.");
        var result = new OrdenDesdeDisenoValidacionDTO
        {
            RecorteDisenoId = row.RecorteDisenoId, ProductoId = row.ProductoId,
            EstadoRevision = row.EstadoRevision, CantidadAsignaciones = row.CantidadAsignaciones,
            CantidadInsumosComplementarios = row.CantidadInsumosComplementarios,
            CantidadSugerida = row.CantidadSugerida
        };
        if (row.EstadoRevision != "Aprobada") result.Bloqueantes.Add("El diseño no está aprobado.");
        if (!row.ProductoId.HasValue) result.Bloqueantes.Add("El diseño todavía no está vinculado a un producto.");
        else if (row.ProductoActivo != 1) result.Bloqueantes.Add("El producto vinculado está inactivo o no existe.");
        if (row.CantidadAsignaciones == 0) result.Bloqueantes.Add("El diseño no tiene recortes asignados.");
        var installed = await _db.Database.SqlQueryRaw<int>("""
            SELECT CASE WHEN OBJECT_ID('dbo.OrdenProduccionGIR','U') IS NOT NULL
             AND COL_LENGTH('dbo.RecorteDisenoProducto','ListaMaterialesId') IS NOT NULL
             AND OBJECT_ID('dbo.sp_GIR_VincularReceta','P') IS NOT NULL
             THEN 1 ELSE 0 END AS [Value]
            """).SingleAsync(ct);
        result.CircuitoHabilitado = installed == 1;
        if (installed != 1)
            result.Bloqueantes.Add("El circuito GIR/OP requiere aplicar el incremental aprobado.");
        else
        {
            var links = await _db.Database.SqlQueryRaw<DisenoRecetaRow>("""
                SELECT v.ListaMaterialesId,v.PlantillaFabricacionId,
                  CASE WHEN b.Activa=1 AND t.Estado=N'Aprobada' AND
                    b.ProductoId=v.ProductoId AND t.ProductoId=v.ProductoId AND
                    t.ListaMaterialesId=v.ListaMaterialesId THEN 1 ELSE 0 END AS RecetaHabilitada
                FROM dbo.RecorteDisenoProducto v
                LEFT JOIN dbo.ListaMateriales b ON b.ListaMaterialesId=v.ListaMaterialesId
                LEFT JOIN dbo.PlantillaFabricacion t ON t.PlantillaFabricacionId=v.PlantillaFabricacionId
                WHERE v.RecorteDisenoId=@id
                """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct);
            var link = links.SingleOrDefault();
            result.ListaMaterialesId = link?.ListaMaterialesId;
            result.PlantillaFabricacionId = link?.PlantillaFabricacionId;
            if (link?.RecetaHabilitada != 1)
                result.Bloqueantes.Add("Falta vincular un Producto, BOM y plantilla aprobada que coincidan con el diseño.");
            result.OrdenProduccionId = (await _db.Database.SqlQueryRaw<int>("""
                SELECT OrdenProduccionId AS [Value] FROM dbo.OrdenProduccionGIR
                WHERE RecorteDisenoId=@id
                """, new SqlParameter("@id", recorteDisenoId)).ToListAsync(ct)).SingleOrDefault();
            if (result.OrdenProduccionId == 0) result.OrdenProduccionId = null;
            if (result.OrdenProduccionId is not null)
                result.Bloqueantes.Add("Este diseño ya tiene una OP; consultá su seguimiento.");
            result.RecortesAsignados = await _db.Database.SqlQueryRaw<int>("""
                SELECT COUNT(DISTINCT RecorteId) AS [Value] FROM dbo.RecorteDisenoAsignacion
                WHERE RecorteDisenoId=@id
                """, new SqlParameter("@id", recorteDisenoId)).SingleAsync(ct);
            result.RecortesNoDisponibles = await _db.Database.SqlQueryRaw<int>("""
                SELECT COUNT(*) AS [Value] FROM (
                  SELECT DISTINCT RecorteId FROM dbo.RecorteDisenoAsignacion WHERE RecorteDisenoId=@id
                ) a JOIN dbo.RecorteDiseno d ON d.RecorteDisenoId=@id
                LEFT JOIN dbo.Recorte r ON r.RecorteId=a.RecorteId
                LEFT JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
                LEFT JOIN dbo.RecorteGeneracionInventario snap ON
                  snap.RecorteGeneracionId=d.RecorteGeneracionId AND snap.RecorteId=a.RecorteId
                OUTER APPLY(SELECT COALESCE(SUM(s.CantidadActual),0) Cantidad
                  FROM dbo.StockRecorte s WHERE s.RecorteId=a.RecorteId) stock
                WHERE r.RecorteId IS NULL OR e.Nombre<>'Disponible' OR r.Cantidad<>1 OR
                  stock.Cantidad<>1 OR snap.RecorteId IS NULL OR snap.CantidadDisponible<>1 OR
                  r.InsumoId<>snap.InsumoId OR ISNULL(r.ColorId,-1)<>ISNULL(snap.ColorId,-1) OR
                  ISNULL(r.LargoMm,-1)<>ISNULL(snap.LargoMm,-1) OR
                  ISNULL(r.AnchoMm,-1)<>ISNULL(snap.AnchoMm,-1) OR
                  ISNULL(r.EspesorMm,-1)<>ISNULL(snap.EspesorMm,-1) OR
                  ISNULL(r.OrientacionVeta,'')<>ISNULL(snap.OrientacionVeta,'') OR
                  EXISTS(SELECT 1 FROM dbo.ConsumoRecorteProduccion c
                   WHERE c.RecorteId=a.RecorteId)
                """, new SqlParameter("@id", recorteDisenoId)).SingleAsync(ct);
            if (result.RecortesNoDisponibles > 0 && result.OrdenProduccionId is null)
                result.Bloqueantes.Add("Uno o más recortes asignados ya no están disponibles.");
        }
        result.PuedeContinuar = result.Bloqueantes.Count == 0;
        return result;
    }

    private sealed class DisenoEstadoRow
    {
        public long RecorteDisenoId { get; set; }
        public string EstadoRevision { get; set; } = string.Empty;
        public int CantidadSugerida { get; set; }
        public int? ProductoId { get; set; }
        public int CantidadAsignaciones { get; set; }
        public int CantidadInsumosComplementarios { get; set; }
        public int ProductoActivo { get; set; }
    }

    private sealed class DisenoRecetaRow
    {
        public int? ListaMaterialesId { get; set; }
        public int? PlantillaFabricacionId { get; set; }
        public int RecetaHabilitada { get; set; }
    }

    private sealed class DisenoOrdenRow
    {
        public long RecorteDisenoId { get; set; }
        public string EstadoRevision { get; set; } = string.Empty;
        public byte[] ContenidoHash { get; set; } = [];
        public int CantidadSugerida { get; set; }
        public int? ProductoId { get; set; }
        public int? ListaMaterialesId { get; set; }
        public int? PlantillaFabricacionId { get; set; }
        public int RecetaHabilitada { get; set; }
    }
}
