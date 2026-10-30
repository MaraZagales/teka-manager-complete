using System.Data;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

/// <summary>Captura el contexto persistido antes de entregar datos al proveedor.</summary>
public sealed class RecorteSnapshotService(TekaDbContext db) : IRecorteGeneracionSnapshotPrevio
{
    public async Task<IReadOnlyList<RecorteCandidatoSnapshot>> ConsultarElegiblesAsync(CancellationToken ct = default)
    {
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
        var rows = await LeerElegibles(connection, transaction, ct, bloquear: false);
        await transaction.CommitAsync(ct);
        return rows;
    }

    public async Task<RecorteGeneracionSnapshot> CapturarAntesDeIaAsync(Guid solicitudUid, int usuarioId,
        IReadOnlyCollection<int> recorteIds,
        CancellationToken ct = default)
    {
        if (solicitudUid == Guid.Empty || usuarioId <= 0 || recorteIds is null ||
            recorteIds.Count is < 1 or > 100 || recorteIds.Any(id => id <= 0) ||
            recorteIds.Distinct().Count() != recorteIds.Count)
            throw new InvalidOperationException("Solicitud, usuario o selección de recortes inválidos.");
        var selected = recorteIds.ToHashSet();
        await using var c = new SqlConnection(db.Database.GetConnectionString());
        await c.OpenAsync(ct);
        await using var t = (SqlTransaction)await c.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            await using (var existing = new SqlCommand("""
                SELECT RecorteGeneracionId,UsuarioId,FechaGeneracion,Estado
                FROM dbo.RecorteGeneracion WITH(UPDLOCK,HOLDLOCK) WHERE SolicitudUid=@uid
                """, c, t))
            {
                existing.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = solicitudUid;
                await using var reader = await existing.ExecuteReaderAsync(ct);
                if (await reader.ReadAsync(ct))
                {
                    var id = reader.GetInt64(0);
                    var owner = reader.GetInt32(1);
                    var date = reader.GetDateTime(2);
                    var state = reader.GetString(3);
                    if (owner != usuarioId)
                        throw new InvalidOperationException("SolicitudUid pertenece a otro usuario.");
                    await reader.CloseAsync();
                    var recorded = await LeerSnapshot(c, t, id, ct);
                    if (!recorded.Select(x => x.RecorteId).ToHashSet().SetEquals(selected))
                        throw new InvalidOperationException("La solicitud repetida tiene otra selección de recortes.");
                    await t.CommitAsync(ct);
                    return new(id, id, solicitudUid, date, recorded, state, owner);
                }
            }

            var eligible = await LeerElegibles(c, t, ct);
            var candidates = eligible.Where(x => selected.Contains(x.RecorteId)).ToList();
            if (candidates.Count != selected.Count)
                throw new InvalidOperationException("Uno o más recortes seleccionados ya no están disponibles o no son elegibles.");
            var digest = SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(candidates));
            long generationId;
            await using (var insert = new SqlCommand("""
                DECLARE @ids TABLE(Id bigint NOT NULL);
                INSERT dbo.RecorteGeneracion(SolicitudUid,ContenidoHash,UsuarioId,Estado,CantidadRecibidas)
                OUTPUT INSERTED.RecorteGeneracionId INTO @ids(Id)
                VALUES(@uid,@hash,@user,'PendienteGeneracion',0);
                SELECT Id FROM @ids;
                """, c, t))
            {
                insert.Parameters.Add("@uid", SqlDbType.UniqueIdentifier).Value = solicitudUid;
                insert.Parameters.Add("@hash", SqlDbType.Binary, 32).Value = digest;
                insert.Parameters.Add("@user", SqlDbType.Int).Value = usuarioId;
                generationId = Convert.ToInt64(await insert.ExecuteScalarAsync(ct));
            }
            foreach (var x in candidates)
            {
                await using var insert = new SqlCommand("""
                    INSERT dbo.RecorteGeneracionInventario(RecorteGeneracionId,RecorteId,EstadoRecorteId,
                     CantidadDisponible,LargoMm,AnchoMm,EspesorMm,InsumoId,ColorId,OrientacionVeta,
                     DepositoId,UnidadMedidaId,CantidadRegistrada,TipoInsumoId,InsumoColorId,
                     EstadoNombre,UnidadNombre,TipoInsumoNombre,FechaSnapshot)
                    VALUES(@gen,@cut,@status,@stock,@length,@width,@thickness,@supply,@color,@grain,
                     @depot,@unit,@registered,@material,@supplyColor,@statusName,@unitName,@materialName,@at)
                    """, c, t);
                void P(string name, object? value) => insert.Parameters.AddWithValue(name, value ?? DBNull.Value);
                P("@gen", generationId); P("@cut", x.RecorteId); P("@status", x.EstadoRecorteId);
                P("@stock", x.CantidadDisponible); P("@length", x.LargoMm); P("@width", x.AnchoMm);
                P("@thickness", x.EspesorMm); P("@supply", x.InsumoId); P("@color", x.ColorId);
                P("@grain", x.OrientacionVeta); P("@depot", x.DepositoId); P("@unit", x.UnidadMedidaId);
                P("@registered", x.CantidadRegistrada); P("@material", x.TipoInsumoId);
                P("@supplyColor", x.InsumoColorId); P("@statusName", x.EstadoNombre);
                P("@unitName", x.UnidadNombre); P("@materialName", x.TipoInsumoNombre);
                P("@at", x.FechaSnapshotUtc);
                await insert.ExecuteNonQueryAsync(ct);
            }
            await t.CommitAsync(ct);
            return new(generationId, generationId, solicitudUid, candidates.Count == 0
                ? DateTime.UtcNow : candidates.Min(x => x.FechaSnapshotUtc), candidates,
                UsuarioId: usuarioId);
        }
        catch
        {
            await t.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    internal static async Task<List<RecorteCandidatoSnapshot>> LeerElegibles(SqlConnection c,
        SqlTransaction t, CancellationToken ct, bool bloquear = true)
    {
        var sql = """
            SELECT r.RecorteId,r.InsumoId,i.TipoInsumoId,r.ColorId,i.ColorId InsumoColorId,
             r.EstadoRecorteId,s.DepositoId,r.UnidadMedidaId,r.Cantidad,s.CantidadActual,
             r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta,e.Nombre EstadoNombre,
             u.Nombre UnidadNombre,ti.Nombre TipoInsumoNombre,SYSUTCDATETIME() FechaCaptura
            FROM dbo.Recorte r WITH(UPDLOCK,HOLDLOCK)
            JOIN dbo.StockRecorte s WITH(UPDLOCK,HOLDLOCK) ON s.RecorteId=r.RecorteId
            JOIN dbo.Deposito dep ON dep.DepositoId=s.DepositoId AND dep.Activo=1
             AND dep.Nombre=N'Pañol de Recortes'
            JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId AND e.Activo=1
             AND e.Nombre='Disponible'
            JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId AND u.Nombre='Unidad'
            JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId AND i.Activo=1
            JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId AND ti.Activo=1
             AND ti.Nombre='Melamina'
            JOIN dbo.Color color ON color.ColorId=r.ColorId AND color.Activo=1
            WHERE r.Cantidad=1 AND s.CantidadActual=1 AND r.LargoMm>0 AND r.AnchoMm>0
             AND r.EspesorMm>0 AND r.OrientacionVeta IN ('Indiferente','Largo','Ancho')
             AND (i.ColorId IS NULL OR i.ColorId=r.ColorId)
             AND NOT EXISTS(SELECT 1 FROM dbo.StockRecorte other
              WHERE other.RecorteId=r.RecorteId AND other.DepositoId<>s.DepositoId
               AND other.CantidadActual>0)
             AND NOT EXISTS(SELECT 1 FROM dbo.ConsumoRecorteProduccion used
              WHERE used.RecorteId=r.RecorteId)
             AND NOT EXISTS(SELECT 1 FROM dbo.MovimientoRecorte mov
              WHERE mov.RecorteId=r.RecorteId AND mov.TipoMovimiento='Uso')
            ORDER BY r.RecorteId
            """;
        if (!bloquear) sql = sql.Replace(" WITH(UPDLOCK,HOLDLOCK)", "", StringComparison.Ordinal);
        await using var cmd = new SqlCommand(sql, c, t);
        var rows = new List<RecorteCandidatoSnapshot>();
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
            rows.Add(Map(reader));
        return rows;
    }

    internal static async Task<List<RecorteCandidatoSnapshot>> LeerSnapshot(SqlConnection c,
        SqlTransaction t, long generationId, CancellationToken ct)
    {
        await using var cmd = new SqlCommand("""
            SELECT s.RecorteId,s.InsumoId,s.TipoInsumoId,s.ColorId,s.InsumoColorId,
             s.EstadoRecorteId,s.DepositoId,s.UnidadMedidaId,s.CantidadRegistrada,s.CantidadDisponible,
             s.LargoMm,s.AnchoMm,s.EspesorMm,s.OrientacionVeta,s.EstadoNombre,
             s.UnidadNombre,s.TipoInsumoNombre,s.FechaSnapshot
            FROM dbo.RecorteGeneracionInventario s WHERE s.RecorteGeneracionId=@gen
            ORDER BY s.RecorteId
            """, c, t);
        cmd.Parameters.Add("@gen", SqlDbType.BigInt).Value = generationId;
        var rows = new List<RecorteCandidatoSnapshot>();
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) rows.Add(Map(reader));
        return rows;
    }

    private static RecorteCandidatoSnapshot Map(SqlDataReader r)
    {
        T? Maybe<T>(int at) where T : struct => r.IsDBNull(at) ? null : r.GetFieldValue<T>(at);
        return new(r.GetInt32(0),r.GetInt32(1),r.GetInt32(2),Maybe<int>(3),Maybe<int>(4),
            r.GetInt32(5),r.GetInt32(6),r.GetInt32(7),r.GetDecimal(8),r.GetDecimal(9),
            Maybe<decimal>(10),Maybe<decimal>(11),Maybe<decimal>(12),r.IsDBNull(13)?null:r.GetString(13),
            r.GetString(14),r.GetString(15),r.GetString(16),r.GetDateTime(17));
    }
}
