namespace TEKAManager.Core.DTOs;

public class LoginResponseDTO
{
    public bool Exitoso { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public int? AuditoriaSesionId { get; set; }
    public UsuarioSesionDTO? Usuario { get; set; }
    public List<UsuarioRolDTO> Roles { get; set; } = [];
    public List<UsuarioPermisoEfectivoDTO> Permisos { get; set; } = [];
}

public class UsuarioSesionDTO
{
    public int UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public bool Bloqueado { get; set; }
    public int IntentosFallidos { get; set; }
    public DateTime FechaAlta { get; set; }
    public DateTime? UltimoLogin { get; set; }
}

public class UsuarioPermisoEfectivoDTO
{
    public int UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int RolId { get; set; }
    public string RolNombre { get; set; } = string.Empty;
    public int MenuId { get; set; }
    public string MenuNombre { get; set; } = string.Empty;
    public string? Ruta { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public int OrdenVisual { get; set; }
    public int PermisoId { get; set; }
    public string PermisoNombre { get; set; } = string.Empty;
}
