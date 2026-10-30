using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record CostoInsumoEstimadoDto(int InsumoId, string Codigo, string Nombre,
    string Unidad, decimal Cantidad, decimal? CostoUnitario, decimal? Subtotal,
    int? CompraProveedorId, DateTime? FechaCompra, string Estado);

public sealed record CostoProductoEstimadoDto(int ProductoId, int? ListaMaterialesId,
    string Estado, decimal? CostoMateriales, CalculoPrecioDto? Precio,
    IReadOnlyList<CostoInsumoEstimadoDto> Insumos, IReadOnlyList<string> Advertencias);

/// <summary>
/// Consulta de costos estimados. Nunca registra compras ni precios.
/// Las compras utilizables se limitan a los estados autorizados en configuración.
/// </summary>
public sealed class CostoProductoEstimadoService
{
    private readonly TekaDbContext _db;
    private readonly IConfiguration _config;
    private readonly ParametroCostoPrecioService _parametros;

    public CostoProductoEstimadoService(TekaDbContext db, IConfiguration config, ParametroCostoPrecioService parametros)
    { _db=db; _config=config; _parametros=parametros; }

    public async Task<CostoProductoEstimadoDto> CalcularAsync(int productoId, CancellationToken ct=default)
    {
        if (productoId<=0) throw new ArgumentException("Producto inválido.");
        var avisos=new List<string>();
        var items=new List<CostoInsumoEstimadoDto>();
        await using var conn=new SqlConnection(_db.Database.GetConnectionString());
        await conn.OpenAsync(ct);
        int? listaId=null;
        await using (var cmd=new SqlCommand(@"SELECT lm.ListaMaterialesId
            FROM dbo.Producto p LEFT JOIN dbo.ListaMateriales lm ON lm.ProductoId=p.ProductoId AND lm.Activa=1
            WHERE p.ProductoId=@id AND p.Activo=1",conn))
        {
            cmd.Parameters.Add("@id",SqlDbType.Int).Value=productoId;
            await using var r=await cmd.ExecuteReaderAsync(ct);
            if(!await r.ReadAsync(ct)) throw new KeyNotFoundException("Producto inexistente o inactivo.");
            if(!r.IsDBNull(0)) listaId=r.GetInt32(0);
            if(await r.ReadAsync(ct)) return new(productoId,null,"LISTAS_MULTIPLES",null,null,items,
                new[]{"El producto tiene varias listas de materiales activas."});
        }
        if(listaId is null) return new(productoId,null,"SIN_BOM",null,null,items,
            new[]{"El producto no tiene una lista de materiales activa."});

        // Estados válidos definidos por el negocio; por defecto ninguno, para no valorar compras no confirmadas.
        var estados=_config.GetSection("Costos:EstadosCompraValidos").GetChildren()
            .Select(section => section.Value)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!.Trim())
            .ToArray();
        estados=estados.Where(s=>!string.IsNullOrWhiteSpace(s)).Select(s=>s.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if(estados.Length==0) avisos.Add("No se configuraron estados de compra válidos en Costos:EstadosCompraValidos.");
        await using(var cmd=new SqlCommand(@"
            SELECT d.InsumoId,i.Codigo,i.Nombre,um.Abreviatura,d.Cantidad,
                c.PrecioUnitario,c.CompraProveedorId,c.FechaCompra
            FROM dbo.DetalleListaMateriales d
            JOIN dbo.Insumo i ON i.InsumoId=d.InsumoId
            JOIN dbo.UnidadMedida um ON um.UnidadMedidaId=i.UnidadMedidaId
            OUTER APPLY (
                SELECT TOP(1) cd.PrecioUnitario,cp.CompraProveedorId,cp.FechaCompra
                FROM dbo.CompraProveedorDetalle cd
                JOIN dbo.CompraProveedor cp ON cp.CompraProveedorId=cd.CompraProveedorId
                WHERE cd.InsumoId=d.InsumoId AND cd.PrecioUnitario>0 AND cd.CantidadComprada>0
                  AND cp.Estado IN (SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@estados,','))
                ORDER BY cp.FechaCompra DESC,cp.CompraProveedorId DESC,cd.CompraProveedorDetalleId DESC
            ) c
            WHERE d.ListaMaterialesId=@lista
            ORDER BY d.DetalleListaMaterialesId",conn))
        {
            cmd.Parameters.Add("@lista",SqlDbType.Int).Value=listaId.Value;
            cmd.Parameters.Add("@estados",SqlDbType.VarChar,400).Value=string.Join(',',estados);
            await using var r=await cmd.ExecuteReaderAsync(ct);
            while(await r.ReadAsync(ct))
            {
                var id=r.GetInt32(0);var codigo=r.GetString(1);var nombre=r.GetString(2);
                var unidad=r.GetString(3);var cantidad=r.GetDecimal(4);
                decimal? unitario=r.IsDBNull(5)?null:r.GetDecimal(5);
                var compra=r.IsDBNull(6)?(int?)null:r.GetInt32(6);
                var fecha=r.IsDBNull(7)?(DateTime?)null:r.GetDateTime(7);
                string estado="OK";
                if(cantidad<=0){estado="CANTIDAD_INVALIDA";avisos.Add($"{codigo}: cantidad de BOM inválida.");}
                else if(unitario is null){estado="SIN_COSTO_COMPRA";avisos.Add($"{codigo}: no tiene compra válida con costo unitario.");}
                var subtotal=estado=="OK"?decimal.Round(cantidad*unitario!.Value,2,MidpointRounding.AwayFromZero):(decimal?)null;
                items.Add(new(id,codigo,nombre,unidad,cantidad,unitario,subtotal,compra,fecha,estado));
            }
        }
        if(items.Count==0) avisos.Add("La lista de materiales no tiene componentes.");
        if(avisos.Count>0) return new(productoId,listaId,"INCOMPLETO",null,null,items,avisos);
        var total=items.Sum(x=>x.Subtotal!.Value);
        if(total<=0) return new(productoId,listaId,"INCOMPLETO",null,null,items,
            new[]{"El costo de materiales calculado no es positivo."});
        try
        {
            var precio=await _parametros.CalcularConCostoInformadoAsync(new CalculoPrecioRequest(productoId,total),ct);
            // Se distingue explícitamente el origen automático del costo informado.
            precio=precio with { OrigenCostoMateriales="BOM_ULTIMA_COMPRA_VALIDA" };
            return new(productoId,listaId,"COMPLETO",total,precio,items,avisos);
        }
        catch(KeyNotFoundException)
        {
            avisos.Add("Falta configurar parámetros de costos y rentabilidad para el tipo de producto.");
            return new(productoId,listaId,"SIN_PARAMETROS",total,null,items,avisos);
        }
    }
}
