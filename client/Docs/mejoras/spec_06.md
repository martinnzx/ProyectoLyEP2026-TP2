# Especificación de Mejora 06: Búsqueda Multi-campo y Blindaje Defensivo de Clientes

## 1. Información General
- **ID de la Mejora:** 06
- **Referencia del Relevamiento:** H-003 (Navegación defensiva), H-007 (Búsqueda multi-campo) y H-004 parcial (Sincronización de rol)
- **Fecha:** 2026-09-12
- **Responsable:** Valentín Iriarte
- **Rama de trabajo:** `ValenIr/feature/busqueda-defensiva-clientes`

## 2. Propósito y Descripción del Problema
1. **Búsqueda restrictiva y sensible a errores (H-007):** El filtro actual en `ListaClientes.jsx` únicamente evalúa el apellido (`lastname`) y la ciudad (`city`). Si el usuario busca por el nombre de pila (`firstname`) —que es lo primero visible en la tabla— o por correo electrónico (`email`), el sistema no arroja ningún resultado. Adicionalmente, no normaliza espacios en blanco (`trim`).
2. **Fragilidad ante propiedades anidadas nulas o ausentes (H-003):** En el renderizado de la tabla de `ListaClientes.jsx`, el acceso directo a `cliente.name.firstname` y `cliente.address.city` sin optional chaining o fallbacks expone la vista a errores fatales de tiempo de ejecución (`Cannot read properties of undefined`) si la API o un alta local omite estos nodos.
3. **Persistencia fragmentada del rol (H-004 parcial):** En `DetalleCliente.jsx`, la determinación del rol se realiza leyendo directamente `localStorage.getItem("role")`, en lugar de consumir la fuente de verdad reactiva centralizada en `useAutorizaciones()`.

## 3. Alcance de la Mejora

### Incluido
- Extensión del buscador en `ListaClientes.jsx` para coincidir contra:
  - Nombre completo (`firstname` + `lastname`).
  - Correo electrónico (`email`).
  - Ciudad (`city`).
- Normalización del término de búsqueda (minúsculas, `trim`) y evaluación defensiva para evitar excepciones ante propiedades nulas.
- Blindaje del renderizado de la tabla en `ListaClientes.jsx` usando optional chaining y valores por defecto (`?? '-'`).
- Mejora de accesibilidad en el input de búsqueda mediante atributo `aria-label` y placeholder descriptivo.
- Unificación de la fuente de verdad de autorizaciones en `DetalleCliente.jsx` mediante el hook `useAutorizaciones()`.

### Fuera de alcance
- Paginación del listado o backend de búsqueda en servidor.
- Modificación de los contratos de FakeStoreAPI.

## 4. Requisitos Funcionales
- **RF-01 - Búsqueda Multi-campo:** Al escribir en el buscador, el sistema debe filtrar coincidencias por nombre, apellido, nombre completo, email o ciudad en tiempo real.
- **RF-02 - Blindaje de Renderizado:** La tabla debe renderizar guiones (`'-'`) si falta algún dato opcional o anidado en el cliente sin arrojar errores en consola.
- **RF-03 - Autorizaciones Centralizadas:** `DetalleCliente.jsx` debe consultar `admin?.sector` desde `useAutorizaciones()` para condicionar los botones de acción administrativa (ej. botón "Eliminar Cliente").

## 5. Criterios de Aceptación
- **CA-01:** Escribir el nombre de pila de un cliente (ej. `"John"`) devuelve los registros correspondientes.
- **CA-02:** Escribir parte o todo el correo electrónico de un cliente filtra la tabla correctamente.
- **CA-03:** Clientes con campos anidados incompletos no provocan caídas en la grilla (`TypeError`).
- **CA-04:** El rol mostrado y evaluado para el botón "Eliminar Cliente" en el detalle proviene del contexto de autorizaciones y no directamente de `localStorage`.
- **CA-05:** `npm run build` y el linter pasan exitosamente sin advertencias en los módulos intervenidos.
