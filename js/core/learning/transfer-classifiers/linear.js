/**
 * @file js/core/learning/transfer-classifiers/linear.js
 * Classifier & challenge generator for Linear models (Lineal, Unidad 03).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { tryExtractPolynomialCoeffs } from './shared-ast.js';

export const linearClassifier = Object.freeze({
  id: 'linear',
  label: 'Lineal',
  aliases: ['linear', 'lineal', 'recta', 'afin'],
  priority: Object.freeze({ table: 100, geometry: 50, analytical: 65 }),
  competencyIds: Object.freeze([
    'linear.definition_slope_and_intercept',
    'linear.angle_and_three_equation_forms',
    'linear.parallel_perpendicular_and_incidence',
    'linear.modeling_and_piecewise',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 3) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const deltaY = [];
    for (let i = 0; i < points.length - 1; i++) {
      deltaY.push(points[i + 1].y - points[i].y);
    }

    const isLinear = deltaY.every((dy) => Math.abs(dy - deltaY[0]) < tolerance);
    if (!isLinear) return null;

    const slope = deltaY[0] / deltaX;
    return {
      matched: true,
      model: 'linear',
      invariant: 'delta_y_constant',
      deltaX,
      deltaY: deltaY[0],
      slope,
      explanation: `Primeras diferencias Δy = ${fmt(deltaY[0])} constantes: modelo Lineal con pendiente m = ${fmt(slope)}.`,
    };
  },

  matchGeometry(features = {}) {
    if (
      features.isMonotonic &&
      !features.hasHorizontalAsymptote &&
      !features.hasVerticalAsymptote &&
      !features.hasVertex &&
      !features.hasSymmetryAxis &&
      !features.hasExtremum &&
      !features.hasHalfLineDomain &&
      !features.hasEndpointVertex &&
      !features.isPeriodic &&
      !features.hasInflection &&
      !features.hasMultipleTurningPoints &&
      !features.hasRemovableHole &&
      !features.hasPoleMultiplicity
    ) {
      return {
        matched: true,
        model: 'linear',
        signatureFeature: 'recta_sin_curvatura',
        explanation:
          'Una tasa de cambio constante en todo ℝ sin asíntotas, vértice ni restricción de semirrecta define una función lineal.',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    const poly = tryExtractPolynomialCoeffs(exprStr);
    if (!poly || !poly.ok) return null;
    if (poly.degree === 1 && Math.abs(poly.coeffs.b) > 1e-12) {
      return {
        matched: true,
        model: 'linear',
        signature: 'm · x + b',
        coeffs: poly.coeffs,
        explanation: `El coeficiente cuadrático es nulo (a = 0) y el lineal es b = ${fmt(poly.coeffs.b)} ≠ 0: modelo lineal.`,
      };
    }
    return null;
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Table discrimination (paired with exponentials/quadratics OR linear)
    const stepX = rng() < 0.35 ? 2 : 1;
    const xs = [0, stepX, 2 * stepX, 3 * stepX];
    const m = [2, 3, 4, 5, -2, -3, -4][Math.floor(rng() * 7)];
    const b = Math.floor(rng() * 11) - 5;
    const pts = xs.map((x) => ({ x, y: m * x + b }));
    const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
    const dy = m * stepX;

    variants.push({
      id: `transfer-tbl-lin-${seed}-${idx}`,
      type: 'table_discrimination',
      family: 'table_discrimination',
      modelFamily: 'linear',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'exponentials.tables_additive_vs_multiplicative',
        'quadratics.sum_product_factoring',
      ],
      prompt: `Observá los 4 puntos de la tabla: ${tableStr}. Verificando toda la muestra, ¿qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
      expected: 'lineal',
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        `Calculá los primeros saltos consecutivos Δy = y_{i+1} − y_i para el paso uniforme Δx = ${stepX}.`,
        `Restá los valores sucesivos de y: ${pts[1].y} − (${pts[0].y}) = ${dy}, ${pts[2].y} − (${pts[1].y}) = ${dy}, y ${pts[3].y} − (${pts[2].y}) = ${dy}.`,
        'Identificá la familia de funciones caracterizada por tener primeras diferencias Δy constantes de fila a fila.',
      ],
      explanation: `Con paso uniforme Δx = ${stepX}, los primeros saltos Δy valen siempre ${dy} (pendiente m = ${m}). Corresponde al modelo lineal f(x) = ${m}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 2: Table discrimination with linear competency tag
    variants.push({
      id: `transfer-tbl-lin-u03-${seed}-${idx}`,
      type: 'table_discrimination',
      family: 'table_discrimination',
      modelFamily: 'linear',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'linear.definition_slope_and_intercept',
        'exponentials.tables_additive_vs_multiplicative',
      ],
      prompt: `Observá los 4 puntos de la tabla: ${tableStr}. Verificando toda la muestra, ¿qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
      expected: 'lineal',
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        `Calculá las variaciones Δy para el incremento Δx = ${stepX}.`,
        `En cada paso se suma exactamente ${dy}, de modo que el cociente Δy/Δx es siempre m = ${m}.`,
        'Nombrá la familia de funciones cuya razón de cambio media es constante en todo intervalo.',
      ],
      explanation: `La razón de cambio Δy/Δx = ${m} se mantiene constante para todo par de puntos: es una función lineal.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 3: Formula reconstruction from table
    const mFit = [2, 3, 4, 5, -2, -3][Math.floor(rng() * 6)];
    const bFit = [1, 2, 3, 4, -1, -2, -3][Math.floor(rng() * 7)];
    const ptsFit = [0, 1, 2, 3].map((x) => ({ x, y: mFit * x + bFit }));
    const fitTable = ptsFit.map((p) => `(${p.x}; ${p.y})`).join(', ');
    const formula = `${mFit}x ${bFit >= 0 ? '+ ' + bFit : '- ' + Math.abs(bFit)}`;

    variants.push({
      id: `transfer-fit-lin-${seed}-${idx}`,
      type: 'model_formula_reconstruction',
      family: 'model_formula_reconstruction',
      modelFamily: 'linear',
      moduleId: 'general',
      inputKind: 'expression',
      competencyIds: [
        'exponentials.tables_additive_vs_multiplicative',
        'quadratics.canonical_form_and_vertex',
      ],
      prompt: `Identificá el invariante de la tabla ${fitTable} (lineal, exponencial o cuadrática) y escribí la expresión algebraica exacta de f(x) que ajusta los datos:`,
      expected: formula,
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        `Calculá las primeras diferencias Δy entre puntos consecutivos: ${ptsFit[1].y} − (${ptsFit[0].y}) = ${mFit} y ${ptsFit[2].y} − (${ptsFit[1].y}) = ${mFit}.`,
        `Como Δy = ${mFit} es constante con Δx = 1, es un modelo lineal m·x + b con pendiente m = ${mFit} y ordenada al origen f(0) = ${bFit}.`,
        'Armá la expresión de primer grado multiplicando la pendiente hallada por x y sumando la ordenada inicial f(0).',
      ],
      explanation: `Al tener diferencias constantes Δy = ${mFit} y valor inicial f(0) = ${bFit}, el modelo ajustado es lineal: f(x) = ${formula}.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 4: False quadratic by degree cancellation
    const p = [2, 3, 4, 5][Math.floor(rng() * 4)];
    const q = [1, 2, 3][Math.floor(rng() * 3)];
    const sumPQ = p + q;
    const prodPQ = p * q;

    variants.push({
      id: `transfer-sig-cancel-${seed}-${idx}`,
      type: 'algebraic_signature',
      family: 'algebraic_signature',
      modelFamily: 'linear',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'quadratics.area_model_and_notable_products',
        'exponentials.tables_additive_vs_multiplicative',
      ],
      prompt: `Al desarrollar y reducir la expresión f(x) = (x + ${p})·(x + ${q}) − x², ¿qué tipo de modelo resulta ser realmente en todo ℝ? Escribí «lineal», «exponencial» o «cuadratica».`,
      expected: 'lineal',
      diagnostics: ['distributed_square_over_sum'],
      hints: [
        `Desarrollá primero el producto de binomios (x + ${p})(x + ${q}) = x² + ${sumPQ}x + ${prodPQ}.`,
        `Al restar el término −x² del final, observá qué ocurre con el término cuadrático: x² + ${sumPQ}x + ${prodPQ} − x² = ${sumPQ}x + ${prodPQ}.`,
        'Como el coeficiente de grado 2 se cancela (a = 0) y sobrevive únicamente el término de grado 1 con pendiente constante, indicá el nombre del modelo resultante.',
      ],
      explanation: `Al expandir queda (x² + ${sumPQ}x + ${prodPQ}) − x² = ${sumPQ}x + ${prodPQ}. El término cuadrático se cancela (a = 0), por lo que es una falsa cuadrática que define una función lineal de pendiente m = ${sumPQ}.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    return variants;
  },
});
