using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class RolRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(250)]
    public string? Descripcion { get; set; }

    public bool Activo { get; set; } = true;
}

public class UsuarioInsertRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = "El username solo puede contener letras, numeros, puntos, guiones y guiones bajos.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Apellido { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    public List<int> RolIds { get; set; } = [];
}

public class UsuarioUpdateRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9._-]+$", ErrorMessage = "El username solo puede contener letras, numeros, puntos, guiones y guiones bajos.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Apellido { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    public List<int>? RolIds { get; set; }
}

public class UsuarioRolRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un rol valido.")]
    public int RolId { get; set; }
}

public class UsuarioInactivarRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un motivo de inactivaci�n v�lido.")]
    public int MotivoInactivacionUsuarioId { get; set; }

    [StringLength(250)]
    public string? ObservacionInactivacion { get; set; }
}

public class MenuRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(250)]
    public string? Ruta { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Modulo { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "El orden visual no puede ser negativo.")]
    public int OrdenVisual { get; set; }
}

public class PermisoRequest
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Nombre { get; set; } = string.Empty;

    [StringLength(250)]
    public string? Descripcion { get; set; }
}

public class RolPermisoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un permiso valido.")]
    public int PermisoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Debe indicar un menu valido.")]
    public int MenuId { get; set; }
}
