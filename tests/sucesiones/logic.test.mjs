import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approxEq,
  term,
  terms,
  classify,
  stepFromTwo,
  isTerm,
  explicitSimplified,
  fromExplicit,
  expandRecursive,
  diagnose,
} from '../../js/modules/sucesiones/logic.js';
import { parse } from '../../js/modules/sucesiones/expr.js';

test('logic: cálculo de términos individuales y listas', () => {
  assert.deepEqual(terms('ari', 3, 2, 5), [3, 5, 7, 9, 11]);
  assert.deepEqual(terms('ari', -5, 9, 4), [-5, 4, 13, 22]);
  assert.equal(term('ari', 199, -3, 124), -170);

  assert.equal(approxEq(term('geo', 54, 1 / 3, 4), 2), true);
  assert.equal(approxEq(term('geo', 0.5, 4, 4), 32), true);

  assert.throws(() => term('ari', 3, 2, 0), RangeError);
  assert.throws(() => term('ari', 3, 2, -1), RangeError);
  assert.throws(() => term('ari', 3, 2, 2.5), RangeError);
});

test('logic: classify de sucesiones', () => {
  // Aritméticas
  const aris = [
    { seq: [3, 5, 7, 9], d: 2 },
    { seq: [21, 16, 11, 6], d: -5 },
    { seq: [10, 21, 32, 43], d: 11 },
    { seq: [-2, -5, -8, -11], d: -3 },
    { seq: [100, 96, 92, 88], d: -4 },
    { seq: [4, 11, 18, 25], d: 7 },
  ];

  for (const { seq, d } of aris) {
    const res = classify(seq);
    assert.equal(res.kind, 'ari');
    assert.equal(approxEq(res.d, d), true);
  }

  // Geométricas
  const geos = [
    { seq: [1, 2, 4, 8], r: 2 },
    { seq: [40, 20, 10, 5], r: 0.5 },
    { seq: [54, 18, 6, 2], r: 1 / 3 },
    { seq: [4, 12, 36, 108], r: 3 },
    { seq: [1, -2, 4, -8], r: -2 },
  ];

  for (const { seq, r } of geos) {
    const res = classify(seq);
    assert.equal(res.kind, 'geo');
    assert.equal(approxEq(res.r, r), true);
  }

  // Ninguna
  assert.equal(classify([1, 4, 9, 16]).kind, 'none');
  assert.equal(classify([1, 1, 2, 3, 5, 8]).kind, 'none');

  // Ambas (constante)
  const both = classify([5, 5, 5]);
  assert.equal(both.kind, 'both');
  assert.equal(both.d, 0);
  assert.equal(both.r, 1);

  // Desconocida (< 3 términos)
  assert.equal(classify([3, 5]).kind, 'unknown');
  assert.equal(classify([]).kind, 'unknown');
});

test('logic: stepFromTwo entre postes lejanos', () => {
  const res = stepFromTwo('ari', 1, 5, 10, 59);
  assert.equal(res.d, 6);
  assert.equal(res.jumps, 9);
});

test('logic: isTerm (filtro de pertenencia y despeje)', () => {
  const r1 = isTerm('ari', 3, -4, -65);
  assert.equal(r1.isTerm, true);
  assert.equal(r1.n, 18);

  const r2 = isTerm('ari', 3, 2, 100);
  assert.equal(r2.isTerm, false);
  assert.equal(approxEq(r2.n, 49.5), true);

  const r3 = isTerm('ari', 3, 2, 101);
  assert.equal(r3.isTerm, true);
  assert.equal(r3.n, 50);
});

test('logic: explicitSimplified', () => {
  const simpAri = explicitSimplified('ari', 2, 6);
  assert.equal(simpAri.c0, -4);
  assert.equal(simpAri.d, 6);

  const simpGeo = explicitSimplified('geo', 0.5, 4);
  assert.equal(approxEq(simpGeo.c0, 0.125), true);
  assert.equal(simpGeo.r, 4);
});

test('logic: fromExplicit', () => {
  // Aritméticas
  const ariTests = [
    { src: '1+4n', k: 5, step: 4 },
    { src: '23-6n', k: 17, step: -6 },
    { src: '10+2n', k: 12, step: 2 },
    { src: '5+12(n-1)', k: 5, step: 12 },
    { src: '-11-8(n-1)', k: -11, step: -8 },
  ];

  for (const { src, k, step } of ariTests) {
    const res = fromExplicit(parse(src).ast, 'ari');
    assert.notEqual(res, null, `Debe extraer de: ${src}`);
    assert.equal(approxEq(res.k, k), true, `k incorrecto en ${src}`);
    assert.equal(approxEq(res.step, step), true, `step incorrecto en ${src}`);
  }

  // Geométricas
  const geoTests = [
    { src: '54*(1/3)^(n-1)', k: 54, step: 1 / 3 },
    { src: '1/2*4^(n-1)', k: 0.5, step: 4 },
    { src: '1/8*4^n', k: 0.5, step: 4 },
  ];

  for (const { src, k, step } of geoTests) {
    const res = fromExplicit(parse(src).ast, 'geo');
    assert.notEqual(res, null, `Debe extraer de: ${src}`);
    assert.equal(approxEq(res.k, k), true, `k incorrecto en ${src}`);
    assert.equal(approxEq(res.step, step), true, `step incorrecto en ${src}`);
  }

  // Cruzada
  assert.equal(fromExplicit(parse('2^n').ast, 'ari'), null);
});

test('logic: expandRecursive con GENERAL_RULES', () => {
  const r1 = expandRecursive({ id: 'mixta', anchors: [2] }, 5);
  assert.equal(r1.ok, true);
  assert.deepEqual(r1.terms, [2, 5, 11, 23, 47]);

  const r2 = expandRecursive({ id: 'cuadrado', anchors: [3] }, 5);
  assert.equal(r2.ok, true);
  assert.deepEqual(r2.terms, [3, 4, 11, 116, 13451]);

  const r3 = expandRecursive({ id: 'fibonacci', anchors: [1, 1] }, 6);
  assert.equal(r3.ok, true);
  assert.deepEqual(r3.terms, [1, 1, 2, 3, 5, 8]);

  const r4 = expandRecursive({ id: 'fibonacci', anchors: [1] }, 6);
  assert.equal(r4.ok, false);
  assert.equal(r4.error.code, 'missing_anchors');
});

test('logic: diagnose contrato estricto de los 7 identificadores', () => {
  // 1. neg_pow_precedence
  const d1 = diagnose(parse('8 * -5^(n-1)').ast, { kind: 'geo', k: 8, step: -5 });
  assert.strictEqual(d1[0]?.id, 'neg_pow_precedence');

  // 2. exponent_n
  const d2 = diagnose(parse('64 * (1/4)^n').ast, { kind: 'geo', k: 64, step: 0.25 });
  assert.strictEqual(d2[0]?.id, 'exponent_n');

  // 3. off_by_one
  const d3 = diagnose(parse('2 + 6n').ast, { kind: 'ari', k: 2, step: 6 });
  assert.strictEqual(d3[0]?.id, 'off_by_one');

  // 4. wrong_anchor_a2
  const d4 = diagnose(parse('16 * (1/4)^(n-1)').ast, { kind: 'geo', k: 64, step: 0.25 });
  assert.strictEqual(d4[0]?.id, 'wrong_anchor_a2');

  // 5. sign_of_step
  const d5 = diagnose(parse('5 - 12(n-1)').ast, { kind: 'ari', k: 5, step: 12 });
  assert.strictEqual(d5[0]?.id, 'sign_of_step');

  // 6. swapped_k_step
  const d6 = diagnose(parse('12 + 5(n-1)').ast, { kind: 'ari', k: 5, step: 12 });
  assert.strictEqual(d6[0]?.id, 'swapped_k_step');

  // 7. not_standard_but_equivalent
  const d7 = diagnose(parse('-9 + 4n').ast, { kind: 'ari', k: -5, step: 4 }, { requireStandard: true });
  assert.strictEqual(d7[0]?.id, 'not_standard_but_equivalent');
  assert.strictEqual(d7[0]?.severity, 'warn');
});
