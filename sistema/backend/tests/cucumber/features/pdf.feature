# language: pt
Funcionalidade: Gerar PDFs de Provas
  Como um professor
  Quero gerar múltiplos PDFs individualizados de uma prova
  Para distribuir aos alunos

  Cenário: Gerar 30 PDFs com sucesso
    Dado que existe uma prova cadastrada
    Quando eu gero 30 PDFs da prova
    Então 30 arquivos PDF devem ser criados
    E cada PDF deve ter um identificador único
    E cada PDF deve ter cabeçalho com disciplina, professor e data

  Cenário: PDFs com randomização de questões
    Dado que existe uma prova com 5 questões
    Quando eu gero 3 PDFs
    Então cada PDF deve ter as questões em ordem diferente
    E os PDFs não devem ter a mesma ordem de questões

  Cenário: PDFs com randomização de alternativas
    Dado que existe uma prova
    Quando eu gero 3 PDFs
    Então em cada questão as alternativas devem estar em ordem diferente
    E os PDFs não devem ter a mesma ordem de alternativas

  Cenário: PDF com cabeçalho e rodapé corretos
    Dado que existe uma prova
    Quando eu gero um PDF
    Então o PDF deve conter:
      | elemento | valor |
      | título | Prova 1 - Geografia |
      | disciplina | Geografia Geral |
      | professor | Prof. João da Silva |
      | data | 15/04/2026 |
      | rodapé | prova_001_001 |

  Cenário: PDF com espaço para resposta (letras)
    Dado que existe uma prova com esquema "letras"
    Quando eu gero um PDF
    Então cada questão deve ter espaço para o aluno escrever as letras

  Cenário: PDF com espaço para resposta (potências)
    Dado que existe uma prova com esquema "potências de 2"
    Quando eu gero um PDF
    Então cada questão deve ter espaço para o aluno informar o somatório

  Cenário: PDF com identificação do aluno
    Dado que existe uma prova
    Quando eu gero um PDF
    Então o final do PDF deve ter:
      | campo |
      | Nome |
      | CPF |

  Cenário: Gerar gabarito em CSV
    Dado que 30 PDFs foram gerados
    Quando eu gero o CSV de gabarito
    Então um arquivo CSV deve ser criado
    E cada linha deve conter:
      | coluna |
      | numero_prova |
      | questao_1 |
      | questao_2 |
      | ... |

  Cenário: Validação - Quantidade inválida de PDFs
    Quando eu tento gerar 0 PDFs
    Então devo receber um erro
    E a mensagem deve indicar que o mínimo é 1 PDF

  Cenário: Validação - Quantidade acima do limite
    Quando eu tento gerar 1001 PDFs
    Então devo receber um erro
    E a mensagem deve indicar que o máximo é 1000 PDFs
