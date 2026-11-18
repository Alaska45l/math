/**
 * @file js/modules/lineal/index.js
 * Orquestador principal de Unidad 03 · Función Lineal, Formas de la Recta,
 * Posiciones Relativas, Geometría Analítica y Tramos (`lineal.html`).
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedLinearFormula,
  threeFormsStrip,
  createPiecewiseLinearPreview,
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
  LIN_COMPETENCIES,
  LINEAL_COMPETENCIES,
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
  mountLinearRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateLinearChallenge,
  generateLinearChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-pendiente-estudio',
    chapter: 'Capítulo 1 · La Recta como Función',
    title: 'Definición, Pendiente, Recta Vertical y Estudio Analítico',
    short: '1 · Pendiente y Estudio',
  },
  {
    id: 'sec-formas-angulo',
    chapter: 'Capítulo 1 · La Recta como Función',
    title: 'Pendiente Trigonométrica y las 3 Ecuaciones de la Recta',
    short: '2 · Las 3 Formas',
  },
  {
    id: 'sec-paralelas-perpendiculares',
    chapter: 'Capítulo 2 · Posiciones Relativas',
    title: 'Paralelismo, Perpendicularidad y Caso Singular H ⊥ V',
    short: '3 · Paralelas y ⊥',
  },
  {
    id: 'sec-geometria-analitica',
    chapter: 'Capítulo 2 · Posiciones Relativas',
    title: 'Punto Medio, Distancia, Mediatriz y Distancia Punto-Recta',
    short: '4 · Geometría Analítica',
  },
  {
    id: 'sec-modelizacion-tramos',
    chapter: 'Capítulo 3 · Modelización y Tramos',
    title: 'Modelización Lineal en Contexto y Función por Tramos',
    short: '5 · Modelos y Tramos',
  },
];

/**
 * 20 chequeos conceptuales (4 por sección, 60 pistas únicas no filtrantes)
 * con metadatos completos de 8-tupla pedagógica.
 */
export const CHECKS_DATA = {
  'sec-pendiente-estudio': [
    {
      id: 'lin-sec1-q1',
      competencyId: 'linear.definition_slope_and_intercept',
      prerequisiteIds: [],
      family: 'slope_from_two_points',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['inverted_slope_dx_over_dy', 'sign_error_in_slope_subtraction'],
      kind: 'number',
      prompt:
        'Calculá la pendiente m de la recta que pasa por los puntos P(−2; 1) y Q(−3; −2):',
      expected: 3,
      placeholder: 'Ej: 3',
      diagContext: { target: 'slope', p1: { x: -2, y: 1 }, p2: { x: -3, y: -2 } },
      hints: [
        'Usá la definición de pendiente m = (y₂ − y₁) / (x₂ − x₁), cuidando los signos de las coordenadas negativas.',
        'La variación vertical es Δy = −2 − 1 = −3 y el avance horizontal es Δx = −3 − (−2) = −1.',
        'Dividí el valor de Δy por el de Δx respetando la regla de signos entre dos números negativos.',
      ],
      solution:
        'm = (−2 − 1) / (−3 − (−2)) = −3 / (−1) = 3. Como ambos incrementos son negativos, la recta sube hacia la derecha.',
    },
    {
      id: 'lin-sec1-q2',
      competencyId: 'linear.definition_slope_and_intercept',
      prerequisiteIds: [],
      family: 'linear_evaluation_inverse',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['swapped_slope_and_intercept', 'sign_error_in_slope_subtraction'],
      kind: 'number',
      prompt:
        'Dada la función lineal f(x) = 5 − (3/2)x, hallá el valor exacto de x (como fracción reducida p/q) para el cual f(x) = −12:',
      expected: '34/3',
      placeholder: 'Ej: 34/3',
      diagContext: { target: 'equation', m: -1.5, b: 5 },
      hints: [
        'Planteá la ecuación 5 − (3/2)x = −12 y aislá el término que contiene a x.',
        'Al restar 5 de ambos lados queda −(3/2)x = −17, es decir (3/2)x = 17.',
        'Despejá x multiplicando ambos miembros por el inverso multiplicativo de 3/2 y expresalo como fracción impropia.',
      ],
      solution:
        'De 5 − (3/2)x = −12 despejamos −(3/2)x = −17 ⇒ x = 17 · (2/3) = 34/3.',
    },
    {
      id: 'lin-sec1-q3',
      competencyId: 'linear.definition_slope_and_intercept',
      prerequisiteIds: [],
      family: 'linear_study_sign_sets',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_x_and_y_in_linear_sets'],
      kind: 'set',
      prompt:
        'Para f(x) = −(8/3)x + 4, determiná su conjunto de positividad C⁺ en notación de intervalo de Exactas:',
      expected: '(-inf; 3/2)',
      placeholder: 'Ej: (-inf; 3/2)',
      diagContext: { target: 'sign_set', yIntercept: '4' },
      hints: [
        'Primero hallá la raíz C₀ resolviendo −(8/3)x + 4 = 0 para ubicar dónde la recta cruza al eje X.',
        'La raíz cae en x₀ = 4 · (3/8) = 3/2. Como la pendiente m = −8/3 es negativa, la recta baja de izquierda a derecha.',
        'Indicá la semirrecta abierta del eje X ubicada a la izquierda de x₀, donde las alturas f(x) son estrictamente positivas.',
      ],
      solution:
        'Con raíz x₀ = 3/2 y pendiente negativa, la curva queda por encima del eje X antes de 3/2: C⁺ = (−∞; 3/2).',
    },
    {
      id: 'lin-sec1-q4',
      competencyId: 'linear.definition_slope_and_intercept',
      prerequisiteIds: [],
      family: 'vertical_vs_constant_contrast',
      representation: 'verbal',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['divided_by_zero_vertical_horizontal'],
      kind: 'choice',
      prompt:
        'Compará las rectas r₁: x = −4 (pasa por (−4; 1) y (−4; 5)) y r₂: y = −4. ¿Cuál de las afirmaciones es verdadera?',
      options: [
        {
          label: 'r₂ (y = −4) es función constante (Dom = ℝ, Im = {−4}, ni inyectiva ni suryectiva en ℝ), mientras que r₁ (x = −4) no tiene pendiente ni es función.',
          correct: true,
        },
        {
          label: 'r₁ (x = −4) es una función con pendiente m = 0.',
          correct: false,
          diagnosticId: 'divided_by_zero_vertical_horizontal',
        },
        {
          label: 'Ambas rectas son funciones lineales biyectivas de ℝ en ℝ.',
          correct: false,
          diagnosticId: 'divided_by_zero_vertical_horizontal',
        },
      ],
      hints: [
        'Probá aplicar la condición de unicidad: a cada entrada x del dominio le puede corresponder a lo sumo una altura y.',
        'En x = −4, el único valor de entrada x = −4 se asocia con infinitos y (1, 5, −3...); en y = −4, cada x tiene una única imagen −4.',
        'Recordá además que una función constante repite siempre la misma imagen, por lo que no puede ser inyectiva ni cubrir todo ℝ.',
      ],
      solution:
        'x = −4 es vertical (Δx = 0, sin pendiente, no es función). y = −4 es función constante con Dom = ℝ e Im = {−4}, no inyectiva ni suryectiva en ℝ.',
    },
  ],

  'sec-formas-angulo': [
    {
      id: 'lin-sec2-q1',
      competencyId: 'linear.angle_and_three_equation_forms',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'segmentary_from_intercepts',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['segmentary_invalid_zero_case'],
      kind: 'expression',
      requireForm: 'segmentary',
      prompt:
        'Escribí en forma segmentaria x/a + y/b = 1 la recta que corta al eje X en 4 y al eje Y en −2:',
      expected: 'x/4 + y/(-2) = 1',
      placeholder: 'Ej: x/4 + y/(-2) = 1',
      diagContext: { target: 'segmentary', expectedA: 4, expectedB: -2 },
      hints: [
        'En la forma segmentaria x/a + y/b = 1, "a" es siempre el corte con el eje X y "b" el corte con el eje Y.',
        'Identificá a = 4 debajo de la variable x y b = −2 debajo de la variable y, cuidando no invertir los ejes.',
        'Igualá la suma de ambas fracciones (o la resta equivalente) a 1 sin despejar y.',
      ],
      solution:
        'Con abscisa al origen a = 4 y ordenada al origen b = −2, la ecuación segmentaria directa es x/4 + y/(−2) = 1 (o x/4 − y/2 = 1).',
    },
    {
      id: 'lin-sec2-q2',
      competencyId: 'linear.angle_and_three_equation_forms',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'implicit_to_explicit',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['swapped_slope_and_intercept'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'Convertí la ecuación implícita 2x + 3y + 4 = 0 a su forma explícita y = mx + b:',
      expected: 'y = -2/3 x - 4/3',
      placeholder: 'Ej: y = -2/3 x - 4/3',
      diagContext: { target: 'equation', m: -2 / 3, b: -4 / 3 },
      hints: [
        'Para llegar a la forma explícita dejá aislado el término con y en el primer miembro: 3y = −2x − 4.',
        'Dividí ambos términos del segundo miembro por 3 sin perder los signos negativos.',
        'Escribí la igualdad comenzando con y = y los dos coeficientes fraccionarios simplificados.',
      ],
      solution:
        'De 2x + 3y + 4 = 0 ⇒ 3y = −2x − 4 ⇒ y = −(2/3)x − 4/3.',
    },
    {
      id: 'lin-sec2-q3',
      competencyId: 'linear.angle_and_three_equation_forms',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'angle_and_point',
      representation: 'verbal',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['sign_error_in_slope_subtraction'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'Hallá la ecuación explícita de la recta que pasa por P(−1; 1) y forma un ángulo de 45° con el semieje positivo de las abscisas (+X):',
      expected: 'y = x + 2',
      placeholder: 'Ej: y = x + 2',
      diagContext: { target: 'equation', m: 1, b: 2 },
      hints: [
        'La pendiente vinculada al ángulo de inclinación α es m = tg(α).',
        'Como α = 45°, tenés m = tg(45°) = 1.',
        'Sustituí P(−1; 1) y la pendiente m = 1 en y = mx + b para calcular b y armar la ecuación explícita.',
      ],
      solution:
        'm = tg(45°) = 1. Como pasa por (−1; 1), 1 = 1·(−1) + b ⇒ b = 2, resultando y = x + 2.',
    },
    {
      id: 'lin-sec2-q4',
      competencyId: 'linear.angle_and_three_equation_forms',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'segmentary_degeneracy_check',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['segmentary_invalid_zero_case'],
      kind: 'choice',
      prompt:
        '¿Cuál de las siguientes rectas SÍ admite escritura en forma segmentaria x/a + y/b = 1?',
      options: [
        {
          label: '3x − 2y = 0',
          correct: false,
          diagnosticId: 'segmentary_invalid_zero_case',
        },
        {
          label: 'y = 5',
          correct: false,
          diagnosticId: 'segmentary_invalid_zero_case',
        },
        {
          label: 'x = −1',
          correct: false,
          diagnosticId: 'segmentary_invalid_zero_case',
        },
        {
          label: '2x − 3y − 6 = 0',
          correct: true,
        },
      ],
      hints: [
        'Para que exista x/a + y/b = 1, la recta debe cortar al eje X en a ≠ 0 y al eje Y en b ≠ 0.',
        'Descartá rectas que pasan por (0; 0) (c = 0), horizontales (a no existe) y verticales (b no existe).',
        'Comprobá en cuál de las cuatro ecuaciones ningún coeficiente A, B ni C vale cero.',
      ],
      solution:
        'Solo 2x − 3y − 6 = 0 tiene A, B, C ≠ 0: corta en a = 3 y b = −2, dando x/3 + y/(−2) = 1.',
    },
  ],

  'sec-paralelas-perpendiculares': [
    {
      id: 'lin-sec3-q1',
      competencyId: 'linear.parallel_perpendicular_and_incidence',
      prerequisiteIds: ['linear.angle_and_three_equation_forms'],
      family: 'parallel_through_point',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_parallel_with_perpendicular'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'Escribí en forma explícita la recta paralela a 2x + 3y + 4 = 0 que pasa por el punto A(−2; 4):',
      expected: 'y = -2/3 x + 8/3',
      placeholder: 'Ej: y = -2/3 x + 8/3',
      diagContext: { target: 'equation', m: -2 / 3, b: 8 / 3 },
      hints: [
        'Despejá y de 2x + 3y + 4 = 0 para conocer la pendiente compartida por las rectas paralelas.',
        'La pendiente de la recta dada es m = −2/3. Usá esa misma pendiente junto con A(−2; 4).',
        'Reemplazá (−2; 4) en y = (−2/3)x + b para despejar la ordenada al origen fraccionaria.',
      ],
      solution:
        'm = −2/3. Reemplazando A(−2; 4): 4 = (−2/3)(−2) + b = 4/3 + b ⇒ b = 8/3, quedando y = −(2/3)x + 8/3.',
    },
    {
      id: 'lin-sec3-q2',
      competencyId: 'linear.parallel_perpendicular_and_incidence',
      prerequisiteIds: ['linear.angle_and_three_equation_forms'],
      family: 'perpendicular_through_point',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_parallel_with_perpendicular'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'Escribí en forma explícita la recta perpendicular a y + 2x − 6 = 0 que pasa por el punto B(2; 3):',
      expected: 'y = 1/2 x + 2',
      placeholder: 'Ej: y = 1/2 x + 2',
      diagContext: { target: 'parallel_perp', refSlope: -2 },
      hints: [
        'Primero pasá y + 2x − 6 = 0 a forma explícita (y = −2x + 6) para no confundir el signo de m₁.',
        'La pendiente perpendicular cumple m₂ = −1 / m₁: como m₁ = −2, invertís y cambiás el signo quedando m₂ = 1/2.',
        'Calculá b usando B(2; 3) en y = (1/2)x + b para completar la forma explícita.',
      ],
      solution:
        'm₁ = −2 ⇒ m₂ = 1/2. Con B(2; 3): 3 = (1/2)(2) + b ⇒ b = 2, resultando y = (1/2)x + 2.',
    },
    {
      id: 'lin-sec3-q3',
      competencyId: 'linear.parallel_perpendicular_and_incidence',
      prerequisiteIds: ['linear.angle_and_three_equation_forms'],
      family: 'perpendicular_parameter_k',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['confused_parallel_with_perpendicular'],
      kind: 'number',
      prompt:
        'Hallá el valor de k para que las rectas r₁: 4y − 5x − 2 = 0 y r₂: 3x + ky + 7 = 0 sean perpendiculares (expresalo como fracción p/q):',
      expected: '15/4',
      placeholder: 'Ej: 15/4',
      diagContext: { target: 'perp_param', expectedK: 15 / 4 },
      hints: [
        'Despejá ambas pendientes: de 4y − 5x − 2 = 0 sale m₁ = 5/4, y de 3x + ky + 7 = 0 sale m₂ = −3/k.',
        'Aplicá la condición de perpendicularidad m₁ · m₂ = −1, es decir (5/4)·(−3/k) = −1.',
        'Simplificá los signos negativos y despejá k multiplicando cruzado.',
      ],
      solution:
        'm₁ = 5/4 y m₂ = −3/k. Exigiendo (5/4)(−3/k) = −1 resulta −15 / (4k) = −1 ⇒ k = 15/4.',
    },
    {
      id: 'lin-sec3-q4',
      competencyId: 'linear.parallel_perpendicular_and_incidence',
      prerequisiteIds: ['linear.angle_and_three_equation_forms'],
      family: 'singular_horizontal_vertical',
      representation: 'graphical',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['divided_by_zero_vertical_horizontal'],
      kind: 'expression',
      requireForm: 'vertical',
      prompt:
        'Escribí la ecuación de la recta perpendicular a la recta horizontal y = 4 que pasa por el punto P(−3; 7):',
      expected: 'x = -3',
      placeholder: 'Ej: x = -3',
      diagContext: { target: 'vertical_or_horizontal' },
      hints: [
        'La recta y = 4 es horizontal (m₁ = 0). Intentar hacer −1/0 no tiene sentido numérico.',
        'Geométricamente, una recta perpendicular a una horizontal debe ser vertical, de la forma x = constante.',
        'Usá la abscisa del punto de paso P(−3; 7) para determinar esa constante.',
      ],
      solution:
        'Toda perpendicular a y = 4 es vertical; al pasar por (−3; 7) queda fijada en x = −3.',
    },
  ],

  'sec-geometria-analitica': [
    {
      id: 'lin-sec4-q1',
      competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
      prerequisiteIds: ['linear.parallel_perpendicular_and_incidence'],
      family: 'midpoint_coordinates',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['sign_error_in_slope_subtraction'],
      kind: 'pair',
      prompt:
        'Calculá las coordenadas del punto medio M del segmento determinado por P(1; 0) y Q(−1; 6) usando notación de Exactas (x; y):',
      expected: '(0; 3)',
      placeholder: 'Ej: (0; 3)',
      diagContext: { target: 'midpoint' },
      hints: [
        'El punto medio promedia las abscisas por un lado y las ordenadas por el otro: M = ((x₁+x₂)/2; (y₁+y₂)/2).',
        'Sumá las coordenadas: en x da 1 + (−1) = 0; en y da 0 + 6 = 6.',
        'Dividí ambos resultados por 2 y escribí el par ordenado usando punto y coma ";" como separador.',
      ],
      solution:
        'M = ((1 + (−1))/2; (0 + 6)/2) = (0; 3).',
    },
    {
      id: 'lin-sec4-q2',
      competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
      prerequisiteIds: ['linear.parallel_perpendicular_and_incidence'],
      family: 'mediatriz_equation',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['mediatriz_missing_midpoint_or_perp', 'confused_parallel_with_perpendicular'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'Hallá la ecuación explícita de la mediatriz del segmento PQ con P(1; 0) y Q(−1; 6):',
      expected: 'y = 1/3 x + 3',
      placeholder: 'Ej: y = 1/3 x + 3',
      diagContext: { target: 'mediatriz', p1: { x: 1, y: 0 }, p2: { x: -1, y: 6 } },
      hints: [
        'La mediatriz debe ser perpendicular al segmento PQ Y pasar por su punto medio M(0; 3).',
        'La pendiente del segmento es m_PQ = (6 − 0)/(−1 − 1) = −3, por lo que su pendiente perpendicular vale m_⊥ = 1/3.',
        'Hacé pasar la recta de pendiente 1/3 por M(0; 3) para leer directamente la ordenada al origen y escribir y = mx + b.',
      ],
      solution:
        'Con M(0; 3) y m_⊥ = −1/(−3) = 1/3, la mediatriz tiene ecuación y = (1/3)x + 3.',
    },
    {
      id: 'lin-sec4-q3',
      competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
      prerequisiteIds: ['linear.parallel_perpendicular_and_incidence'],
      family: 'point_line_distance_exact',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['forgot_abs_or_sqrt_in_distance'],
      kind: 'radical',
      prompt:
        'Calculá la distancia exacta desde el punto P(4; 2) hasta la recta y = 2x − 1 (escribila como radical exacto, ej. sqrt(5) o √5):',
      expected: 'sqrt(5)',
      placeholder: 'Ej: sqrt(5)',
      diagContext: { target: 'distance', numeratorAbs: 5, expectedSquared: 5 },
      hints: [
        'Pasá primero la recta a forma implícita 2x − y − 1 = 0 para aplicar d(P; r) = |Ax₀ + By₀ + C| / √(A² + B²).',
        'El numerador da |2(4) − 1(2) − 1| = |5| = 5, y el denominador es √(2² + (−1)²) = √5.',
        'Racionalizá el cociente 5 / √5 multiplicando numerador y denominador por √5 y simplificando el factor entero.',
      ],
      solution:
        'd(P; r) = |2·4 − 2 − 1| / √(2² + (−1)²) = 5 / √5 = (5√5)/5 = √5.',
    },
    {
      id: 'lin-sec4-q4',
      competencyId: 'linear.analytic_geometry_distance_midpoint_bisector',
      prerequisiteIds: ['linear.parallel_perpendicular_and_incidence'],
      family: 'triangle_classification_by_distances',
      representation: 'graphical',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['forgot_abs_or_sqrt_in_distance'],
      kind: 'choice',
      prompt:
        'Dados A(3; 0), B(−3; 4) y C(−2; 5), calculando las longitudes al cuadrado d²(A; B), d²(B; C) y d²(C; A), ¿qué figura determinan?',
      options: [
        {
          label: 'Un triángulo escaleno (y además rectángulo en C), con d² = 52, 2 y 50 respectivamente.',
          correct: true,
        },
        {
          label: 'Un triángulo isósceles porque dos lados miden lo mismo.',
          correct: false,
          diagnosticId: 'forgot_abs_or_sqrt_in_distance',
        },
        {
          label: 'Tres puntos colineales porque las pendientes coinciden.',
          correct: false,
          diagnosticId: 'inverted_slope_dx_over_dy',
        },
      ],
      hints: [
        'Calculá las diferencias Δx y Δy de cada par de puntos y sumá sus cuadrados: d² = Δx² + Δy².',
        'Obtenés d²(A; B) = (−6)² + 4² = 52, d²(B; C) = 1² + 1² = 2, y d²(C; A) = 5² + (−5)² = 50.',
        'Observá si los tres lados son distintos entre sí y verificá además si se cumple 2 + 50 = 52.',
      ],
      solution:
        'Las longitudes exactas son √52 = 2√13, √2 y √50 = 5√2: todas distintas (escaleno) y cumplen 2 + 50 = 52 (triángulo rectángulo en C).',
    },
  ],

  'sec-modelizacion-tramos': [
    {
      id: 'lin-sec5-q1',
      competencyId: 'linear.modeling_and_piecewise',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'linear_modeling_reservoir',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['swapped_slope_and_intercept'],
      kind: 'number',
      prompt:
        'Una represa tiene 1056 millones de litros y pierde 12 millones por día por una filtración: y = 1056 − 12x. ¿Después de cuántos días quedarán exactamente 144 millones de litros?',
      expected: 76,
      placeholder: 'Ej: 76',
      diagContext: { target: 'modeling' },
      hints: [
        'Identificá qué variable representa el dato conocido: 144 millones de litros es el volumen restante y.',
        'Planteá 144 = 1056 − 12x y despejá 12x = 1056 − 144 = 912.',
        'Dividí 912 por la pérdida diaria de 12 millones para hallar la cantidad de días x.',
      ],
      solution:
        '144 = 1056 − 12x ⇒ 12x = 912 ⇒ x = 76 días.',
    },
    {
      id: 'lin-sec5-q2',
      competencyId: 'linear.modeling_and_piecewise',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'linear_modeling_train_tp1',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['inverted_slope_dx_over_dy', 'swapped_slope_and_intercept'],
      kind: 'expression',
      requireForm: 'explicit',
      prompt:
        'El boleto de tren sigue un modelo lineal p(x) = mx + b según la distancia x (en km). Para 120 km cuesta $15, y al viajar 210 km sube un 60% respecto de ese precio (cuesta $24). Escribí la fórmula explícita usando y en lugar de p(x):',
      expected: 'y = 1/10 x + 3',
      placeholder: 'Ej: y = 1/10 x + 3',
      diagContext: { target: 'equation', m: 0.1, b: 3 },
      hints: [
        'Traducí ambos datos a pares ordenados (distancia; precio): (120; 15) y (210; 24).',
        'Calculá la pendiente m = (24 − 15) / (210 − 120) = 9 / 90 = 1/10 ($0,10 por km).',
        'Reemplazá el punto (120; 15) en y = (1/10)x + b para despejar la tarifa base fija b y armar y = mx + b.',
      ],
      solution:
        'Con m = 9/90 = 1/10 y el punto (120; 15): 15 = 12 + b ⇒ b = 3. La fórmula es y = (1/10)x + 3.',
    },
    {
      id: 'lin-sec5-q3',
      competencyId: 'linear.modeling_and_piecewise',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'piecewise_image',
      representation: 'graphical',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['piecewise_boundary_inclusion_error'],
      kind: 'interval',
      prompt:
        'Dada f(x) = −2x − 1 si x < 0; 3 si 0 ≤ x < 4; (1/2)x + 3 si x ≥ 4, escribí el conjunto Imagen Im(f) en notación de Exactas:',
      expected: '(-1; +inf)',
      placeholder: 'Ej: (-1; +inf)',
      diagContext: { target: 'piecewise_image', openBoundary: '-1' },
      hints: [
        'Analizá la imagen de cada tramo por separado: el tramo izquierdo (x < 0) toma alturas mayores a −1 sin incluir −1.',
        'El tramo medio aporta el valor aislado {3} y el tramo derecho (x ≥ 4) cubre [5; +∞); ambos quedan incluidos dentro del barrido del primer tramo.',
        'Escribí el intervalo total desde la cota inferior −1 hasta +inf cuidando el tipo de paréntesis en el extremo inferior.',
      ],
      solution:
        'El tramo izquierdo barre (−1; +∞) sin alcanzar −1 (ya que x < 0 es estricto y f(0) = 3). Por eso Im(f) = (−1; +∞).',
    },
    {
      id: 'lin-sec5-q4',
      competencyId: 'linear.modeling_and_piecewise',
      prerequisiteIds: ['linear.definition_slope_and_intercept'],
      family: 'piecewise_positivity_set',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['confused_x_and_y_in_linear_sets', 'piecewise_boundary_inclusion_error'],
      kind: 'set',
      prompt:
        'Para la misma función por tramos f(x) = −2x − 1 (x < 0); 3 (0 ≤ x < 4); (1/2)x + 3 (x ≥ 4), escribí el conjunto de positividad C⁺ en notación de Exactas:',
      expected: '(-inf; -1/2) U [0; +inf)',
      placeholder: 'Ej: (-inf; -1/2) U [0; +inf)',
      diagContext: { target: 'piecewise_sign', closedBoundary: '0' },
      hints: [
        'En el primer tramo (x < 0), resolvé −2x − 1 > 0: obtenés x < −1/2 (para −1/2 < x < 0 la curva queda negativa).',
        'A partir de x = 0 inclusive (f(0) = 3 > 0), tanto el segundo tramo constante (y = 3) como el tercero (y ≥ 5) son siempre positivos.',
        'Uní ambas zonas del eje X con el símbolo U, cuidando usar corchete cerrado en 0 porque f(0) = 3 es positivo.',
      ],
      solution:
        'En x < 0 es positiva cuando x < −1/2; en x = 0 vale f(0) = 3 > 0 y sigue positiva para todo x ≥ 0: C⁺ = (−∞; −1/2) ∪ [0; +∞).',
    },
  ],
};

const WIDGETS = [
  ['constructor-rectas', './widgets/constructor-rectas.js', 'initConstructorRectas'],
  ['traductor-formas', './widgets/traductor-formas.js', 'initTraductorFormas'],
  ['paralelas-perpendiculares', './widgets/paralelas-perpendiculares.js', 'initParalelasPerpendiculares'],
  ['geometria-analitica', './widgets/geometria-analitica.js', 'initGeometriaAnalitica'],
];

const activeWidgets = new WeakMap();

function initFadingExamples() {
  qsa('.lin-worked-fading').forEach((box) => {
    const btns = box.querySelectorAll('[data-fade-btn]');
    const panels = box.querySelectorAll('[data-fade-panel]');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lvl = btn.getAttribute('data-fade-btn');
        btns.forEach((b) => b.classList.toggle('is-active', b === btn));
        panels.forEach((p) => {
          p.hidden = p.getAttribute('data-fade-panel') !== lvl;
        });
      });
    });
  });
}

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
      'aria-controls': 'lin-sidebar-index',
    },
    'Índice'
  );
  const badge = h('span', { class: 'seq-blackboard-toolbar__badge', id: 'seq-board-badge' });
  const title = h('strong', { id: 'seq-board-title' });
  const toggle = h(
    'button',
    { type: 'button', class: 'chip', id: 'seq-mode-toggle' },
    'Pizarrón por lección (activo)'
  );
  const bar = h(
    'div',
    { class: 'seq-blackboard-toolbar', id: 'seq-board-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    h('div', { class: 'seq-blackboard-toolbar__actions' }, toggle)
  );
  content.prepend(bar);
  initLessonDock();

  if (sidebar) sidebar.id = 'lin-sidebar-index';

  const sidebarKey = 'lineal:sidebar:v1';
  const setSidebar = (collapsed, persist = true) => {
    page?.classList.toggle('is-sidebar-collapsed', collapsed);
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggle.textContent = collapsed ? 'Índice' : 'Ocultar índice';
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
  sidebarToggle.addEventListener('click', () =>
    setSidebar(!page?.classList.contains('is-sidebar-collapsed'))
  );

  let focused = true;
  let current = LESSON_SECTIONS[0].id;

  const activate = (id, scroll = true) => {
    const index = LESSON_SECTIONS.findIndex((item) => item.id === id);
    const isExtraSection = id === 'sec-retos' || id === 'sec-repaso';
    if (index < 0 && !isExtraSection) return;

    const activeSection = document.getElementById(id);
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
      title.textContent = 'Hoja de Repaso Imprimible · Función Lineal';
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
        ? h('button', { type: 'button', class: 'chip seq-chalk-tray__btn', on: { click: () => activate(previous.id) } }, `← ${previous.short}`)
        : h('span', { class: 'muted small' }, 'Primer pizarrón'),
      h('span', { class: 'seq-chalk-tray__info' }, `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`),
      next
        ? h('button', { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate(next.id) } }, `${next.short} →`)
        : h('button', { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate('sec-retos') } }, 'Ir al Entrenador y Trampas →')
    );
    section.append(tray);
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
    window.addEventListener('resize', () => {
      const isCollapsed = page?.classList.contains('is-sidebar-collapsed');
      if (window.innerWidth < 1280 && !isCollapsed) setSidebar(true, false);
      else if (window.innerWidth >= 1280 && isCollapsed && !savedSidebar) setSidebar(false, false);
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

  // 1. Montar los 4 widgets principales + tablero de tramos en Sec. 5
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

  document.querySelectorAll('[data-widget="tramos-lineal"]').forEach((host) => {
    createPiecewiseLinearPreview(host);
  });

  // 2. Montar fórmulas anotadas y tiras de 3 formas
  qsa('[data-lin-formula]').forEach((host) => {
    const form = host.getAttribute('data-lin-formula') || 'explicit';
    const m = Number(host.getAttribute('data-m') ?? -2 / 3);
    const b = Number(host.getAttribute('data-b') ?? 2);
    host.replaceChildren(annotatedLinearFormula({ form, m, b }));
  });

  qsa('[data-lin-strip]').forEach((host) => {
    const A = Number(host.getAttribute('data-a') ?? 2);
    const B = Number(host.getAttribute('data-b') ?? 3);
    const C = Number(host.getAttribute('data-c') ?? -6);
    host.replaceChildren(threeFormsStrip({ A, B, C }));
  });

  // 3. Montar los 5 bloques de chequeo (20 preguntas)
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

  // 4. Montar Retos y Trampas
  const retosHost = document.getElementById('lin-challenges');
  if (retosHost) mountLinearRetos(retosHost);

  // 5. Panel de Competencias en #sec-repaso
  const dashboardHost = document.getElementById('lin-competency-dashboard');
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
        const familySelect = document.querySelector('.lin-family-select');
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
  mountLinearRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateLinearChallenge,
  generateLinearChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
  LIN_COMPETENCIES,
  LINEAL_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
