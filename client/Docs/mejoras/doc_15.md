# Resultado de Mejora: Dashboard con datos reales de la base de datos

## 1. Información General
- **ID de la Mejora:** 15
- **Referencia:** Docs/mejoras/spec_15.md
- **Fecha de Implementación:** 2026-10-08
- **Responsable:** Miranda Cesar

## 2. Acciones Realizadas

### Problema detectado
El componente `Dashboard.jsx` mostraba valores fijos en el código (Clientes: 10, Gerencia: 3, Soporte: 3), sin relación con la información persistida en MongoDB.

### Corrección en `src/pages/Dashboard.jsx`
1. **Cantidad de clientes:**
   - Se reutilizó el hook `useClientes()`. El contexto `ClientesProvider` ya obtiene los clientes desde `GET /api/clientes`.
   - La tarjeta muestra `clientes.length`. Al compartir el estado global, el valor se mantiene actualizado tras altas y bajas.
2. **Usuarios por sector (Gerencia / Soporte):**
   - Se reutilizó el método existente `autorizacionesServices.obtenerUsuarios()`, que consulta `GET /api/auth/usuarios` y hasta ahora no se utilizaba en ninguna vista.
   - Se agregó el helper `contarSector(sector)`, que filtra los usuarios por el campo `sector` del modelo `Usuario` (`enum: ['Soporte', 'Gerencia']`).
3. **Estados de carga y errores:**
   - Mientras se obtienen los datos, cada tarjeta muestra `…`.
   - Ante un error o una respuesta inválida, los contadores de usuarios quedan en 0 sin interrumpir la vista.
   - Se usa un flag `activo` en el cleanup del `useEffect` para no actualizar el estado si el componente se desmonta. Es el mismo patrón que usa `ClientesContext.jsx`.

No fue necesario modificar el backend ni los estilos (`dashboard.css`).

## 3. Pruebas y Verificación
- **Análisis Estático (Linter):** `npm run lint` terminó sin advertencias ni errores.
- **Pruebas Unitarias:** `npm test` (Vitest) pasó los 2 archivos de prueba, con 10 tests exitosos.
- **Compilación de Producción:** `npm run build` generó el empaquetado correctamente con Vite.

## 4. Observaciones
- El endpoint `GET /api/auth/usuarios` no requiere autenticación y devuelve el listado completo de usuarios (sin contraseñas). Como mejora futura se sugiere un endpoint de estadísticas protegido, que devuelva solo los conteos (`countDocuments`).

## 5. Conclusión
El Dashboard ya no muestra valores estáticos: refleja la cantidad real de clientes registrados y de usuarios de los sectores Gerencia y Soporte almacenados en la base de datos. Con esto se cumple lo solicitado en spec_15.
