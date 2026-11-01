/* Definicao das fases. Cada fase usa a matematica como MECANICA:
   1 Cardinalidade e pertinencia | 2 Uniao, interseção, diferenca, complemento
   3 Inclusao e exclusao (2 conjuntos) | 4 Inclusao e exclusao (3 conjuntos) | 5 Chefe (regioes de Venn)
   Todos os numeros vem de GDC.Math (mathgen.js): o gabarito sempre esta certo. */

const GDC_RED = 0xE5484D;

/* sequencia de plataformas com elementos; devolve o x final */
function gdcChain(s, startX, defs, mk) {
  const n = defs.length, ys = [400, 340, 290, 340];
  let px = startX;
  for (let i = 0; i < Math.ceil(n / 2); i++) {
    const y = ys[i % 4];
    s.plat(px, y, 180, 26);
    for (let k = 0; k < 2; k++) {
      const idx = i * 2 + k;
      if (idx >= n) break;
      const cx = (n - idx === 1 && k === 0) ? px + 90 : px + 45 + k * 90;
      mk(defs[idx], cx, y - 36);
    }
    px += 180 + 80;
  }
  return px - 80;
}

/* ala de conjunto: ilha com placa + plataformas com os elementos */
function gdcWing(s, ix, iw, title, body, defs, mk, w) {
  s.ground(ix, iw);
  s.sign(ix + iw - (w || 340) / 2 - 20, 440, title, body, w || 340);
  s.checkpoint(ix + 50, 440);
  return gdcChain(s, ix + iw + 85, defs, mk);
}

/* escolha de textura/etiqueta por pertencimento (inclusao e exclusao) */
function gdcElementLook(sets) {
  const k = sets.join('');
  const map = {
    A: { tex: 'crys_a', tag: 'A' }, B: { tex: 'crys_b', tag: 'B' },
    C: { tex: 'star', tint: 0x7be08a, tag: 'C' },
    AB: { tex: 'crys_ab', tag: 'A∩B' }, AC: { tex: 'star', tint: 0xff9f4a, tag: 'A∩C' },
    BC: { tex: 'star', tint: 0xc58cff, tag: 'B∩C' }, ABC: { tex: 'star', tag: 'A∩B∩C', size: 62 },
  };
  return map[k];
}

/* coleta com contagem de elementos DISTINTOS (o mesmo elemento em varias alas conta uma vez) */
function gdcPickElement(s, it) {
  const L = s.lv, e = it.cfg.el;
  if (L.counted[e.id]) {
    s.removeItem(it);
    s.wrong('Esse elemento já foi contado! Na união, cada elemento vale UMA vez (por isso se subtrai a interseção).');
    return;
  }
  L.counted[e.id] = true; L.count++;
  (L.byId[e.id] || []).forEach((o) => {
    if (o !== it && o.active) {
      o.setTint(GDC_RED); if (o.glow) o.glow.setTint(GDC_RED);
      if (o.tag) o.tag.setText('já contado');
    }
  });
  s.removeItem(it);
  s.ok(null, it.x, it.y);
  s.counter(`Elementos distintos coletados: ${L.count}`);
}
function gdcRegisterElement(s, e, cx, cy) {
  const look = gdcElementLook(e.sets);
  const it = s.crystal(cx, cy, { tex: look.tex, tint: look.tint, size: look.size || 50, tag: look.tag, el: e, onPick: gdcPickElement });
  (s.lv.byId[e.id] = s.lv.byId[e.id] || []).push(it);
}

const GDC_LEVELS = [
/* ------------------------------------------------------------------ FASE 1 */
{
  id: 'l1', name: 'Biblioteca Flutuante', concept: 'Pertinência e cardinalidade', bgFocus: 560, veilAlpha: 0.5,
  hint: 'Um conjunto é uma coleção de elementos. x ∈ A significa "x pertence a A"; x ∉ A significa "x não pertence a A".\nA cardinalidade |A| é a QUANTIDADE de elementos de A.\nColete só os cristais azuis (elementos de A). O portal abre quando você tiver todos os |A| elementos.',
  learn: (s) => `Você aplicou pertinência (∈ e ∉) e cardinalidade: |A| = ${s.lv.N}.`,
  build(s) {
    const card = GDC.Math.cardinality(s.rnd), N = card.n, D = Math.min(card.decoys, N - 1);
    s.lv = { N, count: 0 };
    const x0 = 1950, total = x0 + N * 220 + 380;
    s.ground(0, total);
    s.sign(330, 440, 'ANDAR', 'Setas ← →  ou  A / D\nNo celular: botões ◀ ▶', 300);
    s.sign(700, 440, 'PULAR', 'Barra de espaço ou ↑\nNo celular: botão ▲\nSegure para pular mais alto', 320);
    s.mound(840, 385, 100); s.mound(1010, 335, 100);
    s.sign(1230, 440, 'CONJURAR', 'Tecla Z ou X\nNo celular: botão ✦\nDerrote o Paradoxo!', 300);
    s.enemy(1480, 402, 1360, 1640);
    s.checkpoint(1740, 440);
    s.sign(1810, 440, 'O CONJUNTO A', `Cristais AZUIS são elementos de A:  x ∈ A\nCristais VERMELHOS não são:  x ∉ A\nO portal abre com todos os elementos de A.  |A| = ${N}`, 380);
    for (let i = 0; i < N; i++) {
      const x = x0 + i * 220;
      s.mound(x - 55, 365, 110);
      s.crystal(x, 330, {
        tex: 'crys_a', tag: '∈ A', onPick: (sc, it) => {
          sc.removeItem(it); sc.lv.count++;
          sc.ok(null, it.x, it.y);
          sc.counter(`|A| = ${N}   Coletados: ${sc.lv.count} / ${N}`);
        },
      });
    }
    for (let i = 0; i < D; i++) {
      s.crystal(x0 + i * 220 + 110, 408, {
        tex: 'crys_a', tint: GDC_RED, size: 46, tag: '∉ A', onPick: (sc, it) => {
          sc.removeItem(it);
          sc.wrong('Cristal vermelho: ele NÃO pertence a A (x ∉ A).');
        },
      });
    }
    s.door(x0 + N * 220 + 110, 440, {
      label: `|A| = ${N}`,
      tryOpen: (sc) => {
        if (sc.lv.count >= N) return true;
        sc.say(`Faltam ${N - sc.lv.count} elemento(s) de A. O portal pede |A| = ${N}.`, GDC.CSS.gold, 2200);
        return false;
      },
    });
    s.startFns.push((sc) => sc.counter(`|A| = ${N}   Coletados: 0 / ${N}`));
  },
},

/* ------------------------------------------------------------------ FASE 2 */
{
  id: 'l2', name: 'Pontes de Venn', concept: 'União, interseção, diferença e complemento', bgFocus: 760, veil: 0x1b1f4b, veilAlpha: 0.5,
  hint: 'Cada pedra pertence a uma região do diagrama de Venn (cores no topo):\nA = só em A, B = só em B, A∩B = nos dois, fora = em nenhum.\nA∪B = A ou B (ou ambos). A∩B = nos dois. A−B = em A mas não em B. (A∪B)ᶜ = fora dos dois.\nPise só nas pedras que satisfazem a regra da ponte; as outras desmoronam.',
  learn: () => 'Você interpretou união (∪), interseção (∩), diferença (−) e complemento (ᶜ) no diagrama de Venn.',
  build(s) {
    const ids = ['union', 'inter', 'diffAB', 'compU'], slots = [4, 4, 4, 3];
    s.legend();
    s.ground(0, 560);
    let ix = 0, iw = 560;
    ids.forEach((id, bi) => {
      const br = GDC.Math.bridge(s.rnd, id, slots[bi]);
      const label = `Regra da ponte ${bi + 1}:  ${br.expr.label}`;
      if (bi > 0) s.checkpoint(ix + 60, 440, (sc) => sc.counter(label));
      else s.startFns.push((sc) => sc.counter(label));
      s.sign(ix + iw - 200, 440, `PONTE ${bi + 1}:  ${br.expr.label}`,
        `Pise só nas pedras cujo elemento ${br.expr.words}.`, 360);
      const bx = ix + iw + 30;
      br.slots.forEach((pair, j) => {
        const cx = bx + j * 160 + 52;
        s.tile(cx, 340, pair[0].region, pair[0].valid);
        s.tile(cx, 410, pair[1].region, pair[1].valid);
      });
      const nx = bx + slots[bi] * 160 + 10;
      ix = nx; iw = 420;
      s.ground(ix, iw);
    });
    s.door(ix + 280, 440, { label: 'Fim das pontes', tryOpen: () => true });
  },
},

/* ------------------------------------------------------------------ FASE 3 */
{
  id: 'l3', name: 'Câmara dos Ecos', concept: 'Inclusão e exclusão (2 conjuntos)', bgFocus: 420, veil: 0x13204f, veilAlpha: 0.5,
  hint: 'Na união A ∪ B, cada elemento conta UMA vez.\nSe você soma |A| + |B|, os elementos de A∩B entram duas vezes, por isso:\n|A∪B| = |A| + |B| − |A∩B|.\nColete os elementos distintos. Um elemento que aparece em A e em B (dourado) é o mesmo: pegar o "eco" depois do original é um erro.',
  learn: (s) => GDC.Math.formula2(s.lv.d),
  build(s) {
    const d = GDC.Math.twoSets(s.rnd);
    s.lv = { d, count: 0, counted: {}, byId: {} };
    const mk = (e, cx, cy) => gdcRegisterElement(s, e, cx, cy);
    const defsA = GDC.Math.shuffle(s.rnd, d.elements.filter((e) => e.sets.includes('A')));
    const defsB = GDC.Math.shuffle(s.rnd, d.elements.filter((e) => e.sets.includes('B')));
    s.ground(0, 640);
    s.sign(260, 440, 'CÂMARA DOS ECOS',
      `|A| = ${d.A}     |B| = ${d.B}     |A∩B| = ${d.AB}\nO portal pede todos os elementos DISTINTOS de A∪B. Elementos dourados aparecem nas duas alas, mas valem UM.`, 420);
    s.checkpoint(560, 440);
    const endA = gdcChain(s, 640 + 85, defsA, mk);
    const endB = gdcWing(s, endA + 85, 420, 'ALA B', 'Alguns elementos daqui já apareceram na ala A (A∩B).', defsB, mk, 340);
    const dx = endB + 85;
    s.ground(dx, 420);
    s.door(dx + 250, 440, {
      label: 'Portal  |A∪B|',
      tryOpen: (sc) => {
        if (sc.lv.count === d.union) return true;
        sc.say('Ainda não. Conte os elementos DISTINTOS: |A∪B| = |A| + |B| − |A∩B|.', GDC.CSS.gold, 2600);
        return false;
      },
    });
    s.startFns.push((sc) => sc.counter('Elementos distintos coletados: 0'));
  },
},

/* ------------------------------------------------------------------ FASE 4 */
{
  id: 'l4', name: 'Covil do Paradoxo', concept: 'Inclusão e exclusão (3 conjuntos)', bgFocus: 900, veil: 0x2a0d26, veilAlpha: 0.5,
  hint: 'Com três conjuntos:\n|A∪B∪C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|.\nOs elementos em duas alas foram somados duas vezes; os que estão nas três, três vezes. Colete cada elemento distinto UMA vez; as cópias nas outras alas são ecos.',
  learn: (s) => GDC.Math.formula3(s.lv.d),
  build(s) {
    const d = GDC.Math.threeSets(s.rnd);
    s.lv = { d, count: 0, counted: {}, byId: {} };
    const mk = (e, cx, cy) => gdcRegisterElement(s, e, cx, cy);
    const wingDefs = (L) => GDC.Math.shuffle(s.rnd, d.elements.filter((e) => e.sets.includes(L)));
    s.ground(0, 700);
    s.sign(270, 440, 'COVIL DO PARADOXO',
      `|A|=${d.A}  |B|=${d.B}  |C|=${d.C}\n|A∩B|=${d.AB}  |A∩C|=${d.AC}  |B∩C|=${d.BC}\n|A∩B∩C|=${d.ABC}\nColete cada elemento distinto UMA vez, mesmo que ele apareça em várias alas.`, 440);
    s.checkpoint(560, 440);
    const endA = gdcChain(s, 785, wingDefs('A'), mk);
    const endB = gdcWing(s, endA + 85, 420, 'ALA B', 'Cuidado com os ecos de A.', wingDefs('B'), mk, 300);
    const endC = gdcWing(s, endB + 85, 420, 'ALA C', 'Ecos de A e de B moram aqui.', wingDefs('C'), mk, 300);
    const dx = endC + 85;
    s.ground(dx, 420);
    s.door(dx + 250, 440, {
      label: 'Portal  |A∪B∪C|',
      tryOpen: (sc) => {
        if (sc.lv.count === d.union) return true;
        sc.say('Ainda não. Use a fórmula dos três conjuntos para saber quantos elementos distintos existem.', GDC.CSS.gold, 2800);
        return false;
      },
    });
    s.startFns.push((sc) => sc.counter('Elementos distintos coletados: 0'));
  },
},

/* ------------------------------------------------------------------ FASE 5 (CHEFE) */
{
  id: 'l5', name: 'O Olho do Paradoxo', concept: 'Chefe: regiões do diagrama de Venn', bgFocus: 330, veil: 0x2a0d26, veilAlpha: 0.45, width: 960,
  hint: 'O Paradoxo só fica vulnerável quando você conjura de cima da região certa.\nA = plataforma azul, B = plataforma roxa, A∩B = plataforma dourada, fora = chão.\nLeia a regra no topo (por exemplo A∪B ou A−B), vá à região que a satisfaz e conjure ✦. Região errada cura o chefe!',
  learn: () => 'Você usou regiões do Venn em tempo real: união, interseção, diferença e complemento.',
  build(s) {
    s.ground(0, 960);
    s.pad(70, 372, 170, 'A'); s.pad(745, 372, 150, 'B'); s.pad(340, 292, 250, 'AB');
    const MAXHP = 6;
    const B = { hp: MAXHP, expr: null, dead: false, last: null, shot: 0 };
    const pickExpr = () => {
      const ids = Object.keys(GDC.Math.EXPRS).filter((i) => i !== B.last);
      B.last = ids[Math.floor(s.rnd() * ids.length)];
      B.expr = GDC.Math.EXPRS[B.last];
    };
    pickExpr();
    s.bossState = B;
    const boss = s.physics.add.sprite(480, 130, 'paradox').setDepth(15);
    boss.setScale(170 / boss.height);
    boss.body.setAllowGravity(false); boss.body.setImmovable(true);
    boss.body.setSize(boss.width * 0.7, boss.height * 0.7);
    const bubble = s.add.text(480, 250, '', { fontFamily: GDC.FONT_BODY, fontSize: '22px', color: GDC.CSS.gold, stroke: GDC.CSS.ink, strokeThickness: 5, align: 'center' }).setOrigin(0.5).setDepth(30);
    const refresh = () => {
      const lab = B.expr.label;
      s.counter(`Paradoxo ${'♥'.repeat(B.hp)}${'♡'.repeat(MAXHP - B.hp)}`);
      bubble.setText(`Vulnerável em: ${lab}\n(${B.expr.words})`);
    };
    s.startFns.push(() => { refresh(); s.say('Conjure ✦ de cima da região que satisfaz a regra do chefe!', GDC.CSS.gold, 3600); });

    const door = s.door(880, 440, {
      label: 'Portal final',
      tryOpen: (sc) => { if (B.dead) return true; sc.say('O portal está selado pelo Paradoxo!', GDC.CSS.red, 1500); return false; },
    });
    door.c.setVisible(false); door.label.setVisible(false);

    s.physics.add.overlap(boss, s.bolts, (_b, bt) => {
      if (!bt.active || B.dead) return;
      bt.destroy();
      if (GDC.Math.satisfies(B.expr, bt.region)) {
        B.hp--;
        s.ok(`Acertou! Região ${GDC.Math.REGION_LABEL[bt.region]} satisfaz ${B.expr.label}.`, boss.x, boss.y);
        boss.setTint(0xffffff); s.time.delayedCall(120, () => boss.clearTint());
        if (B.hp <= 0) {
          B.dead = true; boss.destroy(); bubble.destroy();
          s.burst(480, 140, 'spark_big', 30, GDC.C.gold); s.cameras.main.flash(400, 255, 255, 255);
          door.c.setVisible(true); door.label.setVisible(true);
          s.counter('O Paradoxo foi derrotado! Entre no portal.');
          s.openDoor(door);
          return;
        }
        pickExpr();
      } else {
        s.stats.bad++; s.updateHud();
        GDC.Audio.sfx(s, 'wrong');
        B.hp = Math.min(MAXHP, B.hp + 1);
        s.say(`Errado: a região ${GDC.Math.REGION_LABEL[bt.region]} NÃO satisfaz ${B.expr.label}. O Paradoxo se curou!`, GDC.CSS.red, 2600);
        fire(true);
      }
      refresh();
    });

    const fire = (quick) => {
      if (B.dead || !boss.active) return;
      const o = s.physics.add.image(boss.x, boss.y + 40, 'spark_big').setTint(GDC_RED).setScale(0.5).setDepth(22).setBlendMode('ADD');
      s.hazards.add(o); o.body.setAllowGravity(false);
      const a = Math.atan2(s.player.y - o.y, s.player.x - o.x), sp = quick ? 260 : 190;
      o.setVelocity(Math.cos(a) * sp, Math.sin(a) * sp);
      s.tweens.add({ targets: o, angle: 360, duration: 700, repeat: -1 });
      s.time.delayedCall(4200, () => { if (o.active) o.destroy(); });
    };
    s.addUpdater((time, delta) => {
      if (B.dead || !boss.active) return;
      boss.x = 480 + Math.sin(time / 1500) * 270; boss.y = 130 + Math.sin(time / 800) * 18;
      bubble.setPosition(boss.x, boss.y + 118);
      B.shot += delta;
      if (B.shot > 2300) { B.shot = 0; fire(false); }
    });
  },
},
];
