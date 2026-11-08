import "../css/preventa.css";
import { useEffect, useMemo, useState } from "react";
import Semaforo from "./Semaforo";
import EstadoConexion from "./EstadoConexion";
import useEstadoConexion from "../hooks/useEstadoConexion";
import useClientes from "../hooks/useClientes";
import registrosDemoService from "../services/registrosDemoService";
import { CATALOGO, obtenerDatosComerciales } from "../data/comprasDemo";
import { calcularSemaforo, calcularPedidoSugerido, totalPedido } from "../utils/reglas";

const MOTIVOS_NO_COMPRA = [
  "Tiene stock",
  "Le compró a otro distribuidor por precio",
  "Sin dinero",
  "Local cerrado",
  "Otro"
];

const pesos = (valor) =>
  valor.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const FichaComercial = ({ clienteId }) => {
  const { conectado } = useEstadoConexion();
  const { clientes } = useClientes();
  const ids = useMemo(() => clientes.map((c) => c.id).join(","), [clientes]);

  const { datos, semaforo, sugerido } = useMemo(() => {
    const hoy = new Date();
    const datosCliente = obtenerDatosComerciales(clienteId, hoy, ids.split(","));
    return {
      datos: datosCliente,
      semaforo: calcularSemaforo(datosCliente, hoy),
      sugerido: calcularPedidoSugerido(datosCliente.compras)
    };
  }, [clienteId, ids]);

  const [items, setItems] = useState(sugerido);
  const [productoNuevo, setProductoNuevo] = useState("");
  const [resultado, setResultado] = useState("compro");
  const [motivo, setMotivo] = useState(MOTIVOS_NO_COMPRA[0]);
  const [observacion, setObservacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registros, setRegistros] = useState(() => registrosDemoService.obtenerRegistros(clienteId));

  // Sincronización simulada: al recuperar la conexión, lo pendiente pasa a "Sincronizado"
  useEffect(() => {
    if (conectado) registrosDemoService.marcarSincronizados();
  }, [conectado]);

  const disponibles = CATALOGO.filter((p) => !items.some((i) => i.producto === p.producto));
  const porcentajeSaldo = datos.limiteCredito ? Math.round((datos.saldo / datos.limiteCredito) * 100) : 0;
  const editado = JSON.stringify(items) !== JSON.stringify(sugerido);

  const cambiarCantidad = (producto, cantidad) =>
    setItems((actuales) =>
      actuales.map((i) => (i.producto === producto ? { ...i, cantidad: Math.max(1, Number(cantidad) || 1) } : i))
    );

  const quitar = (producto) => setItems((actuales) => actuales.filter((i) => i.producto !== producto));

  const agregar = () => {
    const producto = CATALOGO.find((p) => p.producto === productoNuevo);
    if (!producto) return;
    setItems((actuales) => [...actuales, { ...producto, cantidad: 1 }]);
    setProductoNuevo("");
  };

  const registrar = (tipo, datosRegistro, texto) => {
    registrosDemoService.guardarRegistro(clienteId, tipo, datosRegistro, conectado);
    setRegistros(registrosDemoService.obtenerRegistros(clienteId));
    setMensaje(`${texto} ${conectado ? "y sincronizado." : "en el dispositivo. Queda pendiente de sincronizar."}`);
  };

  const confirmarPedido = () => {
    if (!items.length) return;
    registrar("pedido", { items, total: totalPedido(items), editado }, "Pedido registrado");
  };

  const guardarVisita = (evento) => {
    evento.preventDefault();
    registrar(
      "visita",
      { resultado, motivo: resultado === "no_compro" ? motivo : null, observacion: observacion.trim() },
      "Visita registrada"
    );
    setObservacion("");
  };

  return (
    <section className="ficha-comercial">
      <h2>Situación comercial</h2>
      <EstadoConexion />

      <div className={`ficha-semaforo ruta-item--${semaforo.color}`}>
        <Semaforo color={semaforo.color} />
        <span>{semaforo.motivo}</span>
      </div>

      <p>
        <strong>Saldo:</strong> {pesos(datos.saldo)} de {pesos(datos.limiteCredito)} de límite ({porcentajeSaldo} %)
      </p>
      <div className="barra-saldo" aria-hidden="true">
        <div
          className={`barra-saldo-relleno ${porcentajeSaldo > 90 ? "barra-saldo-relleno--alerta" : ""}`}
          style={{ width: `${Math.min(porcentajeSaldo, 100)}%` }}
        />
      </div>

      {mensaje && <p className="mensaje-eliminado">{mensaje}</p>}

      <h2>Pedido sugerido</h2>
      <p className="ruta-ayuda">Promedio de las últimas 4 compras. Podés modificarlo antes de confirmar.</p>

      {items.length === 0 ? (
        <p>El pedido está vacío. Agregá productos del catálogo.</p>
      ) : (
        <div className="tabla-pedido-contenedor">
          <table className="tabla-pedido">
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.producto}>
                  <td>{item.producto}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      className="input-cantidad"
                      aria-label={`Cantidad de ${item.producto}`}
                      value={item.cantidad}
                      onChange={(e) => cambiarCantidad(item.producto, e.target.value)}
                    />
                  </td>
                  <td>{pesos(item.precio)}</td>
                  <td>{pesos(item.precio * item.cantidad)}</td>
                  <td>
                    <button type="button" className="btn-quitar" onClick={() => quitar(item.producto)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pedido-acciones">
        <select
          aria-label="Producto a agregar"
          value={productoNuevo}
          onChange={(e) => setProductoNuevo(e.target.value)}
        >
          <option value="">Agregar producto…</option>
          {disponibles.map((p) => (
            <option key={p.producto} value={p.producto}>{p.producto} — {pesos(p.precio)}</option>
          ))}
        </select>
        <button type="button" className="btn-secundario" onClick={agregar} disabled={!productoNuevo}>
          Agregar
        </button>
        {editado && (
          <button type="button" className="btn-secundario" onClick={() => setItems(sugerido)}>
            Restaurar sugerido
          </button>
        )}
      </div>

      <p className="pedido-total"><strong>Total:</strong> {pesos(totalPedido(items))}</p>
      <button type="button" className="btn-preventa" onClick={confirmarPedido} disabled={!items.length}>
        Confirmar pedido
      </button>

      <h2>Registrar visita</h2>
      <form className="form-visita" onSubmit={guardarVisita}>
        <fieldset>
          <legend>Resultado</legend>
          <label>
            <input type="radio" name="resultado" value="compro" checked={resultado === "compro"} onChange={(e) => setResultado(e.target.value)} />
            {" "}Compró
          </label>
          <label>
            <input type="radio" name="resultado" value="no_compro" checked={resultado === "no_compro"} onChange={(e) => setResultado(e.target.value)} />
            {" "}No compró
          </label>
        </fieldset>

        {resultado === "no_compro" && (
          <label>
            Motivo
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
              {MOTIVOS_NO_COMPRA.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
        )}

        <label>
          Observación
          <textarea rows="2" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
        </label>

        <button type="submit" className="btn-preventa">Guardar visita</button>
      </form>

      <h2>Registros de este cliente</h2>
      {registros.length === 0 ? (
        <p>Todavía no hay pedidos ni visitas registrados.</p>
      ) : (
        <ul className="lista-registros">
          {registros.map((r) => (
            <li key={r.id}>
              <span>
                {new Date(r.fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })} ·{" "}
                {r.tipo === "pedido"
                  ? `Pedido por ${pesos(r.total)}${r.editado ? " (sugerido modificado)" : " (sugerido sin cambios)"}`
                  : `Visita: ${r.resultado === "compro" ? "compró" : `no compró — ${r.motivo}`}`}
              </span>
              <span className={`etiqueta-sync ${r.sincronizado || conectado ? "etiqueta-sync--ok" : ""}`}>
                {r.sincronizado || conectado ? "Sincronizado" : "Pendiente de sincronizar"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default FichaComercial;
