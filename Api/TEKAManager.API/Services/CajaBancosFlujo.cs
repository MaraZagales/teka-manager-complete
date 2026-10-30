using System.Data;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace TEKAManager.API.Services;

public sealed partial class CajaSqlService
{
    public const string BancoConsultaSql="""
        SELECT b.*,i.NombreArchivo,COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,' ',u.Apellido))),''),u.Username) ResponsableImportacion,c.MovimientoFinancieroId,c.FechaConciliacion,c.Metodo,c.Observaciones ObservacionConciliacion,
          COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(uc.Nombre,' ',uc.Apellido))),''),uc.Username) ResponsableConciliacion,m.Concepto ConceptoInterno,m.ReferenciaExterna ReferenciaInterna,
          CASE WHEN b.Estado='Pendiente' AND p.Cantidad=0 THEN 'SinCoincidencia' ELSE b.Estado END EstadoConsulta,
          p.Cantidad Coincidencias INTO #Bancarios
        FROM dbo.BancoMovimiento b JOIN dbo.BancoImportacion i ON i.BancoImportacionId=b.BancoImportacionId
        JOIN dbo.Usuario u ON u.UsuarioId=i.UsuarioId
        LEFT JOIN dbo.BancoConciliacion c ON c.BancoMovimientoId=b.BancoMovimientoId
        LEFT JOIN dbo.Usuario uc ON uc.UsuarioId=c.UsuarioId
        LEFT JOIN dbo.MovimientoFinanciero m ON m.MovimientoFinancieroId=c.MovimientoFinancieroId
        OUTER APPLY(SELECT COUNT(*) Cantidad FROM dbo.MovimientoFinanciero f
          WHERE f.CuentaBancariaId=b.CuentaBancariaId AND f.Tipo=b.Tipo AND f.Importe=b.Importe AND f.Estado='Registrado'
          AND NULLIF(LTRIM(RTRIM(f.ReferenciaExterna)),'') IS NOT NULL AND LTRIM(RTRIM(f.ReferenciaExterna))=LTRIM(RTRIM(b.ReferenciaBanco))
          AND ABS(DATEDIFF(day,f.FechaOperacion,b.FechaMovimiento))<=@Dias
          AND NOT EXISTS(SELECT 1 FROM dbo.BancoConciliacion z WHERE z.MovimientoFinancieroId=f.MovimientoFinancieroId)) p
        WHERE b.CuentaBancariaId=@Cuenta AND (@Desde IS NULL OR b.FechaMovimiento>=@Desde) AND (@Hasta IS NULL OR b.FechaMovimiento<=@Hasta)
          AND (@Buscar IS NULL OR CHARINDEX(@Buscar,CONCAT(b.Descripcion,' ',b.ReferenciaBanco,' ',i.NombreArchivo))>0);
        SELECT (SELECT (SELECT COUNT_BIG(*) FROM #Bancarios WHERE @Estado IS NULL OR EstadoConsulta=@Estado OR (@Estado='Pendiente' AND Estado='Pendiente')) Total,
          JSON_QUERY(COALESCE((SELECT * FROM #Bancarios WHERE @Estado IS NULL OR EstadoConsulta=@Estado OR (@Estado='Pendiente' AND Estado='Pendiente')
            ORDER BY FechaMovimiento DESC,BancoMovimientoId DESC OFFSET (CONVERT(bigint,@Pagina)-1)*@Tamano ROWS FETCH NEXT @Tamano ROWS ONLY FOR JSON PATH,INCLUDE_NULL_VALUES),'[]')) Filas,
          JSON_QUERY((SELECT COUNT_BIG(*) Cantidad,COALESCE(SUM(CASE WHEN Estado='Conciliado' THEN 1 ELSE 0 END),0) Conciliados,
            COALESCE(SUM(CASE WHEN Estado='Pendiente' THEN 1 ELSE 0 END),0) Pendientes,
            COALESCE(SUM(CASE WHEN EstadoConsulta='SinCoincidencia' THEN 1 ELSE 0 END),0) SinCoincidencia,
            COALESCE(SUM(CASE WHEN Tipo='Ingreso' THEN Importe ELSE 0 END),0) Ingresos,
            COALESCE(SUM(CASE WHEN Tipo='Egreso' THEN Importe ELSE 0 END),0) Egresos FROM #Bancarios FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)) Resumen
          FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
        """;
    public const string BancoCandidatosSql="""
        SELECT COALESCE((SELECT m.MovimientoFinancieroId,m.FechaOperacion,m.Tipo,m.Importe,m.Concepto,m.ReferenciaExterna,
          CAST(CASE WHEN NULLIF(LTRIM(RTRIM(m.ReferenciaExterna)),'') IS NOT NULL AND LTRIM(RTRIM(m.ReferenciaExterna))=LTRIM(RTRIM(b.ReferenciaBanco)) THEN 1 ELSE 0 END AS bit) ReferenciaCoincide,
          CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.BancoMovimiento otro WHERE otro.BancoMovimientoId<>b.BancoMovimientoId
            AND otro.CuentaBancariaId=b.CuentaBancariaId AND otro.Tipo=b.Tipo AND otro.Importe=b.Importe AND otro.Estado='Pendiente'
            AND NULLIF(LTRIM(RTRIM(m.ReferenciaExterna)),'') IS NOT NULL AND LTRIM(RTRIM(otro.ReferenciaBanco))=LTRIM(RTRIM(m.ReferenciaExterna))
            AND ABS(DATEDIFF(day,m.FechaOperacion,otro.FechaMovimiento))<=@Dias) THEN 1 ELSE 0 END AS bit) Compartido
        FROM dbo.BancoMovimiento b JOIN dbo.MovimientoFinanciero m ON m.CuentaBancariaId=b.CuentaBancariaId AND m.Tipo=b.Tipo AND m.Importe=b.Importe
        WHERE b.BancoMovimientoId=@Id AND b.Estado='Pendiente' AND m.Estado='Registrado'
          AND ABS(DATEDIFF(day,m.FechaOperacion,b.FechaMovimiento))<=@Dias
          AND NOT EXISTS(SELECT 1 FROM dbo.BancoConciliacion c WHERE c.MovimientoFinancieroId=m.MovimientoFinancieroId)
        ORDER BY m.FechaOperacion,m.MovimientoFinancieroId FOR JSON PATH,INCLUDE_NULL_VALUES),'[]')
        """;

    public static string BancoHash(string text)=>Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(text)));
    public static List<BancoFilaValidada> ValidarExtracto(BancoExtractoRequest r)
    {
        if(r.CuentaBancariaId<=0||string.IsNullOrWhiteSpace(r.NombreArchivo)||r.NombreArchivo.Length>255||r.Filas is null||r.Filas.Count is <1 or >1000)
            throw new ArgumentException("Seleccioná una cuenta y un extracto de entre 1 y 1000 filas.");
        var rows=new List<BancoFilaValidada>();
        var seen=new Dictionary<string,string>();
        for(var index=0;index<r.Filas.Count;index++){
            var row=r.Filas[index];
            if(!DateOnly.TryParseExact(row.Fecha,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var date)
              ||row.Tipo is not("Ingreso" or "Egreso")||row.Importe<=0||row.Importe>999999999999.99m||decimal.Round(row.Importe,2)!=row.Importe
              ||string.IsNullOrWhiteSpace(row.IdBanco)||row.IdBanco.Length>150||string.IsNullOrWhiteSpace(row.Descripcion)||row.Descripcion.Length>500||(row.Referencia?.Length??0)>150)
                throw new ArgumentException($"Fila {index+2}: revisá fecha ISO, tipo, importe positivo, identificador bancario y longitudes.");
            var normalized=row with {IdBanco=row.IdBanco.Trim(),Descripcion=row.Descripcion.Trim(),Referencia=string.IsNullOrWhiteSpace(row.Referencia)?null:row.Referencia.Trim()};
            var key=BancoHash($"{r.CuentaBancariaId}|{normalized.IdBanco}");
            var signature=JsonSerializer.Serialize(normalized);
            var duplicate=seen.TryGetValue(key,out var previous);
            if(duplicate&&previous!=signature)throw new ArgumentException($"Fila {index+2}: el mismo identificador bancario tiene datos diferentes.");
            seen[key]=signature;rows.Add(new(normalized,key,duplicate));
        }
        return rows;
    }

    private static async Task<object?> BancoScalar(SqlConnection connection,SqlTransaction? transaction,string query,Dictionary<string,object?> values,CancellationToken ct)
    {
        await using var command=new SqlCommand(query,connection,transaction){CommandTimeout=60};
        foreach(var(key,value)in values)command.Parameters.AddWithValue("@"+key,value??DBNull.Value);
        return await command.ExecuteScalarAsync(ct);
    }
    private static async Task<bool> FilaExistente(SqlConnection connection,SqlTransaction? transaction,int account,BancoFilaValidada row,CancellationToken ct)
    {
        var raw=await BancoScalar(connection,transaction,"""
            SELECT (SELECT FechaMovimiento,Tipo,Importe,Descripcion,ReferenciaBanco FROM dbo.BancoMovimiento WITH(UPDLOCK,HOLDLOCK)
              WHERE CuentaBancariaId=@Cuenta AND ClaveMovimiento=@Clave FOR JSON PATH,WITHOUT_ARRAY_WRAPPER,INCLUDE_NULL_VALUES)
            """,new(){["Cuenta"]=account,["Clave"]=row.Clave},ct);
        if(raw is not string json||string.IsNullOrWhiteSpace(json))return false;
        using var document=JsonDocument.Parse(json);var root=document.RootElement;
        var reference=root.GetProperty("ReferenciaBanco").ValueKind==JsonValueKind.Null?null:root.GetProperty("ReferenciaBanco").GetString();
        if(root.GetProperty("FechaMovimiento").GetString()!=row.Fila.Fecha||root.GetProperty("Tipo").GetString()!=row.Fila.Tipo||root.GetProperty("Importe").GetDecimal()!=row.Fila.Importe
          ||root.GetProperty("Descripcion").GetString()!=row.Fila.Descripcion||reference!=row.Fila.Referencia)
            throw new ArgumentException("Un identificador bancario ya registrado tiene datos diferentes. Revisá el extracto; no se reemplazaron registros.");
        return true;
    }
    public async Task<object> ProcesarExtractoAsync(BancoExtractoRequest r,int usuario,bool confirmar,CancellationToken ct)
    {
        var rows=ValidarExtracto(r);
        var hash=BancoHash(JsonSerializer.Serialize(rows.Select(row=>row.Fila)));
        await using var connection=new SqlConnection(db.Database.GetConnectionString());await connection.OpenAsync(ct);
        await using var transaction=(SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable,ct);
        var active=await BancoScalar(connection,transaction,"SELECT COUNT(*) FROM dbo.CuentaBancariaTEKA WITH(UPDLOCK,HOLDLOCK) WHERE CuentaBancariaId=@Cuenta AND Activa=1",new(){["Cuenta"]=r.CuentaBancariaId},ct);
        if(Convert.ToInt32(active)!=1)throw new ArgumentException("La cuenta bancaria no está activa.");
        var fileExists=Convert.ToInt32(await BancoScalar(connection,transaction,"SELECT COUNT(*) FROM dbo.BancoImportacion WHERE CuentaBancariaId=@Cuenta AND HuellaArchivo=@Huella",new(){["Cuenta"]=r.CuentaBancariaId,["Huella"]=hash},ct))>0;
        var preview=new List<object>();var insert=new List<BancoFilaValidada>();
        foreach(var row in rows){var exists=await FilaExistente(connection,transaction,r.CuentaBancariaId,row,ct);var repeated=row.Duplicada||exists;preview.Add(new{row.Fila.Fecha,row.Fila.Tipo,row.Fila.Importe,row.Fila.Descripcion,row.Fila.Referencia,row.Fila.IdBanco,duplicada=repeated});if(!repeated)insert.Add(row);}
        if(!confirmar){await transaction.CommitAsync(ct);return new{huella=hash,archivoDuplicado=fileExists,filas=preview,nuevas=insert.Count,duplicadas=rows.Count-insert.Count};}
        if(fileExists||insert.Count==0)throw new ArgumentException("El extracto o todos sus movimientos ya están registrados.");
        if(usuario<=0)throw new ArgumentException("Usuario responsable inválido.");
        // Los SP instalados se ejecutan en UNA conexión/transacción; ningún lote parcial queda confirmado.
        var lotRaw=await BancoScalar(connection,transaction,"EXEC dbo.sp_Banco_CrearImportacion @CuentaBancariaId=@Cuenta,@NombreArchivo=@Nombre,@HuellaArchivo=@Huella,@UsuarioId=@Usuario",new(){["Cuenta"]=r.CuentaBancariaId,["Nombre"]=r.NombreArchivo,["Huella"]=hash,["Usuario"]=usuario},ct);
        var lot=Convert.ToInt64(lotRaw);
        foreach(var row in insert)await BancoScalar(connection,transaction,"EXEC dbo.sp_Banco_AgregarMovimiento @BancoImportacionId=@Lote,@FechaMovimiento=@Fecha,@Tipo=@Tipo,@Importe=@Importe,@Descripcion=@Descripcion,@ReferenciaBanco=@Referencia,@ClaveMovimiento=@Clave",new(){["Lote"]=lot,["Fecha"]=DateTime.ParseExact(row.Fila.Fecha,"yyyy-MM-dd",CultureInfo.InvariantCulture),["Tipo"]=row.Fila.Tipo,["Importe"]=row.Fila.Importe,["Descripcion"]=row.Fila.Descripcion,["Referencia"]=row.Fila.Referencia,["Clave"]=row.Clave},ct);
        await BancoScalar(connection,transaction,"EXEC dbo.sp_Banco_FinalizarImportacion @BancoImportacionId=@Lote",new(){["Lote"]=lot},ct);
        await transaction.CommitAsync(ct);return new{bancoImportacionId=lot,importadas=insert.Count,duplicadas=rows.Count-insert.Count};
    }
    public async Task<object> ConciliarValidadoAsync(long bank,long financial,int user,int days,string? notes,CancellationToken ct)
    {
        if(bank<=0||financial<=0||user<=0||days is <0 or >30||(notes?.Length??0)>500)throw new ArgumentException("Revisá la conciliación y la tolerancia de fechas.");
        await using var connection=new SqlConnection(db.Database.GetConnectionString());await connection.OpenAsync(ct);
        await using var transaction=(SqlTransaction)await connection.BeginTransactionAsync(IsolationLevel.Serializable,ct);
        var valid=await BancoScalar(connection,transaction,"""
            SELECT CASE WHEN NULLIF(LTRIM(RTRIM(m.ReferenciaExterna)),'') IS NOT NULL AND LTRIM(RTRIM(m.ReferenciaExterna))=LTRIM(RTRIM(b.ReferenciaBanco)) THEN 1 ELSE 2 END
            FROM dbo.BancoMovimiento b WITH(UPDLOCK,HOLDLOCK) JOIN dbo.MovimientoFinanciero m WITH(UPDLOCK,HOLDLOCK)
              ON m.CuentaBancariaId=b.CuentaBancariaId AND m.Tipo=b.Tipo AND m.Importe=b.Importe
            JOIN dbo.CuentaBancariaTEKA a ON a.CuentaBancariaId=b.CuentaBancariaId AND a.Activa=1
            WHERE b.BancoMovimientoId=@Banco AND m.MovimientoFinancieroId=@Interno AND b.Estado='Pendiente' AND m.Estado='Registrado'
              AND ABS(DATEDIFF(day,m.FechaOperacion,b.FechaMovimiento))<=@Dias
            """,new(){["Banco"]=bank,["Interno"]=financial,["Dias"]=days},ct);
        if(valid is null||valid==DBNull.Value)throw new ArgumentException("Cuenta, signo, importe, fechas o estados no coinciden. Actualizá la consulta.");
        if(Convert.ToInt32(valid)==2&&string.IsNullOrWhiteSpace(notes))throw new ArgumentException("Las referencias no coinciden. Justificá la conciliación manual.");
        await BancoScalar(connection,transaction,"EXEC dbo.sp_Banco_Conciliar @BancoMovimientoId=@Banco,@MovimientoFinancieroId=@Interno,@UsuarioId=@Usuario,@Metodo='Manual',@Observaciones=@Notas",new(){["Banco"]=bank,["Interno"]=financial,["Usuario"]=user,["Notas"]=notes?.Trim()},ct);
        await transaction.CommitAsync(ct);return new{conciliado=true};
    }
}
public sealed record BancoExtractoFila(string Fecha,string Tipo,decimal Importe,string Descripcion,string? Referencia,string IdBanco);
public sealed record BancoExtractoRequest(int CuentaBancariaId,string NombreArchivo,List<BancoExtractoFila>? Filas);
public sealed record BancoFilaValidada(BancoExtractoFila Fila,string Clave,bool Duplicada);
