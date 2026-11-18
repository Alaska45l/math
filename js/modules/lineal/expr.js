/**
 * @file js/modules/lineal/expr.js
 * Motor matemático puro de aritmética racional exacta { n, d }, radicales exactos { rat, rad },
 * parser/normalizador AST sin eval() para ecuaciones de la recta en 3 formas,
 * pares ordenados e intervalos/conjuntos con notación de Exactas UNMDP.
 *
 * Zero DOM. Zero eval(). Zero new Function(). Zero emojis.
 */

export const MINUS = '\u2212';

/* ==========================================================================
   1. Aritmética Racional Exacta { n, d } (d > 0, gcd(|n|, d) === 1)
   ========================================================================== */

export function gcdInt(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function rat(n, d = 1) {
  if (!Number.isFinite(n) || !Number.isFinite(d)) {
    throw new RangeError('Los componentes del racional deben ser finitos.');
  }
  if (d === 0) {
    throw new RangeError('Denominador cero en número racional.');
  }
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    return ratDiv(ratFromNumber(n), ratFromNumber(d));
  }
  if (n === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  const num = n * sign;
  const den = Math.abs(d);
  const g = gcdInt(num, den);
  return { n: num / g, d: den / g };
}

export function ratFromNumber(num, maxDen = 10000) {
  if (!Number.isFinite(num)) {
    throw new RangeError('Número no finito para convertir a racional.');
  }
  if (Math.abs(num) < 1e-12) return { n: 0, d: 1 };
  if (Number.isInteger(num)) return { n: num, d: 1 };

  const sign = num < 0 ? -1 : 1;
  const absVal = Math.abs(num);

  // Fracción continua (algoritmo de Stern-Brocot / convergentes)
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = absVal;
  for (let i = 0; i < 32; i++) {
    const a = Math.floor(b);
    const nextH = a * h1 + h2;
    const nextK = a * k1 + k2;
    if (nextK > maxDen) break;
    h2 = h1;
    h1 = nextH;
    k2 = k1;
    k1 = nextK;
    const fracPart = b - a;
    if (fracPart < 1e-11) break;
    b = 1 / fracPart;
  }
  return rat(sign * h1, k1 || 1);
}

export function ratFromString(raw) {
  if (typeof raw === 'number') return ratFromNumber(raw);
  if (raw && typeof raw === 'object' && 'n' in raw && 'd' in raw) {
    return rat(raw.n, raw.d);
  }
  if (typeof raw !== 'string') {
    throw new TypeError('Se esperaba un string o número racional.');
  }
  let s = raw
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/^\((.+)\)$/, '$1')
    .replace(/\s+/g, '');

  if (!s) throw new SyntaxError('Número vacío.');

  // Coma decimal es-AR
  if (/^[+-]?\d+,\d+$/.test(s)) {
    s = s.replace(',', '.');
  }

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new SyntaxError(`Fracción inválida: "${raw}"`);
    }
    const left = ratFromString(parts[0]);
    const right = ratFromString(parts[1]);
    return ratDiv(left, right);
  }

  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) {
    throw new SyntaxError(`Número inválido: "${raw}"`);
  }

  if (!s.includes('.')) {
    return rat(parseInt(s, 10), 1);
  }

  const sign = s.startsWith('-') ? -1 : 1;
  const clean = s.replace(/^[+-]/, '');
  const [intPart, decPart = ''] = clean.split('.');
  const den = 10 ** decPart.length;
  const num = parseInt((intPart || '0') + decPart, 10);
  return rat(sign * num, den);
}

export function ratAdd(a, b) {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function ratSub(a, b) {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function ratMul(a, b) {
  return rat(a.n * b.n, a.d * b.d);
}

export function ratDiv(a, b) {
  if (b.n === 0) throw new RangeError('División por cero en racionales.');
  return rat(a.n * b.d, a.d * b.n);
}

export function ratNeg(a) {
  return a.n === 0 ? { n: 0, d: 1 } : { n: -a.n, d: a.d };
}

export function ratAbs(a) {
  return { n: Math.abs(a.n), d: a.d };
}

export function ratSign(a) {
  return a.n > 0 ? 1 : a.n < 0 ? -1 : 0;
}

export function ratEq(a, b) {
  return a.n * b.d === b.n * a.d;
}

export function ratCompare(a, b) {
  const diff = a.n * b.d - b.n * a.d;
  return diff > 0 ? 1 : diff < 0 ? -1 : 0;
}

export function ratToNumber(a) {
  return a.n / a.d;
}

export function ratIsZero(a) {
  return a.n === 0;
}

export function ratIsOne(a) {
  return a.n === 1 && a.d === 1;
}

export function ratIsInt(a) {
  return a.d === 1;
}

export function fmtRat(r, { asciiMinus = false } = {}) {
  const q = rat(r.n, r.d);
  const neg = q.n < 0;
  const absN = Math.abs(q.n);
  const sign = neg ? (asciiMinus ? '-' : MINUS) : '';
  if (q.d === 1) return `${sign}${absN}`;
  return `${sign}${absN}/${q.d}`;
}

export function fmtNumberEsAR(x, digits = 2) {
  if (!Number.isFinite(x)) return x > 0 ? '+∞' : `${MINUS}∞`;
  const rounded = Number(x.toFixed(digits));
  const clean = Object.is(rounded, -0) ? 0 : rounded;
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits })
    .format(clean)
    .replace('-', MINUS);
}

/* ==========================================================================
   2. Aritmética de Radicales Exactos { rat: { n, d }, rad: int >= 1 }
   ========================================================================== */

export function simplifyRadicalInt(n) {
  const absN = Math.trunc(Math.abs(n));
  if (!Number.isFinite(n) || n < 0) {
    throw new RangeError('El radicando debe ser un entero no negativo.');
  }
  if (absN === 0) return { k: 0, rad: 1 };
  let k = 1;
  let rem = absN;
  for (let p = 2; p * p <= rem; p++) {
    while (rem % (p * p) === 0) {
      k *= p;
      rem /= p * p;
    }
  }
  return { k, rad: rem };
}

export function exactRadical(numRat, radInt = 1) {
  const r = typeof numRat === 'number' ? ratFromNumber(numRat) : rat(numRat.n, numRat.d);
  if (radInt < 0 || !Number.isInteger(radInt)) {
    throw new RangeError('El radicando debe ser entero positivo.');
  }
  if (r.n === 0 || radInt === 0) {
    return { rat: { n: 0, d: 1 }, rad: 1 };
  }
  const { k, rad } = simplifyRadicalInt(radInt);
  return {
    rat: ratMul(r, rat(k, 1)),
    rad,
  };
}

export function exactRadicalEq(a, b) {
  const na = exactRadical(a.rat, a.rad);
  const nb = exactRadical(b.rat, b.rad);
  return ratEq(na.rat, nb.rat) && na.rad === nb.rad;
}

export function fmtExactRadical(er, { asciiMinus = false } = {}) {
  const norm = exactRadical(er.rat, er.rad);
  if (ratIsZero(norm.rat)) return '0';
  if (norm.rad === 1) return fmtRat(norm.rat, { asciiMinus });

  const neg = norm.rat.n < 0;
  const absN = Math.abs(norm.rat.n);
  const d = norm.rat.d;
  const sign = neg ? (asciiMinus ? '-' : MINUS) : '';
  const coef = absN === 1 ? '' : String(absN);
  const numPart = `${coef}√${norm.rad}`;
  return d === 1 ? `${sign}${numPart}` : `${sign}${numPart}/${d}`;
}

function tokenizeRadicalExpr(raw) {
  const s = String(raw)
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/sqrt\s*\(/gi, 'sqrt(')
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/√(\d+)/g, 'sqrt($1)');

  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if ('+-*/()'.includes(ch)) {
      tokens.push({ type: ch, val: ch });
      i += 1;
      continue;
    }
    if (/\d|\./.test(ch)) {
      let j = i;
      while (j < s.length && /[\d.]/.test(s[j])) j += 1;
      tokens.push({ type: 'NUM', val: s.slice(i, j) });
      i = j;
      continue;
    }
    if (s.slice(i, i + 4).toLowerCase() === 'sqrt') {
      tokens.push({ type: 'SQRT', val: 'sqrt' });
      i += 4;
      continue;
    }
    throw new SyntaxError(`Carácter inesperado en radical: "${ch}"`);
  }

  // Inserta multiplicación implícita: 2sqrt(5) -> 2*sqrt(5), )sqrt -> )*sqrt, ) ( -> )*(
  const out = [];
  for (let k = 0; k < tokens.length; k++) {
    const cur = tokens[k];
    const prev = out[out.length - 1];
    if (
      prev &&
      (prev.type === 'NUM' || prev.type === ')') &&
      (cur.type === 'SQRT' || cur.type === '(' || cur.type === 'NUM')
    ) {
      out.push({ type: '*', val: '*' });
    }
    out.push(cur);
  }
  return out;
}

export function parseExactRadical(raw) {
  if (raw && typeof raw === 'object' && 'rat' in raw && 'rad' in raw) {
    return exactRadical(raw.rat, raw.rad);
  }
  const tokens = tokenizeRadicalExpr(raw);
  let pos = 0;
  const peek = () => tokens[pos] || null;
  const consume = () => tokens[pos++];

  const mulRad = (a, b) => exactRadical(ratMul(a.rat, b.rat), a.rad * b.rad);
  const divRad = (a, b) => {
    if (ratIsZero(b.rat)) throw new RangeError('División por cero en radical.');
    // (r1 * sqrt(k1)) / (r2 * sqrt(k2)) = (r1 / (r2 * k2)) * sqrt(k1 * k2)
    return exactRadical(ratDiv(a.rat, ratMul(b.rat, rat(b.rad, 1))), a.rad * b.rad);
  };
  const addRad = (a, b, sign = 1) => {
    const na = exactRadical(a.rat, a.rad);
    const nb = exactRadical(sign < 0 ? ratNeg(b.rat) : b.rat, b.rad);
    if (ratIsZero(na.rat)) return nb;
    if (ratIsZero(nb.rat)) return na;
    if (na.rad !== nb.rad) {
      throw new SyntaxError('Solo se pueden sumar radicales semejantes en forma simple.');
    }
    return exactRadical(ratAdd(na.rat, nb.rat), na.rad);
  };

  function parseExpr() {
    let val = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume().type;
      const rhs = parseTerm();
      val = addRad(val, rhs, op === '-' ? -1 : 1);
    }
    return val;
  }

  function parseTerm() {
    let val = parseFactor();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = consume().type;
      const rhs = parseFactor();
      val = op === '*' ? mulRad(val, rhs) : divRad(val, rhs);
    }
    return val;
  }

  function parseFactor() {
    const tok = peek();
    if (!tok) throw new SyntaxError('Expresión radical incompleta.');
    if (tok.type === '+') {
      consume();
      return parseFactor();
    }
    if (tok.type === '-') {
      consume();
      const inner = parseFactor();
      return exactRadical(ratNeg(inner.rat), inner.rad);
    }
    if (tok.type === 'NUM') {
      consume();
      return exactRadical(ratFromString(tok.val), 1);
    }
    if (tok.type === 'SQRT') {
      consume();
      if (!peek() || peek().type !== '(') {
        throw new SyntaxError('Falta paréntesis después de sqrt.');
      }
      consume();
      const inside = parseExpr();
      if (!peek() || peek().type !== ')') {
        throw new SyntaxError('Falta paréntesis de cierre en sqrt.');
      }
      consume();
      if (inside.rad !== 1 || inside.rat.n < 0) {
        throw new RangeError('Radicando racional no negativo requerido dentro de √.');
      }
      // sqrt(n/d) = sqrt(n*d) / d
      return exactRadical(rat(1, inside.rat.d), inside.rat.n * inside.rat.d);
    }
    if (tok.type === '(') {
      consume();
      const inner = parseExpr();
      if (!peek() || peek().type !== ')') {
        throw new SyntaxError('Falta paréntesis de cierre.');
      }
      consume();
      return inner;
    }
    throw new SyntaxError(`Token inesperado en radical: "${tok.val}"`);
  }

  const res = parseExpr();
  if (pos < tokens.length) {
    throw new SyntaxError(`Sobran símbolos en radical: "${tokens[pos].val}"`);
  }
  return res;
}

/* ==========================================================================
   3. Normalización, Tokenización y Parser AST Lineal (Ax + By + C = 0)
   ========================================================================== */

export function normalizeLinearString(raw, varNames = ['x', 'y']) {
  if (typeof raw !== 'string') return '';
  let s = raw
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[·×⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d),(\d)/g, '$1.$2');

  // Reemplaza ":" de división por "/" (sin romper notación de conjuntos si existiera)
  s = s.replace(/\s*:\s*/g, '/');

  // Limpia encabezados tipo "f(x) =", "g(x) =", "p(d) ="
  const fnPrefix = new RegExp(`^[a-zA-Z]\\s*\\(\\s*[${varNames.join('')}]\\s*\\)\\s*=`, 'i');
  if (fnPrefix.test(s)) {
    s = s.replace(fnPrefix, `${varNames[1] || 'y'}=`);
  }
  return s;
}

function makeLinearError(errorCode, errorMessage) {
  const err = new Error(errorMessage);
  err.code = errorCode;
  return err;
}

/**
 * Tokeniza una expresión algebraica lineal en dos variables [v1, v2].
 */
function tokenizeLinearExpr(exprStr, varNames = ['x', 'y']) {
  const v1 = varNames[0].toLowerCase();
  const v2 = varNames[1].toLowerCase();
  const rawTokens = [];
  let i = 0;

  while (i < exprStr.length) {
    const ch = exprStr[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if ('+-*/^()'.includes(ch)) {
      rawTokens.push({ type: ch, val: ch });
      i += 1;
      continue;
    }
    if (/\d|\./.test(ch)) {
      let j = i;
      while (j < exprStr.length && /[\d.]/.test(exprStr[j])) j += 1;
      const numStr = exprStr.slice(i, j);
      if ((numStr.match(/\./g) || []).length > 1) {
        throw makeLinearError('syntax_error', `Número decimal mal formado: "${numStr}"`);
      }
      rawTokens.push({ type: 'NUM', val: numStr });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < exprStr.length && /[a-zA-Z]/.test(exprStr[j])) j += 1;
      const ident = exprStr.slice(i, j).toLowerCase();
      if (ident.length > 1) {
        // Permite secuencias implícitas como "xy" para detectarlas como no lineales
        for (const letter of ident) {
          if (letter === v1) rawTokens.push({ type: 'VAR1', val: v1 });
          else if (letter === v2) rawTokens.push({ type: 'VAR2', val: v2 });
          else {
            throw makeLinearError('unknown_variable', `Variable desconocida "${letter}". Usá ${v1} e ${v2}.`);
          }
        }
      } else if (ident === v1) {
        rawTokens.push({ type: 'VAR1', val: v1 });
      } else if (ident === v2) {
        rawTokens.push({ type: 'VAR2', val: v2 });
      } else {
        throw makeLinearError('unknown_variable', `Variable desconocida "${ident}". Usá ${v1} e ${v2}.`);
      }
      i = j;
      continue;
    }
    throw makeLinearError('syntax_error', `Carácter no reconocido "${ch}".`);
  }

  // Inserta multiplicación implícita: 2x, 2(x+1), (x+1)(x-1), x(2), )x
  const tokens = [];
  const isValueEnd = (t) => t && (t.type === 'NUM' || t.type === 'VAR1' || t.type === 'VAR2' || t.type === ')');
  const isValueStart = (t) => t && (t.type === 'NUM' || t.type === 'VAR1' || t.type === 'VAR2' || t.type === '(');

  for (const tok of rawTokens) {
    const prev = tokens[tokens.length - 1];
    if (isValueEnd(prev) && isValueStart(tok)) {
      tokens.push({ type: '*', val: '*' });
    }
    tokens.push(tok);
  }
  return tokens;
}

const ZERO_VEC = () => ({ x: rat(0), y: rat(0), c: rat(0) });

function vecAdd(a, b) {
  return { x: ratAdd(a.x, b.x), y: ratAdd(a.y, b.y), c: ratAdd(a.c, b.c) };
}
function vecSub(a, b) {
  return { x: ratSub(a.x, b.x), y: ratSub(a.y, b.y), c: ratSub(a.c, b.c) };
}
function vecNeg(a) {
  return { x: ratNeg(a.x), y: ratNeg(a.y), c: ratNeg(a.c) };
}
function vecIsConst(v) {
  return ratIsZero(v.x) && ratIsZero(v.y);
}
function vecScale(v, k) {
  return { x: ratMul(v.x, k), y: ratMul(v.y, k), c: ratMul(v.c, k) };
}
function vecMul(a, b) {
  if (vecIsConst(a)) return vecScale(b, a.c);
  if (vecIsConst(b)) return vecScale(a, b.c);
  throw makeLinearError('quadratic_or_nonlinear_term', 'Aparece un producto entre variables (término no lineal).');
}
function vecDiv(a, b) {
  if (!vecIsConst(b)) {
    throw makeLinearError('variable_in_denominator', 'Una ecuación lineal no puede dividir por una variable.');
  }
  if (ratIsZero(b.c)) {
    throw makeLinearError('division_by_zero', 'División por cero detectada en la expresión.');
  }
  return { x: ratDiv(a.x, b.c), y: ratDiv(a.y, b.c), c: ratDiv(a.c, b.c) };
}

/**
 * Parsea una expresión lineal AST en una tupla de racionales { x, y, c }.
 */
export function parseLinearExprVec(exprStr, varNames = ['x', 'y']) {
  const tokens = tokenizeLinearExpr(exprStr, varNames);
  if (tokens.length === 0) {
    throw makeLinearError('syntax_error', 'Expresión vacía.');
  }
  let pos = 0;
  const peek = () => tokens[pos] || null;
  const consume = () => tokens[pos++];

  function parseSum() {
    let left = parseProd();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = consume().type;
      const right = parseProd();
      left = op === '+' ? vecAdd(left, right) : vecSub(left, right);
    }
    return left;
  }

  function parseProd() {
    let left = parsePow();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const op = consume().type;
      const right = parsePow();
      left = op === '*' ? vecMul(left, right) : vecDiv(left, right);
    }
    return left;
  }

  function parsePow() {
    const base = parseUnary();
    if (peek() && peek().type === '^') {
      consume();
      const exp = parsePow();
      if (!vecIsConst(exp) || !ratIsInt(exp.c)) {
        throw makeLinearError('quadratic_or_nonlinear_term', 'Exponente no permitido en ecuación lineal.');
      }
      const e = exp.c.n;
      if (e === 1) return base;
      if (e === 0 && !vecIsConst(base)) {
        throw makeLinearError('quadratic_or_nonlinear_term', 'Exponente 0 sobre variable no permitido.');
      }
      if (!vecIsConst(base)) {
        throw makeLinearError('quadratic_or_nonlinear_term', `Potencia de grado ${e} no es lineal.`);
      }
      return { x: rat(0), y: rat(0), c: ratFromNumber(Math.pow(ratToNumber(base.c), e)) };
    }
    return base;
  }

  function parseUnary() {
    if (peek() && peek().type === '+') {
      consume();
      return parseUnary();
    }
    if (peek() && peek().type === '-') {
      consume();
      return vecNeg(parseUnary());
    }
    return parseAtom();
  }

  function parseAtom() {
    const tok = peek();
    if (!tok) throw makeLinearError('syntax_error', 'Expresión incompleta.');
    if (tok.type === 'NUM') {
      consume();
      return { x: rat(0), y: rat(0), c: ratFromString(tok.val) };
    }
    if (tok.type === 'VAR1') {
      consume();
      return { x: rat(1), y: rat(0), c: rat(0) };
    }
    if (tok.type === 'VAR2') {
      consume();
      return { x: rat(0), y: rat(1), c: rat(0) };
    }
    if (tok.type === '(') {
      consume();
      const inner = parseSum();
      if (!peek() || peek().type !== ')') {
        throw makeLinearError('syntax_error', 'Falta paréntesis de cierre.');
      }
      consume();
      return inner;
    }
    throw makeLinearError('syntax_error', `Símbolo inesperado "${tok.val}".`);
  }

  const vec = parseSum();
  if (pos < tokens.length) {
    throw makeLinearError('syntax_error', `Sobran símbolos cerca de "${tokens[pos].val}".`);
  }
  return vec;
}

/**
 * Normaliza { A, B, C } para Ax + By + C = 0 (racionales reducidos, primer coeficiente no nulo > 0,
 * enteros coprimos cuando resulta cómodo).
 */
export function normalizeLineCoeffs(A, B, C) {
  const rA = rat(A.n, A.d);
  const rB = rat(B.n, B.d);
  const rC = rat(C.n, C.d);

  if (ratIsZero(rA) && ratIsZero(rB)) {
    return { A: rat(0), B: rat(0), C: rC, degenerate: true };
  }

  // Elimina denominadores comunes para obtener enteros coprimos
  const lcm2 = (u, v) => (u * v) / gcdInt(u, v);
  const commonD = lcm2(lcm2(rA.d, rB.d), rC.d);
  let iA = rA.n * (commonD / rA.d);
  let iB = rB.n * (commonD / rB.d);
  let iC = rC.n * (commonD / rC.d);

  let g = 0;
  if (iA !== 0) g = Math.abs(iA);
  if (iB !== 0) g = g ? gcdInt(g, iB) : Math.abs(iB);
  if (iC !== 0) g = g ? gcdInt(g, iC) : Math.abs(iC);
  if (g > 1) {
    iA /= g;
    iB /= g;
    iC /= g;
  }

  // Primer coeficiente no nulo entre (A, B) positivo
  const firstSign = iA !== 0 ? Math.sign(iA) : Math.sign(iB);
  if (firstSign < 0) {
    iA = -iA;
    iB = -iB;
    iC = -iC;
  }

  return {
    A: rat(iA, 1),
    B: rat(iB, 1),
    C: rat(iC, 1),
    degenerate: false,
  };
}

function isPureSingleVar(str, varChar) {
  return str.replace(/\s+/g, '').toLowerCase() === varChar.toLowerCase();
}

function isSegmentarySide(sideStr, varNames = ['x', 'y']) {
  const v1 = varNames[0].toLowerCase();
  const v2 = varNames[1].toLowerCase();
  const s = sideStr.replace(/\s+/g, '').toLowerCase();
  // Detecta forma ±(v1/a) ± (v2/b) o ±(v2/b) ± (v1/a)
  // Divide términos de nivel 0 por + o -
  const terms = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if ((ch === '+' || ch === '-') && depth === 0 && i > 0 && s[i - 1] !== '(' && s[i - 1] !== '/') {
      terms.push(s.slice(start, i));
      start = i;
    }
  }
  terms.push(s.slice(start));
  if (terms.length !== 2) return false;

  const matchVarOverConst = (t, vChar) => {
    let clean = t.replace(/^\+/, '');
    let sign = '';
    if (clean.startsWith('-')) {
      sign = '-';
      clean = clean.slice(1);
    }
    if (clean.startsWith('(') && clean.endsWith(')')) {
      let d = 0;
      let balanced = true;
      for (let i = 0; i < clean.length - 1; i++) {
        if (clean[i] === '(') d += 1;
        else if (clean[i] === ')') d -= 1;
        if (d === 0) {
          balanced = false;
          break;
        }
      }
      if (balanced) {
        clean = clean.slice(1, -1);
      }
    }
    if (sign && clean.startsWith('-')) {
      clean = clean.slice(1);
    } else if (sign && !clean.startsWith('-')) {
      clean = sign + clean;
    }
    const re = new RegExp(`^-?${vChar}/\\(?[+-]?[0-9.]+(?:/[0-9.]+)?\\)?$`);
    if (re.test(clean)) return true;
    // También acepta x/a donde - está en denominador: +x/(-2)
    return false;
  };

  return (
    (matchVarOverConst(terms[0], v1) && matchVarOverConst(terms[1], v2)) ||
    (matchVarOverConst(terms[0], v2) && matchVarOverConst(terms[1], v1))
  );
}

/**
 * Clasifica la forma superficial escrita por el estudiante.
 */
export function classifyLinearSurfaceForm(raw, context = {}) {
  const varNames = context.varNames || ['x', 'y'];
  const v1 = varNames[0].toLowerCase();
  const v2 = varNames[1].toLowerCase();
  const norm = normalizeLinearString(raw, varNames);

  if (!norm.includes('=')) {
    // Expresión suelta: "2x - 5" tratada como "y = 2x - 5"
    const rhsVec = parseLinearExprVec(norm, varNames);
    if (!ratIsZero(rhsVec.y)) {
      return 'implicit';
    }
    return ratIsZero(rhsVec.x) ? 'horizontal' : 'explicit';
  }

  const eqParts = norm.split('=');
  if (eqParts.length !== 2 || !eqParts[0].trim() || !eqParts[1].trim()) {
    throw makeLinearError('syntax_error', 'La ecuación debe tener exactamente un signo "=".');
  }
  const [lhsRaw, rhsRaw] = eqParts;
  const lhsVec = parseLinearExprVec(lhsRaw, varNames);
  const rhsVec = parseLinearExprVec(rhsRaw, varNames);
  const diff = vecSub(lhsVec, rhsVec);

  if (ratIsZero(diff.x) && ratIsZero(diff.y)) {
    throw makeLinearError('degenerate_equation', 'La ecuación no contiene variables (no define una recta).');
  }

  const lhsSingleY = isPureSingleVar(lhsRaw, v2);
  const rhsSingleY = isPureSingleVar(rhsRaw, v2);
  const lhsSingleX = isPureSingleVar(lhsRaw, v1);
  const rhsSingleX = isPureSingleVar(rhsRaw, v1);

  // Vertical: x = k (o k = x)
  if (ratIsZero(diff.y) && !ratIsZero(diff.x)) {
    if ((lhsSingleX && vecIsConst(rhsVec)) || (rhsSingleX && vecIsConst(lhsVec))) {
      return 'vertical';
    }
  }

  // Explícita / Horizontal: y = mx + b
  if ((lhsSingleY && ratIsZero(rhsVec.y)) || (rhsSingleY && ratIsZero(lhsVec.y))) {
    if (ratIsZero(diff.x)) return 'horizontal';
    return 'explicit';
  }

  // Segmentaria: x/a + y/b = 1
  if (
    (vecIsConst(rhsVec) && ratIsOne(rhsVec.c) && isSegmentarySide(lhsRaw, varNames)) ||
    (vecIsConst(lhsVec) && ratIsOne(lhsVec.c) && isSegmentarySide(rhsRaw, varNames))
  ) {
    return 'segmentary';
  }

  // Implícita: ax + by + c = 0
  if (
    (vecIsConst(rhsVec) && ratIsZero(rhsVec.c)) ||
    (vecIsConst(lhsVec) && ratIsZero(lhsVec.c))
  ) {
    return 'implicit';
  }

  // Implícita con constante en el segundo miembro: ax + by = c
  if (vecIsConst(rhsVec) || vecIsConst(lhsVec)) {
    return 'implicit_constant_rhs';
  }

  return 'general_linear';
}

export function parseLinearEquation(raw, context = {}) {
  const varNames = context.varNames || ['x', 'y'];
  try {
    const norm = normalizeLinearString(raw, varNames);
    if (!norm) {
      return { ok: false, errorCode: 'syntax_error', errorMessage: 'Escribí una ecuación antes de comprobar.' };
    }
    let A;
    let B;
    let C;
    if (!norm.includes('=')) {
      const rhsVec = parseLinearExprVec(norm, varNames);
      if (!ratIsZero(rhsVec.y)) {
        return {
          ok: false,
          errorCode: 'syntax_error',
          errorMessage: 'Si incluís la variable y, escribí la igualdad completa con "=".',
        };
      }
      // y = rhs  =>  rhs.x * x - y + rhs.c = 0
      A = rhsVec.x;
      B = rat(-1);
      C = rhsVec.c;
    } else {
      const parts = norm.split('=');
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
        return { ok: false, errorCode: 'syntax_error', errorMessage: 'Falta un miembro en la igualdad.' };
      }
      const lhsVec = parseLinearExprVec(parts[0], varNames);
      const rhsVec = parseLinearExprVec(parts[1], varNames);
      const diff = vecSub(lhsVec, rhsVec);
      A = diff.x;
      B = diff.y;
      C = diff.c;
    }

    const canonical = normalizeLineCoeffs(A, B, C);
    if (canonical.degenerate) {
      return {
        ok: false,
        errorCode: 'degenerate_equation',
        errorMessage: 'Se cancelaron x e y: no define una recta en el plano.',
      };
    }

    const surfaceForm = classifyLinearSurfaceForm(raw, context);
    return {
      ok: true,
      A: canonical.A,
      B: canonical.B,
      C: canonical.C,
      surfaceForm,
    };
  } catch (err) {
    const code = err.code || 'syntax_error';
    let mappedCode = code;
    if (code === 'division_by_zero' && /\/0/.test(String(raw))) {
      mappedCode = 'segmentary_zero_intercept';
    }
    return {
      ok: false,
      errorCode: mappedCode,
      errorMessage: err.message || 'No pude interpretar la ecuación.',
    };
  }
}

/**
 * Compara equivalencia exacta de dos ecuaciones lineales (proyectiva sobre Ax+By+C=0)
 * y valida forma requerida ('explicit' | 'implicit' | 'segmentary' | 'vertical' | 'horizontal' | null).
 */
export function equivalentLineEquation(inputA, inputB, requireForm = null, context = {}) {
  const parsedA = typeof inputA === 'string' ? parseLinearEquation(inputA, context) : inputA;
  const parsedB = typeof inputB === 'string' ? parseLinearEquation(inputB, context) : inputB;

  if (!parsedA || !parsedA.ok) {
    return {
      status: 'syntax_error',
      equivalent: false,
      sameForm: false,
      errorCode: parsedA?.errorCode || 'syntax_error',
      error: parsedA?.errorMessage || 'Error de sintaxis en la ecuación.',
    };
  }
  if (!parsedB || !parsedB.ok) {
    return {
      status: 'syntax_error',
      equivalent: false,
      sameForm: false,
      errorCode: parsedB?.errorCode || 'syntax_error',
      error: parsedB?.errorMessage || 'Error de sintaxis en la referencia.',
    };
  }

  // Chequeo proyectivo exacto: A1*B2 == A2*B1, A1*C2 == A2*C1, B1*C2 == B2*C1
  const eqAB = ratEq(ratMul(parsedA.A, parsedB.B), ratMul(parsedB.A, parsedA.B));
  const eqAC = ratEq(ratMul(parsedA.A, parsedB.C), ratMul(parsedB.A, parsedA.C));
  const eqBC = ratEq(ratMul(parsedA.B, parsedB.C), ratMul(parsedB.B, parsedA.C));
  const equivalent = eqAB && eqAC && eqBC;

  // Chequeo de forma indefinida en segmentaria (pasa por origen, horizontal o vertical)
  if (requireForm === 'segmentary') {
    if (ratIsZero(parsedB.A) || ratIsZero(parsedB.B) || ratIsZero(parsedB.C)) {
      return {
        status: 'undefined_form',
        equivalent: false,
        sameForm: false,
        surfaceForm: parsedA.surfaceForm,
        reason: ratIsZero(parsedB.C)
          ? 'Pasa por el origen (0; 0): no existe forma segmentaria.'
          : ratIsZero(parsedB.A)
            ? 'Recta horizontal: no corta al eje X, sin forma segmentaria.'
            : 'Recta vertical: no corta al eje Y, sin forma segmentaria.',
      };
    }
  }

  if (requireForm === 'explicit' && ratIsZero(parsedB.B)) {
    return {
      status: 'undefined_form',
      equivalent: false,
      sameForm: false,
      surfaceForm: parsedA.surfaceForm,
      reason: 'Recta vertical x = k: no admite forma explícita y = mx + b.',
    };
  }

  if (!equivalent) {
    return {
      status: 'not_equivalent',
      equivalent: false,
      sameForm: false,
      surfaceForm: parsedA.surfaceForm,
      parsedA,
      parsedB,
    };
  }

  let sameForm = true;
  if (requireForm) {
    if (requireForm === 'explicit') {
      sameForm = parsedA.surfaceForm === 'explicit' || parsedA.surfaceForm === 'horizontal';
    } else if (requireForm === 'horizontal') {
      sameForm = parsedA.surfaceForm === 'horizontal' && ratIsZero(parsedA.A);
    } else if (requireForm === 'vertical') {
      sameForm = parsedA.surfaceForm === 'vertical';
    } else {
      sameForm = parsedA.surfaceForm === requireForm;
    }
  }

  return {
    status: sameForm ? 'exact_match' : 'equivalent_form',
    equivalent: true,
    sameForm,
    surfaceForm: parsedA.surfaceForm,
    parsedA,
    parsedB,
  };
}

/* ==========================================================================
   4. Números, Pares Ordenados y Conjuntos/Intervalos Exactas (;)
   ========================================================================== */

export function parseNumberOrFraction(raw) {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) throw new RangeError('Número inválido.');
    return raw;
  }
  const r = ratFromString(String(raw));
  return ratToNumber(r);
}

export function parseOrderedPair(raw) {
  if (raw && typeof raw === 'object' && 'x' in raw && 'y' in raw) {
    return { x: Number(raw.x), y: Number(raw.y) };
  }
  const s = String(raw || '')
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-');

  if (!s.includes(';')) {
    if (s.includes(',')) {
      const err = new SyntaxError(
        'En notación de Exactas UNMDP las coordenadas se separan con punto y coma ";", por ejemplo (2; −3), reservando la coma "," para los decimales.'
      );
      err.code = 'comma_instead_of_semicolon';
      throw err;
    }
    throw new SyntaxError('Escribí el par ordenado entre paréntesis con punto y coma, por ejemplo (0; 3).');
  }

  const inner = s.replace(/^\(/, '').replace(/\)$/, '').trim();
  const parts = inner.split(';');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    throw new SyntaxError('El par ordenado debe tener exactamente dos coordenadas separadas por ";".');
  }
  const rx = ratFromString(parts[0].trim());
  const ry = ratFromString(parts[1].trim());
  return {
    x: ratToNumber(rx),
    y: ratToNumber(ry),
    rx,
    ry,
  };
}

function parseEndpointBound(str) {
  const s = str
    .trim()
    .toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, '');
  if (s === '-inf' || s === '-∞' || s === '-infinity') return -Infinity;
  if (s === '+inf' || s === 'inf' || s === '+∞' || s === '∞' || s === 'infinity') return Infinity;
  return ratToNumber(ratFromString(s));
}

function parseSingleIntervalToken(tok) {
  const s = tok.trim();
  const m = s.match(/^([([])(.+);(.+)([\])])$/);
  if (!m) {
    throw new SyntaxError(`Intervalo mal formado: "${s}". Usá el formato (a; b) o [a; b) con punto y coma.`);
  }
  const loC = m[1] === '[';
  const hiC = m[4] === ']';
  const lo = parseEndpointBound(m[2]);
  const hi = parseEndpointBound(m[3]);
  if (lo > hi || (lo === hi && !(loC && hiC))) {
    return null; // vacío
  }
  if (!Number.isFinite(lo) && loC) {
    throw new SyntaxError('El infinito nunca lleva corchete cerrado.');
  }
  if (!Number.isFinite(hi) && hiC) {
    throw new SyntaxError('El infinito nunca lleva corchete cerrado.');
  }
  return { lo, hi, loC, hiC };
}

export function parseSetOrIntervalExactas(raw) {
  const s = String(raw || '')
    .trim()
    .replace(/[\u2212\u2013\u2014]/g, '-');

  if (!s) throw new SyntaxError('Ingresá un conjunto o intervalo.');

  const lower = s.toLowerCase().replace(/\s+/g, '');
  if (['∅', '{}', 'vacio', 'vacío', 'empty'].includes(lower)) {
    return { kind: 'empty', intervals: [], points: [] };
  }
  if (['r', 'ℝ', 'reales', 'todoslosreales', '(-inf;+inf)', '(-∞;+∞)'].includes(lower)) {
    return { kind: 'intervals', intervals: [{ lo: -Infinity, hi: Infinity, loC: false, hiC: false }], points: [] };
  }

  // R - {a; b}
  const diffMatch = s.match(/^(?:ℝ|R)\s*[-\\]\s*\{(.+)\}$/i);
  if (diffMatch) {
    const holes = diffMatch[1]
      .split(';')
      .map((x) => ratToNumber(ratFromString(x.trim())))
      .sort((a, b) => a - b);
    const uniq = holes.filter((v, idx) => idx === 0 || Math.abs(v - holes[idx - 1]) > 1e-9);
    const intervals = [];
    let prev = -Infinity;
    for (const h of uniq) {
      intervals.push({ lo: prev, hi: h, loC: false, hiC: false });
      prev = h;
    }
    intervals.push({ lo: prev, hi: Infinity, loC: false, hiC: false });
    return { kind: 'intervals', intervals, points: [] };
  }

  // Conjunto discreto {a; b}
  if (s.startsWith('{') && s.endsWith('}')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return { kind: 'empty', intervals: [], points: [] };
    if (inner.includes(',') && !inner.includes(';') && !/^\s*[+-]?\d+,\d+\s*$/.test(inner)) {
      const err = new SyntaxError('Separá los elementos del conjunto con punto y coma ";", ej. {−1/2; 3}.');
      err.code = 'comma_instead_of_semicolon';
      throw err;
    }
    const pts = inner
      .split(';')
      .map((p) => ratToNumber(ratFromString(p.trim())))
      .sort((a, b) => a - b);
    const uniq = pts.filter((v, idx) => idx === 0 || Math.abs(v - pts[idx - 1]) > 1e-9);
    return { kind: 'points', intervals: [], points: uniq };
  }

  // Unión de intervalos: (...) U [...]
  if (s.includes(',') && !s.includes(';') && !/\d,\d/.test(s)) {
    const err = new SyntaxError('Usá punto y coma ";" dentro de cada intervalo, por ejemplo (−∞; 3/2).');
    err.code = 'comma_instead_of_semicolon';
    throw err;
  }

  const parts = s.split(/\s*(?:∪|\b[uU]\b)\s*/).filter(Boolean);
  const intervals = parts
    .map(parseSingleIntervalToken)
    .filter(Boolean)
    .sort((a, b) => a.lo - b.lo || a.hi - b.hi);

  if (intervals.length === 0) {
    return { kind: 'empty', intervals: [], points: [] };
  }

  // Normaliza intervalos contiguos o solapados
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const cur = intervals[i];
    const last = merged[merged.length - 1];
    if (cur.lo < last.hi - 1e-9 || (Math.abs(cur.lo - last.hi) <= 1e-9 && (last.hiC || cur.loC))) {
      if (cur.hi > last.hi + 1e-9) {
        last.hi = cur.hi;
        last.hiC = cur.hiC;
      } else if (Math.abs(cur.hi - last.hi) <= 1e-9) {
        last.hiC = last.hiC || cur.hiC;
      }
    } else {
      merged.push(cur);
    }
  }

  return { kind: 'intervals', intervals: merged, points: [] };
}

export function equivalentSetExactas(userStr, expectedStr) {
  const a = parseSetOrIntervalExactas(userStr);
  const b = parseSetOrIntervalExactas(expectedStr);
  if (a.kind !== b.kind) return false;
  if (a.kind === 'empty') return true;
  if (a.kind === 'points') {
    if (a.points.length !== b.points.length) return false;
    return a.points.every((v, i) => Math.abs(v - b.points[i]) < 1e-7);
  }
  if (a.intervals.length !== b.intervals.length) return false;
  return a.intervals.every((ivA, i) => {
    const ivB = b.intervals[i];
    const loMatch =
      (!Number.isFinite(ivA.lo) && !Number.isFinite(ivB.lo) && ivA.lo === ivB.lo) ||
      (Number.isFinite(ivA.lo) && Number.isFinite(ivB.lo) && Math.abs(ivA.lo - ivB.lo) < 1e-7);
    const hiMatch =
      (!Number.isFinite(ivA.hi) && !Number.isFinite(ivB.hi) && ivA.hi === ivB.hi) ||
      (Number.isFinite(ivA.hi) && Number.isFinite(ivB.hi) && Math.abs(ivA.hi - ivB.hi) < 1e-7);
    return loMatch && hiMatch && ivA.loC === ivB.loC && ivA.hiC === ivB.hiC;
  });
}
