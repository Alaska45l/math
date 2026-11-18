/**
 * @file js/modules/racionales-irracionales/logic.js
 * Unified mathematical & diagnostic facade for Unit 07 (Racionales e Irracionales).
 * Re-exports racionales.js, irracionales.js, expr.js and implements the 10-rule
 * diagnoseRationalIrrational() cognitive detector plus validateRiAttempt().
 *
 * Pure Vanilla ES2023. Zero DOM. Zero eval. Zero new Function. Zero Unicode emojis.
 */

export * from './expr.js';
export * from './racionales.js';
export * from './irracionales.js';
export {
  rat,
  ratFromNumber,
  ratToNumber,
  ratToString,
  polyFromDescending,
  formatPoly,
  factorPolynomial,
  polyAdd,
  polySub,
  polyMul,
  polyScale,
  polyPow,
  polyDiv,
  polyGcd,
  polyLcm,
  polyLcmMany,
  MINUS_CHAR,
} from '../../core/math/polynomials.js';

import {
  parseRationalExpr,
  equivalentRationalExpr,
  parseNumberOrFraction,
  parseOrderedPair,
  parseSetOrIntervalExactas,
  equivalentSetExactas,
  parseAsymptoteEq,
  equivalentIrrationalExpr,
  approxEq,
} from './expr.js';
import { RI_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';

/**
 * Canonical 10 cognitive diagnostic metadata entries (6 rational + 4 irrational).
 */
export const RI_DIAGNOSTICS = Object.freeze({
  lost_excluded_domain_on_cancel: {
    id: 'lost_excluded_domain_on_cancel',
    competencyId: 'rational.simplification_lcm_and_operations',
    pose: 'lentes-brillo',
    category: 'conceptual',
    message:
      '¡Ojo con el dominio fantasma! Al simplificar un factor (x − a) de arriba y abajo, la fórmula se achica pero los valores que anulaban el denominador original siguen prohibidos en el dominio.',
  },
  cancelled_terms_instead_of_factors: {
    id: 'cancelled_terms_instead_of_factors',
    competencyId: 'rational.simplification_lcm_and_operations',
    pose: 'unamused',
    category: 'procedural',
    message:
      'No podés tachar sumandos separados por + o −. Solo se simplifican factores que multiplican a todo el numerador y a todo el denominador.',
  },
  wrong_lcm_product_instead_of_lcm: {
    id: 'wrong_lcm_product_instead_of_lcm',
    competencyId: 'rational.simplification_lcm_and_operations',
    pose: 'pensativa',
    category: 'procedural',
    message:
      'Revisá el denominador común M(x) y el ajuste de cada numerador: tomá cada factor primo con su mayor exponente (no repitas factores comunes multiplicando a ciegas) y multiplicá arriba por lo que le falta.',
  },
  accepted_excluded_root_in_equation: {
    id: 'accepted_excluded_root_in_equation',
    competencyId: 'rational.equations_and_inequalities',
    pose: 'panico',
    category: 'conceptual',
    message:
      '¡Alerta de división por cero! Ese valor anula un denominador original de la ecuación o inecuación, así que queda afuera del dominio (y en inecuaciones siempre lleva paréntesis abierto).',
  },
  hole_vs_va_multiplicity_confusion: {
    id: 'hole_vs_va_multiplicity_confusion',
    competencyId: 'rational.domain_holes_and_asymptotes',
    pose: 'sospecha',
    category: 'conceptual',
    message:
      'Compará las multiplicidades en el punto excluido: si mult_P(a) >= mult_Q(a), el factor se cancela y deja un punto agujero (cuya altura se calcula en la simplificada, sin entrar en C₀). Si mult_P(a) < mult_Q(a), dispara una asíntota vertical.',
  },
  inverted_ha_degree_or_coeff_ratio: {
    id: 'inverted_ha_degree_or_coeff_ratio',
    competencyId: 'rational.domain_holes_and_asymptotes',
    pose: 'evaluando',
    category: 'representation',
    message:
      'Revisá la asíntota horizontal: se divide coeficiente principal de arriba (a_n) sobre el de abajo (b_m) cuando tienen igual grado (mirando signos aun si el denominador está desordenado como 3 − x), da y = 0 si gr(P) < gr(Q) y no tiene A.H. si gr(P) > gr(Q).',
  },
  even_vs_odd_radical_domain_confusion: {
    id: 'even_vs_odd_radical_domain_confusion',
    competencyId: 'irrational.domain_and_radical_equations',
    pose: 'sospecha',
    category: 'conceptual',
    message:
      'Revisá el índice de la raíz y dónde está ubicada: índice par exige radicando >= 0 (o > 0 estricto si está en el denominador, y recordá invertir la desigualdad si dividís por un negativo). Un índice impar admite radicandos negativos en ℝ.',
  },
  accepted_extraneous_squaring_root: {
    id: 'accepted_extraneous_squaring_root',
    competencyId: 'irrational.domain_and_radical_equations',
    pose: 'lentes-brillo',
    category: 'conceptual',
    message:
      '¡Cayó una solución extraviada! Elevar al cuadrado es irreversible y puede fabricar raíces fantasma donde la raíz cuadrada (siempre >= 0) queda igualada a un miembro derecho negativo. Verificá siempre en la ecuación original.',
  },
  distributed_radical_over_sum: {
    id: 'distributed_radical_over_sum',
    competencyId: 'irrational.domain_and_radical_equations',
    pose: 'colapso',
    category: 'procedural',
    message:
      'Ni la raíz ni el cuadrado se distribuyen sobre una suma o resta: √(x² + 9) no es x + 3, y (√x + 2)² desarrolla un término cruzado 4√x.',
  },
  wrong_radical_image_or_piecewise_bound: {
    id: 'wrong_radical_image_or_piecewise_bound',
    competencyId: 'irrational.graphs_analysis_and_piecewise',
    pose: 'pensativa',
    category: 'representation',
    message:
      'Cuidado con el techo o piso de la raíz par: √g(x) >= 0 siempre, así que k·√g(x) + c arranca en c hacia +∞ si k > 0, o queda en (−∞; c] si k < 0. En tramos, verificá además los bordes abiertos o cerrados.',
  },
});

function buildDiag(id) {
  const base = RI_DIAGNOSTICS[id];
  const tax = RI_DIAGNOSTIC_TAXONOMY[id];
  if (!base) return null;
  return {
    id: base.id,
    competencyId: base.competencyId,
    pose: base.pose,
    category: base.category,
    shortLabel: tax?.shortLabel || base.id,
    message: base.message,
  };
}

/**
 * 10-rule cognitive diagnostic detector for Unit 07.
 */
export function diagnoseRationalIrrational(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  const norm = raw.replace(/[\u2212\u2013\u2014]/g, '-').replace(/\s+/g, '').toLowerCase();

  // Direct diagnosticMap lookup if provided on choices/checks
  if (context?.diagnosticMap && context.diagnosticMap[raw]) {
    return buildDiag(context.diagnosticMap[raw]);
  }

  // 1. lost_excluded_domain_on_cancel
  if (
    context?.target === 'domain_after_cancel' ||
    context?.target === 'function_equality' ||
    context?.target === 'rational_domain'
  ) {
    if (['r', 'ir', 'reales', 'ℝ', '(-inf;+inf)'].includes(norm)) {
      return buildDiag('lost_excluded_domain_on_cancel');
    }
    if (Array.isArray(context.cancelledRoots) && context.cancelledRoots.length > 0) {
      try {
        const parsedSet = parseSetOrIntervalExactas(raw);
        if (parsedSet.isAllReal) {
          return buildDiag('lost_excluded_domain_on_cancel');
        }
        const missingCancelled = context.cancelledRoots.some(
          (r) => !(parsedSet.excludedPoints || []).some((ep) => approxEq(ep, r, 1e-6))
        );
        if (missingCancelled) {
          return buildDiag('lost_excluded_domain_on_cancel');
        }
      } catch {}
    }
  }

  // 2. cancelled_terms_instead_of_factors
  if (context?.target === 'rational_simplify' || context?.target === 'rational_divide') {
    const trapPatterns = Array.isArray(context.cancelledTermsPatterns)
      ? context.cancelledTermsPatterns
      : ['x+3->3', 'x^2+x', 'x^2+2x', '3'];
    if (
      trapPatterns.some((pat) => norm === pat.replace(/\s+/g, '').toLowerCase()) ||
      (context.expectedSimplified && norm !== String(context.expectedSimplified).replace(/\s+/g, '').toLowerCase() &&
        /^(x\^2\+x|x\^2\+2x|3|1\+3|x-3\+x)$/.test(norm))
    ) {
      return buildDiag('cancelled_terms_instead_of_factors');
    }
  }

  // 3. wrong_lcm_product_instead_of_lcm
  if (context?.target === 'rational_lcm' || context?.target === 'rational_sum') {
    if (context.unfactoredProductExpr) {
      try {
        const eq = equivalentRationalExpr(raw, context.unfactoredProductExpr, { requireSameDomain: false });
        if (eq.equivalent && eq.algebraicallyEqual) {
          return buildDiag('wrong_lcm_product_instead_of_lcm');
        }
      } catch {}
    }
    if (Array.isArray(context.naiveDenominatorMatches)) {
      if (context.naiveDenominatorMatches.some((pat) => norm === pat.replace(/\s+/g, '').toLowerCase())) {
        return buildDiag('wrong_lcm_product_instead_of_lcm');
      }
    }
  }

  // 4. accepted_excluded_root_in_equation
  if (context?.target === 'rational_equation' || context?.target === 'rational_inequality') {
    if (Array.isArray(context.excludedRoots)) {
      try {
        const parsedSet = parseSetOrIntervalExactas(raw);
        const vals = parsedSet.values || [];
        if (context.excludedRoots.some((ex) => vals.some((v) => approxEq(v, ex, 1e-6)))) {
          return buildDiag('accepted_excluded_root_in_equation');
        }
        // Closed bracket on a pole in an inequality
        if (context.target === 'rational_inequality' && Array.isArray(parsedSet.intervals)) {
          const closedOnPole = parsedSet.intervals.some((iv) =>
            context.excludedRoots.some(
              (ex) =>
                (approxEq(iv.lo, ex, 1e-6) && !iv.loOpen) ||
                (approxEq(iv.hi, ex, 1e-6) && !iv.hiOpen)
            )
          );
          if (closedOnPole) {
            return buildDiag('accepted_excluded_root_in_equation');
          }
        }
      } catch {
        const num = Number(norm.replace(',', '.'));
        if (Number.isFinite(num) && context.excludedRoots.some((ex) => approxEq(num, ex, 1e-6))) {
          return buildDiag('accepted_excluded_root_in_equation');
        }
      }
    }
  }

  // 5. hole_vs_va_multiplicity_confusion
  if (
    context?.target === 'hole_vs_va' ||
    context?.target === 'hole_coords' ||
    context?.target === 'rational_zeros'
  ) {
    if (context.holeX !== undefined && context.target === 'rational_zeros') {
      try {
        const parsedSet = parseSetOrIntervalExactas(raw);
        if ((parsedSet.values || []).some((v) => approxEq(v, context.holeX, 1e-6))) {
          return buildDiag('hole_vs_va_multiplicity_confusion');
        }
      } catch {}
    }
    if (
      context.confusedKeywords &&
      context.confusedKeywords.some((kw) => norm.includes(kw.toLowerCase()))
    ) {
      return buildDiag('hole_vs_va_multiplicity_confusion');
    }
    if (context.target === 'hole_coords' && (norm.includes('0/0') || norm.includes('indefinido'))) {
      return buildDiag('hole_vs_va_multiplicity_confusion');
    }
  }

  // 6. inverted_ha_degree_or_coeff_ratio
  if (context?.target === 'horizontal_asymptote' || context?.target === 'vertical_asymptote') {
    try {
      const parsedAsym = parseAsymptoteEq(raw);
      if (
        (context.target === 'horizontal_asymptote' && parsedAsym.kind === 'vertical') ||
        (context.target === 'vertical_asymptote' && parsedAsym.kind === 'horizontal')
      ) {
        return buildDiag('inverted_ha_degree_or_coeff_ratio');
      }
      if (context.trapValues && parsedAsym.value !== null) {
        if (context.trapValues.some((tv) => approxEq(tv, parsedAsym.value, 1e-6))) {
          return buildDiag('inverted_ha_degree_or_coeff_ratio');
        }
      }
      if (context.expectNone && parsedAsym.kind === 'horizontal') {
        return buildDiag('inverted_ha_degree_or_coeff_ratio');
      }
    } catch {
      // Bare number or swapped axis without equation
      if (context.trapValues) {
        const num = Number(norm.replace(',', '.'));
        if (Number.isFinite(num) && context.trapValues.some((tv) => approxEq(tv, num, 1e-6))) {
          return buildDiag('inverted_ha_degree_or_coeff_ratio');
        }
      }
    }
  }

  // 7. even_vs_odd_radical_domain_confusion
  if (context?.target === 'irrational_domain') {
    try {
      const parsedSet = parseSetOrIntervalExactas(raw);
      if (context.isOddIndex && !parsedSet.isAllReal && !context.inDenominator) {
        return buildDiag('even_vs_odd_radical_domain_confusion');
      }
      if (!context.isOddIndex && parsedSet.isAllReal && context.expectedNotAllReal) {
        return buildDiag('even_vs_odd_radical_domain_confusion');
      }
      if (context.inDenominator && Array.isArray(parsedSet.intervals)) {
        const closedAtBoundary = parsedSet.intervals.some((iv) => !iv.loOpen || !iv.hiOpen);
        if (closedAtBoundary) {
          return buildDiag('even_vs_odd_radical_domain_confusion');
        }
      }
      if (context.flippedSignTrap && equivalentSetExactas(raw, context.flippedSignTrap)) {
        return buildDiag('even_vs_odd_radical_domain_confusion');
      }
    } catch {}
  }

  // 8. accepted_extraneous_squaring_root
  if (context?.target === 'irrational_equation' && Array.isArray(context.extraneousRoots)) {
    try {
      const parsedSet = parseSetOrIntervalExactas(raw);
      const vals = parsedSet.values || [];
      if (context.extraneousRoots.some((ex) => vals.some((v) => approxEq(v, ex, 1e-6)))) {
        return buildDiag('accepted_extraneous_squaring_root');
      }
    } catch {
      const num = Number(norm.replace(',', '.'));
      if (Number.isFinite(num) && context.extraneousRoots.some((ex) => approxEq(num, ex, 1e-6))) {
        return buildDiag('accepted_extraneous_squaring_root');
      }
    }
  }

  // 9. distributed_radical_over_sum
  if (
    /^(?:x\+3|x-3|x\+2|x\+4|x\^2\+9|sqrt\(x\)\+2|x\+2sqrt\(x\)\+4)$/.test(norm) &&
    context?.detectDistributedRadical
  ) {
    return buildDiag('distributed_radical_over_sum');
  }
  if (Array.isArray(context?.distributedTrapPatterns)) {
    if (context.distributedTrapPatterns.some((p) => norm === p.replace(/\s+/g, '').toLowerCase())) {
      return buildDiag('distributed_radical_over_sum');
    }
  }

  // 10. wrong_radical_image_or_piecewise_bound
  if (context?.target === 'irrational_image' || context?.target === 'piecewise_analysis') {
    try {
      const parsedSet = parseSetOrIntervalExactas(raw);
      if (context.target === 'irrational_image' && parsedSet.isAllReal) {
        return buildDiag('wrong_radical_image_or_piecewise_bound');
      }
      if (context.wrongReflectionTrap && equivalentSetExactas(raw, context.wrongReflectionTrap)) {
        return buildDiag('wrong_radical_image_or_piecewise_bound');
      }
      if (context.wrongOpenClosedTrap && equivalentSetExactas(raw, context.wrongOpenClosedTrap)) {
        return buildDiag('wrong_radical_image_or_piecewise_bound');
      }
    } catch {}
  }

  return null;
}

/**
 * Validates a student attempt across all check/challenge input kinds.
 */
export function validateRiAttempt({
  kind = 'number',
  input,
  expected,
  requireSameDomain = true,
  requireSimplified = false,
  diagContext = {},
} = {}) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return { ok: false, empty: true };
  }

  if (kind === 'number') {
    try {
      const numVal = parseNumberOrFraction(raw);
      const expVal = typeof expected === 'number' ? expected : parseNumberOrFraction(String(expected));
      if (approxEq(numVal, expVal, 1e-6)) {
        return { ok: true };
      }
      const diag = diagnoseRationalIrrational(raw, diagContext);
      return { ok: false, diagnostic: diag };
    } catch (err) {
      return { ok: false, syntaxError: err.message };
    }
  }

  if (kind === 'ordered_pair') {
    try {
      const pUser = parseOrderedPair(raw);
      const pExp = typeof expected === 'string' ? parseOrderedPair(expected) : expected;
      if (approxEq(pUser.x, pExp.x, 1e-6) && approxEq(pUser.y, pExp.y, 1e-6)) {
        return { ok: true };
      }
      const diag = diagnoseRationalIrrational(raw, diagContext);
      return { ok: false, diagnostic: diag };
    } catch (err) {
      return { ok: false, syntaxError: err.message };
    }
  }

  if (kind === 'set_or_interval' || kind === 'solution_set') {
    try {
      // Check domain first if raw has comma instead of semicolon
      parseSetOrIntervalExactas(raw);
      if (equivalentSetExactas(raw, expected)) {
        return { ok: true };
      }
      // Also allow bare single number if expected is a singleton {v}
      const diag = diagnoseRationalIrrational(raw, diagContext);
      return { ok: false, diagnostic: diag };
    } catch (err) {
      // Fallback: if solution_set and user typed a bare number like "3" for "{3}"
      if (kind === 'solution_set') {
        try {
          const val = parseNumberOrFraction(raw);
          const expSet = parseSetOrIntervalExactas(String(expected));
          if (expSet.kind === 'finite_set' && expSet.values.length === 1 && approxEq(val, expSet.values[0], 1e-6)) {
            return { ok: true };
          }
          const diag = diagnoseRationalIrrational(raw, diagContext);
          return { ok: false, diagnostic: diag };
        } catch {}
      }
      return { ok: false, syntaxError: err.message };
    }
  }

  if (kind === 'asymptote') {
    try {
      const uAsym = parseAsymptoteEq(raw);
      const eAsym = parseAsymptoteEq(String(expected));
      if (
        uAsym.kind === eAsym.kind &&
        ((uAsym.value === null && eAsym.value === null) ||
          (uAsym.value !== null && eAsym.value !== null && approxEq(uAsym.value, eAsym.value, 1e-6)))
      ) {
        return { ok: true };
      }
      const diag = diagnoseRationalIrrational(raw, diagContext);
      return { ok: false, diagnostic: diag };
    } catch (err) {
      const diag = diagnoseRationalIrrational(raw, diagContext);
      if (diag) return { ok: false, diagnostic: diag };
      return { ok: false, syntaxError: err.message };
    }
  }

  if (kind === 'rational_expr') {
    // Support optional appended domain check e.g. "(x-3)/(x+3); Dom: x != 0, -3" or pure expr
    const exprOnly = raw.split(';')[0].replace(/con\s+x\s*[≠!=].*$/i, '').trim();
    const res = equivalentRationalExpr(exprOnly, expected, {
      requireSameDomain,
      requireSimplified,
    });
    if (res.status === 'syntax_error') {
      return { ok: false, syntaxError: res.error };
    }
    if (res.equivalent) {
      return { ok: true };
    }
    if (res.status === 'domain_mismatch') {
      return {
        ok: false,
        domainMismatch: true,
        diagnostic: buildDiag('lost_excluded_domain_on_cancel'),
      };
    }
    if (res.status === 'unsimplified_rational') {
      return {
        ok: false,
        equivalentWrongForm: true,
        unsimplified: true,
      };
    }
    const diag = diagnoseRationalIrrational(exprOnly, diagContext);
    return { ok: false, diagnostic: diag };
  }

  if (kind === 'irrational_expr') {
    const res = equivalentIrrationalExpr(raw, expected);
    if (res.equivalent) return { ok: true };
    const diag = diagnoseRationalIrrational(raw, diagContext);
    if (diag) return { ok: false, diagnostic: diag };
    if (res.reason === 'syntax_error') return { ok: false, syntaxError: res.error };
    return { ok: false, diagnostic: null };
  }

  if (kind === 'text') {
    const normU = raw.toLowerCase().replace(/\s+/g, '');
    const normE = String(expected).toLowerCase().replace(/\s+/g, '');
    if (normU === normE) return { ok: true };
    return { ok: false, diagnostic: diagnoseRationalIrrational(raw, diagContext) };
  }

  return { ok: false, diagnostic: null };
}
