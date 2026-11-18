/**
 * @file js/modules/funciones-trigonometricas/expr.js
 * Parsers y comparadores puros (sin eval, sin new Function, sin DOM) para Unidad 11 · Funciones Trigonométricas:
 * - Números, fracciones, radicales exactos, múltiplos de π y ángulos sexagesimales
 * - Conjuntos e intervalos Exactas (incluyendo ℝ − (C_{π/2} ∪ C_{3π/2}) y uniones de clases C_α)
 * - Parseo y comparación independiente del orden de uniones C_α ∪ C_β (rechazando representantes no reducidos cuando se exige forma principal)
 * - Parser AST recursivo de expresiones trigonométricas (sen, cos, tg, cosec, sec, cotg, potencias, productos implícitos)
 */

import {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  EMPTY_SET_CHAR,
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
  principalRepPi,
  principalRepDeg,
  principalRepDegRat,
  areCongruent,
  formatCongruenceClass,
  parseExactRadical,
  exactRadical,
  exactRadicalEq,
  fmtExactRadical,
  evalTrig,
  normalizeTrigFnName,
} from '../../core/math/trigonometry.js';

export {
  MINUS_CHAR,
  PI_CHAR,
  SQRT_CHAR,
  EMPTY_SET_CHAR,
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
  principalRepPi,
  principalRepDeg,
  principalRepDegRat,
  areCongruent,
  formatCongruenceClass,
  parseExactRadical,
  exactRadical,
  exactRadicalEq,
  fmtExactRadical,
  evalTrig,
  normalizeTrigFnName,
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
 * Parses integers, es-AR decimals, fractions ("3/4"), exact radicals ("-4√7/7"), or π-multiples ("5π/3").
 * Zero eval.
 */
export function parseNumberOrFraction(raw) {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) throw new SyntaxError('El número debe ser finito.');
    return raw;
  }
  if (raw && typeof raw === 'object' && 'n' in raw && 'd' in raw) {
    return ratToNumber(raw);
  }
  if (raw && typeof raw === 'object' && raw.kind === 'radical') {
    return raw.num;
  }
  if (typeof raw !== 'string') {
    throw new SyntaxError('Entrada numérica inválida.');
  }
  let s = raw.trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s*(?:rad(?:ianes|s)?\.?|cm|m|u)\s*$/i, '')
    .trim();
  if (!s) throw new SyntaxError('Ingresá un valor numérico.');

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
  if (s.includes(PI_CHAR) || /\bpi\b/i.test(s) || /\d*pi/i.test(s)) {
    const ang = parseAngleInput(s, { defaultSystem: 'rad' });
    return ang.rad;
  }
  const r = parseRational(s);
  return ratToNumber(r);
}

export function hasRadicalInDenominator(raw) {
  if (typeof raw !== 'string') return false;
  const s = raw.replace(/\s+/g, '');
  const slashIdx = s.indexOf('/');
  if (slashIdx === -1) return false;
  const den = s.slice(slashIdx + 1);
  return den.includes(SQRT_CHAR) || /sqrt/i.test(den);
}

export function equivalentNumber(userRaw, expectedVal, tol = 1e-3) {
  try {
    const u = parseNumberOrFraction(userRaw);
    const e = parseNumberOrFraction(expectedVal);
    return Math.abs(u - e) <= tol;
  } catch {
    return false;
  }
}

export function equivalentRadicalOrNumber(userRaw, expectedRaw, tol = 1e-4) {
  try {
    const uEr = parseExactRadical(userRaw);
    const eEr = parseExactRadical(expectedRaw);
    return exactRadicalEq(uEr, eEr);
  } catch {
    return equivalentNumber(userRaw, expectedRaw, tol);
  }
}

export function parseAngleAnswer(raw, { defaultSystem = 'rad' } = {}) {
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

export function equivalentAngle(
  userRaw,
  expectedRaw,
  { tolDeg = 0.05, tolRad = 1e-3, requireExactPi = false, defaultSystem = 'rad' } = {}
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

/* ============================================================================
 * 1. Congruence Class Unions (C_{π/3} ∪ C_{2π/3}, order-independent, principal check)
 * ========================================================================== */

const SUBSCRIPT_DIGITS = {
  '\u2080': '0',
  '\u2081': '1',
  '\u2082': '2',
  '\u2083': '3',
  '\u2084': '4',
  '\u2085': '5',
  '\u2086': '6',
  '\u2087': '7',
  '\u2088': '8',
  '\u2089': '9',
  '\u208B': '-',
};

function replaceSubscripts(str) {
  return String(str).replace(/[\u2080-\u2089\u208B]/g, (ch) => SUBSCRIPT_DIGITS[ch] || ch);
}

/**
 * Parses a single congruence class token like:
 * "C_{π/3}", "C_0", "C₀", "C_{-π/3}", "C_{7π/2}", "C_{120°}", "C(π/3)", "C_π/3", "C_{5pi/3}"
 */
export function parseCongruenceClassToken(token) {
  if (typeof token !== 'string') throw new SyntaxError('Token de clase inválido.');
  let s = replaceSubscripts(token.trim())
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, '');
  if (!s) throw new SyntaxError('Clase de congruencia vacía.');

  // Match C_{...} or C(...) or C_... or C0 / Cpi
  let inner = null;
  let m = s.match(/^C_\{([^}]+)\}$/i);
  if (m) inner = m[1];
  if (inner === null) {
    m = s.match(/^C\(([^)]+)\)$/i);
    if (m) inner = m[1];
  }
  if (inner === null) {
    m = s.match(/^C_(.+)$/i);
    if (m) inner = m[1];
  }
  if (inner === null) {
    m = s.match(/^C([+-]?(?:\d+|π|pi).*)$/i);
    if (m) inner = m[1];
  }
  if (inner === null) {
    throw new SyntaxError(`Formato de clase de congruencia no reconocido: "${token}"`);
  }

  const parsed = parseAngleInput(inner, { defaultSystem: inner.includes('°') || inner.includes('º') ? 'deg' : 'rad' });

  let isPrincipal = true;
  let isNegative = false;
  let isOverflow = false;

  if (parsed.system === 'deg') {
    if (parsed.deg < -1e-9) isNegative = true;
    if (parsed.deg >= 360 - 1e-9) isOverflow = true;
    isPrincipal = !isNegative && !isOverflow;
    const rep = parsed.exactDegRat
      ? principalRepDegRat(parsed.exactDegRat)
      : principalRepDeg(parsed.deg);
    return Object.freeze({
      raw: token.trim(),
      inner,
      system: 'deg',
      parsed,
      principalRad: (rep.rep * Math.PI) / 180,
      principalPiRat: parsed.exactPi ? principalRepPi(parsed.exactPi).repRat : null,
      canonicalLabel: formatCongruenceClass(inner, { system: 'deg' }),
      isPrincipal,
      isNegative,
      isOverflow,
    });
  }

  if (parsed.exactPi) {
    const val = ratToNumber(parsed.exactPi);
    if (val < -1e-12) isNegative = true;
    if (val >= 2 - 1e-12) isOverflow = true;
    isPrincipal = !isNegative && !isOverflow;
    const rep = principalRepPi(parsed.exactPi);
    return Object.freeze({
      raw: token.trim(),
      inner,
      system: 'rad',
      parsed,
      principalRad: rep.repRad,
      principalPiRat: rep.repRat,
      canonicalLabel: formatCongruenceClass(parsed.exactPi, { system: 'rad' }),
      isPrincipal,
      isNegative,
      isOverflow,
    });
  }

  if (parsed.rad < -1e-9) isNegative = true;
  if (parsed.rad >= 2 * Math.PI - 1e-9) isOverflow = true;
  isPrincipal = !isNegative && !isOverflow;
  const repR = principalRepRadProxy(parsed.rad);
  return Object.freeze({
    raw: token.trim(),
    inner,
    system: 'rad',
    parsed,
    principalRad: repR,
    principalPiRat: null,
    canonicalLabel: formatCongruenceClass(parsed.rad, { system: 'rad' }),
    isPrincipal,
    isNegative,
    isOverflow,
  });
}

function principalRepRadProxy(rad) {
  const tau = 2 * Math.PI;
  let r = ((rad % tau) + tau) % tau;
  if (Math.abs(r - tau) < 1e-9 || Math.abs(r) < 1e-9) r = 0;
  return r;
}

function splitUnionTokens(raw) {
  return String(raw || '')
    .trim()
    .split(/\s*(?:∪|\bU\b|\bu\b)\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Parses a union of congruence classes like "C_{π/3} ∪ C_{2π/3}" or "∅".
 */
export function parseCongruenceUnion(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) throw new SyntaxError('Expresión vacía.');
  if (trimmed === EMPTY_SET_CHAR || /^vacio$/i.test(trimmed) || /^vac[ií]o$/i.test(trimmed) || trimmed === '{}') {
    return Object.freeze({ empty: true, classes: Object.freeze([]), hasUnreduced: false, unreducedTokens: Object.freeze([]) });
  }
  const tokens = splitUnionTokens(trimmed);
  if (tokens.length === 0) throw new SyntaxError('Unión de clases vacía.');

  const classes = tokens.map(parseCongruenceClassToken);
  const unreduced = classes.filter((c) => !c.isPrincipal);
  return Object.freeze({
    empty: false,
    classes: Object.freeze(classes),
    hasUnreduced: unreduced.length > 0,
    hasNegativeRep: classes.some((c) => c.isNegative),
    hasOverflowRep: classes.some((c) => c.isOverflow),
    unreducedTokens: Object.freeze(unreduced.map((c) => c.raw)),
  });
}

/**
 * Compares two congruence class unions (order-independent, deduplicated modulo 2π).
 * When `requirePrincipal = true`, rejects unreduced negative/overflow representatives like C_{-π/3}.
 */
export function equivalentCongruenceUnion(
  userRaw,
  expectedRaw,
  { requirePrincipal = true, tol = 1e-4 } = {}
) {
  try {
    const u = parseCongruenceUnion(userRaw);
    const e = parseCongruenceUnion(expectedRaw);

    if (u.empty && e.empty) {
      return {
        equivalent: true,
        congruentMatch: true,
        hasUnreducedRepresentative: false,
        unreducedTokens: [],
        user: u,
        expected: e,
      };
    }
    if (u.empty !== e.empty) {
      return {
        equivalent: false,
        congruentMatch: false,
        hasUnreducedRepresentative: u.hasUnreduced,
        unreducedTokens: [...u.unreducedTokens],
        user: u,
        expected: e,
      };
    }

    const dedupe = (list) => {
      const out = [];
      for (const item of list) {
        if (!out.some((x) => Math.abs(x.principalRad - item.principalRad) < tol)) {
          out.push(item);
        }
      }
      return out;
    };

    const uUniq = dedupe(u.classes);
    const eUniq = dedupe(e.classes);

    const sameCount = uUniq.length === eUniq.length;
    const allMatched =
      sameCount &&
      eUniq.every((ec) =>
        uUniq.some((uc) => {
          if (ec.principalPiRat && uc.principalPiRat) {
            return ratEq(ec.principalPiRat, uc.principalPiRat);
          }
          return Math.abs(ec.principalRad - uc.principalRad) < tol;
        })
      );

    const hasUnreduced = u.hasUnreduced;
    const equivalent = allMatched && (!requirePrincipal || !hasUnreduced);

    return {
      equivalent,
      congruentMatch: allMatched,
      hasUnreducedRepresentative: hasUnreduced,
      hasNegativeRep: Boolean(u.hasNegativeRep),
      hasOverflowRep: Boolean(u.hasOverflowRep),
      unreducedTokens: [...u.unreducedTokens],
      userCount: uUniq.length,
      expectedCount: eUniq.length,
      user: u,
      expected: e,
    };
  } catch {
    return {
      equivalent: false,
      congruentMatch: false,
      hasUnreducedRepresentative: false,
      hasNegativeRep: false,
      hasOverflowRep: false,
      unreducedTokens: [],
      user: null,
      expected: null,
      parseError: true,
    };
  }
}

/* ============================================================================
 * 2. Sets, Intervals & Differentiated Real Domains (ℝ − (C_{π/2} ∪ C_{3π/2}))
 * ========================================================================== */

function normalizeDomainExclusions(raw) {
  const s = replaceSubscripts(String(raw || '').trim())
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ');

  // Match ℝ - ... or R - ... or IR - ...
  const m = s.match(/^(?:ℝ|IR|R)\s*[-−\\]\s*(.+)$/i);
  if (!m) return null;
  let excludedPart = m[1].trim();
  while (excludedPart.startsWith('(') && excludedPart.endsWith(')')) {
    excludedPart = excludedPart.slice(1, -1).trim();
  }
  while (excludedPart.startsWith('{') && excludedPart.endsWith('}')) {
    excludedPart = excludedPart.slice(1, -1).trim();
  }

  // Recognize canonical pole exclusions:
  // 1) Congruence union C_{π/2} ∪ C_{3π/2} or C_0 ∪ C_π
  if (/^C/i.test(excludedPart)) {
    const parsed = parseCongruenceUnion(excludedPart);
    return { kind: 'domain_exclusion', classes: parsed.classes.map((c) => c.principalRad).sort((a, b) => a - b) };
  }
  // 2) Set builder: "π/2 + kπ", "kπ + π/2", "(2k+1)π/2" -> cos_zero (π/2, 3π/2)
  const compact = excludedPart.replace(/\s+/g, '').replace(/pi/gi, PI_CHAR);
  if (
    /^(?:π\/2\+kπ|kπ\+π\/2|\(2k\+1\)π\/2|π\/2\+k\*π|k\*π\+π\/2)$/i.test(compact) ||
    /π\/2.*kπ|kπ.*π\/2/i.test(compact)
  ) {
    return { kind: 'domain_exclusion', classes: [Math.PI / 2, 1.5 * Math.PI] };
  }
  // 3) Set builder: "kπ", "k*π" -> sin_zero (0, π)
  if (/^(?:k\*?π|π\*?k|2kπ\/2)(?:,k∈[ℤZ])?$/i.test(compact) || /^k\*?π$/i.test(compact.split(',')[0])) {
    return { kind: 'domain_exclusion', classes: [0, Math.PI] };
  }
  return null;
}

function parseSingleIntervalOrSet(token) {
  const t = token.trim();
  if (!t) throw new SyntaxError('Intervalo vacío.');
  if (t === EMPTY_SET_CHAR || /^vacio$/i.test(t) || /^vac[ií]o$/i.test(t)) return { type: 'empty' };
  if (t === 'ℝ' || t === 'R' || t === 'IR') {
    return { type: 'interval', lo: -Infinity, hi: Infinity, loC: false, hiC: false };
  }

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
  const uStr = String(userRaw || '').trim();
  const eStr = String(expectedRaw || '').trim();

  // Check if either is a congruence-union or domain exclusion like ℝ − (C_{π/2} ∪ C_{3π/2})
  const uDom = normalizeDomainExclusions(uStr);
  const eDom = normalizeDomainExclusions(eStr);
  if (uDom || eDom) {
    if (!uDom || !eDom) return false;
    if (uDom.classes.length !== eDom.classes.length) return false;
    return uDom.classes.every((v, idx) => Math.abs(v - eDom.classes[idx]) < tol);
  }

  const uParts = splitUnionTokens(uStr).map(parseSingleIntervalOrSet);
  const eParts = splitUnionTokens(eStr).map(parseSingleIntervalOrSet);
  if (uParts.length !== eParts.length) return false;

  // Order-independent comparison for disjoint intervals/sets
  const matched = new Array(eParts.length).fill(false);
  for (const u of uParts) {
    const foundIdx = eParts.findIndex((e, idx) => {
      if (matched[idx] || u.type !== e.type) return false;
      if (u.type === 'empty') return true;
      if (u.type === 'set') {
        if (u.points.length !== e.points.length) return false;
        return u.points.every((p, j) => Math.abs(p - e.points[j]) <= tol);
      }
      if (u.loC !== e.loC || u.hiC !== e.hiC) return false;
      const eqB = (x, y) => x === y || (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= tol);
      return eqB(u.lo, e.lo) && eqB(u.hi, e.hi);
    });
    if (foundIdx === -1) return false;
    matched[foundIdx] = true;
  }
  return true;
}

/* ============================================================================
 * 3. Safe AST Parser & Evaluator for Trigonometric Expressions (Zero eval)
 * ========================================================================== */

const SUPERSCRIPTS = {
  '\u00B2': '^2',
  '\u00B3': '^3',
  '\u2074': '^4',
};

const TRIG_WORDS = new Set(['cosec', 'cotg', 'sin', 'sen', 'cos', 'tan', 'tg', 'csc', 'sec', 'cot', 'sqrt']);

function tokenizeTrigExpr(raw) {
  if (typeof raw !== 'string') throw new SyntaxError('Expresión inválida.');
  let s = raw
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/[\u00B7\u22C5]/g, '*')
    .replace(/[:]/g, '/')
    .replace(/\u221A/g, 'sqrt')
    .replace(/\u03C0/g, 'pi')
    .replace(/[\u00B2\u00B3\u2074]/g, (ch) => SUPERSCRIPTS[ch] || '')
    .replace(/[αθ]/g, 'x');

  if (!s) throw new SyntaxError('Expresión trigonométrica vacía.');

  const rawTokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (/\d|\./.test(ch)) {
      let numStr = '';
      while (i < s.length && /[\d.]/.test(s[i])) {
        numStr += s[i++];
      }
      const val = Number(numStr);
      if (!Number.isFinite(val)) throw new SyntaxError(`Número inválido: "${numStr}"`);
      rawTokens.push({ type: 'num', value: val });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let word = '';
      while (i < s.length && /[a-zA-Z]/.test(s[i])) {
        word += s[i++];
      }
      const low = word.toLowerCase();
      if (low === 'pi') {
        rawTokens.push({ type: 'num', value: Math.PI });
      } else if (low === 'x' || low === 't') {
        rawTokens.push({ type: 'var', name: 'x' });
      } else if (TRIG_WORDS.has(low)) {
        rawTokens.push({ type: 'fn', name: low });
      } else {
        throw new SyntaxError(`Símbolo desconocido en expresión: "${word}"`);
      }
      continue;
    }
    if ('+-*/^().'.includes(ch)) {
      if (ch === '.') {
        rawTokens.push({ type: 'op', value: '*' });
      } else if (ch === '(' || ch === ')') {
        rawTokens.push({ type: 'paren', value: ch });
      } else {
        rawTokens.push({ type: 'op', value: ch });
      }
      i += 1;
      continue;
    }
    throw new SyntaxError(`Carácter no permitido: "${ch}"`);
  }

  // Insert implicit multiplication tokens, avoiding '*' between fn^p and its argument (e.g. cos^2 x)
  const tokens = [];
  const isEndAtom = (tok) =>
    tok &&
    (tok.type === 'num' || tok.type === 'var' || (tok.type === 'paren' && tok.value === ')'));
  const isStartAtom = (tok) =>
    tok &&
    (tok.type === 'num' || tok.type === 'var' || tok.type === 'fn' || (tok.type === 'paren' && tok.value === '('));

  for (let idx = 0; idx < rawTokens.length; idx++) {
    const cur = rawTokens[idx];
    const prev = tokens[tokens.length - 1];
    const prev2 = tokens[tokens.length - 2];
    const prev3 = tokens[tokens.length - 3];
    const isFnPowerExponent =
      prev &&
      prev.type === 'num' &&
      prev2 &&
      prev2.type === 'op' &&
      prev2.value === '^' &&
      prev3 &&
      prev3.type === 'fn';

    if (isEndAtom(prev) && isStartAtom(cur) && !isFnPowerExponent) {
      tokens.push({ type: 'op', value: '*' });
    }
    tokens.push(cur);
  }
  return tokens;
}

/**
 * Recursive-descent AST parser for trig expressions in x.
 * Supports fn^p(arg) or fn^p x or fn x as well as standard arithmetic precedence.
 */
export function parseTrigExpr(raw) {
  const tokens = tokenizeTrigExpr(raw);
  let pos = 0;

  const peek = () => tokens[pos] || null;
  const consume = () => tokens[pos++] || null;

  function parseAddSub() {
    let left = parseMulDiv();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const right = parseMulDiv();
      left = { type: 'bin', op, left, right };
    }
    return left;
  }

  function parseMulDiv() {
    let left = parseUnary();
    while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
      const op = consume().value;
      const right = parseUnary();
      left = { type: 'bin', op, left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const arg = parseUnary();
      return op === '-' ? { type: 'neg', arg } : arg;
    }
    return parsePow();
  }

  function parsePow() {
    let base = parsePrimary();
    if (peek() && peek().type === 'op' && peek().value === '^') {
      consume();
      const exp = parseUnary();
      return { type: 'pow', base, exp };
    }
    return base;
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new SyntaxError('Fin inesperado de la expresión.');

    if (tok.type === 'num') {
      consume();
      return { type: 'num', value: tok.value };
    }
    if (tok.type === 'var') {
      consume();
      return { type: 'var', name: tok.name };
    }
    if (tok.type === 'paren' && tok.value === '(') {
      consume();
      const inner = parseAddSub();
      const close = consume();
      if (!close || close.type !== 'paren' || close.value !== ')') {
        throw new SyntaxError('Falta paréntesis de cierre ")".');
      }
      return inner;
    }
    if (tok.type === 'fn') {
      consume();
      let fnPow = null;
      if (peek() && peek().type === 'op' && peek().value === '^') {
        consume();
        fnPow = parsePrimary();
      }
      // Argument can be parenthesized "(...)" or a tight atom like "x" or "2x" (parsePrimary/num*var)
      let arg;
      if (peek() && peek().type === 'paren' && peek().value === '(') {
        consume();
        arg = parseAddSub();
        const close = consume();
        if (!close || close.type !== 'paren' || close.value !== ')') {
          throw new SyntaxError(`Falta ")" en ${tok.name}(...).`);
        }
      } else {
        // Support "sen x" or "cos 2x" -> bind num*var if immediate
        arg = parsePrimary();
        while (peek() && peek().type === 'op' && peek().value === '*') {
          // Only consume implicit multiplication when tight (no space / adjacent var)
          const nextAfter = tokens[pos + 1];
          if (nextAfter && (nextAfter.type === 'var' || nextAfter.type === 'num')) {
            consume();
            const rhs = parsePrimary();
            arg = { type: 'bin', op: '*', left: arg, right: rhs };
          } else {
            break;
          }
        }
      }
      const callNode = { type: 'call', fn: tok.name, arg };
      return fnPow ? { type: 'pow', base: callNode, exp: fnPow } : callNode;
    }

    throw new SyntaxError(`Token inesperado: "${tok.value || tok.type}"`);
  }

  const ast = parseAddSub();
  if (pos < tokens.length) {
    throw new SyntaxError(`Token sobrante inesperado cerca de "${tokens[pos].value || tokens[pos].type}"`);
  }
  return ast;
}

export function evalTrigAst(ast, xVal = 0) {
  if (!ast) return NaN;
  switch (ast.type) {
    case 'num':
      return ast.value;
    case 'var':
      return xVal;
    case 'neg':
      return -evalTrigAst(ast.arg, xVal);
    case 'bin': {
      const l = evalTrigAst(ast.left, xVal);
      const r = evalTrigAst(ast.right, xVal);
      if (!Number.isFinite(l) || !Number.isFinite(r)) return NaN;
      if (ast.op === '+') return l + r;
      if (ast.op === '-') return l - r;
      if (ast.op === '*') return l * r;
      if (ast.op === '/') return Math.abs(r) < 1e-12 ? NaN : l / r;
      return NaN;
    }
    case 'pow': {
      const b = evalTrigAst(ast.base, xVal);
      const e = evalTrigAst(ast.exp, xVal);
      if (!Number.isFinite(b) || !Number.isFinite(e)) return NaN;
      return Math.pow(b, e);
    }
    case 'call': {
      const a = evalTrigAst(ast.arg, xVal);
      if (!Number.isFinite(a)) return NaN;
      if (ast.fn === 'sqrt') return a < 0 ? NaN : Math.sqrt(a);
      return evalTrig(normalizeTrigFnName(ast.fn), a);
    }
    default:
      return NaN;
  }
}

export function evalTrigExpr(exprOrAst, xVal = 0) {
  const ast = typeof exprOrAst === 'string' ? parseTrigExpr(exprOrAst) : exprOrAst;
  return evalTrigAst(ast, xVal);
}
