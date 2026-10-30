using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TEKAManager.Core.Data;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class PasswordRecoveryService : IPasswordRecoveryService
{
    private readonly TekaDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;

    public PasswordRecoveryService(
        TekaDbContext db,
        IEmailService email,
        IConfiguration config)
    {
        _db = db;
        _email = email;
        _config = config;
    }

    public async Task SolicitarAsync(PasswordRecoveryStartRequest request)
    {
        var value = request.UsuarioOEmail.Trim();

        if (value.Length < 3)
        {
            return;
        }

        var users = await _db.Database
            .SqlQueryRaw<UsuarioRecuperacion>(
                "EXEC dbo.sp_Usuario_GetByUsernameOrEmail @Valor",
                new SqlParameter("@Valor", value))
            .ToListAsync();

        var user = users.FirstOrDefault();

        // La respuesta se mantiene neutra para no revelar
        // si un usuario o email existe en el sistema.
        if (user is null ||
            !user.Activo ||
            string.IsNullOrWhiteSpace(user.Email))
        {
            return;
        }

        // Invalida recuperaciones anteriores todavía pendientes.
        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_RecuperacionPassword_InvalidarPendientes @UsuarioId",
            new SqlParameter("@UsuarioId", user.UsuarioId));

        // Generamos el token que recibirá el usuario.
        var rawToken = CreateToken();

        // En la base de datos se guarda solamente su hash.
        var tokenHash = Hash(rawToken);

        var fechaExpiracion = DateTime.Now.AddMinutes(30);

        await _db.Database.ExecuteSqlRawAsync(
            """
            EXEC dbo.sp_RecuperacionPassword_Insert
                @UsuarioId,
                @TokenRecuperacion,
                @FechaExpiracion
            """,
            new SqlParameter("@UsuarioId", user.UsuarioId),
            new SqlParameter("@TokenRecuperacion", tokenHash),
            new SqlParameter("@FechaExpiracion", fechaExpiracion));

        var baseUrl =
            (_config["Frontend:BaseUrl"] ?? "http://localhost:5173")
            .TrimEnd('/');

        var recoveryUrl =
            $"{baseUrl}/?view=reset-password&token={Uri.EscapeDataString(rawToken)}";

        var contenidoEmail =
            EmailTemplates.PasswordRecovery(
                user.Nombre,
                recoveryUrl);

        await _email.SendAsync(
            user.Email,
            "Recuperá tu acceso a TEKA Manager",
            contenidoEmail);
    }

    public async Task<bool> ValidarTokenAsync(string token)
    {
        var recuperacion = await GetAsync(token);

        return recuperacion is not null &&
               !recuperacion.Utilizado &&
               recuperacion.FechaExpiracion >= DateTime.Now;
    }

    public async Task RestablecerAsync(
        PasswordRecoveryResetRequest request)
    {
        ValidatePassword(request.PasswordNueva);

        var recuperacion = await GetAsync(request.Token);

        if (recuperacion is null ||
            recuperacion.Utilizado ||
            recuperacion.FechaExpiracion < DateTime.Now)
        {
            throw new InvalidOperationException(
                "El enlace de recuperación es inválido o venció.");
        }

        await using var transaction =
            await _db.Database.BeginTransactionAsync();

        await _db.Database.ExecuteSqlRawAsync(
            """
            EXEC dbo.sp_Usuario_ResetPasswordRecuperacion
                @UsuarioId,
                @PasswordNueva
            """,
            new SqlParameter(
                "@UsuarioId",
                recuperacion.UsuarioId),
            new SqlParameter(
                "@PasswordNueva",
                request.PasswordNueva));

        await _db.Database.ExecuteSqlRawAsync(
            """
            EXEC dbo.sp_RecuperacionPassword_MarcarUtilizado
                @RecuperacionPasswordId
            """,
            new SqlParameter(
                "@RecuperacionPasswordId",
                recuperacion.RecuperacionPasswordId));

        await transaction.CommitAsync();

        // El correo de confirmación se envía después del commit.
        // Si Gmail falla, el cambio de contraseña ya realizado
        // no se revierte.
        var contenidoEmail =
            EmailTemplates.PasswordChanged(
                recuperacion.Username);

        await _email.SendAsync(
            recuperacion.Email,
            "Tu contraseña de TEKA Manager fue actualizada",
            contenidoEmail);
    }

    private async Task<RecuperacionPasswordDetalle?> GetAsync(
        string rawToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return null;
        }

        var tokenHash = Hash(rawToken);

        var recuperaciones = await _db.Database
            .SqlQueryRaw<RecuperacionPasswordDetalle>(
                """
                EXEC dbo.sp_RecuperacionPassword_GetByToken
                    @TokenRecuperacion
                """,
                new SqlParameter(
                    "@TokenRecuperacion",
                    tokenHash))
            .ToListAsync();

        return recuperaciones.FirstOrDefault();
    }

    private static string CreateToken()
    {
        return Convert
            .ToBase64String(
                RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string Hash(string value)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(value)));
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) ||
            password.Length < 8)
        {
            throw new InvalidOperationException(
                "La nueva contraseña debe tener al menos 8 caracteres.");
        }

        if (!password.Any(char.IsUpper) ||
            !password.Any(char.IsLower) ||
            !password.Any(char.IsDigit))
        {
            throw new InvalidOperationException(
                "La nueva contraseña debe incluir mayúscula, minúscula y número.");
        }
    }
}