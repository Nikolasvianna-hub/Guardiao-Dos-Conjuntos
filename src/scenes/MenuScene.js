class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { W, H } = GDC;

    // fundo cobrindo a tela
    const bg = this.add.image(W / 2, H / 2, 'menu_scene');
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    const s = bg.scaleX;

    // mago em cima do penhasco, à esquerda da torre
    const wiz = this.add.image(
      W / 2 + (135 - bg.width / 2) * s,
      H / 2 + (536 - bg.height / 2) * s,
      'wizard_idle'
    ).setOrigin(0.5, 1);
    wiz.setScale((130 / wiz.height) * s);

    GDC.UI.title(this, W / 2, 62, 'GUARDIÃO\nDOS CONJUNTOS', 26);

    const items = [
      ['JOGAR', 'icon_play'], ['OPÇÕES', 'icon_gear'],
      ['ESTUDOS', 'icon_book'], ['SAIR', 'icon_door'],
    ];
    items.forEach(([label, icon], i) => {
      GDC.UI.button(this, W / 2, 600 + i * 96, label, {
        icon: icon,
        onClick: () => console.log('clicou em', label),
      });
    });
  }
}