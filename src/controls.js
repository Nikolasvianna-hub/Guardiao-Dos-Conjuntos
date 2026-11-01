/* Controles: teclado (setas/WASD + espaco + Z/X), gamepad e botoes virtuais no celular.
   A cena le: dir (-1,0,1), jumpHeld, jumpPressed, castPressed. */
class Controls {
  constructor(scene) {
    this.scene = scene;
    this.dir = 0; this.jumpHeld = false; this.jumpPressed = false; this.castPressed = false;
    this.touch = { left: false, right: false, jump: false, cast: false };
    this._prevJump = false; this._prevCast = false; this._prevPad = { jump: false, cast: false };

    const kb = scene.input.keyboard;
    this.keys = kb.addKeys({
      left: 'LEFT', right: 'RIGHT', up: 'UP', a: 'A', d: 'D', w: 'W', space: 'SPACE',
      z: 'Z', x: 'X', k: 'K', j: 'J', shift: 'SHIFT',
    });
    scene.input.addPointer(3);

    const forced = /[?&]touch=1/.test(window.location.search);
    const isTouch = scene.sys.game.device.input.touch || forced;
    this.container = scene.add.container(0, 0).setDepth(1000).setScrollFactor(0);
    this._build();
    this.container.setVisible(isTouch);
    scene.input.once('pointerdown', (p) => { if (p.wasTouch) this.container.setVisible(true); });
  }

  _btn(x, y, r, label, key, size) {
    const s = this.scene;
    const g = s.add.graphics().setScrollFactor(0);
    const draw = (down) => {
      g.clear();
      g.fillStyle(GDC.C.ink, down ? 0.85 : 0.6).fillCircle(x, y + 3, r + 4);
      g.fillStyle(down ? GDC.C.gold : GDC.C.violet, down ? 0.95 : 0.65).fillCircle(x, y, r);
      g.lineStyle(5, GDC.C.gold, down ? 1 : 0.8).strokeCircle(x, y, r - 2);
    };
    draw(false);
    const t = s.add.text(x, y, label, { fontFamily: GDC.FONT_BODY, fontSize: (size || 40) + 'px', color: GDC.CSS.cream,
      stroke: GDC.CSS.ink, strokeThickness: 5 }).setOrigin(0.5).setScrollFactor(0);
    const hit = s.add.circle(x, y, r + 14, 0xffffff, 0.001).setScrollFactor(0).setInteractive();
    const press = () => { this.touch[key] = true; draw(true); };
    const rel = () => { this.touch[key] = false; draw(false); };
    hit.on('pointerdown', press);
    hit.on('pointerover', (p) => { if (p.isDown) press(); });
    hit.on('pointerup', rel); hit.on('pointerout', rel); hit.on('pointerupoutside', rel);
    this.container.add([g, t, hit]);
  }

  _build() {
    const { H, W } = GDC;
    this._btn(76, H - 66, 48, '◀', 'left', 34);
    this._btn(190, H - 66, 48, '▶', 'right', 34);
    this._btn(W - 80, H - 72, 54, '▲', 'jump', 36);
    this._btn(W - 192, H - 56, 40, '✦', 'cast', 30);
  }

  setVisible(v) { this.container.setVisible(v); }

  update() {
    const k = this.keys;
    let dir = 0;
    if (k.left.isDown || k.a.isDown || this.touch.left) dir -= 1;
    if (k.right.isDown || k.d.isDown || this.touch.right) dir += 1;
    let jump = k.space.isDown || k.up.isDown || k.w.isDown || this.touch.jump;
    let cast = k.z.isDown || k.x.isDown || k.k.isDown || k.j.isDown || k.shift.isDown || this.touch.cast;

    const gp = this.scene.input.gamepad;
    if (gp && gp.total > 0) {
      const pad = gp.getPad(0);
      if (pad) {
        const ax = pad.axes.length ? pad.axes[0].getValue() : 0;
        if (pad.left || ax < -0.4) dir -= 1;
        if (pad.right || ax > 0.4) dir += 1;
        if (pad.A || pad.up) jump = true;
        if (pad.X || pad.B) cast = true;
      }
    }
    this.dir = Phaser.Math.Clamp(dir, -1, 1);
    this.jumpHeld = jump;
    this.jumpPressed = jump && !this._prevJump;
    this.castPressed = cast && !this._prevCast;
    this._prevJump = jump; this._prevCast = cast;
  }
}
