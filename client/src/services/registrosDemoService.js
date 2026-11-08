// Prototipo: pedidos y visitas se guardan en el navegador (localStorage), no en la base.
// La sincronización con el servidor se asume resuelta: solo se simula el estado
// "Pendiente de sincronizar" / "Sincronizado".

const CLAVE = "registrosPreventa";

const leer = () => {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
};

const escribir = (registros) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(registros));
  } catch {
    // Sin almacenamiento disponible: el registro se pierde al recargar
  }
};

const guardarRegistro = (clienteId, tipo, datos, conectado) => {
  const registro = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    clienteId: String(clienteId),
    tipo, // "pedido" | "visita"
    fecha: new Date().toISOString(),
    sincronizado: conectado,
    ...datos
  };
  escribir([registro, ...leer()]);
  return registro;
};

const obtenerRegistros = (clienteId) =>
  leer().filter((registro) => registro.clienteId === String(clienteId));

const marcarSincronizados = () => {
  const registros = leer();
  if (registros.some((r) => !r.sincronizado)) {
    escribir(registros.map((r) => ({ ...r, sincronizado: true })));
  }
};

export default { guardarRegistro, obtenerRegistros, marcarSincronizados };
