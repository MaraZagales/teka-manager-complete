using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface ICobroService
{
    Task<IEnumerable<CobroDTO>> GetAllAsync();
    Task<CobroConAplicacionesDTO?> GetByIdAsync(int id);
    Task<int> RegistrarAsync(CobroRegistrarRequest request);
    Task ActualizarPendienteAsync(int id, CobroActualizarPendienteRequest request, int usuarioId);
    Task ConfirmarAsync(int id, CobroConfirmarRequest request, int usuarioId);
    Task AnularAsync(int id, CobroAnularRequest request);
    Task AplicarAsync(int id, AplicacionCobroRequest request);
    Task<IEnumerable<AplicacionCobroDTO>> GetAplicacionesByCobroAsync(int id);
    Task<IEnumerable<MovimientoCuentaCorrienteClienteDTO>> GetCuentaCorrienteAsync(int? clienteId);
}
