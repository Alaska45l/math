/**
 * @file js/modules/funciones-trigonometricas/index.js
 * Orquestador principal de Unidad 11 · Funciones Trigonométricas (`funciones-trigonometricas.html`).
 * 7 secciones (sec-1..sec-7), 6 widgets SVG accesibles con POE en 2 etapas,
 * 21 chequeos de 8-tupla (63 pistas progresivas sin fuga de respuesta),
 * entrenador determinista Mulberry32 (8 familias + 5 trampas) y dashboard de competencias.
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedTrigFormula,
  sixFunctionsComparisonTable,
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
  TRIG_FUNCTIONS_COMPETENCIES,
  FUNCIONES_TRIG_COMPETENCIES,
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
  mountTrigFunctionsRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateTrigFunctionsChallenge,
  generateTrigFunctionsChallenges,
  selectAdaptiveTrigFunctionsFamily,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-1',
    chapter: 'Capítulo 1 · Sistemas Angulares, Congruencia y Plano Cartesiano',
    title: 'Sistemas angulares, congruencia y clases de equivalencia C_α',
    short: '1 · Congruencia C_α',
  },
  {
    id: 'sec-2',
    chapter: 'Capítulo 1 · Sistemas Angulares, Congruencia y Plano Cartesiano',
    title: 'Definición cartesiana (abs, ord, r.v.) y signos en los 4 cuadrantes',
    short: '2 · Definición Cartesiana',
  },
  {
    id: 'sec-3',
    chapter: 'Capítulo 2 · Las 6 Funciones Trigonométricas y sus Gráficas',
    title: 'Seno y coseno: gráficas, análisis completo y biyectividad',
    short: '3 · Seno y Coseno',
  },
  {
    id: 'sec-4',
    chapter: 'Capítulo 2 · Las 6 Funciones Trigonométricas y sus Gráficas',
    title: 'Tangente, cotangente, secante y cosecante (dominios diferenciados)',
    short: '4 · Tg, Cotg, Sec, Cosec',
  },
  {
    id: 'sec-5',
    chapter: 'Capítulo 3 · Identidades, Reducción y Ecuaciones Periódicas',
    title: 'Ángulos notables, identidad pitagórica, reducción al I cuadrante e identidades',
    short: '5 · Identidades y Reducción',
  },
  {
    id: 'sec-6',
    chapter: 'Capítulo 3 · Identidades, Reducción y Ecuaciones Periódicas',
    title: 'Ecuaciones trigonométricas, soluciones periódicas en C_α y control de polos',
    short: '6 · Ecuaciones Periódicas',
  },
  {
    id: 'sec-7',
    chapter: 'Capítulo 3 · Identidades, Reducción y Ecuaciones Periódicas',
    title: 'Estudio integral de restricciones, validez e inversas',
    short: '7 · Restricciones e Inversas',
  },
];

export const CHECKS_DATA = {
  'sec-1': [
    {
      id: 'trigf-sec1-q1',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'congruence_principal_rep',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['negative_angle_not_reduced_to_principal'],
      kind: 'angle',
      defaultSystem: 'rad',
      requireExactPi: true,
      requirePrincipal: true,
      prompt: 'Determiná el representante principal en [0; 2π) (como múltiplo exacto de π) de α = 9π/2:',
      expected: 'π/2',
      placeholder: 'Ej: aπ/b',
      diagContext: { target: 'principal_rep' },
      hints: [
        'Dividí el ángulo por giros completos de 2π = 4π/2.',
        '9π/2 = 2 · (4π/2) + 1π/2 = 4π + resto.',
        'Conservá únicamente el resto positivo dentro de [0; 2π) como fracción irreducible de π.',
      ],
      solution: '9π/2 = 2·(2π) + π/2 ⇒ el representante principal en [0; 2π) es π/2.',
    },
    {
      id: 'trigf-sec1-q2',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'congruence_principal_rep',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['negative_angle_not_reduced_to_principal'],
      kind: 'congruence_class',
      requirePrincipal: true,
      prompt: 'Expresá la clase de congruencia C_{-π/3} utilizando su representante principal en [0; 2π):',
      expected: 'C_{5π/3}',
      placeholder: 'Ej: C_{aπ/b}',
      diagContext: { target: 'congruence' },
      hints: [
        '−π/3 es negativo (fuera de [0; 2π)); tenés que sumarle un giro completo de 2π.',
        'Convertí 2π a tercios: 2π = 6π/3.',
        'Sumá −π/3 + 6π/3 y escribí el resultado positivo dentro de la notación C_{...}.',
      ],
      solution: '−π/3 + 2π = 5π/3 ∈ [0; 2π) ⇒ la clase es C_{5π/3}.',
    },
    {
      id: 'trigf-sec1-q3',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'congruence_principal_rep',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['negative_angle_not_reduced_to_principal'],
      kind: 'choice',
      prompt: '¿Son congruentes los ángulos −870° y 31π/6?',
      options: [
        {
          label: 'Sí, ambos reducen a 210° (= 7π/6) y su diferencia es 1800° = 5 · 360°.',
          correct: true,
        },
        {
          label: 'No, porque −870° pertenece al II cuadrante y 31π/6 al IV cuadrante.',
          correct: false,
          diagnosticId: 'negative_angle_not_reduced_to_principal',
        },
        {
          label: 'No se pueden comparar porque uno está en grados y el otro en radianes.',
          correct: false,
          diagnosticId: 'negative_angle_not_reduced_to_principal',
        },
      ],
      hints: [
        'Sumá múltiplos de 360° a −870° hasta caer en [0°; 360°): −870° + 3·360° = −870° + 1080°.',
        'Restá múltiplos de 2π = 12π/6 a 31π/6: 31π/6 − 24π/6 = 7π/6 (y 7·180°/6 = 210°).',
        'Elegí la opción donde ambos representantes principales coinciden en el III cuadrante.',
      ],
      solution: 'Verdadero: −870° ≡ 210° y 31π/6 ≡ 7π/6 = 210°, difieren exactamente en 5 giros completos.',
    },
  ],

  'sec-2': [
    {
      id: 'trigf-sec2-q1',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'cartesian_def_six_ratios',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['swapped_abs_ord_in_cartesian_def'],
      kind: 'radical',
      tol: 1e-4,
      prompt: 'El lado terminal de α pasa por P(−3; −4). Calculá el valor exacto de cos(α):',
      expected: '-3/5',
      placeholder: 'Ej: ±p/q',
      diagContext: { swappedAbsOrdValue: '-4/5', checkSignFlip: true },
      hints: [
        'Calculá primero el radio vector r.v. = √((−3)² + (−4)²) > 0.',
        'Recordá que cos(α) = abs / r.v. (usa la abscisa x = −3, no la ordenada y = −4).',
        'Dividí la abscisa negativa por el radio vector positivo obtenido.',
      ],
      solution: 'r.v. = √(9 + 16) = 5; luego cos(α) = abs / r.v. = −3/5.',
    },
    {
      id: 'trigf-sec2-q2',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'cartesian_def_six_ratios',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['swapped_abs_ord_in_cartesian_def', 'forgot_rationalization_or_reciprocal'],
      kind: 'radical',
      tol: 1e-4,
      requireRationalized: true,
      prompt: 'Un punto del lado terminal de α tiene coordenadas P(−3; −√7) (r.v. = 4). Calculá exactamente cosec(α):',
      expected: '-4√7/7',
      placeholder: 'Ej: ±a√b/c',
      diagContext: {
        swappedAbsOrdValue: '-4/3',
        wrongReciprocalValue: '-4/3',
        requireRationalized: true,
      },
      hints: [
        'Verificá r.v. = √((−3)² + (−√7)²) = √(9 + 7) = 4. Además cosec(α) = r.v. / ord.',
        'Al reemplazar queda 4 / (−√7). Multiplicá numerador y denominador por √7 para racionalizar.',
        'Conservá el signo negativo de la ordenada y simplificá √7·√7 = 7 en el denominador.',
      ],
      solution: 'cosec(α) = r.v. / ord = 4 / (−√7) = −4√7/7.',
    },
    {
      id: 'trigf-sec2-q3',
      competencyId: 'trig_functions.congruence_classes_and_cartesian_def',
      prerequisiteIds: [],
      family: 'cartesian_def_six_ratios',
      representation: 'manipulative',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['swapped_abs_ord_in_cartesian_def'],
      kind: 'choice',
      prompt: 'En el tercer cuadrante (III), ¿qué signos tienen sen(α), cos(α) y tg(α)?',
      options: [
        { label: 'sen(α) < 0, cos(α) < 0 y tg(α) > 0.', correct: true },
        { label: 'sen(α) < 0, cos(α) < 0 y tg(α) < 0.', correct: false, diagnosticId: 'swapped_abs_ord_in_cartesian_def' },
        { label: 'sen(α) > 0, cos(α) < 0 y tg(α) < 0.', correct: false, diagnosticId: 'swapped_abs_ord_in_cartesian_def' },
      ],
      hints: [
        'En el III cuadrante ambas coordenadas del punto P(abs; ord) son negativas.',
        'Como r.v. > 0 siempre, sen = ord/r.v. y cos = abs/r.v. heredan el signo negativo, pero tg = ord/abs divide negativo entre negativo.',
        'Elegí la opción donde seno y coseno son negativos y tangente positiva.',
      ],
      solution: 'En el III cuadrante solo tg y cotg son positivas; sen, cos, sec y cosec son negativas.',
    },
  ],

  'sec-3': [
    {
      id: 'trigf-sec3-q1',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'six_functions_domain_image_period',
      representation: 'graphical',
      difficulty: 1,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['accepted_sin_cos_outside_unit_interval'],
      kind: 'interval',
      prompt: 'Indicá el conjunto imagen de las funciones f(x) = sen x y g(x) = cos x:',
      expected: '[−1; 1]',
      placeholder: 'Ej: [a; b]',
      diagContext: { target: 'range_check' },
      hints: [
        'Tanto sen x como cos x alcanzan su valor mínimo en −1 y su máximo en +1.',
        'Los extremos −1 y +1 sí son alcanzados (por ejemplo cos(0) = 1 y cos(π) = −1).',
        'Escribí el intervalo cerrado con corchetes y separado por punto y coma.',
      ],
      solution: 'Im(sen) = Im(cos) = [−1; 1].',
    },
    {
      id: 'trigf-sec3-q2',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'bijectivity_domain_restriction',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['missed_second_quadrant_solution_branch'],
      kind: 'interval',
      prompt: 'Determiná el conjunto de todos los x ∈ (−2π; 2π) tales que sen x = −1 (separados por ";"):',
      expected: '{−π/2; 3π/2}',
      placeholder: 'Ej: {−π/a; bπ/a}',
      diagContext: { target: 'trig_equation' },
      hints: [
        'sen x alcanza su mínimo −1 en el semieje vertical negativo (−Y).',
        'En [0; 2π) eso ocurre en 3π/2; en (−2π; 0) ocurre al restarle 2π: 3π/2 − 2π = −π/2.',
        'Escribí ambos valores exactos como conjunto finito entre llaves.',
      ],
      solution: 'En (−2π; 2π), sen x = −1 en S = {−π/2; 3π/2}.',
    },
    {
      id: 'trigf-sec3-q3',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'bijectivity_domain_restriction',
      representation: 'graphical',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['confused_tan_period_2pi_with_pi'],
      kind: 'interval',
      prompt: 'Indicá el intervalo estándar de dominio restringido (y codominio [−1; 1]) para que f(x) = cos x sea biyectiva:',
      expected: '[0; π]',
      placeholder: 'Ej: [a; b]',
      diagContext: { target: 'bijectivity' },
      hints: [
        'Buscá un intervalo donde cos x recorra de +1 a −1 de forma estrictamente decreciente sin repetir valores.',
        'En x = 0 toma el máximo +1; a medida que x avanza hasta π baja sin doblar hasta −1.',
        'Escribí el intervalo cerrado desde el cero hasta media vuelta.',
      ],
      solution: 'Restringiendo cos: [0; π] → [−1; 1] la función es estrictamente decreciente y biyectiva.',
    },
  ],

  'sec-4': [
    {
      id: 'trigf-sec4-q1',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'six_functions_domain_image_period',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['assumed_identical_domain_for_all_six_trig'],
      kind: 'set',
      prompt: 'Escribí el dominio de f(x) = tg x excluyendo sus polos como unión de clases C_α:',
      expected: 'ℝ − (C_{π/2} ∪ C_{3π/2})',
      placeholder: 'Ej: ℝ − (C_{a} ∪ C_{b})',
      diagContext: { target: 'domain_six_functions', fnName: 'tan' },
      hints: [
        'Como tg x = sen x / cos x, hay que excluir exactamente los ceros de cos x.',
        'En [0; 2π), cos x = 0 en los dos ángulos sobre el eje vertical: π/2 y 3π/2.',
        'Restá a ℝ la unión de esas dos clases de congruencia (no las de sen x = 0).',
      ],
      solution: 'Dom(tg) = ℝ − (C_{π/2} ∪ C_{3π/2}) (también escrito ℝ − {π/2 + kπ, k ∈ ℤ}).',
    },
    {
      id: 'trigf-sec4-q2',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'six_functions_domain_image_period',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['assumed_identical_domain_for_all_six_trig', 'accepted_sin_cos_outside_unit_interval'],
      kind: 'set_or_interval',
      prompt: 'Indicá el conjunto imagen Im(f) de f(x) = cosec x (y de f(x) = sec x):',
      expected: '(−∞; −1] ∪ [1; +∞)',
      placeholder: 'Ej: (−∞; −a] ∪ [a; +∞)',
      diagContext: { target: 'range_check', fnName: 'csc' },
      hints: [
        'Como |sen x| ≤ 1 y cosec x = 1/sen x, al invertir un número en [−1; 1] − {0} su valor absoluto siempre resulta ≥ 1.',
        'La franja abierta (−1; 1) queda completamente prohibida; los valores −1 y +1 sí se alcanzan.',
        'Escribí la unión de los dos rayos cerrados en −1 y +1.',
      ],
      solution: 'Im(cosec) = Im(sec) = (−∞; −1] ∪ [1; +∞).',
    },
    {
      id: 'trigf-sec4-q3',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'six_functions_domain_image_period',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['assumed_identical_domain_for_all_six_trig', 'confused_tan_period_2pi_with_pi'],
      kind: 'choice',
      prompt: '¿Qué diferencia clave separa a tg x y cotg x respecto de sec x y cosec x?',
      options: [
        {
          label: 'tg x y cotg x tienen imagen ℝ y período π (y dominios distintos entre sí: polos en cos=0 vs sen=0); sec x y cosec x tienen imagen (−∞; −1] ∪ [1; +∞) y período 2π.',
          correct: true,
        },
        {
          label: 'Las cuatro funciones derivadas tienen período 2π y dominio ℝ − (C₀ ∪ C_π).',
          correct: false,
          diagnosticId: 'assumed_identical_domain_for_all_six_trig',
        },
        {
          label: 'cotg x tiene período 2π y su imagen deja afuera el intervalo (−1; 1).',
          correct: false,
          diagnosticId: 'confused_tan_period_2pi_with_pi',
        },
      ],
      hints: [
        'Compará primero los denominadores: tg/sec dividen por cos x, mientras cotg/cosec dividen por sen x.',
        'Luego compará períodos e imágenes: tg y cotg repiten cada π y barren todo ℝ; sec y cosec repiten cada 2π y evitan (−1; 1).',
        'Elegí la opción que respeta simultáneamente la diferencia de dominios, imágenes y períodos.',
      ],
      solution: 'tg/cotg: período π e imagen ℝ; sec/cosec: período 2π e imagen (−∞; −1]∪[1; +∞); y dominios separados por cos=0 vs sen=0.',
    },
  ],

  'sec-5': [
    {
      id: 'trigf-sec5-q1',
      competencyId: 'trig_functions.pythagorean_identities_and_reduction',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'exact_quadrant_six_ratios',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['ignored_quadrant_sign_in_pythagorean', 'forgot_rationalization_or_reciprocal'],
      kind: 'radical',
      tol: 1e-4,
      requireRationalized: true,
      prompt: 'Sabiendo que sen(α) = −3/4 y tg(α) > 0, calculá en forma exacta y racionalizada sec(α):',
      expected: '-4√7/7',
      placeholder: 'Ej: ±a√b/c',
      diagContext: {
        target: 'pythagorean_quadrant',
        checkSignFlip: true,
        wrongSignValue: '4√7/7',
        wrongReciprocalValue: '-4/3',
        requireRationalized: true,
      },
      hints: [
        'sen(α) < 0 y tg(α) > 0 ubican a α en el cuadrante III, donde cos(α) < 0.',
        'Por sen² α + cos² α = 1: cos² α = 1 − 9/16 = 7/16 ⇒ cos α = −√7/4.',
        'Invertí cos(α) para obtener sec(α) = 1/cos(α) y racionalizá el denominador.',
      ],
      solution: 'α ∈ III ⇒ cos α = −√7/4 ⇒ sec α = −4/√7 = −4√7/7.',
    },
    {
      id: 'trigf-sec5-q2',
      competencyId: 'trig_functions.pythagorean_identities_and_reduction',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'first_quadrant_reduction_numeric',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['wrong_quadrant_reduction_formula'],
      kind: 'number',
      tol: 0.01,
      prompt: 'Reduciendo al primer cuadrante, calculá el valor numérico exacto de x = sen(45°)·cos(135°) + cos(30°)·cotg(45°) (como fracción/radical o decimal):',
      expected: (-1 + Math.sqrt(3)) / 2,
      placeholder: 'Ej: (−1 + √3)/2 o 0,366',
      diagContext: { target: 'reduction', wrongReductionValue: (1 + Math.sqrt(3)) / 2 },
      hints: [
        '135° pertenece al II cuadrante: cos(135°) = −cos(180° − 135°) = −cos(45°) = −√2/2.',
        'Sustituí los notables: sen(45°) = √2/2, cos(30°) = √3/2 y cotg(45°) = 1.',
        'Multiplicá (√2/2)·(−√2/2) = −1/2 y sumale √3/2.',
      ],
      solution: '(√2/2)(−√2/2) + (√3/2)·1 = (−1 + √3)/2 ≈ 0,3660.',
    },
    {
      id: 'trigf-sec5-q3',
      competencyId: 'trig_functions.pythagorean_identities_and_reduction',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'first_quadrant_reduction_numeric',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['wrong_quadrant_reduction_formula'],
      kind: 'number',
      tol: 0.01,
      prompt: 'Calculá el valor numérico exacto de x = [2·sen(150°)·cos(180°)] / tg(45°):',
      expected: -1,
      placeholder: 'Ej: ±n',
      diagContext: { target: 'reduction', wrongReductionValue: 1 },
      hints: [
        '150° está en el II cuadrante: sen(150°) = +sen(180° − 150°) = +sen(30°) = 1/2.',
        'Evaluá los ejes/notables: cos(180°) = −1 y tg(45°) = 1.',
        'Realizá el producto en el numerador y dividí por tg(45°) respetando el signo de cos(180°).',
      ],
      solution: '[2 · (1/2) · (−1)] / 1 = −1.',
    },
  ],

  'sec-6': [
    {
      id: 'trigf-sec6-q1',
      competencyId: 'trig_functions.periodic_equations_and_domain_checks',
      prerequisiteIds: [
        'trig_functions.six_functions_domains_graphs_and_bijectivity',
        'trig_functions.pythagorean_identities_and_reduction',
      ],
      family: 'trig_equation_0_to_2pi',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['missed_second_quadrant_solution_branch'],
      kind: 'solution_set',
      prompt: 'Resolvé 4·cos²(x) − 1 = 0 para x ∈ [0; 2π) (escribí el conjunto entre llaves separado por ";"):',
      expected: '{π/3; 2π/3; 4π/3; 5π/3}',
      placeholder: 'Ej: {π/m; ...}',
      diagContext: { target: 'trig_equation' },
      hints: [
        'Despejá cos²(x) = 1/4, lo cual abre dos ramas: cos(x) = +1/2 y cos(x) = −1/2.',
        'cos(x) = +1/2 ocurre en QI (π/3) y QIV (5π/3); cos(x) = −1/2 ocurre en QII (2π/3) y QIII (4π/3).',
        'Reuní las 4 soluciones dentro de [0; 2π) entre llaves y separadas por punto y coma.',
      ],
      solution: 'S = {π/3; 2π/3; 4π/3; 5π/3}.',
    },
    {
      id: 'trigf-sec6-q2',
      competencyId: 'trig_functions.periodic_equations_and_domain_checks',
      prerequisiteIds: [
        'trig_functions.six_functions_domains_graphs_and_bijectivity',
        'trig_functions.pythagorean_identities_and_reduction',
      ],
      family: 'trig_equation_periodic_R_classes',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['accepted_pole_root_in_trig_equation', 'missed_second_quadrant_solution_branch'],
      kind: 'congruence_union',
      requirePrincipal: true,
      prompt: 'Determiná el conjunto solución en ℝ de [(1 − sen x)(√3 − tg x)] / cos x = 0 usando unión de clases C_α:',
      expected: 'C_{π/3} ∪ C_{4π/3}',
      placeholder: 'Ej: C_{aπ/b} ∪ C_{cπ/b}',
      diagContext: { target: 'trig_equation', poleValues: [Math.PI / 2, 1.5 * Math.PI] },
      hints: [
        'El dominio exige cos x ≠ 0 (denominador y dominio de tg x), por lo que x = π/2 queda excluido aunque anule 1 − sen x.',
        'Solo sobrevive la rama √3 − tg x = 0 ⇒ tg x = √3.',
        'Ubicá las soluciones de tg x = √3 en el I y III cuadrante dentro de [0; 2π) y escribí la unión de sus clases C_α.',
      ],
      solution: 'Descartando x = π/2 (cos(π/2) = 0), queda tg x = √3 ⇒ S = C_{π/3} ∪ C_{4π/3}.',
    },
    {
      id: 'trigf-sec6-q3',
      competencyId: 'trig_functions.periodic_equations_and_domain_checks',
      prerequisiteIds: [
        'trig_functions.six_functions_domains_graphs_and_bijectivity',
        'trig_functions.pythagorean_identities_and_reduction',
      ],
      family: 'trig_equation_periodic_R_classes',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['accepted_pole_root_in_trig_equation', 'missed_second_quadrant_solution_branch'],
      kind: 'congruence_union',
      requirePrincipal: true,
      prompt: 'Resolvé en ℝ la ecuación 2·cosec x − 2·sen x = cotg x (recordá exigir sen x ≠ 0):',
      expected: 'C_{π/3} ∪ C_{π/2} ∪ C_{3π/2} ∪ C_{5π/3}',
      placeholder: 'Ej: C_{a} ∪ C_{b} ∪ C_{c} ∪ C_{d}',
      diagContext: { target: 'trig_equation', poleValues: [0, Math.PI] },
      hints: [
        'Reescribí cosec x = 1/sen x y cotg x = cos x/sen x (con sen x ≠ 0) y multiplicá ambos miembros por sen x.',
        'Queda 2(1 − sen² x) = cos x ⇒ 2cos² x − cos x = 0 ⇒ cos x·(2cos x − 1) = 0.',
        'Uní las clases para cos x = 0 y cos x = 1/2 en [0; 2π), verificando que en todas sen x ≠ 0.',
      ],
      solution: 'cos x = 0 (π/2; 3π/2) o cos x = 1/2 (π/3; 5π/3) ⇒ S = C_{π/3} ∪ C_{π/2} ∪ C_{3π/2} ∪ C_{5π/3}.',
    },
  ],

  'sec-7': [
    {
      id: 'trigf-sec7-q1',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'six_functions_domain_image_period',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['accepted_sin_cos_outside_unit_interval', 'assumed_identical_domain_for_all_six_trig'],
      kind: 'choice',
      prompt: 'Evaluá: «Existe algún x ∈ ℝ tal que sen(x) = 7/2» y «Existe al menos un x ∈ ℝ tal que tg(x) = −8». ¿Cuál es verdadera y cuál falsa?',
      options: [
        {
          label: 'La primera es FALSA (Im(sen) = [−1; 1] y 7/2 = 3,5 > 1) y la segunda es VERDADERA (Im(tg) = ℝ).',
          correct: true,
        },
        {
          label: 'Ambas son falsas porque ninguna función trigonométrica supera 1 en valor absoluto.',
          correct: false,
          diagnosticId: 'assumed_identical_domain_for_all_six_trig',
        },
        {
          label: 'La primera es verdadera y la segunda es falsa.',
          correct: false,
          diagnosticId: 'accepted_sin_cos_outside_unit_interval',
        },
      ],
      hints: [
        'Compará las imágenes: Im(sen) = [−1; 1] está acotada, mientras Im(tg) = ℝ no tiene cota superior ni inferior.',
        'Como 7/2 = 3,5 > 1, jamás existe sen(x) = 7/2; en cambio tg(x) toma cualquier valor real, incluido −8.',
        'Elegí la opción que clasifica correctamente ambas proposiciones.',
      ],
      solution: '∃x: sen x = 7/2 es Falsa (7/2 > 1); ∃x: tg x = −8 es Verdadera (Im(tg) = ℝ).',
    },
    {
      id: 'trigf-sec7-q2',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'bijectivity_domain_restriction',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['missed_second_quadrant_solution_branch'],
      kind: 'interval',
      prompt: 'Indicá el conjunto { x ∈ [0; 2π) / cos x > 0 } (usando unión de intervalos en notación Exactas):',
      expected: '[0; π/2) ∪ (3π/2; 2π)',
      placeholder: 'Ej: [a; b) ∪ (c; d)',
      diagContext: { target: 'bijectivity' },
      hints: [
        'En [0; 2π), el coseno es positivo en el I cuadrante [0; π/2) y también en el IV cuadrante (3π/2; 2π).',
        'En x = 0, cos(0) = 1 > 0 (corchete cerrado); en π/2 y 3π/2 vale 0 (paréntesis abiertos); 2π no entra por [0; 2π).',
        'Escribí la unión de los dos tramos separados por ∪.',
      ],
      solution: 'cos x > 0 en [0; π/2) ∪ (3π/2; 2π).',
    },
    {
      id: 'trigf-sec7-q3',
      competencyId: 'trig_functions.six_functions_domains_graphs_and_bijectivity',
      prerequisiteIds: ['trig_functions.congruence_classes_and_cartesian_def'],
      family: 'bijectivity_domain_restriction',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['assumed_identical_domain_for_all_six_trig'],
      kind: 'choice',
      prompt: 'Sin restringir el dominio, si tomamos f: Dom(f) → ℝ, ¿por qué f(x) = cotg x es suryectiva sobre ℝ mientras f(x) = cosec x NO lo es?',
      options: [
        {
          label: 'Porque Im(cotg) = ℝ (cubre todo el codominio ℝ), mientras Im(cosec) = (−∞; −1] ∪ [1; +∞) deja sin cubrir (−1; 1).',
          correct: true,
        },
        {
          label: 'Porque cotg x es inyectiva en todo su dominio y cosec x no.',
          correct: false,
          diagnosticId: 'assumed_identical_domain_for_all_six_trig',
        },
        {
          label: 'Porque cotg x tiene dominio ℝ y cosec x tiene polos.',
          correct: false,
          diagnosticId: 'assumed_identical_domain_for_all_six_trig',
        },
      ],
      hints: [
        'Recordá qué significa suryectiva: la imagen de la función debe coincidir exactamente con el codominio ℝ.',
        'Ninguna función trigonométrica periódica es inyectiva en todo su dominio, así que eso no las distingue.',
        'Elegí la opción que compara directamente sus imágenes respecto del codominio ℝ.',
      ],
      solution: 'Im(cotg) = ℝ (suryectiva sobre ℝ, aunque no inyectiva); Im(cosec) ≠ ℝ (ni inyectiva ni suryectiva).',
    },
  ],
};

const WIDGETS = [
  ['explorador-congruencia', './widgets/explorador-congruencia.js', 'initExploradorCongruencia'],
  ['circulo-trigonometrico', './widgets/circulo-trigonometrico.js', 'initCirculoTrigonometrico'],
  ['sincronizador-graficas', './widgets/sincronizador-graficas.js', 'initSincronizadorGraficas'],
  ['detector-cuadrantes', './widgets/detector-cuadrantes.js', 'initDetectorCuadrantes'],
  ['soluciones-periodicas', './widgets/soluciones-periodicas.js', 'initSolucionesPeriodicas'],
  ['analizador-dominio-imagen', './widgets/analizador-dominio-imagen.js', 'initAnalizadorDominioImagen'],
];

const activeWidgets = new Map();

function initFadingExamples() {
  qsa('.trigf-worked-fading').forEach((box) => {
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

export function initBlackboardController() {
  const page = document.querySelector('.trigf-page');
  const sidebar = document.querySelector('.seq-sidebar');
  const content = document.querySelector('.seq-content');
  if (!page || !sidebar || !content) return;

  const isNarrow = () => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  let savedSidebar = false;
  try {
    savedSidebar = localStorage.getItem('trigf:sidebarCollapsed') === '1';
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
        localStorage.setItem('trigf:sidebarCollapsed', collapsed ? '1' : '0');
      } catch {}
    }
  };

  sidebarToggle.addEventListener('click', () =>
    setSidebar(!page.classList.contains('is-sidebar-collapsed'))
  );

  const badge = h('span', { class: 'seq-blackboard-toolbar__badge' }, 'Pizarrón 1 de 7');
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
    qsa('.seq-section, #sec-retos, #sec-repaso').forEach((sec) =>
      sec.classList.toggle('is-active', sec.id === id)
    );
    qsa('.seq-sidebar__link').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.sec === id)
    );
    const activeSection = document.getElementById(id);
    if (activeSection) {
      activeSection.querySelectorAll('svg').forEach((svg) => svg.getBoundingClientRect());
    }
    const index = LESSON_SECTIONS.findIndex((sec) => sec.id === id);
    if (index >= 0) {
      badge.textContent = `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length}`;
      title.textContent = `${LESSON_SECTIONS[index].chapter} · ${LESSON_SECTIONS[index].title}`;
    } else if (id === 'sec-retos') {
      badge.textContent = 'Entrenamiento';
      title.textContent = 'Entrenador PRNG y las 5 Trampas Clásicas de Examen';
    } else if (id === 'sec-repaso') {
      badge.textContent = 'Síntesis';
      title.textContent = 'Hoja de Repaso Imprimible · Funciones Trigonométricas';
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
    const validIds = [...LESSON_SECTIONS.map((sec) => sec.id), 'sec-retos', 'sec-repaso'];
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

  // 1. Montar los 6 widgets SVG
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

  // 2. Montar fórmulas anotadas interactivas y matriz comparativa de las 6 funciones
  qsa('[data-trigf-formula]').forEach((host) => {
    const kind = host.getAttribute('data-trigf-formula') || 'cartesian';
    host.replaceChildren(annotatedTrigFormula(kind));
  });
  qsa('[data-trigf-matrix]').forEach((host) => {
    host.replaceChildren(sixFunctionsComparisonTable());
  });

  // 3. Montar los 7 bloques de chequeo (21 preguntas)
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
  const retosHost = document.getElementById('trigf-challenges');
  if (retosHost) mountTrigFunctionsRetos(retosHost);

  // 5. Panel de Competencias en #sec-repaso
  const dashboardHost = document.getElementById('trigf-competency-dashboard');
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
        const familySelect = document.querySelector('.trigf-family-select');
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
  mountTrigFunctionsRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateTrigFunctionsChallenge,
  generateTrigFunctionsChallenges,
  selectAdaptiveTrigFunctionsFamily,
  TRAPS,
  mulberry32,
  TRIG_FUNCTIONS_COMPETENCIES,
  FUNCIONES_TRIG_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
