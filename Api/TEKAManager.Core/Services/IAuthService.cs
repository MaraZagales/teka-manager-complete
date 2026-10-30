using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IAuthService
{
    Task<LoginResponseDTO> LoginAsync(LoginRequest request, string? ipOrigen);
    Task CerrarSesionAsync(LogoutRequest request);
    Task<IEnumerable<UsuarioPermisoEfectivoDTO>> GetPermisosEfectivosAsync(int usuarioId);
    Task<ValidarAccesoDTO> ValidarAccesoMenuAsync(int usuarioId, int menuId, string permisoNombre);
}
