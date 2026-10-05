# Especificación de Mejora 07: Maquetación Semántica, Limpieza de Código Muerto y Deuda Técnica de ESLint

## 1. Información General
- **ID de la Mejora:** 07
- **Referencia del Relevamiento:** H-008 (Maquetación y sticky footer), H-006 (Código muerto en Dashboard) y Fase 1 / H-011 (Deuda técnica de lint)
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Iriarte
- **Rama de trabajo:** `ValenIr/feature/maquetacion-calidad-codigo`

## 2. Propósito y Descripción del Problema
1. **Falta del contenedor `<main>` y colapso del sticky footer (H-008):** En `src/css/app.css` se define `main { flex: 1; }` junto con flexbox en `body` para fijar el footer al pie en vistas con poco contenido (como `/login`). No obstante, en `src/App.jsx` no existe la etiqueta `<main>`, dejando la regla inoperante.
2. **Código inalcanzable en Dashboard (H-006):** En `src/pages/Dashboard.jsx` se evalúa `{!admin ? <Login /> : ...}`. Dado que la ruta `/` se encuentra blindada por `<RutaProtegida>` (la cual redirige inmediatamente a `/login` si no hay sesión), la condición `!admin` y el import del componente `Login` son código muerto.
3. **Errores de compilación y linter (Fase 1 / H-011):** `npm run lint` arroja 3 errores:
   - `src/App.jsx`: `useAutorizaciones` importado y no utilizado.
   - `src/routes/routes.jsx`: `Navigate` importado y no utilizado.
   - `src/context/AutorizacionesContext.jsx`: Advertencia crítica de Fast Refresh por exportar contexto y componente conjuntamente.

## 3. Alcance de la Mejora

### Incluido
- Creación de `src/context/AutorizacionesContextDefinition.js` para desacoplar la creación del contexto y cumplir con las normas de Fast Refresh de React.
- Actualización de `src/context/AutorizacionesContext.jsx` y `src/hooks/useAutorizaciones.js` para consumir el contexto modularizado.
- Envoltura de `<AppRoutes />` dentro de `<main>` en `src/App.jsx` para habilitar el sticky footer flexbox y mejorar la semántica HTML5.
- Remoción de imports huérfanos en `src/App.jsx` y `src/routes/routes.jsx`.
- Limpieza de la rama condicional muerta y del import superfluo de `Login` en `src/pages/Dashboard.jsx`.
- Reducción a 0 de los errores de ESLint en todo el repositorio.

### Fuera de alcance
- Rediseño de hojas de estilo CSS o responsive completo de la aplicación.
- Actualización mayor de dependencias externas en `package.json`.

## 4. Requisitos Funcionales y Técnicos
- **RT-01 - Fast Refresh en Contextos:** Todos los contextos de React deben crearse en archivos dedicados de definición sin mezclar componentes exportados.
- **RT-02 - Semántica y Sticky Footer:** La estructura raíz de `App.jsx` debe contener `<Header />`, `<Nav />`, `<main><AppRoutes /></main>` y `<Footer />`.
- **RT-03 - Calidad Estática:** El comando `npm run lint` debe completar con código de salida 0.
- **RT-04 - Limpieza de Dashboard:** El componente `Dashboard.jsx` solo debe renderizar el panel del operador autenticado provisto por el contexto de sesión.

## 5. Criterios de Aceptación
- **CA-01:** `npm run lint` finaliza con 0 errores y 0 advertencias en la totalidad del proyecto.
- **CA-02:** En rutas con poco contenido, el pie de página se adhiere correctamente al fondo del viewport.
- **CA-03:** `Dashboard.jsx` no importa ni renderiza `<Login />`, funcionando de manera fluida tras la autenticación.
- **CA-04:** `npm run build` genera el bundle sin fallas de transpilación.
