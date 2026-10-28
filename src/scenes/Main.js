GDC.Settings.load();

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GDC.W,
  height: GDC.H,
  backgroundColor: '#0d0f26',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, MenuScene, ModeSelectScene, GameScene],
};

// espera a fonte pixel carregar antes de iniciar
document.fonts.load('16px "Press Start 2P"').finally(() => {
  GDC.game = new Phaser.Game(config);
});