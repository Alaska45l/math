/**
 * expr.js — Parser AST puro, Evaluador de Dominio y Notación de Intervalos para Unidad 09.
 * Función Logarítmica (logaritmicas.html) · Alaska Math Lab.
 * Cero eval(), cero new Function(). Reutiliza helpers puros de exponenciales/expr.js.
 */

import {
  cleanNumber,
  parseNumberOrFraction,
  parseIntervalExactas,
  formatIntervalExactas,
  MINUS_CHAR,
} from '../exponenciales/expr.js';

export {
  cleanNumber,
  parseNumberOrFraction,
  parseIntervalExactas,
  formatIntervalExactas,
  MINUS_CHAR,
};

const SUPERSCRIPT_MAP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', 'ᵗ': 't', 'ᵘ': 'u', 'ⁿ': 'n',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
};

const SUBSCRIPT_MAP = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  'ₐ': 'a', 'ₑ': 'e', 'ₓ': 'x', 'ₙ': 'n',
  '₍': '(', '₎': ')', '₋': '-', '₊': '+',
};

function syntaxError(message, code, pos = 0) {
  const err = new SyntaxError(message);
  err.code = code;
  err.pos = pos;
  return err;
}

/**
 * Normaliza entradas matemáticas logarítmicas y mixtas.
 */
export function normalizeLogString(src) {
  if (typeof src !== 'string') return '';
  let s = src.trim();
  // Quitar prefijos funcionales: f(x)=, f^-1(x)=, f⁻¹(x)=, g(x)=, y=, B(t)=, etc.
  s = s.replace(/^\s*(?:[a-zA-Z](?:\s*\^\s*-?1|\u207b\u00b9)?\s*\(\s*[a-zA-Z]\s*\)|y)\s*=\s*/i, '');
  // Unificar signos menos y guiones tipográficos
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // Unificar multiplicación
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  // Unificar división (incluyendo ':' canónico de Exactas)
  s = s.replace(/[\u00F7:]/g, '/');
  // Coma decimal argentina entre dígitos
  s = s.replace(/(\d),(\d)/g, '$1.$2');

  // Símbolo de raíz cuadrada √(expr) o √expr
  s = s.replace(/√\s*\(/g, 'sqrt(');
  s = s.replace(/√\s*([a-zA-Z0-9.]+)/g, 'sqrt($1)');

  // Subíndices Unicode en logaritmos: log₂(x), log₁₀(x), logₐ(x), etc.
  s = s.replace(/log([₀₁₂₃₄₅₆₇₈₉ₐₑₓₙ₍₎₋₊]+)/gi, (_, sub) => {
    const converted = Array.from(sub).map((c) => SUBSCRIPT_MAP[c] || c).join('');
    return `log_(${converted})`;
  });

  // log_{base}(x) -> log_(base)(x)
  s = s.replace(/log_\{([^}]+)\}/gi, 'log_($1)');
  // log_base(x) donde base es fracción simple o alfanumérico sin paréntesis
  s = s.replace(/log_([0-9]+(?:\.[0-9]+)?\/[0-9]+(?:\.[0-9]+)?|[a-zA-Z0-9.]+)(?=\s*\()/gi, 'log_($1)');
  // log2(x) / log10(x) escritos sin guion bajo
  s = s.replace(/\blog(\d+(?:\.\d+)?)\s*\(/gi, 'log_($1)(');

  // Superíndices Unicode a ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });

  return s;
}

/**
 * Tokenizador determinista con inserción segura de multiplicación implícita.
 */
export function tokenizeLog(rawInput) {
  const s = normalizeLogString(rawInput);
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

    const numMatch = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (numMatch) {
      rawTokens.push({ type: 'number', value: parseFloat(numMatch[0]), raw: numMatch[0], pos: i });
      i += numMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[a-zA-Z]+/);
    if (wordMatch) {
      const name = wordMatch[0];
      const lower = name.toLowerCase();
      if (lower === 'ln' || lower === 'log' || lower === 'sqrt' || lower === 'root') {
        rawTokens.push({ type: 'func', name: lower, pos: i });
      } else if (lower === 'e') {
        rawTokens.push({ type: 'constant', name: 'e', value: Math.E, pos: i });
      } else if (lower === 'pi') {
        rawTokens.push({ type: 'constant', name: 'pi', value: Math.PI, pos: i });
      } else if (name.length > 1) {
        // Permite secuencias como xy o ax si no son palabras reservadas
        for (let k = 0; k < lower.length; k++) {
          const chName = lower[k];
          if (chName === 'e') {
            rawTokens.push({ type: 'constant', name: 'e', value: Math.E, pos: i + k });
          } else {
            rawTokens.push({ type: 'variable', name: chName, pos: i + k });
          }
        }
      } else {
        rawTokens.push({ type: 'variable', name: lower, pos: i });
      }
      i += name.length;
      continue;
    }

    if ('+-*/^(),_'.includes(ch)) {
      rawTokens.push({ type: ch, pos: i });
      i++;
      continue;
    }

    throw syntaxError(`Carácter no permitido: '${ch}'.`, 'unexpected_character', i);
  }

  // Multiplicación implícita respetando llamadas de función y subíndices log_(base)(arg)
  const tokens = [];
  const endsOperand = (t) => t && ['number', 'variable', 'constant', ')'].includes(t.type);
  const startsOperand = (t) => t && ['number', 'variable', 'constant', 'func', '('].includes(t.type);

  // Marcamos los paréntesis de cierre que pertenecen al subíndice de log_(...) para no insertar '*'
  let inLogSub = false;
  let subDepth = 0;

  for (let j = 0; j < rawTokens.length; j++) {
    const t = rawTokens[j];
    const prev = rawTokens[j - 1];
    const next = rawTokens[j + 1];

    if (prev && prev.type === 'func' && prev.name === 'log' && t.type === '_') {
      inLogSub = true;
      subDepth = 0;
    }
    if (inLogSub) {
      if (t.type === '(') subDepth++;
      else if (t.type === ')') {
        subDepth--;
        if (subDepth === 0 && next && next.type === '(') {
          tokens.push(t);
          inLogSub = false;
          continue;
        }
      }
    }

    tokens.push(t);
    if (endsOperand(t) && startsOperand(next)) {
      tokens.push({ type: '*', pos: t.pos, implicit: true });
    }
  }

  return tokens;
}

class LogParser {
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
      const fn = this.tokens[this.i++];
      if (fn.name === 'ln') {
        if (!this.peek('(')) {
          throw syntaxError('Falta el argumento entre paréntesis para ln(...).', 'missing_log_argument', fn.pos);
        }
        this.take('(');
        const arg = this.add();
        this.take(')');
        return {
          type: 'log',
          base: { type: 'constant', name: 'e', value: Math.E },
          arg,
        };
      }
      if (fn.name === 'log') {
        let baseNode = { type: 'number', value: 10, raw: '10' };
        if (this.peek('_')) {
          this.take('_');
          if (this.peek('(')) {
            this.take('(');
            baseNode = this.add();
            this.take(')');
          } else if (this.peek('number')) {
            const bt = this.tokens[this.i++];
            baseNode = { type: 'number', value: bt.value, raw: bt.raw };
          } else if (this.peek('constant')) {
            const ct = this.tokens[this.i++];
            baseNode = { type: 'constant', name: ct.name, value: ct.value };
          } else if (this.peek('variable')) {
            const vt = this.tokens[this.i++];
            baseNode = { type: 'variable', name: vt.name };
          } else {
            throw syntaxError('Base de logaritmo inválida tras "_".', 'expected_expression', fn.pos);
          }
        }
        if (!this.peek('(')) {
          throw syntaxError('Falta el argumento entre paréntesis para log(...).', 'missing_log_argument', fn.pos);
        }
        this.take('(');
        const firstArg = this.add();
        if (this.peek(',')) {
          this.take(',');
          const secondArg = this.add();
          this.take(')');
          return { type: 'log', base: firstArg, arg: secondArg };
        }
        this.take(')');
        return { type: 'log', base: baseNode, arg: firstArg };
      }
      if (fn.name === 'sqrt') {
        this.take('(');
        const arg = this.add();
        this.take(')');
        return { type: 'root', index: { type: 'number', value: 2 }, arg };
      }
      if (fn.name === 'root') {
        this.take('(');
        const idx = this.add();
        this.take(',');
        const arg = this.add();
        this.take(')');
        return { type: 'root', index: idx, arg };
      }
    }
    if (this.peek('(')) {
      this.take('(');
      const n = this.add();
      this.take(')');
      return { type: 'paren', expr: n };
    }
    throw syntaxError('Se esperaba un número, variable, logaritmo o paréntesis.', 'expected_expression', this.tokens[this.i]?.pos || 0);
  }
}

/**
 * Parsea el árbol AST de una expresión logarítmica / exponencial.
 */
export function parseLogTree(input) {
  return new LogParser(tokenizeLog(input)).parse();
}

/**
 * Evaluador seguro en ℝ con control estricto de dominio logarítmico y radical.
 */
export function evalLogSafe(ast, vars = {}) {
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
      if (node.op === '/' && Math.abs(r.value) < 1e-15) return fail('division_by_zero');
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
      if (b.value < 0 && !Number.isInteger(e.value)) {
        return fail('negative_radicand');
      }
      const val = Math.pow(b.value, e.value);
      return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
    }
    if (node.type === 'root') {
      const idx = ev(node.index);
      if (idx.domainError) return idx;
      const arg = ev(node.arg);
      if (arg.domainError) return arg;
      const n = Math.round(idx.value);
      if (n < 1 || !Number.isFinite(idx.value)) return fail('invalid_root_index');
      if (arg.value < 0) {
        if (n % 2 === 0) return fail('negative_radicand');
        const val = -Math.pow(-arg.value, 1 / n);
        return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
      }
      const val = Math.pow(arg.value, 1 / n);
      return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
    }
    if (node.type === 'log') {
      const b = ev(node.base);
      if (b.domainError) return b;
      if (!Number.isFinite(b.value) || b.value <= 0) return fail('non_positive_base');
      if (Math.abs(b.value - 1) < 1e-12) return fail('unit_base');

      const a = ev(node.arg);
      if (a.domainError) return a;
      if (!Number.isFinite(a.value) || a.value <= 0) return fail('non_positive_argument');

      let val;
      if (Math.abs(b.value - Math.E) < 1e-12) val = Math.log(a.value);
      else if (Math.abs(b.value - 10) < 1e-12) val = Math.log10(a.value);
      else val = Math.log(a.value) / Math.log(b.value);

      return Number.isFinite(val) ? { value: val, domainError: false, errorReason: null } : fail('non_finite_result');
    }
    return fail('unknown_node_type');
  };

  return ev(ast);
}

/**
 * Evaluador numérico directo (devuelve number o NaN).
 */
export function evalLogExpr(astOrStr, xOrVars = 0) {
  const ast = typeof astOrStr === 'string'
    ? parseLogTree(astOrStr)
    : (astOrStr.tree || astOrStr);
  return evalLogSafe(ast, xOrVars).value;
}

/**
 * Verifica equivalencia matemática Y alineación de dominio en ℝ.
 * Impide que log(x^2) pase por equivalente a 2*log(x) cuando x < 0.
 */
export function equivalentLog(exprA, exprB, sampleDomain = null, varsExtra = {}) {
  if (!exprA || !exprB) return false;
  let astA;
  let astB;
  try {
    astA = typeof exprA === 'string' ? parseLogTree(exprA) : (exprA.tree || exprA);
    astB = typeof exprB === 'string' ? parseLogTree(exprB) : (exprB.tree || exprB);
  } catch {
    return false;
  }

  const basePoints = [-10, -4, -2.5, -1, -0.5, 0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 8, 10, 16, 25];
  const testPoints = Array.isArray(sampleDomain) && sampleDomain.length
    ? Array.from(new Set([...basePoints, ...sampleDomain]))
    : basePoints;

  let validMatches = 0;

  for (const x of testPoints) {
    const vars = { ...varsExtra, x, t: x, u: x };
    const resA = evalLogSafe(astA, vars);
    const resB = evalLogSafe(astB, vars);

    if (resA.domainError && resB.domainError) continue;
    if (resA.domainError !== resB.domainError) return false;

    const valA = resA.value;
    const valB = resB.value;
    if (Math.abs(valA - valB) > 1e-6 * Math.max(1, Math.abs(valA), Math.abs(valB))) {
      return false;
    }
    validMatches++;
  }

  return validMatches >= 3;
}

function hasVariable(node) {
  if (!node) return false;
  if (node.type === 'variable') return true;
  if (node.type === 'paren') return hasVariable(node.expr);
  if (node.type === 'neg') return hasVariable(node.value);
  if (node.type === 'binary') return hasVariable(node.left) || hasVariable(node.right);
  if (node.type === 'pow') return hasVariable(node.base) || hasVariable(node.exponent);
  if (node.type === 'log') return hasVariable(node.base) || hasVariable(node.arg);
  if (node.type === 'root') return hasVariable(node.index) || hasVariable(node.arg);
  return false;
}

/**
 * Extrae parámetros canónicos f(x) = k * log_a(m*x + d) + c cuando es representable.
 */
export function extractLogParams(tree) {
  let c = 0;
  let k = 1;
  let logNode = null;

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
      const leftVar = hasVariable(node.left);
      const rightVar = hasVariable(node.right);
      if (node.op === '+' || node.op === '-') {
        if (!leftVar && rightVar) {
          c += evalLogSafe(node.left).value;
          if (node.op === '-') k *= -1;
          unwrap(node.right);
          return;
        }
        if (leftVar && !rightVar) {
          const val = evalLogSafe(node.right).value;
          c += node.op === '+' ? val : -val;
          unwrap(node.left);
          return;
        }
      }
      if (node.op === '*') {
        if (!leftVar && rightVar) {
          k *= evalLogSafe(node.left).value;
          unwrap(node.right);
          return;
        }
        if (leftVar && !rightVar) {
          k *= evalLogSafe(node.right).value;
          unwrap(node.left);
          return;
        }
      }
      if (node.op === '/' && leftVar && !rightVar) {
        k /= evalLogSafe(node.right).value;
        unwrap(node.left);
        return;
      }
    }
    if (node.type === 'log') {
      logNode = node;
    }
  }

  unwrap(tree);

  if (!logNode) return null;

  const baseRes = evalLogSafe(logNode.base);
  if (baseRes.domainError) return null;
  const a = cleanNumber(baseRes.value);
  const isNaturalBase = Math.abs(a - Math.E) < 1e-9;
  const isDecimalBase = Math.abs(a - 10) < 1e-9;

  // Argumento lineal m*x + d
  const arg0 = evalLogSafe(logNode.arg, { x: 0, t: 0, u: 0 });
  const arg1 = evalLogSafe(logNode.arg, { x: 1, t: 1, u: 1 });
  const arg2 = evalLogSafe(logNode.arg, { x: 2, t: 2, u: 2 });
  if (arg0.domainError || arg1.domainError || arg2.domainError) return null;

  const d = cleanNumber(arg0.value);
  const m = cleanNumber(arg1.value - arg0.value);
  const m2 = cleanNumber(arg2.value - arg1.value);
  if (Math.abs(m - m2) > 1e-7 || Math.abs(m) < 1e-12) return null;

  return {
    type: 'log',
    k: cleanNumber(k),
    a: isNaturalBase ? Math.E : a,
    m,
    d,
    c: cleanNumber(c),
    asymptoteX: cleanNumber(-d / m),
    isNaturalBase,
    isDecimalBase,
  };
}

/**
 * Parser canónico para funciones logarítmicas f(x) = k * log_a(m*x + d) + c.
 */
export function parseLog(input) {
  const tree = parseLogTree(input);
  const params = extractLogParams(tree);
  if (!params) {
    throw syntaxError('La expresión no corresponde a la forma f(x) = k · log_a(mx + d) + c.', 'not_canonical_log');
  }
  return {
    ...params,
    raw: String(input).trim(),
    tree,
  };
}
