# Especificación de Mejora: Estados Vacíos y Feedback Uniforme (UX)

## 1. Información General
- **ID de la Mejora:** 13
- **Referencia del Relevamiento:** H-014 (Acción A-004)
- **Autor:** Mamani Mariano Martin
- **Fecha:** 2026-09-13
- **Rama de trabajo:** `feature/ux-estados-vacios`

## 2. Descripción del Problema
De acuerdo con el hallazgo H-014, el sistema carece de un estado vacío claro (Empty State) para búsquedas sin resultados, ni diferenciación visual atractiva ante la ausencia de datos. Esto genera confusión en la interfaz cuando el usuario filtra por un nombre inexistente o intenta acceder al detalle de un ID no válido.

## 3. Alcance de la Mejora
- Creación de un componente reutilizable de React `EmptyState` para manejar las ausencias de datos en la UI.
- Implementación del `EmptyState` en la vista de `ListaClientes` para mostrar feedback si el filtro no arroja ningún cliente.
- Implementación del `EmptyState` en la vista de `DetalleCliente` si se consulta un ID de cliente inexistente.

## 4. Archivos a Modificar
- `src/components/EmptyState.jsx` (Nuevo)
- `src/css/emptystate.css` (Nuevo)
- `src/pages/ListaClientes.jsx`
- `src/pages/DetalleCliente.jsx`

## 5. Criterios de Aceptación
- Al buscar un término que no concuerde con ningún cliente, la tabla debe ocultarse y mostrarse el componente `EmptyState` con la opción de limpiar la búsqueda.
- Al acceder a un cliente inexistente (ej. `/clientes/999`), la pantalla debe renderizar el `EmptyState` con un botón para regresar a la lista, en lugar de un texto sin estilos.
