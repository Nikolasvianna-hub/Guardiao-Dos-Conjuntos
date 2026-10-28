class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super('ModeSelectScene');
  }

  create() {
    const { W, H } = GDC;
    GDC.Audio.playMusic(this, 'musicMenu');
    const background = this.add.image(W / 2, H / 2, 'menu_scene');
    background.setScale(Math.max(W / background.width, H / background.height));
    background.setAlpha(0.58);
    this.add.rectangle(W / 2, H / 2, W, H, 0x080b1c, 0.72);

    const title = GDC.UI.title(this, W / 2, 130, 'ESCOLHA SEU\nDESAFIO', 22);
    const subtitle = this.add.text(W / 2, 255, 'Toque em um modo para comecar.', {
      fontFamily: GDC.FONT_BODY,
      fontSize: '21px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    title.setAlpha(0).setY(148);
    subtitle.setAlpha(0);
    this.tweens.add({ targets: title, y: 130, alpha: 1, duration: 550, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 550, delay: 160 });

    const modes = [
      { label: 'QUIZ COM TEMPO', mode: 'timed', icon: 'icon_play' },
      { label: 'QUIZ SEM TEMPO', mode: 'relaxed', icon: 'icon_book' },
      { label: 'DESENHO DE SIMBOLOS', mode: 'draw', icon: 'icon_gear' },
    ];
    modes.forEach((item, index) => {
      const y = 410 + index * 132;
      const button = GDC.UI.button(this, W / 2, y + 24, item.label, {
        width: 390,
        height: 92,
        fontSize: 13,
        icon: item.icon,
        onClick: () => GDC.UI.goTo(this, 'GameScene', { mode: item.mode }),
      });
      button.setAlpha(0);
      this.tweens.add({
        targets: button,
        y,
        alpha: 1,
        duration: 420,
        delay: 180 + index * 100,
        ease: 'Back.easeOut',
      });
    });

    GDC.UI.button(this, W / 2, H - 74, 'VOLTAR', {
      width: 260,
      height: 68,
      fontSize: 13,
      icon: 'icon_close',
      soundKey: 'sfxBack',
      onClick: () => GDC.UI.goTo(this, 'MenuScene'),
    });
  }
}