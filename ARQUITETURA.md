# Arquitetura da Solução - Sistema de Gerenciamento de Provas

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Cliente)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  React + TypeScript                      │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Questões UI │  │   Provas UI  │  │ Correção UI  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐                      │  │
│  │  │ Relatórios   │  │PDF Generator │                      │  │
│  │  └──────────────┘  └──────────────┘                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                    (HTTP/REST)
                            │
┌─────────────────────────────────────────────────────────────────┐
│              Node.js + Express + TypeScript Backend              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express Server                        │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │Questões APIs │  │   Provas API │  │ Correção API │   │  │
│  │  │ (CRUD)       │  │   (CRUD)     │  │ (Lógica)     │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  PDF Service │  │  CSV Service │  │  Data Loader │   │  │
│  │  │ (pdfkit)     │  │ (papaparse)  │  │ (CSV import) │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                          │  │
│  │  Middleware: Auth, Validação, Logging                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                    (Mongoose Driver)
                            │
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB Database                            │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐     │
│  │questoes  │  │  provas  │  │prova_   │  │ resultados_  │     │
│  │          │  │          │  │geradas  │  │ provas       │     │
│  └──────────┘  └──────────┘  └─────────┘  └──────────────┘     │
│  ┌──────────────┐                                              │
│  │ relatorios   │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                    (File System / Cloud Storage)
                            │
┌─────────────────────────────────────────────────────────────────┐
│              Upload/Download Storage                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  PDFs gerados  │  │ CSVs gabarito  │  │ CSVs respostas │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 18+ | Framework UI |
| TypeScript | 5+ | Tipagem estática |
| React Router | 6+ | Roteamento |
| Axios | 1+ | HTTP Client |
| TailwindCSS | 3+ | Estilização |
| React Hook Form | 7+ | Gerenciamento de forms |
| Zod | 3+ | Validação de schema |

### 2.2 Backend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Node.js | 18+ LTS | Runtime |
| Express | 4+ | Framework Web |
| TypeScript | 5+ | Tipagem estática |
| Mongoose | 7+ | ODM MongoDB |
| pdfkit | 0.13+ | Geração de PDFs |
| papaparse | 5+ | Processamento de CSVs |
| joi | 17+ | Validação de dados |
| winston | 3+ | Logging |
| dotenv | 16+ | Variáveis de ambiente |
| jest | 29+ | Testes unitários |
| @types/node | 20+ | Tipagem Node.js |
| cors | 2+ | CORS middleware |

### 2.3 Banco de Dados

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| MongoDB | 6+ | Banco de dados NoSQL |
| Mongoose | 7+ | ODM |

### 2.4 Testes

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Jest | 29+ | Testes unitários |
| Cucumber | 9+ | BDD / Testes aceitação |
| Gherkin | - | Linguagem de testes |
| @cucumber/cucumber | 9+ | Motor Cucumber |
| ts-jest | 29+ | Jest com TypeScript |

---

## 3. Estrutura de Diretórios

```
projeto-sistema-provas/
│
├── frontend/                           # Aplicação React
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestaoForm.tsx        # Form para criar/editar questão
│   │   │   ├── ProvaForm.tsx          # Form para criar/editar prova
│   │   │   ├── GeradorPDFs.tsx        # Interface geração PDFs
│   │   │   ├── ImportadorCSV.tsx      # Upload de CSVs
│   │   │   ├── CorrecaoForm.tsx       # Formulário de correção
│   │   │   └── RelatorioView.tsx      # Visualização de relatórios
│   │   ├── pages/
│   │   │   ├── QuestoesPage.tsx
│   │   │   ├── ProvasPage.tsx
│   │   │   ├── GeracaoPDFPage.tsx
│   │   │   ├── CorrecaoPage.tsx
│   │   │   └── RelatorioPage.tsx
│   │   ├── services/
│   │   │   ├── questaoService.ts      # API calls para questões
│   │   │   ├── provaService.ts        # API calls para provas
│   │   │   ├── correcaoService.ts     # API calls para correção
│   │   │   └── relatorioService.ts    # API calls para relatórios
│   │   ├── types/
│   │   │   ├── questao.ts
│   │   │   ├── prova.ts
│   │   │   └── resultado.ts
│   │   ├── utils/
│   │   │   ├── validation.ts          # Funções de validação
│   │   │   └── formatters.ts          # Formatadores (CPF, data, etc)
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                 # ou webpack.config.js
│
├── backend/                            # Aplicação Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── questaoController.ts   # Lógica de questões
│   │   │   ├── provaController.ts     # Lógica de provas
│   │   │   ├── pdfController.ts       # Geração de PDFs
│   │   │   ├── csvController.ts       # Processamento de CSVs
│   │   │   ├── correcaoController.ts  # Lógica de correção
│   │   │   └── relatorioController.ts # Geração de relatórios
│   │   ├── models/
│   │   │   ├── Questao.ts             # Schema Mongoose
│   │   │   ├── Prova.ts
│   │   │   ├── ProvaGerada.ts
│   │   │   ├── ResultadoProva.ts
│   │   │   └── Relatorio.ts
│   │   ├── routes/
│   │   │   ├── questoes.ts            # Rotas /api/questoes
│   │   │   ├── provas.ts              # Rotas /api/provas
│   │   │   ├── pdf.ts                 # Rotas /api/pdf
│   │   │   ├── correcao.ts            # Rotas /api/correcao
│   │   │   └── relatorio.ts           # Rotas /api/relatorio
│   │   ├── services/
│   │   │   ├── questaoService.ts      # Lógica questões (DB)
│   │   │   ├── provaService.ts        # Lógica provas (DB)
│   │   │   ├── pdfService.ts          # Lógica geração PDF
│   │   │   ├── csvService.ts          # Lógica processamento CSV
│   │   │   ├── correcaoService.ts     # Algoritmos de correção
│   │   │   └── relatorioService.ts    # Geração de relatórios
│   │   ├── middleware/
│   │   │   ├── auth.ts                # Autenticação (futuro)
│   │   │   ├── errorHandler.ts        # Tratamento de erros
│   │   │   ├── validation.ts          # Validação de entrada
│   │   │   └── logging.ts             # Logging de requisições
│   │   ├── utils/
│   │   │   ├── validators.ts          # Funções de validação
│   │   │   ├── formatters.ts          # Funções de formatação
│   │   │   ├── randomizers.ts         # Funções de randomização
│   │   │   └── constants.ts           # Constantes globais
│   │   ├── config/
│   │   │   ├── database.ts            # Config conexão MongoDB
│   │   │   ├── env.ts                 # Variáveis de ambiente
│   │   │   └── logger.ts              # Config Winston
│   │   ├── app.ts                     # Inicialização Express
│   │   └── server.ts                  # Entry point
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── questaoService.test.ts
│   │   │   ├── correcaoService.test.ts
│   │   │   └── pdfService.test.ts
│   │   ├── integration/
│   │   │   ├── questoes.integration.test.ts
│   │   │   └── provas.integration.test.ts
│   │   └── cucumber/
│   │       ├── features/
│   │       │   ├── questoes.feature
│   │       │   ├── provas.feature
│   │       │   ├── pdf.feature
│   │       │   ├── correcao.feature
│   │       │   └── relatorio.feature
│   │       └── steps/
│   │           ├── questoes.steps.ts
│   │           ├── provas.steps.ts
│   │           ├── pdf.steps.ts
│   │           ├── correcao.steps.ts
│   │           └── relatorio.steps.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── jest.config.js
│
├── docker-compose.yml                 # MongoDB + serviços (opcional)
├── .gitignore
├── README.md
└── DOCUMENTACAO.md
```

---

## 4. Fluxo de Requisições (Request/Response)

### 4.1 Criar Questão

```
Frontend                          Backend                     MongoDB
   │                                │                            │
   ├─ POST /api/questoes ──────────>│                            │
   │  (enunciado, alternativas)     │                            │
   │                                ├─ Validar entrada          │
   │                                ├─ Inserir em DB ──────────>│
   │                                │                      Questao
   │                                │<──────────────────────────│
   │<─────────────────────API 201────                 _id, status
   │  { _id, enunciado, ... }        │
```

### 4.2 Gerar PDFs

```
Frontend                          Backend                     MongoDB
   │                                │                            │
   ├─ POST /api/pdf/gerar ─────────>│                            │
   │  (idProva, quantidade)         │                            │
   │                                ├─ Ler prova <─────────────>│
   │                     (async)     ├─ Randomizar questões      │
   │                                ├─ Randomizar alternativas   │
   │                                ├─ Gerar PDFs (pdfkit)       │
   │                                ├─ Salvar metadados <───────>│
   │                                │                    Prova
   │<──────────────────── 202 ───────│                   Gerada
   │ { jobId, status: "processing" }│
   │                                │
   ├─ GET /api/pdf/status ─────────>│
   │                                ├─ QueryDB para status      │
   │<──────────────────────────────│
   │ { status: "completed", pdfs }  │
```

### 4.3 Corrigir Prova

```
Frontend                          Backend                     MongoDB
   │                                │                            │
   ├─ POST /api/correcao/upload ───>│                            │
   │  (csvRespostas)                ├─ Parse CSV                │
   │                                ├─ Validar CPF/dados        │
   │                                ├─ Busca gabarito <────────>│
   │                                │              Prova Gerada  │
   │                                ├─ Aplicar algoritmo        │
   │                                │  (rigoroso/flexível)      │
   │                                ├─ Salvar resultado <──────>│
   │                                │                 Resultado  │
   │<────────────────────   201 ─────│
   │ { resultados, estatísticas }   │
```

---

## 5. Endpoints REST API

### Questões
```
POST   /api/questoes                    # Criar questão
GET    /api/questoes                    # Listar questões (com paginação)
GET    /api/questoes/:id                # Obter uma questão
PUT    /api/questoes/:id                # Editar questão
DELETE /api/questoes/:id                # Deletar questão
```

### Provas
```
POST   /api/provas                      # Criar prova
GET    /api/provas                      # Listar provas
GET    /api/provas/:id                  # Obter detalhes prova
PUT    /api/provas/:id                  # Editar prova
DELETE /api/provas/:id                  # Deletar prova
```

### PDF
```
POST   /api/pdf/gerar                   # Iniciar geração de PDFs
GET    /api/pdf/status/:jobId           # Status de geração
GET    /api/pdf/download/:provaId       # Download ZIP de PDFs
POST   /api/pdf/gabarito                # Gerar CSV gabarito
```

### Correção
```
POST   /api/correcao/upload             # Upload CSV respostas
GET    /api/correcao/resultados         # Listar resultados
GET    /api/correcao/:id                # Detalhes um resultado
```

### Relatórios
```
GET    /api/relatorios                  # Listar relatórios
GET    /api/relatorios/:provaId         # Gerar relatório prova
GET    /api/relatorios/download/:id     # Download relatório (PDF/CSV)
```

---

## 6. Segurança e Boas Práticas

### 6.1 Validação
- ✅ Validação server-side obrigatória (Joi/Zod)
- ✅ Sanitização de inputs (XSS prevention)
- ✅ Verificação de tamanho de uploads (CSV, PDF)

### 6.2 Erro Handling
- ✅ Try-catch em todas as operações DB
- ✅ Mensagens de erro genéricas (não expor stack trace)
- ✅ Logging de erros críticos
- ✅ Fallback gracioso para o usuário

### 6.3 Performance
- ✅ Pagination em listagens (padrão 20 itens/página)
- ✅ Índices MongoDB em campos frequentemente queried
- ✅ Lazy loading de dados em Frontend
- ✅ Processamento assíncrono para PDFs

### 6.4 Escalabilidade
- ✅ Arquitetura preparada para multi-threading (Node.js)
- ✅ Modularização de serviços
- ✅ Possibilidade de adicionar cache (Redis)
- ✅ Suporte a job queues (Bull/RabbitMQ - futuro)

---

## 7. Fluxo de Deployment (Futuro)

```
Desenvolvimento          Staging            Produção
  (localhost)           (teste)             (online)
     │                    │                   │
  npm run dev        Docker Compose      AWS/Azure
     │                    │                   │
  ├─ React dev      ├─ Docker build    ├─ CI/CD Pipeline
  ├─ Node dev       ├─ MongoDB test    ├─ Kubernetes
  └─ MongoDB local  └─ Testes E2E      └─ MongoDB Atlas
```

---

## 8. Logging e Monitoramento

### Backend Logging (Winston)
```typescript
// Exemplo: Operação bem-sucedida
logger.info('Questão criada', { questaoId: '...', userId: '...' })

// Exemplo: Erro crítico
logger.error('Falha ao gerar PDF', { erro: e.message, provaId: '...' })
```

### Logs Armazenados
- Criação/atualização de entidades
- Erros de operação
- Operações de correção (para auditoria)
- Performance (tempo de requisição)

---

## 9. Considerações de Concorrência

- **Múltiplos PDFs simultâneos:** Use worker threads ou queue (Bull)
- **Múltiplos usuários corrigindo:** Mongoose locks para atualização
- **Leitura concorrente:** MongoDB suporta naturalmente

---

*Documento aprovado: Março de 2026*
