/**
 * @file js/core/math/polynomials.js
 * Pure, UI-independent exact rational arithmetic and polynomial algebra over Q[x]
 * (with exact quadratic radical root decomposition over R).
 * Shared across Unit 06 (polinomios) and Unit 07 (racionales-irracionales).
 *
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

export const MINUS_CHAR = '\u2212';

const SUPERSCRIPT_MAP = Object.freeze({
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', 'ᵗ': 't', 'ᵘ': 'u', 'ⁿ': 'n',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
});

function typedError(Ctor, message, code, pos = 0) {
  const err = new Ctor(message);
  err.code = code;
  err.pos = pos;
  return err;
}

/* ============================================================================
 * 1. Exact Integer & Rational Arithmetic ({ n, d })
 * ========================================================================== */

/**
 * Non-negative integer GCD.
 * Returns 1 when both arguments are 0 (useful for zero-normalization),
 * otherwise returns standard Euclidean gcd(|a|, |b|).
 */
export function gcdInt(a, b) {
  let x = Math.abs(Math.trunc(Number(a)));
  let y = Math.abs(Math.trunc(Number(b)));
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new TypeError('gcdInt requires finite integer inputs');
  }
  if (x === 0 && y === 0) return 1;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Non-negative integer LCM. Guards 0 -> 0.
 */
export function lcmInt(a, b) {
  const x = Math.abs(Math.trunc(Number(a)));
  const y = Math.abs(Math.trunc(Number(b)));
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new TypeError('lcmInt requires finite integer inputs');
  }
  if (x === 0 || y === 0) return 0;
  return (x / gcdInt(x, y)) * y;
}

/**
 * Constructs a canonical reduced rational { n, d } with d > 0 and gcd(|n|, d) === 1.
 */
export function rat(n, d = 1) {
  if (typeof n === 'object' && n !== null && 'n' in n && 'd' in n && arguments.length === 1) {
    return rat(n.n, n.d);
  }
  if (typeof n !== 'number' || typeof d !== 'number' || !Number.isFinite(n) || !Number.isFinite(d)) {
    throw new TypeError('rat requires finite numeric numerator and denominator');
  }
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new TypeError('rat requires integer numerator and denominator (use ratFromNumber for decimals)');
  }
  if (d === 0) {
    throw typedError(RangeError, 'No se puede dividir por cero.', 'division_by_zero');
  }
  if (n === 0) {
    return Object.freeze({ n: 0, d: 1 });
  }
  let num = n;
  let den = d;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcdInt(num, den);
  const rn = num / g;
  const rd = den / g;
  return Object.freeze({ n: rn === 0 ? 0 : rn, d: rd });
}

/**
 * Converts an integer, finite decimal, string, or { n, d } object into an exact Rational.
 */
export function ratFromNumber(x, maxDen = 1000000) {
  if (x && typeof x === 'object' && 'n' in x && 'd' in x) {
    return rat(x.n, x.d);
  }
  if (typeof x === 'string') {
    return parseRational(x);
  }
  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new TypeError('ratFromNumber requires a finite number');
  }
  if (Number.isInteger(x)) {
    return rat(x === 0 ? 0 : x, 1);
  }

  // Exact decimal scaling from JS string representation first
  const str = String(x);
  const decMatch = str.match(/^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (decMatch) {
    const sign = decMatch[1] === '-' ? -1 : 1;
    const intPart = decMatch[2];
    const fracPart = decMatch[3] || '';
    const exp10 = decMatch[4] ? parseInt(decMatch[4], 10) : 0;
    const digits = intPart + fracPart;
    const shift = exp10 - fracPart.length;

    if (shift >= 0) {
      const scaled = Number(digits) * (10 ** shift);
      if (Number.isSafeInteger(scaled)) {
        return rat(sign * scaled, 1);
      }
    } else {
      const den = 10 ** (-shift);
      const num = Number(digits);
      if (Number.isSafeInteger(num) && Number.isSafeInteger(den)) {
        const g = gcdInt(num, den);
        const rn = (sign * num) / g;
        const rd = den / g;
        if (rd <= maxDen) {
          return rat(rn, rd);
        }
      }
    }
  }

  // Continued fraction fallback up to maxDen
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  let h1 = 1;
  let h0 = 0;
  let k1 = 0;
  let k0 = 1;
  let b = absX;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > maxDen || !Number.isSafeInteger(h2) || !Number.isSafeInteger(k2)) {
      break;
    }
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;
    const rem = b - a;
    if (Math.abs(rem) < 1e-12) break;
    b = 1 / rem;
  }
  return rat(sign * h1, k1 || 1);
}

/**
 * Parses a rational string ("-3/2", "0,5", "0.25", "−4", "(3/4)"), number, or Rational.
 */
export function parseRational(input) {
  if (input && typeof input === 'object' && 'n' in input && 'd' in input) {
    return rat(input.n, input.d);
  }
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw typedError(SyntaxError, 'El número debe ser finito.', 'invalid_number');
    }
    return ratFromNumber(input);
  }
  if (typeof input !== 'string') {
    throw typedError(SyntaxError, 'Valor numérico inválido.', 'invalid_number');
  }

  let s = input.trim();
  if (!s) {
    throw typedError(SyntaxError, 'Ingresá un número o fracción.', 'invalid_number');
  }
  s = s.replace(/[\u2212\u2013\u2014]/g, '-').replace(/(\d),(\d)/g, '$1.$2');
  while (s.startsWith('(') && s.endsWith(')')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) break;
    s = inner;
  }

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) {
      throw typedError(SyntaxError, 'Formato de fracción inválido.', 'invalid_number');
    }
    const left = parts[0].trim().replace(/^\((.*)\)$/, '$1').trim();
    const right = parts[1].trim().replace(/^\((.*)\)$/, '$1').trim();
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(left) || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(right)) {
      throw typedError(SyntaxError, 'Formato de fracción inválido.', 'invalid_number');
    }
    const numVal = Number(left);
    const denVal = Number(right);
    if (!Number.isFinite(numVal) || !Number.isFinite(denVal)) {
      throw typedError(SyntaxError, 'Formato de fracción inválido.', 'invalid_number');
    }
    if (denVal === 0) {
      throw typedError(SyntaxError, 'El denominador no puede ser cero.', 'division_by_zero');
    }
    return ratDiv(ratFromNumber(numVal), ratFromNumber(denVal));
  }

  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(s)) {
    throw typedError(SyntaxError, 'Número o fracción inválida.', 'invalid_number');
  }
  const numVal = Number(s);
  if (!Number.isFinite(numVal)) {
    throw typedError(SyntaxError, 'El número excede el rango finito.', 'invalid_number');
  }
  return ratFromNumber(numVal);
}

function toRat(v) {
  if (v && typeof v === 'object' && 'n' in v && 'd' in v) {
    return rat(v.n, v.d);
  }
  return ratFromNumber(v);
}

export function ratAdd(a, b) {
  const ra = toRat(a);
  const rb = toRat(b);
  if (ra.n === 0) return rb;
  if (rb.n === 0) return ra;
  const g1 = gcdInt(ra.d, rb.d);
  const d1 = ra.d / g1;
  const d2 = rb.d / g1;
  const num = ra.n * d2 + rb.n * d1;
  if (num === 0) return Object.freeze({ n: 0, d: 1 });
  const g2 = gcdInt(num, g1);
  return rat(num / g2, d1 * (rb.d / g2));
}

export function ratSub(a, b) {
  return ratAdd(a, ratNeg(b));
}

export function ratMul(a, b) {
  const ra = toRat(a);
  const rb = toRat(b);
  if (ra.n === 0 || rb.n === 0) return Object.freeze({ n: 0, d: 1 });
  const g1 = gcdInt(ra.n, rb.d);
  const g2 = gcdInt(rb.n, ra.d);
  return rat((ra.n / g1) * (rb.n / g2), (ra.d / g2) * (rb.d / g1));
}

export function ratDiv(a, b) {
  const rb = toRat(b);
  if (rb.n === 0) {
    throw typedError(RangeError, 'No se puede dividir por cero.', 'division_by_zero');
  }
  return ratMul(a, ratInv(rb));
}

export function ratNeg(a) {
  const ra = toRat(a);
  if (ra.n === 0) return Object.freeze({ n: 0, d: 1 });
  return Object.freeze({ n: -ra.n, d: ra.d });
}

export function ratInv(a) {
  const ra = toRat(a);
  if (ra.n === 0) {
    throw typedError(RangeError, 'El cero no tiene inverso multiplicativo.', 'division_by_zero');
  }
  return ra.n < 0
    ? Object.freeze({ n: -ra.d, d: -ra.n })
    : Object.freeze({ n: ra.d, d: ra.n });
}

export function ratAbs(a) {
  const ra = toRat(a);
  return ra.n < 0 ? Object.freeze({ n: -ra.n, d: ra.d }) : ra;
}

export function ratPow(a, exp) {
  const ra = toRat(a);
  if (!Number.isInteger(exp)) {
    throw new TypeError('ratPow requires an integer exponent');
  }
  if (exp === 0) return Object.freeze({ n: 1, d: 1 });
  if (exp < 0) {
    if (ra.n === 0) {
      throw typedError(RangeError, 'Cero elevado a exponente negativo es indefinido.', 'division_by_zero');
    }
    return ratPow(ratInv(ra), -exp);
  }
  if (ra.n === 0) return Object.freeze({ n: 0, d: 1 });
  let base = ra;
  let e = exp;
  let acc = Object.freeze({ n: 1, d: 1 });
  while (e > 0) {
    if (e & 1) acc = ratMul(acc, base);
    e >>= 1;
    if (e > 0) base = ratMul(base, base);
  }
  return acc;
}

export function ratCompare(a, b) {
  const ra = toRat(a);
  const rb = toRat(b);
  return ra.n * rb.d - rb.n * ra.d;
}

export function ratEq(a, b) {
  const ra = toRat(a);
  const rb = toRat(b);
  return ra.n === rb.n && ra.d === rb.d;
}

export const isZeroRat = (a) => toRat(a).n === 0;
export const isOneRat = (a) => {
  const r = toRat(a);
  return r.n === 1 && r.d === 1;
};
export const isMinusOneRat = (a) => {
  const r = toRat(a);
  return r.n === -1 && r.d === 1;
};
export const isIntRat = (a) => toRat(a).d === 1;

export function ratToNumber(a) {
  const ra = toRat(a);
  return ra.n / ra.d;
}

export function ratToString(a, { unicodeMinus = true } = {}) {
  const ra = toRat(a);
  const minus = unicodeMinus ? MINUS_CHAR : '-';
  if (ra.n === 0) return '0';
  const sign = ra.n < 0 ? minus : '';
  const absN = Math.abs(ra.n);
  return ra.d === 1 ? `${sign}${absN}` : `${sign}${absN}/${ra.d}`;
}

/**
 * Returns sorted positive integer divisors of |m| (m !== 0).
 */
export function divisorsOfInt(m) {
  const absM = Math.abs(Math.trunc(Number(m)));
  if (!Number.isFinite(absM) || absM === 0) {
    throw new RangeError('divisorsOfInt requires a non-zero integer');
  }
  const small = [];
  const large = [];
  const limit = Math.floor(Math.sqrt(absM));
  for (let i = 1; i <= limit; i++) {
    if (absM % i === 0) {
      small.push(i);
      const q = absM / i;
      if (q !== i) large.push(q);
    }
  }
  return small.concat(large.reverse());
}

/* ============================================================================
 * 2. Polynomial Representation & Structural Predicates
 * ========================================================================== */

export const ZERO_POLY = Object.freeze([]);

/**
 * Normalizes ascending array, sparse Map, or { coeffs } into a frozen ascending Rational[].
 * Zero polynomial is strictly [] (empty array).
 */
export function normalizePoly(coeffs) {
  if (!coeffs) return ZERO_POLY;
  if (Array.isArray(coeffs)) {
    const out = coeffs.map((c) => toRat(c));
    while (out.length > 0 && out[out.length - 1].n === 0) {
      out.pop();
    }
    return Object.freeze(out);
  }
  if (coeffs instanceof Map) {
    let maxDeg = -1;
    for (const [deg, val] of coeffs.entries()) {
      if (!Number.isInteger(deg) || deg < 0) {
        throw new RangeError('Polynomial degrees must be non-negative integers');
      }
      if (!isZeroRat(val) && deg > maxDeg) maxDeg = deg;
    }
    if (maxDeg < 0) return ZERO_POLY;
    const out = Array.from({ length: maxDeg + 1 }, () => rat(0));
    for (const [deg, val] of coeffs.entries()) {
      if (deg <= maxDeg) out[deg] = toRat(val);
    }
    while (out.length > 0 && out[out.length - 1].n === 0) out.pop();
    return Object.freeze(out);
  }
  if (typeof coeffs === 'object' && Array.isArray(coeffs.coeffs)) {
    return normalizePoly(coeffs.coeffs);
  }
  throw new TypeError('normalizePoly expects an Array, Map, or { coeffs }');
}

export function polyFromDescending(descCoeffs) {
  if (!Array.isArray(descCoeffs)) {
    throw new TypeError('polyFromDescending expects an array');
  }
  return normalizePoly([...descCoeffs].reverse());
}

export function polyToDescending(P) {
  const norm = normalizePoly(P);
  if (norm.length === 0) return [rat(0)];
  return [...norm].reverse();
}

export function polyToSparse(P, { order = 'desc' } = {}) {
  const norm = normalizePoly(P);
  const terms = [];
  for (let i = 0; i < norm.length; i++) {
    if (norm[i].n !== 0) {
      terms.push({ deg: i, coeff: norm[i] });
    }
  }
  return order === 'desc' ? terms.reverse() : terms;
}

export function isZeroPoly(P) {
  return normalizePoly(P).length === 0;
}

/**
 * Degree of polynomial. Returns null for the zero polynomial P(x) = 0
 * (per UNMDP Cap. 5: "El polinomio nulo no tiene grado").
 */
export function polyDegree(P) {
  const norm = normalizePoly(P);
  return norm.length === 0 ? null : norm.length - 1;
}

export function polyDegreeOrNegInf(P) {
  const d = polyDegree(P);
  return d === null ? -Infinity : d;
}

export function leadingCoeff(P) {
  const norm = normalizePoly(P);
  return norm.length === 0 ? rat(0) : norm[norm.length - 1];
}

export function constantTerm(P) {
  const norm = normalizePoly(P);
  return norm.length === 0 ? rat(0) : norm[0];
}

export function isMonic(P) {
  const norm = normalizePoly(P);
  return norm.length > 0 && isOneRat(norm[norm.length - 1]);
}

export function polyMonic(P) {
  const norm = normalizePoly(P);
  if (norm.length === 0) {
    throw new Error('Cannot normalize zero polynomial to monic');
  }
  const lc = norm[norm.length - 1];
  return {
    leadingCoeff: lc,
    monic: polyScale(norm, ratInv(lc)),
  };
}

export function polyEqual(P, Q) {
  const a = normalizePoly(P);
  const b = normalizePoly(Q);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!ratEq(a[i], b[i])) return false;
  }
  return true;
}

export function areOppositePolys(P, Q) {
  return polyEqual(P, polyNeg(Q));
}

export function inspectPolynomial(P) {
  const asc = normalizePoly(P);
  const isZero = asc.length === 0;
  const degree = isZero ? null : asc.length - 1;
  const lc = isZero ? rat(0) : asc[asc.length - 1];
  const ct = isZero ? rat(0) : asc[0];
  const desc = isZero ? [rat(0)] : [...asc].reverse();
  const nonZeroCount = asc.reduce((acc, c) => acc + (c.n !== 0 ? 1 : 0), 0);

  return {
    isZero,
    degree,
    degreeLabel: degree === null ? 'Sin grado (polinomio nulo)' : String(degree),
    leadingCoeff: lc,
    constantTerm: ct,
    isMonic: !isZero && isOneRat(lc),
    termCount: nonZeroCount,
    nonZeroTermCount: nonZeroCount,
    completeTermCount: desc.length,
    completeDesc: desc,
    orderedDesc: polyToSparse(asc, { order: 'desc' }),
    coeffsAsc: asc,
    coeffsDesc: desc,
  };
}

/* ============================================================================
 * 3. Polynomial Arithmetic, Euclidean Division, Ruffini & Remainder Theorem
 * ========================================================================== */

export function polyNeg(P) {
  const norm = normalizePoly(P);
  return Object.freeze(norm.map((c) => ratNeg(c)));
}

export function polyScale(P, scalar) {
  const s = toRat(scalar);
  if (s.n === 0) return ZERO_POLY;
  const norm = normalizePoly(P);
  return Object.freeze(norm.map((c) => ratMul(c, s)));
}

export function polyAdd(P, Q) {
  const a = normalizePoly(P);
  const b = normalizePoly(Q);
  const len = Math.max(a.length, b.length);
  const out = [];
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a[i] : rat(0);
    const cb = i < b.length ? b[i] : rat(0);
    out.push(ratAdd(ca, cb));
  }
  return normalizePoly(out);
}

export function polySub(P, Q) {
  return polyAdd(P, polyNeg(Q));
}

export function polyMul(P, Q) {
  const a = normalizePoly(P);
  const b = normalizePoly(Q);
  if (a.length === 0 || b.length === 0) return ZERO_POLY;
  const out = Array.from({ length: a.length + b.length - 1 }, () => rat(0));
  for (let i = 0; i < a.length; i++) {
    if (a[i].n === 0) continue;
    for (let j = 0; j < b.length; j++) {
      if (b[j].n === 0) continue;
      out[i + j] = ratAdd(out[i + j], ratMul(a[i], b[j]));
    }
  }
  return normalizePoly(out);
}

export function polyPow(P, exp) {
  if (!Number.isInteger(exp) || exp < 0) {
    throw new RangeError('polyPow requires a non-negative integer exponent');
  }
  if (exp === 0) return Object.freeze([rat(1)]);
  let base = normalizePoly(P);
  if (base.length === 0) return ZERO_POLY;
  let e = exp;
  let acc = Object.freeze([rat(1)]);
  while (e > 0) {
    if (e & 1) acc = polyMul(acc, base);
    e >>= 1;
    if (e > 0) base = polyMul(base, base);
  }
  return acc;
}

export function polyDerivative(P) {
  const norm = normalizePoly(P);
  if (norm.length <= 1) return ZERO_POLY;
  const out = [];
  for (let i = 1; i < norm.length; i++) {
    out.push(ratMul(norm[i], rat(i)));
  }
  return normalizePoly(out);
}

/**
 * Exact rational Horner evaluation P(x).
 */
export function evalPoly(P, x) {
  const norm = normalizePoly(P);
  const rx = toRat(x);
  if (norm.length === 0) return rat(0);
  let acc = rat(0);
  for (let i = norm.length - 1; i >= 0; i--) {
    acc = ratAdd(ratMul(acc, rx), norm[i]);
  }
  return acc;
}

/**
 * Fast floating-point Horner evaluation for plotting or irrational probes.
 */
export function evalPolyNumber(P, xNum) {
  const norm = normalizePoly(P);
  if (norm.length === 0) return 0;
  let acc = 0;
  for (let i = norm.length - 1; i >= 0; i--) {
    acc = acc * xNum + ratToNumber(norm[i]);
  }
  return acc;
}

/**
 * Euclidean division over Q[x]: P(x) = Q(x) * quotient(x) + remainder(x),
 * with deg(remainder) < deg(Q) or remainder === 0.
 */
export function polyDiv(P, Q) {
  const dividend = normalizePoly(P);
  const divisor = normalizePoly(Q);
  if (divisor.length === 0) {
    throw typedError(Error, 'No se puede dividir por el polinomio nulo.', 'division_by_zero_polynomial');
  }

  const degD = divisor.length - 1;
  const leadD = divisor[degD];

  if (dividend.length - 1 < degD) {
    return {
      quotient: ZERO_POLY,
      remainder: dividend,
      divisible: dividend.length === 0,
      steps: [],
    };
  }

  const rem = [...dividend];
  const quotLen = dividend.length - divisor.length + 1;
  const quot = Array.from({ length: quotLen }, () => rat(0));
  const steps = [];

  for (let idx = quotLen - 1; idx >= 0; idx--) {
    const targetDeg = idx + degD;
    const remAtTop = targetDeg < rem.length ? rem[targetDeg] : rat(0);
    if (remAtTop.n === 0) continue;

    const workingDividendDesc = [...rem].reverse();
    const termCoeff = ratDiv(remAtTop, leadD);
    quot[idx] = termCoeff;

    const subtrahend = Array.from({ length: targetDeg + 1 }, () => rat(0));
    for (let j = 0; j <= degD; j++) {
      const prod = ratMul(termCoeff, divisor[j]);
      subtrahend[idx + j] = prod;
      rem[idx + j] = ratSub(rem[idx + j], prod);
    }

    const nextRemTrimmed = [...rem];
    while (nextRemTrimmed.length > 0 && nextRemTrimmed[nextRemTrimmed.length - 1].n === 0) {
      nextRemTrimmed.pop();
    }

    steps.push({
      stepIndex: steps.length + 1,
      workingDividendDesc,
      termDeg: idx,
      termCoeff,
      subtrahendDesc: [...subtrahend].reverse(),
      nextRemainderDesc: nextRemTrimmed.length ? [...nextRemTrimmed].reverse() : [rat(0)],
    });
  }

  const quotient = normalizePoly(quot);
  const remainder = normalizePoly(rem);

  return {
    quotient,
    remainder,
    divisible: remainder.length === 0,
    steps,
  };
}

/**
 * Synthetic division (Ruffini's Rule) by linear divisor (a*x - b).
 * - ruffini(P, r) divides by (x - r)
 * - ruffini(P, { a, b }) divides by (a*x - b), rescaling quotient = C_0(x) / a.
 */
export function ruffini(P, rootOrSpec) {
  let a = rat(1);
  let b;
  if (rootOrSpec && typeof rootOrSpec === 'object' && 'a' in rootOrSpec && 'b' in rootOrSpec) {
    a = toRat(rootOrSpec.a);
    b = toRat(rootOrSpec.b);
  } else {
    b = toRat(rootOrSpec);
  }
  return ruffiniLinear(P, a, b);
}

/**
 * Explicit non-monic Ruffini division of P(x) by (a*x - b).
 */
export function ruffiniLinear(P, aInput, bInput) {
  const dividend = normalizePoly(P);
  const a = toRat(aInput);
  const b = toRat(bInput);
  if (a.n === 0) {
    throw typedError(RangeError, 'El coeficiente de x en el divisor lineal no puede ser cero.', 'division_by_zero');
  }

  const root = ratDiv(b, a);
  const divisorPoly = normalizePoly([ratNeg(b), a]);

  if (dividend.length <= 1) {
    const remRat = dividend.length === 0 ? rat(0) : dividend[0];
    return {
      root,
      divisorA: a,
      divisorB: b,
      divisorPoly,
      quotient: ZERO_POLY,
      quotientMonic: ZERO_POLY,
      remainder: remRat,
      divisible: remRat.n === 0,
      table: {
        dividendDesc: polyToDescending(dividend),
        root,
        multiplies: [rat(0)],
        sums: [remRat],
      },
      steps: [],
    };
  }

  const dividendDesc = polyToDescending(dividend);
  const multiplies = [null];
  const sums = [dividendDesc[0]];
  const steps = [];

  for (let i = 1; i < dividendDesc.length; i++) {
    const prevSum = sums[i - 1];
    const mult = ratMul(prevSum, root);
    const sum = ratAdd(dividendDesc[i], mult);
    multiplies.push(mult);
    sums.push(sum);
    steps.push({
      columnIndex: i,
      dividendCoeff: dividendDesc[i],
      prevQuotCoeff: prevSum,
      multiplied: mult,
      resultCoeff: sum,
      isRemainder: i === dividendDesc.length - 1,
    });
  }

  const remainder = sums[sums.length - 1];
  const quotientMonicDesc = sums.slice(0, -1);
  const quotientMonic = polyFromDescending(quotientMonicDesc);
  const quotient = isOneRat(a) ? quotientMonic : polyScale(quotientMonic, ratInv(a));

  return {
    root,
    divisorA: a,
    divisorB: b,
    divisorPoly,
    quotient,
    quotientMonic,
    remainder,
    divisible: remainder.n === 0,
    table: {
      dividendDesc,
      root,
      multiplies,
      sums,
    },
    steps,
  };
}

/**
 * Remainder Theorem: evaluates remainder of P(x) divided by (b*x - a)
 * or (x - a) when b === 1. Also supports remainderTheorem(P, { a, b }) for (a*x - b).
 */
export function remainderTheorem(P, aInput, bInput = 1) {
  let root;
  if (aInput && typeof aInput === 'object' && 'a' in aInput && 'b' in aInput && arguments.length === 2) {
    const ra = toRat(aInput.a);
    const rb = toRat(aInput.b);
    if (ra.n === 0) throw typedError(RangeError, 'Divisor inválido.', 'division_by_zero');
    root = ratDiv(rb, ra);
  } else {
    const ra = toRat(aInput);
    const rb = toRat(bInput);
    if (rb.n === 0) throw typedError(RangeError, 'Divisor inválido.', 'division_by_zero');
    root = ratDiv(ra, rb);
  }
  const remainder = evalPoly(P, root);
  return {
    root,
    remainder,
    isDivisible: remainder.n === 0,
  };
}

/* ============================================================================
 * 4. Gauss Candidates, Factorization over R, GCD & LCM
 * ========================================================================== */

/**
 * Computes candidate rational roots p/q via Gauss's Theorem after scaling P
 * to integer coefficients and factoring out x^k if a_0 === 0.
 */
export function gaussCandidates(P) {
  const norm = normalizePoly(P);
  if (norm.length === 0) {
    return {
      isZero: true,
      zeroIsRoot: false,
      xPower: 0,
      scaledIntPoly: ZERO_POLY,
      pDivisors: [],
      qDivisors: [],
      candidates: [],
      candidatesFormatted: [],
    };
  }

  let denomLcm = 1;
  for (const c of norm) {
    denomLcm = lcmInt(denomLcm, c.d);
  }
  const scaledIntPoly = polyScale(norm, rat(denomLcm));

  let xPower = 0;
  while (xPower < scaledIntPoly.length && scaledIntPoly[xPower].n === 0) {
    xPower += 1;
  }
  const core = scaledIntPoly.slice(xPower);
  const zeroIsRoot = xPower > 0;

  if (core.length <= 1) {
    return {
      isZero: false,
      zeroIsRoot,
      xPower,
      scaledIntPoly,
      pDivisors: [],
      qDivisors: [],
      candidates: [],
      candidatesFormatted: [],
    };
  }

  const a0 = core[0].n;
  const an = core[core.length - 1].n;
  const pDivisors = divisorsOfInt(a0);
  const qDivisors = divisorsOfInt(an);

  const seen = new Map();
  for (const p of pDivisors) {
    for (const q of qDivisors) {
      for (const sgn of [1, -1]) {
        const candidate = rat(sgn * p, q);
        const key = `${candidate.n}/${candidate.d}`;
        if (!seen.has(key)) {
          seen.set(key, candidate);
        }
      }
    }
  }

  const candidates = Array.from(seen.values()).sort((u, v) => ratCompare(u, v));
  return {
    isZero: false,
    zeroIsRoot,
    xPower,
    scaledIntPoly,
    pDivisors,
    qDivisors,
    candidates,
    candidatesFormatted: candidates.map((c) => ratToString(c)),
  };
}

/**
 * Decomposes an exact positive rational r = n/d into k * sqrt(rad) / den
 * and returns exact irrational roots from monic x^2 + px + q = 0 when disc > 0.
 */
function factorMonicQuadratic(pRat, qRat) {
  const disc = ratSub(ratMul(pRat, pRat), ratMul(rat(4), qRat));
  const halfNegP = ratDiv(ratNeg(pRat), rat(2));

  if (disc.n < 0) {
    return {
      irreducible: normalizePoly([qRat, pRat, rat(1)]),
      roots: [],
    };
  }

  if (disc.n === 0) {
    return {
      irreducible: null,
      roots: [{
        rootType: 'rational',
        root: halfNegP,
        exactNumeric: ratToNumber(halfNegP),
        multiplicity: 2,
        formatted: ratToString(halfNegP),
      }],
    };
  }

  // disc = N / D (both positive integers). sqrt(N/D) = sqrt(N*D) / D.
  const prod = disc.n * disc.d;
  let k = 1;
  let rad = prod;
  for (let i = 2; i * i <= rad; i++) {
    while (rad % (i * i) === 0) {
      k *= i;
      rad /= i * i;
    }
  }

  const sqrtOver2 = ratDiv(rat(k, disc.d), rat(2));
  if (rad === 1) {
    const rMinus = ratSub(halfNegP, sqrtOver2);
    const rPlus = ratAdd(halfNegP, sqrtOver2);
    return {
      irreducible: null,
      roots: [
        { rootType: 'rational', root: rMinus, exactNumeric: ratToNumber(rMinus), multiplicity: 1, formatted: ratToString(rMinus) },
        { rootType: 'rational', root: rPlus, exactNumeric: ratToNumber(rPlus), multiplicity: 1, formatted: ratToString(rPlus) },
      ],
    };
  }

  const fmtIrrational = (signChar) => {
    const coeffStr = isOneRat(sqrtOver2) ? '' : `${ratToString(sqrtOver2)}·`;
    const baseStr = halfNegP.n === 0 ? '' : `${ratToString(halfNegP)} `;
    if (!baseStr) {
      return `${signChar === '-' ? MINUS_CHAR : ''}${coeffStr}√${rad}`;
    }
    return `${baseStr}${signChar === '-' ? MINUS_CHAR : '+'} ${coeffStr}√${rad}`;
  };

  return {
    irreducible: null,
    roots: [
      {
        rootType: 'quadratic_irrational',
        exactNumeric: ratToNumber(halfNegP) - ratToNumber(sqrtOver2) * Math.sqrt(rad),
        radical: {
          rationalPart: halfNegP,
          radicalCoeff: sqrtOver2,
          radicand: rad,
          sign: -1,
          formatted: fmtIrrational('-'),
        },
        multiplicity: 1,
        formatted: fmtIrrational('-'),
      },
      {
        rootType: 'quadratic_irrational',
        exactNumeric: ratToNumber(halfNegP) + ratToNumber(sqrtOver2) * Math.sqrt(rad),
        radical: {
          rationalPart: halfNegP,
          radicalCoeff: sqrtOver2,
          radicand: rad,
          sign: 1,
          formatted: fmtIrrational('+'),
        },
        multiplicity: 1,
        formatted: fmtIrrational('+'),
      },
    ],
  };
}

/**
 * Factors a polynomial over R into:
 * - leadingCoeff (a_n)
 * - zeroMultiplicity (x^k)
 * - linearFactors: rational factors (x - r)^m and exact quadratic irrational factors (x - (p ± q√rad))
 * - irreducibleQuadratics: monic (x^2 + px + q)^m with Δ < 0
 * - unfactoredResidual: residual monic factor of degree >= 3 without rational/biquadratic decomposition
 */
export function factorPolynomial(P) {
  const norm = normalizePoly(P);
  if (norm.length === 0) {
    return {
      isZero: true,
      leadingCoeff: rat(0),
      zeroMultiplicity: 0,
      linearFactors: [],
      irreducibleQuadratics: [],
      unfactoredResidual: ZERO_POLY,
      fullyFactored: true,
      realRoots: [],
      formatted: '0',
    };
  }

  const lc = leadingCoeff(norm);
  let work = polyMonic(norm).monic;

  // 1. Extract x^k
  let zeroMultiplicity = 0;
  while (zeroMultiplicity < work.length && work[zeroMultiplicity].n === 0) {
    zeroMultiplicity += 1;
  }
  work = normalizePoly(work.slice(zeroMultiplicity));

  const linearFactors = [];
  const irreducibleQuadratics = [];
  let unfactoredResidual = ZERO_POLY;

  if (zeroMultiplicity > 0) {
    linearFactors.push({
      rootType: 'rational',
      root: rat(0),
      exactNumeric: 0,
      multiplicity: zeroMultiplicity,
      formatted: '0',
    });
  }

  // 2. Iteratively extract rational roots via Gauss + Ruffini
  const rationalMap = new Map();
  let progress = true;
  while (progress && work.length > 1) {
    progress = false;
    const { candidates } = gaussCandidates(work);
    for (const r of candidates) {
      if (evalPoly(work, r).n === 0) {
        const key = `${r.n}/${r.d}`;
        let mult = 0;
        while (work.length > 1 && evalPoly(work, r).n === 0) {
          work = ruffini(work, r).quotient;
          mult += 1;
        }
        rationalMap.set(key, {
          rootType: 'rational',
          root: r,
          exactNumeric: ratToNumber(r),
          multiplicity: (rationalMap.get(key)?.multiplicity || 0) + mult,
          formatted: ratToString(r),
        });
        progress = true;
        break;
      }
    }
  }

  for (const lf of rationalMap.values()) {
    linearFactors.push(lf);
  }

  // 3. Helper to decompose a monic rational-root-free core (handles deg 2, biquadratic deg 4, and repeated square-free factors)
  const pushIrrationalOrQuad = (factorObj, mult = 1) => {
    if (factorObj.irreducible) {
      const existing = irreducibleQuadratics.find((iq) => polyEqual(iq.coeffs, factorObj.irreducible));
      if (existing) {
        existing.multiplicity += mult;
      } else {
        irreducibleQuadratics.push({
          coeffs: factorObj.irreducible,
          p: factorObj.irreducible[1],
          q: factorObj.irreducible[0],
          multiplicity: mult,
          formatted: formatPoly(factorObj.irreducible),
        });
      }
    } else if (factorObj.roots) {
      for (const rt of factorObj.roots) {
        linearFactors.push({
          ...rt,
          multiplicity: rt.multiplicity * mult,
        });
      }
    }
  };

  const decomposeCore = (corePoly, mult = 1) => {
    const d = polyDegree(corePoly);
    if (d === null || d === 0) return;

    if (d === 2) {
      pushIrrationalOrQuad(factorMonicQuadratic(corePoly[1], corePoly[0]), mult);
      return;
    }

    // Check biquadratic x^4 + p*x^2 + q
    if (d === 4 && isZeroRat(corePoly[1]) && isZeroRat(corePoly[3])) {
      const pU = corePoly[2];
      const qU = corePoly[0];
      const aux = factorMonicQuadratic(pU, qU);
      if (!aux.irreducible) {
        // Every root of u^2 + pU*u + qU = 0 gives x^2 = u_i
        const allRationalU = aux.roots.every((r) => r.rootType === 'rational');
        if (allRationalU) {
          for (const uRoot of aux.roots) {
            const u = uRoot.root;
            if (u.n < 0) {
              // x^2 + |u| irreducible
              const irred = normalizePoly([ratNeg(u), rat(0), rat(1)]);
              pushIrrationalOrQuad({ irreducible: irred, roots: [] }, uRoot.multiplicity * mult);
            } else if (u.n > 0) {
              // x^2 - u = 0
              pushIrrationalOrQuad(factorMonicQuadratic(rat(0), ratNeg(u)), uRoot.multiplicity * mult);
            }
          }
          return;
        }
      }
    }

    // Square-free check using GCD(core, core') for repeated irreducible factors like (x^2 + 1)^2 or (x^2 + x + 1)^2
    const deriv = polyDerivative(corePoly);
    const g = polyGcd(corePoly, deriv);
    if ((polyDegree(g) ?? 0) > 0 && !polyEqual(g, corePoly)) {
      const sqFreePart = polyDiv(corePoly, g).quotient;
      decomposeCore(sqFreePart, mult);
      decomposeCore(g, mult);
      return;
    }

    unfactoredResidual = polyMul(
      unfactoredResidual.length ? unfactoredResidual : [rat(1)],
      polyPow(corePoly, mult)
    );
  };

  if ((polyDegree(work) ?? 0) >= 2) {
    decomposeCore(work, 1);
  }

  // Sort linearFactors and realRoots cleanly by numeric value
  linearFactors.sort((a, b) => a.exactNumeric - b.exactNumeric);

  const realRoots = linearFactors.map((lf) => ({
    value: lf.exactNumeric,
    exact: lf.formatted,
    multiplicity: lf.multiplicity,
    rootType: lf.rootType,
    rational: lf.root || null,
    radical: lf.radical || null,
  }));

  const fullyFactored = unfactoredResidual.length === 0;
  const formatted = formatFactoredPolynomial({
    leadingCoeff: lc,
    linearFactors,
    irreducibleQuadratics,
    unfactoredResidual,
  });

  return {
    isZero: false,
    leadingCoeff: lc,
    zeroMultiplicity,
    linearFactors,
    irreducibleQuadratics,
    unfactoredResidual,
    fullyFactored,
    realRoots,
    formatted,
  };
}

function formatLinearFactorPiece(lf, variable = 'x', unicodeMinus = true) {
  const minus = unicodeMinus ? MINUS_CHAR : '-';
  let base;
  if (lf.exactNumeric === 0) {
    base = variable;
  } else if (lf.rootType === 'rational' && lf.root) {
    const negR = ratNeg(lf.root);
    const sign = negR.n < 0 ? ` ${minus} ` : ' + ';
    const absStr = ratToString(ratAbs(negR), { unicodeMinus });
    base = `(${variable}${sign}${absStr})`;
  } else {
    const sign = lf.exactNumeric > 0 ? ` ${minus} ` : ' + ';
    const absDisplay = lf.exactNumeric > 0
      ? lf.formatted
      : (lf.formatted.startsWith(MINUS_CHAR) ? lf.formatted.slice(1) : lf.formatted.replace(/^-/, ''));
    base = `(${variable}${sign}${absDisplay})`;
  }
  return lf.multiplicity > 1 ? `${base}^${lf.multiplicity}` : base;
}

function formatFactoredPolynomial(fac, { variable = 'x', unicodeMinus = true } = {}) {
  if (fac.isZero) return '0';
  const parts = [];
  const lc = fac.leadingCoeff;
  const hasOtherFactors =
    fac.linearFactors.length > 0 ||
    fac.irreducibleQuadratics.length > 0 ||
    fac.unfactoredResidual.length > 0;

  if (!hasOtherFactors) {
    return ratToString(lc, { unicodeMinus });
  }
  if (isMinusOneRat(lc)) {
    parts.push(unicodeMinus ? MINUS_CHAR : '-');
  } else if (!isOneRat(lc)) {
    parts.push(ratToString(lc, { unicodeMinus }));
  }

  for (const lf of fac.linearFactors) {
    parts.push(formatLinearFactorPiece(lf, variable, unicodeMinus));
  }
  for (const iq of fac.irreducibleQuadratics) {
    const polyStr = `(${formatPoly(iq.coeffs, { variable, unicodeMinus })})`;
    parts.push(iq.multiplicity > 1 ? `${polyStr}^${iq.multiplicity}` : polyStr);
  }
  if (fac.unfactoredResidual.length > 0) {
    parts.push(`(${formatPoly(fac.unfactoredResidual, { variable, unicodeMinus })})`);
  }
  return parts.join('');
}

/**
 * Monic polynomial GCD over Q[x]. Returns [] only if both P and Q are zero.
 */
export function polyGcd(P, Q) {
  let a = normalizePoly(P);
  let b = normalizePoly(Q);
  while (b.length > 0) {
    const r = polyDiv(a, b).remainder;
    a = b;
    b = r;
  }
  if (a.length === 0) return ZERO_POLY;
  return polyMonic(a).monic;
}

/**
 * Monic polynomial LCM M(x) over Q[x]. Returns [] if either is zero.
 */
export function polyLcm(P, Q) {
  const a = normalizePoly(P);
  const b = normalizePoly(Q);
  if (a.length === 0 || b.length === 0) return ZERO_POLY;
  const g = polyGcd(a, b);
  const prod = polyMul(a, b);
  const quot = polyDiv(prod, g).quotient;
  return polyMonic(quot).monic;
}

/**
 * Monic polynomial LCM across an array of polynomials, plus its factorization.
 */
export function polyLcmMany(polys) {
  if (!Array.isArray(polys) || polys.length === 0) {
    return { lcm: ZERO_POLY, factorization: factorPolynomial(ZERO_POLY) };
  }
  let acc = normalizePoly(polys[0]);
  if (acc.length === 0) {
    return { lcm: ZERO_POLY, factorization: factorPolynomial(ZERO_POLY) };
  }
  acc = polyMonic(acc).monic;
  for (let i = 1; i < polys.length; i++) {
    acc = polyLcm(acc, polys[i]);
    if (acc.length === 0) {
      return { lcm: ZERO_POLY, factorization: factorPolynomial(ZERO_POLY) };
    }
  }
  return {
    lcm: acc,
    factorization: factorPolynomial(acc),
  };
}

/* ============================================================================
 * 5. Exactas Polynomial Formatting
 * ========================================================================== */

export function formatPoly(P, { variable = 'x', order = 'desc', unicodeMinus = true } = {}) {
  const norm = normalizePoly(P);
  if (norm.length === 0) return '0';
  const minus = unicodeMinus ? MINUS_CHAR : '-';
  const terms = polyToSparse(norm, { order });
  const parts = [];

  terms.forEach(({ deg, coeff }, idx) => {
    const isNeg = coeff.n < 0;
    const absCoeff = ratAbs(coeff);
    const absStr = ratToString(absCoeff, { unicodeMinus });
    const varPart = deg === 0 ? '' : deg === 1 ? variable : `${variable}^${deg}`;
    const coeffPart = deg === 0 ? absStr : (isOneRat(absCoeff) ? '' : (absCoeff.d === 1 ? absStr : `${absStr} `));
    const core = `${coeffPart}${varPart}`.trim();

    if (idx === 0) {
      parts.push(isNeg ? `${minus}${core}` : core);
    } else {
      parts.push(isNeg ? ` ${minus} ${core}` : ` + ${core}`);
    }
  });

  return parts.join('');
}

export function formatPolyHtml(P, { variable = 'x', order = 'desc' } = {}) {
  const norm = normalizePoly(P);
  if (norm.length === 0) return '0';
  const terms = polyToSparse(norm, { order });
  const parts = [];

  terms.forEach(({ deg, coeff }, idx) => {
    const isNeg = coeff.n < 0;
    const absCoeff = ratAbs(coeff);
    const coeffHtml = absCoeff.d === 1
      ? String(absCoeff.n)
      : `<span class="fr"><span class="top">${absCoeff.n}</span><span class="bar" aria-hidden="true"></span><span class="bot">${absCoeff.d}</span></span>`;
    const varHtml = deg === 0 ? '' : deg === 1 ? variable : `${variable}<sup>${deg}</sup>`;
    const body = deg === 0
      ? coeffHtml
      : (isOneRat(absCoeff) ? varHtml : `${coeffHtml}${varHtml}`);

    if (idx === 0) {
      parts.push(isNeg ? `${MINUS_CHAR}${body}` : body);
    } else {
      parts.push(isNeg ? ` ${MINUS_CHAR} ${body}` : ` + ${body}`);
    }
  });

  return parts.join('');
}

/* ============================================================================
 * 6. Zero-Eval Polynomial Expression Parser (Recursive-Descent AST)
 * ========================================================================== */

export function normalizePolyExprString(input) {
  if (typeof input !== 'string') return '';
  let s = input.trim();
  // Strip optional P(x) =, Q(x) =, f(t) = prefixes
  s = s.replace(/^\s*[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)\s*=\s*/i, '');
  // Unify minus, multiplication, division, decimal comma
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  s = s.replace(/[\u00F7:]/g, '/');
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // √(...) or √n -> sqrt(...)
  s = s.replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)');
  s = s.replace(/√\s*([a-zA-Z0-9_.]+)/g, 'sqrt($1)');
  // Unicode superscripts -> ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

export function tokenizePolyExpr(rawInput) {
  const src = normalizePolyExprString(rawInput);
  if (!src) {
    throw typedError(SyntaxError, 'Ingresá una expresión polinómica.', 'empty');
  }
  if (src.length > 500) {
    throw typedError(SyntaxError, 'La expresión es demasiado larga.', 'too_long');
  }

  const rawTokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    const rest = src.slice(i);
    const numMatch = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (numMatch) {
      rawTokens.push({ type: 'number', raw: numMatch[0], value: parseFloat(numMatch[0]), pos: i });
      i += numMatch[0].length;
      continue;
    }
    const wordMatch = rest.match(/^[a-zA-Z]+/);
    if (wordMatch) {
      const lower = wordMatch[0].toLowerCase();
      if (lower === 'sqrt' || lower === 'raiz') {
        rawTokens.push({ type: 'func', name: 'sqrt', pos: i });
      } else if (wordMatch[0].length === 1) {
        rawTokens.push({ type: 'variable', name: wordMatch[0].toLowerCase(), pos: i });
      } else {
        for (let k = 0; k < wordMatch[0].length; k++) {
          rawTokens.push({ type: 'variable', name: wordMatch[0][k].toLowerCase(), pos: i + k });
        }
      }
      i += wordMatch[0].length;
      continue;
    }
    if ('+-*/^()[]'.includes(ch)) {
      const mapped = ch === '[' ? '(' : ch === ']' ? ')' : ch;
      rawTokens.push({ type: mapped, pos: i });
      i += 1;
      continue;
    }
    throw typedError(SyntaxError, `Carácter no reconocido: '${ch}'.`, 'unexpected_character', i);
  }

  // Insert implicit multiplication tokens
  const tokens = [];
  const isValueEnd = (t) => t && (t.type === 'number' || t.type === 'variable' || t.type === ')');
  const isValueStart = (t) => t && (t.type === 'number' || t.type === 'variable' || t.type === '(' || t.type === 'func');

  for (let k = 0; k < rawTokens.length; k++) {
    const cur = rawTokens[k];
    const prev = tokens[tokens.length - 1];
    if (prev && isValueEnd(prev) && isValueStart(cur)) {
      tokens.push({ type: '*', pos: cur.pos });
    }
    tokens.push(cur);
  }

  return tokens;
}

export function parsePolyAst(tokens) {
  let cursor = 0;
  const peek = () => tokens[cursor] || null;
  const consume = () => tokens[cursor++];

  function parseExpression() {
    let node = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume();
      const right = parseTerm();
      node = { type: 'binary', op: op.type, left: node, right, pos: op.pos };
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = consume();
      const right = parseUnary();
      node = { type: 'binary', op: op.type, left: node, right, pos: op.pos };
    }
    return node;
  }

  function parseUnary() {
    if (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume();
      const arg = parseUnary();
      return op.type === '-' ? { type: 'unary', op: '-', arg, pos: op.pos } : arg;
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePrimary();
    if (peek() && peek().type === '^') {
      const op = consume();
      const exponent = parseUnary();
      return { type: 'binary', op: '^', left: base, right: exponent, pos: op.pos };
    }
    return base;
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) {
      throw typedError(SyntaxError, 'La expresión terminó de forma inesperada.', 'unexpected_end');
    }
    if (tok.type === 'number') {
      consume();
      return { type: 'number', value: tok.value, raw: tok.raw, pos: tok.pos };
    }
    if (tok.type === 'variable') {
      consume();
      return { type: 'variable', name: tok.name, pos: tok.pos };
    }
    if (tok.type === 'func') {
      consume();
      const next = peek();
      if (!next || next.type !== '(') {
        throw typedError(SyntaxError, `Se esperaba '(' después de ${tok.name}.`, 'missing_paren', tok.pos);
      }
      consume();
      const arg = parseExpression();
      const close = peek();
      if (!close || close.type !== ')') {
        throw typedError(SyntaxError, 'Falta cerrar un paréntesis.', 'unclosed_paren', tok.pos);
      }
      consume();
      return { type: 'func', name: tok.name, arg, pos: tok.pos };
    }
    if (tok.type === '(') {
      consume();
      const expr = parseExpression();
      const close = peek();
      if (!close || close.type !== ')') {
        throw typedError(SyntaxError, 'Falta cerrar un paréntesis.', 'unclosed_paren', tok.pos);
      }
      consume();
      return expr;
    }
    throw typedError(SyntaxError, `Token inesperado '${tok.type}'.`, 'unexpected_token', tok.pos);
  }

  const ast = parseExpression();
  if (cursor < tokens.length) {
    const extra = tokens[cursor];
    throw typedError(SyntaxError, `Símbolo inesperado '${extra.type}'.`, 'unexpected_token', extra.pos);
  }
  return ast;
}

function collectVariables(ast, set = new Set()) {
  if (!ast || typeof ast !== 'object') return set;
  if (ast.type === 'variable') set.add(ast.name);
  else if (ast.type === 'unary' || ast.type === 'func') collectVariables(ast.arg, set);
  else if (ast.type === 'binary') {
    collectVariables(ast.left, set);
    collectVariables(ast.right, set);
  }
  return set;
}

/**
 * Evaluates a parsed AST numerically at x (for plotting and irrational-coefficient fallback).
 */
export function evalPolyAstNumber(ast, xVal) {
  if (!ast) return NaN;
  if (ast.type === 'number') return ast.value;
  if (ast.type === 'variable') return xVal;
  if (ast.type === 'unary') return -evalPolyAstNumber(ast.arg, xVal);
  if (ast.type === 'func') {
    const a = evalPolyAstNumber(ast.arg, xVal);
    if (ast.name === 'sqrt') return a < 0 ? NaN : Math.sqrt(a);
    return NaN;
  }
  if (ast.type === 'binary') {
    const l = evalPolyAstNumber(ast.left, xVal);
    const r = evalPolyAstNumber(ast.right, xVal);
    if (ast.op === '+') return l + r;
    if (ast.op === '-') return l - r;
    if (ast.op === '*') return l * r;
    if (ast.op === '/') return r === 0 ? NaN : l / r;
    if (ast.op === '^') return Math.pow(l, r);
  }
  return NaN;
}

/**
 * Expands a polynomial AST to an exact Rational[] over Q[x], rejecting
 * non-polynomial constructs with typed SyntaxErrors.
 */
export function expandAstToExactPoly(ast) {
  if (!ast) throw typedError(SyntaxError, 'AST vacío.', 'empty');

  if (ast.type === 'number') {
    return normalizePoly([ratFromNumber(ast.raw ?? ast.value)]);
  }
  if (ast.type === 'variable') {
    return Object.freeze([rat(0), rat(1)]);
  }
  if (ast.type === 'unary') {
    return polyNeg(expandAstToExactPoly(ast.arg));
  }
  if (ast.type === 'func') {
    if (ast.name === 'sqrt') {
      const innerVars = collectVariables(ast.arg);
      if (innerVars.size > 0) {
        throw typedError(
          SyntaxError,
          'No es un polinomio: la variable aparece dentro de una raíz.',
          'radical_on_variable',
          ast.pos
        );
      }
      const innerPoly = expandAstToExactPoly(ast.arg);
      const val = innerPoly.length === 0 ? rat(0) : innerPoly[0];
      if (val.n < 0) {
        throw typedError(SyntaxError, 'Raíz cuadrada de un número negativo en ℝ.', 'negative_radicand', ast.pos);
      }
      const rn = Math.round(Math.sqrt(val.n));
      const rd = Math.round(Math.sqrt(val.d));
      if (rn * rn === val.n && rd * rd === val.d) {
        return normalizePoly([rat(rn, rd)]);
      }
      throw typedError(
        SyntaxError,
        'Raíz irracional no exacta en Q[x].',
        'irrational_constant',
        ast.pos
      );
    }
  }
  if (ast.type === 'binary') {
    if (ast.op === '+') return polyAdd(expandAstToExactPoly(ast.left), expandAstToExactPoly(ast.right));
    if (ast.op === '-') return polySub(expandAstToExactPoly(ast.left), expandAstToExactPoly(ast.right));
    if (ast.op === '*') return polyMul(expandAstToExactPoly(ast.left), expandAstToExactPoly(ast.right));
    if (ast.op === '/') {
      const numPoly = expandAstToExactPoly(ast.left);
      const denPoly = expandAstToExactPoly(ast.right);
      if (denPoly.length === 0) {
        throw typedError(SyntaxError, 'División por cero en la expresión.', 'division_by_zero', ast.pos);
      }
      if (denPoly.length > 1) {
        throw typedError(
          SyntaxError,
          'No es un polinomio: la variable aparece en el divisor (expresión racional).',
          'rational_expression',
          ast.pos
        );
      }
      return polyScale(numPoly, ratInv(denPoly[0]));
    }
    if (ast.op === '^') {
      const expVars = collectVariables(ast.right);
      if (expVars.size > 0) {
        throw typedError(
          SyntaxError,
          'No es un polinomio: la variable aparece en el exponente.',
          'variable_exponent',
          ast.pos
        );
      }
      const expPoly = expandAstToExactPoly(ast.right);
      const expRat = expPoly.length === 0 ? rat(0) : expPoly[0];
      if (!isIntRat(expRat)) {
        throw typedError(
          SyntaxError,
          'No es un polinomio: exponente fraccionario.',
          'fractional_exponent',
          ast.pos
        );
      }
      if (expRat.n < 0) {
        throw typedError(
          SyntaxError,
          'No es un polinomio: exponente negativo.',
          'negative_exponent',
          ast.pos
        );
      }
      if (expRat.n > 20) {
        throw typedError(
          SyntaxError,
          'El exponente supera el límite permitido (20).',
          'exponent_too_large',
          ast.pos
        );
      }
      const basePoly = expandAstToExactPoly(ast.left);
      return polyPow(basePoly, expRat.n);
    }
  }

  throw typedError(SyntaxError, 'Operación no soportada en polinomios.', 'unsupported_op');
}

/**
 * Parses a polynomial expression string into exact Rational[] coefficients and structural metadata.
 * Rejects non-polynomial expressions (x^-2, x^(1/2), sqrt(x), 5/(3x-1)) with typed SyntaxErrors.
 */
export function parsePolynomialExpr(input, { variable = 'x', allowAnySingleVar = true } = {}) {
  const tokens = tokenizePolyExpr(input);
  const ast = parsePolyAst(tokens);
  const vars = collectVariables(ast);

  if (vars.size > 1) {
    throw typedError(
      SyntaxError,
      `Se esperaba un polinomio en una sola variable, pero aparecieron: ${Array.from(vars).join(', ')}.`,
      'unexpected_variable'
    );
  }
  if (!allowAnySingleVar && vars.size === 1 && !vars.has(variable)) {
    throw typedError(
      SyntaxError,
      `Usá la variable '${variable}' en lugar de '${Array.from(vars)[0]}'.`,
      'unexpected_variable'
    );
  }

  const detectedVar = vars.size === 1 ? Array.from(vars)[0] : variable;
  const coeffs = expandAstToExactPoly(ast);
  const inspected = inspectPolynomial(coeffs);

  return {
    ok: true,
    coeffs,
    degree: inspected.degree,
    variable: detectedVar,
    ast,
    isZero: inspected.isZero,
    inspected,
    formatted: formatPoly(coeffs, { variable: detectedVar }),
  };
}
