# language: pt-BR
Funcionalidade: Corrigir Provas
  Como um professor
  Quero corrigir provas de alunos automaticamente
  Para gerar notas e relatórios

  Cenário: Importar respostas de alunos via CSV
    Quando eu importo um CSV com as respostas dos alunos
    Então todas as respostas devem ser processadas
    E nenhum aluno com dados inválidos deve ser aprovado

  Cenário: Corrigir em modo rigoroso
    Dado que uma prova foi respondida:
      | numero_prova | nome | cpf | questao_1 | questao_2 |
      | prova_001_001 | João Silva | 123.456.789-00 | a | bc |
    E o gabarito é:
      | questao_1 | questao_2 |
      | a | bc |
    Quando eu corrijo a prova em modo rigoroso
    Então a nota da questão_1 deve ser 10
    E a nota da questão_2 deve ser 10
    E a nota final deve ser 10

  Cenário: Corrigir em modo rigoroso - Resposta errada
    Dado que uma prova foi respondida:
      | numero_prova | nome | cpf | questao_1 | questao_2 |
      | prova_001_001 | João Silva | 123.456.789-00 | b | bc |
    E o gabarito é:
      | questao_1 | questao_2 |
      | a | bc |
    Quando eu corrijo a prova em modo rigoroso
    Então a nota da questão_1 deve ser 0
    E a nota da questão_2 deve ser 10
    E a nota final deve ser 5

  Cenário: Corrigir em modo flexível
    Dado que uma prova foi respondida:
      | numero_prova | nome | cpf | questao_1 | questao_2 |
      | prova_001_001 | João Silva | 123.456.789-00 | a | b |
    E o gabarito é:
      | questao_1 | questao_2 |
      | a | bc |
    Quando eu corrijo a prova em modo flexível
    Então a nota da questão_1 deve ser 10
    E a nota da questão_2 deve ser 5 (50% de acerto)
    E a nota final deve ser 7.5

  Cenário: Corrigir prova com omissão
    Dado que uma prova foi respondida:
      | numero_prova | nome | cpf | questao_1 |
      | prova_001_001 | João Silva | 123.456.789-00 | (vazio) |
    E o gabarito é:
      | questao_1 |
      | a |
    Quando eu corrijo a prova
    Então a prova deve indicar que questão_1 não foi respondida
    E a nota da questão_1 deve ser 0

  Cenário: Validação de CSV - CPF inválido
    Quando eu importo um CSV com CPF inválido
    Então devo receber um erro
    E a mensagem deve indicar CPF em formato inválido

  Cenário: Validação de CSV - Campos obrigatórios
    Quando eu importo um CSV sem a coluna "nome"
    Então devo receber um erro
    E a mensagem deve indicar que "nome" é obrigatório

  Cenário: Registrar resultado da prova
    Dado que uma prova foi corrigida
    Quando eu registro o resultado
    Então o resultado deve ser armazenado no banco de dados
    E o resultado deve incluir:
      | campo |
      | nome do aluno |
      | CPF |
      | nota final |
      | percentual de acerto |
      | modo de correção |
      | data de correção |
