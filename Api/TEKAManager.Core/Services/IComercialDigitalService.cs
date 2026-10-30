using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public interface IInteresComercialService
{
    Task<IEnumerable<InteresComercialDTO>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InteresComercialDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> InsertAsync(InteresComercialInsertRequest request, CancellationToken cancellationToken = default);
    Task UpdateAsync(int id, InteresComercialUpdateRequest request, CancellationToken cancellationToken = default);
    Task<ConsultaPublicaResultadoDTO> RegistrarConsultaPublicaAsync(ConsultaPublicaRequest request, CancellationToken cancellationToken = default);
    Task TomarAsync(int id, int usuarioId);
    Task VincularClienteAsync(int id, int clienteId, int usuarioId);
    Task DescartarAsync(int id, string motivo);
    Task<int> CalificarAsync(int id, InteresCalificarRequest request);
}

public interface ICarritoService
{
    Task<CarritoDTO> ObtenerOCrearAsync(CarritoObtenerOCrearRequest request);
    Task<CarritoDTO?> GetByIdAsync(int id);
    Task GuardarItemAsync(int id, CarritoItemRequest request);
    Task EliminarItemAsync(int id, int productoId);
    Task AsignarClienteAsync(int id, int clienteId);
    Task IniciarCheckoutAsync(int id, CheckoutSeguimientoRequest request, int? clienteAutenticadoId, CancellationToken cancellationToken = default);
    Task RegistrarActividadCheckoutAsync(int id, Guid identificadorSesion, int? clienteAutenticadoId, CancellationToken cancellationToken = default);
    Task<int> ProcesarAbandonadosAsync(int horasCarrito, int horasCheckout, CancellationToken cancellationToken = default);
    Task<CheckoutCarritoDTO> CheckoutAsync(int id, string? observaciones);
}
