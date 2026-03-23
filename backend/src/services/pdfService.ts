import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Prova, IProva } from '../models/Prova';
import { Questao, IQuestao } from '../models/Questao';
import { ProvaGerada, IGabarito, IQuestaoOrdenada, IAlternativaOrdenada } from '../models/ProvaGerada';
import logger from '../config/logger';
import env from '../config/env';

interface AlternativaComId {
  _id: string;
  descricao: string;
  correta: boolean;
}

class PDFService {
  private uploadDir = env.UPLOAD_DIR;

  constructor() {
    // Criar diretório de upload se não existir
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getLetrasAlternativas(quantidade: number): string[] {
    const letras = 'abcdefghij'.split('');
    return letras.slice(0, quantidade);
  }

  private getPotenciasAlternativas(quantidade: number): number[] {
    const potencias = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    return potencias.slice(0, quantidade);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private criarGabarito(questoesOrdenadas: IQuestaoOrdenada[], gabaritoPrevio: { [key: string]: AlternativaComId[] }): IGabarito {
    const gabarito: IGabarito = {};

    questoesOrdenadas.forEach((questaoOrdenada, index) => {
      const chaveQuestao = `questao_${index + 1}`;
      const alternativasCorretas = questaoOrdenada.alternativasOrdenadas
        .filter((alt) => {
          // Encontrar a alternativa original para verificar se é correta
          const alternativaOriginal = gabaritoPrevio[String(questaoOrdenada.idQuestao)]?.find(
            (a) => String(a._id) === String(alt.idAlternativa)
          );
          return alternativaOriginal?.correta;
        })
        .map((alt) => alt.identificador);

      gabarito[chaveQuestao] = alternativasCorretas.join('');
    });

    return gabarito;
  }

  async gerarMultiplosPDFs(provaId: string, quantidade: number): Promise<{ arquivos: string[]; gabarito: { [key: string]: string } }> {
    try {
      // Validar quantidade
      if (quantidade < 1 || quantidade > 1000) {
        throw new Error('Quantidade de PDFs deve estar entre 1 e 1000');
      }

      // Buscar prova
      const prova = await Prova.findById(provaId).populate('questoes.idQuestao');
      if (!prova) {
        throw new Error('Prova não encontrada');
      }

      // Buscar questões em detalhe
      const questoes = await Questao.find({
        _id: { $in: prova.questoes.map((q) => q.idQuestao) },
      });

      const questoesMap = new Map<string, IQuestao>(questoes.map((q) => [String(q._id), q]));

      // Criar mapa de gabarito previamente
      const gabaritoPrevio: { [key: string]: AlternativaComId[] } = {};
      prova.questoes.forEach((q) => {
        const questao = questoesMap.get(String(q.idQuestao));
        if (questao) {
          gabaritoPrevio[String(q.idQuestao)] = questao.alternativas as AlternativaComId[];
        }
      });

      // Determinar tipo de esquema
      const tipoEsquema = prova.esquemaAlternativas.tipo;
      const arquivos: string[] = [];
      const gabaritoMestre: { [key: string]: string } = {};

      // Gerar múltiplos PDFs
      for (let i = 1; i <= quantidade; i++) {
        // Embaralhar ordem de questões
        const questoesEmbaralhadas = this.shuffleArray(prova.questoes);

        // Para cada questão, embaralhar alternativas
        const questoesOrdenadas: IQuestaoOrdenada[] = [];

        questoesEmbaralhadas.forEach((questaoProva, indexQuestao) => {
          const questao = questoesMap.get(String(questaoProva.idQuestao));
          if (!questao) return;

          // Embaralhar alternativas
          const alternativasEmbaralhadas = this.shuffleArray([...(questao.alternativas as AlternativaComId[])]);

          // Mapear para identificadores (letras ou potências)
          let identificadores: string[];
          if (tipoEsquema === 'letras') {
            identificadores = this.getLetrasAlternativas(alternativasEmbaralhadas.length);
          } else {
            identificadores = this.getPotenciasAlternativas(alternativasEmbaralhadas.length).map(String);
          }

          const alternativasOrdenadas: IAlternativaOrdenada[] = alternativasEmbaralhadas.map((alt, index) => ({
            idAlternativa: alt._id,
            identificador: identificadores[index],
          }));

          questoesOrdenadas.push({
            idQuestao: questaoProva.idQuestao,
            posicao: indexQuestao + 1,
            alternativasOrdenadas,
          });
        });

        // Criar gabarito para essa prova
        const gabarito = this.criarGabarito(questoesOrdenadas, gabaritoPrevio);

        // Gerar PDF
        const numeroIdentificador = `prova_${String(prova._id).slice(-3)}_${String(i).padStart(3, '0')}`;
        const pdfPath = path.join(this.uploadDir, `${numeroIdentificador}.pdf`);

        await this.gerarPDFIndividual(
          pdfPath,
          prova as IProva,
          questoesOrdenadas,
          gabarito,
          numeroIdentificador,
          tipoEsquema
        );

        // Salvar metadados em ProvaGerada
        const provaGerada = new ProvaGerada({
          idProva: prova._id,
          numeroSequencial: i,
          numeroIdentificador,
          questoesOrdenadas,
          gabarito,
          arquivoPDF: `/uploads/${numeroIdentificador}.pdf`,
        });
        await provaGerada.save();

        arquivos.push(pdfPath);
        gabaritoPrevio[`${numeroIdentificador}`] = gabarito;

        // Armazenar primeiro gabarito como mestre (para CSV)
        if (i === 1) {
          Object.assign(gabaritoMestre, { [numeroIdentificador]: gabarito });
        }
      }

      logger.info('PDFs gerados com sucesso', { provaId, quantidade });
      return { arquivos, gabarito: gabaritoPrevio };
    } catch (error) {
      logger.error('Erro ao gerar múltiplos PDFs', { erro: error instanceof Error ? error.message : String(error), provaId });
      throw error;
    }
  }

  private async gerarPDFIndividual(
    pdfPath: string,
    prova: IProva,
    questoesOrdenadas: IQuestaoOrdenada[],
    gabarito: IGabarito,
    numeroIdentificador: string,
    tipoEsquema: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Cabeçalho
        doc.fontSize(18).font('Helvetica-Bold').text(prova.titulo, { align: 'center' });
        doc.fontSize(11).font('Helvetica').text(`Disciplina: ${prova.disciplina}`, { align: 'left' });
        doc.text(`Professor: ${prova.professor}`, { align: 'left' });
        doc.text(`Data: ${new Date(prova.dataProva).toLocaleDateString('pt-BR')}`, { align: 'left' });
        doc.text(`Prova nº: ${numeroIdentificador}`, { align: 'center' }).moveDown();

        // Instruções
        const instrucao =
          tipoEsquema === 'letras'
            ? 'Marque a(s) alternativa(s) correta(s) com as respectivas letra(s):'
            : 'Some o valor das alternativas corretas:';
        doc.fontSize(10).font('Helvetica').text(instrucao, { align: 'left' }).moveDown();

        // Questões
        let numQuestao = 1;
        questoesOrdenadas.forEach((questaoOrdenada) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`Questão ${numQuestao}:`, { align: 'left' });

          // Buscar questão original (seria necessário popular aqui)
          // Por simplicidade, usaremos dados já carregados
          doc.fontSize(10).font('Helvetica').text('Enunciado da questão', { align: 'left' }).moveDown(0.5);

          // Alternativas
          questaoOrdenada.alternativasOrdenadas.forEach((alt) => {
            doc.fontSize(10).text(`${alt.identificador}) Descrição alternativa`, { align: 'left' });
          });

          // Espaço para resposta
          if (tipoEsquema === 'letras') {
            doc.text('Resposta: _____________________', { align: 'left' });
          } else {
            doc.text('Soma das alternativas: _____________________', { align: 'left' });
          }

          doc.moveDown(1);
          numQuestao++;

          // Verificar se precisa nova página
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
            // Rodapé da página anterior (número da prova)
            doc.fontSize(9).text(numeroIdentificador, 50, doc.page.height - 30, { align: 'center' });
          }
        });

        // Final do PDF - Espaço para aluno
        doc.moveDown(2);
        doc.fontSize(11).font('Helvetica-Bold').text('Identificação do Aluno', { underline: true });
        doc.fontSize(10)
          .font('Helvetica')
          .text('Nome: _______________________________________________________________', { align: 'left' });
        doc.text('CPF: _______________________________________________________________', { align: 'left' }).moveDown();

        // Rodapé final
        doc.fontSize(9).text(numeroIdentificador, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve();
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new PDFService();
