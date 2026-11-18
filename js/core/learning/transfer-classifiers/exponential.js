/**
 * @file js/core/learning/transfer-classifiers/exponential.js
 * Classifier & challenge generator for Exponential models (Exponencial, Unidad 08).
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { fmt } from '../../math-format.js';
import { astContainsVar, evalMathAst, parseMathAst } from './shared-ast.js';

function hasVariableInExponent(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'pow' && astContainsVar(node.exponent)) {
    return true;
  }
  if (node.type === 'paren') return hasVariableInExponent(node.expr);
  if (node.type === 'neg') return hasVariableInExponent(node.value);
  if (node.type === 'binary') {
    return hasVariableInExponent(node.left) || hasVariableInExponent(node.right);
  }
  if (node.type === 'pow') {
    return hasVariableInExponent(node.base) || hasVariableInExponent(node.exponent);
  }
  if (node.type === 'call') {
    return node.args.some((a) => hasVariableInExponent(a));
  }
  return false;
}

export const exponentialClassifier = Object.freeze({
  id: 'exponential',
  label: 'Exponencial',
  aliases: ['exponential', 'exponencial', 'exp'],
  priority: Object.freeze({ table: 90, geometry: 75, analytical: 85 }),
  competencyIds: Object.freeze([
    'exponentials.tables_additive_vs_multiplicative',
    'exponentials.analytical_reconstruction_two_points',
    'exponentials.time_models_rates_and_euler_base',
    'exponentials.shifts_and_horizontal_asymptote',
    'exponentials.full_analytical_study',
  ]),

  matchTable(points, tolerance = 1e-5) {
    if (!Array.isArray(points) || points.length < 3) return null;
    const deltaX = points[1].x - points[0].x;
    if (Math.abs(deltaX) < tolerance) return null;

    const allPositive = points.every((p) => p.y > tolerance);
    const allNegative = points.every((p) => p.y < -tolerance);
    if (!allPositive && !allNegative) return null;

    const ratios = [];
    for (let i = 0; i < points.length - 1; i++) {
      ratios.push(points[i + 1].y / points[i].y);
    }
    const isExponential =
      ratios.every((r) => Math.abs(r - ratios[0]) < tolerance) &&
      Math.abs(ratios[0] - 1) > tolerance;

    if (!isExponential) return null;

    const base = Math.pow(ratios[0], 1 / deltaX);
    return {
      matched: true,
      model: 'exponential',
      invariant: 'ratio_constant',
      deltaX,
      ratio: ratios[0],
      base,
      explanation: `Cocientes sucesivos r = ${fmt(ratios[0])} constantes: modelo Exponencial con factor de crecimiento r y base a = ${fmt(base)}.`,
    };
  },

  matchGeometry(features = {}) {
    if (
      features.hasHorizontalAsymptote &&
      !features.hasVerticalAsymptote &&
      !features.hasRemovableHole &&
      !features.hasPoleMultiplicity &&
      !features.isPeriodic
    ) {
      const asyText = features.asymptoteY !== undefined ? ` en y = ${fmt(features.asymptoteY)}` : '';
      return {
        matched: true,
        model: 'exponential',
        signatureFeature: 'asintota_horizontal',
        explanation: `La presencia de una asíntota horizontal inalcanzable${asyText} sin asíntota vertical define una función exponencial. Su imagen excluye el valor asintótico con paréntesis abierto.`,
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
    if (!hasVariableInExponent(ast)) return null;

    const samplePts = [0, 1, 2, 3].map((x) => ({ x, y: evalMathAst(ast, x) }));
    if (samplePts.every((p) => Number.isFinite(p.y))) {
      const dy0 = samplePts[1].y - samplePts[0].y;
      const dy1 = samplePts[2].y - samplePts[1].y;
      const dy2 = samplePts[3].y - samplePts[2].y;
      if (Math.abs(dy0) > 1e-6 && Math.abs(dy1) > 1e-6) {
        const r1 = dy1 / dy0;
        const r2 = dy2 / dy1;
        if (Math.abs(r1 - r2) < 1e-5 && r1 > 0 && Math.abs(r1 - 1) > 1e-5) {
          return {
            matched: true,
            model: 'exponential',
            signature: 'k · a^x + c',
            explanation: `La variable x actúa en el exponente con factor multiplicativo constante r = ${fmt(r1)}: modelo exponencial.`,
          };
        }
      }
    }

    return {
      matched: true,
      model: 'exponential',
      signature: 'k · a^x + c',
      explanation: 'La variable x se encuentra en el exponente: modelo exponencial gobernado por una base constante.',
    };
  },

  generateChallenges(rng, seed, idx) {
    const variants = [];

    // Variant 1: Table discrimination (exponential)
    const base = [2, 3, 4][Math.floor(rng() * 3)];
    const k = [1, 2, 3, 5][Math.floor(rng() * 4)];
    const pts = [0, 1, 2, 3].map((x) => ({ x, y: k * Math.pow(base, x) }));
    const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');

    variants.push({
      id: `transfer-tbl-exp-${seed}-${idx}`,
      type: 'table_discrimination',
      family: 'table_discrimination',
      modelFamily: 'exponential',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'exponentials.tables_additive_vs_multiplicative',
        'quadratics.sum_product_factoring',
      ],
      prompt: `Observá los puntos de la tabla: ${tableStr}. ¿Qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
      expected: 'exponencial',
      diagnostics: ['linear_difference_instead_of_ratio'],
      hints: [
        'Verificá si al avanzar una unidad en x los valores de y cambian sumando una cantidad fija o multiplicando por un factor constante.',
        `Dividí términos consecutivos en toda la tabla: ${pts[1].y}/${pts[0].y} = ${base}, ${pts[2].y}/${pts[1].y} = ${base}, y ${pts[3].y}/${pts[2].y} = ${base}.`,
        'Nombrá el modelo caracterizado por mantener constante el cociente multiplicativo y_{i+1} / y_i entre filas sucesivas.',
      ],
      explanation: `El cociente entre valores consecutivos es constante r = ${base} en toda la muestra. Corresponde al modelo exponencial f(x) = ${k} · ${base}ˣ.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    // Variant 2: Formula reconstruction from table
    const kFit = [2, 3, 4][Math.floor(rng() * 3)];
    const aFit = [2, 3][Math.floor(rng() * 2)];
    const ptsFit = [0, 1, 2, 3].map((x) => ({ x, y: kFit * Math.pow(aFit, x) }));
    const fitTable = ptsFit.map((p) => `(${p.x}; ${p.y})`).join(', ');
    const formula = `${kFit} * ${aFit}^x`;

    variants.push({
      id: `transfer-fit-exp-${seed}-${idx}`,
      type: 'model_formula_reconstruction',
      family: 'model_formula_reconstruction',
      modelFamily: 'exponential',
      moduleId: 'general',
      inputKind: 'expression',
      competencyIds: [
        'exponentials.analytical_reconstruction_two_points',
        'exponentials.tables_additive_vs_multiplicative',
      ],
      prompt: `Identificá el invariante de la tabla ${fitTable} (lineal, exponencial o cuadrática) y escribí la fórmula algebraica exacta de f(x) (ej: 2 * 3^x):`,
      expected: formula,
      diagnostics: ['multiplied_k_and_base'],
      hints: [
        `Observá que las diferencias Δy no son constantes, pero los cocientes sucesivos valen ${ptsFit[1].y}/${ptsFit[0].y} = ${aFit} y ${ptsFit[2].y}/${ptsFit[1].y} = ${aFit}.`,
        `Es un modelo exponencial k · aˣ con razón multiplicativa constante a = ${aFit} y valor inicial f(0) = k = ${kFit}.`,
        'Escribí el producto entre el coeficiente inicial k = f(0) y la potencia de base a elevada a la x.',
      ],
      explanation: `Los cocientes sucesivos son constantes e iguales a ${aFit} y la ordenada al origen es f(0) = ${kFit}, por lo que f(x) = ${kFit} · ${aFit}ˣ.`,
      representation: 'tabular',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 3: Geometry contrast open asymptote interval
    const cShift = Math.floor(rng() * 7) + 2;
    const hShift = Math.floor(rng() * 4) + 1;
    const baseInv = [2, 3][Math.floor(rng() * 2)];
    const ansIv = `(-inf; ${cShift})`;

    variants.push({
      id: `transfer-geom-iv-${seed}-${idx}`,
      type: 'geometry_contrast',
      family: 'geometry_contrast',
      modelFamily: 'exponential',
      moduleId: 'general',
      inputKind: 'interval',
      competencyIds: [
        'quadratics.full_analysis_exactas',
        'exponentials.shifts_and_horizontal_asymptote',
      ],
      prompt: `La parábola f(x) = ${cShift} − (x − ${hShift})² tiene imagen cerrada Im(f) = (−∞; ${cShift}] porque alcanza su vértice en x = ${hShift}. En contraste, ¿cuál es el conjunto imagen Im(g) de la exponencial g(x) = ${cShift} − (1/${baseInv})ˣ en notación de intervalo Exactas?`,
      expected: ansIv,
      diagnostics: ['closed_bracket_on_asymptote'],
      hints: [
        `Analizá el signo del término exponencial: (1/${baseInv})ˣ > 0 para todo x real, nunca llega a valer cero.`,
        `Como a ${cShift} siempre se le resta una cantidad estrictamente positiva, g(x) queda siempre por debajo de la asíntota horizontal y = ${cShift} sin tocarla.`,
        `Escribí el intervalo que va desde -inf hasta la cota asintótica ${cShift} usando paréntesis redondo abierto en ambos extremos y punto y coma como separador.`,
      ],
      explanation: `A diferencia de la parábola que toca su vértice (corchete cerrado), en g(x) = ${cShift} − (1/${baseInv})ˣ la recta y = ${cShift} es una asíntota horizontal inalcanzable, por lo que Im(g) = (−∞; ${cShift}).`,
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 3,
    });

    // Variant 4: Growth hierarchy
    const mLin = [500, 1000, 2000][Math.floor(rng() * 3)];
    const aQuad = [10, 20, 50][Math.floor(rng() * 3)];
    const baseExp = [2, 3][Math.floor(rng() * 2)];

    variants.push({
      id: `transfer-growth-${seed}-${idx}`,
      type: 'growth_hierarchy',
      family: 'growth_hierarchy',
      modelFamily: 'exponential',
      moduleId: 'general',
      inputKind: 'text',
      competencyIds: [
        'exponentials.time_models_rates_and_euler_base',
        'quadratics.extremum_optimization',
      ],
      prompt: `A medida que x tiende a +∞, ¿cuál de estas tres funciones supera asintóticamente a las otras dos: f(x) = ${mLin}·x, g(x) = ${aQuad}·x², o h(x) = ${baseExp}ˣ? Escribí «f», «g» o «h».`,
      expected: 'h',
      diagnostics: ['additive_vs_multiplicative_confusion'],
      hints: [
        `Compará cómo crece cada modelo al incrementar x en 1 unidad: f suma ${mLin} fijo, g tiene segunda diferencia constante ${2 * aQuad}, y h se multiplica por ${baseExp} en cada paso.`,
        `Aunque ${mLin}·x y ${aQuad}·x² sean grandes para valores pequeños de x, la multiplicación reiterada por ${baseExp} duplica o triplica el acumulado en cada unidad.`,
        'Seleccioná la función cuya variable independiente se ubica en el exponente con base mayor que 1.',
      ],
      explanation: `Por jerarquía de órdenes de crecimiento hacia +∞, toda exponencial con base a > 1 (${baseExp}ˣ) crece más rápido que cualquier polinomio de segundo grado (${aQuad}x²) y que cualquier función lineal (${mLin}x).`,
      representation: 'verbal',
      stage: 'transfer',
      transferDistance: 'far',
      difficulty: 2,
    });

    return variants;
  },
});
