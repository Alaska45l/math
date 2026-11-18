/**
 * @file js/modules/polinomios/index.js
 * Orquestador principal de Unidad 06: Polinomios (polinomios.html).
 * 7 pizarrones, 6 widgets SVG sobre board-kit.js, 21 chequeos con 8-tupla y 63 pistas únicas.
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedPolyFormula,
  createCheckBlock,
  bindTutorButtons,
  mountProgress,
  mountCompetencyDashboard,
  getCompetencyReport,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
} from './components.js';
import {
  POLY_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
} from './competencies-map.js';
import {
  VN_SCRIPTS,
  SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from './vn-scripts.js';
import {
  mountPolyRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generatePolyChallenge,
  generatePolyChallenges,
  TRAPS,
  mulberry32,
} from './retos.js';
import { polyFromDescending } from './logic.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-1',
    chapter: 'Capítulo 1 · Estructura y Operaciones',
    title: 'Definición, grado, coeficientes, polinomio nulo e igualdad',
    short: '1 · Estructura',
  },
  {
    id: 'sec-2',
    chapter: 'Capítulo 1 · Estructura y Operaciones',
    title: 'Suma, resta, producto, leyes del grado y despeje de P(x)',
    short: '2 · Operaciones',
  },
  {
    id: 'sec-3',
    chapter: 'Capítulo 2 · División y Ruffini',
    title: 'Algoritmo de división euclídea P(x) = Q(x)·C(x) + R(x) y divisibilidad',
    short: '3 · División',
  },
  {
    id: 'sec-4',
    chapter: 'Capítulo 2 · División y Ruffini',
    title: 'Regla de Ruffini (mónica y ax − b) y Teorema del Resto',
    short: '4 · Ruffini y Resto',
  },
  {
    id: 'sec-5',
    chapter: 'Capítulo 3 · Factorización y Gauss',
    title: 'Factorización en factores primos, los 6 métodos y multiplicidad',
    short: '5 · Factorización',
  },
  {
    id: 'sec-6',
    chapter: 'Capítulo 3 · Factorización y Gauss',
    title: 'Teorema de Gauss, raíces racionales e irracionales encadenadas',
    short: '6 · Gauss',
  },
  {
    id: 'sec-7',
    chapter: 'Capítulo 4 · Parámetros y Modelos',
    title: 'Parámetros desconocidos, reconstrucción cúbica y modelado geométrico',
    short: '7 · Modelado',
  },
];

export const CHECKS_DATA = {
  'sec-1': [
    {
      id: 'sec1-q1',
      competencyId: 'polynomials.structure_degree_and_equality',
      prerequisiteIds: [],
      family: 'poly_structure_equality',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['wrong_leading_coeff_unordered'],
      kind: 'number',
      prompt: 'Dado el polinomio desordenado P(x) = 5 − 3x² + 2x⁴, ¿cuál es su coeficiente principal?',
      expected: 2,
      placeholder: 'Ej: 2',
      diagContext: { target: 'leading_coeff', unorderedFirstCoeff: 5 },
      hints: [
        'No mires únicamente el primer número de la izquierda: en un polinomio desordenado, el término independiente 5 puede aparecer primero.',
        'Ordená mentalmente de mayor a menor exponente: 2x⁴ − 3x² + 5 tiene grado 4.',
        'Identificá el número que acompaña a la potencia x⁴ para reportar el coeficiente principal.',
      ],
      solution: 'Al ordenar P(x) = 2x⁴ − 3x² + 5, la mayor potencia es x⁴ y su coeficiente principal es 2.',
    },
    {
      id: 'sec1-q2',
      competencyId: 'polynomials.structure_degree_and_equality',
      prerequisiteIds: [],
      family: 'poly_structure_equality',
      representation: 'verbal',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['zero_poly_degree_zero', 'non_polynomial_accepted'],
      kind: 'choice',
      prompt: '¿Cuál de estas afirmaciones sobre el polinomio nulo P(x) = 0 y las expresiones algebraicas es verdadera?',
      options: [
        {
          label: 'P(x) = 0 no tiene grado, y 5/(3x − 1) no es polinomio porque x figura en el divisor.',
          correct: true,
        },
        {
          label: 'P(x) = 0 tiene grado 0 igual que P(x) = 5.',
          correct: false,
          diagnosticId: 'zero_poly_degree_zero',
        },
        {
          label: 'Tanto x⁻² como √x son polinomios con coeficientes reales.',
          correct: false,
          diagnosticId: 'non_polynomial_accepted',
        },
      ],
      hints: [
        'Recordá qué exige la definición de polinomio para los exponentes de la indeterminada x.',
        'Una constante distinta de cero (como 5 = 5x⁰) sí tiene grado 0, mientras que 0 no tiene un único exponente máximo no nulo.',
        'Combiná esa propiedad del polinomio nulo con el rechazo de x en denominadores, raíces o exponentes negativos.',
      ],
      solution: 'El polinomio nulo P(x) = 0 es el único sin grado, y 5/(3x − 1) queda fuera por tener variable en el denominador.',
    },
    {
      id: 'sec1-q3',
      competencyId: 'polynomials.structure_degree_and_equality',
      prerequisiteIds: [],
      family: 'poly_structure_equality',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['wrong_leading_coeff_unordered'],
      kind: 'number',
      prompt: 'Determiná el valor real de b para que los polinomios 3x² − 2x + 2 y a(x² − x) + b(x − 1) + c(x² − 3x + 4) sean iguales:',
      expected: 4,
      placeholder: 'Ej: 4',
      diagContext: {},
      hints: [
        'Agrupá los términos semejantes del segundo polinomio: coeficiente de x² es (a + c), de x es (−a + b − 3c) y constante es (−b + 4c).',
        'Igualando con 3x² − 2x + 2 obtenés tres ecuaciones: a + c = 3, −a + b − 3c = −2 y −b + 4c = 2.',
        'Sumá las dos primeras ecuaciones para eliminar a, obteniendo b − 2c = 1, y combinala con la ecuación del término independiente para hallar c = 3/2 y despejar b.',
      ],
      solution: 'De a + c = 3 y −a + b − 3c = −2 resulta b − 2c = 1; sumando −b + 4c = 2 da 2c = 3 => c = 3/2, y entonces b = 4c − 2 = 4.',
    },
  ],

  'sec-2': [
    {
      id: 'sec2-q1',
      competencyId: 'polynomials.arithmetic_and_degree_laws',
      prerequisiteIds: ['polynomials.structure_degree_and_equality'],
      family: 'poly_arithmetic_degree_laws',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['subtract_poly_sign_leak'],
      kind: 'expression',
      expected: 'x^3 - 3x^2 + 4x + 3',
      placeholder: 'Ej: x^3 - 3x^2 + 4x + 3',
      diagContext: {
        target: 'subtract',
        P: polyFromDescending([2, 0, -1, 4]),
        Q: polyFromDescending([1, 3, -5, 1]),
      },
      hints: [
        'Escribí P(x) completo con 0x²: 2x³ + 0x² − x + 4.',
        'Restá cada término de Q(x) = x³ + 3x² − 5x + 1 invirtiendo todos sus signos: −x³ − 3x² + 5x − 1.',
        'Reducí por potencias semejantes desde x³ hasta el término independiente.',
      ],
      solution: '2x³ − x³ = x³, 0x² − 3x² = −3x², −x − (−5x) = +4x y 4 − 1 = +3: queda x³ − 3x² + 4x + 3.',
    },
    {
      id: 'sec2-q2',
      competencyId: 'polynomials.arithmetic_and_degree_laws',
      prerequisiteIds: ['polynomials.structure_degree_and_equality'],
      family: 'poly_arithmetic_degree_laws',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['added_degrees_on_sum'],
      kind: 'number',
      prompt: 'Sean A(x) = 3x⁴ − 2x + 1 y B(x) = −3x⁴ + 5x² − 7. ¿Cuál es el grado exacto de A(x) + B(x)?',
      expected: 2,
      placeholder: 'Ej: 2',
      diagContext: { target: 'sum_degree', degP: 4, degQ: 4, actualDeg: 2 },
      hints: [
        'Recordá la ley gr(A + B) <= máx(gr(A), gr(B)): nunca se suman los grados al sumar polinomios.',
        'Mirá los términos principales: +3x⁴ y −3x⁴ son opuestos y se cancelan a 0x⁴.',
        'Leé el mayor exponente que sobrevive en el polinomio suma luego de cancelar x⁴.',
      ],
      solution: 'Al sumar A(x) + B(x) = 5x² − 2x − 6 se cancela x⁴, por lo que gr(A + B) = 2.',
    },
    {
      id: 'sec2-q3',
      competencyId: 'polynomials.arithmetic_and_degree_laws',
      prerequisiteIds: ['polynomials.structure_degree_and_equality'],
      family: 'poly_arithmetic_degree_laws',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['subtract_poly_sign_leak'],
      kind: 'expression',
      expected: '-3x^3 + 4x^2 - 6',
      placeholder: 'Ej: -3x^3 + 4x^2 - 6',
      diagContext: {},
      hints: [
        'Tratamos a P(x) como incógnita: en 2x³ − P(x) + (x² − 5) = 5x³ − 3x² + 1, conviene pasar P(x) sumando al otro miembro.',
        'Queda P(x) = (2x³ + x² − 5) − (5x³ − 3x² + 1).',
        'Distribuí el signo menos sobre (5x³ − 3x² + 1) y agrupá términos semejantes.',
      ],
      solution: 'Despejando P(x) = 2x³ + x² − 5 − 5x³ + 3x² − 1 = −3x³ + 4x² − 6.',
    },
  ],

  'sec-3': [
    {
      id: 'sec3-q1',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'poly_division_euclid',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['subtract_poly_sign_leak'],
      kind: 'expression',
      expected: '-x^2 + 4x - 6',
      placeholder: 'Ej: -x^2 + 4x - 6',
      diagContext: {},
      hints: [
        'Completá el dividendo P(x) = x⁴ − 3x³ + 0x² + 2x − 1 y ordená el divisor Q(x) = −x² − x + 2.',
        'Primer término del cociente: x⁴ / (−x²) = −x². Al restar (−x²)·Q(x) queda −4x³ + 2x² + 2x − 1.',
        'Continuá bajando grados dividiendo −4x³ por −x² (+4x) y luego el resto cuadrático por −x² para completar los tres términos de C(x).',
      ],
      solution: 'El algoritmo de división entrega C(x) = −x² + 4x − 6 (con resto R(x) = −12x + 11).',
    },
    {
      id: 'sec3-q2',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'poly_division_euclid',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['subtract_poly_sign_leak'],
      kind: 'expression',
      expected: '-12x + 11',
      placeholder: 'Ej: -12x + 11',
      diagContext: {},
      hints: [
        'Usando la identidad P(x) = Q(x)·C(x) + R(x), el resto aparece al finalizar el tercer paso de la división.',
        'En el último paso restás −6·(−x² − x + 2) = 6x² + 6x − 12 del resto parcial 6x² − 6x − 1.',
        'Escribí el polinomio lineal que queda tras cancelar 6x², cuyo grado debe ser menor que 2.',
      ],
      solution: 'Al restar (6x² + 6x − 12) de (6x² − 6x − 1) queda R(x) = −12x + 11, de grado 1 < gr(Q).',
    },
    {
      id: 'sec3-q3',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'poly_division_euclid',
      representation: 'verbal',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['added_degrees_on_sum'],
      kind: 'choice',
      prompt: 'Si al dividir P(x) por Q(x) resulta R(x) = 0, ¿qué afirmación es INCORRECTA?',
      options: [
        {
          label: 'Q(x) es múltiplo de P(x) siempre que gr(P) > gr(Q).',
          correct: true,
        },
        {
          label: 'P(x) es divisible por Q(x) y P(x) es múltiplo de Q(x).',
          correct: false,
          diagnosticId: 'added_degrees_on_sum',
        },
        {
          label: 'Q(x) es divisor de P(x) y se cumple P(x) = Q(x) · C(x).',
          correct: false,
          diagnosticId: 'added_degrees_on_sum',
        },
      ],
      hints: [
        'Leé con atención quién divide a quién en P(x) = Q(x) · C(x).',
        'Cuando P = Q · C, el dividendo P contiene a Q como factor, por lo tanto P es múltiplo de Q y Q es divisor de P.',
        'Identificá la opción que invierte los roles entre múltiplo y divisor.',
      ],
      solution: 'Si P(x) = Q(x)·C(x), P(x) es múltiplo de Q(x) y Q(x) es divisor de P(x) (no al revés cuando gr(P) > gr(Q)).',
    },
  ],

  'sec-4': [
    {
      id: 'sec4-q1',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'ruffini_and_remainder',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['ruffini_forgot_missing_zero_coeff', 'ruffini_sign_error'],
      kind: 'expression',
      expected: 'x^2 + 2x + 4',
      placeholder: 'Ej: x^2 + 2x + 4',
      diagContext: {
        P: polyFromDescending([1, 0, 0, -8]),
        divisorA: 1,
        divisorB: 2,
      },
      hints: [
        'Completá el dividendo x³ − 8 con ceros para x² y x: [1, 0, 0, −8].',
        'Poné r = 2 en la esquina de Ruffini: bajás 1, 1·2 = 2, 0 + 2 = 2, 2·2 = 4, 0 + 4 = 4, 4·2 = 8 y −8 + 8 = 0.',
        'Leé los tres primeros números de la fila inferior para armar el cociente de grado 2.',
      ],
      solution: 'Completando los ceros en Ruffini con r = 2 obtenemos C(x) = x² + 2x + 4 y resto R = 0.',
    },
    {
      id: 'sec4-q2',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'ruffini_and_remainder',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['ruffini_unscaled_nonmonic_quotient', 'ruffini_sign_error'],
      kind: 'expression',
      expected: 'x^2 + 1/3 x + 8/9',
      placeholder: 'Ej: x^2 + 1/3 x + 8/9',
      diagContext: {
        P: polyFromDescending([3, 2, 3, -2]),
        divisorA: 3,
        divisorB: -1,
      },
      hints: [
        'Para dividir por (3x + 1) = 3·(x + 1/3), aplicá Ruffini primero usando r = −1/3.',
        'La fila inferior de Ruffini da [3, 1, 8/3] y resto −26/9, es decir un cociente auxiliar 3x² + x + 8/3.',
        'Dividí los coeficientes del cociente auxiliar por 3 para recuperar el cociente exacto frente a (3x + 1).',
      ],
      solution: 'Al dividir C₀(x) = 3x² + x + 8/3 por a = 3 resulta C(x) = x² + (1/3)x + 8/9 (con resto R = −26/9).',
    },
    {
      id: 'sec4-q3',
      competencyId: 'polynomials.division_ruffini_and_remainder',
      prerequisiteIds: ['polynomials.arithmetic_and_degree_laws'],
      family: 'ruffini_and_remainder',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['ruffini_sign_error'],
      kind: 'number',
      prompt: 'Hallá el valor real de k para que al dividir P(x) = −x⁴ + 2x³ + 4x² + kx + 6 por (x + 3) el resto sea −78:',
      expected: -5,
      placeholder: 'Ej: -5',
      diagContext: {},
      hints: [
        'Por el Teorema del Resto, dividir por (x + 3) = (x − (−3)) deja resto igual a P(−3).',
        'Evaluá cada potencia en x = −3 con cuidado en los signos: −(−3)⁴ + 2(−3)³ + 4(−3)² + k(−3) + 6 = −81 − 54 + 36 − 3k + 6 = −93 − 3k.',
        'Igualá −93 − 3k a −78 y despejá el valor de k.',
      ],
      solution: 'P(−3) = −93 − 3k = −78 => −3k = 15 => k = −5.',
    },
  ],

  'sec-5': [
    {
      id: 'sec5-q1',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_coeff_factoring'],
      kind: 'expression',
      requireForm: 'factored',
      expected: '2(x - 1)(x + 3)',
      placeholder: 'Ej: 2(x - 1)(x + 3)',
      diagContext: { expectedPoly: polyFromDescending([2, 4, -6]) },
      hints: [
        'El primer paso de los 6 métodos siempre es extraer el factor común numérico: los tres términos son divisibles por 2.',
        'Te queda 2·(x² + 2x − 3). Sus raíces por suma-producto o resolvente son 1 y −3.',
        'Escribí el producto completo conservando el factor 2 adelante de los dos binomios mónicos.',
      ],
      solution: '2x² + 4x − 6 = 2(x² + 2x − 3) = 2(x − 1)(x + 3).',
    },
    {
      id: 'sec5-q2',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_coeff_factoring'],
      kind: 'expression',
      requireForm: 'factored',
      expected: '(x - 2)(x + 2)(x^2 + 4)',
      placeholder: 'Ej: (x - 2)(x + 2)(x^2 + 4)',
      diagContext: { expectedPoly: polyFromDescending([1, 0, 0, 0, -16]) },
      hints: [
        'Reconocé x⁴ − 16 como una diferencia de cuadrados (x²)² − 4² = (x² − 4)(x² + 4).',
        'Atención: (x² + 4) tiene discriminante negativo y es irreducible en ℝ, pero (x² − 4) todavía es reducible.',
        'Descomponé el factor reducible en dos binomios mónicos manteniendo (x² + 4) entero.',
      ],
      solution: 'x⁴ − 16 = (x² − 4)(x² + 4) = (x − 2)(x + 2)(x² + 4).',
    },
    {
      id: 'sec5-q3',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_coeff_factoring'],
      kind: 'choice',
      prompt: 'Dado P(x) = −3x(x² − 4)(x² + 1)², ¿cuántas raíces reales DISTINTAS tiene y cuál es la mayor multiplicidad presente?',
      options: [
        {
          label: 'Tiene 3 raíces reales distintas (−2, 0 y 2), todas simples (multiplicidad 1); (x² + 1)² no aporta raíces reales.',
          correct: true,
        },
        {
          label: 'Tiene 5 raíces reales distintas: −2, −1, 0, 1 y 2.',
          correct: false,
          diagnosticId: 'forgot_leading_coeff_factoring',
        },
        {
          label: 'Tiene 7 raíces reales distintas porque su grado es 7.',
          correct: false,
          diagnosticId: 'forgot_leading_coeff_factoring',
        },
      ],
      hints: [
        'Igualá cada factor a cero por separado en los números reales.',
        'x² − 4 = 0 aporta x = ±2, y −3x = 0 aporta x = 0; en cambio x² + 1 >= 1 > 0 nunca vale cero en ℝ.',
        'Contá cuántas raíces reales quedaron y verificá el exponente con que aparece cada una.',
      ],
      solution: 'En ℝ solo se anulan x = 0, x = 2 y x = −2 (todas simples), mientras (x² + 1)² es irreducible.',
    },
  ],

  'sec-6': [
    {
      id: 'sec6-q1',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['swapped_p_q_in_gauss'],
      kind: 'set',
      expected: '{-7; -7/2; -1; -1/2; 1/2; 1; 7/2; 7}',
      placeholder: 'Ej: {-7; -7/2; -1; -1/2; 1/2; 1; 7/2; 7}',
      diagContext: {
        target: 'gauss_candidates',
        P: polyFromDescending([2, -1, -15, 7, 7]),
      },
      hints: [
        'Por el Teorema de Gauss, los numeradores p dividen a a₀ = 7 ({1, 7}) y los denominadores q dividen a a₄ = 2 ({1, 2}).',
        'Formá todas las fracciones positivas y negativas ±p/q combinando p ∈ {1, 7} y q ∈ {1, 2}.',
        'Escribí el conjunto completo entre llaves separado por punto y coma (;).',
      ],
      solution: 'Los 8 candidatos racionales p/q son {−7; −7/2; −1; −1/2; 1/2; 1; 7/2; 7}.',
    },
    {
      id: 'sec6-q2',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['forgot_leading_coeff_factoring', 'swapped_p_q_in_gauss'],
      kind: 'expression',
      requireForm: 'factored',
      expected: '2(x + 1/2)(x - 1)(x - sqrt(7))(x + sqrt(7))',
      placeholder: 'Ej: 2(x + 1/2)(x - 1)(x - √7)(x + √7)',
      diagContext: { expectedPoly: polyFromDescending([2, -1, -15, 7, 7]) },
      hints: [
        'Evaluá los candidatos de Gauss: P(−1/2) = 0 y P(1) = 0.',
        'Tras bajar de grado dos veces por Ruffini queda la cuadrática 2x² − 14 = 2(x² − 7), cuyas raíces reales son ±√7.',
        'Ensamblá el coeficiente principal 2 delante de los cuatro factores lineales mónicos (dos racionales y dos irracionales).',
      ],
      solution: '2x⁴ − x³ − 15x² + 7x + 7 = 2(x + 1/2)(x − 1)(x − √7)(x + √7).',
    },
    {
      id: 'sec6-q3',
      competencyId: 'polynomials.factoring_and_gauss_roots',
      prerequisiteIds: ['polynomials.division_ruffini_and_remainder'],
      family: 'factoring_and_gauss_roots',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['forgot_leading_coeff_factoring', 'swapped_p_q_in_gauss'],
      kind: 'expression',
      requireForm: 'factored',
      expected: '3x(x - 1/3)(x - sqrt(2))(x + sqrt(2))',
      placeholder: 'Ej: 3x(x - 1/3)(x - √2)(x + √2)',
      diagContext: { expectedPoly: polyFromDescending([3, -1, -6, 2, 0]) },
      hints: [
        'Como a₀ = 0 en 3x⁴ − x³ − 6x² + 2x, sacá x de factor común primero: x(3x³ − x² − 6x + 2).',
        'En el núcleo cúbico, agrupando (3x³ − x²) − (6x − 2) = x²(3x − 1) − 2(3x − 1) = (3x − 1)(x² − 2) = 3(x − 1/3)(x² − 2).',
        'Partí (x² − 2) en factores lineales irracionales y mantené 3x adelante.',
      ],
      solution: '3x⁴ − x³ − 6x² + 2x = 3x(x − 1/3)(x − √2)(x + √2).',
    },
  ],

  'sec-7': [
    {
      id: 'sec7-q1',
      competencyId: 'polynomials.parameter_reconstruction_and_modeling',
      prerequisiteIds: ['polynomials.factoring_and_gauss_roots'],
      family: 'parameter_and_volume_modeling',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_leading_coeff_factoring'],
      kind: 'expression',
      expected: '1/2 (x - 2)(x + 1)(x - 4)',
      placeholder: 'Ej: 1/2 (x - 2)(x + 1)(x - 4)',
      diagContext: {
        expectedPoly: polyFromDescending(['1/2', '-5/2', 1, 4]),
      },
      hints: [
        'Planteá el molde de grado 3 con sus tres raíces: P(x) = a·(x − 2)(x + 1)(x − 4).',
        'Usá la condición P(1) = 3: a·(1 − 2)(1 + 1)(1 − 4) = a·(−1)·(2)·(−3) = 6a = 3.',
        'Despejá el coeficiente principal a y completá la fórmula de P(x).',
      ],
      solution: 'De 6a = 3 sale a = 1/2, por lo que P(x) = (1/2)(x − 2)(x + 1)(x − 4) = (1/2)x³ − (5/2)x² + x + 4.',
    },
    {
      id: 'sec7-q2',
      competencyId: 'polynomials.parameter_reconstruction_and_modeling',
      prerequisiteIds: ['polynomials.factoring_and_gauss_roots'],
      family: 'parameter_and_volume_modeling',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['ruffini_sign_error'],
      kind: 'number',
      prompt: 'Sea P(x) = (2x² + 3x − 2)(x − k). Sabiendo que P(1) = 18, ¿cuál es el valor real de k?',
      expected: -5,
      placeholder: 'Ej: -5',
      diagContext: {},
      hints: [
        'Evaluá ambos factores en x = 1 sin necesidad de desarrollar todo el producto.',
        'El primer paréntesis en x = 1 vale 2(1)² + 3(1) − 2 = 3, así que 3·(1 − k) = 18.',
        'Dividí ambos lados por 3 y despejá k con cuidado en el signo.',
      ],
      solution: 'P(1) = 3·(1 − k) = 18 => 1 − k = 6 => k = −5.',
    },
    {
      id: 'sec7-q3',
      competencyId: 'polynomials.parameter_reconstruction_and_modeling',
      prerequisiteIds: ['polynomials.factoring_and_gauss_roots'],
      family: 'parameter_and_volume_modeling',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['forgot_leading_coeff_factoring'],
      kind: 'number',
      prompt: 'Un prisma rectangular tiene aristas x cm, (x − 2) cm y (x + 2) cm. Si su volumen es 15 cm³, ¿cuántos centímetros mide la arista x?',
      expected: 3,
      placeholder: 'Ej: 3',
      diagContext: {},
      hints: [
        'Igualá el volumen V(x) = x(x − 2)(x + 2) = x³ − 4x a 15, obteniendo la ecuación x³ − 4x − 15 = 0.',
        'Por el Teorema de Gauss, probá los divisores positivos de 15 (teniendo en cuenta que x − 2 > 0 exige x > 2).',
        'Al encontrar la raíz entera positiva que anula la cúbica y bajar de grado por Ruffini, verificá que el cociente cuadrático restante tiene discriminante negativo (sin raíces reales) para confirmar la única solución.',
      ],
      solution: 'x³ − 4x − 15 = (x − 3)(x² + 3x + 5) = 0 tiene como única solución real x = 3 (aristas 3 cm, 1 cm y 5 cm).',
    },
  ],
};

const WIDGETS = [
  ['inspector-polinomios', './widgets/inspector-polinomios.js', 'initInspectorPolinomios'],
  ['constructor-algebraico', './widgets/constructor-algebraico.js', 'initConstructorAlgebraico'],
  ['division-polinomica', './widgets/division-polinomica.js', 'initDivisionPolinomica'],
  ['laboratorio-ruffini', './widgets/laboratorio-ruffini.js', 'initLaboratorioRuffini'],
  ['detector-raices', './widgets/detector-raices.js', 'initDetectorRaices'],
  ['explorador-gauss', './widgets/explorador-gauss.js', 'initExploradorGauss'],
];

export function initBlackboardController() {
  const content = document.querySelector('.seq-content');
  if (!content || content.dataset.blackboardReady === 'true') return;
  content.dataset.blackboardReady = 'true';

  const page = document.querySelector('.seq-page');
  const sidebar = document.querySelector('.seq-sidebar');
  const sidebarToggle = h(
    'button',
    {
      type: 'button',
      class: 'chip exp-sidebar-toggle pr-sidebar-toggle',
      'data-sidebar-toggle': 'true',
      'aria-controls': 'poly-sidebar-index',
    },
    'Índice'
  );
  const badge = h('span', { class: 'seq-blackboard-toolbar__badge', id: 'seq-board-badge' });
  const title = h('strong', { id: 'seq-board-title' });
  const toggle = h('button', { type: 'button', class: 'chip', id: 'seq-mode-toggle' }, 'Pizarrón por lección (activo)');
  const bar = h(
    'div',
    { class: 'seq-blackboard-toolbar', id: 'seq-board-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    h('div', { class: 'seq-blackboard-toolbar__actions' }, toggle)
  );
  content.prepend(bar);
  initLessonDock();

  if (sidebar) sidebar.id = 'poly-sidebar-index';

  const sidebarKey = 'polinomios:sidebar:v1';
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle('is-sidebar-collapsed', collapsed);
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggle.replaceChildren(
      ...(collapsed ? [chalkIcon('book', 14), ' Índice'] : ['◀ Ocultar índice'])
    );
    if (persist) {
      try {
        localStorage.setItem(sidebarKey, collapsed ? 'collapsed' : 'open');
      } catch {}
    }
  };

  let savedSidebar = null;
  try {
    savedSidebar = localStorage.getItem(sidebarKey);
  } catch {}
  setSidebar(
    savedSidebar ? savedSidebar === 'collapsed' : typeof window !== 'undefined' && window.innerWidth < 1280,
    false
  );
  sidebarToggle.addEventListener('click', () => setSidebar(!page?.classList.contains('is-sidebar-collapsed')));

  let focused = true;
  let current = LESSON_SECTIONS[0].id;

  const activate = (id, scroll = true) => {
    const index = LESSON_SECTIONS.findIndex((item) => item.id === id);
    const isExtra = id === 'sec-retos' || id === 'sec-repaso';
    if (index < 0 && !isExtra) return;
    current = id;

    for (const item of LESSON_SECTIONS) {
      document.getElementById(item.id)?.classList.toggle('is-active', item.id === id);
    }
    document.getElementById('sec-retos')?.classList.toggle('is-active', id === 'sec-retos');
    document.getElementById('sec-repaso')?.classList.toggle('is-active', id === 'sec-repaso');

    qsa('.seq-sidebar__link[data-sec]').forEach((link) =>
      link.classList.toggle('is-active', link.dataset.sec === id)
    );

    if (index >= 0) {
      badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
      title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    } else if (id === 'sec-retos') {
      badge.textContent = 'Entrenamiento';
      title.textContent = 'Entrenador Contrastivo y las 5 Trampas de Examen';
    } else if (id === 'sec-repaso') {
      badge.textContent = 'Síntesis';
      title.textContent = 'Hoja de Repaso Imprimible · Polinomios';
    }

    if (scroll && typeof window !== 'undefined') {
      const target = focused ? content : document.getElementById(id);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  toggle.addEventListener('click', () => {
    focused = !focused;
    content.classList.toggle('mode-blackboard', focused);
    toggle.textContent = focused ? 'Pizarrón por lección (activo)' : 'Pizarra continua (ver todo)';
    if (focused) activate(current);
  });

  LESSON_SECTIONS.forEach((item, index) => {
    const section = document.getElementById(item.id);
    if (!section) return;
    const prev = LESSON_SECTIONS[index - 1];
    const next = LESSON_SECTIONS[index + 1];
    section.append(
      h(
        'nav',
        { class: 'seq-chalk-tray', 'aria-label': 'Navegación entre pizarrones' },
        prev
          ? h('button', { type: 'button', class: 'chip seq-chalk-tray__btn', on: { click: () => activate(prev.id) } }, `← ${prev.short}`)
          : h('span', { class: 'muted small' }, 'Primer pizarrón'),
        h('span', { class: 'seq-chalk-tray__info' }, `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`),
        next
          ? h('button', { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate(next.id) } }, `${next.short} →`)
          : h('button', { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate('sec-retos') } }, 'Ir al Entrenador y Trampas →')
      )
    );
  });

  qsa('.seq-sidebar__link[data-sec]').forEach((link) =>
    link.addEventListener('click', (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      if (typeof window !== 'undefined' && window.innerWidth < 1280) setSidebar(true, false);
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${link.dataset.sec}`);
    })
  );

  if (typeof window !== 'undefined') {
    const initial = location.hash.slice(1);
    const validIds = [...LESSON_SECTIONS.map((s) => s.id), 'sec-retos', 'sec-repaso'];
    activate(validIds.includes(initial) ? initial : LESSON_SECTIONS[0].id, false);
    content.classList.add('mode-blackboard');
  }
}

if (typeof document !== 'undefined') {
  renderNav();

  const progress = getProgress();
  const solvedSections = new Set();
  for (const sec of LESSON_SECTIONS) {
    const qs = CHECKS_DATA[sec.id] || [];
    const allSolved = qs.length > 0 && qs.every((q) => Boolean(progress[q.id]));
    if (progress[sec.id] === true || allSolved) solvedSections.add(sec.id);
  }
  const progressHost = document.getElementById('seq-progress-text');

  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod[fnName] || mod.initWidget || mod.default;
          if (typeof fn === 'function') {
            hosts.forEach((host) => {
              try {
                fn(host);
              } catch (err) {
                console.error(`[widget:${name}] initialization failed:`, err);
              }
            });
          }
        })
        .catch((err) => console.warn(`[widget:${name}] load error:`, err));
    }
  }

  qsa('[data-poly-formula]').forEach((host) => {
    const expr = host.getAttribute('data-poly-formula') || '2x^4 - 3x^2 + 1/2 x - 2';
    host.replaceChildren(annotatedPolyFormula(expr));
  });

  for (const [sectionId, questions] of Object.entries(CHECKS_DATA)) {
    const host = document.querySelector(`[data-check="${sectionId}"]`);
    if (host) {
      createCheckBlock(host, questions, {
        sectionId,
        onSectionDone: () => {
          solvedSections.add(sectionId);
          markSectionCompleted(sectionId);
          mountProgress(progressHost, solvedSections, LESSON_SECTIONS.length);
          const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
          if (link) {
            link.replaceChildren(chalkIcon('check', 14));
            link.classList.add('is-done');
          }
        },
      });
    }
  }

  for (const sectionId of solvedSections) {
    const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
    if (link) {
      link.replaceChildren(chalkIcon('check', 14));
      link.classList.add('is-done');
    }
  }

  const retosHost = document.getElementById('poly-challenges');
  if (retosHost) mountPolyRetos(retosHost);

  const dashboardHost = document.getElementById('poly-competency-dashboard');
  if (dashboardHost) {
    mountCompetencyDashboard(dashboardHost, {
      onSelectSection: (sectionId) => {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"]`);
        if (link) link.click();
        else location.hash = `#${sectionId}`;
      },
      onPracticeCompetency: (competencyId) => {
        const link = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
        if (link) link.click();
        else location.hash = '#sec-retos';
        const sel = document.querySelector('.poly-family-select');
        if (sel) {
          const matched = CHALLENGE_TYPES.find((t) => t.competencyId === competencyId);
          sel.value = matched ? matched.id : 'adaptativo';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
    });
  }

  qsa('[data-print-sheet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
    });
  });

  bindTutorButtons(document);
  mountProgress(progressHost, solvedSections, LESSON_SECTIONS.length);
  initGlossary();
  initBlackboardController();
}

export {
  VN_SCRIPTS,
  SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
  mountPolyRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generatePolyChallenge,
  generatePolyChallenges,
  TRAPS,
  mulberry32,
  POLY_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
