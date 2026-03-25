import { Schema, model, Document, Types } from 'mongoose';

interface IQuestaoProva {
  idQuestao: Types.ObjectId;
  ordem: number;
}

interface IEsquemaAlternativas {
  tipo: 'letras' | 'potencias';
}

interface IProva extends Document {
  titulo: string;
  disciplina: string;
  professor: string;
  dataProva: Date;
  questoes: IQuestaoProva[];
  esquemaAlternativas: IEsquemaAlternativas;
  dataCriacao: Date;
  dataAtualizacao: Date;
  ativo: boolean;
}

const provaSchema = new Schema<IProva>(
  {
    titulo: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    disciplina: {
      type: String,
      required: [true, 'Disciplina é obrigatória'],
      trim: true,
    },
    professor: {
      type: String,
      required: [true, 'Professor é obrigatório'],
      trim: true,
    },
    dataProva: {
      type: Date,
      required: [true, 'Data da prova é obrigatória'],
    },
    questoes: {
      type: [
        {
          idQuestao: {
            type: Schema.Types.ObjectId,
            ref: 'Questao',
            required: [true, 'ID da questão é obrigatório'],
          },
          ordem: {
            type: Number,
            required: [true, 'Ordem é obrigatória'],
          },
        },
      ],
      validate: {
        validator: function (v: IQuestaoProva[]) {
          return v.length > 0;
        },
        message: 'Prova deve ter pelo menos uma questão',
      },
      required: [true, 'Questões são obrigatórias'],
    },
    esquemaAlternativas: {
      type: {
        tipo: {
          type: String,
          enum: ['letras', 'potencias'],
          required: [true, 'Tipo de esquema é obrigatório'],
        },
      },
      required: [true, 'Esquema de alternativas é obrigatório'],
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { collection: 'provas' }
);

// Update dataAtualizacao antes de salvar
provaSchema.pre('save', function (next) {
  this.dataAtualizacao = new Date();
  next();
});

// Índices
provaSchema.index({ dataCriacao: -1 });
provaSchema.index({ ativo: 1 });
provaSchema.index({ disciplina: 1 });
provaSchema.index({ professor: 1 });

const Prova = model<IProva>('Prova', provaSchema);

export { IProva, IQuestaoProva, IEsquemaAlternativas, Prova };
