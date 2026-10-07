import { describe, test, expect } from "@jest/globals";
import Cliente from "../../models/Cliente.js";
import "./../../tests/setup.js";

describe("Modelo Cliente", () => {
    
    describe("Creación exitosa", () => {
        
        test("debería crear un cliente con todos los campos válidos", async () => {
            const datosCliente = {
                email: "test@email.com",
                username: "testuser",
                name: {
                    firstname: "Test",
                    lastname: "Usuario"
                },
                phone: "3515551234",
                address: {
                    street: "Calle Test",
                    number: "100",
                    zipcode: "5000",
                    city: "Córdoba"
                }
            };

            const cliente = new Cliente(datosCliente);
            const clienteGuardado = await cliente.save();

            expect(clienteGuardado._id).toBeDefined();
            expect(clienteGuardado.email).toBe(datosCliente.email);
            expect(clienteGuardado.username).toBe(datosCliente.username);
            expect(clienteGuardado.name.firstname).toBe(datosCliente.name.firstname);
            expect(clienteGuardado.name.lastname).toBe(datosCliente.name.lastname);
            expect(clienteGuardado.phone).toBe(datosCliente.phone);
            expect(clienteGuardado.address.street).toBe(datosCliente.address.street);
            expect(clienteGuardado.address.city).toBe(datosCliente.address.city);
        });

        test("debería crear un cliente con solo campos requeridos (mínimo)", async () => {
            const clienteMinimo = {
                email: "minimo@email.com",
                username: "minimo",
                name: { firstname: "Minimo" }
            };

            const cliente = new Cliente(clienteMinimo);
            const clienteGuardado = await cliente.save();

            expect(clienteGuardado._id).toBeDefined();
            expect(clienteGuardado.email).toBe(clienteMinimo.email);
            expect(clienteGuardado.username).toBe(clienteMinimo.username);
            expect(clienteGuardado.name.firstname).toBe(clienteMinimo.name.firstname);
        });

        test("debería asignar '-' como valor por defecto a lastname", async () => {
            const clienteSinLastname = {
                email: "sinlastname@email.com",
                username: "sinlastname",
                name: { firstname: "SinApellido" }
            };

            const cliente = new Cliente(clienteSinLastname);
            const clienteGuardado = await cliente.save();

            expect(clienteGuardado.name.lastname).toBe("-");
        });

        test("debería generar timestamps automáticamente (createdAt, updatedAt)", async () => {
            const cliente = new Cliente({
                email: "timestamps@email.com",
                username: "timestamps",
                name: { firstname: "Timestamp" }
            });
            const clienteGuardado = await cliente.save();

            expect(clienteGuardado.createdAt).toBeDefined();
            expect(clienteGuardado.updatedAt).toBeDefined();
            expect(clienteGuardado.createdAt).toBeInstanceOf(Date);
        });
    });

    describe("Validación de campos requeridos", () => {

        test("debería fallar sin el campo email", async () => {
            const clienteSinEmail = new Cliente({
                username: "sinemail",
                name: { firstname: "SinEmail" }
            });

            await expect(clienteSinEmail.save()).rejects.toThrow();
        });

        test("debería fallar sin el campo username", async () => {
            const clienteSinUsername = new Cliente({
                email: "sinusername@email.com",
                name: { firstname: "SinUsername" }
            });

            await expect(clienteSinUsername.save()).rejects.toThrow();
        });

        test("debería fallar sin el campo name.firstname", async () => {
            const clienteSinFirstname = new Cliente({
                email: "sinfirstname@email.com",
                username: "sinfirstname"
            });

            await expect(clienteSinFirstname.save()).rejects.toThrow();
        });
    });

    describe("Transformación toJSON", () => {

        test("debería transformar _id a id en la respuesta JSON", async () => {
            const cliente = new Cliente({
                email: "json@email.com",
                username: "jsontest",
                name: { firstname: "JSON" }
            });
            const clienteGuardado = await cliente.save();
            const clienteJSON = clienteGuardado.toJSON();

            expect(clienteJSON.id).toBeDefined();
            expect(clienteJSON._id).toBeUndefined();
        });

        test("debería eliminar el campo __v en la respuesta JSON", async () => {
            const cliente = new Cliente({
                email: "version@email.com",
                username: "versiontest",
                name: { firstname: "Version" }
            });
            const clienteGuardado = await cliente.save();
            const clienteJSON = clienteGuardado.toJSON();

            expect(clienteJSON.__v).toBeUndefined();
        });
    });
});
