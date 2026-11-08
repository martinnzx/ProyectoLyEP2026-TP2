import { useEffect, useState } from "react";
import useClientes from "./useClientes";

// Prototipo: el dispositivo está "conectado" si el navegador tiene red
// y los clientes se pudieron traer del servidor (no de la copia descargada).
const useEstadoConexion = () => {
  const { descargaUsada } = useClientes();
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  useEffect(() => {
    const actualizar = () => setEnLinea(navigator.onLine);
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  return { conectado: enLinea && !descargaUsada, descargaUsada };
};

export default useEstadoConexion;
