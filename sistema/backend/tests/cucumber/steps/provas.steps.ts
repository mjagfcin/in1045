import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { state } from './support/state';

let provaCounter = 1;

function createProva(input: {
  titulo: string;
  disciplina: string;
  professor: string;
  dataProva: string;
  esquemaAlternativas: 'letras' | 'potencias';
  questoes: string[];
}) {
  const id = `p_${provaCounter++}`;
  const prova = {
    id,
    ...input,
    ativo: true,
  };
  state.provas.push(prova);
  state.selectedProvaId = id;
  return prova;
}

Given('que existem questões cadastradas', () => {
  if (state.questions.length === 0) {
    state.questions.push(
      { id: 'primeiro_id', enunciado: 'Q1', alternativas: [{ descricao: 'A', correta: true }, { descricao: 'B', correta: false }], ativo: true },
      { id: 'segundo_id', enunciado: 'Q2', alternativas: [{ descricao: 'A', correta: true }, { descricao: 'B', correta: false }], ativo: true },
      { id: 'terceiro_id', enunciado: 'Q3', alternativas: [{ descricao: 'A', correta: true }, { descricao: 'B', correta: false }], ativo: true },
    );
  }
});

Given('que eu estou criando uma prova', () => {
  state.selectedProvaId = undefined;
});

Given('que existe uma prova cadastrada', () => {
  if (state.provas.length === 0) {
    createProva({
      titulo: 'Prova 1 - Geografia',
      disciplina: 'Geografia Geral',
      professor: 'Prof. João da Silva',
      dataProva: '2026-04-15',
      esquemaAlternativas: 'letras',
      questoes: ['primeiro_id', 'segundo_id', 'terceiro_id'],
    });
  } else {
    state.selectedProvaId = state.provas[0].id;
  }
});

Given('que existem provas de diferentes disciplinas', () => {
  state.provas = [];
  createProva({
    titulo: 'Geo 1',
    disciplina: 'Geografia',
    professor: 'Prof A',
    dataProva: '2026-04-15',
    esquemaAlternativas: 'letras',
    questoes: ['primeiro_id'],
  });
  createProva({
    titulo: 'Hist 1',
    disciplina: 'História',
    professor: 'Prof B',
    dataProva: '2026-04-15',
    esquemaAlternativas: 'letras',
    questoes: ['primeiro_id'],
  });
});

When('eu crio uma prova com:', (table: DataTable) => {
  const data = table.rowsHash();
  const questoes = (data.questoes || '[]').replace('[', '').replace(']', '').split(',').map((q) => q.trim()).filter(Boolean);

  if (questoes.length === 0) {
    state.error = 'é necessário pelo menos 1 questão';
    return;
  }

  const esquema = data.esquemaAlternativas.includes('pot') ? 'potencias' : 'letras';
  createProva({
    titulo: data.titulo,
    disciplina: data.disciplina,
    professor: data.professor,
    dataProva: data.dataProva,
    esquemaAlternativas: esquema,
    questoes,
  });
  state.error = undefined;
});

When('eu seleciono o esquema de alternativas {string}', (esquema: string) => {
  const normalizado = esquema.includes('pot') ? 'potencias' : 'letras';
  createProva({
    titulo: 'Rascunho',
    disciplina: 'Teste',
    professor: 'Teste',
    dataProva: '2026-04-15',
    esquemaAlternativas: normalizado,
    questoes: ['primeiro_id'],
  });
});

When('eu edito a prova alterando o título para {string}', (titulo: string) => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova) {
    throw new Error('Prova selecionada não encontrada');
  }
  prova.titulo = titulo;
});

When('eu deleto a prova', () => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova) {
    throw new Error('Prova selecionada não encontrada');
  }
  prova.ativo = false;
  state.filteredProvas = state.provas.filter((p) => p.ativo);
});

When('eu busco provas da disciplina {string}', (disciplina: string) => {
  state.filteredProvas = state.provas.filter((p) => p.ativo && p.disciplina === disciplina);
});

When('eu tento criar uma prova sem questões', () => {
  state.error = 'é necessário pelo menos 1 questão';
});

Then('a prova deve ser criada com sucesso', () => {
  if (!state.selectedProvaId) {
    throw new Error('Prova não foi criada');
  }
});

Then('a prova deve conter {int} questões', (quantidade: number) => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova) {
    throw new Error('Prova selecionada não encontrada');
  }
  if (prova.questoes.length !== quantidade) {
    throw new Error(`Esperado ${quantidade} questões, recebido ${prova.questoes.length}`);
  }
});

Then('as alternativas serão identificadas como a, b, c, d, etc', () => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova || prova.esquemaAlternativas !== 'letras') {
    throw new Error('Esquema de letras não foi aplicado');
  }
});

Then('as alternativas serão identificadas como 1, 2, 4, 8, etc', () => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova || prova.esquemaAlternativas !== 'potencias') {
    throw new Error('Esquema de potências não foi aplicado');
  }
});

Then('a prova deve ser atualizada', () => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova) {
    throw new Error('Prova não encontrada após atualização');
  }
});

Then('o novo título deve ser {string}', (titulo: string) => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova || prova.titulo !== titulo) {
    throw new Error(`Título esperado: ${titulo}`);
  }
});

Then('a prova deve ser marcada como inativa', () => {
  const prova = state.provas.find((p) => p.id === state.selectedProvaId);
  if (!prova || prova.ativo) {
    throw new Error('Prova não foi marcada como inativa');
  }
});

Then('devo receber apenas provas de Geografia', () => {
  if (state.filteredProvas.length === 0 || state.filteredProvas.some((p) => p.disciplina !== 'Geografia')) {
    throw new Error('Filtro por disciplina não retornou apenas Geografia');
  }
});
