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
