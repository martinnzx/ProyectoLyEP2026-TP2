import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import clientesService from '../clientesService'

vi.mock('axios')

describe('clientesService', () => {
  it('obtenerClientes realiza una peticion GET y retorna los datos', async () => {
    const mockData = [
      { id: 1, name: { firstname: 'John', lastname: 'Doe' }, email: 'john@example.com' }
    ]
    axios.get.mockResolvedValueOnce({ data: mockData })

    const resultado = await clientesService.obtenerClientes()
    expect(axios.get).toHaveBeenCalledWith('https://fakestoreapi.com/users', undefined)
    expect(resultado).toEqual(mockData)
  })

  it('crearCliente realiza una peticion POST con el payload', async () => {
    const nuevoCliente = { name: { firstname: 'Maria', lastname: 'Gomez' }, email: 'maria@example.com' }
    axios.post.mockResolvedValueOnce({ data: { id: 11, ...nuevoCliente } })

    const resultado = await clientesService.crearCliente(nuevoCliente)
    expect(axios.post).toHaveBeenCalledWith('https://fakestoreapi.com/users', nuevoCliente)
    expect(resultado.id).toBe(11)
  })

  it('eliminarCliente realiza una peticion DELETE con el ID especificado', async () => {
    axios.delete.mockResolvedValueOnce({ data: { id: 1 } })

    const resultado = await clientesService.eliminarCliente(1)
    expect(axios.delete).toHaveBeenCalledWith('https://fakestoreapi.com/users/1')
    expect(resultado.id).toBe(1)
  })
})
