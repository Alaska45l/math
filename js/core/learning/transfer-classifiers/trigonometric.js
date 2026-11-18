/**
 * @file js/core/learning/transfer-classifiers/trigonometric.js
 * Classifier & challenge generator for Trigonometric models (Trigonometría, Unidades 10–11).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { parseMathAst } from './shared-ast.js';

const TRIG_FN_NAMES = new Set([
  'sin', 'sen', 'cos', 'tan', 'tg', 'csc', 'cosec', 'sec', 'cot', 'cotg',
]);

function hasTrigFunction(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'call' && TRIG_FN_NAMES.has(node.name)) {
    return true;
  }
  if (node.type === 'paren') return hasTrigFunction(node.expr);
  if (node.type === 'neg') return hasTrigFunction(node.value);
  if (node.type === 'binary') {
    return hasTrigFunction(node.left) || hasTrigFunction(node.right);
  }
  if (node.type === 'pow') {
    return hasTrigFunction(node.base) || hasTrigFunction(node.exponent);
  }
  if (node.type === 'call') {
    return node.args.some((a) => hasTrigFunction(a));
  }
  return false;
}

export const trigonometricClassifier = Object.freeze({
  id: 'trigonometric',
  label: 'Trigonométrica',
  aliases: ['trigonometric', 'trigonometrica', 'trig', 'senoidal', 'periodica'],
  priority: Object.freeze({ table: 30, geometry: 95, analytical: 95 }),
  competencyIds: Object.freeze([
    'trig_functions.congruence_classes_and_cartesian_def',
    'trig_functions.six_functions_domains_graphs_and_bijectivity',
    'trig_functions.periodic_equations_and_domain_checks',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 5) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const ys = points.map((p) => p.y);
    const dy = [];
    for (let i = 0; i < ys.length - 1; i++) {
      dy.push(ys[i + 1] - ys[i]);
    }

    // Must not be constant or strictly monotonic
    const nonConstant = dy.some((d) => Math.abs(d) > tolerance);
    if (!nonConstant) return null;
    const allPos = dy.every((d) => d >= -tolerance);
    const allNeg = dy.every((d) => d <= tolerance);
    if (allPos || allNeg) return null;

    // 1. Check discrete periodic repetition y_{i+P} ≈ y_i for P >= 2
    for (let periodSteps = 2; periodSteps <= ys.length - 2; periodSteps++) {
      let matches = 0;
      let allMatch = true;
      for (let i = 0; i + periodSteps < ys.length; i++) {
        if (Math.abs(ys[i + periodSteps] - ys[i]) <= tolerance * 10) {
          matches++;
        } else {
          allMatch = false;
          break;
        }
      }
      if (allMatch && matches >= 2) {
        return {
          matched: true,
          model: 'trigonometric',
          invariant: 'trig_periodic_wave',
          deltaX,
          period: periodSteps * deltaX,
          explanation: `Oscilación acotada con repetición periódica cada T = ${fmt(periodSteps * deltaX)}: modelo Trigonométrico.`,
        };
      }
    }

    // 2. Check sinusoidal recurrence y_{i+2} + y_i = α*y_{i+1} + β with |α| < 2
    for (let i = 0; i <= ys.length - 4; i++) {
      const denom = ys[i + 2] - ys[i + 1];
      if (Math.abs(denom) > tolerance) {
        const s0 = ys[i + 2] + ys[i];
        const s1 = ys[i + 3] + ys[i + 1];
        const alpha = (s1 - s0) / denom;
        if (Math.abs(alpha) < 2 - 1e-6) {
          const beta = s0 - alpha * ys[i + 1];
          let okAll = true;
          for (let j = 0; j <= ys.length - 3; j++) {
            const pred = alpha * ys[j + 1] + beta - ys[j];
            if (Math.abs(pred) > tolerance * 50) {
              okAll = false;
              break;
            }
          }
          if (okAll) {
            return {
              matched: true,
              model: 'trigonometric',
              invariant: 'trig_periodic_wave',
              deltaX,
              explanation: `Oscilación senoidal armónica con recurrencia constante entre valores consecutivos: modelo Trigonométrico.`,
            };
          }
        }
        break;
      }
    }

    return null;
  },

  matchGeometry(features = {}) {
    if (features.isPeriodic === true) {
      return {
        matched: true,
        model: 'trigonometric',
        signatureFeature: 'onda_o_funcion_periodica',
        explanation:
          'La periodicidad exacta f(x + T) = f(x) con oscilación o polos repetidos define un modelo trigonométrico.',
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
    if (!hasTrigFunction(ast)) return null;

    return {
      matched: true,
      model: 'trigonometric',
      signature: 'A·sen(ωx + φ) + c | tg(x)',
      explanation:
        'La expresión involucra razones trigonométricas periódicas (sen, cos, tg, cosec, sec, cotg): modelo trigonométrico.',
    };
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Domain/Period differentiation among the 6 trig functions
    const mode = Math.floor(rng() * 3);
    if (mode === 0) {
      variants.push({
        id: `transfer-trig-dom-tan-${seed}-${idx}`,
        type: 'trigonometric_periodic_discrimination',
        family: 'trigonometric_periodic_discrimination',
        modelFamily: 'trigonometric',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'trig_functions.six_functions_domains_graphs_and_bijectivity',
          'trig_functions.periodic_equations_and_domain_checks',
        ],
        prompt: 'A diferencia de sen(x) y cos(x) cuyo dominio es ℝ, ¿qué par de funciones trigonométricas comparten exactamente las mismas asíntotas verticales en x = π/2 + kπ (donde cos(x) = 0)? Escribí «tg y sec» o «cotg y cosec».',
        expected: 'tg y sec',
        diagnostics: ['assumed_identical_domain_for_all_six_trig'],
        hints: [
          'Recordá cómo se define cada una de las cuatro funciones cociente a partir de sen(x) y cos(x).',
          'Tanto tg(x) = sen(x)/cos(x) como sec(x) = 1/cos(x) tienen cos(x) en el denominador, el cual se anula en los múltiplos impares de π/2.',
          'Indicá el par de nombres cuyo denominador es cos(x).',
        ],
        explanation: 'tg(x) = sen(x)/cos(x) y sec(x) = 1/cos(x) excluyen los ceros de cos(x), es decir x = π/2 + kπ (k ∈ ℤ), mientras que cotg(x) y cosec(x) excluyen x = kπ.',
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 2,
      });
    } else if (mode === 1) {
      const amp = [2, 3, 4][Math.floor(rng() * 3)];
      const shift = [1, 2, -1][Math.floor(rng() * 3)];
      const lo = shift - amp;
      const hi = shift + amp;
      variants.push({
        id: `transfer-trig-img-${seed}-${idx}`,
        type: 'trigonometric_periodic_discrimination',
        family: 'trigonometric_periodic_discrimination',
        modelFamily: 'trigonometric',
        moduleId: 'general',
        inputKind: 'interval',
        competencyIds: [
          'trig_functions.six_functions_domains_graphs_and_bijectivity',
          'trig_functions.periodic_equations_and_domain_checks',
        ],
        prompt: `Dada la función trigonométrica f(x) = ${amp}·sen(x) ${shift >= 0 ? '+ ' + shift : '− ' + Math.abs(shift)}, ¿cuál es su conjunto imagen Im(f) en notación Exactas?`,
        expected: `[${lo}; ${hi}]`,
        diagnostics: ['accepted_sin_cos_outside_unit_interval'],
        hints: [
          'Partí de la cota fundamental −1 ≤ sen(x) ≤ 1 válida para todo x ∈ ℝ.',
          `Multiplicá la desigualdad por la amplitud ${amp} y luego sumá ${shift} en los tres miembros.`,
          'Escribí el intervalo cerrado con corchetes [mínimo; máximo] porque el seno alcanza sus extremos −1 y +1.',
        ],
        explanation: `Como −1 ≤ sen(x) ≤ 1, resulta −${amp} + (${shift}) ≤ f(x) ≤ ${amp} + (${shift}), es decir Im(f) = [${lo}; ${hi}].`,
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 2,
      });
    } else {
      variants.push({
        id: `transfer-trig-per-${seed}-${idx}`,
        type: 'trigonometric_periodic_discrimination',
        family: 'trigonometric_periodic_discrimination',
        modelFamily: 'trigonometric',
        moduleId: 'general',
        inputKind: 'number',
        competencyIds: [
          'trig_functions.six_functions_domains_graphs_and_bijectivity',
          'trig_functions.periodic_equations_and_domain_checks',
        ],
        prompt: 'A diferencia de sen(x) cuyo período fundamental es 2π, ¿cuál es el período fundamental de tg(x) = sen(x)/cos(x) expresado en radianes? (podés escribir pi)',
        expected: 'pi',
        diagnostics: ['confused_tan_period_2pi_with_pi'],
        hints: [
          'Recordá que al sumar media vuelta (π radianes) a un ángulo, tanto sen(x + π) como cos(x + π) cambian de signo simultáneamente.',
          'Al dividir (−sen(x)) / (−cos(x)), los signos menos se cancelan y se recupera exactamente tg(x).',
          'Indicá la medida exacta de media vuelta en radianes.',
        ],
        explanation: 'Para todo x en el dominio de la tangente, tg(x + π) = (−sen x)/(−cos x) = tg(x), por lo que su período fundamental es π.',
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 2,
      });
    }

    return variants;
  },
});
