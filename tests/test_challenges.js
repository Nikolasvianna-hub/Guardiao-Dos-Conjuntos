// Confere o gabarito de TODOS os desafios com uma contagem independente (conjuntos reais)
const C = require('../src/challenges.js');
const uniq = (a) => a.filter((x, i) => a.indexOf(x) === i);
const count = (a) => uniq(a).length;
function truth(p) {
  switch (p.type) {
    case 'nome': return p.glyph;
    case 'venn': return p.glyph;
    case 'pert': return p.S.includes(p.x) ? 'elem' : null;
    case 'incl': return p.T.every((x) => p.S.includes(x)) && p.T.length < p.S.length ? 'subset' : null;
    case 'op': {
      const uni = uniq(p.A.concat(p.B)).sort((x, y) => x - y), inter = p.A.filter((x) => p.B.includes(x));
      const shownIsUni = JSON.stringify(p.shown) === JSON.stringify(uni), shownIsInter = JSON.stringify(p.shown) === JSON.stringify(inter);
      if (shownIsUni && shownIsInter) return null; // ambiguo
      return shownIsUni ? 'cup' : shownIsInter ? 'cap' : null;
    }
    case 'vazio': return p.A.some((x) => p.B.includes(x)) ? null : 'empty';
    case 'card': return 'd' + count(p.list);
    case 'cardop': return 'd' + (p.op === 'cap' ? p.A.filter((x) => p.B.includes(x)).length : count(p.A.concat(p.B)));
    case 'comp': {
      const U = Array.from({ length: p.n }, (_, k) => k + 1);
      return 'd' + U.filter((x) => !p.A.includes(x)).length;
    }
    case 'ie3': {
      const A = [], B = [], Cc = []; let id = 0;
      const add = (k, ins) => { for (let q = 0; q < k; q++) { const e = 'e' + (id++); if (ins[0]) A.push(e); if (ins[1]) B.push(e); if (ins[2]) Cc.push(e); } };
      const g = p.reg;
      add(g.a, [1, 0, 0]); add(g.b, [0, 1, 0]); add(g.c, [0, 0, 1]); add(g.ab, [1, 1, 0]); add(g.ac, [1, 0, 1]); add(g.bc, [0, 1, 1]); add(g.abc, [1, 1, 1]);
      const inter = (...L) => L[0].filter((x) => L.every((l) => l.includes(x)));
      const sz = { A: A.length, B: B.length, C: Cc.length, AB: inter(A, B).length, AC: inter(A, Cc).length, BC: inter(B, Cc).length, ABC: inter(A, B, Cc).length };
      for (const k of Object.keys(sz)) if (sz[k] !== p.shown[k]) return 'tamanho exibido errado ' + k;
      const uni = count(A.concat(B, Cc));
      return 'd' + (p.ask === 'uni' ? uni : sz.ABC);
    }
    case 'ctx': {
      const M = [], F = []; let id = 0;
      for (let q = 0; q < p.i; q++) { const e = 's' + id++; M.push(e); F.push(e); }
      for (let q = 0; q < p.m - p.i; q++) M.push('s' + id++);
      for (let q = 0; q < p.f - p.i; q++) F.push('s' + id++);
      if (p.ask === 'alguma') return 'd' + count(M.concat(F));
      if (p.ask === 'so') return 'd' + M.filter((x) => !F.includes(x)).length;
      return 'd' + (p.T - count(M.concat(F)));
    }
    case 'ie': {
      // monta conjuntos reais com as cardinalidades dadas e conta diretamente
      const A = [], B = [];
      for (let k = 0; k < p.i; k++) { A.push('c' + k); B.push('c' + k); }
      for (let k = 0; k < p.a - p.i; k++) A.push('a' + k);
      for (let k = 0; k < p.b - p.i; k++) B.push('b' + k);
      const ans = p.ask === 'uni' ? count(A.concat(B)) : p.ask === 'inter' ? A.filter((x) => B.includes(x)).length : A.filter((x) => !B.includes(x)).length;
      return 'd' + ans;
    }
  }
}
let checks = 0, fails = 0;
const seen = new Set();
for (let lv = 0; lv < C.LEVELS.length; lv++) {
  for (let seed = 1; seed <= 3000; seed++) {
    const list = C.generate(lv, seed);
    if (list.length !== C.LEVELS[lv].n) { fails++; console.log('tamanho errado', lv, seed); }
    for (const e of list) for (const it of e.items) {
      checks++;
      const t = truth(it.proof);
      if (t !== it.answer) { fails++; if (fails < 10) console.log('FALHA', lv + 1, seed, JSON.stringify(it)); }
      if (/^d\d$/.test(it.answer) && (it.answer === 'd0')) { fails++; console.log('digito zero', it); }
      if (it.answer.length < 2 || !/^d[1-9]$|^[a-z]+$/.test(it.answer) || /^d[1-9][0-9]/.test(it.answer)) { fails++; console.log('resposta fora do formato', it.answer); }
      if (/[—–]/.test(JSON.stringify(it))) { fails++; console.log('travessao', it); }
      seen.add(it.answer);
    }
  }
  // cada fase tem pelo menos 5 interacoes
  if (C.LEVELS[lv].n < 5) { fails++; console.log('poucas interacoes'); }
}
console.log('respostas vistas:', [...seen].sort().join(' '));
console.log(`${checks} desafios verificados, ${fails} falhas`);
process.exit(fails ? 1 : 0);
