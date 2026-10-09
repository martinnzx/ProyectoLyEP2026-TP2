# Documentación Técnica General — Panel de Control de Clientes

## 1. Datos Generales
| Campo | Detalle |
|---|---|
| **Sistema** | Panel de Control de Clientes |
| **Proyecto** | TP2 — Legislación y Ejercicio Profesional 2026 (Grupo 3) |
| **Arquitectura** | Cliente/Servidor desacoplado: SPA React + API REST Express + MongoDB |
| **Fecha de actualización** | 2026-10-08 |
| **Documentos relacionados** | `server/documents/SDD_Backend.md`, `client/Docs/mejoras/spec_XX.md` / `doc_XX.md`, `client/testing_general.md`, `client/dia.md` |

## 2. Descripción General
El sistema permite que personal interno (sectores **Gerencia** y **Soporte**) inicie sesión y gestione una cartera de clientes: listado con búsqueda, detalle, alta y baja, más un Dashboard con indicadores.

En su versión inicial (TP1) el frontend consumía la API pública `fakestoreapi.com` y validaba usuarios contra un arreglo estático con contraseñas en texto plano dentro del código. En el TP2 se construyó un **backend propio con persistencia en MongoDB** y se **integró el frontend** con él. Así se reemplazaron los datos simulados por datos reales y se resolvieron los hallazgos H-004, H-006 y H-007 del relevamiento.

## 3. Arquitectura

```
┌──────────────────────────────┐        HTTP / JSON         ┌──────────────────────────────┐      Mongoose      ┌──────────────┐
│  FRONTEND (client/)          │  ───────────────────────▶  │  BACKEND (server/)           │  ───────────────▶  │  MongoDB     │
│  React 19 + Vite             │      axios  (CORS)         │  Express 5                   │                    │  (Atlas o    │
│                              │  ◀───────────────────────  │                              │  ◀───────────────  │   local)     │
│  Páginas → Contextos →       │                            │  Rutas → Controladores →     │                    │  colecciones │
│  Hooks → Servicios (axios)   │                            │  Modelos  + Middleware error │                    │  clientes,   │
│  puerto 5173 (dev)           │                            │  puerto 3001                 │                    │  usuarios    │
└──────────────────────────────┘                            └──────────────────────────────┘                    └──────────────┘
```

### 3.1 Tecnologías
| Capa | Tecnologías |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, axios 1.x, Bootstrap 5 / React-Bootstrap |
| Backend | Node.js (módulos ES), Express 5, Mongoose 9, cors, dotenv |
| Base de datos | MongoDB (Atlas mediante `MONGO_URI`, o local `mongodb://localhost:27017/clientesDB` como respaldo) |
| Testing | Vitest + Testing Library (frontend); Jest + Supertest + MongoDB Memory Server (backend) |
| Calidad | ESLint 10 con reglas de React Hooks |

### 3.2 Estructura del repositorio
```
ProyectoLyEP2026-TP2/
├── client/                      # Frontend SPA
│   ├── src/
│   │   ├── pages/               # Login, Dashboard, ListaClientes, DetalleCliente, ErrorPage
│   │   ├── components/          # Header, Nav, Footer, FormCliente, RutaProtegida, EmptyState, ErrorBoundary
│   │   ├── context/             # AutorizacionesContext (sesión), ClientesContext (estado de clientes)
│   │   ├── hooks/               # useAutorizaciones, useClientes
│   │   ├── services/            # clientesService, autorizacionesServices  ← punto de integración con la API
│   │   ├── routes/routes.jsx    # Definición de rutas y protección
│   │   └── css/
│   ├── Docs/                    # Relevamientos, especificaciones y resultados de mejoras
│   └── .env.example             # VITE_API_URL
└── server/                      # API REST
    ├── server.js                # Punto de entrada: conexión a MongoDB + listen
    ├── app.js                   # Instancia de Express exportada (usada por los tests)
    ├── routes/                  # clienteRoutes, authRoutes
    ├── controllers/             # clienteController, authController
    ├── models/                  # Cliente, Usuario (Mongoose)
    ├── middleware/errorHandler.js
    ├── tests/                   # Jest + Supertest + MongoDB en memoria
    └── .env.example             # PORT, MONGO_URI
```

## 4. Backend (API REST)

### 4.1 Capas
- **Rutas (`routes/`):** asocian cada verbo HTTP y URL con su controlador.
- **Controladores (`controllers/`):** validan la entrada, ejecutan la lógica, consultan los modelos y responden con el código HTTP y el JSON correspondientes. Los errores no controlados se derivan con `next(error)`.
- **Modelos (`models/`):** esquemas Mongoose que replican la estructura de datos que ya esperaba el frontend.
- **Middleware (`middleware/errorHandler.js`):** `notFound` responde 404 con la URL solicitada y `errorHandler` centraliza la traducción de errores a respuestas JSON.

### 4.2 Modelos de datos

**Colección `clientes`** (`models/Cliente.js`)
| Campo | Tipo | Reglas |
|---|---|---|
| `email` | String | requerido |
| `username` | String | requerido, único |
| `name.firstname` | String | requerido |
| `name.lastname` | String | por defecto `'-'` |
| `phone` | String | opcional |
| `address.street / number / zipcode / city` | String | opcionales |
| `createdAt`, `updatedAt` | Date | automáticos (`timestamps`) |

**Colección `usuarios`** (`models/Usuario.js`)
| Campo | Tipo | Reglas |
|---|---|---|
| `email` | String | requerido, único |
| `password` | String | requerido; **nunca se devuelve** en las respuestas |
| `nombre` | String | requerido |
| `sector` | String | requerido; enum `'Soporte'` \| `'Gerencia'` |
| `createdAt`, `updatedAt` | Date | automáticos |

**Transformación `toJSON` (clave para la integración):** ambos modelos convierten `_id` en `id` (string) y eliminan `__v`. `Usuario` además elimina `password`. Así el frontend sigue usando `cliente.id`, como cuando consumía fakestoreapi, sin conocer detalles de MongoDB.

### 4.3 Endpoints
Base: `http://localhost:3001/api`

| Método | Endpoint | Descripción | Respuestas |
|---|---|---|---|
| GET | `/clientes` | Lista todos los clientes | 200 `[Cliente]` |
| GET | `/clientes/:id` | Obtiene un cliente | 200 · 404 inexistente · 400 ID inválido |
| POST | `/clientes` | Crea un cliente (`email`, `username`, `name.firstname` obligatorios) | 201 · 400 faltan campos / username duplicado |
| PUT | `/clientes/:id` | Actualiza un cliente (con validaciones del esquema) | 200 · 404 · 400 |
| DELETE | `/clientes/:id` | Elimina un cliente | 200 `{ message, id }` · 404 · 400 |
| POST | `/auth/login` | Autentica por `email` + `password` | 200 `{ message, usuario }` · 400 faltan datos · 401 credenciales inválidas |
| POST | `/auth/register` | Registra un usuario del sistema | 201 `Usuario` · 400 faltan campos / sector inválido / email duplicado |
| GET | `/auth/usuarios` | Lista los usuarios (sin contraseñas) | 200 `[Usuario]` |
| GET | `/` (raíz del servidor) | Verificación de estado | 200 texto |

### 4.4 Formato de errores
Todas las respuestas de error tienen la forma `{ "message": "..." }`. Esta es la propiedad que lee el frontend (`err.response.data.message`).

| Situación | Código | Mensaje |
|---|---|---|
| Ruta inexistente | 404 | `Ruta no encontrada - <url>` |
| ObjectId con formato inválido (`CastError`) | 400 | `Formato de ID inválido` |
| Validación de Mongoose | 400 | `Error de validación` + arreglo `errores` |
| Clave duplicada (código 11000) | 400 | `El campo <campo> ya se encuentra registrado` |
| Otro error | 500 | `err.message` o `Error interno del servidor` |

### 4.5 Configuración (`server/.env`)
| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto de escucha | `3001` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/clientesDB` |

## 5. Frontend (SPA React)

### 5.1 Organización
- **Servicios (`src/services/`):** son la **única capa que conoce la API**. Encapsulan las llamadas axios y devuelven `respuesta.data`.
- **Contextos (`src/context/`):** mantienen el estado global y lo exponen mediante hooks (`useClientes`, `useAutorizaciones`), que validan estar dentro de su Provider.
- **Páginas y componentes:** consumen los hooks y no realizan llamadas HTTP directas. La única excepción es `Dashboard.jsx`, que llama a `autorizacionesServices.obtenerUsuarios()`.

### 5.2 Rutas
| Ruta | Página | Protegida |
|---|---|---|
| `/login` | `Login` | No |
| `/` | `Dashboard` | Sí |
| `/clientes` | `ListaClientes` (incluye `FormCliente`) | Sí |
| `/clientes/:id` | `DetalleCliente` | Sí |
| `*` | `ErrorPage` | No |

`RutaProtegida` redirige a `/login` si no hay un administrador en sesión.

### 5.3 Configuración (`client/.env`)
| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3001/api` |

## 6. Integración Backend ↔ Frontend

Esta sección describe en detalle cómo se comunican ambas partes.

### 6.1 Punto de integración: capa de servicios
```js
// client/src/services/clientesService.js
const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3001/api";
const CLIENTES_URL = `${API_BASE_URL}/clientes`;
```

| Servicio del frontend | Endpoint del backend | Consumido por |
|---|---|---|
| `clientesService.obtenerClientes(signal)` | `GET /api/clientes` | `ClientesContext` (carga inicial) → `ListaClientes`, `DetalleCliente`, `Dashboard` |
| `clientesService.obtenerClientePorId(id)` | `GET /api/clientes/:id` | Disponible (el detalle hoy se resuelve desde el contexto) |
| `clientesService.crearCliente(datos)` | `POST /api/clientes` | `ClientesContext.crearCliente` ← `FormCliente` |
| `clientesService.actualizarCliente(id, datos)` | `PUT /api/clientes/:id` | Disponible (no hay aún pantalla de edición) |
| `clientesService.eliminarCliente(id)` | `DELETE /api/clientes/:id` | `ClientesContext.eliminarCliente` ← `DetalleCliente` |
| `autorizacionesServices.login(email, password, sector)` | `POST /api/auth/login` | `Login` |
| `autorizacionesServices.registro(datos)` | `POST /api/auth/register` | Disponible (alta de usuarios del sistema) |
| `autorizacionesServices.obtenerUsuarios()` | `GET /api/auth/usuarios` | `Dashboard` (conteo por sector) |

Para usar otra URL de API, basta con definir `VITE_API_URL`; no hay URLs repetidas en páginas ni componentes.

### 6.2 CORS
El backend habilita `cors()` sin restricciones de origen. Así el frontend servido por Vite (`http://localhost:5173`) puede consumir la API en `http://localhost:3001`. Esto se verificó en la prueba de integración (`testing_general.md`, sección 5).

### 6.3 Contrato de datos
Los esquemas se diseñaron para que el frontend **no tuviera que cambiar su modelo de datos** al pasar de fakestoreapi a la API propia:
- Los clientes mantienen la estructura `{ id, email, username, name: { firstname, lastname }, phone, address: {...} }`.
- `toJSON` expone `id` en lugar de `_id`. Como ese `id` es un ObjectId de 24 caracteres hexadecimales, el frontend compara identificadores siempre como texto (`String(cliente.id) === String(id)`) y no los convierte a número. Esa conversión producía `NaN` y un `CastError` en el backend, y se corrigió en doc_14.
- `lastname` toma `'-'` por defecto, con lo que se mantiene la corrección H-002 del frontend.
- Las contraseñas nunca viajan del backend al frontend.

### 6.4 Flujos principales

**a) Inicio de sesión**
1. `Login.jsx` valida el formulario (email, contraseña y sector) y llama a `autorizacionesServices.login()`.
2. El servicio envía `POST /api/auth/login` con `{ email, password }`.
3. El backend busca el usuario por email, compara la contraseña y responde `{ message, usuario }` (sin password), o 401.
4. El servicio verifica que `usuario.sector` coincida con el sector elegido en pantalla. Si no coincide, lanza un error 403 generado en el cliente.
5. `Login` guarda `{ id, nombre, email, sector }` en `AutorizacionesContext`, que lo persiste en `localStorage` (clave `admin`) para conservar la sesión al recargar, y navega a `/`.
6. Ante un error, se muestra `err.response.data.message` del backend.

**b) Carga y listado de clientes**
1. Al montarse la app, `ClientesProvider` ejecuta `obtenerClientes(signal)` con un `AbortController`. Si el componente se desmonta, la petición se cancela.
2. La respuesta se guarda en el estado y se expone como `clientes`, junto con `loading` y `error`.
3. `ListaClientes` filtra y muestra los datos; `Dashboard` muestra el total.

**c) Alta de cliente**
1. `FormCliente` valida los campos y llama a `crearCliente(datos)` del contexto.
2. El contexto invoca `POST /api/clientes`; el backend valida, verifica que el `username` no esté repetido y persiste el cliente.
3. El cliente devuelto (con su `id` real de MongoDB) se agrega al estado, y la lista y el Dashboard se actualizan sin recargar.
4. Si el `username` está duplicado, el formulario muestra el mensaje del backend.

**d) Baja de cliente**
1. Al presionar el botón de eliminar, `DetalleCliente` llama a `eliminarCliente(id)` del contexto. No se pide confirmación previa.
2. El contexto invoca `DELETE /api/clientes/:id` y, si responde correctamente, quita el cliente del estado y navega a `/clientes`. Si falla, se muestra `"Error al eliminar cliente"`.

**e) Dashboard con datos reales (spec_15 / doc_15)**
1. **Clientes:** `clientes.length` desde `useClientes()`.
2. **Gerencia / Soporte:** `Dashboard` llama a `obtenerUsuarios()` y cuenta los usuarios por `sector`.
3. Mientras cargan los datos se muestra `…`. Ante un error, los conteos de usuarios quedan en 0.

### 6.5 Manejo de errores de punta a punta
| Origen | Backend responde | Frontend muestra |
|---|---|---|
| Credenciales inválidas | 401 `{ message }` | Mensaje en `Login` |
| Sector no coincide | — (validación del servicio) | Mensaje 403 en `Login` |
| Username duplicado | 400 `{ message }` | Mensaje en `FormCliente` |
| Fallo al cargar clientes | 5xx / red | `"Error al cargar los clientes."` en `ListaClientes` |
| Cliente no encontrado en el estado | — | `EmptyState` "Cliente no encontrado" en `DetalleCliente` |
| Fallo al eliminar | 4xx / 5xx | `"Error al eliminar cliente"` en `DetalleCliente` |
| Error de render inesperado | — | `ErrorBoundary` |

## 7. Puesta en Marcha

### 7.1 Requisitos
- Node.js 20 o superior (probado con Node 24).
- MongoDB Atlas (cadena de conexión) o MongoDB local.

### 7.2 Backend
```bash
cd server
npm install
cp .env.example .env        # completar MONGO_URI
npm run dev                 # o: npm start
```
La API queda disponible en `http://localhost:3001`.

### 7.3 Frontend
```bash
cd client
npm install
cp .env.example .env        # opcional: VITE_API_URL
npm run dev
```
La aplicación queda disponible en `http://localhost:5173`.

### 7.4 Primer usuario
Como no hay pantalla de registro, el primer usuario se crea directamente contra la API:
```bash
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"admin@empresa.com\",\"password\":\"<contraseña>\",\"nombre\":\"Admin\",\"sector\":\"Gerencia\"}"
```

## 8. Testing
| Ámbito | Comando | Alcance |
|---|---|---|
| Backend | `cd server && npm test` | Modelos, rutas y middleware sobre MongoDB en memoria (59 casos) |
| Frontend | `cd client && npm test` | Servicios con axios mockeado (10 casos) |
| Calidad | `cd client && npm run lint` / `npm run build` | ESLint y compilación |

El detalle de resultados y la prueba de integración real frontend → API → MongoDB (17 casos) están en `client/testing_general.md`.

## 9. Limitaciones Conocidas y Mejoras Futuras
| # | Limitación | Mejora sugerida |
|---|---|---|
| 1 | Las contraseñas se guardan y comparan en **texto plano** (etapa actual del SDD). | Hashear con `bcrypt` en `register` y comparar con `bcrypt.compare` en `login`. |
| 2 | La API **no exige autenticación**: cualquier cliente HTTP puede usar el CRUD de clientes y listar usuarios. La protección de rutas existe solo en el frontend (`localStorage`). | Emitir un JWT en `login`, enviarlo con un interceptor de axios y validarlo con un middleware en el backend. |
| 3 | La validación de sector en el login se hace en el frontend. | Enviar `sector` al backend y validarlo en `authController.login`. |
| 4 | `GET /auth/usuarios` devuelve el listado completo para que el Dashboard cuente por sector. | Crear un endpoint `/api/estadisticas` protegido que devuelva solo los conteos (`countDocuments`). |
| 5 | `server.js` duplica la configuración de `app.js`. | Que `server.js` importe `app.js` y solo agregue la conexión y el `listen`. |
| 6 | `findByIdAndUpdate` usa la opción deprecada `new: true`. | Reemplazarla por `returnDocument: 'after'`. |
| 7 | `ClientesContext` todavía conserva estructuras de la etapa sin backend (`clientesLocales`, `idsEliminados`, `ultimoId`), aunque doc_14 indica que se eliminaron. | Simplificar el estado a un único arreglo sincronizado con la API. |
| 8 | No hay pantalla de edición de clientes ni de registro de usuarios, aunque los servicios existen. | Incorporar las vistas correspondientes. |
| 9 | CORS abierto a cualquier origen. | Restringir a los orígenes del frontend mediante una variable de entorno. |
