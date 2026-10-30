using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace TEKAManager.Core.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    public SmtpEmailService(IConfiguration configuration) => _configuration = configuration;

    public Task SendAsync(string destinatario, string asunto, string contenidoHtml) =>
        SendInternalAsync(destinatario, asunto, contenidoHtml, null, null, null);

    public Task SendWithAttachmentAsync(string destinatario, string asunto, string contenidoHtml,
        byte[] archivo, string nombreArchivo, string contentType = "application/pdf") =>
        SendInternalAsync(destinatario, asunto, contenidoHtml, archivo, nombreArchivo, contentType);

    private async Task SendInternalAsync(string destinatario, string asunto, string contenidoHtml,
        byte[]? archivo, string? nombreArchivo, string? contentType)
    {
        var section = _configuration.GetSection("Email");
        if (!bool.TryParse(section["Enabled"], out var enabled) || !enabled)
            throw new InvalidOperationException("El servicio de correo no está habilitado.");
        var host = section["Host"];
        if (string.IsNullOrWhiteSpace(host))
            throw new InvalidOperationException("Falta configurar Email:Host.");
        if (!int.TryParse(section["Port"], out var port) || port <= 0)
            throw new InvalidOperationException("Email:Port no es válido.");
        bool.TryParse(section["EnableSsl"], out var ssl);
        var username = section["Username"];
        var password = section["Password"];
        var fromAddress = section["FromAddress"];
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(fromAddress))
            throw new InvalidOperationException("Faltan credenciales o remitente en la configuración Email.");

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, section["FromName"] ?? "TEKA Manager"),
            Subject = asunto,
            Body = contenidoHtml,
            IsBodyHtml = true
        };
        message.To.Add(destinatario);
        if (archivo is not null)
        {
            if (archivo.Length == 0 || string.IsNullOrWhiteSpace(nombreArchivo))
                throw new ArgumentException("El archivo adjunto no es válido.");
            var stream = new MemoryStream(archivo, writable: false);
            message.Attachments.Add(new Attachment(stream, nombreArchivo, contentType ?? "application/pdf"));
        }
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = ssl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(username, password)
        };
        await client.SendMailAsync(message);
    }
}
