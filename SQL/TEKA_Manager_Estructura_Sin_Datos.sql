-- TEKA Manager - estructura SQL Server sin datos privados
-- Generado mecanicamente desde "Script comp.sql". No contiene la seccion de INSERT exportada.
-- Incluye tablas, indices, claves, relaciones, restricciones, procedimientos y las vistas versionadas.
-- Revisar en una base vacia antes de usar fuera de desarrollo.

USE [TEKA_Manager]
GO
/****** Objeto: Table [dbo].[ActividadComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ActividadComercial](
	[ActividadComercialId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[OportunidadComercialId] [int] NULL,
	[PresupuestoComercialId] [int] NULL,
	[UsuarioResponsableId] [int] NULL,
	[Tipo] [varchar](25) NOT NULL,
	[Titulo] [nvarchar](150) NOT NULL,
	[Descripcion] [nvarchar](1000) NULL,
	[FechaProgramada] [datetime2](0) NOT NULL,
	[FechaRealizacion] [datetime2](0) NULL,
	[Estado] [varchar](20) NOT NULL,
	[Resultado] [nvarchar](1000) NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ActividadComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AlicuotaIVA] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AlicuotaIVA](
	[AlicuotaIVAId] [int] IDENTITY(1,1) NOT NULL,
	[CodigoARCA] [int] NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Porcentaje] [decimal](5, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AlicuotaIVAId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AplicacionCobro] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AplicacionCobro](
	[AplicacionCobroId] [int] IDENTITY(1,1) NOT NULL,
	[CobroId] [int] NOT NULL,
	[ComprobanteId] [int] NOT NULL,
	[ImporteAplicado] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AplicacionCobroId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaAsignacionComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaAsignacionComercial](
	[AuditoriaAsignacionComercialId] [bigint] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CupoOnlineAnterior] [decimal](18, 2) NOT NULL,
	[CupoOnlineNuevo] [decimal](18, 2) NOT NULL,
	[Motivo] [varchar](250) NOT NULL,
	[UsuarioResponsable] [nvarchar](128) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaAsignacionComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaCorreccionRemitoProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaCorreccionRemitoProveedor](
	[AuditoriaCorreccionRemitoProveedorId] [bigint] IDENTITY(1,1) NOT NULL,
	[RemitoRecepcionProveedorId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[CantidadAnterior] [decimal](18, 2) NOT NULL,
	[CantidadNueva] [decimal](18, 2) NOT NULL,
	[Diferencia] [decimal](18, 2) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[Motivo] [nvarchar](300) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaCorreccionRemitoProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaEdicionPedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaEdicionPedido](
	[AuditoriaEdicionPedidoId] [bigint] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NOT NULL,
	[DetallePedidoId] [int] NULL,
	[ProductoId] [int] NOT NULL,
	[Operacion] [varchar](20) NOT NULL,
	[CantidadAnterior] [decimal](18, 2) NOT NULL,
	[CantidadNueva] [decimal](18, 2) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaEdicionPedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaEvento] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaEvento](
	[AuditoriaEventoId] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaEvento] [datetime] NOT NULL,
	[Modulo] [varchar](50) NOT NULL,
	[Entidad] [varchar](100) NOT NULL,
	[Accion] [varchar](50) NOT NULL,
	[RegistroId] [int] NULL,
	[Descripcion] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaEventoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaFichaTecnicaEstimacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaFichaTecnicaEstimacion](
	[ProductoId] [int] NOT NULL,
	[AnchoAnterior] [decimal](10, 2) NULL,
	[AltoAnterior] [decimal](10, 2) NULL,
	[ProfundidadAnterior] [decimal](10, 2) NULL,
	[AnchoPropuesto] [decimal](10, 2) NOT NULL,
	[AltoPropuesto] [decimal](10, 2) NOT NULL,
	[ProfundidadPropuesta] [decimal](10, 2) NOT NULL,
	[Origen] [varchar](120) NOT NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[AuditoriaSesion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaSesion](
	[AuditoriaSesionId] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaLogin] [datetime] NOT NULL,
	[FechaLogout] [datetime] NULL,
	[Exitoso] [bit] NOT NULL,
	[IpOrigen] [varchar](50) NULL,
	[Observaciones] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaSesionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[BancoConciliacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BancoConciliacion](
	[BancoConciliacionId] [bigint] IDENTITY(1,1) NOT NULL,
	[BancoMovimientoId] [bigint] NOT NULL,
	[MovimientoFinancieroId] [bigint] NOT NULL,
	[FechaConciliacion] [datetime2](0) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[Metodo] [varchar](15) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_BancoConciliacion] PRIMARY KEY CLUSTERED 
(
	[BancoConciliacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[BancoImportacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BancoImportacion](
	[BancoImportacionId] [bigint] IDENTITY(1,1) NOT NULL,
	[CuentaBancariaId] [int] NOT NULL,
	[NombreArchivo] [nvarchar](255) NOT NULL,
	[HuellaArchivo] [char](64) NOT NULL,
	[FechaImportacion] [datetime2](0) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[Estado] [varchar](15) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_BancoImportacion] PRIMARY KEY CLUSTERED 
(
	[BancoImportacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[BancoMovimiento] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BancoMovimiento](
	[BancoMovimientoId] [bigint] IDENTITY(1,1) NOT NULL,
	[BancoImportacionId] [bigint] NOT NULL,
	[CuentaBancariaId] [int] NOT NULL,
	[FechaMovimiento] [date] NOT NULL,
	[Tipo] [varchar](10) NOT NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Descripcion] [nvarchar](500) NOT NULL,
	[ReferenciaBanco] [nvarchar](150) NULL,
	[ClaveMovimiento] [char](64) NOT NULL,
	[Estado] [varchar](15) NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_BancoMovimiento] PRIMARY KEY CLUSTERED 
(
	[BancoMovimientoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Caja] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Caja](
	[CajaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CajaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CajaArqueo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CajaArqueo](
	[CajaArqueoId] [bigint] IDENTITY(1,1) NOT NULL,
	[CajaSesionId] [bigint] NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[EfectivoEsperado] [decimal](18, 2) NOT NULL,
	[EfectivoContado] [decimal](18, 2) NOT NULL,
	[Diferencia] [decimal](18, 2) NOT NULL,
	[UltimoMovimientoId] [bigint] NULL,
	[Observaciones] [varchar](500) NULL,
 CONSTRAINT [PK_CajaArqueo] PRIMARY KEY CLUSTERED 
(
	[CajaArqueoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CajaConcepto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CajaConcepto](
	[CajaConceptoId] [int] IDENTITY(1,1) NOT NULL,
	[Codigo] [varchar](30) NOT NULL,
	[Nombre] [nvarchar](120) NOT NULL,
	[Tipo] [varchar](25) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_CajaConcepto] PRIMARY KEY CLUSTERED 
(
	[CajaConceptoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CajaConfiguracion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CajaConfiguracion](
	[CajaId] [int] NOT NULL,
	[EsFisica] [bit] NOT NULL,
	[FondoFijoObjetivo] [decimal](18, 2) NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
	[UsuarioActualizacionId] [int] NULL,
 CONSTRAINT [PK_CajaConfiguracion] PRIMARY KEY CLUSTERED 
(
	[CajaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CajaMovimiento] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CajaMovimiento](
	[CajaMovimientoId] [bigint] IDENTITY(1,1) NOT NULL,
	[CajaSesionId] [bigint] NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[Tipo] [varchar](25) NOT NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Concepto] [varchar](250) NOT NULL,
	[Referencia] [varchar](150) NULL,
	[Observaciones] [varchar](500) NULL,
	[UsuarioId] [int] NOT NULL,
	[CobroId] [int] NULL,
	[CajaConceptoId] [int] NULL,
	[ClaveOperacion] [uniqueidentifier] NULL,
 CONSTRAINT [PK_CajaMovimiento] PRIMARY KEY CLUSTERED 
(
	[CajaMovimientoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CajaSesion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CajaSesion](
	[CajaSesionId] [bigint] IDENTITY(1,1) NOT NULL,
	[CajaId] [int] NOT NULL,
	[Estado] [varchar](10) NOT NULL,
	[FechaApertura] [datetime2](0) NOT NULL,
	[UsuarioAperturaId] [int] NOT NULL,
	[FondoObjetivoApertura] [decimal](18, 2) NOT NULL,
	[EfectivoInicial] [decimal](18, 2) NOT NULL,
	[ObservacionApertura] [varchar](500) NULL,
	[FechaCierre] [datetime2](0) NULL,
	[UsuarioCierreId] [int] NULL,
	[EfectivoEsperadoCierre] [decimal](18, 2) NULL,
	[EfectivoContadoCierre] [decimal](18, 2) NULL,
	[DiferenciaCierre] [decimal](18, 2) NULL,
	[ObservacionCierre] [varchar](500) NULL,
 CONSTRAINT [PK_CajaSesion] PRIMARY KEY CLUSTERED 
(
	[CajaSesionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CanalVenta] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CanalVenta](
	[CanalVentaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CanalVentaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Carrito] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Carrito](
	[CarritoId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NULL,
	[IdentificadorSesion] [uniqueidentifier] NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
	[FechaUltimaActividad] [datetime] NOT NULL,
	[FechaAbandono] [datetime] NULL,
	[FechaConversion] [datetime] NULL,
	[PedidoIdConvertido] [int] NULL,
	[Activo] [bit] NOT NULL,
	[FechaInicioCheckout] [datetime2](0) NULL,
	[FechaUltimaActividadCheckout] [datetime2](0) NULL,
	[CheckoutCompletadoFecha] [datetime2](0) NULL,
	[ContactoNombre] [varchar](100) NULL,
	[ContactoApellido] [varchar](100) NULL,
	[ContactoTelefono] [varchar](30) NULL,
	[ContactoEmail] [varchar](150) NULL,
	[ConsentimientoContactoFecha] [datetime2](0) NULL,
PRIMARY KEY CLUSTERED 
(
	[CarritoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Cliente] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Cliente](
	[ClienteId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Apellido] [varchar](100) NULL,
	[TipoDocumentoId] [int] NOT NULL,
	[Documento] [varchar](20) NULL,
	[Telefono] [varchar](30) NULL,
	[Email] [varchar](150) NULL,
	[CondicionIVAId] [int] NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
	[MotivoInactivacionId] [int] NULL,
	[ObservacionInactivacion] [varchar](250) NULL,
	[FechaInactivacion] [datetime] NULL,
	[DocumentoNormalizado]  AS (nullif(upper(replace(replace(replace(replace(replace(replace(replace(replace(ltrim(rtrim([Documento])),'.',''),'-',''),'/',''),' ',''),'(',''),')',''),char((9)),''),char((160)),'')),'')) PERSISTED,
PRIMARY KEY CLUSTERED 
(
	[ClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Cobro] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Cobro](
	[CobroId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[PedidoId] [int] NULL,
	[CajaId] [int] NULL,
	[MedioCobroId] [int] NOT NULL,
	[EstadoCobroId] [int] NOT NULL,
	[FechaCobro] [datetime] NOT NULL,
	[ImporteBase] [decimal](18, 2) NOT NULL,
	[PorcentajeAplicado] [decimal](5, 2) NOT NULL,
	[ImporteAjuste] [decimal](18, 2) NOT NULL,
	[ImporteFinal] [decimal](18, 2) NOT NULL,
	[ReferenciaExterna] [varchar](100) NULL,
	[Observaciones] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[CobroId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CobroEdicion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CobroEdicion](
	[CobroEdicionId] [int] IDENTITY(1,1) NOT NULL,
	[CobroId] [int] NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaEdicion] [datetime2](0) NOT NULL,
	[DatosAnteriores] [nvarchar](max) NOT NULL,
	[DatosPosteriores] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_CobroEdicion] PRIMARY KEY CLUSTERED 
(
	[CobroEdicionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Color] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Color](
	[ColorId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[CodigoHex] [varchar](10) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ColorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CompraProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompraProveedor](
	[CompraProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[ProveedorId] [int] NOT NULL,
	[OfertaProveedorId] [int] NULL,
	[FechaCompra] [datetime2](0) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
	[UsuarioId] [int] NOT NULL,
 CONSTRAINT [PK_CompraProveedor] PRIMARY KEY CLUSTERED 
(
	[CompraProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CompraProveedorDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CompraProveedorDetalle](
	[CompraProveedorDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[CompraProveedorId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[CantidadComprada] [decimal](18, 2) NOT NULL,
	[PrecioUnitario] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_CompraProveedorDetalle] PRIMARY KEY CLUSTERED 
(
	[CompraProveedorDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Comprobante] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Comprobante](
	[ComprobanteId] [int] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NULL,
	[ClienteId] [int] NOT NULL,
	[TipoComprobanteId] [int] NOT NULL,
	[PuntoVenta] [int] NOT NULL,
	[NumeroComprobante] [bigint] NULL,
	[FechaComprobante] [date] NOT NULL,
	[TipoDocumentoId] [int] NOT NULL,
	[DocumentoReceptor] [bigint] NOT NULL,
	[CondicionIVAId] [int] NULL,
	[ConceptoComprobanteId] [int] NOT NULL,
	[MonedaId] [int] NOT NULL,
	[ImporteNoGravado] [decimal](18, 2) NOT NULL,
	[ImporteExento] [decimal](18, 2) NOT NULL,
	[ImporteNetoGravado] [decimal](18, 2) NOT NULL,
	[ImporteIVA] [decimal](18, 2) NOT NULL,
	[ImporteTributos] [decimal](18, 2) NOT NULL,
	[ImporteTotal] [decimal](18, 2) NOT NULL,
	[CAE] [varchar](20) NULL,
	[FechaVencimientoCAE] [date] NULL,
	[CAEA] [varchar](20) NULL,
	[ResultadoARCA] [char](1) NULL,
	[EstadoComprobante] [varchar](30) NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[ComprobanteAsociadoId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ComprobanteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ConceptoComprobante] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConceptoComprobante](
	[ConceptoComprobanteId] [int] IDENTITY(1,1) NOT NULL,
	[CodigoARCA] [int] NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ConceptoComprobanteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CondicionIVA] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CondicionIVA](
	[CondicionIVAId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[CodigoAFIP] [varchar](10) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CondicionIVAId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ConsumoProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConsumoProduccion](
	[ConsumoProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[FechaConsumo] [datetime] NOT NULL,
	[CantidadConsumida] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[ConsumoProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ConsumoRecorteProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConsumoRecorteProduccion](
	[ConsumoRecorteProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[RecorteId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[FechaConsumo] [datetime] NOT NULL,
	[CantidadConsumida] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[ConsumoRecorteProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CuentaBancariaTEKA] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CuentaBancariaTEKA](
	[CuentaBancariaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [nvarchar](120) NOT NULL,
	[Banco] [nvarchar](120) NOT NULL,
	[Moneda] [char](3) NOT NULL,
	[CBU] [varchar](22) NULL,
	[Alias] [varchar](100) NULL,
	[Activa] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_CuentaBancariaTEKA] PRIMARY KEY CLUSTERED 
(
	[CuentaBancariaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[CuentaClienteEcommerce] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CuentaClienteEcommerce](
	[CuentaClienteEcommerceId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[EmailNormalizado] [nvarchar](150) NOT NULL,
	[PasswordHash] [nvarchar](500) NOT NULL,
	[EmailVerificado] [bit] NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
	[FechaUltimoAcceso] [datetime2](0) NULL,
 CONSTRAINT [PK_CuentaClienteEcommerce] PRIMARY KEY CLUSTERED 
(
	[CuentaClienteEcommerceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Deposito] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Deposito](
	[DepositoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Ubicacion] [varchar](150) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DepositoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DetalleCarrito] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleCarrito](
	[DetalleCarritoId] [int] IDENTITY(1,1) NOT NULL,
	[CarritoId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioReferencia] [decimal](18, 2) NULL,
	[FechaActualizacion] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DetalleCarritoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DetalleComprobante] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleComprobante](
	[DetalleComprobanteId] [int] IDENTITY(1,1) NOT NULL,
	[ComprobanteId] [int] NOT NULL,
	[ProductoId] [int] NULL,
	[DescripcionItem] [varchar](255) NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioUnitario] [decimal](18, 2) NOT NULL,
	[BonificacionImporte] [decimal](18, 2) NOT NULL,
	[ImporteNetoItem] [decimal](18, 2) NOT NULL,
	[AlicuotaIVAId] [int] NULL,
	[BaseImponibleIVA] [decimal](18, 2) NULL,
	[ImporteIVAItem] [decimal](18, 2) NULL,
	[ImporteTotalItem] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DetalleComprobanteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DetalleListaMateriales] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleListaMateriales](
	[DetalleListaMaterialesId] [int] IDENTITY(1,1) NOT NULL,
	[ListaMaterialesId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[DetalleListaMaterialesId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DetallePedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetallePedido](
	[DetallePedidoId] [int] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioUnitario] [decimal](18, 2) NOT NULL,
	[Subtotal] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DetallePedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DetalleRemito] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DetalleRemito](
	[DetalleRemitoId] [int] IDENTITY(1,1) NOT NULL,
	[RemitoId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DetalleRemitoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DevolucionVentaIntegral] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DevolucionVentaIntegral](
	[DevolucionVentaIntegralId] [int] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NOT NULL,
	[ComprobanteVentaId] [int] NULL,
	[NotaCreditoId] [int] NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[Motivo] [varchar](250) NOT NULL,
	[MercaderiaRecibidaApta] [bit] NOT NULL,
	[ReintegroRealizado] [bit] NOT NULL,
	[MedioReintegro] [varchar](50) NOT NULL,
	[CajaId] [int] NULL,
	[ReferenciaReintegro] [varchar](100) NULL,
	[ImporteReintegrado] [decimal](18, 2) NOT NULL,
	[ImporteComprobante] [decimal](18, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[DevolucionVentaIntegralId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[DomicilioCliente] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DomicilioCliente](
	[DomicilioClienteId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[TipoDomicilio] [varchar](30) NOT NULL,
	[Direccion] [varchar](250) NULL,
	[Calle] [varchar](120) NOT NULL,
	[Altura] [varchar](20) NOT NULL,
	[PisoDepto] [varchar](50) NULL,
	[Barrio] [varchar](100) NULL,
	[CodigoPostal] [varchar](20) NULL,
	[LocalidadId] [int] NOT NULL,
	[ProvinciaId] [int] NOT NULL,
	[Activo] [bit] NOT NULL,
	[TipoDomicilioId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DomicilioClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EcommerceBeneficioRecorteConfig] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EcommerceBeneficioRecorteConfig](
	[ConfiguracionId] [tinyint] NOT NULL,
	[UmbralGratuidad] [decimal](18, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_EcommerceBeneficioRecorteConfig] PRIMARY KEY CLUSTERED 
(
	[ConfiguracionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EcommerceBeneficioRecortePedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EcommerceBeneficioRecortePedido](
	[PedidoId] [int] NOT NULL,
	[ProductoRecorteId] [int] NOT NULL,
	[DetallePedidoId] [int] NULL,
	[PrecioAplicado] [decimal](18, 2) NOT NULL,
	[EsGratuito] [bit] NOT NULL,
	[FechaAsignacion] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_EcommerceBeneficioRecortePedido] PRIMARY KEY CLUSTERED 
(
	[PedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EcommerceProductoRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EcommerceProductoRecorte](
	[ProductoRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[CantidadHabilitada] [decimal](18, 2) NOT NULL,
	[PrecioSimbolico] [decimal](18, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_EcommerceProductoRecorte] PRIMARY KEY CLUSTERED 
(
	[ProductoRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EcommercePromocion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EcommercePromocion](
	[PromocionId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [nvarchar](120) NOT NULL,
	[Descripcion] [nvarchar](500) NULL,
	[TipoDescuento] [varchar](12) NOT NULL,
	[ValorDescuento] [decimal](18, 2) NOT NULL,
	[FechaDesde] [datetime2](0) NOT NULL,
	[FechaHasta] [datetime2](0) NOT NULL,
	[Activa] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_EcommercePromocion] PRIMARY KEY CLUSTERED 
(
	[PromocionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EcommercePromocionProducto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EcommercePromocionProducto](
	[PromocionId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
 CONSTRAINT [PK_EcommercePromocionProducto] PRIMARY KEY CLUSTERED 
(
	[PromocionId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EgresoDevolucionVenta] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EgresoDevolucionVenta](
	[EgresoDevolucionVentaId] [int] IDENTITY(1,1) NOT NULL,
	[DevolucionVentaIntegralId] [int] NOT NULL,
	[FechaEgreso] [datetime2](0) NOT NULL,
	[MedioReintegro] [varchar](50) NOT NULL,
	[CajaId] [int] NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Referencia] [varchar](100) NULL,
	[CajaMovimientoId] [bigint] NULL,
	[MovimientoFinancieroId] [bigint] NULL,
	[CuentaBancariaId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[EgresoDevolucionVentaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EnvioComprobanteCorreo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EnvioComprobanteCorreo](
	[EnvioComprobanteCorreoId] [bigint] IDENTITY(1,1) NOT NULL,
	[ComprobanteId] [int] NOT NULL,
	[UsuarioId] [int] NULL,
	[Destinatario] [varchar](254) NOT NULL,
	[Asunto] [nvarchar](250) NOT NULL,
	[Estado] [varchar](15) NOT NULL,
	[FechaSolicitud] [datetime2](0) NOT NULL,
	[FechaResultado] [datetime2](0) NULL,
	[MensajeError] [nvarchar](1000) NULL,
	[IdentificadorExterno] [nvarchar](255) NULL,
 CONSTRAINT [PK_EnvioComprobanteCorreo] PRIMARY KEY CLUSTERED 
(
	[EnvioComprobanteCorreoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoCobro] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoCobro](
	[EstadoCobroId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoCobroId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoInteresComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoInteresComercial](
	[EstadoInteresComercialId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](30) NOT NULL,
	[Orden] [int] NOT NULL,
	[EsFinal] [bit] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoInteresComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoOportunidadComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoOportunidadComercial](
	[EstadoOportunidadComercialId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Orden] [int] NOT NULL,
	[EsFinal] [bit] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoOportunidadComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoOrdenProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoOrdenProduccion](
	[EstadoOrdenProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoOrdenProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoPedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoPedido](
	[EstadoPedidoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoPedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[EstadoRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoRecorte](
	[EstadoRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[FacturaProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FacturaProveedor](
	[FacturaProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[ProveedorId] [int] NOT NULL,
	[CompraProveedorId] [int] NULL,
	[NumeroFactura] [varchar](50) NOT NULL,
	[FechaEmision] [date] NOT NULL,
	[FechaVencimiento] [date] NULL,
	[ImporteTotal] [decimal](18, 2) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_FacturaProveedor] PRIMARY KEY CLUSTERED 
(
	[FacturaProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[HistorialEstadoOportunidad] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialEstadoOportunidad](
	[HistorialEstadoOportunidadId] [int] IDENTITY(1,1) NOT NULL,
	[OportunidadComercialId] [int] NOT NULL,
	[EstadoOportunidadComercialId] [int] NOT NULL,
	[FechaCambio] [datetime] NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialEstadoOportunidadId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[HistorialEstadoOrdenProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialEstadoOrdenProduccion](
	[HistorialEstadoOrdenProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[EstadoOrdenProduccionId] [int] NOT NULL,
	[FechaCambio] [datetime] NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialEstadoOrdenProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[HistorialEstadoPedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialEstadoPedido](
	[HistorialEstadoPedidoId] [int] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NOT NULL,
	[EstadoPedidoId] [int] NOT NULL,
	[FechaCambio] [datetime] NOT NULL,
	[Observaciones] [varchar](250) NULL,
	[UsuarioId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialEstadoPedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[HistorialEstadoRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialEstadoRecorte](
	[HistorialEstadoRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[RecorteId] [int] NOT NULL,
	[EstadoRecorteId] [int] NOT NULL,
	[FechaCambio] [datetime] NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialEstadoRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Insumo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Insumo](
	[InsumoId] [int] IDENTITY(1,1) NOT NULL,
	[Codigo] [varchar](30) NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Descripcion] [varchar](500) NULL,
	[TipoInsumoId] [int] NOT NULL,
	[ColorId] [int] NULL,
	[UnidadMedidaId] [int] NOT NULL,
	[StockMinimo] [decimal](18, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
	[MotivoInactivacionId] [int] NULL,
	[ObservacionInactivacion] [varchar](250) NULL,
	[FechaInactivacion] [datetime] NULL,
	[NombreInsumoId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InteresComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InteresComercial](
	[InteresComercialId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NULL,
	[ClienteNombre] [varchar](100) NULL,
	[ClienteApellido] [varchar](100) NULL,
	[Telefono] [varchar](30) NULL,
	[Email] [varchar](150) NULL,
	[CanalVentaId] [int] NOT NULL,
	[EstadoInteresComercialId] [int] NOT NULL,
	[TipoOrigen] [varchar](30) NOT NULL,
	[ReferenciaOrigen] [varchar](150) NULL,
	[CarritoId] [int] NULL,
	[Descripcion] [varchar](500) NOT NULL,
	[MontoPotencial] [decimal](18, 2) NOT NULL,
	[UsuarioResponsableId] [int] NULL,
	[OportunidadComercialId] [int] NULL,
	[FechaAlta] [datetime] NOT NULL,
	[FechaUltimaActividad] [datetime] NOT NULL,
	[FechaAtencion] [datetime] NULL,
	[FechaCierre] [datetime] NULL,
	[MotivoDescarte] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
	[MotivoConsultaId] [int] NULL,
	[TipoPendiente] [varchar](30) NULL,
	[ProductoConsultadoId] [int] NULL,
	[SolicitudPublicaId] [uniqueidentifier] NULL,
PRIMARY KEY CLUSTERED 
(
	[InteresComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InventarioAjusteLote] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventarioAjusteLote](
	[AjusteLoteId] [bigint] IDENTITY(1,1) NOT NULL,
	[OperacionId] [uniqueidentifier] NOT NULL,
	[UsuarioResponsable] [nvarchar](128) NOT NULL,
	[Motivo] [varchar](250) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[CantidadLineas] [int] NOT NULL,
 CONSTRAINT [PK_InventarioAjusteLote] PRIMARY KEY CLUSTERED 
(
	[AjusteLoteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InventarioAjusteLoteDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventarioAjusteLoteDetalle](
	[AjusteLoteDetalleId] [bigint] IDENTITY(1,1) NOT NULL,
	[AjusteLoteId] [bigint] NOT NULL,
	[Clase] [varchar](8) NOT NULL,
	[ArticuloId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[Signo] [smallint] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_InventarioAjusteLoteDetalle] PRIMARY KEY CLUSTERED 
(
	[AjusteLoteDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InventarioApertura] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventarioApertura](
	[AperturaId] [int] IDENTITY(1,1) NOT NULL,
	[OperacionId] [uniqueidentifier] NOT NULL,
	[UsuarioResponsable] [nvarchar](128) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[Observacion] [varchar](250) NOT NULL,
 CONSTRAINT [PK_InventarioApertura] PRIMARY KEY CLUSTERED 
(
	[AperturaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InventarioRecuento] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventarioRecuento](
	[RecuentoId] [bigint] IDENTITY(1,1) NOT NULL,
	[OperacionId] [uniqueidentifier] NOT NULL,
	[UsuarioResponsable] [nvarchar](128) NOT NULL,
	[Motivo] [varchar](250) NOT NULL,
	[FechaCaptura] [datetime2](0) NOT NULL,
	[FechaConfirmacion] [datetime2](0) NULL,
	[Estado] [varchar](12) NOT NULL,
 CONSTRAINT [PK_InventarioRecuento] PRIMARY KEY CLUSTERED 
(
	[RecuentoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[InventarioRecuentoDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventarioRecuentoDetalle](
	[RecuentoDetalleId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecuentoId] [bigint] NOT NULL,
	[Clase] [varchar](8) NOT NULL,
	[ArticuloId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CantidadSistema] [decimal](18, 2) NOT NULL,
	[CantidadContada] [decimal](18, 2) NOT NULL,
	[Diferencia]  AS ([CantidadContada]-[CantidadSistema]) PERSISTED,
 CONSTRAINT [PK_InventarioRecuentoDetalle] PRIMARY KEY CLUSTERED 
(
	[RecuentoDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ListaMateriales] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ListaMateriales](
	[ListaMaterialesId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Version] [varchar](20) NULL,
	[Activa] [bit] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ListaMaterialesId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ListaMaterialesRecortePrevisto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ListaMaterialesRecortePrevisto](
	[ListaMaterialesRecortePrevistoId] [int] IDENTITY(1,1) NOT NULL,
	[ListaMaterialesId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[TipoRecorteId] [int] NULL,
	[ColorId] [int] NULL,
	[Dimension] [decimal](18, 2) NULL,
	[UnidadMedidaId] [int] NOT NULL,
	[CantidadPorUnidad] [decimal](18, 4) NOT NULL,
	[Observaciones] [varchar](250) NULL,
 CONSTRAINT [PK_ListaMaterialesRecortePrevisto] PRIMARY KEY CLUSTERED 
(
	[ListaMaterialesRecortePrevistoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Localidad] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Localidad](
	[LocalidadId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](150) NOT NULL,
	[ProvinciaId] [int] NOT NULL,
	[CodigoPostal] [varchar](20) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LocalidadId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MedioCobro] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MedioCobro](
	[MedioCobroId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[RequiereReferencia] [bit] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MedioCobroId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Menu] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Menu](
	[MenuId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Ruta] [varchar](150) NULL,
	[Modulo] [varchar](50) NOT NULL,
	[OrdenVisual] [int] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MenuId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Moneda] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Moneda](
	[MonedaId] [int] IDENTITY(1,1) NOT NULL,
	[CodigoARCA] [varchar](3) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MonedaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MotivoConsultaComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MotivoConsultaComercial](
	[MotivoConsultaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[OrdenVisual] [int] NOT NULL,
	[Activo] [bit] NOT NULL,
 CONSTRAINT [PK_MotivoConsultaComercial] PRIMARY KEY CLUSTERED 
(
	[MotivoConsultaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MotivoInactivacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MotivoInactivacion](
	[MotivoInactivacionId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MotivoInactivacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MotivoInactivacionUsuario] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MotivoInactivacionUsuario](
	[MotivoInactivacionUsuarioId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MotivoInactivacionUsuarioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MotivoMovimientoStock] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MotivoMovimientoStock](
	[MotivoMovimientoStockId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](250) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MotivoMovimientoStockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MotivoPerdidaOportunidad] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MotivoPerdidaOportunidad](
	[MotivoPerdidaOportunidadId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MotivoPerdidaOportunidadId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MovimientoCuentaCorrienteCliente] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MovimientoCuentaCorrienteCliente](
	[MovimientoCuentaCorrienteClienteId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[TipoMovimientoCuentaCorrienteId] [int] NOT NULL,
	[FechaMovimiento] [datetime] NOT NULL,
	[PedidoId] [int] NULL,
	[ComprobanteId] [int] NULL,
	[CobroId] [int] NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MovimientoCuentaCorrienteClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MovimientoFinanciero] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MovimientoFinanciero](
	[MovimientoFinancieroId] [bigint] IDENTITY(1,1) NOT NULL,
	[FechaOperacion] [datetime2](0) NOT NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
	[Tipo] [varchar](10) NOT NULL,
	[Medio] [varchar](30) NOT NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Concepto] [nvarchar](250) NOT NULL,
	[Estado] [varchar](15) NOT NULL,
	[OrigenTipo] [varchar](30) NOT NULL,
	[OrigenId] [bigint] NOT NULL,
	[CanalVentaId] [int] NULL,
	[CuentaBancariaId] [int] NULL,
	[MedioCobroId] [int] NULL,
	[CobroId] [int] NULL,
	[ReferenciaExterna] [nvarchar](150) NULL,
	[UsuarioRegistroId] [int] NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_MovimientoFinanciero] PRIMARY KEY CLUSTERED 
(
	[MovimientoFinancieroId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MovimientoRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MovimientoRecorte](
	[MovimientoRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[RecorteId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[FechaMovimiento] [datetime] NOT NULL,
	[TipoMovimiento] [varchar](50) NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](250) NULL,
	[ConsumoRecorteProduccionId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MovimientoRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[MovimientoStock] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MovimientoStock](
	[MovimientoStockId] [int] IDENTITY(1,1) NOT NULL,
	[FechaMovimiento] [datetime] NOT NULL,
	[TipoMovimientoStockId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[ProductoId] [int] NULL,
	[InsumoId] [int] NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[Motivo] [varchar](250) NULL,
	[EntidadOrigen] [varchar](50) NULL,
	[OrigenId] [int] NULL,
	[Activo] [bit] NOT NULL,
	[FechaAnulacion] [datetime] NULL,
	[MotivoAnulacion] [varchar](250) NULL,
	[ObservacionAnulacion] [varchar](250) NULL,
	[MovimientoStockIdReversaDe] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MovimientoStockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[NombreInsumoCatalogo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NombreInsumoCatalogo](
	[NombreInsumoId] [int] IDENTITY(1,1) NOT NULL,
	[TipoInsumoId] [int] NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Activo] [bit] NOT NULL,
 CONSTRAINT [PK_NombreInsumoCatalogo] PRIMARY KEY CLUSTERED 
(
	[NombreInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[NombreProductoCatalogo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NombreProductoCatalogo](
	[NombreProductoId] [int] IDENTITY(1,1) NOT NULL,
	[TipoProductoId] [int] NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Activo] [bit] NOT NULL,
 CONSTRAINT [PK_NombreProductoCatalogo] PRIMARY KEY CLUSTERED 
(
	[NombreProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[NotaCreditoProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NotaCreditoProveedor](
	[NotaCreditoProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[FacturaProveedorId] [int] NOT NULL,
	[NumeroNota] [varchar](50) NOT NULL,
	[FechaEmision] [date] NOT NULL,
	[Importe] [decimal](18, 2) NOT NULL,
	[Motivo] [nvarchar](300) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_NotaCreditoProveedor] PRIMARY KEY CLUSTERED 
(
	[NotaCreditoProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OfertaProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OfertaProveedor](
	[OfertaProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[SolicitudCotizacionId] [int] NOT NULL,
	[ProveedorId] [int] NOT NULL,
	[FechaOferta] [date] NOT NULL,
	[VigenciaHasta] [date] NULL,
	[Estado] [varchar](20) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_OfertaProveedor] PRIMARY KEY CLUSTERED 
(
	[OfertaProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OfertaProveedorDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OfertaProveedorDetalle](
	[OfertaProveedorDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[OfertaProveedorId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioUnitario] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_OfertaProveedorDetalle] PRIMARY KEY CLUSTERED 
(
	[OfertaProveedorDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OportunidadComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OportunidadComercial](
	[OportunidadComercialId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NULL,
	[ClienteNombre] [varchar](100) NOT NULL,
	[ClienteApellido] [varchar](100) NULL,
	[TipoCliente] [varchar](20) NOT NULL,
	[CanalVentaId] [int] NOT NULL,
	[Interes] [varchar](150) NOT NULL,
	[EstadoOportunidadComercialId] [int] NOT NULL,
	[MontoEstimado] [decimal](18, 2) NOT NULL,
	[Probabilidad] [int] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
	[ProximaAccion] [varchar](250) NULL,
	[FechaProximaAccion] [date] NULL,
	[Observaciones] [varchar](500) NULL,
	[MotivoPerdidaOportunidadId] [int] NULL,
	[ObservacionPerdida] [varchar](500) NULL,
	[FechaPerdida] [datetime] NULL,
	[PedidoIdConvertido] [int] NULL,
	[FechaConversion] [datetime] NULL,
	[Activo] [bit] NOT NULL,
	[UsuarioResponsableId] [int] NULL,
	[InteresComercialId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[OportunidadComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OportunidadProducto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OportunidadProducto](
	[OportunidadProductoId] [int] IDENTITY(1,1) NOT NULL,
	[OportunidadComercialId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioReferencia] [decimal](18, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[OportunidadProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenPagoProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenPagoProveedor](
	[OrdenPagoProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[ProveedorId] [int] NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[MedioPago] [nvarchar](80) NULL,
	[Referencia] [nvarchar](120) NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaConfirmacion] [datetime2](0) NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_OrdenPagoProveedor] PRIMARY KEY CLUSTERED 
(
	[OrdenPagoProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenPagoProveedorAplicacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenPagoProveedorAplicacion](
	[OrdenPagoProveedorAplicacionId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenPagoProveedorId] [int] NOT NULL,
	[FacturaProveedorId] [int] NOT NULL,
	[ImporteAplicado] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_OrdenPagoAplicacion] PRIMARY KEY CLUSTERED 
(
	[OrdenPagoProveedorAplicacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenProduccion](
	[OrdenProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[ListaMaterialesId] [int] NULL,
	[TipoProduccionId] [int] NOT NULL,
	[EstadoOrdenProduccionId] [int] NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
	[FechaInicio] [datetime] NULL,
	[FechaFin] [datetime] NULL,
	[CantidadPlanificada] [decimal](18, 2) NOT NULL,
	[CantidadProducida] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[RecorteProductoSugeridoId] [int] NULL,
	[PlantillaFabricacionId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[OrdenProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenProduccionBOMSnapshot] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenProduccionBOMSnapshot](
	[OrdenProduccionBOMSnapshotId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionDetalleId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[CantidadPorUnidad] [decimal](18, 4) NOT NULL,
 CONSTRAINT [PK_OPBOMSnapshot] PRIMARY KEY CLUSTERED 
(
	[OrdenProduccionBOMSnapshotId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenProduccionDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenProduccionDetalle](
	[OrdenProduccionDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[ListaMaterialesId] [int] NULL,
	[CantidadPlanificada] [decimal](18, 2) NOT NULL,
	[ProductoCircularId] [int] NULL,
 CONSTRAINT [PK_OrdenProduccionDetalle] PRIMARY KEY CLUSTERED 
(
	[OrdenProduccionDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenProduccionRecortePlan] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenProduccionRecortePlan](
	[OrdenProduccionId] [int] NOT NULL,
	[RecorteId] [int] NOT NULL,
	[CantidadPlanificada] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_TEKA_OPRecortePlan] PRIMARY KEY CLUSTERED 
(
	[OrdenProduccionId] ASC,
	[RecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[OrdenProduccionRecortePrevistoSnapshot] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot](
	[OrdenProduccionRecortePrevistoSnapshotId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionDetalleId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[TipoRecorteId] [int] NULL,
	[ColorId] [int] NULL,
	[Dimension] [decimal](18, 2) NULL,
	[UnidadMedidaId] [int] NOT NULL,
	[CantidadPorUnidad] [decimal](18, 4) NOT NULL,
	[CantidadTotal] [decimal](18, 4) NOT NULL,
	[Observaciones] [varchar](250) NULL,
 CONSTRAINT [PK_OPRecortePrevistoSnapshot] PRIMARY KEY CLUSTERED 
(
	[OrdenProduccionRecortePrevistoSnapshotId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ParametroCostoPrecio] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ParametroCostoPrecio](
	[ParametroCostoPrecioId] [int] IDENTITY(1,1) NOT NULL,
	[TipoProductoId] [int] NULL,
	[PorcentajeManoObra] [decimal](7, 2) NOT NULL,
	[PorcentajeCostosFijos] [decimal](7, 2) NOT NULL,
	[PorcentajeOtrosVariables] [decimal](7, 2) NOT NULL,
	[PorcentajeMargen] [decimal](5, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaModificacion] [datetime2](3) NOT NULL,
	[UsuarioModificacionId] [int] NOT NULL,
 CONSTRAINT [PK_ParametroCostoPrecio] PRIMARY KEY CLUSTERED 
(
	[ParametroCostoPrecioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ParametroCostoPrecioAuditoria] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ParametroCostoPrecioAuditoria](
	[ParametroCostoPrecioAuditoriaId] [bigint] IDENTITY(1,1) NOT NULL,
	[ParametroCostoPrecioId] [int] NOT NULL,
	[TipoProductoId] [int] NULL,
	[PorcentajeManoObra] [decimal](7, 2) NOT NULL,
	[PorcentajeCostosFijos] [decimal](7, 2) NOT NULL,
	[PorcentajeOtrosVariables] [decimal](7, 2) NOT NULL,
	[PorcentajeMargen] [decimal](5, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[Accion] [varchar](12) NOT NULL,
	[FechaCambio] [datetime2](3) NOT NULL,
	[UsuarioId] [int] NOT NULL,
 CONSTRAINT [PK_ParametroCostoPrecioAuditoria] PRIMARY KEY CLUSTERED 
(
	[ParametroCostoPrecioAuditoriaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Pedido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Pedido](
	[PedidoId] [int] IDENTITY(1,1) NOT NULL,
	[FechaPedido] [datetime] NOT NULL,
	[ClienteId] [int] NOT NULL,
	[CanalVentaId] [int] NOT NULL,
	[EstadoPedidoId] [int] NOT NULL,
	[Total] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[PedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Permiso] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permiso](
	[PermisoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PermisoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaFabricacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaFabricacion](
	[PlantillaFabricacionId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[ListaMaterialesId] [int] NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Version] [varchar](20) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[UnidadesPorLote] [int] NOT NULL,
	[AnchoProductoMm] [decimal](12, 2) NULL,
	[AltoProductoMm] [decimal](12, 2) NULL,
	[ProfundidadProductoMm] [decimal](12, 2) NULL,
	[Observaciones] [varchar](500) NULL,
	[FechaCreacion] [datetime2](0) NOT NULL,
	[FechaAprobacion] [datetime2](0) NULL,
 CONSTRAINT [PK_PlantillaFabricacion] PRIMARY KEY CLUSTERED 
(
	[PlantillaFabricacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaFabricacionCortePieza] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaFabricacionCortePieza](
	[PlantillaFabricacionCortePiezaId] [int] IDENTITY(1,1) NOT NULL,
	[PlantillaFabricacionPlanCorteId] [int] NOT NULL,
	[PlantillaFabricacionPiezaId] [int] NOT NULL,
	[NumeroPlaca] [int] NOT NULL,
	[PosicionXmm] [decimal](12, 2) NOT NULL,
	[PosicionYmm] [decimal](12, 2) NOT NULL,
	[Rotada] [bit] NOT NULL,
 CONSTRAINT [PK_PlantillaFabricacionCortePieza] PRIMARY KEY CLUSTERED 
(
	[PlantillaFabricacionCortePiezaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaFabricacionPieza] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaFabricacionPieza](
	[PlantillaFabricacionPiezaId] [int] IDENTITY(1,1) NOT NULL,
	[PlantillaFabricacionId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[NombrePieza] [varchar](120) NOT NULL,
	[CantidadPorUnidad] [int] NOT NULL,
	[LargoMm] [decimal](12, 2) NOT NULL,
	[AnchoMm] [decimal](12, 2) NOT NULL,
	[EspesorMm] [decimal](8, 2) NOT NULL,
	[CantosTerminados] [varchar](120) NULL,
	[OrientacionVeta] [varchar](20) NOT NULL,
	[Observaciones] [varchar](250) NULL,
 CONSTRAINT [PK_PlantillaFabricacionPieza] PRIMARY KEY CLUSTERED 
(
	[PlantillaFabricacionPiezaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaFabricacionPlanCorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaFabricacionPlanCorte](
	[PlantillaFabricacionPlanCorteId] [int] IDENTITY(1,1) NOT NULL,
	[PlantillaFabricacionId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[LargoPlacaMm] [decimal](12, 2) NOT NULL,
	[AnchoPlacaMm] [decimal](12, 2) NOT NULL,
	[EspesorPlacaMm] [decimal](8, 2) NOT NULL,
	[AnchoSierraMm] [decimal](8, 2) NOT NULL,
	[CantidadPlacasPorLote] [int] NOT NULL,
	[Observaciones] [varchar](500) NULL,
 CONSTRAINT [PK_PlantillaFabricacionPlanCorte] PRIMARY KEY CLUSTERED 
(
	[PlantillaFabricacionPlanCorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaFabricacionRecortePrevisto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaFabricacionRecortePrevisto](
	[PlantillaFabricacionRecortePrevistoId] [int] IDENTITY(1,1) NOT NULL,
	[PlantillaFabricacionPlanCorteId] [int] NOT NULL,
	[NumeroPlaca] [int] NOT NULL,
	[LargoMm] [decimal](12, 2) NOT NULL,
	[AnchoMm] [decimal](12, 2) NOT NULL,
	[Cantidad] [int] NOT NULL,
	[PosicionXmm] [decimal](12, 2) NULL,
	[PosicionYmm] [decimal](12, 2) NULL,
	[Recuperable] [bit] NOT NULL,
	[Observaciones] [varchar](250) NULL,
 CONSTRAINT [PK_PlantillaFabricacionRecortePrevisto] PRIMARY KEY CLUSTERED 
(
	[PlantillaFabricacionRecortePrevistoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaOrdenProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaOrdenProduccion](
	[PlantillaOrdenProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[Activa] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_PlantillaOrdenProduccion] PRIMARY KEY CLUSTERED 
(
	[PlantillaOrdenProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PlantillaOrdenProduccionDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlantillaOrdenProduccionDetalle](
	[PlantillaOrdenProduccionDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[PlantillaOrdenProduccionId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_PlantillaOrdenProduccionDetalle] PRIMARY KEY CLUSTERED 
(
	[PlantillaOrdenProduccionDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PrecioVenta] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioVenta](
	[PrecioVentaId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[FechaVigenciaDesde] [datetime] NOT NULL,
	[FechaVigenciaHasta] [datetime] NULL,
	[Precio] [decimal](18, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[UsuarioRegistroId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[PrecioVentaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PrecioVentaCalculo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioVentaCalculo](
	[PrecioVentaCalculoId] [int] IDENTITY(1,1) NOT NULL,
	[PrecioVentaId] [int] NOT NULL,
	[OrigenCostoMateriales] [varchar](40) NOT NULL,
	[ListaMaterialesId] [int] NULL,
	[CostoMateriales] [decimal](18, 2) NOT NULL,
	[PorcentajeManoObra] [decimal](7, 2) NOT NULL,
	[CostoManoObra] [decimal](18, 2) NOT NULL,
	[PorcentajeCostosFijos] [decimal](7, 2) NOT NULL,
	[CostoCostosFijos] [decimal](18, 2) NOT NULL,
	[PorcentajeOtrosVariables] [decimal](7, 2) NOT NULL,
	[CostoOtrosVariables] [decimal](18, 2) NOT NULL,
	[CostoTotal] [decimal](18, 2) NOT NULL,
	[PorcentajeMargen] [decimal](5, 2) NOT NULL,
	[PrecioSugerido] [decimal](18, 2) NOT NULL,
	[PrecioFinalRegistrado] [decimal](18, 2) NOT NULL,
	[MargenEfectivo] [decimal](7, 2) NOT NULL,
	[FechaCalculo] [datetime2](3) NOT NULL,
	[UsuarioId] [int] NOT NULL,
 CONSTRAINT [PK_PrecioVentaCalculo] PRIMARY KEY CLUSTERED 
(
	[PrecioVentaCalculoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PrecioVentaCalculoInsumo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioVentaCalculoInsumo](
	[PrecioVentaCalculoInsumoId] [int] IDENTITY(1,1) NOT NULL,
	[PrecioVentaCalculoId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[CodigoInsumo] [varchar](120) NOT NULL,
	[NombreInsumo] [nvarchar](250) NOT NULL,
	[Unidad] [varchar](30) NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[CostoUnitario] [decimal](18, 2) NOT NULL,
	[Subtotal] [decimal](18, 2) NOT NULL,
	[CompraProveedorId] [int] NULL,
	[FechaCompra] [datetime2](7) NULL,
 CONSTRAINT [PK_PrecioVentaCalculoInsumo] PRIMARY KEY CLUSTERED 
(
	[PrecioVentaCalculoInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PrecioVentaCorreccionAuditoria] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioVentaCorreccionAuditoria](
	[PrecioVentaCorreccionId] [int] IDENTITY(1,1) NOT NULL,
	[PrecioVentaId] [int] NOT NULL,
	[ImporteAnterior] [decimal](18, 2) NOT NULL,
	[ImporteNuevo] [decimal](18, 2) NOT NULL,
	[Motivo] [nvarchar](500) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaCorreccion] [datetime2](3) NOT NULL,
 CONSTRAINT [PK_PrecioVentaCorreccionAuditoria] PRIMARY KEY CLUSTERED 
(
	[PrecioVentaCorreccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PresupuestoComercial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PresupuestoComercial](
	[PresupuestoComercialId] [int] IDENTITY(1,1) NOT NULL,
	[OportunidadComercialId] [int] NULL,
	[ClienteId] [int] NOT NULL,
	[Numero] [varchar](30) NULL,
	[Estado] [varchar](20) NOT NULL,
	[FechaEmision] [datetime2](0) NOT NULL,
	[FechaVencimiento] [date] NOT NULL,
	[FechaEnvio] [datetime2](0) NULL,
	[FechaRespuesta] [datetime2](0) NULL,
	[FechaConversion] [datetime2](0) NULL,
	[PedidoId] [int] NULL,
	[Observaciones] [nvarchar](1000) NULL,
	[MotivoRechazo] [nvarchar](500) NULL,
	[UsuarioResponsableId] [int] NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PresupuestoComercialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PresupuestoComercialDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PresupuestoComercialDetalle](
	[PresupuestoComercialDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[PresupuestoComercialId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[PrecioUnitario] [decimal](18, 2) NOT NULL,
	[DescuentoPorcentaje] [decimal](5, 2) NOT NULL,
	[Observaciones] [nvarchar](300) NULL,
PRIMARY KEY CLUSTERED 
(
	[PresupuestoComercialDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PresupuestoComercialHistorial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PresupuestoComercialHistorial](
	[PresupuestoComercialHistorialId] [int] IDENTITY(1,1) NOT NULL,
	[PresupuestoComercialId] [int] NOT NULL,
	[EstadoAnterior] [varchar](20) NULL,
	[EstadoNuevo] [varchar](20) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[UsuarioId] [int] NULL,
	[Observaciones] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[PresupuestoComercialHistorialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Producto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Producto](
	[ProductoId] [int] IDENTITY(1,1) NOT NULL,
	[Codigo] [varchar](30) NOT NULL,
	[Nombre] [varchar](120) NOT NULL,
	[Descripcion] [varchar](500) NULL,
	[TipoProductoId] [int] NOT NULL,
	[ColorId] [int] NULL,
	[UnidadMedidaId] [int] NOT NULL,
	[StockMinimo] [decimal](18, 2) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
	[MotivoInactivacionId] [int] NULL,
	[ObservacionInactivacion] [varchar](250) NULL,
	[FechaInactivacion] [datetime] NULL,
	[NombreProductoId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoCircular] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoCircular](
	[ProductoCircularId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[RecorteProductoSugeridoId] [int] NOT NULL,
	[ProductoModeloReferenciaId] [int] NOT NULL,
	[FechaAprobacion] [datetime2](0) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[Observaciones] [varchar](500) NULL,
 CONSTRAINT [PK_TEKA_ProductoCircular] PRIMARY KEY CLUSTERED 
(
	[ProductoCircularId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoDisponibilidadOnline] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoDisponibilidadOnline](
	[ProductoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CupoOnline] [decimal](18, 2) NOT NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoFichaTecnica] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoFichaTecnica](
	[ProductoId] [int] NOT NULL,
	[AnchoCm] [decimal](10, 2) NOT NULL,
	[AltoCm] [decimal](10, 2) NOT NULL,
	[ProfundidadCm] [decimal](10, 2) NOT NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoImagen] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoImagen](
	[ProductoImagenId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[UrlArchivo] [nvarchar](2048) NOT NULL,
	[TextoAlternativo] [nvarchar](250) NULL,
	[EsPrincipal] [bit] NOT NULL,
	[OrdenVisual] [int] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoImagenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoModelo3D] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoModelo3D](
	[ProductoId] [int] NOT NULL,
	[UrlGlb] [nvarchar](2048) NULL,
	[UrlUsdz] [nvarchar](2048) NULL,
	[EscalaValidada] [bit] NOT NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ProductoPublicacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductoPublicacion](
	[ProductoId] [int] NOT NULL,
	[Publicado] [bit] NOT NULL,
	[Destacado] [bit] NOT NULL,
	[OrdenVisual] [int] NOT NULL,
	[DescripcionComercial] [nvarchar](2000) NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[PropuestaFichaTecnicaFabricacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PropuestaFichaTecnicaFabricacion](
	[ProductoId] [int] NOT NULL,
	[AnchoCm] [decimal](10, 2) NOT NULL,
	[AltoCm] [decimal](10, 2) NOT NULL,
	[ProfundidadCm] [decimal](10, 2) NOT NULL,
	[Origen] [varchar](100) NOT NULL,
	[Estado] [varchar](25) NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[FechaActualizacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Proveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Proveedor](
	[ProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[RazonSocial] [nvarchar](180) NOT NULL,
	[CUIT] [varchar](13) NULL,
	[Email] [nvarchar](160) NULL,
	[Telefono] [nvarchar](60) NULL,
	[Direccion] [nvarchar](250) NULL,
	[Observaciones] [nvarchar](500) NULL,
	[Activo] [bit] NOT NULL,
	[FechaAlta] [datetime2](0) NOT NULL,
 CONSTRAINT [PK_Proveedor] PRIMARY KEY CLUSTERED 
(
	[ProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Provincia] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Provincia](
	[ProvinciaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProvinciaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Recorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Recorte](
	[RecorteId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NULL,
	[InsumoId] [int] NOT NULL,
	[TipoRecorteId] [int] NULL,
	[EstadoRecorteId] [int] NOT NULL,
	[ColorId] [int] NULL,
	[Dimension] [decimal](18, 2) NULL,
	[UnidadMedidaId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](500) NULL,
	[FechaAlta] [datetime] NOT NULL,
	[LargoMm] [decimal](12, 2) NULL,
	[AnchoMm] [decimal](12, 2) NULL,
	[EspesorMm] [decimal](8, 2) NULL,
	[OrientacionVeta] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[RecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDiseno] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDiseno](
	[RecorteDisenoId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteGeneracionId] [bigint] NOT NULL,
	[OrdenEnGeneracion] [int] NOT NULL,
	[FamiliaUid] [uniqueidentifier] NOT NULL,
	[VersionNumero] [int] NOT NULL,
	[VersionAnteriorId] [bigint] NULL,
	[Nombre] [nvarchar](160) NOT NULL,
	[Descripcion] [nvarchar](1500) NOT NULL,
	[TipoProductoId] [int] NULL,
	[MaterialInsumoId] [int] NULL,
	[ColorId] [int] NULL,
	[AcabadoDeclarado] [nvarchar](120) NULL,
	[LargoExteriorMm] [decimal](12, 2) NOT NULL,
	[AnchoExteriorMm] [decimal](12, 2) NOT NULL,
	[AltoExteriorMm] [decimal](12, 2) NOT NULL,
	[CantidadSugerida] [int] NOT NULL,
	[EstadoRevision] [varchar](24) NOT NULL,
	[ContenidoHash] [binary](32) NOT NULL,
	[FechaCreacion] [datetime2](3) NOT NULL,
	[UsuarioDecisionId] [int] NULL,
	[FechaDecision] [datetime2](3) NULL,
	[MotivoDecision] [nvarchar](500) NULL,
 CONSTRAINT [PK_RecorteDiseno] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoAsignacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoAsignacion](
	[RecorteDisenoAsignacionId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[RecorteDisenoPiezaId] [bigint] NOT NULL,
	[RecorteId] [int] NOT NULL,
	[CantidadPiezas] [int] NOT NULL,
	[PosicionXmm] [decimal](12, 2) NOT NULL,
	[PosicionYmm] [decimal](12, 2) NOT NULL,
	[LargoCorteMm] [decimal](12, 2) NOT NULL,
	[AnchoCorteMm] [decimal](12, 2) NOT NULL,
	[Giro90] [bit] NOT NULL,
	[AnchoSierraMm] [decimal](8, 2) NULL,
	[MargenSeguridadMm] [decimal](8, 2) NULL,
	[ToleranciaMm] [decimal](8, 2) NULL,
 CONSTRAINT [PK_RecorteDisenoAsignacion] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoAsignacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoCosto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoCosto](
	[RecorteDisenoCostoId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[Tipo] [varchar](24) NOT NULL,
	[InsumoId] [int] NULL,
	[Cantidad] [decimal](18, 4) NOT NULL,
	[CostoUnitario] [decimal](18, 2) NULL,
	[Subtotal] [decimal](18, 2) NULL,
	[Fuente] [varchar](80) NULL,
	[ReferenciaFuente] [varchar](120) NULL,
	[FechaFuente] [datetime2](3) NULL,
	[MotivoIncompleto] [nvarchar](250) NULL,
 CONSTRAINT [PK_RecorteDisenoCosto] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoCostoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoHistorial] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoHistorial](
	[RecorteDisenoHistorialId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[EstadoAnterior] [varchar](24) NULL,
	[EstadoNuevo] [varchar](24) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[Fecha] [datetime2](3) NOT NULL,
	[Motivo] [nvarchar](500) NULL,
 CONSTRAINT [PK_RecorteDisenoHistorial] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoHistorialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoImagen] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoImagen](
	[RecorteDisenoImagenId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[Referencia] [nvarchar](500) NOT NULL,
	[Tipo] [varchar](30) NOT NULL,
	[Origen] [varchar](40) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[FechaAlta] [datetime2](3) NOT NULL,
 CONSTRAINT [PK_RecorteDisenoImagen] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoImagenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoInsumo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoInsumo](
	[RecorteDisenoInsumoId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 4) NOT NULL,
	[Observaciones] [nvarchar](250) NULL,
 CONSTRAINT [PK_RecorteDisenoInsumo] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoPieza] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoPieza](
	[RecorteDisenoPiezaId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[OrdenPieza] [int] NOT NULL,
	[Nombre] [nvarchar](120) NOT NULL,
	[Origen] [varchar](18) NOT NULL,
	[InsumoId] [int] NOT NULL,
	[ColorId] [int] NULL,
	[Cantidad] [int] NOT NULL,
	[LargoMm] [decimal](12, 2) NOT NULL,
	[AnchoMm] [decimal](12, 2) NOT NULL,
	[EspesorMm] [decimal](8, 2) NOT NULL,
	[OrientacionVeta] [varchar](20) NOT NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_RecorteDisenoPieza] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoPiezaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoValidacion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoValidacion](
	[RecorteDisenoValidacionId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoId] [bigint] NOT NULL,
	[Resultado] [varchar](24) NOT NULL,
	[ContenidoHash] [binary](32) NOT NULL,
	[FechaValidacion] [datetime2](3) NOT NULL,
	[ValidadorVersion] [varchar](60) NULL,
	[Detalle] [nvarchar](1000) NULL,
	[DiagnosticoPreliminar] [varchar](24) NULL,
	[ReglasAplicadasJson] [nvarchar](max) NULL,
 CONSTRAINT [PK_RecorteDisenoValidacion] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoValidacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteDisenoValidacionMotivo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteDisenoValidacionMotivo](
	[RecorteDisenoValidacionMotivoId] [bigint] IDENTITY(1,1) NOT NULL,
	[RecorteDisenoValidacionId] [bigint] NOT NULL,
	[Codigo] [varchar](60) NOT NULL,
	[Detalle] [nvarchar](500) NOT NULL,
	[Severidad] [varchar](16) NULL,
	[OrdenPieza] [int] NULL,
	[RecorteId] [int] NULL,
 CONSTRAINT [PK_RecorteValidacionMotivo] PRIMARY KEY CLUSTERED 
(
	[RecorteDisenoValidacionMotivoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteGeneracion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteGeneracion](
	[RecorteGeneracionId] [bigint] IDENTITY(1,1) NOT NULL,
	[SolicitudUid] [uniqueidentifier] NOT NULL,
	[ContenidoHash] [binary](32) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[FechaGeneracion] [datetime2](3) NOT NULL,
	[Estado] [varchar](24) NOT NULL,
	[CantidadRecibidas] [int] NOT NULL,
	[CantidadTecnicasValidas] [int] NOT NULL,
	[ErrorCodigo] [varchar](80) NULL,
	[ErrorDetalle] [nvarchar](1000) NULL,
	[ResultadoHash] [binary](32) NULL,
 CONSTRAINT [PK_RecorteGeneracion] PRIMARY KEY CLUSTERED 
(
	[RecorteGeneracionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteGeneracionInventario] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteGeneracionInventario](
	[RecorteGeneracionId] [bigint] NOT NULL,
	[RecorteId] [int] NOT NULL,
	[EstadoRecorteId] [int] NOT NULL,
	[CantidadDisponible] [decimal](18, 2) NOT NULL,
	[LargoMm] [decimal](12, 2) NULL,
	[AnchoMm] [decimal](12, 2) NULL,
	[EspesorMm] [decimal](8, 2) NULL,
	[InsumoId] [int] NOT NULL,
	[ColorId] [int] NULL,
	[OrientacionVeta] [varchar](20) NULL,
	[FechaSnapshot] [datetime2](3) NOT NULL,
	[DepositoId] [int] NULL,
	[UnidadMedidaId] [int] NULL,
	[CantidadRegistrada] [decimal](18, 2) NULL,
	[TipoInsumoId] [int] NULL,
	[InsumoColorId] [int] NULL,
	[EstadoNombre] [varchar](50) NULL,
	[UnidadNombre] [varchar](80) NULL,
	[TipoInsumoNombre] [varchar](80) NULL,
 CONSTRAINT [PK_RecorteGeneracionInventario] PRIMARY KEY CLUSTERED 
(
	[RecorteGeneracionId] ASC,
	[RecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecorteProductoSugerido] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecorteProductoSugerido](
	[RecorteProductoSugeridoId] [int] IDENTITY(1,1) NOT NULL,
	[SugerenciaRecorteId] [int] NOT NULL,
	[RecorteId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[PuntajeCompatibilidad] [decimal](5, 2) NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[RecorteProductoSugeridoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RecuperacionPassword] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RecuperacionPassword](
	[RecuperacionPasswordId] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[TokenRecuperacion] [varchar](200) NOT NULL,
	[FechaSolicitud] [datetime] NOT NULL,
	[FechaExpiracion] [datetime] NOT NULL,
	[Utilizado] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RecuperacionPasswordId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RegistroPendienteEcommerce] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RegistroPendienteEcommerce](
	[RegistroPendienteEcommerceId] [bigint] IDENTITY(1,1) NOT NULL,
	[EmailNormalizado] [nvarchar](150) NOT NULL,
	[DatosJson] [nvarchar](max) NOT NULL,
	[PasswordHash] [nvarchar](500) NOT NULL,
	[TokenHash] [varbinary](32) NOT NULL,
	[FechaExpiracion] [datetime2](0) NOT NULL,
	[FechaUtilizacion] [datetime2](0) NULL,
	[FechaCreacion] [datetime2](0) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RegistroPendienteEcommerceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Remito] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Remito](
	[RemitoId] [int] IDENTITY(1,1) NOT NULL,
	[PedidoId] [int] NOT NULL,
	[ClienteId] [int] NOT NULL,
	[FechaRemito] [datetime] NOT NULL,
	[NumeroRemito] [varchar](30) NULL,
	[DomicilioEntrega] [varchar](200) NULL,
	[Entregado] [bit] NOT NULL,
	[FechaEntrega] [datetime] NULL,
	[Observaciones] [varchar](500) NULL,
	[Anulado] [bit] NOT NULL,
	[MotivoAnulacion] [varchar](250) NULL,
	[FechaAnulacion] [datetime2](0) NULL,
	[FechaModificacion] [datetime2](0) NULL,
	[UsuarioAnulacion] [varchar](120) NULL,
PRIMARY KEY CLUSTERED 
(
	[RemitoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RemitoRecepcionProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RemitoRecepcionProveedor](
	[RemitoRecepcionProveedorId] [int] IDENTITY(1,1) NOT NULL,
	[CompraProveedorId] [int] NOT NULL,
	[NumeroRemito] [varchar](40) NULL,
	[FechaRemito] [date] NOT NULL,
	[FechaRegistro] [datetime2](0) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[FechaConfirmacion] [datetime2](0) NULL,
	[UsuarioRegistroId] [int] NOT NULL,
	[UsuarioConfirmacionId] [int] NULL,
	[Observaciones] [nvarchar](500) NULL,
 CONSTRAINT [PK_RemitoRecepcionProveedor] PRIMARY KEY CLUSTERED 
(
	[RemitoRecepcionProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RemitoRecepcionProveedorDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RemitoRecepcionProveedorDetalle](
	[RemitoRecepcionProveedorDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[RemitoRecepcionProveedorId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[CantidadRecibida] [decimal](18, 2) NOT NULL,
	[CantidadDiferencia] [decimal](18, 2) NULL,
	[ObservacionDiferencia] [nvarchar](300) NULL,
 CONSTRAINT [PK_RemitoRecepcionProveedorDetalle] PRIMARY KEY CLUSTERED 
(
	[RemitoRecepcionProveedorDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[ResultadoProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ResultadoProduccion](
	[ResultadoProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[OrdenProduccionId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[FechaResultado] [datetime] NOT NULL,
	[CantidadIngresada] [decimal](18, 2) NOT NULL,
	[Observaciones] [varchar](250) NULL,
PRIMARY KEY CLUSTERED 
(
	[ResultadoProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Rol] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rol](
	[RolId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[RolPermiso] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RolPermiso](
	[RolPermisoId] [int] IDENTITY(1,1) NOT NULL,
	[RolId] [int] NOT NULL,
	[PermisoId] [int] NOT NULL,
	[MenuId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RolPermisoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[SolicitudCotizacionDetalle] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SolicitudCotizacionDetalle](
	[SolicitudCotizacionDetalleId] [int] IDENTITY(1,1) NOT NULL,
	[SolicitudCotizacionId] [int] NOT NULL,
	[InsumoId] [int] NOT NULL,
	[Cantidad] [decimal](18, 2) NOT NULL,
 CONSTRAINT [PK_SolicitudCotizacionDetalle] PRIMARY KEY CLUSTERED 
(
	[SolicitudCotizacionDetalleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[SolicitudCotizacionProveedor] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SolicitudCotizacionProveedor](
	[SolicitudCotizacionId] [int] IDENTITY(1,1) NOT NULL,
	[Fecha] [datetime2](0) NOT NULL,
	[Descripcion] [nvarchar](500) NOT NULL,
	[Estado] [varchar](20) NOT NULL,
	[UsuarioId] [int] NOT NULL,
 CONSTRAINT [PK_SolicitudCotizacionProveedor] PRIMARY KEY CLUSTERED 
(
	[SolicitudCotizacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[StockInsumo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StockInsumo](
	[StockInsumoId] [int] IDENTITY(1,1) NOT NULL,
	[InsumoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CantidadActual] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[StockInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[StockProducto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StockProducto](
	[StockProductoId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CantidadActual] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[StockProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[StockRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StockRecorte](
	[StockRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[RecorteId] [int] NOT NULL,
	[DepositoId] [int] NOT NULL,
	[CantidadActual] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[StockRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[SugerenciaRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SugerenciaRecorte](
	[SugerenciaRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[FechaSugerencia] [datetime] NOT NULL,
	[Observaciones] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[SugerenciaRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoComprobante] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoComprobante](
	[TipoComprobanteId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[AfectaStock] [bit] NOT NULL,
	[AfectaCaja] [bit] NOT NULL,
	[Activo] [bit] NOT NULL,
	[CodigoARCA] [int] NULL,
	[Letra] [varchar](1) NULL,
	[EsNotaCredito] [bit] NOT NULL,
	[EsNotaDebito] [bit] NOT NULL,
	[RequiereAsociado] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoComprobanteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoDocumento] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoDocumento](
	[TipoDocumentoId] [int] IDENTITY(1,1) NOT NULL,
	[CodigoARCA] [int] NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoDocumentoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoDomicilio] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoDomicilio](
	[TipoDomicilioId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](30) NOT NULL,
	[NombreClave]  AS (upper(replace(replace(replace(replace(replace(ltrim(rtrim(replace(replace([Nombre],char((9)),' '),char((160)),' '))),'  ',' '),'  ',' '),'  ',' '),'  ',' '),'  ',' '))) PERSISTED,
	[Activo] [bit] NOT NULL,
 CONSTRAINT [PK_TipoDomicilio] PRIMARY KEY CLUSTERED 
(
	[TipoDomicilioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoInsumo] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoInsumo](
	[TipoInsumoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoMovimientoCuentaCorriente] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoMovimientoCuentaCorriente](
	[TipoMovimientoCuentaCorrienteId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Signo] [smallint] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoMovimientoCuentaCorrienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoMovimientoStock] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoMovimientoStock](
	[TipoMovimientoStockId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Signo] [smallint] NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoMovimientoStockId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoProduccion] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoProduccion](
	[TipoProduccionId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoProducto] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoProducto](
	[TipoProductoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Descripcion] [varchar](250) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TipoRecorte] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TipoRecorte](
	[TipoRecorteId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TipoRecorteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[TokenRecuperacionClienteEcommerce] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TokenRecuperacionClienteEcommerce](
	[TokenRecuperacionClienteEcommerceId] [bigint] IDENTITY(1,1) NOT NULL,
	[CuentaClienteEcommerceId] [int] NOT NULL,
	[TokenHash] [varbinary](32) NOT NULL,
	[FechaCreacion] [datetime2](0) NOT NULL,
	[FechaExpiracion] [datetime2](0) NOT NULL,
	[FechaUtilizacion] [datetime2](0) NULL,
 CONSTRAINT [PK_TokenRecuperacionCliente] PRIMARY KEY CLUSTERED 
(
	[TokenRecuperacionClienteEcommerceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[UnidadMedida] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UnidadMedida](
	[UnidadMedidaId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [varchar](50) NOT NULL,
	[Abreviatura] [varchar](10) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UnidadMedidaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[Usuario] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuario](
	[UsuarioId] [int] IDENTITY(1,1) NOT NULL,
	[Username] [varchar](50) NOT NULL,
	[Nombre] [varchar](100) NOT NULL,
	[Apellido] [varchar](100) NULL,
	[Email] [varchar](150) NOT NULL,
	[Password] [varchar](255) NOT NULL,
	[Activo] [bit] NOT NULL,
	[Bloqueado] [bit] NOT NULL,
	[IntentosFallidos] [int] NOT NULL,
	[FechaAlta] [datetime] NOT NULL,
	[UltimoLogin] [datetime] NULL,
	[MotivoInactivacionUsuarioId] [int] NULL,
	[ObservacionInactivacion] [varchar](250) NULL,
	[FechaInactivacion] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UsuarioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[UsuarioRol] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UsuarioRol](
	[UsuarioRolId] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[RolId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UsuarioRolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Objeto: Table [dbo].[VisitaOportunidad] Fecha de script: 25/10/2026 20:14:28 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VisitaOportunidad](
	[VisitaOportunidadId] [int] IDENTITY(1,1) NOT NULL,
	[OportunidadComercialId] [int] NOT NULL,
	[FechaVisita] [datetime] NOT NULL,
	[TipoVisita] [varchar](30) NOT NULL,
	[ResultadoEsperado] [varchar](250) NULL,
	[Observaciones] [varchar](500) NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VisitaOportunidadId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Seccion de datos del export original omitida intencionalmente.

ALTER TABLE [dbo].[AlicuotaIVA] ADD  CONSTRAINT [UQ_AlicuotaIVA_CodigoARCA] UNIQUE NONCLUSTERED 
(
	[CodigoARCA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_AlicuotaIVA_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[AlicuotaIVA] ADD  CONSTRAINT [UQ_AlicuotaIVA_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_CajaConcepto_Codigo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CajaConcepto] ADD  CONSTRAINT [UQ_CajaConcepto_Codigo] UNIQUE NONCLUSTERED 
(
	[Codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_CajaConcepto_Tipo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CajaConcepto] ADD  CONSTRAINT [UQ_CajaConcepto_Tipo] UNIQUE NONCLUSTERED 
(
	[CajaConceptoId] ASC,
	[Tipo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_Carrito_IdentificadorSesion] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Carrito] ADD  CONSTRAINT [UQ_Carrito_IdentificadorSesion] UNIQUE NONCLUSTERED 
(
	[IdentificadorSesion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_CompraDetalle_Insumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CompraProveedorDetalle] ADD  CONSTRAINT [UQ_CompraDetalle_Insumo] UNIQUE NONCLUSTERED 
(
	[CompraProveedorId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_ConceptoComprobante_CodigoARCA] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[ConceptoComprobante] ADD  CONSTRAINT [UQ_ConceptoComprobante_CodigoARCA] UNIQUE NONCLUSTERED 
(
	[CodigoARCA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_ConceptoComprobante_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[ConceptoComprobante] ADD  CONSTRAINT [UQ_ConceptoComprobante_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_CondicionIVA_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CondicionIVA] ADD  CONSTRAINT [UQ_CondicionIVA_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_CuentaCliente_Cliente] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CuentaClienteEcommerce] ADD  CONSTRAINT [UQ_CuentaCliente_Cliente] UNIQUE NONCLUSTERED 
(
	[ClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_CuentaCliente_Email] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[CuentaClienteEcommerce] ADD  CONSTRAINT [UQ_CuentaCliente_Email] UNIQUE NONCLUSTERED 
(
	[EmailNormalizado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_DetalleCarrito] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[DetalleCarrito] ADD  CONSTRAINT [UQ_DetalleCarrito] UNIQUE NONCLUSTERED 
(
	[CarritoId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_DevolucionVentaIntegral_Pedido] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[DevolucionVentaIntegral] ADD  CONSTRAINT [UQ_DevolucionVentaIntegral_Pedido] UNIQUE NONCLUSTERED 
(
	[PedidoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_EcommerceProductoRecorte_Orden] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[EcommerceProductoRecorte] ADD  CONSTRAINT [UQ_EcommerceProductoRecorte_Orden] UNIQUE NONCLUSTERED 
(
	[OrdenProduccionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ__EgresoDe__32A178D4CB744E60] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[EgresoDevolucionVenta] ADD UNIQUE NONCLUSTERED 
(
	[DevolucionVentaIntegralId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_EstadoInteresComercial_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[EstadoInteresComercial] ADD  CONSTRAINT [UQ_EstadoInteresComercial_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_EstadoOportunidadComercial_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[EstadoOportunidadComercial] ADD  CONSTRAINT [UQ_EstadoOportunidadComercial_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_FacturaProveedor_Numero] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[FacturaProveedor] ADD  CONSTRAINT [UQ_FacturaProveedor_Numero] UNIQUE NONCLUSTERED 
(
	[ProveedorId] ASC,
	[NumeroFactura] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Insumo_Codigo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Insumo] ADD  CONSTRAINT [UQ_Insumo_Codigo] UNIQUE NONCLUSTERED 
(
	[Codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_InventarioAjusteLote_Operacion] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[InventarioAjusteLote] ADD  CONSTRAINT [UQ_InventarioAjusteLote_Operacion] UNIQUE NONCLUSTERED 
(
	[OperacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_InventarioApertura_Operacion] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[InventarioApertura] ADD  CONSTRAINT [UQ_InventarioApertura_Operacion] UNIQUE NONCLUSTERED 
(
	[OperacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_InventarioRecuento_Operacion] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[InventarioRecuento] ADD  CONSTRAINT [UQ_InventarioRecuento_Operacion] UNIQUE NONCLUSTERED 
(
	[OperacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_InventarioRecuentoDetalle_Articulo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[InventarioRecuentoDetalle] ADD  CONSTRAINT [UQ_InventarioRecuentoDetalle_Articulo] UNIQUE NONCLUSTERED 
(
	[RecuentoId] ASC,
	[Clase] ASC,
	[ArticuloId] ASC,
	[DepositoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Localidad] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Localidad] ADD  CONSTRAINT [UQ_Localidad] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC,
	[ProvinciaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Moneda_CodigoARCA] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Moneda] ADD  CONSTRAINT [UQ_Moneda_CodigoARCA] UNIQUE NONCLUSTERED 
(
	[CodigoARCA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Moneda_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Moneda] ADD  CONSTRAINT [UQ_Moneda_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_MotivoInactivacion_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[MotivoInactivacion] ADD  CONSTRAINT [UQ_MotivoInactivacion_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_MotivoInactivacionUsuario_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[MotivoInactivacionUsuario] ADD  CONSTRAINT [UQ_MotivoInactivacionUsuario_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_MotivoMovimientoStock_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[MotivoMovimientoStock] ADD  CONSTRAINT [UQ_MotivoMovimientoStock_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_MotivoPerdidaOportunidad_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[MotivoPerdidaOportunidad] ADD  CONSTRAINT [UQ_MotivoPerdidaOportunidad_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_NombreInsumoCatalogo_Id_Tipo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[NombreInsumoCatalogo] ADD  CONSTRAINT [UQ_NombreInsumoCatalogo_Id_Tipo] UNIQUE NONCLUSTERED 
(
	[NombreInsumoId] ASC,
	[TipoInsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_NombreInsumoCatalogo_Tipo_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[NombreInsumoCatalogo] ADD  CONSTRAINT [UQ_NombreInsumoCatalogo_Tipo_Nombre] UNIQUE NONCLUSTERED 
(
	[TipoInsumoId] ASC,
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_NombreProductoCatalogo_Tipo_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[NombreProductoCatalogo] ADD  CONSTRAINT [UQ_NombreProductoCatalogo_Tipo_Nombre] UNIQUE NONCLUSTERED 
(
	[TipoProductoId] ASC,
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_NotaCredito_Numero] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[NotaCreditoProveedor] ADD  CONSTRAINT [UQ_NotaCredito_Numero] UNIQUE NONCLUSTERED 
(
	[FacturaProveedorId] ASC,
	[NumeroNota] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_Oferta_ProveedorSolicitud] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OfertaProveedor] ADD  CONSTRAINT [UQ_Oferta_ProveedorSolicitud] UNIQUE NONCLUSTERED 
(
	[SolicitudCotizacionId] ASC,
	[ProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_OfertaDetalle_Insumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OfertaProveedorDetalle] ADD  CONSTRAINT [UQ_OfertaDetalle_Insumo] UNIQUE NONCLUSTERED 
(
	[OfertaProveedorId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_OportunidadProducto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OportunidadProducto] ADD  CONSTRAINT [UQ_OportunidadProducto] UNIQUE NONCLUSTERED 
(
	[OportunidadComercialId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_OrdenPagoAplicacion_Factura] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion] ADD  CONSTRAINT [UQ_OrdenPagoAplicacion_Factura] UNIQUE NONCLUSTERED 
(
	[OrdenPagoProveedorId] ASC,
	[FacturaProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_OPBOM_DetalleInsumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot] ADD  CONSTRAINT [UQ_OPBOM_DetalleInsumo] UNIQUE NONCLUSTERED 
(
	[OrdenProduccionDetalleId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_OPDetalle_Producto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[OrdenProduccionDetalle] ADD  CONSTRAINT [UQ_OPDetalle_Producto] UNIQUE NONCLUSTERED 
(
	[OrdenProduccionId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Permiso_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Permiso] ADD  CONSTRAINT [UQ_Permiso_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_PlantillaFabricacion_Producto_Version] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[PlantillaFabricacion] ADD  CONSTRAINT [UQ_PlantillaFabricacion_Producto_Version] UNIQUE NONCLUSTERED 
(
	[ProductoId] ASC,
	[Version] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_PlantillaOP_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[PlantillaOrdenProduccion] ADD  CONSTRAINT [UQ_PlantillaOP_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_PlantillaOPDetalle_Producto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle] ADD  CONSTRAINT [UQ_PlantillaOPDetalle_Producto] UNIQUE NONCLUSTERED 
(
	[PlantillaOrdenProduccionId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_PrecioVentaCalculo_PrecioVenta] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[PrecioVentaCalculo] ADD  CONSTRAINT [UQ_PrecioVentaCalculo_PrecioVenta] UNIQUE NONCLUSTERED 
(
	[PrecioVentaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_PresupuestoDetalle_Producto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[PresupuestoComercialDetalle] ADD  CONSTRAINT [UQ_PresupuestoDetalle_Producto] UNIQUE NONCLUSTERED 
(
	[PresupuestoComercialId] ASC,
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Producto_Codigo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Producto] ADD  CONSTRAINT [UQ_Producto_Codigo] UNIQUE NONCLUSTERED 
(
	[Codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_TEKA_ProductoCircular_Producto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[ProductoCircular] ADD  CONSTRAINT [UQ_TEKA_ProductoCircular_Producto] UNIQUE NONCLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_TEKA_ProductoCircular_Sugerido] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[ProductoCircular] ADD  CONSTRAINT [UQ_TEKA_ProductoCircular_Sugerido] UNIQUE NONCLUSTERED 
(
	[RecorteProductoSugeridoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Provincia_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Provincia] ADD  CONSTRAINT [UQ_Provincia_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UX_RecorteDiseno_Orden] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteDiseno] ADD  CONSTRAINT [UX_RecorteDiseno_Orden] UNIQUE NONCLUSTERED 
(
	[RecorteGeneracionId] ASC,
	[OrdenEnGeneracion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UX_RecorteDiseno_Version] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteDiseno] ADD  CONSTRAINT [UX_RecorteDiseno_Version] UNIQUE NONCLUSTERED 
(
	[FamiliaUid] ASC,
	[VersionNumero] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UX_RecorteInsumo_DisenoInsumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteDisenoInsumo] ADD  CONSTRAINT [UX_RecorteInsumo_DisenoInsumo] UNIQUE NONCLUSTERED 
(
	[RecorteDisenoId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_RecortePieza_DisenoId] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteDisenoPieza] ADD  CONSTRAINT [UQ_RecortePieza_DisenoId] UNIQUE NONCLUSTERED 
(
	[RecorteDisenoId] ASC,
	[RecorteDisenoPiezaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UX_RecortePieza_Orden] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteDisenoPieza] ADD  CONSTRAINT [UX_RecortePieza_Orden] UNIQUE NONCLUSTERED 
(
	[RecorteDisenoId] ASC,
	[OrdenPieza] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UX_RecorteGeneracion_Solicitud] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecorteGeneracion] ADD  CONSTRAINT [UX_RecorteGeneracion_Solicitud] UNIQUE NONCLUSTERED 
(
	[SolicitudUid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_RecuperacionPassword_Token] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RecuperacionPassword] ADD  CONSTRAINT [UQ_RecuperacionPassword_Token] UNIQUE NONCLUSTERED 
(
	[TokenRecuperacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_RegistroPendienteEcommerce_Token] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RegistroPendienteEcommerce] ADD  CONSTRAINT [UQ_RegistroPendienteEcommerce_Token] UNIQUE NONCLUSTERED 
(
	[TokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_RemitoProveedor_Compra] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RemitoRecepcionProveedor] ADD  CONSTRAINT [UQ_RemitoProveedor_Compra] UNIQUE NONCLUSTERED 
(
	[CompraProveedorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_RemitoDetalle_Insumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle] ADD  CONSTRAINT [UQ_RemitoDetalle_Insumo] UNIQUE NONCLUSTERED 
(
	[RemitoRecepcionProveedorId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Rol_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Rol] ADD  CONSTRAINT [UQ_Rol_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_RolPermiso] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[RolPermiso] ADD  CONSTRAINT [UQ_RolPermiso] UNIQUE NONCLUSTERED 
(
	[RolId] ASC,
	[PermisoId] ASC,
	[MenuId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_SolicitudDetalle_Insumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[SolicitudCotizacionDetalle] ADD  CONSTRAINT [UQ_SolicitudDetalle_Insumo] UNIQUE NONCLUSTERED 
(
	[SolicitudCotizacionId] ASC,
	[InsumoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_StockInsumo] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[StockInsumo] ADD  CONSTRAINT [UQ_StockInsumo] UNIQUE NONCLUSTERED 
(
	[InsumoId] ASC,
	[DepositoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_StockProducto] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[StockProducto] ADD  CONSTRAINT [UQ_StockProducto] UNIQUE NONCLUSTERED 
(
	[ProductoId] ASC,
	[DepositoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_StockRecorte] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[StockRecorte] ADD  CONSTRAINT [UQ_StockRecorte] UNIQUE NONCLUSTERED 
(
	[RecorteId] ASC,
	[DepositoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_TipoDocumento_CodigoARCA] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[TipoDocumento] ADD  CONSTRAINT [UQ_TipoDocumento_CodigoARCA] UNIQUE NONCLUSTERED 
(
	[CodigoARCA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_TipoDocumento_Nombre] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[TipoDocumento] ADD  CONSTRAINT [UQ_TipoDocumento_Nombre] UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_TokenRecuperacionCliente_Hash] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce] ADD  CONSTRAINT [UQ_TokenRecuperacionCliente_Hash] UNIQUE NONCLUSTERED 
(
	[TokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Usuario_Email] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Usuario] ADD  CONSTRAINT [UQ_Usuario_Email] UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Objeto: Index [UQ_Usuario_Username] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[Usuario] ADD  CONSTRAINT [UQ_Usuario_Username] UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Objeto: Index [UQ_UsuarioRol] Fecha de script: 25/10/2026 20:14:29 ******/
ALTER TABLE [dbo].[UsuarioRol] ADD  CONSTRAINT [UQ_UsuarioRol] UNIQUE NONCLUSTERED 
(
	[UsuarioId] ASC,
	[RolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ActividadComercial] ADD  CONSTRAINT [DF_ActividadComercial_Estado]  DEFAULT ('Pendiente') FOR [Estado]
GO
ALTER TABLE [dbo].[ActividadComercial] ADD  CONSTRAINT [DF_ActividadComercial_FechaAlta]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[ActividadComercial] ADD  CONSTRAINT [DF_ActividadComercial_Actualizacion]  DEFAULT (sysdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[AlicuotaIVA] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial] ADD  CONSTRAINT [DF_AuditoriaAsignacionComercial_Fecha]  DEFAULT (sysutcdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor] ADD  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[AuditoriaEdicionPedido] ADD  DEFAULT (sysutcdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[AuditoriaEvento] ADD  DEFAULT (getdate()) FOR [FechaEvento]
GO
ALTER TABLE [dbo].[AuditoriaFichaTecnicaEstimacion] ADD  DEFAULT ('Modelo hipotetico autorizado; pendiente validar') FOR [Origen]
GO
ALTER TABLE [dbo].[AuditoriaFichaTecnicaEstimacion] ADD  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[AuditoriaSesion] ADD  DEFAULT (getdate()) FOR [FechaLogin]
GO
ALTER TABLE [dbo].[AuditoriaSesion] ADD  DEFAULT ((1)) FOR [Exitoso]
GO
ALTER TABLE [dbo].[BancoConciliacion] ADD  CONSTRAINT [DF_BancoConc_Fecha]  DEFAULT (sysdatetime()) FOR [FechaConciliacion]
GO
ALTER TABLE [dbo].[BancoImportacion] ADD  CONSTRAINT [DF_BancoImport_Fecha]  DEFAULT (sysdatetime()) FOR [FechaImportacion]
GO
ALTER TABLE [dbo].[BancoImportacion] ADD  CONSTRAINT [DF_BancoImport_Estado]  DEFAULT ('Abierta') FOR [Estado]
GO
ALTER TABLE [dbo].[BancoMovimiento] ADD  CONSTRAINT [DF_BancoMov_Estado]  DEFAULT ('Pendiente') FOR [Estado]
GO
ALTER TABLE [dbo].[BancoMovimiento] ADD  CONSTRAINT [DF_BancoMov_Fecha]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[Caja] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[CajaArqueo] ADD  CONSTRAINT [DF_CajaArqueo_Fecha]  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[CajaConcepto] ADD  CONSTRAINT [DF_CajaConcepto_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[CajaConcepto] ADD  CONSTRAINT [DF_CajaConcepto_Fecha]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[CajaConfiguracion] ADD  CONSTRAINT [DF_CajaConfiguracion_Fecha]  DEFAULT (sysdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[CajaMovimiento] ADD  CONSTRAINT [DF_CajaMovimiento_Fecha]  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[CajaSesion] ADD  CONSTRAINT [DF_CajaSesion_Estado]  DEFAULT ('Abierta') FOR [Estado]
GO
ALTER TABLE [dbo].[CajaSesion] ADD  CONSTRAINT [DF_CajaSesion_Apertura]  DEFAULT (sysdatetime()) FOR [FechaApertura]
GO
ALTER TABLE [dbo].[CanalVenta] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Carrito] ADD  DEFAULT (newid()) FOR [IdentificadorSesion]
GO
ALTER TABLE [dbo].[Carrito] ADD  DEFAULT ('Activo') FOR [Estado]
GO
ALTER TABLE [dbo].[Carrito] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Carrito] ADD  DEFAULT (getdate()) FOR [FechaUltimaActividad]
GO
ALTER TABLE [dbo].[Carrito] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Cliente] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Cliente] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[Cobro] ADD  DEFAULT (getdate()) FOR [FechaCobro]
GO
ALTER TABLE [dbo].[Cobro] ADD  DEFAULT ((0)) FOR [ImporteBase]
GO
ALTER TABLE [dbo].[Cobro] ADD  DEFAULT ((0)) FOR [PorcentajeAplicado]
GO
ALTER TABLE [dbo].[Cobro] ADD  DEFAULT ((0)) FOR [ImporteAjuste]
GO
ALTER TABLE [dbo].[Cobro] ADD  DEFAULT ((0)) FOR [ImporteFinal]
GO
ALTER TABLE [dbo].[CobroEdicion] ADD  CONSTRAINT [DF_CobroEdicion_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaEdicion]
GO
ALTER TABLE [dbo].[Color] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[CompraProveedor] ADD  CONSTRAINT [DF_CompraProveedor_Fecha]  DEFAULT (sysdatetime()) FOR [FechaCompra]
GO
ALTER TABLE [dbo].[CompraProveedor] ADD  CONSTRAINT [DF_CompraProveedor_Estado]  DEFAULT ('Registrada') FOR [Estado]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT (CONVERT([date],getdate())) FOR [FechaComprobante]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteNoGravado]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteExento]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteNetoGravado]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteIVA]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteTributos]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ((0)) FOR [ImporteTotal]
GO
ALTER TABLE [dbo].[Comprobante] ADD  DEFAULT ('BORRADOR') FOR [EstadoComprobante]
GO
ALTER TABLE [dbo].[ConceptoComprobante] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[CondicionIVA] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[ConsumoProduccion] ADD  DEFAULT (getdate()) FOR [FechaConsumo]
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion] ADD  DEFAULT (getdate()) FOR [FechaConsumo]
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA] ADD  CONSTRAINT [DF_CuentaBancaria_Moneda]  DEFAULT ('ARS') FOR [Moneda]
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA] ADD  CONSTRAINT [DF_CuentaBancaria_Activa]  DEFAULT ((1)) FOR [Activa]
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA] ADD  CONSTRAINT [DF_CuentaBancaria_Fecha]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce] ADD  CONSTRAINT [DF_CuentaCliente_EmailVerificado]  DEFAULT ((0)) FOR [EmailVerificado]
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce] ADD  CONSTRAINT [DF_CuentaCliente_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce] ADD  CONSTRAINT [DF_CuentaCliente_FechaAlta]  DEFAULT (sysutcdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[Deposito] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[DetalleCarrito] ADD  DEFAULT (getdate()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[DetalleComprobante] ADD  DEFAULT ((0)) FOR [BonificacionImporte]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] ADD  CONSTRAINT [DF_DevolucionVentaIntegral_Fecha]  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[DomicilioCliente] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig] ADD  CONSTRAINT [DF_EcommerceBeneficioRecorteConfig_Activo]  DEFAULT ((0)) FOR [Activo]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig] ADD  CONSTRAINT [DF_EcommerceBeneficioRecorteConfig_Fecha]  DEFAULT (sysdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] ADD  CONSTRAINT [DF_EcommerceBeneficioRecortePedido_Fecha]  DEFAULT (sysdatetime()) FOR [FechaAsignacion]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] ADD  CONSTRAINT [DF_EcommerceProductoRecorte_Activo]  DEFAULT ((0)) FOR [Activo]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] ADD  CONSTRAINT [DF_EcommerceProductoRecorte_Alta]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[EcommercePromocion] ADD  CONSTRAINT [DF_EcommercePromocion_Activa]  DEFAULT ((0)) FOR [Activa]
GO
ALTER TABLE [dbo].[EcommercePromocion] ADD  CONSTRAINT [DF_EcommercePromocion_Alta]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] ADD  CONSTRAINT [DF_EgresoDevolucionVenta_Fecha]  DEFAULT (sysdatetime()) FOR [FechaEgreso]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] ADD  CONSTRAINT [DF_EnvioComprobanteCorreo_FechaSolicitud]  DEFAULT (sysdatetime()) FOR [FechaSolicitud]
GO
ALTER TABLE [dbo].[EstadoCobro] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EstadoInteresComercial] ADD  DEFAULT ((0)) FOR [Orden]
GO
ALTER TABLE [dbo].[EstadoInteresComercial] ADD  DEFAULT ((0)) FOR [EsFinal]
GO
ALTER TABLE [dbo].[EstadoInteresComercial] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EstadoOportunidadComercial] ADD  DEFAULT ((0)) FOR [Orden]
GO
ALTER TABLE [dbo].[EstadoOportunidadComercial] ADD  DEFAULT ((0)) FOR [EsFinal]
GO
ALTER TABLE [dbo].[EstadoOportunidadComercial] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EstadoOrdenProduccion] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EstadoPedido] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[EstadoRecorte] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[FacturaProveedor] ADD  CONSTRAINT [DF_FacturaProveedor_Estado]  DEFAULT ('Registrada') FOR [Estado]
GO
ALTER TABLE [dbo].[FacturaProveedor] ADD  CONSTRAINT [DF_FacturaProveedor_Registro]  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[HistorialEstadoOportunidad] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[HistorialEstadoOrdenProduccion] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[HistorialEstadoPedido] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[HistorialEstadoRecorte] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[Insumo] ADD  DEFAULT ((0)) FOR [StockMinimo]
GO
ALTER TABLE [dbo].[Insumo] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Insumo] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[InteresComercial] ADD  DEFAULT ((0)) FOR [MontoPotencial]
GO
ALTER TABLE [dbo].[InteresComercial] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[InteresComercial] ADD  DEFAULT (getdate()) FOR [FechaUltimaActividad]
GO
ALTER TABLE [dbo].[InteresComercial] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[InventarioAjusteLote] ADD  CONSTRAINT [DF_InventarioAjusteLote_Fecha]  DEFAULT (sysutcdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[InventarioApertura] ADD  CONSTRAINT [DF_InventarioApertura_Fecha]  DEFAULT (sysutcdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[InventarioRecuento] ADD  CONSTRAINT [DF_InventarioRecuento_Captura]  DEFAULT (sysutcdatetime()) FOR [FechaCaptura]
GO
ALTER TABLE [dbo].[InventarioRecuento] ADD  CONSTRAINT [DF_InventarioRecuento_Estado]  DEFAULT ('PENDIENTE') FOR [Estado]
GO
ALTER TABLE [dbo].[ListaMateriales] ADD  DEFAULT ((1)) FOR [Activa]
GO
ALTER TABLE [dbo].[ListaMateriales] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[Localidad] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MedioCobro] ADD  DEFAULT ((0)) FOR [RequiereReferencia]
GO
ALTER TABLE [dbo].[MedioCobro] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Menu] ADD  DEFAULT ((1)) FOR [OrdenVisual]
GO
ALTER TABLE [dbo].[Menu] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Moneda] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MotivoConsultaComercial] ADD  CONSTRAINT [DF_MotivoConsultaComercial_Orden]  DEFAULT ((0)) FOR [OrdenVisual]
GO
ALTER TABLE [dbo].[MotivoConsultaComercial] ADD  CONSTRAINT [DF_MotivoConsultaComercial_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MotivoInactivacion] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MotivoInactivacionUsuario] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MotivoMovimientoStock] ADD  CONSTRAINT [DF_MotivoMovimientoStock_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MotivoPerdidaOportunidad] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] ADD  DEFAULT (getdate()) FOR [FechaMovimiento]
GO
ALTER TABLE [dbo].[MovimientoFinanciero] ADD  CONSTRAINT [DF_MovFin_Fecha]  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[MovimientoFinanciero] ADD  CONSTRAINT [DF_MovFin_Estado]  DEFAULT ('Registrado') FOR [Estado]
GO
ALTER TABLE [dbo].[MovimientoRecorte] ADD  DEFAULT (getdate()) FOR [FechaMovimiento]
GO
ALTER TABLE [dbo].[MovimientoStock] ADD  DEFAULT (getdate()) FOR [FechaMovimiento]
GO
ALTER TABLE [dbo].[MovimientoStock] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[NombreInsumoCatalogo] ADD  CONSTRAINT [DF_NombreInsumoCatalogo_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[NombreProductoCatalogo] ADD  CONSTRAINT [DF_NombreProductoCatalogo_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[NotaCreditoProveedor] ADD  CONSTRAINT [DF_NotaCredito_Registro]  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[OfertaProveedor] ADD  CONSTRAINT [DF_Oferta_Estado]  DEFAULT ('Recibida') FOR [Estado]
GO
ALTER TABLE [dbo].[OportunidadComercial] ADD  DEFAULT ((0)) FOR [MontoEstimado]
GO
ALTER TABLE [dbo].[OportunidadComercial] ADD  DEFAULT ((0)) FOR [Probabilidad]
GO
ALTER TABLE [dbo].[OportunidadComercial] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[OportunidadComercial] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[OrdenPagoProveedor] ADD  CONSTRAINT [DF_OrdenPago_Fecha]  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[OrdenPagoProveedor] ADD  CONSTRAINT [DF_OrdenPago_Estado]  DEFAULT ('Borrador') FOR [Estado]
GO
ALTER TABLE [dbo].[OrdenProduccion] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[OrdenProduccion] ADD  DEFAULT ((0)) FOR [CantidadProducida]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] ADD  CONSTRAINT [DF_ParametroCostoPrecio_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] ADD  CONSTRAINT [DF_ParametroCostoPrecio_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaModificacion]
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria] ADD  CONSTRAINT [DF_ParametroCostoPrecioAuditoria_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[Pedido] ADD  DEFAULT (getdate()) FOR [FechaPedido]
GO
ALTER TABLE [dbo].[Pedido] ADD  DEFAULT ((0)) FOR [Total]
GO
ALTER TABLE [dbo].[Permiso] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[PlantillaFabricacion] ADD  CONSTRAINT [DF_PlantillaFabricacion_Estado]  DEFAULT ('Borrador') FOR [Estado]
GO
ALTER TABLE [dbo].[PlantillaFabricacion] ADD  CONSTRAINT [DF_PlantillaFabricacion_Lote]  DEFAULT ((1)) FOR [UnidadesPorLote]
GO
ALTER TABLE [dbo].[PlantillaFabricacion] ADD  CONSTRAINT [DF_PlantillaFabricacion_Fecha]  DEFAULT (sysdatetime()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza] ADD  CONSTRAINT [DF_CortePieza_Rotada]  DEFAULT ((0)) FOR [Rotada]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza] ADD  CONSTRAINT [DF_PlantillaPieza_Veta]  DEFAULT ('Indiferente') FOR [OrientacionVeta]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte] ADD  CONSTRAINT [DF_PlanCorte_Sierra]  DEFAULT ((3)) FOR [AnchoSierraMm]
GO
ALTER TABLE [dbo].[PlantillaFabricacionRecortePrevisto] ADD  CONSTRAINT [DF_RecortePrevisto_Recuperable]  DEFAULT ((1)) FOR [Recuperable]
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccion] ADD  CONSTRAINT [DF_PlantillaOP_Activa]  DEFAULT ((1)) FOR [Activa]
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccion] ADD  CONSTRAINT [DF_PlantillaOP_Fecha]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[PrecioVenta] ADD  DEFAULT (getdate()) FOR [FechaVigenciaDesde]
GO
ALTER TABLE [dbo].[PrecioVenta] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] ADD  CONSTRAINT [DF_PrecioVentaCalculo_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaCalculo]
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria] ADD  CONSTRAINT [DF_PrecioVentaCorreccion_Fecha]  DEFAULT (sysdatetime()) FOR [FechaCorreccion]
GO
ALTER TABLE [dbo].[PresupuestoComercial] ADD  CONSTRAINT [DF_PresupuestoComercial_Estado]  DEFAULT ('Borrador') FOR [Estado]
GO
ALTER TABLE [dbo].[PresupuestoComercial] ADD  CONSTRAINT [DF_PresupuestoComercial_Emision]  DEFAULT (sysdatetime()) FOR [FechaEmision]
GO
ALTER TABLE [dbo].[PresupuestoComercial] ADD  CONSTRAINT [DF_PresupuestoComercial_Actualizacion]  DEFAULT (sysdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] ADD  CONSTRAINT [DF_PresupuestoDetalle_Descuento]  DEFAULT ((0)) FOR [DescuentoPorcentaje]
GO
ALTER TABLE [dbo].[PresupuestoComercialHistorial] ADD  CONSTRAINT [DF_PresupuestoHistorial_Fecha]  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[Producto] ADD  DEFAULT ((0)) FOR [StockMinimo]
GO
ALTER TABLE [dbo].[Producto] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Producto] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[ProductoCircular] ADD  CONSTRAINT [DF_TEKA_ProductoCircular_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaAprobacion]
GO
ALTER TABLE [dbo].[ProductoCircular] ADD  CONSTRAINT [DF_TEKA_ProductoCircular_Estado]  DEFAULT ('Aprobado') FOR [Estado]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] ADD  CONSTRAINT [DF_ProductoDisponibilidadOnline_Cupo]  DEFAULT ((0)) FOR [CupoOnline]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] ADD  CONSTRAINT [DF_ProductoDisponibilidadOnline_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[ProductoFichaTecnica] ADD  CONSTRAINT [DF_ProductoFichaTecnica_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[ProductoImagen] ADD  CONSTRAINT [DF_ProductoImagen_Principal]  DEFAULT ((0)) FOR [EsPrincipal]
GO
ALTER TABLE [dbo].[ProductoImagen] ADD  CONSTRAINT [DF_ProductoImagen_Orden]  DEFAULT ((0)) FOR [OrdenVisual]
GO
ALTER TABLE [dbo].[ProductoImagen] ADD  CONSTRAINT [DF_ProductoImagen_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[ProductoModelo3D] ADD  CONSTRAINT [DF_ProductoModelo3D_Escala]  DEFAULT ((0)) FOR [EscalaValidada]
GO
ALTER TABLE [dbo].[ProductoModelo3D] ADD  CONSTRAINT [DF_ProductoModelo3D_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[ProductoPublicacion] ADD  CONSTRAINT [DF_ProductoPublicacion_Publicado]  DEFAULT ((0)) FOR [Publicado]
GO
ALTER TABLE [dbo].[ProductoPublicacion] ADD  CONSTRAINT [DF_ProductoPublicacion_Destacado]  DEFAULT ((0)) FOR [Destacado]
GO
ALTER TABLE [dbo].[ProductoPublicacion] ADD  CONSTRAINT [DF_ProductoPublicacion_Orden]  DEFAULT ((0)) FOR [OrdenVisual]
GO
ALTER TABLE [dbo].[ProductoPublicacion] ADD  CONSTRAINT [DF_ProductoPublicacion_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion] ADD  DEFAULT ('PendienteValidacion') FOR [Estado]
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion] ADD  DEFAULT (sysdatetime()) FOR [FechaActualizacion]
GO
ALTER TABLE [dbo].[Proveedor] ADD  CONSTRAINT [DF_Proveedor_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Proveedor] ADD  CONSTRAINT [DF_Proveedor_Alta]  DEFAULT (sysdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[Provincia] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Recorte] ADD  DEFAULT ((1)) FOR [Cantidad]
GO
ALTER TABLE [dbo].[Recorte] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[RecorteDiseno] ADD  CONSTRAINT [DF_RecorteDiseno_Revision]  DEFAULT ('PendienteValidacion') FOR [EstadoRevision]
GO
ALTER TABLE [dbo].[RecorteDiseno] ADD  CONSTRAINT [DF_RecorteDiseno_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] ADD  CONSTRAINT [DF_RecorteAsignacion_Giro]  DEFAULT ((0)) FOR [Giro90]
GO
ALTER TABLE [dbo].[RecorteDisenoHistorial] ADD  CONSTRAINT [DF_RecorteHistorial_Fecha]  DEFAULT (sysutcdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[RecorteDisenoImagen] ADD  CONSTRAINT [DF_RecorteImagen_Estado]  DEFAULT ('Disponible') FOR [Estado]
GO
ALTER TABLE [dbo].[RecorteDisenoImagen] ADD  CONSTRAINT [DF_RecorteImagen_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion] ADD  CONSTRAINT [DF_RecorteValidacion_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaValidacion]
GO
ALTER TABLE [dbo].[RecorteGeneracion] ADD  CONSTRAINT [DF_RecorteGeneracion_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaGeneracion]
GO
ALTER TABLE [dbo].[RecorteGeneracion] ADD  CONSTRAINT [DF_RecorteGeneracion_Estado]  DEFAULT ('Registrada') FOR [Estado]
GO
ALTER TABLE [dbo].[RecorteGeneracion] ADD  CONSTRAINT [DF_RecorteGeneracion_Validas]  DEFAULT ((0)) FOR [CantidadTecnicasValidas]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] ADD  CONSTRAINT [DF_RecorteGenInv_Fecha]  DEFAULT (sysutcdatetime()) FOR [FechaSnapshot]
GO
ALTER TABLE [dbo].[RecuperacionPassword] ADD  DEFAULT (getdate()) FOR [FechaSolicitud]
GO
ALTER TABLE [dbo].[RecuperacionPassword] ADD  DEFAULT ((0)) FOR [Utilizado]
GO
ALTER TABLE [dbo].[RegistroPendienteEcommerce] ADD  DEFAULT (sysutcdatetime()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Remito] ADD  DEFAULT (getdate()) FOR [FechaRemito]
GO
ALTER TABLE [dbo].[Remito] ADD  DEFAULT ((0)) FOR [Entregado]
GO
ALTER TABLE [dbo].[Remito] ADD  CONSTRAINT [DF_Remito_Anulado]  DEFAULT ((0)) FOR [Anulado]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] ADD  CONSTRAINT [DF_RemitoProveedor_Registro]  DEFAULT (sysdatetime()) FOR [FechaRegistro]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] ADD  CONSTRAINT [DF_RemitoProveedor_Estado]  DEFAULT ('Borrador') FOR [Estado]
GO
ALTER TABLE [dbo].[ResultadoProduccion] ADD  DEFAULT (getdate()) FOR [FechaResultado]
GO
ALTER TABLE [dbo].[Rol] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor] ADD  CONSTRAINT [DF_SolicitudCotizacion_Fecha]  DEFAULT (sysdatetime()) FOR [Fecha]
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor] ADD  CONSTRAINT [DF_SolicitudCotizacion_Estado]  DEFAULT ('Abierta') FOR [Estado]
GO
ALTER TABLE [dbo].[StockInsumo] ADD  DEFAULT ((0)) FOR [CantidadActual]
GO
ALTER TABLE [dbo].[StockProducto] ADD  DEFAULT ((0)) FOR [CantidadActual]
GO
ALTER TABLE [dbo].[StockRecorte] ADD  DEFAULT ((0)) FOR [CantidadActual]
GO
ALTER TABLE [dbo].[SugerenciaRecorte] ADD  DEFAULT (getdate()) FOR [FechaSugerencia]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((0)) FOR [AfectaStock]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((0)) FOR [AfectaCaja]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((0)) FOR [EsNotaCredito]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((0)) FOR [EsNotaDebito]
GO
ALTER TABLE [dbo].[TipoComprobante] ADD  DEFAULT ((0)) FOR [RequiereAsociado]
GO
ALTER TABLE [dbo].[TipoDocumento] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoDomicilio] ADD  CONSTRAINT [DF_TipoDomicilio_Activo]  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoInsumo] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoMovimientoCuentaCorriente] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoMovimientoStock] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoProduccion] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoProducto] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TipoRecorte] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce] ADD  CONSTRAINT [DF_TokenRecuperacionCliente_Creacion]  DEFAULT (sysutcdatetime()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[UnidadMedida] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((0)) FOR [Bloqueado]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((0)) FOR [IntentosFallidos]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (getdate()) FOR [FechaAlta]
GO
ALTER TABLE [dbo].[VisitaOportunidad] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [FK_ActividadComercial_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [FK_ActividadComercial_Cliente]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [FK_ActividadComercial_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [FK_ActividadComercial_Oportunidad]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [FK_ActividadComercial_Presupuesto] FOREIGN KEY([PresupuestoComercialId])
REFERENCES [dbo].[PresupuestoComercial] ([PresupuestoComercialId])
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [FK_ActividadComercial_Presupuesto]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [FK_ActividadComercial_Responsable] FOREIGN KEY([UsuarioResponsableId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [FK_ActividadComercial_Responsable]
GO
ALTER TABLE [dbo].[AplicacionCobro]  WITH CHECK ADD  CONSTRAINT [FK_AplicacionCobro_Cobro] FOREIGN KEY([CobroId])
REFERENCES [dbo].[Cobro] ([CobroId])
GO
ALTER TABLE [dbo].[AplicacionCobro] CHECK CONSTRAINT [FK_AplicacionCobro_Cobro]
GO
ALTER TABLE [dbo].[AplicacionCobro]  WITH CHECK ADD  CONSTRAINT [FK_AplicacionCobro_Comprobante] FOREIGN KEY([ComprobanteId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[AplicacionCobro] CHECK CONSTRAINT [FK_AplicacionCobro_Comprobante]
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial]  WITH CHECK ADD  CONSTRAINT [FK_AuditoriaAsignacionComercial_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial] CHECK CONSTRAINT [FK_AuditoriaAsignacionComercial_Deposito]
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial]  WITH CHECK ADD  CONSTRAINT [FK_AuditoriaAsignacionComercial_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial] CHECK CONSTRAINT [FK_AuditoriaAsignacionComercial_Producto]
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor]  WITH CHECK ADD FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor]  WITH CHECK ADD FOREIGN KEY([RemitoRecepcionProveedorId])
REFERENCES [dbo].[RemitoRecepcionProveedor] ([RemitoRecepcionProveedorId])
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor]  WITH CHECK ADD FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[AuditoriaEdicionPedido]  WITH CHECK ADD FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[AuditoriaEdicionPedido]  WITH CHECK ADD FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[AuditoriaEvento]  WITH CHECK ADD  CONSTRAINT [FK_AuditoriaEvento_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[AuditoriaEvento] CHECK CONSTRAINT [FK_AuditoriaEvento_Usuario]
GO
ALTER TABLE [dbo].[AuditoriaFichaTecnicaEstimacion]  WITH CHECK ADD FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[AuditoriaSesion]  WITH CHECK ADD  CONSTRAINT [FK_AuditoriaSesion_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[AuditoriaSesion] CHECK CONSTRAINT [FK_AuditoriaSesion_Usuario]
GO
ALTER TABLE [dbo].[BancoConciliacion]  WITH CHECK ADD  CONSTRAINT [FK_BancoConc_BancoMov] FOREIGN KEY([BancoMovimientoId])
REFERENCES [dbo].[BancoMovimiento] ([BancoMovimientoId])
GO
ALTER TABLE [dbo].[BancoConciliacion] CHECK CONSTRAINT [FK_BancoConc_BancoMov]
GO
ALTER TABLE [dbo].[BancoConciliacion]  WITH CHECK ADD  CONSTRAINT [FK_BancoConc_MovFin] FOREIGN KEY([MovimientoFinancieroId])
REFERENCES [dbo].[MovimientoFinanciero] ([MovimientoFinancieroId])
GO
ALTER TABLE [dbo].[BancoConciliacion] CHECK CONSTRAINT [FK_BancoConc_MovFin]
GO
ALTER TABLE [dbo].[BancoConciliacion]  WITH CHECK ADD  CONSTRAINT [FK_BancoConc_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[BancoConciliacion] CHECK CONSTRAINT [FK_BancoConc_Usuario]
GO
ALTER TABLE [dbo].[BancoImportacion]  WITH CHECK ADD  CONSTRAINT [FK_BancoImport_Cuenta] FOREIGN KEY([CuentaBancariaId])
REFERENCES [dbo].[CuentaBancariaTEKA] ([CuentaBancariaId])
GO
ALTER TABLE [dbo].[BancoImportacion] CHECK CONSTRAINT [FK_BancoImport_Cuenta]
GO
ALTER TABLE [dbo].[BancoImportacion]  WITH CHECK ADD  CONSTRAINT [FK_BancoImport_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[BancoImportacion] CHECK CONSTRAINT [FK_BancoImport_Usuario]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_BancoMov_Cuenta] FOREIGN KEY([CuentaBancariaId])
REFERENCES [dbo].[CuentaBancariaTEKA] ([CuentaBancariaId])
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [FK_BancoMov_Cuenta]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_BancoMov_Importacion] FOREIGN KEY([BancoImportacionId])
REFERENCES [dbo].[BancoImportacion] ([BancoImportacionId])
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [FK_BancoMov_Importacion]
GO
ALTER TABLE [dbo].[CajaArqueo]  WITH CHECK ADD  CONSTRAINT [FK_CajaArqueo_Sesion] FOREIGN KEY([CajaSesionId])
REFERENCES [dbo].[CajaSesion] ([CajaSesionId])
GO
ALTER TABLE [dbo].[CajaArqueo] CHECK CONSTRAINT [FK_CajaArqueo_Sesion]
GO
ALTER TABLE [dbo].[CajaArqueo]  WITH CHECK ADD  CONSTRAINT [FK_CajaArqueo_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CajaArqueo] CHECK CONSTRAINT [FK_CajaArqueo_Usuario]
GO
ALTER TABLE [dbo].[CajaConfiguracion]  WITH CHECK ADD  CONSTRAINT [FK_CajaConfiguracion_Caja] FOREIGN KEY([CajaId])
REFERENCES [dbo].[Caja] ([CajaId])
GO
ALTER TABLE [dbo].[CajaConfiguracion] CHECK CONSTRAINT [FK_CajaConfiguracion_Caja]
GO
ALTER TABLE [dbo].[CajaConfiguracion]  WITH CHECK ADD  CONSTRAINT [FK_CajaConfiguracion_Usuario] FOREIGN KEY([UsuarioActualizacionId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CajaConfiguracion] CHECK CONSTRAINT [FK_CajaConfiguracion_Usuario]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_CajaMovimiento_Cobro] FOREIGN KEY([CobroId])
REFERENCES [dbo].[Cobro] ([CobroId])
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [FK_CajaMovimiento_Cobro]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_CajaMovimiento_ConceptoTipo] FOREIGN KEY([CajaConceptoId], [Tipo])
REFERENCES [dbo].[CajaConcepto] ([CajaConceptoId], [Tipo])
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [FK_CajaMovimiento_ConceptoTipo]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_CajaMovimiento_Sesion] FOREIGN KEY([CajaSesionId])
REFERENCES [dbo].[CajaSesion] ([CajaSesionId])
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [FK_CajaMovimiento_Sesion]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [FK_CajaMovimiento_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [FK_CajaMovimiento_Usuario]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [FK_CajaSesion_Caja] FOREIGN KEY([CajaId])
REFERENCES [dbo].[Caja] ([CajaId])
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [FK_CajaSesion_Caja]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [FK_CajaSesion_UsuarioA] FOREIGN KEY([UsuarioAperturaId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [FK_CajaSesion_UsuarioA]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [FK_CajaSesion_UsuarioC] FOREIGN KEY([UsuarioCierreId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [FK_CajaSesion_UsuarioC]
GO
ALTER TABLE [dbo].[Carrito]  WITH CHECK ADD  CONSTRAINT [FK_Carrito_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[Carrito] CHECK CONSTRAINT [FK_Carrito_Cliente]
GO
ALTER TABLE [dbo].[Carrito]  WITH CHECK ADD  CONSTRAINT [FK_Carrito_Pedido] FOREIGN KEY([PedidoIdConvertido])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[Carrito] CHECK CONSTRAINT [FK_Carrito_Pedido]
GO
ALTER TABLE [dbo].[Cliente]  WITH CHECK ADD  CONSTRAINT [FK_Cliente_CondicionIVA] FOREIGN KEY([CondicionIVAId])
REFERENCES [dbo].[CondicionIVA] ([CondicionIVAId])
GO
ALTER TABLE [dbo].[Cliente] CHECK CONSTRAINT [FK_Cliente_CondicionIVA]
GO
ALTER TABLE [dbo].[Cliente]  WITH CHECK ADD  CONSTRAINT [FK_Cliente_MotivoInactivacion] FOREIGN KEY([MotivoInactivacionId])
REFERENCES [dbo].[MotivoInactivacion] ([MotivoInactivacionId])
GO
ALTER TABLE [dbo].[Cliente] CHECK CONSTRAINT [FK_Cliente_MotivoInactivacion]
GO
ALTER TABLE [dbo].[Cliente]  WITH CHECK ADD  CONSTRAINT [FK_Cliente_TipoDocumento] FOREIGN KEY([TipoDocumentoId])
REFERENCES [dbo].[TipoDocumento] ([TipoDocumentoId])
GO
ALTER TABLE [dbo].[Cliente] CHECK CONSTRAINT [FK_Cliente_TipoDocumento]
GO
ALTER TABLE [dbo].[Cobro]  WITH CHECK ADD  CONSTRAINT [FK_Cobro_Caja] FOREIGN KEY([CajaId])
REFERENCES [dbo].[Caja] ([CajaId])
GO
ALTER TABLE [dbo].[Cobro] CHECK CONSTRAINT [FK_Cobro_Caja]
GO
ALTER TABLE [dbo].[Cobro]  WITH CHECK ADD  CONSTRAINT [FK_Cobro_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[Cobro] CHECK CONSTRAINT [FK_Cobro_Cliente]
GO
ALTER TABLE [dbo].[Cobro]  WITH CHECK ADD  CONSTRAINT [FK_Cobro_EstadoCobro] FOREIGN KEY([EstadoCobroId])
REFERENCES [dbo].[EstadoCobro] ([EstadoCobroId])
GO
ALTER TABLE [dbo].[Cobro] CHECK CONSTRAINT [FK_Cobro_EstadoCobro]
GO
ALTER TABLE [dbo].[Cobro]  WITH CHECK ADD  CONSTRAINT [FK_Cobro_MedioCobro] FOREIGN KEY([MedioCobroId])
REFERENCES [dbo].[MedioCobro] ([MedioCobroId])
GO
ALTER TABLE [dbo].[Cobro] CHECK CONSTRAINT [FK_Cobro_MedioCobro]
GO
ALTER TABLE [dbo].[Cobro]  WITH CHECK ADD  CONSTRAINT [FK_Cobro_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[Cobro] CHECK CONSTRAINT [FK_Cobro_Pedido]
GO
ALTER TABLE [dbo].[CobroEdicion]  WITH CHECK ADD  CONSTRAINT [FK_CobroEdicion_Cobro] FOREIGN KEY([CobroId])
REFERENCES [dbo].[Cobro] ([CobroId])
GO
ALTER TABLE [dbo].[CobroEdicion] CHECK CONSTRAINT [FK_CobroEdicion_Cobro]
GO
ALTER TABLE [dbo].[CompraProveedor]  WITH CHECK ADD  CONSTRAINT [FK_CompraProveedor_Oferta] FOREIGN KEY([OfertaProveedorId])
REFERENCES [dbo].[OfertaProveedor] ([OfertaProveedorId])
GO
ALTER TABLE [dbo].[CompraProveedor] CHECK CONSTRAINT [FK_CompraProveedor_Oferta]
GO
ALTER TABLE [dbo].[CompraProveedor]  WITH CHECK ADD  CONSTRAINT [FK_CompraProveedor_Proveedor] FOREIGN KEY([ProveedorId])
REFERENCES [dbo].[Proveedor] ([ProveedorId])
GO
ALTER TABLE [dbo].[CompraProveedor] CHECK CONSTRAINT [FK_CompraProveedor_Proveedor]
GO
ALTER TABLE [dbo].[CompraProveedor]  WITH CHECK ADD  CONSTRAINT [FK_CompraProveedor_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[CompraProveedor] CHECK CONSTRAINT [FK_CompraProveedor_Usuario]
GO
ALTER TABLE [dbo].[CompraProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_CompraDetalle_Compra] FOREIGN KEY([CompraProveedorId])
REFERENCES [dbo].[CompraProveedor] ([CompraProveedorId])
GO
ALTER TABLE [dbo].[CompraProveedorDetalle] CHECK CONSTRAINT [FK_CompraDetalle_Compra]
GO
ALTER TABLE [dbo].[CompraProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_CompraDetalle_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[CompraProveedorDetalle] CHECK CONSTRAINT [FK_CompraDetalle_Insumo]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_Cliente]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_ComprobanteAsociado] FOREIGN KEY([ComprobanteAsociadoId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_ComprobanteAsociado]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_Concepto] FOREIGN KEY([ConceptoComprobanteId])
REFERENCES [dbo].[ConceptoComprobante] ([ConceptoComprobanteId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_Concepto]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_CondicionIVA] FOREIGN KEY([CondicionIVAId])
REFERENCES [dbo].[CondicionIVA] ([CondicionIVAId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_CondicionIVA]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_Moneda] FOREIGN KEY([MonedaId])
REFERENCES [dbo].[Moneda] ([MonedaId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_Moneda]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_Pedido]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_Tipo] FOREIGN KEY([TipoComprobanteId])
REFERENCES [dbo].[TipoComprobante] ([TipoComprobanteId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_Tipo]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [FK_Comprobante_TipoDocumento] FOREIGN KEY([TipoDocumentoId])
REFERENCES [dbo].[TipoDocumento] ([TipoDocumentoId])
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [FK_Comprobante_TipoDocumento]
GO
ALTER TABLE [dbo].[ConsumoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoProduccion_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[ConsumoProduccion] CHECK CONSTRAINT [FK_ConsumoProduccion_Deposito]
GO
ALTER TABLE [dbo].[ConsumoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoProduccion_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[ConsumoProduccion] CHECK CONSTRAINT [FK_ConsumoProduccion_Insumo]
GO
ALTER TABLE [dbo].[ConsumoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoProduccion_Orden] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[ConsumoProduccion] CHECK CONSTRAINT [FK_ConsumoProduccion_Orden]
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoRecorteProduccion_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion] CHECK CONSTRAINT [FK_ConsumoRecorteProduccion_Deposito]
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoRecorteProduccion_Orden] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion] CHECK CONSTRAINT [FK_ConsumoRecorteProduccion_Orden]
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ConsumoRecorteProduccion_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion] CHECK CONSTRAINT [FK_ConsumoRecorteProduccion_Recorte]
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce]  WITH CHECK ADD  CONSTRAINT [FK_CuentaCliente_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce] CHECK CONSTRAINT [FK_CuentaCliente_Cliente]
GO
ALTER TABLE [dbo].[DetalleCarrito]  WITH CHECK ADD  CONSTRAINT [FK_DetalleCarrito_Carrito] FOREIGN KEY([CarritoId])
REFERENCES [dbo].[Carrito] ([CarritoId])
GO
ALTER TABLE [dbo].[DetalleCarrito] CHECK CONSTRAINT [FK_DetalleCarrito_Carrito]
GO
ALTER TABLE [dbo].[DetalleCarrito]  WITH CHECK ADD  CONSTRAINT [FK_DetalleCarrito_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[DetalleCarrito] CHECK CONSTRAINT [FK_DetalleCarrito_Producto]
GO
ALTER TABLE [dbo].[DetalleComprobante]  WITH CHECK ADD  CONSTRAINT [FK_DetalleComprobante_AlicuotaIVA] FOREIGN KEY([AlicuotaIVAId])
REFERENCES [dbo].[AlicuotaIVA] ([AlicuotaIVAId])
GO
ALTER TABLE [dbo].[DetalleComprobante] CHECK CONSTRAINT [FK_DetalleComprobante_AlicuotaIVA]
GO
ALTER TABLE [dbo].[DetalleComprobante]  WITH CHECK ADD  CONSTRAINT [FK_DetalleComprobante_Comprobante] FOREIGN KEY([ComprobanteId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[DetalleComprobante] CHECK CONSTRAINT [FK_DetalleComprobante_Comprobante]
GO
ALTER TABLE [dbo].[DetalleComprobante]  WITH CHECK ADD  CONSTRAINT [FK_DetalleComprobante_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[DetalleComprobante] CHECK CONSTRAINT [FK_DetalleComprobante_Producto]
GO
ALTER TABLE [dbo].[DetalleListaMateriales]  WITH CHECK ADD  CONSTRAINT [FK_DetalleListaMateriales_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[DetalleListaMateriales] CHECK CONSTRAINT [FK_DetalleListaMateriales_Insumo]
GO
ALTER TABLE [dbo].[DetalleListaMateriales]  WITH CHECK ADD  CONSTRAINT [FK_DetalleListaMateriales_Lista] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[DetalleListaMateriales] CHECK CONSTRAINT [FK_DetalleListaMateriales_Lista]
GO
ALTER TABLE [dbo].[DetallePedido]  WITH CHECK ADD  CONSTRAINT [FK_DetallePedido_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[DetallePedido] CHECK CONSTRAINT [FK_DetallePedido_Pedido]
GO
ALTER TABLE [dbo].[DetallePedido]  WITH CHECK ADD  CONSTRAINT [FK_DetallePedido_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[DetallePedido] CHECK CONSTRAINT [FK_DetallePedido_Producto]
GO
ALTER TABLE [dbo].[DetalleRemito]  WITH CHECK ADD  CONSTRAINT [FK_DetalleRemito_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[DetalleRemito] CHECK CONSTRAINT [FK_DetalleRemito_Producto]
GO
ALTER TABLE [dbo].[DetalleRemito]  WITH CHECK ADD  CONSTRAINT [FK_DetalleRemito_Remito] FOREIGN KEY([RemitoId])
REFERENCES [dbo].[Remito] ([RemitoId])
GO
ALTER TABLE [dbo].[DetalleRemito] CHECK CONSTRAINT [FK_DetalleRemito_Remito]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [FK_DevolucionVentaIntegral_Caja] FOREIGN KEY([CajaId])
REFERENCES [dbo].[Caja] ([CajaId])
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [FK_DevolucionVentaIntegral_Caja]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [FK_DevolucionVentaIntegral_Comprobante] FOREIGN KEY([ComprobanteVentaId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [FK_DevolucionVentaIntegral_Comprobante]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [FK_DevolucionVentaIntegral_NotaCredito] FOREIGN KEY([NotaCreditoId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [FK_DevolucionVentaIntegral_NotaCredito]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [FK_DevolucionVentaIntegral_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [FK_DevolucionVentaIntegral_Pedido]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [FK_DevolucionVentaIntegral_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [FK_DevolucionVentaIntegral_Usuario]
GO
ALTER TABLE [dbo].[DomicilioCliente]  WITH CHECK ADD  CONSTRAINT [FK_DomicilioCliente_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[DomicilioCliente] CHECK CONSTRAINT [FK_DomicilioCliente_Cliente]
GO
ALTER TABLE [dbo].[DomicilioCliente]  WITH CHECK ADD  CONSTRAINT [FK_DomicilioCliente_Localidad] FOREIGN KEY([LocalidadId])
REFERENCES [dbo].[Localidad] ([LocalidadId])
GO
ALTER TABLE [dbo].[DomicilioCliente] CHECK CONSTRAINT [FK_DomicilioCliente_Localidad]
GO
ALTER TABLE [dbo].[DomicilioCliente]  WITH CHECK ADD  CONSTRAINT [FK_DomicilioCliente_Provincia] FOREIGN KEY([ProvinciaId])
REFERENCES [dbo].[Provincia] ([ProvinciaId])
GO
ALTER TABLE [dbo].[DomicilioCliente] CHECK CONSTRAINT [FK_DomicilioCliente_Provincia]
GO
ALTER TABLE [dbo].[DomicilioCliente]  WITH CHECK ADD  CONSTRAINT [FK_DomicilioCliente_TipoDomicilio] FOREIGN KEY([TipoDomicilioId])
REFERENCES [dbo].[TipoDomicilio] ([TipoDomicilioId])
GO
ALTER TABLE [dbo].[DomicilioCliente] CHECK CONSTRAINT [FK_DomicilioCliente_TipoDomicilio]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido]  WITH CHECK ADD  CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Detalle] FOREIGN KEY([DetallePedidoId])
REFERENCES [dbo].[DetallePedido] ([DetallePedidoId])
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] CHECK CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Detalle]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido]  WITH CHECK ADD  CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] CHECK CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Pedido]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido]  WITH CHECK ADD  CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Producto] FOREIGN KEY([ProductoRecorteId])
REFERENCES [dbo].[EcommerceProductoRecorte] ([ProductoRecorteId])
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] CHECK CONSTRAINT [FK_EcommerceBeneficioRecortePedido_Producto]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_EcommerceProductoRecorte_Orden] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] CHECK CONSTRAINT [FK_EcommerceProductoRecorte_Orden]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_EcommerceProductoRecorte_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] CHECK CONSTRAINT [FK_EcommerceProductoRecorte_Producto]
GO
ALTER TABLE [dbo].[EcommercePromocionProducto]  WITH CHECK ADD  CONSTRAINT [FK_EcommercePromocionProducto_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[EcommercePromocionProducto] CHECK CONSTRAINT [FK_EcommercePromocionProducto_Producto]
GO
ALTER TABLE [dbo].[EcommercePromocionProducto]  WITH CHECK ADD  CONSTRAINT [FK_EcommercePromocionProducto_Promocion] FOREIGN KEY([PromocionId])
REFERENCES [dbo].[EcommercePromocion] ([PromocionId])
GO
ALTER TABLE [dbo].[EcommercePromocionProducto] CHECK CONSTRAINT [FK_EcommercePromocionProducto_Promocion]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [FK_EgresoDevolucion_CajaMovimiento] FOREIGN KEY([CajaMovimientoId])
REFERENCES [dbo].[CajaMovimiento] ([CajaMovimientoId])
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [FK_EgresoDevolucion_CajaMovimiento]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [FK_EgresoDevolucion_Cuenta] FOREIGN KEY([CuentaBancariaId])
REFERENCES [dbo].[CuentaBancariaTEKA] ([CuentaBancariaId])
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [FK_EgresoDevolucion_Cuenta]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [FK_EgresoDevolucion_MovimientoFinanciero] FOREIGN KEY([MovimientoFinancieroId])
REFERENCES [dbo].[MovimientoFinanciero] ([MovimientoFinancieroId])
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [FK_EgresoDevolucion_MovimientoFinanciero]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [FK_EgresoDevolucionVenta_Caja] FOREIGN KEY([CajaId])
REFERENCES [dbo].[Caja] ([CajaId])
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [FK_EgresoDevolucionVenta_Caja]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [FK_EgresoDevolucionVenta_Devolucion] FOREIGN KEY([DevolucionVentaIntegralId])
REFERENCES [dbo].[DevolucionVentaIntegral] ([DevolucionVentaIntegralId])
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [FK_EgresoDevolucionVenta_Devolucion]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo]  WITH CHECK ADD  CONSTRAINT [FK_EnvioComprobanteCorreo_Comprobante] FOREIGN KEY([ComprobanteId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] CHECK CONSTRAINT [FK_EnvioComprobanteCorreo_Comprobante]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo]  WITH CHECK ADD  CONSTRAINT [FK_EnvioComprobanteCorreo_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] CHECK CONSTRAINT [FK_EnvioComprobanteCorreo_Usuario]
GO
ALTER TABLE [dbo].[FacturaProveedor]  WITH CHECK ADD  CONSTRAINT [FK_FacturaProveedor_Compra] FOREIGN KEY([CompraProveedorId])
REFERENCES [dbo].[CompraProveedor] ([CompraProveedorId])
GO
ALTER TABLE [dbo].[FacturaProveedor] CHECK CONSTRAINT [FK_FacturaProveedor_Compra]
GO
ALTER TABLE [dbo].[FacturaProveedor]  WITH CHECK ADD  CONSTRAINT [FK_FacturaProveedor_Proveedor] FOREIGN KEY([ProveedorId])
REFERENCES [dbo].[Proveedor] ([ProveedorId])
GO
ALTER TABLE [dbo].[FacturaProveedor] CHECK CONSTRAINT [FK_FacturaProveedor_Proveedor]
GO
ALTER TABLE [dbo].[FacturaProveedor]  WITH CHECK ADD  CONSTRAINT [FK_FacturaProveedor_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[FacturaProveedor] CHECK CONSTRAINT [FK_FacturaProveedor_Usuario]
GO
ALTER TABLE [dbo].[HistorialEstadoOportunidad]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoOportunidad_Estado] FOREIGN KEY([EstadoOportunidadComercialId])
REFERENCES [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId])
GO
ALTER TABLE [dbo].[HistorialEstadoOportunidad] CHECK CONSTRAINT [FK_HistorialEstadoOportunidad_Estado]
GO
ALTER TABLE [dbo].[HistorialEstadoOportunidad]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoOportunidad_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[HistorialEstadoOportunidad] CHECK CONSTRAINT [FK_HistorialEstadoOportunidad_Oportunidad]
GO
ALTER TABLE [dbo].[HistorialEstadoOrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoOP_Estado] FOREIGN KEY([EstadoOrdenProduccionId])
REFERENCES [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId])
GO
ALTER TABLE [dbo].[HistorialEstadoOrdenProduccion] CHECK CONSTRAINT [FK_HistorialEstadoOP_Estado]
GO
ALTER TABLE [dbo].[HistorialEstadoOrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoOP_Orden] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[HistorialEstadoOrdenProduccion] CHECK CONSTRAINT [FK_HistorialEstadoOP_Orden]
GO
ALTER TABLE [dbo].[HistorialEstadoPedido]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoPedido_Estado] FOREIGN KEY([EstadoPedidoId])
REFERENCES [dbo].[EstadoPedido] ([EstadoPedidoId])
GO
ALTER TABLE [dbo].[HistorialEstadoPedido] CHECK CONSTRAINT [FK_HistorialEstadoPedido_Estado]
GO
ALTER TABLE [dbo].[HistorialEstadoPedido]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoPedido_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[HistorialEstadoPedido] CHECK CONSTRAINT [FK_HistorialEstadoPedido_Pedido]
GO
ALTER TABLE [dbo].[HistorialEstadoPedido]  WITH CHECK ADD  CONSTRAINT [FK_HistorialPedido_UsuarioAnulacion] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[HistorialEstadoPedido] CHECK CONSTRAINT [FK_HistorialPedido_UsuarioAnulacion]
GO
ALTER TABLE [dbo].[HistorialEstadoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoRecorte_Estado] FOREIGN KEY([EstadoRecorteId])
REFERENCES [dbo].[EstadoRecorte] ([EstadoRecorteId])
GO
ALTER TABLE [dbo].[HistorialEstadoRecorte] CHECK CONSTRAINT [FK_HistorialEstadoRecorte_Estado]
GO
ALTER TABLE [dbo].[HistorialEstadoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_HistorialEstadoRecorte_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[HistorialEstadoRecorte] CHECK CONSTRAINT [FK_HistorialEstadoRecorte_Recorte]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [FK_Insumo_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [FK_Insumo_Color]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [FK_Insumo_MotivoInactivacion] FOREIGN KEY([MotivoInactivacionId])
REFERENCES [dbo].[MotivoInactivacion] ([MotivoInactivacionId])
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [FK_Insumo_MotivoInactivacion]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [FK_Insumo_NombreInsumoCatalogo_Tipo] FOREIGN KEY([NombreInsumoId], [TipoInsumoId])
REFERENCES [dbo].[NombreInsumoCatalogo] ([NombreInsumoId], [TipoInsumoId])
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [FK_Insumo_NombreInsumoCatalogo_Tipo]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [FK_Insumo_TipoInsumo] FOREIGN KEY([TipoInsumoId])
REFERENCES [dbo].[TipoInsumo] ([TipoInsumoId])
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [FK_Insumo_TipoInsumo]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [FK_Insumo_UnidadMedida] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [FK_Insumo_UnidadMedida]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Canal] FOREIGN KEY([CanalVentaId])
REFERENCES [dbo].[CanalVenta] ([CanalVentaId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Canal]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Carrito] FOREIGN KEY([CarritoId])
REFERENCES [dbo].[Carrito] ([CarritoId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Carrito]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Cliente]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Estado] FOREIGN KEY([EstadoInteresComercialId])
REFERENCES [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Estado]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_MotivoConsultaComercial] FOREIGN KEY([MotivoConsultaId])
REFERENCES [dbo].[MotivoConsultaComercial] ([MotivoConsultaId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_MotivoConsultaComercial]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Oportunidad]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_ProductoConsultado] FOREIGN KEY([ProductoConsultadoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_ProductoConsultado]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [FK_InteresComercial_Responsable] FOREIGN KEY([UsuarioResponsableId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [FK_InteresComercial_Responsable]
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle]  WITH CHECK ADD  CONSTRAINT [FK_InventarioAjusteLoteDetalle_Lote] FOREIGN KEY([AjusteLoteId])
REFERENCES [dbo].[InventarioAjusteLote] ([AjusteLoteId])
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle] CHECK CONSTRAINT [FK_InventarioAjusteLoteDetalle_Lote]
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle]  WITH CHECK ADD  CONSTRAINT [FK_InventarioRecuentoDetalle_Recuento] FOREIGN KEY([RecuentoId])
REFERENCES [dbo].[InventarioRecuento] ([RecuentoId])
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle] CHECK CONSTRAINT [FK_InventarioRecuentoDetalle_Recuento]
GO
ALTER TABLE [dbo].[ListaMateriales]  WITH CHECK ADD  CONSTRAINT [FK_ListaMateriales_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ListaMateriales] CHECK CONSTRAINT [FK_ListaMateriales_Producto]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_LMRP_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [FK_LMRP_Color]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_LMRP_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [FK_LMRP_Insumo]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_LMRP_Lista] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [FK_LMRP_Lista]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_LMRP_Tipo] FOREIGN KEY([TipoRecorteId])
REFERENCES [dbo].[TipoRecorte] ([TipoRecorteId])
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [FK_LMRP_Tipo]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_LMRP_Unidad] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [FK_LMRP_Unidad]
GO
ALTER TABLE [dbo].[Localidad]  WITH CHECK ADD  CONSTRAINT [FK_Localidad_Provincia] FOREIGN KEY([ProvinciaId])
REFERENCES [dbo].[Provincia] ([ProvinciaId])
GO
ALTER TABLE [dbo].[Localidad] CHECK CONSTRAINT [FK_Localidad_Provincia]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [FK_MovCC_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [FK_MovCC_Cliente]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [FK_MovCC_Cobro] FOREIGN KEY([CobroId])
REFERENCES [dbo].[Cobro] ([CobroId])
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [FK_MovCC_Cobro]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [FK_MovCC_Comprobante] FOREIGN KEY([ComprobanteId])
REFERENCES [dbo].[Comprobante] ([ComprobanteId])
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [FK_MovCC_Comprobante]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [FK_MovCC_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [FK_MovCC_Pedido]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [FK_MovCC_Tipo] FOREIGN KEY([TipoMovimientoCuentaCorrienteId])
REFERENCES [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId])
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [FK_MovCC_Tipo]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [FK_MovFin_Canal] FOREIGN KEY([CanalVentaId])
REFERENCES [dbo].[CanalVenta] ([CanalVentaId])
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [FK_MovFin_Canal]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [FK_MovFin_Cobro] FOREIGN KEY([CobroId])
REFERENCES [dbo].[Cobro] ([CobroId])
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [FK_MovFin_Cobro]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [FK_MovFin_Cuenta] FOREIGN KEY([CuentaBancariaId])
REFERENCES [dbo].[CuentaBancariaTEKA] ([CuentaBancariaId])
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [FK_MovFin_Cuenta]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [FK_MovFin_MedioCobro] FOREIGN KEY([MedioCobroId])
REFERENCES [dbo].[MedioCobro] ([MedioCobroId])
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [FK_MovFin_MedioCobro]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [FK_MovFin_Usuario] FOREIGN KEY([UsuarioRegistroId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [FK_MovFin_Usuario]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoRecorte_ConsumoRecorteProduccion] FOREIGN KEY([ConsumoRecorteProduccionId])
REFERENCES [dbo].[ConsumoRecorteProduccion] ([ConsumoRecorteProduccionId])
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [FK_MovimientoRecorte_ConsumoRecorteProduccion]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoRecorte_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [FK_MovimientoRecorte_Deposito]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoRecorte_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [FK_MovimientoRecorte_Recorte]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoStock_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [FK_MovimientoStock_Deposito]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoStock_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [FK_MovimientoStock_Insumo]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoStock_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [FK_MovimientoStock_Producto]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoStock_ReversaDe] FOREIGN KEY([MovimientoStockIdReversaDe])
REFERENCES [dbo].[MovimientoStock] ([MovimientoStockId])
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [FK_MovimientoStock_ReversaDe]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [FK_MovimientoStock_Tipo] FOREIGN KEY([TipoMovimientoStockId])
REFERENCES [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId])
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [FK_MovimientoStock_Tipo]
GO
ALTER TABLE [dbo].[NombreInsumoCatalogo]  WITH CHECK ADD  CONSTRAINT [FK_NombreInsumoCatalogo_TipoInsumo] FOREIGN KEY([TipoInsumoId])
REFERENCES [dbo].[TipoInsumo] ([TipoInsumoId])
GO
ALTER TABLE [dbo].[NombreInsumoCatalogo] CHECK CONSTRAINT [FK_NombreInsumoCatalogo_TipoInsumo]
GO
ALTER TABLE [dbo].[NombreProductoCatalogo]  WITH CHECK ADD  CONSTRAINT [FK_NombreProductoCatalogo_TipoProducto] FOREIGN KEY([TipoProductoId])
REFERENCES [dbo].[TipoProducto] ([TipoProductoId])
GO
ALTER TABLE [dbo].[NombreProductoCatalogo] CHECK CONSTRAINT [FK_NombreProductoCatalogo_TipoProducto]
GO
ALTER TABLE [dbo].[NotaCreditoProveedor]  WITH CHECK ADD  CONSTRAINT [FK_NotaCredito_Factura] FOREIGN KEY([FacturaProveedorId])
REFERENCES [dbo].[FacturaProveedor] ([FacturaProveedorId])
GO
ALTER TABLE [dbo].[NotaCreditoProveedor] CHECK CONSTRAINT [FK_NotaCredito_Factura]
GO
ALTER TABLE [dbo].[NotaCreditoProveedor]  WITH CHECK ADD  CONSTRAINT [FK_NotaCredito_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[NotaCreditoProveedor] CHECK CONSTRAINT [FK_NotaCredito_Usuario]
GO
ALTER TABLE [dbo].[OfertaProveedor]  WITH CHECK ADD  CONSTRAINT [FK_Oferta_Proveedor] FOREIGN KEY([ProveedorId])
REFERENCES [dbo].[Proveedor] ([ProveedorId])
GO
ALTER TABLE [dbo].[OfertaProveedor] CHECK CONSTRAINT [FK_Oferta_Proveedor]
GO
ALTER TABLE [dbo].[OfertaProveedor]  WITH CHECK ADD  CONSTRAINT [FK_Oferta_Solicitud] FOREIGN KEY([SolicitudCotizacionId])
REFERENCES [dbo].[SolicitudCotizacionProveedor] ([SolicitudCotizacionId])
GO
ALTER TABLE [dbo].[OfertaProveedor] CHECK CONSTRAINT [FK_Oferta_Solicitud]
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_OfertaDetalle_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle] CHECK CONSTRAINT [FK_OfertaDetalle_Insumo]
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_OfertaDetalle_Oferta] FOREIGN KEY([OfertaProveedorId])
REFERENCES [dbo].[OfertaProveedor] ([OfertaProveedorId])
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle] CHECK CONSTRAINT [FK_OfertaDetalle_Oferta]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_CanalVenta] FOREIGN KEY([CanalVentaId])
REFERENCES [dbo].[CanalVenta] ([CanalVentaId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_CanalVenta]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_Cliente]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_Estado] FOREIGN KEY([EstadoOportunidadComercialId])
REFERENCES [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_Estado]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_Interes] FOREIGN KEY([InteresComercialId])
REFERENCES [dbo].[InteresComercial] ([InteresComercialId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_Interes]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_MotivoPerdida] FOREIGN KEY([MotivoPerdidaOportunidadId])
REFERENCES [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_MotivoPerdida]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_PedidoConvertido] FOREIGN KEY([PedidoIdConvertido])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_PedidoConvertido]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadComercial_Responsable] FOREIGN KEY([UsuarioResponsableId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [FK_OportunidadComercial_Responsable]
GO
ALTER TABLE [dbo].[OportunidadProducto]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadProducto_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[OportunidadProducto] CHECK CONSTRAINT [FK_OportunidadProducto_Oportunidad]
GO
ALTER TABLE [dbo].[OportunidadProducto]  WITH CHECK ADD  CONSTRAINT [FK_OportunidadProducto_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[OportunidadProducto] CHECK CONSTRAINT [FK_OportunidadProducto_Producto]
GO
ALTER TABLE [dbo].[OrdenPagoProveedor]  WITH CHECK ADD  CONSTRAINT [FK_OrdenPago_Proveedor] FOREIGN KEY([ProveedorId])
REFERENCES [dbo].[Proveedor] ([ProveedorId])
GO
ALTER TABLE [dbo].[OrdenPagoProveedor] CHECK CONSTRAINT [FK_OrdenPago_Proveedor]
GO
ALTER TABLE [dbo].[OrdenPagoProveedor]  WITH CHECK ADD  CONSTRAINT [FK_OrdenPago_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[OrdenPagoProveedor] CHECK CONSTRAINT [FK_OrdenPago_Usuario]
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenPagoAplicacion_Factura] FOREIGN KEY([FacturaProveedorId])
REFERENCES [dbo].[FacturaProveedor] ([FacturaProveedorId])
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion] CHECK CONSTRAINT [FK_OrdenPagoAplicacion_Factura]
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenPagoAplicacion_Orden] FOREIGN KEY([OrdenPagoProveedorId])
REFERENCES [dbo].[OrdenPagoProveedor] ([OrdenPagoProveedorId])
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion] CHECK CONSTRAINT [FK_OrdenPagoAplicacion_Orden]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_Estado] FOREIGN KEY([EstadoOrdenProduccionId])
REFERENCES [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_Estado]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_ListaMateriales] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_ListaMateriales]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_PlantillaFabricacion] FOREIGN KEY([PlantillaFabricacionId])
REFERENCES [dbo].[PlantillaFabricacion] ([PlantillaFabricacionId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_PlantillaFabricacion]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_Producto]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_RecorteProductoSugerido] FOREIGN KEY([RecorteProductoSugeridoId])
REFERENCES [dbo].[RecorteProductoSugerido] ([RecorteProductoSugeridoId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_RecorteProductoSugerido]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [FK_OrdenProduccion_TipoProduccion] FOREIGN KEY([TipoProduccionId])
REFERENCES [dbo].[TipoProduccion] ([TipoProduccionId])
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [FK_OrdenProduccion_TipoProduccion]
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPBOM_Detalle] FOREIGN KEY([OrdenProduccionDetalleId])
REFERENCES [dbo].[OrdenProduccionDetalle] ([OrdenProduccionDetalleId])
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot] CHECK CONSTRAINT [FK_OPBOM_Detalle]
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPBOM_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot] CHECK CONSTRAINT [FK_OPBOM_Insumo]
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_OPDetalle_Lista] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle] CHECK CONSTRAINT [FK_OPDetalle_Lista]
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_OPDetalle_OP] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle] CHECK CONSTRAINT [FK_OPDetalle_OP]
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_OPDetalle_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle] CHECK CONSTRAINT [FK_OPDetalle_Producto]
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_TEKA_OPDetalle_ProductoCircular] FOREIGN KEY([ProductoCircularId])
REFERENCES [dbo].[ProductoCircular] ([ProductoCircularId])
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle] CHECK CONSTRAINT [FK_TEKA_OPDetalle_ProductoCircular]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePlan]  WITH CHECK ADD FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePlan]  WITH CHECK ADD FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPRPS_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [FK_OPRPS_Color]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPRPS_Detalle] FOREIGN KEY([OrdenProduccionDetalleId])
REFERENCES [dbo].[OrdenProduccionDetalle] ([OrdenProduccionDetalleId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [FK_OPRPS_Detalle]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPRPS_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [FK_OPRPS_Insumo]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPRPS_Tipo] FOREIGN KEY([TipoRecorteId])
REFERENCES [dbo].[TipoRecorte] ([TipoRecorteId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [FK_OPRPS_Tipo]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [FK_OPRPS_Unidad] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [FK_OPRPS_Unidad]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [FK_ParametroCostoPrecio_TipoProducto] FOREIGN KEY([TipoProductoId])
REFERENCES [dbo].[TipoProducto] ([TipoProductoId])
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [FK_ParametroCostoPrecio_TipoProducto]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [FK_ParametroCostoPrecio_Usuario] FOREIGN KEY([UsuarioModificacionId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [FK_ParametroCostoPrecio_Usuario]
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria]  WITH CHECK ADD  CONSTRAINT [FK_ParametroCostoPrecioAuditoria_Parametro] FOREIGN KEY([ParametroCostoPrecioId])
REFERENCES [dbo].[ParametroCostoPrecio] ([ParametroCostoPrecioId])
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria] CHECK CONSTRAINT [FK_ParametroCostoPrecioAuditoria_Parametro]
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria]  WITH CHECK ADD  CONSTRAINT [FK_ParametroCostoPrecioAuditoria_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria] CHECK CONSTRAINT [FK_ParametroCostoPrecioAuditoria_Usuario]
GO
ALTER TABLE [dbo].[Pedido]  WITH CHECK ADD  CONSTRAINT [FK_Pedido_CanalVenta] FOREIGN KEY([CanalVentaId])
REFERENCES [dbo].[CanalVenta] ([CanalVentaId])
GO
ALTER TABLE [dbo].[Pedido] CHECK CONSTRAINT [FK_Pedido_CanalVenta]
GO
ALTER TABLE [dbo].[Pedido]  WITH CHECK ADD  CONSTRAINT [FK_Pedido_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[Pedido] CHECK CONSTRAINT [FK_Pedido_Cliente]
GO
ALTER TABLE [dbo].[Pedido]  WITH CHECK ADD  CONSTRAINT [FK_Pedido_EstadoPedido] FOREIGN KEY([EstadoPedidoId])
REFERENCES [dbo].[EstadoPedido] ([EstadoPedidoId])
GO
ALTER TABLE [dbo].[Pedido] CHECK CONSTRAINT [FK_Pedido_EstadoPedido]
GO
ALTER TABLE [dbo].[PlantillaFabricacion]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaFabricacion_BOM] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[PlantillaFabricacion] CHECK CONSTRAINT [FK_PlantillaFabricacion_BOM]
GO
ALTER TABLE [dbo].[PlantillaFabricacion]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaFabricacion_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[PlantillaFabricacion] CHECK CONSTRAINT [FK_PlantillaFabricacion_Producto]
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza]  WITH CHECK ADD  CONSTRAINT [FK_CortePieza_Pieza] FOREIGN KEY([PlantillaFabricacionPiezaId])
REFERENCES [dbo].[PlantillaFabricacionPieza] ([PlantillaFabricacionPiezaId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza] CHECK CONSTRAINT [FK_CortePieza_Pieza]
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza]  WITH CHECK ADD  CONSTRAINT [FK_CortePieza_Plan] FOREIGN KEY([PlantillaFabricacionPlanCorteId])
REFERENCES [dbo].[PlantillaFabricacionPlanCorte] ([PlantillaFabricacionPlanCorteId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza] CHECK CONSTRAINT [FK_CortePieza_Plan]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaPieza_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza] CHECK CONSTRAINT [FK_PlantillaPieza_Insumo]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaPieza_Plantilla] FOREIGN KEY([PlantillaFabricacionId])
REFERENCES [dbo].[PlantillaFabricacion] ([PlantillaFabricacionId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza] CHECK CONSTRAINT [FK_PlantillaPieza_Plantilla]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte]  WITH CHECK ADD  CONSTRAINT [FK_PlanCorte_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte] CHECK CONSTRAINT [FK_PlanCorte_Insumo]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte]  WITH CHECK ADD  CONSTRAINT [FK_PlanCorte_Plantilla] FOREIGN KEY([PlantillaFabricacionId])
REFERENCES [dbo].[PlantillaFabricacion] ([PlantillaFabricacionId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte] CHECK CONSTRAINT [FK_PlanCorte_Plantilla]
GO
ALTER TABLE [dbo].[PlantillaFabricacionRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [FK_RecortePrevisto_Plan] FOREIGN KEY([PlantillaFabricacionPlanCorteId])
REFERENCES [dbo].[PlantillaFabricacionPlanCorte] ([PlantillaFabricacionPlanCorteId])
GO
ALTER TABLE [dbo].[PlantillaFabricacionRecortePrevisto] CHECK CONSTRAINT [FK_RecortePrevisto_Plan]
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaOPDetalle_Cab] FOREIGN KEY([PlantillaOrdenProduccionId])
REFERENCES [dbo].[PlantillaOrdenProduccion] ([PlantillaOrdenProduccionId])
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle] CHECK CONSTRAINT [FK_PlantillaOPDetalle_Cab]
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_PlantillaOPDetalle_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle] CHECK CONSTRAINT [FK_PlantillaOPDetalle_Producto]
GO
ALTER TABLE [dbo].[PrecioVenta]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVenta_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[PrecioVenta] CHECK CONSTRAINT [FK_PrecioVenta_Producto]
GO
ALTER TABLE [dbo].[PrecioVenta]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVenta_UsuarioRegistro] FOREIGN KEY([UsuarioRegistroId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[PrecioVenta] CHECK CONSTRAINT [FK_PrecioVenta_UsuarioRegistro]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculo_Lista] FOREIGN KEY([ListaMaterialesId])
REFERENCES [dbo].[ListaMateriales] ([ListaMaterialesId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [FK_PrecioVentaCalculo_Lista]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculo_PrecioVenta] FOREIGN KEY([PrecioVentaId])
REFERENCES [dbo].[PrecioVenta] ([PrecioVentaId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [FK_PrecioVentaCalculo_PrecioVenta]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculo_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [FK_PrecioVentaCalculo_Usuario]
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculoInsumo_Calculo] FOREIGN KEY([PrecioVentaCalculoId])
REFERENCES [dbo].[PrecioVentaCalculo] ([PrecioVentaCalculoId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo] CHECK CONSTRAINT [FK_PrecioVentaCalculoInsumo_Calculo]
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculoInsumo_Compra] FOREIGN KEY([CompraProveedorId])
REFERENCES [dbo].[CompraProveedor] ([CompraProveedorId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo] CHECK CONSTRAINT [FK_PrecioVentaCalculoInsumo_Compra]
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCalculoInsumo_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo] CHECK CONSTRAINT [FK_PrecioVentaCalculoInsumo_Insumo]
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCorreccion_Precio] FOREIGN KEY([PrecioVentaId])
REFERENCES [dbo].[PrecioVenta] ([PrecioVentaId])
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria] CHECK CONSTRAINT [FK_PrecioVentaCorreccion_Precio]
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVentaCorreccion_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria] CHECK CONSTRAINT [FK_PrecioVentaCorreccion_Usuario]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoComercial_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [FK_PresupuestoComercial_Cliente]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoComercial_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [FK_PresupuestoComercial_Oportunidad]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoComercial_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [FK_PresupuestoComercial_Pedido]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoComercial_Responsable] FOREIGN KEY([UsuarioResponsableId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [FK_PresupuestoComercial_Responsable]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoDetalle_Cabecera] FOREIGN KEY([PresupuestoComercialId])
REFERENCES [dbo].[PresupuestoComercial] ([PresupuestoComercialId])
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] CHECK CONSTRAINT [FK_PresupuestoDetalle_Cabecera]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoDetalle_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] CHECK CONSTRAINT [FK_PresupuestoDetalle_Producto]
GO
ALTER TABLE [dbo].[PresupuestoComercialHistorial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoHistorial_Presupuesto] FOREIGN KEY([PresupuestoComercialId])
REFERENCES [dbo].[PresupuestoComercial] ([PresupuestoComercialId])
GO
ALTER TABLE [dbo].[PresupuestoComercialHistorial] CHECK CONSTRAINT [FK_PresupuestoHistorial_Presupuesto]
GO
ALTER TABLE [dbo].[PresupuestoComercialHistorial]  WITH CHECK ADD  CONSTRAINT [FK_PresupuestoHistorial_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[PresupuestoComercialHistorial] CHECK CONSTRAINT [FK_PresupuestoHistorial_Usuario]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [FK_Producto_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [FK_Producto_Color]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [FK_Producto_MotivoInactivacion] FOREIGN KEY([MotivoInactivacionId])
REFERENCES [dbo].[MotivoInactivacion] ([MotivoInactivacionId])
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [FK_Producto_MotivoInactivacion]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [FK_Producto_NombreProductoCatalogo] FOREIGN KEY([NombreProductoId])
REFERENCES [dbo].[NombreProductoCatalogo] ([NombreProductoId])
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [FK_Producto_NombreProductoCatalogo]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [FK_Producto_TipoProducto] FOREIGN KEY([TipoProductoId])
REFERENCES [dbo].[TipoProducto] ([TipoProductoId])
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [FK_Producto_TipoProducto]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [FK_Producto_UnidadMedida] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [FK_Producto_UnidadMedida]
GO
ALTER TABLE [dbo].[ProductoCircular]  WITH CHECK ADD  CONSTRAINT [FK_TEKA_ProductoCircular_Modelo] FOREIGN KEY([ProductoModeloReferenciaId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoCircular] CHECK CONSTRAINT [FK_TEKA_ProductoCircular_Modelo]
GO
ALTER TABLE [dbo].[ProductoCircular]  WITH CHECK ADD  CONSTRAINT [FK_TEKA_ProductoCircular_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoCircular] CHECK CONSTRAINT [FK_TEKA_ProductoCircular_Producto]
GO
ALTER TABLE [dbo].[ProductoCircular]  WITH CHECK ADD  CONSTRAINT [FK_TEKA_ProductoCircular_Sugerido] FOREIGN KEY([RecorteProductoSugeridoId])
REFERENCES [dbo].[RecorteProductoSugerido] ([RecorteProductoSugeridoId])
GO
ALTER TABLE [dbo].[ProductoCircular] CHECK CONSTRAINT [FK_TEKA_ProductoCircular_Sugerido]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline]  WITH CHECK ADD  CONSTRAINT [FK_ProductoDisponibilidadOnline_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] CHECK CONSTRAINT [FK_ProductoDisponibilidadOnline_Deposito]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline]  WITH CHECK ADD  CONSTRAINT [FK_ProductoDisponibilidadOnline_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] CHECK CONSTRAINT [FK_ProductoDisponibilidadOnline_Producto]
GO
ALTER TABLE [dbo].[ProductoFichaTecnica]  WITH CHECK ADD  CONSTRAINT [FK_ProductoFichaTecnica_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoFichaTecnica] CHECK CONSTRAINT [FK_ProductoFichaTecnica_Producto]
GO
ALTER TABLE [dbo].[ProductoImagen]  WITH CHECK ADD  CONSTRAINT [FK_ProductoImagen_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoImagen] CHECK CONSTRAINT [FK_ProductoImagen_Producto]
GO
ALTER TABLE [dbo].[ProductoModelo3D]  WITH CHECK ADD  CONSTRAINT [FK_ProductoModelo3D_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoModelo3D] CHECK CONSTRAINT [FK_ProductoModelo3D_Producto]
GO
ALTER TABLE [dbo].[ProductoPublicacion]  WITH CHECK ADD  CONSTRAINT [FK_ProductoPublicacion_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ProductoPublicacion] CHECK CONSTRAINT [FK_ProductoPublicacion_Producto]
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion]  WITH CHECK ADD FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_Color]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_EstadoRecorte] FOREIGN KEY([EstadoRecorteId])
REFERENCES [dbo].[EstadoRecorte] ([EstadoRecorteId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_EstadoRecorte]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_Insumo]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_OrdenProduccion] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_OrdenProduccion]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_TipoRecorte] FOREIGN KEY([TipoRecorteId])
REFERENCES [dbo].[TipoRecorte] ([TipoRecorteId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_TipoRecorte]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [FK_Recorte_UnidadMedida] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [FK_Recorte_UnidadMedida]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_Anterior] FOREIGN KEY([VersionAnteriorId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_Anterior]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_Color]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_Decisor] FOREIGN KEY([UsuarioDecisionId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_Decisor]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_Generacion] FOREIGN KEY([RecorteGeneracionId])
REFERENCES [dbo].[RecorteGeneracion] ([RecorteGeneracionId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_Generacion]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_Material] FOREIGN KEY([MaterialInsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_Material]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [FK_RecorteDiseno_TipoProducto] FOREIGN KEY([TipoProductoId])
REFERENCES [dbo].[TipoProducto] ([TipoProductoId])
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [FK_RecorteDiseno_TipoProducto]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion]  WITH CHECK ADD  CONSTRAINT [FK_RecorteAsignacion_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] CHECK CONSTRAINT [FK_RecorteAsignacion_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion]  WITH CHECK ADD  CONSTRAINT [FK_RecorteAsignacion_PiezaDiseno] FOREIGN KEY([RecorteDisenoId], [RecorteDisenoPiezaId])
REFERENCES [dbo].[RecorteDisenoPieza] ([RecorteDisenoId], [RecorteDisenoPiezaId])
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] CHECK CONSTRAINT [FK_RecorteAsignacion_PiezaDiseno]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion]  WITH CHECK ADD  CONSTRAINT [FK_RecorteAsignacion_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] CHECK CONSTRAINT [FK_RecorteAsignacion_Recorte]
GO
ALTER TABLE [dbo].[RecorteDisenoCosto]  WITH CHECK ADD  CONSTRAINT [FK_RecorteCosto_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoCosto] CHECK CONSTRAINT [FK_RecorteCosto_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoCosto]  WITH CHECK ADD  CONSTRAINT [FK_RecorteCosto_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RecorteDisenoCosto] CHECK CONSTRAINT [FK_RecorteCosto_Insumo]
GO
ALTER TABLE [dbo].[RecorteDisenoHistorial]  WITH CHECK ADD  CONSTRAINT [FK_RecorteHistorial_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoHistorial] CHECK CONSTRAINT [FK_RecorteHistorial_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoHistorial]  WITH CHECK ADD  CONSTRAINT [FK_RecorteHistorial_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RecorteDisenoHistorial] CHECK CONSTRAINT [FK_RecorteHistorial_Usuario]
GO
ALTER TABLE [dbo].[RecorteDisenoImagen]  WITH CHECK ADD  CONSTRAINT [FK_RecorteImagen_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoImagen] CHECK CONSTRAINT [FK_RecorteImagen_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo]  WITH CHECK ADD  CONSTRAINT [FK_RecorteInsumo_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo] CHECK CONSTRAINT [FK_RecorteInsumo_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo]  WITH CHECK ADD  CONSTRAINT [FK_RecorteInsumo_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo] CHECK CONSTRAINT [FK_RecorteInsumo_Insumo]
GO
ALTER TABLE [dbo].[RecorteDisenoPieza]  WITH CHECK ADD  CONSTRAINT [FK_RecortePieza_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[RecorteDisenoPieza] CHECK CONSTRAINT [FK_RecortePieza_Color]
GO
ALTER TABLE [dbo].[RecorteDisenoPieza]  WITH CHECK ADD  CONSTRAINT [FK_RecortePieza_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoPieza] CHECK CONSTRAINT [FK_RecortePieza_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoPieza]  WITH CHECK ADD  CONSTRAINT [FK_RecortePieza_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RecorteDisenoPieza] CHECK CONSTRAINT [FK_RecortePieza_Insumo]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion]  WITH CHECK ADD  CONSTRAINT [FK_RecorteValidacion_Diseno] FOREIGN KEY([RecorteDisenoId])
REFERENCES [dbo].[RecorteDiseno] ([RecorteDisenoId])
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion] CHECK CONSTRAINT [FK_RecorteValidacion_Diseno]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacionMotivo]  WITH CHECK ADD  CONSTRAINT [FK_RecorteMotivo_Validacion] FOREIGN KEY([RecorteDisenoValidacionId])
REFERENCES [dbo].[RecorteDisenoValidacion] ([RecorteDisenoValidacionId])
GO
ALTER TABLE [dbo].[RecorteDisenoValidacionMotivo] CHECK CONSTRAINT [FK_RecorteMotivo_Validacion]
GO
ALTER TABLE [dbo].[RecorteGeneracion]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGeneracion_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RecorteGeneracion] CHECK CONSTRAINT [FK_RecorteGeneracion_Usuario]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Color] FOREIGN KEY([ColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Color]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Deposito2B] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Deposito2B]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Estado] FOREIGN KEY([EstadoRecorteId])
REFERENCES [dbo].[EstadoRecorte] ([EstadoRecorteId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Estado]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Generacion] FOREIGN KEY([RecorteGeneracionId])
REFERENCES [dbo].[RecorteGeneracion] ([RecorteGeneracionId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Generacion]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Insumo]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_InsumoColor2B] FOREIGN KEY([InsumoColorId])
REFERENCES [dbo].[Color] ([ColorId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_InsumoColor2B]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Recorte]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_TipoInsumo2B] FOREIGN KEY([TipoInsumoId])
REFERENCES [dbo].[TipoInsumo] ([TipoInsumoId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_TipoInsumo2B]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [FK_RecorteGenInv_Unidad2B] FOREIGN KEY([UnidadMedidaId])
REFERENCES [dbo].[UnidadMedida] ([UnidadMedidaId])
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [FK_RecorteGenInv_Unidad2B]
GO
ALTER TABLE [dbo].[RecorteProductoSugerido]  WITH CHECK ADD  CONSTRAINT [FK_RecorteProductoSugerido_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[RecorteProductoSugerido] CHECK CONSTRAINT [FK_RecorteProductoSugerido_Producto]
GO
ALTER TABLE [dbo].[RecorteProductoSugerido]  WITH CHECK ADD  CONSTRAINT [FK_RecorteProductoSugerido_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[RecorteProductoSugerido] CHECK CONSTRAINT [FK_RecorteProductoSugerido_Recorte]
GO
ALTER TABLE [dbo].[RecorteProductoSugerido]  WITH CHECK ADD  CONSTRAINT [FK_RecorteProductoSugerido_Sugerencia] FOREIGN KEY([SugerenciaRecorteId])
REFERENCES [dbo].[SugerenciaRecorte] ([SugerenciaRecorteId])
GO
ALTER TABLE [dbo].[RecorteProductoSugerido] CHECK CONSTRAINT [FK_RecorteProductoSugerido_Sugerencia]
GO
ALTER TABLE [dbo].[RecuperacionPassword]  WITH CHECK ADD  CONSTRAINT [FK_RecuperacionPassword_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RecuperacionPassword] CHECK CONSTRAINT [FK_RecuperacionPassword_Usuario]
GO
ALTER TABLE [dbo].[Remito]  WITH CHECK ADD  CONSTRAINT [FK_Remito_Cliente] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Cliente] ([ClienteId])
GO
ALTER TABLE [dbo].[Remito] CHECK CONSTRAINT [FK_Remito_Cliente]
GO
ALTER TABLE [dbo].[Remito]  WITH CHECK ADD  CONSTRAINT [FK_Remito_Pedido] FOREIGN KEY([PedidoId])
REFERENCES [dbo].[Pedido] ([PedidoId])
GO
ALTER TABLE [dbo].[Remito] CHECK CONSTRAINT [FK_Remito_Pedido]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor]  WITH CHECK ADD  CONSTRAINT [FK_RemitoProveedor_Compra] FOREIGN KEY([CompraProveedorId])
REFERENCES [dbo].[CompraProveedor] ([CompraProveedorId])
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] CHECK CONSTRAINT [FK_RemitoProveedor_Compra]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor]  WITH CHECK ADD  CONSTRAINT [FK_RemitoProveedor_UsuarioConfirma] FOREIGN KEY([UsuarioConfirmacionId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] CHECK CONSTRAINT [FK_RemitoProveedor_UsuarioConfirma]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor]  WITH CHECK ADD  CONSTRAINT [FK_RemitoProveedor_UsuarioRegistro] FOREIGN KEY([UsuarioRegistroId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] CHECK CONSTRAINT [FK_RemitoProveedor_UsuarioRegistro]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_RemitoDetalle_Encabezado] FOREIGN KEY([RemitoRecepcionProveedorId])
REFERENCES [dbo].[RemitoRecepcionProveedor] ([RemitoRecepcionProveedorId])
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle] CHECK CONSTRAINT [FK_RemitoDetalle_Encabezado]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [FK_RemitoDetalle_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle] CHECK CONSTRAINT [FK_RemitoDetalle_Insumo]
GO
ALTER TABLE [dbo].[ResultadoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ResultadoProduccion_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[ResultadoProduccion] CHECK CONSTRAINT [FK_ResultadoProduccion_Deposito]
GO
ALTER TABLE [dbo].[ResultadoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ResultadoProduccion_Orden] FOREIGN KEY([OrdenProduccionId])
REFERENCES [dbo].[OrdenProduccion] ([OrdenProduccionId])
GO
ALTER TABLE [dbo].[ResultadoProduccion] CHECK CONSTRAINT [FK_ResultadoProduccion_Orden]
GO
ALTER TABLE [dbo].[ResultadoProduccion]  WITH CHECK ADD  CONSTRAINT [FK_ResultadoProduccion_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[ResultadoProduccion] CHECK CONSTRAINT [FK_ResultadoProduccion_Producto]
GO
ALTER TABLE [dbo].[RolPermiso]  WITH CHECK ADD  CONSTRAINT [FK_RolPermiso_Menu] FOREIGN KEY([MenuId])
REFERENCES [dbo].[Menu] ([MenuId])
GO
ALTER TABLE [dbo].[RolPermiso] CHECK CONSTRAINT [FK_RolPermiso_Menu]
GO
ALTER TABLE [dbo].[RolPermiso]  WITH CHECK ADD  CONSTRAINT [FK_RolPermiso_Permiso] FOREIGN KEY([PermisoId])
REFERENCES [dbo].[Permiso] ([PermisoId])
GO
ALTER TABLE [dbo].[RolPermiso] CHECK CONSTRAINT [FK_RolPermiso_Permiso]
GO
ALTER TABLE [dbo].[RolPermiso]  WITH CHECK ADD  CONSTRAINT [FK_RolPermiso_Rol] FOREIGN KEY([RolId])
REFERENCES [dbo].[Rol] ([RolId])
GO
ALTER TABLE [dbo].[RolPermiso] CHECK CONSTRAINT [FK_RolPermiso_Rol]
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_SolicitudDetalle_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle] CHECK CONSTRAINT [FK_SolicitudDetalle_Insumo]
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle]  WITH CHECK ADD  CONSTRAINT [FK_SolicitudDetalle_Solicitud] FOREIGN KEY([SolicitudCotizacionId])
REFERENCES [dbo].[SolicitudCotizacionProveedor] ([SolicitudCotizacionId])
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle] CHECK CONSTRAINT [FK_SolicitudDetalle_Solicitud]
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor]  WITH CHECK ADD  CONSTRAINT [FK_SolicitudCotizacion_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor] CHECK CONSTRAINT [FK_SolicitudCotizacion_Usuario]
GO
ALTER TABLE [dbo].[StockInsumo]  WITH CHECK ADD  CONSTRAINT [FK_StockInsumo_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[StockInsumo] CHECK CONSTRAINT [FK_StockInsumo_Deposito]
GO
ALTER TABLE [dbo].[StockInsumo]  WITH CHECK ADD  CONSTRAINT [FK_StockInsumo_Insumo] FOREIGN KEY([InsumoId])
REFERENCES [dbo].[Insumo] ([InsumoId])
GO
ALTER TABLE [dbo].[StockInsumo] CHECK CONSTRAINT [FK_StockInsumo_Insumo]
GO
ALTER TABLE [dbo].[StockProducto]  WITH CHECK ADD  CONSTRAINT [FK_StockProducto_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[StockProducto] CHECK CONSTRAINT [FK_StockProducto_Deposito]
GO
ALTER TABLE [dbo].[StockProducto]  WITH CHECK ADD  CONSTRAINT [FK_StockProducto_Producto] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Producto] ([ProductoId])
GO
ALTER TABLE [dbo].[StockProducto] CHECK CONSTRAINT [FK_StockProducto_Producto]
GO
ALTER TABLE [dbo].[StockRecorte]  WITH CHECK ADD  CONSTRAINT [FK_StockRecorte_Deposito] FOREIGN KEY([DepositoId])
REFERENCES [dbo].[Deposito] ([DepositoId])
GO
ALTER TABLE [dbo].[StockRecorte] CHECK CONSTRAINT [FK_StockRecorte_Deposito]
GO
ALTER TABLE [dbo].[StockRecorte]  WITH CHECK ADD  CONSTRAINT [FK_StockRecorte_Recorte] FOREIGN KEY([RecorteId])
REFERENCES [dbo].[Recorte] ([RecorteId])
GO
ALTER TABLE [dbo].[StockRecorte] CHECK CONSTRAINT [FK_StockRecorte_Recorte]
GO
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce]  WITH CHECK ADD  CONSTRAINT [FK_TokenRecuperacionCliente_Cuenta] FOREIGN KEY([CuentaClienteEcommerceId])
REFERENCES [dbo].[CuentaClienteEcommerce] ([CuentaClienteEcommerceId])
GO
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce] CHECK CONSTRAINT [FK_TokenRecuperacionCliente_Cuenta]
GO
ALTER TABLE [dbo].[Usuario]  WITH CHECK ADD  CONSTRAINT [FK_Usuario_MotivoInactivacionUsuario] FOREIGN KEY([MotivoInactivacionUsuarioId])
REFERENCES [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId])
GO
ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [FK_Usuario_MotivoInactivacionUsuario]
GO
ALTER TABLE [dbo].[UsuarioRol]  WITH CHECK ADD  CONSTRAINT [FK_UsuarioRol_Rol] FOREIGN KEY([RolId])
REFERENCES [dbo].[Rol] ([RolId])
GO
ALTER TABLE [dbo].[UsuarioRol] CHECK CONSTRAINT [FK_UsuarioRol_Rol]
GO
ALTER TABLE [dbo].[UsuarioRol]  WITH CHECK ADD  CONSTRAINT [FK_UsuarioRol_Usuario] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuario] ([UsuarioId])
GO
ALTER TABLE [dbo].[UsuarioRol] CHECK CONSTRAINT [FK_UsuarioRol_Usuario]
GO
ALTER TABLE [dbo].[VisitaOportunidad]  WITH CHECK ADD  CONSTRAINT [FK_VisitaOportunidad_Oportunidad] FOREIGN KEY([OportunidadComercialId])
REFERENCES [dbo].[OportunidadComercial] ([OportunidadComercialId])
GO
ALTER TABLE [dbo].[VisitaOportunidad] CHECK CONSTRAINT [FK_VisitaOportunidad_Oportunidad]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [CK_ActividadComercial_Estado] CHECK  (([Estado]='Cancelada' OR [Estado]='Realizada' OR [Estado]='Pendiente'))
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [CK_ActividadComercial_Estado]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [CK_ActividadComercial_Resultado] CHECK  (([Estado]<>'Realizada' OR [FechaRealizacion] IS NOT NULL AND nullif(ltrim(rtrim([Resultado])),'') IS NOT NULL))
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [CK_ActividadComercial_Resultado]
GO
ALTER TABLE [dbo].[ActividadComercial]  WITH CHECK ADD  CONSTRAINT [CK_ActividadComercial_Tipo] CHECK  (([Tipo]='Otro' OR [Tipo]='Seguimiento' OR [Tipo]='Visita' OR [Tipo]='Reunion' OR [Tipo]='Email' OR [Tipo]='WhatsApp' OR [Tipo]='Llamada'))
GO
ALTER TABLE [dbo].[ActividadComercial] CHECK CONSTRAINT [CK_ActividadComercial_Tipo]
GO
ALTER TABLE [dbo].[AplicacionCobro]  WITH CHECK ADD  CONSTRAINT [CK_AplicacionCobro_Importe] CHECK  (([ImporteAplicado]>(0)))
GO
ALTER TABLE [dbo].[AplicacionCobro] CHECK CONSTRAINT [CK_AplicacionCobro_Importe]
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial]  WITH CHECK ADD  CONSTRAINT [CK_AuditoriaAsignacionComercial_Cupos] CHECK  (([CupoOnlineAnterior]>=(0) AND [CupoOnlineNuevo]>=(0)))
GO
ALTER TABLE [dbo].[AuditoriaAsignacionComercial] CHECK CONSTRAINT [CK_AuditoriaAsignacionComercial_Cupos]
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_AudCorreccionRemito_Cantidades] CHECK  (([CantidadAnterior]>=(0) AND [CantidadNueva]>=(0) AND [Diferencia]<>(0)))
GO
ALTER TABLE [dbo].[AuditoriaCorreccionRemitoProveedor] CHECK CONSTRAINT [CK_TEKA_AudCorreccionRemito_Cantidades]
GO
ALTER TABLE [dbo].[AuditoriaEdicionPedido]  WITH CHECK ADD  CONSTRAINT [CK_AuditoriaEdicionPedido_Operacion] CHECK  (([Operacion]='Eliminar' OR [Operacion]='Modificar' OR [Operacion]='Agregar'))
GO
ALTER TABLE [dbo].[AuditoriaEdicionPedido] CHECK CONSTRAINT [CK_AuditoriaEdicionPedido_Operacion]
GO
ALTER TABLE [dbo].[BancoConciliacion]  WITH CHECK ADD  CONSTRAINT [CK_BancoConc_Metodo] CHECK  (([Metodo]='Automatico' OR [Metodo]='Manual'))
GO
ALTER TABLE [dbo].[BancoConciliacion] CHECK CONSTRAINT [CK_BancoConc_Metodo]
GO
ALTER TABLE [dbo].[BancoImportacion]  WITH CHECK ADD  CONSTRAINT [CK_BancoImport_Estado] CHECK  (([Estado]='Finalizada' OR [Estado]='Abierta'))
GO
ALTER TABLE [dbo].[BancoImportacion] CHECK CONSTRAINT [CK_BancoImport_Estado]
GO
ALTER TABLE [dbo].[BancoImportacion]  WITH CHECK ADD  CONSTRAINT [CK_BancoImport_Huella] CHECK  ((len([HuellaArchivo])=(64) AND NOT [HuellaArchivo] like '%[^0-9A-Fa-f]%'))
GO
ALTER TABLE [dbo].[BancoImportacion] CHECK CONSTRAINT [CK_BancoImport_Huella]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_BancoMov_Clave] CHECK  ((len([ClaveMovimiento])=(64) AND NOT [ClaveMovimiento] like '%[^0-9A-Fa-f]%'))
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [CK_BancoMov_Clave]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_BancoMov_Estado] CHECK  (([Estado]='Ignorado' OR [Estado]='Conciliado' OR [Estado]='Pendiente'))
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [CK_BancoMov_Estado]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_BancoMov_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [CK_BancoMov_Importe]
GO
ALTER TABLE [dbo].[BancoMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_BancoMov_Tipo] CHECK  (([Tipo]='Egreso' OR [Tipo]='Ingreso'))
GO
ALTER TABLE [dbo].[BancoMovimiento] CHECK CONSTRAINT [CK_BancoMov_Tipo]
GO
ALTER TABLE [dbo].[CajaArqueo]  WITH CHECK ADD  CONSTRAINT [CK_CajaArqueo_Contado] CHECK  (([EfectivoContado]>=(0)))
GO
ALTER TABLE [dbo].[CajaArqueo] CHECK CONSTRAINT [CK_CajaArqueo_Contado]
GO
ALTER TABLE [dbo].[CajaConcepto]  WITH CHECK ADD  CONSTRAINT [CK_CajaConcepto_Codigo] CHECK  ((len(ltrim(rtrim([Codigo])))>(0)))
GO
ALTER TABLE [dbo].[CajaConcepto] CHECK CONSTRAINT [CK_CajaConcepto_Codigo]
GO
ALTER TABLE [dbo].[CajaConcepto]  WITH CHECK ADD  CONSTRAINT [CK_CajaConcepto_Nombre] CHECK  ((len(ltrim(rtrim([Nombre])))>(0)))
GO
ALTER TABLE [dbo].[CajaConcepto] CHECK CONSTRAINT [CK_CajaConcepto_Nombre]
GO
ALTER TABLE [dbo].[CajaConcepto]  WITH CHECK ADD  CONSTRAINT [CK_CajaConcepto_Tipo] CHECK  (([Tipo]='Reposicion' OR [Tipo]='Retiro' OR [Tipo]='Gasto' OR [Tipo]='IngresoManual'))
GO
ALTER TABLE [dbo].[CajaConcepto] CHECK CONSTRAINT [CK_CajaConcepto_Tipo]
GO
ALTER TABLE [dbo].[CajaConfiguracion]  WITH CHECK ADD  CONSTRAINT [CK_CajaConfiguracion_Fisica] CHECK  (([EsFisica]=(1) AND [FondoFijoObjetivo] IS NOT NULL OR [EsFisica]=(0) AND [FondoFijoObjetivo] IS NULL))
GO
ALTER TABLE [dbo].[CajaConfiguracion] CHECK CONSTRAINT [CK_CajaConfiguracion_Fisica]
GO
ALTER TABLE [dbo].[CajaConfiguracion]  WITH CHECK ADD  CONSTRAINT [CK_CajaConfiguracion_Fondo] CHECK  (([FondoFijoObjetivo] IS NULL OR [FondoFijoObjetivo]>=(0)))
GO
ALTER TABLE [dbo].[CajaConfiguracion] CHECK CONSTRAINT [CK_CajaConfiguracion_Fondo]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_CajaMovimiento_Cobro] CHECK  (([Tipo]='IngresoCobro' AND [CobroId] IS NOT NULL OR [Tipo]<>'IngresoCobro' AND [CobroId] IS NULL))
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [CK_CajaMovimiento_Cobro]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_CajaMovimiento_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [CK_CajaMovimiento_Importe]
GO
ALTER TABLE [dbo].[CajaMovimiento]  WITH CHECK ADD  CONSTRAINT [CK_CajaMovimiento_Tipo] CHECK  (([Tipo]='IngresoCobro' OR [Tipo]='Reposicion' OR [Tipo]='Retiro' OR [Tipo]='Gasto' OR [Tipo]='IngresoManual'))
GO
ALTER TABLE [dbo].[CajaMovimiento] CHECK CONSTRAINT [CK_CajaMovimiento_Tipo]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [CK_CajaSesion_Cierre] CHECK  (([Estado]='Abierta' AND [FechaCierre] IS NULL AND [UsuarioCierreId] IS NULL OR [Estado]='Cerrada' AND [FechaCierre] IS NOT NULL AND [UsuarioCierreId] IS NOT NULL AND [EfectivoEsperadoCierre] IS NOT NULL AND [EfectivoContadoCierre] IS NOT NULL AND [DiferenciaCierre] IS NOT NULL))
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [CK_CajaSesion_Cierre]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [CK_CajaSesion_Estado] CHECK  (([Estado]='Cerrada' OR [Estado]='Abierta'))
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [CK_CajaSesion_Estado]
GO
ALTER TABLE [dbo].[CajaSesion]  WITH CHECK ADD  CONSTRAINT [CK_CajaSesion_Importes] CHECK  (([FondoObjetivoApertura]>=(0) AND [EfectivoInicial]>=(0) AND ([EfectivoContadoCierre] IS NULL OR [EfectivoContadoCierre]>=(0))))
GO
ALTER TABLE [dbo].[CajaSesion] CHECK CONSTRAINT [CK_CajaSesion_Importes]
GO
ALTER TABLE [dbo].[Carrito]  WITH CHECK ADD  CONSTRAINT [CK_Carrito_Estado] CHECK  (([Estado]='Expirado' OR [Estado]='Convertido' OR [Estado]='Abandonado' OR [Estado]='Activo'))
GO
ALTER TABLE [dbo].[Carrito] CHECK CONSTRAINT [CK_Carrito_Estado]
GO
ALTER TABLE [dbo].[CompraProveedor]  WITH CHECK ADD  CONSTRAINT [CK_CompraProveedor_Estado] CHECK  (([Estado]='Cancelada' OR [Estado]='ConDiferencias' OR [Estado]='Recibida' OR [Estado]='Registrada'))
GO
ALTER TABLE [dbo].[CompraProveedor] CHECK CONSTRAINT [CK_CompraProveedor_Estado]
GO
ALTER TABLE [dbo].[CompraProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [CK_CompraDetalle_Cantidad] CHECK  (([CantidadComprada]>(0)))
GO
ALTER TABLE [dbo].[CompraProveedorDetalle] CHECK CONSTRAINT [CK_CompraDetalle_Cantidad]
GO
ALTER TABLE [dbo].[CompraProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [CK_CompraDetalle_Precio] CHECK  (([PrecioUnitario]>=(0)))
GO
ALTER TABLE [dbo].[CompraProveedorDetalle] CHECK CONSTRAINT [CK_CompraDetalle_Precio]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [CK_Comprobante_Importes] CHECK  (([ImporteNoGravado]>=(0) AND [ImporteExento]>=(0) AND [ImporteNetoGravado]>=(0) AND [ImporteIVA]>=(0) AND [ImporteTributos]>=(0) AND [ImporteTotal]>=(0)))
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [CK_Comprobante_Importes]
GO
ALTER TABLE [dbo].[Comprobante]  WITH CHECK ADD  CONSTRAINT [CK_Comprobante_PuntoVenta] CHECK  (([PuntoVenta]>(0)))
GO
ALTER TABLE [dbo].[Comprobante] CHECK CONSTRAINT [CK_Comprobante_PuntoVenta]
GO
ALTER TABLE [dbo].[ConsumoProduccion]  WITH CHECK ADD  CONSTRAINT [CK_ConsumoProduccion_Cantidad] CHECK  (([CantidadConsumida]>(0)))
GO
ALTER TABLE [dbo].[ConsumoProduccion] CHECK CONSTRAINT [CK_ConsumoProduccion_Cantidad]
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion]  WITH CHECK ADD  CONSTRAINT [CK_ConsumoRecorteProduccion_Cantidad] CHECK  (([CantidadConsumida]>(0)))
GO
ALTER TABLE [dbo].[ConsumoRecorteProduccion] CHECK CONSTRAINT [CK_ConsumoRecorteProduccion_Cantidad]
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA]  WITH CHECK ADD  CONSTRAINT [CK_CuentaBancaria_CBU] CHECK  (([CBU] IS NULL OR len([CBU])=(22) AND NOT [CBU] like '%[^0-9]%'))
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA] CHECK CONSTRAINT [CK_CuentaBancaria_CBU]
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA]  WITH CHECK ADD  CONSTRAINT [CK_CuentaBancaria_Nombre] CHECK  ((len(ltrim(rtrim([Nombre])))>(0)))
GO
ALTER TABLE [dbo].[CuentaBancariaTEKA] CHECK CONSTRAINT [CK_CuentaBancaria_Nombre]
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce]  WITH CHECK ADD  CONSTRAINT [CK_CuentaCliente_EmailNoVacio] CHECK  ((len(ltrim(rtrim([EmailNormalizado])))>(0)))
GO
ALTER TABLE [dbo].[CuentaClienteEcommerce] CHECK CONSTRAINT [CK_CuentaCliente_EmailNoVacio]
GO
ALTER TABLE [dbo].[DetalleCarrito]  WITH CHECK ADD  CONSTRAINT [CK_DetalleCarrito_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[DetalleCarrito] CHECK CONSTRAINT [CK_DetalleCarrito_Cantidad]
GO
ALTER TABLE [dbo].[DetalleCarrito]  WITH CHECK ADD  CONSTRAINT [CK_DetalleCarrito_Precio] CHECK  (([PrecioReferencia] IS NULL OR [PrecioReferencia]>=(0)))
GO
ALTER TABLE [dbo].[DetalleCarrito] CHECK CONSTRAINT [CK_DetalleCarrito_Precio]
GO
ALTER TABLE [dbo].[DetalleComprobante]  WITH CHECK ADD  CONSTRAINT [CK_DetalleComprobante_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[DetalleComprobante] CHECK CONSTRAINT [CK_DetalleComprobante_Cantidad]
GO
ALTER TABLE [dbo].[DetalleComprobante]  WITH CHECK ADD  CONSTRAINT [CK_DetalleComprobante_Importes] CHECK  (([PrecioUnitario]>=(0) AND [BonificacionImporte]>=(0) AND [ImporteNetoItem]>=(0) AND [ImporteTotalItem]>=(0)))
GO
ALTER TABLE [dbo].[DetalleComprobante] CHECK CONSTRAINT [CK_DetalleComprobante_Importes]
GO
ALTER TABLE [dbo].[DetalleListaMateriales]  WITH CHECK ADD  CONSTRAINT [CK_DetalleListaMateriales_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[DetalleListaMateriales] CHECK CONSTRAINT [CK_DetalleListaMateriales_Cantidad]
GO
ALTER TABLE [dbo].[DetallePedido]  WITH CHECK ADD  CONSTRAINT [CK_DetallePedido_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[DetallePedido] CHECK CONSTRAINT [CK_DetallePedido_Cantidad]
GO
ALTER TABLE [dbo].[DetallePedido]  WITH CHECK ADD  CONSTRAINT [CK_DetallePedido_Precio] CHECK  (([PrecioUnitario]>=(0)))
GO
ALTER TABLE [dbo].[DetallePedido] CHECK CONSTRAINT [CK_DetallePedido_Precio]
GO
ALTER TABLE [dbo].[DetallePedido]  WITH CHECK ADD  CONSTRAINT [CK_DetallePedido_Subtotal] CHECK  (([Subtotal]>=(0)))
GO
ALTER TABLE [dbo].[DetallePedido] CHECK CONSTRAINT [CK_DetallePedido_Subtotal]
GO
ALTER TABLE [dbo].[DetalleRemito]  WITH CHECK ADD  CONSTRAINT [CK_DetalleRemito_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[DetalleRemito] CHECK CONSTRAINT [CK_DetalleRemito_Cantidad]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [CK_DevolucionVentaIntegral_Confirmaciones] CHECK  (([ReintegroRealizado]=(1)))
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [CK_DevolucionVentaIntegral_Confirmaciones]
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral]  WITH CHECK ADD  CONSTRAINT [CK_DevolucionVentaIntegral_Importe] CHECK  (([ImporteReintegrado]>(0)))
GO
ALTER TABLE [dbo].[DevolucionVentaIntegral] CHECK CONSTRAINT [CK_DevolucionVentaIntegral_Importe]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceBeneficioRecorteConfig_Umbral] CHECK  (([UmbralGratuidad]>(0)))
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig] CHECK CONSTRAINT [CK_EcommerceBeneficioRecorteConfig_Umbral]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceBeneficioRecorteConfig_Unica] CHECK  (([ConfiguracionId]=(1)))
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecorteConfig] CHECK CONSTRAINT [CK_EcommerceBeneficioRecorteConfig_Unica]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceBeneficioRecortePedido_Gratis] CHECK  (([EsGratuito]=(1) AND [PrecioAplicado]=(0) OR [EsGratuito]=(0) AND [PrecioAplicado]>(0)))
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] CHECK CONSTRAINT [CK_EcommerceBeneficioRecortePedido_Gratis]
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceBeneficioRecortePedido_Precio] CHECK  (([PrecioAplicado]>=(0)))
GO
ALTER TABLE [dbo].[EcommerceBeneficioRecortePedido] CHECK CONSTRAINT [CK_EcommerceBeneficioRecortePedido_Precio]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceProductoRecorte_Cantidad] CHECK  (([CantidadHabilitada]>(0)))
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] CHECK CONSTRAINT [CK_EcommerceProductoRecorte_Cantidad]
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte]  WITH CHECK ADD  CONSTRAINT [CK_EcommerceProductoRecorte_Precio] CHECK  (([PrecioSimbolico]>(0)))
GO
ALTER TABLE [dbo].[EcommerceProductoRecorte] CHECK CONSTRAINT [CK_EcommerceProductoRecorte_Precio]
GO
ALTER TABLE [dbo].[EcommercePromocion]  WITH CHECK ADD  CONSTRAINT [CK_EcommercePromocion_Fechas] CHECK  (([FechaHasta]>[FechaDesde]))
GO
ALTER TABLE [dbo].[EcommercePromocion] CHECK CONSTRAINT [CK_EcommercePromocion_Fechas]
GO
ALTER TABLE [dbo].[EcommercePromocion]  WITH CHECK ADD  CONSTRAINT [CK_EcommercePromocion_Nombre] CHECK  ((len(ltrim(rtrim([Nombre])))>(0)))
GO
ALTER TABLE [dbo].[EcommercePromocion] CHECK CONSTRAINT [CK_EcommercePromocion_Nombre]
GO
ALTER TABLE [dbo].[EcommercePromocion]  WITH CHECK ADD  CONSTRAINT [CK_EcommercePromocion_Tipo] CHECK  (([TipoDescuento]='IMPORTE' OR [TipoDescuento]='PORCENTAJE'))
GO
ALTER TABLE [dbo].[EcommercePromocion] CHECK CONSTRAINT [CK_EcommercePromocion_Tipo]
GO
ALTER TABLE [dbo].[EcommercePromocion]  WITH CHECK ADD  CONSTRAINT [CK_EcommercePromocion_Valor] CHECK  (([ValorDescuento]>(0) AND ([TipoDescuento]<>'PORCENTAJE' OR [ValorDescuento]<=(100))))
GO
ALTER TABLE [dbo].[EcommercePromocion] CHECK CONSTRAINT [CK_EcommercePromocion_Valor]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [CK_EgresoDevolucion_UnLibro] CHECK  (([CajaMovimientoId] IS NULL AND [MovimientoFinancieroId] IS NULL OR [MedioReintegro]='Efectivo' AND [CajaMovimientoId] IS NOT NULL AND [MovimientoFinancieroId] IS NULL AND [CuentaBancariaId] IS NULL OR [MedioReintegro]<>'Efectivo' AND [CajaMovimientoId] IS NULL AND [MovimientoFinancieroId] IS NOT NULL AND [CajaId] IS NULL))
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [CK_EgresoDevolucion_UnLibro]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [CK_EgresoDevolucionVenta_Caja] CHECK  (([MedioReintegro]='Efectivo' AND [CajaId] IS NOT NULL OR [MedioReintegro]<>'Efectivo' AND [CajaId] IS NULL))
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [CK_EgresoDevolucionVenta_Caja]
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta]  WITH CHECK ADD  CONSTRAINT [CK_EgresoDevolucionVenta_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[EgresoDevolucionVenta] CHECK CONSTRAINT [CK_EgresoDevolucionVenta_Importe]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo]  WITH CHECK ADD  CONSTRAINT [CK_EnvioComprobanteCorreo_Destinatario] CHECK  ((len(ltrim(rtrim([Destinatario])))>(3)))
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] CHECK CONSTRAINT [CK_EnvioComprobanteCorreo_Destinatario]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo]  WITH CHECK ADD  CONSTRAINT [CK_EnvioComprobanteCorreo_Estado] CHECK  (([Estado]='ERROR' OR [Estado]='ENVIADO' OR [Estado]='PENDIENTE'))
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] CHECK CONSTRAINT [CK_EnvioComprobanteCorreo_Estado]
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo]  WITH CHECK ADD  CONSTRAINT [CK_EnvioComprobanteCorreo_FechaResultado] CHECK  (([Estado]='PENDIENTE' AND [FechaResultado] IS NULL OR ([Estado]='ERROR' OR [Estado]='ENVIADO') AND [FechaResultado] IS NOT NULL))
GO
ALTER TABLE [dbo].[EnvioComprobanteCorreo] CHECK CONSTRAINT [CK_EnvioComprobanteCorreo_FechaResultado]
GO
ALTER TABLE [dbo].[FacturaProveedor]  WITH CHECK ADD  CONSTRAINT [CK_FacturaProveedor_Estado] CHECK  (([Estado]='Anulada' OR [Estado]='Registrada'))
GO
ALTER TABLE [dbo].[FacturaProveedor] CHECK CONSTRAINT [CK_FacturaProveedor_Estado]
GO
ALTER TABLE [dbo].[FacturaProveedor]  WITH CHECK ADD  CONSTRAINT [CK_FacturaProveedor_Importe] CHECK  (([ImporteTotal]>(0)))
GO
ALTER TABLE [dbo].[FacturaProveedor] CHECK CONSTRAINT [CK_FacturaProveedor_Importe]
GO
ALTER TABLE [dbo].[Insumo]  WITH CHECK ADD  CONSTRAINT [CK_Insumo_StockMinimo] CHECK  (([StockMinimo]>=(0)))
GO
ALTER TABLE [dbo].[Insumo] CHECK CONSTRAINT [CK_Insumo_StockMinimo]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [CK_InteresComercial_Monto] CHECK  (([MontoPotencial]>=(0)))
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [CK_InteresComercial_Monto]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [CK_InteresComercial_TipoOrigen] CHECK  (([TipoOrigen]='Manual' OR [TipoOrigen]='E-commerce' OR [TipoOrigen]='Instagram' OR [TipoOrigen]='WhatsApp' OR [TipoOrigen]='Local'))
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [CK_InteresComercial_TipoOrigen]
GO
ALTER TABLE [dbo].[InteresComercial]  WITH CHECK ADD  CONSTRAINT [CK_InteresComercial_TipoPendiente] CHECK  (([TipoPendiente] IS NULL OR ([TipoPendiente]='Checkout interrumpido' OR [TipoPendiente]='Carrito abandonado' OR [TipoPendiente]='Consulta')))
GO
ALTER TABLE [dbo].[InteresComercial] CHECK CONSTRAINT [CK_InteresComercial_TipoPendiente]
GO
ALTER TABLE [dbo].[InventarioAjusteLote]  WITH CHECK ADD  CONSTRAINT [CK_InventarioAjusteLote_Lineas] CHECK  (([CantidadLineas]>(0)))
GO
ALTER TABLE [dbo].[InventarioAjusteLote] CHECK CONSTRAINT [CK_InventarioAjusteLote_Lineas]
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle]  WITH CHECK ADD  CONSTRAINT [CK_InventarioAjusteLoteDetalle_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle] CHECK CONSTRAINT [CK_InventarioAjusteLoteDetalle_Cantidad]
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle]  WITH CHECK ADD  CONSTRAINT [CK_InventarioAjusteLoteDetalle_Clase] CHECK  (([Clase]='INSUMO' OR [Clase]='PRODUCTO'))
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle] CHECK CONSTRAINT [CK_InventarioAjusteLoteDetalle_Clase]
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle]  WITH CHECK ADD  CONSTRAINT [CK_InventarioAjusteLoteDetalle_Signo] CHECK  (([Signo]=(1) OR [Signo]=(-1)))
GO
ALTER TABLE [dbo].[InventarioAjusteLoteDetalle] CHECK CONSTRAINT [CK_InventarioAjusteLoteDetalle_Signo]
GO
ALTER TABLE [dbo].[InventarioApertura]  WITH CHECK ADD  CONSTRAINT [CK_InventarioApertura_Usuario] CHECK  ((len(ltrim(rtrim([UsuarioResponsable])))>(0)))
GO
ALTER TABLE [dbo].[InventarioApertura] CHECK CONSTRAINT [CK_InventarioApertura_Usuario]
GO
ALTER TABLE [dbo].[InventarioRecuento]  WITH CHECK ADD  CONSTRAINT [CK_InventarioRecuento_Estado] CHECK  (([Estado]='CONFIRMADO' OR [Estado]='PENDIENTE'))
GO
ALTER TABLE [dbo].[InventarioRecuento] CHECK CONSTRAINT [CK_InventarioRecuento_Estado]
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle]  WITH CHECK ADD  CONSTRAINT [CK_InventarioRecuentoDetalle_Cantidades] CHECK  (([CantidadSistema]>=(0) AND [CantidadContada]>=(0)))
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle] CHECK CONSTRAINT [CK_InventarioRecuentoDetalle_Cantidades]
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle]  WITH CHECK ADD  CONSTRAINT [CK_InventarioRecuentoDetalle_Clase] CHECK  (([Clase]='INSUMO' OR [Clase]='PRODUCTO'))
GO
ALTER TABLE [dbo].[InventarioRecuentoDetalle] CHECK CONSTRAINT [CK_InventarioRecuentoDetalle_Clase]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [CK_LMRP_Cantidad] CHECK  (([CantidadPorUnidad]>(0)))
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [CK_LMRP_Cantidad]
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [CK_LMRP_Dimension] CHECK  (([Dimension] IS NULL OR [Dimension]>(0)))
GO
ALTER TABLE [dbo].[ListaMaterialesRecortePrevisto] CHECK CONSTRAINT [CK_LMRP_Dimension]
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente]  WITH CHECK ADD  CONSTRAINT [CK_MovCC_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[MovimientoCuentaCorrienteCliente] CHECK CONSTRAINT [CK_MovCC_Importe]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_CobroOrigen] CHECK  (([CobroId] IS NULL OR [OrigenTipo]='Cobro' AND [OrigenId]=CONVERT([bigint],[CobroId])))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_CobroOrigen]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Concepto] CHECK  ((len(ltrim(rtrim([Concepto])))>(0)))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Concepto]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Estado] CHECK  (([Estado]='Anulado' OR [Estado]='Registrado'))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Estado]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Importe]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Medio] CHECK  (([Medio]='OtroElectronico' OR [Medio]='Cheque' OR [Medio]='Deposito' OR [Medio]='Pasarela' OR [Medio]='Tarjeta' OR [Medio]='Transferencia'))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Medio]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Origen] CHECK  (([OrigenTipo]='Otro' OR [OrigenTipo]='AjusteAutorizado' OR [OrigenTipo]='Gasto' OR [OrigenTipo]='Devolucion' OR [OrigenTipo]='OrdenPagoProveedor' OR [OrigenTipo]='Cobro'))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Origen]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_OrigenId] CHECK  (([OrigenId]>(0)))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_OrigenId]
GO
ALTER TABLE [dbo].[MovimientoFinanciero]  WITH CHECK ADD  CONSTRAINT [CK_MovFin_Tipo] CHECK  (([Tipo]='Egreso' OR [Tipo]='Ingreso'))
GO
ALTER TABLE [dbo].[MovimientoFinanciero] CHECK CONSTRAINT [CK_MovFin_Tipo]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoRecorte_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [CK_MovimientoRecorte_Cantidad]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_MovRecorte_CantidadPositiva] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [CK_TEKA_MovRecorte_CantidadPositiva]
GO
ALTER TABLE [dbo].[MovimientoRecorte]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_MovRecorte_Tipo] CHECK  (([TipoMovimiento]='AjusteNegativo' OR [TipoMovimiento]='AjustePositivo' OR [TipoMovimiento]='Baja' OR [TipoMovimiento]='Uso' OR [TipoMovimiento]='Alta'))
GO
ALTER TABLE [dbo].[MovimientoRecorte] CHECK CONSTRAINT [CK_TEKA_MovRecorte_Tipo]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoStock_Anulacion] CHECK  (([Activo]=(1) AND [FechaAnulacion] IS NULL AND [MotivoAnulacion] IS NULL AND [ObservacionAnulacion] IS NULL OR [Activo]=(0) AND [FechaAnulacion] IS NOT NULL AND [MotivoAnulacion] IS NOT NULL))
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [CK_MovimientoStock_Anulacion]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoStock_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [CK_MovimientoStock_Cantidad]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoStock_EntidadOrigen] CHECK  (([EntidadOrigen] IS NULL OR ([EntidadOrigen]='PedidoAjusteEntrada' OR [EntidadOrigen]='PedidoAjusteSalida' OR [EntidadOrigen]='PedidoCancelacion' OR [EntidadOrigen]='AjusteManual' OR [EntidadOrigen]='Pedido' OR [EntidadOrigen]='Remito' OR [EntidadOrigen]='ConsumoProduccion' OR [EntidadOrigen]='ResultadoProduccion' OR [EntidadOrigen]='Recorte')))
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [CK_MovimientoStock_EntidadOrigen]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoStock_Item] CHECK  (([ProductoId] IS NOT NULL AND [InsumoId] IS NULL OR [ProductoId] IS NULL AND [InsumoId] IS NOT NULL))
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [CK_MovimientoStock_Item]
GO
ALTER TABLE [dbo].[MovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_MovimientoStock_Origen] CHECK  (([EntidadOrigen] IS NULL AND [OrigenId] IS NULL OR [EntidadOrigen] IS NOT NULL AND [OrigenId] IS NOT NULL OR [EntidadOrigen]='AjusteManual' AND [OrigenId] IS NULL))
GO
ALTER TABLE [dbo].[MovimientoStock] CHECK CONSTRAINT [CK_MovimientoStock_Origen]
GO
ALTER TABLE [dbo].[NotaCreditoProveedor]  WITH CHECK ADD  CONSTRAINT [CK_NotaCredito_Importe] CHECK  (([Importe]>(0)))
GO
ALTER TABLE [dbo].[NotaCreditoProveedor] CHECK CONSTRAINT [CK_NotaCredito_Importe]
GO
ALTER TABLE [dbo].[OfertaProveedor]  WITH CHECK ADD  CONSTRAINT [CK_Oferta_Estado] CHECK  (([Estado]='Descartada' OR [Estado]='Confirmada' OR [Estado]='Recibida'))
GO
ALTER TABLE [dbo].[OfertaProveedor] CHECK CONSTRAINT [CK_Oferta_Estado]
GO
ALTER TABLE [dbo].[OfertaProveedor]  WITH CHECK ADD  CONSTRAINT [CK_Oferta_Vigencia] CHECK  (([VigenciaHasta] IS NULL OR [VigenciaHasta]>=[FechaOferta]))
GO
ALTER TABLE [dbo].[OfertaProveedor] CHECK CONSTRAINT [CK_Oferta_Vigencia]
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [CK_OfertaDetalle_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle] CHECK CONSTRAINT [CK_OfertaDetalle_Cantidad]
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [CK_OfertaDetalle_Precio] CHECK  (([PrecioUnitario]>=(0)))
GO
ALTER TABLE [dbo].[OfertaProveedorDetalle] CHECK CONSTRAINT [CK_OfertaDetalle_Precio]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [CK_OportunidadComercial_MontoEstimado] CHECK  (([MontoEstimado]>=(0)))
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [CK_OportunidadComercial_MontoEstimado]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [CK_OportunidadComercial_Probabilidad] CHECK  (([Probabilidad]>=(0) AND [Probabilidad]<=(100)))
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [CK_OportunidadComercial_Probabilidad]
GO
ALTER TABLE [dbo].[OportunidadComercial]  WITH CHECK ADD  CONSTRAINT [CK_OportunidadComercial_TipoCliente] CHECK  (([TipoCliente]='empresa' OR [TipoCliente]='particular'))
GO
ALTER TABLE [dbo].[OportunidadComercial] CHECK CONSTRAINT [CK_OportunidadComercial_TipoCliente]
GO
ALTER TABLE [dbo].[OportunidadProducto]  WITH CHECK ADD  CONSTRAINT [CK_OportunidadProducto_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[OportunidadProducto] CHECK CONSTRAINT [CK_OportunidadProducto_Cantidad]
GO
ALTER TABLE [dbo].[OportunidadProducto]  WITH CHECK ADD  CONSTRAINT [CK_OportunidadProducto_Precio] CHECK  (([PrecioReferencia] IS NULL OR [PrecioReferencia]>=(0)))
GO
ALTER TABLE [dbo].[OportunidadProducto] CHECK CONSTRAINT [CK_OportunidadProducto_Precio]
GO
ALTER TABLE [dbo].[OrdenPagoProveedor]  WITH CHECK ADD  CONSTRAINT [CK_OrdenPago_Estado] CHECK  (([Estado]='Anulada' OR [Estado]='Confirmada' OR [Estado]='Borrador'))
GO
ALTER TABLE [dbo].[OrdenPagoProveedor] CHECK CONSTRAINT [CK_OrdenPago_Estado]
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion]  WITH CHECK ADD  CONSTRAINT [CK_OrdenPagoAplicacion_Importe] CHECK  (([ImporteAplicado]>(0)))
GO
ALTER TABLE [dbo].[OrdenPagoProveedorAplicacion] CHECK CONSTRAINT [CK_OrdenPagoAplicacion_Importe]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [CK_OrdenProduccion_CantPlanificada] CHECK  (([CantidadPlanificada]>(0)))
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [CK_OrdenProduccion_CantPlanificada]
GO
ALTER TABLE [dbo].[OrdenProduccion]  WITH CHECK ADD  CONSTRAINT [CK_OrdenProduccion_CantProducida] CHECK  (([CantidadProducida]>=(0)))
GO
ALTER TABLE [dbo].[OrdenProduccion] CHECK CONSTRAINT [CK_OrdenProduccion_CantProducida]
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot]  WITH CHECK ADD  CONSTRAINT [CK_OPBOM_Cantidad] CHECK  (([CantidadPorUnidad]>(0)))
GO
ALTER TABLE [dbo].[OrdenProduccionBOMSnapshot] CHECK CONSTRAINT [CK_OPBOM_Cantidad]
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [CK_OPDetalle_Cantidad] CHECK  (([CantidadPlanificada]>(0)))
GO
ALTER TABLE [dbo].[OrdenProduccionDetalle] CHECK CONSTRAINT [CK_OPDetalle_Cantidad]
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePlan]  WITH CHECK ADD CHECK  (([CantidadPlanificada]>(0)))
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot]  WITH CHECK ADD  CONSTRAINT [CK_OPRPS_Cantidades] CHECK  (([CantidadPorUnidad]>(0) AND [CantidadTotal]>(0)))
GO
ALTER TABLE [dbo].[OrdenProduccionRecortePrevistoSnapshot] CHECK CONSTRAINT [CK_OPRPS_Cantidades]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [CK_ParametroCostoPrecio_Fijos] CHECK  (([PorcentajeCostosFijos]>=(0) AND [PorcentajeCostosFijos]<=(1000)))
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [CK_ParametroCostoPrecio_Fijos]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [CK_ParametroCostoPrecio_ManoObra] CHECK  (([PorcentajeManoObra]>=(0) AND [PorcentajeManoObra]<=(1000)))
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [CK_ParametroCostoPrecio_ManoObra]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [CK_ParametroCostoPrecio_Margen] CHECK  (([PorcentajeMargen]>=(0) AND [PorcentajeMargen]<(100)))
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [CK_ParametroCostoPrecio_Margen]
GO
ALTER TABLE [dbo].[ParametroCostoPrecio]  WITH CHECK ADD  CONSTRAINT [CK_ParametroCostoPrecio_Variables] CHECK  (([PorcentajeOtrosVariables]>=(0) AND [PorcentajeOtrosVariables]<=(1000)))
GO
ALTER TABLE [dbo].[ParametroCostoPrecio] CHECK CONSTRAINT [CK_ParametroCostoPrecio_Variables]
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria]  WITH CHECK ADD  CONSTRAINT [CK_ParametroCostoPrecioAuditoria_Accion] CHECK  (([Accion]='DESACTIVAR' OR [Accion]='MODIFICAR' OR [Accion]='CREAR'))
GO
ALTER TABLE [dbo].[ParametroCostoPrecioAuditoria] CHECK CONSTRAINT [CK_ParametroCostoPrecioAuditoria_Accion]
GO
ALTER TABLE [dbo].[PlantillaFabricacion]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaFabricacion_Estado] CHECK  (([Estado]='Obsoleta' OR [Estado]='Aprobada' OR [Estado]='PendienteValidacion' OR [Estado]='Borrador'))
GO
ALTER TABLE [dbo].[PlantillaFabricacion] CHECK CONSTRAINT [CK_PlantillaFabricacion_Estado]
GO
ALTER TABLE [dbo].[PlantillaFabricacion]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaFabricacion_Lote] CHECK  (([UnidadesPorLote]>(0)))
GO
ALTER TABLE [dbo].[PlantillaFabricacion] CHECK CONSTRAINT [CK_PlantillaFabricacion_Lote]
GO
ALTER TABLE [dbo].[PlantillaFabricacion]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaFabricacion_Medidas] CHECK  ((([AnchoProductoMm] IS NULL OR [AnchoProductoMm]>(0)) AND ([AltoProductoMm] IS NULL OR [AltoProductoMm]>(0)) AND ([ProfundidadProductoMm] IS NULL OR [ProfundidadProductoMm]>(0))))
GO
ALTER TABLE [dbo].[PlantillaFabricacion] CHECK CONSTRAINT [CK_PlantillaFabricacion_Medidas]
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza]  WITH CHECK ADD  CONSTRAINT [CK_CortePieza_Posicion] CHECK  (([NumeroPlaca]>(0) AND [PosicionXmm]>=(0) AND [PosicionYmm]>=(0)))
GO
ALTER TABLE [dbo].[PlantillaFabricacionCortePieza] CHECK CONSTRAINT [CK_CortePieza_Posicion]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaPieza_Medidas] CHECK  (([CantidadPorUnidad]>(0) AND [LargoMm]>(0) AND [AnchoMm]>(0) AND [EspesorMm]>(0)))
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza] CHECK CONSTRAINT [CK_PlantillaPieza_Medidas]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaPieza_Veta] CHECK  (([OrientacionVeta]='Ancho' OR [OrientacionVeta]='Largo' OR [OrientacionVeta]='Indiferente'))
GO
ALTER TABLE [dbo].[PlantillaFabricacionPieza] CHECK CONSTRAINT [CK_PlantillaPieza_Veta]
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte]  WITH CHECK ADD  CONSTRAINT [CK_PlanCorte_Valores] CHECK  (([LargoPlacaMm]>(0) AND [AnchoPlacaMm]>(0) AND [EspesorPlacaMm]>(0) AND [AnchoSierraMm]>=(0) AND [CantidadPlacasPorLote]>(0)))
GO
ALTER TABLE [dbo].[PlantillaFabricacionPlanCorte] CHECK CONSTRAINT [CK_PlanCorte_Valores]
GO
ALTER TABLE [dbo].[PlantillaFabricacionRecortePrevisto]  WITH CHECK ADD  CONSTRAINT [CK_RecortePrevisto_Valores] CHECK  (([NumeroPlaca]>(0) AND [LargoMm]>(0) AND [AnchoMm]>(0) AND [Cantidad]>(0) AND ([PosicionXmm] IS NULL OR [PosicionXmm]>=(0)) AND ([PosicionYmm] IS NULL OR [PosicionYmm]>=(0))))
GO
ALTER TABLE [dbo].[PlantillaFabricacionRecortePrevisto] CHECK CONSTRAINT [CK_RecortePrevisto_Valores]
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle]  WITH CHECK ADD  CONSTRAINT [CK_PlantillaOPDetalle_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[PlantillaOrdenProduccionDetalle] CHECK CONSTRAINT [CK_PlantillaOPDetalle_Cantidad]
GO
ALTER TABLE [dbo].[PrecioVenta]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVenta_Precio] CHECK  (([Precio]>(0)))
GO
ALTER TABLE [dbo].[PrecioVenta] CHECK CONSTRAINT [CK_PrecioVenta_Precio]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCalculo_Importes] CHECK  (([CostoMateriales]>(0) AND [CostoManoObra]>=(0) AND [CostoCostosFijos]>=(0) AND [CostoOtrosVariables]>=(0) AND [CostoTotal]>(0) AND [PrecioSugerido]>(0) AND [PrecioFinalRegistrado]>(0)))
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [CK_PrecioVentaCalculo_Importes]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCalculo_ListaOrigen] CHECK  (([OrigenCostoMateriales]='BOM_ULTIMA_COMPRA_VALIDA' OR [ListaMaterialesId] IS NULL))
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [CK_PrecioVentaCalculo_ListaOrigen]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCalculo_Origen] CHECK  (([OrigenCostoMateriales]='COSTO_INFORMADO' OR [OrigenCostoMateriales]='BOM_ULTIMA_COMPRA_VALIDA'))
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [CK_PrecioVentaCalculo_Origen]
GO
ALTER TABLE [dbo].[PrecioVentaCalculo]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCalculo_Porcentajes] CHECK  (([PorcentajeManoObra]>=(0) AND [PorcentajeCostosFijos]>=(0) AND [PorcentajeOtrosVariables]>=(0) AND [PorcentajeMargen]>=(0) AND [PorcentajeMargen]<(100)))
GO
ALTER TABLE [dbo].[PrecioVentaCalculo] CHECK CONSTRAINT [CK_PrecioVentaCalculo_Porcentajes]
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCalculoInsumo_Valores] CHECK  (([Cantidad]>(0) AND [CostoUnitario]>(0) AND [Subtotal]>(0)))
GO
ALTER TABLE [dbo].[PrecioVentaCalculoInsumo] CHECK CONSTRAINT [CK_PrecioVentaCalculoInsumo_Valores]
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCorreccion_Importes] CHECK  (([ImporteAnterior]>(0) AND [ImporteNuevo]>(0)))
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria] CHECK CONSTRAINT [CK_PrecioVentaCorreccion_Importes]
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria]  WITH CHECK ADD  CONSTRAINT [CK_PrecioVentaCorreccion_Motivo] CHECK  ((len(ltrim(rtrim([Motivo])))>=(5)))
GO
ALTER TABLE [dbo].[PrecioVentaCorreccionAuditoria] CHECK CONSTRAINT [CK_PrecioVentaCorreccion_Motivo]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [CK_PresupuestoComercial_Estado] CHECK  (([Estado]='Cancelado' OR [Estado]='Convertido' OR [Estado]='Vencido' OR [Estado]='Rechazado' OR [Estado]='Aceptado' OR [Estado]='Enviado' OR [Estado]='Borrador'))
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [CK_PresupuestoComercial_Estado]
GO
ALTER TABLE [dbo].[PresupuestoComercial]  WITH CHECK ADD  CONSTRAINT [CK_PresupuestoComercial_Respuesta] CHECK  (([Estado]<>'Rechazado' OR nullif(ltrim(rtrim([MotivoRechazo])),'') IS NOT NULL))
GO
ALTER TABLE [dbo].[PresupuestoComercial] CHECK CONSTRAINT [CK_PresupuestoComercial_Respuesta]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle]  WITH CHECK ADD  CONSTRAINT [CK_PresupuestoDetalle_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] CHECK CONSTRAINT [CK_PresupuestoDetalle_Cantidad]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle]  WITH CHECK ADD  CONSTRAINT [CK_PresupuestoDetalle_Descuento] CHECK  (([DescuentoPorcentaje]>=(0) AND [DescuentoPorcentaje]<=(100)))
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] CHECK CONSTRAINT [CK_PresupuestoDetalle_Descuento]
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle]  WITH CHECK ADD  CONSTRAINT [CK_PresupuestoDetalle_Precio] CHECK  (([PrecioUnitario]>=(0)))
GO
ALTER TABLE [dbo].[PresupuestoComercialDetalle] CHECK CONSTRAINT [CK_PresupuestoDetalle_Precio]
GO
ALTER TABLE [dbo].[Producto]  WITH CHECK ADD  CONSTRAINT [CK_Producto_StockMinimo] CHECK  (([StockMinimo]>=(0)))
GO
ALTER TABLE [dbo].[Producto] CHECK CONSTRAINT [CK_Producto_StockMinimo]
GO
ALTER TABLE [dbo].[ProductoCircular]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_ProductoCircular_Estado] CHECK  (([Estado]='Inactivo' OR [Estado]='Aprobado'))
GO
ALTER TABLE [dbo].[ProductoCircular] CHECK CONSTRAINT [CK_TEKA_ProductoCircular_Estado]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline]  WITH CHECK ADD  CONSTRAINT [CK_ProductoDisponibilidadOnline_Cupo] CHECK  (([CupoOnline]>=(0)))
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] CHECK CONSTRAINT [CK_ProductoDisponibilidadOnline_Cupo]
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_CupoOnline_NoNegativo] CHECK  (([CupoOnline]>=(0) AND [DepositoId]=(3)))
GO
ALTER TABLE [dbo].[ProductoDisponibilidadOnline] CHECK CONSTRAINT [CK_TEKA_CupoOnline_NoNegativo]
GO
ALTER TABLE [dbo].[ProductoFichaTecnica]  WITH CHECK ADD  CONSTRAINT [CK_ProductoFichaTecnica_Medidas] CHECK  (([AnchoCm]>(0) AND [AltoCm]>(0) AND [ProfundidadCm]>(0)))
GO
ALTER TABLE [dbo].[ProductoFichaTecnica] CHECK CONSTRAINT [CK_ProductoFichaTecnica_Medidas]
GO
ALTER TABLE [dbo].[ProductoImagen]  WITH CHECK ADD  CONSTRAINT [CK_ProductoImagen_Orden] CHECK  (([OrdenVisual]>=(0)))
GO
ALTER TABLE [dbo].[ProductoImagen] CHECK CONSTRAINT [CK_ProductoImagen_Orden]
GO
ALTER TABLE [dbo].[ProductoImagen]  WITH CHECK ADD  CONSTRAINT [CK_ProductoImagen_Url] CHECK  ((len(ltrim(rtrim([UrlArchivo])))>(0)))
GO
ALTER TABLE [dbo].[ProductoImagen] CHECK CONSTRAINT [CK_ProductoImagen_Url]
GO
ALTER TABLE [dbo].[ProductoModelo3D]  WITH CHECK ADD  CONSTRAINT [CK_ProductoModelo3D_Archivo] CHECK  (([UrlGlb] IS NOT NULL OR [UrlUsdz] IS NOT NULL))
GO
ALTER TABLE [dbo].[ProductoModelo3D] CHECK CONSTRAINT [CK_ProductoModelo3D_Archivo]
GO
ALTER TABLE [dbo].[ProductoPublicacion]  WITH CHECK ADD  CONSTRAINT [CK_ProductoPublicacion_Destacado] CHECK  (([Destacado]=(0) OR [Publicado]=(1)))
GO
ALTER TABLE [dbo].[ProductoPublicacion] CHECK CONSTRAINT [CK_ProductoPublicacion_Destacado]
GO
ALTER TABLE [dbo].[ProductoPublicacion]  WITH CHECK ADD  CONSTRAINT [CK_ProductoPublicacion_Orden] CHECK  (([OrdenVisual]>=(0)))
GO
ALTER TABLE [dbo].[ProductoPublicacion] CHECK CONSTRAINT [CK_ProductoPublicacion_Orden]
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion]  WITH CHECK ADD  CONSTRAINT [CK_PropuestaFicha_Estado] CHECK  (([Estado]='Descartada' OR [Estado]='Validada' OR [Estado]='PendienteValidacion'))
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion] CHECK CONSTRAINT [CK_PropuestaFicha_Estado]
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion]  WITH CHECK ADD  CONSTRAINT [CK_PropuestaFicha_Medidas] CHECK  (([AnchoCm]>(0) AND [AltoCm]>(0) AND [ProfundidadCm]>(0)))
GO
ALTER TABLE [dbo].[PropuestaFichaTecnicaFabricacion] CHECK CONSTRAINT [CK_PropuestaFicha_Medidas]
GO
ALTER TABLE [dbo].[Proveedor]  WITH CHECK ADD  CONSTRAINT [CK_Proveedor_Razon] CHECK  ((len(ltrim(rtrim([RazonSocial])))>(0)))
GO
ALTER TABLE [dbo].[Proveedor] CHECK CONSTRAINT [CK_Proveedor_Razon]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [CK_Recorte_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [CK_Recorte_Cantidad]
GO
ALTER TABLE [dbo].[Recorte]  WITH CHECK ADD  CONSTRAINT [CK_Recorte_Geometria1B] CHECK  ((([LargoMm] IS NULL OR [LargoMm]>(0)) AND ([AnchoMm] IS NULL OR [AnchoMm]>(0)) AND ([EspesorMm] IS NULL OR [EspesorMm]>(0)) AND ([OrientacionVeta] IS NULL OR ([OrientacionVeta]='Ancho' OR [OrientacionVeta]='Largo' OR [OrientacionVeta]='Indiferente'))))
GO
ALTER TABLE [dbo].[Recorte] CHECK CONSTRAINT [CK_Recorte_Geometria1B]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [CK_RecorteDiseno_Medidas] CHECK  (([LargoExteriorMm]>(0) AND [AnchoExteriorMm]>(0) AND [AltoExteriorMm]>(0) AND [CantidadSugerida]>(0) AND [OrdenEnGeneracion]>(0) AND [VersionNumero]>(0)))
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [CK_RecorteDiseno_Medidas]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [CK_RecorteDiseno_Revision] CHECK  (([EstadoRevision]='Descartada' OR [EstadoRevision]='Rechazada' OR [EstadoRevision]='Invalida' OR [EstadoRevision]='Aprobada' OR [EstadoRevision]='Validada' OR [EstadoRevision]='PendienteValidacion'))
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [CK_RecorteDiseno_Revision]
GO
ALTER TABLE [dbo].[RecorteDiseno]  WITH CHECK ADD  CONSTRAINT [CK_RecorteDiseno_Version] CHECK  (([VersionNumero]=(1) AND [VersionAnteriorId] IS NULL OR [VersionNumero]>(1) AND [VersionAnteriorId] IS NOT NULL))
GO
ALTER TABLE [dbo].[RecorteDiseno] CHECK CONSTRAINT [CK_RecorteDiseno_Version]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteAsignacion_Tolerancia2B] CHECK  (([ToleranciaMm] IS NULL OR [ToleranciaMm]>=(0)))
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] CHECK CONSTRAINT [CK_RecorteAsignacion_Tolerancia2B]
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteAsignacion_Valores] CHECK  (([CantidadPiezas]>(0) AND [PosicionXmm]>=(0) AND [PosicionYmm]>=(0) AND [LargoCorteMm]>(0) AND [AnchoCorteMm]>(0) AND ([AnchoSierraMm] IS NULL OR [AnchoSierraMm]>=(0)) AND ([MargenSeguridadMm] IS NULL OR [MargenSeguridadMm]>=(0))))
GO
ALTER TABLE [dbo].[RecorteDisenoAsignacion] CHECK CONSTRAINT [CK_RecorteAsignacion_Valores]
GO
ALTER TABLE [dbo].[RecorteDisenoCosto]  WITH CHECK ADD  CONSTRAINT [CK_RecorteCosto_Tipo] CHECK  (([Tipo]='Indirecto' OR [Tipo]='Proceso' OR [Tipo]='ManoObra' OR [Tipo]='Insumo' OR [Tipo]='Recorte'))
GO
ALTER TABLE [dbo].[RecorteDisenoCosto] CHECK CONSTRAINT [CK_RecorteCosto_Tipo]
GO
ALTER TABLE [dbo].[RecorteDisenoCosto]  WITH CHECK ADD  CONSTRAINT [CK_RecorteCosto_Valores] CHECK  (([Cantidad]>(0) AND ([CostoUnitario] IS NULL OR [CostoUnitario]>=(0)) AND ([Subtotal] IS NULL OR [Subtotal]>=(0)) AND ([CostoUnitario] IS NULL AND [Subtotal] IS NULL AND [MotivoIncompleto] IS NOT NULL OR [CostoUnitario] IS NOT NULL AND [Subtotal] IS NOT NULL AND [Fuente] IS NOT NULL)))
GO
ALTER TABLE [dbo].[RecorteDisenoCosto] CHECK CONSTRAINT [CK_RecorteCosto_Valores]
GO
ALTER TABLE [dbo].[RecorteDisenoImagen]  WITH CHECK ADD  CONSTRAINT [CK_RecorteImagen_Estado] CHECK  (([Estado]='NoDisponible' OR [Estado]='Disponible'))
GO
ALTER TABLE [dbo].[RecorteDisenoImagen] CHECK CONSTRAINT [CK_RecorteImagen_Estado]
GO
ALTER TABLE [dbo].[RecorteDisenoImagen]  WITH CHECK ADD  CONSTRAINT [CK_RecorteImagen_Referencia] CHECK  ((len([Referencia])>(0) AND NOT [Referencia] like 'data:%' AND NOT [Referencia] like '%?%' AND NOT [Referencia] like '%#%'))
GO
ALTER TABLE [dbo].[RecorteDisenoImagen] CHECK CONSTRAINT [CK_RecorteImagen_Referencia]
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo]  WITH CHECK ADD  CONSTRAINT [CK_RecorteInsumo_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[RecorteDisenoInsumo] CHECK CONSTRAINT [CK_RecorteInsumo_Cantidad]
GO
ALTER TABLE [dbo].[RecorteDisenoPieza]  WITH CHECK ADD  CONSTRAINT [CK_RecortePieza_Valores] CHECK  (([OrdenPieza]>(0) AND [Cantidad]>(0) AND [LargoMm]>(0) AND [AnchoMm]>(0) AND [EspesorMm]>(0) AND ([Origen]='Insumo' OR [Origen]='Recorte') AND ([OrientacionVeta]='Ancho' OR [OrientacionVeta]='Largo' OR [OrientacionVeta]='Indiferente')))
GO
ALTER TABLE [dbo].[RecorteDisenoPieza] CHECK CONSTRAINT [CK_RecortePieza_Valores]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteValidacion_Diagnostico2B] CHECK  (([DiagnosticoPreliminar] IS NULL OR ([DiagnosticoPreliminar]='Invalida' OR [DiagnosticoPreliminar]='PendienteGeometria')))
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion] CHECK CONSTRAINT [CK_RecorteValidacion_Diagnostico2B]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteValidacion_Resultado] CHECK  (([Resultado]='Invalida' OR [Resultado]='Valida' OR [Resultado]='PendienteGeometria'))
GO
ALTER TABLE [dbo].[RecorteDisenoValidacion] CHECK CONSTRAINT [CK_RecorteValidacion_Resultado]
GO
ALTER TABLE [dbo].[RecorteDisenoValidacionMotivo]  WITH CHECK ADD  CONSTRAINT [CK_RecorteMotivo_Severidad2B] CHECK  (([Severidad] IS NULL OR ([Severidad]='Supuesto' OR [Severidad]='Advertencia' OR [Severidad]='Pendiente' OR [Severidad]='Error')))
GO
ALTER TABLE [dbo].[RecorteDisenoValidacionMotivo] CHECK CONSTRAINT [CK_RecorteMotivo_Severidad2B]
GO
ALTER TABLE [dbo].[RecorteGeneracion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteGeneracion_Cantidad] CHECK  (([CantidadRecibidas]>=(0) AND [CantidadTecnicasValidas]>=(0) AND [CantidadTecnicasValidas]<=[CantidadRecibidas]))
GO
ALTER TABLE [dbo].[RecorteGeneracion] CHECK CONSTRAINT [CK_RecorteGeneracion_Cantidad]
GO
ALTER TABLE [dbo].[RecorteGeneracion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteGeneracion_Estado] CHECK  (([Estado]='ConError' OR [Estado]='Registrada' OR [Estado]='PendienteGeneracion'))
GO
ALTER TABLE [dbo].[RecorteGeneracion] CHECK CONSTRAINT [CK_RecorteGeneracion_Estado]
GO
ALTER TABLE [dbo].[RecorteGeneracion]  WITH CHECK ADD  CONSTRAINT [CK_RecorteGeneracion_Resultado] CHECK  (([Estado]='PendienteGeneracion' AND [CantidadRecibidas]=(0) AND [ErrorCodigo] IS NULL OR [Estado]='Registrada' AND [CantidadRecibidas]>(0) AND [ErrorCodigo] IS NULL OR [Estado]='ConError' AND [CantidadRecibidas]=(0) AND [ErrorCodigo] IS NOT NULL))
GO
ALTER TABLE [dbo].[RecorteGeneracion] CHECK CONSTRAINT [CK_RecorteGeneracion_Resultado]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [CK_RecorteGenInv_Cantidad] CHECK  (([CantidadDisponible]>=(0)))
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [CK_RecorteGenInv_Cantidad]
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario]  WITH CHECK ADD  CONSTRAINT [CK_RecorteGenInv_Cantidad2B] CHECK  (([CantidadRegistrada] IS NULL OR [CantidadRegistrada]>(0)))
GO
ALTER TABLE [dbo].[RecorteGeneracionInventario] CHECK CONSTRAINT [CK_RecorteGenInv_Cantidad2B]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor]  WITH CHECK ADD  CONSTRAINT [CK_RemitoProveedor_Confirmacion] CHECK  (([Estado]='Borrador' AND [FechaConfirmacion] IS NULL AND [UsuarioConfirmacionId] IS NULL OR [Estado]<>'Borrador' AND [FechaConfirmacion] IS NOT NULL AND [UsuarioConfirmacionId] IS NOT NULL))
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] CHECK CONSTRAINT [CK_RemitoProveedor_Confirmacion]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor]  WITH CHECK ADD  CONSTRAINT [CK_RemitoProveedor_Estado] CHECK  (([Estado]='ConDiferencias' OR [Estado]='Confirmado' OR [Estado]='Borrador'))
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedor] CHECK CONSTRAINT [CK_RemitoProveedor_Estado]
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle]  WITH CHECK ADD  CONSTRAINT [CK_RemitoDetalle_Cantidad] CHECK  (([CantidadRecibida]>=(0)))
GO
ALTER TABLE [dbo].[RemitoRecepcionProveedorDetalle] CHECK CONSTRAINT [CK_RemitoDetalle_Cantidad]
GO
ALTER TABLE [dbo].[ResultadoProduccion]  WITH CHECK ADD  CONSTRAINT [CK_ResultadoProduccion_Cantidad] CHECK  (([CantidadIngresada]>(0)))
GO
ALTER TABLE [dbo].[ResultadoProduccion] CHECK CONSTRAINT [CK_ResultadoProduccion_Cantidad]
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle]  WITH CHECK ADD  CONSTRAINT [CK_SolicitudDetalle_Cantidad] CHECK  (([Cantidad]>(0)))
GO
ALTER TABLE [dbo].[SolicitudCotizacionDetalle] CHECK CONSTRAINT [CK_SolicitudDetalle_Cantidad]
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor]  WITH CHECK ADD  CONSTRAINT [CK_SolicitudCotizacion_Estado] CHECK  (([Estado]='Cancelada' OR [Estado]='Cerrada' OR [Estado]='Abierta'))
GO
ALTER TABLE [dbo].[SolicitudCotizacionProveedor] CHECK CONSTRAINT [CK_SolicitudCotizacion_Estado]
GO
ALTER TABLE [dbo].[StockInsumo]  WITH CHECK ADD  CONSTRAINT [CK_StockInsumo_CantidadActual] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[StockInsumo] CHECK CONSTRAINT [CK_StockInsumo_CantidadActual]
GO
ALTER TABLE [dbo].[StockInsumo]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_StockInsumo_NoNegativo] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[StockInsumo] CHECK CONSTRAINT [CK_TEKA_StockInsumo_NoNegativo]
GO
ALTER TABLE [dbo].[StockProducto]  WITH CHECK ADD  CONSTRAINT [CK_StockProducto_CantidadActual] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[StockProducto] CHECK CONSTRAINT [CK_StockProducto_CantidadActual]
GO
ALTER TABLE [dbo].[StockProducto]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_StockProducto_NoNegativo] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[StockProducto] CHECK CONSTRAINT [CK_TEKA_StockProducto_NoNegativo]
GO
ALTER TABLE [dbo].[StockRecorte]  WITH CHECK ADD  CONSTRAINT [CK_TEKA_StockRecorte_NoNegativo] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[StockRecorte] CHECK CONSTRAINT [CK_TEKA_StockRecorte_NoNegativo]
GO
ALTER TABLE [dbo].[TipoDomicilio]  WITH CHECK ADD  CONSTRAINT [CK_TipoDomicilio_Nombre] CHECK  ((len(ltrim(rtrim([Nombre])))>(0)))
GO
ALTER TABLE [dbo].[TipoDomicilio] CHECK CONSTRAINT [CK_TipoDomicilio_Nombre]
GO
ALTER TABLE [dbo].[TipoMovimientoCuentaCorriente]  WITH CHECK ADD  CONSTRAINT [CK_TipoMovCC_Signo] CHECK  (([Signo]=(-1) OR [Signo]=(1)))
GO
ALTER TABLE [dbo].[TipoMovimientoCuentaCorriente] CHECK CONSTRAINT [CK_TipoMovCC_Signo]
GO
ALTER TABLE [dbo].[TipoMovimientoStock]  WITH CHECK ADD  CONSTRAINT [CK_TipoMovimientoStock_Signo] CHECK  (([Signo]=(-1) OR [Signo]=(1)))
GO
ALTER TABLE [dbo].[TipoMovimientoStock] CHECK CONSTRAINT [CK_TipoMovimientoStock_Signo]
GO
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce]  WITH CHECK ADD  CONSTRAINT [CK_TokenRecuperacionCliente_Vigencia] CHECK  (([FechaExpiracion]>[FechaCreacion]))
GO
ALTER TABLE [dbo].[TokenRecuperacionClienteEcommerce] CHECK CONSTRAINT [CK_TokenRecuperacionCliente_Vigencia]
GO
ALTER TABLE [dbo].[VisitaOportunidad]  WITH CHECK ADD  CONSTRAINT [CK_VisitaOportunidad_TipoVisita] CHECK  (([TipoVisita]='Email' OR [TipoVisita]='Videollamada' OR [TipoVisita]='Llamada' OR [TipoVisita]='WhatsApp' OR [TipoVisita]='Presencial'))
GO
ALTER TABLE [dbo].[VisitaOportunidad] CHECK CONSTRAINT [CK_VisitaOportunidad_TipoVisita]
GO
/****** Objeto: StoredProcedure [dbo].[pa_Existencias_ActividadPeriodo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Devuelve actividad por articulo y deposito, o consolidada por articulo.
   Saldo inicial = movimientos anteriores a @Desde.
   Saldo final = movimientos hasta @Hasta inclusive.
   No suma unidades distintas: cada fila corresponde a un articulo.
*/
CREATE   PROCEDURE [dbo].[pa_Existencias_ActividadPeriodo]
 @Clase varchar(10), @Desde date, @Hasta date,
 @DepositoId int = NULL, @ArticuloId int = NULL, @ConsolidarDepositos bit = 0
AS
BEGIN
 SET NOCOUNT ON;
 IF @Clase NOT IN ('PRODUCTO','INSUMO') OR @Clase IS NULL THROW 51001,'Clase invalida.',1;
 IF @Desde IS NULL OR @Hasta IS NULL OR @Desde>@Hasta THROW 51002,'Rango de fechas invalido.',1;
 IF @Hasta>CONVERT(date,GETDATE()) THROW 51003,'No se admiten fechas futuras.',1;
 ;WITH movimientos AS (
  SELECT ArticuloId, CASE WHEN @ConsolidarDepositos=1 THEN NULL ELSE DepositoId END AS DepositoId,
         FechaMovimiento, Signo, Variacion
  FROM dbo.vw_Existencias_LibroUnificado
  WHERE Clase=@Clase AND (@DepositoId IS NULL OR DepositoId=@DepositoId)
    AND (@ArticuloId IS NULL OR ArticuloId=@ArticuloId)
    AND FechaMovimiento<DATEADD(day,1,CONVERT(datetime2,@Hasta))
 ), resumen AS (
  SELECT ArticuloId, DepositoId,
   SUM(CASE WHEN FechaMovimiento<CONVERT(datetime2,@Desde) THEN Variacion ELSE CONVERT(decimal(28,2),0) END) AS SaldoInicial,
   SUM(CASE WHEN FechaMovimiento>=CONVERT(datetime2,@Desde) AND Signo=1 THEN CantidadCalculada ELSE CONVERT(decimal(28,2),0) END) AS Entradas,
   SUM(CASE WHEN FechaMovimiento>=CONVERT(datetime2,@Desde) AND Signo=-1 THEN CantidadCalculada ELSE CONVERT(decimal(28,2),0) END) AS Salidas,
   SUM(CASE WHEN FechaMovimiento>=CONVERT(datetime2,@Desde) THEN Variacion ELSE CONVERT(decimal(28,2),0) END) AS VariacionNeta,
   SUM(Variacion) AS SaldoFinal,
   SUM(CASE WHEN FechaMovimiento>=CONVERT(datetime2,@Desde) THEN 1 ELSE 0 END) AS CantidadMovimientos
  FROM (SELECT *, ABS(Variacion) AS CantidadCalculada FROM movimientos) x
  GROUP BY ArticuloId, DepositoId
 )
 SELECT @Clase AS Clase, ArticuloId, DepositoId, SaldoInicial, Entradas, Salidas,
        VariacionNeta, SaldoFinal, CantidadMovimientos,
        CAST(CASE WHEN VariacionNeta>0 THEN 'CRECIENTE' WHEN VariacionNeta<0 THEN 'DECRECIENTE' ELSE 'ESTABLE' END AS varchar(12)) AS Tendencia,
        CAST(0 AS bit) AS HistorialConciliado
 FROM resumen ORDER BY ArticuloId,DepositoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[pa_Existencias_Evolucion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Evolucion diaria o mensual del libro para un unico articulo.
   La serie devuelve dias/meses con movimientos; el frontend puede
   graficar esos puntos sin inventar movimientos intermedios.
*/
CREATE   PROCEDURE [dbo].[pa_Existencias_Evolucion]
 @Clase varchar(10), @ArticuloId int, @Desde date, @Hasta date,
 @DepositoId int=NULL, @Agrupacion varchar(10)='DIA'
AS
BEGIN
 SET NOCOUNT ON;
 IF @Clase NOT IN ('PRODUCTO','INSUMO') OR @Clase IS NULL THROW 51021,'Clase invalida.',1;
 IF @ArticuloId IS NULL OR @ArticuloId<=0 THROW 51022,'Articulo invalido.',1;
 IF @Desde IS NULL OR @Hasta IS NULL OR @Desde>@Hasta OR @Hasta>CONVERT(date,GETDATE()) THROW 51023,'Fechas invalidas.',1;
 IF @Agrupacion NOT IN ('DIA','MES') OR @Agrupacion IS NULL THROW 51024,'Agrupacion invalida.',1;
 ;WITH base AS (
  SELECT FechaMovimiento, Variacion FROM dbo.vw_Existencias_LibroUnificado
  WHERE Clase=@Clase AND ArticuloId=@ArticuloId AND (@DepositoId IS NULL OR DepositoId=@DepositoId)
    AND FechaMovimiento<DATEADD(day,1,CONVERT(datetime2,@Hasta))
 ), inicial AS (
  SELECT COALESCE(SUM(Variacion),0) AS SaldoInicial FROM base WHERE FechaMovimiento<CONVERT(datetime2,@Desde)
 ), periodos AS (
  SELECT CASE WHEN @Agrupacion='MES' THEN DATEFROMPARTS(YEAR(FechaMovimiento),MONTH(FechaMovimiento),1)
              ELSE CONVERT(date,FechaMovimiento) END AS Periodo, SUM(Variacion) AS Variacion
  FROM base WHERE FechaMovimiento>=CONVERT(datetime2,@Desde)
  GROUP BY CASE WHEN @Agrupacion='MES' THEN DATEFROMPARTS(YEAR(FechaMovimiento),MONTH(FechaMovimiento),1)
                ELSE CONVERT(date,FechaMovimiento) END
 )
 SELECT p.Periodo, p.Variacion,
        CONVERT(decimal(28,2),i.SaldoInicial+SUM(p.Variacion) OVER (ORDER BY p.Periodo ROWS UNBOUNDED PRECEDING)) AS SaldoFinal,
        CAST(0 AS bit) AS HistorialConciliado
 FROM periodos p CROSS JOIN inicial i ORDER BY p.Periodo;
END;

GO
/****** Objeto: StoredProcedure [dbo].[pa_Existencias_StockFecha] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[pa_Existencias_StockFecha]
 @Clase varchar(10), @Fecha date, @DepositoId int=NULL, @ArticuloId int=NULL,
 @ConsolidarDepositos bit=0
AS
BEGIN
 SET NOCOUNT ON;
 IF @Clase NOT IN ('PRODUCTO','INSUMO') OR @Clase IS NULL THROW 51011,'Clase invalida.',1;
 IF @Fecha IS NULL OR @Fecha>CONVERT(date,GETDATE()) THROW 51012,'Fecha invalida.',1;
 SELECT @Clase AS Clase, ArticuloId,
        CASE WHEN @ConsolidarDepositos=1 THEN NULL ELSE DepositoId END AS DepositoId,
        SUM(Variacion) AS SaldoLibroFecha, CAST(0 AS bit) AS HistorialConciliado
 FROM dbo.vw_Existencias_LibroUnificado
 WHERE Clase=@Clase AND FechaMovimiento<DATEADD(day,1,CONVERT(datetime2,@Fecha))
   AND (@DepositoId IS NULL OR DepositoId=@DepositoId)
   AND (@ArticuloId IS NULL OR ArticuloId=@ArticuloId)
 GROUP BY ArticuloId,CASE WHEN @ConsolidarDepositos=1 THEN NULL ELSE DepositoId END
 ORDER BY ArticuloId,DepositoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[pa_Movimientos_Consultar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* TEKA - Lecturas analiticas de Movimientos. No modifica movimientos ni existencias.
   Requiere ejecutar en TEKA_Manager. Los agregados son operaciones, no unidades
   homogeneas: nunca sumar unidades de producto con unidades de insumo. */
CREATE   PROCEDURE [dbo].[pa_Movimientos_Consultar]
 @Desde DATE,@Hasta DATE,@Clase VARCHAR(10)=NULL,@DepositoId INT=NULL,@ArticuloId INT=NULL,@Origen VARCHAR(50)=NULL,@Estado VARCHAR(10)=NULL,@Modalidad VARCHAR(12)=NULL,@Buscar VARCHAR(120)=NULL,@Pagina INT=1,@TamanoPagina INT=25
AS BEGIN SET NOCOUNT ON;
IF @Desde IS NULL OR @Hasta IS NULL OR @Hasta<@Desde OR @Hasta='99991231' THROW 53001,'Periodo invalido.',1;
IF @Clase IS NOT NULL AND @Clase NOT IN ('PRODUCTO','INSUMO') THROW 53002,'Clase invalida.',1;
IF @Estado IS NOT NULL AND @Estado NOT IN ('VIGENTE','ANULADO','REVERSA') THROW 53003,'Estado invalido.',1;
IF @Modalidad IS NOT NULL AND @Modalidad NOT IN ('MANUAL','AUTOMATICO','REVERSA') THROW 53004,'Modalidad invalida.',1;
IF @Pagina<1 OR @TamanoPagina NOT BETWEEN 1 AND 100 THROW 53005,'Paginacion invalida.',1;
SELECT m.MovimientoStockId,m.FechaMovimiento,
 CASE WHEN m.ProductoId IS NOT NULL THEN 'PRODUCTO' ELSE 'INSUMO' END Clase,
 COALESCE(m.ProductoId,m.InsumoId) ArticuloId,
 COALESCE(p.Codigo,i.Codigo) Codigo,COALESCE(p.Nombre,i.Nombre) Articulo,
 m.DepositoId,d.Nombre Deposito,m.TipoMovimientoStockId,t.Nombre TipoMovimiento,
 t.Signo,m.Cantidad,m.Motivo,m.EntidadOrigen,m.OrigenId,m.Activo,
 m.FechaAnulacion,m.MotivoAnulacion,m.ObservacionAnulacion,m.MovimientoStockIdReversaDe,
 CASE WHEN m.MovimientoStockIdReversaDe IS NOT NULL THEN 'REVERSA'
 WHEN m.EntidadOrigen='AjusteManual' THEN 'MANUAL' ELSE 'AUTOMATICO' END Modalidad,
 CASE WHEN m.MovimientoStockIdReversaDe IS NOT NULL THEN 'REVERSA'
 WHEN m.Activo=0 THEN 'ANULADO' ELSE 'VIGENTE' END Estado,
 COUNT_BIG(*) OVER() TotalFilas
FROM dbo.MovimientoStock m
JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
JOIN dbo.Deposito d ON d.DepositoId=m.DepositoId
LEFT JOIN dbo.Producto p ON p.ProductoId=m.ProductoId
LEFT JOIN dbo.Insumo i ON i.InsumoId=m.InsumoId
WHERE m.FechaMovimiento>=@Desde AND m.FechaMovimiento<DATEADD(DAY,1,@Hasta)
 AND (@Clase IS NULL OR (@Clase='PRODUCTO' AND m.ProductoId IS NOT NULL) OR (@Clase='INSUMO' AND m.InsumoId IS NOT NULL))
 AND (@DepositoId IS NULL OR m.DepositoId=@DepositoId)
 AND (@ArticuloId IS NULL OR COALESCE(m.ProductoId,m.InsumoId)=@ArticuloId)
 AND (@Origen IS NULL OR m.EntidadOrigen=@Origen)
 AND (@Estado IS NULL OR (@Estado='ANULADO' AND m.Activo=0) OR (@Estado='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Estado='VIGENTE' AND m.Activo=1 AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Modalidad IS NULL OR (@Modalidad='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Modalidad='MANUAL' AND m.EntidadOrigen='AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL) OR (@Modalidad='AUTOMATICO' AND m.EntidadOrigen IS NOT NULL AND m.EntidadOrigen<>'AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Buscar IS NULL OR p.Codigo LIKE '%'+@Buscar+'%' OR p.Nombre LIKE '%'+@Buscar+'%' OR i.Codigo LIKE '%'+@Buscar+'%' OR i.Nombre LIKE '%'+@Buscar+'%')
ORDER BY m.FechaMovimiento DESC,m.MovimientoStockId DESC
OFFSET (CONVERT(BIGINT,@Pagina)-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
/****** Objeto: StoredProcedure [dbo].[pa_Movimientos_Resumen] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[pa_Movimientos_Resumen]
 @Desde DATE,@Hasta DATE,@Clase VARCHAR(10)=NULL,@DepositoId INT=NULL,@ArticuloId INT=NULL,@Origen VARCHAR(50)=NULL,@Estado VARCHAR(10)=NULL,@Modalidad VARCHAR(12)=NULL,@Buscar VARCHAR(120)=NULL
AS BEGIN SET NOCOUNT ON;
IF @Desde IS NULL OR @Hasta IS NULL OR @Hasta<@Desde OR @Hasta='99991231' THROW 53001,'Periodo invalido.',1;
IF @Clase IS NOT NULL AND @Clase NOT IN ('PRODUCTO','INSUMO') THROW 53002,'Clase invalida.',1;
IF @Estado IS NOT NULL AND @Estado NOT IN ('VIGENTE','ANULADO','REVERSA') THROW 53003,'Estado invalido.',1;
IF @Modalidad IS NOT NULL AND @Modalidad NOT IN ('MANUAL','AUTOMATICO','REVERSA') THROW 53004,'Modalidad invalida.',1;
SELECT COUNT_BIG(*) TotalMovimientos,
 COALESCE(SUM(CASE WHEN t.Signo=1 THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadEntradas,
 COALESCE(SUM(CASE WHEN t.Signo=-1 THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadSalidas,
 COALESCE(SUM(CASE WHEN m.EntidadOrigen='AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadManuales,
 COALESCE(SUM(CASE WHEN m.EntidadOrigen IS NOT NULL AND m.EntidadOrigen<>'AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadAutomaticos,
 COALESCE(SUM(CASE WHEN m.MovimientoStockIdReversaDe IS NOT NULL THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadReversas,
 COALESCE(SUM(CASE WHEN m.Activo=0 THEN CONVERT(BIGINT,1) ELSE 0 END),0) CantidadAnulados
FROM dbo.MovimientoStock m
JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
JOIN dbo.Deposito d ON d.DepositoId=m.DepositoId
LEFT JOIN dbo.Producto p ON p.ProductoId=m.ProductoId
LEFT JOIN dbo.Insumo i ON i.InsumoId=m.InsumoId
WHERE m.FechaMovimiento>=@Desde AND m.FechaMovimiento<DATEADD(DAY,1,@Hasta)
 AND (@Clase IS NULL OR (@Clase='PRODUCTO' AND m.ProductoId IS NOT NULL) OR (@Clase='INSUMO' AND m.InsumoId IS NOT NULL))
 AND (@DepositoId IS NULL OR m.DepositoId=@DepositoId)
 AND (@ArticuloId IS NULL OR COALESCE(m.ProductoId,m.InsumoId)=@ArticuloId)
 AND (@Origen IS NULL OR m.EntidadOrigen=@Origen)
 AND (@Estado IS NULL OR (@Estado='ANULADO' AND m.Activo=0) OR (@Estado='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Estado='VIGENTE' AND m.Activo=1 AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Modalidad IS NULL OR (@Modalidad='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Modalidad='MANUAL' AND m.EntidadOrigen='AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL) OR (@Modalidad='AUTOMATICO' AND m.EntidadOrigen IS NOT NULL AND m.EntidadOrigen<>'AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Buscar IS NULL OR p.Codigo LIKE '%'+@Buscar+'%' OR p.Nombre LIKE '%'+@Buscar+'%' OR i.Codigo LIKE '%'+@Buscar+'%' OR i.Nombre LIKE '%'+@Buscar+'%'); END;

GO
/****** Objeto: StoredProcedure [dbo].[pa_Movimientos_Series] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[pa_Movimientos_Series]
 @Desde DATE,@Hasta DATE,@Clase VARCHAR(10)=NULL,@DepositoId INT=NULL,@ArticuloId INT=NULL,@Origen VARCHAR(50)=NULL,@Estado VARCHAR(10)=NULL,@Modalidad VARCHAR(12)=NULL,@Buscar VARCHAR(120)=NULL
AS BEGIN SET NOCOUNT ON;
IF @Desde IS NULL OR @Hasta IS NULL OR @Hasta<@Desde OR @Hasta='99991231' THROW 53001,'Periodo invalido.',1;
IF @Clase IS NOT NULL AND @Clase NOT IN ('PRODUCTO','INSUMO') THROW 53002,'Clase invalida.',1;
IF @Estado IS NOT NULL AND @Estado NOT IN ('VIGENTE','ANULADO','REVERSA') THROW 53003,'Estado invalido.',1;
IF @Modalidad IS NOT NULL AND @Modalidad NOT IN ('MANUAL','AUTOMATICO','REVERSA') THROW 53004,'Modalidad invalida.',1;
SELECT CONVERT(date,m.FechaMovimiento) Fecha,
 CASE WHEN m.MovimientoStockIdReversaDe IS NOT NULL THEN 'REVERSA'
 WHEN m.EntidadOrigen='AjusteManual' THEN 'MANUAL' ELSE 'AUTOMATICO' END Modalidad,
 COALESCE(m.EntidadOrigen,'Sin origen') Origen,
 t.Signo,COUNT_BIG(*) CantidadMovimientos
FROM dbo.MovimientoStock m
JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
JOIN dbo.Deposito d ON d.DepositoId=m.DepositoId
LEFT JOIN dbo.Producto p ON p.ProductoId=m.ProductoId
LEFT JOIN dbo.Insumo i ON i.InsumoId=m.InsumoId
WHERE m.FechaMovimiento>=@Desde AND m.FechaMovimiento<DATEADD(DAY,1,@Hasta)
 AND (@Clase IS NULL OR (@Clase='PRODUCTO' AND m.ProductoId IS NOT NULL) OR (@Clase='INSUMO' AND m.InsumoId IS NOT NULL))
 AND (@DepositoId IS NULL OR m.DepositoId=@DepositoId)
 AND (@ArticuloId IS NULL OR COALESCE(m.ProductoId,m.InsumoId)=@ArticuloId)
 AND (@Origen IS NULL OR m.EntidadOrigen=@Origen)
 AND (@Estado IS NULL OR (@Estado='ANULADO' AND m.Activo=0) OR (@Estado='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Estado='VIGENTE' AND m.Activo=1 AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Modalidad IS NULL OR (@Modalidad='REVERSA' AND m.MovimientoStockIdReversaDe IS NOT NULL) OR (@Modalidad='MANUAL' AND m.EntidadOrigen='AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL) OR (@Modalidad='AUTOMATICO' AND m.EntidadOrigen IS NOT NULL AND m.EntidadOrigen<>'AjusteManual' AND m.MovimientoStockIdReversaDe IS NULL))
 AND (@Buscar IS NULL OR p.Codigo LIKE '%'+@Buscar+'%' OR p.Nombre LIKE '%'+@Buscar+'%' OR i.Codigo LIKE '%'+@Buscar+'%' OR i.Nombre LIKE '%'+@Buscar+'%')
GROUP BY CONVERT(date,m.FechaMovimiento),
 CASE WHEN m.MovimientoStockIdReversaDe IS NOT NULL THEN 'REVERSA' WHEN m.EntidadOrigen='AjusteManual' THEN 'MANUAL' ELSE 'AUTOMATICO' END,
 COALESCE(m.EntidadOrigen,'Sin origen'),t.Signo
ORDER BY Fecha,Modalidad,Origen,Signo; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ActividadComercial_Cancelar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ActividadComercial_Cancelar]
 @ActividadComercialId INT
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.ActividadComercial SET Estado='Cancelada',FechaActualizacion=SYSDATETIME()
 WHERE ActividadComercialId=@ActividadComercialId AND Estado='Pendiente';
 IF @@ROWCOUNT<>1 THROW 51043,'La actividad no existe o no está pendiente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ActividadComercial_Crear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ActividadComercial_Crear]
 @ClienteId INT,@Tipo VARCHAR(25),@Titulo NVARCHAR(150),@FechaProgramada DATETIME2(0),
 @OportunidadComercialId INT=NULL,@PresupuestoComercialId INT=NULL,
 @UsuarioResponsableId INT=NULL,@Descripcion NVARCHAR(1000)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@Titulo)),'') IS NULL THROW 51030,'El título es obligatorio.',1;
 IF @Tipo NOT IN ('Llamada','WhatsApp','Email','Reunion','Visita','Seguimiento','Otro')
  THROW 51031,'Tipo de actividad inválido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId) THROW 51032,'Cliente inexistente.',1;
 IF @OportunidadComercialId IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM dbo.OportunidadComercial WHERE OportunidadComercialId=@OportunidadComercialId AND ClienteId=@ClienteId)
  THROW 51033,'La oportunidad no pertenece al cliente.',1;
 IF @PresupuestoComercialId IS NOT NULL AND NOT EXISTS(
  SELECT 1 FROM dbo.PresupuestoComercial WHERE PresupuestoComercialId=@PresupuestoComercialId AND ClienteId=@ClienteId
  AND (@OportunidadComercialId IS NULL OR OportunidadComercialId=@OportunidadComercialId))
  THROW 51034,'El presupuesto no corresponde al cliente y oportunidad.',1;
 INSERT dbo.ActividadComercial(ClienteId,Tipo,Titulo,FechaProgramada,OportunidadComercialId,PresupuestoComercialId,UsuarioResponsableId,Descripcion)
 VALUES(@ClienteId,@Tipo,@Titulo,@FechaProgramada,@OportunidadComercialId,@PresupuestoComercialId,@UsuarioResponsableId,@Descripcion);
 SELECT CONVERT(INT,SCOPE_IDENTITY()) AS ActividadComercialId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ActividadComercial_Finalizar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ActividadComercial_Finalizar]
 @ActividadComercialId INT,@Resultado NVARCHAR(1000)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(LTRIM(RTRIM(@Resultado)),'') IS NULL THROW 51041,'Debe registrar el resultado.',1;
 UPDATE dbo.ActividadComercial SET Estado='Realizada',Resultado=@Resultado,
  FechaRealizacion=SYSDATETIME(),FechaActualizacion=SYSDATETIME()
 WHERE ActividadComercialId=@ActividadComercialId AND Estado='Pendiente';
 IF @@ROWCOUNT<>1 THROW 51042,'La actividad no existe o no está pendiente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ActividadComercial_Listar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ActividadComercial_Listar]
 @Desde DATETIME2(0)=NULL,@Hasta DATETIME2(0)=NULL,@UsuarioResponsableId INT=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT a.* FROM dbo.ActividadComercial a
 WHERE (@Desde IS NULL OR a.FechaProgramada>=@Desde)
 AND (@Hasta IS NULL OR a.FechaProgramada<DATEADD(DAY,1,CONVERT(DATE,@Hasta)))
 AND (@UsuarioResponsableId IS NULL OR a.UsuarioResponsableId=@UsuarioResponsableId)
 ORDER BY a.FechaProgramada,a.ActividadComercialId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ActividadComercial_Reprogramar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ActividadComercial_Reprogramar]
 @ActividadComercialId INT,@FechaProgramada DATETIME2(0),@Descripcion NVARCHAR(1000)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.ActividadComercial SET FechaProgramada=@FechaProgramada,
  Descripcion=COALESCE(@Descripcion,Descripcion),FechaActualizacion=SYSDATETIME()
 WHERE ActividadComercialId=@ActividadComercialId AND Estado='Pendiente';
 IF @@ROWCOUNT<>1 THROW 51040,'La actividad no existe o no está pendiente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_AlicuotaIVA_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ALICUOTAIVA
 
CREATE PROCEDURE [dbo].[sp_AlicuotaIVA_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        AlicuotaIVAId,
        CodigoARCA,
        Nombre,
        Porcentaje,
        Activo
    FROM dbo.AlicuotaIVA
    ORDER BY Porcentaje, Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AlicuotaIVA_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AlicuotaIVA_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        AlicuotaIVAId AS Id,
        Nombre AS Descripcion,
        Porcentaje,
        CodigoARCA
    FROM dbo.AlicuotaIVA
    WHERE Activo = 1
    ORDER BY Porcentaje, Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AplicacionCobro_Aplicar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AplicacionCobro_Aplicar]
    @CobroId                    INT,
    @ComprobanteId              INT,
    @ImporteAplicado            DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoCobroNombre VARCHAR(50);
    DECLARE @ImporteFinal DECIMAL(18,2);
    DECLARE @TotalAplicado DECIMAL(18,2);

    BEGIN TRANSACTION;

    SELECT
        @EstadoCobroNombre = ec.Nombre,
        @ImporteFinal = co.ImporteFinal
    FROM dbo.Cobro co
    INNER JOIN dbo.EstadoCobro ec
        ON co.EstadoCobroId = ec.EstadoCobroId
    WHERE co.CobroId = @CobroId;

    IF @EstadoCobroNombre <> 'Confirmado'
    BEGIN
        RAISERROR('Solo se pueden aplicar cobros confirmados.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    SELECT @TotalAplicado = ISNULL(SUM(ImporteAplicado), 0)
    FROM dbo.AplicacionCobro
    WHERE CobroId = @CobroId;

    IF (@TotalAplicado + @ImporteAplicado) > @ImporteFinal
    BEGIN
        RAISERROR('La suma aplicada supera el importe final del cobro.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    INSERT INTO dbo.AplicacionCobro
    (
        CobroId,
        ComprobanteId,
        ImporteAplicado
    )
    VALUES
    (
        @CobroId,
        @ComprobanteId,
        @ImporteAplicado
    );

    COMMIT TRANSACTION;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AplicacionCobro_GetByCobro] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--AplicacionCobro

CREATE PROCEDURE [dbo].[sp_AplicacionCobro_GetByCobro]
    @CobroId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ac.AplicacionCobroId,
        ac.CobroId,
        ac.ComprobanteId,
        c.NumeroComprobante,
        c.FechaComprobante,
        c.ImporteTotal,
        ac.ImporteAplicado
    FROM dbo.AplicacionCobro ac
    INNER JOIN dbo.Comprobante c
        ON ac.ComprobanteId = c.ComprobanteId
    WHERE ac.CobroId = @CobroId
    ORDER BY ac.AplicacionCobroId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AplicacionCobro_GetByComprobante] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AplicacionCobro_GetByComprobante]
    @ComprobanteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ac.AplicacionCobroId,
        ac.CobroId,
        co.FechaCobro,
        co.ImporteFinal,
        ac.ComprobanteId,
        ac.ImporteAplicado
    FROM dbo.AplicacionCobro ac
    INNER JOIN dbo.Cobro co
        ON ac.CobroId = co.CobroId
    WHERE ac.ComprobanteId = @ComprobanteId
    ORDER BY ac.AplicacionCobroId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaEvento_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   AUDITORIAEVENTO
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_AuditoriaEvento_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.AuditoriaEventoId,
        a.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        a.FechaEvento,
        a.Modulo,
        a.Entidad,
        a.Accion,
        a.RegistroId,
        a.Descripcion
    FROM dbo.AuditoriaEvento a
    INNER JOIN dbo.Usuario u
        ON a.UsuarioId = u.UsuarioId
    ORDER BY a.FechaEvento DESC, a.AuditoriaEventoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaEvento_GetByUsuario] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AuditoriaEvento_GetByUsuario]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        AuditoriaEventoId,
        UsuarioId,
        FechaEvento,
        Modulo,
        Entidad,
        Accion,
        RegistroId,
        Descripcion
    FROM dbo.AuditoriaEvento
    WHERE UsuarioId = @UsuarioId
    ORDER BY FechaEvento DESC, AuditoriaEventoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaEvento_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AuditoriaEvento_Insert]
    @UsuarioId       INT,
    @Modulo          VARCHAR(50),
    @Entidad         VARCHAR(100),
    @Accion          VARCHAR(50),
    @RegistroId      INT = NULL,
    @Descripcion     VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AuditoriaEvento
    (
        UsuarioId,
        FechaEvento,
        Modulo,
        Entidad,
        Accion,
        RegistroId,
        Descripcion
    )
    VALUES
    (
        @UsuarioId,
        GETDATE(),
        @Modulo,
        @Entidad,
        @Accion,
        @RegistroId,
        @Descripcion
    );

    SELECT SCOPE_IDENTITY() AS AuditoriaEventoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaSesion_Cerrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AuditoriaSesion_Cerrar]
    @AuditoriaSesionId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.AuditoriaSesion
    SET FechaLogout = GETDATE()
    WHERE AuditoriaSesionId = @AuditoriaSesionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaSesion_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   AUDITORIASESION
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_AuditoriaSesion_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.AuditoriaSesionId,
        a.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        a.FechaLogin,
        a.FechaLogout,
        a.Exitoso,
        a.IpOrigen,
        a.Observaciones
    FROM dbo.AuditoriaSesion a
    INNER JOIN dbo.Usuario u
        ON a.UsuarioId = u.UsuarioId
    ORDER BY a.FechaLogin DESC, a.AuditoriaSesionId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaSesion_GetByUsuario] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AuditoriaSesion_GetByUsuario]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.AuditoriaSesionId,
        a.UsuarioId,
        a.FechaLogin,
        a.FechaLogout,
        a.Exitoso,
        a.IpOrigen,
        a.Observaciones
    FROM dbo.AuditoriaSesion a
    WHERE a.UsuarioId = @UsuarioId
    ORDER BY a.FechaLogin DESC, a.AuditoriaSesionId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_AuditoriaSesion_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AuditoriaSesion_Insert]
    @UsuarioId       INT,
    @Exitoso         BIT = 1,
    @IpOrigen        VARCHAR(50) = NULL,
    @Observaciones   VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AuditoriaSesion
    (
        UsuarioId,
        FechaLogin,
        Exitoso,
        IpOrigen,
        Observaciones
    )
    VALUES
    (
        @UsuarioId,
        GETDATE(),
        @Exitoso,
        @IpOrigen,
        @Observaciones
    );

    SELECT SCOPE_IDENTITY() AS AuditoriaSesionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_AgregarMovimiento] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_AgregarMovimiento]
 @BancoImportacionId bigint,@FechaMovimiento date,@Tipo varchar(10),@Importe decimal(18,2),
 @Descripcion nvarchar(500),@ReferenciaBanco nvarchar(150)=NULL,@ClaveMovimiento char(64)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @FechaMovimiento IS NULL OR @Tipo NOT IN ('Ingreso','Egreso') OR @Importe IS NULL OR @Importe<=0
 OR NULLIF(LTRIM(RTRIM(@Descripcion)),'') IS NULL OR LEN(@ClaveMovimiento)<>64 OR @ClaveMovimiento LIKE '%[^0-9A-Fa-f]%'
 THROW 52204,'Movimiento bancario invalido.',1;
 DECLARE @CuentaId int;
 SELECT @CuentaId=CuentaBancariaId FROM dbo.BancoImportacion WHERE BancoImportacionId=@BancoImportacionId AND Estado='Abierta';
 IF @CuentaId IS NULL THROW 52205,'Lote inexistente o finalizado.',1;
 INSERT dbo.BancoMovimiento(BancoImportacionId,CuentaBancariaId,FechaMovimiento,Tipo,Importe,Descripcion,ReferenciaBanco,ClaveMovimiento)
 VALUES(@BancoImportacionId,@CuentaId,@FechaMovimiento,@Tipo,@Importe,@Descripcion,@ReferenciaBanco,UPPER(@ClaveMovimiento));
 SELECT * FROM dbo.BancoMovimiento WHERE BancoMovimientoId=CONVERT(bigint,SCOPE_IDENTITY());
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_Conciliar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_Conciliar]
 @BancoMovimientoId bigint,@MovimientoFinancieroId bigint,@UsuarioId int,
 @Metodo varchar(15)='Manual',@Observaciones nvarchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Metodo NOT IN ('Manual','Automatico') OR @Metodo IS NULL THROW 52208,'Metodo invalido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 52209,'Usuario invalido.',1;
 BEGIN TRAN;
 DECLARE @BCuenta int,@BImporte decimal(18,2),@BTipo varchar(10),@BEstado varchar(15);
 SELECT @BCuenta=CuentaBancariaId,@BImporte=Importe,@BTipo=Tipo,@BEstado=Estado
 FROM dbo.BancoMovimiento WITH(UPDLOCK,HOLDLOCK) WHERE BancoMovimientoId=@BancoMovimientoId;
 DECLARE @MCuenta int,@MImporte decimal(18,2),@MTipo varchar(10),@MEstado varchar(15);
 SELECT @MCuenta=CuentaBancariaId,@MImporte=Importe,@MTipo=Tipo,@MEstado=Estado
 FROM dbo.MovimientoFinanciero WITH(UPDLOCK,HOLDLOCK) WHERE MovimientoFinancieroId=@MovimientoFinancieroId;
 IF @BEstado IS NULL OR @MEstado IS NULL OR @BEstado<>'Pendiente' OR @MEstado<>'Registrado'
 BEGIN ROLLBACK; THROW 52210,'Movimiento inexistente o no disponible.',1; END;
 IF @BCuenta IS NULL OR @MCuenta IS NULL OR @BCuenta<>@MCuenta OR @BImporte<>@MImporte OR @BTipo<>@MTipo
 BEGIN ROLLBACK; THROW 52211,'Cuenta, importe o tipo no coinciden.',1; END;
 IF EXISTS(SELECT 1 FROM dbo.BancoConciliacion WITH(UPDLOCK,HOLDLOCK)
           WHERE BancoMovimientoId=@BancoMovimientoId OR MovimientoFinancieroId=@MovimientoFinancieroId)
 BEGIN ROLLBACK; THROW 52212,'Uno de los movimientos ya esta conciliado.',1; END;
 INSERT dbo.BancoConciliacion(BancoMovimientoId,MovimientoFinancieroId,UsuarioId,Metodo,Observaciones)
 VALUES(@BancoMovimientoId,@MovimientoFinancieroId,@UsuarioId,@Metodo,@Observaciones);
 UPDATE dbo.BancoMovimiento SET Estado='Conciliado' WHERE BancoMovimientoId=@BancoMovimientoId;
 COMMIT;
 SELECT * FROM dbo.BancoConciliacion WHERE BancoConciliacionId=CONVERT(bigint,SCOPE_IDENTITY());
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_CrearImportacion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_CrearImportacion]
 @CuentaBancariaId int,@NombreArchivo nvarchar(255),@HuellaArchivo char(64),@UsuarioId int
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.CuentaBancariaTEKA WHERE CuentaBancariaId=@CuentaBancariaId AND Activa=1)
 THROW 52201,'Cuenta bancaria invalida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
 THROW 52202,'Usuario invalido.',1;
 IF NULLIF(LTRIM(RTRIM(@NombreArchivo)),'') IS NULL OR LEN(@HuellaArchivo)<>64 OR @HuellaArchivo LIKE '%[^0-9A-Fa-f]%'
 THROW 52203,'Nombre o huella SHA-256 invalida.',1;
 INSERT dbo.BancoImportacion(CuentaBancariaId,NombreArchivo,HuellaArchivo,UsuarioId)
 VALUES(@CuentaBancariaId,@NombreArchivo,UPPER(@HuellaArchivo),@UsuarioId);
 SELECT * FROM dbo.BancoImportacion WHERE BancoImportacionId=CONVERT(bigint,SCOPE_IDENTITY());
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_FinalizarImportacion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_FinalizarImportacion] @BancoImportacionId bigint
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.BancoImportacion SET Estado='Finalizada'
 WHERE BancoImportacionId=@BancoImportacionId AND Estado='Abierta';
 IF @@ROWCOUNT=0 THROW 52206,'Lote inexistente o finalizado.',1;
 SELECT * FROM dbo.BancoImportacion WHERE BancoImportacionId=@BancoImportacionId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_ListarMovimientos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_ListarMovimientos]
 @CuentaBancariaId int,@Estado varchar(15)=NULL,@Desde date=NULL,@Hasta date=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT b.*,c.MovimientoFinancieroId,c.FechaConciliacion,c.Metodo
 FROM dbo.BancoMovimiento b
 LEFT JOIN dbo.BancoConciliacion c ON c.BancoMovimientoId=b.BancoMovimientoId
 WHERE b.CuentaBancariaId=@CuentaBancariaId
 AND (@Estado IS NULL OR b.Estado=@Estado)
 AND (@Desde IS NULL OR b.FechaMovimiento>=@Desde)
 AND (@Hasta IS NULL OR b.FechaMovimiento<=@Hasta)
 ORDER BY b.FechaMovimiento DESC,b.BancoMovimientoId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Banco_SugerirConciliaciones] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Banco_SugerirConciliaciones]
 @CuentaBancariaId int,@DiasTolerancia int=3
AS
BEGIN
 SET NOCOUNT ON;
 IF @DiasTolerancia<0 OR @DiasTolerancia>30 THROW 52207,'Tolerancia de fechas invalida.',1;
 /* Solo propuestas: no modifican datos. Referencia + importe + tipo + cuenta.
    Se excluyen referencias repetidas y multiples candidatos. */
 ;WITH Pares AS (
 SELECT b.BancoMovimientoId,m.MovimientoFinancieroId,b.FechaMovimiento,m.FechaOperacion,
 b.Importe,b.ReferenciaBanco,
 COUNT(*) OVER(PARTITION BY b.BancoMovimientoId) AS CandidatosBanco,
 COUNT(*) OVER(PARTITION BY m.MovimientoFinancieroId) AS CandidatosInternos
 FROM dbo.BancoMovimiento b
 JOIN dbo.MovimientoFinanciero m ON m.CuentaBancariaId=b.CuentaBancariaId
 AND m.Tipo=b.Tipo AND m.Importe=b.Importe AND m.Estado='Registrado'
 AND NULLIF(LTRIM(RTRIM(m.ReferenciaExterna)),'') IS NOT NULL
 AND LTRIM(RTRIM(m.ReferenciaExterna))=LTRIM(RTRIM(b.ReferenciaBanco))
 AND ABS(DATEDIFF(DAY,CONVERT(date,m.FechaOperacion),b.FechaMovimiento))<=@DiasTolerancia
 WHERE b.CuentaBancariaId=@CuentaBancariaId AND b.Estado='Pendiente'
 AND NOT EXISTS(SELECT 1 FROM dbo.BancoConciliacion c WHERE c.MovimientoFinancieroId=m.MovimientoFinancieroId)
 )
 SELECT BancoMovimientoId,MovimientoFinancieroId,FechaMovimiento,FechaOperacion,Importe,ReferenciaBanco,
 CASE WHEN CandidatosBanco=1 AND CandidatosInternos=1 THEN 'CoincidenciaUnica' ELSE 'Ambigua' END AS Evaluacion
 FROM Pares ORDER BY FechaMovimiento,BancoMovimientoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Caja_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Caja
CREATE PROCEDURE [dbo].[sp_Caja_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CajaId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.Caja
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Caja_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Caja_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CajaId AS Id,
        Nombre AS Descripcion
    FROM dbo.Caja
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaConcepto_Estado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaConcepto_Estado] @CajaConceptoId int,@Activo bit,@UsuarioId int
AS BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51082,'Usuario inválido.',1;
 UPDATE dbo.CajaConcepto SET Activo=@Activo WHERE CajaConceptoId=@CajaConceptoId;
 IF @@ROWCOUNT=0 THROW 51084,'Concepto inexistente.',1;
 SELECT * FROM dbo.CajaConcepto WHERE CajaConceptoId=@CajaConceptoId;
END
GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaConcepto_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaConcepto_Guardar]
 @Codigo varchar(30),@Nombre nvarchar(120),@Tipo varchar(25),@UsuarioId int,@CajaConceptoId int=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51082,'Usuario inválido.',1;
 IF NULLIF(LTRIM(RTRIM(@Codigo)),'') IS NULL OR NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL
 OR @Tipo NOT IN('IngresoManual','Gasto','Retiro','Reposicion') THROW 51083,'Datos del concepto inválidos.',1;
 BEGIN TRY
 BEGIN TRAN;
 IF @CajaConceptoId IS NULL BEGIN
   INSERT dbo.CajaConcepto(Codigo,Nombre,Tipo) VALUES(LTRIM(RTRIM(@Codigo)),LTRIM(RTRIM(@Nombre)),@Tipo);
   SET @CajaConceptoId=CONVERT(int,SCOPE_IDENTITY());
 END ELSE BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.CajaConcepto WITH(UPDLOCK,HOLDLOCK) WHERE CajaConceptoId=@CajaConceptoId) THROW 51084,'Concepto inexistente.',1;
   IF EXISTS(SELECT 1 FROM dbo.CajaMovimiento WHERE CajaConceptoId=@CajaConceptoId)
      AND EXISTS(SELECT 1 FROM dbo.CajaConcepto WHERE CajaConceptoId=@CajaConceptoId AND (Codigo<>@Codigo OR Tipo<>@Tipo))
      THROW 51085,'No se puede cambiar código o tipo de un concepto utilizado.',1;
   UPDATE dbo.CajaConcepto SET Codigo=LTRIM(RTRIM(@Codigo)),Nombre=LTRIM(RTRIM(@Nombre)),Tipo=@Tipo WHERE CajaConceptoId=@CajaConceptoId;
 END;
 COMMIT;
 SELECT * FROM dbo.CajaConcepto WHERE CajaConceptoId=@CajaConceptoId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END
GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_Abrir] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_Abrir]
 @CajaId int,@UsuarioId int,@EfectivoInicial decimal(18,2),@Observacion varchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @EfectivoInicial<0 OR @EfectivoInicial IS NULL THROW 51004,'Efectivo inicial invalido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51005,'Usuario invalido o inactivo.',1;
 BEGIN TRAN;
 DECLARE @Fondo decimal(18,2);
 SELECT @Fondo=cc.FondoFijoObjetivo FROM dbo.CajaConfiguracion cc WITH(UPDLOCK,HOLDLOCK)
 JOIN dbo.Caja c ON c.CajaId=cc.CajaId WHERE cc.CajaId=@CajaId AND cc.EsFisica=1 AND c.Activo=1;
 IF @Fondo IS NULL OR @Fondo<=0 BEGIN ROLLBACK; THROW 51006,'Configure el fondo fijo de una caja fisica activa antes de abrir.',1; END;
 IF EXISTS(SELECT 1 FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK) WHERE CajaId=@CajaId AND Estado='Abierta')
 BEGIN ROLLBACK; THROW 51007,'La caja ya tiene una sesion abierta.',1; END;
 INSERT dbo.CajaSesion(CajaId,UsuarioAperturaId,FondoObjetivoApertura,EfectivoInicial,ObservacionApertura)
 VALUES(@CajaId,@UsuarioId,@Fondo,@EfectivoInicial,@Observacion);
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 COMMIT;
 SELECT * FROM dbo.CajaSesion WHERE CajaSesionId=@Id;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_Arqueo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_Arqueo]
 @CajaSesionId bigint,@UsuarioId int,@EfectivoContado decimal(18,2),@Observaciones varchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @EfectivoContado<0 OR @EfectivoContado IS NULL THROW 51014,'Efectivo contado invalido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51015,'Usuario invalido o inactivo.',1;
 BEGIN TRAN;
 DECLARE @Inicial decimal(18,2);
 SELECT @Inicial=EfectivoInicial FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK)
 WHERE CajaSesionId=@CajaSesionId AND Estado='Abierta';
 IF @Inicial IS NULL BEGIN ROLLBACK; THROW 51016,'Sesion inexistente o cerrada.',1; END;
 DECLARE @Esperado decimal(28,2);
 SELECT @Esperado=@Inicial+COALESCE(SUM(CASE WHEN Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE -Importe END),0)
 FROM dbo.CajaMovimiento WHERE CajaSesionId=@CajaSesionId;
 DECLARE @UltimoMovimientoId bigint;
 SELECT @UltimoMovimientoId=MAX(CajaMovimientoId) FROM dbo.CajaMovimiento WHERE CajaSesionId=@CajaSesionId;
 INSERT dbo.CajaArqueo(CajaSesionId,UsuarioId,EfectivoEsperado,EfectivoContado,Diferencia,UltimoMovimientoId,Observaciones)
 VALUES(@CajaSesionId,@UsuarioId,@Esperado,@EfectivoContado,@EfectivoContado-@Esperado,@UltimoMovimientoId,@Observaciones);
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 COMMIT;
 SELECT * FROM dbo.CajaArqueo WHERE CajaArqueoId=@Id;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_Cerrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_Cerrar]
 @CajaSesionId bigint,@UsuarioId int,@ObservacionCierre varchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51017,'Usuario invalido o inactivo.',1;
 BEGIN TRAN;
 DECLARE @Inicial decimal(18,2);
 SELECT @Inicial=EfectivoInicial FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK)
 WHERE CajaSesionId=@CajaSesionId AND Estado='Abierta';
 IF @Inicial IS NULL BEGIN ROLLBACK; THROW 51018,'Sesion inexistente o ya cerrada.',1; END;
 DECLARE @UltimoArqueo bigint,@Contado decimal(18,2),@EsperadoArqueo decimal(18,2),@UltimoMovimientoArqueo bigint;
 SELECT TOP(1) @UltimoArqueo=CajaArqueoId,@Contado=EfectivoContado,@EsperadoArqueo=EfectivoEsperado,@UltimoMovimientoArqueo=UltimoMovimientoId
 FROM dbo.CajaArqueo WHERE CajaSesionId=@CajaSesionId ORDER BY CajaArqueoId DESC;
 IF @UltimoArqueo IS NULL BEGIN ROLLBACK; THROW 51019,'Debe realizar un arqueo antes del cierre.',1; END;
 DECLARE @Esperado decimal(28,2);
 SELECT @Esperado=@Inicial+COALESCE(SUM(CASE WHEN Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE -Importe END),0)
 FROM dbo.CajaMovimiento WHERE CajaSesionId=@CajaSesionId;
 IF @Esperado<>@EsperadoArqueo OR EXISTS(SELECT 1 FROM dbo.CajaMovimiento WHERE CajaSesionId=@CajaSesionId AND (@UltimoMovimientoArqueo IS NULL OR CajaMovimientoId>@UltimoMovimientoArqueo))
 BEGIN ROLLBACK; THROW 51020,'Existen movimientos posteriores al arqueo; realice uno nuevo.',1; END;
 IF @Contado<>@Esperado AND NULLIF(LTRIM(RTRIM(@ObservacionCierre)),'') IS NULL
 BEGIN ROLLBACK; THROW 51021,'La diferencia de arqueo requiere observacion de cierre.',1; END;
 UPDATE dbo.CajaSesion SET Estado='Cerrada',FechaCierre=SYSDATETIME(),UsuarioCierreId=@UsuarioId,
 EfectivoEsperadoCierre=@Esperado,EfectivoContadoCierre=@Contado,DiferenciaCierre=@Contado-@Esperado,
 ObservacionCierre=@ObservacionCierre WHERE CajaSesionId=@CajaSesionId;
 COMMIT;
 SELECT * FROM dbo.CajaSesion WHERE CajaSesionId=@CajaSesionId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_ConfigurarFondo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_ConfigurarFondo]
 @CajaId int, @FondoFijoObjetivo decimal(18,2), @UsuarioId int
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @FondoFijoObjetivo<=0 THROW 51001,'El fondo fijo debe ser mayor que cero.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51002,'Usuario invalido o inactivo.',1;
 BEGIN TRAN;
 IF NOT EXISTS(SELECT 1 FROM dbo.CajaConfiguracion WITH(UPDLOCK,HOLDLOCK) WHERE CajaId=@CajaId AND EsFisica=1)
 BEGIN ROLLBACK; THROW 51003,'La caja no esta configurada como fisica.',1; END;
 UPDATE dbo.CajaConfiguracion SET FondoFijoObjetivo=@FondoFijoObjetivo,FechaActualizacion=SYSDATETIME(),UsuarioActualizacionId=@UsuarioId WHERE CajaId=@CajaId;
 COMMIT;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_Consultar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_Consultar]
 @CajaId int=NULL,@SoloAbiertas bit=0
AS
BEGIN
 SET NOCOUNT ON;
 SELECT s.*, c.Nombre AS NombreCaja,
  CONVERT(decimal(28,2),s.EfectivoInicial+COALESCE(m.Variacion,0)) AS EfectivoEsperadoActual,
  (SELECT COUNT(*) FROM dbo.CajaMovimiento x WHERE x.CajaSesionId=s.CajaSesionId) AS CantidadMovimientos
 FROM dbo.CajaSesion s JOIN dbo.Caja c ON c.CajaId=s.CajaId
 OUTER APPLY(SELECT SUM(CASE WHEN Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE -Importe END) AS Variacion
 FROM dbo.CajaMovimiento WHERE CajaSesionId=s.CajaSesionId) m
 WHERE (@CajaId IS NULL OR s.CajaId=@CajaId) AND (@SoloAbiertas=0 OR s.Estado='Abierta')
 ORDER BY s.CajaSesionId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_ListarMovimientos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_ListarMovimientos]
 @CajaSesionId bigint
AS
BEGIN
 SET NOCOUNT ON;
 SELECT m.* FROM dbo.CajaMovimiento m WHERE m.CajaSesionId=@CajaSesionId ORDER BY m.Fecha DESC,m.CajaMovimientoId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaDiaria_RegistrarMovimiento] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaDiaria_RegistrarMovimiento]
 @CajaSesionId bigint,@UsuarioId int,@Tipo varchar(25),@Importe decimal(18,2),
 @Concepto varchar(250),@Referencia varchar(150)=NULL,@Observaciones varchar(500)=NULL,@CajaConceptoId int=NULL,@ClaveOperacion uniqueidentifier=NULL
AS BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Tipo IS NULL OR @Tipo NOT IN('IngresoManual','Gasto','Retiro','Reposicion') THROW 51008,'Tipo manual no permitido.',1;
 IF @Importe IS NULL OR @Importe<=0 THROW 51009,'El importe debe ser mayor que cero.',1;
 IF NULLIF(LTRIM(RTRIM(@Concepto)),'') IS NULL THROW 51010,'La descripción es obligatoria.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 51011,'Usuario inválido o inactivo.',1;
 BEGIN TRY
 BEGIN TRAN;
 IF @ClaveOperacion IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.CajaMovimiento WITH(UPDLOCK,HOLDLOCK) WHERE ClaveOperacion=@ClaveOperacion)
 BEGIN
  IF NOT EXISTS(SELECT 1 FROM dbo.CajaMovimiento WHERE ClaveOperacion=@ClaveOperacion AND CajaSesionId=@CajaSesionId AND UsuarioId=@UsuarioId
    AND Tipo=@Tipo AND Importe=@Importe AND Concepto=@Concepto AND ISNULL(Referencia,'')=ISNULL(@Referencia,'')
    AND ISNULL(Observaciones,'')=ISNULL(@Observaciones,'') AND ISNULL(CajaConceptoId,0)=ISNULL(@CajaConceptoId,0))
    THROW 51089,'La clave de operacion ya fue utilizada con otros datos.',1;
  COMMIT; SELECT * FROM dbo.CajaMovimiento WHERE ClaveOperacion=@ClaveOperacion; RETURN;
 END;
 IF (SELECT COUNT(*) FROM dbo.Caja c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.CajaConfiguracion cfg WITH(UPDLOCK,HOLDLOCK) ON cfg.CajaId=c.CajaId WHERE cfg.EsFisica=1 AND c.Activo=1)<>1
  OR NOT EXISTS(SELECT 1 FROM dbo.CajaSesion s JOIN dbo.Caja c ON c.CajaId=s.CajaId JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId
    WHERE s.CajaSesionId=@CajaSesionId AND cfg.EsFisica=1 AND c.Activo=1) THROW 51022,'La operacion requiere Caja Principal fisica.',1;
 DECLARE @Inicial decimal(18,2),@Saldo decimal(28,2);
 SELECT @Inicial=EfectivoInicial FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK) WHERE CajaSesionId=@CajaSesionId AND Estado='Abierta';
 IF @Inicial IS NULL THROW 51012,'Sesión de caja inexistente o cerrada.',1;
 IF @CajaConceptoId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.CajaConcepto WITH(UPDLOCK,HOLDLOCK)
   WHERE CajaConceptoId=@CajaConceptoId AND Tipo=@Tipo AND Activo=1) THROW 51086,'El concepto no está activo o no corresponde al tipo.',1;
 SELECT @Saldo=@Inicial+COALESCE(SUM(CASE WHEN Tipo IN('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE -Importe END),0)
 FROM dbo.CajaMovimiento WHERE CajaSesionId=@CajaSesionId;
 IF @Tipo IN('Gasto','Retiro') AND @Saldo<@Importe THROW 51013,'Efectivo insuficiente para el egreso.',1;
 INSERT dbo.CajaMovimiento(CajaSesionId,Tipo,Importe,Concepto,Referencia,Observaciones,UsuarioId,CajaConceptoId,ClaveOperacion)
 VALUES(@CajaSesionId,@Tipo,@Importe,@Concepto,@Referencia,@Observaciones,@UsuarioId,@CajaConceptoId,@ClaveOperacion);
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 COMMIT;
 SELECT * FROM dbo.CajaMovimiento WHERE CajaMovimientoId=@Id;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END
GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaFin_ListarMovimientos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaFin_ListarMovimientos]
 @Desde date=NULL,@Hasta date=NULL,@Tipo varchar(10)=NULL,@Medio varchar(30)=NULL,
 @Estado varchar(15)=NULL,@CanalVentaId int=NULL,@CuentaBancariaId int=NULL,
 @OrigenTipo varchar(30)=NULL,@SoloEfectivo bit=0,@Pagina int=1,@TamanoPagina int=50
AS
BEGIN
 SET NOCOUNT ON;
 IF @Pagina<1 OR @TamanoPagina<1 OR @TamanoPagina>200 OR (@Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta)
 THROW 52108,'Filtros o paginacion invalidos.',1;
 /* CajaMovimiento = efectivo; MovimientoFinanciero = otros medios. No sumar dos veces. */
 ;WITH Libro AS (
 SELECT CAST('Caja' AS varchar(15)) AS Fuente,cm.CajaMovimientoId AS MovimientoId,cm.Fecha AS Fecha,
 CASE WHEN cm.Tipo IN ('IngresoManual','Reposicion','IngresoCobro') THEN 'Ingreso' ELSE 'Egreso' END AS Tipo,
 CAST('Efectivo' AS varchar(30)) AS Medio,cm.Importe,CAST('Registrado' AS varchar(15)) AS Estado,
 cm.Concepto,CAST(CASE WHEN cm.Tipo='IngresoCobro' THEN 'Cobro' ELSE 'Caja' END AS varchar(30)) AS OrigenTipo,
 CAST(NULL AS int) AS CanalVentaId,CAST(NULL AS int) AS CuentaBancariaId,cm.Referencia
 FROM dbo.CajaMovimiento cm
 UNION ALL
 SELECT 'Financiero',mf.MovimientoFinancieroId,mf.FechaOperacion,mf.Tipo,mf.Medio,mf.Importe,mf.Estado,
 CONVERT(nvarchar(250),mf.Concepto),mf.OrigenTipo,mf.CanalVentaId,mf.CuentaBancariaId,CONVERT(nvarchar(150),mf.ReferenciaExterna)
 FROM dbo.MovimientoFinanciero mf
 )
 SELECT Fuente,MovimientoId,Fecha,Tipo,Medio,Importe,Estado,Concepto,OrigenTipo,CanalVentaId,CuentaBancariaId,Referencia,
 COUNT_BIG(*) OVER() AS TotalRegistros
 FROM Libro
 WHERE (@Desde IS NULL OR Fecha>=@Desde)
 AND (@Hasta IS NULL OR Fecha<DATEADD(DAY,1,CONVERT(datetime2(0),@Hasta)))
 AND (@Tipo IS NULL OR Tipo=@Tipo) AND (@Medio IS NULL OR Medio=@Medio)
 AND (@Estado IS NULL OR Estado=@Estado)
 AND (@CanalVentaId IS NULL OR CanalVentaId=@CanalVentaId)
 AND (@CuentaBancariaId IS NULL OR CuentaBancariaId=@CuentaBancariaId)
 AND (@OrigenTipo IS NULL OR OrigenTipo=@OrigenTipo)
 AND (@SoloEfectivo=0 OR Medio='Efectivo')
 ORDER BY Fecha DESC,Fuente,MovimientoId DESC
 OFFSET (@Pagina-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CajaFin_RegistrarMovimiento] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_CajaFin_RegistrarMovimiento]
 @FechaOperacion datetime2(0),@Tipo varchar(10),@Medio varchar(30),@Importe decimal(18,2),
 @Concepto nvarchar(250),@OrigenTipo varchar(30),@OrigenId bigint,@UsuarioId int,
 @CuentaBancariaId int=NULL,@CanalVentaId int=NULL,@MedioCobroId int=NULL,
 @CobroId int=NULL,@ReferenciaExterna nvarchar(150)=NULL,@Observaciones nvarchar(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Importe IS NULL OR @Importe<=0 THROW 52101,'Importe invalido.',1;
 IF @Tipo IS NULL OR @Medio IS NULL OR @OrigenTipo IS NULL OR @FechaOperacion IS NULL OR @Tipo NOT IN ('Ingreso','Egreso') OR @Medio NOT IN
 ('Transferencia','Tarjeta','Pasarela','Deposito','Cheque','OtroElectronico')
 OR @OrigenTipo NOT IN ('Cobro','OrdenPagoProveedor','Devolucion','Gasto','AjusteAutorizado','Otro')
 OR @OrigenId IS NULL OR @OrigenId<=0 OR NULLIF(LTRIM(RTRIM(@Concepto)),'') IS NULL
 THROW 52102,'Datos de movimiento invalidos.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
 THROW 52103,'Usuario invalido.',1;
 IF @CuentaBancariaId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.CuentaBancariaTEKA WHERE CuentaBancariaId=@CuentaBancariaId AND Activa=1)
 THROW 52104,'Cuenta bancaria invalida.',1;
 IF @OrigenTipo='Cobro' AND (@CobroId IS NULL OR @OrigenId<>CONVERT(bigint,@CobroId))
 THROW 52105,'Un movimiento de cobro requiere CobroId coincidente.',1;
 IF @CobroId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Cobro WHERE CobroId=@CobroId)
 THROW 52106,'Cobro inexistente.',1;
 /* Por seguridad, el alta financiera de un cobro solo podra ser habilitada
    por una integracion especifica posterior a la validacion de Ventas.
    No permitir insercion manual que anticipe un cobro no confirmado. */
 IF @OrigenTipo NOT IN('Gasto','AjusteAutorizado','Otro') OR @CobroId IS NOT NULL THROW 52107,'Registrar cobros, reintegros y pagos desde su circuito de origen, no manualmente.',1;
 BEGIN TRY
 BEGIN TRAN;
 IF EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero WITH(UPDLOCK,HOLDLOCK) WHERE OrigenTipo=@OrigenTipo AND OrigenId=@OrigenId)
 BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero WHERE OrigenTipo=@OrigenTipo AND OrigenId=@OrigenId AND Estado='Registrado'
    AND Tipo=@Tipo AND Medio=@Medio AND Importe=@Importe AND Concepto=@Concepto AND FechaOperacion=@FechaOperacion
    AND UsuarioRegistroId=@UsuarioId AND ISNULL(CuentaBancariaId,0)=ISNULL(@CuentaBancariaId,0)
    AND ISNULL(CanalVentaId,0)=ISNULL(@CanalVentaId,0) AND ISNULL(MedioCobroId,0)=ISNULL(@MedioCobroId,0)
    AND ISNULL(ReferenciaExterna,'')=ISNULL(@ReferenciaExterna,'') AND ISNULL(Observaciones,'')=ISNULL(@Observaciones,''))
    THROW 52109,'El origen ya existe con otros datos: no se registrara otro movimiento.',1;
   COMMIT;
   SELECT * FROM dbo.MovimientoFinanciero WHERE OrigenTipo=@OrigenTipo AND OrigenId=@OrigenId;
   RETURN;
 END;
 INSERT dbo.MovimientoFinanciero(FechaOperacion,Tipo,Medio,Importe,Concepto,OrigenTipo,OrigenId,
 UsuarioRegistroId,CuentaBancariaId,CanalVentaId,MedioCobroId,CobroId,ReferenciaExterna,Observaciones)
 VALUES(@FechaOperacion,@Tipo,@Medio,@Importe,@Concepto,@OrigenTipo,@OrigenId,
 @UsuarioId,@CuentaBancariaId,@CanalVentaId,@MedioCobroId,@CobroId,@ReferenciaExterna,@Observaciones);
 DECLARE @Id bigint=CONVERT(bigint,SCOPE_IDENTITY());
 COMMIT;
 SELECT * FROM dbo.MovimientoFinanciero WHERE MovimientoFinancieroId=@Id;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_CanalVenta_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--Tablas Auxiliares:

-- CANALVENTA

CREATE PROCEDURE [dbo].[sp_CanalVenta_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CanalVentaId,
        Nombre,
        Activo
    FROM dbo.CanalVenta
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_CanalVenta_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_CanalVenta_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CanalVentaId AS Id,
        Nombre AS Descripcion
    FROM dbo.CanalVenta
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_AsignarCliente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Carrito_AsignarCliente] @CarritoId INT,@ClienteId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId AND Activo=1) BEGIN RAISERROR('El cliente no existe o está inactivo.',16,1); RETURN; END;
 IF EXISTS(SELECT 1 FROM dbo.Carrito WHERE ClienteId=@ClienteId AND Estado='Activo' AND CarritoId<>@CarritoId) BEGIN RAISERROR('El cliente ya posee otro carrito activo.',16,1); RETURN; END;
 UPDATE dbo.Carrito SET ClienteId=@ClienteId,FechaUltimaActividad=GETDATE() WHERE CarritoId=@CarritoId AND Estado='Activo';
 IF @@ROWCOUNT=0 RAISERROR('El carrito no existe o no está activo.',16,1);
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_ConvertirEnPedido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Carrito_ConvertirEnPedido]
@CarritoId INT, @Observaciones VARCHAR(250)=NULL, @ProductoRecorteId INT=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ClienteId INT,@EstadoPedidoId INT,@CanalId INT,@PedidoId INT,
 @Total DECIMAL(18,2),@EstadoInteresConcretado INT,
 @ProductoId INT,@Cantidad DECIMAL(18,2),@DepositoId INT,@Cupo DECIMAL(18,2),
 @Fisico DECIMAL(18,2),@Reservado DECIMAL(18,2),@LockResult INT, @LockResource NVARCHAR(255), @FichaResource NVARCHAR(255),
 @BeneficioProductoId INT,@BeneficioPrecio DECIMAL(18,2),@BeneficioDepositoId INT,@BeneficioGratis BIT,
 @BeneficioCantidad DECIMAL(18,2),@BeneficioFisico DECIMAL(18,2),@BeneficioReservado DECIMAL(18,2),
 @Umbral DECIMAL(18,2),@SubtotalCatalogo DECIMAL(18,2),@DetalleBeneficioId INT;
 BEGIN TRY
 BEGIN TRAN;
 SELECT @ClienteId=ClienteId FROM dbo.Carrito WITH(UPDLOCK,HOLDLOCK)
 WHERE CarritoId=@CarritoId AND Estado IN('Activo','Abandonado') AND PedidoIdConvertido IS NULL;
 IF @ClienteId IS NULL THROW 52010,'El carrito debe estar disponible y asociado a un cliente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.DetalleCarrito WHERE CarritoId=@CarritoId)
 THROW 52011,'El carrito esta vacio.',1;
 SELECT @EstadoPedidoId=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Pendiente';
 SELECT TOP(1) @CanalId=CanalVentaId FROM dbo.CanalVenta WHERE Nombre IN('E-commerce','Ecommerce') AND Activo=1 ORDER BY CanalVentaId;
 SELECT @EstadoInteresConcretado=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='Concretado';
 IF @EstadoPedidoId IS NULL OR @CanalId IS NULL THROW 52012,'Falta configurar Pendiente o E-commerce.',1;
 CREATE TABLE #Lineas(ProductoId INT NOT NULL PRIMARY KEY,Cantidad DECIMAL(18,2) NOT NULL,
  PrecioUnitario DECIMAL(18,2) NOT NULL,Subtotal DECIMAL(18,2) NOT NULL);
 IF EXISTS(SELECT 1 FROM dbo.DetalleCarrito WHERE CarritoId=@CarritoId AND (Cantidad IS NULL OR Cantidad<=0))
 THROW 52013,'El carrito contiene cantidades invalidas.',1;
 INSERT #Lineas
 SELECT dc.ProductoId,SUM(dc.Cantidad),pv.Precio,SUM(dc.Cantidad)*pv.Precio
 FROM dbo.DetalleCarrito dc
 CROSS APPLY (SELECT TOP 1 p.Precio FROM dbo.PrecioVenta p
  WHERE p.ProductoId=dc.ProductoId AND p.Activo=1 AND p.FechaVigenciaDesde<=GETDATE()
   AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta>=GETDATE())
  ORDER BY p.FechaVigenciaDesde DESC,p.PrecioVentaId DESC) pv
 WHERE dc.CarritoId=@CarritoId GROUP BY dc.ProductoId,pv.Precio;
 /* Promocion unica mas beneficiosa por producto; no acumulable. */
 ;WITH Descuentos AS (
 SELECT l.ProductoId, MAX(CASE WHEN p.TipoDescuento='PORCENTAJE'
   THEN ROUND(l.PrecioUnitario*p.ValorDescuento/100.0,2)
   ELSE p.ValorDescuento END) AS Descuento
 FROM #Lineas l JOIN dbo.EcommercePromocionProducto pp ON pp.ProductoId=l.ProductoId
 JOIN dbo.EcommercePromocion p ON p.PromocionId=pp.PromocionId
 WHERE p.Activa=1 AND SYSDATETIME()>=p.FechaDesde AND SYSDATETIME()<p.FechaHasta
 GROUP BY l.ProductoId
 )
 UPDATE l SET PrecioUnitario=CAST(CASE WHEN l.PrecioUnitario>d.Descuento THEN l.PrecioUnitario-d.Descuento ELSE 0 END AS DECIMAL(18,2)),
 Subtotal=CAST(l.Cantidad*(CASE WHEN l.PrecioUnitario>d.Descuento THEN l.PrecioUnitario-d.Descuento ELSE 0 END) AS DECIMAL(18,2))
 FROM #Lineas l JOIN Descuentos d ON d.ProductoId=l.ProductoId;
 IF (SELECT COUNT(*) FROM #Lineas)<>(SELECT COUNT(DISTINCT ProductoId) FROM dbo.DetalleCarrito WHERE CarritoId=@CarritoId)
 THROW 52014,'Hay productos sin precio vigente.',1;
 SELECT @SubtotalCatalogo=ISNULL(SUM(Subtotal),0) FROM #Lineas;
 /* Seleccion opcional: un solo producto terminado de recortes por pedido. */
 IF @ProductoRecorteId IS NOT NULL
 BEGIN
  SELECT @Umbral=UmbralGratuidad FROM dbo.EcommerceBeneficioRecorteConfig WITH(UPDLOCK,HOLDLOCK)
   WHERE ConfiguracionId=1 AND Activo=1;
  IF @Umbral IS NULL THROW 53121,'El beneficio por recortes no esta habilitado.',1;
  SELECT @BeneficioProductoId=r.ProductoId,@BeneficioPrecio=r.PrecioSimbolico,
   @BeneficioCantidad=r.CantidadHabilitada
  FROM dbo.EcommerceProductoRecorte r WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.OrdenProduccion op ON op.OrdenProduccionId=r.OrdenProduccionId
  JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=op.EstadoOrdenProduccionId
  WHERE r.ProductoRecorteId=@ProductoRecorteId AND r.Activo=1
   AND op.RecorteProductoSugeridoId IS NOT NULL AND op.CantidadProducida>=r.CantidadHabilitada
   AND e.Nombre IN('Finalizada','Finalizado');
  IF @BeneficioProductoId IS NULL THROW 53122,'El mueble de recortes no esta terminado o habilitado.',1;
  IF EXISTS(SELECT 1 FROM #Lineas WHERE ProductoId=@BeneficioProductoId)
   THROW 53123,'El producto del beneficio no puede repetirse en el carrito.',1;
  SET @BeneficioGratis=CASE WHEN @SubtotalCatalogo>=@Umbral THEN 1 ELSE 0 END;
  IF @BeneficioGratis=1 SET @BeneficioPrecio=0;
  SELECT @BeneficioDepositoId=DepositoId FROM dbo.ProductoDisponibilidadOnline
   WHERE ProductoId=@BeneficioProductoId AND CupoOnline>=1;
  IF @BeneficioDepositoId IS NULL THROW 53124,'El mueble no tiene disponibilidad online habilitada.',1;
  SET @FichaResource=CONCAT('TEKA:ECOMMERCE:PRODUCTO:',@BeneficioProductoId);
  EXEC @LockResult=sys.sp_getapplock @Resource=@FichaResource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53125,'No fue posible bloquear el beneficio.',1;
  SET @LockResource=CONCAT('TEKA:STOCK:',@BeneficioProductoId,':',@BeneficioDepositoId);
  EXEC @LockResult=sys.sp_getapplock @Resource=@LockResource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53126,'No fue posible bloquear el stock del beneficio.',1;
  SELECT @BeneficioFisico=ISNULL(CantidadActual,0) FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
   WHERE ProductoId=@BeneficioProductoId AND DepositoId=@BeneficioDepositoId;
  IF ISNULL(@BeneficioFisico,0)<1 THROW 53127,'Sin stock del mueble de recortes.',1;
  IF (SELECT COUNT(*) FROM dbo.EcommerceBeneficioRecortePedido bp WITH(UPDLOCK,HOLDLOCK)
      JOIN dbo.Pedido pp ON pp.PedidoId=bp.PedidoId JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=pp.EstadoPedidoId
      WHERE bp.ProductoRecorteId=@ProductoRecorteId AND ep.Nombre NOT IN('Cancelado','Cancelada')) >= @BeneficioCantidad
   THROW 53128,'Se alcanzo el cupo de unidades fabricadas para este beneficio.',1;
  IF (SELECT CupoOnline FROM dbo.ProductoDisponibilidadOnline WHERE ProductoId=@BeneficioProductoId)
     <1 THROW 53129,'Sin cupo online para el beneficio.',1;
 END;
 SET @Total=@SubtotalCatalogo+ISNULL(@BeneficioPrecio,0);
 INSERT dbo.Pedido(FechaPedido,ClienteId,CanalVentaId,EstadoPedidoId,Total,Observaciones)
 VALUES(GETDATE(),@ClienteId,@CanalId,@EstadoPedidoId,@Total,ISNULL(@Observaciones,'Pedido generado desde carrito e-commerce'));
 SET @PedidoId=SCOPE_IDENTITY();
 INSERT dbo.DetallePedido(PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal)
 SELECT @PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal FROM #Lineas;
 IF @ProductoRecorteId IS NOT NULL
 BEGIN
  INSERT dbo.DetallePedido(PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal)
  VALUES(@PedidoId,@BeneficioProductoId,1,@BeneficioPrecio,@BeneficioPrecio);
  SET @DetalleBeneficioId=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.EcommerceBeneficioRecortePedido(PedidoId,ProductoRecorteId,DetallePedidoId,PrecioAplicado,EsGratuito)
  VALUES(@PedidoId,@ProductoRecorteId,@DetalleBeneficioId,@BeneficioPrecio,@BeneficioGratis);
 END;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,Observaciones)
 VALUES(@PedidoId,@EstadoPedidoId,'Pedido confirmado desde carrito e-commerce sin reservas');
 UPDATE dbo.Carrito SET Estado='Convertido',PedidoIdConvertido=@PedidoId,
 FechaConversion=GETDATE(),FechaUltimaActividad=GETDATE(),CheckoutCompletadoFecha=SYSDATETIME(),Activo=0 WHERE CarritoId=@CarritoId;
 UPDATE dbo.InteresComercial SET EstadoInteresComercialId=@EstadoInteresConcretado,
 FechaCierre=GETDATE(),FechaUltimaActividad=GETDATE(),Activo=0
 WHERE CarritoId=@CarritoId AND OportunidadComercialId IS NULL AND @EstadoInteresConcretado IS NOT NULL;
 EXEC dbo.sp_Pedido_ConfirmarPagado @PedidoId=@PedidoId,@DepositoId=3,@Observaciones='Checkout e-commerce confirmado';
 COMMIT;
 SELECT @PedidoId PedidoId,@ClienteId ClienteId,@Total Total;
 END TRY BEGIN CATCH IF CURSOR_STATUS('local','cur')>=0 CLOSE cur;
 IF CURSOR_STATUS('local','cur')>=-1 DEALLOCATE cur;
 IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_EliminarItem] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Carrito_EliminarItem] @CarritoId INT,@ProductoId INT
AS
BEGIN SET NOCOUNT ON; DELETE dbo.DetalleCarrito WHERE CarritoId=@CarritoId AND ProductoId=@ProductoId; UPDATE dbo.Carrito SET FechaUltimaActividad=GETDATE() WHERE CarritoId=@CarritoId AND Estado='Activo'; END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Carrito_GetById] @CarritoId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CarritoId, c.ClienteId, c.IdentificadorSesion, c.Estado, c.FechaCreacion, c.FechaUltimaActividad,
           c.FechaAbandono, c.FechaConversion, c.PedidoIdConvertido, c.FechaInicioCheckout,
           c.FechaUltimaActividadCheckout, c.CheckoutCompletadoFecha,
           ISNULL(SUM(dc.Cantidad * ISNULL(dc.PrecioReferencia, 0)), 0) TotalReferencia
    FROM dbo.Carrito c LEFT JOIN dbo.DetalleCarrito dc ON dc.CarritoId = c.CarritoId
    WHERE c.CarritoId = @CarritoId
    GROUP BY c.CarritoId, c.ClienteId, c.IdentificadorSesion, c.Estado, c.FechaCreacion, c.FechaUltimaActividad,
             c.FechaAbandono, c.FechaConversion, c.PedidoIdConvertido, c.FechaInicioCheckout,
             c.FechaUltimaActividadCheckout, c.CheckoutCompletadoFecha;
    SELECT dc.DetalleCarritoId, dc.ProductoId, p.Nombre ProductoNombre, dc.Cantidad, dc.PrecioReferencia, dc.FechaActualizacion
    FROM dbo.DetalleCarrito dc JOIN dbo.Producto p ON p.ProductoId = dc.ProductoId
    WHERE dc.CarritoId = @CarritoId ORDER BY dc.DetalleCarritoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_GuardarItem] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Carrito_GuardarItem] @CarritoId INT,@ProductoId INT,@Cantidad DECIMAL(18,2)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Cantidad<=0 BEGIN RAISERROR('La cantidad debe ser mayor a cero.',16,1); RETURN; END;
 IF NOT EXISTS(SELECT 1 FROM dbo.Carrito WHERE CarritoId=@CarritoId AND Estado='Activo') BEGIN RAISERROR('El carrito no existe o no está activo.',16,1); RETURN; END;
 IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId AND Activo=1) BEGIN RAISERROR('El producto no existe o está inactivo.',16,1); RETURN; END;
 DECLARE @Precio DECIMAL(18,2);
 SELECT TOP 1 @Precio=Precio FROM dbo.PrecioVenta WHERE ProductoId=@ProductoId AND Activo=1 AND FechaVigenciaDesde<=GETDATE() AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta>=GETDATE()) ORDER BY FechaVigenciaDesde DESC,PrecioVentaId DESC;
 IF @Precio IS NULL BEGIN RAISERROR('El producto no tiene precio de venta vigente.',16,1); RETURN; END;
 MERGE dbo.DetalleCarrito AS T USING(SELECT @CarritoId CarritoId,@ProductoId ProductoId) S ON T.CarritoId=S.CarritoId AND T.ProductoId=S.ProductoId
 WHEN MATCHED THEN UPDATE SET Cantidad=@Cantidad,PrecioReferencia=@Precio,FechaActualizacion=GETDATE()
 WHEN NOT MATCHED THEN INSERT(CarritoId,ProductoId,Cantidad,PrecioReferencia) VALUES(@CarritoId,@ProductoId,@Cantidad,@Precio);
 UPDATE dbo.Carrito SET FechaUltimaActividad=GETDATE() WHERE CarritoId=@CarritoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_IniciarCheckout] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Carrito_IniciarCheckout]
    @CarritoId INT,
    @IdentificadorSesion UNIQUEIDENTIFIER,
    @ClienteAutenticadoId INT = NULL,
    @Nombre VARCHAR(100) = NULL,
    @Apellido VARCHAR(100) = NULL,
    @Telefono VARCHAR(30) = NULL,
    @Email VARCHAR(150) = NULL,
    @ConsentimientoContacto BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET @Nombre = NULLIF(LTRIM(RTRIM(@Nombre)), '');
    SET @Apellido = NULLIF(LTRIM(RTRIM(@Apellido)), '');
    SET @Telefono = NULLIF(LTRIM(RTRIM(@Telefono)), '');
    SET @Email = LOWER(NULLIF(LTRIM(RTRIM(@Email)), ''));
    IF @IdentificadorSesion IS NULL THROW 51001, 'IdentificadorSesion es obligatorio.', 1;
    IF @ConsentimientoContacto = 1 AND @Email IS NULL AND @Telefono IS NULL THROW 51001, 'Debe indicar correo o teléfono para autorizar el contacto.', 1;
    IF @Email IS NOT NULL AND @Email NOT LIKE '%_@_%._%' THROW 51001, 'El correo no tiene un formato válido.', 1;
    IF NOT EXISTS(SELECT 1 FROM dbo.Carrito WHERE CarritoId = @CarritoId AND IdentificadorSesion = @IdentificadorSesion AND Estado = 'Activo' AND PedidoIdConvertido IS NULL)
        THROW 51001, 'El carrito no existe, no está activo o la sesión no coincide.', 1;
    IF @ClienteAutenticadoId IS NOT NULL AND EXISTS(SELECT 1 FROM dbo.Carrito WHERE CarritoId = @CarritoId AND ClienteId IS NOT NULL AND ClienteId <> @ClienteAutenticadoId)
        THROW 51001, 'El carrito no pertenece al comprador autenticado.', 1;
    IF NOT EXISTS(SELECT 1 FROM dbo.DetalleCarrito WHERE CarritoId = @CarritoId) THROW 51001, 'El carrito está vacío.', 1;

    UPDATE dbo.Carrito
       SET FechaInicioCheckout = ISNULL(FechaInicioCheckout, SYSDATETIME()),
           FechaUltimaActividadCheckout = SYSDATETIME(), FechaUltimaActividad = SYSDATETIME(),
           ContactoNombre = CASE WHEN @ConsentimientoContacto = 1 THEN @Nombre ELSE ContactoNombre END,
           ContactoApellido = CASE WHEN @ConsentimientoContacto = 1 THEN @Apellido ELSE ContactoApellido END,
           ContactoTelefono = CASE WHEN @ConsentimientoContacto = 1 THEN @Telefono ELSE ContactoTelefono END,
           ContactoEmail = CASE WHEN @ConsentimientoContacto = 1 THEN @Email ELSE ContactoEmail END,
           ConsentimientoContactoFecha = CASE WHEN @ConsentimientoContacto = 1 THEN SYSDATETIME() ELSE ConsentimientoContactoFecha END
     WHERE CarritoId = @CarritoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_ObtenerOCrear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Carrito_ObtenerOCrear]
 @ClienteId INT=NULL,@IdentificadorSesion UNIQUEIDENTIFIER=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF @ClienteId IS NULL AND @IdentificadorSesion IS NULL BEGIN RAISERROR('Debe indicarse ClienteId o IdentificadorSesion.',16,1); RETURN; END;
 DECLARE @Id INT;
 IF @ClienteId IS NOT NULL SELECT TOP 1 @Id=CarritoId FROM dbo.Carrito WHERE ClienteId=@ClienteId AND Estado='Activo' ORDER BY CarritoId DESC;
 IF @Id IS NULL AND @IdentificadorSesion IS NOT NULL SELECT @Id=CarritoId FROM dbo.Carrito WHERE IdentificadorSesion=@IdentificadorSesion AND Estado='Activo';
 IF @Id IS NULL BEGIN
   INSERT dbo.Carrito(ClienteId,IdentificadorSesion) VALUES(@ClienteId,ISNULL(@IdentificadorSesion,NEWID())); SET @Id=SCOPE_IDENTITY();
 END ELSE IF @ClienteId IS NOT NULL UPDATE dbo.Carrito SET ClienteId=ISNULL(ClienteId,@ClienteId),FechaUltimaActividad=GETDATE() WHERE CarritoId=@Id;
 SELECT CarritoId,ClienteId,IdentificadorSesion,Estado,FechaCreacion,FechaUltimaActividad,FechaAbandono,FechaConversion,PedidoIdConvertido FROM dbo.Carrito WHERE CarritoId=@Id;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_ProcesarAbandonados] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Carrito_ProcesarAbandonados]
    @HorasInactividadCarrito INT,
    @HorasInactividadCheckout INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @HorasInactividadCarrito < 1 OR @HorasInactividadCheckout < 1 THROW 51001, 'Las ventanas de inactividad deben ser mayores a cero.', 1;

    DECLARE @EstadoId INT, @CanalId INT, @Ahora DATETIME2(0) = SYSDATETIME(), @LockResult INT;
    SELECT @EstadoId = EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre = 'Pendiente' AND Activo = 1;
    SELECT TOP(1) @CanalId = CanalVentaId FROM dbo.CanalVenta WHERE Nombre IN ('E-commerce', 'Ecommerce') AND Activo = 1 ORDER BY CanalVentaId;
    IF @EstadoId IS NULL OR @CanalId IS NULL THROW 51001, 'Falta configurar el estado Pendiente o el canal E-commerce.', 1;

    BEGIN TRANSACTION;
    EXEC @LockResult = sys.sp_getapplock @Resource = 'TEKA.ComercialDigital.ProcesarAbandonados', @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 0;
    IF @LockResult < 0
    BEGIN
        ROLLBACK TRANSACTION;
        SELECT CAST(0 AS INT) InteresesCreados;
        RETURN;
    END;

    CREATE TABLE #Candidatos
    (
        CarritoId INT NOT NULL PRIMARY KEY,
        ClienteId INT NULL,
        Nombre VARCHAR(100) NULL,
        Apellido VARCHAR(100) NULL,
        Telefono VARCHAR(30) NULL,
        Email VARCHAR(150) NULL,
        TipoPendiente VARCHAR(30) NOT NULL,
        Monto DECIMAL(18,2) NOT NULL
    );

    INSERT #Candidatos(CarritoId, ClienteId, Nombre, Apellido, Telefono, Email, TipoPendiente, Monto)
    SELECT c.CarritoId, c.ClienteId,
           COALESCE(cl.Nombre, CASE WHEN c.ConsentimientoContactoFecha IS NOT NULL THEN c.ContactoNombre END),
           COALESCE(cl.Apellido, CASE WHEN c.ConsentimientoContactoFecha IS NOT NULL THEN c.ContactoApellido END),
           COALESCE(cl.Telefono, CASE WHEN c.ConsentimientoContactoFecha IS NOT NULL THEN c.ContactoTelefono END),
           COALESCE(cl.Email, CASE WHEN c.ConsentimientoContactoFecha IS NOT NULL THEN c.ContactoEmail END),
           CASE WHEN c.FechaInicioCheckout IS NOT NULL
                  AND c.FechaUltimaActividadCheckout <= DATEADD(HOUR, -@HorasInactividadCheckout, @Ahora)
                THEN 'Checkout interrumpido' ELSE 'Carrito abandonado' END,
           SUM(d.Cantidad * ISNULL(d.PrecioReferencia, 0))
    FROM dbo.Carrito c WITH(UPDLOCK, READPAST)
    JOIN dbo.DetalleCarrito d ON d.CarritoId = c.CarritoId
    LEFT JOIN dbo.Cliente cl ON cl.ClienteId = c.ClienteId AND cl.Activo = 1
    WHERE c.Estado = 'Activo' AND c.PedidoIdConvertido IS NULL AND c.CheckoutCompletadoFecha IS NULL
      AND NOT EXISTS(SELECT 1 FROM dbo.InteresComercial i WHERE i.CarritoId = c.CarritoId)
      AND
      (
        (c.FechaInicioCheckout IS NOT NULL AND c.FechaUltimaActividadCheckout <= DATEADD(HOUR, -@HorasInactividadCheckout, @Ahora))
        OR
        (c.FechaInicioCheckout IS NULL AND c.FechaUltimaActividad <= DATEADD(HOUR, -@HorasInactividadCarrito, @Ahora))
      )
      AND
      (
        c.ClienteId IS NOT NULL OR
        (c.ConsentimientoContactoFecha IS NOT NULL AND (NULLIF(LTRIM(RTRIM(c.ContactoEmail)), '') IS NOT NULL OR NULLIF(LTRIM(RTRIM(c.ContactoTelefono)), '') IS NOT NULL))
      )
    GROUP BY c.CarritoId, c.ClienteId, cl.Nombre, cl.Apellido, cl.Telefono, cl.Email,
             c.ConsentimientoContactoFecha, c.ContactoNombre, c.ContactoApellido, c.ContactoTelefono, c.ContactoEmail,
             c.FechaInicioCheckout, c.FechaUltimaActividadCheckout;

    INSERT dbo.InteresComercial
        (ClienteId, ClienteNombre, ClienteApellido, Telefono, Email, CanalVentaId, EstadoInteresComercialId,
         TipoOrigen, ReferenciaOrigen, CarritoId, Descripcion, MontoPotencial, TipoPendiente)
    SELECT ClienteId, Nombre, Apellido, Telefono, Email, @CanalId, @EstadoId, 'E-commerce',
           CONCAT(CASE WHEN TipoPendiente = 'Checkout interrumpido' THEN 'Checkout ' ELSE 'Carrito ' END, CarritoId),
           CarritoId,
           CASE WHEN TipoPendiente = 'Checkout interrumpido'
                THEN 'Checkout interrumpido con productos pendientes de compra'
                ELSE 'Carrito abandonado con productos pendientes de compra' END,
           Monto, TipoPendiente
    FROM #Candidatos;
    DECLARE @Creados INT = @@ROWCOUNT;

    UPDATE c SET Estado = 'Abandonado', FechaAbandono = ISNULL(FechaAbandono, @Ahora)
    FROM dbo.Carrito c JOIN #Candidatos x ON x.CarritoId = c.CarritoId;
    COMMIT TRANSACTION;
    SELECT @Creados InteresesCreados;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Carrito_RegistrarActividadCheckout] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Carrito_RegistrarActividadCheckout]
    @CarritoId INT,
    @IdentificadorSesion UNIQUEIDENTIFIER,
    @ClienteAutenticadoId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Carrito
       SET FechaUltimaActividadCheckout = SYSDATETIME(), FechaUltimaActividad = SYSDATETIME()
     WHERE CarritoId = @CarritoId AND IdentificadorSesion = @IdentificadorSesion
       AND Estado = 'Activo' AND PedidoIdConvertido IS NULL AND FechaInicioCheckout IS NOT NULL
       AND (@ClienteAutenticadoId IS NULL OR ClienteId IS NULL OR ClienteId = @ClienteAutenticadoId);
    IF @@ROWCOUNT = 0 THROW 51001, 'El checkout no existe, finalizó o la sesión no coincide.', 1;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_Activar]
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Cliente
    SET
        Activo = 1,
        MotivoInactivacionId = NULL,
        ObservacionInactivacion = NULL,
        FechaInactivacion = NULL
    WHERE ClienteId = @ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_Delete]
    @ClienteId                  INT,
    @MotivoInactivacionId       INT,
    @ObservacionInactivacion    VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Cliente
    SET
        Activo = 0,
        MotivoInactivacionId = @MotivoInactivacionId,
        ObservacionInactivacion = @ObservacionInactivacion,
        FechaInactivacion = GETDATE()
    WHERE ClienteId = @ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- CLIENTE

CREATE PROCEDURE [dbo].[sp_Cliente_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ClienteId,
        c.Nombre,
        c.Apellido,
        c.TipoDocumentoId,
        td.Nombre AS TipoDocumentoNombre,
        td.CodigoARCA AS TipoDocumentoCodigoARCA,
        c.Documento,
        c.Telefono,
        c.Email,
        c.CondicionIVAId,
        ci.Nombre AS CondicionIVANombre,
        ci.CodigoAFIP AS CondicionIVACodigoAFIP,
        c.Observaciones,
        c.Activo,
        c.FechaAlta,
        c.MotivoInactivacionId,
        mi.Nombre AS MotivoInactivacionNombre,
        c.ObservacionInactivacion,
        c.FechaInactivacion
    FROM dbo.Cliente c
    INNER JOIN dbo.TipoDocumento td
        ON c.TipoDocumentoId = td.TipoDocumentoId
    INNER JOIN dbo.CondicionIVA ci
        ON c.CondicionIVAId = ci.CondicionIVAId
    LEFT JOIN dbo.MotivoInactivacion mi
        ON c.MotivoInactivacionId = mi.MotivoInactivacionId
    ORDER BY c.Nombre, c.Apellido;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_GetById]
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ClienteId,
        c.Nombre,
        c.Apellido,
        c.TipoDocumentoId,
        td.Nombre AS TipoDocumentoNombre,
        td.CodigoARCA AS TipoDocumentoCodigoARCA,
        c.Documento,
        c.Telefono,
        c.Email,
        c.CondicionIVAId,
        ci.Nombre AS CondicionIVANombre,
        ci.CodigoAFIP AS CondicionIVACodigoAFIP,
        c.Observaciones,
        c.Activo,
        c.FechaAlta,
        c.MotivoInactivacionId,
        mi.Nombre AS MotivoInactivacionNombre,
        c.ObservacionInactivacion,
        c.FechaInactivacion
    FROM dbo.Cliente c
    INNER JOIN dbo.TipoDocumento td
        ON c.TipoDocumentoId = td.TipoDocumentoId
    INNER JOIN dbo.CondicionIVA ci
        ON c.CondicionIVAId = ci.CondicionIVAId
    LEFT JOIN dbo.MotivoInactivacion mi
        ON c.MotivoInactivacionId = mi.MotivoInactivacionId
    WHERE c.ClienteId = @ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ClienteId AS Id,
        CONCAT(c.Nombre, CASE WHEN c.Apellido IS NOT NULL AND LTRIM(RTRIM(c.Apellido)) <> '' THEN ' ' + c.Apellido ELSE '' END) AS Descripcion,
        c.Documento,
        c.Email,
        c.Telefono
    FROM dbo.Cliente c
    WHERE c.Activo = 1
    ORDER BY c.Nombre, c.Apellido;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_Insert]
    @Nombre                     VARCHAR(100),
    @Apellido                   VARCHAR(100) = NULL,
    @TipoDocumentoId            INT,
    @Documento                  VARCHAR(20) = NULL,
    @Telefono                   VARCHAR(30) = NULL,
    @Email                      VARCHAR(150) = NULL,
    @CondicionIVAId             INT,
    @Observaciones              VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Cliente
    (
        Nombre,
        Apellido,
        TipoDocumentoId,
        Documento,
        Telefono,
        Email,
        CondicionIVAId,
        Observaciones,
        Activo,
        FechaAlta,
        MotivoInactivacionId,
        ObservacionInactivacion,
        FechaInactivacion
    )
    VALUES
    (
        @Nombre,
        @Apellido,
        @TipoDocumentoId,
        @Documento,
        @Telefono,
        @Email,
        @CondicionIVAId,
        @Observaciones,
        1,
        GETDATE(),
        NULL,
        NULL,
        NULL
    );

    SELECT SCOPE_IDENTITY() AS ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cliente_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cliente_Update]
    @ClienteId                  INT,
    @Nombre                     VARCHAR(100),
    @Apellido                   VARCHAR(100) = NULL,
    @TipoDocumentoId            INT,
    @Documento                  VARCHAR(20) = NULL,
    @Telefono                   VARCHAR(30) = NULL,
    @Email                      VARCHAR(150) = NULL,
    @CondicionIVAId             INT,
    @Observaciones              VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Cliente
    SET
        Nombre = @Nombre,
        Apellido = @Apellido,
        TipoDocumentoId = @TipoDocumentoId,
        Documento = @Documento,
        Telefono = @Telefono,
        Email = @Email,
        CondicionIVAId = @CondicionIVAId,
        Observaciones = @Observaciones
    WHERE ClienteId = @ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_ActualizarPendiente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Cobro_ActualizarPendiente]
 @CobroId INT,@CajaId INT=NULL,@MedioCobroId INT,@ImporteBase DECIMAL(18,2),
 @PorcentajeRecargoTarjeta DECIMAL(5,2)=0,@ReferenciaExterna VARCHAR(100)=NULL,
 @Observaciones VARCHAR(500)=NULL,@UsuarioId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @PedidoId INT,@PedidoActual INT,@EstadoCobro VARCHAR(50),@EstadoPedido VARCHAR(50),
  @Total DECIMAL(18,2),@Comprometido DECIMAL(18,2),@Medio VARCHAR(50),
  @RequiereReferencia BIT,@Pct DECIMAL(5,2)=0,@Ajuste DECIMAL(18,2)=0,
  @Final DECIMAL(18,2),@Anterior NVARCHAR(MAX),@Posterior NVARCHAR(MAX);
 BEGIN TRY
  BEGIN TRAN;
  IF @UsuarioId IS NULL OR @UsuarioId<=0 THROW 53102, 'Usuario de ediciÃ³n invÃ¡lido.', 1;
  IF @ImporteBase IS NULL OR @ImporteBase<=0 THROW 53103, 'Importe de cobro invÃ¡lido.', 1;
  IF @PorcentajeRecargoTarjeta IS NULL OR @PorcentajeRecargoTarjeta<0 OR @PorcentajeRecargoTarjeta>100
   THROW 53104, 'Recargo de tarjeta invÃ¡lido.', 1;
  SELECT @PedidoId=PedidoId FROM dbo.Cobro WHERE CobroId=@CobroId;
  IF @PedidoId IS NULL THROW 53105, 'Solo se editan cobros vinculados a un pedido existente.', 1;
  SELECT @Total=p.Total,@EstadoPedido=ep.Nombre FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
  IF @EstadoPedido NOT IN ('Pendiente','Confirmado','En Produccion','Listo para Entrega') THROW 53106, 'El estado del pedido no admite editar cobros pendientes.', 1;
  SELECT @PedidoActual=c.PedidoId,@EstadoCobro=ec.Nombre
   FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId WHERE c.CobroId=@CobroId;
  IF @EstadoCobro IS NULL OR @PedidoActual<>@PedidoId THROW 53107, 'El cobro cambiÃ³; actualizÃ¡ el pedido.', 1;
  IF @EstadoCobro<>'Pendiente' THROW 53108, 'Solo puede editarse un cobro pendiente.', 1;
  SELECT @Medio=Nombre,@RequiereReferencia=RequiereReferencia FROM dbo.MedioCobro
   WHERE MedioCobroId=@MedioCobroId AND Activo=1;
  IF @Medio IS NULL THROW 53109, 'SeleccionÃ¡ un medio de cobro activo.', 1;
  IF @RequiereReferencia=1 AND NULLIF(LTRIM(RTRIM(@ReferenciaExterna)),'') IS NULL
   THROW 53110, 'Este medio de cobro requiere referencia.', 1;
  IF @Medio='Efectivo' AND ((SELECT COUNT(*) FROM dbo.Caja c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.CajaConfiguracion cfg WITH(UPDLOCK,HOLDLOCK) ON cfg.CajaId=c.CajaId WHERE c.Activo=1 AND cfg.EsFisica=1)<>1
    OR NOT EXISTS(SELECT 1 FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId WHERE c.CajaId=@CajaId AND c.Activo=1 AND cfg.EsFisica=1))
    THROW 53013,'El efectivo requiere Caja Principal fisica activa.',1;
  IF @Medio<>'Efectivo' AND @CajaId IS NOT NULL THROW 53013,'Los medios electronicos no utilizan caja fisica.',1;
  IF @Medio<>'Tarjeta Credito' AND @PorcentajeRecargoTarjeta<>0
   THROW 53112, 'El recargo solo corresponde a tarjeta de crÃ©dito.', 1;
  SELECT @Comprometido=ISNULL(SUM(c.ImporteBase),0)
   FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
   WHERE c.PedidoId=@PedidoId AND c.CobroId<>@CobroId AND ec.Nombre IN('Confirmado','Pendiente');
  IF @ImporteBase>@Total OR @Comprometido+@ImporteBase>@Total+0.01
   THROW 53113, 'El importe supera el saldo disponible del pedido.', 1;
  IF @Medio='Efectivo' AND NOT EXISTS (SELECT 1 FROM dbo.Cobro WHERE PedidoId=@PedidoId AND CobroId<>@CobroId) AND @ImporteBase=@Total
  BEGIN
   SET @Pct=-5; SET @Ajuste=ROUND(@ImporteBase*0.05,2); SET @Final=@ImporteBase-@Ajuste;
  END
  ELSE IF @Medio='Tarjeta Credito'
  BEGIN
   SET @Pct=@PorcentajeRecargoTarjeta;
   SET @Ajuste=ROUND(@ImporteBase*@Pct/100.0,2);
   SET @Final=@ImporteBase+@Ajuste;
  END
  ELSE SET @Final=@ImporteBase;
  SELECT @Anterior=(SELECT ClienteId,PedidoId,CajaId,MedioCobroId,EstadoCobroId,
    ImporteBase,PorcentajeAplicado,ImporteAjuste,ImporteFinal,ReferenciaExterna,Observaciones
    FROM dbo.Cobro WHERE CobroId=@CobroId FOR JSON PATH,WITHOUT_ARRAY_WRAPPER,INCLUDE_NULL_VALUES);
  UPDATE dbo.Cobro SET CajaId=@CajaId,MedioCobroId=@MedioCobroId,
   ImporteBase=@ImporteBase,PorcentajeAplicado=@Pct,ImporteAjuste=@Ajuste,
   ImporteFinal=@Final,ReferenciaExterna=@ReferenciaExterna,Observaciones=@Observaciones
   WHERE CobroId=@CobroId;
  SELECT @Posterior=(SELECT ClienteId,PedidoId,CajaId,MedioCobroId,EstadoCobroId,
    ImporteBase,PorcentajeAplicado,ImporteAjuste,ImporteFinal,ReferenciaExterna,Observaciones
    FROM dbo.Cobro WHERE CobroId=@CobroId FOR JSON PATH,WITHOUT_ARRAY_WRAPPER,INCLUDE_NULL_VALUES);
  INSERT dbo.CobroEdicion(CobroId,UsuarioId,DatosAnteriores,DatosPosteriores)
   VALUES(@CobroId,@UsuarioId,@Anterior,@Posterior);
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_Anular] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* 8. ANULACIONES: impedir anulacion simple de cobro confirmado para evitar
   dejar entregas/stock y cuenta corriente inconsistentes. */
CREATE   PROCEDURE [dbo].[sp_Cobro_Anular]
 @CobroId INT,@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Estado VARCHAR(50),@AnuladoId INT;
 BEGIN TRAN;
 BEGIN TRY
  SELECT @Estado=ec.Nombre FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId WHERE c.CobroId=@CobroId;
  IF @Estado IS NULL THROW 53070,'Cobro inexistente.',1;
  IF @Estado='Confirmado' THROW 53071,'La anulacion de cobros confirmados requiere circuito de reversa contable y stock.',1;
  IF @Estado='Anulado' THROW 53072,'Cobro ya anulado.',1;
  SELECT @AnuladoId=EstadoCobroId FROM dbo.EstadoCobro WHERE Nombre='Anulado';
  IF @AnuladoId IS NULL THROW 53073,'Estado Anulado inexistente.',1;
  UPDATE dbo.Cobro SET EstadoCobroId=@AnuladoId,
   Observaciones=ISNULL(@Observaciones,Observaciones) WHERE CobroId=@CobroId;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_Confirmar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Cobro_Confirmar]
@CobroId INT,@DepositoId INT=NULL,@Observaciones VARCHAR(250)=NULL,@UsuarioId INT=NULL,@CuentaBancariaId INT=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @PedidoId INT,@ClienteId INT,@Final DECIMAL(18,2),@Estado VARCHAR(50),
 @EstadoConfirmadoId INT,@TipoPagoId INT,@Total DECIMAL(18,2),@PagadoPrincipal DECIMAL(18,2),
 @DescuentoTotal DECIMAL(18,2),@Pendientes INT,@PedidoEstado VARCHAR(50),@TotalExigible DECIMAL(18,2),@PagadoReal DECIMAL(18,2),@Descuentos INT,@CobrosNoAnulados INT,@CobroBase DECIMAL(18,2),@CobroMedio VARCHAR(50),@CajaId INT,@MedioCobroId INT,@ReferenciaExterna VARCHAR(100),@CajaSesionId BIGINT,@MedioFin VARCHAR(30);
 BEGIN TRY
  BEGIN TRAN;
  SELECT @CajaId=c.CajaId,@MedioCobroId=c.MedioCobroId,@ReferenciaExterna=c.ReferenciaExterna,@PedidoId=c.PedidoId,@ClienteId=c.ClienteId,@Final=c.ImporteFinal,@CobroBase=c.ImporteBase,@CobroMedio=mc.Nombre,@Estado=ec.Nombre
  FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
  JOIN dbo.MedioCobro mc ON mc.MedioCobroId=c.MedioCobroId WHERE c.CobroId=@CobroId;
  IF @Estado IS NULL THROW 53020,'Cobro inexistente.',1;
  IF @UsuarioId IS NULL OR @UsuarioId<=0 OR NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
    THROW 53300,'Usuario autenticado invalido.',1;
  IF @CobroMedio='Efectivo' AND @CuentaBancariaId IS NOT NULL THROW 53307,'El efectivo no utiliza cuenta bancaria.',1;
  IF @Estado='Confirmado'
  BEGIN
    IF (SELECT COUNT(*) FROM dbo.CajaMovimiento WHERE CobroId=@CobroId)+(SELECT COUNT(*) FROM dbo.MovimientoFinanciero WHERE CobroId=@CobroId)<>1
      THROW 53306,'Cobro confirmado con libros faltantes o duplicados: requiere conciliacion.',1;
    IF NOT EXISTS(SELECT 1 FROM dbo.CajaMovimiento cm JOIN dbo.CajaSesion s ON s.CajaSesionId=cm.CajaSesionId
      WHERE cm.CobroId=@CobroId AND @CobroMedio='Efectivo' AND s.CajaId=@CajaId AND cm.Tipo='IngresoCobro' AND cm.Importe=@Final)
      AND NOT EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero mf WHERE mf.CobroId=@CobroId AND @CobroMedio<>'Efectivo'
        AND mf.OrigenTipo='Cobro' AND mf.OrigenId=@CobroId AND mf.Tipo='Ingreso' AND mf.Estado='Registrado' AND mf.Importe=@Final
        AND mf.Medio=CASE WHEN @CobroMedio IN('Transferencia','Transferencia Bancaria') THEN 'Transferencia'
          WHEN @CobroMedio IN('Tarjeta Credito','Tarjeta Crédito','Tarjeta Debito','Tarjeta Débito') THEN 'Tarjeta'
          WHEN @CobroMedio='Cheque' THEN 'Cheque' WHEN @CobroMedio IN('Deposito','Depósito') THEN 'Deposito'
          WHEN @CobroMedio IN('Pasarela','Mercado Pago') THEN 'Pasarela' ELSE NULL END
        AND (@CuentaBancariaId IS NULL OR mf.CuentaBancariaId=@CuentaBancariaId))
      THROW 53306,'La confirmacion anterior no concilia con este cobro o cuenta.',1;
    COMMIT; RETURN;
  END;
  IF @Estado<>'Pendiente' THROW 53021,'Solo puede confirmarse un cobro pendiente.',1;
  SELECT @EstadoConfirmadoId=EstadoCobroId FROM dbo.EstadoCobro WHERE Nombre='Confirmado';
  SELECT @TipoPagoId=TipoMovimientoCuentaCorrienteId FROM dbo.TipoMovimientoCuentaCorriente WHERE Nombre='Pago de cliente';
  IF @EstadoConfirmadoId IS NULL OR @TipoPagoId IS NULL THROW 53022,'Catalogos financieros incompletos.',1;
  IF @PedidoId IS NOT NULL
  BEGIN
   SELECT @Total=p.Total,@PedidoEstado=ep.Nombre
   FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
   IF @PedidoEstado NOT IN('Pendiente','Confirmado','En Produccion','Listo para Entrega') THROW 53023,'El pedido debe estar confirmado, vigente y sin entregar.',1;
   /* No permitir descuento en un cobro que haya dejado de ser pago unico. */
   IF EXISTS(SELECT 1 FROM dbo.Cobro WHERE CobroId=@CobroId AND PorcentajeAplicado=-5)
   BEGIN
    SELECT @CobrosNoAnulados=COUNT(*) FROM dbo.Cobro WITH(UPDLOCK,HOLDLOCK)
    WHERE PedidoId=@PedidoId AND CobroId<>@CobroId;
    IF @CobroMedio<>'Efectivo' OR @CobroBase<>@Total OR @CobrosNoAnulados<>0
     THROW 53211,'El descuento solo corresponde al pago unico y total en efectivo.',1;
   END;
  END;
  /* Control de principal antes de confirmar: recargos no cancelan capital. */
  IF @PedidoId IS NOT NULL
  BEGIN
   SELECT @PagadoPrincipal=ISNULL(SUM(c.ImporteBase),0)
   FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
   WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado';
   IF @PagadoPrincipal+@CobroBase>@Total+0.01
    THROW 53212,'El cobro supera el capital pendiente del pedido.',1;
  END;
  IF @CobroMedio='Efectivo'
  BEGIN
    IF (SELECT COUNT(*) FROM dbo.Caja c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.CajaConfiguracion cfg WITH(UPDLOCK,HOLDLOCK) ON cfg.CajaId=c.CajaId WHERE c.Activo=1 AND cfg.EsFisica=1)<>1
      OR NOT EXISTS(SELECT 1 FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId WHERE c.CajaId=@CajaId AND c.Activo=1 AND cfg.EsFisica=1)
      THROW 53301,'El cobro en efectivo requiere Caja Principal fisica activa.',1;
  END ELSE IF @CajaId IS NOT NULL THROW 53307,'Un cobro electronico no utiliza caja fisica.',1;
  IF @CuentaBancariaId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.CuentaBancariaTEKA WITH(UPDLOCK,HOLDLOCK) WHERE CuentaBancariaId=@CuentaBancariaId AND Activa=1 AND Moneda='ARS')
    THROW 53308,'Cuenta bancaria inexistente, inactiva o moneda incompatible.',1;
  IF EXISTS(SELECT 1 FROM dbo.CajaMovimiento WITH(UPDLOCK,HOLDLOCK) WHERE CobroId=@CobroId)
    OR EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero WITH(UPDLOCK,HOLDLOCK) WHERE CobroId=@CobroId)
    THROW 53306,'El cobro pendiente ya tiene un registro en libros: conciliar antes de confirmar.',1;
  UPDATE dbo.Cobro SET EstadoCobroId=@EstadoConfirmadoId WHERE CobroId=@CobroId;
  IF @PedidoId IS NOT NULL
  BEGIN
   SELECT @PagadoPrincipal=ISNULL(SUM(c.ImporteBase),0),
    @DescuentoTotal=ISNULL(SUM(CASE WHEN c.PorcentajeAplicado=-5 THEN c.ImporteAjuste ELSE 0 END),0)
   FROM dbo.Cobro c JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
   WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado';
   IF @PagadoPrincipal>@Total+0.01 THROW 53024,'Pagos superiores al importe del pedido.',1;
   IF @DescuentoTotal>0 AND (SELECT COUNT(*) FROM dbo.Cobro c JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado')<>1
    THROW 53213,'Descuento incompatible con pagos multiples.',1;
   SET @TotalExigible=@Total-ISNULL(@DescuentoTotal,0);
   SELECT @PagadoReal=ISNULL(SUM(CASE WHEN c.PorcentajeAplicado>0 THEN c.ImporteBase ELSE c.ImporteFinal END),0)
   FROM dbo.Cobro c JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
   WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado';
   IF @PagadoReal>@TotalExigible+0.01
    THROW 53214,'El importe aplicado supera el saldo exigible del pedido.',1;
   /* Confirmar cobro NO modifica stock. */
  END;
  IF EXISTS(SELECT 1 FROM dbo.MovimientoCuentaCorrienteCliente WITH(UPDLOCK,HOLDLOCK)
    WHERE CobroId=@CobroId)
    THROW 53310,'El cobro ya tiene movimientos en cuenta corriente.',1;
  EXEC dbo.sp_MovimientoCuentaCorrienteCliente_Registrar
   @ClienteId=@ClienteId,@TipoMovimientoCuentaCorrienteId=@TipoPagoId,
   @PedidoId=@PedidoId,@ComprobanteId=NULL,@CobroId=@CobroId,
   @Importe=@Final,@Observaciones=@Observaciones;
  /* Ajustes comerciales: no son ingresos de caja. */
  IF @PedidoId IS NOT NULL AND EXISTS
    (SELECT 1 FROM dbo.Cobro WHERE CobroId=@CobroId AND ImporteAjuste>0 AND PorcentajeAplicado<>0)
  BEGIN
    DECLARE @TipoAjusteId INT,@ImporteAjusteCC DECIMAL(18,2),@PorcentajeCC DECIMAL(5,2);
    SELECT @ImporteAjusteCC=ImporteAjuste,@PorcentajeCC=PorcentajeAplicado
    FROM dbo.Cobro WHERE CobroId=@CobroId;
    SELECT @TipoAjusteId=TipoMovimientoCuentaCorrienteId
    FROM dbo.TipoMovimientoCuentaCorriente
    WHERE Nombre=CASE WHEN @PorcentajeCC<0 THEN 'Ajuste acreedor' ELSE 'Ajuste deudor' END;
    IF @TipoAjusteId IS NULL THROW 53311,'Tipo de ajuste comercial no configurado.',1;
    DECLARE @ObservacionAjusteCC VARCHAR(250);
    SET @ObservacionAjusteCC = CASE
      WHEN @PorcentajeCC < 0 THEN 'Descuento comercial del cobro'
      ELSE 'Recargo comercial del cobro'
    END;
    EXEC dbo.sp_MovimientoCuentaCorrienteCliente_Registrar
      @ClienteId=@ClienteId,@TipoMovimientoCuentaCorrienteId=@TipoAjusteId,
      @PedidoId=@PedidoId,@ComprobanteId=NULL,@CobroId=@CobroId,
      @Importe=@ImporteAjusteCC,
      @Observaciones=@ObservacionAjusteCC;
  END;
  /* Integración de Caja: se ejecuta en la MISMA transacción que la cuenta corriente. */
  IF @UsuarioId IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
    THROW 53300,'Usuario autenticado invalido para confirmar cobro.',1;
  IF @CobroMedio='Efectivo'
  BEGIN
    IF @CajaId IS NULL THROW 53301,'El cobro en efectivo requiere CajaId.',1;
    SELECT TOP(1) @CajaSesionId=CajaSesionId
      FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK)
      WHERE CajaId=@CajaId AND Estado='Abierta'
      ORDER BY FechaApertura DESC,CajaSesionId DESC;
    IF @CajaSesionId IS NULL THROW 53302,'Debe abrir una sesion de la caja seleccionada.',1;
    IF EXISTS(SELECT 1 FROM dbo.CajaMovimiento WITH(UPDLOCK,HOLDLOCK) WHERE CobroId=@CobroId)
      THROW 53303,'El cobro ya tiene un ingreso en caja.',1;
    INSERT dbo.CajaMovimiento(CajaSesionId,Tipo,Importe,Concepto,Referencia,Observaciones,UsuarioId,CobroId)
    VALUES(@CajaSesionId,'IngresoCobro',@Final,CONCAT('Cobro #',@CobroId),@ReferenciaExterna,@Observaciones,@UsuarioId,@CobroId);
  END
  ELSE
  BEGIN
    SET @MedioFin=CASE
      WHEN @CobroMedio IN ('Transferencia','Transferencia Bancaria') THEN 'Transferencia'
      WHEN @CobroMedio IN ('Tarjeta Credito','Tarjeta Crédito','Tarjeta Debito','Tarjeta Débito') THEN 'Tarjeta'
      WHEN @CobroMedio IN ('Cheque') THEN 'Cheque'
      WHEN @CobroMedio IN ('Deposito','Depósito') THEN 'Deposito'
      WHEN @CobroMedio IN ('Pasarela','Mercado Pago') THEN 'Pasarela'
      ELSE NULL END;
    IF @MedioFin IS NULL THROW 53304,'Medio de cobro sin equivalencia financiera configurada.',1;
    IF EXISTS(SELECT 1 FROM dbo.MovimientoFinanciero WITH(UPDLOCK,HOLDLOCK) WHERE CobroId=@CobroId)
      THROW 53305,'El cobro ya tiene un movimiento financiero.',1;
    INSERT dbo.MovimientoFinanciero(FechaOperacion,Tipo,Medio,Importe,Concepto,OrigenTipo,OrigenId,
      UsuarioRegistroId,MedioCobroId,CobroId,ReferenciaExterna,Observaciones,CuentaBancariaId,CanalVentaId)
    VALUES(SYSDATETIME(),'Ingreso',@MedioFin,@Final,CONCAT('Cobro #',@CobroId),'Cobro',CONVERT(BIGINT,@CobroId),
      @UsuarioId,@MedioCobroId,@CobroId,@ReferenciaExterna,@Observaciones,@CuentaBancariaId,(SELECT CanalVentaId FROM dbo.Pedido WHERE PedidoId=@PedidoId));
  END;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;


GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--Cobro

CREATE PROCEDURE [dbo].[sp_Cobro_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        co.CobroId,
        co.ClienteId,
        cl.Nombre AS ClienteNombre,
        cl.Apellido AS ClienteApellido,
        co.PedidoId,
        co.CajaId,
        ca.Nombre AS CajaNombre,
        co.MedioCobroId,
        mc.Nombre AS MedioCobroNombre,
        co.EstadoCobroId,
        ec.Nombre AS EstadoCobroNombre,
        co.FechaCobro,
        co.ImporteBase,
        co.PorcentajeAplicado,
        co.ImporteAjuste,
        co.ImporteFinal,
        co.ReferenciaExterna,
        co.Observaciones
    FROM dbo.Cobro co
    INNER JOIN dbo.Cliente cl
        ON co.ClienteId = cl.ClienteId
    LEFT JOIN dbo.Caja ca
        ON co.CajaId = ca.CajaId
    INNER JOIN dbo.MedioCobro mc
        ON co.MedioCobroId = mc.MedioCobroId
    INNER JOIN dbo.EstadoCobro ec
        ON co.EstadoCobroId = ec.EstadoCobroId
    ORDER BY co.FechaCobro DESC, co.CobroId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Cobro_GetById]
    @CobroId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        co.CobroId,
        co.ClienteId,
        cl.Nombre AS ClienteNombre,
        cl.Apellido AS ClienteApellido,
        co.PedidoId,
        co.CajaId,
        ca.Nombre AS CajaNombre,
        co.MedioCobroId,
        mc.Nombre AS MedioCobroNombre,
        mc.RequiereReferencia,
        co.EstadoCobroId,
        ec.Nombre AS EstadoCobroNombre,
        co.FechaCobro,
        co.ImporteBase,
        co.PorcentajeAplicado,
        co.ImporteAjuste,
        co.ImporteFinal,
        co.ReferenciaExterna,
        co.Observaciones
    FROM dbo.Cobro co
    INNER JOIN dbo.Cliente cl
        ON co.ClienteId = cl.ClienteId
    LEFT JOIN dbo.Caja ca
        ON co.CajaId = ca.CajaId
    INNER JOIN dbo.MedioCobro mc
        ON co.MedioCobroId = mc.MedioCobroId
    INNER JOIN dbo.EstadoCobro ec
        ON co.EstadoCobroId = ec.EstadoCobroId
    WHERE co.CobroId = @CobroId;

    SELECT
        ac.AplicacionCobroId,
        ac.CobroId,
        ac.ComprobanteId,
        c.NumeroComprobante,
        c.FechaComprobante,
        c.ImporteTotal,
        ac.ImporteAplicado
    FROM dbo.AplicacionCobro ac
    INNER JOIN dbo.Comprobante c
        ON ac.ComprobanteId = c.ComprobanteId
    WHERE ac.CobroId = @CobroId
    ORDER BY ac.AplicacionCobroId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Cobro_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Cobro_Registrar]
 @ClienteId INT,@PedidoId INT=NULL,@CajaId INT=NULL,@MedioCobroId INT,
 @ImporteBase DECIMAL(18,2),@PorcentajeRecargoTarjeta DECIMAL(5,2)=0,
 @ReferenciaExterna VARCHAR(100)=NULL,@Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @EstadoPendienteId INT,@Medio VARCHAR(50),@Pct DECIMAL(5,2)=0,
 @Ajuste DECIMAL(18,2)=0,@Final DECIMAL(18,2),@Total DECIMAL(18,2),
 @Cobrado DECIMAL(18,2),@Comprometido DECIMAL(18,2),@Estado VARCHAR(50),@PedidoCliente INT,@RequiereReferencia bit;
 BEGIN TRY
  BEGIN TRAN;
  IF @ImporteBase IS NULL OR @ImporteBase<=0 THROW 53010,'Importe de cobro invalido.',1;
  IF @PorcentajeRecargoTarjeta IS NULL OR @PorcentajeRecargoTarjeta<0 OR @PorcentajeRecargoTarjeta>100
   THROW 53011,'Porcentaje de recargo invalido.',1;
  SELECT @EstadoPendienteId=EstadoCobroId FROM dbo.EstadoCobro WHERE Nombre='Pendiente';
  SELECT @Medio=Nombre,@RequiereReferencia=RequiereReferencia FROM dbo.MedioCobro WHERE MedioCobroId=@MedioCobroId AND Activo=1;
  IF @EstadoPendienteId IS NULL OR @Medio IS NULL THROW 53012,'Medio o estado de cobro no configurado.',1;
  IF @Medio='Efectivo' AND ((SELECT COUNT(*) FROM dbo.Caja c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.CajaConfiguracion cfg WITH(UPDLOCK,HOLDLOCK) ON cfg.CajaId=c.CajaId WHERE c.Activo=1 AND cfg.EsFisica=1)<>1
    OR NOT EXISTS(SELECT 1 FROM dbo.Caja c JOIN dbo.CajaConfiguracion cfg ON cfg.CajaId=c.CajaId WHERE c.CajaId=@CajaId AND c.Activo=1 AND cfg.EsFisica=1))
    THROW 53013,'El efectivo requiere Caja Principal fisica activa.',1;
  IF @Medio<>'Efectivo' AND @CajaId IS NOT NULL THROW 53013,'Los medios electronicos no utilizan caja fisica.',1;
  IF @RequiereReferencia=1 AND NULLIF(LTRIM(RTRIM(@ReferenciaExterna)),'') IS NULL THROW 53018,'El medio requiere referencia externa.',1;
  IF @PedidoId IS NOT NULL
  BEGIN
   SELECT @Total=p.Total,@PedidoCliente=p.ClienteId,@Estado=ep.Nombre
   FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId
   WHERE p.PedidoId=@PedidoId;
   IF @Total IS NULL THROW 53014,'Pedido inexistente.',1;
   IF @PedidoCliente<>@ClienteId THROW 53015,'El cliente no coincide con el pedido.',1;
   IF @Estado NOT IN ('Pendiente','Confirmado','En Produccion','Listo para Entrega')
    THROW 53016,'El estado del pedido no admite nuevos cobros.',1;
   SELECT @Cobrado=ISNULL(SUM(CASE WHEN ec.Nombre='Confirmado' THEN c.ImporteFinal ELSE 0 END),0),
    @Comprometido=ISNULL(SUM(CASE WHEN ec.Nombre IN('Confirmado','Pendiente') THEN c.ImporteBase ELSE 0 END),0)
   FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
   JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId WHERE c.PedidoId=@PedidoId;
  END;
  IF @Medio='Efectivo' AND @PedidoId IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM dbo.Cobro WHERE PedidoId=@PedidoId) AND @ImporteBase=@Total
  BEGIN
   SET @Pct=-5; SET @Ajuste=ROUND(@ImporteBase*0.05,2);
   SET @Final=@ImporteBase-@Ajuste;
  END
  ELSE IF @Medio='Tarjeta Credito'
  BEGIN
   SET @Pct=@PorcentajeRecargoTarjeta;
   SET @Ajuste=ROUND(@ImporteBase*@Pct/100.0,2);
   SET @Final=@ImporteBase+@Ajuste;
  END
  ELSE SET @Final=@ImporteBase;
  /* Descuento de efectivo completo: el saldo exigible es el total menos descuento.
     Para el resto, se exige que los importes confirmados+pendientes no excedan el total.
     Recargos de tarjeta se cobran adicionalmente; no se contabilizan como cancelacion
     adicional del principal del pedido. */
  IF @PedidoId IS NOT NULL AND ISNULL(@Comprometido,0)+@ImporteBase>@Total+0.01
   THROW 53017,'Los cobros superan el total del pedido.',1;
  INSERT dbo.Cobro(ClienteId,PedidoId,CajaId,MedioCobroId,EstadoCobroId,FechaCobro,
   ImporteBase,PorcentajeAplicado,ImporteAjuste,ImporteFinal,ReferenciaExterna,Observaciones)
  VALUES(@ClienteId,@PedidoId,@CajaId,@MedioCobroId,@EstadoPendienteId,GETDATE(),
   @ImporteBase,@Pct,@Ajuste,@Final,@ReferenciaExterna,@Observaciones);
  SELECT CAST(SCOPE_IDENTITY() AS INT) AS CobroId;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Color_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--Color

CREATE PROCEDURE [dbo].[sp_Color_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ColorId,
        Nombre,
        CodigoHex,
        Activo
    FROM dbo.Color
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Color_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Color_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ColorId AS Id,
        Nombre AS Descripcion,
        CodigoHex
    FROM dbo.Color
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Comprobante_EmitirNotaCredito] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Comprobante_EmitirNotaCredito]
    @ComprobanteOrigenId           INT,
    @TipoComprobanteId             INT,
    @PuntoVenta                    INT,
    @NumeroComprobante             BIGINT = NULL,
    @Observaciones                 VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @PedidoId INT;
    DECLARE @ClienteId INT;
    DECLARE @TipoDocumentoId INT;
    DECLARE @DocumentoReceptor BIGINT;
    DECLARE @CondicionIVAId INT;
    DECLARE @ConceptoComprobanteId INT;
    DECLARE @MonedaId INT;
    DECLARE @ImporteNoGravado DECIMAL(18,2);
    DECLARE @ImporteExento DECIMAL(18,2);
    DECLARE @ImporteNetoGravado DECIMAL(18,2);
    DECLARE @ImporteIVA DECIMAL(18,2);
    DECLARE @ImporteTributos DECIMAL(18,2);
    DECLARE @ImporteTotal DECIMAL(18,2);
    DECLARE @NuevoComprobanteId INT;

    BEGIN TRANSACTION;

    SELECT
        @PedidoId = c.PedidoId,
        @ClienteId = c.ClienteId,
        @TipoDocumentoId = c.TipoDocumentoId,
        @DocumentoReceptor = c.DocumentoReceptor,
        @CondicionIVAId = c.CondicionIVAId,
        @ConceptoComprobanteId = c.ConceptoComprobanteId,
        @MonedaId = c.MonedaId,
        @ImporteNoGravado = c.ImporteNoGravado,
        @ImporteExento = c.ImporteExento,
        @ImporteNetoGravado = c.ImporteNetoGravado,
        @ImporteIVA = c.ImporteIVA,
        @ImporteTributos = c.ImporteTributos,
        @ImporteTotal = c.ImporteTotal
    FROM dbo.Comprobante c
    WHERE c.ComprobanteId = @ComprobanteOrigenId;

    INSERT INTO dbo.Comprobante
    (
        PedidoId,
        ClienteId,
        TipoComprobanteId,
        PuntoVenta,
        NumeroComprobante,
        FechaComprobante,
        TipoDocumentoId,
        DocumentoReceptor,
        CondicionIVAId,
        ConceptoComprobanteId,
        MonedaId,
        ImporteNoGravado,
        ImporteExento,
        ImporteNetoGravado,
        ImporteIVA,
        ImporteTributos,
        ImporteTotal,
        EstadoComprobante,
        Observaciones,
        ComprobanteAsociadoId
    )
    VALUES
    (
        @PedidoId,
        @ClienteId,
        @TipoComprobanteId,
        @PuntoVenta,
        @NumeroComprobante,
        CAST(GETDATE() AS DATE),
        @TipoDocumentoId,
        @DocumentoReceptor,
        @CondicionIVAId,
        @ConceptoComprobanteId,
        @MonedaId,
        @ImporteNoGravado,
        @ImporteExento,
        @ImporteNetoGravado,
        @ImporteIVA,
        @ImporteTributos,
        @ImporteTotal,
        'BORRADOR',
        ISNULL(@Observaciones, 'Nota de crédito emitida desde comprobante asociado'),
        @ComprobanteOrigenId
    );

    SET @NuevoComprobanteId = SCOPE_IDENTITY();

    INSERT INTO dbo.DetalleComprobante
    (
        ComprobanteId,
        ProductoId,
        DescripcionItem,
        Cantidad,
        PrecioUnitario,
        BonificacionImporte,
        ImporteNetoItem,
        AlicuotaIVAId,
        BaseImponibleIVA,
        ImporteIVAItem,
        ImporteTotalItem
    )
    SELECT
        @NuevoComprobanteId,
        dc.ProductoId,
        dc.DescripcionItem,
        dc.Cantidad,
        dc.PrecioUnitario,
        dc.BonificacionImporte,
        dc.ImporteNetoItem,
        dc.AlicuotaIVAId,
        dc.BaseImponibleIVA,
        dc.ImporteIVAItem,
        dc.ImporteTotalItem
    FROM dbo.DetalleComprobante dc
    WHERE dc.ComprobanteId = @ComprobanteOrigenId;

    COMMIT TRANSACTION;

    SELECT @NuevoComprobanteId AS ComprobanteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Comprobante_EmitirNotaDebito] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Comprobante_EmitirNotaDebito]
    @ComprobanteOrigenId           INT,
    @TipoComprobanteId             INT,
    @PuntoVenta                    INT,
    @NumeroComprobante             BIGINT = NULL,
    @Observaciones                 VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @PedidoId INT;
    DECLARE @ClienteId INT;
    DECLARE @TipoDocumentoId INT;
    DECLARE @DocumentoReceptor BIGINT;
    DECLARE @CondicionIVAId INT;
    DECLARE @ConceptoComprobanteId INT;
    DECLARE @MonedaId INT;
    DECLARE @ImporteNoGravado DECIMAL(18,2);
    DECLARE @ImporteExento DECIMAL(18,2);
    DECLARE @ImporteNetoGravado DECIMAL(18,2);
    DECLARE @ImporteIVA DECIMAL(18,2);
    DECLARE @ImporteTributos DECIMAL(18,2);
    DECLARE @ImporteTotal DECIMAL(18,2);
    DECLARE @NuevoComprobanteId INT;

    BEGIN TRANSACTION;

    SELECT
        @PedidoId = c.PedidoId,
        @ClienteId = c.ClienteId,
        @TipoDocumentoId = c.TipoDocumentoId,
        @DocumentoReceptor = c.DocumentoReceptor,
        @CondicionIVAId = c.CondicionIVAId,
        @ConceptoComprobanteId = c.ConceptoComprobanteId,
        @MonedaId = c.MonedaId,
        @ImporteNoGravado = c.ImporteNoGravado,
        @ImporteExento = c.ImporteExento,
        @ImporteNetoGravado = c.ImporteNetoGravado,
        @ImporteIVA = c.ImporteIVA,
        @ImporteTributos = c.ImporteTributos,
        @ImporteTotal = c.ImporteTotal
    FROM dbo.Comprobante c
    WHERE c.ComprobanteId = @ComprobanteOrigenId;

    INSERT INTO dbo.Comprobante
    (
        PedidoId,
        ClienteId,
        TipoComprobanteId,
        PuntoVenta,
        NumeroComprobante,
        FechaComprobante,
        TipoDocumentoId,
        DocumentoReceptor,
        CondicionIVAId,
        ConceptoComprobanteId,
        MonedaId,
        ImporteNoGravado,
        ImporteExento,
        ImporteNetoGravado,
        ImporteIVA,
        ImporteTributos,
        ImporteTotal,
        EstadoComprobante,
        Observaciones,
        ComprobanteAsociadoId
    )
    VALUES
    (
        @PedidoId,
        @ClienteId,
        @TipoComprobanteId,
        @PuntoVenta,
        @NumeroComprobante,
        CAST(GETDATE() AS DATE),
        @TipoDocumentoId,
        @DocumentoReceptor,
        @CondicionIVAId,
        @ConceptoComprobanteId,
        @MonedaId,
        @ImporteNoGravado,
        @ImporteExento,
        @ImporteNetoGravado,
        @ImporteIVA,
        @ImporteTributos,
        @ImporteTotal,
        'BORRADOR',
        ISNULL(@Observaciones, 'Nota de débito emitida desde comprobante asociado'),
        @ComprobanteOrigenId
    );

    SET @NuevoComprobanteId = SCOPE_IDENTITY();

    INSERT INTO dbo.DetalleComprobante
    (
        ComprobanteId,
        ProductoId,
        DescripcionItem,
        Cantidad,
        PrecioUnitario,
        BonificacionImporte,
        ImporteNetoItem,
        AlicuotaIVAId,
        BaseImponibleIVA,
        ImporteIVAItem,
        ImporteTotalItem
    )
    SELECT
        @NuevoComprobanteId,
        dc.ProductoId,
        dc.DescripcionItem,
        dc.Cantidad,
        dc.PrecioUnitario,
        dc.BonificacionImporte,
        dc.ImporteNetoItem,
        dc.AlicuotaIVAId,
        dc.BaseImponibleIVA,
        dc.ImporteIVAItem,
        dc.ImporteTotalItem
    FROM dbo.DetalleComprobante dc
    WHERE dc.ComprobanteId = @ComprobanteOrigenId;

    COMMIT TRANSACTION;

    SELECT @NuevoComprobanteId AS ComprobanteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Comprobante_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--Comprobante

CREATE PROCEDURE [dbo].[sp_Comprobante_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ComprobanteId,
        c.PedidoId,
        c.ClienteId,
        cl.Nombre AS ClienteNombre,
        cl.Apellido AS ClienteApellido,
        c.TipoComprobanteId,
        tc.Nombre AS TipoComprobanteNombre,
        c.PuntoVenta,
        c.NumeroComprobante,
        c.FechaComprobante,
        c.ImporteTotal,
        c.EstadoComprobante,
        c.CAE,
        c.ResultadoARCA,
        c.Observaciones
    FROM dbo.Comprobante c
    INNER JOIN dbo.Cliente cl
        ON c.ClienteId = cl.ClienteId
    INNER JOIN dbo.TipoComprobante tc
        ON c.TipoComprobanteId = tc.TipoComprobanteId
    ORDER BY c.FechaComprobante DESC, c.ComprobanteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Comprobante_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Comprobante_GetById]
    @ComprobanteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.ComprobanteId,
        c.PedidoId,
        c.ClienteId,
        cl.Nombre AS ClienteNombre,
        cl.Apellido AS ClienteApellido,
        c.TipoComprobanteId,
        tc.Nombre AS TipoComprobanteNombre,
        c.PuntoVenta,
        c.NumeroComprobante,
        c.FechaComprobante,
        c.TipoDocumentoId,
        td.Nombre AS TipoDocumentoNombre,
        c.DocumentoReceptor,
        c.CondicionIVAId,
        ci.Nombre AS CondicionIVANombre,
        c.ConceptoComprobanteId,
        cc.Nombre AS ConceptoComprobanteNombre,
        c.MonedaId,
        m.Nombre AS MonedaNombre,
        c.ImporteNoGravado,
        c.ImporteExento,
        c.ImporteNetoGravado,
        c.ImporteIVA,
        c.ImporteTributos,
        c.ImporteTotal,
        c.CAE,
        c.FechaVencimientoCAE,
        c.CAEA,
        c.ResultadoARCA,
        c.EstadoComprobante,
        c.Observaciones
    FROM dbo.Comprobante c
    INNER JOIN dbo.Cliente cl ON c.ClienteId = cl.ClienteId
    INNER JOIN dbo.TipoComprobante tc ON c.TipoComprobanteId = tc.TipoComprobanteId
    INNER JOIN dbo.TipoDocumento td ON c.TipoDocumentoId = td.TipoDocumentoId
    LEFT JOIN dbo.CondicionIVA ci ON c.CondicionIVAId = ci.CondicionIVAId
    INNER JOIN dbo.ConceptoComprobante cc ON c.ConceptoComprobanteId = cc.ConceptoComprobanteId
    INNER JOIN dbo.Moneda m ON c.MonedaId = m.MonedaId
    WHERE c.ComprobanteId = @ComprobanteId;

    SELECT
        dc.DetalleComprobanteId,
        dc.ComprobanteId,
        dc.ProductoId,
        dc.DescripcionItem,
        dc.Cantidad,
        dc.PrecioUnitario,
        dc.BonificacionImporte,
        dc.ImporteNetoItem,
        dc.AlicuotaIVAId,
        ai.Nombre AS AlicuotaIVANombre,
        dc.BaseImponibleIVA,
        dc.ImporteIVAItem,
        dc.ImporteTotalItem
    FROM dbo.DetalleComprobante dc
    LEFT JOIN dbo.AlicuotaIVA ai
        ON dc.AlicuotaIVAId = ai.AlicuotaIVAId
    WHERE dc.ComprobanteId = @ComprobanteId
    ORDER BY dc.DetalleComprobanteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Comprobante_InsertDesdePedido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Comprobante_InsertDesdePedido]
    @PedidoId INT,
    @TipoComprobanteId INT,
    @PuntoVenta INT,
    @NumeroComprobante BIGINT = NULL,
    @ConceptoComprobanteId INT,
    @MonedaId INT,
    @Observaciones VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @ClienteId INT, @TipoDocumentoId INT, @DocumentoReceptor BIGINT,
            @CondicionIVAId INT, @ImporteTotal DECIMAL(18,2), @ComprobanteId INT,
            @Estado VARCHAR(50), @RemitoId INT, @LockResult INT;
    BEGIN TRY
        BEGIN TRAN;
        SELECT @ClienteId=p.ClienteId,@ImporteTotal=p.Total,@Estado=ep.Nombre
        FROM dbo.Pedido p WITH (UPDLOCK,HOLDLOCK)
        JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId
        WHERE p.PedidoId=@PedidoId;
        IF @ClienteId IS NULL THROW 53402,'Pedido inexistente.',1;
        IF @Estado<>'Entregado' THROW 53403,'El comprobante interno se genera solo despues de la entrega.',1;
        SELECT TOP (1) @RemitoId=r.RemitoId
        FROM dbo.Remito r WITH (HOLDLOCK)
        WHERE r.PedidoId=@PedidoId AND r.Entregado=1 AND r.FechaEntrega IS NOT NULL;
        IF @RemitoId IS NULL THROW 53404,'No hay remito con entrega confirmada.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.TipoComprobante
                       WHERE TipoComprobanteId=@TipoComprobanteId
                         AND Nombre='Comprobante interno de venta' AND Activo=1)
            THROW 53405,'Tipo de comprobante no corresponde a venta interna.',1;
        IF @PuntoVenta IS NULL OR @PuntoVenta<=0 THROW 53406,'Punto de venta invalido.',1;
        IF @ImporteTotal IS NULL OR @ImporteTotal<0 THROW 53407,'Total de pedido invalido.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.DetallePedido WHERE PedidoId=@PedidoId)
            THROW 53408,'Pedido sin detalles.',1;
        IF EXISTS (SELECT 1 FROM dbo.Comprobante WITH (UPDLOCK,HOLDLOCK)
                   WHERE PedidoId=@PedidoId AND ComprobanteAsociadoId IS NULL)
            THROW 53409,'El pedido ya tiene comprobante de venta.',1;
        SELECT @TipoDocumentoId=c.TipoDocumentoId,
               @DocumentoReceptor=TRY_CAST(c.Documento AS BIGINT),
               @CondicionIVAId=c.CondicionIVAId
        FROM dbo.Cliente c WHERE c.ClienteId=@ClienteId;
        IF @TipoDocumentoId IS NULL THROW 53410,'Cliente sin tipo de documento.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.ConceptoComprobante WHERE ConceptoComprobanteId=@ConceptoComprobanteId)
            THROW 53411,'Concepto de comprobante inexistente.',1;
        IF NOT EXISTS (SELECT 1 FROM dbo.Moneda WHERE MonedaId=@MonedaId)
            THROW 53412,'Moneda inexistente.',1;
        EXEC @LockResult=sys.sp_getapplock
            @Resource='TEKA_ComprobanteInterno_Numero',@LockMode='Exclusive',
            @LockOwner='Transaction',@LockTimeout=10000;
        IF @LockResult<0 THROW 53413,'No se pudo bloquear numeracion interna.',1;
        IF @NumeroComprobante IS NULL
        BEGIN
            SELECT @NumeroComprobante=ISNULL(MAX(NumeroComprobante),0)+1
            FROM dbo.Comprobante WITH (UPDLOCK,HOLDLOCK)
            WHERE TipoComprobanteId=@TipoComprobanteId AND PuntoVenta=@PuntoVenta;
        END;
        IF @NumeroComprobante<=0 THROW 53414,'Numero de comprobante invalido.',1;
        IF EXISTS (SELECT 1 FROM dbo.Comprobante WITH (UPDLOCK,HOLDLOCK)
                   WHERE TipoComprobanteId=@TipoComprobanteId AND PuntoVenta=@PuntoVenta
                     AND NumeroComprobante=@NumeroComprobante)
            THROW 53415,'Numero de comprobante ya utilizado.',1;
        INSERT dbo.Comprobante
            (PedidoId,ClienteId,TipoComprobanteId,PuntoVenta,NumeroComprobante,
             FechaComprobante,TipoDocumentoId,DocumentoReceptor,CondicionIVAId,
             ConceptoComprobanteId,MonedaId,ImporteNoGravado,ImporteExento,
             ImporteNetoGravado,ImporteIVA,ImporteTributos,ImporteTotal,
             EstadoComprobante,Observaciones,ComprobanteAsociadoId)
        VALUES
            (@PedidoId,@ClienteId,@TipoComprobanteId,@PuntoVenta,@NumeroComprobante,
             CAST(GETDATE() AS DATE),@TipoDocumentoId,ISNULL(@DocumentoReceptor,0),
             @CondicionIVAId,@ConceptoComprobanteId,@MonedaId,0,0,
             @ImporteTotal,0,0,@ImporteTotal,'EMITIDO',@Observaciones,NULL);
        SET @ComprobanteId=CONVERT(INT,SCOPE_IDENTITY());
        INSERT dbo.DetalleComprobante
            (ComprobanteId,ProductoId,DescripcionItem,Cantidad,PrecioUnitario,
             BonificacionImporte,ImporteNetoItem,AlicuotaIVAId,BaseImponibleIVA,
             ImporteIVAItem,ImporteTotalItem)
        SELECT @ComprobanteId,dp.ProductoId,pr.Nombre,dp.Cantidad,dp.PrecioUnitario,
               0,dp.Subtotal,NULL,NULL,NULL,dp.Subtotal
        FROM dbo.DetallePedido dp
        JOIN dbo.Producto pr ON pr.ProductoId=dp.ProductoId
        WHERE dp.PedidoId=@PedidoId;
        COMMIT;
        SELECT @ComprobanteId AS ComprobanteId,@NumeroComprobante AS NumeroComprobante;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT>0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ConceptoComprobante_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--CONCEPTOCOMPROBANTE

CREATE PROCEDURE [dbo].[sp_ConceptoComprobante_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ConceptoComprobanteId,
        CodigoARCA,
        Nombre,
        Activo
    FROM dbo.ConceptoComprobante
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ConceptoComprobante_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ConceptoComprobante_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ConceptoComprobanteId AS Id,
        Nombre AS Descripcion,
        CodigoARCA
    FROM dbo.ConceptoComprobante
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_CondicionIVA_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- CONDICIONIVA
   
CREATE PROCEDURE [dbo].[sp_CondicionIVA_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CondicionIVAId,
        Nombre,
        CodigoAFIP,
        Activo
    FROM dbo.CondicionIVA
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_CondicionIVA_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_CondicionIVA_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CondicionIVAId AS Id,
        Nombre AS Descripcion,
        CodigoAFIP
    FROM dbo.CondicionIVA
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ConsumoProduccion_GetByOrden] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--ConsumoProduccion

CREATE   PROCEDURE [dbo].[sp_ConsumoProduccion_GetByOrden]
    @OrdenProduccionId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        cp.ConsumoProduccionId,
        cp.OrdenProduccionId,
        cp.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        cp.DepositoId,
        d.Nombre AS DepositoNombre,
        cp.FechaConsumo,
        cp.CantidadConsumida,
        cp.Observaciones
    FROM dbo.ConsumoProduccion cp
    INNER JOIN dbo.Insumo i
        ON cp.InsumoId = i.InsumoId
    INNER JOIN dbo.Deposito d
        ON cp.DepositoId = d.DepositoId
    WHERE cp.OrdenProduccionId = @OrdenProduccionId
    ORDER BY cp.ConsumoProduccionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ConsumoRecorteProduccion_GetByOrden] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--ConsumoRecorteProduccion

CREATE PROCEDURE [dbo].[sp_ConsumoRecorteProduccion_GetByOrden]
    @OrdenProduccionId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        crp.ConsumoRecorteProduccionId,
        crp.OrdenProduccionId,
        crp.RecorteId,
        crp.DepositoId,
        d.Nombre AS DepositoNombre,
        crp.FechaConsumo,
        crp.CantidadConsumida,
        crp.Observaciones,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura
    FROM dbo.ConsumoRecorteProduccion crp
    INNER JOIN dbo.Recorte r
        ON crp.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Deposito d
        ON crp.DepositoId = d.DepositoId
    WHERE crp.OrdenProduccionId = @OrdenProduccionId
    ORDER BY crp.ConsumoRecorteProduccionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Deposito_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Deposito_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        DepositoId,
        Nombre,
        Descripcion,
        Ubicacion,
        Activo
    FROM dbo.Deposito
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Deposito_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Deposito_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        DepositoId AS Id,
        Nombre AS Descripcion
    FROM dbo.Deposito
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_DetalleListaMateriales_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_DetalleListaMateriales_Delete] @DetalleListaMaterialesId INT
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @ListaMaterialesId INT=(SELECT ListaMaterialesId FROM dbo.DetalleListaMateriales WHERE DetalleListaMaterialesId=@DetalleListaMaterialesId);
 IF @ListaMaterialesId IS NULL THROW 61018,'Detalle inexistente.',1;
 IF EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle WHERE ListaMaterialesId=@ListaMaterialesId) THROW 61016,'Una configuracion utilizada por una orden es historica e inmutable.',1;
 IF (SELECT COUNT(*) FROM dbo.DetalleListaMateriales WHERE ListaMaterialesId=@ListaMaterialesId)<=1 THROW 61033,'La configuracion no puede quedar sin materiales.',1;
 DELETE dbo.DetalleListaMateriales WHERE DetalleListaMaterialesId=@DetalleListaMaterialesId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_DetalleListaMateriales_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_DetalleListaMateriales_GetById]
    @DetalleListaMaterialesId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        dlm.DetalleListaMaterialesId,
        dlm.ListaMaterialesId,
        dlm.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        dlm.Cantidad,
        dlm.Observaciones
    FROM dbo.DetalleListaMateriales dlm
    INNER JOIN dbo.Insumo i
        ON dlm.InsumoId = i.InsumoId
    WHERE dlm.DetalleListaMaterialesId = @DetalleListaMaterialesId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_DetalleListaMateriales_GetByListaMateriales] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--DetalleListaMateriales

CREATE PROCEDURE [dbo].[sp_DetalleListaMateriales_GetByListaMateriales]
    @ListaMaterialesId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        dlm.DetalleListaMaterialesId,
        dlm.ListaMaterialesId,
        dlm.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        dlm.Cantidad,
        dlm.Observaciones
    FROM dbo.DetalleListaMateriales dlm
    INNER JOIN dbo.Insumo i
        ON dlm.InsumoId = i.InsumoId
    WHERE dlm.ListaMaterialesId = @ListaMaterialesId
    ORDER BY dlm.DetalleListaMaterialesId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_DetalleListaMateriales_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_DetalleListaMateriales_Insert]
 @ListaMaterialesId INT,@InsumoId INT,@Cantidad DECIMAL(18,2),@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle WHERE ListaMaterialesId=@ListaMaterialesId) THROW 61016,'Una configuracion utilizada por una orden es historica e inmutable.',1;
 IF @Cantidad IS NULL OR @Cantidad<=0 OR NOT EXISTS(SELECT 1 FROM dbo.Insumo WHERE InsumoId=@InsumoId AND Activo=1) THROW 61019,'Insumo o cantidad invalida.',1;
 INSERT dbo.DetalleListaMateriales(ListaMaterialesId,InsumoId,Cantidad,Observaciones) VALUES(@ListaMaterialesId,@InsumoId,@Cantidad,@Observaciones);
 SELECT CONVERT(INT,SCOPE_IDENTITY()) DetalleListaMaterialesId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_DetalleListaMateriales_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_DetalleListaMateriales_Update]
 @DetalleListaMaterialesId INT,@InsumoId INT,@Cantidad DECIMAL(18,2),@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @ListaMaterialesId INT=(SELECT ListaMaterialesId FROM dbo.DetalleListaMateriales WHERE DetalleListaMaterialesId=@DetalleListaMaterialesId);
 IF @ListaMaterialesId IS NULL THROW 61018,'Detalle inexistente.',1;
 IF EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle WHERE ListaMaterialesId=@ListaMaterialesId) THROW 61016,'Una configuracion utilizada por una orden es historica e inmutable.',1;
 IF @Cantidad IS NULL OR @Cantidad<=0 OR NOT EXISTS(SELECT 1 FROM dbo.Insumo WHERE InsumoId=@InsumoId AND Activo=1) THROW 61019,'Insumo o cantidad invalida.',1;
 UPDATE dbo.DetalleListaMateriales SET InsumoId=@InsumoId,Cantidad=@Cantidad,Observaciones=@Observaciones WHERE DetalleListaMaterialesId=@DetalleListaMaterialesId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_DomicilioCliente_Activar]
    @DomicilioClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.DomicilioCliente
    SET Activo = 1
    WHERE DomicilioClienteId = @DomicilioClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_DomicilioCliente_Delete]
    @DomicilioClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.DomicilioCliente
    SET
        Activo = 0
    WHERE DomicilioClienteId = @DomicilioClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_GetByCliente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_DomicilioCliente_GetByCliente] @ClienteId INT AS
    BEGIN SET NOCOUNT ON;
      SELECT d.DomicilioClienteId,d.ClienteId,t.Nombre AS TipoDomicilio,d.TipoDomicilioId,
             d.Direccion,d.Calle,d.Altura,d.PisoDepto,d.Barrio,d.CodigoPostal,
             d.LocalidadId,l.Nombre AS LocalidadNombre,d.ProvinciaId,p.Nombre AS ProvinciaNombre,d.Activo
      FROM dbo.DomicilioCliente d
      JOIN dbo.TipoDomicilio t ON t.TipoDomicilioId=d.TipoDomicilioId
      JOIN dbo.Localidad l ON l.LocalidadId=d.LocalidadId
      JOIN dbo.Provincia p ON p.ProvinciaId=d.ProvinciaId
      WHERE d.ClienteId=@ClienteId ORDER BY t.Nombre,d.DomicilioClienteId;
    END
GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_DomicilioCliente_GetById] @DomicilioClienteId INT AS
    BEGIN SET NOCOUNT ON;
      SELECT d.DomicilioClienteId,d.ClienteId,t.Nombre AS TipoDomicilio,d.TipoDomicilioId,
             d.Direccion,d.Calle,d.Altura,d.PisoDepto,d.Barrio,d.CodigoPostal,
             d.LocalidadId,l.Nombre AS LocalidadNombre,d.ProvinciaId,p.Nombre AS ProvinciaNombre,d.Activo
      FROM dbo.DomicilioCliente d
      JOIN dbo.TipoDomicilio t ON t.TipoDomicilioId=d.TipoDomicilioId
      JOIN dbo.Localidad l ON l.LocalidadId=d.LocalidadId
      JOIN dbo.Provincia p ON p.ProvinciaId=d.ProvinciaId
      WHERE d.DomicilioClienteId=@DomicilioClienteId;
    END
GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_DomicilioCliente_Insert]
      @ClienteId INT,@TipoDomicilio VARCHAR(30),@Calle VARCHAR(120),@Altura VARCHAR(20),
      @PisoDepto VARCHAR(50)=NULL,@Barrio VARCHAR(100)=NULL,@CodigoPostal VARCHAR(20)=NULL,
      @LocalidadId INT,@ProvinciaId INT,@TipoDomicilioId INT=NULL AS
    BEGIN SET NOCOUNT ON;
      IF @TipoDomicilioId IS NULL
        SELECT @TipoDomicilioId=TipoDomicilioId FROM dbo.TipoDomicilio
        WHERE NombreClave=UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          LTRIM(RTRIM(REPLACE(REPLACE(@TipoDomicilio, CHAR(9), ' '), CHAR(160), ' '))),
          '  ',' '),'  ',' '),'  ',' '),'  ',' '),'  ',' '));
      DECLARE @Nombre VARCHAR(30);
      SELECT @Nombre=Nombre FROM dbo.TipoDomicilio WHERE TipoDomicilioId=@TipoDomicilioId AND Activo=1;
      IF @Nombre IS NULL THROW 51010, 'Seleccioná un tipo de domicilio activo.', 1;
      DECLARE @Direccion VARCHAR(250)=LTRIM(RTRIM(@Calle+' '+@Altura+
        ISNULL(' '+NULLIF(@PisoDepto,''),'')+
        ISNULL(' - '+NULLIF(@Barrio,''),'')+
        ISNULL(' - CP '+NULLIF(@CodigoPostal,''),'')));
      INSERT dbo.DomicilioCliente (ClienteId,TipoDomicilio,TipoDomicilioId,Direccion,Calle,Altura,PisoDepto,Barrio,CodigoPostal,LocalidadId,ProvinciaId,Activo)
      VALUES (@ClienteId,@Nombre,@TipoDomicilioId,@Direccion,@Calle,@Altura,@PisoDepto,@Barrio,@CodigoPostal,@LocalidadId,@ProvinciaId,1);
      SELECT SCOPE_IDENTITY() AS DomicilioClienteId;
    END
GO
/****** Objeto: StoredProcedure [dbo].[sp_DomicilioCliente_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_DomicilioCliente_Update]
      @DomicilioClienteId INT,@TipoDomicilio VARCHAR(30),@Calle VARCHAR(120),@Altura VARCHAR(20),
      @PisoDepto VARCHAR(50)=NULL,@Barrio VARCHAR(100)=NULL,@CodigoPostal VARCHAR(20)=NULL,
      @LocalidadId INT,@ProvinciaId INT,@TipoDomicilioId INT=NULL AS
    BEGIN SET NOCOUNT ON;
      IF @TipoDomicilioId IS NULL
        SELECT @TipoDomicilioId=TipoDomicilioId FROM dbo.TipoDomicilio
        WHERE NombreClave=UPPER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          LTRIM(RTRIM(REPLACE(REPLACE(@TipoDomicilio, CHAR(9), ' '), CHAR(160), ' '))),
          '  ',' '),'  ',' '),'  ',' '),'  ',' '),'  ',' '));
      DECLARE @Nombre VARCHAR(30);
      SELECT @Nombre=Nombre FROM dbo.TipoDomicilio
        WHERE TipoDomicilioId=@TipoDomicilioId AND (Activo=1 OR TipoDomicilioId=(SELECT TipoDomicilioId FROM dbo.DomicilioCliente WHERE DomicilioClienteId=@DomicilioClienteId));
      IF @Nombre IS NULL THROW 51011, 'Seleccioná un tipo de domicilio activo.', 1;
      DECLARE @Direccion VARCHAR(250)=LTRIM(RTRIM(@Calle+' '+@Altura+
        ISNULL(' '+NULLIF(@PisoDepto,''),'')+
        ISNULL(' - '+NULLIF(@Barrio,''),'')+
        ISNULL(' - CP '+NULLIF(@CodigoPostal,''),'')));
      UPDATE dbo.DomicilioCliente SET TipoDomicilio=@Nombre,TipoDomicilioId=@TipoDomicilioId,
        Direccion=@Direccion,Calle=@Calle,Altura=@Altura,PisoDepto=@PisoDepto,Barrio=@Barrio,
        CodigoPostal=@CodigoPostal,LocalidadId=@LocalidadId,ProvinciaId=@ProvinciaId
      WHERE DomicilioClienteId=@DomicilioClienteId;
      IF @@ROWCOUNT=0 THROW 51012, 'No se encontró el domicilio solicitado.', 1;
    END
GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Catalogo_Publico] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_Catalogo_Publico]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.ProductoId,p.Codigo,p.Nombre,pub.DescripcionComercial,
        precio.Precio,ft.AnchoCm,ft.AltoCm,ft.ProfundidadCm,
        disp.DepositoId,disp.CupoOnline,
        foto.UrlArchivo UrlPortada,pub.Destacado,pub.OrdenVisual
 FROM dbo.Producto p
 INNER JOIN dbo.ProductoPublicacion pub ON pub.ProductoId=p.ProductoId AND pub.Publicado=1
 INNER JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId=p.ProductoId
 INNER JOIN dbo.ProductoDisponibilidadOnline disp ON disp.ProductoId=p.ProductoId AND disp.CupoOnline>0
 CROSS APPLY (SELECT TOP(1) pv.Precio FROM dbo.PrecioVenta pv
   WHERE pv.ProductoId=p.ProductoId AND pv.Activo=1 AND pv.Precio>0
   AND pv.FechaVigenciaDesde<=GETDATE() AND (pv.FechaVigenciaHasta IS NULL OR pv.FechaVigenciaHasta>=GETDATE())
   ORDER BY pv.FechaVigenciaDesde DESC,pv.PrecioVentaId DESC) precio
 CROSS APPLY (SELECT TOP(1) i.UrlArchivo FROM dbo.ProductoImagen i
   WHERE i.ProductoId=p.ProductoId AND i.EsPrincipal=1 ORDER BY i.OrdenVisual,i.ProductoImagenId) foto
 WHERE p.Activo=1 AND NULLIF(LTRIM(RTRIM(pub.DescripcionComercial)),'') IS NOT NULL
 AND (SELECT COUNT(*) FROM dbo.ProductoImagen i WHERE i.ProductoId=p.ProductoId)=3
 ORDER BY pub.OrdenVisual,p.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Catalogo_Resumen] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* TEKA: ejecutar sobre base existente después de 06 y 07. No modifica Inventario. */
CREATE   PROCEDURE [dbo].[sp_Ecommerce_Catalogo_Resumen]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.ProductoId, CAST(CASE WHEN pub.ProductoId IS NULL THEN 0 ELSE 1 END AS BIT) Configurado,
        CAST(ISNULL(pub.Publicado,0) AS BIT) Publicado,
        (SELECT TOP (1) i.UrlArchivo FROM dbo.ProductoImagen i
         WHERE i.ProductoId=p.ProductoId ORDER BY i.EsPrincipal DESC, i.OrdenVisual, i.ProductoImagenId) UrlPortada
 FROM dbo.Producto p
 LEFT JOIN dbo.ProductoPublicacion pub ON pub.ProductoId=p.ProductoId
 WHERE p.Activo=1;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Cuentas] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Cuentas]
 @Desde DATE=NULL,@Hasta DATE=NULL,@SoloSinCompras BIT=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 ;WITH H AS (
 SELECT ClienteId,COUNT_BIG(*) ComprasHistoricas,MAX(FechaEntregaAnalitica) UltimaEntregaConFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica GROUP BY ClienteId
 )
 SELECT c.ClienteId,c.Nombre,c.Apellido,c.Email,cc.EmailNormalizado,
 cc.EmailVerificado,cc.Activo AS CuentaActiva,cc.FechaAlta AS FechaRegistroDigital,
 cc.FechaUltimoAcceso,COALESCE(h.ComprasHistoricas,0) ComprasHistoricas,h.UltimaEntregaConFecha
 FROM dbo.CuentaClienteEcommerce cc JOIN dbo.Cliente c ON c.ClienteId=cc.ClienteId
 LEFT JOIN H h ON h.ClienteId=c.ClienteId
 WHERE (@Desde IS NULL OR cc.FechaAlta>=@Desde)
 AND (@Hasta IS NULL OR cc.FechaAlta<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 AND (@SoloSinCompras IS NULL OR (@SoloSinCompras=1 AND h.ClienteId IS NULL)
 OR (@SoloSinCompras=0 AND h.ClienteId IS NOT NULL))
 ORDER BY cc.FechaAlta DESC,c.ClienteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_DetalleExportacion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_DetalleExportacion]
 @Desde DATE=NULL,@Hasta DATE=NULL,@ClienteId INT=NULL,@IncluirSinFecha BIT=0
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 SELECT v.PedidoId,v.ClienteId,c.Nombre,c.Apellido,c.Email,v.FechaPedido,
 v.FechaEntregaAnalitica,v.OrigenFecha,v.Total AS TotalPedido,
 d.DetallePedidoId,d.ProductoId,pr.Codigo AS CodigoProducto,pr.Nombre AS Producto,
 d.Cantidad,d.PrecioUnitario,d.Subtotal AS ImporteLinea
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica v
 JOIN dbo.Cliente c ON c.ClienteId=v.ClienteId
 JOIN dbo.DetallePedido d ON d.PedidoId=v.PedidoId
 JOIN dbo.Producto pr ON pr.ProductoId=d.ProductoId
 WHERE (@ClienteId IS NULL OR v.ClienteId=@ClienteId)
 AND ((v.FechaEntregaAnalitica IS NOT NULL
 AND (@Desde IS NULL OR v.FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR v.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta))))
 OR (@IncluirSinFecha=1 AND v.FechaEntregaAnalitica IS NULL))
 ORDER BY v.FechaEntregaAnalitica DESC,v.PedidoId DESC,d.DetallePedidoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Evolucion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* ETAPA 2: procedimientos complementarios. Todos de solo lectura. */
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Evolucion]
 @Desde DATE=NULL,@Hasta DATE=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 ;WITH Fechadas AS (
 SELECT v.ClienteId,v.PedidoId,v.Total,v.FechaEntregaAnalitica,
        DATEFROMPARTS(YEAR(v.FechaEntregaAnalitica),MONTH(v.FechaEntregaAnalitica),1) Mes,
        ROW_NUMBER() OVER(PARTITION BY v.ClienteId ORDER BY v.FechaEntregaAnalitica,v.PedidoId) NumeroCompraFechada
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica v WHERE v.FechaEntregaAnalitica IS NOT NULL
 ), Hist AS (
 SELECT ClienteId, SUM(CASE WHEN FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END) SinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica GROUP BY ClienteId
 )
 SELECT f.Mes,COUNT_BIG(*) ComprasEntregadas,COUNT(DISTINCT f.ClienteId) Compradores,
 SUM(f.Total) ImportePedidosEntregados,
 COUNT(DISTINCT CASE WHEN f.NumeroCompraFechada=1 AND h.SinFecha=0 THEN f.ClienteId END) NuevosVerificables,
 COUNT(DISTINCT CASE WHEN f.NumeroCompraFechada>1 THEN f.ClienteId END) CompradoresConCompraPreviaFechada,
 COUNT(DISTINCT CASE WHEN h.SinFecha>0 THEN f.ClienteId END) CompradoresConHistorialSinFecha
 FROM Fechadas f JOIN Hist h ON h.ClienteId=f.ClienteId
 WHERE (@Desde IS NULL OR f.FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR f.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 GROUP BY f.Mes ORDER BY f.Mes;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Explorador] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Explorador]
 @Desde DATE=NULL,@Hasta DATE=NULL,@Busqueda NVARCHAR(150)=NULL,
 @Segmento VARCHAR(20)='TODOS',@Pagina INT=1,@TamanoPagina INT=25
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 IF @Pagina<1 OR @TamanoPagina<1 OR @TamanoPagina>100 THROW 51002,'Paginacion invalida.',1;
 IF @Segmento NOT IN ('TODOS','RECURRENTES','UNA_COMPRA') THROW 51003,'Segmento invalido.',1;
 ;WITH Historico AS (
 SELECT ClienteId,COUNT_BIG(*) AS ComprasHistoricas,MAX(FechaEntregaAnalitica) AS UltimaEntregaConFecha,
        SUM(Total) AS ImporteHistorico,
        SUM(CASE WHEN FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END) AS ComprasSinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica GROUP BY ClienteId
 ), Periodo AS (
 SELECT ClienteId,COUNT_BIG(*) AS ComprasPeriodo,SUM(Total) AS ImportePeriodo
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica
 WHERE FechaEntregaAnalitica IS NOT NULL
   AND (@Desde IS NULL OR FechaEntregaAnalitica>=@Desde)
   AND (@Hasta IS NULL OR FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 GROUP BY ClienteId
 ), Filtrados AS (
 SELECT c.ClienteId,c.Nombre,c.Apellido,c.Email,c.Telefono,c.Activo,
        h.ComprasHistoricas,h.ImporteHistorico,h.UltimaEntregaConFecha,h.ComprasSinFecha,
        COALESCE(p.ComprasPeriodo,0) AS ComprasPeriodo,COALESCE(p.ImportePeriodo,0) AS ImportePeriodo,
        CASE WHEN cc.ClienteId IS NULL THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END AS TieneCuentaDigital
 FROM dbo.Cliente c JOIN Historico h ON h.ClienteId=c.ClienteId
 LEFT JOIN Periodo p ON p.ClienteId=c.ClienteId
 LEFT JOIN dbo.CuentaClienteEcommerce cc ON cc.ClienteId=c.ClienteId
 WHERE (@Desde IS NULL AND @Hasta IS NULL OR p.ClienteId IS NOT NULL)
   AND (@Segmento='TODOS' OR (@Segmento='RECURRENTES' AND h.ComprasHistoricas>=2)
                          OR (@Segmento='UNA_COMPRA' AND h.ComprasHistoricas=1))
   AND (NULLIF(LTRIM(RTRIM(@Busqueda)),'') IS NULL OR
        c.Nombre LIKE '%'+@Busqueda+'%' OR c.Apellido LIKE '%'+@Busqueda+'%' OR
        c.Email LIKE '%'+@Busqueda+'%' OR CONVERT(VARCHAR(20),c.ClienteId)=@Busqueda)
 )
 SELECT *,COUNT_BIG(*) OVER() AS TotalFilas
 FROM Filtrados ORDER BY ImportePeriodo DESC,ClienteId
 OFFSET (CONVERT(BIGINT,@Pagina)-1)*@TamanoPagina ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Ficha] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Ficha]
 @ClienteId INT,@Desde DATE=NULL,@Hasta DATE=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF @ClienteId IS NULL OR @ClienteId<=0 THROW 51006,'ClienteId invalido.',1;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 SELECT c.ClienteId,c.Nombre,c.Apellido,c.Documento,c.Telefono,c.Email,c.Activo,c.FechaAlta,
 cc.CuentaClienteEcommerceId,cc.EmailVerificado,cc.Activo AS CuentaActiva,
 cc.FechaAlta AS FechaRegistroDigital,cc.FechaUltimoAcceso,
 COUNT_BIG(v.PedidoId) ComprasHistoricas,COALESCE(SUM(v.Total),0) ImporteHistorico,
 MIN(v.FechaEntregaAnalitica) PrimeraEntregaConFecha,MAX(v.FechaEntregaAnalitica) UltimaEntregaConFecha,
 COALESCE(SUM(CASE WHEN v.PedidoId IS NOT NULL AND v.FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END),0) ComprasSinFecha
 FROM dbo.Cliente c LEFT JOIN dbo.CuentaClienteEcommerce cc ON cc.ClienteId=c.ClienteId
 LEFT JOIN dbo.vw_Ecommerce_ComprasEntregadas_Analitica v ON v.ClienteId=c.ClienteId
 WHERE c.ClienteId=@ClienteId
 GROUP BY c.ClienteId,c.Nombre,c.Apellido,c.Documento,c.Telefono,c.Email,c.Activo,c.FechaAlta,
 cc.CuentaClienteEcommerceId,cc.EmailVerificado,cc.Activo,cc.FechaAlta,cc.FechaUltimoAcceso;
 SELECT p.PedidoId,p.FechaPedido,p.EstadoPedidoId,p.Total,p.Observaciones,
 v.FechaEntregaAnalitica,v.OrigenFecha,
 CASE WHEN v.PedidoId IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS CuentaComoCompraEntregada
 FROM dbo.Pedido p LEFT JOIN dbo.vw_Ecommerce_ComprasEntregadas_Analitica v ON v.PedidoId=p.PedidoId
 WHERE p.ClienteId=@ClienteId AND p.CanalVentaId=4
 AND (p.Observaciones IS NULL OR p.Observaciones NOT LIKE '%[[]DEMO-ONLINE-20261012[]]%')
 AND (@Desde IS NULL AND @Hasta IS NULL OR (v.FechaEntregaAnalitica IS NOT NULL
 AND (@Desde IS NULL OR v.FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR v.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))))
 ORDER BY p.FechaPedido DESC,p.PedidoId DESC;
 SELECT d.PedidoId,d.ProductoId,pr.Codigo,pr.Nombre,d.Cantidad,d.PrecioUnitario,d.Subtotal
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica v
 JOIN dbo.DetallePedido d ON d.PedidoId=v.PedidoId
 JOIN dbo.Producto pr ON pr.ProductoId=d.ProductoId
 WHERE v.ClienteId=@ClienteId
 AND v.FechaEntregaAnalitica IS NOT NULL
 AND (@Desde IS NULL OR v.FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR v.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 ORDER BY v.FechaEntregaAnalitica DESC,d.PedidoId DESC,d.DetallePedidoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Productos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Productos]
 @Desde DATE=NULL,@Hasta DATE=NULL,@ClienteId INT=NULL,@Top INT=20
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 IF @Top<1 OR @Top>100 THROW 51004,'Top invalido.',1;
 SELECT TOP (@Top) d.ProductoId,pr.Codigo,pr.Nombre,pr.TipoProductoId,
        COUNT(DISTINCT v.PedidoId) AS PedidosConProducto,
        COUNT(DISTINCT v.ClienteId) AS CompradoresDistintos,
        SUM(d.Cantidad) AS UnidadesEntregadas,
        SUM(d.Subtotal) AS ImporteLineas
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica v
 JOIN dbo.DetallePedido d ON d.PedidoId=v.PedidoId
 JOIN dbo.Producto pr ON pr.ProductoId=d.ProductoId
 WHERE v.FechaEntregaAnalitica IS NOT NULL
   AND (@Desde IS NULL OR v.FechaEntregaAnalitica>=@Desde)
   AND (@Hasta IS NULL OR v.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
   AND (@ClienteId IS NULL OR v.ClienteId=@ClienteId)
 GROUP BY d.ProductoId,pr.Codigo,pr.Nombre,pr.TipoProductoId
 ORDER BY UnidadesEntregadas DESC,CompradoresDistintos DESC,d.ProductoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Ranking] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Ranking]
 @Desde DATE=NULL,@Hasta DATE=NULL,@Top INT=50
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 IF @Top<1 OR @Top>500 THROW 51004,'Top invalido.',1;
 ;WITH H AS (
 SELECT ClienteId,COUNT_BIG(*) ComprasHistoricas,SUM(Total) ImporteHistorico,
 MAX(FechaEntregaAnalitica) UltimaEntregaConFecha,
 SUM(CASE WHEN FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END) ComprasSinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica GROUP BY ClienteId
 ), P AS (
 SELECT ClienteId,COUNT_BIG(*) ComprasPeriodo,SUM(Total) ImportePeriodo
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica
 WHERE FechaEntregaAnalitica IS NOT NULL
 AND (@Desde IS NULL OR FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta))) GROUP BY ClienteId
 )
 SELECT TOP (@Top) c.ClienteId,c.Nombre,c.Apellido,c.Email,
 h.ComprasHistoricas,h.ImporteHistorico,h.UltimaEntregaConFecha,h.ComprasSinFecha,
 COALESCE(p.ComprasPeriodo,0) ComprasPeriodo,COALESCE(p.ImportePeriodo,0) ImportePeriodo,
 CAST(CASE WHEN COALESCE(p.ComprasPeriodo,0)=0 THEN 0 ELSE p.ImportePeriodo/CONVERT(DECIMAL(18,2),p.ComprasPeriodo) END AS DECIMAL(18,2)) TicketPromedioPeriodo
 FROM H h JOIN dbo.Cliente c ON c.ClienteId=h.ClienteId LEFT JOIN P p ON p.ClienteId=h.ClienteId
 WHERE (@Desde IS NULL AND @Hasta IS NULL OR p.ClienteId IS NOT NULL)
 ORDER BY ImportePeriodo DESC,ComprasPeriodo DESC,c.ClienteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Resumen] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Resumen]
 @Desde DATE=NULL, @Hasta DATE=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta
  THROW 51001,'La fecha Desde no puede superar Hasta.',1;
 ;WITH Periodo AS (
 SELECT * FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica v
 WHERE v.FechaEntregaAnalitica IS NOT NULL
   AND (@Desde IS NULL OR v.FechaEntregaAnalitica>=@Desde)
   AND (@Hasta IS NULL OR v.FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 ), Historial AS (
 SELECT ClienteId,COUNT_BIG(*) AS ComprasHistoricas,MIN(FechaEntregaAnalitica) AS PrimeraEntregaConFecha,
        SUM(CASE WHEN FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END) AS ComprasSinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica GROUP BY ClienteId
 ), PorCliente AS (
 SELECT p.ClienteId,COUNT_BIG(*) AS ComprasPeriodo,SUM(p.Total) AS ImportePeriodo,
        MAX(p.FechaEntregaAnalitica) AS UltimaEntregaPeriodo,
        MAX(CASE WHEN h.ComprasHistoricas>=2 THEN 1 ELSE 0 END) AS EsRecurrente,
        MAX(CASE WHEN h.PrimeraEntregaConFecha>=@Desde AND h.PrimeraEntregaConFecha<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta))
             AND h.ComprasSinFecha=0
             THEN 1 ELSE 0 END) AS EsNuevoVerificable
 FROM Periodo p JOIN Historial h ON h.ClienteId=p.ClienteId GROUP BY p.ClienteId
 )
 SELECT COUNT_BIG(*) AS CompradoresPeriodo,
        COALESCE(SUM(ComprasPeriodo),0) AS ComprasEntregadasPeriodo,
        COALESCE(SUM(ImportePeriodo),0) AS ImportePedidosEntregadosPeriodo,
        COALESCE(SUM(EsRecurrente),0) AS CompradoresRecurrentes,
        COALESCE(SUM(CASE WHEN @Desde IS NOT NULL AND @Hasta IS NOT NULL THEN EsNuevoVerificable ELSE 0 END),0) AS NuevosCompradoresVerificables,
        CAST(CASE WHEN COUNT_BIG(*)=0 THEN 0 ELSE 100.0*SUM(EsRecurrente)/COUNT_BIG(*) END AS DECIMAL(9,2)) AS PorcentajeRecurrentes
 FROM PorCliente;
 SELECT COUNT_BIG(*) AS ComprasHistoricasSinFecha,
        COUNT(DISTINCT ClienteId) AS ClientesHistoricosConComprasSinFecha,
        COALESCE(SUM(Total),0) AS ImporteHistoricoSinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica WHERE FechaEntregaAnalitica IS NULL;
 SELECT COUNT_BIG(*) AS ComprasHistoricasEntregadas,
        COUNT(DISTINCT ClienteId) AS CompradoresHistoricos,
        COALESCE(SUM(Total),0) AS ImporteHistoricoEntregado
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_ClientesOnline_Segmentos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_ClientesOnline_Segmentos]
 @Desde DATE=NULL,@Hasta DATE=NULL,@FechaCorte DATE=NULL,@DiasInactividad INT=90
AS
BEGIN
 SET NOCOUNT ON;
 IF @Desde IS NOT NULL AND @Hasta IS NOT NULL AND @Desde>@Hasta THROW 51001,'Rango de fechas invalido.',1;
 IF @DiasInactividad<1 OR @DiasInactividad>3650 THROW 51005,'Dias de inactividad invalidos.',1;
 DECLARE @Corte DATE=COALESCE(@FechaCorte,@Hasta,CONVERT(DATE,GETDATE()));
 ;WITH H AS (
 SELECT ClienteId,COUNT_BIG(*) ComprasHistoricas,SUM(Total) ImporteHistorico,
 MAX(FechaEntregaAnalitica) UltimaFecha,
 SUM(CASE WHEN FechaEntregaAnalitica IS NULL THEN 1 ELSE 0 END) ComprasSinFecha
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica
 WHERE FechaEntregaAnalitica IS NULL OR FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Corte))
 GROUP BY ClienteId
 ), P AS (
 SELECT ClienteId,COUNT_BIG(*) ComprasPeriodo,SUM(Total) ImportePeriodo
 FROM dbo.vw_Ecommerce_ComprasEntregadas_Analitica
 WHERE FechaEntregaAnalitica IS NOT NULL AND FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Corte))
 AND (@Desde IS NULL OR FechaEntregaAnalitica>=@Desde)
 AND (@Hasta IS NULL OR FechaEntregaAnalitica<DATEADD(DAY,1,CONVERT(DATETIME,@Hasta)))
 GROUP BY ClienteId
 ), S AS (
 SELECT h.ClienteId,h.ComprasHistoricas,h.ImporteHistorico,h.UltimaFecha,h.ComprasSinFecha,
 COALESCE(p.ComprasPeriodo,0) ComprasPeriodo,COALESCE(p.ImportePeriodo,0) ImportePeriodo,
 CASE WHEN h.ComprasHistoricas=1 THEN 'UNA_COMPRA' WHEN h.ComprasHistoricas BETWEEN 2 AND 3 THEN 'DOS_TRES' ELSE 'CUATRO_MAS' END Frecuencia,
 CASE WHEN h.UltimaFecha IS NULL THEN 'SIN_FECHA'
 WHEN DATEDIFF(DAY,CONVERT(DATE,h.UltimaFecha),@Corte)>=@DiasInactividad THEN 'INACTIVO'
 ELSE 'ACTIVO' END Actividad
 FROM H h LEFT JOIN P p ON p.ClienteId=h.ClienteId
 )
 SELECT Frecuencia,Actividad,COUNT_BIG(*) ClientesHistoricos,
 SUM(CASE WHEN ComprasPeriodo>0 THEN 1 ELSE 0 END) ClientesConComprasPeriodo,
 SUM(ComprasHistoricas) ComprasHistoricas,SUM(ImporteHistorico) ImporteHistorico,
 SUM(ComprasPeriodo) ComprasPeriodo,SUM(ImportePeriodo) ImportePeriodo,
 SUM(CASE WHEN ComprasSinFecha>0 THEN 1 ELSE 0 END) ClientesConComprasSinFecha
 FROM S GROUP BY Frecuencia,Actividad ORDER BY Frecuencia,Actividad;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Imagen_Eliminar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_Imagen_Eliminar]
 @ProductoId INT, @ProductoImagenId INT
AS
BEGIN
 SET NOCOUNT ON;
 DELETE dbo.ProductoImagen WHERE ProductoId=@ProductoId AND ProductoImagenId=@ProductoImagenId;
 IF @@ROWCOUNT=0 THROW 51013, 'La imagen no pertenece al producto.', 1;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Imagen_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Ecommerce_Imagen_Guardar]
 @ProductoId INT, @ProductoImagenId INT=NULL, @UrlArchivo NVARCHAR(2048),
 @TextoAlternativo NVARCHAR(250)=NULL, @EsPrincipal BIT=0, @OrdenVisual INT=0
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId)
  THROW 51010, 'El producto no existe.', 1;
 IF NULLIF(LTRIM(RTRIM(@UrlArchivo)),'') IS NULL OR @OrdenVisual<0
  THROW 51011, 'URL u orden de imagen invalidos.', 1;
 BEGIN TRY
 BEGIN TRANSACTION;
 IF @EsPrincipal=1 UPDATE dbo.ProductoImagen SET EsPrincipal=0 WHERE ProductoId=@ProductoId AND EsPrincipal=1;
 IF @ProductoImagenId IS NULL
 BEGIN
  INSERT dbo.ProductoImagen(ProductoId,UrlArchivo,TextoAlternativo,EsPrincipal,OrdenVisual)
  VALUES(@ProductoId,@UrlArchivo,@TextoAlternativo,@EsPrincipal,@OrdenVisual);
  SELECT CAST(SCOPE_IDENTITY() AS INT) ProductoImagenId;
 END
 ELSE
 BEGIN
  UPDATE dbo.ProductoImagen SET UrlArchivo=@UrlArchivo,TextoAlternativo=@TextoAlternativo,
  EsPrincipal=@EsPrincipal,OrdenVisual=@OrdenVisual
  WHERE ProductoImagenId=@ProductoImagenId AND ProductoId=@ProductoId;
  IF @@ROWCOUNT=0 THROW 51012, 'La imagen no pertenece al producto.', 1;
  SELECT @ProductoImagenId ProductoImagenId;
 END;
 COMMIT TRANSACTION;
 END TRY BEGIN CATCH
 IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
 THROW;
 END CATCH;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Producto_Get] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* TEKA - E-commerce etapa 2. Requiere script 06 ejecutado.
   Solo crea/reemplaza procedimientos NUEVOS sp_Ecommerce_*.
   No modifica tablas ni procedimientos de ventas existentes. */
CREATE   PROCEDURE [dbo].[sp_Ecommerce_Producto_Get]
 @ProductoId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId)
  THROW 51000, 'El producto no existe.', 1;
 SELECT p.ProductoId, ISNULL(pub.Publicado,0) Publicado,
        ISNULL(pub.Destacado,0) Destacado, ISNULL(pub.OrdenVisual,0) OrdenVisual,
        pub.DescripcionComercial, ft.AnchoCm, ft.AltoCm, ft.ProfundidadCm,
        disp.DepositoId, disp.CupoOnline, m.UrlGlb, m.UrlUsdz,
        ISNULL(m.EscalaValidada,0) EscalaValidada
 FROM dbo.Producto p
 LEFT JOIN dbo.ProductoPublicacion pub ON pub.ProductoId=p.ProductoId
 LEFT JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId=p.ProductoId
 LEFT JOIN dbo.ProductoDisponibilidadOnline disp ON disp.ProductoId=p.ProductoId
 LEFT JOIN dbo.ProductoModelo3D m ON m.ProductoId=p.ProductoId
 WHERE p.ProductoId=@ProductoId;
 SELECT ProductoImagenId, ProductoId, UrlArchivo, TextoAlternativo, EsPrincipal, OrdenVisual
 FROM dbo.ProductoImagen WHERE ProductoId=@ProductoId ORDER BY OrdenVisual, ProductoImagenId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Ecommerce_Producto_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Ecommerce_Producto_Guardar]
@ProductoId INT, @Publicado BIT, @Destacado BIT, @OrdenVisual INT,
 @DescripcionComercial NVARCHAR(2000)=NULL,
 @AnchoCm DECIMAL(10,2)=NULL, @AltoCm DECIMAL(10,2)=NULL, @ProfundidadCm DECIMAL(10,2)=NULL,
 @DepositoId INT=NULL, @CupoOnline DECIMAL(18,2)=NULL,
 @UrlGlb NVARCHAR(2048)=NULL, @UrlUsdz NVARCHAR(2048)=NULL, @EscalaValidada BIT=0
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId)
  THROW 51001, 'El producto no existe.', 1;
 IF @OrdenVisual<0 OR (@Destacado=1 AND @Publicado=0)
  THROW 51002, 'Publicacion u orden visual invalidos.', 1;
 IF (@AnchoCm IS NULL AND (@AltoCm IS NOT NULL OR @ProfundidadCm IS NOT NULL))
  OR (@AltoCm IS NULL AND (@AnchoCm IS NOT NULL OR @ProfundidadCm IS NOT NULL))
  OR (@ProfundidadCm IS NULL AND (@AnchoCm IS NOT NULL OR @AltoCm IS NOT NULL))
  OR (@AnchoCm IS NOT NULL AND (@AnchoCm<=0 OR @AltoCm<=0 OR @ProfundidadCm<=0))
  THROW 51003, 'Las tres medidas deben ser positivas o estar vacias.', 1;
 IF (@DepositoId IS NULL AND @CupoOnline IS NOT NULL)
  OR (@DepositoId IS NOT NULL AND (@CupoOnline IS NULL OR @CupoOnline<0))
  THROW 51004, 'Deposito y cupo deben informarse juntos y el cupo no puede ser negativo.', 1;
 IF @DepositoId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Deposito WHERE DepositoId=@DepositoId)
  THROW 51005, 'El deposito no existe.', 1;
 IF @EscalaValidada=1 AND @UrlGlb IS NULL AND @UrlUsdz IS NULL
  THROW 51006, 'No se puede validar la escala sin modelo 3D.', 1;

 BEGIN TRY
  BEGIN TRANSACTION;
  DECLARE @DepositoAnterior INT, @ResultadoBloqueo INT, @RecursoFicha NVARCHAR(255), @RecursoStock NVARCHAR(255);
  SET @RecursoFicha=CONCAT('TEKA:ECOMMERCE:PRODUCTO:',@ProductoId);
  /* Serializar cambios de ficha para el mismo producto. El checkout debe
     compartir la coordinacion de bloqueos para garantizar concurrencia. */
  EXEC @ResultadoBloqueo = sys.sp_getapplock
   @Resource = @RecursoFicha,
   @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=15000;
  IF @ResultadoBloqueo<0
   THROW 52101, 'No se pudo bloquear la ficha online del producto.', 1;

  SELECT @DepositoAnterior=DepositoId
  FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK)
  WHERE ProductoId=@ProductoId;
  IF @DepositoAnterior IS NOT NULL
  BEGIN
   SET @RecursoStock=CONCAT('TEKA:STOCK:',@ProductoId,':',@DepositoAnterior);
   EXEC @ResultadoBloqueo = sys.sp_getapplock
    @Resource=@RecursoStock,
    @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=15000;
   IF @ResultadoBloqueo<0
    THROW 52101, 'No se pudo bloquear la disponibilidad del producto.', 1;
  END;


  IF @DepositoId IS NOT NULL AND (@DepositoId<>3 OR @CupoOnline>ISNULL((SELECT CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK) WHERE ProductoId=@ProductoId AND DepositoId=3),0))
   THROW 53660,'Cupo online mayor que stock fisico o deposito invalido.',1;
  IF @Publicado=1
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId AND Activo=1)
    THROW 51007, 'No se puede publicar un producto inactivo.', 1;
   IF NULLIF(LTRIM(RTRIM(@DescripcionComercial)),'') IS NULL OR @AnchoCm IS NULL
      OR @DepositoId IS NULL OR @CupoOnline IS NULL OR @CupoOnline<=0
    THROW 51008, 'Faltan descripción, medidas o cupo online positivo.', 1;
   IF (SELECT COUNT(*) FROM dbo.ProductoImagen WHERE ProductoId=@ProductoId)<>3
      OR (SELECT COUNT(*) FROM dbo.ProductoImagen WHERE ProductoId=@ProductoId AND EsPrincipal=1)<>1
      OR NOT EXISTS(SELECT 1 FROM dbo.PrecioVenta WHERE ProductoId=@ProductoId AND Activo=1 AND Precio>0
        AND FechaVigenciaDesde<=GETDATE() AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta>=GETDATE()))
    THROW 51009, 'Se requieren tres imágenes, una portada y precio vigente.', 1;
  END;

  UPDATE dbo.ProductoPublicacion SET Publicado=@Publicado, Destacado=@Destacado,
   OrdenVisual=@OrdenVisual, DescripcionComercial=@DescripcionComercial,
   FechaActualizacion=SYSUTCDATETIME() WHERE ProductoId=@ProductoId;
  IF @@ROWCOUNT=0 INSERT dbo.ProductoPublicacion(ProductoId,Publicado,Destacado,OrdenVisual,DescripcionComercial)
   VALUES(@ProductoId,@Publicado,@Destacado,@OrdenVisual,@DescripcionComercial);
  IF @AnchoCm IS NULL DELETE dbo.ProductoFichaTecnica WHERE ProductoId=@ProductoId;
  ELSE
  BEGIN
   UPDATE dbo.ProductoFichaTecnica SET AnchoCm=@AnchoCm, AltoCm=@AltoCm,
    ProfundidadCm=@ProfundidadCm, FechaActualizacion=SYSUTCDATETIME() WHERE ProductoId=@ProductoId;
   IF @@ROWCOUNT=0 INSERT dbo.ProductoFichaTecnica(ProductoId,AnchoCm,AltoCm,ProfundidadCm)
    VALUES(@ProductoId,@AnchoCm,@AltoCm,@ProfundidadCm);
  END;
  IF @DepositoId IS NULL DELETE dbo.ProductoDisponibilidadOnline WHERE ProductoId=@ProductoId;
  ELSE
  BEGIN
   UPDATE dbo.ProductoDisponibilidadOnline SET DepositoId=@DepositoId, CupoOnline=@CupoOnline,
    FechaActualizacion=SYSUTCDATETIME() WHERE ProductoId=@ProductoId;
   IF @@ROWCOUNT=0 INSERT dbo.ProductoDisponibilidadOnline(ProductoId,DepositoId,CupoOnline)
    VALUES(@ProductoId,@DepositoId,@CupoOnline);
  END;
  IF @UrlGlb IS NULL AND @UrlUsdz IS NULL DELETE dbo.ProductoModelo3D WHERE ProductoId=@ProductoId;
  ELSE
  BEGIN
   UPDATE dbo.ProductoModelo3D SET UrlGlb=@UrlGlb,UrlUsdz=@UrlUsdz,
    EscalaValidada=@EscalaValidada,FechaActualizacion=SYSUTCDATETIME() WHERE ProductoId=@ProductoId;
   IF @@ROWCOUNT=0 INSERT dbo.ProductoModelo3D(ProductoId,UrlGlb,UrlUsdz,EscalaValidada)
    VALUES(@ProductoId,@UrlGlb,@UrlUsdz,@EscalaValidada);
  END;
  COMMIT TRANSACTION;
 END TRY BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Configurar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Configurar]
 @UmbralGratuidad DECIMAL(18,2),@Activo BIT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @UmbralGratuidad IS NULL OR @UmbralGratuidad<=0 THROW 51009,'Umbral de gratuidad invalido.',1;
 BEGIN TRANSACTION;
 UPDATE dbo.EcommerceBeneficioRecorteConfig WITH(UPDLOCK,HOLDLOCK)
 SET UmbralGratuidad=@UmbralGratuidad,Activo=@Activo,FechaActualizacion=SYSDATETIME()
 WHERE ConfiguracionId=1;
 IF @@ROWCOUNT=0
  INSERT dbo.EcommerceBeneficioRecorteConfig(ConfiguracionId,UmbralGratuidad,Activo)
  VALUES(1,@UmbralGratuidad,@Activo);
 COMMIT;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Cotizar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Calcula el beneficio sin escribir pedidos ni alterar existencias.
   El subtotal informado DEBE provenir de productos ordinarios, con descuentos aplicados,
   sin envio ni recortes. La API/checkout debe recalcularlo en servidor. */
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Cotizar]
 @ProductoRecorteId INT,@SubtotalCatalogoNeto DECIMAL(18,2)
AS
BEGIN
 SET NOCOUNT ON;
 IF @SubtotalCatalogoNeto IS NULL OR @SubtotalCatalogoNeto<0 THROW 51014,'Subtotal invalido.',1;
 SELECT r.ProductoRecorteId,r.ProductoId,r.PrecioSimbolico,c.UmbralGratuidad,
   CAST(CASE WHEN @SubtotalCatalogoNeto>=c.UmbralGratuidad THEN 1 ELSE 0 END AS BIT) AS EsGratuito,
   CAST(CASE WHEN @SubtotalCatalogoNeto>=c.UmbralGratuidad THEN 0 ELSE r.PrecioSimbolico END AS DECIMAL(18,2)) AS PrecioAplicado
 FROM dbo.EcommerceProductoRecorte r CROSS JOIN dbo.EcommerceBeneficioRecorteConfig c
 WHERE r.ProductoRecorteId=@ProductoRecorteId AND r.Activo=1 AND c.ConfiguracionId=1 AND c.Activo=1
  AND EXISTS(SELECT 1 FROM dbo.OrdenProduccion op WHERE op.OrdenProduccionId=r.OrdenProduccionId
    AND op.CantidadProducida>=r.CantidadHabilitada AND op.RecorteProductoSugeridoId IS NOT NULL)
  AND EXISTS(SELECT 1 FROM dbo.StockProducto s WHERE s.ProductoId=r.ProductoId AND s.CantidadActual>=1);
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Desactivar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Evita la promocion de un producto ya habilitado como beneficio y viceversa
   en las rutas de administracion. Las escrituras directas a tablas deben restringirse. */
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Desactivar]
 @ProductoRecorteId INT
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.EcommerceProductoRecorte SET Activo=0 WHERE ProductoRecorteId=@ProductoRecorteId;
 IF @@ROWCOUNT=0 THROW 53103,'Beneficio inexistente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Disponibles] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Disponibles]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.ProductoRecorteId,r.ProductoId,p.Nombre,r.OrdenProduccionId,
 r.PrecioSimbolico,r.CantidadHabilitada,
 r.CantidadHabilitada-ISNULL(us.UnidadesAsignadas,0) AS CupoRestante,
 d.DepositoId,d.CupoOnline,
 ISNULL(s.CantidadActual,0) AS StockLibre
 FROM dbo.EcommerceProductoRecorte r
 JOIN dbo.Producto p ON p.ProductoId=r.ProductoId AND p.Activo=1
 JOIN dbo.OrdenProduccion op ON op.OrdenProduccionId=r.OrdenProduccionId
 JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=op.EstadoOrdenProduccionId
 JOIN dbo.ProductoDisponibilidadOnline d ON d.ProductoId=r.ProductoId AND d.CupoOnline>=1
 LEFT JOIN dbo.StockProducto s ON s.ProductoId=r.ProductoId AND s.DepositoId=d.DepositoId
 OUTER APPLY(SELECT COUNT(*) UnidadesAsignadas FROM dbo.EcommerceBeneficioRecortePedido bp
  JOIN dbo.Pedido pp ON pp.PedidoId=bp.PedidoId JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=pp.EstadoPedidoId
  WHERE bp.ProductoRecorteId=r.ProductoRecorteId AND ep.Nombre NOT IN('Cancelado','Cancelada')) us

 WHERE r.Activo=1 AND op.RecorteProductoSugeridoId IS NOT NULL
 AND e.Nombre IN('Finalizada','Finalizado') AND op.CantidadProducida>=r.CantidadHabilitada
 AND r.CantidadHabilitada>ISNULL(us.UnidadesAsignadas,0)
 AND ISNULL(s.CantidadActual,0)>0
 AND d.CupoOnline>0
 AND EXISTS(SELECT 1 FROM dbo.EcommerceBeneficioRecorteConfig c WHERE c.ConfiguracionId=1 AND c.Activo=1)
 ORDER BY p.Nombre;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_GuardarProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_GuardarProducto]
 @ProductoRecorteId INT=NULL,@OrdenProduccionId INT,@CantidadHabilitada DECIMAL(18,2),
 @PrecioSimbolico DECIMAL(18,2),@Activo BIT=0
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ProductoId INT;
 SELECT @ProductoId=ProductoId FROM dbo.OrdenProduccion
 WHERE OrdenProduccionId=@OrdenProduccionId AND RecorteProductoSugeridoId IS NOT NULL
   AND CantidadProducida>0 AND CantidadProducida>=@CantidadHabilitada
 AND EXISTS(SELECT 1 FROM dbo.EstadoOrdenProduccion e WHERE e.EstadoOrdenProduccionId=dbo.OrdenProduccion.EstadoOrdenProduccionId AND e.Nombre IN('Finalizada','Finalizado'));
 IF @ProductoId IS NULL THROW 51010,'La orden debe provenir de una sugerencia de recorte y tener cantidad producida suficiente.',1;
 IF @CantidadHabilitada IS NULL OR @CantidadHabilitada<=0 OR @PrecioSimbolico IS NULL OR @PrecioSimbolico<=0
  THROW 51011,'Cantidad y precio simbolico deben ser positivos.',1;
 IF EXISTS(SELECT 1 FROM dbo.EcommercePromocionProducto pp JOIN dbo.EcommercePromocion p ON p.PromocionId=pp.PromocionId
  WHERE pp.ProductoId=@ProductoId AND p.Activa=1)
  THROW 51012,'El producto tiene promociones activas; no puede habilitarse como beneficio.',1;
 IF @ProductoRecorteId IS NULL
 BEGIN
  INSERT dbo.EcommerceProductoRecorte(OrdenProduccionId,ProductoId,CantidadHabilitada,PrecioSimbolico,Activo)
  VALUES(@OrdenProduccionId,@ProductoId,@CantidadHabilitada,@PrecioSimbolico,@Activo);
  SET @ProductoRecorteId=CONVERT(INT,SCOPE_IDENTITY());
 END
 ELSE
 BEGIN
  UPDATE dbo.EcommerceProductoRecorte SET CantidadHabilitada=@CantidadHabilitada,PrecioSimbolico=@PrecioSimbolico,Activo=@Activo
  WHERE ProductoRecorteId=@ProductoRecorteId AND OrdenProduccionId=@OrdenProduccionId AND ProductoId=@ProductoId;
  IF @@ROWCOUNT=0 THROW 51013,'Beneficio inexistente o la orden no coincide.',1;
 END;
 SELECT @ProductoRecorteId AS ProductoRecorteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Listar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Listar]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.ProductoRecorteId,r.OrdenProduccionId,r.ProductoId,p.Codigo,p.Nombre,
        r.CantidadHabilitada,r.PrecioSimbolico,r.Activo,r.FechaAlta,
        op.EstadoOrdenProduccionId,op.CantidadProducida,op.RecorteProductoSugeridoId
 FROM dbo.EcommerceProductoRecorte r
 JOIN dbo.Producto p ON p.ProductoId=r.ProductoId
 JOIN dbo.OrdenProduccion op ON op.OrdenProduccionId=r.OrdenProduccionId
 ORDER BY r.FechaAlta DESC,r.ProductoRecorteId DESC;
 SELECT ConfiguracionId,UmbralGratuidad,Activo,FechaActualizacion
 FROM dbo.EcommerceBeneficioRecorteConfig WHERE ConfiguracionId=1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommerceBeneficioRecorte_Reporte] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommerceBeneficioRecorte_Reporte]
 @Desde DATE=NULL,@Hasta DATE=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT bp.PedidoId,p.FechaPedido,p.ClienteId,bp.ProductoRecorteId,r.ProductoId,
 bp.DetallePedidoId,bp.PrecioAplicado,bp.EsGratuito,bp.FechaAsignacion,
 p.EstadoPedidoId
 FROM dbo.EcommerceBeneficioRecortePedido bp
 JOIN dbo.Pedido p ON p.PedidoId=bp.PedidoId
 JOIN dbo.EcommerceProductoRecorte r ON r.ProductoRecorteId=bp.ProductoRecorteId
 WHERE (@Desde IS NULL OR CONVERT(DATE,p.FechaPedido)>=@Desde)
 AND (@Hasta IS NULL OR CONVERT(DATE,p.FechaPedido)<=@Hasta)
 ORDER BY p.FechaPedido DESC,p.PedidoId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_AsignarProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_AsignarProducto]
 @PromocionId INT,@ProductoId INT,@Asignar BIT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.EcommercePromocion WHERE PromocionId=@PromocionId) THROW 51006,'Promocion inexistente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId AND Activo=1) THROW 51007,'Producto inexistente o inactivo.',1;
 IF EXISTS(SELECT 1 FROM dbo.EcommerceProductoRecorte WHERE ProductoId=@ProductoId AND Activo=1)
  THROW 51008,'Un producto habilitado como beneficio de recortes no puede promocionarse.',1;
 IF @Asignar=1
 BEGIN
  IF NOT EXISTS(SELECT 1 FROM dbo.EcommercePromocionProducto WHERE PromocionId=@PromocionId AND ProductoId=@ProductoId)
   INSERT dbo.EcommercePromocionProducto(PromocionId,ProductoId) VALUES(@PromocionId,@ProductoId);
 END
 ELSE DELETE dbo.EcommercePromocionProducto WHERE PromocionId=@PromocionId AND ProductoId=@ProductoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_CotizarCarrito] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_CotizarCarrito]
 @CarritoId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Carrito WHERE CarritoId=@CarritoId) THROW 53102,'Carrito inexistente.',1;
 ;WITH Lineas AS (
  SELECT dc.ProductoId,SUM(dc.Cantidad) Cantidad,pv.Precio PrecioLista
  FROM dbo.DetalleCarrito dc
  CROSS APPLY(SELECT TOP(1) p.Precio FROM dbo.PrecioVenta p WHERE p.ProductoId=dc.ProductoId
    AND p.Activo=1 AND p.FechaVigenciaDesde<=GETDATE()
    AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta>=GETDATE())
    ORDER BY p.FechaVigenciaDesde DESC,p.PrecioVentaId DESC) pv
  WHERE dc.CarritoId=@CarritoId GROUP BY dc.ProductoId,pv.Precio
 ), Descuentos AS (
  SELECT l.ProductoId,MAX(CASE WHEN p.TipoDescuento='PORCENTAJE'
   THEN ROUND(l.PrecioLista*p.ValorDescuento/100.0,2) ELSE p.ValorDescuento END) Descuento
  FROM Lineas l JOIN dbo.EcommercePromocionProducto pp ON pp.ProductoId=l.ProductoId
  JOIN dbo.EcommercePromocion p ON p.PromocionId=pp.PromocionId
  WHERE p.Activa=1 AND SYSDATETIME()>=p.FechaDesde AND SYSDATETIME()<p.FechaHasta
  GROUP BY l.ProductoId
 )
 SELECT l.ProductoId,l.Cantidad,l.PrecioLista,
 CAST(CASE WHEN l.PrecioLista>ISNULL(d.Descuento,0) THEN l.PrecioLista-ISNULL(d.Descuento,0) ELSE 0 END AS DECIMAL(18,2)) PrecioFinal,
 CAST(l.Cantidad*CASE WHEN l.PrecioLista>ISNULL(d.Descuento,0) THEN l.PrecioLista-ISNULL(d.Descuento,0) ELSE 0 END AS DECIMAL(18,2)) SubtotalFinal
 FROM Lineas l LEFT JOIN Descuentos d ON d.ProductoId=l.ProductoId ORDER BY l.ProductoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_Desactivar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_Desactivar]
 @PromocionId INT
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.EcommercePromocion SET Activa=0 WHERE PromocionId=@PromocionId;
 IF @@ROWCOUNT=0 THROW 53101,'Promocion inexistente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* ================================================================
   ADMINISTRACION Y CONSULTA COMERCIAL - SIN DATOS FICTICIOS
   ================================================================ */
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_Guardar]
 @PromocionId INT = NULL,
 @Nombre NVARCHAR(120), @Descripcion NVARCHAR(500) = NULL,
 @TipoDescuento VARCHAR(12), @ValorDescuento DECIMAL(18,2),
 @FechaDesde DATETIME2(0), @FechaHasta DATETIME2(0), @Activa BIT = 0
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),N'') IS NULL THROW 51001,'Nombre obligatorio.',1;
 IF @TipoDescuento NOT IN ('PORCENTAJE','IMPORTE') OR @TipoDescuento IS NULL THROW 51002,'Tipo de descuento invalido.',1;
 IF @ValorDescuento <= 0 OR @ValorDescuento IS NULL OR (@TipoDescuento='PORCENTAJE' AND @ValorDescuento>100) THROW 51003,'Valor de descuento invalido.',1;
 IF @FechaDesde IS NULL OR @FechaHasta IS NULL OR @FechaHasta<=@FechaDesde THROW 51004,'Vigencia invalida.',1;
 IF @PromocionId IS NULL
 BEGIN
  INSERT dbo.EcommercePromocion(Nombre,Descripcion,TipoDescuento,ValorDescuento,FechaDesde,FechaHasta,Activa)
  VALUES(@Nombre,@Descripcion,@TipoDescuento,@ValorDescuento,@FechaDesde,@FechaHasta,@Activa);
  SET @PromocionId=CONVERT(INT,SCOPE_IDENTITY());
 END
 ELSE
 BEGIN
  UPDATE dbo.EcommercePromocion SET Nombre=@Nombre,Descripcion=@Descripcion,TipoDescuento=@TipoDescuento,
   ValorDescuento=@ValorDescuento,FechaDesde=@FechaDesde,FechaHasta=@FechaHasta,Activa=@Activa
  WHERE PromocionId=@PromocionId;
  IF @@ROWCOUNT=0 THROW 51005,'Promocion inexistente.',1;
 END;
 SELECT @PromocionId AS PromocionId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_Listar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Consultas de administración: no alteran precios, stock ni pedidos. */
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_Listar]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.PromocionId,p.Nombre,p.Descripcion,p.TipoDescuento,p.ValorDescuento,
        p.FechaDesde,p.FechaHasta,p.Activa,p.FechaAlta,
        COUNT(pp.ProductoId) AS CantidadProductos
 FROM dbo.EcommercePromocion p
 LEFT JOIN dbo.EcommercePromocionProducto pp ON pp.PromocionId=p.PromocionId
 GROUP BY p.PromocionId,p.Nombre,p.Descripcion,p.TipoDescuento,p.ValorDescuento,
          p.FechaDesde,p.FechaHasta,p.Activa,p.FechaAlta
 ORDER BY p.FechaAlta DESC,p.PromocionId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EcommercePromocion_Productos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_EcommercePromocion_Productos]
 @PromocionId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT pp.PromocionId,p.ProductoId,p.Codigo,p.Nombre,p.Activo
 FROM dbo.EcommercePromocionProducto pp JOIN dbo.Producto p ON p.ProductoId=pp.ProductoId
 WHERE pp.PromocionId=@PromocionId ORDER BY p.Nombre;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoCobro_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


 --EstadoCobroESTADOCOBRO

CREATE PROCEDURE [dbo].[sp_EstadoCobro_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoCobroId,
        Nombre,
        Activo
    FROM dbo.EstadoCobro
    ORDER BY EstadoCobroId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoCobro_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_EstadoCobro_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoCobroId AS Id,
        Nombre AS Descripcion
    FROM dbo.EstadoCobro
    WHERE Activo = 1
    ORDER BY EstadoCobroId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoOportunidadComercial_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Procedimientos de oportunidades comerciales
CREATE   PROCEDURE [dbo].[sp_EstadoOportunidadComercial_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoOportunidadComercialId,
        Nombre,
        Orden,
        EsFinal,
        Activo
    FROM dbo.EstadoOportunidadComercial
    ORDER BY Orden, EstadoOportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoOportunidadComercial_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_EstadoOportunidadComercial_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoOportunidadComercialId AS Id,
        Nombre AS Descripcion,
        Orden,
        EsFinal
    FROM dbo.EstadoOportunidadComercial
    WHERE Activo = 1
    ORDER BY Orden, EstadoOportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoOrdenProduccion_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* =========================================================
   MODULO PRODUCCION
   ========================================================= */


-- EstadoOrdenProduccion

CREATE PROCEDURE [dbo].[sp_EstadoOrdenProduccion_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoOrdenProduccionId,
        Nombre,
        Activo
    FROM dbo.EstadoOrdenProduccion
    ORDER BY EstadoOrdenProduccionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoOrdenProduccion_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_EstadoOrdenProduccion_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoOrdenProduccionId AS Id,
        Nombre AS Descripcion
    FROM dbo.EstadoOrdenProduccion
    WHERE Activo = 1
    ORDER BY EstadoOrdenProduccionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoPedido_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ESTADOPEDIDO

CREATE PROCEDURE [dbo].[sp_EstadoPedido_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoPedidoId,
        Nombre,
        Activo
    FROM dbo.EstadoPedido
    ORDER BY EstadoPedidoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoPedido_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_EstadoPedido_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoPedidoId AS Id,
        Nombre AS Descripcion
    FROM dbo.EstadoPedido
    WHERE Activo = 1
    ORDER BY EstadoPedidoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoRecorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_EstadoRecorte_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoRecorteId,
        Nombre,
        Activo
    FROM dbo.EstadoRecorte
    ORDER BY EstadoRecorteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_EstadoRecorte_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_EstadoRecorte_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        EstadoRecorteId AS Id,
        Nombre AS Descripcion
    FROM dbo.EstadoRecorte
    WHERE Activo = 1
    ORDER BY EstadoRecorteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_HistorialEstadoRecorte_GetByRecorte] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- HistorialEstadoRecorte

CREATE PROCEDURE [dbo].[sp_HistorialEstadoRecorte_GetByRecorte]
    @RecorteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        h.HistorialEstadoRecorteId,
        h.RecorteId,
        h.EstadoRecorteId,
        er.Nombre AS EstadoRecorteNombre,
        h.FechaCambio,
        h.Observaciones
    FROM dbo.HistorialEstadoRecorte h
    INNER JOIN dbo.EstadoRecorte er
        ON h.EstadoRecorteId = er.EstadoRecorteId
    WHERE h.RecorteId = @RecorteId
    ORDER BY h.FechaCambio DESC, h.HistorialEstadoRecorteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_HistorialEstadoRecorte_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* El cambio de estado generico conserva el historial, pero Reserva y el
   consumo productivo dejan de ser transiciones manuales. */
CREATE   PROCEDURE [dbo].[sp_HistorialEstadoRecorte_Registrar]
    @RecorteId       INT,
    @EstadoRecorteId INT,
    @Observaciones   VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoDestino VARCHAR(50), @EstadoActual VARCHAR(50);
    DECLARE @LockResult INT,
            @Resource NVARCHAR(255) = CONCAT('TEKA:RECORTE:', @RecorteId, ':ESTADO');

    BEGIN TRY
        BEGIN TRAN;

        EXEC @LockResult = sys.sp_getapplock
            @Resource = @Resource,
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 15000;
        IF @LockResult < 0
            THROW 62010, 'No se pudo bloquear el estado del recorte.', 1;

        SELECT @EstadoDestino = e.Nombre
        FROM dbo.EstadoRecorte e WITH (UPDLOCK, HOLDLOCK)
        WHERE e.EstadoRecorteId = @EstadoRecorteId
          AND e.Activo = 1;

        SELECT @EstadoActual = e.Nombre
        FROM dbo.Recorte r WITH (UPDLOCK, HOLDLOCK)
        JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId = r.EstadoRecorteId
        WHERE r.RecorteId = @RecorteId;

        IF @EstadoActual IS NULL
            THROW 62011, 'Recorte inexistente.', 1;
        IF @EstadoDestino IS NULL
            THROW 62012, 'El estado de recorte indicado no existe o no esta activo.', 1;
        IF UPPER(LTRIM(RTRIM(@EstadoDestino))) IN ('RESERVADO', 'COMPROMETIDO')
            THROW 62013, 'Los recortes no se reservan; permanecen disponibles hasta iniciar produccion.', 1;
        IF UPPER(LTRIM(RTRIM(@EstadoDestino))) = 'UTILIZADO'
            THROW 62014, 'Utilizado solo puede asignarse mediante el consumo integral de Produccion.', 1;
        IF UPPER(LTRIM(RTRIM(@EstadoActual))) = 'UTILIZADO'
            THROW 62015, 'Un recorte utilizado no puede volver a un estado operativo.', 1;

        INSERT dbo.HistorialEstadoRecorte
            (RecorteId, EstadoRecorteId, FechaCambio, Observaciones)
        VALUES
            (@RecorteId, @EstadoRecorteId, GETDATE(), @Observaciones);

        UPDATE dbo.Recorte
        SET EstadoRecorteId = @EstadoRecorteId
        WHERE RecorteId = @RecorteId;

        SELECT SCOPE_IDENTITY() AS HistorialEstadoRecorteId;
        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Insumo_Activar]
    @InsumoId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Insumo
    SET
        Activo = 1,
        MotivoInactivacionId = NULL,
        ObservacionInactivacion = NULL,
        FechaInactivacion = NULL
    WHERE InsumoId = @InsumoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Insumo_Delete]
    @InsumoId                  INT,
    @MotivoInactivacionId      INT,
    @ObservacionInactivacion   VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Insumo
    SET
        Activo = 0,
        MotivoInactivacionId = @MotivoInactivacionId,
        ObservacionInactivacion = @ObservacionInactivacion,
        FechaInactivacion = GETDATE()
    WHERE InsumoId = @InsumoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Insumo_GetAll]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT i.InsumoId,i.Codigo,i.Nombre,i.Descripcion,i.TipoInsumoId,
  ti.Nombre AS TipoInsumoNombre,i.ColorId,c.Nombre AS ColorNombre,c.CodigoHex,
  i.UnidadMedidaId,um.Nombre AS UnidadMedidaNombre,um.Abreviatura AS UnidadMedidaAbreviatura,
  i.StockMinimo,i.Activo,i.FechaAlta,i.MotivoInactivacionId,
  mi.Nombre AS MotivoInactivacionNombre,i.ObservacionInactivacion,i.FechaInactivacion,
  i.NombreInsumoId,n.Nombre AS NombreCatalogo
 FROM dbo.Insumo i
 INNER JOIN dbo.TipoInsumo ti ON i.TipoInsumoId=ti.TipoInsumoId
 INNER JOIN dbo.UnidadMedida um ON i.UnidadMedidaId=um.UnidadMedidaId
 LEFT JOIN dbo.Color c ON i.ColorId=c.ColorId
 LEFT JOIN dbo.MotivoInactivacion mi ON i.MotivoInactivacionId=mi.MotivoInactivacionId
 LEFT JOIN dbo.NombreInsumoCatalogo n ON i.NombreInsumoId=n.NombreInsumoId
 ORDER BY i.Nombre,i.InsumoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Insumo_GetById] @InsumoId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT i.InsumoId,i.Codigo,i.Nombre,i.Descripcion,i.TipoInsumoId,
  ti.Nombre AS TipoInsumoNombre,i.ColorId,c.Nombre AS ColorNombre,c.CodigoHex,
  i.UnidadMedidaId,um.Nombre AS UnidadMedidaNombre,um.Abreviatura AS UnidadMedidaAbreviatura,
  i.StockMinimo,i.Activo,i.FechaAlta,i.MotivoInactivacionId,
  mi.Nombre AS MotivoInactivacionNombre,i.ObservacionInactivacion,i.FechaInactivacion,
  i.NombreInsumoId,n.Nombre AS NombreCatalogo
 FROM dbo.Insumo i
 INNER JOIN dbo.TipoInsumo ti ON i.TipoInsumoId=ti.TipoInsumoId
 INNER JOIN dbo.UnidadMedida um ON i.UnidadMedidaId=um.UnidadMedidaId
 LEFT JOIN dbo.Color c ON i.ColorId=c.ColorId
 LEFT JOIN dbo.MotivoInactivacion mi ON i.MotivoInactivacionId=mi.MotivoInactivacionId
 LEFT JOIN dbo.NombreInsumoCatalogo n ON i.NombreInsumoId=n.NombreInsumoId
 WHERE i.InsumoId=@InsumoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Insumo_Insert]
 @Nombre VARCHAR(120), @Descripcion VARCHAR(500)=NULL,
 @TipoInsumoId INT, @ColorId INT=NULL, @UnidadMedidaId INT,
 @StockMinimo DECIMAL(18,2), @NombreInsumoId INT=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @StockMinimo IS NULL OR @StockMinimo < 0 THROW 51231,'Stock minimo invalido.',1;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL THROW 51232,'Nombre obligatorio.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.TipoInsumo WHERE TipoInsumoId=@TipoInsumoId AND Activo=1)
   THROW 51233,'Tipo de insumo inexistente o inactivo.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.UnidadMedida WHERE UnidadMedidaId=@UnidadMedidaId)
   THROW 51234,'Unidad de medida inexistente.',1;
 IF @ColorId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Color WHERE ColorId=@ColorId)
   THROW 51235,'Color inexistente.',1;
 IF @NombreInsumoId IS NOT NULL
 BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.NombreInsumoCatalogo
     WHERE NombreInsumoId=@NombreInsumoId AND TipoInsumoId=@TipoInsumoId AND Activo=1)
      THROW 51236,'Nombre del catalogo no pertenece al tipo o esta inactivo.',1;
   IF EXISTS(SELECT 1 FROM dbo.Insumo WITH (UPDLOCK,HOLDLOCK)
      WHERE NombreInsumoId=@NombreInsumoId
        AND (ColorId=@ColorId OR (ColorId IS NULL AND @ColorId IS NULL)))
      THROW 51237,'Ya existe un insumo con ese nombre y color.',1;
 END;
 BEGIN TRY
  BEGIN TRANSACTION;
  INSERT dbo.Insumo(Codigo,Nombre,Descripcion,TipoInsumoId,ColorId,UnidadMedidaId,
    StockMinimo,Activo,FechaAlta,MotivoInactivacionId,ObservacionInactivacion,FechaInactivacion,NombreInsumoId)
  VALUES(CONCAT('TMP-I-',RIGHT(REPLACE(CONVERT(VARCHAR(36),NEWID()),'-',''),20)),
    @Nombre,@Descripcion,@TipoInsumoId,@ColorId,@UnidadMedidaId,@StockMinimo,1,GETDATE(),NULL,NULL,NULL,@NombreInsumoId);
  DECLARE @InsumoId INT=CONVERT(INT,SCOPE_IDENTITY());
  UPDATE dbo.Insumo SET Codigo=CONCAT('INS-',RIGHT('0000'+CAST(@InsumoId AS VARCHAR(10)),4)) WHERE InsumoId=@InsumoId;
  COMMIT TRANSACTION;
  SELECT @InsumoId AS InsumoId;
 END TRY
 BEGIN CATCH
  IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Insumo_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Insumo_Update]
 @InsumoId INT,@Nombre VARCHAR(120),@Descripcion VARCHAR(500)=NULL,
 @TipoInsumoId INT,@ColorId INT=NULL,@UnidadMedidaId INT,
 @StockMinimo DECIMAL(18,2),@NombreInsumoId INT=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Insumo WHERE InsumoId=@InsumoId) THROW 51238,'Insumo inexistente.',1;
 IF @StockMinimo IS NULL OR @StockMinimo<0 THROW 51231,'Stock minimo invalido.',1;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL THROW 51232,'Nombre obligatorio.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.TipoInsumo WHERE TipoInsumoId=@TipoInsumoId)
   THROW 51233,'Tipo de insumo inexistente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.UnidadMedida WHERE UnidadMedidaId=@UnidadMedidaId)
   THROW 51234,'Unidad de medida inexistente.',1;
 IF @ColorId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Color WHERE ColorId=@ColorId)
   THROW 51235,'Color inexistente.',1;
 /* Para llamadas antiguas que no incluyen el nuevo parametro, conservar asociacion
    solo si coincide el tipo y nombre historico; de otro modo desvincular sin inventar. */
 IF @NombreInsumoId IS NULL
 SELECT @NombreInsumoId=NombreInsumoId FROM dbo.Insumo
 WHERE InsumoId=@InsumoId AND TipoInsumoId=@TipoInsumoId AND Nombre=@Nombre;
 IF @NombreInsumoId IS NOT NULL
 BEGIN
  IF NOT EXISTS(SELECT 1 FROM dbo.NombreInsumoCatalogo
     WHERE NombreInsumoId=@NombreInsumoId AND TipoInsumoId=@TipoInsumoId)
    THROW 51236,'Nombre del catalogo no pertenece al tipo.',1;
  IF EXISTS(SELECT 1 FROM dbo.Insumo WITH (UPDLOCK,HOLDLOCK)
     WHERE InsumoId<>@InsumoId AND NombreInsumoId=@NombreInsumoId
       AND (ColorId=@ColorId OR (ColorId IS NULL AND @ColorId IS NULL)))
    THROW 51237,'Ya existe un insumo con ese nombre y color.',1;
 END;
 UPDATE dbo.Insumo SET Nombre=@Nombre,Descripcion=@Descripcion,
  TipoInsumoId=@TipoInsumoId,ColorId=@ColorId,UnidadMedidaId=@UnidadMedidaId,
  StockMinimo=@StockMinimo,NombreInsumoId=@NombreInsumoId
 WHERE InsumoId=@InsumoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_Calificar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_InteresComercial_Calificar]
 @InteresComercialId INT,@UsuarioResponsableId INT=NULL,@Interes VARCHAR(150)=NULL,@ProximaAccion VARCHAR(250)=NULL,@FechaProximaAccion DATE=NULL,@Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Nueva INT,@Convertido INT,@Id INT,@ClienteId INT,@Nombre VARCHAR(100),@Apellido VARCHAR(100),@Canal INT,@Monto DECIMAL(18,2),@Tipo VARCHAR(20)='particular';
 SELECT @Nueva=EstadoOportunidadComercialId FROM dbo.EstadoOportunidadComercial WHERE Nombre='Nueva';
 SELECT @Convertido=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='Convertido';
 SELECT @ClienteId=ClienteId,@Nombre=ClienteNombre,@Apellido=ClienteApellido,@Canal=CanalVentaId,@Monto=MontoPotencial,@UsuarioResponsableId=ISNULL(@UsuarioResponsableId,UsuarioResponsableId),@Interes=ISNULL(@Interes,LEFT(Descripcion,150))
 FROM dbo.InteresComercial WHERE InteresComercialId=@InteresComercialId AND OportunidadComercialId IS NULL AND Activo=1;
 IF @Canal IS NULL BEGIN RAISERROR('El interés no existe o ya fue convertido.',16,1); RETURN; END;
 IF @Nombre IS NULL AND @ClienteId IS NOT NULL SELECT @Nombre=Nombre,@Apellido=Apellido FROM dbo.Cliente WHERE ClienteId=@ClienteId;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL BEGIN RAISERROR('Debe identificarse el nombre del prospecto antes de calificar.',16,1); RETURN; END;
 BEGIN TRAN;
 INSERT dbo.OportunidadComercial(ClienteId,ClienteNombre,ClienteApellido,TipoCliente,CanalVentaId,Interes,EstadoOportunidadComercialId,MontoEstimado,Probabilidad,FechaAlta,ProximaAccion,FechaProximaAccion,Observaciones,Activo,UsuarioResponsableId,InteresComercialId)
 VALUES(@ClienteId,@Nombre,@Apellido,@Tipo,@Canal,@Interes,@Nueva,@Monto,10,GETDATE(),@ProximaAccion,@FechaProximaAccion,@Observaciones,1,@UsuarioResponsableId,@InteresComercialId);
 SET @Id=SCOPE_IDENTITY();
 INSERT dbo.HistorialEstadoOportunidad(OportunidadComercialId,EstadoOportunidadComercialId,Observaciones) VALUES(@Id,@Nueva,'Oportunidad creada desde interés comercial');
 UPDATE dbo.InteresComercial SET EstadoInteresComercialId=@Convertido,OportunidadComercialId=@Id,FechaCierre=GETDATE(),FechaUltimaActividad=GETDATE(),Activo=0 WHERE InteresComercialId=@InteresComercialId;
 COMMIT; SELECT @Id OportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_Descartar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_InteresComercial_Descartar] @InteresComercialId INT,@Motivo VARCHAR(250)
AS
BEGIN
 SET NOCOUNT ON; DECLARE @Estado INT; SELECT @Estado=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='Descartado';
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL BEGIN RAISERROR('Debe indicar el motivo de descarte.',16,1); RETURN; END;
 UPDATE dbo.InteresComercial SET EstadoInteresComercialId=@Estado,MotivoDescarte=@Motivo,FechaCierre=GETDATE(),FechaUltimaActividad=GETDATE(),Activo=0
 WHERE InteresComercialId=@InteresComercialId AND OportunidadComercialId IS NULL AND Activo=1;
 IF @@ROWCOUNT=0 RAISERROR('El interés no existe o ya fue cerrado.',16,1);
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_InteresComercial_GetAll]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT i.InteresComercialId, i.ClienteId, i.ClienteNombre, i.ClienteApellido, i.Telefono, i.Email,
           i.CanalVentaId, cv.Nombre CanalVentaNombre, i.EstadoInteresComercialId, e.Nombre EstadoNombre,
           i.TipoOrigen, i.ReferenciaOrigen, i.CarritoId, i.Descripcion, i.MontoPotencial,
           i.MotivoConsultaId, mc.Nombre MotivoConsultaNombre, i.ProductoConsultadoId, i.TipoPendiente,
           i.UsuarioResponsableId, CASE WHEN u.UsuarioId IS NULL THEN NULL ELSE CONCAT(u.Nombre, ' ', ISNULL(u.Apellido, '')) END ResponsableNombre,
           i.OportunidadComercialId, i.FechaAlta, i.FechaUltimaActividad, i.FechaAtencion, i.FechaCierre, i.MotivoDescarte, i.Activo
    FROM dbo.InteresComercial i
    JOIN dbo.CanalVenta cv ON cv.CanalVentaId = i.CanalVentaId
    JOIN dbo.EstadoInteresComercial e ON e.EstadoInteresComercialId = i.EstadoInteresComercialId
    LEFT JOIN dbo.MotivoConsultaComercial mc ON mc.MotivoConsultaId = i.MotivoConsultaId
    LEFT JOIN dbo.Usuario u ON u.UsuarioId = i.UsuarioResponsableId
    ORDER BY e.EsFinal, i.FechaAlta DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_InteresComercial_Insert]
 @ClienteId INT=NULL,@ClienteNombre VARCHAR(100)=NULL,@ClienteApellido VARCHAR(100)=NULL,@Telefono VARCHAR(30)=NULL,@Email VARCHAR(150)=NULL,
 @CanalVentaId INT,@TipoOrigen VARCHAR(30),@ReferenciaOrigen VARCHAR(150)=NULL,@Descripcion VARCHAR(500),@MontoPotencial DECIMAL(18,2)=0,@UsuarioResponsableId INT=NULL,@MotivoConsultaId INT=NULL
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Estado INT; SELECT @Estado=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='Pendiente';
 IF @Estado IS NULL BEGIN RAISERROR('No existe el estado Pendiente.',16,1); RETURN; END;
 IF @TipoOrigen NOT IN('Local','WhatsApp','Instagram','E-commerce','Manual') BEGIN RAISERROR('Tipo de origen inválido.',16,1); RETURN; END;
 IF @MontoPotencial<0 BEGIN RAISERROR('El monto potencial no puede ser negativo.',16,1); RETURN; END;
 IF NOT EXISTS(SELECT 1 FROM dbo.CanalVenta WHERE CanalVentaId=@CanalVentaId AND Activo=1) BEGIN RAISERROR('Canal inválido.',16,1); RETURN; END;
 IF @MotivoConsultaId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.MotivoConsultaComercial WHERE MotivoConsultaId=@MotivoConsultaId AND Activo=1) THROW 51001, 'Motivo de consulta inexistente o inactivo.', 1;
 INSERT dbo.InteresComercial(ClienteId,ClienteNombre,ClienteApellido,Telefono,Email,CanalVentaId,EstadoInteresComercialId,TipoOrigen,ReferenciaOrigen,Descripcion,MontoPotencial,UsuarioResponsableId,MotivoConsultaId)
 VALUES(@ClienteId,@ClienteNombre,@ClienteApellido,@Telefono,@Email,@CanalVentaId,@Estado,@TipoOrigen,@ReferenciaOrigen,@Descripcion,@MontoPotencial,@UsuarioResponsableId,@MotivoConsultaId);
 SELECT CAST(SCOPE_IDENTITY() AS INT) InteresComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_RegistrarConsultaPublica] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_InteresComercial_RegistrarConsultaPublica]
    @SolicitudId UNIQUEIDENTIFIER,
    @Nombre VARCHAR(100),
    @Apellido VARCHAR(100) = NULL,
    @Telefono VARCHAR(30) = NULL,
    @Email VARCHAR(150) = NULL,
    @Mensaje VARCHAR(500),
    @ProductoId INT = NULL,
    @MotivoConsultaId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @Nombre = NULLIF(LTRIM(RTRIM(@Nombre)), '');
    SET @Apellido = NULLIF(LTRIM(RTRIM(@Apellido)), '');
    SET @Telefono = NULLIF(LTRIM(RTRIM(@Telefono)), '');
    SET @Email = LOWER(NULLIF(LTRIM(RTRIM(@Email)), ''));
    SET @Mensaje = NULLIF(LTRIM(RTRIM(@Mensaje)), '');

    IF @SolicitudId IS NULL OR @SolicitudId = '00000000-0000-0000-0000-000000000000' THROW 51001, 'SolicitudId es obligatorio.', 1;
    IF @Nombre IS NULL OR LEN(@Nombre) < 2 THROW 51001, 'El nombre es obligatorio.', 1;
    IF @Mensaje IS NULL OR LEN(@Mensaje) < 5 THROW 51001, 'El mensaje debe tener al menos 5 caracteres.', 1;
    IF @Email IS NULL AND @Telefono IS NULL THROW 51001, 'Debe indicar al menos un correo o teléfono.', 1;
    IF @Email IS NOT NULL AND @Email NOT LIKE '%_@_%._%' THROW 51001, 'El correo no tiene un formato válido.', 1;
    IF @Telefono IS NOT NULL AND LEN(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(@Telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')) < 6
        THROW 51001, 'El teléfono no tiene un formato válido.', 1;
    IF @ProductoId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId = @ProductoId AND Activo = 1)
        THROW 51001, 'El producto consultado no existe o está inactivo.', 1;
    IF @MotivoConsultaId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.MotivoConsultaComercial WHERE MotivoConsultaId = @MotivoConsultaId AND Activo = 1)
        THROW 51001, 'El motivo de consulta no existe o está inactivo.', 1;

    DECLARE @EstadoId INT, @CanalId INT, @ClienteId INT = NULL, @Coincidencias INT, @InteresId INT;
    SELECT @EstadoId = EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre = 'Pendiente' AND Activo = 1;
    SELECT TOP(1) @CanalId = CanalVentaId FROM dbo.CanalVenta WHERE Nombre IN ('E-commerce', 'Ecommerce') AND Activo = 1 ORDER BY CanalVentaId;
    IF @EstadoId IS NULL OR @CanalId IS NULL THROW 51001, 'Falta configurar el estado Pendiente o el canal E-commerce.', 1;

    BEGIN TRANSACTION;
    SELECT @InteresId = InteresComercialId
    FROM dbo.InteresComercial WITH(UPDLOCK, HOLDLOCK)
    WHERE SolicitudPublicaId = @SolicitudId;
    IF @InteresId IS NOT NULL
    BEGIN
        COMMIT TRANSACTION;
        SELECT @InteresId InteresComercialId, CAST(1 AS BIT) Duplicada;
        RETURN;
    END;

    DECLARE @Candidatos TABLE(ClienteId INT PRIMARY KEY);
    INSERT @Candidatos(ClienteId)
    SELECT ClienteId
    FROM dbo.Cliente
    WHERE Activo = 1 AND
       ((@Email IS NOT NULL AND LOWER(LTRIM(RTRIM(Email))) = @Email) OR
        (@Telefono IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LTRIM(RTRIM(Telefono)), ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') =
                              REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(@Telefono, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')));
    SELECT @Coincidencias = COUNT(*), @ClienteId = MIN(ClienteId) FROM @Candidatos;
    IF @Coincidencias <> 1 SET @ClienteId = NULL;

    INSERT dbo.InteresComercial
        (ClienteId, ClienteNombre, ClienteApellido, Telefono, Email, CanalVentaId, EstadoInteresComercialId,
         TipoOrigen, ReferenciaOrigen, Descripcion, MontoPotencial, MotivoConsultaId, TipoPendiente,
         ProductoConsultadoId, SolicitudPublicaId)
    VALUES
        (@ClienteId, @Nombre, @Apellido, @Telefono, @Email, @CanalId, @EstadoId,
         'E-commerce', CASE WHEN @ProductoId IS NULL THEN 'Consulta web' ELSE CONCAT('Producto ', @ProductoId) END,
         @Mensaje, 0, @MotivoConsultaId, 'Consulta', @ProductoId, @SolicitudId);
    SET @InteresId = CONVERT(INT, SCOPE_IDENTITY());
    COMMIT TRANSACTION;

    SELECT @InteresId InteresComercialId, CAST(0 AS BIT) Duplicada;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_Tomar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_InteresComercial_Tomar] @InteresComercialId INT,@UsuarioResponsableId INT
AS
BEGIN
 SET NOCOUNT ON; DECLARE @Estado INT; SELECT @Estado=EstadoInteresComercialId FROM dbo.EstadoInteresComercial WHERE Nombre='En atención';
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioResponsableId AND Activo=1) BEGIN RAISERROR('Usuario responsable inválido.',16,1); RETURN; END;
 UPDATE dbo.InteresComercial SET UsuarioResponsableId=@UsuarioResponsableId,EstadoInteresComercialId=@Estado,FechaAtencion=ISNULL(FechaAtencion,GETDATE()),FechaUltimaActividad=GETDATE()
 WHERE InteresComercialId=@InteresComercialId AND Activo=1 AND OportunidadComercialId IS NULL;
 IF @@ROWCOUNT=0 RAISERROR('El interés no existe o ya fue cerrado.',16,1);
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_InteresComercial_VincularCliente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- TEKA | Comercial | Vincular cliente a pendiente existente
-- Ejecutar en la base TEKA, después de verificar el backup.
CREATE   PROCEDURE [dbo].[sp_InteresComercial_VincularCliente]
    @InteresComercialId INT,
    @ClienteId INT,
    @UsuarioResponsableId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId AND Activo=1)
        THROW 51001, 'El cliente seleccionado no existe o está inactivo.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioResponsableId AND Activo=1)
        THROW 51002, 'El usuario responsable no está activo.', 1;
    BEGIN TRANSACTION;
    UPDATE dbo.InteresComercial WITH (UPDLOCK, ROWLOCK)
       SET ClienteId=@ClienteId, FechaUltimaActividad=GETDATE()
     WHERE InteresComercialId=@InteresComercialId
       AND Activo=1 AND FechaCierre IS NULL AND OportunidadComercialId IS NULL
       AND UsuarioResponsableId=@UsuarioResponsableId
       AND (ClienteId IS NULL OR ClienteId=@ClienteId);
    IF @@ROWCOUNT<>1
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51003, 'El pendiente está cerrado, pertenece a otro responsable o ya tiene otro cliente.', 1;
    END;
    COMMIT TRANSACTION;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Inventario_ConfirmarRecuento] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Confirmacion: compara el saldo ACTUAL con el capturado para CADA linea.
   Si hubo cualquier cambio, se rechaza TODO el recuento y se requiere una nueva captura.
   Esta politica evita sobrescribir movimientos concurrentes y mantiene atomicidad.
*/
CREATE   PROCEDURE [dbo].[sp_Inventario_ConfirmarRecuento]
 @RecuentoId BIGINT,
 @UsuarioResponsable NVARCHAR(128)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @RecuentoId IS NULL OR NULLIF(LTRIM(RTRIM(@UsuarioResponsable)),N'') IS NULL
  THROW 53720,'Recuento y usuario responsable obligatorios.',1;
 DECLARE @Operacion UNIQUEIDENTIFIER,@Estado VARCHAR(12),@Json NVARCHAR(MAX),@LockResult INT,
  @Fila INT=1,@Max INT,@Clase VARCHAR(8),@Articulo INT,@Deposito INT,
  @Anterior DECIMAL(18,2),@Actual DECIMAL(18,2),@Recurso NVARCHAR(255);
 DECLARE @L TABLE(Fila INT IDENTITY PRIMARY KEY,Clase VARCHAR(8),ArticuloId INT,DepositoId INT,
  CantidadSistema DECIMAL(18,2),Diferencia DECIMAL(18,2));
 BEGIN TRY
  BEGIN TRAN;
  EXEC @LockResult=sys.sp_getapplock @Resource=N'TEKA:INVENTARIO:RECUENTO',
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53721,'No se pudo bloquear confirmacion.',1;
  SELECT @Operacion=OperacionId,@Estado=Estado FROM dbo.InventarioRecuento WITH(UPDLOCK,HOLDLOCK)
   WHERE RecuentoId=@RecuentoId;
  IF @Estado IS NULL THROW 53722,'Recuento inexistente.',1;
  IF @Estado='CONFIRMADO'
  BEGIN SELECT RecuentoId,Estado FROM dbo.InventarioRecuento WHERE RecuentoId=@RecuentoId; COMMIT; RETURN; END;
  INSERT @L(Clase,ArticuloId,DepositoId,CantidadSistema,Diferencia)
  SELECT Clase,ArticuloId,DepositoId,CantidadSistema,Diferencia FROM dbo.InventarioRecuentoDetalle
   WHERE RecuentoId=@RecuentoId ORDER BY Clase,ArticuloId,DepositoId;
  SET @Max=(SELECT COUNT(*) FROM @L);
  IF @Max=0 THROW 53723,'Recuento sin detalle.',1;
  WHILE @Fila<=@Max
  BEGIN
   SELECT @Clase=Clase,@Articulo=ArticuloId,@Deposito=DepositoId,@Anterior=CantidadSistema FROM @L WHERE Fila=@Fila;
   SET @Recurso=CASE WHEN @Clase='PRODUCTO' THEN CONCAT(N'TEKA:STOCK:',@Articulo,N':',@Deposito)
    ELSE CONCAT(N'TEKA:STOCK:INSUMO:',@Articulo,N':',@Deposito) END;
   EXEC @LockResult=sys.sp_getapplock @Resource=@Recurso,
    @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
   IF @LockResult<0 THROW 53724,'No se pudo bloquear articulo durante confirmacion.',1;
   SET @Actual=NULL;
   IF @Clase='PRODUCTO' SELECT @Actual=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
    WHERE ProductoId=@Articulo AND DepositoId=@Deposito;
   ELSE SELECT @Actual=CantidadActual FROM dbo.StockInsumo WITH(UPDLOCK,HOLDLOCK)
    WHERE InsumoId=@Articulo AND DepositoId=@Deposito;
   IF ISNULL(@Actual,0)<>@Anterior
    THROW 53725,'El stock cambio desde la captura. Generar nuevo recuento para no pisar movimientos.',1;
   SET @Fila+=1;
  END;
  SELECT @Json=(SELECT Clase AS clase,ArticuloId AS articuloId,DepositoId AS depositoId,
   CASE WHEN Diferencia>0 THEN 1 ELSE -1 END AS signo,
   ABS(Diferencia) AS cantidad FROM @L WHERE Diferencia<>0 ORDER BY Clase,ArticuloId FOR JSON PATH);
  IF @Json<>N'[]'
   EXEC dbo.sp_Inventario_RegistrarAjustesMultiples @OperacionId=@Operacion,
    @UsuarioResponsable=@UsuarioResponsable,@Motivo='Recuento fisico confirmado',@LineasJson=@Json;
  UPDATE dbo.InventarioRecuento SET Estado='CONFIRMADO',FechaConfirmacion=SYSUTCDATETIME() WHERE RecuentoId=@RecuentoId;
  COMMIT;
  SELECT RecuentoId,Estado,FechaConfirmacion FROM dbo.InventarioRecuento WHERE RecuentoId=@RecuentoId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Inventario_CrearRecuento] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Captura de recuento: recibe cantidades observadas y toma una fotografia
   del saldo por articulo al momento de la captura. No cambia existencias.
*/
CREATE   PROCEDURE [dbo].[sp_Inventario_CrearRecuento]
 @OperacionId UNIQUEIDENTIFIER,
 @UsuarioResponsable NVARCHAR(128),
 @Motivo VARCHAR(250),
 @LineasJson NVARCHAR(MAX)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @OperacionId IS NULL OR NULLIF(LTRIM(RTRIM(@UsuarioResponsable)),N'') IS NULL
  OR NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL THROW 53710,'Operacion, usuario y motivo obligatorios.',1;
 IF ISNULL(ISJSON(@LineasJson),0)<>1 OR LEFT(LTRIM(@LineasJson),1)<>N'['
  THROW 53711,'Se requiere arreglo JSON de recuento.',1;
 DECLARE @L TABLE(Fila INT IDENTITY PRIMARY KEY,Clase VARCHAR(8),ArticuloId INT,DepositoId INT,Cantidad DECIMAL(18,2));
 INSERT @L(Clase,ArticuloId,DepositoId,Cantidad)
 SELECT UPPER(Clase),ArticuloId,DepositoId,Cantidad
 FROM OPENJSON(@LineasJson) WITH(Clase VARCHAR(8) '$.clase',ArticuloId INT '$.articuloId',
  DepositoId INT '$.depositoId',Cantidad DECIMAL(18,2) '$.cantidad');
 IF NOT EXISTS(SELECT 1 FROM @L) OR EXISTS(SELECT 1 FROM @L WHERE Clase IS NULL OR Clase NOT IN('PRODUCTO','INSUMO')
  OR ArticuloId IS NULL OR DepositoId IS NULL OR Cantidad IS NULL OR Cantidad<0
  OR (Clase='PRODUCTO' AND DepositoId<>3) OR (Clase='INSUMO' AND DepositoId<>2))
  THROW 53712,'Lineas de recuento invalidas.',1;
 IF EXISTS(SELECT 1 FROM @L GROUP BY Clase,ArticuloId,DepositoId HAVING COUNT(*)>1)
  THROW 53713,'Articulos repetidos en recuento.',1;
 IF EXISTS(SELECT 1 FROM @L l WHERE (l.Clase='PRODUCTO' AND NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=l.ArticuloId))
  OR (l.Clase='INSUMO' AND NOT EXISTS(SELECT 1 FROM dbo.Insumo WHERE InsumoId=l.ArticuloId)))
  THROW 53714,'Articulo inexistente.',1;
 DECLARE @LockResult INT,@Recurso NVARCHAR(255),@Fila INT=1,@Max INT=(SELECT COUNT(*) FROM @L),
  @Clase VARCHAR(8),@Articulo INT,@Deposito INT,@Contada DECIMAL(18,2),@Sistema DECIMAL(18,2),@RecuentoId BIGINT;
 BEGIN TRY
  BEGIN TRAN;
  EXEC @LockResult=sys.sp_getapplock @Resource=N'TEKA:INVENTARIO:RECUENTO',
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53715,'No se pudo bloquear la captura.',1;
  IF EXISTS(SELECT 1 FROM dbo.InventarioRecuento WITH(UPDLOCK,HOLDLOCK) WHERE OperacionId=@OperacionId)
  BEGIN
   SELECT RecuentoId,OperacionId,Estado FROM dbo.InventarioRecuento WHERE OperacionId=@OperacionId;
   COMMIT; RETURN;
  END;
  INSERT dbo.InventarioRecuento(OperacionId,UsuarioResponsable,Motivo) VALUES(@OperacionId,@UsuarioResponsable,@Motivo);
  SET @RecuentoId=SCOPE_IDENTITY();
  WHILE @Fila<=@Max
  BEGIN
   SELECT @Clase=Clase,@Articulo=ArticuloId,@Deposito=DepositoId,@Contada=Cantidad FROM @L WHERE Fila=@Fila;
   SET @Recurso=CASE WHEN @Clase='PRODUCTO' THEN CONCAT(N'TEKA:STOCK:',@Articulo,N':',@Deposito)
    ELSE CONCAT(N'TEKA:STOCK:INSUMO:',@Articulo,N':',@Deposito) END;
   EXEC @LockResult=sys.sp_getapplock @Resource=@Recurso,
    @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
   IF @LockResult<0 THROW 53716,'No se pudo bloquear articulo durante captura.',1;
   SET @Sistema=NULL;
   IF @Clase='PRODUCTO' SELECT @Sistema=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
    WHERE ProductoId=@Articulo AND DepositoId=@Deposito;
   ELSE SELECT @Sistema=CantidadActual FROM dbo.StockInsumo WITH(UPDLOCK,HOLDLOCK)
    WHERE InsumoId=@Articulo AND DepositoId=@Deposito;
   INSERT dbo.InventarioRecuentoDetalle(RecuentoId,Clase,ArticuloId,DepositoId,CantidadSistema,CantidadContada)
    VALUES(@RecuentoId,@Clase,@Articulo,@Deposito,ISNULL(@Sistema,0),@Contada);
   SET @Fila+=1;
  END;
  COMMIT;
  SELECT RecuentoId,OperacionId,Estado FROM dbo.InventarioRecuento WHERE RecuentoId=@RecuentoId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Inventario_ReasignarCupoOnline] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Esta operacion solo reasigna cupo comercial; NO mueve stock fisico.
   El servicio/API debe autorizar el permiso antes de llamar al SP.
   Se requiere usuario responsable real, no un valor predeterminado.
   Las ventas deben usar el MISMO applock al consumir el cupo (migracion posterior). */
CREATE   PROCEDURE [dbo].[sp_Inventario_ReasignarCupoOnline]
 @ProductoId INT,
 @CupoOnlineNuevo DECIMAL(18,2),
 @Motivo VARCHAR(250),
 @UsuarioResponsable NVARCHAR(128)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @CupoOnlineNuevo IS NULL OR @CupoOnlineNuevo<0
  THROW 53010,'Cupo online invalido.',1;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL
  THROW 53011,'Motivo obligatorio.',1;
 IF NULLIF(LTRIM(RTRIM(@UsuarioResponsable)),'') IS NULL
  THROW 53012,'Usuario responsable obligatorio.',1;
 DECLARE @DepositoId INT=3,@Anterior DECIMAL(18,2),@Fisico DECIMAL(18,2),@LockResult INT;
 DECLARE @RecursoBloqueo NVARCHAR(255);
 SET @RecursoBloqueo=CONCAT(N'TEKA:STOCK:',@ProductoId,N':',@DepositoId);
 BEGIN TRY
  BEGIN TRAN;
  EXEC @LockResult=sys.sp_getapplock @Resource=@RecursoBloqueo,
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53013,'No se pudo bloquear stock.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId AND Activo=1)
   THROW 53014,'Producto inexistente o inactivo.',1;
  SELECT @Fisico=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
   WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
  SET @Fisico=ISNULL(@Fisico,0);
  IF @CupoOnlineNuevo>@Fisico THROW 53015,'El cupo online supera el stock fisico.',1;
  SELECT @Anterior=CupoOnline FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK)
   WHERE ProductoId=@ProductoId;
  SET @Anterior=ISNULL(@Anterior,0);
  IF EXISTS(SELECT 1 FROM dbo.ProductoDisponibilidadOnline WHERE ProductoId=@ProductoId)
   UPDATE dbo.ProductoDisponibilidadOnline
   SET CupoOnline=@CupoOnlineNuevo,DepositoId=@DepositoId,FechaActualizacion=SYSUTCDATETIME()
   WHERE ProductoId=@ProductoId;
  ELSE
   INSERT dbo.ProductoDisponibilidadOnline(ProductoId,DepositoId,CupoOnline,FechaActualizacion)
   VALUES(@ProductoId,@DepositoId,@CupoOnlineNuevo,SYSUTCDATETIME());
  INSERT dbo.AuditoriaAsignacionComercial
   (ProductoId,DepositoId,CupoOnlineAnterior,CupoOnlineNuevo,Motivo,UsuarioResponsable)
  VALUES(@ProductoId,@DepositoId,@Anterior,@CupoOnlineNuevo,@Motivo,@UsuarioResponsable);
  COMMIT;
 END TRY
 BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Inventario_RegistrarAjustesMultiples] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Inventario_RegistrarAjustesMultiples]
 @OperacionId UNIQUEIDENTIFIER,
 @UsuarioResponsable NVARCHAR(128),
 @Motivo VARCHAR(250),
 @LineasJson NVARCHAR(MAX)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @OperacionId IS NULL THROW 53301,'OperacionId obligatorio para evitar reintentos duplicados.',1;
 IF NULLIF(LTRIM(RTRIM(@UsuarioResponsable)),N'') IS NULL
  THROW 53302,'Usuario responsable obligatorio.',1;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL
  THROW 53303,'Motivo obligatorio.',1;
 IF ISJSON(@LineasJson)<>1 OR LEFT(LTRIM(@LineasJson),1)<>N'['
  THROW 53304,'Se requiere un arreglo JSON de lineas.',1;
 DECLARE @Lineas TABLE(
  Fila INT IDENTITY(1,1) PRIMARY KEY,
  Clase VARCHAR(8), ArticuloId INT, DepositoId INT,
  Signo SMALLINT, Cantidad DECIMAL(18,2)
 );
 INSERT @Lineas(Clase,ArticuloId,DepositoId,Signo,Cantidad)
 SELECT UPPER(Clase),ArticuloId,DepositoId,Signo,Cantidad
 FROM OPENJSON(@LineasJson) WITH (
  Clase VARCHAR(8) '$.clase', ArticuloId INT '$.articuloId',
  DepositoId INT '$.depositoId', Signo SMALLINT '$.signo',
  Cantidad DECIMAL(18,2) '$.cantidad'
 );
 IF NOT EXISTS(SELECT 1 FROM @Lineas)
  THROW 53305,'El lote debe incluir al menos una linea.',1;
 IF EXISTS(SELECT 1 FROM @Lineas WHERE Clase NOT IN('PRODUCTO','INSUMO') OR Clase IS NULL
  OR ArticuloId IS NULL OR DepositoId IS NULL OR Signo NOT IN(-1,1) OR Signo IS NULL
  OR Cantidad IS NULL OR Cantidad<=0)
  THROW 53306,'Una o mas lineas contienen datos invalidos.',1;
 IF EXISTS(SELECT 1 FROM @Lineas GROUP BY Clase,ArticuloId,DepositoId HAVING COUNT(*)>1)
  THROW 53307,'No se admite repetir articulo y deposito en un mismo lote.',1;
 IF EXISTS(SELECT 1 FROM @Lineas WHERE (Clase='PRODUCTO' AND DepositoId<>3)
  OR (Clase='INSUMO' AND DepositoId<>2))
  THROW 53308,'Deposito no permitido para la clase de articulo.',1;
 IF EXISTS(SELECT 1 FROM @Lineas l WHERE
  (l.Clase='PRODUCTO' AND NOT EXISTS(SELECT 1 FROM dbo.Producto p WHERE p.ProductoId=l.ArticuloId AND p.Activo=1))
  OR (l.Clase='INSUMO' AND NOT EXISTS(SELECT 1 FROM dbo.Insumo i WHERE i.InsumoId=l.ArticuloId AND i.Activo=1)))
  THROW 53309,'Articulo inexistente o inactivo.',1;
 DECLARE @TipoPositivo INT,@TipoNegativo INT;
 SELECT @TipoPositivo=MIN(TipoMovimientoStockId) FROM dbo.TipoMovimientoStock
 WHERE Nombre='Ajuste Positivo' AND Signo=1 AND Activo=1;
 SELECT @TipoNegativo=MIN(TipoMovimientoStockId) FROM dbo.TipoMovimientoStock
 WHERE Nombre='Ajuste Negativo' AND Signo=-1 AND Activo=1;
 IF @TipoPositivo IS NULL OR @TipoNegativo IS NULL
  THROW 53310,'Faltan tipos de ajuste positivo/negativo activos.',1;
 DECLARE @LockResult INT,@Recurso NVARCHAR(255),@LoteId BIGINT;
 BEGIN TRY
  BEGIN TRAN;
  -- Serializa los reintentos de la misma operacion.
  SET @Recurso=CONCAT(N'TEKA:AJUSTE:',CONVERT(NVARCHAR(36),@OperacionId));
  EXEC @LockResult=sys.sp_getapplock @Resource=@Recurso,
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53311,'No se pudo bloquear la operacion.',1;
  IF EXISTS(SELECT 1 FROM dbo.InventarioAjusteLote WITH(UPDLOCK,HOLDLOCK) WHERE OperacionId=@OperacionId)
  BEGIN
   -- Reintento idempotente: nunca se aplica dos veces.
   SELECT AjusteLoteId,OperacionId,CantidadLineas FROM dbo.InventarioAjusteLote WHERE OperacionId=@OperacionId;
   COMMIT;
   RETURN;
  END;
  INSERT dbo.InventarioAjusteLote(OperacionId,UsuarioResponsable,Motivo,CantidadLineas)
  SELECT @OperacionId,@UsuarioResponsable,@Motivo,COUNT(*) FROM @Lineas;
  SET @LoteId=SCOPE_IDENTITY();
  DECLARE @Fila INT=1,@MaxFila INT=(SELECT COUNT(*) FROM @Lineas),
   @Clase VARCHAR(8),@ArticuloId INT,@DepositoId INT,@Signo SMALLINT,@Cantidad DECIMAL(18,2),
   @Tipo INT,@Fisico DECIMAL(18,2),@Cupo DECIMAL(18,2);
  WHILE @Fila<=@MaxFila
  BEGIN
   SELECT @Clase=Clase,@ArticuloId=ArticuloId,@DepositoId=DepositoId,
    @Signo=Signo,@Cantidad=Cantidad FROM @Lineas WHERE Fila=@Fila;
   SET @Tipo=CASE WHEN @Signo=1 THEN @TipoPositivo ELSE @TipoNegativo END;
   IF @Clase='PRODUCTO'
   BEGIN
    -- La misma llave de bloqueo que utiliza el procedimiento actual y migracion 02.
    SET @Recurso=CONCAT(N'TEKA:STOCK:',@ArticuloId,N':',@DepositoId);
    EXEC @LockResult=sys.sp_getapplock @Resource=@Recurso,
     @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
    IF @LockResult<0 THROW 53312,'No se pudo bloquear stock de producto.',1;
    SELECT @Fisico=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
     WHERE ProductoId=@ArticuloId AND DepositoId=@DepositoId;
    SELECT @Cupo=CupoOnline FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK)
     WHERE ProductoId=@ArticuloId AND DepositoId=@DepositoId;
    IF @Signo=-1 AND ISNULL(@Fisico,0)-@Cantidad<ISNULL(@Cupo,0)
     THROW 53313,'Ajuste negativo invade unidades asignadas al canal online; reasignar cupo primero.',1;
    EXEC dbo.sp_MovimientoStock_RegistrarProductoManual
     @TipoMovimientoStockId=@Tipo,@DepositoId=@DepositoId,@ProductoId=@ArticuloId,
     @Cantidad=@Cantidad,@Motivo=@Motivo;
   END
   ELSE
   BEGIN
    EXEC dbo.sp_MovimientoStock_RegistrarInsumoManual
     @TipoMovimientoStockId=@Tipo,@DepositoId=@DepositoId,@InsumoId=@ArticuloId,
     @Cantidad=@Cantidad,@Motivo=@Motivo;
   END;
   INSERT dbo.InventarioAjusteLoteDetalle(AjusteLoteId,Clase,ArticuloId,DepositoId,Signo,Cantidad)
   VALUES(@LoteId,@Clase,@ArticuloId,@DepositoId,@Signo,@Cantidad);
   SET @Fila+=1;
  END;
  COMMIT;
  SELECT AjusteLoteId,OperacionId,CantidadLineas FROM dbo.InventarioAjusteLote WHERE AjusteLoteId=@LoteId;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Inventario_RegistrarApertura] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* APERTURA: una sola vez y exclusivamente con movimientos y saldos vacios.
   JSON: [{"clase":"PRODUCTO","articuloId":22,"depositoId":3,"cantidad":5}, ...]
   Se usa el mismo nucleo transaccional de ajustes; el lote queda auditado.
   Cantidades cero pueden omitirse. No inventar saldos historicos.
*/
CREATE   PROCEDURE [dbo].[sp_Inventario_RegistrarApertura]
 @OperacionId UNIQUEIDENTIFIER,
 @UsuarioResponsable NVARCHAR(128),
 @Observacion VARCHAR(250),
 @LineasJson NVARCHAR(MAX)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @OperacionId IS NULL OR NULLIF(LTRIM(RTRIM(@UsuarioResponsable)),N'') IS NULL
  OR NULLIF(LTRIM(RTRIM(@Observacion)),'') IS NULL
  THROW 53701,'Operacion, usuario y observacion son obligatorios.',1;
 IF ISNULL(ISJSON(@LineasJson),0)<>1 OR LEFT(LTRIM(@LineasJson),1)<>N'['
  THROW 53702,'Se requiere arreglo JSON de cantidades iniciales.',1;
 DECLARE @L TABLE(Clase VARCHAR(8),ArticuloId INT,DepositoId INT,Cantidad DECIMAL(18,2));
 INSERT @L SELECT UPPER(Clase),ArticuloId,DepositoId,Cantidad
 FROM OPENJSON(@LineasJson) WITH(Clase VARCHAR(8) '$.clase',ArticuloId INT '$.articuloId',
  DepositoId INT '$.depositoId',Cantidad DECIMAL(18,2) '$.cantidad');
 IF NOT EXISTS(SELECT 1 FROM @L) OR EXISTS(SELECT 1 FROM @L WHERE Clase IS NULL OR Clase NOT IN('PRODUCTO','INSUMO')
  OR ArticuloId IS NULL OR DepositoId IS NULL OR Cantidad IS NULL OR Cantidad<=0
  OR (Clase='PRODUCTO' AND DepositoId<>3) OR (Clase='INSUMO' AND DepositoId<>2))
  THROW 53703,'Lineas de apertura invalidas. Omitir articulos con cantidad cero.',1;
 IF EXISTS(SELECT 1 FROM @L GROUP BY Clase,ArticuloId,DepositoId HAVING COUNT(*)>1)
  THROW 53704,'Articulos repetidos en apertura.',1;
 DECLARE @AjustesJson NVARCHAR(MAX),@LockResult INT;
 SELECT @AjustesJson=(SELECT Clase AS clase,ArticuloId AS articuloId,DepositoId AS depositoId,
  1 AS signo,Cantidad AS cantidad FROM @L ORDER BY Clase,ArticuloId FOR JSON PATH);
 BEGIN TRY
  BEGIN TRAN;
  EXEC @LockResult=sys.sp_getapplock @Resource=N'TEKA:INVENTARIO:APERTURA',
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 53705,'No fue posible bloquear la apertura.',1;
  IF EXISTS(SELECT 1 FROM dbo.InventarioApertura WITH(UPDLOCK,HOLDLOCK) WHERE OperacionId=@OperacionId)
  BEGIN
   SELECT AperturaId,OperacionId FROM dbo.InventarioApertura WHERE OperacionId=@OperacionId;
   COMMIT; RETURN;
  END;
  IF EXISTS(SELECT 1 FROM dbo.InventarioApertura WITH(UPDLOCK,HOLDLOCK))
   THROW 53706,'La apertura ya fue registrada.',1;
  IF EXISTS(SELECT 1 FROM dbo.MovimientoStock WITH(UPDLOCK,HOLDLOCK))
   OR EXISTS(SELECT 1 FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK) WHERE CantidadActual<>0)
   OR EXISTS(SELECT 1 FROM dbo.StockInsumo WITH(UPDLOCK,HOLDLOCK) WHERE CantidadActual<>0)
   OR EXISTS(SELECT 1 FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK) WHERE CupoOnline<>0)
   THROW 53707,'Hay movimientos, saldos o cupos. No se permite apertura sobre operaciones existentes.',1;
  EXEC dbo.sp_Inventario_RegistrarAjustesMultiples @OperacionId=@OperacionId,
   @UsuarioResponsable=@UsuarioResponsable,@Motivo='Stock inicial - apertura TEKA',@LineasJson=@AjustesJson;
  INSERT dbo.InventarioApertura(OperacionId,UsuarioResponsable,Observacion)
   VALUES(@OperacionId,@UsuarioResponsable,@Observacion);
  SELECT AperturaId,OperacionId FROM dbo.InventarioApertura WHERE OperacionId=@OperacionId;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ListaMateriales_Delete]
    @ListaMaterialesId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ListaMateriales
    SET Activa = 0
    WHERE ListaMaterialesId = @ListaMaterialesId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ListaMateriales 

CREATE PROCEDURE [dbo].[sp_ListaMateriales_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        lm.ListaMaterialesId,
        lm.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        lm.Nombre,
        lm.Version,
        lm.Activa,
        lm.FechaAlta
    FROM dbo.ListaMateriales lm
    INNER JOIN dbo.Producto p
        ON lm.ProductoId = p.ProductoId
    ORDER BY p.Nombre, lm.FechaAlta DESC, lm.ListaMaterialesId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ListaMateriales_GetById]
    @ListaMaterialesId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        lm.ListaMaterialesId,
        lm.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        lm.Nombre,
        lm.Version,
        lm.Activa,
        lm.FechaAlta
    FROM dbo.ListaMateriales lm
    INNER JOIN dbo.Producto p
        ON lm.ProductoId = p.ProductoId
    WHERE lm.ListaMaterialesId = @ListaMaterialesId;

    SELECT
        dlm.DetalleListaMaterialesId,
        dlm.ListaMaterialesId,
        dlm.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        dlm.Cantidad,
        dlm.Observaciones
    FROM dbo.DetalleListaMateriales dlm
    INNER JOIN dbo.Insumo i
        ON dlm.InsumoId = i.InsumoId
    WHERE dlm.ListaMaterialesId = @ListaMaterialesId
    ORDER BY dlm.DetalleListaMaterialesId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_GetByProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ListaMateriales_GetByProducto]
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        lm.ListaMaterialesId,
        lm.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        lm.Nombre,
        lm.Version,
        lm.Activa,
        lm.FechaAlta
    FROM dbo.ListaMateriales lm
    INNER JOIN dbo.Producto p
        ON lm.ProductoId = p.ProductoId
    WHERE lm.ProductoId = @ProductoId
    ORDER BY lm.FechaAlta DESC, lm.ListaMaterialesId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_ListaMateriales_Insert]
    @ProductoId                  INT,
    @Nombre                      VARCHAR(120),
    @Version                     VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.ListaMateriales
    (
        ProductoId,
        Nombre,
        Version,
        Activa,
        FechaAlta
    )
    VALUES
    (
        @ProductoId,
        @Nombre,
        @Version,
        1,
        GETDATE()
    );

    SELECT SCOPE_IDENTITY() AS ListaMaterialesId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ListaMateriales_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* Compatibilidad: los endpoints heredados pueden editar versiones no utilizadas,
   pero nunca una configuracion que ya forma parte de una orden. */
CREATE   PROCEDURE [dbo].[sp_ListaMateriales_Update]
 @ListaMaterialesId INT,@Nombre VARCHAR(120),@Version VARCHAR(20)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle WHERE ListaMaterialesId=@ListaMaterialesId) THROW 61016,'Una configuracion utilizada por una orden es historica e inmutable.',1;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL THROW 61017,'El nombre de la configuracion es obligatorio.',1;
 UPDATE dbo.ListaMateriales SET Nombre=LTRIM(RTRIM(@Nombre)),Version=NULLIF(LTRIM(RTRIM(@Version)),'') WHERE ListaMaterialesId=@ListaMaterialesId;
 IF @@ROWCOUNT<>1 THROW 61018,'Configuracion inexistente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MedioCobro_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

 -- =========================================================
-- COBROS
-- =========================================================

--MedioCobro

CREATE PROCEDURE [dbo].[sp_MedioCobro_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MedioCobroId,
        Nombre,
        RequiereReferencia,
        Activo
    FROM dbo.MedioCobro
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MedioCobro_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MedioCobro_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MedioCobroId AS Id,
        Nombre AS Descripcion,
        RequiereReferencia
    FROM dbo.MedioCobro
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Menu_Delete]
    @MenuId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Menu
    SET Activo = 0
    WHERE MenuId = @MenuId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   MENU
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_Menu_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MenuId,
        Nombre,
        Ruta,
        Modulo,
        OrdenVisual,
        Activo
    FROM dbo.Menu
    ORDER BY Modulo, OrdenVisual, Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Menu_GetById]
    @MenuId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MenuId,
        Nombre,
        Ruta,
        Modulo,
        OrdenVisual,
        Activo
    FROM dbo.Menu
    WHERE MenuId = @MenuId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Menu_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MenuId AS Id,
        Nombre AS Descripcion,
        Modulo,
        Ruta
    FROM dbo.Menu
    WHERE Activo = 1
    ORDER BY Modulo, OrdenVisual, Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Menu_Insert]
    @Nombre         VARCHAR(100),
    @Ruta           VARCHAR(150) = NULL,
    @Modulo         VARCHAR(50),
    @OrdenVisual    INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Menu
    (
        Nombre,
        Ruta,
        Modulo,
        OrdenVisual,
        Activo
    )
    VALUES
    (
        @Nombre,
        @Ruta,
        @Modulo,
        @OrdenVisual,
        1
    );

    SELECT SCOPE_IDENTITY() AS MenuId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Menu_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Menu_Update]
    @MenuId         INT,
    @Nombre         VARCHAR(100),
    @Ruta           VARCHAR(150) = NULL,
    @Modulo         VARCHAR(50),
    @OrdenVisual    INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Menu
    SET
        Nombre = @Nombre,
        Ruta = @Ruta,
        Modulo = @Modulo,
        OrdenVisual = @OrdenVisual
    WHERE MenuId = @MenuId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_ModeloProducto_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_ModeloProducto_GetLookup]
 @TipoProductoId INT = NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT ModeloProductoId AS Id, Nombre AS Descripcion, TipoProductoId
 FROM dbo.ModeloProducto
 WHERE Activo=1 AND (@TipoProductoId IS NULL OR TipoProductoId=@TipoProductoId)
 ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Moneda_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- MONEDA
   
CREATE PROCEDURE [dbo].[sp_Moneda_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MonedaId,
        CodigoARCA,
        Nombre,
        Activo
    FROM dbo.Moneda
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Moneda_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Moneda_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MonedaId AS Id,
        Nombre AS Descripcion,
        CodigoARCA
    FROM dbo.Moneda
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoInactivacion_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--MotivoInactivacion

CREATE PROCEDURE [dbo].[sp_MotivoInactivacion_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MotivoInactivacionId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.MotivoInactivacion
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoInactivacion_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MotivoInactivacion_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MotivoInactivacionId AS Id,
        Nombre AS Descripcion
    FROM dbo.MotivoInactivacion
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoInactivacionUsuario_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   USUARIO
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_MotivoInactivacionUsuario_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MotivoInactivacionUsuarioId AS Id,
        Nombre AS Descripcion
    FROM dbo.MotivoInactivacionUsuario
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoMovimientoStock_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_MotivoMovimientoStock_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MotivoMovimientoStockId AS Id, Nombre AS Descripcion
    FROM dbo.MotivoMovimientoStock WHERE Activo = 1 ORDER BY Nombre;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoPerdidaOportunidad_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_MotivoPerdidaOportunidad_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MotivoPerdidaOportunidadId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.MotivoPerdidaOportunidad
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MotivoPerdidaOportunidad_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_MotivoPerdidaOportunidad_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MotivoPerdidaOportunidadId AS Id,
        Nombre AS Descripcion
    FROM dbo.MotivoPerdidaOportunidad
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoCuentaCorrienteCliente_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

 -- MovimientoCuentaCorrienteCliente

CREATE PROCEDURE [dbo].[sp_MovimientoCuentaCorrienteCliente_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.MovimientoCuentaCorrienteClienteId,
        m.ClienteId,
        c.Nombre AS ClienteNombre,
        c.Apellido AS ClienteApellido,
        m.TipoMovimientoCuentaCorrienteId,
        tm.Nombre AS TipoMovimientoNombre,
        tm.Signo,
        m.FechaMovimiento,
        m.PedidoId,
        m.ComprobanteId,
        m.CobroId,
        m.Importe,
        m.Observaciones
    FROM dbo.MovimientoCuentaCorrienteCliente m
    INNER JOIN dbo.Cliente c
        ON m.ClienteId = c.ClienteId
    INNER JOIN dbo.TipoMovimientoCuentaCorriente tm
        ON m.TipoMovimientoCuentaCorrienteId = tm.TipoMovimientoCuentaCorrienteId
    ORDER BY m.FechaMovimiento DESC, m.MovimientoCuentaCorrienteClienteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoCuentaCorrienteCliente_GetByCliente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MovimientoCuentaCorrienteCliente_GetByCliente]
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.MovimientoCuentaCorrienteClienteId,
        m.ClienteId,
        c.Nombre AS ClienteNombre,
        c.Apellido AS ClienteApellido,
        m.TipoMovimientoCuentaCorrienteId,
        tm.Nombre AS TipoMovimientoNombre,
        tm.Signo,
        m.FechaMovimiento,
        m.PedidoId,
        m.ComprobanteId,
        m.CobroId,
        m.Importe,
        m.Observaciones
    FROM dbo.MovimientoCuentaCorrienteCliente m
    INNER JOIN dbo.Cliente c
        ON m.ClienteId = c.ClienteId
    INNER JOIN dbo.TipoMovimientoCuentaCorriente tm
        ON m.TipoMovimientoCuentaCorrienteId = tm.TipoMovimientoCuentaCorrienteId
    WHERE m.ClienteId = @ClienteId
    ORDER BY m.FechaMovimiento DESC, m.MovimientoCuentaCorrienteClienteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoCuentaCorrienteCliente_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MovimientoCuentaCorrienteCliente_GetById]
    @MovimientoCuentaCorrienteClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        m.MovimientoCuentaCorrienteClienteId,
        m.ClienteId,
        c.Nombre AS ClienteNombre,
        c.Apellido AS ClienteApellido,
        m.TipoMovimientoCuentaCorrienteId,
        tm.Nombre AS TipoMovimientoNombre,
        tm.Signo,
        m.FechaMovimiento,
        m.PedidoId,
        m.ComprobanteId,
        m.CobroId,
        m.Importe,
        m.Observaciones
    FROM dbo.MovimientoCuentaCorrienteCliente m
    INNER JOIN dbo.Cliente c
        ON m.ClienteId = c.ClienteId
    INNER JOIN dbo.TipoMovimientoCuentaCorriente tm
        ON m.TipoMovimientoCuentaCorrienteId = tm.TipoMovimientoCuentaCorrienteId
    WHERE m.MovimientoCuentaCorrienteClienteId = @MovimientoCuentaCorrienteClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoCuentaCorrienteCliente_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_MovimientoCuentaCorrienteCliente_Registrar]
    @ClienteId                            INT,
    @TipoMovimientoCuentaCorrienteId      INT,
    @PedidoId                             INT = NULL,
    @ComprobanteId                        INT = NULL,
    @CobroId                              INT = NULL,
    @Importe                              DECIMAL(18,2),
    @Observaciones                        VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.MovimientoCuentaCorrienteCliente
    (
        ClienteId,
        TipoMovimientoCuentaCorrienteId,
        FechaMovimiento,
        PedidoId,
        ComprobanteId,
        CobroId,
        Importe,
        Observaciones
    )
    VALUES
    (
        @ClienteId,
        @TipoMovimientoCuentaCorrienteId,
        GETDATE(),
        @PedidoId,
        @ComprobanteId,
        @CobroId,
        @Importe,
        @Observaciones
    );

    SELECT SCOPE_IDENTITY() AS MovimientoCuentaCorrienteClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoRecorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- MovimientoRecorte

CREATE PROCEDURE [dbo].[sp_MovimientoRecorte_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mr.MovimientoRecorteId,
        mr.RecorteId,
        mr.DepositoId,
        d.Nombre AS DepositoNombre,
        mr.FechaMovimiento,
        mr.TipoMovimiento,
        mr.Cantidad,
        mr.Observaciones,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura
    FROM dbo.MovimientoRecorte mr
    INNER JOIN dbo.Recorte r
        ON mr.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Deposito d
        ON mr.DepositoId = d.DepositoId
    ORDER BY mr.FechaMovimiento DESC, mr.MovimientoRecorteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoRecorte_GetByRecorte] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MovimientoRecorte_GetByRecorte]
    @RecorteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mr.MovimientoRecorteId,
        mr.RecorteId,
        mr.DepositoId,
        d.Nombre AS DepositoNombre,
        mr.FechaMovimiento,
        mr.TipoMovimiento,
        mr.Cantidad,
        mr.Observaciones
    FROM dbo.MovimientoRecorte mr
    INNER JOIN dbo.Deposito d
        ON mr.DepositoId = d.DepositoId
    WHERE mr.RecorteId = @RecorteId
    ORDER BY mr.FechaMovimiento DESC, mr.MovimientoRecorteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoRecorte_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* Uso exige un consumo productivo ya creado dentro de la misma transaccion.
   Alta, baja y ajustes legitimos conservan el contrato anterior. */
CREATE   PROCEDURE [dbo].[sp_MovimientoRecorte_Registrar]
    @RecorteId INT,
    @DepositoId INT,
    @TipoMovimiento VARCHAR(50),
    @Cantidad DECIMAL(18,2),
    @Observaciones VARCHAR(250) = NULL,
    @ConsumoRecorteProduccionId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @Cantidad IS NULL OR @Cantidad <= 0
        THROW 60020, 'Cantidad de recorte debe ser mayor a cero.', 1;
    IF UPPER(LTRIM(RTRIM(COALESCE(@TipoMovimiento, '')))) = 'RESERVA'
        THROW 62019, 'Los recortes no se reservan; permanecen disponibles hasta iniciar produccion.', 1;
    IF @TipoMovimiento IS NULL
       OR @TipoMovimiento NOT IN ('Alta','Uso','Baja','AjustePositivo','AjusteNegativo')
        THROW 60021, 'Tipo de movimiento de recorte no permitido (sin reservas).', 1;
    IF @DepositoId <> 4
        THROW 60022, 'Los recortes se administran exclusivamente en el Panol de Recortes (deposito 4).', 1;
    IF @TipoMovimiento = 'Uso' AND @ConsumoRecorteProduccionId IS NULL
        THROW 62020, 'Uso solo puede registrarse desde el consumo integral de Produccion.', 1;
    IF @TipoMovimiento <> 'Uso' AND @ConsumoRecorteProduccionId IS NOT NULL
        THROW 62021, 'El vinculo de consumo solo corresponde a movimientos Uso.', 1;

    DECLARE @LockResult INT,
            @Resource NVARCHAR(255) = CONCAT('TEKA:RECORTE:', @RecorteId, ':', @DepositoId),
            @Saldo DECIMAL(18,2),
            @Delta DECIMAL(18,2),
            @EstadoActual VARCHAR(50),
            @EstadoUtilizadoId INT,
            @OrdenProduccionId INT;

    SET @Delta = CASE WHEN @TipoMovimiento IN ('Alta','AjustePositivo')
                      THEN @Cantidad ELSE -@Cantidad END;

    BEGIN TRY
        BEGIN TRAN;

        EXEC @LockResult = sys.sp_getapplock
            @Resource = @Resource,
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 15000;
        IF @LockResult < 0
            THROW 60024, 'No se pudo bloquear el saldo del recorte.', 1;

        SELECT @EstadoActual = e.Nombre
        FROM dbo.Recorte r WITH (UPDLOCK, HOLDLOCK)
        JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId = r.EstadoRecorteId
        WHERE r.RecorteId = @RecorteId;
        IF @EstadoActual IS NULL
            THROW 60023, 'Recorte inexistente.', 1;

        SELECT @Saldo = CantidadActual
        FROM dbo.StockRecorte WITH (UPDLOCK, HOLDLOCK)
        WHERE RecorteId = @RecorteId AND DepositoId = @DepositoId;

        IF @Saldo IS NULL
        BEGIN
            INSERT dbo.StockRecorte(RecorteId, DepositoId, CantidadActual)
            VALUES(@RecorteId, @DepositoId, 0);
            SET @Saldo = 0;
        END;

        IF @TipoMovimiento = 'Uso'
        BEGIN
            SELECT @OrdenProduccionId = c.OrdenProduccionId
            FROM dbo.ConsumoRecorteProduccion c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.ConsumoRecorteProduccionId = @ConsumoRecorteProduccionId
              AND c.RecorteId = @RecorteId
              AND c.DepositoId = @DepositoId
              AND c.CantidadConsumida = @Cantidad;

            IF @OrdenProduccionId IS NULL
                THROW 62022, 'El consumo productivo no existe o no coincide con el movimiento Uso.', 1;
            IF UPPER(LTRIM(RTRIM(@EstadoActual))) <> 'DISPONIBLE'
                THROW 62023, 'El recorte debe estar Disponible para consumirse.', 1;
            IF @Saldo <> @Cantidad
                THROW 62024, 'Cada recorte debe consumirse completamente.', 1;
            IF EXISTS (SELECT 1 FROM dbo.MovimientoRecorte WITH (UPDLOCK, HOLDLOCK)
                       WHERE RecorteId = @RecorteId AND TipoMovimiento = 'Uso')
                THROW 62025, 'El recorte ya posee un movimiento de consumo.', 1;

            SELECT @EstadoUtilizadoId = MIN(EstadoRecorteId)
            FROM dbo.EstadoRecorte WITH (UPDLOCK, HOLDLOCK)
            WHERE Activo = 1 AND UPPER(LTRIM(RTRIM(Nombre))) = 'UTILIZADO';
            IF @EstadoUtilizadoId IS NULL
               OR (SELECT COUNT(*) FROM dbo.EstadoRecorte
                   WHERE Activo = 1 AND UPPER(LTRIM(RTRIM(Nombre))) = 'UTILIZADO') <> 1
                THROW 62026, 'El estado activo Utilizado falta o esta duplicado.', 1;
        END;

        IF @Saldo + @Delta < 0
            THROW 60025, 'Stock insuficiente de recorte.', 1;

        UPDATE dbo.StockRecorte
        SET CantidadActual = CantidadActual + @Delta
        WHERE RecorteId = @RecorteId AND DepositoId = @DepositoId;

        INSERT dbo.MovimientoRecorte
            (RecorteId, DepositoId, FechaMovimiento, TipoMovimiento, Cantidad,
             Observaciones, ConsumoRecorteProduccionId)
        VALUES
            (@RecorteId, @DepositoId, GETDATE(), @TipoMovimiento, @Cantidad,
             @Observaciones, @ConsumoRecorteProduccionId);

        IF @TipoMovimiento = 'Uso'
        BEGIN
            UPDATE dbo.Recorte
            SET EstadoRecorteId = @EstadoUtilizadoId
            WHERE RecorteId = @RecorteId;

            INSERT dbo.HistorialEstadoRecorte
                (RecorteId, EstadoRecorteId, FechaCambio, Observaciones)
            VALUES
                (@RecorteId, @EstadoUtilizadoId, GETDATE(),
                 CONCAT('Consumo total al iniciar OP ', @OrdenProduccionId));
        END;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_AnularInsumo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_MovimientoStock_AnularInsumo]
    @MovimientoStockId INT,
    @MotivoAnulacion VARCHAR(250),
    @ObservacionAnulacion VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @TipoMovimientoStockId INT, @DepositoId INT, @InsumoId INT,
            @Cantidad DECIMAL(18,2), @Activo BIT, @Signo SMALLINT,
            @TipoMovimientoReversaId INT, @CantidadActual DECIMAL(18,2),
            @LockResult INT, @LockResource NVARCHAR(255),
            @EntidadOrigen VARCHAR(50), @ReversaDe INT;

    IF NULLIF(LTRIM(RTRIM(@MotivoAnulacion)), '') IS NULL
        THROW 52110, 'El motivo de anulacion es obligatorio.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;
        SELECT @TipoMovimientoStockId = TipoMovimientoStockId,
               @DepositoId = DepositoId, @InsumoId = InsumoId,
               @Cantidad = Cantidad, @Activo = Activo,
               @EntidadOrigen = EntidadOrigen, @ReversaDe = MovimientoStockIdReversaDe
        FROM dbo.MovimientoStock WITH (UPDLOCK,HOLDLOCK)
        WHERE MovimientoStockId = @MovimientoStockId AND InsumoId IS NOT NULL;

        IF @Activo IS NULL THROW 52111, 'Movimiento de insumo inexistente.', 1;
        IF @Activo = 0 THROW 52112, 'El movimiento ya fue anulado.', 1;
        IF EXISTS (SELECT 1 FROM dbo.MovimientoStock WHERE MovimientoStockIdReversaDe=@MovimientoStockId)
            THROW 52120, 'El movimiento ya tiene una reversa registrada.', 1;
        IF @ReversaDe IS NOT NULL THROW 52113, 'No se permite anular directamente una reversa.', 1;
        IF ISNULL(@EntidadOrigen,'') <> 'AjusteManual'
            THROW 52114, 'Los movimientos automaticos deben corregirse desde su proceso de origen.', 1;

        SET @LockResource = CONCAT('TEKA:STOCK:INSUMO:',@InsumoId,':',@DepositoId);
        EXEC @LockResult = sys.sp_getapplock
            @Resource=@LockResource, @LockMode='Exclusive',
            @LockOwner='Transaction', @LockTimeout=15000;
        IF @LockResult < 0 THROW 52115, 'No fue posible bloquear el stock del insumo.', 1;

        SELECT @Signo=Signo FROM dbo.TipoMovimientoStock
        WHERE TipoMovimientoStockId=@TipoMovimientoStockId;
        IF @Signo IS NULL OR @Signo NOT IN (-1,1)
            THROW 52116, 'El tipo de movimiento original es invalido.', 1;
        SELECT TOP(1) @TipoMovimientoReversaId=TipoMovimientoStockId
        FROM dbo.TipoMovimientoStock
        WHERE Signo=-@Signo AND Activo=1
        ORDER BY TipoMovimientoStockId;
        IF @TipoMovimientoReversaId IS NULL
            THROW 52117, 'No existe un tipo de movimiento activo para la reversa.', 1;

        SELECT @CantidadActual=CantidadActual FROM dbo.StockInsumo WITH (UPDLOCK,HOLDLOCK)
        WHERE InsumoId=@InsumoId AND DepositoId=@DepositoId;
        IF @CantidadActual IS NULL
            THROW 52118, 'No existe registro de stock para el insumo y deposito.', 1;
        IF @Signo=1 AND @CantidadActual < @Cantidad
            THROW 52119, 'No se puede anular la entrada: stock disponible insuficiente.', 1;

        UPDATE dbo.MovimientoStock
        SET Activo=0, FechaAnulacion=GETDATE(),
            MotivoAnulacion=@MotivoAnulacion,
            ObservacionAnulacion=@ObservacionAnulacion
        WHERE MovimientoStockId=@MovimientoStockId;

        INSERT dbo.MovimientoStock
          (FechaMovimiento,TipoMovimientoStockId,DepositoId,ProductoId,InsumoId,
           Cantidad,Motivo,EntidadOrigen,OrigenId,Activo,MovimientoStockIdReversaDe)
        VALUES(GETDATE(),@TipoMovimientoReversaId,@DepositoId,NULL,@InsumoId,
               @Cantidad,'Reversa por anulacion de movimiento de stock',
               'AjusteManual',NULL,1,@MovimientoStockId);

        UPDATE dbo.StockInsumo
        SET CantidadActual=CantidadActual-(@Cantidad*@Signo)
        WHERE InsumoId=@InsumoId AND DepositoId=@DepositoId;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_AnularProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_MovimientoStock_AnularProducto]
@MovimientoStockId INT,@MotivoAnulacion VARCHAR(250),@ObservacionAnulacion VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @TipoMovimientoStockId INT,@DepositoId INT,@ProductoId INT,@Cantidad DECIMAL(18,2),
  @Activo BIT,@Signo SMALLINT,@TipoMovimientoReversaId INT,@Fisico DECIMAL(18,2),
  @Reservado DECIMAL(18,2),@LockResult INT,@LockResource NVARCHAR(255),
  @EntidadOrigen VARCHAR(50),@ReversaDe INT;
 IF NULLIF(LTRIM(RTRIM(@MotivoAnulacion)),'') IS NULL THROW 52040,'Motivo de anulacion obligatorio.',1;
 BEGIN TRY
  BEGIN TRAN;
  SELECT @TipoMovimientoStockId=TipoMovimientoStockId,@DepositoId=DepositoId,
   @ProductoId=ProductoId,@Cantidad=Cantidad,@Activo=Activo,
   @EntidadOrigen=EntidadOrigen,@ReversaDe=MovimientoStockIdReversaDe
  FROM dbo.MovimientoStock WITH(UPDLOCK,HOLDLOCK)
  WHERE MovimientoStockId=@MovimientoStockId AND ProductoId IS NOT NULL;
  IF @Activo IS NULL THROW 52041,'Movimiento inexistente.',1;
  IF @Activo=0 THROW 52042,'Movimiento ya anulado.',1;
  IF @ReversaDe IS NOT NULL THROW 52207,'No se puede anular una reversa.',1;
  IF ISNULL(@EntidadOrigen,'')<>'AjusteManual'
   THROW 52208,'Los movimientos automaticos se corrigen desde el proceso de origen.',1;
  IF EXISTS(SELECT 1 FROM dbo.MovimientoStock WHERE MovimientoStockIdReversaDe=@MovimientoStockId)
   THROW 52209,'El movimiento ya tiene reversa.',1;
  SET @LockResource=CONCAT('TEKA:STOCK:',@ProductoId,':',@DepositoId);
  EXEC @LockResult=sys.sp_getapplock @Resource=@LockResource,
   @LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @LockResult<0 THROW 52043,'No fue posible bloquear el stock.',1;
  SELECT @Signo=Signo FROM dbo.TipoMovimientoStock WHERE TipoMovimientoStockId=@TipoMovimientoStockId;
  IF @Signo NOT IN(-1,1) OR @Signo IS NULL THROW 52044,'Movimiento original invalido.',1;
  SELECT TOP(1) @TipoMovimientoReversaId=TipoMovimientoStockId
  FROM dbo.TipoMovimientoStock WHERE Signo=-@Signo AND Activo=1 ORDER BY TipoMovimientoStockId;
  IF @TipoMovimientoReversaId IS NULL THROW 52045,'Falta tipo de movimiento reverso.',1;
  SELECT @Fisico=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
  WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
  IF @Fisico IS NULL THROW 52210,'No existe stock para el producto en el deposito.',1;
  SELECT @Reservado=ISNULL(CupoOnline,0) FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK) WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
  IF @Signo=1 AND @Fisico-@Reservado<@Cantidad
   THROW 52046,'No se puede anular entrada: afectaria stock libre o reservado.',1;
  UPDATE dbo.MovimientoStock SET Activo=0,FechaAnulacion=GETDATE(),
   MotivoAnulacion=@MotivoAnulacion,ObservacionAnulacion=@ObservacionAnulacion
  WHERE MovimientoStockId=@MovimientoStockId;
  INSERT dbo.MovimientoStock(FechaMovimiento,TipoMovimientoStockId,DepositoId,ProductoId,InsumoId,
   Cantidad,Motivo,EntidadOrigen,OrigenId,Activo,MovimientoStockIdReversaDe)
  VALUES(GETDATE(),@TipoMovimientoReversaId,@DepositoId,@ProductoId,NULL,@Cantidad,
   'Reversa por anulacion de movimiento de stock','AjusteManual',NULL,1,@MovimientoStockId);
  UPDATE dbo.StockProducto SET CantidadActual=CantidadActual-(@Cantidad*@Signo)
  WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--MovimientoStock

CREATE PROCEDURE [dbo].[sp_MovimientoStock_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ms.MovimientoStockId,
        ms.FechaMovimiento,
        ms.TipoMovimientoStockId,
        tms.Nombre AS TipoMovimientoNombre,
        tms.Signo,
        ms.DepositoId,
        d.Nombre AS DepositoNombre,
        ms.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        ms.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        ms.Cantidad,
        ms.Motivo,
        ms.EntidadOrigen,
        ms.OrigenId,
        ms.Activo,
        ms.FechaAnulacion,
        ms.MotivoAnulacion,
        ms.ObservacionAnulacion,
        ms.MovimientoStockIdReversaDe
    FROM dbo.MovimientoStock ms
    INNER JOIN dbo.TipoMovimientoStock tms
        ON ms.TipoMovimientoStockId = tms.TipoMovimientoStockId
    INNER JOIN dbo.Deposito d
        ON ms.DepositoId = d.DepositoId
    LEFT JOIN dbo.Producto p
        ON ms.ProductoId = p.ProductoId
    LEFT JOIN dbo.Insumo i
        ON ms.InsumoId = i.InsumoId
    ORDER BY ms.FechaMovimiento DESC, ms.MovimientoStockId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_MovimientoStock_GetById]
    @MovimientoStockId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ms.MovimientoStockId,
        ms.FechaMovimiento,
        ms.TipoMovimientoStockId,
        tms.Nombre AS TipoMovimientoNombre,
        tms.Signo,
        ms.DepositoId,
        d.Nombre AS DepositoNombre,
        ms.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        ms.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        ms.Cantidad,
        ms.Motivo,
        ms.EntidadOrigen,
        ms.OrigenId,
        ms.Activo,
        ms.FechaAnulacion,
        ms.MotivoAnulacion,
        ms.ObservacionAnulacion,
        ms.MovimientoStockIdReversaDe
    FROM dbo.MovimientoStock ms
    INNER JOIN dbo.TipoMovimientoStock tms
        ON ms.TipoMovimientoStockId = tms.TipoMovimientoStockId
    INNER JOIN dbo.Deposito d
        ON ms.DepositoId = d.DepositoId
    LEFT JOIN dbo.Producto p
        ON ms.ProductoId = p.ProductoId
    LEFT JOIN dbo.Insumo i
        ON ms.InsumoId = i.InsumoId
    WHERE ms.MovimientoStockId = @MovimientoStockId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_GetByInsumo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MovimientoStock_GetByInsumo]
    @InsumoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ms.MovimientoStockId,
        ms.FechaMovimiento,
        ms.TipoMovimientoStockId,
        tms.Nombre AS TipoMovimientoNombre,
        tms.Signo,
        ms.DepositoId,
        d.Nombre AS DepositoNombre,
        CAST(NULL AS INT) AS ProductoId,
        CAST(NULL AS VARCHAR(50)) AS ProductoCodigo,
        CAST(NULL AS VARCHAR(150)) AS ProductoNombre,
        ms.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        ms.Cantidad,
        ms.Motivo,
        ms.EntidadOrigen,
        ms.OrigenId,
        ms.Activo,
        ms.FechaAnulacion,
        ms.MotivoAnulacion,
        ms.ObservacionAnulacion,
        ms.MovimientoStockIdReversaDe
    FROM dbo.MovimientoStock ms
    INNER JOIN dbo.TipoMovimientoStock tms
        ON ms.TipoMovimientoStockId = tms.TipoMovimientoStockId
    INNER JOIN dbo.Deposito d
        ON ms.DepositoId = d.DepositoId
    INNER JOIN dbo.Insumo i
        ON ms.InsumoId = i.InsumoId
    WHERE ms.InsumoId = @InsumoId
    ORDER BY ms.FechaMovimiento DESC, ms.MovimientoStockId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_GetByProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_MovimientoStock_GetByProducto]
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ms.MovimientoStockId,
        ms.FechaMovimiento,
        ms.TipoMovimientoStockId,
        tms.Nombre AS TipoMovimientoNombre,
        tms.Signo,
        ms.DepositoId,
        d.Nombre AS DepositoNombre,
        ms.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        ms.Cantidad,
        ms.Motivo,
        ms.EntidadOrigen,
        ms.OrigenId,
        ms.Activo,
        ms.FechaAnulacion,
        ms.MotivoAnulacion,
        ms.ObservacionAnulacion,
        ms.MovimientoStockIdReversaDe
    FROM dbo.MovimientoStock ms
    INNER JOIN dbo.TipoMovimientoStock tms
        ON ms.TipoMovimientoStockId = tms.TipoMovimientoStockId
    INNER JOIN dbo.Deposito d
        ON ms.DepositoId = d.DepositoId
    INNER JOIN dbo.Producto p
        ON ms.ProductoId = p.ProductoId
    WHERE ms.ProductoId = @ProductoId
    ORDER BY ms.FechaMovimiento DESC, ms.MovimientoStockId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_RegistrarInsumo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_MovimientoStock_RegistrarInsumo]
    @TipoMovimientoStockId INT,
    @DepositoId INT,
    @InsumoId INT,
    @Cantidad DECIMAL(18,2),
    @Motivo VARCHAR(250) = NULL,
    @EntidadOrigen VARCHAR(50) = NULL,
    @OrigenId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @Signo SMALLINT, @CantidadActual DECIMAL(18,2),
            @LockResult INT, @LockResource NVARCHAR(255);

    IF @Cantidad IS NULL OR @Cantidad <= 0
        THROW 52100, 'La cantidad del insumo debe ser positiva.', 1;
    IF @InsumoId IS NULL OR @DepositoId IS NULL
        THROW 52101, 'Debe indicar insumo y deposito.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;
        SET @LockResource = CONCAT('TEKA:STOCK:INSUMO:', @InsumoId, ':', @DepositoId);
        EXEC @LockResult = sys.sp_getapplock
            @Resource = @LockResource, @LockMode = 'Exclusive',
            @LockOwner = 'Transaction', @LockTimeout = 15000;
        IF @LockResult < 0 THROW 52102, 'No fue posible bloquear el stock del insumo.', 1;

        SELECT @Signo = Signo FROM dbo.TipoMovimientoStock
        WHERE TipoMovimientoStockId = @TipoMovimientoStockId AND Activo = 1;
        IF @Signo IS NULL OR @Signo NOT IN (-1,1)
            THROW 52103, 'Tipo de movimiento de stock invalido o inactivo.', 1;

        SELECT @CantidadActual = CantidadActual
        FROM dbo.StockInsumo WITH (UPDLOCK, HOLDLOCK)
        WHERE InsumoId = @InsumoId AND DepositoId = @DepositoId;
        SET @CantidadActual = ISNULL(@CantidadActual,0);

        IF @Signo = -1 AND @CantidadActual < @Cantidad
            THROW 52104, 'Stock insuficiente para registrar la salida del insumo.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.StockInsumo WHERE InsumoId = @InsumoId AND DepositoId = @DepositoId)
            INSERT dbo.StockInsumo(InsumoId,DepositoId,CantidadActual)
            VALUES(@InsumoId,@DepositoId,0);

        UPDATE dbo.StockInsumo
        SET CantidadActual = CantidadActual + (@Cantidad * @Signo)
        WHERE InsumoId = @InsumoId AND DepositoId = @DepositoId;

        INSERT dbo.MovimientoStock
          (FechaMovimiento,TipoMovimientoStockId,DepositoId,ProductoId,InsumoId,
           Cantidad,Motivo,EntidadOrigen,OrigenId,Activo)
        VALUES(GETDATE(),@TipoMovimientoStockId,@DepositoId,NULL,@InsumoId,
               @Cantidad,@Motivo,@EntidadOrigen,@OrigenId,1);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_RegistrarInsumoManual] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* Los ajustes manuales solo admiten Ajuste Positivo o Ajuste Negativo,
   nunca Entrada/Salida/Consumo/Resultado. */
CREATE   PROCEDURE [dbo].[sp_MovimientoStock_RegistrarInsumoManual]
 @TipoMovimientoStockId INT,@DepositoId INT,@InsumoId INT,
 @Cantidad DECIMAL(18,2),@Motivo VARCHAR(250)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL THROW 52201,'Motivo obligatorio para ajuste manual.',1;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 52202,'Cantidad de ajuste invalida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.TipoMovimientoStock WHERE TipoMovimientoStockId=@TipoMovimientoStockId
   AND Nombre IN('Ajuste Positivo','Ajuste Negativo') AND Activo=1)
   THROW 52203,'Solo se admiten tipos de ajuste manual activos.',1;
 EXEC dbo.sp_MovimientoStock_RegistrarInsumo @TipoMovimientoStockId=@TipoMovimientoStockId,
  @DepositoId=@DepositoId,@InsumoId=@InsumoId,@Cantidad=@Cantidad,
  @Motivo=@Motivo,@EntidadOrigen='AjusteManual',@OrigenId=NULL;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_RegistrarProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Extiende el movimiento central sin duplicar su implementacion. Los ajustes
   usan origen distinto al descuento inicial, y siguen verificando cupo/canal. */
CREATE   PROCEDURE [dbo].[sp_MovimientoStock_RegistrarProducto]
 @TipoMovimientoStockId INT,@DepositoId INT,@ProductoId INT,
 @Cantidad DECIMAL(18,2),@Motivo VARCHAR(250)=NULL,
 @EntidadOrigen VARCHAR(50)=NULL,@OrigenId INT=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Signo SMALLINT,@Fisico DECIMAL(18,2)=0,@Cupo DECIMAL(18,2)=0,
 @Canal VARCHAR(50),@EsOnline BIT=0,@LockResult INT,@Recurso NVARCHAR(255);
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 53610,'Cantidad invalida.',1;
 IF @DepositoId<>3 THROW 53611,'Los productos terminados usan deposito 3.',1;
 BEGIN TRY
 BEGIN TRAN;
 SET @Recurso=CONCAT(N'TEKA:STOCK:',@ProductoId,N':',@DepositoId);
 EXEC @LockResult=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
 IF @LockResult<0 THROW 53612,'Bloqueo de stock fallido.',1;
 SELECT @Signo=Signo FROM dbo.TipoMovimientoStock WHERE TipoMovimientoStockId=@TipoMovimientoStockId AND Activo=1;
 IF @Signo IS NULL OR @Signo NOT IN(-1,1) THROW 53613,'Tipo de movimiento invalido.',1;
 SELECT @Fisico=CantidadActual FROM dbo.StockProducto WITH(UPDLOCK,HOLDLOCK)
 WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
 SET @Fisico=ISNULL(@Fisico,0);
 SELECT @Cupo=CupoOnline FROM dbo.ProductoDisponibilidadOnline WITH(UPDLOCK,HOLDLOCK)
 WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
 SET @Cupo=ISNULL(@Cupo,0);
 IF @EntidadOrigen IN('Pedido','PedidoCancelacion','PedidoAjusteSalida','PedidoAjusteEntrada')
 BEGIN
  IF @OrigenId IS NULL THROW 53614,'Pedido de origen obligatorio.',1;
  SELECT @Canal=c.Nombre FROM dbo.Pedido p JOIN dbo.CanalVenta c ON c.CanalVentaId=p.CanalVentaId
  WHERE p.PedidoId=@OrigenId;
  IF @Canal IS NULL THROW 53615,'Pedido de origen inexistente.',1;
  SET @EsOnline=CASE WHEN @Canal IN('E-commerce','Ecommerce') THEN 1 ELSE 0 END;
  IF (@EntidadOrigen IN('Pedido','PedidoAjusteSalida') AND @Signo<>-1)
   OR (@EntidadOrigen IN('PedidoCancelacion','PedidoAjusteEntrada') AND @Signo<>1)
   THROW 53616,'Signo incorrecto para el proceso de pedido.',1;
 END;
 IF @Signo=-1
 BEGIN
  IF @Fisico<@Cantidad THROW 53617,'Stock fisico insuficiente.',1;
  IF @EntidadOrigen IN('Pedido','PedidoAjusteSalida') AND @EsOnline=1 AND @Cupo<@Cantidad
   THROW 53618,'Cupo online insuficiente.',1;
  IF NOT(@EntidadOrigen IN('Pedido','PedidoAjusteSalida') AND @EsOnline=1) AND @Fisico-@Cupo<@Cantidad
   THROW 53619,'Disponible presencial insuficiente; reasignar cupo primero.',1;
 END;
 IF @Signo=1 AND @EntidadOrigen IN('PedidoCancelacion','PedidoAjusteEntrada') AND @EsOnline=1
 BEGIN
  IF NOT EXISTS(SELECT 1 FROM dbo.ProductoDisponibilidadOnline WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId)
   THROW 53620,'Falta asignacion online original.',1;
 END;
 IF @Signo=-1 AND @EntidadOrigen='Pedido' AND EXISTS(
  SELECT 1 FROM dbo.MovimientoStock WHERE EntidadOrigen='Pedido' AND OrigenId=@OrigenId
  AND ProductoId=@ProductoId AND DepositoId=@DepositoId)
  THROW 53621,'Salida del pedido ya registrada.',1;
 IF @Signo=1 AND @EntidadOrigen='PedidoCancelacion' AND EXISTS(
  SELECT 1 FROM dbo.MovimientoStock WHERE EntidadOrigen='PedidoCancelacion' AND OrigenId=@OrigenId
  AND ProductoId=@ProductoId AND DepositoId=@DepositoId)
  THROW 53622,'Reposicion del pedido ya registrada.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.StockProducto WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId)
  INSERT dbo.StockProducto(ProductoId,DepositoId,CantidadActual) VALUES(@ProductoId,@DepositoId,0);
 UPDATE dbo.StockProducto SET CantidadActual=CantidadActual+@Signo*@Cantidad
 WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
 IF @EntidadOrigen IN('Pedido','PedidoCancelacion','PedidoAjusteSalida','PedidoAjusteEntrada') AND @EsOnline=1
  UPDATE dbo.ProductoDisponibilidadOnline SET CupoOnline=CupoOnline+@Signo*@Cantidad,
  FechaActualizacion=SYSUTCDATETIME() WHERE ProductoId=@ProductoId AND DepositoId=@DepositoId;
 INSERT dbo.MovimientoStock(FechaMovimiento,TipoMovimientoStockId,DepositoId,ProductoId,InsumoId,
 Cantidad,Motivo,EntidadOrigen,OrigenId,Activo)
 VALUES(GETDATE(),@TipoMovimientoStockId,@DepositoId,@ProductoId,NULL,@Cantidad,@Motivo,@EntidadOrigen,@OrigenId,1);
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_MovimientoStock_RegistrarProductoManual] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_MovimientoStock_RegistrarProductoManual]
 @TipoMovimientoStockId INT,@DepositoId INT,@ProductoId INT,
 @Cantidad DECIMAL(18,2),@Motivo VARCHAR(250)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL THROW 52204,'Motivo obligatorio para ajuste manual.',1;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 52205,'Cantidad de ajuste invalida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.TipoMovimientoStock WHERE TipoMovimientoStockId=@TipoMovimientoStockId
   AND Nombre IN('Ajuste Positivo','Ajuste Negativo') AND Activo=1)
   THROW 52206,'Solo se admiten tipos de ajuste manual activos.',1;
 EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@TipoMovimientoStockId,
  @DepositoId=@DepositoId,@ProductoId=@ProductoId,@Cantidad=@Cantidad,
  @Motivo=@Motivo,@EntidadOrigen='AjusteManual',@OrigenId=NULL;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_NombreInsumoCatalogo_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Procedimiento NUEVO, sin alterar los existentes. Devuelve el formato LookupDTO (Id, Descripcion). */
CREATE   PROCEDURE [dbo].[sp_NombreInsumoCatalogo_GetLookup]
    @TipoInsumoId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF @TipoInsumoId IS NULL OR @TipoInsumoId <= 0
        THROW 51224, 'Debe indicar un tipo de insumo valido.', 1;
    SELECT NombreInsumoId AS Id, Nombre AS Descripcion
    FROM dbo.NombreInsumoCatalogo
    WHERE TipoInsumoId = @TipoInsumoId AND Activo = 1
    ORDER BY Nombre;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_NombreProductoCatalogo_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_NombreProductoCatalogo_GetLookup] @TipoProductoId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT NombreProductoId AS Id, Nombre AS Descripcion
 FROM dbo.NombreProductoCatalogo
 WHERE TipoProductoId=@TipoProductoId AND Activo=1 ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_AsignarResponsable] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadComercial_AsignarResponsable] @OportunidadComercialId INT,@UsuarioResponsableId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioResponsableId AND Activo=1) BEGIN RAISERROR('El usuario responsable no existe o está inactivo.',16,1); RETURN; END;
 UPDATE dbo.OportunidadComercial SET UsuarioResponsableId=@UsuarioResponsableId WHERE OportunidadComercialId=@OportunidadComercialId AND PedidoIdConvertido IS NULL;
 IF @@ROWCOUNT=0 RAISERROR('La oportunidad no existe o ya fue convertida.',16,1);
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_Cancelar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_Cancelar]
    @OportunidadComercialId INT,
    @Observaciones          VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoCanceladaId INT;

    SELECT @EstadoCanceladaId = EstadoOportunidadComercialId
    FROM dbo.EstadoOportunidadComercial
    WHERE Nombre = 'Cancelada';

    IF @EstadoCanceladaId IS NULL
    BEGIN
        RAISERROR('No se encontró el estado Cancelada.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    UPDATE dbo.OportunidadComercial
    SET
        EstadoOportunidadComercialId = @EstadoCanceladaId,
        Probabilidad = 0,
        Activo = 0
    WHERE OportunidadComercialId = @OportunidadComercialId;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('La oportunidad indicada no existe.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    INSERT INTO dbo.HistorialEstadoOportunidad
    (
        OportunidadComercialId, EstadoOportunidadComercialId, FechaCambio, Observaciones
    )
    VALUES
    (
        @OportunidadComercialId, @EstadoCanceladaId, GETDATE(), ISNULL(@Observaciones, 'Oportunidad cancelada')
    );

    COMMIT TRANSACTION;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_ConvertirEnPedido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadComercial_ConvertirEnPedido] @OportunidadComercialId INT,@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @EstadoConvertidaId INT,@EstadoPendientePedidoId INT,@ClienteId INT,@CanalVentaId INT,@ClienteNombre VARCHAR(100),@ClienteApellido VARCHAR(100),@TipoDocumentoId INT,@CondicionIVAId INT,@PedidoId INT,@Total DECIMAL(18,2);
 SELECT @EstadoConvertidaId=EstadoOportunidadComercialId FROM dbo.EstadoOportunidadComercial WHERE Nombre='Convertida';
 SELECT @EstadoPendientePedidoId=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Pendiente';
 SELECT @ClienteId=ClienteId,@CanalVentaId=CanalVentaId,@ClienteNombre=ClienteNombre,@ClienteApellido=ClienteApellido FROM dbo.OportunidadComercial WHERE OportunidadComercialId=@OportunidadComercialId AND PedidoIdConvertido IS NULL;
 IF @CanalVentaId IS NULL BEGIN RAISERROR('La oportunidad no existe o ya fue convertida.',16,1); RETURN; END;
 IF NOT EXISTS(SELECT 1 FROM dbo.OportunidadProducto WHERE OportunidadComercialId=@OportunidadComercialId) BEGIN RAISERROR('La oportunidad debe tener al menos un producto antes de convertirla en pedido.',16,1); RETURN; END;
 IF EXISTS(SELECT 1 FROM dbo.OportunidadProducto op WHERE op.OportunidadComercialId=@OportunidadComercialId AND NOT EXISTS(SELECT 1 FROM dbo.PrecioVenta pv WHERE pv.ProductoId=op.ProductoId AND pv.Activo=1 AND pv.FechaVigenciaDesde<=GETDATE() AND (pv.FechaVigenciaHasta IS NULL OR pv.FechaVigenciaHasta>=GETDATE()))) BEGIN RAISERROR('Uno o más productos no tienen precio vigente.',16,1); RETURN; END;
 SELECT TOP 1 @TipoDocumentoId=TipoDocumentoId FROM dbo.TipoDocumento WHERE Nombre='Consumidor Final' OR CodigoARCA=99 ORDER BY CASE WHEN CodigoARCA=99 THEN 0 ELSE 1 END;
 SELECT TOP 1 @CondicionIVAId=CondicionIVAId FROM dbo.CondicionIVA WHERE Nombre='Consumidor Final' ORDER BY CondicionIVAId;
 IF @TipoDocumentoId IS NULL OR @CondicionIVAId IS NULL BEGIN RAISERROR('Falta configuración fiscal por defecto para crear el cliente.',16,1); RETURN; END;
 BEGIN TRAN;
 IF @ClienteId IS NULL BEGIN
   INSERT dbo.Cliente(Nombre,Apellido,TipoDocumentoId,CondicionIVAId,Observaciones,Activo,FechaAlta) VALUES(@ClienteNombre,@ClienteApellido,@TipoDocumentoId,@CondicionIVAId,'Cliente creado al convertir oportunidad comercial',1,GETDATE()); SET @ClienteId=SCOPE_IDENTITY();
 END;
 CREATE TABLE #Lineas(ProductoId INT,Cantidad DECIMAL(18,2),PrecioUnitario DECIMAL(18,2),Subtotal DECIMAL(18,2));
 INSERT #Lineas
 SELECT op.ProductoId,op.Cantidad,pv.Precio,op.Cantidad*pv.Precio
 FROM dbo.OportunidadProducto op CROSS APPLY(SELECT TOP 1 Precio FROM dbo.PrecioVenta p WHERE p.ProductoId=op.ProductoId AND p.Activo=1 AND p.FechaVigenciaDesde<=GETDATE() AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta>=GETDATE()) ORDER BY p.FechaVigenciaDesde DESC,p.PrecioVentaId DESC)pv
 WHERE op.OportunidadComercialId=@OportunidadComercialId;
 SELECT @Total=SUM(Subtotal) FROM #Lineas;
 INSERT dbo.Pedido(FechaPedido,ClienteId,CanalVentaId,EstadoPedidoId,Total,Observaciones) VALUES(GETDATE(),@ClienteId,@CanalVentaId,@EstadoPendientePedidoId,@Total,ISNULL(@Observaciones,'Pedido generado desde oportunidad comercial')); SET @PedidoId=SCOPE_IDENTITY();
 INSERT dbo.DetallePedido(PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) SELECT @PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal FROM #Lineas;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,Observaciones) VALUES(@PedidoId,@EstadoPendientePedidoId,'Pedido creado desde oportunidad comercial');
 UPDATE dbo.OportunidadComercial SET ClienteId=@ClienteId,EstadoOportunidadComercialId=@EstadoConvertidaId,Probabilidad=100,PedidoIdConvertido=@PedidoId,FechaConversion=GETDATE(),MontoEstimado=@Total,Activo=1 WHERE OportunidadComercialId=@OportunidadComercialId;
 INSERT dbo.HistorialEstadoOportunidad(OportunidadComercialId,EstadoOportunidadComercialId,Observaciones) VALUES(@OportunidadComercialId,@EstadoConvertidaId,CONCAT('Oportunidad convertida en pedido ',@PedidoId));
 COMMIT; SELECT @PedidoId PedidoId,@ClienteId ClienteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_Funnel] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_Funnel]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        eo.EstadoOportunidadComercialId,
        eo.Nombre AS Estado,
        eo.Orden,
        COUNT(o.OportunidadComercialId) AS Cantidad,
        ISNULL(SUM(o.MontoEstimado), 0) AS MontoEstimado
    FROM dbo.EstadoOportunidadComercial eo
    LEFT JOIN dbo.OportunidadComercial o
        ON eo.EstadoOportunidadComercialId = o.EstadoOportunidadComercialId
    WHERE eo.Activo = 1
    GROUP BY eo.EstadoOportunidadComercialId, eo.Nombre, eo.Orden
    ORDER BY eo.Orden;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadComercial_GetAll]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT o.OportunidadComercialId,o.ClienteId,o.ClienteNombre,o.ClienteApellido,o.TipoCliente,o.CanalVentaId,cv.Nombre CanalVentaNombre,o.Interes,
        o.EstadoOportunidadComercialId,eo.Nombre EstadoOportunidadNombre,o.MontoEstimado,o.Probabilidad,o.FechaAlta,o.ProximaAccion,o.FechaProximaAccion,o.Observaciones,
        o.MotivoPerdidaOportunidadId,mp.Nombre MotivoPerdidaNombre,o.ObservacionPerdida,o.FechaPerdida,o.PedidoIdConvertido,o.FechaConversion,o.Activo,
        o.UsuarioResponsableId,CASE WHEN u.UsuarioId IS NULL THEN NULL ELSE LTRIM(RTRIM(CONCAT(u.Nombre,' ',ISNULL(u.Apellido,'')))) END ResponsableNombre,o.InteresComercialId
 FROM dbo.OportunidadComercial o JOIN dbo.CanalVenta cv ON cv.CanalVentaId=o.CanalVentaId JOIN dbo.EstadoOportunidadComercial eo ON eo.EstadoOportunidadComercialId=o.EstadoOportunidadComercialId
 LEFT JOIN dbo.MotivoPerdidaOportunidad mp ON mp.MotivoPerdidaOportunidadId=o.MotivoPerdidaOportunidadId LEFT JOIN dbo.Usuario u ON u.UsuarioId=o.UsuarioResponsableId
 ORDER BY CASE WHEN eo.EsFinal=0 AND o.FechaProximaAccion<CAST(GETDATE() AS DATE) THEN 0 WHEN eo.EsFinal=0 AND o.FechaProximaAccion=CAST(GETDATE() AS DATE) THEN 1 WHEN eo.EsFinal=0 THEN 2 ELSE 3 END,o.FechaProximaAccion,o.FechaAlta DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadComercial_GetById] @OportunidadComercialId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT o.OportunidadComercialId,o.ClienteId,o.ClienteNombre,o.ClienteApellido,o.TipoCliente,o.CanalVentaId,cv.Nombre CanalVentaNombre,o.Interes,o.EstadoOportunidadComercialId,eo.Nombre EstadoOportunidadNombre,
        o.MontoEstimado,o.Probabilidad,o.FechaAlta,o.ProximaAccion,o.FechaProximaAccion,o.Observaciones,o.MotivoPerdidaOportunidadId,mp.Nombre MotivoPerdidaNombre,o.ObservacionPerdida,o.FechaPerdida,
        o.PedidoIdConvertido,o.FechaConversion,o.Activo,o.UsuarioResponsableId,CASE WHEN u.UsuarioId IS NULL THEN NULL ELSE LTRIM(RTRIM(CONCAT(u.Nombre,' ',ISNULL(u.Apellido,'')))) END ResponsableNombre,o.InteresComercialId
 FROM dbo.OportunidadComercial o JOIN dbo.CanalVenta cv ON cv.CanalVentaId=o.CanalVentaId JOIN dbo.EstadoOportunidadComercial eo ON eo.EstadoOportunidadComercialId=o.EstadoOportunidadComercialId
 LEFT JOIN dbo.MotivoPerdidaOportunidad mp ON mp.MotivoPerdidaOportunidadId=o.MotivoPerdidaOportunidadId LEFT JOIN dbo.Usuario u ON u.UsuarioId=o.UsuarioResponsableId WHERE o.OportunidadComercialId=@OportunidadComercialId;
 SELECT h.HistorialEstadoOportunidadId,h.OportunidadComercialId,h.EstadoOportunidadComercialId,eo.Nombre EstadoOportunidadNombre,h.FechaCambio,h.Observaciones FROM dbo.HistorialEstadoOportunidad h JOIN dbo.EstadoOportunidadComercial eo ON eo.EstadoOportunidadComercialId=h.EstadoOportunidadComercialId WHERE h.OportunidadComercialId=@OportunidadComercialId ORDER BY h.FechaCambio DESC,h.HistorialEstadoOportunidadId DESC;
 SELECT v.VisitaOportunidadId,v.OportunidadComercialId,v.FechaVisita,v.TipoVisita,v.ResultadoEsperado,v.Observaciones,v.Activo FROM dbo.VisitaOportunidad v WHERE v.OportunidadComercialId=@OportunidadComercialId ORDER BY v.FechaVisita DESC,v.VisitaOportunidadId DESC;
 SELECT op.OportunidadProductoId,op.ProductoId,p.Nombre ProductoNombre,op.Cantidad,op.PrecioReferencia FROM dbo.OportunidadProducto op JOIN dbo.Producto p ON p.ProductoId=op.ProductoId WHERE op.OportunidadComercialId=@OportunidadComercialId ORDER BY op.OportunidadProductoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_Insert]
    @ClienteId                    INT = NULL,
    @ClienteNombre                VARCHAR(100),
    @ClienteApellido              VARCHAR(100) = NULL,
    @TipoCliente                  VARCHAR(20),
    @CanalVentaId                 INT,
    @Interes                      VARCHAR(150),
    @EstadoOportunidadComercialId INT = NULL,
    @MontoEstimado                DECIMAL(18,2) = 0,
    @Probabilidad                 INT = 0,
    @ProximaAccion                VARCHAR(250) = NULL,
    @FechaProximaAccion           DATE = NULL,
    @Observaciones                VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @OportunidadComercialId INT;

    IF @EstadoOportunidadComercialId IS NULL
    BEGIN
        SELECT @EstadoOportunidadComercialId = EstadoOportunidadComercialId
        FROM dbo.EstadoOportunidadComercial
        WHERE Nombre = 'Nueva';
    END

    IF @EstadoOportunidadComercialId IS NULL
    BEGIN
        RAISERROR('No se encontró el estado inicial para oportunidades.', 16, 1);
        RETURN;
    END

    IF @ClienteNombre IS NULL OR LTRIM(RTRIM(@ClienteNombre)) = ''
    BEGIN
        RAISERROR('El nombre del cliente/prospecto es obligatorio.', 16, 1);
        RETURN;
    END

    IF @TipoCliente NOT IN ('particular', 'empresa')
    BEGIN
        RAISERROR('El tipo de cliente debe ser particular o empresa.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.CanalVenta WHERE CanalVentaId = @CanalVentaId AND Activo = 1)
    BEGIN
        RAISERROR('El canal de venta indicado no existe o está inactivo.', 16, 1);
        RETURN;
    END

    IF @MontoEstimado < 0
    BEGIN
        RAISERROR('El monto estimado no puede ser negativo.', 16, 1);
        RETURN;
    END

    IF @Probabilidad < 0 OR @Probabilidad > 100
    BEGIN
        RAISERROR('La probabilidad debe estar entre 0 y 100.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    INSERT INTO dbo.OportunidadComercial
    (
        ClienteId, ClienteNombre, ClienteApellido, TipoCliente, CanalVentaId, Interes,
        EstadoOportunidadComercialId, MontoEstimado, Probabilidad, FechaAlta,
        ProximaAccion, FechaProximaAccion, Observaciones, Activo
    )
    VALUES
    (
        @ClienteId, @ClienteNombre, @ClienteApellido, @TipoCliente, @CanalVentaId, @Interes,
        @EstadoOportunidadComercialId, @MontoEstimado, @Probabilidad, GETDATE(),
        @ProximaAccion, @FechaProximaAccion, @Observaciones,
        CASE WHEN EXISTS (SELECT 1 FROM dbo.EstadoOportunidadComercial WHERE EstadoOportunidadComercialId = @EstadoOportunidadComercialId AND Nombre IN ('Perdida', 'Cancelada')) THEN 0 ELSE 1 END
    );

    SET @OportunidadComercialId = SCOPE_IDENTITY();

    INSERT INTO dbo.HistorialEstadoOportunidad
    (
        OportunidadComercialId, EstadoOportunidadComercialId, FechaCambio, Observaciones
    )
    VALUES
    (
        @OportunidadComercialId, @EstadoOportunidadComercialId, GETDATE(), 'Oportunidad comercial creada'
    );

    COMMIT TRANSACTION;

    SELECT @OportunidadComercialId AS OportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_MarcarPerdida] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_MarcarPerdida]
    @OportunidadComercialId        INT,
    @MotivoPerdidaOportunidadId    INT,
    @ObservacionPerdida            VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoPerdidaId INT;

    SELECT @EstadoPerdidaId = EstadoOportunidadComercialId
    FROM dbo.EstadoOportunidadComercial
    WHERE Nombre = 'Perdida';

    IF @EstadoPerdidaId IS NULL
    BEGIN
        RAISERROR('No se encontró el estado Perdida.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.MotivoPerdidaOportunidad WHERE MotivoPerdidaOportunidadId = @MotivoPerdidaOportunidadId AND Activo = 1)
    BEGIN
        RAISERROR('El motivo de pérdida indicado no existe o está inactivo.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    UPDATE dbo.OportunidadComercial
    SET
        EstadoOportunidadComercialId = @EstadoPerdidaId,
        Probabilidad = 0,
        MotivoPerdidaOportunidadId = @MotivoPerdidaOportunidadId,
        ObservacionPerdida = @ObservacionPerdida,
        FechaPerdida = GETDATE(),
        Activo = 0
    WHERE OportunidadComercialId = @OportunidadComercialId;

    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('La oportunidad indicada no existe.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    INSERT INTO dbo.HistorialEstadoOportunidad
    (
        OportunidadComercialId, EstadoOportunidadComercialId, FechaCambio, Observaciones
    )
    VALUES
    (
        @OportunidadComercialId, @EstadoPerdidaId, GETDATE(), ISNULL(@ObservacionPerdida, 'Oportunidad marcada como perdida')
    );

    COMMIT TRANSACTION;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_MotivosPerdidaResumen] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_MotivosPerdidaResumen]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        mp.MotivoPerdidaOportunidadId,
        mp.Nombre AS Motivo,
        COUNT(o.OportunidadComercialId) AS Cantidad,
        ISNULL(SUM(o.MontoEstimado), 0) AS MontoEstimado
    FROM dbo.MotivoPerdidaOportunidad mp
    LEFT JOIN dbo.OportunidadComercial o
        ON mp.MotivoPerdidaOportunidadId = o.MotivoPerdidaOportunidadId
    WHERE mp.Activo = 1
    GROUP BY mp.MotivoPerdidaOportunidadId, mp.Nombre
    ORDER BY Cantidad DESC, mp.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_RegistrarVisita] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_RegistrarVisita]
    @OportunidadComercialId INT,
    @FechaVisita            DATETIME,
    @TipoVisita             VARCHAR(30),
    @ResultadoEsperado      VARCHAR(250) = NULL,
    @Observaciones          VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoVisitaId INT;

    SELECT @EstadoVisitaId = EstadoOportunidadComercialId
    FROM dbo.EstadoOportunidadComercial
    WHERE Nombre = 'Visita programada';

    IF @EstadoVisitaId IS NULL
    BEGIN
        RAISERROR('No se encontró el estado Visita programada.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.OportunidadComercial WHERE OportunidadComercialId = @OportunidadComercialId)
    BEGIN
        RAISERROR('La oportunidad indicada no existe.', 16, 1);
        RETURN;
    END

    IF @TipoVisita NOT IN ('Presencial', 'WhatsApp', 'Llamada', 'Videollamada', 'Email')
    BEGIN
        RAISERROR('El tipo de visita indicado no es válido.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    INSERT INTO dbo.VisitaOportunidad
    (
        OportunidadComercialId, FechaVisita, TipoVisita, ResultadoEsperado, Observaciones, Activo
    )
    VALUES
    (
        @OportunidadComercialId, @FechaVisita, @TipoVisita, @ResultadoEsperado, @Observaciones, 1
    );

    UPDATE dbo.OportunidadComercial
    SET
        EstadoOportunidadComercialId = @EstadoVisitaId,
        FechaProximaAccion = CAST(@FechaVisita AS DATE),
        ProximaAccion = ISNULL(@ResultadoEsperado, ProximaAccion),
        Activo = 1
    WHERE OportunidadComercialId = @OportunidadComercialId;

    INSERT INTO dbo.HistorialEstadoOportunidad
    (
        OportunidadComercialId, EstadoOportunidadComercialId, FechaCambio, Observaciones
    )
    VALUES
    (
        @OportunidadComercialId, @EstadoVisitaId, GETDATE(), ISNULL(@Observaciones, 'Visita registrada')
    );

    COMMIT TRANSACTION;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_Resumen] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   6) SPs: PANEL COMERCIAL / REPORTES DE OPORTUNIDADES
========================================================= */

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_Resumen]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(1) AS TotalOportunidades,
        SUM(CASE WHEN eo.Nombre IN ('Nueva', 'En seguimiento', 'Visita programada') THEN 1 ELSE 0 END) AS OportunidadesAbiertas,
        SUM(CASE WHEN eo.Nombre = 'Convertida' THEN 1 ELSE 0 END) AS OportunidadesConvertidas,
        SUM(CASE WHEN eo.Nombre IN ('Perdida', 'Cancelada') THEN 1 ELSE 0 END) AS OportunidadesNoConcretadas,
        ISNULL(SUM(o.MontoEstimado), 0) AS MontoEstimadoTotal,
        ISNULL(SUM(CASE WHEN eo.Nombre IN ('Nueva', 'En seguimiento', 'Visita programada') THEN o.MontoEstimado ELSE 0 END), 0) AS MontoAbierto,
        ISNULL(SUM(CASE WHEN eo.Nombre = 'Convertida' THEN o.MontoEstimado ELSE 0 END), 0) AS MontoConvertido,
        CAST(
            CASE
                WHEN COUNT(1) = 0 THEN 0
                ELSE (SUM(CASE WHEN eo.Nombre = 'Convertida' THEN 1 ELSE 0 END) * 100.0) / COUNT(1)
            END AS DECIMAL(5,2)
        ) AS TasaConversion
    FROM dbo.OportunidadComercial o
    INNER JOIN dbo.EstadoOportunidadComercial eo
        ON o.EstadoOportunidadComercialId = eo.EstadoOportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadComercial_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_OportunidadComercial_Update]
    @OportunidadComercialId       INT,
    @ClienteId                    INT = NULL,
    @ClienteNombre                VARCHAR(100),
    @ClienteApellido              VARCHAR(100) = NULL,
    @TipoCliente                  VARCHAR(20),
    @CanalVentaId                 INT,
    @Interes                      VARCHAR(150),
    @EstadoOportunidadComercialId INT,
    @MontoEstimado                DECIMAL(18,2) = 0,
    @Probabilidad                 INT = 0,
    @ProximaAccion                VARCHAR(250) = NULL,
    @FechaProximaAccion           DATE = NULL,
    @Observaciones                VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EstadoActualId INT;
    DECLARE @EstadoNombre VARCHAR(50);

    SELECT @EstadoActualId = EstadoOportunidadComercialId
    FROM dbo.OportunidadComercial
    WHERE OportunidadComercialId = @OportunidadComercialId;

    IF @EstadoActualId IS NULL
    BEGIN
        RAISERROR('La oportunidad indicada no existe.', 16, 1);
        RETURN;
    END

    IF @ClienteNombre IS NULL OR LTRIM(RTRIM(@ClienteNombre)) = ''
    BEGIN
        RAISERROR('El nombre del cliente/prospecto es obligatorio.', 16, 1);
        RETURN;
    END

    IF @TipoCliente NOT IN ('particular', 'empresa')
    BEGIN
        RAISERROR('El tipo de cliente debe ser particular o empresa.', 16, 1);
        RETURN;
    END

    IF @MontoEstimado < 0
    BEGIN
        RAISERROR('El monto estimado no puede ser negativo.', 16, 1);
        RETURN;
    END

    IF @Probabilidad < 0 OR @Probabilidad > 100
    BEGIN
        RAISERROR('La probabilidad debe estar entre 0 y 100.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.EstadoOportunidadComercial WHERE EstadoOportunidadComercialId = @EstadoOportunidadComercialId AND Activo = 1)
    BEGIN
        RAISERROR('El estado de oportunidad indicado no existe o está inactivo.', 16, 1);
        RETURN;
    END

    SELECT @EstadoNombre = Nombre
    FROM dbo.EstadoOportunidadComercial
    WHERE EstadoOportunidadComercialId = @EstadoOportunidadComercialId;

    BEGIN TRANSACTION;

    UPDATE dbo.OportunidadComercial
    SET
        ClienteId = @ClienteId,
        ClienteNombre = @ClienteNombre,
        ClienteApellido = @ClienteApellido,
        TipoCliente = @TipoCliente,
        CanalVentaId = @CanalVentaId,
        Interes = @Interes,
        EstadoOportunidadComercialId = @EstadoOportunidadComercialId,
        MontoEstimado = @MontoEstimado,
        Probabilidad = CASE WHEN @EstadoNombre IN ('Perdida', 'Cancelada') THEN 0 ELSE @Probabilidad END,
        ProximaAccion = @ProximaAccion,
        FechaProximaAccion = @FechaProximaAccion,
        Observaciones = @Observaciones,
        Activo = CASE WHEN @EstadoNombre IN ('Perdida', 'Cancelada') THEN 0 ELSE 1 END
    WHERE OportunidadComercialId = @OportunidadComercialId;

    IF @EstadoActualId <> @EstadoOportunidadComercialId
    BEGIN
        INSERT INTO dbo.HistorialEstadoOportunidad
        (
            OportunidadComercialId, EstadoOportunidadComercialId, FechaCambio, Observaciones
        )
        VALUES
        (
            @OportunidadComercialId, @EstadoOportunidadComercialId, GETDATE(), 'Cambio de estado por edición de oportunidad'
        );
    END

    COMMIT TRANSACTION;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadProducto_Eliminar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadProducto_Eliminar] @OportunidadComercialId INT,@ProductoId INT
AS
BEGIN
 SET NOCOUNT ON; DELETE dbo.OportunidadProducto WHERE OportunidadComercialId=@OportunidadComercialId AND ProductoId=@ProductoId;
 UPDATE o SET MontoEstimado=ISNULL(x.Total,0) FROM dbo.OportunidadComercial o OUTER APPLY(SELECT SUM(op.Cantidad*ISNULL(op.PrecioReferencia,0)) Total FROM dbo.OportunidadProducto op WHERE op.OportunidadComercialId=o.OportunidadComercialId)x WHERE o.OportunidadComercialId=@OportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OportunidadProducto_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_OportunidadProducto_Guardar] @OportunidadComercialId INT,@ProductoId INT,@Cantidad DECIMAL(18,2)
AS
BEGIN
 SET NOCOUNT ON;
 IF @Cantidad<=0 BEGIN RAISERROR('La cantidad debe ser mayor a cero.',16,1); RETURN; END;
 IF NOT EXISTS(SELECT 1 FROM dbo.OportunidadComercial WHERE OportunidadComercialId=@OportunidadComercialId AND PedidoIdConvertido IS NULL) BEGIN RAISERROR('La oportunidad no existe o ya fue convertida.',16,1); RETURN; END;
 DECLARE @Precio DECIMAL(18,2); SELECT TOP 1 @Precio=Precio FROM dbo.PrecioVenta WHERE ProductoId=@ProductoId AND Activo=1 AND FechaVigenciaDesde<=GETDATE() AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta>=GETDATE()) ORDER BY FechaVigenciaDesde DESC,PrecioVentaId DESC;
 IF @Precio IS NULL BEGIN RAISERROR('El producto no tiene precio vigente.',16,1); RETURN; END;
 MERGE dbo.OportunidadProducto T USING(SELECT @OportunidadComercialId OportunidadComercialId,@ProductoId ProductoId) S ON T.OportunidadComercialId=S.OportunidadComercialId AND T.ProductoId=S.ProductoId
 WHEN MATCHED THEN UPDATE SET Cantidad=@Cantidad,PrecioReferencia=@Precio
 WHEN NOT MATCHED THEN INSERT(OportunidadComercialId,ProductoId,Cantidad,PrecioReferencia) VALUES(@OportunidadComercialId,@ProductoId,@Cantidad,@Precio);
 UPDATE o SET MontoEstimado=x.Total FROM dbo.OportunidadComercial o CROSS APPLY(SELECT SUM(op.Cantidad*ISNULL(op.PrecioReferencia,0)) Total FROM dbo.OportunidadProducto op WHERE op.OportunidadComercialId=o.OportunidadComercialId)x WHERE o.OportunidadComercialId=@OportunidadComercialId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_OrdenProduccion_Cancelar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_OrdenProduccion_Cancelar]
 @OrdenProduccionId INT,@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Pendiente INT=(SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre='Pendiente'),
         @Cancelada INT=(SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre='Cancelada');
 BEGIN TRY
  BEGIN TRAN;
  UPDATE dbo.OrdenProduccion WITH(UPDLOCK) SET EstadoOrdenProduccionId=@Cancelada
  WHERE OrdenProduccionId=@OrdenProduccionId AND EstadoOrdenProduccionId=@Pendiente;
  IF @@ROWCOUNT<>1 THROW 58046,'Solo se permite cancelar OP pendientes sin consumo.',1;
  INSERT dbo.HistorialEstadoOrdenProduccion(OrdenProduccionId,EstadoOrdenProduccionId,FechaCambio,Observaciones)
  VALUES(@OrdenProduccionId,@Cancelada,GETDATE(),COALESCE(@Observaciones,'OP pendiente cancelada'));
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_OrdenProduccion_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Consultas vigentes: se conserva el nombre para compatibilidad.
   GetAll = resumen con cantidad de modelos; GetById = cabecera + detalle
   en dos conjuntos de resultados, sin asumir un solo producto por OP. */
CREATE   PROCEDURE [dbo].[sp_OrdenProduccion_GetAll]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT op.OrdenProduccionId,op.TipoProduccionId,op.EstadoOrdenProduccionId,
        e.Nombre AS Estado,op.FechaCreacion,op.FechaInicio,op.FechaFin,
        op.Observaciones,
        COUNT(d.OrdenProduccionDetalleId) AS CantidadModelos,
        COALESCE(SUM(d.CantidadPlanificada),0) AS CantidadTotalPlanificada
 FROM dbo.OrdenProduccion op
 JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=op.EstadoOrdenProduccionId
 LEFT JOIN dbo.OrdenProduccionDetalle d ON d.OrdenProduccionId=op.OrdenProduccionId
 GROUP BY op.OrdenProduccionId,op.TipoProduccionId,op.EstadoOrdenProduccionId,
          e.Nombre,op.FechaCreacion,op.FechaInicio,op.FechaFin,op.Observaciones
 ORDER BY op.OrdenProduccionId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_OrdenProduccion_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_OrdenProduccion_GetById] @OrdenProduccionId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.OrdenProduccion WHERE OrdenProduccionId=@OrdenProduccionId)
  THROW 59501,'Orden de produccion inexistente.',1;
 SELECT op.OrdenProduccionId,op.TipoProduccionId,op.EstadoOrdenProduccionId,
        e.Nombre AS Estado,op.FechaCreacion,op.FechaInicio,op.FechaFin,
        op.Observaciones
 FROM dbo.OrdenProduccion op
 JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=op.EstadoOrdenProduccionId
 WHERE op.OrdenProduccionId=@OrdenProduccionId;
 SELECT d.OrdenProduccionDetalleId,d.OrdenProduccionId,d.ProductoId,
        p.Codigo AS ProductoCodigo,p.Nombre AS ProductoNombre,
        d.ListaMaterialesId,d.CantidadPlanificada,d.ProductoCircularId,
        COALESCE((SELECT SUM(r.CantidadIngresada) FROM dbo.ResultadoProduccion r
                  WHERE r.OrdenProduccionId=d.OrdenProduccionId AND r.ProductoId=d.ProductoId),0) AS CantidadProducida
 FROM dbo.OrdenProduccionDetalle d
 JOIN dbo.Producto p ON p.ProductoId=d.ProductoId
 WHERE d.OrdenProduccionId=@OrdenProduccionId
 ORDER BY d.OrdenProduccionDetalleId;
 SELECT rp.RecorteId,rp.CantidadPlanificada
 FROM dbo.OrdenProduccionRecortePlan rp
 WHERE rp.OrdenProduccionId=@OrdenProduccionId ORDER BY rp.RecorteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_PanelComercial_ResumenMensual] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_PanelComercial_ResumenMensual]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @InicioMesActual DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    DECLARE @InicioMesSiguiente DATE = DATEADD(MONTH, 1, @InicioMesActual);
    DECLARE @InicioMesAnterior DATE = DATEADD(MONTH, -1, @InicioMesActual);

    ;WITH PedidosMes AS
    (
        SELECT
            SUM(CASE WHEN p.FechaPedido >= @InicioMesActual AND p.FechaPedido < @InicioMesSiguiente THEN 1 ELSE 0 END) AS PedidosMesActual,
            SUM(CASE WHEN p.FechaPedido >= @InicioMesAnterior AND p.FechaPedido < @InicioMesActual THEN 1 ELSE 0 END) AS PedidosMesAnterior,
            ISNULL(SUM(CASE WHEN p.FechaPedido >= @InicioMesActual AND p.FechaPedido < @InicioMesSiguiente AND ep.Nombre IN ('Confirmado', 'En Produccion', 'Listo para Entrega', 'Entregado') THEN p.Total ELSE 0 END), 0) AS TotalVendidoActual,
            ISNULL(SUM(CASE WHEN p.FechaPedido >= @InicioMesAnterior AND p.FechaPedido < @InicioMesActual AND ep.Nombre IN ('Confirmado', 'En Produccion', 'Listo para Entrega', 'Entregado') THEN p.Total ELSE 0 END), 0) AS TotalVendidoAnterior
        FROM dbo.Pedido p
        INNER JOIN dbo.EstadoPedido ep ON p.EstadoPedidoId = ep.EstadoPedidoId
    ),
    OportunidadesMes AS
    (
        SELECT
            SUM(CASE WHEN o.FechaAlta >= @InicioMesActual AND o.FechaAlta < @InicioMesSiguiente AND eo.Nombre IN ('Nueva', 'En seguimiento', 'Visita programada') THEN 1 ELSE 0 END) AS OportunidadesAbiertasActual,
            SUM(CASE WHEN o.FechaAlta >= @InicioMesAnterior AND o.FechaAlta < @InicioMesActual AND eo.Nombre IN ('Nueva', 'En seguimiento', 'Visita programada') THEN 1 ELSE 0 END) AS OportunidadesAbiertasAnterior,
            SUM(CASE WHEN o.FechaAlta >= @InicioMesActual AND o.FechaAlta < @InicioMesSiguiente AND eo.Nombre IN ('Perdida', 'Cancelada') THEN 1 ELSE 0 END) AS NoConcretadasActual,
            SUM(CASE WHEN o.FechaAlta >= @InicioMesAnterior AND o.FechaAlta < @InicioMesActual AND eo.Nombre IN ('Perdida', 'Cancelada') THEN 1 ELSE 0 END) AS NoConcretadasAnterior
        FROM dbo.OportunidadComercial o
        INNER JOIN dbo.EstadoOportunidadComercial eo ON o.EstadoOportunidadComercialId = eo.EstadoOportunidadComercialId
    )
    SELECT
        ISNULL(pm.PedidosMesActual, 0) AS PedidosMes,
        CAST(CASE WHEN ISNULL(pm.PedidosMesAnterior, 0) = 0 THEN 0 ELSE ((ISNULL(pm.PedidosMesActual, 0) - pm.PedidosMesAnterior) * 100.0) / pm.PedidosMesAnterior END AS DECIMAL(8,2)) AS VariacionPedidosPorcentaje,
        ISNULL(pm.TotalVendidoActual, 0) AS TotalVendido,
        CAST(CASE WHEN ISNULL(pm.TotalVendidoAnterior, 0) = 0 THEN 0 ELSE ((ISNULL(pm.TotalVendidoActual, 0) - pm.TotalVendidoAnterior) * 100.0) / pm.TotalVendidoAnterior END AS DECIMAL(8,2)) AS VariacionTotalVendidoPorcentaje,
        ISNULL(om.OportunidadesAbiertasActual, 0) AS OportunidadesAbiertas,
        CAST(CASE WHEN ISNULL(om.OportunidadesAbiertasAnterior, 0) = 0 THEN 0 ELSE ((ISNULL(om.OportunidadesAbiertasActual, 0) - om.OportunidadesAbiertasAnterior) * 100.0) / om.OportunidadesAbiertasAnterior END AS DECIMAL(8,2)) AS VariacionOportunidadesAbiertasPorcentaje,
        ISNULL(om.NoConcretadasActual, 0) AS NoConcretadas,
        CAST(CASE WHEN ISNULL(om.NoConcretadasAnterior, 0) = 0 THEN 0 ELSE ((ISNULL(om.NoConcretadasActual, 0) - om.NoConcretadasAnterior) * 100.0) / om.NoConcretadasAnterior END AS DECIMAL(8,2)) AS VariacionNoConcretadasPorcentaje
    FROM PedidosMes pm
    CROSS JOIN OportunidadesMes om;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_ActualizarDetalle] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Pedido_ActualizarDetalle]
 @DetallePedidoId INT,@Cantidad DECIMAL(18,2)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 55102,'Cantidad invalida.',1;
 DECLARE @PedidoId INT,@ProductoId INT,@Anterior DECIMAL(18,2),@Precio DECIMAL(18,2),@Delta DECIMAL(18,2),@CantidadMovimiento DECIMAL(18,2),@Tipo INT,@Origen VARCHAR(50);
 BEGIN TRY BEGIN TRAN;
 SELECT @PedidoId=PedidoId,@ProductoId=ProductoId,@Anterior=Cantidad,@Precio=PrecioUnitario
 FROM dbo.DetallePedido WHERE DetallePedidoId=@DetallePedidoId;
 IF @PedidoId IS NULL THROW 55106,'Detalle inexistente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Pedido WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId)
  THROW 55103,'Pedido inexistente.',1;
 SELECT @Anterior=Cantidad,@Precio=PrecioUnitario FROM dbo.DetallePedido WITH(UPDLOCK,HOLDLOCK)
 WHERE DetallePedidoId=@DetallePedidoId;
 EXEC dbo.sp_TEKA_PedidoManual_ValidarEdicion @PedidoId;
 SET @Delta=@Cantidad-@Anterior;
 IF @Delta<>0
 BEGIN
  SELECT TOP(1) @Tipo=TipoMovimientoStockId FROM dbo.TipoMovimientoStock
  WHERE Nombre=CASE WHEN @Delta>0 THEN 'Salida' ELSE 'Entrada' END AND Activo=1 ORDER BY TipoMovimientoStockId;
  IF @Tipo IS NULL THROW 55107,'Falta tipo de movimiento.',1;
  SET @Origen=CASE WHEN @Delta>0 THEN 'PedidoAjusteSalida' ELSE 'PedidoAjusteEntrada' END;
  SET @CantidadMovimiento=ABS(@Delta);
  EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Tipo,@DepositoId=3,
  @ProductoId=@ProductoId,@Cantidad=@CantidadMovimiento,@Motivo='Cambio de cantidad de pedido',@EntidadOrigen=@Origen,@OrigenId=@PedidoId;
  UPDATE dbo.DetallePedido SET Cantidad=@Cantidad,Subtotal=@Cantidad*@Precio WHERE DetallePedidoId=@DetallePedidoId;
  UPDATE dbo.Pedido SET Total=(SELECT SUM(Subtotal) FROM dbo.DetallePedido WHERE PedidoId=@PedidoId) WHERE PedidoId=@PedidoId;
  INSERT dbo.AuditoriaEdicionPedido(PedidoId,DetallePedidoId,ProductoId,Operacion,CantidadAnterior,CantidadNueva)
  VALUES(@PedidoId,@DetallePedidoId,@ProductoId,'Modificar',@Anterior,@Cantidad);
 END;
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_AgregarDetalle] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Agregar producto a pedido existente. Si ya existe, suma cantidad. */
CREATE   PROCEDURE [dbo].[sp_Pedido_AgregarDetalle]
 @PedidoId INT,@ProductoId INT,@Cantidad DECIMAL(18,2)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Cantidad IS NULL OR @Cantidad<=0 THROW 55102,'Cantidad invalida.',1;
 DECLARE @Precio DECIMAL(18,2),@DetallePedidoId INT,@Anterior DECIMAL(18,2)=0,@Salida INT;
 BEGIN TRY BEGIN TRAN;
 IF NOT EXISTS(SELECT 1 FROM dbo.Pedido WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId)
  THROW 55103,'Pedido inexistente.',1;
 EXEC dbo.sp_TEKA_PedidoManual_ValidarEdicion @PedidoId;
 SELECT TOP(1) @Precio=Precio FROM dbo.PrecioVenta WHERE ProductoId=@ProductoId AND Activo=1
 AND FechaVigenciaDesde<=GETDATE() AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta>=GETDATE())
 ORDER BY FechaVigenciaDesde DESC,PrecioVentaId DESC;
 IF @Precio IS NULL THROW 55104,'Producto sin precio vigente.',1;
 SELECT @DetallePedidoId=DetallePedidoId,@Anterior=Cantidad,@Precio=PrecioUnitario
 FROM dbo.DetallePedido WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND ProductoId=@ProductoId;
 SELECT TOP(1) @Salida=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Salida' AND Activo=1 ORDER BY TipoMovimientoStockId;
 IF @Salida IS NULL THROW 55105,'Falta tipo Salida.',1;
 EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Salida,@DepositoId=3,
 @ProductoId=@ProductoId,@Cantidad=@Cantidad,@Motivo='Ampliacion de pedido',@EntidadOrigen='PedidoAjusteSalida',@OrigenId=@PedidoId;
 IF @DetallePedidoId IS NULL
 BEGIN
  INSERT dbo.DetallePedido(PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal)
  VALUES(@PedidoId,@ProductoId,@Cantidad,@Precio,@Cantidad*@Precio);
  SET @DetallePedidoId=CONVERT(INT,SCOPE_IDENTITY());
 END
 ELSE UPDATE dbo.DetallePedido SET Cantidad=Cantidad+@Cantidad,Subtotal=(Cantidad+@Cantidad)*PrecioUnitario
 WHERE DetallePedidoId=@DetallePedidoId;
 UPDATE dbo.Pedido SET Total=(SELECT SUM(Subtotal) FROM dbo.DetallePedido WHERE PedidoId=@PedidoId) WHERE PedidoId=@PedidoId;
 INSERT dbo.AuditoriaEdicionPedido(PedidoId,DetallePedidoId,ProductoId,Operacion,CantidadAnterior,CantidadNueva)
 VALUES(@PedidoId,@DetallePedidoId,@ProductoId,'Agregar',@Anterior,@Anterior+@Cantidad);
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_Cancelar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Pedido_Cancelar]
 @PedidoId int,@Observaciones varchar(250)=NULL,@UsuarioId int=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Estado varchar(50),@Cliente int,@Cancelado int,@Entrada int,@Producto int,@Deposito int,
 @Cantidad decimal(18,2),@SaldoCC decimal(28,2),@TipoCC int,@Lock int,@Recurso nvarchar(255),@Motivo varchar(250);
 SET @Motivo=NULLIF(LTRIM(RTRIM(@Observaciones)),'');
 IF @PedidoId IS NULL OR @PedidoId<=0 OR @UsuarioId IS NULL OR @UsuarioId<=0 THROW 53840,'Pedido y responsable obligatorios.',1;
 IF @Motivo IS NULL THROW 53841,'Motivo de cancelacion obligatorio.',1;
 BEGIN TRY
 BEGIN TRAN;
 SET @Recurso=CONCAT(N'TEKA:B4:PEDIDO:',@PedidoId);
 EXEC @Lock=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
 IF @Lock<0 THROW 53805,'No se pudo bloquear el pedido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 53806,'Responsable inexistente o inactivo.',1;
 SELECT @Estado=e.Nombre,@Cliente=p.ClienteId
 FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
 IF @Estado IS NULL THROW 53809,'Pedido inexistente.',1;
 IF @Estado NOT IN('Pendiente','Confirmado','En Produccion','Listo para Entrega','Cancelado')
  THROW 53842,'Solo se cancelan pedidos anteriores a la entrega y sin cobros confirmados.',1;
 IF EXISTS(SELECT 1 FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND (Entregado=1 OR FechaEntrega IS NOT NULL))
  THROW 53843,'Existe una entrega registrada; corresponde revisar una anulacion integral.',1;
 IF EXISTS(SELECT 1 FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoCobro e ON e.EstadoCobroId=c.EstadoCobroId WHERE c.PedidoId=@PedidoId AND e.Nombre='Confirmado')
  THROW 53844,'El pedido tiene cobros confirmados. La devolucion de senas antes de la entrega esta pendiente y fuera de este circuito.',1;
 IF EXISTS(SELECT 1 FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoCobro e ON e.EstadoCobroId=c.EstadoCobroId WHERE c.PedidoId=@PedidoId AND e.Nombre<>'Anulado')
  THROW 53845,'Hay cobros pendientes: resolverlos antes de cancelar.',1;
 IF EXISTS(SELECT 1 FROM dbo.Comprobante WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND EstadoComprobante='EMITIDO')
  OR EXISTS(SELECT 1 FROM dbo.DevolucionVentaIntegral WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId)
  THROW 53846,'Hay documentos emitidos o una devolucion previa incompatibles con la cancelacion. No se regularizan automaticamente.',1;
 SELECT @Cancelado=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Cancelado';
 IF @Cancelado IS NULL THROW 53817,'Falta estado Cancelado.',1;
 IF @Estado='Cancelado'
 BEGIN
  /* Reintento sin nuevas entradas: acepta cancelaciones V1 correctas y las nuevas V2.
     Nunca recupera una anulacion como si fuera una cancelacion. */
  IF NOT EXISTS(SELECT 1 FROM dbo.HistorialEstadoPedido WHERE PedidoId=@PedidoId AND EstadoPedidoId=@Cancelado AND UsuarioId IS NOT NULL
    AND (Observaciones=@Motivo OR Observaciones=LEFT(CONCAT('Anulacion segura: ',@Motivo),250)))
   THROW 53847,'Pedido ya cancelado; motivo o historial no coinciden.',1;
  COMMIT; RETURN;
 END;
 DECLARE @Restituir TABLE(ProductoId int,DepositoId int,Cantidad decimal(18,2),PRIMARY KEY(ProductoId,DepositoId));
 IF EXISTS(SELECT 1 FROM dbo.MovimientoStock WITH(UPDLOCK,HOLDLOCK) WHERE OrigenId=@PedidoId AND EntidadOrigen='PedidoCancelacion')
   THROW 53819,'Hay reposicion previa sin cierre de la cancelacion: conciliar antes de continuar.',1;
 INSERT @Restituir
 SELECT m.ProductoId,m.DepositoId,-SUM(CONVERT(decimal(28,2),m.Cantidad)*t.Signo)
 FROM dbo.MovimientoStock m WITH(UPDLOCK,HOLDLOCK) JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
 WHERE m.OrigenId=@PedidoId AND m.EntidadOrigen IN('Pedido','PedidoAjusteSalida','PedidoAjusteEntrada') AND m.Activo=1
 GROUP BY m.ProductoId,m.DepositoId HAVING SUM(CONVERT(decimal(28,2),m.Cantidad)*t.Signo)<>0;
 IF EXISTS(SELECT 1 FROM @Restituir WHERE Cantidad<=0 OR ProductoId IS NULL) THROW 53827,'Libro de stock inconsistente.',1;
 IF EXISTS(SELECT 1 FROM @Restituir) AND EXISTS(
  SELECT 1 FROM (SELECT ProductoId,SUM(Cantidad) Cantidad FROM @Restituir GROUP BY ProductoId) s
   FULL JOIN (SELECT ProductoId,SUM(Cantidad) Cantidad FROM dbo.DetallePedido WHERE PedidoId=@PedidoId GROUP BY ProductoId) d ON d.ProductoId=s.ProductoId
  WHERE ISNULL(s.Cantidad,0)<>ISNULL(d.Cantidad,0))
   THROW 53828,'El detalle no concilia con las salidas netas: no se repondra stock estimado.',1;
 IF @Estado IN('Confirmado','Entregado') AND NOT EXISTS(SELECT 1 FROM @Restituir) THROW 53821,'Falta salida original de stock; requiere conciliacion.',1;
 SELECT @Entrada=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Devolucion Cliente' AND Signo=1 AND Activo=1;
 IF EXISTS(SELECT 1 FROM @Restituir) AND @Entrada IS NULL THROW 53817,'Falta tipo Devolucion Cliente.',1;
 /* El registrador central actual solo admite deposito 3. No se cambia esa regla aqui:
    si un historico descontó otro deposito, la llamada con su deposito real falla y revierte todo. */
 DECLARE devolucionStock CURSOR LOCAL FAST_FORWARD FOR SELECT ProductoId,DepositoId,Cantidad FROM @Restituir ORDER BY ProductoId,DepositoId;
 OPEN devolucionStock; FETCH NEXT FROM devolucionStock INTO @Producto,@Deposito,@Cantidad;
 WHILE @@FETCH_STATUS=0
 BEGIN
  EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Entrada,@DepositoId=@Deposito,@ProductoId=@Producto,@Cantidad=@Cantidad,
   @Motivo=@Motivo,@EntidadOrigen='PedidoCancelacion',@OrigenId=@PedidoId;
  FETCH NEXT FROM devolucionStock INTO @Producto,@Deposito,@Cantidad;
 END;
 CLOSE devolucionStock; DEALLOCATE devolucionStock;
 /* Cancelar la deuda comercial, no los cobros historicos. Ajuste de saldo no es salida de dinero. */
 IF EXISTS(SELECT 1 FROM dbo.MovimientoCuentaCorrienteCliente WHERE PedidoId=@PedidoId AND ClienteId<>@Cliente)
  THROW 53831,'Cuenta corriente asociada a otro cliente: revisar.',1;
 SELECT @SaldoCC=COALESCE(SUM(CONVERT(decimal(28,2),m.Importe)*t.Signo),0)
 FROM dbo.MovimientoCuentaCorrienteCliente m WITH(UPDLOCK,HOLDLOCK) JOIN dbo.TipoMovimientoCuentaCorriente t ON t.TipoMovimientoCuentaCorrienteId=m.TipoMovimientoCuentaCorrienteId
 WHERE m.PedidoId=@PedidoId;
 IF @SaldoCC<>0
 BEGIN
  SELECT @TipoCC=TipoMovimientoCuentaCorrienteId FROM dbo.TipoMovimientoCuentaCorriente
   WHERE Nombre=CASE WHEN @SaldoCC>0 THEN 'Ajuste acreedor' ELSE 'Ajuste deudor' END AND Activo=1 AND Signo=CASE WHEN @SaldoCC>0 THEN -1 ELSE 1 END;
  IF @TipoCC IS NULL THROW 53817,'Falta tipo de ajuste de cuenta corriente.',1;
  INSERT dbo.MovimientoCuentaCorrienteCliente(ClienteId,TipoMovimientoCuentaCorrienteId,FechaMovimiento,PedidoId,ComprobanteId,Importe,Observaciones)
   VALUES(@Cliente,@TipoCC,GETDATE(),@PedidoId,NULL,ABS(@SaldoCC),CONCAT('Anulacion pedido; compensacion de saldo, sin pago nuevo: ',@Motivo));
 END;
 UPDATE dbo.Pedido SET EstadoPedidoId=@Cancelado WHERE PedidoId=@PedidoId;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones,UsuarioId)
 VALUES(@PedidoId,@Cancelado,GETDATE(),@Motivo,@UsuarioId);
 COMMIT;
 END TRY BEGIN CATCH
  IF CURSOR_STATUS('local','devolucionStock')>=0 CLOSE devolucionStock;
  IF CURSOR_STATUS('local','devolucionStock')>=-1 DEALLOCATE devolucionStock;
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_ConfirmarPagado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Pedido_ConfirmarPagado]
@PedidoId INT,@DepositoId INT,@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Estado VARCHAR(50),@Confirmado INT,@Salida INT,@ProductoId INT,@Cantidad DECIMAL(18,2);
 BEGIN TRY
 BEGIN TRAN;
 SELECT @Estado=e.Nombre FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
 JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
 IF @Estado IS NULL THROW 53630,'Pedido inexistente.',1;
 IF @Estado<>'Pendiente' THROW 53631,'Pedido no pendiente o ya confirmado.',1;
 IF @DepositoId<>3 THROW 53632,'Deposito de productos terminados debe ser 3.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.DetallePedido WHERE PedidoId=@PedidoId)
  THROW 53633,'Pedido sin detalles.',1;
 SELECT @Confirmado=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Confirmado';
 SELECT TOP(1) @Salida=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Salida' AND Activo=1 ORDER BY TipoMovimientoStockId;
 IF @Confirmado IS NULL OR @Salida IS NULL THROW 53634,'Catalogos incompletos.',1;
 DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
 SELECT ProductoId,SUM(Cantidad) FROM dbo.DetallePedido WHERE PedidoId=@PedidoId
 GROUP BY ProductoId ORDER BY ProductoId;
 OPEN cur; FETCH NEXT FROM cur INTO @ProductoId,@Cantidad;
 WHILE @@FETCH_STATUS=0
 BEGIN
  EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Salida,
  @DepositoId=@DepositoId,@ProductoId=@ProductoId,@Cantidad=@Cantidad,
  @Motivo='Confirmacion comercial de pedido',@EntidadOrigen='Pedido',@OrigenId=@PedidoId;
  FETCH NEXT FROM cur INTO @ProductoId,@Cantidad;
 END;
 CLOSE cur; DEALLOCATE cur;
 UPDATE dbo.Pedido SET EstadoPedidoId=@Confirmado WHERE PedidoId=@PedidoId;
 /* Cargo comercial inicial: una vez por pedido confirmado. */
 DECLARE @ClienteCargoId INT,@TotalCargo DECIMAL(18,2),@TipoCargoId INT;
 SELECT @ClienteCargoId=ClienteId,@TotalCargo=Total FROM dbo.Pedido WHERE PedidoId=@PedidoId;
 SELECT @TipoCargoId=TipoMovimientoCuentaCorrienteId FROM dbo.TipoMovimientoCuentaCorriente
 WHERE Nombre='Cargo por venta';
 IF @TipoCargoId IS NULL OR @TotalCargo IS NULL OR @TotalCargo<=0
   THROW 53635,'No se pudo determinar el cargo comercial del pedido.',1;
 IF EXISTS(SELECT 1 FROM dbo.MovimientoCuentaCorrienteCliente WITH(UPDLOCK,HOLDLOCK)
   WHERE PedidoId=@PedidoId AND TipoMovimientoCuentaCorrienteId=@TipoCargoId)
   THROW 53636,'El pedido ya tiene cargo comercial en cuenta corriente.',1;
 EXEC dbo.sp_MovimientoCuentaCorrienteCliente_Registrar
  @ClienteId=@ClienteCargoId,@TipoMovimientoCuentaCorrienteId=@TipoCargoId,
  @PedidoId=@PedidoId,@Importe=@TotalCargo,
  @Observaciones='Cargo comercial por confirmacion de pedido';

 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones)
 VALUES(@PedidoId,@Confirmado,GETDATE(),ISNULL(@Observaciones,'Confirmado con descuento de stock; cobro independiente'));
 COMMIT;
 END TRY BEGIN CATCH
 IF CURSOR_STATUS('local','cur')>=0 CLOSE cur;
 IF CURSOR_STATUS('local','cur')>=-1 DEALLOCATE cur;
 IF @@TRANCOUNT>0 ROLLBACK; THROW;
 END CATCH;
END;


GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_EliminarDetalle] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Pedido_EliminarDetalle] @DetallePedidoId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @PedidoId INT,@ProductoId INT,@Cantidad DECIMAL(18,2),@Entrada INT;
 BEGIN TRY BEGIN TRAN;
 SELECT @PedidoId=PedidoId FROM dbo.DetallePedido WHERE DetallePedidoId=@DetallePedidoId;
 IF @PedidoId IS NULL THROW 55106,'Detalle inexistente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Pedido WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId)
  THROW 55103,'Pedido inexistente.',1;
 SELECT @ProductoId=ProductoId,@Cantidad=Cantidad FROM dbo.DetallePedido WITH(UPDLOCK,HOLDLOCK)
 WHERE DetallePedidoId=@DetallePedidoId;
 EXEC dbo.sp_TEKA_PedidoManual_ValidarEdicion @PedidoId;
 IF (SELECT COUNT(*) FROM dbo.DetallePedido WHERE PedidoId=@PedidoId)<=1
  THROW 55108,'No se puede dejar el pedido sin productos: cancelar el pedido.',1;
 SELECT TOP(1) @Entrada=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Entrada' AND Activo=1 ORDER BY TipoMovimientoStockId;
 IF @Entrada IS NULL THROW 55107,'Falta tipo Entrada.',1;
 EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Entrada,@DepositoId=3,
 @ProductoId=@ProductoId,@Cantidad=@Cantidad,@Motivo='Eliminacion de detalle de pedido',@EntidadOrigen='PedidoAjusteEntrada',@OrigenId=@PedidoId;
 DELETE dbo.DetallePedido WHERE DetallePedidoId=@DetallePedidoId;
 UPDATE dbo.Pedido SET Total=(SELECT SUM(Subtotal) FROM dbo.DetallePedido WHERE PedidoId=@PedidoId) WHERE PedidoId=@PedidoId;
 INSERT dbo.AuditoriaEdicionPedido(PedidoId,DetallePedidoId,ProductoId,Operacion,CantidadAnterior,CantidadNueva)
 VALUES(@PedidoId,@DetallePedidoId,@ProductoId,'Eliminar',@Cantidad,0);
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Pedido

CREATE PROCEDURE [dbo].[sp_Pedido_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.PedidoId,
        p.FechaPedido,
        p.ClienteId,
        c.Nombre AS ClienteNombre,
        c.Apellido AS ClienteApellido,
        p.CanalVentaId,
        cv.Nombre AS CanalVentaNombre,
        p.EstadoPedidoId,
        ep.Nombre AS EstadoPedidoNombre,
        p.Total,
        p.Observaciones
    FROM dbo.Pedido p
    INNER JOIN dbo.Cliente c
        ON p.ClienteId = c.ClienteId
    INNER JOIN dbo.CanalVenta cv
        ON p.CanalVentaId = cv.CanalVentaId
    INNER JOIN dbo.EstadoPedido ep
        ON p.EstadoPedidoId = ep.EstadoPedidoId
    ORDER BY p.FechaPedido DESC, p.PedidoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Pedido_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Pedido_GetById]
    @PedidoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.PedidoId,
        p.FechaPedido,
        p.ClienteId,
        c.Nombre AS ClienteNombre,
        c.Apellido AS ClienteApellido,
        p.CanalVentaId,
        cv.Nombre AS CanalVentaNombre,
        p.EstadoPedidoId,
        ep.Nombre AS EstadoPedidoNombre,
        p.Total,
        p.Observaciones
    FROM dbo.Pedido p
    INNER JOIN dbo.Cliente c
        ON p.ClienteId = c.ClienteId
    INNER JOIN dbo.CanalVenta cv
        ON p.CanalVentaId = cv.CanalVentaId
    INNER JOIN dbo.EstadoPedido ep
        ON p.EstadoPedidoId = ep.EstadoPedidoId
    WHERE p.PedidoId = @PedidoId;

    SELECT
        dp.DetallePedidoId,
        dp.PedidoId,
        dp.ProductoId,
        pr.Codigo AS ProductoCodigo,
        pr.Nombre AS ProductoNombre,
        dp.Cantidad,
        dp.PrecioUnitario,
        dp.Subtotal
    FROM dbo.DetallePedido dp
    INNER JOIN dbo.Producto pr
        ON dp.ProductoId = pr.ProductoId
    WHERE dp.PedidoId = @PedidoId
    ORDER BY dp.DetallePedidoId;

    SELECT
        h.HistorialEstadoPedidoId,
        h.PedidoId,
        h.EstadoPedidoId,
        ep.Nombre AS EstadoPedidoNombre,
        h.FechaCambio,
        h.Observaciones
    FROM dbo.HistorialEstadoPedido h
    INNER JOIN dbo.EstadoPedido ep
        ON h.EstadoPedidoId = ep.EstadoPedidoId
    WHERE h.PedidoId = @PedidoId
    ORDER BY h.FechaCambio DESC, h.HistorialEstadoPedidoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Permiso_Delete]
    @PermisoId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Permiso
    SET Activo = 0
    WHERE PermisoId = @PermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   PERMISO
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_Permiso_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PermisoId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.Permiso
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Permiso_GetById]
    @PermisoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PermisoId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.Permiso
    WHERE PermisoId = @PermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Permiso_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        PermisoId AS Id,
        Nombre AS Descripcion
    FROM dbo.Permiso
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Permiso_Insert]
    @Nombre         VARCHAR(50),
    @Descripcion    VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Permiso
    (
        Nombre,
        Descripcion,
        Activo
    )
    VALUES
    (
        @Nombre,
        @Descripcion,
        1
    );

    SELECT SCOPE_IDENTITY() AS PermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Permiso_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Permiso_Update]
    @PermisoId      INT,
    @Nombre         VARCHAR(50),
    @Descripcion    VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Permiso
    SET
        Nombre = @Nombre,
        Descripcion = @Descripcion
    WHERE PermisoId = @PermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_Corregir] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_Corregir]
    @PrecioVentaId INT, @Precio DECIMAL(18,2), @Motivo NVARCHAR(500), @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @Precio IS NULL OR @Precio<=0 THROW 51004, 'El precio debe ser mayor a cero.', 1;
    SET @Motivo=LTRIM(RTRIM(@Motivo));
    IF @Motivo IS NULL OR LEN(@Motivo)<5 THROW 51006, 'El motivo debe tener al menos 5 caracteres.', 1;
    IF @UsuarioId IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
        THROW 51005, 'No se pudo identificar un usuario activo.', 1;

    DECLARE @Anterior DECIMAL(18,2);
    BEGIN TRANSACTION;
    SELECT @Anterior=Precio FROM dbo.PrecioVenta WITH(UPDLOCK,HOLDLOCK)
     WHERE PrecioVentaId=@PrecioVentaId AND Activo=1;
    IF @Anterior IS NULL THROW 51003, 'El precio no existe o ya no es el vigente.', 1;
    IF @Anterior=@Precio THROW 51007, 'El importe corregido debe ser diferente del actual.', 1;

    UPDATE dbo.PrecioVenta SET Precio=@Precio WHERE PrecioVentaId=@PrecioVentaId AND Activo=1;
    IF @@ROWCOUNT<>1 THROW 51008, 'El precio cambió durante la operación. Actualizá la pantalla.', 1;
    INSERT dbo.PrecioVentaCorreccionAuditoria
        (PrecioVentaId,ImporteAnterior,ImporteNuevo,Motivo,UsuarioId)
    VALUES(@PrecioVentaId,@Anterior,@Precio,@Motivo,@UsuarioId);
    COMMIT;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_GetAll]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT pv.PrecioVentaId, pv.ProductoId, p.Codigo AS ProductoCodigo,
           p.Nombre AS ProductoNombre, pv.FechaVigenciaDesde,
           pv.FechaVigenciaHasta, pv.Precio, pv.Activo
    FROM dbo.PrecioVenta pv
    JOIN dbo.Producto p ON p.ProductoId = pv.ProductoId
    ORDER BY p.Nombre, pv.FechaVigenciaDesde DESC, pv.PrecioVentaId DESC;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_GetByProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_GetByProducto] @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId)
        THROW 51001, 'El producto solicitado no existe.', 1;
    SELECT pv.PrecioVentaId, pv.ProductoId, p.Codigo AS ProductoCodigo,
           p.Nombre AS ProductoNombre, pv.FechaVigenciaDesde,
           pv.FechaVigenciaHasta, pv.Precio, pv.Activo
    FROM dbo.PrecioVenta pv
    JOIN dbo.Producto p ON p.ProductoId = pv.ProductoId
    WHERE pv.ProductoId=@ProductoId
    ORDER BY pv.FechaVigenciaDesde DESC, pv.PrecioVentaId DESC;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_GetVigente] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_GetVigente] @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Ahora DATETIME = GETDATE();
    SELECT TOP (1) pv.PrecioVentaId, pv.ProductoId, pv.FechaVigenciaDesde,
           pv.FechaVigenciaHasta, pv.Precio, pv.Activo
    FROM dbo.PrecioVenta pv
    WHERE pv.ProductoId=@ProductoId AND pv.Activo=1
      AND pv.FechaVigenciaDesde<=@Ahora
      AND (pv.FechaVigenciaHasta IS NULL OR pv.FechaVigenciaHasta>@Ahora)
    ORDER BY pv.FechaVigenciaDesde DESC, pv.PrecioVentaId DESC;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_Insert]
    @ProductoId INT, @Precio DECIMAL(18,2), @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @Precio IS NULL OR @Precio<=0 THROW 51004, 'El precio debe ser mayor a cero.', 1;
    IF @UsuarioId IS NULL OR NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
        THROW 51005, 'No se pudo identificar un usuario activo.', 1;

    DECLARE @Ahora DATETIME=GETDATE(), @PrecioVentaId INT;
    BEGIN TRANSACTION;
    IF NOT EXISTS(SELECT 1 FROM dbo.Producto WITH(UPDLOCK,HOLDLOCK) WHERE ProductoId=@ProductoId)
        THROW 51001, 'El producto solicitado no existe.', 1;
    IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId AND Activo=1)
        THROW 51002, 'No se pueden registrar precios para un producto inactivo.', 1;

    UPDATE dbo.PrecioVenta WITH(UPDLOCK,HOLDLOCK)
       SET FechaVigenciaHasta=@Ahora, Activo=0
     WHERE ProductoId=@ProductoId AND Activo=1;

    INSERT dbo.PrecioVenta(ProductoId,FechaVigenciaDesde,FechaVigenciaHasta,Precio,Activo,UsuarioRegistroId)
    VALUES(@ProductoId,@Ahora,NULL,@Precio,1,@UsuarioId);
    SET @PrecioVentaId=CONVERT(INT,SCOPE_IDENTITY());
    COMMIT;
    SELECT @PrecioVentaId AS PrecioVentaId;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVenta_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVenta_Update] @PrecioVentaId INT, @Precio DECIMAL(18,2)
  AS BEGIN SET NOCOUNT ON; THROW 51009, 'Correccion de precios requiere motivo y usuario. Actualice la API.', 1; END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PrecioVentaCorreccion_GetByProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PrecioVentaCorreccion_GetByProducto] @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT a.PrecioVentaCorreccionId, a.PrecioVentaId, pv.ProductoId,
           a.ImporteAnterior, a.ImporteNuevo, a.Motivo, a.UsuarioId,
           NULLIF(LTRIM(RTRIM(CONCAT(u.Nombre,N' ',u.Apellido))),N'') AS UsuarioNombre,
           a.FechaCorreccion
    FROM dbo.PrecioVentaCorreccionAuditoria a
    JOIN dbo.PrecioVenta pv ON pv.PrecioVentaId=a.PrecioVentaId
    JOIN dbo.Usuario u ON u.UsuarioId=a.UsuarioId
    WHERE pv.ProductoId=@ProductoId
    ORDER BY a.FechaCorreccion DESC, a.PrecioVentaCorreccionId DESC;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_PresupuestoComercial_CambiarEstado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PresupuestoComercial_CambiarEstado]
 @PresupuestoComercialId INT,@EstadoNuevo VARCHAR(20),@UsuarioId INT=NULL,
 @Observaciones NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Anterior VARCHAR(20),@Vencimiento DATE;
 BEGIN TRY
  BEGIN TRAN;
  SELECT @Anterior=Estado,@Vencimiento=FechaVencimiento FROM dbo.PresupuestoComercial WITH(UPDLOCK,HOLDLOCK)
  WHERE PresupuestoComercialId=@PresupuestoComercialId;
  IF @Anterior IS NULL THROW 51020,'Presupuesto inexistente.',1;
  IF NOT ((@Anterior='Borrador' AND @EstadoNuevo IN ('Enviado','Cancelado')) OR
          (@Anterior='Enviado' AND @EstadoNuevo IN ('Aceptado','Rechazado','Vencido','Cancelado')))
   THROW 51021,'Transición de estado no permitida.',1;
  IF @EstadoNuevo='Enviado' AND NOT EXISTS(SELECT 1 FROM dbo.PresupuestoComercialDetalle WHERE PresupuestoComercialId=@PresupuestoComercialId)
   THROW 51022,'No se puede enviar un presupuesto sin productos.',1;
  IF @EstadoNuevo='Aceptado' AND @Vencimiento<CONVERT(DATE,GETDATE())
   THROW 51023,'El presupuesto está vencido; no puede aceptarse.',1;
  IF @EstadoNuevo='Rechazado' AND NULLIF(LTRIM(RTRIM(@Observaciones)),'') IS NULL
   THROW 51024,'Debe indicar motivo de rechazo.',1;
  UPDATE dbo.PresupuestoComercial SET Estado=@EstadoNuevo,FechaActualizacion=SYSDATETIME(),
   FechaEnvio=CASE WHEN @EstadoNuevo='Enviado' THEN SYSDATETIME() ELSE FechaEnvio END,
   FechaRespuesta=CASE WHEN @EstadoNuevo IN ('Aceptado','Rechazado') THEN SYSDATETIME() ELSE FechaRespuesta END,
   MotivoRechazo=CASE WHEN @EstadoNuevo='Rechazado' THEN @Observaciones ELSE MotivoRechazo END
  WHERE PresupuestoComercialId=@PresupuestoComercialId;
  INSERT dbo.PresupuestoComercialHistorial(PresupuestoComercialId,EstadoAnterior,EstadoNuevo,UsuarioId,Observaciones)
  VALUES(@PresupuestoComercialId,@Anterior,@EstadoNuevo,@UsuarioId,@Observaciones);
  COMMIT;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_PresupuestoComercial_Crear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PresupuestoComercial_Crear]
 @OportunidadComercialId INT,@FechaVencimiento DATE,@UsuarioResponsableId INT=NULL,
 @Observaciones NVARCHAR(1000)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ClienteId INT,@Id INT;
 BEGIN TRY
  BEGIN TRAN;
  SELECT @ClienteId=ClienteId FROM dbo.OportunidadComercial WITH(UPDLOCK,HOLDLOCK)
   WHERE OportunidadComercialId=@OportunidadComercialId;
  IF @ClienteId IS NULL THROW 51001,'La oportunidad debe existir y tener un cliente asociado.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId) THROW 51002,'El cliente no existe.',1;
  IF @FechaVencimiento<CONVERT(DATE,GETDATE()) THROW 51003,'La fecha de vencimiento no puede ser anterior a hoy.',1;
  IF @UsuarioResponsableId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioResponsableId)
   THROW 51004,'El responsable no existe.',1;
  INSERT dbo.PresupuestoComercial(OportunidadComercialId,ClienteId,FechaVencimiento,UsuarioResponsableId,Observaciones)
  VALUES(@OportunidadComercialId,@ClienteId,@FechaVencimiento,@UsuarioResponsableId,@Observaciones);
  SET @Id=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.PresupuestoComercialHistorial(PresupuestoComercialId,EstadoNuevo,UsuarioId,Observaciones)
  VALUES(@Id,'Borrador',@UsuarioResponsableId,'Creación del presupuesto');
  COMMIT;
  SELECT @Id AS PresupuestoComercialId;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_PresupuestoComercial_CrearDirecto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PresupuestoComercial_CrearDirecto]
 @ClienteId INT,
 @FechaVencimiento DATE,
 @Observaciones NVARCHAR(1000)=NULL,
 @ProductosJson NVARCHAR(MAX)
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId) THROW 51101,'Cliente inexistente.',1;
 IF @FechaVencimiento<CONVERT(DATE,GETDATE()) THROW 51102,'Fecha de vencimiento inválida.',1;
 IF ISJSON(@ProductosJson)<>1 THROW 51103,'Detalle de productos inválido.',1;
 DECLARE @Productos TABLE(ProductoId INT PRIMARY KEY,Cantidad DECIMAL(18,2),PrecioUnitario DECIMAL(18,2),DescuentoPorcentaje DECIMAL(5,2));
 INSERT INTO @Productos(ProductoId,Cantidad,PrecioUnitario,DescuentoPorcentaje)
 SELECT ProductoId,Cantidad,PrecioUnitario,DescuentoPorcentaje
 FROM OPENJSON(@ProductosJson) WITH (ProductoId INT '$.productoId',Cantidad DECIMAL(18,2) '$.cantidad',PrecioUnitario DECIMAL(18,2) '$.precioUnitario',DescuentoPorcentaje DECIMAL(5,2) '$.descuentoPorcentaje');
 IF NOT EXISTS(SELECT 1 FROM @Productos) THROW 51104,'Agregá al menos un producto.',1;
 IF EXISTS(SELECT 1 FROM @Productos WHERE ProductoId IS NULL OR Cantidad<=0 OR PrecioUnitario<0 OR DescuentoPorcentaje NOT BETWEEN 0 AND 100) THROW 51105,'Datos de productos inválidos.',1;
 IF EXISTS(SELECT 1 FROM @Productos p LEFT JOIN dbo.Producto x ON x.ProductoId=p.ProductoId WHERE x.ProductoId IS NULL) THROW 51106,'Uno o más productos no existen.',1;
 DECLARE @Id INT;
 BEGIN TRY
  BEGIN TRAN;
  INSERT dbo.PresupuestoComercial(OportunidadComercialId,ClienteId,FechaVencimiento,Observaciones)
  VALUES(NULL,@ClienteId,@FechaVencimiento,@Observaciones);
  SET @Id=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.PresupuestoComercialDetalle(PresupuestoComercialId,ProductoId,Cantidad,PrecioUnitario,DescuentoPorcentaje)
  SELECT @Id,ProductoId,Cantidad,PrecioUnitario,DescuentoPorcentaje FROM @Productos;
  INSERT dbo.PresupuestoComercialHistorial(PresupuestoComercialId,EstadoNuevo,Observaciones)
  VALUES(@Id,'Borrador','Alta directa de presupuesto');
  COMMIT;
  SELECT @Id AS PresupuestoComercialId;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_PresupuestoComercial_GuardarProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PresupuestoComercial_GuardarProducto]
 @PresupuestoComercialId INT,@ProductoId INT,@Cantidad DECIMAL(18,2),
 @PrecioUnitario DECIMAL(18,2),@DescuentoPorcentaje DECIMAL(5,2)=0,
 @Observaciones NVARCHAR(300)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Cantidad<=0 OR @PrecioUnitario<0 OR @DescuentoPorcentaje NOT BETWEEN 0 AND 100
  THROW 51010,'Cantidad, precio o descuento inválidos.',1;
 BEGIN TRY
  BEGIN TRAN;
  IF NOT EXISTS(SELECT 1 FROM dbo.PresupuestoComercial WITH(UPDLOCK,HOLDLOCK)
                WHERE PresupuestoComercialId=@PresupuestoComercialId AND Estado='Borrador')
   THROW 51011,'Solo pueden editarse productos de presupuestos en borrador.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Producto WHERE ProductoId=@ProductoId)
   THROW 51012,'El producto no existe.',1;
  UPDATE dbo.PresupuestoComercialDetalle SET Cantidad=@Cantidad,PrecioUnitario=@PrecioUnitario,
   DescuentoPorcentaje=@DescuentoPorcentaje,Observaciones=@Observaciones
  WHERE PresupuestoComercialId=@PresupuestoComercialId AND ProductoId=@ProductoId;
  IF @@ROWCOUNT=0
   INSERT dbo.PresupuestoComercialDetalle(PresupuestoComercialId,ProductoId,Cantidad,PrecioUnitario,DescuentoPorcentaje,Observaciones)
   VALUES(@PresupuestoComercialId,@ProductoId,@Cantidad,@PrecioUnitario,@DescuentoPorcentaje,@Observaciones);
  UPDATE dbo.PresupuestoComercial SET FechaActualizacion=SYSDATETIME() WHERE PresupuestoComercialId=@PresupuestoComercialId;
  COMMIT;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_PresupuestoComercial_Listar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_PresupuestoComercial_Listar]
 @OportunidadComercialId INT=NULL,@Estado VARCHAR(20)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT * FROM dbo.vw_PresupuestoComercialResumen
 WHERE (@OportunidadComercialId IS NULL OR OportunidadComercialId=@OportunidadComercialId)
 AND (@Estado IS NULL OR Estado=@Estado)
 ORDER BY FechaEmision DESC,PresupuestoComercialId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Producto_Activar]
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Producto
    SET
        Activo = 1,
        MotivoInactivacionId = NULL,
        ObservacionInactivacion = NULL,
        FechaInactivacion = NULL
    WHERE ProductoId = @ProductoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Producto_Delete]
    @ProductoId                 INT,
    @MotivoInactivacionId       INT,
    @ObservacionInactivacion    VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Producto
    SET
        Activo = 0,
        MotivoInactivacionId = @MotivoInactivacionId,
        ObservacionInactivacion = @ObservacionInactivacion,
        FechaInactivacion = GETDATE()
    WHERE ProductoId = @ProductoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Producto_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.ProductoId,
        p.Codigo,
        p.Nombre,
        p.NombreProductoId,
        npc.Nombre AS NombreCatalogo,
        p.Descripcion,
        p.TipoProductoId,
        tp.Nombre AS TipoProductoNombre,
        p.ColorId,
        c.Nombre AS ColorNombre,
        c.CodigoHex,
        p.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        p.StockMinimo,
        ft.AnchoCm,
        ft.AltoCm,
        ft.ProfundidadCm,
        p.Activo,
        p.FechaAlta,
        p.MotivoInactivacionId,
        mi.Nombre AS MotivoInactivacionNombre,
        p.ObservacionInactivacion,
        p.FechaInactivacion
    FROM dbo.Producto p
    LEFT JOIN dbo.NombreProductoCatalogo npc ON npc.NombreProductoId = p.NombreProductoId
    LEFT JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId = p.ProductoId
    INNER JOIN dbo.TipoProducto tp ON p.TipoProductoId = tp.TipoProductoId
    INNER JOIN dbo.UnidadMedida um ON p.UnidadMedidaId = um.UnidadMedidaId
    LEFT JOIN dbo.Color c ON p.ColorId = c.ColorId
    LEFT JOIN dbo.MotivoInactivacion mi ON p.MotivoInactivacionId = mi.MotivoInactivacionId
    ORDER BY p.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Producto_GetById]
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.ProductoId,
        p.Codigo,
        p.Nombre,
        p.NombreProductoId,
        npc.Nombre AS NombreCatalogo,
        p.Descripcion,
        p.TipoProductoId,
        tp.Nombre AS TipoProductoNombre,
        p.ColorId,
        c.Nombre AS ColorNombre,
        c.CodigoHex,
        p.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        p.StockMinimo,
        ft.AnchoCm,
        ft.AltoCm,
        ft.ProfundidadCm,
        p.Activo,
        p.FechaAlta,
        p.MotivoInactivacionId,
        mi.Nombre AS MotivoInactivacionNombre,
        p.ObservacionInactivacion,
        p.FechaInactivacion
    FROM dbo.Producto p
    LEFT JOIN dbo.NombreProductoCatalogo npc ON npc.NombreProductoId = p.NombreProductoId
    LEFT JOIN dbo.ProductoFichaTecnica ft ON ft.ProductoId = p.ProductoId
    INNER JOIN dbo.TipoProducto tp ON p.TipoProductoId = tp.TipoProductoId
    INNER JOIN dbo.UnidadMedida um ON p.UnidadMedidaId = um.UnidadMedidaId
    LEFT JOIN dbo.Color c ON p.ColorId = c.ColorId
    LEFT JOIN dbo.MotivoInactivacion mi ON p.MotivoInactivacionId = mi.MotivoInactivacionId
    WHERE p.ProductoId = @ProductoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Producto_Insert]
    @Nombre                 VARCHAR(120),
    @Descripcion            VARCHAR(500) = NULL,
    @TipoProductoId         INT,
    @ColorId                INT = NULL,
    @UnidadMedidaId         INT,
    @StockMinimo            DECIMAL(18,2),
    @AnchoCm                DECIMAL(10,2),
    @AltoCm                 DECIMAL(10,2),
    @ProfundidadCm          DECIMAL(10,2),
    @NombreProductoId       INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @AnchoCm IS NULL OR @AltoCm IS NULL OR @ProfundidadCm IS NULL
       OR @AnchoCm <= 0 OR @AltoCm <= 0 OR @ProfundidadCm <= 0
       THROW 51100, 'Las tres dimensiones deben ser mayores que cero.', 1;
    IF @NombreProductoId IS NOT NULL
    BEGIN
        SELECT @Nombre = n.Nombre FROM dbo.NombreProductoCatalogo n
        WHERE n.NombreProductoId = @NombreProductoId AND n.TipoProductoId = @TipoProductoId AND n.Activo = 1;
        IF @Nombre IS NULL OR NOT EXISTS (
           SELECT 1 FROM dbo.NombreProductoCatalogo n
           WHERE n.NombreProductoId=@NombreProductoId AND n.TipoProductoId=@TipoProductoId AND n.Activo=1)
          THROW 53010, 'El nombre seleccionado no pertenece a la categoria o esta inactivo.',1;
    END;
    BEGIN TRY
        BEGIN TRANSACTION;

    INSERT INTO dbo.Producto
    (
        Codigo,
        Nombre,
        NombreProductoId,
        Descripcion,
        TipoProductoId,
        ColorId,
        UnidadMedidaId,
        StockMinimo,
        Activo,
        FechaAlta,
        MotivoInactivacionId,
        ObservacionInactivacion,
        FechaInactivacion
    )
    VALUES
    (
        CONCAT('TMP-P-', RIGHT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 20)),
        @Nombre,
        @NombreProductoId,
        @Descripcion,
        @TipoProductoId,
        @ColorId,
        @UnidadMedidaId,
        @StockMinimo,
        1,
        GETDATE(),
        NULL,
        NULL,
        NULL
    );

    DECLARE @ProductoId INT = SCOPE_IDENTITY();

    UPDATE dbo.Producto
    SET Codigo = CONCAT('PROD-', RIGHT('0000' + CAST(@ProductoId AS VARCHAR(10)), 4))
    WHERE ProductoId = @ProductoId;

    INSERT dbo.ProductoFichaTecnica (ProductoId, AnchoCm, AltoCm, ProfundidadCm)
    VALUES (@ProductoId, @AnchoCm, @AltoCm, @ProfundidadCm);

    COMMIT TRANSACTION;
    SELECT @ProductoId AS ProductoId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Producto_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Producto_Update]
    @ProductoId             INT,
    @Nombre                 VARCHAR(120),
    @Descripcion            VARCHAR(500) = NULL,
    @TipoProductoId         INT,
    @ColorId                INT = NULL,
    @UnidadMedidaId         INT,
    @StockMinimo            DECIMAL(18,2),
    @AnchoCm                DECIMAL(10,2),
    @AltoCm                 DECIMAL(10,2),
    @ProfundidadCm          DECIMAL(10,2),
    @NombreProductoId       INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @AnchoCm IS NULL OR @AltoCm IS NULL OR @ProfundidadCm IS NULL
       OR @AnchoCm <= 0 OR @AltoCm <= 0 OR @ProfundidadCm <= 0
       THROW 51100, 'Las tres dimensiones deben ser mayores que cero.', 1;
    IF @NombreProductoId IS NOT NULL
    BEGIN
        SELECT @Nombre = n.Nombre FROM dbo.NombreProductoCatalogo n
        WHERE n.NombreProductoId = @NombreProductoId AND n.TipoProductoId = @TipoProductoId AND n.Activo = 1;
        IF @Nombre IS NULL OR NOT EXISTS (
           SELECT 1 FROM dbo.NombreProductoCatalogo n
           WHERE n.NombreProductoId=@NombreProductoId AND n.TipoProductoId=@TipoProductoId AND n.Activo=1)
          THROW 53010, 'El nombre seleccionado no pertenece a la categoria o esta inactivo.',1;
    END;
    BEGIN TRY
        BEGIN TRANSACTION;

    UPDATE dbo.Producto
    SET
        Nombre = @Nombre,
        NombreProductoId = CASE WHEN @NombreProductoId IS NOT NULL THEN @NombreProductoId
           WHEN TipoProductoId = @TipoProductoId THEN NombreProductoId ELSE NULL END,
        Descripcion = @Descripcion,
        TipoProductoId = @TipoProductoId,
        ColorId = @ColorId,
        UnidadMedidaId = @UnidadMedidaId,
        StockMinimo = @StockMinimo
    WHERE ProductoId = @ProductoId;

    IF @@ROWCOUNT = 0
       THROW 51101, 'El producto no existe.', 1;

    UPDATE dbo.ProductoFichaTecnica
       SET AnchoCm = @AnchoCm, AltoCm = @AltoCm, ProfundidadCm = @ProfundidadCm,
           FechaActualizacion = SYSUTCDATETIME()
     WHERE ProductoId = @ProductoId;
    IF @@ROWCOUNT = 0
       INSERT dbo.ProductoFichaTecnica (ProductoId, AnchoCm, AltoCm, ProfundidadCm)
       VALUES (@ProductoId, @AnchoCm, @AltoCm, @ProfundidadCm);

    COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte_CambiarEstado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Recorte_CambiarEstado]
    @RecorteId            INT,
    @EstadoRecorteId      INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Recorte
    SET
        EstadoRecorteId = @EstadoRecorteId
    WHERE RecorteId = @RecorteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Las consultas conservan las columnas previas y agregan geometria al final. */
CREATE   PROCEDURE [dbo].[sp_Recorte_GetAll] AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.RecorteId,r.OrdenProduccionId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
 r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.EstadoRecorteId,e.Nombre EstadoRecorteNombre,
 r.ColorId,c.Nombre ColorNombre,c.CodigoHex,r.Dimension,r.UnidadMedidaId,
 u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,r.Cantidad,r.Observaciones,r.FechaAlta,
 r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta,i.ColorId InsumoColorId,ti.Nombre TipoInsumoNombre,
 CAST(COALESCE((SELECT SUM(s.CantidadActual) FROM dbo.StockRecorte s WHERE s.RecorteId=r.RecorteId),0) AS DECIMAL(18,2)) StockDisponible
 FROM dbo.Recorte r JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId
 JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId
 JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId
 LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId
 ORDER BY r.FechaAlta DESC,r.RecorteId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Recorte_GetById] @RecorteId INT AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.RecorteId,r.OrdenProduccionId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
 r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.EstadoRecorteId,e.Nombre EstadoRecorteNombre,
 r.ColorId,c.Nombre ColorNombre,c.CodigoHex,r.Dimension,r.UnidadMedidaId,
 u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,r.Cantidad,r.Observaciones,r.FechaAlta,
 r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta,i.ColorId InsumoColorId,ti.Nombre TipoInsumoNombre,
 CAST(COALESCE((SELECT SUM(s.CantidadActual) FROM dbo.StockRecorte s WHERE s.RecorteId=r.RecorteId),0) AS DECIMAL(18,2)) StockDisponible
 FROM dbo.Recorte r JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId
 JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId
 JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId
 LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId WHERE r.RecorteId=@RecorteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Bloqueo de altas manuales: la OP integral crea el recorte y registra el Alta en una misma transaccion. */
CREATE   PROCEDURE [dbo].[sp_Recorte_Insert]
    @OrdenProduccionId INT=NULL, @InsumoId INT, @TipoRecorteId INT=NULL,
    @EstadoRecorteId INT, @ColorId INT=NULL, @Dimension DECIMAL(18,2)=NULL,
    @UnidadMedidaId INT, @Cantidad DECIMAL(18,2), @Observaciones VARCHAR(500)=NULL
AS
BEGIN
    SET NOCOUNT ON;
    THROW 60010, 'Alta directa de recortes deshabilitada: registrar mediante finalizacion integral de OP.', 1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* No se permiten modificaciones silenciosas de cantidad, origen ni atributos de stock. */
CREATE   PROCEDURE [dbo].[sp_Recorte_Update]
    @RecorteId INT, @OrdenProduccionId INT=NULL, @InsumoId INT,
    @TipoRecorteId INT=NULL, @EstadoRecorteId INT, @ColorId INT=NULL,
    @Dimension DECIMAL(18,2)=NULL, @UnidadMedidaId INT,
    @Cantidad DECIMAL(18,2), @Observaciones VARCHAR(500)=NULL
AS
BEGIN
    SET NOCOUNT ON;
    THROW 60011, 'Edicion directa de recortes deshabilitada: requiere circuito auditable de correccion.', 1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Recorte2A_Fingerprint] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO
/* Huella del esquema instalado. En una repeticion se compara ANTES de cualquier DDL.
   Incluye columnas, claves/definiciones, indices, modulos y estado de triggers. */
CREATE   PROCEDURE [dbo].[sp_Recorte2A_Fingerprint] @Fingerprint VARCHAR(64) OUTPUT
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Tablas TABLE(ObjetoId INT NOT NULL PRIMARY KEY);
 INSERT @Tablas(ObjetoId) SELECT object_id FROM sys.tables WHERE schema_id=SCHEMA_ID('dbo')
  AND name IN ('RecorteGeneracion','RecorteGeneracionInventario','RecorteDiseno',
   'RecorteDisenoPieza','RecorteDisenoAsignacion','RecorteDisenoInsumo',
   'RecorteDisenoCosto','RecorteDisenoImagen','RecorteDisenoValidacion',
   'RecorteDisenoValidacionMotivo','RecorteDisenoHistorial');
 DECLARE @Xml XML;
 ;WITH Meta AS (
  SELECT N'O' Clase,CONVERT(NVARCHAR(512),o.name) Nombre,
   CONVERT(NVARCHAR(MAX),CONCAT(o.type,N'|',ISNULL(OBJECT_NAME(o.parent_object_id),N''))) Dato
  FROM sys.objects o WHERE o.object_id IN (SELECT ObjetoId FROM @Tablas)
   OR o.parent_object_id IN (SELECT ObjetoId FROM @Tablas)
   OR o.object_id IN (OBJECT_ID('dbo.v_RecorteDisenosAprobados'),
    OBJECT_ID('dbo.sp_RecorteDiseno_Decidir'),OBJECT_ID('dbo.sp_Recorte2A_Fingerprint'))
  UNION ALL
  SELECT N'C',CONVERT(NVARCHAR(512),CONCAT(OBJECT_NAME(c.object_id),N'.',c.name)),
   CONVERT(NVARCHAR(MAX),CONCAT(TYPE_NAME(c.user_type_id),N'|',c.max_length,N'|',
    c.precision,N'|',c.scale,N'|',c.is_nullable,N'|',c.is_identity,N'|',
    ISNULL(dc.definition,N'')))
  FROM sys.columns c LEFT JOIN sys.default_constraints dc ON dc.object_id=c.default_object_id
  WHERE c.object_id IN (SELECT ObjetoId FROM @Tablas)
  UNION ALL
  SELECT N'K',CONVERT(NVARCHAR(512),k.name),
   CONVERT(NVARCHAR(MAX),CONCAT(k.definition,N'|',k.is_disabled,N'|',k.is_not_trusted))
  FROM sys.check_constraints k WHERE k.parent_object_id IN (SELECT ObjetoId FROM @Tablas)
  UNION ALL
  SELECT N'F',CONVERT(NVARCHAR(512),f.name),
   CONVERT(NVARCHAR(MAX),CONCAT(OBJECT_NAME(f.parent_object_id),N'|',
    OBJECT_NAME(f.referenced_object_id),N'|',f.delete_referential_action,N'|',
    f.update_referential_action,N'|',f.is_disabled,N'|',f.is_not_trusted))
  FROM sys.foreign_keys f WHERE f.parent_object_id IN (SELECT ObjetoId FROM @Tablas)
  UNION ALL
  SELECT N'FC',CONVERT(NVARCHAR(512),CONCAT(OBJECT_NAME(fc.constraint_object_id),N'.',fc.constraint_column_id)),
   CONVERT(NVARCHAR(MAX),CONCAT(COL_NAME(fc.parent_object_id,fc.parent_column_id),N'|',
    COL_NAME(fc.referenced_object_id,fc.referenced_column_id)))
  FROM sys.foreign_key_columns fc WHERE fc.parent_object_id IN (SELECT ObjetoId FROM @Tablas)
  UNION ALL
  SELECT N'I',CONVERT(NVARCHAR(512),CONCAT(OBJECT_NAME(i.object_id),N'.',i.name)),
   CONVERT(NVARCHAR(MAX),CONCAT(i.type,N'|',i.is_unique,N'|',i.is_disabled,N'|',
    ISNULL(i.filter_definition,N'')))
  FROM sys.indexes i WHERE i.object_id IN (SELECT ObjetoId FROM @Tablas) AND i.index_id>0
  UNION ALL
  SELECT N'IC',CONVERT(NVARCHAR(512),CONCAT(OBJECT_NAME(ic.object_id),N'.',i.name,N'.',ic.index_column_id)),
   CONVERT(NVARCHAR(MAX),CONCAT(COL_NAME(ic.object_id,ic.column_id),N'|',
    ic.key_ordinal,N'|',ic.is_descending_key,N'|',ic.is_included_column))
  FROM sys.index_columns ic JOIN sys.indexes i ON i.object_id=ic.object_id AND i.index_id=ic.index_id
  WHERE ic.object_id IN (SELECT ObjetoId FROM @Tablas)
  UNION ALL
  SELECT N'M',CONVERT(NVARCHAR(512),OBJECT_NAME(m.object_id)),CONVERT(NVARCHAR(MAX),m.definition)
  FROM sys.sql_modules m WHERE m.object_id IN
   (SELECT o.object_id FROM sys.objects o WHERE o.parent_object_id IN (SELECT ObjetoId FROM @Tablas)
     AND o.type='TR')
   OR m.object_id IN (OBJECT_ID('dbo.v_RecorteDisenosAprobados'),
    OBJECT_ID('dbo.sp_RecorteDiseno_Decidir'),OBJECT_ID('dbo.sp_Recorte2A_Fingerprint'))
  UNION ALL
  SELECT N'T',CONVERT(NVARCHAR(512),t.name),CONVERT(NVARCHAR(MAX),t.is_disabled)
  FROM sys.triggers t WHERE t.parent_id IN (SELECT ObjetoId FROM @Tablas)
 )
 SELECT @Xml=(SELECT Clase,Nombre,Dato FROM Meta ORDER BY Clase,Nombre FOR XML PATH('m'),TYPE);
 SET @Fingerprint=CONVERT(VARCHAR(64),HASHBYTES('SHA2_256',
  CONVERT(VARBINARY(MAX),CONVERT(NVARCHAR(MAX),@Xml))),2);
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteDiseno_Decidir] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE   PROCEDURE [dbo].[sp_RecorteDiseno_Decidir]
 @RecorteDisenoId BIGINT,@Accion VARCHAR(12),@UsuarioId INT,@Motivo NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Accion NOT IN ('Aprobar','Rechazar','Descartar') THROW 64110,'Accion invalida.',1;
 IF @Accion<>'Aprobar' AND NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL
  THROW 64111,'El motivo es obligatorio.',1;
 DECLARE @Estado VARCHAR(24),@Hash BINARY(32),@Destino VARCHAR(24),@GeneracionId BIGINT;
 SET @Destino=CASE @Accion WHEN 'Aprobar' THEN 'Aprobada' WHEN 'Rechazar' THEN 'Rechazada' ELSE 'Descartada' END;
 BEGIN TRY
  BEGIN TRANSACTION;
  SELECT @Estado=EstadoRevision,@Hash=ContenidoHash,@GeneracionId=RecorteGeneracionId
   FROM dbo.RecorteDiseno WITH(UPDLOCK,HOLDLOCK) WHERE RecorteDisenoId=@RecorteDisenoId;
  IF @Estado IS NULL THROW 64112,'Diseno no encontrado.',1;
  IF @Estado=@Destino BEGIN COMMIT TRANSACTION; RETURN; END;
  IF @Estado IN ('Aprobada','Rechazada','Descartada')
   THROW 64113,'La decision ya es definitiva; cree una nueva version.',1;
  IF @Accion='Aprobar'
  BEGIN
   IF @Estado<>'Validada' OR NOT EXISTS(
    SELECT 1 FROM dbo.RecorteDisenoValidacion v WHERE v.RecorteDisenoId=@RecorteDisenoId
     AND v.Resultado='Valida' AND v.ContenidoHash=@Hash
     AND v.RecorteDisenoValidacionId=(SELECT MAX(v2.RecorteDisenoValidacionId)
      FROM dbo.RecorteDisenoValidacion v2 WHERE v2.RecorteDisenoId=@RecorteDisenoId))
    THROW 64114,'La propuesta no tiene validacion tecnica vigente.',1;
   IF NOT EXISTS(SELECT 1 FROM dbo.RecorteDisenoAsignacion WHERE RecorteDisenoId=@RecorteDisenoId)
    THROW 64115,'La propuesta no tiene recortes asignados.',1;
   IF EXISTS(
    SELECT 1 FROM dbo.RecorteDisenoAsignacion a
    JOIN dbo.Recorte r ON r.RecorteId=a.RecorteId
    JOIN dbo.EstadoRecorte er ON er.EstadoRecorteId=r.EstadoRecorteId
    LEFT JOIN dbo.RecorteGeneracionInventario s ON s.RecorteGeneracionId=@GeneracionId AND s.RecorteId=r.RecorteId
    OUTER APPLY(SELECT COALESCE(SUM(sr.CantidadActual),0) Cantidad
      FROM dbo.StockRecorte sr WHERE sr.RecorteId=r.RecorteId) stock
    WHERE a.RecorteDisenoId=@RecorteDisenoId AND
     (er.Nombre<>'Disponible' OR stock.Cantidad<=0 OR s.RecorteId IS NULL OR
      stock.Cantidad<>s.CantidadDisponible OR r.InsumoId<>s.InsumoId OR
      ISNULL(r.ColorId,-1)<>ISNULL(s.ColorId,-1) OR
      ISNULL(r.LargoMm,-1)<>ISNULL(s.LargoMm,-1) OR
      ISNULL(r.AnchoMm,-1)<>ISNULL(s.AnchoMm,-1) OR
      ISNULL(r.EspesorMm,-1)<>ISNULL(s.EspesorMm,-1) OR
      ISNULL(r.OrientacionVeta,'')<>ISNULL(s.OrientacionVeta,'')))
    THROW 64116,'Los recortes cambiaron desde la validacion; debe revalidarse.',1;
   /* La aprobacion no reserva ni consume. La disponibilidad final se verifica al iniciar la OP. */
  END;
  UPDATE dbo.RecorteDiseno SET EstadoRevision=@Destino,UsuarioDecisionId=@UsuarioId,
   FechaDecision=SYSUTCDATETIME(),MotivoDecision=@Motivo WHERE RecorteDisenoId=@RecorteDisenoId;
  /* El trigger de transicion registra el historial en esta misma transaccion. */
  COMMIT TRANSACTION;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteProductoSugerido_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RecorteProductoSugerido_Delete]
    @RecorteProductoSugeridoId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.RecorteProductoSugerido
    WHERE RecorteProductoSugeridoId = @RecorteProductoSugeridoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteProductoSugerido_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RecorteProductoSugerido_GetById]
    @RecorteProductoSugeridoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rps.RecorteProductoSugeridoId,
        rps.SugerenciaRecorteId,
        sr.FechaSugerencia,
        rps.RecorteId,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.ColorId,
        c.Nombre AS ColorNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        rps.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        rps.PuntajeCompatibilidad,
        rps.Observaciones
    FROM dbo.RecorteProductoSugerido rps
    INNER JOIN dbo.SugerenciaRecorte sr
        ON rps.SugerenciaRecorteId = sr.SugerenciaRecorteId
    INNER JOIN dbo.Recorte r
        ON rps.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    LEFT JOIN dbo.Color c
        ON r.ColorId = c.ColorId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Producto p
        ON rps.ProductoId = p.ProductoId
    WHERE rps.RecorteProductoSugeridoId = @RecorteProductoSugeridoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteProductoSugerido_GetBySugerencia] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   RECORTEPRODUCTOSUGERIDO
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_RecorteProductoSugerido_GetBySugerencia]
    @SugerenciaRecorteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rps.RecorteProductoSugeridoId,
        rps.SugerenciaRecorteId,
        rps.RecorteId,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.ColorId,
        c.Nombre AS ColorNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        rps.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        rps.PuntajeCompatibilidad,
        rps.Observaciones
    FROM dbo.RecorteProductoSugerido rps
    INNER JOIN dbo.Recorte r
        ON rps.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    LEFT JOIN dbo.Color c
        ON r.ColorId = c.ColorId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Producto p
        ON rps.ProductoId = p.ProductoId
    WHERE rps.SugerenciaRecorteId = @SugerenciaRecorteId
    ORDER BY
        rps.PuntajeCompatibilidad DESC,
        rps.RecorteProductoSugeridoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteProductoSugerido_GetDisponiblesParaOrden] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   SUGERENCIAS DISPONIBLES PARA GENERAR ORDEN
   Devuelve sugerencias aún no vinculadas a una orden
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_RecorteProductoSugerido_GetDisponiblesParaOrden]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rps.RecorteProductoSugeridoId,
        rps.SugerenciaRecorteId,
        sr.FechaSugerencia,
        rps.RecorteId,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.ColorId,
        c.Nombre AS ColorNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        rps.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        rps.PuntajeCompatibilidad,
        rps.Observaciones
    FROM dbo.RecorteProductoSugerido rps
    INNER JOIN dbo.SugerenciaRecorte sr
        ON rps.SugerenciaRecorteId = sr.SugerenciaRecorteId
    INNER JOIN dbo.Recorte r
        ON rps.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    LEFT JOIN dbo.Color c
        ON r.ColorId = c.ColorId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Producto p
        ON rps.ProductoId = p.ProductoId
    LEFT JOIN dbo.OrdenProduccion op
        ON op.RecorteProductoSugeridoId = rps.RecorteProductoSugeridoId
    WHERE op.OrdenProduccionId IS NULL
    ORDER BY
        sr.FechaSugerencia DESC,
        rps.PuntajeCompatibilidad DESC,
        rps.RecorteProductoSugeridoId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecorteProductoSugerido_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RecorteProductoSugerido_Insert]
    @SugerenciaRecorteId       INT,
    @RecorteId                 INT,
    @ProductoId                INT,
    @PuntajeCompatibilidad     DECIMAL(5,2) = NULL,
    @Observaciones             VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.RecorteProductoSugerido
    (
        SugerenciaRecorteId,
        RecorteId,
        ProductoId,
        PuntajeCompatibilidad,
        Observaciones
    )
    VALUES
    (
        @SugerenciaRecorteId,
        @RecorteId,
        @ProductoId,
        @PuntajeCompatibilidad,
        @Observaciones
    );

    SELECT SCOPE_IDENTITY() AS RecorteProductoSugeridoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecuperacionPassword_GetByToken] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   RECUPERACIONPASSWORD
   Pendiente para versión futura con servidor de correo SMTP.
   Actualmente se utiliza restablecimiento por administrador.
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_RecuperacionPassword_GetByToken]
    @TokenRecuperacion VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rp.RecuperacionPasswordId,
        rp.UsuarioId,
        u.Username,
        u.Email,
        rp.TokenRecuperacion,
        rp.FechaSolicitud,
        rp.FechaExpiracion,
        rp.Utilizado
    FROM dbo.RecuperacionPassword rp
    INNER JOIN dbo.Usuario u
        ON rp.UsuarioId = u.UsuarioId
    WHERE rp.TokenRecuperacion = @TokenRecuperacion;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecuperacionPassword_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RecuperacionPassword_Insert]
    @UsuarioId               INT,
    @TokenRecuperacion       VARCHAR(200),
    @FechaExpiracion         DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.RecuperacionPassword
    (
        UsuarioId,
        TokenRecuperacion,
        FechaSolicitud,
        FechaExpiracion,
        Utilizado
    )
    VALUES
    (
        @UsuarioId,
        @TokenRecuperacion,
        GETDATE(),
        @FechaExpiracion,
        0
    );

    SELECT SCOPE_IDENTITY() AS RecuperacionPasswordId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecuperacionPassword_InvalidarPendientes] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_RecuperacionPassword_InvalidarPendientes] @UsuarioId INT AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.RecuperacionPassword SET Utilizado=1 WHERE UsuarioId=@UsuarioId AND Utilizado=0;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RecuperacionPassword_MarcarUtilizado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RecuperacionPassword_MarcarUtilizado]
    @RecuperacionPasswordId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.RecuperacionPassword
    SET Utilizado = 1
    WHERE RecuperacionPasswordId = @RecuperacionPasswordId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_Anular] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Remito_Anular]
 @RemitoId INT,@Motivo VARCHAR(250),@Usuario VARCHAR(120)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL THROW 53103,'El motivo es obligatorio.',1;
 DECLARE @PedidoId INT,@EstadoActual VARCHAR(50),@EstadoConfirmado INT;
 BEGIN TRY
 BEGIN TRAN;
 SELECT @PedidoId=PedidoId FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK) WHERE RemitoId=@RemitoId AND Entregado=0 AND Anulado=0;
 IF @PedidoId IS NULL THROW 53104,'El remito no existe o ya fue entregado/anulado.',1;
 SELECT @EstadoActual=e.Nombre FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
 IF @EstadoActual<>'Listo para Entrega' THROW 53105,'El estado del pedido impide anular el remito.',1;
 IF EXISTS(SELECT 1 FROM dbo.Comprobante WHERE PedidoId=@PedidoId) THROW 53106,'El pedido tiene comprobantes; requiere un proceso de reversión específico.',1;
 SELECT @EstadoConfirmado=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Confirmado';
 IF @EstadoConfirmado IS NULL THROW 53107,'No existe estado Confirmado.',1;
 UPDATE dbo.Remito SET Anulado=1,MotivoAnulacion=LTRIM(RTRIM(@Motivo)),FechaAnulacion=SYSDATETIME(),UsuarioAnulacion=@Usuario WHERE RemitoId=@RemitoId;
 UPDATE dbo.Pedido SET EstadoPedidoId=@EstadoConfirmado WHERE PedidoId=@PedidoId;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones)
 VALUES(@PedidoId,@EstadoConfirmado,GETDATE(),LEFT(CONCAT('Remito #',@RemitoId,' anulado: ',@Motivo),250));
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_Editar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Remito_Editar]
 @RemitoId INT,@DomicilioEntrega VARCHAR(200),@Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@DomicilioEntrega)),'') IS NULL THROW 53101,'El domicilio es obligatorio.',1;
 BEGIN TRY
 BEGIN TRAN;
 IF NOT EXISTS(SELECT 1 FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK) WHERE RemitoId=@RemitoId AND Entregado=0 AND Anulado=0)
  THROW 53102,'El remito no existe o ya fue entregado/anulado.',1;
 UPDATE dbo.Remito SET DomicilioEntrega=LTRIM(RTRIM(@DomicilioEntrega)),Observaciones=NULLIF(LTRIM(RTRIM(@Observaciones)),''),FechaModificacion=SYSDATETIME() WHERE RemitoId=@RemitoId;
 COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Conserva remitos anulados en el historial; no modifica las reglas de anulación. */
CREATE   PROCEDURE [dbo].[sp_Remito_GetAll] AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.RemitoId,r.PedidoId,r.ClienteId,c.Nombre AS ClienteNombre,c.Apellido AS ClienteApellido,
 r.FechaRemito,r.NumeroRemito,r.DomicilioEntrega,r.Entregado,r.FechaEntrega,r.Observaciones,
 r.Anulado,r.MotivoAnulacion,r.FechaAnulacion,r.UsuarioAnulacion
 FROM dbo.Remito r JOIN dbo.Cliente c ON c.ClienteId=r.ClienteId
 ORDER BY r.FechaRemito DESC,r.RemitoId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Remito_GetById] @RemitoId INT AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.RemitoId,r.PedidoId,r.ClienteId,c.Nombre AS ClienteNombre,c.Apellido AS ClienteApellido,
 r.FechaRemito,r.NumeroRemito,r.DomicilioEntrega,r.Entregado,r.FechaEntrega,r.Observaciones,
 r.Anulado,r.MotivoAnulacion,r.FechaAnulacion,r.UsuarioAnulacion
 FROM dbo.Remito r JOIN dbo.Cliente c ON c.ClienteId=r.ClienteId WHERE r.RemitoId=@RemitoId;
 SELECT d.DetalleRemitoId,d.RemitoId,d.ProductoId,p.Codigo AS ProductoCodigo,p.Nombre AS ProductoNombre,d.Cantidad
 FROM dbo.DetalleRemito d JOIN dbo.Producto p ON p.ProductoId=d.ProductoId
 WHERE d.RemitoId=@RemitoId ORDER BY d.DetalleRemitoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_InsertDesdePedido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* La reemisión requiere que solo se considere el remito activo.
   El procedimiento original se conserva íntegro salvo este filtro. */

CREATE   PROCEDURE [dbo].[sp_Remito_InsertDesdePedido]
 @PedidoId INT,@NumeroRemito VARCHAR(30)=NULL,
 @DomicilioEntrega VARCHAR(200)=NULL,@Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ClienteId INT,@Estado VARCHAR(50),@Total DECIMAL(18,2),@Pagado DECIMAL(18,2),@Descuento DECIMAL(18,2),
 @RemitoId INT,@EstadoListo INT;
 BEGIN TRY
  BEGIN TRAN;
  SELECT @ClienteId=p.ClienteId,@Estado=ep.Nombre,@Total=p.Total
  FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
  IF @ClienteId IS NULL THROW 53050,'Pedido inexistente.',1;
  IF @Estado<>'Confirmado' THROW 53051,'Solo se genera remito de pedido confirmado.',1;
  SELECT @Pagado=ISNULL(SUM(c.ImporteBase),0),
   @Descuento=ISNULL(SUM(CASE WHEN c.PorcentajeAplicado=-5 AND c.ImporteBase=@Total THEN c.ImporteAjuste ELSE 0 END),0) FROM dbo.Cobro c
  JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
  WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado';
  IF @Pagado<@Total-0.01 THROW 53052,'El pedido tiene saldo pendiente.',1;
  IF EXISTS(SELECT 1 FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND Anulado=0)
   THROW 53054,'El pedido ya tiene remito.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.DetallePedido WHERE PedidoId=@PedidoId)
   THROW 53055,'Pedido sin productos.',1;
  SELECT @EstadoListo=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Listo para Entrega';
  IF @EstadoListo IS NULL THROW 53056,'Falta estado Listo para Entrega.',1;
  INSERT dbo.Remito(PedidoId,ClienteId,FechaRemito,NumeroRemito,DomicilioEntrega,Entregado,Observaciones)
  VALUES(@PedidoId,@ClienteId,GETDATE(),@NumeroRemito,@DomicilioEntrega,0,@Observaciones);
  SET @RemitoId=CAST(SCOPE_IDENTITY() AS INT);
  INSERT dbo.DetalleRemito(RemitoId,ProductoId,Cantidad)
   SELECT @RemitoId,ProductoId,Cantidad FROM dbo.DetallePedido WHERE PedidoId=@PedidoId;
  UPDATE dbo.Pedido SET EstadoPedidoId=@EstadoListo WHERE PedidoId=@PedidoId;
  INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones)
  VALUES(@PedidoId,@EstadoListo,GETDATE(),'Pedido listo para entrega por generacion de remito');
  COMMIT;
  SELECT @RemitoId AS RemitoId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;



GO
/****** Objeto: StoredProcedure [dbo].[sp_Remito_MarcarEntregado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_Remito_MarcarEntregado]
 @RemitoId INT,
 @Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 DECLARE @PedidoId INT,@Entregado BIT,@Estado VARCHAR(50),@EstadoEntregadoId INT,
         @Total DECIMAL(18,2),@Pagado DECIMAL(18,2);
 BEGIN TRY
  BEGIN TRAN;
  SELECT @PedidoId=PedidoId,@Entregado=Entregado
  FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK)
  WHERE RemitoId=@RemitoId;
  IF @PedidoId IS NULL THROW 53060,'Remito inexistente.',1;
  IF EXISTS(SELECT 1 FROM dbo.Remito WHERE RemitoId=@RemitoId AND Anulado=1) THROW 53108,'No se puede entregar un remito anulado.',1;
  IF @Entregado=1 THROW 53061,'Remito ya entregado.',1;

  SELECT @Estado=ep.Nombre,@Total=p.Total
  FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.EstadoPedido ep ON ep.EstadoPedidoId=p.EstadoPedidoId
  WHERE p.PedidoId=@PedidoId;
  IF @Estado<>'Listo para Entrega'
   THROW 53062,'Pedido no esta listo para entrega.',1;

  /* Misma regla que B1 y A2: capital confirmado, no recargos de tarjeta. */
  SELECT @Pagado=ISNULL(SUM(c.ImporteBase),0)
  FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK)
  JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
  WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado';
  IF @Pagado<@Total-0.01
   THROW 53063,'No se puede entregar con saldo pendiente.',1;

  /* El comprobante interno de venta se genera DESPUES de confirmar la entrega. */
  SELECT @EstadoEntregadoId=EstadoPedidoId
  FROM dbo.EstadoPedido WHERE Nombre='Entregado';
  IF @EstadoEntregadoId IS NULL
   THROW 53065,'Estado Entregado inexistente.',1;

  UPDATE dbo.Remito
  SET Entregado=1,FechaEntrega=GETDATE(),
      Observaciones=ISNULL(@Observaciones,Observaciones)
  WHERE RemitoId=@RemitoId AND Entregado=0;
  IF @@ROWCOUNT<>1 THROW 53311,'No se pudo confirmar la entrega.',1;

  UPDATE dbo.Pedido SET EstadoPedidoId=@EstadoEntregadoId
  WHERE PedidoId=@PedidoId;
  INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones)
  VALUES(@PedidoId,@EstadoEntregadoId,GETDATE(),ISNULL(@Observaciones,'Pedido entregado'));
  COMMIT;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH;
END;


GO
/****** Objeto: StoredProcedure [dbo].[sp_ResultadoProduccion_GetByOrden] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--ResultadoProduccion

CREATE   PROCEDURE [dbo].[sp_ResultadoProduccion_GetByOrden]
    @OrdenProduccionId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rp.ResultadoProduccionId,
        rp.OrdenProduccionId,
        rp.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        rp.DepositoId,
        d.Nombre AS DepositoNombre,
        rp.FechaResultado,
        rp.CantidadIngresada,
        rp.Observaciones
    FROM dbo.ResultadoProduccion rp
    INNER JOIN dbo.Producto p
        ON rp.ProductoId = p.ProductoId
    INNER JOIN dbo.Deposito d
        ON rp.DepositoId = d.DepositoId
    WHERE rp.OrdenProduccionId = @OrdenProduccionId
    ORDER BY rp.ResultadoProduccionId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Rol_Delete]
    @RolId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Rol
    SET Activo = 0
    WHERE RolId = @RolId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   ROL
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_Rol_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RolId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.Rol
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Rol_GetById]
    @RolId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RolId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.Rol
    WHERE RolId = @RolId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Rol_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        RolId AS Id,
        Nombre AS Descripcion
    FROM dbo.Rol
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Rol_Insert]
    @Nombre         VARCHAR(50),
    @Descripcion    VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Rol
    (
        Nombre,
        Descripcion,
        Activo
    )
    VALUES
    (
        @Nombre,
        @Descripcion,
        1
    );

    SELECT SCOPE_IDENTITY() AS RolId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Rol_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Rol_Update]
    @RolId          INT,
    @Nombre         VARCHAR(50),
    @Descripcion    VARCHAR(250) = NULL,
    @Activo         BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Rol
    SET
        Nombre = @Nombre,
        Descripcion = @Descripcion,
        Activo = @Activo
    WHERE RolId = @RolId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RolPermiso_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RolPermiso_Delete]
    @RolPermisoId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.RolPermiso
    WHERE RolPermisoId = @RolPermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RolPermiso_GetByRol] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   ROLPERMISO
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_RolPermiso_GetByRol]
    @RolId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        rp.RolPermisoId,
        rp.RolId,
        rp.PermisoId,
        p.Nombre AS PermisoNombre,
        rp.MenuId,
        m.Nombre AS MenuNombre,
        m.Modulo,
        m.Ruta
    FROM dbo.RolPermiso rp
    INNER JOIN dbo.Permiso p
        ON rp.PermisoId = p.PermisoId
    INNER JOIN dbo.Menu m
        ON rp.MenuId = m.MenuId
    WHERE rp.RolId = @RolId
    ORDER BY m.Modulo, m.OrdenVisual, p.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_RolPermiso_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_RolPermiso_Insert]
    @RolId       INT,
    @PermisoId   INT,
    @MenuId      INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.RolPermiso
    (
        RolId,
        PermisoId,
        MenuId
    )
    VALUES
    (
        @RolId,
        @PermisoId,
        @MenuId
    );

    SELECT SCOPE_IDENTITY() AS RolPermisoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockInsumo_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--StockInsumo

CREATE PROCEDURE [dbo].[sp_StockInsumo_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockInsumoId,
        si.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        si.DepositoId,
        d.Nombre AS DepositoNombre,
        si.CantidadActual,
        i.StockMinimo,
        CASE WHEN si.CantidadActual <= i.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockInsumo si
    INNER JOIN dbo.Insumo i ON si.InsumoId = i.InsumoId
    INNER JOIN dbo.Deposito d ON si.DepositoId = d.DepositoId
    ORDER BY i.Nombre, d.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockInsumo_GetByDeposito] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_StockInsumo_GetByDeposito]
    @DepositoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockInsumoId,
        si.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        si.DepositoId,
        d.Nombre AS DepositoNombre,
        si.CantidadActual,
        i.StockMinimo,
        CASE WHEN si.CantidadActual <= i.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockInsumo si
    INNER JOIN dbo.Insumo i ON si.InsumoId = i.InsumoId
    INNER JOIN dbo.Deposito d ON si.DepositoId = d.DepositoId
    WHERE si.DepositoId = @DepositoId
    ORDER BY i.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockInsumo_GetByInsumo] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_StockInsumo_GetByInsumo]
    @InsumoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        si.StockInsumoId,
        si.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        si.DepositoId,
        d.Nombre AS DepositoNombre,
        si.CantidadActual,
        i.StockMinimo,
        CASE WHEN si.CantidadActual <= i.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockInsumo si
    INNER JOIN dbo.Insumo i ON si.InsumoId = i.InsumoId
    INNER JOIN dbo.Deposito d ON si.DepositoId = d.DepositoId
    WHERE si.InsumoId = @InsumoId
    ORDER BY d.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockProducto_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


--StockProducto

CREATE PROCEDURE [dbo].[sp_StockProducto_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.StockProductoId,
        sp.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        sp.DepositoId,
        d.Nombre AS DepositoNombre,
        sp.CantidadActual,
        p.StockMinimo,
        CASE WHEN sp.CantidadActual <= p.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockProducto sp
    INNER JOIN dbo.Producto p ON sp.ProductoId = p.ProductoId
    INNER JOIN dbo.Deposito d ON sp.DepositoId = d.DepositoId
    ORDER BY p.Nombre, d.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockProducto_GetByDeposito] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_StockProducto_GetByDeposito]
    @DepositoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.StockProductoId,
        sp.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        sp.DepositoId,
        d.Nombre AS DepositoNombre,
        sp.CantidadActual,
        p.StockMinimo,
        CASE WHEN sp.CantidadActual <= p.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockProducto sp
    INNER JOIN dbo.Producto p ON sp.ProductoId = p.ProductoId
    INNER JOIN dbo.Deposito d ON sp.DepositoId = d.DepositoId
    WHERE sp.DepositoId = @DepositoId
    ORDER BY p.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockProducto_GetByProducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_StockProducto_GetByProducto]
    @ProductoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sp.StockProductoId,
        sp.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        sp.DepositoId,
        d.Nombre AS DepositoNombre,
        sp.CantidadActual,
        p.StockMinimo,
        CASE WHEN sp.CantidadActual <= p.StockMinimo THEN 1 ELSE 0 END AS EsStockCritico
    FROM dbo.StockProducto sp
    INNER JOIN dbo.Producto p ON sp.ProductoId = p.ProductoId
    INNER JOIN dbo.Deposito d ON sp.DepositoId = d.DepositoId
    WHERE sp.ProductoId = @ProductoId
    ORDER BY d.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockRecorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_StockRecorte_GetAll] AS
BEGIN
 SET NOCOUNT ON;
 SELECT s.StockRecorteId,s.RecorteId,r.OrdenProduccionId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
 r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.EstadoRecorteId,e.Nombre EstadoRecorteNombre,
 r.ColorId,c.Nombre ColorNombre,c.CodigoHex,r.Dimension,r.UnidadMedidaId,
 u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,s.DepositoId,
 d.Nombre DepositoNombre,s.CantidadActual,r.Observaciones,r.FechaAlta,
 r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta,i.ColorId InsumoColorId,ti.Nombre TipoInsumoNombre
 FROM dbo.StockRecorte s JOIN dbo.Recorte r ON r.RecorteId=s.RecorteId
 JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId JOIN dbo.Deposito d ON d.DepositoId=s.DepositoId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId
 ORDER BY s.StockRecorteId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_StockRecorte_GetByRecorte] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_StockRecorte_GetByRecorte] @RecorteId INT AS
BEGIN
 SET NOCOUNT ON;
 SELECT s.StockRecorteId,s.RecorteId,r.OrdenProduccionId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
 r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.EstadoRecorteId,e.Nombre EstadoRecorteNombre,
 r.ColorId,c.Nombre ColorNombre,c.CodigoHex,r.Dimension,r.UnidadMedidaId,
 u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,s.DepositoId,
 d.Nombre DepositoNombre,s.CantidadActual,r.Observaciones,r.FechaAlta,
 r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta,i.ColorId InsumoColorId,ti.Nombre TipoInsumoNombre
 FROM dbo.StockRecorte s JOIN dbo.Recorte r ON r.RecorteId=s.RecorteId
 JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId JOIN dbo.TipoInsumo ti ON ti.TipoInsumoId=i.TipoInsumoId JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId JOIN dbo.Deposito d ON d.DepositoId=s.DepositoId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId
 WHERE s.RecorteId=@RecorteId ORDER BY s.StockRecorteId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_SugerenciaRecorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   SUGERENCIARECORTE
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_SugerenciaRecorte_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sr.SugerenciaRecorteId,
        sr.FechaSugerencia,
        sr.Observaciones,
        COUNT(rps.RecorteProductoSugeridoId) AS CantidadSugerencias
    FROM dbo.SugerenciaRecorte sr
    LEFT JOIN dbo.RecorteProductoSugerido rps
        ON sr.SugerenciaRecorteId = rps.SugerenciaRecorteId
    GROUP BY
        sr.SugerenciaRecorteId,
        sr.FechaSugerencia,
        sr.Observaciones
    ORDER BY sr.FechaSugerencia DESC, sr.SugerenciaRecorteId DESC;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_SugerenciaRecorte_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_SugerenciaRecorte_GetById]
    @SugerenciaRecorteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        sr.SugerenciaRecorteId,
        sr.FechaSugerencia,
        sr.Observaciones
    FROM dbo.SugerenciaRecorte sr
    WHERE sr.SugerenciaRecorteId = @SugerenciaRecorteId;

    SELECT
        rps.RecorteProductoSugeridoId,
        rps.SugerenciaRecorteId,
        rps.RecorteId,
        r.InsumoId,
        i.Codigo AS InsumoCodigo,
        i.Nombre AS InsumoNombre,
        r.Dimension,
        r.UnidadMedidaId,
        um.Nombre AS UnidadMedidaNombre,
        um.Abreviatura AS UnidadMedidaAbreviatura,
        rps.ProductoId,
        p.Codigo AS ProductoCodigo,
        p.Nombre AS ProductoNombre,
        rps.PuntajeCompatibilidad,
        rps.Observaciones
    FROM dbo.RecorteProductoSugerido rps
    INNER JOIN dbo.Recorte r
        ON rps.RecorteId = r.RecorteId
    INNER JOIN dbo.Insumo i
        ON r.InsumoId = i.InsumoId
    INNER JOIN dbo.UnidadMedida um
        ON r.UnidadMedidaId = um.UnidadMedidaId
    INNER JOIN dbo.Producto p
        ON rps.ProductoId = p.ProductoId
    WHERE rps.SugerenciaRecorteId = @SugerenciaRecorteId
    ORDER BY rps.RecorteProductoSugeridoId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_SugerenciaRecorte_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_SugerenciaRecorte_Insert]
    @Observaciones VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.SugerenciaRecorte
    (
        FechaSugerencia,
        Observaciones
    )
    VALUES
    (
        GETDATE(),
        @Observaciones
    );

    SELECT SCOPE_IDENTITY() AS SugerenciaRecorteId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_CompraProveedor_Crear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Compra directa o desde oferta confirmada. JSON: [{"InsumoId":13,"Cantidad":2,"PrecioUnitario":1000}] */
CREATE   PROCEDURE [dbo].[sp_TEKA_CompraProveedor_Crear]
 @ProveedorId INT,@UsuarioId INT,@DetalleJson NVARCHAR(MAX),
 @OfertaProveedorId INT=NULL,@Observaciones NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@DetalleJson)<>1 OR LEFT(LTRIM(@DetalleJson),1)<>N'[' THROW 59100,'Detalle de compra JSON invalido.',1;
 DECLARE @D TABLE(InsumoId INT,Cantidad DECIMAL(18,2),Precio DECIMAL(18,2));
 INSERT @D SELECT InsumoId,Cantidad,PrecioUnitario FROM OPENJSON(@DetalleJson)
 WITH(InsumoId INT '$.InsumoId',Cantidad DECIMAL(18,2) '$.Cantidad',PrecioUnitario DECIMAL(18,2) '$.PrecioUnitario');
 IF NOT EXISTS(SELECT 1 FROM @D) OR EXISTS(SELECT 1 FROM @D WHERE InsumoId IS NULL OR Cantidad IS NULL OR Cantidad<=0 OR Precio IS NULL OR Precio<0)
 OR EXISTS(SELECT 1 FROM @D GROUP BY InsumoId HAVING COUNT(*)>1)
 THROW 59101,'Detalle de compra vacio, duplicado o con cantidades/precios invalidos.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedor WHERE ProveedorId=@ProveedorId AND Activo=1) THROW 59102,'Proveedor inexistente o inactivo.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 59103,'Usuario inexistente o inactivo.',1;
 IF EXISTS(SELECT 1 FROM @D d LEFT JOIN dbo.Insumo i ON i.InsumoId=d.InsumoId WHERE i.InsumoId IS NULL OR i.Activo=0)
 THROW 59104,'Insumo inexistente o inactivo.',1;
 IF @OfertaProveedorId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.OfertaProveedor WHERE OfertaProveedorId=@OfertaProveedorId AND ProveedorId=@ProveedorId AND Estado='Confirmada' AND (VigenciaHasta IS NULL OR VigenciaHasta>=CONVERT(DATE,GETDATE())))
 THROW 59105,'Oferta no confirmada, vencida o de otro proveedor.',1;
 BEGIN TRY
  BEGIN TRAN;
  INSERT dbo.CompraProveedor(ProveedorId,OfertaProveedorId,Observaciones,UsuarioId) VALUES(@ProveedorId,@OfertaProveedorId,@Observaciones,@UsuarioId);
  DECLARE @Id INT=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.CompraProveedorDetalle(CompraProveedorId,InsumoId,CantidadComprada,PrecioUnitario)
  SELECT @Id,InsumoId,Cantidad,Precio FROM @D;
  COMMIT;
  SELECT @Id AS CompraProveedorId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ComprobanteCorreo_Listar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_ComprobanteCorreo_Listar]
    @ComprobanteId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT EnvioComprobanteCorreoId, ComprobanteId, UsuarioId, Destinatario,
           Asunto, Estado, FechaSolicitud, FechaResultado, MensajeError, IdentificadorExterno
    FROM dbo.EnvioComprobanteCorreo
    WHERE ComprobanteId = @ComprobanteId
    ORDER BY FechaSolicitud DESC, EnvioComprobanteCorreoId DESC;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ComprobanteCorreo_RegistrarResultado] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_ComprobanteCorreo_RegistrarResultado]
    @EnvioComprobanteCorreoId BIGINT,
    @Enviado BIT,
    @MensajeError NVARCHAR(1000) = NULL,
    @IdentificadorExterno NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @Enviado IS NULL
        THROW 51605, 'Debe indicar el resultado del envio.', 1;
    IF @Enviado = 0 AND NULLIF(LTRIM(RTRIM(@MensajeError)), N'') IS NULL
        THROW 51606, 'Indique el error del envio fallido.', 1;

    UPDATE dbo.EnvioComprobanteCorreo
    SET Estado = CASE WHEN @Enviado = 1 THEN 'ENVIADO' ELSE 'ERROR' END,
        FechaResultado = SYSDATETIME(),
        MensajeError = CASE WHEN @Enviado = 1 THEN NULL ELSE @MensajeError END,
        IdentificadorExterno = @IdentificadorExterno
    WHERE EnvioComprobanteCorreoId = @EnvioComprobanteCorreoId
      AND Estado = 'PENDIENTE';

    IF @@ROWCOUNT <> 1
        THROW 51607, 'El envio no existe o ya tiene un resultado definitivo.', 1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ComprobanteCorreo_RegistrarSolicitud] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_ComprobanteCorreo_RegistrarSolicitud]
    @ComprobanteId INT,
    @Destinatario VARCHAR(254),
    @Asunto NVARCHAR(250),
    @UsuarioId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @Destinatario = NULLIF(LTRIM(RTRIM(@Destinatario)), '');
    SET @Asunto = NULLIF(LTRIM(RTRIM(@Asunto)), N'');

    IF @Destinatario IS NULL OR @Destinatario NOT LIKE '%_@_%._%'
        THROW 51601, 'Indique un correo destinatario valido.', 1;
    IF @Asunto IS NULL
        THROW 51602, 'El asunto es obligatorio.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.Comprobante WHERE ComprobanteId = @ComprobanteId
                   AND EstadoComprobante = 'EMITIDO')
        THROW 51603, 'El comprobante no existe o no esta emitido.', 1;
    IF @UsuarioId IS NOT NULL AND NOT EXISTS
       (SELECT 1 FROM dbo.Usuario WHERE UsuarioId = @UsuarioId)
        THROW 51604, 'El usuario indicado no existe.', 1;

    INSERT dbo.EnvioComprobanteCorreo(ComprobanteId, UsuarioId, Destinatario, Asunto, Estado)
    VALUES (@ComprobanteId, @UsuarioId, @Destinatario, @Asunto, 'PENDIENTE');

    SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS EnvioComprobanteCorreoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_FacturaProveedor_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Factura independiente del stock; puede llegar despues del remito. */
CREATE   PROCEDURE [dbo].[sp_TEKA_FacturaProveedor_Registrar]
 @ProveedorId INT,@CompraProveedorId INT=NULL,@NumeroFactura VARCHAR(50),
 @FechaEmision DATE,@FechaVencimiento DATE=NULL,@ImporteTotal DECIMAL(18,2),
 @UsuarioId INT,@Observaciones NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @ImporteTotal IS NULL OR @ImporteTotal<=0 OR NULLIF(LTRIM(RTRIM(@NumeroFactura)),'') IS NULL OR @FechaEmision IS NULL
 THROW 59150,'Factura con datos obligatorios invalidos.',1;
 IF @FechaVencimiento IS NOT NULL AND @FechaVencimiento<@FechaEmision THROW 59151,'Vencimiento anterior a emision.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedor WHERE ProveedorId=@ProveedorId AND Activo=1) THROW 59152,'Proveedor invalido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 59153,'Usuario invalido.',1;
 IF @CompraProveedorId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.CompraProveedor WHERE CompraProveedorId=@CompraProveedorId AND ProveedorId=@ProveedorId AND Estado<>'Cancelada')
 THROW 59154,'Compra de otro proveedor o cancelada.',1;
 INSERT dbo.FacturaProveedor(ProveedorId,CompraProveedorId,NumeroFactura,FechaEmision,FechaVencimiento,ImporteTotal,UsuarioId,Observaciones)
 VALUES(@ProveedorId,@CompraProveedorId,@NumeroFactura,@FechaEmision,@FechaVencimiento,@ImporteTotal,@UsuarioId,@Observaciones);
 SELECT CONVERT(INT,SCOPE_IDENTITY()) AS FacturaProveedorId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ListaMateriales_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_ListaMateriales_Activar] @ListaMaterialesId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ProductoId INT,@Lock INT,@Resource NVARCHAR(200);
 SELECT @ProductoId=ProductoId FROM dbo.ListaMateriales WHERE ListaMaterialesId=@ListaMaterialesId;
 IF @ProductoId IS NULL THROW 61011,'Configuracion inexistente.',1;
 SET @Resource=CONCAT('TEKA:BOM:PRODUCTO:',@ProductoId);
 BEGIN TRY BEGIN TRAN;
  EXEC @Lock=sys.sp_getapplock @Resource=@Resource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @Lock<0 THROW 61012,'No se pudo bloquear la configuracion del producto.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.ListaMateriales WITH(UPDLOCK,HOLDLOCK) WHERE ListaMaterialesId=@ListaMaterialesId AND ProductoId=@ProductoId) THROW 61011,'Configuracion inexistente.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.DetalleListaMateriales WHERE ListaMaterialesId=@ListaMaterialesId) THROW 61013,'No se puede activar una configuracion sin materiales.',1;
  UPDATE dbo.ListaMateriales SET Activa=0 WHERE ProductoId=@ProductoId AND ListaMaterialesId<>@ListaMaterialesId AND Activa=1;
  UPDATE dbo.ListaMateriales SET Activa=1 WHERE ListaMaterialesId=@ListaMaterialesId;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ListaMateriales_GuardarVersion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_ListaMateriales_GuardarVersion]
 @ProductoId INT,@Nombre VARCHAR(120),@Version VARCHAR(20),@MaterialesJson NVARCHAR(MAX),
 @RecortesPrevistosJson NVARCHAR(MAX)=N'[]',@Activar BIT=1
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@Nombre)),'') IS NULL OR NULLIF(LTRIM(RTRIM(@Version)),'') IS NULL THROW 61001,'Nombre y version son obligatorios.',1;
 IF ISJSON(@MaterialesJson)<>1 OR LEFT(LTRIM(@MaterialesJson),1)<>N'[' THROW 61002,'MaterialesJson invalido.',1;
 IF ISJSON(@RecortesPrevistosJson)<>1 OR LEFT(LTRIM(@RecortesPrevistosJson),1)<>N'[' THROW 61003,'RecortesPrevistosJson invalido.',1;
 DECLARE @M TABLE(InsumoId INT PRIMARY KEY,Cantidad DECIMAL(18,2),Observaciones VARCHAR(250));
 INSERT @M SELECT InsumoId,Cantidad,Observaciones FROM OPENJSON(@MaterialesJson)
 WITH(InsumoId INT '$.InsumoId',Cantidad DECIMAL(18,2) '$.Cantidad',Observaciones VARCHAR(250) '$.Observaciones');
 IF NOT EXISTS(SELECT 1 FROM @M) OR EXISTS(SELECT 1 FROM @M WHERE InsumoId IS NULL OR Cantidad<=0) THROW 61004,'La configuracion debe incluir materiales validos.',1;
 IF EXISTS(SELECT 1 FROM @M m LEFT JOIN dbo.Insumo i ON i.InsumoId=m.InsumoId AND i.Activo=1 WHERE i.InsumoId IS NULL) THROW 61005,'Hay insumos inexistentes o inactivos.',1;
 DECLARE @R TABLE(Fila INT IDENTITY(1,1),InsumoId INT,TipoRecorteId INT NULL,ColorId INT NULL,Dimension DECIMAL(18,2) NULL,UnidadMedidaId INT,CantidadPorUnidad DECIMAL(18,4),Observaciones VARCHAR(250));
 INSERT @R(InsumoId,TipoRecorteId,ColorId,Dimension,UnidadMedidaId,CantidadPorUnidad,Observaciones)
 SELECT InsumoId,TipoRecorteId,ColorId,Dimension,UnidadMedidaId,CantidadPorUnidad,Observaciones FROM OPENJSON(@RecortesPrevistosJson)
 WITH(InsumoId INT '$.InsumoId',TipoRecorteId INT '$.TipoRecorteId',ColorId INT '$.ColorId',Dimension DECIMAL(18,2) '$.Dimension',UnidadMedidaId INT '$.UnidadMedidaId',CantidadPorUnidad DECIMAL(18,4) '$.CantidadPorUnidad',Observaciones VARCHAR(250) '$.Observaciones');
 IF EXISTS(SELECT 1 FROM @R WHERE InsumoId IS NULL OR UnidadMedidaId IS NULL OR CantidadPorUnidad<=0 OR (Dimension IS NOT NULL AND Dimension<=0)) THROW 61006,'Hay recortes previstos invalidos.',1;
 IF EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId AND i.Activo=1 LEFT JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId AND u.Activo=1 WHERE i.InsumoId IS NULL OR u.UnidadMedidaId IS NULL) THROW 61007,'Insumo o unidad de recorte inexistente/inactivo.',1;
 IF EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.TipoRecorte t ON t.TipoRecorteId=r.TipoRecorteId AND t.Activo=1 WHERE r.TipoRecorteId IS NOT NULL AND t.TipoRecorteId IS NULL) THROW 61014,'Tipo de recorte inexistente o inactivo.',1;
 IF EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId AND c.Activo=1 WHERE r.ColorId IS NOT NULL AND c.ColorId IS NULL) THROW 61015,'Color inexistente o inactivo.',1;
 DECLARE @Lock INT,@Id INT,@Resource NVARCHAR(200)=CONCAT('TEKA:BOM:PRODUCTO:',@ProductoId);
 BEGIN TRY
  BEGIN TRAN;
  EXEC @Lock=sys.sp_getapplock @Resource=@Resource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @Lock<0 THROW 61008,'No se pudo bloquear la configuracion del producto.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Producto WITH(UPDLOCK,HOLDLOCK) WHERE ProductoId=@ProductoId AND Activo=1) THROW 61009,'Producto inexistente o inactivo.',1;
  IF EXISTS(SELECT 1 FROM dbo.ListaMateriales WHERE ProductoId=@ProductoId AND Version=@Version) THROW 61010,'La version ya existe para el producto.',1;
  IF @Activar=1 UPDATE dbo.ListaMateriales SET Activa=0 WHERE ProductoId=@ProductoId AND Activa=1;
  INSERT dbo.ListaMateriales(ProductoId,Nombre,Version,Activa,FechaAlta) VALUES(@ProductoId,LTRIM(RTRIM(@Nombre)),LTRIM(RTRIM(@Version)),@Activar,GETDATE());
  SET @Id=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.DetalleListaMateriales(ListaMaterialesId,InsumoId,Cantidad,Observaciones)
   SELECT @Id,InsumoId,Cantidad,Observaciones FROM @M;
  INSERT dbo.ListaMaterialesRecortePrevisto(ListaMaterialesId,InsumoId,TipoRecorteId,ColorId,Dimension,UnidadMedidaId,CantidadPorUnidad,Observaciones)
   SELECT @Id,InsumoId,TipoRecorteId,ColorId,Dimension,UnidadMedidaId,CantidadPorUnidad,Observaciones FROM @R;
  COMMIT;
  SELECT @Id ListaMaterialesId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ListaMateriales_Inactivar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_ListaMateriales_Inactivar] @ListaMaterialesId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 UPDATE dbo.ListaMateriales SET Activa=0 WHERE ListaMaterialesId=@ListaMaterialesId;
 IF @@ROWCOUNT<>1 THROW 61014,'Configuracion inexistente.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ListaMateriales_RecortesPrevistos_Get] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_ListaMateriales_RecortesPrevistos_Get] @ListaMaterialesId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT r.ListaMaterialesRecortePrevistoId,r.ListaMaterialesId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
  r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.ColorId,c.Nombre ColorNombre,r.Dimension,r.UnidadMedidaId,
  u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,r.CantidadPorUnidad,r.Observaciones
 FROM dbo.ListaMaterialesRecortePrevisto r JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId
 LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId WHERE r.ListaMaterialesId=@ListaMaterialesId ORDER BY r.ListaMaterialesRecortePrevistoId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_NotaCreditoProveedor_Registrar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Nota de credito: compensacion de deuda sin movimiento bancario ni de stock. */
CREATE   PROCEDURE [dbo].[sp_TEKA_NotaCreditoProveedor_Registrar]
 @FacturaProveedorId INT,@NumeroNota VARCHAR(50),@FechaEmision DATE,@Importe DECIMAL(18,2),
 @Motivo NVARCHAR(300),@UsuarioId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Importe IS NULL OR @Importe<=0 OR @FechaEmision IS NULL OR NULLIF(LTRIM(RTRIM(@NumeroNota)),'') IS NULL OR NULLIF(LTRIM(RTRIM(@Motivo)),'') IS NULL
 THROW 59160,'Nota de credito invalida.',1;
 BEGIN TRY
  BEGIN TRAN;
  IF NOT EXISTS(SELECT 1 FROM dbo.FacturaProveedor WITH(UPDLOCK,HOLDLOCK) WHERE FacturaProveedorId=@FacturaProveedorId AND Estado='Registrada')
  THROW 59161,'Factura inexistente o anulada.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 59162,'Usuario invalido.',1;
  IF @Importe>(SELECT Saldo FROM dbo.vw_ProveedorCuentaCorriente WHERE FacturaProveedorId=@FacturaProveedorId)
  THROW 59163,'La nota de credito excede el saldo de la factura.',1;
  INSERT dbo.NotaCreditoProveedor(FacturaProveedorId,NumeroNota,FechaEmision,Importe,Motivo,UsuarioId)
  VALUES(@FacturaProveedorId,@NumeroNota,@FechaEmision,@Importe,@Motivo,@UsuarioId);
  COMMIT;
  SELECT CONVERT(INT,SCOPE_IDENTITY()) AS NotaCreditoProveedorId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_ConsumosRecortes_GetByOrden] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Mantener consultas de consumos y resultados: sus tablas registran movimientos reales.
   Agregar consulta de consumo de recortes, sin introducir otra tabla. */
CREATE   PROCEDURE [dbo].[sp_TEKA_OP_ConsumosRecortes_GetByOrden] @OrdenProduccionId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT c.ConsumoRecorteProduccionId,c.OrdenProduccionId,c.RecorteId,
        c.DepositoId,c.FechaConsumo,c.CantidadConsumida,c.Observaciones
 FROM dbo.ConsumoRecorteProduccion c
 WHERE c.OrdenProduccionId=@OrdenProduccionId
 ORDER BY c.ConsumoRecorteProduccionId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_CrearMultiproducto] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* La creacion existente se mantiene, agregando el snapshot de recortes previstos despues de congelar la BOM. */
CREATE   PROCEDURE [dbo].[sp_TEKA_OP_CrearMultiproducto]
 @TipoProduccionId INT,@DetalleJson NVARCHAR(MAX),@Observaciones VARCHAR(500)=NULL,@RecortesJson NVARCHAR(MAX)=N'[]'
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@DetalleJson)<>1 OR LEFT(LTRIM(@DetalleJson),1)<>N'[' OR ISJSON(@RecortesJson)<>1 OR LEFT(LTRIM(@RecortesJson),1)<>N'[' THROW 58010,'JSON de creacion invalido.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetalleJson) WITH(ProductoId INT '$.ProductoId') GROUP BY ProductoId HAVING COUNT(*)>1) THROW 58011,'Detalle de OP duplicado.',1;
 DECLARE @D TABLE(ProductoId INT PRIMARY KEY,ListaMaterialesId INT NULL,Cantidad DECIMAL(18,2));
 INSERT @D SELECT ProductoId,ListaMaterialesId,CantidadPlanificada FROM OPENJSON(@DetalleJson) WITH(ProductoId INT '$.ProductoId',ListaMaterialesId INT '$.ListaMaterialesId',CantidadPlanificada DECIMAL(18,2) '$.CantidadPlanificada');
 IF EXISTS(SELECT 1 FROM OPENJSON(@RecortesJson) WITH(RecorteId INT '$.RecorteId') GROUP BY RecorteId HAVING COUNT(*)>1) THROW 59402,'Recorte repetido en el plan.',1;
 DECLARE @R TABLE(RecorteId INT PRIMARY KEY,Cantidad DECIMAL(18,2));
 INSERT @R SELECT RecorteId,Cantidad FROM OPENJSON(@RecortesJson) WITH(RecorteId INT '$.RecorteId',Cantidad DECIMAL(18,2) '$.Cantidad');
 IF NOT EXISTS(SELECT 1 FROM @D) OR EXISTS(SELECT 1 FROM @D WHERE ProductoId IS NULL OR Cantidad<=0) THROW 58011,'Detalle de OP vacio o invalido.',1;
 IF EXISTS(SELECT 1 FROM @D d LEFT JOIN dbo.Producto p ON p.ProductoId=d.ProductoId AND p.Activo=1 WHERE p.ProductoId IS NULL) THROW 59405,'Producto inexistente o inactivo.',1;
 IF EXISTS(SELECT 1 FROM @D d LEFT JOIN dbo.ListaMateriales l ON l.ListaMaterialesId=d.ListaMaterialesId WHERE d.ListaMaterialesId IS NOT NULL AND (l.ListaMaterialesId IS NULL OR l.ProductoId<>d.ProductoId OR l.Activa<>1)) THROW 58012,'La configuracion no corresponde al producto o no esta activa.',1;
 IF EXISTS(SELECT 1 FROM @D d WHERE d.ListaMaterialesId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.DetalleListaMateriales m WHERE m.ListaMaterialesId=d.ListaMaterialesId)) THROW 58013,'Una configuracion no tiene materiales.',1;
 IF EXISTS(SELECT 1 FROM @D d JOIN dbo.DetalleListaMateriales m ON m.ListaMaterialesId=d.ListaMaterialesId WHERE m.Cantidad<=0) THROW 58014,'Configuracion con cantidades invalidas.',1;
 IF EXISTS(SELECT 1 FROM @D d WHERE d.ListaMaterialesId IS NULL AND NOT EXISTS(SELECT 1 FROM dbo.ProductoCircular pc WHERE pc.ProductoId=d.ProductoId AND pc.Estado='Aprobado')) THROW 59404,'Solo un producto circular aprobado puede fabricarse sin configuracion de insumos.',1;
 IF EXISTS(SELECT 1 FROM @D WHERE ListaMaterialesId IS NULL) AND NOT EXISTS(SELECT 1 FROM @R) THROW 59406,'La OP con solo recortes requiere un plan de recortes.',1;
 IF EXISTS(SELECT 1 FROM @R WHERE RecorteId IS NULL OR Cantidad<=0) THROW 59403,'Plan de recortes invalido.',1;
 IF EXISTS(SELECT 1 FROM @R r WHERE NOT EXISTS(SELECT 1 FROM dbo.Recorte c WHERE c.RecorteId=r.RecorteId)) THROW 59407,'El plan contiene recortes inexistentes.',1;
 DECLARE @Pendiente INT=(SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre='Pendiente'),@Id INT;
 IF @Pendiente IS NULL THROW 58015,'No existe estado Pendiente.',1;
 BEGIN TRY BEGIN TRAN;
  INSERT dbo.OrdenProduccion(ProductoId,ListaMaterialesId,TipoProduccionId,EstadoOrdenProduccionId,FechaCreacion,CantidadPlanificada,CantidadProducida,Observaciones)
   SELECT TOP(1) ProductoId,ListaMaterialesId,@TipoProduccionId,@Pendiente,GETDATE(),Cantidad,0,@Observaciones FROM @D ORDER BY ProductoId;
  SET @Id=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.OrdenProduccionDetalle(OrdenProduccionId,ProductoId,ListaMaterialesId,CantidadPlanificada) SELECT @Id,ProductoId,ListaMaterialesId,Cantidad FROM @D;
  UPDATE d SET ProductoCircularId=pc.ProductoCircularId FROM dbo.OrdenProduccionDetalle d JOIN dbo.ProductoCircular pc ON pc.ProductoId=d.ProductoId WHERE d.OrdenProduccionId=@Id AND pc.Estado='Aprobado';
  INSERT dbo.OrdenProduccionRecortePlan(OrdenProduccionId,RecorteId,CantidadPlanificada) SELECT @Id,RecorteId,Cantidad FROM @R;
  INSERT dbo.OrdenProduccionBOMSnapshot(OrdenProduccionDetalleId,InsumoId,CantidadPorUnidad)
   SELECT d.OrdenProduccionDetalleId,m.InsumoId,SUM(CONVERT(DECIMAL(18,4),m.Cantidad)) FROM dbo.OrdenProduccionDetalle d JOIN dbo.DetalleListaMateriales m ON m.ListaMaterialesId=d.ListaMaterialesId WHERE d.OrdenProduccionId=@Id GROUP BY d.OrdenProduccionDetalleId,m.InsumoId;
  INSERT dbo.OrdenProduccionRecortePrevistoSnapshot(OrdenProduccionDetalleId,InsumoId,TipoRecorteId,ColorId,Dimension,UnidadMedidaId,CantidadPorUnidad,CantidadTotal,Observaciones)
   SELECT d.OrdenProduccionDetalleId,r.InsumoId,r.TipoRecorteId,r.ColorId,r.Dimension,r.UnidadMedidaId,r.CantidadPorUnidad,CAST(r.CantidadPorUnidad*d.CantidadPlanificada AS DECIMAL(18,4)),r.Observaciones
   FROM dbo.OrdenProduccionDetalle d JOIN dbo.ListaMaterialesRecortePrevisto r ON r.ListaMaterialesId=d.ListaMaterialesId WHERE d.OrdenProduccionId=@Id;
  INSERT dbo.HistorialEstadoOrdenProduccion(OrdenProduccionId,EstadoOrdenProduccionId,FechaCambio,Observaciones) VALUES(@Id,@Pendiente,GETDATE(),'Orden multiproducto creada con configuracion congelada');
  COMMIT; SELECT @Id OrdenProduccionId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_FinalizacionPreview] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_OP_FinalizacionPreview] @OrdenProduccionId INT AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.OrdenProduccion WHERE OrdenProduccionId=@OrdenProduccionId)
  THROW 59501,'Orden inexistente.',1;
 SELECT d.ProductoId,p.Codigo ProductoCodigo,p.Nombre ProductoNombre,d.CantidadPlanificada
 FROM dbo.OrdenProduccionDetalle d JOIN dbo.Producto p ON p.ProductoId=d.ProductoId
 WHERE d.OrdenProduccionId=@OrdenProduccionId ORDER BY p.Nombre;
 SELECT s.OrdenProduccionRecortePrevistoSnapshotId,s.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
  s.TipoRecorteId,tr.Nombre TipoRecorteNombre,s.ColorId,c.Nombre ColorNombre,s.Dimension,
  s.UnidadMedidaId,u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,
  s.CantidadPorUnidad,s.CantidadTotal CantidadSugerida,s.Observaciones
 FROM dbo.OrdenProduccionRecortePrevistoSnapshot s
 JOIN dbo.OrdenProduccionDetalle d ON d.OrdenProduccionDetalleId=s.OrdenProduccionDetalleId
 JOIN dbo.Insumo i ON i.InsumoId=s.InsumoId JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=s.UnidadMedidaId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=s.TipoRecorteId
 LEFT JOIN dbo.Color c ON c.ColorId=s.ColorId
 WHERE d.OrdenProduccionId=@OrdenProduccionId ORDER BY s.OrdenProduccionRecortePrevistoSnapshotId;
 SELECT r.RecorteId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,
  r.TipoRecorteId,tr.Nombre TipoRecorteNombre,r.EstadoRecorteId,e.Nombre EstadoRecorteNombre,
  r.ColorId,c.Nombre ColorNombre,r.Dimension,r.UnidadMedidaId,
  u.Nombre UnidadMedidaNombre,u.Abreviatura UnidadMedidaAbreviatura,r.Cantidad,r.FechaAlta,r.Observaciones,
  r.LargoMm,r.AnchoMm,r.EspesorMm,r.OrientacionVeta
 FROM dbo.Recorte r JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId
 JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId
 LEFT JOIN dbo.TipoRecorte tr ON tr.TipoRecorteId=r.TipoRecorteId
 LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId
 WHERE r.OrdenProduccionId=@OrdenProduccionId ORDER BY r.RecorteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_FinalizarIntegral] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Reemplaza solamente la finalizacion integral vigente del export revisado.
   Si la definicion real difiere, detener el despliegue y conciliarla. */
CREATE   PROCEDURE [dbo].[sp_TEKA_OP_FinalizarIntegral]
 @OrdenProduccionId INT,@ResultadosJson NVARCHAR(MAX),@RecortesJson NVARCHAR(MAX)=N'[]',@Observaciones VARCHAR(250)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@ResultadosJson)<>1 OR ISJSON(@RecortesJson)<>1 THROW 58030,'JSON de finalizacion invalido.',1;
 DECLARE @P TABLE(ProductoId INT PRIMARY KEY,Cantidad DECIMAL(18,2));
 INSERT @P SELECT ProductoId,Cantidad FROM OPENJSON(@ResultadosJson)
 WITH(ProductoId INT '$.ProductoId',Cantidad DECIMAL(18,2) '$.Cantidad');
 IF NOT EXISTS(SELECT 1 FROM @P) OR EXISTS(SELECT 1 FROM @P WHERE ProductoId IS NULL OR Cantidad<0)
    OR NOT EXISTS(SELECT 1 FROM @P WHERE Cantidad>0) THROW 58032,'Resultados invalidos.',1;
 DECLARE @R TABLE(Fila INT IDENTITY,InsumoId INT,TipoRecorteId INT NULL,EstadoRecorteId INT,
  ColorId INT NULL,Dimension DECIMAL(18,2) NULL,UnidadMedidaId INT,Cantidad DECIMAL(18,2),
  Observaciones VARCHAR(500),LargoMm DECIMAL(12,2) NULL,AnchoMm DECIMAL(12,2) NULL,
  EspesorMm DECIMAL(8,2) NULL,OrientacionVeta VARCHAR(20) NULL);
 INSERT @R(InsumoId,TipoRecorteId,EstadoRecorteId,ColorId,Dimension,UnidadMedidaId,Cantidad,
   Observaciones,LargoMm,AnchoMm,EspesorMm,OrientacionVeta)
 SELECT InsumoId,TipoRecorteId,EstadoRecorteId,ColorId,Dimension,UnidadMedidaId,Cantidad,
   Observaciones,LargoMm,AnchoMm,EspesorMm,OrientacionVeta
 FROM OPENJSON(@RecortesJson) WITH(InsumoId INT '$.InsumoId',TipoRecorteId INT '$.TipoRecorteId',
  EstadoRecorteId INT '$.EstadoRecorteId',ColorId INT '$.ColorId',Dimension DECIMAL(18,2) '$.Dimension',
  UnidadMedidaId INT '$.UnidadMedidaId',Cantidad DECIMAL(18,2) '$.Cantidad',
  Observaciones VARCHAR(500) '$.Observaciones',LargoMm DECIMAL(12,2) '$.LargoMm',
  AnchoMm DECIMAL(12,2) '$.AnchoMm',EspesorMm DECIMAL(8,2) '$.EspesorMm',
  OrientacionVeta VARCHAR(20) '$.OrientacionVeta');
 IF EXISTS(SELECT 1 FROM @R WHERE InsumoId IS NULL OR EstadoRecorteId IS NULL
   OR UnidadMedidaId IS NULL OR Cantidad<=0) THROW 58033,'Recortes confirmados invalidos.',1;
 IF EXISTS(SELECT 1 FROM @R WHERE LargoMm<=0 OR AnchoMm<=0 OR EspesorMm<=0
   OR (OrientacionVeta IS NOT NULL AND OrientacionVeta NOT IN ('Indiferente','Largo','Ancho')))
   THROW 63010,'Geometria de recorte invalida.',1;
 DECLARE @EnProceso INT=(SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre='En Proceso'),
  @Finalizada INT=(SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre='Finalizada'),
  @Entrada INT=(SELECT TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Entrada' AND Activo=1),
  @DepositoProductos INT,@DepositoRecortes INT,@Lock INT,@Recurso NVARCHAR(255)=CONCAT('TEKA:OP:',@OrdenProduccionId);
 SELECT @DepositoProductos=MIN(DepositoId) FROM dbo.Deposito WHERE Activo=1 AND Nombre=N'Dep'+NCHAR(243)+N'sito de Productos Terminados';
 SELECT @DepositoRecortes=MIN(DepositoId) FROM dbo.Deposito WHERE Activo=1 AND Nombre=N'Pa'+NCHAR(241)+N'ol de Recortes';
 IF @EnProceso IS NULL OR @Finalizada IS NULL OR @Entrada IS NULL
  OR (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo=1 AND Nombre=N'Dep'+NCHAR(243)+N'sito de Productos Terminados')<>1
  OR (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo=1 AND Nombre=N'Pa'+NCHAR(241)+N'ol de Recortes')<>1
  THROW 58034,'Estados, movimiento o depositos operativos faltantes/duplicados.',1;
 IF @DepositoProductos<>3 OR @DepositoRecortes<>4
  THROW 58034,'Los depositos operativos no coinciden con los admitidos por los procedimientos centrales de movimientos.',1;
 BEGIN TRY BEGIN TRAN;
  EXEC @Lock=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @Lock<0 THROW 58035,'No se pudo bloquear la OP.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.OrdenProduccion WITH(UPDLOCK,HOLDLOCK)
   WHERE OrdenProduccionId=@OrdenProduccionId AND EstadoOrdenProduccionId=@EnProceso)
   THROW 58036,'Solo puede finalizarse una OP En Proceso.',1;
  IF EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle d WHERE d.OrdenProduccionId=@OrdenProduccionId
    AND NOT EXISTS(SELECT 1 FROM @P p WHERE p.ProductoId=d.ProductoId))
    OR EXISTS(SELECT 1 FROM @P p WHERE NOT EXISTS(SELECT 1 FROM dbo.OrdenProduccionDetalle d
    WHERE d.OrdenProduccionId=@OrdenProduccionId AND d.ProductoId=p.ProductoId))
   THROW 58037,'Los resultados deben incluir exactamente los modelos de la OP.',1;
  IF EXISTS(SELECT 1 FROM @P p JOIN dbo.OrdenProduccionDetalle d
   ON d.OrdenProduccionId=@OrdenProduccionId AND d.ProductoId=p.ProductoId
   WHERE p.Cantidad>d.CantidadPlanificada)
   THROW 61030,'La cantidad fabricada no puede superar la cantidad planificada.',1;
  IF EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId AND i.Activo=1
   LEFT JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId AND u.Activo=1
   LEFT JOIN dbo.EstadoRecorte e ON e.EstadoRecorteId=r.EstadoRecorteId AND e.Activo=1 AND e.Nombre='Disponible'
   WHERE i.InsumoId IS NULL OR u.UnidadMedidaId IS NULL OR e.EstadoRecorteId IS NULL)
   THROW 61031,'Los recortes recuperados requieren insumos/unidades activos y estado Disponible.',1;
  IF EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.TipoRecorte t ON t.TipoRecorteId=r.TipoRecorteId AND t.Activo=1
   WHERE r.TipoRecorteId IS NOT NULL AND t.TipoRecorteId IS NULL)
   OR EXISTS(SELECT 1 FROM @R r LEFT JOIN dbo.Color c ON c.ColorId=r.ColorId AND c.Activo=1
   WHERE r.ColorId IS NOT NULL AND c.ColorId IS NULL)
   THROW 61032,'Los recortes contienen tipos o colores inexistentes/inactivos.',1;
  DECLARE @Producto INT,@Cantidad DECIMAL(18,2),@ResultadoId INT;
  DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT ProductoId,Cantidad FROM @P WHERE Cantidad>0 ORDER BY ProductoId;
  OPEN c; FETCH NEXT FROM c INTO @Producto,@Cantidad;
  WHILE @@FETCH_STATUS=0 BEGIN
   INSERT dbo.ResultadoProduccion(OrdenProduccionId,ProductoId,DepositoId,FechaResultado,CantidadIngresada,Observaciones)
    VALUES(@OrdenProduccionId,@Producto,@DepositoProductos,GETDATE(),@Cantidad,'Resultado integral de OP');
   SET @ResultadoId=CONVERT(INT,SCOPE_IDENTITY());
   EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Entrada,@DepositoId=@DepositoProductos,
    @ProductoId=@Producto,@Cantidad=@Cantidad,@Motivo='Finalizacion integral de OP',
    @EntidadOrigen='ResultadoProduccion',@OrigenId=@ResultadoId;
   FETCH NEXT FROM c INTO @Producto,@Cantidad;
  END; CLOSE c; DEALLOCATE c;
  DECLARE @Insumo INT,@Tipo INT,@Estado INT,@Color INT,@Dimension DECIMAL(18,2),@Unidad INT,
   @CantRec DECIMAL(18,2),@Obs VARCHAR(500),@RecorteId INT,@Largo DECIMAL(12,2),
   @Ancho DECIMAL(12,2),@Espesor DECIMAL(8,2),@Veta VARCHAR(20);
  DECLARE r CURSOR LOCAL FAST_FORWARD FOR SELECT InsumoId,TipoRecorteId,EstadoRecorteId,
   ColorId,Dimension,UnidadMedidaId,Cantidad,Observaciones,LargoMm,AnchoMm,EspesorMm,OrientacionVeta
   FROM @R ORDER BY Fila;
  OPEN r; FETCH NEXT FROM r INTO @Insumo,@Tipo,@Estado,@Color,@Dimension,@Unidad,@CantRec,@Obs,@Largo,@Ancho,@Espesor,@Veta;
  WHILE @@FETCH_STATUS=0 BEGIN
   INSERT dbo.Recorte(OrdenProduccionId,InsumoId,TipoRecorteId,EstadoRecorteId,ColorId,
    Dimension,UnidadMedidaId,Cantidad,Observaciones,FechaAlta,LargoMm,AnchoMm,EspesorMm,OrientacionVeta)
   VALUES(@OrdenProduccionId,@Insumo,@Tipo,@Estado,@Color,@Dimension,@Unidad,@CantRec,@Obs,
    GETDATE(),@Largo,@Ancho,@Espesor,@Veta);
   SET @RecorteId=CONVERT(INT,SCOPE_IDENTITY());
   INSERT dbo.HistorialEstadoRecorte(RecorteId,EstadoRecorteId,FechaCambio,Observaciones)
    VALUES(@RecorteId,@Estado,GETDATE(),'Recorte recuperado al finalizar OP');
   EXEC dbo.sp_MovimientoRecorte_Registrar @RecorteId=@RecorteId,@DepositoId=@DepositoRecortes,
    @TipoMovimiento='Alta',@Cantidad=@CantRec,@Observaciones='Recorte confirmado al finalizar OP';
   FETCH NEXT FROM r INTO @Insumo,@Tipo,@Estado,@Color,@Dimension,@Unidad,@CantRec,@Obs,@Largo,@Ancho,@Espesor,@Veta;
  END; CLOSE r; DEALLOCATE r;
  UPDATE dbo.OrdenProduccion SET EstadoOrdenProduccionId=@Finalizada,FechaFin=GETDATE(),
   CantidadProducida=(SELECT SUM(Cantidad) FROM @P) WHERE OrdenProduccionId=@OrdenProduccionId;
  INSERT dbo.HistorialEstadoOrdenProduccion(OrdenProduccionId,EstadoOrdenProduccionId,FechaCambio,Observaciones)
   VALUES(@OrdenProduccionId,@Finalizada,GETDATE(),COALESCE(@Observaciones,'Finalizacion integral de OP'));
  COMMIT;
 END TRY BEGIN CATCH
  IF CURSOR_STATUS('local','c')>=-1 BEGIN CLOSE c; DEALLOCATE c; END;
  IF CURSOR_STATUS('local','r')>=-1 BEGIN CLOSE r; DEALLOCATE r; END;
  IF @@TRANCOUNT>0 ROLLBACK; THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_Historial_Get] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_OP_Historial_Get] @OrdenProduccionId INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT h.HistorialEstadoOrdenProduccionId,h.OrdenProduccionId,h.EstadoOrdenProduccionId,e.Nombre EstadoOrdenProduccionNombre,h.FechaCambio,h.Observaciones
 FROM dbo.HistorialEstadoOrdenProduccion h JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=h.EstadoOrdenProduccionId
 WHERE h.OrdenProduccionId=@OrdenProduccionId ORDER BY h.FechaCambio,h.HistorialEstadoOrdenProduccionId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_IniciarIntegral] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* Inicio integral: conserva el motor existente y agrega validacion de estado,
   idempotencia por recorte y el enlace obligatorio consumo -> movimiento. */
CREATE   PROCEDURE [dbo].[sp_TEKA_OP_IniciarIntegral]
    @OrdenProduccionId INT,
    @RecortesJson NVARCHAR(MAX) = N'[]',
    @Observaciones VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISJSON(@RecortesJson) <> 1 OR LEFT(LTRIM(@RecortesJson), 1) <> N'['
        THROW 58020, 'RecortesJson invalido.', 1;
    IF EXISTS (
        SELECT 1 FROM OPENJSON(@RecortesJson) WITH (RecorteId INT '$.RecorteId')
        GROUP BY RecorteId HAVING COUNT(*) > 1
    )
        THROW 58021, 'Recorte duplicado.', 1;

    DECLARE @R TABLE(RecorteId INT PRIMARY KEY, Cantidad DECIMAL(18,2));
    INSERT @R
    SELECT RecorteId, Cantidad
    FROM OPENJSON(@RecortesJson)
    WITH (RecorteId INT '$.RecorteId', Cantidad DECIMAL(18,2) '$.Cantidad');
    IF EXISTS (SELECT 1 FROM @R WHERE RecorteId IS NULL OR Cantidad <= 0)
        THROW 58022, 'Recorte invalido.', 1;

    DECLARE @Pendiente INT = (SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre = 'Pendiente'),
            @EnProceso INT = (SELECT EstadoOrdenProduccionId FROM dbo.EstadoOrdenProduccion WHERE Nombre = 'En Proceso'),
            @Salida INT = (SELECT TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre = 'Salida' AND Activo = 1),
            @Disponible INT,
            @DepositoInsumos INT,
            @DepositoRecortes INT,
            @Lock INT,
            @Recurso NVARCHAR(255) = CONCAT('TEKA:OP:', @OrdenProduccionId);

    SELECT @DepositoInsumos = MIN(DepositoId) FROM dbo.Deposito WHERE Activo = 1 AND Nombre = 'Pañol de Insumos';
    SELECT @DepositoRecortes = MIN(DepositoId) FROM dbo.Deposito WHERE Activo = 1 AND Nombre = 'Pañol de Recortes';
    SELECT @Disponible = MIN(EstadoRecorteId) FROM dbo.EstadoRecorte WHERE Activo = 1 AND UPPER(LTRIM(RTRIM(Nombre))) = 'DISPONIBLE';

    IF @Pendiente IS NULL OR @EnProceso IS NULL OR @Salida IS NULL
       OR (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo = 1 AND Nombre = 'Pañol de Insumos') <> 1
       OR (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo = 1 AND Nombre = 'Pañol de Recortes') <> 1
       OR (SELECT COUNT(*) FROM dbo.EstadoRecorte WHERE Activo = 1 AND UPPER(LTRIM(RTRIM(Nombre))) = 'DISPONIBLE') <> 1
        THROW 58023, 'Estados, movimiento o depositos operativos faltantes/duplicados.', 1;
    IF @DepositoRecortes <> 4
        THROW 58023, 'El Panol de Recortes no coincide con el deposito admitido por el procedimiento central de movimientos.', 1;

    BEGIN TRY
        BEGIN TRAN;

        EXEC @Lock = sys.sp_getapplock
            @Resource = @Recurso,
            @LockMode = 'Exclusive',
            @LockOwner = 'Transaction',
            @LockTimeout = 15000;
        IF @Lock < 0 THROW 58024, 'No se pudo bloquear la OP.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM dbo.OrdenProduccion WITH (UPDLOCK, HOLDLOCK)
            WHERE OrdenProduccionId = @OrdenProduccionId
              AND EstadoOrdenProduccionId = @Pendiente
        )
            THROW 58025, 'Solo puede iniciarse una OP Pendiente.', 1;
        IF NOT EXISTS (SELECT 1 FROM dbo.OrdenProduccionDetalle WHERE OrdenProduccionId = @OrdenProduccionId)
            THROW 58026, 'OP sin detalle multiproducto.', 1;
        IF EXISTS (
            SELECT 1
            FROM @R r
            FULL OUTER JOIN (
                SELECT RecorteId, CantidadPlanificada
                FROM dbo.OrdenProduccionRecortePlan
                WHERE OrdenProduccionId = @OrdenProduccionId
            ) p ON p.RecorteId = r.RecorteId
            WHERE p.RecorteId IS NULL OR r.RecorteId IS NULL OR p.CantidadPlanificada <> r.Cantidad
        )
            THROW 59420, 'Los recortes deben coincidir con el plan congelado.', 1;

        DECLARE @C TABLE(InsumoId INT PRIMARY KEY, Cantidad DECIMAL(18,2));
        INSERT @C
        SELECT b.InsumoId, CAST(SUM(b.CantidadPorUnidad * d.CantidadPlanificada) AS DECIMAL(18,2))
        FROM dbo.OrdenProduccionDetalle d
        JOIN dbo.OrdenProduccionBOMSnapshot b ON b.OrdenProduccionDetalleId = d.OrdenProduccionDetalleId
        WHERE d.OrdenProduccionId = @OrdenProduccionId
        GROUP BY b.InsumoId;

        IF EXISTS (SELECT 1 FROM @C WHERE Cantidad <= 0)
            THROW 58027, 'Consumos de configuracion invalidos.', 1;
        IF NOT EXISTS (SELECT 1 FROM @C) AND NOT EXISTS (SELECT 1 FROM @R)
            THROW 59422, 'La OP no tiene materiales ni recortes para consumir.', 1;
        IF EXISTS (
            SELECT 1 FROM @C c
            LEFT JOIN dbo.StockInsumo s WITH (UPDLOCK, HOLDLOCK)
              ON s.InsumoId = c.InsumoId AND s.DepositoId = @DepositoInsumos
            WHERE ISNULL(s.CantidadActual, 0) < c.Cantidad
        )
            THROW 61021, 'Stock insuficiente para iniciar la orden.', 1;
        IF EXISTS (
            SELECT 1 FROM @R x
            LEFT JOIN dbo.Recorte rec WITH (UPDLOCK, HOLDLOCK)
              ON rec.RecorteId = x.RecorteId AND rec.EstadoRecorteId = @Disponible
            LEFT JOIN dbo.StockRecorte s WITH (UPDLOCK, HOLDLOCK)
              ON s.RecorteId = x.RecorteId AND s.DepositoId = @DepositoRecortes
            WHERE rec.RecorteId IS NULL OR ISNULL(s.CantidadActual, 0) <> x.Cantidad
        )
            THROW 59423, 'Cada recorte debe estar Disponible y consumirse por completo.', 1;
        IF EXISTS (
            SELECT 1 FROM @R x
            WHERE EXISTS (SELECT 1 FROM dbo.ConsumoRecorteProduccion c WITH (UPDLOCK, HOLDLOCK) WHERE c.RecorteId = x.RecorteId)
               OR EXISTS (SELECT 1 FROM dbo.MovimientoRecorte m WITH (UPDLOCK, HOLDLOCK) WHERE m.RecorteId = x.RecorteId AND m.TipoMovimiento = 'Uso')
        )
            THROW 62030, 'Uno de los recortes ya fue consumido.', 1;

        DECLARE @Insumo INT, @Cantidad DECIMAL(18,2), @ConsumoId INT;
        DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT InsumoId, Cantidad FROM @C ORDER BY InsumoId;
        OPEN c;
        FETCH NEXT FROM c INTO @Insumo, @Cantidad;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            INSERT dbo.ConsumoProduccion
                (OrdenProduccionId, InsumoId, DepositoId, FechaConsumo, CantidadConsumida, Observaciones)
            VALUES
                (@OrdenProduccionId, @Insumo, @DepositoInsumos, GETDATE(), @Cantidad, 'Consumo integral de OP');
            SET @ConsumoId = CONVERT(INT, SCOPE_IDENTITY());
            EXEC dbo.sp_MovimientoStock_RegistrarInsumo
                @TipoMovimientoStockId = @Salida,
                @DepositoId = @DepositoInsumos,
                @InsumoId = @Insumo,
                @Cantidad = @Cantidad,
                @Motivo = 'Inicio integral de OP',
                @EntidadOrigen = 'ConsumoProduccion',
                @OrigenId = @ConsumoId;
            FETCH NEXT FROM c INTO @Insumo, @Cantidad;
        END;
        CLOSE c;
        DEALLOCATE c;

        DECLARE @RecorteId INT, @CantRec DECIMAL(18,2), @ConsRecId INT;
        DECLARE r CURSOR LOCAL FAST_FORWARD FOR SELECT RecorteId, Cantidad FROM @R ORDER BY RecorteId;
        OPEN r;
        FETCH NEXT FROM r INTO @RecorteId, @CantRec;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            INSERT dbo.ConsumoRecorteProduccion
                (OrdenProduccionId, RecorteId, DepositoId, FechaConsumo, CantidadConsumida, Observaciones)
            VALUES
                (@OrdenProduccionId, @RecorteId, @DepositoRecortes, GETDATE(), @CantRec, 'Consumo integral de OP');
            SET @ConsRecId = CONVERT(INT, SCOPE_IDENTITY());
            EXEC dbo.sp_MovimientoRecorte_Registrar
                @RecorteId = @RecorteId,
                @DepositoId = @DepositoRecortes,
                @TipoMovimiento = 'Uso',
                @Cantidad = @CantRec,
                @Observaciones = 'Consumo integral de OP',
                @ConsumoRecorteProduccionId = @ConsRecId;
            FETCH NEXT FROM r INTO @RecorteId, @CantRec;
        END;
        CLOSE r;
        DEALLOCATE r;

        UPDATE dbo.OrdenProduccion
        SET EstadoOrdenProduccionId = @EnProceso, FechaInicio = GETDATE()
        WHERE OrdenProduccionId = @OrdenProduccionId;

        INSERT dbo.HistorialEstadoOrdenProduccion
            (OrdenProduccionId, EstadoOrdenProduccionId, FechaCambio, Observaciones)
        VALUES
            (@OrdenProduccionId, @EnProceso, GETDATE(), COALESCE(@Observaciones, 'Inicio integral de OP'));

        COMMIT;
    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'c') >= -1 BEGIN CLOSE c; DEALLOCATE c; END;
        IF CURSOR_STATUS('local', 'r') >= -1 BEGIN CLOSE r; DEALLOCATE r; END;
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OP_InicioPreview] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_OP_InicioPreview] @OrdenProduccionId INT
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @DepositoInsumos INT,@DepositoRecortes INT;
 SELECT @DepositoInsumos=MIN(DepositoId) FROM dbo.Deposito WHERE Activo=1 AND Nombre='Pañol de Insumos';
 SELECT @DepositoRecortes=MIN(DepositoId) FROM dbo.Deposito WHERE Activo=1 AND Nombre='Pañol de Recortes';
 IF (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo=1 AND Nombre='Pañol de Insumos')<>1 OR (SELECT COUNT(*) FROM dbo.Deposito WHERE Activo=1 AND Nombre='Pañol de Recortes')<>1 THROW 61020,'Los depositos operativos de Produccion faltan o estan duplicados.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.OrdenProduccion WHERE OrdenProduccionId=@OrdenProduccionId) THROW 59501,'Orden inexistente.',1;
 SELECT o.OrdenProduccionId,o.EstadoOrdenProduccionId,e.Nombre Estado,o.FechaCreacion FROM dbo.OrdenProduccion o JOIN dbo.EstadoOrdenProduccion e ON e.EstadoOrdenProduccionId=o.EstadoOrdenProduccionId WHERE o.OrdenProduccionId=@OrdenProduccionId;
 SELECT d.OrdenProduccionDetalleId,d.ProductoId,p.Codigo ProductoCodigo,p.Nombre ProductoNombre,d.CantidadPlanificada,d.ListaMaterialesId
 FROM dbo.OrdenProduccionDetalle d JOIN dbo.Producto p ON p.ProductoId=d.ProductoId WHERE d.OrdenProduccionId=@OrdenProduccionId ORDER BY p.Nombre;
 SELECT b.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,u.Abreviatura Unidad,
  CAST(SUM(b.CantidadPorUnidad*d.CantidadPlanificada) AS DECIMAL(18,2)) CantidadRequerida,@DepositoInsumos DepositoId,dep.Nombre DepositoNombre,
  CAST(ISNULL(s.CantidadActual,0) AS DECIMAL(18,2)) CantidadDisponible,
  CAST(CASE WHEN ISNULL(s.CantidadActual,0)<SUM(b.CantidadPorUnidad*d.CantidadPlanificada) THEN SUM(b.CantidadPorUnidad*d.CantidadPlanificada)-ISNULL(s.CantidadActual,0) ELSE 0 END AS DECIMAL(18,2)) Faltante
 FROM dbo.OrdenProduccionDetalle d JOIN dbo.OrdenProduccionBOMSnapshot b ON b.OrdenProduccionDetalleId=d.OrdenProduccionDetalleId
 JOIN dbo.Insumo i ON i.InsumoId=b.InsumoId JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId
 JOIN dbo.Deposito dep ON dep.DepositoId=@DepositoInsumos LEFT JOIN dbo.StockInsumo s ON s.InsumoId=b.InsumoId AND s.DepositoId=@DepositoInsumos
 WHERE d.OrdenProduccionId=@OrdenProduccionId GROUP BY b.InsumoId,i.Codigo,i.Nombre,u.Abreviatura,dep.Nombre,s.CantidadActual;
 SELECT rp.RecorteId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,r.Dimension,u.Abreviatura Unidad,
  rp.CantidadPlanificada CantidadRequerida,@DepositoRecortes DepositoId,dep.Nombre DepositoNombre,ISNULL(sr.CantidadActual,0) CantidadDisponible,
  CASE WHEN ISNULL(sr.CantidadActual,0)=rp.CantidadPlanificada THEN CAST(0 AS DECIMAL(18,2)) ELSE rp.CantidadPlanificada-ISNULL(sr.CantidadActual,0) END Faltante
 FROM dbo.OrdenProduccionRecortePlan rp JOIN dbo.Recorte r ON r.RecorteId=rp.RecorteId JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId
 JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId JOIN dbo.Deposito dep ON dep.DepositoId=@DepositoRecortes
 LEFT JOIN dbo.StockRecorte sr ON sr.RecorteId=rp.RecorteId AND sr.DepositoId=@DepositoRecortes WHERE rp.OrdenProduccionId=@OrdenProduccionId ORDER BY rp.RecorteId;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OrdenPagoProveedor_Confirmar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Confirmacion de pago: bloquea las facturas en orden deterministico, valida saldo y aplica.
 No hay pagos sin factura ni anticipos. */
CREATE   PROCEDURE [dbo].[sp_TEKA_OrdenPagoProveedor_Confirmar]
 @OrdenPagoProveedorId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ProveedorId INT,@FacturaId INT,@Monto DECIMAL(18,2),@Saldo DECIMAL(18,2);
 BEGIN TRY
  BEGIN TRAN;
  SELECT @ProveedorId=ProveedorId FROM dbo.OrdenPagoProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE OrdenPagoProveedorId=@OrdenPagoProveedorId AND Estado='Borrador';
  IF @ProveedorId IS NULL THROW 59180,'Orden de pago inexistente o ya procesada.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.OrdenPagoProveedorAplicacion WHERE OrdenPagoProveedorId=@OrdenPagoProveedorId)
  THROW 59181,'La orden de pago no tiene facturas.',1;
  DECLARE curFactura CURSOR LOCAL FAST_FORWARD FOR
   SELECT FacturaProveedorId,ImporteAplicado FROM dbo.OrdenPagoProveedorAplicacion
   WHERE OrdenPagoProveedorId=@OrdenPagoProveedorId ORDER BY FacturaProveedorId;
  OPEN curFactura; FETCH NEXT FROM curFactura INTO @FacturaId,@Monto;
  WHILE @@FETCH_STATUS=0
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.FacturaProveedor WITH(UPDLOCK,HOLDLOCK)
      WHERE FacturaProveedorId=@FacturaId AND ProveedorId=@ProveedorId AND Estado='Registrada')
    THROW 59182,'Factura no valida para el proveedor.',1;
   SELECT @Saldo=Saldo FROM dbo.vw_ProveedorCuentaCorriente WHERE FacturaProveedorId=@FacturaId;
   IF @Saldo IS NULL OR @Saldo<@Monto THROW 59183,'Importe aplicado supera el saldo de una factura.',1;
   FETCH NEXT FROM curFactura INTO @FacturaId,@Monto;
  END;
  CLOSE curFactura; DEALLOCATE curFactura;
  UPDATE dbo.OrdenPagoProveedor SET Estado='Confirmada',FechaConfirmacion=SYSDATETIME()
  WHERE OrdenPagoProveedorId=@OrdenPagoProveedorId;
  COMMIT;
 END TRY BEGIN CATCH
  IF CURSOR_STATUS('local','curFactura')>=0 CLOSE curFactura;
  IF CURSOR_STATUS('local','curFactura')>=-1 DEALLOCATE curFactura;
  IF @@TRANCOUNT>0 ROLLBACK; THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_OrdenPagoProveedor_Crear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* OP: solo contra facturas; una OP puede pagar varias facturas del mismo proveedor.
 JSON: [{"FacturaProveedorId":1,"ImporteAplicado":5000}] */
CREATE   PROCEDURE [dbo].[sp_TEKA_OrdenPagoProveedor_Crear]
 @ProveedorId INT,@UsuarioId INT,@AplicacionesJson NVARCHAR(MAX),
 @MedioPago NVARCHAR(80)=NULL,@Referencia NVARCHAR(120)=NULL,@Observaciones NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@AplicacionesJson)<>1 OR LEFT(LTRIM(@AplicacionesJson),1)<>N'[' THROW 59170,'Aplicaciones JSON invalidas.',1;
 DECLARE @D TABLE(FacturaProveedorId INT,Importe DECIMAL(18,2));
 INSERT @D SELECT FacturaProveedorId,ImporteAplicado FROM OPENJSON(@AplicacionesJson)
 WITH(FacturaProveedorId INT '$.FacturaProveedorId',ImporteAplicado DECIMAL(18,2) '$.ImporteAplicado');
 IF NOT EXISTS(SELECT 1 FROM @D) OR EXISTS(SELECT 1 FROM @D WHERE FacturaProveedorId IS NULL OR Importe IS NULL OR Importe<=0)
 OR EXISTS(SELECT 1 FROM @D GROUP BY FacturaProveedorId HAVING COUNT(*)>1)
 THROW 59171,'Aplicaciones vacias, duplicadas o invalidas.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Proveedor WHERE ProveedorId=@ProveedorId AND Activo=1) THROW 59172,'Proveedor invalido.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 59173,'Usuario invalido.',1;
 IF EXISTS(SELECT 1 FROM @D d LEFT JOIN dbo.FacturaProveedor f ON f.FacturaProveedorId=d.FacturaProveedorId
 WHERE f.FacturaProveedorId IS NULL OR f.ProveedorId<>@ProveedorId OR f.Estado<>'Registrada')
 THROW 59174,'Factura inexistente, anulada o de otro proveedor.',1;
 BEGIN TRY
  BEGIN TRAN;
  INSERT dbo.OrdenPagoProveedor(ProveedorId,MedioPago,Referencia,UsuarioId,Observaciones)
  VALUES(@ProveedorId,@MedioPago,@Referencia,@UsuarioId,@Observaciones);
  DECLARE @Id INT=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.OrdenPagoProveedorAplicacion(OrdenPagoProveedorId,FacturaProveedorId,ImporteAplicado)
  SELECT @Id,FacturaProveedorId,Importe FROM @D;
  COMMIT;
  SELECT @Id AS OrdenPagoProveedorId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PedidoManual_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Guarda pedido completo y confirma salida antes de terminar la transaccion. */
CREATE   PROCEDURE [dbo].[sp_TEKA_PedidoManual_Guardar]
 @ClienteId INT,@CanalVentaId INT,@DetallesJson NVARCHAR(MAX),@Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @PedidoId INT,@Pendiente INT;
 IF ISJSON(@DetallesJson)<>1 OR LEFT(LTRIM(@DetallesJson),1)<>N'['
  THROW 55001,'DetallesJson debe ser arreglo JSON.',1;
 DECLARE @L TABLE(ProductoId INT PRIMARY KEY,Cantidad DECIMAL(18,2),Precio DECIMAL(18,2));
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetallesJson) WITH(ProductoId INT '$.ProductoId',Cantidad DECIMAL(18,2) '$.Cantidad') j
 WHERE j.ProductoId IS NULL OR j.Cantidad IS NULL OR j.Cantidad<=0)
  THROW 55002,'Producto o cantidad invalida.',1;
 IF EXISTS(SELECT ProductoId FROM OPENJSON(@DetallesJson) WITH(ProductoId INT '$.ProductoId') GROUP BY ProductoId HAVING COUNT(*)>1)
  THROW 55003,'No repetir productos.',1;
 INSERT @L(ProductoId,Cantidad)
 SELECT ProductoId,Cantidad FROM OPENJSON(@DetallesJson) WITH(ProductoId INT '$.ProductoId',Cantidad DECIMAL(18,2) '$.Cantidad');
 IF NOT EXISTS(SELECT 1 FROM @L) THROW 55004,'Pedido sin productos.',1;
 BEGIN TRY BEGIN TRAN;
 IF NOT EXISTS(SELECT 1 FROM dbo.Cliente WHERE ClienteId=@ClienteId) THROW 55005,'Cliente inexistente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.CanalVenta WHERE CanalVentaId=@CanalVentaId AND Activo=1 AND Nombre NOT IN('E-commerce','Ecommerce'))
  THROW 55006,'Canal manual invalido.',1;
 SELECT @Pendiente=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Pendiente';
 IF @Pendiente IS NULL THROW 55007,'Falta estado Pendiente interno.',1;
 IF EXISTS(SELECT 1 FROM @L l LEFT JOIN dbo.Producto p ON p.ProductoId=l.ProductoId WHERE p.ProductoId IS NULL)
  THROW 55008,'Producto inexistente.',1;
 UPDATE l SET Precio=pv.Precio FROM @L l OUTER APPLY(
 SELECT TOP(1) pv.Precio FROM dbo.PrecioVenta pv WHERE pv.ProductoId=l.ProductoId AND pv.Activo=1
 AND pv.FechaVigenciaDesde<=GETDATE() AND (pv.FechaVigenciaHasta IS NULL OR pv.FechaVigenciaHasta>=GETDATE())
 ORDER BY pv.FechaVigenciaDesde DESC,pv.PrecioVentaId DESC) pv;
 IF EXISTS(SELECT 1 FROM @L WHERE Precio IS NULL OR Precio<0) THROW 55009,'Producto sin precio vigente.',1;
 INSERT dbo.Pedido(FechaPedido,ClienteId,CanalVentaId,EstadoPedidoId,Total,Observaciones)
 SELECT GETDATE(),@ClienteId,@CanalVentaId,@Pendiente,SUM(Cantidad*Precio),@Observaciones FROM @L;
 SET @PedidoId=CONVERT(INT,SCOPE_IDENTITY());
 INSERT dbo.DetallePedido(PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal)
 SELECT @PedidoId,ProductoId,Cantidad,Precio,Cantidad*Precio FROM @L;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones)
 VALUES(@PedidoId,@Pendiente,GETDATE(),'Alta interna atomica; sin borrador visible');
 EXEC dbo.sp_Pedido_ConfirmarPagado @PedidoId=@PedidoId,@DepositoId=3,
 @Observaciones='Venta manual guardada; stock descontado sin depender del cobro';
 COMMIT;
 SELECT @PedidoId AS PedidoId;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PedidoManual_ValidarEdicion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Punto unico para validar ediciones: pedido confirmado, sin cobros aplicados. */
CREATE   PROCEDURE [dbo].[sp_TEKA_PedidoManual_ValidarEdicion] @PedidoId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Pedido p JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId
 WHERE p.PedidoId=@PedidoId AND e.Nombre='Confirmado')
  THROW 55100,'Solo se editan pedidos confirmados, no cancelados ni entregados.',1;
 IF EXISTS(SELECT 1 FROM dbo.Cobro c JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
 WHERE c.PedidoId=@PedidoId AND ec.Nombre='Confirmado')
  THROW 55101,'Pedido con cobros confirmados: requiere regularizacion financiera.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PlantillaOP_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_PlantillaOP_GetAll] AS
BEGIN SET NOCOUNT ON; SELECT p.PlantillaOrdenProduccionId,p.Nombre,p.Observaciones,p.Activa,p.FechaAlta,COUNT(d.PlantillaOrdenProduccionDetalleId) CantidadModelos,COALESCE(SUM(d.Cantidad),0) CantidadTotal FROM dbo.PlantillaOrdenProduccion p LEFT JOIN dbo.PlantillaOrdenProduccionDetalle d ON d.PlantillaOrdenProduccionId=p.PlantillaOrdenProduccionId GROUP BY p.PlantillaOrdenProduccionId,p.Nombre,p.Observaciones,p.Activa,p.FechaAlta ORDER BY p.Nombre; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PlantillaOP_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_PlantillaOP_GetById] @Id INT AS
BEGIN SET NOCOUNT ON; SELECT PlantillaOrdenProduccionId,Nombre,Observaciones,Activa,FechaAlta FROM dbo.PlantillaOrdenProduccion WHERE PlantillaOrdenProduccionId=@Id; SELECT d.PlantillaOrdenProduccionDetalleId,d.ProductoId,p.Codigo ProductoCodigo,p.Nombre ProductoNombre,d.Cantidad FROM dbo.PlantillaOrdenProduccionDetalle d JOIN dbo.Producto p ON p.ProductoId=d.ProductoId WHERE d.PlantillaOrdenProduccionId=@Id ORDER BY p.Nombre; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PlantillaOP_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_PlantillaOP_Guardar] @Id INT=NULL,@Nombre VARCHAR(120),@Observaciones VARCHAR(500)=NULL,@DetalleJson NVARCHAR(MAX)
AS
BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; IF ISJSON(@DetalleJson)<>1 THROW 61040,'Detalle de plantilla invalido.',1; DECLARE @D TABLE(ProductoId INT PRIMARY KEY,Cantidad DECIMAL(18,2)); INSERT @D SELECT ProductoId,Cantidad FROM OPENJSON(@DetalleJson) WITH(ProductoId INT '$.ProductoId',Cantidad DECIMAL(18,2) '$.Cantidad'); IF NOT EXISTS(SELECT 1 FROM @D) OR EXISTS(SELECT 1 FROM @D WHERE Cantidad<=0) THROW 61041,'La plantilla requiere modelos y cantidades positivas.',1; IF EXISTS(SELECT 1 FROM @D d LEFT JOIN dbo.Producto p ON p.ProductoId=d.ProductoId AND p.Activo=1 WHERE p.ProductoId IS NULL) THROW 61042,'La plantilla contiene productos inactivos.',1; BEGIN TRY BEGIN TRAN; IF @Id IS NULL BEGIN INSERT dbo.PlantillaOrdenProduccion(Nombre,Observaciones) VALUES(@Nombre,@Observaciones); SET @Id=CONVERT(INT,SCOPE_IDENTITY()); END ELSE BEGIN UPDATE dbo.PlantillaOrdenProduccion SET Nombre=@Nombre,Observaciones=@Observaciones WHERE PlantillaOrdenProduccionId=@Id; IF @@ROWCOUNT<>1 THROW 61043,'Plantilla inexistente.',1; DELETE dbo.PlantillaOrdenProduccionDetalle WHERE PlantillaOrdenProduccionId=@Id; END; INSERT dbo.PlantillaOrdenProduccionDetalle(PlantillaOrdenProduccionId,ProductoId,Cantidad) SELECT @Id,ProductoId,Cantidad FROM @D; COMMIT; SELECT @Id PlantillaOrdenProduccionId; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_PlantillaOP_Inactivar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_PlantillaOP_Inactivar] @Id INT AS BEGIN SET NOCOUNT ON; UPDATE dbo.PlantillaOrdenProduccion SET Activa=0 WHERE PlantillaOrdenProduccionId=@Id; IF @@ROWCOUNT<>1 THROW 61044,'Plantilla inexistente.',1; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Produccion_ReporteConsumos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_Produccion_ReporteConsumos] @Desde DATE,@Hasta DATE
AS BEGIN SET NOCOUNT ON; SELECT c.FechaConsumo,c.OrdenProduccionId,c.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,u.Abreviatura Unidad,c.CantidadConsumida,d.Nombre DepositoNombre FROM dbo.ConsumoProduccion c JOIN dbo.Insumo i ON i.InsumoId=c.InsumoId JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=i.UnidadMedidaId JOIN dbo.Deposito d ON d.DepositoId=c.DepositoId WHERE c.FechaConsumo>=@Desde AND c.FechaConsumo<DATEADD(DAY,1,@Hasta) ORDER BY c.FechaConsumo,c.OrdenProduccionId; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Produccion_ReporteModelos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_Produccion_ReporteModelos] @Desde DATE,@Hasta DATE
AS BEGIN SET NOCOUNT ON; SELECT r.FechaResultado,r.OrdenProduccionId,r.ProductoId,p.Codigo ProductoCodigo,p.Nombre ProductoNombre,d.CantidadPlanificada,r.CantidadIngresada,(d.CantidadPlanificada-r.CantidadIngresada) Diferencia,dep.Nombre DepositoNombre FROM dbo.ResultadoProduccion r JOIN dbo.OrdenProduccionDetalle d ON d.OrdenProduccionId=r.OrdenProduccionId AND d.ProductoId=r.ProductoId JOIN dbo.Producto p ON p.ProductoId=r.ProductoId JOIN dbo.Deposito dep ON dep.DepositoId=r.DepositoId WHERE r.FechaResultado>=@Desde AND r.FechaResultado<DATEADD(DAY,1,@Hasta) ORDER BY r.FechaResultado,r.OrdenProduccionId; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Produccion_ReporteRecortesConsumidos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_Produccion_ReporteRecortesConsumidos] @Desde DATE,@Hasta DATE
AS BEGIN SET NOCOUNT ON; SELECT c.FechaConsumo Fecha,c.OrdenProduccionId,c.RecorteId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,r.Dimension,u.Abreviatura Unidad,c.CantidadConsumida Cantidad,d.Nombre DepositoNombre FROM dbo.ConsumoRecorteProduccion c JOIN dbo.Recorte r ON r.RecorteId=c.RecorteId JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId JOIN dbo.Deposito d ON d.DepositoId=c.DepositoId WHERE c.FechaConsumo>=@Desde AND c.FechaConsumo<DATEADD(DAY,1,@Hasta) ORDER BY c.FechaConsumo,c.OrdenProduccionId; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Produccion_ReporteRecortesRecuperados] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_Produccion_ReporteRecortesRecuperados] @Desde DATE,@Hasta DATE
AS BEGIN SET NOCOUNT ON; SELECT r.FechaAlta Fecha,r.OrdenProduccionId,r.RecorteId,r.InsumoId,i.Codigo InsumoCodigo,i.Nombre InsumoNombre,r.Dimension,u.Abreviatura Unidad,r.Cantidad,d.Nombre DepositoNombre FROM dbo.Recorte r JOIN dbo.Insumo i ON i.InsumoId=r.InsumoId JOIN dbo.UnidadMedida u ON u.UnidadMedidaId=r.UnidadMedidaId LEFT JOIN dbo.StockRecorte s ON s.RecorteId=r.RecorteId LEFT JOIN dbo.Deposito d ON d.DepositoId=s.DepositoId WHERE r.OrdenProduccionId IS NOT NULL AND r.FechaAlta>=@Desde AND r.FechaAlta<DATEADD(DAY,1,@Hasta) ORDER BY r.FechaAlta,r.OrdenProduccionId; END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ProductoCircular_AprobarDiseno] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Aprobacion crea una identidad comercial NUEVA. El ProductoId en la sugerencia
   original es el modelo de referencia, no el articulo vendible resultante.
   No crea stock ni marca como publicada una ficha de e-commerce.
   La BOM/OP se define posteriormente segun materiales efectivamente previstos. */
CREATE   PROCEDURE [dbo].[sp_TEKA_ProductoCircular_AprobarDiseno]
 @RecorteProductoSugeridoId INT,
 @Nombre VARCHAR(120),
 @Descripcion VARCHAR(500)=NULL,
 @TipoProductoId INT,
 @ColorId INT=NULL,
 @UnidadMedidaId INT,
 @AnchoCm DECIMAL(10,2),
 @AltoCm DECIMAL(10,2),
 @ProfundidadCm DECIMAL(10,2),
 @PrecioVenta DECIMAL(18,2),
 @Observaciones VARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 IF @Nombre IS NULL OR LEN(LTRIM(RTRIM(@Nombre)))=0 OR LEN(@Nombre)>120
  THROW 59300,'Nombre comercial obligatorio.',1;
 IF @PrecioVenta IS NULL OR @PrecioVenta<=0
  THROW 59301,'Definir un precio de venta positivo antes de aprobar.',1;
 IF @AnchoCm IS NULL OR @AltoCm IS NULL OR @ProfundidadCm IS NULL
    OR @AnchoCm<=0 OR @AltoCm<=0 OR @ProfundidadCm<=0
  THROW 59302,'Las dimensiones deben ser positivas.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.TipoProducto WHERE TipoProductoId=@TipoProductoId AND Activo=1)
  THROW 59303,'Tipo de producto inexistente o inactivo.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.UnidadMedida WHERE UnidadMedidaId=@UnidadMedidaId AND Activo=1)
  THROW 59304,'Unidad de medida inexistente.',1;
 DECLARE @ProductoModelo INT,@ProductoNuevo INT,@Bloqueo INT,@Recurso NVARCHAR(255);
 BEGIN TRY
  BEGIN TRAN;
  SET @Recurso=CONCAT(N'TEKA:CIRCULAR:SUG:',@RecorteProductoSugeridoId);
  EXEC @Bloqueo=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @Bloqueo<0 THROW 59305,'No se pudo bloquear la aprobacion del diseno.',1;
  SELECT @ProductoModelo=ProductoId
  FROM dbo.RecorteProductoSugerido WITH(UPDLOCK,HOLDLOCK)
  WHERE RecorteProductoSugeridoId=@RecorteProductoSugeridoId;
  IF @ProductoModelo IS NULL THROW 59306,'Sugerencia inexistente.',1;
  IF EXISTS(SELECT 1 FROM dbo.ProductoCircular WHERE RecorteProductoSugeridoId=@RecorteProductoSugeridoId)
   THROW 59307,'La sugerencia ya tiene un producto comercial aprobado.',1;
  INSERT dbo.Producto(Codigo,Nombre,Descripcion,TipoProductoId,ColorId,UnidadMedidaId,StockMinimo,Activo,FechaAlta)
  VALUES(CONCAT('TMP-C-',REPLACE(CONVERT(VARCHAR(36),NEWID()),'-','')),@Nombre,@Descripcion,@TipoProductoId,@ColorId,@UnidadMedidaId,0,1,GETDATE());
  SET @ProductoNuevo=CONVERT(INT,SCOPE_IDENTITY());
  UPDATE dbo.Producto SET Codigo=CONCAT('CIRC-',CONVERT(VARCHAR(20),@ProductoNuevo)) WHERE ProductoId=@ProductoNuevo;
  INSERT dbo.ProductoFichaTecnica(ProductoId,AnchoCm,AltoCm,ProfundidadCm)
  VALUES(@ProductoNuevo,@AnchoCm,@AltoCm,@ProfundidadCm);
  INSERT dbo.ProductoCircular(ProductoId,RecorteProductoSugeridoId,ProductoModeloReferenciaId,Observaciones)
  VALUES(@ProductoNuevo,@RecorteProductoSugeridoId,@ProductoModelo,@Observaciones);
  INSERT dbo.PrecioVenta(ProductoId,FechaVigenciaDesde,FechaVigenciaHasta,Precio,Activo)
  VALUES(@ProductoNuevo,GETDATE(),NULL,@PrecioVenta,1);
  COMMIT;
  SELECT @ProductoNuevo AS ProductoId, @RecorteProductoSugeridoId AS RecorteProductoSugeridoId;
 END TRY
 BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ProductoCircular_ListarVendibles] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Consulta del catalogo comercial circular. Stock fisico y cupo online se
   consultan por separado; la disponibilidad presencial = fisico - cupo online.
   No se altera la lista de productos comunes ni el circuito de pedidos. */
CREATE   PROCEDURE [dbo].[sp_TEKA_ProductoCircular_ListarVendibles]
AS
BEGIN
 SET NOCOUNT ON;
 SELECT pc.ProductoCircularId,p.ProductoId,p.Codigo,p.Nombre,p.Descripcion,
        pc.RecorteProductoSugeridoId,pc.ProductoModeloReferenciaId,
        pv.Precio AS PrecioVigente,
        ISNULL(sp.CantidadActual,0) AS StockFisico,
        ISNULL(po.CupoOnline,0) AS CupoOnline,
        ISNULL(sp.CantidadActual,0)-ISNULL(po.CupoOnline,0) AS DisponiblePresencial,
        pc.Estado
 FROM dbo.ProductoCircular pc
 JOIN dbo.Producto p ON p.ProductoId=pc.ProductoId
 OUTER APPLY (
  SELECT TOP(1) Precio FROM dbo.PrecioVenta
  WHERE ProductoId=p.ProductoId AND Activo=1 AND FechaVigenciaDesde<=GETDATE()
    AND (FechaVigenciaHasta IS NULL OR FechaVigenciaHasta>GETDATE())
  ORDER BY FechaVigenciaDesde DESC,PrecioVentaId DESC
 ) pv
 LEFT JOIN dbo.StockProducto sp ON sp.ProductoId=p.ProductoId AND sp.DepositoId=3
 LEFT JOIN dbo.ProductoDisponibilidadOnline po ON po.ProductoId=p.ProductoId AND po.DepositoId=3
 WHERE p.Activo=1 AND pc.Estado='Aprobado' AND pv.Precio IS NOT NULL;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ProductoCircular_VincularOP] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Solo se vincula una OP que ya contiene el producto circular como detalle.
   La OP puede estar pendiente o en proceso; una OP finalizada tambien puede
   vincularse para reconciliar historicos, sin tocar sus movimientos. */
CREATE   PROCEDURE [dbo].[sp_TEKA_ProductoCircular_VincularOP]
 @OrdenProduccionId INT,@ProductoId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @ProductoCircularId INT;
 SELECT @ProductoCircularId=ProductoCircularId FROM dbo.ProductoCircular
 WHERE ProductoId=@ProductoId AND Estado='Aprobado';
 IF @ProductoCircularId IS NULL THROW 59320,'Producto circular no aprobado.',1;
 BEGIN TRY
  BEGIN TRAN;
  UPDATE dbo.OrdenProduccionDetalle WITH(UPDLOCK)
  SET ProductoCircularId=@ProductoCircularId
  WHERE OrdenProduccionId=@OrdenProduccionId AND ProductoId=@ProductoId
    AND (ProductoCircularId IS NULL OR ProductoCircularId=@ProductoCircularId);
  IF @@ROWCOUNT<>1 THROW 59321,'La OP no contiene ese producto circular o el vinculo es inconsistente.',1;
  COMMIT;
 END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_RemitoProveedor_Confirmar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Confirmacion: descuento/ingreso SOLO aqui. Una transaccion para todos los insumos. */
CREATE   PROCEDURE [dbo].[sp_TEKA_RemitoProveedor_Confirmar]
 @RemitoRecepcionProveedorId INT,@UsuarioId INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @CompraId INT,@TipoEntrada INT,@Diferencias BIT=0;
 SELECT @TipoEntrada=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Entrada por Compra' AND Signo=1 AND Activo=1;
 IF @TipoEntrada IS NULL THROW 59140,'Falta tipo Entrada por Compra.',1;
 BEGIN TRY
  BEGIN TRAN;
  SELECT @CompraId=CompraProveedorId FROM dbo.RemitoRecepcionProveedor WITH(UPDLOCK,HOLDLOCK)
  WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND Estado='Borrador';
  IF @CompraId IS NULL THROW 59141,'Remito inexistente o ya confirmado.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 59142,'Usuario de confirmacion invalido.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedorDetalle WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId)
   THROW 59143,'El remito no tiene detalle.',1;
  IF EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedorDetalle d
    JOIN dbo.CompraProveedorDetalle c ON c.CompraProveedorId=@CompraId AND c.InsumoId=d.InsumoId
    WHERE d.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND d.CantidadRecibida<>c.CantidadComprada)
   SET @Diferencias=1;
  UPDATE d SET CantidadDiferencia=d.CantidadRecibida-c.CantidadComprada
  FROM dbo.RemitoRecepcionProveedorDetalle d JOIN dbo.CompraProveedorDetalle c ON c.CompraProveedorId=@CompraId AND c.InsumoId=d.InsumoId
  WHERE d.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId;
  DECLARE @InsumoId INT,@Cantidad DECIMAL(18,2);
  DECLARE cursorRecepcion CURSOR LOCAL FAST_FORWARD FOR
   SELECT InsumoId,CantidadRecibida FROM dbo.RemitoRecepcionProveedorDetalle
   WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND CantidadRecibida>0 ORDER BY InsumoId;
  OPEN cursorRecepcion; FETCH NEXT FROM cursorRecepcion INTO @InsumoId,@Cantidad;
  WHILE @@FETCH_STATUS=0
  BEGIN
   EXEC dbo.sp_MovimientoStock_RegistrarInsumo @TipoMovimientoStockId=@TipoEntrada,@DepositoId=2,
    @InsumoId=@InsumoId,@Cantidad=@Cantidad,@Motivo='Recepcion de remito proveedor',
    @EntidadOrigen='RemitoRecepcionProveedor',@OrigenId=@RemitoRecepcionProveedorId;
   FETCH NEXT FROM cursorRecepcion INTO @InsumoId,@Cantidad;
  END;
  CLOSE cursorRecepcion; DEALLOCATE cursorRecepcion;
  UPDATE dbo.RemitoRecepcionProveedor SET Estado=CASE WHEN @Diferencias=1 THEN 'ConDiferencias' ELSE 'Confirmado' END,
   FechaConfirmacion=SYSDATETIME(),UsuarioConfirmacionId=@UsuarioId
  WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId;
  UPDATE dbo.CompraProveedor SET Estado=CASE WHEN @Diferencias=1 THEN 'ConDiferencias' ELSE 'Recibida' END
  WHERE CompraProveedorId=@CompraId;
  COMMIT;
  SELECT @RemitoRecepcionProveedorId AS RemitoRecepcionProveedorId,
   CASE WHEN @Diferencias=1 THEN 'ConDiferencias' ELSE 'Confirmado' END AS Estado;
 END TRY BEGIN CATCH
  IF CURSOR_STATUS('local','cursorRecepcion')>=0 CLOSE cursorRecepcion;
  IF CURSOR_STATUS('local','cursorRecepcion')>=-1 DEALLOCATE cursorRecepcion;
  IF @@TRANCOUNT>0 ROLLBACK; THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_RemitoProveedor_CorregirCantidades] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* La correccion sustituye el conjunto completo de cantidades del remito.
   JSON: [{"InsumoId":13,"CantidadRecibida":18}]
   No permite agregar/quitar insumos, ni ajustar a negativo, ni corregir sin motivo.
   Cada diferencia genera UN movimiento (positivo o negativo), en Pañol de Insumos.
   Los movimientos previos se conservan: no se borran ni se desactivan.
*/
CREATE   PROCEDURE [dbo].[sp_TEKA_RemitoProveedor_CorregirCantidades]
 @RemitoRecepcionProveedorId INT,
 @UsuarioId INT,
 @DetalleJson NVARCHAR(MAX),
 @Motivo NVARCHAR(300)
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 IF NULLIF(LTRIM(RTRIM(@Motivo)),N'') IS NULL THROW 59510,'Indicar motivo de correccion.',1;
 IF ISJSON(@DetalleJson)<>1 OR LEFT(LTRIM(@DetalleJson),1)<>N'[' THROW 59511,'Se requiere arreglo JSON de cantidades.',1;
 DECLARE @D TABLE(InsumoId INT NOT NULL PRIMARY KEY,CantidadNueva DECIMAL(18,2) NULL);
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetalleJson) WITH(InsumoId INT '$.InsumoId')
  GROUP BY InsumoId HAVING COUNT(*)>1)
  THROW 59512,'Insumo duplicado en correccion.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetalleJson) WITH(InsumoId INT '$.InsumoId',CantidadRecibida DECIMAL(18,2) '$.CantidadRecibida')
  WHERE InsumoId IS NULL OR CantidadRecibida IS NULL OR CantidadRecibida<0)
  THROW 59513,'Insumo o cantidad invalida.',1;
 INSERT @D(InsumoId,CantidadNueva)
 SELECT InsumoId,CantidadRecibida FROM OPENJSON(@DetalleJson)
 WITH(InsumoId INT '$.InsumoId',CantidadRecibida DECIMAL(18,2) '$.CantidadRecibida');
 IF NOT EXISTS(SELECT 1 FROM @D) THROW 59514,'Detalle vacio.',1;
 DECLARE @CompraId INT,@TipoEntrada INT,@TipoSalida INT,@HayDiferencias BIT=0;
 DECLARE @Cambios TABLE(InsumoId INT PRIMARY KEY,Anterior DECIMAL(18,2),Nueva DECIMAL(18,2),Delta DECIMAL(18,2));
 BEGIN TRY
  BEGIN TRAN;
  SELECT @CompraId=CompraProveedorId FROM dbo.RemitoRecepcionProveedor WITH(UPDLOCK,HOLDLOCK)
   WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND Estado IN ('Confirmado','ConDiferencias');
  IF @CompraId IS NULL THROW 59515,'Remito inexistente o no confirmado.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
   THROW 59516,'Usuario inexistente o inactivo.',1;
  IF EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedorDetalle x
   WHERE x.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId
   AND NOT EXISTS(SELECT 1 FROM @D d WHERE d.InsumoId=x.InsumoId))
   OR EXISTS(SELECT 1 FROM @D d WHERE NOT EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedorDetalle x
    WHERE x.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND x.InsumoId=d.InsumoId))
   THROW 59517,'La correccion debe incluir exactamente los insumos del remito.',1;
  SELECT @TipoEntrada=TipoMovimientoStockId FROM dbo.TipoMovimientoStock
   WHERE Nombre='Entrada por Compra' AND Signo=1 AND Activo=1;
  /* La devolucion de una recepcion incorrecta se registra como ajuste negativo,
     manteniendo el origen y el motivo, sin anular movimientos historicos. */
  SELECT TOP(1) @TipoSalida=TipoMovimientoStockId FROM dbo.TipoMovimientoStock
   WHERE Signo=-1 AND Activo=1 AND Nombre IN ('Ajuste Negativo','Ajuste negativo','Ajuste de Stock Negativo')
   ORDER BY CASE WHEN Nombre='Ajuste Negativo' THEN 0 ELSE 1 END,TipoMovimientoStockId;
  IF @TipoEntrada IS NULL THROW 59518,'Falta tipo Entrada por Compra.',1;
  INSERT @Cambios(InsumoId,Anterior,Nueva,Delta)
  SELECT x.InsumoId,x.CantidadRecibida,d.CantidadNueva,d.CantidadNueva-x.CantidadRecibida
  FROM dbo.RemitoRecepcionProveedorDetalle x WITH(UPDLOCK,HOLDLOCK)
  JOIN @D d ON d.InsumoId=x.InsumoId
  WHERE x.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND x.CantidadRecibida<>d.CantidadNueva;
  IF EXISTS(SELECT 1 FROM @Cambios WHERE Delta<0) AND @TipoSalida IS NULL
   THROW 59519,'No existe tipo de movimiento de ajuste negativo activo.',1;
  DECLARE @InsumoId INT,@Delta DECIMAL(18,2),@CantidadAbs DECIMAL(18,2),@Tipo INT;
  DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT InsumoId,Delta FROM @Cambios ORDER BY InsumoId;
  OPEN cur;
  FETCH NEXT FROM cur INTO @InsumoId,@Delta;
  WHILE @@FETCH_STATUS=0
  BEGIN
   SET @CantidadAbs=ABS(@Delta);
   SET @Tipo=CASE WHEN @Delta>0 THEN @TipoEntrada ELSE @TipoSalida END;
   EXEC dbo.sp_MovimientoStock_RegistrarInsumo
    @TipoMovimientoStockId=@Tipo,@DepositoId=2,@InsumoId=@InsumoId,
    @Cantidad=@CantidadAbs,@Motivo='Correccion de recepcion proveedor',
    @EntidadOrigen='CorreccionRemitoProveedor',@OrigenId=@RemitoRecepcionProveedorId;
   FETCH NEXT FROM cur INTO @InsumoId,@Delta;
  END;
  CLOSE cur;
  DEALLOCATE cur;
  INSERT dbo.AuditoriaCorreccionRemitoProveedor
   (RemitoRecepcionProveedorId,InsumoId,CantidadAnterior,CantidadNueva,Diferencia,UsuarioId,Motivo)
  SELECT @RemitoRecepcionProveedorId,InsumoId,Anterior,Nueva,Delta,@UsuarioId,@Motivo FROM @Cambios;
  UPDATE x SET CantidadRecibida=d.CantidadNueva,
   CantidadDiferencia=d.CantidadNueva-c.CantidadComprada
  FROM dbo.RemitoRecepcionProveedorDetalle x
  JOIN @D d ON d.InsumoId=x.InsumoId
  JOIN dbo.CompraProveedorDetalle c ON c.CompraProveedorId=@CompraId AND c.InsumoId=x.InsumoId
  WHERE x.RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId;
  IF EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedorDetalle WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId AND CantidadDiferencia<>0)
   SET @HayDiferencias=1;
  UPDATE dbo.RemitoRecepcionProveedor SET Estado=CASE WHEN @HayDiferencias=1 THEN 'ConDiferencias' ELSE 'Confirmado' END
   WHERE RemitoRecepcionProveedorId=@RemitoRecepcionProveedorId;
  UPDATE dbo.CompraProveedor SET Estado=CASE WHEN @HayDiferencias=1 THEN 'ConDiferencias' ELSE 'Recibida' END
   WHERE CompraProveedorId=@CompraId;
  COMMIT;
  SELECT @RemitoRecepcionProveedorId AS RemitoRecepcionProveedorId,
   (SELECT COUNT(*) FROM @Cambios) AS InsumosCorregidos,
   CASE WHEN @HayDiferencias=1 THEN 'ConDiferencias' ELSE 'Confirmado' END AS Estado;
 END TRY
 BEGIN CATCH
  IF CURSOR_STATUS('local','cur')>=0 CLOSE cur;
  IF CURSOR_STATUS('local','cur')>=-1 DEALLOCATE cur;
  IF XACT_STATE()<>0 ROLLBACK;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_RemitoProveedor_Guardar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* JSON: [{"InsumoId":13,"CantidadRecibida":18,"ObservacionDiferencia":"Faltan 2"}]
   La operacion completa se confirma o revierte como una unidad.
   Los reintentos con la misma compra NO generan otro ingreso.
*/
CREATE   PROCEDURE [dbo].[sp_TEKA_RemitoProveedor_Guardar]
 @CompraProveedorId INT,
 @UsuarioId INT,
 @FechaRemito DATE,
 @NumeroRemito VARCHAR(40)=NULL,
 @DetalleJson NVARCHAR(MAX),
 @Observaciones NVARCHAR(500)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SET XACT_ABORT ON;
 IF @FechaRemito IS NULL THROW 59202,'Fecha del remito obligatoria.',1;
 IF ISJSON(@DetalleJson)<>1 OR LEFT(LTRIM(@DetalleJson),1)<>N'['
  THROW 59203,'Detalle JSON invalido: se requiere un arreglo.',1;
 DECLARE @D TABLE(InsumoId INT NOT NULL PRIMARY KEY,Cantidad DECIMAL(18,2) NULL,Observacion NVARCHAR(300) NULL);
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetalleJson) WITH(InsumoId INT '$.InsumoId') GROUP BY InsumoId HAVING COUNT(*)>1)
  THROW 59204,'Hay insumos duplicados en el remito.',1;
 IF EXISTS(SELECT 1 FROM OPENJSON(@DetalleJson) WITH(InsumoId INT '$.InsumoId') WHERE InsumoId IS NULL)
  THROW 59205,'Cada linea debe indicar un InsumoId valido.',1;
 INSERT @D(InsumoId,Cantidad,Observacion)
 SELECT InsumoId,CantidadRecibida,ObservacionDiferencia
 FROM OPENJSON(@DetalleJson)
 WITH(InsumoId INT '$.InsumoId',CantidadRecibida DECIMAL(18,2) '$.CantidadRecibida',ObservacionDiferencia NVARCHAR(300) '$.ObservacionDiferencia');
 IF NOT EXISTS(SELECT 1 FROM @D) OR EXISTS(SELECT 1 FROM @D WHERE Cantidad IS NULL OR Cantidad<0)
  THROW 59206,'Debe informar cantidades recibidas no negativas.',1;
 DECLARE @RemitoId INT;
 BEGIN TRY
  BEGIN TRAN;
  IF NOT EXISTS(SELECT 1 FROM dbo.CompraProveedor WITH(UPDLOCK,HOLDLOCK)
    WHERE CompraProveedorId=@CompraProveedorId AND Estado='Registrada')
   THROW 59207,'Compra inexistente, ya recibida o no habilitada.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1)
   THROW 59208,'Usuario inexistente o inactivo.',1;
  IF EXISTS(SELECT 1 FROM dbo.RemitoRecepcionProveedor WITH(UPDLOCK,HOLDLOCK)
    WHERE CompraProveedorId=@CompraProveedorId)
   THROW 59209,'Esta compra ya tiene un remito: no se puede ingresar stock nuevamente.',1;
  IF EXISTS(SELECT 1 FROM dbo.CompraProveedorDetalle c WHERE c.CompraProveedorId=@CompraProveedorId
    AND NOT EXISTS(SELECT 1 FROM @D d WHERE d.InsumoId=c.InsumoId))
   OR EXISTS(SELECT 1 FROM @D d WHERE NOT EXISTS(SELECT 1 FROM dbo.CompraProveedorDetalle c
    WHERE c.CompraProveedorId=@CompraProveedorId AND c.InsumoId=d.InsumoId))
   THROW 59210,'El detalle debe contener exactamente los insumos de la compra.',1;
  INSERT dbo.RemitoRecepcionProveedor
   (CompraProveedorId,NumeroRemito,FechaRemito,UsuarioRegistroId,Observaciones)
  VALUES(@CompraProveedorId,@NumeroRemito,@FechaRemito,@UsuarioId,@Observaciones);
  SET @RemitoId=CONVERT(INT,SCOPE_IDENTITY());
  INSERT dbo.RemitoRecepcionProveedorDetalle
   (RemitoRecepcionProveedorId,InsumoId,CantidadRecibida,ObservacionDiferencia)
  SELECT @RemitoId,InsumoId,Cantidad,Observacion FROM @D;
  /* Reutiliza el proceso transaccional existente: movimiento + diferencias + estados.
     SQL Server mantiene la transaccion externa hasta este COMMIT. */
  EXEC dbo.sp_TEKA_RemitoProveedor_Confirmar
   @RemitoRecepcionProveedorId=@RemitoId,@UsuarioId=@UsuarioId;
  COMMIT;
  SELECT r.RemitoRecepcionProveedorId,r.CompraProveedorId,r.Estado,r.FechaConfirmacion
  FROM dbo.RemitoRecepcionProveedor r WHERE r.RemitoRecepcionProveedorId=@RemitoId;
 END TRY
 BEGIN CATCH
  IF XACT_STATE()<>0 ROLLBACK;
  THROW;
 END CATCH;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_ValidarPedidoEditable] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[sp_TEKA_ValidarPedidoEditable]
@PedidoId INT
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @Estado VARCHAR(50);
 SELECT @Estado=e.Nombre FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK)
 JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId WHERE p.PedidoId=@PedidoId;
 IF @Estado IS NULL THROW 54200,'Pedido inexistente.',1;
 IF @Estado<>'Pendiente' THROW 54201,'Solo se editan pedidos pendientes.',1;
 IF EXISTS(SELECT 1 FROM dbo.Cobro WHERE PedidoId=@PedidoId)
  THROW 54202,'El pedido tiene cobros: no se permite editar sus productos.',1;

 IF EXISTS(SELECT 1 FROM dbo.Comprobante WHERE PedidoId=@PedidoId)
  THROW 54204,'El pedido tiene comprobantes: no se permite editar sus productos.',1;
 IF EXISTS(SELECT 1 FROM dbo.Remito WHERE PedidoId=@PedidoId)
  THROW 54205,'El pedido tiene remitos: no se permite editar sus productos.',1;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Venta_AnularIntegral] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_Venta_AnularIntegral]
 @PedidoId int,@UsuarioId int,@Motivo varchar(250),
 @MedioReintegro varchar(50)=NULL,@CajaId int=NULL,@ReferenciaReintegro varchar(100)=NULL,
 @MercaderiaRecibidaApta bit=0,@ReintegroRealizado bit=0,@CuentaBancariaId int=NULL
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @Estado varchar(50),@Cliente int,@Canal int,@Total decimal(18,2),
 @Pagado decimal(18,2),@BasePagada decimal(18,2),@ImporteDocumento decimal(18,2),@Venta int,@NC int,@Numero bigint,@PV int,
 @Devolucion int,@Cancelado int,@Entrada int,@TipoNC int,@Sesion bigint,@Inicial decimal(18,2),
 @Saldo decimal(28,2),@CajaMov bigint,@FinMov bigint,@ImportePrevio decimal(18,2),
 @Lock int,@Recurso nvarchar(255),@Entregado bit,@Producto int,@Deposito int,@Cantidad decimal(18,2),
 @SaldoCC decimal(28,2),@TipoCC int,@Referencia varchar(150),@Observacion varchar(500);
 SET @Motivo=NULLIF(LTRIM(RTRIM(@Motivo)),'');
 SET @MedioReintegro=NULLIF(LTRIM(RTRIM(@MedioReintegro)),'');
 SET @ReferenciaReintegro=NULLIF(LTRIM(RTRIM(@ReferenciaReintegro)),'');
 IF @PedidoId IS NULL OR @PedidoId<=0 OR @UsuarioId IS NULL OR @UsuarioId<=0 THROW 53800,'Pedido y responsable obligatorios.',1;
 IF @Motivo IS NULL THROW 53801,'Motivo obligatorio.',1;
 IF ISNULL(@MercaderiaRecibidaApta,0)<>1 OR ISNULL(@ReintegroRealizado,0)<>1 THROW 53802,'La anulacion requiere recepcion fisica apta y reintegro ya efectuado.',1;
 BEGIN TRY
 BEGIN TRAN;
 SET @Recurso=CONCAT(N'TEKA:B4:PEDIDO:',@PedidoId);
 EXEC @Lock=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
 IF @Lock<0 THROW 53805,'No se pudo bloquear la anulacion.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.Usuario WHERE UsuarioId=@UsuarioId AND Activo=1) THROW 53806,'Responsable inexistente o inactivo.',1;
 SELECT @Estado=e.Nombre,@Cliente=p.ClienteId,@Canal=p.CanalVentaId,@Total=p.Total
 FROM dbo.Pedido p WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoPedido e ON e.EstadoPedidoId=p.EstadoPedidoId
 WHERE p.PedidoId=@PedidoId;
 IF @Estado IS NULL THROW 53809,'Pedido inexistente.',1;
 IF @Total IS NULL OR @Total<0 THROW 53834,'Total de pedido inconsistente.',1;
 SELECT @Cancelado=EstadoPedidoId FROM dbo.EstadoPedido WHERE Nombre='Cancelado';
 IF @Cancelado IS NULL THROW 53817,'Falta estado Cancelado.',1;
 /* Reintento: devuelve las mismas identidades, sin repetir stock, egreso o NC.
    Una devolucion historica sin enlace financiero NO se reconstruye automaticamente. */
 IF @Estado='Cancelado'
 BEGIN
  SELECT @Devolucion=d.DevolucionVentaIntegralId,@NC=d.NotaCreditoId,@ImportePrevio=d.ImporteReintegrado,@ImporteDocumento=d.ImporteComprobante
  FROM dbo.DevolucionVentaIntegral d WITH(UPDLOCK,HOLDLOCK) WHERE d.PedidoId=@PedidoId;
  IF @Devolucion IS NOT NULL
  BEGIN
   IF NOT EXISTS(SELECT 1 FROM dbo.DevolucionVentaIntegral d JOIN dbo.EgresoDevolucionVenta eg ON eg.DevolucionVentaIntegralId=d.DevolucionVentaIntegralId
    WHERE d.DevolucionVentaIntegralId=@Devolucion AND d.Motivo=@Motivo
     AND d.MedioReintegro=@MedioReintegro AND ISNULL(d.CajaId,0)=ISNULL(@CajaId,0)
     AND ISNULL(d.ReferenciaReintegro,'')=ISNULL(@ReferenciaReintegro,'')
     AND ISNULL(eg.CuentaBancariaId,0)=ISNULL(@CuentaBancariaId,0) AND @ReintegroRealizado=1
     AND (eg.CajaMovimientoId IS NOT NULL OR eg.MovimientoFinancieroId IS NOT NULL)
     AND d.ComprobanteVentaId IS NOT NULL AND d.NotaCreditoId IS NOT NULL AND d.MercaderiaRecibidaApta=1
     AND EXISTS(SELECT 1 FROM dbo.Comprobante nc JOIN dbo.Comprobante v ON v.ComprobanteId=nc.ComprobanteAsociadoId
       JOIN dbo.TipoComprobante t ON t.TipoComprobanteId=nc.TipoComprobanteId
       WHERE nc.ComprobanteId=d.NotaCreditoId AND v.ComprobanteId=d.ComprobanteVentaId AND v.PedidoId=@PedidoId
        AND t.Nombre='Nota de credito interna' AND nc.EstadoComprobante='EMITIDO'))
     THROW 53832,'Pedido ya anulado: datos diferentes o reintegro historico sin integrar. Revisar el comprobante original.',1;
   SELECT @Numero=NumeroComprobante FROM dbo.Comprobante WHERE ComprobanteId=@NC;
   COMMIT;
   SELECT @PedidoId PedidoId,@NC NotaCreditoId,@Numero NumeroNotaCredito,@Devolucion DevolucionVentaIntegralId,
    @ImportePrevio ImporteReintegrado,@ImporteDocumento ImporteComprobante;
   RETURN;
  END;
  THROW 53832,'El pedido fue cancelado sin anulacion integral valida; no corresponde crear reintegro ni nota de credito.',1;
 END;
 IF @Estado<>'Entregado' THROW 53810,'Solo se anulan ventas pagadas y entregadas. La devolucion de senas antes de entrega esta pendiente y fuera de este circuito.',1;
 SET @Entregado=CASE WHEN @Estado='Entregado' OR EXISTS(SELECT 1 FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND (Entregado=1 OR FechaEntrega IS NOT NULL)) THEN 1 ELSE 0 END;
 IF NOT EXISTS(SELECT 1 FROM dbo.Remito WITH(UPDLOCK,HOLDLOCK)
  WHERE PedidoId=@PedidoId AND Entregado=1 AND FechaEntrega IS NOT NULL AND Anulado=0)
  THROW 53811,'Falta un remito entregado valido; regularizar antes de anular.',1;
 /* Bloquea cobros concurrentes por pedido. No anula cobros ni aplica un pago nuevo. */
 IF EXISTS(SELECT 1 FROM dbo.Cobro WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId AND ClienteId<>@Cliente)
   THROW 53835,'Hay cobros asociados a otro cliente: conciliar antes de anular.',1;
 IF EXISTS(SELECT 1 FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoCobro e ON e.EstadoCobroId=c.EstadoCobroId
   WHERE c.PedidoId=@PedidoId AND e.Nombre NOT IN('Confirmado','Anulado'))
   THROW 53814,'Hay cobros pendientes: resolverlos antes de anular.',1;
 SELECT @Pagado=COALESCE(SUM(c.ImporteFinal),0),@BasePagada=COALESCE(SUM(c.ImporteBase),0)
 FROM dbo.Cobro c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.EstadoCobro e ON e.EstadoCobroId=c.EstadoCobroId
 WHERE c.PedidoId=@PedidoId AND e.Nombre='Confirmado';
 IF @BasePagada<@Total-0.01 OR @BasePagada>@Total+0.01 OR @Pagado<=0 THROW 53815,'La venta debe estar completamente pagada con cobros confirmados conciliados antes de anular.',1;
 IF @Pagado>0 AND @ReintegroRealizado<>1 THROW 53816,'Hay dinero cobrado: registre su reintegro efectivo desde anulacion integral.',1;
 IF @Pagado=0 AND (@ReintegroRealizado=1 OR @MedioReintegro IS NOT NULL OR @CajaId IS NOT NULL OR @CuentaBancariaId IS NOT NULL OR @ReferenciaReintegro IS NOT NULL)
   THROW 53823,'No hay dinero cobrado: no corresponde registrar un egreso.',1;
 IF @Pagado>0
 BEGIN
  IF @MedioReintegro IS NULL OR @MedioReintegro NOT IN('Efectivo','Transferencia','Tarjeta','Plataforma') THROW 53803,'Medio de reintegro invalido.',1;
  IF (@MedioReintegro='Efectivo' AND (@CajaId IS NULL OR @CuentaBancariaId IS NOT NULL))
    OR (@MedioReintegro<>'Efectivo' AND @CajaId IS NOT NULL) THROW 53804,'Caja fisica corresponde solamente al efectivo.',1;
  IF @MedioReintegro<>'Efectivo' AND @ReferenciaReintegro IS NULL THROW 53824,'Falta referencia del reintegro electronico.',1;
  IF @MedioReintegro='Transferencia' AND @CuentaBancariaId IS NULL THROW 53825,'La transferencia requiere cuenta bancaria de origen.',1;
  IF @CuentaBancariaId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.CuentaBancariaTEKA WITH(UPDLOCK,HOLDLOCK) WHERE CuentaBancariaId=@CuentaBancariaId AND Activa=1 AND Moneda='ARS')
    THROW 53826,'Cuenta inexistente, inactiva o moneda incompatible con el pedido en ARS.',1;
 END;
 /* Restituir exclusivamente el neto descontado, no el detalle actual ni un deposito supuesto. */
 DECLARE @Restituir TABLE(ProductoId int,DepositoId int,Cantidad decimal(18,2),PRIMARY KEY(ProductoId,DepositoId));
 IF EXISTS(SELECT 1 FROM dbo.MovimientoStock WITH(UPDLOCK,HOLDLOCK) WHERE OrigenId=@PedidoId AND EntidadOrigen='PedidoCancelacion')
   THROW 53819,'Hay reposicion previa sin cierre de la cancelacion: conciliar antes de continuar.',1;
 INSERT @Restituir
 SELECT m.ProductoId,m.DepositoId,-SUM(CONVERT(decimal(28,2),m.Cantidad)*t.Signo)
 FROM dbo.MovimientoStock m WITH(UPDLOCK,HOLDLOCK) JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
 WHERE m.OrigenId=@PedidoId AND m.EntidadOrigen IN('Pedido','PedidoAjusteSalida','PedidoAjusteEntrada') AND m.Activo=1
 GROUP BY m.ProductoId,m.DepositoId HAVING SUM(CONVERT(decimal(28,2),m.Cantidad)*t.Signo)<>0;
 IF EXISTS(SELECT 1 FROM @Restituir WHERE Cantidad<=0 OR ProductoId IS NULL) THROW 53827,'Libro de stock inconsistente.',1;
 IF EXISTS(SELECT 1 FROM @Restituir) AND EXISTS(
  SELECT 1 FROM (SELECT ProductoId,SUM(Cantidad) Cantidad FROM @Restituir GROUP BY ProductoId) s
   FULL JOIN (SELECT ProductoId,SUM(Cantidad) Cantidad FROM dbo.DetallePedido WHERE PedidoId=@PedidoId GROUP BY ProductoId) d ON d.ProductoId=s.ProductoId
  WHERE ISNULL(s.Cantidad,0)<>ISNULL(d.Cantidad,0))
   THROW 53828,'El detalle no concilia con las salidas netas: no se repondra stock estimado.',1;
 IF @Estado IN('Confirmado','Entregado') AND NOT EXISTS(SELECT 1 FROM @Restituir) THROW 53821,'Falta salida original de stock; requiere conciliacion.',1;
 SELECT @Entrada=TipoMovimientoStockId FROM dbo.TipoMovimientoStock WHERE Nombre='Devolucion Cliente' AND Signo=1 AND Activo=1;
 IF EXISTS(SELECT 1 FROM @Restituir) AND @Entrada IS NULL THROW 53817,'Falta tipo Devolucion Cliente.',1;
 /* El registrador central actual solo admite deposito 3. No se cambia esa regla aqui:
    si un historico descontó otro deposito, la llamada con su deposito real falla y revierte todo. */
 SELECT @Venta=MIN(c.ComprobanteId),@PV=MIN(c.PuntoVenta)
 FROM dbo.Comprobante c WITH(UPDLOCK,HOLDLOCK) JOIN dbo.TipoComprobante t ON t.TipoComprobanteId=c.TipoComprobanteId
 WHERE c.PedidoId=@PedidoId AND t.Nombre='Comprobante interno de venta' AND c.ComprobanteAsociadoId IS NULL AND c.EstadoComprobante='EMITIDO';
 IF (SELECT COUNT(*) FROM dbo.Comprobante c JOIN dbo.TipoComprobante t ON t.TipoComprobanteId=c.TipoComprobanteId
  WHERE c.PedidoId=@PedidoId AND t.Nombre='Comprobante interno de venta' AND c.ComprobanteAsociadoId IS NULL AND c.EstadoComprobante='EMITIDO')>1
  THROW 53812,'Hay mas de un comprobante de venta emitido: revisar antes de anular.',1;
 IF @Venta IS NULL THROW 53812,'Falta el comprobante interno de venta emitido. La anulacion no puede completarse sin nota de credito.',1;
 IF @Venta IS NOT NULL
 BEGIN
  SELECT @ImporteDocumento=ImporteTotal FROM dbo.Comprobante WHERE ComprobanteId=@Venta;
  IF ABS(@ImporteDocumento-@Total)>0.01 THROW 53833,'El comprobante no concilia con el pedido: revisar antes de anular.',1;
  IF EXISTS(SELECT 1 FROM dbo.Comprobante WITH(UPDLOCK,HOLDLOCK) WHERE ComprobanteAsociadoId=@Venta)
   THROW 53813,'Ya existe documento asociado: revisar antes de anular.',1;
  SELECT @TipoNC=TipoComprobanteId FROM dbo.TipoComprobante WHERE Nombre='Nota de credito interna' AND Activo=1 AND EsNotaCredito=1;
  IF @TipoNC IS NULL THROW 53817,'Falta tipo Nota de credito interna.',1;
  EXEC @Lock=sys.sp_getapplock @Resource='TEKA_ComprobanteInterno_Numero',@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
  IF @Lock<0 THROW 53820,'No se pudo bloquear numeracion.',1;
  SELECT @Numero=ISNULL(MAX(NumeroComprobante),0)+1 FROM dbo.Comprobante WITH(UPDLOCK,HOLDLOCK)
   WHERE TipoComprobanteId=@TipoNC AND PuntoVenta=@PV;
  INSERT dbo.Comprobante(PedidoId,ClienteId,TipoComprobanteId,PuntoVenta,NumeroComprobante,FechaComprobante,TipoDocumentoId,DocumentoReceptor,CondicionIVAId,ConceptoComprobanteId,
    MonedaId,ImporteNoGravado,ImporteExento,ImporteNetoGravado,ImporteIVA,ImporteTributos,ImporteTotal,EstadoComprobante,Observaciones,ComprobanteAsociadoId)
  SELECT PedidoId,ClienteId,@TipoNC,PuntoVenta,@Numero,CAST(GETDATE() AS date),TipoDocumentoId,DocumentoReceptor,CondicionIVAId,ConceptoComprobanteId,MonedaId,
    ImporteNoGravado,ImporteExento,ImporteNetoGravado,ImporteIVA,ImporteTributos,ImporteTotal,'EMITIDO',CONCAT('Anulacion: ',@Motivo),ComprobanteId
  FROM dbo.Comprobante WHERE ComprobanteId=@Venta;
  SET @NC=CONVERT(int,SCOPE_IDENTITY());
  IF @NC IS NULL THROW 53836,'No se genero la nota de credito; se revierte toda la anulacion.',1;
  INSERT dbo.DetalleComprobante(ComprobanteId,ProductoId,DescripcionItem,Cantidad,PrecioUnitario,BonificacionImporte,ImporteNetoItem,AlicuotaIVAId,BaseImponibleIVA,ImporteIVAItem,ImporteTotalItem)
  SELECT @NC,ProductoId,DescripcionItem,Cantidad,PrecioUnitario,BonificacionImporte,ImporteNetoItem,AlicuotaIVAId,BaseImponibleIVA,ImporteIVAItem,ImporteTotalItem
  FROM dbo.DetalleComprobante WHERE ComprobanteId=@Venta;
 END;
 IF @Pagado>0
 BEGIN
  IF EXISTS(SELECT 1 FROM dbo.DevolucionVentaIntegral WITH(UPDLOCK,HOLDLOCK) WHERE PedidoId=@PedidoId) THROW 53808,'Existe devolucion previa inconsistente con el estado del pedido.',1;
  INSERT dbo.DevolucionVentaIntegral(PedidoId,ComprobanteVentaId,NotaCreditoId,UsuarioId,Motivo,MercaderiaRecibidaApta,ReintegroRealizado,MedioReintegro,CajaId,ReferenciaReintegro,ImporteReintegrado,ImporteComprobante)
  VALUES(@PedidoId,@Venta,@NC,@UsuarioId,@Motivo,@MercaderiaRecibidaApta,1,@MedioReintegro,@CajaId,@ReferenciaReintegro,@Pagado,@ImporteDocumento);
  SET @Devolucion=CONVERT(int,SCOPE_IDENTITY());
  SET @Referencia=COALESCE(@ReferenciaReintegro,CONCAT('DEV-',@Devolucion));
  SET @Observacion=CONCAT('Reintegro efectivo del pedido ',@PedidoId,': ',@Motivo);
  IF @MedioReintegro='Efectivo'
  BEGIN
   IF (SELECT COUNT(*) FROM dbo.CajaConfiguracion WHERE EsFisica=1)<>1
    OR NOT EXISTS(SELECT 1 FROM dbo.CajaConfiguracion f JOIN dbo.Caja c ON c.CajaId=f.CajaId WHERE f.CajaId=@CajaId AND f.EsFisica=1 AND c.Activo=1)
    THROW 53807,'El efectivo solo puede salir de Caja Principal configurada.',1;
   SELECT @Sesion=CajaSesionId,@Inicial=EfectivoInicial FROM dbo.CajaSesion WITH(UPDLOCK,HOLDLOCK) WHERE CajaId=@CajaId AND Estado='Abierta';
   IF @Sesion IS NULL THROW 53829,'Debe abrirse Caja Principal para registrar el reintegro en efectivo.',1;
   SELECT @Saldo=@Inicial+COALESCE(SUM(CASE WHEN Tipo IN('IngresoManual','Reposicion','IngresoCobro') THEN Importe ELSE -Importe END),0)
    FROM dbo.CajaMovimiento WITH(UPDLOCK,HOLDLOCK) WHERE CajaSesionId=@Sesion;
   IF @Saldo<@Pagado THROW 53830,'Efectivo insuficiente para el reintegro.',1;
   INSERT dbo.CajaMovimiento(CajaSesionId,Tipo,Importe,Concepto,Referencia,Observaciones,UsuarioId)
    VALUES(@Sesion,'Gasto',@Pagado,CONCAT('Devolucion de pedido ',@PedidoId),@Referencia,@Observacion,@UsuarioId);
   SET @CajaMov=CONVERT(bigint,SCOPE_IDENTITY());
  END ELSE BEGIN
   INSERT dbo.MovimientoFinanciero(FechaOperacion,Tipo,Medio,Importe,Concepto,Estado,OrigenTipo,OrigenId,CanalVentaId,CuentaBancariaId,ReferenciaExterna,UsuarioRegistroId,Observaciones)
   VALUES(SYSDATETIME(),'Egreso',CASE WHEN @MedioReintegro='Plataforma' THEN 'Pasarela' ELSE @MedioReintegro END,@Pagado,CONCAT('Devolucion de pedido ',@PedidoId),
    'Registrado','Devolucion',@Devolucion,@Canal,@CuentaBancariaId,@Referencia,@UsuarioId,@Observacion);
   SET @FinMov=CONVERT(bigint,SCOPE_IDENTITY());
  END;
  INSERT dbo.EgresoDevolucionVenta(DevolucionVentaIntegralId,MedioReintegro,CajaId,Importe,Referencia,CuentaBancariaId,CajaMovimientoId,MovimientoFinancieroId)
   VALUES(@Devolucion,@MedioReintegro,@CajaId,@Pagado,@ReferenciaReintegro,@CuentaBancariaId,@CajaMov,@FinMov);
 END;
 DECLARE devolucionStock CURSOR LOCAL FAST_FORWARD FOR SELECT ProductoId,DepositoId,Cantidad FROM @Restituir ORDER BY ProductoId,DepositoId;
 OPEN devolucionStock; FETCH NEXT FROM devolucionStock INTO @Producto,@Deposito,@Cantidad;
 WHILE @@FETCH_STATUS=0
 BEGIN
  EXEC dbo.sp_MovimientoStock_RegistrarProducto @TipoMovimientoStockId=@Entrada,@DepositoId=@Deposito,@ProductoId=@Producto,@Cantidad=@Cantidad,
   @Motivo=@Motivo,@EntidadOrigen='PedidoCancelacion',@OrigenId=@PedidoId;
  FETCH NEXT FROM devolucionStock INTO @Producto,@Deposito,@Cantidad;
 END;
 CLOSE devolucionStock; DEALLOCATE devolucionStock;
 /* Cancelar la deuda comercial, no los cobros historicos. Ajuste de saldo no es salida de dinero. */
 IF EXISTS(SELECT 1 FROM dbo.MovimientoCuentaCorrienteCliente WHERE PedidoId=@PedidoId AND ClienteId<>@Cliente)
  THROW 53831,'Cuenta corriente asociada a otro cliente: revisar.',1;
 SELECT @SaldoCC=COALESCE(SUM(CONVERT(decimal(28,2),m.Importe)*t.Signo),0)
 FROM dbo.MovimientoCuentaCorrienteCliente m WITH(UPDLOCK,HOLDLOCK) JOIN dbo.TipoMovimientoCuentaCorriente t ON t.TipoMovimientoCuentaCorrienteId=m.TipoMovimientoCuentaCorrienteId
 WHERE m.PedidoId=@PedidoId;
 IF @SaldoCC<>0
 BEGIN
  SELECT @TipoCC=TipoMovimientoCuentaCorrienteId FROM dbo.TipoMovimientoCuentaCorriente
   WHERE Nombre=CASE WHEN @SaldoCC>0 THEN 'Nota de credito' ELSE 'Ajuste deudor' END AND Activo=1 AND Signo=CASE WHEN @SaldoCC>0 THEN -1 ELSE 1 END;
  IF @TipoCC IS NULL THROW 53817,'Falta tipo de ajuste de cuenta corriente.',1;
  INSERT dbo.MovimientoCuentaCorrienteCliente(ClienteId,TipoMovimientoCuentaCorrienteId,FechaMovimiento,PedidoId,ComprobanteId,Importe,Observaciones)
   VALUES(@Cliente,@TipoCC,GETDATE(),@PedidoId,@NC,ABS(@SaldoCC),CONCAT('Anulacion pedido; compensacion de saldo, sin pago nuevo: ',@Motivo));
 END;
 UPDATE dbo.Pedido SET EstadoPedidoId=@Cancelado WHERE PedidoId=@PedidoId;
 INSERT dbo.HistorialEstadoPedido(PedidoId,EstadoPedidoId,FechaCambio,Observaciones,UsuarioId)
 VALUES(@PedidoId,@Cancelado,GETDATE(),LEFT(CONCAT('Anulacion segura: ',@Motivo),250),@UsuarioId);
 COMMIT;
 SELECT @PedidoId PedidoId,@NC NotaCreditoId,@Numero NumeroNotaCredito,@Devolucion DevolucionVentaIntegralId,@Pagado ImporteReintegrado,@ImporteDocumento ImporteComprobante;
 END TRY BEGIN CATCH
  IF CURSOR_STATUS('local','devolucionStock')>=0 CLOSE devolucionStock;
  IF CURSOR_STATUS('local','devolucionStock')>=-1 DEALLOCATE devolucionStock;
  IF @@TRANCOUNT>0 ROLLBACK;
  THROW;
 END CATCH;
END;
GO
/****** Objeto: StoredProcedure [dbo].[sp_TEKA_Ventas_SaldoPedido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_TEKA_Ventas_SaldoPedido]
 @PedidoId INT
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.Pedido WHERE PedidoId=@PedidoId)
  THROW 53220,'Pedido inexistente.',1;
 SELECT p.PedidoId, p.Total AS TotalPedido,
  ISNULL(SUM(CASE WHEN ec.Nombre='Confirmado' THEN c.ImporteFinal ELSE 0 END),0) AS TotalCobrado,
  CONVERT(DECIMAL(18,2),p.Total - ISNULL(SUM(CASE WHEN ec.Nombre='Confirmado' THEN c.ImporteBase ELSE 0 END),0)) AS Saldo
 FROM dbo.Pedido p
 LEFT JOIN dbo.Cobro c ON c.PedidoId=p.PedidoId
 LEFT JOIN dbo.EstadoCobro ec ON ec.EstadoCobroId=c.EstadoCobroId
 WHERE p.PedidoId=@PedidoId
 GROUP BY p.PedidoId,p.Total;
END;

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoComprobante_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- TIPOCOMPROBANTE
 
CREATE PROCEDURE [dbo].[sp_TipoComprobante_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoComprobanteId,
        Nombre,
        AfectaStock,
        AfectaCaja,
        Activo,
        CodigoARCA,
        Letra,
        EsNotaCredito,
        EsNotaDebito,
        RequiereAsociado
    FROM dbo.TipoComprobante
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoComprobante_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoComprobante_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoComprobanteId AS Id,
        Nombre AS Descripcion,
        Letra,
        CodigoARCA,
        EsNotaCredito,
        EsNotaDebito
    FROM dbo.TipoComprobante
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoDocumento_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- TIPODOCUMENTO

CREATE PROCEDURE [dbo].[sp_TipoDocumento_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoDocumentoId,
        CodigoARCA,
        Nombre,
        Activo
    FROM dbo.TipoDocumento
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoDocumento_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoDocumento_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoDocumentoId AS Id,
        Nombre AS Descripcion,
        CodigoARCA
    FROM dbo.TipoDocumento
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoInsumo_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--TipoInsumo

CREATE PROCEDURE [dbo].[sp_TipoInsumo_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoInsumoId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.TipoInsumo
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoInsumo_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoInsumo_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoInsumoId AS Id,
        Nombre AS Descripcion
    FROM dbo.TipoInsumo
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoMovimientoCuentaCorriente_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- TipoMovimientoCuentaCorriente

CREATE PROCEDURE [dbo].[sp_TipoMovimientoCuentaCorriente_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoMovimientoCuentaCorrienteId,
        Nombre,
        Signo,
        Activo
    FROM dbo.TipoMovimientoCuentaCorriente
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoMovimientoCuentaCorriente_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoMovimientoCuentaCorriente_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoMovimientoCuentaCorrienteId AS Id,
        Nombre AS Descripcion,
        Signo
    FROM dbo.TipoMovimientoCuentaCorriente
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoMovimientoStock_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


--TipoMovimientoStock


CREATE PROCEDURE [dbo].[sp_TipoMovimientoStock_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoMovimientoStockId,
        Nombre,
        Signo,
        Activo
    FROM dbo.TipoMovimientoStock
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoMovimientoStock_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_TipoMovimientoStock_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoMovimientoStockId AS Id,
        Nombre AS Descripcion,
        Signo
    FROM dbo.TipoMovimientoStock
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoProduccion_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--TipoProduccion

CREATE PROCEDURE [dbo].[sp_TipoProduccion_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoProduccionId,
        Nombre,
        Activo
    FROM dbo.TipoProduccion
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoProduccion_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoProduccion_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoProduccionId AS Id,
        Nombre AS Descripcion
    FROM dbo.TipoProduccion
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoProducto_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--TipoProducto

CREATE PROCEDURE [dbo].[sp_TipoProducto_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoProductoId,
        Nombre,
        Descripcion,
        Activo
    FROM dbo.TipoProducto
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoProducto_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_TipoProducto_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoProductoId AS Id,
        Nombre AS Descripcion
    FROM dbo.TipoProducto
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoRecorte_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   MÓDULO RECORTES
 ========================================================= */

 -- Tablas Auxiliares

CREATE PROCEDURE [dbo].[sp_TipoRecorte_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoRecorteId,
        Nombre,
        Activo
    FROM dbo.TipoRecorte
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_TipoRecorte_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_TipoRecorte_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        TipoRecorteId AS Id,
        Nombre AS Descripcion
    FROM dbo.TipoRecorte
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_UnidadMedida_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   MÓDULO INVENTARIO 
========================================================= */

--Tablas Auxiliares:

--UnidadMedida

CREATE PROCEDURE [dbo].[sp_UnidadMedida_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UnidadMedidaId,
        Nombre,
        Abreviatura,
        Activo
    FROM dbo.UnidadMedida
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_UnidadMedida_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_UnidadMedida_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UnidadMedidaId AS Id,
        Nombre AS Descripcion,
        Abreviatura
    FROM dbo.UnidadMedida
    WHERE Activo = 1
    ORDER BY Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Activar] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_Usuario_Activar]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        Activo = 1,
        MotivoInactivacionUsuarioId = NULL,
        ObservacionInactivacion = NULL,
        FechaInactivacion = NULL
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Bloquear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_Usuario_Bloquear]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET Bloqueado = 1
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_Delete]
    @UsuarioId INT,
    @MotivoInactivacionUsuarioId INT,
    @ObservacionInactivacion VARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        Activo = 0,
        MotivoInactivacionUsuarioId = @MotivoInactivacionUsuarioId,
        ObservacionInactivacion = @ObservacionInactivacion,
        FechaInactivacion = GETDATE()
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Desbloquear] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[sp_Usuario_Desbloquear]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        Bloqueado = 0,
        IntentosFallidos = 0
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetAll] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Activo,
        u.Bloqueado,
        u.IntentosFallidos,
        u.FechaAlta,
        u.UltimoLogin,
        u.MotivoInactivacionUsuarioId,
        miu.Nombre AS MotivoInactivacionUsuarioNombre,
        u.ObservacionInactivacion,
        u.FechaInactivacion
    FROM dbo.Usuario u
    LEFT JOIN dbo.MotivoInactivacionUsuario miu
        ON u.MotivoInactivacionUsuarioId = miu.MotivoInactivacionUsuarioId
    ORDER BY u.Username;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetById] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_GetById]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Activo,
        u.Bloqueado,
        u.IntentosFallidos,
        u.FechaAlta,
        u.UltimoLogin,
        u.MotivoInactivacionUsuarioId,
        miu.Nombre AS MotivoInactivacionUsuarioNombre,
        u.ObservacionInactivacion,
        u.FechaInactivacion
    FROM dbo.Usuario u
    LEFT JOIN dbo.MotivoInactivacionUsuario miu
        ON u.MotivoInactivacionUsuarioId = miu.MotivoInactivacionUsuarioId
    WHERE u.UsuarioId = @UsuarioId;

    SELECT
        ur.UsuarioRolId,
        ur.UsuarioId,
        ur.RolId,
        r.Nombre AS RolNombre
    FROM dbo.UsuarioRol ur
    INNER JOIN dbo.Rol r
        ON ur.RolId = r.RolId
    WHERE ur.UsuarioId = @UsuarioId
    ORDER BY r.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetByUsername] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   SPs ADICIONALES - SEGURIDAD
   - Usuario por username
   - Permisos efectivos del usuario
   - Validación de acceso a menú / permiso
   ========================================================= */

/* =========================================================
   USUARIO - GET BY USERNAME
   Ideal para login
   ========================================================= */
CREATE PROCEDURE [dbo].[sp_Usuario_GetByUsername]
    @Username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Password,
        u.Activo,
        u.Bloqueado,
        u.IntentosFallidos,
        u.FechaAlta,
        u.UltimoLogin,
        u.MotivoInactivacionUsuarioId,
        miu.Nombre AS MotivoInactivacionUsuarioNombre,
        u.ObservacionInactivacion,
        u.FechaInactivacion
    FROM dbo.Usuario u
    LEFT JOIN dbo.MotivoInactivacionUsuario miu
        ON u.MotivoInactivacionUsuarioId = miu.MotivoInactivacionUsuarioId
    WHERE u.Username = @Username;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetByUsernameOrEmail] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/* Fase 2 - Recuperación automática de contraseña.
   Conserva las tablas existentes. El token que se guarda en RecuperacionPassword es SHA-256 (no el token enviado por email). */
CREATE   PROCEDURE [dbo].[sp_Usuario_GetByUsernameOrEmail] @Valor VARCHAR(150) AS
BEGIN
 SET NOCOUNT ON;
 SELECT TOP 1 UsuarioId,Username,Nombre,Apellido,Email,Activo
 FROM dbo.Usuario
 WHERE LOWER(Username)=LOWER(LTRIM(RTRIM(@Valor))) OR LOWER(Email)=LOWER(LTRIM(RTRIM(@Valor)));
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetLookup] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_GetLookup]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UsuarioId AS Id,
        Username AS Descripcion,
        Nombre,
        Apellido,
        Email
    FROM dbo.Usuario
    WHERE Activo = 1
      AND Bloqueado = 0
    ORDER BY Username;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_GetPermisosEfectivos] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


/* =========================================================
   USUARIO - PERMISOS EFECTIVOS
   Devuelve todos los permisos del usuario por rol.
   Se usa para armar menú, permisos y navegación del frontend.
   ========================================================= */
CREATE PROCEDURE [dbo].[sp_Usuario_GetPermisosEfectivos]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT
        u.UsuarioId,
        u.Username,
        r.RolId,
        r.Nombre AS RolNombre,
        m.MenuId,
        m.Nombre AS MenuNombre,
        m.Ruta,
        m.Modulo,
        m.OrdenVisual,
        p.PermisoId,
        p.Nombre AS PermisoNombre
    FROM dbo.Usuario u
    INNER JOIN dbo.UsuarioRol ur
        ON u.UsuarioId = ur.UsuarioId
    INNER JOIN dbo.Rol r
        ON ur.RolId = r.RolId
    INNER JOIN dbo.RolPermiso rp
        ON r.RolId = rp.RolId
    INNER JOIN dbo.Menu m
        ON rp.MenuId = m.MenuId
    INNER JOIN dbo.Permiso p
        ON rp.PermisoId = p.PermisoId
    WHERE u.UsuarioId = @UsuarioId
      AND u.Activo = 1
      AND u.Bloqueado = 0
      AND r.Activo = 1
      AND m.Activo = 1
      AND p.Activo = 1
    ORDER BY
        m.OrdenVisual,
        m.Nombre,
        p.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_Insert]
    @Username       VARCHAR(50),
    @Nombre         VARCHAR(100),
    @Apellido       VARCHAR(100) = NULL,
    @Email          VARCHAR(150),
    @Password       VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Usuario
    (
        Username,
        Nombre,
        Apellido,
        Email,
        Password,
        Activo,
        Bloqueado,
        IntentosFallidos,
        FechaAlta,
        UltimoLogin
    )
    VALUES
    (
        @Username,
        @Nombre,
        @Apellido,
        @Email,
        @Password,
        1,
        0,
        0,
        GETDATE(),
        NULL
    );

    SELECT SCOPE_IDENTITY() AS UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Login] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   USUARIO - LOGIN
   Valida username y password.
   Bloquea al tercer intento fallido, excepto el usuario admin.
   ========================================================= */
CREATE PROCEDURE [dbo].[sp_Usuario_Login]
    @Username VARCHAR(50),
    @Password VARCHAR(255),
    @IpOrigen VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UsuarioId INT;
    DECLARE @PasswordActual VARCHAR(255);
    DECLARE @Activo BIT;
    DECLARE @Bloqueado BIT;
    DECLARE @IntentosFallidos INT;
    DECLARE @EsAdmin BIT = 0;

    SELECT
        @UsuarioId = UsuarioId,
        @PasswordActual = Password,
        @Activo = Activo,
        @Bloqueado = Bloqueado,
        @IntentosFallidos = IntentosFallidos,
        @EsAdmin = CASE WHEN Username = 'admin' THEN 1 ELSE 0 END
    FROM dbo.Usuario
    WHERE Username = @Username;

    IF @UsuarioId IS NULL
    BEGIN
        SELECT
            CAST(0 AS BIT) AS Exitoso,
            CAST(NULL AS INT) AS UsuarioId,
            'Usuario o contraseña incorrectos.' AS Mensaje;
        RETURN;
    END

    IF @Activo = 0
    BEGIN
        INSERT INTO dbo.AuditoriaSesion
        (
            UsuarioId,
            FechaLogin,
            Exitoso,
            IpOrigen,
            Observaciones
        )
        VALUES
        (
            @UsuarioId,
            GETDATE(),
            0,
            @IpOrigen,
            'Intento de login con usuario inactivo'
        );

        SELECT
            CAST(0 AS BIT) AS Exitoso,
            @UsuarioId AS UsuarioId,
            'El usuario se encuentra inactivo.' AS Mensaje;
        RETURN;
    END

    IF @Bloqueado = 1
    BEGIN
        INSERT INTO dbo.AuditoriaSesion
        (
            UsuarioId,
            FechaLogin,
            Exitoso,
            IpOrigen,
            Observaciones
        )
        VALUES
        (
            @UsuarioId,
            GETDATE(),
            0,
            @IpOrigen,
            'Intento de login con usuario bloqueado'
        );

        SELECT
            CAST(0 AS BIT) AS Exitoso,
            @UsuarioId AS UsuarioId,
            'El usuario se encuentra bloqueado.' AS Mensaje;
        RETURN;
    END

    IF @PasswordActual <> @Password
    BEGIN
        UPDATE dbo.Usuario
        SET
            IntentosFallidos = IntentosFallidos + 1,
            Bloqueado =
                CASE
                    WHEN @EsAdmin = 1 THEN 0
                    WHEN IntentosFallidos + 1 >= 3 THEN 1
                    ELSE Bloqueado
                END
        WHERE UsuarioId = @UsuarioId;

        INSERT INTO dbo.AuditoriaSesion
        (
            UsuarioId,
            FechaLogin,
            Exitoso,
            IpOrigen,
            Observaciones
        )
        VALUES
        (
            @UsuarioId,
            GETDATE(),
            0,
            @IpOrigen,
            'Login fallido'
        );

        SELECT
            CAST(0 AS BIT) AS Exitoso,
            @UsuarioId AS UsuarioId,
            CASE
                WHEN @EsAdmin = 0 AND @IntentosFallidos + 1 >= 3
                    THEN 'Usuario bloqueado por superar la cantidad de intentos permitidos.'
                ELSE 'Usuario o contraseña incorrectos.'
            END AS Mensaje;
        RETURN;
    END

    UPDATE dbo.Usuario
    SET
        IntentosFallidos = 0,
        Bloqueado = 0,
        UltimoLogin = GETDATE()
    WHERE UsuarioId = @UsuarioId;

    INSERT INTO dbo.AuditoriaSesion
    (
        UsuarioId,
        FechaLogin,
        Exitoso,
        IpOrigen,
        Observaciones
    )
    VALUES
    (
        @UsuarioId,
        GETDATE(),
        1,
        @IpOrigen,
        'Login exitoso'
    );

    SELECT
        CAST(1 AS BIT) AS Exitoso,
        u.UsuarioId,
        u.Username,
        u.Nombre,
        u.Apellido,
        u.Email,
        u.Activo,
        u.Bloqueado,
        u.IntentosFallidos,
        u.FechaAlta,
        u.UltimoLogin,
        r.RolId,
        r.Nombre AS RolNombre,
        r.Descripcion AS RolDescripcion,
        'Login exitoso.' AS Mensaje
    FROM dbo.Usuario u
    LEFT JOIN dbo.UsuarioRol ur
        ON u.UsuarioId = ur.UsuarioId
    LEFT JOIN dbo.Rol r
        ON ur.RolId = r.RolId
    WHERE u.UsuarioId = @UsuarioId
    ORDER BY r.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_LoginExitoso] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_LoginExitoso]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        IntentosFallidos = 0,
        UltimoLogin = GETDATE()
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_LoginFallido] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_LoginFallido]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        IntentosFallidos = IntentosFallidos + 1
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_ResetPasswordAdmin] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_ResetPasswordAdmin]
    @UsuarioId INT,
    @PasswordNueva VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        Password = @PasswordNueva,
        Bloqueado = 0,
        IntentosFallidos = 0
    WHERE UsuarioId = @UsuarioId
      AND Activo = 1;

    SELECT @@ROWCOUNT AS RegistrosAfectados;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_ResetPasswordRecuperacion] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_Usuario_ResetPasswordRecuperacion] @UsuarioId INT,@PasswordNueva VARCHAR(255) AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.Usuario
 SET Password=@PasswordNueva,Bloqueado=0,IntentosFallidos=0
 WHERE UsuarioId=@UsuarioId AND Activo=1;
 IF @@ROWCOUNT=0 THROW 50001,'No se pudo actualizar el usuario.',1;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_Update] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_Usuario_Update]
    @UsuarioId       INT,
    @Username        VARCHAR(50),
    @Nombre          VARCHAR(100),
    @Apellido        VARCHAR(100) = NULL,
    @Email           VARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Usuario
    SET
        Username = @Username,
        Nombre = @Nombre,
        Apellido = @Apellido,
        Email = @Email
    WHERE UsuarioId = @UsuarioId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_Usuario_ValidarAccesoMenu] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   USUARIO - VALIDAR ACCESO A MENÚ / PERMISO
   Devuelve 1 si tiene acceso, 0 si no
   ========================================================= */
CREATE PROCEDURE [dbo].[sp_Usuario_ValidarAccesoMenu]
    @UsuarioId       INT,
    @MenuId          INT,
    @PermisoNombre   VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.Usuario u
        INNER JOIN dbo.UsuarioRol ur
            ON u.UsuarioId = ur.UsuarioId
        INNER JOIN dbo.Rol r
            ON ur.RolId = r.RolId
        INNER JOIN dbo.RolPermiso rp
            ON r.RolId = rp.RolId
        INNER JOIN dbo.Permiso p
            ON rp.PermisoId = p.PermisoId
        INNER JOIN dbo.Menu m
            ON rp.MenuId = m.MenuId
        WHERE u.UsuarioId = @UsuarioId
          AND u.Activo = 1
          AND u.Bloqueado = 0
          AND r.Activo = 1
          AND p.Activo = 1
          AND m.Activo = 1
          AND rp.MenuId = @MenuId
          AND p.Nombre = @PermisoNombre
    )
    BEGIN
        SELECT CAST(1 AS BIT) AS TieneAcceso;
    END
    ELSE
    BEGIN
        SELECT CAST(0 AS BIT) AS TieneAcceso;
    END
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_UsuarioRol_Delete] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_UsuarioRol_Delete]
    @UsuarioRolId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.UsuarioRol
    WHERE UsuarioRolId = @UsuarioRolId;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_UsuarioRol_GetByUsuario] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* =========================================================
   USUARIOROL
   ========================================================= */

CREATE PROCEDURE [dbo].[sp_UsuarioRol_GetByUsuario]
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ur.UsuarioRolId,
        ur.UsuarioId,
        ur.RolId,
        r.Nombre AS RolNombre,
        r.Descripcion
    FROM dbo.UsuarioRol ur
    INNER JOIN dbo.Rol r
        ON ur.RolId = r.RolId
    WHERE ur.UsuarioId = @UsuarioId
    ORDER BY r.Nombre;
END

GO
/****** Objeto: StoredProcedure [dbo].[sp_UsuarioRol_Insert] Fecha de script: 25/10/2026 20:14:30 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_UsuarioRol_Insert]
    @UsuarioId INT,
    @RolId     INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.UsuarioRol
    (
        UsuarioId,
        RolId
    )
    VALUES
    (
        @UsuarioId,
        @RolId
    );

    SELECT SCOPE_IDENTITY() AS UsuarioRolId;
END

GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_CajaIntegridadVersion', @value=N'1' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'PROCEDURE',@level1name=N'sp_Cobro_Confirmar'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_CancelacionVersion', @value=N'2' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'PROCEDURE',@level1name=N'sp_Pedido_Cancelar'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_AnulacionVersion', @value=N'2' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'PROCEDURE',@level1name=N'sp_TEKA_Venta_AnularIntegral'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_Recortes2A_Fingerprint', @value=N'8834A68730DD7FAF09BC15174ACB40B25650F91C9820F26EC520A99B84486BF1' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'RecorteGeneracion'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_Recortes2A_FingerprintProcHash', @value=N'F7CFAF85854D36B7881FB78EDEE9CEF24D96F137F3C8B7DEBC69165554A48907' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'RecorteGeneracion'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_Recortes2A_Version', @value=N'2A.2026-10-24.final' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'RecorteGeneracion'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_Recortes2B_Fingerprint', @value=N'A47A4D6D000668A60F956C7A61902D736B81CF13C9D4C9D50BACA7AF8DADE2F3' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'RecorteGeneracion'
GO
EXEC sys.sp_addextendedproperty @name=N'TEKA_Recortes2B_Version', @value=N'2B.2026-10-25.1' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'RecorteGeneracion'
GO

-- Vistas recuperadas en memoria desde SQL.zip: SQL/TEKA_Manager_Vistas.sql
USE [TEKA_Manager];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* Vista: [dbo].[vw_Existencias_MovimientosInsumo] */
CREATE VIEW dbo.vw_Existencias_MovimientosInsumo AS
SELECT m.MovimientoStockId,m.InsumoId,m.DepositoId,m.FechaMovimiento,
  CONVERT(date,m.FechaMovimiento) AS DiaMovimiento,m.TipoMovimientoStockId,
  t.Nombre AS TipoMovimiento,CONVERT(decimal(28,2),m.Cantidad) AS Cantidad,
  t.Signo,CONVERT(decimal(28,2),m.Cantidad*t.Signo) AS Variacion,
  m.EntidadOrigen,m.OrigenId,m.Motivo,m.Activo,m.FechaAnulacion,m.MovimientoStockIdReversaDe
FROM dbo.MovimientoStock m
JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
WHERE m.InsumoId IS NOT NULL;
GO

/* Vista: [dbo].[vw_Existencias_MovimientosProducto] */
-- Vistas originales reconstruidas porque se eliminaron manualmente.
CREATE VIEW dbo.vw_Existencias_MovimientosProducto AS
SELECT m.MovimientoStockId,m.ProductoId,m.DepositoId,m.FechaMovimiento,
  CONVERT(date,m.FechaMovimiento) AS DiaMovimiento,m.TipoMovimientoStockId,
  t.Nombre AS TipoMovimiento,CONVERT(decimal(28,2),m.Cantidad) AS Cantidad,
  t.Signo,CONVERT(decimal(28,2),m.Cantidad*t.Signo) AS Variacion,
  m.EntidadOrigen,m.OrigenId,m.Motivo,m.Activo,m.FechaAnulacion,m.MovimientoStockIdReversaDe
FROM dbo.MovimientoStock m
JOIN dbo.TipoMovimientoStock t ON t.TipoMovimientoStockId=m.TipoMovimientoStockId
WHERE m.ProductoId IS NOT NULL;
GO

/* Vista: [dbo].[vw_Existencias_ConciliacionInsumo] */
CREATE VIEW dbo.vw_Existencias_ConciliacionInsumo AS
WITH libro AS (
  SELECT InsumoId,DepositoId,SUM(Variacion) AS SaldoLibro
  FROM dbo.vw_Existencias_MovimientosInsumo GROUP BY InsumoId,DepositoId
), pares AS (
  SELECT InsumoId,DepositoId FROM dbo.StockInsumo
  UNION SELECT InsumoId,DepositoId FROM libro
)
SELECT p.InsumoId,p.DepositoId,
  CONVERT(decimal(28,2),COALESCE(s.CantidadActual,0)) AS StockActual,
  CONVERT(decimal(28,2),COALESCE(l.SaldoLibro,0)) AS SaldoLibro,
  CONVERT(decimal(28,2),COALESCE(s.CantidadActual,0)-COALESCE(l.SaldoLibro,0)) AS Diferencia
FROM pares p
LEFT JOIN dbo.StockInsumo s ON s.InsumoId=p.InsumoId AND s.DepositoId=p.DepositoId
LEFT JOIN libro l ON l.InsumoId=p.InsumoId AND l.DepositoId=p.DepositoId;
GO

/* Vista: [dbo].[vw_Existencias_ConciliacionProducto] */
CREATE VIEW dbo.vw_Existencias_ConciliacionProducto AS
WITH libro AS (
  SELECT ProductoId,DepositoId,SUM(Variacion) AS SaldoLibro
  FROM dbo.vw_Existencias_MovimientosProducto GROUP BY ProductoId,DepositoId
), pares AS (
  SELECT ProductoId,DepositoId FROM dbo.StockProducto
  UNION SELECT ProductoId,DepositoId FROM libro
)
SELECT p.ProductoId,p.DepositoId,
  CONVERT(decimal(28,2),COALESCE(s.CantidadActual,0)) AS StockActual,
  CONVERT(decimal(28,2),COALESCE(l.SaldoLibro,0)) AS SaldoLibro,
  CONVERT(decimal(28,2),COALESCE(s.CantidadActual,0)-COALESCE(l.SaldoLibro,0)) AS Diferencia
FROM pares p
LEFT JOIN dbo.StockProducto s ON s.ProductoId=p.ProductoId AND s.DepositoId=p.DepositoId
LEFT JOIN libro l ON l.ProductoId=p.ProductoId AND l.DepositoId=p.DepositoId;
GO

/* Vista: [dbo].[vw_InventarioDisponibilidadComercial] */
/* Consulta operativa. Disponible presencial = fisico - cupo online.
   No contempla reservas: se eliminan en migracion coordinada Ventas/API. */
CREATE VIEW dbo.vw_InventarioDisponibilidadComercial AS
SELECT p.ProductoId,p.Codigo,p.Nombre,CAST(3 AS INT) AS DepositoId,
  ISNULL(s.CantidadActual,0) AS StockFisico,
  ISNULL(d.CupoOnline,0) AS DisponibleOnline,
  ISNULL(s.CantidadActual,0)-ISNULL(d.CupoOnline,0) AS DisponiblePresencial
FROM dbo.Producto p
LEFT JOIN dbo.StockProducto s ON s.ProductoId=p.ProductoId AND s.DepositoId=3
LEFT JOIN dbo.ProductoDisponibilidadOnline d ON d.ProductoId=p.ProductoId AND d.DepositoId=3;
GO

/* Vista: [dbo].[vw_ProveedorCuentaCorriente] */
/* Consulta financiera: solo documentos confirmados. Las facturas anuladas no generan deuda. */
CREATE VIEW dbo.vw_ProveedorCuentaCorriente AS
SELECT f.FacturaProveedorId,f.ProveedorId,f.NumeroFactura,f.FechaEmision,f.FechaVencimiento,f.Estado,
  f.ImporteTotal,
  CONVERT(DECIMAL(18,2),ISNULL((SELECT SUM(n.Importe) FROM dbo.NotaCreditoProveedor n WHERE n.FacturaProveedorId=f.FacturaProveedorId),0)) AS NotasCredito,
  CONVERT(DECIMAL(18,2),ISNULL((SELECT SUM(a.ImporteAplicado) FROM dbo.OrdenPagoProveedorAplicacion a
    JOIN dbo.OrdenPagoProveedor o ON o.OrdenPagoProveedorId=a.OrdenPagoProveedorId
    WHERE a.FacturaProveedorId=f.FacturaProveedorId AND o.Estado='Confirmada'),0)) AS Pagos,
  CONVERT(DECIMAL(18,2),CASE WHEN f.Estado='Anulada' THEN 0 ELSE f.ImporteTotal
    - ISNULL((SELECT SUM(n.Importe) FROM dbo.NotaCreditoProveedor n WHERE n.FacturaProveedorId=f.FacturaProveedorId),0)
    - ISNULL((SELECT SUM(a.ImporteAplicado) FROM dbo.OrdenPagoProveedorAplicacion a
      JOIN dbo.OrdenPagoProveedor o ON o.OrdenPagoProveedorId=a.OrdenPagoProveedorId
      WHERE a.FacturaProveedorId=f.FacturaProveedorId AND o.Estado='Confirmada'),0) END) AS Saldo
FROM dbo.FacturaProveedor f;
GO

