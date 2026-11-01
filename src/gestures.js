/* Reconhecedor de tracos (estilo $1, sem invariancia de rotacao, pois U e ∩ diferem so por rotacao).
   Reconhece os simbolos do glossario de conjuntos e os digitos 1 a 9, em um unico traco.
   Funciona no navegador (GDC.Gestures) e no Node (testes). */
(function (root) {
  const G = {};
  const N = 64;
  const D2R = Math.PI / 180;

  const arc = (cx, cy, rx, ry, a0, a1, n) => {
    const pts = []; n = n || 24;
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * D2R; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return pts;
  };
  const line = (x0, y0, x1, y1, n) => { const p = []; n = n || 8; for (let i = 0; i <= n; i++) p.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]); return p; };
  const flipY = (p) => p.map(([x, y]) => [x, 1 - y]);
  const flipX = (p) => p.map(([x, y]) => [1 - x, y]);

  const cup = [].concat(line(0, 0, 0, 0.5), arc(0.5, 0.5, 0.5, 0.5, 180, 0), line(1, 0.5, 1, 0));
  const circleCW = arc(0.5, 0.5, 0.5, 0.5, -90, 270, 32);
  const circleCCW = arc(0.5, 0.5, 0.5, 0.5, -90, -450, 32);

  // glifo -> lista de variantes (cada variante e uma lista de pontos)
  const RAW = {
    cup: [cup, cup.slice().reverse()],
    cap: [flipY(cup), flipY(cup).reverse()],
    minus: [line(0, 0.5, 1, 0.5), line(1, 0.5, 0, 0.5)],
    subset: [arc(0.65, 0.5, 0.55, 0.5, -45, -315, 28)],
    elem: [
      [[0.95, 0.12], [0.75, 0.02], [0.4, 0.0], [0.12, 0.12], [0.05, 0.28], [0.2, 0.42], [0.55, 0.5], [0.2, 0.58], [0.05, 0.72], [0.12, 0.88], [0.4, 1.0], [0.75, 0.98], [0.95, 0.88]],
    ],
    empty: [
      [].concat(circleCW, line(0.85, 0.12, 0.15, 0.88)),
      [].concat(circleCW, line(0.15, 0.88, 0.85, 0.12)),
      [].concat(circleCCW, line(0.85, 0.12, 0.15, 0.88)),
      [].concat(circleCCW, line(0.15, 0.88, 0.85, 0.12)),
      [].concat(line(0.85, 0.12, 0.15, 0.88), circleCW),
      [].concat(line(0.15, 0.88, 0.85, 0.12), circleCCW),
    ],
    d1: [line(0.5, 0, 0.5, 1), line(0.5, 1, 0.5, 0), [[0.2, 0.2], [0.5, 0.0], [0.5, 0.5], [0.5, 1.0]]],
    d2: [[[0.1, 0.25], [0.25, 0.05], [0.6, 0.0], [0.9, 0.15], [0.85, 0.4], [0.5, 0.65], [0.1, 1.0], [0.5, 1.0], [0.95, 1.0]]],
    d3: [[[0.1, 0.1], [0.5, 0.0], [0.9, 0.15], [0.85, 0.35], [0.45, 0.5], [0.9, 0.65], [0.95, 0.85], [0.5, 1.0], [0.1, 0.9]]],
    d4: [[[0.7, 0.0], [0.1, 0.65], [0.95, 0.65]], [[0.7, 0.0], [0.1, 0.65], [0.95, 0.65], [0.7, 0.4], [0.7, 1.0]]],
    d5: [[[0.9, 0.0], [0.2, 0.0], [0.15, 0.45], [0.5, 0.4], [0.9, 0.55], [0.95, 0.8], [0.6, 1.0], [0.1, 0.9]]],
    d6: [[[0.75, 0.0], [0.3, 0.25], [0.1, 0.6], [0.15, 0.9], [0.5, 1.0], [0.9, 0.8], [0.8, 0.55], [0.4, 0.5], [0.12, 0.7]]],
    d7: [[[0.05, 0.0], [0.95, 0.0], [0.35, 1.0]]],
    d8: (() => {
      const f = []; for (let i = 0; i <= 40; i++) { const t = (i / 40) * 2 * Math.PI; f.push([0.5 + 0.4 * Math.sin(2 * t), 0.5 - 0.5 * Math.cos(t)]); }
      return [f, flipX(f)];
    })(),
    d9: [[].concat(arc(0.5, 0.3, 0.28, 0.3, 0, -360, 24), line(0.78, 0.3, 0.7, 1.0)), [].concat(arc(0.5, 0.3, 0.28, 0.3, 0, 360, 24), line(0.78, 0.3, 0.7, 1.0))],
  };

  /* ---------- normalizacao ---------- */
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const pathLen = (p) => { let d = 0; for (let i = 1; i < p.length; i++) d += dist(p[i - 1], p[i]); return d; };
  function resample(pts, n) {
    const I = pathLen(pts) / (n - 1);
    if (!(I > 0)) return null;
    const src = pts.map((p) => p.slice()); const out = [src[0]]; let D = 0;
    for (let i = 1; i < src.length; i++) {
      const d = dist(src[i - 1], src[i]);
      if (D + d >= I) {
        const t = (I - D) / d;
        const q = [src[i - 1][0] + t * (src[i][0] - src[i - 1][0]), src[i - 1][1] + t * (src[i][1] - src[i - 1][1])];
        out.push(q); src.splice(i, 0, q); D = 0;
      } else D += d;
    }
    while (out.length < n) out.push(src[src.length - 1].slice());
    return out.slice(0, n);
  }
  function normalize(pts) {
    const r = resample(pts, N);
    if (!r) return null;
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    r.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    const s = Math.max(maxX - minX, maxY - minY) || 1;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    return r.map(([x, y]) => [(x - cx) / s, (y - cy) / s]);
  }
  const avgDist = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += dist(a[i], b[i]); return d / a.length; };

  G.TEMPLATES = {};
  Object.keys(RAW).forEach((k) => { G.TEMPLATES[k] = RAW[k].map(normalize); });
  G.GLYPHS = Object.keys(RAW);

  /* Retorna { best, scores } com a nota (0 a 1) de cada glifo para o traco desenhado */
  G.recognize = function (points) {
    if (!points || points.length < 5) return null;
    if (pathLen(points) < 18) return null;
    const c = normalize(points);
    if (!c) return null;
    const scores = {}; let best = null;
    G.GLYPHS.forEach((g) => {
      let m = 1e9;
      G.TEMPLATES[g].forEach((t) => { m = Math.min(m, avgDist(c, t)); });
      scores[g] = Math.max(0, 1 - m / 0.5);
      if (!best || scores[g] > scores[best]) best = g;
    });
    return { best, scores };
  };

  /* Aceita o traco para o glifo esperado de forma tolerante, mas sem aceitar outro simbolo */
  G.accepts = function (result, expected, opts) {
    if (!result) return false;
    const T = (opts && opts.threshold) || 0.62, margin = (opts && opts.margin) || 0.05;
    const e = result.scores[expected], b = result.scores[result.best];
    return result.best === expected || (e >= T && e >= b - margin);
  };

  G.pointsFor = (glyph, variant) => {
    const p = RAW[glyph][variant || 0], out = [];
    for (let i = 1; i < p.length; i++) { const k = Math.max(1, Math.ceil(dist(p[i - 1], p[i]) / 0.03)); for (let j = 0; j < k; j++) out.push([p[i - 1][0] + (p[i][0] - p[i - 1][0]) * j / k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * j / k]); }
    out.push(p[p.length - 1]); return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = G;
  else if (typeof GDC !== 'undefined') GDC.Gestures = G;
})(typeof window !== 'undefined' ? window : globalThis);
