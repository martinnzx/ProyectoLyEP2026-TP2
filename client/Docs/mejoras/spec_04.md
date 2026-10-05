# Especificación de Mejora: Ocultar Datos Sensibles (Seguridad)

## 1. Información General
- **ID de la Mejora:** 04
- **Referencia del Relevamiento:** A-002 (H-007) y A-001 parcial (H-005)
- **Fecha:** 2026-09-11
- **Rama de trabajo:** `feature/seguridad-datos-sensibles`

## 2. Descripción del Problema
Según el hallazgo H-007, el formulario de alta crea una contraseña fija predecible (`"1234"`) para los nuevos clientes y la ficha expone la contraseña en texto plano. Adicionalmente (hallazgo H-005), la sesión queda parcialmente inconsistente al cerrar sesión, ya que el rol (`role`) del usuario se mantiene guardado en el navegador, abriendo un riesgo de seguridad de estado "zombi".

## 3. Alcance de la Mejora
- Eliminar la asignación de contraseña predeterminada al dar de alta un cliente en el componente `FormCliente.jsx`.
- Eliminar el renderizado de la contraseña en el componente `DetalleCliente.jsx`.
- Limpiar completamente el almacenamiento local (`localStorage`) al momento de cerrar la sesión en `AutorizacionesContext.jsx` para evitar manipulación residual.

## 4. Archivos a Modificar
- `src/components/FormCliente.jsx`
- `src/pages/DetalleCliente.jsx`
- `src/context/AutorizacionesContext.jsx`

## 5. Criterios de Aceptación
- Al crear un cliente, el objeto no contiene `password`.
- Al visitar el detalle del cliente, no se muestra la contraseña en texto plano.
- Al cerrar la sesión, el valor `role` se elimina completamente del `localStorage`.
