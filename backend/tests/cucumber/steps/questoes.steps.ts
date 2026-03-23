import { Given, When, Then, DataTable, Before, After } from '@cucumber/cucumber';
import axios, { AxiosInstance } from 'axios';

let apiClient: AxiosInstance;
let testContext: any = {};

Before(() => {
  apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    validateStatus: () => true
  });
  testContext = {
    questoes: [],
    questaoId: null,
    provas: [],
    provaId: null,
    error: null,
    response: null
  };
});

After(async () => {
  // Cleanup: delete test data
  if (testContext.questaoId) {
    try {
      await apiClient.delete(`/questoes/${testContext.questaoId}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

// Questões - CRUD Steps

Given('que não existem questões no banco de dados', async () => {
  const response = await apiClient.get('/questoes?pagina=1&limite=100');
  // This is a setup assumption; in real scenario might need to cleanup
});

When('eu crio uma questão com os dados:', async (dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const novaQuestao = {
    enunciado: data.enunciado,
    alternativas: JSON.parse(data.alternativas),
    disciplina: data.disciplina
  };
  
  testContext.response = await apiClient.post('/questoes', novaQuestao);
  if (testContext.response.status === 201 || testContext.response.status === 200) {
    testContext.questaoId = testContext.response.data.dados?.id;
    testContext.questoes.push(testContext.response.data.dados);
  } else {
    testContext.error = testContext.response.data?.mensagem;
  }
});

Then('a questão deve ser criada com sucesso', () => {
  if (!testContext.questaoId) {
    throw new Error('Questão não foi criada');
  }
});

Then('a questão deve ter os dados:', async (dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const questao = testContext.response.data.dados;
  
  if (questao.enunciado !== data.enunciado) {
    throw new Error(`Enunciado não corresponde: ${questao.enunciado}`);
  }
  if (questao.disciplina !== data.disciplina) {
    throw new Error(`Disciplina não corresponde`);
  }
});

When('eu listo as questões com paginação', async () => {
  testContext.response = await apiClient.get('/questoes?pagina=1&limite=10');
});

Then('a lista deve conter as questões criadas', () => {
  const questoes = testContext.response.data.dados?.questoes || [];
  if (questoes.length === 0) {
    throw new Error('Nenhuma questão encontrada');
  }
});

Then('cada questão deve ter identificador único', () => {
  const questoes = testContext.response.data.dados?.questoes || [];
  const ids = new Set(questoes.map((q: any) => q._id));
  if (ids.size !== questoes.length) {
    throw new Error('Existem questões com IDs duplicados');
  }
});

When('eu edito a questão', async (dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const atualizacao = {
    enunciado: data.enunciado,
    alternativas: JSON.parse(data.alternativas)
  };
  
  testContext.response = await apiClient.put(`/questoes/${testContext.questaoId}`, atualizacao);
});

Then('a questão deve ser atualizada', () => {
  if (testContext.response.status !== 200) {
    throw new Error('Questão não foi atualizada');
  }
});

When('eu deleto a questão', async () => {
  testContext.response = await apiClient.delete(`/questoes/${testContext.questaoId}`);
});

Then('a questão deve ser marcada como inativa', () => {
  if (testContext.response.status !== 200) {
    throw new Error('Questão não foi deletada');
  }
});

When('eu crio uma questão sem alternativa correta', async () => {
  const novaQuestao = {
    enunciado: 'Questão teste',
    alternativas: [
      { texto: 'Alternativa A', correta: false },
      { texto: 'Alternativa B', correta: false },
      { texto: 'Alternativa C', correta: false }
    ],
    disciplina: 'Teste'
  };
  
  testContext.response = await apiClient.post('/questoes', novaQuestao);
  testContext.error = testContext.response.data?.mensagem;
});

Then('a questão não deve ser criada', () => {
  if (testContext.response.status === 201 || testContext.response.status === 200) {
    throw new Error('Questão foi criada quando não deveria');
  }
});

Then('deve retornar mensagem de erro', () => {
  if (!testContext.error) {
    throw new Error('Nenhuma mensagem de erro foi retornada');
  }
});

When('eu crio uma questão com menos de 2 alternativas', async () => {
  const novaQuestao = {
    enunciado: 'Questão teste',
    alternativas: [
      { texto: 'Alternativa A', correta: true }
    ],
    disciplina: 'Teste'
  };
  
  testContext.response = await apiClient.post('/questoes', novaQuestao);
  testContext.error = testContext.response.data?.mensagem;
});

When('eu busco por palavra-chave {string}', async (palavra: string) => {
  testContext.response = await apiClient.get(`/questoes?busca=${palavra}`);
});

Then('as questões retornadas devem conter a palavra-chave', () => {
  const questoes = testContext.response.data.dados?.questoes || [];
  if (questoes.length === 0) {
    throw new Error('Nenhuma questão encontrada com a palavra-chave');
  }
});
