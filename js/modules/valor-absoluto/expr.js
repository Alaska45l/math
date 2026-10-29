/**
 * expr.js — Parser descendente recursivo y evaluador de expresiones
 * algebraicas en la variable 'x' con soporte de valor absoluto |...| y abs(...)
 * (100% libre de eval / new Function).
 */

export const MINUS_CHAR = '\u2212'; // '−'

const SUPERSCRIPT_MAP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
};

const approxEq = (a, b) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function fmtNum(n) {
  if (!Number.isFinite(n)) return '?';
  const r = Number(n.toFixed(4));
  const v = Object.is(r, -0) ? 0 : r;
  const s = String(v).replace('.', ',');
  return v < 0 ? `${MINUS_CHAR}${s.slice(1)}` : s;
}

/**
 * Normaliza la cadena de entrada reemplazando variantes tipográficas,
 * comas decimales y secuencias de superíndices.
 */
function normalize(src) {
  let s = src;
  // Prefijos opcionales tipo f(x) = o y =
  s = s.replace(/^\s*(?:[fgh]\s*\(\s*x\s*\)|y)\s*=\s*/i, '');
  // Signos menos tipográficos y guiones
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // Operadores de multiplicación
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  // Operadores de división
  s = s.replace(/[\u00F7:]/g, '/');
  // Barras verticales tipográficas
  s = s.replace(/[\u2223\uFF5C]/g, '|');
  // Coma decimal entre dígitos
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // Superíndices Unicode convertidos a ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

/**
 * Determina si una barra '|' en el flujo de tokens abre o cierra un valor absoluto.
 * Usa una pila de contextos ('(' vs '|') y el tipo del token previo.
 */
function resolveAbsBars(rawTokens) {
  const stack = []; // '(' o '|'
  const out = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const prev = out.length > 0 ? out[out.length - 1] : null;

    if (tok.type === '(') {
      stack.push('(');
      out.push(tok);
      continue;
    }

    if (tok.type === ')') {
      if (stack.length === 0 || stack[stack.length - 1] !== '(') {
        const err = new SyntaxError('Paréntesis de cierre sin abrir.');
        err.code = 'unclosed_paren';
        err.pos = tok.pos;
        throw err;
      }
      stack.pop();
      out.push(tok);
      continue;
    }

    if (tok.type === '|') {
      // ¿Puede cerrar un '|' abierto en el tope de la pila?
      const topIsBar = stack.length > 0 && stack[stack.length - 1] === '|';
      // Un '|' cierra si el tope de la pila es '|' Y el token anterior es un operando completo
      // (number, var, ')', 'abs_close') Y el siguiente token NO obliga a que este '|' sea un operando nuevo tras un operador
      const prevEndsExpr = prev && (
        prev.type === 'number' ||
        prev.type === 'var' ||
        prev.type === ')' ||
        prev.type === 'abs_close'
      );

      if (topIsBar && prevEndsExpr) {
        stack.pop();
        out.push({ type: 'abs_close', pos: tok.pos });
      } else {
        stack.push('|');
        out.push({ type: 'abs_open', pos: tok.pos });
      }
      continue;
    }

    out.push(tok);
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    const err = new SyntaxError(
      unclosed === '|'
        ? 'Barra de valor absoluto "|" sin cerrar.'
        : 'Paréntesis "(" sin cerrar.'
    );
    err.code = unclosed === '|' ? 'unclosed_abs' : 'unclosed_paren';
    throw err;
  }

  return out;
}

/**
 * Tokenizador con soporte de abs(...), |...| y multiplicación implícita.
 */
function tokenize(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    const err = new SyntaxError('Ingresá una expresión algebraica.');
    err.code = 'empty';
    throw err;
  }
  if (raw.length > 240) {
    const err = new SyntaxError('La expresión es demasiado larga.');
    err.code = 'too_long';
    throw err;
  }

  const s = normalize(raw);
  const rawTokens = [];
  let i = 0;
  const len = s.length;

  while (i < len) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Número
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(s[i + 1] || ''))) {
      const start = i;
      let hasDot = ch === '.';
      i++;
      while (i < len) {
        const c = s[i];
        if (/\d/.test(c)) {
          i++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          i++;
        } else {
          break;
        }
      }
      const numStr = s.slice(start, i);
      const val = parseFloat(numStr);
      rawTokens.push({ type: 'number', value: val, raw: numStr, pos: start });
      continue;
    }

    // Identificadores: 'x', 'X' o 'abs'
    if (/[a-zA-Z]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z]/.test(s[i])) i++;
      const word = s.slice(start, i).toLowerCase();
      if (word === 'x') {
        rawTokens.push({ type: 'var', value: 'x', pos: start });
        continue;
      }
      if (word === 'abs') {
        rawTokens.push({ type: 'fn_abs', pos: start });
        continue;
      }
      const err = new SyntaxError(`Identificador desconocido '${s.slice(start, i)}'. Usá la variable 'x' o barras |x|.`);
      err.code = 'unknown_variable';
      err.pos = start;
      throw err;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '(' || ch === ')' || ch === '|') {
      if ((ch === '*' || ch === '/') && s[i + 1] === ch) {
        const err = new SyntaxError(`Operador duplicado '${ch}${ch}'.`);
        err.code = 'unexpected_token';
        err.pos = i;
        throw err;
      }
      rawTokens.push({ type: ch, pos: i });
      i++;
      continue;
    }

    const err = new SyntaxError(`Carácter inesperado: '${ch}'.`);
    err.code = 'unexpected_token';
    err.pos = i;
    throw err;
  }

  // Dos números seguidos sin operador
  for (let k = 0; k < rawTokens.length - 1; k++) {
    if (rawTokens[k].type === 'number' && rawTokens[k + 1].type === 'number') {
      const err = new SyntaxError(`Dos números separados sin operador ('${rawTokens[k].raw}' y '${rawTokens[k + 1].raw}').`);
      err.code = 'unexpected_token';
      err.pos = rawTokens[k + 1].pos;
      throw err;
    }
  }

  const tokens = resolveAbsBars(rawTokens);

  // Multiplicación implícita:
  // (number | var | ')' | 'abs_close') seguido de (var | '(' | 'abs_open' | 'fn_abs' | number [si prev es ')' o 'abs_close'])
  const expanded = [];
  for (let k = 0; k < tokens.length; k++) {
    const cur = tokens[k];
    expanded.push(cur);
    if (k < tokens.length - 1) {
      const nxt = tokens[k + 1];
      const leftCanMul =
        cur.type === 'number' ||
        cur.type === 'var' ||
        cur.type === ')' ||
        cur.type === 'abs_close';
      const rightCanMul =
        nxt.type === 'var' ||
        nxt.type === '(' ||
        nxt.type === 'abs_open' ||
        nxt.type === 'fn_abs';
      const closeFollowedByNum =
        (cur.type === ')' || cur.type === 'abs_close') && nxt.type === 'number';

      if ((leftCanMul && rightCanMul) || closeFollowedByNum) {
        expanded.push({ type: '*', implicit: true, pos: nxt.pos });
      }
    }
  }

  return expanded;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || null;
  }

  consume(expectedType) {
    const tok = this.peek();
    if (!tok) {
      const err = new SyntaxError('La expresión termina inesperadamente.');
      err.code = 'unexpected_end';
      throw err;
    }
    if (expectedType && tok.type !== expectedType) {
      const err = new SyntaxError(`Se esperaba '${expectedType}', pero se encontró '${tok.type}'.`);
      err.code = 'unexpected_token';
      err.pos = tok.pos;
      throw err;
    }
    this.pos++;
    return tok;
  }

  parse() {
    const ast = this.parseSum();
    if (this.pos < this.tokens.length) {
      const tok = this.tokens[this.pos];
      const err = new SyntaxError(`Símbolo no esperado '${tok.raw || tok.type}'.`);
      err.code = 'unexpected_token';
      err.pos = tok.pos;
      throw err;
    }
    return ast;
  }

  parseSum() {
    let left = this.parseProduct();
    while (true) {
      const tok = this.peek();
      if (tok && (tok.type === '+' || tok.type === '-')) {
        this.consume();
        const right = this.parseProduct();
        left = { type: 'binary', op: tok.type, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  parseProduct() {
    let left = this.parseUnary();
    while (true) {
      const tok = this.peek();
      if (tok && (tok.type === '*' || tok.type === '/')) {
        this.consume();
        const right = this.parseUnary();
        left = { type: 'binary', op: tok.type, left, right, implicit: !!tok.implicit };
      } else {
        break;
      }
    }
    return left;
  }

  parseUnary() {
    const tok = this.peek();
    if (tok && (tok.type === '-' || tok.type === '+')) {
      this.consume();
      const right = this.parseUnary();
      if (tok.type === '+') return right;
      return { type: 'unary', op: '-', expr: right };
    }
    return this.parsePower();
  }

  parsePower() {
    const base = this.parseAtom();
    const tok = this.peek();
    if (tok && tok.type === '^') {
      this.consume();
      const exp = this.parseUnary();
      return { type: 'power', left: base, right: exp };
    }
    return base;
  }

  parseAtom() {
    const tok = this.peek();
    if (!tok) {
      const err = new SyntaxError('La expresión termina inesperadamente.');
      err.code = 'unexpected_end';
      throw err;
    }

    if (tok.type === 'number') {
      this.consume();
      return { type: 'number', value: tok.value };
    }

    if (tok.type === 'var') {
      this.consume();
      return { type: 'var', name: 'x' };
    }

    if (tok.type === '(') {
      this.consume('(');
      const inner = this.parseSum();
      this.consume(')');
      return { type: 'paren', expr: inner };
    }

    if (tok.type === 'abs_open') {
      this.consume('abs_open');
      const inner = this.parseSum();
      this.consume('abs_close');
      return { type: 'abs', expr: inner, notation: 'bars' };
    }

    if (tok.type === 'fn_abs') {
      this.consume('fn_abs');
      this.consume('(');
      const inner = this.parseSum();
      this.consume(')');
      return { type: 'abs', expr: inner, notation: 'fn' };
    }

    const err = new SyntaxError(`Símbolo inesperado '${tok.raw || tok.type}'.`);
    err.code = 'unexpected_token';
    err.pos = tok.pos;
    throw err;
  }
}

/**
 * Parsea una expresión en 'x' y devuelve el AST.
 * Lanza SyntaxError con mensaje claro en español si la sintaxis es inválida.
 */
export function parseExpr(input) {
  if (input && typeof input === 'object' && input.type) {
    return input;
  }
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  return parser.parse();
}

/**
 * Wrapper seguro estilo { ok, ast, error } para UI interactiva.
 */
export function tryParseExpr(input) {
  try {
    const ast = parseExpr(input);
    return { ok: true, ast };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: err.code || 'syntax_error',
        message: err.message || String(err),
        pos: err.pos ?? 0,
      },
    };
  }
}

/**
 * Evalúa el AST para un x real dado.
 */
export function evalExpr(ast, x) {
  const node = typeof ast === 'string' ? parseExpr(ast) : ast;
  if (!node) return NaN;

  switch (node.type) {
    case 'number':
      return node.value;
    case 'var':
      return x;
    case 'paren':
      return evalExpr(node.expr, x);
    case 'abs':
      return Math.abs(evalExpr(node.expr, x));
    case 'unary': {
      const val = evalExpr(node.expr, x);
      return node.op === '-' ? -val : val;
    }
    case 'power': {
      const base = evalExpr(node.left, x);
      const exp = evalExpr(node.right, x);
      return Math.pow(base, exp);
    }
    case 'binary': {
      const l = evalExpr(node.left, x);
      const r = evalExpr(node.right, x);
      switch (node.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return r === 0 ? NaN : l / r;
        case '^': return Math.pow(l, r);
        default: return NaN;
      }
    }
    default:
      return NaN;
  }
}

/**
 * Devuelve string formateado con fmt() y barras |...|.
 */
export function toDisplay(ast) {
  const node = typeof ast === 'string' ? parseExpr(ast) : ast;
  if (!node) return '';

  switch (node.type) {
    case 'number':
      return fmtNum(node.value);
    case 'var':
      return 'x';
    case 'paren':
      return `(${toDisplay(node.expr)})`;
    case 'abs':
      return `|${toDisplay(node.expr)}|`;
    case 'unary': {
      const inner = toDisplay(node.expr);
      if (node.op === '-') {
        const needsParen = node.expr.type === 'binary' && (node.expr.op === '+' || node.expr.op === '-');
        return `${MINUS_CHAR}${needsParen ? `(${inner})` : inner}`;
      }
      return inner;
    }
    case 'power': {
      const base = node.left.type === 'number' || node.left.type === 'var' || node.left.type === 'paren' || node.left.type === 'abs'
        ? toDisplay(node.left)
        : `(${toDisplay(node.left)})`;
      const exp = node.right.type === 'number' || node.right.type === 'var' || node.right.type === 'paren'
        ? toDisplay(node.right)
        : `(${toDisplay(node.right)})`;
      return `${base}^${exp}`;
    }
    case 'binary': {
      const l = toDisplay(node.left);
      const r = toDisplay(node.right);
      if (node.op === '*') {
        if (node.implicit && (node.right.type === 'abs' || node.right.type === 'var' || node.right.type === 'paren')) {
          return `${l}${r}`;
        }
        return `${l} · ${r}`;
      }
      const opSym = node.op === '-' ? ` ${MINUS_CHAR} ` : ` ${node.op} `;
      return `${l}${opSym}${r}`;
    }
    default:
      return '';
  }
}

/**
 * Compara dos ASTs (o strings) en 41 puntos del dominio (más vértices candidatos)
 * con tolerancia 1e-9.
 */
export function equivalentFx(astA, astB, domain = [-10, 10]) {
  let nodeA, nodeB;
  try {
    nodeA = typeof astA === 'string' ? parseExpr(astA) : astA;
    nodeB = typeof astB === 'string' ? parseExpr(astB) : astB;
  } catch (_) {
    return false;
  }
  if (!nodeA || !nodeB) return false;

  const [minX, maxX] = domain;
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    pts.push(minX + ((maxX - minX) * i) / 40);
  }
  // Agregar puntos no enteros para evitar colisiones fortuitas y posibles vértices
  const paramsA = extractAbsParams(nodeA);
  const paramsB = extractAbsParams(nodeB);
  if (paramsA && Number.isFinite(paramsA.h)) pts.push(paramsA.h, paramsA.h - 0.37, paramsA.h + 0.37);
  if (paramsB && Number.isFinite(paramsB.h)) pts.push(paramsB.h, paramsB.h - 0.37, paramsB.h + 0.37);

  for (const x of pts) {
    const va = evalExpr(nodeA, x);
    const vb = evalExpr(nodeB, x);
    if (!approxEq(va, vb)) return false;
  }
  return true;
}

/**
 * Verifica si el AST contiene al menos un nodo de valor absoluto.
 */
export function hasAbsNode(ast) {
  if (!ast) return false;
  if (ast.type === 'abs') return true;
  if (ast.expr && hasAbsNode(ast.expr)) return true;
  if (ast.left && hasAbsNode(ast.left)) return true;
  if (ast.right && hasAbsNode(ast.right)) return true;
  return false;
}

/**
 * Evalúa si un nodo representa una función lineal m*x + b sin barras de valor absoluto.
 * Devuelve { m, b } o null.
 */
export function extractLinearParams(ast) {
  if (!ast || hasAbsNode(ast)) return null;
  const y0 = evalExpr(ast, 0);
  const y1 = evalExpr(ast, 1);
  if (!Number.isFinite(y0) || !Number.isFinite(y1)) return null;
  const m = y1 - y0;
  const b = y0;
  const testPts = [-7, -2.5, -1, 0, 1, 2.5, 8];
  for (const x of testPts) {
    if (!approxEq(evalExpr(ast, x), m * x + b)) return null;
  }
  return { m: Object.is(m, -0) ? 0 : m, b: Object.is(b, -0) ? 0 : b };
}

/**
 * Busca todos los subárboles de tipo 'abs' dentro de un AST.
 */
function collectAbsNodes(node, list = []) {
  if (!node) return list;
  if (node.type === 'abs') list.push(node);
  if (node.expr) collectAbsNodes(node.expr, list);
  if (node.left) collectAbsNodes(node.left, list);
  if (node.right) collectAbsNodes(node.right, list);
  return list;
}

/**
 * Si el AST representa f(x) = a|x - h| + k (o equivalente con pendiente interna como |m*x + c| + k),
 * devuelve { isCanonical, a, h, k, innerFactor? } o null.
 */
export function extractAbsParams(astInput) {
  let ast;
  try {
    ast = typeof astInput === 'string' ? parseExpr(astInput) : astInput;
  } catch (_) {
    return null;
  }
  if (!ast) return null;

  const absNodes = collectAbsNodes(ast);
  if (absNodes.length !== 1) return null;

  const absNode = absNodes[0];
  // El interior de |...| debe ser lineal en x: m*x + b0 con m != 0
  const innerLin = extractLinearParams(absNode.expr);
  if (!innerLin || approxEq(innerLin.m, 0)) return null;

  // Vértice candidato: m*x + b0 = 0 => h = -b0 / m
  const rawH = -innerLin.b / innerLin.m;
  const h = approxEq(rawH, Math.round(rawH)) ? Math.round(rawH) : Number(rawH.toFixed(9));

  const kRaw = evalExpr(ast, h);
  if (!Number.isFinite(kRaw)) return null;
  const k = approxEq(kRaw, Math.round(kRaw)) ? Math.round(kRaw) : Number(kRaw.toFixed(9));

  // Pendiente a la derecha de h y a la izquierda de h
  const yRight = evalExpr(ast, h + 1);
  const yLeft = evalExpr(ast, h - 1);
  if (!Number.isFinite(yRight) || !Number.isFinite(yLeft)) return null;

  const slopeRight = yRight - k;
  const slopeLeft = k - yLeft; // Para a|x - h| + k, en x = h - 1 vale a + k, así que k - (a + k) = -a
  if (!approxEq(slopeRight, -slopeLeft)) return null;

  const a = approxEq(slopeRight, Math.round(slopeRight))
    ? Math.round(slopeRight)
    : Number(slopeRight.toFixed(9));

  if (approxEq(a, 0)) return null;

  // Verificar que para todo x en un conjunto de prueba coincide con a*|x - h| + k
  const testPts = [h - 7, h - 2.3, h - 0.5, h, h + 0.5, h + 2.3, h + 7];
  for (const x of testPts) {
    const val = evalExpr(ast, x);
    const model = a * Math.abs(x - h) + k;
    if (!approxEq(val, model)) return null;
  }

  const innerFactor = Number(innerLin.m.toFixed(9));
  const isCanonical = approxEq(innerFactor, 1);

  const result = {
    isCanonical,
    a: Object.is(a, -0) ? 0 : a,
    h: Object.is(h, -0) ? 0 : h,
    k: Object.is(k, -0) ? 0 : k,
  };

  if (!isCanonical) {
    result.innerFactor = innerFactor;
  }

  return result;
}
