using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class AuthService : IAuthService
{
    private const int MaxIntentosFallidos = 3;
    private readonly TekaDbContext _db;

    public AuthService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<LoginResponseDTO> LoginAsync(LoginRequest request, string? ipOrigen)
    {
        ValidateLogin(request);

        var username = request.Username.Trim();
        var password = request.Password.Trim();
        var usuario = await GetUsuarioByUsernameAsync(username);

        if (usuario is null)
        {
            return LoginFallido("Usuario o contrasena incorrectos.");
        }

        if (!usuario.Activo)
            return LoginFallido("El usuario se encuentra inactivo.");

        if (usuario.Bloqueado)
            return LoginFallido("El usuario se encuentra bloqueado.");

        if (!string.Equals(usuario.Password, password, StringComparison.Ordinal))
        {
            await RegistrarLoginFallidoAsync(usuario);
            return LoginFallido("Usuario o contrasena incorrectos.");
        }

        await RegistrarLoginExitosoAsync(usuario.UsuarioId);

        usuario = await GetUsuarioByUsernameAsync(username) ?? usuario;

        return new LoginResponseDTO
        {
            Exitoso = true,
            Mensaje = "Login exitoso.",
            AuditoriaSesionId = await RegistrarAuditoriaSesionAsync(usuario.UsuarioId, ipOrigen),
            Usuario = MapUsuarioSesion(usuario),
            Roles = (await GetRolesByUsuarioAsync(usuario.UsuarioId)).ToList(),
            Permisos = (await GetPermisosEfectivosAsync(usuario.UsuarioId)).ToList()
        };
    }

    public async Task CerrarSesionAsync(LogoutRequest request)
    {
        if (request.AuditoriaSesionId <= 0)
            throw new InvalidOperationException("Debe indicar una sesion valida.");

        var pId = new SqlParameter("@AuditoriaSesionId", request.AuditoriaSesionId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_AuditoriaSesion_Cerrar @AuditoriaSesionId",
            pId);
    }

    public async Task<IEnumerable<UsuarioPermisoEfectivoDTO>> GetPermisosEfectivosAsync(int usuarioId)
    {
        if (usuarioId <= 0)
            throw new InvalidOperationException("Debe indicar un usuario valido.");

        var permisos = new List<UsuarioPermisoEfectivoDTO>();
        var connection = _db.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Usuario_GetPermisosEfectivos";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UsuarioId", usuarioId));

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            permisos.Add(new UsuarioPermisoEfectivoDTO
            {
                UsuarioId = ReadInt(reader, "UsuarioId"),
                Username = ReadString(reader, "Username") ?? string.Empty,
                RolId = ReadInt(reader, "RolId"),
                RolNombre = ReadString(reader, "RolNombre") ?? string.Empty,
                MenuId = ReadInt(reader, "MenuId"),
                MenuNombre = ReadString(reader, "MenuNombre") ?? string.Empty,
                Ruta = ReadString(reader, "Ruta"),
                Modulo = ReadString(reader, "Modulo") ?? string.Empty,
                OrdenVisual = ReadInt(reader, "OrdenVisual"),
                PermisoId = ReadInt(reader, "PermisoId"),
                PermisoNombre = ReadString(reader, "PermisoNombre") ?? string.Empty
            });
        }

        return permisos;
    }

    public async Task<ValidarAccesoDTO> ValidarAccesoMenuAsync(int usuarioId, int menuId, string permisoNombre)
    {
        if (usuarioId <= 0)
            throw new InvalidOperationException("Debe indicar un usuario valido.");

        if (menuId <= 0)
            throw new InvalidOperationException("Debe indicar un menu valido.");

        if (string.IsNullOrWhiteSpace(permisoNombre))
            throw new InvalidOperationException("Debe indicar un permiso valido.");

        var connection = _db.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_Usuario_ValidarAccesoMenu";
        command.CommandType = CommandType.StoredProcedure;
        command.Parameters.Add(new SqlParameter("@UsuarioId", usuarioId));
        command.Parameters.Add(new SqlParameter("@MenuId", menuId));
        command.Parameters.Add(new SqlParameter("@PermisoNombre", permisoNombre.Trim()));

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return new ValidarAccesoDTO();

        return new ValidarAccesoDTO
        {
            TieneAcceso = ReadBoolean(reader, "TieneAcceso")
        };
    }

    private async Task<UsuarioConPassword?> GetUsuarioByUsernameAsync(string username)
    {
        var pUsername = new SqlParameter("@Username", username);

        var usuarios = await _db.Database
            .SqlQueryRaw<UsuarioConPassword>("EXEC dbo.sp_Usuario_GetByUsername @Username", pUsername)
            .ToListAsync();

        return usuarios.FirstOrDefault();
    }

    private async Task RegistrarLoginExitosoAsync(int usuarioId)
    {
        var pUsuarioId = new SqlParameter("@UsuarioId", usuarioId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_LoginExitoso @UsuarioId",
            pUsuarioId);
    }

    private async Task RegistrarLoginFallidoAsync(Usuario usuario)
    {
        var pUsuarioId = new SqlParameter("@UsuarioId", usuario.UsuarioId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_LoginFallido @UsuarioId",
            pUsuarioId);

        if (usuario.IntentosFallidos + 1 < MaxIntentosFallidos)
            return;

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Bloquear @UsuarioId",
            new SqlParameter("@UsuarioId", usuario.UsuarioId));
    }

    private async Task<int?> RegistrarAuditoriaSesionAsync(int usuarioId, string? ipOrigen)
    {
        var pUsuarioId = new SqlParameter("@UsuarioId", usuarioId);
        var pExitoso = new SqlParameter("@Exitoso", true);
        var pIpOrigen = new SqlParameter("@IpOrigen", string.IsNullOrWhiteSpace(ipOrigen) ? DBNull.Value : ipOrigen);
        var pObservaciones = new SqlParameter("@Observaciones", "Login exitoso");

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_AuditoriaSesion_Insert @UsuarioId, @Exitoso, @IpOrigen, @Observaciones",
                pUsuarioId, pExitoso, pIpOrigen, pObservaciones)
            .ToListAsync();

        if (result.Count == 0)
            return null;

        return Convert.ToInt32(result.FirstOrDefault());
    }
    private async Task<IEnumerable<UsuarioRolDTO>> GetRolesByUsuarioAsync(int usuarioId)
    {
        var pId = new SqlParameter("@UsuarioId", usuarioId);

        var roles = await _db.Database
            .SqlQueryRaw<UsuarioRol>("EXEC dbo.sp_UsuarioRol_GetByUsuario @UsuarioId", pId)
            .ToListAsync();

        return roles.Select(r => new UsuarioRolDTO
        {
            UsuarioRolId = r.UsuarioRolId,
            UsuarioId = r.UsuarioId,
            RolId = r.RolId,
            RolNombre = r.RolNombre,
            Descripcion = r.Descripcion
        });
    }

    private static LoginResponseDTO LoginFallido(string mensaje) => new()
    {
        Exitoso = false,
        Mensaje = mensaje
    };

    private static UsuarioSesionDTO MapUsuarioSesion(Usuario usuario) => new()
    {
        UsuarioId = usuario.UsuarioId,
        Username = usuario.Username,
        Nombre = usuario.Nombre,
        Apellido = usuario.Apellido,
        Email = usuario.Email,
        Activo = usuario.Activo,
        Bloqueado = usuario.Bloqueado,
        IntentosFallidos = usuario.IntentosFallidos,
        FechaAlta = usuario.FechaAlta,
        UltimoLogin = usuario.UltimoLogin
    };

    private static void ValidateLogin(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            throw new InvalidOperationException("Debe informar el usuario.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Debe informar la contrasena.");
    }

    private static bool HasColumn(IDataRecord reader, string columnName)
    {
        for (var i = 0; i < reader.FieldCount; i++)
        {
            if (string.Equals(reader.GetName(i), columnName, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    private static string? ReadString(IDataRecord reader, string columnName)
    {
        if (!HasColumn(reader, columnName))
            return null;

        var value = reader[columnName];
        return value == DBNull.Value ? null : Convert.ToString(value);
    }

    private static int ReadInt(IDataRecord reader, string columnName)
    {
        return ReadNullableInt(reader, columnName) ?? 0;
    }

    private static int? ReadNullableInt(IDataRecord reader, string columnName)
    {
        if (!HasColumn(reader, columnName))
            return null;

        var value = reader[columnName];
        return value == DBNull.Value ? null : Convert.ToInt32(value);
    }

    private static bool ReadBoolean(IDataRecord reader, string columnName)
    {
        if (!HasColumn(reader, columnName))
            return false;

        var value = reader[columnName];
        return value != DBNull.Value && Convert.ToBoolean(value);
    }

    private static DateTime ReadDateTime(IDataRecord reader, string columnName)
    {
        return ReadNullableDateTime(reader, columnName) ?? default;
    }

    private static DateTime? ReadNullableDateTime(IDataRecord reader, string columnName)
    {
        if (!HasColumn(reader, columnName))
            return null;

        var value = reader[columnName];
        return value == DBNull.Value ? null : Convert.ToDateTime(value);
    }
}
