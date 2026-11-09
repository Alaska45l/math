/**
 * expr.js — Parser AST, Evaluador Puro y Notación de Intervalos para Laboratorio 7.
 * Unidad 08 de Alaska Math Lab (Funciones, Modelos y Ecuaciones Exponenciales).
 * Parser determinista AST puro sin evaluacion dinamica.
 * Cumple con el estándar de notación de la Facultad de Ciencias Exactas UNMDP.
 */

export const MINUS_CHAR = '\u2212'; // '−'

const SUPERSCRIPT_MAP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', 'ᵗ': 't', 'ᵘ': 'u', 'ⁿ': 'n',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
};

export function cleanNumber(v, digits = 10) {
  if (!Number.isFinite(v)) return v;
  if (Math.abs(v - Math.round(v)) < 1e-9) {
    const roundInt = Math.round(v);
    return roundInt === 0 ? 0 : roundInt;
  }
  const factor = 10 ** digits;
  const rounded = Math.round(v * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function syntaxError(message, code, pos = 0) {
  const err = new SyntaxError(message);
  err.code = code;
  err.pos = pos;
  return err;
}

/**
 * Normaliza la entrada de texto matemático.
 */
export function normalizeExpString(src) {
  if (typeof src !== 'string') return '';
  let s = src.trim();
  // Quitar prefijos funcionales: f(x)=, g(x)=, y=, M(t)=, P(t)=, etc.
  s = s.replace(/^\s*(?:[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)|y)\s*=\s*/i, '');
  // Unificar signos menos y guiones tipograficos
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // Unificar multiplicacion
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  // Unificar division (incluyendo ':' canonico de Exactas)
  s = s.replace(/[\u00F7:]/g, '/');
  // Coma decimal argentina entre digitos
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // Superindices Unicode a ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

/**
 * Tokenizador con resolucion de multiplicacion implicita.
 */
export function tokenizeExp(rawInput) {
  const s = normalizeExpString(rawInput);
  if (!s) throw syntaxError('Ingresá una expresión.', 'empty');
  if (s.length > 300) throw syntaxError('La expresión es demasiado larga.', 'too_long');

  const rawTokens = [];
  let i = 0;
  const len = s.length;

  while (i < len) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const rest = s.slice(i);
    // Numero decimal o entero
    const numMatch = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (numMatch) {
      rawTokens.push({ type: 'number', value: parseFloat(numMatch[0]), raw: numMatch[0], pos: i });
      i += numMatch[0].length;
      continue;
    }
    // Identificador: variable o constante (e, pi)
    const wordMatch = rest.match(/^[a-zA-Z]+/);
    if (wordMatch) {
      const name = wordMatch[0];
      const lower = name.toLowerCase();
      if (lower === 'e') {
        rawTokens.push({ type: 'constant', name: 'e', value: Math.E, pos: i });
      } else if (lower === 'pi') {
        rawTokens.push({ type: 'constant', name: 'pi', value: Math.PI, pos: i });
      } else {
        rawTokens.push({ type: 'variable', name: lower, pos: i });
      }
      i += name.length;
      continue;
    }
    // Operadores y parentesis
    if ('+-*/^()'.includes(ch)) {
      rawTokens.push({ type: ch, pos: i });
      i++;
      continue;
    }
    throw syntaxError(`Carácter no permitido: '${ch}'.`, 'unexpected_character', i);
  }

  // Insercion de multiplicacion implicita
  const tokens = [];
  const endsOperand = (t) => t && ['number', 'variable', 'constant', ')'].includes(t.type);
  const startsOperand = (t) => t && ['number', 'variable', 'constant', '('].includes(t.type);

  for (let j = 0; j < rawTokens.length; j++) {
    const t = rawTokens[j];
    tokens.push(t);
    const next = rawTokens[j + 1];
    if (endsOperand(t) && startsOperand(next)) {
      tokens.push({ type: '*', pos: t.pos, implicit: true });
    }
  }

  return tokens;
}

/**
 * Parser Descendente Recursivo.
 */
class ExpParser {
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
      // Exponenciacion es asociativa a derecha; el exponente puede llevar signo unario directo
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
    if (this.peek('(')) {
      this.take('(');
      const n = this.add();
      this.take(')');
      return { type: 'paren', expr: n };
    }
    throw syntaxError('Se esperaba un número, variable o paréntesis.', 'expected_expression', this.tokens[this.i]?.pos || 0);
  }
}

/**
 * Parser del arbol de expresiones.
 */
export function parseExpTree(input) {
  return new ExpParser(tokenizeExp(input)).parse();
}

/**
 * Evaluador Seguro y Puro.
 */
export function evalExpSafe(ast, vars = {}) {
  const vMap = typeof vars === 'number' ? { x: vars, t: vars, u: vars } : (vars || {});
  const fail = (errorReason) => ({ value: NaN, domainError: true, errorReason });

  const ev = (node) => {
    if (!node) return fail('invalid_node');
    if (node.type === 'number') return { value: node.value, domainError: false, errorReason: null };
    if (node.type === 'constant') return { value: node.value, domainError: false, errorReason: null };
    if (node.type === 'variable') {
      const val = vMap[node.name] ?? vMap.x ?? vMap.t ?? vMap.u;
      if (typeof val === 'number' && Number.isFinite(val)) {
        return { value: val, domainError: false, errorReason: null };
      }
      return fail(`missing_variable:${node.name}`);
    }
    if (node.type === 'paren') return ev(node.expr);
    if (node.type === 'neg') {
      const r = ev(node.value);
      return r.domainError ? r : { value: -r.value, domainError: false, errorReason: null };
    }
    if (node.type === 'binary') {
      const l = ev(node.left);
      if (l.domainError) return l;
      const r = ev(node.right);
      if (r.domainError) return r;
      if (node.op === '/' && r.value === 0) return fail('division_by_zero');
      let val = NaN;
      switch (node.op) {
        case '+': val = l.value + r.value; break;
        case '-': val = l.value - r.value; break;
        case '*': val = l.value * r.value; break;
        case '/': val = l.value / r.value; break;
      }
      return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
    }
    if (node.type === 'pow') {
      const b = ev(node.base);
      if (b.domainError) return b;
      const e = ev(node.exponent);
      if (e.domainError) return e;

      if (b.value === 0 && e.value < 0) return fail('zero_to_negative_power');
      if (b.value < 0) {
        // En R, bases negativas con exponente no entero no forman funciones continuas
        if (!Number.isInteger(e.value)) {
          return fail('negative_base_fractional_exp');
        }
      }
      const val = Math.pow(b.value, e.value);
      return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
    }
    return fail('unknown_node_type');
  };

  return ev(ast);
}

/**
 * Evaluador numerico directo (devuelve number o NaN).
 */
export function evalExp(astOrStr, xOrVars = 0) {
  const ast = typeof astOrStr === 'string'
    ? parseExpTree(astOrStr)
    : (astOrStr.tree || astOrStr);
  const res = evalExpSafe(ast, xOrVars);
  return res.value;
}

function hasVariable(node) {
  if (!node) return false;
  if (node.type === 'variable') return true;
  if (node.type === 'paren') return hasVariable(node.expr);
  if (node.type === 'neg') return hasVariable(node.value);
  if (node.type === 'binary') return hasVariable(node.left) || hasVariable(node.right);
  if (node.type === 'pow') return hasVariable(node.base) || hasVariable(node.exponent);
  return false;
}

/**
 * Extrae parametros canonicos k, a, b, h, c de f(x) = k * a^(b*x - h) + c.
 */
export function extractExpParams(tree, input = '') {
  let c = 0;
  let k = 1;
  let powNode = null;

  function unwrap(node) {
    if (!node) return;
    if (node.type === 'paren') {
      unwrap(node.expr);
      return;
    }
    if (node.type === 'neg') {
      k *= -1;
      unwrap(node.value);
      return;
    }
    if (node.type === 'binary') {
      if (node.op === '+' || node.op === '-') {
        const leftHasVar = hasVariable(node.left);
        const rightHasVar = hasVariable(node.right);
        if (!leftHasVar && rightHasVar) {
          const constVal = evalExpSafe(node.left).value;
          c += constVal;
          if (node.op === '-') k *= -1;
          unwrap(node.right);
          return;
        }
        if (leftHasVar && !rightHasVar) {
          const constVal = evalExpSafe(node.right).value;
          c += node.op === '+' ? constVal : -constVal;
          unwrap(node.left);
          return;
        }
      }
      if (node.op === '*') {
        const leftHasVar = hasVariable(node.left);
        const rightHasVar = hasVariable(node.right);
        if (!leftHasVar && rightHasVar) {
          const constVal = evalExpSafe(node.left).value;
          k *= constVal;
          unwrap(node.right);
          return;
        }
        if (leftHasVar && !rightHasVar) {
          const constVal = evalExpSafe(node.right).value;
          k *= constVal;
          unwrap(node.left);
          return;
        }
      }
      if (node.op === '/') {
        const leftHasVar = hasVariable(node.left);
        const rightHasVar = hasVariable(node.right);
        if (leftHasVar && !rightHasVar) {
          const constVal = evalExpSafe(node.right).value;
          k /= constVal;
          unwrap(node.left);
          return;
        }
      }
    }
    if (node.type === 'pow') {
      powNode = node;
      return;
    }
  }

  unwrap(tree);

  let a = 1;
  let b = 1;
  let h = 0;
  let isNaturalBase = false;

  if (powNode) {
    // Inspeccion de la base
    let baseTarget = powNode.base;
    while (baseTarget.type === 'paren') baseTarget = baseTarget.expr;

    if (baseTarget.type === 'constant' && baseTarget.name === 'e') {
      a = Math.E;
      isNaturalBase = true;
    } else {
      const baseRes = evalExpSafe(powNode.base);
      a = cleanNumber(baseRes.value);
      isNaturalBase = Math.abs(a - Math.E) < 1e-9;
    }

    // Inspeccion del exponente: b*x - h
    const e0 = evalExpSafe(powNode.exponent, { x: 0, t: 0, u: 0 }).value;
    const e1 = evalExpSafe(powNode.exponent, { x: 1, t: 1, u: 1 }).value;
    if (Number.isFinite(e0) && Number.isFinite(e1)) {
      b = cleanNumber(e1 - e0);
      h = cleanNumber(-e0);
    }
  }

  return {
    k: cleanNumber(k),
    a: isNaturalBase ? Math.E : cleanNumber(a),
    b: cleanNumber(b),
    h: cleanNumber(h),
    c: cleanNumber(c),
    isNaturalBase,
  };
}

/**
 * Parser canonico de funciones exponenciales f(x) = k * a^(b*x - h) + c.
 */
export function parseExp(input) {
  const tree = parseExpTree(input);
  const params = extractExpParams(tree, input);
  return {
    type: 'exp',
    k: params.k,
    a: params.a,
    b: params.b,
    h: params.h,
    c: params.c,
    isNaturalBase: params.isNaturalBase,
    raw: String(input).trim(),
    tree,
  };
}

/**
 * Formatea un intervalo segun la convencion obligatoria de Exactas UNMDP con separador ';'.
 */
export function formatIntervalExactas(spec, { style = 'ascii', digits = 2 } = {}) {
  if (!spec) return '';
  const emptyStr = style === 'unicode' ? '∅' : 'vacio';
  if (spec.isEmpty) {
    return emptyStr;
  }
  if (spec.isAllReal || (spec.lo === -Infinity && spec.hi === Infinity)) {
    return style === 'unicode' ? 'ℝ' : 'R';
  }
  if (spec.points) {
    if (spec.points.length === 0) return emptyStr;
    const pts = spec.points.map((p) => cleanNumber(p, digits)).join('; ');
    return `{ ${pts} }`;
  }
  if (Number.isFinite(spec.lo) && Number.isFinite(spec.hi)) {
    if (spec.lo > spec.hi || (spec.lo === spec.hi && (spec.loOpen || spec.hiOpen))) {
      return emptyStr;
    }
    if (spec.lo === spec.hi && !spec.loOpen && !spec.hiOpen) {
      return `{ ${cleanNumber(spec.lo, digits)} }`;
    }
  }

  const negInf = style === 'unicode' ? `${MINUS_CHAR}∞` : '-inf';
  const posInf = style === 'unicode' ? '+∞' : '+inf';

  const leftBracket = spec.loOpen ? '(' : '[';
  const rightBracket = spec.hiOpen ? ')' : ']';

  const leftVal = spec.lo === -Infinity ? negInf : cleanNumber(spec.lo, digits);
  const rightVal = spec.hi === Infinity ? posInf : cleanNumber(spec.hi, digits);

  return `${leftBracket}${leftVal}; ${rightVal}${rightBracket}`;
}

/**
 * Parsea un número real o fracción simple p/q (ej. '1/2', '-3/4', '1,5').
 * Lanza SyntaxError si el formato no es válido o hay división por cero.
 */
export function parseNumberOrFraction(v) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) {
      throw syntaxError(`Número no finito: '${v}'.`, 'invalid_endpoint');
    }
    return v;
  }
  if (typeof v !== 'string') {
    throw syntaxError(`Entrada numérica inválida: '${v}'.`, 'invalid_endpoint');
  }
  const trimmed = v.trim().replace(/[\u2212\u2013\u2014]/g, '-');
  if (!trimmed) {
    throw syntaxError('Extremo numérico vacío.', 'invalid_endpoint');
  }

  // Fracción tipo p / q (permite enteros o decimales con '.' o ',')
  const fracMatch = trimmed.match(/^([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*\/\s*([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1].replace(',', '.'));
    const den = parseFloat(fracMatch[2].replace(',', '.'));
    if (den === 0 || !Number.isFinite(den)) {
      throw syntaxError('División por cero en el extremo.', 'division_by_zero');
    }
    const res = num / den;
    if (!Number.isFinite(res)) {
      throw syntaxError(`Extremo numérico inválido: '${v}'.`, 'invalid_endpoint');
    }
    return res;
  }

  // Número decimal o entero único
  if (/^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed)) {
    const res = parseFloat(trimmed.replace(',', '.'));
    if (!Number.isFinite(res)) {
      throw syntaxError(`Extremo numérico inválido: '${v}'.`, 'invalid_endpoint');
    }
    return res;
  }

  throw syntaxError(`Extremo numérico inválido: '${v}'.`, 'invalid_endpoint');
}

/**
 * Parser de intervalos con deteccion de ';' y validacion de sintaxis Exactas.
 */
export function parseIntervalExactas(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw syntaxError('Ingresá un intervalo.', 'empty_interval');
  }
  let s = input.trim().toLowerCase();
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');

  // Reales
  if (['r', 'ir', 'reales', 'real', 'ℝ'].includes(s) || /^\(\s*-inf\s*;\s*\+?inf\s*\)$/.test(s)) {
    return { lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true, isAllReal: true, isEmpty: false };
  }
  // Vacio
  if (['vacio', 'vacío', '∅', '{}', 'none'].includes(s)) {
    return { lo: NaN, hi: NaN, loOpen: true, hiOpen: true, isAllReal: false, isEmpty: true };
  }
  // Conjunto unitario / finito { x0 }
  const setMatch = s.match(/^\{\s*([^}]*)\s*\}$/);
  if (setMatch) {
    const inner = setMatch[1].trim();
    if (!inner) {
      return { lo: NaN, hi: NaN, loOpen: true, hiOpen: true, points: [], isAllReal: false, isEmpty: true };
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
          const parts = inner.split(',').map((x) => x.trim()).filter(Boolean);
          rawItems = parts.map((x) => parseNumberOrFraction(x));
        } else {
          throw err;
        }
      }
    }
    const sorted = [...rawItems].sort((a, b) => a - b);
    return {
      lo: sorted[0],
      hi: sorted[sorted.length - 1],
      loOpen: false,
      hiOpen: false,
      points: rawItems,
      isAllReal: false,
      isEmpty: rawItems.length === 0,
    };
  }

  // Intervalo estandar con separador ';' obligatorio
  const match = s.match(/^([(\[])\s*([^;]+?)\s*;\s*([^;\])]+?)\s*([)\]])$/);
  if (!match) {
    if (s.includes(',') && !s.includes(';')) {
      const err = syntaxError("En Exactas los intervalos se separan con punto y coma ';' (la coma es decimal).", 'missing_semicolon');
      err.closedBracket = s.includes('[');
      throw err;
    }
    throw syntaxError("Formato de intervalo inválido. Usá el formato '(a; b)' o '[a; b)'.", 'invalid_interval_format');
  }

  const [, openB, leftRaw, rightRaw, closeB] = match;
  const loOpen = openB === '(';
  const hiOpen = closeB === ')';

  const parseEndpoint = (valStr) => {
    const v = valStr.trim();
    if (v === '-inf' || v === '-oo' || v === '-∞' || v === `${MINUS_CHAR}∞`) return -Infinity;
    if (v === '+inf' || v === 'inf' || v === '+oo' || v === 'oo' || v === '+∞' || v === '∞') return Infinity;
    return parseNumberOrFraction(v);
  };

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

  return { lo, hi, loOpen, hiOpen, isAllReal: false, isEmpty: false };
}

/**
 * Comprueba si dos expresiones exponenciales son matematicamente equivalentes en R.
 */
export function equivalentExp(exprA, exprB) {
  if (!exprA || !exprB) return false;
  const testPoints = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 5];
  let validMatches = 0;

  for (const x of testPoints) {
    const valA = evalExp(exprA, x);
    const valB = evalExp(exprB, x);

    const aNaN = Number.isNaN(valA);
    const bNaN = Number.isNaN(valB);

    if (aNaN && bNaN) continue;
    if (aNaN !== bNaN) return false;

    if (Math.abs(valA - valB) > 1e-6 * Math.max(1, Math.abs(valA), Math.abs(valB))) {
      return false;
    }
    validMatches++;
  }

  return validMatches >= 3;
}
