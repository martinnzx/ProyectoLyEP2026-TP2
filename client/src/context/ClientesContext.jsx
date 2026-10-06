import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import clientesService from "../services/clientesService";
import ClientesContext from "./ClientesContextDefinition";

export const ClientesProvider = ({ children }) => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const cargaClientes = useRef(null);

    const cargarClientes = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError("");
            const data = await clientesService.obtenerClientes(signal);
            setClientes(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err.name !== "CanceledError" && err.name !== "AbortError") {
                setError("Error al cargar los clientes.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let activo = true;
        const controller = new AbortController();

        if (!cargaClientes.current) {
            cargaClientes.current = clientesService.obtenerClientes(controller.signal);
        }

        cargaClientes.current
            .then((data) => {
                if (!activo) return;
                setClientes(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (activo && err.name !== "CanceledError" && err.name !== "AbortError") {
                    setError("Error al cargar los clientes.");
                }
            })
            .finally(() => {
                if (activo) {
                    setLoading(false);
                }
            });

        return () => {
            activo = false;
            controller.abort();
            cargaClientes.current = null;
        };
    }, []);

    const crearCliente = useCallback(async (datos) => {
        const clienteGuardado = await clientesService.crearCliente(datos);
        setClientes((clientesActuales) => [clienteGuardado, ...clientesActuales]);
        return clienteGuardado;
    }, []);

    const eliminarCliente = useCallback(async (id) => {
        await clientesService.eliminarCliente(id);
        setClientes((clientesActuales) =>
            clientesActuales.filter((cliente) => String(cliente.id) !== String(id))
        );
    }, []);

    const obtenerClientePorId = useCallback((id) =>
        clientes.find((cliente) => String(cliente.id) === String(id)),
        [clientes]
    );

    const actualizarCliente = useCallback(async (id, datos) => {
        const clienteActualizado = await clientesService.actualizarCliente(id, datos);
        setClientes((clientesActuales) =>
            clientesActuales.map((cliente) =>
                String(cliente.id) === String(id) ? clienteActualizado : cliente
            )
        );
        return clienteActualizado;
    }, []);

    const value = useMemo(
        () => ({
            clientes,
            loading,
            error,
            crearCliente,
            eliminarCliente,
            obtenerClientePorId,
            actualizarCliente,
            recargarClientes: cargarClientes
        }),
        [clientes, loading, error, crearCliente, eliminarCliente, obtenerClientePorId, actualizarCliente, cargarClientes]
    );

    return (
        <ClientesContext.Provider value={value}>
            {children}
        </ClientesContext.Provider>
    );
};
