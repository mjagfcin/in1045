import { Request, Response } from 'express';
import correcaoService from '../services/correcaoService';
import logger from '../config/logger';
import multer from 'multer';
import path from 'path';
import env from '../config/env';

class CorrecaoController {
  private upload = multer({
    dest: env.UPLOAD_DIR,
    fileFilter: (_req: any, file: any, cb: any) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos CSV são permitidos'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  /**
   * Middleware para upload de múltiplos arquivos
   */
  uploadArquivos = this.upload.fields([
    { name: 'gabarito', maxCount: 1 },
    { name: 'respostas', maxCount: 1 },
  ]);

  /**
   * Corrige provas em lote a partir de CSVs
   */
  async corrigirProvas(req: Request, res: Response): Promise<void> {
    try {
      const { provaId, modoCorrecao = 'rigoroso' } = req.body;

      if (!provaId) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId é obrigatório',
        });
        return;
      }

      const files = (req as any).files;
      if (!files || !('gabarito' in files) || !('respostas' in files)) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'Arquivos gabarito.csv e respostas.csv são obrigatórios',
        });
        return;
      }

      const gabaritoFile = files.gabarito[0];
      const respostasFile = files.respostas[0];

      const caminhoGabarito = gabaritoFile.path;
      const caminhoRespostas = respostasFile.path;

      const resultados = await correcaoService.corrigirProvasEmLote(
        provaId,
        caminhoGabarito,
        caminhoRespostas,
        modoCorrecao as 'rigoroso' | 'flexivel'
      );

      res.status(200).json({
        sucesso: true,
        mensagem: `${resultados.length} provas corrigidas com sucesso`,
        dados: {
          totalCorrigidas: resultados.length,
          modoCorrecao,
        },
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.corrigirProvas', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao corrigir provas',
      });
    }
  }

  /**
   * Gera relatório de notas da turma
   */
  async gerarRelatorioNotas(req: Request, res: Response): Promise<void> {
    try {
      const { provaId } = req.params;

      if (!provaId) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId é obrigatório',
        });
        return;
      }

      const relatorio = await correcaoService.gerarRelatorioNotas(provaId);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Relatório gerado com sucesso',
        dados: relatorio,
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.gerarRelatorioNotas', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao gerar relatório',
      });
    }
  }

  /**
   * Exporta relatório de notas como CSV
   */
  async exportarRelatorioCSV(req: Request, res: Response): Promise<void> {
    try {
      const { provaId } = req.params;

      if (!provaId) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId é obrigatório',
        });
        return;
      }

      const caminhoArquivo = await correcaoService.exportarRelatorioCSV(provaId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(caminhoArquivo)}"`);

      const fs = await import('fs');
      const stream = fs.createReadStream(caminhoArquivo);
      stream.pipe(res);

      // Limpar arquivo após envio
      stream.on('end', () => {
        fs.unlinkSync(caminhoArquivo);
      });
    } catch (error) {
      logger.error('Erro em CorrecaoController.exportarRelatorioCSV', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao exportar relatório',
      });
    }
  }

  /**
   * Exporta relatório de notas como PDF
   */
  async exportarRelatorioPDF(req: Request, res: Response): Promise<void> {
    try {
      const { provaId } = req.params;

      if (!provaId) {
        res.status(400).json({
          sucesso: false,
          mensagem: 'provaId é obrigatório',
        });
        return;
      }

      const relatorio = await correcaoService.gerarRelatorioNotas(provaId);

      // Gerar PDF simples (pode ser expandido)
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio_notas_${provaId}.pdf"`);

      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Notas da Turma', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`Prova: ${relatorio.prova.titulo}`);
      doc.text(`Disciplina: ${relatorio.prova.disciplina}`);
      doc.text(`Professor: ${relatorio.prova.professor}`);
      doc.text(`Data: ${relatorio.prova.dataProva.toISOString().split('T')[0]}`);
      doc.moveDown();

      // Estatísticas
      doc.fontSize(16).text('Estatísticas', { underline: true });
      doc.fontSize(12);
      doc.text(`Total de Alunos: ${relatorio.estatisticas.totalAlunos}`);
      doc.text(`Média: ${relatorio.estatisticas.media}`);
      doc.text(`Desvio Padrão: ${relatorio.estatisticas.desvioPadrao}`);
      doc.text(`Nota Máxima: ${relatorio.estatisticas.notaMaxima}`);
      doc.text(`Nota Mínima: ${relatorio.estatisticas.notaMinima}`);
      doc.text(`Percentual de Aprovação: ${relatorio.estatisticas.percentualAprovacao}%`);
      doc.moveDown();

      // Tabela de alunos
      doc.fontSize(16).text('Notas dos Alunos', { underline: true });
      doc.moveDown(0.5);

      relatorio.alunos.forEach((aluno: any, index: number) => {
        doc.fontSize(10).text(
          `${index + 1}. ${aluno.nome} (CPF: ${aluno.cpf}) - Prova ${aluno.numeroProva}: ${aluno.notaFinal} (${aluno.percentualAcerto}%)`
        );
      });

      doc.end();
    } catch (error) {
      logger.error('Erro em CorrecaoController.exportarRelatorioPDF', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao exportar relatório PDF',
      });
    }
  }

  async obterResultados(req: Request, res: Response): Promise<void> {
    try {
      const { idProva } = req.params;
      const { pagina = '1', limite = '20' } = req.query as any;
      const paginaNum = parseInt(pagina, 10) || 1;
      const limiteNum = parseInt(limite, 10) || 20;

      const { resultados, total } = await correcaoService.obterResultadosPorProva(idProva, paginaNum, limiteNum);

      res.status(200).json({
        sucesso: true,
        dados: resultados,
        paginacao: {
          pagina: paginaNum,
          limite: limiteNum,
          total,
          totalPaginas: Math.ceil(total / limiteNum),
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
