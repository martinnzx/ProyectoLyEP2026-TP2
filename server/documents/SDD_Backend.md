# Software Design Document (SDD) - Backend

## 1. Datos generales
| Campo | Detalle |
|---|---|
| **Sistema** | API REST - Panel de Control de Clientes |
| **Versión** | 1.0.0 |
| **Tecnologías** | Node.js, Express, MongoDB (Atlas), Mongoose |
| **Fecha** | 2026-10-05 |
| **Fase** | Arquitectura y setup, Modelos y conexión DB (Partes 1 y 2) |

## 2. Resumen Ejecutivo
El presente documento describe el diseño y la arquitectura del backend para el sistema de gestión de clientes. El objetivo es reemplazar la API falsa (`fakestoreapi.com`) y los mocks de autenticación por una API REST real con persistencia en MongoDB Atlas. Esto permitirá solucionar los problemas críticos de seguridad (H-004, H-006, H-007) y las inconsistencias de datos detectadas en el análisis del frontend.

## 3. Arquitectura del Sistema
El backend seguirá una **Arquitectura en Capas (MVC adaptado)** basada en el estándar de Express, promoviendo la separación de responsabilidades:
*   **Capa de Enrutamiento (`routes/`):** Define los endpoints y asocia las peticiones HTTP con sus controladores respectivos.
*   **Capa de Controladores (`controllers/`):** Contiene la lógica de negocio, maneja las solicitudes, orquesta los modelos y retorna las respuestas (códigos HTTP y JSON).
*   **Capa de Modelos (`models/`):** Define los esquemas de datos utilizando `Mongoose` para la comunicación con MongoDB.
*   **Capa de Middleware (`middleware/`):** Interceptores funcionales (ej. manejo de errores, validación de autenticación -futuro-, CORS).

## 4. Modelo de Datos (Esquemas de MongoDB)

Para mantener la compatibilidad estricta con el frontend y evitar que este "se rompa" (requisito de la consigna), los esquemas de Mongoose mapearán directamente los objetos esperados por la interfaz gráfica.

### Colección: `clientes`
```javascript
{
  email: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: {
    firstname: { type: String, required: true },
    lastname: { type: String, default: "-" } // Compatible con H-002 del frontend
  },
  phone: { type: String },
  address: {
    street: { type: String },
    number: { type: Number },
    zipcode: { type: String },
    city: { type: String }
  }
}
// Nota: Mongoose agregará el campo _id automáticamente, pero podemos crear 
// un transformador para devolverlo como 'id' (Numérico o String) hacia el frontend.
```

### Colección: `usuarios` (Autorizaciones)
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Se debe encriptar en etapas futuras (bcrypt)
  nombre: { type: String, required: true },
  sector: { type: String, enum: ['Soporte', 'Gerencia'], required: true }
}
```

## 5. Diseño de la API REST (Endpoints)

El servidor escuchará en el puerto **3001**. Las rutas base serán las siguientes:

### Rutas de Clientes (`/api/clientes`)
*   `GET /api/clientes` - Retorna el listado completo de clientes.
*   `GET /api/clientes/:id` - Retorna el detalle de un cliente.
*   `POST /api/clientes` - Crea un nuevo cliente.
*   `DELETE /api/clientes/:id` - Elimina un cliente.
*(A futuro, se debe implementar `PUT/PATCH` para edición).*

### Rutas de Autenticación (`/api/auth`)
*   `POST /api/auth/login` - Valida las credenciales y devuelve los datos del usuario logueado (y a futuro, un JWT).

## 6. Plan de Implementación (Días 1 y 2)

**Lunes (Arquitectura y Setup):**
1. Inicializar paquete NPM en `/server`. *(Completado)*
2. Instalar dependencias base (`express`, `mongoose`, `cors`, `dotenv`). *(Completado)*
3. Crear el archivo de entrada `server.js` (o `index.js`).
4. Configurar el servidor Express básico y aplicar middleware genérico (`cors()`, `express.json()`).

**Martes (Modelos y conexión DB):**
1. Crear el cluster en MongoDB Atlas y obtener la `URI` de conexión.
2. Definir el archivo `.env` para almacenar la variable `MONGO_URI` y el `PORT`.
3. Crear la configuración de conexión a Mongoose en `server.js` (o en una carpeta `config/`).
4. Escribir los archivos de esquema en la carpeta `/models/` (`Cliente.js` y `Usuario.js`).
