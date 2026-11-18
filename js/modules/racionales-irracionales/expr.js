/**
 * @file js/modules/racionales-irracionales/expr.js
 * Pure parsers and equivalence validators for Unit 07 (Racionales e Irracionales).
 * Reuses polynomials.js, cuadraticas/expr.js, and potencias-raices/expr.js with zero duplication.
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

import {
  rat,
  ratFromNumber,
  ratNeg,
  ratInv,
  ratEq,
  isIntRat,
  normalizePoly,
  isZeroPoly,
  polyDegree,
  polyEqual,
  polyNeg,
  polyScale,
  polyAdd,
  polySub,
  polyMul,
  polyPow,
  polyGcd,
  polyDiv,
  factorPolynomial,
  tokenizePolyExpr,
  parsePolyAst,
  formatPoly,
} from '../../core/math/polynomials.js';

import {
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  formatSetExactas,
  approxEq,
  cleanNumber,
} from '../cuadraticas/expr.js';

import {
  parsePowRad,
  evalPowRad,
  simplifyRadical,
} from '../potencias-raices/expr.js';

export {
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  formatSetExactas,
  approxEq,
  cleanNumber,
  parsePowRad,
  evalPowRad,
  simplifyRadical,
};

const SUPERSCRIPT_MAP = Object.freeze({
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ˣ': 'x', 'ᵗ': 't', 'ᵘ': 'u', 'ⁿ': 'n',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')',
});

function typedError(Ctor, message, code, pos = 0) {
  const err = new Ctor(message);
  err.code = code;
  err.pos = pos;
  return err;
}

function collectAstVars(ast, set = new Set()) {
  if (!ast || typeof ast !== 'object') return set;
  if (ast.type === 'variable') set.add(ast.name);
  else if (ast.type === 'unary' || ast.type === 'func') collectAstVars(ast.arg, set);
  else if (ast.type === 'binary') {
    collectAstVars(ast.left, set);
    collectAstVars(ast.right, set);
  }
  return set;
}

function extractDistinctRealRoots(polys) {
  const roots = [];
  for (const poly of polys) {
    const norm = normalizePoly(poly);
    if (norm.length <= 1) continue;
    const fac = factorPolynomial(norm);
    for (const rr of fac.realRoots) {
      if (!roots.some((existing) => Math.abs(existing.value - rr.value) <= 1e-8)) {
        roots.push({
          value: cleanNumber(rr.value, 10),
          exact: rr.exact,
          rootType: rr.rootType,
          rational: rr.rational || null,
          radical: rr.radical || null,
        });
      }
    }
  }
  roots.sort((a, b) => a.value - b.value);
  return roots;
}

function evalRationalAst(ast) {
  if (!ast) throw typedError(SyntaxError, 'Expresión vacía.', 'empty');

  if (ast.type === 'number') {
    return {
      num: normalizePoly([ratFromNumber(ast.raw ?? ast.value)]),
      den: Object.freeze([rat(1)]),
      denoms: [],
    };
  }

  if (ast.type === 'variable') {
    return {
      num: Object.freeze([rat(0), rat(1)]),
      den: Object.freeze([rat(1)]),
      denoms: [],
    };
  }

  if (ast.type === 'unary') {
    const inner = evalRationalAst(ast.arg);
    return {
      num: polyNeg(inner.num),
      den: inner.den,
      denoms: inner.denoms,
    };
  }

  if (ast.type === 'func') {
    if (ast.name === 'sqrt') {
      const innerVars = collectAstVars(ast.arg);
      if (innerVars.size > 0) {
        throw typedError(
          SyntaxError,
          'Expresión irracional: la variable aparece dentro de una raíz.',
          'radical_on_variable',
          ast.pos
        );
      }
      const inner = evalRationalAst(ast.arg);
      if (inner.num.length > 1 || inner.den.length > 1) {
        throw typedError(SyntaxError, 'Raíz inválida sobre variable.', 'radical_on_variable', ast.pos);
      }
      const valNum = inner.num.length ? inner.num[0] : rat(0);
      const valDen = inner.den[0];
      if (valNum.n < 0) {
        throw typedError(SyntaxError, 'Raíz cuadrada de un número negativo en ℝ.', 'negative_radicand', ast.pos);
      }
      const rn = Math.round(Math.sqrt(valNum.n));
      const rd = Math.round(Math.sqrt(valNum.d * valDen.n));
      const sn = Math.round(Math.sqrt(valDen.d));
      if (rn * rn === valNum.n && rd * rd === valNum.d * valDen.n && sn * sn === valDen.d) {
        return {
          num: normalizePoly([rat(rn * sn, rd)]),
          den: Object.freeze([rat(1)]),
          denoms: inner.denoms,
        };
      }
      throw typedError(SyntaxError, 'Raíz irracional no exacta en expresión racional.', 'irrational_constant', ast.pos);
    }
    throw typedError(SyntaxError, 'Función no permitida en expresión racional.', 'unsupported_func', ast.pos);
  }

  if (ast.type === 'binary') {
    if (ast.op === '+' || ast.op === '-') {
      const L = evalRationalAst(ast.left);
      const R = evalRationalAst(ast.right);
      const denoms = [...L.denoms, ...R.denoms];
      if (polyEqual(L.den, R.den)) {
        return {
          num: ast.op === '+' ? polyAdd(L.num, R.num) : polySub(L.num, R.num),
          den: L.den,
          denoms,
        };
      }
      const leftScaled = polyMul(L.num, R.den);
      const rightScaled = polyMul(R.num, L.den);
      const num = ast.op === '+' ? polyAdd(leftScaled, rightScaled) : polySub(leftScaled, rightScaled);
      const den = polyMul(L.den, R.den);
      return { num, den, denoms };
    }

    if (ast.op === '*') {
      const L = evalRationalAst(ast.left);
      const R = evalRationalAst(ast.right);
      return {
        num: polyMul(L.num, R.num),
        den: polyMul(L.den, R.den),
        denoms: [...L.denoms, ...R.denoms],
      };
    }

    if (ast.op === '/') {
      const L = evalRationalAst(ast.left);
      const R = evalRationalAst(ast.right);
      if (isZeroPoly(R.num)) {
        throw typedError(
          SyntaxError,
          'El denominador de la expresión racional no puede ser el polinomio nulo.',
          'zero_denominator_polynomial',
          ast.pos
        );
      }
      // Track R.num as a denominator polynomial too (for nested division (P/Q)/(R/S))
      return {
        num: polyMul(L.num, R.den),
        den: polyMul(L.den, R.num),
        denoms: [...L.denoms, ...R.denoms, R.den, R.num],
      };
    }

    if (ast.op === '^') {
      const expVars = collectAstVars(ast.right);
      if (expVars.size > 0) {
        throw typedError(
          SyntaxError,
          'No es una expresión racional: la variable aparece en el exponente.',
          'variable_exponent',
          ast.pos
        );
      }
      const expRes = evalRationalAst(ast.right);
      if (expRes.num.length > 1 || expRes.den.length > 1) {
        throw typedError(SyntaxError, 'Exponente inválido.', 'invalid_exponent', ast.pos);
      }
      const nRat = expRes.num.length ? expRes.num[0] : rat(0);
      const dRat = expRes.den[0];
      const expRat = rat(nRat.n * dRat.d, nRat.d * dRat.n);
      if (!isIntRat(expRat)) {
        throw typedError(SyntaxError, 'No es una expresión racional: exponente fraccionario.', 'fractional_exponent', ast.pos);
      }
      if (Math.abs(expRat.n) > 12) {
        throw typedError(SyntaxError, 'El exponente excede el límite permitido (12).', 'exponent_too_large', ast.pos);
      }
      const base = evalRationalAst(ast.left);
      if (expRat.n === 0) {
        return {
          num: Object.freeze([rat(1)]),
          den: Object.freeze([rat(1)]),
          denoms: [...base.denoms, base.den],
        };
      }
      if (expRat.n < 0) {
        if (isZeroPoly(base.num)) {
          throw typedError(
            SyntaxError,
            'División por el polinomio nulo en exponente negativo.',
            'zero_denominator_polynomial',
            ast.pos
          );
        }
        const k = -expRat.n;
        return {
          num: polyPow(base.den, k),
          den: polyPow(base.num, k),
          denoms: [...base.denoms, base.den, base.num],
        };
      }
      return {
        num: polyPow(base.num, expRat.n),
        den: polyPow(base.den, expRat.n),
        denoms: base.denoms,
      };
    }
  }

  throw typedError(SyntaxError, 'Operación no soportada en expresiones racionales.', 'unsupported_op');
}

function normalizeRationalInput(input) {
  if (typeof input !== 'string') return '';
  let s = input.trim();
  s = s.replace(/^\s*(?:[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)|[yY])\s*=\s*/i, '');
  return s;
}

/**
 * Parses a rational expression P(x)/Q(x) (or algebraic combination of rational terms)
 * into exact ascending Rational[] numerator and denominator, tracking original domain exclusions.
 */
export function parseRationalExpr(input, { variable = 'x' } = {}) {
  const cleaned = normalizeRationalInput(input);
  if (!cleaned) {
    throw typedError(SyntaxError, 'Ingresá una expresión racional.', 'empty');
  }
  const tokens = tokenizePolyExpr(cleaned);
  const ast = parsePolyAst(tokens);
  const vars = collectAstVars(ast);

  if (vars.size > 1) {
    throw typedError(
      SyntaxError,
      `Se esperaba una expresión en una sola variable, pero aparecieron: ${Array.from(vars).join(', ')}.`,
      'unexpected_variable'
    );
  }
  const detectedVar = vars.size === 1 ? Array.from(vars)[0] : variable;
  const evaluated = evalRationalAst(ast);

  if (isZeroPoly(evaluated.den)) {
    throw typedError(
      SyntaxError,
      'El denominador de una expresión racional no puede ser el polinomio nulo.',
      'zero_denominator_polynomial'
    );
  }

  // Normalize sign / leading coefficient of denominator when convenient (keep exact ratio)
  const denLc = evaluated.den[evaluated.den.length - 1];
  let numerator = evaluated.num;
  let denominator = evaluated.den;
  if (denLc.n < 0) {
    numerator = polyNeg(numerator);
    denominator = polyNeg(denominator);
  }

  const allDenoms = [...evaluated.denoms, denominator];
  const originalExclusions = extractDistinctRealRoots(allDenoms);

  return {
    ok: true,
    numerator,
    denominator,
    originalExclusions,
    allDenominators: allDenoms,
    variable: detectedVar,
    raw: String(input).trim(),
  };
}

/**
 * Checks mathematical equivalence of two rational expressions, optionally enforcing
 * identical domain exclusions (requireSameDomain) and coprime reduced form (requireSimplified).
 */
export function equivalentRationalExpr(
  inputA,
  inputB,
  { requireSameDomain = true, requireSimplified = false } = {}
) {
  try {
    const A = typeof inputA === 'string' ? parseRationalExpr(inputA) : inputA;
    const B = typeof inputB === 'string' ? parseRationalExpr(inputB) : inputB;

    const algebraicallyEqual = polyEqual(
      polyMul(A.numerator, B.denominator),
      polyMul(B.numerator, A.denominator)
    );

    if (!algebraicallyEqual) {
      return {
        equivalent: false,
        algebraicallyEqual: false,
        sameDomain: false,
        simplified: false,
        status: 'not_equivalent',
        parsedA: A,
        parsedB: B,
      };
    }

    const exclA = A.originalExclusions || [];
    const exclB = B.originalExclusions || [];
    const sameDomain =
      exclA.length === exclB.length &&
      exclA.every((rA, idx) => Math.abs(rA.value - exclB[idx].value) <= 1e-7);

    if (requireSameDomain && !sameDomain) {
      return {
        equivalent: false,
        algebraicallyEqual: true,
        sameDomain: false,
        simplified: (polyDegree(polyGcd(A.numerator, A.denominator)) ?? 0) === 0,
        status: 'domain_mismatch',
        parsedA: A,
        parsedB: B,
      };
    }

    const gcdA = polyGcd(A.numerator, A.denominator);
    const isSimplified = (polyDegree(gcdA) ?? 0) === 0;
    if (requireSimplified && !isSimplified) {
      return {
        equivalent: false,
        algebraicallyEqual: true,
        sameDomain,
        simplified: false,
        status: 'unsimplified_rational',
        gcd: gcdA,
        parsedA: A,
        parsedB: B,
      };
    }

    return {
      equivalent: true,
      algebraicallyEqual: true,
      sameDomain,
      simplified: isSimplified,
      status: 'exact_match',
      parsedA: A,
      parsedB: B,
    };
  } catch (err) {
    return {
      equivalent: false,
      algebraicallyEqual: false,
      sameDomain: false,
      simplified: false,
      status: 'syntax_error',
      code: err.code || 'syntax_error',
      error: err.message,
    };
  }
}

/* ============================================================================
 * Irrational / Radical Expression Parser & Equivalence
 * ========================================================================== */

function normalizeIrrationalSource(input) {
  if (typeof input !== 'string') return '';
  let s = input.trim();
  s = s.replace(/^\s*(?:[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)|[yY])\s*=\s*/i, '');
  s = s.replace(/[\u2212\u2013\u2014]/g, '-');
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ˣᵗᵘⁿ⁺⁻⁽⁾]+/g, (match) => {
    const converted = Array.from(match).map((c) => SUPERSCRIPT_MAP[c] || c).join('');
    return `^(${converted})`;
  });
  return s;
}

function evalConstAst(ast) {
  if (!ast) return null;
  if (ast.type === 'number') return ast.value;
  if (ast.type === 'neg') {
    const v = evalConstAst(ast.value);
    return v === null ? null : -v;
  }
  if (ast.type === 'binary') {
    const l = evalConstAst(ast.left);
    const r = evalConstAst(ast.right);
    if (l === null || r === null) return null;
    if (ast.op === '+') return l + r;
    if (ast.op === '-') return l - r;
    if (ast.op === '*') return l * r;
    if (ast.op === '/') return r === 0 ? null : l / r;
  }
  return null;
}

function extractLinearOrQuadCoeffsFromPowRad(node, variable = 'x') {
  if (!node) return null;
  if (node.type === 'number') return [node.value];
  if (node.type === 'variable') {
    return node.name === variable ? [0, 1] : null;
  }
  if (node.type === 'neg') {
    const inner = extractLinearOrQuadCoeffsFromPowRad(node.value, variable);
    return inner ? inner.map((c) => -c) : null;
  }
  if (node.type === 'pow') {
    const expVal = evalConstAst(node.exponent);
    if (!Number.isInteger(expVal) || expVal < 0 || expVal > 2) return null;
    if (expVal === 0) return [1];
    const base = extractLinearOrQuadCoeffsFromPowRad(node.base, variable);
    if (!base) return null;
    if (expVal === 1) return base;
    // square
    if (base.length > 2) return null;
    const b0 = base[0] || 0;
    const b1 = base[1] || 0;
    return [b0 * b0, 2 * b0 * b1, b1 * b1];
  }
  if (node.type === 'binary') {
    const L = extractLinearOrQuadCoeffsFromPowRad(node.left, variable);
    const R = extractLinearOrQuadCoeffsFromPowRad(node.right, variable);
    if (!L || !R) return null;
    const len = Math.max(L.length, R.length);
    if (node.op === '+' || node.op === '-') {
      const out = [];
      for (let i = 0; i < len; i++) {
        const lv = L[i] || 0;
        const rv = R[i] || 0;
        out.push(node.op === '+' ? lv + rv : lv - rv);
      }
      return out;
    }
    if (node.op === '*') {
      if (L.length - 1 + (R.length - 1) > 2) return null;
      const out = Array(L.length + R.length - 1).fill(0);
      for (let i = 0; i < L.length; i++) {
        for (let j = 0; j < R.length; j++) out[i + j] += L[i] * R[j];
      }
      return out;
    }
    if (node.op === '/' && R.length === 1 && R[0] !== 0) {
      return L.map((c) => c / R[0]);
    }
  }
  return null;
}

function inspectRadicalStructure(ast, variable = 'x') {
  const findFirstRoot = (n, inDenom = false) => {
    if (!n) return null;
    if (n.type === 'root') {
      const idx = evalConstAst(n.index);
      return {
        index: Number.isInteger(idx) ? idx : 2,
        radicandAst: n.radicand,
        inDenominator: inDenom,
      };
    }
    if (n.type === 'neg' || n.type === 'abs') return findFirstRoot(n.value, inDenom);
    if (n.type === 'pow') return findFirstRoot(n.base, inDenom);
    if (n.type === 'binary') {
      if (n.op === '/') {
        return findFirstRoot(n.left, inDenom) || findFirstRoot(n.right, true);
      }
      return findFirstRoot(n.left, inDenom) || findFirstRoot(n.right, inDenom);
    }
    return null;
  };

  const rootInfo = findFirstRoot(ast, false);
  if (!rootInfo) {
    return { hasRadical: false, index: null, k: null, c: null, radicandCoeffs: null, inDenominator: false };
  }

  const radicandCoeffs = extractLinearOrQuadCoeffsFromPowRad(rootInfo.radicandAst, variable);

  // Also try extracting c + k * root_n(g(x))
  let k = 1;
  let c = 0;
  const matchScaledRoot = (node) => {
    if (node.type === 'root') return 1;
    if (node.type === 'neg') {
      const inner = matchScaledRoot(node.value);
      return inner === null ? null : -inner;
    }
    if (node.type === 'binary' && node.op === '*') {
      const lc = evalConstAst(node.left);
      const rc = evalConstAst(node.right);
      if (lc !== null) {
        const r = matchScaledRoot(node.right);
        return r === null ? null : lc * r;
      }
      if (rc !== null) {
        const l = matchScaledRoot(node.left);
        return l === null ? null : rc * l;
      }
    }
    return null;
  };

  if (ast.type === 'binary' && (ast.op === '+' || ast.op === '-')) {
    const lc = evalConstAst(ast.left);
    const rc = evalConstAst(ast.right);
    if (lc !== null) {
      const rk = matchScaledRoot(ast.right);
      if (rk !== null) {
        c = lc;
        k = ast.op === '+' ? rk : -rk;
      }
    } else if (rc !== null) {
      const lk = matchScaledRoot(ast.left);
      if (lk !== null) {
        c = ast.op === '+' ? rc : -rc;
        k = lk;
      }
    }
  } else {
    const sk = matchScaledRoot(ast);
    if (sk !== null) {
      k = sk;
      c = 0;
    }
  }

  return {
    hasRadical: true,
    index: rootInfo.index,
    k: cleanNumber(k, 10),
    c: cleanNumber(c, 10),
    radicandCoeffs,
    inDenominator: rootInfo.inDenominator,
  };
}

/**
 * Parses an irrational / radical expression wrapping potencias-raices/expr.js.
 */
export function parseIrrationalExpr(input, { variable = 'x' } = {}) {
  const normalized = normalizeIrrationalSource(input);
  if (!normalized) {
    throw typedError(SyntaxError, 'Ingresá una expresión irracional.', 'empty');
  }
  const ast = parsePowRad(normalized);
  const structure = inspectRadicalStructure(ast, variable);
  return {
    ok: true,
    variable,
    raw: String(input).trim(),
    normalized,
    ast,
    ...structure,
  };
}

/**
 * Safely evaluates a parsed irrational expression at a real x.
 */
export function evalIrrationalAt(parsed, x) {
  const p = typeof parsed === 'string' ? parseIrrationalExpr(parsed) : parsed;
  const vName = p.variable || 'x';
  const res = evalPowRad(p.ast, { [vName]: x });
  if (res.domainError || !Number.isFinite(res.value)) {
    return {
      defined: false,
      value: null,
      reason: res.errorReason || 'undefined',
    };
  }
  return {
    defined: true,
    value: cleanNumber(res.value, 10),
    reason: null,
  };
}

/**
 * Compares two irrational expressions across dense domain + boundary probes (zero eval).
 */
export function equivalentIrrationalExpr(inputA, inputB) {
  try {
    const pA = typeof inputA === 'string' ? parseIrrationalExpr(inputA) : inputA;
    const pB = typeof inputB === 'string' ? parseIrrationalExpr(inputB) : inputB;

    const samples = [];
    for (let x = -15; x <= 15; x += 0.5) samples.push(x);
    [-10, -5, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4, 5, 7, 10, 12, 20].forEach((x) => {
      if (!samples.includes(x)) samples.push(x);
    });

    let definedCount = 0;
    for (const x of samples) {
      const rA = evalIrrationalAt(pA, x);
      const rB = evalIrrationalAt(pB, x);
      if (rA.defined !== rB.defined) {
        return { equivalent: false, reason: 'domain_mismatch', atX: x };
      }
      if (rA.defined) {
        definedCount += 1;
        if (!approxEq(rA.value, rB.value, 1e-6)) {
          return { equivalent: false, reason: 'value_mismatch', atX: x };
        }
      }
    }

    if (definedCount === 0) {
      return { equivalent: false, reason: 'empty_domain' };
    }
    return { equivalent: true, reason: 'exact_match', definedSamples: definedCount };
  } catch (err) {
    return { equivalent: false, reason: 'syntax_error', error: err.message };
  }
}

/**
 * Parses an asymptote equation such as "x = -5", "y = 2", "y = -1/2", or "no tiene" / "ninguna".
 */
export function parseAsymptoteEq(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw typedError(SyntaxError, 'Ingresá la ecuación de la asíntota (ej: x = 2, y = −1 o "no tiene").', 'empty');
  }
  const s = input.trim().replace(/[\u2212\u2013\u2014]/g, '-').toLowerCase();
  if (['no tiene', 'ninguna', 'no hay', 'no', 'ninguno', 'sin asintota', 'sin asíntota', '∅', 'vacio', 'vacío'].includes(s)) {
    return { ok: true, kind: 'none', value: null };
  }

  const m = s.match(/^(x|y)\s*=\s*(.+)$/);
  if (!m) {
    throw typedError(
      SyntaxError,
      'Escribí la ecuación de la recta completa: "x = valor" para A.V., "y = valor" para A.H. o "no tiene".',
      'invalid_asymptote_format'
    );
  }
  const axis = m[1];
  const val = parseNumberOrFraction(m[2].trim());
  return {
    ok: true,
    kind: axis === 'x' ? 'vertical' : 'horizontal',
    value: cleanNumber(val, 10),
  };
}

export {
  formatPoly,
  polyEqual,
  polyGcd,
  polyDiv,
  polyDegree,
  normalizePoly,
  isZeroPoly,
};
