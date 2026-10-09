import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    sector: { type: String, enum: ['Soporte', 'Gerencia'], required: true }
}, {
    timestamps: true
});

// Hook para encriptar la contraseña antes de guardar
usuarioSchema.pre('save', async function() {
    // Si la contraseña no ha sido modificada, terminamos la ejecución del hook
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
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
