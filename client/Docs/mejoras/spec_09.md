# Especificación de Mejora 09: Resiliencia ante Errores de Renderizado (ErrorBoundary) y Optimización SEO en index.html

## 1. Información General
- **ID de la Mejora:** 09
- **Referencia del Relevamiento:** Hallazgos H-VL-009, H-VL-010 y H-VL-015 del Análisis Técnico de Valentín Lozano (Sección 6.1, 6.2, 6.3 y 8.2)
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Lozano
- **Rama de trabajo:** `ValenLoz/feature/resiliencia-seo-html`

## 2. Propósito y Descripción del Problema
1. **Ausencia de Contención de Errores de Renderizado (H-VL-015):** React no captura excepciones de renderizado mediante bloques `try/catch` convencionales. Ante un error inesperado (como propiedades indefinidas en respuestas asíncronas o fallos de renderizado de componentes), toda la jerarquía de la aplicación se desmonta provocando una pantalla en blanco ("white screen of death"), dejando al usuario sin información ni mecanismo de recuperación.
2. **Atributo de Idioma Inadecuado (H-VL-009):** `index.html` declara `lang="en"` para una aplicación desarrollada y presentada completamente en español. Esto provoca que los lectores de pantalla intenten interpretar el texto mediante síntesis fonética en inglés y degrada el posicionamiento SEO.
3. **Metadatos y Título Descriptivo Inexistentes (H-VL-010):** El título del documento figuraba con el identificador genérico `pvtrabajointegradorgrupo5` y carecía de etiqueta `<meta name="description">` ni `<meta name="theme-color">`.

## 3. Alcance de la Mejora

### Incluido
- **Implementación de `src/components/ErrorBoundary.jsx`:**
  - Componente de clase con los métodos de ciclo de vida `getDerivedStateFromError` y `componentDidCatch`.
  - Interfaz de degradación elegante (*graceful fallback*) con mensaje de error claro para el usuario, botón de recarga y botón para reintentar renderizado sin recargar toda la ventana.
  - Validación de `children` para cumplimiento con ESLint (`prop-types` o children estándar).
- **Integración en el árbol principal (`src/main.jsx`):**
  - Envolvimiento del componente `<App />` dentro de `<ErrorBoundary>` para proteger toda la experiencia de usuario ante excepciones no controladas.
- **Optimización de metadatos en `index.html`:**
  - Configuración de `lang="es"`.
  - Actualización del `<title>` a `Panel de Control de Clientes — Grupo 3`.
  - Inclusión de `<meta name="description">` descriptiva del sistema de gestión.
  - Inclusión de `<meta name="theme-color" content="#d63384">` coherente con la identidad visual del proyecto.

### Fuera de alcance
- Modificación de la lógica de negocio o de las peticiones a la API externa.
- Modificación de la configuración de rutas o proveedores de contexto.

## 4. Requisitos Funcionales y No Funcionales
- **RNF-01 - Resiliencia de UI:** Ante una excepción no controlada en el árbol de componentes, la aplicación debe mostrar una pantalla de degradación accesible con opciones de recuperación en lugar de colapsar a pantalla blanca.
- **RNF-02 - SEO y Accesibilidad:** La semántica global del documento HTML debe declarar explícitamente el idioma español para permitir la correcta lectura de tecnologías asistivas y motores de búsqueda.

## 5. Criterios de Aceptación
- **CA-01:** `index.html` cuenta con `lang="es"`, título descriptivo y meta description adecuados.
- **CA-02:** `ErrorBoundary` captura errores de renderizado en sus componentes descendientes y renderiza la interfaz de contingencia sin romper el árbol global.
- **CA-03:** `npm run lint` y `npm run build` finalizan exitosamente con 0 errores y 0 advertencias.
