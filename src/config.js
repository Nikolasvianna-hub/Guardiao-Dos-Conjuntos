/* Configuração global do jogo (editar aqui, sem mexer nas cenas) */
const GDC = {
  // Resolução interna do jogo (retrato 9:16). O Phaser ajusta à tela do aparelho.
  W: 540,
  H: 960,

  // Fundo do menu em vídeo.
  // 1) Coloque o arquivo em assets/video/menu_loop.mp4
  // 2) Troque USE_VIDEO para true
  // 3) Se o vídeo já tiver o mago desenhado, troque SHOW_WIZARD_OVERLAY para false
  USE_VIDEO: false,
  VIDEO_FILE: 'assets/video/menu_loop.mp4',
  SHOW_WIZARD_OVERLAY: true,

  // Botão SAIR. No navegador não dá para fechar a aba, então confirmar volta
  // para a tela "Toque para começar". Troque para false para esconder o botão.
  SHOW_QUIT: true,

  FONT: '"Press Start 2P", monospace',
  FONT_BODY: '"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Math", "Cambria Math", "Segoe UI Symbol", "DejaVu Sans", sans-serif',

  // Paleta (a mesma do guia de organização)
  C: { indigo: 0x1B1F4B, violet: 0x5B3FA0, gold: 0xF2B84B, cyan: 0x4FD1E8, red: 0xE5484D, night: 0x0d0f26, slate: 0x2a2f6b },
  CSS: { indigo: '#1B1F4B', violet: '#5B3FA0', gold: '#F2B84B', cyan: '#4FD1E8', red: '#E5484D', soft: '#cfd8ff', dim: '#8a90b8' },

  AUDIO: {
    musicMenu: null,
    musicGame: null,
    sfxClick: null,
    sfxBack: null,
    sfxVictory: null,
  },

  videoFailed: false,
};
