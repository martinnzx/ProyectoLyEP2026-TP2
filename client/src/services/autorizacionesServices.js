import axios from "axios";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3001/api";
const AUTH_URL = `${API_BASE_URL}/auth`;

const login = async (email, password, sector) => {
  const respuesta = await axios.post(`${AUTH_URL}/login`, {
    email,
    password
  });

  const usuario = respuesta.data?.usuario || respuesta.data;

  // Validación de sector: asegurar que el usuario pertenezca al sector indicado
  if (sector && usuario.sector && usuario.sector !== sector) {
    const error = new Error("El sector seleccionado no coincide con el perfil del usuario.");
    error.response = {
      status: 403,
      data: { message: "El sector seleccionado no coincide con el perfil del usuario." }
    };
    throw error;
  }

  return usuario;
};

const registro = async (datosUsuario) => {
  const respuesta = await axios.post(`${AUTH_URL}/register`, datosUsuario);
  return respuesta.data;
};

const obtenerUsuarios = async () => {
  const respuesta = await axios.get(`${AUTH_URL}/usuarios`);
  return respuesta.data;
};

export default {
  login,
  registro,
  obtenerUsuarios
};