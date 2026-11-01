/* Componentes de interface no estilo "desenho animado anos 30":
   contorno preto grosso, ouro e roxo, cantos arredondados. */
GDC.UI = {
  title(scene, x, y, text, size) {
    return scene.add.text(x, y, text, {
      fontFamily: GDC.FONT, fontSize: (size || 48) + 'px', color: GDC.CSS.gold,
      stroke: GDC.CSS.ink, strokeThickness: Math.max(6, Math.round((size || 48) / 6)),
      align: 'center', lineSpacing: -4,
    }).setOrigin(0.5).setShadow(0, 5, '#0a0618', 0, true, true);
  },

  text(scene, x, y, str, size, color, opts) {
    return scene.add.text(x, y, str, Object.assign({
      fontFamily: GDC.FONT_BODY, fontSize: (size || 20) + 'px', color: color || GDC.CSS.cream,
      stroke: GDC.CSS.ink, strokeThickness: Math.max(3, Math.round((size || 20) / 6)), align: 'center',
    }, opts || {})).setOrigin(0.5);
  },

  // fundo de botao desenhado em codigo (tinta preta + ouro + roxo)
  drawBlob(g, w, h, fill, stroke) {
    g.clear();
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-w / 2 - 5, -h / 2 - 3, w + 10, h + 12, 20);
    g.fillStyle(stroke || GDC.C.gold, 1).fillRoundedRect(-w / 2, -h / 2, w, h + 4, 17);
    g.fillStyle(fill || GDC.C.violet, 1).fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 6, 13);
    g.fillStyle(0xffffff, 0.16).fillRoundedRect(-w / 2 + 12, -h / 2 + 8, w - 24, h * 0.28, 8);
  },

  button(scene, x, y, label, opts) {
    opts = opts || {};
    const w = opts.width || 300, h = opts.height || 62;
    const c = scene.add.container(x, y);
    const g = scene.add.graphics();
    this.drawBlob(g, w, h, opts.fill, opts.stroke);
    c.add(g);
    let tx = 0;
    if (opts.icon) {
      const ic = scene.add.image(-w / 2 + h * 0.62, 0, opts.icon);
      ic.setScale((h * 0.92) / ic.height); c.add(ic); tx = h * 0.36;
    }
    const t = scene.add.text(tx, 0, label, {
      fontFamily: GDC.FONT_BODY, fontSize: (opts.fontSize || 26) + 'px', color: GDC.CSS.cream,
      stroke: GDC.CSS.ink, strokeThickness: 5,
    }).setOrigin(0.5);
    c.add(t);
    const hit = scene.add.rectangle(0, 0, w + 10, h + 10, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    c.add(hit);
    let enabled = true;
    hit.on('pointerover', () => { if (enabled) scene.tweens.add({ targets: c, scale: 1.05, duration: 90 }); });
    hit.on('pointerout', () => scene.tweens.add({ targets: c, scale: 1, duration: 90 }));
    hit.on('pointerdown', () => { if (!enabled) return; c.setScale(0.95); GDC.Audio.sfx(scene, opts.sound || 'click'); });
    hit.on('pointerup', () => { if (!enabled) return; c.setScale(1.05); if (opts.onClick) opts.onClick(c); });
    c.setEnabled = (v) => { enabled = v; c.setAlpha(v ? 1 : 0.5); };
    c.setLabel = (s) => t.setText(s);
    c.w = w; c.h = h;
    return c;
  },

  // painel ilustrado (moldura de pedra e ouro, 9 fatias)
  panel(scene, x, y, w, h) {
    return scene.add.nineslice(x, y, 'panel', undefined, w, h, 130, 130, 110, 110);
  },

  // Dialogo modal simples: titulo, corpo, botoes. Retorna container (destroy para fechar).
  dialog(scene, title, body, buttons, opts) {
    opts = opts || {};
    const { W, H } = GDC;
    const cam = scene.cameras.main;
    cam.stopFollow();
    const c = scene.add.container(cam.scrollX, cam.scrollY).setDepth(opts.depth || 1100);
    const shade = scene.add.rectangle(W / 2, H / 2, W, H, 0x050713, 0.82).setInteractive();
    const pw = opts.width || 720, ph = opts.height || 430;
    const panel = this.panel(scene, W / 2, H / 2, pw, ph);
    const head = this.title(scene, W / 2, H / 2 - ph / 2 + 88, title, 46);
    const text = scene.add.text(W / 2, H / 2 + 6, body, {
      fontFamily: GDC.FONT_BODY, fontSize: (opts.fontSize || 22) + 'px', color: GDC.CSS.cream,
      align: 'center', lineSpacing: 6, wordWrap: { width: pw - 250 },
    }).setOrigin(0.5);
    c.add([shade, panel, head, text]);
    const n = buttons.length;
    const bw = n > 1 ? 230 : 280;
    buttons.forEach((b, i) => {
      const bx = W / 2 + (i - (n - 1) / 2) * (bw + 20);
      const btn = this.button(scene, bx, H / 2 + ph / 2 - 88, b.label, {
        width: bw, height: 54, fontSize: 22, onClick: () => { if (b.onClick) b.onClick(c, btn); },
      });
      c.add(btn);
    });
    c.bodyText = text;
    return c;
  },

  goTo(scene, key, data) {
    const cam = scene.cameras.main;
    cam.fadeOut(260, 10, 6, 24);
    cam.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
  },
};
