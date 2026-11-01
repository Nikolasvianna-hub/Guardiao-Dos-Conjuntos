// Simula tracos de gente de verdade (tremor, escala, inclinacao, ponto inicial torto) e mede a taxa de acerto
const G = require('../src/gestures.js');
let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.9;
function distort(pts, level) {
  const sx = 0.5 + rnd() * 2.5, sy = sx * (0.7 + rnd() * 0.6);
  const rot = (rnd() - 0.5) * 2 * (level.rot * Math.PI / 180), sk = (rnd() - 0.5) * level.skew;
  let out = pts.map(([x, y]) => {
    let X = x + sk * y, Y = y; const c = Math.cos(rot), s = Math.sin(rot);
    [X, Y] = [X * c - Y * s, X * s + Y * c];
    return [X * sx * 200 + gauss() * level.jit * 200 * sx, Y * sy * 200 + gauss() * level.jit * 200 * sy];
  });
  const cut = Math.floor(rnd() * out.length * level.trim); out = out.slice(cut);
  return out;
}
const levels = { normal: { rot: 8, skew: 0.15, jit: 0.025, trim: 0.05 }, desleixado: { rot: 14, skew: 0.3, jit: 0.045, trim: 0.1 } };
let bad = 0;
for (const [name, lv] of Object.entries(levels)) {
  const REPS = 300; const rows = [];
  let wrongAccepted = 0, wrongTrials = 0;
  for (const g of G.GLYPHS) {
    let ok = 0;
    const variants = G.TEMPLATES[g].length;
    for (let i = 0; i < REPS; i++) {
      const pts = distort(G.pointsFor(g, i % variants), lv);
      const r = G.recognize(pts);
      if (G.accepts(r, g)) ok++;
    }
    // falsos positivos: tracos de OUTROS glifos aceitos como este
    for (const o of G.GLYPHS) if (o !== g) for (let i = 0; i < 40; i++) {
      const r = G.recognize(distort(G.pointsFor(o, i % G.TEMPLATES[o].length), lv));
      wrongTrials++; if (G.accepts(r, g)) wrongAccepted++;
    }
    rows.push(`${g}:${Math.round(100 * ok / REPS)}%`);
  }
  console.log(name, rows.join(' '));
  console.log(name, `falsos positivos: ${(100 * wrongAccepted / wrongTrials).toFixed(2)}%`);
}
