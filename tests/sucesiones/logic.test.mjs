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
