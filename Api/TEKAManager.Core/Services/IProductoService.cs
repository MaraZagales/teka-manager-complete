using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IProductoService
{
    Task<IEnumerable<ProductoDTO>> GetAllAsync();
    Task<ProductoDTO?> GetByIdAsync(int id);
    Task<int> InsertAsync(ProductoInsertRequest request);
    Task UpdateAsync(int id, ProductoUpdateRequest request);
    Task DeleteAsync(int id, ProductoDeleteRequest request);
    Task ActivateAsync(int id);
}
