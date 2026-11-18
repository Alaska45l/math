/**
 * @file js/modules/sistemas/index.js
 * Orquestador principal de Unidad 04 · Sistemas de Ecuaciones Lineales 2×2 (`sistemas.html`).
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  annotatedSystemFormula,
  systemClassificationStrip,
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
  SYS_COMPETENCIES,
  SISTEMAS_COMPETENCIES,
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
  mountSystemsRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateSystemChallenge,
  generateSystemChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
} from './retos.js';

export const LESSON_SECTIONS = [
  {
    id: 'sec-metodos-interseccion',
    chapter: 'Capítulo 1 · Resolución y Clasificación',
    title: 'Sistema Lineal 2×2: Métodos Analíticos e Intersección Gráfica',
    short: '1 · Métodos 2×2',
  },
  {
    id: 'sec-clasificacion-scd-sci-si',
    chapter: 'Capítulo 1 · Resolución y Clasificación',
    title: 'Clasificación Geométrica y Algebraica: SCD, SCI y SI',
    short: '2 · SCD / SCI / SI',
  },
  {
    id: 'sec-sistemas-parametricos',
    chapter: 'Capítulo 2 · Parámetros y Modelización',
    title: 'Sistemas con Parámetros y Exclusiones de Dominio',
    short: '3 · Parámetros',
  },
  {
    id: 'sec-modelizacion-reconstruccion',
    chapter: 'Capítulo 2 · Parámetros y Modelización',
    title: 'Reconstrucción desde Gráficas y Modelización de Problemas',
    short: '4 · Modelos y Gráficas',
  },
];

/**
 * 16 chequeos conceptuales (4 por sección, 48 pistas únicas no filtrantes)
 * con metadatos completos de 8-tupla pedagógica.
 */
export const CHECKS_DATA = {
  'sec-metodos-interseccion': [
    {
      id: 'sys-sec1-q1',
      competencyId: 'systems.linear_2x2_graphical_and_analytical',
      prerequisiteIds: [],
      family: 'solve_2x2_fractions_distribution',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['sign_error_in_elimination_or_substitution', 'forgot_to_find_second_variable'],
      kind: 'pair',
      prompt:
        'Resolvé el sistema { (6x − 3)/3 + 3y = 14 ; x − 3(2y − 1) = 3y } y escribí la solución como par ordenado (x₀; y₀):',
      expected: '(6; 1)',
      placeholder: 'Ej: (6; 1)',
      diagContext: { solution: { x: 6, y: 1 }, target: 'solve_sign' },
      hints: [
        'Primero simplificá cada ecuación: (6x − 3)/3 = 2x − 1, y en la segunda distribuí −3(2y − 1) = −6y + 3.',
        'El sistema limpio queda { 2x + 3y = 15 ; x − 9y = −3 }. Despejá x = 9y − 3 y sustituilo en la primera.',
        'Obtenés 2(9y − 3) + 3y = 15 ⇒ 21y = 21 ⇒ y₀ = 1. Calculá x₀ y anotá el par ordenado completo con ";".',
      ],
      solution:
        'Limpiando queda 2x + 3y = 15 y x − 9y = −3. Despejando resulta y₀ = 1 y x₀ = 6 ⇒ S = {(6; 1)}.',
    },
    {
      id: 'sys-sec1-q2',
      competencyId: 'systems.linear_2x2_graphical_and_analytical',
      prerequisiteIds: [],
      family: 'solve_2x2_fractions_distribution',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['sign_error_in_elimination_or_substitution', 'forgot_to_find_second_variable'],
      kind: 'pair',
      prompt:
        'Resolvé el sistema con denominadores { (3x + 9)/6 − 2y = 9/2 ; (4x − 2)/3 + y = 1 } e indicá el par solución (x₀; y₀):',
      expected: '(2; -1)',
      placeholder: 'Ej: (2; -1)',
      diagContext: { solution: { x: 2, y: -1 }, target: 'solve_sign' },
      hints: [
        'Multiplicá la primera ecuación por 6 para eliminar denominadores, y la segunda ecuación por 3.',
        'Queda { 3x − 12y = 18 ; 4x + 3y = 5 } (simplificando la primera por 3: x − 4y = 6).',
        'Sustituí x = 4y + 6 en 4x + 3y = 5 para hallar y₀, luego x₀, y escribí el par (x₀; y₀).',
      ],
      solution:
        'Al multiplicar por 6 y 3 queda x − 4y = 6 y 4x + 3y = 5, de donde y₀ = −1 y x₀ = 2 ⇒ S = {(2; −1)}.',
    },
    {
      id: 'sys-sec1-q3',
      competencyId: 'systems.linear_2x2_graphical_and_analytical',
      prerequisiteIds: [],
      family: 'solve_2x2_reduction',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['sign_error_in_elimination_or_substitution'],
      kind: 'number',
      prompt:
        'Dado el sistema { 3x + 2y = 12 ; x − 2y = 4 }, aplicá reducción por suma y resta y determiná el valor numérico de y₀:',
      expected: 0,
      placeholder: 'Ej: 0',
      diagContext: { solution: { x: 4, y: 0 } },
      hints: [
        'Como los coeficientes de y son opuestos (+2y y −2y), sumá las dos ecuaciones miembro a miembro.',
        'Al sumar obtenés 4x = 16, de donde sale x₀ = 4.',
        'Reemplazá x₀ = 4 en la segunda ecuación (4 − 2y = 4) para despejar y₀.',
      ],
      solution:
        'Sumando miembro a miembro: 4x = 16 ⇒ x₀ = 4. Luego 4 − 2y₀ = 4 ⇒ y₀ = 0.',
    },
    {
      id: 'sys-sec1-q4',
      competencyId: 'systems.linear_2x2_graphical_and_analytical',
      prerequisiteIds: [],
      family: 'graphical_meaning_of_methods',
      representation: 'graphical',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['forgot_to_find_second_variable'],
      kind: 'choice',
      prompt:
        'Al resolver un sistema 2×2 igualando las formas explícitas y₁ = y₂, ¿qué representa geométricamente el par (x₀; y₀) obtenido?',
      options: [
        {
          label: 'El único punto común que pertenece simultáneamente a la recta r₁ y a la recta r₂ en el plano.',
          correct: true,
        },
        {
          label: 'Las raíces por separado donde cada recta corta al eje X.',
          correct: false,
          diagnosticId: 'forgot_to_find_second_variable',
        },
        {
          label: 'El punto medio entre las ordenadas al origen de ambas rectas.',
          correct: false,
          diagnosticId: 'only_checked_slopes_ignored_intercepts',
        },
      ],
      hints: [
        'Cada ecuación lineal representa una recta en ℝ²; un punto está en la recta si cumple su ecuación.',
        'Igualar y₁ = y₂ exige que ambos puntos tengan la misma abscisa x₀ y la misma altura y₀ al mismo tiempo.',
        'Elegí la opción que describe la intersección simultánea de ambas rectas.',
      ],
      solution:
        'Cada punto solución satisface ambas ecuaciones a la vez, es decir, es la intersección geométrica de las rectas r₁ y r₂.',
    },
  ],

  'sec-clasificacion-scd-sci-si': [
    {
      id: 'sys-sec2-q1',
      competencyId: 'systems.classification_scd_sci_si',
      prerequisiteIds: ['systems.linear_2x2_graphical_and_analytical'],
      family: 'classify_int1_ej1c',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_sci_with_si', 'only_checked_slopes_ignored_intercepts'],
      kind: 'choice',
      prompt:
        'Clasificá el sistema { 2x + y = 3 ; 4x − 6 = −2y } según su cantidad de soluciones:',
      options: [
        {
          label: 'Compatible Indeterminado (SCI): ambas ecuaciones representan la misma recta y = −2x + 3.',
          correct: true,
        },
        {
          label: 'Incompatible (SI): las rectas son paralelas separadas y S = ∅.',
          correct: false,
          diagnosticId: 'confused_sci_with_si',
        },
        {
          label: 'Compatible Determinado (SCD): se cortan en (0; 3).',
          correct: false,
          diagnosticId: 'only_checked_slopes_ignored_intercepts',
        },
      ],
      hints: [
        'Reordená la segunda ecuación pasando −2y al primer miembro y −6 al segundo.',
        'Queda 4x + 2y = 6. Comparala con 2x + y = 3 multiplicando la primera por 2.',
        'Al ser exactamente la misma recta (identidad 0 = 0), elegí el tipo de sistema con infinitas soluciones.',
      ],
      solution:
        '4x + 2y = 6 es 2·(2x + y = 3): misma pendiente −2 y misma ordenada 3 ⇒ SCI.',
    },
    {
      id: 'sys-sec2-q2',
      competencyId: 'systems.classification_scd_sci_si',
      prerequisiteIds: ['systems.linear_2x2_graphical_and_analytical'],
      family: 'classify_ej11a',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_sci_with_si', 'only_checked_slopes_ignored_intercepts'],
      kind: 'choice',
      prompt:
        'Clasificá el sistema { 2y − 3x + 3 = 0 ; y = (3x + 1)/2 }:',
      options: [
        {
          label: 'Compatible Indeterminado (SCI) porque tienen la misma pendiente 3/2.',
          correct: false,
          diagnosticId: 'only_checked_slopes_ignored_intercepts',
        },
        {
          label: 'Incompatible (SI): paralelas no coincidentes (m₁ = m₂ = 3/2, b₁ = −3/2 ≠ b₂ = 1/2).',
          correct: true,
        },
        {
          label: 'Compatible Determinado (SCD) con solución única.',
          correct: false,
          diagnosticId: 'confused_sci_with_si',
        },
      ],
      hints: [
        'Despejá y en la primera ecuación: 2y = 3x − 3 ⇒ y = (3/2)x − 3/2.',
        'La segunda ecuación es y = (3/2)x + 1/2. Compará pendientes y ordenadas al origen.',
        'Tienen la misma pendiente 3/2 pero distinta ordenada (−3/2 ≠ 1/2): decidí si coinciden o nunca se cortan.',
      ],
      solution:
        'Igualar (3/2)x − 3/2 = (3/2)x + 1/2 da −3/2 = 1/2 (absurdo): paralelas separadas ⇒ Sistema Incompatible (SI).',
    },
    {
      id: 'sys-sec2-q3',
      competencyId: 'systems.classification_scd_sci_si',
      prerequisiteIds: ['systems.linear_2x2_graphical_and_analytical'],
      family: 'solution_set_si',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['confused_sci_with_si'],
      kind: 'solution',
      prompt:
        'Escribí el conjunto solución S del sistema { 2x − y = 1 ; −4x + 2y = 5 } (usá "vacio" o "∅" si no tiene solución, o "SCI" si tiene infinitas):',
      expected: 'vacio',
      placeholder: 'Ej: vacio o ∅',
      diagContext: { target: 'solution_set', expectedStatus: 'SI' },
      hints: [
        'Multiplicá la primera ecuación por −2 para comparar los coeficientes de x e y.',
        'Queda −4x + 2y = −2 frente a −4x + 2y = 5. Al restar se anulan ambas variables quedando 0 = 7.',
        'Un absurdo 0 = 7 implica que no existe ningún par (x; y) solución; anotá el símbolo o nombre del conjunto vacío.',
      ],
      solution:
        'Al sumar 2·(2x − y = 1) con (−4x + 2y = 5) resulta 0 = 7 (absurdo), por lo tanto S = ∅.',
    },
    {
      id: 'sys-sec2-q4',
      competencyId: 'systems.classification_scd_sci_si',
      prerequisiteIds: ['systems.linear_2x2_graphical_and_analytical'],
      family: 'interpret_0x_equals_0',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['confused_sci_with_si'],
      kind: 'choice',
      prompt:
        '¿Por qué obtener 0·x = 0 al resolver un sistema indica Compatible Indeterminado (SCI) y NO la solución única x = 0?',
      options: [
        {
          label: 'Porque cualquier número real x multiplicado por 0 da 0: no restringe x a 0, sino que deja libres todos los puntos de la recta.',
          correct: true,
        },
        {
          label: 'Porque 0/0 vale 1.',
          correct: false,
          diagnosticId: 'confused_sci_with_si',
        },
        {
          label: 'Porque significa que las rectas no se cortan.',
          correct: false,
          diagnosticId: 'confused_sci_with_si',
        },
      ],
      hints: [
        'Probá sustituir x = 1, x = −4 o x = 100 dentro de 0·x = 0.',
        'Dividir por cero está prohibido; la igualdad 0·x = 0 se cumple para todo x ∈ ℝ.',
        'Elegí la explicación que distingue identidad válida para todo real frente a ecuación con solución única.',
      ],
      solution:
        '0·x = 0 es una identidad válida para cualquier x ∈ ℝ (infinitas soluciones sobre la recta común).',
    },
  ],

  'sec-sistemas-parametricos': [
    {
      id: 'sys-sec3-q1',
      competencyId: 'systems.parametric_systems',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'parametric_ej12a',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['ignored_parametric_exclusion_domain', 'only_checked_slopes_ignored_intercepts'],
      kind: 'number',
      prompt:
        'Dado el sistema con k ∈ ℝ − {0}: { kx + y = 2 ; x + y = 1 }, determiná el valor de k para que el sistema sea Incompatible (SI):',
      expected: 1,
      placeholder: 'Ej: 1',
      diagContext: { target: 'parametric_k', excludedVal: 0 },
      hints: [
        'Igualá las pendientes de ambas rectas: m₁ = −k y m₂ = −1 (o restá ambas ecuaciones).',
        'Al restar queda (k − 1)x = 1, donde el coeficiente de x se anula cuando k − 1 = 0.',
        'Verificá que ese valor de k pertenece a ℝ − {0} y deja 0 = 1 (absurdo SI).',
      ],
      solution:
        'De (k − 1)x = 1, si k = 1 ∈ ℝ − {0} queda 0·x = 1 (absurdo), por lo que el sistema es SI.',
    },
    {
      id: 'sys-sec3-q2',
      competencyId: 'systems.parametric_systems',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'parametric_ej12b',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['only_checked_slopes_ignored_intercepts', 'confused_sci_with_si'],
      kind: 'number',
      prompt:
        'En el sistema con k ∈ ℝ − {0}: { kx + y = 7 ; (k + 2)x + ky = 14 }, hallá el único valor de k para que resulte Compatible Indeterminado (SCI):',
      expected: 2,
      placeholder: 'Ej: 2',
      diagContext: { target: 'parametric_k', excludedVal: 0, oppositeCritVal: -1 },
      hints: [
        'Igualando pendientes (k/1 = (k + 2)/k) obtenés k² − k − 2 = 0, cuyas raíces críticas son k = 2 y k = −1.',
        'Reemplazá cada candidato en el sistema: para k = −1 queda −x + y = 7 y x − y = 14 (al sumar da 0 = 21, SI).',
        'Comprobá qué ocurre al reemplazar el otro valor crítico positivo para verificar que ambas filas son proporcionales (0 = 0).',
      ],
      solution:
        'Las raíces de k² − k − 2 = 0 son k = 2 y k = −1. En k = 2 queda 2x + y = 7 y 4x + 2y = 14 (SCI).',
    },
    {
      id: 'sys-sec3-q3',
      competencyId: 'systems.parametric_systems',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'parametric_ej21h',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['ignored_parametric_exclusion_domain', 'only_checked_slopes_ignored_intercepts'],
      kind: 'number',
      prompt:
        'En el sistema con a ∈ ℝ − {1}: { (a − 1)y − 4x = 1 ; (a − 1)x − y = 1/2 }, hallá el valor de a para que resulte Compatible Indeterminado (SCI):',
      expected: -1,
      placeholder: 'Ej: -1',
      diagContext: { target: 'parametric_k', excludedVal: 1, oppositeCritVal: 3 },
      hints: [
        'Ordená ambos sistemas con x e y alineados: 4x − (a − 1)y = −1 y (a − 1)x − y = 1/2.',
        'Igualando las razones de coeficientes queda (a − 1)² = 4, de donde a − 1 = ±2 ⇒ a = 3 o a = −1.',
        'Probá a = 3 (da 4x − 2y = −1 y 2x − y = 1/2 ⇒ contradicción −1 ≠ 1) frente al otro candidato para elegir el que da SCI.',
      ],
      solution:
        'De (a − 1)² = 4 salen a = 3 (SI) y a = −1 (4x + 2y = −1 y −2x − y = 1/2, equivalentes ⇒ SCI).',
    },
    {
      id: 'sys-sec3-q4',
      competencyId: 'systems.parametric_systems',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'parametric_scd_domain_set',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'near',
      diagnosticIds: ['ignored_parametric_exclusion_domain'],
      kind: 'set',
      prompt:
        'Para el sistema de Ej. 12b ({ kx + y = 7 ; (k + 2)x + ky = 14 } con k ∈ ℝ − {0}), escribí el conjunto completo de valores de k para los cuales es SCD (notación R - {a; b; c}):',
      expected: 'R - {-1; 0; 2}',
      placeholder: 'Ej: R - {-1; 0; 2}',
      diagContext: { target: 'parametric_set', excludedVal: 0 },
      hints: [
        'El sistema es SCD siempre que las rectas no sean paralelas (k ≠ 2 y k ≠ −1) Y el parámetro esté permitido en el dominio.',
        'No te olvides de la restricción inicial del enunciado: k ∈ ℝ − {0}.',
        'Escribí ℝ excluyendo entre llaves los tres valores que no dan SCD, ordenados de menor a mayor y separados por ";".',
      ],
      solution:
        'Excluyendo los dos valores críticos de paralelismo (k = −1, k = 2) y el valor prohibido por dominio (k = 0), el sistema es SCD para k ∈ ℝ − {−1; 0; 2}.',
    },
  ],

  'sec-modelizacion-reconstruccion': [
    {
      id: 'sys-sec4-q1',
      competencyId: 'systems.modeling_and_graph_reconstruction',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'reconstruct_ej14',
      representation: 'graphical',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['forgot_to_find_second_variable', 'sign_error_in_elimination_or_substitution'],
      kind: 'pair',
      prompt:
        'En un gráfico se observan r₁ (pasa por (0; 4) y (2; 0)) y r₂ (pasa por (0; −3) y (6; 0)). Reconstruí el sistema y hallá la intersección (x₀; y₀):',
      expected: '(14/5; -8/5)',
      placeholder: 'Ej: (14/5; -8/5)',
      diagContext: { solution: { x: 14 / 5, y: -8 / 5 } },
      hints: [
        'Armá la fórmula explícita de cada recta usando sus dos puntos de paso: r₁ tiene m₁ = −2 y b₁ = 4.',
        'Para r₂ con (0; −3) y (6; 0), resulta m₂ = 1/2 y b₂ = −3: igualá −2x + 4 = (1/2)x − 3.',
        'Despejá x₀ como fracción impropia, calculá y₀ sustituyendo en r₁ y anotá el par ordenado con ";".',
      ],
      solution:
        'De −2x + 4 = (1/2)x − 3 ⇒ (5/2)x = 7 ⇒ x₀ = 14/5 y y₀ = −2(14/5) + 4 = −8/5 ⇒ S = {(14/5; −8/5)}.',
    },
    {
      id: 'sys-sec4-q2',
      competencyId: 'systems.modeling_and_graph_reconstruction',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'reconstruct_ej15_perp',
      representation: 'graphical',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['wrong_perpendicular_reconstruction', 'forgot_to_find_second_variable'],
      kind: 'pair',
      prompt:
        'La recta r₁ pasa por (0; −2) y (4; 0); la recta r₂ es perpendicular a r₁ y corta al eje Y en (0; 10). Hallá el punto de intersección (x₀; y₀):',
      expected: '(24/5; 2/5)',
      placeholder: 'Ej: (24/5; 2/5)',
      diagContext: { target: 'perp_graph', solution: { x: 24 / 5, y: 2 / 5 }, wrongPerpPoint: { x: 12 / 5, y: -4 / 5 } },
      hints: [
        'r₁ tiene pendiente m₁ = (0 − (−2))/(4 − 0) = 1/2 y ordenada −2, es decir y = (1/2)x − 2.',
        'Como r₂ ⊥ r₁, su pendiente es opuesta e inversa: m₂ = −2, con ordenada b₂ = 10 (y = −2x + 10).',
        'Igualá (1/2)x − 2 = −2x + 10 para hallar x₀ y sustituí para obtener y₀ en fracciones exactas.',
      ],
      solution:
        '(5/2)x = 12 ⇒ x₀ = 24/5; y₀ = −2(24/5) + 10 = 2/5 ⇒ S = {(24/5; 2/5)}.',
    },
    {
      id: 'sys-sec4-q3',
      competencyId: 'systems.modeling_and_graph_reconstruction',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'word_simulacro2019_discount',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['discount_instead_of_paid_percentage', 'reversed_comparison_difference'],
      kind: 'choice',
      prompt:
        'El precio de lista de una heladera (h) excede en $5.500 al de una cocina (c). Pagando en efectivo se obtiene 10% de descuento en la heladera y 5% en la cocina, abonando en total $36.400. ¿Qué sistema modela el problema?',
      options: [
        {
          label: 'h − 5500 = c  ;  0,90h + 0,95c = 36400',
          correct: true,
        },
        {
          label: 'h − 5500 = c  ;  0,10h + 0,05c = 36400',
          correct: false,
          diagnosticId: 'discount_instead_of_paid_percentage',
        },
        {
          label: 'h + 5500 = c  ;  0,90h + 0,95c = 36400',
          correct: false,
          diagnosticId: 'reversed_comparison_difference',
        },
      ],
      hints: [
        'Si h excede en 5500 a c, el precio mayor es h (por eso h − 5500 = c).',
        'Los $36.400 representan el dinero pagado en caja, no el monto ahorrado de descuento.',
        'Elegí la opción donde pagás 90% por h, 95% por c y h es mayor que c.',
      ],
      solution:
        'h − 5500 = c y 0,90h + 0,95c = 36400 (cuya solución es h = $22.500 y c = $17.000).',
    },
    {
      id: 'sys-sec4-q4',
      competencyId: 'systems.modeling_and_graph_reconstruction',
      prerequisiteIds: ['systems.classification_scd_sci_si'],
      family: 'word_global2025_reagents',
      representation: 'verbal',
      difficulty: 2,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['forgot_to_find_second_variable', 'sign_error_in_elimination_or_substitution'],
      kind: 'pair',
      prompt:
        'En un laboratorio se arman dos lotes con reactivos A y B: el lote 1 usa 2 envases de A y 4 de B sumando 120 g (2A + 4B = 120), y el lote 2 usa 5 de A y 3 de B sumando 195 g (5A + 3B = 195). Indicá el peso unitario (A; B):',
      expected: '(30; 15)',
      placeholder: 'Ej: (30; 15)',
      diagContext: { solution: { x: 30, y: 15 }, target: 'context_feasibility' },
      hints: [
        'Dividí la primera ecuación por 2 para simplificar: A + 2B = 60 ⇒ A = 60 − 2B.',
        'Sustituí A en la segunda ecuación: 5(60 − 2B) + 3B = 195 ⇒ 300 − 7B = 195.',
        'Despejá B, volvé para calcular A y escribí el par ordenado (A; B) con ";".',
      ],
      solution:
        '300 − 7B = 195 ⇒ 7B = 105 ⇒ B = 15 g y A = 60 − 30 = 30 g ⇒ (30; 15).',
    },
  ],
};

const WIDGETS = [
  ['laboratorio-intersecciones', './widgets/laboratorio-intersecciones.js', 'initLaboratorioIntersecciones'],
  ['clasificador-scd-sci-si', './widgets/clasificador-scd-sci-si.js', 'initClasificadorScdSciSi'],
  ['explorador-parametrico', './widgets/explorador-parametrico.js', 'initExploradorParametrico'],
  ['traductor-problemas', './widgets/traductor-problemas.js', 'initTraductorProblemas'],
];

const activeWidgets = new WeakMap();

function initFadingExamples() {
  qsa('.sys-worked-fading').forEach((box) => {
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
      'aria-controls': 'sys-sidebar-index',
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

  if (sidebar) sidebar.id = 'sys-sidebar-index';

  const sidebarKey = 'sistemas:sidebar:v1';
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
      title.textContent = 'Hoja de Repaso Imprimible · Sistemas de Ecuaciones';
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

  qsa('[data-sys-formula]').forEach((host) => {
    host.replaceChildren(annotatedSystemFormula());
  });
  qsa('[data-sys-strip]').forEach((host) => {
    host.replaceChildren(systemClassificationStrip());
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

  const retosHost = document.getElementById('sys-challenges');
  if (retosHost) mountSystemsRetos(retosHost);

  const dashboardHost = document.getElementById('sys-competency-dashboard');
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
        const familySelect = document.querySelector('.sys-family-select');
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
  mountSystemsRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateSystemChallenge,
  generateSystemChallenges,
  makeChallenge,
  makeChallenges,
  TRAPS,
  mulberry32,
  SYS_COMPETENCIES,
  SISTEMAS_COMPETENCIES,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
