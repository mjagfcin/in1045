import { useState, useEffect } from 'react'

export default function QuestoesPage() {
  const [questoes, setQuestoes] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarQuestoes()
  }, [])

  const carregarQuestoes = async () => {
    setLoading(true)
    try {
      // TODO: Integrar com API real
      const response = await fetch('/api/questoes')
      if (!response.ok) throw new Error('Erro ao carregar questões')
      const dados = await response.json()
      setQuestoes(dados.dados || [])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gerenciar Questões</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          ➕ Nova Questão
        </button>
      </div>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : questoes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma questão cadastrada. {' '}
          <button className="text-blue-500 hover:underline">Criar primeira questão</button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enunciado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Alternativas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {questoes.map((questao: any) => (
                <tr key={questao._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{questao._id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {questao.enunciado?.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {questao.alternativas?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:underline mr-4">Editar</button>
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
