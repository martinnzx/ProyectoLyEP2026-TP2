import { beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Aumentar timeout global para hooks y tests (MongoDB Memory Server puede
// demorar en descargar/iniciar el binario de MongoDB la primera vez)
jest.setTimeout(30000);

let mongoServer;

// Conectar a MongoDB en memoria antes de todos los tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

// Limpiar todas las colecciones después de cada test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// Desconectar y detener el servidor después de todos los tests
afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});
