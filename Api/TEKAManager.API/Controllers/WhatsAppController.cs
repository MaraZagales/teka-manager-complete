using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TEKAManager.API.Security;
using TEKAManager.Core.Requests;
using TEKAManager.Core.Services;

namespace TEKAManager.API.Controllers;

[ApiController, Route("api/comercial/whatsapp"), Authorize, RequirePermission("Comercial","Ver")]
public sealed class WhatsAppController(IWhatsAppService service) : ControllerBase
{
    [HttpGet("assignees")]
    public async Task<IActionResult> Assignees(CancellationToken ct) => Ok(await service.GetAssigneesAsync(ct));

    [HttpGet("conversations")]
    public async Task<IActionResult> List(CancellationToken ct) => Ok(await service.GetConversationsAsync(ct));

    [HttpGet("conversations/{id:long}")]
    public async Task<IActionResult> Detail(long id, CancellationToken ct)
    {
        var result = await service.GetConversationAsync(id, ct);
        return result is null ? NotFound(new { mensaje="Conversación no encontrada." }) : Ok(result);
    }

    [HttpPost("conversations/{id:long}/messages"), RequirePermission("Comercial","Crear")]
    public async Task<IActionResult> Send(long id, WhatsAppSendMessageRequest request, CancellationToken ct) =>
        await Run(() => service.SendTextAsync(id, request, ct));

    [HttpPut("conversations/{id:long}/assignee"), RequirePermission("Comercial","Editar")]
    public async Task<IActionResult> Assign(long id, WhatsAppAssignRequest request, CancellationToken ct) =>
        await Run(async () => { await service.AssignAsync(id, request.UsuarioResponsableId, ct); return new { }; }, noContent:true);

    [HttpPut("conversations/{id:long}/consultation"), RequirePermission("Comercial","Editar")]
    public async Task<IActionResult> Link(long id, WhatsAppLinkConsultationRequest request, CancellationToken ct) =>
        await Run(async () => { await service.LinkConsultationAsync(id, request.InteresComercialId, ct); return new { }; }, noContent:true);

    [HttpPut("conversations/{id:long}/customer"), RequirePermission("Comercial","Editar")]
    public async Task<IActionResult> LinkCustomer(long id, WhatsAppLinkCustomerRequest request, CancellationToken ct) =>
        await Run(async () => { await service.LinkCustomerAsync(id, request.ClienteId, ct); return new { }; }, noContent:true);

    [HttpPost("conversations/{id:long}/consultation"), RequirePermission("Comercial","Crear")]
    public async Task<IActionResult> CreateConsultation(long id, WhatsAppCreateConsultationRequest request, CancellationToken ct) =>
        await Run(async () => new { interesComercialId=await service.CreateConsultationAsync(id, request, ct) });

    private static async Task<IActionResult> Run<T>(Func<Task<T>> action, bool noContent=false)
    {
        try { var result=await action(); return noContent ? new NoContentResult() : new OkObjectResult(result); }
        catch (InvalidOperationException ex) { return new BadRequestObjectResult(new { mensaje=ex.Message }); }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number is 51000 or 2601 or 2627) { return new BadRequestObjectResult(new { mensaje=ex.Message }); }
    }
}
