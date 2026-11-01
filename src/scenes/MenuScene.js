/* Menu principal em paisagem: torre ilustrada ao fundo, mago e botoes */
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(350, 10, 6, 24);
    const sc = 1.32;
    const bg = this.add.image(W / 2, 270 - 385 * sc, 'bg_tower').setOrigin(0.5, 0).setScale(sc);
    this.tweens.add({ targets: bg, x: W / 2 + 14, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.22);
    // vinheta nas bordas para dar leitura aos botoes
    const vg = this.add.graphics();
    vg.fillGradientStyle(0x0d0f26, 0x0d0f26, 0x0d0f26, 0x0d0f26, 0, 0.8, 0, 0.8).fillRect(W - 360, 0, 360, H);
    vg.fillGradientStyle(0x0d0f26, 0x0d0f26, 0x0d0f26, 0x0d0f26, 0.7, 0, 0.7, 0).fillRect(0, 0, 340, H);

    this.sparkles();

    const emblem = this.add.image(170, 105, 'emblem').setScale(0.38);
    this.tweens.add({ targets: emblem, y: 99, scale: 0.395, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const title = GDC.UI.title(this, 170, 262, 'GUARDIÃO\nDOS CONJUNTOS', 62).setAlpha(0).setAngle(-3);
    this.tweens.add({ targets: title, alpha: 1, angle: -2, duration: 700, ease: 'Back.easeOut' });

    // mago respirando (animacao de borracha: estica e amassa)
    const wiz = this.add.image(120, 545, 'wizard_idle').setOrigin(0.5, 1);
    const ws = 215 / wiz.height; wiz.setScale(ws);
    this.tweens.add({ targets: wiz, scaleY: ws * 1.03, scaleX: ws * 0.985, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: wiz, angle: 1.2, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const eye = this.add.image(238, 480, 'paradox').setScale(0.2).setAlpha(0.9);
    this.tweens.add({ targets: eye, y: 470, angle: 6, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    GDC.Audio.playMusic(this, 'menu');

    const items = [
      ['JOGAR', 'icon_play', () => this.play()],
      ['COMO JOGAR', 'icon_help', () => this.howTo()],
      ['ESTUDOS', 'icon_book', () => this.studies()],
      ['OPÇÕES', 'icon_gear', () => this.options()],
    ];
    if (GDC.SHOW_QUIT) items.push(['SAIR', 'icon_door', () => this.quit()]);
    items.forEach(([label, icon, fn], i) => {
      const b = GDC.UI.button(this, W - 190, 150 + i * 74 + 40, label, { icon, width: 300, height: 58, fontSize: 28, onClick: fn });
      b.setAlpha(0);
      this.tweens.add({ targets: b, y: 150 + i * 74, alpha: 1, duration: 450, delay: 200 + i * 100, ease: 'Back.easeOut' });
    });
    this.add.text(W - 10, H - 8, 'Matemática Discreta · UNIFOR · Equipe 4', { fontFamily: GDC.FONT_BODY, fontSize: '14px', color: GDC.CSS.dim }).setOrigin(1, 1);
  }

  play() {
    const d = GDC.Settings.data;
    const fresh = d.unlocked <= 1 && Object.keys(d.stars).length === 0;
    GDC.UI.goTo(this, fresh ? 'StoryScene' : 'LevelSelectScene');
  }

  sparkles() {
    this.add.particles(0, 0, 'spark_small', {
      x: { min: 0, max: GDC.W }, y: { min: 100, max: GDC.H }, lifespan: 4000,
      speedY: { min: -24, max: -55 }, scale: { start: 0.3, end: 0 }, alpha: { start: 0.7, end: 0 },
      frequency: 200, blendMode: 'ADD',
    });
  }

  howTo() {
    this.showDialog('COMO JOGAR',
      'Você é o Guardião. Atravesse as ilhas, recupere os elementos dos conjuntos e abra os portais.\n\n' +
      'Andar: setas ou A / D     Pular: espaço ou ↑     Conjurar: Z ou X\n' +
      'No celular: botões ◀ ▶ ▲ ✦ na tela (gire o aparelho).\n\n' +
      'Cada fase tem um desafio de conjuntos. Erros custam um coração, e o botão (?) dá dicas.',
      [{ label: 'ENTENDI', onClick: (c) => c.destroy() }], { height: 520, width: 860, fontSize: 20 });
  }

  studies() {
    this.showDialog('ESTUDOS',
      'Cardinalidade: |A| é a quantidade de elementos de A.\n' +
      'União A ∪ B: elementos em A ou em B.   Interseção A ∩ B: elementos nos dois.\n' +
      'Diferença A − B: em A mas não em B.   Complemento Aᶜ: fora de A.\n\n' +
      '|A∪B| = |A| + |B| − |A∩B|\n' +
      '|A∪B∪C| = |A|+|B|+|C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|',
      [{ label: 'VOLTAR', onClick: (c) => c.destroy() }], { height: 520, width: 880, fontSize: 20 });
  }

  options() {
    const s = GDC.Settings.data;
    const lab = (n, v) => `${n}: ${v ? 'LIGADO' : 'LIGADA'}`;
    this.showDialog('OPÇÕES', 'As escolhas ficam salvas neste aparelho.', [
      { label: lab('EFEITOS', s.sfx), onClick: (c, b) => { s.sfx = !s.sfx; GDC.Settings.save(); b.setLabel(lab('EFEITOS', s.sfx)); } },
      { label: lab('MÚSICA', s.music), onClick: (c, b) => { s.music = !s.music; GDC.Settings.save(); b.setLabel(lab('MÚSICA', s.music)); } },
      { label: 'VOLTAR', onClick: (c) => c.destroy() },
    ], { height: 400, width: 880 });
  }

  quit() {
    this.showDialog('SAIR?', 'O navegador não deixa o jogo fechar a aba. Pode fechar quando quiser, o progresso fica salvo.',
      [{ label: 'VOLTAR', onClick: (c) => c.destroy() }], { height: 400, width: 800 });
  }

  showDialog(title, body, buttons, opts) {
    if (this.dlg) this.dlg.destroy();
    this.dlg = GDC.UI.dialog(this, title, body, buttons, opts);
  }
}
