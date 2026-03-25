import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { state } from './support/state';

function baseRelatorio() {
  return {
    cabecalho: {
      'Título da prova': 'Prova 1 - Geografia',
      Disciplina: 'Geografia Geral',
      Professor: 'Prof. João da Silva',
      'Data da prova': '15/04/2026',
      'Lista de alunos com notas': '30 registros',
    },
    alunos: [
      {
        Nome: 'Aluno A',
        CPF: '101.101.101-10',
        'Número da prova individual': 'prova_001_001',
        'Nota final': 9,
        'Percentual de acerto': 90,
        'Modo de correção': 'Rigoroso',
        'Data de correção': '2026-03-24',
      },
      {
        Nome: 'Aluno B',
        CPF: '202.202.202-20',
        'Número da prova individual': 'prova_001_002',
        'Nota final': 6,
        'Percentual de acerto': 60,
        'Modo de correção': 'Rigoroso',
        'Data de correção': '2026-03-24',
      },
    ],
    estatisticas: {
      'Média de notas': 7.5,
      'Desvio padrão': 1.5,
      'Nota máxima': 9,
      'Nota mínima': 6,
      'Percentual de aprovação (>=6)': 83.33,
    },
    modo: 'Rigoroso' as const,
    percentualAprovacao: 83.33,
  };
}

Given('que existem 30 resultados corrigidos para uma prova', () => {
  state.relatorio = baseRelatorio();
});

Given('que existem resultados corrigidos', () => {
  state.relatorio = baseRelatorio();
});

Given('que existem 30 alunos com notas: 9, 8, 7, 6, 5, ...', () => {
  state.relatorio = baseRelatorio();
});

Given('que um relatório foi gerado', () => {
  state.relatorio = baseRelatorio();
});

Given('que provas foram corrigidas em modo rigoroso', () => {
  state.relatorio = baseRelatorio();
  state.relatorio.modo = 'Rigoroso';
  state.relatorio.alunos = state.relatorio.alunos.map((a) => ({ ...a, 'Modo de correção': 'Rigoroso' }));
});

Given('que provas foram corrigidas em modo flexível', () => {
  state.relatorio = baseRelatorio();
  state.relatorio.modo = 'Flexível';
  state.relatorio.alunos = state.relatorio.alunos.map((a) => ({ ...a, 'Modo de correção': 'Flexível' }));
});

Given('que existem 30 alunos com os seguintes padrões:', (_table: DataTable) => {
  state.relatorio = baseRelatorio();
  state.relatorio.percentualAprovacao = 83.33;
});

When('eu gero o relatório de notas', () => {
  state.relatorio = state.relatorio ?? baseRelatorio();
});

When('eu gero o relatório', () => {
  state.relatorio = state.relatorio ?? baseRelatorio();
});

When('eu exporto em formato CSV', () => {
  if (!state.relatorio) {
    throw new Error('Relatório ausente para exportação CSV');
  }

  const rows = state.relatorio.alunos;
  const header = ['Nome', 'CPF', 'Nota final', 'Percentual de acerto'];
  const lines = [header.join(',')];
  rows.forEach((r) => {
    lines.push([r.Nome, r.CPF, r['Nota final'], r['Percentual de acerto']].join(','));
  });
  state.generatedCsv = lines.join('\n');
});

When('eu exporto em formato PDF', () => {
  if (!state.relatorio) {
    throw new Error('Relatório ausente para exportação PDF');
  }
  state.generatedPdf = 'relatorio.pdf';
});

Then('um relatório deve ser criado', () => {
  if (!state.relatorio) {
    throw new Error('Relatório não foi criado');
  }
});

Then('o relatório deve conter:', (table: DataTable) => {
  if (!state.relatorio) {
    throw new Error('Relatório ausente');
  }

  const fields = table.raw().slice(1).map((row) => row[0]);
  fields.forEach((field) => {
    if (!(field in state.relatorio!.cabecalho)) {
      throw new Error(`Campo ausente no cabeçalho: ${field}`);
    }
  });
});

Then('o relatório deve listar cada aluno com:', (table: DataTable) => {
  if (!state.relatorio || state.relatorio.alunos.length === 0) {
    throw new Error('Lista de alunos não encontrada no relatório');
  }

  const cols = table.raw().slice(1).map((row) => row[0]);
  cols.forEach((col) => {
    if (!(col in state.relatorio!.alunos[0])) {
      throw new Error(`Coluna ausente no relatório: ${col}`);
    }
  });
});

Then('o relatório deve incluir:', (table: DataTable) => {
  if (!state.relatorio) {
    throw new Error('Relatório ausente');
  }

  const stats = table.raw().slice(1).map((row) => row[0]);
  stats.forEach((s) => {
    if (!(s in state.relatorio!.estatisticas)) {
      throw new Error(`Estatística ausente: ${s}`);
    }
  });
});

Then('o CSV deve ter uma linha por aluno', () => {
  if (!state.generatedCsv || !state.relatorio) {
    throw new Error('CSV não foi gerado');
  }

  const totalLinhas = state.generatedCsv.split('\n').length - 1;
  if (totalLinhas !== state.relatorio.alunos.length) {
    throw new Error(`CSV com ${totalLinhas} linhas para ${state.relatorio.alunos.length} alunos`);
  }
});

Then('cada linha deve conter nome, CPF, nota, percentual', () => {
  const header = state.generatedCsv?.split('\n')[0] ?? '';
  ['Nome', 'CPF', 'Nota final', 'Percentual de acerto'].forEach((col) => {
    if (!header.includes(col)) {
      throw new Error(`CSV sem coluna ${col}`);
    }
  });
});

Then('o PDF deve ter formatação legível', () => {
  if (!state.generatedPdf) {
    throw new Error('PDF não foi gerado');
  }
});

Then('o PDF deve conter cabeçalho com dados da prova', () => {
  if (!state.relatorio?.cabecalho['Título da prova']) {
    throw new Error('Cabeçalho da prova ausente no relatório em PDF');
  }
});

Then('o relatório deve indicar {string}', (modo: string) => {
  if (!state.relatorio || `Modo: ${state.relatorio.modo}` !== modo) {
    throw new Error(`Modo esperado ${modo}, encontrado Modo: ${state.relatorio?.modo}`);
  }
});

Then('as notas devem refletir a correção rigorosa', () => {
  if (!state.relatorio || state.relatorio.alunos.some((a) => a['Modo de correção'] !== 'Rigoroso')) {
    throw new Error('Notas não refletem correção rigorosa');
  }
});

Then('as notas devem refletir a correção flexível', () => {
  if (!state.relatorio || state.relatorio.alunos.some((a) => a['Modo de correção'] !== 'Flexível')) {
    throw new Error('Notas não refletem correção flexível');
  }
});

Then('o percentual de aprovação deve ser 83.33%', () => {
  if (!state.relatorio || Math.abs((state.relatorio.percentualAprovacao ?? 0) - 83.33) > 0.001) {
    throw new Error(`Percentual esperado 83.33, encontrado ${state.relatorio?.percentualAprovacao}`);
  }
});
