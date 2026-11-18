/**
 * @file js/core/learning/transfer-classifiers/rational.js
 * Classifier & challenge generator for Rational models (Racionales, Unidad 07).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { astContainsVar, parseMathAst, tryExtractPolynomialCoeffs } from './shared-ast.js';

function unwrapParen(n) {
  let cur = n;
  while (cur && cur.type === 'paren') cur = cur.expr;
  return cur;
}

function hasVariableDenominator(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'binary' && node.op === '/' && astContainsVar(node.right)) {
    return true;
  }
  if (node.type === 'pow' && astContainsVar(node.base)) {
    const exp = unwrapParen(node.exponent);
    // Negative exponent like (x - 2)^(-1)
    if (exp?.type === 'neg') return true;
    if (exp?.type === 'number' && exp.value < 0) return true;
  }
  if (node.type === 'paren') return hasVariableDenominator(node.expr);
  if (node.type === 'neg') return hasVariableDenominator(node.value);
  if (node.type === 'binary') {
    return hasVariableDenominator(node.left) || hasVariableDenominator(node.right);
  }
  if (node.type === 'call') {
    return node.args.some((a) => hasVariableDenominator(a));
  }
  return false;
}

export const rationalClassifier = Object.freeze({
  id: 'rational',
  label: 'Racional',
  aliases: ['rational', 'racional', 'homografica', 'cociente'],
  priority: Object.freeze({ table: 60, geometry: 90, analytical: 60 }),
  competencyIds: Object.freeze([
    'rational.simplification_lcm_and_operations',
    'rational.equations_and_inequalities',
    'rational.domain_holes_and_asymptotes',
  ]),

  matchTable(points, tolerance = 1e-5) {
    // Fits homographic y = c + k / (x - h) over >= 4 uniform-dx points
    if (!Array.isArray(points) || points.length < 4) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const ys = points.map((p) => p.y);
    // Solve candidate horizontal asymptote c from first 3 points:
    // 1/(y1 - c) - 1/(y0 - c) = 1/(y2 - c) - 1/(y1 - c)
    // => c * (d1 - d0) = d1*y0 - d0*y2
    const d0 = ys[1] - ys[0];
    const d1 = ys[2] - ys[1];
    if (Math.abs(d0) < tolerance || Math.abs(d1) < tolerance) return null;
    if (Math.abs(d1 - d0) < tolerance) return null; // Linear case

    const c = (d1 * ys[0] - d0 * ys[2]) / (d1 - d0);
    if (!Number.isFinite(c)) return null;

    const inv = [];
    for (const y of ys) {
      const diff = y - c;
      if (Math.abs(diff) < tolerance) return null;
      inv.push(1 / diff);
    }

    const invDiffs = [];
    for (let i = 0; i < inv.length - 1; i++) {
      invDiffs.push(inv[i + 1] - inv[i]);
    }
    if (Math.abs(invDiffs[0]) < tolerance) return null;
    const isHomographic = invDiffs.every((d) => Math.abs(d - invDiffs[0]) < tolerance * 10);
    if (!isHomographic) return null;

    const k = deltaX / invDiffs[0];
    const h = points[0].x - k * inv[0];

    return {
      matched: true,
      model: 'rational',
      invariant: 'reciprocal_hyperbola',
      deltaX,
      asymptoteY: c,
      poleX: h,
      k,
      explanation: `Los valores siguen una hipérbola homográfica y = ${fmt(c)} + ${fmt(k)}/(x − ${fmt(h)}) con asíntota vertical x = ${fmt(h)} y horizontal y = ${fmt(c)}.`,
    };
  },

  matchGeometry(features = {}) {
    if (
      (features.hasVerticalAsymptote && features.hasHorizontalAsymptote) ||
      features.hasRemovableHole ||
      features.hasPoleMultiplicity
    ) {
      return {
        matched: true,
        model: 'rational',
        signatureFeature: 'asintotas_o_agujero_racional',
        explanation:
          'La coexistencia de asíntotas vertical y horizontal, un agujero evitable o polos de multiplicidad caracteriza a una función racional P(x)/Q(x).',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    // Polynomials are NOT rational-only for classification purposes
    if (tryExtractPolynomialCoeffs(exprStr)) return null;
    let ast;
    try {
      ast = parseMathAst(exprStr);
    } catch {
      return null;
    }
    if (!hasVariableDenominator(ast)) return null;

    return {
      matched: true,
      model: 'rational',
      signature: 'P(x) / Q(x)',
      explanation:
        'La variable x aparece en el denominador de un cociente algebraico (Q(x) no constante): modelo racional con posibles polos o agujeros evitables.',
    };
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Hole vs vertical asymptote classification (multiplicity contrast)
    const p = [1, 2, 3, 4][Math.floor(rng() * 4)];
    const isHole = rng() < 0.5;

    if (isHole) {
      variants.push({
        id: `transfer-rat-hole-${seed}-${idx}`,
        type: 'rational_vs_polynomial_domain',
        family: 'rational_vs_polynomial_domain',
        modelFamily: 'rational',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'rational.domain_holes_and_asymptotes',
          'polynomials.factoring_and_gauss_roots',
        ],
        prompt: `Analizá la función racional R(x) = (x² − ${p * p}) / (x − ${p}). En x = ${p} el denominador se anula, ¿qué ocurre exactamente en la gráfica en x = ${p}: «agujero» (discontinuidad evitable) o «asintota» vertical?`,
        expected: 'agujero',
        diagnostics: ['confused_hole_with_asymptote'],
        hints: [
          `Factorizá el numerador x² − ${p * p} como diferencia de cuadrados (x − ${p})(x + ${p}).`,
          `El factor (x − ${p}) aparece con multiplicidad 1 en el numerador y 1 en el denominador, por lo que al simplificar fuera de x = ${p} queda x + ${p}.`,
          'Indicá el nombre de la discontinuidad puntual cuando el factor del denominador se cancela por completo con el del numerador.',
        ],
        explanation: `Como x² − ${p * p} = (x − ${p})(x + ${p}), el factor (x − ${p}) tiene multiplicidad 1 arriba y 1 abajo: la discontinuidad en x = ${p} es un agujero evitable en (${p}; ${2 * p}).`,
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 3,
      });
    } else {
      variants.push({
        id: `transfer-rat-pole-${seed}-${idx}`,
        type: 'rational_vs_polynomial_domain',
        family: 'rational_vs_polynomial_domain',
        modelFamily: 'rational',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'rational.domain_holes_and_asymptotes',
          'polynomials.factoring_and_gauss_roots',
        ],
        prompt: `Analizá la función racional R(x) = (x − ${p}) / (x − ${p})². En x = ${p} el numerador también se anula, ¿qué presenta la gráfica en x = ${p}: «agujero» o «asintota» vertical?`,
        expected: 'asintota',
        diagnostics: ['confused_hole_with_asymptote'],
        hints: [
          `Compará la multiplicidad del factor (x − ${p}) en el numerador (1) frente a la del denominador (2).`,
          `Al simplificar un factor (x − ${p}) (para x ≠ ${p}), todavía sobrevive un factor (x − ${p}) en el denominador: 1/(x − ${p}).`,
          'Indicá el nombre de la recta vertical a la que tiende la curva cuando el factor sobrevive en el denominador.',
        ],
        explanation: `La multiplicidad en el denominador (2) supera a la del numerador (1), por lo que tras simplificar queda 1/(x − ${p}): en x = ${p} hay una asíntota vertical.`,
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 3,
      });
    }

    // Variant 2: Horizontal asymptote value of homographic rational
    const a = [2, 3, 4, 5][Math.floor(rng() * 4)];
    const b = [1, -1, 3][Math.floor(rng() * 3)];
    const d = [2, -3, 4][Math.floor(rng() * 3)];
    variants.push({
      id: `transfer-rat-ha-${seed}-${idx}`,
      type: 'rational_vs_polynomial_domain',
      family: 'rational_vs_polynomial_domain',
      modelFamily: 'rational',
      moduleId: 'general',
      inputKind: 'number',
      competencyIds: [
        'rational.domain_holes_and_asymptotes',
        'rational.simplification_lcm_and_operations',
      ],
      prompt: `Dada la función racional homográfica f(x) = (${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}) / (x ${d >= 0 ? '+ ' + d : '− ' + Math.abs(d)}), ¿a qué valor y tiende la asíntota horizontal cuando x → ±∞?`,
      expected: String(a),
      diagnostics: ['wrong_horizontal_asymptote'],
      hints: [
        'Compará los grados del polinomio numerador y del polinomio denominador.',
        `Ambos tienen grado 1, por lo que la asíntota horizontal resulta del cociente entre el coeficiente principal del numerador (${a}) y el del denominador (1).`,
        'Calculá ese cociente entre coeficientes principales para hallar el valor de y.',
      ],
      explanation: `Como gr(numerador) = gr(denominador) = 1, la asíntota horizontal es y = ${a} / 1 = ${a}.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    return variants;
  },
});
