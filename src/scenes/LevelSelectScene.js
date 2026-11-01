/* Selecao de fases com estrelas e bloqueio progressivo */
class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(300, 10, 6, 24);
    const bg = this.add.image(W / 2, 270 - 420 * 1.3, 'bg_tower').setOrigin(0.5, 0).setScale(1.3);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.62);
    GDC.UI.title(this, W / 2, 58, 'ESCOLHA A FASE', 64);
    GDC.Audio.playMusic(this, 'menu');
    const all = /[?&]all=1/.test(window.location.search);
    const unlocked = all ? 99 : GDC.Settings.data.unlocked;
    const n = GDC_LEVELS.length, cw = 168, gap = 12, x0 = W / 2 - ((n * cw + (n - 1) * gap) / 2) + cw / 2;
    GDC_LEVELS.forEach((lv, i) => {
      const open = i + 1 <= unlocked, x = x0 + i * (cw + gap), y = 290;
      const c = this.add.container(x, y);
      const g = this.add.graphics();
      g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-cw / 2 - 5, -150, cw + 10, 310, 22);
      g.fillStyle(open ? GDC.C.gold : GDC.C.grey, 1).fillRoundedRect(-cw / 2, -145, cw, 300, 19);
      g.fillStyle(open ? GDC.C.violet : 0x3a3a55, 1).fillRoundedRect(-cw / 2 + 6, -139, cw - 12, 288, 15);
      c.add(g);
      c.add(GDC.UI.text(this, 0, -100, String(i + 1), 62, open ? GDC.CSS.gold : GDC.CSS.dim, { fontFamily: GDC.FONT, strokeThickness: 8 }));
      c.add(this.add.text(0, -34, lv.name, { fontFamily: GDC.FONT_BODY, fontSize: '19px', color: GDC.CSS.cream, align: 'center', wordWrap: { width: cw - 24 }, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5, 0.5));
      c.add(this.add.text(0, 48, lv.concept, { fontFamily: GDC.FONT_BODY, fontSize: '14px', color: GDC.CSS.soft, align: 'center', wordWrap: { width: cw - 26 } }).setOrigin(0.5, 0.5));
      const st = GDC.Settings.data.stars[lv.id] || 0;
      c.add(this.add.text(0, 118, open ? '★'.repeat(st) + '☆'.repeat(3 - st) : 'BLOQUEADA', { fontFamily: GDC.FONT_BODY, fontSize: open ? '28px' : '17px', color: open ? GDC.CSS.gold : GDC.CSS.dim, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5));
      if (open) {
        const hit = this.add.rectangle(0, 0, cw, 300, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        c.add(hit);
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.05, duration: 90 }));
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 90 }));
        hit.on('pointerup', () => { GDC.Audio.sfx(this, 'click'); GDC.UI.goTo(this, 'PlatformScene', { index: i }); });
      }
      c.setAlpha(0).y = y + 30;
      this.tweens.add({ targets: c, alpha: 1, y, duration: 380, delay: i * 80, ease: 'Back.easeOut' });
    });
    GDC.UI.button(this, 130, H - 48, 'MENU', { icon: 'icon_close', width: 200, height: 52, fontSize: 24, sound: 'back', onClick: () => GDC.UI.goTo(this, 'MenuScene') });
  }
}
