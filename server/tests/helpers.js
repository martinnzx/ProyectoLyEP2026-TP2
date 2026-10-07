/**
 * Datos de prueba reutilizables para los tests del backend.
 * Se definen aquí para evitar duplicación y facilitar el mantenimiento.
 */

// Datos válidos de un cliente completo
export const clienteValido = {
    email: "juan.perez@email.com",
    username: "juanperez",
    name: {
        firstname: "Juan",
        lastname: "Pérez"
    },
    phone: "3515551234",
    address: {
        street: "Av. Colón",
        number: "1234",
        zipcode: "5000",
        city: "Córdoba"
    }
};

// Datos de un cliente con campos mínimos requeridos
export const clienteMinimo = {
    email: "maria@email.com",
    username: "mariagarcia",
    name: {
        firstname: "María"
    }
};

// Datos incompletos de un cliente (falta username)
export const clienteIncompleto = {
    email: "incompleto@email.com",
    name: {
        firstname: "Incompleto"
    }
};

// Datos incompletos sin firstname
export const clienteSinFirstname = {
    email: "sinnombre@email.com",
    username: "sinnombre"
};

// Datos válidos de un usuario del sistema
export const usuarioValido = {
    email: "admin@empresa.com",
    password: "password123",
    nombre: "Admin Principal",
    sector: "Gerencia"
};

// Segundo usuario para tests de duplicados
export const usuarioSoporte = {
    email: "soporte@empresa.com",
    password: "soporte456",
    nombre: "Agente Soporte",
    sector: "Soporte"
};

// Usuario con sector inválido
export const usuarioSectorInvalido = {
    email: "invalido@empresa.com",
    password: "pass123",
    nombre: "Usuario Invalido",
    sector: "Ventas"
};

// Usuario con campos faltantes
export const usuarioIncompleto = {
    email: "incompleto@empresa.com",
    password: "pass123"
};

// ID de MongoDB con formato válido pero inexistente
export const idInexistente = "60f7b2c2e1d3a4001c8e4f99";

// ID con formato inválido
export const idInvalido = "id-no-valido-123";
