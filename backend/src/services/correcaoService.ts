import { ResultadoProva, IResultadoProva, IAnaliseQuestao } from '../models/ResultadoProva';
import logger from '../config/logger';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import env from '../config/env';
import { Prova } from '../models/Prova';

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

interface IRespostaAlunoCSV {
  numero_prova: string;
  nome: string;
  cpf: string;
  [key: string]: string;
}

interface IGabaritoCSV {
  numero_prova: string;
  [key: string]: string;
}

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

  /**
   * Corrige múltiplas provas a partir de CSVs de gabarito e respostas
   */
  async corrigirProvasEmLote(
    provaId: string,
    caminhoGabarito: string,
    caminhoRespostas: string,
    modoCorrecao: 'rigoroso' | 'flexivel' = 'rigoroso'
  ): Promise<IResultadoProva[]> {
    try {
      // Carregar gabarito
      const gabaritos = await this.carregarGabaritoCSV(caminhoGabarito);

      // Carregar respostas dos alunos
      const respostasAlunos = await this.carregarRespostasCSV(caminhoRespostas);

      const resultados: IResultadoProva[] = [];

      for (const respostaAluno of respostasAlunos) {
        const numeroProva = respostaAluno.numero_prova;
        const gabarito = gabaritos.find(g => g.numero_prova === numeroProva);

        if (!gabarito) {
          logger.warn(`Gabarito não encontrado para prova ${numeroProva}`);
          continue;
        }

        // Preparar dados para correção individual
        const dadosCorrecao: DadosCorrecao = {
          idProvaGerada: provaId,
          idProva: provaId,
          numeroProva,
          nomeAluno: respostaAluno.nome,
          cpf: respostaAluno.cpf,
          respostas: this.extrairRespostasDoCSV(respostaAluno),
          gabarito: this.extrairGabaritoDoCSV(gabarito),
          modoCorrecao,
        };

        const resultado = await this.corrigirProva(dadosCorrecao);
        resultados.push(resultado);
      }

      logger.info(`Correção em lote concluída: ${resultados.length} provas corrigidas`);
      return resultados;
    } catch (error) {
      logger.error('Erro na correção em lote', {
        erro: error instanceof Error ? error.message : String(error),
        provaId,
      });
      throw error;
    }
  }

  private async carregarGabaritoCSV(caminhoArquivo: string): Promise<IGabaritoCSV[]> {
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(conteudo, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as IGabaritoCSV[]);
        },
        error: reject,
      });
    });
  }

  private async carregarRespostasCSV(caminhoArquivo: string): Promise<IRespostaAlunoCSV[]> {
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(conteudo, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as IRespostaAlunoCSV[]);
        },
        error: reject,
      });
    });
  }

  private extrairRespostasDoCSV(respostaAluno: IRespostaAlunoCSV): { [key: string]: string } {
    const respostas: { [key: string]: string } = {};
    Object.keys(respostaAluno).forEach(key => {
      if (key.startsWith('questao_')) {
        respostas[key] = respostaAluno[key] || '';
      }
    });
    return respostas;
  }

  private extrairGabaritoDoCSV(gabarito: IGabaritoCSV): { [key: string]: string } {
    const gab: { [key: string]: string } = {};
    Object.keys(gabarito).forEach(key => {
      if (key.startsWith('questao_')) {
        gab[key] = gabarito[key] || '';
      }
    });
    return gab;
  }

  /**
   * Gera relatório de notas da turma para uma prova
   */
  async gerarRelatorioNotas(provaId: string): Promise<any> {
    try {
      const resultados = await ResultadoProva.find({ idProva: provaId }).sort({ notaFinal: -1 });

      if (resultados.length === 0) {
        throw new Error('Nenhum resultado encontrado para esta prova');
      }

      // Buscar informações da prova
      const prova = await Prova.findById(provaId);
      if (!prova) {
        throw new Error('Prova não encontrada');
      }

      const notas = resultados.map(r => r.notaFinal);
      const media = notas.reduce((sum, n) => sum + n, 0) / notas.length;
      const desvioPadrao = Math.sqrt(
        notas.reduce((sum, n) => sum + Math.pow(n - media, 2), 0) / notas.length
      );
      const notaMaxima = Math.max(...notas);
      const notaMinima = Math.min(...notas);
      const percentualAprovacao = (notas.filter(n => n >= 6.0).length / notas.length) * 100;

      const relatorio = {
        prova: {
          titulo: prova.titulo,
          disciplina: prova.disciplina,
          professor: prova.professor,
          dataProva: prova.dataProva,
        },
        estatisticas: {
          totalAlunos: resultados.length,
          media: Math.round(media * 100) / 100,
          desvioPadrao: Math.round(desvioPadrao * 100) / 100,
          notaMaxima,
          notaMinima,
          percentualAprovacao: Math.round(percentualAprovacao * 100) / 100,
        },
        alunos: resultados.map(r => ({
          nome: r.aluno.nome,
          cpf: r.aluno.cpf,
          numeroProva: r.numeroProva,
          notaFinal: r.notaFinal,
          percentualAcerto: r.percentualAcerto,
          modoCorrecao: r.modoCorrecao,
          dataCorrecao: r.dataCorrecao,
        })),
      };

      return relatorio;
    } catch (error) {
      logger.error('Erro ao gerar relatório de notas', {
        erro: error instanceof Error ? error.message : String(error),
        provaId,
      });
      throw error;
    }
  }

  /**
   * Exporta relatório como CSV
   */
  async exportarRelatorioCSV(provaId: string): Promise<string> {
    try {
      const relatorio = await this.gerarRelatorioNotas(provaId);

      const linhas = [
        ['Prova', relatorio.prova.titulo],
        ['Disciplina', relatorio.prova.disciplina],
        ['Professor', relatorio.prova.professor],
        ['Data', relatorio.prova.dataProva.toISOString().split('T')[0]],
        [],
        ['Estatísticas'],
        ['Total de Alunos', relatorio.estatisticas.totalAlunos],
        ['Média', relatorio.estatisticas.media],
        ['Desvio Padrão', relatorio.estatisticas.desvioPadrao],
        ['Nota Máxima', relatorio.estatisticas.notaMaxima],
        ['Nota Mínima', relatorio.estatisticas.notaMinima],
        ['Percentual de Aprovação', `${relatorio.estatisticas.percentualAprovacao}%`],
        [],
        ['Nome', 'CPF', 'Número da Prova', 'Nota Final', 'Percentual de Acerto', 'Modo de Correção', 'Data de Correção'],
        ...relatorio.alunos.map((a: any) => [
          a.nome,
          a.cpf,
          a.numeroProva,
          a.notaFinal,
          `${a.percentualAcerto}%`,
          a.modoCorrecao,
          a.dataCorrecao.toISOString().split('T')[0],
        ]),
      ];

      const csv = linhas.map(linha => linha.join(',')).join('\n');

      const nomeArquivo = `relatorio_notas_${provaId}_${Date.now()}.csv`;
      const caminhoArquivo = path.join(env.UPLOAD_DIR, nomeArquivo);

      fs.writeFileSync(caminhoArquivo, csv, 'utf-8');
      return caminhoArquivo;
    } catch (error) {
      logger.error('Erro ao exportar relatório CSV', {
        erro: error instanceof Error ? error.message : String(error),
        provaId,
      });
      throw error;
    }
  }

  private analisarRespostas(
    respostas: { [key: string]: string },
    gabarito: { [key: string]: string },
    _modoCorrecao: 'rigoroso' | 'flexivel'
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

    const notaFinal = modoCorrecao === 'rigoroso'
      ? Math.round(((totalAcertos / totalQuestoes) * 10) * 100) / 100
      : Math.round(totalAcertos * 100) / 100;
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
