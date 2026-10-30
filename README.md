# TEKA Manager

TEKA Manager es un sistema ERP academico para la gestion de una fabrica de muebles. El workspace contiene una aplicacion web React, una API ASP.NET Core, un webhook de WhatsApp, servicios de dominio y scripts de SQL Server.

> Estado de publicacion: el contenido versionable esta **sin secretos detectados**, pero el repositorio aun esta **INCOMPLETO para reconstruir todo el sistema** porque faltan cuatro procedimientos de negocio referenciados por la API. Los `appsettings.json`, ZIP y el export privado `SQL/Script comp.sql` estan ignorados. La rotacion de las credenciales locales sigue siendo una accion externa obligatoria.

## Tecnologias verificadas

- Frontend: React 18, TypeScript 5 y Vite 6.
- Visualizacion y documentos: ECharts, Plotly, Leaflet, jsPDF y XLSX.
- Backend: .NET 8 / ASP.NET Core Web API.
- Acceso a datos: Entity Framework Core 8 y Microsoft.Data.SqlClient sobre SQL Server, con procedimientos almacenados.
- Seguridad y documentacion de API: autenticacion JWT y Swagger/OpenAPI.
- Integraciones presentes en configuracion: SMTP, WhatsApp Cloud API y OpenAI.

La version de SDK fijada por `global.json` es .NET SDK `8.0.426`, con `rollForward` a la ultima revision compatible.

## Estructura

```text
TEKA-Manager-v03/
|-- Front/                         React, TypeScript y Vite
|   |-- public/                    recursos estaticos
|   |-- scripts/                   utilidades del frontend
|   `-- src/                       aplicacion y modulos funcionales
|-- Api/
|   |-- TEKAManager.API/           API HTTP, controladores y configuracion
|   |-- TEKAManager.Core/          servicios, entidades, DTO y requests
|   |-- TEKAManager.WhatsAppWebhook/ receptor independiente de webhooks
|   `-- TEKAManager.sln            solucion .NET
|-- SQL/                            esquema sanitizado, catalogos y export local ignorado
|-- Docs/                           acuerdos, estandares y documentacion tecnica
|-- global.json                    version del SDK .NET
`-- README.md
```

## Modulos verificados

El codigo del frontend y los controladores de la API contienen modulos para autenticacion y recuperacion de acceso, usuarios, roles y permisos, auditoria, inventario y existencias, ventas y remitos, comercial y oportunidades, ecommerce, caja y bancos, cobros y cuenta corriente, produccion, recortes, configuracion y WhatsApp.

## Requisitos

- Node.js y npm compatibles con las versiones bloqueadas en `Front/package-lock.json`. El proyecto no declara una version exacta de Node.
- .NET SDK 8; el workspace fija la version indicada en `global.json`.
- SQL Server. El workspace no fija una edicion o version concreta.
- Una base `TEKA_Manager` con las tablas, vistas y procedimientos requeridos.

No se deben versionar credenciales, tokens, certificados, backups ni exportaciones con datos reales.

## Frontend

Desde `Front/`:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

La unica variable de entorno Vite verificada es:

| Variable | Uso | Ejemplo local |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `https://localhost:56061` |

El perfil local de la API declara `https://localhost:56061` y `http://localhost:56062`. El codigo del frontend conserva `http://localhost:5000` como fallback cuando la variable no esta definida, por lo que se recomienda crear `.env` desde el ejemplo. Para generar una compilacion de produccion:

```powershell
npm run build
```

## API

Desde `Api/`:

```powershell
Copy-Item TEKAManager.API/appsettings.example.json TEKAManager.API/appsettings.json
Copy-Item TEKAManager.WhatsAppWebhook/appsettings.example.json TEKAManager.WhatsAppWebhook/appsettings.json
dotnet restore TEKAManager.sln
dotnet run --project TEKAManager.API/TEKAManager.API.csproj
```

El webhook es un proceso separado:

```powershell
dotnet run --project TEKAManager.WhatsAppWebhook/TEKAManager.WhatsAppWebhook.csproj
```

Antes de ejecutar, reemplazar los marcadores mediante configuracion externa segura; no escribir secretos en los archivos copiados. Los archivos reales `appsettings.json` son locales y estan ignorados porque actualmente contienen secretos. Los archivos `appsettings.example.json` documentan la estructura requerida sin valores utilizables.

### Configuracion segura

`WebApplication.CreateBuilder(args)` ya carga variables de entorno de ASP.NET Core, por lo que no se necesita cambiar codigo para usarlas. La notacion reemplaza `:` por `__`; por ejemplo:

```text
ConnectionStrings__DefaultConnection
Jwt__Key
EcommerceJwt__Key
Email__Username
Email__Password
WhatsApp__AppSecret
WhatsApp__AccessToken
WhatsApp__WebhookVerifyToken
OpenAI__ApiKey
```

En PowerShell se pueden definir solo para la terminal actual, sin escribirlas en el repositorio:

```powershell
$env:ConnectionStrings__DefaultConnection = "<CONEXION_LOCAL>"
$env:Jwt__Key = "<CLAVE_LOCAL_ALEATORIA>"
$env:EcommerceJwt__Key = "<CLAVE_LOCAL_ALEATORIA>"
```

Los proyectos no tienen actualmente un `UserSecretsId`. Quien prefiera User Secrets debe inicializarlo manualmente para cada proyecto y luego guardar las claves fuera del workspace:

```powershell
dotnet user-secrets init --project TEKAManager.API/TEKAManager.API.csproj
dotnet user-secrets set "Jwt:Key" "<CLAVE_LOCAL>" --project TEKAManager.API/TEKAManager.API.csproj

dotnet user-secrets init --project TEKAManager.WhatsAppWebhook/TEKAManager.WhatsAppWebhook.csproj
dotnet user-secrets set "WhatsApp:AccessToken" "<TOKEN_LOCAL>" --project TEKAManager.WhatsAppWebhook/TEKAManager.WhatsAppWebhook.csproj
```

`user-secrets init` agrega un identificador al `.csproj`; no fue ejecutado durante la preparacion. En produccion se debe usar el proveedor de secretos de la plataforma. Tambien se requieren los identificadores de cuenta de WhatsApp cuando esa integracion esta habilitada. Consultar `Docs/WhatsApp_Cloud_API.md` para el flujo verificado en el proyecto.

Las variables `VITE_*` quedan incorporadas al JavaScript enviado al navegador. Nunca deben contener contrasenas, tokens ni claves privadas.

## SQL Server

Los archivos preparados son:

- `TEKA_Manager_Estructura_Sin_Datos.sql`: 167 tablas, claves y relaciones, 361 procedimientos y 6 vistas, sin registros exportados;
- `TEKA_Manager_Catalogos_Tecnicos.sql`: 433 filas de 34 catalogos tecnicos permitidos, dentro de una transaccion;
- `Script comp.sql`: export local original con datos privados, excluido por `.gitignore`.

El script de estructura no crea la base. Primero se debe crear una base vacia llamada `TEKA_Manager`, ejecutar `TEKA_Manager_Estructura_Sin_Datos.sql` y, opcionalmente, ejecutar `TEKA_Manager_Catalogos_Tecnicos.sql`. Ninguno fue ejecutado durante esta preparacion.

El seed incluye exclusivamente tipos, estados, motivos, unidades, moneda, IVA, provincias/localidades, menus, permisos, roles y sus relaciones. Excluye usuarios, contrasenas, recuperaciones de acceso, clientes, domicilios, productos, insumos, depositos, cuentas bancarias, auditoria, comprobantes, pedidos, stock y movimientos.

No se encontraron funciones SQL ni triggers aprobados en las fuentes actualmente disponibles. La comparacion estatica entre la API y el esquema encontro cuatro procedimientos de negocio ausentes:

- `sp_InteresComercial_GetById`
- `sp_InteresComercial_Update`
- `sp_GIR_CertificarDiseno`
- `sp_GIR_VincularReceta`

`sys.sp_getapplock` y `sys.sp_releaseapplock` tambien aparecen en el codigo, pero son procedimientos propios de SQL Server y no deben incluirse en el esquema. Los cuatro procedimientos de negocio deben recuperarse desde una fuente aprobada; no deben reconstruirse por inferencia porque contienen reglas funcionales.

Al momento de la revision final, los scripts incrementales vistos en la auditoria inicial ya no estaban presentes en `SQL/`. Las vistas se recuperaron en memoria desde `SQL.zip` y quedaron consolidadas en el script seguro. No se restauraron ni sobrescribieron otros archivos.

## Contenido versionable

Se conservan el codigo fuente, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `global.json`, la solucion y proyectos .NET, recursos estaticos, documentacion revisada, scripts SQL sin datos privados y los archivos de configuracion de ejemplo.

El `.gitignore` raiz excluye dependencias, compilaciones, caches, configuracion local, secretos, certificados, logs, artefactos de IDE, backups de SQL Server, el export SQL con datos y las copias ZIP del workspace.

## Comprobaciones antes de inicializar Git

1. Rotar todas las claves y tokens presentes actualmente en los dos `appsettings.json`.
2. Confirmar que los nuevos valores se proporcionan mediante User Secrets, variables de entorno o un gestor de secretos.
3. Recuperar y revisar los cuatro procedimientos de negocio faltantes.
4. Revisar el script SQL base sanitizado y los catalogos en una base descartable.
5. Revisar la lista final con `git status --ignored` despues de inicializar Git localmente.
6. Ejecutar la compilacion del frontend y de la solucion .NET sin modificar dependencias.

No inicializar ni publicar el repositorio hasta completar los puntos anteriores.
