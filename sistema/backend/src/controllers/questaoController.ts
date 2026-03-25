import { Request, Response } from 'express';
import questaoService from '../services/questaoService';
import logger from '../config/logger';

class QuestaoController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { enunciado, alternativas, disciplina, professor, dificuldade } = req.body;

      const questao = await questaoService.createQuestao({
        enunciado,
        alternativas,
        disciplina,
        professor,
        dificuldade,
      });

      res.status(201).json({
        sucesso: true,
        mensagem: 'Questão criada com sucesso',
        dados: questao,
      });
    } catch (error) {
      logger.error('Erro em QuestaoController.create', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao criar questão',
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 20;
      const termo = req.query.termo as string;

      let resultado;
      if (termo) {
        resultado = await questaoService.searchQuestoes(termo, pagina, limite);
      } else {
        resultado = await questaoService.getQuestoes(pagina, limite);
      }

      res.status(200).json({
        sucesso: true,
        dados: resultado.questoes,
        paginacao: {
          pagina,
          limite,
          total: resultado.total,
          totalPaginas: Math.ceil(resultado.total / limite),
        },
      });
    } catch (error) {
      logger.error('Erro em QuestaoController.getAll', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar questões',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const questao = await questaoService.getQuestaoById(id);

      if (!questao) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Questão não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        dados: questao,
      });
    } catch (error) {
      logger.error('Erro em QuestaoController.getById', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao buscar questão',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { enunciado, alternativas } = req.body;

      const questao = await questaoService.updateQuestao(id, {
        enunciado,
        alternativas,
      });

      if (!questao) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Questão não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Questão atualizada com sucesso',
        dados: questao,
      });
    } catch (error) {
      logger.error('Erro em QuestaoController.update', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(400).json({
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro ao atualizar questão',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletado = await questaoService.deleteQuestao(id);

      if (!deletado) {
        res.status(404).json({
          sucesso: false,
          mensagem: 'Questão não encontrada',
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        mensagem: 'Questão deletada com sucesso',
      });
    } catch (error) {
      logger.error('Erro em QuestaoController.delete', {
        erro: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao deletar questão',
      });
    }
  }
}

export default new QuestaoController();
