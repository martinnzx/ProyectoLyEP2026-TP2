# Especificación de Mejora: Integración de Frontend con API REST Backend

## 1. Información General
- **ID de la Mejora:** 14
- **Referencia del Relevamiento:** H-004, H-006, H-007 y SDD Backend (Fase 3: Integración Frontend-Backend)
- **Autor:** Valentín Iriarte
- **Fecha:** 2026-10-06
- **Rama de trabajo:** `feature/IriarteValentin`

## 2. Descripción del Problema
En la etapa inicial del proyecto, el frontend consumía un servicio externo simulado (`fakestoreapi.com`) para el listado de clientes y un arreglo en memoria con contraseñas en texto plano para la autenticación de usuarios. Esto originaba las siguientes limitaciones:
1. No existía persistencia real de las operaciones de alta (POST) y baja (DELETE).
2. Se requería una lógica compleja de sincronización en memoria (`ClientesContext.jsx`) con generación artesanal de IDs numéricos.
3. La autenticación era completamente ficticia, sin validación en servidor ni compatibilidad con bases de datos.

Con la creación del backend propio en Node.js, Express y MongoDB Atlas (implementado en las fases 1 y 2 del TP2), es necesario conectar la interfaz de usuario con la API REST real.

## 3. Alcance de la Mejora
- **Servicio de Clientes (`clientesService.js`):** Redireccionar llamadas a la API REST (`/api/clientes`), soportando configuración mediante variable de entorno `VITE_API_URL` y proveyendo métodos completos de consulta, creación, actualización y eliminación.
- **Servicio de Autenticación (`autorizacionesServices.js`):** Reemplazar los usuarios cableados en código por peticiones HTTP asíncronas hacia el endpoint `/api/auth/login` (con soporte para `/api/auth/register` y `/api/auth/usuarios`).
- **Contexto de Clientes (`ClientesContext.jsx`):** Simplificar el estado global al aprovechar la persistencia real en base de datos y dar soporte transparente a los identificadores `ObjectId` generados por MongoDB.
- **Vistas y Componentes (`Login.jsx`, `DetalleCliente.jsx`, `FormCliente.jsx`):**
  - En `Login.jsx`: convertir el flujo a asíncrono con feedback visual de carga (`cargando`) y mensajes de error provenientes del backend.
  - En `DetalleCliente.jsx`: enviar el ID en formato string sin forzar conversiones numéricas que causen errores de casteo (`CastError`).
  - En `FormCliente.jsx`: propagar los mensajes de error devueltos por el backend (ej. duplicidad de `username`).
- **Infraestructura y Testing:**
  - Configurar `.env.example` para el cliente.
  - Actualizar la suite de pruebas unitarias con Vitest para validar los llamados asíncronos a los nuevos endpoints.

## 4. Archivos a Modificar
- `client/.env.example` (Nuevo)
- `client/src/services/clientesService.js`
- `client/src/services/autorizacionesServices.js`
- `client/src/context/ClientesContext.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/DetalleCliente.jsx`
- `client/src/components/FormCliente.jsx`
- `client/src/services/__tests__/clientesService.test.js`
- `client/src/services/__tests__/autorizacionesServices.test.js`
- `client/dia.md`

## 5. Criterios de Aceptación
1. `clientesService.js` debe comunicarse con `http://localhost:3001/api/clientes` (o valor definido en `VITE_API_URL`).
2. `autorizacionesServices.js` debe realizar peticiones POST a `/api/auth/login`.
3. El inicio de sesión debe validar credenciales reales contra la base de datos a través del backend.
4. Las operaciones de creación y eliminación de clientes deben persistirse en MongoDB y reflejarse de inmediato en el estado de React.
5. Los tests unitarios (`npm test`) deben ejecutarse con éxito y cubrir los nuevos endpoints.
6. El linter (`npm run lint`) y la compilación (`npm run build`) deben finalizar sin errores.
