import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ListaClientes from '../pages/ListaClientes'
import DetalleCliente from '../pages/DetalleCliente'
import ErrorPage from '../pages/ErrorPage'
import HojaRuta from '../pages/HojaRuta'
import RutaProtegida from '../components/RutaProtegida'
const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes"
        element={
          <RutaProtegida>
            <ListaClientes />
          </RutaProtegida>
        }
      />
      <Route
        path="/ruta"
        element={
          <RutaProtegida>
            <HojaRuta />
          </RutaProtegida>
        }
      />
      <Route
        path="/clientes/:id"
        element={
         <RutaProtegida>
          <DetalleCliente />
         </RutaProtegida>
      }
      />
      <Route path="*" element={<ErrorPage />} />

    </Routes>
  )
}
export default AppRoutes