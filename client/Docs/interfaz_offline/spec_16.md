# Especificación 16: Prototipo de muestra – Hoja de ruta, semáforo y pedido sugerido

## 1. Información general
- **ID:** 16
- **Referencia:** TP03 – *Sistema de Control de Clientes NOA-PyMEs* (1.1 "Solución que ofrecemos", 1.3 "Alcance" y "Sincronización").
- **Autor:** Miranda Cesar
- **Fecha:** 2026-11-07
- **Rama de trabajo:** `feature/MirandaCesar` (commits manuales)
- **Tipo:** prototipo de demostración para el trabajo práctico. **No pasa a producción.**

## 2. Objetivo
Mostrar en funcionamiento, con el menor esfuerzo posible, las funciones que diferencian la propuesta del TP03:
1. **Semáforo de clientes en riesgo** y **hoja de ruta** ordenada por prioridad.
2. **Pedido sugerido editable** (promedio de las últimas 4 compras).
3. **Registro de visita** con motivo de no compra (lista cerrada).
4. Una **simulación básica sin conexión**: si se corta la conexión, la app sigue mostrando los datos descargados y marca lo registrado como "pendiente de sincronizar".

## 3. Supuestos y límites
- **Solo frontend.** El backend **no se modifica**. Se usan los endpoints existentes `POST /api/auth/login` y `GET /api/clientes` (la tabla de clientes actual).
- **ERP simulado.** Saldo, límite de crédito e historial de compras salen de un archivo de datos fijos en el frontend. Las fechas se generan relativas a "hoy", así los colores no cambian con el paso de los días.
- **Sincronización cubierta.** Se asume resuelta. Pedidos y visitas se guardan en el navegador (`localStorage`) y su estado "Pendiente / Sincronizado" es simulado: no llegan a la base.
- **Sin requisito mobile-first.** Se reutilizan los estilos del proyecto.
- **Fuera de alcance:** PWA/instalación, service worker, IndexedDB, conflictos de sincronización, revisión por administración, panel gerencial, cambios de modelos o endpoints.

## 4. Diseño

### 4.1. Reglas (`src/utils/reglas.js`, funciones puras)
**Semáforo** – `calcularSemaforo({ compras, saldo, limiteCredito }, hoy)`
- `frecuencia` = mediana de días entre compras (mínimo 2 compras).
- **Rojo:** días sin comprar > 2 × frecuencia, o saldo > 90 % del límite.
- **Amarillo:** días sin comprar > 1,5 × frecuencia.
- **Verde:** el resto (también sin historial suficiente).
- Devuelve el motivo en texto: *"Compra cada 7 días y lleva 16 sin comprar"*.

**Pedido sugerido** – `calcularPedidoSugerido(compras)`
- Últimas 4 compras (o las que haya); por producto, `Math.round(suma / compras consideradas)`; se descartan los 0.
- Precio: el de la última compra del producto.

**Orden de la hoja de ruta** – `compararPorRiesgo`: rojo → amarillo → verde y, dentro de cada color, más días sin comprar primero.

### 4.2. Datos simulados (`src/data/comprasDemo.js`)
- Catálogo de 10 productos con precio.
- 5 perfiles comerciales que se reparten **en orden de alta** de los clientes (ids ordenados): 1.º rojo por días (ejemplo del TP03), 2.º verde, 3.º amarillo, 4.º rojo por saldo (95 % del límite), 5.º verde quincenal, y se repite. Así, con pocos clientes, igual aparecen los colores.
- Cada perfil genera 6 compras; la más antigua incluye un producto que el cliente dejó de llevar.

### 4.3. Simulación sin conexión
- `ClientesContext.jsx`: cada vez que `GET /api/clientes` responde, se guarda una copia en `localStorage` (`clientesDescargados`). Si la llamada falla y hay copia, se usa la copia en lugar de mostrar error.
- `useEstadoConexion`: el dispositivo está "sin conexión" si el navegador no tiene red (`navigator.onLine`) o si se está usando la copia descargada.
- `EstadoConexion`: aviso "En línea" o "Sin conexión: trabajando con los datos descargados".
- `registrosDemoService`: guarda pedidos y visitas en `localStorage`; si se registran sin conexión quedan "Pendiente de sincronizar" y pasan a "Sincronizado" al volver la conexión.

### 4.4. Pantallas
| Ruta | Contenido |
|---|---|
| `/ruta` – **Hoja de ruta** (nueva) | Aviso de conexión, resumen por color, lista ordenada con color, nombre, dirección, motivo y botón *Abrir ficha* |
| `/clientes/:id` – **Ficha del cliente** (existente) | Se agrega la sección **Situación comercial**: semáforo y motivo, saldo/límite con barra, pedido sugerido editable (cantidad, quitar, agregar del catálogo, restaurar sugerido, total, confirmar), registro de visita y lista de registros con su estado de sincronización |
| `Nav.jsx` | Enlace "Hoja de ruta" |

## 5. Archivos
**Nuevos:** `src/utils/reglas.js`, `src/utils/__tests__/reglas.test.js`, `src/data/comprasDemo.js`, `src/services/registrosDemoService.js`, `src/hooks/useEstadoConexion.js`, `src/components/EstadoConexion.jsx`, `src/components/Semaforo.jsx`, `src/components/FichaComercial.jsx`, `src/pages/HojaRuta.jsx`, `src/css/preventa.css`.

**Modificados:** `src/context/ClientesContext.jsx` (copia descargada), `src/pages/DetalleCliente.jsx` (sección comercial), `src/routes/routes.jsx` (ruta `/ruta`), `src/components/Nav.jsx` (enlace).

**Sin cambios:** todo el backend (`server/`).

## 6. Guion de la demo
1. Ingresar y abrir **Hoja de ruta**: los clientes en rojo aparecen arriba con su motivo.
2. Abrir el cliente en rojo: *"Compra cada 7 días y lleva 16 sin comprar"*.
3. Revisar el pedido sugerido, quitar un producto, agregar otro y **Confirmar pedido**.
4. **Registrar visita**: "No compró" → "Le compró a otro distribuidor por precio".
5. **Simular corte de señal:** detener el backend (`Ctrl+C`) y recargar, o DevTools (F12) → Network → *Offline*.
   - Aparece "Sin conexión: trabajando con los datos descargados".
   - La hoja de ruta y las fichas siguen funcionando; lo que se registra queda "Pendiente de sincronizar".
6. Volver a levantar el backend / quitar *Offline* y recargar: los registros pasan a "Sincronizado".

> Para que la copia exista, la app tiene que haber cargado los clientes al menos una vez con el backend funcionando.
> Con DevTools *Offline*, si se recarga la página, el servidor de Vite tampoco responde (no hay service worker): conviene cortar la conexión **sin recargar**, o detener solo el backend.

## 7. Pruebas
- `src/utils/__tests__/reglas.test.js` (Vitest, 13 tests): mediana, verde / amarillo / rojo, borde exacto de 1,5×, regla del 90 %, sin historial, pedido sugerido con más y menos de 4 compras, total, orden por riesgo y reparto de perfiles simulados.
- Prueba manual en navegador: hoja de ruta, ficha, pedido editado, visita, aviso sin conexión y paso de "Pendiente" a "Sincronizado".

## 8. Criterios de aceptación
1. La hoja de ruta muestra los clientes con color y motivo, rojos primero.
2. Las reglas respetan los umbrales del TP03 (1,5×, 2× y 90 %) y tienen tests.
3. La ficha muestra un pedido sugerido editable que se puede confirmar.
4. Se registra una visita con motivo de la lista cerrada.
5. Sin conexión con el servidor, la app usa los datos descargados y marca los registros como pendientes.
6. El backend y el ABM de clientes no cambian; `npm test`, `npm run lint` y `npm run build` del cliente terminan sin errores.
