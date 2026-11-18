/**
 * @file js/core/learning/transfer-classifiers/quadratic.js
 * Classifier & challenge generator for Quadratic models (Cuadrática, Unidad 05).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { tryExtractPolynomialCoeffs } from './shared-ast.js';

export const quadraticClassifier = Object.freeze({
  id: 'quadratic',
  label: 'Cuadrática',
  aliases: ['quadratic', 'cuadratica', 'parabola'],
  priority: Object.freeze({ table: 80, geometry: 65, analytical: 70 }),
  competencyIds: Object.freeze([
    'quadratics.area_model_and_notable_products',
    'quadratics.sum_product_factoring',
    'quadratics.canonical_form_and_vertex',
    'quadratics.full_analysis_exactas',
    'quadratics.extremum_optimization',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 3) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const deltaY = [];
    for (let i = 0; i < points.length - 1; i++) {
      deltaY.push(points[i + 1].y - points[i].y);
    }
    if (deltaY.every((dy) => Math.abs(dy - deltaY[0]) < tolerance)) return null;

    const delta2Y = [];
    for (let i = 0; i < deltaY.length - 1; i++) {
      delta2Y.push(deltaY[i + 1] - deltaY[i]);
    }

    const isQuadratic =
      delta2Y.length > 0 &&
      delta2Y.every((d2y) => Math.abs(d2y - delta2Y[0]) < tolerance) &&
      Math.abs(delta2Y[0]) > tolerance;

    if (!isQuadratic) return null;

    const a = delta2Y[0] / (2 * (deltaX ** 2));
    return {
      matched: true,
      model: 'quadratic',
      invariant: 'delta2_y_constant',
      deltaX,
      delta2Y: delta2Y[0],
      a,
      explanation: `Segundas diferencias Δ²y = ${fmt(delta2Y[0])} constantes: modelo Cuadrático con coeficiente principal a = ${fmt(a)}.`,
    };
  },

  matchGeometry(features = {}) {
    if (
      (features.hasVertex || features.hasSymmetryAxis || features.hasExtremum) &&
      !features.hasInflection &&
      !features.hasMultipleTurningPoints &&
      !features.hasHalfLineDomain &&
      !features.hasEndpointVertex &&
      !features.isPeriodic &&
      !features.hasHorizontalAsymptote &&
      !features.hasVerticalAsymptote &&
      (features.degree == null || features.degree === 2)
    ) {
      return {
        matched: true,
        model: 'quadratic',
        signatureFeature: 'vertice_y_eje_simetria',
        explanation:
          'La presencia de un eje de simetría vertical y un vértice (extremo absoluto) define una parábola. Su imagen incluye la ordenada del vértice con corchete cerrado.',
      };
    }
    return null;
  },

  matchAnalytical(exprStr) {
    const poly = tryExtractPolynomialCoeffs(exprStr);
    if (!poly || !poly.ok) return null;
    if (poly.degree === 2 && Math.abs(poly.coeffs.a) > 1e-12) {
      return {
        matched: true,
        model: 'quadratic',
        signature: 'a(x − h)² + k | ax² + bx + c',
        coeffs: poly.coeffs,
        explanation: `Al expandir el árbol sintáctico, el coeficiente de grado 2 es a = ${fmt(poly.coeffs.a)} ≠ 0: modelo cuadrático cuya gráfica es una parábola.`,
      };
    }
    return null;
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Table discrimination (impostor or standard quadratic)
    const isImpostor = rng() < 0.4;
    if (isImpostor) {
      const scale = [1, 2, 3][Math.floor(rng() * 3)];
      const pts = [
        { x: 0, y: 1 * scale },
        { x: 1, y: 2 * scale },
        { x: 2, y: 4 * scale },
        { x: 3, y: 7 * scale },
      ];
      const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
      variants.push({
        id: `transfer-tbl-quad-imp-${seed}-${idx}`,
        type: 'table_discrimination',
        family: 'table_discrimination',
        modelFamily: 'quadratic',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'quadratics.area_model_and_notable_products',
          'exponentials.tables_additive_vs_multiplicative',
        ],
        prompt: `¡Cuidado con las apariencias! Observá los 4 puntos de la tabla: ${tableStr}. Analizando los 4 puntos completos, ¿qué modelo exacto sigue la tabla? Escribí «lineal», «exponencial» o «cuadratica».`,
        expected: 'cuadratica',
        diagnostics: ['impostor_quadratic_table'],
        hints: [
          `No te quedes solo con los primeros 3 valores (${pts[0].y}, ${pts[1].y}, ${pts[2].y}): verificá si el 4.° valor (${pts[3].y}) mantiene el cociente ×2.`,
          `Las primeras diferencias Δy son +${scale}, +${2 * scale}, +${3 * scale}. Calculá las segundas diferencias Δ²y = Δy_{i+1} − Δy_i.`,
          `Como las segundas diferencias valen siempre +${scale} constante y distinto de cero, nombrá el modelo polinómico de grado dos correspondiente.`,
        ],
        explanation: `Aunque los primeros 3 puntos simulan duplicación, el 4.° punto rompe la razón geométrica (${pts[3].y}/${pts[2].y} ≠ 2) y revela segundas diferencias constantes Δ²y = ${scale}: es una función cuadrática impostora.`,
        representation: 'tabular',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 3,
      });
    } else {
      const a = [1, 2, 3, -1, -2][Math.floor(rng() * 5)];
      const c = Math.floor(rng() * 7) - 2;
      const pts = [0, 1, 2, 3].map((x) => ({ x, y: a * x * x + c }));
      const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
      const delta2Val = 2 * a;

      variants.push({
        id: `transfer-tbl-quad-${seed}-${idx}`,
        type: 'table_discrimination',
        family: 'table_discrimination',
        modelFamily: 'quadratic',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'quadratics.sum_product_factoring',
          'exponentials.tables_additive_vs_multiplicative',
        ],
        prompt: `Observá los puntos de la tabla: ${tableStr}. ¿Qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
        expected: 'cuadratica',
        diagnostics: ['additive_vs_multiplicative_confusion'],
        hints: [
          'Calculá las primeras diferencias Δy. Si no son constantes, calculá las segundas diferencias Δ²y = Δy_{i+1} − Δy_i.',
          `Las primeras diferencias son ${pts[1].y - pts[0].y}, ${pts[2].y - pts[1].y}, ${pts[3].y - pts[2].y}, cuya variación entre pasos consecutivos es constante e igual a ${delta2Val}.`,
          'Identificá la familia de funciones caracterizada por tener segundas diferencias Δ²y constantes y no nulas.',
        ],
        explanation: `Las segundas diferencias Δ²y valen siempre ${delta2Val} (con Δ²y = 2a). Corresponde a la función cuadrática f(x) = ${a === 1 ? '' : a === -1 ? '−' : a}x² ${c >= 0 ? '+ ' + c : '− ' + Math.abs(c)}.`,
        representation: 'tabular',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 2,
      });
    }

    // Variant 2: Formula reconstruction from table
    const aFit = [1, 2, 3][Math.floor(rng() * 3)];
    const cFit = [1, 2, 3, 4, -1, -2][Math.floor(rng() * 6)];
    const ptsFit = [0, 1, 2, 3].map((x) => ({ x, y: aFit * x * x + cFit }));
    const fitTable = ptsFit.map((p) => `(${p.x}; ${p.y})`).join(', ');
    const formula = `${aFit === 1 ? '' : aFit}x^2 ${cFit >= 0 ? '+ ' + cFit : '- ' + Math.abs(cFit)}`;

    variants.push({
      id: `transfer-fit-quad-${seed}-${idx}`,
      type: 'model_formula_reconstruction',
      family: 'model_formula_reconstruction',
      modelFamily: 'quadratic',
      moduleId: 'general',
      inputKind: 'expression',
      competencyIds: [
        'quadratics.canonical_form_and_vertex',
        'exponentials.tables_additive_vs_multiplicative',
      ],
      prompt: `Identificá el invariante de la tabla ${fitTable} (con vértice sobre el eje Y en x = 0) y escribí la fórmula algebraica exacta de f(x):`,
      expected: formula,
      diagnostics: ['swapped_canonical_parameters'],
      hints: [
        `Las primeras diferencias son ${ptsFit[1].y - ptsFit[0].y}, ${ptsFit[2].y - ptsFit[1].y}, ${ptsFit[3].y - ptsFit[2].y}, por lo que la segunda diferencia constante es Δ²y = ${2 * aFit}.`,
        `Recordá que en una cuadrática con Δx = 1 se cumple Δ²y = 2a ⟹ a = ${2 * aFit}/2 = ${aFit}, y de (0; ${cFit}) leés el término independiente c = ${cFit}.`,
        'Armá el polinomio de segundo grado combinando el término ax² con la ordenada al origen c = f(0).',
      ],
      explanation: `Con segundas diferencias constantes Δ²y = ${2 * aFit} deducimos a = ${aFit}, y con f(0) = ${cFit} obtenemos el modelo cuadrático f(x) = ${formula}.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 3: Geometry contrast (closed vertex vs open asymptote)
    const k = Math.floor(rng() * 7) + 2;
    const h = Math.floor(rng() * 4) + 1;
    const baseInv = [2, 3][Math.floor(rng() * 2)];
    variants.push({
      id: `transfer-geom-${seed}-${idx}`,
      type: 'geometry_contrast',
      family: 'geometry_contrast',
      modelFamily: 'quadratic',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'quadratics.full_analysis_exactas',
        'exponentials.shifts_and_horizontal_asymptote',
      ],
      prompt: `Compará la parábola f(x) = ${k} − (x − ${h})² y la curva exponencial g(x) = ${k} − (1/${baseInv})ˣ. Ambas tienen cota superior en y = ${k}. ¿Cuál de las dos funciones alcanza efectivamente la altura ${k} en algún punto real? Escribí «f» o «g».`,
      expected: 'f',
      diagnostics: ['used_yv_for_monotonicity_or_open_image', 'asymptote_touching_image_error'],
      hints: [
        'Evaluá si existe algún número real x donde el término restado se anule por completo.',
        `En la parábola, al evaluar en la abscisa del vértice x = ${h} el cuadrado (${h} − ${h})² se anula; en cambio, ¿puede (1/${baseInv})ˣ valer cero en ℝ?`,
        'Indicá la letra de la función cuyo extremo corresponde a un vértice alcanzable (corchete cerrado) en lugar de una asíntota horizontal.',
      ],
      explanation: `En x = ${h}, f(${h}) = ${k} − 0 = ${k} (vértice alcanzado, Im(f) = (−∞; ${k}]). En cambio, (1/${baseInv})ˣ > 0 para todo x ∈ ℝ, por lo que y = ${k} es asíntota inalcanzable de g y su imagen es abierta (−∞; ${k}).`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 4: Algebraic signature Δ²y = 2a
    const aVal = [2, 3, 4, 5, -2, -3][Math.floor(rng() * 6)];
    const delta2 = 2 * aVal;
    variants.push({
      id: `transfer-sig-${seed}-${idx}`,
      type: 'algebraic_signature',
      family: 'algebraic_signature',
      modelFamily: 'quadratic',
      moduleId: 'general',
      inputKind: 'number',
      competencyIds: [
        'quadratics.canonical_form_and_vertex',
        'exponentials.tables_additive_vs_multiplicative',
      ],
      prompt: `En una tabla con paso uniforme Δx = 1, se verifica que la segunda diferencia es constante e igual a Δ²y = ${delta2}. ¿Cuál es el coeficiente principal «a» de la función cuadrática f(x) = ax² + bx + c asociada?`,
      expected: String(aVal),
      diagnostics: ['swapped_canonical_parameters'],
      hints: [
        'Recordá la identidad analítica que vincula la segunda diferencia constante con el coeficiente principal de la parábola cuando Δx = 1.',
        `Para cualquier cuadrática f(x) = ax² + bx + c con paso Δx = 1, la primera diferencia es Δy = 2ax + a + b y la segunda diferencia es exactamente Δ²y = 2a.`,
        'Despejá el coeficiente principal «a» dividiendo el valor dado de la segunda diferencia constante Δ²y por 2.',
      ],
      explanation: `Para paso unitario Δx = 1, toda parábola verifica Δ²y = 2a. Como Δ²y = ${delta2}, resulta a = ${delta2} / 2 = ${aVal}.`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    return variants;
  },
});
