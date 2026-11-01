/* Ponto de entrada: espera as fontes e cria o jogo */
GDC.Settings.load();

Promise.all([
  document.fonts.load('48px "Mouse Memoirs"'),
  document.fonts.load('24px "Lilita One"'),
]).catch(() => {}).then(() => {
  window.GDC_GAME = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GDC.W,
    height: GDC.H,
    backgroundColor: '#0d0f26',
    pixelArt: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 4, gamepad: true },
    scene: [BootScene, MenuScene, StoryScene, LevelSelectScene, MagicScene],
  });
});
