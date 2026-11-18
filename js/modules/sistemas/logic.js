/**
 * @file js/modules/sistemas/logic.js
 * Motor analítico puro para Sistemas de Ecuaciones Lineales 2x2:
 * resolución racional exacta en 3 métodos (sustitución, igualación, reducción),
 * clasificación SCD/SCI/SI, sistemas con parámetro k ∈ ℝ, reconstrucción desde gráfica,
 * validador de modelización verbal y motor cognitivo de diagnóstico (9 IDs).
 *
 * Zero DOM. Zero eval(). Zero new Function(). Zero emojis.
 */

import {
  MINUS,
  rat,
  ratFromNumber,
  ratFromString,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratAbs,
  ratSign,
  ratEq,
  ratToNumber,
  ratIsZero,
  ratIsOne,
  fmtRat,
  fmtNumberEsAR,
  parseSystemEquation,
  parseSystemPair,
  equivalentSystem2x2,
  parseSolutionSet2x2,
  equivalentSolutionSet2x2,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
} from './expr.js';
import { convertLinearForms, slopeFromPoints, perpendicularLineThrough } from '../lineal/logic.js';

export {
  MINUS,
  rat,
  ratFromNumber,
  ratFromString,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNeg,
  ratAbs,
  ratSign,
  ratEq,
  ratToNumber,
  ratIsZero,
  ratIsOne,
  fmtRat,
  fmtNumberEsAR,
  parseSystemEquation,
  parseSystemPair,
  equivalentSystem2x2,
  parseSolutionSet2x2,
  equivalentSolutionSet2x2,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
};

function toRat(v) {
  if (v && typeof v === 'object' && 'n' in v && 'd' in v) return rat(v.n, v.d);
  if (typeof v === 'number') return ratFromNumber(v);
  if (typeof v === 'string') return ratFromString(v);
  throw new TypeError(`Valor no racional: ${String(v)}`);
}

function normalizeSysInput(sys) {
  if (typeof sys === 'object' && sys !== null) {
    if ('eq1' in sys && 'eq2' in sys) {
      const parsed = parseSystemPair(sys.eq1, sys.eq2, sys.varNames || ['x', 'y']);
      if (!parsed.ok) throw new SyntaxError(parsed.errorMessage);
      return parsed;
    }
    return {
      a1: toRat(sys.a1),
      b1: toRat(sys.b1),
      c1: toRat(sys.c1),
      a2: toRat(sys.a2),
      b2: toRat(sys.b2),
      c2: toRat(sys.c2),
    };
  }
  throw new TypeError('Sistema 2x2 inválido.');
}

function fmtEqStd(a, b, c) {
  const parts = [];
  if (!ratIsZero(a)) {
    parts.push(ratIsOne(a) ? 'x' : ratEq(a, rat(-1)) ? `${MINUS}x` : `${fmtRat(a)}x`);
  }
  if (!ratIsZero(b)) {
    const absB = ratAbs(b);
    const termB = ratIsOne(absB) ? 'y' : `${fmtRat(absB)}y`;
    if (parts.length === 0) parts.push(ratSign(b) < 0 ? `${MINUS}${termB}` : termB);
    else parts.push(ratSign(b) < 0 ? `${MINUS} ${termB}` : `+ ${termB}`);
  }
  if (parts.length === 0) parts.push('0');
  return `${parts.join(' ')} = ${fmtRat(c)}`;
}

/* ==========================================================================
   1. Resolución Exacta 2x2 (Sustitución, Igualación, Reducción)
   ========================================================================== */

export function solveSystem2x2(rawSys) {
  const s = normalizeSysInput(rawSys);
  const { a1, b1, c1, a2, b2, c2 } = s;

  const row1Zero = ratIsZero(a1) && ratIsZero(b1);
  const row2Zero = ratIsZero(a2) && ratIsZero(b2);

  if ((row1Zero && !ratIsZero(c1)) || (row2Zero && !ratIsZero(c2))) {
    return {
      status: 'SI',
      delta: rat(0),
      deltaX: rat(0),
      deltaY: rat(0),
      solution: null,
      solutionText: '∅',
      line1: null,
      line2: null,
      steps: {
        substitution: ['Una ecuación degenerada afirma 0 = k ≠ 0: absurdo.', 'Conjunto solución S = ∅ (Sistema Incompatible).'],
        equalization: ['0 = k ≠ 0 produce contradicción inmediata.', 'S = ∅.'],
        reduction: ['Al reducir aparece 0 = k ≠ 0.', 'S = ∅.'],
      },
    };
  }

  if (row1Zero && row2Zero) {
    return {
      status: 'SCI',
      delta: rat(0),
      deltaX: rat(0),
      deltaY: rat(0),
      solution: null,
      solutionText: 'ℝ² (ambas identidades 0 = 0)',
      line1: null,
      line2: null,
      steps: {
        substitution: ['Ambas ecuaciones son 0 = 0.', 'Sistema Compatible Indeterminado.'],
        equalization: ['0 = 0 en ambas filas.', 'SCI.'],
        reduction: ['0 = 0.', 'SCI.'],
      },
    };
  }

  const delta = ratSub(ratMul(a1, b2), ratMul(a2, b1));
  const deltaX = ratSub(ratMul(c1, b2), ratMul(c2, b1));
  const deltaY = ratSub(ratMul(a1, c2), ratMul(a2, c1));

  const line1 = row1Zero ? null : convertLinearForms({ A: a1, B: b1, C: ratNeg(c1) });
  const line2 = row2Zero ? null : convertLinearForms({ A: a2, B: b2, C: ratNeg(c2) });

  const eq1Str = fmtEqStd(a1, b1, c1);
  const eq2Str = fmtEqStd(a2, b2, c2);

  if (ratIsZero(delta)) {
    const isSCI = (ratIsZero(deltaX) && ratIsZero(deltaY)) || row1Zero || row2Zero;
    if (isSCI) {
      const activeLine = line1 || line2;
      const paramText = activeLine?.explicit.valid
        ? `{(x; ${activeLine.explicit.text.replace('y = ', '')}) / x ∈ ℝ}`
        : `{(${fmtRat(activeLine.explicit.x0)}; y) / y ∈ ℝ}`;
      return {
        status: 'SCI',
        delta,
        deltaX,
        deltaY,
        solution: null,
        solutionText: paramText,
        line1,
        line2,
        steps: {
          substitution: [
            `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
            'Al despejar una incógnita en (1) y sustituir en (2), las variables se cancelan dando 0 = 0.',
            `Las dos ecuaciones representan la misma recta: S = ${paramText} (SCI).`,
          ],
          equalization: [
            `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
            `Ambas rectas tienen exactamente la misma pendiente y la misma ordenada al origen.`,
            `Igualarlas produce la identidad 0 = 0 ⇒ infinitas soluciones (SCI).`,
          ],
          reduction: [
            `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
            'Multiplicamos una ecuación para igualar coeficientes y al restar se anulan ambos miembros: 0x + 0y = 0.',
            'Identidad 0 = 0 ⇒ Sistema Compatible Indeterminado (SCI).',
          ],
        },
      };
    }

    return {
      status: 'SI',
      delta,
      deltaX,
      deltaY,
      solution: null,
      solutionText: '∅',
      line1,
      line2,
      steps: {
        substitution: [
          `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
          'Al despejar una incógnita en (1) y sustituir en (2), las variables se cancelan quedando 0 = constante ≠ 0.',
          'Contradicción imposible: las rectas son paralelas no coincidentes ⇒ S = ∅ (SI).',
        ],
        equalization: [
          `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
          'Ambas rectas tienen la misma pendiente pero distinta ordenada al origen.',
          'Al igualar se anula x quedando un absurdo ⇒ S = ∅ (SI).',
        ],
        reduction: [
          `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
          'Al eliminar una variable multiplicando y restando, la otra también se cancela pero queda 0 ≠ constante.',
          'Sin solución en ℝ² ⇒ S = ∅ (Sistema Incompatible).',
        ],
      },
    };
  }

  // SCD: solución única
  const x0 = ratDiv(deltaX, delta);
  const y0 = ratDiv(deltaY, delta);
  const solStr = `{(${fmtRat(x0)}; ${fmtRat(y0)})}`;

  // Construcción concreta de pasos para los 3 métodos
  let subSteps;
  if (!ratIsZero(b1)) {
    const m1 = ratDiv(ratNeg(a1), b1);
    const n1 = ratDiv(c1, b1);
    subSteps = [
      `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
      `Despejamos y de (1): y = ${fmtRat(m1)}x ${ratSign(n1) >= 0 ? '+ ' + fmtRat(n1) : MINUS + ' ' + fmtRat(ratAbs(n1))}`,
      `Sustituimos en (2) y agrupamos x: (${fmtRat(ratDiv(delta, b1))})x = ${fmtRat(ratDiv(deltaX, b1))} ⇒ x = ${fmtRat(x0)}`,
      `Reemplazamos x = ${fmtRat(x0)} para hallar y = ${fmtRat(y0)} ⇒ S = ${solStr}`,
    ];
  } else {
    subSteps = [
      `Sistema: (1) ${eq1Str}  |  (2) ${eq2Str}`,
      `De (1) despejamos directo x = ${fmtRat(x0)}`,
      `Sustituimos en (2) y despejamos y = ${fmtRat(y0)} ⇒ S = ${solStr}`,
    ];
  }

  let eqSteps;
  if (!ratIsZero(b1) && !ratIsZero(b2)) {
    const m1 = ratDiv(ratNeg(a1), b1);
    const n1 = ratDiv(c1, b1);
    const m2 = ratDiv(ratNeg(a2), b2);
    const n2 = ratDiv(c2, b2);
    eqSteps = [
      `Despejamos y en ambas: y = ${fmtRat(m1)}x + (${fmtRat(n1)})  y  y = ${fmtRat(m2)}x + (${fmtRat(n2)})`,
      `Igualamos: (${fmtRat(ratSub(m1, m2))})x = ${fmtRat(ratSub(n2, n1))} ⇒ x = ${fmtRat(x0)}`,
      `Evaluamos y = ${fmtRat(y0)} ⇒ S = ${solStr}`,
    ];
  } else {
    eqSteps = [
      `Despejamos x en ambas ecuaciones e igualamos para obtener y = ${fmtRat(y0)}`,
      `Reemplazando y = ${fmtRat(y0)} resulta x = ${fmtRat(x0)} ⇒ S = ${solStr}`,
    ];
  }

  const redSteps = [
    `Multiplicamos (1) por ${fmtRat(b2)} y (2) por ${fmtRat(b1)} para igualar los coeficientes de y.`,
    `Restamos miembro a miembro y eliminamos y: (${fmtRat(delta)})x = ${fmtRat(deltaX)} ⇒ x = ${fmtRat(x0)}`,
    `Sustituimos x = ${fmtRat(x0)} en (1) para obtener y = ${fmtRat(y0)} ⇒ S = ${solStr}`,
  ];

  return {
    status: 'SCD',
    delta,
    deltaX,
    deltaY,
    solution: { x: x0, y: y0 },
    solutionText: solStr,
    line1,
    line2,
    steps: {
      substitution: subSteps,
      equalization: eqSteps,
      reduction: redSteps,
    },
  };
}

export function classifySystem2x2(rawSys) {
  const solved = solveSystem2x2(rawSys);
  const { line1, line2, status, delta } = solved;

  let geometricDescription;
  if (status === 'SCD') {
    geometricDescription = 'Rectas secantes: se cortan en un único punto P(x₀; y₀).';
  } else if (status === 'SCI') {
    geometricDescription = 'Rectas paralelas coincidentes: comparten todos sus puntos.';
  } else {
    geometricDescription = 'Rectas paralelas no coincidentes: jamás se cortan.';
  }

  return {
    status,
    geometricDescription,
    solution: solved.solution,
    solutionText: solved.solutionText,
    slope1: line1?.explicit?.valid ? line1.explicit.m : null,
    intercept1: line1?.explicit?.valid ? line1.explicit.b : null,
    slope2: line2?.explicit?.valid ? line2.explicit.m : null,
    intercept2: line2?.explicit?.valid ? line2.explicit.b : null,
    // Ampliación didáctica explícita (no atribuida al cuadernillo)
    didacticDeterminantNote: `Indicador Δ = ab' − a'b = ${fmtRat(delta)} (${ratIsZero(delta) ? 'rectas paralelas o coincidentes' : 'rectas secantes con corte único'}).`,
  };
}

/* ==========================================================================
   2. Sistemas con Parámetro k ∈ ℝ (Ej. 12a, 12b, 21h)
   ========================================================================== */

function toAffine(coeff) {
  if (typeof coeff === 'number' || typeof coeff === 'string' || (coeff && 'n' in coeff)) {
    return { k: rat(0), c: toRat(coeff) };
  }
  return {
    k: toRat(coeff.kCoeff ?? coeff.k ?? 0),
    c: toRat(coeff.constCoeff ?? coeff.c ?? 0),
  };
}

function evalAffine(aff, kRat) {
  return ratAdd(ratMul(aff.k, kRat), aff.c);
}

// Producto de dos afines (ak*K + ac)*(bk*K + bc) -> cuadrático { q2, q1, q0 }
function mulAffine(a, b) {
  return {
    q2: ratMul(a.k, b.k),
    q1: ratAdd(ratMul(a.k, b.c), ratMul(a.c, b.k)),
    q0: ratMul(a.c, b.c),
  };
}

function subQuad(A, B) {
  return {
    q2: ratSub(A.q2, B.q2),
    q1: ratSub(A.q1, B.q1),
    q0: ratSub(A.q0, B.q0),
  };
}

function solveQuadraticRationals(poly) {
  const { q2, q1, q0 } = poly;
  if (ratIsZero(q2)) {
    if (ratIsZero(q1)) return [];
    return [ratDiv(ratNeg(q0), q1)];
  }
  const disc = ratSub(ratMul(q1, q1), ratMul(rat(4), ratMul(q2, q0)));
  if (ratSign(disc) < 0) return [];
  const dNum = ratToNumber(disc);
  const sq = Math.round(Math.sqrt(dNum * disc.d * disc.d));
  // Verifica cuadrado perfecto racional exacto: (sq / disc.d)^2 == disc
  const rootDisc = rat(sq, disc.d);
  if (!ratEq(ratMul(rootDisc, rootDisc), disc)) {
    // Fallback numérico si fuera irracional (en UNMDP siempre son racionales exactos)
    const r1 = (-ratToNumber(q1) - Math.sqrt(dNum)) / (2 * ratToNumber(q2));
    const r2 = (-ratToNumber(q1) + Math.sqrt(dNum)) / (2 * ratToNumber(q2));
    return [ratFromNumber(r1), ratFromNumber(r2)];
  }
  const twoA = ratMul(rat(2), q2);
  const r1 = ratDiv(ratSub(ratNeg(q1), rootDisc), twoA);
  const r2 = ratDiv(ratAdd(ratNeg(q1), rootDisc), twoA);
  return ratEq(r1, r2) ? [r1] : [r1, r2].sort((u, v) => ratToNumber(u) - ratToNumber(v));
}

/**
 * Analiza un sistema 2x2 cuyos coeficientes dependen afinmente de un parámetro k:
 * spec = { a1, b1, c1, a2, b2, c2, excludedParams: [0], paramName: 'k' }
 */
export function analyzeParametricSystem(spec) {
  const a1 = toAffine(spec.a1);
  const b1 = toAffine(spec.b1);
  const c1 = toAffine(spec.c1);
  const a2 = toAffine(spec.a2);
  const b2 = toAffine(spec.b2);
  const c2 = toAffine(spec.c2);
  const excluded = (spec.excludedParams || []).map(toRat);
  const paramName = spec.paramName || 'k';

  const deltaPoly = subQuad(mulAffine(a1, b2), mulAffine(a2, b1));
  const critRoots = solveQuadraticRationals(deltaPoly);

  const isExcluded = (val) => excluded.some((ex) => ratEq(ex, val));

  const sciValues = [];
  const siValues = [];

  for (const r of critRoots) {
    if (isExcluded(r)) continue;
    const res = solveSystem2x2({
      a1: evalAffine(a1, r),
      b1: evalAffine(b1, r),
      c1: evalAffine(c1, r),
      a2: evalAffine(a2, r),
      b2: evalAffine(b2, r),
      c2: evalAffine(c2, r),
    });
    if (res.status === 'SCI') sciValues.push(r);
    else if (res.status === 'SI') siValues.push(r);
  }

  const allBad = [...excluded, ...sciValues, ...siValues]
    .filter((v, idx, arr) => arr.findIndex((u) => ratEq(u, v)) === idx)
    .sort((u, v) => ratToNumber(u) - ratToNumber(v));

  const scdCondition =
    allBad.length === 0
      ? `${paramName} ∈ ℝ`
      : `${paramName} ∉ {${allBad.map((v) => fmtRat(v)).join('; ')}}`;

  return {
    paramName,
    excludedParams: excluded,
    deltaPoly,
    criticalValues: critRoots,
    sciValues,
    siValues,
    scdExcludedSet: allBad,
    scdCondition,
    evaluateAt: (kVal) => {
      const kr = toRat(kVal);
      if (isExcluded(kr)) {
        return { excluded: true, reason: `${paramName} = ${fmtRat(kr)} está excluido del dominio del parámetro.` };
      }
      return {
        excluded: false,
        ...solveSystem2x2({
          a1: evalAffine(a1, kr),
          b1: evalAffine(b1, kr),
          c1: evalAffine(c1, kr),
          a2: evalAffine(a2, kr),
          b2: evalAffine(b2, kr),
          c2: evalAffine(c2, kr),
        }),
      };
    },
  };
}

/* ==========================================================================
   3. Reconstrucción desde Gráfica y Validación de Modelos Verbales
   ========================================================================== */

export function reconstructSystemFromLines(l1Spec, l2Spec) {
  const f1 = convertLinearForms(l1Spec);
  let f2;
  if (l2Spec && l2Spec.perpendicularToLine1 && l2Spec.point) {
    f2 = perpendicularLineThrough(f1, l2Spec.point);
  } else {
    f2 = convertLinearForms(l2Spec);
  }

  const sys = {
    a1: f1.canonical.A,
    b1: f1.canonical.B,
    c1: ratNeg(f1.canonical.C),
    a2: f2.canonical.A,
    b2: f2.canonical.B,
    c2: ratNeg(f2.canonical.C),
  };

  return {
    system: sys,
    line1: f1,
    line2: f2,
    solved: solveSystem2x2(sys),
  };
}

export function validateWordModel(expectedSys, userEq1, userEq2, varNames = ['x', 'y']) {
  const parsed = parseSystemPair(userEq1, userEq2, varNames);
  if (!parsed.ok) {
    return { valid: false, status: 'syntax_error', errorCode: parsed.errorCode, error: parsed.errorMessage };
  }
  const exp = normalizeSysInput(expectedSys);
  const equivalent = equivalentSystem2x2(parsed, exp);
  return {
    valid: equivalent,
    status: equivalent ? 'ok' : 'not_equivalent',
    parsed,
  };
}

/* ==========================================================================
   4. Motor Cognitivo de Diagnóstico (9 IDs Canónicos)
   ========================================================================== */

export const SYSTEM_DIAGNOSTIC_DEFINITIONS = Object.freeze({
  confused_sci_with_si: {
    id: 'confused_sci_with_si',
    pose: 'sospecha',
    tag: 'SCI vs SI',
    message:
      '¡Ojo! Confundiste Compatible Indeterminado con Incompatible: 0 = 0 es una identidad verdadera siempre (infinitas soluciones, SCI), mientras 0 = 5 es un absurdo imposible (sin solución, SI).',
  },
  forgot_to_find_second_variable: {
    id: 'forgot_to_find_second_variable',
    pose: 'pensativa',
    tag: 'Falta la otra coordenada',
    message:
      'La solución de un sistema 2×2 es un par ordenado (x₀; y₀) con ambas coordenadas en ese orden exacto (primero x, después y).',
  },
  sign_error_in_elimination_or_substitution: {
    id: 'sign_error_in_elimination_or_substitution',
    pose: 'colapso',
    tag: 'Signo al distribuir o restar',
    message:
      'Cuidado al distribuir el signo menos adelante de un paréntesis o fracción: −(2y − 1) cambia ambos signos a −2y + 1, no −2y − 1.',
  },
  discount_instead_of_paid_percentage: {
    id: 'discount_instead_of_paid_percentage',
    pose: 'lentes-brillo',
    tag: 'Descuento vs Monto pagado',
    message:
      'Trampa clásica de porcentaje: si pagás en caja con 10% de descuento, pagás el 90% del precio (0,90·h), ¡no el 10% (0,10·h)!',
  },
  reversed_comparison_difference: {
    id: 'reversed_comparison_difference',
    pose: 'unamused',
    tag: 'Orden de la diferencia',
    message:
      'Revisá quién es mayor: si "h excede en 5500 a c", entonces h es más grande y la resta es h − 5500 = c (o h = c + 5500), nunca h + 5500 = c.',
  },
  ignored_parametric_exclusion_domain: {
    id: 'ignored_parametric_exclusion_domain',
    pose: 'lentes-brillo',
    tag: 'Dominio del parámetro',
    message:
      '¡Atención a la restricción inicial del enunciado! Si el problema exige k ∈ ℝ − {0} (o a ∈ ℝ − {1}), ese valor prohibido jamás puede entrar en la respuesta de SCD.',
  },
  only_checked_slopes_ignored_intercepts: {
    id: 'only_checked_slopes_ignored_intercepts',
    pose: 'pensativa',
    tag: 'Faltó chequear la ordenada',
    message:
      'Que Δ = 0 (o m₁ = m₂) solo te dice que las rectas son paralelas. Para saber si coinciden (SCI) o están separadas (SI), tenés que verificar también los términos independientes.',
  },
  wrong_perpendicular_reconstruction: {
    id: 'wrong_perpendicular_reconstruction',
    pose: 'sospecha',
    tag: 'Reconstrucción perpendicular',
    message:
      'Al reconstruir una recta perpendicular desde el gráfico, recordá que su pendiente debe ser opuesta e inversa (−1/m₁), no +1/m₁ ni −m₁.',
  },
  unrealistic_or_unchecked_solution_in_context: {
    id: 'unrealistic_or_unchecked_solution_in_context',
    pose: 'unamused',
    tag: 'Factibilidad física o geométrica',
    message:
      'En problemas reales, chequeá que la solución tenga sentido físico o geométrico: no existen cantidades negativas de monedas/personas ni rectángulos de sistema incompatible.',
  },
  comma_instead_of_semicolon: {
    id: 'comma_instead_of_semicolon',
    pose: 'sospecha',
    tag: 'Notación de Exactas',
    message:
      'En Exactas UNMDP el par ordenado se separa con punto y coma ";", por ejemplo {(6; 1)}, reservando la coma "," para decimales.',
  },
});

export function diagnoseSystem(userInput, context = {}) {
  const raw = String(userInput ?? '').trim();
  if (!raw) return null;

  if (context.diagnosticMap && context.diagnosticMap[raw]) {
    const id = context.diagnosticMap[raw];
    return SYSTEM_DIAGNOSTIC_DEFINITIONS[id] || null;
  }

  if (
    (context.kind === 'pair' || context.kind === 'solution' || context.kind === 'set') &&
    raw.includes(',') &&
    !raw.includes(';') &&
    !/^[+-]?\d+,\d+$/.test(raw) &&
    !/x\s*=.*y\s*=/i.test(raw)
  ) {
    return SYSTEM_DIAGNOSTIC_DEFINITIONS.comma_instead_of_semicolon;
  }

  const target = context.target || '';

  // 1. Confusión SCI vs SI
  if (target === 'classify' || target === 'solution_set') {
    const lower = raw.toLowerCase();
    if (context.expectedStatus === 'SCI' && (lower.includes('si') || lower.includes('vacio') || lower.includes('vacío') || lower.includes('∅'))) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.confused_sci_with_si;
    }
    if (context.expectedStatus === 'SI' && (lower.includes('sci') || lower.includes('infinita') || lower.includes('indeterminad'))) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.confused_sci_with_si;
    }
  }

  // 2. Olvidó la segunda variable o invirtió (y0; x0)
  if (context.solution) {
    try {
      const single = parseNumberOrFraction(raw);
      if (Math.abs(single - context.solution.x) < 1e-5 || Math.abs(single - context.solution.y) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.forgot_to_find_second_variable;
      }
    } catch {}
    try {
      const pt = parseOrderedPair(raw.replace(/^\{|\}$/g, ''));
      if (Math.abs(pt.x - context.solution.y) < 1e-5 && Math.abs(pt.y - context.solution.x) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.forgot_to_find_second_variable;
      }
      if (Math.abs(pt.x - context.solution.x) < 1e-5 && Math.abs(pt.y + context.solution.y) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.sign_error_in_elimination_or_substitution;
      }
      if (Math.abs(pt.x + context.solution.x) < 1e-5 && Math.abs(pt.y - context.solution.y) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.sign_error_in_elimination_or_substitution;
      }
    } catch {}
  }

  // 3. Error de signo en eliminación/sustitución (ej. x=0 cuando la solución es otra)
  if (target === 'solve_sign' && context.signTrapValues) {
    try {
      const pt = parseOrderedPair(raw.replace(/^\{|\}$/g, ''));
      if (
        context.signTrapValues.some(
          (t) => Math.abs(pt.x - t.x) < 1e-5 && Math.abs(pt.y - t.y) < 1e-5
        )
      ) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.sign_error_in_elimination_or_substitution;
      }
    } catch {}
  }

  // 4. Descuento vs monto pagado (0.10 en lugar de 0.90)
  if (target === 'word_discount') {
    if (/0[.,]10|0[.,]05|10%|5%/.test(raw)) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.discount_instead_of_paid_percentage;
    }
    if (/\+\s*5500/.test(raw)) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.reversed_comparison_difference;
    }
  }

  // 5. Parámetro excluido omitido en conjunto SCD
  if (target === 'parametric_set' && context.excludedVal !== undefined) {
    if (!raw.includes(String(context.excludedVal))) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.ignored_parametric_exclusion_domain;
    }
  }

  // 6. Parámetro SCI vs SI intercambiado (solo miró Δ = 0 sin revisar ordenadas)
  if (target === 'parametric_k') {
    try {
      const val = parseNumberOrFraction(raw);
      if (context.excludedVal !== undefined && Math.abs(val - context.excludedVal) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.ignored_parametric_exclusion_domain;
      }
      if (context.oppositeCritVal !== undefined && Math.abs(val - context.oppositeCritVal) < 1e-5) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.only_checked_slopes_ignored_intercepts;
      }
    } catch {}
  }

  // 7. Reconstrucción perpendicular errónea
  if (target === 'perp_graph' && context.wrongPerpPoint) {
    try {
      const pt = parseOrderedPair(raw.replace(/^\{|\}$/g, ''));
      if (
        Math.abs(pt.x - context.wrongPerpPoint.x) < 1e-3 &&
        Math.abs(pt.y - context.wrongPerpPoint.y) < 1e-3
      ) {
        return SYSTEM_DIAGNOSTIC_DEFINITIONS.wrong_perpendicular_reconstruction;
      }
    } catch {}
  }

  // 8. Solución irreal en contexto (negativos o no verificar SI)
  if (target === 'context_feasibility') {
    if (raw.includes('-')) {
      return SYSTEM_DIAGNOSTIC_DEFINITIONS.unrealistic_or_unchecked_solution_in_context;
    }
  }

  return null;
}
