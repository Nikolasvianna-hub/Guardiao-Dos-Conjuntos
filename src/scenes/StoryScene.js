/* Enredo contado em quadros ilustrados (pouco texto, toque para avancar) */
class StoryScene extends Phaser.Scene {
  constructor() { super('StoryScene'); }
  init(data) { this.epilogue = !!(data && data.epilogue); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(350, 10, 6, 24);
    const bg = this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(1.4);
    bg.y = 270 - 300 * 1.4;
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.7);
    this.pages = this.epilogue ? [
      { img: 'wizard_cast', text: 'O Olho do Paradoxo se desfez em mil símbolos. Os elementos voltaram às suas ilhas, e cada conjunto reencontrou o seu lugar.' },
      { img: 'emblem', text: 'O Reino dos Conjuntos respirou aliviado. Mas o Paradoxo é feito de dúvidas, e elas sempre voltam. Continue treinando, Guardião!' },
    ] : [
      { img: 'emblem', text: 'No Reino dos Conjuntos, a Torre dos Elementos guarda tudo o que existe: cada cristal, cada livro, cada número. Lá vive o Guardião, mestre da contagem.' },
      { img: 'paradox', text: 'Numa noite sem estrelas, o Paradoxo, um olho faminto de contradições, embaralhou os conjuntos. Escondeu os elementos nas ilhas flutuantes e trancou os portais.' },
      { img: 'wizard_cast', text: 'Só o Guardião pode restaurar a ordem. O cajado de dois anéis, o Diagrama de Venn, muda a realidade quando ele conta, une e interseciona corretamente.' },
      { img: 'wizard_idle', text: 'Atravesse as 5 regiões do reino, recupere os elementos e derrote o Paradoxo. Cuidado: cada erro de contagem enfraquece o feitiço!' },
    ];
    this.i = 0;
    this.dots = this.pages.map((_, k) => this.add.circle(W / 2 - (this.pages.length - 1) * 14 + k * 28, H - 26, 7, GDC.C.gold));
    this.pic = this.add.image(230, 300, this.pages[0].img);
    this.panel = GDC.UI.panel(this, 640, 270, 560, 330);
    this.txt = this.add.text(640, 270, '', { fontFamily: GDC.FONT_BODY, fontSize: '24px', color: GDC.CSS.cream, align: 'center', lineSpacing: 8, wordWrap: { width: 380 } }).setOrigin(0.5);
    this.hint = this.add.text(W / 2, H - 56, 'toque para continuar', { fontFamily: GDC.FONT_BODY, fontSize: '20px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: this.hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    const skip = GDC.UI.button(this, W - 100, 40, 'PULAR', { width: 160, height: 46, fontSize: 22, onClick: () => this.end() });
    skip.setDepth(10);
    this.show(0);
    this.input.on('pointerup', (p) => { if (p.y > 80 || p.x < W - 190) this.next(); });
    this.input.keyboard.on('keydown-SPACE', () => this.next());
    this.input.keyboard.on('keydown-ENTER', () => this.next());
  }

  show(i) {
    const pg = this.pages[i];
    this.pic.setTexture(pg.img);
    this.pic.setScale(Math.min(340 / this.pic.height, 400 / this.pic.width));
    this.pic.setAlpha(0).setX(180);
    this.tweens.add({ targets: this.pic, alpha: 1, x: 230, duration: 380, ease: 'Cubic.easeOut' });
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
    else GDC.UI.goTo(this, 'PlatformScene', { index: 0 });
  }
}
