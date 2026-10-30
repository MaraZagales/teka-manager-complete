using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TEKAManager.Core.Services;

namespace TEKAManager.WhatsAppWebhook;

[ApiController,Route("webhooks/whatsapp")]
public sealed class WhatsAppWebhookController(IOptions<WhatsAppOptions> options,IWhatsAppWebhookQueue queue,ILogger<WhatsAppWebhookController> logger):ControllerBase
{
 private readonly WhatsAppOptions _options=options.Value;
 [HttpGet] public IActionResult Verify([FromQuery(Name="hub.mode")]string? mode,[FromQuery(Name="hub.verify_token")]string? token,[FromQuery(Name="hub.challenge")]string? challenge){
  if(!_options.HasWebhookConfiguration)return StatusCode(503);
  return mode=="subscribe"&&token is not null&&challenge is not null&&WhatsAppSignature.FixedTimeEquals(token,_options.WebhookVerifyToken)?Content(challenge,"text/plain"):StatusCode(StatusCodes.Status403Forbidden);
 }
 [HttpPost,RequestSizeLimit(1_048_576)] public async Task<IActionResult> Receive(CancellationToken ct){
  if(!_options.HasWebhookConfiguration)return StatusCode(503);
  using var reader=new StreamReader(Request.Body,System.Text.Encoding.UTF8,false,leaveOpen:true);var body=await reader.ReadToEndAsync(ct);
  if(!WhatsAppSignature.IsValid(body,Request.Headers["X-Hub-Signature-256"].FirstOrDefault(),_options.AppSecret)){logger.LogWarning("Webhook de WhatsApp rechazado por firma inválida.");return Unauthorized();}
  return queue.TryEnqueue(new(body))?Ok():StatusCode(503);
 }
}
