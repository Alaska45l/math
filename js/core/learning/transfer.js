/**
 * @file js/core/learning/transfer.js
 * Alaska Math Lab — Inter-Module Transfer & Model Discrimination Engine
 * Distinguishes between Linear, Exponential, and Quadratic models across
 * numerical invariants, geometric features, and AST-parsed algebraic signatures.
 *
 * Complies with ORIGINAL_REQUEST §P2.2, PROJECT.md §135, and LEARNING_ARCHITECTURE.md §6.7.
 * Runtime: Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { fmt } from '../math-format.js';
import { createLearningEvent } from './events.js';
import { getProgressStore } from './progress-store.js';
import { parseQuadExpr, equivalentQuadExpr, parseNumberOrFraction } from '../../modules/cuadraticas/expr.js';
import { parseExp, evalExp, equivalentExp, parseIntervalExactas } from '../../modules/exponenciales/expr.js';

export const MODEL_TYPES = Object.freeze({
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
  QUADRATIC: 'quadratic',
  NEITHER: 'neither',
});

export const INVARIANT_TYPES = Object.freeze({
  DELTA_Y_CONSTANT: 'delta_y_constant',
  RATIO_CONSTANT: 'ratio_constant',
  DELTA2_Y_CONSTANT: 'delta2_y_constant',
  NONE: 'none',
});

export const TRANSFER_FAMILIES = Object.freeze([
  {
    id: 'table_discrimination',
    label: 'Discriminación por Invariantes en Tablas (Δy vs. Razón vs. Δ²y)',
    competencyId: 'exponentials.tables_additive_vs_multiplicative',
  },
  {
    id: 'model_formula_reconstruction',
    label: 'Ajuste Algebraico desde Tabla (Lineal vs. Exponencial vs. Cuadrática)',
    competencyId: 'exponentials.analytical_reconstruction_two_points',
  },
  {
    id: 'geometry_contrast',
    label: 'Contraste Geométrico (Asíntota Horizontal vs. Vértice y Simetría)',
    competencyId: 'quadratics.full_analysis_exactas',
  },
  {
    id: 'growth_hierarchy',
    label: 'Jerarquía de Crecimiento Asintótico (Lineal vs. Cuadrático vs. Exponencial)',
    competencyId: 'exponentials.time_models_rates_and_euler_base',
  },
  {
    id: 'algebraic_signature',
    label: 'Firma Algebraica, Segundas Diferencias y Cancelación de Grado',
    competencyId: 'quadratics.area_model_and_notable_products',
  },
]);

/**
 * 32-bit PRNG Mulberry32 for deterministic challenge generation.
 */
export function mulberry32(seed) {
  let s = Math.trunc(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Normalizes answer text for robust string matching:
 * - Trims and lowercases
 * - Strips diacritics (acentos)
 * - Converts typographic minus to hyphen
 */
export function normalizeTransferAnswer(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/−/g, '-')
    .replace(/\s+/g, ' ');
}

/**
 * Validates user input against a transfer challenge using AST mathematical equivalence
 * for expressions/intervals/numbers, or normalized string comparison for conceptual tokens.
 *
 * @param {object} challenge
 * @param {string} rawInput
 * @returns {{ ok: boolean, empty?: boolean, syntaxError?: string }}
 */
export function validateTransferAnswer(challenge, rawInput) {
  const trimmed = String(rawInput ?? '').trim();
  if (!trimmed) {
    return { ok: false, empty: true };
  }

  if (challenge.inputKind === 'number') {
    try {
      const val = parseNumberOrFraction(trimmed);
      return { ok: Math.abs(val - Number(challenge.expected)) < 1e-6 };
    } catch {
      return { ok: false, syntaxError: 'Ingresá un número o fracción válida.' };
    }
  }

  if (challenge.inputKind === 'interval') {
    try {
      const expIv = parseIntervalExactas(String(challenge.expected));
      const userIv = parseIntervalExactas(trimmed);
      if (!expIv || !userIv) return { ok: false };
      const ok =
        expIv.loOpen === userIv.loOpen &&
        expIv.hiOpen === userIv.hiOpen &&
        (expIv.lo === userIv.lo || Math.abs(expIv.lo - userIv.lo) < 1e-4) &&
        (expIv.hi === userIv.hi || Math.abs(expIv.hi - userIv.hi) < 1e-4);
      return { ok };
    } catch (err) {
      return { ok: false, syntaxError: err?.message || 'Formato de intervalo inválido.' };
    }
  }

  if (challenge.inputKind === 'expression') {
    // Try AST quadratic/linear equivalence first
    try {
      const quadEq = equivalentQuadExpr(trimmed, String(challenge.expected), null);
      if (quadEq && quadEq.equivalent) {
        return { ok: true };
      }
    } catch {}

    // Try AST exponential/general equivalence
    try {
      if (equivalentExp(trimmed, String(challenge.expected))) {
        return { ok: true };
      }
    } catch {}
  }

  const normUser = normalizeTransferAnswer(trimmed);
  const normExp = normalizeTransferAnswer(challenge.expected);
  if (normUser === normExp) {
    return { ok: true };
  }

  // Also allow e.g. "f(x)" when expected is "f"
  if (normExp.length === 1 && normUser === `${normExp}(x)`) {
    return { ok: true };
  }

  return { ok: false };
}

/**
 * Analyzes numerical points to determine if they strictly follow a Linear,
 * Exponential, or Quadratic progression.
 *
 * @param {Array<{x: number, y: number}>} points - Sorted array of points with constant Δx > 0
 * @param {number} [tolerance=1e-5]
 * @returns {{
 *   model: string,
 *   invariant: string,
 *   deltaX: number,
 *   deltaY?: number,
 *   delta2Y?: number,
 *   ratio?: number,
 *   base?: number,
 *   slope?: number,
 *   a?: number,
 *   explanation: string
 * }}
 */
export function classifyModelByTable(points, tolerance = 1e-5) {
  if (!Array.isArray(points) || points.length < 3) {
    return {
      model: MODEL_TYPES.NEITHER,
      invariant: INVARIANT_TYPES.NONE,
      deltaX: 0,
      explanation: 'Se requieren al menos 3 puntos con paso Δx uniforme para discriminar modelos.',
    };
  }

  const deltaX = points[1].x - points[0].x;
  if (Math.abs(deltaX) < tolerance) {
    return {
      model: MODEL_TYPES.NEITHER,
      invariant: INVARIANT_TYPES.NONE,
      deltaX: 0,
      explanation: 'Los valores de x deben ser distintos y ordenados.',
    };
  }

  // Verify uniform step Δx
  for (let i = 1; i < points.length; i++) {
    const curDx = points[i].x - points[i - 1].x;
    if (Math.abs(curDx - deltaX) > tolerance) {
      return {
        model: MODEL_TYPES.NEITHER,
        invariant: INVARIANT_TYPES.NONE,
        deltaX,
        explanation: 'El paso Δx en la tabla no es uniforme.',
      };
    }
  }

  // 1. Calculate first differences Δy_i = y_{i+1} - y_i
  const deltaY = [];
  for (let i = 0; i < points.length - 1; i++) {
    deltaY.push(points[i + 1].y - points[i].y);
  }

  const isLinear = deltaY.every((dy) => Math.abs(dy - deltaY[0]) < tolerance);
  if (isLinear) {
    const slope = deltaY[0] / deltaX;
    return {
      model: MODEL_TYPES.LINEAR,
      invariant: INVARIANT_TYPES.DELTA_Y_CONSTANT,
      deltaX,
      deltaY: deltaY[0],
      slope,
      explanation: `Primeras diferencias Δy = ${fmt(deltaY[0])} constantes: modelo Lineal con pendiente m = ${fmt(slope)}.`,
    };
  }

  // 2. Calculate second differences Δ²y_i = Δy_{i+1} - Δy_i
  const delta2Y = [];
  for (let i = 0; i < deltaY.length - 1; i++) {
    delta2Y.push(deltaY[i + 1] - deltaY[i]);
  }

  // 3. Calculate ratios r_i = y_{i+1} / y_i (requires non-zero same-sign values)
  const allPositive = points.every((p) => p.y > tolerance);
  const allNegative = points.every((p) => p.y < -tolerance);

  if (allPositive || allNegative) {
    const ratios = [];
    for (let i = 0; i < points.length - 1; i++) {
      ratios.push(points[i + 1].y / points[i].y);
    }
    const isExponential =
      ratios.every((r) => Math.abs(r - ratios[0]) < tolerance) &&
      Math.abs(ratios[0] - 1) > tolerance;

    if (isExponential) {
      const base = Math.pow(ratios[0], 1 / deltaX);
      return {
        model: MODEL_TYPES.EXPONENTIAL,
        invariant: INVARIANT_TYPES.RATIO_CONSTANT,
        deltaX,
        ratio: ratios[0],
        base,
        explanation: `Cocientes sucesivos r = ${fmt(ratios[0])} constantes: modelo Exponencial con factor de crecimiento r y base a = ${fmt(base)}.`,
      };
    }
  }

  const isQuadratic =
    delta2Y.length > 0 &&
    delta2Y.every((d2y) => Math.abs(d2y - delta2Y[0]) < tolerance) &&
    Math.abs(delta2Y[0]) > tolerance;

  if (isQuadratic) {
    const a = delta2Y[0] / (2 * (deltaX ** 2));
    return {
      model: MODEL_TYPES.QUADRATIC,
      invariant: INVARIANT_TYPES.DELTA2_Y_CONSTANT,
      deltaX,
      delta2Y: delta2Y[0],
      a,
      explanation: `Segundas diferencias Δ²y = ${fmt(delta2Y[0])} constantes: modelo Cuadrático con coeficiente principal a = ${fmt(a)}.`,
    };
  }

  return {
    model: MODEL_TYPES.NEITHER,
    invariant: INVARIANT_TYPES.NONE,
    deltaX,
    explanation: 'Ni Δy, ni Δ²y, ni los cocientes sucesivos se mantienen constantes.',
  };
}

/**
 * Classifies a model based on its geometric and qualitative features.
 *
 * @param {object} features
 * @param {boolean} [features.hasHorizontalAsymptote]
 * @param {number} [features.asymptoteY]
 * @param {boolean} [features.hasVertex]
 * @param {boolean} [features.hasSymmetryAxis]
 * @param {boolean} [features.isMonotonic]
 * @param {boolean} [features.hasExtremum]
 * @returns {{
 *   model: string,
 *   signatureFeature: string,
 *   explanation: string
 * }}
 */
export function classifyModelByGeometry(features = {}) {
  if (features.hasHorizontalAsymptote) {
    const asyText = features.asymptoteY !== undefined ? ` en y = ${fmt(features.asymptoteY)}` : '';
    return {
      model: MODEL_TYPES.EXPONENTIAL,
      signatureFeature: 'asintota_horizontal',
      explanation: `La presencia de una asíntota horizontal inalcanzable${asyText} define una función exponencial. Su imagen excluye el valor asintótico con paréntesis abierto.`,
    };
  }

  if (features.hasVertex || features.hasSymmetryAxis || features.hasExtremum) {
    return {
      model: MODEL_TYPES.QUADRATIC,
      signatureFeature: 'vertice_y_eje_simetria',
      explanation: 'La presencia de un eje de simetría vertical y un vértice (extremo absoluto) define una parábola. Su imagen incluye la ordenada del vértice con corchete cerrado.',
    };
  }

  if (features.isMonotonic && !features.hasHorizontalAsymptote && !features.hasVertex) {
    return {
      model: MODEL_TYPES.LINEAR,
      signatureFeature: 'recta_sin_curvatura',
      explanation: 'Una tasa de cambio constante en todo R sin saturación asintótica ni vértice define una función lineal.',
    };
  }

  return {
    model: MODEL_TYPES.NEITHER,
    signatureFeature: 'indeterminado',
    explanation: 'Las características geométricas proporcionadas no permiten discriminar el modelo de forma concluyente.',
  };
}

/**
 * Classifies an algebraic expression or formula string into its model family
 * using the AST parsers of Quadratics and Exponentials (handling false quadratics
 * by term cancellation like (x + 2)² − x² → linear).
 *
 * @param {string} exprStr
 * @returns {{
 *   model: string,
 *   signature: string,
 *   coeffs?: { a: number, b: number, c: number },
 *   explanation: string
 * }}
 */
export function classifyModelByAnalytical(exprStr) {
  const raw = String(exprStr || '').trim();
  if (!raw) {
    return {
      model: MODEL_TYPES.NEITHER,
      signature: 'desconocida',
      explanation: 'Expresión vacía.',
    };
  }

  // 1. Try AST polynomial/quadratic parser first (accurately expands and checks if a != 0)
  try {
    const parsedQuad = parseQuadExpr(raw);
    if (parsedQuad && parsedQuad.ok) {
      if (parsedQuad.isQuadratic) {
        return {
          model: MODEL_TYPES.QUADRATIC,
          signature: 'a(x − h)² + k | ax² + bx + c',
          coeffs: parsedQuad.coeffs,
          explanation: `Al expandir el árbol sintáctico, el coeficiente de grado 2 es a = ${fmt(parsedQuad.a)} ≠ 0: modelo cuadrático cuya gráfica es una parábola.`,
        };
      }
      if (parsedQuad.isLinear) {
        return {
          model: MODEL_TYPES.LINEAR,
          signature: 'm · x + b',
          coeffs: parsedQuad.coeffs,
          explanation: `El coeficiente cuadrático es nulo (a = 0) y el lineal es b = ${fmt(parsedQuad.b)} ≠ 0: modelo lineal.`,
        };
      }
    }
  } catch {
    // Non-polynomial (e.g. variable in exponent) -> proceed to exponential parser
  }

  // 2. Try AST exponential parser + numerical probing
  try {
    const parsedExp = parseExp(raw);
    if (parsedExp && parsedExp.ast) {
      const samplePts = [0, 1, 2, 3].map((x) => ({ x, y: evalExp(parsedExp.ast, x) }));
      if (samplePts.every((p) => Number.isFinite(p.y))) {
        // Check if shifted exponential f(x) = k*a^x + c: first differences Δy form a geometric progression
        const dy0 = samplePts[1].y - samplePts[0].y;
        const dy1 = samplePts[2].y - samplePts[1].y;
        const dy2 = samplePts[3].y - samplePts[2].y;
        if (Math.abs(dy0) > 1e-6 && Math.abs(dy1) > 1e-6) {
          const r1 = dy1 / dy0;
          const r2 = dy2 / dy1;
          if (Math.abs(r1 - r2) < 1e-5 && r1 > 0 && Math.abs(r1 - 1) > 1e-5) {
            return {
              model: MODEL_TYPES.EXPONENTIAL,
              signature: 'k · a^x + c',
              explanation: `La variable x actúa en el exponente con factor multiplicativo constante r = ${fmt(r1)}: modelo exponencial.`,
            };
          }
        }
      }
    }
  } catch {}

  // 3. Fallback structural check for symbolic bases like e^{2x}
  const clean = raw.toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
  if (/\^[({]?-?[0-9a-z]*x/i.test(clean) || /[ˣ]/i.test(clean)) {
    return {
      model: MODEL_TYPES.EXPONENTIAL,
      signature: 'k · a^x + c',
      explanation: 'La variable x se encuentra en el exponente: modelo exponencial gobernado por una base constante.',
    };
  }

  return {
    model: MODEL_TYPES.NEITHER,
    signature: 'desconocida',
    explanation: 'La expresión no corresponde a las formas lineales, cuadráticas o exponenciales estudiadas.',
  };
}

/**
 * Generates an adversarial or contrastive inter-module transfer challenge.
 *
 * Families:
 * - table_discrimination: Given table (4 points), identify model (lineal, exponencial, cuadratica)
 * - model_formula_reconstruction: Given table, deduce invariant and write the explicit algebraic formula f(x)
 * - geometry_contrast: Contrast horizontal asymptote (open bound) vs vertex extremum (closed bound)
 * - growth_hierarchy: Long-term asymptotic dominance comparison with varying parameters
 * - algebraic_signature: Deduce leading coefficient a from Δ²y or detect false quadratics by cancellation
 *
 * @param {number} seed
 * @param {string} [family='all']
 * @param {number} [problemIndex=0]
 * @returns {object} Conforming challenge object with 8-tuple metadata
 */
export function generateTransferChallenge(seed, family = 'all', problemIndex = 0) {
  const rng = mulberry32((seed + problemIndex * 7919 + 1013) >>> 0);

  const resolvedFamily =
    !family || family === 'all' || family === 'aleatorio'
      ? TRANSFER_FAMILIES[(Math.floor(rng() * TRANSFER_FAMILIES.length) + problemIndex) % TRANSFER_FAMILIES.length].id
      : family;

  switch (resolvedFamily) {
    case 'table_discrimination': {
      const modeRoll = Math.floor(rng() * 3); // 0: linear, 1: quadratic, 2: exponential
      const stepX = rng() < 0.35 ? 2 : 1;
      const xs = [0, stepX, 2 * stepX, 3 * stepX];

      if (modeRoll === 0) {
        const m = [2, 3, 4, 5, -2, -3, -4][Math.floor(rng() * 7)];
        const b = Math.floor(rng() * 11) - 5;
        const pts = xs.map((x) => ({ x, y: m * x + b }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
        const dy = m * stepX;

        return {
          id: `transfer-tbl-lin-${seed}-${problemIndex}`,
          type: 'table_discrimination',
          family: 'table_discrimination',
          moduleId: 'general',
          inputKind: 'text',
          competencyIds: [
            'exponentials.tables_additive_vs_multiplicative',
            'quadratics.sum_product_factoring',
          ],
          prompt: `Observá los 4 puntos de la tabla: ${tableStr}. Verificando toda la muestra, ¿qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
          expected: 'lineal',
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
        };
      } else if (modeRoll === 1) {
        // Include occasional impostor-like quadratic (1, 2, 4, 7 shifted/scaled) or standard quadratic
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
          return {
            id: `transfer-tbl-quad-imp-${seed}-${problemIndex}`,
            type: 'table_discrimination',
            family: 'table_discrimination',
            moduleId: 'general',
            inputKind: 'text',
            competencyIds: [
              'quadratics.area_model_and_notable_products',
              'exponentials.tables_additive_vs_multiplicative',
            ],
            prompt: `¡Cuidado con las apariencias! Observá los 4 puntos de la tabla: ${tableStr}. Analizando los 4 puntos completos, ¿qué modelo exacto sigue la tabla? Escribí «lineal», «exponencial» o «cuadratica».`,
            expected: 'cuadratica',
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
          };
        }

        const a = [1, 2, 3, -1, -2][Math.floor(rng() * 5)];
        const c = Math.floor(rng() * 7) - 2;
        const pts = [0, 1, 2, 3].map((x) => ({ x, y: a * x * x + c }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
        const delta2Val = 2 * a;

        return {
          id: `transfer-tbl-quad-${seed}-${problemIndex}`,
          type: 'table_discrimination',
          family: 'table_discrimination',
          moduleId: 'general',
          inputKind: 'text',
          competencyIds: [
            'quadratics.sum_product_factoring',
            'exponentials.tables_additive_vs_multiplicative',
          ],
          prompt: `Observá los puntos de la tabla: ${tableStr}. ¿Qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
          expected: 'cuadratica',
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
        };
      } else {
        const base = [2, 3, 4][Math.floor(rng() * 3)];
        const k = [1, 2, 3, 5][Math.floor(rng() * 4)];
        const pts = [0, 1, 2, 3].map((x) => ({ x, y: k * Math.pow(base, x) }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');

        return {
          id: `transfer-tbl-exp-${seed}-${problemIndex}`,
          type: 'table_discrimination',
          family: 'table_discrimination',
          moduleId: 'general',
          inputKind: 'text',
          competencyIds: [
            'exponentials.tables_additive_vs_multiplicative',
            'quadratics.sum_product_factoring',
          ],
          prompt: `Observá los puntos de la tabla: ${tableStr}. ¿Qué modelo describe esta relación? Escribí «lineal», «exponencial» o «cuadratica».`,
          expected: 'exponencial',
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
        };
      }
    }

    case 'model_formula_reconstruction': {
      const modelKind = Math.floor(rng() * 3); // 0: linear, 1: exponential, 2: quadratic
      if (modelKind === 0) {
        const m = [2, 3, 4, 5, -2, -3][Math.floor(rng() * 6)];
        const b = [1, 2, 3, 4, -1, -2, -3][Math.floor(rng() * 7)];
        const pts = [0, 1, 2, 3].map((x) => ({ x, y: m * x + b }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
        const formula = `${m}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;

        return {
          id: `transfer-fit-lin-${seed}-${problemIndex}`,
          type: 'model_formula_reconstruction',
          family: 'model_formula_reconstruction',
          moduleId: 'general',
          inputKind: 'expression',
          competencyIds: [
            'exponentials.tables_additive_vs_multiplicative',
            'quadratics.canonical_form_and_vertex',
          ],
          prompt: `Identificá el invariante de la tabla ${tableStr} (lineal, exponencial o cuadrática) y escribí la expresión algebraica exacta de f(x) que ajusta los datos:`,
          expected: formula,
          hints: [
            `Calculá las primeras diferencias Δy entre puntos consecutivos: ${pts[1].y} − (${pts[0].y}) = ${m} y ${pts[2].y} − (${pts[1].y}) = ${m}.`,
            `Como Δy = ${m} es constante con Δx = 1, es un modelo lineal m·x + b con pendiente m = ${m} y ordenada al origen f(0) = ${b}.`,
            'Armá la expresión lineal multiplicando la pendiente por x y sumando la ordenada inicial f(0).',
          ],
          explanation: `Al tener diferencias constantes Δy = ${m} y valor inicial f(0) = ${b}, el modelo ajustado es lineal: f(x) = ${formula}.`,
          representation: 'tabular',
          stage: 'transfer',
          transferDistance: 'far',
          difficulty: 3,
        };
      } else if (modelKind === 1) {
        const k = [2, 3, 4][Math.floor(rng() * 3)];
        const a = [2, 3][Math.floor(rng() * 2)];
        const pts = [0, 1, 2, 3].map((x) => ({ x, y: k * Math.pow(a, x) }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
        const formula = `${k} * ${a}^x`;

        return {
          id: `transfer-fit-exp-${seed}-${problemIndex}`,
          type: 'model_formula_reconstruction',
          family: 'model_formula_reconstruction',
          moduleId: 'general',
          inputKind: 'expression',
          competencyIds: [
            'exponentials.analytical_reconstruction_two_points',
            'exponentials.tables_additive_vs_multiplicative',
          ],
          prompt: `Identificá el invariante de la tabla ${tableStr} (lineal, exponencial o cuadrática) y escribí la fórmula algebraica exacta de f(x) (ej: 2 * 3^x):`,
          expected: formula,
          hints: [
            `Observá que las diferencias Δy no son constantes, pero los cocientes sucesivos valen ${pts[1].y}/${pts[0].y} = ${a} y ${pts[2].y}/${pts[1].y} = ${a}.`,
            `Es un modelo exponencial k · aˣ con razón multiplicativa constante a = ${a} y valor inicial f(0) = k = ${k}.`,
            'Escribí el producto entre el coeficiente inicial k = f(0) y la potencia de base a elevada a la x.',
          ],
          explanation: `Los cocientes sucesivos son constantes e iguales a ${a} y la ordenada al origen es f(0) = ${k}, por lo que f(x) = ${k} · ${a}ˣ.`,
          representation: 'tabular',
          stage: 'transfer',
          transferDistance: 'far',
          difficulty: 3,
        };
      } else {
        const a = [1, 2, 3][Math.floor(rng() * 3)];
        const c = [1, 2, 3, 4, -1, -2][Math.floor(rng() * 6)];
        const pts = [0, 1, 2, 3].map((x) => ({ x, y: a * x * x + c }));
        const tableStr = pts.map((p) => `(${p.x}; ${p.y})`).join(', ');
        const formula = `${a === 1 ? '' : a}x^2 ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;

        return {
          id: `transfer-fit-quad-${seed}-${problemIndex}`,
          type: 'model_formula_reconstruction',
          family: 'model_formula_reconstruction',
          moduleId: 'general',
          inputKind: 'expression',
          competencyIds: [
            'quadratics.canonical_form_and_vertex',
            'exponentials.tables_additive_vs_multiplicative',
          ],
          prompt: `Identificá el invariante de la tabla ${tableStr} (con vértice sobre el eje Y en x = 0) y escribí la fórmula algebraica exacta de f(x):`,
          expected: formula,
          hints: [
            `Las primeras diferencias son ${pts[1].y - pts[0].y}, ${pts[2].y - pts[1].y}, ${pts[3].y - pts[2].y}, por lo que la segunda diferencia constante es Δ²y = ${2 * a}.`,
            `Recordá que en una cuadrática con Δx = 1 se cumple Δ²y = 2a ⟹ a = ${2 * a}/2 = ${a}, y de (0; ${c}) leés el término independiente c = ${c}.`,
            'Armá el polinomio cuadrático combinando el término ax² con la ordenada al origen c = f(0).',
          ],
          explanation: `Con segundas diferencias constantes Δ²y = ${2 * a} deducimos a = ${a}, y con f(0) = ${c} obtenemos el modelo cuadrático f(x) = ${formula}.`,
          representation: 'tabular',
          stage: 'transfer',
          transferDistance: 'far',
          difficulty: 3,
        };
      }
    }

    case 'geometry_contrast': {
      const k = Math.floor(rng() * 7) + 2;
      const h = Math.floor(rng() * 4) + 1;
      const baseInv = [2, 3][Math.floor(rng() * 2)];
      const subMode = rng() < 0.5 ? 'which_reaches' : 'exp_open_image';

      if (subMode === 'exp_open_image') {
        const ansIv = `(-inf; ${k})`;
        return {
          id: `transfer-geom-iv-${seed}-${problemIndex}`,
          type: 'geometry_contrast',
          family: 'geometry_contrast',
          moduleId: 'general',
          inputKind: 'interval',
          competencyIds: [
            'quadratics.full_analysis_exactas',
            'exponentials.shifts_and_horizontal_asymptote',
          ],
          prompt: `La parábola f(x) = ${k} − (x − ${h})² tiene imagen cerrada Im(f) = (−∞; ${k}] porque alcanza su vértice en x = ${h}. En contraste, ¿cuál es el conjunto imagen Im(g) de la exponencial g(x) = ${k} − (1/${baseInv})ˣ en notación de intervalo Exactas?`,
          expected: ansIv,
          hints: [
            `Analizá el signo del término exponencial: (1/${baseInv})ˣ > 0 para todo x real, nunca llega a valer cero.`,
            `Como a ${k} siempre se le resta una cantidad estrictamente positiva, g(x) queda siempre por debajo de la asíntota horizontal y = ${k} sin tocarla.`,
            `Escribí el intervalo que va desde -inf hasta la cota asintótica ${k} usando paréntesis redondo abierto en ambos extremos y punto y coma como separador.`,
          ],
          explanation: `A diferencia de la parábola que toca su vértice (corchete cerrado), en g(x) = ${k} − (1/${baseInv})ˣ la recta y = ${k} es una asíntota horizontal inalcanzable, por lo que Im(g) = (−∞; ${k}).`,
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          difficulty: 3,
        };
      }

      return {
        id: `transfer-geom-${seed}-${problemIndex}`,
        type: 'geometry_contrast',
        family: 'geometry_contrast',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'quadratics.full_analysis_exactas',
          'exponentials.shifts_and_horizontal_asymptote',
        ],
        prompt: `Compará la parábola f(x) = ${k} − (x − ${h})² y la curva exponencial g(x) = ${k} − (1/${baseInv})ˣ. Ambas tienen cota superior en y = ${k}. ¿Cuál de las dos funciones alcanza efectivamente la altura ${k} en algún punto real? Escribí «f» o «g».`,
        expected: 'f',
        hints: [
          'Evaluá si existe algún número real x donde el término restado se anule por completo.',
          `En la parábola, al evaluar en la abscisa del vértice x = ${h} el cuadrado (${h} − ${h})² se anula; en cambio, ¿puede (1/${baseInv})ˣ valer cero en ℝ?`,
          `Indicá la letra de la función cuyo extremo corresponde a un vértice alcanzable (corchete cerrado) en lugar de una asíntota horizontal.`,
        ],
        explanation: `En x = ${h}, f(${h}) = ${k} − 0 = ${k} (vértice alcanzado, Im(f) = (−∞; ${k}]). En cambio, (1/${baseInv})ˣ > 0 para todo x ∈ ℝ, por lo que y = ${k} es asíntota inalcanzable de g y su imagen es abierta (−∞; ${k}).`,
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 3,
      };
    }

    case 'growth_hierarchy': {
      const mLin = [500, 1000, 2000][Math.floor(rng() * 3)];
      const aQuad = [10, 20, 50][Math.floor(rng() * 3)];
      const baseExp = [2, 3][Math.floor(rng() * 2)];
      return {
        id: `transfer-growth-${seed}-${problemIndex}`,
        type: 'growth_hierarchy',
        family: 'growth_hierarchy',
        moduleId: 'general',
        inputKind: 'text',
        competencyIds: [
          'exponentials.time_models_rates_and_euler_base',
          'quadratics.extremum_optimization',
        ],
        prompt: `A medida que x tiende a +∞, ¿cuál de estas tres funciones supera asintóticamente a las otras dos: f(x) = ${mLin}·x, g(x) = ${aQuad}·x², o h(x) = ${baseExp}ˣ? Escribí «f», «g» o «h».`,
        expected: 'h',
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
      };
    }

    case 'algebraic_signature':
    default: {
      const subSig = rng() < 0.5 ? 'second_diff_a' : 'false_quad_cancel';
      if (subSig === 'false_quad_cancel') {
        const p = [2, 3, 4, 5][Math.floor(rng() * 4)];
        const q = [1, 2, 3][Math.floor(rng() * 3)];
        const m = p + q;
        const b = p * q;
        return {
          id: `transfer-sig-cancel-${seed}-${problemIndex}`,
          type: 'algebraic_signature',
          family: 'algebraic_signature',
          moduleId: 'general',
          inputKind: 'text',
          competencyIds: [
            'quadratics.area_model_and_notable_products',
            'exponentials.tables_additive_vs_multiplicative',
          ],
          prompt: `Al desarrollar y reducir la expresión f(x) = (x + ${p})·(x + ${q}) − x², ¿qué tipo de modelo resulta ser realmente en todo ℝ? Escribí «lineal», «exponencial» o «cuadratica».`,
          expected: 'lineal',
          hints: [
            `Desarrollá primero el producto de binomios (x + ${p})(x + ${q}) = x² + ${m}x + ${b}.`,
            `Al restar el término −x² del final, observá qué ocurre con el término cuadrático: x² + ${m}x + ${b} − x² = ${m}x + ${b}.`,
            'Como el coeficiente de grado 2 se cancela (a = 0) y sobrevive únicamente el término de grado 1 con pendiente constante, indicá el nombre del modelo resultante.',
          ],
          explanation: `Al expandir queda (x² + ${m}x + ${b}) − x² = ${m}x + ${b}. El término cuadrático se cancela (a = 0), por lo que es una falsa cuadrática que define una función lineal de pendiente m = ${m}.`,
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          difficulty: 2,
        };
      }

      const aVal = [2, 3, 4, 5, -2, -3][Math.floor(rng() * 6)];
      const delta2 = 2 * aVal;
      return {
        id: `transfer-sig-${seed}-${problemIndex}`,
        type: 'algebraic_signature',
        family: 'algebraic_signature',
        moduleId: 'general',
        inputKind: 'number',
        competencyIds: [
          'quadratics.canonical_form_and_vertex',
          'exponentials.tables_additive_vs_multiplicative',
        ],
        prompt: `En una tabla con paso uniforme Δx = 1, se verifica que la segunda diferencia es constante e igual a Δ²y = ${delta2}. ¿Cuál es el coeficiente principal «a» de la función cuadrática f(x) = ax² + bx + c asociada?`,
        expected: String(aVal),
        hints: [
          'Recordá la identidad analítica que vincula la segunda diferencia constante con el coeficiente principal de la parábola cuando Δx = 1.',
          `Para cualquier cuadrática f(x) = ax² + bx + c con paso Δx = 1, la primera diferencia es Δy = 2ax + a + b y la segunda diferencia es exactamente Δ²y = 2a.`,
          `Despejá el coeficiente principal «a» dividiendo el valor dado de la segunda diferencia constante Δ²y por 2.`,
        ],
        explanation: `Para paso unitario Δx = 1, toda parábola verifica Δ²y = 2a. Como Δ²y = ${delta2}, resulta a = ${delta2} / 2 = ${aVal}.`,
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'far',
        difficulty: 2,
      };
    }
  }
}

/**
 * Emits and records a normalized transfer learning event to the ProgressStore.
 *
 * @param {object} params
 * @param {string} [params.moduleId='general']
 * @param {string} params.exerciseId
 * @param {string[]} params.competencyIds
 * @param {boolean} params.correct
 * @param {number} [params.hintsUsed=0]
 * @param {boolean} [params.solutionRevealed=false]
 * @param {string|null} [params.diagnosticId=null]
 * @param {string} [params.representation='symbolic']
 * @param {object} [params.store]
 * @returns {object} The created LearningEvent
 */
export function recordTransferAttempt({
  moduleId = 'general',
  exerciseId,
  competencyIds = ['exponentials.tables_additive_vs_multiplicative', 'quadratics.sum_product_factoring'],
  correct = false,
  hintsUsed = 0,
  solutionRevealed = false,
  diagnosticId = null,
  representation = 'symbolic',
  store = null,
} = {}) {
  const event = createLearningEvent({
    type: 'answer_submitted',
    moduleId,
    exerciseId,
    competencyIds,
    correct,
    assistance: solutionRevealed ? 'solution_revealed' : (hintsUsed > 0 ? 'hints' : 'none'),
    hintsUsed,
    solutionRevealed,
    diagnosticId,
    representation,
    stage: 'transfer',
    transferDistance: 'far',
  });

  const progressStore = store || getProgressStore();
  progressStore.recordLearningEvent(event);
  return event;
}
