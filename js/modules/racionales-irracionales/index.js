/**
 * @file js/modules/racionales-irracionales/index.js
 * Main Orchestrator for Unit 07: Ecuaciones e Inecuaciones Racionales e Irracionales
 * (`racionales-irracionales.html`).
 * 6 sections (4 Rational + 2 Irrational), 4 keyboard-accessible 2-stage POE widgets,
 * 18 8-tuple checks (54 unique non-leaking progressive hints), deterministic PRNG retos,
 * and conservative mastery competency dashboard.
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedRationalFormula,
  annotatedRadicalFormula,
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
  RI_COMPETENCIES,
  RACIONALES_IRRACIONALES_COMPETENCIES,
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
  mountRiRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateRiChallenge,
  generateRiChallenges,
  selectAdaptiveRiFamily,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-1',
    chapter: 'Capítulo 1 · Expresiones y Funciones Racionales',
    title: 'Expresiones algebraicas racionales, simplificación con dominio y M(x)',
    short: '1 · Simplificación y M(x)',
  },
  {
    id: 'sec-2',
    chapter: 'Capítulo 1 · Expresiones y Funciones Racionales',
    title: 'Ecuaciones e inecuaciones racionales con exclusión de polos',
    short: '2 · Ecuaciones e Inec.',
  },
  {
    id: 'sec-3',
    chapter: 'Capítulo 1 · Expresiones y Funciones Racionales',
    title: 'Función racional: dominio, ceros, puntos agujero vs. asíntotas verticales',
    short: '3 · Agujeros vs. A.V.',
  },
  {
    id: 'sec-4',
    chapter: 'Capítulo 1 · Expresiones y Funciones Racionales',
    title: 'Asíntotas horizontales, estudio completo y reconstrucción gráfica',
    short: '4 · A.H. y Estudio',
  },
  {
    id: 'sec-5',
    chapter: 'Capítulo 2 · Funciones y Ecuaciones Irracionales',
    title: 'Función irracional, dominio par vs. impar y ecuaciones con raíces extraviadas',
    short: '5 · Dominio y Ecuaciones',
  },
  {
    id: 'sec-6',
    chapter: 'Capítulo 2 · Funciones y Ecuaciones Irracionales',
    title: 'Gráficas radicales desplazadas, imagen, C₀ y funciones por tramos mixtas',
    short: '6 · Gráficas y Tramos',
  },
];

export const CHECKS_DATA = {
  'sec-1': [
    {
      id: 'ri-sec1-q1',
      competencyId: 'rational.simplification_lcm_and_operations',
      prerequisiteIds: [],
      family: 'rational_simplify_and_lcm',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['cancelled_terms_instead_of_factors', 'lost_excluded_domain_on_cancel'],
      kind: 'rational_expr',
      requireSameDomain: false,
      requireSimplified: true,
      prompt:
        'Simplificá a su mínima expresión algebraica la fracción racional (x² − 9) / (x² + 3x):',
      expected: '(x - 3)/x',
      placeholder: 'Ej: (x - 1)/x',
      diagContext: {
        target: 'rational_simplify',
        cancelledTermsPatterns: ['-9/3x', '-3/x', '(x^2-9)/(x^2+3x)'],
      },
      hints: [
        'Factorizá primero el numerador como diferencia de cuadrados y el denominador sacando factor común x.',
        'Obtenés ((x − 3)(x + 3)) / (x(x + 3)), donde (x + 3) multiplica tanto arriba como abajo.',
        'Cancelá el factor común (x + 3) que multiplica arriba y abajo para escribir el cociente irreducible.',
      ],
      solution:
        'Factorizando: ((x − 3)(x + 3)) / (x(x + 3)) = (x − 3)/x, válida para todo x ∈ ℝ − {−3; 0}.',
    },
    {
      id: 'ri-sec1-q2',
      competencyId: 'rational.simplification_lcm_and_operations',
      prerequisiteIds: [],
      family: 'rational_simplify_and_lcm',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['lost_excluded_domain_on_cancel'],
      kind: 'set_or_interval',
      prompt:
        'Luego de simplificar (x² − 9) / (x² + 3x), ¿cuál sigue siendo el dominio máximo de validez en notación de Exactas?',
      expected: 'R - {-3; 0}',
      placeholder: 'Ej: R - {-1; 2}',
      diagContext: { target: 'domain_after_cancel', cancelledRoots: [-3, 0] },
      hints: [
        'Recordá que el dominio se fija mirando el denominador original x² + 3x antes de cancelar ningún paréntesis.',
        'Las raíces de x(x + 3) = 0 son dos valores reales distintos, incluyendo la raíz del factor que luego se simplificó.',
        'Escribí ℝ menos el conjunto entre llaves con los dos valores que anulan el denominador original, separados por punto y coma.',
      ],
      solution:
        'Aunque (x + 3) se simplifica, tanto x = −3 como x = 0 anulan x² + 3x; por lo tanto el dominio es ℝ − {−3; 0}.',
    },
    {
      id: 'ri-sec1-q3',
      competencyId: 'rational.simplification_lcm_and_operations',
      prerequisiteIds: [],
      family: 'rational_operations',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['lost_excluded_domain_on_cancel', 'wrong_lcm_product_instead_of_lcm'],
      kind: 'set_or_interval',
      prompt:
        'En el cociente de expresiones racionales ((x + 1)/(x − 2)) : ((x − 4)/(x + 3)), ¿cuál es el dominio máximo de validez en ℝ?',
      expected: 'R - {-3; 2; 4}',
      placeholder: 'Ej: R - {-1; 0; 3}',
      diagContext: { target: 'rational_domain', cancelledRoots: [4] },
      hints: [
        'Al dividir P/Q por R/S primero invertís la segunda fracción para multiplicar por S/R.',
        'Deben ser distintos de cero el denominador de la primera (x − 2), el de la segunda (x + 3) y también el numerador divisor (x − 4).',
        'Excluí de ℝ los tres valores ordenados que anulan alguno de los dos denominadores o el numerador del divisor.',
      ],
      solution:
        'Se excluyen x = 2 (por x − 2), x = −3 (por x + 3) y x = 4 (por invertir x − 4): Dom = ℝ − {−3; 2; 4}.',
    },
  ],

  'sec-2': [
    {
      id: 'ri-sec2-q1',
      competencyId: 'rational.equations_and_inequalities',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_equations_inequalities',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['accepted_excluded_root_in_equation'],
      kind: 'solution_set',
      prompt:
        'Resolvé en ℝ la ecuación racional 2x / (x − 1) = 2 / (x − 1) y escribí su conjunto solución:',
      expected: '∅',
      placeholder: 'Ej: {7} (o sin solución)',
      diagContext: { target: 'rational_equation', excludedRoots: [1] },
      hints: [
        'Anotá primero la restricción obligatoria de dominio antes de despejar: x − 1 ≠ 0 ⇒ x ≠ 1.',
        'Al igualar los numeradores sobre M(x) = x − 1 queda 2x = 2, cuya única candidata es x = 1.',
        'Compará la raíz obtenida en el numerador contra la restricción de dominio; si coincide, el conjunto solución queda sin elementos.',
      ],
      solution:
        'La única candidata x = 1 anula el denominador (x − 1) y divide por cero, así que se descarta: S = ∅.',
    },
    {
      id: 'ri-sec2-q2',
      competencyId: 'rational.equations_and_inequalities',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_equations_inequalities',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['accepted_excluded_root_in_equation', 'wrong_lcm_product_instead_of_lcm'],
      kind: 'solution_set',
      prompt:
        'Hallá el conjunto solución real de la ecuación 1/(x − 1) + 2/(x + 1) = 3/(x² − 1):',
      expected: '{4/3}',
      placeholder: 'Ej: {5/2}',
      diagContext: { target: 'rational_equation', excludedRoots: [-1, 1] },
      hints: [
        'Factorizá x² − 1 = (x − 1)(x + 1), que funciona como mínimo común múltiplo M(x) con exclusiones x ≠ −1 y x ≠ 1.',
        'Llevando todo al denominador M(x) se obtiene (x + 1) + 2(x − 1) = 3 en el numerador.',
        'Despejá x en la ecuación lineal resultante y verificá que esa fracción no anule ni (x − 1) ni (x + 1).',
      ],
      solution:
        'Con x ≠ ±1, (x + 1) + 2x − 2 = 3 ⇒ 3x = 4 ⇒ x = 4/3, que pertenece al dominio: S = {4/3}.',
    },
    {
      id: 'ri-sec2-q3',
      competencyId: 'rational.equations_and_inequalities',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_equations_inequalities',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['accepted_excluded_root_in_equation'],
      kind: 'set_or_interval',
      prompt:
        'Resolvé la inecuación racional 7 / (x + 6) ≤ 1 en notación de intervalos de Exactas:',
      expected: '(-inf; -6) U [1; +inf)',
      placeholder: 'Ej: (-inf; -2) U [3; +inf)',
      diagContext: { target: 'rational_inequality', excludedRoots: [-6] },
      hints: [
        'Nunca pases (x + 6) multiplicando al otro miembro porque su signo cambia según el valor de x.',
        'Restá 1 y juntá en una fracción: (7 − (x + 6))/(x + 6) = (1 − x)/(x + 6) ≤ 0, con polo x = −6 y raíz x = 1.',
        'Armá la tabla de signos y uní los dos tramos donde el cociente es ≤ 0, dejando abierto el polo y cerrado el cero del numerador.',
      ],
      solution:
        'En (1 − x)/(x + 6) ≤ 0, el cociente es negativo para x < −6 y para x > 1, se anula en x = 1 y es indefinido en x = −6: (−∞; −6) ∪ [1; +∞).',
    },
  ],

  'sec-3': [
    {
      id: 'ri-sec3-q1',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_holes_vs_asymptotes',
      representation: 'verbal',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['hole_vs_va_multiplicity_confusion'],
      kind: 'choice',
      prompt:
        'Compará f(x) = (x² − 1)/(x − 1) y g(x) = (x − 1)/(x − 1)² alrededor de x = 1. ¿Cuál de estas afirmaciones es verdadera?',
      options: [
        {
          label: 'f tiene un punto agujero en (1; 2) porque mult_P(1) ≥ mult_Q(1), mientras que g tiene asíntota vertical x = 1 porque mult_P(1) < mult_Q(1).',
          correct: true,
        },
        {
          label: 'Ambas tienen asíntota vertical en x = 1 porque en ambas el denominador se anula en 1.',
          correct: false,
          diagnosticId: 'hole_vs_va_multiplicity_confusion',
        },
        {
          label: 'Ambas tienen un punto agujero en x = 1 porque en ambas el numerador también se anula en 1.',
          correct: false,
          diagnosticId: 'hole_vs_va_multiplicity_confusion',
        },
      ],
      hints: [
        'Contá cuántas veces aparece el factor (x − 1) en el numerador y en el denominador de cada función.',
        'En f(x), (x − 1) aparece 1 vez arriba y 1 vez abajo; en g(x), aparece 1 vez arriba y 2 veces abajo.',
        'Relacioná la cancelación total del factor del denominador con una discontinuidad evitable, y la supervivencia en el denominador con una explosión asíntótica.',
      ],
      solution:
        'En f(x), mult_P(1) = 1 ≥ mult_Q(1) = 1 deja un agujero en (1; 2). En g(x), mult_P(1) = 1 < mult_Q(1) = 2 deja x − 1 abajo y genera A.V. x = 1.',
    },
    {
      id: 'ri-sec3-q2',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_holes_vs_asymptotes',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['hole_vs_va_multiplicity_confusion'],
      kind: 'ordered_pair',
      prompt:
        'La función f(x) = (4x² − 8x) / (x³ − 2x² − 5x + 10) tiene un punto agujero en x = 2. Indicá sus coordenadas exactas (x; y):',
      expected: '(2; -8)',
      placeholder: 'Ej: (1; 3)',
      diagContext: { target: 'hole_coords' },
      hints: [
        'Factorizá arriba 4x(x − 2) y abajo por agrupación x²(x − 2) − 5(x − 2) = (x − 2)(x² − 5).',
        'Cancelá el factor común (x − 2) para obtener la fórmula simplificada 4x / (x² − 5), válida para x ≠ 2.',
        'Evaluá esa fracción simplificada en x = 2 para hallar la ordenada del hueco y escribilo como par ordenado con punto y coma.',
      ],
      solution:
        'Simplificando (x − 2) queda 4x/(x² − 5); en x = 2 vale 4·2/(4 − 5) = −8, luego el punto agujero es (2; −8).',
    },
    {
      id: 'ri-sec3-q3',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_holes_vs_asymptotes',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['lost_excluded_domain_on_cancel'],
      kind: 'choice',
      prompt:
        '¿Son iguales las funciones f(x) = (x² − 6x + 9)/(x − 3) y g(x) = x − 3?',
      options: [
        {
          label: 'No: tienen la misma fórmula para x ≠ 3, pero Dom(f) = ℝ − {3} ≠ ℝ = Dom(g).',
          correct: true,
        },
        {
          label: 'Sí: al factorizar (x − 3)²/(x − 3) se simplifica a x − 3 y quedan idénticas.',
          correct: false,
          diagnosticId: 'lost_excluded_domain_on_cancel',
        },
        {
          label: 'No: además tienen distinto valor en x = 5.',
          correct: false,
        },
      ],
      hints: [
        'Recordá los dos requisitos para que dos funciones f y g sean iguales: misma regla de asignación y mismo dominio.',
        'En x = 3, g(3) = 0 existe perfectamente, mientras que f(3) produce 0/0.',
        'Elegí la opción que contrasta la equivalencia algebraica con la diferencia en sus dominios máximos.',
      ],
      solution:
        'Para ser iguales deben coincidir en fórmula y en dominio. Como Dom(f) = ℝ − {3} y Dom(g) = ℝ, no son la misma función.',
    },
  ],

  'sec-4': [
    {
      id: 'ri-sec4-q1',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_full_study_and_ha',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['inverted_ha_degree_or_coeff_ratio'],
      kind: 'asymptote',
      prompt:
        'Determiná la ecuación de la asíntota horizontal de f(x) = (2x + 1) / (3 − x):',
      expected: 'y = -2',
      placeholder: 'Ej: y = 3',
      diagContext: { target: 'horizontal_asymptote', trapValues: [2 / 3, 2] },
      hints: [
        'El numerador y el denominador tienen ambos grado 1, así que existe una asíntota horizontal dada por el cociente de coeficientes principales.',
        'Ordená el denominador en potencias decrecientes: 3 − x = −1·x + 3, por lo que su coeficiente principal es −1.',
        'Dividí el coeficiente principal del numerador por el del denominador y expresalo como ecuación horizontal.',
      ],
      solution:
        'Ordenando (−x + 3) abajo, la razón entre coeficientes principales es 2/(−1) = −2, por lo que la A.H. es y = −2.',
    },
    {
      id: 'ri-sec4-q2',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_full_study_and_ha',
      representation: 'graphical',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['hole_vs_va_multiplicity_confusion'],
      kind: 'solution_set',
      prompt:
        'Para f(x) = 2x² / (x² + x), ¿cuál es su conjunto de ceros C₀?',
      expected: '∅',
      placeholder: 'Ej: {5} (o sin solución)',
      diagContext: { target: 'rational_zeros', holeX: 0 },
      hints: [
        'Primero hallá el dominio factorizando el denominador: x(x + 1) ≠ 0 excluye x = 0 y x = −1.',
        'Aunque el numerador 2x² se anula únicamente en x = 0, en ese punto hay un agujero en (0; 0).',
        'Confirmá si x = 0 pertenece o no al dominio original para decidir qué elementos quedan en C₀.',
      ],
      solution:
        'El único cero del numerador es x = 0, pero 0 ∉ Dom(f) = ℝ − {−1; 0}; por lo tanto C₀ = ∅.',
    },
    {
      id: 'ri-sec4-q3',
      competencyId: 'rational.domain_holes_and_asymptotes',
      prerequisiteIds: ['rational.simplification_lcm_and_operations'],
      family: 'rational_full_study_and_ha',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['inverted_ha_degree_or_coeff_ratio'],
      kind: 'number',
      prompt:
        'Si f(x) = (ax − 3) / (2x − b) tiene dominio ℝ − {1} y asíntota horizontal y = −2, calculá el valor real de a:',
      expected: -4,
      placeholder: 'Ej: 5',
      diagContext: { target: 'horizontal_asymptote', trapValues: [4, -2] },
      hints: [
        'La asíntota horizontal y = −2 proviene de igualar el cociente entre los coeficientes principales de P(x) y Q(x).',
        'El coeficiente principal del numerador es a y el del denominador es 2.',
        'Igualá a/2 con el valor de la asíntota horizontal y despejá a.',
      ],
      solution:
        'Con Dom = ℝ − {1} obtenemos b = 2, y de la A.H. y = a/2 = −2 despejamos a = −4.',
    },
  ],

  'sec-5': [
    {
      id: 'ri-sec5-q1',
      competencyId: 'irrational.domain_and_radical_equations',
      prerequisiteIds: [],
      family: 'irrational_domain_and_equations',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['even_vs_odd_radical_domain_confusion'],
      kind: 'set_or_interval',
      prompt:
        'Hallá el máximo dominio real de la función f(x) = √(x² − 6x + 8):',
      expected: '(-inf; 2] U [4; +inf)',
      placeholder: 'Ej: (-inf; 1] U [3; +inf)',
      diagContext: {
        target: 'irrational_domain',
        isOddIndex: false,
        expectedNotAllReal: true,
      },
      hints: [
        'Al ser una raíz cuadrada (índice par), el radicando debe cumplir x² − 6x + 8 ≥ 0.',
        'Factorizando: (x − 2)(x − 4) ≥ 0 tiene raíces x = 2 y x = 4, con parábola hacia arriba.',
        'Uní las dos semirrectas externas donde la cuadrática es mayor o igual a cero, cerrando ambos extremos.',
      ],
      solution:
        'x² − 6x + 8 ≥ 0 se satisface en (−∞; 2] ∪ [4; +∞), con corchetes cerrados porque √0 = 0 existe en ℝ.',
    },
    {
      id: 'ri-sec5-q2',
      competencyId: 'irrational.domain_and_radical_equations',
      prerequisiteIds: [],
      family: 'irrational_domain_and_equations',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['even_vs_odd_radical_domain_confusion'],
      kind: 'set_or_interval',
      prompt:
        'Determiná el dominio máximo en ℝ de f(x) = 1 / √(2x − 4):',
      expected: '(2; +inf)',
      placeholder: 'Ej: (1; +inf)',
      diagContext: {
        target: 'irrational_domain',
        isOddIndex: false,
        inDenominator: true,
        expectedNotAllReal: true,
      },
      hints: [
        'La raíz de índice par está en el denominador, por lo que no solo debe ser ≥ 0 sino distinta de cero.',
        'La condición combinada exige 2x − 4 > 0 estricto.',
        'Despejá x y escribí la semirrecta abierta correspondiente.',
      ],
      solution:
        'De 2x − 4 > 0 resulta x > 2, es decir Dom(f) = (2; +∞) con paréntesis abierto en 2.',
    },
    {
      id: 'ri-sec5-q3',
      competencyId: 'irrational.domain_and_radical_equations',
      prerequisiteIds: [],
      family: 'irrational_domain_and_equations',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['accepted_extraneous_squaring_root', 'distributed_radical_over_sum'],
      kind: 'solution_set',
      prompt:
        'Resolvé en ℝ la ecuación irracional √(x + 6) = x (descartando soluciones extraviadas):',
      expected: '{3}',
      placeholder: 'Ej: {5}',
      diagContext: { target: 'irrational_equation', extraneousRoots: [-2] },
      hints: [
        'Exigí x + 6 ≥ 0 y además x ≥ 0 (porque la raíz cuadrada principal nunca es negativa).',
        'Elevando ambos miembros al cuadrado queda x + 6 = x², es decir x² − x − 6 = 0, con candidatas x = −2 y x = 3.',
        'Verificá qué candidato respeta x ≥ 0 en la ecuación original y escribilo entre llaves.',
      ],
      solution:
        'x = −2 da √4 = 2 ≠ −2 (extraviada); solo x = 3 verifica √9 = 3. Por lo tanto S = {3}.',
    },
  ],

  'sec-6': [
    {
      id: 'ri-sec6-q1',
      competencyId: 'irrational.graphs_analysis_and_piecewise',
      prerequisiteIds: ['irrational.domain_and_radical_equations', 'rational.domain_holes_and_asymptotes'],
      family: 'irrational_graphs_and_piecewise',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['wrong_radical_image_or_piecewise_bound'],
      kind: 'set_or_interval',
      prompt:
        'Para la función f(x) = 2 − √(3 − x), determiná su conjunto imagen Im(f):',
      expected: '(-inf; 2]',
      placeholder: 'Ej: (-inf; 4]',
      diagContext: { target: 'irrational_image', wrongReflectionTrap: '[2; +inf)' },
      hints: [
        'La raíz cuadrada principal √(3 − x) es siempre ≥ 0 y alcanza su valor mínimo 0 en x = 3.',
        'Como delante de la raíz hay un signo negativo (−), al restar √(3 − x) de 2 todas las imágenes quedan por debajo o igual a 2.',
        'Escribí el intervalo desde menos infinito hasta la altura inicial, cerrando el extremo que sí se alcanza.',
      ],
      solution:
        'Como −√(3 − x) ≤ 0, f(x) = 2 − √(3 − x) ≤ 2 con máximo f(3) = 2: Im(f) = (−∞; 2].',
    },
    {
      id: 'ri-sec6-q2',
      competencyId: 'irrational.graphs_analysis_and_piecewise',
      prerequisiteIds: ['irrational.domain_and_radical_equations', 'rational.domain_holes_and_asymptotes'],
      family: 'irrational_graphs_and_piecewise',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['accepted_extraneous_squaring_root'],
      kind: 'number',
      prompt:
        '¿En qué abscisa x (como fracción irreducible) corta al eje X la gráfica de f(x) = 3 − √(7x − 1)?',
      expected: '10/7',
      placeholder: 'Ej: 5/3',
      diagContext: {},
      hints: [
        'El corte con el eje X corresponde a f(x) = 0, es decir 3 − √(7x − 1) = 0.',
        'Aislá la raíz: √(7x − 1) = 3 (miembro derecho positivo, compatible).',
        'Elevá ambos miembros al cuadrado y despejá x como fracción.',
      ],
      solution:
        'De √(7x − 1) = 3 resulta 7x − 1 = 9 ⇒ 7x = 10 ⇒ x = 10/7 (pertenece al dominio [1/7; +∞)).',
    },
    {
      id: 'ri-sec6-q3',
      competencyId: 'irrational.graphs_analysis_and_piecewise',
      prerequisiteIds: ['irrational.domain_and_radical_equations', 'rational.domain_holes_and_asymptotes'],
      family: 'irrational_graphs_and_piecewise',
      representation: 'graphical',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['wrong_radical_image_or_piecewise_bound'],
      kind: 'set_or_interval',
      prompt:
        'Dada la función por tramos g(x) = { 1/x si x < 0;  √x si x ∈ [0; 9] }, indicá su conjunto imagen total Im(g):',
      expected: '(-inf; 3]',
      placeholder: 'Ej: (-inf; 4]',
      diagContext: { target: 'piecewise_analysis', wrongOpenClosedTrap: '(-inf; 3)' },
      hints: [
        'Analizá la imagen de cada tramo por separado: para x < 0, 1/x recorre todos los reales negativos (−∞; 0).',
        'En el segundo tramo x ∈ [0; 9], √x crece desde √0 = 0 hasta √9 = 3, cubriendo [0; 3].',
        'Uní ambas imágenes sin dejar huecos entre ellas y cerrando el tope máximo.',
      ],
      solution:
        'La unión de (−∞; 0) con [0; 3] forma el intervalo continuo (−∞; 3].',
    },
  ],
};

const WIDGETS = [
  ['inspector-dominio', './widgets/inspector-dominio.js', 'initInspectorDominio'],
  ['agujero-asintota', './widgets/agujero-asintota.js', 'initAgujeroAsintota'],
  ['explorador-asintotas', './widgets/explorador-asintotas.js', 'initExploradorAsintotas'],
  ['ecuaciones-irracionales', './widgets/ecuaciones-irracionales.js', 'initEcuacionesIrracionales'],
];

const activeWidgets = new Map();

function initFadingExamples() {
  qsa('.ri-worked-fading').forEach((box) => {
    const btns = Array.from(box.querySelectorAll('[data-fade-btn]'));
    const panels = Array.from(box.querySelectorAll('[data-fade-panel]'));
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = btn.getAttribute('data-fade-btn');
        btns.forEach((b) => b.classList.toggle('is-active', b === btn));
        panels.forEach((p) => {
          if (p.getAttribute('data-fade-panel') === level) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      });
    });
  });
}

function initBlackboardController() {
  const page = document.querySelector('.ri-page');
  const sidebar = document.querySelector('.seq-sidebar');
  const content = document.querySelector('.seq-content');
  if (!page || !sidebar || !content) return;

  const isNarrow = () => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  let savedSidebar = false;
  try {
    savedSidebar = localStorage.getItem('ri:sidebarCollapsed') === '1';
  } catch {}
  if (isNarrow() || savedSidebar) page.classList.add('is-sidebar-collapsed');

  const sidebarToggle = h(
    'button',
    {
      type: 'button',
      class: 'exp-sidebar-toggle',
      'aria-label': 'Mostrar u ocultar índice de pizarrones',
    },
    page.classList.contains('is-sidebar-collapsed') ? 'Índice' : 'Ocultar índice'
  );

  const setSidebar = (collapsed, persist = true) => {
    page.classList.toggle('is-sidebar-collapsed', collapsed);
    sidebarToggle.textContent = collapsed ? 'Índice' : 'Ocultar índice';
    if (persist) {
      try {
        localStorage.setItem('ri:sidebarCollapsed', collapsed ? '1' : '0');
      } catch {}
    }
  };

  sidebarToggle.addEventListener('click', () =>
    setSidebar(!page.classList.contains('is-sidebar-collapsed'))
  );

  const badge = h('span', { class: 'seq-blackboard-toolbar__badge' }, 'Pizarrón 1 de 6');
  const title = h('strong', {}, LESSON_SECTIONS[0].title);
  const toggle = h(
    'button',
    { type: 'button', class: 'chip seq-blackboard-toolbar__toggle' },
    'Pizarrón por lección (activo)'
  );
  const toolbar = h(
    'div',
    { class: 'seq-blackboard-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    toggle
  );
  content.prepend(toolbar);

  let current = LESSON_SECTIONS[0].id;
  let focused = true;

  const activate = (id, scroll = true) => {
    current = id;
    qsa('.seq-section, #sec-retos, #sec-repaso').forEach((s) =>
      s.classList.toggle('is-active', s.id === id)
    );
    qsa('.seq-sidebar__link').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.sec === id)
    );
    const activeSection = document.getElementById(id);
    if (activeSection) {
      activeSection.querySelectorAll('svg').forEach((svg) => svg.getBoundingClientRect());
    }
    const index = LESSON_SECTIONS.findIndex((s) => s.id === id);
    if (index >= 0) {
      badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
      title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    } else if (id === 'sec-retos') {
      badge.textContent = 'Entrenamiento';
      title.textContent = 'Entrenador PRNG y las 5 Trampas Clásicas de Examen';
    } else if (id === 'sec-repaso') {
      badge.textContent = 'Síntesis';
      title.textContent = 'Hoja de Repaso Imprimible · Racionales e Irracionales';
    }

    if (scroll) {
      const target = focused ? content : activeSection;
      if (target && typeof window !== 'undefined') {
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
    const previous = LESSON_SECTIONS[index - 1];
    const next = LESSON_SECTIONS[index + 1];
    const tray = h(
      'nav',
      { class: 'seq-chalk-tray', 'aria-label': 'Navegación entre pizarrones' },
      previous
        ? h(
            'button',
            { type: 'button', class: 'chip seq-chalk-tray__btn', on: { click: () => activate(previous.id) } },
            `← ${previous.short}`
          )
        : h('span', { class: 'muted small' }, 'Primer pizarrón'),
      h('span', { class: 'seq-chalk-tray__info' }, `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`),
      next
        ? h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate(next.id) } },
            `${next.short} →`
          )
        : h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate('sec-retos') } },
            'Ir al Entrenador y Trampas →'
          )
    );
    section.append(tray);
  });

  qsa('.seq-sidebar__link[data-sec]').forEach((link) =>
    link.addEventListener('click', (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      if (typeof window !== 'undefined' && window.innerWidth <= 1024) setSidebar(true, false);
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${link.dataset.sec}`);
    })
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const isCollapsed = page?.classList.contains('is-sidebar-collapsed');
      if (window.innerWidth <= 1024 && !isCollapsed) setSidebar(true, false);
      else if (window.innerWidth > 1024 && isCollapsed && !savedSidebar) setSidebar(false, false);
    });
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
    if (progress[sec.id] === true || (qs.length > 0 && qs.every((q) => Boolean(progress[q.id])))) {
      solvedSections.add(sec.id);
    }
  }
  const progressHost = document.getElementById('seq-progress-text');

  // 1. Montar los 4 widgets SVG
  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod[fnName] || mod.default;
          if (typeof fn === 'function') {
            hosts.forEach((host) => {
              const inst = fn(host);
              if (inst) activeWidgets.set(host, inst);
            });
          }
        })
        .catch((err) => console.warn(`[widget:${name}] error:`, err));
    }
  }

  // 2. Montar fórmulas anotadas interactivas
  qsa('[data-ri-formula]').forEach((host) => {
    const kind = host.getAttribute('data-ri-formula') || 'rational';
    const preset = host.getAttribute('data-preset') || (kind === 'radical' ? 'reflected' : 'homographic');
    host.replaceChildren(
      kind === 'radical' ? annotatedRadicalFormula(preset) : annotatedRationalFormula(preset)
    );
  });

  // 3. Montar los 6 bloques de chequeo (18 preguntas)
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

  // 4. Montar Entrenador PRNG + 5 Trampas
  const retosHost = document.getElementById('ri-challenges');
  if (retosHost) mountRiRetos(retosHost);

  // 5. Panel de Competencias en #sec-repaso
  const dashboardHost = document.getElementById('ri-competency-dashboard');
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
        const familySelect = document.querySelector('.ri-family-select');
        if (familySelect) {
          const matchedType = CHALLENGE_TYPES.find((t) => t.competencyId === competencyId);
          familySelect.value = matchedType ? matchedType.id : 'adaptativo';
          familySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
    });
  }

  qsa('[data-print-sheet]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
    });
  });

  initFadingExamples();
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
  mountRiRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateRiChallenge,
  generateRiChallenges,
  selectAdaptiveRiFamily,
  TRAPS,
  mulberry32,
  RI_COMPETENCIES,
  RACIONALES_IRRACIONALES_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
