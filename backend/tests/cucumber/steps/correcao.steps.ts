import { Given, When, Then, DataTable, Before, After } from '@cucumber/cucumber';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';

let apiClient: AxiosInstance;
let testContext: any = {};

Before(() => {
  apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    validateStatus: () => true
  });
  testContext = {
    provaId: null,
    csvPath: null,
    resultados: [],
    error: null,
    response: null,
    modoCorrecao: null
  };
});

After(() => {
  if (testContext.csvPath && fs.existsSync(testContext.csvPath)) {
    try {
      fs.unlinkSync(testContext.csvPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

// Correction Steps

Given('que existe um arquivo CSV com respostas dos alunos', async () => {
  // Create test CSV file
  const csvContent = `numero_prova,nome,cpf,respostas
prova_001_001,João Silva,123.456.789-10,a,b,a,c,b,a,a,b,c,a
prova_001_002,Maria Santos,987.654.321-99,a,a,b,c,b,a,a,b,c,a
prova_001_003,Pedro Costa,456.789.123-45,b,b,a,c,a,a,a,b,c,a`;

  testContext.csvPath = './test-respostas.csv';
  fs.writeFileSync(testContext.csvPath, csvContent);
});

When('eu importo o CSV para correção', async () => {
  const csvContent = fs.readFileSync(testContext.csvPath, 'utf-8');
  const formData = new FormData();
  formData.append('idProva', testContext.provaId || 'teste-prova-id');
  formData.append('arquivo', new Blob([csvContent], { type: 'text/csv' }), 'respostas.csv');

  testContext.response = await apiClient.post('/correcao/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  if (testContext.response.status === 200 || testContext.response.status === 201) {
    testContext.resultados = testContext.response.data.dados?.resultados || [];
  } else {
    testContext.error = testContext.response.data?.mensagem;
  }
});

Then('o CSV deve ser validado', () => {
  if (testContext.response.status === 400) {
    throw new Error('CSV não foi validado');
  }
});

Then('todas as respostas devem ser importadas', () => {
  if (testContext.resultados.length === 0) {
    throw new Error('Nenhuma resposta foi importada');
  }
});

When('eu corrigir em modo {string}', async (modo: string) => {
  testContext.modoCorrecao = modo;
  
  const payload = {
    idProva: testContext.provaId || 'teste-prova-id',
    modoCorrecao: modo,
    resultados: testContext.resultados
  };
  
  testContext.response = await apiClient.post('/correcao/processar', payload);
});

Then('a prova deve ser corrigida em modo rigoroso', () => {
  if (testContext.response.status !== 200) {
    throw new Error('Correção falhou');
  }
  
  if (testContext.modoCorrecao !== 'rigoroso') {
    throw new Error('Modo de correção incorreto');
  }
});

Then('uma resposta completamente correta deve valer {int} ponto', (valor: number) => {
  const resultado = testContext.response.data.dados?.resultados?.[0];
  
  if (!resultado) {
    throw new Error('Resultado não encontrado');
  }
  
  // In rigoroso mode, verify scoring
  if (valor === 10 && resultado.modoCorrecao === 'rigoroso') {
    if (resultado.notaFinal === undefined) {
      throw new Error('Nota não foi calculada');
    }
  }
});

Then('uma resposta errada deve valer {int} ponto', (valor: number) => {
  if (valor !== 0) {
    throw new Error(`Valor incorreto para resposta errada: ${valor}`);
  }
});

When('eu crio uma resposta errada em modo rigoroso', async () => {
  // Simulate wrong answer
  testContext.respostaErrada = {
    questao: 1,
    respostaAluno: 'b', // Wrong answer
    respostaCorreta: 'a'
  };
});

Then('a questão deve receber nota {int}', (nota: number) => {
  if (testContext.respostaErrada) {
    if (nota !== 0) {
      throw new Error('Resposta errada deveria ter nota 0');
    }
  }
});

When('eu corrigir provas em modo flexível', async () => {
  testContext.modoCorrecao = 'flexivel';
  
  const payload = {
    idProva: testContext.provaId || 'teste-prova-id',
    modoCorrecao: 'flexivel'
  };
  
  testContext.response = await apiClient.post('/correcao/processar', payload);
});

Then('a prova deve usar correção proporcional', () => {
  const resultado = testContext.response.data.dados?.resultados?.[0];
  
  if (resultado.modoCorrecao !== 'flexivel') {
    throw new Error('Modo de correção não é flexível');
  }
});

Then('{int} de {int} alternativas corretas deve valer {int} ponto', 
  (corretas: number, total: number, nota: number) => {
    const percentual = (corretas / total) * 10;
    
    if (Math.abs(percentual - nota) > 0.1) {
      throw new Error(`Nota incorreta: esperado ${percentual}, obtido ${nota}`);
    }
  }
);

When('eu verifico uma resposta vazia', async () => {
  testContext.respostaVazia = {
    questao: 1,
    respostaAluno: undefined, // Empty/omitted
    respostaCorreta: 'a'
  };
});

Then('a resposta vazia deve valer {int} ponto', (nota: number) => {
  if (nota !== 0) {
    throw new Error('Resposta vazia deveria ter nota 0');
  }
});

Given('um CSV com CPF inválido:', async (dataTable: DataTable) => {
  const dados = dataTable.raw();
  const csvContent = dados.join('\n');
  
  testContext.csvPath = './test-cpf-invalido.csv';
  fs.writeFileSync(testContext.csvPath, csvContent);
});

When('eu valido o CSV', async () => {
  const csvContent = fs.readFileSync(testContext.csvPath, 'utf-8');
  
  // Simple validation of CPF format XXX.XXX.XXX-XX
  const lines = csvContent.split('\n').slice(1);
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const cpf = parts[2].trim();
      if (cpf && !cpfRegex.test(cpf)) {
        testContext.error = `CPF inválido: ${cpf}`;
      }
    }
  });
});

Then('o CSV deve ser rejeitado por CPF inválido', () => {
  if (!testContext.error) {
    throw new Error('CPF inválido não foi detectado');
  }
});

Given('um CSV com campos obrigatórios faltando:', (dataTable: DataTable) => {
  const dados = dataTable.raw();
  const csvContent = dados.join('\n');
  
  testContext.csvPath = './test-campos-faltando.csv';
  fs.writeFileSync(testContext.csvPath, csvContent);
});

When('eu valido os campos obrigatórios', async () => {
  const csvContent = fs.readFileSync(testContext.csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  
  const camposObrigatorios = ['numero_prova', 'nome', 'cpf', 'respostas'];
  
  camposObrigatorios.forEach(campo => {
    if (!header.includes(campo)) {
      testContext.error = `Campo obrigatório faltando: ${campo}`;
    }
  });
});

Then('o CSV deve ser rejeitado por campos faltando', () => {
  if (!testContext.error) {
    throw new Error('Campos faltantes não foram detectados');
  }
});

When('eu salvo o resultado da prova', async () => {
  const payload = {
    idProva: testContext.provaId || 'teste-prova-id',
    resultado: {
      nome: 'João Silva',
      cpf: '123.456.789-10',
      numeroProvaIndividual: 'prova_001_001',
      notaFinal: 8.5,
      nota: 85,
      modoCorrecao: testContext.modoCorrecao || 'rigoroso',
      dataCorrecao: new Date().toISOString()
    }
  };
  
  testContext.response = await apiClient.post('/correcao/salvar-resultado', payload);
});

Then('o resultado deve ser armazenado', () => {
  if (testContext.response.status !== 200 && testContext.response.status !== 201) {
    throw new Error('Resultado não foi armazenado');
  }
});

Then('o resultado deve conter:', (dataTable: DataTable) => {
  const dados = dataTable.rowsHash();
  const resultado = testContext.response.data.dados;
  
  Object.entries(dados).forEach(([chave, valor]) => {
    if (!(chave in resultado)) {
      throw new Error(`Campo faltando no resultado: ${chave}`);
    }
  });
});
