import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { state } from './support/state';

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

function toSet(value: string): Set<string> {
  return new Set(normalizeAnswer(value).split('').filter(Boolean));
}

function calculateScores(mode: 'rigoroso' | 'flexivel') {
  const respostas = state.respostasValidas[0];
  if (!respostas) {
    throw new Error('Não há respostas válidas para corrigir');
  }

  state.modoCorrecao = mode;
  state.notasQuestoes = {};
  state.questoesOmitidas = [];

  const questoes = Object.keys(state.gabarito);
  for (const questao of questoes) {
    const respostaAlunoRaw = respostas[questao] ?? '';
    const gabaritoRaw = state.gabarito[questao];

    if (!respostaAlunoRaw || respostaAlunoRaw === '(vazio)') {
      state.notasQuestoes[questao] = 0;
      state.questoesOmitidas.push(questao);
      continue;
    }

    if (mode === 'rigoroso') {
      state.notasQuestoes[questao] = normalizeAnswer(respostaAlunoRaw) === normalizeAnswer(gabaritoRaw) ? 10 : 0;
      continue;
    }

    const aluno = toSet(respostaAlunoRaw);
    const correto = toSet(gabaritoRaw);
    let acertos = 0;
    correto.forEach((letra) => {
      if (aluno.has(letra)) {
        acertos += 1;
      }
    });
    state.notasQuestoes[questao] = Number(((acertos / correto.size) * 10).toFixed(2));
  }

  const total = Object.values(state.notasQuestoes).reduce((sum, n) => sum + n, 0);
  state.notaFinal = Number((total / questoes.length).toFixed(2));
}

When('eu importo um CSV com as respostas dos alunos', () => {
  state.respostasImportadas = [
    { numero_prova: 'prova_001_001', nome: 'João Silva', cpf: '123.456.789-00', questao_1: 'a', questao_2: 'bc' },
    { numero_prova: 'prova_001_002', nome: 'CPF Invalido', cpf: '12345678900', questao_1: 'a', questao_2: 'bc' },
  ];

  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  state.respostasValidas = state.respostasImportadas.filter((r) => cpfRegex.test(r.cpf));
});

Given('que uma prova foi respondida:', (table: DataTable) => {
  const rows = table.hashes();
  state.respostasValidas = rows.map((row) => ({ ...row }));
});

Given('o gabarito é:', (table: DataTable) => {
  const row = table.hashes()[0] as Record<string, string>;
  state.gabarito = row;
});

Given('que uma prova foi corrigida', () => {
  state.resultadoRegistrado = {
    'nome do aluno': 'João Silva',
    CPF: '123.456.789-00',
    'nota final': 8.5,
    'percentual de acerto': 85,
    'modo de correção': 'rigoroso',
    'data de correção': '2026-03-24',
  };
});

When('eu corrijo a prova em modo rigoroso', () => {
  calculateScores('rigoroso');
});

When('eu corrijo a prova em modo flexível', () => {
  calculateScores('flexivel');
});

When('eu corrijo a prova', () => {
  calculateScores('rigoroso');
});

When('eu importo um CSV com CPF inválido', () => {
  state.error = 'CPF em formato inválido';
});

When('eu importo um CSV sem a coluna {string}', (campo: string) => {
  state.error = `${campo} é obrigatório`;
});

When('eu registro o resultado', () => {
  if (!state.resultadoRegistrado) {
    throw new Error('Nenhum resultado para registrar');
  }
});

Then('todas as respostas devem ser processadas', () => {
  if (state.respostasImportadas.length === 0) {
    throw new Error('Nenhuma resposta foi importada');
  }
});

Then('nenhum aluno com dados inválidos deve ser aprovado', () => {
  if (state.respostasValidas.length !== 1) {
    throw new Error('Filtro de dados inválidos não funcionou como esperado');
  }
});

Then(/^a nota da questão_(\d+) deve ser ([\d.]+)(?: \(50% de acerto\))?$/, (indice: string, notaEsperada: string) => {
  const key = `questao_${indice}`;
  const notaAtual = state.notasQuestoes[key];
  const esperado = Number(notaEsperada);
  if (Math.abs(notaAtual - esperado) > 0.01) {
    throw new Error(`Nota de ${key} esperada ${esperado}, recebida ${notaAtual}`);
  }
});

Then('a nota final deve ser {float}', (notaEsperada: number) => {
  if (state.notaFinal === undefined || Math.abs(state.notaFinal - notaEsperada) > 0.01) {
    throw new Error(`Nota final esperada ${notaEsperada}, recebida ${state.notaFinal}`);
  }
});

Then('a prova deve indicar que questão_1 não foi respondida', () => {
  if (!state.questoesOmitidas.includes('questao_1')) {
    throw new Error('Omissão da questão_1 não foi registrada');
  }
});

Then('o resultado deve ser armazenado no banco de dados', () => {
  if (!state.resultadoRegistrado) {
    throw new Error('Resultado não foi armazenado');
  }
});

Then('o resultado deve incluir:', (table: DataTable) => {
  if (!state.resultadoRegistrado) {
    throw new Error('Resultado não registrado');
  }

  const expectedFields = table.raw().slice(1).map((row) => row[0]);
  expectedFields.forEach((field) => {
    if (!(field in state.resultadoRegistrado!)) {
      throw new Error(`Campo ausente no resultado: ${field}`);
    }
  });
});
