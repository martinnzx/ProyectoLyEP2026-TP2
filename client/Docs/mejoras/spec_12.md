# Especificación de Mejora 12: Configuración de Infraestructura de Testing Automatizado con Vitest y Testing Library

## 1. Información General
- **ID de la Mejora:** 12
- **Referencia del Relevamiento:** Hallazgo H-018 y Acción A-007 del Relevamiento Técnico Consolidado (`Docs/relevamiento_final/relevamiento_final.md`) y Hallazgo H-VL-016 del Análisis Técnico de Valentín Lozano
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Lozano
- **Rama de trabajo:** `ValenLoz/feature/infraestructura-testing`

## 2. Propósito y Descripción del Problema
1. **Ausencia Total de Infraestructura de Pruebas Automatizadas (H-018 / A-007):** El proyecto carecía de un framework de testing configurado (`vitest`, `jest`, etc.). Cualquier modificación o refactorización corría el riesgo de introducir regresiones silenciosas en flujos críticos (autenticación, validación de credenciales, peticiones HTTP y servicios de datos).
2. **Dependencia Exclusiva de Verificación Manual:** Todas las comprobaciones requerían levantar el servidor de desarrollo e interactuar manualmente con la interfaz, ralentizando el ciclo de desarrollo e impidiendo validaciones continuas reproducibles.

## 3. Alcance de la Mejora

### Incluido
- **Instalación de Dependencias de Testing:**
  - `vitest`, `@testing-library/react`, `@testing-library/jest-dom` y `jsdom`.
- **Configuración del Entorno de Pruebas:**
  - Integración de `test` en `vite.config.js` con entorno `jsdom`, globales habilitados y archivo de setup.
  - Creación de `src/test/setup.js` para extensión de matchers de Jest DOM.
  - Adición de scripts `npm test` (`vitest run`) y `npm run test:watch` (`vitest`) en `package.json`.
- **Suite de Pruebas Automatizadas:**
  - **Pruebas Unitarias de Autenticación (`src/services/__tests__/autorizacionesServices.test.js`):**
    - Verificación de login exitoso con credenciales y sector válidos.
    - Rechazo ante email no existente.
    - Rechazo ante contraseña errónea.
    - Rechazo ante discrepancia de sector/rol.
  - **Pruebas Unitarias de Servicios HTTP (`src/services/__tests__/clientesService.test.js`):**
    - Mocks de Axios para `obtenerClientes` (GET).
    - Creación de nuevo cliente con payload correcto (POST).
    - Eliminación de cliente por ID (DELETE).

### Fuera de alcance
- Tests de integración End-to-End (Cypress / Playwright).

## 4. Requisitos y Criterios de Aceptación
- **CA-01:** `npm test` ejecuta los tests en modo headless y reporta el 100% de los casos aprobados.
- **CA-02:** Los servicios de autenticación y clientes quedan cubiertos con tests unitarios reproducibles.
- **CA-03:** `npm run lint` y `npm run build` continúan finalizando con 0 errores y 0 advertencias.
