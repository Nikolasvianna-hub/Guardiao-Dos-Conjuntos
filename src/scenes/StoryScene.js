/* Enredo contado em quadros ilustrados (pouco texto, toque para avancar) */
class StoryScene extends Phaser.Scene {
  constructor() { super('StoryScene'); }
  init(data) { this.epilogue = !!(data && data.epilogue); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(350, 10, 6, 24);
    this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(H / 1376);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.7);
    this.pages = this.epilogue ? [
      { img: 'wizard_cast', text: 'O Olho do Paradoxo se desfez em mil símbolos. Os elementos voltaram às suas ilhas, e cada conjunto reencontrou o seu lugar.' },
      { img: 'emblem', text: 'O Reino dos Conjuntos respirou aliviado. Mas o Paradoxo é feito de dúvidas, e elas sempre voltam. Continue treinando, Guardião!' },
    ] : [
      { img: 'emblem', text: 'No Reino dos Conjuntos, a Torre dos Elementos guarda tudo o que existe: cada cristal, cada livro, cada número. Lá vive o Guardião, mestre da contagem.' },
      { img: 'paradox', text: 'Numa noite sem estrelas, o Paradoxo, um olho faminto de contradições, embaralhou os conjuntos e soltou seus servos em balões sobre a torre.' },
      { img: 'wizard_cast', text: 'Só o Guardião pode defender a torre. Cada balão traz uma pergunta de conjuntos. Desenhe o símbolo certo no ar e o feitiço faz o servo explodir!' },
      { img: 'wizard_idle', text: 'Defenda a torre em 5 fases e derrote o Olho do Paradoxo. Cuidado: se os balões chegarem à linha dourada, você perde um coração!' },
    ];
    this.i = 0;
    this.dots = this.pages.map((_, k) => this.add.circle(W / 2 - (this.pages.length - 1) * 14 + k * 28, H - 40, 7, GDC.C.gold));
    this.pic = this.add.image(W / 2, 270, this.pages[0].img);
    this.panel = GDC.UI.panel(this, W / 2, 680, 500, 380);
    this.txt = this.add.text(W / 2, 680, '', { fontFamily: GDC.FONT_BODY, fontSize: '22px', color: GDC.CSS.cream, align: 'center', lineSpacing: 8, wordWrap: { width: 310 } }).setOrigin(0.5);
    this.hint = this.add.text(W / 2, H - 80, 'toque para continuar', { fontFamily: GDC.FONT_BODY, fontSize: '20px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: this.hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    const skip = GDC.UI.button(this, W - 90, 44, 'PULAR', { width: 150, height: 46, fontSize: 22, onClick: () => this.end() });
    skip.setDepth(10);
    this.show(0);
    this.input.on('pointerup', (p) => { if (p.y > 90 || p.x < W - 180) this.next(); });
    this.input.keyboard.on('keydown-SPACE', () => this.next());
    this.input.keyboard.on('keydown-ENTER', () => this.next());
  }

  show(i) {
    const pg = this.pages[i];
    this.pic.setTexture(pg.img);
    this.pic.setScale(Math.min(330 / this.pic.height, 380 / this.pic.width));
    this.pic.setAlpha(0).setY(300);
    this.tweens.add({ targets: this.pic, alpha: 1, y: 270, duration: 380, ease: 'Cubic.easeOut' });
    this.txt.setText(pg.text).setAlpha(0);
    this.tweens.add({ targets: this.txt, alpha: 1, duration: 400 });
    this.dots.forEach((d, k) => d.setFillStyle(k === i ? GDC.C.gold : GDC.C.grey));
  }

  next() {
    if (this.leaving) return;
    this.i++;
    if (this.i >= this.pages.length) return this.end();
    GDC.Audio.sfx(this, 'click');
    this.show(this.i);
  }

  end() {
    if (this.leaving) return;
    this.leaving = true;
    if (this.epilogue) GDC.UI.goTo(this, 'MenuScene');
    else GDC.UI.goTo(this, 'MagicScene', { index: 0 });
  }
}
