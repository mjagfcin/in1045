export interface Question {
  id: string;
  enunciado: string;
  alternativas: Array<{ descricao: string; correta: boolean }>;
  ativo: boolean;
}

export interface Prova {
  id: string;
  titulo: string;
  disciplina: string;
  professor: string;
  dataProva: string;
  esquemaAlternativas: 'letras' | 'potencias';
  questoes: string[];
  ativo: boolean;
}

export interface TestState {
  questions: Question[];
  provas: Prova[];
  selectedQuestionId?: string;
  selectedProvaId?: string;
  filteredQuestions: Question[];
  filteredProvas: Prova[];
  pagination?: { pagina: number; limite: number; total: number };

  respostasImportadas: Array<Record<string, string>>;
  respostasValidas: Array<Record<string, string>>;
  gabarito: Record<string, string>;
  notasQuestoes: Record<string, number>;
  notaFinal?: number;
  modoCorrecao?: 'rigoroso' | 'flexivel';
  questoesOmitidas: string[];
  resultadoRegistrado?: Record<string, unknown>;

  generatedPdfs: Array<{ id: string; ordemQuestoes: string[]; ordemAlternativas: string[] }>;
  pdfMetadata?: Record<string, string>;
  generatedCsv?: string;
  generatedPdf?: string;

  relatorio?: {
    cabecalho: Record<string, string>;
    alunos: Array<Record<string, string | number>>;
    estatisticas: Record<string, number>;
    modo?: 'Rigoroso' | 'Flexível';
    percentualAprovacao?: number;
  };

  error?: string;
}

export const state: TestState = {
  questions: [],
  provas: [],
  filteredQuestions: [],
  filteredProvas: [],
  respostasImportadas: [],
  respostasValidas: [],
  gabarito: {},
  notasQuestoes: {},
  questoesOmitidas: [],
  generatedPdfs: [],
};

export function resetState(): void {
  state.questions = [];
  state.provas = [];
  state.selectedQuestionId = undefined;
  state.selectedProvaId = undefined;
  state.filteredQuestions = [];
  state.filteredProvas = [];
  state.pagination = undefined;

  state.respostasImportadas = [];
  state.respostasValidas = [];
  state.gabarito = {};
  state.notasQuestoes = {};
  state.notaFinal = undefined;
  state.modoCorrecao = undefined;
  state.questoesOmitidas = [];
  state.resultadoRegistrado = undefined;

  state.generatedPdfs = [];
  state.pdfMetadata = undefined;
  state.generatedCsv = undefined;
  state.generatedPdf = undefined;

  state.relatorio = undefined;
  state.error = undefined;
}
