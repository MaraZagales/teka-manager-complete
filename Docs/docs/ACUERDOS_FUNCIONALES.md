> **Actualización de conciliación (19/10/2026):** se eliminó el concepto de pedidos borrador; se aclararon la venta manual de muebles fabricados con recortes, trazabilidad de sus dos existencias y ausencia total de reservas. Los acuerdos restantes se preservan; las implementaciones SQL deben auditarse antes de marcarlas como verificadas.

# TEKA Manager — Acuerdos funcionales consolidados (v9)

**Fecha:** 15/10/2026  
**Estado:** registro de decisiones conversadas; pendiente de conciliación integral con documentación, SQL, API y frontend.  
**Cobertura:** relevamiento funcional integral de TEKA Manager, E-commerce, aplicación móvil y Soporte; pendientes de verificación documental y técnica.  
**Alcance de este documento:** registrar acuerdos funcionales, NO afirmar que ya estén implementados ni autorizar cambios técnicos.

## 0. Principios transversales

- TEKA fabrica muebles estándar para stock; comercializa muebles terminados disponibles, no muebles a medida ni producción por pedido del cliente.
- Operaciones trazables: usuario, fecha/hora, motivo cuando corresponda, estados y vínculos con documentos de origen.
- Mantener pantallas legibles, orientadas a tareas, sin exceso de gráficos, tarjetas o información simultánea. Historial detallado accesible cuando se necesite.
- Permisos según roles y controles en backend; evitar acciones duplicadas y movimientos parciales inconsistentes.
- Primero relevamiento funcional completo, luego revisión UX/UI y mockups, luego documentación técnica para implementación y pruebas.
- Reutilizar procesos y contratos existentes; no inventar endpoints, columnas, procedimientos ni reglas sin validación.

## 1. Comercial — decisiones y orientación acordadas

**Acuerdos:**
- Gestión integrada de consultas y seguimiento de clientes, oportunidades, presupuestos, visitas y pedidos, sin obligar a crear una oportunidad por cada contacto.
- WhatsApp Business es el canal de mayor prioridad; bandeja compartida para varios vendedores con asignación y auditoría. La empresa utiliza actualmente su número en teléfono y Meta Business Suite.
- Consultas de e-commerce pueden alimentar el seguimiento comercial; un pedido confirmado en e-commerce ingresa directamente a Ventas, no se transforma automáticamente en oportunidad.
- Instagram DM es secundario y opcional, sujeto a permisos e integración real.
- El vendedor decide cuándo transformar una consulta/presupuesto en pedido; se preserva vínculo y trazabilidad.
- Correo transaccional desde backend para comunicaciones pertinentes y soporte, sujeto a revisar implementación existente.
- Reportes comerciales basados en datos realmente registrados; no métricas ficticias.

**Validación pendiente:** factibilidad real de WhatsApp Cloud API, coexistencia con app/Business Suite, permisos y webhooks; estado real de presupuestos, correo y asignación comercial en SQL/API.

## 2. Ventas y pedidos

**Acuerdos:**
- Solo venta de muebles terminados y disponibles, incluidos los fabricados con recortes; los recortes como material nunca se venden. Sin stock negativo.
- No existen pedidos en estado Borrador ni un paso posterior de confirmación de stock en ventas manuales. Mientras se carga el formulario no hay pedido persistido ni movimiento. Al presionar «Guardar pedido», el sistema crea el pedido y descuenta stock físico y del cupo comercial correspondiente, de forma atómica y una sola vez, independientemente del cobro. El carrito de e-commerce no constituye un pedido ni modifica stock; al generar el pedido online se realiza el descuento correspondiente. Las operaciones de edición/eliminación de detalles deben impedir alterar cantidades o productos de pedidos confirmados mediante rutas heredadas.
- Existencia física compartida de muebles terminados, con asignación comercial separada para vendedores/presencial y e-commerce. Cada canal solo vende su disponibilidad asignada.
- El pedido puede recibir señas y pagos parciales. Descontar stock no depende de haber cobrado el total.
- Pedido presencial/vendedor impago no caduca automáticamente; permanece pendiente hasta cobro o cancelación explícita.
- Para pedidos e-commerce impagos se acordó tentativamente expiración a la hora, sujeta a resolver pagos pendientes, callbacks y confirmaciones tardías.
- La cancelación válida restaura el stock una sola vez y al canal original; los pagos ya recibidos requieren proceso de devolución separado.
- Separar estado del pedido, del pago y de la entrega. No entregar ni permitir retirar muebles sin pago íntegramente confirmado.
- El vendedor coordina retiro o entrega; comprobantes internos, sin afirmar emisión fiscal AFIP.

**Pendientes:** estados exactos y compatibilidad con tablas/API; concurrencia e idempotencia; expiración e-commerce ante pasarela/transferencias pendientes; precios y condiciones de venta.

## 3. Cobros y Caja

**Acuerdos:**
- Medios: efectivo, transferencia y tarjeta/plataforma, incluyendo pagos combinados y parciales.
- Descuento de efectivo del 5 % aplicable solo a la porción abonada en efectivo, conforme a decisión conversada; requiere conciliar con documentación existente, que describe otra base de cálculo.
- Recargos por tarjeta sujetos a reglas vigentes por verificar; no fijar porcentaje sin evidencia.
- Cobros confirmados no se editan. Se permite anulación lógica justificada y auditada para errores, revirtiendo efectos contables/de saldo sin simular salida de dinero.
- Devolución real de dinero es un egreso distinto de la anulación administrativa. Cancelación de pedido con señas/pagos exige devolución correspondiente.
- Cada ingreso confirmado genera comprobante interno de ingreso; egresos reales generan comprobante interno de egreso. Numeración independiente, correlativa y no reutilizable. Anulados permanecen identificables.
- Caja física diaria: fondo fijo inicial (importe aún no definido), apertura, movimientos de efectivo, egresos operativos menores, retiros, arqueo, diferencias, cierre y reposición del fondo cuando corresponda.
- Cobros no modifican stock; afectan saldos y caja/registro financiero según medio. Transferencias deben confirmarse; pagos por pasarela requieren verificación segura e idempotencia.
- Mercado Pago/checkout alojado y links de pago son propuestas de integración, no capacidades verificadas.

**Pendientes:** regla precisa del descuento mixto y conciliación documental, recargos, integración real de pasarela, comprobantes/PA y permisos.

## 4. Inventario

**Acuerdos:**
- Ubicaciones físicas: pañol para materiales y recortes; un único depósito físico para muebles terminados.
- Depósitos lógicos diferenciados: Pañol de Insumos, Pañol de Recortes y Depósito de Productos Terminados. Pañol de Recortes está físicamente en el pañol; verificar representación SQL.
- Stock de productos terminados en un depósito físico común con asignaciones comerciales separadas presencial/vendedores y e-commerce. Reasignación auditable y autorizada, sin fingir traslado físico.
- Solo Producción ingresa muebles terminados. Insumos ingresan mediante confirmación de remitos de proveedores con cantidades realmente recibidas; facturas pueden llegar después, sin exigir orden de compra previa.
- Ajustes de stock positivos o negativos, individuales o de varios artículos, con motivo obligatorio, permisos y auditoría; nunca permitir existencias negativas.
- Recuento físico para productos e insumos: carga masiva de cantidades reales, cálculo automático de diferencias y confirmación de ajustes vinculados. Operación continúa durante recuentos; pendiente estrategia para movimientos concurrentes.
- Stock mínimo tanto para insumos como para productos terminados; alerta sin bloquear venta ni crear compra/producción automática.
- Acuerdo de trabajo: cantidades de existencias por unidad; placas y recortes conservan medidas para cálculo y uso. **Diferencia a reconciliar:** reglas documentadas de melamina/recortes en m².
- Códigos/identificadores generados automáticamente en SQL; verificar diferencia entre PK y código visible.
- Baja/anulación lógica de artículos con motivo y trazabilidad; no anular artículos con stock o compromisos sin resolver. Verificar terminología y estructura real.
- Recortes solo se utilizan en órdenes de producción; no se venden individualmente ni se publican en e-commerce.
- Los recortes disponibles se identifican por material, dimensiones, cantidad y orden de origen; al usarlos se descuenta disponibilidad de Pañol de Recortes.
- Merma/rotura/pérdida se maneja con ajustes negativos cuando existe stock registrado que realmente debe disminuir. No descontar por segunda vez material ya consumido por una OP.

**Pendientes:** distribución inicial del stock terminado entre canales; correcciones de faltantes en stock asignado; unidades de medida y equivalencias; SQL/API real para depósitos lógicos y recortes.

## 5. Producción

**Acuerdos:**
- Una misma orden de producción puede incluir **varios modelos de muebles** y distintas cantidades por modelo.
- Cada modelo tiene una BOM/lista de materiales preconfigurada que describe consumo por unidad; órdenes conservan la versión de BOM utilizada al generarse.
- La configuración de fabricación asociada al producto/BOM también registra recortes **previstos** por unidad (material, dimensiones, cantidad); cambiar diseño/materiales no altera retroactivamente órdenes existentes.
- Plantillas de producción reutilizables, editables e inactivables: precargan combinaciones de modelos y cantidades; la orden nueva puede cambiar líneas/cantidades sin alterar la plantilla. Crear OP sin plantilla también es posible.
- Estados: Pendiente → En proceso → Finalizada; cancelación normal solo cuando está Pendiente. Al iniciar, se validan todos los materiales y se descuentan atómicamente, sin descuentos parciales si faltan existencias.
- Se permite modificar la composición/cantidades mientras la orden está Pendiente. En proceso, consumos adicionales son excepcionales, auditados y sujetos a stock, no tarea rutinaria.
- Una OP puede combinar insumos nuevos del Pañol de Insumos y recortes reutilizables del Pañol de Recortes.
- No hay ingresos parciales de muebles terminados: solo al marcar **Finalizada** ingresan los muebles reales de todos los modelos y recortes confirmados.
- Al finalizar, operario registra cantidad realmente fabricada por modelo, incluso menor que la planificada; mantener planificado, real y diferencia. No registrar muebles inexistentes.
- Al finalizar, sistema propone recortes previstos según configuración/BOM y cantidades; operario confirma, rechaza, corrige dimensiones/cantidades o agrega recortes no previstos. Solo los confirmados ingresan a Pañol de Recortes. Puede confirmar cero aprovechables.
- No se integra la máquina de corte. Para calcular sobrantes geométricos confiables hacen falta piezas y patrones/planes de corte; la BOM por sí sola no determina el despiece geométrico.
- Finalización consistente/atómica, sin ingresos duplicados.
- Planificación asistida: sugerir cantidades por productos bajo stock mínimo, considerando órdenes ya pendientes/en proceso; el responsable decide si crea OP.
- Prioridad Alta/Media/Baja asignada al crear OP y editable mientras Pendiente; no inicia automáticamente órdenes.
- Fechas previstas de inicio y fin, y registro automático de fechas reales; cambios, usuarios y motivos auditables.

**Cuestión a precisar:** en conversación se sugirió registrar cantidades reales superiores a lo planificado; la usuaria respondió «Se hace un ajuste de stock negativo y listo». Eso **no define coherentemente** el tratamiento de sobreproducción: un ajuste negativo de productos terminados no registra unidades adicionales. No asumir una regla definitiva; revisar el caso con la usuaria antes de implementar.

**Pendientes técnicos críticos:** esquema real de OP para múltiples productos; versión/snapshot BOM; plantillas; recortes previstos; operaciones transaccionales e idempotentes; fecha/estado y consumo de recortes.

## 6. Recortes Inteligentes — decisiones acordadas

**Propósito y límites:**
- El diferencial es **crear diseños de muebles nuevos, no existentes en el catálogo tradicional**, a partir de recortes reales. No sugerir automáticamente recortes para órdenes de producción tradicionales; ese circuito queda fuera de esta función.
- La IA consulta una **base de conocimiento especializada** preparada/mantenida por el equipo de desarrollo, sin ABM de conocimiento para usuarios. Alcance inicial: mesas auxiliares, estantes, organizadores, zapateros pequeños y módulos de guardado. Las referencias orientan nuevos diseños, no son un catálogo para copiar.
- Integración externa prevista con API de GPT para propuestas estructuradas y generación de imágenes. Proveedor, modelos, costo, formato y arquitectura concreta deben validarse técnicamente; no afirmar integración existente.
- El usuario **no conversa con la IA ni edita prompts ni solicita refinamientos**. Dispone de acción para generar sugerencias, consultar resultados, seleccionar, aprobar o descartar. Puede generar un nuevo lote de alternativas.
- Cada generación entrega **varias propuestas**, con imagen desde el principio, descripción, dimensiones, piezas, recortes a usar, insumos complementarios, BOM preliminar, costo estimado y cantidad sugerida. La imagen debe corresponder al diseño técnico; es ilustrativa, no plano certificado.
- Restricciones: recortes compatibles de **un mismo color y acabado** y características técnicas adecuadas (material, espesor); se pueden combinar diferentes dimensiones. No proponer más cantidad ni piezas que las que puedan obtenerse físicamente del stock real. Validación determinista de geometría/cantidades/disponibilidad en TEKA Manager, no confiar únicamente en GPT. Descartar propuestas que no superen validaciones; revisión humana de seguridad/estabilidad.
- **Un recorte se consume una sola vez y por completo** al utilizarse en una OP; no se generan recortes secundarios a partir del mismo. Recortes no se venden como materiales.
- Se conserva **historial de propuestas** e imágenes con estados Pendiente de revisión, Aprobada, Descartada; fecha y usuario de decisiones. Cualquier usuario con acceso al módulo puede aprobar o descartar, sin permiso especial adicional.
- **Aprobación y orden:** al seleccionar diseño, se prepara la orden con materiales/BOM y **cantidad a fabricar sugerida por IA**. El usuario puede modificar la cantidad; TEKA Manager valida nuevamente disponibilidad y límite fabricable. **Solo cuando el usuario confirma se crea la OP Pendiente**. La aprobación/selección por sí sola no descuenta stock ni inicia producción.
- El diseño aprobado se conserva en **Catálogo de Productos Fabricados con Recortes**, separado del catálogo tradicional, para poder reutilizarlo en futuras OP, sujeto a disponibilidad de materiales. La publicación comercial no es automática.
- El stock de muebles fabricados con recortes ingresa únicamente al finalizar OP, bajo las reglas de Producción. La publicación, precio y uso promocional se administran desde **E-commerce**. **Aclaración:** la administración de publicación en E-commerce no limita su venta manual: una vez finalizada la OP, con precio de venta definido y disponibilidad en el canal presencial, el producto debe poder seleccionarse en Ventas manuales aunque no esté publicado en la tienda online. No se crea desde el ABM tradicional de Productos, sino desde el diseño aprobado y su circuito de OP. Debe tener identidad comercial reutilizable y trazabilidad al diseño, OP y recortes consumidos.


**Control de existencias y trazabilidad de productos de recortes (aclaración 19/10/2026):**
- El Pañol de Recortes controla las existencias de material reutilizable; el Depósito de Productos Terminados controla por separado las unidades fabricadas con recortes.
- Aprobar una sugerencia o crear una OP pendiente no modifica stock; mientras se carga una venta manual, antes de guardar el pedido, tampoco se modifica stock. Al **iniciar la OP**, se consumen una sola vez los recortes completos y los insumos requeridos; al **finalizar la OP**, ingresan una sola vez las unidades realmente fabricadas. No hay ingreso parcial de terminados.
- La venta confirmada descuenta únicamente las unidades del producto terminado y su cupo de canal; **no vuelve a descontar los recortes**. La cancelación repone solo el producto terminado al canal original; no revierte consumos de una OP ya ejecutada.
- Deben existir movimientos auditables e idempotentes y conciliación independiente de recortes y productos terminados. El diseño puede reutilizarse en OP futuras si existen materiales compatibles.
- La validación debe incluir alta/actualización/baja y procedimientos heredados, no solo los SP nuevos, para impedir rutas que salteen movimientos o alteren pedidos confirmados.

**Costeo:**
- Costo histórico estimado del recorte al generarse: `(superficie del recorte / superficie de placa original) × costo de placa original`; conservar trazabilidad.
- Costo actualizado estimado con valor vigente de placa equivalente, para evaluar fabricación y precio. Incorporar insumos nuevos y otros costos de fabricación. **Evitar doble imputación contable** del costo de la placa ya consumida en producción anterior; revisar modelo de costos real.

**Indicadores y reportes (fundamentales para la tesis):**
- Porcentaje de aprovechamiento: superficie de recortes efectivamente reutilizados / superficie total de recortes generados × 100, con criterio de período/cohortes claramente explicitado.
- Superficie recuperada en m², cantidad de recortes utilizados, muebles fabricados con recortes, valor estimado del material recuperado, propuestas de IA aprobadas.
- Antigüedad de recortes aún disponibles; filtro y posibilidad de priorizarlos para sugerencias, **sin caducidad automática**. Reportes claros, filtrables por período y exportables, sin sobrecargar la UI con gráficos.

**E-commerce y obsequios:**
- Los muebles terminados fabricados con recortes pueden venderse **manualmente** desde Ventas y, si se publican, también individualmente en E-commerce, con los mismos controles de stock que los muebles tradicionales. Su catálogo de diseños permanece separado del ABM tradicional. Publicación online y elegibilidad de regalos se gestionan **solo en el módulo E-commerce**. La venta manual no depende de la publicación online; la elegibilidad como regalo no se aplica a ventas manuales.
- Promoción de **regalo sorpresa exclusiva de e-commerce**; no aplica a ventas de vendedores/presenciales. Administrador configura umbral mínimo de compra, habilitación y productos elegibles.
- Al cumplir condiciones, sistema asigna **un regalo por pedido**, aleatorio entre productos elegibles con stock asignado al canal online; cliente no elige. Línea de pedido a precio $0, con trazabilidad de promoción y selección. Stock se descuenta al confirmar pedido y se repone al cancelar conforme a reglas de Ventas. Selección y validación de stock deben ser seguras frente a concurrencia.

**Pendientes/decisiones diferidas:**
- Criterio de optimización IA entre atractivo comercial y máxima utilización de recortes: **usuaria pidió verlo más adelante**.
- Modelo técnico para validar cortes/ensamble, costos de imágenes y GPT, manejo de fallos, persistencia de imágenes, snapshots de diseños/BOM, generación de cantidad sugerida, condiciones del umbral promocional (subtotal, descuentos, envío), agotamiento de regalos, impacto de devoluciones y asignación por canal. No inventar detalles antes de revisar API/SQL.

## 7. Proveedores, Compras y Cuentas Corrientes — acuerdos del relevamiento

**Circuito principal:** solicitud de cotización → compra → remito → factura → cuenta corriente → orden de pago (OP). No todas las operaciones necesitan comenzar con cotización: la compra puede cargarse directamente. Los documentos relacionados deben precargar datos existentes para evitar duplicación, y deben poder registrarse documentos independientes cuando corresponda al circuito real. Conservar vínculos, estados, usuarios y fechas.

- Solicitud de cotización: posibilidad de consultar a **varios proveedores**, registrar y comparar sus ofertas; registrar vigencia, confirmación y si dio origen a una compra. El detalle de selección/adjudicación todavía no se relevó.
- Compra: puede generarse desde una cotización confirmada o ingresarse directamente.
- Remito: **relación uno a uno con compra**, expresamente decidida por la usuaria. Recupera los datos de la compra y el usuario confirma la recepción real; **solo al confirmar el remito ingresa stock de insumos**.
- Si la cantidad recibida no coincide con la comprada, **se deja marcada/registrada la diferencia** y su resolución se posterga. No crear compras adicionales ni remitos adicionales automáticamente; la usuaria pidió centrarse en el camino feliz.
- Factura: se vincula al circuito, reutiliza datos existentes y registra deuda en cuenta corriente. La factura puede llegar después del remito. No inferir que remito y factura siempre tienen relación uno a uno: solo se confirmó compra-remito 1:1.
- Cuenta corriente del proveedor: historial de facturas, notas de crédito, OP, pagos, saldos y vencimientos. La factura saldada permanece en historial. Distinguir saldo cancelado por pago, compensado por nota de crédito y comprobante anulado.
- **Orden de pago**: documento de pago que puede aplicarse a una o varias facturas **del mismo proveedor**. Una factura puede recibir varias OP (pagos parciales); una OP puede saldar varias facturas; no exceder el saldo aplicable. Anulación/corrección con trazabilidad, sin edición libre de OP confirmada.
- **No se admiten anticipos a proveedores ni pagos sin factura**. Notas de crédito pueden reducir deuda sin egreso de dinero.
- La usuaria indicó que este módulo **no es prioritario** y pidió no profundizar excepciones en esta etapa.

**Pendientes de análisis técnico:** documentos/relaciones realmente soportados por API y SQL; medios de pago de OP, estados y conciliación, forma exacta de registrar diferencias de recepción, casos independientes, notas de crédito y controles de anulación. No asumir que ya existen.

## 8. Precios de Venta — acuerdos del relevamiento

- **Una sola lista de precios vigente** para ventas presenciales/vendedores y e-commerce. Promociones y descuentos pueden variar por canal sin duplicar la lista.
- El precio sugerido se calcula con **costos variables + porcentaje configurable de costos fijos + margen de ganancia**. El porcentaje fijo tendrá justificación y vigencia; puede aplicarse como valor general y ajustarse para productos o grupos según corresponda.
- El responsable revisa, puede modificar y **confirma** el precio final. No se publican ni modifican precios automáticamente por cambios de costos.
- Aplicación individual, por grupo de productos o masiva sobre selección; historial de valores, fechas, responsables y criterios.
- Al cambiar el costo de un insumo, identificar los muebles afectados según composición/BOM, recalcular costos y **proponer** nuevos precios para aprobación, sin aplicarlos automáticamente.
- **Mismo módulo, dos métodos de costeo:** muebles tradicionales según materiales nuevos y fabricación; muebles fabricados con recortes según valorización de recortes, insumos adicionales y fabricación. Ambos aplican costos fijos y margen, pero **no se presume igual costo base**. Evitar doble imputación de la placa original ya consumida.
- El ejemplo de margen sobre precio de venta presentado en conversación es una **propuesta de cálculo**, no una fórmula técnica ratificada para todos los escenarios; definir explícitamente margen vs recargo, impuestos, redondeos y política de actualización antes de implementar.

**Pendientes técnicos:** fuente de costos de insumos, tratamiento de mano de obra y costos indirectos, fórmulas exactas, criterios de agrupación, permisos, vigencias e integración real con SQL/API.

## 9. E-commerce — acuerdos funcionales del relevamiento (15/10/2026)

**Administración centralizada en TEKA Manager:** publicaciones/ocultamiento sin inactivar inventario; fotografías (alta, baja, orden), descripciones, características, medidas y categorías; productos destacados; banners, textos, enlaces, campañas, secciones e información institucional, con vista previa y estructura prediseñada. Una única lista de precios para vendedores y tienda, con promociones específicas del canal. El e-commerce no duplica catálogo, stock, precios, ventas ni cobros.

**Realidad aumentada:** desde TEKA Manager se carga/reemplaza/elimina el modelo 3D de cada producto, se activa/desactiva «Ver en tu casa», se valida compatibilidad y se usan medidas reales para escala. La función solo aparece cuando está habilitada y el recurso está disponible; factibilidad técnica y formatos a verificar.

**Compra y carrito:** se puede explorar, agregar/quitar productos, cambiar cantidades y comprar sin registrarse. Los clientes registrados reutilizan datos y ven historial. Carrito persistente en la medida técnicamente posible, sin reservar stock; validar nuevamente precios/promociones/disponibilidad al confirmar. Favoritos para registrados, sin reserva. Productos similares y complementarios según categoría o relaciones configuradas desde TEKA Manager; solo publicaciones disponibles.

**Pagos y stock:** pedidos del e-commerce ingresan al circuito común de Ventas/Cobros; al confirmar el pedido se descuenta exactamente una vez el stock físico y el cupo del canal e-commerce, sin generar reservas. Pago online o efectivo al retirar en fábrica; 5 % de descuento exclusivamente sobre importe efectivamente pagado en efectivo. Para efectivo al retirar, pedido pendiente de pago/coordinación, vendedor contacta, cobra y registra entrega; sin vencimiento automático de 48 h. Se conserva el vencimiento previamente acordado de 1 h para pedidos online impagos que requieren pago online, sujeto a validación de eventos de pago tardíos. Nunca entregar sin pago total. Promociones temporales por productos/grupos con porcentajes y vigencia, sin alterar lista general; acumulación con descuento efectivo todavía sin resolver.

**Entrega:** retiro en fábrica o transporte coordinado y pagado directamente por el cliente. TEKA NO contrata, cobra ni gestiona el flete; coordina la entrega física al cliente o transportista indicado. El vendedor registra manualmente fecha, persona/transportista receptor y estado Entregado, con auditoría. No se entrega con saldo pendiente. Correo/WhatsApp del cliente obligatorios; validar formatos, y definir verificación efectiva por código/enlace según factibilidad. Contacto personal de vendedor por mail o WhatsApp.

**Seguimiento y comunicaciones:** reutilizar la trazabilidad y estados reales de Ventas/Cobros en una vista segura de seguimiento de pedidos para clientes registrados e invitados. Al registrar pedido enviar email con resumen y enlace seguro; notificaciones automáticas de confirmación de pago, listo para retirar, entregado y cancelado **solo por correo electrónico**, no WhatsApp. WhatsApp se reserva para coordinación comercial manual y recuperación de carritos. Vista pública no expone auditoría interna ni datos sensibles. Revisión de estados y API real pendiente.

**Carritos abandonados:** tras 2 h de inactividad (configurable) se podrá enviar correo y WhatsApp automáticos si hay contacto identificable, consentimiento y canal habilitado; evitar duplicados y envíos tras concretar compra; enlace para recuperar carrito; seguimiento de recuperación y ventas efectivas en E-commerce y Comercial, sin duplicar registros. Integración Meta/plantillas sujeta a verificación. Anónimos sin contacto: solo métricas.

**Consultas comerciales:** formulario general y consulta desde producto ingresan como consulta a Comercial, asociando producto y datos de contacto. No crear oportunidad automáticamente; el vendedor decide convertirla, conservando historial.

**Regalo sorpresa con recortes:** promoción exclusiva del e-commerce, configurada en TEKA Manager con umbral mínimo y elegibles; selección aleatoria por servidor de un mueble de recortes disponible, uno por pedido elegible, sin costo, con reserva/descuento y reversión de stock coherentes con la venta. Detalles de base del umbral y concurrencia pendientes.

**Pendientes/validación:** pagos electrónicos y proveedores reales, condiciones de consentimiento, plazos de pedidos no retirados, compatibilidad 3D, cálculo/promociones combinadas, estados reales y estructura API/SQL. No asumir implementación existente.

## 10. Próximos módulos y etapas

**Estado actualizado al 15/10/2026:** primera ronda de relevamiento funcional completada; Administración, app React Native/RA, Soporte e Inicio también fueron conversados. Persisten decisiones puntuales diferidas y la conciliación documental/técnica. Recortes Inteligentes, Proveedores/Compras, Precios de Venta y E-commerce ya cuentan con acuerdos funcionales en las secciones 6, 7, 8 y 9; Proveedores/Compras conserva excepciones diferidas por decisión de la usuaria.

**Después del relevamiento:** UX/UI de cada pantalla (listados, filtros Desde/Hasta, formularios, reportes, estados vacíos, permisos), mockups y aprobación. Inicio/dashboard por rol al final. Luego contraste técnico profundo, plan de implementación por etapas y pruebas.

## 11. Conciliación documental obligatoria

Este archivo refleja **acuerdos conversacionales**. Debe compararse antes de desarrollar con:
- `Informe Inicial - Benetti, Gaitan, Molina, Pigini, Zagales.docx`
- `Presentación del Proyecto - Benetti, Gaitan, Molina, Pigini, Zagales.docx`
- `Epicas_Teka.docx`
- `TEKA_Reglas_Negocio_y_Validaciones_Backend.docx`
- `RELEVAMIENTO_FUNCIONAL_TEKA_v1.md`
- `TEKA_BACKLOG_DECISIONES_v1.md`
- `00_VISION_PRODUCTO_TEKA_MANAGER.md`
- `01_Crear_Base_y_Tablas_TEKA.sql`, `02_Procedimientos_TEKA.sql`, `03_Datos_TEKA_2023_2026.sql`, `Api.zip`, DER y frontend actual (si se aporta).

**Diferencias conocidas a resolver:** regla de descuento efectivo, unidades m²/unidad, estructura de OP mono/multiproducto, posibles estados y depósitos. No modificar la base o API solo para hacer coincidir el documento sin análisis previo.

## 12. Administración, seguridad y navegación — acuerdos adicionales (15/10/2026)

- **Roles existentes en SQL como punto de partida**, pero administrables: crear, modificar, inactivar y reactivar roles sin eliminarlos físicamente; asignar exactamente un rol activo a cada usuario (decisión posterior que sustituye la propuesta anterior de múltiples roles). No fijar los nombres de roles en el frontend.
- **Decisión de autorización:** el **administrador** puede asignar y modificar los permisos de los roles. Los usuarios obtienen permisos mediante roles, sin excepciones individuales en esta etapa. La API debe verificar permisos efectivos, no solo ocultar botones. Proteger la continuidad de administración y auditar cambios sensibles.
- **Administración → Configuración del sistema:** mostrar solamente catálogos y parámetros **realmente configurables** y relevantes para usuarios de negocio. Nunca rotular la sección «Tablas auxiliares». No exponer estados o catálogos internos cuya edición rompa reglas de negocio. Organizar por áreas y utilizar etiquetas comprensibles.
- **Auditoría:** permitir consultar accesos, operaciones y cambios, con usuario, fecha y valores anteriores/nuevos cuando el mecanismo real los registre. No afirmar cobertura técnica sin verificarla.
- **Contraseñas:** desde Mi perfil el usuario autenticado puede cambiar la contraseña aportando la actual. En login, «Olvidé mi contraseña» envía un enlace seguro, temporal y de un solo uso al correo registrado mediante el backend/servidor de correo. El administrador puede iniciar un restablecimiento sin conocer la nueva contraseña. Al dar de alta un usuario se envía correo de bienvenida con enlace para definir la primera contraseña. Proteger tokens, frecuencia, sesiones y auditoría. Los tiempos y reglas exactas sugeridos aún requieren validación técnica.
- **Experiencia por permisos/roles — PENDIENTE DE DISEÑO UX DETALLADO:** definir **qué muestra el Inicio/dashboard** (tareas, KPIs, alertas y accesos), **menú lateral** y subopciones, **header** (perfil, notificaciones, navegación) y **footer** (identidad institucional y versión), según permisos efectivos. Cada usuario tendrá un único rol; ese rol determinará su modalidad y perfil de Inicio, siempre limitado por sus permisos efectivos. Menú colapsable, jerarquía clara y sin duplicaciones; interfaz compacta y no sobrecargada. Diseñar con los permisos/menús reales de SQL/API y revisar rutas del frontend.
- **Siguiente tema del relevamiento:** configuración general del sistema (datos institucionales, parámetros de negocio, notificaciones y correo, configuraciones de canal), diferenciando parámetros editables de secretos/ajustes técnicos protegidos. Aún no se definieron todos sus campos.


## 13. Configuración general — acuerdos cerrados (15/10/2026)

- **Datos institucionales centralizados:** el administrador mantiene una sola vez nombre comercial, razón social, datos fiscales pertinentes, domicilio, teléfono/WhatsApp, correo, logotipo, información institucional y horarios. Se reutilizan en presupuestos, comprobantes internos, reportes, emails y e-commerce cuando corresponda. No duplicar datos ni permitir inconsistencias entre módulos.
- **Apariencia:** modo claro, oscuro y automático según dispositivo. La preferencia es **individual por usuario** desde Mi perfil → Apariencia; no es un parámetro global obligatorio. Mantener identidad visual y legibilidad.
- **Plantillas de correo:** desde Administración → Configuración del sistema → Comunicaciones, el administrador puede modificar asunto, título, cuerpo, firma y elementos visuales de plantillas prediseñadas (bienvenida, recuperación de contraseña, pedidos, pagos, entregas, cancelaciones), con variables automáticas protegidas, vista previa con datos de ejemplo, envío de prueba y restauración de plantilla base. Los datos institucionales se reutilizan. Credenciales SMTP y secretos protegidos en backend, nunca expuestos en UI.
- **Centro de notificaciones:** campanita en el header, avisos por permisos efectivos, enlace directo al registro, nuevas/leídas y tareas pendientes cuando aplique, historial; evitar duplicar alertas del dashboard. **NO** crear preferencias individuales para activar/desactivar categorías de notificaciones: la usuaria rechazó expresamente esa complejidad.
- **Parámetros generales del negocio:** solo el administrador puede editarlos; auditar usuario, fecha, valor anterior y nuevo. Centralizar parámetros compartidos, como porcentaje de descuento en efectivo y plazos configurables, sin duplicar configuraciones que pertenecen a Comercial, E-commerce, Producción, etc.
- **Catálogos configurables:** en Configuración general, identificados por nombres de negocio (colores, categorías, unidades y otros realmente editables), con alta, modificación e inactivación; conservar referencias históricas y evitar borrado físico de valores usados. **Nunca** titular la pantalla «Tablas auxiliares» ni exponer catálogos técnicos que sostienen reglas del sistema. Verificar SQL/API antes de definir ABM concretos.
- **Administración de permisos:** el administrador asigna y modifica permisos de roles; las opciones del menú lateral, header, footer e Inicio/dashboard por rol/permisos quedan expresamente para revisión UX integral final.
- **Estado:** acuerdos funcionales, NO declaración de funcionalidades ya implementadas. Próximo relevamiento: Soporte e Incidencias, luego app móvil y por último diseño integral de Inicio/navegación.

## 14. Soporte e Incidencias — acuerdos cerrados (15/10/2026)

- **Módulo interno de mesa de ayuda:** TEKA Manager tendrá registro y seguimiento de incidencias del software, solicitudes de mejora y nuevas funcionalidades; no confundir con reclamos de compradores de muebles. Cada solicitud tiene identificador, tipo, módulo, descripción, evidencia adjunta, responsable, prioridad, estado, fechas e historial de comunicaciones y cambios.
- **Accesos:** usuarios de TEKA crean y consultan solicitudes y responden al equipo. Equipo proveedor ingresa al mismo sistema mediante usuarios propios y rol de **Soporte Técnico**, con permisos limitados a funciones de soporte, sin acceso automático a Ventas, Cobros, Inventario ni otros datos sensibles. Respetar gestión de roles por administrador y validación de permisos en API.
- **Circuito de incidencias:** Abierta → En análisis → En resolución → Resuelta → Cerrada, con estado Pendiente de respuesta del usuario cuando aplique. Al resolver, el usuario de TEKA valida: confirma y se cierra, o rechaza y se reabre; historial auditable.
- **Solicitudes de mejora/nueva funcionalidad:** distinguir de incidencias; evaluación, aprobación y planificación previas al desarrollo, sin conversión automática en tarea de programación.
- **Comunicación:** eventos relevantes disparan notificaciones internas y correos automáticos con plantillas editables de Configuración general: recepción, asignación, consulta de soporte, respuesta de usuario, cambio relevante de estado, resolución para validar, cierre y reapertura. Correo como aviso con enlace al ticket; las respuestas y modificaciones se registran dentro del sistema para preservar trazabilidad.
- **Prioridades:** Crítica, Alta, Media y Baja con criterios según impacto operativo. Objetivos de primera respuesta y resolución configurables por administrador del servicio; calcular según horario/calendario de atención real. Alertar vencimientos y próximos vencimientos. No establecer plazos arbitrarios ni prometer resolución garantizada.
- **Medición y mejora:** registrar horas de trabajo por ticket/técnico; indicadores de volumen, tiempo de primera respuesta, tiempo de resolución, cumplimiento de objetivos, reaperturas, reincidencias, satisfacción al cierre y mejoras implementadas. Filtros por fechas, estados, tipo y responsable; reportes exportables. Los indicadores de gestión del servicio se muestran en el único Inicio/dashboard del usuario de Soporte Técnico según sus permisos. El detalle, filtros y exportaciones se consultan en Reportes de Soporte; no crear un segundo dashboard. Apoyo a prácticas ISO/IEC 20000-1, sin afirmar certificación o cumplimiento integral.
- **Cambios y versiones:** vincular solicitudes aprobadas y tickets con cambios/versiones del sistema, registrando descripción, fecha, responsable, autorización y verificación cuando corresponda. Registro de novedades en lenguaje accesible a usuarios y trazabilidad técnica para soporte.
- **Identidad del proveedor:** nombre propuesto **Fractal IT**, con futuro isotipo inspirado en fractales; identidad separada de TEKA. Footer discreto con versión real de TEKA Manager y 'Desarrollado por Fractal IT' junto al isotipo. Acceso a **Acerca de TEKA Manager** desde perfil o Ayuda: versión instalada, última actualización, novedades e historial de versiones. No mostrar versiones de ejemplo como reales ni afirmar que el logotipo ya está diseñado.
- **Estado:** relevamiento funcional de Soporte e Incidencias finalizado; quedan validación técnica SQL/API, diseño UX y desarrollo. Siguiente revisión: aplicación móvil React Native y realidad aumentada; Inicio/dashboard y navegación por permisos se diseñarán al final.


## 15. Aplicación móvil para clientes — acuerdos adicionales (15/10/2026)

- **Finalidad:** aplicación React Native/Expo/TypeScript para compradores, conectada a la API de TEKA Manager. No administrar desde la app móvil productos, precios, stock, publicaciones ni producción. Mantener el desarrollo existente; verificar código antes de cambiarlo.
- **Estado reportado, no auditado:** catálogo, búsqueda/categorías, carrito, header/footer y navegación tienen avances; detalle de producto e integración con API requieren revisión; checkout completo, seguimiento, RA y recortes requieren verificar/terminar implementación.
- **Colección Circular:** sección destacada en Inicio y productos también visibles en catálogo/búsquedas; agrupa muebles terminados fabricados a partir de recortes. Solo se publican por decisión administrativa desde TEKA Manager, después de aprobación y fabricación. Ficha con fotografías, medidas, materiales, precio, disponibilidad y origen; compra normal. La IA generativa opera en TEKA Manager, no en la app del cliente.
- **Realidad aumentada:** acción «Ver en tu casa» en ficha de producto con modelo 3D habilitado; visualizar a escala real, mover y girar un único mueble en el ambiente usando cámara. Sin composición de habitaciones ni múltiples muebles inicialmente. Ante incompatibilidad del dispositivo o ausencia de modelo, informar sin impedir consulta/compra. Factibilidad y soporte en Expo/Android, formatos, permisos y escalado real pendientes de validación.
- **Identidad y cuenta:** registro e inicio de sesión opcionales por email/contraseña; compra como invitado permitida. Clientes registrados: perfil, datos de contacto, favoritos y «Mis pedidos». Favoritos **solo para registrados**, sin reservar stock ni congelar precios.
- **Seguimiento:** registrados consultan historial y detalle en «Mis pedidos»; invitados usan enlace seguro enviado por correo. La app consume estados y operaciones de Ventas/Cobros desde la misma API, sin duplicar circuitos.
- **Promoción:** regalo sorpresa de mueble elegible de recortes exclusivo del canal E-commerce según reglas acordadas; no se convierte en elección manual del cliente.

## 16. Inicio, dashboard, menú, header y footer — decisiones finales de primera ronda (15/10/2026)

- **Un usuario = un rol activo.** Esta decisión explícita **reemplaza** cualquier mención anterior a múltiples roles por usuario. El administrador crea/edita/inactiva roles y asigna permisos a roles; cada usuario recibe permisos de su único rol. Antes de implementar, conciliar el esquema actual `UsuarioRol` y el comportamiento real de la API con esta restricción.
- **Un solo Inicio/dashboard global, con vista definida por rol, sin paneles por módulo.** El contenido se configura por rol y permisos; los módulos presentan operaciones, listados, detalles, formularios y reportes, no dashboards independientes. **Dos modalidades de Inicio:** **ejecutivo** para Gerencia o roles autorizados a visión gerencial; **operativo** para roles con responsabilidades de Comercial, Ventas, Cobros, Inventario, Producción, Compras, Soporte, etc. Rol define modalidad/perfil; permisos restringen la información y las acciones.
- **Roles nuevos:** idea preliminar de permitir elegir perfil de Inicio predefinido (Gerencia, Comercial, Inventario, Producción, Cobros, Soporte, General). **Decisión detallada expresamente diferida por la usuaria**; no implementar aún como regla cerrada.
- **Indicadores por módulo:** cuando sean relevantes se consultan en reportes del módulo, no en un panel separado. Las alertas operativas pueden figurar en Inicio y enlazar al listado filtrado correspondiente. **Contenido máximo:** aproximadamente 3–4 KPIs relevantes, una sección priorizada de tareas que requieren intervención y pocas acciones rápidas. Sin gráficos decorativos, tablas completas duplicadas ni tarjetas vacías. Los indicadores deben tener fuente real, definición de negocio y período cuando corresponda; el clic lleva al listado correcto con filtros efectivos. No confundir importe de ventas con cobros, ni pedidos pendientes con pedidos vencidos.
- **Ejecutivo (propuesta a validar con datos):** ventas confirmadas del período, cobros confirmados, pedidos que requieren seguimiento y alertas operativas relevantes; acceso a reportes.
- **Operativo (propuesta a validar por rol):** Comercial (consultas, presupuestos y pedidos), Cobros (pagos por verificar, caja), Inventario (bajo mínimo, diferencias), Producción (órdenes por iniciar/finalizar), Compras (recepciones y facturas pendientes), Soporte (tickets asignados, críticos y vencidos). Seleccionar solo 3–4 KPIs por perfil, no sumar todas las áreas.
- **Navegación:** menú lateral colapsable con módulos y subopciones autorizadas; header compacto con identidad, campanita y perfil; perfil con datos personales, cambio de contraseña, apariencia y «Acerca de»; footer discreto con versión **real** y «Desarrollado por Fractal IT» e isotipo cuando exista. No duplicar navegación ni permitir acceso a acciones solo por ocultar UI: validar en backend.
- **Notificaciones:** centro en header según permisos, acceso al registro e historial; sin preferencias individuales de categorías. Evitar duplicar avisos en dashboard.
- **Estado:** primera ronda de relevamiento **cerrada a nivel de decisiones funcionales**, no significa especificación lista para programar ni validación contra documentación/API/SQL.

## 17. Conciliación y diseño seguro — siguiente etapa obligatoria

**Orden de trabajo:** (1) comparar este registro con anteproyecto, informe inicial, épicas, reglas backend, visión, backlog y DER; (2) contrastar con frontend rechazado, API real, scripts SQL y procedimientos, identificando qué existe, qué falla y qué falta; (3) revisar cada pantalla, proceso y contrato antes de solicitar cambios a Codex; (4) implementar incrementalmente y probar integridad.

**Entregable de conciliación:** matriz por requisito/circuito con fuente documental, acuerdo conversacional, pantalla actual, endpoint/DTO, tablas/procedimientos, contradicciones, riesgo de integridad, decisión y prueba de aceptación. Separar **confirmado**, **propuesto**, **pendiente de validar** y **contradictorio**.

**Controles transversales contra datos incorrectos:** campos y opciones desde catálogos reales, no valores hardcodeados; validaciones coherentes frontend/API/SQL; estados y transiciones válidos; transacciones atómicas para stock, pagos y producción; idempotencia para confirmaciones/reintentos/callbacks; integridad referencial; permisos backend; auditoría; evitar duplicar movimientos, descuentos, comprobantes y relaciones. Definir altas/ediciones/anulaciones, mensajes de error, concurrencia, estados vacíos, filtros y efectos colaterales antes de codificar. No alterar SQL/API solo para acomodar una pantalla.

**Conflictos conocidos que requieren conciliación expresa:** uno vs varios roles por usuario; OP de producción de uno vs varios modelos; unidad de recortes/insumos frente a medidas y m²; reglas de stock por canal; estados/depósitos; cálculo exacto de descuentos/promociones y costos.


### Aclaración posterior (19/10/2026): dashboard global definido por rol

Existe una única pantalla global de Inicio/dashboard. Su estructura, KPIs, tareas y accesos se definen por el rol activo y se limitan a los permisos efectivos. No se configura un dashboard diferente para cada usuario ni se crean dashboards por módulo. Usuarios del mismo rol comparten diseño; los datos pueden variar por asignaciones operativas. La definición detallada de perfiles y métricas sigue pendiente de validación.
