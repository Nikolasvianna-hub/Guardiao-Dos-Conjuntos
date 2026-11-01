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

A ideia é facilitar o aprendizado de matemática para jovens em ambientes escolares, transformando o estudo de conjuntos em uma aventura de plataforma 2D com visual de desenho animado. A matemática é a **mecânica**: portas, pontes e chefe dependem de conjuntos. O jogo roda direto no navegador, sem instalação, em computador e celular (em paisagem).

## 📚 Conteúdo matemático

O jogo trabalha pertinência, cardinalidade, união, interseção, diferença, complemento, regiões de diagramas de Venn e o princípio da inclusão e exclusão com dois e três conjuntos.

Os números de cada desafio são gerados por código e provados por teste (`node tests/test_mathgen.js`). Veja [`docs/gabarito.md`](docs/gabarito.md).

## 🧙 Enredo

O Guardião, mestre da contagem, protege o Reino dos Conjuntos. O Paradoxo, um olho faminto de contradições, embaralhou os elementos e trancou os portais. Para restaurar a ordem, o Guardião atravessa 5 regiões usando conjuntos como magia.

Versão completa em [`docs/enredo.md`](docs/enredo.md).

## 🕹️ Como jogar

1. Abra o [link do jogo](https://nikolasvianna-hub.github.io/Guardiao-Dos-Conjuntos/) (no celular, gire para paisagem).
2. Toque em **Jogar** e acompanhe a história.
3. Em cada fase, resolva o desafio de conjuntos e entre no portal. 5 fases: cardinalidade, pontes de Venn, inclusão e exclusão (2 e 3 conjuntos) e o chefe.
4. Erros custam um coração. Perdeu todos? A fase recomeça com números novos.

| Ação | Teclado | Celular |
| --- | --- | --- |
| Andar | setas / A D | ◀ ▶ |
| Pular | espaço / ↑ | ▲ |
| Conjurar | Z / X | ✦ |
| Dica | ícone (?) | ícone (?) |

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
├── tests/               # prova do gabarito (node tests/test_mathgen.js)
├── src/                 # código-fonte do jogo (esta pasta é publicada)
│   ├── index.html
│   ├── assets/img/      # desenhos (estilo desenho animado anos 30)
│   ├── fonts/
│   ├── lib/             # Phaser
│   ├── scenes/          # Boot, Menu, História, Seleção de fases, Plataforma
│   ├── levels.js        # as 5 fases e suas mecânicas
│   ├── mathgen.js       # gerador de desafios e gabarito
│   └── controls.js      # teclado, gamepad e botões de toque
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
