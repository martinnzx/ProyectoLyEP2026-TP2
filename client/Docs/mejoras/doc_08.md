# Documentación de Mejora 08: Accesibilidad Web (WCAG 2.1 AA) en FormCliente y Alertas de Feedback

## 1. Información General
- **ID de la Mejora:** 08
- **Referencia del Relevamiento:** Sección 6.4 (Accesibilidad en formularios y alertas) y Fase 4 del Roadmap
- **Fecha de Implementación:** 2026-09-12
- **Responsable:** Valentín Iriarte
- **Rama de trabajo:** `ValenIr/feature/accesibilidad-formulario-alertas`
- **Especificación asociada:** `Docs/mejoras/spec_08.md`

## 2. Resumen de la Implementación
Se subsanaron las deficiencias de accesibilidad web identificadas en la Sección 6.4 del análisis técnico dentro del formulario de alta de clientes:

### 2.1 Asociación Semántica de Etiquetas y Campos
- En `src/components/FormCliente.jsx`, se vincularon explícitamente los `<Form.Label>` mediante el atributo `htmlFor` con sus respectivos `<Form.Control>` identificados por `id`:
  - Nombre: `htmlFor="cliente-nombre"` ↔ `id="cliente-nombre"`
  - Email: `htmlFor="cliente-email"` ↔ `id="cliente-email"`
  - Teléfono: `htmlFor="cliente-telefono"` ↔ `id="cliente-telefono"`
  - Ciudad: `htmlFor="cliente-ciudad"` ↔ `id="cliente-ciudad"`
- Esta mejora permite que tecnologías asistivas reconozcan con precisión el propósito de cada campo y habilita el comportamiento nativo de enfocar el campo al presionar sobre la etiqueta.

### 2.2 Semántica ARIA en Mensajes de Notificación Dinámica
- A la alerta de éxito se le incorporó `role="alert"` y `aria-live="polite"` para anunciar la confirmación de creación del cliente sin interrumpir bruscamente la lectura.
- A la alerta de error se le incorporó `role="alert"` y `aria-live="assertive"` para notificar de manera inmediata fallos de validación o red al operador.

## 3. Commits Atómicos Propuestos
1. `docs(mejoras): agregar spec_08 de accesibilidad en formulario y alertas`
2. `feat(a11y): asociar etiquetas htmlFor con id en FormCliente`
3. `feat(a11y): incorporar role alert y aria-live en alertas de feedback`
4. `docs(mejoras): agregar doc_08 con verificaciones de accesibilidad`
5. `docs: actualizar dia.md con el registro de la mejora 08 de Valentin Iriarte`

## 4. Resultado y Verificación
- **Usabilidad y Accesibilidad:** Se comprobó que el clic sobre cada label traslada el foco al input correspondiente.
- **Linter Global:** `npm run lint` finalizó con **0 errores y 0 advertencias**.
- **Build de Producción:** `npm run build` ejecutó exitosamente.
