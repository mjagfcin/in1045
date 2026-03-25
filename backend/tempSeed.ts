import { connectDB } from './src/config/database';
import { Questao } from './src/models/Questao';
import { Prova } from './src/models/Prova';
import { ResultadoProva } from './src/models/ResultadoProva';

async function main() {
  await connectDB();

  const questao = await Questao.create({
    enunciado: 'Qual a capital do Brasil?',
    alternativas: [
      { descricao: 'São Paulo', correta: false },
      { descricao: 'Brasília', correta: true },
      { descricao: 'Rio de Janeiro', correta: false },
    ],
    disciplina: 'Geografia',
    professor: 'Prof. Silva',
    dificuldade: 'facil',
  });

  console.log('Questão criada', questao._id);

  const prova = await Prova.create({
    titulo: 'Prova de Geografia',
    disciplina: 'Geografia',
    professor: 'Prof. Silva',
    dataProva: new Date(),
    questoes: [{ idQuestao: questao._id, ordem: 1 }],
    esquemaAlternativas: { tipo: 'letras' },
  });

  console.log('Prova criada', prova._id);

  const resultado = await ResultadoProva.create({
    idProvaGerada: prova._id,
    idProva: prova._id.toString(),
    numeroProva: '001',
    aluno: { nome: 'Aluno Teste', cpf: '123.456.789-10' },
    respostas: { questao_1: 'B' },
    gabarito: { questao_1: 'B' },
    analise: {
      questao_1: {
        correta: true,
        respostaFornecida: 'B',
        gabaritoEsperado: 'B',
        detalhes: 'Acerto completo',
      },
    },
    modoCorrecao: 'rigoroso',
    notaPorQuestao: { questao_1: 10 },
    notaFinal: 10,
    percentualAcerto: 100,
    dataCorrecao: new Date(),
  });

  console.log('Resultado de correção criado', resultado._id);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});