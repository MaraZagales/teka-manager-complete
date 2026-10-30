namespace TEKAManager.Core.Services;

public interface IEmailService
{
    Task SendAsync(string destinatario, string asunto, string contenidoHtml);
    Task SendWithAttachmentAsync(string destinatario, string asunto, string contenidoHtml,
        byte[] archivo, string nombreArchivo, string contentType = "application/pdf");
}
