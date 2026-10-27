/* Componentes de interface reutilizáveis (botões, títulos, troca de cena) */
GDC.UI = {
  // Texto de título em fonte pixel, dourado com contorno índigo
  title(scene, x, y, text, size) {
    return scene.add.text(x, y, text, {
      fontFamily: GDC.FONT,
      fontSize: (size || 24) + 'px',
      color: GDC.CSS.gold,
      stroke: GDC.CSS.indigo,
      strokeThickness: Math.max(4, Math.round((size || 24) / 4)),
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);
  },

  // Botão grande de pedra e ouro (9 fatias, estica sem deformar os cantos)
  // opts: width, height, icon, fontSize, onClick
  button(scene, x, y, label, opts) {
    opts = opts || {};
    const w = opts.width || 330;
    const h = opts.height || 80;
    const s = 0.30;
    const c = scene.add.container(x, y);
    const bg = scene.add.nineslice(0, 0, 'btn_normal', undefined, w / s, h / s, 56, 56, 56, 56).setScale(s);
    c.add(bg);

    if (opts.icon) {
      const icon = scene.add.image(-w / 2 + 46, 0, opts.icon);
      icon.setScale((h * 0.58) / icon.height);
      c.add(icon);
    }
    const text = scene.add.text(opts.icon ? 28 : 0, 0, label, {
      fontFamily: GDC.FONT,
      fontSize: (opts.fontSize || 16) + 'px',
      color: GDC.CSS.gold,
      stroke: GDC.CSS.indigo,
      strokeThickness: 5,
    }).setOrigin(0.5);
    c.add(text);

    let enabled = true;
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w / s, h / s),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    const grow = (v) => scene.tweens.add({ targets: c, scale: v, duration: 80 });
    bg.on('pointerover', () => { if (!enabled) return; text.setColor(GDC.CSS.cyan); grow(1.04); });
    bg.on('pointerout', () => { text.setColor(GDC.CSS.gold); bg.clearTint(); grow(1); });
    bg.on('pointerdown', () => {
      if (!enabled) return;
      bg.setTint(0xaaaaaa);
      c.setScale(0.96);
      GDC.Audio.sfx(scene, 'sfxClick');
    });
    bg.on('pointerup', () => {
      if (!enabled) return;
      bg.clearTint();
      c.setScale(1.04);
      if (opts.onClick) opts.onClick();
    });

    c.setEnabled = (v) => {
      enabled = v;
      c.setAlpha(v ? 1 : 0.5);
      if (v) bg.setInteractive(); else bg.disableInteractive();
      if (v) {
        bg.setInteractive({
          hitArea: new Phaser.Geom.Rectangle(0, 0, w / s, h / s),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: true,
        });
      }
    };
    c.setLabel = (t) => text.setText(t);
    return c;
  },

  // Botão pequeno retangular (setas, mais/menos, ligado/desligado)
  smallButton(scene, x, y, w, h, label, onClick, fontSize) {
    const c = scene.add.container(x, y);
    const r = scene.add.rectangle(0, 0, w, h, GDC.C.slate).setStrokeStyle(3, GDC.C.gold);
    const t = scene.add.text(0, 0, label, {
      fontFamily: GDC.FONT,
      fontSize: (fontSize || 14) + 'px',
      color: GDC.CSS.gold,
    }).setOrigin(0.5);
    c.add([r, t]);
    r.setInteractive({ useHandCursor: true });
    r.on('pointerover', () => r.setFillStyle(0x3a4090));
    r.on('pointerout', () => r.setFillStyle(GDC.C.slate));
    r.on('pointerdown', () => { r.setFillStyle(0x4a52b0); GDC.Audio.sfx(scene, 'sfxClick'); });
    r.on('pointerup', () => { r.setFillStyle(0x3a4090); if (onClick) onClick(); });
    c.setLabel = (s) => t.setText(s);
    return c;
  },

  // Troca de cena com fade
  goTo(scene, key, data) {
    const cam = scene.cameras.main;
    cam.fadeOut(250, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
  },
};
