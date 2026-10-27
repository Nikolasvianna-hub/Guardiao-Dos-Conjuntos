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

A ideia é facilitar o aprendizado de matemática para jovens em ambientes escolares, transformando o estudo de conjuntos em uma experiência lúdica, acessível e envolvente. O jogo roda direto no navegador, sem instalação, e funciona em computador e celular.

## 📚 Conteúdo matemático

> **Conteúdo sorteado:** _[PREENCHER: ex. "1. Conjuntos (definição, operações: união, interseção, complemento, subconjuntos)"]_

O jogador pratica, em desafios de nível Ensino Médio:

- _[PREENCHER: ex. união e interseção de conjuntos]_
- _[PREENCHER: ex. complemento e subconjuntos]_
- _[PREENCHER: ex. cardinalidade e diagramas de Venn]_

O gabarito completo das questões está em [`docs/gabarito.md`](docs/gabarito.md).

## 🧙 Enredo

_[PREENCHER: conte a história do jogo em 1 ou 2 parágrafos. Quem é o guardião? Qual é a ameaça? Por que os conjuntos importam nessa história?]_

> Pelo nome dos arquivos do jogo, o protagonista parece ser um mago (`wizard`) que enfrenta um Paradoxo (`paradox`). Se for isso, vale usar essa ideia como base.

Versão completa em [`docs/enredo.md`](docs/enredo.md).

## 🕹️ Como jogar

1. Abra o [link do jogo](https://nikolasvianna-hub.github.io/Guardiao-Dos-Conjuntos/).
2. No menu, clique em **Jogar**.
3. _[PREENCHER: explique o objetivo, como responder às questões e como o jogador ganha ou perde.]_

O botão de ajuda (**?**) dentro do jogo mostra as instruções a qualquer momento. As regras detalhadas estão em [`docs/instrucoes.md`](docs/instrucoes.md).

| Controle | Ação |
| --- | --- |
| Clique / toque | _[PREENCHER]_ |
| Ícone de som / música | Liga e desliga efeitos e trilha |
| Ícone de engrenagem | Abre as configurações |

## 👥 Equipe

| Nome | Função |
| --- | --- |
| Nikolas Vianna | _[PREENCHER: ex. programação]_ |
| _[PREENCHER]_ | _[PREENCHER]_ |

**Disciplina:** Matemática Discreta · **Professor:** _[PREENCHER]_

## 🗂️ Estrutura do repositório

```
.
├── .github/workflows/   # publicação automática no GitHub Pages
├── data/                # banco de questões
├── docs/
│   ├── slides/          # slides da apresentação
│   ├── av3-feedback/    # resultados dos testes de usabilidade
│   ├── enredo.md
│   ├── instrucoes.md
│   └── gabarito.md
├── src/                 # código-fonte do jogo (esta pasta é publicada)
│   ├── index.html
│   ├── assets/img/      # imagens e sprites
│   ├── fonts/
│   ├── lib/             # Phaser
│   └── scenes/          # cenas do jogo
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

Os resultados e melhorias feitas a partir do feedback dos usuários serão documentados em [`docs/av3-feedback/`](docs/av3-feedback/).

## 📄 Créditos e licenças

- Fonte **Press Start 2P** sob licença OFL (veja [`src/fonts/OFL.txt`](src/fonts/OFL.txt))
- **Phaser** sob licença MIT
