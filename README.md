# TEKA Manager

### Sistema de Gestión Integral para una Fábrica de Muebles

**Proyecto académico — Tecnicatura Superior en Análisis de Sistemas**

TEKA Manager es un sistema de planificación de recursos empresariales (ERP) desarrollado para centralizar, organizar y optimizar los procesos administrativos, comerciales y operativos de **TEKA**, una fábrica de muebles ubicada en Córdoba, Argentina.

La solución integra diferentes áreas de la organización en una plataforma web, facilitando la administración de la información, la trazabilidad de las operaciones y la toma de decisiones.

El proyecto surge de la necesidad de reemplazar procesos de gestión descentralizados por una herramienta que permita trabajar con información consistente, actualizada y accesible según los permisos de cada usuario.

---

## Integrantes del proyecto

- **Benetti, Gabriela Melina**
- **Pigini, Fernando Mariano**
- **Zagales, Mara Macarena**

## Objetivo del proyecto

Diseñar y desarrollar un sistema de información integral que permita mejorar la gestión de los recursos y procesos de TEKA, mediante la digitalización y centralización de las operaciones de la empresa.

### Objetivos específicos

- Centralizar la información administrativa, comercial y operativa.
- Optimizar el control de inventario de productos e insumos.
- Mejorar el seguimiento de pedidos, ventas, comprobantes y entregas.
- Facilitar la planificación y el control de la producción.
- Administrar las operaciones de cobro y los movimientos financieros.
- Fortalecer la gestión comercial y el seguimiento de oportunidades de venta.
- Incorporar funcionalidades de comercio electrónico.
- Proporcionar información útil para el seguimiento de las actividades y la toma de decisiones.
- Implementar mecanismos de autenticación, autorización y trazabilidad de operaciones.

## Módulos del sistema

TEKA Manager está organizado en módulos funcionales que permiten gestionar diferentes procesos de la organización.

### Inventario

Permite administrar productos, insumos, depósitos, existencias y movimientos de stock. Incluye controles de disponibilidad y seguimiento de niveles críticos de inventario.

### Ventas

Centraliza la gestión de clientes, pedidos, comprobantes, remitos y entregas, permitiendo realizar el seguimiento de las operaciones comerciales.

### Caja, cobros y cuentas corrientes

Facilita la administración de cobros, medios de pago, movimientos de caja, operaciones bancarias y saldos de cuentas corrientes.

### Producción

Permite gestionar órdenes de producción, materiales requeridos, consumo de insumos y resultados del proceso productivo.

### Gestión de recortes

Administra los recortes de materiales generados durante la producción, permitiendo registrar su disponibilidad, reserva, utilización y baja.

### Gestión comercial

Incorpora herramientas para administrar oportunidades comerciales, consultas, presupuestos, actividades de seguimiento y relaciones con clientes potenciales.

### Comercio electrónico

Contempla funcionalidades vinculadas a la publicación y comercialización de productos mediante canales digitales, integradas con la información del sistema de gestión.

### Usuarios, roles y seguridad

Administra el acceso al sistema mediante usuarios, roles y permisos, incorporando mecanismos de autenticación y auditoría.

### Configuración e integraciones

Incluye funcionalidades de configuración general e integraciones con servicios externos, como correo electrónico, WhatsApp y servicios de inteligencia artificial.

## Arquitectura del sistema

TEKA Manager utiliza una arquitectura cliente-servidor, con separación entre la interfaz de usuario, los servicios de aplicación y la persistencia de datos.

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 6 |
| Backend | ASP.NET Core Web API, .NET 8 |
| Base de datos | Microsoft SQL Server |
| Acceso a datos | Entity Framework Core 8, Microsoft.Data.SqlClient y procedimientos almacenados |
| Seguridad | JWT y autorización mediante roles y permisos |
| Documentación API | Swagger / OpenAPI |
| Visualización | ECharts, Plotly y Leaflet |
| Documentos y exportaciones | jsPDF y XLSX |
| Integraciones | SMTP, WhatsApp Cloud API y OpenAI |

### Organización del proyecto

```text
TEKA-Manager/
│
├── Front/
│   ├── public/
│   ├── scripts/
│   └── src/
│
├── Api/
│   ├── TEKAManager.API/
│   ├── TEKAManager.Core/
│   ├── TEKAManager.WhatsAppWebhook/
│   └── TEKAManager.sln
│
├── SQL/
│
├── Docs/
│
├── global.json
├── .gitignore
└── README.md
```

**Front:** contiene la aplicación web desarrollada con React, sus componentes, pantallas, servicios y recursos estáticos.

**Api:** contiene los proyectos .NET responsables de exponer los servicios HTTP, implementar la lógica de aplicación y gestionar integraciones externas.

**SQL:** contiene los scripts correspondientes a la estructura y configuración de la base de datos.

**Docs:** reúne documentación funcional y técnica relacionada con el desarrollo del proyecto.

## Principales características

- Gestión centralizada de los procesos de la empresa.
- Interfaz web organizada por módulos.
- Control de acceso basado en roles y permisos.
- Integración entre procesos comerciales, administrativos y productivos.
- Registro y seguimiento de operaciones.
- Gestión de información mediante una base de datos relacional.
- Servicios REST para la comunicación entre frontend y backend.
- Generación y exportación de información.
- Integración con servicios externos.

## Requisitos técnicos

Para ejecutar TEKA Manager en un entorno local se requiere:

- Node.js y npm compatibles con las dependencias del frontend.
- .NET SDK 8, según la configuración de `global.json`.
- Microsoft SQL Server.
- Una base de datos denominada `TEKA_Manager`.
- Configuración local de las cadenas de conexión y credenciales necesarias.

## Instalación y ejecución

### 1. Obtener el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/MaraZagales/teka-manager-complete.git
cd teka-manager-complete
```

### 2. Configurar la base de datos

Crear una base de datos en SQL Server con el nombre:

```sql
CREATE DATABASE TEKA_Manager;
```

En la carpeta `SQL/` se encuentran los scripts disponibles para crear la estructura de la base de datos y cargar los catálogos técnicos.

Ejecutar los scripts en el siguiente orden:

1. `TEKA_Manager_Estructura_Sin_Datos.sql`
2. `TEKA_Manager_Catalogos_Tecnicos.sql`

**Nota:** los scripts proporcionan una base inicial de estructura y catálogos. La reconstrucción completa requiere disponer de todos los procedimientos almacenados utilizados por los módulos del sistema.

### 3. Configurar el backend

Ingresar a la carpeta:

```powershell
cd Api
```

Restaurar las dependencias:

```powershell
dotnet restore TEKAManager.sln
```

Configurar la conexión a SQL Server y las variables de entorno necesarias, utilizando como referencia los archivos `appsettings.example.json`.

Ejecutar la API:

```powershell
dotnet run --project TEKAManager.API/TEKAManager.API.csproj
```

La configuración local contempla las siguientes direcciones:

- HTTPS: `https://localhost:56061`
- HTTP: `http://localhost:56062`

### 4. Configurar el frontend

Desde la raíz del repositorio, ingresar a:

```powershell
cd Front
```

Instalar las dependencias:

```powershell
npm ci
```

Crear el archivo de configuración local:

```powershell
Copy-Item .env.example .env
```

Verificar que la variable `VITE_API_URL` apunte a la dirección correspondiente de la API:

```env
VITE_API_URL=https://localhost:56061
```

Iniciar el servidor de desarrollo:

```powershell
npm run dev
```

Abrir en el navegador la dirección que informe Vite.

## Seguridad y configuración

El sistema utiliza autenticación basada en JWT y mecanismos de autorización mediante roles y permisos.

Las credenciales de servicios externos, claves de autenticación y cadenas de conexión sensibles deben configurarse localmente mediante variables de entorno o mecanismos seguros de administración de secretos.

El repositorio incluye archivos de configuración de ejemplo, pero no requiere publicar credenciales reales para consultar el código fuente.

## Documentación

La carpeta `Docs/` contiene documentación complementaria del proyecto, incluyendo acuerdos funcionales, estándares y especificaciones técnicas.

La API dispone de documentación mediante Swagger/OpenAPI para facilitar la consulta y prueba de los servicios implementados.

## Alcance académico

TEKA Manager fue desarrollado como proyecto académico de la **Tecnicatura Superior en Análisis de Sistemas**, aplicando conocimientos de análisis de requerimientos, modelado de datos, arquitectura de software, programación, integración de sistemas y diseño de interfaces.

El proyecto busca representar una solución tecnológica aplicable a una organización real, contemplando tanto sus necesidades operativas como sus procesos administrativos y comerciales.

---

**TEKA Manager — Proyecto académico de Análisis de Sistemas.**
