/**
 * @file js/modules/funciones-trigonometricas/logic.js
 * Lógica matemática pura (sin DOM, sin eval, sin emojis) para Unidad 11 · Funciones Trigonométricas:
 * - Reutiliza js/core/math/trigonometry.js (exactitud en radicales y múltiplos de π)
 * - analyzeTrigFunction (6 funciones canónicas con dominios/imágenes/períodos diferenciados + ampliación sinusoidal)
 * - cartesianSixRatios (definición cartesiana abs, ord, r.v.)
 * - verifyTrigIdentity (verificador y detector de contraejemplos sin eval)
 * - diagnoseTrigFunctions (10 códigos cognitivos normalizados con cero falsos positivos)
 * - validateTrigFunctionsAttempt (validador unificado para cheques y retos)
 */

import {
  TRIG_FUNCTIONS_SPEC,
  QUADRANT_SIGNS,
  SPECIAL_ANGLES_Q1,
  evalTrig,
  asymptotesInRange,
  simplifySquareRoot,
  exactRadicalFromRatSqrt,
  exactTrigAtSpecialAngle,
  exactTrigFromGiven,
  classifyQuadrant,
  reduceToFirstQuadrant,
  solveElementaryTrigEq,
  solveQuadraticTrigEq,
  degToRad,
  radToDeg,
  arcLength,
  solveArcDimension,
} from '../../core/math/trigonometry.js';
import {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  EMPTY_SET_CHAR,
  rat,
  parseRational,
  ratEq,
  ratToNumber,
  fmtNumberEsAR,
  parseNumberOrFraction,
  hasRadicalInDenominator,
  equivalentNumber,
  equivalentRadicalOrNumber,
  parseAngleAnswer,
  equivalentAngle,
  parseCongruenceClassToken,
  parseCongruenceUnion,
  equivalentCongruenceUnion,
  equivalentSetExactas,
  parseTrigExpr,
  evalTrigExpr,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  formatPiRat,
  principalRepPi,
  principalRepDeg,
  principalRepDegRat,
  areCongruent,
  formatCongruenceClass,
  parseExactRadical,
  exactRadical,
  exactRadicalEq,
  fmtExactRadical,
  normalizeTrigFnName,
} from './expr.js';

export {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  EMPTY_SET_CHAR,
  TRIG_FUNCTIONS_SPEC,
  QUADRANT_SIGNS,
  SPECIAL_ANGLES_Q1,
  evalTrig,
  asymptotesInRange,
  simplifySquareRoot,
  exactRadicalFromRatSqrt,
  exactTrigAtSpecialAngle,
  exactTrigFromGiven,
  classifyQuadrant,
  reduceToFirstQuadrant,
  solveElementaryTrigEq,
  solveQuadraticTrigEq,
  degToRad,
  radToDeg,
  arcLength,
  solveArcDimension,
  rat,
  parseRational,
  ratEq,
  ratToNumber,
  fmtNumberEsAR,
  parseNumberOrFraction,
  hasRadicalInDenominator,
  equivalentNumber,
  equivalentRadicalOrNumber,
  parseAngleAnswer,
  equivalentAngle,
  parseCongruenceClassToken,
  parseCongruenceUnion,
  equivalentCongruenceUnion,
  equivalentSetExactas,
  parseTrigExpr,
  evalTrigExpr,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  formatPiRat,
  principalRepPi,
  principalRepDeg,
  principalRepDegRat,
  areCongruent,
  formatCongruenceClass,
  parseExactRadical,
  exactRadical,
  exactRadicalEq,
  fmtExactRadical,
  normalizeTrigFnName,
};

/* ============================================================================
 * 1. Cartesian Definition (abs, ord, r.v.) & Analysis of the 6 Functions
 * ========================================================================== */

/**
 * Computes r.v. = sqrt(abs^2 + ord^2) and exact/approximate 6 trig ratios for Cartesian point P(abs; ord).
 */
export function cartesianSixRatios({ abs, ord }) {
  const x = Number(abs);
  const y = Number(ord);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new TypeError('Las coordenadas (abs; ord) deben ser finitas.');
  }
  const rSq = x * x + y * y;
  if (rSq < 1e-15) {
    throw new RangeError('El origen (0; 0) tiene radio vector nulo y no define ángulo.');
  }
  const r = Math.sqrt(rSq);
  const angleRadRaw = Math.atan2(y, x);
  const angleRad = angleRadRaw < 0 ? angleRadRaw + 2 * Math.PI : angleRadRaw;
  const angleDeg = (angleRad * 180) / Math.PI;
  const cls = classifyQuadrant(angleRad);

  let exact = null;
  if (Number.isInteger(x) && Number.isInteger(y)) {
    const rSqInt = x * x + y * y;
    const { outside, inside } = simplifySquareRoot(rSqInt);
    const makeRatio = (num, den) => {
      if (den === 0) return { defined: false, value: null, formatted: '\u2204' };
      if (num === 0) return { defined: true, value: 0, formatted: '0' };
      const er = exactRadical(rat(num, den), 1);
      return { defined: true, value: er.num, exact: er, formatted: er.formatted };
    };
    const makeWithR = (num, signR = 1) => {
      // num / (outside * sqrt(inside)) = num * sqrt(inside) / (outside * inside)
      if (num === 0) return { defined: true, value: 0, formatted: '0' };
      const er = exactRadical(rat(num * signR, outside * inside), inside);
      return { defined: true, value: er.num, exact: er, formatted: er.formatted };
    };
    const makeRDiv = (den) => {
      if (den === 0) return { defined: false, value: null, formatted: '\u2204' };
      const er = exactRadical(rat(outside, den), inside);
      return { defined: true, value: er.num, exact: er, formatted: er.formatted };
    };
    exact = {
      rv: exactRadical(outside, inside),
      sin: makeWithR(y),
      cos: makeWithR(x),
      tan: makeRatio(y, x),
      csc: makeRDiv(y),
      sec: makeRDiv(x),
      cot: makeRatio(x, y),
    };
  }

  return Object.freeze({
    abs: x,
    ord: y,
    rv: r,
    angleRad,
    angleDeg,
    quadrant: cls.quadrant,
    axis: cls.axis,
    sin: y / r,
    cos: x / r,
    tan: Math.abs(x) < 1e-12 ? NaN : y / x,
    csc: Math.abs(y) < 1e-12 ? NaN : r / y,
    sec: Math.abs(x) < 1e-12 ? NaN : r / x,
    cot: Math.abs(y) < 1e-12 ? NaN : x / y,
    exact,
  });
}

/**
 * Analyzes any of the 6 canonical trig functions (or sinusoidal extension A·fn(Bx - C) + D).
 */
export function analyzeTrigFunction(fnName, { A = 1, B = 1, C = 0, D = 0 } = {}) {
  const fn = normalizeTrigFnName(fnName);
  const spec = TRIG_FUNCTIONS_SPEC[fn];
  const isCanonical =
    Math.abs(A - 1) < 1e-12 &&
    Math.abs(B - 1) < 1e-12 &&
    Math.abs(C) < 1e-12 &&
    Math.abs(D) < 1e-12;

  if (isCanonical) {
    return Object.freeze({
      ...spec,
      isCanonical: true,
      isExtension: false,
      amplitude: fn === 'sin' || fn === 'cos' ? 1 : null,
      periodRad: spec.periodPi * Math.PI,
      evalAt: (x) => evalTrig(fn, x),
      asymptotes: (xMin, xMax) => asymptotesInRange(fn, xMin, xMax),
    });
  }

  if (Math.abs(B) < 1e-12 || Math.abs(A) < 1e-12) {
    throw new RangeError('En A·fn(Bx − C) + D los parámetros A y B deben ser no nulos.');
  }

  const periodRad = (spec.periodPi * Math.PI) / Math.abs(B);
  const phaseShift = C / B;
  const amp = Math.abs(A);

  let imageText = spec.imageText;
  if (fn === 'sin' || fn === 'cos') {
    const lo = D - amp;
    const hi = D + amp;
    imageText = `[${fmtNumberEsAR(lo, 2)}; ${fmtNumberEsAR(hi, 2)}]`;
  } else if (fn === 'csc' || fn === 'sec') {
    imageText = `(${MINUS_CHAR}∞; ${fmtNumberEsAR(D - amp, 2)}] ∪ [${fmtNumberEsAR(D + amp, 2)}; +∞)`;
  }

  return Object.freeze({
    ...spec,
    isCanonical: false,
    isExtension: true,
    A,
    B,
    C,
    D,
    amplitude: fn === 'sin' || fn === 'cos' ? amp : null,
    periodRad,
    phaseShift,
    imageText,
    evalAt: (x) => A * evalTrig(fn, B * x - C) + D,
    asymptotes: (xMin, xMax) => {
      const uMin = Math.min(B * xMin - C, B * xMax - C);
      const uMax = Math.max(B * xMin - C, B * xMax - C);
      return asymptotesInRange(fn, uMin, uMax)
        .map((u) => (u + C) / B)
        .filter((x) => x >= xMin - 1e-9 && x <= xMax + 1e-9)
        .sort((p, q) => p - q);
    },
  });
}

/* ============================================================================
 * 2. Identity Verifier (AST-based, zero eval)
 * ========================================================================== */

const IDENTITY_PROBES = [
  0.19, 0.37, 0.61, 0.89, 1.17, 1.41, 1.83, 2.11, 2.47, 2.81,
  3.37, 3.71, 4.09, 4.43, 4.91, 5.27, 5.63, 5.99,
];

/**
 * Verifies whether lhsExpr === rhsExpr across non-pole angles in (0, 2π).
 */
export function verifyTrigIdentity(lhsStr, rhsStr, { tol = 1e-7 } = {}) {
  const lhsAst = typeof lhsStr === 'string' ? parseTrigExpr(lhsStr) : lhsStr;
  const rhsAst = typeof rhsStr === 'string' ? parseTrigExpr(rhsStr) : rhsStr;

  let maxDiff = 0;
  let checkedPoints = 0;

  for (const x of IDENTITY_PROBES) {
    const lv = evalTrigExpr(lhsAst, x);
    const rv = evalTrigExpr(rhsAst, x);
    if (!Number.isFinite(lv) && !Number.isFinite(rv)) continue;
    if (!Number.isFinite(lv) || !Number.isFinite(rv)) {
      return Object.freeze({
        valid: false,
        checkedPoints,
        maxDiff: Infinity,
        counterexample: { x, lhsVal: lv, rhsVal: rv },
      });
    }
    checkedPoints += 1;
    const diff = Math.abs(lv - rv);
    if (diff > maxDiff) maxDiff = diff;
    if (diff > tol) {
      return Object.freeze({
        valid: false,
        checkedPoints,
        maxDiff,
        counterexample: { x, lhsVal: lv, rhsVal: rv },
      });
    }
  }

  return Object.freeze({
    valid: checkedPoints >= 8,
    checkedPoints,
    maxDiff,
    counterexample: null,
  });
}

/* ============================================================================
 * 3. Normalized Cognitive Diagnostics (10 IDs, zero false positives)
 * ========================================================================== */

export const DIAGNOSTIC_DEFINITIONS = Object.freeze({
  negative_angle_not_reduced_to_principal: {
    id: 'negative_angle_not_reduced_to_principal',
    pose: 'sospecha',
    tag: 'Representante fuera de [0; 2π)',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
    shortLabel: 'Representante negativo o ≥ 2π en clase C_α',
    message:
      'El ángulo que pusiste es congruente, pero no es el representante principal en [0; 2π) (o [0°; 360°)). Sumá o restá vueltas completas de 2π (o 360°) hasta caer en el primer giro positivo.',
  },
  swapped_abs_ord_in_cartesian_def: {
    id: 'swapped_abs_ord_in_cartesian_def',
    pose: 'pensativa',
    tag: 'Abscisa vs Ordenada',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
    shortLabel: 'Intercambio entre abs (cos) y ord (sen)',
    message:
      'Ojo con las coordenadas cartesianas: sen α = ord / r.v. (usa la coordenada vertical Y) y cos α = abs / r.v. (usa la coordenada horizontal X), nunca al revés ni sin dividir por el radio vector.',
  },
  assumed_identical_domain_for_all_six_trig: {
    id: 'assumed_identical_domain_for_all_six_trig',
    pose: 'lentes-brillo',
    tag: 'Dominios distintos',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Asumió el mismo dominio para tg/cotg/sec/cosec',
    message:
      '¡Trampa de parcial! No todas las trigonométricas tienen el mismo dominio: tg x y sec x excluyen donde cos x = 0 (C_{π/2} ∪ C_{3π/2}), mientras cotg x y cosec x excluyen donde sen x = 0 (C₀ ∪ C_π).',
  },
  confused_tan_period_2pi_with_pi: {
    id: 'confused_tan_period_2pi_with_pi',
    pose: 'unamused',
    tag: 'Período π vs 2π',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Confusión entre período π y período 2π',
    message:
      'Frená el carro: sen x, cos x, sec x y cosec x tienen período 2π, pero tg x y cotg x repiten exactamente sus ramas cada π radianes.',
  },
  accepted_sin_cos_outside_unit_interval: {
    id: 'accepted_sin_cos_outside_unit_interval',
    pose: 'panico',
    tag: '¡Fuera de imagen!',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
    shortLabel: 'Violó Im(sen)=Im(cos)=[−1; 1] o Im(sec/cosec)',
    message:
      '¡Alerta de imagen! Tanto sen x como cos x están encerrados en [−1; 1] para todo x real; jamás pueden valer 1,5 ni 7/2. A la inversa, sec x y cosec x viven en (−∞; −1] ∪ [1; +∞).',
  },
  ignored_quadrant_sign_in_pythagorean: {
    id: 'ignored_quadrant_sign_in_pythagorean',
    pose: 'enojada',
    tag: 'Signo del cuadrante',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Tomó raíz positiva sin mirar el cuadrante',
    message:
      'Al despejar cos α = ±√(1 − sen² α), la raíz trae dos signos posibles (±). Tenés que mirar en qué cuadrante vive α para elegir el signo correcto (en II y III el coseno es negativo).',
  },
  forgot_rationalization_or_reciprocal: {
    id: 'forgot_rationalization_or_reciprocal',
    pose: 'evaluando',
    tag: 'Recíproca o racionalización',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Recíproca invertida o radical sin racionalizar',
    message:
      'Revisá dos detalles finos: sec α = 1 / cos α (empieza con S, va con C) y cosec α = 1 / sen α (empieza con C, va con S). Además, si queda una raíz en el denominador, racionalizala.',
  },
  wrong_quadrant_reduction_formula: {
    id: 'wrong_quadrant_reduction_formula',
    pose: 'sospecha',
    tag: 'Reducción al I cuadrante',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
    shortLabel: 'Fórmula de reducción al I cuadrante errónea',
    message:
      'Chequeá el ángulo de referencia al reducir al I cuadrante: en II es π − α (180° − α), en III es α − π (α − 180°) y en IV es 2π − α (360° − α), conservando el signo del cuadrante original.',
  },
  missed_second_quadrant_solution_branch: {
    id: 'missed_second_quadrant_solution_branch',
    pose: 'colapso',
    tag: 'Falta una rama',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
    shortLabel: 'Omitió segunda rama en [0; 2π) o signo ±',
    message:
      'La calculadora te devuelve un solo ángulo, pero dentro de un giro [0; 2π) suele haber dos ángulos con el mismo seno o coseno (y hasta 4 si despejaste ± de un cuadrado). Revisá los otros cuadrantes.',
  },
  accepted_pole_root_in_trig_equation: {
    id: 'accepted_pole_root_in_trig_equation',
    pose: 'panico',
    tag: '¡Raíz en un polo!',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
    shortLabel: 'Aceptó una raíz excluida del dominio',
    message:
      '¡Cuidado con el denominador! Esa candidata anula cos x o sen x y hace explotar tg, sec, cosec o cotg (o divide por cero en la ecuación original). Tenés que tacharla de la solución.',
  },
});

function isAlreadyExpected(raw, context = {}) {
  if (context.expected === undefined || context.expected === null) return false;
  const kind = context.kind || 'text';
  try {
    if (kind === 'congruence_union' || kind === 'congruence_class') {
      return equivalentCongruenceUnion(raw, context.expected, {
        requirePrincipal: context.requirePrincipal !== false,
      }).equivalent;
    }
    if (kind === 'angle') {
      return equivalentAngle(raw, context.expected, {
        tolDeg: context.tolDeg ?? 0.05,
        tolRad: context.tolRad ?? 1e-3,
        requireExactPi: Boolean(context.requireExactPi),
        defaultSystem: context.defaultSystem || 'rad',
      }).equivalent;
    }
    if (kind === 'radical') {
      if (context.requireRationalized && hasRadicalInDenominator(String(raw))) return false;
      return equivalentRadicalOrNumber(raw, context.expected, context.tol ?? 1e-4);
    }
    if (kind === 'number') {
      return equivalentNumber(raw, context.expected, context.tol ?? 1e-3);
    }
    if (kind === 'set' || kind === 'interval' || kind === 'set_or_interval' || kind === 'solution_set') {
      return equivalentSetExactas(raw, context.expected, context.tol ?? 1e-4);
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Pure cognitive diagnostic detector for Unit 11.
 * Returns null if input already matches expected (zero false positives) or if no specific error signature applies.
 */
export function diagnoseTrigFunctions(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  // Guard: never emit false positives on valid expected answers
  if (isAlreadyExpected(raw, context)) return null;

  // 1. Unreduced congruence class representative (negative or >= 2π/360°)
  if (
    context.kind === 'congruence_union' ||
    context.kind === 'congruence_class' ||
    context.target === 'congruence' ||
    /^C[_(]/i.test(raw)
  ) {
    try {
      const parsed = parseCongruenceUnion(raw);
      if (!parsed.empty && parsed.hasUnreduced) {
        return DIAGNOSTIC_DEFINITIONS.negative_angle_not_reduced_to_principal;
      }
      if (context.expected) {
        const cmp = equivalentCongruenceUnion(raw, context.expected, { requirePrincipal: true });
        if (cmp.hasUnreducedRepresentative) {
          return DIAGNOSTIC_DEFINITIONS.negative_angle_not_reduced_to_principal;
        }
      }
    } catch {}
  }

  // Negative angle when principal [0; 2π) or [0°; 360°) expected
  if (context.target === 'principal_rep' || (context.kind === 'angle' && context.requirePrincipal)) {
    try {
      const ang = parseAngleAnswer(raw, { defaultSystem: context.defaultSystem || 'rad' });
      const val = context.defaultSystem === 'deg' ? ang.deg : ang.rad;
      const limit = context.defaultSystem === 'deg' ? 360 : 2 * Math.PI;
      if (val < -1e-9 || val >= limit - 1e-9) {
        if (context.expected && areCongruent(raw, context.expected).congruent) {
          return DIAGNOSTIC_DEFINITIONS.negative_angle_not_reduced_to_principal;
        }
      }
    } catch {}
  }

  // 2. Accepted pole root in trig equation (check BEFORE missing branch!)
  if (Array.isArray(context.poleValues) && context.poleValues.length > 0) {
    try {
      let userNums = [];
      if (raw.includes('C_') || raw.includes('C{') || /^C/i.test(raw)) {
        const cu = parseCongruenceUnion(raw);
        userNums = cu.classes.map((c) => c.principalRad);
      } else if (raw.startsWith('{') && raw.endsWith('}')) {
        const inner = raw.slice(1, -1).trim();
        if (inner) userNums = inner.split(';').map((t) => parseNumberOrFraction(t));
      } else {
        userNums = [parseNumberOrFraction(raw)];
      }
      for (const pVal of context.poleValues) {
        const pRad = typeof pVal === 'number' ? pVal : parseNumberOrFraction(pVal);
        if (userNums.some((u) => Math.abs(((u - pRad + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) < 1e-3)) {
          return DIAGNOSTIC_DEFINITIONS.accepted_pole_root_in_trig_equation;
        }
      }
    } catch {}
  }

  // 3. Missed second quadrant branch or ± branch in periodic equations
  if (
    (context.kind === 'congruence_union' || context.kind === 'solution_set' || context.target === 'trig_equation') &&
    context.expected
  ) {
    try {
      if (context.kind === 'congruence_union') {
        const u = parseCongruenceUnion(raw);
        const e = parseCongruenceUnion(context.expected);
        if (!u.empty && !e.empty && u.classes.length < e.classes.length) {
          const allSubset = u.classes.every((uc) =>
            e.classes.some((ec) => Math.abs(uc.principalRad - ec.principalRad) < 1e-3)
          );
          if (allSubset) {
            return DIAGNOSTIC_DEFINITIONS.missed_second_quadrant_solution_branch;
          }
        }
      } else {
        const uClean = raw.replace(/[{}]/g, '').trim();
        const eClean = String(context.expected).replace(/[{}]/g, '').trim();
        const uItems = uClean ? uClean.split(';').map((x) => parseNumberOrFraction(x)) : [];
        const eItems = eClean ? eClean.split(';').map((x) => parseNumberOrFraction(x)) : [];
        if (uItems.length > 0 && uItems.length < eItems.length) {
          const subset = uItems.every((uv) => eItems.some((ev) => Math.abs(uv - ev) < 1e-3));
          if (subset) {
            return DIAGNOSTIC_DEFINITIONS.missed_second_quadrant_solution_branch;
          }
        }
      }
    } catch {}
  }

  // 4. Assumed identical domain for all 6 trig functions
  if (context.target === 'domain_six_functions' || context.fnName) {
    try {
      if (context.fnName && ['tan', 'tg', 'sec'].includes(context.fnName.toLowerCase())) {
        // Check if student gave sin_zero domain (kπ) or ℝ
        if (
          equivalentSetExactas(raw, 'ℝ − (C_0 ∪ C_π)') ||
          equivalentSetExactas(raw, 'ℝ')
        ) {
          return DIAGNOSTIC_DEFINITIONS.assumed_identical_domain_for_all_six_trig;
        }
      }
      if (context.fnName && ['cot', 'cotg', 'csc', 'cosec'].includes(context.fnName.toLowerCase())) {
        if (
          equivalentSetExactas(raw, 'ℝ − (C_{π/2} ∪ C_{3π/2})') ||
          equivalentSetExactas(raw, 'ℝ')
        ) {
          return DIAGNOSTIC_DEFINITIONS.assumed_identical_domain_for_all_six_trig;
        }
      }
    } catch {}
    if (/mismo dominio|todos los reales|todas tienen dominio/i.test(raw)) {
      return DIAGNOSTIC_DEFINITIONS.assumed_identical_domain_for_all_six_trig;
    }
  }

  // 5. Confused tan/cot period π with 2π (or sin/cos/sec/csc 2π with π)
  if (context.target === 'period') {
    try {
      const val = parseNumberOrFraction(raw);
      if (context.expected && Math.abs(Number(parseNumberOrFraction(context.expected)) - Math.PI) < 1e-3 && Math.abs(val - 2 * Math.PI) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.confused_tan_period_2pi_with_pi;
      }
      if (context.expected && Math.abs(Number(parseNumberOrFraction(context.expected)) - 2 * Math.PI) < 1e-3 && Math.abs(val - Math.PI) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.confused_tan_period_2pi_with_pi;
      }
    } catch {}
  }

  // 6. Accepted sin/cos outside [-1; 1] or sec/csc inside (-1; 1)
  if (context.target === 'range_check' || context.checkUnitInterval) {
    try {
      const val = parseNumberOrFraction(raw);
      if (context.fn === 'sin' || context.fn === 'cos') {
        if (Math.abs(val) > 1 + 1e-6) {
          return DIAGNOSTIC_DEFINITIONS.accepted_sin_cos_outside_unit_interval;
        }
      }
    } catch {}
  }

  // 7. Numeric/radical checks: swapped abs/ord, ignored quadrant sign, reciprocal/rationalization, wrong reduction
  try {
    const val = parseNumberOrFraction(raw);

    // Ignored quadrant sign (opposite sign of expected)
    if (context.expected !== undefined && (context.target === 'pythagorean_quadrant' || context.checkSignFlip)) {
      const expNum = parseNumberOrFraction(context.expected);
      if (Math.abs(expNum) > 1e-6 && Math.abs(val + expNum) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.ignored_quadrant_sign_in_pythagorean;
      }
    }

    // Swapped abs/ord in Cartesian definition
    if (context.swappedAbsOrdValue !== undefined) {
      const sw = parseNumberOrFraction(context.swappedAbsOrdValue);
      if (Math.abs(val - sw) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.swapped_abs_ord_in_cartesian_def;
      }
    }

    // Wrong reciprocal (e.g. 1/sin instead of 1/cos)
    if (context.wrongReciprocalValue !== undefined) {
      const wr = parseNumberOrFraction(context.wrongReciprocalValue);
      if (Math.abs(val - wr) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.forgot_rationalization_or_reciprocal;
      }
    }

    // Unrationalized radical in denominator when rationalized form required
    if (context.requireRationalized && hasRadicalInDenominator(raw)) {
      return DIAGNOSTIC_DEFINITIONS.forgot_rationalization_or_reciprocal;
    }

    // Wrong quadrant reduction formula (e.g. wrong sign or wrong ref angle)
    if (context.wrongReductionValue !== undefined) {
      const wrv = parseNumberOrFraction(context.wrongReductionValue);
      if (Math.abs(val - wrv) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.wrong_quadrant_reduction_formula;
      }
    }
    if (context.target === 'reduction' && context.expected !== undefined) {
      const expNum = parseNumberOrFraction(context.expected);
      if (Math.abs(expNum) > 1e-6 && Math.abs(val + expNum) < 1e-3) {
        return DIAGNOSTIC_DEFINITIONS.wrong_quadrant_reduction_formula;
      }
    }
  } catch {}

  return null;
}

/* ============================================================================
 * 4. Unified Attempt Validator (for CheckBlocks & Retos)
 * ========================================================================== */

export function validateTrigFunctionsAttempt({
  kind = 'number',
  input,
  expected,
  tol = 1e-3,
  tolDeg = 0.05,
  tolRad = 1e-3,
  requireExactPi = false,
  requirePrincipal = true,
  requireRationalized = false,
  defaultSystem = 'rad',
  diagContext = {},
} = {}) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return {
      ok: false,
      empty: true,
      syntaxError: null,
      needsExactPi: false,
      needsPrincipalRep: false,
      needsRationalized: false,
      diagnostic: null,
    };
  }

  const enrichedContext = {
    ...diagContext,
    kind,
    expected,
    tol,
    tolDeg,
    tolRad,
    requireExactPi,
    requirePrincipal,
    requireRationalized,
    defaultSystem,
  };

  if (kind === 'congruence_union' || kind === 'congruence_class') {
    const res = equivalentCongruenceUnion(raw, expected, { requirePrincipal });
    if (res.parseError) {
      return {
        ok: false,
        empty: false,
        syntaxError: 'Usá la notación de clases de congruencia, por ejemplo C_{π/3} ∪ C_{2π/3} o ∅.',
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    if (res.equivalent) {
      return {
        ok: true,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    if (res.congruentMatch && res.hasUnreducedRepresentative) {
      return {
        ok: false,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: true,
        needsRationalized: false,
        diagnostic: DIAGNOSTIC_DEFINITIONS.negative_angle_not_reduced_to_principal,
      };
    }
    return {
      ok: false,
      empty: false,
      syntaxError: null,
      needsExactPi: false,
      needsPrincipalRep: false,
      needsRationalized: false,
      diagnostic: diagnoseTrigFunctions(raw, enrichedContext),
    };
  }

  if (kind === 'angle') {
    const res = equivalentAngle(raw, expected, {
      tolDeg,
      tolRad,
      requireExactPi,
      defaultSystem,
    });
    if (res.equivalent) {
      if (requirePrincipal) {
        try {
          const val = defaultSystem === 'deg' ? res.user.deg : res.user.rad;
          const limit = defaultSystem === 'deg' ? 360 : 2 * Math.PI;
          if (val < -1e-9 || val >= limit - 1e-9) {
            return {
              ok: false,
              empty: false,
              syntaxError: null,
              needsExactPi: false,
              needsPrincipalRep: true,
              needsRationalized: false,
              diagnostic: DIAGNOSTIC_DEFINITIONS.negative_angle_not_reduced_to_principal,
            };
          }
        } catch {}
      }
      return {
        ok: true,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    if (requireExactPi && res.approxMatch) {
      return {
        ok: false,
        empty: false,
        syntaxError: null,
        needsExactPi: true,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    if (!res.user) {
      return {
        ok: false,
        empty: false,
        syntaxError: 'Formato angular inválido. Usá grados (220°), múltiplos de π (5π/3) o radianes.',
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    return {
      ok: false,
      empty: false,
      syntaxError: null,
      needsExactPi: false,
      needsPrincipalRep: false,
      needsRationalized: false,
      diagnostic: diagnoseTrigFunctions(raw, enrichedContext),
    };
  }

  if (kind === 'set' || kind === 'interval' || kind === 'set_or_interval' || kind === 'solution_set') {
    try {
      const ok = equivalentSetExactas(raw, expected, tol);
      return {
        ok,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: ok ? null : diagnoseTrigFunctions(raw, enrichedContext),
      };
    } catch (err) {
      return {
        ok: false,
        empty: false,
        syntaxError: err.message || 'Formato de conjunto o intervalo inválido. Usá ";" como separador.',
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
  }

  if (kind === 'radical') {
    try {
      parseNumberOrFraction(raw);
    } catch {
      return {
        ok: false,
        empty: false,
        syntaxError: 'Formato inválido. Podés escribir fracciones o radicales como −4√7/7 o −4*sqrt(7)/7.',
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
    const matchesVal = equivalentRadicalOrNumber(raw, expected, tol);
    if (matchesVal && requireRationalized && hasRadicalInDenominator(raw)) {
      return {
        ok: false,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: true,
        diagnostic: DIAGNOSTIC_DEFINITIONS.forgot_rationalization_or_reciprocal,
      };
    }
    return {
      ok: matchesVal,
      empty: false,
      syntaxError: null,
      needsExactPi: false,
      needsPrincipalRep: false,
      needsRationalized: false,
      diagnostic: matchesVal ? null : diagnoseTrigFunctions(raw, enrichedContext),
    };
  }

  if (kind === 'expression') {
    try {
      const res = verifyTrigIdentity(raw, expected);
      return {
        ok: res.valid,
        empty: false,
        syntaxError: null,
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: res.valid ? null : diagnoseTrigFunctions(raw, enrichedContext),
      };
    } catch (err) {
      return {
        ok: false,
        empty: false,
        syntaxError: err.message || 'Expresión trigonométrica no reconocida.',
        needsExactPi: false,
        needsPrincipalRep: false,
        needsRationalized: false,
        diagnostic: null,
      };
    }
  }

  // Default: number / fraction
  try {
    parseNumberOrFraction(raw);
  } catch {
    return {
      ok: false,
      empty: false,
      syntaxError: 'Formato numérico inválido. Usá enteros, fracciones (3/4), radicales o múltiplos de π.',
      needsExactPi: false,
      needsPrincipalRep: false,
      needsRationalized: false,
      diagnostic: null,
    };
  }

  const ok = equivalentNumber(raw, expected, tol);
  return {
    ok,
    empty: false,
    syntaxError: null,
    needsExactPi: false,
    needsPrincipalRep: false,
    needsRationalized: false,
    diagnostic: ok ? null : diagnoseTrigFunctions(raw, enrichedContext),
  };
}
