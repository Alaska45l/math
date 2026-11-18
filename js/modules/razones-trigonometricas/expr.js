/**
 * @file js/modules/razones-trigonometricas/expr.js
 * Parsers y comparadores puros (sin eval, sin DOM) para Unidad 10 · Razones Trigonométricas:
 * números, fracciones, radicales exactos, ángulos sexagesimales (DMS), radianes, múltiplos de π
 * y conjuntos/intervalos de Exactas.
 */

import {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  rat,
  ratFromNumber,
  parseRational,
  ratEq,
  ratToNumber,
  ratToString,
  parseAngleInput,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  formatPiRat,
  parseExactRadical,
  exactRadicalEq,
  fmtExactRadical,
} from '../../core/math/trigonometry.js';

export {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  rat,
  ratFromNumber,
  parseRational,
  ratEq,
  ratToNumber,
  ratToString,
  parseAngleInput,
  degToDms,
  dmsToDeg,
  degToRadExact,
  radExactToDeg,
  formatPiRat,
  parseExactRadical,
  exactRadicalEq,
  fmtExactRadical,
};

const nfCache = new Map();
function getNf(digits) {
  if (!nfCache.has(digits)) {
    nfCache.set(digits, new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }));
  }
  return nfCache.get(digits);
}

export function fmtNumberEsAR(n, digits = 2) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '?';
  const r = Number(n.toFixed(digits));
  const v = Object.is(r, -0) ? 0 : r;
  return getNf(digits).format(v).replace('-', MINUS_CHAR);
}

/**
 * Parses integers, es-AR/en-US decimals, fractions ("3/4"), or exact radicals ("√5", "2√3").
 * Throws SyntaxError on invalid input. Zero eval.
 */
export function parseNumberOrFraction(raw) {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) throw new SyntaxError('El número debe ser finito.');
    return raw;
  }
  if (raw && typeof raw === 'object' && 'n' in raw && 'd' in raw) {
    return ratToNumber(raw);
  }
  if (typeof raw !== 'string') {
    throw new SyntaxError('Entrada numérica inválida.');
  }
  let s = raw.trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s*(?:cm|m|km|dm|mm|u)\s*[²³23]?$/i, '')
    .trim();
  if (!s) throw new SyntaxError('Ingresá un valor numérico.');

  // Strip thousands dots if es-AR decimal comma or large integer ("2.354,57" or "5 339")
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(?:\s+\d{3})+(?:[.,]\d+)?$/.test(s)) {
    s = s.replace(/\s+/g, '').replace(',', '.');
  } else {
    s = s.replace(/(\d),(\d)/g, '$1.$2');
  }

  if (s.includes(SQRT_CHAR) || /sqrt/i.test(s)) {
    const er = parseExactRadical(s);
    return er.num;
  }
  if (s.includes(PI_CHAR) || /pi/i.test(s)) {
    const ang = parseAngleInput(s, { defaultSystem: 'rad' });
    return ang.rad;
  }
  const r = parseRational(s);
  return ratToNumber(r);
}

/**
 * Parses angle inputs including DMS ("53° 7' 48''", "53° 7' 48\""), degrees, or pi-radians.
 */
export function parseAngleAnswer(raw, { defaultSystem = 'deg' } = {}) {
  if (typeof raw === 'string') {
    const normalized = raw
      .trim()
      .replace(/''/g, '"')
      .replace(/´´/g, '"')
      .replace(/´/g, "'")
      .replace(/º/g, '°');
    return parseAngleInput(normalized, { defaultSystem });
  }
  return parseAngleInput(raw, { defaultSystem });
}

export function equivalentNumber(userRaw, expectedVal, tol = 0.05) {
  try {
    const u = parseNumberOrFraction(userRaw);
    const e = parseNumberOrFraction(expectedVal);
    return Math.abs(u - e) <= tol;
  } catch {
    return false;
  }
}

export function equivalentAngle(
  userRaw,
  expectedRaw,
  { tolDeg = 0.05, tolRad = 1e-3, requireExactPi = false, defaultSystem = 'deg' } = {}
) {
  try {
    const u = parseAngleAnswer(userRaw, { defaultSystem });
    const e = parseAngleAnswer(expectedRaw, { defaultSystem });
    if (requireExactPi) {
      if (!e.exactPi) return { equivalent: false, approxMatch: false, user: u, exp: e };
      if (u.exactPi && ratEq(u.exactPi, e.exactPi)) {
        return { equivalent: true, approxMatch: true, user: u, exp: e };
      }
      const approxMatch = Math.abs(u.rad - e.rad) <= tolRad;
      return { equivalent: false, approxMatch, user: u, exp: e };
    }
    if (e.system === 'deg' || defaultSystem === 'deg') {
      return { equivalent: Math.abs(u.deg - e.deg) <= tolDeg, approxMatch: true, user: u, exp: e };
    }
    return { equivalent: Math.abs(u.rad - e.rad) <= tolRad, approxMatch: true, user: u, exp: e };
  } catch {
    return { equivalent: false, approxMatch: false, user: null, exp: null };
  }
}

function splitTopLevelUnion(s) {
  return s.split(/\s*(?:∪|\bU\b|\bu\b)\s*/);
}

function parseSingleIntervalOrSet(token) {
  const t = token.trim();
  if (!t) throw new SyntaxError('Intervalo vacío.');
  if (t === '∅' || /^vacio$/i.test(t) || /^vacío$/i.test(t)) return { type: 'empty' };
  if (t === 'ℝ' || t === 'R') return { type: 'interval', lo: -Infinity, hi: Infinity, loC: false, hiC: false };

  if (t.startsWith('{') && t.endsWith('}')) {
    const inner = t.slice(1, -1).trim();
    if (!inner) return { type: 'empty' };
    if (!inner.includes(';') && inner.includes(',') && !/^-?\d+,\d+$/.test(inner)) {
      const err = new SyntaxError('Usá punto y coma (;) para separar elementos del conjunto en Exactas.');
      err.code = 'comma_instead_of_semicolon';
      throw err;
    }
    const pts = inner.split(';').map((p) => parseNumberOrFraction(p));
    pts.sort((a, b) => a - b);
    return { type: 'set', points: pts };
  }

  const m = t.match(/^([(\[])(.+)([)\]])$/);
  if (!m) throw new SyntaxError(`Notación de intervalo inválida: "${t}"`);
  const loC = m[1] === '[';
  const hiC = m[3] === ']';
  const body = m[2];
  if (!body.includes(';')) {
    if (body.includes(',')) {
      const err = new SyntaxError('Usá punto y coma (;) como separador del intervalo en Exactas.');
      err.code = 'comma_instead_of_semicolon';
      throw err;
    }
    throw new SyntaxError('Falta ";" entre los extremos del intervalo.');
  }
  const parts = body.split(';');
  if (parts.length !== 2) throw new SyntaxError('El intervalo debe tener exactamente dos extremos.');

  const parseBound = (rawB) => {
    const b = rawB.trim().replace(/[\u2212\u2013\u2014]/g, '-');
    if (/^[+]?(?:inf|∞)$/i.test(b)) return Infinity;
    if (/^-(?:inf|∞)$/i.test(b)) return -Infinity;
    return parseNumberOrFraction(b);
  };

  return { type: 'interval', lo: parseBound(parts[0]), hi: parseBound(parts[1]), loC, hiC };
}

export function equivalentSetExactas(userRaw, expectedRaw, tol = 1e-4) {
  const uParts = splitTopLevelUnion(String(userRaw || '').trim()).map(parseSingleIntervalOrSet);
  const eParts = splitTopLevelUnion(String(expectedRaw || '').trim()).map(parseSingleIntervalOrSet);
  if (uParts.length !== eParts.length) return false;

  for (let i = 0; i < uParts.length; i++) {
    const u = uParts[i];
    const e = eParts[i];
    if (u.type !== e.type) return false;
    if (u.type === 'empty') continue;
    if (u.type === 'set') {
      if (u.points.length !== e.points.length) return false;
      for (let j = 0; j < u.points.length; j++) {
        if (Math.abs(u.points[j] - e.points[j]) > tol) return false;
      }
      continue;
    }
    if (u.loC !== e.loC || u.hiC !== e.hiC) return false;
    const eqB = (x, y) => (x === y) || (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= tol);
    if (!eqB(u.lo, e.lo) || !eqB(u.hi, e.hi)) return false;
  }
  return true;
}
