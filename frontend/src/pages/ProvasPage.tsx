import { useState, useEffect } from 'react'

export default function ProvasPage() {
  const [provas, setProvas] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarProvas()
  }, [])

  const carregarProvas = async () => {
    setLoading(true)
    try {
      // TODO: Integrar com API real
      const response = await fetch('/api/provas')
      if (!response.ok) throw new Error('Erro ao carregar provas')
      const dados = await response.json()
      setProvas(dados.dados || [])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar provas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gerenciar Provas</h2>
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
          ➕ Nova Prova
        </button>
      </div>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : provas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma prova cadastrada. {' '}
          <button className="text-green-500 hover:underline">Criar primeira prova</button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Professor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Questões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {provas.map((prova: any) => (
                <tr key={prova._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{prova.titulo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{prova.disciplina}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{prova.professor}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prova.questoes?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-blue-600 hover:underline">Editar</button>
                    <button className="text-purple-600 hover:underline">Gerar PDFs</button>
                    <button className="text-red-600 hover:underline">Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
