using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Services;
using TEKAManager.API.Security;

namespace TEKAManager.API.Controllers;
[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[Route("api/caja-movimientos")]
public sealed class CajaMovimientosController(CajaSqlService sql, ILogger<CajaMovimientosController> logger) : ControllerBase
{
    private int UsuarioId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
    private async Task<IActionResult> Run(string sp, Dictionary<string, object?> p, CancellationToken ct)
    {
        try { return Ok(await sql.EjecutarAsync(sp, p, ct)); }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        { return BadRequest(new { mensaje = ex.Message }); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Error SQL en {Procedure}", sp);
            return StatusCode(500, new { mensaje = "Error al procesar la operación de Caja." });
        }
    }

    [HttpGet, RequirePermission("Caja", "Ver")]
    public async Task<IActionResult> Listar([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta,
        [FromQuery] string? tipo, [FromQuery] string? medio, [FromQuery] string? estado,
        [FromQuery] int? canalVentaId, [FromQuery] int? cuentaBancariaId,
        [FromQuery] string? origenTipo, [FromQuery] bool soloEfectivo,
        [FromQuery] int pagina = 1, [FromQuery] int tamanoPagina = 50, CancellationToken ct = default)
    {
        if(pagina<1||tamanoPagina is <1 or >200||desde?.Date>hasta?.Date||hasta?.Date==DateTime.MaxValue.Date)
            return BadRequest(new{mensaje="Revisá período y paginación."});
        try
        {
            // Misma consulta que la pantalla y los reportes. Conserva el array del contrato heredado.
            var query=CajaSqlService.ListaFinancieraSql.Replace("WHERE (@Desde IS NULL","WHERE (@SoloEfectivo=0 OR Medio='Efectivo') AND (@Desde IS NULL",StringComparison.Ordinal);
            var result=await sql.ConsultarCajaJsonAsync(query,new(){["Desde"]=desde?.Date,["Hasta"]=hasta?.Date,
                ["Tipo"]=Clean(tipo),["Medio"]=Clean(medio),["Estado"]=Clean(estado),["Canal"]=canalVentaId,
                ["Cuenta"]=cuentaBancariaId,["Origen"]=Clean(origenTipo),["SoloEfectivo"]=soloEfectivo,
                ["Pagina"]=pagina,["Tamano"]=tamanoPagina,["Buscar"]=null,["Concepto"]=null},ct);
            var rows=result.GetProperty("Filas").EnumerateArray().Select(row=>{
                var values=row.EnumerateObject().ToDictionary(p=>p.Name,p=>(object?)p.Value.Clone());
                values["TotalRegistros"]=result.GetProperty("Total").GetInt64();return values;
            }).ToArray();
            return Ok(rows);
        }
        catch(Exception ex) when(ex is not OperationCanceledException)
        {logger.LogError(ex,"Consulta unificada de movimientos");return StatusCode(500,new{mensaje="No se pudieron consultar los movimientos."});}
    }
    private static string? Clean(string? value)=>string.IsNullOrWhiteSpace(value)?null:value.Trim();

    [HttpPost, RequirePermission("Caja", "Crear")]
    public Task<IActionResult> Registrar([FromBody] MovimientoFinancieroRequest r, CancellationToken ct)
    {
        if(UsuarioId<=0)return Task.FromResult<IActionResult>(Unauthorized());
        if(r.OrigenTipo is not ("Gasto" or "AjusteAutorizado" or "Otro"))
            return Task.FromResult<IActionResult>(BadRequest(new{mensaje="Cobros, reintegros y pagos a proveedores deben registrarse desde su circuito de origen, no como movimientos manuales."}));
        if(r.Importe<=0||r.Importe>9999999999999999.99m||decimal.Round(r.Importe,2)!=r.Importe
            ||string.IsNullOrWhiteSpace(r.Concepto)||r.Concepto.Length>250||r.OrigenId<=0||r.FechaOperacion==default
            ||r.Tipo is not("Ingreso" or "Egreso")||r.Medio is not("Transferencia" or "Tarjeta" or "Pasarela" or "Deposito" or "Cheque" or "OtroElectronico")
            ||(r.ReferenciaExterna?.Length??0)>150||(r.Observaciones?.Length??0)>500)
            return Task.FromResult<IActionResult>(BadRequest(new{mensaje="Revisá tipo, medio, importe positivo con dos decimales, concepto y referencia."}));
        return Run("dbo.sp_CajaFin_RegistrarMovimiento", new() {
            ["FechaOperacion"] = r.FechaOperacion, ["Tipo"] = r.Tipo, ["Medio"] = r.Medio,
            ["Importe"] = r.Importe, ["Concepto"] = r.Concepto, ["OrigenTipo"] = r.OrigenTipo,
            ["OrigenId"] = r.OrigenId, ["UsuarioId"] = UsuarioId, ["CuentaBancariaId"] = r.CuentaBancariaId,
            ["CanalVentaId"] = r.CanalVentaId, ["MedioCobroId"] = r.MedioCobroId,
            ["CobroId"] = (int?)null, ["ReferenciaExterna"] = r.ReferenciaExterna,
            ["Observaciones"] = r.Observaciones }, ct);
    }
}

public sealed record MovimientoFinancieroRequest(DateTime FechaOperacion, string Tipo, string Medio,
    decimal Importe, string Concepto, string OrigenTipo, long OrigenId,
    int? CuentaBancariaId, int? CanalVentaId, int? MedioCobroId,
    string? ReferenciaExterna, string? Observaciones);
