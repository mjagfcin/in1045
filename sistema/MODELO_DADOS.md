# Modelo de Dados - Sistema de Gerenciamento de Provas

## 1. Visão Geral do Modelo

O sistema utiliza **MongoDB** com 5 coleções principais:
- `questoes` - Questões de múltipla escolha
- `provas` - Provas que agrupam questões
- `provas_geradas` - PDFs de provas individualizadas
- `resultados_provas` - Resultados de correção
- `relatorios` - Relatórios de notas por turma

---

## 2. Esquemas das Coleções

### 2.1 Coleção: `questoes`

Armazena questões de múltipla escolha.

```javascript
{
  _id: ObjectId,                    // ID único gerado pelo MongoDB
  enunciado: String,                // Texto da questão (obrigatório)
  alternativas: [                   // Array de alternativas (min 2, max 10)
    {
      _id: ObjectId,                // ID único da alternativa
      descricao: String,            // Texto alternativa (obrigatório)
      correta: Boolean              // true = deve ser selecionada no gabarito
    }
  ],
  dataCriacao: Date,                // Data/hora criação
  dataAtualizacao: Date,            // Data/hora última atualiza
  ativo: Boolean                    // soft delete flag
}
```

**Exemplo:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  enunciado: "Qual é a capital da França?",
  alternativas: [
    {
      _id: ObjectId("507f1f77bcf86cd799439012"),
      descricao: "Paris",
      correta: true
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439013"),
      descricao: "Lyon",
      correta: false
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439014"),
      descricao: "Marseille",
      correta: false
    }
  ],
  dataCriacao: ISODate("2026-03-23T10:30:00Z"),
  dataAtualizacao: ISODate("2026-03-23T10:30:00Z"),
  ativo: true
}
```

**Índices:**
```javascript
db.questoes.createIndex({ dataCriacao: -1 })
db.questoes.createIndex({ ativo: 1 })
db.questoes.createIndex({ enunciado: "text" }) // Full-text search
```

---

### 2.2 Coleção: `provas`

Armazena configuração e metadados das provas.

```javascript
{
  _id: ObjectId,                    // ID único
  titulo: String,                   // Nome da prova (obrigatório)
  disciplina: String,               // Disciplina (obrigatório)
  professor: String,                // Nome do professor (obrigatório)
  dataProva: Date,                  // Data da prova (obrigatório)
  questoes: [
    {
      idQuestao: ObjectId,          // Referência para a coleção questoes
      ordem: Number                 // Ordem original (1, 2, 3, ...)
    }
  ],
  esquemaAlternativas: {
    tipo: String,                   // "letras" ou "potencias"
    // tipo: "letras" -> a,b,c,d,e...
    // tipo: "potencias" -> 1,2,4,8,16...
  },
  dataCriacao: Date,
  dataAtualizacao: Date,
  ativo: Boolean
}
```

**Exemplo:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  titulo: "Prova 1 - Geografia",
  disciplina: "Geografia Geral",
  professor: "Prof. João da Silva",
  dataProva: ISODate("2026-04-15T14:00:00Z"),
  questoes: [
    {
      idQuestao: ObjectId("507f1f77bcf86cd799439011"),
      ordem: 1
    },
    {
      idQuestao: ObjectId("507f1f77bcf86cd799439021"),
      ordem: 2
    },
    {
      idQuestao: ObjectId("507f1f77bcf86cd799439022"),
      ordem: 3
    }
  ],
  esquemaAlternativas: {
    tipo: "letras"
  },
  dataCriacao: ISODate("2026-03-23T11:00:00Z"),
  dataAtualizacao: ISODate("2026-03-23T11:00:00Z"),
  ativo: true
}
```

**Índices:**
```javascript
db.provas.createIndex({ dataCriacao: -1 })
db.provas.createIndex({ ativo: 1 })
db.provas.createIndex({ disciplina: 1 })
db.provas.createIndex({ professor: 1 })
```

---

### 2.3 Coleção: `provas_geradas`

Armazena metadados de cada prova individual gerada em PDF.

```javascript
{
  _id: ObjectId,                    // ID único
  idProva: ObjectId,                // Referência para provas._id
  numeroSequencial: Number,         // 1, 2, 3, ... para cada PDF da mesma prova
  numeroIdentificador: String,      // ID único para impressão (prova_001_001)
  questoesOrdenadas: [              // Ordem específica desta prova (randomizada)
    {
      idQuestao: ObjectId,
      posicao: Number,
      alternativasOrdenadas: [       // Ordem randomizada alternativas
        {
          idAlternativa: ObjectId,
          identificador: String      // "a", "b", ... OU "1", "2", "4", etc
        }
      ]
    }
  ],
  gabarito: {
    // Gabarito específico desta prova com a randomização aplicada
    questao_1: "a",      // ou "1" para potências
    questao_2: "bc",     // ou "3" para potências
    questao_3: "d"       // ou "12" para potências
  },
  arquivoPDF: String,               // Caminho/URL do PDF gerado
  dataCriacao: Date,
  ativo: Boolean
}
```

**Exemplo:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439030"),
  idProva: ObjectId("507f1f77bcf86cd799439020"),
  numeroSequencial: 1,
  numeroIdentificador: "prova_001_001",
  questoesOrdenadas: [
    {
      idQuestao: ObjectId("507f1f77bcf86cd799439022"),
      posicao: 1,
      alternativasOrdenadas: [
        {
          idAlternativa: ObjectId("507f1f77bcf86cd799439023"),
          identificador: "a"
        },
        {
          idAlternativa: ObjectId("507f1f77bcf86cd799439024"),
          identificador: "b"
        }
      ]
    },
    {
      idQuestao: ObjectId("507f1f77bcf86cd799439011"),
      posicao: 2,
      alternativasOrdenadas: [
        {
          idAlternativa: ObjectId("507f1f77bcf86cd799439012"),
          identificador: "a"
        },
        {
          idAlternativa: ObjectId("507f1f77bcf86cd799439013"),
          identificador: "b"
        },
        {
          idAlternativa: ObjectId("507f1f77bcf86cd799439014"),
          identificador: "c"
        }
      ]
    }
  ],
  gabarito: {
    questao_1: "b",
    questao_2: "a"
  },
  arquivoPDF: "/uploads/provas/prova_001_001.pdf",
  dataCriacao: ISODate("2026-03-23T12:15:00Z"),
  ativo: true
}
```

**Índices:**
```javascript
db.provas_geradas.createIndex({ idProva: 1, numeroSequencial: 1 }, { unique: true })
db.provas_geradas.createIndex({ numeroIdentificador: 1 }, { unique: true })
```

---

### 2.4 Coleção: `resultados_provas`

Armazena respostas dos alunos e resultados da correção.

```javascript
{
  _id: ObjectId,                    // ID único
  idProvaGerada: ObjectId,          // Referência provas_geradas._id
  idProva: ObjectId,                // Referência provas._id
  numeroProva: String,              // Ex: "prova_001_001"
  aluno: {
    nome: String,                   // Nome completo
    cpf: String                     // CPF formatado (XXX.XXX.XXX-XX)
  },
  respostas: {
    questao_1: "a",                 // Resposta fornecida
    questao_2: "bc",
    questao_3: "d"
  },
  gabarito: {
    questao_1: "a",                 // Gabarito esperado
    questao_2: "bc",
    questao_3: "d"
  },
  analise: {
    questao_1: {
      correta: true,
      respostaFornecida: "a",
      gabaritoEsperado: "a",
      detalhes: "Acerto completo"  // Ou "Erro: seleção incorreta" / "Erro: omissão"
    },
    questao_2: {
      correta: false,
      respostaFornecida: "c",
      gabaritoEsperado: "bc",
      detalhes: "Erro: alternativa b não foi selecionada"
    },
    questao_3: {
      correta: true,
      respostaFornecida: "d",
      gabaritoEsperado: "d",
      detalhes: "Acerto completo"
    }
  },
  modoCorrecao: String,             // "rigoroso" ou "flexivel"
  notaPorQuestao: {
    questao_1: 10,
    questao_2: 0,                   // Modo rigoroso: 0 ou 10
    questao_3: 10
  },
  notaFinal: Number,                // valor entre 0 e 10
  percentualAcerto: Number,         // 66.67 (percentual)
  dataCorrecao: Date,
  observacoes: String               // Campo opcional para adicionar notas
}
```

**Exemplo:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439040"),
  idProvaGerada: ObjectId("507f1f77bcf86cd799439030"),
  idProva: ObjectId("507f1f77bcf86cd799439020"),
  numeroProva: "prova_001_001",
  aluno: {
    nome: "Maria Santos Silva",
    cpf: "123.456.789-00"
  },
  respostas: {
    questao_1: "a",
    questao_2: "c"
  },
  gabarito: {
    questao_1: "a",
    questao_2: "bc"
  },
  analise: {
    questao_1: {
      correta: true,
      respostaFornecida: "a",
      gabaritoEsperado: "a",
      detalhes: "Acerto completo"
    },
    questao_2: {
      correta: false,
      respostaFornecida: "c",
      gabaritoEsperado: "bc",
      detalhes: "Erro: alternativa b não foi selecionada e c foi selecionada incorretamente"
    }
  },
  modoCorrecao: "rigoroso",
  notaPorQuestao: {
    questao_1: 10,
    questao_2: 0
  },
  notaFinal: 5.0,
  percentualAcerto: 50,
  dataCorrecao: ISODate("2026-04-20T10:30:00Z"),
  observacoes: "Aluno faltou ao atendimento"
}
```

**Índices:**
```javascript
db.resultados_provas.createIndex({ idProva: 1 })
db.resultados_provas.createIndex({ numeroProva: 1 })
db.resultados_provas.createIndex({ aluno.cpf: 1 })
db.resultados_provas.createIndex({ dataCorrecao: -1 })
```

---

### 2.5 Coleção: `relatorios`

Armazena relatórios gerados de notas por turma/prova.

```javascript
{
  _id: ObjectId,
  idProva: ObjectId,                // Referência provas._id
  titulo: String,                   // Título do relatório
  dataGeracao: Date,
  resultados: [                     // Referências para resultados_provas
    ObjectId
  ],
  estatisticas: {
    totalAlunos: Number,
    mediaNota: Number,              // Nota média (0-10)
    desviaoPadrao: Number,
    notaMaxima: Number,
    notaMinima: Number,
    percentualAprovacao: Number     // % de alunos com nota >= 6.0
  },
  formato: String,                  // "csv" ou "pdf"
  caminhoArquivo: String            // Caminho/URL do arquivo gerado
}
```

**Exemplo:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439050"),
  idProva: ObjectId("507f1f77bcf86cd799439020"),
  titulo: "Relatório Prova 1 - Geografia - 2026.1",
  dataGeracao: ISODate("2026-04-22T15:45:00Z"),
  resultados: [
    ObjectId("507f1f77bcf86cd799439040"),
    ObjectId("507f1f77bcf86cd799439041"),
    ObjectId("507f1f77bcf86cd799439042")
  ],
  estatisticas: {
    totalAlunos: 30,
    mediaNota: 7.2,
    desviaoPadrao: 1.8,
    notaMaxima: 9.5,
    notaMinima: 3.0,
    percentualAprovacao: 86.67
  },
  formato: "pdf",
  caminhoArquivo: "/uploads/relatorios/relatorio_prova_001.pdf"
}
```

---

## 3. Relacionamentos e Fluxos de Dados

```
┌─────────────────┐
│    QUESTOES     │
│  (armazenadas)  │
└────────┬────────┘
         │
         │ referência (1..N)
         └──────────────┐
                        │
                    ┌───▼────────┐
                    │   PROVAS    │
                    │ (seleção    │
                    │  questões)  │
                    └────┬────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         (1 para muitos)      (1 para muitos)
              │                     │
      ┌───────▼──────────┐  ┌──────▼──────────┐
      │PROVAS_GERADAS   │  │RESULTADOS_PROVAS│
      │(PDFs com        │  │(Respostas e     │
      │randomização)    │  │ correção)       │
      └─────────────────┘  └────────┬────────┘
                                    │
                            (referências)
                                    │
                          ┌─────────▼────────┐
                          │   RELATORIOS     │
                          │ (resumos turma)  │
                          └──────────────────┘
```

---

## 4. Operações de Banco de Dados Críticas

### 4.1 Criar Prova Individualizada (com randomização)

Quando usuário requisita 30 PDFs:
1. Ler prova de `provas`
2. Para cada um dos 30 PDFs:
   - Embaralhar ordem de questões
   - Para cada questão, embaralhar ordem de alternativas
   - Mapear identificadores (letras ou potências)
   - Gerar gabarito considerando nova ordem
   - Inserir em `provas_geradas`
3. Gerar arquivo PDF
4. Gerar CSV de gabarito

### 4.2 Corrigir Prova

1. Ler dados de `provas_geradas` (gabarito esperado com randomização)
2. Comparar respostas com gabarito
3. Aplicar modo de correção (rigoroso ou flexível)
4. Calcular nota
5. Inserir resultado em `resultados_provas`

### 4.3 Gerar Relatório

1. Ler prova de `provas`
2. Buscar todos os `resultados_provas` para essa prova
3. Calcular estatísticas
4. Gerar documento (CSV ou PDF)
5. Inserir referência em `relatorios`

---

## 5. Validações em Nível de Banco

```javascript
// Validações no schema do Mongoose

// Questao
{
  enunciado: { type: String, required: true, minlength: 10 },
  alternativas: {
    type: [{
      descricao: { type: String, required: true, minlength: 2 },
      correta: { type: Boolean, required: true }
    }],
    validate: {
      validator: function(v) {
        // Mínimo 2, máximo 10 alternativas
        return v.length >= 2 && v.length <= 10;
      },
      message: 'Questão deve ter entre 2 e 10 alternativas'
    }
  }
}

// Prova
{
  titulo: { type: String, required: true },
  disciplina: { type: String, required: true },
  professor: { type: String, required: true },
  dataProva: { type: Date, required: true },
  questoes: {
    type: [{
      idQuestao: { type: Schema.Types.ObjectId, ref: 'Questao' },
      ordem: Number
    }],
    validate: {
      validator: function(v) {
        return v.length > 0; // Mínimo 1 questão
      },
      message: 'Prova deve ter pelo menos 1 questão'
    }
  }
}

// ResultadoProva
{
  cpf: {
    type: String,
    validate: {
      validator: function(v) {
        // Validação simples de CPF (formato)
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
      },
      message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
    }
  }
}
```

---

## 6. Documentação das Queries Frequentes

### Buscar questões por palavra-chave
```javascript
db.questoes.find({ $text: { $search: "geograficamente" }, ativo: true })
```

### Buscar provas de um professor
```javascript
db.provas.find({ professor: "Prof. João da Silva", ativo: true })
  .sort({ dataCriacao: -1 })
```

### Buscar resultados de uma prova
```javascript
db.resultados_provas.find({ idProva: ObjectId("...") })
  .sort({ dataCorrecao: -1 })
```

### Calcular estatísticas de uma prova
```javascript
db.resultados_provas.aggregate([
  { $match: { idProva: ObjectId("...") } },
  { 
    $group: {
      _id: "$idProva",
      mediaNota: { $avg: "$notaFinal" },
      desvio: { $stdDevSamp: "$notaFinal" },
      maxNota: { $max: "$notaFinal" },
      minNota: { $min: "$notaFinal" },
      totalAlunos: { $sum: 1 }
    }
  }
])
```

---

## 7. Escalabilidade

- **Partição por prova:** Se dataset cresce, considerar sharding em `idProva`
- **Índices compostos:** Para queries frequentes em resultado + prova
- **TTL Indexes:** Para arquivos temporários (PDFs em geração)
- **Caching:** Redis para estatísticas calculadas frequentemente

---

## 8. Migrações Futuras

- Campo para templates de cabeçalho de prova (instituição, logo, etc)
- Suporte a questões de tipos diferentes (V/F, dissertativas, etc)
- Sistema de permissões por professor/turma
- Histórico de alterações (audit log)
- Integração com Moodle/Blackboard

---

*Modelo de dados aprovado para implementação: Março de 2026*
