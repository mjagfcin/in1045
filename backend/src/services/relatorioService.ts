import { Relatorio, IRelatorio } from '../models/Relatorio';
import { Prova } from '../models/Prova';
import { ResultadoProva } from '../models/ResultadoProva';
import logger from '../config/logger';
import correcaoService from './correcaoService';
import csvService from './csvService';

class RelatorioService {
  async gerarRelatorioProva(idProva: string, formato: 'csv' | 'pdf' = 'csv'): Promise<IRelatorio> {
    try {
      // Buscar prova
      const prova = await Prova.findById(idProva);
      if (!prova) {
        throw new Error('Prova não encontrada');
      }

      // Buscar resultados da prova
      const { resultados } = await correcaoService.obterResultadosPorProva(idProva, 1, 10000);

      if (resultados.length === 0) {
        throw new Error('Nenhum resultado encontrado para essa prova');
      }

      // Calcular estatísticas
      const estatisticas = await correcaoService.obterEstatisticasProva(idProva);

      // Preparar título
      const titulo = `Relatório ${prova.titulo} - ${prova.disciplina} - ${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`;

      // Criar registro do relatório
      const relatorio = new Relatorio({
        idProva,
        titulo,
        dataGeracao: new Date(),
        resultados: resultados.map((r) => r._id),
        estatisticas,
        formato,
      });

      // Gerar arquivo conforme formato
      if (formato === 'csv') {
        const dados = resultados.map((r) => ({
          aluno_nome: r.aluno.nome,
          aluno_cpf: r.aluno.cpf,
          numero_prova: r.numeroProva,
          nota_final: r.notaFinal,
          percentual_acerto: r.percentualAcerto,
          modo_correcao: r.modoCorrecao,
          data_correcao: new Date(r.dataCorrecao).toLocaleDateString('pt-BR'),
        }));

        const caminhoArquivo = await csvService.gerarCSVRelatorio(dados);
        relatorio.caminhoArquivo = caminhoArquivo;
      } else {
        // Implementar PDF em versão futura
        relatorio.caminhoArquivo = '';
      }

      await relatorio.save();

      logger.info('Relatório gerado com sucesso', { idProva, formato });
      return relatorio;
    } catch (error) {
      logger.error('Erro ao gerar relatório', {
        erro: error instanceof Error ? error.message : String(error),
        idProva,
      });
      throw error;
    }
  }

  async obterRelatorios(idProva: string, pagina: number = 1, limite: number = 10): Promise<{ relatorios: IRelatorio[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const relatorios = await Relatorio.find({ idProva })
        .skip(skip)
        .limit(limite)
        .sort({ dataGeracao: -1 });

      const total = await Relatorio.countDocuments({ idProva });

      return { relatorios, total };
    } catch (error) {
      logger.error('Erro ao obter relatórios', { erro: error instanceof Error ? error.message : String(error), idProva });
      throw error;
    }
  }

  async obterRelatorioPorId(id: string): Promise<IRelatorio | null> {
    try {
      const relatorio = await Relatorio.findById(id).populate('resultados');
      return relatorio;
    } catch (error) {
      logger.error('Erro ao obter relatório', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }
}

export default new RelatorioService();
