import '../src/css/app.css'
import Header from './components/Header'
import Nav from './components/Nav'
import Footer from './components/Footer'
import AppRoutes from './routes/routes'

function App() {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </>
  )
}
export default App
