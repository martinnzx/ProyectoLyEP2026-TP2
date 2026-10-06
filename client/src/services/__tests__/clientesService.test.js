import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import clientesService from '../clientesService'

vi.mock('axios')

describe('clientesService', () => {
  it('obtenerClientes realiza una peticion GET al endpoint de la API y retorna los datos', async () => {
    const mockData = [
      { id: '652a9f1', name: { firstname: 'John', lastname: 'Doe' }, email: 'john@example.com' }
    ]
    axios.get.mockResolvedValueOnce({ data: mockData })

    const resultado = await clientesService.obtenerClientes()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/clientes'), undefined)
    expect(resultado).toEqual(mockData)
  })

  it('obtenerClientePorId realiza una peticion GET con el ID del cliente', async () => {
    const mockCliente = { id: '652a9f1', name: { firstname: 'John' }, email: 'john@example.com' }
    axios.get.mockResolvedValueOnce({ data: mockCliente })

    const resultado = await clientesService.obtenerClientePorId('652a9f1')
    expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/clientes\/652a9f1$/), undefined)
    expect(resultado).toEqual(mockCliente)
  })

  it('crearCliente realiza una peticion POST con el payload', async () => {
    const nuevoCliente = { name: { firstname: 'Maria', lastname: 'Gomez' }, email: 'maria@example.com' }
    axios.post.mockResolvedValueOnce({ data: { id: '652a9f2', ...nuevoCliente } })

    const resultado = await clientesService.crearCliente(nuevoCliente)
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/clientes'), nuevoCliente)
    expect(resultado.id).toBe('652a9f2')
  })

  it('actualizarCliente realiza una peticion PUT con el payload y el ID', async () => {
    const datosActualizados = { name: { firstname: 'Maria Actualizada' } }
    axios.put.mockResolvedValueOnce({ data: { id: '652a9f2', ...datosActualizados } })

    const resultado = await clientesService.actualizarCliente('652a9f2', datosActualizados)
    expect(axios.put).toHaveBeenCalledWith(expect.stringMatching(/\/clientes\/652a9f2$/), datosActualizados)
    expect(resultado.name.firstname).toBe('Maria Actualizada')
  })

  it('eliminarCliente realiza una peticion DELETE con el ID especificado', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Cliente eliminado correctamente', id: '652a9f1' } })

    const resultado = await clientesService.eliminarCliente('652a9f1')
    expect(axios.delete).toHaveBeenCalledWith(expect.stringMatching(/\/clientes\/652a9f1$/))
    expect(resultado.id).toBe('652a9f1')
  })
})
