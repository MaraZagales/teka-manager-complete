using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.Core.Services;

public sealed record RegistrarPrecioConCalculoRequest(int ProductoId, decimal PrecioFinal,
    string OrigenCostoMateriales, decimal? CostoMateriales);

/// <summary>Registra el precio y su fotografía de costos de forma atómica.</summary>
public sealed class PrecioVentaCalculoRegistroService
{
    private readonly TekaDbContext _db;
    private readonly ParametroCostoPrecioService _parametros;
    private readonly CostoProductoEstimadoService _automatico;

    public PrecioVentaCalculoRegistroService(TekaDbContext db,
        ParametroCostoPrecioService parametros, CostoProductoEstimadoService automatico)
    { _db=db; _parametros=parametros; _automatico=automatico; }

    public async Task<int> RegistrarAsync(RegistrarPrecioConCalculoRequest request, int usuarioId, CancellationToken ct=default)
    {
        if (usuarioId<=0 || request.ProductoId<=0) throw new ArgumentException("Usuario y producto válidos requeridos.");
        if (request.PrecioFinal<=0 || decimal.Round(request.PrecioFinal,2)!=request.PrecioFinal)
            throw new ArgumentException("El precio final debe ser positivo y tener hasta dos decimales.");
        var automatico=request.OrigenCostoMateriales=="BOM_ULTIMA_COMPRA_VALIDA";
        if (!automatico && request.OrigenCostoMateriales!="COSTO_INFORMADO")
            throw new ArgumentException("Origen de costo inválido.");
        CalculoPrecioDto calculo;
        CostoProductoEstimadoDto? estimacion=null;
        if (automatico)
        {
            if (request.CostoMateriales is not null)
                throw new ArgumentException("No se permite informar un costo manual en modo automático.");
            estimacion=await _automatico.CalcularAsync(request.ProductoId,ct);
            if (estimacion.Estado!="COMPLETO" || estimacion.Precio is null)
                throw new InvalidOperationException("El cálculo automático no está completo: "+string.Join("; ",estimacion.Advertencias));
            calculo=estimacion.Precio;
        }
        else
        {
            if (request.CostoMateriales is null)
                throw new ArgumentException("Indicá el costo de materiales para el cálculo manual.");
            calculo=await _parametros.CalcularConCostoInformadoAsync(
                new CalculoPrecioRequest(request.ProductoId,request.CostoMateriales.Value),ct);
        }
        var margenEfectivo=decimal.Round((request.PrecioFinal-calculo.CostoTotal)*100m/request.PrecioFinal,
            2,MidpointRounding.AwayFromZero);
        // La base almacena DECIMAL(7,2); impedir desbordes antes de iniciar la transacción.
        if (margenEfectivo < -99999.99m || margenEfectivo > 99999.99m)
            throw new ArgumentException("El margen efectivo excede el rango admitido.");

        await using var conn=new SqlConnection(_db.Database.GetConnectionString());
        await conn.OpenAsync(ct);
        await using var tx=(SqlTransaction)await conn.BeginTransactionAsync(IsolationLevel.ReadCommitted,ct);
        try
        {
            // Revalidar que los parámetros no cambiaron desde el cálculo previo.
            decimal mano,fijos,variables,margen;
            await using (var cmd=new SqlCommand(@"SELECT PorcentajeManoObra,PorcentajeCostosFijos,
                PorcentajeOtrosVariables,PorcentajeMargen FROM dbo.ParametroCostoPrecio WITH (UPDLOCK,HOLDLOCK)
                WHERE ParametroCostoPrecioId=@id AND Activo=1",conn,tx))
            {
                cmd.Parameters.Add("@id",SqlDbType.Int).Value=calculo.ParametroCostoPrecioId;
                await using var rd=await cmd.ExecuteReaderAsync(ct);
                if(!await rd.ReadAsync(ct)) throw new InvalidOperationException("La configuración de costos cambió. Recalculá.");
                mano=rd.GetDecimal(0);fijos=rd.GetDecimal(1);variables=rd.GetDecimal(2);margen=rd.GetDecimal(3);
            }
            var costoMano=decimal.Round(calculo.CostoMateriales*mano/100m,2,MidpointRounding.AwayFromZero);
            var costoFijos=decimal.Round(calculo.CostoMateriales*fijos/100m,2,MidpointRounding.AwayFromZero);
            var costoVariables=decimal.Round(calculo.CostoMateriales*variables/100m,2,MidpointRounding.AwayFromZero);
            var costoTotal=calculo.CostoMateriales+costoMano+costoFijos+costoVariables;
            var sugerido=decimal.Round(costoTotal/(1m-margen/100m),2,MidpointRounding.AwayFromZero);
            if(costoTotal!=calculo.CostoTotal || sugerido!=calculo.PrecioSugerido)
                throw new InvalidOperationException("Los parámetros de costos cambiaron. Recalculá el precio.");
            int precioId;
            await using (var cmd=new SqlCommand("dbo.sp_PrecioVenta_Insert",conn,tx))
            {
                cmd.CommandType=CommandType.StoredProcedure;
                cmd.Parameters.Add("@ProductoId",SqlDbType.Int).Value=request.ProductoId;
                var p=cmd.Parameters.Add("@Precio",SqlDbType.Decimal);p.Precision=18;p.Scale=2;p.Value=request.PrecioFinal;
                cmd.Parameters.Add("@UsuarioId",SqlDbType.Int).Value=usuarioId;
                precioId=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
            }
            int calculoId;
            await using (var cmd=new SqlCommand(@"INSERT dbo.PrecioVentaCalculo
                (PrecioVentaId,OrigenCostoMateriales,ListaMaterialesId,CostoMateriales,
                PorcentajeManoObra,CostoManoObra,PorcentajeCostosFijos,CostoCostosFijos,
                PorcentajeOtrosVariables,CostoOtrosVariables,CostoTotal,PorcentajeMargen,
                PrecioSugerido,PrecioFinalRegistrado,MargenEfectivo,UsuarioId)
                OUTPUT INSERTED.PrecioVentaCalculoId VALUES
                (@PrecioId,@Origen,@Lista,@Materiales,@PM,@CM,@PF,@CF,@PV,@CV,@Total,@Margen,
                @Sugerido,@Final,@Efectivo,@Usuario)",conn,tx))
            {
                Add(cmd,"@PrecioId",precioId);Add(cmd,"@Origen",request.OrigenCostoMateriales);
                Add(cmd,"@Lista",(object?)estimacion?.ListaMaterialesId??DBNull.Value);
                Add(cmd,"@Materiales",calculo.CostoMateriales);Add(cmd,"@PM",mano);Add(cmd,"@CM",costoMano);
                Add(cmd,"@PF",fijos);Add(cmd,"@CF",costoFijos);Add(cmd,"@PV",variables);
                Add(cmd,"@CV",costoVariables);Add(cmd,"@Total",costoTotal);Add(cmd,"@Margen",margen);
                Add(cmd,"@Sugerido",sugerido);Add(cmd,"@Final",request.PrecioFinal);
                Add(cmd,"@Efectivo",margenEfectivo);Add(cmd,"@Usuario",usuarioId);
                calculoId=Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
            }
            if(automatico && estimacion is not null)
            {
                foreach(var item in estimacion.Insumos)
                {
                    if(item.Estado!="OK" || item.CostoUnitario is null || item.Subtotal is null)
                        throw new InvalidOperationException("Detalle automático incompleto.");
                    await using var cmd=new SqlCommand(@"INSERT dbo.PrecioVentaCalculoInsumo
                        (PrecioVentaCalculoId,InsumoId,CodigoInsumo,NombreInsumo,Unidad,Cantidad,
                        CostoUnitario,Subtotal,CompraProveedorId,FechaCompra)
                        VALUES(@Calculo,@Insumo,@Codigo,@Nombre,@Unidad,@Cantidad,@Unitario,@Subtotal,@Compra,@Fecha)",conn,tx);
                    Add(cmd,"@Calculo",calculoId);Add(cmd,"@Insumo",item.InsumoId);
                    Add(cmd,"@Codigo",item.Codigo);Add(cmd,"@Nombre",item.Nombre);Add(cmd,"@Unidad",item.Unidad);
                    Add(cmd,"@Cantidad",item.Cantidad);Add(cmd,"@Unitario",item.CostoUnitario.Value);
                    Add(cmd,"@Subtotal",item.Subtotal.Value);Add(cmd,"@Compra",(object?)item.CompraProveedorId??DBNull.Value);
                    Add(cmd,"@Fecha",(object?)item.FechaCompra??DBNull.Value);
                    await cmd.ExecuteNonQueryAsync(ct);
                }
            }
            await tx.CommitAsync(ct);
            return precioId;
        }
        catch { await tx.RollbackAsync(CancellationToken.None); throw; }
    }
    private static void Add(SqlCommand cmd,string name,object value) => cmd.Parameters.AddWithValue(name,value);
}
