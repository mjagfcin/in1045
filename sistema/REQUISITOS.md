# Especificação de Requisitos - Sistema de Gerenciamento de Provas

## 1. Visão Geral do Produto

O **Sistema de Gerenciamento e Correção de Provas** é uma aplicação web desenvolvida para auxiliar educadores na criação, distribuição e correção de avaliações com questões fechadas (múltipla escolha). O sistema permite a geração de provas individualizadas em formato PDF com parametrização de alternativas e facilita a correção automática com diferentes níveis de rigor.

**Data de Criação:** 23 de Março de 2026  
**Versão:** 1.0  
**Status:** Planejamento

---

## 2. Arquitetura da Solução

- **Frontend:** React 18+ com TypeScript
- **Backend:** Node.js com Express e TypeScript
- **Banco de Dados:** MongoDB
- **Geração de Documentos:** PDFs (pdfkit ou similar) e CSVs (papaparse ou similar)
- **Testes:** Jest (unitários), Cucumber com Gherkin (aceitação)

---

## 3. Requisitos Funcionais

### 3.1 Gerenciamento de Questões

**RF-001: Listar Questões**
- O sistema deve exibir todas as questões cadastradas em uma tabela paginada
- Para cada questão, deve-se exibir: ID, enunciado (prévia), número de alternativas, data de criação
- Deve haver filtro por palavra-chave no enunciado

**RF-002: Criar Questão**
- O usuário deve informar:
  - **Enunciado:** texto descritivo da questão (obrigatório)
  - **Alternativas:** mínimo 2, máximo 10 alternativas
  - Para cada alternativa:
    - **Descrição:** texto da alternativa (obrigatório)
    - **Correta:** booleano indicando se deve ser selecionada na resposta correta
- O sistema deve validar que há pelo menos uma alternativa correta
- Após criar, o sistema retorna o ID da questão criada

**RF-003: Editar Questão**
- O usuário pode alterar enunciado e alternativas de uma questão já cadastrada
- O sistema deve validar consistência (pelo menos uma alternativa correta)
- Caso a questão esteja sendo usada em provas, o usuário recebe aviso

**RF-004: Remover Questão**
- O usuário pode deletar uma questão
- Se a questão estiver associada a provas, o sistema pede confirmação com aviso

---

### 3.2 Gerenciamento de Provas

**RF-005: Listar Provas**
- O sistema exibe todas as provas em tabela paginada
- Para cada prova: ID, título, disciplina, professor, número de questões, data de criação, status

**RF-006: Criar Prova**
- O usuário deve informar:
  - **Título:** nome da prova (obrigatório)
  - **Disciplina:** identificação da disciplina (obrigatório)
  - **Professor:** nome do professor (obrigatório)
  - **Data:** data da prova (obrigatório)
  - **Questões:** seleção de questões previamente cadastradas (mínimo 1)
  - **Esquema de Identificação:** 
    - Opção A: Letras (a, b, c, d, ...)
    - Opção B: Potências de 2 (1, 2, 4, 8, 16, ...)
- Após criar, o sistema retorna o ID da prova

**RF-007: Editar Prova**
- O usuário pode alterar metadados (título, disciplina, professor, data)
- O usuário pode alterar a seleção de questões (adicionar/remover)
- Alterações invalidam PDFs cuja geração estava em progresso

**RF-008: Remover Prova**
- O usuário pode deletar uma prova e todos seus registros associados
- Aviso se há resultados de correção já registrados

**RF-009: Visualizar Detalhes da Prova**
- Exibir todas as questões da prova com suas alternativas no esquema de identificação configurado

---

### 3.3 Geração de PDFs

**RF-010: Gerar PDFs de Provas**
- O usuário informa:
  - **Quantidade:** número de PDFs a gerar (1 a 1000)
  - **Variação:** 
    - Ordem das questões muda aleatoriamente entre os PDFs
    - Ordem das alternativas muda aleatoriamente dentro de cada questão
- Para cada PDF:
  - **Cabeçalho:**
    - Nome da disciplina, professor, data da prova
    - Instruções para preenchimento (conforme esquema de alternativas)
  - **Corpo:**
    - Cada questão com seu enunciado
    - Alternativas numeradas (letras ou potências de 2)
    - Espaço em branco para resposta:
      - Se esquema de letras: linha para o aluno escrever letras selecionadas
      - Se esquema de potências: espaço para indicar somatório
  - **Rodapé em cada página:**
    - Número identificador único da prova individual
    - Número da página e total de páginas
  - **Final do PDF:**
    - Seção para aluno preencher nome e CPF
- Arquivo PDF nomeado como: `prova_<id_prova>_<numero_sequencial>.pdf`

**RF-011: Gerar Múltiplos PDFs em Lote**
- Sistema permite gerar até 1000 PDFs por requisição
- Processamento assíncrono com feedback de progresso
- Arquivos empacotados em ZIP para download

---

### 3.4 Geração de Gabarito (CSV)

**RF-012: Gerar CSV de Gabarito**
- Sistema gera um arquivo CSV contendo o gabarito de cada prova
- Formato do CSV:
  ```
  numero_prova,questao_1,questao_2,questao_3,...,questao_n
  1,a,b,c,...
  2,a,b,c,...
  ```
  - Para esquema de letras: sequência de letras corretas (ex: "abc" indica alternativas a, b, c)
  - Para esquema de potências: somatório esperado (ex: "15" indica 1+2+4+8)
- Nome do arquivo: `gabarito_prova_<id_prova>.csv`

---

### 3.5 Correção de Provas

**RF-013: Importar Respostas dos Alunos**
- O usuário faz upload de arquivo CSV contendo respostas
- Formato esperado do CSV:
  ```
  numero_prova,nome,cpf,questao_1,questao_2,...,questao_n
  1,João Silva,123.456.789-00,a,b,c,...
  2,Maria Santos,987.654.321-00,a,b,c,...
  ```

**RF-014: Corrigir Provas - Modo Rigoroso**
- Uma questão é considerada **correta** se TODAS as alternativas marcadas correspondem EXATAMENTE ao gabarito
- Se há qualquer discrepância (seleção incorreta OU omissão de seleção correta), a questão recebe nota **zero**
- Nota final da prova = (número de questões corretas / total de questões) × 10

**RF-015: Corrigir Provas - Modo Flexível**
- A nota de cada questão é proporcional ao percentual de acertos
- Cálculo por questão:
  ```
  acertos = (alternativas corretas marcadas + alternativas incorretas não marcadas) / total de alternativas
  nota_questao = acertos × (10 / número_de_questões)
  ```
- Nota final = soma das notas das questões (escala 0-10)

**RF-016: Registrar Resultado de Prova**
- Sistema armazena:
  - ID da prova, número da prova individual, nome do aluno, CPF
  - Respostas fornecidas (por questão)
  - Gabarito esperado
  - Modo de correção utilizado (rigoroso ou flexível)
  - Data/hora da correção
  - Nota final

---

### 3.6 Relatório de Notas

**RF-017: Gerar Relatório de Notas da Turma**
- Usuário seleciona uma prova
- Sistema gera relatório contendo:
  - Título da prova, disciplina, professor, data
  - Tabela com:
    - **Aluno (Nome / CPF)**
    - **Número da Prova Individual**
    - **Nota Final**
    - **Percentual de Acerto**
    - **Modo de Correção**
    - **Data de Correção**
  - Estatísticas:
    - Média de notas
    - Desvio padrão
    - Nota máxima e mínima
    - Percentual de aprovação (nota ≥ 6.0)

**RF-018: Exportar Relatório**
- Relatório pode ser exportado em:
  - CSV (para importação em planilhas)
  - PDF (para impressão)

---

## 4. Requisitos Não-Funcionais

### 4.1 Performance
- RNF-001: APIs devem responder em até 2 segundos para requisições normais
- RNF-002: Geração de PDFs (até 100 por lote) deve completar em menos de 30 segundos
- RNF-003: Banco de dados deve suportar até 10.000 questões e 1.000 provas

### 4.2 Usabilidade
- RNF-004: Interface deve ser responsiva (desktop, tablet, mobile)
- RNF-005: Feedback visual claro de sucesso/erro em todas as operações
- RNF-006: Confirmação antes de operações destrutivas (delete)

### 4.3 Confiabilidade
- RNF-007: Validação de entrada em client-side e server-side
- RNF-008: Tratamento de erros gracioso com mensagens úteis
- RNF-009: Logging de operações críticas (criação, correção de provas)

### 4.4 Segurança
- RNF-010: Validação e sanitização de todas as entradas
- RNF-011: Prevenção contra injeção de código (Mongoose schema validation)
- RNF-012: Dados de alunos tratados com respeito à privacidade

### 4.5 Manutenibilidade
- RNF-013: Código bem estruturado, comentado e com padrão TypeScript strict
- RNF-014: Testes unitários com cobertura mínima de 70%
- RNF-015: Testes de aceitação cobrindo fluxos principais

---

## 5. Casos de Uso Principais

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA DE PROVAS                     │
└─────────────────────────────────────────────────────────┘

Usuário (Professor/Admin)
  ├─ Gerenciar Questões
  │  ├─ Criar Questão
  │  ├─ Editar Questão
  │  ├─ Visualizar Questão
  │  └─ Deletar Questão
  │
  ├─ Gerenciar Provas
  │  ├─ Criar Prova (selecionando questões)
  │  ├─ Editar Prova
  │  ├─ Visualizar Detalhes Prova
  │  └─ Deletar Prova
  │
  ├─ Gerar Provas Individualizadas
  │  ├─ Gerar PDFs (com variação)
  │  ├─ Download PDFs (ZIP)
  │  └─ Gerar Gabarito (CSV)
  │
  ├─ Corrigir Provas
  │  ├─ Importar Respostas (CSV)
  │  ├─ Selecionar Modo Correção (Rigoroso/Flexível)
  │  └─ Visualizar Resultados
  │
  └─ Gerar Relatórios
     ├─ Relatório de Notas (visão turma)
     └─ Exportar (CSV/PDF)
```

---

## 6. Fluxo de Uso Típico

1. **Preparação:**
   - Professor cria 10-20 questões sobre um tópico
   - Professor cria uma prova selecionando 5-10 dessas questões
   - Professor define esquema de alternativas (letras ou potências)

2. **Distribuição:**
   - Professor gera 30 PDFs da prova (um por aluno)
   - Cada PDF tem ordem randomizada de questões e alternativas
   - Professor imprime os PDFs e distribui aos alunos
   - Professor gera e guarda o gabarito (CSV) da prova

3. **Avaliação:**
   - Alunos resolvem as provas (manuscritas ou digital)
   - Respostas são digitalizadas e inseridas em CSV
   - Sistema realiza correção (modo escolhido pelo professor)
   - Professor gera relatório de notas da turma

---

## 7. Dependências Externas

- Biblioteca PDF: `pdfkit` (npm)
- Processamento CSV: `papaparse` (npm)
- Validação de dados: `joi` ou `zod`
- Banco de dados: MongoDB Atlas ou local
- Testing: Jest, Cucumber

---

## 8. Critérios de Aceição

✅ Sistema compila sem erros  
✅ Testes de aceitação (Gherkin) executam com sucesso  
✅ Todos os requisitos funcionais implementados e testados  
✅ Sistema executa localmente sem dependências externas críticas  
✅ Documentação de API disponível  
✅ Modelo de dados validado  

---

*Documento aprovado para implementação: Março de 2026*
