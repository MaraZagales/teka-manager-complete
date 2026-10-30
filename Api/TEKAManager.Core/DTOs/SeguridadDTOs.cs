namespace TEKAManager.Core.DTOs;

public class RolDTO
{
    public int RolId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

public class MenuDTO
{
    public int MenuId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Ruta { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public int OrdenVisual { get; set; }
    public bool Activo { get; set; }
}

public class MenuLookupDTO : LookupDTO
{
    public string Modulo { get; set; } = string.Empty;
    public string? Ruta { get; set; }
}

public class PermisoDTO
{
    public int PermisoId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

public class UsuarioDTO
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
    public List<UsuarioRolDTO> Roles { get; set; } = [];
}

public class UsuarioLookupDTO : LookupDTO
{
    public string Nombre { get; set; } = string.Empty;
    public string? Apellido { get; set; }
    public string Email { get; set; } = string.Empty;
}

public class UsuarioRolDTO
{
    public int UsuarioRolId { get; set; }
    public int UsuarioId { get; set; }
    public int RolId { get; set; }
    public string RolNombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class RolPermisoDTO
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

public class ValidarAccesoDTO
{
    public bool TieneAcceso { get; set; }
}
