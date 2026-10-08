# Testing General — Integración Backend / Frontend

## 1. Información General
| Campo | Detalle |
|---|---|
| **Sistema** | Panel de Control de Clientes (frontend React + API REST Express/MongoDB) |
| **Fecha de ejecución** | 2026-10-08 |
| **Rama** | feature/MirandaCesar |
| **Responsable del registro** | Miranda Cesar |
| **Objetivo** | Verificar el correcto funcionamiento de las modificaciones que integran el backend con el frontend (persistencia real en MongoDB, autenticación, CRUD de clientes y Dashboard con datos reales). |

## 2. Resumen de Resultados
| Nivel de prueba | Herramienta | Suites | Casos | Resultado |
|---|---|---|---|---|
| Backend — modelos, rutas y middleware | Jest + Supertest + MongoDB Memory Server | 5 | 59 | ✅ 59/59 |
| Frontend — capa de servicios | Vitest (axios mockeado) | 2 | 10 | ✅ 10/10 |
| Integración real Frontend → API → MongoDB | Node.js + servicios reales del frontend + MongoDB Memory Server | 1 | 17 | ✅ 17/17 |
| Análisis estático frontend | ESLint (`npm run lint`) | — | — | ✅ Sin errores ni advertencias |
| Compilación de producción frontend | Vite (`npm run build`) | — | — | ✅ Build exitoso |
| **Total de casos automatizados** | | **8** | **86** | **✅ 86/86** |

## 3. Pruebas del Backend (`server/`)

**Comando:** `npm test` (Jest con `--runInBand`, módulos ES mediante `--experimental-vm-modules`).
**Entorno:** `tests/setup.js` levanta una instancia de **MongoDB en memoria** (`mongodb-memory-server`) antes de los tests, limpia las colecciones después de cada caso y la detiene al final. No se usa la base de datos real. Los datos de prueba están centralizados en `tests/helpers.js`.
**Resultado:** 5 suites, 59 tests aprobados. Tiempo aproximado: 16 s.

### 3.1 Modelo `Cliente` — `tests/models/cliente.test.js` (9 casos)
| Grupo | Casos verificados | Resultado |
|---|---|---|
| Creación exitosa | Todos los campos válidos; solo campos requeridos; `lastname` por defecto `'-'`; generación de `createdAt`/`updatedAt` | ✅ 4/4 |
| Campos requeridos | Falla sin `email`, sin `username`, sin `name.firstname` | ✅ 3/3 |
| Transformación `toJSON` | `_id` → `id`; eliminación de `__v` | ✅ 2/2 |

### 3.2 Modelo `Usuario` — `tests/models/usuario.test.js` (12 casos)
| Grupo | Casos verificados | Resultado |
|---|---|---|
| Creación exitosa | Campos válidos; sector `Soporte`; sector `Gerencia`; timestamps | ✅ 4/4 |
| Campos requeridos | Falla sin `email`, `password`, `nombre`, `sector`; falla con sector fuera del enum | ✅ 5/5 |
| Transformación `toJSON` | `_id` → `id`; elimina `__v`; **oculta `password`** | ✅ 3/3 |

### 3.3 Rutas `/api/clientes` — `tests/routes/clientes.test.js` (18 casos)
| Endpoint | Casos verificados | Resultado |
|---|---|---|
| `GET /` | Mensaje de bienvenida de la API | ✅ 1/1 |
| `GET /api/clientes` | Array vacío; todos los clientes; uso de `id` (no `_id`) | ✅ 3/3 |
| `GET /api/clientes/:id` | Cliente existente (200); inexistente (404); ID con formato inválido (400) | ✅ 3/3 |
| `POST /api/clientes` | Alta completa (201); alta mínima (201); falta `username` (400); falta `name.firstname` (400); `username` duplicado (400) | ✅ 5/5 |
| `PUT /api/clientes/:id` | Actualización (200); inexistente (404); ID inválido (400) | ✅ 3/3 |
| `DELETE /api/clientes/:id` | Eliminación (200); inexistente (404); ID inválido (400) | ✅ 3/3 |

### 3.4 Rutas `/api/auth` — `tests/routes/auth.test.js` (14 casos)
| Endpoint | Casos verificados | Resultado |
|---|---|---|
| `GET /api/auth/usuarios` | Array vacío; todos los usuarios; respuesta **sin `password`** | ✅ 3/3 |
| `POST /api/auth/register` | Registro (201); campos faltantes (400); sector inválido (400); email duplicado (400); sin body (400) | ✅ 5/5 |
| `POST /api/auth/login` | Credenciales correctas (200); email incorrecto (401); password incorrecto (401); sin email (400); sin password (400); body vacío (400) | ✅ 6/6 |

### 3.5 Middleware de errores — `tests/middleware/errorHandler.test.js` (6 casos)
| Grupo | Casos verificados | Resultado |
|---|---|---|
| `notFound` (404) | Ruta GET inexistente; ruta POST inexistente; mensaje con la URL original | ✅ 3/3 |
| `errorHandler` (CastError) | ID inválido en GET, PUT y DELETE responde 400 | ✅ 3/3 |

## 4. Pruebas del Frontend (`client/`)

**Comando:** `npm test` (Vitest). Las llamadas HTTP se simulan con mocks de `axios`. Estas pruebas validan que cada servicio arma la petición correcta (método, URL y payload) y que interpreta bien la respuesta y los errores.
**Resultado:** 2 archivos, 10 tests aprobados.

### 4.1 `src/services/__tests__/clientesService.test.js` (5 casos)
| Método | Verificación | Resultado |
|---|---|---|
| `obtenerClientes` | GET a `/api/clientes` y retorno de datos | ✅ |
| `obtenerClientePorId` | GET a `/api/clientes/:id` | ✅ |
| `crearCliente` | POST con payload | ✅ |
| `actualizarCliente` | PUT con ID y payload | ✅ |
| `eliminarCliente` | DELETE con ID | ✅ |

### 4.2 `src/services/__tests__/autorizacionesServices.test.js` (5 casos)
| Método | Verificación | Resultado |
|---|---|---|
| `login` | Retorna el usuario si las credenciales y el sector coinciden | ✅ |
| `login` | Lanza error si el sector seleccionado no coincide con el registrado | ✅ |
| `login` | Propaga el error de credenciales inválidas de la API | ✅ |
| `registro` | POST a `/auth/register` | ✅ |
| `obtenerUsuarios` | GET a `/auth/usuarios` | ✅ |

### 4.3 Calidad y compilación
- `npm run lint` (ESLint) terminó sin errores ni advertencias.
- `npm run build` (Vite) compiló 414 módulos y generó el bundle de producción correctamente.

## 5. Prueba de Integración Real Frontend → Backend → MongoDB

### 5.1 Motivación
Las pruebas de los puntos 3 y 4 validan cada capa por separado: el backend con Supertest y el frontend con axios simulado. Para confirmar que **ambas partes funcionan juntas**, se ejecutó una prueba de integración real que usa los **módulos de servicio originales del frontend** (`clientesService.js` y `autorizacionesServices.js`) contra la **API Express real** (`server/app.js`) conectada a una MongoDB en memoria.

### 5.2 Procedimiento
1. Se inicia MongoDB Memory Server y se conecta Mongoose.
2. Se levanta `server/app.js` en un puerto local de prueba (3101, para no interferir con el servidor de desarrollo en 3001). Un interceptor de axios redirige allí las peticiones.
3. Se invocan los servicios del frontend tal como los usan las páginas y los contextos, verificando el código HTTP y la forma de cada respuesta.
4. Al finalizar se detienen el servidor y la base en memoria.

El script se ejecutó como verificación puntual y no forma parte del repositorio.

### 5.3 Resultados (17/17 aprobados)
| # | Caso | Componente del frontend involucrado | Resultado |
|---|---|---|---|
| 1 | CORS: la API acepta peticiones desde el origen de Vite (`localhost:5173`) | Toda la app | ✅ |
| 2 | `registro()`: alta de usuario Gerencia; la respuesta trae `id` y no expone `password` | — | ✅ |
| 3 | `registro()`: alta de 2 usuarios Soporte | — | ✅ |
| 4 | `login()`: credenciales y sector correctos devuelven el usuario (nombre, email, sector) sin `password` | `Login.jsx` | ✅ |
| 5 | `login()`: sector distinto al registrado es rechazado (403) | `Login.jsx` | ✅ |
| 6 | `login()`: contraseña incorrecta devuelve 401 con mensaje del backend | `Login.jsx` (muestra `err.response.data.message`) | ✅ |
| 7 | `crearCliente()`: POST persiste en MongoDB y devuelve `id` de 24 caracteres (no `_id`) | `FormCliente.jsx` / `ClientesContext` | ✅ |
| 8 | `crearCliente()`: sin `lastname` se aplica `'-'` por defecto | `FormCliente.jsx` | ✅ |
| 9 | `crearCliente()`: `username` duplicado devuelve 400 con el mensaje que muestra el formulario | `FormCliente.jsx` | ✅ |
| 10 | `obtenerClientes()`: devuelve un array con los clientes creados | `ClientesContext`, `ListaClientes.jsx` | ✅ |
| 11 | `obtenerClientePorId()`: recupera el cliente por su ObjectId | `DetalleCliente.jsx` | ✅ |
| 12 | `actualizarCliente()`: PUT devuelve el documento actualizado | Servicio disponible | ✅ |
| 13 | `obtenerUsuarios()`: permite contar 1 usuario Gerencia y 2 Soporte, sin exponer contraseñas | `Dashboard.jsx` (spec_15) | ✅ |
| 14 | `eliminarCliente()`: DELETE borra el documento y el total de clientes baja | `DetalleCliente.jsx`, `Dashboard.jsx` | ✅ |
| 15 | `obtenerClientePorId()`: cliente eliminado devuelve 404 | `DetalleCliente.jsx` | ✅ |
| 16 | `eliminarCliente()`: ID con formato inválido devuelve 400 (CastError) | `DetalleCliente.jsx` | ✅ |
| 17 | `obtenerClientes()`: la cancelación con `AbortController` funciona (patrón de `ClientesContext`) | `ClientesContext` | ✅ |

## 6. Observaciones
- **Advertencia no bloqueante:** Mongoose informa que la opción `new: true` de `findByIdAndUpdate` (usada en `updateCliente`) está deprecada y recomienda `returnDocument: 'after'`. No afecta los resultados.
- **Cobertura pendiente en el frontend:** no hay tests de componentes ni de páginas (Dashboard, Login, ListaClientes, DetalleCliente, FormCliente). La infraestructura (Vitest + Testing Library, `src/test/setup.js`) ya está disponible para incorporarlos.
- **Seguridad (fuera del alcance de las pruebas):** las contraseñas se comparan en texto plano y los endpoints de la API no requieren autenticación. La protección de rutas es solo del lado del cliente. Ver `documentacion_general.md`, sección de limitaciones.

## 7. Cómo reproducir
```bash
# Backend
cd server
npm install
npm test

# Frontend
cd client
npm install
npm test
npm run lint
npm run build
```

## 8. Conclusión
Las 86 pruebas automatizadas se aprobaron: 59 del backend, 10 del frontend y 17 de integración real. Las modificaciones que integran el frontend con la API REST y la base de datos MongoDB funcionan correctamente. El frontend consume los endpoints con el contrato esperado (`id` en lugar de `_id`, mensajes de error en `message`, usuarios sin contraseña), y las operaciones de alta, consulta, actualización y baja persisten y se reflejan en la base de datos, incluidos los contadores del Dashboard.
