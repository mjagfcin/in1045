import { Schema, model, Document } from 'mongoose';

interface IAlternativa {
  descricao: string;
  correta: boolean;
}

interface IQuestao extends Document {
  enunciado: string;
  alternativas: IAlternativa[];
  dataCriacao: Date;
  dataAtualizacao: Date;
  ativo: boolean;
}

const questaoSchema = new Schema<IQuestao>(
  {
    enunciado: {
      type: String,
      required: [true, 'Enunciado é obrigatório'],
      minlength: [10, 'Enunciado deve ter no mínimo 10 caracteres'],
      trim: true,
    },
    alternativas: {
      type: [
        {
          descricao: {
            type: String,
            required: [true, 'Descrição da alternativa é obrigatória'],
            minlength: [2, 'Descrição deve ter no mínimo 2 caracteres'],
            trim: true,
          },
          correta: {
            type: Boolean,
            required: [true, 'Indicador de alternativa correta é obrigatório'],
          },
        },
      ],
      validate: {
        validator: function (v: IAlternativa[]) {
          return v.length >= 2 && v.length <= 10;
        },
        message: 'Questão deve ter entre 2 e 10 alternativas',
      },
      required: [true, 'Alternativas são obrigatórias'],
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
  { collection: 'questoes' }
);

// Validação customizada: pelo menos uma alternativa correta
questaoSchema.pre('save', function (next) {
  const temAlternativaCorreta = this.alternativas.some((alt) => alt.correta);
  if (!temAlternativaCorreta) {
    throw new Error('Questão deve ter pelo menos uma alternativa correta');
  }
  this.dataAtualizacao = new Date();
  next();
});

// Índices
questaoSchema.index({ dataCriacao: -1 });
questaoSchema.index({ ativo: 1 });
questaoSchema.index({ enunciado: 'text' });

const Questao = model<IQuestao>('Questao', questaoSchema);

export { IQuestao, Questao };
