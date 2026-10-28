class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const { W, H } = GDC;
    this.add.rectangle(W / 2, H / 2, 300, 16, GDC.C.slate).setStrokeStyle(2, GDC.C.gold);
    const bar = this.add.rectangle(W / 2 - 148, H / 2, 296, 10, GDC.C.cyan).setOrigin(0, 0.5);
    bar.setScale(0, 1);
    this.load.on('progress', (v) => bar.setScale(v, 1));

    ['menu_scene', 'wizard_idle', 'btn_normal',
      'icon_play', 'icon_gear', 'icon_book', 'icon_door', 'icon_close'].forEach((k) => {
      this.load.image(k, 'assets/img/' + k + '.png');
    });
  }

  create() { this.scene.start('MenuScene'); }
}