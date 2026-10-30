using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IPrecioVentaService
{
    Task<IEnumerable<PrecioVentaDTO>> GetAllAsync();
    Task<IEnumerable<PrecioVentaDTO>> GetByProductoAsync(int productoId);
    Task<IEnumerable<PrecioVentaCorreccionDTO>> GetCorreccionesByProductoAsync(int productoId);
    Task<PrecioVentaDTO?> GetVigenteAsync(int productoId);
    Task<int> InsertAsync(PrecioVentaInsertRequest request, int usuarioId);
    Task CorrectAsync(int id, PrecioVentaCorrectionRequest request, int usuarioId);
}
