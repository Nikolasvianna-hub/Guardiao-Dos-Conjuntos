# Gabarito e prova de correção

Os números de cada desafio **não são digitados à mão**: saem de `src/mathgen.js`, que sorteia primeiro os elementos de cada região do diagrama de Venn e só depois calcula os tamanhos dos conjuntos. Por isso o gabarito é correto por construção, e muda a cada tentativa.

## O que cada fase cobra e como a resposta é decidida
| Fase | Conteúdo | Regra de correção (no código) |
|---|---|---|
| 1 | Pertinência e cardinalidade | O portal abre quando o jogador coleta exatamente os \|A\| = n elementos azuis. Cristal vermelho (x ∉ A) é erro. n é sorteado entre 4 e 6. |
| 2 | União, interseção, diferença, complemento | Cada casa da ponte tem duas pedras: uma em região que satisfaz a regra e outra em região que não satisfaz. A resposta é decidida por `satisfies(regra, região)`. |
| 3 | Inclusão e exclusão, 2 conjuntos | Portal abre com \|A∪B\| = \|A\| + \|B\| − \|A∩B\| elementos distintos. Pegar um elemento já contado é erro. |
| 4 | Inclusão e exclusão, 3 conjuntos | Portal abre com \|A∪B∪C\| = \|A\|+\|B\|+\|C\| − \|A∩B\| − \|A∩C\| − \|B∩C\| + \|A∩B∩C\| elementos distintos. |
| 5 | Regiões do Venn (chefe) | O golpe acerta se a região onde o jogador está satisfaz a regra exibida pelo chefe. |

Regras usadas (região → pertence?):
| Região | A∪B | A∩B | A−B | B−A | (A∪B)ᶜ | Aᶜ |
|---|---|---|---|---|---|---|
| só A | sim | não | sim | não | não | não |
| só B | sim | não | não | sim | não | sim |
| A e B | sim | sim | não | não | não | não |
| fora | não | não | não | não | sim | sim |

## Exemplos reais gerados pelo código
- 2 conjuntos: \|A∪B\| = \|A\| + \|B\| − \|A∩B\| = 5 + 5 − 2 = **8** (a soma simples daria 10: erra).
- 2 conjuntos: \|A∪B\| = 4 + 3 − 1 = **6** (soma simples 7).
- 3 conjuntos: \|A∪B∪C\| = 6+8+5 − 4 − 2 − 4 + 2 = **11** (soma simples 19).
- 3 conjuntos: \|A∪B∪C\| = 5+7+5 − 3 − 2 − 3 + 1 = **10** (soma simples 17).

## Prova automática
```bash
node tests/test_mathgen.js
```
O teste roda 20.000 sorteios e verifica 1.140.000 condições: a fórmula de inclusão e exclusão é comparada com a **contagem explícita** dos elementos distintos, os tamanhos de A, B, C e das interseções são conferidos um a um, a soma simples sempre erra (para o jogador não acertar por acaso), e cada casa de ponte tem exatamente uma pedra válida. Resultado atual: **0 falhas**.
