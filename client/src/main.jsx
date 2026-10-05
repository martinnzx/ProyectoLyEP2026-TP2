import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AutorizacionesProvider from './context/AutorizacionesContext'
import { ClientesProvider } from './context/ClientesContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AutorizacionesProvider>
          <ClientesProvider>
            <App />
          </ClientesProvider>
        </AutorizacionesProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)