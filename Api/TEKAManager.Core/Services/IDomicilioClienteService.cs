using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IDomicilioClienteService
{
    Task<IEnumerable<DomicilioClienteDTO>> GetByClienteAsync(int clienteId);
    Task<DomicilioClienteDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(int clienteId, DomicilioClienteRequest request);
    Task UpdateAsync(int id, DomicilioClienteRequest request);
    Task DeleteAsync(int id);
    Task ActivateAsync(int id);
}
