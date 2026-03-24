import { Questao, IQuestao } from '../models/Questao';
import logger from '../config/logger';

interface CreateQuestaoDTO {
  enunciado: string;
  alternativas: Array<{ descricao: string; correta: boolean }>;
  disciplina: string;
  professor: string;
  dificuldade?: 'facil' | 'media' | 'dificil';
}

interface UpdateQuestaoDTO {
  enunciado?: string;
  alternativas?: Array<{ descricao: string; correta: boolean }>;
  disciplina?: string;
  professor?: string;
  dificuldade?: 'facil' | 'media' | 'dificil';
}

class QuestaoService {
  async createQuestao(data: CreateQuestaoDTO): Promise<IQuestao> {
    try {
      const questao = new Questao(data);
      await questao.save();
      logger.info('Questão criada', { questaoId: questao._id });
      return questao;
    } catch (error) {
      logger.error('Erro ao criar questão', { erro: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async getQuestoes(pagina: number = 1, limite: number = 20): Promise<{ questoes: IQuestao[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const questoes = await Questao.find({ ativo: true })
        .skip(skip)
        .limit(limite)
        .sort({ dataCriacao: -1 });

      const total = await Questao.countDocuments({ ativo: true });

      return { questoes, total };
    } catch (error) {
      logger.error('Erro ao buscar questões', { erro: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async searchQuestoes(termo: string, pagina: number = 1, limite: number = 20): Promise<{ questoes: IQuestao[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const questoes = await Questao.find(
        { $text: { $search: termo }, ativo: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limite);

      const total = await Questao.countDocuments({ $text: { $search: termo }, ativo: true });

      return { questoes, total };
    } catch (error) {
      logger.error('Erro ao buscar questões com texto', { erro: error instanceof Error ? error.message : String(error), termo });
      throw error;
    }
  }

  async getQuestaoById(id: string): Promise<IQuestao | null> {
    try {
      const questao = await Questao.findById(id);
      return questao || null;
    } catch (error) {
      logger.error('Erro ao buscar questão por ID', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async updateQuestao(id: string, data: UpdateQuestaoDTO): Promise<IQuestao | null> {
    try {
      const questao = await Questao.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (questao) {
        logger.info('Questão atualizada', { questaoId: id });
      }
      return questao;
    } catch (error) {
      logger.error('Erro ao atualizar questão', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async deleteQuestao(id: string): Promise<boolean> {
    try {
      const questao = await Questao.findByIdAndUpdate(id, { ativo: false }, { new: true });
      if (questao) {
        logger.info('Questão deletada (soft delete)', { questaoId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao deletar questão', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async getQuestoesByIds(ids: string[]): Promise<IQuestao[]> {
    try {
      const questoes = await Questao.find({ _id: { $in: ids }, ativo: true });
      return questoes;
    } catch (error) {
      logger.error('Erro ao buscar questões por IDs', { erro: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

export default new QuestaoService();
