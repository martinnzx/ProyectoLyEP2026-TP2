# Análisis Técnico Profesional y Auditoría de Arquitectura — Sistema Web de Gestión de Clientes

## 1. Datos Generales

| Campo | Detalle |
| :--- | :--- |
| **Sistema** | Panel de Control de Clientes |
| **Versión** | 0.0.0 |
| **Tipo de Aplicación** | SPA (Single Page Application) — Frontend React 19 + Vite |
| **Repositorio** | Rama de trabajo: `docs/analisis-tecnico` |
| **Fecha de Relevamiento** | 2026-09-08 |
| **Responsable** | Valentín Iriarte |
| **Metodología** | Inspección estática línea por línea, trazado de flujos de datos intercomponentes, auditoría de vulnerabilidades de paquetes en la cadena de dependencias (`npm audit`), pruebas de build/linting y validación de resiliencia ante asincronía y fallos en contratos de datos. |

---

## 2. Resumen Ejecutivo

El presente relevamiento técnico se enfoca en aspectos de arquitectura de software, integridad de datos, manejo de asincronía y seguridad en dependencias que no fueron contemplados en los análisis iniciales del equipo. Si bien el proyecto logra implementar una interfaz visual atractiva y una navegación SPA funcional basada en React Router DOM, el análisis en profundidad revela debilidades operativas críticas:

1. **Desincronización de estado en el flujo de alta:** El componente `FormCliente` se encuentra completamente aislado del listado de clientes (`ListaClientes`), lo que provoca que cualquier cliente creado exitosamente vía API nunca se refleje en la tabla de la interfaz durante la sesión del operador.
2. **Ruptura de contratos de datos:** El payload generado para crear clientes omite deliberadamente la estructura de dirección (`address.street`, `address.number`, etc.) y fija el apellido en un valor constante (`"-"`), lo que desencadena búsquedas defectuosas y expone a la vista de detalle (`DetalleCliente`) a errores de renderizado en tiempo de ejecución (`TypeError`).
3. **Vulnerabilidades de seguridad en librerías externas:** La ejecución de `npm audit` arrojó **6 vulnerabilidades de severidad alta** en dependencias activas (incluyendo `react-router` y librerías de empaquetado/utilidades), exponiendo al frontend a vectores de ataque conocidos que requieren actualización.
4. **Ciclo de vida de sesión asimétrico y estado zombi:** Al invocar el cierre de sesión, la clave `role` permanece intacta en `localStorage`, conviviendo indefinidamente con la sesión cerrada y generando un estado residual peligroso para inicios de sesión posteriores.
5. **Código muerto y redundancia lógica:** En `Dashboard.jsx`, la verificación de usuario no autenticado es inalcanzable debido al bloqueo previo de `RutaProtegida`, manteniendo código muerto y una importación innecesaria del módulo `Login`.

---

## 3. Objetivo y Alcance

### 3.1 Objetivo del Sistema
El software busca proporcionar un panel centralizado para operadores de los sectores **Soporte** y **Gerencia**, facilitando la administración de clientes (consulta, alta, eliminación) interactuando contra los servicios mock de FakeStoreAPI bajo un esquema de control de acceso por roles (RBAC).

### 3.2 Matriz de Cobertura Funcional y Comportamiento Real

| Módulo / Funcionalidad | Comportamiento Esperado | Comportamiento Real Observado | Estado |
| :--- | :--- | :--- | :--- |
| **Alta de Clientes** | Enviar `POST` y actualizar automáticamente la tabla de clientes. | El `POST` se ejecuta, pero el estado de `ListaClientes` no se actualiza. La tabla permanece inmutable. | ⚠️ Defectuoso |
| **Búsqueda de Clientes** | Filtrar clientes por múltiples atributos relevantes (nombre, apellido, ciudad, email). | Filtra únicamente por `lastname` y `city`. Si se busca por el nombre de pila (`firstname`) o correo, no arroja coincidencias. | ⚠️ Incompleto |
| **Ficha de Detalle** | Presentar la información completa del cliente y gestionar errores de consulta. | No maneja errores de red ni IDs inexistentes. Si faltan propiedades anidadas en `address`, la aplicación se quiebra. | ❌ Crítico |
| **Eliminación de Cliente** | Ejecutar `DELETE` informando progreso y evitando acciones concurrentes. | No deshabilita el botón tras el primer click; el usuario puede enviar múltiples peticiones en paralelo. | ⚠️ Riesgoso |
| **Cierre de Sesión** | Purgar por completo los tokens y datos de sesión en el navegador. | Elimina la clave `admin`, pero omite eliminar la clave `role` en `localStorage`. | ❌ Inconsistente |
| **Layout y Sticky Footer** | Mantener el footer al pie de la página mediante flexbox. | El archivo `app.css` aplica `flex: 1` sobre la etiqueta `<main>`, pero dicha etiqueta no existe en ningún JSX. | ⚠️ Defecto Maquetación |

---

## 4. Auditoría de Dependencias y Cadena de Suministro

A diferencia de las revisiones superficiales de `package.json`, una auditoría formal con `npm audit` revela que el proyecto arrastra riesgos de seguridad heredados directamente en dependencias de producción y desarrollo:

### 4.1 Vulnerabilidades Identificadas (`npm audit`)

| Paquete | Versión instalada | Severidad | Vulnerabilidad / Advisory | Impacto en el Proyecto |
| :--- | :--- | :--- | :--- | :--- |
| **react-router / react-router-dom** | `7.18.0` | **Alta** | [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) (RSC Mode CSRF Bypass) | Permite bypass de acciones antes de respuesta 400 bajo ciertos modos de consumo del enrutador. |
| **nanoid** | `<=3.3.17` | **Alta** | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) / [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | Bloqueo por loop infinito en generadores con tamaños inválidos o cero. |
| **brace-expansion** | `3.0.0 - 5.0.8` | **Alta** | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) / [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | Denegación de servicio (DoS) por agotamiento de memoria (OOM) al parsear expresiones consecutivas. |
| **browserslist** | `<=4.28.6` | **Alta** | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) / [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | Fuga no acotada de memoria (sin desalojo de caché) y eventual crash del proceso de build. |
| **postcss** | `<=8.5.22` | **Alta** | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) / [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | Divulgación arbitraria de archivos `.map` por path traversal en source maps automáticos. |

**Acción requerida:** Ejecutar `npm audit fix` o actualizar `react-router-dom` a la versión parcheada `>= 7.18.2` y dependencias del build de Vite.

---

## 5. Arquitectura y Flujo de Datos

### 5.1 Desconexión Reactiva entre Componentes (`FormCliente` ↔ `ListaClientes`)

En `src/pages/ListaClientes.jsx`, el formulario se incluye de forma estática en la línea 52:
```jsx
<h1>Clientes</h1>
<FormCliente />
<hr />
```
El ciclo de vida y los estados están completamente desacoplados:
1. `ListaClientes` mantiene su estado `const [clientes, setClientes] = useState([])` cargado desde el `useEffect` inicial.
2. `FormCliente` ejecuta `clientesService.crearCliente(nuevoCliente)`. Al recibir la respuesta HTTP 200 con el nuevo `id`, setea un mensaje de éxito local y vacía sus inputs.
3. **Punto de falla:** `FormCliente` no recibe ninguna función callback (por ejemplo `onClienteCreado`) ni comparte un contexto común de clientes con `ListaClientes`. 
4. **Consecuencia técnica:** Para el usuario, la acción parece inútil o fallida, ya que la tabla de abajo no refleja el nuevo registro. Si el operador recarga la página esperando ver los datos, FakeStoreAPI (al ser un mock) tampoco persiste el dato, perdiendo la entrada por completo.

### 5.2 Fuga de Estado y "Zombie Role" en `localStorage`

El flujo de inicio de sesión en `Login.jsx` (línea 51) guarda manualmente:
```javascript
localStorage.setItem("role", usuario.sector);
setAdmin({ ... });
```
Sin embargo, en `src/context/AutorizacionesContext.jsx`:
```javascript
const cerrarSesion = () => {
  setAdmin(null);
};
```
Y el `useEffect` que escucha cambios en `admin`:
```javascript
useEffect(() => {
  if (admin) {
    localStorage.setItem('admin', JSON.stringify(admin));
  } else {
    localStorage.removeItem('admin');
  }
}, [admin]);
```
**Análisis:**
- `localStorage.removeItem('role')` no existe en ninguna parte de la aplicación.
- Si un usuario con sector **Gerencia** inicia sesión y luego presiona "Cerrar Sesión", la clave `admin` se borra, pero la clave `role: "Gerencia"` queda almacenada indefinidamente en el navegador.
- Este desacoplamiento entre el objeto de sesión (`admin`) y la autorización de permisos (`role`) representa una asimetría en el manejo de persistencia local.

### 5.3 Código Muerto en `Dashboard.jsx`

En `src/pages/Dashboard.jsx` (líneas 13 a 18):
```jsx
{!admin ? (
  <div className="dashboard-login">
    <h3>Bienvenido al sistema</h3>
    <p>Ingrese sus credenciales para acceder.</p>
    <Login />
  </div>
) : ( ... )}
```
**Análisis:**
- En `src/routes/routes.jsx`, la ruta raíz `/` está configurada como:
  ```jsx
  <Route path="/" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
  ```
- `RutaProtegida` verifica si existe `admin`. Si es `null`, redirige inmediatamente a `/login` mediante `<Navigate to="/login" replace />`.
- Por ende, la condición `!admin` dentro de `Dashboard.jsx` es **matemáticamente imposible de alcanzar en tiempo de ejecución**. La importación de `<Login />` en este archivo es código muerto innecesario.

---

## 6. Evaluación Profunda del Código Fuente

### 6.1 Integridad del Payload y Fragilidad en Ficha de Detalle

En `src/components/FormCliente.jsx` (líneas 44-54), el objeto enviado a la API es:
```javascript
const nuevoCliente = {
  email,
  username: nombre.toLowerCase().replace(/\s/g, ""),
  password: "1234",
  name: {
    firstname: nombre,
    lastname: "-" // <- Hardcodeado
  },
  address: {
    city: ciudad // <- Omite street, number, zipcode
  },
  phone: telefono
};
```
Mientras tanto, en `src/pages/DetalleCliente.jsx` (líneas 70 a 78), el renderizado accede a las propiedades de manera directa y sin protección:
```jsx
<p><strong>Calle:</strong> {cliente.address.street}</p>
<p><strong>Número:</strong> {cliente.address.number}</p>
<p><strong>Código Postal:</strong> {cliente.address.zipcode}</p>
```
**Riesgos:**
1. Si un cliente no posee el nodo `address` (común en respuestas corruptas o entidades dadas de alta con esquemas reducidos), la aplicación lanzará un error fatal no controlado:
   `Uncaught TypeError: Cannot read properties of undefined (reading 'street')`.
2. Al no contar con un `ErrorBoundary`, un único registro anómalo destruye el árbol de componentes de React completo, dejando la pantalla en blanco.

### 6.2 Búsqueda Restrictiva y Sensible a Nulos en `ListaClientes.jsx`

El filtro de clientes actual (líneas 30-38 de `ListaClientes.jsx`):
```javascript
const clientesFiltrados = clientes.filter(
  (cliente) =>
    cliente.name.lastname
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||
    cliente.address.city
      .toLowerCase()
      .includes(busqueda.toLowerCase())
);
```
**Problemas detectados:**
1. **Omisión de campos naturales:** Los usuarios suelen buscar por nombre (`firstname`), email o ID. Si alguien escribe el nombre visible en la tabla, el buscador devuelve cero resultados porque únicamente evalúa el apellido (`lastname`).
2. **Crash ante propiedades ausentes:** Si un cliente devuelto por la API posee `name: null` o `address: null`, la llamada `.toLowerCase()` arroja una excepción no controlada que aborta el renderizado.
3. **Carencia de debounce:** La evaluación se ejecuta sincrónicamente con cada tecla presionada sin utilizar retardos (`debounce`) ni hooks de transición diferida (`useDeferredValue`), provocando recálculos innecesarios sobre el hilo principal.

### 6.3 Concurrencia, Fugas de Memoria y Temporizadores en `DetalleCliente.jsx`

En la función `eliminarCliente` (líneas 19-38):
```javascript
const eliminarCliente = async () => {
  try {
    const respuesta = await fetch(`https://fakestoreapi.com/users/${id}`, { method: "DELETE" });
    if (respuesta.ok) {
      setMensaje("Cliente eliminado correctamente");
      setTimeout(() => {
        navigate("/clientes");
      }, 2000);
    }
  } catch (error) {
    setMensaje("Error al eliminar cliente");
  }
};
```
**Vulnerabilidades técnicas:**
1. **Doble envío / Race Conditions:** No existe una bandera de estado tipo `eliminando` o `isDeleting`. Si el usuario hace doble click o clickea compulsivamente el botón "Eliminar Cliente", se despacharán múltiples peticiones `DELETE` paralelas hacia el servidor.
2. **Falta de manejo ante respuestas no exitosas:** Si `respuesta.ok` es falso (ej. HTTP 404 o 500), el código no entra al `if` ni pasa al `catch`. El proceso termina silenciosamente sin advertir al usuario.
3. **Temporizador huérfano (`Memory Leak`):** La llamada a `setTimeout` no almacena su identificador ni se limpia en un retorno de desmonte (`return () => clearTimeout(timer)`). Si el operador cambia de página antes de los 2 segundos, el callback se ejecutará sobre un componente desmontado intentando invocar a `navigate`.

### 6.4 Maquetación y Accesibilidad (WCAG 2.1 AA)

1. **Colapso del Sticky Footer por etiqueta `<main>` inexistente:**
   En `src/css/app.css` se define:
   ```css
   body { min-height: 100vh; display: flex; flex-direction: column; }
   main { flex: 1; }
   ```
   Sin embargo, en `src/App.jsx`:
   ```jsx
   function App() {
     return (
       <>
         <Header />
         <Nav />
         <AppRoutes />
         <Footer />
       </>
     );
   }
   ```
   Al no existir el elemento semántico `<main>`, la regla de flexbox queda inoperante. En pantallas grandes con poco contenido (como en `/login`), el `footer` no se ancla abajo de forma adecuada.
2. **Deficiencias de accesibilidad en formularios:**
   - En `FormCliente.jsx`, los `<Form.Label>` no cuentan con atributo `htmlFor` asociado al `id` del `<Form.Control>`, impidiendo que lectores de pantalla reconozcan qué campo se está completando.
   - En `ListaClientes.jsx`, el campo de búsqueda es un `<input>` flotante sin etiqueta `<label>` ni atributo `aria-label`.
   - Las alertas de éxito y error carecen de `role="alert"` y `aria-live="polite"`.

---

## 7. Matriz de Hallazgos Técnicos

| ID | Severidad | Componente / Archivo | Causa Raíz | Impacto Operativo |
| :--- | :--- | :--- | :--- | :--- |
| **H-001** | **Crítica** | Dependencias (`package.json`) | Vulnerabilidades de severidad alta detectadas por `npm audit` (CSRF en `react-router`, DoS en utilidades). | Riesgo de seguridad en despliegue y potencial inestabilidad en compilación. |
| **H-002** | **Alta** | `FormCliente.jsx` / `ListaClientes.jsx` | Ausencia de canal de comunicación o callback para actualizar el estado del listado tras el alta. | Clientes dados de alta no se muestran en pantalla, simulando una falla ante el operador. |
| **H-003** | **Alta** | `DetalleCliente.jsx` | Acceso directo a propiedades anidadas (`cliente.address.street`) sin optional chaining (`?.`). | Crash completo de la interfaz si el cliente posee datos incompletos o nulos. |
| **H-004** | **Alta** | `AutorizacionesContext.jsx` / `Login.jsx` | `cerrarSesion` limpia `admin` pero nunca elimina `localStorage.getItem("role")`. | "Zombie Role": persistencia de permisos en el navegador tras cerrar sesión. |
| **H-005** | **Media** | `DetalleCliente.jsx` | Petición de eliminación sin bloqueo de UI (`disabled`) y `setTimeout` sin cleanup al desmontar. | Posibles race conditions por múltiples clicks y fugas de memoria por navegación anticipada. |
| **H-006** | **Media** | `Dashboard.jsx` | Renderizado condicional de `<Login />` detrás de una `RutaProtegida` que ya exige sesión. | Código muerto inalcanzable y acoplamiento superfluo de componentes. |
| **H-007** | **Media** | `ListaClientes.jsx` | Buscador restringido solo a `lastname` y `city`, sin protección ante valores indefinidos. | Búsquedas fallidas por nombre de pila o email; posible excepción si hay atributos nulos. |
| **H-008** | **Baja** | `App.jsx` / `src/css/app.css` | Inexistencia del contenedor semántico `<main>` referenciado en las hojas de estilo. | Pérdida de semántica HTML y desajuste visual del sticky footer en vistas cortas. |

---

## 8. Propuestas de Solución y Refactorización

### 8.1 Sincronización Reactiva en el Alta de Clientes

En `ListaClientes.jsx`, pasar una función de actualización a `FormCliente`:

```jsx
// En ListaClientes.jsx
const agregarClienteALista = (nuevoCliente) => {
  setClientes((prev) => [nuevoCliente, ...prev]);
};

return (
  <div className="clientes-container">
    <h1>Clientes</h1>
    <FormCliente onClienteCreado={agregarClienteALista} />
    {/* ... */}
```

En `FormCliente.jsx`, invocar la función al confirmar el alta:

```javascript
// En FormCliente.jsx
const respuesta = await clientesService.crearCliente(nuevoCliente);
const clienteCreado = { ...nuevoCliente, id: respuesta.id };

if (onClienteCreado) {
  onClienteCreado(clienteCreado);
}
setMensaje(`Cliente creado correctamente. ID: ${respuesta.id}`);
```

### 8.2 Saneamiento y Simetría del Almacenamiento Local

Eliminar el uso fragmentado de `localStorage.getItem("role")` y concentrar la fuente de verdad en el contexto `AutorizacionesContext.jsx`:

```javascript
// En AutorizacionesContext.jsx
const cerrarSesion = () => {
  setAdmin(null);
  localStorage.removeItem('admin');
  localStorage.removeItem('role'); // Saneamiento de rol residual
};
```
En `DetalleCliente.jsx`, leer el rol directamente desde el hook `useAutorizaciones`:
```javascript
const { admin } = useAutorizaciones();
const role = admin?.sector; // Fuente de verdad reactiva y unificada
```

### 8.3 Navegación Defensiva contra Crashes (`Optional Chaining`)

En `DetalleCliente.jsx`, proteger el acceso a los datos para evitar caídas de la aplicación:

```jsx
<p><strong>Nombre:</strong> {cliente.name?.firstname ?? 'S/N'} {cliente.name?.lastname ?? ''}</p>
<p><strong>Calle:</strong> {cliente.address?.street ?? 'No informada'}</p>
<p><strong>Número:</strong> {cliente.address?.number ?? 'S/N'}</p>
<p><strong>Código Postal:</strong> {cliente.address?.zipcode ?? 'S/D'}</p>
<p><strong>Ciudad:</strong> {cliente.address?.city ?? 'No informada'}</p>
```

### 8.4 Control de Concurrencia y Limpieza de Temporizadores

Refactorizar la baja de clientes con estado de carga y cleanup en `useEffect`:

```javascript
const [eliminando, setEliminando] = useState(false);

const eliminarCliente = async () => {
  if (eliminando) return;
  setEliminando(true);

  try {
    const respuesta = await fetch(`https://fakestoreapi.com/users/${id}`, { method: "DELETE" });
    if (respuesta.ok) {
      setMensaje("Cliente eliminado correctamente");
      const timer = setTimeout(() => navigate("/clientes"), 2000);
      return () => clearTimeout(timer);
    } else {
      setMensaje("No se pudo eliminar el cliente (Error del servidor)");
    }
  } catch (error) {
    setMensaje("Error de conexión al intentar eliminar");
  } finally {
    setEliminando(false);
  }
};
```

### 8.5 Corrección Semántica de Maquetación en `App.jsx`

Envolver las rutas dentro de la etiqueta `<main>` para validar la regla `main { flex: 1; }`:

```jsx
function App() {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
}
```

### 8.6 Búsqueda Multi-campo Robusta en `ListaClientes.jsx`

Extender el filtro para incluir nombre completo, email y ciudad, con chequeo defensivo:

```javascript
const clientesFiltrados = clientes.filter((cliente) => {
  const termino = busqueda.toLowerCase().trim();
  if (!termino) return true;

  const nombreCompleto = `${cliente.name?.firstname ?? ''} ${cliente.name?.lastname ?? ''}`.toLowerCase();
  const ciudad = (cliente.address?.city ?? '').toLowerCase();
  const email = (cliente.email ?? '').toLowerCase();

  return (
    nombreCompleto.includes(termino) ||
    ciudad.includes(termino) ||
    email.includes(termino)
  );
});
```

---

## 9. Validación y Evidencias Técnicas

### 9.1 Ejecución de Herramientas Estáticas

1. **`npm run lint`**  
   Estado: **Fallido (4 errores)**
   - `src/App.jsx:6:8` — Import no utilizado: `useAutorizaciones`.
   - `src/context/AutorizacionesContext.jsx:3:14` — Advertencia de Fast Refresh por exportar contexto y componente conjuntamente (`react-refresh/only-export-components`).
   - `src/pages/DetalleCliente.jsx:35:14` — Variable `error` no utilizada en bloque `catch`.
   - `src/routes/routes.jsx:1:25` — Import no utilizado: `Navigate`.

2. **`npm run build`**  
   Estado: **Exitoso**
   - Generación de bundle Vite en carpeta `dist/` en 467 ms sin errores bloqueantes de transpilación.

3. **`npm audit`**  
   Estado: **6 vulnerabilidades encontradas (todas de nivel High)**
   - Paquetes afectados: `react-router` / `react-router-dom`, `brace-expansion`, `browserslist`, `nanoid`, `postcss`.

---

## 10. Conclusión y Roadmap de Estabilización

El proyecto posee una estructura modular limpia y un flujo de navegación claro para una SPA de gestión básica. No obstante, presenta una desconexión funcional significativa en el ciclo de vida de los datos locales (el alta no impacta en la tabla, el buscador es incompleto, y la sesión deja restos en el navegador) acompañada de riesgos de seguridad en dependencias que deben subsanarse.

### Roadmap de remediación recomendado:
1. **Fase 1 (Inmediata - Estabilidad y Calidad):** Subsanar los 4 errores de ESLint y actualizar dependencias vulnerables con `npm audit fix`.
2. **Fase 2 (Reactividad y Datos):** Interconectar `FormCliente` con `ListaClientes` y blindar los componentes con optional chaining para evitar caídas de la aplicación.
3. **Fase 3 (Seguridad y Sesión):** Eliminar la clave huérfana `role` y utilizar únicamente el contexto `AutorizacionesContext` para controlar permisos.
4. **Fase 4 (Accesibilidad y UX):** Incorporar `<main>` en `App.jsx`, etiquetas accesibles en los formularios y feedback visual ante cargas y errores de red en la ficha de detalle.

---

## 11. Historial del Documento

| Fecha | Responsable | Versión | Descripción del Cambio |
| :--- | :--- | :--- | :--- |
| **2026-09-08** | Valentín Iriarte | **0.1** | Auditoría técnica profunda inicial: desincronización de estados, vulnerabilidades de dependencias, contratos de datos rotos, código muerto y análisis de accesibilidad. |
