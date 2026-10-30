using TEKAManager.Core.Requests;
namespace TEKAManager.Core.Services;
public interface IPasswordRecoveryService { Task SolicitarAsync(PasswordRecoveryStartRequest request); Task<bool> ValidarTokenAsync(string token); Task RestablecerAsync(PasswordRecoveryResetRequest request); }
