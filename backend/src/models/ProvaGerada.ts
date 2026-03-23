import { Schema, model, Document, Types } from 'mongoose';

interface IAlternativaOrdenada {
  idAlternativa: Types.ObjectId;
  identificador: string;
}

interface IQuestaoOrdenada {
  idQuestao: Types.ObjectId;
  posicao: number;
  alternativasOrdenadas: IAlternativaOrdenada[];
}

interface IGabarito {
  [key: string]: string; // questao_1: "a", questao_2: "bc", etc
}

interface IProvaGerada extends Document {
  idProva: Types.ObjectId;
  numeroSequencial: number;
  numeroIdentificador: string;
  questoesOrdenadas: IQuestaoOrdenada[];
  gabarito: IGabarito;
  arquivoPDF?: string;
  dataCriacao: Date;
  ativo: boolean;
}

const provaGeradaSchema = new Schema<IProvaGerada>(
  {
    idProva: {
      type: Schema.Types.ObjectId,
      ref: 'Prova',
      required: [true, 'ID da prova é obrigatório'],
    },
    numeroSequencial: {
      type: Number,
      required: [true, 'Número sequencial é obrigatório'],
    },
    numeroIdentificador: {
      type: String,
      required: [true, 'Número identificador é obrigatório'],
      unique: true,
    },
    questoesOrdenadas: {
      type: [
        {
          idQuestao: {
            type: Schema.Types.ObjectId,
            ref: 'Questao',
            required: true,
          },
          posicao: {
            type: Number,
            required: true,
          },
          alternativasOrdenadas: [
            {
              idAlternativa: {
                type: Schema.Types.ObjectId,
                required: true,
              },
              identificador: {
                type: String,
                required: true,
              },
            },
          ],
        },
      ],
      required: true,
    },
    gabarito: {
      type: Schema.Types.Mixed,
      required: [true, 'Gabarito é obrigatório'],
    },
    arquivoPDF: {
      type: String,
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { collection: 'provas_geradas' }
);

// Índices
provaGeradaSchema.index({ idProva: 1, numeroSequencial: 1 }, { unique: true });
provaGeradaSchema.index({ numeroIdentificador: 1 }, { unique: true });
provaGeradaSchema.index({ dataCriacao: -1 });

const ProvaGerada = model<IProvaGerada>('ProvaGerada', provaGeradaSchema);

export { IProvaGerada, IQuestaoOrdenada, IAlternativaOrdenada, IGabarito, ProvaGerada };
