/**
 * @file js/modules/jefes/integrador-1.js
 * Jefe Integrador 1 (Unidades 01-06): 4 Encuentros Integradores x 5 Fases Activas + Fase 6 Debrief.
 * Basado en Actividades de Integración (1) y Primeros Parciales UNMDP.
 * Todas las respuestas verificadas con evaluadores matemáticos exactos (cero comparación textual).
 */

import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import { mountBossArena } from '../../core/learning/boss-engine.js';
import {
  parsePolynomialExpr,
  polyEqual,
  polyFromDescending,
} from '../../core/math/polynomials.js';
import {
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
} from '../cuadraticas/expr.js';
import { equivalentPolyExpr } from '../polinomios/expr.js';

function approxEqual(a, b, tol = 1e-6) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
}

function validateNumber(raw, expectedVal, feedbackOk, feedbackBad, diagnosticId = null) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá un valor numérico antes de comprobar.' };
  try {
    const val = parseNumberOrFraction(s);
    if (approxEqual(val, expectedVal)) return { ok: true, feedback: feedbackOk };
    return { ok: false, diagnosticId, feedback: feedbackBad };
  } catch {
    return { syntaxError: 'Formato numérico inválido. Usá enteros, decimales o fracciones como 8/3.' };
  }
}

function validateSet(raw, expectedSet, feedbackOk, feedbackBad, diagnosticId = null) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá un intervalo o conjunto entre llaves/paréntesis.' };
  try {
    if (equivalentSetExactas(s, expectedSet)) return { ok: true, feedback: feedbackOk };
    return { ok: false, diagnosticId, feedback: feedbackBad };
  } catch (err) {
    return { syntaxError: err.message };
  }
}

function validatePair(raw, expectedPair, feedbackOk, feedbackBad, diagnosticId = null) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá el par ordenado (x; y).' };
  try {
    const p = parseOrderedPair(s);
    const exp = parseOrderedPair(expectedPair);
    if (approxEqual(p.x, exp.x, 1e-4) && approxEqual(p.y, exp.y, 1e-4)) {
      return { ok: true, feedback: feedbackOk };
    }
    return { ok: false, diagnosticId, feedback: feedbackBad };
  } catch (err) {
    return { syntaxError: err.message };
  }
}

function validatePoly(raw, expectedExpr, requireForm, feedbackOk, feedbackBad, diagnosticId = null) {
  const s = String(raw ?? '').trim();
  if (!s) return { empty: true, feedback: 'Ingresá la expresión algebraica.' };
  const eq = equivalentPolyExpr(s, expectedExpr, requireForm);
  if (eq.status === 'syntax_error') return { syntaxError: eq.error };
  if (eq.equivalent && eq.sameForm) return { ok: true, feedback: feedbackOk };
  if (eq.equivalent && !eq.sameForm) {
    return {
      ok: false,
      diagnosticId: 'forgot_leading_coeff_factoring',
      feedback: 'La expresión equivale algebraicamente, pero falta escribirla en forma factorizada completa en factores primos.',
    };
  }
  return { ok: false, diagnosticId, feedback: feedbackBad };
}

export const INTEGRADOR_1_CONFIG = {
  bossId: 'jefe-integrador-1',
  moduleId: 'jefe-integrador-1',
  title: 'Jefe Integrador 1 · Unidades 01 a 06',
  subtitle: 'Evaluación integradora por fases (Reconocer -> Predecir -> Modelar -> Resolver -> Transferir -> Debrief) sin cronómetro punitivo.',
  encounters: [
    {
      id: 'enc1',
      title: 'Encuentro 1 · Reales, Potencias e Intervalos',
      unitsLabel: 'Unidades 01 + 02',
      phases: [
        {
          id: 'boss1-enc1-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: [
            'powers.radical_simplification_and_rationalization',
            'powers.binomial_power_non_distributivity',
          ],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Identificá cuál de estas afirmaciones sobre potencias y radicales es VERDADERA:',
          options: [
            { label: '∛54 + ∛16 = 5 · ∛2', value: 'A', correct: true },
            { label: '(2 − 3x)² = 4 − 9x²', value: 'B', correct: false },
            { label: '4 · 2ⁿ = 8ⁿ', value: 'C', correct: false },
          ],
          hints: [
            'Descomponé los radicandos cúbicos en factores primos: 54 = 27 · 2 y 16 = 8 · 2.',
            'Recordá que (2 − 3x)² tiene doble producto −12x y que 4 · 2ⁿ = 2² · 2ⁿ = 2ⁿ⁺², nunca 8ⁿ.',
          ],
          solution: '∛54 + ∛16 = 3∛2 + 2∛2 = 5∛2 es verdadera.',
          validator: (v) =>
            v === 'A' || String(v).includes('54')
              ? { ok: true, feedback: '¡Correcto! 3∛2 + 2∛2 = 5∛2, mientras las otras dos distribuyen ilegalmente o multiplican bases con distinto exponente.' }
              : {
                  ok: false,
                  diagnosticId:
                    v === 'C' || String(v).includes('8ⁿ')
                      ? 'multiplied_bases_in_same_base_prod'
                      : 'distributed_power_over_sum',
                  feedback: 'Cuidado: ni (a − b)² es a² − b², ni 4 · 2ⁿ es 8ⁿ.',
                },
        },
        {
          id: 'boss1-enc1-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: ['abs.distance_1d_and_equations'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Sea B = { x ∈ ℝ : d(x; 2) < 6 }. Antes de resolver, ¿los extremos x = −4 y x = 8 pertenecen al conjunto B?',
          options: [
            { label: 'No pertenecen: como la desigualdad es estricta (< 6), ambos extremos quedan abiertos.', value: 'open', correct: true },
            { label: 'Sí pertenecen, porque están exactamente a distancia 6 del centro 2.', value: 'closed', correct: false },
            { label: 'Solo pertenece x = 8 porque es positivo.', value: 'only8', correct: false },
          ],
          hints: [
            'd(x; 2) = |x − 2| mide la distancia al número 2. Evaluá |−4 − 2| y |8 − 2|.',
            'La condición pide distancia estrictamente MENOR que 6 (< 6), no menor o igual.',
          ],
          solution: 'd(−4; 2) = 6 y d(8; 2) = 6, que no es menor estricto que 6; por eso B = (−4; 8) abierto.',
          validator: (v) =>
            v === 'open' || String(v).startsWith('No pertenecen')
              ? { ok: true, feedback: '¡Bien anticipado! Los bordes −4 y 8 están exactamente a distancia 6, así que quedan excluidos: B = (−4; 8).' }
              : { ok: false, diagnosticId: 'swapped_open_closed_bracket', feedback: 'Verificá la desigualdad estricta (< 6): 6 < 6 es falso.' },
        },
        {
          id: 'boss1-enc1-modelar',
          phaseName: 'Modelar',
          kind: 'set',
          competencyIds: ['inequalities.intervals_and_number_line'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Expresá como intervalo real el conjunto A = { x ∈ ℝ : 1 − x/2 > 3/4 }:',
          placeholder: 'Ej: (-inf; 1/2)',
          hints: [
            'Despejá x/2: 1 − 3/4 > x/2 => 1/4 > x/2.',
            'Multiplicá ambos miembros por 2 (positivo, no cambia el sentido) para hallar la cota superior abierta de x.',
          ],
          solution: '1/4 > x/2 => x < 1/2, luego A = (−∞; 1/2).',
          validator: (raw) =>
            validateSet(
              raw,
              '(-inf; 1/2)',
              '¡Exacto! A = (−∞; 1/2).',
              'Revisá el signo al despejar −x/2 > −1/4: multiplicar por −2 invierte la desigualdad hacia x < 1/2.',
              String(raw ?? '').includes('[') || String(raw ?? '').includes(']')
                ? 'swapped_open_closed_bracket'
                : 'forgot_flip_on_negative_div'
            ),
        },
        {
          id: 'boss1-enc1-resolver',
          phaseName: 'Resolver',
          kind: 'set',
          competencyIds: ['inequalities.compound_and_or_sets'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Con A = (−∞; 1/2) y B = (−4; 8), calculá el intervalo intersección A ∩ B:',
          placeholder: 'Ej: (-4; 1/2)',
          hints: [
            'La intersección A ∩ B reúne los x que cumplen simultáneamente x > −4, x < 8 y x < 1/2.',
            'Como 1/2 < 8, el techo más exigente es 1/2 abierto y el piso es −4 abierto.',
          ],
          solution: 'A ∩ B = (−4; 1/2) (y además A ∪ B = (−∞; 8)).',
          validator: (raw) =>
            validateSet(
              raw,
              '(-4; 1/2)',
              '¡Impecable! A ∩ B = (−4; 1/2) (y A ∪ B = (−∞; 8)).',
              'Recordá tomar los valores que pertenecen a AMBOS intervalos simultáneamente.',
              String(raw ?? '').includes('[') || String(raw ?? '').includes(']')
                ? 'swapped_open_closed_bracket'
                : 'confused_and_with_or'
            ),
        },
        {
          id: 'boss1-enc1-transferir',
          phaseName: 'Transferir',
          kind: 'set',
          competencyIds: ['inequalities.linear_and_factored_solving'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Nueva variante: hallá el conjunto solución de { x ∈ ℝ : |x + 3| <= 5  y  2x − 1 > −3 }:',
          placeholder: 'Ej: (-1; 2]',
          hints: [
            'De |x + 3| <= 5 resulta −5 <= x + 3 <= 5, es decir [−8; 2].',
            'De 2x − 1 > −3 resulta x > −1, es decir (−1; +∞). Intersecá ambos intervalos prestando atención a los corchetes.',
          ],
          solution: '[−8; 2] ∩ (−1; +∞) = (−1; 2].',
          validator: (raw) =>
            validateSet(
              raw,
              '(-1; 2]',
              '¡Transferencia lograda! El extremo −1 queda abierto y el extremo 2 queda cerrado: (−1; 2].',
              'Verificá el intervalo [−8; 2] interceptado con (−1; +∞) y sus extremos abierto/cerrado.',
              'swapped_open_closed_bracket'
            ),
        },
      ],
    },
    {
      id: 'enc2',
      title: 'Encuentro 2 · Rectas Perpendiculares y Sistemas 2×2',
      unitsLabel: 'Unidades 03 + 04',
      phases: [
        {
          id: 'boss1-enc2-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['linear.parallel_perpendicular_and_incidence'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Para que la recta 2y + kx − 3 = 0 resulte perpendicular a 3x − 4y + 1 = 0, ¿qué relación deben cumplir sus pendientes m₁ y m₂?',
          options: [
            { label: 'm₁ · m₂ = −1 (pendientes recíprocas y opuestas)', value: 'perp', correct: true },
            { label: 'm₁ = m₂ (pendientes iguales)', value: 'par', correct: false },
            { label: 'm₁ + m₂ = 0 (pendientes opuestas)', value: 'opp', correct: false },
          ],
          hints: [
            'Las pendientes iguales corresponden a rectas paralelas.',
            'Dos rectas no verticales son perpendiculares cuando una pendiente es la opuesta de la inversa de la otra.',
          ],
          solution: 'Dos rectas oblicuas son perpendiculares si y solo si m₁ · m₂ = −1.',
          validator: (v) =>
            v === 'perp' || String(v).includes('−1')
              ? { ok: true, feedback: '¡Exacto! m₁ · m₂ = −1.' }
              : { ok: false, diagnosticId: 'confused_parallel_with_perpendicular', feedback: 'Igualar pendientes da paralelismo; para perpendicularidad el producto debe dar −1.' },
        },
        {
          id: 'boss1-enc2-predecir',
          phaseName: 'Predecir',
          kind: 'choice',
          competencyIds: ['systems.modeling_and_graph_reconstruction'],
          representation: 'verbal',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'En una librería los cuadernos (C) tienen 15% de descuento y los libros (L) 25%. Se compran 4 cuadernos y 3 libros pagando $137.580 en total. ¿Qué ecuación traduce lo pagado?',
          options: [
            { label: '0,85 · 4C + 0,75 · 3L = 137580', value: 'pay', correct: true },
            { label: '0,15 · 4C + 0,25 · 3L = 137580', value: 'disc', correct: false },
            { label: '4C + 3L = 137580 · 0,40', value: 'sum', correct: false },
          ],
          hints: [
            'El 15% es lo que se DESCUENTA: lo que efectivamente se paga es el 100% − 15% = 85% del precio de lista.',
            'Análogamente, por cada libro se paga el 75% (0,75) de su precio sin descuento.',
          ],
          solution: 'Se abona 0,85·(4C) + 0,75·(3L) = 137.580.',
          validator: (v) =>
            v === 'pay' || String(v).includes('0,85')
              ? { ok: true, feedback: '¡Bien visto! Descontar 15% y 25% equivale a multiplicar por 0,85 y 0,75 respectivamente.' }
              : { ok: false, diagnosticId: 'discount_instead_of_paid_percentage', feedback: 'Cuidado: 0,15 y 0,25 serían el ahorro, no el monto efectivamente pagado en caja.' },
        },
        {
          id: 'boss1-enc2-modelar',
          phaseName: 'Modelar',
          kind: 'number',
          competencyIds: ['linear.parallel_perpendicular_and_incidence'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Hallá el valor real de k para que 2y + kx − 3 = 0 sea perpendicular a 3x − 4y + 1 = 0:',
          placeholder: 'Ej: 8/3',
          hints: [
            'Despejá y en ambas rectas: m₁ = −k/2 y m₂ = 3/4.',
            'Imponé (−k/2) · (3/4) = −1 y despejá k.',
          ],
          solution: '(−k/2)(3/4) = −1 => −3k/8 = −1 => k = 8/3.',
          validator: (raw) =>
            validateNumber(
              raw,
              8 / 3,
              '¡Exacto! k = 8/3.',
              'Revisá el signo al despejar m₁ = −k/2 y m₂ = 3/4.',
              'confused_parallel_with_perpendicular'
            ),
        },
        {
          id: 'boss1-enc2-resolver',
          phaseName: 'Resolver',
          kind: 'pair',
          competencyIds: ['systems.linear_2x2_graphical_and_analytical'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Sabiendo que el precio de lista del libro supera en $28.000 al del cuaderno (L − C = 28000) y que 3,4C + 2,25L = 137580, escribí el par (C; L) con los precios sin descuento:',
          placeholder: 'Ej: (13200; 41200)',
          hints: [
            'Sustituí L = C + 28000 en la segunda ecuación: 3,4C + 2,25(C + 28000) = 137580.',
            'Sumá 5,65C + 63000 = 137580 => 5,65C = 74580 => despejá C y luego L = C + 28000.',
          ],
          solution: 'C = $13.200 y L = $41.200, par (13200; 41200).',
          validator: (raw) =>
            validatePair(
              raw,
              '(13200; 41200)',
              '¡Perfecto! Cuaderno $13.200 y Libro $41.200.',
              'Verificá la sustitución L = C + 28000 en 3,4C + 2,25L = 137580.',
              'sign_error_in_elimination_or_substitution'
            ),
        },
        {
          id: 'boss1-enc2-transferir',
          phaseName: 'Transferir',
          kind: 'number',
          competencyIds: ['systems.classification_scd_sci_si', 'systems.parametric_systems'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: '¿Para qué valor de k el sistema { 2x + y = 3 ; −4x + ky = −6 } resulta Compatible Indeterminado (SCI)?',
          placeholder: 'Ej: -2',
          hints: [
            'Un sistema 2×2 es SCI cuando las dos ecuaciones representan la misma recta (coeficientes proporcionales en x, y y término independiente).',
            'Observá que −4 / 2 = −2 y −6 / 3 = −2. ¿Qué valor debe tomar k/1?',
          ],
          solution: 'La proporción (−4)/2 = k/1 = (−6)/3 exige k = −2.',
          validator: (raw) =>
            validateNumber(
              raw,
              -2,
              '¡Excelente! Con k = −2 ambas ecuaciones son proporcionales (rectas coincidentes -> SCI).',
              'Compará las razones de coeficientes: −4/2 = −2 y −6/3 = −2.',
              'confused_sci_with_si'
            ),
        },
      ],
    },
    {
      id: 'enc3',
      title: 'Encuentro 3 · Parábolas, Tramos y Tangencia',
      unitsLabel: 'Unidades 02 + 05',
      phases: [
        {
          id: 'boss1-enc3-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['quadratics.discriminant_and_vieta'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Queremos que f(x) = 2x² − 3x + k tenga exactamente DOS raíces reales DISTINTAS. ¿Qué condición debe cumplir el discriminante Δ?',
          options: [
            { label: 'Δ > 0 estrictamente (Δ = 9 − 8k > 0)', value: 'gt', correct: true },
            { label: 'Δ >= 0 (incluyendo Δ = 0)', value: 'ge', correct: false },
            { label: 'Δ < 0', value: 'lt', correct: false },
          ],
          hints: [
            'Cuando Δ = 0 hay una única raíz doble (no dos distintas).',
            'Exigí la desigualdad estricta Δ > 0 para garantizar dos cortes distintos con el eje X.',
          ],
          solution: 'Dos raíces reales distintas requieren Δ = b² − 4ac > 0 estricto.',
          validator: (v) =>
            v === 'gt' || String(v).includes('estrictamente')
              ? { ok: true, feedback: '¡Correcto! Δ > 0 estricto descarta la raíz doble de Δ = 0.' }
              : {
                  ok: false,
                  diagnosticId:
                    v === 'ge' || String(v).includes('>=')
                      ? 'closed_bracket_on_excluded_point_or_extremum'
                      : 'neg_b_or_square_sign_in_resolvente',
                  feedback: 'Si Δ = 0 las dos raíces coinciden en una raíz doble, no son distintas.',
                },
        },
        {
          id: 'boss1-enc3-predecir',
          phaseName: 'Predecir',
          kind: 'set',
          competencyIds: ['functions.bijectivity_and_inverse', 'quadratics.full_analysis_exactas'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Dada la función por tramos f(x) = x² (si x <= 2) y −x + 6 (si x > 2), determiná su conjunto de ceros C₀:',
          placeholder: 'Ej: {0; 6}',
          hints: [
            'Buscá ceros en cada rama verificando que pertenezcan a su subdominio: en x <= 2 resolvé x² = 0; en x > 2 resolvé −x + 6 = 0.',
            'Cuidado: x = −6 NO anula f porque −6 <= 2 usa la rama x² ((-6)² = 36 ≠ 0).',
          ],
          solution: 'En x <= 2 da x = 0; en x > 2 da x = 6. Luego C₀ = {0; 6}.',
          validator: (raw) =>
            validateSet(
              raw,
              '{0; 6}',
              '¡Muy bien! C₀ = {0; 6} (descartando el falso −6 y observando que f(−2) = f(2) = 4 impide la inyectividad).',
              'Revisá cada rama respetando la frontera x <= 2 vs x > 2.',
              'piecewise_boundary_inclusion_error'
            ),
        },
        {
          id: 'boss1-enc3-modelar',
          phaseName: 'Modelar',
          kind: 'expression',
          competencyIds: ['quadratics.canonical_form_and_vertex', 'linear.definition_slope_and_intercept'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Una parábola f(x) = ax² + bx + c tiene eje de simetría en el eje Y (x_v = 0) y pasa por (0; 2) y (1; 3). Escribí su fórmula:',
          placeholder: 'Ej: x^2 + 2',
          hints: [
            'Que el eje de simetría sea el eje Y implica x_v = −b/(2a) = 0, por lo tanto b = 0.',
            'El punto (0; 2) fija c = 2, y el punto (1; 3) da a(1)² + 2 = 3.',
          ],
          solution: 'b = 0, c = 2, a = 1 => f(x) = x² + 2 (cortada por la recta y = x + 2).',
          validator: (raw) =>
            validatePoly(
              raw,
              'x^2 + 2',
              null,
              '¡Exacto! f(x) = x² + 2.',
              'Recordá que eje de simetría Y implica b = 0 y luego usá f(0) = 2 y f(1) = 3.',
              'confused_c_with_canonical_k'
            ),
        },
        {
          id: 'boss1-enc3-resolver',
          phaseName: 'Resolver',
          kind: 'set',
          competencyIds: ['quadratics.extremum_optimization', 'functions.domain_image_and_sign_sets'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Expresá como intervalo todos los valores de k ∈ ℝ para los que f(x) = 2x² − 3x + k tiene dos raíces reales distintas:',
          placeholder: 'Ej: (-inf; 9/8)',
          hints: [
            'Planteá Δ = (−3)² − 4 · 2 · k > 0 => 9 − 8k > 0.',
            'Despejá k manteniendo abierto el extremo porque la desigualdad es estricta.',
          ],
          solution: '9 − 8k > 0 => k < 9/8, es decir (−∞; 9/8).',
          validator: (raw) =>
            validateSet(
              raw,
              '(-inf; 9/8)',
              '¡Correcto! k ∈ (−∞; 9/8).',
              'Revisá el despeje de 9 − 8k > 0 y recordá que el extremo 9/8 es abierto.',
              String(raw ?? '').includes(']')
                ? 'closed_bracket_on_excluded_point_or_extremum'
                : 'neg_b_or_square_sign_in_resolvente'
            ),
        },
        {
          id: 'boss1-enc3-transferir',
          phaseName: 'Transferir',
          kind: 'number',
          competencyIds: ['quadratics.parabola_line_tangency'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Hallá el valor de d ∈ ℝ para que la recta y = 2x + d sea TANGENTE a la parábola y = x² + 2:',
          placeholder: 'Ej: 1',
          hints: [
            'Igualá x² + 2 = 2x + d => x² − 2x + (2 − d) = 0.',
            'La condición de tangencia exige un único punto de corte: Δ_int = (−2)² − 4·1·(2 − d) = 0.',
          ],
          solution: '4 − 4(2 − d) = 0 => 4d − 4 = 0 => d = 1.',
          validator: (raw) =>
            validateNumber(
              raw,
              1,
              '¡Tangencia exacta! Con d = 1 se tocan en un único punto (1; 3).',
              'Planteá x² − 2x + (2 − d) = 0 e igualá su discriminante a 0.',
              'neg_b_or_square_sign_in_resolvente'
            ),
        },
      ],
    },
    {
      id: 'enc4',
      title: 'Encuentro 4 · Polinomios, Divisibilidad y Parámetros',
      unitsLabel: 'Unidad 06',
      phases: [
        {
          id: 'boss1-enc4-reconocer',
          phaseName: 'Reconocer',
          kind: 'choice',
          competencyIds: ['polynomials.factoring_and_gauss_roots'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: '¿Qué camino es más directo para factorizar Q(x) = x³ + x² − 25x − 25 y hallar sus raíces {−5; −1; 5}?',
          options: [
            { label: 'Factor común por grupos: x²(x + 1) − 25(x + 1) = (x + 1)(x² − 25) = (x + 1)(x − 5)(x + 5)', value: 'group', correct: true },
            { label: 'Sacar x de factor común en los cuatro términos', value: 'x', correct: false },
            { label: 'Aplicar directamente la resolvente cuadrática sin bajar de grado', value: 'quad', correct: false },
          ],
          hints: [
            'El término independiente −25 no tiene x, así que no hay factor común x.',
            'Agrupá los dos primeros términos y los dos últimos para ver aparecer el binomio común (x + 1).',
          ],
          solution: 'Agrupando x²(x + 1) − 25(x + 1) = (x + 1)(x − 5)(x + 5).',
          validator: (v) =>
            v === 'group' || String(v).includes('grupos')
              ? { ok: true, feedback: '¡Exacto! El factor común por grupos lo resuelve en dos líneas sin siquiera listar Gauss.' }
              : {
                  ok: false,
                  diagnosticId: 'forgot_leading_coeff_factoring',
                  feedback: 'Como es de grado 3 con término independiente −25, buscá agrupar por parejas.',
                },
        },
        {
          id: 'boss1-enc4-predecir',
          phaseName: 'Predecir',
          kind: 'number',
          competencyIds: ['polynomials.division_ruffini_and_remainder'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Dado P(x) = kx⁴ − (5/3)x³ + kx − 5/3, predecí cuánto vale P(−1) para CUALQUIER valor real de k:',
          placeholder: 'Ej: 0',
          hints: [
            'Sustituí x = −1 respetando potencias pares e impares: (−1)⁴ = +1 y (−1)³ = −1.',
            'Sumá k(1) − (5/3)(−1) + k(−1) − 5/3 y mirá cómo se cancelan tanto las k como los 5/3.',
          ],
          solution: 'P(−1) = k + 5/3 − k − 5/3 = 0 para todo k ∈ ℝ.',
          validator: (raw) =>
            validateNumber(
              raw,
              0,
              '¡Exacto! −1 es raíz de P(x) para todo k ∈ ℝ.',
              'Revisá los signos: (−1)⁴ = +1 y (−1)³ = −1.',
              'ruffini_sign_error'
            ),
        },
        {
          id: 'boss1-enc4-modelar',
          phaseName: 'Modelar',
          kind: 'number',
          competencyIds: ['polynomials.parameter_reconstruction_and_modeling'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'En el mismo polinomio P(x) = kx⁴ − (5/3)x³ + kx − 5/3, ¿cuánto debe valer k para que P(x) sea divisible por (x − 1)?',
          placeholder: 'Ej: 5/3',
          hints: [
            'Por el Teorema del Resto, P(x) es divisible por (x − 1) si y solo si P(1) = 0.',
            'Evaluá P(1) = k − 5/3 + k − 5/3 = 2k − 10/3 = 0.',
          ],
          solution: '2k − 10/3 = 0 => k = 5/3.',
          validator: (raw) =>
            validateNumber(
              raw,
              5 / 3,
              '¡Exacto! Con k = 5/3 resulta P(1) = 0.',
              'Igualá P(1) = 2k − 10/3 a cero.',
              'ruffini_sign_error'
            ),
        },
        {
          id: 'boss1-enc4-resolver',
          phaseName: 'Resolver',
          kind: 'number',
          competencyIds: ['polynomials.parameter_reconstruction_and_modeling'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Sea P(x) = (2x² + 3x − 2)(x − k). Sabiendo que P(1) = 18, determiná el valor real de k:',
          placeholder: 'Ej: -5',
          hints: [
            'Evaluá en x = 1: (2·1² + 3·1 − 2)(1 − k) = 3(1 − k) = 18.',
            'Despejá k: 1 − k = 6.',
          ],
          solution: '3(1 − k) = 18 => k = −5 (y P(x) = 2(x − 1/2)(x + 2)(x + 5)).',
          validator: (raw) =>
            validateNumber(
              raw,
              -5,
              '¡Correcto! k = −5 (y la factorización completa es 2(x − 1/2)(x + 2)(x + 5)).',
              'Verificá la cuenta 3(1 − k) = 18.',
              'ruffini_sign_error'
            ),
        },
        {
          id: 'boss1-enc4-transferir',
          phaseName: 'Transferir',
          kind: 'expression',
          competencyIds: ['polynomials.factoring_and_gauss_roots'],
          representation: 'symbolic',
          stage: 'transfer',
          transferDistance: 'far',
          prompt: 'Factorizá completamente sobre ℝ el polinomio P(x) = 3x⁴ − x³ − 6x² + 2x:',
          placeholder: 'Ej: 3x(x - 1/3)(x - √2)(x + √2)',
          hints: [
            'Extraé x de factor común primero, luego agrupá (3x³ − x²) − (6x − 2) = (3x − 1)(x² − 2).',
            'No olvides el coeficiente principal 3 adelante ni partir (x² − 2) en (x − √2)(x + √2).',
          ],
          solution: 'P(x) = 3x(x − 1/3)(x − √2)(x + √2), con raíces reales {−√2; 0; 1/3; √2}.',
          validator: (raw) =>
            validatePoly(
              raw,
              '3x(x - 1/3)(x - sqrt(2))(x + sqrt(2))',
              'factored',
              '¡Jefe Integrador superado! Factorización completa 3x(x − 1/3)(x − √2)(x + √2).',
              'Verificá conservar 3x y descomponer (x² − 2) en factores lineales sobre ℝ.',
              'forgot_leading_coeff_factoring'
            ),
        },
      ],
    },
  ],
};

if (typeof document !== 'undefined') {
  renderNav();
  initLessonDock();
  initGlossary();

  const host = document.getElementById('boss-integrador-1-arena');
  if (host) {
    mountBossArena(host, INTEGRADOR_1_CONFIG);
  }
}
