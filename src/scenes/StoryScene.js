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
      { img: 'wizard_cast', text: 'O último símbolo cruzou o ar e o balão do Rei Paradoxo estourou em mil pedaços de luz. A pergunta sem resposta que o criou finalmente se calou.' },
      { img: 'emblem', text: 'O Grande Diagrama de Venn voltou a brilhar, e cada elemento encontrou o seu conjunto. Os servos, livres do feitiço, voltaram a ser simples números e letras.' },
      { img: 'wizard_idle', text: 'Mestre Vênio sorriu: "Todo paradoxo some quando a gente conta com cuidado." O Reino dorme em paz, mas as perguntas sempre voltam. Continue treinando!' },
    ] : [
      { img: 'emblem', text: 'No Reino dos Conjuntos, tudo tem o seu lugar. O Castelo dos Elementos guarda o Grande Diagrama de Venn, dois anéis de luz que mantêm cada número, livro e cristal no conjunto certo.' },
      { img: 'wizard_idle', text: 'Seu guardião é o Mestre Vênio, um velho mago teimoso que nunca errou uma conta. O cristal do seu cajado transforma símbolos desenhados no ar em feitiços.' },
      { img: 'paradox', text: 'Numa noite sem estrelas surgiu o Rei Paradoxo, nascido de uma pergunta sem resposta: "um conjunto pode conter a si mesmo?" Ele quer apagar o Grande Diagrama.' },
      { img: 'foe_goblin', text: 'O Rei envia os Elementos Esquecidos, servos presos a balões. Cada balão carrega um enigma de conjuntos, e só a resposta certa faz o servo cair.' },
      { img: 'wizard_cast', text: 'Como lançar o feitiço: leia o balão e DESENHE a resposta no ar, um símbolo (∪ ∩ ∈ ⊂ ∅) ou um número. Se um servo passar da linha de defesa, o castelo perde um coração.' },
      { img: 'foe_orc', text: 'São seis batalhas até o trono: símbolos, pertinência, cardinalidade, inclusão e exclusão, três conjuntos e o duelo final. Bom jogo, Mestre Vênio!' },
    ];
    this.i = 0;
    this.dots = this.pages.map((_, k) => this.add.circle(W / 2 - (this.pages.length - 1) * 14 + k * 28, H - 40, 7, GDC.C.gold));
    this.pic = this.add.image(W / 2, 250, this.pages[0].img);
    this.panel = GDC.UI.panel(this, W / 2, 690, 500, 430);
    this.txt = this.add.text(W / 2, 690, '', { fontFamily: GDC.FONT_BODY, fontSize: '20px', color: GDC.CSS.cream, align: 'center', lineSpacing: 6, wordWrap: { width: 320 } }).setOrigin(0.5);
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
    this.pic.setScale(Math.min(300 / this.pic.height, 340 / this.pic.width));
    this.pic.setAlpha(0).setY(280);
    this.tweens.add({ targets: this.pic, alpha: 1, y: 250, duration: 380, ease: 'Cubic.easeOut' });
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
