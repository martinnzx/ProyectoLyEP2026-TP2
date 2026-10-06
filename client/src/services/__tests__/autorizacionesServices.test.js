import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import AutorizacionesService from '../autorizacionesServices'

vi.mock('axios')

describe('AutorizacionesService.login', () => {
  it('retorna el usuario cuando las credenciales y el sector coinciden', async () => {
    const mockUser = {
      id: '123',
      email: 'antonella@gmail.com',
      nombre: 'Antonella',
      sector: 'Soporte'
    }
    axios.post.mockResolvedValueOnce({
      data: {
        message: 'Autenticación exitosa',
        usuario: mockUser
      }
    })

    const usuario = await AutorizacionesService.login(
      'antonella@gmail.com',
      'Admin123',
      'Soporte'
    )
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), {
      email: 'antonella@gmail.com',
      password: 'Admin123'
    })
    expect(usuario).toBeDefined()
    expect(usuario.nombre).toBe('Antonella')
    expect(usuario.sector).toBe('Soporte')
  })

  it('lanza error cuando el sector seleccionado no coincide con el registrado en backend', async () => {
    const mockUser = {
      id: '123',
      email: 'antonella@gmail.com',
      nombre: 'Antonella',
      sector: 'Gerencia'
    }
    axios.post.mockResolvedValueOnce({
      data: {
        message: 'Autenticación exitosa',
        usuario: mockUser
      }
    })

    await expect(
      AutorizacionesService.login('antonella@gmail.com', 'Admin123', 'Soporte')
    ).rejects.toThrow('El sector seleccionado no coincide con el perfil del usuario.')
  })

  it('lanza error cuando la API responde con error de credenciales invalidas', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { message: 'Credenciales inválidas' }
      }
    }
    axios.post.mockRejectedValueOnce(errorResponse)

    await expect(
      AutorizacionesService.login('antonella@gmail.com', 'PasswordErronea1', 'Soporte')
    ).rejects.toEqual(errorResponse)
  })

  it('registro realiza peticion POST a /auth/register', async () => {
    const nuevoUsuario = { email: 'nuevo@mail.com', password: 'Password1', nombre: 'Nuevo', sector: 'Soporte' }
    axios.post.mockResolvedValueOnce({ data: { id: '456', ...nuevoUsuario } })

    const res = await AutorizacionesService.registro(nuevoUsuario)
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/register'), nuevoUsuario)
    expect(res.id).toBe('456')
  })

  it('obtenerUsuarios realiza peticion GET a /auth/usuarios', async () => {
    const mockUsuarios = [{ id: '1', nombre: 'Admin' }]
    axios.get.mockResolvedValueOnce({ data: mockUsuarios })

    const res = await AutorizacionesService.obtenerUsuarios()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/auth/usuarios'))
    expect(res).toEqual(mockUsuarios)
  })
})
