import { Request, Response } from 'express';
import pdfService from '../services/pdfService';
import csvService from '../services/csvService';
import logger from '../config/logger';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

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

  async baixarPDFsComoZip(req: Request, res: Response): Promise<void> {
    try {
      const provaId = (req.query.provaId || req.body.provaId) as string;
      const quantidade = Number(req.query.quantidade || req.body.quantidade);

      if (!provaId || !quantidade || Number.isNaN(quantidade)) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId e quantidade válidos são obrigatórios',
        });
        return;
      }

      const { arquivos } = await pdfService.gerarMultiplosPDFs(provaId, quantidade);

      if (!arquivos || arquivos.length === 0) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Nenhum PDF gerado',
        });
        return;
      }

      const nomeZip = `provas_${provaId}_${Date.now()}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeZip}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err: Error) => {
        throw err;
      });

      archive.pipe(res);

      arquivos.forEach((arquivo) => {
        const arquivoComNome = path.basename(arquivo);
        if (fs.existsSync(arquivo)) {
          archive.file(arquivo, { name: arquivoComNome });
        }
      });

      archive.finalize();
    } catch (error) {
      logger.error('Erro em PDFController.baixarPDFsComoZip', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao baixar PDFs como ZIP',
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
