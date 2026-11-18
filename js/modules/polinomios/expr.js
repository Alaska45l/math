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
      // e.g., (x - sqrt(7)) is a linear binomial over R; check by testing if factor has degree 1 numerically
      // Only allow linear/constant irrational factors: inspect variable occurrences outside sqrt
      const checkVars = (node) => {
        if (!node) return 0;
        if (node.type === 'variable') return 1;
        if (node.type === 'unary') return checkVars(node.arg);
        if (node.type === 'func') return 0;
        if (node.type === 'binary') {
          if (node.op === '+' || node.op === '-') return Math.max(checkVars(node.left), checkVars(node.right));
          if (node.op === '*') return checkVars(node.left) + checkVars(node.right);
          if (node.op === '/') return checkVars(node.left);
          if (node.op === '^') return checkVars(node.left) * (node.right?.value ?? 1);
        }
        return 0;
      };
      return checkVars(factorAst) <= 1;
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

  // Check top-level multiplicative form (not a top-level + or - unless inside parentheses)
  const unwrapped = ast.type === 'unary' ? ast.arg : ast;
  const topIsSum = unwrapped.type === 'binary' && (unwrapped.op === '+' || unwrapped.op === '-');

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
