using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace TEKAManager.API.Services;

public sealed partial class CajaSqlService
{
    // Consulta de lectura sobre el esquema instalado: no requiere cambiar procedimientos.
    public async Task<CajaDiariaEstado> ConsultarEstadoDiarioAsync(CancellationToken ct, long? consultaSesionId = null)
    {
        await using var connection = new SqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync(ct);
        await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var query=EstadoDiarioSql;
        if(await ConceptosDisponiblesAsync(ct))query=query.Replace("m.Importe,m.Concepto,m.Referencia","m.Importe,m.Concepto,(SELECT Nombre FROM dbo.CajaConcepto WHERE CajaConceptoId=m.CajaConceptoId) ConceptoClasificado,m.Referencia",StringComparison.Ordinal);
        await using var command = new SqlCommand(query, connection, transaction) { CommandTimeout = 30 };
        command.Parameters.Add("@ConsultaSesionId", SqlDbType.BigInt).Value = (object?)consultaSesionId ?? DBNull.Value;
        var json = (string?)await command.ExecuteScalarAsync(ct);
        var estado = JsonSerializer.Deserialize<CajaDiariaEstado>(json ?? "null")
            ?? throw new InvalidOperationException("No se pudo consultar el estado de Caja Principal.");
        await transaction.CommitAsync(ct);
        estado.TiposMovimiento = TiposManuales;
        return estado;
    }

    public static readonly CajaTipoManual[] TiposManuales = [
        new("IngresoManual", "Ingreso manual", "Ingreso"),
        new("Gasto", "Gasto", "Egreso"),
        new("Retiro", "Retiro de efectivo", "Egreso"),
        new("Reposicion", "Reposición de efectivo", "Ingreso")
    ];

    internal const string EstadoDiarioSql = """
        SET NOCOUNT ON;
        IF (SELECT COUNT(*) FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId
            WHERE cfg.EsFisica=1 AND c.Activo=1) <> 1
            THROW 51022, 'Debe existir una única caja física activa configurada para operar.', 1;
        DECLARE @CajaId int, @SesionId bigint;
        SELECT @CajaId=c.CajaId FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId
            WHERE cfg.EsFisica=1 AND c.Activo=1;
        SELECT @SesionId=CajaSesionId FROM dbo.CajaSesion WHERE CajaId=@CajaId
            AND ((@ConsultaSesionId IS NULL AND Estado='Abierta') OR CajaSesionId=@ConsultaSesionId);
        SELECT (SELECT
            JSON_QUERY((SELECT c.CajaId,c.Nombre,cfg.FondoFijoObjetivo
                FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId
                WHERE c.CajaId=@CajaId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES)) AS Caja,
            JSON_QUERY((SELECT s.CajaSesionId,s.FechaApertura,s.EfectivoInicial,s.FondoObjetivoApertura,
                COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) AS Responsable,
                s.ObservacionApertura,s.Estado,s.FechaCierre,s.EfectivoEsperadoCierre,s.EfectivoContadoCierre,s.DiferenciaCierre,s.ObservacionCierre,
                COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(uc.Nombre,' ',uc.Apellido))),''),uc.Username) AS ResponsableCierre,
                COALESCE(m.Ingresos,0) AS Ingresos,COALESCE(m.Egresos,0) AS Egresos,
                s.EfectivoInicial+COALESCE(m.Ingresos,0)-COALESCE(m.Egresos,0) AS EfectivoEsperado
                FROM dbo.CajaSesion s JOIN dbo.Usuario u ON u.UsuarioId=s.UsuarioAperturaId
                LEFT JOIN dbo.Usuario uc ON uc.UsuarioId=s.UsuarioCierreId
                OUTER APPLY (SELECT SUM(CASE WHEN Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE 0 END) Ingresos,
                    SUM(CASE WHEN Tipo IN ('Gasto','Retiro') THEN Importe ELSE 0 END) Egresos
                    FROM dbo.CajaMovimiento WHERE CajaSesionId=s.CajaSesionId) m
                WHERE s.CajaSesionId=@SesionId FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES)) AS Sesion,
            JSON_QUERY(COALESCE((SELECT m.CajaMovimientoId,m.Fecha,m.Tipo,
                CASE WHEN m.Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN 'Ingreso' ELSE 'Egreso' END AS Sentido,
                m.Importe,m.Concepto,m.Referencia,m.Observaciones,
                COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) AS Responsable
                FROM dbo.CajaMovimiento m JOIN dbo.Usuario u ON u.UsuarioId=m.UsuarioId
                WHERE m.CajaSesionId=@SesionId ORDER BY m.Fecha DESC,m.CajaMovimientoId DESC
                FOR JSON PATH, INCLUDE_NULL_VALUES),N'[]')) AS Movimientos,
            JSON_QUERY((SELECT TOP(1) a.CajaArqueoId,a.Fecha,a.EfectivoEsperado,a.EfectivoContado,a.Diferencia,a.Observaciones,
                COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) AS Responsable,
                CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.CajaMovimiento m WHERE m.CajaSesionId=a.CajaSesionId
                    AND (a.UltimoMovimientoId IS NULL OR m.CajaMovimientoId>a.UltimoMovimientoId)) THEN 0 ELSE 1 END AS bit) AS Vigente
                FROM dbo.CajaArqueo a JOIN dbo.Usuario u ON u.UsuarioId=a.UsuarioId
                WHERE a.CajaSesionId=@SesionId ORDER BY a.CajaArqueoId DESC
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES)) AS UltimoArqueo
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES) AS EstadoJson;
        """;
}

public sealed record CajaTipoManual(string Codigo, string Descripcion, string Sentido);
public sealed class CajaDiariaEstado
{
    public CajaDiariaConfiguracion Caja { get; set; } = null!;
    public CajaDiariaSesion? Sesion { get; set; }
    public List<CajaDiariaMovimiento> Movimientos { get; set; } = [];
    public CajaDiariaArqueo? UltimoArqueo { get; set; }
    public CajaTipoManual[] TiposMovimiento { get; set; } = [];
}
public sealed class CajaDiariaConfiguracion
{
    public int CajaId { get; set; }
    public string Nombre { get; set; } = "";
    public decimal? FondoFijoObjetivo { get; set; }
}
public sealed class CajaDiariaSesion
{
    public string Estado { get; set; } = "";
    public DateTime? FechaCierre { get; set; }
    public string? ResponsableCierre { get; set; }
    public decimal? EfectivoEsperadoCierre { get; set; }
    public decimal? EfectivoContadoCierre { get; set; }
    public decimal? DiferenciaCierre { get; set; }
    public string? ObservacionCierre { get; set; }
    public long CajaSesionId { get; set; }
    public DateTime FechaApertura { get; set; }
    public string Responsable { get; set; } = "";
    public decimal FondoObjetivoApertura { get; set; }
    public decimal EfectivoInicial { get; set; }
    public decimal Ingresos { get; set; }
    public decimal Egresos { get; set; }
    public decimal EfectivoEsperado { get; set; }
    public string? ObservacionApertura { get; set; }
}
public sealed class CajaDiariaMovimiento
{
    public string? ConceptoClasificado {get;set;}
    public long CajaMovimientoId { get; set; }
    public DateTime Fecha { get; set; }
    public string Tipo { get; set; } = "";
    public string Sentido { get; set; } = "";
    public decimal Importe { get; set; }
    public string Concepto { get; set; } = "";
    public string? Referencia { get; set; }
    public string? Observaciones { get; set; }
    public string Responsable { get; set; } = "";
}
public sealed class CajaDiariaArqueo
{
    public long CajaArqueoId { get; set; }
    public DateTime Fecha { get; set; }
    public decimal EfectivoEsperado { get; set; }
    public decimal EfectivoContado { get; set; }
    public decimal Diferencia { get; set; }
    public string? Observaciones { get; set; }
    public string Responsable { get; set; } = "";
    public bool Vigente { get; set; }
}
