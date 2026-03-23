import { Request, Response } from 'express';
import pdfService from '../services/pdfService';
import csvService from '../services/csvService';
import logger from '../config/logger';

class PDFController {
  async gerarPDFs(req: Request, res: Response): Promise<void> {
    try {
      const { provaId, quantidade } = req.body;

      if (!provaId || !quantidade) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId e quantidade são obrigatórios',
        });
        return;
      }

      const { arquivos } = await pdfService.gerarMultiplosPDFs(provaId, quantidade);

      res.status(200).json({
        sucesso: true,
        mensagem: `${quantidade} PDF(s) gerados com sucesso`,
        dados: {
          arquivos,
          quantidade: arquivos.length,
        },
      });
    } catch (error) {
      logger.error('Erro em PDFController.gerarPDFs', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao gerar PDFs',
      });
    }
  }

  async gerarGabarito(req: Request, res: Response): Promise<void> {
    try {
      const { gabaritos } = req.body;

      if (!gabaritos) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'gabaritos é obrigatório',
        });
        return;
      }

      const caminhoArquivo = await csvService.gerarCSVGabarito(gabaritos);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Gabarito gerado com sucesso',
        dados: {
          arquivo: caminhoArquivo,
        },
      });
    } catch (error) {
      logger.error('Erro em PDFController.gerarGabarito', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao gerar gabarito',
      });
    }
  }
}

export default new PDFController();
