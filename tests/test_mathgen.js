// Prova do gabarito: roda com  node tests/test_mathgen.js
const M = require('../src/mathgen.js');
let fails = 0, runs = 0;
const check = (c, msg) => { runs++; if (!c) { fails++; if (fails < 10) console.log('FALHA:', msg); } };
for (let seed = 1; seed <= 20000; seed++) {
  const r = M.rng(seed);
  const c = M.cardinality(r); check(c.n >= 4 && c.n <= 6, 'card');
  const d = M.twoSets(r);
  check(d.union === M.countDistinct(d.elements), 'union2 ' + seed);
  check(d.A === M.sizeOf(d.elements, 'A') && d.B === M.sizeOf(d.elements, 'B'), 'A,B ' + seed);
  check(d.AB === M.sizeOfAll(d.elements, ['A', 'B']), 'AB ' + seed);
  check(d.naive > d.union, 'naive>union (a soma simples erra) ' + seed);
  const t = M.threeSets(r);
  check(t.union === M.countDistinct(t.elements), 'union3 ' + seed);
  check(t.A === M.sizeOf(t.elements, 'A') && t.C === M.sizeOf(t.elements, 'C'), 'A,C ' + seed);
  check(t.BC === M.sizeOfAll(t.elements, ['B', 'C']) && t.ABC === M.sizeOfAll(t.elements, ['A', 'B', 'C']), 'pares ' + seed);
  check(t.naive > t.union, 'naive3 ' + seed);
  ['union', 'inter', 'diffAB', 'compU'].forEach((id) => {
    const b = M.bridge(r, id, 4);
    b.slots.forEach((s) => {
      check(s.filter((x) => x.valid).length === 1, 'uma valida');
      s.forEach((x) => check(M.satisfies(b.expr, x.region) === x.valid, 'valida==satisfaz ' + id));
    });
  });
}
console.log(`${runs} verificacoes, ${fails} falhas`);
console.log(M.formula2({ A: 6, B: 5, AB: 2, union: 9 }));
process.exit(fails ? 1 : 0);
