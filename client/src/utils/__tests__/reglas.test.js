import { describe, it, expect } from 'vitest'
import {
  mediana,
  calcularSemaforo,
  calcularPedidoSugerido,
  totalPedido,
  compararPorRiesgo
} from '../reglas'
import { obtenerDatosComerciales } from '../../data/comprasDemo'

const HOY = new Date('2026-11-07T12:00:00Z')

// Genera compras cada `frecuencia` días, la última hace `ultima` días
const compras = (frecuencia, ultima, cantidad = 5, items = [{ producto: 'Yerba', cantidad: 4, precio: 100 }]) =>
  Array.from({ length: cantidad }, (_, i) => {
    const fecha = new Date(HOY)
    fecha.setDate(fecha.getDate() - (ultima + i * frecuencia))
    return { fecha: fecha.toISOString(), items }
  })

describe('mediana', () => {
  it('calcula la mediana con cantidad impar y par de valores', () => {
    expect(mediana([7, 3, 9])).toBe(7)
    expect(mediana([4, 8, 6, 10])).toBe(7)
    expect(mediana([])).toBe(0)
  })
})

describe('calcularSemaforo', () => {
  it('verde cuando está dentro de su frecuencia', () => {
    const r = calcularSemaforo({ compras: compras(7, 3) }, HOY)
    expect(r.color).toBe('verde')
    expect(r.frecuencia).toBe(7)
  })

  it('amarillo cuando supera 1,5 veces su frecuencia', () => {
    expect(calcularSemaforo({ compras: compras(10, 16) }, HOY).color).toBe('amarillo')
  })

  it('el límite exacto de 1,5 veces sigue siendo verde', () => {
    expect(calcularSemaforo({ compras: compras(10, 15) }, HOY).color).toBe('verde')
  })

  it('rojo cuando supera 2 veces su frecuencia (ejemplo del TP03)', () => {
    const r = calcularSemaforo({ compras: compras(7, 16) }, HOY)
    expect(r.color).toBe('rojo')
    expect(r.motivo).toBe('Compra cada 7 días y lleva 16 sin comprar')
  })

  it('rojo cuando el saldo supera el 90 % del límite aunque compre al día', () => {
    const r = calcularSemaforo({ compras: compras(7, 2), saldo: 95, limiteCredito: 100 }, HOY)
    expect(r.color).toBe('rojo')
    expect(r.motivo).toContain('95 %')
  })

  it('verde y aviso cuando no hay historial suficiente', () => {
    const r = calcularSemaforo({ compras: compras(7, 2, 1) }, HOY)
    expect(r.color).toBe('verde')
    expect(r.frecuencia).toBeNull()
  })
})

describe('calcularPedidoSugerido', () => {
  it('promedia las cantidades de las últimas 4 compras', () => {
    const historial = [
      { fecha: '2026-10-01', items: [{ producto: 'Arroz', cantidad: 50, precio: 10 }] }, // queda afuera (5ª más antigua)
      { fecha: '2026-10-08', items: [{ producto: 'Yerba', cantidad: 4, precio: 100 }] },
      { fecha: '2026-10-15', items: [{ producto: 'Yerba', cantidad: 6, precio: 100 }] },
      { fecha: '2026-10-22', items: [{ producto: 'Yerba', cantidad: 4, precio: 110 }, { producto: 'Azúcar', cantidad: 4, precio: 50 }] },
      { fecha: '2026-10-29', items: [{ producto: 'Yerba', cantidad: 6, precio: 120 }] }
    ]
    const sugerido = calcularPedidoSugerido(historial)
    expect(sugerido).toEqual([
      { producto: 'Yerba', cantidad: 5, precio: 120 },
      { producto: 'Azúcar', cantidad: 1, precio: 50 }
    ])
  })

  it('usa las compras disponibles si hay menos de 4 y devuelve vacío sin compras', () => {
    expect(calcularPedidoSugerido(compras(7, 1, 2))).toEqual([{ producto: 'Yerba', cantidad: 4, precio: 100 }])
    expect(calcularPedidoSugerido([])).toEqual([])
  })

  it('calcula el total del pedido', () => {
    expect(totalPedido([{ cantidad: 2, precio: 100 }, { cantidad: 3, precio: 10 }])).toBe(230)
  })
})

describe('compararPorRiesgo', () => {
  it('ordena rojo, amarillo, verde y dentro del color por días sin comprar', () => {
    const lista = [
      { color: 'verde', diasSinComprar: 2 },
      { color: 'rojo', diasSinComprar: 5 },
      { color: 'amarillo', diasSinComprar: 16 },
      { color: 'rojo', diasSinComprar: 16 }
    ].sort(compararPorRiesgo)
    expect(lista.map((c) => `${c.color}-${c.diasSinComprar}`)).toEqual(['rojo-16', 'rojo-5', 'amarillo-16', 'verde-2'])
  })
})

describe('datos simulados', () => {
  it('cada perfil produce el color esperado y es estable para el mismo id', () => {
    const colores = new Set()
    for (let i = 0; i < 50; i++) {
      colores.add(calcularSemaforo(obtenerDatosComerciales(`cliente-${i}`, HOY), HOY).color)
    }
    expect(colores).toEqual(new Set(['rojo', 'amarillo', 'verde']))
    expect(obtenerDatosComerciales('abc', HOY)).toEqual(obtenerDatosComerciales('abc', HOY))
  })

  it('con la lista de ids reparte los perfiles en orden: rojo, verde, amarillo, rojo por saldo', () => {
    const ids = ['d4', 'a1', 'c3', 'b2']
    const colores = ['a1', 'b2', 'c3', 'd4'].map((id) =>
      calcularSemaforo(obtenerDatosComerciales(id, HOY, ids), HOY).color
    )
    expect(colores).toEqual(['rojo', 'verde', 'amarillo', 'rojo'])
  })
})
