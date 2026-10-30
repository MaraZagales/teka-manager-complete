# WhatsApp Business Cloud API

La integración usa exclusivamente el número configurado en `WhatsApp__PhoneNumberId`. No modifica ni registra el número comercial real de TEKA.

## Experiencia comercial unificada

La entrada operativa es `/comercial/consultas`: conversaciones, chat y gestión comercial se muestran en tres sectores. La ruta histórica `/comercial/whatsapp` se normaliza a esa URL. Las Consultas Comerciales anteriores que no tienen conversación permanecen accesibles desde **Consultas históricas**, sin generar conversaciones artificiales.

## Preparación

1. Revisar y ejecutar manualmente `SQL/WhatsApp_Cloud_API_v01.sql` sobre `TEKA_Manager`.
2. Configurar secretos mediante User Secrets o variables de entorno. Nunca completar los valores reales en `appsettings.json`.

```powershell
$env:ConnectionStrings__DefaultConnection='Server=...;Database=TEKA_Manager;...'
$env:WhatsApp__Enabled='true'
$env:WhatsApp__AppId='...'
$env:WhatsApp__AppSecret='...'
$env:WhatsApp__PhoneNumberId='...'
$env:WhatsApp__WhatsAppBusinessAccountId='...'
$env:WhatsApp__AccessToken='...'
$env:WhatsApp__WebhookVerifyToken='un-valor-aleatorio-largo'
$env:WhatsApp__GraphApiVersion='vXX.X' # versión habilitada en la app de Meta
dotnet run --project .\TEKAManager.WhatsAppWebhook
```

El token temporal de Meta puede reemplazarse sin recompilar. Para producción debe usarse una credencial administrada y rotada, guardada en el proveedor de secretos del entorno.

## Publicación segura con Cloudflare Tunnel

La opción recomendada es publicar el host mínimo `TEKAManager.WhatsAppWebhook` (puerto HTTPS 56071), no `TEKAManager.API` (56061):

```yaml
ingress:
  - hostname: webhooks.example.com
    path: ^/webhooks/whatsapp$
    service: https://localhost:56071
    originRequest:
      noTLSVerify: true # solo para el certificado local de desarrollo
  - service: http_status:404
```

Limitar en Cloudflare a métodos `GET` y `POST`. En producción usar un certificado de origen válido y retirar `noTLSVerify`. No crear una regla comodín hacia el puerto 56061.

En Meta configurar como callback `https://webhooks.example.com/webhooks/whatsapp`, usar el mismo `WebhookVerifyToken` y suscribir el campo `messages`. El GET devuelve literalmente `hub.challenge`; el POST solo se acepta con una firma `X-Hub-Signature-256` válida.

## Retención

Definir con el responsable de privacidad el plazo comercial aplicable. La limpieza debe ejecutarse por una tarea controlada que anonimice o elimine mensajes vencidos sin romper consultas vinculadas; esta versión no activa borrado automático.
