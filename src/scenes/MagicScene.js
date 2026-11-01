/* Cena principal, no estilo Magic Touch: o mago fica parado embaixo, inimigos descem presos
   a baloes com desafios de conjuntos, e o jogador DESENHA o simbolo da resposta para explodir. */
class MagicScene extends Phaser.Scene {
  constructor() { super('MagicScene'); }

  init(data) {
    this.index = (data && data.index) || 0;
    this.lv = GDC.Challenges.LEVELS[this.index];
  }

  create() {
    const { W, H } = GDC;
    this.hitY = 770;
    this.cameras.main.fadeIn(300, 10, 6, 24);
    this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(H / 1376);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0f26, 0.3);
    const bar = this.add.graphics();
    bar.fillGradientStyle(GDC.C.gold, GDC.C.gold, GDC.C.gold, GDC.C.gold, 0, 0, 0.5, 0.5).fillRect(0, this.hitY - 40, W, 40);
    bar.fillStyle(GDC.C.gold, 0.9).fillRect(0, this.hitY, W, 4);
    bar.fillStyle(GDC.C.ink, 0.55).fillRect(0, this.hitY + 4, W, H - this.hitY - 4);
    this.add.particles(0, 0, 'spark_small', { x: { min: 0, max: W }, y: { min: 100, max: H }, lifespan: 4000, speedY: { min: -20, max: -50 }, scale: { start: 0.25, end: 0 }, alpha: { start: 0.6, end: 0 }, frequency: 260, blendMode: 'ADD' });

    this.wizard = this.add.image(W / 2, H + 8, 'wizard_idle').setOrigin(0.5, 1).setDepth(5);
    this.wizScale = 250 / this.wizard.height; this.wizard.setScale(this.wizScale);
    this.tweens.add({ targets: this.wizard, scaleY: this.wizScale * 1.03, scaleX: this.wizScale * 0.985, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.queue = GDC.Challenges.generate(this.index, (Math.random() * 1e9) | 0);
    this.total = this.queue.length;
    this.enemies = []; this.target = null; this.killed = 0;
    this.lives = GDC.LIVES; this.livesLost = 0; this.score = 0; this.combo = 0; this.bestCombo = 0;
    this.spawnClock = 1.2; this.spawned = 0; this.lastX = -999;
    this.stroke = null; this.pending = null; this.ghost = null;
    this.state = 'intro';

    this.buildHud();
    this.trail = this.add.graphics().setDepth(900);
    this.input.on('pointerdown', (p, over) => this.onDown(p, over));
    this.input.on('pointermove', (p) => this.onMove(p));
    this.input.on('pointerup', (p) => this.onUp(p));
    this.input.on('pointerupoutside', (p) => this.onUp(p));
    GDC.Audio.playMusic(this, 'game');

    if (this.index === 0) this.intro(); else this.beginLevel();
  }

  /* ---------- interface ---------- */
  buildHud() {
    const { W } = GDC;
    this.add.rectangle(W / 2, 0, W, 112, GDC.C.ink, 0.6).setOrigin(0.5, 0).setDepth(100);
    this.hearts = this.add.text(18, 18, '', { fontFamily: GDC.FONT_BODY, fontSize: '30px', color: '#ff5a64', stroke: GDC.CSS.ink, strokeThickness: 5 }).setDepth(101);
    this.scoreTxt = this.add.text(W / 2, 22, '0', { fontFamily: GDC.FONT_BODY, fontSize: '34px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 6 }).setOrigin(0.5, 0).setDepth(101);
    this.progTxt = this.add.text(18, 70, '', { fontFamily: GDC.FONT_BODY, fontSize: '19px', color: GDC.CSS.soft, stroke: GDC.CSS.ink, strokeThickness: 4 }).setDepth(101);
    this.comboTxt = this.add.text(W / 2, 70, '', { fontFamily: GDC.FONT_BODY, fontSize: '22px', color: GDC.CSS.cyan, stroke: GDC.CSS.ink, strokeThickness: 5 }).setOrigin(0.5, 0).setDepth(101);
    const mk = (x, key, fn) => { const b = this.add.image(x, 48, key).setDepth(102).setInteractive({ useHandCursor: true }); b.setScale(56 / b.height); b.on('pointerup', () => { GDC.Audio.sfx(this, 'click'); fn(); }); return b; };
    mk(W - 112, 'icon_help', () => this.hint());
    mk(W - 44, 'icon_gear', () => this.pause());
    this.updateHud();
  }

  updateHud() {
    this.hearts.setText('♥'.repeat(Math.max(0, this.lives)) + '♡'.repeat(Math.max(0, GDC.LIVES - this.lives)));
    this.scoreTxt.setText(String(this.score));
    this.progTxt.setText(`Fase ${this.lv.id}: ${this.killed}/${this.total}`);
    this.comboTxt.setText(this.combo >= 2 ? `COMBO x${this.combo}` : '');
  }

  intro() {
    this.state = 'dialog';
    const d = GDC.UI.dialog(this, 'COMO JOGAR',
      'Inimigos descem presos a balões com desafios de conjuntos.\n\nDESENHE com o dedo o símbolo que responde ao desafio.\n\nExemplo: "A ? B  união" pede o símbolo ∪ (um U).\n\nNo começo, um traço-guia mostra como desenhar.',
      [{ label: 'VAMOS LÁ!', onClick: (c) => { c.destroy(); this.beginLevel(); } }], { height: 700, fontSize: 21 });
    this.dlg = d;
  }

  beginLevel() {
    this.state = 'play';
    const t = GDC.UI.title(this, GDC.W / 2, 400, `FASE ${this.lv.id}\n${this.lv.name.toUpperCase()}`, 60).setDepth(950);
    this.tweens.add({ targets: t, alpha: 0, y: 360, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  pause() {
    if (this.state !== 'play') return;
    this.state = 'dialog';
    this.dlg = GDC.UI.dialog(this, 'PAUSA', 'O jogo está parado.', [
      { label: 'CONTINUAR', onClick: (c) => { c.destroy(); this.state = 'play'; } },
      { label: 'GLOSSÁRIO', onClick: (c) => { c.destroy(); this.glossary(); } },
      { label: 'MENU', onClick: (c) => { c.destroy(); this.leave('MenuScene'); } },
    ], { height: 560 });
  }

  glossary() {
    this.dlg = GDC.UI.dialog(this, 'GLOSSÁRIO', GDC.GLOSSARY, [{ label: 'VOLTAR', onClick: (c) => { c.destroy(); this.state = 'play'; this.pause(); } }], { height: 760, fontSize: 19 });
  }

  leave(key, data) {
    GDC.UI.goTo(this, key, data);
  }

  /* ---------- inimigos ---------- */
  spawn() {
    const item = this.queue.shift();
    let x = 0;
    for (let k = 0; k < 20; k++) { x = 140 + Math.random() * 260; if (Math.abs(x - this.lastX) > 110) break; }
    this.lastX = x;
    const boss = item.boss;
    const c = this.add.container(x, -110).setDepth(20);
    const gfx = this.add.graphics();
    const foe = this.add.image(0, 0, 'paradox').setOrigin(0.5, 0);
    foe.setScale((boss ? 112 : 70) / foe.height);
    const content = this.add.container(0, 0);
    c.add([gfx, foe, content]);
    const e = { c, gfx, foe, content, items: item.items, idx: 0, boss, wrong: 0, assist: this.index === 0 && this.spawned < 3, w: 0, h: 0,
      speed: this.lv.speed * (boss ? 0.7 : 1) * (this.index === 0 && this.spawned === 0 ? 0.65 : 1), dead: false };
    this.spawned++;
    this.setItem(e);
    this.tweens.add({ targets: foe, angle: { from: -5, to: 5 }, duration: 700 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.enemies.push(e);
    this.retarget();
  }

  setItem(e) {
    e.content.removeAll(true);
    const it = e.items[e.idx];
    const parts = []; let w = 0, y = 0;
    if (it.venn) { const im = this.add.image(0, 0, it.venn); parts.push([im, im.height]); w = Math.max(w, im.width); }
    it.lines.forEach((ln) => {
      const t = this.add.text(0, 0, ln.t, { fontFamily: GDC.FONT_BODY, fontSize: ln.k === 'main' ? '26px' : '21px', color: ln.k === 'main' ? '#1B1F4B' : '#5B3FA0' }).setOrigin(0.5);
      parts.push([t, t.height + 2]); w = Math.max(w, t.width);
    });
    const total = parts.reduce((s, p) => s + p[1], 0);
    y = -total / 2;
    parts.forEach(([o, hh]) => { o.setY(y + hh / 2); e.content.add(o); y += hh; });
    e.w = Math.min(300, Math.max(150, w + 46)); e.h = Math.max(96, total + 38);
    if (e.items.length > 1) {
      for (let k = 0; k < e.items.length; k++) e.content.add(this.add.circle((k - (e.items.length - 1) / 2) * 18, e.h / 2 - 10, 5, k < e.idx ? GDC.C.cyan : (k === e.idx ? GDC.C.gold : GDC.C.grey)).setStrokeStyle(2, GDC.C.ink));
    }
    this.drawBalloon(e);
    e.foe.setY(e.h / 2 + 26);
    e.bottom = e.h / 2 + 26 + e.foe.displayHeight;
    e.content.setY(0);
  }

  drawBalloon(e) {
    const g = e.gfx, w = e.w, h = e.h, hot = this.target === e;
    g.clear();
    g.lineStyle(3, GDC.C.ink, 1).lineBetween(0, h / 2 + 4, -6, e.foe.y + 12);
    g.fillStyle(GDC.C.ink, 1).fillTriangle(-9, h / 2 + 12, 9, h / 2 + 12, 0, h / 2 - 2);
    g.fillStyle(hot ? GDC.C.gold : GDC.C.ink, 1).fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, h / 2.2);
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2.3);
    g.fillStyle(GDC.C.cream, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2.4);
    g.fillStyle(0xffffff, 0.55).fillRoundedRect(-w / 2 + 14, -h / 2 + 8, w * 0.4, 9, 5);
  }

  retarget() {
    const prev = this.target;
    this.target = this.enemies.reduce((m, e) => (!m || e.c.y > m.c.y ? e : m), null);
    if (prev !== this.target) { if (prev && !prev.dead) this.drawBalloon(prev); if (this.target) this.drawBalloon(this.target); this.pending = null; this.refreshGhost(); }
  }

  /* ---------- laco principal ---------- */
  update(time, delta) {
    if (this.state !== 'play') return;
    const dt = Math.min(delta, 60) / 1000;
    this.spawnClock -= dt;
    if (this.queue.length && ((this.spawnClock <= 0 && this.enemies.length < this.lv.maxOn) || !this.enemies.length)) {
      this.spawn(); this.spawnClock = this.lv.gap;
    }
    for (const e of this.enemies.slice()) {
      e.c.y += e.speed * dt * (1 + this.killed * 0.012);
      if (e.c.y + e.bottom >= this.hitY) this.hurt(e);
    }
    if (this.state === 'play' && !this.queue.length && !this.enemies.length) this.win();
  }

  /* ---------- entrada: o jogador desenha ---------- */
  onDown(p, over) {
    if (this.state !== 'play' || (over && over.length)) return;
    if (this.pending) { this.stroke = this.pending.points.slice(); this.pending.timer.remove(); this.pending = null; this.joined = true; }
    else { this.stroke = []; this.joined = false; this.trail.clear(); this.trail.setAlpha(1); }
    this.stroke.push([p.x, p.y]);
  }

  onMove(p) {
    if (!this.stroke || !p.isDown) return;
    const l = this.stroke[this.stroke.length - 1];
    if (Math.hypot(p.x - l[0], p.y - l[1]) < 3) return;
    this.stroke.push([p.x, p.y]);
    const g = this.trail; g.clear();
    [[14, GDC.C.ink, 1], [8, GDC.C.cyan, 1], [3, 0xffffff, 0.9]].forEach(([w, col, a]) => {
      g.lineStyle(w, col, a).beginPath().moveTo(this.stroke[0][0], this.stroke[0][1]);
      for (let i = 1; i < this.stroke.length; i++) g.lineTo(this.stroke[i][0], this.stroke[i][1]);
      g.strokePath();
    });
  }

  onUp() {
    if (!this.stroke) return;
    const pts = this.stroke; this.stroke = null;
    if (this.state !== 'play' || !this.target) { this.trail.clear(); return; }
    const res = GDC.Gestures.recognize(pts);
    if (!res) { this.trail.clear(); return; }
    const e = this.target, expected = e.items[e.idx].answer;
    if (GDC.Gestures.accepts(res, expected)) { this.fadeTrail(); this.success(e); return; }
    // pode ser um simbolo de dois tracos (como o vazio): espera um pouco antes de contar o erro
    this.pending = { points: pts, res, timer: this.time.delayedCall(450, () => { this.pending = null; this.fadeTrail(); this.fail(e, res); }) };
  }

  fadeTrail() { this.tweens.add({ targets: this.trail, alpha: 0, duration: 260, onComplete: () => { this.trail.clear(); this.trail.setAlpha(1); } }); }

  /* ---------- acerto, erro, dano ---------- */
  success(e) {
    if (e.dead) return;
    const it = e.items[e.idx];
    GDC.Audio.sfx(this, 'cast'); GDC.Audio.sfx(this, 'right');
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
    const pts = 100 * Math.min(this.combo, 5) + (e.wrong === 0 ? 20 : 0);
    this.score += pts;
    this.cast(e.c.x, e.c.y);
    this.floatText(e.c.x, e.c.y - 20, `+${pts}`, GDC.CSS.gold);
    this.banner(it.expl);
    this.hideGhost();
    e.idx++; e.wrong = 0;
    if (e.idx < e.items.length) {
      this.burst(e.c.x, e.c.y, 8);
      this.tweens.add({ targets: e.c, scale: { from: 1.18, to: 1 }, duration: 200 });
      this.setItem(e); this.refreshGhost();
    } else {
      this.kill(e, true);
    }
    this.updateHud();
  }

  fail(e, res) {
    if (e.dead || this.state !== 'play') return;
    GDC.Audio.sfx(this, 'wrong');
    this.combo = 0; e.wrong++;
    this.score = Math.max(0, this.score - 5);
    const shown = res && res.best ? GDC.Challenges.charOf(res.best) : '?';
    this.floatText(e.c.x, e.c.y + 10, `parece ${shown}`, '#ff8d92');
    this.tweens.add({ targets: e.c, x: { from: e.c.x - 10, to: e.c.x }, duration: 260, ease: 'Bounce.easeOut' });
    const flash = this.add.rectangle(GDC.W / 2, GDC.H / 2, GDC.W, GDC.H, 0xE5484D, 0.16).setDepth(800);
    this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
    if (e.wrong >= 2) this.refreshGhost();
    this.updateHud();
  }

  hurt(e) {
    if (e.dead) return;
    GDC.Audio.sfx(this, 'hurt');
    this.lives--; this.livesLost++; this.combo = 0;
    this.cameras.main.shake(250, 0.012);
    const flash = this.add.rectangle(GDC.W / 2, GDC.H / 2, GDC.W, GDC.H, 0xE5484D, 0.35).setDepth(800);
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
    this.kill(e, false);
    this.updateHud();
    if (this.lives <= 0) this.lose();
  }

  kill(e, good) {
    e.dead = true;
    this.enemies.splice(this.enemies.indexOf(e), 1);
    if (good) this.killed++;
    this.burst(e.c.x, e.c.y + 40, good ? 22 : 10);
    this.tweens.add({ targets: e.c, scale: 0, angle: 200, alpha: 0, duration: 380, ease: 'Back.easeIn', onComplete: () => e.c.destroy() });
    this.retarget();
    this.updateHud();
  }

  cast(x, y) {
    this.wizard.setTexture('wizard_cast');
    this.time.delayedCall(320, () => this.wizard.setTexture('wizard_idle'));
    const bolt = this.add.image(this.wizard.x + 30, this.wizard.y - 190, 'spark_big').setScale(0.55).setDepth(30).setBlendMode('ADD');
    this.tweens.add({ targets: bolt, x, y: y + 30, duration: 170, ease: 'Quad.easeIn', onComplete: () => bolt.destroy() });
  }

  burst(x, y, n) {
    const p = this.add.particles(x, y, 'spark_star', { speed: { min: 120, max: 340 }, lifespan: 650, scale: { start: 0.55, end: 0 }, angle: { min: 0, max: 360 }, blendMode: 'ADD', emitting: false }).setDepth(40);
    p.explode(n);
    this.time.delayedCall(900, () => p.destroy());
  }

  floatText(x, y, str, color) {
    const t = this.add.text(x, y, str, { fontFamily: GDC.FONT_BODY, fontSize: '30px', color, stroke: GDC.CSS.ink, strokeThickness: 6 }).setOrigin(0.5).setDepth(700);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  banner(str) {
    if (this.bannerTxt) this.bannerTxt.destroy();
    const t = this.add.text(GDC.W / 2, 128, str, { fontFamily: GDC.FONT_BODY, fontSize: '19px', color: GDC.CSS.cream, backgroundColor: 'rgba(10,6,24,0.75)', padding: { x: 12, y: 8 }, align: 'center', wordWrap: { width: 480 } }).setOrigin(0.5, 0).setDepth(300);
    this.bannerTxt = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 500, onComplete: () => { if (this.bannerTxt === t) this.bannerTxt = null; t.destroy(); } });
  }

  /* ---------- traco-guia (ajuda) ---------- */
  hint() {
    if (this.state !== 'play' || !this.target) return;
    this.target.assist = true; this.refreshGhost();
  }

  refreshGhost() {
    this.hideGhost();
    const e = this.target;
    if (!e || e.dead || !(e.assist || e.wrong >= 2)) return;
    const glyph = e.items[e.idx].answer;
    const pts = GDC.Gestures.pointsFor(glyph, 0), S = 190, cx = GDC.W / 2, cy = 560;
    const norm = pts.map(([x, y]) => [cx - S / 2 + x * S, cy - S / 2 + y * S]);
    const g = this.add.graphics().setDepth(250);
    const label = this.add.text(cx, cy + S / 2 + 34, `Desenhe: ${GDC.Challenges.charOf(glyph)}`, { fontFamily: GDC.FONT_BODY, fontSize: '28px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 6 }).setOrigin(0.5).setDepth(250);
    const st = { p: 0 };
    const tw = this.tweens.add({
      targets: st, p: 1, duration: 1700, repeat: -1, repeatDelay: 600, ease: 'Sine.easeInOut',
      onUpdate: () => {
        g.clear();
        const k = Math.max(2, Math.floor(st.p * norm.length));
        [[12, GDC.C.ink, 0.55], [7, 0xffffff, 0.75]].forEach(([w, col, a]) => {
          g.lineStyle(w, col, a).beginPath().moveTo(norm[0][0], norm[0][1]);
          for (let i = 1; i < k; i++) g.lineTo(norm[i][0], norm[i][1]);
          g.strokePath();
        });
        g.fillStyle(GDC.C.gold, 1).fillCircle(norm[k - 1][0], norm[k - 1][1], 11);
      },
    });
    this.ghost = { g, label, tw };
  }

  hideGhost() {
    if (!this.ghost) return;
    this.ghost.tw.remove(); this.ghost.g.destroy(); this.ghost.label.destroy(); this.ghost = null;
  }

  /* ---------- fim de fase ---------- */
  win() {
    this.state = 'end';
    this.hideGhost();
    GDC.Audio.sfx(this, 'win');
    const stars = this.livesLost === 0 ? 3 : this.livesLost <= 2 ? 2 : 1;
    const S = GDC.Settings;
    S.data.stars[this.lv.id] = Math.max(S.data.stars[this.lv.id] || 0, stars);
    S.unlock(this.lv.id + 1); S.save();
    const last = this.index >= GDC.Challenges.LEVELS.length - 1;
    const btns = [];
    if (last) btns.push({ label: 'FINAL DA HISTÓRIA', onClick: (c) => { c.destroy(); this.leave('StoryScene', { epilogue: true }); } });
    else btns.push({ label: 'PRÓXIMA FASE', onClick: (c) => { c.destroy(); this.leave('MagicScene', { index: this.index + 1 }); } });
    btns.push({ label: 'JOGAR DE NOVO', onClick: (c) => { c.destroy(); this.leave('MagicScene', { index: this.index }); } });
    btns.push({ label: 'MENU', onClick: (c) => { c.destroy(); this.leave('MenuScene'); } });
    this.time.delayedCall(600, () => {
      this.dlg = GDC.UI.dialog(this, 'FASE CONCLUÍDA!',
        `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}\n\nPontos: ${this.score}\nMaior combo: x${this.bestCombo}\nCorações restantes: ${this.lives}`, btns, { height: 700, fontSize: 24 });
    });
  }

  lose() {
    this.state = 'end';
    this.hideGhost();
    this.time.delayedCall(500, () => {
      this.dlg = GDC.UI.dialog(this, 'A TORRE CAIU...',
        'Os servos do Paradoxo passaram pela linha dourada. Treine os símbolos e tente de novo!', [
          { label: 'TENTAR DE NOVO', onClick: (c) => { c.destroy(); this.leave('MagicScene', { index: this.index }); } },
          { label: 'MENU', onClick: (c) => { c.destroy(); this.leave('MenuScene'); } },
        ], { height: 560 });
    });
  }
}
