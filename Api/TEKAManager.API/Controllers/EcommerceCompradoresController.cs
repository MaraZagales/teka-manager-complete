using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

public sealed class RegistroCompradorRequest : ClienteInsertRequest
{
    [Required, MinLength(10), MaxLength(128)] public string Password { get; set; } = "";
}
public sealed class LoginCompradorRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
}
public sealed class TokenCompradorRequest { [Required] public string Token { get; set; } = ""; }
public sealed class RecuperarCompradorRequest { [Required, EmailAddress] public string Email { get; set; } = ""; }
public sealed class RestablecerCompradorRequest
{
    [Required] public string Token { get; set; } = "";
    [Required, MinLength(10), MaxLength(128)] public string NuevaPassword { get; set; } = "";
}

[ApiController]
[Route("api/ecommerce/compradores")]
public sealed class EcommerceCompradoresController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IEmailService _email;
    private readonly ILogger<EcommerceCompradoresController> _logger;
    public EcommerceCompradoresController(IConfiguration config, IEmailService email, ILogger<EcommerceCompradoresController> logger)
    { _config = config; _email = email; _logger = logger; }
    private SqlConnection Open() => new(_config.GetConnectionString("DefaultConnection"));
    private static string Normalize(string value) => value.Trim().ToLowerInvariant();
    private static byte[] HashToken(string value) => SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value));
    private static string NewToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    private static string HashPassword(string value)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var derived = Rfc2898DeriveBytes.Pbkdf2(value, salt, 210000, HashAlgorithmName.SHA256, 32);
        return $"PBKDF2-SHA256:210000:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(derived)}";
    }
    private static bool VerifyPassword(string value, string stored)
    {
        var p = stored.Split(':');
        if (p.Length != 4 || p[0] != "PBKDF2-SHA256" || !int.TryParse(p[1], out var n) || n < 100000 || n > 1000000) return false;
        try {
            var salt = Convert.FromBase64String(p[2]); var hash = Convert.FromBase64String(p[3]);
            return CryptographicOperations.FixedTimeEquals(hash, Rfc2898DeriveBytes.Pbkdf2(value, salt, n, HashAlgorithmName.SHA256, hash.Length));
        } catch (FormatException) { return false; }
    }
    private string BuildEcommerceLink(string action, string token)
    {
        var baseUrl = _config["Ecommerce:PublicBaseUrl"] ?? throw new InvalidOperationException("Configurar Ecommerce:PublicBaseUrl");
        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri) || uri.Scheme != "https")
            throw new InvalidOperationException("Ecommerce:PublicBaseUrl debe ser HTTPS");
        return baseUrl.TrimEnd('/') + "/" + action + "?token=" + Uri.EscapeDataString(token);
    }
    private async Task SendLink(string email, string subject, string action, string token)
    {
        var link = WebUtility.HtmlEncode(BuildEcommerceLink(action, token));
        await _email.SendAsync(email, subject, $"<p>Para continuar con TEKA, abrí este enlace:</p><p><a href=\"{link}\">Continuar</a></p><p>Si no lo solicitaste, ignorá este mensaje.</p>");
    }
    private static SqlParameter P(string name, object? value) => new(name, value ?? DBNull.Value);

    [HttpPost("registro")]
    public async Task<IActionResult> Registro([FromBody] RegistroCompradorRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest(new { mensaje = "El correo es obligatorio" });
        var email = Normalize(request.Email);
        if (request.TipoDocumentoId <= 0 || request.CondicionIVAId <= 0) return BadRequest(new { mensaje = "Tipo de documento y condición IVA son obligatorios" });
        var token = NewToken();
        try
        {
            await using var db = Open(); await db.OpenAsync();
            await using (var check = new SqlCommand("SELECT COUNT(1) FROM dbo.CuentaClienteEcommerce WHERE EmailNormalizado=@email", db))
            { check.Parameters.AddWithValue("@email", email); if (Convert.ToInt32(await check.ExecuteScalarAsync()) > 0) return Ok(new { mensaje = "Si corresponde, recibirás instrucciones por correo." }); }
            await using var cmd = new SqlCommand(@"INSERT dbo.RegistroPendienteEcommerce(EmailNormalizado,DatosJson,PasswordHash,TokenHash,FechaExpiracion)
VALUES(@email,@json,@pass,@hash,DATEADD(HOUR,1,SYSUTCDATETIME()))", db);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@json", JsonSerializer.Serialize(new ClienteInsertRequest { Nombre=request.Nombre, Apellido=request.Apellido, TipoDocumentoId=request.TipoDocumentoId, Documento=request.Documento, Telefono=request.Telefono, Email=email, CondicionIVAId=request.CondicionIVAId }));
            cmd.Parameters.AddWithValue("@pass", HashPassword(request.Password));
            cmd.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = HashToken(token);
            await cmd.ExecuteNonQueryAsync();
            await SendLink(email, "Verificá tu correo en TEKA", "verificar-cuenta", token);
            return Accepted(new { mensaje = "Revisá tu correo para confirmar el registro." });
        }
        catch (Exception ex) { _logger.LogError(ex, "Error en registro ecommerce"); return StatusCode(503, new { mensaje = "No se pudo procesar el registro." }); }
    }

    [HttpPost("verificar")]
    public async Task<IActionResult> Verificar([FromBody] TokenCompradorRequest request)
    {
        await using var db = Open(); await db.OpenAsync();
        await using var tx = (SqlTransaction)await db.BeginTransactionAsync(IsolationLevel.Serializable);
        try
        {
            long pendingId; string email, json, password;
            await using (var cmd = new SqlCommand(@"SELECT TOP 1 RegistroPendienteEcommerceId,EmailNormalizado,DatosJson,PasswordHash FROM dbo.RegistroPendienteEcommerce WITH(UPDLOCK,HOLDLOCK)
WHERE TokenHash=@hash AND FechaUtilizacion IS NULL AND FechaExpiracion>SYSUTCDATETIME()", db, tx))
            {
                cmd.Parameters.Add("@hash", SqlDbType.VarBinary,32).Value=HashToken(request.Token);
                await using var reader = await cmd.ExecuteReaderAsync();
                if (!await reader.ReadAsync()) { await tx.RollbackAsync(); return BadRequest(new { mensaje="Enlace inválido o vencido" }); }
                pendingId=reader.GetInt64(0); email=reader.GetString(1); json=reader.GetString(2); password=reader.GetString(3);
            }
            var data = JsonSerializer.Deserialize<ClienteInsertRequest>(json)!;
            int clienteId=0;
            // Solo vinculamos automáticamente si hay UNA coincidencia activa exacta de correo.
            await using (var find = new SqlCommand("SELECT ClienteId FROM dbo.Cliente WITH(UPDLOCK,HOLDLOCK) WHERE LOWER(LTRIM(RTRIM(Email)))=@email AND Activo=1",db,tx))
            {
                find.Parameters.AddWithValue("@email",email);
                await using var reader=await find.ExecuteReaderAsync();
                var matches=new List<int>(); while(await reader.ReadAsync()) matches.Add(reader.GetInt32(0));
                if(matches.Count>1) { await reader.DisposeAsync(); await tx.RollbackAsync(); return Conflict(new { mensaje="Existen múltiples clientes con ese correo. Contactá a TEKA para vincular la cuenta." }); }
                if(matches.Count==1) clienteId=matches[0];
            }
            await using (var check = new SqlCommand("SELECT COUNT(*) FROM dbo.CuentaClienteEcommerce WITH(UPDLOCK,HOLDLOCK) WHERE EmailNormalizado=@email OR ClienteId=@id",db,tx))
            { check.Parameters.AddWithValue("@email",email); check.Parameters.AddWithValue("@id",clienteId); if(Convert.ToInt32(await check.ExecuteScalarAsync())>0) { await tx.RollbackAsync(); return Conflict(new { mensaje="La cuenta ya está registrada." }); } }
            if(clienteId==0)
            {
                await using var insert = new SqlCommand("EXEC dbo.sp_Cliente_Insert @Nombre,@Apellido,@TipoDocumentoId,@Documento,@Telefono,@Email,@CondicionIVAId,@Observaciones",db,tx);
                insert.Parameters.AddWithValue("@Nombre",data.Nombre); insert.Parameters.Add(P("@Apellido",data.Apellido)); insert.Parameters.AddWithValue("@TipoDocumentoId",data.TipoDocumentoId);
                insert.Parameters.Add(P("@Documento",data.Documento)); insert.Parameters.Add(P("@Telefono",data.Telefono)); insert.Parameters.AddWithValue("@Email",email);
                insert.Parameters.AddWithValue("@CondicionIVAId",data.CondicionIVAId); insert.Parameters.Add(P("@Observaciones",null));
                clienteId=Convert.ToInt32(await insert.ExecuteScalarAsync());
            }
            await using (var create = new SqlCommand(@"INSERT dbo.CuentaClienteEcommerce(ClienteId,EmailNormalizado,PasswordHash,EmailVerificado,Activo)
VALUES(@cliente,@email,@password,1,1)
UPDATE dbo.RegistroPendienteEcommerce SET FechaUtilizacion=SYSUTCDATETIME() WHERE RegistroPendienteEcommerceId=@pending",db,tx))
            { create.Parameters.AddWithValue("@cliente",clienteId); create.Parameters.AddWithValue("@email",email); create.Parameters.AddWithValue("@password",password); create.Parameters.AddWithValue("@pending",pendingId); await create.ExecuteNonQueryAsync(); }
            await tx.CommitAsync(); return Ok(new { mensaje="Correo verificado. Ya podés iniciar sesión." });
        }
        catch (SqlException ex) { await tx.RollbackAsync(); _logger.LogError(ex,"Error SQL verificando ecommerce"); return StatusCode(500,new {mensaje="No se pudo verificar la cuenta."}); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCompradorRequest request)
    {
        var email=Normalize(request.Email);
        await using var db=Open(); await db.OpenAsync();
        int cuentaId=0, clienteId=0; string? hash=null;
        await using(var cmd=new SqlCommand(@"SELECT c.CuentaClienteEcommerceId,c.ClienteId,c.PasswordHash FROM dbo.CuentaClienteEcommerce c
INNER JOIN dbo.Cliente cl ON cl.ClienteId=c.ClienteId
WHERE c.EmailNormalizado=@email AND c.Activo=1 AND c.EmailVerificado=1 AND cl.Activo=1",db))
        { cmd.Parameters.AddWithValue("@email",email); await using var r=await cmd.ExecuteReaderAsync(); if(await r.ReadAsync()) {cuentaId=r.GetInt32(0);clienteId=r.GetInt32(1);hash=r.GetString(2);} }
        if(hash is null || !VerifyPassword(request.Password,hash)) return Unauthorized(new { mensaje="Credenciales inválidas" });
        await using(var cmd=new SqlCommand("UPDATE dbo.CuentaClienteEcommerce SET FechaUltimoAcceso=SYSUTCDATETIME() WHERE CuentaClienteEcommerceId=@id",db))
        {cmd.Parameters.AddWithValue("@id",cuentaId); await cmd.ExecuteNonQueryAsync();}
        return Ok(new { accessToken=EcommerceJwtSetup.Create(_config,cuentaId,clienteId,email), tokenType="Bearer", expiresIn=7200 });
    }

    [Authorize(AuthenticationSchemes=EcommerceJwtSetup.Scheme)]
    [HttpGet("mi-cuenta")]
    public async Task<IActionResult> MiCuenta([FromServices] IClienteService clientes)
    {
        if(User.FindFirst("identity_type")?.Value!="buyer" || !int.TryParse(User.FindFirst("cliente_id")?.Value,out var id)) return Forbid();
        await using var db=Open(); await db.OpenAsync();
        await using(var cmd=new SqlCommand(@"SELECT COUNT(*) FROM dbo.CuentaClienteEcommerce c JOIN dbo.Cliente cl ON cl.ClienteId=c.ClienteId
WHERE c.ClienteId=@id AND c.Activo=1 AND c.EmailVerificado=1 AND cl.Activo=1",db))
        {cmd.Parameters.AddWithValue("@id",id); if(Convert.ToInt32(await cmd.ExecuteScalarAsync())==0)return Unauthorized();}
        var cliente=await clientes.GetByIdAsync(id);
        if(cliente is null)return NotFound();
        return Ok(new { cliente.ClienteId, cliente.Nombre, cliente.Apellido, cliente.TipoDocumentoId, cliente.Documento, cliente.Telefono, cliente.Email, cliente.CondicionIVAId });
    }

    [HttpPost("recuperar-password")]
    public async Task<IActionResult> Recuperar([FromBody] RecuperarCompradorRequest request)
    {
        var email=Normalize(request.Email); var token=NewToken();
        try {
            await using var db=Open();await db.OpenAsync();
            await using var cmd=new SqlCommand(@"INSERT dbo.TokenRecuperacionClienteEcommerce(CuentaClienteEcommerceId,TokenHash,FechaExpiracion)
SELECT CuentaClienteEcommerceId,@hash,DATEADD(MINUTE,30,SYSUTCDATETIME()) FROM dbo.CuentaClienteEcommerce
WHERE EmailNormalizado=@email AND Activo=1 AND EmailVerificado=1",db);
            cmd.Parameters.AddWithValue("@email",email);cmd.Parameters.Add("@hash",SqlDbType.VarBinary,32).Value=HashToken(token);
            var affected=await cmd.ExecuteNonQueryAsync();
            if(affected>0) await SendLink(email,"Recuperá tu acceso a TEKA","restablecer-password",token);
        } catch(Exception ex) { _logger.LogError(ex,"Error recuperación ecommerce"); }
        return Accepted(new { mensaje="Si existe una cuenta, recibirás un correo con instrucciones." });
    }

    [HttpPost("restablecer-password")]
    public async Task<IActionResult> Restablecer([FromBody] RestablecerCompradorRequest request)
    {
        await using var db=Open();await db.OpenAsync();
        await using var tx=(SqlTransaction)await db.BeginTransactionAsync(IsolationLevel.Serializable);
        try {
            int cuentaId;
            await using(var cmd=new SqlCommand(@"SELECT TOP 1 t.CuentaClienteEcommerceId FROM dbo.TokenRecuperacionClienteEcommerce t WITH(UPDLOCK,HOLDLOCK)
JOIN dbo.CuentaClienteEcommerce c ON c.CuentaClienteEcommerceId=t.CuentaClienteEcommerceId
WHERE t.TokenHash=@hash AND t.FechaUtilizacion IS NULL AND t.FechaExpiracion>SYSUTCDATETIME() AND c.Activo=1",db,tx))
            {cmd.Parameters.Add("@hash",SqlDbType.VarBinary,32).Value=HashToken(request.Token);var id=await cmd.ExecuteScalarAsync();if(id is null){await tx.RollbackAsync();return BadRequest(new {mensaje="Enlace inválido o vencido"});} cuentaId=Convert.ToInt32(id);}
            await using(var cmd=new SqlCommand(@"UPDATE dbo.CuentaClienteEcommerce SET PasswordHash=@password WHERE CuentaClienteEcommerceId=@id;
UPDATE dbo.TokenRecuperacionClienteEcommerce SET FechaUtilizacion=SYSUTCDATETIME() WHERE CuentaClienteEcommerceId=@id AND FechaUtilizacion IS NULL",db,tx))
            {cmd.Parameters.AddWithValue("@password",HashPassword(request.NuevaPassword));cmd.Parameters.AddWithValue("@id",cuentaId);await cmd.ExecuteNonQueryAsync();}
            await tx.CommitAsync();return Ok(new {mensaje="Contraseña actualizada"});
        } catch(SqlException ex){await tx.RollbackAsync();_logger.LogError(ex,"Error restablecimiento ecommerce");return StatusCode(500,new {mensaje="No se pudo actualizar la contraseña"});}
    }
}
