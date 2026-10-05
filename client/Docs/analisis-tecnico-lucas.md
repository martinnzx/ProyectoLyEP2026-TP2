# Relevamiento, comprensión y mejora de la aplicación

## 1. Datos generales

| Dato | Valor |
|------------------------|------------------------------|
| Nombre                 | Sistema Web de Gestión de Clientes |
| Versión del proyecto   | 0.0.0                        |
| Tipo de aplicación     | SPA web                      |
| Repositorio            | Repositorio del equipo (Fork / Remota configurada) |
| Fecha del relevamiento | 2026-09-03                   |
| Responsable            | Lucas Tiziano Gallo          |

El relevamiento se realizó mediante la lectura estática del código fuente, el análisis de la arquitectura de componentes y la ejecución local de las herramientas de compilación y linting.

## 2. Objetivo y alcance

### 2.1 Objetivo de la aplicación
La aplicación ofrece un panel para usuarios internos autenticados con el fin de consultar, listar, crear y eliminar registros de clientes. Su propósito es centralizar operaciones CRUD mediante el consumo de FakeStoreAPI bajo un esquema de rutas protegidas según el rol del usuario.

### 2.2 Alcance funcional

**Funcionalidades incluidas:**
- Autenticación mediante credenciales locales y persistencia de la sesión en `localStorage`.
- Panel de control (Dashboard) con vistas generales.
- Listado de clientes obtenido desde la API remota con filtrado local por parámetros básicos.
- Consulta de fichas individuales de clientes y alta de nuevos registros mediante peticiones HTTP.
- Eliminación de registros restringida al sector de Gerencia.

**Funcionalidades no incluidas o incompletas:**
- No existe un backend propio, base de datos ni persistencia real de registros.
- Falta de un módulo formal de edición de datos, paginación o filtros avanzados.
- El modelo de permisos depende directamente de variables almacenadas en el cliente, lo que limita su seguridad.

### 2.3 Criterios de éxito
| Criterio | Evaluación inicial |
|---|---|
| Cada operación informa su resultado | Parcial: el alta y la baja muestran alertas, pero faltan controles robustos de códigos de error HTTP |
| Rutas protegidas | Implementadas correctamente mediante guardias de navegación (`RutaProtegida`) |
| Validación de entradas | Parcial: el login valida formato básico, pero el formulario de clientes carece de validación preventiva de campos |
| Manejo de errores | Parcial: requiere centralizar la captura de excepciones de red en la capa de servicios |
| Persistencia | Limitada a la sesión en `localStorage`; los datos de clientes dependen enteramente de la API externa |

## 3. Usuarios y procesos

### 3.1 Usuarios
- **Soporte (3 usuarios fijos):** Permisos de acceso al dashboard, listado, búsqueda, consulta de fichas y alta de clientes.
- **Gerencia (3 usuarios fijos):** Hereda los privilegios de Soporte e incorpora la capacidad de eliminar registros desde la ficha de detalle.

### 3.2 Flujo principal
1. El usuario accede a la vista de autenticación (`/login`).
2. Ingresa sus credenciales, las cuales son validadas contra el servicio local.
3. Si son correctas, se almacena la sesión y se redirige al dashboard.
4. Desde allí se accede a la sección de clientes para consultar, filtrar, crear o eliminar registros.
5. El cierre de sesión limpia las variables locales y redirige al login.

### 3.3 Casos de uso relevantes
| ID | Actor | Precondiciones | Resultado esperado |
|---|---|---|---|
| CU-001 Iniciar sesión | Soporte o Gerencia | Credenciales válidas | Sesión almacenada y acceso al dashboard |
| CU-002 Consultar clientes | Usuario autenticado | Sesión activa y API disponible | Lista de registros visible con opción de búsqueda |
| CU-003 Crear cliente | Usuario autenticado | Datos provistos y API accesible | Petición POST ejecutada con éxito y formulario limpio |

## 4. Inventario técnico

### 4.1 Tecnologías y dependencias
- React y Vite como entorno de desarrollo y empaquetador.
- React Router DOM para la gestión de rutas y navegación.
- Bootstrap y React Bootstrap para componentes visuales y estilos.
- Axios y Fetch API para el intercambio de datos con servicios web.
- ESLint para el control de calidad estática del código.

### 4.2 Estructura del proyecto
| Ubicación | Responsabilidad |
|---|---|
| `src/main.jsx` | Montaje principal, router y proveedor de contexto |
| `src/App.jsx` | Composición global de layouts, navegación y rutas |
| `src/pages/` | Vistas principales (Login, Dashboard, Listas, Detalle, Errores) |
| `src/components/` | Componentes reutilizables, formularios y control de acceso |
| `src/services/` | Lógica de autenticación y comunicación con endpoints externos |
| `src/routes/` | Declaración de rutas públicas y protegidas |

### 4.3 Integraciones externas
- Consumo de endpoints REST en FakeStoreAPI.
- Almacenamiento local del navegador (`localStorage`) para persistencia de sesión.

## 5. Arquitectura y flujo de datos

### 5.1 Descripción de la arquitectura
La aplicación sigue una estructura basada en componentes funcionales de React organizados por carpetas de responsabilidad. El contexto de autorización administra la sesión y restringe las rutas mediante guardias lógicas, mientras que las vistas consumen servicios de red de forma independiente.

### 5.2 Flujo por funcionalidad
- **Formulario de Clientes (`FormCliente.jsx`):** Captura la entrada del usuario, procesa la estructura de datos y ejecuta una petición POST mediante Axios, reflejando estados de carga y mensajes operativos.

## 6. Evaluación del código

### 6.1 Corrección y comportamiento
- [x] Las rutas llevan a las vistas esperadas y rechazan accesos no autorizados.
- [ ] Los formularios carecen de validaciones preventivas completas del lado del cliente.
- [ ] El manejo de errores de red en peticiones asíncronas no está completamente normalizado.

### 6.2 Mantenibilidad
- [x] Los componentes mantienen responsabilidades razonablemente separadas.
- [ ] Conviven llamadas directas por `Fetch` y servicios con `Axios` de forma descentralizada.

### 6.3 Calidad y seguridad
- [ ] Las credenciales y roles de prueba se encuentran expuestos en el código fuente.
- [ ] La seguridad de los permisos depende por completo de variables locales manipulables.

### 6.4 Rendimiento
- [x] Se incorporan indicadores visuales de carga en operaciones asíncronas principales.
- [ ] No se implementan estrategias de paginación para conjuntos amplios de datos.

## 7. Hallazgos

| ID | Prioridad | Hallazgo | Evidencia |
|---|---|---|---|
| H-001 | Alta | Falta de validación estricta de campos en el formulario de alta | `src/components/FormCliente.jsx` |
| H-002 | Alta | Credenciales y roles expuestos directamente en el código fuente | `src/services/autorizacionesServices.js` |
| H-003 | Media | Uso mixto y no normalizado de tecnologías de red (`Fetch` y `Axios`) | Capa de servicios y páginas |

## 8. Oportunidades de mejora

### Correcciones
| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-001 | Implementar validación de datos en formulario de clientes | Integridad de datos y mejor UX | M | Ninguna | Alta |
| M-002 | Centralizar y unificar las peticiones HTTP y manejo de errores | Consistencia del código | M | Definir cliente HTTP único | Alta |

### Refactorizaciones
| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-003 | Aislar la lógica de autenticación fuera del almacenamiento local expuesto | Mayor seguridad operativa | L | Backend de auth | Alta |

### Nuevas capacidades y Prevención
| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-004 | Agregar pruebas unitarias básicas para componentes y rutas | Detección temprana de fallos | M | Configurar testing | Media |

## 9. Plan de acción

| Orden | Acción | Hallazgo u oportunidad | Responsable | Criterio de aceptación | Estado |
|---:|---|---|---|---|---|
| 1 | Desarrollar validaciones preventivas en formularios | H-001 / M-001 | Lucas Tiziano Gallo | Formulario bloquea datos vacíos y avisa al usuario | En curso |
| 2 | Normalizar manejo de peticiones de red | H-003 / M-002 | Equipo de desarrollo | Servicios HTTP unificados | Pendiente |

### Definition of Done
- [ ] El cambio cuenta con descripción clara y commits semánticos.
- [ ] `npm run lint` finaliza sin errores.
- [ ] `npm run build` compila correctamente.
- [ ] Flujos afectados verificados localmente.

## 10. Validación y evidencias
- **Comandos ejecutados:** `npm run lint`, `npm run build`.
- **Evidencias:** Compilación de producción completada con éxito mediante Vite en entorno local.

## 11. Conclusión
### Estado general
La aplicación cuenta con una base sólida a nivel de interfaz y navegación SPA para entornos académicos, pero requiere mejoras clave en el control de validaciones de entrada y en la seguridad de los datos almacenados en el cliente.

### Próximos pasos
1. Resolver las validaciones pendientes en los formularios de entrada.
2. Unificar los servicios de comunicación asíncrona.
3. Evaluar mejoras de seguridad en la gestión de sesiones.

## 12. Historial del documento

| Fecha | Responsable | Cambios | Versión |
|---|---|---|---|
| 2026-09-03 | Lucas Tiziano Gallo | Relevamiento y análisis técnico inicial | 0.1 |