# Backend - Sistema de Gerenciamento de Provas

## Descrição

API REST Node.js/Express para o Sistema de Gerenciamento de Provas. Responsável por gerenciar questões, provas, geração de PDFs, processamento de CSVs e correção automática de avaliações.

## Stack

- **Node.js 18+** - Runtime
- **Express 4** - Framework web
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados
- **Mongoose** - ODM
- **pdfkit** - Geração de PDFs
- **papaparse** - Processamento de CSVs
- **Winston** - Logging
- **Jest** - Testes unitários
- **Cucumber** - Testes de aceitação (BDD)

## Instalação

### Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)

### Setup

1. Instalar dependências:

```bash
npm install
```

2. Criar arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

3. Configurar variáveis de ambiente:

```env
MONGODB_URI=mongodb://localhost:27017/sistema-provas
PORT=3001
NODE_ENV=development
```

## Desenvolvimento

Iniciar servidor em modo desenvolvimento (com hot-reload):

```bash
npm run dev
```

Servidor rodará em `http://localhost:3001`

## Scripts

- `npm run dev` - Iniciar servidor em desenvolvimento
- `npm run build` - Compilar TypeScript para JavaScript
- `npm start` - Executar servidor compilado
- `npm test` - Rodar testes unitários
- `npm run test:watch` - Rodar testes em modo watch
- `npm run test:coverage` - Gerar relatório de cobertura
- `npm run test:acceptance` - Rodar testes de aceitação (Cucumber)
- `npm run lint` - Executar linter
- `npm run typecheck` - Verificar tipos TypeScript

## Estrutura do Projeto

```
src/
├── config/              # Configurações (env, db, logger)
├── controllers/         # Controllers das rotas
├── models/             # Modelos Mongoose
├── routes/             # Definição das rotas
├── services/           # Lógica de negócio
├── middleware/         # Middlewares Express
├── utils/              # Funções utilitárias
├── app.ts              # Aplicação Express
└── server.ts           # Entry point

tests/
├── unit/               # Testes unitários
├── integration/        # Testes de integração
└── cucumber/           # Testes de aceitação (BDD)
    ├── features/       # Arquivos .feature (Gherkin)
    └── steps/          # Step definitions
```

## API Endpoints

### Questões

- `POST /api/questoes` - Criar questão
- `GET /api/questoes` - Listar questões (com paginação)
- `GET /api/questoes/:id` - Obter questão por ID
- `PUT /api/questoes/:id` - Atualizar questão
- `DELETE /api/questoes/:id` - Deletar questão

### Provas

- `POST /api/provas` - Criar prova
- `GET /api/provas` - Listar provas
- `GET /api/provas/:id` - Obter prova por ID
- `PUT /api/provas/:id` - Atualizar prova
- `DELETE /api/provas/:id` - Deletar prova

### PDFs

- `POST /api/pdf/gerar` - Gerar múltiplos PDFs
- `POST /api/pdf/gabarito` - Gerar CSV de gabarito

### Correção

- `POST /api/correcao/importar` - Importar respostas e corrigir
- `GET /api/correcao/:idProva/resultados` - Obter resultados de uma prova
- `GET /api/correcao/:idProva/estatisticas` - Obter estatísticas

### Relatórios

- `POST /api/relatorios` - Gerar relatório
- `GET /api/relatorios/:idProva` - Obter relatórios de uma prova

## Testes

### Unitários

```bash
npm test
```

### Cobertura

```bash
npm run test:coverage
```

### Aceitação (Cucumber)

```bash
npm run test:acceptance
```

## MongoDB

### Opção 1: MongoDB Local

```bash
# Instalar MongoDB Community
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Iniciar servidor
brew services start mongodb-community

# O servidor rodará em mongodb://localhost:27017
```

### Opção 2: MongoDB Atlas (Cloud)

1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar um cluster
3. Obter string de conexão
4. Configurar em `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sistema-provas
```

## Logging

Logs são salvos em:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs
- Console - Saída padrão (desenvolvimento)

## Estrutura de Requisição/Resposta

### Sucesso

```json
{
  "sucesso": true,
  "mensagem": "Operação realizada com sucesso",
  "dados": { ... }
}
```

### Erro

```json
{
  "sucesso": false,
  "mensagem": "Descrição do erro",
  "erros": ["erro1", "erro2"]
}
```

## Tratamento de Erros

- **400** - Bad Request (validação falhou)
- **404** - Not Found (recurso não encontrado)
- **500** - Internal Server Error (erro do servidor)

## Próximos Passos

1. ✅ Setup inicial
2. ✅ Modelos Mongoose
3. ✅ Controllers e Routes
4. ✅ Serviços de lógica
5. ⏳ Testes unitários
6. ⏳ Testes de aceitação (Gherkin)
7. ⏳ Validação de compilação
8. ⏳ Execução local

---

*Desenvolvido em Março de 2026*
