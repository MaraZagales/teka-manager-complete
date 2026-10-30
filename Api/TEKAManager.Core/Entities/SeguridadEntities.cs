namespace TEKAManager.Core.Entities;

public class Rol
{
    public int RolId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

public class Menu
{
    public int MenuId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Ruta { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public int OrdenVisual { get; set; }
    public bool Activo { get; set; }
}

public class Permiso
{
    public int PermisoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

public class Usuario
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
    public int? MotivoInactivacionUsuarioId { get; set; }
    public string? MotivoInactivacionUsuarioNombre { get; set; }
    public string? ObservacionInactivacion { get; set; }
    public DateTime? FechaInactivacion { get; set; }
}

public class UsuarioConPassword : Usuario
{
    public string Password { get; set; } = string.Empty;
}

public class SolicitudRestablecimientoPassword
{
    public int SolicitudRestablecimientoPasswordId { get; set; }
    public int UsuarioId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
    public string UsuarioTexto { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? AtendidoPorUsuarioId { get; set; }
    public DateTime? FechaAtencion { get; set; }
    public string? Observaciones { get; set; }
}

public class UsuarioRol
{
    public int UsuarioRolId { get; set; }
    public int UsuarioId { get; set; }
    public int RolId { get; set; }
    public string RolNombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class RolPermiso
{
    public int RolPermisoId { get; set; }
    public int RolId { get; set; }
    public int PermisoId { get; set; }
    public string PermisoNombre { get; set; } = string.Empty;
    public int MenuId { get; set; }
    public string MenuNombre { get; set; } = string.Empty;
    public string Modulo { get; set; } = string.Empty;
    public string? Ruta { get; set; }
}

public class AccesoMenuResult
{
    public bool TieneAcceso { get; set; }
}
