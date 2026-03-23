import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Bem-vindo ao Sistema de Provas
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Gerencie questões e provas com facilidade
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          to="/questoes"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition"
        >
          <div className="text-5xl mb-4">📝</div>
          <div>Gerenciar Questões</div>
        </Link>
        
        <Link
          to="/provas"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition"
        >
          <div className="text-5xl mb-4">📋</div>
          <div>Gerenciar Provas</div>
        </Link>
        
        <a
          href="#"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg transition"
        >
          <div className="text-5xl mb-4">📊</div>
          <div>Relatórios</div>
        </a>
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Funcionalidades</h3>
        <ul className="text-left max-w-2xl mx-auto space-y-2">
          <li>✅ Criar e gerenciar questões de múltipla escolha</li>
          <li>✅ Criar provas combinando questões</li>
          <li>✅ Gerar PDFs individualizados e randomizados</li>
          <li>✅ Processar respostas de alunos via CSV</li>
          <li>✅ Correção automática (modo rigoroso e flexível)</li>
          <li>✅ Geração de relatórios de notas</li>
        </ul>
      </div>
    </div>
  )
}
