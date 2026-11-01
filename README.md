<div align="center">

<img width="394" height="341" alt="image" src="https://github.com/user-attachments/assets/473854a6-ee4c-4fb7-96a6-cddace3ddc94" />

# 🧙 Guardião dos Conjuntos

**Jogo educativo de Matemática para o Ensino Médio**

![Phaser](https://img.shields.io/badge/Phaser-3-8A2BE2)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Deploy](https://img.shields.io/badge/GitHub%20Pages-online-2ea44f?logo=github)

### [▶️ JOGAR AGORA](https://nikolasvianna-hub.github.io/Guardiao-Dos-Conjuntos/)

</div>

---

## 📖 Sobre o projeto

**Guardião dos Conjuntos** é um jogo desenvolvido como **Projeto Aplicado** da disciplina de Matemática Discreta, no curso de **Análise e Desenvolvimento de Sistemas** da **Universidade de Fortaleza (UNIFOR)**, semestre **2026.2**.

A ideia é facilitar o aprendizado de matemática para jovens em ambientes escolares, no estilo do clássico **Magic Touch**: inimigos descem presos a balões, cada balão traz um desafio de conjuntos e o jogador **desenha o símbolo da resposta** (∪, ∩, ∈, ⊂, ∅ ou um dígito) com o dedo para o inimigo explodir. O jogo roda direto no navegador, sem instalação, no celular (em pé) e no computador.

## 📚 Conteúdo matemático

O jogo trabalha os símbolos do glossário (união, interseção, pertence, está contido, conjunto vazio, diferença), diagramas de Venn, cardinalidade e o princípio da inclusão e exclusão.

Todas as respostas são geradas por código a partir de conjuntos reais e provadas por teste (`node tests/test_challenges.js`). Veja [`docs/gabarito.md`](docs/gabarito.md).

## 🧙 Enredo

O Guardião, mestre da contagem, protege a Torre dos Elementos. O Paradoxo, um olho faminto de contradições, soltou seus servos em balões sobre a torre. Para defendê-la, o Guardião desenha símbolos de conjuntos no ar e o feitiço faz cada servo explodir.

Versão completa em [`docs/enredo.md`](docs/enredo.md).

## 🕹️ Como jogar

1. Abra o [link do jogo](https://nikolasvianna-hub.github.io/Guardiao-Dos-Conjuntos/) (no celular, deixe em pé).
2. Toque em **Jogar** e acompanhe a história.
3. Leia o balão do inimigo mais baixo e **desenhe o símbolo** que responde ao desafio. O botão **?** mostra o traço certo.
4. São 5 fases: símbolos, pertinência e união, cardinalidade, inclusão e exclusão e o chefão. Balão que passa da linha dourada custa um coração.

| Símbolo | Como desenhar | Aparece quando |
| --- | --- | --- |
| ∪ | um U | união |
| ∩ | um U de cabeça para baixo | interseção |
| ∈ | um E deitado para a esquerda (ε) | pertence |
| ⊂ | um C | está contido |
| ∅ | um círculo cortado por uma barra | conjunto vazio |
| − | uma linha reta | diferença |
| 1 a 9 | o número | cardinalidade e inclusão e exclusão |

Instruções completas em [`docs/instrucoes.md`](docs/instrucoes.md). Roteiro da apresentação em [`docs/roteiro_apresentacao.md`](docs/roteiro_apresentacao.md).

## 👥 Equipe

| Nome | Função |
| --- | --- |
| Nikolas Vianna | Desenvolvimento do jogo |
| _[PREENCHER]_ | _[PREENCHER]_ |

**Disciplina:** Matemática Discreta · **Professor:** _[PREENCHER]_

## 🗂️ Estrutura do repositório

```
.
├── .github/workflows/   # publicação automática no GitHub Pages
├── docs/
│   ├── enredo.md
│   ├── instrucoes.md
│   ├── gabarito.md
│   └── roteiro_apresentacao.md
├── tests/               # prova do gabarito (node tests/test_challenges.js e tests/test_gestures.js)
├── src/                 # código-fonte do jogo (esta pasta é publicada)
│   ├── index.html
│   ├── assets/img/      # desenhos (estilo desenho animado anos 30)
│   ├── fonts/
│   ├── lib/             # Phaser
│   ├── scenes/          # Boot, Menu, História, Seleção de fases, Magic (jogo)
│   ├── gestures.js      # reconhecedor de traços (símbolos e dígitos)
│   └── challenges.js    # gerador de desafios e gabarito
└── README.md
```

## 💻 Rodar localmente

O jogo precisa de um servidor local para carregar os arquivos. Com Python instalado:

```bash
git clone https://github.com/Nikolasvianna-hub/Guardiao-Dos-Conjuntos.git
cd Guardiao-Dos-Conjuntos/src
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## 🛠️ Tecnologias

- [Phaser 3](https://phaser.io/) para o motor do jogo
- JavaScript e HTML5
- GitHub Pages e GitHub Actions para publicação

## 🧪 Teste de usabilidade (AV3)

Os resultados e melhorias feitas a partir do feedback dos usuários serão documentados em `docs/av3-feedback/` (a criar na AV3).

## 📄 Créditos e licenças

- Fontes **Mouse Memoirs** e **Lilita One** sob licença OFL (veja `src/fonts/OFL-*.txt`)
- **Phaser** sob licença MIT
