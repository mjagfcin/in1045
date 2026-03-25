import { IQuestao, IProva, IResponseAPI, IResponseListaAPI, IPaginacao } from '../types/index';

// Base URL - em desenvolvimento usa proxy do vite, em produção usa localhost
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:3001/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

/**
 * Função genérica para fazer requisições HTTP
 */
async function fazerRequisicao<T>(
  rota: string,
  opcoes: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body } = opcoes;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${rota}`, config);

  if (!response.ok) {
    const erroData = await response.json().catch(() => ({}));
    throw new Error(erroData.mensagem || `Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Serviço de API para Questões
 */
export const questaoService = {
  // Listar todas as questões com paginação
  listar: (pagina = 1, limite = 10) =>
    fazerRequisicao<IResponseListaAPI<IQuestao>>(
      `/questoes?pagina=${pagina}&limite=${limite}`
    ),

  // Obter uma questão específica
  obter: (id: string) =>
    fazerRequisicao<IResponseAPI<IQuestao>>(`/questoes/${id}`),

  // Criar nova questão
  criar: (dados: Omit<IQuestao, '_id' | 'dataCriacao'>) =>
    fazerRequisicao<IResponseAPI<IQuestao>>('/questoes', {
      method: 'POST',
      body: dados,
    }),

  // Atualizar questão
  atualizar: (id: string, dados: Partial<IQuestao>) =>
    fazerRequisicao<IResponseAPI<IQuestao>>(`/questoes/${id}`, {
      method: 'PUT',
      body: dados,
    }),

  // Deletar questão
  deletar: (id: string) =>
    fazerRequisicao<IResponseAPI<void>>(`/questoes/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Serviço de API para Provas
 */
export const provaService = {
  // Listar todas as provas com paginação
  listar: (pagina = 1, limite = 10) =>
    fazerRequisicao<IResponseListaAPI<IProva>>(
      `/provas?pagina=${pagina}&limite=${limite}`
    ),

  // Obter uma prova específica
  obter: (id: string) =>
    fazerRequisicao<IResponseAPI<IProva>>(`/provas/${id}`),

  // Criar nova prova
  criar: (dados: Omit<IProva, '_id' | 'dataCriacao'>) =>
    fazerRequisicao<IResponseAPI<IProva>>('/provas', {
      method: 'POST',
      body: dados,
    }),

  // Atualizar prova
  atualizar: (id: string, dados: Partial<IProva>) =>
    fazerRequisicao<IResponseAPI<IProva>>(`/provas/${id}`, {
      method: 'PUT',
      body: dados,
    }),

  // Deletar prova
  deletar: (id: string) =>
    fazerRequisicao<IResponseAPI<void>>(`/provas/${id}`, {
      method: 'DELETE',
    }),
};

// Serviço de PDF
export const pdfService = {
  gerarPDFs: (provaId: string, quantidade: number) =>
    fazerRequisicao<IResponseAPI<{ arquivos: string[] }>>('/pdf/gerar', {
      method: 'POST',
      body: { provaId, quantidade },
    }),

  gerarPDFsZip: async (provaId: string, quantidade: number): Promise<Blob> => {
    const response = await fetch(
      `${API_BASE_URL}/pdf/zip?provaId=${encodeURIComponent(provaId)}&quantidade=${quantidade}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const erroData = await response.json().catch(() => ({}));
      throw new Error(erroData.mensagem || `Erro na requisição: ${response.statusText}`);
    }

    return response.blob();
  },

  gerarGabarito: (gabaritos: any) =>
    fazerRequisicao<IResponseAPI<{ arquivo: string }>>('/pdf/gabarito', {
      method: 'POST',
      body: { gabaritos },
    }),
};

/**
 * Serviço de Correção de Provas
 */
export const correcaoService = {
  corrigirProvas: async (provaId: string, gabaritoFile: File, respostasFile: File, modoCorrecao: 'rigoroso' | 'flexivel' = 'rigoroso') => {
    const formData = new FormData();
    formData.append('provaId', provaId);
    formData.append('modoCorrecao', modoCorrecao);
    formData.append('gabarito', gabaritoFile);
    formData.append('respostas', respostasFile);

    const response = await fetch(`${API_BASE_URL}/correcao/corrigir`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const erroData = await response.json().catch(() => ({}));
      throw new Error(erroData.mensagem || `Erro na requisição: ${response.statusText}`);
    }

    return response.json();
  },

  gerarRelatorioNotas: (provaId: string) =>
    fazerRequisicao<IResponseAPI<any>>(`/correcao/relatorio/${provaId}`),

  exportarRelatorioCSV: async (provaId: string) => {
    const response = await fetch(`${API_BASE_URL}/correcao/relatorio/${provaId}/csv`);

    if (!response.ok) {
      const erroData = await response.json().catch(() => ({}));
      throw new Error(erroData.mensagem || `Erro na requisição: ${response.statusText}`);
    }

    return response.blob();
  },

  exportarRelatorioPDF: async (provaId: string) => {
    const response = await fetch(`${API_BASE_URL}/correcao/relatorio/${provaId}/pdf`);

    if (!response.ok) {
      const erroData = await response.json().catch(() => ({}));
      throw new Error(erroData.mensagem || `Erro na requisição: ${response.statusText}`);
    }

    return response.blob();
  },
};
