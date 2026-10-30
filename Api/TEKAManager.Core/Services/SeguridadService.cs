using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Entities;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public class SeguridadService : ISeguridadService
{
    private readonly TekaDbContext _db;

    public SeguridadService(TekaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<UsuarioDTO>> GetUsuariosAsync()
    {
        var usuarios = await _db.Database
            .SqlQueryRaw<Usuario>("EXEC dbo.sp_Usuario_GetAll")
            .ToListAsync();

        var result = new List<UsuarioDTO>();

        foreach (var usuario in usuarios)
        {
            var dto = MapUsuario(usuario);
            dto.Roles = (await GetRolesByUsuarioAsync(usuario.UsuarioId)).ToList();
            result.Add(dto);
        }

        return result;
    }

    public async Task<UsuarioDTO?> GetUsuarioByIdAsync(int id)
    {
        EnsurePositiveId(id, "usuario");

        var pId = new SqlParameter("@UsuarioId", id);

        var usuarios = await _db.Database
            .SqlQueryRaw<Usuario>("EXEC dbo.sp_Usuario_GetById @UsuarioId", pId)
            .ToListAsync();

        var usuario = usuarios.FirstOrDefault();
        if (usuario is null)
            return null;

        var dto = MapUsuario(usuario);
        dto.Roles = (await GetRolesByUsuarioAsync(id)).ToList();
        return dto;
    }

    public async Task<IEnumerable<UsuarioLookupDTO>> GetUsuariosLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<UsuarioLookupDTO>("EXEC dbo.sp_Usuario_GetLookup")
            .ToListAsync();
    }

    public async Task<int> InsertUsuarioAsync(UsuarioInsertRequest request)
    {
        ValidateUsuario(request.Username, request.Nombre, request.Email);
        ValidateIds(request.RolIds, "roles");

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var pUsername = new SqlParameter("@Username", NormalizeUsername(request.Username));
        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pApellido = new SqlParameter("@Apellido", DbValue(request.Apellido));
        var pEmail = new SqlParameter("@Email", NormalizeEmail(request.Email));
        var pPassword = new SqlParameter("@Password", CreateTemporaryPassword());

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Usuario_Insert @Username, @Nombre, @Apellido, @Email, @Password",
                pUsername, pNombre, pApellido, pEmail, pPassword)
            .ToListAsync();

        var usuarioId = Convert.ToInt32(result.FirstOrDefault());

        foreach (var rolId in request.RolIds.Distinct())
            await AddRolToUsuarioInternalAsync(usuarioId, rolId);

        await transaction.CommitAsync();

        return usuarioId;
    }

    public async Task UpdateUsuarioAsync(int id, UsuarioUpdateRequest request)
    {
        EnsurePositiveId(id, "usuario");
        ValidateUsuario(request.Username, request.Nombre, request.Email);

        if (request.RolIds is not null)
            ValidateIds(request.RolIds, "roles");

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var pId = new SqlParameter("@UsuarioId", id);
        var pUsername = new SqlParameter("@Username", NormalizeUsername(request.Username));
        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pApellido = new SqlParameter("@Apellido", DbValue(request.Apellido));
        var pEmail = new SqlParameter("@Email", NormalizeEmail(request.Email));

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Update @UsuarioId, @Username, @Nombre, @Apellido, @Email",
            pId, pUsername, pNombre, pApellido, pEmail);

        if (request.RolIds is not null)
            await SyncRolesUsuarioAsync(id, request.RolIds);

        await transaction.CommitAsync();
    }

    public async Task DeleteUsuarioAsync(int id, UsuarioInactivarRequest request)
    {
        EnsurePositiveId(id, "usuario");

        var pId = new SqlParameter("@UsuarioId", id);
        var pMotivo = new SqlParameter("@MotivoInactivacionUsuarioId", request.MotivoInactivacionUsuarioId);
        var pObservacion = new SqlParameter("@ObservacionInactivacion", DbValue(request.ObservacionInactivacion));

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Delete @UsuarioId, @MotivoInactivacionUsuarioId, @ObservacionInactivacion",
            pId, pMotivo, pObservacion);
    }

    public async Task ActivarUsuarioAsync(int id)
    {
        EnsurePositiveId(id, "usuario");

        var pId = new SqlParameter("@UsuarioId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Activar @UsuarioId",
            pId);
    }
    public async Task BloquearUsuarioAsync(int id)
    {
        EnsurePositiveId(id, "usuario");

        var pId = new SqlParameter("@UsuarioId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Bloquear @UsuarioId",
            pId);
    }

    public async Task DesbloquearUsuarioAsync(int id)
    {
        EnsurePositiveId(id, "usuario");

        var pId = new SqlParameter("@UsuarioId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Usuario_Desbloquear @UsuarioId",
            pId);
    }

    public async Task<IEnumerable<UsuarioRolDTO>> GetRolesByUsuarioAsync(int usuarioId)
    {
        EnsurePositiveId(usuarioId, "usuario");

        var pId = new SqlParameter("@UsuarioId", usuarioId);

        var roles = await _db.Database
            .SqlQueryRaw<UsuarioRol>("EXEC dbo.sp_UsuarioRol_GetByUsuario @UsuarioId", pId)
            .ToListAsync();

        return roles.Select(MapUsuarioRol);
    }

    public async Task<int> AddRolToUsuarioAsync(int usuarioId, UsuarioRolRequest request)
    {
        EnsurePositiveId(usuarioId, "usuario");
        EnsurePositiveId(request.RolId, "rol");

        return await AddRolToUsuarioInternalAsync(usuarioId, request.RolId);
    }

    public async Task DeleteUsuarioRolAsync(int usuarioRolId)
    {
        EnsurePositiveId(usuarioRolId, "asignacion de rol");

        var pId = new SqlParameter("@UsuarioRolId", usuarioRolId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_UsuarioRol_Delete @UsuarioRolId",
            pId);
    }

    public async Task<IEnumerable<RolDTO>> GetRolesAsync()
    {
        var roles = await _db.Database
            .SqlQueryRaw<Rol>("EXEC dbo.sp_Rol_GetAll")
            .ToListAsync();

        return roles.Select(MapRol);
    }

    public async Task<RolDTO?> GetRolByIdAsync(int id)
    {
        EnsurePositiveId(id, "rol");

        var pId = new SqlParameter("@RolId", id);

        var roles = await _db.Database
            .SqlQueryRaw<Rol>("EXEC dbo.sp_Rol_GetById @RolId", pId)
            .ToListAsync();

        var rol = roles.FirstOrDefault();
        return rol is null ? null : MapRol(rol);
    }

    public async Task<IEnumerable<LookupDTO>> GetRolesLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_Rol_GetLookup")
            .ToListAsync();
    }

    public async Task<int> InsertRolAsync(RolRequest request)
    {
        ValidateNombre(request.Nombre, "rol");

        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pDescripcion = new SqlParameter("@Descripcion", DbValue(request.Descripcion));

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Rol_Insert @Nombre, @Descripcion",
                pNombre, pDescripcion)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateRolAsync(int id, RolRequest request)
    {
        EnsurePositiveId(id, "rol");
        ValidateNombre(request.Nombre, "rol");

        var pId = new SqlParameter("@RolId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pDescripcion = new SqlParameter("@Descripcion", DbValue(request.Descripcion));
        var pActivo = new SqlParameter("@Activo", request.Activo);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Rol_Update @RolId, @Nombre, @Descripcion, @Activo",
            pId, pNombre, pDescripcion, pActivo);
    }

    public async Task DeleteRolAsync(int id)
    {
        EnsurePositiveId(id, "rol");

        var pId = new SqlParameter("@RolId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Rol_Delete @RolId",
            pId);
    }

    public async Task<IEnumerable<MenuDTO>> GetMenusAsync()
    {
        var menus = await _db.Database
            .SqlQueryRaw<Menu>("EXEC dbo.sp_Menu_GetAll")
            .ToListAsync();

        return menus.Select(MapMenu);
    }

    public async Task<MenuDTO?> GetMenuByIdAsync(int id)
    {
        EnsurePositiveId(id, "menu");

        var pId = new SqlParameter("@MenuId", id);

        var menus = await _db.Database
            .SqlQueryRaw<Menu>("EXEC dbo.sp_Menu_GetById @MenuId", pId)
            .ToListAsync();

        var menu = menus.FirstOrDefault();
        return menu is null ? null : MapMenu(menu);
    }

    public async Task<IEnumerable<MenuLookupDTO>> GetMenusLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<MenuLookupDTO>("EXEC dbo.sp_Menu_GetLookup")
            .ToListAsync();
    }

    public async Task<int> InsertMenuAsync(MenuRequest request)
    {
        ValidateMenu(request);

        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pRuta = new SqlParameter("@Ruta", DbValue(request.Ruta));
        var pModulo = new SqlParameter("@Modulo", request.Modulo.Trim());
        var pOrdenVisual = new SqlParameter("@OrdenVisual", request.OrdenVisual);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Menu_Insert @Nombre, @Ruta, @Modulo, @OrdenVisual",
                pNombre, pRuta, pModulo, pOrdenVisual)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdateMenuAsync(int id, MenuRequest request)
    {
        EnsurePositiveId(id, "menu");
        ValidateMenu(request);

        var pId = new SqlParameter("@MenuId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pRuta = new SqlParameter("@Ruta", DbValue(request.Ruta));
        var pModulo = new SqlParameter("@Modulo", request.Modulo.Trim());
        var pOrdenVisual = new SqlParameter("@OrdenVisual", request.OrdenVisual);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Menu_Update @MenuId, @Nombre, @Ruta, @Modulo, @OrdenVisual",
            pId, pNombre, pRuta, pModulo, pOrdenVisual);
    }

    public async Task DeleteMenuAsync(int id)
    {
        EnsurePositiveId(id, "menu");

        var pId = new SqlParameter("@MenuId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Menu_Delete @MenuId",
            pId);
    }

    public async Task<IEnumerable<PermisoDTO>> GetPermisosAsync()
    {
        var permisos = await _db.Database
            .SqlQueryRaw<Permiso>("EXEC dbo.sp_Permiso_GetAll")
            .ToListAsync();

        return permisos.Select(MapPermiso);
    }

    public async Task<PermisoDTO?> GetPermisoByIdAsync(int id)
    {
        EnsurePositiveId(id, "permiso");

        var pId = new SqlParameter("@PermisoId", id);

        var permisos = await _db.Database
            .SqlQueryRaw<Permiso>("EXEC dbo.sp_Permiso_GetById @PermisoId", pId)
            .ToListAsync();

        var permiso = permisos.FirstOrDefault();
        return permiso is null ? null : MapPermiso(permiso);
    }

    public async Task<IEnumerable<LookupDTO>> GetPermisosLookupAsync()
    {
        return await _db.Database
            .SqlQueryRaw<LookupDTO>("EXEC dbo.sp_Permiso_GetLookup")
            .ToListAsync();
    }

    public async Task<int> InsertPermisoAsync(PermisoRequest request)
    {
        ValidateNombre(request.Nombre, "permiso");

        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pDescripcion = new SqlParameter("@Descripcion", DbValue(request.Descripcion));

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_Permiso_Insert @Nombre, @Descripcion",
                pNombre, pDescripcion)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task UpdatePermisoAsync(int id, PermisoRequest request)
    {
        EnsurePositiveId(id, "permiso");
        ValidateNombre(request.Nombre, "permiso");

        var pId = new SqlParameter("@PermisoId", id);
        var pNombre = new SqlParameter("@Nombre", request.Nombre.Trim());
        var pDescripcion = new SqlParameter("@Descripcion", DbValue(request.Descripcion));

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Permiso_Update @PermisoId, @Nombre, @Descripcion",
            pId, pNombre, pDescripcion);
    }

    public async Task DeletePermisoAsync(int id)
    {
        EnsurePositiveId(id, "permiso");

        var pId = new SqlParameter("@PermisoId", id);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Permiso_Delete @PermisoId",
            pId);
    }

    public async Task<IEnumerable<RolPermisoDTO>> GetPermisosByRolAsync(int rolId)
    {
        EnsurePositiveId(rolId, "rol");

        var pRolId = new SqlParameter("@RolId", rolId);

        var permisos = await _db.Database
            .SqlQueryRaw<RolPermiso>("EXEC dbo.sp_RolPermiso_GetByRol @RolId", pRolId)
            .ToListAsync();

        return permisos.Select(MapRolPermiso);
    }

    public async Task<int> AddPermisoToRolAsync(int rolId, RolPermisoRequest request)
    {
        EnsurePositiveId(rolId, "rol");
        EnsurePositiveId(request.PermisoId, "permiso");
        EnsurePositiveId(request.MenuId, "menu");

        var pRolId = new SqlParameter("@RolId", rolId);
        var pPermisoId = new SqlParameter("@PermisoId", request.PermisoId);
        var pMenuId = new SqlParameter("@MenuId", request.MenuId);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_RolPermiso_Insert @RolId, @PermisoId, @MenuId",
                pRolId, pPermisoId, pMenuId)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    public async Task DeleteRolPermisoAsync(int rolPermisoId)
    {
        EnsurePositiveId(rolPermisoId, "permiso de rol");

        var pId = new SqlParameter("@RolPermisoId", rolPermisoId);

        await _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_RolPermiso_Delete @RolPermisoId",
            pId);
    }

    private async Task<int> AddRolToUsuarioInternalAsync(int usuarioId, int rolId)
    {
        var pUsuarioId = new SqlParameter("@UsuarioId", usuarioId);
        var pRolId = new SqlParameter("@RolId", rolId);

        var result = await _db.Database
            .SqlQueryRaw<decimal>(
                "EXEC dbo.sp_UsuarioRol_Insert @UsuarioId, @RolId",
                pUsuarioId, pRolId)
            .ToListAsync();

        return Convert.ToInt32(result.FirstOrDefault());
    }

    private async Task SyncRolesUsuarioAsync(int usuarioId, IEnumerable<int> rolIds)
    {
        var desired = rolIds.Distinct().ToHashSet();
        var current = (await GetRolesByUsuarioAsync(usuarioId)).ToList();
        var currentRolIds = current.Select(r => r.RolId).ToHashSet();

        foreach (var asignacion in current.Where(r => !desired.Contains(r.RolId)))
            await DeleteUsuarioRolAsync(asignacion.UsuarioRolId);

        foreach (var rolId in desired.Where(id => !currentRolIds.Contains(id)))
            await AddRolToUsuarioInternalAsync(usuarioId, rolId);
    }

    private static void ValidateUsuario(string username, string nombre, string email)
    {
        ValidateNombre(username, "username");
        ValidateNombre(nombre, "nombre");
        ValidateNombre(email, "email");

        if (!new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email))
            throw new InvalidOperationException("El email ingresado no tiene un formato valido.");
    }

    private static void ValidateNombre(string value, string field)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"Debe informar {field}.");
    }

    private static void ValidateMenu(MenuRequest request)
    {
        ValidateNombre(request.Nombre, "menu");
        ValidateNombre(request.Modulo, "modulo");

        if (request.OrdenVisual < 0)
            throw new InvalidOperationException("El orden visual no puede ser negativo.");
    }

    private static void ValidateIds(IEnumerable<int> ids, string field)
    {
        if (ids.Any(id => id <= 0))
            throw new InvalidOperationException($"La lista de {field} contiene valores invalidos.");
    }

    private static void EnsurePositiveId(int id, string entity)
    {
        if (id <= 0)
            throw new InvalidOperationException($"Debe indicar un identificador de {entity} valido.");
    }

    private static string CreateTemporaryPassword()
    {
        return $"Tmp{Convert.ToHexString(RandomNumberGenerator.GetBytes(16))}a1";
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Debe informar una contrasena.");
    }

    private static string NormalizeUsername(string username) => username.Trim();

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static object DbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }

    private static UsuarioDTO MapUsuario(Usuario usuario) => new()
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
        UltimoLogin = usuario.UltimoLogin,
        MotivoInactivacionUsuarioId = usuario.MotivoInactivacionUsuarioId,
        MotivoInactivacionUsuarioNombre = usuario.MotivoInactivacionUsuarioNombre,
        ObservacionInactivacion = usuario.ObservacionInactivacion,
        FechaInactivacion = usuario.FechaInactivacion
    };

    private static RolDTO MapRol(Rol rol) => new()
    {
        RolId = rol.RolId,
        Nombre = rol.Nombre,
        Descripcion = rol.Descripcion,
        Activo = rol.Activo
    };

    private static MenuDTO MapMenu(Menu menu) => new()
    {
        MenuId = menu.MenuId,
        Nombre = menu.Nombre,
        Ruta = menu.Ruta,
        Modulo = menu.Modulo,
        OrdenVisual = menu.OrdenVisual,
        Activo = menu.Activo
    };

    private static PermisoDTO MapPermiso(Permiso permiso) => new()
    {
        PermisoId = permiso.PermisoId,
        Nombre = permiso.Nombre,
        Descripcion = permiso.Descripcion,
        Activo = permiso.Activo
    };

    private static UsuarioRolDTO MapUsuarioRol(UsuarioRol usuarioRol) => new()
    {
        UsuarioRolId = usuarioRol.UsuarioRolId,
        UsuarioId = usuarioRol.UsuarioId,
        RolId = usuarioRol.RolId,
        RolNombre = usuarioRol.RolNombre,
        Descripcion = usuarioRol.Descripcion
    };

    private static RolPermisoDTO MapRolPermiso(RolPermiso rolPermiso) => new()
    {
        RolPermisoId = rolPermiso.RolPermisoId,
        RolId = rolPermiso.RolId,
        PermisoId = rolPermiso.PermisoId,
        PermisoNombre = rolPermiso.PermisoNombre,
        MenuId = rolPermiso.MenuId,
        MenuNombre = rolPermiso.MenuNombre,
        Modulo = rolPermiso.Modulo,
        Ruta = rolPermiso.Ruta
    };

}
