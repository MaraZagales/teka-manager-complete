using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IInsumoService
{
    Task<IEnumerable<InsumoDTO>> GetAllAsync();
    Task<InsumoDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(InsumoInsertRequest request);
    Task UpdateAsync(int id, InsumoUpdateRequest request);
    Task DeleteAsync(int id, InsumoDeleteRequest request);
    Task ActivateAsync(int id);
}
