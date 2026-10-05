import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: {
        firstname: { type: String, required: true },
        lastname: { type: String, default: "-" }
    },
    phone: { type: String },
    address: {
        street: { type: String },
        number: { type: String },
        zipcode: { type: String },
        city: { type: String }
    }
}, {
    timestamps: true
});

// Transform the _id to id when returning JSON to be compatible with frontend
clienteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Cliente = mongoose.model("Cliente", clienteSchema);

export default Cliente;
