import { Schema, model, Document, Types } from 'mongoose';

interface IEstatisticas {
  totalAlunos: number;
  mediaNota: number;
  desviaoPadrao: number;
  notaMaxima: number;
  notaMinima: number;
  percentualAprovacao: number;
}

interface IRelatorio extends Document {
  idProva: Types.ObjectId;
  titulo: string;
  dataGeracao: Date;
  resultados: Types.ObjectId[];
  estatisticas: IEstatisticas;
  formato: 'csv' | 'pdf';
  caminhoArquivo?: string;
}

const relatorioSchema = new Schema<IRelatorio>(
  {
    idProva: {
      type: Schema.Types.ObjectId,
      ref: 'Prova',
      required: [true, 'ID da prova é obrigatório'],
    },
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    dataGeracao: {
      type: Date,
      default: Date.now,
    },
    resultados: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ResultadoProva',
      },
    ],
    estatisticas: {
      totalAlunos: {
        type: Number,
        required: true,
      },
      mediaNota: {
        type: Number,
        required: true,
      },
      desviaoPadrao: {
        type: Number,
        required: true,
      },
      notaMaxima: {
        type: Number,
        required: true,
      },
      notaMinima: {
        type: Number,
        required: true,
      },
      percentualAprovacao: {
        type: Number,
        required: true,
      },
    },
    formato: {
      type: String,
      enum: ['csv', 'pdf'],
      required: [true, 'Formato é obrigatório'],
    },
    caminhoArquivo: {
      type: String,
    },
  },
  { collection: 'relatorios' }
);

// Índices
relatorioSchema.index({ idProva: 1 });
relatorioSchema.index({ dataGeracao: -1 });

const Relatorio = model<IRelatorio>('Relatorio', relatorioSchema);

export { IRelatorio, IEstatisticas, Relatorio };
