// Datos comerciales SIMULADOS para el prototipo (reemplazan la lectura del ERP).
// Cada cliente real de la base recibe uno de estos perfiles según su id, siempre el mismo.
// Las fechas se generan relativas a "hoy", así el color de cada cliente no cambia con el paso de los días.

export const CATALOGO = [
  { producto: "Yerba mate 1 kg", precio: 4200 },
  { producto: "Azúcar 1 kg", precio: 1300 },
  { producto: "Aceite girasol 1,5 l", precio: 3100 },
  { producto: "Fideos secos 500 g", precio: 950 },
  { producto: "Harina 000 1 kg", precio: 900 },
  { producto: "Gaseosa cola 2,25 l", precio: 2800 },
  { producto: "Galletitas surtidas", precio: 1500 },
  { producto: "Arroz largo fino 1 kg", precio: 1700 },
  { producto: "Leche larga vida 1 l", precio: 1400 },
  { producto: "Lavandina 1 l", precio: 800 }
];

const precio = (producto) => CATALOGO.find((p) => p.producto === producto)?.precio ?? 0;

// frecuencia: días entre compras · ultima: días desde la última compra
const PERFILES = [
  { // Rojo por días (ejemplo del TP03: compra cada 7 y lleva 16)
    frecuencia: 7, ultima: 16, saldo: 45000, limiteCredito: 300000,
    productos: [["Yerba mate 1 kg", 6], ["Azúcar 1 kg", 10], ["Gaseosa cola 2,25 l", 12], ["Galletitas surtidas", 8]]
  },
  { // Verde
    frecuencia: 7, ultima: 3, saldo: 20000, limiteCredito: 200000,
    productos: [["Fideos secos 500 g", 20], ["Harina 000 1 kg", 15], ["Aceite girasol 1,5 l", 6]]
  },
  { // Amarillo
    frecuencia: 10, ultima: 17, saldo: 60000, limiteCredito: 250000,
    productos: [["Leche larga vida 1 l", 24], ["Arroz largo fino 1 kg", 10], ["Azúcar 1 kg", 8]]
  },
  { // Rojo por saldo (95 % del límite) aunque compra al día
    frecuencia: 14, ultima: 5, saldo: 190000, limiteCredito: 200000,
    productos: [["Gaseosa cola 2,25 l", 18], ["Galletitas surtidas", 12], ["Lavandina 1 l", 6]]
  },
  { // Verde, comprador quincenal
    frecuencia: 15, ultima: 10, saldo: 15000, limiteCredito: 150000,
    productos: [["Yerba mate 1 kg", 10], ["Aceite girasol 1,5 l", 8], ["Harina 000 1 kg", 12]]
  }
];

const CANTIDAD_COMPRAS = 6;
const VARIACIONES = [0, 1, -1, 2, 0, -2];

const hashId = (id) =>
  String(id).split("").reduce((acc, letra) => (acc * 31 + letra.charCodeAt(0)) >>> 0, 7);

const restarDias = (fecha, dias) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() - dias);
  return resultado.toISOString();
};

// Los perfiles se reparten en orden de alta (ids de MongoDB ordenados), así con pocos clientes
// igual aparecen rojo, verde y amarillo. Si no se pasa la lista de ids, se usa un hash del id.
const indicePerfil = (clienteId, idsClientes) => {
  const posicion = [...idsClientes].map(String).sort().indexOf(String(clienteId));
  return posicion >= 0 ? posicion : hashId(clienteId);
};

export const obtenerDatosComerciales = (clienteId, hoy = new Date(), idsClientes = []) => {
  const perfil = PERFILES[indicePerfil(clienteId, idsClientes) % PERFILES.length];

  const compras = Array.from({ length: CANTIDAD_COMPRAS }, (_, i) => ({
    fecha: restarDias(hoy, perfil.ultima + i * perfil.frecuencia),
    items: perfil.productos
      // La compra más antigua incluye un producto extra que el cliente dejó de llevar
      .concat(i === CANTIDAD_COMPRAS - 1 ? [["Arroz largo fino 1 kg", 5]] : [])
      .map(([producto, cantidad], j) => ({
        producto,
        cantidad: Math.max(1, cantidad + VARIACIONES[(i + j) % VARIACIONES.length]),
        precio: precio(producto)
      }))
  })).reverse();

  return { saldo: perfil.saldo, limiteCredito: perfil.limiteCredito, compras };
};
