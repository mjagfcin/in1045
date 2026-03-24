import { useState, useEffect } from 'react'
import { IQuestao } from '../types/index'
import { questaoService } from '../services/api'
import { Modal } from '../components/Modal'
import { QuestaoForm } from '../components/QuestaoForm'

export default function QuestoesPage() {
  const [questoes, setQuestoes] = useState<IQuestao[]>([])
  const [loading, setLoading] = useState(false)
  const [carregandoOperacao, setCarregandoOperacao] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    carregarQuestoes()
  }, [])

  const carregarQuestoes = async () => {
    setLoading(true)
    setErro('')
    try {
      const response = await questaoService.listar(1, 100)
      setQuestoes(response.dados || [])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar questões')
    } finally {
      setLoading(false)
    }
  }

  const handleCriarQuestao = async (dados: Omit<IQuestao, '_id' | 'dataCriacao'>) => {
    setCarregandoOperacao(true)
    setErro('')
    try {
      const response = await questaoService.criar(dados)
      setQuestoes([...questoes, response.dados])
      setModalAberto(false)
      setMensagemSucesso('Questão criada com sucesso!')
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar questão')
    } finally {
      setCarregandoOperacao(false)
    }
  }

  const handleDeletarQuestao = async (id: string | undefined) => {
    if (!id) return
    if (!window.confirm('Tem certeza que deseja deletar esta questão?')) return

    setCarregandoOperacao(true)
    setErro('')
    try {
      await questaoService.deletar(id)
      setQuestoes(questoes.filter(q => q._id !== id))
      setMensagemSucesso('Questão deletada com sucesso!')
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao deletar questão')
    } finally {
      setCarregandoOperacao(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gerenciar Questões</h2>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          ➕ Nova Questão
        </button>
      </div>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}

      {mensagemSucesso && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {mensagemSucesso}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : questoes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma questão cadastrada. {' '}
          <button 
            onClick={() => setModalAberto(true)}
            className="text-blue-500 hover:underline"
          >
            Criar primeira questão
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enunciado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dificuldade
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
              {questoes.map((questao) => (
                <tr key={questao._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {questao.enunciado?.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{questao.disciplina}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      questao.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                      questao.dificuldade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {questao.dificuldade || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {questao.alternativas?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleDeletarQuestao(questao._id)}
                      disabled={carregandoOperacao}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalAberto}
        titulo="Criar Nova Questão"
        onClose={() => setModalAberto(false)}
      >
        <QuestaoForm
          onSubmit={handleCriarQuestao}
          onCancel={() => setModalAberto(false)}
          carregando={carregandoOperacao}
        />
      </Modal>
    </div>
  )
}
