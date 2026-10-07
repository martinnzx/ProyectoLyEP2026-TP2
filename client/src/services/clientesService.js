import axios from "axios";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3001/api";
const CLIENTES_URL = `${API_BASE_URL}/clientes`;

const obtenerClientes = async (signal) => {
    const config = signal ? { signal } : undefined;
    const respuesta = await axios.get(CLIENTES_URL, config);
    return respuesta.data;
};

const obtenerClientePorId = async (id, signal) => {
    const config = signal ? { signal } : undefined;
    const respuesta = await axios.get(`${CLIENTES_URL}/${id}`, config);
    return respuesta.data;
};

const crearCliente = async (cliente) => {
    const respuesta = await axios.post(CLIENTES_URL, cliente);
    return respuesta.data;
};

const actualizarCliente = async (id, cliente) => {
    const respuesta = await axios.put(`${CLIENTES_URL}/${id}`, cliente);
    return respuesta.data;
};

const eliminarCliente = async (id) => {
    const respuesta = await axios.delete(`${CLIENTES_URL}/${id}`);
    return respuesta.data;
};

export default {
    obtenerClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};