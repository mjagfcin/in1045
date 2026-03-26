# Revisão do experimento de Rebeca de Azevedo Menezes

A revisão deve abordar 2 aspectos:

- A revisão do sistema desenvolvido
- A revisão do histórico do desenvolvimento (prompts)

## Critérios de Revisão

### Sistema

Os critérios de revisão do sistema são:

- O sistema está funcionando com as funcionalidades solicitadas?
- Quais os problemas de qualidade do código e dos testes?
- Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?

### Histórico do Desenvolvimento

Os critérios de revisão do histórico do desenvolvimento são:

- Estratégias de interação utilizada
- Situações em que o agente funcionou melhor ou pior
- Tipos de problemas observados (por exemplo, código incorreto ou inconsistências)
- Avaliação geral da utilidade do agente no desenvolvimento
- Comparação com a sua experiência de uso do agente

## Minhas considerações

### Sistema

Tentei executar o sistema utilizando a opção B do README (Docker), mas houve erro na execução do primeiro comando `docker build -t exam-grading-app .`, sendo necessária a execução de outro comando antes: `npm install`.

Após a execução do `npm install`, tentei nova execução do comando `docker build -t exam-grading-app .`. O erro inicial não ocorreu, mas durante o build do backend foram encontrados erros no código, o que causou nova interrupção do comando.

Tentei executar o sistema utilizando, desta vez, a opção A do README. Os comandos sugeridos executaram com sucesso e o sistema ficou disponível para testes na URL <http://localhost:4000>.

O sistema funcionou e consegui realizar testes exploratórios nas telas de questões, provas e avaliação. A UX (user experience) produzida foi bastante diferente do meu experimento. Também foi possível gerar o relatório de notas da turma. A GUI do sistema está em inglês, diferente da minha que está em português.

Na primeira tentativa de execução dos testes de aceitação obtive erro devido ao uso de uma variável de ambiente não compatível com o Windows (o SO que uso). Tentei corrigir o problema executando o comando `npm i cross-env --save-dev` e depois ajustando o arquivo server/package.jason, mas outro erro apareceu.

Decidi usar o agente do GitHub Copilot para analisar o problema, fazer os devidos ajustes e executar os testes de aceitação. Depois de algumas interações com o agente, ele conseguiu identificar o problema e executar os testes de aceitação com sucesso. Todos os 4 cenários e 24 passos passaram.

A quantidade de cenários/passos foi bem menor que os gerados no meu experimento.

### Histórico do Desenvolvimento

Utilizou um agente diferente do meu. Decidiu por utilizar a língua inglesa, diferente de mim que adotei a língua portuguesa do Brasil mesmo.

No prompt inicial, não solicitou documentação ou planejamento, mas pediu código legível e cuidado com usabilidade. Não deu maiores detalhes sobre as tecnologias a serem utilizadas. Utilizou um prompt mais enxuto, focado na geração inicial do sistema, sem testes de aceitação. Verificou que o resultado gerado não era executável.

Utilizou novos prompts para interagir com o agente para realizar correções/ajustes no código gerado, assim como fiz.

Foi incrementando os requisitos a partir de novas interações com o agente. Essa abordagem me pareceu menos eficiente do que a minha (especificar logo tudo e pedir para produzir a documentação de requisitos) porque pelos registros dos prompts entendi que houve momentos em que o agente fugiu do escopo desejado.

Não identifiquei os momentos de commit e rejeição de arquivos gerados/modificados nos registros do histórico de desenvolvimento.

A quantidade de cenários de testes de aceitação foi consideravelmente menor que a quantidade gerada em meu experimento.

A quantidade de interações com o agente foi cerca de metade das interações que realizei em meu experimento.

### Considerações finais

Entendo que o experimento foi exitoso, pois o sistema gerado atende aos requisitos propostos.

Acredito que o uso de um agente diferente permitiu uma menor quantidade de interações (prompts) para se obter o resultado apresentado.