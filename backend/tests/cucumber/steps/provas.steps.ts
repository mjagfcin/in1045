import { When, Then, DataTable, Before, After } from '@cucumber/cucumber';
import axios, { AxiosInstance } from 'axios';

let apiClient: AxiosInstance;
let testContext: any = {};

Before(() => {
  apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    validateStatus: () => true
  });
  testContext = {
    provas: [],
    provaId: null,
    questoes: [],
    error: null,
    response: null
  };
});

After(async () => {
  if (testContext.provaId) {
    try {
      await apiClient.delete(`/provas/${testContext.provaId}`);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

// Provas - CRUD Steps

When('eu crio uma prova com os dados:', async (dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const novaProva = {
    titulo: data.titulo,
    disciplina: data.disciplina,
    professor: data.professor,
    dataProva: data.dataProva,
    questoesIds: JSON.parse(data.questoesIds || '[]'),
    escolhaAlternativas: { tipo: data.tipo || 'letras' }
  };
  
  testContext.response = await apiClient.post('/provas', novaProva);
  if (testContext.response.status === 201 || testContext.response.status === 200) {
    testContext.provaId = testContext.response.data.dados?.id;
    testContext.provas.push(testContext.response.data.dados);
  } else {
    testContext.error = testContext.response.data?.mensagem;
  }
});

Then('a prova deve ser criada com sucesso', () => {
  if (!testContext.provaId) {
    throw new Error('Prova não foi criada');
  }
});

Then('a prova deve usar o esquema {string}', (esquema: string) => {
  const prova = testContext.response.data.dados;
  if (prova.escolhaAlternativas.tipo !== esquema) {
    throw new Error(`Esquema incorreto: ${prova.escolhaAlternativas.tipo}`);
  }
});

When('eu listo as provas', async () => {
  testContext.response = await apiClient.get('/provas?pagina=1&limite=10');
});

Then('a lista deve conter as provas criadas', () => {
  const provas = testContext.response.data.dados?.provas || [];
  if (provas.length === 0) {
    throw new Error('Nenhuma prova encontrada');
  }
});

When('eu edito a prova com dados:', async (dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const atualizacao = {
    titulo: data.titulo,
    disciplina: data.disciplina,
    professor: data.professor,
    dataProva: data.dataProva
  };
  
  testContext.response = await apiClient.put(`/provas/${testContext.provaId}`, atualizacao);
});

Then('a prova deve ser atualizada', () => {
  if (testContext.response.status !== 200) {
    throw new Error('Prova não foi atualizada');
  }
});

When('eu deleto a prova', async () => {
  testContext.response = await apiClient.delete(`/provas/${testContext.provaId}`);
});

Then('a prova deve ser marcada como inativa', () => {
  if (testContext.response.status !== 200) {
    throw new Error('Prova não foi deletada');
  }
});

When('eu filtro as provas por disciplina {string}', async (disciplina: string) => {
  testContext.response = await apiClient.get(`/provas?disciplina=${disciplina}`);
});

Then('as provas devem ser da disciplina {string}', (disciplina: string) => {
  const provas = testContext.response.data.dados?.provas || [];
  const todasCorretas = provas.every((p: any) => p.disciplina === disciplina);
  if (!todasCorretas) {
    throw new Error('Nem todas as provas são da disciplina esperada');
  }
});

When('eu crio uma prova sem questões', async () => {
  const novaProva = {
    titulo: 'Prova sem questões',
    disciplina: 'Teste',
    professor: 'Prof Teste',
    dataProva: new Date().toISOString(),
    questoesIds: [],
    escolhaAlternativas: { tipo: 'letras' }
  };
  
  testContext.response = await apiClient.post('/provas', novaProva);
  testContext.error = testContext.response.data?.mensagem;
});

Then('a prova não deve ser criada', () => {
  if (testContext.response.status === 201 || testContext.response.status === 200) {
    throw new Error('Prova foi criada quando não deveria');
  }
});
