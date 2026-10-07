import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import clientesService from "../services/clientesService";
import ClientesContext from "./ClientesContextDefinition";

const estadoInicial = {
    version: 1,
    clientesRemotos: [],
    clientesLocales: [],
    idsEliminados: [],
    ultimoId: 0
};

const idNumerico = (cliente) => Number(cliente?.id) || 0;

const mayorId = (clientes) =>
    clientes.reduce(
        (mayor, cliente) => Math.max(mayor, idNumerico(cliente)),
        0
    );

const combinarClientes = (estado) => {
    const idsEliminados = new Set(estado.idsEliminados.map(String));
    const clientes = [
        ...estado.clientesRemotos.filter(
            (cliente) => !idsEliminados.has(String(cliente?.id))
        ),
        ...estado.clientesLocales.filter(
            (cliente) => !idsEliminados.has(String(cliente?.id))
        )
    ];

    return Array.from(
        new Map(clientes.map((cliente) => [String(cliente?.id), cliente])).values()
    );
};

export const ClientesProvider = ({ children }) => {
    const [estado, setEstado] = useState(estadoInicial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const cargaClientes = useRef(null);

    useEffect(() => {
        let activo = true;
        const controller = new AbortController();

        if (!cargaClientes.current) {
            cargaClientes.current = clientesService.obtenerClientes(controller.signal);
        }

        cargaClientes.current
            .then((clientesRemotos) => {
                if (!activo) return;

                setEstado((estadoActual) => {
                    const ultimoId = Math.max(
                        estadoActual.ultimoId,
                        mayorId(clientesRemotos),
                        mayorId(estadoActual.clientesLocales)
                    );

                    return {
                        ...estadoActual,
                        clientesRemotos: Array.isArray(clientesRemotos) ? clientesRemotos : [],
                        ultimoId
                    };
                });
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

    const clientes = useMemo(() => combinarClientes(estado), [estado]);

    const crearCliente = useCallback(async (datos) => {
        const siguienteId = Math.max(
            estado.ultimoId,
            mayorId(estado.clientesRemotos),
            mayorId(estado.clientesLocales)
        ) + 1;
        const respuesta = await clientesService.crearCliente(datos);
        const cliente = respuesta?.id ? respuesta : { ...datos, id: siguienteId };

        setEstado((estadoActual) => ({
            ...estadoActual,
            clientesLocales: [...estadoActual.clientesLocales, cliente],
            ultimoId: siguienteId
        }));

        return cliente;
    }, [estado.ultimoId, estado.clientesRemotos, estado.clientesLocales]);

    const eliminarCliente = useCallback(async (id) => {
        await clientesService.eliminarCliente(id);

        setEstado((estadoActual) => ({
            ...estadoActual,
            clientesLocales: estadoActual.clientesLocales.filter(
                (cliente) => String(cliente?.id) !== String(id)
            ),
            idsEliminados: estadoActual.idsEliminados.includes(String(id))
                ? estadoActual.idsEliminados
                : [...estadoActual.idsEliminados, String(id)]
        }));
    }, []);

    const obtenerClientePorId = useCallback((id) =>
        clientes.find((cliente) => String(cliente?.id) === String(id)),
        [clientes]
    );

    const value = useMemo(
        () => ({
            clientes,
            loading,
            error,
            crearCliente,
            eliminarCliente,
            obtenerClientePorId
        }),
        [clientes, loading, error, crearCliente, eliminarCliente, obtenerClientePorId]
    );

    return (
        <ClientesContext.Provider value={value}>
            {children}
        </ClientesContext.Provider>
    );
};
