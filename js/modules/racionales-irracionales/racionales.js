/**
 * @file js/modules/racionales-irracionales/racionales.js
 * Submodule 1: Pure Exact Rational Expressions, Operations, Equations, Inequalities,
 * Multiplicity Classification (Holes vs Vertical Asymptotes) & Horizontal Asymptotes.
 * Consumes js/core/math/polynomials.js with zero duplication.
 *
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

import {
  rat,
  ratFromNumber,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratEq,
  ratToNumber,
  ratToString,
  normalizePoly,
  isZeroPoly,
  polyDegree,
  leadingCoeff,
  polyEqual,
  polyMonic,
  polyScale,
  polyAdd,
  polySub,
  polyMul,
  polyDiv,
  evalPoly,
  evalPolyNumber,
  factorPolynomial,
  polyGcd,
  polyLcm,
  polyLcmMany,
  formatPoly,
  MINUS_CHAR,
} from '../../core/math/polynomials.js';

import {
  parseRationalExpr,
  formatSetExactas,
  cleanNumber,
  approxEq,
} from './expr.js';

function coerceRationalPair(spec) {
  if (typeof spec === 'string') {
    const parsed = parseRationalExpr(spec);
    return {
      P: parsed.numerator,
      Q: parsed.denominator,
      allDenominators: parsed.allDenominators,
    };
  }
  if (spec && typeof spec === 'object') {
    if (Array.isArray(spec.numerator) && Array.isArray(spec.denominator)) {
      return {
        P: normalizePoly(spec.numerator),
        Q: normalizePoly(spec.denominator),
        allDenominators: spec.allDenominators || [normalizePoly(spec.denominator)],
      };
    }
    if ('P' in spec && 'Q' in spec) {
      return {
        P: normalizePoly(spec.P),
        Q: normalizePoly(spec.Q),
        allDenominators: [normalizePoly(spec.Q)],
      };
    }
    if (Array.isArray(spec)) {
      return {
        P: normalizePoly(spec),
        Q: Object.freeze([rat(1)]),
        allDenominators: [Object.freeze([rat(1)])],
      };
    }
  }
  throw new TypeError('Se esperaba una expresión racional { P, Q } o string.');
}

function rootsMatch(r1, r2) {
  if (r1.rootType === 'rational' && r2.rootType === 'rational' && r1.rational && r2.rational) {
    return ratEq(r1.rational, r2.rational);
  }
  return Math.abs(r1.value - r2.value) <= 1e-8;
}

function formatRootValue(r) {
  if (r.rootType === 'rational' && r.rational) {
    return ratToString(r.rational);
  }
  return r.exact;
}

/**
 * Computes the maximal real domain R - {roots of Q_i} from an array of denominator polynomials.
 */
export function rationalDomainFromPolys(polys) {
  const excludedRoots = [];
  for (const poly of polys || []) {
    const norm = normalizePoly(poly);
    if (norm.length <= 1) continue;
    const fac = factorPolynomial(norm);
    for (const rr of fac.realRoots) {
      if (!excludedRoots.some((ex) => rootsMatch(ex, rr))) {
        excludedRoots.push({
          value: cleanNumber(rr.value, 10),
          exact: formatRootValue(rr),
          multiplicity: rr.multiplicity,
          rootType: rr.rootType,
          rational: rr.rational || null,
          radical: rr.radical || null,
        });
      }
    }
  }
  excludedRoots.sort((a, b) => a.value - b.value);

  const allReal = excludedRoots.length === 0;
  const intervals = [];
  if (allReal) {
    intervals.push({ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true });
  } else {
    let prev = -Infinity;
    for (const r of excludedRoots) {
      intervals.push({ lo: prev, hi: r.value, loOpen: true, hiOpen: true });
      prev = r.value;
    }
    intervals.push({ lo: prev, hi: Infinity, loOpen: true, hiOpen: true });
  }

  const domainFormatted = allReal
    ? 'ℝ'
    : `ℝ ${MINUS_CHAR} {${excludedRoots.map((r) => r.exact).join('; ')}}`;

  return {
    excludedRoots,
    allReal,
    domainIntervals: intervals,
    domainFormatted,
  };
}

/**
 * Simplifies P(x)/Q(x) by cancelling polyGcd(P, Q) while strictly preserving
 * the domain exclusions of the ORIGINAL denominator Q(x).
 */
export function simplifyRational(PInput, QInput) {
  let P;
  let Q;
  if (typeof PInput === 'string' && QInput === undefined) {
    const parsed = parseRationalExpr(PInput);
    P = parsed.numerator;
    Q = parsed.denominator;
  } else {
    P = normalizePoly(PInput);
    Q = QInput === undefined ? Object.freeze([rat(1)]) : normalizePoly(QInput);
  }

  if (isZeroPoly(Q)) {
    const err = new Error('El denominador no puede ser el polinomio nulo.');
    err.code = 'zero_denominator_polynomial';
    throw err;
  }

  const domain = rationalDomainFromPolys([Q]);
  const G = polyGcd(P, Q);
  const wasSimplified = (polyDegree(G) ?? 0) > 0;

  let P_s = isZeroPoly(P) ? P : polyDiv(P, G).quotient;
  let Q_s = polyDiv(Q, G).quotient;

  const lcQ = leadingCoeff(Q_s);
  if (!ratEq(lcQ, rat(1))) {
    const monic = polyMonic(Q_s);
    Q_s = monic.monic;
    P_s = polyScale(P_s, ratDiv(rat(1), lcQ));
  }

  const steps = [
    `Dominio original de validez: ${domain.domainFormatted}`,
    wasSimplified
      ? `Factor común polinómico detectado: GCD(P, Q) = ${formatPoly(G)}.`
      : 'Numerador y denominador son coprimos: no hay factores comunes no constantes.',
    `Expresión simplificada: (${formatPoly(P_s)}) / (${formatPoly(Q_s)}) con validez en ${domain.domainFormatted}.`,
  ];

  return {
    P,
    Q,
    gcd: G,
    simplifiedP: P_s,
    simplifiedQ: Q_s,
    wasSimplified,
    domain,
    formattedOriginal: `(${formatPoly(P)}) / (${formatPoly(Q)})`,
    formattedSimplified:
      isZeroPoly(polySub(Q_s, [rat(1)]))
        ? formatPoly(P_s)
        : `(${formatPoly(P_s)}) / (${formatPoly(Q_s)})`,
    steps,
  };
}

/**
 * Compares two rational functions for function equality (formula AND maximal domain).
 */
export function compareRationalFunctions(specA, specB) {
  const A = coerceRationalPair(specA);
  const B = coerceRationalPair(specB);

  const algebraicallyEqual = polyEqual(polyMul(A.P, B.Q), polyMul(B.P, A.Q));
  const domainA = rationalDomainFromPolys(A.allDenominators);
  const domainB = rationalDomainFromPolys(B.allDenominators);

  const sameDomain =
    domainA.excludedRoots.length === domainB.excludedRoots.length &&
    domainA.excludedRoots.every((r, idx) => rootsMatch(r, domainB.excludedRoots[idx]));

  const areEqualFunctions = algebraicallyEqual && sameDomain;

  let reason;
  if (areEqualFunctions) {
    reason = `Coinciden algebraicamente y comparten exactamente el mismo dominio (${domainA.domainFormatted}). Son funciones iguales.`;
  } else if (algebraicallyEqual && !sameDomain) {
    reason = `Tienen la misma fórmula simplificada donde ambas existen, pero sus dominios difieren (${domainA.domainFormatted} ≠ ${domainB.domainFormatted}). NO son funciones iguales.`;
  } else {
    reason = 'Sus fórmulas reducidas son distintas; no representan la misma función.';
  }

  return {
    algebraicallyEqual,
    sameDomain,
    areEqualFunctions,
    domainA,
    domainB,
    reason,
  };
}

/**
 * Computes the monic polynomial LCM M(x) of an array of denominator polynomials,
 * returning both factored and expanded representations.
 */
export function rationalLcm(denoms) {
  const polys = (denoms || []).map((d) =>
    typeof d === 'string' ? parseRationalExpr(d).numerator : normalizePoly(d)
  );
  const res = polyLcmMany(polys);
  return {
    lcm: res.lcm,
    factorization: res.factorization,
    factoredString: res.factorization.formatted,
    expandedString: formatPoly(res.lcm),
  };
}

/**
 * Performs exact rational operations ('+', '-', '*', '/') while tracking the union
 * of excluded denominator roots (and divisor numerator roots on '/').
 */
export function operateRationals(op, fracA, fracB) {
  const A = coerceRationalPair(fracA);
  const B = coerceRationalPair(fracB);

  if (isZeroPoly(A.Q) || isZeroPoly(B.Q)) {
    const err = new Error('El denominador de una fracción racional no puede ser nulo.');
    err.code = 'zero_denominator_polynomial';
    throw err;
  }

  const excludedPolys = [...A.allDenominators, ...B.allDenominators];
  let rawNum;
  let rawDen;
  let lcmInfo = null;

  if (op === '+' || op === '-') {
    lcmInfo = rationalLcm([A.Q, B.Q]);
    const M = lcmInfo.lcm;
    const scaleA = polyDiv(M, A.Q).quotient;
    const scaleB = polyDiv(M, B.Q).quotient;
    const termA = polyMul(A.P, scaleA);
    const termB = polyMul(B.P, scaleB);
    rawNum = op === '+' ? polyAdd(termA, termB) : polySub(termA, termB);
    rawDen = M;
  } else if (op === '*') {
    rawNum = polyMul(A.P, B.P);
    rawDen = polyMul(A.Q, B.Q);
  } else if (op === '/') {
    if (isZeroPoly(B.P)) {
      const err = new Error('No se puede dividir por una expresión racional cuyo numerador es nulo.');
      err.code = 'division_by_zero_polynomial';
      throw err;
    }
    excludedPolys.push(B.P);
    rawNum = polyMul(A.P, B.Q);
    rawDen = polyMul(A.Q, B.P);
  } else {
    throw new Error(`Operación racional desconocida: ${op}`);
  }

  const domain = rationalDomainFromPolys(excludedPolys);
  const simp = simplifyRational(rawNum, rawDen);

  return {
    op,
    rawNumerator: rawNum,
    rawDenominator: rawDen,
    simplifiedP: simp.simplifiedP,
    simplifiedQ: simp.simplifiedQ,
    gcd: simp.gcd,
    wasSimplified: simp.wasSimplified,
    lcm: lcmInfo,
    domain,
    formatted: simp.formattedSimplified,
  };
}

/**
 * Full UNMDP Cap. 6 analysis of f(x) = P(x)/Q(x):
 * domain, simplification, holes vs vertical asymptotes via multiplicity comparison,
 * zeros C0 strictly inside Dom(f), y-intercept, horizontal asymptote by degree, and image.
 */
export function analyzeRationalFunction(PInput, QInput) {
  const { P, Q } =
    typeof PInput === 'string' && QInput === undefined
      ? coerceRationalPair(PInput)
      : { P: normalizePoly(PInput), Q: QInput === undefined ? [rat(1)] : normalizePoly(QInput) };

  if (isZeroPoly(Q)) {
    const err = new Error('El denominador no puede ser el polinomio nulo.');
    err.code = 'zero_denominator_polynomial';
    throw err;
  }

  const simp = simplifyRational(P, Q);
  const domain = simp.domain;
  const facP = factorPolynomial(P);
  const facQ = factorPolynomial(Q);

  const holes = [];
  const verticalAsymptotes = [];
  const discontinuities = [];

  for (const rQ of facQ.realRoots) {
    const matchedP = facP.realRoots.find((rP) => rootsMatch(rP, rQ));
    const multP = matchedP ? matchedP.multiplicity : 0;
    const multQ = rQ.multiplicity;
    const xVal = cleanNumber(rQ.value, 10);
    const exactX = formatRootValue(rQ);

    if (multP >= multQ) {
      let yHoleVal;
      let exactY = null;
      if (rQ.rootType === 'rational' && rQ.rational) {
        const yRat = ratDiv(
          evalPoly(simp.simplifiedP, rQ.rational),
          evalPoly(simp.simplifiedQ, rQ.rational)
        );
        yHoleVal = cleanNumber(ratToNumber(yRat), 10);
        exactY = ratToString(yRat);
      } else {
        const numV = evalPolyNumber(simp.simplifiedP, xVal);
        const denV = evalPolyNumber(simp.simplifiedQ, xVal);
        yHoleVal = cleanNumber(numV / denV, 10);
        exactY = String(yHoleVal).replace('.', ',').replace('-', MINUS_CHAR);
      }

      const holeObj = {
        kind: 'hole',
        x: xVal,
        y: yHoleVal,
        exactX,
        exactY,
        multP,
        multQ,
        isPointOnGraph: false,
        formatted: `(${exactX}; ${exactY})`,
      };
      holes.push(holeObj);
      discontinuities.push(holeObj);
    } else {
      const vaObj = {
        kind: 'vertical_asymptote',
        x: xVal,
        exactX,
        multP,
        multQ,
        equation: `x = ${exactX}`,
      };
      verticalAsymptotes.push(vaObj);
      discontinuities.push(vaObj);
    }
  }

  // Zeros C0: roots of P strictly inside Dom(f) (multQ === 0)
  const zeros = [];
  for (const rP of facP.realRoots) {
    const inExcluded = domain.excludedRoots.some((ex) => rootsMatch(ex, rP));
    if (!inExcluded) {
      zeros.push({
        value: cleanNumber(rP.value, 10),
        exact: formatRootValue(rP),
        multiplicity: rP.multiplicity,
        rational: rP.rational || null,
      });
    }
  }
  const zerosFormatted =
    zeros.length === 0 ? '∅' : `{${zeros.map((z) => z.exact).join('; ')}}`;

  // Y-intercept: defined iff 0 in Dom(f)
  const zeroExcluded = domain.excludedRoots.some((ex) => Math.abs(ex.value) <= 1e-8);
  let yIntercept = null;
  if (!zeroExcluded) {
    const yRat = ratDiv(evalPoly(P, rat(0)), evalPoly(Q, rat(0)));
    yIntercept = {
      x: 0,
      y: cleanNumber(ratToNumber(yRat), 10),
      exactY: ratToString(yRat),
      formatted: `(0; ${ratToString(yRat)})`,
    };
  }

  // Horizontal asymptote strictly per UNMDP booklet rules
  const degP = polyDegree(P);
  const degQ = polyDegree(Q);
  let horizontalAsymptote;

  if (degP === null || degP < degQ) {
    horizontalAsymptote = {
      hasHA: true,
      value: 0,
      exactValue: rat(0),
      exactString: '0',
      equation: 'y = 0',
      rule: 'deg(P) < deg(Q)',
    };
  } else if (degP === degQ) {
    const ratio = ratDiv(leadingCoeff(P), leadingCoeff(Q));
    const ratioStr = ratToString(ratio);
    horizontalAsymptote = {
      hasHA: true,
      value: cleanNumber(ratToNumber(ratio), 10),
      exactValue: ratio,
      exactString: ratioStr,
      equation: `y = ${ratioStr}`,
      rule: 'deg(P) = deg(Q)',
    };
  } else {
    horizontalAsymptote = {
      hasHA: false,
      value: null,
      exactValue: null,
      exactString: null,
      equation: 'no tiene',
      rule: 'deg(P) > deg(Q)',
    };
    if (degP === degQ + 1) {
      const { quotient } = polyDiv(P, Q);
      horizontalAsymptote.obliqueNote = {
        didacticExtensionNotInBooklet: true,
        line: formatPoly(quotient),
        disclaimer:
          'Ampliación didáctica (fuera del cuadernillo oficial): el programa llega hasta confirmar que no hay asíntota horizontal cuando gr(P) > gr(Q).',
      };
    }
  }

  // Image Im(f) for simplified degree <= 1 (homographic or constant)
  const degPs = polyDegree(simp.simplifiedP) ?? 0;
  const degQs = polyDegree(simp.simplifiedQ) ?? 0;
  let image = null;

  if (degPs <= 1 && degQs <= 1) {
    if (degPs === 0 && degQs === 0) {
      const kRat = evalPoly(simp.simplifiedP, rat(0));
      const kStr = ratToString(kRat);
      image = {
        allReal: false,
        excludedValues: [],
        formatted: `{${kStr}}`,
        exact: true,
      };
    } else {
      const excludedImageVals = [];
      const addExcludedY = (yVal, exactLabel) => {
        if (!excludedImageVals.some((e) => Math.abs(e.value - yVal) <= 1e-8)) {
          excludedImageVals.push({ value: yVal, exact: exactLabel });
        }
      };

      // Check if H.A. value is ever attained in Dom(f): P_s(x) - ha * Q_s(x) = 0
      if (horizontalAsymptote.hasHA && horizontalAsymptote.exactValue) {
        const yHa = horizontalAsymptote.exactValue;
        const diffPoly = polySub(simp.simplifiedP, polyScale(simp.simplifiedQ, yHa));
        const rootsDiff = factorPolynomial(diffPoly).realRoots;
        const attained = rootsDiff.some(
          (r) => !domain.excludedRoots.some((ex) => rootsMatch(ex, r))
        );
        if (!attained) {
          addExcludedY(horizontalAsymptote.value, horizontalAsymptote.exactString);
        }
      }

      // Check each hole's y-coordinate: is it attained elsewhere in Dom(f)?
      for (const h of holes) {
        let yRat;
        try {
          yRat = ratFromNumber(h.y);
        } catch {
          yRat = null;
        }
        if (yRat) {
          const diffPoly = polySub(simp.simplifiedP, polyScale(simp.simplifiedQ, yRat));
          if (!isZeroPoly(diffPoly)) {
            const rootsDiff = factorPolynomial(diffPoly).realRoots;
            const attainedElsewhere = rootsDiff.some(
              (r) => !domain.excludedRoots.some((ex) => rootsMatch(ex, r))
            );
            if (!attainedElsewhere) {
              addExcludedY(h.y, h.exactY);
            }
          }
        }
      }

      excludedImageVals.sort((a, b) => a.value - b.value);
      image = {
        allReal: excludedImageVals.length === 0,
        excludedValues: excludedImageVals,
        formatted:
          excludedImageVals.length === 0
            ? 'ℝ'
            : `ℝ ${MINUS_CHAR} {${excludedImageVals.map((v) => v.exact).join('; ')}}`,
        exact: true,
      };
    }
  }

  return {
    P,
    Q,
    domain,
    simplified: simp,
    discontinuities,
    holes,
    verticalAsymptotes,
    zeros,
    zerosFormatted,
    yIntercept,
    horizontalAsymptote,
    image,
    evalAt(x) {
      const denVal = evalPolyNumber(Q, x);
      if (Math.abs(denVal) <= 1e-12) return NaN;
      return evalPolyNumber(P, x) / denVal;
    },
  };
}

/**
 * Solves a rational equation L(x) = R(x) by clearing over M(x) = lcm(Q_L, Q_R),
 * factoring the numerator N(x) = 0, and rejecting roots that zero any original denominator.
 */
export function solveRationalEquation(lhsSpec, rhsSpec = [rat(0)]) {
  const L = coerceRationalPair(lhsSpec);
  const R = coerceRationalPair(rhsSpec);

  const lcmInfo = rationalLcm([L.Q, R.Q]);
  const M = lcmInfo.lcm;
  const scaleL = polyDiv(M, L.Q).quotient;
  const scaleR = polyDiv(M, R.Q).quotient;

  const numPoly = polySub(polyMul(L.P, scaleL), polyMul(R.P, scaleR));
  const domain = rationalDomainFromPolys([...L.allDenominators, ...R.allDenominators]);

  if (isZeroPoly(numPoly)) {
    return {
      lcm: lcmInfo,
      domain,
      domainExclusions: domain.excludedRoots,
      isIdentity: true,
      candidates: [],
      validSolutions: [],
      rejectedDenominatorRoots: [],
      solutionFormatted: domain.domainFormatted,
      steps: [
        `Dominio de validez: ${domain.domainFormatted}`,
        'Al llevar todo a denominador común M(x), el numerador se anula idénticamente (0 = 0).',
        `Todo valor del dominio es solución: S = ${domain.domainFormatted}.`,
      ],
    };
  }

  const facN = factorPolynomial(numPoly);
  const validSolutions = [];
  const rejectedDenominatorRoots = [];

  for (const r of facN.realRoots) {
    const isExcluded = domain.excludedRoots.some((ex) => rootsMatch(ex, r));
    const entry = {
      value: cleanNumber(r.value, 10),
      exact: formatRootValue(r),
      multiplicity: r.multiplicity,
      rootType: r.rootType,
      rational: r.rational || null,
    };
    if (isExcluded) {
      rejectedDenominatorRoots.push(entry);
    } else {
      validSolutions.push(entry);
    }
  }

  const solutionFormatted =
    validSolutions.length === 0
      ? '∅'
      : `{${validSolutions.map((s) => s.exact).join('; ')}}`;

  const steps = [
    `Dominio de validez: ${domain.domainFormatted}`,
    `Mínimo común múltiplo de denominadores: M(x) = ${lcmInfo.factoredString}`,
    `Ecuación en el numerador: ${formatPoly(numPoly)} = 0`,
    rejectedDenominatorRoots.length > 0
      ? `Raíces descartadas por anular algún denominador: {${rejectedDenominatorRoots.map((r) => r.exact).join('; ')}}`
      : 'Ninguna raíz candidata anula los denominadores.',
    `Conjunto solución: S = ${solutionFormatted}`,
  ];

  return {
    lcm: lcmInfo,
    numeratorPoly: numPoly,
    domain,
    domainExclusions: domain.excludedRoots,
    isIdentity: false,
    candidates: facN.realRoots.map((r) => ({
      value: cleanNumber(r.value, 10),
      exact: formatRootValue(r),
    })),
    validSolutions,
    rejectedDenominatorRoots,
    solutionFormatted,
    steps,
  };
}

/**
 * Solves P(x)/Q(x) [op] k (with op in '<', '<=', '>', '>=') via exact sign table,
 * strictly enforcing open endpoints at all roots of Q(x).
 */
export function solveRationalInequality(PInput, QInput, op, k = 0) {
  let P;
  let Q;
  let actualOp = op;
  let actualK = k;

  if (typeof PInput === 'string' && typeof QInput === 'string' && ['<', '<=', '>', '>='].includes(QInput)) {
    const coerced = coerceRationalPair(PInput);
    P = coerced.P;
    Q = coerced.Q;
    actualOp = QInput;
    actualK = typeof op === 'number' || typeof op === 'string' ? op : 0;
  } else {
    P = normalizePoly(PInput);
    Q = normalizePoly(QInput);
  }

  if (!['<', '<=', '>', '>='].includes(actualOp)) {
    throw new Error(`Operador de inecuación inválido: ${actualOp}`);
  }

  if (isZeroPoly(Q)) {
    const err = new Error('El denominador de la inecuación no puede ser nulo.');
    err.code = 'zero_denominator_polynomial';
    throw err;
  }

  const kRat = ratFromNumber(actualK);
  const N = polySub(P, polyScale(Q, kRat));
  const facN = factorPolynomial(N);
  const facQ = factorPolynomial(Q);

  // Build sorted critical points with metadata
  const criticalMap = [];
  const addCrit = (r, source) => {
    const existing = criticalMap.find((c) => rootsMatch(c, r));
    if (existing) {
      if (source === 'Q') existing.inQ = true;
      if (source === 'N') existing.inN = true;
    } else {
      criticalMap.push({
        value: cleanNumber(r.value, 10),
        exact: formatRootValue(r),
        rootType: r.rootType,
        rational: r.rational || null,
        inN: source === 'N',
        inQ: source === 'Q',
      });
    }
  };

  facQ.realRoots.forEach((r) => addCrit(r, 'Q'));
  facN.realRoots.forEach((r) => addCrit(r, 'N'));
  criticalMap.sort((a, b) => a.value - b.value);

  const allowEquality = actualOp === '<=' || actualOp === '>=';
  const wantPositive = actualOp === '>' || actualOp === '>=';

  const evalSign = (x) => {
    const nVal = evalPolyNumber(N, x);
    const qVal = evalPolyNumber(Q, x);
    const val = nVal / qVal;
    return wantPositive ? val > 0 : val < 0;
  };

  const bounds = [-Infinity, ...criticalMap.map((c) => c.value), Infinity];
  const rawIntervals = [];

  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i];
    const hi = bounds[i + 1];
    let probe;
    if (lo === -Infinity && hi === Infinity) probe = 0;
    else if (lo === -Infinity) probe = hi - 1;
    else if (hi === Infinity) probe = lo + 1;
    else probe = (lo + hi) / 2;

    if (evalSign(probe)) {
      const leftCrit = i === 0 ? null : criticalMap[i - 1];
      const rightCrit = i === bounds.length - 2 ? null : criticalMap[i];
      const loOpen = !leftCrit || leftCrit.inQ || !allowEquality;
      const hiOpen = !rightCrit || rightCrit.inQ || !allowEquality;
      rawIntervals.push({ lo, hi, loOpen, hiOpen });
    }
  }

  // Merge adjacent intervals if a shared endpoint is closed on both sides (or removable zero with equality)
  const intervals = [];
  for (const iv of rawIntervals) {
    const prev = intervals[intervals.length - 1];
    if (prev && Math.abs(prev.hi - iv.lo) <= 1e-8 && !prev.hiOpen && !iv.loOpen) {
      prev.hi = iv.hi;
      prev.hiOpen = iv.hiOpen;
    } else {
      intervals.push({ ...iv });
    }
  }

  // Also include isolated points where N(x) = 0, x not in Q, and allowEquality
  const isolatedPoints = [];
  if (allowEquality) {
    for (const c of criticalMap) {
      if (c.inN && !c.inQ) {
        const covered = intervals.some(
          (iv) =>
            (Math.abs(iv.lo - c.value) <= 1e-8 && !iv.loOpen) ||
            (Math.abs(iv.hi - c.value) <= 1e-8 && !iv.hiOpen) ||
            (c.value > iv.lo && c.value < iv.hi)
        );
        if (!covered) isolatedPoints.push(c);
      }
    }
  }

  let formatted;
  if (intervals.length === 0 && isolatedPoints.length === 0) {
    formatted = '∅';
  } else {
    const ivStr = intervals.length > 0 ? formatSetExactas({ kind: 'intervals', intervals }) : '';
    const ptStr = isolatedPoints.length > 0 ? `{${isolatedPoints.map((p) => p.exact).join('; ')}}` : '';
    formatted = [ivStr, ptStr].filter(Boolean).join(' ∪ ');
  }

  return {
    numerator: N,
    denominator: Q,
    criticalPoints: criticalMap,
    intervals,
    isolatedPoints,
    formatted,
  };
}

/**
 * Reconstructs a homographic function f(x) = (ax + b)/(cx + d) from graphical/analytic hints,
 * optionally multiplying by (x - hole.x)/(x - hole.x) when a removable hole is requested.
 */
export function reconstructHomographicFromHints({
  excludedX,
  haY = 0,
  zeroX = null,
  yIntercept = null,
  point = null,
  hole = null,
} = {}) {
  const xPole = ratFromNumber(excludedX);
  const yHa = ratFromNumber(haY);

  // Base form: yHa + k / (x - xPole) = (yHa * x - yHa * xPole + k) / (x - xPole)
  let kRat = rat(1);
  if (zeroX !== null && zeroX !== undefined) {
    const x0 = ratFromNumber(zeroX);
    if (ratEq(x0, xPole)) {
      throw new Error('La raíz no puede coincidir con el polo excluido.');
    }
    // yHa + k / (x0 - xPole) = 0 => k = -yHa * (x0 - xPole)
    kRat = ratNeg(ratMul(yHa, ratSub(x0, xPole)));
  } else if (yIntercept !== null && yIntercept !== undefined) {
    const y0 = ratFromNumber(yIntercept);
    if (ratEq(xPole, rat(0))) {
      throw new Error('No hay ordenada al origen si x = 0 está excluido.');
    }
    // yHa + k / (0 - xPole) = y0 => k = (y0 - yHa) * (-xPole)
    kRat = ratMul(ratSub(y0, yHa), ratNeg(xPole));
  } else if (point && typeof point.x === 'number' && typeof point.y === 'number') {
    const px = ratFromNumber(point.x);
    const py = ratFromNumber(point.y);
    kRat = ratMul(ratSub(py, yHa), ratSub(px, xPole));
  }

  let Q = normalizePoly([ratNeg(xPole), rat(1)]); // x - xPole
  let P = polyAdd(polyScale(Q, yHa), [kRat]); // yHa*(x - xPole) + k

  if (hole && hole.x !== undefined && hole.x !== null) {
    const xh = ratFromNumber(hole.x);
    const holeFactor = normalizePoly([ratNeg(xh), rat(1)]);
    P = polyMul(P, holeFactor);
    Q = polyMul(Q, holeFactor);
  }

  return {
    P,
    Q,
    analysis: analyzeRationalFunction(P, Q),
    formatted: `(${formatPoly(P)}) / (${formatPoly(Q)})`,
  };
}
