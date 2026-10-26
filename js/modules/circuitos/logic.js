/**
 * circuitos/logic.js — Lógica pura de desigualdades compuestas.
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
