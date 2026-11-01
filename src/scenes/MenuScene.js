/* Menu principal em retrato: castelo ilustrado ao fundo, titulo, mago e botoes */
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(350, 10, 6, 24);
    const bg = this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(H / 1376);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.38);
    const vg = this.add.graphics();
    vg.fillGradientStyle(0x0d0f26, 0x0d0f26, 0x0d0f26, 0x0d0f26, 0.75, 0.75, 0, 0).fillRect(0, 0, W, 420);
    this.add.particles(0, 0, 'spark_small', {
      x: { min: 0, max: W }, y: { min: 300, max: H }, lifespan: 4000,
      speedY: { min: -24, max: -55 }, scale: { start: 0.3, end: 0 }, alpha: { start: 0.7, end: 0 }, frequency: 200, blendMode: 'ADD',
    });

    const emblem = this.add.image(W / 2, 140, 'emblem').setScale(0.4);
    this.tweens.add({ targets: emblem, y: 132, scale: 0.415, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const title = GDC.UI.title(this, W / 2, 300, 'GUARDIÃO\nDOS CONJUNTOS', 78).setAlpha(0).setAngle(-3);
    this.tweens.add({ targets: title, alpha: 1, angle: -2, duration: 700, ease: 'Back.easeOut' });

    const wiz = this.add.image(120, H + 6, 'wizard_idle').setOrigin(0.5, 1);
    const ws = 235 / wiz.height; wiz.setScale(ws);
    this.tweens.add({ targets: wiz, scaleY: ws * 1.03, scaleX: ws * 0.985, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const eye = this.add.image(W - 90, H - 120, 'paradox').setScale(0.3).setAlpha(0.92);
    this.tweens.add({ targets: eye, y: H - 140, angle: 6, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    GDC.Audio.playMusic(this, 'menu');

    const items = [
      ['JOGAR', 'icon_play', () => this.play()],
      ['COMO JOGAR', 'icon_help', () => this.howTo()],
      ['GLOSSÁRIO', 'icon_book', () => this.studies()],
      ['OPÇÕES', 'icon_gear', () => this.options()],
    ];
    if (GDC.SHOW_QUIT) items.push(['SAIR', 'icon_door', () => this.quit()]);
    items.forEach(([label, icon, fn], i) => {
      const y = 430 + i * 74;
      const b = GDC.UI.button(this, W / 2, y + 40, label, { icon, width: 320, height: 58, fontSize: 28, onClick: fn });
      b.setAlpha(0);
      this.tweens.add({ targets: b, y, alpha: 1, duration: 450, delay: 200 + i * 100, ease: 'Back.easeOut' });
    });
    this.add.text(W / 2, H - 10, 'Matemática Discreta · UNIFOR · Equipe 4', { fontFamily: GDC.FONT_BODY, fontSize: '14px', color: GDC.CSS.dim }).setOrigin(0.5, 1);
  }

  play() {
    const d = GDC.Settings.data;
    const fresh = d.unlocked <= 1 && Object.keys(d.stars).length === 0;
    GDC.UI.goTo(this, fresh ? 'StoryScene' : 'LevelSelectScene');
  }

  howTo() {
    this.showDialog('COMO JOGAR', GDC.HOWTO, [{ label: 'ENTENDI', onClick: (c) => c.destroy() }], { height: 700, fontSize: 19 });
  }

  studies() {
    this.showDialog('GLOSSÁRIO', GDC.GLOSSARY, [{ label: 'VOLTAR', onClick: (c) => c.destroy() }], { height: 760, fontSize: 19 });
  }

  options() {
    const s = GDC.Settings.data;
    const lab = (n, v) => `${n}: ${v ? 'LIGADO' : 'LIGADA'}`;
    this.showDialog('OPÇÕES', 'Dicas: traço-guia e explicações.\nAs escolhas ficam salvas neste aparelho.', [
      { label: lab('EFEITOS', s.sfx), onClick: (c, b) => { s.sfx = !s.sfx; GDC.Settings.save(); b.setLabel(lab('EFEITOS', s.sfx)); } },
      { label: lab('MÚSICA', s.music), onClick: (c, b) => { s.music = !s.music; GDC.Settings.save(); b.setLabel(lab('MÚSICA', s.music)); } },
      { label: lab('DICAS', s.hints), onClick: (c, b) => { s.hints = !s.hints; GDC.Settings.save(); b.setLabel(lab('DICAS', s.hints)); } },
      { label: 'VOLTAR', onClick: (c) => c.destroy() },
    ], { height: 600 });
  }

  quit() {
    this.showDialog('SAIR?', 'O navegador não deixa o jogo fechar a aba. Pode fechar quando quiser, o progresso fica salvo.',
      [{ label: 'VOLTAR', onClick: (c) => c.destroy() }], { height: 480 });
  }

  showDialog(title, body, buttons, opts) {
    if (this.dlg) this.dlg.destroy();
    this.dlg = GDC.UI.dialog(this, title, body, buttons, opts);
  }
}
