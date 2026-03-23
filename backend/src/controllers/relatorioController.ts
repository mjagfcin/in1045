import { Request, Response } from 'express';
import relatorioService from '../services/relatorioService';
import logger from '../config/logger';

class RelatorioController {
  async gerar(req: Request, res: Response): Promise<void> {
    try {
      const { idProva, formato } = req.body;

      if (!idProva) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'idProva é obrigatório',
        });
        return;
      }

      const relatorio = await relatorioService.gerarRelatorioProva(
        idProva,
        (formato as 'csv' | 'pdf') || 'csv'
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Relatório gerado com sucesso',
        dados: relatorio,
      });
    } catch (error) {
      logger.error('Erro em RelatorioController.gerar', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao gerar relatório',
      });
    }
  }

  async obterRelatorios(req: Request, res: Response): Promise<void> {
    try {
      const { idProva } = req.params;
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 10;

      const { relatorios, total } = await relatorioService.obterRelatorios(idProva, pagina, limite);

      res.status(200).json({
        sucesso: true,
        dados: relatorios,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      });
    } catch (error) {
      logger.error('Erro em RelatorioController.obterRelatorios', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter relatórios',
      });
    }
  }

  async obterRelatorio(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const relatorio = await relatorioService.obterRelatorioPorId(id);

      if (!relatorio) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Relatório não encontrado',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: relatorio,
      });
    } catch (error) {
      logger.error('Erro em RelatorioController.obterRelatorio', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao obter relatório',
      });
    }
  }
}

export default new RelatorioController();
