import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    sector: { type: String, enum: ['Soporte', 'Gerencia'], required: true }
}, {
    timestamps: true
});

// Remove password from JSON returns for security
usuarioSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
    }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
