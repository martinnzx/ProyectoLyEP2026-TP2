import '../css/login.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAutorizaciones from '../hooks/useAutorizaciones'
import AutorizacionesService from '../services/autorizacionesServices'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sector, setSector] = useState('')
  const [errores, setErrores] = useState({})
  const { setAdmin } = useAutorizaciones()
  const navigate = useNavigate()

  const validar = () => {
    const nuevosErrores = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      nuevosErrores.email = 'El email es obligatorio'
    } else if (!emailRegex.test(email)) {
      nuevosErrores.email = 'Email inválido'
    }
    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria'
    } else {
      if (password.length < 8) {
        nuevosErrores.password = 'Mínimo 8 caracteres'
      } else if (!/[A-Z]/.test(password)) {
        nuevosErrores.password = 'Debe tener una mayúscula'
      } else if (!/[0-9]/.test(password)) {
        nuevosErrores.password = 'Debe tener un número'
      }
    }
    if (!sector) {
      nuevosErrores.sector = 'Seleccione un sector'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    const usuario = AutorizacionesService.login(
      email,
      password,
      sector
    )
    if (!usuario) {
      alert('Verifique los datos')
      return
    }
    localStorage.setItem("role", usuario.sector)
    setAdmin({
      nombre: usuario.nombre,
      email: usuario.email,
      sector: usuario.sector
    })
    navigate('/')
  }

  return (
    <section className="login-container" aria-labelledby="titulo-login">
      <h1 id="titulo-login">Iniciar Sesión</h1>
      <form className="login-form" onSubmit={manejarSubmit} noValidate>
        <label htmlFor="login-email" className="login-label">
          Email:
        </label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="error-login-email"
        />
        <p
          id="error-login-email"
          className="login-error"
          role="alert"
          aria-live="polite"
        >
          {errores.email || ''}
        </p>

        <label htmlFor="login-password" className="login-label">
          Contraseña:
        </label>
        <input
          id="login-password"
          className="login-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="error-login-password"
        />
        <p
          id="error-login-password"
          className="login-error"
          role="alert"
          aria-live="polite"
        >
          {errores.password || ''}
        </p>

        <label htmlFor="login-sector" className="login-label">
          Sector:
        </label>
        <select
          id="login-sector"
          className="login-select"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          aria-describedby="error-login-sector"
        >
          <option value="">Seleccione un sector</option>
          <option value="Soporte">Soporte</option>
          <option value="Gerencia">Gerencia</option>
        </select>
        <p
          id="error-login-sector"
          className="login-error"
          role="alert"
          aria-live="polite"
        >
          {errores.sector || ''}
        </p>

        <button type="submit" className="login-button">
          Ingresar
        </button>
      </form>
    </section>
  )
}

export default Login