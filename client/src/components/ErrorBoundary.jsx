import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó una excepción no controlada:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          aria-live="assertive"
          className="container d-flex flex-column justify-content-center align-items-center min-vh-100 text-center py-5"
        >
          <div
            className="card shadow p-4 p-md-5 border-0"
            style={{ maxWidth: '600px', borderRadius: '16px' }}
          >
            <div className="mb-3 text-danger">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                className="bi bi-exclamation-triangle"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m-1.04-1.28A1 1 0 0 0 6.02 2.37l-6.857 11.667A1 1 0 0 0 0 15a1 1 0 0 0 .866.5h14.268A1 1 0 0 0 16 15a1 1 0 0 0-.029-.963L9.114 2.37a1 1 0 0 0-.874-.634 1 1 0 0 0-.262 0z" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
              </svg>
            </div>
            <h1 className="h3 mb-3 fw-bold text-dark">Algo no salió como se esperaba</h1>
            <p className="text-muted mb-4">
              Ocurrió un error inesperado en la interfaz de la aplicación. Podés intentar reanudar
              la sesión o recargar la página.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={this.handleReset}
              >
                Reintentar acción
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: '#d63384', borderColor: '#d63384' }}
                onClick={this.handleReload}
              >
                Recargar página
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
