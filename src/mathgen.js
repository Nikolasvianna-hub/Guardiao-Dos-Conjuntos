/* Gerador de desafios de conjuntos.
   Todos os numeros e respostas saem daqui por CODIGO, entao o gabarito
   nunca fica errado. Testado em tests/test_mathgen.js (Node). */
(function (root) {
  const M = {};

  // gerador pseudoaleatorio com semente (mulberry32)
  M.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  M.shuffle = function (r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  /* ---------- Regioes do diagrama de Venn com 2 conjuntos ---------- */
  // regiao: 'A' (so A), 'B' (so B), 'AB' (A e B), 'O' (fora dos dois)
  M.REGIONS = ['A', 'B', 'AB', 'O'];
  M.inA = (reg) => reg === 'A' || reg === 'AB';
  M.inB = (reg) => reg === 'B' || reg === 'AB';
  M.REGION_LABEL = { A: 'A', B: 'B', AB: 'A∩B', O: 'fora' };

  // expressoes que o jogador precisa interpretar
  M.EXPRS = {
    union:  { id: 'union',  label: 'A ∪ B',  words: 'está em A ou em B (união)',            pred: (a, b) => a || b },
    inter:  { id: 'inter',  label: 'A ∩ B',  words: 'está em A e em B (interseção)',        pred: (a, b) => a && b },
    diffAB: { id: 'diffAB', label: 'A − B',  words: 'está em A, mas não em B (diferença)',  pred: (a, b) => a && !b },
    diffBA: { id: 'diffBA', label: 'B − A',  words: 'está em B, mas não em A (diferença)',  pred: (a, b) => b && !a },
    compU:  { id: 'compU',  label: '(A ∪ B)ᶜ', words: 'não está em A nem em B (complemento da união)', pred: (a, b) => !a && !b },
    compA:  { id: 'compA',  label: 'Aᶜ',     words: 'não está em A (complemento)',          pred: (a, b) => !a },
  };
  M.satisfies = (expr, reg) => !!expr.pred(M.inA(reg), M.inB(reg));

  // Ponte: cada "casa" tem duas pedras, uma que satisfaz a expressao e outra que nao
  M.bridge = function (r, exprId, slots) {
    const expr = M.EXPRS[exprId];
    const good = M.REGIONS.filter((g) => M.satisfies(expr, g));
    const bad = M.REGIONS.filter((g) => !M.satisfies(expr, g));
    const out = [];
    for (let i = 0; i < slots; i++) {
      const tiles = [
        { region: pick(r, good), valid: true },
        { region: pick(r, bad), valid: false },
      ];
      out.push(M.shuffle(r, tiles));
    }
    return { expr, slots: out };
  };

  /* ---------- Cardinalidade (Fase 1) ---------- */
  M.cardinality = function (r) {
    const n = ri(r, 4, 6);
    return { n, decoys: ri(r, 3, 4) };
  };

  /* ---------- Inclusao e exclusao ---------- */
  // 2 conjuntos: x (so A), y (so B), z (A e B)
  M.twoSets = function (r) {
    const x = ri(r, 2, 4), y = ri(r, 2, 4), z = ri(r, 1, 3);
    const elements = [];
    for (let i = 0; i < x; i++) elements.push({ id: 'a' + i, sets: ['A'] });
    for (let i = 0; i < y; i++) elements.push({ id: 'b' + i, sets: ['B'] });
    for (let i = 0; i < z; i++) elements.push({ id: 'c' + i, sets: ['A', 'B'] });
    const A = x + z, B = y + z, AB = z;
    return { x, y, z, A, B, AB, union: A + B - AB, naive: A + B, elements };
  };

  // 3 conjuntos: contagem por regiao
  M.threeSets = function (r) {
    const n = { A: ri(r, 1, 2), B: ri(r, 1, 2), C: ri(r, 1, 2),
      AB: ri(r, 1, 2), AC: ri(r, 0, 1), BC: ri(r, 1, 2), ABC: ri(r, 1, 2) };
    const elements = [];
    Object.keys(n).forEach((k) => {
      for (let i = 0; i < n[k]; i++) elements.push({ id: k + i, sets: k.split('') });
    });
    const A = n.A + n.AB + n.AC + n.ABC;
    const B = n.B + n.AB + n.BC + n.ABC;
    const C = n.C + n.AC + n.BC + n.ABC;
    const AB = n.AB + n.ABC, AC = n.AC + n.ABC, BC = n.BC + n.ABC, ABC = n.ABC;
    const union = A + B + C - AB - AC - BC + ABC;
    return { n, A, B, C, AB, AC, BC, ABC, union, naive: A + B + C, elements };
  };

  // contagem explicita de elementos distintos (usada nos testes como prova)
  M.countDistinct = (elements) => new Set(elements.map((e) => e.id)).size;
  M.sizeOf = (elements, s) => elements.filter((e) => e.sets.includes(s)).length;
  M.sizeOfAll = (elements, ss) => elements.filter((e) => ss.every((s) => e.sets.includes(s))).length;

  M.formula2 = (d) => `|A∪B| = |A| + |B| − |A∩B| = ${d.A} + ${d.B} − ${d.AB} = ${d.union}`;
  M.formula3 = (d) =>
    `|A∪B∪C| = ${d.A}+${d.B}+${d.C} − ${d.AB} − ${d.AC} − ${d.BC} + ${d.ABC} = ${d.union}`;

  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else if (typeof GDC !== 'undefined') GDC.Math = M;
})(typeof window !== 'undefined' ? window : globalThis);
