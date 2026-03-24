// Tipos TypeScript para a aplicação

export interface IAlternativa {
  descricao: string;
  correta: boolean;
}

export interface IQuestao {
  _id?: string;
  enunciado: string;
  alternativas: IAlternativa[];
  disciplina: string;
  professor: string;
  dificuldade?: 'facil' | 'media' | 'dificil';
  dataCriacao?: string;
}

export interface IQuestaoProva {
  idQuestao: string;
  ordem?: number;
}

export interface IProva {
  _id?: string;
  titulo: string;
  disciplina: string;
  professor: string;
  dataProva: string;
  questoes: IQuestaoProva[];
  esquemaAlternativas: {
    tipo: 'letras' | 'potencias';
  };
  dataCriacao?: string;
}

export interface IPaginacao {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface IResponseAPI<T> {
  sucesso: boolean;
  dados: T;
  mensagem?: string;
  paginacao?: IPaginacao;
}

export interface IResponseListaAPI<T> {
  sucesso: boolean;
  dados: T[];
  mensagem?: string;
  paginacao: IPaginacao;
}

export interface IProvaGerada {
  _id: string;
  idProva: string;
  numeroSequencial: number;
  numeroIdentificador: string;
  arquivoPDF?: string;
  dataCriacao: string;
}

export interface IResultadoProva {
  _id: string;
  idProvaGerada: string;
  idAluno: string;
  nomeAluno: string;
  respostas: { [key: string]: string };
  nota: number;
  dataCriacao: string;
}

export interface IRelatorio {
  _id: string;
  idProva: string;
  media: number;
  desviopadrao: number;
  maximo: number;
  minimo: number;
  taxaAprovacao: number;
  dataCriacao: string;
}
