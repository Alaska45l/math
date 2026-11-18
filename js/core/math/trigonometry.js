/**
 * @file js/core/math/trigonometry.js
 * Pure, UI-independent exact & approximate trigonometry engine shared across
 * Unit 10 (razones-trigonometricas), Unit 11 (funciones-trigonometricas),
 * and Global Simulacro (simulacro-global).
 *
 * Implements Contract 5 & stage_e_blueprint.md §1:
 * - Exact { n, d } rational arithmetic (reusing ./polynomials.js)
 * - Exact PiAngle (rat * pi) & square-free ExactRadical (coeff * sqrt(R))
 * - Sexagesimal (deg/min/sec) <-> decimal degrees <-> exact pi-multiples & radians
 * - Arc length s = r * theta
 * - Congruence classes C_alpha with principal representatives in [0; 2pi) and [0°; 360°)
 * - Special angles, quadrant classification & reduction to QI
 * - Distinct specs, evaluators, domains, poles, images, zeros & periods for all 6 functions
 * - Periodic & quadratic trigonometric equation solvers with pole filtering
 *
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

import {
  MINUS_CHAR,
  gcdInt,
  lcmInt,
  rat,
  ratFromNumber,
  parseRational,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratInv,
  ratAbs,
  ratPow,
  ratCompare,
  ratEq,
  isZeroRat,
  isOneRat,
  isMinusOneRat,
  isIntRat,
  ratToNumber,
  ratToString,
} from './polynomials.js';

export {
  MINUS_CHAR,
  gcdInt,
  lcmInt,
  rat,
  ratFromNumber,
  parseRational,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratInv,
  ratAbs,
  ratPow,
  ratCompare,
  ratEq,
  isZeroRat,
  isOneRat,
  isMinusOneRat,
  isIntRat,
  ratToNumber,
  ratToString,
};

export const TAU = 2 * Math.PI;
export const PI_CHAR = '\u03C0';
export const SQRT_CHAR = '\u221A';
export const EMPTY_SET_CHAR = '\u2205';

const FN_ALIASES = Object.freeze({
  sin: 'sin',
  sen: 'sin',
  cos: 'cos',
  tan: 'tan',
  tg: 'tan',
  csc: 'csc',
  cosec: 'csc',
  sec: 'sec',
  cot: 'cot',
  cotg: 'cot',
});

export function normalizeTrigFnName(fnName) {
  const key = String(fnName || '').trim().toLowerCase();
  const canonical = FN_ALIASES[key];
  if (!canonical) {
    throw new TypeError(`Función trigonométrica desconocida: "${fnName}"`);
  }
  return canonical;
}

/* ============================================================================
 * 1. Exact Quadratic Radicals (coeff * sqrt(R), square-free R >= 1)
 * ========================================================================== */

/**
 * Decomposes integer n >= 0 as sqrt(n) = outside * sqrt(inside) with square-free inside.
 */
export function simplifySquareRoot(n) {
  const val = Number(n);
  if (!Number.isInteger(val) || val < 0) {
    throw new RangeError('simplifySquareRoot requiere un entero no negativo.');
  }
  if (val === 0) return Object.freeze({ outside: 0, inside: 1 });
  if (val === 1) return Object.freeze({ outside: 1, inside: 1 });

  let outside = 1;
  let rem = val;
  while (rem % 4 === 0) {
    outside *= 2;
    rem /= 4;
  }
  for (let f = 3; f * f <= rem; f += 2) {
    const sq = f * f;
    while (rem % sq === 0) {
      outside *= f;
      rem /= sq;
    }
  }
  return Object.freeze({ outside, inside: rem });
}

export function fmtExactRadical(er) {
  if (!er || er.coeff?.n === 0 || er.radicand === 0) return '0';
  const c = er.coeff;
  const r = er.radicand;
  if (r === 1) {
    return ratToString(c);
  }
  const sign = c.n < 0 ? MINUS_CHAR : '';
  const absN = Math.abs(c.n);
  const radPart = `${SQRT_CHAR}${r}`;
  const numStr = absN === 1 ? radPart : `${absN}${radPart}`;
  if (c.d === 1) return `${sign}${numStr}`;
  return `${sign}${numStr}/${c.d}`;
}

/**
 * Constructs an exact normalized quadratic radical (coeff * sqrt(radicand)).
 */
export function exactRadical(coeffInput = 1, radicand = 1) {
  const c = parseRational(coeffInput);
  const radInt = Number(radicand);
  if (!Number.isInteger(radInt) || radInt < 0) {
    throw new RangeError('El radicando debe ser un entero no negativo.');
  }
  if (c.n === 0 || radInt === 0) {
    const zeroRat = rat(0, 1);
    return Object.freeze({
      kind: 'radical',
      defined: true,
      coeff: zeroRat,
      rat: zeroRat,
      radicand: 1,
      sign: 1,
      num: 0,
      isRational: true,
      formatted: '0',
    });
  }
  const { outside, inside } = simplifySquareRoot(radInt);
  const normCoeff = ratMul(c, rat(outside, 1));
  const num = ratToNumber(normCoeff) * Math.sqrt(inside);
  const base = {
    kind: 'radical',
    defined: true,
    coeff: normCoeff,
    rat: normCoeff,
    radicand: inside,
    sign: normCoeff.n < 0 ? -1 : 1,
    num,
    isRational: inside === 1,
    formatted: '',
  };
  base.formatted = fmtExactRadical(base);
  return Object.freeze(base);
}

export function exactRadicalFromRatSqrt(radRatInput, sign = 1) {
  const rr = parseRational(radRatInput);
  if (rr.n < 0) {
    throw new RangeError('No existe raíz cuadrada real de un número negativo.');
  }
  if (rr.n === 0) return exactRadical(0, 1);
  // sqrt(n / d) = sqrt(n * d) / d
  const s = sign < 0 ? -1 : 1;
  return exactRadical(rat(s, rr.d), rr.n * rr.d);
}

export function exactRadicalNeg(er) {
  if (!er) return null;
  return exactRadical(ratNeg(er.coeff), er.radicand);
}

export function exactRadicalMul(a, b) {
  const ea = typeof a === 'object' && a.kind === 'radical' ? a : parseExactRadical(a);
  const eb = typeof b === 'object' && b.kind === 'radical' ? b : parseExactRadical(b);
  return exactRadical(ratMul(ea.coeff, eb.coeff), ea.radicand * eb.radicand);
}

export function exactRadicalInv(er) {
  if (!er || er.coeff.n === 0) {
    throw new RangeError('No se puede invertir cero.');
  }
  // 1 / (c * sqrt(r)) = sqrt(r) / (c * r)
  const newCoeff = ratDiv(rat(1, 1), ratMul(er.coeff, rat(er.radicand, 1)));
  return exactRadical(newCoeff, er.radicand);
}

export function exactRadicalDiv(a, b) {
  const ea = typeof a === 'object' && a.kind === 'radical' ? a : parseExactRadical(a);
  const eb = typeof b === 'object' && b.kind === 'radical' ? b : parseExactRadical(b);
  if (eb.coeff.n === 0) {
    throw new RangeError('División por cero en radicales.');
  }
  return exactRadicalMul(ea, exactRadicalInv(eb));
}

export function exactRadicalEq(a, b) {
  if (!a || !b) return false;
  const ea = a.kind === 'radical' ? a : parseExactRadical(a);
  const eb = b.kind === 'radical' ? b : parseExactRadical(b);
  return ratEq(ea.coeff, eb.coeff) && ea.radicand === eb.radicand;
}

/**
 * Parses strings like "√2/2", "-4√7/7", "sqrt(3)/3", "1/2", "-0.5", "2*sqrt(5)".
 */
export function parseExactRadical(input) {
  if (input && typeof input === 'object' && input.kind === 'radical') {
    return input;
  }
  if (typeof input === 'number') {
    return exactRadical(ratFromNumber(input), 1);
  }
  if (input && typeof input === 'object' && 'n' in input && 'd' in input) {
    return exactRadical(rat(input.n, input.d), 1);
  }
  if (typeof input !== 'string') {
    throw new SyntaxError('Formato de radical inválido.');
  }
  let s = input.trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, '')
    .replace(/\u221A/g, 'sqrt');

  if (!s) throw new SyntaxError('Expresión vacía.');

  // Strip outer redundant parens
  while (s.startsWith('(') && s.endsWith(')')) {
    const inner = s.slice(1, -1);
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '(') depth++;
      else if (inner[i] === ')') depth--;
      if (depth < 0) { balanced = false; break; }
    }
    if (balanced && depth === 0) s = inner;
    else break;
  }

  if (!s.includes('sqrt')) {
    return exactRadical(parseRational(s), 1);
  }

  // Handle "num / den" where sqrt can be in num or den
  // Split at top-level '/'
  let slashIdx = -1;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    else if (s[i] === '/' && depth === 0) {
      if (slashIdx !== -1) throw new SyntaxError('Múltiples divisiones no soportadas.');
      slashIdx = i;
    }
  }

  const parseTerm = (part) => {
    let p = part.trim();
    while (p.startsWith('(') && p.endsWith(')')) p = p.slice(1, -1);
    if (!p.includes('sqrt')) {
      return exactRadical(parseRational(p), 1);
    }
    const m = p.match(/^([+-]?(?:\d+(?:\.\d+)?)?)?\*?sqrt\(?(\d+)\)?$/i);
    if (!m) {
      // Also support sqrt(R) * coeff
      const m2 = p.match(/^([+-]?)\*?sqrt\(?(\d+)\)?\*([+-]?\d+(?:\.\d+)?)$/i);
      if (m2) {
        const sign = m2[1] === '-' ? -1 : 1;
        return exactRadical(ratMul(rat(sign, 1), parseRational(m2[3])), Number(m2[2]));
      }
      throw new SyntaxError(`Formato radical no reconocido: "${part}"`);
    }
    let prefix = m[1] || '';
    let coeff = rat(1, 1);
    if (prefix === '-') coeff = rat(-1, 1);
    else if (prefix === '+' || prefix === '') coeff = rat(1, 1);
    else coeff = parseRational(prefix);
    return exactRadical(coeff, Number(m[2]));
  };

  if (slashIdx === -1) {
    return parseTerm(s);
  }
  const numTerm = parseTerm(s.slice(0, slashIdx));
  const denTerm = parseTerm(s.slice(slashIdx + 1));
  return exactRadicalDiv(numTerm, denTerm);
}

/* ============================================================================
 * 2. Exact Pi-Multiples (PiAngle) & Sexagesimal <-> Circular Conversions
 * ========================================================================== */

export function formatPiRat(piRatInput) {
  const r = parseRational(piRatInput);
  if (r.n === 0) return '0';
  const sign = r.n < 0 ? MINUS_CHAR : '';
  const absN = Math.abs(r.n);
  const numStr = absN === 1 ? PI_CHAR : `${absN}${PI_CHAR}`;
  if (r.d === 1) return `${sign}${numStr}`;
  return `${sign}${numStr}/${r.d}`;
}

export function piAngle(ratInput) {
  const r = parseRational(ratInput);
  return Object.freeze({
    kind: 'pi',
    rat: r,
    rad: ratToNumber(r) * Math.PI,
    formatted: formatPiRat(r),
  });
}

/**
 * Converts signed decimal degrees into DMS with safe carry rounding overflow.
 */
export function degToDms(deg, { precisionSec = 2, omitZeroSec = false } = {}) {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) {
    throw new TypeError('degToDms requiere un número finito en grados.');
  }
  const sign = deg < 0 ? -1 : 1;
  const absDeg = Math.abs(deg);
  const scale = 10 ** Math.max(0, precisionSec);

  // Convert directly to total arcseconds rounded to precisionSec to prevent 60" / 60' overflow
  const totalArcSec = Math.round(absDeg * 3600 * scale) / scale;
  const totalSecInt = Math.floor(totalArcSec + 1e-12);
  let sec = Number((totalArcSec - totalSecInt + (totalSecInt % 60)).toFixed(precisionSec));
  let totalMin = Math.floor(totalSecInt / 60);

  if (sec >= 60 - 1e-12) {
    sec = 0;
    totalMin += 1;
  }

  let min = totalMin % 60;
  let d = Math.floor(totalMin / 60);
  if (min >= 60) {
    min -= 60;
    d += 1;
  }

  const normalizedSign = d === 0 && min === 0 && sec === 0 ? 1 : sign;
  const signPrefix = normalizedSign < 0 ? MINUS_CHAR : '';
  const secStr = Number.isInteger(sec) ? String(sec) : String(sec).replace('.', ',');
  const formatted =
    omitZeroSec && sec === 0
      ? `${signPrefix}${d}° ${min}'`
      : `${signPrefix}${d}° ${min}' ${secStr}"`;

  return Object.freeze({
    sign: normalizedSign,
    deg: d,
    min,
    sec,
    totalArcSec: normalizedSign * totalArcSec,
    formatted,
  });
}

/**
 * Converts DMS { sign, deg, min, sec } into exact rational and decimal degrees.
 */
export function dmsToDeg(
  { sign = 1, deg = 0, min = 0, sec = 0 } = {},
  { strictRange = true } = {}
) {
  const dVal = Number(deg);
  const mVal = Number(min);
  const sVal = Number(sec);
  if (!Number.isFinite(dVal) || !Number.isFinite(mVal) || !Number.isFinite(sVal)) {
    throw new TypeError('dmsToDeg requiere componentes numéricos finitos.');
  }
  if (strictRange) {
    if (mVal < 0 || sVal < 0 || mVal >= 60 || sVal >= 60) {
      throw new RangeError('Minutos y segundos deben estar en [0; 60).');
    }
  }
  const effSign = dVal < 0 ? -1 : (sign < 0 ? -1 : 1);
  const absDeg = Math.abs(dVal);

  const degRatAbs = ratAdd(
    ratFromNumber(absDeg),
    ratAdd(
      ratDiv(ratFromNumber(mVal), rat(60, 1)),
      ratDiv(ratFromNumber(sVal), rat(3600, 1))
    )
  );
  const degRat = effSign < 0 ? ratNeg(degRatAbs) : degRatAbs;
  const decimalDeg = ratToNumber(degRat);

  return Object.freeze({
    sign: degRat.n < 0 ? -1 : 1,
    deg: decimalDeg,
    rat: degRat,
    formatted: `${decimalDeg < 0 ? MINUS_CHAR : ''}${Math.abs(decimalDeg)}°`,
  });
}

/**
 * Parses an angle string or object into unified { system, exactPi, exactDegRat, deg, rad }.
 * Supports: "30°", "120° 30'", "53° 7' 48\"", "-270°", "7π/4", "-3pi/2", "3 rad", "2,103", "30'".
 * Zero eval.
 */
export function parseAngleInput(raw, { defaultSystem = null } = {}) {
  if (raw && typeof raw === 'object') {
    if (raw.kind === 'pi' && raw.rat) {
      const r = parseRational(raw.rat);
      const degRat = ratMul(r, rat(180, 1));
      return Object.freeze({
        system: 'rad',
        exactPi: r,
        exactDegRat: degRat,
        deg: ratToNumber(degRat),
        rad: ratToNumber(r) * Math.PI,
      });
    }
    if ('n' in raw && 'd' in raw) {
      const r = rat(raw.n, raw.d);
      if (defaultSystem === 'deg') {
        const piRat = ratDiv(r, rat(180, 1));
        return Object.freeze({
          system: 'deg',
          exactPi: piRat,
          exactDegRat: r,
          deg: ratToNumber(r),
          rad: ratToNumber(piRat) * Math.PI,
        });
      }
      const degRat = ratMul(r, rat(180, 1));
      return Object.freeze({
        system: 'rad',
        exactPi: r,
        exactDegRat: degRat,
        deg: ratToNumber(degRat),
        rad: ratToNumber(r) * Math.PI,
      });
    }
    if ('deg' in raw || 'min' in raw || 'sec' in raw) {
      const conv = dmsToDeg(raw);
      const piRat = ratDiv(conv.rat, rat(180, 1));
      return Object.freeze({
        system: 'deg',
        exactPi: piRat,
        exactDegRat: conv.rat,
        deg: conv.deg,
        rad: ratToNumber(piRat) * Math.PI,
      });
    }
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      throw new TypeError('El ángulo debe ser finito.');
    }
    if (defaultSystem === 'deg') {
      const degRat = ratFromNumber(raw);
      const piRat = ratDiv(degRat, rat(180, 1));
      return Object.freeze({
        system: 'deg',
        exactPi: piRat,
        exactDegRat: degRat,
        deg: raw,
        rad: (raw * Math.PI) / 180,
      });
    }
    return Object.freeze({
      system: 'rad',
      exactPi: raw === 0 ? rat(0, 1) : null,
      exactDegRat: raw === 0 ? rat(0, 1) : null,
      deg: (raw * 180) / Math.PI,
      rad: raw,
    });
  }

  if (typeof raw !== 'string') {
    throw new SyntaxError('Entrada de ángulo inválida.');
  }

  let s = raw.trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[\u2019\u2032\u00B4]/g, "'")
    .replace(/[\u201D\u2033]/g, '"')
    .replace(/\s+/g, ' ');

  if (!s) throw new SyntaxError('Ángulo vacío.');

  // 1. Check DMS or degrees (° / ' / ")
  if (s.includes('°') || s.includes('º') || s.includes("'") || s.includes('"')) {
    const clean = s.replace(/º/g, '°');
    const signMatch = clean.match(/^\s*([+-]?)\s*(.*)$/);
    const sign = signMatch && signMatch[1] === '-' ? -1 : 1;
    const rest = (signMatch ? signMatch[2] : clean).trim();

    const dMatch = rest.match(/(\d+(?:\.\d+)?)\s*°/);
    const mMatch = rest.match(/(\d+(?:\.\d+)?)\s*'/);
    const sMatch = rest.match(/(\d+(?:\.\d+)?)\s*"/);

    if (!dMatch && !mMatch && !sMatch) {
      throw new SyntaxError(`Formato sexagesimal inválido: "${raw}"`);
    }
    const degVal = dMatch ? Number(dMatch[1]) : 0;
    const minVal = mMatch ? Number(mMatch[1]) : 0;
    const secVal = sMatch ? Number(sMatch[1]) : 0;
    const conv = dmsToDeg({ sign, deg: degVal, min: minVal, sec: secVal });
    const piRat = ratDiv(conv.rat, rat(180, 1));
    return Object.freeze({
      system: 'deg',
      exactPi: piRat,
      exactDegRat: conv.rat,
      deg: conv.deg,
      rad: ratToNumber(piRat) * Math.PI,
    });
  }

  // 2. Check pi multiples ("7π/4", "-3pi/2", "pi", "-2*pi/3")
  const normPi = s.replace(/\s+/g, '').replace(/pi/gi, PI_CHAR);
  if (normPi.includes(PI_CHAR)) {
    const slashParts = normPi.split('/');
    if (slashParts.length > 2) {
      throw new SyntaxError(`Múltiples '/' en expresión de ángulo: "${raw}"`);
    }
    const numPart = slashParts[0];
    const denPart = slashParts.length === 2 ? slashParts[1] : '1';
    if (denPart.includes(PI_CHAR)) {
      throw new SyntaxError(`π no puede estar en el denominador: "${raw}"`);
    }
    const denRat = parseRational(denPart);
    const coeffMatch = numPart.match(/^([+-]?(?:\d+(?:\.\d+)?)?)\*?π$/);
    let coeffRat;
    if (coeffMatch) {
      const cStr = coeffMatch[1];
      if (cStr === '' || cStr === '+') coeffRat = rat(1, 1);
      else if (cStr === '-') coeffRat = rat(-1, 1);
      else coeffRat = parseRational(cStr);
    } else {
      // Also accept "π * 3"
      const mAfter = numPart.match(/^([+-]?)\*?π\*([+-]?\d+(?:\.\d+)?)$/);
      if (!mAfter) throw new SyntaxError(`Múltiplo de π inválido: "${raw}"`);
      const sign = mAfter[1] === '-' ? -1 : 1;
      coeffRat = ratMul(rat(sign, 1), parseRational(mAfter[2]));
    }
    const piRat = ratDiv(coeffRat, denRat);
    const degRat = ratMul(piRat, rat(180, 1));
    return Object.freeze({
      system: 'rad',
      exactPi: piRat,
      exactDegRat: degRat,
      deg: ratToNumber(degRat),
      rad: ratToNumber(piRat) * Math.PI,
    });
  }

  // 3. Radians (e.g. "3 rad", "2.103", "-1/2")
  const strippedRad = s.replace(/\s*rad(?:ianes|s)?\.?\s*$/i, '').trim();
  const rNum = parseRational(strippedRad);
  const val = ratToNumber(rNum);
  if (defaultSystem === 'deg') {
    const piRat = ratDiv(rNum, rat(180, 1));
    return Object.freeze({
      system: 'deg',
      exactPi: piRat,
      exactDegRat: rNum,
      deg: val,
      rad: ratToNumber(piRat) * Math.PI,
    });
  }
  return Object.freeze({
    system: 'rad',
    exactPi: rNum.n === 0 ? rat(0, 1) : null,
    exactDegRat: rNum.n === 0 ? rat(0, 1) : null,
    deg: (val * 180) / Math.PI,
    rad: val,
  });
}

/**
 * Exact conversion from degrees (number, Rational, DMS object, or string) to exact pi-multiple.
 */
export function degToRadExact(degInput) {
  const parsed = parseAngleInput(degInput, { defaultSystem: 'deg' });
  if (!parsed.exactDegRat) {
    throw new TypeError('degToRadExact requiere un ángulo racional o sexagesimal exacto.');
  }
  const piRat = ratDiv(parsed.exactDegRat, rat(180, 1));
  return Object.freeze({
    degRat: parsed.exactDegRat,
    piRat,
    formattedPi: formatPiRat(piRat),
    rad: ratToNumber(piRat) * Math.PI,
  });
}

/**
 * Exact conversion from pi-multiple { n, d } (or string like "7π/4") to degrees & DMS.
 */
export function radExactToDeg(piRatInput) {
  let piRat;
  if (typeof piRatInput === 'string') {
    const parsed = parseAngleInput(piRatInput, { defaultSystem: 'rad' });
    if (!parsed.exactPi) throw new TypeError('Se requiere un múltiplo exacto de π.');
    piRat = parsed.exactPi;
  } else if (piRatInput && typeof piRatInput === 'object' && piRatInput.kind === 'pi') {
    piRat = parseRational(piRatInput.rat);
  } else {
    piRat = parseRational(piRatInput);
  }
  const degRat = ratMul(piRat, rat(180, 1));
  const deg = ratToNumber(degRat);
  const dms = degToDms(deg, { precisionSec: 0, omitZeroSec: true });
  const formatted = degRat.d === 1 ? `${ratToString(degRat)}°` : dms.formatted;
  return Object.freeze({
    piRat,
    degRat,
    deg,
    dms,
    formatted,
  });
}

/**
 * Approximate radian-to-degree conversion returning { deg, dms, formatted }.
 */
export function radToDeg(rad, { precisionSec = 0 } = {}) {
  if (typeof rad !== 'number' || !Number.isFinite(rad)) {
    throw new TypeError('radToDeg requiere un número finito.');
  }
  const deg = (rad * 180) / Math.PI;
  const dms = degToDms(deg, { precisionSec });
  return Object.freeze({
    deg,
    dms,
    formatted: dms.formatted,
  });
}

/**
 * Numeric degree-to-radian conversion for trig math helpers.
 */
export function degToRad(deg) {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) {
    throw new TypeError('degToRad requiere un número finito.');
  }
  return (deg * Math.PI) / 180;
}

/**
 * Computes arc length s = r * theta_rad, preserving exact pi-multiples when possible.
 */
export function arcLength({ r, angleDeg = null, angleRad = null, piRat = null, angle = null } = {}) {
  const radius = typeof r === 'number' ? r : ratToNumber(parseRational(r));
  if (!Number.isFinite(radius) || radius < 0) {
    throw new RangeError('El radio debe ser un número no negativo.');
  }
  let parsed;
  if (piRat !== null && piRat !== undefined) {
    parsed = parseAngleInput({ kind: 'pi', rat: parseRational(piRat) });
  } else if (angleDeg !== null && angleDeg !== undefined) {
    parsed = parseAngleInput(angleDeg, { defaultSystem: 'deg' });
  } else if (angleRad !== null && angleRad !== undefined) {
    parsed = parseAngleInput(angleRad, { defaultSystem: 'rad' });
  } else if (angle !== null && angle !== undefined) {
    parsed = parseAngleInput(angle);
  } else {
    throw new TypeError('Se debe especificar un ángulo (piRat, angleDeg, angleRad o angle).');
  }

  let sPiRat = null;
  let formattedS = null;
  let sNum;
  if (parsed.exactPi) {
    const rRat = ratFromNumber(radius);
    sPiRat = ratMul(rRat, parsed.exactPi);
    sNum = ratToNumber(sPiRat) * Math.PI;
    formattedS = formatPiRat(sPiRat);
  } else {
    sNum = radius * parsed.rad;
    formattedS = String(Number(sNum.toFixed(4))).replace('.', ',').replace('-', MINUS_CHAR);
  }

  return Object.freeze({
    r: radius,
    thetaRad: parsed.rad,
    piRat: parsed.exactPi,
    s: sNum,
    sPiRat,
    formattedS,
  });
}

/**
 * Solves for the missing dimension among (r, s, angle) in s = r * theta_rad.
 */
export function solveArcDimension({ r = null, s = null, angle = null } = {}) {
  const hasR = r !== null && r !== undefined;
  const hasS = s !== null && s !== undefined;
  const hasA = angle !== null && angle !== undefined;
  if ([hasR, hasS, hasA].filter(Boolean).length !== 2) {
    throw new TypeError('solveArcDimension requiere exactamente dos de los tres parámetros (r, s, angle).');
  }
  if (!hasS) {
    return arcLength({ r, angle });
  }
  const sVal = typeof s === 'number' ? s : ratToNumber(parseRational(s));
  if (!hasR) {
    const parsed = parseAngleInput(angle, { defaultSystem: 'rad' });
    if (Math.abs(parsed.rad) < 1e-15) throw new RangeError('El ángulo no puede ser cero al despejar el radio.');
    const rVal = sVal / parsed.rad;
    return Object.freeze({
      r: rVal,
      s: sVal,
      thetaRad: parsed.rad,
      piRat: parsed.exactPi,
    });
  }
  const rVal = typeof r === 'number' ? r : ratToNumber(parseRational(r));
  if (rVal <= 0) throw new RangeError('El radio debe ser positivo.');
  const thetaRad = sVal / rVal;
  const degInfo = radToDeg(thetaRad);
  return Object.freeze({
    r: rVal,
    s: sVal,
    thetaRad,
    deg: degInfo.deg,
    dms: degInfo.dms,
  });
}

/* ============================================================================
 * 3. Congruence & Classes C_alpha
 * ========================================================================== */

export function principalRepDegRat(degRatInput) {
  const r = parseRational(degRatInput);
  const span = 360 * r.d;
  const rem = ((r.n % span) + span) % span;
  const turnsK = (r.n - rem) / span;
  const repRat = rat(rem, r.d);
  const rep = ratToNumber(repRat);
  const formatted =
    repRat.d === 1
      ? `${rep}°`
      : degToDms(rep, { precisionSec: 0, omitZeroSec: true }).formatted;
  return Object.freeze({
    repRat,
    rep,
    turnsK,
    interval: '[0°; 360°)',
    formatted,
  });
}

export function principalRepDeg(deg) {
  if (typeof deg !== 'number' || !Number.isFinite(deg)) {
    throw new TypeError('principalRepDeg requiere un número finito.');
  }
  if (Number.isInteger(deg)) {
    const r = principalRepDegRat(rat(deg, 1));
    return Object.freeze({
      rep: r.rep,
      turnsK: r.turnsK,
      interval: '[0°; 360°)',
      formatted: r.formatted,
    });
  }
  let turnsK = Math.floor((deg + 1e-12) / 360);
  let rep = deg - turnsK * 360;
  if (rep >= 360 - 1e-12 || rep < 1e-12) {
    if (rep >= 360 - 1e-12) turnsK += 1;
    rep = 0;
  }
  if (Object.is(rep, -0)) rep = 0;
  return Object.freeze({
    rep,
    turnsK,
    interval: '[0°; 360°)',
    formatted: Number.isInteger(rep) ? `${rep}°` : degToDms(rep, { precisionSec: 0, omitZeroSec: true }).formatted,
  });
}

export function principalRepPi(piRatInput) {
  let r;
  if (typeof piRatInput === 'string') {
    const parsed = parseAngleInput(piRatInput, { defaultSystem: 'rad' });
    if (!parsed.exactPi) throw new TypeError('principalRepPi requiere un múltiplo exacto de π.');
    r = parsed.exactPi;
  } else if (piRatInput && typeof piRatInput === 'object' && piRatInput.kind === 'pi') {
    r = parseRational(piRatInput.rat);
  } else {
    r = parseRational(piRatInput);
  }
  const span = 2 * r.d;
  const rem = ((r.n % span) + span) % span;
  const turnsK = (r.n - rem) / span;
  const repRat = rat(rem, r.d);
  return Object.freeze({
    repRat,
    turnsK,
    repRad: ratToNumber(repRat) * Math.PI,
    interval: '[0; 2π)',
    formatted: formatPiRat(repRat),
  });
}

export function principalRepRad(rad) {
  if (typeof rad !== 'number' || !Number.isFinite(rad)) {
    throw new TypeError('principalRepRad requiere un número finito.');
  }
  let turnsK = Math.floor((rad + 1e-12) / TAU);
  let rep = rad - turnsK * TAU;
  if (rep >= TAU - 1e-12 || rep < 1e-12) {
    if (rep >= TAU - 1e-12) turnsK += 1;
    rep = 0;
  }
  if (Object.is(rep, -0)) rep = 0;
  return Object.freeze({
    rep,
    turnsK,
    interval: '[0; 2π)',
  });
}

/**
 * Mixed-system congruence check (deg, DMS, exact piRat, or radians).
 */
export function areCongruent(angleA, angleB, { tol = 1e-9 } = {}) {
  const a = parseAngleInput(angleA, { defaultSystem: 'rad' });
  const b = parseAngleInput(angleB, { defaultSystem: 'rad' });

  if (a.exactPi && b.exactPi) {
    const diff = ratSub(a.exactPi, b.exactPi);
    const turns = ratDiv(diff, rat(2, 1));
    const congruent = turns.d === 1;
    return Object.freeze({
      congruent,
      diffTurnsK: congruent ? turns.n : null,
      repA: principalRepPi(a.exactPi),
      repB: principalRepPi(b.exactPi),
    });
  }

  const diffRad = a.rad - b.rad;
  const kApprox = Math.round(diffRad / TAU);
  const residual = Math.abs(diffRad - kApprox * TAU);
  const congruent = residual < tol;
  return Object.freeze({
    congruent,
    diffTurnsK: congruent ? kApprox : null,
    repA: a.exactPi ? principalRepPi(a.exactPi) : principalRepRad(a.rad),
    repB: b.exactPi ? principalRepPi(b.exactPi) : principalRepRad(b.rad),
  });
}

export function formatCongruenceClass(angle, { system = 'rad' } = {}) {
  const parsed = parseAngleInput(angle, { defaultSystem: system });
  if (system === 'deg') {
    const rep = parsed.exactDegRat
      ? principalRepDegRat(parsed.exactDegRat)
      : principalRepDeg(parsed.deg);
    return `C_{${rep.formatted}}`;
  }
  if (parsed.exactPi) {
    const rep = principalRepPi(parsed.exactPi);
    const lbl = rep.formatted;
    return lbl.length === 1 ? `C_${lbl}` : `C_{${lbl}}`;
  }
  const repR = principalRepRad(parsed.rad);
  const txt = String(Number(repR.rep.toFixed(4))).replace('.', ',');
  return `C_{${txt}}`;
}

/* ============================================================================
 * 4. Special Angles, Quadrant Classification & Exact Radical Trig Solver
 * ========================================================================== */

const UNDEF_COS_ZERO = Object.freeze({ defined: false, value: null, reason: 'cos_zero', formatted: '\u2204' });
const UNDEF_SIN_ZERO = Object.freeze({ defined: false, value: null, reason: 'sin_zero', formatted: '\u2204' });

export const SPECIAL_ANGLES_Q1 = Object.freeze({
  '0': Object.freeze({
    piRat: rat(0, 1),
    deg: 0,
    sin: exactRadical(0, 1),
    cos: exactRadical(1, 1),
    tan: exactRadical(0, 1),
    csc: UNDEF_SIN_ZERO,
    sec: exactRadical(1, 1),
    cot: UNDEF_SIN_ZERO,
  }),
  'π/6': Object.freeze({
    piRat: rat(1, 6),
    deg: 30,
    sin: exactRadical(rat(1, 2), 1),
    cos: exactRadical(rat(1, 2), 3),
    tan: exactRadical(rat(1, 3), 3),
    csc: exactRadical(2, 1),
    sec: exactRadical(rat(2, 3), 3),
    cot: exactRadical(1, 3),
  }),
  'π/4': Object.freeze({
    piRat: rat(1, 4),
    deg: 45,
    sin: exactRadical(rat(1, 2), 2),
    cos: exactRadical(rat(1, 2), 2),
    tan: exactRadical(1, 1),
    csc: exactRadical(1, 2),
    sec: exactRadical(1, 2),
    cot: exactRadical(1, 1),
  }),
  'π/3': Object.freeze({
    piRat: rat(1, 3),
    deg: 60,
    sin: exactRadical(rat(1, 2), 3),
    cos: exactRadical(rat(1, 2), 1),
    tan: exactRadical(1, 3),
    csc: exactRadical(rat(2, 3), 3),
    sec: exactRadical(2, 1),
    cot: exactRadical(rat(1, 3), 3),
  }),
  'π/2': Object.freeze({
    piRat: rat(1, 2),
    deg: 90,
    sin: exactRadical(1, 1),
    cos: exactRadical(0, 1),
    tan: UNDEF_COS_ZERO,
    csc: exactRadical(1, 1),
    sec: UNDEF_COS_ZERO,
    cot: exactRadical(0, 1),
  }),
});

export const QUADRANT_SIGNS = Object.freeze({
  1: Object.freeze({ sin: 1, cos: 1, tan: 1, csc: 1, sec: 1, cot: 1 }),
  2: Object.freeze({ sin: 1, cos: -1, tan: -1, csc: 1, sec: -1, cot: -1 }),
  3: Object.freeze({ sin: -1, cos: -1, tan: 1, csc: -1, sec: -1, cot: 1 }),
  4: Object.freeze({ sin: -1, cos: 1, tan: -1, csc: -1, sec: 1, cot: -1 }),
});

/**
 * Classifies an angle into interior quadrant (1..4) or quadrantal axis (+X, +Y, -X, -Y).
 */
export function classifyQuadrant(angle) {
  const parsed = parseAngleInput(angle, { defaultSystem: 'rad' });

  if (parsed.exactPi) {
    const rep = principalRepPi(parsed.exactPi);
    const r = rep.repRat;
    if (ratEq(r, rat(0, 1))) {
      return Object.freeze({ quadrant: null, axis: '+X', repRad: 0, repDeg: 0, repPiRat: r, referenceAnglePi: rat(0, 1) });
    }
    if (ratEq(r, rat(1, 2))) {
      return Object.freeze({ quadrant: null, axis: '+Y', repRad: Math.PI / 2, repDeg: 90, repPiRat: r, referenceAnglePi: rat(1, 2) });
    }
    if (ratEq(r, rat(1, 1))) {
      return Object.freeze({ quadrant: null, axis: '-X', repRad: Math.PI, repDeg: 180, repPiRat: r, referenceAnglePi: rat(0, 1) });
    }
    if (ratEq(r, rat(3, 2))) {
      return Object.freeze({ quadrant: null, axis: '-Y', repRad: 1.5 * Math.PI, repDeg: 270, repPiRat: r, referenceAnglePi: rat(1, 2) });
    }

    const val = ratToNumber(r);
    let quadrant;
    let ref;
    if (val < 0.5) {
      quadrant = 1;
      ref = r;
    } else if (val < 1) {
      quadrant = 2;
      ref = ratSub(rat(1, 1), r);
    } else if (val < 1.5) {
      quadrant = 3;
      ref = ratSub(r, rat(1, 1));
    } else {
      quadrant = 4;
      ref = ratSub(rat(2, 1), r);
    }
    return Object.freeze({
      quadrant,
      axis: null,
      repRad: rep.repRad,
      repDeg: val * 180,
      repPiRat: r,
      referenceAnglePi: ref,
    });
  }

  const repRad = principalRepRad(parsed.rad).rep;
  const repDeg = (repRad * 180) / Math.PI;
  const eps = 1e-9;
  if (Math.abs(repRad) < eps || Math.abs(repRad - TAU) < eps) {
    return Object.freeze({ quadrant: null, axis: '+X', repRad: 0, repDeg: 0, repPiRat: null, referenceAnglePi: null });
  }
  if (Math.abs(repRad - Math.PI / 2) < eps) {
    return Object.freeze({ quadrant: null, axis: '+Y', repRad: Math.PI / 2, repDeg: 90, repPiRat: null, referenceAnglePi: null });
  }
  if (Math.abs(repRad - Math.PI) < eps) {
    return Object.freeze({ quadrant: null, axis: '-X', repRad: Math.PI, repDeg: 180, repPiRat: null, referenceAnglePi: null });
  }
  if (Math.abs(repRad - 1.5 * Math.PI) < eps) {
    return Object.freeze({ quadrant: null, axis: '-Y', repRad: 1.5 * Math.PI, repDeg: 270, repPiRat: null, referenceAnglePi: null });
  }
  let quadrant;
  if (repRad < Math.PI / 2) quadrant = 1;
  else if (repRad < Math.PI) quadrant = 2;
  else if (repRad < 1.5 * Math.PI) quadrant = 3;
  else quadrant = 4;

  return Object.freeze({
    quadrant,
    axis: null,
    repRad,
    repDeg,
    repPiRat: null,
    referenceAnglePi: null,
  });
}

export function reduceToFirstQuadrant(piRatInput) {
  const rep = principalRepPi(piRatInput);
  const cls = classifyQuadrant({ kind: 'pi', rat: rep.repRat });
  const refStr = formatPiRat(cls.referenceAnglePi);
  const repStr = rep.formatted;

  let formula = `${repStr}`;
  if (cls.quadrant === 1) formula = `${repStr} (ya en QI)`;
  else if (cls.quadrant === 2) formula = `${PI_CHAR} ${MINUS_CHAR} ${refStr} = ${repStr}`;
  else if (cls.quadrant === 3) formula = `${PI_CHAR} + ${refStr} = ${repStr}`;
  else if (cls.quadrant === 4) formula = `2${PI_CHAR} ${MINUS_CHAR} ${refStr} = ${repStr}`;
  else formula = `Eje ${cls.axis} (${repStr})`;

  return Object.freeze({
    principalPiRat: rep.repRat,
    principalFormatted: repStr,
    quadrant: cls.quadrant,
    axis: cls.axis,
    referenceAnglePi: cls.referenceAnglePi,
    referenceFormatted: refStr,
    reductionFormula: formula,
    signs: cls.quadrant ? QUADRANT_SIGNS[cls.quadrant] : null,
  });
}

/**
 * Computes exact values for all 6 trig functions at special angles (multiples of pi/6 and pi/4).
 */
export function exactTrigAtSpecialAngle(piRatInput) {
  const red = reduceToFirstQuadrant(piRatInput);
  const r = red.principalPiRat;
  const d = r.d;
  if (![1, 2, 3, 4, 6].includes(d)) {
    return null;
  }

  // Axis angles
  if (red.axis === '+X') return SPECIAL_ANGLES_Q1['0'];
  if (red.axis === '+Y') return SPECIAL_ANGLES_Q1['π/2'];
  if (red.axis === '-X') {
    return Object.freeze({
      piRat: r,
      deg: 180,
      sin: exactRadical(0, 1),
      cos: exactRadical(-1, 1),
      tan: exactRadical(0, 1),
      csc: UNDEF_SIN_ZERO,
      sec: exactRadical(-1, 1),
      cot: UNDEF_SIN_ZERO,
    });
  }
  if (red.axis === '-Y') {
    return Object.freeze({
      piRat: r,
      deg: 270,
      sin: exactRadical(-1, 1),
      cos: exactRadical(0, 1),
      tan: UNDEF_COS_ZERO,
      csc: exactRadical(-1, 1),
      sec: UNDEF_COS_ZERO,
      cot: exactRadical(0, 1),
    });
  }

  const refKey = formatPiRat(red.referenceAnglePi);
  const base = SPECIAL_ANGLES_Q1[refKey];
  if (!base) return null;

  const signs = QUADRANT_SIGNS[red.quadrant];
  const applySign = (er, sgn) => (sgn < 0 ? exactRadicalNeg(er) : er);

  return Object.freeze({
    piRat: r,
    deg: Math.round(ratToNumber(r) * 180),
    quadrant: red.quadrant,
    sin: applySign(base.sin, signs.sin),
    cos: applySign(base.cos, signs.cos),
    tan: applySign(base.tan, signs.tan),
    csc: applySign(base.csc, signs.csc),
    sec: applySign(base.sec, signs.sec),
    cot: applySign(base.cot, signs.cot),
  });
}

function parseSecondCondition(cond) {
  if (!cond) return null;
  if (typeof cond === 'object' && cond.fn) {
    const fn = normalizeTrigFnName(cond.fn);
    const sign = cond.sign ?? (cond.positive === true ? 1 : cond.positive === false ? -1 : 0);
    return { fn, sign };
  }
  if (typeof cond === 'string') {
    const m = cond.trim().match(/^([a-zA-Z]+)\s*(?:\([^)]*\))?\s*([<>])\s*0$/);
    if (m) {
      return {
        fn: normalizeTrigFnName(m[1]),
        sign: m[2] === '>' ? 1 : -1,
      };
    }
  }
  return null;
}

/**
 * Given one trig function value and either quadrant or a second sign condition,
 * resolves the quadrant, verifies consistency, and computes all 6 exact functions.
 */
export function exactTrigFromGiven({ fn, value, quadrant = null, secondCondition = null } = {}) {
  const fnName = normalizeTrigFnName(fn);
  const valEr = parseExactRadical(value);
  if (valEr.coeff.n === 0 && (fnName === 'csc' || fnName === 'sec')) {
    throw new RangeError(`${fnName} no puede valer 0.`);
  }

  const valNum = valEr.num;
  if ((fnName === 'sin' || fnName === 'cos') && Math.abs(valNum) > 1 + 1e-12) {
    throw new RangeError(`|${fnName}(α)| no puede superar 1 (recibido ${valEr.formatted}).`);
  }
  if ((fnName === 'csc' || fnName === 'sec') && Math.abs(valNum) < 1 - 1e-12) {
    throw new RangeError(`|${fnName}(α)| no puede ser menor que 1 (recibido ${valEr.formatted}).`);
  }

  let q = null;
  if (quadrant !== null && quadrant !== undefined) {
    if (typeof quadrant === 'number') q = quadrant;
    else {
      const roman = { I: 1, II: 2, III: 3, IV: 4, '1': 1, '2': 2, '3': 3, '4': 4 };
      q = roman[String(quadrant).trim().toUpperCase()] || null;
    }
    if (![1, 2, 3, 4].includes(q)) {
      throw new RangeError(`Cuadrante inválido: "${quadrant}"`);
    }
  }

  const valSign = valEr.coeff.n > 0 ? 1 : valEr.coeff.n < 0 ? -1 : 0;
  const cond2 = parseSecondCondition(secondCondition);

  if (q !== null) {
    if (valSign !== 0 && QUADRANT_SIGNS[q][fnName] !== valSign) {
      throw new RangeError(`Signo incompatible: ${fnName}(α) = ${valEr.formatted} no corresponde al cuadrante ${q}.`);
    }
    if (cond2 && QUADRANT_SIGNS[q][cond2.fn] !== cond2.sign) {
      throw new RangeError(`Condición ${cond2.fn} incompatible con cuadrante ${q}.`);
    }
  } else {
    if (valSign === 0) {
      throw new RangeError('Para valor nulo se requiere especificar el cuadrante o ángulo.');
    }
    const candidates = [1, 2, 3, 4].filter((cand) => {
      if (QUADRANT_SIGNS[cand][fnName] !== valSign) return false;
      if (cond2 && QUADRANT_SIGNS[cand][cond2.fn] !== cond2.sign) return false;
      return true;
    });
    if (candidates.length === 0) {
      throw new RangeError('Combinación de signos imposible en los 4 cuadrantes.');
    }
    if (candidates.length > 1) {
      throw new RangeError('Información insuficiente: la combinación aplica a más de un cuadrante.');
    }
    q = candidates[0];
  }

  const signs = QUADRANT_SIGNS[q];
  // Compute exact rational value squared: val^2 = (c^2) * R
  const valSq = ratMul(ratPow(valEr.coeff, 2), rat(valEr.radicand, 1));

  let sinEr;
  let cosEr;

  if (fnName === 'sin') {
    sinEr = valEr;
    const cosSq = ratSub(rat(1, 1), valSq);
    cosEr = exactRadicalFromRatSqrt(cosSq, signs.cos);
  } else if (fnName === 'cos') {
    cosEr = valEr;
    const sinSq = ratSub(rat(1, 1), valSq);
    sinEr = exactRadicalFromRatSqrt(sinSq, signs.sin);
  } else if (fnName === 'csc') {
    sinEr = exactRadicalInv(valEr);
    const sinSq = ratMul(ratPow(sinEr.coeff, 2), rat(sinEr.radicand, 1));
    cosEr = exactRadicalFromRatSqrt(ratSub(rat(1, 1), sinSq), signs.cos);
  } else if (fnName === 'sec') {
    cosEr = exactRadicalInv(valEr);
    const cosSq = ratMul(ratPow(cosEr.coeff, 2), rat(cosEr.radicand, 1));
    sinEr = exactRadicalFromRatSqrt(ratSub(rat(1, 1), cosSq), signs.sin);
  } else if (fnName === 'tan') {
    // 1 + tan^2 = sec^2 => cos^2 = 1 / (1 + tan^2)
    const cosSq = ratInv(ratAdd(rat(1, 1), valSq));
    cosEr = exactRadicalFromRatSqrt(cosSq, signs.cos);
    sinEr = exactRadicalMul(valEr, cosEr);
  } else {
    // cot: 1 + cot^2 = csc^2 => sin^2 = 1 / (1 + cot^2)
    const sinSq = ratInv(ratAdd(rat(1, 1), valSq));
    sinEr = exactRadicalFromRatSqrt(sinSq, signs.sin);
    cosEr = exactRadicalMul(valEr, sinEr);
  }

  const tanEr = cosEr.coeff.n === 0 ? UNDEF_COS_ZERO : exactRadicalDiv(sinEr, cosEr);
  const cscEr = sinEr.coeff.n === 0 ? UNDEF_SIN_ZERO : exactRadicalInv(sinEr);
  const secEr = cosEr.coeff.n === 0 ? UNDEF_COS_ZERO : exactRadicalInv(cosEr);
  const cotEr = sinEr.coeff.n === 0 ? UNDEF_SIN_ZERO : exactRadicalDiv(cosEr, sinEr);

  return Object.freeze({
    valid: true,
    quadrant: q,
    signs,
    sin: sinEr,
    cos: cosEr,
    tan: tanEr,
    csc: cscEr,
    sec: secEr,
    cot: cotEr,
  });
}

/* ============================================================================
 * 5. Distinct Specifications & Evaluators for All 6 Functions
 * ========================================================================== */

export const TRIG_FUNCTIONS_SPEC = Object.freeze({
  sin: Object.freeze({
    id: 'sin',
    label: 'sen x',
    periodPi: 2,
    periodText: '2π',
    domainExclusionType: 'none',
    excludedClasses: Object.freeze([]),
    domainText: 'ℝ',
    imageIntervals: Object.freeze([Object.freeze({ lo: -1, hi: 1, loC: true, hiC: true })]),
    imageText: '[−1; 1]',
    zeroClasses: Object.freeze(['0', 'π']),
    zerosIn0To2Pi: Object.freeze(['0', 'π']),
    zerosText: 'C₀ ∪ C_π',
    asymptotesType: 'none',
    bijectiveRestriction: Object.freeze({ domainText: '[−π/2; π/2]', codomainText: '[−1; 1]' }),
    isSurjectiveOnRealCodomain: false,
    positiveOn0To2Pi: '(0; π)',
    negativeOn0To2Pi: '(π; 2π)',
  }),
  cos: Object.freeze({
    id: 'cos',
    label: 'cos x',
    periodPi: 2,
    periodText: '2π',
    domainExclusionType: 'none',
    excludedClasses: Object.freeze([]),
    domainText: 'ℝ',
    imageIntervals: Object.freeze([Object.freeze({ lo: -1, hi: 1, loC: true, hiC: true })]),
    imageText: '[−1; 1]',
    zeroClasses: Object.freeze(['π/2', '3π/2']),
    zerosIn0To2Pi: Object.freeze(['π/2', '3π/2']),
    zerosText: 'C_{π/2} ∪ C_{3π/2}',
    asymptotesType: 'none',
    bijectiveRestriction: Object.freeze({ domainText: '[0; π]', codomainText: '[−1; 1]' }),
    isSurjectiveOnRealCodomain: false,
    positiveOn0To2Pi: '(0; π/2) ∪ (3π/2; 2π)',
    negativeOn0To2Pi: '(π/2; 3π/2)',
  }),
  tan: Object.freeze({
    id: 'tan',
    label: 'tg x',
    periodPi: 1,
    periodText: 'π',
    domainExclusionType: 'cos_zero',
    excludedClasses: Object.freeze(['π/2', '3π/2']),
    domainText: 'ℝ − (C_{π/2} ∪ C_{3π/2})',
    imageIntervals: Object.freeze([Object.freeze({ lo: -Infinity, hi: Infinity, loC: false, hiC: false })]),
    imageText: 'ℝ',
    zeroClasses: Object.freeze(['0', 'π']),
    zerosIn0To2Pi: Object.freeze(['0', 'π']),
    zerosText: 'C₀ ∪ C_π',
    asymptotesType: 'cos_zero',
    bijectiveRestriction: Object.freeze({ domainText: '(−π/2; π/2)', codomainText: 'ℝ' }),
    isSurjectiveOnRealCodomain: true,
    positiveOn0To2Pi: '(0; π/2) ∪ (π; 3π/2)',
    negativeOn0To2Pi: '(π/2; π) ∪ (3π/2; 2π)',
  }),
  csc: Object.freeze({
    id: 'csc',
    label: 'cosec x',
    periodPi: 2,
    periodText: '2π',
    domainExclusionType: 'sin_zero',
    excludedClasses: Object.freeze(['0', 'π']),
    domainText: 'ℝ − (C₀ ∪ C_π)',
    imageIntervals: Object.freeze([
      Object.freeze({ lo: -Infinity, hi: -1, loC: false, hiC: true }),
      Object.freeze({ lo: 1, hi: Infinity, loC: true, hiC: false }),
    ]),
    imageText: '(−∞; −1] ∪ [1; +∞)',
    zeroClasses: Object.freeze([]),
    zerosIn0To2Pi: Object.freeze([]),
    zerosText: '∅',
    asymptotesType: 'sin_zero',
    bijectiveRestriction: Object.freeze({ domainText: '[−π/2; 0) ∪ (0; π/2]', codomainText: '(−∞; −1] ∪ [1; +∞)' }),
    isSurjectiveOnRealCodomain: false,
    positiveOn0To2Pi: '(0; π)',
    negativeOn0To2Pi: '(π; 2π)',
  }),
  sec: Object.freeze({
    id: 'sec',
    label: 'sec x',
    periodPi: 2,
    periodText: '2π',
    domainExclusionType: 'cos_zero',
    excludedClasses: Object.freeze(['π/2', '3π/2']),
    domainText: 'ℝ − (C_{π/2} ∪ C_{3π/2})',
    imageIntervals: Object.freeze([
      Object.freeze({ lo: -Infinity, hi: -1, loC: false, hiC: true }),
      Object.freeze({ lo: 1, hi: Infinity, loC: true, hiC: false }),
    ]),
    imageText: '(−∞; −1] ∪ [1; +∞)',
    zeroClasses: Object.freeze([]),
    zerosIn0To2Pi: Object.freeze([]),
    zerosText: '∅',
    asymptotesType: 'cos_zero',
    bijectiveRestriction: Object.freeze({ domainText: '[0; π/2) ∪ (π/2; π]', codomainText: '(−∞; −1] ∪ [1; +∞)' }),
    isSurjectiveOnRealCodomain: false,
    positiveOn0To2Pi: '(0; π/2) ∪ (3π/2; 2π)',
    negativeOn0To2Pi: '(π/2; 3π/2)',
  }),
  cot: Object.freeze({
    id: 'cot',
    label: 'cotg x',
    periodPi: 1,
    periodText: 'π',
    domainExclusionType: 'sin_zero',
    excludedClasses: Object.freeze(['0', 'π']),
    domainText: 'ℝ − (C₀ ∪ C_π)',
    imageIntervals: Object.freeze([Object.freeze({ lo: -Infinity, hi: Infinity, loC: false, hiC: false })]),
    imageText: 'ℝ',
    zeroClasses: Object.freeze(['π/2', '3π/2']),
    zerosIn0To2Pi: Object.freeze(['π/2', '3π/2']),
    zerosText: 'C_{π/2} ∪ C_{3π/2}',
    asymptotesType: 'sin_zero',
    bijectiveRestriction: Object.freeze({ domainText: '(0; π)', codomainText: 'ℝ' }),
    isSurjectiveOnRealCodomain: true,
    positiveOn0To2Pi: '(0; π/2) ∪ (π; 3π/2)',
    negativeOn0To2Pi: '(π/2; π) ∪ (3π/2; 2π)',
  }),
});

/**
 * Evaluates any of the 6 canonical trig functions at xRad, returning NaN on poles.
 */
export function evalTrig(fnName, xRad, { eps = 1e-12 } = {}) {
  if (typeof xRad !== 'number' || !Number.isFinite(xRad)) return NaN;
  const fn = normalizeTrigFnName(fnName);
  const s = Math.sin(xRad);
  const c = Math.cos(xRad);
  const cleanS = Math.abs(s) < eps ? 0 : s;
  const cleanC = Math.abs(c) < eps ? 0 : c;

  if (fn === 'sin') return cleanS;
  if (fn === 'cos') return cleanC;
  if (fn === 'tan') return cleanC === 0 ? NaN : cleanS / cleanC;
  if (fn === 'csc') return cleanS === 0 ? NaN : 1 / cleanS;
  if (fn === 'sec') return cleanC === 0 ? NaN : 1 / cleanC;
  return cleanS === 0 ? NaN : cleanC / cleanS;
}

/**
 * Returns sorted array of vertical asymptotes inside [xMin, xMax].
 */
export function asymptotesInRange(fnName, xMin, xMax) {
  const fn = normalizeTrigFnName(fnName);
  const spec = TRIG_FUNCTIONS_SPEC[fn];
  if (spec.asymptotesType === 'none') return [];
  const lo = Math.min(xMin, xMax);
  const hi = Math.max(xMin, xMax);
  const poles = [];

  if (spec.asymptotesType === 'sin_zero') {
    const kStart = Math.ceil(lo / Math.PI - 1e-12);
    const kEnd = Math.floor(hi / Math.PI + 1e-12);
    for (let k = kStart; k <= kEnd; k++) {
      poles.push(k * Math.PI);
    }
  } else if (spec.asymptotesType === 'cos_zero') {
    const kStart = Math.ceil(lo / Math.PI - 0.5 - 1e-12);
    const kEnd = Math.floor(hi / Math.PI - 0.5 + 1e-12);
    for (let k = kStart; k <= kEnd; k++) {
      poles.push((k + 0.5) * Math.PI);
    }
  }
  return poles;
}

/* ============================================================================
 * 6. Periodic & Quadratic Trigonometric Equation Solvers
 * ========================================================================== */

const SPECIAL_PI_SOLUTIONS = [
  rat(0, 1),
  rat(1, 6), rat(1, 4), rat(1, 3), rat(1, 2),
  rat(2, 3), rat(3, 4), rat(5, 6), rat(1, 1),
  rat(7, 6), rat(5, 4), rat(4, 3), rat(3, 2),
  rat(5, 3), rat(7, 4), rat(11, 6),
];

function matchSpecialAngles(fnName, targetEr) {
  const matches = [];
  for (const piRat of SPECIAL_PI_SOLUTIONS) {
    const table = exactTrigAtSpecialAngle(piRat);
    if (!table) continue;
    const val = table[fnName];
    if (val && val.defined && exactRadicalEq(val, targetEr)) {
      matches.push(piRat);
    }
  }
  return matches;
}

function checkExclusion(cand, excludedConditions) {
  const xRad = cand.piRat ? ratToNumber(cand.piRat) * Math.PI : cand.rad;
  for (const cond of excludedConditions) {
    if (cond === 'cos_zero' || cond === 'tan' || cond === 'sec') {
      if (Math.abs(Math.cos(xRad)) < 1e-10) return 'cos x = 0 (anula denominador / polo de tg o sec)';
    } else if (cond === 'sin_zero' || cond === 'cot' || cond === 'csc') {
      if (Math.abs(Math.sin(xRad)) < 1e-10) return 'sen x = 0 (anula denominador / polo de cotg o cosec)';
    } else if (typeof cond === 'function') {
      const res = cond(xRad, cand.piRat);
      if (res) return typeof res === 'string' ? res : 'Excluido por restricción de dominio';
    }
  }
  return null;
}

function formatClassLabel(cand) {
  if (cand.piRat) {
    const lbl = formatPiRat(cand.piRat);
    return lbl.length === 1 ? `C_${lbl}` : `C_{${lbl}}`;
  }
  const numStr = String(Number(cand.rad.toFixed(4))).replace('.', ',');
  return `C_{${numStr}}`;
}

/**
 * Solves elementary equation fn(x) = targetValue on domain 'Q1' | '0_2pi' | 'R'.
 */
export function solveElementaryTrigEq(
  fnName,
  targetValue,
  { domain = 'R', excludedConditions = [] } = {}
) {
  const fn = normalizeTrigFnName(fnName);
  const spec = TRIG_FUNCTIONS_SPEC[fn];

  // Auto-add intrinsic pole exclusions of fn itself
  const effectiveExclusions = [...excludedConditions];
  if (spec.domainExclusionType !== 'none' && !effectiveExclusions.includes(spec.domainExclusionType)) {
    effectiveExclusions.push(spec.domainExclusionType);
  }

  let targetEr = null;
  let targetNum;
  try {
    targetEr = parseExactRadical(targetValue);
    targetNum = targetEr.num;
  } catch {
    targetNum = typeof targetValue === 'number' ? targetValue : Number(String(targetValue).replace(',', '.'));
  }

  if (!Number.isFinite(targetNum)) {
    throw new TypeError('El valor objetivo de la ecuación debe ser finito.');
  }

  // Range check
  const outOfRange =
    ((fn === 'sin' || fn === 'cos') && Math.abs(targetNum) > 1 + 1e-12) ||
    ((fn === 'csc' || fn === 'sec') && Math.abs(targetNum) < 1 - 1e-12);

  if (outOfRange) {
    return Object.freeze({
      empty: true,
      exact: true,
      fn,
      target: targetEr ? targetEr.formatted : targetNum,
      solutionsIn0To2Pi: Object.freeze([]),
      solutionsInDomain: Object.freeze([]),
      congruenceClasses: Object.freeze([]),
      rejectedSolutions: Object.freeze([]),
      formatted0To2Pi: EMPTY_SET_CHAR,
      formattedR: EMPTY_SET_CHAR,
    });
  }

  let candidates = [];
  let exact = false;

  if (targetEr) {
    const exactMatches = matchSpecialAngles(fn, targetEr);
    if (exactMatches.length > 0) {
      exact = true;
      candidates = exactMatches.map((piRat) => ({
        piRat,
        rad: ratToNumber(piRat) * Math.PI,
        formatted: formatPiRat(piRat),
      }));
    }
  }

  if (!exact) {
    let rawAngles = [];
    if (fn === 'sin' || fn === 'csc') {
      const sVal = fn === 'sin' ? Math.max(-1, Math.min(1, targetNum)) : 1 / targetNum;
      const a0 = Math.asin(sVal);
      rawAngles = [a0, Math.PI - a0];
    } else if (fn === 'cos' || fn === 'sec') {
      const cVal = fn === 'cos' ? Math.max(-1, Math.min(1, targetNum)) : 1 / targetNum;
      const a0 = Math.acos(cVal);
      rawAngles = [a0, TAU - a0];
    } else {
      const tVal = fn === 'tan' ? targetNum : (Math.abs(targetNum) < 1e-15 ? Infinity : 1 / targetNum);
      const a0 = Number.isFinite(tVal) ? Math.atan(tVal) : Math.PI / 2;
      rawAngles = [a0, a0 + Math.PI];
    }

    const seen = [];
    for (const ang of rawAngles) {
      const rep = principalRepRad(ang).rep;
      if (!seen.some((v) => Math.abs(v - rep) < 1e-9)) {
        seen.push(rep);
      }
    }
    seen.sort((a, b) => a - b);
    candidates = seen.map((rad) => ({
      piRat: null,
      rad,
      formatted: String(Number(rad.toFixed(4))).replace('.', ','),
    }));
  }

  const valid = [];
  const rejected = [];
  for (const cand of candidates) {
    const reason = checkExclusion(cand, effectiveExclusions);
    if (reason) {
      rejected.push(Object.freeze({ ...cand, reason }));
    } else {
      valid.push(Object.freeze(cand));
    }
  }

  const inDomain =
    domain === 'Q1'
      ? valid.filter((c) => c.rad >= -1e-12 && c.rad <= Math.PI / 2 + 1e-12)
      : valid;

  const classes = valid.map((c) => formatClassLabel(c));
  const formatted0To2Pi = valid.length === 0 ? EMPTY_SET_CHAR : `{${valid.map((c) => c.formatted).join('; ')}}`;
  const formattedR = classes.length === 0 ? EMPTY_SET_CHAR : classes.join(' ∪ ');

  return Object.freeze({
    empty: inDomain.length === 0,
    exact,
    fn,
    target: targetEr ? targetEr.formatted : targetNum,
    solutionsIn0To2Pi: Object.freeze(valid),
    solutionsInDomain: Object.freeze(inDomain),
    congruenceClasses: Object.freeze(classes),
    rejectedSolutions: Object.freeze(rejected),
    formatted0To2Pi,
    formattedR,
  });
}

/**
 * Solves quadratic trig equation a * fn^2(x) + b * fn(x) + c = 0.
 * Supports exact rational/radical discriminants and pole filtering.
 */
export function solveQuadraticTrigEq({
  fnName,
  a = 1,
  b = 0,
  c = 0,
  domain = 'R',
  excludedConditions = [],
} = {}) {
  const fn = normalizeTrigFnName(fnName);
  if (Math.abs(a) < 1e-15) {
    if (Math.abs(b) < 1e-15) {
      throw new RangeError('Coeficientes a y b nulos en ecuación trigonométrica.');
    }
    const rootU = ratDiv(ratNeg(parseRational(c)), parseRational(b));
    const sol = solveElementaryTrigEq(fn, rootU, { domain, excludedConditions });
    return Object.freeze({
      rootsU: Object.freeze([exactRadical(rootU, 1)]),
      outOfRangeRoots: Object.freeze([]),
      ...sol,
    });
  }

  // Try exact rational quadratic first
  let discEr = null;
  let rootsU = [];
  let exactAttempt = false;
  try {
    const ar = parseRational(a);
    const br = parseRational(b);
    const cr = parseRational(c);
    const disc = ratSub(ratMul(br, br), ratMul(rat(4, 1), ratMul(ar, cr)));
    if (disc.n < 0) {
      return Object.freeze({
        empty: true,
        rootsU: Object.freeze([]),
        outOfRangeRoots: Object.freeze([]),
        solutionsIn0To2Pi: Object.freeze([]),
        solutionsInDomain: Object.freeze([]),
        congruenceClasses: Object.freeze([]),
        rejectedSolutions: Object.freeze([]),
        formatted0To2Pi: EMPTY_SET_CHAR,
        formattedR: EMPTY_SET_CHAR,
      });
    }
    discEr = exactRadicalFromRatSqrt(disc, 1);
    const twoA = ratMul(rat(2, 1), ar);
    if (disc.n === 0) {
      rootsU = [exactRadical(ratDiv(ratNeg(br), twoA), 1)];
      exactAttempt = true;
    } else if (discEr.isRational) {
      const r1 = ratDiv(ratAdd(ratNeg(br), discEr.coeff), twoA);
      const r2 = ratDiv(ratSub(ratNeg(br), discEr.coeff), twoA);
      rootsU = [exactRadical(r1, 1), exactRadical(r2, 1)];
      exactAttempt = true;
    } else if (br.n === 0) {
      // a*u^2 + c = 0 -> u = +- sqrt(-c/a)
      const u1 = exactRadical(ratDiv(discEr.coeff, twoA), discEr.radicand);
      const u2 = exactRadicalNeg(u1);
      rootsU = [u1, u2];
      exactAttempt = true;
    }
  } catch {
    exactAttempt = false;
  }

  if (!exactAttempt) {
    const discNum = b * b - 4 * a * c;
    if (discNum < -1e-12) {
      return Object.freeze({
        empty: true,
        rootsU: Object.freeze([]),
        outOfRangeRoots: Object.freeze([]),
        solutionsIn0To2Pi: Object.freeze([]),
        solutionsInDomain: Object.freeze([]),
        congruenceClasses: Object.freeze([]),
        rejectedSolutions: Object.freeze([]),
        formatted0To2Pi: EMPTY_SET_CHAR,
        formattedR: EMPTY_SET_CHAR,
      });
    }
    const sqrtD = Math.sqrt(Math.max(0, discNum));
    if (sqrtD < 1e-12) {
      rootsU = [-b / (2 * a)];
    } else {
      rootsU = [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
    }
  }

  const outOfRangeRoots = [];
  const allSols = [];
  const allRejected = [];

  for (const u of rootsU) {
    const res = solveElementaryTrigEq(fn, u, { domain, excludedConditions });
    if (res.solutionsIn0To2Pi.length === 0 && res.rejectedSolutions.length === 0) {
      outOfRangeRoots.push(u);
    } else {
      for (const s of res.solutionsIn0To2Pi) {
        if (!allSols.some((existing) => Math.abs(existing.rad - s.rad) < 1e-9)) {
          allSols.push(s);
        }
      }
      for (const rej of res.rejectedSolutions) {
        if (!allRejected.some((existing) => Math.abs(existing.rad - rej.rad) < 1e-9)) {
          allRejected.push(rej);
        }
      }
    }
  }

  allSols.sort((x, y) => x.rad - y.rad);
  allRejected.sort((x, y) => x.rad - y.rad);

  const inDomain =
    domain === 'Q1'
      ? allSols.filter((s) => s.rad >= -1e-12 && s.rad <= Math.PI / 2 + 1e-12)
      : allSols;

  const classes = allSols.map((s) => formatClassLabel(s));
  const formatted0To2Pi = allSols.length === 0 ? EMPTY_SET_CHAR : `{${allSols.map((s) => s.formatted).join('; ')}}`;
  const formattedR = classes.length === 0 ? EMPTY_SET_CHAR : classes.join(' ∪ ');

  return Object.freeze({
    empty: inDomain.length === 0,
    rootsU: Object.freeze(rootsU),
    outOfRangeRoots: Object.freeze(outOfRangeRoots),
    solutionsIn0To2Pi: Object.freeze(allSols),
    solutionsInDomain: Object.freeze(inDomain),
    congruenceClasses: Object.freeze(classes),
    rejectedSolutions: Object.freeze(allRejected),
    formatted0To2Pi,
    formattedR,
  });
}
