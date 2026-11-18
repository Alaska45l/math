/**
 * @file js/modules/funciones/logic.js
 * Pure mathematical evaluators & cognitive diagnostic engine for Funciones (Unidad 02).
 * Zero DOM access. Zero eval(). Zero new Function(). Zero Unicode emojis.
 */

import {
  equivalentIntervalSet,
  parseIntervalSet,
  parseNumberToken,
  sameIntervalSet,
} from '../circuitos/logic.js';

/* ------------------------------------------------------------------ */
/* Curva C¹ por tramos (Hermite cúbico para Radiografía Cartesiana)   */
/* ------------------------------------------------------------------ */
export const KNOTS = Object.freeze([
  [-4, 2.5, -2],
  [-3, 0, -3.5],
  [-1.8, -3, 0],
  [0, 0, 2.5],
  [2, 4, 0],
  [4, 0, -3.5],
  [5, -5, -6],
]);

function segmentOf(x) {
  for (let i = 0; i < KNOTS.length - 1; i++) {
    if (x <= KNOTS[i + 1][0]) return i;
  }
  return KNOTS.length - 2;
}

export function evalWave(x) {
  const i = segmentOf(x);
  const [xa, ya, ma] = KNOTS[i];
  const [xb, yb, mb] = KNOTS[i + 1];
  const d = xb - xa;
  const t = (x - xa) / d;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * ya +
    (t3 - 2 * t2 + t) * d * ma +
    (-2 * t3 + 3 * t2) * yb +
    (t3 - t2) * d * mb
  );
}

export function slopeWave(x) {
  const i = segmentOf(x);
  const [xa, ya, ma] = KNOTS[i];
  const [xb, yb, mb] = KNOTS[i + 1];
  const d = xb - xa;
  const t = (x - xa) / d;
  const t2 = t * t;
  return (
    ((6 * t2 - 6 * t) * ya +
      (3 * t2 - 4 * t + 1) * d * ma +
      (-6 * t2 + 6 * t) * yb +
      (3 * t2 - 2 * t) * d * mb) /
    d
  );
}

/* ------------------------------------------------------------------ */
/* Evaluador puro de los 6 casos del Escáner de Unicidad              */
/* ------------------------------------------------------------------ */
const pieceA = (x) => 0.25 * x * x - 1;
const pieceB = (x) => 0.5 * x + 1;

export function evalScannerCase(caseId, x) {
  switch (caseId) {
    case 'salto': {
      if (x < -3 || x > 4) return { pts: [], isFunction: true, validAtX: false };
      if (x < 1) return { pts: [pieceA(x)], isFunction: true, validAtX: true };
      if (x === 1) return { pts: [pieceB(1)], holeY: pieceA(1), isFunction: true, validAtX: true };
      return { pts: [pieceB(x)], isFunction: true, validAtX: true };
    }
    case 'parabola_h': {
      if (x < -2) return { pts: [], isFunction: false, validAtX: false };
      if (x === -2) return { pts: [0], isFunction: false, validAtX: true };
      const r = Math.sqrt(x + 2);
      return { pts: [r, -r], isFunction: false, validAtX: true };
    }
    case 'circle': {
      if (x < 1 || x > 3) return { pts: [], isFunction: false, validAtX: false };
      const dy = Math.sqrt(Math.max(0, 1 - (x - 2) ** 2));
      if (dy < 1e-9) return { pts: [2], isFunction: false, validAtX: true };
      return { pts: [2 + dy, 2 - dy], isFunction: false, validAtX: true };
    }
    case 'abs': {
      return { pts: [Math.abs(x) - 1], isFunction: true, validAtX: true };
    }
    case 'rational': {
      if (Math.abs(x - 2) < 1e-9) return { pts: [], isFunction: true, validAtX: false };
      return { pts: [1 / (x - 2) + 1], isFunction: true, validAtX: true };
    }
    case 'discrete': {
      const n = Math.round(x);
      if (Math.abs(x - n) > 1e-9 || n < 0 || n > 4) {
        return { pts: [], isFunction: true, validAtX: false };
      }
      return { pts: [0.8 * n], isFunction: true, validAtX: true };
    }
    default:
      return { pts: [], isFunction: false, validAtX: false };
  }
}

/* ------------------------------------------------------------------ */
/* Tasa de cambio promedio (Secante) e Inversa lineal                 */
/* ------------------------------------------------------------------ */
export function computeSecantTcp(fn, x1, x2) {
  const y1 = fn(x1);
  const y2 = fn(x2);
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dx) < 1e-9) {
    return { dx: 0, dy, tcp: null, defined: false, zeroRate: false };
  }
  const tcp = dy / dx;
  return {
    dx,
    dy,
    tcp,
    defined: true,
    zeroRate: Math.abs(dy) < 1e-9,
  };
}

export function computeLinearInverse({ m, b, x = 0 }) {
  if (Math.abs(m) < 1e-4) {
    return {
      invertible: false,
      reason: 'constant_not_injective',
      constantValue: b,
      directY: b,
      invM: null,
      invB: null,
    };
  }
  const invM = 1 / m;
  const invB = -b / m;
  return {
    invertible: true,
    directY: m * x + b,
    invM,
    invB,
    evalInverse: (y) => (y - b) / m,
  };
}

/* ------------------------------------------------------------------ */
/* Parser de expresiones lineales simples (para f⁻¹(x))               */
/* ------------------------------------------------------------------ */
export function parseLinearExpr(raw) {
  if (typeof raw !== 'string') return null;
  let s = raw.trim().replace(/\u2212/g, '-').replace(/\s+/g, '');
  s = s.replace(/^f\^-?1\(x\)=/i, '').replace(/^y=/i, '');
  if (!s) return null;

  // Forma (a*x + b)/d o (x + b)/d
  const divGroup = s.match(/^\(([^()]+)\)\/([+-]?(?:\d+(?:[.,]\d+)?))$/);
  if (divGroup) {
    const inner = parseLinearExpr(divGroup[1]);
    const denom = parseNumberToken(divGroup[2]);
    if (!inner || !Number.isFinite(denom) || Math.abs(denom) < 1e-12) return null;
    return { m: inner.m / denom, b: inner.b / denom };
  }

  // Separar suma/resta de términos sin eval
  const normalized = s.replace(/·|\*/g, '');
  const terms = normalized.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== normalized) return null;

  let m = 0;
  let b = 0;
  for (const term of terms) {
    if (term.toLowerCase().includes('x')) {
      const xMatch = term.match(/^([+-]?(?:\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)?)x(?:\/([+-]?\d+(?:[.,]\d+)?))?$/i);
      if (!xMatch) return null;
      const coefRaw = xMatch[1];
      let coef = 1;
      if (coefRaw === '-' || coefRaw === '+') coef = coefRaw === '-' ? -1 : 1;
      else if (coefRaw) coef = parseNumberToken(coefRaw);
      if (!Number.isFinite(coef)) return null;
      if (xMatch[2]) {
        const d = parseNumberToken(xMatch[2]);
        if (!Number.isFinite(d) || Math.abs(d) < 1e-12) return null;
        coef /= d;
      }
      m += coef;
    } else {
      const c = parseNumberToken(term);
      if (!Number.isFinite(c)) return null;
      b += c;
    }
  }
  return { m, b };
}

export function equivalentFnAnswer(input, spec) {
  if (!spec) return false;
  if (spec.type === 'choice') {
    return Number(input) === spec.expected;
  }
  if (spec.type === 'number') {
    const n = parseNumberToken(String(input ?? '').replace(',', '.'));
    return Number.isFinite(n) && Math.abs(n - spec.expected) <= 1e-3;
  }
  if (spec.type === 'linear_expr') {
    const parsed = parseLinearExpr(String(input ?? ''));
    if (!parsed) return false;
    return Math.abs(parsed.m - spec.expectedM) <= 1e-4 && Math.abs(parsed.b - spec.expectedB) <= 1e-4;
  }
  if (spec.type === 'interval' || spec.type === 'set') {
    return equivalentIntervalSet(String(input ?? ''), spec.expectedSet).equivalent;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Motor de Diagnóstico Cognitivo de Funciones (6 reglas)             */
/* ------------------------------------------------------------------ */
const FN_DIAG_DEFS = Object.freeze({
  vertical_line_two_outputs_ignored: {
    id: 'vertical_line_two_outputs_ignored',
    category: 'conceptual',
    pose: 'panico',
    competencyId: 'functions.concept_and_uniqueness',
    message:
      'Para ser función, CADA entrada x del dominio debe tener una única salida y. Si una recta vertical corta dos veces, ya no es función (aunque en otro punto corte una sola vez).',
  },
  read_y_axis_instead_of_x_for_sets: {
    id: 'read_y_axis_instead_of_x_for_sets',
    category: 'representation',
    pose: 'lentes-brillo',
    competencyId: 'functions.domain_image_and_sign_sets',
    message:
      'Candado del eje X: los conjuntos Dom(f), C₀, C⁺, C⁻, I↑ e I↓ se leen proyectando sobre el eje X, nunca copiando alturas del eje Y.',
  },
  confused_negative_with_decreasing: {
    id: 'confused_negative_with_decreasing',
    category: 'conceptual',
    pose: 'sospecha',
    competencyId: 'functions.monotonicity_extrema_and_continuity',
    message:
      'Estar debajo del eje X (f(x) < 0, conjunto C⁻) no impide crecer: una curva negativa puede ir subiendo hacia la derecha (I↑).',
  },
  inverted_tcp_ratio_dx_over_dy: {
    id: 'inverted_tcp_ratio_dx_over_dy',
    category: 'procedural',
    pose: 'colapso',
    competencyId: 'functions.average_rate_of_change',
    message:
      'Invirtiste el cociente incremental: la tasa de cambio promedio es variación vertical sobre horizontal (Δy / Δx), no Δx / Δy.',
  },
  inverted_inverse_operations_wrong_order: {
    id: 'inverted_inverse_operations_wrong_order',
    category: 'procedural',
    pose: 'pensativa',
    competencyId: 'functions.bijectivity_and_inverse',
    message:
      'Para hallar f⁻¹(x) hay que deshacer las operaciones en orden inverso y con signo opuesto (despejar x en y = mx + b); además, si m = 0 no es inyectiva.',
  },
  closed_bracket_on_excluded_point_or_extremum: {
    id: 'closed_bracket_on_excluded_point_or_extremum',
    category: 'syntax',
    pose: 'unamused',
    competencyId: 'functions.domain_image_and_sign_sets',
    message:
      'Revisá los extremos e inclusiones: las asíntotas/agujeros van excluidos, y en I↑/I↓ o C⁺/C⁻ los extremos donde f = 0 o cambia la monotonía van abiertos.',
  },
});

export function diagnoseFunction(userInput, context = {}) {
  const spec = context.spec || context;
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  if (spec.type === 'choice' && spec.trapMap) {
    const diagId = spec.trapMap[Number(raw)];
    return diagId && FN_DIAG_DEFS[diagId] ? { ...FN_DIAG_DEFS[diagId] } : null;
  }

  if (spec.type === 'number') {
    const n = parseNumberToken(raw.replace(',', '.'));
    if (Number.isFinite(n)) {
      if (spec.trapInvertedTcp !== undefined && Math.abs(n - spec.trapInvertedTcp) <= 1e-2) {
        return { ...FN_DIAG_DEFS.inverted_tcp_ratio_dx_over_dy };
      }
      if (spec.trapWrongInverseVal !== undefined && Math.abs(n - spec.trapWrongInverseVal) <= 1e-2) {
        return { ...FN_DIAG_DEFS.inverted_inverse_operations_wrong_order };
      }
    }
    return null;
  }

  if (spec.type === 'linear_expr') {
    const parsed = parseLinearExpr(raw);
    if (parsed) {
      if (
        Math.abs(parsed.m - spec.expectedM) > 1e-4 ||
        Math.abs(parsed.b - spec.expectedB) > 1e-4
      ) {
        return { ...FN_DIAG_DEFS.inverted_inverse_operations_wrong_order };
      }
    }
    return null;
  }

  if (spec.type === 'interval' || spec.type === 'set') {
    const parsed = parseIntervalSet(raw);
    if (!parsed.ok) return null;
    if (parsed.rawFlags?.closedInfinity) {
      return { ...FN_DIAG_DEFS.closed_bracket_on_excluded_point_or_extremum };
    }
    if (spec.expectedSet && sameIntervalSet(parsed.intervals, spec.expectedSet)) {
      return null;
    }
    if (spec.trapYAxisSet && sameIntervalSet(parsed.intervals, spec.trapYAxisSet)) {
      return { ...FN_DIAG_DEFS.read_y_axis_instead_of_x_for_sets };
    }
    if (spec.trapClosedExtremumSet && sameIntervalSet(parsed.intervals, spec.trapClosedExtremumSet)) {
      return { ...FN_DIAG_DEFS.closed_bracket_on_excluded_point_or_extremum };
    }
    if (spec.trapIncludedAsymptote && parsed.intervals.some((ivItem) => ivItem.lo === -Infinity && ivItem.hi === Infinity)) {
      return { ...FN_DIAG_DEFS.closed_bracket_on_excluded_point_or_extremum };
    }
    if (spec.expectedSet) {
      // Mismos extremos numéricos pero distinto tipo de corchete/paréntesis
      const normA = parsed.intervals;
      const normB = spec.expectedSet;
      if (
        normA.length === normB.length &&
        normA.every((ia, idx) => ia.lo === normB[idx].lo && ia.hi === normB[idx].hi)
      ) {
        return { ...FN_DIAG_DEFS.closed_bracket_on_excluded_point_or_extremum };
      }
    }
  }

  return null;
}
