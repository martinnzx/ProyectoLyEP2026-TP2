# Relevamiento inicial de la aplicación

## 1. Datos generales

| Dato | Valor |
|------------------------|------------------------------|
| Nombre                 | Panel de Control de Clientes |
| Versión del proyecto   | 0.0.0                        |
| Tipo de aplicación     | SPA web                      |
| Repositorio            | Proyecto local; la URL remota no está informada en la documentación revisada                  |
| Fecha del relevamiento | 2026-09-03                   |
| Responsable            | Miranda Cesar German         |

El relevamiento se realizó mediante lectura del código fuente y ejecución de los comandos de lint y compilación. No se realizaron pruebas automatizadas ni una inspección visual en navegador durante esta instancia.

## 2. Objetivo y alcance

### 2.1 Objetivo de la aplicación

La aplicación ofrece un panel para que usuarios internos autenticados consulten y gestionen información de clientes. Permite acceder a un dashboard, listar clientes, buscar por apellido o ciudad, consultar la ficha completa y crear clientes mediante el consumo de FakeStoreAPI. El resultado esperado es centralizar esas operaciones en una interfaz web con navegación protegida según la sesión iniciada.

### 2.2 Alcance funcional

**Funcionalidades incluidas:**

- Inicio de sesión con email, contraseña y sector.
- Persistencia de la sesión actual en `localStorage`.
- Dashboard con datos del usuario conectado y contadores informativos.
- Listado de clientes obtenido desde `https://fakestoreapi.com/users`.
- Búsqueda local por apellido o ciudad.
- Navegación a la ficha de un cliente.
- Alta de clientes mediante `POST` a FakeStoreAPI.
- Eliminación de clientes desde la ficha, habilitada para el sector Gerencia.
- Cierre de sesión y redirección a `/login`.
- Página de error para rutas no contempladas.

**Funcionalidades no incluidas o incompletas:**

- No existe backend propio, base de datos ni persistencia real de clientes.
- FakeStoreAPI simula las operaciones; los cambios no deben considerarse permanentes.
- No hay edición de clientes, paginación, ordenamiento ni filtros combinados.
- No hay administración de usuarios, recuperación de contraseña ni cambio de credenciales.
- No existe un modelo de permisos extensible: el sector funciona como rol fijo.
- No hay pruebas automatizadas, documentación de API ni observabilidad.

La aplicación tiene seis usuarios fijos definidos en `src/services/autorizacionesServices.js`: tres del sector Soporte y tres de Gerencia. Las contraseñas están escritas en el código fuente, por lo que estos datos solo resultan adecuados para una demostración académica.

### 2.3 Criterios de éxito

| Criterio | Evaluación inicial |
|---|---|
| Cada operación informa su resultado | Parcial: alta y baja muestran mensajes, pero hay respuestas de API no controladas y la baja no informa todos los estados HTTP |
| Rutas protegidas | Implementadas mediante `RutaProtegida`; `/`, `/clientes` y `/clientes/:id` redirigen a `/login` sin sesión |
| Validación de entradas | Parcial: el login valida formato y complejidad básica; el alta solo exige campos no vacíos |
| Manejo de errores | Parcial: existe manejo en listado y alta; el detalle no gestiona adecuadamente error HTTP, estado vacío ni error de carga visible |
| Persistencia | Solo se persiste la sesión y el rol en `localStorage`; los clientes dependen de la API externa |

## 3. Usuarios y procesos

### 3.1 Usuarios

| Usuario/rol | Cantidad | Capacidades observadas |
|---|---:|---|
| Soporte | 3 | Ingresar, ver dashboard, listar, buscar, consultar fichas y crear clientes |
| Gerencia | 3 | Capacidades de Soporte más el botón de eliminación en la ficha |

El usuario autenticado se guarda bajo la clave `admin`; el sector también se guarda bajo `role`. La autorización para eliminar se decide leyendo ese valor desde `localStorage`, que es manipulable por el cliente.

### 3.2 Flujo principal

1. El usuario accede a `/login` o intenta abrir una ruta protegida.
2. Completa email, contraseña y sector.
3. El formulario valida los datos y `AutorizacionesService.login` compara contra el arreglo local de usuarios.
4. Si las credenciales coinciden, se guarda la sesión, se registra el sector y se navega al dashboard.
5. Desde el dashboard se accede a Clientes, donde se consulta la lista remota.
6. El usuario puede filtrar, abrir una ficha, crear un cliente o eliminarlo si pertenece a Gerencia.
7. Cerrar sesión elimina `admin` y navega nuevamente a `/login`.

**Flujos alternativos:** credenciales inválidas muestran una alerta; datos incompletos del login muestran errores por campo; un error al cargar la lista muestra un mensaje; una falla al crear o eliminar muestra un mensaje de error; una ruta inexistente muestra `ErrorPage`.

### 3.3 Casos de uso relevantes

| ID | Actor | Precondiciones | Resultado esperado |
|---|---|---|---|
| CU-001 Iniciar sesión | Soporte o Gerencia | Usuario registrado y datos válidos | Sesión almacenada y acceso al dashboard |
| CU-002 Consultar clientes | Usuario autenticado | Sesión válida y API disponible | Lista visible, búsqueda y contador de resultados |
| CU-003 Ver ficha | Usuario autenticado | Cliente existente e identificador válido | Datos completos del cliente visibles |
| CU-004 Crear cliente | Usuario autenticado | Campos completos y API disponible | `POST` ejecutado, mensaje de éxito y formulario limpiado |
| CU-005 Eliminar cliente | Gerencia | Sesión con sector Gerencia y cliente accesible | `DELETE` ejecutado y retorno a la lista |
| CU-006 Cerrar sesión | Usuario autenticado | Sesión vigente | Sesión eliminada y redirección al login |

## 4. Inventario técnico

### 4.1 Tecnologías y dependencias

- React 19.2.6 y React DOM.
- Vite 8 como servidor de desarrollo y empaquetador.
- React Router DOM 7.18 para navegación y rutas.
- React Bootstrap 2.10.10 y Bootstrap 5.3.8 para componentes y estilos base.
- Axios 1.18.0 para la creación de clientes.
- Fetch API nativa para listado, detalle y eliminación.
- ESLint 10 con reglas de JavaScript, React Hooks y React Refresh.

### 4.2 Estructura del proyecto

| Ubicación | Responsabilidad |
|---|---|
| `src/main.jsx` | Montaje de React, `BrowserRouter`, Bootstrap y proveedor de autorización |
| `src/App.jsx` | Composición global de header, navegación, rutas y footer |
| `src/routes/routes.jsx` | Declaración de rutas públicas, protegidas y comodín |
| `src/pages/` | Vistas de login, dashboard, listado, detalle y error |
| `src/components/` | Componentes reutilizables, formulario y guardia de rutas |
| `src/context/` y `src/hooks/` | Estado de sesión y hook de acceso al contexto |
| `src/services/` | Autenticación local y alta remota de clientes |
| `src/css/` | Estilos específicos por área de la interfaz |
| `docs/` | Especificación y documentación del relevamiento |

### 4.3 Integraciones externas

- FakeStoreAPI: `GET /users`, `GET /users/:id`, `POST /users` y `DELETE /users/:id`.
- `localStorage` del navegador para sesión y rol.
- No se observó proveedor externo de autenticación ni backend propio.

## 5. Arquitectura y flujo de datos

### 5.1 Descripción de la arquitectura

La entrada de la aplicación monta un `AutorizacionesProvider` alrededor de `App`. `App` compone elementos persistentes y delega las vistas a React Router. `RutaProtegida` consulta el contexto y redirige cuando `admin` es nulo. Las páginas gestionan su propio estado con hooks de React. La lista y el detalle consultan la API con `fetch`, mientras que el formulario usa `clientesService` y Axios.

El contexto restaura `admin` desde `localStorage` al iniciar y sincroniza sus cambios. La autorización de la eliminación, sin embargo, no consulta el contexto: `DetalleCliente` lee directamente `role` desde `localStorage`.

### 5.2 Flujo por funcionalidad

| Funcionalidad | Entrada y componente | Estado/servicio | Respuesta y estados |
|---|---|---|---|
| Login | Formulario de `Login` | `email`, `password`, `sector`, `errores`; servicio local | Navega al dashboard o muestra errores/alerta |
| Listado | `ListaClientes` al montar | `clientes`, `busqueda`, `loading`, `error`; `GET` con Fetch | Carga, error o tabla filtrada; no presenta estado vacío explícito |
| Alta | `FormCliente` al enviar | Campos, `mensaje`, `error`, `loading`; Axios `POST` | Spinner durante la operación, mensaje y limpieza del formulario |
| Detalle | `DetalleCliente` según `id` | `cliente`, `mensaje`; `GET` con Fetch | Carga y ficha; no diferencia error, cliente inexistente o respuesta inválida |
| Baja | Botón de `DetalleCliente` para Gerencia | `mensaje`; Fetch `DELETE` | Mensaje y retorno diferido a clientes si `response.ok` |
| Cierre | Botón de `Header` | `cerrarSesion` del contexto | Elimina sesión y navega a login |

## 6. Evaluación del código

### 6.1 Corrección y comportamiento

- [x] Las rutas principales están declaradas para las vistas esperadas.
- [x] Las rutas protegidas redirigen cuando no existe `admin`.
- [ ] El control de autorización de eliminación es confiable: depende de `localStorage` manipulable.
- [x] El login valida campos obligatorios, formato de email y requisitos básicos de contraseña.
- [ ] El formulario de clientes no valida formato, longitud ni contenido de teléfono, nombre o ciudad.
- [ ] El detalle no verifica `response.ok` ni captura fallas de red.
- [ ] No hay estado de error ni de cliente inexistente en el detalle.
- [x] El listado y el alta muestran estados de carga.
- [ ] El dashboard muestra contadores fijos (`10`, `3`, `3`) y no datos derivados de la API.

### 6.2 Mantenibilidad

- [x] Las páginas y componentes tienen responsabilidades identificables.
- [ ] El acceso a la API está dividido entre un servicio Axios y llamadas Fetch directas.
- [ ] `App.jsx` importa `useAutorizaciones` sin utilizarlo.
- [ ] `routes.jsx` importa `Navigate` sin utilizarlo.
- [ ] `DetalleCliente.jsx` declara un parámetro `error` no utilizado en el `catch`.
- [ ] El contexto exporta componente y contexto desde el mismo archivo, lo que activa la regla de React Refresh.
- [ ] Existen estados y decisiones de autorización duplicados entre contexto y `localStorage`.

### 6.3 Calidad y seguridad

- [ ] Las credenciales de prueba están expuestas en el código fuente.
- [ ] La contraseña del cliente se muestra en la ficha.
- [ ] La autenticación y los permisos se resuelven únicamente en el cliente.
- [ ] Los errores de API no se normalizan con un contrato común.
- [ ] No se encontró evidencia de pruebas de teclado, lector de pantalla o foco visible.
- [x] No se observaron secretos de infraestructura en los archivos revisados.

### 6.4 Rendimiento

- [x] La lista se obtiene una sola vez por montaje.
- [ ] No hay paginación ni estrategia para listas grandes.
- [ ] No hay cancelación de solicitudes al desmontar o cambiar de cliente.
- [x] Se muestran indicadores de carga en listado, formulario y detalle.
- [x] La compilación de producción finalizó correctamente.

## 7. Hallazgos

| ID | Prioridad | Hallazgo | Evidencia |
|---|---|---|---|
| H-001 | Alta | Credenciales fijas y contraseñas almacenadas en código fuente | `src/services/autorizacionesServices.js` |
| H-002 | Alta | La autorización de eliminación puede alterarse modificando `localStorage.role` | `src/pages/DetalleCliente.jsx` |
| H-003 | Alta | La contraseña del cliente se expone en la ficha | `src/pages/DetalleCliente.jsx` |
| H-004 | Media | El detalle no maneja estados de error, respuesta HTTP inválida ni cliente no encontrado | `src/pages/DetalleCliente.jsx` |
| H-005 | Media | El dashboard presenta indicadores hardcodeados que pueden contradecir la API | `src/pages/Dashboard.jsx` |
| H-006 | Media | El alta solo comprueba campos no vacíos y no presenta validaciones de negocio | `src/components/FormCliente.jsx` |
| H-007 | Media | Se mezclan Fetch y Axios sin una capa de acceso uniforme | `src/pages/ListaClientes.jsx`, `src/pages/DetalleCliente.jsx`, `src/services/clientesService.js` |
| H-008 | Baja | `npm run lint` falla por cuatro errores de ESLint | `src/App.jsx`, `src/context/AutorizacionesContext.jsx`, `src/pages/DetalleCliente.jsx`, `src/routes/routes.jsx` |
| H-009 | Baja | No existe estado vacío explícito para una búsqueda sin coincidencias | `src/pages/ListaClientes.jsx` |

## 8. Oportunidades de mejora

### Correcciones

| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-001 | Eliminar credenciales reales del frontend y delegar autenticación en backend | Seguridad | L | Backend y contrato de autenticación | Alta |
| M-002 | Aplicar autorización en backend y derivar permisos de la sesión confiable | Seguridad | L | Backend, roles y tokens | Alta |
| M-003 | Ocultar contraseñas y datos sensibles en la ficha | Privacidad y seguridad | S | Definir campos permitidos | Alta |
| M-004 | Centralizar llamadas HTTP y manejar códigos, errores y cancelación | Consistencia y estabilidad | M | Elegir Fetch o Axios | Media |
| M-005 | Completar validación del formulario y estados de error/vacío del detalle | Calidad de datos y UX | M | Reglas de negocio | Media |

### Refactorizaciones

| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-006 | Resolver los cuatro errores de ESLint y separar contexto de proveedor | Mantenibilidad y feedback confiable | S | Ninguna | Media |
| M-007 | Unificar la fuente de verdad del usuario autenticado | Menor duplicación y autorización más clara | M | M-002 | Media |

### Nuevas capacidades

| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-008 | Calcular indicadores del dashboard desde datos reales | Información confiable | M | API de consulta | Media |
| M-009 | Agregar edición, paginación y filtros avanzados | Gestión operativa completa | L | API persistente | Baja |

### Prevención

| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-010 | Incorporar pruebas de rutas, formularios y servicios | Detección temprana de regresiones | M | Infraestructura de testing | Media |
| M-011 | Verificar accesibilidad y responsive en navegadores y tamaños representativos | Alcance y usabilidad | M | Pruebas manuales o automatizadas | Media |

## 9. Plan de acción

| Orden | Acción | Hallazgo u oportunidad | Responsable | Criterio de aceptación | Estado |
|---:|---|---|---|---|---|
| 1 | Corregir errores de lint | H-008 / M-006 | Equipo de desarrollo | `npm run lint` finaliza sin errores | Pendiente |
| 2 | Definir autenticación y autorización del lado servidor | H-001 / H-002 / M-001 / M-002 | Equipo de desarrollo | Usuarios, roles y permisos no son manipulables desde el navegador | Pendiente |
| 3 | Retirar contraseñas de respuestas y vistas | H-003 / M-003 | Equipo de desarrollo | La ficha nunca muestra credenciales | Pendiente |
| 4 | Normalizar estados de API | H-004 / H-007 / M-004 / M-005 | Equipo de desarrollo | Error HTTP, red, carga, vacío y éxito tienen mensajes verificables | Pendiente |
| 5 | Reemplazar contadores fijos por datos reales | H-005 / M-008 | Equipo de desarrollo | Los indicadores coinciden con la fuente de datos | Pendiente |
| 6 | Agregar pruebas y revisión visual | M-010 / M-011 | Equipo de desarrollo | Flujos principales cubiertos y verificados en desktop y móvil | Pendiente |

### Definition of Done

- [ ] El cambio tiene una descripción clara.
- [ ] Se actualizó o agregó la prueba correspondiente.
- [ ] `npm run lint` finaliza correctamente.
- [ ] `npm run build` finaliza correctamente.
- [ ] Se verificaron los flujos afectados.
- [ ] Se revisaron accesibilidad y responsive.
- [x] La documentación inicial quedó actualizada con este relevamiento.

## 10. Validación y evidencias

### Comandos ejecutados

- `npm run lint`: falla con 4 errores de ESLint en `App.jsx`, `AutorizacionesContext.jsx`, `DetalleCliente.jsx` y `routes.jsx`.
- `npm run build`: finaliza correctamente con Vite; genera `dist/` y los archivos JavaScript/CSS de producción.

### Evidencias

- Capturas o videos: no realizados en esta etapa.
- Logs relevantes: salida de ESLint registrada durante el relevamiento.
- Resultados de pruebas: no hay suite automatizada configurada.
- Comparación antes/después: no aplica al relevamiento inicial.

## 11. Conclusión

### Estado general

La aplicación cuenta con una base funcional clara para una demostración académica: tiene navegación SPA, rutas protegidas, login con validación, consulta de clientes, alta, baja condicionada por sector y estados básicos de carga/error. La compilación de producción es correcta.

El riesgo principal está en el modelo de seguridad: usuarios, contraseñas y permisos viven en el cliente, y además se exponen credenciales de clientes. En segundo lugar, el manejo de errores de detalle y la falta de persistencia real pueden producir resultados engañosos. La calidad técnica inmediata también requiere resolver los cuatro errores de lint.

### Próximos pasos

1. Resolver los hallazgos de seguridad altos y los errores de lint.
2. Definir un backend o servicio de autenticación con autorización real.
3. Unificar y robustecer el acceso a la API.
4. Agregar pruebas para login, rutas protegidas, CRUD y estados de error.
5. Verificar accesibilidad, responsive y datos reales del dashboard.

## 12. Historial del documento

| Fecha | Responsable | Cambios | Versión |
|---|---|---|---|
| 2026-09-03 | Miranda Cesar German | Relevamiento inicial basado en código y validación de lint/build | 0.1 |