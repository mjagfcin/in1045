import { Before, Then } from '@cucumber/cucumber';
import { resetState, state } from './support/state';

Before(() => {
  resetState();
});

Then('devo receber um erro', () => {
  if (!state.error) {
    throw new Error('Esperava erro, mas nenhum erro foi registrado');
  }
});

Then('devo receber um erro de validação', () => {
  if (!state.error) {
    throw new Error('Esperava erro de validação, mas nenhum erro foi registrado');
  }
});

Then('a mensagem deve indicar que é necessário uma alternativa correta', () => {
  if (!state.error?.includes('alternativa correta')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar que o mínimo é 2 alternativas', () => {
  if (!state.error?.includes('mínimo é 2 alternativas')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar que é necessário pelo menos 1 questão', () => {
  if (!state.error?.includes('pelo menos 1 questão')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar CPF em formato inválido', () => {
  if (!state.error?.includes('CPF em formato inválido')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar que {string} é obrigatório', (campo: string) => {
  if (!state.error?.includes(`${campo} é obrigatório`)) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar que o mínimo é 1 PDF', () => {
  if (!state.error?.includes('mínimo é 1 PDF')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('a mensagem deve indicar que o máximo é 1000 PDFs', () => {
  if (!state.error?.includes('máximo é 1000 PDFs')) {
    throw new Error(`Mensagem inesperada: ${state.error}`);
  }
});

Then('não deve aparecer mais nas listagens', () => {
  const hasInactiveQuestion = state.questions.some((q) => !q.ativo && state.filteredQuestions.some((f) => f.id === q.id));
  const hasInactiveProva = state.provas.some((p) => !p.ativo && state.filteredProvas.some((f) => f.id === p.id));

  if (hasInactiveQuestion || hasInactiveProva) {
    throw new Error('Item inativo ainda aparece em listagem');
  }
});

Then('um arquivo CSV deve ser criado', () => {
  if (!state.generatedCsv) {
    throw new Error('CSV não foi gerado');
  }
});

Then('um arquivo PDF deve ser criado', () => {
  if (!state.generatedPdf) {
    throw new Error('PDF não foi gerado');
  }
});
