/**
 * @file js/core/learning/transfer-classifiers/logarithmic.js
 * Classifier & challenge generator for Logarithmic models (Logarítmica, Unidad 09).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { astContainsVar, parseMathAst } from './shared-ast.js';

function hasLogOnVar(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'call' && (node.name === 'log' || node.name === 'ln')) {
    return node.args.some((arg) => astContainsVar(arg));
  }
  if (node.type === 'paren') return hasLogOnVar(node.expr);
  if (node.type === 'neg') return hasLogOnVar(node.value);
  if (node.type === 'binary') {
    return hasLogOnVar(node.left) || hasLogOnVar(node.right);
  }
  if (node.type === 'pow') {
    return hasLogOnVar(node.base) || hasLogOnVar(node.exponent);
  }
  if (node.type === 'call') {
    return node.args.some((arg) => hasLogOnVar(arg));
  }
  return false;
}

export const logarithmicClassifier = Object.freeze({
  id: 'logarithmic',
  label: 'Logarítmica',
  aliases: ['logarithmic', 'logaritmica', 'logaritmo', 'log'],
  priority: Object.freeze({ table: 40, geometry: 80, analytical: 90 }),
  competencyIds: Object.freeze([
    'logarithms.definition_existence_and_special_bases',
    'logarithms.operative_properties_and_change_of_base',
    'logarithms.function_inverse_and_analysis',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 4) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const ys = points.map((p) => p.y);
    const dy = [];
    for (let i = 0; i < ys.length - 1; i++) {
      dy.push(ys[i + 1] - ys[i]);
    }

    // Must be strictly monotonic with strictly shrinking |Δy|
    const allPos = dy.every((d) => d > tolerance);
    const allNeg = dy.every((d) => d < -tolerance);
    if (!allPos && !allNeg) return null;

    const absDy = dy.map((d) => Math.abs(d));
    for (let i = 0; i < absDy.length - 1; i++) {
      if (!(absDy[i] - absDy[i + 1] > tolerance)) return null;
    }

    // Solve unique r > 1 such that r^(a0 + a1) - 2*r^(a0) + 1 = 0 where a0 = |dy[0]|, a1 = |dy[1]|
    const a0 = absDy[0];
    const a1 = absDy[1];
    const g = (r) => Math.pow(r, a0 + a1) - 2 * Math.pow(r, a0) + 1;

    let lo = 1 + 1e-6;
    let hi = 2;
    let guard = 0;
    while (g(hi) <= 0 && guard < 40) {
      hi *= 2;
      guard++;
      if (!Number.isFinite(hi) || hi > 1e8) return null;
    }
    if (g(lo) >= 0 || g(hi) <= 0) return null;

    for (let iter = 0; iter < 60; iter++) {
      const mid = 0.5 * (lo + hi);
      if (g(mid) > 0) hi = mid;
      else lo = mid;
    }
    const r = 0.5 * (lo + hi);
    if (!Number.isFinite(r) || r <= 1) return null;

    const sign = allPos ? 1 : -1;
    const zs = ys.map((y) => Math.pow(r, sign * (y - ys[0])));
    if (zs.some((z) => !Number.isFinite(z))) return null;

    const dz = [];
    for (let i = 0; i < zs.length - 1; i++) {
      dz.push(zs[i + 1] - zs[i]);
    }
    const dz0 = dz[0];
    if (Math.abs(dz0) < tolerance) return null;

    const tolZ = Math.max(tolerance, Math.abs(dz0) * 1e-4);
    const linearInExpY = dz.every((d) => Math.abs(d - dz0) <= tolZ);
    if (!linearInExpY) return null;

    return {
      matched: true,
      model: 'logarithmic',
      invariant: 'log_exp_linear_inverse',
      deltaX,
      explanation: `Las diferencias Δy decrecen en magnitud y la inversa exponencial resulta lineal en x: modelo Logarítmico.`,
    };
  },

  matchGeometry(features = {}) {
    if (
      features.hasVerticalAsymptote &&
      !features.hasHorizontalAsymptote &&
      !features.hasRemovableHole &&
      !features.hasPoleMultiplicity &&
      !features.isPeriodic
    ) {
      return {
        matched: true,
        model: 'logarithmic',
        signatureFeature: 'asintota_vertical_sin_horizontal',
        explanation:
          'Una asíntota vertical con dominio en semirrecta abierta y ausencia de asíntota horizontal (inversa de la exponencial) define una función logarítmica.',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    let ast;
    try {
      ast = parseMathAst(exprStr);
    } catch {
      return null;
    }
    if (!hasLogOnVar(ast)) return null;

    return {
      matched: true,
      model: 'logarithmic',
      signature: 'k · log_a(m·x + d) + c',
      explanation:
        'La variable x aparece dentro del argumento de un logaritmo (log o ln), sujeto a positividad estricta del argumento.',
    };
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Domain & vertical asymptote of shifted log_a(x - h) + c
    const h = [2, 3, 4, -1, -2][Math.floor(rng() * 5)];
    const base = [2, 3, 10][Math.floor(rng() * 3)];
    const c = [1, 2, -1][Math.floor(rng() * 3)];
    const argStr = h >= 0 ? `x − ${h}` : `x + ${Math.abs(h)}`;
    const expectedDom = `(${h}; +inf)`;

    variants.push({
      id: `transfer-log-dom-${seed}-${idx}`,
      type: 'logarithmic_exponential_inverse',
      family: 'logarithmic_exponential_inverse',
      modelFamily: 'logarithmic',
      moduleId: 'general',
      inputKind: 'interval',
      competencyIds: [
        'logarithms.function_inverse_and_analysis',
        'exponentials.full_analytical_study',
      ],
      prompt: `Por simetría respecto de y = x con la exponencial (cuya imagen es abierta), ¿cuál es el dominio estricto de f(x) = log_${base}(${argStr}) ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)} en notación Exactas?`,
      expected: expectedDom,
      diagnostics: ['closed_bracket_on_log_asymptote'],
      hints: [
        `Todo logaritmo real exige que su argumento (${argStr}) sea estrictamente positivo.`,
        `Planteá ${argStr} > 0: en x = ${h} hay una asíntota vertical y el argumento se anula, por lo que ${h} NO pertenece al dominio.`,
        'Escribí el intervalo abierto desde la asíntota vertical hasta +inf usando paréntesis redondos y punto y coma.',
      ],
      explanation: `La condición de existencia ${argStr} > 0 equivale a x > ${h}. En x = ${h} la curva tiene asíntota vertical, por lo que Dom(f) = (${h}; +∞).`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 2: Inverse reflection contrast (exp -> log)
    const bVal = [2, 3, 5][Math.floor(rng() * 3)];
    const shift = [1, 2, 4][Math.floor(rng() * 3)];
    variants.push({
      id: `transfer-log-inv-${seed}-${idx}`,
      type: 'logarithmic_exponential_inverse',
      family: 'logarithmic_exponential_inverse',
      modelFamily: 'logarithmic',
      moduleId: 'general',
      inputKind: 'expression',
      competencyIds: [
        'logarithms.function_inverse_and_analysis',
        'exponentials.shifts_and_horizontal_asymptote',
      ],
      prompt: `Sabiendo que f(x) = ${bVal}^x + ${shift} tiene asíntota horizontal y = ${shift} e imagen (${shift}; +∞), escribí la expresión de su función inversa f⁻¹(x) (usá log(${bVal}, ...)):`,
      expected: `log(${bVal}, x - ${shift})`,
      diagnostics: ['swapped_inverse_shift_direction'],
      hints: [
        `Despejá x en y = ${bVal}^x + ${shift}: primero restá ${shift} de ambos miembros.`,
        `De y − ${shift} = ${bVal}^x aplicá logaritmo en base ${bVal} para bajar el exponente x.`,
        `Intercambiá las variables para expresar f⁻¹(x) como logaritmo en base ${bVal} aplicado a (x − ${shift}).`,
      ],
      explanation: `Al despejar x de y = ${bVal}ˣ + ${shift} queda x = log_${bVal}(y − ${shift}). Luego f⁻¹(x) = log(${bVal}, x − ${shift}) con dominio (${shift}; +∞) y asíntota vertical x = ${shift}.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    return variants;
  },
});
