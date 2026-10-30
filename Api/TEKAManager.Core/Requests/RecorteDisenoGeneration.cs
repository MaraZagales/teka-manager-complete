namespace TEKAManager.Core.Requests;

/// <summary>
/// Captura persistida y reutilizable. El identificador de generacion identifica
/// tambien al snapshot (PK compuesta de RecorteGeneracionInventario).
/// </summary>
public interface IRecorteGeneracionSnapshotPrevio
{
    Task<RecorteGeneracionSnapshot> CapturarAntesDeIaAsync(Guid solicitudUid, int usuarioId,
        IReadOnlyCollection<int> recorteIds,
        CancellationToken ct = default);
}

public interface IRecorteGeneradorPropuestas
{
    Task<RecorteDisenoGeneration> GenerarAsync(RecorteGeneracionSnapshot contexto,
        CancellationToken ct = default);
}

public interface IRecorteGeneradorConArchivos : IRecorteGeneradorPropuestas
{
    Task LimpiarArchivosAsync(RecorteDisenoGeneration generation, CancellationToken ct = default);
}

public interface IRecorteGeneracionResultadoStore
{
    Task<long> GuardarGeneracionAsync(RecorteDisenoGeneration generation,
        CancellationToken ct = default);
    Task<int> MarcarErrorAsync(long generacionId, Guid solicitudUid, int usuarioId,
        string codigo, string detalle, CancellationToken ct = default);
}

public interface IRecorteGeneracionGate
{
    Task<IAsyncDisposable> EntrarAsync(Guid solicitudUid, CancellationToken ct = default);
}

public sealed class RecorteGeneracionEnCursoException : Exception
{
    public RecorteGeneracionEnCursoException() : base("La generación ya está en curso.") { }
}

public sealed class RecorteProveedorException(string codigo, string mensaje) : Exception(mensaje)
{
    public string Codigo { get; } = codigo;
}

public sealed record RecorteGeneracionSnapshot(long GeneracionId, long SnapshotId,
    Guid SolicitudUid, DateTime FechaCapturaUtc, IReadOnlyList<RecorteCandidatoSnapshot> Recortes,
    string Estado = "PendienteGeneracion", int UsuarioId = 0);

public sealed record RecorteCandidatoSnapshot(
    int RecorteId, int InsumoId, int TipoInsumoId, int? ColorId, int? InsumoColorId,
    int EstadoRecorteId, int DepositoId, int UnidadMedidaId,
    decimal CantidadRegistrada, decimal CantidadDisponible,
    decimal? LargoMm, decimal? AnchoMm, decimal? EspesorMm,
    string? OrientacionVeta, string EstadoNombre, string UnidadNombre,
    string TipoInsumoNombre, DateTime FechaSnapshotUtc);

// Contrato interno versionado para un proveedor futuro. El proveedor no informa estado tecnico.
public sealed class RecorteDisenoGeneration
{
    public const string VersionActual = "2B.1";
    public string ContratoVersion { get; init; } = VersionActual;
    public Guid ContratoUid { get; init; }
    public long SnapshotPrevioGeneracionId { get; init; }
    public Guid SolicitudUid { get; init; }
    public int UsuarioId { get; init; }
    public string? ErrorCodigo { get; init; }
    public string? ErrorDetalle { get; init; }
    public List<int> RecortesConsiderados { get; init; } = [];
    public List<RecorteDisenoDraft> Propuestas { get; init; } = [];
}

public sealed class RecorteDisenoDraft
{
    public Guid FamiliaUid { get; init; }
    public int VersionNumero { get; init; } = 1;
    public long? VersionAnteriorId { get; init; }
    public string Nombre { get; init; } = "";
    public string Descripcion { get; init; } = "";
    public int? TipoProductoId { get; init; }
    public int? MaterialInsumoId { get; init; }
    public int? ColorId { get; init; }
    public string? AcabadoDeclarado { get; init; }
    public decimal LargoExteriorMm { get; init; }
    public decimal AnchoExteriorMm { get; init; }
    public decimal AltoExteriorMm { get; init; }
    public int CantidadSugerida { get; init; } = 1;
    public List<RecorteDisenoPiezaDraft> Piezas { get; init; } = [];
    public List<RecorteDisenoAsignacionDraft> Asignaciones { get; init; } = [];
    public List<RecorteDisenoInsumoDraft> InsumosComplementarios { get; init; } = [];
    public List<RecorteDisenoCostoDraft> Costos { get; init; } = [];
    public List<RecorteDisenoImagenDraft> Imagenes { get; init; } = [];
    public List<string> Advertencias { get; init; } = [];
    public List<string> Supuestos { get; init; } = [];
}

public sealed class RecorteDisenoPiezaDraft
{
    public int OrdenPieza { get; init; }
    public string Nombre { get; init; } = "";
    public string Origen { get; init; } = ""; // Recorte | Insumo
    public int InsumoId { get; init; }
    public int? ColorId { get; init; }
    public int Cantidad { get; init; }
    public decimal LargoMm { get; init; }
    public decimal AnchoMm { get; init; }
    public decimal EspesorMm { get; init; }
    public string OrientacionVeta { get; init; } = "Indiferente";
    public string? Observaciones { get; init; }
}

public sealed class RecorteDisenoAsignacionDraft
{
    public int OrdenPieza { get; init; }
    public int RecorteId { get; init; }
    public int CantidadPiezas { get; init; }
    public decimal PosicionXmm { get; init; }
    public decimal PosicionYmm { get; init; }
    public decimal LargoCorteMm { get; init; }
    public decimal AnchoCorteMm { get; init; }
    public bool Giro90 { get; init; }
    public decimal? AnchoSierraMm { get; init; }
    public decimal? MargenSeguridadMm { get; init; }
    public decimal? ToleranciaMm { get; init; }
}

public sealed class RecorteDisenoInsumoDraft
{
    public int InsumoId { get; init; }
    public decimal Cantidad { get; init; }
    public string? Observaciones { get; init; }
}

public sealed class RecorteDisenoCostoDraft
{
    public string Tipo { get; init; } = "";
    public int? InsumoId { get; init; }
    public decimal Cantidad { get; init; }
    public decimal? CostoUnitario { get; init; }
    public decimal? Subtotal { get; init; }
    public string? Fuente { get; init; }
    public string? ReferenciaFuente { get; init; }
    public DateTime? FechaFuente { get; init; }
    public string? MotivoIncompleto { get; init; }
}

public sealed class RecorteDisenoImagenDraft
{
    public string Referencia { get; init; } = "";
    public string Tipo { get; init; } = "";
    public string Origen { get; init; } = "";
}

public sealed class RecorteDisenoDecision
{
    public string? Motivo { get; init; }
}
