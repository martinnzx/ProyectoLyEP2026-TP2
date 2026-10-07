import express from "express";
import cors from "cors";

import clienteRoutes from "./routes/clienteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Panel de Control de Clientes funcionando.");
});

app.use("/api/clientes", clienteRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
