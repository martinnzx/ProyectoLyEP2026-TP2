// Middleware para rutas no encontradas (404)
export const notFound = (req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada - ${req.originalUrl}` });
};

// Middleware central de captura de errores
export const errorHandler = (err, req, res, next) => {
    // ID inválido de MongoDB (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Formato de ID inválido' });
    }

    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        const mensajes = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Error de validación', errores: mensajes });
    }

    // Clave duplicada en MongoDB (código 11000)
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue)[0];
        return res.status(400).json({ message: `El campo ${campo} ya se encuentra registrado` });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Error interno del servidor'
    });
};