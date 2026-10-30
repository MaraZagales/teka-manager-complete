using System.Data;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TEKAManager.Core.Data;
using TEKAManager.Core.DTOs;
using TEKAManager.Core.Requests;

namespace TEKAManager.Core.Services;

public sealed class WhatsAppService(
    TekaDbContext db,
    HttpClient http,
    IOptions<WhatsAppOptions> options,
    ILogger<WhatsAppService> logger) : IWhatsAppService
{
    private readonly WhatsAppOptions _options = options.Value;

    public async Task<IReadOnlyList<WhatsAppConversationDTO>> GetConversationsAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
        SELECT c.WhatsAppConversacionId,c.WhatsAppContactoId,p.WhatsAppId,p.TelefonoNormalizado,p.NombrePerfil,
          c.Estado,c.UsuarioResponsableId,CASE WHEN u.UsuarioId IS NULL THEN NULL ELSE LTRIM(RTRIM(CONCAT(u.Nombre,' ',ISNULL(u.Apellido,'')))) END ResponsableNombre,
          c.InteresComercialId,c.FechaUltimaActividad,c.UltimoMensajeEntrante,
          (SELECT COUNT(*) FROM dbo.WhatsAppMensaje m WHERE m.WhatsAppConversacionId=c.WhatsAppConversacionId AND m.Direccion='Entrante' AND m.LeidoEnTeka=0) NoLeidos,
          (SELECT TOP(1) COALESCE(m.Texto,CONCAT('[',m.Tipo,']')) FROM dbo.WhatsAppMensaje m WHERE m.WhatsAppConversacionId=c.WhatsAppConversacionId ORDER BY m.FechaMensaje DESC,m.WhatsAppMensajeId DESC) UltimoMensaje,
          p.ClienteId
        FROM dbo.WhatsAppConversacion c JOIN dbo.WhatsAppContacto p ON p.WhatsAppContactoId=c.WhatsAppContactoId
        LEFT JOIN dbo.Usuario u ON u.UsuarioId=c.UsuarioResponsableId ORDER BY c.FechaUltimaActividad DESC;
        """;
        var result = new List<WhatsAppConversationDTO>();
        await using var command = await CommandAsync(sql, cancellationToken);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) result.Add(MapConversation(reader));
        return result;
    }

    public async Task<IReadOnlyList<WhatsAppAssigneeDTO>> GetAssigneesAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
        SELECT DISTINCT u.UsuarioId,u.Nombre,u.Apellido,u.Email FROM dbo.Usuario u
        JOIN dbo.UsuarioRol ur ON ur.UsuarioId=u.UsuarioId JOIN dbo.Rol r ON r.RolId=ur.RolId AND r.Activo=1
        JOIN dbo.RolPermiso rp ON rp.RolId=r.RolId JOIN dbo.Menu mn ON mn.MenuId=rp.MenuId AND mn.Activo=1
        JOIN dbo.Permiso p ON p.PermisoId=rp.PermisoId AND p.Activo=1
        WHERE u.Activo=1 AND u.Bloqueado=0 AND mn.Nombre='Comercial' AND p.Nombre='Ver' ORDER BY u.Nombre,u.Apellido;
        """;
        var result=new List<WhatsAppAssigneeDTO>(); await using var command=await CommandAsync(sql,cancellationToken); await using var reader=await command.ExecuteReaderAsync(cancellationToken);
        while(await reader.ReadAsync(cancellationToken))result.Add(new(){Id=reader.GetInt32(0),Nombre=reader.GetString(1),Apellido=String(reader,2),Email=reader.GetString(3)}); return result;
    }

    public async Task<WhatsAppConversationDetailDTO?> GetConversationAsync(long id, CancellationToken cancellationToken = default)
    {
        const string sql = """
        SELECT c.WhatsAppConversacionId,c.WhatsAppContactoId,p.WhatsAppId,p.TelefonoNormalizado,p.NombrePerfil,c.Estado,c.UsuarioResponsableId,
          CASE WHEN u.UsuarioId IS NULL THEN NULL ELSE LTRIM(RTRIM(CONCAT(u.Nombre,' ',ISNULL(u.Apellido,'')))) END ResponsableNombre,
          c.InteresComercialId,c.FechaUltimaActividad,c.UltimoMensajeEntrante,
          (SELECT COUNT(*) FROM dbo.WhatsAppMensaje x WHERE x.WhatsAppConversacionId=c.WhatsAppConversacionId AND x.Direccion='Entrante' AND x.LeidoEnTeka=0) NoLeidos,
          (SELECT TOP(1) COALESCE(x.Texto,CONCAT('[',x.Tipo,']')) FROM dbo.WhatsAppMensaje x WHERE x.WhatsAppConversacionId=c.WhatsAppConversacionId ORDER BY x.FechaMensaje DESC,x.WhatsAppMensajeId DESC) UltimoMensaje,
          p.ClienteId
        FROM dbo.WhatsAppConversacion c JOIN dbo.WhatsAppContacto p ON p.WhatsAppContactoId=c.WhatsAppContactoId LEFT JOIN dbo.Usuario u ON u.UsuarioId=c.UsuarioResponsableId
        WHERE c.WhatsAppConversacionId=@Id;
        SELECT WhatsAppMensajeId,MensajeMetaId,SolicitudClienteId,Direccion,Tipo,Texto,Estado,ErrorCodigo,ErrorDescripcion,FechaMensaje,FechaCreacion
        FROM dbo.WhatsAppMensaje WHERE WhatsAppConversacionId=@Id ORDER BY FechaMensaje,WhatsAppMensajeId;
        UPDATE dbo.WhatsAppMensaje SET LeidoEnTeka=1 WHERE WhatsAppConversacionId=@Id AND Direccion='Entrante' AND LeidoEnTeka=0;
        """;
        await using var command = await CommandAsync(sql, cancellationToken);
        Add(command, "@Id", id);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) return null;
        var detail = new WhatsAppConversationDetailDTO { Conversation = MapConversation(reader) };
        await reader.NextResultAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken)) detail.Messages.Add(new WhatsAppMessageDTO
        {
            MensajeId = reader.GetInt64(0), MensajeMetaId = String(reader, 1), SolicitudClienteId = GuidValue(reader, 2),
            Direccion = reader.GetString(3), Tipo = reader.GetString(4), Texto = String(reader, 5), Estado = reader.GetString(6),
            ErrorCodigo = String(reader, 7), ErrorDescripcion = String(reader, 8), FechaMensaje = reader.GetDateTime(9), FechaCreacion = reader.GetDateTime(10)
        });
        return detail;
    }

    public async Task<WhatsAppSendResult> SendTextAsync(long conversationId, WhatsAppSendMessageRequest request, CancellationToken cancellationToken = default)
    {
        if (!_options.HasSendingConfiguration) throw new InvalidOperationException("La integración de WhatsApp no está configurada para enviar mensajes.");
        var text = request.Texto.Trim();
        if (text.Length == 0) throw new InvalidOperationException("El mensaje no puede estar vacío.");

        const string reserve = """
        SET XACT_ABORT ON; BEGIN TRAN;
        IF EXISTS(SELECT 1 FROM dbo.WhatsAppMensaje WITH(UPDLOCK,HOLDLOCK) WHERE SolicitudClienteId=@RequestId)
        BEGIN SELECT WhatsAppMensajeId,MensajeMetaId,Estado,CAST(1 AS bit) Duplicado FROM dbo.WhatsAppMensaje WHERE SolicitudClienteId=@RequestId; COMMIT; RETURN; END;
        DECLARE @To varchar(50),@Last datetime2(3);
        SELECT @To=p.WhatsAppId,@Last=c.UltimoMensajeEntrante FROM dbo.WhatsAppConversacion c JOIN dbo.WhatsAppContacto p ON p.WhatsAppContactoId=c.WhatsAppContactoId WHERE c.WhatsAppConversacionId=@Id AND c.PhoneNumberId=@ConfiguredPhone;
        IF @To IS NULL THROW 51000,'Conversación no encontrada.',1;
        IF @Last IS NULL OR @Last<DATEADD(HOUR,-@Window,SYSUTCDATETIME()) THROW 51000,'La ventana de atención de WhatsApp está cerrada. Se requiere una plantilla aprobada.',1;
        INSERT dbo.WhatsAppMensaje(WhatsAppConversacionId,SolicitudClienteId,Direccion,Tipo,Texto,Estado,FechaMensaje) VALUES(@Id,@RequestId,'Saliente','text',@Text,'Pendiente',SYSUTCDATETIME());
        SELECT CAST(SCOPE_IDENTITY() AS bigint) WhatsAppMensajeId,CAST(NULL AS varchar(150)) MensajeMetaId,'Pendiente' Estado,CAST(0 AS bit) Duplicado,@To Destino; COMMIT;
        """;
        long messageId; string destination;
        await using (var command = await CommandAsync(reserve, cancellationToken))
        {
            Add(command, "@RequestId", request.SolicitudClienteId); Add(command, "@Id", conversationId); Add(command, "@ConfiguredPhone", _options.PhoneNumberId); Add(command, "@Window", _options.FreeFormWindowHours); Add(command, "@Text", text);
            await using var reader = await command.ExecuteReaderAsync(cancellationToken); await reader.ReadAsync(cancellationToken);
            messageId = reader.GetInt64(0);
            if (reader.GetBoolean(3)) return new(messageId, String(reader, 1), reader.GetString(2), true);
            destination = NormalizeMetaRecipient(reader.GetString(4));
        }

        try
        {
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_options.GraphApiVersion}/{_options.PhoneNumberId}/messages");
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);
            httpRequest.Content = JsonContent.Create(new { messaging_product = "whatsapp", recipient_type = "individual", to = destination, type = "text", text = new { preview_url = false, body = text } });
            using var response = await http.SendAsync(httpRequest, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = ReadMetaError(responseBody);
                var errorCode = error.Subcode is null ? error.Code : $"{error.Code}/{error.Subcode}";
                var errorDescription = string.IsNullOrWhiteSpace(error.Detail)
                    ? error.Message
                    : $"{error.Message} {error.Detail}";
                errorDescription = Limit(errorDescription, 1000);
                await MarkSendFailedAsync(messageId, errorCode, errorDescription, cancellationToken);
                logger.LogWarning(
                    "Meta rechazó un mensaje de WhatsApp. HTTP {HttpStatus}; código {MetaCode}; subcódigo {MetaSubcode}; tipo {MetaType}; detalle {MetaDetail}.",
                    (int)response.StatusCode, error.Code, error.Subcode, error.Type, error.Detail);
                throw new InvalidOperationException($"Meta rechazó el mensaje ({errorCode ?? response.StatusCode.ToString()}): {errorDescription}");
            }
            using var json = JsonDocument.Parse(responseBody);
            var metaId = json.RootElement.GetProperty("messages")[0].GetProperty("id").GetString() ?? throw new InvalidOperationException("Meta no devolvió el identificador del mensaje.");
            const string complete = """
            UPDATE dbo.WhatsAppMensaje SET MensajeMetaId=@MetaId,Estado='Enviado',FechaEstado=SYSUTCDATETIME() WHERE WhatsAppMensajeId=@Id;
            UPDATE m SET Estado=p.Estado,FechaEstado=p.FechaEstado,ErrorCodigo=p.ErrorCodigo,ErrorDescripcion=p.ErrorDescripcion FROM dbo.WhatsAppMensaje m JOIN dbo.WhatsAppEstadoPendiente p ON p.MensajeMetaId=m.MensajeMetaId WHERE m.WhatsAppMensajeId=@Id;
            DELETE p FROM dbo.WhatsAppEstadoPendiente p JOIN dbo.WhatsAppMensaje m ON m.MensajeMetaId=p.MensajeMetaId WHERE m.WhatsAppMensajeId=@Id;
            UPDATE dbo.WhatsAppConversacion SET FechaUltimaActividad=SYSUTCDATETIME() WHERE WhatsAppConversacionId=@ConversationId;
            """;
            await ExecuteAsync(complete, cancellationToken, ("@MetaId", metaId), ("@Id", messageId), ("@ConversationId", conversationId));
            return new(messageId, metaId, "Enviado", false);
        }
        catch (OperationCanceledException) { throw; }
        catch (InvalidOperationException) { throw; }
        catch (Exception ex)
        {
            await MarkSendFailedAsync(messageId, "transport", "No se pudo confirmar el envío con Meta.", cancellationToken);
            throw new InvalidOperationException("No se pudo enviar el mensaje a Meta.", ex);
        }
    }

    public Task AssignAsync(long conversationId, int? userId, CancellationToken cancellationToken = default) => ExecuteAsync("""
        IF @UserId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Usuario u JOIN dbo.UsuarioRol ur ON ur.UsuarioId=u.UsuarioId JOIN dbo.Rol r ON r.RolId=ur.RolId AND r.Activo=1 JOIN dbo.RolPermiso rp ON rp.RolId=r.RolId JOIN dbo.Menu mn ON mn.MenuId=rp.MenuId AND mn.Activo=1 JOIN dbo.Permiso p ON p.PermisoId=rp.PermisoId AND p.Activo=1 WHERE u.UsuarioId=@UserId AND u.Activo=1 AND u.Bloqueado=0 AND mn.Nombre='Comercial' AND p.Nombre='Ver') THROW 51000,'El responsable no tiene acceso activo al módulo Comercial.',1;
        UPDATE dbo.WhatsAppConversacion SET UsuarioResponsableId=@UserId WHERE WhatsAppConversacionId=@Id;
        IF @@ROWCOUNT=0 THROW 51000,'Conversación no encontrada.',1;
        """, cancellationToken, ("@UserId", userId), ("@Id", conversationId));

    public Task LinkCustomerAsync(long conversationId, int customerId, CancellationToken cancellationToken = default) => ExecuteAsync("""
        SET XACT_ABORT ON; BEGIN TRAN;
        IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@CustomerId AND Activo=1) THROW 51000,'El cliente no existe o está inactivo.',1;
        DECLARE @ContactId bigint;
        SELECT @ContactId=WhatsAppContactoId FROM dbo.WhatsAppConversacion WITH(UPDLOCK,HOLDLOCK) WHERE WhatsAppConversacionId=@Id;
        IF @ContactId IS NULL THROW 51000,'Conversación no encontrada.',1;
        UPDATE dbo.WhatsAppContacto SET ClienteId=@CustomerId,FechaActualizacion=SYSUTCDATETIME() WHERE WhatsAppContactoId=@ContactId;
        COMMIT;
        """, cancellationToken, ("@CustomerId", customerId), ("@Id", conversationId));

    public Task LinkConsultationAsync(long conversationId, int consultationId, CancellationToken cancellationToken = default) => ExecuteAsync("""
        IF NOT EXISTS(SELECT 1 FROM dbo.InteresComercial WHERE InteresComercialId=@ConsultationId) THROW 51000,'Consulta comercial no encontrada.',1;
        IF EXISTS(SELECT 1 FROM dbo.WhatsAppConversacion WHERE InteresComercialId=@ConsultationId AND WhatsAppConversacionId<>@Id) THROW 51000,'La consulta ya está vinculada con otra conversación.',1;
        UPDATE dbo.WhatsAppConversacion SET InteresComercialId=@ConsultationId WHERE WhatsAppConversacionId=@Id;
        IF @@ROWCOUNT=0 THROW 51000,'Conversación no encontrada.',1;
        """, cancellationToken, ("@ConsultationId", consultationId), ("@Id", conversationId));

    public async Task<int> CreateConsultationAsync(long conversationId, WhatsAppCreateConsultationRequest request, CancellationToken cancellationToken = default)
    {
        const string sql = """
        SET XACT_ABORT ON; BEGIN TRAN;
        DECLARE @Existing int,@Channel int,@ContactId bigint,@Name nvarchar(150),@Phone varchar(30),@User int;
        SELECT @Existing=c.InteresComercialId,@ContactId=c.WhatsAppContactoId,@User=c.UsuarioResponsableId,@Name=p.NombrePerfil,@Phone=p.TelefonoNormalizado
        FROM dbo.WhatsAppConversacion c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.WhatsAppContacto p ON p.WhatsAppContactoId=c.WhatsAppContactoId WHERE c.WhatsAppConversacionId=@Id;
        IF @ContactId IS NULL THROW 51000,'Conversación no encontrada.',1;
        IF @Existing IS NOT NULL BEGIN SELECT @Existing; COMMIT; RETURN; END;
        SELECT TOP(1) @Channel=CanalVentaId FROM dbo.CanalVenta WHERE Activo=1 AND Nombre='WhatsApp' ORDER BY CanalVentaId;
        IF @Channel IS NULL THROW 51000,'No existe un canal de venta activo llamado WhatsApp.',1;
        DECLARE @State int; SELECT @State=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='Pendiente' AND Activo=1;
        IF @State IS NULL THROW 51000,'No existe el estado Pendiente para consultas comerciales.',1;
        IF @Reason IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.MotivoConsultaComercial WHERE MotivoConsultaId=@Reason AND Activo=1) THROW 51000,'Motivo de consulta inválido.',1;
        IF @Product IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@Product AND Activo=1) THROW 51000,'Producto consultado inválido.',1;
        INSERT dbo.InteresComercial(ClienteId,ClienteNombre,Telefono,CanalVentaId,EstadoInteresComercialId,TipoOrigen,ReferenciaOrigen,Descripcion,MontoPotencial,UsuarioResponsableId,MotivoConsultaId,ProductoConsultadoId)
        SELECT p.ClienteId,COALESCE(NULLIF(@Name,''),'Contacto WhatsApp'),@Phone,@Channel,@State,'WhatsApp',CONCAT('WhatsApp:',@Id),@Description,@Amount,@User,@Reason,@Product FROM dbo.WhatsAppContacto p WHERE p.WhatsAppContactoId=@ContactId;
        DECLARE @New int=CONVERT(int,SCOPE_IDENTITY()); UPDATE dbo.WhatsAppConversacion SET InteresComercialId=@New WHERE WhatsAppConversacionId=@Id; SELECT @New; COMMIT;
        """;
        await using var command = await CommandAsync(sql, cancellationToken);
        Add(command, "@Id", conversationId); Add(command, "@Reason", request.MotivoConsultaId); Add(command, "@Product", request.ProductoConsultadoId); Add(command, "@Amount", request.MontoPotencial); Add(command, "@Description", request.Descripcion.Trim());
        return Convert.ToInt32(await command.ExecuteScalarAsync(cancellationToken));
    }

    public async Task ProcessWebhookAsync(string body, CancellationToken cancellationToken = default)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(body));
        if (!await ClaimWebhookAsync(hash, cancellationToken)) return;
        try
        {
            using var document = JsonDocument.Parse(body);
            if (!document.RootElement.TryGetProperty("entry", out var entries)) { await CompleteWebhookAsync(hash, null, cancellationToken); return; }
            foreach (var entry in entries.EnumerateArray())
            {
            if (!string.Equals(Property(entry,"id"),_options.WhatsAppBusinessAccountId,StringComparison.Ordinal)) continue;
            foreach (var change in Array(entry, "changes"))
            {
                if (!change.TryGetProperty("value", out var value)) continue;
                var phoneId = Property(value, "metadata", "phone_number_id") ?? _options.PhoneNumberId;
                if (!string.Equals(phoneId,_options.PhoneNumberId,StringComparison.Ordinal)) continue;
                var contacts = new Dictionary<string,string?>();
                foreach (var contact in Array(value,"contacts")) { var waId=Property(contact,"wa_id"); if(!string.IsNullOrWhiteSpace(waId)) contacts[waId]=Property(contact,"profile","name"); }
                foreach (var message in Array(value, "messages")) await ProcessIncomingAsync(message, contacts, phoneId, body, cancellationToken);
                foreach (var status in Array(value, "statuses")) await ProcessStatusAsync(status, cancellationToken);
            }
            }
            await CompleteWebhookAsync(hash, null, cancellationToken);
        }
        catch (Exception ex)
        {
            await CompleteWebhookAsync(hash, ex.GetType().Name, cancellationToken);
            throw;
        }
    }

    private async Task ProcessIncomingAsync(JsonElement message, Dictionary<string,string?> contacts, string phoneId, string raw, CancellationToken cancellationToken)
    {
        var metaId = Property(message, "id"); var from = Property(message, "from"); var type = Property(message, "type") ?? "unknown";
        if (string.IsNullOrWhiteSpace(metaId) || string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(phoneId)) return;
        var timestamp = UnixTime(Property(message, "timestamp"));
        var text = type == "text" ? Property(message, "text", "body") : $"[Mensaje {type} no compatible]";
        contacts.TryGetValue(from, out var profileName);
        const string sql = """
        SET XACT_ABORT ON; BEGIN TRAN;
        DECLARE @Contact bigint,@Conversation bigint;
        SELECT @Contact=WhatsAppContactoId FROM dbo.WhatsAppContacto WITH(UPDLOCK,HOLDLOCK) WHERE WhatsAppId=@WaId;
        IF @Contact IS NULL BEGIN INSERT dbo.WhatsAppContacto(WhatsAppId,TelefonoNormalizado,NombrePerfil) VALUES(@WaId,@Phone,@Name); SET @Contact=SCOPE_IDENTITY(); END
        ELSE UPDATE dbo.WhatsAppContacto SET TelefonoNormalizado=@Phone,NombrePerfil=COALESCE(@Name,NombrePerfil),FechaActualizacion=SYSUTCDATETIME() WHERE WhatsAppContactoId=@Contact;
        SELECT @Conversation=WhatsAppConversacionId FROM dbo.WhatsAppConversacion WITH(UPDLOCK,HOLDLOCK) WHERE PhoneNumberId=@PhoneId AND WhatsAppContactoId=@Contact AND Estado IN('Abierta','Pendiente');
        IF @Conversation IS NULL SELECT TOP(1) @Conversation=WhatsAppConversacionId FROM dbo.WhatsAppConversacion WITH(UPDLOCK,HOLDLOCK) WHERE PhoneNumberId=@PhoneId AND WhatsAppContactoId=@Contact AND FechaUltimaActividad>=@Date ORDER BY FechaUltimaActividad DESC;
        IF @Conversation IS NULL BEGIN INSERT dbo.WhatsAppConversacion(WhatsAppContactoId,PhoneNumberId,WhatsAppBusinessAccountId,Estado,FechaUltimaActividad,UltimoMensajeEntrante) VALUES(@Contact,@PhoneId,@Waba,'Abierta',@Date,@Date); SET @Conversation=SCOPE_IDENTITY(); END;
        IF NOT EXISTS(SELECT 1 FROM dbo.WhatsAppMensaje WHERE MensajeMetaId=@MetaId)
          INSERT dbo.WhatsAppMensaje(WhatsAppConversacionId,MensajeMetaId,Direccion,Tipo,Texto,Estado,FechaMensaje,PayloadEvento) VALUES(@Conversation,@MetaId,'Entrante',@Type,@Text,'Recibido',@Date,@Raw);
        UPDATE dbo.WhatsAppConversacion SET FechaUltimaActividad=CASE WHEN FechaUltimaActividad<@Date THEN @Date ELSE FechaUltimaActividad END,UltimoMensajeEntrante=CASE WHEN UltimoMensajeEntrante IS NULL OR UltimoMensajeEntrante<@Date THEN @Date ELSE UltimoMensajeEntrante END WHERE WhatsAppConversacionId=@Conversation;
        COMMIT;
        """;
        await ExecuteAsync(sql, cancellationToken, ("@WaId", from), ("@Phone", NormalizePhone(from)), ("@Name", profileName), ("@PhoneId", phoneId), ("@Waba", EmptyToNull(_options.WhatsAppBusinessAccountId)), ("@MetaId", metaId), ("@Type", type), ("@Text", text), ("@Date", timestamp), ("@Raw", raw));
    }

    private Task ProcessStatusAsync(JsonElement status, CancellationToken cancellationToken)
    {
        var metaId = Property(status, "id"); var state = MapStatus(Property(status, "status")); if (metaId is null || state is null) return Task.CompletedTask;
        var date = UnixTime(Property(status, "timestamp"));
        string? code = null, description = null;
        var errors = Array(status, "errors"); if (errors.Count > 0) { code = Property(errors[0], "code"); description = Property(errors[0], "title") ?? Property(errors[0], "message"); }
        const string sql = """
        DECLARE @Current varchar(20); SELECT @Current=Estado FROM dbo.WhatsAppMensaje WHERE MensajeMetaId=@MetaId;
        IF @Current IS NULL
          MERGE dbo.WhatsAppEstadoPendiente AS t USING(SELECT @MetaId Id) s ON t.MensajeMetaId=s.Id
          WHEN MATCHED AND (CASE t.Estado WHEN 'Pendiente' THEN 0 WHEN 'Enviado' THEN 1 WHEN 'Entregado' THEN 2 WHEN 'Leido' THEN 3 WHEN 'Fallido' THEN 4 ELSE 0 END)<@Rank THEN UPDATE SET Estado=@State,FechaEstado=@Date,ErrorCodigo=@Code,ErrorDescripcion=@Description
          WHEN NOT MATCHED THEN INSERT(MensajeMetaId,Estado,FechaEstado,ErrorCodigo,ErrorDescripcion) VALUES(@MetaId,@State,@Date,@Code,@Description);
        ELSE IF @State='Fallido' OR (CASE @Current WHEN 'Pendiente' THEN 0 WHEN 'Enviado' THEN 1 WHEN 'Entregado' THEN 2 WHEN 'Leido' THEN 3 WHEN 'Fallido' THEN 4 ELSE 0 END)<@Rank
          UPDATE dbo.WhatsAppMensaje SET Estado=@State,FechaEstado=@Date,ErrorCodigo=@Code,ErrorDescripcion=@Description WHERE MensajeMetaId=@MetaId;
        """;
        return ExecuteAsync(sql, cancellationToken, ("@MetaId", metaId), ("@State", state), ("@Date", date), ("@Code", code), ("@Description", description), ("@Rank", StatusRank(state)));
    }

    private async Task<bool> ClaimWebhookAsync(byte[] hash, CancellationToken cancellationToken)
    {
        const string sql = """
        SET XACT_ABORT ON; BEGIN TRAN;
        DECLARE @Claimed bit=0;
        IF EXISTS(SELECT 1 FROM dbo.WhatsAppWebhookEvento WITH(UPDLOCK,HOLDLOCK) WHERE Huella=@Hash AND Estado='Error') BEGIN UPDATE dbo.WhatsAppWebhookEvento SET Estado='Procesando',Error=NULL WHERE Huella=@Hash; SET @Claimed=1; END
        ELSE IF NOT EXISTS(SELECT 1 FROM dbo.WhatsAppWebhookEvento WITH(UPDLOCK,HOLDLOCK) WHERE Huella=@Hash) BEGIN INSERT dbo.WhatsAppWebhookEvento(Huella) VALUES(@Hash); SET @Claimed=1; END
        SELECT @Claimed; COMMIT;
        """;
        await using var command = await CommandAsync(sql, cancellationToken); Add(command, "@Hash", hash);
        return Convert.ToBoolean(await command.ExecuteScalarAsync(cancellationToken));
    }

    private Task CompleteWebhookAsync(byte[] hash, string? error, CancellationToken cancellationToken) => ExecuteAsync(
        "UPDATE dbo.WhatsAppWebhookEvento SET Estado=@State,FechaProcesamiento=SYSUTCDATETIME(),Error=@Error WHERE Huella=@Hash",
        cancellationToken, ("@State", error is null ? "Procesado" : "Error"), ("@Error", error), ("@Hash", hash));

    private Task MarkSendFailedAsync(long id, string? code, string description, CancellationToken cancellationToken) => ExecuteAsync(
        "UPDATE dbo.WhatsAppMensaje SET Estado='Fallido',FechaEstado=SYSUTCDATETIME(),ErrorCodigo=@Code,ErrorDescripcion=@Description WHERE WhatsAppMensajeId=@Id",
        cancellationToken, ("@Code", code), ("@Description", description), ("@Id", id));

    private async Task<SqlCommand> CommandAsync(string sql, CancellationToken cancellationToken)
    {
        var connection = (SqlConnection)db.Database.GetDbConnection();
        if (connection.State != ConnectionState.Open) await connection.OpenAsync(cancellationToken);
        return new SqlCommand(sql, connection);
    }
    private async Task ExecuteAsync(string sql, CancellationToken cancellationToken, params (string Name, object? Value)[] parameters)
    {
        await using var command = await CommandAsync(sql, cancellationToken); foreach (var p in parameters) Add(command, p.Name, p.Value); await command.ExecuteNonQueryAsync(cancellationToken);
    }
    private static void Add(SqlCommand command, string name, object? value) => command.Parameters.AddWithValue(name, value ?? DBNull.Value);
    private static string? String(IDataRecord reader, int ordinal) => reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    private static Guid? GuidValue(IDataRecord reader, int ordinal) => reader.IsDBNull(ordinal) ? null : reader.GetGuid(ordinal);
    private static WhatsAppConversationDTO MapConversation(IDataRecord r) => new()
    {
        ConversacionId=r.GetInt64(0),ContactoId=r.GetInt64(1),WhatsAppId=r.GetString(2),Telefono=r.GetString(3),NombrePerfil=String(r,4),Estado=r.GetString(5),
        UsuarioResponsableId=r.IsDBNull(6)?null:r.GetInt32(6),ResponsableNombre=String(r,7),InteresComercialId=r.IsDBNull(8)?null:r.GetInt32(8),FechaUltimaActividad=r.GetDateTime(9),
        UltimoMensajeEntrante=r.IsDBNull(10)?null:r.GetDateTime(10),NoLeidos=r.GetInt32(11),UltimoMensaje=String(r,12),ClienteId=r.IsDBNull(13)?null:r.GetInt32(13)
    };
    private static List<JsonElement> Array(JsonElement element, string name) => element.TryGetProperty(name, out var value) && value.ValueKind==JsonValueKind.Array ? value.EnumerateArray().ToList() : [];
    private static string? Property(JsonElement element, params string[] path) { foreach(var part in path) { if(element.ValueKind!=JsonValueKind.Object || !element.TryGetProperty(part,out element)) return null; } return element.ValueKind switch { JsonValueKind.String=>element.GetString(), JsonValueKind.Number=>element.GetRawText(), _=>null }; }
    private static DateTime UnixTime(string? value) => long.TryParse(value,out var seconds) ? DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime : DateTime.UtcNow;
    private static string NormalizePhone(string value) => new(value.Where(char.IsDigit).ToArray());
    private static string NormalizeMetaRecipient(string value)
    {
        var digits = NormalizePhone(value);
        return digits.Length == 13 && digits.StartsWith("549", StringComparison.Ordinal)
            ? $"54{digits[3..]}"
            : digits;
    }
    private static string? EmptyToNull(string value) => string.IsNullOrWhiteSpace(value)?null:value;
    private static string? MapStatus(string? value) => value switch { "sent"=>"Enviado", "delivered"=>"Entregado", "read"=>"Leido", "failed"=>"Fallido", _=>null };
    private static int StatusRank(string value) => value switch { "Enviado"=>1,"Entregado"=>2,"Leido"=>3,"Fallido"=>4,_=>0 };
    private static string Limit(string value, int length) => value.Length <= length ? value : value[..length];
    private sealed record MetaApiError(string? Code, string? Subcode, string? Type, string Message, string? Detail);
    private static MetaApiError ReadMetaError(string body)
    {
        try
        {
            using var document = JsonDocument.Parse(body);
            var error = document.RootElement.GetProperty("error");
            return new(
                Property(error, "code"),
                Property(error, "error_subcode"),
                Property(error, "type"),
                Property(error, "message") ?? "Error no especificado.",
                Property(error, "error_data", "details"));
        }
        catch
        {
            return new(null, null, null, "Error no especificado.", null);
        }
    }
}
