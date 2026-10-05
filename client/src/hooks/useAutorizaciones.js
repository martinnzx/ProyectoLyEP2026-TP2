import { useContext } from 'react'
import { AutorizacionesContext } from '../context/AutorizacionesContextDefinition'
const useAutorizaciones = () => {
  return useContext(AutorizacionesContext)
}
export default useAutorizaciones