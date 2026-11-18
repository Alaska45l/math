/**
 * @file js/modules/funciones-trigonometricas/retos.js
 * Entrenador Determinista por Semilla Mulberry32 (8 familias cubriendo las 4 competencias)
 * + 5 Trampas Clásicas de Examen para Unidad 11 · Funciones Trigonométricas.
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import {
  TRIG_FUNCTIONS_SPEC,
  principalRepPi,
  formatPiRat,
  formatCongruenceClass,
  cartesianSixRatios,
  exactTrigFromGiven,
  exactTrigAtSpecialAngle,
  solveElementaryTrigEq,
  solveQuadraticTrigEq,
  validateTrigFunctionsAttempt,
  rat,
  ratToNumber,
  fmtNumberEsAR,
  MINUS_CHAR,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import {
  MODULE_ID,
  getProgressStore,
  recordTrigFunctionsAttempt,
} from './learning-adapter.js';
import { notifyCompetencyDashboardUpdate } from './components.js';
import { getCompetencyById } from './competencies-map.js';

export const SEED_STORAGE_KEY = 'funciones-trigonometricas:seed';

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
    id: 'congruence_principal_rep',
    label: 'Congruencia y representante principal en [0; 2π) / C_α',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
  },
  {
    id: 'cartesian_def_six_ratios',
    label: 'Definición cartesiana (abs, ord, r.v.) de las 6 funciones',
    competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
  },
  {
    id: 'six_functions_domain_image_period',
    label: 'Dominios diferenciados, imágenes y períodos de las 6 funciones',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
  },
  {
    id: 'bijectivity_domain_restriction',
    label: 'Intervalos de signo y restricciones para biyectividad',
    competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
  },
  {
    id: 'exact_quadrant_six_ratios',
    label: 'Relación pitagórica exacta por cuadrante (radicales racionalizados)',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
  },
  {
    id: 'first_quadrant_reduction_numeric',
    label: 'Reducción al primer cuadrante y valores exactos notables',
    competencyId: 'trig_functions.pythagorean_identities_and_reduction',
  },
  {
    id: 'trig_equation_0_to_2pi',
    label: 'Ecuaciones trigonométricas en [0; 2π) (doble rama y cuadráticas)',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
  },
  {
    id: 'trig_equation_periodic_R_classes',
    label: 'Ecuaciones en ℝ como unión de clases C_α con control de polos',
    competencyId: 'trig_functions.periodic_equations_and_domain_checks',
  },
];

export function generateTrigFunctionsChallenge(seed, forcedType = 'all', problemIndex = 0) {
  const isAll = !forcedType || forcedType === 'all' || forcedType === 'aleatorio';
  let typeObj;
  let rng;

  if (isAll) {
    const baseRng = mulberry32(seed >>> 0);
    const baseIdx = Math.floor(baseRng() * CHALLENGE_TYPES.length);
    typeObj = CHALLENGE_TYPES[(baseIdx + problemIndex) % CHALLENGE_TYPES.length];
    rng = mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  } else {
    typeObj = CHALLENGE_TYPES.find((t) => t.id === forcedType) || CHALLENGE_TYPES[0];
    rng =
      problemIndex === 0
        ? mulberry32(seed >>> 0)
        : mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. Congruence principal representative
  if (type === 'congruence_principal_rep') {
    const cases = [
      { n: -1, d: 3 },
      { n: 7, d: 2 },
      { n: 9, d: 2 },
      { n: 12, d: 5 },
      { n: -5, d: 4 },
      { n: 19, d: 6 },
      { n: 31, d: 6 },
      { n: -7, d: 3 },
      { n: 13, d: 4 },
      { n: -11, d: 6 },
    ];
    const picked = randChoice(rng, cases);
    const rawRat = rat(picked.n, picked.d);
    const rep = principalRepPi(rawRat);
    const classAns = formatCongruenceClass(rep.repRat, { system: 'rad' });
    const askClass = rng() < 0.5;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Congruencia y representante principal',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: askClass ? 'congruence_class' : 'angle',
      defaultSystem: 'rad',
      requireExactPi: !askClass,
      requirePrincipal: true,
      prompt: askClass
        ? `Expresá la clase de congruencia de α = ${formatPiRat(rawRat)} usando su representante principal en [0; 2π) (ej. C_{aπ/b}):`
        : `Determiná el representante principal en [0; 2π) (como múltiplo exacto de π) del ángulo α = ${formatPiRat(rawRat)}:`,
      expected: askClass ? classAns : rep.formatted,
      placeholder: askClass ? 'Ej: C_{mπ/n}' : 'Ej: mπ/n',
      diagContext: {
        target: askClass ? 'congruence' : 'principal_rep',
      },
      hints: [
        'Un giro completo mide 2π radianes. Sumá o restá múltiplos enteros de 2π hasta caer dentro de [0; 2π).',
        `Escribí 2π con denominador ${picked.d}: 2π = ${2 * picked.d}π/${picked.d}.`,
        askClass
          ? 'Tomá el resto positivo en [0; 2π) y colocalo como subíndice dentro de la notación C_{...} sin dejar signos negativos.'
          : 'Conservá el resto positivo como fracción irreducible multiplicada por π (sin usar decimales).',
      ],
      explanation: `${formatPiRat(rawRat)} = ${rep.formatted} + (${rep.turnsK})·2π ⇒ representante principal ${rep.formatted}, clase ${classAns}.`,
    };
  }

  // 2. Cartesian definition (abs, ord, r.v.)
  if (type === 'cartesian_def_six_ratios') {
    const points = [
      { abs: -3, ord: 4 },
      { abs: -5, ord: -12 },
      { abs: 8, ord: -15 },
      { abs: -4, ord: -3 },
      { abs: 12, ord: -5 },
      { abs: -7, ord: 24 },
      { abs: -8, ord: 6 },
    ];
    const p = randChoice(rng, points);
    const ratios = cartesianSixRatios(p);
    const targets = [
      { fn: 'sin', label: 'sen(α)', val: ratios.exact.sin, swapped: ratios.exact.cos, wrongRecip: ratios.exact.csc },
      { fn: 'cos', label: 'cos(α)', val: ratios.exact.cos, swapped: ratios.exact.sin, wrongRecip: ratios.exact.sec },
      { fn: 'sec', label: 'sec(α)', val: ratios.exact.sec, swapped: ratios.exact.csc, wrongRecip: ratios.exact.csc },
      { fn: 'csc', label: 'cosec(α)', val: ratios.exact.csc, swapped: ratios.exact.sec, wrongRecip: ratios.exact.sec },
      { fn: 'tan', label: 'tg(α)', val: ratios.exact.tan, swapped: ratios.exact.cot, wrongRecip: ratios.exact.cot },
    ];
    const t = randChoice(rng, targets);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Definición cartesiana (abs, ord, r.v.)',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      inputKind: 'radical',
      tol: 1e-3,
      prompt: `El lado terminal de α pasa por el punto P(${p.abs < 0 ? MINUS_CHAR + Math.abs(p.abs) : p.abs}; ${p.ord < 0 ? MINUS_CHAR + Math.abs(p.ord) : p.ord}). Calculá el valor exacto de ${t.label}:`,
      expected: t.val.formatted,
      placeholder: 'Ej: ±p/q',
      diagContext: {
        swappedAbsOrdValue: t.swapped.formatted,
        wrongReciprocalValue: t.wrongRecip.formatted,
        checkSignFlip: true,
      },
      hints: [
        `Primero hallá el radio vector r.v. = √(abs² + ord²) = √((${p.abs})² + (${p.ord})²) > 0.`,
        `Recordá la definición cartesiana: sen α = ord / r.v., cos α = abs / r.v., tg α = ord / abs (y sus recíprocas).`,
        'Simplificá la fracción conservando el signo correcto de la abscisa y/u ordenada del cuadrante.',
      ],
      explanation: `r.v. = ${ratios.exact.rv.formatted}; luego ${t.label} = ${t.val.formatted}.`,
    };
  }

  // 3. Six functions domain / image / period
  if (type === 'six_functions_domain_image_period') {
    const fns = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
    const fnKey = randChoice(rng, fns);
    const spec = TRIG_FUNCTIONS_SPEC[fnKey];
    const askType = randChoice(rng, ['domain', 'image', 'period']);

    if (askType === 'period') {
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 3 · Período de las 6 funciones',
        representation: 'graphical',
        stage: 'retrieval',
        transferDistance: 'near',
        inputKind: 'angle',
        defaultSystem: 'rad',
        requireExactPi: true,
        requirePrincipal: false,
        prompt: `Indicá el período fundamental T (en radianes exactos con π) de la función f(x) = ${spec.label}:`,
        expected: spec.periodText,
        placeholder: 'Ej: kπ',
        diagContext: { target: 'period', fnName: fnKey },
        hints: [
          `Pensá cada cuánto se repite exactamente el patrón completo de la gráfica de ${spec.label}.`,
          'sen, cos, sec y cosec tienen período 2π, mientras que los cocientes tg y cotg repiten cada medio giro.',
          'Escribí el múltiplo exacto de π correspondiente al período fundamental de esta función.',
        ],
        explanation: `El período de f(x) = ${spec.label} es T = ${spec.periodText}.`,
      };
    }

    if (askType === 'image') {
      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 3 · Imagen de las 6 funciones',
        representation: 'graphical',
        stage: 'retrieval',
        transferDistance: 'near',
        inputKind: 'set_or_interval',
        prompt: `Indicá el conjunto imagen Im(f) de la función f(x) = ${spec.label} (en notación Exactas, ej. ℝ o [a; b] o (−∞; −1] ∪ [1; +∞)):`,
        expected: spec.imageText,
        placeholder: 'Ej: [a; b] o ℝ',
        diagContext: { target: 'range_check', fnName: fnKey },
        hints: [
          'Observá la proyección de toda la curva sobre el eje vertical Y.',
          'sen/cos oscilan entre −1 y 1; tg/cotg cubren todos los reales; sec/cosec dejan vacío (−1; 1).',
          'Verificá si los extremos −1 y 1 pertenecen a la imagen (corchetes cerrados) o si abarca ℝ completo.',
        ],
        explanation: `La imagen de f(x) = ${spec.label} es ${spec.imageText}.`,
      };
    }

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · Dominio diferenciado',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      inputKind: 'set',
      prompt: `Indicá el dominio máximo real Dom(f) de f(x) = ${spec.label} (ej. ℝ, ℝ − (C_{π/2} ∪ C_{3π/2}) o ℝ − (C_0 ∪ C_π)):`,
      expected: spec.domainText,
      placeholder: 'Ej: ℝ − (C_a ∪ C_b)',
      diagContext: { target: 'domain_six_functions', fnName: fnKey },
      hints: [
        `Revisá qué función trigonométrica aparece en el denominador de ${spec.label}.`,
        'Si divide por cos x, hay polos en π/2 + kπ; si divide por sen x, los polos están en kπ; si no hay denominador variable, el dominio es todo ℝ.',
        'Expresá los reales menos la unión de clases de congruencia excluidas (o ℝ si no hay exclusiones).',
      ],
      explanation: `Dom(${spec.label}) = ${spec.domainText}.`,
    };
  }

  // 4. Bijectivity restriction & sign intervals
  if (type === 'bijectivity_domain_restriction') {
    const scenarios = [
      {
        prompt: 'Indicá el intervalo restringido estándar de dominio para que f(x) = sen x (con codominio [−1; 1]) resulte biyectiva:',
        expected: '[−π/2; π/2]',
        hint1: 'Necesitás un intervalo continuo donde sen x sea estrictamente creciente de −1 a +1 sin repetir alturas.',
        hint2: 'Arranca en el mínimo más cercano al origen (en −π/2 vale −1) y termina en el máximo (+π/2 vale +1).',
        sol: 'En [−π/2; π/2] → [−1; 1], sen x es estrictamente creciente y biyectiva.',
      },
      {
        prompt: 'Indicá el intervalo restringido estándar de dominio para que f(x) = cos x (con codominio [−1; 1]) resulte biyectiva:',
        expected: '[0; π]',
        hint1: 'Necesitás un tramo continuo donde cos x baje de +1 a −1 sin repetir valores.',
        hint2: 'En x = 0 vale +1 y en x = π vale −1, recorriendo toda la imagen sin volver a subir.',
        sol: 'En [0; π] → [−1; 1], cos x es estrictamente decreciente y biyectiva.',
      },
      {
        prompt: 'Indicá el intervalo abierto estándar de dominio para que f(x) = tg x (con codominio ℝ) resulte biyectiva:',
        expected: '(−π/2; π/2)',
        hint1: 'Elegí la rama central continua de tg x encerrada entre sus dos asíntotas verticales más próximas al origen.',
        hint2: 'Los bordes tienen asíntotas donde cos x = 0, por lo tanto van con paréntesis abiertos.',
        sol: 'En (−π/2; π/2) → ℝ, tg x recorre todo ℝ de forma estrictamente creciente.',
      },
      {
        prompt: 'Indicá el intervalo abierto estándar de dominio para que f(x) = cotg x (con codominio ℝ) resulte biyectiva:',
        expected: '(0; π)',
        hint1: 'Buscá una rama completa de cotg x entre dos polos consecutivos donde sen x = 0.',
        hint2: 'Los primeros polos no negativos donde sen x = 0 son 0 y π, y no entran en el dominio.',
        sol: 'En (0; π) → ℝ, cotg x es estrictamente decreciente y biyectiva.',
      },
      {
        prompt: 'Determiná el conjunto de todos los x ∈ [0; 2π) tales que cos x > 0:',
        expected: '[0; π/2) ∪ (3π/2; 2π)',
        hint1: 'cos x es positivo en el primer cuadrante y en el cuarto cuadrante (abscisa positiva).',
        hint2: 'En x = 0 vale 1 (> 0, va cerrado) y en π/2 y 3π/2 vale 0 (estricto > 0, van abiertos).',
        sol: 'cos x > 0 en [0; π/2) ∪ (3π/2; 2π).',
      },
    ];
    const sc = randChoice(rng, scenarios);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Restricción biyectiva e intervalos',
      representation: 'graphical',
      stage: 'transfer',
      transferDistance: 'near',
      inputKind: 'interval',
      prompt: sc.prompt,
      expected: sc.expected,
      placeholder: 'Ej: [a; b] o (a; b)',
      diagContext: { target: 'bijectivity' },
      hints: [
        sc.hint1,
        sc.hint2,
        'Revisá cuidadosamente si los extremos del intervalo pertenecen al dominio (corchetes) o deben quedar excluidos (paréntesis).',
      ],
      explanation: sc.sol,
    };
  }

  // 5. Exact quadrant 6 ratios (Pythagorean + rationalized)
  if (type === 'exact_quadrant_six_ratios') {
    const cases = [
      { givenFn: 'sin', givenVal: '-3/4', cond: 'tg α > 0', q: 3, askFn: 'sec', askLabel: 'sec(α)' },
      { givenFn: 'sin', givenVal: '-3/5', cond: 'α ∈ III cuadrante', q: 3, askFn: 'cos', askLabel: 'cos(α)' },
      { givenFn: 'cos', givenVal: '-1/5', cond: '90° < α < 180°', q: 2, askFn: 'tan', askLabel: 'tg(α)' },
      { givenFn: 'tan', givenVal: '-2', cond: '270° < α < 360°', q: 4, askFn: 'sin', askLabel: 'sen(α)' },
      { givenFn: 'sec', givenVal: '-2√2', cond: 'π < α < 3π/2', q: 3, askFn: 'cot', askLabel: 'cotg(α)' },
      { givenFn: 'cos', givenVal: '3/5', cond: 'sen α < 0', q: 4, askFn: 'csc', askLabel: 'cosec(α)' },
    ];
    const c = randChoice(rng, cases);
    const res = exactTrigFromGiven({ fn: c.givenFn, value: c.givenVal, quadrant: c.q });
    const targetEr = res[c.askFn];
    const oppositeEr = `-${targetEr.formatted.replace(MINUS_CHAR, '')}`.replace(/^--/, '');

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Pitagórica exacta racionalizada',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'radical',
      requireRationalized: true,
      tol: 1e-4,
      prompt: `Sabiendo que ${c.givenFn === 'sin' ? 'sen' : c.givenFn === 'tan' ? 'tg' : c.givenFn}(α) = ${c.givenVal} y ${c.cond}, calculá en forma exacta y racionalizada ${c.askLabel}:`,
      expected: targetEr.formatted,
      placeholder: 'Ej: ±a√b/c',
      diagContext: {
        target: 'pythagorean_quadrant',
        checkSignFlip: true,
        wrongSignValue: oppositeEr,
        requireRationalized: true,
      },
      hints: [
        `Primero ubicá el cuadrante de α (${['I', 'II', 'III', 'IV'][c.q - 1]}) para fijar los signos de sen, cos y tg.`,
        'Usá sen² α + cos² α = 1 (o 1 + tg² α = sec²) para hallar la razón complementaria sin redondear.',
        'Racionalizá el denominador si queda una raíz cuadrada y aplicá el signo correspondiente al cuadrante.',
      ],
      explanation: `En el cuadrante ${['I', 'II', 'III', 'IV'][c.q - 1]}: sen α = ${res.sin.formatted}, cos α = ${res.cos.formatted} ⇒ ${c.askLabel} = ${targetEr.formatted}.`,
    };
  }

  // 6. First quadrant reduction & notable evaluation
  if (type === 'first_quadrant_reduction_numeric') {
    const items = [
      {
        exprText: 'sen(45°)·cos(135°) + cos(30°)·cotg(45°)',
        expected: '(-1 + √3)/2',
        numVal: (-1 + Math.sqrt(3)) / 2,
        hint1: 'Reducí cos(135°) al primer cuadrante: 135° ∈ QII ⇒ cos(135°) = −cos(45°) = −√2/2.',
        hint2: 'Reemplazá sen(45°) = √2/2, cos(30°) = √3/2 y cotg(45°) = 1.',
        sol: '(√2/2)(−√2/2) + (√3/2)(1) = −1/2 + √3/2 ≈ 0,3660.',
      },
      {
        exprText: '2·sen(150°) − cos(180°) + tg(45°)',
        expected: '3',
        numVal: 3,
        hint1: 'sen(150°) = +sen(30°) = 1/2 (positivo en QII), cos(180°) = −1 y tg(45°) = 1.',
        hint2: 'Tené mucho cuidado con el doble menos en −cos(180°) = −(−1) = +1.',
        sol: '2·(1/2) − (−1) + 1 = 1 + 1 + 1 = 3.',
      },
      {
        exprText: 'sen(2π/3)·cos(2π) + cos(11π/6)',
        expected: '√3',
        numVal: Math.sqrt(3),
        hint1: '2π/3 está en QII (ref π/3) ⇒ sen(2π/3) = √3/2; 11π/6 está en QIV (ref π/6) ⇒ cos(11π/6) = +√3/2.',
        hint2: 'cos(2π) = 1, así que ambos términos suman lo mismo.',
        sol: '(√3/2)·1 + √3/2 = √3 ≈ 1,7321.',
      },
      {
        exprText: 'cos(5π/4) · sen(7π/4)',
        expected: '0.5',
        numVal: 0.5,
        hint1: '5π/4 ∈ QIII (ref π/4): cos(5π/4) = −√2/2. 7π/4 ∈ QIV (ref π/4): sen(7π/4) = −√2/2.',
        hint2: 'El producto de dos factores negativos es positivo.',
        sol: '(−√2/2)·(−√2/2) = 2/4 = 1/2 = 0,5.',
      },
      {
        exprText: 'tg(3π/4) + sec(2π/3)',
        expected: '-3',
        numVal: -3,
        hint1: '3π/4 ∈ QII ⇒ tg(3π/4) = −tg(π/4) = −1. 2π/3 ∈ QII ⇒ cos(2π/3) = −1/2.',
        hint2: 'sec(2π/3) = 1 / cos(2π/3) = −2.',
        sol: '−1 + (−2) = −3.',
      },
    ];
    const picked = randChoice(rng, items);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 6 · Reducción al I cuadrante',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      inputKind: 'number',
      tol: 0.01,
      prompt: `Reduciendo al primer cuadrante, calculá el valor numérico (decimal o exacto) de: ${picked.exprText}`,
      expected: picked.numVal,
      placeholder: 'Ej: a,bc o p/q',
      diagContext: { target: 'reduction', wrongReductionValue: -picked.numVal },
      hints: [
        picked.hint1,
        picked.hint2,
        'Operá los términos manteniendo los signos propios de cada cuadrante y simplificá la suma final.',
      ],
      explanation: picked.sol,
    };
  }

  // 7. Trig equations in [0; 2π)
  if (type === 'trig_equation_0_to_2pi') {
    const eqCases = [
      {
        label: '2·sen²(x) = 1',
        sol: solveQuadraticTrigEq({ fnName: 'sin', a: 2, b: 0, c: -1, domain: '0_2pi' }),
        h1: 'Despejá sen²(x) = 1/2, por lo que sen(x) = ±√2/2.',
        h2: 'Considerá las dos ramas (+√2/2 en QI/QII y −√2/2 en QIII/QIV).',
      },
      {
        label: '4·cos²(x) − 1 = 0',
        sol: solveQuadraticTrigEq({ fnName: 'cos', a: 4, b: 0, c: -1, domain: '0_2pi' }),
        h1: 'Despejá cos²(x) = 1/4 ⇒ cos(x) = +1/2 o cos(x) = −1/2.',
        h2: 'Cada valor de cos(x) aporta dos soluciones en [0; 2π).',
      },
      {
        label: '2·cos²(x) − cos(x) = 0',
        sol: solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: -1, c: 0, domain: '0_2pi' }),
        h1: 'Sacá factor común: cos(x)·(2cos(x) − 1) = 0.',
        h2: 'Un producto es cero cuando cos(x) = 0 o cuando cos(x) = 1/2.',
      },
      {
        label: 'cos²(x) + cos(x)/2 − 1/2 = 0 (2cos² x + cos x − 1 = 0)',
        sol: solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: 1, c: -1, domain: '0_2pi' }),
        h1: 'Sustituí u = cos(x) en 2u² + u − 1 = 0 y hallá las dos raíces u₁ = 1/2 y u₂ = −1.',
        h2: 'Resolvé cos(x) = 1/2 (dos soluciones) y cos(x) = −1 (una solución) en [0; 2π).',
      },
      {
        label: 'tg(x) = −1',
        sol: solveElementaryTrigEq('tan', -1, { domain: '0_2pi' }),
        h1: 'La tangente es negativa en los cuadrantes II y IV.',
        h2: 'El ángulo de referencia en QI con tg = 1 es π/4.',
      },
    ];
    const eq = randChoice(rng, eqCases);

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 7 · Ecuaciones en [0; 2π)',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      inputKind: 'solution_set',
      prompt: `Hallá todos los x ∈ [0; 2π) que satisfacen la ecuación ${eq.label} (escribí el conjunto entre llaves separado por ";"):`,
      expected: eq.sol.formatted0To2Pi,
      placeholder: 'Ej: {π/m; kπ/m}',
      diagContext: { target: 'trig_equation' },
      hints: [
        eq.h1,
        eq.h2,
        'Escribí todas las soluciones dentro del primer giro positivo [0; 2π) como múltiplos exactos de π entre llaves.',
      ],
      explanation: `Las soluciones en [0; 2π) son ${eq.sol.formatted0To2Pi}.`,
    };
  }

  // 8. Periodic equations in R with congruence classes & pole checks
  const rCases = [
    {
      label: '[(1 − sen x)(√3 − tg x)] / cos x = 0',
      sol: solveElementaryTrigEq('tan', '√3', { domain: 'R', excludedConditions: ['cos_zero'] }),
      poles: [Math.PI / 2, 1.5 * Math.PI],
      h1: 'Para que la fracción valga 0, el numerador debe anularse y el denominador cos x ≠ 0.',
      h2: '1 − sen x = 0 da x = π/2, pero allí cos(π/2) = 0 (¡se rechaza!). Solo queda tg x = √3.',
    },
    {
      label: '2·cosec x − 2·sen x = cotg x',
      sol: solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: -1, c: 0, domain: 'R', excludedConditions: ['sin_zero'] }),
      poles: [0, Math.PI],
      h1: 'Pasá todo a sen y cos (exigiendo sen x ≠ 0): 2(1 − sen² x) = cos x ⇒ 2cos² x − cos x = 0.',
      h2: 'Sacando factor común queda cos x = 0 (en π/2 y 3π/2) o cos x = 1/2 (en π/3 y 5π/3); ninguno anula sen x.',
    },
    {
      label: '2·sen²(x) + cos(x) = 1',
      sol: solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: -1, c: -1, domain: 'R' }),
      poles: [],
      h1: 'Reemplazá sen²(x) = 1 − cos²(x) para obtener 2(1 − cos² x) + cos x = 1 ⇒ 2cos² x − cos x − 1 = 0.',
      h2: 'Las raíces auxiliares son cos x = 1 (en 0) y cos x = −1/2 (en 2π/3 y 4π/3).',
    },
    {
      label: 'cos²(x) + 2·sen²(x) = 7/4',
      sol: solveQuadraticTrigEq({ fnName: 'sin', a: 4, b: 0, c: -3, domain: 'R' }),
      poles: [],
      h1: 'Usá cos²(x) = 1 − sen²(x): queda 1 + sen²(x) = 7/4 ⇒ sen²(x) = 3/4.',
      h2: 'Al sacar raíz, sen(x) = +√3/2 o sen(x) = −√3/2: hay 4 clases simétricas con ángulo de referencia π/3.',
    },
    {
      label: '2·cos(x) − sec(x) = 0',
      sol: solveQuadraticTrigEq({ fnName: 'cos', a: 2, b: 0, c: -1, domain: 'R', excludedConditions: ['cos_zero'] }),
      poles: [Math.PI / 2, 1.5 * Math.PI],
      h1: 'Reemplazá sec x = 1/cos x (exigiendo cos x ≠ 0) y multiplicá por cos x: queda 2cos²(x) − 1 = 0.',
      h2: 'cos(x) = ±√2/2 genera cuatro ángulos en [0; 2π) con referencia π/4.',
    },
  ];
  const rc = randChoice(rng, rCases);

  return {
    seed,
    type,
    competencyId: typeObj.competencyId,
    badge: 'Familia 8 · Ecuaciones periódicas en ℝ (Clases C_α)',
    representation: 'symbolic',
    stage: 'transfer',
    transferDistance: 'far',
    inputKind: 'congruence_union',
    requirePrincipal: true,
    prompt: `Determiná todos los x ∈ ℝ que verifican ${rc.label} como unión de clases de congruencia C_α con representante en [0; 2π):`,
    expected: rc.sol.formattedR,
    placeholder: 'Ej: C_{π/m} ∪ C_{kπ/m}',
    diagContext: {
      target: 'trig_equation',
      poleValues: rc.poles,
    },
    hints: [
      rc.h1,
      rc.h2,
      'Verificá que ninguna candidata anule un denominador, reducí cada ángulo al intervalo [0; 2π) y uní todas las clases con ∪.',
    ],
    explanation: `Solución periódica en ℝ: ${rc.sol.formattedR}.`,
  };
}

export function generateTrigFunctionsChallenges(seed = 202611, family = 'all', count = 6) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(generateTrigFunctionsChallenge(seed, family, i));
  }
  return out;
}

export function selectAdaptiveTrigFunctionsFamily({ store, now = new Date(), previousCompetencyId = null } = {}) {
  const activeStore = store || getProgressStore();
  return selectAdaptiveExercise({
    availableExercises: CHALLENGE_TYPES,
    store: activeStore,
    moduleId: MODULE_ID,
    now,
    previousCompetencyId,
  });
}

export const TRAPS = [
  {
    id: 'trap-identical-domains',
    title: 'Trampa 1 · Creer que tg, cotg, sec y cosec tienen el mismo dominio',
    subtitle: 'Un clásico de parcial de Verdadero/Falso sobre dominios excluidos.',
    wrongAttempt: {
      author: 'Error frecuente',
      steps: [
        '«Todas las derivadas tienen asíntotas, así que Dom(tg) = Dom(cotg) = ℝ − {kπ}.»',
        'No verifica qué función anula cada denominador.',
      ],
    },
    rightApproach: {
      author: 'Rigor UNMDP',
      steps: [
        'tg x = sen x / cos x y sec x = 1 / cos x excluyen cos x = 0 ⇒ ℝ − (C_{π/2} ∪ C_{3π/2}).',
        'cotg x = cos x / sen x y cosec x = 1 / sen x excluyen sen x = 0 ⇒ ℝ − (C₀ ∪ C_π).',
      ],
    },
    question: '¿Cuál de estas afirmaciones sobre el dominio es VERDADERA?',
    options: [
      {
        label: 'En x = 0, tg(0) = 0 existe en el dominio de tg x, pero cosec(0) y cotg(0) no existen.',
        correct: true,
        feedback: '¡Exacto! cos(0) = 1 ≠ 0 habilita tg(0) y sec(0), mientras sen(0) = 0 excluye x = 0 de cotg y cosec.',
      },
      {
        label: 'tg x y cosec x tienen exactamente los mismos valores excluidos del dominio.',
        correct: false,
        feedback: 'Falso: tg x excluye C_{π/2} ∪ C_{3π/2} (cos = 0) y cosec x excluye C₀ ∪ C_π (sen = 0).',
      },
    ],
  },
  {
    id: 'trap-pythagorean-sign',
    title: 'Trampa 2 · Olvidar el signo ± al despejar sen² α + cos² α = 1',
    subtitle: 'Caso típico: sen α = −3/4 y tg α > 0.',
    wrongAttempt: {
      author: 'Despeje mecánico',
      steps: [
        'cos α = √(1 − (−3/4)²) = +√7/4.',
        'Ignora que tg α > 0 junto con sen α < 0 obliga al III cuadrante.',
      ],
    },
    rightApproach: {
      author: 'Control de cuadrante',
      steps: [
        'sen α < 0 (III o IV) y tg α > 0 (I o III) ⇒ α ∈ III cuadrante.',
        'En el III cuadrante cos α < 0 ⇒ cos α = −√7/4 y sec α = −4√7/7.',
      ],
    },
    question: 'Si cos α = −1/5 y 90° < α < 180°, ¿qué signo tiene sen α?',
    options: [
      {
        label: 'Positivo (+2√6/5), porque en el II cuadrante la ordenada es positiva.',
        correct: true,
        feedback: '¡Correcto! Entre 90° y 180° (II cuadrante), sen α > 0 y cos α < 0.',
      },
      {
        label: 'Negativo (−2√6/5), porque cos α venía con signo menos.',
        correct: false,
        feedback: 'No: en el II cuadrante el coseno es negativo pero el seno es positivo.',
      },
    ],
  },
  {
    id: 'trap-second-branch',
    title: 'Trampa 3 · Devolver una sola rama de la calculadora',
    subtitle: 'Ecuaciones como cos x = 1/2 o 4cos² x − 1 = 0 en [0; 2π) o ℝ.',
    wrongAttempt: {
      author: 'Solo arccos(1/2)',
      steps: [
        'La calculadora dice π/3, entonces responde S = C_{π/3}.',
        'Omite 5π/3 en el IV cuadrante (y las ramas negativas en cuadráticas).',
      ],
    },
    rightApproach: {
      author: 'Barrido completo del giro',
      steps: [
        'cos x = 1/2 vale en QI (π/3) y QIV (2π − π/3 = 5π/3).',
        'Para 4cos² x − 1 = 0 hay 4 clases: C_{π/3} ∪ C_{2π/3} ∪ C_{4π/3} ∪ C_{5π/3}.',
      ],
    },
    question: 'En [0; 2π), ¿cuántas soluciones reales tiene 4cos² x − 1 = 0?',
    options: [
      {
        label: '4 soluciones: {π/3; 2π/3; 4π/3; 5π/3}.',
        correct: true,
        feedback: '¡Perfecto! cos x = +1/2 aporta 2 y cos x = −1/2 aporta otras 2.',
      },
      {
        label: '1 sola solución: {π/3}.',
        correct: false,
        feedback: 'Falta el signo negativo de la raíz cuadrada y los cuadrantes simétricos.',
      },
    ],
  },
  {
    id: 'trap-pole-root',
    title: 'Trampa 4 · Aceptar una raíz que anula el denominador o cae en un polo',
    subtitle: 'Ecuación [(1 − sen x)(√3 − tg x)] / cos x = 0.',
    wrongAttempt: {
      author: 'Solo igualar numerador a 0',
      steps: [
        '1 − sen x = 0 ⇒ x = π/2.',
        'Incluye C_{π/2} en la respuesta sin chequear cos(π/2) = 0 abajo.',
      ],
    },
    rightApproach: {
      author: 'Aduana de dominio',
      steps: [
        'Exigimos cos x ≠ 0 (denominador y dominio de tg x).',
        'x = π/2 queda descartado; solo sobrevive tg x = √3 ⇒ C_{π/3} ∪ C_{4π/3}.',
      ],
    },
    question: '¿Qué ocurre con x = π/2 en [(1 − sen x)(√3 − tg x)] / cos x = 0?',
    options: [
      {
        label: 'Se descarta porque cos(π/2) = 0 anula el denominador y tg(π/2) no existe.',
        correct: true,
        feedback: '¡Brillante! Jamás aceptes una candidata que rompa el dominio de la ecuación original.',
      },
      {
        label: 'Es solución válida porque 1 − sen(π/2) = 0 anula el numerador.',
        correct: false,
        feedback: 'Error grave: 0/0 está indefinido y además tg(π/2) no existe en ℝ.',
      },
    ],
  },
  {
    id: 'trap-period-and-negative-rep',
    title: 'Trampa 5 · Confundir período π de tg x con 2π, o dejar representantes negativos',
    subtitle: 'Cuidado al leer gráficos y al escribir clases de congruencia C_α.',
    wrongAttempt: {
      author: 'Automatismo de seno',
      steps: [
        'Dice que tg x tiene período 2π igual que sen x.',
        'Escribe C_{−π/3} en lugar de reducir al representante en [0; 2π).',
      ],
    },
    rightApproach: {
      author: 'Precisión de cátedra',
      steps: [
        'tg x y cotg x tienen período π; sen, cos, sec y cosec tienen período 2π.',
        '−π/3 + 2π = 5π/3 ∈ [0; 2π) ⇒ escribir C_{5π/3}.',
      ],
    },
    question: '¿Cuál es el período fundamental de tg x y cuál es el representante principal de −π/3?',
    options: [
      {
        label: 'Período π; representante principal 5π/3 (C_{5π/3}).',
        correct: true,
        feedback: '¡Exacto! tg(x + π) = tg(x) y −π/3 + 2π = 5π/3 ∈ [0; 2π).',
      },
      {
        label: 'Período 2π; representante principal −π/3.',
        correct: false,
        feedback: 'Dos errores juntos: el período de tg x es π y −π/3 es negativo (fuera de [0; 2π)).',
      },
    ],
  },
];

export function mountTrigFunctionsRetos(host, { vn } = {}) {
  if (!host) return null;
  clear(host);

  let initialSeed = 202611;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      const saved = Number(localStorage.getItem(SEED_STORAGE_KEY));
      if (Number.isInteger(saved) && saved >= 0) initialSeed = saved;
    }
  } catch {}

  const state = {
    tab: 'prng',
    seed: initialSeed,
    family: 'all',
    streak: 0,
    solvedCount: 0,
  };

  const saveSeed = (sVal) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(SEED_STORAGE_KEY, String(sVal));
      }
    } catch {}
  };

  const tabPrngBtn = h('button', { type: 'button', class: 'pr-chip is-active' }, [
    chalkIcon('spark', 15),
    ' 1. Entrenador por Semilla PRNG (8 familias)',
  ]);
  const tabTrapsBtn = h('button', { type: 'button', class: 'pr-chip' }, [
    chalkIcon('glasses', 15),
    ' 2. Las 5 Trampas Clásicas de Examen',
  ]);
  const tabsBar = h('div', { class: 'pr-chip-row trigf-retos-tabs', role: 'tablist' }, [tabPrngBtn, tabTrapsBtn]);

  const prngPane = h('div', { class: 'trigf-retos-pane' });
  const trapsPane = h('div', { class: 'trigf-retos-pane', hidden: '' });

  const seedInput = h('input', {
    type: 'number',
    class: 'pr-check-input',
    value: String(state.seed),
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h(
    'select',
    { class: 'pr-check-input trigf-family-select', 'aria-label': 'Familia de ejercicios' },
    [
      h('option', { value: 'all' }, 'Mixto (Las 8 familias)'),
      h('option', { value: 'adaptativo' }, 'Inteligente (Según tu evidencia)'),
      ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
    ]
  );
  const nextSeedBtn = h('button', { type: 'button', class: 'pr-btn' }, [
    chalkIcon('play', 14),
    ' Siguiente semilla',
  ]);
  const randSeedBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, 'Aleatoria');
  const progressPill = h('span', { class: 'exp-trainer-progress-pill' }, '0/6 resueltos · Racha indep.: 0');
  const adaptiveNote = h('p', { class: 'small muted', hidden: '' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', {}, 'Semilla'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [
      h('span', {}, 'Familia / Modo'),
      familySelect,
    ]),
    h('div', { class: 'exp-trainer-toolbar__btns' }, [nextSeedBtn, randSeedBtn]),
    progressPill,
  ]);
  const cascadeList = h('ol', { class: 'exp-challenges-cascade' });
  prngPane.append(toolbar, adaptiveNote, cascadeList);

  const updatePill = () => {
    progressPill.textContent = `${state.solvedCount}/6 resueltos · Racha indep.: ${state.streak}`;
  };

  function createCard(ch, idx) {
    let hintIndex = 0;
    let solutionRevealed = false;
    const statusEl = h('span', { class: 'exp-challenge-card__status' }, 'Pendiente');
    const inputEl = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: ch.placeholder,
      'aria-label': ch.prompt,
    });
    const verifyBtn = h('button', { type: 'button', class: 'pr-btn' }, [
      chalkIcon('check', 14),
      ' Verificar',
    ]);
    const hintBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('bulb', 14),
      ` Pista (0/${ch.hints.length})`,
    ]);
    const solutionBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [
      chalkIcon('spark', 14),
      ' Ver solución explicada',
    ]);
    const hintsBox = h('div', { class: 'trigf-check-hints', hidden: '' });
    const feedbackBox = h('div', {
      class: 'pr-check-feedback',
      role: 'status',
      'aria-live': 'polite',
    });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintIndex < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'trigf-hint-item' }, ch.hints[hintIndex]));
        hintIndex += 1;
        hintBtn.replaceChildren(
          chalkIcon('bulb', 14),
          hintIndex < ch.hints.length ? ` Pista (${hintIndex}/${ch.hints.length})` : ' Pistas completas'
        );
      }
    });

    solutionBtn.addEventListener('click', () => {
      playClick();
      if (solutionRevealed) return;
      solutionRevealed = true;
      state.streak = 0;
      inputEl.disabled = true;
      verifyBtn.disabled = true;
      hintBtn.disabled = true;
      solutionBtn.disabled = true;
      statusEl.textContent = 'Solución vista (Asistido)';
      statusEl.className = 'exp-challenge-card__status is-solution';
      feedbackBox.className = 'pr-check-feedback is-ok is-solution';
      feedbackBox.replaceChildren(
        chalkIcon('spark', 14),
        h('strong', {}, ' Solución explicada: '),
        h('span', {}, `${ch.explanation} (Respuesta: ${ch.expected})`)
      );
      try {
        recordTrigFunctionsAttempt({
          exerciseId: `trigf-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintIndex,
          solutionRevealed: true,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      updatePill();
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled) return;
      const res = validateTrigFunctionsAttempt({
        kind: ch.inputKind,
        input: inputEl.value,
        expected: ch.expected,
        tol: ch.tol ?? 1e-3,
        tolDeg: ch.tolDeg ?? 0.05,
        tolRad: ch.tolRad ?? 1e-3,
        requireExactPi: Boolean(ch.requireExactPi),
        requirePrincipal: ch.requirePrincipal !== false,
        requireRationalized: Boolean(ch.requireRationalized),
        defaultSystem: ch.defaultSystem || 'rad',
        diagContext: ch.diagContext || {},
      });
      if (res.empty) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'Escribí un valor antes de verificar.';
        return;
      }
      if (res.ok) {
        playSuccess();
        const isIndependent = hintIndex === 0 && !solutionRevealed;
        if (isIndependent) state.streak += 1;
        state.solvedCount += 1;
        inputEl.disabled = true;
        verifyBtn.disabled = true;
        hintBtn.disabled = true;
        solutionBtn.disabled = true;
        card.classList.add('is-solved');
        statusEl.textContent = isIndependent ? 'Resuelto (Independiente)' : 'Resuelto (Con apoyo)';
        statusEl.className = `exp-challenge-card__status ${isIndependent ? 'is-solved-indep' : 'is-solved-assisted'}`;
        feedbackBox.className = 'pr-check-feedback is-ok';
        feedbackBox.replaceChildren(
          chalkIcon(isIndependent ? 'spark' : 'bulb', 14),
          h(
            'strong',
            {},
            isIndependent ? ' ¡Correcto! [Logro Independiente] ' : ' ¡Correcto! [Logro Asistido] '
          ),
          h('span', {}, ch.explanation)
        );
        try {
          recordTrigFunctionsAttempt({
            exerciseId: `trigf-reto-${ch.type}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: isIndependent ? 'independent' : 'assisted',
            hintsUsed: hintIndex,
            solutionRevealed: false,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
          notifyCompetencyDashboardUpdate();
        } catch {}
        updatePill();
        if (isIndependent && STREAK_REACTIONS[state.streak]) {
          const sr = STREAK_REACTIONS[state.streak];
          if (vn && typeof vn.react === 'function') vn.react(sr.pose, sr.text);
          else vnReact(sr);
        }
        return;
      }

      playError();
      state.streak = 0;
      updatePill();
      if (res.syntaxError) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = res.syntaxError;
        return;
      }
      if (res.needsExactPi) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'El valor numérico coincide, pero expresalo como múltiplo exacto de π.';
        return;
      }
      const diag = res.diagnostic;
      try {
        recordTrigFunctionsAttempt({
          exerciseId: `trigf-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: false,
          mode: hintIndex > 0 ? 'assisted' : 'independent',
          hintsUsed: hintIndex,
          solutionRevealed: false,
          diagnosticId: diag?.id || null,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
        notifyCompetencyDashboardUpdate();
      } catch {}
      feedbackBox.className = 'pr-check-feedback is-error';
      feedbackBox.textContent = diag
        ? diag.message
        : 'Todavía no coincide. Usá «Pista» para revisar cuadrantes, polos o clases C_α.';
      if (diag) {
        if (vn && typeof vn.react === 'function') vn.react(diag.pose, diag.message);
        else vnReact({ pose: diag.pose, tag: diag.tag || diag.shortLabel, html: diag.message });
      }
    };

    verifyBtn.addEventListener('click', onVerify);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onVerify();
      }
    });

    const card = h(
      'li',
      { class: 'exp-challenge-card trigf-reto-card', 'data-problem-index': String(idx) },
      h('div', { class: 'exp-challenge-card__header' }, [
        h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
        statusEl,
      ]),
      h('p', { class: 'pr-check-prompt' }, ch.prompt),
      h('div', { class: 'exp-challenge-card__input-row' }, [inputEl]),
      h('div', { class: 'trigf-reto-actions pr-chip-row' }, [verifyBtn, hintBtn, solutionBtn]),
      hintsBox,
      feedbackBox
    );
    return card;
  }

  function renderCascade() {
    clear(cascadeList);
    state.solvedCount = 0;
    adaptiveNote.setAttribute('hidden', '');
    let challenges;

    if (state.family === 'adaptativo') {
      const store = getProgressStore();
      const now = new Date();
      challenges = [];
      let prevComp = null;
      let firstSelection = null;
      for (let i = 0; i < 6; i++) {
        const sel = selectAdaptiveTrigFunctionsFamily({
          store,
          now,
          previousCompetencyId: prevComp,
        });
        if (i === 0) firstSelection = sel;
        const fam = sel.exercise?.id || CHALLENGE_TYPES[i % CHALLENGE_TYPES.length].id;
        const ch = generateTrigFunctionsChallenge(state.seed, fam, i);
        prevComp = sel.targetCompetencyId || sel.exercise?.competencyId;
        challenges.push(ch);
      }
      const firstComp = getCompetencyById(firstSelection?.targetCompetencyId || challenges[0]?.competencyId);
      adaptiveNote.removeAttribute('hidden');
      adaptiveNote.textContent = firstSelection?.selectionReason
        ? `Selección adaptativa: ${firstSelection.selectionReason} Prioridad: «${firstComp?.title || 'Funciones Trigonométricas'}».`
        : `Selección adaptativa activa: priorizando «${firstComp?.title || 'Funciones Trigonométricas'}» según tu evidencia.`;
    } else {
      challenges = generateTrigFunctionsChallenges(state.seed, state.family, 6);
    }

    challenges.forEach((ch, idx) => cascadeList.appendChild(createCard(ch, idx)));
    updatePill();
  }

  seedInput.addEventListener('change', () => {
    state.seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  familySelect.addEventListener('change', () => {
    state.family = familySelect.value;
    renderCascade();
  });
  nextSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed += 1;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });
  randSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed = Math.floor(Math.random() * 1000000) >>> 0;
    seedInput.value = String(state.seed);
    saveSeed(state.seed);
    renderCascade();
  });

  // Tab 2: 5 Exam Traps
  const trapChips = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'trigf-trap-body' });
  trapsPane.append(trapChips, trapBody);

  function renderTrap(idx) {
    const trap = TRAPS[idx];
    Array.from(trapChips.children).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    clear(trapBody);

    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const opts = h(
      'div',
      { class: 'trigf-trap-options pr-options' },
      trap.options.map((opt) => {
        const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
        btn.addEventListener('click', () => {
          Array.from(opts.children).forEach((s) =>
            s.classList.remove('is-selected', 'is-correct', 'is-wrong')
          );
          btn.classList.add('is-selected');
          if (opt.correct) {
            playSuccess();
            btn.classList.add('is-correct');
            feedback.className = 'pr-check-feedback is-ok';
          } else {
            playError();
            btn.classList.add('is-wrong');
            feedback.className = 'pr-check-feedback is-error';
          }
          feedback.textContent = opt.feedback;
        });
        return btn;
      })
    );

    trapBody.append(
      h('h3', { class: 'trigf-trap-title' }, trap.title),
      h('p', { class: 'muted' }, trap.subtitle),
      h('div', { class: 'trigf-trap-compare' }, [
        h('div', { class: 'trigf-trap-col is-wrong' }, [
          h('div', { class: 'trigf-trap-col-head' }, [
            chalkIcon('cross', 15),
            ` ${trap.wrongAttempt.author}`,
          ]),
          h('ol', {}, trap.wrongAttempt.steps.map((st) => h('li', {}, st))),
        ]),
        h('div', { class: 'trigf-trap-col is-right' }, [
          h('div', { class: 'trigf-trap-col-head' }, [
            chalkIcon('check', 15),
            ` ${trap.rightApproach.author}`,
          ]),
          h('ol', {}, trap.rightApproach.steps.map((st) => h('li', {}, st))),
        ]),
      ]),
      h('p', { class: 'trigf-trap-q' }, [h('strong', {}, trap.question)]),
      opts,
      feedback
    );
  }

  TRAPS.forEach((t, idx) => {
    trapChips.appendChild(
      h(
        'button',
        {
          type: 'button',
          class: `pr-chip ${idx === 0 ? 'is-active' : ''}`,
          on: {
            click: () => {
              playClick();
              renderTrap(idx);
            },
          },
        },
        `Trampa ${idx + 1}`
      )
    );
  });

  const setTab = (tab) => {
    state.tab = tab;
    tabPrngBtn.classList.toggle('is-active', tab === 'prng');
    tabTrapsBtn.classList.toggle('is-active', tab === 'traps');
    if (tab === 'prng') {
      prngPane.removeAttribute('hidden');
      trapsPane.setAttribute('hidden', '');
    } else {
      prngPane.setAttribute('hidden', '');
      trapsPane.removeAttribute('hidden');
    }
  };
  tabPrngBtn.addEventListener('click', () => {
    playClick();
    setTab('prng');
  });
  tabTrapsBtn.addEventListener('click', () => {
    playClick();
    setTab('traps');
  });

  host.append(tabsBar, prngPane, trapsPane);
  renderCascade();
  renderTrap(0);

  return { state, renderCascade };
}

export const initRetosModule = mountTrigFunctionsRetos;
