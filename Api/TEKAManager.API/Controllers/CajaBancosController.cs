using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Services;
using TEKAManager.API.Security;

namespace TEKAManager.API.Controllers;
[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[Route("api/caja-bancos")]
public sealed class CajaBancosController(CajaSqlService sql, ILogger<CajaBancosController> logger) : ControllerBase
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

    [HttpGet("cuentas"), RequirePermission("Caja", "Ver")]
    public async Task<IActionResult> Cuentas([FromServices] TEKAManager.Core.Data.TekaDbContext db, CancellationToken ct)
    {
        var cuentas = await db.Database.SqlQueryRaw<CuentaBancoVista>(
            "SELECT CuentaBancariaId, Nombre, Banco, Moneda, Activa FROM dbo.CuentaBancariaTEKA")
            .ToListAsync(ct);
        return Ok(cuentas);
    }

    [HttpGet("movimientos"), RequirePermission("Caja", "Ver")]
    public Task<IActionResult> Movimientos([FromQuery] int cuentaBancariaId, [FromQuery] string? estado,
        [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct) =>
        Run("dbo.sp_Banco_ListarMovimientos", new() { ["CuentaBancariaId"] = cuentaBancariaId,
            ["Estado"] = estado, ["Desde"] = desde?.Date, ["Hasta"] = hasta?.Date }, ct);

    [HttpGet("sugerencias"), RequirePermission("Caja", "Ver")]
    public Task<IActionResult> Sugerencias([FromQuery] int cuentaBancariaId, [FromQuery] int diasTolerancia = 3,
        CancellationToken ct = default) =>
        Run("dbo.sp_Banco_SugerirConciliaciones", new() { ["CuentaBancariaId"] = cuentaBancariaId,
            ["DiasTolerancia"] = diasTolerancia }, ct);

    [HttpPost("importaciones"), RequirePermission("Caja", "Crear")]
    public Task<IActionResult> Importar([FromBody] ImportacionBancoRequest r, CancellationToken ct) =>
        Run("dbo.sp_Banco_CrearImportacion", new() { ["CuentaBancariaId"] = r.CuentaBancariaId,
            ["NombreArchivo"] = r.NombreArchivo, ["HuellaArchivo"] = r.HuellaArchivo,
            ["UsuarioId"] = UsuarioId }, ct);

    [HttpPost("importaciones/{importacionId:long}/movimientos"), RequirePermission("Caja", "Crear")]
    public Task<IActionResult> Agregar(long importacionId, [FromBody] MovimientoBancoRequest r, CancellationToken ct) =>
        Run("dbo.sp_Banco_AgregarMovimiento", new() { ["BancoImportacionId"] = importacionId,
            ["FechaMovimiento"] = r.FechaMovimiento.Date, ["Tipo"] = r.Tipo,
            ["Importe"] = r.Importe, ["Descripcion"] = r.Descripcion,
            ["ReferenciaBanco"] = r.ReferenciaBanco, ["ClaveMovimiento"] = r.ClaveMovimiento }, ct);

    [HttpPost("importaciones/{importacionId:long}/finalizar"), RequirePermission("Caja", "Editar")]
    public Task<IActionResult> Finalizar(long importacionId, CancellationToken ct) =>
        Run("dbo.sp_Banco_FinalizarImportacion", new() { ["BancoImportacionId"] = importacionId }, ct);

    [HttpPost("conciliaciones"), RequirePermission("Caja", "Editar")]
    public Task<IActionResult> Conciliar([FromBody] ConciliacionBancoRequest r, CancellationToken ct) => Flujo(()=>sql.ConciliarValidadoAsync(r.BancoMovimientoId,r.MovimientoFinancieroId,UsuarioId,r.DiasTolerancia,r.Observaciones,ct));

    [HttpPost("extractos/vista-previa"),RequirePermission("Caja","Crear"),RequestSizeLimit(5_000_000)]
    public Task<IActionResult> VistaPrevia(BancoExtractoRequest r,CancellationToken ct)=>Flujo(()=>sql.ProcesarExtractoAsync(r,UsuarioId,false,ct));
    [HttpPost("extractos/confirmar"),RequirePermission("Caja","Crear"),RequestSizeLimit(5_000_000)]
    public Task<IActionResult> ConfirmarExtracto(BancoExtractoRequest r,CancellationToken ct)=>Flujo(()=>sql.ProcesarExtractoAsync(r,UsuarioId,true,ct));
    [HttpGet("consulta"),RequirePermission("Caja","Ver")]
    public async Task<IActionResult> Consulta([FromQuery] int cuenta,[FromQuery] DateTime? desde,[FromQuery] DateTime? hasta,[FromQuery] string? estado,[FromQuery] string? buscar,[FromQuery] int dias=3,[FromQuery] int pagina=1,[FromQuery] int tamano=10,CancellationToken ct=default)
    {
        if(cuenta<=0||desde>hasta||dias is <0 or >30||pagina<1||tamano is <1 or >200||(buscar?.Length??0)>250)return BadRequest(new{mensaje="Revisá cuenta, período y filtros."});
        return await Flujo(async()=>await sql.ConsultarCajaJsonAsync(CajaSqlService.BancoConsultaSql,new(){["Cuenta"]=cuenta,["Desde"]=desde?.Date,["Hasta"]=hasta?.Date,["Estado"]=string.IsNullOrWhiteSpace(estado)?null:estado,["Buscar"]=string.IsNullOrWhiteSpace(buscar)?null:buscar.Trim(),["Dias"]=dias,["Pagina"]=pagina,["Tamano"]=tamano},ct));
    }
    [HttpGet("movimientos/{id:long}/candidatos"),RequirePermission("Caja","Ver")]
    public Task<IActionResult> Candidatos(long id,[FromQuery] int dias=3,CancellationToken ct=default)=>id<=0||dias is <0 or >30?Task.FromResult<IActionResult>(BadRequest(new{mensaje="Movimiento o tolerancia inválidos."})):Flujo(async()=>await sql.ConsultarCajaJsonAsync(CajaSqlService.BancoCandidatosSql,new(){["Id"]=id,["Dias"]=dias},ct));
    private async Task<IActionResult> Flujo(Func<Task<object>> operation)
    {
        try{return Ok(await operation());}
        catch(ArgumentException ex){return BadRequest(new{mensaje=ex.Message});}
        catch(SqlException ex) when(ex.Number is 2601 or 2627){return Conflict(new{mensaje="El archivo, movimiento o conciliación ya está registrado. Actualizá la consulta."});}
        catch(SqlException ex) when(ex.Number is >=50000 and <54000){return BadRequest(new{mensaje=ex.Message});}
        catch(Exception ex) when(ex is not OperationCanceledException){logger.LogError(ex,"Flujo bancario de Caja");return StatusCode(500,new{mensaje="No se pudo completar la operación bancaria."});}
    }
}

public sealed class CuentaBancoVista
{
    public int CuentaBancariaId { get; set; }
    public string Nombre { get; set; } = "";
    public string Banco { get; set; } = "";
    public string Moneda { get; set; } = "";
    public bool Activa { get; set; }
}
public sealed record ImportacionBancoRequest(int CuentaBancariaId, string NombreArchivo, string HuellaArchivo);
public sealed record MovimientoBancoRequest(DateTime FechaMovimiento, string Tipo, decimal Importe,
    string Descripcion, string? ReferenciaBanco, string ClaveMovimiento);
public sealed record ConciliacionBancoRequest(long BancoMovimientoId, long MovimientoFinancieroId, string? Observaciones,int DiasTolerancia=3);
