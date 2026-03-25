import { Schema, model, Document } from 'mongoose';

interface IRespostaQuestao {
  numeroQuestao: number;
  respostaFornecida: string; // ex: "a,b" ou "3" (somatório)
  respostaCorreta: string;
  correta: boolean;
  nota: number;
}

interface IResultadoCorrecao extends Document {
  provaId: Schema.Types.ObjectId;
  numeroProva: number; // número individual da prova
  nomeAluno: string;
  cpf: string;
  respostas: IRespostaQuestao[];
  notaFinal: number;
  percentualAcerto: number;
  modoCorrecao: 'rigoroso' | 'flexivel';
  dataCorrecao: Date;
}

const resultadoCorrecaoSchema = new Schema<IResultadoCorrecao>(
  {
    provaId: {
      type: Schema.Types.ObjectId,
      ref: 'Prova',
      required: [true, 'ID da prova é obrigatório'],
    },
    numeroProva: {
      type: Number,
      required: [true, 'Número da prova é obrigatório'],
      min: [1, 'Número da prova deve ser maior que 0'],
    },
    nomeAluno: {
      type: String,
      required: [true, 'Nome do aluno é obrigatório'],
      trim: true,
    },
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato XXX.XXX.XXX-XX'],
    },
    respostas: [
      {
        numeroQuestao: {
          type: Number,
          required: true,
        },
        respostaFornecida: {
          type: String,
          required: true,
        },
        respostaCorreta: {
          type: String,
          required: true,
        },
        correta: {
          type: Boolean,
          required: true,
        },
        nota: {
          type: Number,
          required: true,
          min: 0,
          max: 10,
        },
      },
    ],
    notaFinal: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    percentualAcerto: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    modoCorrecao: {
      type: String,
      enum: ['rigoroso', 'flexivel'],
      required: [true, 'Modo de correção é obrigatório'],
    },
    dataCorrecao: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para performance
resultadoCorrecaoSchema.index({ provaId: 1, numeroProva: 1 });
resultadoCorrecaoSchema.index({ cpf: 1 });

const ResultadoCorrecao = model<IResultadoCorrecao>('ResultadoCorrecao', resultadoCorrecaoSchema);

export default ResultadoCorrecao;
export { IResultadoCorrecao, IRespostaQuestao };