import React, { useState, useEffect } from 'react';
import { correcaoService, provaService } from '../services/api';
import { IProva } from '../types';

const CorrecaoPage: React.FC = () => {
  const [provas, setProvas] = useState<IProva[]>([]);
  const [provaSelecionada, setProvaSelecionada] = useState<string>('');
  const [arquivoGabarito, setArquivoGabarito] = useState<File | null>(null);
  const [arquivoRespostas, setArquivoRespostas] = useState<File | null>(null);
  const [modoCorrecao, setModoCorrecao] = useState<'rigoroso' | 'flexivel'>('rigoroso');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string>('');

  useEffect(() => {
    const carregarProvas = async () => {
      try {
        const resultado = await provaService.listar();
        setProvas(resultado.dados);
      } catch (error) {
        setMensagem('Erro ao carregar provas');
      }
    };

    carregarProvas();
  }, []);

  const handleCorrigir = async () => {
    if (!provaSelecionada || !arquivoGabarito || !arquivoRespostas) {
      setMensagem('Selecione uma prova e os arquivos CSV necessários.');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const resultado = await correcaoService.corrigirProvas(
        provaSelecionada,
        arquivoGabarito,
        arquivoRespostas,
        modoCorrecao
      );

      setMensagem(`Sucesso: ${resultado.mensagem}`);
    } catch (error) {
      setMensagem(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Correção de Provas</h1>

      {/* Seção de Correção */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Corrigir Provas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prova</label>
            <select
              value={provaSelecionada}
              onChange={(e) => setProvaSelecionada(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione uma prova</option>
              {provas.map((prova) => (
                <option key={prova._id} value={prova._id}>
                  {prova.titulo} - {prova.disciplina}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modo de Correção</label>
            <select
              value={modoCorrecao}
              onChange={(e) => setModoCorrecao(e.target.value as 'rigoroso' | 'flexivel')}
              className="w-full p-2 border rounded"
            >
              <option value="rigoroso">Rigoroso (Tudo ou Nada)</option>
              <option value="flexivel">Flexível (Proporcional)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Arquivo Gabarito (CSV)</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setArquivoGabarito(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Arquivo Respostas (CSV)</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setArquivoRespostas(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={handleCorrigir}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Corrigindo...' : 'Corrigir Provas'}
        </button>
      </div>

      {/* Mensagens */}
      {mensagem && (
        <div className={`p-4 rounded ${mensagem.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
};

export default CorrecaoPage;