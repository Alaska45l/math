/**
 * expr.js — Parser descendente recursivo y evaluador de expresiones
 * algebraicas en la variable 'n' (100% libre de eval / new Function).
 */

export const MINUS_CHAR = '\u2212'; // '−'

// Mapa de dígitos y símbolos superíndices Unicode a caracteres estándar
const SUPERSCRIPT_MAP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ⁿ': 'n', '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
};

/**
 * Normaliza la cadena de entrada reemplazando variantes tipográficas,
 * comas decimales y secuencias de superíndices.
 */
function normalize(src) {
  let s = src;
  // Signos menos tipográficos y guiones
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  // Operadores de multiplicación
  s = s.replace(/[\u00B7\u00D7\u22C5]/g, '*');
  // Operadores de división
  s = s.replace(/[\u00F7:]/g, '/');
  // Variable N a minúscula
  s = s.replace(/N/g, 'n');
  // Coma decimal entre dígitos (ej. 0,5 o -5,3 -> 0.5 o -5.3)
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  // Superíndices Unicode convertidos a ^(...)
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

/**
 * Tokenizador seguro con soporte de multiplicación implícita y warnings.
 */
function tokenize(raw) {
  const warnings = [];
  if (typeof raw !== 'string' || !raw.trim()) {
    return { ok: false, error: { code: 'empty', message: 'Ingresá una expresión.', pos: 0 } };
  }
  if (raw.length > 200) {
    return { ok: false, error: { code: 'too_long', message: 'La expresión es demasiado larga (máximo 200 caracteres).', pos: 0 } };
  }

  const s = normalize(raw);
  const tokens = [];
  let i = 0;
  const len = s.length;

  while (i < len) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Número (entero o decimal)
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
      tokens.push({ type: 'number', value: val, raw: numStr, pos: start });
      continue;
    }

    // Variable 'n'
    if (ch === 'n') {
      tokens.push({ type: 'var', value: 'n', pos: i });
      i++;
      continue;
    }

    // Letras distintas de 'n': error unknown_variable
    if (/[a-zA-Z]/.test(ch)) {
      return {
        ok: false,
        error: {
          code: 'unknown_variable',
          message: `Variable desconocida '${ch}'. Usá solo la variable 'n'.`,
          pos: i,
        },
      };
    }

    // Operadores y paréntesis
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '(' || ch === ')') {
      // Detección de doble operador como '**' o '//'
      if ((ch === '*' || ch === '/') && s[i + 1] === ch) {
        return {
          ok: false,
          error: {
            code: 'unexpected_token',
            message: `Operador duplicado '${ch}${ch}'.`,
            pos: i,
          },
        };
      }
      tokens.push({ type: ch, pos: i });
      i++;
      continue;
    }

    return {
      ok: false,
      error: {
        code: 'unexpected_token',
        message: `Carácter inesperado: '${ch}'.`,
        pos: i,
      },
    };
  }

  // Detección de dos números separados por espacio (ej. "2 3")
  for (let k = 0; k < tokens.length - 1; k++) {
    const cur = tokens[k];
    const nxt = tokens[k + 1];
    if (cur.type === 'number' && nxt.type === 'number') {
      return {
        ok: false,
        error: {
          code: 'unexpected_token',
          message: `Dos números separados por espacio sin operador ('${cur.raw}' y '${nxt.raw}').`,
          pos: nxt.pos,
        },
      };
    }
  }

  // Inserción de multiplicación implícita
  // Válida únicamente entre: (number | 'var' | ')') seguido de ('var' | '(')
  // o ')' seguido de number.
  const expanded = [];
  for (let k = 0; k < tokens.length; k++) {
    const cur = tokens[k];
    expanded.push(cur);
    if (k < tokens.length - 1) {
      const nxt = tokens[k + 1];
      const leftCanMul = cur.type === 'number' || cur.type === 'var' || cur.type === ')';
      const rightCanMul = nxt.type === 'var' || nxt.type === '(';
      const parenNumberMul = cur.type === ')' && nxt.type === 'number';

      if ((leftCanMul && rightCanMul) || parenNumberMul) {
        // Chequeo de warning para casos como 1/3n o 1/2(n-1)
        if (k >= 2 && tokens[k - 1].type === '/' && cur.type === 'number') {
          warnings.push('Se interpretó como (1/3)·n. Usá paréntesis para evitar ambigüedad.');
        }
        expanded.push({ type: '*', implicit: true, pos: nxt.pos });
      }
    }
  }

  return { ok: true, tokens: expanded, warnings };
}

/**
 * Parser sintáctico según la gramática:
 * sum     := product (('+' | '-') product)*
 * product := unary (('*' | '/') unary)*
 * unary   := ('-' | '+') unary | power
 * power   := atom ('^' unary)?
 * atom    := number | 'var' | '(' sum ')'
 */
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
      throw {
        code: 'unexpected_end',
        message: 'La expresión termina inesperadamente.',
        pos: this.tokens.length ? this.tokens[this.tokens.length - 1].pos : 0,
      };
    }
    if (expectedType && tok.type !== expectedType) {
      throw {
        code: 'unexpected_token',
        message: `Se esperaba '${expectedType}', pero se encontró '${tok.type}'.`,
        pos: tok.pos,
      };
    }
    this.pos++;
    return tok;
  }

  parse() {
    const ast = this.parseSum();
    if (this.pos < this.tokens.length) {
      const tok = this.tokens[this.pos];
      throw {
        code: 'unexpected_token',
        message: `Símbolo no esperado '${tok.raw || tok.type}'.`,
        pos: tok.pos,
      };
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
      // Asociatividad a derecha; acepta exponente unario (ej. 2^-3 o 2^3^2)
      const exp = this.parseUnary();
      return { type: 'power', left: base, right: exp };
    }
    return base;
  }

  parseAtom() {
    const tok = this.peek();
    if (!tok) {
      throw {
        code: 'unexpected_end',
        message: 'La expresión termina inesperadamente.',
        pos: this.tokens.length ? this.tokens[this.tokens.length - 1].pos : 0,
      };
    }

    if (tok.type === 'number') {
      this.consume();
      return { type: 'number', value: tok.value };
    }

    if (tok.type === 'var') {
      this.consume();
      return { type: 'var', name: 'n' };
    }

    if (tok.type === '(') {
      const openPos = tok.pos;
      this.consume('(');
      const inner = this.parseSum();
      const close = this.peek();
      if (!close || close.type !== ')') {
        throw {
          code: 'unclosed_paren',
          message: 'Paréntesis sin cerrar.',
          pos: openPos,
        };
      }
      this.consume(')');
      return { type: 'paren', expr: inner };
    }

    throw {
      code: 'unexpected_token',
      message: `Símbolo inesperado '${tok.raw || tok.type}'.`,
      pos: tok.pos,
    };
  }
}

/**
 * Parsea una cadena de texto en un AST seguro.
 */
export function parse(src) {
  const tokRes = tokenize(src);
  if (!tokRes.ok) return tokRes;

  try {
    const parser = new Parser(tokRes.tokens);
    const ast = parser.parse();
    return { ok: true, ast, warnings: tokRes.warnings };
  } catch (err) {
    if (err && err.code) {
      return { ok: false, error: err };
    }
    return { ok: false, error: { code: 'parse_error', message: String(err.message || err), pos: 0 } };
  }
}

/**
 * Evalúa un AST para un número n dado.
 */
export function evaluate(ast, n) {
  if (!ast) return NaN;

  switch (ast.type) {
    case 'number':
      return ast.value;

    case 'var':
      return n;

    case 'paren':
      return evaluate(ast.expr, n);

    case 'unary': {
      const val = evaluate(ast.expr, n);
      return ast.op === '-' ? -val : val;
    }

    case 'power': {
      const base = evaluate(ast.left, n);
      const exp = evaluate(ast.right, n);
      return Math.pow(base, exp);
    }

    case 'binary': {
      const l = evaluate(ast.left, n);
      const r = evaluate(ast.right, n);
      switch (ast.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return r === 0 ? (l >= 0 ? Infinity : -Infinity) : l / r;
        case '^': return Math.pow(l, r);
        default: return NaN;
      }
    }

    default:
      return NaN;
  }
}

/**
 * Evalúa un AST en un rango entero inclusivo [from, to].
 */
export function evalRange(ast, from = 1, to = 10) {
  const out = [];
  for (let n = from; n <= to; n++) {
    out.push(evaluate(ast, n));
  }
  return out;
}

/**
 * Igualdad aproximada con tolerancia relativa estricta.
 */
const approxEq = (a, b) =>
  Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Comprueba si dos expresiones (ASTs o strings) son matemáticamente equivalentes
 * para todo n en el rango [from, to].
 */
export function equivalent(a, b, { from = 1, to = 10 } = {}) {
  const astA = typeof a === 'string' ? parse(a).ast : a;
  const astB = typeof b === 'string' ? parse(b).ast : b;
  if (!astA || !astB) return false;

  for (let n = from; n <= to; n++) {
    const valA = evaluate(astA, n);
    const valB = evaluate(astB, n);
    if (!approxEq(valA, valB)) return false;
  }
  return true;
}

/**
 * Convierte un AST en una representación legible en texto con '·' y signo U+2212 '−'.
 */
export function toDisplay(ast) {
  if (!ast) return '';

  const formatNum = (v) => {
    if (v < 0) return `${MINUS_CHAR}${Math.abs(v)}`;
    return String(v);
  };

  switch (ast.type) {
    case 'number':
      return formatNum(ast.value);

    case 'var':
      return 'n';

    case 'paren':
      return `(${toDisplay(ast.expr)})`;

    case 'unary': {
      const inner = toDisplay(ast.expr);
      return ast.op === '-' ? `${MINUS_CHAR}${ast.expr.type === 'binary' ? `(${inner})` : inner}` : inner;
    }

    case 'power': {
      const baseStr = ast.left.type === 'paren' || ast.left.type === 'number' || ast.left.type === 'var'
        ? toDisplay(ast.left)
        : `(${toDisplay(ast.left)})`;
      const expStr = ast.right.type === 'paren' || ast.right.type === 'number' || ast.right.type === 'var'
        ? toDisplay(ast.right)
        : `(${toDisplay(ast.right)})`;
      return `${baseStr}^${expStr}`;
    }

    case 'binary': {
      const l = toDisplay(ast.left);
      const r = toDisplay(ast.right);
      const opSymbol = ast.op === '*' ? ' · ' : ast.op === '-' ? ` ${MINUS_CHAR} ` : ` ${ast.op} `;
      return `${l}${opSymbol}${r}`;
    }

    default:
      return '';
  }
}

/**
 * Helper: verifica si un subárbol no contiene la variable 'n'.
 */
export function isConstNode(node) {
  if (!node) return false;
  if (node.type === 'var') return false;
  if (node.type === 'number') return true;
  if (node.type === 'paren') return isConstNode(node.expr);
  if (node.type === 'unary') return isConstNode(node.expr);
  if (node.type === 'power') return isConstNode(node.left) && isConstNode(node.right);
  if (node.type === 'binary') return isConstNode(node.left) && isConstNode(node.right);
  return false;
}

/**
 * Helper: desenvuelve nodos de paréntesis transparentemente.
 */
function unwrapParens(node) {
  let curr = node;
  while (curr && curr.type === 'paren') curr = curr.expr;
  return curr;
}

/**
 * Helper: verifica si un nodo representa exactamente (n - 1).
 */
export function isNMinus1(node) {
  const unwrapped = unwrapParens(node);
  if (!unwrapped || unwrapped.type !== 'binary' || unwrapped.op !== '-') return false;
  const left = unwrapParens(unwrapped.left);
  const right = unwrapParens(unwrapped.right);
  return left?.type === 'var' && right?.type === 'number' && right.value === 1;
}

/**
 * Determina si el AST está escrito en la forma estándar para el kind dado:
 * - 'ari': k + d(n - 1) o k + (n - 1)d o k - d(n - 1) (o k + (n-1) / k - (n-1) con |d|=1)
 * - 'geo': k · r^(n - 1) (o r^(n-1) con k=1, o -r^(n-1) con k=-1)
 */
export function isStandardForm(ast, kind) {
  const root = unwrapParens(ast);
  if (!root) return false;

  if (kind === 'ari') {
    // La raíz debe ser una suma o resta binaria entre constante (k) y d*(n-1)
    if (root.type !== 'binary' || (root.op !== '+' && root.op !== '-')) return false;

    const left = unwrapParens(root.left);
    const right = unwrapParens(root.right);

    // El término izquierdo debe ser una constante k
    if (!isConstNode(left)) return false;

    // El término derecho puede ser directamente (n - 1) cuando |d| = 1
    if (isNMinus1(right)) return true;

    // O un producto entre una constante d y (n - 1) en cualquier orden
    if (right.type === 'binary' && right.op === '*') {
      const f1 = unwrapParens(right.left);
      const f2 = unwrapParens(right.right);
      return (isConstNode(f1) && isNMinus1(f2)) || (isNMinus1(f1) && isConstNode(f2));
    }

    return false;
  }

  if (kind === 'geo') {
    // Caso 1: k * r^(n - 1)
    if (root.type === 'binary' && root.op === '*') {
      const left = unwrapParens(root.left);
      const right = unwrapParens(root.right);

      if (!isConstNode(left)) return false;

      // El factor derecho debe ser una potencia con base constante y exponente (n - 1)
      if (right.type === 'power' || (right.type === 'binary' && right.op === '^')) {
        const base = unwrapParens(right.left);
        const exp = unwrapParens(right.right);
        return isConstNode(base) && isNMinus1(exp);
      }
      return false;
    }

    // Caso 2: Potencia directa con k = 1 implícito: r^(n - 1)
    if (root.type === 'power' || (root.type === 'binary' && root.op === '^')) {
      const base = unwrapParens(root.left);
      const exp = unwrapParens(root.right);
      return isConstNode(base) && isNMinus1(exp);
    }

    // Caso 3: Unario negativo con k = -1 implícito: -r^(n - 1)
    if (root.type === 'unary' && root.op === '-') {
      const inner = unwrapParens(root.expr);
      if (inner.type === 'power' || (inner.type === 'binary' && inner.op === '^')) {
        const base = unwrapParens(inner.left);
        const exp = unwrapParens(inner.right);
        return isConstNode(base) && isNMinus1(exp);
      }
    }

    return false;
  }

  return false;
}
