import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import logger from '../config/logger';
import env from '../config/env';

interface LinhaGabarito {
  numero_prova: string;
  [key: string]: string;
}

interface LinhaRespostas {
  numero_prova: string;
  nome: string;
  cpf: string;
  [key: string]: string;
}

interface GabaritoProcessado {
  numeroProva: string;
  respostas: { [key: string]: string };
}

interface RespostasAluno {
  numeroProva: string;
  nome: string;
  cpf: string;
  respostas: { [key: string]: string };
}

class CSVService {
  private uploadDir = env.UPLOAD_DIR;

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async gerarCSVGabarito(gabaritos: { [key: string]: { [key: string]: string } }): Promise<string> {
    try {
      const linhas: any[] = [];

      // Determinar headers dinamicamente
      const headers = new Set<string>(['numero_prova']);
      Object.values(gabaritos).forEach((gabarito) => {
        Object.keys(gabarito).forEach((key) => {
          if (key.startsWith('questao_')) {
            headers.add(key);
          }
        });
      });

      // Construir linhasdo CSV
      Object.entries(gabaritos).forEach(([numeroProva, gabarito]) => {
        const linha: any = { numero_prova: numeroProva };
        Object.entries(gabarito).forEach(([questao, resposta]) => {
          if (questao.startsWith('questao_')) {
            linha[questao] = resposta;
          }
        });
        linhas.push(linha);
      });

      // Converter para CSV
      const csv = Papa.unparse({
        fields: Array.from(headers),
        data: linhas,
      });

      // Salvar arquivo
      const timestamp = Date.now();
      const nomeArquivo = `gabarito_${timestamp}.csv`;
      const caminhoArquivo = path.join(this.uploadDir, nomeArquivo);

      fs.writeFileSync(caminhoArquivo, csv, 'utf-8');

      logger.info('CSV de gabarito gerado', { arquivo: nomeArquivo });
      return caminhoArquivo;
    } catch (error) {
      logger.error('Erro ao gerar CSV de gabarito', {
        erro: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async lerCSVGabarito(caminhoArquivo: string): Promise<GabaritoProcessado[]> {
    try {
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');

      return new Promise((resolve, reject) => {
        Papa.parse(conteudo, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const gabaritos: GabaritoProcessado[] = (results.data as LinhaGabarito[]).map((linha) => {
              const { numero_prova, ...respostas } = linha;
              return {
                numeroProva: numero_prova || '',
                respostas: Object.fromEntries(Object.entries(respostas).filter(([key]) => key.startsWith('questao_'))) ,
              };
            });

            logger.info('CSV de gabarito lido com sucesso', { linhas: gabaritos.length });
            resolve(gabaritos);
          },
          error: (error: any) => {
            logger.error('Erro ao ler CSV de gabarito', { erro: error.message });
            reject(error);
          },
        });
      });
    } catch (error) {
      logger.error('Erro ao ler arquivo CSV de gabarito', {
        erro: error instanceof Error ? error.message : String(error),
        arquivo: caminhoArquivo,
      });
      throw error;
    }
  }

  async lerCSVRespostas(caminhoArquivo: string): Promise<RespostasAluno[]> {
    try {
      const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');

      return new Promise((resolve, reject) => {
        Papa.parse(conteudo, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const respostas: RespostasAluno[] = (results.data as LinhaRespostas[]).map((linha) => {
              const { numero_prova, nome, cpf, ...questoes } = linha;
              return {
                numeroProva: numero_prova || '',
                nome: nome || '',
                cpf: cpf || '',
                respostas: Object.fromEntries(Object.entries(questoes).filter(([key]) => key.startsWith('questao_'))),
              };
            });

            logger.info('CSV de respostas lido com sucesso', { linhas: respostas.length });
            resolve(respostas);
          },
          error: (error: any) => {
            logger.error('Erro ao ler CSV de respostas', { erro: error.message });
            reject(error);
          },
        });
      });
    } catch (error) {
      logger.error('Erro ao ler arquivo CSV de respostas', {
        erro: error instanceof Error ? error.message : String(error),
        arquivo: caminhoArquivo,
      });
      throw error;
    }
  }

  async gerarCSVRelatorio(dados: any[]): Promise<string> {
    try {
      const csv = Papa.unparse(dados);

      const timestamp = Date.now();
      const nomeArquivo = `relatorio_${timestamp}.csv`;
      const caminhoArquivo = path.join(this.uploadDir, nomeArquivo);

      fs.writeFileSync(caminhoArquivo, csv, 'utf-8');

      logger.info('CSV de relatório gerado', { arquivo: nomeArquivo });
      return caminhoArquivo;
    } catch (error) {
      logger.error('Erro ao gerar CSV de relatório', {
        erro: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  validarCSVRespostas(respostas: RespostasAluno[]): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    respostas.forEach((linha, index) => {
      if (!linha.numeroProva) {
        erros.push(`Linha ${index + 1}: numero_prova ausente`);
      }
      if (!linha.nome) {
        erros.push(`Linha ${index + 1}: nome ausente`);
      }
      if (!linha.cpf) {
        erros.push(`Linha ${index + 1}: cpf ausente`);
      }
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(linha.cpf)) {
        erros.push(`Linha ${index + 1}: CPF em formato inválido (deve ser XXX.XXX.XXX-XX)`);
      }
    });

    return {
      valido: erros.length === 0,
      erros,
    };
  }
}

export default new CSVService();
