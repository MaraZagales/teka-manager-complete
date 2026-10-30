-- TEKA Manager - catalogos tecnicos sin usuarios ni datos operativos
-- Fuente: export local revisado por allowlist de tablas.
-- Excluye usuarios, credenciales, clientes, domicilios, productos, insumos, depositos, cuentas, auditoria y movimientos.
-- Ejecutar solamente despues de crear el esquema, sobre una base vacia, y revisar los valores para el entorno destino.

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- dbo.AlicuotaIVA
    SET IDENTITY_INSERT [dbo].[AlicuotaIVA] ON;
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (1, 3, N'IVA 0%', CAST(0.00 AS Decimal(5, 2)), 1)
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (2, 4, N'IVA 10,5%', CAST(10.50 AS Decimal(5, 2)), 1)
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (3, 5, N'IVA 21%', CAST(21.00 AS Decimal(5, 2)), 1)
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (4, 6, N'IVA 27%', CAST(27.00 AS Decimal(5, 2)), 1)
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (5, 8, N'IVA 5%', CAST(5.00 AS Decimal(5, 2)), 1)
    INSERT [dbo].[AlicuotaIVA] ([AlicuotaIVAId], [CodigoARCA], [Nombre], [Porcentaje], [Activo]) VALUES (6, 9, N'IVA 2,5%', CAST(2.50 AS Decimal(5, 2)), 1)
    SET IDENTITY_INSERT [dbo].[AlicuotaIVA] OFF;

    -- dbo.CanalVenta
    SET IDENTITY_INSERT [dbo].[CanalVenta] ON;
    INSERT [dbo].[CanalVenta] ([CanalVentaId], [Nombre], [Activo]) VALUES (1, N'Local', 1)
    INSERT [dbo].[CanalVenta] ([CanalVentaId], [Nombre], [Activo]) VALUES (2, N'WhatsApp', 1)
    INSERT [dbo].[CanalVenta] ([CanalVentaId], [Nombre], [Activo]) VALUES (3, N'Instagram', 1)
    INSERT [dbo].[CanalVenta] ([CanalVentaId], [Nombre], [Activo]) VALUES (4, N'E-commerce', 1)
    SET IDENTITY_INSERT [dbo].[CanalVenta] OFF;

    -- dbo.Color
    SET IDENTITY_INSERT [dbo].[Color] ON;
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (1, N'Blanco Nature', N'#FFFFFF', 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (2, N'Ébano Negro', N'#000000', 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (3, N'Roble Escandinavo', N'#A67C52', 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (4, N'Grafito', N'#808080', 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (5, N'Olmo Finlandés', N'#C8A46A', 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (6, N'Helsinki', NULL, 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (7, N'Lino Blanco', NULL, 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (8, N'Roble Americano', NULL, 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (9, N'Roble Dakar', NULL, 1)
    INSERT [dbo].[Color] ([ColorId], [Nombre], [CodigoHex], [Activo]) VALUES (10, N'Nogal Terracota', NULL, 1)
    SET IDENTITY_INSERT [dbo].[Color] OFF;

    -- dbo.ConceptoComprobante
    SET IDENTITY_INSERT [dbo].[ConceptoComprobante] ON;
    INSERT [dbo].[ConceptoComprobante] ([ConceptoComprobanteId], [CodigoARCA], [Nombre], [Activo]) VALUES (1, 1, N'Productos', 1)
    INSERT [dbo].[ConceptoComprobante] ([ConceptoComprobanteId], [CodigoARCA], [Nombre], [Activo]) VALUES (2, 2, N'Servicios', 1)
    INSERT [dbo].[ConceptoComprobante] ([ConceptoComprobanteId], [CodigoARCA], [Nombre], [Activo]) VALUES (3, 3, N'Productos y Servicios', 1)
    SET IDENTITY_INSERT [dbo].[ConceptoComprobante] OFF;

    -- dbo.CondicionIVA
    SET IDENTITY_INSERT [dbo].[CondicionIVA] ON;
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (1, N'Responsable Inscripto', N'RI', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (2, N'Monotributista', N'MT', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (3, N'Consumidor Final', N'CF', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (4, N'Exento', N'EX', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (5, N'No Responsable', N'NR', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (6, N'Sujeto No Categorizado', N'NC', 1)
    INSERT [dbo].[CondicionIVA] ([CondicionIVAId], [Nombre], [CodigoAFIP], [Activo]) VALUES (7, N'Responsable Monotributo Social', N'MS', 1)
    SET IDENTITY_INSERT [dbo].[CondicionIVA] OFF;

    -- dbo.EstadoCobro
    SET IDENTITY_INSERT [dbo].[EstadoCobro] ON;
    INSERT [dbo].[EstadoCobro] ([EstadoCobroId], [Nombre], [Activo]) VALUES (1, N'Pendiente', 1)
    INSERT [dbo].[EstadoCobro] ([EstadoCobroId], [Nombre], [Activo]) VALUES (2, N'Confirmado', 1)
    INSERT [dbo].[EstadoCobro] ([EstadoCobroId], [Nombre], [Activo]) VALUES (3, N'Anulado', 1)
    SET IDENTITY_INSERT [dbo].[EstadoCobro] OFF;

    -- dbo.EstadoInteresComercial
    SET IDENTITY_INSERT [dbo].[EstadoInteresComercial] ON;
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (1, N'Pendiente', 1, 0, 1)
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (2, N'En atención', 2, 0, 1)
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (3, N'Calificado', 3, 1, 1)
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (4, N'Descartado', 4, 1, 1)
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (5, N'Convertido', 5, 1, 1)
    INSERT [dbo].[EstadoInteresComercial] ([EstadoInteresComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (6, N'Concretado', 6, 1, 1)
    SET IDENTITY_INSERT [dbo].[EstadoInteresComercial] OFF;

    -- dbo.EstadoOportunidadComercial
    SET IDENTITY_INSERT [dbo].[EstadoOportunidadComercial] ON;
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (1, N'Nueva', 1, 0, 1)
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (2, N'En seguimiento', 2, 0, 1)
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (3, N'Visita programada', 3, 0, 1)
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (4, N'Convertida', 4, 1, 1)
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (5, N'Perdida', 5, 1, 1)
    INSERT [dbo].[EstadoOportunidadComercial] ([EstadoOportunidadComercialId], [Nombre], [Orden], [EsFinal], [Activo]) VALUES (6, N'Cancelada', 6, 1, 1)
    SET IDENTITY_INSERT [dbo].[EstadoOportunidadComercial] OFF;

    -- dbo.EstadoOrdenProduccion
    SET IDENTITY_INSERT [dbo].[EstadoOrdenProduccion] ON;
    INSERT [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId], [Nombre], [Activo]) VALUES (1, N'Pendiente', 1)
    INSERT [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId], [Nombre], [Activo]) VALUES (2, N'En Proceso', 1)
    INSERT [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId], [Nombre], [Activo]) VALUES (3, N'Finalizada', 1)
    INSERT [dbo].[EstadoOrdenProduccion] ([EstadoOrdenProduccionId], [Nombre], [Activo]) VALUES (4, N'Cancelada', 1)
    SET IDENTITY_INSERT [dbo].[EstadoOrdenProduccion] OFF;

    -- dbo.EstadoPedido
    SET IDENTITY_INSERT [dbo].[EstadoPedido] ON;
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (1, N'Pendiente', 1)
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (2, N'Confirmado', 1)
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (3, N'En Produccion', 1)
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (4, N'Listo para Entrega', 1)
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (5, N'Entregado', 1)
    INSERT [dbo].[EstadoPedido] ([EstadoPedidoId], [Nombre], [Activo]) VALUES (6, N'Cancelado', 1)
    SET IDENTITY_INSERT [dbo].[EstadoPedido] OFF;

    -- dbo.EstadoRecorte
    SET IDENTITY_INSERT [dbo].[EstadoRecorte] ON;
    INSERT [dbo].[EstadoRecorte] ([EstadoRecorteId], [Nombre], [Activo]) VALUES (1, N'Disponible', 1)
    INSERT [dbo].[EstadoRecorte] ([EstadoRecorteId], [Nombre], [Activo]) VALUES (2, N'Reservado', 1)
    INSERT [dbo].[EstadoRecorte] ([EstadoRecorteId], [Nombre], [Activo]) VALUES (3, N'Utilizado', 1)
    INSERT [dbo].[EstadoRecorte] ([EstadoRecorteId], [Nombre], [Activo]) VALUES (4, N'Descartado', 1)
    SET IDENTITY_INSERT [dbo].[EstadoRecorte] OFF;

    -- dbo.MedioCobro
    SET IDENTITY_INSERT [dbo].[MedioCobro] ON;
    INSERT [dbo].[MedioCobro] ([MedioCobroId], [Nombre], [RequiereReferencia], [Activo]) VALUES (1, N'Efectivo', 0, 1)
    INSERT [dbo].[MedioCobro] ([MedioCobroId], [Nombre], [RequiereReferencia], [Activo]) VALUES (2, N'Transferencia', 1, 1)
    INSERT [dbo].[MedioCobro] ([MedioCobroId], [Nombre], [RequiereReferencia], [Activo]) VALUES (3, N'Tarjeta Debito', 1, 1)
    INSERT [dbo].[MedioCobro] ([MedioCobroId], [Nombre], [RequiereReferencia], [Activo]) VALUES (4, N'Tarjeta Credito', 1, 1)
    INSERT [dbo].[MedioCobro] ([MedioCobroId], [Nombre], [RequiereReferencia], [Activo]) VALUES (5, N'QR', 1, 1)
    SET IDENTITY_INSERT [dbo].[MedioCobro] OFF;

    -- dbo.Moneda
    SET IDENTITY_INSERT [dbo].[Moneda] ON;
    INSERT [dbo].[Moneda] ([MonedaId], [CodigoARCA], [Nombre], [Activo]) VALUES (1, N'PES', N'Peso Argentino', 1)
    INSERT [dbo].[Moneda] ([MonedaId], [CodigoARCA], [Nombre], [Activo]) VALUES (2, N'DOL', N'Dolar Estadounidense', 1)
    INSERT [dbo].[Moneda] ([MonedaId], [CodigoARCA], [Nombre], [Activo]) VALUES (3, N'EUR', N'Euro', 1)
    INSERT [dbo].[Moneda] ([MonedaId], [CodigoARCA], [Nombre], [Activo]) VALUES (4, N'BRL', N'Real', 1)
    SET IDENTITY_INSERT [dbo].[Moneda] OFF;

    -- dbo.MotivoConsultaComercial
    SET IDENTITY_INSERT [dbo].[MotivoConsultaComercial] ON;
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (1, N'Solicitud de presupuesto', 10, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (2, N'Información de producto', 20, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (3, N'Disponibilidad y stock', 30, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (4, N'Medidas y personalización', 40, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (5, N'Plazos y costos de entrega', 50, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (6, N'Seguimiento de pedido', 60, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (7, N'Problemas al finalizar compra', 70, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (8, N'Consultas sobre medios de pago', 80, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (9, N'Recuperación de carrito', 90, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (10, N'Cambios o devoluciones', 100, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (11, N'Asesoramiento comercial', 110, 1)
    INSERT [dbo].[MotivoConsultaComercial] ([MotivoConsultaId], [Nombre], [OrdenVisual], [Activo]) VALUES (12, N'Otra consulta', 120, 1)
    SET IDENTITY_INSERT [dbo].[MotivoConsultaComercial] OFF;

    -- dbo.MotivoInactivacion
    SET IDENTITY_INSERT [dbo].[MotivoInactivacion] ON;
    INSERT [dbo].[MotivoInactivacion] ([MotivoInactivacionId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Obsoleto', N'El registro ya no se utiliza en la operatoria actual', 1)
    INSERT [dbo].[MotivoInactivacion] ([MotivoInactivacionId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Error de carga', N'El registro fue creado por error', 1)
    INSERT [dbo].[MotivoInactivacion] ([MotivoInactivacionId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Duplicado', N'Existe otro registro equivalente vigente', 1)
    INSERT [dbo].[MotivoInactivacion] ([MotivoInactivacionId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Fuera de catálogo', N'La empresa dejó de comercializar o utilizar este ítem', 1)
    INSERT [dbo].[MotivoInactivacion] ([MotivoInactivacionId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Inactivo por decisión administrativa', N'Baja definida por gestión', 1)
    SET IDENTITY_INSERT [dbo].[MotivoInactivacion] OFF;

    -- dbo.MotivoInactivacionUsuario
    SET IDENTITY_INSERT [dbo].[MotivoInactivacionUsuario] ON;
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Baja administrativa', N'Usuario inactivado por decisión administrativa', 1)
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Cambio de puesto', N'Usuario inactivado por cambio de rol o área', 1)
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Fin de relación laboral', N'Usuario inactivado por finalización de vínculo laboral', 1)
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Usuario duplicado', N'Usuario inactivado por existir otro registro equivalente', 1)
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Usuario de prueba', N'Usuario inactivado por corresponder a pruebas internas', 1)
    INSERT [dbo].[MotivoInactivacionUsuario] ([MotivoInactivacionUsuarioId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Otro', N'Motivo no contemplado en las opciones anteriores', 1)
    SET IDENTITY_INSERT [dbo].[MotivoInactivacionUsuario] OFF;

    -- dbo.MotivoMovimientoStock
    SET IDENTITY_INSERT [dbo].[MotivoMovimientoStock] ON;
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (1, N'Corrección de inventario', 1)
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (2, N'Diferencia detectada en recuento', 1)
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (3, N'Deterioro o rotura', 1)
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (4, N'Reposición manual de existencias', 1)
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (5, N'Devolución de material', 1)
    INSERT [dbo].[MotivoMovimientoStock] ([MotivoMovimientoStockId], [Nombre], [Activo]) VALUES (6, N'Regularización de stock', 1)
    SET IDENTITY_INSERT [dbo].[MotivoMovimientoStock] OFF;

    -- dbo.MotivoPerdidaOportunidad
    SET IDENTITY_INSERT [dbo].[MotivoPerdidaOportunidad] ON;
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Precio', N'El cliente no avanzó por diferencia de precio.', 1)
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Sin stock', N'No había disponibilidad del producto solicitado.', 1)
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'No respondió', N'El cliente dejó de responder el seguimiento comercial.', 1)
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Demora de entrega', N'El plazo de entrega no cumplía con la necesidad del cliente.', 1)
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Eligió otro proveedor', N'El cliente decidió comprar a otro proveedor.', 1)
    INSERT [dbo].[MotivoPerdidaOportunidad] ([MotivoPerdidaOportunidadId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Canceló la compra', N'El cliente canceló la intención de compra.', 1)
    SET IDENTITY_INSERT [dbo].[MotivoPerdidaOportunidad] OFF;

    -- dbo.Provincia
    SET IDENTITY_INSERT [dbo].[Provincia] ON;
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (1, N'Buenos Aires', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (2, N'Cordoba', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (3, N'Santa Fe', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (4, N'Mendoza', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (5, N'Tucuman', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (6, N'Salta', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (7, N'Neuquen', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (8, N'Chaco', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (9, N'Corrientes', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (10, N'Entre Rios', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (11, N'Misiones', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (12, N'San Juan', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (13, N'San Luis', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (14, N'La Rioja', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (15, N'Catamarca', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (16, N'Jujuy', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (17, N'Formosa', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (18, N'Rio Negro', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (19, N'Chubut', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (20, N'Santa Cruz', 1)
    INSERT [dbo].[Provincia] ([ProvinciaId], [Nombre], [Activo]) VALUES (21, N'Tierra del Fuego', 1)
    SET IDENTITY_INSERT [dbo].[Provincia] OFF;

    -- dbo.Localidad
    SET IDENTITY_INSERT [dbo].[Localidad] ON;
    INSERT [dbo].[Localidad] ([LocalidadId], [Nombre], [ProvinciaId], [CodigoPostal], [Activo]) VALUES (1, N'Cordoba Capital', 2, N'5000', 1)
    INSERT [dbo].[Localidad] ([LocalidadId], [Nombre], [ProvinciaId], [CodigoPostal], [Activo]) VALUES (2, N'Villa Carlos Paz', 2, N'5152', 1)
    INSERT [dbo].[Localidad] ([LocalidadId], [Nombre], [ProvinciaId], [CodigoPostal], [Activo]) VALUES (3, N'Rosario', 3, N'2000', 1)
    INSERT [dbo].[Localidad] ([LocalidadId], [Nombre], [ProvinciaId], [CodigoPostal], [Activo]) VALUES (4, N'Mendoza Capital', 4, N'5500', 1)
    INSERT [dbo].[Localidad] ([LocalidadId], [Nombre], [ProvinciaId], [CodigoPostal], [Activo]) VALUES (5, N'Buenos Aires', 1, N'1000', 1)
    SET IDENTITY_INSERT [dbo].[Localidad] OFF;

    -- dbo.Menu
    SET IDENTITY_INSERT [dbo].[Menu] ON;
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (1, N'Inicio', N'/inicio', N'Dashboard', 1, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (2, N'Ventas', N'/ventas', N'Ventas', 3, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (3, N'Cobros', N'/cobros', N'Cobros', 4, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (4, N'Inventario', N'/inventario', N'Inventario', 5, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (5, N'Producción', N'/produccion', N'Produccion', 6, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (6, N'Recortes / GIR', N'/recortes', N'Recortes', 7, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (7, N'Proveedores', N'/proveedores', N'Proveedores', 9, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (8, N'E-commerce', N'/ecommerce', N'Ecommerce', 11, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (9, N'Reportes', N'/reportes', N'Reportes', 12, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (10, N'Usuarios', N'/usuarios', N'Seguridad', 13, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (11, N'Configuración', N'/configuracion', N'Configuracion', 15, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (12, N'Comercial', N'/comercial', N'Comercial', 2, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (13, N'Compras', N'/compras', N'Compras', 8, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (14, N'Costos y precios', N'/costos', N'Costos', 10, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (15, N'Roles y accesos', N'/roles', N'Seguridad', 14, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (16, N'Auditoría', N'/auditoria', N'Seguridad', 14, 1)
    INSERT [dbo].[Menu] ([MenuId], [Nombre], [Ruta], [Modulo], [OrdenVisual], [Activo]) VALUES (17, N'Caja', N'/caja/diaria', N'Caja', 13, 1)
    SET IDENTITY_INSERT [dbo].[Menu] OFF;

    -- dbo.Permiso
    SET IDENTITY_INSERT [dbo].[Permiso] ON;
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Ver', N'Permite consultar información', 1)
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Crear', N'Permite registrar nuevos datos', 1)
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Editar', N'Permite modificar registros existentes', 1)
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Inactivar', N'Permite realizar baja lógica o inactivar registros', 1)
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Exportar', N'Permite generar reportes PDF o Excel', 1)
    INSERT [dbo].[Permiso] ([PermisoId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Administrar', N'Permite gestionar configuraciones, permisos o acciones sensibles', 1)
    SET IDENTITY_INSERT [dbo].[Permiso] OFF;

    -- dbo.Rol
    SET IDENTITY_INSERT [dbo].[Rol] ON;
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Administrador del sistema', N'Acceso total al sistema y configuración general', 1)
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Gerencia', N'Supervisión general, finanzas, proveedores, reportes y decisiones estratégicas', 1)
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Ventas / Comercial', N'Gestión comercial, clientes, pedidos, cobros operativos, e-commerce y reportes comerciales', 1)
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Responsable de Taller', N'Gestión operativa de inventario, producción, recortes y órdenes de producción', 1)
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Operario de Taller', N'Consulta operativa de órdenes, inventario y recortes', 1)
    INSERT [dbo].[Rol] ([RolId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Rol de Prueba', N'prueba', 0)
    SET IDENTITY_INSERT [dbo].[Rol] OFF;

    -- dbo.RolPermiso
    SET IDENTITY_INSERT [dbo].[RolPermiso] ON;
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (190, 1, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (191, 1, 1, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (192, 1, 1, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (193, 1, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (194, 1, 1, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (195, 1, 1, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (196, 1, 1, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (197, 1, 1, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (198, 1, 1, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (199, 1, 1, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (200, 1, 1, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (201, 1, 1, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (202, 1, 1, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (203, 1, 1, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (204, 1, 1, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (378, 1, 1, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (392, 1, 1, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (391, 1, 2, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (205, 1, 2, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (206, 1, 2, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (207, 1, 2, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (208, 1, 2, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (209, 1, 2, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (210, 1, 2, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (211, 1, 2, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (384, 1, 2, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (212, 1, 2, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (213, 1, 2, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (214, 1, 2, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (215, 1, 2, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (216, 1, 2, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (217, 1, 2, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (379, 1, 2, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (393, 1, 2, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (390, 1, 3, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (218, 1, 3, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (219, 1, 3, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (220, 1, 3, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (221, 1, 3, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (222, 1, 3, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (223, 1, 3, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (224, 1, 3, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (386, 1, 3, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (225, 1, 3, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (226, 1, 3, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (227, 1, 3, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (228, 1, 3, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (229, 1, 3, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (230, 1, 3, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (380, 1, 3, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (394, 1, 3, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (389, 1, 4, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (231, 1, 4, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (232, 1, 4, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (233, 1, 4, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (234, 1, 4, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (235, 1, 4, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (236, 1, 4, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (237, 1, 4, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (385, 1, 4, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (238, 1, 4, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (239, 1, 4, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (240, 1, 4, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (241, 1, 4, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (242, 1, 4, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (243, 1, 4, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (381, 1, 4, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (397, 1, 4, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (388, 1, 5, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (244, 1, 5, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (245, 1, 5, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (246, 1, 5, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (247, 1, 5, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (248, 1, 5, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (249, 1, 5, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (250, 1, 5, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (251, 1, 5, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (252, 1, 5, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (253, 1, 5, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (254, 1, 5, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (255, 1, 5, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (256, 1, 5, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (257, 1, 5, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (382, 1, 5, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (395, 1, 5, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (387, 1, 6, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (258, 1, 6, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (259, 1, 6, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (260, 1, 6, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (261, 1, 6, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (262, 1, 6, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (263, 1, 6, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (264, 1, 6, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (265, 1, 6, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (266, 1, 6, 10)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (267, 1, 6, 11)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (268, 1, 6, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (269, 1, 6, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (270, 1, 6, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (271, 1, 6, 15)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (383, 1, 6, 16)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (396, 1, 6, 17)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (272, 2, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (273, 2, 1, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (274, 2, 1, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (275, 2, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (276, 2, 1, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (277, 2, 1, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (278, 2, 1, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (279, 2, 1, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (280, 2, 1, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (281, 2, 1, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (282, 2, 1, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (283, 2, 1, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (284, 2, 2, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (285, 2, 2, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (286, 2, 2, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (287, 2, 2, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (288, 2, 2, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (289, 2, 2, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (290, 2, 2, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (291, 2, 2, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (292, 2, 2, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (293, 2, 2, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (294, 2, 3, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (295, 2, 3, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (296, 2, 3, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (297, 2, 3, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (298, 2, 3, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (299, 2, 3, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (300, 2, 3, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (301, 2, 3, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (302, 2, 3, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (303, 2, 3, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (304, 2, 4, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (305, 2, 4, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (306, 2, 4, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (307, 2, 4, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (308, 2, 4, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (309, 2, 4, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (310, 2, 4, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (311, 2, 4, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (312, 2, 4, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (313, 2, 5, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (314, 2, 5, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (315, 2, 5, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (316, 2, 5, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (317, 2, 5, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (318, 2, 5, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (319, 2, 5, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (320, 2, 5, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (321, 2, 5, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (322, 2, 5, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (323, 2, 5, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (324, 2, 6, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (325, 3, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (326, 3, 1, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (327, 3, 1, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (328, 3, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (329, 3, 1, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (330, 3, 1, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (331, 3, 1, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (332, 3, 1, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (333, 3, 1, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (334, 3, 1, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (335, 3, 2, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (336, 3, 2, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (337, 3, 2, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (338, 3, 2, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (339, 3, 3, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (340, 3, 3, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (341, 3, 3, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (342, 3, 3, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (343, 3, 4, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (344, 3, 4, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (345, 3, 5, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (346, 3, 5, 3)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (347, 3, 5, 8)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (348, 3, 5, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (349, 3, 5, 12)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (350, 4, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (351, 4, 1, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (352, 4, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (353, 4, 1, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (354, 4, 1, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (355, 4, 1, 7)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (356, 4, 1, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (357, 4, 1, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (358, 4, 1, 14)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (359, 4, 2, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (360, 4, 2, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (361, 4, 2, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (362, 4, 2, 13)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (363, 4, 3, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (364, 4, 3, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (365, 4, 3, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (366, 4, 4, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (367, 4, 4, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (368, 4, 5, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (369, 4, 5, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (370, 4, 5, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (371, 4, 5, 9)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (372, 5, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (373, 5, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (374, 5, 1, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (375, 5, 1, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (376, 5, 3, 5)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (377, 5, 3, 6)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (179, 6, 1, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (185, 6, 1, 2)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (188, 6, 1, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (180, 6, 2, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (181, 6, 3, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (182, 6, 4, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (183, 6, 5, 1)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (189, 6, 5, 4)
    INSERT [dbo].[RolPermiso] ([RolPermisoId], [RolId], [PermisoId], [MenuId]) VALUES (184, 6, 6, 1)
    SET IDENTITY_INSERT [dbo].[RolPermiso] OFF;

    -- dbo.TipoComprobante
    SET IDENTITY_INSERT [dbo].[TipoComprobante] ON;
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (1, N'Factura A', 0, 0, 1, 1, N'A', 0, 0, 0)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (2, N'Nota de Debito A', 0, 0, 1, 2, N'A', 0, 1, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (3, N'Nota de Credito A', 0, 0, 1, 3, N'A', 1, 0, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (4, N'Factura B', 0, 0, 1, 6, N'B', 0, 0, 0)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (5, N'Nota de Debito B', 0, 0, 1, 7, N'B', 0, 1, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (6, N'Nota de Credito B', 0, 0, 1, 8, N'B', 1, 0, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (7, N'Factura C', 0, 0, 1, 11, N'C', 0, 0, 0)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (8, N'Nota de Debito C', 0, 0, 1, 12, N'C', 0, 1, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (9, N'Nota de Credito C', 0, 0, 1, 13, N'C', 1, 0, 1)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (10, N'Comprobante interno de venta', 0, 0, 1, NULL, NULL, 0, 0, 0)
    INSERT [dbo].[TipoComprobante] ([TipoComprobanteId], [Nombre], [AfectaStock], [AfectaCaja], [Activo], [CodigoARCA], [Letra], [EsNotaCredito], [EsNotaDebito], [RequiereAsociado]) VALUES (11, N'Nota de credito interna', 0, 0, 1, NULL, NULL, 1, 0, 1)
    SET IDENTITY_INSERT [dbo].[TipoComprobante] OFF;

    -- dbo.TipoDocumento
    SET IDENTITY_INSERT [dbo].[TipoDocumento] ON;
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (1, 80, N'CUIT', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (2, 86, N'CUIL', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (3, 96, N'DNI', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (4, 99, N'Consumidor Final', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (5, 87, N'CDI', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (6, 89, N'LE', 1)
    INSERT [dbo].[TipoDocumento] ([TipoDocumentoId], [CodigoARCA], [Nombre], [Activo]) VALUES (7, 90, N'LC', 1)
    SET IDENTITY_INSERT [dbo].[TipoDocumento] OFF;

    -- dbo.TipoDomicilio
    SET IDENTITY_INSERT [dbo].[TipoDomicilio] ON;
    INSERT [dbo].[TipoDomicilio] ([TipoDomicilioId], [Nombre], [Activo]) VALUES (1, N'Entrega', 1)
    INSERT [dbo].[TipoDomicilio] ([TipoDomicilioId], [Nombre], [Activo]) VALUES (2, N'Domicilio Fiscal', 1)
    SET IDENTITY_INSERT [dbo].[TipoDomicilio] OFF;

    -- dbo.TipoInsumo
    SET IDENTITY_INSERT [dbo].[TipoInsumo] ON;
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Melamina', N'Placas de melamina', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Herraje', N'Bisagras, correderas y accesorios', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Tornilleria', N'Tornillos y fijaciones', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Pintura', N'Pinturas y acabados', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Otros', N'Otros insumos', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Adhesivo', N'Colas y adhesivos para carpinteria', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (7, N'Consumible', N'Herramientas menores y consumibles de produccion', 1)
    INSERT [dbo].[TipoInsumo] ([TipoInsumoId], [Nombre], [Descripcion], [Activo]) VALUES (8, N'Canto', N'Tapacantos y terminaciones para placas', 1)
    SET IDENTITY_INSERT [dbo].[TipoInsumo] OFF;

    -- dbo.TipoMovimientoCuentaCorriente
    SET IDENTITY_INSERT [dbo].[TipoMovimientoCuentaCorriente] ON;
    INSERT [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId], [Nombre], [Signo], [Activo]) VALUES (1, N'Cargo por venta', 1, 1)
    INSERT [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId], [Nombre], [Signo], [Activo]) VALUES (2, N'Pago de cliente', -1, 1)
    INSERT [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId], [Nombre], [Signo], [Activo]) VALUES (3, N'Nota de credito', -1, 1)
    INSERT [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId], [Nombre], [Signo], [Activo]) VALUES (4, N'Ajuste deudor', 1, 1)
    INSERT [dbo].[TipoMovimientoCuentaCorriente] ([TipoMovimientoCuentaCorrienteId], [Nombre], [Signo], [Activo]) VALUES (5, N'Ajuste acreedor', -1, 1)
    SET IDENTITY_INSERT [dbo].[TipoMovimientoCuentaCorriente] OFF;

    -- dbo.TipoMovimientoStock
    SET IDENTITY_INSERT [dbo].[TipoMovimientoStock] ON;
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (1, N'Entrada', 1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (2, N'Salida', -1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (3, N'Ajuste Positivo', 1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (4, N'Ajuste Negativo', -1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (5, N'Devolucion Cliente', 1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (6, N'Consumo Produccion', -1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (7, N'Resultado Produccion', 1, 1)
    INSERT [dbo].[TipoMovimientoStock] ([TipoMovimientoStockId], [Nombre], [Signo], [Activo]) VALUES (8, N'Entrada por Compra', 1, 1)
    SET IDENTITY_INSERT [dbo].[TipoMovimientoStock] OFF;

    -- dbo.TipoProduccion
    SET IDENTITY_INSERT [dbo].[TipoProduccion] ON;
    INSERT [dbo].[TipoProduccion] ([TipoProduccionId], [Nombre], [Activo]) VALUES (1, N'Estandar', 1)
    INSERT [dbo].[TipoProduccion] ([TipoProduccionId], [Nombre], [Activo]) VALUES (2, N'Desde recorte', 1)
    SET IDENTITY_INSERT [dbo].[TipoProduccion] OFF;

    -- dbo.TipoProducto
    SET IDENTITY_INSERT [dbo].[TipoProducto] ON;
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (1, N'Living', N'Muebles de living', 1)
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (2, N'Dormitorio', N'Muebles de dormitorio', 1)
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (3, N'Escritorio', N'Muebles para oficina o estudio', 1)
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (4, N'Otros', N'Otros productos', 1)
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (5, N'Comedor', N'Muebles para comedor', 1)
    INSERT [dbo].[TipoProducto] ([TipoProductoId], [Nombre], [Descripcion], [Activo]) VALUES (6, N'Guardado', N'Muebles de guardado y organizacion', 1)
    SET IDENTITY_INSERT [dbo].[TipoProducto] OFF;

    -- dbo.TipoRecorte
    SET IDENTITY_INSERT [dbo].[TipoRecorte] ON;
    INSERT [dbo].[TipoRecorte] ([TipoRecorteId], [Nombre], [Activo]) VALUES (1, N'Melamina', 1)
    INSERT [dbo].[TipoRecorte] ([TipoRecorteId], [Nombre], [Activo]) VALUES (2, N'MDF', 1)
    INSERT [dbo].[TipoRecorte] ([TipoRecorteId], [Nombre], [Activo]) VALUES (3, N'Otro', 1)
    SET IDENTITY_INSERT [dbo].[TipoRecorte] OFF;

    -- dbo.UnidadMedida
    SET IDENTITY_INSERT [dbo].[UnidadMedida] ON;
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (1, N'Unidad', N'UN', 1)
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (2, N'Placa', N'PLA', 1)
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (3, N'Metro', N'M', 1)
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (4, N'Metro cuadrado', N'M2', 1)
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (5, N'Kilogramo', N'KG', 1)
    INSERT [dbo].[UnidadMedida] ([UnidadMedidaId], [Nombre], [Abreviatura], [Activo]) VALUES (6, N'Litro', N'L', 1)
    SET IDENTITY_INSERT [dbo].[UnidadMedida] OFF;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
