import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes (to be defined in Part 3)
app.get("/", (req, res) => {
    res.send("API Panel de Control de Clientes funcionando.");
});

// DB Connection and Server Start
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
