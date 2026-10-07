import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import Usuario from "../../models/Usuario.js";
import "./../../tests/setup.js";
import {
    usuarioValido,
    usuarioSoporte,
    usuarioSectorInvalido,
    usuarioIncompleto
} from "../helpers.js";

describe("Rutas /api/auth", () => {

    // =============================================
    // PRUEBAS DE RUTAS GET
    // =============================================

    describe("GET /api/auth/usuarios", () => {

        test("debería retornar un array vacío cuando no hay usuarios", async () => {
            const response = await request(app).get("/api/auth/usuarios");

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body).toHaveLength(0);
        });

        test("debería retornar todos los usuarios registrados", async () => {
            await Usuario.create(usuarioValido);
            await Usuario.create(usuarioSoporte);

            const response = await request(app).get("/api/auth/usuarios");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        test("debería retornar usuarios SIN el campo password (seguridad)", async () => {
            await Usuario.create(usuarioValido);

            const response = await request(app).get("/api/auth/usuarios");

            expect(response.body[0].password).toBeUndefined();
            expect(response.body[0].email).toBe(usuarioValido.email);
            expect(response.body[0].nombre).toBe(usuarioValido.nombre);
        });
    });

    // =============================================
    // PRUEBAS DE RUTAS POST (Register)
    // =============================================

    describe("POST /api/auth/register", () => {

        test("debería registrar un usuario exitosamente (201)", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(usuarioValido);

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body.email).toBe(usuarioValido.email);
            expect(response.body.nombre).toBe(usuarioValido.nombre);
            expect(response.body.sector).toBe(usuarioValido.sector);
            // El password NO debe aparecer en la respuesta
            expect(response.body.password).toBeUndefined();
        });

        test("debería retornar 400 cuando faltan campos obligatorios", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(usuarioIncompleto);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("obligatorios");
        });

        test("debería retornar 400 cuando el sector no es válido", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(usuarioSectorInvalido);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("Soporte");
            expect(response.body.message).toContain("Gerencia");
        });

        test("debería retornar 400 cuando el email ya está registrado", async () => {
            // Registrar usuario por primera vez
            await request(app).post("/api/auth/register").send(usuarioValido);

            // Intentar registrar de nuevo con el mismo email
            const response = await request(app)
                .post("/api/auth/register")
                .send(usuarioValido);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("email ya se encuentra registrado");
        });

        test("debería retornar 400 cuando no se envía body", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({});

            expect(response.status).toBe(400);
        });
    });

    // =============================================
    // PRUEBAS DE RUTAS POST (Login)
    // =============================================

    describe("POST /api/auth/login", () => {

        test("debería autenticar exitosamente con credenciales correctas (200)", async () => {
            // Primero registrar un usuario
            await Usuario.create(usuarioValido);

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: usuarioValido.email,
                    password: usuarioValido.password
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Autenticación exitosa");
            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.email).toBe(usuarioValido.email);
            expect(response.body.usuario.nombre).toBe(usuarioValido.nombre);
            // El password NO debe estar en la respuesta del usuario
            expect(response.body.usuario.password).toBeUndefined();
        });

        test("debería retornar 401 con email incorrecto", async () => {
            await Usuario.create(usuarioValido);

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "noexiste@email.com",
                    password: usuarioValido.password
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Credenciales inválidas");
        });

        test("debería retornar 401 con password incorrecto", async () => {
            await Usuario.create(usuarioValido);

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: usuarioValido.email,
                    password: "password_incorrecta"
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Credenciales inválidas");
        });

        test("debería retornar 400 cuando no se envía email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ password: "alguna_password" });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("email y contraseña");
        });

        test("debería retornar 400 cuando no se envía password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({ email: "algo@email.com" });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain("email y contraseña");
        });

        test("debería retornar 400 con body vacío", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({});

            expect(response.status).toBe(400);
        });
    });
});
