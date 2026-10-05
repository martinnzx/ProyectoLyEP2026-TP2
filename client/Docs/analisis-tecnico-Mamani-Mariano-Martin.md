# Análisis Técnico Profesional — Sistema Web de Gestión de Clientes

## 1. Datos Generales

- **Nombre del sistema:** Panel de Control de Clientes
- **Versión del proyecto:** 0.0.0
- **Tipo de aplicación:** SPA (Single Page Application) — frontend puro
- **Repositorio:** Fork del equipo — rama `docs/analisis-tecnico`
- **Fecha del relevamiento:** 2026-09-07
- **Responsable:** Mamani Mariano Martin
- **Metodología:** Lectura estática del código fuente archivo por archivo, revisión de dependencias en `package.json`, ejecución de herramientas de lint y build, y revisión cruzada con los análisis previos de los compañeros de equipo.

---

## 2. Resumen Ejecutivo

El sistema es un prototipo de SPA desarrollado en React + Vite que permite a usuarios internos autenticados consultar, crear y eliminar registros de clientes a través del consumo de la API pública FakeStoreAPI. La base funcional es sólida para un contexto académico: navegación SPA con rutas protegidas, login con validación por campo, listado con búsqueda en tiempo real, ficha de detalle y formulario de alta operan de manera integrada y con estados de carga visibles. Sin embargo, el modelo de seguridad presenta riesgos estructurales: credenciales, roles y permisos residen completamente en el cliente y son manipulables desde la consola del navegador. La mezcla de dos tecnologías HTTP sin una capa de acceso unificada, la ausencia de validaciones de negocio en el formulario de alta, la exposición de contraseñas de clientes en la ficha y cuatro errores de ESLint sin resolver configuran la deuda técnica más urgente. El proyecto tiene potencial real de evolucionar si estos problemas se abordan de forma ordenada y con criterio de impacto.

---

## 3. Objetivo y Alcance

### 3.1 Objetivo de la aplicación

El sistema centraliza operaciones CRUD sobre registros de clientes para usuarios internos organizados en dos sectores con niveles de acceso diferenciados. El sector Soporte puede consultar el listado, ver fichas y dar de alta nuevos clientes. El sector Gerencia hereda esas capacidades y además puede eliminar registros desde la ficha de detalle. El propósito declarado es servir como panel de gestión interna en un contexto empresarial simulado.

### 3.2 Alcance funcional

**Funcionalidades implementadas:**

- Autenticación con email, contraseña y sector; persistencia de sesión en `localStorage`.
- Dashboard con información del usuario conectado y contadores de referencia.
- Listado de clientes consumido desde FakeStoreAPI con filtrado local por apellido o ciudad.
- Ficha de detalle de cliente con datos personales, dirección y credenciales.
- Alta de clientes mediante `POST` a FakeStoreAPI usando Axios.
- Eliminación de clientes desde la ficha, condicionada al sector Gerencia.
- Cierre de sesión con limpieza del estado local y redirección al login.
- Página de error 404 para rutas no contempladas.

**Funcionalidades ausentes o incompletas:**

- No existe backend propio ni base de datos: las operaciones de escritura sobre FakeStoreAPI no generan persistencia real entre sesiones.
- No hay módulo de edición de clientes existentes.
- No hay paginación, ordenamiento ni filtros combinados avanzados en el listado.
- No existe recuperación de contraseña ni administración de los usuarios internos del sistema.
- No hay pruebas automatizadas de ningún tipo.
- No hay documentación de API ni registro de errores centralizado (logging).

### 3.3 Criterios de éxito evaluados

**Cada operación informa su resultado — Parcial**
El alta y la baja muestran mensajes de éxito o error. Sin embargo, la ficha de detalle no diferencia un error HTTP de un cliente inexistente: el componente permanece en estado de carga indefinido si la respuesta falla.

**Rutas protegidas — Cumplido**
`RutaProtegida` redirige correctamente a `/login` cuando no existe sesión activa en el contexto.

**Validación de entradas en formularios — Parcial**
El login valida campos obligatorios, formato de email y complejidad básica de contraseña con mensajes por campo. El formulario de alta solo verifica que los campos no estén vacíos, sin ninguna regla de formato o negocio adicional.

**Manejo de errores de red — Parcial**
El listado verifica `response.ok` y captura errores de red mostrando un mensaje. El detalle no realiza ninguna de estas verificaciones y no cuenta con un estado de error visible.

**Persistencia de datos — Limitada**
Solo la sesión del operador persiste en `localStorage`. Los datos de clientes dependen enteramente de la disponibilidad y comportamiento de FakeStoreAPI.

**Compilación de producción — Cumplido**
`npm run build` finaliza correctamente y Vite genera el bundle en `dist/` sin advertencias críticas.

**Calidad estática del código — No cumplido**
`npm run lint` falla con 4 errores de ESLint activos al momento del relevamiento.

---

## 4. Inventario Técnico

### 4.1 Stack tecnológico y dependencias

**Dependencias de producción:**

- **React 19.2.6 / React DOM 19.2.6** — framework de UI, componentes funcionales y hooks.
- **React Router DOM 7.18.0** — navegación SPA y rutas declarativas.
- **Bootstrap 5.3.8** — estilos base y sistema de grilla.
- **React Bootstrap 2.10.10** — componentes React sobre Bootstrap: `Form`, `Alert`, `Spinner`, `Navbar`, `Button`.
- **Axios 1.18.0** — cliente HTTP utilizado exclusivamente para el alta de clientes.

**Dependencias de desarrollo:**

- **Vite 8.0.12** — servidor de desarrollo y empaquetador de producción.
- **ESLint 10.3.0** — análisis estático de código.
- **eslint-plugin-react-hooks 7.1.1** — reglas de Hooks de React.
- **eslint-plugin-react-refresh 0.5.2** — reglas de Fast Refresh de Vite.

**Observación:** El proyecto convive con dos clientes HTTP: Axios para la operación de alta y la Fetch API nativa para listado, detalle y eliminación. Esta dualidad no está justificada técnicamente y genera inconsistencia en el manejo de errores y en la configuración de las peticiones.

### 4.2 Estructura del proyecto

```
src/
├── main.jsx                       # Punto de entrada: monta BrowserRouter, AutorizacionesProvider y App
├── App.jsx                        # Layout global: Header, Nav, AppRoutes, Footer
├── components/
│   ├── Header.jsx                 # Barra superior: marca, usuario conectado, botón de cierre de sesión
│   ├── Nav.jsx                    # Navegación con NavLinks a Dashboard y Clientes
│   ├── Footer.jsx                 # Pie de página estático con nombre del grupo
│   ├── FormCliente.jsx            # Formulario de alta de cliente (Axios POST)
│   └── RutaProtegida.jsx          # Guardia de ruta: redirige a /login si no hay sesión
├── pages/
│   ├── Login.jsx                  # Formulario de autenticación con validación por campo
│   ├── Dashboard.jsx              # Panel de bienvenida con datos del usuario y contadores
│   ├── ListaClientes.jsx          # Tabla de clientes con buscador (Fetch GET)
│   ├── DetalleCliente.jsx         # Ficha completa del cliente, botón de baja para Gerencia
│   └── ErrorPage.jsx              # Página de error 404 mínima
├── context/
│   └── AutorizacionesContext.jsx  # Context + Provider de sesión (estado admin ↔ localStorage)
├── hooks/
│   └── useAutorizaciones.js       # Hook de acceso al contexto de autorización
├── services/
│   ├── autorizacionesServices.js  # Array de 6 usuarios fijos y función login()
│   └── clientesService.js         # Función crearCliente() con Axios
└── css/
    ├── app.css, header.css, nav.css, footer.css
    ├── login.css, dashboard.css
    └── listaclientes.css, detallecliente.css, formcliente.css
```

### 4.3 Integraciones externas

- **FakeStoreAPI** (`https://fakestoreapi.com/users`): se consumen los endpoints `GET /users`, `GET /users/:id`, `POST /users` y `DELETE /users/:id`. Esta API simula las operaciones; los datos no persisten entre sesiones reales.
- **localStorage del navegador**: almacena la sesión bajo la clave `admin` (objeto JSON con nombre, email y sector) y el rol bajo la clave separada `role`.
- No se detectó ningún proveedor externo de autenticación, CDN de assets ni servicio de analytics.

---

## 5. Arquitectura y Flujo de Datos

### 5.1 Descripción de la arquitectura

La aplicación implementa una arquitectura de componentes funcionales React con separación por responsabilidad en carpetas. El flujo de datos sigue el patrón de estado local con Context API para el estado global de sesión:

```
main.jsx
  └─ BrowserRouter
       └─ AutorizacionesProvider  ← estado global de sesión (admin)
            └─ App.jsx
                 ├─ Header.jsx        (consume contexto: admin, cerrarSesion)
                 ├─ Nav.jsx           (navegación estática, siempre visible)
                 ├─ AppRoutes
                 │    ├─ /login       → Login.jsx         (setAdmin al autenticar)
                 │    ├─ /            → RutaProtegida → Dashboard.jsx
                 │    ├─ /clientes    → RutaProtegida → ListaClientes.jsx + FormCliente.jsx
                 │    └─ /clientes/:id → RutaProtegida → DetalleCliente.jsx
                 └─ Footer.jsx
```

**Dualidad en la fuente de verdad del rol:** El contexto `AutorizacionesContext` gestiona el estado `admin` como fuente principal para `RutaProtegida` y `Header`. Sin embargo, `DetalleCliente` lee el sector directamente desde `localStorage.getItem("role")`, sin pasar por el contexto. Este doble canal introduce una inconsistencia: el permiso de eliminación queda desacoplado del estado de sesión real y puede ser alterado desde las DevTools del navegador.

### 5.2 Flujo por funcionalidad

**Login**
El usuario completa email, contraseña y sector en `Login.jsx`. El componente valida los datos localmente y llama a `autorizacionesServices.login()`, que busca coincidencia en el array de usuarios fijos. Si es exitoso, guarda el objeto de sesión en el contexto (y por efecto en `localStorage`) y navega al dashboard. Si falla, muestra una alerta nativa del navegador.

**Listado de clientes**
`ListaClientes.jsx` realiza un `fetch GET /users` al montar. Gestiona los estados `loading`, `error` y `clientes`. El filtrado por apellido o ciudad es local y reactivo sobre el array en memoria. No hay estado vacío explícito cuando la búsqueda no arroja resultados.

**Alta de cliente**
`FormCliente.jsx` valida que ningún campo esté vacío y llama a `clientesService.crearCliente()` usando Axios. Durante la operación muestra un spinner y deshabilita el botón. Al finalizar, muestra un mensaje de éxito o error y limpia los campos.

**Ficha de detalle**
`DetalleCliente.jsx` realiza un `fetch GET /users/:id` al montar. No verifica `response.ok` ni captura errores de red: si la respuesta falla, el componente permanece en el estado de carga indefinidamente. El sector Gerencia tiene disponible un botón de eliminación que ejecuta un `fetch DELETE /users/:id`.

**Cierre de sesión**
El botón en `Header.jsx` llama a `cerrarSesion()` del contexto, que pone `admin` en `null` y elimina la clave de `localStorage`. Luego navega a `/login`.

---

## 6. Evaluación del Código

### 6.1 Corrección y comportamiento

✅ Las rutas protegidas redirigen a `/login` cuando no existe sesión activa.

✅ El login valida campos obligatorios, formato de email y complejidad básica de contraseña, con mensajes de error por campo.

✅ El listado verifica `response.ok` y captura errores de red con un mensaje de error visible.

✅ El formulario de alta muestra spinner durante la operación, deshabilita el botón de envío y limpia los campos al completarse con éxito.

❌ `DetalleCliente.jsx` no verifica `response.ok` en el `GET`: si la API responde con un código de error, `.json()` puede fallar silenciosamente y el componente queda en "Cargando cliente..." de forma indefinida.

❌ La autorización de eliminación depende de `localStorage.role`, que cualquier usuario puede modificar desde la consola del navegador, sin que el contexto de sesión lo detecte.

❌ `Dashboard.jsx` muestra contadores fijos (`10`, `3`, `3`) que no se derivan de ninguna fuente de datos real y pueden contradecir el estado actual del sistema.

❌ `ErrorPage.jsx` es completamente mínima: solo un `<h1>` sin estilos, sin navegación de retorno y sin ningún mensaje orientativo para el usuario.

### 6.2 Mantenibilidad

✅ La separación en carpetas `pages/`, `components/`, `services/`, `context/`, `hooks/` es coherente con las convenciones de React.

✅ Los componentes tienen responsabilidades mayormente diferenciadas y un tamaño razonable para su función.

❌ `App.jsx` importa `useAutorizaciones` en la línea 6 pero no lo utiliza en ningún punto del componente. Este import genera un error de ESLint.

❌ `routes.jsx` importa `Navigate` desde React Router DOM pero no lo utiliza directamente en el archivo (el componente `RutaProtegida` lo hace internamente). Genera error de ESLint.

❌ `AutorizacionesContext.jsx` exporta tanto el contexto (`AutorizacionesContext`) como el provider (`AutorizacionesProvider`) desde el mismo archivo, lo que activa la regla `react-refresh/only-export-components` de ESLint y puede producir comportamientos inesperados durante el hot reload en desarrollo.

❌ `DetalleCliente.jsx` declara el parámetro `error` en el bloque `catch` pero no lo utiliza. Genera error de ESLint por `no-unused-vars`.

❌ La URL base `https://fakestoreapi.com/users` está hardcodeada en tres archivos distintos (`clientesService.js`, `ListaClientes.jsx`, `DetalleCliente.jsx`). No existe archivo `.env` ni constante centralizada, lo que dificulta cualquier cambio de entorno.

❌ El estilo de formateo no es uniforme entre archivos: se mezclan indentaciones de 2 y 4 espacios, y el uso del punto y coma final es inconsistente.

### 6.3 Calidad y seguridad

❌ **Crítico:** Las credenciales de los seis usuarios del sistema (emails y contraseñas en texto plano) están almacenadas en `autorizacionesServices.js`. Este archivo forma parte del bundle JavaScript que el navegador descarga públicamente; cualquier persona puede leer esas credenciales en las DevTools sin ningún conocimiento especial.

❌ **Crítico:** El permiso de eliminación se evalúa leyendo `localStorage.getItem("role")`. Cualquier usuario puede ejecutar `localStorage.setItem("role", "Gerencia")` en la consola y obtener acceso al botón de eliminación, independientemente del sector con el que inició sesión.

❌ **Alto:** La ficha de detalle muestra la contraseña del cliente de FakeStoreAPI en texto plano en pantalla, bajo el subtítulo "Credenciales". Esto expone información sensible de terceros a cualquier usuario autenticado del sistema.

❌ El formulario de alta asigna la contraseña fija `"1234"` a cada cliente creado. No hay generación segura ni aviso al usuario sobre esta decisión.

❌ No se detectó ninguna estrategia de sanitización de inputs antes del envío a la API.

❌ `npm run lint` falla con 4 errores activos, indicando que la herramienta de calidad estática no está integrada en el flujo de trabajo del equipo.

### 6.4 Rendimiento y experiencia de usuario

✅ La lista de clientes se obtiene una sola vez al montar el componente, sin solicitudes repetidas innecesarias.

✅ Se muestran estados de carga en el listado y en el formulario de alta.

✅ El botón de envío del formulario se deshabilita durante la operación asíncrona, previniendo envíos duplicados.

❌ No hay cancelación de requests con `AbortController` al desmontar componentes. Si el usuario navega antes de que el fetch termine, React intentará actualizar el estado sobre un componente ya desmontado, lo que puede generar advertencias en la consola.

❌ No hay paginación ni estrategia de renderizado virtual para listas grandes. Con un número elevado de clientes, el rendimiento de la tabla podría degradarse.

❌ No existe un estado vacío explícito en el listado: si la búsqueda no encuentra coincidencias, la tabla se muestra vacía sin ningún mensaje informativo para el usuario.

❌ La barra de navegación (`Nav.jsx`) es visible incluso en la página de login, antes de que el usuario esté autenticado, lo que puede generar confusión en el flujo de ingreso.

---

## 7. Validación y Evidencias

### Comandos ejecutados

- **`npm run lint`** → Falla con los siguientes 4 errores de ESLint:
  - `src/App.jsx` — `useAutorizaciones` importado pero no utilizado.
  - `src/context/AutorizacionesContext.jsx` — exporta componente y contexto desde el mismo archivo (`react-refresh/only-export-components`).
  - `src/pages/DetalleCliente.jsx` — variable `error` declarada en `catch` pero no utilizada (`no-unused-vars`).
  - `src/routes/routes.jsx` — `Navigate` importado pero no utilizado directamente.
- **`npm run build`** → Exitoso. Vite genera correctamente el bundle de producción en `dist/`.

### Herramientas utilizadas

- Lectura del código fuente.
- Análisis de dependencias en `package.json`.
- Revisión cruzada con los análisis previos de los compañeros de equipo (Miranda César Germán y Lucas Tiziano Gallo).
- Claude Sonnet 4.6 (IA) como asistente de análisis y redacción técnica.

---

## 8. Conclusión

### Estado general

El proyecto presenta una base funcional coherente para un prototipo académico: la navegación SPA protegida, el ciclo de autenticación, el CRUD básico sobre FakeStoreAPI y los estados de carga en operaciones asíncronas funcionan correctamente en los flujos principales. La arquitectura de componentes respeta una separación de responsabilidades razonable y el uso de Context API con un hook personalizado es una decisión técnica adecuada para la escala del sistema.

La brecha más crítica está en el modelo de seguridad: autenticación, roles y permisos residen completamente en el cliente y son manipulables sin conocimientos técnicos avanzados. En segundo lugar, la inconsistencia en la capa de acceso a datos —mezcla de Fetch y Axios sin abstracción compartida— y los cuatro errores de ESLint sin resolver señalan que las herramientas de calidad no están integradas activamente en el proceso de desarrollo. La ficha de detalle, en particular, concentra varios problemas simultáneos: ausencia de manejo de errores, exposición de contraseñas y evaluación de permisos por fuera del contexto.

### Fortalezas del prototipo

- Separación de responsabilidades coherente entre páginas, componentes, servicios y contexto.
- Uso de Context API y hook personalizado (`useAutorizaciones`) para el estado global de sesión.
- Guardia de rutas funcional con redirección correcta al login.
- Indicadores de carga presentes en las operaciones asíncronas principales.
- Formulario de login con validación detallada por campo.
- Compilación de producción exitosa y sin advertencias críticas de Vite.

### Riesgos prioritarios identificados

- Las credenciales de usuario y los permisos de acceso residen en el cliente y son manipulables por cualquier usuario del navegador.
- La ficha de detalle de cliente puede quedar en estado de carga indefinido ante un error de red o respuesta HTTP inválida, sin información para el usuario.
- La contraseña de clientes de FakeStoreAPI se expone en texto plano en la interfaz.
- La URL base de la API hardcodeada en múltiples archivos dificulta el mantenimiento y la configuración por entorno.
- La dualidad Fetch/Axios sin una capa de acceso unificada genera inconsistencia en el manejo de errores a lo largo de la aplicación.

---

## 9. Historial del Documento

- **Versión:** 0.1
- **Fecha:** 2026-09-07
- **Responsable:** Mamani Mariano Martin
- **Descripción:** Relevamiento y análisis técnico individual inicial mediante lectura estática del código fuente.
