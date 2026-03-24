import React, { useState } from 'react';
import { IQuestao, IAlternativa } from '../types/index';

interface QuestaoFormProps {
  onSubmit: (dados: Omit<IQuestao, '_id' | 'dataCriacao'>) => Promise<void>;
  onCancel: () => void;
  carregando?: boolean;
}

export const QuestaoForm: React.FC<QuestaoFormProps> = ({ 
  onSubmit, 
  onCancel, 
  carregando = false 
}) => {
  const [enunciado, setEnunciado] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [professor, setProfessor] = useState('');
  const [dificuldade, setDificuldade] = useState<'facil' | 'media' | 'dificil'>('media');
  const [alternativas, setAlternativas] = useState<IAlternativa[]>([
    { descricao: '', correta: false },
    { descricao: '', correta: false },
    { descricao: '', correta: false },
    { descricao: '', correta: false },
  ]);
  const [erro, setErro] = useState('');

  const handleAlternativaChange = (index: number, descricao: string) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[index].descricao = descricao;
    setAlternativas(novasAlternativas);
  };

  const handleMarcarCorreta = (index: number) => {
    const novasAlternativas = alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index,
    }));
    setAlternativas(novasAlternativas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!enunciado.trim()) {
      setErro('Enunciado é obrigatório');
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
    if (alternativas.some(alt => !alt.descricao.trim())) {
      setErro('Todas as alternativas devem ser preenchidas');
      return;
    }
    if (!alternativas.some(alt => alt.correta)) {
      setErro('Selecione uma alternativa correta');
      return;
    }

    try {
      await onSubmit({
        enunciado,
        disciplina,
        professor,
        dificuldade,
        alternativas,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar questão');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enunciado
        </label>
        <textarea
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          disabled={carregando}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Digite o enunciado da questão"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dificuldade
        </label>
        <select
          value={dificuldade}
          onChange={(e) => setDificuldade(e.target.value as 'facil' | 'media' | 'dificil')}
          disabled={carregando}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="facil">Fácil</option>
          <option value="media">Média</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Alternativas (marque a correta)
        </label>
        <div className="space-y-2">
          {alternativas.map((alt, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="radio"
                name="alternativa-correta"
                checked={alt.correta}
                onChange={() => handleMarcarCorreta(index)}
                disabled={carregando}
                className="mt-2"
              />
              <input
                type="text"
                value={alt.descricao}
                onChange={(e) => handleAlternativaChange(index, e.target.value)}
                disabled={carregando}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
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
          disabled={carregando}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {carregando ? 'Salvando...' : 'Salvar Questão'}
        </button>
      </div>
    </form>
  );
};
