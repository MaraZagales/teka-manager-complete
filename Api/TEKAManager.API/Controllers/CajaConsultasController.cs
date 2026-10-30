using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.API.Security;
using TEKAManager.API.Services;

namespace TEKAManager.API.Controllers;

[ApiController, Authorize(AuthenticationSchemes = "Bearer"), RequirePermission("Caja", "Ver")]
[Route("api/caja-consultas")]
public sealed class CajaConsultasController(CajaSqlService sql, ILogger<CajaConsultasController> logger) : ControllerBase
{
    private async Task<IActionResult> Read(Func<Task<object?>> query)
    {
        try { var result = await query(); return result is null ? NotFound(new { mensaje = "No se encontró el registro de Caja." }) : Ok(result); }
        catch (ArgumentException ex) {return BadRequest(new{mensaje=ex.Message});}
        catch (Exception ex) when (ex is not OperationCanceledException)
        { logger.LogError(ex, "Error al consultar Caja"); return StatusCode(500,new { mensaje = "No se pudo consultar la información de Caja." }); }
    }

    [HttpGet("filtros")]
    public Task<IActionResult> Filtros(CancellationToken ct) => Read(async () => {
        var codes=await sql.ConsultarFiltrosCajaAsync(ct);
        var channels=await sql.ConsultarCajaJsonAsync("SELECT (SELECT CanalVentaId Id,Nombre Descripcion,Activo FROM dbo.CanalVenta ORDER BY Nombre FOR JSON PATH)",[],ct);
        return new { tipo=codes["tipo"],medio=codes["medio"],estado=codes["estado"],origen=codes["origen"],canales=channels };
    });

    [HttpGet("movimientos/{fuente}/{id:long}")]
    public Task<IActionResult> Detalle(string fuente, long id, CancellationToken ct)
    {
        if (id <= 0 || fuente is not ("Caja" or "Financiero")) return Task.FromResult<IActionResult>(BadRequest(new { mensaje = "Movimiento inválido." }));
        return Read(async () => { var result=await sql.ConsultarCajaJsonAsync(CajaSqlService.DetalleFinancieroSql,new() { ["Fuente"]=fuente,["Id"]=id },ct); return result.ValueKind == System.Text.Json.JsonValueKind.Null ? null : result; });
    }

    [HttpGet("sesiones/{id:long}")]
    public Task<IActionResult> Sesion(long id, CancellationToken ct) => Read(async () => {
        var result=await sql.ConsultarEstadoDiarioAsync(ct,id); return result.Sesion is null ? null : result;
    });

    [HttpGet("movimientos")]
    public Task<IActionResult> Movimientos([FromQuery] CajaConsultaFiltro f, CancellationToken ct) => Lista(f,false,ct);
    [HttpGet("cierres")]
    public Task<IActionResult> Cierres([FromQuery] CajaConsultaFiltro f, CancellationToken ct) => Lista(f,true,ct);

    [HttpGet("reportes/{tipo}")]
    public Task<IActionResult> Reporte(string tipo,[FromQuery] CajaConsultaFiltro f,CancellationToken ct)=>LeerReporte(tipo,f,false,ct);
    [HttpGet("reportes/{tipo}/exportar"),RequirePermission("Caja","Exportar")]
    public Task<IActionResult> Exportar(string tipo,[FromQuery] CajaConsultaFiltro f,CancellationToken ct)=>LeerReporte(tipo,f,true,ct);
    private Task<IActionResult> LeerReporte(string tipo,CajaConsultaFiltro f,bool exportar,CancellationToken ct)
    {
        if(tipo is not("financieros" or "cierres" or "medios" or "bancos")||f.Desde?.Date>f.Hasta?.Date||f.Hasta?.Date==DateTime.MaxValue.Date||f.Pagina<1||f.Tamano is <1 or >200||(f.Buscar?.Length??0)>250||(tipo=="bancos"&&f.Cuenta is not >0))
            return Task.FromResult<IActionResult>(BadRequest(new{mensaje="Revisá reporte, período y cuenta bancaria."}));
        return Read(async()=>{
            Dictionary<string,object?> p=new(){["Desde"]=f.Desde?.Date,["Hasta"]=f.Hasta?.Date,["Buscar"]=Clean(f.Buscar),["Pagina"]=exportar?1:f.Pagina,["Tamano"]=exportar?20001:f.Tamano};
            string query;
            if(tipo=="bancos"){query=CajaSqlService.BancoConsultaSql;p["Cuenta"]=f.Cuenta;p["Dias"]=3;p["Estado"]=Clean(f.Estado);}
            else if(tipo=="cierres")query=CajaSqlService.CierresCajaSql;
            else{query=CajaSqlService.ListaFinancieraSql;p["Tipo"]=Clean(f.Tipo);p["Medio"]=Clean(f.Medio);p["Estado"]=Clean(f.Estado);p["Origen"]=Clean(f.Origen);p["Canal"]=f.Canal;p["Cuenta"]=f.Cuenta;p["Concepto"]=Clean(f.Concepto);}
            var result=await sql.ConsultarCajaJsonAsync(query,p,ct);
            if(tipo=="medios"){var summary=result.GetProperty("Resumen");return new{Total=summary.GetArrayLength(),Filas=summary,Integridad=result.GetProperty("Integridad")};}
            if(exportar&&result.GetProperty("Total").GetInt64()>20000)throw new ArgumentException("La exportación supera 20.000 registros. Reducí el período.");
            return (object)result;
        });
    }

    private Task<IActionResult> Lista(CajaConsultaFiltro f,bool cierres,CancellationToken ct)
    {
        if (f.Pagina<1 || f.Tamano is <1 or >200 || f.Desde?.Date>f.Hasta?.Date || f.Hasta?.Date==DateTime.MaxValue.Date
            || (f.Buscar?.Length??0)>250 || (f.Concepto?.Length??0)>250)
            return Task.FromResult<IActionResult>(BadRequest(new { mensaje="Revisá el período, la búsqueda y la paginación." }));
        Dictionary<string,object?> p=new() { ["Desde"]=f.Desde?.Date,["Hasta"]=f.Hasta?.Date,["Pagina"]=f.Pagina,["Tamano"]=f.Tamano,["Buscar"]=Clean(f.Buscar) };
        if (!cierres) { p["Tipo"]=Clean(f.Tipo);p["Medio"]=Clean(f.Medio);p["Estado"]=Clean(f.Estado);p["Origen"]=Clean(f.Origen);p["Canal"]=f.Canal;p["Cuenta"]=f.Cuenta;p["Concepto"]=Clean(f.Concepto); }
        return Read(async()=>await sql.ConsultarCajaJsonAsync(cierres?CajaSqlService.CierresCajaSql:CajaSqlService.ListaFinancieraSql,p,ct));
    }
    private static string? Clean(string? value)=>string.IsNullOrWhiteSpace(value)?null:value.Trim();
}
public sealed class CajaConsultaFiltro
{
    public DateTime? Desde { get;set; }
    public DateTime? Hasta { get;set; }
    public int Pagina { get;set; }=1;
    public int Tamano { get;set; }=10;
    public string? Buscar { get;set; }
    public string? Tipo { get;set; }
    public string? Medio { get;set; }
    public string? Estado { get;set; }
    public string? Origen { get;set; }
    public string? Concepto { get;set; }
    public int? Canal { get;set; }
    public int? Cuenta { get;set; }
}
