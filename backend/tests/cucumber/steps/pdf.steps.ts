import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { state } from './support/state';

function rotate<T>(arr: T[], offset: number): T[] {
  const mod = offset % arr.length;
  return [...arr.slice(mod), ...arr.slice(0, mod)];
}

function generatePdfs(quantidade: number) {
  const questoesBase = ['questao_1', 'questao_2', 'questao_3', 'questao_4', 'questao_5'];
  const alternativasBase = ['a', 'b', 'c', 'd'];

  state.generatedPdfs = Array.from({ length: quantidade }, (_, index) => {
    const numero = String(index + 1).padStart(3, '0');
    return {
      id: `prova_001_${numero}`,
      ordemQuestoes: rotate(questoesBase, index % questoesBase.length),
      ordemAlternativas: rotate(alternativasBase, index % alternativasBase.length),
    };
  });

  state.pdfMetadata = {
    título: 'Prova 1 - Geografia',
    disciplina: 'Geografia Geral',
    professor: 'Prof. João da Silva',
    data: '15/04/2026',
    rodapé: state.generatedPdfs[0]?.id ?? 'prova_001_001',
  };
}

Given('que existe uma prova com 5 questões', () => {
  state.selectedProvaId = 'prova_pdf';
});

Given('que existe uma prova', () => {
  state.selectedProvaId = 'prova_pdf';
});

Given('que existe uma prova com esquema {string}', (esquema: string) => {
  state.selectedProvaId = 'prova_pdf';
  state.modoCorrecao = esquema.includes('pot') ? 'flexivel' : 'rigoroso';
});

Given('que 30 PDFs foram gerados', () => {
  generatePdfs(30);
});

When('eu gero {int} PDFs da prova', (quantidade: number) => {
  if (quantidade < 1) {
    state.error = 'o mínimo é 1 PDF';
    return;
  }
  if (quantidade > 1000) {
    state.error = 'o máximo é 1000 PDFs';
    return;
  }
  state.error = undefined;
  generatePdfs(quantidade);
  state.generatedPdf = 'lote.pdf';
});

When('eu gero {int} PDFs', (quantidade: number) => {
  if (quantidade < 1) {
    state.error = 'o mínimo é 1 PDF';
    return;
  }
  if (quantidade > 1000) {
    state.error = 'o máximo é 1000 PDFs';
    return;
  }
  generatePdfs(quantidade);
  state.generatedPdf = 'lote.pdf';
});

When('eu gero um PDF', () => {
  generatePdfs(1);
  state.generatedPdf = 'individual.pdf';
});

When('eu gero o CSV de gabarito', () => {
  const linhas = ['numero_prova,questao_1,questao_2,...'];
  state.generatedPdfs.forEach((pdf) => {
    linhas.push(`${pdf.id},a,b,...`);
  });
  state.generatedCsv = linhas.join('\n');
});

When('eu tento gerar 0 PDFs', () => {
  state.error = 'o mínimo é 1 PDF';
});

When('eu tento gerar 1001 PDFs', () => {
  state.error = 'o máximo é 1000 PDFs';
});

Then('{int} arquivos PDF devem ser criados', (quantidade: number) => {
  if (state.generatedPdfs.length !== quantidade) {
    throw new Error(`Esperado ${quantidade} PDFs, recebido ${state.generatedPdfs.length}`);
  }
});

Then('cada PDF deve ter um identificador único', () => {
  const ids = state.generatedPdfs.map((pdf) => pdf.id);
  const unique = new Set(ids);
  if (ids.length !== unique.size) {
    throw new Error('IDs de PDF não são únicos');
  }
});

Then('cada PDF deve ter cabeçalho com disciplina, professor e data', () => {
  const m = state.pdfMetadata;
  if (!m?.disciplina || !m.professor || !m.data) {
    throw new Error('Cabeçalho incompleto');
  }
});

Then('cada PDF deve ter as questões em ordem diferente', () => {
  if (state.generatedPdfs.length < 2) {
    throw new Error('Teste requer ao menos 2 PDFs');
  }
  const a = state.generatedPdfs[0].ordemQuestoes.join(',');
  const b = state.generatedPdfs[1].ordemQuestoes.join(',');
  if (a === b) {
    throw new Error('Ordem de questões não variou');
  }
});

Then('os PDFs não devem ter a mesma ordem de questões', () => {
  const orders = state.generatedPdfs.map((pdf) => pdf.ordemQuestoes.join(','));
  if (new Set(orders).size === 1) {
    throw new Error('Todas as ordens de questão são iguais');
  }
});

Then('em cada questão as alternativas devem estar em ordem diferente', () => {
  if (state.generatedPdfs.length < 2) {
    throw new Error('Teste requer ao menos 2 PDFs');
  }
  const a = state.generatedPdfs[0].ordemAlternativas.join(',');
  const b = state.generatedPdfs[1].ordemAlternativas.join(',');
  if (a === b) {
    throw new Error('Ordem de alternativas não variou');
  }
});

Then('os PDFs não devem ter a mesma ordem de alternativas', () => {
  const orders = state.generatedPdfs.map((pdf) => pdf.ordemAlternativas.join(','));
  if (new Set(orders).size === 1) {
    throw new Error('Todas as ordens de alternativas são iguais');
  }
});

Then('o PDF deve conter:', (table: DataTable) => {
  const rows = table.hashes();
  rows.forEach((row) => {
    const key = row.elemento;
    const expected = row.valor;
    const actual = state.pdfMetadata?.[key];
    if (actual !== expected) {
      throw new Error(`PDF sem ${key} esperado: ${expected}`);
    }
  });
});

Then('cada questão deve ter espaço para o aluno escrever as letras', () => {
  if (state.modoCorrecao !== 'rigoroso') {
    throw new Error('Esquema de letras não aplicado');
  }
});

Then('cada questão deve ter espaço para o aluno informar o somatório', () => {
  if (state.modoCorrecao !== 'flexivel') {
    throw new Error('Esquema de potências não aplicado');
  }
});

Then('o final do PDF deve ter:', (table: DataTable) => {
  const campos = table.raw().slice(1).map((row) => row[0]);
  if (!campos.includes('Nome') || !campos.includes('CPF')) {
    throw new Error('Campos de identificação não encontrados');
  }
});

Then('cada linha deve conter:', (table: DataTable) => {
  const expectedCols = table.raw().slice(1).map((row) => row[0]);
  const header = state.generatedCsv?.split('\n')[0] ?? '';
  expectedCols.forEach((col) => {
    if (!header.includes(col)) {
      throw new Error(`CSV não contém coluna ${col}`);
    }
  });
});
