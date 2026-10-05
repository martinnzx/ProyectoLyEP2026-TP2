import axios from "axios";

const URL = "https://fakestoreapi.com/users";

const obtenerClientes = async (signal) => {
    const config = signal ? { signal } : undefined;
    const respuesta = await axios.get(URL, config);
    return respuesta.data;
};

const crearCliente = async (cliente) => {
    const respuesta = await axios.post(
        URL,
        cliente
    );

    return respuesta.data;
};

const eliminarCliente = async (id) => {
    const respuesta = await axios.delete(`${URL}/${id}`);
    return respuesta.data;
};

export default {
    obtenerClientes,
    crearCliente,
    eliminarCliente
};