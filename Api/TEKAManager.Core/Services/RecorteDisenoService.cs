using System.Data;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TEKAManager.Core.Data;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public sealed class RecorteDisenoService(TekaDbContext db, IConfiguration configuration,
    RecortePropuestaValidador validator) : IRecorteGeneracionResultadoStore
{
    private SqlConnection OpenConnection() => new(db.Database.GetConnectionString());

    public async Task<bool> CircuitoFabricacionInstaladoAsync(CancellationToken ct = default)
    {
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var command = new SqlCommand("""
            SELECT CASE WHEN OBJECT_ID('dbo.sp_GIR_CertificarDiseno','P') IS NOT NULL
             AND OBJECT_ID('dbo.sp_GIR_VincularReceta','P') IS NOT NULL
             AND OBJECT_ID('dbo.OrdenProduccionGIR','U') IS NOT NULL
             AND OBJECT_ID('dbo.RecorteDisenoCertificacion','U') IS NOT NULL
             THEN 1 ELSE 0 END
            """, c);
        return Convert.ToInt32(await command.ExecuteScalarAsync(ct)) == 1;
    }

    public async Task CertificarAsync(long disenoId, int usuarioId,
        IReadOnlyList<(long MotivoId, string Evidencia)> evidencias, CancellationToken ct = default)
    {
        if (disenoId <= 0 || usuarioId <= 0 || evidencias is null || evidencias.Count is < 1 or > 100 ||
            evidencias.Any(x => x.MotivoId <= 0 || string.IsNullOrWhiteSpace(x.Evidencia) ||
                x.Evidencia.Trim().Length is < 20 or > 2000) ||
            evidencias.Select(x => x.MotivoId).Distinct().Count() != evidencias.Count)
            throw new ArgumentException("Cada regla pendiente requiere una evidencia concreta y única.");
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var command = new SqlCommand("dbo.sp_GIR_CertificarDiseno", c)
        { CommandType = CommandType.StoredProcedure };
        command.Parameters.Add("@RecorteDisenoId", SqlDbType.BigInt).Value = disenoId;
        command.Parameters.Add("@UsuarioId", SqlDbType.Int).Value = usuarioId;
        command.Parameters.Add("@EvidenciasJson", SqlDbType.NVarChar, -1).Value =
            JsonSerializer.Serialize(evidencias.Select(x => new { motivoId = x.MotivoId, evidencia = x.Evidencia.Trim() }));
        await command.ExecuteNonQueryAsync(ct);
    }

    public async Task VincularRecetaAsync(long disenoId, int productoId, int listaMaterialesId,
        int plantillaFabricacionId, int usuarioId, CancellationToken ct = default)
    {
        if (disenoId <= 0 || productoId <= 0 || listaMaterialesId <= 0 ||
            plantillaFabricacionId <= 0 || usuarioId <= 0)
            throw new ArgumentException("Producto, BOM y plantilla aprobada son obligatorios.");
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var command = new SqlCommand("dbo.sp_GIR_VincularReceta", c)
        { CommandType = CommandType.StoredProcedure };
        command.Parameters.Add("@RecorteDisenoId", SqlDbType.BigInt).Value = disenoId;
        command.Parameters.Add("@ProductoId", SqlDbType.Int).Value = productoId;
        command.Parameters.Add("@ListaMaterialesId", SqlDbType.Int).Value = listaMaterialesId;
        command.Parameters.Add("@PlantillaFabricacionId", SqlDbType.Int).Value = plantillaFabricacionId;
        command.Parameters.Add("@UsuarioId", SqlDbType.Int).Value = usuarioId;
        await command.ExecuteNonQueryAsync(ct);
    }

    private static SqlCommand Command(SqlConnection connection, SqlTransaction? transaction, string sql,
        params (string Name, object? Value)[] values)
    {
        var command = new SqlCommand(sql, connection, transaction);
        foreach (var (name, value) in values)
            command.Parameters.AddWithValue(name, value ?? DBNull.Value);
        return command;
    }

    private static async Task<long> InsertId(SqlConnection c, SqlTransaction t, string sql,
        CancellationToken ct, params (string, object?)[] values)
    {
        await using var cmd = Command(c, t, sql, values);
        return Convert.ToInt64(await cmd.ExecuteScalarAsync(ct));
    }

    private static async Task Execute(SqlConnection c, SqlTransaction t, string sql,
        CancellationToken ct, params (string, object?)[] values)
    {
        await using var cmd = Command(c, t, sql, values);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    private static byte[] Hash(object value) => SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(value));

    public async Task<int> MarcarErrorAsync(long generacionId, Guid solicitudUid, int usuarioId,
        string codigo, string detalle, CancellationToken ct = default)
    {
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var command = Command(c, null, """
            UPDATE dbo.RecorteGeneracion SET Estado='ConError', ErrorCodigo=@codigo,
                ErrorDetalle=@detalle, ResultadoHash=@hash
            WHERE RecorteGeneracionId=@id AND SolicitudUid=@uid AND UsuarioId=@usuario
              AND Estado='PendienteGeneracion';
            """, ("@codigo", codigo), ("@detalle", detalle),
            ("@hash", Hash(new { generacionId, solicitudUid, codigo, detalle })),
            ("@id", generacionId), ("@uid", solicitudUid), ("@usuario", usuarioId));
        return await command.ExecuteNonQueryAsync(ct);
    }

    public async Task<IReadOnlyList<(long Id, Guid SolicitudUid, int UsuarioId)>>
        PendientesObsoletasAsync(int minutos, CancellationToken ct = default)
    {
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var command = Command(c, null, """
            SELECT RecorteGeneracionId,SolicitudUid,UsuarioId
            FROM dbo.RecorteGeneracion
            WHERE Estado='PendienteGeneracion'
              AND FechaGeneracion<DATEADD(MINUTE,-@minutos,SYSUTCDATETIME())
            ORDER BY RecorteGeneracionId
            """, ("@minutos", minutos));
        var rows = new List<(long, Guid, int)>();
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
            rows.Add((reader.GetInt64(0), reader.GetGuid(1), reader.GetInt32(2)));
        return rows;
    }
    private static bool Decimales(decimal value, int scale) => decimal.Round(value, scale) == value;

    private async Task ValidarCostoConFuente(SqlConnection c, SqlTransaction t,
        RecorteDisenoCostoDraft cost, CancellationToken ct)
    {
        if (cost.CostoUnitario is null) return;
        var validStates = configuration.GetSection("Costos:EstadosCompraValidos").GetChildren()
            .Select(x => x.Value?.Trim()).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        if (cost.Tipo != "Insumo" || cost.InsumoId is null ||
            cost.Fuente != "CompraProveedorDetalle" ||
            !int.TryParse(cost.ReferenciaFuente, out var detailId) || detailId <= 0 ||
            validStates.Length == 0 ||
            cost.Subtotal != decimal.Round(cost.Cantidad * cost.CostoUnitario.Value, 2, MidpointRounding.AwayFromZero))
            throw new InvalidOperationException("Costo estimado sin una compra valida y verificable.");
        await using var cmd = Command(c, t, """
            SELECT COUNT(*) FROM dbo.CompraProveedorDetalle cd
            JOIN dbo.CompraProveedor cp ON cp.CompraProveedorId=cd.CompraProveedorId
            WHERE cd.CompraProveedorDetalleId=@detail AND cd.InsumoId=@supply
             AND cd.PrecioUnitario=@price AND cd.CantidadComprada>0
             AND cp.Estado IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@states,','))
             AND (@date IS NULL OR CAST(cp.FechaCompra AS DATE)=CAST(@date AS DATE))
            """, ("@detail", detailId), ("@supply", cost.InsumoId),
            ("@price", cost.CostoUnitario), ("@states", string.Join(',', validStates!)),
            ("@date", cost.FechaFuente));
        if (Convert.ToInt32(await cmd.ExecuteScalarAsync(ct)) != 1)
            throw new InvalidOperationException("La fuente de costo no coincide con una compra valida.");
    }

    public static void ValidarContrato(RecorteDisenoGeneration generation)
    {
        if (generation.ContratoVersion != RecorteDisenoGeneration.VersionActual ||
            generation.ContratoUid == Guid.Empty || generation.SnapshotPrevioGeneracionId <= 0 ||
            generation.SolicitudUid == Guid.Empty || generation.UsuarioId <= 0 ||
            generation.Propuestas is null || generation.RecortesConsiderados is null ||
            (generation.Propuestas.Count == 0 && string.IsNullOrWhiteSpace(generation.ErrorCodigo)) ||
            (generation.Propuestas.Count > 0 && generation.ErrorCodigo is not null) ||
            generation.ErrorCodigo?.Length > 80 || generation.ErrorDetalle?.Length > 1000)
            throw new InvalidOperationException("La generacion requiere identificador, usuario y propuestas o un error registrado.");
        if (generation.Propuestas.Count > 100 || generation.RecortesConsiderados.Count > 10000)
            throw new InvalidOperationException("La generacion excede el tamano admitido.");
        foreach (var (d, index) in generation.Propuestas.Select((value, index) => (value, index)))
        {
            if (d.FamiliaUid == Guid.Empty || d.VersionNumero < 1 ||
                (d.VersionNumero == 1) != (d.VersionAnteriorId is null) ||
                string.IsNullOrWhiteSpace(d.Nombre) || string.IsNullOrWhiteSpace(d.Descripcion) ||
                d.Nombre.Length > 160 || d.Descripcion.Length > 1500 ||
                d.LargoExteriorMm <= 0 || d.AnchoExteriorMm <= 0 || d.AltoExteriorMm <= 0 ||
                d.CantidadSugerida <= 0 || d.Piezas.Count == 0)
                throw new InvalidOperationException($"Propuesta {index + 1}: datos de diseno incompletos o invalidos.");
            RecorteGeometria.ValidarEntrada(d.LargoExteriorMm, d.AnchoExteriorMm, d.AltoExteriorMm, null);
            var order = new HashSet<int>();
            foreach (var p in d.Piezas)
            {
                if (p.OrdenPieza <= 0 || !order.Add(p.OrdenPieza) || string.IsNullOrWhiteSpace(p.Nombre) ||
                    p.InsumoId <= 0 || p.Cantidad <= 0 || p.LargoMm <= 0 || p.AnchoMm <= 0 || p.EspesorMm <= 0 ||
                    p.Origen is not ("Recorte" or "Insumo") ||
                    p.OrientacionVeta is not ("Indiferente" or "Largo" or "Ancho"))
                    throw new InvalidOperationException($"Propuesta {index + 1}: pieza invalida.");
                RecorteGeometria.ValidarEntrada(p.LargoMm, p.AnchoMm, p.EspesorMm, p.OrientacionVeta);
            }
            foreach (var a in d.Asignaciones)
                if (!order.Contains(a.OrdenPieza) || d.Piezas.Single(p => p.OrdenPieza == a.OrdenPieza).Origen != "Recorte" ||
                    a.RecorteId <= 0 || a.CantidadPiezas <= 0 || a.PosicionXmm < 0 || a.PosicionYmm < 0 ||
                    a.LargoCorteMm <= 0 || a.AnchoCorteMm <= 0 || a.AnchoSierraMm < 0 ||
                    a.MargenSeguridadMm < 0 || a.ToleranciaMm < 0)
                    throw new InvalidOperationException($"Propuesta {index + 1}: asignacion invalida.");
            foreach (var a in d.Asignaciones)
            {
                RecorteGeometria.ValidarEntrada(a.LargoCorteMm, a.AnchoCorteMm, null, null);
                if (!Decimales(a.PosicionXmm, 2) || !Decimales(a.PosicionYmm, 2) ||
                    (a.AnchoSierraMm is decimal kerf && (!Decimales(kerf, 2) || kerf > 999999.99m)) ||
                    (a.MargenSeguridadMm is decimal margin && (!Decimales(margin, 2) || margin > 999999.99m)) ||
                    (a.ToleranciaMm is decimal tolerance && (!Decimales(tolerance, 2) || tolerance > 999999.99m)))
                    throw new InvalidOperationException($"Propuesta {index + 1}: precision de corte invalida.");
            }
            if (d.InsumosComplementarios.Any(x => x.InsumoId <= 0 || x.Cantidad <= 0) ||
                d.InsumosComplementarios.Any(x => !Decimales(x.Cantidad, 4)) ||
                d.InsumosComplementarios.Select(x => x.InsumoId).Distinct().Count() != d.InsumosComplementarios.Count)
                throw new InvalidOperationException($"Propuesta {index + 1}: insumo complementario invalido.");
            foreach (var cost in d.Costos)
                if (cost.Cantidad <= 0 || !Decimales(cost.Cantidad, 4) ||
                    cost.CostoUnitario < 0 || cost.Subtotal < 0 ||
                    (cost.CostoUnitario is decimal unit && !Decimales(unit, 2)) ||
                    (cost.Subtotal is decimal subtotal && !Decimales(subtotal, 2)) ||
                    !new[] { "Recorte", "Insumo", "ManoObra", "Proceso", "Indirecto" }.Contains(cost.Tipo) ||
                    ((cost.CostoUnitario is null) != (cost.Subtotal is null)) ||
                    (cost.CostoUnitario is not null && string.IsNullOrWhiteSpace(cost.Fuente)) ||
                    (cost.CostoUnitario is null && string.IsNullOrWhiteSpace(cost.MotivoIncompleto)))
                    throw new InvalidOperationException($"Propuesta {index + 1}: costo sin fuente o invalido.");
            if (d.Imagenes.Any(x => string.IsNullOrWhiteSpace(x.Referencia) || x.Referencia.StartsWith("data:", StringComparison.OrdinalIgnoreCase)
                || x.Referencia.Contains('?') || x.Referencia.Contains('#')
                || x.Referencia.Length > 500 || string.IsNullOrWhiteSpace(x.Tipo) || string.IsNullOrWhiteSpace(x.Origen)))
                throw new InvalidOperationException($"Propuesta {index + 1}: referencia de imagen invalida.");
            if (d.Advertencias.Concat(d.Supuestos).Any(x => string.IsNullOrWhiteSpace(x) || x.Length > 500))
                throw new InvalidOperationException($"Propuesta {index + 1}: advertencia o supuesto invalido.");
        }
    }

    /// <summary>
    /// Persiste un resultado solo sobre un snapshot previamente capturado. Nunca
    /// reconstruye el inventario historico a partir de las propuestas.
    /// </summary>
    public async Task<long> GuardarGeneracionAsync(RecorteDisenoGeneration generation, CancellationToken ct = default)
    {
        ValidarContrato(generation);
        var hash = Hash(generation);
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var t = (SqlTransaction)await c.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            await using (var existing = Command(c, t,
                "SELECT Estado,ResultadoHash,UsuarioId,SolicitudUid FROM dbo.RecorteGeneracion WITH(UPDLOCK,HOLDLOCK) WHERE RecorteGeneracionId=@id",
                ("@id", generation.SnapshotPrevioGeneracionId)))
            await using (var reader = await existing.ExecuteReaderAsync(ct))
            {
                if (!await reader.ReadAsync(ct))
                    throw new InvalidOperationException("Snapshot previo inexistente.");
                var state = reader.GetString(0);
                var recordedHash = reader.IsDBNull(1) ? null : (byte[])reader.GetValue(1);
                if (reader.GetInt32(2) != generation.UsuarioId || reader.GetGuid(3) != generation.SolicitudUid)
                    throw new InvalidOperationException("El snapshot no pertenece a la solicitud y usuario.");
                if (state != "PendienteGeneracion")
                {
                    if (recordedHash is null || !recordedHash.SequenceEqual(hash))
                        throw new InvalidOperationException("Resultado repetido con contenido diferente.");
                    await reader.CloseAsync();
                    await t.CommitAsync(ct);
                    return generation.SnapshotPrevioGeneracionId;
                }
            }
            var generationId = generation.SnapshotPrevioGeneracionId;
            var snapshot = await RecorteSnapshotService.LeerSnapshot(c, t, generationId, ct);
            if (!generation.RecortesConsiderados.Order().SequenceEqual(snapshot.Select(x => x.RecorteId).Order()))
                throw new InvalidOperationException("Los recortes considerados no coinciden con el snapshot persistido.");
            if (generation.Propuestas.Count > 0 && snapshot.Count == 0)
                throw new InvalidOperationException("La solicitud no tenia recortes elegibles.");
            var live = await RecorteSnapshotService.LeerElegibles(c, t, ct);
            var supplies = await LeerInsumosComplementarios(c, t, generation.Propuestas, ct);
            var results = generation.Propuestas.Select(d => validator.Evaluar(d, snapshot, live, supplies)).ToArray();

            for (var index = 0; index < generation.Propuestas.Count; index++)
            {
                var d = generation.Propuestas[index];
                if (d.VersionAnteriorId is long previousId)
                {
                    await using var previous = Command(c, t,
                        "SELECT COUNT(*) FROM dbo.RecorteDiseno WHERE RecorteDisenoId=@id AND FamiliaUid=@family AND VersionNumero=@version",
                        ("@id", previousId), ("@family", d.FamiliaUid), ("@version", d.VersionNumero - 1));
                    if (Convert.ToInt32(await previous.ExecuteScalarAsync(ct)) != 1)
                        throw new InvalidOperationException("La version anterior no pertenece a esta familia o no es consecutiva.");
                }
                var designHash = Hash(d);
                var designId = await InsertId(c, t, """
                    DECLARE @insertedIds TABLE (Id bigint NOT NULL);
                    INSERT dbo.RecorteDiseno(RecorteGeneracionId,OrdenEnGeneracion,FamiliaUid,VersionNumero,
                     VersionAnteriorId,Nombre,Descripcion,TipoProductoId,MaterialInsumoId,ColorId,AcabadoDeclarado,
                     LargoExteriorMm,AnchoExteriorMm,AltoExteriorMm,CantidadSugerida,ContenidoHash)
                    OUTPUT INSERTED.RecorteDisenoId INTO @insertedIds(Id)
                    VALUES(@gen,@order,@family,@version,@previous,@name,@description,@type,@material,@color,@finish,
                     @length,@width,@height,@quantity,@hash);
                    SELECT Id FROM @insertedIds
                    """, ct, ("@gen", generationId), ("@order", index + 1), ("@family", d.FamiliaUid),
                    ("@version", d.VersionNumero), ("@previous", d.VersionAnteriorId), ("@name", d.Nombre.Trim()),
                    ("@description", d.Descripcion.Trim()), ("@type", d.TipoProductoId), ("@material", d.MaterialInsumoId),
                    ("@color", d.ColorId), ("@finish", d.AcabadoDeclarado), ("@length", d.LargoExteriorMm),
                    ("@width", d.AnchoExteriorMm), ("@height", d.AltoExteriorMm), ("@quantity", d.CantidadSugerida),
                    ("@hash", designHash));
                var pieceIds = new Dictionary<int, long>();
                foreach (var p in d.Piezas)
                    pieceIds.Add(p.OrdenPieza, await InsertId(c, t, """
                        DECLARE @insertedIds TABLE (Id bigint NOT NULL);
                        INSERT dbo.RecorteDisenoPieza(RecorteDisenoId,OrdenPieza,Nombre,Origen,InsumoId,ColorId,
                         Cantidad,LargoMm,AnchoMm,EspesorMm,OrientacionVeta,Observaciones)
                        OUTPUT INSERTED.RecorteDisenoPiezaId INTO @insertedIds(Id)
                        VALUES(@design,@order,@name,@origin,@supply,@color,@quantity,@length,@width,@thickness,@grain,@note);
                        SELECT Id FROM @insertedIds
                        """, ct, ("@design", designId), ("@order", p.OrdenPieza), ("@name", p.Nombre),
                        ("@origin", p.Origen), ("@supply", p.InsumoId), ("@color", p.ColorId),
                        ("@quantity", p.Cantidad), ("@length", p.LargoMm), ("@width", p.AnchoMm),
                        ("@thickness", p.EspesorMm), ("@grain", p.OrientacionVeta), ("@note", p.Observaciones)));
                foreach (var a in d.Asignaciones)
                    await Execute(c, t, """
                        INSERT dbo.RecorteDisenoAsignacion(RecorteDisenoId,RecorteDisenoPiezaId,RecorteId,
                         CantidadPiezas,PosicionXmm,PosicionYmm,LargoCorteMm,AnchoCorteMm,Giro90,
                         AnchoSierraMm,MargenSeguridadMm,ToleranciaMm)
                        VALUES(@design,@piece,@cut,@quantity,@x,@y,@length,@width,@turn,@kerf,@margin,@tolerance)
                        """, ct, ("@design", designId), ("@piece", pieceIds[a.OrdenPieza]), ("@cut", a.RecorteId),
                        ("@quantity", a.CantidadPiezas), ("@x", a.PosicionXmm), ("@y", a.PosicionYmm),
                        ("@length", a.LargoCorteMm), ("@width", a.AnchoCorteMm), ("@turn", a.Giro90),
                        ("@kerf", a.AnchoSierraMm), ("@margin", a.MargenSeguridadMm),
                        ("@tolerance", a.ToleranciaMm));
                foreach (var i in d.InsumosComplementarios)
                    await Execute(c, t, "INSERT dbo.RecorteDisenoInsumo(RecorteDisenoId,InsumoId,Cantidad,Observaciones) VALUES(@design,@supply,@quantity,@note)",
                        ct, ("@design", designId), ("@supply", i.InsumoId), ("@quantity", i.Cantidad), ("@note", i.Observaciones));
                foreach (var cost in d.Costos)
                {
                    await ValidarCostoConFuente(c, t, cost, ct);
                    await Execute(c, t, """
                        INSERT dbo.RecorteDisenoCosto(RecorteDisenoId,Tipo,InsumoId,Cantidad,CostoUnitario,Subtotal,
                         Fuente,ReferenciaFuente,FechaFuente,MotivoIncompleto)
                        VALUES(@design,@type,@supply,@quantity,@unit,@subtotal,@source,@reference,@date,@reason)
                        """, ct, ("@design", designId), ("@type", cost.Tipo), ("@supply", cost.InsumoId),
                        ("@quantity", cost.Cantidad), ("@unit", cost.CostoUnitario), ("@subtotal", cost.Subtotal),
                        ("@source", cost.Fuente), ("@reference", cost.ReferenciaFuente), ("@date", cost.FechaFuente),
                        ("@reason", cost.MotivoIncompleto));
                }
                foreach (var image in d.Imagenes)
                    await Execute(c, t, "INSERT dbo.RecorteDisenoImagen(RecorteDisenoId,Referencia,Tipo,Origen) VALUES(@design,@reference,@type,@origin)",
                        ct, ("@design", designId), ("@reference", image.Referencia), ("@type", image.Tipo), ("@origin", image.Origen));
                var result = results[index];
                var validationId = await InsertId(c, t, """
                    DECLARE @insertedIds TABLE (Id bigint NOT NULL);
                    INSERT dbo.RecorteDisenoValidacion(RecorteDisenoId,Resultado,ContenidoHash,
                     ValidadorVersion,Detalle,DiagnosticoPreliminar,ReglasAplicadasJson)
                    OUTPUT INSERTED.RecorteDisenoValidacionId INTO @insertedIds(Id)
                    VALUES(@design,'PendienteGeometria',@hash,@version,@detail,@diagnosis,@rules);
                    SELECT Id FROM @insertedIds
                    """, ct, ("@design", designId), ("@hash", result.ContenidoHash),
                    ("@version", result.VersionValidador),
                    ("@detail", result.Resultado == "Invalida"
                        ? "Errores tecnicos bloqueantes; aprobacion no habilitada."
                        : "Validacion pendiente de acabado, ensamble y estabilidad."),
                    ("@diagnosis", result.Resultado),
                    ("@rules", JsonSerializer.Serialize(result.ReglasAplicadas)));
                foreach (var reason in result.Motivos)
                    await Execute(c, t, """
                        INSERT dbo.RecorteDisenoValidacionMotivo(RecorteDisenoValidacionId,Codigo,
                         Detalle,Severidad,OrdenPieza,RecorteId)
                        VALUES(@validation,@code,@detail,@severity,@piece,@cut)
                        """, ct, ("@validation", validationId), ("@code", reason.Codigo),
                        ("@detail", reason.Detalle), ("@severity", reason.Severidad),
                        ("@piece", reason.OrdenPieza), ("@cut", reason.RecorteId));
                await Execute(c, t, "INSERT dbo.RecorteDisenoHistorial(RecorteDisenoId,EstadoNuevo,UsuarioId) VALUES(@design,'PendienteValidacion',@user)",
                    ct, ("@design", designId), ("@user", generation.UsuarioId));
            }
            await Execute(c, t, """
                UPDATE dbo.RecorteGeneracion SET Estado=@state,CantidadRecibidas=@count,
                 ErrorCodigo=@code,ErrorDetalle=@detail,ResultadoHash=@hash
                WHERE RecorteGeneracionId=@id AND Estado='PendienteGeneracion';
                IF @@ROWCOUNT<>1 THROW 64201,'La generacion ya fue completada.',1;
                """, ct, ("@state", generation.Propuestas.Count == 0 ? "ConError" : "Registrada"),
                ("@count", generation.Propuestas.Count), ("@code", generation.ErrorCodigo),
                ("@detail", generation.ErrorDetalle), ("@hash", hash), ("@id", generationId));
            await t.CommitAsync(ct);
            return generationId;
        }
        catch
        {
            await t.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    public Task<IReadOnlyList<Dictionary<string, object?>>> GeneracionesAsync(int page, int size,
        CancellationToken ct = default) =>
        RowsAsync("SELECT RecorteGeneracionId,SolicitudUid,UsuarioId,FechaGeneracion,Estado,CantidadRecibidas,CantidadTecnicasValidas,ErrorCodigo,ErrorDetalle FROM dbo.RecorteGeneracion ORDER BY RecorteGeneracionId DESC OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY",
            ct, ("@skip", (page - 1) * size), ("@take", size));

    public async Task<Dictionary<string, object?>?> GeneracionAsync(long id, CancellationToken ct = default)
    {
        var rows = await RowsAsync("SELECT RecorteGeneracionId,SolicitudUid,UsuarioId,FechaGeneracion,Estado,CantidadRecibidas,CantidadTecnicasValidas,ErrorCodigo,ErrorDetalle FROM dbo.RecorteGeneracion WHERE RecorteGeneracionId=@id",
            ct, ("@id", id));
        return rows.FirstOrDefault();
    }

    private static async Task<Dictionary<int, InsumoDisponibilidad>> LeerInsumosComplementarios(
        SqlConnection c, SqlTransaction t, IReadOnlyCollection<RecorteDisenoDraft> designs, CancellationToken ct)
    {
        var result = new Dictionary<int, InsumoDisponibilidad>();
        foreach (var id in designs.SelectMany(x => x.InsumosComplementarios.Select(y => y.InsumoId)).Distinct())
        {
            await using var cmd = Command(c, t, """
                SELECT i.InsumoId,i.Activo,COALESCE((SELECT SUM(s.CantidadActual)
                 FROM dbo.StockInsumo s JOIN dbo.Deposito d ON d.DepositoId=s.DepositoId
                 WHERE s.InsumoId=i.InsumoId AND d.Activo=1 AND d.Nombre=N'Pañol de Insumos'),0)
                FROM dbo.Insumo i WHERE i.InsumoId=@id
                """, ("@id", id));
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
                result[id] = new(id, reader.GetBoolean(1), reader.GetDecimal(2));
        }
        return result;
    }

    public Task<IReadOnlyList<Dictionary<string, object?>>> PropuestasAsync(int page, int size,
        CancellationToken ct = default) =>
        RowsAsync("SELECT RecorteDisenoId,RecorteGeneracionId,FamiliaUid,VersionNumero,Nombre,TipoProductoId,EstadoRevision,FechaCreacion FROM dbo.RecorteDiseno ORDER BY RecorteDisenoId DESC OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY",
            ct, ("@skip", (page - 1) * size), ("@take", size));

    public Task<IReadOnlyList<Dictionary<string, object?>>> CatalogoAsync(int page, int size,
        CancellationToken ct = default) =>
        RowsAsync("SELECT * FROM dbo.v_RecorteDisenosAprobados ORDER BY FechaDecision DESC,RecorteDisenoId DESC OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY",
            ct, ("@skip", (page - 1) * size), ("@take", size));

    public async Task<Dictionary<string, object?>?> DetalleAsync(long id, CancellationToken ct = default)
    {
        var rows = await RowsAsync("SELECT * FROM dbo.RecorteDiseno WHERE RecorteDisenoId=@id", ct, ("@id", id));
        if (rows.Count == 0) return null;
        var result = rows[0];
        result["Piezas"] = await PiezasAsync(id, ct);
        result["Asignaciones"] = await AsignacionesAsync(id, ct);
        result["InsumosComplementarios"] = await RowsAsync("SELECT * FROM dbo.RecorteDisenoInsumo WHERE RecorteDisenoId=@id", ct, ("@id", id));
        result["Costos"] = await RowsAsync("SELECT * FROM dbo.RecorteDisenoCosto WHERE RecorteDisenoId=@id", ct, ("@id", id));
        result["Imagenes"] = await RowsAsync("SELECT * FROM dbo.RecorteDisenoImagen WHERE RecorteDisenoId=@id", ct, ("@id", id));
        result["Validaciones"] = await ValidacionesAsync(id, ct);
        result["Historial"] = await RowsAsync("SELECT * FROM dbo.RecorteDisenoHistorial WHERE RecorteDisenoId=@id ORDER BY RecorteDisenoHistorialId", ct, ("@id", id));
        if (await CircuitoFabricacionInstaladoAsync(ct))
        {
            result["Certificacion"] = (await RowsAsync("SELECT * FROM dbo.RecorteDisenoCertificacion WHERE RecorteDisenoId=@id", ct, ("@id", id))).SingleOrDefault();
            result["VinculoReceta"] = (await RowsAsync("SELECT * FROM dbo.RecorteDisenoProducto WHERE RecorteDisenoId=@id", ct, ("@id", id))).SingleOrDefault();
            result["OrdenGIR"] = (await RowsAsync("SELECT * FROM dbo.OrdenProduccionGIR WHERE RecorteDisenoId=@id", ct, ("@id", id))).SingleOrDefault();
        }
        return result;
    }

    public Task<IReadOnlyList<Dictionary<string, object?>>> PiezasAsync(long id, CancellationToken ct = default) =>
        RowsAsync("SELECT * FROM dbo.RecorteDisenoPieza WHERE RecorteDisenoId=@id ORDER BY OrdenPieza", ct, ("@id", id));

    public Task<IReadOnlyList<Dictionary<string, object?>>> AsignacionesAsync(long id, CancellationToken ct = default) =>
        RowsAsync("SELECT * FROM dbo.RecorteDisenoAsignacion WHERE RecorteDisenoId=@id ORDER BY RecorteDisenoAsignacionId", ct, ("@id", id));

    public async Task<IReadOnlyList<Dictionary<string, object?>>> ValidacionesAsync(long id, CancellationToken ct = default)
    {
        var rows = await RowsAsync("SELECT * FROM dbo.RecorteDisenoValidacion WHERE RecorteDisenoId=@id ORDER BY RecorteDisenoValidacionId DESC", ct, ("@id", id));
        foreach (var row in rows)
            row["Motivos"] = await RowsAsync("SELECT RecorteDisenoValidacionMotivoId,Codigo,Detalle,Severidad,OrdenPieza,RecorteId FROM dbo.RecorteDisenoValidacionMotivo WHERE RecorteDisenoValidacionId=@id", ct,
                ("@id", row["RecorteDisenoValidacionId"]));
        return rows;
    }

    public async Task DecidirAsync(long id, string action, int userId, string? reason, CancellationToken ct = default)
    {
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var cmd = Command(c, null, "dbo.sp_RecorteDiseno_Decidir", ("@RecorteDisenoId", id),
            ("@Accion", action), ("@UsuarioId", userId), ("@Motivo", reason));
        cmd.CommandType = CommandType.StoredProcedure;
        await cmd.ExecuteNonQueryAsync(ct);
    }

    private async Task<IReadOnlyList<Dictionary<string, object?>>> RowsAsync(string sql, CancellationToken ct,
        params (string, object?)[] values)
    {
        var rows = new List<Dictionary<string, object?>>();
        await using var c = OpenConnection();
        await c.OpenAsync(ct);
        await using var cmd = Command(c, null, sql, values);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            var row = new Dictionary<string, object?>();
            for (var index = 0; index < reader.FieldCount; index++)
                row[reader.GetName(index)] = await reader.IsDBNullAsync(index, ct) ? null : reader.GetValue(index);
            rows.Add(row);
        }
        return rows;
    }
}
