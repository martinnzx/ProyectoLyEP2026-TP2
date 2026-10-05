# Especificación de mejora 03: persistencia durante la ejecución y consistencia del ciclo de vida de clientes

## 1. Propósito

Definir la mejora necesaria para que las altas y bajas de clientes se conserven durante la ejecución de la aplicación, sean consistentes entre pantallas y visibles en la grilla, aun cuando `FakeStoreAPI` no conserve de forma confiable las operaciones `POST` y `DELETE` entre peticiones o sesiones.

La aplicación consulta la API al iniciar y toma esa respuesta como estado inicial. A partir de ese momento deberá utilizar una fuente de estado compartida en memoria para registrar las modificaciones realizadas durante la ejecución. También deberá garantizar que los identificadores de los clientes sean únicos, crecientes y no se reinicien mientras dure la aplicación.

## 2. Problema actual

- `ListaClientes` obtiene los clientes directamente desde la API cada vez que se monta.
- `FormCliente` realiza un `POST`, pero el cliente creado no se incorpora al estado de `ListaClientes`.
- `DetalleCliente` realiza un `DELETE`, pero la baja no se registra en una fuente compartida.
- Al cambiar de pantalla o volver a consultar la API, una alta puede desaparecer y una baja puede reaparecer.
- La respuesta de una API simulada no puede considerarse como persistencia de las modificaciones realizadas durante la ejecución.
- No existe un mecanismo centralizado que reserve y conserve identificadores nuevos.

## 3. Alcance

### Incluido

- Carga inicial de clientes desde la API.
- Persistencia en memoria de altas y bajas durante la ejecución de la aplicación.
- Incorporación inmediata de un cliente nuevo en la grilla.
- Eliminación inmediata de un cliente de la grilla y de la vista de detalle.
- Conservación de altas y bajas al navegar entre rutas y al desmontar y volver a montar las pantallas.
- Generación de identificadores únicos, crecientes y no reutilizables.
- Manejo de errores de API y del estado compartido en memoria.
- Pruebas de los escenarios principales y de los invariantes de identificación.

### Fuera de alcance

- Construcción de un backend propio o una base de datos remota.
- Persistencia después de cerrar, recargar o reiniciar la aplicación.
- Sincronización multiusuario entre distintos navegadores o dispositivos.
- Edición de clientes.
- Recuperación de registros eliminados desde la interfaz.
- Reemplazo de la autorización existente. La baja deberá continuar restringida al rol correspondiente.

## 4. Decisión de persistencia

Mientras no exista un backend propio, la aplicación deberá mantener en memoria un estado compartido de clientes durante su ejecución. La API se consultará al iniciar la aplicación y será la fuente de datos inicial; luego, el estado compartido será la fuente de verdad para las operaciones realizadas durante esa ejecución.

La lógica de acceso deberá estar centralizada en un servicio, contexto o repositorio de clientes que permanezca montado durante la ejecución. Las páginas y componentes no deberán mantener copias independientes de la colección ni realizar consultas independientes que produzcan estados contradictorios.

El estado compartido deberá tener, como mínimo, esta estructura:

```js
{
	version: 1,
	clientesLocales: [],
	idsEliminados: [],
	ultimoId: 0
}
```

`clientesLocales` contendrá las altas realizadas desde la aplicación. `idsEliminados` contendrá los IDs eliminados, incluidos los clientes que originalmente provinieron de la API. `ultimoId` será el último identificador reservado por la aplicación y nunca deberá disminuir mientras dure la ejecución. Este estado deberá existir únicamente en memoria como parte del estado compartido de la aplicación.

## 5. Requisitos funcionales

### RF-01 - Inicialización del listado

Al ingresar a la pantalla de clientes, el repositorio deberá:

1. Inicializar el estado compartido vacío o conservarlo si ya fue creado por el proveedor de la aplicación.
2. Consultar la API una vez al iniciar la aplicación para obtener la colección remota inicial.
3. Determinar el mayor ID numérico presente en la API, en `clientesLocales`, en `idsEliminados` y en `ultimoId`.
4. Actualizar `ultimoId` si se detecta un ID superior.
5. Construir la colección visible aplicando las reglas de combinación y eliminación.
6. Entregar esa colección al estado compartido utilizado por la grilla y el detalle.
7. El orden de visualizacion en la grilla será por id descendente.

La inicialización de una pantalla no deberá volver a consultar la API ni borrar las altas locales o las marcas de baja existentes. Una nueva ejecución de la aplicación podrá comenzar nuevamente con la respuesta inicial de la API.

### RF-02 - Alta de cliente

Al confirmar un alta válida:

1. Se deberán validar los campos obligatorios y normalizar el objeto al modelo de cliente utilizado por listado y detalle.
2. Se deberá obtener un nuevo ID mediante la regla definida en la sección 6.
3. El cliente deberá enviarse a la API si el flujo actual conserva esa integración.
4. Solo después de que el alta sea aceptada por la operación definida como exitosa, el cliente completo con su nuevo ID deberá agregarse a `clientesLocales`.
5. Se deberá actualizar el estado compartido en memoria antes de informar éxito al usuario.
6. Se deberá actualizar el estado compartido, de modo que el cliente aparezca inmediatamente en la grilla sin depender de una nueva consulta.
7. El formulario deberá limpiarse únicamente después de actualizar correctamente el estado compartido.

Si falla la API o la actualización del estado en memoria, el cliente no deberá aparecer como creado. No se deberá incrementar ni confirmar el estado del alta de forma que pueda producir un registro incompleto o un ID reutilizable.

La respuesta de la API no deberá reemplazar el ID generado localmente si hacerlo pudiera violar la regla de unicidad o el estado en memoria de la aplicación. Si la API devuelve otro ID, deberá registrarse como dato remoto solo si existe una decisión explícita de mapeo; no se permitirá conservar dos clientes con el mismo ID visible.

### RF-03 - Baja de cliente

Al confirmar la eliminación de un cliente autorizado:

1. Se deberá ejecutar la operación remota cuando corresponda.
2. Si la operación se considera exitosa, se deberá agregar el ID a `idsEliminados`.
3. Si el cliente era un alta local, también deberá eliminarse de `clientesLocales`.
4. Se deberá actualizar el estado compartido en memoria antes de mostrar la baja como exitosa.
5. Se deberá quitar el cliente del estado compartido y redirigir a `/clientes`.
6. La grilla no deberá volver a mostrarlo aunque la API lo devuelva en una consulta posterior.

Una baja exitosa deberá ser idempotente: repetirla para el mismo ID no deberá crear inconsistencias ni quitar el registro de otro cliente.

Si la API no está disponible, se deberá aplicar una decisión uniforme. Para este alcance, la baja deberá considerarse exitosa localmente solo cuando se documente explícitamente como modo offline; en caso contrario, se deberá informar el error y conservar el cliente visible.

### RF-04 - Persistencia durante la ejecución y entre pantallas

La colección visible deberá conservar las altas y bajas al:

- navegar de `/clientes` a `/clientes/:id` y regresar;
- visitar otra pantalla y volver al listado;
- desmontar y volver a montar los componentes de listado y detalle;
- repetir la carga de datos desde la API.

La recarga, el cierre o el reinicio de la aplicación no forman parte del alcance de esta persistencia. En una nueva ejecución se volverá a consultar la API y se iniciará un nuevo estado en memoria.

La navegación no deberá provocar que cada componente cree una copia divergente de la colección. El estado deberá provenir del repositorio o contexto compartido.

### RF-05 - Grilla y detalle

- La grilla deberá renderizar altas locales igual que los registros remotos.
- El cliente recién creado deberá ser accesible mediante `/clientes/{id}`.
- El detalle deberá poder resolver tanto clientes remotos como locales desde la misma fuente de datos.
- Un cliente marcado como eliminado deberá tratarse como inexistente para la grilla y el detalle.
- La clave de renderizado de React deberá utilizar el ID único del cliente.

## 6. Reglas de identificadores

Los IDs deberán ser enteros positivos. Para reservar el siguiente ID se deberá calcular:

```text
siguienteId = max(
	mayorIdDeLaApi,
	mayorIdDeClientesLocales,
	mayorIdDeIdsEliminados,
	ultimoIdPersistido
) + 1
```

Se deberán cumplir todas estas invariantes:

1. El nuevo ID será siempre mayor que el mayor ID leído de la API.
2. El nuevo ID será siempre mayor que el último ID dado de alta por la aplicación.
3. Un ID usado no se podrá reutilizar, aunque el cliente sea eliminado.
4. `ultimoId` solo podrá avanzar; nunca podrá volver a cero ni a uno por cambiar de pantalla, cerrar sesión dentro de la aplicación o vaciar la grilla. Al iniciar una nueva ejecución se calculará nuevamente a partir del mayor ID recibido de la API.
5. Si la API posteriormente devuelve un ID mayor, `ultimoId` deberá actualizarse a ese valor antes de reservar otro ID.
6. Los IDs duplicados detectados en datos remotos deberán provocar un error controlado o una normalización explícita; nunca se deberán ocultar silenciosamente.
7. Un valor negativo o no numérico en el estado deberá ignorarse para el cálculo sin reducir el contador válido ya conocido.

La eliminación no reinicia la secuencia. Por ejemplo, si se utilizaron los IDs 1 a 10 y se eliminó el cliente 10, el siguiente alta deberá recibir un ID mayor que 10, nunca 1 ni 10.

## 7. Combinación de datos

La colección visible deberá construirse con este orden lógico:

1. Obtener los clientes remotos.
2. Quitar los clientes cuyos IDs estén en `idsEliminados`.
3. Quitar cualquier alta local que esté marcada como eliminada.
4. Agregar las altas locales que no estén eliminadas.
5. Resolver conflictos de ID antes de publicar la colección.

Si una alta local comparte ID con un registro remoto, deberá prevalecer una única representación determinada por el repositorio. La implementación recomendada es reservar IDs por encima del máximo remoto para evitar el conflicto y registrar el caso como error de integridad si ocurre.

El orden de la grilla deberá ser estable. Como comportamiento recomendado, se ordenará por `id` ascendente, salvo que una decisión de producto establezca otro orden.

## 8. Arquitectura y responsabilidades

Se deberá implementar una única responsabilidad de datos, por ejemplo en `src/services/clientesService.js` o en un repositorio específico, con operaciones equivalentes a:

- `obtenerClientes()`;
- `obtenerClientePorId(id)`;
- `crearCliente(datos)`;
- `eliminarCliente(id)`;
- `reservarSiguienteId(clientesRemotos)`;
- `inicializarEstado()` y `actualizarEstado(estado)`.

El contexto o proveedor compartido deberá exponer la colección y las operaciones de alta y baja a las páginas. `FormCliente`, `ListaClientes` y `DetalleCliente` deberán consumir esas operaciones, evitando `fetch`, `axios` y almacenamiento duplicados en cada componente.

El repositorio deberá:

- validar respuestas HTTP y datos mínimos del modelo;
- manejar respuestas ausentes, inválidas o incompletas de la API;
- evitar sobrescrituras concurrentes dentro de la misma pestaña;
- notificar errores sin perder el estado persistido válido;
- permitir reemplazar el estado en memoria por un backend real en una mejora posterior.

## 9. Modelo mínimo de cliente

Todo cliente visible deberá contar, como mínimo, con:

```js
{
	id: Number,
	email: String,
	username: String,
	name: {
		firstname: String,
		lastname: String
	},
	address: {
		city: String
	},
	phone: String
}
```

Las propiedades opcionales de la API podrán conservarse, pero listado, detalle, búsqueda y persistencia deberán tolerar respuestas incompletas sin producir un error de renderizado.

## 10. Errores y estados de interfaz

- Mostrar estado de carga durante la inicialización.
- Mostrar un mensaje específico si no se puede cargar la API pero sí existe un estado local utilizable.
- Mostrar un estado de error si no existe ninguna fuente válida de clientes.
- Deshabilitar el botón mientras se procesa un alta o una baja para evitar operaciones duplicadas.
- Informar si no se puede inicializar el estado en memoria a partir de la API.
- No mostrar un mensaje de éxito antes de completar la escritura local.
- No dejar una pantalla en carga indefinida ante una respuesta HTTP no exitosa, un JSON inválido o un cliente inexistente.

## 11. Criterios de aceptación

### CA-01 - Alta visible

Al crear un cliente correctamente, el nuevo registro aparece en la grilla sin recargar manualmente, con un ID numérico único y mayor que todos los IDs remotos y locales conocidos.

### CA-02 - Alta persistente durante la ejecución

Después de crear un cliente, navegar a otra ruta, desmontar y volver a montar la pantalla de clientes, el cliente continúa visible con el mismo ID y los mismos datos mientras la aplicación siga ejecutándose.

### CA-03 - Baja visible

Al eliminar un cliente con permisos, el registro desaparece del detalle y de la grilla, y la navegación vuelve a `/clientes` sin mostrarlo como resultado.

### CA-04 - Baja persistente frente a la API

Si una consulta posterior de la API devuelve un cliente eliminado localmente, dicho cliente continúa oculto por la marca registrada en memoria dentro de `idsEliminados`.

### CA-05 - IDs crecientes

Crear varios clientes, eliminar el último, cambiar de pantalla y crear otro. El nuevo ID es mayor que el ID eliminado y no coincide con ningún ID previo durante la ejecución.

### CA-06 - API con ID superior

Simular o recibir una API cuyo mayor ID sea superior al contador local. El siguiente alta utiliza un ID mayor que el nuevo máximo de la API.

### CA-07 - Cambios de pantalla

La colección no pierde altas ni recupera bajas al desmontar y montar `ListaClientes`, visitar un detalle o navegar por una ruta protegida.

### CA-08 - Fallos

Ante un error de API o de actualización del estado compartido, la interfaz informa el problema, no muestra una operación como exitosa y conserva los datos válidos previamente cargados durante la ejecución.

### CA-09 - Integridad

La aplicación no renderiza IDs duplicados, no crea registros sin ID y no reinicia `ultimoId` luego de eliminar todos los clientes visibles, cerrar sesión dentro de la aplicación o cambiar de pantalla.

## 12. Pruebas requeridas

Como mínimo deberán verificarse:

- carga inicial con API disponible y estado en memoria vacío;
- carga inicial con altas y bajas ya registradas en el estado compartido;
- alta exitosa y alta fallida;
- baja de un cliente remoto y de un cliente local;
- desmontaje y montaje de las pantallas después de un alta y después de una baja;
- API que devuelve un ID mayor al contador local;
- eliminación del último ID utilizado;
- estado inicial vacío y respuesta inválida de la API;
- respuesta HTTP no exitosa, timeout o JSON inválido;
- doble clic o doble envío en alta y baja;
- acceso directo al detalle de un cliente local y de uno eliminado.

La validación mínima deberá incluir `npm run lint`, `npm run build` y pruebas manuales o automatizadas que demuestren cada criterio de aceptación. Se deberá registrar fecha, comando, resultado y datos utilizados.

## 13. Orden de implementación

1. Definir el modelo del estado en memoria y las funciones de inicialización y actualización segura.
2. Implementar la reconstrucción de la colección combinando API, altas locales y bajas.
3. Implementar la reserva de IDs monotónicos durante la ejecución.
4. Centralizar la carga y las mutaciones en el servicio o contexto compartido.
5. Adaptar alta, listado y detalle para utilizar la fuente compartida.
6. Adaptar la baja para registrar `idsEliminados` en memoria y actualizar la colección.
7. Incorporar estados de error, carga y operaciones duplicadas.
8. Ejecutar las pruebas y documentar la evidencia.

## 14. Resultado esperado

Al finalizar la mejora, la aplicación deberá comportarse como una gestión de clientes consistente durante cada ejecución: la API se consultará al iniciar, las altas deberán permanecer, las bajas no deberán reaparecer, ambos cambios deberán reflejarse inmediatamente en la grilla y el detalle, y cada nuevo cliente deberá recibir un ID único y estrictamente creciente, sin reiniciarse al cambiar de pantalla ni al volver a montar los componentes. No se exige conservar estos cambios después de cerrar, recargar o reiniciar la aplicación.
