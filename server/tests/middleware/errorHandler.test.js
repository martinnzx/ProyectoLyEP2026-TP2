import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import "./../../tests/setup.js";
import { idInvalido } from "../helpers.js";

describe("Middleware de manejo de errores", () => {

    describe("notFound — Rutas no encontradas (404)", () => {

        test("debería retornar 404 para una ruta GET inexistente", async () => {
            const response = await request(app).get("/api/ruta-inexistente");

            expect(response.status).toBe(404);
            expect(response.body.message).toContain("Ruta no encontrada");
            expect(response.body.message).toContain("/api/ruta-inexistente");
        });

        test("debería retornar 404 para una ruta POST inexistente", async () => {
            const response = await request(app)
                .post("/api/otra-ruta-inexistente")
                .send({ dato: "test" });

            expect(response.status).toBe(404);
            expect(response.body.message).toContain("Ruta no encontrada");
        });

        test("debería incluir la URL original en el mensaje de error", async () => {
            const rutaTest = "/api/esta/ruta/no/existe";
            const response = await request(app).get(rutaTest);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain(rutaTest);
        });
    });

    describe("errorHandler — CastError (ID inválido de MongoDB)", () => {

        test("debería retornar 400 al buscar un cliente con ID de formato inválido", async () => {
            const response = await request(app)
                .get(`/api/clientes/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });

        test("debería retornar 400 al actualizar con ID de formato inválido", async () => {
            const response = await request(app)
                .put(`/api/clientes/${idInvalido}`)
                .send({ email: "test@email.com" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });

        test("debería retornar 400 al eliminar con ID de formato inválido", async () => {
            const response = await request(app)
                .delete(`/api/clientes/${idInvalido}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Formato de ID inválido");
        });
    });
});
