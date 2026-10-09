import { useEffect, useState } from 'react'
import '../css/dashboard.css'
import useAutorizaciones from '../hooks/useAutorizaciones'
import useClientes from '../hooks/useClientes'
import autorizacionesServices from '../services/autorizacionesServices'

const Dashboard = () => {
  const { admin } = useAutorizaciones()
  const { clientes, loading: cargandoClientes } = useClientes()
  const [usuarios, setUsuarios] = useState([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true)

  useEffect(() => {
    let activo = true

    autorizacionesServices.obtenerUsuarios()
      .then((datos) => {
        if (activo) setUsuarios(Array.isArray(datos) ? datos : [])
      })
      .catch(() => {
        if (activo) setUsuarios([])
      })
      .finally(() => {
        if (activo) setCargandoUsuarios(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const contarSector = (sector) =>
    usuarios.filter((usuario) => usuario.sector === sector).length

  return (
    <div className="dashboard">

      <h1>Panel de Control de Clientes</h1>

      <div className="user-card">
        <h3>Usuario conectado</h3>

        <p><strong>Administrador:</strong> {admin?.nombre}</p>
        <p><strong>Email:</strong> {admin?.email}</p>
        <p><strong>Sector:</strong> {admin?.sector}</p>
      </div>
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Clientes</h3>
          <p>{cargandoClientes ? '…' : clientes.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Gerencia</h3>
          <p>{cargandoUsuarios ? '…' : contarSector('Gerencia')}</p>
        </div>

        <div className="dashboard-card">
          <h3>Soporte</h3>
          <p>{cargandoUsuarios ? '…' : contarSector('Soporte')}</p>
        </div>
      </div>

    </div>
  )
}

export default Dashboard
