using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record TechnicalTemplateMaterialRequest(string Key,string CodigoRol,string Nombre,int TipoInsumoId,string OrigenColor,int? ColorId,decimal EspesorMm,string? Observaciones);
public sealed record TechnicalTemplatePieceRequest(string MaterialKey,int Orden,string NombrePieza,int Cantidad,string BaseLargo,decimal FactorLargo,decimal AjusteLargoMm,string BaseAncho,decimal FactorAncho,decimal AjusteAnchoMm,string OrientacionVeta,string? CantosTerminados,string? Observaciones);
public sealed record TechnicalTemplateSaveRequest(int? PlantillaDespieceId,string Codigo,string Nombre,string? Descripcion,int TipoProductoId,int? NombreProductoId,string? Observaciones,List<TechnicalTemplateMaterialRequest> Materiales,List<TechnicalTemplatePieceRequest> Piezas);
public sealed record TechnicalTemplateSummary(int PlantillaDespieceId,string Codigo,string Nombre,string? Descripcion,int TipoProductoId,string TipoProducto,int? NombreProductoId,string? Familia,bool Activa,int? PlantillaDespieceVersionId,int? NumeroVersion,string? Estado,int Materiales,int Piezas);
public sealed record TechnicalTemplateMaterialDto(int PlantillaDespieceMaterialId,string Key,string CodigoRol,string Nombre,int TipoInsumoId,string OrigenColor,int? ColorId,decimal EspesorMm,string? Observaciones);
public sealed record TechnicalTemplatePieceDto(int PlantillaDespiecePiezaReglaId,string MaterialKey,int Orden,string NombrePieza,int Cantidad,string BaseLargo,decimal FactorLargo,decimal AjusteLargoMm,string BaseAncho,decimal FactorAncho,decimal AjusteAnchoMm,string OrientacionVeta,string? CantosTerminados,string? Observaciones);
public sealed record TechnicalTemplateDetail(TechnicalTemplateSummary Cabecera,string? Observaciones,List<TechnicalTemplateMaterialDto> Materiales,List<TechnicalTemplatePieceDto> Piezas);
public sealed record BoardFormatDto(int FormatoPlacaInsumoId,int InsumoId,string InsumoCodigo,string Insumo,string Codigo,string Nombre,decimal LargoMm,decimal AnchoMm,decimal EspesorMm,string OrientacionVeta,int TipoRecorteId,string TipoRecorte,bool Predeterminado,bool Activo);
public sealed record BoardFormatSaveRequest(int? FormatoPlacaInsumoId,int InsumoId,string Codigo,string Nombre,decimal LargoMm,decimal AnchoMm,decimal EspesorMm,string OrientacionVeta,int TipoRecorteId,bool Predeterminado);
public sealed record CutParameterDto(int ParametroCorteProduccionId,string Nombre,int NumeroVersion,decimal AnchoSierraMm,decimal MargenSeguridadMm,decimal LargoMinimoRecuperableMm,decimal AnchoMinimoRecuperableMm,decimal AreaMinimaRecuperableMm2,bool Activo,DateTime FechaCreacion);
public sealed record CutParameterSaveRequest(string Nombre,decimal AnchoSierraMm,decimal MargenSeguridadMm,decimal LargoMinimoRecuperableMm,decimal AnchoMinimoRecuperableMm,decimal AreaMinimaRecuperableMm2,bool Activar);
public sealed record ProductionCutTypeDto(int TipoRecorteId,string Nombre,bool Activo);

public sealed class ProductionTechnicalCatalogService(TekaDbContext db)
{
    public async Task<List<TechnicalTemplateSummary>> ListTemplatesAsync(CancellationToken ct=default)
    {
        var result=new List<TechnicalTemplateSummary>();
        await using var cn=Connection(); await cn.OpenAsync(ct);
        await using var cmd=new SqlCommand("""
          SELECT t.PlantillaDespieceId,t.Codigo,t.Nombre,t.Descripcion,t.TipoProductoId,tp.Nombre,
           t.NombreProductoId,np.Nombre,t.Activa,v.PlantillaDespieceVersionId,v.NumeroVersion,v.Estado,
           (SELECT COUNT(*) FROM dbo.PlantillaDespieceMaterial m WHERE m.PlantillaDespieceVersionId=v.PlantillaDespieceVersionId),
           (SELECT COUNT(*) FROM dbo.PlantillaDespiecePiezaRegla p WHERE p.PlantillaDespieceVersionId=v.PlantillaDespieceVersionId)
          FROM dbo.PlantillaDespiece t JOIN dbo.TipoProducto tp ON tp.TipoProductoId=t.TipoProductoId
          LEFT JOIN dbo.NombreProductoCatalogo np ON np.NombreProductoId=t.NombreProductoId
          OUTER APPLY(SELECT TOP(1) x.* FROM dbo.PlantillaDespieceVersion x WHERE x.PlantillaDespieceId=t.PlantillaDespieceId ORDER BY CASE x.Estado WHEN 'Borrador' THEN 0 WHEN 'Aprobada' THEN 1 ELSE 2 END,x.NumeroVersion DESC)v
          ORDER BY t.Nombre,t.PlantillaDespieceId
          """,cn);
        await using var r=await cmd.ExecuteReaderAsync(ct);
        while(await r.ReadAsync(ct)) result.Add(new(r.GetInt32(0),r.GetString(1),r.GetString(2),NString(r,3),r.GetInt32(4),r.GetString(5),NInt(r,6),NString(r,7),r.GetBoolean(8),NInt(r,9),NInt(r,10),NString(r,11),r.GetInt32(12),r.GetInt32(13)));
        return result;
    }

    public async Task<TechnicalTemplateDetail?> GetTemplateAsync(int id,CancellationToken ct=default)
    {
        var header=(await ListTemplatesAsync(ct)).FirstOrDefault(x=>x.PlantillaDespieceId==id);if(header is null)return null;
        var materials=new List<TechnicalTemplateMaterialDto>();var pieces=new List<TechnicalTemplatePieceDto>();string? observations=null;
        await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand("""
          DECLARE @v int=(SELECT TOP(1) PlantillaDespieceVersionId FROM dbo.PlantillaDespieceVersion WHERE PlantillaDespieceId=@id ORDER BY CASE Estado WHEN 'Borrador' THEN 0 WHEN 'Aprobada' THEN 1 ELSE 2 END,NumeroVersion DESC);
          SELECT Observaciones FROM dbo.PlantillaDespieceVersion WHERE PlantillaDespieceVersionId=@v;
          SELECT PlantillaDespieceMaterialId,CONVERT(varchar(20),PlantillaDespieceMaterialId),CodigoRol,Nombre,TipoInsumoId,OrigenColor,ColorId,EspesorMm,Observaciones FROM dbo.PlantillaDespieceMaterial WHERE PlantillaDespieceVersionId=@v ORDER BY PlantillaDespieceMaterialId;
          SELECT p.PlantillaDespiecePiezaReglaId,CONVERT(varchar(20),p.PlantillaDespieceMaterialId),p.Orden,p.NombrePieza,p.Cantidad,p.BaseLargo,p.FactorLargo,p.AjusteLargoMm,p.BaseAncho,p.FactorAncho,p.AjusteAnchoMm,p.OrientacionVeta,p.CantosTerminados,p.Observaciones FROM dbo.PlantillaDespiecePiezaRegla p WHERE p.PlantillaDespieceVersionId=@v ORDER BY p.Orden;
          """,cn);Add(cmd,"@id",id);await using var r=await cmd.ExecuteReaderAsync(ct);if(await r.ReadAsync(ct))observations=NString(r,0);await r.NextResultAsync(ct);while(await r.ReadAsync(ct))materials.Add(new(r.GetInt32(0),r.GetString(1),r.GetString(2),r.GetString(3),r.GetInt32(4),r.GetString(5),NInt(r,6),r.GetDecimal(7),NString(r,8)));await r.NextResultAsync(ct);while(await r.ReadAsync(ct))pieces.Add(new(r.GetInt32(0),r.GetString(1),r.GetInt32(2),r.GetString(3),r.GetInt32(4),r.GetString(5),r.GetDecimal(6),r.GetDecimal(7),r.GetString(8),r.GetDecimal(9),r.GetDecimal(10),r.GetString(11),NString(r,12),NString(r,13)));return new(header,observations,materials,pieces);
    }

    public async Task<int> SaveTemplateAsync(TechnicalTemplateSaveRequest request,int userId,CancellationToken ct=default)
    {
        Validate(request,userId);
        await using var cn=Connection(); await cn.OpenAsync(ct);
        await using var tx=(SqlTransaction)await cn.BeginTransactionAsync(IsolationLevel.Serializable,ct);
        try
        {
            await ValidateFamilyAsync(cn,tx,request.TipoProductoId,request.NombreProductoId,ct);
            int templateId,versionId;
            if(request.PlantillaDespieceId is null)
            {
                await using var insert=new SqlCommand("""
                  INSERT dbo.PlantillaDespiece(Codigo,Nombre,Descripcion,TipoProductoId,NombreProductoId,UsuarioCreacionId)
                  OUTPUT INSERTED.PlantillaDespieceId VALUES(@codigo,@nombre,@descripcion,@tipo,@familia,@usuario)
                  """,cn,tx); Add(insert,"@codigo",request.Codigo.Trim());Add(insert,"@nombre",request.Nombre.Trim());Add(insert,"@descripcion",Db(request.Descripcion));Add(insert,"@tipo",request.TipoProductoId);Add(insert,"@familia",Db(request.NombreProductoId));Add(insert,"@usuario",userId);
                templateId=Convert.ToInt32(await insert.ExecuteScalarAsync(ct));
                await using var version=new SqlCommand("""
                  INSERT dbo.PlantillaDespieceVersion(PlantillaDespieceId,NumeroVersion,Estado,Observaciones,UsuarioCreacionId)
                  OUTPUT INSERTED.PlantillaDespieceVersionId VALUES(@id,1,'Borrador',@obs,@usuario)
                  """,cn,tx);Add(version,"@id",templateId);Add(version,"@obs",Db(request.Observaciones));Add(version,"@usuario",userId);
                versionId=Convert.ToInt32(await version.ExecuteScalarAsync(ct));
                await using var history=new SqlCommand("INSERT dbo.PlantillaDespieceVersionHistorial(PlantillaDespieceVersionId,Estado,Accion,UsuarioId) VALUES(@v,'Borrador','CREAR',@u)",cn,tx);Add(history,"@v",versionId);Add(history,"@u",userId);await history.ExecuteNonQueryAsync(ct);
            }
            else
            {
                templateId=request.PlantillaDespieceId.Value;
                await using var locked=new SqlCommand("""
                  SELECT TOP(1) v.PlantillaDespieceVersionId FROM dbo.PlantillaDespiece t WITH(UPDLOCK,HOLDLOCK)
                  JOIN dbo.PlantillaDespieceVersion v ON v.PlantillaDespieceId=t.PlantillaDespieceId AND v.Estado='Borrador'
                  WHERE t.PlantillaDespieceId=@id ORDER BY v.NumeroVersion DESC
                  """,cn,tx);Add(locked,"@id",templateId);var found=await locked.ExecuteScalarAsync(ct);if(found is null)throw new InvalidOperationException("La plantilla no tiene una version Borrador editable.");versionId=Convert.ToInt32(found);
                await using var update=new SqlCommand("UPDATE dbo.PlantillaDespiece SET Codigo=@codigo,Nombre=@nombre,Descripcion=@descripcion,TipoProductoId=@tipo,NombreProductoId=@familia WHERE PlantillaDespieceId=@id; DELETE p FROM dbo.PlantillaDespiecePiezaRegla p WHERE p.PlantillaDespieceVersionId=@version; DELETE m FROM dbo.PlantillaDespieceMaterial m WHERE m.PlantillaDespieceVersionId=@version; UPDATE dbo.PlantillaDespieceVersion SET Observaciones=@obs WHERE PlantillaDespieceVersionId=@version",cn,tx);
                Add(update,"@codigo",request.Codigo.Trim());Add(update,"@nombre",request.Nombre.Trim());Add(update,"@descripcion",Db(request.Descripcion));Add(update,"@tipo",request.TipoProductoId);Add(update,"@familia",Db(request.NombreProductoId));Add(update,"@id",templateId);Add(update,"@version",versionId);Add(update,"@obs",Db(request.Observaciones));await update.ExecuteNonQueryAsync(ct);
            }
            var materialIds=new Dictionary<string,int>(StringComparer.OrdinalIgnoreCase);
            foreach(var m in request.Materiales)
            {
                await using var cmd=new SqlCommand("INSERT dbo.PlantillaDespieceMaterial(PlantillaDespieceVersionId,CodigoRol,Nombre,TipoInsumoId,OrigenColor,ColorId,EspesorMm,Observaciones) OUTPUT INSERTED.PlantillaDespieceMaterialId VALUES(@v,@c,@n,@t,@o,@color,@e,@obs)",cn,tx);
                Add(cmd,"@v",versionId);Add(cmd,"@c",m.CodigoRol.Trim());Add(cmd,"@n",m.Nombre.Trim());Add(cmd,"@t",m.TipoInsumoId);Add(cmd,"@o",m.OrigenColor);Add(cmd,"@color",Db(m.ColorId));Add(cmd,"@e",m.EspesorMm);Add(cmd,"@obs",Db(m.Observaciones));materialIds[m.Key]=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
            }
            foreach(var p in request.Piezas)
            {
                await using var cmd=new SqlCommand("INSERT dbo.PlantillaDespiecePiezaRegla(PlantillaDespieceVersionId,PlantillaDespieceMaterialId,Orden,NombrePieza,Cantidad,BaseLargo,FactorLargo,AjusteLargoMm,BaseAncho,FactorAncho,AjusteAnchoMm,OrientacionVeta,CantosTerminados,Observaciones) VALUES(@v,@m,@orden,@nombre,@cantidad,@bl,@fl,@al,@ba,@fa,@aa,@veta,@cantos,@obs)",cn,tx);
                Add(cmd,"@v",versionId);Add(cmd,"@m",materialIds[p.MaterialKey]);Add(cmd,"@orden",p.Orden);Add(cmd,"@nombre",p.NombrePieza.Trim());Add(cmd,"@cantidad",p.Cantidad);Add(cmd,"@bl",p.BaseLargo);Add(cmd,"@fl",p.FactorLargo);Add(cmd,"@al",p.AjusteLargoMm);Add(cmd,"@ba",p.BaseAncho);Add(cmd,"@fa",p.FactorAncho);Add(cmd,"@aa",p.AjusteAnchoMm);Add(cmd,"@veta",p.OrientacionVeta);Add(cmd,"@cantos",Db(p.CantosTerminados));Add(cmd,"@obs",Db(p.Observaciones));await cmd.ExecuteNonQueryAsync(ct);
            }
            await tx.CommitAsync(ct);return templateId;
        }catch{await tx.RollbackAsync(CancellationToken.None);throw;}
    }

    public async Task ApproveAsync(int id,int userId,CancellationToken ct=default)
    {
        await using var cn=Connection();await cn.OpenAsync(ct);await using var tx=(SqlTransaction)await cn.BeginTransactionAsync(IsolationLevel.Serializable,ct);
        try{
            await using var cmd=new SqlCommand("""
              DECLARE @v int; SELECT TOP(1) @v=PlantillaDespieceVersionId FROM dbo.PlantillaDespieceVersion WITH(UPDLOCK,HOLDLOCK) WHERE PlantillaDespieceId=@id AND Estado='Borrador' ORDER BY NumeroVersion DESC;
              IF @v IS NULL THROW 63140,'No hay una version Borrador para aprobar.',1;
              IF NOT EXISTS(SELECT 1 FROM dbo.PlantillaDespieceMaterial WHERE PlantillaDespieceVersionId=@v) OR NOT EXISTS(SELECT 1 FROM dbo.PlantillaDespiecePiezaRegla WHERE PlantillaDespieceVersionId=@v) THROW 63141,'La version requiere materiales y piezas.',1;
              IF NOT EXISTS(SELECT 1 FROM dbo.PlantillaDespiece t JOIN dbo.Producto p ON p.TipoProductoId=t.TipoProductoId AND (t.NombreProductoId IS NULL OR p.NombreProductoId=t.NombreProductoId) JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId=p.ProductoId WHERE t.PlantillaDespieceId=@id AND p.Activo=1 AND ft.AnchoCm>0 AND ft.AltoCm>0 AND ft.ProfundidadCm>0) THROW 63142,'No hay productos compatibles con medidas completas para validar la plantilla.',1;
              IF EXISTS(SELECT 1 FROM dbo.PlantillaDespiecePiezaRegla r CROSS APPLY(SELECT CASE r.BaseLargo WHEN 'ANCHO' THEN ft.AnchoCm*10 WHEN 'ALTO' THEN ft.AltoCm*10 WHEN 'PROFUNDIDAD' THEN ft.ProfundidadCm*10 ELSE 0 END b1,CASE r.BaseAncho WHEN 'ANCHO' THEN ft.AnchoCm*10 WHEN 'ALTO' THEN ft.AltoCm*10 WHEN 'PROFUNDIDAD' THEN ft.ProfundidadCm*10 ELSE 0 END b2 FROM dbo.PlantillaDespiece t JOIN dbo.Producto p ON p.TipoProductoId=t.TipoProductoId AND (t.NombreProductoId IS NULL OR p.NombreProductoId=t.NombreProductoId) JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId=p.ProductoId WHERE t.PlantillaDespieceId=@id AND p.Activo=1)x WHERE r.PlantillaDespieceVersionId=@v AND (x.b1*r.FactorLargo+r.AjusteLargoMm<=0 OR x.b2*r.FactorAncho+r.AjusteAnchoMm<=0)) THROW 63142,'Una regla produce medidas no positivas para productos compatibles.',1;
              UPDATE dbo.PlantillaDespieceVersion SET Estado='Inactiva',FechaInactivacion=SYSUTCDATETIME(),UsuarioInactivacionId=@u WHERE PlantillaDespieceId=@id AND Estado='Aprobada';
              UPDATE dbo.PlantillaDespieceVersion SET Estado='Aprobada',FechaAprobacion=SYSUTCDATETIME(),UsuarioAprobacionId=@u WHERE PlantillaDespieceVersionId=@v;
              INSERT dbo.PlantillaDespieceVersionHistorial(PlantillaDespieceVersionId,Estado,Accion,UsuarioId) VALUES(@v,'Aprobada','APROBAR',@u);
              """,cn,tx);Add(cmd,"@id",id);Add(cmd,"@u",userId);await cmd.ExecuteNonQueryAsync(ct);await tx.CommitAsync(ct);
        }catch{await tx.RollbackAsync(CancellationToken.None);throw;}
    }

    public async Task<int> CreateVersionAsync(int templateId,int userId,CancellationToken ct=default)
    {
        await using var cn=Connection();await cn.OpenAsync(ct);await using var tx=(SqlTransaction)await cn.BeginTransactionAsync(IsolationLevel.Serializable,ct);
        try
        {
            await using var cmd=new SqlCommand("""
              IF EXISTS(SELECT 1 FROM dbo.PlantillaDespieceVersion WITH(UPDLOCK,HOLDLOCK) WHERE PlantillaDespieceId=@id AND Estado='Borrador') THROW 63146,'Ya existe una version Borrador.',1;
              DECLARE @source int=(SELECT TOP(1) PlantillaDespieceVersionId FROM dbo.PlantillaDespieceVersion WITH(UPDLOCK,HOLDLOCK) WHERE PlantillaDespieceId=@id AND Estado IN('Aprobada','Inactiva') ORDER BY NumeroVersion DESC);
              IF @source IS NULL THROW 63147,'No existe una version anterior para clonar.',1;
              DECLARE @next int=(SELECT MAX(NumeroVersion)+1 FROM dbo.PlantillaDespieceVersion WHERE PlantillaDespieceId=@id),@new int;
              INSERT dbo.PlantillaDespieceVersion(PlantillaDespieceId,NumeroVersion,Estado,Observaciones,UsuarioCreacionId) SELECT @id,@next,'Borrador',Observaciones,@u FROM dbo.PlantillaDespieceVersion WHERE PlantillaDespieceVersionId=@source; SET @new=CONVERT(int,SCOPE_IDENTITY());
              DECLARE @map TABLE(Anterior int,Nuevo int);
              MERGE dbo.PlantillaDespieceMaterial AS target USING(SELECT * FROM dbo.PlantillaDespieceMaterial WHERE PlantillaDespieceVersionId=@source) AS source ON 1=0 WHEN NOT MATCHED THEN INSERT(PlantillaDespieceVersionId,CodigoRol,Nombre,TipoInsumoId,OrigenColor,ColorId,EspesorMm,Observaciones) VALUES(@new,source.CodigoRol,source.Nombre,source.TipoInsumoId,source.OrigenColor,source.ColorId,source.EspesorMm,source.Observaciones) OUTPUT source.PlantillaDespieceMaterialId,inserted.PlantillaDespieceMaterialId INTO @map;
              INSERT dbo.PlantillaDespiecePiezaRegla(PlantillaDespieceVersionId,PlantillaDespieceMaterialId,Orden,NombrePieza,Cantidad,BaseLargo,FactorLargo,AjusteLargoMm,BaseAncho,FactorAncho,AjusteAnchoMm,OrientacionVeta,CantosTerminados,Observaciones) SELECT @new,m.Nuevo,p.Orden,p.NombrePieza,p.Cantidad,p.BaseLargo,p.FactorLargo,p.AjusteLargoMm,p.BaseAncho,p.FactorAncho,p.AjusteAnchoMm,p.OrientacionVeta,p.CantosTerminados,p.Observaciones FROM dbo.PlantillaDespiecePiezaRegla p JOIN @map m ON m.Anterior=p.PlantillaDespieceMaterialId WHERE p.PlantillaDespieceVersionId=@source;
              INSERT dbo.PlantillaDespieceVersionHistorial(PlantillaDespieceVersionId,Estado,Accion,UsuarioId) VALUES(@new,'Borrador','NUEVA_VERSION',@u); SELECT @new;
              """,cn,tx);Add(cmd,"@id",templateId);Add(cmd,"@u",userId);var result=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));await tx.CommitAsync(ct);return result;
        }catch{await tx.RollbackAsync(CancellationToken.None);throw;}
    }

    public async Task<List<BoardFormatDto>> ListFormatsAsync(CancellationToken ct=default)
    {var x=new List<BoardFormatDto>();await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand("SELECT f.FormatoPlacaInsumoId,f.InsumoId,i.Codigo,i.Nombre,f.Codigo,f.Nombre,f.LargoMm,f.AnchoMm,f.EspesorMm,f.OrientacionVeta,f.TipoRecorteId,t.Nombre,f.Predeterminado,f.Activo FROM dbo.FormatoPlacaInsumo f JOIN dbo.Insumo i ON i.InsumoId=f.InsumoId JOIN dbo.TipoRecorte t ON t.TipoRecorteId=f.TipoRecorteId ORDER BY i.Nombre,f.Nombre",cn);await using var r=await cmd.ExecuteReaderAsync(ct);while(await r.ReadAsync(ct))x.Add(new(r.GetInt32(0),r.GetInt32(1),r.GetString(2),r.GetString(3),r.GetString(4),r.GetString(5),r.GetDecimal(6),r.GetDecimal(7),r.GetDecimal(8),r.GetString(9),r.GetInt32(10),r.GetString(11),r.GetBoolean(12),r.GetBoolean(13)));return x;}

    public async Task<int> SaveFormatAsync(BoardFormatSaveRequest q,int userId,CancellationToken ct=default)
    {if(q.InsumoId<=0||string.IsNullOrWhiteSpace(q.Codigo)||string.IsNullOrWhiteSpace(q.Nombre)||q.LargoMm<=0||q.AnchoMm<=0||q.EspesorMm<=0||q.OrientacionVeta is not("Indiferente" or "Largo" or "Ancho"))throw new ArgumentException("Formato de placa invalido.");await using var cn=Connection();await cn.OpenAsync(ct);await using var tx=(SqlTransaction)await cn.BeginTransactionAsync(IsolationLevel.Serializable,ct);try{await using var valid=new SqlCommand("IF NOT EXISTS(SELECT 1 FROM dbo.Insumo i JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId WHERE i.InsumoId=@i AND i.Activo=1 AND u.Nombre='Metro cuadrado') THROW 63145,'El formato requiere un insumo activo administrado en metros cuadrados.',1; IF @pred=1 UPDATE dbo.FormatoPlacaInsumo SET Predeterminado=0 WHERE InsumoId=@i AND Activo=1",cn,tx);Add(valid,"@i",q.InsumoId);Add(valid,"@pred",q.Predeterminado);await valid.ExecuteNonQueryAsync(ct);await using var cmd=new SqlCommand(q.FormatoPlacaInsumoId is null?"INSERT dbo.FormatoPlacaInsumo(InsumoId,Codigo,Nombre,LargoMm,AnchoMm,EspesorMm,OrientacionVeta,TipoRecorteId,Predeterminado,UsuarioCreacionId) OUTPUT INSERTED.FormatoPlacaInsumoId VALUES(@i,@c,@n,@l,@a,@e,@v,@t,@p,@u)":"UPDATE dbo.FormatoPlacaInsumo SET Codigo=@c,Nombre=@n,LargoMm=@l,AnchoMm=@a,EspesorMm=@e,OrientacionVeta=@v,TipoRecorteId=@t,Predeterminado=@p WHERE FormatoPlacaInsumoId=@id AND Activo=1; SELECT @id",cn,tx);Add(cmd,"@i",q.InsumoId);Add(cmd,"@c",q.Codigo.Trim());Add(cmd,"@n",q.Nombre.Trim());Add(cmd,"@l",q.LargoMm);Add(cmd,"@a",q.AnchoMm);Add(cmd,"@e",q.EspesorMm);Add(cmd,"@v",q.OrientacionVeta);Add(cmd,"@t",q.TipoRecorteId);Add(cmd,"@p",q.Predeterminado);Add(cmd,"@u",userId);Add(cmd,"@id",q.FormatoPlacaInsumoId??0);var id=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));await tx.CommitAsync(ct);return id;}catch{await tx.RollbackAsync(CancellationToken.None);throw;}}

    public async Task<List<CutParameterDto>> ListParametersAsync(CancellationToken ct=default)
    {var x=new List<CutParameterDto>();await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand("SELECT ParametroCorteProduccionId,Nombre,NumeroVersion,AnchoSierraMm,MargenSeguridadMm,LargoMinimoRecuperableMm,AnchoMinimoRecuperableMm,AreaMinimaRecuperableMm2,Activo,FechaCreacion FROM dbo.ParametroCorteProduccion ORDER BY NumeroVersion DESC",cn);await using var r=await cmd.ExecuteReaderAsync(ct);while(await r.ReadAsync(ct))x.Add(new(r.GetInt32(0),r.GetString(1),r.GetInt32(2),r.GetDecimal(3),r.GetDecimal(4),r.GetDecimal(5),r.GetDecimal(6),r.GetDecimal(7),r.GetBoolean(8),r.GetDateTime(9)));return x;}
    public async Task<int> SaveParameterAsync(CutParameterSaveRequest q,int userId,CancellationToken ct=default)
    {if(string.IsNullOrWhiteSpace(q.Nombre)||q.AnchoSierraMm<0||q.MargenSeguridadMm<0||q.LargoMinimoRecuperableMm<=0||q.AnchoMinimoRecuperableMm<=0||q.AreaMinimaRecuperableMm2<=0)throw new ArgumentException("Parametros de corte invalidos.");await using var cn=Connection();await cn.OpenAsync(ct);await using var tx=(SqlTransaction)await cn.BeginTransactionAsync(IsolationLevel.Serializable,ct);try{await using var cmd=new SqlCommand("DECLARE @v int=(SELECT COALESCE(MAX(NumeroVersion),0)+1 FROM dbo.ParametroCorteProduccion WITH(UPDLOCK,HOLDLOCK)); IF @activo=1 UPDATE dbo.ParametroCorteProduccion SET Activo=0 WHERE Activo=1; INSERT dbo.ParametroCorteProduccion(Nombre,NumeroVersion,AnchoSierraMm,MargenSeguridadMm,LargoMinimoRecuperableMm,AnchoMinimoRecuperableMm,AreaMinimaRecuperableMm2,Activo,UsuarioCreacionId) OUTPUT INSERTED.ParametroCorteProduccionId VALUES(@n,@v,@s,@m,@l,@a,@area,@activo,@u)",cn,tx);Add(cmd,"@n",q.Nombre.Trim());Add(cmd,"@s",q.AnchoSierraMm);Add(cmd,"@m",q.MargenSeguridadMm);Add(cmd,"@l",q.LargoMinimoRecuperableMm);Add(cmd,"@a",q.AnchoMinimoRecuperableMm);Add(cmd,"@area",q.AreaMinimaRecuperableMm2);Add(cmd,"@activo",q.Activar);Add(cmd,"@u",userId);var id=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));await tx.CommitAsync(ct);return id;}catch{await tx.RollbackAsync(CancellationToken.None);throw;}}

    public async Task<List<ProductionCutTypeDto>> ListCutTypesAsync(CancellationToken ct=default)
    {var x=new List<ProductionCutTypeDto>();await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand("SELECT TipoRecorteId,Nombre,Activo FROM dbo.TipoRecorte ORDER BY Nombre",cn);await using var r=await cmd.ExecuteReaderAsync(ct);while(await r.ReadAsync(ct))x.Add(new(r.GetInt32(0),r.GetString(1),r.GetBoolean(2)));return x;}
    public async Task<int> SaveCutTypeAsync(int? id,string name,CancellationToken ct=default)
    {if(string.IsNullOrWhiteSpace(name)||name.Trim().Length>50)throw new ArgumentException("Nombre de tipo de recorte invalido.");await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand(id is null?"INSERT dbo.TipoRecorte(Nombre,Activo) OUTPUT INSERTED.TipoRecorteId VALUES(@n,1)":"UPDATE dbo.TipoRecorte SET Nombre=@n WHERE TipoRecorteId=@id; SELECT @id",cn);Add(cmd,"@n",name.Trim());Add(cmd,"@id",id??0);return Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));}
    public async Task InactivateCutTypeAsync(int id,CancellationToken ct=default)
    {await using var cn=Connection();await cn.OpenAsync(ct);await using var cmd=new SqlCommand("IF EXISTS(SELECT 1 FROM dbo.FormatoPlacaInsumo WHERE TipoRecorteId=@id AND Activo=1) THROW 63148,'El tipo esta utilizado por formatos activos.',1; UPDATE dbo.TipoRecorte SET Activo=0 WHERE TipoRecorteId=@id; IF @@ROWCOUNT<>1 THROW 63149,'Tipo de recorte inexistente.',1",cn);Add(cmd,"@id",id);await cmd.ExecuteNonQueryAsync(ct);}

    private SqlConnection Connection()=>new(db.Database.GetConnectionString());
    private static object Db(object? value)=>value??DBNull.Value;
    private static void Add(SqlCommand c,string n,object v)=>c.Parameters.AddWithValue(n,v);
    private static int? NInt(SqlDataReader r,int i)=>r.IsDBNull(i)?null:r.GetInt32(i);
    private static string? NString(SqlDataReader r,int i)=>r.IsDBNull(i)?null:r.GetString(i);
    private static async Task ValidateFamilyAsync(SqlConnection c,SqlTransaction t,int type,int? family,CancellationToken ct){await using var cmd=new SqlCommand("IF NOT EXISTS(SELECT 1 FROM dbo.TipoProducto WHERE TipoProductoId=@t AND Activo=1) THROW 63143,'Tipo de producto inexistente o inactivo.',1; IF @f IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.NombreProductoCatalogo WHERE NombreProductoId=@f AND TipoProductoId=@t AND Activo=1) THROW 63144,'Familia incompatible con el tipo de producto.',1",c,t);Add(cmd,"@t",type);Add(cmd,"@f",Db(family));await cmd.ExecuteNonQueryAsync(ct);}
    private static void Validate(TechnicalTemplateSaveRequest q,int userId){var bases=new[]{"ANCHO","ALTO","PROFUNDIDAD","CONSTANTE"};if(userId<=0||string.IsNullOrWhiteSpace(q.Codigo)||string.IsNullOrWhiteSpace(q.Nombre)||q.TipoProductoId<=0||q.Materiales.Count==0||q.Piezas.Count==0||q.Materiales.Select(x=>x.Key).Distinct(StringComparer.OrdinalIgnoreCase).Count()!=q.Materiales.Count)throw new ArgumentException("La plantilla requiere cabecera, materiales y piezas validos.");var keys=q.Materiales.Select(x=>x.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);if(q.Materiales.Any(x=>string.IsNullOrWhiteSpace(x.Key)||string.IsNullOrWhiteSpace(x.CodigoRol)||string.IsNullOrWhiteSpace(x.Nombre)||x.TipoInsumoId<=0||x.EspesorMm<=0||x.OrigenColor is not("PRODUCTO" or "FIJO")||(x.OrigenColor=="PRODUCTO"&&x.ColorId.HasValue)||(x.OrigenColor=="FIJO"&&!x.ColorId.HasValue))||q.Piezas.Any(x=>!keys.Contains(x.MaterialKey)||x.Orden<=0||x.Cantidad<=0||string.IsNullOrWhiteSpace(x.NombrePieza)||!bases.Contains(x.BaseLargo)||!bases.Contains(x.BaseAncho)||x.OrientacionVeta is not("Indiferente" or "Largo" or "Ancho")||(x.BaseLargo=="CONSTANTE"?(x.FactorLargo!=0||x.AjusteLargoMm<=0):x.FactorLargo<=0)||(x.BaseAncho=="CONSTANTE"?(x.FactorAncho!=0||x.AjusteAnchoMm<=0):x.FactorAncho<=0)))throw new ArgumentException("Las reglas dimensionales o materiales son invalidos.");}
}
