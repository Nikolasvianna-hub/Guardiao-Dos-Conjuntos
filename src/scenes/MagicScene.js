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
    this.hitY = 810;
    this.cameras.main.fadeIn(300, 10, 6, 24);
    this.add.image(W / 2, 0, 'bg_tower').setOrigin(0.5, 0).setScale(H / 1376);
    // linha de defesa discreta
    const ln = this.add.graphics().setDepth(2);
    for (let x = 0; x < W; x += 26) ln.fillStyle(0xFFF3D1, 0.45).fillRect(x, this.hitY, 14, 3);

    this.bigNum = this.add.text(W / 2, 470, '0', { fontFamily: GDC.FONT, fontSize: '300px', color: '#7fe3f0' }).setOrigin(0.5).setAlpha(0.28).setDepth(1);
    this.wizard = this.add.image(W / 2, H - 6, 'wizard_idle').setOrigin(0.5, 1).setDepth(5);
    this.wizScale = 200 / this.wizard.height; this.wizard.setScale(this.wizScale);
    this.tweens.add({ targets: this.wizard, scaleY: this.wizScale * 1.025, scaleX: this.wizScale * 0.985, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

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

  hints() { return GDC.Settings.data.hints; }

  /* ---------- interface (enxuta, como no Magic Touch) ---------- */
  buildHud() {
    const { W } = GDC;
    this.heartImgs = [];
    for (let i = 0; i < GDC.LIVES; i++) this.heartImgs.push(this.add.image(26 + i * 32, 30, 'hud_heart').setScale(0.44).setDepth(101));
    this.scoreTxt = this.add.text(14, 54, '0', { fontFamily: GDC.FONT, fontSize: '44px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 7 }).setDepth(101);
    this.comboTxt = this.add.text(W / 2, 40, '', { fontFamily: GDC.FONT, fontSize: '54px', color: '#ffd84a', stroke: GDC.CSS.ink, strokeThickness: 8 }).setOrigin(0.5).setAngle(-6).setDepth(101);
    // pausa: quadrado teal com barras douradas, desenhado em codigo
    const pb = this.add.container(W - 36, 36).setDepth(102);
    const g = this.add.graphics();
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-24, -24, 48, 52, 13);
    g.fillStyle(GDC.C.gold, 1).fillRoundedRect(-21, -21, 42, 45, 11);
    g.fillStyle(0x0f7a8a, 1).fillRoundedRect(-17, -17, 34, 36, 8);
    g.fillStyle(GDC.C.gold, 1).fillRoundedRect(-8, -8, 5, 18, 2).fillRoundedRect(3, -8, 5, 18, 2);
    pb.add(g);
    const hit = this.add.rectangle(0, 0, 60, 64, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    pb.add(hit); hit.on('pointerup', () => { GDC.Audio.sfx(this, 'click'); this.pause(); });
    if (this.hints()) {
      const hb = this.helpBtn = this.add.image(W - 36, 96, 'icon_help').setDepth(102).setInteractive({ useHandCursor: true });
      hb.setScale(44 / hb.height); hb.on('pointerup', () => { GDC.Audio.sfx(this, 'click'); this.hint(); });
    }
    this.updateHud();
  }

  updateHud() {
    this.heartImgs.forEach((h, i) => { h.setAlpha(i < this.lives ? 1 : 0.25); });
    this.scoreTxt.setText(String(this.score));
    this.bigNum.setText(String(this.killed));
    this.comboTxt.setText(this.combo >= 3 ? `COMBO x${this.combo}` : '');
  }

  intro() {
    this.state = 'dialog';
    this.dlg = GDC.UI.dialog(this, 'COMO JOGAR',
      'Inimigos descem presos a balões com desafios de conjuntos.\n\nDESENHE com o dedo o símbolo que responde ao desafio.\n\nExemplo: "A ? B  união" pede o símbolo ∪ (um U).\n\nNo começo, um traço-guia mostra como desenhar.',
      [{ label: 'VAMOS LÁ!', onClick: (c) => { c.destroy(); this.beginLevel(); } }], { height: 700, fontSize: 21 });
  }

  beginLevel() {
    this.state = 'play';
    const t = GDC.UI.title(this, GDC.W / 2, 400, `FASE ${this.lv.id}\n${this.lv.name.toUpperCase()}`, 60).setDepth(950);
    this.tweens.add({ targets: t, alpha: 0, y: 360, delay: 1300, duration: 500, onComplete: () => t.destroy() });
  }

  pause() {
    if (this.state !== 'play') return;
    this.state = 'dialog';
    const s = GDC.Settings.data;
    this.dlg = GDC.UI.dialog(this, 'PAUSA', 'O jogo está parado.', [
      { label: 'CONTINUAR', onClick: (c) => { c.destroy(); this.state = 'play'; } },
      { label: `DICAS: ${s.hints ? 'LIGADAS' : 'DESLIGADAS'}`, onClick: (c, b) => { s.hints = !s.hints; GDC.Settings.save(); b.setLabel(`DICAS: ${s.hints ? 'LIGADAS' : 'DESLIGADAS'}`); this.hideGhost(); if (!s.hints && this.helpBtn) this.helpBtn.setVisible(false); } },
      { label: 'GLOSSÁRIO', onClick: (c) => { c.destroy(); this.glossary(); } },
      { label: 'MENU', onClick: (c) => { c.destroy(); this.leave('MenuScene'); } },
    ], { height: 620 });
  }

  glossary() {
    this.dlg = GDC.UI.dialog(this, 'GLOSSÁRIO', GDC.GLOSSARY, [{ label: 'VOLTAR', onClick: (c) => { c.destroy(); this.state = 'play'; this.pause(); } }], { height: 760, fontSize: 19 });
  }

  leave(key, data) { GDC.UI.goTo(this, key, data); }

  /* ---------- inimigos: balao dourado com placa de texto, preso a um servo ---------- */
  spawn() {
    const item = this.queue.shift();
    let x = 0;
    for (let k = 0; k < 20; k++) { x = 85 + Math.random() * 370; if (Math.abs(x - this.lastX) > 130) break; }
    this.lastX = x;
    const boss = item.boss;
    const c = this.add.container(x, -140).setDepth(20);
    const glow = this.add.image(0, 0, 'spark_big').setBlendMode('ADD').setTint(GDC.C.gold).setAlpha(0.0);
    const rope = this.add.graphics();
    const balloon = this.add.image(0, 0, boss ? 'paradox' : 'balloon_gold');
    const plate = this.add.graphics();
    const foeKey = boss ? null : ['foe_goblin', 'foe_skeleton', 'foe_imp', 'foe_orc'][this.spawned % 4 === 0 && Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 4)];
    const foe = foeKey ? this.add.image(0, 0, foeKey).setOrigin(0.5, 0) : null;
    const content = this.add.container(0, 0);
    c.add([glow, rope, ...(foe ? [foe] : []), balloon, plate, content]);
    const e = { c, glow, rope, balloon, plate, foe, content, items: item.items, idx: 0, boss, wrong: 0, assist: this.index === 0 && this.spawned < 3 && this.hints(), w: 0, h: 0,
      speed: this.lv.speed * (boss ? 0.7 : 1) * (this.index === 0 && this.spawned === 0 ? 0.65 : 1), dead: false };
    this.spawned++;
    this.setItem(e);
    if (foe) this.tweens.add({ targets: foe, angle: { from: -4, to: 4 }, duration: 700 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: balloon, scaleY: { from: balloon.scaleY, to: balloon.scaleY * 1.03 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.enemies.push(e);
    this.retarget();
  }

  setItem(e) {
    e.content.removeAll(true);
    const it = e.items[e.idx];
    const parts = []; let w = 0;
    if (it.venn) { const im = this.add.image(0, 0, it.venn).setScale(0.8); parts.push([im, im.displayHeight]); w = Math.max(w, im.displayWidth); }
    it.lines.forEach((ln) => {
      const t = this.add.text(0, 0, ln.t, { fontFamily: GDC.FONT_BODY, fontSize: ln.k === 'main' ? '20px' : '16px', color: ln.k === 'main' ? '#1B1F4B' : '#5B3FA0' }).setOrigin(0.5);
      parts.push([t, t.height]); w = Math.max(w, t.width);
    });
    const total = parts.reduce((s, p) => s + p[1], 0);
    let y = -total / 2;
    parts.forEach(([o, hh]) => { o.setY(y + hh / 2); e.content.add(o); y += hh; });
    e.w = Math.max(96, w + 20); e.h = total + 16;
    if (e.items.length > 1) {
      for (let k = 0; k < e.items.length; k++) e.content.add(this.add.circle((k - (e.items.length - 1) / 2) * 16, e.h / 2 + 8, 5, k < e.idx ? GDC.C.cyan : (k === e.idx ? GDC.C.gold : GDC.C.grey)).setStrokeStyle(2, GDC.C.ink));
    }
    // balao oval do tamanho da placa
    const bw = Math.max(140, e.w + 44), bh = Math.max(120, e.h + 56);
    e.bw = bw; e.bh = bh;
    e.balloon.setDisplaySize(bw, bh);
    e.glow.setDisplaySize(bw * 1.5, bh * 1.5);
    const py = e.boss ? bh / 2 - 10 : -4;
    e.content.setY(py); e.plateY = py;
    this.drawPlate(e);
    if (e.foe) { e.foe.setScale(74 / e.foe.height); e.foe.setY(bh / 2 + 18); }
    e.rope.clear().lineStyle(3, GDC.C.ink, 1).lineBetween(0, bh / 2 - 6, 0, bh / 2 + 26);
    e.bottom = e.boss ? bh / 2 + 36 : bh / 2 + 18 + 74;
  }

  drawPlate(e) {
    const g = e.plate; g.clear();
    const w = e.w, h = e.h, y = e.plateY;
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, 18);
    g.fillStyle(GDC.C.cream, 1).fillRoundedRect(-w / 2, y - h / 2, w, h, 15);
  }

  retarget() {
    const prev = this.target;
    this.target = this.enemies.reduce((m, e) => (!m || e.c.y > m.c.y ? e : m), null);
    if (prev !== this.target) {
      if (prev && !prev.dead) prev.glow.setAlpha(0);
      if (this.target) { this.target.glow.setAlpha(0.35); }
      this.pending = null; this.refreshGhost();
    }
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
    if (this.pending) { this.stroke = this.pending.points.slice(); this.pending.timer.remove(); this.pending = null; }
    else { this.stroke = []; this.trail.clear(); this.trail.setAlpha(1); }
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
    if (this.hints()) this.banner(it.expl);
    this.hideGhost();
    e.idx++; e.wrong = 0;
    if (e.idx < e.items.length) {
      this.boom(e.c.x, e.c.y, 0.5);
      this.tweens.add({ targets: e.c, scale: { from: 1.12, to: 1 }, duration: 200 });
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
    if (this.hints()) {
      const shown = res && res.best ? GDC.Challenges.charOf(res.best) : '?';
      this.floatText(e.c.x, e.c.y + 10, `parece ${shown}`, '#ff8d92');
    }
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
    this.boom(e.c.x, e.c.y, good ? 0.9 : 0.5);
    // o balao estoura e o servo cai girando
    [e.balloon, e.plate, e.content, e.rope, e.glow].forEach((o) => this.tweens.add({ targets: o, alpha: 0, scale: o === e.balloon ? o.scaleX * 1.25 : o.scale, duration: 160 }));
    if (e.foe) this.tweens.add({ targets: e.foe, y: e.foe.y + 420, angle: 220, alpha: 0, duration: 650, ease: 'Quad.easeIn' });
    this.time.delayedCall(700, () => e.c.destroy());
    this.retarget();
    this.updateHud();
  }

  cast(x, y) {
    this.tweens.add({ targets: this.wizard, angle: { from: -3, to: 0 }, duration: 220, ease: 'Back.easeOut' });
    const sx = this.wizard.x - 62, sy = this.wizard.y - 182;
    const bolt = this.add.image(sx, sy, 'spark_big').setScale(0.5).setDepth(30).setBlendMode('ADD');
    this.tweens.add({ targets: bolt, x, y: y + 30, duration: 170, ease: 'Quad.easeIn', onComplete: () => bolt.destroy() });
  }

  boom(x, y, s) {
    const b = this.add.image(x, y + 20, Math.random() < 0.5 ? 'boom1' : 'boom2').setDepth(40).setScale(0.2 * s).setBlendMode('NORMAL');
    this.tweens.add({ targets: b, scale: 1.1 * s, alpha: 0, angle: Phaser.Math.Between(-25, 25), duration: 420, ease: 'Cubic.easeOut', onComplete: () => b.destroy() });
    const p = this.add.particles(x, y, 'spark_star', { speed: { min: 120, max: 320 }, lifespan: 600, scale: { start: 0.45, end: 0 }, angle: { min: 0, max: 360 }, blendMode: 'ADD', emitting: false }).setDepth(41);
    p.explode(Math.round(12 * s));
    this.time.delayedCall(800, () => p.destroy());
  }

  floatText(x, y, str, color) {
    const t = this.add.text(x, y, str, { fontFamily: GDC.FONT_BODY, fontSize: '30px', color, stroke: GDC.CSS.ink, strokeThickness: 6 }).setOrigin(0.5).setDepth(700);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
  }

  banner(str) {
    if (this.bannerTxt) this.bannerTxt.destroy();
    const t = this.add.text(GDC.W / 2, 140, str, { fontFamily: GDC.FONT_BODY, fontSize: '18px', color: GDC.CSS.cream, backgroundColor: 'rgba(10,6,24,0.7)', padding: { x: 12, y: 7 }, align: 'center', wordWrap: { width: 470 } }).setOrigin(0.5, 0).setDepth(300);
    this.bannerTxt = t;
    this.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 400, onComplete: () => { if (this.bannerTxt === t) this.bannerTxt = null; t.destroy(); } });
  }

  /* ---------- traco-guia (dicas) ---------- */
  hint() {
    if (this.state !== 'play' || !this.target || !this.hints()) return;
    this.target.assist = true; this.refreshGhost();
  }

  refreshGhost() {
    this.hideGhost();
    const e = this.target;
    if (!this.hints() || !e || e.dead || !(e.assist || e.wrong >= 2)) return;
    const glyph = e.items[e.idx].answer;
    const pts = GDC.Gestures.pointsFor(glyph, 0), S = 170, cx = GDC.W / 2 - 40, cy = 600;
    const norm = pts.map(([x, y]) => [cx - S / 2 + x * S, cy - S / 2 + y * S]);
    const g = this.add.graphics().setDepth(250);
    const objs = [g];
    if (this.textures.exists('sym_' + glyph)) {
      const sb = this.add.image(cx + S / 2 + 75, cy, 'sym_' + glyph).setDepth(250).setScale(0.85);
      this.tweens.add({ targets: sb, y: cy - 8, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut' });
      objs.push(sb);
    } else {
      objs.push(this.add.text(cx + S / 2 + 70, cy, GDC.Challenges.charOf(glyph), { fontFamily: GDC.FONT_BODY, fontSize: '64px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 8 }).setOrigin(0.5).setDepth(250));
    }
    const st = { p: 0 };
    const tw = this.tweens.add({
      targets: st, p: 1, duration: 1700, repeat: -1, repeatDelay: 600, ease: 'Sine.easeInOut',
      onUpdate: () => {
        g.clear();
        const k = Math.max(2, Math.floor(st.p * norm.length));
        [[12, GDC.C.ink, 0.6], [7, 0xffffff, 0.85]].forEach(([w, col, a]) => {
          g.lineStyle(w, col, a).beginPath().moveTo(norm[0][0], norm[0][1]);
          for (let i = 1; i < k; i++) g.lineTo(norm[i][0], norm[i][1]);
          g.strokePath();
        });
        g.fillStyle(GDC.C.gold, 1).fillCircle(norm[k - 1][0], norm[k - 1][1], 11);
      },
    });
    this.ghost = { objs, tw };
  }

  hideGhost() {
    if (!this.ghost) return;
    this.ghost.tw.remove(); this.ghost.objs.forEach((o) => o.destroy()); this.ghost = null;
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
      this.dlg = GDC.UI.dialog(this, 'O CASTELO CAIU...',
        'Os servos do Paradoxo passaram pela linha de defesa. Treine os símbolos e tente de novo!', [
          { label: 'TENTAR DE NOVO', onClick: (c) => { c.destroy(); this.leave('MagicScene', { index: this.index }); } },
          { label: 'MENU', onClick: (c) => { c.destroy(); this.leave('MenuScene'); } },
        ], { height: 560 });
    });
  }
}
