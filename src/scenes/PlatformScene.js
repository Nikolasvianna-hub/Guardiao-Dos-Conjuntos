/* Cena de plataforma: roda qualquer fase definida em levels.js.
   A matematica e a mecanica: portas, pontes, elementos e chefe dependem de conjuntos. */
class PlatformScene extends Phaser.Scene {
  constructor() { super('PlatformScene'); }

  init(data) { this.levelIndex = (data && data.index) || 0; }

  create() {
    const { W, H } = GDC;
    this.level = GDC_LEVELS[this.levelIndex];
    this.rnd = GDC.Math.rng((Date.now() ^ (this.levelIndex * 7919)) >>> 0);
    this.ended = false; this.paused = false;
    this.lives = GDC.LIVES; this.invuln = 0;
    this.stats = { ok: 0, bad: 0 };
    this.coyote = 0; this.jumpBuf = 0; this.castCd = 0; this.castTimer = 0; this.wasAir = false;
    this.maxX = 0; this.startFns = []; this.updaters = []; this.pads = []; this.lastRegion = 'O';
    this.solids = this.physics.add.staticGroup();
    this.items = this.physics.add.group({ allowGravity: false, immovable: true });
    this.enemies = this.physics.add.group({ allowGravity: false });
    this.bolts = this.physics.add.group({ allowGravity: false });
    this.hazards = this.physics.add.group({ allowGravity: false });
    this.zones = this.physics.add.staticGroup();
    this.makeTextures();
    this.cameras.main.fadeIn(300, 10, 6, 24);

    this.background();
    this.cp = { x: 90, y: 380 };
    this.makePlayer();

    this.level.build(this);          // monta o cenario e os desafios da fase
    this.world = Math.max(this.level.width || 0, this.maxX, W);

    this.physics.world.setBounds(0, -800, this.world, 2200);
    this.cameras.main.setBounds(0, 0, this.world, H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
    this.fitBackground();

    this.physics.add.collider(this.player, this.solids, (p, s) => this.onTouchSolid(p, s));
    this.physics.add.overlap(this.player, this.items, (p, it) => { if (it.active && it.cfg && it.cfg.onPick) it.cfg.onPick(this, it); });
    this.physics.add.overlap(this.player, this.enemies, (p, e) => { if (e.active) this.hurt('Um Paradoxo! Conjure ✦ para derrotá-lo.', e.x); });
    this.physics.add.overlap(this.player, this.hazards, (p, h) => { if (h.active) this.hurt('Cuidado!', h.x); });
    this.physics.add.overlap(this.player, this.zones, (p, z) => { if (z.active && z.onEnter) z.onEnter(this, z); });
    this.physics.add.overlap(this.bolts, this.enemies, (b, e) => { if (!b.active || !e.active) return; this.burst(e.x, e.y, 'spark_star', 14, 0xE5484D); b.destroy(); e.destroy(); GDC.Audio.sfx(this, 'right'); });
    this.physics.add.collider(this.bolts, this.solids, (b) => b.destroy());

    this.controls = new Controls(this);
    this.buildHud();
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    GDC.Audio.playMusic(this, 'game');
    this.startFns.forEach((fn) => fn(this));
  }

  /* ---------- texturas geradas por codigo ---------- */
  makeTextures() {
    if (this.textures.exists('heart')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(GDC.C.ink, 1).fillCircle(13, 14, 12).fillCircle(29, 14, 12).fillTriangle(1, 18, 41, 18, 21, 40);
    g.fillStyle(GDC.C.red, 1).fillCircle(13, 14, 9).fillCircle(29, 14, 9).fillTriangle(4, 19, 38, 19, 21, 36);
    g.fillStyle(0xffffff, 0.5).fillCircle(10, 11, 3);
    g.generateTexture('heart', 42, 42);
    g.clear();
    g.fillStyle(GDC.C.ink, 1).fillCircle(13, 14, 12).fillCircle(29, 14, 12).fillTriangle(1, 18, 41, 18, 21, 40);
    g.fillStyle(0x3a3358, 1).fillCircle(13, 14, 9).fillCircle(29, 14, 9).fillTriangle(4, 19, 38, 19, 21, 36);
    g.generateTexture('heart_empty', 42, 42);
    g.destroy();
  }

  /* ---------- fundo ilustrado com paralaxe ---------- */
  background() {
    const { W, H } = GDC;
    this.add.rectangle(W / 2, H / 2, W, H, GDC.C.night).setScrollFactor(0).setDepth(-20);
    this.bg = this.add.image(0, 0, 'bg_tower').setOrigin(0, 0).setDepth(-10);
    this.bgScale = 1.75;
    this.bg.setScale(this.bgScale);
    const focus = this.level.bgFocus || 480;
    this.bg.y = Phaser.Math.Clamp(H / 2 - focus * this.bgScale, H - 1376 * this.bgScale, 0);
    this.veil = this.add.rectangle(W / 2, H / 2, W, H, this.level.veil || 0x0d0f26, this.level.veilAlpha == null ? 0.45 : this.level.veilAlpha)
      .setScrollFactor(0).setDepth(-9);
    // poeira magica flutuando
    this.add.particles(0, 0, 'spark_small', {
      x: { min: 0, max: W }, y: { min: 60, max: H }, lifespan: 4200,
      speedY: { min: -26, max: -60 }, speedX: { min: -12, max: 12 },
      scale: { start: 0.26, end: 0 }, alpha: { start: 0.65, end: 0 }, frequency: 260, blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(-5);
  }

  fitBackground() {
    const range = Math.max(1, this.world - GDC.W);
    const slack = 768 * this.bgScale - GDC.W;
    this.bg.setScrollFactor(Math.min(0.3, slack / range), 0);
  }

  /* ---------- jogador ---------- */
  makePlayer() {
    this.player = this.add.rectangle(this.cp.x, this.cp.y, 28, 90, 0xff00ff, 0);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(400, 900);
    this.vis = this.add.sprite(this.cp.x, this.cp.y + 45, 'wizard_idle').setOrigin(0.5, 1).setDepth(20);
    this.baseScale = 116 / this.vis.height;
    this.vis.setScale(this.baseScale);
    this.facing = 1;
    this.glow = this.add.image(0, 0, 'glow').setTint(GDC.C.cyan).setAlpha(0.0).setBlendMode('ADD').setDepth(19);
  }

  /* ---------- blocos de construcao do cenario (usados por levels.js) ---------- */
  rock(x, y, w, h, o) {
    o = o || {};
    this.maxX = Math.max(this.maxX, x + w);
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 14);
    g.fillStyle(o.color || 0x4b3a8f, 1).fillRoundedRect(x, y, w, h, 12);
    if (h > 44) g.fillStyle(0x382b78, 1).fillRoundedRect(x + 6, y + 24, w - 12, h - 30, 10);
    g.lineStyle(2, 0x241a52, 0.9);
    const n = Math.min(120, Math.floor((w * h) / 2200));
    for (let i = 0; i < n; i++) {
      const rx = x + 10 + this.rnd() * (w - 24), ry = y + 18 + this.rnd() * Math.max(4, h - 26);
      g.lineBetween(rx, ry, rx + 7, ry + 9);
    }
    g.fillStyle(o.top || GDC.C.teal, 1).fillRoundedRect(x, y, w, 14, { tl: 12, tr: 12, bl: 3, br: 3 });
    g.lineStyle(3, GDC.C.ink, 1);
    for (let tx = x + 14; tx < x + w - 10; tx += 34) {
      g.fillStyle(o.top || GDC.C.teal, 1).fillTriangle(tx - 7, y + 12, tx + 7, y + 12, tx, y + 24);
    }
    return g;
  }
  solid(x, y, w, h) {
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xff00ff, 0);
    this.physics.add.existing(r, true);
    this.solids.add(r);
    return r;
  }
  ground(x, w, y) { y = y || 440; this.rock(x, y, w, 540 - y + 60); return this.solid(x, y, w, 540 - y + 60); }
  plat(x, y, w, h) { h = h || 26; this.rock(x, y, w, h); return this.solid(x, y, w, h); }
  mound(x, y, w) { this.rock(x, y, w, 440 - y + 60); return this.solid(x, y, w, 440 - y + 60); }

  sign(x, yBottom, title, body, w) {
    w = w || 300;
    const c = this.add.container(x, yBottom - 96).setDepth(6);
    const t1 = this.add.text(0, 0, title, { fontFamily: GDC.FONT, fontSize: '28px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 5, align: 'center' }).setOrigin(0.5, 0);
    const t2 = this.add.text(0, 0, body, { fontFamily: GDC.FONT_BODY, fontSize: '18px', color: GDC.CSS.cream, align: 'center', lineSpacing: 4, wordWrap: { width: w - 36 } }).setOrigin(0.5, 0);
    const h = 16 + t1.height + 6 + t2.height + 16;
    t1.y = -h - 36 + 14; t2.y = t1.y + t1.height + 6;
    const g = this.add.graphics();
    g.lineStyle(7, GDC.C.ink, 1).lineBetween(-w / 4, -36, -w / 4, 96).lineBetween(w / 4, -36, w / 4, 96);
    g.lineStyle(4, 0x7a5a2b, 1).lineBetween(-w / 4, -36, -w / 4, 96).lineBetween(w / 4, -36, w / 4, 96);
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-w / 2 - 5, -h - 36 - 5, w + 10, h + 10, 16);
    g.fillStyle(GDC.C.gold, 1).fillRoundedRect(-w / 2, -h - 36, w, h, 13);
    g.fillStyle(0x2a1f5e, 1).fillRoundedRect(-w / 2 + 5, -h - 36 + 5, w - 10, h - 10, 10);
    c.add([g, t1, t2]);
    this.maxX = Math.max(this.maxX, x + w / 2);
    return c;
  }

  checkpoint(x, y, onEnter) {
    const g = this.add.graphics().setDepth(6);
    g.lineStyle(7, GDC.C.ink, 1).lineBetween(x, y, x, y - 70);
    g.lineStyle(3, 0xcdb27a, 1).lineBetween(x, y, x, y - 70);
    g.fillStyle(GDC.C.ink, 1).fillTriangle(x - 2, y - 74, x + 40, y - 56, x - 2, y - 38);
    g.fillStyle(GDC.C.gold, 1).fillTriangle(x + 1, y - 68, x + 31, y - 56, x + 1, y - 44);
    const z = this.add.rectangle(x, y - 60, 50, 140, 0xff00ff, 0);
    this.physics.add.existing(z, true); this.zones.add(z);
    z.onEnter = (s, zone) => {
      if (zone.used) return; zone.used = true;
      s.cp = { x: x + 10, y: y - 100 };
      s.burst(x, y - 60, 'spark_star', 10, GDC.C.gold);
      GDC.Audio.sfx(s, 'collect');
      s.say('Checkpoint!', GDC.CSS.gold, 900);
      if (onEnter) onEnter(s);
    };
    return z;
  }

  crystal(x, y, cfg) {
    const tex = cfg.tex || 'crys_a';
    const glow = this.add.image(x, y, 'glow').setTint(cfg.tint || cfg.color || GDC.C.cyan).setAlpha(0.45).setScale(0.55).setBlendMode('ADD').setDepth(7);
    const it = this.physics.add.image(x, y, tex).setDepth(8);
    it.setScale((cfg.size || 52) / it.height);
    if (cfg.tint) it.setTint(cfg.tint);
    it.body.setAllowGravity(false); it.body.setImmovable(true);
    it.body.setSize(it.width * 0.9, it.height * 0.9);
    this.items.add(it);
    it.cfg = cfg; it.glow = glow;
    it.tag = cfg.tag ? this.add.text(x, y + (cfg.size || 52) / 2 + 12, cfg.tag, { fontFamily: GDC.FONT_BODY, fontSize: '15px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5).setDepth(9) : null;
    this.tweens.add({ targets: [it, glow], y: '-=9', duration: 1100 + this.rnd() * 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return it;
  }
  removeItem(it) { if (it.glow) it.glow.destroy(); if (it.tag) it.tag.destroy(); it.destroy(); }

  door(x, y, cfg) {
    const d = { open: false, x, y, cfg, nextTry: 0 };
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-62, -150, 124, 154, { tl: 60, tr: 60, bl: 8, br: 8 });
    g.fillStyle(0x8a8fb8, 1).fillRoundedRect(-56, -144, 112, 148, { tl: 56, tr: 56, bl: 6, br: 6 });
    g.fillStyle(0x1b1f4b, 1).fillRoundedRect(-42, -130, 84, 134, { tl: 42, tr: 42, bl: 4, br: 4 });
    g.lineStyle(3, GDC.C.ink, 1);
    for (let i = 0; i < 6; i++) g.lineBetween(-56, -120 + i * 24, -44, -112 + i * 24);
    d.glow = this.add.image(0, -66, 'glow').setScale(0.85).setTint(GDC.C.red).setAlpha(0.8).setBlendMode('ADD');
    d.star = this.add.image(0, -66, 'spark_big').setScale(0.5).setTint(GDC.C.red).setAlpha(0.8);
    c.add([g, d.glow, d.star]);
    d.label = cfg.label ? this.add.text(x, y - 176, cfg.label, { fontFamily: GDC.FONT_BODY, fontSize: '24px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 5, align: 'center' }).setOrigin(0.5).setDepth(7) : null;
    d.c = c;
    this.tweens.add({ targets: d.glow, scale: 1.0, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: d.star, angle: 360, duration: 4000, repeat: -1 });
    const z = this.add.rectangle(x, y - 60, 64, 120, 0xff00ff, 0);
    this.physics.add.existing(z, true); this.zones.add(z);
    z.onEnter = (s) => s.touchDoor(d);
    this.maxX = Math.max(this.maxX, x + 80);
    this.mainDoor = d;
    return d;
  }
  touchDoor(d) {
    if (this.ended) return;
    const now = this.time.now;
    if (d.open) { if (!d.finishAt) { d.finishAt = now + 650; } else if (now >= d.finishAt) this.finish(); return; }
    if (now < d.nextTry) return;
    d.nextTry = now + 1800;
    const r = d.cfg.tryOpen(this, d);
    if (r === true) this.openDoor(d);
  }
  openDoor(d) {
    d.open = true; d.finishAt = 0;
    d.glow.setTint(GDC.C.cyan); d.star.setTint(GDC.C.gold);
    this.burst(d.x, d.y - 66, 'spark_big', 18, GDC.C.cyan);
    this.cameras.main.flash(250, 79, 209, 232, false);
    GDC.Audio.sfx(this, 'door');
    this.time.addEvent({ delay: 200, loop: true, callback: () => { if (!d.finishAt && !this.ended) { /* mantem zona ativa */ } } });
  }

  enemy(x, y, minX, maxX) {
    const e = this.physics.add.sprite(x, y, 'paradox').setDepth(15);
    e.setScale(76 / e.height);
    e.body.setAllowGravity(false);
    e.body.setSize(e.width * 0.6, e.height * 0.6);
    e.setVelocityX(70); e.minX = minX; e.maxX = maxX;
    this.enemies.add(e);
    e.setVelocityX(70);
    this.tweens.add({ targets: e, scaleY: e.scaleY * 1.08, scaleX: e.scaleX * 0.95, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.updaters.push(() => {
      if (!e.active) return;
      if (e.x < e.minX) { e.x = e.minX; e.setVelocityX(70); e.setFlipX(false); }
      if (e.x > e.maxX) { e.x = e.maxX; e.setVelocityX(-70); e.setFlipX(true); }
    });
    return e;
  }

  /* pedra da ponte de Venn: so aguenta se a regiao satisfaz a regra */
  tile(x, y, region, valid) {
    const w = 104, h = 26;
    const col = GDC.REGION_COLOR[region];
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(GDC.C.ink, 1).fillRoundedRect(-w / 2 - 4, -4, w + 8, h + 8, 12);
    g.fillStyle(col, 1).fillRoundedRect(-w / 2, 0, w, h, 9);
    g.fillStyle(0xffffff, 0.28).fillRoundedRect(-w / 2 + 6, 3, w - 12, 7, 4);
    const t = this.add.text(0, h / 2 + 1, GDC.Math.REGION_LABEL[region], { fontFamily: GDC.FONT_BODY, fontSize: '17px', color: '#0a0618' }).setOrigin(0.5);
    c.add([g, t]);
    const r = this.solid(x - w / 2, y, w, h);
    r.tileInfo = { region, valid, state: 'idle', c };
    this.maxX = Math.max(this.maxX, x + w);
    return r;
  }
  onTouchSolid(p, s) {
    const t = s.tileInfo;
    if (!t || t.state !== 'idle' || !(p.body.touching.down || p.body.blocked.down)) return;
    if (p.body.bottom > s.body.top + 10) return;
    t.state = 'used';
    if (t.valid) {
      this.ok(null, s.x, s.y - 20);
      this.tweens.add({ targets: t.c, y: t.c.y + 5, duration: 90, yoyo: true });
    } else {
      this.stats.bad++; this.updateHud();
      GDC.Audio.sfx(this, 'crumble');
      this.say('Essa pedra NÃO satisfaz a regra e vai desmoronar!', GDC.CSS.red, 1600);
      this.tweens.add({ targets: t.c, x: t.c.x + 4, duration: 45, yoyo: true, repeat: 4 });
      this.time.delayedCall(260, () => {
        s.body.enable = false;
        this.tweens.add({ targets: t.c, y: t.c.y + 360, alpha: 0, angle: 12, duration: 700 });
      });
    }
  }

  /* plataforma de conjunto fixa (chefe): guarda a regiao */
  pad(x, y, w, region) {
    const r = this.plat(x, y, w, 26);
    this.pads.push({ x, y, w, region });
    const t = this.add.text(x + w / 2, y + 40, GDC.Math.REGION_LABEL[region], { fontFamily: GDC.FONT_BODY, fontSize: '20px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 4 }).setOrigin(0.5).setDepth(7);
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(GDC.REGION_COLOR[region], 0.9).fillRoundedRect(x + 4, y + 16, w - 8, 8, 4);
    return r;
  }
  standRegion() {
    const b = this.player.body;
    if (b.blocked.down || b.touching.down) {
      const px = this.player.x, bottom = b.bottom;
      const pad = this.pads.find((p) => Math.abs(bottom - p.y) < 6 && px > p.x - 6 && px < p.x + p.w + 6);
      this.lastRegion = pad ? pad.region : 'O';
    }
    return this.lastRegion;
  }

  addUpdater(fn) { this.updaters.push(fn); }

  legend() {
    const items = [['A', 'A'], ['B', 'B'], ['A∩B', 'AB'], ['fora', 'O']];
    const startX = GDC.W / 2 - 170;
    items.forEach(([lab, reg], i) => {
      const x = startX + i * 112, y = 104;
      this.add.rectangle(x, y, 100, 28, GDC.C.ink, 1).setScrollFactor(0).setDepth(900);
      this.add.rectangle(x, y, 92, 22, GDC.REGION_COLOR[reg], 1).setScrollFactor(0).setDepth(901);
      this.add.text(x, y, lab, { fontFamily: GDC.FONT_BODY, fontSize: '16px', color: '#0a0618' }).setOrigin(0.5).setScrollFactor(0).setDepth(902);
    });
  }

  /* ---------- feedback e HUD ---------- */
  burst(x, y, tex, n, tint) {
    const e = this.add.particles(x, y, tex, {
      speed: { min: 90, max: 260 }, lifespan: 560, gravityY: 320, scale: { start: 0.7, end: 0 },
      alpha: { start: 1, end: 0 }, tint: tint || 0xffffff, emitting: false, blendMode: 'ADD',
    }).setDepth(60);
    e.explode(n);
    this.time.delayedCall(800, () => e.destroy());
  }

  ok(msg, x, y) {
    this.stats.ok++; this.updateHud();
    GDC.Audio.sfx(this, 'right');
    this.burst(x == null ? this.player.x : x, y == null ? this.player.y - 40 : y, 'spark_star', 12, GDC.C.gold);
    if (msg) this.say(msg, GDC.CSS.green, 1700);
  }
  wrong(msg) {
    this.stats.bad++; this.updateHud();
    GDC.Audio.sfx(this, 'wrong');
    this.say(msg, GDC.CSS.red, 2600);
    this.hurt(null, this.player.x + 1, true);
  }

  buildHud() {
    const { W } = GDC;
    const sf = (o, d) => o.setScrollFactor(0).setDepth(d || 900);
    this.hearts = [];
    for (let i = 0; i < GDC.LIVES; i++) this.hearts.push(sf(this.add.image(34 + i * 40, 34, 'heart').setScale(0.9)));
    this.lvlText = sf(this.add.text(16, 62, `FASE ${this.levelIndex + 1}  ${this.level.name}`, { fontFamily: GDC.FONT_BODY, fontSize: '16px', color: GDC.CSS.soft, stroke: GDC.CSS.ink, strokeThickness: 4 }));
    this.statText = sf(this.add.text(16, 84, '', { fontFamily: GDC.FONT_BODY, fontSize: '16px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 4 }));
    this.counterBg = sf(this.add.graphics(), 899);
    this.counterText = sf(this.add.text(W / 2, 34, '', { fontFamily: GDC.FONT_BODY, fontSize: '24px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 5, align: 'center' }).setOrigin(0.5));
    this.toastBg = sf(this.add.graphics(), 949);
    this.toast = sf(this.add.text(W / 2, 150, '', { fontFamily: GDC.FONT_BODY, fontSize: '24px', color: GDC.CSS.cream, stroke: GDC.CSS.ink, strokeThickness: 5, align: 'center', wordWrap: { width: 720 } }).setOrigin(0.5), 950).setAlpha(0);
    const mkBtn = (x, icon, fn) => {
      const b = sf(this.add.image(x, 38, icon), 920);
      b.setScale(54 / b.height).setInteractive({ useHandCursor: true });
      b.on('pointerdown', () => { b.setScale(50 / b.height); GDC.Audio.sfx(this, 'click'); });
      b.on('pointerup', () => { b.setScale(54 / b.height); fn(); });
      b.on('pointerout', () => b.setScale(54 / b.height));
      return b;
    };
    mkBtn(W - 40, 'icon_gear', () => this.togglePause());
    mkBtn(W - 104, 'icon_help', () => this.showHint());
    this.updateHud();
  }

  updateHud() {
    this.hearts.forEach((h, i) => h.setTexture(i < this.lives ? 'heart' : 'heart_empty'));
    const n = this.stats.ok + this.stats.bad;
    this.statText.setText(`Interações com conjuntos: ${n}`);
  }

  counter(text) {
    this.counterText.setText(text);
    const w = this.counterText.width + 40;
    this.counterBg.clear();
    if (!text) return;
    this.counterBg.fillStyle(GDC.C.ink, 0.85).fillRoundedRect(GDC.W / 2 - w / 2 - 4, 8, w + 8, 52, 16);
    this.counterBg.fillStyle(GDC.C.violet, 0.9).fillRoundedRect(GDC.W / 2 - w / 2, 12, w, 44, 13);
  }

  say(text, color, ms) {
    this.toast.setText(text).setColor(color || GDC.CSS.cream).setAlpha(1);
    const w = this.toast.width + 36, h = this.toast.height + 20;
    this.toastBg.clear().setAlpha(1);
    this.toastBg.fillStyle(GDC.C.ink, 0.88).fillRoundedRect(GDC.W / 2 - w / 2, 150 - h / 2, w, h, 16);
    if (this.toastTween) this.toastTween.remove();
    this.toastTween = this.tweens.add({ targets: [this.toast, this.toastBg], alpha: 0, delay: ms || 1800, duration: 400 });
  }

  /* ---------- dano, vidas e reaparecimento ---------- */
  hurt(msg, fromX, silent) {
    if (this.ended || this.invuln > 0) return;
    this.lives--; this.invuln = 1500;
    this.updateHud();
    if (!silent) { GDC.Audio.sfx(this, 'hurt'); if (msg) this.say(msg, GDC.CSS.red, 1800); }
    this.cameras.main.shake(180, 0.008);
    const dir = this.player.x < fromX ? -1 : 1;
    this.player.body.setVelocity(dir * 260, -330);
    this.vis.setTint(0xff6a6a);
    this.time.delayedCall(180, () => this.vis.clearTint());
    if (this.lives <= 0) this.gameOver();
  }

  fell() {
    if (this.ended) return;
    GDC.Audio.sfx(this, 'hurt');
    if (this.invuln <= 0) { this.lives--; this.updateHud(); this.say('Você caiu! Volte ao último ponto de retorno.', GDC.CSS.red, 1800); }
    this.invuln = 1500;
    this.player.body.setVelocity(0, 0);
    this.player.setPosition(this.cp.x, this.cp.y);
    if (this.lives <= 0) this.gameOver();
  }

  togglePause() {
    if (this.ended) return;
    if (this.paused) { this.closeDialog(); this.paused = false; this.physics.resume(); return; }
    this.paused = true; this.physics.pause();
    this.dialog = GDC.UI.dialog(this, 'PAUSA', 'Respire e pense nos conjuntos.', [
      { label: 'CONTINUAR', onClick: () => this.togglePause() },
      { label: 'REINICIAR', onClick: () => this.scene.restart({ index: this.levelIndex }) },
      { label: 'MENU', onClick: () => { this.physics.resume(); GDC.UI.goTo(this, 'LevelSelectScene'); } },
    ], { height: 400, width: 800 });
  }

  showHint() {
    if (this.ended) return;
    if (this.paused) return;
    this.paused = true; this.physics.pause();
    this.dialog = GDC.UI.dialog(this, 'DICA', this.level.hint, [
      { label: 'ENTENDI', onClick: () => { this.closeDialog(); this.paused = false; this.physics.resume(); } },
    ], { height: 480, width: 840, fontSize: 21 });
  }
  closeDialog() {
    if (this.dialog) { this.dialog.destroy(); this.dialog = null; }
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(60, 40);
  }

  gameOver() {
    this.ended = true; this.physics.pause();
    GDC.Audio.sfx(this, 'wrong');
    this.dialog = GDC.UI.dialog(this, 'OS PARADOXOS VENCERAM', 'Mas todo Guardião aprende com os erros.\nRevise a dica (?) e tente de novo: os números mudam a cada tentativa.', [
      { label: 'TENTAR DE NOVO', onClick: () => this.scene.restart({ index: this.levelIndex }) },
      { label: 'MENU', onClick: () => GDC.UI.goTo(this, 'LevelSelectScene') },
    ], { height: 440, width: 820 });
  }

  finish() {
    if (this.ended) return;
    this.ended = true; this.physics.pause();
    GDC.Audio.sfx(this, 'win');
    const { ok, bad } = this.stats;
    const total = ok + bad, acc = total ? ok / total : 1;
    const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const prev = GDC.Settings.data.stars[this.level.id] || 0;
    GDC.Settings.data.stars[this.level.id] = Math.max(prev, stars);
    GDC.Settings.unlock(this.levelIndex + 2); GDC.Settings.save();
    const last = this.levelIndex >= GDC_LEVELS.length - 1;
    const body = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}\nInterações com o conteúdo: ${total}  (acertos ${ok}, erros ${bad})\n\n${this.level.learn(this)}`;
    this.dialog = GDC.UI.dialog(this, last ? 'VITÓRIA!' : 'FASE CONCLUÍDA!', body, [
      { label: last ? 'FINAL' : 'PRÓXIMA FASE', onClick: () => last ? GDC.UI.goTo(this, 'StoryScene', { epilogue: true }) : GDC.UI.goTo(this, 'PlatformScene', { index: this.levelIndex + 1 }) },
      { label: 'MENU', onClick: () => GDC.UI.goTo(this, 'LevelSelectScene') },
    ], { height: 520, width: 840, fontSize: 21 });
  }

  /* ---------- laco principal ---------- */
  update(time, delta) {
    if (this.paused || this.ended || !this.controls) return;
    const c = this.controls; c.update();
    const p = this.player, b = p.body;
    const onGround = b.blocked.down || b.touching.down;
    this.invuln = Math.max(0, this.invuln - delta);
    this.castCd = Math.max(0, this.castCd - delta);
    this.castTimer = Math.max(0, this.castTimer - delta);
    this.coyote = onGround ? 110 : this.coyote - delta;
    this.jumpBuf = c.jumpPressed ? 130 : this.jumpBuf - delta;

    if (this.jumpBuf > 0 && this.coyote > 0) {
      b.setVelocityY(-640); this.coyote = 0; this.jumpBuf = 0;
      GDC.Audio.sfx(this, 'jump');
      this.tweens.add({ targets: this.vis, scaleY: this.baseScale * 1.14, scaleX: this.baseScale * 0.9, duration: 110, yoyo: true });
    }
    if (!c.jumpHeld && b.velocity.y < -240) b.setVelocityY(b.velocity.y * 0.82);

    const target = c.dir * 240, accel = (onGround ? 2600 : 1700) * (delta / 1000);
    const vx = b.velocity.x;
    b.setVelocityX(vx + Phaser.Math.Clamp(target - vx, -accel, accel));
    if (c.dir !== 0) this.facing = c.dir;

    if (c.castPressed && this.castCd <= 0) this.cast();

    if (this.wasAir && onGround) {
      GDC.Audio.sfx(this, 'land');
      this.tweens.add({ targets: this.vis, scaleY: this.baseScale * 0.86, scaleX: this.baseScale * 1.12, duration: 80, yoyo: true });
    }
    this.wasAir = !onGround;

    this.animate(time, onGround, c);
    this.standRegion();
    this.updaters.forEach((fn) => fn(time, delta));
    if (p.y > 640) this.fell();
  }

  cast() {
    this.castCd = 320; this.castTimer = 240;
    GDC.Audio.sfx(this, 'cast');
    const s = this.physics.add.image(this.player.x + this.facing * 36, this.player.y - 14, 'spark_big');
    s.setScale(0.55).setDepth(25).setBlendMode('ADD').setTint(0x9ff0ff);
    this.bolts.add(s);
    s.body.setAllowGravity(false); s.body.setSize(40, 40);
    s.setVelocityX(this.facing * 640);
    s.region = this.lastRegion;
    this.tweens.add({ targets: s, angle: 360, duration: 500, repeat: -1 });
    this.time.delayedCall(900, () => { if (s.active) s.destroy(); });
    this.burst(s.x, s.y, 'spark_small', 6, GDC.C.cyan);
    if (this.level.onCast) this.level.onCast(this, s);
  }

  /* animacao de "borracha": estica, amassa e balanca (sem quadros extras) */
  animate(time, onGround, c) {
    const v = this.vis, p = this.player, bs = this.baseScale;
    v.setPosition(p.x, p.body.bottom + 1);
    v.setFlipX(this.facing < 0);
    const casting = this.castTimer > 0;
    v.setTexture(casting ? 'wizard_cast' : 'wizard_idle');
    const k = (casting ? 1.06 : 1) * bs * (v.texture.key === 'wizard_cast' ? 1.0 : 1);
    if (this.tweens.getTweensOf(v).length === 0) {
      if (!onGround) {
        const rising = p.body.velocity.y < 0;
        v.setScale(k * (rising ? 0.94 : 0.97), k * (rising ? 1.08 : 1.04));
        v.setAngle(Phaser.Math.Clamp(p.body.velocity.x * 0.015, -5, 5));
      } else if (Math.abs(p.body.velocity.x) > 30) {
        const t = time * 0.022;
        v.setScale(k * (1 + Math.sin(t * 2) * 0.03), k * (1 - Math.sin(t * 2) * 0.04));
        v.setAngle(Math.sin(t) * 5);
      } else {
        const t = time * 0.003;
        v.setScale(k * (1 - Math.sin(t) * 0.01), k * (1 + Math.sin(t) * 0.022));
        v.setAngle(Math.sin(t * 0.7) * 0.8);
      }
    }
    const blink = this.invuln > 0 && Math.floor(time / 90) % 2 === 0;
    v.setAlpha(blink ? 0.4 : 1);
    this.glow.setPosition(p.x, p.y).setAlpha(casting ? 0.5 : 0);
  }
}
