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
  const [relatorio, setRelatorio] = useState<any>(null);

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

  const handleGerarRelatorio = async () => {
    if (!provaSelecionada) {
      setMensagem('Selecione uma prova para gerar o relatório.');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const resultado = await correcaoService.gerarRelatorioNotas(provaSelecionada);
      setRelatorio(resultado.dados);
      setMensagem('Relatório gerado com sucesso!');
    } catch (error) {
      setMensagem(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!provaSelecionada) return;

    try {
      const blob = await correcaoService.exportarRelatorioCSV(provaSelecionada);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_notas_${provaSelecionada}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMensagem(`Erro ao baixar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDownloadPDF = async () => {
    if (!provaSelecionada) return;

    try {
      const blob = await correcaoService.exportarRelatorioPDF(provaSelecionada);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_notas_${provaSelecionada}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMensagem(`Erro ao baixar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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

      {/* Seção de Relatório */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Relatório de Notas</h2>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleGerarRelatorio}
            disabled={loading || !provaSelecionada}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Gerar Relatório
          </button>

          {relatorio && (
            <>
              <button
                onClick={handleDownloadCSV}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Baixar CSV
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Baixar PDF
              </button>
            </>
          )}
        </div>

        {relatorio && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Informações da Prova</h3>
              <p><strong>Título:</strong> {relatorio.prova.titulo}</p>
              <p><strong>Disciplina:</strong> {relatorio.prova.disciplina}</p>
              <p><strong>Professor:</strong> {relatorio.prova.professor}</p>
              <p><strong>Data:</strong> {new Date(relatorio.prova.dataProva).toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Estatísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <p><strong>Total de Alunos:</strong> {relatorio.estatisticas.totalAlunos}</p>
                <p><strong>Média:</strong> {relatorio.estatisticas.media}</p>
                <p><strong>Desvio Padrão:</strong> {relatorio.estatisticas.desvioPadrao}</p>
                <p><strong>Nota Máxima:</strong> {relatorio.estatisticas.notaMaxima}</p>
                <p><strong>Nota Mínima:</strong> {relatorio.estatisticas.notaMinima}</p>
                <p><strong>Aprovação:</strong> {relatorio.estatisticas.percentualAprovacao}%</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Notas dos Alunos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">CPF</th>
                      <th className="px-4 py-2 text-left">Prova</th>
                      <th className="px-4 py-2 text-left">Nota</th>
                      <th className="px-4 py-2 text-left">Acerto</th>
                      <th className="px-4 py-2 text-left">Modo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.alunos.map((aluno: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{aluno.nome}</td>
                        <td className="px-4 py-2">{aluno.cpf}</td>
                        <td className="px-4 py-2">{aluno.numeroProva}</td>
                        <td className="px-4 py-2">{aluno.notaFinal}</td>
                        <td className="px-4 py-2">{aluno.percentualAcerto}%</td>
                        <td className="px-4 py-2">{aluno.modoCorrecao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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