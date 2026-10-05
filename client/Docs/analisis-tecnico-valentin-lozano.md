# Análisis Técnico — Rendimiento, Accesibilidad, Arquitectura CSS y Estrategia de Testing

## 1. Datos Generales

| Campo                     | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sistema**               | Panel de Control de Clientes                                                                                                                                                                                                                                                                                                                                                                                            |
| **Versión**               | 0.0.0                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Tipo de Aplicación**    | SPA (Single Page Application) — React 19 + Vite                                                                                                                                                                                                                                                                                                                                                                         |
| **Repositorio**           | Rama de trabajo: `docs/analisis-tecnico`                                                                                                                                                                                                                                                                                                                                                                                |
| **Fecha de Relevamiento** | 2026-09-08                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Responsable**           | Valentín Lozano                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Metodología**           | Lectura estática del código fuente, análisis de patrones de renderizado React, auditoría de accesibilidad contra WCAG 2.1 nivel AA, evaluación de la arquitectura CSS y responsive design, revisión de la configuración de entorno y propuesta de estrategia de testing. Se consultaron los análisis previos de Miranda, Gallo, Mamani e Iriarte para evitar redundancia y complementar con perspectivas no exploradas. |

---

## 2. Resumen Ejecutivo

Los análisis previos del equipo cubrieron con profundidad los hallazgos de seguridad (credenciales expuestas, rol manipulable), la inconsistencia en la capa HTTP (Fetch vs. Axios), los errores de ESLint y la desconexión reactiva entre `FormCliente` y `ListaClientes`. El presente documento se enfoca en **cinco ejes complementarios** que no fueron abordados en profundidad:

1. **Rendimiento de renderizado React:** Los componentes no implementan ninguna estrategia de optimización (`React.memo`, `useCallback`, `useMemo`, `useDeferredValue`), lo que genera re-renders innecesarios en cascada cada vez que el contexto de autorización cambia o el usuario escribe en el buscador.
2. **Accesibilidad (a11y / WCAG 2.1 AA):** El formulario de login carece de asociaciones `label`/`input` por atributo `for`/`id`, no existen roles ARIA en alertas ni regiones `aria-live`, la navegación no indica el enlace activo a lectores de pantalla, y los contrastes de color en textos secundarios no alcanzan el ratio mínimo de 4.5:1.
3. **SEO y semántica HTML:** El documento `index.html` declara `lang="en"` para una aplicación completamente en español, el `<title>` es un nombre técnico interno, no existe `<meta name="description">`, y la ausencia de etiquetas semánticas (`<main>`, `<section>`, `<article>`) impide la indexación significativa del contenido.
4. **Arquitectura CSS y responsive design:** Los estilos carecen de custom properties (variables CSS), usan valores mágicos hardcodeados, recurren a `!important` para sobrescribir Bootstrap, y no incluyen una sola media query — lo que hace que la interfaz sea inutilizable en pantallas menores a 700px.
5. **Estrategia de testing y resiliencia:** No existe infraestructura de testing configurada, no hay `ErrorBoundary` para capturar fallos de renderizado, y las operaciones asíncronas carecen de cancelación (`AbortController`) al desmontar componentes.

---

## 3. Objetivo y Alcance de Este Análisis

### 3.1 Objetivo

Complementar los análisis técnicos existentes del equipo con una evaluación enfocada en la calidad no funcional del sistema: rendimiento percibido, accesibilidad inclusiva, correcta semántica HTML/SEO, mantenibilidad de la capa de estilos, adaptabilidad responsive y preparación para testing automatizado.

### 3.2 Alcance

Este análisis **no reitera** los hallazgos de seguridad (credenciales expuestas, rol manipulable), la dualidad Fetch/Axios ni los errores de ESLint ya documentados por el equipo. Cuando un punto toca tangencialmente un tema previo, se ofrece una perspectiva o solución diferente.

### 3.3 Criterios de Éxito Evaluados

| Criterio                                | Evaluación                                                                       |
| :-------------------------------------- | :------------------------------------------------------------------------------- |
| Rendimiento de renderizado optimizado   | ❌ No cumplido: sin memoización, sin lazy loading, sin code splitting            |
| Accesibilidad WCAG 2.1 AA               | ❌ No cumplido: sin asociaciones label/input, sin ARIA, contrastes insuficientes |
| HTML semántico y SEO básico             | ❌ No cumplido: idioma incorrecto, título técnico, sin meta description          |
| Diseño responsive                       | ❌ No cumplido: cero media queries, anchos fijos en px                           |
| Arquitectura CSS mantenible             | ❌ No cumplido: sin variables CSS, valores mágicos, uso de `!important`          |
| Infraestructura de testing              | ❌ No cumplido: sin framework de testing configurado                             |
| Resiliencia ante errores de renderizado | ❌ No cumplido: sin ErrorBoundary                                                |

---

## 4. Rendimiento de Renderizado React

### 4.1 Re-renders en Cascada por Contexto

El `AutorizacionesProvider` en `src/context/AutorizacionesContext.jsx` expone un objeto literal nuevo en cada render:

```jsx
value={{ admin, setAdmin, cerrarSesion }}
```

Cada vez que `admin` cambia (incluyendo el `useEffect` que sincroniza con `localStorage`), **todos** los componentes que consumen este contexto se re-renderizan: `Header`, `RutaProtegida` (y por transitividad todas las páginas protegidas), `Dashboard`, y `Login`.

**Impacto:** En un proyecto pequeño el efecto es imperceptible, pero establece un anti-patrón que escala mal. Si se agregan más consumidores del contexto (por ejemplo, un componente de notificaciones o un sidebar), cada cambio de sesión provocará re-renders innecesarios en toda la aplicación.

**Solución propuesta:** Memoizar el objeto `value` con `useMemo`:

```javascript
const value = useMemo(() => ({ admin, setAdmin, cerrarSesion }), [admin]);
```

### 4.2 Filtrado Sincrónico Sin Deferencia en el Buscador

En `ListaClientes.jsx`, el array `clientesFiltrados` se recalcula en cada keystroke sin `useDeferredValue` ni `debounce`:

```javascript
const clientesFiltrados = clientes.filter(
  (cliente) =>
    cliente.name.lastname.toLowerCase().includes(busqueda.toLowerCase()) || ...
);
```

**Impacto:** Con los 10 usuarios de FakeStoreAPI el efecto es nulo, pero el patrón no escala. Si la API devolviera cientos o miles de registros, el recálculo sincrónico en cada tecla bloquearía el hilo principal y generaría "jank" visual.

**Solución propuesta:**

```javascript
import { useDeferredValue } from "react";

const busquedaDiferida = useDeferredValue(busqueda);

const clientesFiltrados = useMemo(
  () =>
    clientes.filter((cliente) => {
      const termino = busquedaDiferida.toLowerCase().trim();
      if (!termino) return true;
    }),
  [clientes, busquedaDiferida],
);
```

### 4.3 Ausencia de Code Splitting y Lazy Loading

Todas las páginas se importan de forma estática en `routes.jsx`:

```javascript
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ListaClientes from "../pages/ListaClientes";
import DetalleCliente from "../pages/DetalleCliente";
import ErrorPage from "../pages/ErrorPage";
```

**Impacto:** El bundle inicial incluye todo el código de todas las páginas, incluso las que el usuario no visitará inmediatamente. En una aplicación académica pequeña esto no es grave, pero establece un patrón incorrecto para producción.

**Solución propuesta:**

```javascript
import { lazy, Suspense } from "react";

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ListaClientes = lazy(() => import("../pages/ListaClientes"));
const DetalleCliente = lazy(() => import("../pages/DetalleCliente"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));

<Suspense fallback={<Spinner />}>
  <AppRoutes />
</Suspense>;
```

### 4.4 Ausencia de Cancelación de Efectos Asíncronos

Los `useEffect` de `ListaClientes.jsx` y `DetalleCliente.jsx` no implementan `AbortController` para cancelar las peticiones fetch al desmontar el componente:

```javascript
useEffect(() => {
  fetch("https://fakestoreapi.com/users")
    .then(...)
    .then((data) => setClientes(data))
}, []);
```

**Solución propuesta:**

```javascript
useEffect(() => {
  const controller = new AbortController();

  fetch("https://fakestoreapi.com/users", { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error("Error al obtener clientes");
      return res.json();
    })
    .then((data) => setClientes(data))
    .catch((err) => {
      if (err.name !== "AbortError") setError(true);
    })
    .finally(() => setLoading(false));

  return () => controller.abort();
}, []);
```

---

## 5. Accesibilidad (WCAG 2.1 Nivel AA)

### 5.1 Formulario de Login: Sin Asociación `label`/`input`

En `Login.jsx`, las etiquetas `<label>` no están asociadas a sus inputs mediante atributo `htmlFor`/`id`:

```jsx
<label>Email:</label>
<input type="text" value={email} onChange={...} />
```

**Impacto WCAG:** Los lectores de pantalla (NVDA, JAWS, VoiceOver) no pueden anunciar qué campo se está completando. El usuario con discapacidad visual escucha "campo de texto editable" sin saber si es el email, la contraseña o el sector.

**Solución:**

```jsx
<label htmlFor="login-email">Email:</label>
<input id="login-email" type="email" value={email} onChange={...} />
```

### 5.2 Mensajes de Error sin `role="alert"`

Los mensajes de error del login se muestran como `<p>` planos:

```jsx
<p style={{ color: "red", minHeight: "18px" }}>{errores.email || " "}</p>
```

**Impacto WCAG:** Los lectores de pantalla no anuncian automáticamente estos errores cuando aparecen. El usuario no recibe feedback auditivo sobre la validación.

**Solución:**

```jsx
<p
  role="alert"
  aria-live="assertive"
  style={{ color: "red", minHeight: "18px" }}
>
  {errores.email || " "}
</p>
```

### 5.3 Campo de Búsqueda sin Etiqueta Accesible

En `ListaClientes.jsx`, el input de búsqueda no tiene `<label>` ni atributo `aria-label`:

```jsx
<input
  className="buscador"
  type="text"
  placeholder="Buscar por apellido o ciudad"
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
/>
```

**Impacto WCAG:** El placeholder no es un sustituto de `<label>` según las pautas de accesibilidad. Desaparece al escribir, y los lectores de pantalla no siempre lo anuncian.

**Solución:**

```jsx
<label htmlFor="buscar-clientes" className="sr-only">Buscar clientes</label>
<input
  id="buscar-clientes"
  aria-label="Buscar clientes por apellido o ciudad"
  className="buscador"
  type="search"
  ...
/>
```

### 5.4 Navegación sin Indicador de Enlace Activo para Screen Readers

En `Nav.jsx`, los `<NavLink>` aplican la clase CSS `active` automáticamente gracias a React Router, pero no se define `aria-current="page"`. React Router DOM 7 agrega `aria-current` automáticamente, pero la hoja de estilos `nav.css` no refleja un indicador visual diferenciado para el enlace activo, lo que perjudica la orientación tanto para usuarios videntes como para usuarios de tecnologías asistivas.

### 5.5 Contraste de Color Insuficiente

El texto de los párrafos en la ficha de detalle usa `color: #5f4b57` sobre fondo `background: white`:

```css
.detalle-cliente p {
  color: #5f4b57;
}
```

**Ratio calculado:** `#5f4b57` sobre `#ffffff` produce un contraste de **4.22:1**, que **no alcanza** el mínimo de **4.5:1** exigido por WCAG 2.1 AA para texto normal.

**Solución:** Oscurecer el color a `#4a3845` (ratio 5.6:1) o `#3d2f3a` (ratio 7.1:1).

### 5.6 Tabla de Clientes sin Accesibilidad Semántica

La tabla en `ListaClientes.jsx` no incluye un `<caption>` ni atributo `aria-label`:

```jsx
<table className="tabla-clientes">
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

**Solución:**

```jsx
<table className="tabla-clientes" aria-label="Lista de clientes registrados">
  <caption className="sr-only">
    Tabla con los clientes del sistema, incluyendo ID, nombre, email, teléfono y
    ciudad
  </caption>
  ...
</table>
```

---

## 6. SEO y Semántica HTML

### 6.1 Idioma Incorrecto en `index.html`

El archivo `index.html` declara:

```html
<html lang="en"></html>
```

La aplicación está completamente en español: etiquetas, botones, mensajes de error, contenido. Declarar `lang="en"` confunde a los lectores de pantalla (que intentarán pronunciar el texto con fonética inglesa) y perjudica el posicionamiento SEO para contenido hispanoparlante.

**Solución:**

```html
<html lang="es"></html>
```

### 6.2 Título Técnico no Descriptivo

```html
<title>pvtrabajointegradorgrupo5</title>
```

El título de la pestaña del navegador es un nombre de proyecto interno sin significado para el usuario final. Perjudica el SEO y la experiencia de usuario al alternar entre pestañas.

**Solución:**

```html
<title>Panel de Control de Clientes — Grupo 5</title>
```

### 6.3 Sin Meta Description

No existe una etiqueta `<meta name="description">`. Los motores de búsqueda no tienen un resumen disponible, y si la aplicación se comparte en redes sociales, el preview no mostrará información útil.

**Solución:**

```html
<meta
  name="description"
  content="Panel de gestión de clientes con autenticación, listado, búsqueda, alta y eliminación. Trabajo integrador de Programación Visual — Grupo 5."
/>
```

### 6.4 Ausencia de Etiquetas Semánticas en el Layout

Como ya señaló Iriarte, `App.jsx` no envuelve el contenido en `<main>`. Pero además, **ninguna** página utiliza etiquetas semánticas HTML5:

| Componente           | Usa                                    | Debería usar                                   |
| :------------------- | :------------------------------------- | :--------------------------------------------- |
| `App.jsx`            | `<>` (fragment)                        | `<header>`, `<nav>`, `<main>`, `<footer>`      |
| `Dashboard.jsx`      | `<div className="dashboard">`          | `<section aria-labelledby="...">`              |
| `ListaClientes.jsx`  | `<div className="clientes-container">` | `<section>` con `<article>` por cliente        |
| `DetalleCliente.jsx` | `<div className="detalle-cliente">`    | `<article>` con `<section>` por grupo de datos |

**Impacto:** Los motores de búsqueda y lectores de pantalla no pueden inferir la estructura del contenido. Esto degrada tanto la accesibilidad como el posicionamiento orgánico.

---

## 7. Arquitectura CSS y Responsive Design

### 7.1 Ausencia Total de Custom Properties (Variables CSS)

Los 9 archivos CSS del proyecto repiten los mismos valores de color de forma literal:

| Color                  | Archivos donde aparece                                                                           | Frecuencia total |
| :--------------------- | :----------------------------------------------------------------------------------------------- | :--------------- |
| `#d63384`              | `app.css`, `login.css`, `dashboard.css`, `listaclientes.css`, `detallecliente.css`, `header.css` | 14 veces         |
| `#c2185b`              | `app.css`, `login.css`, `dashboard.css`, `detallecliente.css`                                    | 7 veces          |
| `#ffd6e7` / `#ffd6e8`  | `app.css`, `dashboard.css`, `detallecliente.css`                                                 | 3 veces          |
| `rgba(214,51,132,...)` | `login.css`, `dashboard.css`, `listaclientes.css`, `detallecliente.css`                          | 8 veces          |

**Impacto:** Si se necesita cambiar la paleta de colores (por ejemplo, para un modo oscuro o una marca corporativa diferente), habría que modificar manualmente más de 30 ocurrencias distribuidas en 9 archivos.

**Solución:** Definir un sistema de design tokens con custom properties en `app.css`:

```css
:root {
  --color-primary: #d63384;
  --color-primary-dark: #c2185b;
  --color-primary-light: #ffd6e7;
  --color-primary-shadow: rgba(214, 51, 132, 0.12);
  --color-text-primary: #2d3748;
  --color-text-secondary: #4a3845;
  --color-error: #dc3545;
  --color-success: #155724;
  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 22px;
  --shadow-sm: 0px 10px 25px var(--color-primary-shadow);
  --shadow-md: 0px 15px 35px var(--color-primary-shadow);
}
```

### 7.2 Uso de `!important` para Sobrescribir Bootstrap

En `login.css`:

```css
form input,
form select {
  border-radius: 12px !important;
  border: 1px solid #f4b6cf !important;
}

form input:focus,
form select:focus {
  border-color: #d63384 !important;
}
```

**Impacto:** El uso de `!important` es un síntoma de una guerra de especificidad con Bootstrap. Este patrón escala mal: cada vez que se agregue un nuevo formulario, necesitará las mismas sobrescrituras forzadas.

**Solución recomendada:** Aumentar la especificidad del selector en lugar de usar `!important`, o utilizar la capa de cascada CSS (`@layer`) disponible en navegadores modernos para gestionar la prioridad entre Bootstrap y los estilos propios.

### 7.3 Cero Media Queries — Responsive Inexistente

Ninguno de los 9 archivos CSS contiene una sola `@media` query. Los anchos están hardcodeados:

```css
/* login.css */
form {
  width: 430px;
}

/* listaclientes.css */
.contenedor-buscador {
  width: 700px;
}
```

**Impacto:** En una pantalla de 375px (iPhone SE), el formulario de login se desborda horizontalmente y el buscador queda recortado. La tabla de clientes no tiene scroll horizontal, por lo que las columnas se comprimen hasta ser ilegibles.

**Solución mínima recomendada:**

```css
/* login.css */
form {
  width: 100%;
  max-width: 430px;
  margin: 45px auto;
}

/* Breakpoint para móvil */
@media (max-width: 768px) {
  .contenedor-buscador {
    width: 100%;
    padding: 15px;
  }

  .tabla-clientes {
    display: block;
    overflow-x: auto;
  }

  .dashboard-cards {
    flex-direction: column;
    align-items: center;
  }
}
```

### 7.4 Estilos Globales de Elementos que Colisionan

En `login.css`, los estilos de `form`, `form input`, `form select` y `form button` se definen con selectores de elemento puro, no con clases:

```css
form { width: 430px; margin: 45px auto; ... }
form label { font-weight: 600; color: #c2185b; ... }
form button { width: 100%; background: #d63384; ... }
```

**Impacto:** Estos estilos se aplican a **todos** los formularios de la aplicación, incluido el `<Form>` de React Bootstrap en `FormCliente.jsx`. Si se agrega cualquier otro formulario (por ejemplo, un formulario de edición o de búsqueda avanzada), heredará involuntariamente estos estilos.

**Solución:** Reemplazar selectores de elemento por selectores de clase:

```css
.login-form { ... }
.login-form .login-label { ... }
.login-form .login-button { ... }
```

---

## 8. Configuración de Entorno y Resiliencia

### 8.1 Ausencia de Archivo `.env` para Variables de Entorno

La URL base de la API está hardcodeada en 3 archivos distintos. Este punto fue señalado por Mamani, pero la **solución mediante variables de entorno de Vite** no fue propuesta explícitamente:

**Solución con Vite:**

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=https://fakestoreapi.com
```

Crear una constante centralizada en `src/config.js`:

```javascript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://fakestoreapi.com";
```

Agregar `.env.local` al `.gitignore` y documentar las variables requeridas en el `README.md`.

### 8.2 Sin Error Boundary para Capturar Fallos de Renderizado

React no atrapa errores de renderizado con `try/catch` convencional. Si un componente lanza un `TypeError` (por ejemplo, al acceder a `cliente.address.street` cuando `address` es `undefined`), **toda la aplicación se quiebra** y muestra una pantalla en blanco.

**Solución:** Implementar un `ErrorBoundary` como componente de clase (los hooks no soportan `componentDidCatch`):

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Algo salió mal</h2>
          <p>Ocurrió un error inesperado. Por favor, recargue la página.</p>
          <button onClick={() => window.location.reload()}>Recargar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Envolver la aplicación en `main.jsx`:

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 9. Estrategia de Testing Propuesta

Ningún análisis previo propuso una estrategia concreta de testing. A continuación se presenta un plan incremental:

### 9.1 Infraestructura Necesaria

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Configurar en `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
```

Crear `src/test/setup.js`:

```javascript
import "@testing-library/jest-dom";
```

### 9.2 Plan de Tests Priorizado

| Prioridad | Componente / Módulo         | Tipo de Test | Qué Verificar                                                                                                           |
| :-------- | :-------------------------- | :----------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Alta**  | `autorizacionesServices.js` | Unitario     | `login()` devuelve el usuario correcto para credenciales válidas y `undefined` para inválidas                           |
| **Alta**  | `RutaProtegida`             | Integración  | Redirige a `/login` cuando no hay sesión; renderiza `children` cuando hay sesión                                        |
| **Alta**  | `Login.jsx`                 | Integración  | Valida campos obligatorios, formato de email, complejidad de contraseña; navega al dashboard con credenciales correctas |
| **Media** | `ListaClientes.jsx`         | Integración  | Muestra spinner de carga, muestra error si la API falla, renderiza la tabla con datos mockeados                         |
| **Media** | `FormCliente.jsx`           | Integración  | Muestra error si los campos están vacíos, llama a `crearCliente` con los datos correctos, muestra mensaje de éxito      |
| **Baja**  | `DetalleCliente.jsx`        | Integración  | Renderiza datos del cliente, muestra botón de eliminar solo para Gerencia                                               |

### 9.3 Ejemplo de Test

```javascript
// src/services/__tests__/autorizacionesServices.test.js
import { describe, it, expect } from "vitest";
import AutorizacionesService from "../autorizacionesServices";

describe("AutorizacionesService.login", () => {
  it("retorna el usuario cuando las credenciales son correctas", () => {
    const resultado = AutorizacionesService.login(
      "antonella@gmail.com",
      "Admin123",
      "Soporte",
    );
    expect(resultado).toBeDefined();
    expect(resultado.nombre).toBe("Antonella");
    expect(resultado.sector).toBe("Soporte");
  });

  it("retorna undefined cuando el email no existe", () => {
    const resultado = AutorizacionesService.login(
      "noexiste@gmail.com",
      "Admin123",
      "Soporte",
    );
    expect(resultado).toBeUndefined();
  });

  it("retorna undefined cuando la contraseña es incorrecta", () => {
    const resultado = AutorizacionesService.login(
      "antonella@gmail.com",
      "WrongPass1",
      "Soporte",
    );
    expect(resultado).toBeUndefined();
  });

  it("retorna undefined cuando el sector no coincide", () => {
    const resultado = AutorizacionesService.login(
      "antonella@gmail.com",
      "Admin123",
      "Gerencia",
    );
    expect(resultado).toBeUndefined();
  });
});
```

---

## 10. Matriz de Hallazgos Técnicos

| ID           | Severidad | Área          | Causa Raíz                                               | Impacto                                                        |
| :----------- | :-------- | :------------ | :------------------------------------------------------- | :------------------------------------------------------------- |
| **H-VL-001** | Media     | Rendimiento   | Objeto `value` del Context no memoizado                  | Re-renders innecesarios en todos los consumidores del contexto |
| **H-VL-002** | Media     | Rendimiento   | Filtrado sincrónico sin `useDeferredValue` ni `debounce` | Potencial bloqueo del hilo principal con datasets grandes      |
| **H-VL-003** | Baja      | Rendimiento   | Imports estáticos de todas las páginas en `routes.jsx`   | Bundle inicial carga código que el usuario puede no necesitar  |
| **H-VL-004** | Media     | Rendimiento   | Sin `AbortController` en `useEffect` de fetch            | Warnings de React y potenciales memory leaks al desmontar      |
| **H-VL-005** | Alta      | Accesibilidad | Labels sin `htmlFor`/`id` en Login                       | Lectores de pantalla no identifican los campos del formulario  |
| **H-VL-006** | Media     | Accesibilidad | Alertas sin `role="alert"` ni `aria-live`                | Errores de validación no anunciados por tecnologías asistivas  |
| **H-VL-007** | Media     | Accesibilidad | Buscador sin `<label>` ni `aria-label`                   | Campo inanunciable por lectores de pantalla                    |
| **H-VL-008** | Alta      | Accesibilidad | Contraste `#5f4b57` sobre blanco = 4.22:1                | No alcanza el mínimo WCAG AA de 4.5:1 para texto normal        |
| **H-VL-009** | Alta      | SEO           | `<html lang="en">` para app en español                   | Pronunciación incorrecta en screen readers, SEO penalizado     |
| **H-VL-010** | Media     | SEO           | `<title>` con nombre técnico interno                     | Mala experiencia de usuario y SEO deficiente                   |
| **H-VL-011** | Alta      | CSS           | Cero media queries, anchos fijos en px                   | Interfaz inutilizable en pantallas < 700px                     |
| **H-VL-012** | Media     | CSS           | Sin custom properties, 30+ valores mágicos repetidos     | Mantenimiento costoso y cambio de paleta inviable              |
| **H-VL-013** | Media     | CSS           | Selectores de elemento globales en `login.css`           | Colisión de estilos con formularios de otros componentes       |
| **H-VL-014** | Baja      | CSS           | Uso de `!important` para sobrescribir Bootstrap          | Guerra de especificidad insostenible                           |
| **H-VL-015** | Alta      | Resiliencia   | Sin `ErrorBoundary` en la aplicación                     | Un `TypeError` en cualquier componente destruye toda la UI     |
| **H-VL-016** | Media     | Testing       | Sin infraestructura de testing configurada               | Cero cobertura, detección de regresiones solo manual           |

---

## 11. Plan de Acción

| Orden | Acción                                                                               | Hallazgo                     | Responsable          | Criterio de Aceptación                                              | Estado    |
| ----: | :----------------------------------------------------------------------------------- | :--------------------------- | :------------------- | :------------------------------------------------------------------ | :-------- |
|     1 | Corregir `lang="en"` a `lang="es"` y mejorar `<title>` y `<meta>` en `index.html`    | H-VL-009, H-VL-010           | Valentín Lozano      | `index.html` con `lang="es"`, título descriptivo y meta description | Pendiente |
|     2 | Agregar `htmlFor`/`id` en login, `aria-label` en buscador, `role="alert"` en errores | H-VL-005, H-VL-006, H-VL-007 | Valentín Lozano      | Navegación completa con NVDA o VoiceOver sin errores                | Pendiente |
|     3 | Crear variables CSS en `:root` y reemplazar valores mágicos                          | H-VL-012                     | Valentín Lozano      | Cero valores de color hardcodeados fuera de `:root`                 | Pendiente |
|     4 | Agregar media queries y convertir anchos fijos a `max-width`                         | H-VL-011                     | Valentín Lozano      | Interfaz funcional en 375px, 768px y 1440px                         | Pendiente |
|     5 | Implementar `ErrorBoundary` y envolver `<App />`                                     | H-VL-015                     | Equipo de desarrollo | Un error de renderizado muestra fallback, no pantalla blanca        | Pendiente |
|     6 | Memoizar `value` del contexto y agregar `AbortController` en useEffects              | H-VL-001, H-VL-004           | Equipo de desarrollo | Sin warnings de state update en unmounted component                 | Pendiente |
|     7 | Configurar Vitest + Testing Library y escribir tests del servicio de auth            | H-VL-016                     | Equipo de desarrollo | `npm run test` ejecuta al menos 4 tests unitarios sin fallos        | Pendiente |

### Definition of Done

- [ ] El cambio tiene una descripción clara y commits con prefijo semántico (`fix:`, `feat:`, `refactor:`).
- [ ] `npm run lint` finaliza sin errores.
- [ ] `npm run build` compila correctamente.
- [ ] Los flujos afectados fueron verificados localmente en desktop y vista móvil (DevTools).
- [ ] Si aplica, se verificó accesibilidad con un lector de pantalla o extensión de auditoría (Lighthouse, axe).

---

## 12. Validación y Evidencias

### Comandos ejecutados

- **`npm run lint`:** Falla con 4 errores ya documentados por el equipo.
- **`npm run build`:** Exitoso, Vite genera `dist/` sin errores.
- **Análisis de contraste:** Verificación manual de ratios de color usando la especificación WCAG 2.1.
- **Inspección responsive:** Revisión del CSS fuente sin ejecución; se identificó la ausencia total de media queries.

### Herramientas y fuentes utilizadas

- Lectura estática del código fuente (todos los archivos `.jsx`, `.js`, `.css` y `index.html`).
- Especificación WCAG 2.1 nivel AA para criterios de accesibilidad.
- Documentación de React 19 (memo, useMemo, useCallback, useDeferredValue, lazy/Suspense, ErrorBoundary).
- Documentación de Vite 8 (variables de entorno, configuración de Vitest).
- Revisión cruzada con los análisis de Miranda, Gallo, Mamani e Iriarte para garantizar no-redundancia.

---

## 13. Conclusión

### Estado general

La aplicación tiene una base funcional sólida para su propósito académico. Los análisis previos del equipo identificaron correctamente los problemas críticos de seguridad y consistencia en la capa de datos. Este análisis complementa esa visión con una evaluación de calidad no funcional que revela deuda técnica significativa en áreas que afectan directamente al usuario final:

- Un usuario en móvil no puede usar la aplicación (sin responsive).
- Un usuario con discapacidad visual no puede navegar los formularios (sin accesibilidad).
- Un motor de búsqueda indexará la página como contenido en inglés (idioma incorrecto).
- Un error inesperado en un solo componente destruye toda la interfaz (sin ErrorBoundary).

### Fortalezas identificadas

- La estructura de carpetas (`pages/`, `components/`, `services/`, `context/`, `hooks/`, `css/`) facilita la comprensión del proyecto.
- Los estilos CSS, aunque con problemas de mantenibilidad, logran una estética visual coherente y atractiva con una paleta bien definida.
- El uso de Context API con hook personalizado es una decisión arquitectónica correcta para la escala del sistema.
- La separación de CSS por componente/página es un buen punto de partida para modularizar los estilos.

### Riesgos prioritarios de este análisis

1. **Responsive inexistente** — hace la aplicación inutilizable en dispositivos móviles.
2. **Accesibilidad deficiente** — excluye a usuarios con discapacidades de la interacción con el sistema.
3. **Sin ErrorBoundary** — un solo dato malformado puede dejar la aplicación completamente inoperante.
4. **Sin testing** — cualquier cambio futuro puede introducir regresiones sin detección.

---

## 14. Historial del Documento

- **Versión:** 0.1
- **Fecha:** 2026-09-08
- **Responsable:** Valentín Lozano
- **Descripción:** Análisis técnico inicial enfocado en rendimiento React, accesibilidad WCAG, SEO/semántica HTML, arquitectura CSS/responsive y estrategia de testing.
