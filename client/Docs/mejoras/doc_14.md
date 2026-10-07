# Resultado de Mejora: Integración de Frontend con API REST Backend

## 1. Información General
- **ID de la Mejora:** 14
- **Referencia del Relevamiento:** H-004, H-006, H-007 y SDD Backend (Fase 3: Integración Frontend-Backend)
- **Fecha de Implementación:** 2026-10-06
- **Responsable:** Valentín Iriarte

## 2. Acciones Realizadas

### Integración de la Capa de Servicios
1. **`clientesService.js`:**
   - Se configuró la URL base apuntando al servidor Express local (`http://localhost:3001/api/clientes`) con respaldo dinámico a través de `import.meta.env.VITE_API_URL`.
   - Se implementaron métodos para `obtenerClientes`, `obtenerClientePorId`, `crearCliente`, `actualizarCliente` y `eliminarCliente`.
2. **`autorizacionesServices.js`:**
   - Se eliminó el arreglo de usuarios estáticos con contraseñas en texto plano.
   - Se implementó la llamada asíncrona a `/api/auth/login` con validación de roles/sectores.
   - Se añadieron métodos auxiliares para registro de usuarios (`/api/auth/register`) y consulta (`/api/auth/usuarios`).

### Refactorización del Estado Global y Vistas
1. **`ClientesContext.jsx`:**
   - Se eliminaron las estructuras temporales que simulaban persistencia en memoria (`clientesLocales`, `idsEliminados`, `ultimoId`).
   - Se sincronizó el estado reactivo directamente con el backend mediante `AbortController`.
   - Se universalizó la comparación de identificadores (`String(cliente.id) === String(id)`) permitiendo convivir con `_id` de MongoDB (ObjectIds de 24 caracteres hexadecimales) y preservar compatibilidad con identificadores legados.
2. **`DetalleCliente.jsx`:**
   - Se corrigió la llamada a `quitarCliente(id)` eliminando la conversión forzada `Number(id)`, la cual producía `NaN` y fallos de validación Mongoose (`CastError`) ante IDs de MongoDB.
3. **`Login.jsx`:**
   - Se transformó el submit a una función `async/await` con indicador de carga (`cargando`) y bloqueo temporal del botón para evitar solicitudes concurrentes.
   - Se agregó la renderización de mensajes de error devueltos por el servidor (`errorServidor`).
4. **`FormCliente.jsx`:**
   - Se integró la captura de errores específicos del backend (`err.response?.data?.message`) para informar al usuario de fallos como duplicidad de nombres de usuario.

### Estabilidad y Calidad de Código
- Se eliminó la importación innecesaria de `React` en `EmptyState.jsx`, resolviendo la advertencia de ESLint.
- Se corrigió en `server/package.json` una declaración redundante de `"type": "commonjs"` que impedía la ejecución nativa de módulos ES en Node.js.
- Se agregaron archivos `.gitignore` para aislar `node_modules` y `.env`.

## 3. Pruebas y Verificación
- **Pruebas Unitarias:** Se actualizaron y ampliaron los tests de `clientesService.test.js` y `autorizacionesServices.test.js` usando Vitest con mocks de `axios`. Los 10 tests pasaron exitosamente.
- **Análisis Estático (Linter):** Se ejecutó `npm run lint` sin advertencias ni errores.
- **Compilación de Producción:** Se ejecutó `npm run build` verificando el empaquetado correcto de la aplicación mediante Vite.

## 4. Conclusión
La integración entre la interfaz gráfica del cliente y la API REST del backend concluyó satisfactoriamente. El sistema ahora opera con persistencia real y arquitectura desacoplada, cumpliendo los objetivos planteados para la entrega del TP2.
