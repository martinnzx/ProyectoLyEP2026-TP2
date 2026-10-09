import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/clientesDB")
    .then(() => {
        console.log("Conectado a la base de datos MongoDB");
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error al conectar a la base de datos:", error.message);
    });