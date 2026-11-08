import "../css/preventa.css";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import useClientes from "../hooks/useClientes";
import EmptyState from "../components/EmptyState";
import EstadoConexion from "../components/EstadoConexion";
import Semaforo from "../components/Semaforo";
import { obtenerDatosComerciales } from "../data/comprasDemo";
import { calcularSemaforo, compararPorRiesgo } from "../utils/reglas";

const HojaRuta = () => {
  const { clientes, loading, error } = useClientes();

  const ruta = useMemo(() => {
    const hoy = new Date();
    const ids = clientes.map((c) => c.id);
    return clientes
      .map((cliente) => ({
        cliente,
        ...calcularSemaforo(obtenerDatosComerciales(cliente.id, hoy, ids), hoy)
      }))
      .sort(compararPorRiesgo);
  }, [clientes]);

  const conteo = (color) => ruta.filter((item) => item.color === color).length;

  if (loading) return <h2>Cargando hoja de ruta...</h2>;
  if (error) return <h2>{error}</h2>;

  return (
    <div className="preventa">
      <h1>Hoja de ruta del día</h1>
      <EstadoConexion />

      <div className="ruta-resumen">
        <span><Semaforo color="rojo" /> {conteo("rojo")}</span>
        <span><Semaforo color="amarillo" /> {conteo("amarillo")}</span>
        <span><Semaforo color="verde" /> {conteo("verde")}</span>
      </div>
      <p className="ruta-ayuda">
        Prioridad de visita: primero los clientes en rojo. Datos comerciales simulados (ERP de prueba).
      </p>

      {ruta.length === 0 ? (
        <EmptyState titulo="Sin clientes" mensaje="No hay clientes cargados para armar la hoja de ruta." />
      ) : (
        <ol className="ruta-lista">
          {ruta.map(({ cliente, color, motivo }) => (
            <li key={cliente.id} className={`ruta-item ruta-item--${color}`}>
              <div className="ruta-item-datos">
                <Semaforo color={color} />
                <strong>{cliente.name?.firstname} {cliente.name?.lastname}</strong>
                <span className="ruta-item-direccion">
                  {[cliente.address?.street, cliente.address?.number, cliente.address?.city].filter(Boolean).join(" ") || "Sin dirección"}
                </span>
                <span className="ruta-item-motivo">{motivo}</span>
              </div>
              <Link className="btn-preventa" to={`/clientes/${cliente.id}`}>Abrir ficha</Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default HojaRuta;
