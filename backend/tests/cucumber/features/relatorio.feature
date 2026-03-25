# language: pt
Funcionalidade: Gerar Relatórios de Notas
  Como um professor
  Quero gerar relatórios de notas por turma
  Para acompanhar o desempenho dos alunos

  Cenário: Gerar relatório de uma prova
    Dado que existem 30 resultados corrigidos para uma prova
    Quando eu gero o relatório de notas
    Então um relatório deve ser criado
    E o relatório deve conter:
      | informação |
      | Título da prova |
      | Disciplina |
      | Professor |
      | Data da prova |
      | Lista de alunos com notas |

  Cenário: Relatório deve conter lista detalhada
    Dado que existem resultados corrigidos
    Quando eu gero o relatório
    Então o relatório deve listar cada aluno com:
      | coluna |
      | Nome |
      | CPF |
      | Número da prova individual |
      | Nota final |
      | Percentual de acerto |
      | Modo de correção |
      | Data de correção |

  Cenário: Relatório deve conter estatísticas
    Dado que existem 30 alunos com notas: 9, 8, 7, 6, 5, ...
    Quando eu gero o relatório
    Então o relatório deve incluir:
      | estatística |
      | Média de notas |
      | Desvio padrão |
      | Nota máxima |
      | Nota mínima |
      | Percentual de aprovação (>=6) |

  Cenário: Exportar relatório em CSV
    Dado que um relatório foi gerado
    Quando eu exporto em formato CSV
    Então um arquivo CSV deve ser criado
    E o CSV deve ter uma linha por aluno
    E cada linha deve conter nome, CPF, nota, percentual

  Cenário: Exportar relatório em PDF
    Dado que um relatório foi gerado
    Quando eu exporto em formato PDF
    Então um arquivo PDF deve ser criado
    E o PDF deve ter formatação legível
    E o PDF deve conter cabeçalho com dados da prova

  Cenário: Relatório reflete correção em modo rigoroso
    Dado que provas foram corrigidas em modo rigoroso
    Quando eu gero o relatório
    Então o relatório deve indicar "Modo: Rigoroso"
    E as notas devem refletir a correção rigorosa

  Cenário: Relatório reflete correção em modo flexível
    Dado que provas foram corrigidas em modo flexível
    Quando eu gero o relatório
    Então o relatório deve indicar "Modo: Flexível"
    E as notas devem refletir a correção flexível

  Cenário: Calcular percentual de aprovação
    Dado que existem 30 alunos com os seguintes padrões:
      | Notas >= 6.0 | 25 alunos |
      | Notas < 6.0 | 5 alunos |
    Quando eu gero o relatório
    Então o percentual de aprovação deve ser 83.33%
