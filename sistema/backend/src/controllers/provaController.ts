import { Request, Response } from 'express';
import provaService from '../services/provaService';
import logger from '../config/logger';

class ProvaController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { titulo, disciplina, professor, dataProva, questoes, esquemaAlternativas } = req.body;

      const prova = await provaService.createProva({
        titulo,
        disciplina,
        professor,
        dataProva,
        questoes,
        esquemaAlternativas,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Prova criada com sucesso',
        dados: prova,
      });
    } catch (error) {
      logger.error('Erro em ProvaController.create', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao criar prova',
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;

      const { provas, total } = await provaService.getProvas(pagina, limite);

      res.status(200).json({
        sucesso: true,
        dados: provas,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite),
        },
      });
    } catch (error) {
      logger.error('Erro em ProvaController.getAll', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar provas',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const prova = await provaService.getProvaById(id);

      if (!prova) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Prova não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: prova,
      });
    } catch (error) {
      logger.error('Erro em ProvaController.getById', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar prova',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { titulo, disciplina, professor, dataProva, questoes, esquemaAlternativas } = req.body;

      const prova = await provaService.updateProva(id, {
        titulo,
        disciplina,
        professor,
        dataProva,
        questoes,
        esquemaAlternativas,
      });

      if (!prova) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Prova não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Prova atualizada com sucesso',
        dados: prova,
      });
    } catch (error) {
      logger.error('Erro em ProvaController.update', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao atualizar prova',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletada = await provaService.deleteProva(id);

      if (!deletada) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Prova não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Prova deletada com sucesso',
      });
    } catch (error) {
      logger.error('Erro em ProvaController.delete', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar prova',
      });
    }
  }
}

export default new ProvaController();
