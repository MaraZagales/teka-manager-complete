using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record ParametroCostoPrecioDto(int ParametroCostoPrecioId, int? TipoProductoId,
    decimal PorcentajeManoObra, decimal PorcentajeCostosFijos, decimal PorcentajeOtrosVariables,
    decimal PorcentajeMargen, bool Activo, DateTime FechaModificacion, int UsuarioModificacionId);

public sealed record GuardarParametroCostoPrecioRequest(int? TipoProductoId,
    decimal PorcentajeManoObra, decimal PorcentajeCostosFijos, decimal PorcentajeOtrosVariables,
    decimal PorcentajeMargen);

public sealed record CalculoPrecioRequest(int ProductoId, decimal CostoMateriales);

public sealed record CalculoPrecioDto(int ProductoId, int TipoProductoId, int ParametroCostoPrecioId,
    bool ConfiguracionGeneral, decimal CostoMateriales, decimal CostoManoObra,
    decimal CostosFijos, decimal OtrosVariables, decimal CostoTotal,
    decimal PorcentajeMargen, decimal PrecioSugerido, string OrigenCostoMateriales);

public sealed class ParametroCostoPrecioService
{
    private readonly TekaDbContext _db;
    public ParametroCostoPrecioService(TekaDbContext db) => _db = db;

    public async Task<List<ParametroCostoPrecioDto>> ListarAsync(CancellationToken ct = default)
    {
        var result = new List<ParametroCostoPrecioDto>();
        await using var conn = new SqlConnection(_db.Database.GetConnectionString());
        await conn.OpenAsync(ct);
        await using var cmd = new SqlCommand(@"SELECT ParametroCostoPrecioId,TipoProductoId,PorcentajeManoObra,
            PorcentajeCostosFijos,PorcentajeOtrosVariables,PorcentajeMargen,Activo,FechaModificacion,
            UsuarioModificacionId FROM dbo.ParametroCostoPrecio WHERE Activo=1
            ORDER BY CASE WHEN TipoProductoId IS NULL THEN 0 ELSE 1 END,TipoProductoId", conn);
        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) result.Add(Leer(reader));
        return result;
    }

    public async Task<ParametroCostoPrecioDto> GuardarAsync(GuardarParametroCostoPrecioRequest r, int usuarioId, CancellationToken ct = default)
    {
        Validar(r);
        if (usuarioId <= 0) throw new ArgumentException("Usuario no identificado.");
        await using var conn = new SqlConnection(_db.Database.GetConnectionString());
        await conn.OpenAsync(ct);
        await using var tx = (SqlTransaction)await conn.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            // UPDLOCK + HOLDLOCK y los indices filtrados evitan configuraciones activas duplicadas.
            await using var cmd = new SqlCommand(@"
                IF @TipoProductoId IS NOT NULL AND NOT EXISTS
                    (SELECT 1 FROM dbo.TipoProducto WHERE TipoProductoId=@TipoProductoId AND Activo=1)
                    THROW 53101, 'Tipo de producto inexistente o inactivo.', 1;
                DECLARE @Id int;
                SELECT @Id=ParametroCostoPrecioId FROM dbo.ParametroCostoPrecio WITH (UPDLOCK,HOLDLOCK)
                WHERE Activo=1 AND ((TipoProductoId=@TipoProductoId) OR (TipoProductoId IS NULL AND @TipoProductoId IS NULL));
                DECLARE @Accion varchar(12)=CASE WHEN @Id IS NULL THEN 'CREAR' ELSE 'MODIFICAR' END;
                IF @Id IS NULL
                BEGIN
                    INSERT dbo.ParametroCostoPrecio(TipoProductoId,PorcentajeManoObra,PorcentajeCostosFijos,
                        PorcentajeOtrosVariables,PorcentajeMargen,Activo,UsuarioModificacionId)
                    VALUES(@TipoProductoId,@ManoObra,@Fijos,@Variables,@Margen,1,@UsuarioId);
                    SET @Id=CONVERT(int,SCOPE_IDENTITY());
                END
                ELSE
                    UPDATE dbo.ParametroCostoPrecio SET PorcentajeManoObra=@ManoObra,
                        PorcentajeCostosFijos=@Fijos,PorcentajeOtrosVariables=@Variables,
                        PorcentajeMargen=@Margen,FechaModificacion=SYSUTCDATETIME(),
                        UsuarioModificacionId=@UsuarioId WHERE ParametroCostoPrecioId=@Id;
                INSERT dbo.ParametroCostoPrecioAuditoria(ParametroCostoPrecioId,TipoProductoId,
                    PorcentajeManoObra,PorcentajeCostosFijos,PorcentajeOtrosVariables,PorcentajeMargen,
                    Activo,Accion,UsuarioId)
                VALUES(@Id,@TipoProductoId,@ManoObra,@Fijos,@Variables,@Margen,1,@Accion,@UsuarioId);
                SELECT ParametroCostoPrecioId,TipoProductoId,PorcentajeManoObra,PorcentajeCostosFijos,
                    PorcentajeOtrosVariables,PorcentajeMargen,Activo,FechaModificacion,UsuarioModificacionId
                FROM dbo.ParametroCostoPrecio WHERE ParametroCostoPrecioId=@Id;",conn,tx);
            Param(cmd,"@TipoProductoId",(object?)r.TipoProductoId??DBNull.Value);
            Param(cmd,"@ManoObra",r.PorcentajeManoObra); Param(cmd,"@Fijos",r.PorcentajeCostosFijos);
            Param(cmd,"@Variables",r.PorcentajeOtrosVariables); Param(cmd,"@Margen",r.PorcentajeMargen);
            Param(cmd,"@UsuarioId",usuarioId);
            ParametroCostoPrecioDto dto;
            await using (var rd=await cmd.ExecuteReaderAsync(ct))
            {
                if(!await rd.ReadAsync(ct)) throw new InvalidOperationException("No se guardó la configuración.");
                dto=Leer(rd);
            }
            await tx.CommitAsync(ct);
            return dto;
        }
        catch { await tx.RollbackAsync(CancellationToken.None); throw; }
    }

    public async Task<CalculoPrecioDto> CalcularConCostoInformadoAsync(CalculoPrecioRequest request, CancellationToken ct=default)
    {
        if(request.ProductoId<=0 || request.CostoMateriales<=0 || decimal.Round(request.CostoMateriales,2)!=request.CostoMateriales)
            throw new ArgumentException("Producto válido y costo de materiales positivo, con dos decimales, requeridos.");
        await using var conn=new SqlConnection(_db.Database.GetConnectionString());
        await conn.OpenAsync(ct);
        await using var cmd=new SqlCommand(@"
            SELECT TOP(1) p.TipoProductoId, pc.ParametroCostoPrecioId,pc.TipoProductoId,
                pc.PorcentajeManoObra,pc.PorcentajeCostosFijos,pc.PorcentajeOtrosVariables,pc.PorcentajeMargen
            FROM dbo.Producto p
            JOIN dbo.ParametroCostoPrecio pc ON pc.Activo=1 AND (pc.TipoProductoId=p.TipoProductoId OR pc.TipoProductoId IS NULL)
            WHERE p.ProductoId=@ProductoId AND p.Activo=1
            ORDER BY CASE WHEN pc.TipoProductoId=p.TipoProductoId THEN 0 ELSE 1 END",conn);
        Param(cmd,"@ProductoId",request.ProductoId);
        await using var rd=await cmd.ExecuteReaderAsync(ct);
        if(!await rd.ReadAsync(ct)) throw new KeyNotFoundException("Producto inexistente, inactivo o sin parámetros de costos configurados.");
        var tipo=rd.GetInt32(0); var id=rd.GetInt32(1);var general=rd.IsDBNull(2);
        var mano=rd.GetDecimal(3);var fijos=rd.GetDecimal(4);var variables=rd.GetDecimal(5);var margen=rd.GetDecimal(6);
        var baseCosto=request.CostoMateriales;
        var cm=decimal.Round(baseCosto*mano/100m,2,MidpointRounding.AwayFromZero);
        var cf=decimal.Round(baseCosto*fijos/100m,2,MidpointRounding.AwayFromZero);
        var cv=decimal.Round(baseCosto*variables/100m,2,MidpointRounding.AwayFromZero);
        var total=baseCosto+cm+cf+cv;
        var sugerido=decimal.Round(total/(1m-margen/100m),2,MidpointRounding.AwayFromZero);
        return new(request.ProductoId,tipo,id,general,baseCosto,cm,cf,cv,total,margen,sugerido,"INFORMADO_MANUALMENTE_NO_VERIFICADO");
    }

    private static void Validar(GuardarParametroCostoPrecioRequest r)
    {
        if(r.TipoProductoId is <=0 || r.PorcentajeManoObra<0 || r.PorcentajeManoObra>1000 ||
           r.PorcentajeCostosFijos<0 || r.PorcentajeCostosFijos>1000 ||
           r.PorcentajeOtrosVariables<0 || r.PorcentajeOtrosVariables>1000 ||
           r.PorcentajeMargen<0 || r.PorcentajeMargen>=100 ||
           new[]{r.PorcentajeManoObra,r.PorcentajeCostosFijos,r.PorcentajeOtrosVariables,r.PorcentajeMargen}
             .Any(x=>decimal.Round(x,2)!=x))
            throw new ArgumentException("Porcentajes inválidos. Costos: 0 a 1000; margen: 0 a menos de 100; máximo dos decimales.");
    }
    private static void Param(SqlCommand cmd,string name,object value) => cmd.Parameters.AddWithValue(name,value);
    private static ParametroCostoPrecioDto Leer(SqlDataReader r) => new(
        r.GetInt32(0),r.IsDBNull(1)?null:r.GetInt32(1),r.GetDecimal(2),r.GetDecimal(3),
        r.GetDecimal(4),r.GetDecimal(5),r.GetBoolean(6),r.GetDateTime(7),r.GetInt32(8));
}
