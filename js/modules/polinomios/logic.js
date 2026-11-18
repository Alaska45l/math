/**
 * @file js/modules/polinomios/logic.js
 * Motor analítico y diagnóstico cognitivo de Unidad 06 (Polinomios).
 * Reutiliza cuadraticas/logic.js (fromPolynomial, decomposeQuadraticRootsExact, factorQuadraticSteps)
 * y js/core/math/polynomials.js. 100% puro, sin DOM ni eval.
 */

export {
  fromPolynomial,
  decomposeQuadraticRootsExact,
  factorQuadraticSteps,
} from '../cuadraticas/logic.js';

export {
  ZERO_POLY,
  gcdInt,
  lcmInt,
  rat,
  ratFromNumber,
  parseRational,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratInv,
  ratAbs,
  ratPow,
  ratCompare,
  ratEq,
  isZeroRat,
  isOneRat,
  isMinusOneRat,
  isIntRat,
  ratToNumber,
  ratToString,
  divisorsOfInt,
  normalizePoly,
  polyFromDescending,
  polyToDescending,
  polyToSparse,
  isZeroPoly,
  polyDegree,
  polyDegreeOrNegInf,
  leadingCoeff,
  constantTerm,
  isMonic,
  polyMonic,
  polyEqual,
  areOppositePolys,
  inspectPolynomial,
  polyNeg,
  polyScale,
  polyAdd,
  polySub,
  polyMul,
  polyPow,
  evalPoly,
  evalPolyNumber,
  polyDiv,
  ruffini,
  ruffiniLinear,
  remainderTheorem,
  gaussCandidates,
  factorPolynomial,
  polyGcd,
  polyLcm,
  polyLcmMany,
  formatPoly,
  formatPolyHtml,
  parsePolynomialExpr,
} from '../../core/math/polynomials.js';
export { fmt } from '../../core/math-format.js';

import {
  normalizePoly,
  polyFromDescending,
  polyAdd,
  polySub,
  polyScale,
  polyMonic,
  polyEqual,
  polyDegree,
  leadingCoeff,
  ruffini,
  remainderTheorem,
  gaussCandidates,
  rat,
  ratNeg,
  ratInv,
  ratEq,
  isOneRat,
  parsePolynomialExpr,
} from '../../core/math/polynomials.js';
import {
  parseNumberOrFraction,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  equivalentPolyExpr,
} from './expr.js';
import { POLY_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';

const DIAGNOSTIC_MESSAGES = Object.freeze({
  non_polynomial_accepted:
    '¡Ojo con la definición! Para que sea un polinomio, todos los exponentes de x deben ser enteros no negativos (0, 1, 2, ...): si aparece x en un denominador, con exponente negativo o bajo una raíz, queda fuera de los polinomios.',
  zero_poly_degree_zero:
    'El polinomio nulo P(x) = 0 es el único que NO tiene grado. El grado 0 corresponde a constantes no nulas como P(x) = 5.',
  wrong_leading_coeff_unordered:
    '¡Cuidado con los polinomios desordenados! El coeficiente principal y el grado siempre pertenecen al término de MAYOR exponente de x, no al primero que aparece escrito a la izquierda.',
  subtract_poly_sign_leak:
    'Fuga de signo al restar: en P(x) − Q(x), el signo menos afecta a TODOS los términos de Q(x), no solo al primero.',
  added_degrees_on_sum:
    'En la suma o resta de polinomios NO se suman los grados: gr(P + Q) es a lo sumo el máximo de ambos grados (y puede bajar si se cancelan los términos principales).',
  ruffini_sign_error:
    'Revisá el signo en la esquina de Ruffini o en el Teorema del Resto: el divisor (x − r) usa +r, mientras que (x + r) equivale a (x − (−r)) y usa −r.',
  ruffini_forgot_missing_zero_coeff:
    'Para aplicar Ruffini, el dividendo debe estar completo y ordenado en forma decreciente: agregá un 0 por cada potencia de x que falte.',
  ruffini_unscaled_nonmonic_quotient:
    'Al dividir por (ax − b) con a ≠ 1 usando Ruffini con r = b/a, el resto R es correcto pero el cociente obtenido queda multiplicado por a: dividilo por a para recuperar C(x).',
  forgot_leading_coeff_factoring:
    '¡No pierdas el coeficiente principal! Un polinomio factorizado se escribe a_n · (x − r₁) · (x − r₂)..., manteniendo a_n ≠ 1 multiplicando adelante.',
  swapped_p_q_in_gauss:
    'Invertiste la fracción del Teorema de Gauss: los numeradores p dividen al término independiente a₀ y los denominadores q dividen al coeficiente principal a_n (p/q, nunca q/p).',
});

export const POLY_DIAGNOSTICS = Object.freeze(
  Object.fromEntries(
    Object.entries(POLY_DIAGNOSTIC_TAXONOMY).map(([id, meta]) => [
      id,
      Object.freeze({
        ...meta,
        message: DIAGNOSTIC_MESSAGES[id],
      }),
    ])
  )
);

function buildDiag(id) {
  return POLY_DIAGNOSTICS[id] || null;
}

/**
 * Pure cognitive diagnostic detector covering all 10 polynomial misconceptions.
 */
export function diagnosePolynomial(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  // Explicit diagnosticMap override (e.g. from choice options)
  if (context.diagnosticMap && context.diagnosticMap[raw]) {
    return buildDiag(context.diagnosticMap[raw]);
  }

  // 1. Non-polynomial accepted (rational, negative exponent, radical on variable)
  if (context.target === 'is_polynomial') {
    const lower = raw.toLowerCase();
    if (context.isNonPolynomial && (lower === 'si' || lower === 'sí' || lower === 'true' || lower.includes('polinomio'))) {
      return buildDiag('non_polynomial_accepted');
    }
  }
  try {
    parsePolynomialExpr(raw);
  } catch (err) {
    if (
      err &&
      ['negative_exponent', 'fractional_exponent', 'radical_on_variable', 'rational_expression'].includes(err.code)
    ) {
      return buildDiag('non_polynomial_accepted');
    }
  }

  // 2. Zero polynomial degree 0
  if (context.target === 'zero_poly_degree') {
    try {
      const val = parseNumberOrFraction(raw);
      if (val === 0) return buildDiag('zero_poly_degree_zero');
    } catch {}
  }

  // 3. Unordered polynomial leading coeff / degree confusion
  if (context.target === 'leading_coeff' || context.target === 'degree') {
    try {
      const val = parseNumberOrFraction(raw);
      if (
        (context.unorderedFirstCoeff !== undefined && Math.abs(val - Number(context.unorderedFirstCoeff)) < 1e-9) ||
        (context.unorderedFirstDeg !== undefined && Math.abs(val - Number(context.unorderedFirstDeg)) < 1e-9)
      ) {
        return buildDiag('wrong_leading_coeff_unordered');
      }
    } catch {}
  }

  // 4. Subtraction sign leak: P - Q where user only negated leading term of Q or added Q
  if (context.target === 'subtract' && context.P && context.Q) {
    try {
      const parsed = parsePolynomialExpr(raw);
      const P = normalizePoly(context.P);
      const Q = normalizePoly(context.Q);
      // Case A: added instead of subtracted
      if (polyEqual(parsed.coeffs, polyAdd(P, Q))) {
        return buildDiag('subtract_poly_sign_leak');
      }
      // Case B: subtracted only highest degree term of Q, added the lower-degree terms
      const degQ = polyDegree(Q);
      if (degQ !== null) {
        const leakQ = Q.map((c, idx) => (idx === degQ ? ratNeg(c) : c));
        if (polyEqual(parsed.coeffs, polyAdd(P, leakQ))) {
          return buildDiag('subtract_poly_sign_leak');
        }
      }
    } catch {}
  }

  // 5. Added degrees on sum/subtraction
  if (context.target === 'sum_degree') {
    try {
      const val = parseNumberOrFraction(raw);
      const degP = Number(context.degP ?? 0);
      const degQ = Number(context.degQ ?? 0);
      const actualDeg = Number(context.actualDeg ?? Math.max(degP, degQ));
      if (val === degP + degQ || (actualDeg < Math.max(degP, degQ) && val === Math.max(degP, degQ))) {
        return buildDiag('added_degrees_on_sum');
      }
    } catch {}
  }

  // 6, 7, 8. Ruffini / Remainder diagnostics
  if (context.P && (context.divisorRoot !== undefined || context.divisorA !== undefined)) {
    const P = normalizePoly(context.P);
    const a = context.divisorA !== undefined ? context.divisorA : 1;
    const b = context.divisorB !== undefined ? context.divisorB : context.divisorRoot;
    const r = Number(b) / Number(a);

    // 8. Unscaled non-monic quotient (forgot to divide quotient by a)
    if (Number(a) !== 1) {
      try {
        const ruf = ruffini(P, { a, b });
        const parsed = parsePolynomialExpr(raw);
        if (polyEqual(parsed.coeffs, ruf.quotientMonic)) {
          return buildDiag('ruffini_unscaled_nonmonic_quotient');
        }
      } catch {}
    }

    // 7. Forgot zero placeholders in Ruffini for incomplete polynomial
    const hasMissingZeros = P.some((c, i) => i < P.length - 1 && c.n === 0);
    if (hasMissingZeros) {
      const compactDesc = [...P].reverse().filter((c) => c.n !== 0);
      const compactPoly = polyFromDescending(compactDesc);
      try {
        const wrongRuf = ruffini(compactPoly, { a, b });
        if (context.target === 'remainder') {
          const val = parseNumberOrFraction(raw);
          if (Math.abs(val - (wrongRuf.remainder.n / wrongRuf.remainder.d)) < 1e-6) {
            return buildDiag('ruffini_forgot_missing_zero_coeff');
          }
        } else {
          const parsed = parsePolynomialExpr(raw);
          if (polyEqual(parsed.coeffs, wrongRuf.quotient)) {
            return buildDiag('ruffini_forgot_missing_zero_coeff');
          }
        }
      } catch {}
    }

    // 6. Sign error in Ruffini corner / Remainder Theorem (used -r instead of r)
    try {
      const oppRuf = ruffini(P, { a, b: -Number(b) });
      if (context.target === 'remainder') {
        const val = parseNumberOrFraction(raw);
        const oppRem = oppRuf.remainder.n / oppRuf.remainder.d;
        const trueRemObj = remainderTheorem(P, b, a).remainder;
        const trueRem = trueRemObj.n / trueRemObj.d;
        if (Math.abs(val - oppRem) < 1e-6 && Math.abs(oppRem - trueRem) > 1e-6) {
          return buildDiag('ruffini_sign_error');
        }
      } else {
        const parsed = parsePolynomialExpr(raw);
        if (polyEqual(parsed.coeffs, oppRuf.quotient)) {
          return buildDiag('ruffini_sign_error');
        }
      }
    } catch {}
  }

  // 9. Forgot leading coefficient in factored form
  if (context.expectedPoly) {
    try {
      const expP = normalizePoly(context.expectedPoly);
      const lc = leadingCoeff(expP);
      if (!isOneRat(lc)) {
        const { monic } = polyMonic(expP);
        const eq = equivalentPolyExpr(raw, formatMonicCheck(monic));
        if (eq.status === 'ok' && eq.equivalent) {
          return buildDiag('forgot_leading_coeff_factoring');
        }
      }
    } catch {}
  }

  // 10. Swapped p/q in Gauss theorem
  if (context.target === 'gauss_candidates' && context.P) {
    try {
      const gc = gaussCandidates(context.P);
      const inverted = new Set();
      for (const p of gc.pDivisors) {
        for (const q of gc.qDivisors) {
          inverted.add(q / p);
          inverted.add(-q / p);
        }
      }
      const normalSet = new Set(gc.candidates.map((c) => c.n / c.d));
      const userSet = parseSetOrIntervalExactas(raw);
      if (userSet.kind === 'finite_set' && userSet.values.length > 0) {
        const hasSwapped = userSet.values.some(
          (v) =>
            Array.from(inverted).some((inv) => Math.abs(v - inv) < 1e-6) &&
            !Array.from(normalSet).some((nrm) => Math.abs(v - nrm) < 1e-6)
        );
        if (hasSwapped) return buildDiag('swapped_p_q_in_gauss');
      } else {
        const val = parseNumberOrFraction(raw);
        if (
          Array.from(inverted).some((inv) => Math.abs(val - inv) < 1e-6) &&
          !Array.from(normalSet).some((nrm) => Math.abs(val - nrm) < 1e-6)
        ) {
          return buildDiag('swapped_p_q_in_gauss');
        }
      }
    } catch {}
  }

  return null;
}

function formatMonicCheck(monicPoly) {
  return monicPoly
    .map((c, deg) => {
      if (c.n === 0) return '';
      const coeff = `${c.n}/${c.d}`;
      return deg === 0 ? coeff : `${coeff}*x^${deg}`;
    })
    .filter(Boolean)
    .join(' + ') || '0';
}

export function validatePolynomialAttempt({ kind, input, expected, requireForm = null, diagContext = {} }) {
  const raw = String(input ?? '').trim();
  if (!raw) return { empty: true, ok: false };

  if (kind === 'number') {
    try {
      const vUser = parseNumberOrFraction(raw);
      const vExp = typeof expected === 'number' ? expected : parseNumberOrFraction(String(expected));
      if (Math.abs(vUser - vExp) < 1e-6) return { ok: true };
      return { ok: false, diagnostic: diagnosePolynomial(raw, diagContext) };
    } catch {
      return { ok: false, syntaxError: 'Ingresá un número entero, decimal o fracción como -3/2.' };
    }
  }

  if (kind === 'set' || kind === 'interval') {
    try {
      if (equivalentSetExactas(raw, expected)) return { ok: true };
      return { ok: false, diagnostic: diagnosePolynomial(raw, diagContext) };
    } catch (err) {
      return { ok: false, syntaxError: err.message };
    }
  }

  // polynomial expression
  const eq = equivalentPolyExpr(raw, expected, requireForm);
  if (eq.status === 'syntax_error') {
    const diag = diagnosePolynomial(raw, diagContext);
    if (diag && diag.id === 'non_polynomial_accepted') {
      return { ok: false, diagnostic: diag };
    }
    return { ok: false, syntaxError: eq.error };
  }
  if (eq.equivalent && eq.sameForm) return { ok: true };
  if (eq.equivalent && !eq.sameForm) {
    return {
      ok: false,
      equivalentWrongForm: true,
      incompleteFactorization: eq.incompleteFactorization,
    };
  }
  return { ok: false, diagnostic: diagnosePolynomial(raw, diagContext) };
}
