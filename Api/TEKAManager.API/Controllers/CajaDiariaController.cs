using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Services;
using TEKAManager.API.Security;

namespace TEKAManager.API.Controllers;
[ApiController]
[Authorize(AuthenticationSchemes = "Bearer")]
[Route("api/caja-diaria")]
public sealed class CajaDiariaController(CajaSqlService sql, ILogger<CajaDiariaController> logger) : ControllerBase
{
    private int UsuarioId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
    private async Task<IActionResult> Run(string sp, Dictionary<string, object?> p, CancellationToken ct)
    {
        if (UsuarioId <= 0) return Unauthorized();
        try
        {
            var estado = await sql.ConsultarEstadoDiarioAsync(ct);
            if (p.TryGetValue("CajaId", out var cajaId) && Convert.ToInt32(cajaId) != estado.Caja.CajaId)
                return BadRequest(new { mensaje = "La operación corresponde únicamente a la caja física activa." });
            if (p.TryGetValue("CajaSesionId", out var sesionId) && Convert.ToInt64(sesionId) != estado.Sesion?.CajaSesionId)
                return BadRequest(new { mensaje = "La sesión cambió o ya está cerrada. Actualizá Caja diaria." });
            return Ok(await sql.EjecutarAsync(sp, p, ct));
        }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        { return BadRequest(new { mensaje = ex.Message }); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Error SQL en {Procedure}", sp);
            return StatusCode(500, new { mensaje = "Error al procesar la operación de Caja." });
        }
    }

    [HttpGet("estado"), RequirePermission("Caja", "Ver")]
    public async Task<IActionResult> Estado(CancellationToken ct)
    {
        try { return Ok(await sql.ConsultarEstadoDiarioAsync(ct)); }
        catch (SqlException ex) when (ex.Number >= 50000 && ex.Number < 54000)
        { return BadRequest(new { mensaje = ex.Message }); }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "Error al consultar Caja diaria");
            return StatusCode(500, new { mensaje = "No se pudo consultar el estado de Caja diaria. Intentá nuevamente." });
        }
    }

    private static bool ImporteValido(decimal? importe, bool admiteCero = true) =>
        importe is { } valor && valor >= (admiteCero ? 0m : 0.01m) && valor <= 999999999999.99m && decimal.Round(valor, 2) == valor;

    private static bool TextoValido(string? texto, int maximo, bool obligatorio = false) =>
        (!obligatorio || !string.IsNullOrWhiteSpace(texto)) && (texto?.Length ?? 0) <= maximo;

    [HttpGet("sesiones"), RequirePermission("Caja", "Ver")]
    public Task<IActionResult> Sesiones([FromQuery] int? cajaId, [FromQuery] bool soloAbiertas, CancellationToken ct) =>
        Consultar("dbo.sp_CajaDiaria_Consultar", new() { ["CajaId"] = cajaId, ["SoloAbiertas"] = soloAbiertas }, ct);

    [HttpGet("sesiones/{sesionId:long}/movimientos"), RequirePermission("Caja", "Ver")]
    public Task<IActionResult> Movimientos(long sesionId, CancellationToken ct) =>
        Consultar("dbo.sp_CajaDiaria_ListarMovimientos", new() { ["CajaSesionId"] = sesionId }, ct);

    private async Task<IActionResult> Consultar(string sp, Dictionary<string, object?> parametros, CancellationToken ct)
    {
        try { return Ok(await sql.EjecutarAsync(sp, parametros, ct)); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Error de consulta en {Procedure}", sp);
            return StatusCode(500, new { mensaje = "No se pudo consultar la información de Caja." });
        }
    }

    [HttpPut("cajas/{cajaId:int}/fondo-fijo"), RequirePermission("Caja", "Editar")]
    public async Task<IActionResult> Fondo(int cajaId, [FromBody] FondoRequest r, CancellationToken ct)
    {
        if (!ImporteValido(r.Importe, false)) return BadRequest(new { mensaje = "Ingresá un fondo fijo mayor que cero, con hasta dos decimales." });
        return await Run("dbo.sp_CajaDiaria_ConfigurarFondo", new() { ["CajaId"] = cajaId, ["FondoFijoObjetivo"] = r.Importe, ["UsuarioId"] = UsuarioId }, ct);
    }

    [HttpPost("cajas/{cajaId:int}/abrir"), RequirePermission("Caja", "Crear")]
    public async Task<IActionResult> Abrir(int cajaId, [FromBody] AperturaRequest r, CancellationToken ct)
    {
        if (!ImporteValido(r.EfectivoInicial)) return BadRequest(new { mensaje = "Ingresá el efectivo inicial contado, mayor o igual a cero y con hasta dos decimales." });
        if (!TextoValido(r.Observacion, 500)) return BadRequest(new { mensaje = "Las observaciones admiten hasta 500 caracteres." });
        return await Run("dbo.sp_CajaDiaria_Abrir", new() { ["CajaId"] = cajaId, ["UsuarioId"] = UsuarioId, ["EfectivoInicial"] = r.EfectivoInicial, ["Observacion"] = r.Observacion?.Trim() }, ct);
    }

    [HttpPost("sesiones/{sesionId:long}/movimientos"), RequirePermission("Caja", "Crear")]
    public async Task<IActionResult> Movimiento(long sesionId, [FromBody] CajaMovimientoRequest r, CancellationToken ct)
    {
        if (!CajaSqlService.TiposManuales.Any(t => t.Codigo == r.Tipo)) return BadRequest(new { mensaje = "Seleccioná un tipo de movimiento manual permitido." });
        if (!ImporteValido(r.Importe, false)) return BadRequest(new { mensaje = "Ingresá un importe mayor que cero, con hasta dos decimales." });
        if (!TextoValido(r.Concepto, 250, true)) return BadRequest(new { mensaje = "Completá la descripción con hasta 250 caracteres." });
        if (!TextoValido(r.Referencia, 150) || !TextoValido(r.Observaciones, 500)) return BadRequest(new { mensaje = "La referencia admite 150 caracteres y las observaciones, 500." });
        if(r.ClaveOperacion==Guid.Empty)return BadRequest(new{mensaje="La clave de operación no puede estar vacía."});
        var ready=await sql.ConceptosDisponiblesAsync(ct);
        if(ready && r.CajaConceptoId is not >0)return BadRequest(new{mensaje="Seleccioná un concepto de caja activo correspondiente al tipo."});
        if(ready&&!await sql.ConceptoPermitidoAsync(r.CajaConceptoId!.Value,r.Tipo!,ct))return BadRequest(new{mensaje="El concepto está inactivo o no corresponde al tipo seleccionado."});
        if(!ready && r.CajaConceptoId.HasValue)return Conflict(new{mensaje="El catálogo todavía no está habilitado en SQL. Actualizá el formulario."});
        Dictionary<string,object?> p=new(){["CajaSesionId"]=sesionId,["UsuarioId"]=UsuarioId,["Tipo"]=r.Tipo,["Importe"]=r.Importe,["Concepto"]=r.Concepto!.Trim(),["Referencia"]=r.Referencia?.Trim(),["Observaciones"]=r.Observaciones?.Trim()};
        if(ready)p["CajaConceptoId"]=r.CajaConceptoId;
        if(r.ClaveOperacion.HasValue)
        {
            var support=await sql.ConsultarCajaJsonAsync("SELECT (SELECT COUNT(*) Cantidad FROM sys.parameters WHERE object_id=OBJECT_ID('dbo.sp_CajaDiaria_RegistrarMovimiento') AND name='@ClaveOperacion' FOR JSON PATH,WITHOUT_ARRAY_WRAPPER)",[],ct);
            if(support.GetProperty("Cantidad").GetInt32()!=1)return Conflict(new{mensaje="La clave de operación requiere aplicar Caja_INTEGRIDAD_COBROS_PENDIENTE_APROBACION.sql. No se registró el movimiento."});
            p["ClaveOperacion"]=r.ClaveOperacion.Value;
        }
        return await Run("dbo.sp_CajaDiaria_RegistrarMovimiento",p,ct);
    }

    [HttpPost("sesiones/{sesionId:long}/arqueos"), RequirePermission("Caja", "Editar")]
    public async Task<IActionResult> Arqueo(long sesionId, [FromBody] ArqueoRequest r, CancellationToken ct)
    {
        if (!ImporteValido(r.EfectivoContado)) return BadRequest(new { mensaje = "Ingresá el efectivo contado, mayor o igual a cero y con hasta dos decimales." });
        if (!TextoValido(r.Observaciones, 500)) return BadRequest(new { mensaje = "Las observaciones admiten hasta 500 caracteres." });
        return await Run("dbo.sp_CajaDiaria_Arqueo", new() { ["CajaSesionId"] = sesionId, ["UsuarioId"] = UsuarioId, ["EfectivoContado"] = r.EfectivoContado, ["Observaciones"] = r.Observaciones?.Trim() }, ct);
    }

    [HttpPost("sesiones/{sesionId:long}/cerrar"), RequirePermission("Caja", "Editar")]
    public async Task<IActionResult> Cerrar(long sesionId, [FromBody] CierreRequest r, CancellationToken ct)
    {
        if (!TextoValido(r.Observacion, 500)) return BadRequest(new { mensaje = "La observación de cierre admite hasta 500 caracteres." });
        return await Run("dbo.sp_CajaDiaria_Cerrar", new() { ["CajaSesionId"] = sesionId, ["UsuarioId"] = UsuarioId, ["ObservacionCierre"] = r.Observacion?.Trim() }, ct);
    }
}

public sealed record FondoRequest(decimal? Importe);
public sealed record AperturaRequest(decimal? EfectivoInicial, string? Observacion);
public sealed record CajaMovimientoRequest(string? Tipo, decimal? Importe, string? Concepto, string? Referencia, string? Observaciones,int? CajaConceptoId=null,Guid? ClaveOperacion=null);
public sealed record ArqueoRequest(decimal? EfectivoContado, string? Observaciones);
public sealed record CierreRequest(string? Observacion);
