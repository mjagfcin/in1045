import { useState, useEffect } from 'react'
import { IProva } from '../types/index'
import { provaService } from '../services/api'
import { Modal } from '../components/Modal'
import { ProvaForm } from '../components/ProvaForm'

export default function ProvasPage() {
  const [provas, setProvas] = useState<IProva[]>([])
  const [loading, setLoading] = useState(false)
  const [carregandoOperacao, setCarregandoOperacao] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    carregarProvas()
  }, [])

  const carregarProvas = async () => {
    setLoading(true)
    setErro('')
    try {
      const response = await provaService.listar(1, 100)
      setProvas(response.dados || [])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar provas')
    } finally {
      setLoading(false)
    }
  }

  const handleCriarProva = async (dados: Omit<IProva, '_id' | 'dataCriacao'>) => {
    setCarregandoOperacao(true)
    setErro('')
    try {
      const response = await provaService.criar(dados)
      setProvas([...provas, response.dados])
      setModalAberto(false)
      setMensagemSucesso('Prova criada com sucesso!')
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar prova')
    } finally {
      setCarregandoOperacao(false)
    }
  }

  const handleDeletarProva = async (id: string | undefined) => {
    if (!id) return
    if (!window.confirm('Tem certeza que deseja deletar esta prova?')) return

    setCarregandoOperacao(true)
    setErro('')
    try {
      await provaService.deletar(id)
      setProvas(provas.filter(p => p._id !== id))
      setMensagemSucesso('Prova deletada com sucesso!')
      setTimeout(() => setMensagemSucesso(''), 3000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao deletar prova')
    } finally {
      setCarregandoOperacao(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Gerenciar Provas</h2>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          ➕ Nova Prova
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
      ) : provas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma prova cadastrada. {' '}
          <button 
            onClick={() => setModalAberto(true)}
            className="text-green-500 hover:underline"
          >
            Criar primeira prova
          </button>
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
                  Data
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
              {provas.map((prova) => (
                <tr key={prova._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{prova.titulo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{prova.disciplina}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{prova.professor}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(prova.dataProva).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prova.questoes?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button 
                      disabled={carregandoOperacao}
                      className="text-purple-600 hover:underline disabled:opacity-50"
                    >
                      Gerar PDFs
                    </button>
                    <button 
                      onClick={() => handleDeletarProva(prova._id)}
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
        titulo="Criar Nova Prova"
        onClose={() => setModalAberto(false)}
      >
        <ProvaForm
          onSubmit={handleCriarProva}
          onCancel={() => setModalAberto(false)}
          carregando={carregandoOperacao}
        />
      </Modal>
    </div>
  )
}
