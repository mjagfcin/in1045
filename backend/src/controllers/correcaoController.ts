import { Request, Response } from 'express';
import correcaoService from '../services/correcaoService';
import csvService from '../services/csvService';
import logger from '../config/logger';

class CorrecaoController {
  async importarRespostas(req: Request, res: Response): Promise<void> {
    try {
      const { caminhoArquivo, modoCorrecao } = req.body;

      if (!caminhoArquivo || !modoCorrecao) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'caminhoArquivo e modoCorrecao são obrigatórios',
        });
        return;
      }

      // Ler CSV de respostas
      const respostas = await csvService.lerCSVRespostas(caminhoArquivo);

      // Validar CSV
      const validacao = csvService.validarCSVRespostas(respostas);
      if (!validacao.valido) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'CSV inválido',
          erros: validacao.erros,
        });
        return;
      }

      // Corrigir cada resposta
      const resultados = [];
      for (const resposta of respostas) {
        try {
          // Aqui seria necessário buscar a prova gerada para obter o gabarito
          // Por simplicidade, estou simplificando o fluxo
          const resultado = await correcaoService.corrigirProva({
            idProvaGerada: '', // Seria necessário buscar
            idProva: '', // Seria necessário buscar
            numeroProva: resposta.numeroProva,
            nomeAluno: resposta.nome,
            cpf: resposta.cpf,
            respostas: resposta.respostas,
            gabarito: {}, // Seria necessário buscar do BD
            modoCorrecao: modoCorrecao as 'rigoroso' | 'flexivel',
          });
          resultados.push(resultado);
        } catch (error) {
          logger.error('Erro ao corrigir resposta individual', {
            erro: error instanceof Error ? error.message : String(error),
            numeroProva: resposta.numeroProva,
          });
        }
      }

      res.status(200).json({
        sucesso: true,
        mensagem: `${resultados.length} prova(s) corrigida(s) com sucesso`,
        dados: resultados,
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.importarRespostas', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao importar respostas',
      });
    }
  }

  async obterResultados(req: Request, res: Response): Promise<void> {
    try {
      const { idProva } = req.params;
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;

      const { resultados, total } = await correcaoService.obterResultadosPorProva(idProva, pagina, limite);

      res.status(200).json({
        sucesso: true,
        dados: resultados,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.obterResultados', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter resultados',
      });
    }
  }

  async obterResultado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resultado = await correcaoService.obterResultado(id);

      if (!resultado) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Resultado não encontrado',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: resultado,
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.obterResultado', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter resultado',
      });
    }
  }

  async obterEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const { idProva } = req.params;
      const estatisticas = await correcaoService.obterEstatisticasProva(idProva);

      res.status(200).json({
        sucesso: true,
        dados: estatisticas,
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.obterEstatisticas', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter estatísticas',
      });
    }
  }
}

export default new CorrecaoController();
