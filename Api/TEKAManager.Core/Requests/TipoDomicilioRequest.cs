using System.ComponentModel.DataAnnotations;

namespace TEKAManager.Core.Requests;

public sealed class TipoDomicilioRequest
{
    [Required, StringLength(30)]
    public string Nombre { get; set; } = string.Empty;
}
