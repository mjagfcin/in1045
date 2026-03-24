import React, { useState, useEffect } from 'react';
import { IProva, IQuestao } from '../types/index';
import { questaoService } from '../services/api';

interface ProvaFormProps {
  onSubmit: (dados: Omit<IProva, '_id' | 'dataCriacao'>) => Promise<void>;
  onCancel: () => void;
  carregando?: boolean;
}

export const ProvaForm: React.FC<ProvaFormProps> = ({ 
  onSubmit, 
  onCancel, 
  carregando = false 
}) => {
  const [titulo, setTitulo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [professor, setProfessor] = useState('');
  const [dataProva, setDataProva] = useState('');
  const [esquemaAlternativas, setEsquemaAlternativas] = useState<'letras' | 'potencias'>('letras');
  const [questoes, setQuestoes] = useState<{ id: string; titulo: string }[]>([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>([]);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    try {
      setCarregandoQuestoes(true);
      const response = await questaoService.listar(1, 100);
      const questoesFormatadas = response.dados.map((q: IQuestao) => ({
        id: q._id || '',
        titulo: q.enunciado.substring(0, 50) + (q.enunciado.length > 50 ? '...' : ''),
      }));
      setQuestoes(questoesFormatadas);
    } catch (err) {
      console.error('Erro ao carregar questões:', err);
      setErro('Erro ao carregar questões disponíveis');
    } finally {
      setCarregandoQuestoes(false);
    }
  };

  const handleToggleQuestao = (id: string) => {
    setQuestoesSelecionadas((prev) => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!titulo.trim()) {
      setErro('Título é obrigatório');
      return;
    }
    if (!disciplina.trim()) {
      setErro('Disciplina é obrigatória');
      return;
    }
    if (!professor.trim()) {
      setErro('Professor é obrigatório');
      return;
    }
    if (!dataProva) {
      setErro('Data da prova é obrigatória');
      return;
    }
    if (questoesSelecionadas.length === 0) {
      setErro('Selecione pelo menos uma questão');
      return;
    }

    try {
      await onSubmit({
        titulo,
        disciplina,
        professor,
        dataProva,
        questoes: questoesSelecionadas.map((id, index) => ({
          idQuestao: id,
          ordem: index + 1,
        })),
        esquemaAlternativas: {
          tipo: esquemaAlternativas,
        },
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar prova');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {erro && (
        <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título da Prova
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={carregando}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Prova de Matemática - Novembro 2024"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disciplina
          </label>
          <input
            type="text"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            disabled={carregando}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Matemática"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professor
          </label>
          <input
            type="text"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            disabled={carregando}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: João Silva"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data da Prova
          </label>
          <input
            type="date"
            value={dataProva}
            onChange={(e) => setDataProva(e.target.value)}
            disabled={carregando}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Esquema de Alternativas
          </label>
          <select
            value={esquemaAlternativas}
            onChange={(e) => setEsquemaAlternativas(e.target.value as 'letras' | 'potencias')}
            disabled={carregando}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="letras">Letras (A, B, C, D)</option>
            <option value="potencias">Potências (2⁰, 2¹, 2², 2³)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Questões ({questoesSelecionadas.length} selecionadas)
        </label>
        {carregandoQuestoes ? (
          <div className="text-center py-4 text-gray-600">Carregando questões...</div>
        ) : questoes.length === 0 ? (
          <div className="text-center py-4 text-gray-600">Nenhuma questão disponível</div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            {questoes.map((q) => (
              <label key={q.id} className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={questoesSelecionadas.includes(q.id)}
                  onChange={() => handleToggleQuestao(q.id)}
                  disabled={carregando || carregandoQuestoes}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{q.titulo}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={carregando}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={carregando || carregandoQuestoes}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {carregando ? 'Salvando...' : 'Salvar Prova'}
        </button>
      </div>
    </form>
  );
};
