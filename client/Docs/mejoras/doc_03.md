# Implementación y resultados de la especificación 03

## 1. Datos de ejecución

| Campo | Detalle |
|---|---|
| Fecha | 2026-09-10 |
| Especificación aplicada | [spec_03.md](spec_03.md) |
| Aplicación | SPA React/Vite de gestión de clientes |
| Persistencia solicitada | En memoria, mientras dura la ejecución de la aplicación |
| Fuente inicial | `https://fakestoreapi.com/users` |
| Alcance de la prueba | Una ejecución del navegador, sin persistencia después de recargar o cerrar |

## 2. Resultado general

La mejora fue implementada. La aplicación consulta la API al iniciar y conserva en un estado compartido en memoria los clientes remotos, las altas locales, las bajas y el último ID utilizado. Las pantallas de listado, alta y detalle consumen ese mismo estado, por lo que los cambios permanecen al navegar entre rutas durante la ejecución.

No se agregó `localStorage`, base de datos ni persistencia entre ejecuciones, porque ese comportamiento está explícitamente fuera del alcance de `spec_03.md`.

## 3. Cambios realizados

### Estado compartido

- Se agregó `src/context/ClientesContext.jsx`.
- Se agregó `src/context/ClientesContextDefinition.js` para separar la declaración del contexto del proveedor.
- Se agregó `src/hooks/useClientes.js` para que las páginas y componentes accedan al estado común.
- El proveedor se montó en `src/main.jsx`, por encima de las rutas, para que no se destruya al cambiar de pantalla.
- El estado conserva `clientesRemotos`, `clientesLocales`, `idsEliminados` y `ultimoId` únicamente en memoria.
- Se agregó una guarda para evitar una segunda carga de la API durante los efectos de `StrictMode` en desarrollo.

### Servicio de clientes

Se amplió `src/services/clientesService.js` con:

- `obtenerClientes()` para la carga inicial.
- `crearCliente(cliente)` para el alta remota.
- `eliminarCliente(id)` para la baja remota.

### Alta

- `FormCliente` dejó de llamar directamente al servicio HTTP.
- El contexto calcula el siguiente ID como uno mayor que el máximo conocido de la API, altas locales, bajas registradas y contador actual.
- El cliente se agrega a `clientesLocales` solo después de que el `POST` finaliza correctamente.
- El cliente aparece inmediatamente en la grilla y recibe el ID generado por la aplicación.

### Baja

- `DetalleCliente` dejó de consultar la API por separado.
- La baja pasa por el estado compartido.
- El ID se registra en `idsEliminados` y las altas locales se quitan de `clientesLocales`.
- El cliente eliminado desaparece de la grilla y no reaparece si la API lo devuelve nuevamente durante la ejecución.

### Listado y detalle

- `ListaClientes` utiliza la colección compartida y ya no realiza una consulta propia.
- La colección se muestra ordenada por ID descendente, como requiere la especificación.
- `DetalleCliente` resuelve clientes remotos y locales desde la misma colección.
- Los datos opcionales de dirección se muestran con `-` cuando una alta local no los contiene.
- Se agregó el estado de cliente no encontrado para IDs eliminados o inexistentes.

## 4. Validaciones técnicas

| Comando | Resultado |
|---|---|
| `npx eslint src/context/ClientesContext.jsx src/context/ClientesContextDefinition.js src/hooks/useClientes.js src/services/clientesService.js src/main.jsx src/components/FormCliente.jsx src/pages/ListaClientes.jsx src/pages/DetalleCliente.jsx` | Aprobado |
| `npm run build` | Aprobado; Vite transformó 410 módulos y generó `dist/` |
| `npm run lint` | No aprobado por tres errores preexistentes fuera de esta mejora: `src/App.jsx` tiene un import sin uso, `src/context/AutorizacionesContext.jsx` mezcla exportaciones incompatibles con Fast Refresh y `src/routes/routes.jsx` tiene `Navigate` sin uso |

El lint enfocado de todos los archivos modificados por esta mejora no presenta errores.

## 5. Prueba funcional manual

### Preparación

1. Se inició Vite con `npm run dev -- --host 127.0.0.1`.
2. Se abrió `http://127.0.0.1:5173/`.
3. Se ingresó con el usuario de Gerencia `jimena@gmail.com`, contraseña `Admin123` y sector `Gerencia`.

### Resultados observados

| Caso | Resultado |
|---|---|
| Carga inicial desde API | Aprobado. Se mostraron 10 clientes, ordenados del ID 10 al ID 1. |
| Alta | Aprobado. Se creó `Cliente Prueba` y se asignó el ID 11. La grilla pasó a mostrar 11 clientes inmediatamente. |
| Acceso al detalle del alta | Aprobado. `/clientes/11` mostró el cliente local con sus datos. Los campos de dirección no informados se mostraron como `-`. |
| Navegación entre pantallas | Aprobado. Después de volver desde el detalle a `/clientes`, el cliente 11 continuó visible. |
| Baja | Aprobado. Se eliminó el cliente 11 desde el detalle y la grilla volvió a mostrar 10 clientes sin ese registro. |
| No reaparición durante la ejecución | Aprobado en el estado compartido: el ID eliminado queda registrado en `idsEliminados`. |
| Secuencia después de eliminar el último ID | Aprobado. Sin recargar ni reiniciar la aplicación, se eliminó el ID 11 y el siguiente alta recibió el ID 12. |

La prueba utilizó un cliente de prueba y se eliminó dentro de la misma ejecución. No se modificaron archivos de datos ni se intentó validar persistencia después de cerrar o recargar, porque esa condición está fuera del alcance solicitado.

## 6. Cobertura de criterios de aceptación

| Criterio | Estado | Evidencia |
|---|---|---|
| CA-01 Alta visible | Cumplido | El ID 11 apareció inmediatamente en la grilla. |
| CA-02 Alta persistente durante la ejecución | Cumplido | El cliente 11 permaneció al entrar al detalle y volver al listado. |
| CA-03 Baja visible | Cumplido | El cliente eliminado dejó de aparecer en la grilla. |
| CA-04 Baja frente a nueva respuesta de API | Implementado | `idsEliminados` filtra el ID antes de publicar la colección. |
| CA-05 IDs crecientes | Cumplido | El alta recibió 11, se eliminó ese cliente y el siguiente alta recibió 12 sin recargar ni reiniciar la aplicación. |
| CA-06 API con ID superior | Implementado | La inicialización actualiza `ultimoId` con el máximo remoto antes de reservar otro ID. |
| CA-07 Cambios de pantalla | Cumplido | El proveedor está montado por encima de las rutas y el alta sobrevivió al cambio de pantalla. |
| CA-08 Fallos | Implementado | Los errores de carga, alta y baja se propagan a la interfaz; no se actualiza el estado si falla la operación remota. |
| CA-09 Integridad | Implementado | La combinación usa IDs como clave y el contador no se reinicia al eliminar clientes durante la ejecución. |

## 7. Limitaciones y observaciones

- FakeStoreAPI simula las operaciones de escritura y no ofrece persistencia remota confiable. Por eso el estado de altas y bajas se conserva únicamente en memoria.
- No se implementaron pruebas automatizadas porque el proyecto no tiene un framework de testing configurado.
- La validación de los casos de API caída, timeout y respuestas inválidas quedó cubierta a nivel de manejo de errores en código, pero no fue ejecutada contra un mock automatizado.
- Los tres errores del lint global pertenecen a código preexistente y no fueron modificados para mantener el alcance de esta mejora.

## 8. Conclusión

La implementación satisface el pedido de `spec_03.md`: la API se consulta al iniciar, el alta se incorpora a la grilla, la baja se elimina de la grilla, ambos cambios permanecen al intercambiar pantallas y los IDs nuevos son únicos y mayores que los IDs conocidos durante la ejecución. No se agregó persistencia después de cerrar, recargar o reiniciar la aplicación.
