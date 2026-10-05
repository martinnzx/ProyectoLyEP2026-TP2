import { useContext } from "react";
import ClientesContext from "../context/ClientesContextDefinition";

const useClientes = () => {
    const contexto = useContext(ClientesContext);

    if (!contexto) {
        throw new Error("useClientes debe utilizarse dentro de ClientesProvider");
    }

    return contexto;
};

export default useClientes;