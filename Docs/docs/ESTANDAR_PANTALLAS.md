# TEKA Manager — Estándar operativo de pantallas y primera implementación

**Estado:** estándar de diseño propuesto para aplicar al frontend existente. **Fecha:** 17/10/2026.
**Alcance:** todas las pantallas web de TEKA Manager. No cambia reglas de negocio ni contratos de API/SQL. La app móvil requiere adaptación propia.

## 1. Objetivo y regla de implementación

Un usuario nuevo debe reconocer qué proceso realiza, qué datos necesita, cuál es la acción siguiente y qué resultado tendrá. Conservar la arquitectura, componentes, rutas y servicios actuales; no rehacer pantallas que ya funcionan. Antes de modificar una pantalla, leer su componente, servicio y permisos reales. No inventar datos, rutas, campos, endpoints, estados o respuestas. Si falta soporte técnico, registrar la brecha y no simular resultados.

## 2. Jerarquía de cada pantalla

1. **Título de negocio y explicación breve:** por ejemplo, «Pedidos de venta» y «Consultá pedidos y continuá los que necesitan seguimiento».
2. **Acción principal visible:** «Nuevo pedido» si el permiso y el circuito lo permiten. Acciones secundarias agrupadas y discretas.
3. **Filtros uniformes** en una banda compacta, con fecha Desde/Hasta donde la entidad posea fecha relevante.
4. **Listado o área de trabajo principal** con columnas indispensables, estado legible y acciones claras.
5. **Detalles progresivos:** ver más, panel o detalle de registro. Evitar saturar el listado con datos secundarios.
6. **Ayuda contextual:** indicaciones breves junto a acciones delicadas; confirmación explícita para acciones irreversibles.

No mostrar tarjetas vacías ni gráficos decorativos. No duplicar información en tarjetas y tablas. Una pantalla debe tener una tarea principal reconocible.

## 3. Estándar de filtros

- **Todos los listados de registros fechados y todos los reportes:** ofrecer **Desde** y **Hasta**, ambos visibles y con etiquetas. Excepciones razonables: catálogos maestros sin fecha funcional, pantallas de edición de un único registro, búsquedas de stock actual. En estos casos, documentar por qué no corresponde un período.
- Definir **qué fecha se filtra**: fecha del pedido, fecha del cobro confirmado, fecha del movimiento, fecha de producción, etc. Mostrarla junto al filtro; nunca cambiarla silenciosamente.
- Permitir Desde y Hasta por separado si la consulta lo admite. Con ambos: Desde ≤ Hasta. Interpretar Hasta de forma inclusiva para fechas de negocio; no perder movimientos del último día por conversiones horarias.
- **Aplicar filtros** y **Limpiar filtros** con comportamiento consistente. Si se filtra automáticamente, indicar el comportamiento y evitar múltiples consultas por cada pulsación; preferir aplicar explícitamente en reportes de alto costo.
- Estado, tipo, canal, depósito y búsqueda textual según pertinencia; no añadir filtros sin utilidad.
- Filtros deben afectar **listado, contador, KPI, gráfico y exportación** de manera coherente. Si alguna métrica es global y no del período, identificarla claramente.
- Mostrar cantidad de resultados y período activo. Al cambiar filtros, volver a primera página y mantener ordenamiento. Estados de carga, vacío y error diferenciados.
- No filtrar únicamente en cliente si la API pagina y devuelve subconjuntos: usar filtros del servidor existentes o identificar contrato faltante.
- Reutilizar `src/components/data/DataTableFilters.tsx` como contenedor y crear un componente `DateRangeFilter` compartido si no existe otro equivalente. No introducir nuevas librerías sin justificación.

## 4. Estándar de gráficos

Un gráfico solo se conserva si responde una pregunta concreta y ayuda a decidir. En caso contrario, preferir KPI o tabla.

Cada gráfico debe presentar:
- **Título que describa la métrica:** no «Evolución» a secas, sino «Pedidos confirmados por mes».
- **Descripción breve:** qué se mide, por qué importa y qué decisión permite tomar.
- **Eje X rotulado:** variable y granularidad (fecha/día/mes, producto, canal, etc.).
- **Eje Y rotulado:** magnitud y unidad ($ ARS, pedidos, unidades, %, m²); valores legibles, separador de miles y escala coherente. Para porcentajes indicar 0–100 % si aplica; para cantidades enteras evitar marcas fraccionarias.
- **Leyenda:** solo cuando hay varias series; nombres comprensibles y diferenciables sin depender únicamente del color.
- **Tooltip de datos:** valor exacto, unidad, categoría/fecha y comparación cuando aplique.
- **Ícono `i` con hover/foco/clic accesible:** explicar fuente de datos, definición exacta, fecha utilizada, período, agregación, exclusiones, fórmula si corresponde, y cómo interpretar el gráfico. El contenido no debe depender exclusivamente del hover (teclado/táctil).
- **Sin datos:** mensaje «No hay datos para el período seleccionado»; nunca inventar puntos ni reemplazar faltantes por cero sin explicación.
- **Consistencia:** mismo período y criterios que los filtros del reporte; exportaciones coherentes.

Ejemplo: «Cobros confirmados por mes». X = mes de confirmación; Y = total confirmado en ARS; no incluir cobros pendientes/anulados. *Esta definición es objetivo de diseño; verificar campos y estados reales antes de implementarla.*

## 5. Formularios y acciones comprensibles

- Orden visual de acuerdo con el proceso: identificación → datos principales → detalle → resumen → confirmación.
- Campos obligatorios marcados; ejemplos útiles; formato de moneda/fechas/unidades argentino; catálogos reales; evitar abreviaturas técnicas.
- Validar al salir del campo y al guardar; errores específicos al lado del campo; errores de servidor traducidos sin ocultar detalle útil.
- Botones con verbos concretos: «Guardar borrador», «Confirmar pedido», «Registrar cobro», «Anular movimiento»; no usar «Procesar» o «Aceptar» si no explican el efecto.
- Antes de confirmar operaciones sensibles, resumir qué cambia: stock, saldo, estado, comprobante. No ejecutar dos veces por doble clic; bloquear mientras procesa y resolver reintentos según backend.
- Confirmación de éxito con identificador y siguiente paso («Pedido N.º ... confirmado. Ver detalle»); si falla, preservar datos ingresados.
- Estados vacíos con acción contextual y orientación: «Todavía no hay pedidos. Creá el primero» si el permiso lo permite; «No hay resultados para estos filtros. Limpiar filtros» cuando corresponda.
- No depender de color para transmitir estado. Tamaño de texto legible, navegación por teclado, foco visible, contrastes adecuados, modales con foco controlado.

## 6. Orden de procesos y navegación

- Cada módulo debe presentar sus tareas en el orden real del negocio, no según el orden de tablas o endpoints.
- **Ventas:** consultar pedidos → crear borrador → validar/confirmar → registrar o consultar pagos → entregar solo si está totalmente pagado → historial/cancelación según reglas.
- **Inventario:** consultar existencias → consultar movimientos → realizar ajustes/recuentos autorizados → mantener productos e insumos → analizar reportes. El ingreso por compra y por producción ocurre en sus circuitos de origen, no mediante duplicaciones manuales.
- **Cobros:** consultar pendientes → registrar pago → verificar/confirmar según medio → consultar aplicación/saldo/comprobante → anulación o devolución como circuitos diferenciados.
- **Producción:** planificar → iniciar → registrar consumos/resultados → finalizar → consultar trazabilidad.
- Para módulos todavía provisionales, no mostrar botones que aparenten realizar operaciones inexistentes.
- Navegación, acciones y KPIs condicionados por permisos reales. No confiar solo en ocultamiento visual.

## 7. Patrones compartidos a implementar antes de migrar masivamente

1. `DateRangeFilter`: desde/hasta, validación, fecha semántica visible y limpiar.
2. `FilterBar` o extensión controlada de `DataTableFilters`: búsqueda, filtros secundarios, aplicar, limpiar y resultados.
3. `ChartCard` + `ChartInfo`: título, descripción, ejes/unidades, ayuda accesible, carga/vacío/error.
4. `EmptyState` / `ErrorState` / `LoadingState`: textos y acciones consistentes.
5. `ConfirmActionDialog`: consecuencias de negocio explícitas y protección contra doble envío.
6. `PageIntro`: título, objetivo, acción primaria y ayuda breve.

Antes de crear cada componente, buscar equivalentes existentes y reutilizarlos. Evitar refactorizar toda la aplicación en una sola tarea.

## 8. Evidencia del frontend 17/10/2026

Se inspeccionaron directamente en `Front(20261017-181144).zip`:
- `src/components/data/DataTableFilters.tsx`: ofrece búsqueda, `children` para filtros y limpieza, **sin rango de fechas incorporado**; permite extender sin reemplazar.
- `src/features/sales/SalesOrdersPage.tsx`: listado real que utiliza `DataTable`, `DataTableFilters` y `PageHeader`.
- `src/features/inventory/InventoryReportsPage.tsx`: pantalla de reportes con manejo de fechas y gráficos; requiere revisar consistencia visual y semántica de filtros antes de editar.
- `src/features/inventory/InventoryCharts.tsx`: componentes de gráficos de inventario.
- `src/features/ecommerce/EcommerceAnalyticsCharts.tsx`: gráficos de e-commerce con lógica propia.
- `src/main.tsx`: rutas de la aplicación.

Esta inspección **no equivale** a una auditoría visual de todas las pantallas ni a pruebas de ejecución. No afirmar que todos los gráficos carecen de ejes o ayuda; verificar cada caso.

## 9. Orden de trabajo concreto

**Tarea 1 — componentes globales (sin tocar API/SQL):** inventariar patrones existentes y completar filtros Desde/Hasta, ayuda de gráficos y estados comunes. No aplicar cambios masivos aún.

**Tarea 2 — Ventas:** aplicar los patrones al listado de pedidos; simplificar creación y detalle con recorrido guiado. No modificar confirmación, stock o cobros sin resolver la contradicción SQL documentada.

**Tarea 3 — Inventario:** aplicar estándares a existencias, productos, insumos, movimientos y reportes; retirar el panel independiente tras verificar y migrar sus indicadores útiles al Inicio global o a reportes. Conservar consultas y reglas reales; evitar gráficos irrelevantes.

**Tarea 4 — Cobros y módulos provisionales:** especificar la pantalla real y migrarla con los mismos componentes. Revisar permisos y contratos existentes antes de codificar.

**Tarea 5 — resto de módulos:** aplicar el mismo estándar al migrarlos. Comercial se rediseña posteriormente, incluida su performance.

## 10. Criterios de aceptación del primer cambio

- Todos los nuevos filtros de fechas tienen Desde/Hasta visibles, fecha de referencia explícita y validación de rango.
- Listado, totales, gráficos y exportación usan filtros coherentes; si backend no soporta el período, no se finge que funciona.
- Cada gráfico intervenido indica claramente X, Y, unidades, período y fuente/interpretación en ayuda accesible.
- La tarea principal de cada pantalla se entiende sin manual, y las acciones irreversibles explican sus consecuencias.
- No se alteraron contratos API/SQL ni reglas de stock, pagos o permisos sin aprobación.
- Build y pruebas existentes pasan; se documentan limitaciones y capturas antes/después.

## 11. Aplicación del estándar

Este documento es la referencia visual y arquitectónica permanente. El diagnóstico funcional y técnico y las decisiones de rediseño corresponden al equipo de proyecto; Codex/Antigravity implementan tareas delimitadas y aprobadas. No solicitar al agente auditorías generales como requisito de cada cambio. Para cada tarea, inspeccionar únicamente los archivos de código involucrados y las secciones pertinentes de este estándar.

## 12. Contrato visual global obligatorio — design system TEKA Manager

**Prioridad:** esta sección se aplica a toda pantalla nueva y a toda pantalla modificada. Una misma interfaz, no diseños independientes por módulo. Los valores concretos de colores, tipografías, tamaños y espaciados se deben **extraer del tema, layout y componentes reales del frontend**; no inventar una paleta paralela ni copiar CSS de otra pantalla. Inventario es una referencia visual útil, pero no debe convertirse en una plantilla duplicada.

### 12.1 Shell único de aplicación

- Una sola implementación del layout global: sidebar, header, área principal, footer, navegación activa, responsive y controles por permisos. Cada módulo se renderiza dentro de ese layout; **prohibido recrear sidebar/header/footer locales**.
- Sidebar: mismas dimensiones, jerarquía módulo/subopción, íconos, sangría, estados activo/hover/foco, comportamiento expandido/colapsado, scroll y persistencia existente. No introducir variantes por módulo.
- Header: misma altura, identidad, navegación contextual cuando corresponda, notificaciones y perfil. Footer discreto compartido con versión real y atribución institucional si están disponibles.
- Mantener ancho máximo de contenido, márgenes, padding, puntos de quiebre y comportamiento del scroll consistentes. No generar doble scrollbar ni desbordamiento horizontal accidental.

### 12.2 Plantilla única de pantalla

Orden base: **PageIntro** (título de negocio, descripción de una frase, acción primaria) → filtros pertinentes → área de trabajo (tabla, formulario o reporte) → detalles bajo demanda. Breadcrumbs solo si ayudan a ubicarse; no duplicar navegación.

- Mismos estilos de títulos, subtítulos, tarjetas, separadores, íconos, botones y estados; reutilizar tokens existentes.
- Una sola acción primaria visible por contexto; acciones secundarias con jerarquía consistente. No usar KPI/gráfico si no facilita una decisión.
- Pantallas de listado, detalle, formulario y reporte pueden variar en composición interna, **no en el shell ni en los componentes base**.
- Formularios largos agrupados por pasos o secciones de negocio; no presentar todo simultáneamente.

### 12.3 Catálogo obligatorio de patrones reutilizables

| Patrón | Regla |
|---|---|
| Navegación | Usar shell y menú compartidos, no JSX duplicado |
| Encabezado | Usar `PageHeader` existente o su evolución común; no variantes locales |
| Filtros | Extender `DataTableFilters` existente; `DateRangeFilter` reutilizable para fechas aplicables |
| Tablas | Usar `DataTable` existente y estilos unificados para estados, paginación y acciones |
| Gráficos | Contenedor `ChartCard`/`ChartInfo` común si no existe equivalente; ejes, unidades, período y ayuda accesible |
| Formularios | Usar campos/validación existentes; etiquetas, errores y acciones uniformes |
| Confirmaciones | Modal común que explique consecuencias; proteger contra doble envío |
| Estados | Componentes compartidos de loading, error, sin registros y sin coincidencias |
| Feedback | Notificaciones consistentes; nunca `alert()` del navegador |

Los nombres nuevos son **propuestas**, no afirmaciones de existencia: antes de crearlos, buscar componentes equivalentes. Evitar dependencias nuevas salvo necesidad demostrada.

### 12.4 Reglas visuales y de interacción

- Definir una sola fuente de tokens de diseño en el proyecto: color de marca, superficies, bordes, texto, estados, tipografía, radios, sombras, espaciado (escala de 4 px si el proyecto lo permite) y breakpoints. **No fijar hexadecimales ni medidas arbitrarias por módulo**.
- Usar los mismos estados hover, focus, disabled, loading y selected en toda la aplicación. Contraste, foco visible, teclado y ayudas utilizables sin mouse.
- Fechas con formato argentino, montos ARS, cantidades y unidades consistentes. Nunca depender exclusivamente del color para estados.
- No duplicar componentes por comodidad: si un patrón ya existe, extenderlo sin romper sus consumidores.
- La consistencia se verifica visualmente en al menos una pantalla de listado, una de formulario y una de reportes, además de sidebar expandido/colapsado.

### 12.5 Flujo obligatorio para agentes

1. Leer `AGENTS.md` y **solo las secciones pertinentes** de este estándar; consultar `ACUERDOS_FUNCIONALES.md` únicamente para reglas del proceso afectado.
2. Inspeccionar layout, rutas, tema/tokens y componentes compartidos reales; identificar qué reutilizar.
3. Enumerar archivos concretos a modificar y qué patrón global se aprovecha. **No copiar una pantalla completa para reproducir su apariencia.**
4. Implementar un cambio acotado; no alterar API, SQL, permisos ni reglas de negocio sin aprobación.
5. Ejecutar build/pruebas disponibles y revisar consistencia visual/responsive. Informar archivos modificados, resultado y limitaciones.

**Definición de terminado:** la pantalla utiliza el shell global, patrones y tokens comunes; su acción principal y recorrido son claros; no agrega estilos locales innecesarios; mantiene comportamiento funcional real; pasa compilación y controles pertinentes.

### 12.6 Estrategia de adopción sin reescribir todo

**Primero** auditar shell/tema/componentes y corregir los componentes compartidos. **Después** aplicar el estándar a una pantalla piloto (Ventas o Inventario), validar y extender gradualmente a los demás módulos. La actualización de un componente global debe probar sus consumidores existentes.

## 13. Arquitectura y organización del frontend — regla permanente

**Objetivo:** mantener código modular y fácil de mantener sin imponer migraciones masivas ni carpetas vacías. La estructura siguiente es una **referencia objetivo** que debe adaptarse a los directorios reales ya existentes.

```text
src/
├── app/                 # Configuración, rutas y proveedores globales, si corresponde
├── components/          # Componentes compartidos
│   ├── layout/          # Shell, sidebar, header, footer
│   ├── ui/              # Campos, botones, modales y feedback
│   ├── data/            # Tablas, filtros y paginación
│   └── charts/          # Gráficos y ayudas contextuales
├── features/
│   └── [modulo]/
│       ├── pages/       # Composición de pantallas
│       ├── components/  # UI específica del módulo
│       ├── hooks/       # Estado y lógica de presentación
│       ├── services/    # Comunicación con API
│       ├── utils/       # Transformaciones puras
│       └── types/       # Tipos e interfaces
└── styles/              # Tema/tokens y estilos globales, si existen
```

### Reglas de implementación

1. **Un solo sistema de diseño:** sidebar, header, footer, tablas, filtros, gráficos, campos y modales compartidos. Ninguna feature debe recrear componentes globales ni inventar una paleta propia.
2. **Responsabilidades claras:** las páginas componen la interfaz; los servicios gestionan HTTP; hooks encapsulan estado/lógica compleja; utilidades contienen transformaciones puras. No mezclar llamadas HTTP, validaciones de negocio complejas, cálculos y renderizado en componentes monolíticos.
3. **Estilos:** Tailwind en JSX es válido. Centralizar tokens, variantes y patrones repetidos; evitar clases extensas duplicadas y valores arbitrarios dispersos. No separar CSS por obligación cuando no mejora mantenimiento.
4. **Tipos y contratos:** reutilizar tipos reales de la API, sin duplicar DTO incompatibles ni hardcodear datos de negocio.
5. **Validaciones:** experiencia uniforme en frontend y autoridad final del backend; mensajes junto al campo y preservación de datos ante error.
6. **Reutilización razonable:** extraer componentes, hooks y funciones cuando haya una responsabilidad reconocible; no crear abstracciones innecesarias.
7. **Refactor seguro:** antes de mover archivos, verificar imports, rutas, consumidores, pruebas y dependencias. Mantener comportamiento y contratos. No reorganizar todo el proyecto en una sola tarea.
8. **Comprobación:** build, TypeScript/lint si existen, navegación y pruebas funcionales de pantallas afectadas. Informar exactamente qué cambió.

### Roles de trabajo

- **ChatGPT + equipo:** análisis integral del módulo contra acuerdos, SQL, API y frontend; decisiones de UX/UI, alcance y orden de cambios.
- **Codex/Antigravity:** implementar solamente la tarea aprobada, inspeccionando código pertinente para evitar roturas; no decidir reglas de negocio ni hacer un diagnóstico general por iniciativa propia.
- **Equipo + ChatGPT:** validar el resultado antes de continuar.

La arquitectura se aplica desde el inicio a las pantallas nuevas y progresivamente a las existentes. **No debe ser motivo para reescribir código funcional sin una mejora concreta.**


## 14. Dashboard único y rediseño UX/UI posterior a la auditoría

- **Un único Inicio/dashboard global, con vista definida por rol**, condicionado por los permisos efectivos. Prohibido crear dashboards, paneles KPI o pantallas de resumen independientes por módulo. El Inicio admite aproximadamente 3–4 indicadores relevantes, tareas priorizadas, alertas y accesos a operaciones autorizadas.
- Cada módulo se organiza en **pantallas de trabajo**: listados, formularios, detalles, procesos guiados y reportes cuando aporten valor. No colocar KPIs ni gráficos de adorno antes de la tarea principal. Los reportes analíticos del módulo no constituyen un segundo dashboard.
- Las alertas del Inicio deben abrir el listado operativo pertinente con filtros efectivos. Si no existe soporte técnico para ese vínculo, registrarlo como brecha, no simularlo.
- Tras la auditoría integral realizada por el equipo con ChatGPT, presentar **al menos dos alternativas de organización UX/UI** cuando haya decisiones de diseño relevantes. Cada alternativa debe mostrar menú/subopciones, mapa de pantallas, recorrido del usuario nuevo, acciones, datos visibles, filtros, estados, componentes compartidos y efectos sobre módulos relacionados. Recomendar una alternativa justificando claridad, simplicidad y compatibilidad con los acuerdos.
- Para la alternativa recomendada, describir **cada pantalla propuesta**: objetivo, usuario/permisos, punto de entrada, layout, bloques en orden, campos/columnas, acciones primaria/secundarias, validaciones, estados de carga/error/vacío, navegación de ida/vuelta, responsive y accesibilidad. Identificar explícitamente pantallas existentes a conservar, fusionar, reemplazar o retirar, y adónde migra su funcionalidad.
- **No dar por aprobado un rediseño sin validación del equipo.** La propuesta UX/UI no modifica por sí sola SQL, API, rutas ni reglas de negocio. Codex y Antigravity implementan únicamente la solución elegida.


### Aclaración de alcance: rol, no personalización individual

El dashboard es una pantalla global única cuya composición se determina por rol y permisos efectivos. No hay configuración de dashboards individuales por usuario ni paneles separados por módulo. Usuarios con el mismo rol comparten la estructura, aunque las tareas y datos visibles pueden variar según sus asignaciones.
