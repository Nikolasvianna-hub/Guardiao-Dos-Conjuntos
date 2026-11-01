/* Selecao de fases em lista vertical, com estrelas e bloqueio progressivo */
class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const { W, H } = GDC;
    this.cameras.main.fadeIn(300, 10, 6, 24);
    this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(H / 1376);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.66);
    GDC.UI.title(this, W / 2, 80, 'ESCOLHA A FASE', 66);
    GDC.Audio.playMusic(this, 'menu');
    const all = /[?&]all=1/.test(window.location.search);
    const unlocked = all ? 99 : GDC.Settings.data.unlocked;
    const L = GDC.Challenges.LEVELS, cw = 480, ch = 124;
    L.forEach((lv, i) => {
      const open = i + 1 <= unlocked, y = 205 + i * (ch + 18);
      const c = this.add.container(W / 2, y);
      const g = this.add.graphics();
      g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-cw / 2 - 5, -ch / 2 - 5, cw + 10, ch + 12, 22);
      g.fillStyle(open ? GDC.C.gold : GDC.C.grey, 1).fillRoundedRect(-cw / 2, -ch / 2, cw, ch + 4, 19);
      g.fillStyle(open ? GDC.C.violet : 0x3a3a55, 1).fillRoundedRect(-cw / 2 + 6, -ch / 2 + 6, cw - 12, ch - 8, 15);
      c.add(g);
      c.add(GDC.UI.text(this, -cw / 2 + 52, 0, String(i + 1), 64, open ? GDC.CSS.gold : GDC.CSS.dim, { fontFamily: GDC.FONT, strokeThickness: 8 }));
      c.add(this.add.text(-cw / 2 + 100, -26, lv.name, { fontFamily: GDC.FONT_BODY, fontSize: '23px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0, 0.5));
      c.add(this.add.text(-cw / 2 + 100, 8, lv.concept, { fontFamily: GDC.FONT_BODY, fontSize: '16px', color: GDC.CSS.soft }).setOrigin(0, 0.5));
      const st = GDC.Settings.data.stars[lv.id] || 0;
      c.add(this.add.text(-cw / 2 + 100, 40, open ? '★'.repeat(st) + '☆'.repeat(3 - st) : 'BLOQUEADA', { fontFamily: GDC.FONT_BODY, fontSize: open ? '26px' : '16px', color: open ? GDC.CSS.gold : GDC.CSS.dim, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0, 0.5));
      if (open) {
        const hit = this.add.rectangle(0, 0, cw, ch, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        c.add(hit);
        hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.03, duration: 90 }));
        hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 90 }));
        hit.on('pointerup', () => { GDC.Audio.sfx(this, 'click'); GDC.UI.goTo(this, 'MagicScene', { index: i }); });
      }
      c.setAlpha(0).y = y + 30;
      this.tweens.add({ targets: c, alpha: 1, y, duration: 380, delay: i * 80, ease: 'Back.easeOut' });
    });
    GDC.UI.button(this, W / 2, H - 56, 'MENU', { icon: 'icon_close', width: 220, height: 52, fontSize: 24, sound: 'back', onClick: () => GDC.UI.goTo(this, 'MenuScene') });
  }
}
