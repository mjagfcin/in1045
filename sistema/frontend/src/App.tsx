import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import QuestoesPage from './pages/QuestoesPage'
import ProvasPage from './pages/ProvasPage'
import CorrecaoPage from './pages/CorrecaoPage'
import RelatorioPage from './pages/RelatorioPage'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Sistema de Provas</h1>
              <div className="flex space-x-6">
                <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Início
                </Link>
                <Link to="/questoes" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Questões
                </Link>
                <Link to="/provas" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Provas
                </Link>
                <Link to="/correcao" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Correção
                </Link>
                <Link to="/relatorios" className="hover:bg-blue-700 px-3 py-2 rounded">
                  Relatórios
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Conteúdo principal */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questoes" element={<QuestoesPage />} />
            <Route path="/provas" element={<ProvasPage />} />
            <Route path="/correcao" element={<CorrecaoPage />} />
            <Route path="/relatorios" element={<RelatorioPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
