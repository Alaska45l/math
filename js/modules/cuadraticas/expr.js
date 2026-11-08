/**
 * expr.js — Parser AST, Evaluador Algebraico de Cuadráticas y Notación de Intervalos/Conjuntos.
 * Laboratorio 8: Función Cuadrática, Factorización y Parábolas (cuadraticas.html).
 * Unidad 05 de Alaska Math Lab.
 * 100% puro, determinista y libre de DOM.
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

export const approxEq = (a, b, tol = 1e-9) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

function syntaxError(message, code, pos = 0) {
  const err = new SyntaxError(message);
  err.code = code;
  err.pos = pos;
  return err;
}

/**
 * Normaliza la cadena de entrada para expresiones algebraicas.
 */
export function normalizeQuadString(src) {
  if (typeof src !== 'string') return '';
  let s = src.trim();
  // Quitar prefijos funcionales: f(x)=, g(x)=, S(x)=, y=, h(t)=, etc., y eventual '= 0' final
  s = s.replace(/^\s*(?:[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)|[yYsS])\s*=\s*/i, '');
  s = s.replace(/\s*=\s*0\s*$/, '');
  // Unificar signos menos y guiones tipográficos
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // Unificar multiplicación
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  // Unificar división
  s = s.replace(/[\u00F7:]/g, '/');
  // Coma decimal argentina entre dígitos
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // Raíz cuadrada Unicode √(x) o √7 -> sqrt(...)
  s = s.replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)');
  s = s.replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)');
  // Superíndices Unicode a ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

/**
 * Tokenizador con soporte de multiplicación implícita y funciones unarias (sqrt, abs).
 */
export function tokenizeQuad(rawInput) {
  const s = normalizeQuadString(rawInput);
  if (!s) throw syntaxError('Ingresá una expresión cuadrática.', 'empty');
  if (s.length > 400) throw syntaxError('La expresión es demasiado larga.', 'too_long');

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
      const name = wordMatch[0].toLowerCase();
      if (name === 'sqrt' || name === 'raiz') {
        rawTokens.push({ type: 'func', name: 'sqrt', pos: i });
      } else if (name === 'abs') {
        rawTokens.push({ type: 'func', name: 'abs', pos: i });
      } else if (name === 'pi') {
        rawTokens.push({ type: 'number', value: Math.PI, raw: 'pi', pos: i });
      } else if (name.length === 1) {
        rawTokens.push({ type: 'variable', name, pos: i });
      } else {
        // Descomponer producto implícito de letras si corresponde (ej. 'xx' -> x * x)
        for (let k = 0; k < name.length; k++) {
          rawTokens.push({ type: 'variable', name: name[k], pos: i + k });
        }
      }
      i += wordMatch[0].length;
      continue;
    }
    if ('+-*/^()[]'.includes(ch)) {
      const normType = ch === '[' ? '(' : ch === ']' ? ')' : ch;
      rawTokens.push({ type: normType, pos: i });
      i++;
      continue;
    }
    throw syntaxError(`Carácter no reconocido: '${ch}'.`, 'unexpected_character', i);
  }

  // Multiplicación implícita
  const tokens = [];
  const endsOperand = (t) => t && ['number', 'variable', ')'].includes(t.type);
  const startsOperand = (t) => t && ['number', 'variable', 'func', '('].includes(t.type);

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

class QuadParser {
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
    if (this.peek('variable')) {
      const t = this.tokens[this.i++];
      return { type: 'variable', name: t.name };
    }
    if (this.peek('func')) {
      const fn = this.tokens[this.i++];
      if (this.peek('(')) {
        this.take('(');
        const arg = this.add();
        this.take(')');
        return { type: 'func', name: fn.name, arg };
      }
      return { type: 'func', name: fn.name, arg: this.unary() };
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

export function parseQuadTree(input) {
  return new QuadParser(tokenizeQuad(input)).parse();
}

/**
 * Evalúa un AST cuadrático en un valor real x (o diccionario de variables).
 */
export function evalQuadExpr(astOrInput, x = 0) {
  const ast = typeof astOrInput === 'string'
    ? parseQuadTree(astOrInput)
    : (astOrInput?.ast || astOrInput?.tree || astOrInput);
  const vMap = typeof x === 'number' ? { x, t: x, n: x, u: x } : (x || {});

  const ev = (node) => {
    if (!node) return NaN;
    if (node.type === 'number') return node.value;
    if (node.type === 'variable') {
      const v = vMap[node.name] ?? vMap.x ?? vMap.t ?? vMap.n ?? 0;
      return typeof v === 'number' ? v : NaN;
    }
    if (node.type === 'paren') return ev(node.expr);
    if (node.type === 'neg') return -ev(node.value);
    if (node.type === 'func') {
      const v = ev(node.arg);
      if (node.name === 'sqrt') return v >= 0 ? Math.sqrt(v) : NaN;
      if (node.name === 'abs') return Math.abs(v);
      return NaN;
    }
    if (node.type === 'binary') {
      const l = ev(node.left);
      const r = ev(node.right);
      switch (node.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return r === 0 ? NaN : l / r;
      }
    }
    if (node.type === 'pow') {
      const b = ev(node.base);
      const e = ev(node.exponent);
      return Math.pow(b, e);
    }
    return NaN;
  };

  return cleanNumber(ev(ast), 10);
}

/**
 * Expansión algebraica exacta de un nodo AST a polinomio [c0, c1, c2, ...]
 * donde c0 = c, c1 = b, c2 = a.
 */
export function expandPolynomialCoeffs(node) {
  const trimPoly = (p) => {
    const res = p.map((c) => cleanNumber(c, 10));
    while (res.length > 3 && Math.abs(res[res.length - 1]) < 1e-9) {
      res.pop();
    }
    while (res.length < 3) res.push(0);
    return res;
  };

  const addPoly = (p1, p2, sign = 1) => {
    const len = Math.max(p1.length, p2.length, 3);
    const out = new Array(len).fill(0);
    for (let i = 0; i < len; i++) {
      out[i] = (p1[i] || 0) + sign * (p2[i] || 0);
    }
    return trimPoly(out);
  };

  const mulPoly = (p1, p2) => {
    const out = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        out[i + j] += p1[i] * p2[j];
      }
    }
    return trimPoly(out);
  };

  const walk = (n) => {
    if (!n) return [0, 0, 0];
    if (n.type === 'number') return [n.value, 0, 0];
    if (n.type === 'variable') return [0, 1, 0];
    if (n.type === 'paren') return walk(n.expr);
    if (n.type === 'neg') {
      return walk(n.value).map((c) => cleanNumber(-c, 10));
    }
    if (n.type === 'func') {
      const pArg = walk(n.arg);
      const isConstant = pArg.slice(1).every((c) => Math.abs(c) < 1e-9);
      if (!isConstant) {
        throw syntaxError('Función no polinómica aplicada a una variable.', 'non_polynomial_function');
      }
      const val = n.name === 'sqrt' ? Math.sqrt(pArg[0]) : Math.abs(pArg[0]);
      return [cleanNumber(val, 10), 0, 0];
    }
    if (n.type === 'binary') {
      const l = walk(n.left);
      const r = walk(n.right);
      if (n.op === '+') return addPoly(l, r, 1);
      if (n.op === '-') return addPoly(l, r, -1);
      if (n.op === '*') return mulPoly(l, r);
      if (n.op === '/') {
        const isConstDivisor = r.slice(1).every((c) => Math.abs(c) < 1e-9);
        if (!isConstDivisor) {
          throw syntaxError('El divisor contiene una variable; no es un polinomio estándar.', 'rational_expression');
        }
        if (Math.abs(r[0]) < 1e-12) {
          throw syntaxError('División por cero.', 'division_by_zero');
        }
        return trimPoly(l.map((c) => c / r[0]));
      }
    }
    if (n.type === 'pow') {
      const baseP = walk(n.base);
      const expP = walk(n.exponent);
      const isConstExp = expP.slice(1).every((c) => Math.abs(c) < 1e-9);
      const expVal = expP[0];
      if (!isConstExp || !Number.isInteger(expVal) || expVal < 0 || expVal > 6) {
        throw syntaxError('El exponente debe ser un entero no negativo pequeño.', 'invalid_polynomial_exponent');
      }
      if (expVal === 0) return [1, 0, 0];
      let acc = [1, 0, 0];
      for (let k = 0; k < expVal; k++) {
        acc = mulPoly(acc, baseP);
      }
      return acc;
    }
    return [0, 0, 0];
  };

  return walk(node);
}

function hasVar(node) {
  if (!node) return false;
  if (node.type === 'variable') return true;
  if (node.type === 'paren') return hasVar(node.expr);
  if (node.type === 'neg') return hasVar(node.value);
  if (node.type === 'func') return hasVar(node.arg);
  if (node.type === 'binary') return hasVar(node.left) || hasVar(node.right);
  if (node.type === 'pow') return hasVar(node.base) || hasVar(node.exponent);
  return false;
}

function unwrapParens(node) {
  let curr = node;
  while (curr && curr.type === 'paren') curr = curr.expr;
  return curr;
}

function isDegreeOne(node) {
  try {
    const p = expandPolynomialCoeffs(node);
    const higherZero = p.slice(2).every((c) => Math.abs(c) < 1e-9);
    return higherZero && Math.abs(p[1]) > 1e-9;
  } catch {
    return false;
  }
}

function isLinearBinomialWithShift(node) {
  try {
    const p = expandPolynomialCoeffs(node);
    const higherZero = p.slice(2).every((c) => Math.abs(c) < 1e-9);
    return higherZero && Math.abs(p[1]) > 1e-9 && Math.abs(p[0]) > 1e-9;
  } catch {
    return false;
  }
}

function isPureMonomialX(node) {
  const u = unwrapParens(node);
  return u?.type === 'variable';
}

function flattenAddTerms(node) {
  const u = unwrapParens(node);
  if (!u) return [];
  if (u.type === 'binary' && (u.op === '+' || u.op === '-')) {
    return [...flattenAddTerms(u.left), ...flattenAddTerms(u.right)];
  }
  return [u];
}

function flattenMulFactors(node) {
  const u = unwrapParens(node);
  if (!u) return [];
  if (u.type === 'neg') return flattenMulFactors(u.value);
  if (u.type === 'binary' && (u.op === '*' || u.op === '/')) {
    return [...flattenMulFactors(u.left), ...flattenMulFactors(u.right)];
  }
  return [u];
}

function isSquaredBinomialFactor(node) {
  const factors = flattenMulFactors(node);
  for (const f of factors) {
    const u = unwrapParens(f);
    if (u?.type === 'pow') {
      const expVal = evalQuadExpr(u.exponent, 0);
      if (expVal === 2 && isLinearBinomialWithShift(u.base)) {
        return true;
      }
    }
  }
  return false;
}

function isSimpleMonomialTerm(node) {
  const factors = flattenMulFactors(node);
  for (const f of factors) {
    const u = unwrapParens(f);
    if (u.type === 'number' || u.type === 'variable' || u.type === 'func') continue;
    if (u.type === 'pow') {
      const baseU = unwrapParens(u.base);
      const expVal = evalQuadExpr(u.exponent, 0);
      if (baseU.type === 'variable' && (expVal === 1 || expVal === 2)) continue;
    }
    return false;
  }
  return true;
}

/**
 * Clasifica la forma superficial de la expresión cuadrática escrita por el usuario:
 * 'polynomial' | 'canonical' | 'factored' | 'partially_factored' | 'other'
 */
export function classifyQuadSurfaceForm(ast, coeffs) {
  const root = unwrapParens(ast);
  if (!root) return 'other';

  const mulFactors = flattenMulFactors(root);
  const linearFactors = mulFactors.filter((f) => isDegreeOne(f));
  const squaredBinomials = mulFactors.filter((f) => {
    const u = unwrapParens(f);
    return u?.type === 'pow' && evalQuadExpr(u.exponent, 0) === 2 && isLinearBinomialWithShift(u.base);
  });

  // 1. Producto puro en la raíz: (x - x1)(x - x2), x(x - 4), o a*(x - xv)^2
  if (linearFactors.length >= 2) {
    return 'factored';
  }
  if (squaredBinomials.length === 1 && linearFactors.length === 0) {
    // Ej. a(x - xv)^2 (con yv = 0): es tanto canónica como factorizada con raíz doble.
    // Lo marcamos como canonical (y en equivalentQuadExpr aceptamos ambos si yv = 0).
    return 'canonical';
  }

  // 2. Suma de términos en la raíz
  const terms = flattenAddTerms(root);
  if (terms.length === 2) {
    const [t1, t2] = terms;
    const t1Const = !hasVar(t1);
    const t2Const = !hasVar(t2);
    const t1SqBin = isSquaredBinomialFactor(t1);
    const t2SqBin = isSquaredBinomialFactor(t2);
    // Forma canónica a*(x - xv)^2 + yv o permutada yv + a*(x - xv)^2 (ej. 16 - (x-4)^2)
    if ((t1SqBin && t2Const) || (t2SqBin && t1Const)) {
      return 'canonical';
    }
  }

  // 3. Todos los términos aditivos son monomios simples (ax^2, bx, c)
  if (terms.length >= 1 && terms.every((t) => isSimpleMonomialTerm(t))) {
    // Verificar que no haya dos términos del mismo grado sin agrupar (ej. x^2 + 3x + 2x + 6)
    const degrees = [];
    let uncombined = false;
    for (const t of terms) {
      const p = expandPolynomialCoeffs(t);
      const deg = Math.abs(p[2]) > 1e-9 ? 2 : Math.abs(p[1]) > 1e-9 ? 1 : 0;
      if (degrees.includes(deg)) uncombined = true;
      degrees.push(deg);
    }
    if (!uncombined) {
      return 'polynomial';
    }
    return 'partially_factored';
  }

  // 4. Parcialmente factorizada (ej. x(x - 6) + 2 o 2x(x + 3) + 1(x + 3))
  const hasMultipliedGroup = terms.some((t) => {
    const fs = flattenMulFactors(t);
    return fs.some((f) => {
      const u = unwrapParens(f);
      return u?.type === 'binary' && (u.op === '+' || u.op === '-');
    });
  });
  if (hasMultipliedGroup) {
    return 'partially_factored';
  }

  return 'other';
}

/**
 * Parsea cualquier expresión cuadrática, expande sus coeficientes { a, b, c }
 * y clasifica su forma superficial.
 */
export function parseQuadExpr(input) {
  const ast = parseQuadTree(input);
  const poly = expandPolynomialCoeffs(ast);
  const higherOrder = poly.slice(3).some((c) => Math.abs(c) > 1e-9);
  if (higherOrder) {
    throw syntaxError('La expresión supera el grado 2.', 'degree_higher_than_2');
  }
  const c = cleanNumber(poly[0], 10);
  const b = cleanNumber(poly[1], 10);
  const a = cleanNumber(poly[2], 10);
  const form = classifyQuadSurfaceForm(ast, { a, b, c });

  // Detectar si es el caso especial de raíz doble a*(x - xv)^2 (que sirve tanto para canonical como factored)
  const disc = cleanNumber(b * b - 4 * a * c, 10);
  const isDoubleRootSquare =
    Math.abs(disc) < 1e-8 &&
    (form === 'canonical' || (form === 'polynomial' && Math.abs(b) < 1e-9 && Math.abs(c) < 1e-9));

  return {
    ok: true,
    type: 'quadratic',
    form,
    surfaceForm: form,
    isDoubleRootSquare,
    coeffs: { a, b, c },
    a,
    b,
    c,
    isQuadratic: Math.abs(a) > 1e-9,
    isLinear: Math.abs(a) <= 1e-9 && Math.abs(b) > 1e-9,
    raw: String(input).trim(),
    ast,
  };
}

/**
 * Comprueba equivalencia matemática exacta entre dos expresiones cuadráticas
 * (tolerancia 1e-9) y distingue si cumple con la forma solicitada o si es `equivalent_form`.
 */
export function equivalentQuadExpr(inputA, inputB, requireForm = null) {
  try {
    const parsedA = typeof inputA === 'string' ? parseQuadExpr(inputA) : inputA;
    const parsedB = typeof inputB === 'string' ? parseQuadExpr(inputB) : inputB;

    const sameA = approxEq(parsedA.a, parsedB.a, 1e-7);
    const sameB = approxEq(parsedA.b, parsedB.b, 1e-7);
    const sameC = approxEq(parsedA.c, parsedB.c, 1e-7);
    const equivalent = sameA && sameB && sameC;

    if (!equivalent) {
      return {
        equivalent: false,
        sameForm: false,
        matchesRequiredForm: false,
        status: 'not_equivalent',
        category: 'not_equivalent',
        actualForm: parsedA.form,
        expectedForm: requireForm || parsedB.form,
        coeffsA: parsedA.coeffs,
        coeffsB: parsedB.coeffs,
      };
    }

    if (!requireForm) {
      return {
        equivalent: true,
        sameForm: true,
        matchesRequiredForm: true,
        status: 'exact_match',
        category: 'exact',
        actualForm: parsedA.form,
        expectedForm: null,
        coeffsA: parsedA.coeffs,
        coeffsB: parsedB.coeffs,
      };
    }

    const matchesForm =
      parsedA.form === requireForm ||
      (parsedA.isDoubleRootSquare && (requireForm === 'canonical' || requireForm === 'factored')) ||
      // Si c = 0 y b = 0 (ej. 3x^2), polinómica, canónica y factorizada coinciden
      (Math.abs(parsedA.b) < 1e-9 && Math.abs(parsedA.c) < 1e-9 && ['polynomial', 'canonical', 'factored'].includes(requireForm));

    return {
      equivalent: true,
      sameForm: matchesForm,
      matchesRequiredForm: matchesForm,
      status: matchesForm ? 'exact_match' : 'equivalent_form',
      category: matchesForm ? 'exact' : 'equivalent_form',
      actualForm: parsedA.form,
      expectedForm: requireForm,
      coeffsA: parsedA.coeffs,
      coeffsB: parsedB.coeffs,
    };
  } catch (err) {
    return {
      equivalent: false,
      sameForm: false,
      matchesRequiredForm: false,
      status: 'syntax_error',
      category: 'syntax',
      error: err.message,
    };
  }
}

/* ========================================================================== */
/* Notación de Intervalos, Uniones, Conjuntos y Pares Ordenados (Exactas)      */
/* ========================================================================== */

export function parseNumberOrFraction(v) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw syntaxError(`Número no finito: '${v}'.`, 'invalid_number');
    return v;
  }
  if (typeof v !== 'string') {
    throw syntaxError(`Entrada numérica inválida: '${v}'.`, 'invalid_number');
  }
  const trimmed = v.trim().replace(/[\u2212\u2013\u2014]/g, '-');
  if (!trimmed) throw syntaxError('Valor numérico vacío.', 'empty_number');

  // Fracción p/q
  const fracMatch = trimmed.match(/^([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*\/\s*([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1].replace(',', '.'));
    const den = parseFloat(fracMatch[2].replace(',', '.'));
    if (den === 0 || !Number.isFinite(den)) {
      throw syntaxError('División por cero.', 'division_by_zero');
    }
    return cleanNumber(num / den, 10);
  }

  // Número decimal o entero
  if (/^[-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed)) {
    const res = parseFloat(trimmed.replace(',', '.'));
    if (!Number.isFinite(res)) throw syntaxError(`Número inválido: '${v}'.`, 'invalid_number');
    return cleanNumber(res, 10);
  }

  // Expresión con radicales ej. 3 + sqrt(7) o 1 - √2
  if (/[√]|sqrt/i.test(trimmed)) {
    const val = evalQuadExpr(trimmed, 0);
    if (Number.isFinite(val)) return cleanNumber(val, 10);
  }

  throw syntaxError(`Número inválido: '${v}'.`, 'invalid_number');
}

/**
 * Parsea un par ordenado (x; y) como vértice o punto de intersección.
 */
export function parseOrderedPair(input) {
  if (typeof input !== 'string') throw syntaxError('Ingresá un par ordenado (x; y).', 'invalid_pair');
  const s = input.trim().replace(/^[vVpP]\s*=?\s*/, '').trim();
  const m = s.match(/^\(\s*([^;]+?)\s*;\s*([^)]+?)\s*\)$/);
  if (!m) {
    if (/^\(\s*[^,]+\s*,\s*[^)]+\s*\)$/.test(s)) {
      throw syntaxError("En Exactas las coordenadas de un punto se separan con punto y coma ';', por ejemplo (2; -3).", 'comma_instead_of_semicolon');
    }
    throw syntaxError("Formato de par ordenado inválido. Usá '(x; y)'.", 'invalid_pair_format');
  }
  return {
    x: parseNumberOrFraction(m[1]),
    y: parseNumberOrFraction(m[2]),
  };
}

function parseSingleInterval(rawPart) {
  const s = rawPart.trim();
  const match = s.match(/^([(\[])\s*([^;]+?)\s*;\s*([^;\])]+?)\s*([)\]])$/);
  if (!match) {
    if (s.includes(',') && !s.includes(';')) {
      throw syntaxError("En Exactas los intervalos se separan con punto y coma ';' (la coma se reserva para decimales).", 'missing_semicolon');
    }
    throw syntaxError(`Formato de intervalo inválido: '${rawPart}'.`, 'invalid_interval_format');
  }
  const [, openB, leftRaw, rightRaw, closeB] = match;
  const loOpen = openB === '(';
  const hiOpen = closeB === ')';

  const parseEnd = (valStr) => {
    const v = valStr.trim().toLowerCase();
    if (['-inf', '-oo', '-∞', `${MINUS_CHAR}∞`].includes(v)) return -Infinity;
    if (['+inf', 'inf', '+oo', 'oo', '+∞', '∞'].includes(v)) return Infinity;
    return parseNumberOrFraction(v);
  };

  const lo = parseEnd(leftRaw);
  const hi = parseEnd(rightRaw);

  if (lo === Infinity || hi === -Infinity) {
    throw syntaxError('Orden de extremos inconsistente.', 'inverted_infinities');
  }
  if ((!loOpen && lo === -Infinity) || (!hiOpen && hi === Infinity)) {
    throw syntaxError('El infinito siempre lleva paréntesis abierto.', 'closed_bracket_on_infinity');
  }
  if (lo > hi || (lo === hi && (loOpen || hiOpen))) {
    return {
      lo: NaN,
      hi: NaN,
      from: NaN,
      to: NaN,
      loOpen: true,
      hiOpen: true,
      leftClosed: false,
      rightClosed: false,
      isEmpty: true,
    };
  }
  return {
    lo,
    hi,
    from: lo,
    to: hi,
    loOpen,
    hiOpen,
    leftClosed: !loOpen,
    rightClosed: !hiOpen,
    isEmpty: false,
  };
}

/**
 * Parsea notación completa de intervalos y conjuntos de Exactas:
 * - Intervalo simple: `[-3; +inf)`, `(-inf; 16]`, `(-1; 3)`
 * - Unión de intervalos: `(-inf; -1) U (3; +inf)` o `(-∞; -1) ∪ (3; +∞)`
 * - Recta real menos conjunto: `R - {1}` o `ℝ − {-3}`
 * - Conjunto discreto de raíces: `{-1; 3}`, `{2}`
 * - Recta real: `R`, `ℝ`, `(-inf; +inf)`
 * - Vacío: `vacio`, `∅`, `{}`
 */
export function parseSetOrIntervalExactas(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw syntaxError('Ingresá un conjunto o intervalo.', 'empty_input');
  }
  let s = input.trim().replace(/[\u2212\u2013\u2014]/g, '-');
  const lower = s.toLowerCase();

  // 1. Conjunto vacío
  if (['vacio', 'vacío', '∅', '{}', 'none'].includes(lower)) {
    return {
      ok: true,
      kind: 'empty',
      isEmpty: true,
      isAllReal: false,
      intervals: [],
      points: [],
      values: [],
    };
  }

  // 2. Recta real completa R
  if (['r', 'ir', 'reales', 'real', 'ℝ'].includes(lower) || /^\(\s*-inf\s*;\s*\+?inf\s*\)$/i.test(lower)) {
    return {
      ok: true,
      kind: 'all_real',
      isEmpty: false,
      isAllReal: true,
      intervals: [
        {
          lo: -Infinity,
          hi: Infinity,
          from: -Infinity,
          to: Infinity,
          loOpen: true,
          hiOpen: true,
          leftClosed: false,
          rightClosed: false,
        },
      ],
      points: [],
      values: [],
    };
  }

  // 3. R - { x0 }
  const rMinusMatch = s.match(/^(?:r|ir|ℝ)\s*-\s*\{\s*([^}]+)\s*\}$/i);
  if (rMinusMatch) {
    const pts = rMinusMatch[1].split(';').map((x) => parseNumberOrFraction(x)).sort((a, b) => a - b);
    const intervals = [];
    let prev = -Infinity;
    for (const p of pts) {
      intervals.push({
        lo: prev,
        hi: p,
        from: prev,
        to: p,
        loOpen: true,
        hiOpen: true,
        leftClosed: false,
        rightClosed: false,
      });
      prev = p;
    }
    intervals.push({
      lo: prev,
      hi: Infinity,
      from: prev,
      to: Infinity,
      loOpen: true,
      hiOpen: true,
      leftClosed: false,
      rightClosed: false,
    });
    return {
      ok: true,
      kind: 'intervals',
      subKind: 'union',
      isEmpty: false,
      isAllReal: false,
      excludedPoints: pts,
      intervals,
      points: [],
      values: [],
    };
  }

  // 4. Conjunto discreto { x1; x2 }
  const setMatch = s.match(/^\{\s*([^}]*)\s*\}$/);
  if (setMatch) {
    const inner = setMatch[1].trim();
    if (!inner) {
      return {
        ok: true,
        kind: 'empty',
        isEmpty: true,
        isAllReal: false,
        intervals: [],
        points: [],
        values: [],
      };
    }
    const separator = inner.includes(';') ? ';' : ',';
    const pts = inner
      .split(separator)
      .map((x) => parseNumberOrFraction(x))
      .sort((a, b) => a - b);
    return {
      ok: true,
      kind: 'finite_set',
      subKind: 'discrete',
      isEmpty: false,
      isAllReal: false,
      intervals: [],
      points: pts,
      values: pts,
    };
  }

  // 5. Unión de intervalos (separados por U o ∪)
  if (/\s+(?:u|∪)\s+/i.test(s) || /[)\]]\s*(?:u|∪)\s*[(\[]/i.test(s)) {
    const rawParts = s.split(/\s*(?:u|∪)\s*/i).filter(Boolean);
    const intervals = rawParts.map((part) => parseSingleInterval(part)).filter((iv) => !iv.isEmpty);
    return {
      ok: true,
      kind: 'intervals',
      subKind: 'union',
      isEmpty: intervals.length === 0,
      isAllReal: false,
      intervals,
      points: [],
      values: [],
    };
  }

  // 6. Intervalo único
  const single = parseSingleInterval(s);
  if (single.isEmpty) {
    return {
      ok: true,
      kind: 'empty',
      isEmpty: true,
      isAllReal: false,
      intervals: [],
      points: [],
      values: [],
    };
  }
  return {
    ok: true,
    kind: 'intervals',
    subKind: 'interval',
    isEmpty: false,
    isAllReal: single.lo === -Infinity && single.hi === Infinity,
    intervals: [single],
    points: [],
    values: [],
  };
}

export function equivalentSetExactas(inputA, inputB) {
  try {
    const a = typeof inputA === 'string' ? parseSetOrIntervalExactas(inputA) : inputA;
    const b = typeof inputB === 'string' ? parseSetOrIntervalExactas(inputB) : inputB;
    if (a.isEmpty && b.isEmpty) return true;
    if (a.isAllReal && b.isAllReal) return true;
    if (a.kind === 'finite_set' && b.kind === 'finite_set') {
      if (a.values.length !== b.values.length) return false;
      return a.values.every((v, idx) => approxEq(v, b.values[idx], 1e-6));
    }
    if (a.intervals.length > 0 && b.intervals.length > 0) {
      if (a.intervals.length !== b.intervals.length) return false;
      return a.intervals.every((ivA, idx) => {
        const ivB = b.intervals[idx];
        const sameLo =
          (ivA.lo === -Infinity && ivB.lo === -Infinity) || approxEq(ivA.lo, ivB.lo, 1e-6);
        const sameHi =
          (ivA.hi === Infinity && ivB.hi === Infinity) || approxEq(ivA.hi, ivB.hi, 1e-6);
        return sameLo && sameHi && ivA.loOpen === ivB.loOpen && ivA.hiOpen === ivB.hiOpen;
      });
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Formatea un intervalo o conjunto al estilo Exactas UNMDP.
 */
export function formatSetExactas(spec, { style = 'unicode', digits = 2 } = {}) {
  if (!spec) return '';
  const emptyStr = style === 'unicode' ? '∅' : 'vacio';
  const realStr = style === 'unicode' ? 'ℝ' : 'R';
  const negInf = style === 'unicode' ? `${MINUS_CHAR}∞` : '-inf';
  const posInf = style === 'unicode' ? '+∞' : '+inf';
  const unionSym = style === 'unicode' ? ' ∪ ' : ' U ';
  const fmtNum = (n) => {
    const c = cleanNumber(n, digits);
    const s = String(c).replace('.', ',');
    return style === 'unicode' ? s.replace('-', MINUS_CHAR) : s;
  };

  if (spec.isEmpty || spec.kind === 'empty') return emptyStr;
  if (spec.isAllReal || spec.kind === 'all_real') return realStr;

  if (spec.kind === 'discrete' || (Array.isArray(spec.points) && spec.points.length > 0)) {
    const unique = [];
    for (const p of spec.points) {
      if (!unique.some((u) => approxEq(u, p, 1e-7))) unique.push(p);
    }
    return `{${unique.map(fmtNum).join('; ')}}`;
  }

  if (Array.isArray(spec.intervals) && spec.intervals.length > 0) {
    return spec.intervals
      .map((iv) => {
        const lB = iv.loOpen ? '(' : '[';
        const rB = iv.hiOpen ? ')' : ']';
        const lV = iv.lo === -Infinity ? negInf : fmtNum(iv.lo);
        const rV = iv.hi === Infinity ? posInf : fmtNum(iv.hi);
        return `${lB}${lV}; ${rV}${rB}`;
      })
      .join(unionSym);
  }

  if ('lo' in spec && 'hi' in spec) {
    const lB = spec.loOpen ? '(' : '[';
    const rB = spec.hiOpen ? ')' : ']';
    const lV = spec.lo === -Infinity ? negInf : fmtNum(spec.lo);
    const rV = spec.hi === Infinity ? posInf : fmtNum(spec.hi);
    return `${lB}${lV}; ${rV}${rB}`;
  }

  return emptyStr;
}
