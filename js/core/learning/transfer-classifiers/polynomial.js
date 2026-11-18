/**
 * @file js/core/learning/transfer-classifiers/polynomial.js
 * Classifier & challenge generator for Higher-Degree Polynomial models (Polinomios, Unidad 06).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { tryExtractPolynomialCoeffs } from './shared-ast.js';

function finiteDiffs(arr) {
  const out = [];
  for (let i = 0; i < arr.length - 1; i++) {
    out.push(arr[i + 1] - arr[i]);
  }
  return out;
}

export const polynomialClassifier = Object.freeze({
  id: 'polynomial',
  label: 'Polinómica',
  aliases: ['polynomial', 'polinomica', 'polinomio', 'cubica', 'grado_mayor_2'],
  priority: Object.freeze({ table: 70, geometry: 70, analytical: 75 }),
  competencyIds: Object.freeze([
    'polynomials.structure_degree_and_equality',
    'polynomials.arithmetic_and_degree_laws',
    'polynomials.division_ruffini_and_remainder',
    'polynomials.factoring_and_gauss_roots',
  ]),

  matchTable(points, tolerance = 1e-5) {
    // Require >= 5 points so Δ³y has at least 2 entries to verify constancy (keeps 4 irregular points as 'neither')
    if (!Array.isArray(points) || points.length < 5) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const ys = points.map((p) => p.y);
    const d1 = finiteDiffs(ys);
    if (d1.every((v) => Math.abs(v - d1[0]) < tolerance)) return null;
    const d2 = finiteDiffs(d1);
    if (d2.every((v) => Math.abs(v - d2[0]) < tolerance)) return null;

    const d3 = finiteDiffs(d2);
    if (d3.length >= 2 && d3.every((v) => Math.abs(v - d3[0]) < tolerance) && Math.abs(d3[0]) > tolerance) {
      return {
        matched: true,
        model: 'polynomial',
        invariant: 'delta_n_y_constant',
        degree: 3,
        deltaX,
        delta3Y: d3[0],
        explanation: `Terceras diferencias Δ³y = ${fmt(d3[0])} constantes y no nulas: modelo Polinómico de grado 3.`,
      };
    }

    if (points.length >= 6) {
      const d4 = finiteDiffs(d3);
      if (d4.length >= 2 && d4.every((v) => Math.abs(v - d4[0]) < tolerance) && Math.abs(d4[0]) > tolerance) {
        return {
          matched: true,
          model: 'polynomial',
          invariant: 'delta_n_y_constant',
          degree: 4,
          deltaX,
          delta4Y: d4[0],
          explanation: `Cuartas diferencias Δ⁴y = ${fmt(d4[0])} constantes y no nulas: modelo Polinómico de grado 4.`,
        };
      }
    }

    return null;
  },

  matchGeometry(features = {}) {
    if (
      (typeof features.degree === 'number' && features.degree >= 3) ||
      features.hasMultipleTurningPoints ||
      features.hasInflection
    ) {
      return {
        matched: true,
        model: 'polynomial',
        signatureFeature: 'inflexion_o_multiples_extremos',
        explanation:
          'La presencia de punto de inflexión, múltiples extremos relativos o grado ≥ 3 caracteriza a un modelo polinómico de grado superior.',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    const poly = tryExtractPolynomialCoeffs(exprStr);
    if (!poly || !poly.ok) return null;
    if (poly.degree >= 3) {
      return {
        matched: true,
        model: 'polynomial',
        signature: `P(x) de grado ${poly.degree}`,
        degree: poly.degree,
        coeffsNum: poly.coeffsNum,
        explanation: `Al expandir la expresión polinómica resulta un polinomio exacto de grado ${poly.degree} ≥ 3.`,
      };
    }
    return null;
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Cubic table discrimination (5 points, constant Δ³y = 6a)
    const a = [1, 2, -1][Math.floor(rng() * 3)];
    const d = Math.floor(rng() * 5) - 2;
    const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: a * x * x * x + d }));
    const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
    const d3Val = 6 * a;

    variants.push({
      id: `transfer-tbl-poly-${seed}-${idx}`,
      type: 'table_discrimination',
      family: 'table_discrimination',
      modelFamily: 'polynomial',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'polynomials.arithmetic_and_degree_laws',
        'quadratics.sum_product_factoring',
      ],
      prompt: `Observá los 5 puntos de la tabla: ${tableStr}. Ni Δy ni Δ²y son constantes ni los cocientes son fijos. Verificando Δ³y, ¿qué modelo describe esta relación? Escribí «lineal», «cuadratica», «polinomica» o «exponencial».`,
      expected: 'polinomica',
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        'Calculá las primeras diferencias Δy, luego las segundas Δ²y y finalmente las terceras Δ³y.',
        `Con paso Δx = 1, las terceras diferencias Δ³y valen siempre ${d3Val} (constante y no nula).`,
        'Nombrá la familia de grado superior (≥ 3) caracterizada por diferencias finitas de tercer orden constantes.',
      ],
      explanation: `Las terceras diferencias son constantes Δ³y = ${d3Val} = 6a, por lo que corresponde a una función polinómica cúbica f(x) = ${a === 1 ? '' : a === -1 ? '−' : a}x³ ${d >= 0 ? '+ ' + d : '− ' + Math.abs(d)}.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 2: Degree cancellation in sum of opposite leading terms P(x) + Q(x)
    const deg = [3, 4][Math.floor(rng() * 2)];
    const lead = [2, 3, 4][Math.floor(rng() * 3)];
    const subLead = [2, 5, -3][Math.floor(rng() * 3)];

    variants.push({
      id: `transfer-alg-poly-deg-${seed}-${idx}`,
      type: 'algebraic_signature',
      family: 'algebraic_signature',
      modelFamily: 'polynomial',
      moduleId: 'general',
      inputKind: 'number',
      competencyIds: [
        'polynomials.structure_degree_and_equality',
        'polynomials.arithmetic_and_degree_laws',
      ],
      prompt: `Si P(x) = ${lead}x^${deg} + ${subLead}x^2 − 1 y Q(x) = −${lead}x^${deg} + 3x − 4, ¿cuál es el grado exacto del polinomio suma P(x) + Q(x)?`,
      expected: '2',
      diagnostics: ['wrong_sum_degree_cancellation'],
      hints: [
        'Sumá término a término los coeficientes del mismo grado en x.',
        `El término principal ${lead}x^${deg} se cancela con −${lead}x^${deg}, dejando sobrevivir al término de segundo grado ${subLead}x².`,
        'Indicá el mayor exponente con coeficiente distinto de cero que queda luego de reducir.',
      ],
      explanation: `Al sumar P(x) + Q(x), los términos de grado ${deg} se cancelan (${lead} − ${lead} = 0) y el término no nulo de mayor exponente es ${subLead}x², por lo que gr(P + Q) = 2.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 3: Rational vs polynomial domain contrast
    const r = [1, 2, 3][Math.floor(rng() * 3)];
    variants.push({
      id: `transfer-rat-vs-poly-dom-${seed}-${idx}`,
      type: 'rational_vs_polynomial_domain',
      family: 'rational_vs_polynomial_domain',
      modelFamily: 'polynomial',
      moduleId: 'general',
      inputKind: 'interval',
      competencyIds: [
        'polynomials.factoring_and_gauss_roots',
        'rational.domain_holes_and_asymptotes',
      ],
      prompt: `Mientras que el polinomio P(x) = x² − ${r * r} tiene dominio ℝ, la función racional R(x) = (x² − ${r * r}) / (x − ${r}) NO se simplifica a x + ${r} sin conservar su restricción. ¿Cuál es el dominio exacto de R(x) en notación Exactas? (ej: R - {1})`,
      expected: `R - {${r}}`,
      diagnostics: ['lost_domain_restriction_after_cancel'],
      hints: [
        'Evaluá qué valor de x anula el denominador original (x − ' + r + ').',
        `Aunque (x² − ${r * r}) = (x − ${r})(x + ${r}) comparte un factor con el denominador, R(${r}) produce 0/0 y queda excluido del dominio.`,
        `Escribí el conjunto de todos los reales excluyendo el punto conflictivo usando la notación R - {valor}.`,
      ],
      explanation: `El denominador x − ${r} se anula en x = ${r}. Aunque el factor (x − ${r}) se simplifica dejando un agujero evitable en (${r}; ${2 * r}), el dominio de R(x) sigue siendo ℝ − {${r}}.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    return variants;
  },
});
