import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import Cliente from "../../models/Cliente.js";
import "./../../tests/setup.js";
import {
    clienteValido,
    clienteMinimo,
    clienteIncompleto,
    clienteSinFirstname,
    idInexistente,
    idInvalido
} from "../helpers.js";

describe("Rutas /api/clientes", () => {

    // =============================================
    // PRUEBAS DE RUTAS GET
    // =============================================
    
    describe("GET /", () => {

        test("debería responder con el mensaje de bienvenida de la API", async () => {
            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.text).toContain("API Panel de Control de Clientes funcionando");
        });
    });

    describe("GET /api/clientes", () => {

        test("debería retornar un array vacío cuando no hay clientes", async () => {
            const response = await request(app).get("/api/clientes");

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });

        test("debería retornar todos los clientes existentes", async () => {
            // Insertar clientes de prueba directamente en la BD
            await Cliente.create(clienteValido);
            await Cliente.create(clienteMinimo);

            const response = await request(app).get("/api/clientes");

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(2);
        });

        test("debería retornar clientes con el campo 'id' (no '_id')", async () => {
            await Cliente.create(clienteValido);

            const response = await request(app).get("/api/clientes");

            expect(response.body[0].id).toBeDefined();
            expect(response.body[0]._id).toBeUndefined();
            expect(response.body[0].__v).toBeUndefined();
        });
    });

    describe("GET /api/clientes/:id", () => {

        test("debería retornar un cliente por su ID", async () => {
            const clienteCreado = await Cliente.create(clienteValido);

            const response = await request(app)
                .get(`/api/clientes/${clienteCreado._id}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(clienteValido.email);
            expect(response.body.username).toBe(clienteValido.username);
            expect(response.body.name.firstname).toBe(clienteValido.name.firstname);
        });

        test("debería retornar 404 para un ID inexistente", async () => {
            const response = await request(app)
                .get(`/api/clientes/${idInexistente}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Cliente no encontrado");
        });

        test("debería retornar 400 para un ID con formato inválido", async () => {
            const response = await request(app)
                .get(`/api/clientes/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });
    });

    // =============================================
    // PRUEBAS DE RUTAS POST / PUT / DELETE
    // =============================================

    describe("POST /api/clientes", () => {

        test("debería crear un cliente exitosamente con datos completos (201)", async () => {
            const response = await request(app)
                .post("/api/clientes")
                .send(clienteValido);

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body.email).toBe(clienteValido.email);
            expect(response.body.username).toBe(clienteValido.username);
            expect(response.body.name.firstname).toBe(clienteValido.name.firstname);
            expect(response.body.name.lastname).toBe(clienteValido.name.lastname);
            expect(response.body.phone).toBe(clienteValido.phone);
        });

        test("debería crear un cliente con campos mínimos requeridos (201)", async () => {
            const response = await request(app)
                .post("/api/clientes")
                .send(clienteMinimo);

            expect(response.status).toBe(201);
            expect(response.body.email).toBe(clienteMinimo.email);
            expect(response.body.name.lastname).toBe("-");
        });

        test("debería retornar 400 cuando falta el campo username", async () => {
            const response = await request(app)
                .post("/api/clientes")
                .send(clienteIncompleto);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("obligatorios");
        });

        test("debería retornar 400 cuando falta name.firstname", async () => {
            const response = await request(app)
                .post("/api/clientes")
                .send(clienteSinFirstname);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("obligatorios");
        });

        test("debería retornar 400 cuando el username ya está en uso", async () => {
            // Crear el primer cliente
            await request(app).post("/api/clientes").send(clienteValido);

            // Intentar crear otro con el mismo username
            const clienteDuplicado = {
                email: "otro@email.com",
                username: clienteValido.username,  // username duplicado
                name: { firstname: "Otro" }
            };

            const response = await request(app)
                .post("/api/clientes")
                .send(clienteDuplicado);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("username ya está en uso");
        });
    });

    describe("PUT /api/clientes/:id", () => {

        test("debería actualizar un cliente exitosamente (200)", async () => {
            const clienteCreado = await Cliente.create(clienteValido);

            const datosActualizados = {
                email: "actualizado@email.com",
                name: {
                    firstname: "Actualizado",
                    lastname: "Nuevo"
                }
            };

            const response = await request(app)
                .put(`/api/clientes/${clienteCreado._id}`)
                .send(datosActualizados);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe("actualizado@email.com");
            expect(response.body.name.firstname).toBe("Actualizado");
        });

        test("debería retornar 404 al actualizar un cliente inexistente", async () => {
            const response = await request(app)
                .put(`/api/clientes/${idInexistente}`)
                .send({ email: "noexiste@email.com" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Cliente no encontrado");
        });

        test("debería retornar 400 al actualizar con un ID de formato inválido", async () => {
            const response = await request(app)
                .put(`/api/clientes/${idInvalido}`)
                .send({ email: "invalido@email.com" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });
    });

    describe("DELETE /api/clientes/:id", () => {

        test("debería eliminar un cliente exitosamente (200)", async () => {
            const clienteCreado = await Cliente.create(clienteValido);

            const response = await request(app)
                .delete(`/api/clientes/${clienteCreado._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Cliente eliminado correctamente");
            expect(response.body.id).toBe(clienteCreado._id.toString());

            // Verificar que realmente fue eliminado
            const clienteBuscado = await Cliente.findById(clienteCreado._id);
            expect(clienteBuscado).toBeNull();
        });

        test("debería retornar 404 al eliminar un cliente inexistente", async () => {
            const response = await request(app)
                .delete(`/api/clientes/${idInexistente}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Cliente no encontrado");
        });

        test("debería retornar 400 al eliminar con un ID de formato inválido", async () => {
            const response = await request(app)
                .delete(`/api/clientes/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });
    });
});
