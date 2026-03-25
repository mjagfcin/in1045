# language: pt
Funcionalidade: Gerenciar Questões
  Como um professor
  Quero gerenciar questões de múltipla escolha
  Para criar provas personalizadas

  Cenário: Criar uma questão com sucesso
    Quando eu crio uma questão com:
      | enunciado | Qual é a capital da França? |
      | alternativas | [{"descricao": "Paris", "correta": true}, {"descricao": "Lyon", "correta": false}] |
    Então a questão deve ser criada com sucesso
    E a questão deve ter 2 alternativas

  Cenário: Listar todas as questões
    Quando eu solicito a lista de questões
    Então devo receber uma lista de questões
    E a lista deve estar paginada

  Cenário: Atualizar uma questão existente
    Dado que existe uma questão cadastrada
    Quando eu atualizei a questão com:
      | enunciado | Qual é a capital da Itália? |
    Então a questão deve ser atualizada
    E o novo enunciado deve ser "Qual é a capital da Itália?"

  Cenário: Deletar uma questão
    Dado que existe uma questão cadastrada
    Quando eu deleto a questão
    Então a questão deve ser marcada como inativa
    E não deve aparecer mais nas listagens

  Cenário: Validação - Questão sem alternativas correta
    Quando eu tento criar uma questão sem alternativa correta
    Então devo receber um erro de validação
    E a mensagem deve indicar que é necessário uma alternativa correta

  Cenário: Validação - Questão com menos de 2 alternativas
    Quando eu tento criar uma questão com apenas 1 alternativa
    Então devo receber um erro de validação
    E a mensagem deve indicar que o mínimo é 2 alternativas

  Cenário: Buscar questões por palavra-chave
    Dado que existem as seguintes questões:
      | enunciado |
      | Qual é a capital da França? |
      | Qual é a capital da Itália? |
      | Qual é a população do Brasil? |
    Quando eu busco questões com a palavra "capital"
    Então devo receber 2 questões
