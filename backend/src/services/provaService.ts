import { Prova, IProva, IQuestaoProva } from '../models/Prova';
import logger from '../config/logger';

interface CreateProvaDTO {
  titulo: string;
  disciplina: string;
  professor: string;
  dataProva: Date;
  questoes: Omit<IQuestaoProva, '_id'>[];
  esquemaAlternativas: { tipo: 'letras' | 'potencias' };
}

interface UpdateProvaDTO {
  titulo?: string;
  disciplina?: string;
  professor?: string;
  dataProva?: Date;
  questoes?: Omit<IQuestaoProva, '_id'>[];
  esquemaAlternativas?: { tipo: 'letras' | 'potencias' };
}

class ProvaService {
  async createProva(data: CreateProvaDTO): Promise<IProva> {
    try {
      const prova = new Prova(data);
      await prova.save();
      await prova.populate('questoes.idQuestao');
      logger.info('Prova criada', { provaId: prova._id });
      return prova;
    } catch (error) {
      logger.error('Erro ao criar prova', { erro: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async getProvas(pagina: number = 1, limite: number = 20): Promise<{ provas: IProva[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const provas = await Prova.find({ ativo: true })
        .skip(skip)
        .limit(limite)
        .populate('questoes.idQuestao')
        .sort({ dataCriacao: -1 });

      const total = await Prova.countDocuments({ ativo: true });

      return { provas, total };
    } catch (error) {
      logger.error('Erro ao buscar provas', { erro: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async getProvaById(id: string): Promise<IProva | null> {
    try {
      const prova = await Prova.findById(id).populate('questoes.idQuestao');
      return prova || null;
    } catch (error) {
      logger.error('Erro ao buscar prova por ID', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async updateProva(id: string, data: UpdateProvaDTO): Promise<IProva | null> {
    try {
      const prova = await Prova.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
        'questoes.idQuestao'
      );
      if (prova) {
        logger.info('Prova atualizada', { provaId: id });
      }
      return prova;
    } catch (error) {
      logger.error('Erro ao atualizar prova', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async deleteProva(id: string): Promise<boolean> {
    try {
      const prova = await Prova.findByIdAndUpdate(id, { ativo: false }, { new: true });
      if (prova) {
        logger.info('Prova deletada (soft delete)', { provaId: id });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao deletar prova', { erro: error instanceof Error ? error.message : String(error), id });
      throw error;
    }
  }

  async getProvasByProfessor(professor: string, pagina: number = 1, limite: number = 20): Promise<{ provas: IProva[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const provas = await Prova.find({ professor, ativo: true })
        .skip(skip)
        .limit(limite)
        .populate('questoes.idQuestao')
        .sort({ dataCriacao: -1 });

      const total = await Prova.countDocuments({ professor, ativo: true });

      return { provas, total };
    } catch (error) {
      logger.error('Erro ao buscar provas por professor', {
        erro: error instanceof Error ? error.message : String(error),
        professor,
      });
      throw error;
    }
  }

  async getProvasByDisciplina(disciplina: string, pagina: number = 1, limite: number = 20): Promise<{ provas: IProva[]; total: number }> {
    try {
      const skip = (pagina - 1) * limite;
      const provas = await Prova.find({ disciplina, ativo: true })
        .skip(skip)
        .limit(limite)
        .populate('questoes.idQuestao')
        .sort({ dataCriacao: -1 });

      const total = await Prova.countDocuments({ disciplina, ativo: true });

      return { provas, total };
    } catch (error) {
      logger.error('Erro ao buscar provas por disciplina', {
        erro: error instanceof Error ? error.message : String(error),
        disciplina,
      });
      throw error;
    }
  }
}

export default new ProvaService();
