# Resultado de Mejora: Ocultar Datos Sensibles (Seguridad)

## 1. Información General
- **ID de la Mejora:** 04
- **Referencia del Relevamiento:** A-002 (H-007) y A-001 parcial (H-005)
- **Fecha de Implementación:** 2026-09-11

## 2. Acciones Realizadas
Se procedió a remover la asignación de contraseñas por defecto, a ocultar su visibilidad en el frontend y a purgar correctamente las variables de sesión del navegador.

### Cambios en `src/components/FormCliente.jsx`
Se eliminó la línea `password: "1234"` dentro del objeto `nuevoCliente`. A partir de este cambio, los nuevos clientes dados de alta no contarán con esa contraseña por defecto.

### Cambios en `src/pages/DetalleCliente.jsx`
Se eliminó el renderizado del campo de contraseña en la sección de "Credenciales". Esto previene que se exponga la contraseña en texto plano.

### Cambios en `src/context/AutorizacionesContext.jsx`
Se agregó la eliminación del token `role` del `localStorage` (`localStorage.removeItem('role')`) dentro de la función `cerrarSesion`. Esto resuelve la inconsistencia donde un usuario al salir de la aplicación dejaba su nivel de permisos persistido de manera oculta.

## 3. Pruebas y Verificación
- **Alta de Cliente:** Confirmada la ausencia del campo `password` en el envío.
- **Vista de Detalle:** Confirmada la invisibilidad del texto plano de contraseñas.
- **Cierre de Sesión:** Tras ejecutar un log-out, la herramienta de desarrollo (Application -> Local Storage) confirma que el dato `role` es eliminado exitosamente.

## 4. Conclusión
La mejora cumple satisfactoriamente con la recomendación de seguridad para mitigar el hallazgo H-007 (visualización de credenciales) y resuelve parcialmente el H-005 (sesión zombi).
