/**
 * @file js/core/learning/transfer-classifiers/shared-ast.js
 * Pure, eval()-free recursive-descent math AST, Exactas UNMDP number/interval parser,
 * polynomial coefficient extractor (via js/core/math/polynomials.js), and domain-aware
 * mathematical equivalence engine.
 *
 * ZERO imports from js/modules/*. Zero DOM. Zero eval(). Zero Unicode emojis.
 */

import {
  parsePolynomialExpr,
  polyEqual,
  ratToNumber,
} from '../../math/polynomials.js';

export const MINUS_CHAR = '\u2212';

const SUPERSCRIPT_MAP = Object.freeze({
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', 'ᵗ': 't', 'ᵘ': 'u', 'ⁿ': 'n',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
});

const SUBSCRIPT_DIGIT_MAP = Object.freeze({
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
});

const KNOWN_FUNCTIONS = new Set([
  'sqrt', 'raiz', 'root', 'abs',
  'ln', 'log',
  'sin', 'sen', 'cos', 'tan', 'tg', 'csc', 'cosec', 'sec', 'cot', 'cotg',
]);

const DEFAULT_SAMPLE_POINTS = Object.freeze([
  -5, -3.14, -2, -1.5, -1, -0.5, 0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 8,
]);

function syntaxError(message, code = 'syntax_error', pos = 0) {
  const err = new SyntaxError(message);
  err.code = code;
  err.pos = pos;
  return err;
}

/**
 * Parses a number, decimal (',' or '.'), fraction 'p/q', or simple pi/e expression.
 * Preserves 3-decimal dot notation (e.g. '0.366' -> 0.366).
 * Throws SyntaxError on invalid syntax or division by zero.
 *
 * @param {number|string} raw
 * @returns {number}
 */
export function parseNumberOrFraction(raw) {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      throw syntaxError(`Número no finito: '${raw}'.`, 'invalid_number');
    }
    return Object.is(raw, -0) ? 0 : raw;
  }
  if (typeof raw !== 'string') {
    throw syntaxError(`Entrada numérica inválida: '${raw}'.`, 'invalid_number');
  }

  let s = raw.trim().replace(/[\u2212\u2013\u2014]/g, '-');
  if (!s) {
    throw syntaxError('Valor numérico vacío.', 'empty_number');
  }

  // Strip balanced outer parentheses
  while (s.startsWith('(') && s.endsWith(')')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) break;
    s = inner;
  }

  // Normalize pi symbol and decimal comma (only between digits or leading)
  s = s.replace(/π/g, 'pi').replace(/(\d),(\d)/g, '$1.$2');

  // Exact constants pi, e or simple multiples/fractions like '-3*pi/4', 'pi/2', '2pi'
  const constTerm = (tokenStr) => {
    const t = tokenStr.trim().toLowerCase().replace(/\s+/g, '');
    if (t === 'pi' || t === '+pi') return Math.PI;
    if (t === '-pi') return -Math.PI;
    if (t === 'e' || t === '+e') return Math.E;
    if (t === '-e') return -Math.E;
    const piMul = t.match(/^([-+]?(?:\d+(?:\.\d*)?|\.\d+))\*?(pi|e)$/);
    if (piMul) {
      const k = parseFloat(piMul[1]);
      return k * (piMul[2] === 'pi' ? Math.PI : Math.E);
    }
    if (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)) {
      return parseFloat(t);
    }
    return NaN;
  };

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2) {
      throw syntaxError(`Fracción inválida: '${raw}'.`, 'invalid_fraction');
    }
    const leftClean = parts[0].trim().replace(/^\((.*)\)$/, '$1');
    const rightClean = parts[1].trim().replace(/^\((.*)\)$/, '$1');
    const num = constTerm(leftClean);
    const den = constTerm(rightClean);
    if (!Number.isFinite(num) || !Number.isFinite(den)) {
      throw syntaxError(`Fracción inválida: '${raw}'.`, 'invalid_fraction');
    }
    if (den === 0) {
      throw syntaxError('División por cero.', 'division_by_zero');
    }
    const res = num / den;
    if (!Number.isFinite(res)) {
      throw syntaxError(`Valor numérico inválido: '${raw}'.`, 'invalid_number');
    }
    return Object.is(res, -0) ? 0 : res;
  }

  const val = constTerm(s);
  if (!Number.isFinite(val)) {
    throw syntaxError(`Valor numérico inválido: '${raw}'.`, 'invalid_number');
  }
  return Object.is(val, -0) ? 0 : val;
}

function parseEndpoint(valStr) {
  const v = String(valStr || '')
    .trim()
    .toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, '');
  if (v === '-inf' || v === '-oo' || v === '-∞') return -Infinity;
  if (v === '+inf' || v === 'inf' || v === '+oo' || v === 'oo' || v === '+∞' || v === '∞') {
    return Infinity;
  }
  return parseNumberOrFraction(valStr);
}

function parseSingleSimpleInterval(part) {
  const s = part.trim();
  const match = s.match(/^([(\[])\s*([^;]+?)\s*;\s*([^;\])]+?)\s*([)\]])$/);
  if (!match) {
    if (s.includes(',') && !s.includes(';')) {
      const err = syntaxError(
        "En Exactas los intervalos se separan con punto y coma ';' (la coma es decimal).",
        'missing_semicolon'
      );
      err.closedBracket = s.includes('[');
      throw err;
    }
    throw syntaxError(
      "Formato de intervalo inválido. Usá el formato '(a; b)' o '[a; b)'.",
      'invalid_interval_format'
    );
  }

  const [, openB, leftRaw, rightRaw, closeB] = match;
  const loOpen = openB === '(';
  const hiOpen = closeB === ')';
  const lo = parseEndpoint(leftRaw);
  const hi = parseEndpoint(rightRaw);

  if (lo === Infinity || hi === -Infinity) {
    throw syntaxError('El orden de los extremos es inconsistente.', 'inverted_infinities');
  }
  if (!loOpen && lo === -Infinity) {
    throw syntaxError('El infinito no puede llevar corchete cerrado.', 'closed_bracket_on_infinity');
  }
  if (!hiOpen && hi === Infinity) {
    throw syntaxError('El infinito no puede llevar corchete cerrado.', 'closed_bracket_on_infinity');
  }
  if (lo > hi || (lo === hi && (loOpen || hiOpen))) {
    return { lo: NaN, hi: NaN, loOpen: true, hiOpen: true, isAllReal: false, isEmpty: true };
  }

  return {
    lo,
    hi,
    loOpen,
    hiOpen,
    isAllReal: lo === -Infinity && hi === Infinity && loOpen && hiOpen,
    isEmpty: false,
  };
}

function normalizeIntervals(intervals) {
  const valid = intervals
    .filter((iv) => iv && !iv.isEmpty && Number.isFinite(iv.lo <= iv.hi ? 0 : NaN))
    .filter((iv) => iv.lo < iv.hi || (iv.lo === iv.hi && !iv.loOpen && !iv.hiOpen))
    .map((iv) => ({
      lo: iv.lo,
      hi: iv.hi,
      loOpen: iv.lo === -Infinity ? true : Boolean(iv.loOpen),
      hiOpen: iv.hi === Infinity ? true : Boolean(iv.hiOpen),
    }))
    .sort((a, b) => (a.lo !== b.lo ? a.lo - b.lo : (a.loOpen ? 1 : 0) - (b.loOpen ? 1 : 0)));

  if (valid.length === 0) return [];
  const merged = [valid[0]];
  for (let i = 1; i < valid.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = valid[i];
    const touches = cur.lo < prev.hi || (Math.abs(cur.lo - prev.hi) < 1e-9 && (!prev.hiOpen || !cur.loOpen));
    if (touches) {
      if (cur.hi > prev.hi) {
        prev.hi = cur.hi;
        prev.hiOpen = cur.hiOpen;
      } else if (Math.abs(cur.hi - prev.hi) < 1e-9) {
        prev.hiOpen = prev.hiOpen && cur.hiOpen;
      }
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

/**
 * Parses Exactas UNMDP interval/set notation:
 * (a; b), [a; b], ±inf, ℝ/R, ∅/vacio/{}, unions ∪/U, ℝ - {a; b}, singletons {a; b}.
 *
 * @param {string} input
 * @returns {object}
 */
export function parseIntervalExactas(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw syntaxError('Ingresá un intervalo.', 'empty_interval');
  }
  let s = input.trim();
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  const lower = s.toLowerCase();

  // All reals
  if (
    ['r', 'ir', 'reales', 'real', 'ℝ'].includes(lower) ||
    /^\(\s*-inf\s*;\s*\+?inf\s*\)$/i.test(lower)
  ) {
    const full = { lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true };
    return {
      ...full,
      intervals: [full],
      isAllReal: true,
      isEmpty: false,
    };
  }

  // Empty set
  if (['vacio', 'vacío', '∅', '{}', 'none'].includes(lower)) {
    return {
      lo: NaN,
      hi: NaN,
      loOpen: true,
      hiOpen: true,
      intervals: [],
      isAllReal: false,
      isEmpty: true,
    };
  }

  // R - { a; b }
  const rMinusMatch = s.match(/^(?:r|ℝ|reales)\s*-\s*\{\s*([^}]*)\s*\}$/i);
  if (rMinusMatch) {
    const inner = rMinusMatch[1].trim();
    if (!inner) {
      const full = { lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true };
      return { ...full, intervals: [full], isAllReal: true, isEmpty: false };
    }
    const rawItems = inner.includes(';')
      ? inner.split(';').map((x) => x.trim()).filter(Boolean).map((x) => parseNumberOrFraction(x))
      : [parseNumberOrFraction(inner)];
    const excluded = Array.from(new Set(rawItems)).sort((a, b) => a - b);
    const pieces = [];
    let prev = -Infinity;
    for (const hole of excluded) {
      pieces.push({ lo: prev, hi: hole, loOpen: true, hiOpen: true });
      prev = hole;
    }
    pieces.push({ lo: prev, hi: Infinity, loOpen: true, hiOpen: true });
    const intervals = normalizeIntervals(pieces);
    return {
      lo: -Infinity,
      hi: Infinity,
      loOpen: true,
      hiOpen: true,
      excluded,
      intervals,
      isAllReal: intervals.length === 1 && intervals[0].lo === -Infinity && intervals[0].hi === Infinity,
      isEmpty: false,
    };
  }

  // Finite set { a; b }
  const setMatch = s.match(/^\{\s*([^}]*)\s*\}$/);
  if (setMatch) {
    const inner = setMatch[1].trim();
    if (!inner) {
      return {
        lo: NaN,
        hi: NaN,
        loOpen: true,
        hiOpen: true,
        points: [],
        intervals: [],
        isAllReal: false,
        isEmpty: true,
      };
    }
    let rawItems;
    if (inner.includes(';')) {
      const parts = inner.split(';').map((x) => x.trim()).filter(Boolean);
      rawItems = parts.map((x) => parseNumberOrFraction(x));
    } else {
      try {
        rawItems = [parseNumberOrFraction(inner)];
      } catch (err) {
        if (inner.includes(',')) {
          throw syntaxError(
            "En Exactas los elementos de un conjunto se separan con punto y coma ';' (la coma es decimal).",
            'missing_semicolon'
          );
        }
        throw err;
      }
    }
    const sorted = [...rawItems].sort((a, b) => a - b);
    return {
      lo: sorted[0],
      hi: sorted[sorted.length - 1],
      loOpen: false,
      hiOpen: false,
      points: sorted,
      intervals: sorted.map((p) => ({ lo: p, hi: p, loOpen: false, hiOpen: false })),
      isAllReal: false,
      isEmpty: sorted.length === 0,
    };
  }

  // Union of intervals (∪ or U)
  if (/[∪]/.test(s) || /\)\s*u\s*\(|\)\s*u\s*\[|\]\s*u\s*\(|\]\s*u\s*\[/i.test(s)) {
    const parts = s.split(/\s*[∪uU]\s*/).filter(Boolean);
    if (parts.length < 2) {
      throw syntaxError('Unión de intervalos incompleta.', 'invalid_union');
    }
    const parsedParts = parts.map((p) => parseSingleSimpleInterval(p));
    const intervals = normalizeIntervals(parsedParts);
    if (intervals.length === 0) {
      return { lo: NaN, hi: NaN, loOpen: true, hiOpen: true, intervals: [], isAllReal: false, isEmpty: true };
    }
    return {
      lo: intervals[0].lo,
      hi: intervals[intervals.length - 1].hi,
      loOpen: intervals[0].loOpen,
      hiOpen: intervals[intervals.length - 1].hiOpen,
      intervals,
      isAllReal: intervals.length === 1 && intervals[0].lo === -Infinity && intervals[0].hi === Infinity,
      isEmpty: false,
    };
  }

  const single = parseSingleSimpleInterval(s);
  return {
    ...single,
    intervals: single.isEmpty ? [] : [{ lo: single.lo, hi: single.hi, loOpen: single.loOpen, hiOpen: single.hiOpen }],
  };
}

/**
 * Checks whether two Exactas interval/set strings represent the exact same real set.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function equivalentIntervalExactas(a, b) {
  try {
    const ia = parseIntervalExactas(String(a));
    const ib = parseIntervalExactas(String(b));
    if (ia.isEmpty && ib.isEmpty) return true;
    if (ia.isEmpty !== ib.isEmpty) return false;
    if (ia.isAllReal && ib.isAllReal) return true;
    if (ia.isAllReal !== ib.isAllReal) return false;

    const listA = ia.intervals || [];
    const listB = ib.intervals || [];
    if (listA.length !== listB.length) return false;

    const eqBound = (x, y) => (x === y) || (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < 1e-4);
    for (let i = 0; i < listA.length; i++) {
      const p = listA[i];
      const q = listB[i];
      if (p.loOpen !== q.loOpen || p.hiOpen !== q.hiOpen) return false;
      if (!eqBound(p.lo, q.lo) || !eqBound(p.hi, q.hi)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a mathematical expression string for AST tokenization.
 */
export function normalizeMathString(rawInput) {
  if (typeof rawInput !== 'string') return '';
  let s = rawInput.trim();
  // Strip functional prefix: f(x)=, g(x)=, y=, h(t)=, etc.
  s = s.replace(/^\s*(?:[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)|y)\s*=\s*/i, '');
  // Normalize minus, multiplication, division
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  s = s.replace(/[\u00F7:]/g, '/');
  // Argentine decimal comma only between digits (preserves log(2, x) argument comma!)
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // Replace π with pi
  s = s.replace(/π/g, 'pi');
  // Replace nth root patterns like ³√(x) or √(x) or √2
  s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*√\s*\(([^)]+)\)/g, (_, sup, arg) => {
    const n = Array.from(sup).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `root(${n},${arg})`;
  });
  s = s.replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)');
  s = s.replace(/√\s*([a-zA-Z0-9_.]+)/g, 'sqrt($1)');
  // Normalize log subscripts: log₂(x) or log_2(x) -> log(2, x); log_e(x) -> ln(x)
  s = s.replace(/log_?([₀₁₂₃₄₅₆₇₈₉]+|[0-9]+(?:\.[0-9]+)?|e)\s*\(/gi, (_, baseRaw) => {
    const base = Array.from(baseRaw).map((c) => SUBSCRIPT_DIGIT_MAP[c] || c).join('');
    if (base.toLowerCase() === 'e') return 'ln(';
    return `log(${base},`;
  });
  // Unicode superscripts -> ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

/**
 * Tokenizes normalized expression string into AST tokens with implicit multiplication.
 */
export function tokenizeMathExpr(rawInput) {
  const s = normalizeMathString(rawInput);
  if (!s) throw syntaxError('Ingresá una expresión.', 'empty');
  if (s.length > 300) throw syntaxError('La expresión es demasiado larga.', 'too_long');

  const rawTokens = [];
  let i = 0;
  const len = s.length;

  while (i < len) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    const rest = s.slice(i);
    const numMatch = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (numMatch) {
      rawTokens.push({ type: 'number', value: parseFloat(numMatch[0]), raw: numMatch[0], pos: i });
      i += numMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[a-zA-Z]+/);
    if (wordMatch) {
      const word = wordMatch[0];
      const lower = word.toLowerCase();

      if (KNOWN_FUNCTIONS.has(lower)) {
        rawTokens.push({ type: 'func', name: lower, pos: i });
      } else if (lower === 'e') {
        rawTokens.push({ type: 'constant', name: 'e', value: Math.E, pos: i });
      } else if (lower === 'pi') {
        rawTokens.push({ type: 'constant', name: 'pi', value: Math.PI, pos: i });
      } else if (lower.length === 1) {
        rawTokens.push({ type: 'variable', name: lower, pos: i });
      } else {
        // Check if word ends with a known function, e.g. 'xsen' -> 'x', 'sen'
        let splitFunc = null;
        for (const fn of KNOWN_FUNCTIONS) {
          if (lower.endsWith(fn) && lower.length > fn.length) {
            const prefix = lower.slice(0, lower.length - fn.length);
            if (/^[xtun]+$/.test(prefix)) {
              splitFunc = { prefix, fn };
              break;
            }
          }
        }
        if (splitFunc) {
          for (let k = 0; k < splitFunc.prefix.length; k++) {
            rawTokens.push({ type: 'variable', name: splitFunc.prefix[k], pos: i + k });
          }
          rawTokens.push({ type: 'func', name: splitFunc.fn, pos: i + splitFunc.prefix.length });
        } else {
          for (let k = 0; k < lower.length; k++) {
            rawTokens.push({ type: 'variable', name: lower[k], pos: i + k });
          }
        }
      }
      i += word.length;
      continue;
    }

    if ('+-*/^(),[]'.includes(ch)) {
      const mapped = ch === '[' ? '(' : ch === ']' ? ')' : ch;
      rawTokens.push({ type: mapped, pos: i });
      i += 1;
      continue;
    }

    throw syntaxError(`Carácter no permitido: '${ch}'.`, 'unexpected_character', i);
  }

  // Insert implicit multiplication
  const tokens = [];
  const endsOperand = (t) => t && ['number', 'variable', 'constant', ')'].includes(t.type);
  const startsOperand = (t) => t && ['number', 'variable', 'constant', '(', 'func'].includes(t.type);

  for (let j = 0; j < rawTokens.length; j++) {
    const t = rawTokens[j];
    const prev = tokens[tokens.length - 1];
    if (endsOperand(prev) && startsOperand(t)) {
      tokens.push({ type: '*', pos: t.pos, implicit: true });
    }
    tokens.push(t);
  }

  return tokens;
}

class MathAstParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.i = 0;
  }
  peek(type) {
    return this.tokens[this.i]?.type === type;
  }
  take(type) {
    if (!this.peek(type)) {
      throw syntaxError(`Se esperaba '${type}'.`, 'expected_token', this.tokens[this.i]?.pos || 0);
    }
    return this.tokens[this.i++];
  }
  parse() {
    const ast = this.add();
    if (this.i < this.tokens.length) {
      throw syntaxError('Token inesperado al final de la expresión.', 'trailing_token', this.tokens[this.i].pos);
    }
    return ast;
  }
  add() {
    let n = this.mul();
    while (this.peek('+') || this.peek('-')) {
      const op = this.tokens[this.i++].type;
      n = { type: 'binary', op, left: n, right: this.mul() };
    }
    return n;
  }
  mul() {
    let n = this.unary();
    while (this.peek('*') || this.peek('/')) {
      const op = this.tokens[this.i++].type;
      n = { type: 'binary', op, left: n, right: this.unary() };
    }
    return n;
  }
  unary() {
    if (this.peek('+')) {
      this.i++;
      return this.unary();
    }
    if (this.peek('-')) {
      this.i++;
      return { type: 'neg', value: this.unary() };
    }
    return this.power();
  }
  power() {
    let n = this.primary();
    if (this.peek('^')) {
      this.take('^');
      const exp = this.unary();
      n = { type: 'pow', base: n, exponent: exp };
    }
    return n;
  }
  primary() {
    if (this.peek('number')) {
      const t = this.tokens[this.i++];
      return { type: 'number', value: t.value, raw: t.raw };
    }
    if (this.peek('constant')) {
      const t = this.tokens[this.i++];
      return { type: 'constant', name: t.name, value: t.value };
    }
    if (this.peek('variable')) {
      const t = this.tokens[this.i++];
      return { type: 'variable', name: t.name };
    }
    if (this.peek('func')) {
      const fnTok = this.tokens[this.i++];
      this.take('(');
      const args = [this.add()];
      while (this.peek(',')) {
        this.take(',');
        args.push(this.add());
      }
      this.take(')');
      return { type: 'call', name: fnTok.name, args };
    }
    if (this.peek('(')) {
      this.take('(');
      const n = this.add();
      this.take(')');
      return { type: 'paren', expr: n };
    }
    throw syntaxError(
      'Se esperaba un número, variable, función o paréntesis.',
      'expected_expression',
      this.tokens[this.i]?.pos || 0
    );
  }
}

/**
 * Parses a mathematical expression string into a pure AST (zero eval).
 *
 * @param {string} raw
 * @returns {object}
 */
export function parseMathAst(raw) {
  const tokens = tokenizeMathExpr(raw);
  return new MathAstParser(tokens).parse();
}

/**
 * Checks if an AST node contains any variable (or a specific variable).
 */
export function astContainsVar(node, targetVar = null) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'variable') {
    return targetVar ? node.name === targetVar : true;
  }
  if (node.type === 'paren') return astContainsVar(node.expr, targetVar);
  if (node.type === 'neg') return astContainsVar(node.value, targetVar);
  if (node.type === 'binary') {
    return astContainsVar(node.left, targetVar) || astContainsVar(node.right, targetVar);
  }
  if (node.type === 'pow') {
    return astContainsVar(node.base, targetVar) || astContainsVar(node.exponent, targetVar);
  }
  if (node.type === 'call') {
    return node.args.some((arg) => astContainsVar(arg, targetVar));
  }
  return false;
}

/**
 * Evaluates a parsed math AST safely at x (or variable map).
 * Returns NaN on domain violations (division by zero, even root of negative, log <= 0, trig poles).
 *
 * @param {object} ast
 * @param {number|object} xOrVars
 * @returns {number}
 */
export function evalMathAst(ast, xOrVars) {
  const vMap = typeof xOrVars === 'number'
    ? { x: xOrVars, t: xOrVars, u: xOrVars, n: xOrVars }
    : (xOrVars || {});

  const ev = (node) => {
    if (!node) return NaN;
    if (node.type === 'number' || node.type === 'constant') return node.value;
    if (node.type === 'variable') {
      const val = vMap[node.name] ?? vMap.x ?? vMap.t ?? vMap.u;
      return typeof val === 'number' && Number.isFinite(val) ? val : NaN;
    }
    if (node.type === 'paren') return ev(node.expr);
    if (node.type === 'neg') {
      const v = ev(node.value);
      return Number.isFinite(v) ? -v : NaN;
    }
    if (node.type === 'binary') {
      const l = ev(node.left);
      const r = ev(node.right);
      if (!Number.isFinite(l) || !Number.isFinite(r)) return NaN;
      if (node.op === '+') return l + r;
      if (node.op === '-') return l - r;
      if (node.op === '*') return l * r;
      if (node.op === '/') return Math.abs(r) < 1e-12 ? NaN : l / r;
      return NaN;
    }
    if (node.type === 'pow') {
      const b = ev(node.base);
      const e = ev(node.exponent);
      if (!Number.isFinite(b) || !Number.isFinite(e)) return NaN;
      if (b === 0 && e <= 0) return NaN;
      if (b < 0) {
        if (Number.isInteger(e)) return Math.pow(b, e);
        // Check rational exponent p/q with small odd denominator
        for (const q of [3, 5, 7, 9]) {
          const p = Math.round(e * q);
          if (Math.abs(e - p / q) < 1e-9) {
            const val = Math.pow(-b, p / q);
            return p % 2 !== 0 ? -val : val;
          }
        }
        return NaN;
      }
      const res = Math.pow(b, e);
      return Number.isFinite(res) ? res : NaN;
    }
    if (node.type === 'call') {
      const fn = node.name;
      const a0 = ev(node.args[0]);
      if (!Number.isFinite(a0)) return NaN;
      if (fn === 'sqrt' || fn === 'raiz') {
        if (node.args.length !== 1 || a0 < -1e-12) return NaN;
        return Math.sqrt(Math.max(0, a0));
      }
      if (fn === 'root') {
        if (node.args.length !== 2) return NaN;
        const n = Math.round(a0);
        const rad = ev(node.args[1]);
        if (!Number.isFinite(rad) || n < 2 || Math.abs(a0 - n) > 1e-9) return NaN;
        if (rad < 0) {
          if (n % 2 === 0) return NaN;
          return -Math.pow(-rad, 1 / n);
        }
        return Math.pow(rad, 1 / n);
      }
      if (fn === 'abs') return Math.abs(a0);
      if (fn === 'ln') return a0 <= 0 ? NaN : Math.log(a0);
      if (fn === 'log') {
        if (node.args.length === 1) {
          return a0 <= 0 ? NaN : Math.log10(a0);
        }
        if (node.args.length === 2) {
          const arg = ev(node.args[1]);
          if (!Number.isFinite(arg) || a0 <= 0 || Math.abs(a0 - 1) < 1e-12 || arg <= 0) {
            return NaN;
          }
          return Math.log(arg) / Math.log(a0);
        }
        return NaN;
      }
      if (fn === 'sin' || fn === 'sen') return Math.sin(a0);
      if (fn === 'cos') return Math.cos(a0);
      if (fn === 'tan' || fn === 'tg') {
        const c = Math.cos(a0);
        return Math.abs(c) < 1e-10 ? NaN : Math.sin(a0) / c;
      }
      if (fn === 'csc' || fn === 'cosec') {
        const s = Math.sin(a0);
        return Math.abs(s) < 1e-10 ? NaN : 1 / s;
      }
      if (fn === 'sec') {
        const c = Math.cos(a0);
        return Math.abs(c) < 1e-10 ? NaN : 1 / c;
      }
      if (fn === 'cot' || fn === 'cotg') {
        const s = Math.sin(a0);
        return Math.abs(s) < 1e-10 ? NaN : Math.cos(a0) / s;
      }
    }
    return NaN;
  };

  return ev(ast);
}

/**
 * Attempts to expand a polynomial expression using js/core/math/polynomials.js.
 * Returns null if the expression is not a polynomial over Q[x].
 *
 * @param {string} raw
 * @returns {object|null}
 */
export function tryExtractPolynomialCoeffs(raw) {
  try {
    const cleaned = String(raw || '').trim().replace(/\s*=\s*0\s*$/, '');
    if (!cleaned) return null;
    const parsed = parsePolynomialExpr(cleaned);
    if (!parsed || !parsed.ok) return null;
    const coeffsNum = parsed.coeffs.map((r) => ratToNumber(r));
    const c = coeffsNum[0] || 0;
    const b = coeffsNum[1] || 0;
    const a = coeffsNum[2] || 0;
    return {
      ok: true,
      degree: parsed.degree,
      isZero: parsed.isZero,
      variable: parsed.variable,
      coeffsRat: parsed.coeffs,
      coeffsNum,
      coeffs: { a, b, c },
      formatted: parsed.formatted,
    };
  } catch {
    return null;
  }
}

/**
 * Checks mathematical equivalence between two expression strings using exact polynomial
 * equality first and domain-aware dense AST sampling otherwise.
 *
 * @param {string} inputA
 * @param {string} inputB
 * @param {object} [options]
 * @param {number[]} [options.samplePoints]
 * @returns {boolean}
 */
export function equivalentMathExpr(inputA, inputB, { samplePoints = DEFAULT_SAMPLE_POINTS } = {}) {
  const strA = String(inputA ?? '').trim();
  const strB = String(inputB ?? '').trim();
  if (!strA || !strB) return false;

  // 1. Exact rational polynomial equivalence check
  const polyA = tryExtractPolynomialCoeffs(strA);
  const polyB = tryExtractPolynomialCoeffs(strB);
  if (polyA && polyB) {
    return polyEqual(polyA.coeffsRat, polyB.coeffsRat);
  }

  // 2. Domain-aware dense AST sampling
  let astA;
  let astB;
  try {
    astA = parseMathAst(strA);
    astB = parseMathAst(strB);
  } catch {
    return false;
  }

  let validMatches = 0;
  for (const x of samplePoints) {
    const va = evalMathAst(astA, x);
    const vb = evalMathAst(astB, x);
    const aDef = Number.isFinite(va);
    const bDef = Number.isFinite(vb);
    if (!aDef && !bDef) continue;
    if (aDef !== bDef) return false;

    const tol = 1e-5 * Math.max(1, Math.abs(va), Math.abs(vb));
    if (Math.abs(va - vb) > tol) return false;
    validMatches += 1;
  }

  return validMatches >= 4;
}
