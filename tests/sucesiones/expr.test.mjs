import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, evaluate, evalRange, equivalent, isStandardForm, toDisplay } from '../../js/modules/sucesiones/expr.js';
import { diagnose } from '../../js/modules/sucesiones/logic.js';

test('expr: precedencia de operadores, signos y potencias', () => {
  const p1 = parse('-5^2');
  assert.equal(p1.ok, true);
  assert.equal(evaluate(p1.ast, 1), -25);

  const p2 = parse('(-5)^2');
  assert.equal(p2.ok, true);
  assert.equal(evaluate(p2.ast, 1), 25);

  const p3 = parse('2^-3');
  assert.equal(p3.ok, true);
  assert.equal(evaluate(p3.ast, 1), 0.125);

  const p4 = parse('2^3^2');
  assert.equal(p4.ok, true);
  assert.equal(evaluate(p4.ast, 1), 512);
});

test('expr: 8*(-5)^(n-1) vs 8*-5^(n-1) en n = 1..4', () => {
  const withParens = parse('8*(-5)^(n-1)');
  assert.equal(withParens.ok, true);
  assert.deepEqual(evalRange(withParens.ast, 1, 4), [8, -40, 200, -1000]);

  const withoutParens = parse('8*-5^(n-1)');
  assert.equal(withoutParens.ok, true);
  assert.deepEqual(evalRange(withoutParens.ast, 1, 4), [-8, -40, -200, -1000]);
});

test('expr: equivalencia matemática de expresiones', () => {
  assert.equal(equivalent('2+6(n-1)', '-4+6n'), true);

  assert.equal(equivalent('3+2(n-1)', '1+2n'), true);
  assert.equal(equivalent('3+2(n-1)', '5+2(n-2)'), true);
  assert.equal(equivalent('1+2n', '5+2(n-2)'), true);

  assert.equal(equivalent('54*(1/3)^(n-1)', '54*3^(1-n)'), true);

  assert.equal(equivalent('1/2*4^(n-1)', '1/8*4^n'), true);
  assert.equal(equivalent('1/2*4^(n-1)', '0,5*4^(n-1)'), true);
});

test('expr: isStandardForm', () => {
  const validStandards = [
    { src: '3+2(n-1)', kind: 'ari' },
    { src: '3+(n-1)*2', kind: 'ari' },
    { src: '-11-8(n-1)', kind: 'ari' },
    { src: '54*(1/3)^(n-1)', kind: 'geo' },
    { src: '1/2*4^(n-1)', kind: 'geo' },
    { src: '8*(-5)^(n-1)', kind: 'geo' },
  ];

  for (const { src, kind } of validStandards) {
    const res = parse(src);
    assert.equal(res.ok, true, `Debe parsear: ${src}`);
    assert.equal(isStandardForm(res.ast, kind), true, `Debe ser estándar: ${src} (${kind})`);
  }

  const nonStandards = [
    { src: '-4+6n', kind: 'ari' },
    { src: '1+2n', kind: 'ari' },
    { src: '5+2(n-2)', kind: 'ari' },
    { src: '1/8*4^n', kind: 'geo' },
    { src: '64*(1/4)^n', kind: 'geo' },
  ];

  for (const { src, kind } of nonStandards) {
    const res = parse(src);
    assert.equal(res.ok, true, `Debe parsear: ${src}`);
    assert.equal(isStandardForm(res.ast, kind), false, `No debe ser estándar: ${src} (${kind})`);
  }
});

test('expr + logic: diagnose de errores comunes', () => {
  // neg_pow_precedence
  const d1 = diagnose(parse('8*-5^(n-1)').ast, { kind: 'geo', k: 8, step: -5 });
  assert.equal(d1.some((i) => i.id === 'neg_pow_precedence'), true);

  // exponent_n
  const d2 = diagnose(parse('64*(1/4)^n').ast, { kind: 'geo', k: 64, step: 0.25 });
  assert.equal(d2.some((i) => i.id === 'exponent_n'), true);

  // wrong_anchor_a2
  const d3 = diagnose(parse('16*(1/4)^(n-1)').ast, { kind: 'geo', k: 64, step: 0.25 });
  assert.equal(d3.some((i) => i.id === 'wrong_anchor_a2'), true);

  // off_by_one
  const d4 = diagnose(parse('2+6n').ast, { kind: 'ari', k: 2, step: 6 });
  assert.equal(d4.some((i) => i.id === 'off_by_one'), true);

  // not_standard_but_equivalent
  const d5 = diagnose(parse('-9+4n').ast, { kind: 'ari', k: -5, step: 4 });
  assert.equal(d5.some((i) => i.id === 'not_standard_but_equivalent'), true);
});

test('expr: errores de sintaxis y validación de entrada', () => {
  assert.equal(parse('').ok, false);
  assert.equal(parse('').error.code, 'empty');

  assert.equal(parse('   ').ok, false);
  assert.equal(parse('   ').error.code, 'empty');

  assert.equal(parse('2+').ok, false);
  assert.equal(parse('2+').error.code, 'unexpected_end');

  assert.equal(parse('(2+3').ok, false);
  assert.equal(parse('(2+3').error.code, 'unclosed_paren');

  assert.equal(parse('3x').ok, false);
  assert.equal(parse('3x').error.code, 'unknown_variable');

  assert.equal(parse('2**3').ok, false);
  assert.equal(parse('2**3').error.code, 'unexpected_token');

  assert.equal(parse('2 3').ok, false);
  assert.equal(parse('2 3').error.code, 'unexpected_token');
});
