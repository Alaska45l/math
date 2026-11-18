/**
 * @file js/modules/racionales-irracionales/irracionales.js
 * Submodule 2: Pure Radical Functions, Even vs Odd Index Domains,
 * Irrational Equations with Extraneous Root Detection & Mixed Piecewise Functions.
 * Reuses cuadraticas/logic.js, potencias-raices/expr.js, valor-absoluto/logic.js.
 *
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

import {
  ratFromNumber,
  ratToNumber,
  normalizePoly,
  polyPow,
  polySub,
  factorPolynomial,
  MINUS_CHAR,
} from '../../core/math/polynomials.js';

import {
  decomposeQuadraticRootsExact,
  fromPolynomial,
} from '../cuadraticas/logic.js';

import {
  evalPiecewise,
  validatePiecewiseFunction,
} from '../valor-absoluto/logic.js';

import {
  parseIrrationalExpr,
  evalIrrationalAt,
  formatSetExactas,
  approxEq,
  cleanNumber,
} from './expr.js';

import { fmt } from '../../core/math-format.js';

function toNumCoeffs(coeffs) {
  if (!Array.isArray(coeffs) || coeffs.length === 0) return [0];
  return coeffs.map((c) => (c && typeof c === 'object' && 'n' in c ? ratToNumber(c) : Number(c)));
}

function evalPolyArr(coeffs, x) {
  let acc = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    acc = acc * x + (coeffs[i] || 0);
  }
  return acc;
}

function fmtExactBound(val, exactStr = null) {
  if (val === -Infinity) return `${MINUS_CHAR}∞`;
  if (val === Infinity) return '+∞';
  if (exactStr) return exactStr;
  return fmt(cleanNumber(val, 6));
}

function formatIntervalsWithExact(intervals, exactMap = new Map()) {
  if (!intervals || intervals.length === 0) return '∅';
  return intervals
    .map((iv) => {
      const lB = iv.loOpen ? '(' : '[';
      const rB = iv.hiOpen ? ')' : ']';
      const lStr = fmtExactBound(iv.lo, exactMap.get(iv.lo));
      const rStr = fmtExactBound(iv.hi, exactMap.get(iv.hi));
      return `${lB}${lStr}; ${rStr}${rB}`;
    })
    .join(' ∪ ');
}

function isInIntervals(x, intervals = [], isolatedPoints = []) {
  for (const p of isolatedPoints) {
    if (approxEq(x, p, 1e-8)) return true;
  }
  for (const iv of intervals) {
    const aboveLo = iv.lo === -Infinity || (iv.loOpen ? x > iv.lo + 1e-9 : x >= iv.lo - 1e-9);
    const belowHi = iv.hi === Infinity || (iv.hiOpen ? x < iv.hi - 1e-9 : x <= iv.hi + 1e-9);
    if (aboveLo && belowHi) return true;
  }
  return false;
}

/**
 * Analyzes the maximal real domain of k * root_n(g(x)) (or 1 / root_n(g(x)) when inDenominator = true)
 * for degree 0, 1, or 2 polynomial radicands g(x).
 */
export function analyzeIrrationalDomain({
  index = 2,
  radicandCoeffs,
  gCoeffs,
  inDenominator = false,
} = {}) {
  const n = Math.trunc(Number(index));
  if (!Number.isInteger(n) || n < 2) {
    throw new RangeError('El índice de la raíz debe ser un entero mayor o igual a 2.');
  }
  const coeffs = toNumCoeffs(radicandCoeffs ?? gCoeffs ?? [0, 1]);
  const parity = n % 2 === 0 ? 'even' : 'odd';

  // Trim trailing zeros
  const trimmed = [...coeffs];
  while (trimmed.length > 1 && Math.abs(trimmed[trimmed.length - 1]) < 1e-12) {
    trimmed.pop();
  }
  const deg = trimmed.length - 1;

  // ODD INDEX: Radicand can be negative, zero, or positive; only denominator exclusion applies
  if (parity === 'odd') {
    if (!inDenominator) {
      return {
        index: n,
        parity,
        inDenominator: false,
        intervals: [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }],
        isolatedPoints: [],
        excludedRoots: [],
        domainFormatted: 'ℝ',
        restrictionText: `Índice impar (n = ${n}): no impone restricción de signo al radicando.`,
      };
    }

    // In denominator with odd index: g(x) != 0
    const roots = [];
    if (deg === 0) {
      if (Math.abs(trimmed[0]) < 1e-12) {
        return {
          index: n,
          parity,
          inDenominator: true,
          intervals: [],
          isolatedPoints: [],
          excludedRoots: [],
          domainFormatted: '∅',
          restrictionText: 'El denominador es constantemente nulo.',
        };
      }
      return {
        index: n,
        parity,
        inDenominator: true,
        intervals: [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }],
        isolatedPoints: [],
        excludedRoots: [],
        domainFormatted: 'ℝ',
        restrictionText: 'El radicando constante es distinto de cero en todo ℝ.',
      };
    }
    if (deg === 1) {
      const r = cleanNumber(-trimmed[0] / trimmed[1], 10);
      roots.push({ value: r, exact: fmt(r) });
    } else if (deg === 2) {
      const decomp = decomposeQuadraticRootsExact(trimmed[2], trimmed[1], trimmed[0]);
      if (decomp) {
        const qAnalysis = fromPolynomial({ a: trimmed[2], b: trimmed[1], c: trimmed[0] });
        qAnalysis.roots.forEach((rv, idx) => {
          const ex = idx === 0 ? decomp.formattedMinus : decomp.formattedPlus;
          roots.push({ value: cleanNumber(rv, 10), exact: ex });
        });
      }
    } else {
      const polyRat = normalizePoly(trimmed.map((v) => ratFromNumber(v)));
      const fac = factorPolynomial(polyRat);
      fac.realRoots.forEach((rr) => roots.push({ value: cleanNumber(rr.value, 10), exact: rr.exact }));
    }

    const uniqueRoots = [];
    roots.sort((a, b) => a.value - b.value);
    for (const r of roots) {
      if (!uniqueRoots.some((u) => approxEq(u.value, r.value, 1e-8))) uniqueRoots.push(r);
    }

    if (uniqueRoots.length === 0) {
      return {
        index: n,
        parity,
        inDenominator: true,
        intervals: [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }],
        isolatedPoints: [],
        excludedRoots: [],
        domainFormatted: 'ℝ',
        restrictionText: `Índice impar en denominador: g(x) ≠ 0 se cumple en todo ℝ.`,
      };
    }

    const intervals = [];
    let prev = -Infinity;
    for (const r of uniqueRoots) {
      intervals.push({ lo: prev, hi: r.value, loOpen: true, hiOpen: true });
      prev = r.value;
    }
    intervals.push({ lo: prev, hi: Infinity, loOpen: true, hiOpen: true });

    return {
      index: n,
      parity,
      inDenominator: true,
      intervals,
      isolatedPoints: [],
      excludedRoots: uniqueRoots,
      domainFormatted: `ℝ ${MINUS_CHAR} {${uniqueRoots.map((r) => r.exact).join('; ')}}`,
      restrictionText: `Índice impar en denominador: se exige g(x) ≠ 0.`,
    };
  }

  // EVEN INDEX: g(x) >= 0 (or g(x) > 0 if inDenominator)
  const opSym = inDenominator ? '>' : '≥';
  const strict = Boolean(inDenominator);

  if (deg === 0) {
    const ok = strict ? trimmed[0] > 1e-12 : trimmed[0] >= -1e-12;
    return {
      index: n,
      parity,
      inDenominator: strict,
      intervals: ok ? [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }] : [],
      isolatedPoints: [],
      excludedRoots: [],
      domainFormatted: ok ? 'ℝ' : '∅',
      restrictionText: `Índice par: se exige ${fmt(trimmed[0])} ${opSym} 0.`,
    };
  }

  if (deg === 1) {
    const b = trimmed[0];
    const a = trimmed[1];
    const root = cleanNumber(-b / a, 10);
    const intervals =
      a > 0
        ? [{ lo: root, hi: Infinity, loOpen: strict, hiOpen: true }]
        : [{ lo: -Infinity, hi: root, loOpen: true, hiOpen: strict }];

    return {
      index: n,
      parity,
      inDenominator: strict,
      intervals,
      isolatedPoints: [],
      excludedRoots: [],
      domainFormatted: formatIntervalsWithExact(intervals),
      restrictionText: `Índice par: g(x) ${opSym} 0 ${a < 0 ? '(invierte sentido al dividir por a < 0)' : ''}.`.trim(),
    };
  }

  if (deg === 2) {
    const c = trimmed[0];
    const b = trimmed[1];
    const a = trimmed[2];
    const decomp = decomposeQuadraticRootsExact(a, b, c);
    const exactMap = new Map();

    // Delta < 0
    if (!decomp) {
      const ok = a > 0;
      return {
        index: n,
        parity,
        inDenominator: strict,
        intervals: ok ? [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }] : [],
        isolatedPoints: [],
        excludedRoots: [],
        domainFormatted: ok ? 'ℝ' : '∅',
        restrictionText: `Índice par: g(x) ${opSym} 0 con Δ < 0 (${a > 0 ? 'siempre positivo' : 'siempre negativo'}).`,
      };
    }

    const qInfo = fromPolynomial({ a, b, c });
    // Delta == 0
    if (qInfo.roots.length === 1) {
      const r0 = cleanNumber(qInfo.roots[0], 10);
      exactMap.set(r0, decomp.formattedPlus);
      if (a > 0) {
        const intervals = strict
          ? [
              { lo: -Infinity, hi: r0, loOpen: true, hiOpen: true },
              { lo: r0, hi: Infinity, loOpen: true, hiOpen: true },
            ]
          : [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }];
        return {
          index: n,
          parity,
          inDenominator: strict,
          intervals,
          isolatedPoints: [],
          excludedRoots: strict ? [{ value: r0, exact: decomp.formattedPlus }] : [],
          domainFormatted: strict ? `ℝ ${MINUS_CHAR} {${decomp.formattedPlus}}` : 'ℝ',
          restrictionText: `Índice par: g(x) ${opSym} 0 con raíz doble en x = ${decomp.formattedPlus}.`,
        };
      }
      // a < 0 and Delta == 0
      return {
        index: n,
        parity,
        inDenominator: strict,
        intervals: [],
        isolatedPoints: strict ? [] : [r0],
        excludedRoots: [],
        domainFormatted: strict ? '∅' : `{${decomp.formattedPlus}}`,
        restrictionText: `Índice par: g(x) ${opSym} 0 con parábola hacia abajo tangente en x = ${decomp.formattedPlus}.`,
      };
    }

    // Delta > 0: two roots r1 < r2
    const r1 = cleanNumber(qInfo.roots[0], 10);
    const r2 = cleanNumber(qInfo.roots[1], 10);
    exactMap.set(r1, decomp.formattedMinus);
    exactMap.set(r2, decomp.formattedPlus);

    const intervals =
      a > 0
        ? [
            { lo: -Infinity, hi: r1, loOpen: true, hiOpen: strict },
            { lo: r2, hi: Infinity, loOpen: strict, hiOpen: true },
          ]
        : [{ lo: r1, hi: r2, loOpen: strict, hiOpen: strict }];

    return {
      index: n,
      parity,
      inDenominator: strict,
      intervals,
      isolatedPoints: [],
      excludedRoots: [],
      domainFormatted: formatIntervalsWithExact(intervals, exactMap),
      restrictionText: `Índice par: se resuelve ${fmt(a)}x² + ${fmt(b)}x + ${fmt(c)} ${opSym} 0.`,
    };
  }

  throw new Error('analyzeIrrationalDomain admite radicandos polinómicos hasta grado 2.');
}

/**
 * Full study for f(x) = k * root_n(a*x + b) + c (or quadratic radicand gCoeffs).
 */
export function analyzeIrrationalFunction({
  k = 1,
  index = 2,
  a = 1,
  b = 0,
  c = 0,
  gCoeffs = null,
} = {}) {
  const n = Math.trunc(Number(index));
  const coeffs = toNumCoeffs(gCoeffs ?? [b, a]);
  const domain = analyzeIrrationalDomain({ index: n, radicandCoeffs: coeffs, inDenominator: false });
  const parity = n % 2 === 0 ? 'even' : 'odd';

  const evalAt = (x) => {
    const gx = evalPolyArr(coeffs, x);
    if (parity === 'even' && gx < -1e-12) return NaN;
    const safeG = Math.abs(gx) < 1e-12 ? 0 : gx;
    const rootVal = safeG < 0 ? -Math.pow(-safeG, 1 / n) : Math.pow(safeG, 1 / n);
    return cleanNumber(k * rootVal + c, 10);
  };

  // Image Im(f)
  let image;
  const deg = coeffs.length - 1;
  if (Math.abs(k) < 1e-12) {
    image = { intervals: [], isolatedPoints: [c], formatted: `{${fmt(c)}}` };
  } else if (parity === 'odd') {
    image =
      deg >= 1 && !(deg === 2)
        ? { intervals: [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }], formatted: 'ℝ' }
        : (() => {
            if (deg === 2 && coeffs[2] !== 0) {
              const xv = -coeffs[1] / (2 * coeffs[2]);
              const gv = evalPolyArr(coeffs, xv);
              const yv = evalAt(xv);
              if (coeffs[2] > 0) {
                const iv = k > 0 ? { lo: yv, hi: Infinity, loOpen: false, hiOpen: true } : { lo: -Infinity, hi: yv, loOpen: true, hiOpen: false };
                return { intervals: [iv], formatted: formatIntervalsWithExact([iv]) };
              }
              const iv = k > 0 ? { lo: -Infinity, hi: yv, loOpen: true, hiOpen: false } : { lo: yv, hi: Infinity, loOpen: false, hiOpen: true };
              return { intervals: [iv], formatted: formatIntervalsWithExact([iv]) };
            }
            return { intervals: [{ lo: -Infinity, hi: Infinity, loOpen: true, hiOpen: true }], formatted: 'ℝ' };
          })();
  } else if (deg === 1) {
    const iv =
      k > 0
        ? { lo: c, hi: Infinity, loOpen: false, hiOpen: true }
        : { lo: -Infinity, hi: c, loOpen: true, hiOpen: false };
    image = { intervals: [iv], formatted: formatIntervalsWithExact([iv]) };
  } else if (deg === 2) {
    if (domain.intervals.length === 0 && domain.isolatedPoints.length === 0) {
      image = { intervals: [], formatted: '∅' };
    } else if (domain.isolatedPoints.length === 1) {
      image = { intervals: [], isolatedPoints: [c], formatted: `{${fmt(c)}}` };
    } else if (coeffs[2] < 0) {
      const xv = -coeffs[1] / (2 * coeffs[2]);
      const yMaxBranch = evalAt(xv);
      const lo = Math.min(c, yMaxBranch);
      const hi = Math.max(c, yMaxBranch);
      const iv = { lo, hi, loOpen: false, hiOpen: false };
      image = { intervals: [iv], formatted: formatIntervalsWithExact([iv]) };
    } else {
      const iv =
        k > 0
          ? { lo: c, hi: Infinity, loOpen: false, hiOpen: true }
          : { lo: -Infinity, hi: c, loOpen: true, hiOpen: false };
      image = { intervals: [iv], formatted: formatIntervalsWithExact([iv]) };
    }
  } else {
    const y0 = evalAt(0);
    image = Number.isFinite(y0)
      ? { intervals: [], isolatedPoints: [y0], formatted: `{${fmt(y0)}}` }
      : { intervals: [], formatted: '∅' };
  }

  // Zeros C0: k * root_n(g(x)) + c = 0 => root_n(g(x)) = -c/k
  const zeros = [];
  if (Math.abs(k) < 1e-12) {
    if (Math.abs(c) < 1e-12 && domain.intervals.length > 0) {
      // Constant 0 on domain
    }
  } else {
    const targetRoot = -c / k;
    if (!(parity === 'even' && targetRoot < -1e-12)) {
      const rhsVal = Math.pow(targetRoot, n);
      if (deg === 1 && Math.abs(coeffs[1]) > 1e-12) {
        const x0 = cleanNumber((rhsVal - coeffs[0]) / coeffs[1], 10);
        if (isInIntervals(x0, domain.intervals, domain.isolatedPoints)) {
          zeros.push(x0);
        }
      } else if (deg === 2 && Math.abs(coeffs[2]) > 1e-12) {
        const qInfo = fromPolynomial({ a: coeffs[2], b: coeffs[1], c: coeffs[0] - rhsVal });
        for (const r of qInfo.roots) {
          const rx = cleanNumber(r, 10);
          if (isInIntervals(rx, domain.intervals, domain.isolatedPoints) && !zeros.some((z) => approxEq(z, rx, 1e-8))) {
            zeros.push(rx);
          }
        }
      }
    }
  }
  zeros.sort((u, v) => u - v);
  const zerosFormatted = zeros.length === 0 ? '∅' : `{${zeros.map((z) => fmt(z)).join('; ')}}`;

  // Y-intercept
  let yIntercept = null;
  if (isInIntervals(0, domain.intervals, domain.isolatedPoints)) {
    const y0 = evalAt(0);
    if (Number.isFinite(y0)) {
      yIntercept = { x: 0, y: y0, formatted: `(0; ${fmt(y0)})` };
    }
  }

  // Monotonicity for linear radicand
  let monotonicity = { increasing: '∅', decreasing: '∅' };
  if (deg === 1 && Math.abs(k) > 1e-12 && Math.abs(coeffs[1]) > 1e-12) {
    const slopeSign = k * coeffs[1];
    if (slopeSign > 0) {
      monotonicity = { increasing: domain.domainFormatted, decreasing: '∅' };
    } else {
      monotonicity = { increasing: '∅', decreasing: domain.domainFormatted };
    }
  }

  // Vertex / endpoint for linear even radical
  let startPoint = null;
  if (parity === 'even' && deg === 1 && Math.abs(coeffs[1]) > 1e-12) {
    const x0 = cleanNumber(-coeffs[0] / coeffs[1], 10);
    startPoint = { x: x0, y: cleanNumber(c, 10), formatted: `(${fmt(x0)}; ${fmt(c)})` };
  }

  return {
    k,
    index: n,
    parity,
    radicandCoeffs: coeffs,
    c,
    domain,
    image,
    zeros,
    zerosFormatted,
    yIntercept,
    monotonicity,
    startPoint,
    evalAt,
  };
}

/**
 * Solves k * root_n(g(x)) + d = R_raw(x) (default k=1, d=0, R_raw(x) = m*x + q),
 * verifying BOTH radicand domain g(x) >= 0 AND sign compatibility R(x) >= 0 (for even n),
 * explicitly detecting and reporting extraneous squaring roots.
 */
export function solveIrrationalEquation(spec) {
  let index = 2;
  let k = 1;
  let d = 0;
  let gCoeffs;
  let rhsCoeffs;

  if (typeof spec === 'string' && spec.includes('=')) {
    const [lhsStr, rhsStr] = spec.split('=');
    const parsedL = parseIrrationalExpr(lhsStr.trim());
    index = parsedL.index || 2;
    k = parsedL.k ?? 1;
    d = parsedL.c ?? 0;
    gCoeffs = parsedL.radicandCoeffs || [0, 1];
    const parsedR = parseIrrationalExpr(rhsStr.trim());
    // Extract linear rhs via sampling at 0, 1
    const y0 = evalIrrationalAt(parsedR, 0).value ?? 0;
    const y1 = evalIrrationalAt(parsedR, 1).value ?? y0;
    rhsCoeffs = [y0, cleanNumber(y1 - y0, 10)];
  } else {
    index = Math.trunc(Number(spec?.index ?? 2));
    k = Number(spec?.k ?? 1);
    d = Number(spec?.d ?? 0);
    gCoeffs = toNumCoeffs(spec?.gCoeffs ?? spec?.radicandCoeffs ?? [0, 1]);
    rhsCoeffs = toNumCoeffs(spec?.rhsCoeffs ?? [0, 1]);
  }

  if (Math.abs(k) < 1e-12) {
    throw new Error('El coeficiente k del radical no puede ser cero.');
  }

  const parity = index % 2 === 0 ? 'even' : 'odd';
  const domain = analyzeIrrationalDomain({ index, radicandCoeffs: gCoeffs, inDenominator: false });

  // Isolate root_n(g(x)) = R(x) where R(x) = (rhs(x) - d) / k
  const r0 = ((rhsCoeffs[0] || 0) - d) / k;
  const r1 = (rhsCoeffs[1] || 0) / k;
  const RCoeffs = Math.abs(r1) < 1e-12 ? [r0] : [r0, r1];

  const signCondition =
    parity === 'even'
      ? Math.abs(r1) < 1e-12
        ? r0 >= -1e-12
          ? 'ℝ (constante ≥ 0)'
          : '∅ (constante negativa: imposible para raíz de índice par)'
        : formatIntervalsWithExact([
            r1 > 0
              ? { lo: cleanNumber(-r0 / r1, 10), hi: Infinity, loOpen: false, hiOpen: true }
              : { lo: -Infinity, hi: cleanNumber(-r0 / r1, 10), loOpen: true, hiOpen: false },
          ])
      : 'ℝ (índice impar admite miembro derecho negativo)';

  // Raise to power n: g(x) - (R(x))^n = 0 using exact rational polynomials
  const gRatPoly = normalizePoly(gCoeffs.map((v) => ratFromNumber(v)));
  const rRatPoly = normalizePoly(RCoeffs.map((v) => ratFromNumber(v)));
  const rPowPoly = polyPow(rRatPoly, index);
  const eqPoly = polySub(gRatPoly, rPowPoly);

  const fac = factorPolynomial(eqPoly);
  const candidates = fac.realRoots.map((rr) => ({
    value: cleanNumber(rr.value, 10),
    exact: rr.exact,
  }));

  const validSolutions = [];
  const extraneousSolutions = [];

  for (const cand of candidates) {
    const x = cand.value;
    const gVal = evalPolyArr(gCoeffs, x);
    const rhsVal = evalPolyArr(rhsCoeffs, x);
    const rVal = evalPolyArr(RCoeffs, x);

    if (parity === 'even' && gVal < -1e-7) {
      extraneousSolutions.push({
        x,
        exact: cand.exact,
        reason: 'outside_radicand_domain',
        lhsVal: null,
        rhsVal: cleanNumber(rhsVal, 10),
        detail: `x = ${cand.exact} deja el radicando negativo (${fmt(cleanNumber(gVal, 4))} < 0).`,
      });
      continue;
    }

    if (parity === 'even' && rVal < -1e-7) {
      const rootVal = Math.pow(Math.max(0, gVal), 1 / index);
      const lhsVal = cleanNumber(k * rootVal + d, 10);
      extraneousSolutions.push({
        x,
        exact: cand.exact,
        reason: 'negative_rhs',
        lhsVal,
        rhsVal: cleanNumber(rhsVal, 10),
        detail: `x = ${cand.exact} es solución extraviada: al reemplazar da ${fmt(lhsVal)} ≠ ${fmt(cleanNumber(rhsVal, 10))}.`,
      });
      continue;
    }

    const rootVal = gVal < 0 ? -Math.pow(-gVal, 1 / index) : Math.pow(gVal, 1 / index);
    const lhsVal = cleanNumber(k * rootVal + d, 10);
    if (approxEq(lhsVal, rhsVal, 1e-6)) {
      validSolutions.push({
        x,
        exact: cand.exact,
        lhsVal,
        rhsVal: cleanNumber(rhsVal, 10),
      });
    }
  }

  const solutionFormatted =
    validSolutions.length === 0
      ? '∅'
      : `{${validSolutions.map((s) => s.exact).join('; ')}}`;

  const steps = [
    `1. Dominio del radicando: ${domain.domainFormatted}`,
    `2. Compatibilidad de signo del miembro aislado: ${signCondition}`,
    `3. Al elevar ambos miembros a la potencia ${index}, resultan candidatos: ${
      candidates.length ? candidates.map((c) => c.exact).join('; ') : 'ninguno'
    }`,
    extraneousSolutions.length > 0
      ? `4. Soluciones extraviadas descartadas en verificación: ${extraneousSolutions.map((e) => e.exact).join('; ')}`
      : '4. Todas las raíces candidatas verifican la ecuación original.',
    `5. Conjunto solución: S = ${solutionFormatted}`,
  ];

  return {
    index,
    parity,
    domain,
    signCondition,
    candidates,
    validSolutions,
    extraneousSolutions,
    solutionFormatted,
    steps,
  };
}

/**
 * Analyzes mixed piecewise functions (combining rational, radical, linear, quadratic branches)
 * delegating evaluation and boundary collision checks to valor-absoluto/logic.js.
 */
export function analyzeMixedPiecewise(pieces = []) {
  const normPieces = pieces.map((p) => ({
    ...p,
    minInclusive: Boolean(p.minInclusive ?? p.includeMin ?? p.leftClosed),
    maxInclusive: Boolean(p.maxInclusive ?? p.includeMax ?? p.rightClosed),
  }));
  const validity = validatePiecewiseFunction(normPieces);

  const evalAt = (x) => {
    const res = evalPiecewise(normPieces, x);
    if (!res.defined || res.collision) {
      return { defined: false, value: null, pieceIndex: res.pieceIndex, collision: res.collision };
    }
    const piece = normPieces[res.activePieceIndex];
    if (piece && typeof piece.fn === 'function') {
      const y = piece.fn(x);
      if (!Number.isFinite(y)) {
        return { defined: false, value: null, pieceIndex: res.activePieceIndex, collision: false };
      }
      return { defined: true, value: cleanNumber(y, 10), pieceIndex: res.activePieceIndex, collision: false };
    }
    return { defined: true, value: res.y, pieceIndex: res.activePieceIndex, collision: false };
  };

  // Evaluate stitch boundaries
  const boundaries = [];
  const boundaryXs = new Set();
  pieces.forEach((p) => {
    if (Number.isFinite(p.minX)) boundaryXs.add(p.minX);
    if (Number.isFinite(p.maxX)) boundaryXs.add(p.maxX);
  });

  Array.from(boundaryXs)
    .sort((a, b) => a - b)
    .forEach((bx) => {
      const atB = evalAt(bx);
      const leftVal = evalAt(bx - 1e-4);
      const rightVal = evalAt(bx + 1e-4);
      const continuous =
        atB.defined &&
        leftVal.defined &&
        rightVal.defined &&
        Math.abs(leftVal.value - rightVal.value) < 5e-3 &&
        Math.abs(leftVal.value - atB.value) < 5e-3;
      boundaries.push({
        x: bx,
        defined: atB.defined,
        value: atB.value,
        leftLimitApprox: leftVal.defined ? leftVal.value : null,
        rightLimitApprox: rightVal.defined ? rightVal.value : null,
        continuous,
      });
    });

  // Sample-based zeros & range summary across [-15, 15] + boundaries
  const zeros = [];
  pieces.forEach((p) => {
    const lo = Number.isFinite(p.minX) ? p.minX : -15;
    const hi = Number.isFinite(p.maxX) ? p.maxX : 15;
    const steps = 120;
    const dx = (hi - lo) / steps;
    let prevX = lo;
    let prevRes = evalAt(prevX);
    if (prevRes.defined && Math.abs(prevRes.value) < 1e-7) {
      if (!zeros.some((z) => approxEq(z, prevX, 1e-5))) zeros.push(cleanNumber(prevX, 6));
    }
    for (let i = 1; i <= steps; i++) {
      const curX = lo + i * dx;
      const curRes = evalAt(curX);
      if (curRes.defined && Math.abs(curRes.value) < 1e-6) {
        if (!zeros.some((z) => approxEq(z, curX, 1e-4))) zeros.push(cleanNumber(curX, 6));
      } else if (prevRes.defined && curRes.defined && prevRes.value * curRes.value < 0) {
        // Bisection refinement
        let a = prevX;
        let b = curX;
        let fa = prevRes.value;
        for (let k = 0; k < 28; k++) {
          const mid = (a + b) / 2;
          const fm = evalAt(mid);
          if (!fm.defined) break;
          if (fa * fm.value <= 0) b = mid;
          else {
            a = mid;
            fa = fm.value;
          }
        }
        const root = cleanNumber((a + b) / 2, 6);
        const verify = evalAt(root);
        if (verify.defined && Math.abs(verify.value) < 1e-3 && !zeros.some((z) => approxEq(z, root, 1e-4))) {
          zeros.push(root);
        }
      }
      prevX = curX;
      prevRes = curRes;
    }
  });
  zeros.sort((a, b) => a - b);

  return {
    piecesCount: pieces.length,
    isValidFunction: validity.isValidFunction,
    collisions: validity.collisions,
    boundaries,
    zeros,
    zerosFormatted: zeros.length === 0 ? '∅' : `{${zeros.map((z) => fmt(z)).join('; ')}}`,
    evalAt,
  };
}
