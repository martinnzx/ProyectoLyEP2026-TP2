import { describe, test, expect } from "@jest/globals";
import Usuario from "../../models/Usuario.js";
import "./../../tests/setup.js";

describe("Modelo Usuario", () => {

    describe("Creación exitosa", () => {

        test("debería crear un usuario con todos los campos válidos", async () => {
            const datosUsuario = {
                email: "admin@empresa.com",
                password: "password123",
                nombre: "Admin Principal",
                sector: "Gerencia"
            };

            const usuario = new Usuario(datosUsuario);
            const usuarioGuardado = await usuario.save();

            expect(usuarioGuardado._id).toBeDefined();
            expect(usuarioGuardado.email).toBe(datosUsuario.email);
            expect(usuarioGuardado.password).not.toBe(datosUsuario.password);
            expect(usuarioGuardado.password.startsWith('$2')).toBe(true); // bcrypt hash
            expect(usuarioGuardado.nombre).toBe(datosUsuario.nombre);
            expect(usuarioGuardado.sector).toBe(datosUsuario.sector);
        });

        test("debería aceptar 'Soporte' como valor de sector", async () => {
            const usuario = new Usuario({
                email: "soporte@empresa.com",
                password: "pass123",
                nombre: "Agente Soporte",
                sector: "Soporte"
            });
            const usuarioGuardado = await usuario.save();

            expect(usuarioGuardado.sector).toBe("Soporte");
        });

        test("debería aceptar 'Gerencia' como valor de sector", async () => {
            const usuario = new Usuario({
                email: "gerencia@empresa.com",
                password: "pass123",
                nombre: "Gerente",
                sector: "Gerencia"
            });
            const usuarioGuardado = await usuario.save();

            expect(usuarioGuardado.sector).toBe("Gerencia");
        });

        test("debería generar timestamps automáticamente", async () => {
            const usuario = new Usuario({
                email: "timestamps@empresa.com",
                password: "pass123",
                nombre: "Timestamp Test",
                sector: "Soporte"
            });
            const usuarioGuardado = await usuario.save();

            expect(usuarioGuardado.createdAt).toBeDefined();
            expect(usuarioGuardado.updatedAt).toBeDefined();
            expect(usuarioGuardado.createdAt).toBeInstanceOf(Date);
        });
    });

    describe("Validación de campos requeridos", () => {

        test("debería fallar sin el campo email", async () => {
            const usuario = new Usuario({
                password: "pass123",
                nombre: "Sin Email",
                sector: "Soporte"
            });

            await expect(usuario.save()).rejects.toThrow();
        });

        test("debería fallar sin el campo password", async () => {
            const usuario = new Usuario({
                email: "sinpass@empresa.com",
                nombre: "Sin Password",
                sector: "Soporte"
            });

            await expect(usuario.save()).rejects.toThrow();
        });

        test("debería fallar sin el campo nombre", async () => {
            const usuario = new Usuario({
                email: "sinnombre@empresa.com",
                password: "pass123",
                sector: "Soporte"
            });

            await expect(usuario.save()).rejects.toThrow();
        });

        test("debería fallar sin el campo sector", async () => {
            const usuario = new Usuario({
                email: "sinsector@empresa.com",
                password: "pass123",
                nombre: "Sin Sector"
            });

            await expect(usuario.save()).rejects.toThrow();
        });

        test("debería fallar con un sector que no sea 'Soporte' o 'Gerencia'", async () => {
            const usuario = new Usuario({
                email: "sectorinvalido@empresa.com",
                password: "pass123",
                nombre: "Sector Invalido",
                sector: "Ventas"
            });

            await expect(usuario.save()).rejects.toThrow();
        });
    });

    describe("Transformación toJSON", () => {

        test("debería transformar _id a id en la respuesta JSON", async () => {
            const usuario = new Usuario({
                email: "json@empresa.com",
                password: "pass123",
                nombre: "JSON Test",
                sector: "Soporte"
            });
            const usuarioGuardado = await usuario.save();
            const usuarioJSON = usuarioGuardado.toJSON();

            expect(usuarioJSON.id).toBeDefined();
            expect(usuarioJSON._id).toBeUndefined();
        });

        test("debería eliminar el campo __v en la respuesta JSON", async () => {
            const usuario = new Usuario({
                email: "version@empresa.com",
                password: "pass123",
                nombre: "Version Test",
                sector: "Gerencia"
            });
            const usuarioGuardado = await usuario.save();
            const usuarioJSON = usuarioGuardado.toJSON();

            expect(usuarioJSON.__v).toBeUndefined();
        });

        test("debería OCULTAR el campo password en la respuesta JSON (seguridad)", async () => {
            const usuario = new Usuario({
                email: "seguridad@empresa.com",
                password: "contraseña_secreta",
                nombre: "Test Seguridad",
                sector: "Gerencia"
            });
            const usuarioGuardado = await usuario.save();
            const usuarioJSON = usuarioGuardado.toJSON();

            expect(usuarioJSON.password).toBeUndefined();
            // Verificar que el password SÍ existe en el documento original y está hasheado
            expect(usuarioGuardado.password).toBeDefined();
            expect(usuarioGuardado.password).not.toBe("contraseña_secreta");
        });
    });
});
