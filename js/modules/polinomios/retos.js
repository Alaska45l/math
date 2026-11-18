/**
 * @file js/modules/polinomios/retos.js
 * Entrenador Contrastivo Infinito (PRNG Mulberry32 · 6 Familias cubriendo las 5 competencias)
 * + 5 Trampas Clásicas de Examen para Unidad 06 (Polinomios).
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { react as vnReact } from '../../core/vn.js';
import {
  polyFromDescending,
  polyAdd,
  polySub,
  polyMul,
  polyScale,
  polyDiv,
  ruffini,
  remainderTheorem,
  factorPolynomial,
  formatPoly,
  ratToString,
  validatePolynomialAttempt,
  rat,
} from './logic.js';
import { DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { recordPolyAttempt } from './learning-adapter.js';
import { getCompetencyById } from './competencies-map.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';

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
    id: 'poly_structure_equality',
    label: 'Estructura, grado, polinomio nulo e igualdad',
    competencyId: 'polynomials.structure_degree_and_equality',
  },
  {
    id: 'poly_arithmetic_degree_laws',
    label: 'Operaciones (P − Q, P · Q) y leyes del grado',
    competencyId: 'polynomials.arithmetic_and_degree_laws',
  },
  {
    id: 'poly_division_euclid',
    label: 'División euclídea P(x) = Q(x)·C(x) + R(x)',
    competencyId: 'polynomials.division_ruffini_and_remainder',
  },
  {
    id: 'ruffini_and_remainder',
    label: 'Regla de Ruffini (mónica y ax − b) y Teorema del Resto',
    competencyId: 'polynomials.division_ruffini_and_remainder',
  },
  {
    id: 'factoring_and_gauss_roots',
    label: 'Factorización en factores primos y Teorema de Gauss',
    competencyId: 'polynomials.factoring_and_gauss_roots',
  },
  {
    id: 'parameter_and_volume_modeling',
    label: 'Reconstrucción con parámetros y modelado geométrico',
    competencyId: 'polynomials.parameter_reconstruction_and_modeling',
  },
];

export function generatePolyChallenge(seed, forcedType = 'all', problemIndex = 0) {
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
    rng = problemIndex === 0
      ? mulberry32(seed >>> 0)
      : mulberry32(((seed >>> 0) + problemIndex * 7919 + 1013) >>> 0);
  }

  const type = typeObj.id;

  // 1. Structure & Equality
  if (type === 'poly_structure_equality') {
    const c0 = randChoice(rng, [-7, -3, 2, 5, 9]);
    const cMid = randChoice(rng, [-4, -2, 3, 6]);
    const cLead = randChoice(rng, [-5, -3, -2, 4, 7]);
    const deg = randChoice(rng, [3, 4, 5]);
    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 1 · Estructura y Grado',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      prompt: `Dado el polinomio desordenado P(x) = ${c0} + ${cMid}x + (${cLead})x^${deg}, indicá únicamente su coeficiente principal:`,
      inputKind: 'number',
      expected: cLead,
      placeholder: 'Ej: -3',
      diagContext: { target: 'leading_coeff', unorderedFirstCoeff: c0 },
      hints: [
        `Pista 1 (Orientación): No leas de izquierda a derecha sin mirar los exponentes: buscá el término donde x tenga el mayor exponente.`,
        `Pista 2 (Paso intermedio): Los exponentes presentes son 0, 1 y ${deg}. El término de mayor grado es (${cLead})x^${deg}.`,
        `Pista 3 (Remate): Extraé el número que multiplica a x^${deg} conservando su signo.`,
      ],
      explanation: `Al ordenar P(x) en forma decreciente queda (${cLead})x^${deg} + ${cMid}x + (${c0}); su grado es ${deg} y su coeficiente principal es ${cLead}.`,
    };
  }

  // 2. Arithmetic & degree laws (P - Q)
  if (type === 'poly_arithmetic_degree_laws') {
    const a3 = randChoice(rng, [1, 2, 3]);
    const a1 = randChoice(rng, [-3, -1, 2, 4]);
    const a0 = randChoice(rng, [1, 3, 5]);
    const b3 = randChoice(rng, [-1, 1, 2]);
    const b2 = randChoice(rng, [-4, -2, 2, 3]);
    const b1 = randChoice(rng, [-2, 1, 3]);
    const b0 = randChoice(rng, [-3, -1, 2]);
    const P = polyFromDescending([a3, 0, a1, a0]);
    const Q = polyFromDescending([b3, b2, b1, b0]);
    const diff = polySub(P, Q);
    const diffStr = formatPoly(diff, { unicodeMinus: false });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 2 · Resta y Signos',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      prompt: `Dados P(x) = ${formatPoly(P)} y Q(x) = ${formatPoly(Q)}, calculá P(x) − Q(x):`,
      inputKind: 'expression',
      expected: diffStr,
      placeholder: 'Ej: x^3 - 2x^2 + 3x + 4',
      diagContext: { target: 'subtract', P, Q },
      hints: [
        `Pista 1 (Orientación): Encerrá todo Q(x) entre paréntesis después del signo menos: P(x) − (${formatPoly(Q)}).`,
        `Pista 2 (Paso intermedio): Cambiá el signo de los cuatro términos de Q(x), recordando que en P(x) falta el término x² (vale 0x²).`,
        `Pista 3 (Remate): Sumá término a término los coeficientes de x³, x², x y las constantes.`,
      ],
      explanation: `Al distribuir el menos sobre todo Q(x) obtenemos (${formatPoly(P)}) + (${formatPoly(polySub([], Q))}) = ${formatPoly(diff)}.`,
    };
  }

  // 3. Euclidean Division
  if (type === 'poly_division_euclid') {
    const q1 = randChoice(rng, [1, 2]);
    const r = randChoice(rng, [-2, -1, 1, 2]);
    const c2 = randChoice(rng, [1, 2]);
    const c1 = randChoice(rng, [-3, -1, 2]);
    const c0 = randChoice(rng, [-2, 1, 3]);
    const rem1 = randChoice(rng, [-3, 2, 5]);
    const rem0 = randChoice(rng, [-4, 1, 3]);

    const Q = polyFromDescending([q1, 0, r]); // q1 x^2 + r
    const C = polyFromDescending([c2, c1, c0]);
    const R = polyFromDescending([rem1, rem0]);
    const P = polyAdd(polyMul(Q, C), R);
    const cStr = formatPoly(C, { unicodeMinus: false });

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 3 · División Euclídea',
      representation: 'symbolic',
      stage: 'guided_practice',
      transferDistance: 'near',
      prompt: `Dividí P(x) = ${formatPoly(P)} por Q(x) = ${formatPoly(Q)} y escribí únicamente el polinomio cociente C(x):`,
      inputKind: 'expression',
      expected: cStr,
      placeholder: 'Ej: x^2 - 3x + 1',
      diagContext: {},
      hints: [
        `Pista 1 (Orientación): Ordená y completá con ceros P(x) y dividí el término principal por ${q1}x².`,
        `Pista 2 (Paso intermedio): El primer término del cociente es ${c2}x². Multiplicá ${c2}x² por (${formatPoly(Q)}) y restalo debajo de P(x).`,
        `Pista 3 (Remate): Repetí el paso hasta que el resto tenga grado menor que 2 y anotá el cociente completo de grado 2.`,
      ],
      explanation: `Al ejecutar el algoritmo resulta P(x) = (${formatPoly(Q)})·(${formatPoly(C)}) + (${formatPoly(R)}), por lo que el cociente es ${formatPoly(C)}.`,
    };
  }

  // 4. Ruffini (monic & non-monic) + Remainder Theorem
  if (type === 'ruffini_and_remainder') {
    const isNonMonic = rng() < 0.45;
    if (isNonMonic) {
      const a = randChoice(rng, [2, 3]);
      const b = randChoice(rng, [-1, 1]);
      const p3 = a;
      const p2 = randChoice(rng, [-2, 1, 2]);
      const p1 = randChoice(rng, [-3, 1, 3]);
      const p0 = randChoice(rng, [-2, 1, 4]);
      const P = polyFromDescending([p3, p2, p1, p0]);
      const ruf = ruffini(P, { a, b });
      const qStr = formatPoly(ruf.quotient, { unicodeMinus: false });
      const divStr = `${a}x ${b > 0 ? '− ' + b : '+ ' + Math.abs(b)}`;

      return {
        seed,
        type,
        competencyId: typeObj.competencyId,
        badge: 'Familia 4 · Ruffini No Mónico',
        representation: 'symbolic',
        stage: 'transfer',
        transferDistance: 'near',
        prompt: `Aplicá Ruffini para dividir P(x) = ${formatPoly(P)} por (${divStr}) y escribí el cociente C(x) reescalado:`,
        inputKind: 'expression',
        expected: qStr,
        placeholder: 'Ej: x^2 + 1/3 x + 8/9',
        diagContext: { P, divisorA: a, divisorB: b },
        hints: [
          `Pista 1 (Orientación): La raíz del divisor (${divStr}) es r = ${ratToString(ruf.root)}. Poné ese valor en la esquina de Ruffini.`,
          `Pista 2 (Paso intermedio): Tras completar la tabla con r = ${ratToString(ruf.root)}, obtenés el cociente auxiliar ${formatPoly(ruf.quotientMonic)}, que corresponde a dividir por (x − r).`,
          `Pista 3 (Remate): Dividí todos los coeficientes del cociente auxiliar por a = ${a} para obtener el cociente verdadero C(x).`,
        ],
        explanation: `Dividiendo la tabla de Ruffini por a = ${a} resulta C(x) = ${formatPoly(ruf.quotient)} y resto R = ${ratToString(ruf.remainder)}.`,
      };
    }

    const r = randChoice(rng, [-3, -2, 2, 3]);
    const c3 = randChoice(rng, [1, 2]);
    const c0 = randChoice(rng, [-8, -5, 4, 7]);
    const P = polyFromDescending([c3, 0, -2, c0]); // missing x^2 term!
    const rem = remainderTheorem(P, r).remainder;
    const remNum = rem.n / rem.d;

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 4 · Ruffini y Resto',
      representation: 'symbolic',
      stage: 'retrieval',
      transferDistance: 'near',
      prompt: `Calculá el resto de dividir P(x) = ${formatPoly(P)} por (x ${r > 0 ? '− ' + r : '+ ' + Math.abs(r)}):`,
      inputKind: 'number',
      expected: remNum,
      placeholder: 'Ej: 12',
      diagContext: { target: 'remainder', P, divisorA: 1, divisorB: r },
      hints: [
        `Pista 1 (Orientación): Usá el Teorema del Resto o Ruffini completando el hueco 0x² en el dividendo.`,
        `Pista 2 (Paso intermedio): La raíz del divisor es r = ${r}, así que el resto coincide exactamente con P(${r}).`,
        `Pista 3 (Remate): Evaluá ${c3}·(${r})³ − 2·(${r}) + (${c0}) respetando los signos.`,
      ],
      explanation: `Por el Teorema del Resto, R = P(${r}) = ${ratToString(rem)}.`,
    };
  }

  // 5. Factoring & Gauss
  if (type === 'factoring_and_gauss_roots') {
    const a = randChoice(rng, [1, 2, 3]);
    const r1 = randChoice(rng, [-3, -2, -1]);
    const r2 = randChoice(rng, [1, 2, 4]);
    const useX = rng() < 0.4;
    const P = useX
      ? polyMul(polyFromDescending([a, 0]), polyMul(polyFromDescending([1, -r1]), polyFromDescending([1, -r2])))
      : polyMul(polyFromDescending([a, -a * r1]), polyMul(polyFromDescending([1, -r2]), polyFromDescending([1, 0, 1])));

    const fac = factorPolynomial(P);
    const expStr = fac.formatted.replace(/\u2212/g, '-');

    return {
      seed,
      type,
      competencyId: typeObj.competencyId,
      badge: 'Familia 5 · Factorización y Gauss',
      representation: 'symbolic',
      stage: 'transfer',
      transferDistance: 'far',
      prompt: `Factorizá por completo sobre ℝ el polinomio P(x) = ${formatPoly(P)}:`,
      inputKind: 'expression',
      requireForm: 'factored',
      expected: expStr,
      placeholder: 'Ej: 2x(x + 1)(x - 2)',
      diagContext: { expectedPoly: P },
      hints: [
        `Pista 1 (Orientación): Revisá primero si podés extraer factor común (${useX ? '¡aparece x en todos los términos!' : `el coeficiente principal es ${a}`}).`,
        `Pista 2 (Paso intermedio): Buscá las raíces racionales probando divisores de a₀ sobre divisores de a_n (${r1} y ${r2} anulan el núcleo).`,
        `Pista 3 (Remate): Escribí el producto empezando por el coeficiente principal a_n = ${a} seguido de todos los factores mónicos primos.`,
      ],
      explanation: `La descomposición en factores primos sobre ℝ es ${fac.formatted}.`,
    };
  }

  // 6. Parameter reconstruction & geometric modeling
  const rA = randChoice(rng, [-2, -1]);
  const rB = randChoice(rng, [2, 3]);
  const rC = randChoice(rng, [4, 5]);
  const aLead = randChoice(rng, [2, -1, 3]);
  const p0Eval = aLead * (1 - rA) * (1 - rB) * (1 - rC);
  const cubicPoly = polyScale(
    polyMul(polyMul(polyFromDescending([1, -rA]), polyFromDescending([1, -rB])), polyFromDescending([1, -rC])),
    rat(aLead)
  );
  const expCubic = formatPoly(cubicPoly, { unicodeMinus: false });

  return {
    seed,
    type: 'parameter_and_volume_modeling',
    competencyId: typeObj.competencyId,
    badge: 'Familia 6 · Reconstrucción Cúbica',
    representation: 'verbal',
    stage: 'transfer',
    transferDistance: 'far',
    prompt: `Reconstruí el polinomio P(x) de grado 3 cuyas raíces son ${rA}, ${rB} y ${rC}, sabiendo además que P(1) = ${p0Eval}. Escribilo en forma factorizada o desarrollada:`,
    inputKind: 'expression',
    expected: expCubic,
    placeholder: 'Ej: 2(x + 1)(x - 2)(x - 4)',
    diagContext: { expectedPoly: cubicPoly },
    hints: [
      `Pista 1 (Orientación): Planteá el molde general P(x) = a·(x − (${rA}))·(x − ${rB})·(x − ${rC}) sin asumir que a = 1.`,
      `Pista 2 (Paso intermedio): Evaluá en x = 1: P(1) = a·(${1 - rA})·(${1 - rB})·(${1 - rC}) = a·(${(1 - rA) * (1 - rB) * (1 - rC)}) = ${p0Eval}.`,
      `Pista 3 (Remate): Despejá el coeficiente principal a y sustituilo delante de los tres factores lineales.`,
    ],
    explanation: `Al resolver a·(${(1 - rA) * (1 - rB) * (1 - rC)}) = ${p0Eval} obtenemos a = ${aLead}, luego P(x) = ${aLead}(x + ${Math.abs(rA)})(x − ${rB})(x − ${rC}) = ${formatPoly(cubicPoly)}.`,
  };
}

export function generatePolyChallenges(seed, family = 'all', count = 6) {
  return Array.from({ length: count }, (_, idx) => generatePolyChallenge(seed, family, idx));
}

export const TRAPS = [
  {
    id: 'trap_1_binomial_cube',
    title: 'Trampa 1 · Repartir la potencia en binomios',
    subtitle: 'Confundir (x − 2)² o (x + 2)³ con sumar las potencias término a término.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Escribe (x − 2)² = x² − 4.',
        'Escribe (x + 2)³ = x³ + 8.',
        'Omite todos los términos cruzados del producto.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Multiplica el paréntesis por sí mismo: (x − 2)(x − 2) = x² − 4x + 4.',
        'Para el cubo usa (a + b)³ = a³ + 3a²b + 3ab² + b³: x³ + 6x² + 12x + 8.',
        'Nunca distribuye exponentes sobre sumas o restas.',
      ],
    },
    question: '¿Cuál es el desarrollo exacto de (x − 3)²?',
    options: [
      { label: 'x² − 9', correct: false, feedback: '¡Caíste en la trampa! Falta el doble producto −6x y el signo de (−3)² es +9.' },
      { label: 'x² − 6x + 9', correct: true, feedback: 'Exacto: x² + 2·x·(−3) + (−3)² = x² − 6x + 9.' },
      { label: 'x² − 3x + 9', correct: false, feedback: 'Falta multiplicar por 2 el término cruzado: −3x − 3x = −6x.' },
    ],
  },
  {
    id: 'trap_2_ruffini_zeros',
    title: 'Trampa 2 · Olvidar ceros faltantes en Ruffini',
    subtitle: 'Comprimir x³ − 8 como [1, −8] sin completar x² ni x.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Arma Ruffini de (x³ − 8) : (x − 2) poniendo solo [1, −8].',
        'Multiplica 1·2 = 2 y suma −8 + 2 = −6.',
        'Concluye que el resto es −6 y que 2 no es raíz.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Completa y ordena el dividendo: x³ + 0x² + 0x − 8 -> [1, 0, 0, −8].',
        'Aplica Ruffini con r = 2: baja 1 -> 2 -> 4 -> 8 + (−8) = 0.',
        'Obtiene C(x) = x² + 2x + 4 y resto R = 0.',
      ],
    },
    question: 'Al aplicar Ruffini a (2x⁴ − 2) : (x − 1), ¿qué fila superior se escribe?',
    options: [
      { label: '2, 0, 0, 0, −2', correct: true, feedback: '¡Perfecto! Los tres ceros guardan los lugares de x³, x² y x.' },
      { label: '2, −2', correct: false, diagnosticId: 'ruffini_forgot_missing_zero_coeff', feedback: 'Si omitís los ceros de x³, x² y x, el cociente pierde el grado correcto.' },
      { label: '−2, 0, 0, 0, 2', correct: false, feedback: 'El renglón va ordenado de mayor grado (x⁴) a término independiente.' },
    ],
  },
  {
    id: 'trap_3_nonmonic_ruffini',
    title: 'Trampa 3 · Ruffini con divisor (ax − b) sin reescalar',
    subtitle: 'Aplicar Ruffini a (3x + 1) usando r = −1/3 y olvidar dividir el cociente por 3.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Divide 3x³ + 2x² + 3x − 2 por (3x + 1) con r = −1/3 en Ruffini.',
        'Lee la fila inferior [3, 1, 8/3 | −26/9].',
        'Entrega C(x) = 3x² + x + 8/3 sin dividir por 3.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'La tabla da la división por (x + 1/3): C₀(x) = 3x² + x + 8/3 y R = −26/9.',
        'Como 3x + 1 = 3·(x + 1/3), el cociente verdadero es C(x) = C₀(x) / 3.',
        'Resulta C(x) = x² + (1/3)x + 8/9, mientras el resto R = −26/9 no cambia.',
      ],
    },
    question: 'Si dividimos P(x) por (2x − 6) usando Ruffini con r = 3, ¿qué hay que hacer al final?',
    options: [
      { label: 'Dividir solo el cociente C₀(x) por 2 y dejar el resto R intacto', correct: true, feedback: '¡Exacto! Porque P(x) = (x − 3)·C₀(x) + R = (2x − 6)·(C₀(x)/2) + R.' },
      { label: 'Dividir tanto el cociente como el resto por 2', correct: false, diagnosticId: 'ruffini_unscaled_nonmonic_quotient', feedback: 'El resto R = P(3) NO se divide por 2; solo se divide el cociente.' },
      { label: 'Usar r = 6 directamente en la esquina de Ruffini', correct: false, feedback: 'La raíz de 2x − 6 = 0 es x = 6/2 = 3, no 6.' },
    ],
  },
  {
    id: 'trap_4_leading_coeff_factor',
    title: 'Trampa 4 · Perder a_n o frenar antes de primos',
    subtitle: 'Escribir (x − 1)(x + 3) olvidando el 2, o dejar (x² − 7) sin factorizar.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'Halla las raíces −1/2 y 1 de 2x⁴ − x³ − 15x² + 7x + 7.',
        'Escribe (x + 1/2)(x − 1)(x² − 7).',
        'Olvida el coeficiente principal 2 y deja (x² − 7) reducible sin factorizar.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Conserva siempre el coeficiente principal a₄ = 2 adelante del producto.',
        'Descompone x² − 7 = (x − √7)(x + √7) porque Δ > 0 en ℝ.',
        'Escribe 2(x + 1/2)(x − 1)(x − √7)(x + √7).',
      ],
    },
    question: '¿Cuál es la factorización completa en ℝ de P(x) = 3x² − 12?',
    options: [
      { label: '(x − 2)(x + 2)', correct: false, diagnosticId: 'forgot_leading_coeff_factoring', feedback: '¡Falta el coeficiente principal a₂ = 3 multiplicando adelante!' },
      { label: '3(x² − 4)', correct: false, feedback: 'Falta completar la diferencia de cuadrados (x² − 4) = (x − 2)(x + 2).' },
      { label: '3(x − 2)(x + 2)', correct: true, feedback: '¡Impecable! Coeficiente principal 3 y factores mónicos primos.' },
    ],
  },
  {
    id: 'trap_5_gauss_inverted',
    title: 'Trampa 5 · Invertir p/q en Gauss u olvidar x = 0',
    subtitle: 'Confundir divisores del término independiente con divisores del coeficiente principal.',
    wrongAttempt: {
      author: 'Resolución Saboteada',
      steps: [
        'En 3x⁴ − x³ − 6x² + 2x toma q = 2 y p = 3, ignorando que a₀ = 0.',
        'Busca candidatos ±3/2 en vez de sacar factor común x primero.',
      ],
    },
    correctResolution: {
      author: 'Resolución Rigurosa',
      steps: [
        'Como a₀ = 0, extrae x de factor común primero: x(3x³ − x² − 6x + 2).',
        'Aplica Gauss al núcleo cúbico: p | 2 y q | 3, hallando la raíz racional r = 1/3.',
        'Cierra la cuadrática 3x² − 6 = 3(x − √2)(x + √2).',
      ],
    },
    question: 'Para P(x) = 5x³ − 4x + 2, ¿qué candidatos racionales permite el Teorema de Gauss?',
    options: [
      { label: '±1, ±2, ±1/5, ±2/5', correct: true, feedback: '¡Correcto! p divide a a₀ = 2 ({1, 2}) y q divide a a₃ = 5 ({1, 5}).' },
      { label: '±1, ±5, ±1/2, ±5/2', correct: false, diagnosticId: 'swapped_p_q_in_gauss', feedback: 'Invertiste la fracción: pusiste divisores de a₃ arriba y de a₀ abajo.' },
      { label: 'Solo ±1 y ±2', correct: false, feedback: 'Como a₃ = 5 ≠ 1, también entran los racionales con denominador 5.' },
    ],
  },
];

export function mountPolyRetos(root, { vn } = {}) {
  if (!root) return;
  clear(root);

  const state = {
    seed: 2026,
    family: 'all',
    streak: 0,
    solvedCount: 0,
    problemsState: {},
  };

  const tabsHeader = h('div', { class: 'poly-retos-tabs pr-chip-row' });
  const tabPrng = h('button', { type: 'button', class: 'pr-chip is-active' }, [
    chalkIcon('spark', 15),
    ' 1. Entrenador Infinito por Semilla PRNG (6 Familias)',
  ]);
  const tabTraps = h('button', { type: 'button', class: 'pr-chip' }, [
    chalkIcon('shield', 15),
    ' 2. Las 5 Trampas Clásicas de Examen',
  ]);
  tabsHeader.append(tabPrng, tabTraps);

  const prngPane = h('div', { class: 'poly-retos-pane' });
  const trapsPane = h('div', { class: 'poly-retos-pane', hidden: '' });

  const seedInput = h('input', {
    type: 'number',
    class: 'pr-check-input',
    value: String(state.seed),
    'aria-label': 'Semilla PRNG',
  });
  const familySelect = h('select', { class: 'pr-check-input poly-family-select', 'aria-label': 'Familia de ejercicios' }, [
    h('option', { value: 'all' }, 'Mixto (Las 6 familias)'),
    h('option', { value: 'adaptativo' }, 'Inteligente (Según tu evidencia)'),
    ...CHALLENGE_TYPES.map((t) => h('option', { value: t.id }, t.label)),
  ]);
  const nextSeedBtn = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('play', 14), ' Siguiente semilla']);
  const randSeedBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, 'Aleatoria');
  const progressPill = h('span', { class: 'exp-trainer-progress-pill' }, '0/6 resueltos · Racha indep.: 0');
  const adaptiveNote = h('p', { class: 'small muted', hidden: '' });

  const toolbar = h('div', { class: 'exp-trainer-toolbar' }, [
    h('label', { class: 'exp-trainer-field' }, [h('span', {}, 'Semilla'), seedInput]),
    h('label', { class: 'exp-trainer-field exp-trainer-field--grow' }, [h('span', {}, 'Familia / Modo'), familySelect]),
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
    const verifyBtn = h('button', { type: 'button', class: 'pr-btn' }, [chalkIcon('check', 14), ' Verificar']);
    const hintBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('bulb', 14), ` Pista (0/${ch.hints.length})`]);
    const solutionBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, [chalkIcon('spark', 14), ' Ver solución explicada']);
    const hintsBox = h('div', { class: 'poly-check-hints', hidden: '' });
    const feedbackBox = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

    hintBtn.addEventListener('click', () => {
      playClick();
      if (hintIndex < ch.hints.length) {
        hintsBox.removeAttribute('hidden');
        hintsBox.appendChild(h('div', { class: 'poly-hint-item' }, ch.hints[hintIndex]));
        hintIndex += 1;
        hintBtn.textContent = hintIndex < ch.hints.length ? `Pista (${hintIndex}/${ch.hints.length})` : 'Pistas completas';
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
        recordPolyAttempt({
          exerciseId: `poly-reto-${ch.type}-${idx}`,
          competencyId: ch.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintIndex,
          solutionRevealed: true,
          representation: ch.representation || 'symbolic',
          stage: ch.stage || 'transfer',
          transferDistance: ch.transferDistance || 'far',
        });
      } catch {}
      updatePill();
    });

    const onVerify = () => {
      if (solutionRevealed || inputEl.disabled) return;
      const res = validatePolynomialAttempt({
        kind: ch.inputKind,
        input: inputEl.value,
        expected: ch.expected,
        requireForm: ch.requireForm || null,
        diagContext: ch.diagContext || {},
      });
      if (res.empty) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = 'Escribí un valor o expresión antes de verificar.';
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
          h('strong', {}, isIndependent ? ' ¡Correcto! [Logro Independiente] ' : ' ¡Correcto! [Logro Asistido] '),
          h('span', {}, ch.explanation)
        );
        try {
          recordPolyAttempt({
            exerciseId: `poly-reto-${ch.type}-${idx}`,
            competencyId: ch.competencyId,
            correct: true,
            mode: isIndependent ? 'independent' : 'assisted',
            hintsUsed: hintIndex,
            solutionRevealed: false,
            representation: ch.representation || 'symbolic',
            stage: ch.stage || 'transfer',
            transferDistance: ch.transferDistance || 'far',
          });
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
      if (res.equivalentWrongForm) {
        feedbackBox.className = 'pr-check-feedback is-warn';
        feedbackBox.textContent = DIAGNOSE_REACTIONS.equivalent_form.text;
        return;
      }
      const diag = res.diagnostic;
      try {
        recordPolyAttempt({
          exerciseId: `poly-reto-${ch.type}-${idx}`,
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
      } catch {}
      feedbackBox.className = 'pr-check-feedback is-error';
      feedbackBox.textContent = diag
        ? diag.message
        : 'Todavía no coincide. Usá «Pista» para revisar el paso intermedio.';
      if (diag) {
        if (vn && typeof vn.react === 'function') vn.react(diag.pose, diag.message);
        else vnReact({ pose: diag.pose, tag: diag.shortLabel, html: diag.message });
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
      { class: 'exp-challenge-card poly-reto-card', 'data-problem-index': String(idx) },
      h('div', { class: 'exp-challenge-card__header' }, [
        h('span', { class: 'exp-challenge-card__badge' }, `Reto ${idx + 1} · ${ch.badge}`),
        statusEl,
      ]),
      h('p', { class: 'pr-check-prompt' }, ch.prompt),
      h('div', { class: 'exp-challenge-card__input-row' }, [inputEl]),
      h('div', { class: 'poly-reto-actions pr-chip-row' }, [verifyBtn, hintBtn, solutionBtn]),
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
      const candidateFamilies = CHALLENGE_TYPES.map((f) => ({
        id: f.id,
        family: f.id,
        competencyId: f.competencyId,
        label: f.label,
      }));
      challenges = [];
      let prevComp = null;
      for (let i = 0; i < 6; i++) {
        const sel = selectAdaptiveExercise({
          moduleId: 'polinomios',
          availableExercises: candidateFamilies,
          previousCompetencyId: prevComp,
        });
        const fam = sel.exercise?.family || CHALLENGE_TYPES[i % CHALLENGE_TYPES.length].id;
        const ch = generatePolyChallenge(state.seed, fam, i);
        prevComp = sel.targetCompetencyId || sel.exercise?.competencyId;
        challenges.push(ch);
      }
      const firstComp = getCompetencyById(challenges[0]?.competencyId);
      adaptiveNote.removeAttribute('hidden');
      adaptiveNote.textContent = `Selección adaptativa activa: priorizando «${firstComp?.title || 'Polinomios'}» según tu evidencia.`;
    } else {
      challenges = generatePolyChallenges(state.seed, state.family, 6);
    }

    challenges.forEach((ch, idx) => cascadeList.appendChild(createCard(ch, idx)));
    updatePill();
  }

  seedInput.addEventListener('change', () => {
    state.seed = Number(seedInput.value) >>> 0;
    seedInput.value = String(state.seed);
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
    renderCascade();
  });
  randSeedBtn.addEventListener('click', () => {
    playClick();
    state.seed = Math.floor(Math.random() * 1000000) >>> 0;
    seedInput.value = String(state.seed);
    renderCascade();
  });

  // Tab 2: 5 Exam Traps
  const trapChips = h('div', { class: 'pr-chip-row' });
  const trapBody = h('div', { class: 'poly-trap-body' });
  trapsPane.append(trapChips, trapBody);

  function renderTrap(idx) {
    const trap = TRAPS[idx];
    Array.from(trapChips.children).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    clear(trapBody);

    const feedback = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });
    const opts = h(
      'div',
      { class: 'poly-trap-options pr-options' },
      trap.options.map((opt) => {
        const btn = h('button', { type: 'button', class: 'pr-option' }, opt.label);
        btn.addEventListener('click', () => {
          Array.from(opts.children).forEach((s) => s.classList.remove('is-selected', 'is-correct', 'is-wrong'));
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
      h('h3', { class: 'poly-trap-title' }, trap.title),
      h('p', { class: 'muted' }, trap.subtitle),
      h('div', { class: 'poly-trap-compare' }, [
        h('div', { class: 'poly-trap-col is-wrong' }, [
          h('div', { class: 'poly-trap-col-head' }, [chalkIcon('cross', 15), ` ${trap.wrongAttempt.author}`]),
          h('ol', {}, trap.wrongAttempt.steps.map((s) => h('li', {}, s))),
        ]),
        h('div', { class: 'poly-trap-col is-right' }, [
          h('div', { class: 'poly-trap-col-head' }, [chalkIcon('check', 15), ` ${trap.correctResolution.author}`]),
          h('ol', {}, trap.correctResolution.steps.map((s) => h('li', {}, s))),
        ]),
      ]),
      h('p', { class: 'pr-check-prompt' }, trap.question),
      opts,
      feedback
    );
  }

  TRAPS.forEach((_, idx) => {
    trapChips.appendChild(
      h(
        'button',
        {
          type: 'button',
          class: `pr-chip${idx === 0 ? ' is-active' : ''}`,
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

  tabPrng.addEventListener('click', () => {
    playClick();
    tabPrng.classList.add('is-active');
    tabTraps.classList.remove('is-active');
    prngPane.removeAttribute('hidden');
    trapsPane.setAttribute('hidden', '');
  });
  tabTraps.addEventListener('click', () => {
    playClick();
    tabTraps.classList.add('is-active');
    tabPrng.classList.remove('is-active');
    trapsPane.removeAttribute('hidden');
    prngPane.setAttribute('hidden', '');
  });

  renderCascade();
  renderTrap(0);
  root.append(tabsHeader, prngPane, trapsPane);
}

export const initRetosModule = mountPolyRetos;
