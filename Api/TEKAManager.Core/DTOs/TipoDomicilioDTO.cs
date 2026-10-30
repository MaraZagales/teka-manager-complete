namespace TEKAManager.Core.DTOs;

public sealed class TipoDomicilioDTO
{
    public int TipoDomicilioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
