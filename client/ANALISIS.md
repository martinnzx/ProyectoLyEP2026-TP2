# Relevamiento técnico consolidado

## 1. Datos generales y fecha de consolidación

| Campo | Detalle |
|---|---|
| Sistema | Panel de Control de Clientes |
| Versión | 0.0.0 |
| Tipo | SPA web desarrollada con React y Vite |
| Fecha de consolidación | 2026-09-10 |
| Responsable | Miranda Cesar German |
| Fuentes analizadas | F-001, F-002, F-003, F-004, F-005 |
| Documento base | [spec_02.md](spec_02.md) |
| Alcance | Consolidación documental de evaluaciones técnicas conforme a la especificación de compatibilización y trazabilidad |

La consolidación se realizó con base en los cinco relevamientos técnicos del equipo y siguiendo el procedimiento de compatibilización, clasificación de hallazgos, resolución de discrepancias y registro de acciones definido en [spec_02.md](spec_02.md).

## 2. Fuentes analizadas y metodología aplicada

| ID | Documento | Responsable | Fecha informada | Enfoque principal |
|---|---|---|---|---|
| F-001 | [analisis-tecnico-lucas.md](../analisis-tecnico-lucas.md) | Lucas Tiziano Gallo | 2026-09-03 | Funcionamiento, arquitectura, calidad y plan inicial de mejoras |
| F-002 | [analisis-tecnico-Mamani-Mariano-Martin.md](../analisis-tecnico-Mamani-Mariano-Martin.md) | Mamani Mariano Martin | 2026-09-07 | Seguridad, mantenibilidad, calidad estática y arquitectura |
| F-003 | [analisis-tecnico-valentin-iriarte.md](../analisis-tecnico-valentin-iriarte.md) | Valentín Iriarte | 2026-09-08 | Integridad de datos, asincronía, dependencias y consistencia entre componentes |
| F-004 | [analisis-tecnico-valentin-lozano.md](../analisis-tecnico-valentin-lozano.md) | Valentín Lozano | 2026-09-08 | Rendimiento, accesibilidad, semántica, SEO, CSS, responsive y testing |
| F-005 | [relevamiento_Miranda/doc_01.md](../relevamiento_Miranda/doc_01.md) | Miranda Cesar German | 2026-09-03 | Relevamiento inicial funcional, técnico, de seguridad y plan de acción |

### Metodología aplicada

1. Se revisaron íntegramente las cinco fuentes mencionadas.
2. Cada observación se normalizó a una dimensión principal según la taxonomía de [spec_02.md](spec_02.md).
3. Se agruparon hallazgos equivalentes y se conservaron observaciones complementarias.
4. Se clasificaron por compatibilidad: coincidente, complementaria, particular, divergente o pendiente de verificación.
5. Se aplicaron las reglas de resolución de discrepancias: evidencia reproducible antes que interpretación general; pruebas documentadas sobre suposiciones; y estado pendiente cuando no hay evidencia suficiente.
6. Se registraron solamente hallazgos relacionados con el estado real del repositorio y con verificaciones explícitamente informadas por las fuentes.
7. Las recomendaciones se separaron de los hallazgos y se desagregaron en acciones atómicas con criterio de aceptación verificable.

## 3. Resumen ejecutivo del estado encontrado

El sistema analizado corresponde a una SPA de gestión de clientes construida con React y Vite. Tiene un flujo funcional básico de login, listado, detalle, alta y baja, con control de acceso por roles y persistencia local. El proyecto resulta apropiado como prototipo académico para validar conceptos de frontend, rutas protegidas y consumo de API, pero no presenta condiciones suficientes para ser considerado seguro, consistente o mantenible en un entorno productivo.

Los riesgos más relevantes se concentran en cuatro ejes:

1. Seguridad: credenciales del frontend, roles manipulables y exposición de contraseñas.
2. Integridad de datos: alta con payload incompleto y detalle que no maneja datos inconsistentes.
3. Resiliencia y calidad: ausencia de manejo sólido de errores, concurrencia y cancelación de peticiones.
4. Calidad no funcional: accesibilidad, semántica, CSS responsive y pruebas automatizadas insuficientes.

El estado general del proyecto se evalúa como "funcional en demostración, no confiable en producción".

## 4. Alcance funcional y actores

### 4.1 Alcance funcional

- Login con email, contraseña y sector.
- Persistencia de sesión con `localStorage`.
- Dashboard con información del usuario y contadores de referencia.
- Listado y búsqueda de clientes desde una API externa.
- Consulta de detalle de cliente.
- Alta de cliente mediante `POST`.
- Baja de cliente mediante `DELETE` condicionada a permisos de sector.
- Cierre de sesión y vista de error cuando la ruta no existe.

### 4.2 Actores observados

- Soporte: consulta, búsqueda y alta de clientes.
- Gerencia: además de lo anterior, acceso a baja de clientes.
- Usuario final de la aplicación web.
- Equipo de desarrollo: responsable de mantenimiento, configuración y correcciones.

### 4.3 Límites observados

No se identificaron backend propio, edición de clientes, paginación real, ordenamiento configurable, recuperación de contraseña ni suite automatizada. La API pública se utiliza como simulador de persistencia y no reemplaza una capa de negocio real.

## 5. Arquitectura e integraciones

La aplicación monta una estructura basada en `BrowserRouter`, `AutorizacionesProvider` y componentes de páginas. La separación de carpetas es razonable para un ejercicio académico y refleja una división entre páginas, componentes, servicios, rutas, contexto y CSS.

### Principales módulos y responsabilidades

| Área | Responsabilidad |
|---|---|
| `src/pages/` | Login, dashboard, listado, detalle, error |
| `src/components/` | Header, Nav, FormCliente, RutaProtegida |
| `src/context/` | Estado de autorización y sesión |
| `src/hooks/` | Lógica reutilizable y acceso al contexto |
| `src/services/` | Autenticación y alta de clientes |
| `src/css/` | Estilos por módulo |
| `Docs/` | Relevamientos y especificaciones |

### Integraciones y dependencias relevantes

- FakeStoreAPI como fuente de clientes.
- `localStorage` como almacenamiento de sesión y rol.
- React Router DOM para navegación.
- Axios y Fetch en distintos puntos del código.
- Bootstrap y React Bootstrap para componentes visuales.

### Observación arquitectónica importante

La URL de la API se encuentra hardcodeada en varios archivos y la configuración por entorno no queda claramente separada. Esto aumenta riesgo de inconsistencias y dificulta la migración a un backend real.

## 6. Criterios de evaluación consolidados

| Dimensión | Estado consolidado | Fundamentación |
|---|---|---|
| FUN | Parcial | Existen los flujos principales, pero el alta no sincroniza el listado y la búsqueda es limitada |
| DAT | Deficiente | El alta envía un payload incompleto y el detalle asume estructuras anidadas que no siempre existen |
| ARC | Parcial | La arquitectura es entendible, pero la autenticación y autorización están duplicadas y hay mezcla de clientes HTTP |
| SEG | Crítico | Las credenciales y permisos dependen del frontend y se exponen datos sensibles |
| ERR | Deficiente | Faltan errores claros, cancelación y manejo consistente de respuestas no exitosas |
| MAN | Deficiente | Se reportan errores de lint, duplicación de URLs y mezcla de patrones de acceso a datos |
| PER | Parcial | El alcance es pequeño, pero hay deuda en renderizado, filtrado y escalabilidad |
| A11Y | No cumplido | No hay suficiente semántica ni soporte accesible en formularios y navegación |
| UX | Parcial | Hay feedback básico, pero no existen estados vacíos ni mensajes uniformes |
| CSS | No cumplido | Hay estilos globales, valores repetidos y poca adaptación responsive |
| SEO | No cumplido | El HTML y los metadatos no están alineados con la aplicación |
| DEP | Pendiente de verificación | Se reporta auditoría de dependencias con vulnerabilidades altas, pero requiere validación actual |
| TST | No cumplido | No existe infraestructura automatizada de pruebas reportada |

## 7. Matriz de cobertura requerida

| Dimensión | F-001 | F-002 | F-003 | F-004 | F-005 | Resultado consolidado | Verificación adicional |
|---|---|---|---|---|---|---|---|
| FUN | Aporta | Aporta | Aporta | Complementa | Aporta | H-001, H-002, H-003 | Validar alta/listado en flujo real |
| DAT | Aporta | Aporta | Coincide | Aporta | Aporta | H-002, H-003, H-007 | Validar payload de alta y detalle |
| ARC | Aporta | Coincide | Aporta | Complementa | Coincide | H-004, H-005, H-011 | Revisar separación de responsabilidades |
| SEG | Coincide | Coincide | Aporta | Complementa | Coincide | H-004, H-005, H-006, H-007, H-008 | Validar backend real y permisos |
| ERR | Aporta | Coincide | Coincide | Aporta | Coincide | H-003, H-009, H-010, H-014 | Probar red lenta y errores HTTP |
| MAN | Aporta | Coincide | Aporta | Complementa | Coincide | H-005, H-011 | Ejecutar lint y revisar configuración |
| PER | Aporta | Aporta | Aporta | Coincide | Aporta | H-010, H-012 | Medir rendimiento frente a volumen mayor |
| A11Y | No tratado | No tratado | Aporta | Coincide | No tratado | H-013 | Validar con lector de pantalla y contraste |
| UX | Aporta | Aporta | Aporta | Coincide | Aporta | H-001, H-009, H-014 | Probar estados de carga, vacío y error |
| CSS | No tratado | No tratado | Aporta | Coincide | No tratado | H-015 | Revisar responsive en pantallas chicas |
| SEO | No tratado | No tratado | Aporta | Coincide | No tratado | H-016 | Ajustar HTML y metadatos |
| DEP | No tratado | No tratado | Particular | Aporta | No tratado | H-017 | Ejecutar `npm audit` vigente |
| TST | Aporta | Aporta | Aporta | Coincide | Aporta | H-018 | Definir suite mínima de pruebas |

## 8. Hallazgos consolidados, ordenados por prioridad y severidad

### H-001 - El alta exitosa no actualiza el listado

- **Dimensión principal:** FUN
- **Compatibilidad:** Coincidente
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-001, F-003, F-005
- **Ubicación:** `src/components/FormCliente.jsx`, `src/pages/ListaClientes.jsx`
- **Descripción:** El formulario de alta crea un cliente localmente, pero el listado no se actualiza al momento de la operación ni recibe un mecanismo de sincronización.
- **Causa raíz:** El formulario y el listado mantienen estado desacoplado.
- **Impacto:** El usuario puede creer que la operación falló y la información no se refleja en la vista.
- **Evidencia:** F-003 documenta la ausencia de un callback o canal de actualización; F-005 lo reporta como flujo funcional incompleto.
- **Verificación pendiente:** Validar el comportamiento en la UI tras un POST exitoso.

### H-002 - El payload del alta es incompleto y frágil

- **Dimensión principal:** DAT
- **Compatibilidad:** Complementaria
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-003, F-004
- **Ubicación:** `src/components/FormCliente.jsx`, `src/pages/DetalleCliente.jsx`, `src/pages/ListaClientes.jsx`
- **Descripción:** El alta fija `lastname` en `"-"` y envía solo parte del modelo esperado; el detalle y la búsqueda asumen estructuras anidadas que no siempre existen.
- **Causa raíz:** Falta de contrato unificado entre alta, detalle y listado.
- **Impacto:** Inconsistencias de datos y posible falla por acceso a propiedades nulas.
- **Evidencia:** F-003 despliega el payload incompleto y F-004 señala la ausencia de validación defensiva.
- **Verificación pendiente:** Validar el esquema de cliente esperado y probar casos con datos incompletos.

### H-003 - El detalle no maneja errores, vacíos y respuestas no válidas

- **Dimensión principal:** ERR
- **Compatibilidad:** Coincidente
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** `src/pages/DetalleCliente.jsx`
- **Descripción:** La vista de detalle no distingue entre cliente inexistente, error HTTP, error de red y respuesta inválida.
- **Causa raíz:** Falta de estados explícitos y validación de `response.ok` y de propiedades anidadas.
- **Impacto:** Pantalla en estado ambiguo o error de render en datos incompletos.
- **Evidencia:** Las fuentes coinciden en la ausencia de manejo de errores y estados vacíos.
- **Verificación pendiente:** Probar 404, 500 y payload incompleto.

### H-004 - La autorización de eliminación depende de un valor manipulable en el cliente

- **Dimensión principal:** SEG
- **Compatibilidad:** Coincidente
- **Severidad:** Crítica
- **Prioridad:** Inmediata
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** `src/pages/DetalleCliente.jsx`, `src/context/AutorizacionesContext.jsx`, `localStorage`
- **Descripción:** La baja se controla mediante valores de sesión/rol en el frontend, sin una autoridad del lado servidor.
- **Causa raíz:** Doble fuente de verdad entre contexto y `localStorage` y ausencia de validación real del servidor.
- **Impacto:** Un usuario puede alterar el rol en el navegador y manipular la visibilidad o permisos.
- **Evidencia:** F-003 y F-005 documentan la lectura directa de `localStorage.role` y los demás análisis ratifican la estructura.
- **Verificación pendiente:** Definir la autorización real en backend o identidad externa.

### H-005 - La sesión y el rol quedan parcialmente inconsistentes

- **Dimensión principal:** SEG
- **Compatibilidad:** Complementaria
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-003, F-005
- **Ubicación:** `src/context/AutorizacionesContext.jsx`, `src/pages/Login.jsx`, `src/pages/DetalleCliente.jsx`
- **Descripción:** El cierre elimina una clave de sesión, pero no siempre limpia el rol o deja la lógica de autorización repartida entre varios mecanismos.
- **Causa raíz:** Persistencia fragmentada del estado de sesión.
- **Impacto:** Estado zombi entre sesiones y mayor complejidad para racionalizar permisos.
- **Evidencia:** F-003 documenta la secuencia de escritura y limpieza; F-005 reporta la inconsistencia de sesión/rol.
- **Verificación pendiente:** Ejecutar login/logout en varias combinaciones de usuarios y roles.

### H-006 - Las credenciales internas están expuestas en el frontend

- **Dimensión principal:** SEG
- **Compatibilidad:** Coincidente
- **Severidad:** Crítica
- **Prioridad:** Inmediata
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-005
- **Ubicación:** `src/services/autorizacionesServices.js`
- **Descripción:** Los usuarios y sus contraseñas se encuentran embebidos en el código descargado por el navegador.
- **Causa raíz:** La autenticación se implementa únicamente en el cliente.
- **Impacto:** Es posible inspeccionar el bundle y reutilizar credenciales válidas.
- **Evidencia:** Los documentos de análisis describen el arreglo local de usuarios y contraseñas.
- **Verificación pendiente:** Evaluar la migración a backend o proveedor de identidad.

### H-007 - Se exponen contraseñas de clientes y la alta crea una contraseña fija

- **Dimensión principal:** SEG
- **Compatibilidad:** Coincidente
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** `src/pages/DetalleCliente.jsx`, `src/components/FormCliente.jsx`
- **Descripción:** La ficha muestra la contraseña del cliente y el alta asigna una clave predecible (`"1234"`).
- **Causa raíz:** El modelo de datos no separa campos sensibles de la representación de información pública.
- **Impacto:** Revelación de credenciales y generación de registros con una contraseña fácilmente adivinada.
- **Evidencia:** F-003 y F-005 reportan la exposición; F-002 analiza el riesgo de datos sensibles en la aplicación.
- **Verificación pendiente:** Confirmar la política del backend para excluir o cifrar campos sensibles.

### H-008 - El modelo de seguridad no es confiable para producción

- **Dimensión principal:** SEG
- **Compatibilidad:** Coincidente
- **Severidad:** Crítica
- **Prioridad:** Inmediata
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** Frontend, `localStorage`, FakeStoreAPI
- **Descripción:** Autenticación, roles y permisos se resuelven en la capa cliente y no hay una frontera de confianza del lado servidor.
- **Causa raíz:** Falta de backend y de flujo de autenticación real.
- **Impacto:** Las protecciones visuales pueden evadirse y no hay garantía de autorización sobre acciones remotas.
- **Evidencia:** Las cinco fuentes coinciden en la ausencia de una capa de seguridad real.
- **Verificación pendiente:** Definir la arquitectura final de autenticación/ autorización.

### H-009 - La baja admite múltiples ejecuciones y no informa todos los errores

- **Dimensión principal:** ERR
- **Compatibilidad:** Complementaria
- **Severidad:** Media
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-003, F-005
- **Ubicación:** `src/pages/DetalleCliente.jsx`
- **Descripción:** El botón de eliminación no se deshabilita durante la operación y pueden dispararse varios `DELETE` seguidos, con mensajes inconsistentes ante respuestas no exitosas.
- **Causa raíz:** Falta de bloqueo de acción concurrente y manejo uniforme de errores HTTP.
- **Impacto:** Duplicación de peticiones y experiencia de usuario confusa.
- **Evidencia:** F-003 analiza la función de eliminación; F-005 documenta el manejo incompleto de la baja.
- **Verificación pendiente:** Probar doble clic y respuestas 400/500.

### H-010 - Las peticiones asíncronas no tienen cancelación ni control del ciclo de vida

- **Dimensión principal:** ERR
- **Compatibilidad:** Coincidente
- **Severidad:** Media
- **Prioridad:** Media
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-004, F-005
- **Ubicación:** `src/pages/ListaClientes.jsx`, `src/pages/DetalleCliente.jsx`
- **Descripción:** No se documenta el uso de `AbortController` ni limpieza de temporizadores o peticiones al desmontar componentes.
- **Causa raíz:** Los efectos asíncronos no están vinculados al ciclo de vida del componente.
- **Impacto:** Respuestas tardías y estados obsoletos pueden interferir con la navegación actual.
- **Evidencia:** F-003 y F-004 proponen el agregado de cancelación como medida preventiva.
- **Verificación pendiente:** Simular navegación rápida con red lenta.

### H-011 - La calidad estática y la configuración presentan deuda técnica

- **Dimensión principal:** MAN
- **Compatibilidad:** Coincidente
- **Severidad:** Media
- **Prioridad:** Alta
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** `src/App.jsx`, `src/context/AutorizacionesContext.jsx`, servicios y routes
- **Descripción:** Se reportan errores de ESLint, URLs repetidas, mezcla de Fetch y Axios y exportaciones incompatibles con el flujo de React.
- **Causa raíz:** Ausencia de una capa HTTP común y de integración de calidad en el proyecto.
- **Impacto:** Código más difícil de mantener y configuración menos robusta ante cambios.
- **Evidencia:** f-001, F-002 y F-005 reportan lint fallido y build exitoso.
- **Verificación pendiente:** Ejecutar lint y build con el lockfile vigente.

### H-012 - El filtrado y el renderizado no escalan bien con más volumen de datos

- **Dimensión principal:** PER
- **Compatibilidad:** Complementaria
- **Severidad:** Media
- **Prioridad:** Baja
- **Estado:** Parcialmente confirmado
- **Fuentes:** F-001, F-003, F-004
- **Ubicación:** `src/pages/ListaClientes.jsx`
- **Descripción:** El filtrado se recalcula por cada cambio y no hay paginación ni memoización clara.
- **Causa raíz:** La implementación está diseñada para volúmenes pequeños y no contempla optimización de render.
- **Impacto:** Rendimiento degradado al crecer la cantidad de clientes o al aplicarse varios filtros.
- **Evidencia:** F-004 describe el problema de re-render y el crecimiento del volumen de datos.
- **Verificación pendiente:** Medir con dataset más grande.

### H-013 - La accesibilidad del proyecto no cumple una base mínima

- **Dimensión principal:** A11Y
- **Compatibilidad:** Complementaria
- **Severidad:** Media
- **Prioridad:** Alta
- **Estado:** Parcialmente confirmado
- **Fuentes:** F-003, F-004
- **Ubicación:** `src/pages/Login.jsx`, `src/components/FormCliente.jsx`, `src/pages/ListaClientes.jsx`, `src/components/Nav.jsx`
- **Descripción:** Hay etiquetas sin asociación explícita, mensajes sin `aria-live`, tabla sin caption, y contraste insuficiente en ciertos textos.
- **Causa raíz:** La accesibilidad no se incorporó como criterio de diseño ni validación.
- **Impacto:** Dificultad para usuarios con lector de pantalla o baja visión.
- **Evidencia:** F-004 reporta los casos y cuantifica contraste insuficiente.
- **Verificación pendiente:** Ejecutar auditoría y pruebas con teclado/lectores.

### H-014 - Faltan estados vacíos y feedback uniforme

- **Dimensión principal:** UX
- **Compatibilidad:** Coincidente
- **Severidad:** Baja
- **Prioridad:** Media
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-005
- **Ubicación:** `src/pages/ListaClientes.jsx`, `src/pages/DetalleCliente.jsx`, `src/pages/ErrorPage.jsx`
- **Descripción:** No hay estado vacío claro para búsquedas sin resultado, ni diferenciación clara entre carga, error y ausencia de dato.
- **Causa raíz:** La UI no define de forma consistente los estados de interfaz.
- **Impacto:** Usuario sin orientación sobre qué está ocurriendo.
- **Evidencia:** Los relevamientos coinciden en la falta de estados de carga/vacío/error.
- **Verificación pendiente:** Revisar comportamiento con filtro sin matches y falla de red.

### H-015 - El CSS no es mantenible ni responsive suficiente

- **Dimensión principal:** CSS
- **Compatibilidad:** Particular
- **Severidad:** Media
- **Prioridad:** Media
- **Estado:** Parcialmente confirmado
- **Fuentes:** F-004
- **Ubicación:** `src/css/*.css`
- **Descripción:** Hay valores repetidos, `!important`, selectores globales y ausencia de variables y media queries.
- **Causa raíz:** Estilos implementados sin tokens ni estrategia responsive.
- **Impacto:** Mantenimiento costoso y mala experiencia en pantallas pequeñas.
- **Evidencia:** F-004 documenta los ejemplos de estilos rígidos y falta de responsividad.
- **Verificación pendiente:** Probar en mobile y validar consistencia visual.

### H-016 - HTML, idioma y metadatos no reflejan la aplicación

- **Dimensión principal:** SEO
- **Compatibilidad:** Particular
- **Severidad:** Baja
- **Prioridad:** Media
- **Estado:** Parcialmente confirmado
- **Fuentes:** F-004
- **Ubicación:** `index.html`, `src/App.jsx`, páginas de la SPA
- **Descripción:** El idioma del documento está en inglés, faltan metadatos y la semántica HTML es limitada.
- **Causa raíz:** La capa de presentación no considera SEO ni semántica base.
- **Impacto:** Menor usabilidad para herramientas asistivas y peor identificación de la aplicación.
- **Evidencia:** F-004 reporta `lang="en"` y ausencia de `meta description` y estructuración semántica.
- **Verificación pendiente:** Revisar HTML final en build de producción.

### H-017 - Dependencias con vulnerabilidades reportadas requieren verificación actual

- **Dimensión principal:** DEP
- **Compatibilidad:** Particular
- **Severidad:** Alta
- **Prioridad:** Alta
- **Estado:** Pendiente de verificación
- **Fuentes:** F-003, F-004
- **Ubicación:** `package.json`, lockfile y dependencias del proyecto
- **Descripción:** Se reportan vulnerabilidades de severidad alta relacionadas con paquetes de la cadena de dependencias del frontend.
- **Causa raíz:** Dependencias no actualizadas según el análisis documental disponible.
- **Impacto:** Riesgo potencial de seguridad y estabilidad de la aplicación.
- **Evidencia:** F-003 reporta `npm audit` con vulnerabilidades altas; F-004 toma el tema como riesgo de dependencias.
- **Verificación pendiente:** Ejecutar `npm audit` vigente y revisar lockfile.

### H-018 - No existe infraestructura de pruebas automatizadas

- **Dimensión principal:** TST
- **Compatibilidad:** Coincidente
- **Severidad:** Media
- **Prioridad:** Media
- **Estado:** Confirmado
- **Fuentes:** F-001, F-002, F-003, F-004, F-005
- **Ubicación:** Proyecto completo
- **Descripción:** No se informa una suite automatizada para login, rutas, servicios, formulario, detalle, búsqueda y errores.
- **Causa raíz:** No se configuró framework ni estrategia de pruebas.
- **Impacto:** Regresiones en flujos críticos pueden pasar sin detección.
- **Evidencia:** Todos los análisis coinciden en la ausencia de pruebas automatizadas.
- **Verificación pendiente:** Definir y ejecutar una prueba mínima crítica.

## 9. Discrepancias, limitaciones y verificaciones pendientes

| Tema | Diferencia / limitación | Tratamiento consolidado |
|---|---|---|
| `npm audit` | Solo F-003 informa una auditoría concreta | H-017 queda pendiente de repetición con el entorno vigente |
| Alta de clientes | F-003 describe desincronización; otras fuentes consideran el flujo funcional | Se mantiene como H-001 y H-002 como defecto real de integración |
| Responsabilidad de permisos | El proyecto oculta o muestra botones según frontend | Se conserva como riesgo crítico de seguridad y se considera pendiente de backend |
| Cancelación y asincronía | Se informa como riesgo y no como defecto ejecutado | Se mantiene en H-010 como hallazgo confirmado por diseño y análisis estático |
| Accesibilidad y CSS | Solo F-004 detalla estos puntos de forma profunda | Se conserva como hallazgo particular con validación visual pendiente |
| Contratos de datos | No todas las fuentes profundizan el mismo nivel | Se consolida en H-002 sin afirmar que todos los datos sean siempre inválidos |

## 10. Oportunidades y acciones recomendadas

### A-001 - Mover la autenticación y autorización al backend

- **Hallazgos relacionados:** H-004, H-005, H-006, H-008
- **Tipo:** Corrección
- **Descripción:** Reemplazar credenciales y permisos del frontend por un mecanismo con backend o autenticación externa.
- **Beneficio esperado:** Reducir la posibilidad de manipulación de roles y credenciales.
- **Esfuerzo estimado:** L
- **Dependencias:** Backend, contrato de auth, roles y tokens.
- **Responsable:** Por definir
- **Criterio de aceptación:** Un usuario no puede ganar permisos modificando el navegador ni el bundle.
- **Prioridad:** Inmediata
- **Estado:** Pendiente
- **Orden:** 1

### A-002 - Retirar contraseñas de la UI y del modelo de clientes

- **Hallazgos relacionados:** H-007
- **Tipo:** Corrección
- **Descripción:** No renderizar ni devolver contraseñas en la aplicación ni en el alta.
- **Beneficio esperado:** Evitar exposición de información sensible.
- **Esfuerzo estimado:** M
- **Dependencias:** Definición del contrato de datos.
- **Responsable:** Por definir
- **Criterio de aceptación:** La ficha no muestra contraseñas y la alta no crea registros con clave fija.
- **Prioridad:** Inmediata
- **Estado:** Pendiente
- **Orden:** 2

### A-003 - Unificar el contrato de cliente y sincronizar el alta con el listado

- **Hallazgos relacionados:** H-001, H-002, H-003
- **Tipo:** Corrección
- **Descripción:** Definir un modelo común para cliente, validar payloads y actualizar el listado tras alta.
- **Beneficio esperado:** Consistencia de datos y feedback inmediato en la interfaz.
- **Esfuerzo estimado:** M
- **Dependencias:** Contrato de API y decisión sobre persistencia.
- **Responsable:** Por definir
- **Criterio de aceptación:** Un alta exitosa refleja la entidad creada sin romper el detalle ni la búsqueda.
- **Prioridad:** Alta
- **Estado:** Pendiente
- **Orden:** 3

### A-004 - Centralizar manejo de errores y estados de carga

- **Hallazgos relacionados:** H-003, H-009, H-010, H-014
- **Tipo:** Refactorización
- **Descripción:** Crear un flujo único de API con manejo de errores, cancelación, carga y vacíos.
- **Beneficio esperado:** Mejor UX y menos riesgo de render con datos inválidos.
- **Esfuerzo estimado:** M
- **Dependencias:** Elección del cliente HTTP y normalización de respuestas.
- **Responsable:** Por definir
- **Criterio de aceptación:** Cada flujo distingue carga, éxito, vacío, red fallida y respuesta no exitosa.
- **Prioridad:** Alta
- **Estado:** Pendiente
- **Orden:** 4

### A-005 - Resolver deuda técnica de lint y configuración

- **Hallazgos relacionados:** H-011, H-017
- **Tipo:** Refactorización
- **Descripción:** Corregir errores de ESLint, ajustar imports/exports y revisar configuración por entorno.
- **Beneficio esperado:** Mejora de mantenimiento y redución de riesgos de despliegue.
- **Esfuerzo estimado:** S/M
- **Dependencias:** Lockfile vigente y revisión de compatibilidad.
- **Responsable:** Por definir
- **Criterio de aceptación:** `npm run lint` y `npm run build` finalizan sin errores relevantes.
- **Prioridad:** Alta
- **Estado:** Pendiente
- **Orden:** 5

### A-006 - Mejorar accesibilidad, semántica y responsive

- **Hallazgos relacionados:** H-013, H-015, H-016
- **Tipo:** Corrección
- **Descripción:** Asociar labels, mejorar contraste, estructura semántica y adaptar la UI a pantallas pequeñas.
- **Beneficio esperado:** Mayor inclusión y mejor experiencia de uso.
- **Esfuerzo estimado:** M
- **Dependencias:** Revisión visual y validación con navegador.
- **Responsable:** Por definir
- **Criterio de aceptación:** Formularios y navegación son operables con teclado y contrastes aceptables.
- **Prioridad:** Media
- **Estado:** Pendiente
- **Orden:** 6

### A-007 - Incorporar pruebas automatizadas mínimas

- **Hallazgos relacionados:** H-010, H-018
- **Tipo:** Prevención
- **Descripción:** Configurar una suite mínima con pruebas de rutas protegidas, login, formulario, listado y manejo de errores.
- **Beneficio esperado:** Detectar regresiones antes de publicar cambios.
- **Esfuerzo estimado:** M
- **Dependencias:** Contratos y errores ya normalizados.
- **Responsable:** Por definir
- **Criterio de aceptación:** Se ejecuta al menos una suite crítica de validación con resultados reproducibles.
- **Prioridad:** Media
- **Estado:** Pendiente
- **Orden:** 7

### A-008 - Evaluar escalabilidad del frontend con datos mayores

- **Hallazgos relacionados:** H-012
- **Tipo:** Nueva capacidad
- **Descripción:** Medir si hace falta paginación, memoización, carga diferida o virtualización.
- **Beneficio esperado:** Mejorar la experiencia en listas de mayor tamaño.
- **Esfuerzo estimado:** M
- **Dependencias:** Volumen esperable y mediciones reales.
- **Responsable:** Por definir
- **Criterio de aceptación:** Las decisiones de optimización se basan en mediciones y no solo en suposiciones.
- **Prioridad:** Baja
- **Estado:** Pendiente
- **Orden:** 8

### A-009 - Revisar dependencias y actualizar paquetes críticos

- **Hallazgos relacionados:** H-017
- **Tipo:** Corrección
- **Descripción:** Ejecutar auditoría real del lockfile y actualizar paquetes con vulnerabilidades reportadas según compatibilidad.
- **Beneficio esperado:** Reducción del riesgo de seguridad.
- **Esfuerzo estimado:** M
- **Dependencias:** Compatibilidad entre dependencias y entorno de ejecución.
- **Responsable:** Por definir
- **Criterio de aceptación:** El reporte de auditoría queda resuelto o claramente documentado con riesgo residual.
- **Prioridad:** Alta
- **Estado:** Pendiente
- **Orden:** 9

### A-010 - Definir estrategias de validación final antes de producción

- **Hallazgos relacionados:** H-003, H-013, H-015, H-016, H-017, H-018
- **Tipo:** Prevención
- **Descripción:** Establecer checklist de validación frontend: seguridad, accesibilidad, responsive, dependencias y pruebas.
- **Beneficio esperado:** Reducir errores de regresión antes de despliegue.
- **Esfuerzo estimado:** S
- **Dependencias:** Criterios de aceptación definidos por el equipo.
- **Responsable:** Por definir
- **Criterio de aceptación:** Existe un checklist ejecutable y firmado por el responsable.
- **Prioridad:** Media
- **Estado:** Pendiente
- **Orden:** 10

## 11. Plan de acción y criterios de aceptación

| Orden | Acción | Hallazgos | Responsable | Criterio de aceptación | Estado |
|---:|---|---|---|---|---|
| 1 | Autenticación y permisos reales | H-004, H-005, H-006, H-008 | Equipo de desarrollo | Roles y permisos no son manipulables desde el navegador | Pendiente |
| 2 | Retirar contraseñas de la aplicación | H-007 | Equipo de desarrollo | La UI y los datos no exponen credenciales | Pendiente |
| 3 | Corregir flujo de alta y sincronización | H-001, H-002, H-003 | Equipo de desarrollo | El alta actualiza el listado y no rompe detalle ni búsqueda | Pendiente |
| 4 | Normalizar errores y estados asíncronos | H-003, H-009, H-010, H-014 | Equipo de desarrollo | Se distinguen carga, vacío, éxito y error de red | Pendiente |
| 5 | Resolver lint/configuración | H-011 | Equipo de desarrollo | Lint y build se ejecutan sin errores relevantes | Pendiente |
| 6 | Revisar auditoría de dependencias | H-017 | Equipo de desarrollo | Se documenta el resultado de `npm audit` y los riesgos restantes | Pendiente |
| 7 | Mejorar accesibilidad y responsive | H-013, H-015, H-016 | Equipo de desarrollo | Se validan teclado, contraste y pantallas pequeñas | Pendiente |
| 8 | Agregar pruebas automatizadas | H-018 | Equipo de desarrollo | Hay suite mínima con resultados reproducibles | Pendiente |
| 9 | Medir optimización de rendimiento | H-012 | Equipo de desarrollo | Las decisiones se basan en evidencia y no en suposiciones | Pendiente |

## 12. Evidencias, comandos y resultados de validación

La validación disponible en esta consolidación es documental y estática. No se ejecutaron pruebas nuevas de navegador ni validación en producción durante esta consolidación; por ello, los resultados se entienden como evidencia observada por los analistas y reportada en los documentos fuente.

### Comandos y evidencias sugeridos para cerrar la incertidumbre

- `npm run lint`
- `npm run build`
- `npm audit --production`
- Pruebas manuales por flujo crítico: login, alta, detalle, baja, error y búsqueda

### Evidencia documental reportada por fuentes

- F-001: relevamiento general de funcionamiento y calidad.
- F-002: análisis de seguridad y mantenibilidad.
- F-003: diagnóstico de datos, asincronía y consistencia.
- F-004: análisis de rendimiento, accesibilidad y CSS.
- F-005: relevamiento funcional y de seguridad inicial.

## 13. Conclusión y próximos pasos

El proyecto tiene una base funcional útil para aprendizaje y demostración, pero no cumple con criterios mínimos para una solución segura, coherente y sostenible en producción. La mayor prioridad es resolver la autenticación y autorización, la exposición de datos sensibles y la coordinación entre alta, detalle y listado.

Los próximos pasos recomendados son:

1. Reforzar la capa de seguridad.
2. Definir un contrato de cliente real y consistente.
3. Corregir manejo de errores y concurrencia.
4. Mejorar accesibilidad y responsive.
5. Agregar testing y auditoría de dependencias.

## 14. Historial de cambios

| Fecha | Responsable | Versión | Descripción |
|---|---|---|---|
| 2026-09-09 | Miranda Cesar German | 0.1 | Creación del modelo base de relevamiento técnico |
