import { ResultadoProva, IResultadoProva, IAnaliseQuestao } from '../models/ResultadoProva';
import { ProvaGerada } from '../models/ProvaGerada';
import logger from '../config/logger';

interface DadosCorrecao {
  idProvaGerada: string;
  idProva: string;
  numeroProva: string;
  nomeAluno: string;
  cpf: string;
  respostas: { [key: string]: string };
  gabarito: { [key: string]: string };
  modoCorrecao: 'rigoroso' | 'flexivel';
}

class CorrecaoService {
  async corrigirProva(dados: DadosCorrecao): Promise<IResultadoProva> {
    try {
      // Analisar respostas
      const analise = this.analisarRespostas(dados.respostas, dados.gabarito, dados.modoCorrecao);

      // Calcular notas
      const { notaPorQuestao, notaFinal, percentualAcerto } = this.calcularNotas(
        analise,
        dados.modoCorrecao,
        Object.keys(dados.gabarito).length
      );

      // Criar documento de resultado
      const resultado = new ResultadoProva({
        idProvaGerada: dados.idProvaGerada,
        idProva: dados.idProva,
        numeroProva: dados.numeroProva,
        aluno: {
          nome: dados.nomeAluno,
          cpf: dados.cpf,
        },
        respostas: dados.respostas,
        gabarito: dados.gabarito,
        analise,
        modoCorrecao: dados.modoCorrecao,
        notaPorQuestao,
        notaFinal,
        percentualAcerto,
        dataCorrecao: new Date(),
      });

      await resultado.save();

      logger.info('Prova corrigida com sucesso', {
        numeroProva: dados.numeroProva,
        aluno: dados.nomeAluno,
        notaFinal,
      });

      return resultado;
    } catch (error) {
      logger.error('Erro ao corrigir prova', {
        erro: error instanceof Error ? error.message : String(error),
        numeroProva: dados.numeroProva,
      });
      throw error;
    }
  }

  private analisarRespostas(
    respostas: { [key: string]: string },
    gabarito: { [key: string]: string },
    modoCorrecao: 'rigoroso' | 'flexivel'
  ): { [key: string]: IAnaliseQuestao } {
    const analise: { [key: string]: IAnaliseQuestao } = {};

    Object.keys(gabarito).forEach((questao) => {
      const resposta = respostas[questao] || '';
      const gabaritoEsperado = gabarito[questao];

      const correta = resposta === gabaritoEsperado;

      let detalhes = '';
      if (correta) {
        detalhes = 'Acerto completo';
      } else if (resposta === '') {
        detalhes = 'Erro: Nenhuma alternativa foi selecionada';
      } else {
        // Verificar quais alternativas diferem
        const alternativasCorretas = gabaritoEsperado.split('').sort();
        const alternativasFornecidas = resposta.split('').sort();

        const emFalta = alternativasCorretas.filter((a) => !alternativasFornecidas.includes(a));
        const extras = alternativasFornecidas.filter((a) => !alternativasCorretas.includes(a));

        if (emFalta.length > 0 && extras.length === 0) {
          detalhes = `Erro: alternativa(s) ${emFalta.join(',')} não foi/foram selecionada(s)`;
        } else if (extras.length > 0 && emFalta.length === 0) {
          detalhes = `Erro: alternativa(s) ${extras.join(',')} foi/foram selecionada(s) incorretamente`;
        } else {
          detalhes = `Erro: alternativ(s) ${emFalta.join(',')} faltaram e alternativa(s) ${extras.join(',')} foram selecionadas incorretamente`;
        }
      }

      analise[questao] = {
        correta,
        respostaFornecida: resposta,
        gabaritoEsperado,
        detalhes,
      };
    });

    return analise;
  }

  private calcularNotas(
    analise: { [key: string]: IAnaliseQuestao },
    modoCorrecao: 'rigoroso' | 'flexivel',
    totalQuestoes: number
  ): { notaPorQuestao: { [key: string]: number }; notaFinal: number; percentualAcerto: number } {
    const notaPorQuestao: { [key: string]: number } = {};
    let totalAcertos = 0;

    Object.entries(analise).forEach(([questao, resultado]) => {
      if (modoCorrecao === 'rigoroso') {
        //Modo rigoroso: 100% ou 0
        notaPorQuestao[questao] = resultado.correta ? 10 : 0;
        if (resultado.correta) totalAcertos++;
      } else {
        // Modo flexível: proporcional
        const gabaritoChars = resultado.gabaritoEsperado.split('').sort();
        const respostaChars = resultado.respostaFornecida.split('').sort();

        const acertos = gabaritoChars.filter((a) => respostaChars.includes(a)).length;
        const percentualAcerto = gabaritoChars.length > 0 ? acertos / gabaritoChars.length : 0;

        notaPorQuestao[questao] = Math.round((percentualAcerto * 10) / totalQuestoes * 100) / 100;
        totalAcertos += notaPorQuestao[questao];
      }
    });

    const notaFinal = Math.round(totalAcertos * 100) / 100;
    const percentualAcerto = Math.round((notaFinal / 10) * 100 * 100) / 100;

    return { notaPorQuestao, notaFinal, percentualAcerto };
  }

  async obterResultado(idResultado: string): Promise<IResultadoProva | null> {
    try {
      const resultado = await ResultadoProva.findById(idResultado);
      return resultado;
    } catch (error) {
      logger.error('Erro ao obter resultado', { erro: error instanceof Error ? error.message : String(error), id: idResultado });
      throw error;
    }
  }

  async obterResultadosPorProva(idProva: string, pagina: number = 1, limite: number = 20): Promise<{ resultados: IResultadoProva[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const resultados = await ResultadoProva.find({ idProva })
        .skip(skip)
        .limit(limite)
        .sort({ dataCorrecao: -1 });

      const total = await ResultadoProva.countDocuments({ idProva });

      return { resultados, total };
    } catch (error) {
      logger.error('Erro ao obter resultados por prova', {
        erro: error instanceof Error ? error.message : String(error),
        idProva,
      });
      throw error;
    }
  }

  async obterEstatisticasProva(
    idProva: string
  ): Promise<{
    totalAlunos: number;
    mediaNota: number;
    desviaoPadrao: number;
    notaMaxima: number;
    notaMinima: number;
    percentualAprovacao: number;
  }> {
    try {
      const resultados = await ResultadoProva.find({ idProva });

      if (resultados.length === 0) {
        return {
          totalAlunos: 0,
          mediaNota: 0,
          desviaoPadrao: 0,
          notaMaxima: 0,
          notaMinima: 0,
          percentualAprovacao: 0,
        };
      }

      const notas = resultados.map((r) => r.notaFinal);

      // Calcular média
      const mediaNota = notas.reduce((a, b) => a + b, 0) / notas.length;

      // Calcular desvio padrão
      const variancia = notas.reduce((acc, nota) => acc + Math.pow(nota - mediaNota, 2), 0) / notas.length;
      const desviaoPadrao = Math.sqrt(variancia);

      // Nota máxima e mínima
      const notaMaxima = Math.max(...notas);
      const notaMinima = Math.min(...notas);

      // Percentual de aprovação (>=6)
      const aprovados = resultados.filter((r) => r.notaFinal >= 6).length;
      const percentualAprovacao = (aprovados / resultados.length) * 100;

      return {
        totalAlunos: resultados.length,
        mediaNota: Math.round(mediaNota * 100) / 100,
        desviaoPadrao: Math.round(desviaoPadrao * 100) / 100,
        notaMaxima,
        notaMinima,
        percentualAprovacao: Math.round(percentualAprovacao * 100) / 100,
      };
    } catch (error) {
      logger.error('Erro ao calcular estatísticas da prova', {
        erro: error instanceof Error ? error.message : String(error),
        idProva,
      });
      throw error;
    }
  }
}

export default new CorrecaoService();
