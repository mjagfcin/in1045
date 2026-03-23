import {
  validarCSVRespostas,
  validarCPF,
  parseCSVRespostas
} from '../../../src/services/csvService';

describe('CsvService', () => {
  describe('validarCPF', () => {
    it('deve aceitar CPF válido com formatação correta', () => {
      expect(validarCPF('123.456.789-10')).toBe(true);
      expect(validarCPF('987.654.321-00')).toBe(true);
    });

    it('deve rejeitar CPF sem formatação', () => {
      expect(validarCPF('12345678910')).toBe(false);
    });

    it('deve rejeitar CPF com formatação incorreta', () => {
      expect(validarCPF('123-456-789.10')).toBe(false);
      expect(validarCPF('123.456.789.10')).toBe(false);
      expect(validarCPF('123456789-10')).toBe(false);
    });

    it('deve rejeitar CPF vazio ou null', () => {
      expect(validarCPF('')).toBe(false);
      expect(validarCPF(null as any)).toBe(false);
    });

    it('deve rejeitar CPF com caracteres inválidos', () => {
      expect(validarCPF('ABC.DEF.GHI-JK')).toBe(false);
      expect(validarCPF('123.456.789-AA')).toBe(false);
    });
  });

  describe('validarCSVRespostas', () => {
    it('deve validar CSV com estrutura correta', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João Silva,123.456.789-10,"a,b,c,a,b"
prova_001_002,Maria Santos,987.654.321-99,"a,a,b,c,a"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toEqual([]);
    });

    it('deve detectar CPF inválido', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João Silva,12345678910,"a,b,c,a,b"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros[0]).toContain('CPF inválido');
    });

    it('deve detectar campos obrigatórios faltando', () => {
      const csv = `numero_prova,nome,respostas
prova_001_001,João Silva,"a,b,c,a,b"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros[0]).toContain('cpf');
    });

    it('deve detectar número de prova vazio', () => {
      const csv = `numero_prova,nome,cpf,respostas
,João Silva,123.456.789-10,"a,b,c,a,b"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros[0]).toContain('numero_prova');
    });

    it('deve detectar nome vazio', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,,123.456.789-10,"a,b,c,a,b"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros[0]).toContain('nome');
    });

    it('deve aceitar múltiplas linhas válidas', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João Silva,123.456.789-10,"a,b,c,a,b"
prova_001_002,Maria Santos,987.654.321-99,"a,a,b,c,a"
prova_001_003,Pedro Costa,456.789.123-45,"b,b,a,c,b"`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(true);
      expect(resultado.totalLinhas).toBe(3);
    });

    it('deve reportar todas as linhas com erros', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,,123.456.789-10,"a,b,c,a,b"
prova_001_002,Maria Santos,12345678910,"a,a,b,c,a"
prova_001_003,Pedro Costa,456.789.123-45,""`;

      const resultado = validarCSVRespostas(csv);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('parseCSVRespostas', () => {
    it('deve parser CSV respeitando aspas e vírgulas', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João Silva,123.456.789-10,"a,b,c,a,b"
prova_001_002,Maria Santos,987.654.321-99,"a,a,b,c,a"`;

      const resultado = parseCSVRespostas(csv);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('João Silva');
      expect(resultado[0].respostas).toEqual(['a', 'b', 'c', 'a', 'b']);
      expect(resultado[1].nome).toBe('Maria Santos');
      expect(resultado[1].respostas).toEqual(['a', 'a', 'b', 'c', 'a']);
    });

    it('deve suportar respostas em modo letras', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João,123.456.789-10,"a,b,c"`;

      const resultado = parseCSVRespostas(csv);

      expect(resultado[0].respostas).toEqual(['a', 'b', 'c']);
    });

    it('deve suportar respostas em modo numérico (soma de potências)', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João,123.456.789-10,"1,3,5"`;

      const resultado = parseCSVRespostas(csv);

      expect(resultado[0].respostas).toEqual(['1', '3', '5']);
    });

    it('deve suportar respostas múltiplas como string separada por vírgula', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João,123.456.789-10,"ab,bc,abc"`;

      const resultado = parseCSVRespostas(csv);

      // Cada resposta é uma string representando alternativas múltiplas selecionadas
      expect(resultado[0].respostas[0]).toBe('ab');
      expect(resultado[0].respostas[1]).toBe('bc');
      expect(resultado[0].respostas[2]).toBe('abc');
    });

    it('deve retornar array vazio para CSV vazio', () => {
      const csv = `numero_prova,nome,cpf,respostas`;

      const resultado = parseCSVRespostas(csv);

      expect(resultado).toEqual([]);
    });

    it('deve preservar ordem de respostas', () => {
      const csv = `numero_prova,nome,cpf,respostas
prova_001_001,João,123.456.789-10,"e,d,c,b,a"`;

      const resultado = parseCSVRespostas(csv);

      expect(resultado[0].respostas).toEqual(['e', 'd', 'c', 'b', 'a']);
    });
  });
});
