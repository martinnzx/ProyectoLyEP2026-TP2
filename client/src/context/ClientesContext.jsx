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
    const idsEliminados = new Set(estado.idsEliminados);
    const clientes = [
        ...estado.clientesRemotos.filter(
            (cliente) => !idsEliminados.has(idNumerico(cliente))
        ),
        ...estado.clientesLocales.filter(
            (cliente) => !idsEliminados.has(idNumerico(cliente))
        )
    ];

    return Array.from(
        new Map(clientes.map((cliente) => [idNumerico(cliente), cliente])).values()
    ).sort((a, b) => idNumerico(b) - idNumerico(a));
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
                        mayorId(estadoActual.clientesLocales),
                        ...estadoActual.idsEliminados
                    );

                    return {
                        ...estadoActual,
                        clientesRemotos,
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
            mayorId(estado.clientesLocales),
            ...estado.idsEliminados
        ) + 1;
        const cliente = { ...datos, id: siguienteId };

        await clientesService.crearCliente(cliente);

        setEstado((estadoActual) => ({
            ...estadoActual,
            clientesLocales: [...estadoActual.clientesLocales, cliente],
            ultimoId: siguienteId
        }));

        return cliente;
    }, [estado.ultimoId, estado.clientesRemotos, estado.clientesLocales, estado.idsEliminados]);

    const eliminarCliente = useCallback(async (id) => {
        await clientesService.eliminarCliente(id);

        setEstado((estadoActual) => ({
            ...estadoActual,
            clientesLocales: estadoActual.clientesLocales.filter(
                (cliente) => idNumerico(cliente) !== Number(id)
            ),
            idsEliminados: estadoActual.idsEliminados.includes(Number(id))
                ? estadoActual.idsEliminados
                : [...estadoActual.idsEliminados, Number(id)]
        }));
    }, []);

    const obtenerClientePorId = useCallback((id) =>
        clientes.find((cliente) => idNumerico(cliente) === Number(id)),
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
