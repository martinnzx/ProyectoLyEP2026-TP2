import { useState, useEffect, useMemo, useCallback } from 'react'
import { AutorizacionesContext } from './AutorizacionesContextDefinition'

const AutorizacionesProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const adminGuardado = localStorage.getItem('admin')
    if (adminGuardado) {
      return JSON.parse(adminGuardado)
    }
    return null
  })

  useEffect(() => {
    if (admin) {
      localStorage.setItem('admin', JSON.stringify(admin))
    } else {
      localStorage.removeItem('admin')
    }
  }, [admin])

  const cerrarSesion = useCallback(() => {
    setAdmin(null)
    localStorage.removeItem('role')
  }, [])

  const value = useMemo(
    () => ({ admin, setAdmin, cerrarSesion }),
    [admin, cerrarSesion]
  )

  return (
    <AutorizacionesContext.Provider value={value}>
      {children}
    </AutorizacionesContext.Provider>
  )
}

export default AutorizacionesProvider