/**
 * @file js/modules/polinomios/expr.js
 * Reutiliza cuadraticas/expr.js (intervalos, conjuntos, pares ordenados, números)
 * y js/core/math/polynomials.js (parser AST y aritmética racional exacta).
 * Cero duplicación, 100% puro, cero DOM.
 */

export {
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  formatSetExactas,
  normalizeQuadString,
  tokenizeQuad,
  parseQuadTree,
  cleanNumber,
  approxEq,
} from '../cuadraticas/expr.js';

export {
  rat,
  ratFromNumber,
  parseRational,
  ratToNumber,
  ratToString,
  ratEq,
  normalizePolyExprString,
  tokenizePolyExpr,
  parsePolyAst,
  expandAstToExactPoly,
  evalPolyAstNumber,
  parsePolynomialExpr,
  polyEqual,
  formatPoly,
  formatPolyHtml,
} from '../../core/math/polynomials.js';

import {
  tokenizePolyExpr,
  parsePolyAst,
  expandAstToExactPoly,
  evalPolyAstNumber,
  parsePolynomialExpr,
  polyEqual,
  polyDegree,
  factorPolynomial,
} from '../../core/math/polynomials.js';

function isSingleSumOrDiffPoly(ast) {
  if (!ast) return true;
  if (ast.type === 'number' || ast.type === 'variable' || ast.type === 'func') return true;
  if (ast.type === 'unary') return isSingleSumOrDiffPoly(ast.arg);
  if (ast.type === 'binary') {
    if (ast.op === '+' || ast.op === '-') {
      return isSingleSumOrDiffPoly(ast.left) && isSingleSumOrDiffPoly(ast.right);
    }
    if (ast.op === '*') {
      // Allow coeff * x^k or coeff * x, not (x-1)*(x+1)
      const isMonoPart = (node) => {
        if (!node) return false;
        if (node.type === 'number' || node.type === 'variable' || node.type === 'func') return true;
        if (node.type === 'unary') return isMonoPart(node.arg);
        if (node.type === 'binary' && (node.op === '^' || node.op === '/')) {
          return isMonoPart(node.left) && isMonoPart(node.right);
        }
        return false;
      };
      return isMonoPart(ast.left) && isMonoPart(ast.right);
    }
    return true;
  }
  return false;
}

function collectMulFactors(ast, out = []) {
  if (!ast) return out;
  if (ast.type === 'unary' && ast.op === '-') {
    collectMulFactors(ast.arg, out);
    return out;
  }
  if (ast.type === 'binary' && ast.op === '*') {
    collectMulFactors(ast.left, out);
    collectMulFactors(ast.right, out);
    return out;
  }
  if (ast.type === 'binary' && ast.op === '^') {
    collectMulFactors(ast.left, out);
    return out;
  }
  out.push(ast);
  return out;
}

function trimFloatPoly(coeffs) {
  const out = coeffs.slice();
  while (out.length > 0 && Math.abs(out[out.length - 1]) <= 1e-12) {
    out.pop();
  }
  return out;
}

function addFloatPoly(a, b, sign = 1) {
  const len = Math.max(a.length, b.length);
  const out = new Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    out[i] = (a[i] || 0) + sign * (b[i] || 0);
  }
  return trimFloatPoly(out);
}

function mulFloatPoly(a, b) {
  if (a.length === 0 || b.length === 0) return [];
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] += a[i] * b[j];
    }
  }
  return trimFloatPoly(out);
}

function expandAstToFloatPoly(node) {
  if (!node) return [];
  if (node.type === 'number') return trimFloatPoly([node.value]);
  if (node.type === 'variable') return [0, 1];
  if (node.type === 'unary') return expandAstToFloatPoly(node.arg).map((c) => -c);
  if (node.type === 'func') {
    if (node.name === 'sqrt') {
      const inner = expandAstToFloatPoly(node.arg);
      if (inner.length > 1) throw new SyntaxError('Variable dentro de raíz.');
      const val = inner[0] || 0;
      if (val < 0) throw new SyntaxError('Radicando negativo.');
      return trimFloatPoly([Math.sqrt(val)]);
    }
    throw new SyntaxError('Función no soportada.');
  }
  if (node.type === 'binary') {
    const l = expandAstToFloatPoly(node.left);
    const r = expandAstToFloatPoly(node.right);
    if (node.op === '+') return addFloatPoly(l, r, 1);
    if (node.op === '-') return addFloatPoly(l, r, -1);
    if (node.op === '*') return mulFloatPoly(l, r);
    if (node.op === '/') {
      if (r.length !== 1 || Math.abs(r[0]) <= 1e-12) throw new SyntaxError('Divisor inválido.');
      return trimFloatPoly(l.map((c) => c / r[0]));
    }
    if (node.op === '^') {
      if (r.length > 1) throw new SyntaxError('Exponente variable.');
      const exp = Math.round(r[0] || 0);
      if (exp < 0 || Math.abs((r[0] || 0) - exp) > 1e-9) throw new SyntaxError('Exponente inválido.');
      let acc = [1];
      for (let i = 0; i < exp; i++) acc = mulFloatPoly(acc, l);
      return acc;
    }
  }
  throw new SyntaxError('Nodo AST no soportado.');
}

/**
 * Checks whether a polynomial factor AST is irreducible over R (constant, deg 1, or deg 2 with Δ < 0).
 */
function isPrimeFactorAstOverReals(factorAst) {
  if (!factorAst) return false;
  if (factorAst.type === 'number' || factorAst.type === 'variable') return true;
  try {
    const coeffs = expandAstToExactPoly(factorAst);
    const deg = polyDegree(coeffs);
    if (deg === null || deg <= 1) return true;
    if (deg === 2) {
      const fac = factorPolynomial(coeffs);
      return fac.irreducibleQuadratics.length === 1 && fac.linearFactors.length === 0;
    }
    return false;
  } catch (err) {
    if (err && err.code === 'irrational_constant') {
      try {
        const coeffs = expandAstToFloatPoly(factorAst);
        const deg = coeffs.length - 1;
        if (deg <= 1) return true;
        if (deg === 2) {
          const [c, b, a] = coeffs;
          const disc = b * b - 4 * a * c;
          const scale = Math.max(1, b * b, Math.abs(4 * a * c));
          return disc < -1e-9 * scale;
        }
        return false;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Classifies surface form of a polynomial AST ('factored' | 'incomplete_factorization' | 'expanded' | 'mixed').
 */
export function classifyPolySurfaceForm(ast) {
  if (!ast) return { form: 'mixed', isFactored: false, isExpanded: false };
  const isExp = isSingleSumOrDiffPoly(ast);

  // Check top-level multiplicative form; a top-level unary '-' around a parenthesized group
  // (e.g. -(x - 1) or -(x^2 + 1)) acts as leading factor -1, whereas -x + 1 is a binary sum.
  const isUnaryNeg = ast.type === 'unary' && ast.op === '-';
  const unwrapped = isUnaryNeg ? ast.arg : ast;
  const isNegatedGroup =
    isUnaryNeg &&
    (unwrapped.type !== 'binary' ||
      unwrapped.op === '*' ||
      unwrapped.op === '^' ||
      isSingleSumOrDiffPoly(unwrapped));
  const topIsSum =
    !isNegatedGroup &&
    unwrapped.type === 'binary' &&
    (unwrapped.op === '+' || unwrapped.op === '-');

  const factors = collectMulFactors(ast);
  const hasMultipleOrPowerFactors =
    (unwrapped.type === 'binary' && (unwrapped.op === '*' || unwrapped.op === '^')) ||
    factors.length === 1;

  if (!topIsSum && hasMultipleOrPowerFactors) {
    const allPrime = factors.every((f) => isPrimeFactorAstOverReals(f));
    if (allPrime) {
      return { form: 'factored', isFactored: true, isExpanded: isExp };
    }
    return { form: 'incomplete_factorization', isFactored: false, isExpanded: false };
  }

  if (isExp) {
    return { form: 'expanded', isFactored: false, isExpanded: true };
  }
  return { form: 'mixed', isFactored: false, isExpanded: false };
}

const SAMPLE_PROBES = [-3.7, -2.3, -1.5, -0.7, -0.2, 0.1, 0.6, 1.3, 2.1, 3.4, 4.9, 6.2];

function validateAstPolynomialStructure(ast) {
  if (!ast) return;
  if (ast.type === 'func') {
    if (ast.name === 'sqrt') {
      const hasVar = (n) => {
        if (!n) return false;
        if (n.type === 'variable') return true;
        if (n.type === 'unary' || n.type === 'func') return hasVar(n.arg);
        if (n.type === 'binary') return hasVar(n.left) || hasVar(n.right);
        return false;
      };
      if (hasVar(ast.arg)) {
        const err = new SyntaxError('No es un polinomio: la variable aparece dentro de una raíz.');
        err.code = 'radical_on_variable';
        throw err;
      }
      if (evalPolyAstNumber(ast.arg, 0) < 0) {
        const err = new SyntaxError('Raíz cuadrada de un número negativo en ℝ.');
        err.code = 'negative_radicand';
        throw err;
      }
    }
  } else if (ast.type === 'unary') {
    validateAstPolynomialStructure(ast.arg);
  } else if (ast.type === 'binary') {
    validateAstPolynomialStructure(ast.left);
    validateAstPolynomialStructure(ast.right);
    if (ast.op === '/') {
      const denVals = SAMPLE_PROBES.map((x) => evalPolyAstNumber(ast.right, x));
      const allEqual = denVals.every((v) => Math.abs(v - denVals[0]) < 1e-9);
      if (!allEqual) {
        const err = new SyntaxError('No es un polinomio: la variable aparece en el denominador.');
        err.code = 'rational_expression';
        throw err;
      }
      if (Math.abs(denVals[0]) < 1e-12) {
        const err = new SyntaxError('División por cero.');
        err.code = 'division_by_zero';
        throw err;
      }
    } else if (ast.op === '^') {
      const expVal = evalPolyAstNumber(ast.right, 0);
      const expVal2 = evalPolyAstNumber(ast.right, 3.1);
      if (Math.abs(expVal - expVal2) > 1e-9) {
        const err = new SyntaxError('No es un polinomio: exponente variable.');
        err.code = 'variable_exponent';
        throw err;
      }
      if (!Number.isInteger(Math.round(expVal)) || Math.abs(expVal - Math.round(expVal)) > 1e-9) {
        const err = new SyntaxError('No es un polinomio: exponente fraccionario.');
        err.code = 'fractional_exponent';
        throw err;
      }
      if (Math.round(expVal) < 0) {
        const err = new SyntaxError('No es un polinomio: exponente negativo.');
        err.code = 'negative_exponent';
        throw err;
      }
    }
  }
}

/**
 * Checks exact algebraic equivalence between two polynomial strings (with irrational-constant
 * fallback via multi-point AST evaluation) and optionally enforces surface form ('factored' | 'expanded').
 */
export function equivalentPolyExpr(inputA, inputB, requireForm = null) {
  let astA;
  let astB;
  try {
    astA = parsePolyAst(tokenizePolyExpr(inputA));
    validateAstPolynomialStructure(astA);
  } catch (err) {
    return {
      status: 'syntax_error',
      equivalent: false,
      sameForm: false,
      incompleteFactorization: false,
      error: err.message,
      errorCode: err.code || 'syntax_error',
    };
  }
  try {
    astB = parsePolyAst(tokenizePolyExpr(inputB));
    validateAstPolynomialStructure(astB);
  } catch (err) {
    return {
      status: 'syntax_error',
      equivalent: false,
      sameForm: false,
      incompleteFactorization: false,
      error: err.message,
      errorCode: err.code || 'syntax_error',
    };
  }

  let equivalent = false;
  let parsedA = null;
  let parsedB = null;

  try {
    parsedA = parsePolynomialExpr(inputA);
    parsedB = parsePolynomialExpr(inputB);
    equivalent = polyEqual(parsedA.coeffs, parsedB.coeffs);
  } catch (err) {
    if (err && err.code === 'irrational_constant') {
      // Exact numeric verification at 12 non-integer probes
      equivalent = SAMPLE_PROBES.every((x) => {
        const va = evalPolyAstNumber(astA, x);
        const vb = evalPolyAstNumber(astB, x);
        if (!Number.isFinite(va) || !Number.isFinite(vb)) return false;
        return Math.abs(va - vb) <= 1e-6 * Math.max(1, Math.abs(va), Math.abs(vb));
      });
    } else {
      return {
        status: 'syntax_error',
        equivalent: false,
        sameForm: false,
        incompleteFactorization: false,
        error: err.message,
        errorCode: err.code || 'syntax_error',
      };
    }
  }

  const surfA = classifyPolySurfaceForm(astA);
  let sameForm = true;
  let incompleteFactorization = false;
  if (requireForm === 'factored') {
    sameForm = surfA.isFactored;
    incompleteFactorization = equivalent && surfA.form === 'incomplete_factorization';
  } else if (requireForm === 'expanded') {
    sameForm = surfA.isExpanded;
  }

  return {
    status: 'ok',
    equivalent,
    sameForm,
    incompleteFactorization,
    surfaceForm: surfA.form,
    parsedA,
    parsedB,
  };
}
