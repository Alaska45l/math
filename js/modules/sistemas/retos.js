/**
 * @file js/modules/sistemas/retos.js
 * Entrenador Contrastivo Infinito por Semilla (PRNG Mulberry32 · 8 Familias)
 * y Las 5 Trampas Clásicas de Examen para Unidad 04 · Sistemas de Ecuaciones 2×2.
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import {
  MINUS,
  rat,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  solveSystem2x2,
  analyzeParametricSystem,
  reconstructSystemFromLines,
  equivalentSolutionSet2x2,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
  diagnoseSystem,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { SYS_COMPETENCIES } from './competencies-map.js';
import { recordSystemAttempt, getSystemsCompetencyReport } from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export const CHALLENGE_TYPES = [
  {
    id: 'solve_2x2_integer_and_rational',
    label: 'Resolución 2×2 (enteros y fracciones)',
    competencyId: 'systems.linear_2x2_graphical_and_analytical',
  },
  {
    id: 'solve_2x2_fractions_distribution',
    label: 'Sistemas con fracciones y distributiva',
    competencyId: 'systems.linear_2x2_graphical_and_analytical',
  },
  {
    id: 'classify_scd_sci_si',
    label: 'Clasificación SCD / SCI / SI',
    competencyId: 'systems.classification_scd_sci_si',
  },
  {
    id: 'construct_sci_or_si_partner',
    label: 'Parámetro c para SCI o SI',
    competencyId: 'systems.classification_scd_sci_si',
  },
  {
    id: 'parametric_k_for_si_or_sci',
    label: 'Parámetro k para SCI o SI',
    competencyId: 'systems.parametric_systems',
  },
  {
    id: 'parametric_k_domain_exclusion',
    label: 'Dominio SCD con exclusión de parámetro',
    competencyId: 'systems.parametric_systems',
  },
  {
    id: 'reconstruct_from_graph_perpendicular',
    label: 'Reconstrucción gráfica perpendicular',
    competencyId: 'systems.modeling_and_graph_reconstruction',
  },
  {
    id: 'word_problem_discount_or_mixture',
    label: 'Modelización de descuentos o mezclas',
    competencyId: 'systems.modeling_and_graph_reconstruction',
  },
];

function _generateSystemChallengeRaw(seed, forcedType = 'all', problemIndex = 0) {
  let rng;
  let typeObj;
  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';

  if (isAll) {
    if (problemIndex === 0) {
      rng = mulberry32(seed >>> 0);
      typeObj = randChoice(rng, CHALLENGE_TYPES);
    } else {
      const baseRng = mulberry32(seed >>> 0);
      const baseIndex = Math.floor(baseRng() * CHALLENGE_TYPES.length);
      typeObj = CHALLENGE_TYPES[(baseIndex + problemIndex) % CHALLENGE_TYPES.length];
      rng = mulberry32((seed + problemIndex * 7919 + 1013) >>> 0);
    }
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    rng = problemIndex === 0 ? mulberry32(seed >>> 0) : mulberry32((seed + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. solve_2x2_integer_and_rational
  if (type === 'solve_2x2_integer_and_rational') {
    const x0 = randChoice(rng, [-3, -2, -1, 1, 2, 3, 4]);
    const y0 = randChoice(rng, [-2, -1, 1, 2, 3, 5]);
    const a1 = randChoice(rng, [1, 2, 3]);
    const b1 = randChoice(rng, [-2, -1, 1, 2]);
    const a2 = randChoice(rng, [1, 2, -1]);
    let b2 = randChoice(rng, [1, 2, 3]);
    if (a1 * b2 === a2 * b1) b2 += 1;
    const c1 = a1 * x0 + b1 * y0;
    const c2 = a2 * x0 + b2 * y0;
    const sol = solveSystem2x2({ a1, b1, c1, a2, b2, c2 });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Resolución 2×2',
      prompt: `Resolvé el sistema { ${a1}x ${b1 >= 0 ? '+ ' + b1 : '− ' + Math.abs(b1)}y = ${c1} ; ${a2}x ${b2 >= 0 ? '+ ' + b2 : '− ' + Math.abs(b2)}y = ${c2} } y escribí el par solución (x₀; y₀):`,
      inputKind: 'pair',
      expected: `(${x0}; ${y0})`,
      placeholder: 'Ej: (2; -1)',
      diagContext: { solution: { x: x0, y: y0 } },
      hints: [
        `Pista 1: Elegí la incógnita más limpia para despejar por sustitución o igualá coeficientes para reducir por suma/resta.`,
        `Pista 2: Al eliminar una variable se obtiene x₀ = ${x0} (recordá luego sustituir para hallar y₀).`,
        `Pista 3: Escribí el par ordenado completo entre paréntesis con punto y coma ";" respetando el orden (x₀; y₀).`,
      ],
      explanation: `Resolviendo el sistema por reducción o sustitución obtenemos S = ${sol.solutionText}.`,
    };
  }

  // 2. solve_2x2_fractions_distribution
  if (type === 'solve_2x2_fractions_distribution') {
    const x0 = randChoice(rng, [2, 4, 6]);
    const y0 = randChoice(rng, [-1, 1, 2]);
    const d1 = randChoice(rng, [2, 3]);
    const kShift = randChoice(rng, [1, 2]);
    // Eq1: (d1*x - d1*kShift)/d1 + 2y = (x0 - kShift) + 2*y0  => x - kShift + 2y = rhs1
    const rhs1 = x0 - kShift + 2 * y0;
    // Eq2: x - 2(y - 1) = x0 - 2*(y0 - 1) = rhs2
    const rhs2 = x0 - 2 * (y0 - 1);
    const sol = solveSystem2x2({ a1: 1, b1: 2, c1: x0 + 2 * y0, a2: 1, b2: -2, c2: x0 - 2 * y0 });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Fracciones y distributiva',
      prompt: `Limpiá denominadores y paréntesis en { (${d1}x − ${d1 * kShift})/${d1} + 2y = ${rhs1} ; x − 2(y − 1) = ${rhs2} } y hallá la solución (x₀; y₀):`,
      inputKind: 'pair',
      expected: `(${x0}; ${y0})`,
      placeholder: 'Ej: (6; 1)',
      diagContext: { solution: { x: x0, y: y0 }, target: 'solve_sign' },
      hints: [
        `Pista 1: En la primera ecuación simplificá la fracción dividiendo ambos términos del numerador por ${d1}; en la segunda distribuí el −2 delante del paréntesis.`,
        `Pista 2: El sistema limpio queda { x + 2y = ${x0 + 2 * y0} ; x − 2y = ${x0 - 2 * y0} }. Sumá ambas ecuaciones para eliminar y.`,
        `Pista 3: Tras hallar x₀ = ${x0}, reemplazalo para despejar y₀ y anotá el par ordenado completo con punto y coma.`,
      ],
      explanation: `Al limpiar fracciones y paréntesis queda x + 2y = ${x0 + 2 * y0} y x − 2y = ${x0 - 2 * y0}, dando S = ${sol.solutionText}.`,
    };
  }

  // 3. classify_scd_sci_si
  if (type === 'classify_scd_sci_si') {
    const mode = randChoice(rng, ['SCI', 'SI']);
    const a = randChoice(rng, [2, 3]);
    const b = randChoice(rng, [-1, 1, 2]);
    const c = randChoice(rng, [3, 4, 5]);
    const mult = randChoice(rng, [2, 3, -2]);
    const c2 = mode === 'SCI' ? mult * c : mult * c + randChoice(rng, [1, -2, 3]);
    const expected = mode === 'SCI' ? 'SCI' : 'vacio';

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · Clasificación SCI vs SI',
      prompt: `Analizá el sistema { ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}y = ${c} ; ${mult * a}x ${mult * b >= 0 ? '+ ' + mult * b : '− ' + Math.abs(mult * b)}y = ${c2} }. Escribí "SCI" si tiene infinitas soluciones o "vacio" (∅) si es incompatible:`,
      inputKind: 'solution',
      expected,
      placeholder: 'Ej: SCI o vacio',
      diagContext: { target: 'classify', expectedStatus: mode },
      hints: [
        `Pista 1: Multiplicá la primera ecuación por ${mult} y comparala término a término con la segunda ecuación.`,
        `Pista 2: Los coeficientes de x e y coinciden exactamente (${mult * a}x y ${mult * b}y), pero los términos independientes quedan ${mult * c} frente a ${c2}.`,
        `Pista 3: Decidí si al restar queda una identidad 0 = 0 (infinitas soluciones) o un absurdo 0 = k ≠ 0 (conjunto vacío).`,
      ],
      explanation:
        mode === 'SCI'
          ? `La segunda ecuación es ${mult} veces la primera en todos sus términos (0 = 0): Sistema Compatible Indeterminado (SCI).`
          : `Las variables se cancelan dando 0 = ${c2 - mult * c} ≠ 0: rectas paralelas separadas, S = ∅ (SI).`,
    };
  }

  // 4. construct_sci_or_si_partner
  if (type === 'construct_sci_or_si_partner') {
    const a = randChoice(rng, [2, 3, 4]);
    const b = randChoice(rng, [-3, -1, 2]);
    const c = randChoice(rng, [2, 5, 6]);
    const m = randChoice(rng, [2, 3]);
    const targetC2 = m * c;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Condición de coincidencia (SCI)',
      prompt: `¿Qué valor debe tomar el término independiente k para que el sistema { ${a}x ${b >= 0 ? '+ ' + b : '− ' + Math.abs(b)}y = ${c} ; ${m * a}x ${m * b >= 0 ? '+ ' + m * b : '− ' + Math.abs(m * b)}y = k } resulte Compatible Indeterminado (SCI)?`,
      inputKind: 'number',
      expected: targetC2,
      placeholder: 'Ej: 10',
      diagContext: { target: 'parametric_k' },
      hints: [
        `Pista 1: Para que sea SCI ambas ecuaciones deben representar exactamente la misma recta (misma pendiente Y misma ordenada al origen).`,
        `Pista 2: Observá que los coeficientes de x e y de la segunda ecuación son exactamente ${m} veces los de la primera.`,
        `Pista 3: Multiplicá también el término independiente de la primera ecuación por ese mismo factor ${m} para obtener k.`,
      ],
      explanation: `Al multiplicar la primera ecuación por ${m} obtenemos ${m * a}x ${m * b >= 0 ? '+ ' + m * b : '− ' + Math.abs(m * b)}y = ${targetC2}, por lo que k = ${targetC2}.`,
    };
  }

  // 5. parametric_k_for_si_or_sci
  if (type === 'parametric_k_for_si_or_sci') {
    // { k*x + y = c1 ; (k + shift)*x + k*y = 2*c1 } => Δ = k^2 - k - shift
    const variants = [
      { shift: 2, c1: 7, sci: 2, si: -1 },
      { shift: 6, c1: 5, sci: 3, si: -2 },
    ];
    const v = randChoice(rng, variants);
    const askSci = rng() > 0.5;
    const expected = askSci ? v.sci : v.si;
    const opposite = askSci ? v.si : v.sci;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Parámetro k crítico',
      prompt: `En el sistema con k ∈ ℝ − {0}: { kx + y = ${v.c1} ; (k + ${v.shift})x + ky = ${2 * v.c1} }, hallá el único valor de k para que el sistema sea ${askSci ? 'Compatible Indeterminado (SCI)' : 'Incompatible (SI)'}:`,
      inputKind: 'number',
      expected,
      placeholder: 'Ej: 2',
      diagContext: { target: 'parametric_k', excludedVal: 0, oppositeCritVal: opposite },
      hints: [
        `Pista 1: Buscá los valores de k donde las pendientes coinciden: k/1 = (k + ${v.shift})/k, es decir k² − k − ${v.shift} = 0.`,
        `Pista 2: Las dos raíces críticas son k = ${v.sci} y k = ${v.si}. Sustituí cada una en el sistema original para ver cuál da 0 = 0 y cuál da contradicción.`,
        `Pista 3: Elegí el valor crítico cuya segunda ecuación resulta proporcional (SCI) o contradictoria (SI) respecto de la primera.`,
      ],
      explanation: `De k² − k − ${v.shift} = 0 salen k = ${v.sci} (SCI, ecuación doble) y k = ${v.si} (SI, paralelas separadas). El pedido es k = ${expected}.`,
    };
  }

  // 6. parametric_k_domain_exclusion
  if (type === 'parametric_k_domain_exclusion') {
    const rhs1 = randChoice(rng, [2, 3, 4]);
    const crit = randChoice(rng, [1, 2, -2]);
    // { k*x + y = rhs1 ; crit*x + y = 1 } => Δ = k - crit => SCD: k ∉ {0, crit}
    const spec = {
      paramName: 'k',
      a1: { k: 1, c: 0 },
      b1: 1,
      c1: rhs1,
      a2: crit,
      b2: 1,
      c2: 1,
      excludedParams: [0],
    };
    const res = analyzeParametricSystem(spec);
    const vals = res.scdExcludedSet.map((r) => ratToNumber(r)).sort((a, b) => a - b);
    const expected = `R - {${vals.join('; ')}}`;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Dominio SCD con parámetro',
      prompt: `Para el sistema con k ∈ ℝ − {0}: { kx + y = ${rhs1} ; ${crit}x + y = 1 }, escribí el conjunto de todos los valores de k para los cuales el sistema es Compatible Determinado (SCD) usando notación R - {a; b}:`,
      inputKind: 'set',
      expected,
      placeholder: 'Ej: R - {0; 1}',
      diagContext: { target: 'parametric_set', excludedVal: 0 },
      hints: [
        `Pista 1: El sistema es SCD cuando las rectas no son paralelas (pendientes distintas), pero además tenés que respetar la exclusión inicial k ≠ 0.`,
        `Pista 2: Al igualar pendientes −k = −${crit} aparece el valor crítico k = ${crit}, donde las rectas se vuelven paralelas.`,
        `Pista 3: Escribí ℝ menos los valores que bloquean el SCD (incluyendo tanto el valor crítico como el valor prohibido por el dominio inicial) separados por ";".`,
      ],
      explanation: `k = ${crit} produce rectas paralelas y k = 0 está excluido por el dominio del enunciado. Por eso SCD vale para ${expected}.`,
    };
  }

  // 7. reconstruct_from_graph_perpendicular
  if (type === 'reconstruct_from_graph_perpendicular') {
    const b1 = randChoice(rng, [-2, -3, 2, 4]);
    const b2 = randChoice(rng, [5, 8, 10]);
    const m1 = randChoice(rng, [0.5, -2]);
    const rec = reconstructSystemFromLines({ m: m1, b: b1 }, { perpendicularToLine1: true, point: { x: 0, y: b2 } });
    const sx = fmtRat(rec.solved.solution.x, { asciiMinus: true });
    const sy = fmtRat(rec.solved.solution.y, { asciiMinus: true });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 7 · Gráfica perpendicular',
      prompt: `En un gráfico, r₁ tiene pendiente m₁ = ${m1 === 0.5 ? '1/2' : '−2'} y ordenada b₁ = ${b1}; r₂ es perpendicular a r₁ y corta al eje Y en (0; ${b2}). Reconstruí el sistema y hallá su solución (x₀; y₀):`,
      inputKind: 'pair',
      expected: `(${sx}; ${sy})`,
      placeholder: 'Ej: (24/5; 2/5)',
      diagContext: { target: 'perp_graph', solution: { x: ratToNumber(rec.solved.solution.x), y: ratToNumber(rec.solved.solution.y) } },
      hints: [
        `Pista 1: r₁ es y = ${m1 === 0.5 ? '(1/2)' : '−2'}x ${b1 >= 0 ? '+ ' + b1 : '− ' + Math.abs(b1)}. Como r₂ ⊥ r₁, su pendiente vale m₂ = −1/m₁.`,
        `Pista 2: La recta perpendicular resulta r₂: y = ${fmtRat(rec.line2.explicit.m)}x + ${b2}. Igualá ambas expresiones de y.`,
        `Pista 3: Despejá x₀ como fracción exacta, sustituí para obtener y₀ y escribí el par ordenado (x₀; y₀) con ";".`,
      ],
      explanation: `r₁: ${rec.line1.explicit.text} y r₂: ${rec.line2.explicit.text} se intersecan en S = ${rec.solved.solutionText}.`,
    };
  }

  // 8. word_problem_discount_or_mixture
  const diff = randChoice(rng, [2000, 4000, 5500]);
  const cTrue = randChoice(rng, [10000, 15000, 17000]);
  const hTrue = cTrue + diff;
  const totalPaid = Math.round(0.9 * hTrue + 0.95 * cTrue);

  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    badge: 'Familia 8 · Problema con descuentos',
    prompt: `Un producto A excede en $${diff} al precio de lista de un producto B (A − ${diff} = B). Con 10% de descuento en A y 5% de descuento en B se pagan $${totalPaid} en total. ¿Cuál es el precio de lista de A?`,
    inputKind: 'number',
    expected: hTrue,
    placeholder: 'Ej: 22500',
    diagContext: { target: 'word_discount' },
    hints: [
      `Pista 1: Planteá las dos ecuaciones: B = A − ${diff}, y para el monto pagado usá el porcentaje abonado (90% de A y 95% de B).`,
      `Pista 2: Sustituí B en 0,90·A + 0,95·(A − ${diff}) = ${totalPaid}.`,
      `Pista 3: Agrupá 1,85·A = ${totalPaid} + ${Math.round(0.95 * diff)} y dividí por 1,85 para despejar el precio de lista de A.`,
    ],
    explanation: `De 0,90A + 0,95(A − ${diff}) = ${totalPaid} resulta 1,85A = ${totalPaid + 0.95 * diff} ⇒ A = $${hTrue}.`,
  };
}

export function generateSystemChallenge(seed = 2026, forcedType = 'all', problemIndex = 0) {
  return _generateSystemChallengeRaw(seed, forcedType, problemIndex);
}

export function generateSystemChallenges(seed = 2026, count = 8, forcedType = 'all') {
  const out = [];
  for (let i = 0; i < count; i++) out.push(_generateSystemChallengeRaw(seed, forcedType, i));
  return out;
}

export const makeChallenge = generateSystemChallenge;
export const makeChallenges = generateSystemChallenges;

/* ==========================================================================
   Las 5 Trampas Clásicas de Examen (Unit 04 · Sistemas 2×2)
   ========================================================================== */

export const TRAPS = [
  {
    id: 'trap-0x-equals-0',
    title: 'Trampa 1 · 0x = 0 no significa x = 0 (SCI vs SCD)',
    competencyId: 'systems.classification_scd_sci_si',
    badge: 'Clasificación',
    prompt:
      'Al resolver un sistema por reducción llegás a 0·x = 0. Un estudiante anota "x = 0, solución única". ¿Cuál es la interpretación correcta?',
    options: [
      { label: 'Todo número real x verifica 0·x = 0: ambas ecuaciones son la misma recta y el sistema es Compatible Indeterminado (SCI).', correct: true },
      { label: '0·x = 0 es absurdo, así que es Sistema Incompatible (S = ∅).', correct: false, diagnosticId: 'confused_sci_with_si' },
      { label: 'x = 0 es la única solución posible.', correct: false, diagnosticId: 'only_checked_slopes_ignored_intercepts' },
    ],
    hints: [
      'Probá reemplazar x = 5 o x = −3 en la igualdad 0·x = 0: ¿se cumple o falla?',
      'Como cualquier real multiplicado por cero da cero, la igualdad no impone ningún valor único para x.',
      'Elegí la opción que corresponde a una identidad siempre verdadera con infinitas soluciones.',
    ],
    wrongSteps: ['Pasó el 0 dividiendo (0/0) o confundió 0·x = 0 con x = 0.', 'Reportó una única solución falsa.'],
    rightSteps: ['Reconoció 0·x = 0 como identidad válida para todo x ∈ ℝ.', 'Clasificó como SCI con infinitas soluciones sobre la recta.'],
    explanation: '0·x = 0 es una identidad (SCI, infinitas soluciones). En cambio 0·x = 5 sí es absurdo (SI, vacío).',
  },
  {
    id: 'trap-discount-vs-paid',
    title: 'Trampa 2 · Descuento vs monto pagado (10% vs 90%)',
    competencyId: 'systems.modeling_and_graph_reconstruction',
    badge: 'Simulacro 2019 Ej. 3',
    prompt:
      'En una tienda pagás $36.400 por una heladera (h) con 10% de descuento y una cocina (c) con 5% de descuento. ¿Qué ecuación modela correctamente el pago en caja?',
    options: [
      { label: '0,10h + 0,05c = 36400', correct: false, diagnosticId: 'discount_instead_of_paid_percentage' },
      { label: '0,90h + 0,95c = 36400', correct: true },
      { label: '1,10h + 1,05c = 36400', correct: false, diagnosticId: 'discount_instead_of_paid_percentage' },
    ],
    hints: [
      'Preguntate qué representa $36.400: ¿es el dinero que te ahorraste o el total que efectivamente abonaste?',
      'Si te descuentan el 10%, vos pagás el (100 − 10)% = 90% del precio de lista.',
      'Seleccioná la ecuación cuyos coeficientes multiplican cada precio por la fracción abonada.',
    ],
    wrongSteps: ['Usó 0,10 y 0,05 directamente igualándolos al monto pagado $36.400.'],
    rightSteps: ['Restó el descuento al 100%: pagó 0,90h + 0,95c = 36400.'],
    explanation: 'Con 10% y 5% de descuento se abona el 90% (0,90h) y el 95% (0,95c), nunca 0,10h + 0,05c.',
  },
  {
    id: 'trap-param-domain-exclusion',
    title: 'Trampa 3 · Parámetro prohibido por el dominio (k ∈ ℝ − {0})',
    competencyId: 'systems.parametric_systems',
    badge: 'Ej. 12a–b UNMDP',
    prompt:
      'En { kx + y = 2 ; x + y = 1 } con k ∈ ℝ − {0}, el paralelismo da k = 1 (SI). Si te piden todos los valores de k para que sea SCD, ¿por qué "ℝ − {1}" está incompleto?',
    options: [
      { label: 'Porque k = 0 está excluido del dominio desde el enunciado: la respuesta correcta es ℝ − {0; 1}.', correct: true },
      { label: 'Porque k = 1 sí produce SCD.', correct: false, diagnosticId: 'ignored_parametric_exclusion_domain' },
      { label: 'Porque también hay que sacar k = 2.', correct: false, diagnosticId: 'ignored_parametric_exclusion_domain' },
    ],
    hints: [
      'Leé con lupa la condición inicial del parámetro al comienzo del problema.',
      'El enunciado fija k ∈ ℝ − {0}, así que k = 0 no pertenece al conjunto de valores admisibles.',
      'Elegí la opción que excluye tanto el valor crítico k = 1 como el valor prohibido por dominio.',
    ],
    wrongSteps: ['Solo sacó la raíz k = 1 de Δ = 0 y dejó k = 0 adentro como válido para SCD.'],
    rightSteps: ['Cruzó Δ ≠ 0 (k ≠ 1) con el dominio k ∈ ℝ − {0}, concluyendo k ∈ ℝ − {0; 1}.'],
    explanation: 'Siempre hay que intersectar las condiciones algebraicas con la restricción de dominio inicial del parámetro.',
  },
  {
    id: 'trap-delta-zero-blind',
    title: 'Trampa 4 · Concluir SCI o SI mirando solo Δ = 0 / m₁ = m₂',
    competencyId: 'systems.classification_scd_sci_si',
    badge: 'Diagnóstico',
    prompt:
      'En { 2x + y = 3 ; 4x + 2y = 6 }, alguien calcula m₁ = m₂ = −2 (o Δ = 0) y afirma directo "es Incompatible porque son paralelas". ¿Qué pasó por alto?',
    options: [
      { label: 'Que m₁ = m₂ también incluye el caso de paralelas coincidentes (SCI): aquí 4x + 2y = 6 es el doble exacto de 2x + y = 3, así que es SCI.', correct: true },
      { label: 'Que m₁ = m₂ implica siempre SCD.', correct: false, diagnosticId: 'only_checked_slopes_ignored_intercepts' },
      { label: 'Que si las pendientes son negativas el sistema es siempre SI.', correct: false, diagnosticId: 'confused_sci_with_si' },
    ],
    hints: [
      'Igualar pendientes te avisa que las rectas tienen la misma inclinación, pero no te dice si están separadas o superpuestas.',
      'Compará también las ordenadas al origen (b₁ = 3 y b₂ = 6/2 = 3) o multiplicá la primera fila por 2.',
      'Seleccioná la opción que distingue paralelas separadas (SI) de paralelas coincidentes (SCI).',
    ],
    wrongSteps: ['Miró solo m₁ = m₂ (o Δ = 0) sin chequear los términos independientes.'],
    rightSteps: ['Verificó además que 6 = 2·3 (misma ordenada b = 3) ⇒ SCI.'],
    explanation: 'Pendientes iguales (Δ = 0) solo descarta SCD. Para decidir entre SCI y SI hay que verificar la ordenada al origen o la proporcionalidad de c.',
  },
  {
    id: 'trap-sign-distribution',
    title: 'Trampa 5 · Distributiva con signo menos en ecuaciones con paréntesis',
    competencyId: 'systems.linear_2x2_graphical_and_analytical',
    badge: 'Ej. 11b UNMDP',
    prompt:
      'Al limpiar x − 3(2y − 1) = 3y en el Ejercicio 11b, ¿cuál es la expansión correcta del término −3(2y − 1)?',
    options: [
      { label: '−6y − 3 (el signo menos afecta solo al primero)', correct: false, diagnosticId: 'sign_error_in_elimination_or_substitution' },
      { label: '−6y + 3 (menos por menos da más en el segundo término)', correct: true },
      { label: '+6y − 3', correct: false, diagnosticId: 'sign_error_in_elimination_or_substitution' },
    ],
    hints: [
      'El factor delante del paréntesis es −3 negativo completo, no solo 3.',
      'Multiplicá (−3)·(2y) = −6y y luego (−3)·(−1).',
      'Elegí la opción donde el producto (−3)·(−1) conserva su signo positivo correcto.',
    ],
    wrongSteps: ['Escribió x − 6y − 3 = 3y olvidando cambiar el signo de −1.'],
    rightSteps: ['Distribuyó (−3)(2y − 1) = −6y + 3, quedando x − 9y = −3.'],
    explanation: 'Al distribuir −3 sobre (2y − 1), (−3)·(−1) = +3, llevando correctamente a x − 9y = −3.',
  },
];

/* ==========================================================================
   Montaje del Entrenador + Trampas (#sec-retos)
   ========================================================================== */

export function mountSystemsRetos(host) {
  if (!host) return null;
  clear(host);

  let currentSeed = 2026;
  let currentMode = 'adaptativo';
  let streak = 0;

  const tabBar = h('div', { class: 'sys-retos-tabs pr-chip-row' });
  const btnTabPrng = h('button', { type: 'button', class: 'pr-chip is-active' }, '1. Entrenador Infinito por Semilla PRNG (8 Familias)');
  const btnTabTraps = h('button', { type: 'button', class: 'pr-chip' }, '2. Las 5 Trampas Clásicas de Examen');
  tabBar.append(btnTabPrng, btnTabTraps);

  const panelPrng = h('div', { class: 'sys-retos-panel' });
  const panelTraps = h('div', { class: 'sys-retos-panel', hidden: '' });

  const seedInput = h('input', {
    type: 'number',
    value: String(currentSeed),
    min: '1',
    max: '9999999',
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h('select', { class: 'sys-family-select', 'aria-label': 'Familia de ejercicios' }, [
    h('option', { value: 'adaptativo', selected: true }, 'Inteligente (Según tu evidencia)'),
    h('option', { value: 'all' }, 'Todas las familias (Mezcla por semilla)'),
    ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
  ]);
  const btnNewSeed = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('spark', 14), ' Nueva semilla']);
  const btnGen = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('reset', 14), ' Regenerar']);
  const streakPill = h('div', { class: 'exp-trainer-progress-pill' }, 'Racha independiente: 0');
  const adaptiveBanner = h('div', { class: 'sys-adaptive-reason muted small' });
  const cascadeList = h('div', { class: 'exp-challenges-cascade' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', null, 'Semilla determinista'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [h('span', null, 'Familia / Selección'), familySelect]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [btnNewSeed, btnGen]),
    streakPill,
  ]);

  panelPrng.append(toolbar, adaptiveBanner, cascadeList);

  function renderPrngCard(ch, idx) {
    let hintsUsed = 0;
    let solutionRevealed = false;
    let solved = false;

    const card = h('article', { class: 'exp-challenge-card', 'data-challenge-idx': String(idx) });
    const statusBadge = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const header = h('div', { class: 'exp-challenge-card__header' }, [
      h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
      h('span', { class: 'exp-challenge-card__family' }, ch.competencyId),
      statusBadge,
    ]);

    const prompt = h('p', { class: 'sys-reto-prompt' }, ch.prompt);
    const input = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: ch.placeholder,
      'aria-label': ch.prompt,
    });
    const btnCheck = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('check', 14), ' Comprobar']);
    const btnHint = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('bulb', 14), ' Pista (0/3)']);
    const btnSol = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('spark', 14), ' Ver solución explicada']);
    const hintsBox = h('div', { class: 'sys-reto-hints', hidden: '' });
    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

    const updateStreakUI = () => {
      streakPill.textContent = `Racha independiente: ${streak}`;
    };

    const finishSuccess = (isSol = false) => {
      const independent = !isSol && hintsUsed === 0 && !solutionRevealed;
      if (isSol) {
        solutionRevealed = true;
        streak = 0;
        statusBadge.textContent = 'Solución vista';
        statusBadge.className = 'exp-challenge-card__status is-solution';
      } else if (independent) {
        streak += 1;
        statusBadge.textContent = 'Logro independiente';
        statusBadge.className = 'exp-challenge-card__status is-solved-indep';
      } else {
        statusBadge.textContent = 'Logro asistido';
        statusBadge.className = 'exp-challenge-card__status is-solved-assisted';
      }
      updateStreakUI();

      card.classList.add('is-solved');
      input.value = String(ch.expected);
      input.disabled = true;
      btnCheck.disabled = true;
      btnHint.disabled = true;
      btnSol.disabled = true;
      feedback.className = 'pr-check-feedback is-ok';
      feedback.replaceChildren(
        chalkIcon(independent ? 'spark' : 'bulb', 14),
        h('strong', {}, isSol ? ' Solución explicada: ' : independent ? ' ¡Excelente! ' : ' Resuelto con ayuda: '),
        h('span', {}, ch.explanation)
      );

      if (!solved) {
        solved = true;
        try {
          recordSystemAttempt({
            exerciseId: `reto-${ch.type}-${ch.seed}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: independent ? 'independent' : 'assisted',
            hintsUsed,
            solutionRevealed: isSol,
            diagnosticId: null,
            representation: 'symbolic',
            stage: 'retrieval',
            transferDistance: 'near',
          });
        } catch {}
        notifyCompetencyDashboardUpdate();
      }
    };

    const verify = () => {
      const raw = input.value.trim();
      if (!raw) {
        feedback.className = 'pr-check-feedback is-warn';
        feedback.textContent = 'Ingresá tu respuesta antes de comprobar.';
        return;
      }

      let isOk = false;
      let syntaxErr = null;
      try {
        if (ch.inputKind === 'number') {
          isOk = Math.abs(parseNumberOrFraction(raw) - parseNumberOrFraction(ch.expected)) < 1e-6;
        } else if (ch.inputKind === 'pair') {
          const cleanRaw = raw.replace(/^S\s*=\s*/i, '').replace(/^\{|\}$/g, '').trim();
          const pu = parseOrderedPair(cleanRaw);
          const pe = parseOrderedPair(ch.expected);
          isOk = Math.abs(pu.x - pe.x) < 1e-6 && Math.abs(pu.y - pe.y) < 1e-6;
        } else if (ch.inputKind === 'solution') {
          isOk = equivalentSolutionSet2x2(raw, ch.expected);
        } else if (ch.inputKind === 'set' || ch.inputKind === 'interval') {
          isOk = equivalentSetExactas(raw, ch.expected);
        }
      } catch (err) {
        if (err.code === 'comma_instead_of_semicolon') {
          const d = DIAGNOSE_REACTIONS.comma_instead_of_semicolon;
          feedback.className = 'pr-check-feedback is-error';
          feedback.textContent = d.text;
          vnReact({ pose: d.pose, tag: d.tag, html: d.text });
          return;
        }
        syntaxErr = err.message;
      }

      if (syntaxErr) {
        feedback.className = 'pr-check-feedback is-warn';
        feedback.textContent = syntaxErr;
        return;
      }

      if (isOk) {
        playSuccess();
        finishSuccess(false);
        if (STREAK_REACTIONS[streak]) {
          const r = STREAK_REACTIONS[streak];
          vnReact({ pose: r.pose, tag: r.tag, html: r.text });
        }
        return;
      }

      playError();
      streak = 0;
      updateStreakUI();
      const diag = diagnoseSystem(raw, { ...(ch.diagContext || {}), kind: ch.inputKind });
      try {
        recordSystemAttempt({
          exerciseId: `reto-${ch.type}-${ch.seed}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintsUsed === 0 ? 'independent' : 'assisted',
          hintsUsed,
          solutionRevealed: false,
          diagnosticId: diag?.id || null,
          representation: 'symbolic',
          stage: 'retrieval',
          transferDistance: 'near',
        });
      } catch {}
      notifyCompetencyDashboardUpdate();

      feedback.className = 'pr-check-feedback is-error';
      if (diag) {
        feedback.textContent = diag.message;
        vnReact({ pose: diag.pose, tag: diag.tag, html: diag.message });
      } else {
        feedback.textContent = 'Todavía no coincide. Desplegá una pista progresiva.';
      }
    };

    btnCheck.addEventListener('click', verify);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verify();
      }
    });
    btnHint.addEventListener('click', () => {
      playClick();
      if (hintsUsed < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'sys-hint-item' }, ch.hints[hintsUsed]));
        hintsUsed += 1;
        btnHint.textContent = hintsUsed < 3 ? `Pista (${hintsUsed}/3)` : 'Pistas completas';
      }
    });
    btnSol.addEventListener('click', () => {
      playClick();
      finishSuccess(true);
      const r = STREAK_REACTIONS.showSolution;
      vnReact({ pose: r.pose, tag: r.tag, html: r.text });
    });

    card.append(
      header,
      prompt,
      h('div', { class: 'exp-challenge-card__input-row' }, [input]),
      h('div', { class: 'exp-check__actions' }, [btnCheck, btnHint, btnSol]),
      hintsBox,
      feedback
    );
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    let chosenFamily = currentMode;
    if (currentMode === 'adaptativo') {
      try {
        const report = getSystemsCompetencyReport();
        const selection = selectAdaptiveExercise({
          moduleId: 'sistemas',
          competencies: SYS_COMPETENCIES,
          report,
          families: CHALLENGE_TYPES,
          seed: currentSeed,
        });
        chosenFamily = selection?.familyId || 'all';
        adaptiveBanner.textContent = selection?.reason
          ? `Selección inteligente: ${selection.reason}`
          : 'Modo adaptativo: combinando las 8 familias según tu historial.';
      } catch {
        chosenFamily = 'all';
        adaptiveBanner.textContent = 'Modo adaptativo: recorriendo las 8 familias curriculares.';
      }
    } else {
      adaptiveBanner.textContent = `Semilla #${currentSeed} · Modo ${currentMode === 'all' ? 'Mixto (8 familias)' : currentMode}`;
    }

    const list = generateSystemChallenges(currentSeed, 8, chosenFamily);
    list.forEach((ch, idx) => cascadeList.appendChild(renderPrngCard(ch, idx)));
  }

  TRAPS.forEach((trap) => {
    let hintsUsed = 0;
    const card = h('article', { class: 'sys-reto-card', 'data-trap-id': trap.id });
    const head = h('div', { class: 'pr-check-head' }, [
      h('span', { class: 'sys-reto-badge' }, trap.title),
      h('span', { class: 'sys-comp-tag' }, trap.badge),
    ]);
    const prompt = h('p', { class: 'sys-reto-prompt' }, trap.prompt);
    const optsBox = h('div', { class: 'sys-trap-options' });
    const hintsBox = h('div', { class: 'sys-reto-hints', hidden: '' });
    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const compareBox = h('div', { class: 'sys-trap-compare', hidden: '' }, [
      h('div', { class: 'sys-trap-col is-wrong' }, [
        h('div', { class: 'sys-trap-col-head' }, [chalkIcon('anger', 14), ' Trampa habitual']),
        h('ul', { class: 'sys-trap-steps' }, trap.wrongSteps.map((s) => h('li', {}, s))),
      ]),
      h('div', { class: 'sys-trap-col is-right' }, [
        h('div', { class: 'sys-trap-col-head' }, [chalkIcon('check', 14), ' Camino riguroso']),
        h('ul', { class: 'sys-trap-steps' }, trap.rightSteps.map((s) => h('li', {}, s))),
      ]),
    ]);

    const btnHint = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('bulb', 14), ' Pista (0/3)']);
    btnHint.addEventListener('click', () => {
      playClick();
      if (hintsUsed < trap.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'sys-hint-item' }, trap.hints[hintsUsed]));
        hintsUsed += 1;
        btnHint.textContent = hintsUsed < 3 ? `Pista (${hintsUsed}/3)` : 'Pistas completas';
      }
    });

    trap.options.forEach((opt) => {
      const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
      btn.addEventListener('click', () => {
        for (const b of optsBox.querySelectorAll('.pr-option')) {
          b.classList.remove('is-selected', 'is-correct', 'is-wrong');
        }
        btn.classList.add('is-selected');
        if (opt.correct) {
          playSuccess();
          btn.classList.add('is-correct');
          compareBox.removeAttribute('hidden');
          feedback.className = 'pr-check-feedback is-ok';
          feedback.textContent = trap.explanation;
          vnReact({ pose: 'lentes-brillo', tag: 'Trampa desactivada', html: trap.explanation });
          try {
            recordSystemAttempt({
              exerciseId: `trap-${trap.id}`,
              competencyId: trap.competencyId,
              correct: true,
              mode: hintsUsed === 0 ? 'independent' : 'assisted',
              hintsUsed,
              solutionRevealed: false,
              representation: 'verbal',
              stage: 'transfer',
              transferDistance: 'far',
            });
          } catch {}
        } else {
          playError();
          btn.classList.add('is-wrong');
          const d = DIAGNOSE_REACTIONS[opt.diagnosticId];
          feedback.className = 'pr-check-feedback is-error';
          feedback.textContent = d ? d.text : 'Caíste en la trampa. Revisá con las pistas.';
          if (d) vnReact({ pose: d.pose, tag: d.tag, html: d.text });
        }
      });
      optsBox.appendChild(btn);
    });

    card.append(head, prompt, optsBox, h('div', { class: 'pr-chip-row' }, [btnHint]), hintsBox, feedback, compareBox);
    panelTraps.appendChild(card);
  });

  btnTabPrng.addEventListener('click', () => {
    playClick();
    btnTabPrng.classList.add('is-active');
    btnTabTraps.classList.remove('is-active');
    panelPrng.hidden = false;
    panelTraps.hidden = true;
  });
  btnTabTraps.addEventListener('click', () => {
    playClick();
    btnTabTraps.classList.add('is-active');
    btnTabPrng.classList.remove('is-active');
    panelTraps.hidden = false;
    panelPrng.hidden = true;
  });

  seedInput.addEventListener('change', () => {
    const n = parseInt(seedInput.value, 10);
    if (Number.isFinite(n) && n > 0) {
      currentSeed = n;
      renderCascade();
    }
  });
  familySelect.addEventListener('change', () => {
    currentMode = familySelect.value;
    renderCascade();
  });
  btnNewSeed.addEventListener('click', () => {
    playClick();
    currentSeed = Math.floor(1000 + Math.random() * 90000);
    seedInput.value = String(currentSeed);
    renderCascade();
  });
  btnGen.addEventListener('click', () => {
    playClick();
    currentSeed += 1;
    seedInput.value = String(currentSeed);
    renderCascade();
  });

  host.append(tabBar, panelPrng, panelTraps);
  renderCascade();
  return { regenerate: renderCascade };
}

export const initRetosModule = mountSystemsRetos;
