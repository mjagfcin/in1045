import { Schema, model, Document, Types } from 'mongoose';

interface IAluno {
  nome: string;
  cpf: string;
}

interface IAnaliseQuestao {
  correta: boolean;
  respostaFornecida: string;
  gabaritoEsperado: string;
  detalhes: string;
}

interface IResultadoProva extends Document {
  idProvaGerada: Types.ObjectId;
  idProva: Types.ObjectId;
  numeroProva: string;
  aluno: IAluno;
  respostas: { [key: string]: string };
  gabarito: { [key: string]: string };
  analise: { [key: string]: IAnaliseQuestao };
  modoCorrecao: 'rigoroso' | 'flexivel';
  notaPorQuestao: { [key: string]: number };
  notaFinal: number;
  percentualAcerto: number;
  dataCorrecao: Date;
  observacoes?: string;
}

const resultadoProvaSchema = new Schema<IResultadoProva>(
  {
    idProvaGerada: {
      type: Schema.Types.ObjectId,
      ref: 'ProvaGerada',
      required: [true, 'ID da prova gerada é obrigatório'],
    },
    idProva: {
      type: Schema.Types.ObjectId,
      ref: 'Prova',
      required: [true, 'ID da prova é obrigatório'],
    },
    numeroProva: {
      type: String,
      required: [true, 'Número da prova é obrigatório'],
    },
    aluno: {
      nome: {
        type: String,
        required: [true, 'Nome do aluno é obrigatório'],
        trim: true,
      },
      cpf: {
        type: String,
        required: [true, 'CPF é obrigatório'],
        validate: {
          validator: function (v: string) {
            return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
          },
          message: 'CPF deve estar no formato XXX.XXX.XXX-XX',
        },
      },
    },
    respostas: {
      type: Schema.Types.Mixed,
      required: [true, 'Respostas são obrigatórias'],
    },
    gabarito: {
      type: Schema.Types.Mixed,
      required: [true, 'Gabarito é obrigatório'],
    },
    analise: {
      type: Schema.Types.Mixed,
      required: [true, 'Análise é obrigatória'],
    },
    modoCorrecao: {
      type: String,
      enum: ['rigoroso', 'flexivel'],
      required: [true, 'Modo de correção é obrigatório'],
    },
    notaPorQuestao: {
      type: Schema.Types.Mixed,
      required: [true, 'Notas por questão são obrigatórias'],
    },
    notaFinal: {
      type: Number,
      required: [true, 'Nota final é obrigatória'],
      min: 0,
      max: 10,
    },
    percentualAcerto: {
      type: Number,
      required: [true, 'Percentual de acerto é obrigatório'],
      min: 0,
      max: 100,
    },
    dataCorrecao: {
      type: Date,
      default: Date.now,
    },
    observacoes: {
      type: String,
      trim: true,
    },
  },
  { collection: 'resultados_provas' }
);

// Índices
resultadoProvaSchema.index({ idProva: 1 });
resultadoProvaSchema.index({ numeroProva: 1 });
resultadoProvaSchema.index({ 'aluno.cpf': 1 });
resultadoProvaSchema.index({ dataCorrecao: -1 });

const ResultadoProva = model<IResultadoProva>('ResultadoProva', resultadoProvaSchema);

export { IResultadoProva, IAluno, IAnaliseQuestao, ResultadoProva };
