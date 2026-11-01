/* Desafios do Guardiao dos Conjuntos.
   Cada balao tem um desafio e o jogador responde DESENHANDO o simbolo (ou o digito).
   Todas as respostas sao calculadas por CODIGO a partir de conjuntos reais, entao o gabarito
   nunca fica errado. Testado em tests/test_challenges.js (Node). */
(function (root) {
  const C = {};

  C.GLYPH = { cup: '∪', cap: '∩', elem: '∈', subset: '⊂', empty: '∅', minus: '−' };
  C.GLYPH_NAME = { cup: 'união', cap: 'interseção', elem: 'pertence', subset: 'está contido', empty: 'conjunto vazio', minus: 'diferença' };
  C.charOf = (a) => (a[0] === 'd' ? a.slice(1) : C.GLYPH[a]);

  C.rng = function (seed) {
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
  const shuffle = (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (r, arr, n) => shuffle(r, arr).slice(0, n).sort((x, y) => (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))));
  const fmt = (a) => '{' + a.join(', ') + '}';
  const main = (t) => ({ t, k: 'main' });
  const sub = (t) => ({ t, k: 'sub' });
  const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  /* ---- 1. Nome do simbolo (glossario) ---- */
  const NAMES = {
    cup: [main('A  ?  B'), sub('união')],
    cap: [main('A  ?  B'), sub('interseção')],
    elem: [main('x  ?  A'), sub('pertence')],
    subset: [main('A  ?  B'), sub('está contido')],
    empty: [main('conjunto'), sub('vazio')],
    minus: [main('A  ?  B'), sub('diferença')],
  };
  const EXPL = {
    cup: 'União: elementos que estão em A ou em B.',
    cap: 'Interseção: elementos que estão em A e em B.',
    elem: 'Pertence: o elemento está dentro do conjunto.',
    subset: 'Está contido: todo elemento de A também é de B.',
    empty: 'Conjunto vazio: não tem nenhum elemento.',
    minus: 'Diferença: está em A e não está em B.',
  };
  function gName(r, avoid) {
    const k = pick(r, Object.keys(NAMES).filter((x) => x !== avoid));
    return { kind: 'nome', answer: k, lines: NAMES[k], expl: EXPL[k], proof: { type: 'nome', glyph: k } };
  }

  /* ---- 2. Diagrama de Venn sombreado ---- */
  function gVenn(r, avoid) {
    const k = pick(r, ['cup', 'cap', 'minus', 'subset', 'empty'].filter((x) => x !== avoid));
    const map = {
      cup: { venn: 'venn_union', lines: [sub('A  ?  B')] },
      cap: { venn: 'venn_inter', lines: [sub('A  ?  B')] },
      minus: { venn: 'venn_diff', lines: [sub('A  ?  B')] },
      subset: { venn: 'venn_sub', lines: [sub('A  ?  B')] },
      empty: { venn: 'venn_disj', lines: [sub('A ∩ B  =  ?')] },
    }[k];
    return { kind: 'venn', answer: k, venn: map.venn, lines: map.lines, expl: EXPL[k], proof: { type: 'venn', glyph: k } };
  }

  /* ---- 3. Pertinencia e inclusao com elementos ---- */
  function gMember(r, avoid) {
    const S = sample(r, NUMS, ri(r, 3, 4));
    if (r() < 0.5 && avoid !== 'elem') {
      const x = pick(r, S);
      return { kind: 'pert', answer: 'elem', lines: [main(`${x}  ?  ${fmt(S)}`)], expl: `${x} está em ${fmt(S)}, então ${x} ∈ ${fmt(S)}.`, proof: { type: 'pert', x, S } };
    }
    const T = sample(r, S, ri(r, 1, S.length - 1));
    return { kind: 'incl', answer: 'subset', lines: [main(`${fmt(T)}  ?  ${fmt(S)}`)], expl: `Todo elemento de ${fmt(T)} está em ${fmt(S)}.`, proof: { type: 'incl', T, S } };
  }

  /* ---- 4. Operacao com elementos: qual simbolo liga os conjuntos ---- */
  function gSetOp(r, avoid) {
    for (let tries = 0; tries < 50; tries++) {
      const A = sample(r, NUMS, ri(r, 2, 3)), B = sample(r, NUMS, ri(r, 2, 3));
      const uni = [...new Set([...A, ...B])].sort((x, y) => x - y);
      const inter = A.filter((x) => B.includes(x));
      if (!inter.length || uni.length === inter.length) continue;
      if (r() < 0.5 && avoid !== 'cup') {
        return { kind: 'op', answer: 'cup', lines: [main(`${fmt(A)}  ?  ${fmt(B)}`), sub(`= ${fmt(uni)}`)], expl: `Juntando tudo: ${fmt(A)} ∪ ${fmt(B)} = ${fmt(uni)}.`, proof: { type: 'op', A, B, op: 'cup', shown: uni } };
      }
      if (avoid !== 'cap') return { kind: 'op', answer: 'cap', lines: [main(`${fmt(A)}  ?  ${fmt(B)}`), sub(`= ${fmt(inter)}`)], expl: `Só o que há nos dois: ${fmt(A)} ∩ ${fmt(B)} = ${fmt(inter)}.`, proof: { type: 'op', A, B, op: 'cap', shown: inter } };
    }
    return gName(r, avoid);
  }

  /* ---- 5. Interseção vazia ---- */
  function gEmpty(r) {
    const pool = shuffle(r, NUMS), A = pool.slice(0, ri(r, 2, 3)).sort((x, y) => x - y), B = pool.slice(3, 3 + ri(r, 2, 3)).sort((x, y) => x - y);
    return { kind: 'vazio', answer: 'empty', lines: [main(`${fmt(A)} ∩ ${fmt(B)}`), sub('=  ?')], expl: 'Não há elemento em comum, então a interseção é vazia (∅).', proof: { type: 'vazio', A, B } };
  }

  /* ---- 6. Cardinalidade ---- */
  function gCard(r) {
    const n = ri(r, 2, 6);
    let list = sample(r, r() < 0.5 ? LETTERS : NUMS, n);
    let dup = false;
    if (r() < 0.3) { list = shuffle(r, list.concat([pick(r, list)])); dup = true; }
    const ans = new Set(list).size;
    return { kind: 'card', answer: 'd' + ans, lines: [main(`|${fmt(list)}|`), sub('=  ?')], expl: dup ? `Elemento repetido conta uma vez só: |A| = ${ans}.` : `|A| é o número de elementos: ${ans}.`, proof: { type: 'card', list } };
  }
  function gCardOp(r) {
    for (let tries = 0; tries < 80; tries++) {
      const A = sample(r, NUMS, ri(r, 3, 4)), B = sample(r, NUMS, ri(r, 3, 4));
      const inter = A.filter((x) => B.includes(x));
      const uni = [...new Set([...A, ...B])];
      if (!inter.length) continue;
      if (r() < 0.5) return { kind: 'cardop', answer: 'd' + inter.length, lines: [sub(`A = ${fmt(A)}`), sub(`B = ${fmt(B)}`), main('|A ∩ B| = ?')], expl: `Em comum: ${fmt(inter)}, então |A ∩ B| = ${inter.length}.`, proof: { type: 'cardop', A, B, op: 'cap' } };
      if (uni.length <= 9) return { kind: 'cardop', answer: 'd' + uni.length, lines: [sub(`A = ${fmt(A)}`), sub(`B = ${fmt(B)}`), main('|A ∪ B| = ?')], expl: `Juntando sem repetir: ${fmt(uni.sort((x, y) => x - y))}, então |A ∪ B| = ${uni.length}.`, proof: { type: 'cardop', A, B, op: 'cup' } };
    }
    return gCard(r);
  }

  /* ---- 7. Inclusao e exclusao: |A ∪ B| = |A| + |B| - |A ∩ B| ---- */
  function gIE(r) {
    for (let tries = 0; tries < 200; tries++) {
      const a = ri(r, 3, 7), b = ri(r, 2, 6), i = ri(r, 1, Math.min(a, b) - 1 || 1);
      const u = a + b - i;
      if (u > 9 || i < 1 || i >= a || i >= b + 1) continue;
      const v = pick(r, ['uni', 'inter', 'soA']);
      const head = [sub(`|A| = ${a}   |B| = ${b}`)];
      if (v === 'uni') return { kind: 'ie', answer: 'd' + u, lines: head.concat([sub(`|A ∩ B| = ${i}`), main('|A ∪ B| = ?')]), expl: `|A ∪ B| = ${a} + ${b} − ${i} = ${u}.`, proof: { type: 'ie', a, b, i, ask: 'uni' } };
      if (v === 'inter') return { kind: 'ie', answer: 'd' + i, lines: head.concat([sub(`|A ∪ B| = ${u}`), main('|A ∩ B| = ?')]), expl: `${a} + ${b} − ${u} = ${i}, então |A ∩ B| = ${i}.`, proof: { type: 'ie', a, b, i, ask: 'inter' } };
      if (a - i >= 1) return { kind: 'ie', answer: 'd' + (a - i), lines: head.concat([sub(`|A ∩ B| = ${i}`), main('|A − B| = ?')]), expl: `Só em A: ${a} − ${i} = ${a - i}.`, proof: { type: 'ie', a, b, i, ask: 'soA' } };
    }
    return gCard(r);
  }

  const ALL = { gName, gVenn, gMember, gSetOp, gEmpty, gCard, gCardOp, gIE };

  C.LEVELS = [
    { id: 1, name: 'Símbolos do Reino', concept: 'Glossário: ∪ ∩ ∈ ⊂ ∅', gens: ['gName', 'gVenn'], n: 8, speed: 56, gap: 5.0, maxOn: 2 },
    { id: 2, name: 'Pertinência e União', concept: '∈  ⊂  ∪  ∩  ∅ com elementos', gens: ['gMember', 'gSetOp', 'gEmpty', 'gVenn'], n: 10, speed: 62, gap: 4.6, maxOn: 3 },
    { id: 3, name: 'Cardinalidade', concept: '|A| = número de elementos', gens: ['gCard', 'gCardOp'], n: 10, speed: 62, gap: 5.0, maxOn: 3 },
    { id: 4, name: 'Inclusão e Exclusão', concept: '|A∪B| = |A| + |B| − |A∩B|', gens: ['gIE', 'gCardOp'], n: 10, speed: 60, gap: 6.0, maxOn: 3 },
    { id: 5, name: 'O Rei Paradoxo', concept: 'Tudo junto, com chefão', gens: ['gName', 'gVenn', 'gMember', 'gSetOp', 'gEmpty', 'gCard', 'gCardOp', 'gIE'], n: 12, speed: 68, gap: 5.2, maxOn: 3, boss: true },
  ];

  /* Gera a lista de inimigos da fase. Cada inimigo tem 'items' (1 desafio; o chefao tem 3 em sequencia) */
  C.generate = function (index, seed) {
    const lv = C.LEVELS[index], r = C.rng(seed);
    const enemies = [];
    let last = null;
    const one = () => {
      const g = ALL[pick(r, lv.gens)];
      let it = g(r, last);
      for (let k = 0; k < 6 && it.answer === last; k++) it = g(r, last);
      last = it.answer; return it;
    };
    for (let i = 0; i < lv.n; i++) {
      const isBoss = lv.boss && i === lv.n - 1;
      const count = isBoss ? 3 : (lv.boss && r() < 0.3 ? 2 : 1);
      const items = []; for (let k = 0; k < count; k++) items.push(one());
      enemies.push({ items, boss: isBoss });
    }
    // fase 1: garante que cada simbolo do glossario apareca pelo menos uma vez
    if (index === 0) {
      const need = shuffle(r, ['cup', 'cap', 'elem', 'subset', 'empty']);
      need.forEach((k, i) => { enemies[i].items = [gNameFor(k)]; });
      const first = enemies.splice(0, enemies.length);
      return shuffleKeepStart(r, first);
    }
    return enemies;
  };
  function gNameFor(k) { return { kind: 'nome', answer: k, lines: NAMES[k], expl: EXPL[k], proof: { type: 'nome', glyph: k } }; }
  function shuffleKeepStart(r, arr) { const head = arr[0], rest = shuffle(r, arr.slice(1)); return [head].concat(rest); }

  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  else if (typeof GDC !== 'undefined') GDC.Challenges = C;
})(typeof window !== 'undefined' ? window : globalThis);
