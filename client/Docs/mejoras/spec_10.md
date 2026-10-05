# Especificación de Mejora 10: Arquitectura CSS con Design Tokens, Especificidad Limpia y Diseño Responsive

## 1. Información General
- **ID de la Mejora:** 10
- **Referencia del Relevamiento:** Hallazgos H-VL-005, H-VL-006, H-VL-008, H-VL-011, H-VL-012 y H-VL-013 del Análisis Técnico de Valentín Lozano (Sección 5 y 7)
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Lozano
- **Rama de trabajo:** `ValenLoz/feature/responsive-arquitectura-css`

## 2. Propósito y Descripción del Problema
1. **Ausencia de Design Tokens y Valores Mágicos Hardcodeados (H-VL-012):** En los 9 archivos CSS se repiten literalmente más de 30 veces los mismos valores cromáticos (`#d63384`, `#c2185b`, `rgba(214,51,132,...)`), radios y sombras. Esto dificulta el mantenimiento e impide cambios de tema o paleta institucional.
2. **Inexistencia de Adaptabilidad Responsive (H-VL-011):** La aplicación carece de media queries y utiliza anchos fijos (`width: 430px`, `width: 700px`), provocando desbordamiento horizontal en pantallas móviles (< 700px) y compresión excesiva en la tabla de clientes.
3. **Colisión de Estilos por Selectores Globales de Elemento (H-VL-013):** En `login.css`, estilos sobre selectores directos de etiqueta (`form`, `form input`, `form button`) contaminan involuntariamente otros formularios como el de alta de clientes.
4. **Contraste de Color y Accesibilidad en Formulario de Login (H-VL-005, H-VL-006, H-VL-008):** El color de texto secundario `#5f4b57` sobre blanco (4.22:1) no alcanza el mínimo de 4.5:1 requerido por WCAG 2.1 AA. Además, `Login.jsx` carece de vinculación `htmlFor`/`id` y semántica ARIA en errores.

## 3. Alcance de la Mejora

### Incluido
- **Centralización de Design Tokens en `:root` (`src/css/app.css`):**
  - Definición de variables CSS para paleta de colores, contrastes accesibles WCAG AA, radios de borde, sombras y transiciones.
  - Refactorización de todos los archivos CSS (`login.css`, `dashboard.css`, `listaclientes.css`, `detallecliente.css`, `header.css`, `nav.css`, `formcliente.css`, `footer.css`) para consumir las custom properties.
- **Implementación de Layouts Fluidos y Media Queries Responsive:**
  - Conversión de anchos rígidos a anchos fluidos con `max-width` y `width: 100%`.
  - Contenedor con desplazamiento horizontal asistido (`.tabla-responsive`) para la tabla de clientes en dispositivos de baja resolución.
  - Reglas `@media (max-width: 768px)` y `@media (max-width: 480px)` para adaptar padding, navegación y tarjetas del Dashboard en móviles.
- **Aislamiento de Especificidad en Login (`src/css/login.css` y `src/pages/Login.jsx`):**
  - Uso de clases `.login-form`, `.login-input`, `.login-button` y `.login-error` para evitar colisiones con otros formularios.
- **Accesibilidad y Contraste WCAG 2.1 AA en Login:**
  - Vinculación de labels con inputs mediante `htmlFor` e `id` (`login-email`, `login-password`, `login-sector`).
  - Incorporación de `role="alert"` y `aria-live="polite"` en mensajes dinámicos de validación.
  - Ajuste del contraste de texto secundario a `#4a3845` (ratio > 5.5:1).

### Fuera de alcance
- Modificación de la lógica de autenticación o persistencia.

## 4. Requisitos de Calidad y Criterios de Aceptación
- **CA-01:** `src/css/app.css` declara los design tokens en `:root` y los archivos CSS consumen dichas variables.
- **CA-02:** La interfaz es completamente responsive en anchos de 375px, 768px y resoluciones desktop, sin desbordamiento horizontal.
- **CA-03:** El formulario de login cuenta con accesibilidad semántica (`htmlFor`, `id`, `role="alert"`) y estilos aislados por clases.
- **CA-04:** `npm run lint` y `npm run build` pasan sin errores ni advertencias.
