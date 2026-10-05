import '../css/detallecliente.css'
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useClientes from "../hooks/useClientes";
import EmptyState from "../components/EmptyState";
import useAutorizaciones from "../hooks/useAutorizaciones";

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAutorizaciones();
  const role = admin?.sector;
  const { loading, obtenerClientePorId, eliminarCliente: quitarCliente } = useClientes();

  const [mensaje, setMensaje] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const cliente = obtenerClientePorId(id);

  const manejarEliminacion = async () => {
    try {
      setEliminando(true);
      await quitarCliente(Number(id));
      setMensaje("Cliente eliminado correctamente");
      navigate("/clientes");
    } catch {
      setMensaje("Error al eliminar cliente");
    } finally {
      setEliminando(false);
    }
  };

  if (loading) {
    return <h2>Cargando cliente...</h2>;
  }

  if (!cliente) {
    return (
      <EmptyState 
        titulo="Cliente no encontrado"
        mensaje="El ID especificado no corresponde a ningún cliente registrado."
        accion={{ texto: "Volver a la lista", onClick: () => navigate("/clientes") }}
      />
    );
  }

  return (
    <div className="detalle-cliente">
      <h1>Ficha del Cliente</h1>
      <p>Rol actual: {role}</p>

      {mensaje && <p className="mensaje-eliminado">{mensaje}</p>}

      <p>
        <strong>ID:</strong> {cliente.id}
      </p>

      <p>
        <strong>Nombre:</strong>{" "}
        {cliente.name?.firstname} {cliente.name?.lastname}
      </p>

      <p>
        <strong>Email:</strong> {cliente.email}
      </p>

      <p>
        <strong>Teléfono:</strong> {cliente.phone}
      </p>

      <h2>Dirección</h2>

      <p>
        <strong>Calle:</strong> {cliente.address?.street || "-"}
      </p>

      <p>
        <strong>Número:</strong> {cliente.address?.number || "-"}
      </p>

      <p>
        <strong>Código Postal:</strong> {cliente.address?.zipcode || "-"}
      </p>

      <p>
        <strong>Ciudad:</strong> {cliente.address?.city || "-"}
      </p>

      <h2>Credenciales</h2>

      <p>
        <strong>Usuario:</strong> {cliente.username}
      </p>

      {role?.trim() === "Gerencia" && (
        <button
          className="btn-eliminar"
          onClick={manejarEliminacion}
          disabled={eliminando}
        >
          {eliminando ? "Eliminando..." : "Eliminar Cliente"}
        </button>
      )}
    </div>
  );
};

export default DetalleCliente;
