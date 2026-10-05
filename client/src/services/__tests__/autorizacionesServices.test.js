import { describe, it, expect } from 'vitest'
import AutorizacionesService from '../autorizacionesServices'

describe('AutorizacionesService.login', () => {
  it('retorna el usuario cuando las credenciales y el sector son correctos', () => {
    const usuario = AutorizacionesService.login(
      'antonella@gmail.com',
      'Admin123',
      'Soporte'
    )
    expect(usuario).toBeDefined()
    expect(usuario.nombre).toBe('Antonella')
    expect(usuario.sector).toBe('Soporte')
  })

  it('retorna undefined cuando el email no existe', () => {
    const usuario = AutorizacionesService.login(
      'noexiste@gmail.com',
      'Admin123',
      'Soporte'
    )
    expect(usuario).toBeUndefined()
  })

  it('retorna undefined cuando la contraseña es incorrecta', () => {
    const usuario = AutorizacionesService.login(
      'antonella@gmail.com',
      'PasswordErronea1',
      'Soporte'
    )
    expect(usuario).toBeUndefined()
  })

  it('retorna undefined cuando el sector no coincide con el registrado', () => {
    const usuario = AutorizacionesService.login(
      'antonella@gmail.com',
      'Admin123',
      'Gerencia'
    )
    expect(usuario).toBeUndefined()
  })
})
