namespace TEKAManager.Core.DTOs;

public class CobroConAplicacionesDTO : CobroDTO
{
    public List<AplicacionCobroDTO> Aplicaciones { get; set; } = new();
}
