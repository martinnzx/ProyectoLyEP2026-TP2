# Especificación de Mejora 11: Rendimiento de Renderizado React, Memoización de Contextos y Cancelación Asíncrona (AbortController)

## 1. Información General
- **ID de la Mejora:** 11
- **Referencia del Relevamiento:** Hallazgos H-VL-001, H-VL-002 y H-VL-004 del Análisis Técnico de Valentín Lozano (Sección 4.1, 4.2 y 4.4)
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Lozano
- **Rama de trabajo:** `ValenLoz/feature/rendimiento-optimizacion-react`

## 2. Propósito y Descripción del Problema
1. **Re-renders en Cascada por Objetos Literales en Contextos (H-VL-001):** Tanto `AutorizacionesProvider` como `ClientesProvider` instanciaban un objeto literal nuevo en cada renderizado en su prop `value`. Cualquier actualización menor obligaba a re-renderizar a todos los componentes consumidores de la aplicación aunque sus datos específicos no hubieran cambiado.
2. **Filtrado Sincrónico Bloqueante en el Buscador (H-VL-002):** En `ListaClientes.jsx`, el filtrado de clientes se realizaba sincrónicamente en cada tecla sin memoización (`useMemo`) ni diferimiento (`useDeferredValue`), lo que ante volúmenes mayores de datos produce bloqueos en el hilo principal (*main thread jank*).
3. **Ausencia de Señales de Cancelación Asíncrona (H-VL-004):** Las peticiones HTTP en la carga inicial de clientes carecían de soporte para `AbortController` / `AbortSignal`, lo que ante desmontajes rápidos de componentes o transiciones entre rutas provocaba fugas de memoria (*memory leaks*) e intentos de actualización de estado en componentes desmontados.

## 3. Alcance de la Mejora

### Incluido
- **Optimización en `src/context/AutorizacionesContext.jsx`:**
  - Memoización del objeto `value` mediante `useMemo` con dependencia en `admin`.
  - Estabilización de la función `cerrarSesion` con `useCallback`.
- **Optimización en `src/context/ClientesContext.jsx`:**
  - Memoización del listado combinado de clientes (`combinarClientes`) con `useMemo`.
  - Estabilización de las funciones `crearCliente`, `eliminarCliente` y `obtenerClientePorId` con `useCallback`.
  - Memoización del objeto `value` del Provider con `useMemo`.
  - Soporte de cancelación con `AbortController` y `AbortSignal` en la carga asíncrona de clientes.
- **Soporte de AbortSignal en `src/services/clientesService.js`:**
  - Incorporación del parámetro opcional `signal` en `obtenerClientes` para reenviar a `axios.get(URL, { signal })`.
- **Optimización de Búsqueda en `src/pages/ListaClientes.jsx`:**
  - Implementación de `useDeferredValue` sobre el término de búsqueda para priorizar la respuesta del input sobre el cálculo de filtrado.
  - Memoización del arreglo `clientesFiltrados` mediante `useMemo` dependiendo de `[clientes, busquedaDiferida]`.

### Fuera de alcance
- Alteración del contrato de datos de los endpoints externos.
- Modificaciones en la capa de persistencia de `localStorage`.

## 4. Requisitos y Criterios de Aceptación
- **CA-01:** Los Providers de `AutorizacionesContext` y `ClientesContext` exponen valores memoizados que no generan re-renders redundantes.
- **CA-02:** El input de búsqueda en `ListaClientes.jsx` procesa las entradas con `useDeferredValue` y `useMemo` de forma fluida.
- **CA-03:** Las solicitudes HTTP soportan cancelación controlada con `AbortController` al desmontar componentes.
- **CA-04:** `npm run lint` y `npm run build` pasan con 0 errores y 0 advertencias.
