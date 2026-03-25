# language: pt
Funcionalidade: Gerenciar Provas
  Como um professor
  Quero criar e gerenciar provas combinando questões
  Para aplicar avaliações aos alunos

  Cenário: Criar uma prova com sucesso
    Dado que existem questões cadastradas
    Quando eu crio uma prova com:
      | titulo | Prova 1 - Geografia |
      | disciplina | Geografia Geral |
      | professor | Prof. João da Silva |
      | dataProva | 2026-04-15 |
      | esquemaAlternativas | letras |
      | questoes | [primeiro_id, segundo_id, terceiro_id] |
    Então a prova deve ser criada com sucesso
    E a prova deve conter 3 questões

  Cenário: Escolher esquema de alternativas - Letras
    Dado que eu estou criando uma prova
    Quando eu seleciono o esquema de alternativas "letras"
    Então as alternativas serão identificadas como a, b, c, d, etc

  Cenário: Escolher esquema de alternativas - Potências de 2
    Dado que eu estou criando uma prova
    Quando eu seleciono o esquema de alternativas "potências de 2"
    Então as alternativas serão identificadas como 1, 2, 4, 8, etc

  Cenário: Editar uma prova
    Dado que existe uma prova cadastrada
    Quando eu edito a prova alterando o título para "Prova 1 - Geografia (revisada)"
    Então a prova deve ser atualizada
    E o novo título deve ser "Prova 1 - Geografia (revisada)"

  Cenário: Deletar uma prova
    Dado que existe uma prova cadastrada
    Quando eu deleto a prova
    Então a prova deve ser marcada como inativa
    E não deve aparecer mais nas listagens

  Cenário: Listar provas por disciplina
    Dado que existem provas de diferentes disciplinas
    Quando eu busco provas da disciplina "Geografia"
    Então devo receber apenas provas de Geografia

  Cenário: Validação - Prova sem questões
    Quando eu tento criar uma prova sem questões
    Então devo receber um erro
    E a mensagem deve indicar que é necessário pelo menos 1 questão
