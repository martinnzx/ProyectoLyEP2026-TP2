# Especificación de Mejora 08: Accesibilidad Web (WCAG 2.1 AA) en FormCliente y Alertas de Feedback

## 1. Información General
- **ID de la Mejora:** 08
- **Referencia del Relevamiento:** Sección 6.4 (Accesibilidad en formularios y alertas) y Fase 4 del Roadmap
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Iriarte
- **Rama de trabajo:** `ValenIr/feature/accesibilidad-formulario-alertas`

## 2. Propósito y Descripción del Problema
1. **Desvinculación entre Etiquetas y Controles (Sección 6.4):** En el componente `src/components/FormCliente.jsx`, las etiquetas `<Form.Label>` carecen del atributo `htmlFor` asociado al `id` del correspondiente `<Form.Control>`. Esto impide que lectores de pantalla reconozcan qué campo se está completando e inhabilita la funcionalidad de clic sobre el label para enfocar el input.
2. **Alertas sin Semántica ARIA en Tiempo Real (Sección 6.4):** Las alertas de React-Bootstrap no especifican `role="alert"` ni `aria-live="polite"` / `aria-live="assertive"`. En consecuencia, usuarios que dependen de software asistivo no son notificados de manera audible cuando se produce un error de validación o una confirmación exitosa de alta.

## 3. Alcance de la Mejora

### Incluido
- Adición de identificadores únicos en `<Form.Control>` y asociación mediante `htmlFor` en `<Form.Label>` en `src/components/FormCliente.jsx`:
  - Campo Nombre (`cliente-nombre`)
  - Campo Email (`cliente-email`)
  - Campo Teléfono (`cliente-telefono`)
  - Campo Ciudad (`cliente-ciudad`)
- Incorporación de `role="alert"` y `aria-live="polite"` en la alerta de confirmación exitosa.
- Incorporación de `role="alert"` y `aria-live="assertive"` en la alerta de error de validación.

### Fuera de alcance
- Modificación del esquema de validación o del payload enviado a `useClientes()`.
- Modificaciones en otras vistas o estilos CSS.

## 4. Requisitos Funcionales y de Accesibilidad
- **RF-01 - Foco por Etiqueta:** Al hacer clic sobre cualquier etiqueta de campo ("Nombre", "Email", "Teléfono", "Ciudad"), el cursor debe posicionarse automáticamente en el campo de entrada correspondiente.
- **RF-02 - Notificación en Pantalla:** Los mensajes de error y confirmación deben contar con roles ARIA adecuados para que lectores de pantalla interpreten los cambios dinámicos en el DOM.

## 5. Criterios de Aceptación
- **CA-01:** Todos los `<Form.Group>` de `FormCliente.jsx` tienen relación explícita `htmlFor` - `id`.
- **CA-02:** Los componentes `<Alert>` de éxito y error implementan `role="alert"` y su respectivo atributo `aria-live`.
- **CA-03:** `npm run lint` y `npm run build` continúan pasando con 0 errores y 0 advertencias.
