namespace TEKAManager.Core.DTOs;

public class RemitoConDetalleDTO : RemitoDTO
{
    public List<DetalleRemitoDTO> Detalles { get; set; } = new();
}
