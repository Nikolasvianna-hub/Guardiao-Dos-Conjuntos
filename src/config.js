/* Configuracao global do jogo (editar aqui, sem mexer nas cenas) */
const GDC = {
  // Resolucao interna em PAISAGEM (16:9). O Phaser ajusta a qualquer tela.
  W: 960,
  H: 540,

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
