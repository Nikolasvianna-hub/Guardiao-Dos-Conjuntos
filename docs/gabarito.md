# Gabarito e prova de correção

Nenhuma resposta é digitada à mão. `src/challenges.js` monta cada desafio a partir de conjuntos reais e calcula a resposta por código. Os números mudam a cada partida.

## Tipos de desafio e regra de resposta
| Tipo | Exemplo no balão | Resposta | Regra |
|---|---|---|---|
| Nome do símbolo | "A ? B, união" | ∪ | glossário |
| Venn sombreado | A e B inteiros pintados | ∪ | região pintada |
| Venn sombreado | só a interseção pintada | ∩ | região pintada |
| Venn sombreado | só A pintado | − | A menos B |
| Venn aninhado | A dentro de B | ⊂ | todo elemento de A está em B |
| Venn separado | "A ∩ B = ?" círculos separados | ∅ | sem elemento em comum |
| Pertinência | "3 ? {1, 3, 5}" | ∈ | 3 está na lista |
| Inclusão | "{1, 3} ? {1, 3, 5}" | ⊂ | todo elemento de T está em S, com T menor |
| Operação | "{1,2} ? {2,3} = {1,2,3}" | ∪ | resultado mostrado é a união (nunca igual à interseção) |
| Operação | "{1,2} ? {2,3} = {2}" | ∩ | resultado mostrado é a interseção |
| Vazio | "{1,2} ∩ {3,4} = ?" | ∅ | nenhum elemento em comum |
| Cardinalidade | "\|{a, b, c, b}\| = ?" | 3 | conta elementos distintos |
| Cardinalidade | "A={..} B={..} \|A ∩ B\| = ?" | dígito | conta elementos em comum |
| Inclusão e exclusão | "\|A\|=5 \|B\|=4 \|A∩B\|=2 \|A∪B\|=?" | 7 | 5 + 4 − 2 |
| Inclusão e exclusão | "\|A\|=5 \|B\|=4 \|A∪B\|=7 \|A∩B\|=?" | 2 | 5 + 4 − 7 |
| Inclusão e exclusão | "\|A − B\| = ?" | dígito | \|A\| − \|A∩B\| |

| Complemento | "\|U\| = 8  \|A\| = 3  \|Aᶜ\| = ?" | 5 | \|U\| − \|A\| |
| Inclusão e exclusão (3 conjuntos) | "\|A\|=5 \|B\|=4 \|C\|=4, interseções dadas, \|A∪B∪C\|=?" | dígito | \|A\|+\|B\|+\|C\| − \|A∩B\| − \|A∩C\| − \|B∩C\| + \|A∩B∩C\| |
| Inclusão e exclusão (3 conjuntos) | mesma fórmula, perguntando \|A∩B∩C\| | dígito | isola a interseção tripla |
| Problema contextualizado | "7 alunos gostam de futebol, 4 de vôlei e 2 de ambas. Quantos gostam de pelo menos uma?" | 9 | 7 + 4 − 2 |
| Problema contextualizado | "...só de futebol?" | 5 | 7 − 2 |
| Problema contextualizado | "A turma tem 9... não gostam de nenhuma?" | dígito | total − união |

Respostas numéricas ficam sempre entre 1 e 9 (dígito desenhável).

## Prova automática
```bash
node tests/test_challenges.js   # 6 fases x 3000 sementes, incluindo conjuntos reais montados região a região para 3 conjuntos e problemas de turma, recontando com conjuntos reais
node tests/test_gestures.js     # taxa de acerto do reconhecedor com traços simulados e tremidos
```
O teste confere cada resposta por uma contagem independente, rejeita resultado ambíguo (união igual à interseção), dígito zero e travessão nos textos.
