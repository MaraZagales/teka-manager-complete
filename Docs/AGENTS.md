# TEKA Manager — instrucciones mínimas para agentes

1. Toda pantalla debe usar **un único sistema visual**: layout/sidebar/header/footer, tokens, navegación, filtros, tablas, formularios, gráficos y estados compartidos. No copies el estilo de otro módulo ni crees variantes locales.
2. Para tareas visuales consultá `docs/ESTANDAR_PANTALLAS.md`, especialmente §12 y la sección específica afectada. Para cambios de negocio consultá **solo el módulo relevante** de `docs/ACUERDOS_FUNCIONALES.md`. No leas ambos documentos completos automáticamente.
3. Inspeccioná primero el código real. Reutilizá componentes existentes; no inventes endpoints, DTO, campos, estados, permisos ni reglas.
4. Mantené API y SQL intactos salvo autorización expresa. Señalá incompatibilidades entre acuerdos y código antes de tocar operaciones sensibles.
5. Trabajá por tarea pequeña: archivos afectados, implementación, build/pruebas y resumen verificable. No generes nuevos `.md` ni auditorías salvo pedido explícito.
6. Prioridad UX: persona nueva comprende dónde está, qué hace, cómo continuar y qué cambia al confirmar. Filtros de registros fechados Desde/Hasta; gráficos con ejes, unidades y ayuda contextual.

7. Respetá la arquitectura y separación de responsabilidades de `docs/ESTANDAR_PANTALLAS.md` §13. No mezcles servicios HTTP, lógica compleja y presentación ni dupliques estilos. El diagnóstico y las decisiones funcionales los realiza el equipo con ChatGPT; vos implementás la tarea aprobada.

8. Un único Inicio/dashboard global, con vista definida por rol y permisos. No crear paneles por módulo; las métricas detalladas van en reportes y las alertas del Inicio enlazan a operaciones reales. Ver `docs/ESTANDAR_PANTALLAS.md` §14.

9. El dashboard es GLOBAL y se define POR ROL, no se configura individualmente por usuario. Usuarios del mismo rol comparten estructura; los datos pueden variar por asignaciones y permisos.
