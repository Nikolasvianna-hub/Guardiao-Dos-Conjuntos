/* Configuracao global do jogo (editar aqui, sem mexer nas cenas) */
const GDC = {
  // Resolucao interna em RETRATO (9:16), como no Magic Touch. O Phaser ajusta a qualquer tela.
  W: 540,
  H: 960,

  FONT: '"Mouse Memoirs", "Lilita One", Impact, sans-serif',
  FONT_BODY: '"Lilita One", "Segoe UI", Roboto, Arial, "Noto Sans Math", "Cambria Math", "Segoe UI Symbol", "DejaVu Sans", sans-serif',

  // Paleta (identidade "tinta e pergaminho", contornos grossos)
  C: { ink: 0x0a0618, indigo: 0x1B1F4B, violet: 0x5B3FA0, gold: 0xF2B84B, cyan: 0x4FD1E8, red: 0xE5484D,
       night: 0x0d0f26, cream: 0xFFF3D1, teal: 0x5fd6c4, grey: 0x6b6f8f, lilac: 0x8a5cf0 },
  CSS: { ink: '#0a0618', indigo: '#1B1F4B', violet: '#5B3FA0', gold: '#F2B84B', cyan: '#4FD1E8', red: '#E5484D',
         cream: '#FFF3D1', soft: '#dfe6ff', dim: '#9aa0c8', green: '#7be08a' },

  // Cores das regioes do diagrama de Venn (as mesmas em todo o jogo)
  REGION_COLOR: { A: 0x4FD1E8, B: 0x8a5cf0, AB: 0xF2B84B, O: 0x6b6f8f, C: 0x7be08a },

  // Jogo
  LIVES: 5,
  SHOW_QUIT: true,
};

// Textos de ajuda usados no menu e dentro da fase
GDC.HOWTO =
  '1. Inimigos descem presos a balões. Cada balão traz um desafio de conjuntos.\n' +
  '2. Resolva o desafio e DESENHE a resposta com o dedo (ou mouse), em qualquer lugar da tela: um símbolo (∪ ∩ ∈ ⊂ ∅) ou um número de 1 a 9.\n' +
  '3. Acertou: o inimigo explode. O alvo é sempre o mais baixo.\n' +
  '4. Se um inimigo passar da linha de defesa, você perde um coração. Com 0, a fase recomeça.\n' +
  '5. Botão ? mostra o traço certo (dicas podem ser desligadas nas Opções).';
GDC.GLOSSARY =
  '∪  união: está em A ou em B\n' +
  '∩  interseção: está em A e em B\n' +
  '∈  pertence: x ∈ A\n' +
  '⊂  está contido: A ⊂ B\n' +
  '∅  conjunto vazio\n' +
  '−  diferença: A − B\n' +
  '|A|  cardinalidade: quantos elementos\n' +
  'Aᶜ  complemento: o que está fora de A\n\n' +
  '|A ∪ B| = |A| + |B| − |A ∩ B|\n' +
  '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|\n\n' +
  'Dígitos 1 a 9: desenhe o número quando o balão pedir uma contagem.';
