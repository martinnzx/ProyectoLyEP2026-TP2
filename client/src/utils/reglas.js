// Reglas deterministas del prototipo (TP03): semáforo de clientes en riesgo y pedido sugerido.
// Son funciones puras: con los mismos datos devuelven siempre el mismo resultado.

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const UMBRAL_AMARILLO = 1.5;
export const UMBRAL_ROJO = 2;
export const UMBRAL_SALDO = 0.9;
export const COMPRAS_PEDIDO_SUGERIDO = 4;

export const diasEntre = (desde, hasta) =>
  Math.round((new Date(hasta) - new Date(desde)) / MS_POR_DIA);

export const mediana = (valores) => {
  if (!valores.length) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  const medio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2
    ? ordenados[medio]
    : (ordenados[medio - 1] + ordenados[medio]) / 2;
};

const ordenarPorFecha = (compras) =>
  [...compras].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

/**
 * Semáforo del cliente.
 * - Rojo: lleva más de 2 veces su frecuencia sin comprar, o su saldo supera el 90 % del límite.
 * - Amarillo: lleva más de 1,5 veces su frecuencia sin comprar.
 * - Verde: el resto (también si no hay historial suficiente).
 */
export const calcularSemaforo = ({ compras = [], saldo = 0, limiteCredito = 0 }, hoy = new Date()) => {
  const ordenadas = ordenarPorFecha(compras);
  const saldoExcedido = limiteCredito > 0 && saldo > UMBRAL_SALDO * limiteCredito;
  const porcentajeSaldo = limiteCredito > 0 ? Math.round((saldo / limiteCredito) * 100) : 0;

  if (ordenadas.length < 2) {
    return {
      color: saldoExcedido ? "rojo" : "verde",
      frecuencia: null,
      diasSinComprar: ordenadas.length ? diasEntre(ordenadas[0].fecha, hoy) : null,
      motivo: saldoExcedido
        ? `Saldo al ${porcentajeSaldo} % del límite de crédito`
        : "Sin historial suficiente para calcular su frecuencia"
    };
  }

  const intervalos = ordenadas.slice(1).map((compra, i) =>
    diasEntre(ordenadas[i].fecha, compra.fecha)
  );
  const frecuencia = mediana(intervalos);
  const diasSinComprar = diasEntre(ordenadas[ordenadas.length - 1].fecha, hoy);
  const textoFrecuencia = `Compra cada ${frecuencia} días y lleva ${diasSinComprar} sin comprar`;

  let color = "verde";
  const motivos = [];

  if (diasSinComprar > UMBRAL_ROJO * frecuencia) {
    color = "rojo";
    motivos.push(textoFrecuencia);
  } else if (diasSinComprar > UMBRAL_AMARILLO * frecuencia) {
    color = "amarillo";
    motivos.push(textoFrecuencia);
  }

  if (saldoExcedido) {
    color = "rojo";
    motivos.push(`Saldo al ${porcentajeSaldo} % del límite de crédito`);
  }

  return {
    color,
    frecuencia,
    diasSinComprar,
    motivo: motivos.length ? motivos.join(" · ") : `${textoFrecuencia} (dentro de lo normal)`
  };
};

/**
 * Pedido sugerido: promedio de cantidades por producto en las últimas 4 compras.
 * El promedio se calcula sobre la cantidad de compras consideradas y se redondea.
 * El precio es el de la última compra en que apareció el producto.
 */
export const calcularPedidoSugerido = (compras = []) => {
  const ultimas = ordenarPorFecha(compras).slice(-COMPRAS_PEDIDO_SUGERIDO);
  if (!ultimas.length) return [];

  const acumulado = new Map();
  ultimas.forEach((compra) => {
    compra.items.forEach(({ producto, cantidad, precio }) => {
      const actual = acumulado.get(producto) || { producto, suma: 0, precio };
      actual.suma += cantidad;
      actual.precio = precio;
      acumulado.set(producto, actual);
    });
  });

  return Array.from(acumulado.values())
    .map(({ producto, suma, precio }) => ({
      producto,
      cantidad: Math.round(suma / ultimas.length),
      precio
    }))
    .filter((item) => item.cantidad > 0);
};

export const totalPedido = (items) =>
  items.reduce((total, item) => total + item.cantidad * item.precio, 0);

const PRIORIDAD = { rojo: 0, amarillo: 1, verde: 2 };

export const compararPorRiesgo = (a, b) =>
  PRIORIDAD[a.color] - PRIORIDAD[b.color] ||
  (b.diasSinComprar ?? 0) - (a.diasSinComprar ?? 0);
