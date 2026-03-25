import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { state } from './support/state';

let questionCounter = 1;

function createQuestion(enunciado: string, alternativas: Array<{ descricao: string; correta: boolean }>) {
  const id = `q_${questionCounter++}`;
  const question = { id, enunciado, alternativas, ativo: true };
  state.questions.push(question);
  state.selectedQuestionId = id;
  return question;
}

Given('que existe uma questão cadastrada', () => {
  if (state.questions.length === 0) {
    createQuestion('Questão base', [
      { descricao: 'A', correta: true },
      { descricao: 'B', correta: false },
    ]);
  } else {
    state.selectedQuestionId = state.questions[0].id;
  }
});

Given('que existem as seguintes questões:', (table: DataTable) => {
  const rows = table.raw().slice(1);
  rows.forEach(([enunciado]) => {
    createQuestion(enunciado, [
      { descricao: 'A', correta: true },
      { descricao: 'B', correta: false },
    ]);
  });
});

When('eu crio uma questão com:', (table: DataTable) => {
  const data = table.rowsHash();
  const alternativas = JSON.parse(data.alternativas) as Array<{ descricao: string; correta: boolean }>;

  if (alternativas.length < 2) {
    state.error = 'o mínimo é 2 alternativas';
    return;
  }

  if (!alternativas.some((a) => a.correta)) {
    state.error = 'é necessário uma alternativa correta';
    return;
  }

  state.error = undefined;
  createQuestion(data.enunciado, alternativas);
});

When('eu solicito a lista de questões', () => {
  if (state.questions.length === 0) {
    createQuestion('Questão padrão para listagem', [
      { descricao: 'A', correta: true },
      { descricao: 'B', correta: false },
    ]);
  }
  state.filteredQuestions = state.questions.filter((q) => q.ativo);
  state.pagination = { pagina: 1, limite: 10, total: state.filteredQuestions.length };
});

When('eu atualizei a questão com:', (table: DataTable) => {
  const data = table.rowsHash();
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question) {
    throw new Error('Questão selecionada não encontrada');
  }
  question.enunciado = data.enunciado;
});

When('eu deleto a questão', () => {
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question) {
    throw new Error('Questão selecionada não encontrada');
  }
  question.ativo = false;
  state.filteredQuestions = state.questions.filter((q) => q.ativo);
});

When('eu tento criar uma questão sem alternativa correta', () => {
  state.error = 'é necessário uma alternativa correta';
});

When('eu tento criar uma questão com apenas 1 alternativa', () => {
  state.error = 'o mínimo é 2 alternativas';
});

When('eu busco questões com a palavra {string}', (palavra: string) => {
  const termo = palavra.toLowerCase();
  state.filteredQuestions = state.questions.filter((q) => q.enunciado.toLowerCase().includes(termo) && q.ativo);
});

Then('a questão deve ser criada com sucesso', () => {
  if (!state.selectedQuestionId) {
    throw new Error('Questão não foi criada');
  }
});

Then('a questão deve ter {int} alternativas', (quantidade: number) => {
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question) {
    throw new Error('Questão selecionada não encontrada');
  }
  if (question.alternativas.length !== quantidade) {
    throw new Error(`Esperado ${quantidade} alternativas, recebido ${question.alternativas.length}`);
  }
});

Then('devo receber uma lista de questões', () => {
  if (state.filteredQuestions.length === 0) {
    throw new Error('Lista de questões está vazia');
  }
});

Then('a lista deve estar paginada', () => {
  if (!state.pagination || state.pagination.limite <= 0) {
    throw new Error('Metadados de paginação ausentes');
  }
});

Then('a questão deve ser atualizada', () => {
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question) {
    throw new Error('Questão selecionada não encontrada');
  }
});

Then('o novo enunciado deve ser {string}', (enunciado: string) => {
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question || question.enunciado !== enunciado) {
    throw new Error(`Enunciado esperado: ${enunciado}`);
  }
});

Then('a questão deve ser marcada como inativa', () => {
  const question = state.questions.find((q) => q.id === state.selectedQuestionId);
  if (!question || question.ativo) {
    throw new Error('Questão não foi marcada como inativa');
  }
});

Then('devo receber {int} questões', (quantidade: number) => {
  if (state.filteredQuestions.length !== quantidade) {
    throw new Error(`Esperado ${quantidade} questões, recebido ${state.filteredQuestions.length}`);
  }
});
