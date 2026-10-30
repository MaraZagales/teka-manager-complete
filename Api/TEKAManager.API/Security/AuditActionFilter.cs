using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TEKAManager.Core.Data;

namespace TEKAManager.API.Security;

public sealed class AuditActionFilter(TekaDbContext db) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executed = await next();
        var method = context.HttpContext.Request.Method;
        if (method is not ("POST" or "PUT" or "PATCH" or "DELETE")) return;
        if (context.HttpContext.User.Identity?.IsAuthenticated != true) return;
        if (!int.TryParse(context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId)) return;
        var status = executed.Result switch { ObjectResult o => o.StatusCode ?? 200, StatusCodeResult s => s.StatusCode, _ => 200 };
        if (status >= 400) return;
        var controller = context.RouteData.Values["controller"]?.ToString() ?? "API";
        if (controller.Equals("Auth", StringComparison.OrdinalIgnoreCase)) return;
        var action = context.RouteData.Values["action"]?.ToString() ?? method;
        int? registroId = int.TryParse(context.RouteData.Values["id"]?.ToString(), out var id) ? id : null;
        await db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_AuditoriaEvento_Insert @UsuarioId,@Modulo,@Entidad,@Accion,@RegistroId,@Descripcion",
            new SqlParameter("@UsuarioId", usuarioId), new SqlParameter("@Modulo", controller),
            new SqlParameter("@Entidad", controller), new SqlParameter("@Accion", action),
            new SqlParameter("@RegistroId", (object?)registroId ?? DBNull.Value),
            new SqlParameter("@Descripcion", $"{method} {context.HttpContext.Request.Path}"));
    }
}
