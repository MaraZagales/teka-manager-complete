using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public class LoginRequest
{
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    public string Password { get; set; } = string.Empty;
}

public class LogoutRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Debe indicar una sesion valida.")]
    public int AuditoriaSesionId { get; set; }
}
