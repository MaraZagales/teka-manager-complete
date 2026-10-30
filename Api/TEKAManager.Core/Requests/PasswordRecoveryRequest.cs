using System.ComponentModel.DataAnnotations;
namespace TEKAManager.Core.Requests;
public class PasswordRecoveryStartRequest { [Required, StringLength(150, MinimumLength=3)] public string UsuarioOEmail { get; set; } = string.Empty; }
public class PasswordRecoveryResetRequest { [Required] public string Token { get; set; } = string.Empty; [Required, StringLength(255, MinimumLength=8)] public string PasswordNueva { get; set; } = string.Empty; }
