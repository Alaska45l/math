/**
 * math-format.js — Formateo numérico (Intl es-AR), protección de signos,
 * intervalos/conjuntos y el componente de fracción horizontal `.fr`.
 */
import { h, s } from './dom.js';

export const MINUS = '\u2212'; // signo menos tipográfico (−)
export const INF = Infinity;

const cache = new Map();
function nf(digits) {
  if (!cache.has(digits)) {
    cache.set(digits, new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }));
  }
  return cache.get(digits);
}

/** Número en formato es-AR (coma decimal) con signo menos tipográfico. */
export function fmt(n, digits = 2) {
  if (!Number.isFinite(n)) return n > 0 ? '+∞' : n < 0 ? `${MINUS}∞` : '?';
  const r = Number(n.toFixed(digits));
  const v = Object.is(r, -0) ? 0 : r;
  return nf(digits).format(v).replace('-', MINUS);
}

/** Protección de paréntesis para negativos: −3 → (−3). */
export function paren(n, digits = 2) {
  const t = fmt(n, digits);
  return Number(n.toFixed(digits)) < 0 ? `(${t})` : t;
}

/** Término con signo explícito para concatenar: 3 → "+ 3", −3 → "− 3". */
export function signedTerm(n, digits = 2) {
  const r = Number(n.toFixed(digits));
  return r < 0 ? `${MINUS} ${fmt(-r, digits)}` : `+ ${fmt(r, digits)}`;
}

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/* ------------------------------------------------------------------ */
/* Intervalos: { lo, hi, loC, hiC }  (loC/hiC = extremo cerrado)        */
/* ------------------------------------------------------------------ */

export const iv = (lo, hi, loC = false, hiC = false) => ({
  lo, hi, loC: Number.isFinite(lo) && loC, hiC: Number.isFinite(hi) && hiC,
});

export function isEmptyInterval(v) {
  return v.lo > v.hi || (v.lo === v.hi && !(v.loC && v.hiC));
}

export function formatInterval(v, digits = 2) {
  if (v.lo === -INF && v.hi === INF) return 'ℝ';
  if (v.lo === v.hi) return `{${fmt(v.lo, digits)}}`;
  const l = v.lo === -INF ? `(${MINUS}∞` : (v.loC ? '[' : '(') + fmt(v.lo, digits);
  const r = v.hi === INF ? '+∞)' : fmt(v.hi, digits) + (v.hiC ? ']' : ')');
  return `${l}; ${r}`;
}

/**
 * Formatea una unión de intervalos. Detecta ℝ − {a} cuando corresponde.
 * Acepta también { points: [...] } para conjuntos discretos.
 */
export function formatSet(set, digits = 2) {
  if (set && set.points) {
    return `{${set.points.map((p) => fmt(p, digits)).join('; ')}}`;
  }
  const list = (set || []).filter((v) => !isEmptyInterval(v));
  if (!list.length) return '∅';
  // ℝ − {a1, a2, ...}
  if (list[0].lo === -INF && list[list.length - 1].hi === INF && list.length > 1) {
    const holes = [];
    let ok = true;
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i], b = list[i + 1];
      if (a.hi === b.lo && !a.hiC && !b.loC) holes.push(a.hi);
      else ok = false;
    }
    if (ok) return `ℝ ${MINUS} {${holes.map((x) => fmt(x, digits)).join('; ')}}`;
  }
  return list.map((v) => formatInterval(v, digits)).join(' ∪ ');
}

/* ------------------------------------------------------------------ */
/* Fracción horizontal estricta                                         */
/* ------------------------------------------------------------------ */

/**
 * Devuelve <span class="fr"><span class="top">…</span><span class="bar"></span>
 * <span class="bot">…</span></span>. top/bot aceptan string, Node o arrays.
 */
export function frac(top, bot, { className = '', label } = {}) {
  const barSvg = s('svg', {
    class: 'fr__bar-svg',
    viewBox: '0 0 100 4',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  },
    s('path', {
      d: 'M 0 2 Q 50 3.5, 100 2',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'vector-effect': 'non-scaling-stroke',
    })
  );

  return h(
    'span',
    { class: ['fr', className], role: label ? 'math' : null, 'aria-label': label || null },
    h('span', { class: 'top' }, top),
    h('span', { class: 'bar', 'aria-hidden': 'true' }, barSvg),
    h('span', { class: 'bot' }, bot),
  );
}

/** Nombre descriptivo usado por los laboratorios de sucesiones. */
export const fractionHtml = (top, bot, options) => frac(top, bot, options);

/** Variable en itálica matemática. */
export const v = (name) => h('var', null, name);

/** Operador visual dentro de una expresión. */
export const op = (sym) => h('span', { class: 'op' }, sym);

/** Número destacado. */
export const num = (n, digits = 2) => h('span', { class: 'num' }, typeof n === 'number' ? fmt(n, digits) : n);

/** Unidad física. */
export const unit = (u) => h('span', { class: 'unit' }, u);

/** Expresión en línea (.eq) */
export const eq = (children, extra = '') => h('span', { class: ['eq', extra] }, children);
