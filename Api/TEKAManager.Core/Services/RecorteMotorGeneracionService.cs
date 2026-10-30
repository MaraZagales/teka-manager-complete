using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

/// <summary>Orquesta la captura previa, el proveedor y la persistencia 2A/2B.</summary>
public sealed class RecorteMotorGeneracionService(
    IRecorteGeneracionSnapshotPrevio snapshotService,
    IRecorteGeneracionResultadoStore store,
    IRecorteGeneracionGate gate)
{
    public async Task<long> GenerarAsync(Guid solicitudUid, int usuarioId,
        IReadOnlyCollection<int> recorteIds,
        IRecorteGeneradorPropuestas proveedor, CancellationToken ct = default)
    {
        await using var generationLock = await gate.EntrarAsync(solicitudUid, ct);
        var snapshot = await snapshotService.CapturarAntesDeIaAsync(solicitudUid, usuarioId, recorteIds, ct);
        if (snapshot.Estado is "Registrada" or "ConError") return snapshot.GeneracionId;
        if (snapshot.Estado != "PendienteGeneracion")
            throw new InvalidOperationException("Estado de generacion no admitido.");
        async Task<long> GuardarConRecuperacion(RecorteDisenoGeneration result)
        {
            try { return await store.GuardarGeneracionAsync(result, ct); }
            catch
            {
                await store.MarcarErrorAsync(snapshot.GeneracionId, solicitudUid, usuarioId,
                    "ERROR_PERSISTENCIA", "No se pudieron guardar los diseños generados.", CancellationToken.None);
                throw;
            }
        }
        if (snapshot.Recortes.Count == 0)
            return await GuardarConRecuperacion(Error(snapshot, usuarioId,
                "SIN_RECORTES_ELEGIBLES", "No hay recortes fisicos unitarios elegibles."));

        RecorteDisenoGeneration response;
        try { response = await proveedor.GenerarAsync(snapshot, ct); }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            await store.MarcarErrorAsync(snapshot.GeneracionId, solicitudUid, usuarioId,
                "GENERACION_INTERRUMPIDA", "La solicitud fue interrumpida.", CancellationToken.None);
            throw;
        }
        catch (RecorteProveedorException ex)
        {
            return await GuardarConRecuperacion(Error(snapshot, usuarioId,
                ex.Codigo, ex.Message));
        }
        catch (Exception)
        {
            return await GuardarConRecuperacion(Error(snapshot, usuarioId,
                "GENERADOR_NO_DISPONIBLE", "El proveedor no devolvio propuestas."));
        }
        if (response is null || response.Propuestas is null || response.RecortesConsiderados is null ||
            response.Propuestas.Count > 5 ||
            response.ContratoVersion != RecorteDisenoGeneration.VersionActual ||
            response.ContratoUid != solicitudUid || response.SolicitudUid != solicitudUid ||
            response.SnapshotPrevioGeneracionId != snapshot.SnapshotId ||
            response.UsuarioId != usuarioId ||
            !response.RecortesConsiderados.Order().SequenceEqual(snapshot.Recortes.Select(x => x.RecorteId).Order()))
        {
            if (response is not null && proveedor is IRecorteGeneradorConArchivos files)
                try { await files.LimpiarArchivosAsync(response, CancellationToken.None); }
                catch { /* El error de contrato prevalece; los huérfanos requieren limpieza operativa. */ }
            return await GuardarConRecuperacion(Error(snapshot, usuarioId,
                "CONTRATO_PROVEEDOR_INVALIDO", "El proveedor devolvio datos ajenos al snapshot."));
        }
        try { RecorteDisenoService.ValidarContrato(response); }
        catch (Exception ex) when (ex is InvalidOperationException or ArgumentException)
        {
            if (proveedor is IRecorteGeneradorConArchivos files)
                try { await files.LimpiarArchivosAsync(response, CancellationToken.None); }
                catch { /* El error de contrato prevalece. */ }
            return await GuardarConRecuperacion(Error(snapshot, usuarioId,
                "CONTRATO_PROVEEDOR_INVALIDO", "El proveedor devolvio una propuesta incompleta."));
        }
        try { return await GuardarConRecuperacion(response); }
        catch
        {
            if (proveedor is IRecorteGeneradorConArchivos files)
                try { await files.LimpiarArchivosAsync(response, CancellationToken.None); }
                catch { /* Preservar el error de persistencia. */ }
            throw;
        }
    }

    private static RecorteDisenoGeneration Error(RecorteGeneracionSnapshot snapshot,
        int usuarioId, string code, string detail) => new()
    {
        ContratoVersion = RecorteDisenoGeneration.VersionActual,
        ContratoUid = snapshot.SolicitudUid,
        SolicitudUid = snapshot.SolicitudUid,
        SnapshotPrevioGeneracionId = snapshot.SnapshotId,
        UsuarioId = usuarioId,
        RecortesConsiderados = snapshot.Recortes.Select(x => x.RecorteId).ToList(),
        ErrorCodigo = code,
        ErrorDetalle = detail
    };
}
