/**
 * circuitos/logic.js — Lógica pura de desigualdades compuestas, intervalos e inecuaciones.
 * Sin acceso al DOM: todo recibe datos y devuelve datos.
 */
import { INF, iv, isEmptyInterval, formatSet, formatInterval } from '../../core/math-format.js';

export const OPS = ['>', '≥', '<', '≤'];

/** ¿La condición {op, v} es verdadera para x? */
export function holds(cond, x) {
  switch (cond.op) {
    case '>': return x > cond.v;
    case '≥': return x >= cond.v;
    case '<': return x < cond.v;
    default: return x <= cond.v;
  }
}

/** Conjunto solución de una desigualdad simple como intervalo. */
export function intervalOf(cond) {
  switch (cond.op) {
    case '>': return iv(cond.v, INF, false, false);
    case '≥': return iv(cond.v, INF, true, false);
    case '<': return iv(-INF, cond.v, false, false);
    default: return iv(-INF, cond.v, false, true);
  }
}

export function intersect(a, b) {
  let lo, loC, hi, hiC;
  if (a.lo > b.lo) { lo = a.lo; loC = a.loC; } else if (a.lo < b.lo) { lo = b.lo; loC = b.loC; } else { lo = a.lo; loC = a.loC && b.loC; }
  if (a.hi < b.hi) { hi = a.hi; hiC = a.hiC; } else if (a.hi > b.hi) { hi = b.hi; hiC = b.hiC; } else { hi = a.hi; hiC = a.hiC && b.hiC; }
  return { lo, loC, hi, hiC };
}

export function union(a, b) {
  const ea = isEmptyInterval(a), eb = isEmptyInterval(b);
  if (ea && eb) return [];
  if (ea) return [b];
  if (eb) return [a];
  let p = a, q = b;
  if (b.lo < a.lo || (b.lo === a.lo && b.loC && !a.loC)) { p = b; q = a; }
  const touch = p.hi > q.lo || (p.hi === q.lo && (p.hiC || q.loC));
  if (!touch) return [p, q];
  let hi, hiC;
  if (p.hi > q.hi) { hi = p.hi; hiC = p.hiC; } else if (p.hi < q.hi) { hi = q.hi; hiC = q.hiC; } else { hi = p.hi; hiC = p.hiC || q.hiC; }
  return [{ lo: p.lo, loC: p.loC, hi, hiC }];
}

/** Retos: conjuntos objetivo expresados como uniones de intervalos. */
export const RETOS = [
  { label: 'Que la lámpara encienda para todo x', set: [iv(-INF, INF)] },
  { label: 'Que no encienda nunca', set: [] },
  { label: 'Que encienda solo de −2 (incluido) a 5 (excluido)', set: [iv(-2, 5, true, false)] },
  { label: 'Que encienda siempre, salvo en (−1; 3]', set: [iv(-INF, -1, false, true), iv(3, INF, false, false)] },
  { label: 'Que encienda únicamente cuando x = 4', set: [iv(4, 4, true, true)] },
];

export const PRESETS = [
  { mode: 'or', A: { op: '>', v: -7 }, B: { op: '≤', v: -3 }, label: 'x > −7 ∨ x ≤ −3' },
  { mode: 'or', A: { op: '>', v: -3 }, B: { op: '≤', v: -7 }, label: 'x > −3 ∨ x ≤ −7' },
  { mode: 'and', A: { op: '>', v: -7 }, B: { op: '≤', v: -3 }, label: '−7 < x ≤ −3' },
  { mode: 'and', A: { op: '≤', v: -7 }, B: { op: '>', v: -3 }, label: 'x ≤ −7 ∧ x > −3' },
];

/** compute(state): deriva todo lo que la vista necesita. */
export function compute(state) {
  const a = holds(state.A, state.x);
  const b = holds(state.B, state.x);
  const lit = state.mode === 'and' ? a && b : a || b;
  const iA = intervalOf(state.A);
  const iB = intervalOf(state.B);
  let res;
  if (state.mode === 'and') {
    const r = intersect(iA, iB);
    res = isEmptyInterval(r) ? [] : [r];
  } else {
    res = union(iA, iB);
  }
  const setStr = formatSet(res);

  let verdict = 'La lámpara enciende solo para los x de este conjunto.';
  if (setStr === 'ℝ') verdict = 'Cubre toda la recta: la lámpara enciende para cualquier x (tautología sobre ℝ).';
  else if (setStr === '∅') verdict = 'Ningún x enciende la lámpara (contradicción: el conjunto es vacío).';
  else if (res.length === 2) {
    const [p, q] = res;
    const gap = { lo: p.hi, loC: !p.hiC, hi: q.lo, hiC: !q.loC };
    verdict = `Hay un hueco: la lámpara se apaga únicamente en ${formatInterval(gap)}. Ese hueco es el AND de las negaciones (De Morgan).`;
  }

  let reto = null;
  if (state.reto >= 0) {
    const ok = formatSet(RETOS[state.reto].set) === setStr;
    reto = { ok, text: `${ok ? 'Logrado' : 'Aún no'}: tu conjunto es ${setStr}` };
  }
  return { a, b, lit, iA, iB, res, setStr, verdict, reto };
}

/* ------------------------------------------------------------------ */
/* Parser de intervalos, evaluador algebraico y motor de diagnóstico  */
/* ------------------------------------------------------------------ */

export function parseNumberToken(tok) {
  if (tok === null || tok === undefined) return NaN;
  const s = String(tok).trim().replace(/\u2212/g, '-').replace(/\s+/g, '');
  if (!s) return NaN;
  const low = s.toLowerCase();
  if (low === '-inf' || low === '-∞' || low === '-infinity' || low === '-infinito') return -INF;
  if (low === '+inf' || low === '+∞' || low === 'inf' || low === '∞' || low === '+infinity' || low === '+infinito') {
    return INF;
  }

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) return NaN;
    const num = parseNumberToken(parts[0]);
    const den = parseNumberToken(parts[1]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || Math.abs(den) < 1e-12) return NaN;
    const val = num / den;
    return Object.is(val, -0) ? 0 : val;
  }

  const normalized = s.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return NaN;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return NaN;
  return Object.is(n, -0) ? 0 : n;
}

export function normalizeIntervalList(intervals = []) {
  const nonEmpty = (intervals || [])
    .filter((item) => item && !isEmptyInterval(item))
    .map((item) => ({
      lo: Object.is(item.lo, -0) ? 0 : item.lo,
      hi: Object.is(item.hi, -0) ? 0 : item.hi,
      loC: Number.isFinite(item.lo) && Boolean(item.loC),
      hiC: Number.isFinite(item.hi) && Boolean(item.hiC),
    }));
  if (nonEmpty.length === 0) return [];
  nonEmpty.sort((a, b) => {
    if (a.lo !== b.lo) return a.lo - b.lo;
    return (b.loC ? 1 : 0) - (a.loC ? 1 : 0);
  });
  const merged = [nonEmpty[0]];
  for (let i = 1; i < nonEmpty.length; i++) {
    const last = merged[merged.length - 1];
    const combined = union(last, nonEmpty[i]);
    if (combined.length === 1) {
      merged[merged.length - 1] = combined[0];
    } else {
      merged.push(nonEmpty[i]);
    }
  }
  return merged;
}

export function sameIntervalSet(setA, setB, eps = 1e-6) {
  const a = normalizeIntervalList(setA);
  const b = normalizeIntervalList(setB);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ia = a[i];
    const ib = b[i];
    const loSame =
      (ia.lo === -INF && ib.lo === -INF) ||
      (Number.isFinite(ia.lo) && Number.isFinite(ib.lo) && Math.abs(ia.lo - ib.lo) <= eps);
    const hiSame =
      (ia.hi === INF && ib.hi === INF) ||
      (Number.isFinite(ia.hi) && Number.isFinite(ib.hi) && Math.abs(ia.hi - ib.hi) <= eps);
    if (!loSame || !hiSame || ia.loC !== ib.loC || ia.hiC !== ib.hiC) return false;
  }
  return true;
}

function splitSetElements(inner) {
  const s = inner.trim();
  if (!s) return [];
  if (s.includes(';')) {
    return s.split(';').map((p) => p.trim()).filter(Boolean);
  }
  if (/,\s+/.test(s)) {
    return s.split(/,\s+/).map((p) => p.trim()).filter(Boolean);
  }
  return [s];
}

export function parseIntervalSet(rawStr) {
  const rawFlags = {
    closedInfinity: false,
    swappedBounds: false,
    emptyByContradiction: false,
  };
  if (typeof rawStr !== 'string') {
    return { ok: false, intervals: [], rawFlags };
  }
  const s = rawStr.trim().replace(/\u2212/g, '-');
  if (!s) {
    return { ok: false, intervals: [], rawFlags };
  }

  const low = s.toLowerCase().replace(/\s+/g, ' ');
  if (s === 'ℝ' || low === 'r' || low === 'todos' || low === 'todos los reales') {
    return { ok: true, intervals: [iv(-INF, INF)], rawFlags };
  }
  if (s === '∅' || low === 'vacio' || low === 'vacío' || low === '{}') {
    return { ok: true, intervals: [], rawFlags };
  }

  const realMinusMatch = s.match(/^(?:ℝ|R)\s*-\s*\{([^}]+)\}$/i);
  if (realMinusMatch) {
    const items = splitSetElements(realMinusMatch[1]);
    const holes = items.map(parseNumberToken);
    if (holes.length === 0 || holes.some((n) => !Number.isFinite(n))) {
      return { ok: false, intervals: [], rawFlags };
    }
    const sorted = Array.from(new Set(holes)).sort((a, b) => a - b);
    const intervals = [];
    let prev = -INF;
    for (const h of sorted) {
      intervals.push(iv(prev, h, false, false));
      prev = h;
    }
    intervals.push(iv(prev, INF, false, false));
    return { ok: true, intervals: normalizeIntervalList(intervals), rawFlags };
  }

  const tokenized = s.replace(/([)\]}])\s*[Uu]\s*([(\[{])/g, '$1∪$2');
  const parts = tokenized.split(/\s*∪\s*/);
  const collected = [];

  for (const part of parts) {
    const p = part.trim();
    if (!p) return { ok: false, intervals: [], rawFlags };

    if (p === 'ℝ' || p.toLowerCase() === 'r') {
      collected.push(iv(-INF, INF));
      continue;
    }
    if (p === '∅' || p.toLowerCase() === 'vacio' || p.toLowerCase() === 'vacío' || p === '{}') {
      continue;
    }

    const singletonMatch = p.match(/^\{([^}]+)\}$/);
    if (singletonMatch) {
      const elems = splitSetElements(singletonMatch[1]);
      if (elems.length === 0) return { ok: false, intervals: [], rawFlags };
      for (const el of elems) {
        const val = parseNumberToken(el);
        if (!Number.isFinite(val)) return { ok: false, intervals: [], rawFlags };
        collected.push(iv(val, val, true, true));
      }
      continue;
    }

    const bracketMatch = p.match(/^([[(])\s*(.+)\s*([)\]])$/);
    if (!bracketMatch) {
      return { ok: false, intervals: [], rawFlags };
    }
    const [, openBr, inside, closeBr] = bracketMatch;
    const loC = openBr === '[';
    const hiC = closeBr === ']';

    let loStr, hiStr;
    if (inside.includes(';')) {
      const halves = inside.split(';');
      if (halves.length !== 2) return { ok: false, intervals: [], rawFlags };
      [loStr, hiStr] = halves;
    } else {
      const commas = inside.split(',');
      if (commas.length === 2) {
        [loStr, hiStr] = commas;
      } else {
        return { ok: false, intervals: [], rawFlags };
      }
    }

    const lo = parseNumberToken(loStr);
    const hi = parseNumberToken(hiStr);
    if (Number.isNaN(lo) || Number.isNaN(hi)) {
      return { ok: false, intervals: [], rawFlags };
    }
    if ((lo === -INF && loC) || (hi === INF && hiC)) {
      rawFlags.closedInfinity = true;
    }
    if (lo === INF || hi === -INF) {
      rawFlags.swappedBounds = true;
    } else if (lo > hi) {
      rawFlags.swappedBounds = true;
    } else if (lo === hi && !(loC && hiC)) {
      rawFlags.emptyByContradiction = true;
    }

    if (!rawFlags.closedInfinity && !rawFlags.swappedBounds && !rawFlags.emptyByContradiction) {
      collected.push(iv(lo, hi, loC, hiC));
    }
  }

  return {
    ok: true,
    intervals: normalizeIntervalList(collected),
    rawFlags,
  };
}

export function equivalentIntervalSet(inputStr, expectedIntervals) {
  const parsed = parseIntervalSet(inputStr);
  if (!parsed.ok || parsed.rawFlags.closedInfinity || parsed.rawFlags.swappedBounds) {
    return { equivalent: false, parsed };
  }
  return {
    equivalent: sameIntervalSet(parsed.intervals, expectedIntervals),
    parsed,
  };
}

function normalizeOp(op) {
  if (op === '>=') return '≥';
  if (op === '<=') return '≤';
  return op;
}

const FLIP_OP = Object.freeze({
  '>': '<',
  '<': '>',
  '≥': '≤',
  '≤': '≥',
});

export function solveLinearInequality({ a, b = 0, op, c = 0, d = 0 }) {
  const normOp = normalizeOp(op);
  const coeff = a - c;
  const rhs = d - b;

  if (Math.abs(coeff) < 1e-12) {
    let tautology = false;
    if (normOp === '>') tautology = 0 > rhs;
    else if (normOp === '≥') tautology = 0 >= rhs;
    else if (normOp === '<') tautology = 0 < rhs;
    else if (normOp === '≤') tautology = 0 <= rhs;
    return {
      set: tautology ? [iv(-INF, INF)] : [],
      boundary: null,
      flipped: false,
      opAfter: normOp,
      degenerate: true,
    };
  }

  const flipped = coeff < 0;
  const opAfter = flipped ? FLIP_OP[normOp] : normOp;
  const rawBoundary = rhs / coeff;
  const boundary = Object.is(rawBoundary, -0) || Math.abs(rawBoundary) < 1e-12 ? 0 : rawBoundary;
  return {
    set: [intervalOf({ op: opAfter, v: boundary })],
    boundary,
    flipped,
    opAfter,
    degenerate: false,
  };
}

export function solveChainedInequality({ lo, loOp, a, b = 0, hiOp, hi }) {
  const normLoOp = normalizeOp(loOp);
  const normHiOp = normalizeOp(hiOp);
  const revLoOp = FLIP_OP[normLoOp] || normLoOp;

  const left = solveLinearInequality({ a, b, op: revLoOp, c: 0, d: lo });
  const right = solveLinearInequality({ a, b, op: normHiOp, c: 0, d: hi });

  if (left.set.length === 0 || right.set.length === 0) {
    return { set: [], left, right };
  }
  const inter = intersect(left.set[0], right.set[0]);
  return {
    set: isEmptyInterval(inter) ? [] : [inter],
    left,
    right,
  };
}

export function solveFactoredQuadratic({ a1 = 1, r1, a2 = 1, r2, op }) {
  const normOp = normalizeOp(op);
  const lead = a1 * a2;
  if (Math.abs(lead) < 1e-12) {
    return solveLinearInequality({ a: 0, b: 0, op: normOp, c: 0, d: 0 });
  }
  const sLead = lead > 0 ? 1 : -1;
  const z1 = Math.min(r1, r2);
  const z2 = Math.max(r1, r2);
  const strict = normOp === '>' || normOp === '<';
  const wantPos = normOp === '>' || normOp === '≥';

  if (Math.abs(z1 - z2) < 1e-12) {
    const sameSide = (sLead > 0) === wantPos;
    if (sameSide) {
      return {
        set: strict ? [iv(-INF, z1, false, false), iv(z1, INF, false, false)] : [iv(-INF, INF)],
        roots: [z1],
        doubleRoot: true,
      };
    }
    return {
      set: strict ? [] : [iv(z1, z1, true, true)],
      roots: [z1],
      doubleRoot: true,
    };
  }

  if ((sLead > 0) === wantPos) {
    return {
      set: normalizeIntervalList([
        iv(-INF, z1, false, !strict),
        iv(z2, INF, !strict, false),
      ]),
      roots: [z1, z2],
      doubleRoot: false,
    };
  }

  return {
    set: [iv(z1, z2, !strict, !strict)],
    roots: [z1, z2],
    doubleRoot: false,
  };
}

function sameNumericBounds(setA, setB, eps = 1e-6) {
  const a = normalizeIntervalList(setA);
  const b = normalizeIntervalList(setB);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ia = a[i];
    const ib = b[i];
    const loSame =
      (ia.lo === -INF && ib.lo === -INF) ||
      (Number.isFinite(ia.lo) && Number.isFinite(ib.lo) && Math.abs(ia.lo - ib.lo) <= eps);
    const hiSame =
      (ia.hi === INF && ib.hi === INF) ||
      (Number.isFinite(ia.hi) && Number.isFinite(ib.hi) && Math.abs(ia.hi - ib.hi) <= eps);
    if (!loSame || !hiSame) return false;
  }
  return true;
}

export function diagnoseInequality(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw && !context.isWorkbenchReto) return null;

  const parsed = raw ? parseIntervalSet(raw) : { ok: false, intervals: [], rawFlags: {} };

  if (parsed.rawFlags?.closedInfinity) {
    return {
      id: 'closed_bracket_on_infinity',
      category: 'syntax',
      pose: 'colapso',
      competencyId: 'inequalities.intervals_and_number_line',
      message:
        'El infinito no es un número real alcanzable: −∞ y +∞ siempre llevan paréntesis abierto ( o ), nunca corchete.',
    };
  }

  if (parsed.rawFlags?.swappedBounds) {
    return {
      id: 'swapped_interval_bounds',
      category: 'syntax',
      pose: 'unamused',
      competencyId: 'inequalities.intervals_and_number_line',
      message:
        'En un intervalo siempre va primero el extremo menor (a la izquierda en la recta) y después el mayor: (menor; mayor).',
    };
  }

  if (parsed.ok && context.expectedSet && sameIntervalSet(parsed.intervals, context.expectedSet)) {
    return null;
  }

  if (parsed.ok && context.wrongFlipSet && sameIntervalSet(parsed.intervals, context.wrongFlipSet)) {
    return {
      id: 'forgot_flip_on_negative_div',
      category: 'procedural',
      pose: 'lentes-brillo',
      competencyId: 'inequalities.linear_and_factored_solving',
      message:
        'Ojo al dividir o multiplicar por un número negativo: el sentido de la desigualdad se invierte (< pasa a >, ≤ pasa a ≥).',
    };
  }

  if (parsed.ok && context.singleSignProductSet && sameIntervalSet(parsed.intervals, context.singleSignProductSet)) {
    return {
      id: 'factored_assumed_both_positive_only',
      category: 'conceptual',
      pose: 'panico',
      competencyId: 'inequalities.linear_and_factored_solving',
      message:
        'En un producto (x − r₁)(x − r₂) > 0 no alcanza con pedir ambos factores positivos: (−) · (−) también da (+). Tenés que unir los dos casos de signos.',
    };
  }

  if (
    (parsed.ok && context.wrongAndOrSet && sameIntervalSet(parsed.intervals, context.wrongAndOrSet)) ||
    (context.isWorkbenchReto && context.state && context.expectedSet &&
      (() => {
        const oppMode = context.state.mode === 'and' ? 'or' : 'and';
        const oppComp = compute({ ...context.state, mode: oppMode });
        return sameIntervalSet(oppComp.res, context.expectedSet);
      })())
  ) {
    return {
      id: 'confused_and_with_or',
      category: 'conceptual',
      pose: 'pensativa',
      competencyId: 'inequalities.compound_and_or_sets',
      message:
        'Revisá el conector lógico: AND (∧, serie) toma la intersección donde cumplen ambas condiciones a la vez, mientras que OR (∨, paralelo) toma la unión.',
    };
  }

  if (
    parsed.ok &&
    ((context.wrongBracketSet && sameIntervalSet(parsed.intervals, context.wrongBracketSet)) ||
      (context.expectedSet &&
        sameNumericBounds(parsed.intervals, context.expectedSet) &&
        !sameIntervalSet(parsed.intervals, context.expectedSet)))
  ) {
    return {
      id: 'swapped_open_closed_bracket',
      category: 'representation',
      pose: 'sospecha',
      competencyId: 'inequalities.intervals_and_number_line',
      message:
        'Los extremos numéricos son correctos, pero revisá si van abiertos con paréntesis ( ) (< o >) o cerrados con corchete [ ] (≤ o ≥).',
    };
  }

  return null;
}
