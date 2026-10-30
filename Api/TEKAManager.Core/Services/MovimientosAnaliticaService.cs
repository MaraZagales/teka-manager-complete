using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
namespace TEKAManager.Core.Services;
public sealed class MovimientosAnaliticaService {
 private readonly TekaDbContext _db;
 public MovimientosAnaliticaService(TekaDbContext db) => _db=db;
 private static SqlParameter[] Params(DateTime desde,DateTime hasta,string? clase,int? depositoId,int? articuloId,string? origen,string? estado,string? modalidad,string? buscar) => new[] {
  new SqlParameter("@Desde",SqlDbType.Date){Value=desde.Date},new SqlParameter("@Hasta",SqlDbType.Date){Value=hasta.Date},
  new SqlParameter("@Clase",SqlDbType.VarChar,10){Value=(object?)clase??DBNull.Value},
  new SqlParameter("@DepositoId",SqlDbType.Int){Value=(object?)depositoId??DBNull.Value},
  new SqlParameter("@ArticuloId",SqlDbType.Int){Value=(object?)articuloId??DBNull.Value},
  new SqlParameter("@Origen",SqlDbType.VarChar,50){Value=(object?)origen??DBNull.Value},
  new SqlParameter("@Estado",SqlDbType.VarChar,10){Value=(object?)estado??DBNull.Value},
  new SqlParameter("@Modalidad",SqlDbType.VarChar,12){Value=(object?)modalidad??DBNull.Value},
  new SqlParameter("@Buscar",SqlDbType.VarChar,120){Value=(object?)buscar??DBNull.Value}
 };
 private const string Args="@Desde,@Hasta,@Clase,@DepositoId,@ArticuloId,@Origen,@Estado,@Modalidad,@Buscar";
 public async Task<List<MovimientoAnaliticoDTO>> Consultar(DateTime desde,DateTime hasta,string? clase,int? depositoId,int? articuloId,string? origen,string? estado,string? modalidad,string? buscar,int pagina,int tamanoPagina) {
  var ps=Params(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar).Concat(new[]{new SqlParameter("@Pagina",pagina),new SqlParameter("@TamanoPagina",tamanoPagina)}).ToArray();
  return await _db.Database.SqlQueryRaw<MovimientoAnaliticoDTO>("EXEC dbo.pa_Movimientos_Consultar "+Args+",@Pagina,@TamanoPagina",ps).ToListAsync();
 }
 public async Task<MovimientoResumenDTO> Resumen(DateTime desde,DateTime hasta,string? clase,int? depositoId,int? articuloId,string? origen,string? estado,string? modalidad,string? buscar) =>
  (await _db.Database.SqlQueryRaw<MovimientoResumenDTO>("EXEC dbo.pa_Movimientos_Resumen "+Args,Params(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar)).ToListAsync()).Single();
 public Task<List<MovimientoSerieDTO>> Series(DateTime desde,DateTime hasta,string? clase,int? depositoId,int? articuloId,string? origen,string? estado,string? modalidad,string? buscar) =>
  _db.Database.SqlQueryRaw<MovimientoSerieDTO>("EXEC dbo.pa_Movimientos_Series "+Args,Params(desde,hasta,clase,depositoId,articuloId,origen,estado,modalidad,buscar)).ToListAsync();
}
