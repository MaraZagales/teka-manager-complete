using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface ISeguridadService
{
    Task<IEnumerable<UsuarioDTO>> GetUsuariosAsync();
    Task<UsuarioDTO?> GetUsuarioByIdAsync(int id);
    Task<IEnumerable<UsuarioLookupDTO>> GetUsuariosLookupAsync();
    Task<int> InsertUsuarioAsync(UsuarioInsertRequest request);
    Task UpdateUsuarioAsync(int id, UsuarioUpdateRequest request);
    Task DeleteUsuarioAsync(int id, UsuarioInactivarRequest request);
    Task ActivarUsuarioAsync(int id);
    Task BloquearUsuarioAsync(int id);
    Task DesbloquearUsuarioAsync(int id);
    Task<IEnumerable<UsuarioRolDTO>> GetRolesByUsuarioAsync(int usuarioId);
    Task<int> AddRolToUsuarioAsync(int usuarioId, UsuarioRolRequest request);
    Task DeleteUsuarioRolAsync(int usuarioRolId);

    Task<IEnumerable<RolDTO>> GetRolesAsync();
    Task<RolDTO?> GetRolByIdAsync(int id);
    Task<IEnumerable<LookupDTO>> GetRolesLookupAsync();
    Task<int> InsertRolAsync(RolRequest request);
    Task UpdateRolAsync(int id, RolRequest request);
    Task DeleteRolAsync(int id);

    Task<IEnumerable<MenuDTO>> GetMenusAsync();
    Task<MenuDTO?> GetMenuByIdAsync(int id);
    Task<IEnumerable<MenuLookupDTO>> GetMenusLookupAsync();
    Task<int> InsertMenuAsync(MenuRequest request);
    Task UpdateMenuAsync(int id, MenuRequest request);
    Task DeleteMenuAsync(int id);

    Task<IEnumerable<PermisoDTO>> GetPermisosAsync();
    Task<PermisoDTO?> GetPermisoByIdAsync(int id);
    Task<IEnumerable<LookupDTO>> GetPermisosLookupAsync();
    Task<int> InsertPermisoAsync(PermisoRequest request);
    Task UpdatePermisoAsync(int id, PermisoRequest request);
    Task DeletePermisoAsync(int id);

    Task<IEnumerable<RolPermisoDTO>> GetPermisosByRolAsync(int rolId);
    Task<int> AddPermisoToRolAsync(int rolId, RolPermisoRequest request);
    Task DeleteRolPermisoAsync(int rolPermisoId);
}
