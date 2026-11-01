/* Carrega os desenhos e mostra a barra de progresso */
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const { W, H } = GDC;
    this.add.rectangle(W / 2, H / 2, W, H, GDC.C.night);
    GDC.UI.title(this, W / 2, H / 2 - 60, 'Carregando...', 48);
    const frame = this.add.rectangle(W / 2, H / 2 + 20, 420, 28, GDC.C.ink).setStrokeStyle(4, GDC.C.gold);
    const bar = this.add.rectangle(W / 2 - 206, H / 2 + 20, 4, 18, GDC.C.cyan).setOrigin(0, 0.5);
    this.load.on('progress', (p) => { bar.width = Math.max(4, 412 * p); });
    this.load.setPath('assets/img/');
    this.load.image('bg_tower', 'bg_tower.jpg');
    ['wizard_idle', 'wizard_cast', 'paradox', 'emblem', 'panel', 'glow',
      'crys_a', 'crys_b', 'crys_ab', 'star', 'book', 'scroll', 'letter_a', 'omega',
      'spark_big', 'spark_small', 'spark_star',
      'icon_play', 'icon_door', 'icon_gear', 'icon_book', 'icon_sound', 'icon_music', 'icon_close', 'icon_help',
    ].forEach((k) => this.load.image(k, k + '.png'));
  }

  create() {
    GDC.UI.buildVenn(this);
    this.scene.start('MenuScene');
  }
}
