using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IClienteService
{
    Task<IEnumerable<ClienteDTO>> GetAllAsync();
    Task<ClienteDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(ClienteInsertRequest request);
    Task UpdateAsync(int id, ClienteUpdateRequest request);
    Task DeleteAsync(int id, ClienteDeleteRequest request);
    Task ActivateAsync(int id);
}
