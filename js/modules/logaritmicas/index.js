/**
 * @file js/modules/logaritmicas/index.js
 * Orquestador principal de Unidad 09: Funciones y Ecuaciones Logarítmicas (`logaritmicas.html`).
 * 6 pizarrones temáticos + Entrenador PRNG/Trampas (#sec-retos) + Mapa de Competencias y Repaso (#sec-repaso).
 * Cero eval(), cero emojis Unicode, cero fugas en Hint 3.
 */

import { h, qsa, chalkIcon } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { initGlossary } from '../../core/glossary.js';
import {
  parseNumberOrFraction,
  parseIntervalExactas,
  equivalentLog,
} from './expr.js';
import { approxEq } from './logic.js';
import {
  annotatedLogFormula,
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
  LOG_COMPETENCIES,
  LOGARITHMS_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
} from './competencies-map.js';
import {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from './vn-scripts.js';
import {
  mountLogRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateLogChallenge,
  generateLogChallenges,
  selectAdaptiveLogFamily,
  TRAPS,
  mulberry32,
} from './retos.js';

function checkNum(raw, expected, tol = 1e-3) {
  try {
    const val = parseNumberOrFraction(String(raw ?? '').trim());
    return Number.isFinite(val) && Math.abs(val - expected) <= tol;
  } catch {
    return false;
  }
}

function checkInterval(raw, expectedStr) {
  try {
    const ivU = parseIntervalExactas(String(raw ?? '').trim());
    const ivE = parseIntervalExactas(expectedStr);
    const endpointMatch = (a, b) =>
      a === b || (Number.isNaN(a) && Number.isNaN(b)) || approxEq(a, b, 1e-4);
    if (
      !ivU ||
      !ivE ||
      ivU.isEmpty !== ivE.isEmpty ||
      ivU.isAllReal !== ivE.isAllReal ||
      ivU.loOpen !== ivE.loOpen ||
      ivU.hiOpen !== ivE.hiOpen ||
      !endpointMatch(ivU.lo, ivE.lo) ||
      !endpointMatch(ivU.hi, ivE.hi)
    ) {
      return false;
    }
    if (ivU.points && ivE.points) {
      const sU = [...ivU.points].sort((a, b) => a - b);
      const sE = [...ivE.points].sort((a, b) => a - b);
      return sU.length === sE.length && sU.every((v, i) => approxEq(v, sE[i], 1e-4));
    }
    return !ivU.points && !ivE.points;
  } catch {
    return false;
  }
}

export const LESSON_SECTIONS = [
  {
    id: 'sec-1',
    chapter: 'Capítulo 1 · Fundamentos',
    title: 'Definición, existencia en ℝ y bases especiales (log, ln)',
    short: '1 · Definición y Bases',
  },
  {
    id: 'sec-2',
    chapter: 'Capítulo 1 · Fundamentos',
    title: 'Las 5 propiedades operativas y cambio de base',
    short: '2 · Propiedades',
  },
  {
    id: 'sec-3',
    chapter: 'Capítulo 2 · Ecuaciones',
    title: 'Ecuaciones logarítmicas, exponenciales no comunes y sistemas 2×2',
    short: '3 · Ecuaciones y Sistemas',
  },
  {
    id: 'sec-4',
    chapter: 'Capítulo 3 · Función Logarítmica',
    title: 'Inversa de la exponencial y reflexión respecto de y = x',
    short: '4 · Espejo e Inversa',
  },
  {
    id: 'sec-5',
    chapter: 'Capítulo 3 · Función Logarítmica',
    title: 'Radiografía funcional, desplazamientos y cortes',
    short: '5 · Radiografía Log',
  },
  {
    id: 'sec-6',
    chapter: 'Capítulo 4 · Aplicaciones',
    title: 'Modelos reales de tiempo y escalas logarítmicas (Richter)',
    short: '6 · Modelos y Escalas',
  },
];

export const CHECKS_DATA = {
  'sec-1': [
    {
      id: 'log-sec1-q1',
      competencyId: 'logarithms.definition_existence_and_special_bases',
      prerequisiteIds: [],
      family: 'definicion_y_existencia',
      representation: 'symbolic',
      difficulty: 1,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['confused_exp_log_conversion'],
      type: 'number',
      prompt: 'Calculá aplicando la definición de logaritmo: `log₃(1/27)`',
      expected: -3,
      placeholder: 'Ej: -2',
      spec: { target: 'definition', base: 3, expected: -3 },
      checkCorrect: (val) => checkNum(val, -3),
      hints: [
        'Traducí el logaritmo a la pregunta exponencial: ¿a qué exponente y hay que elevar 3 para obtener 1/27?',
        'Recordá que 27 = 3³ y que un exponente negativo invierte la base: 1/3³ = 3⁻³.',
        'Igualá los exponentes en base 3 para responder el valor entero negativo correspondiente.',
      ],
      solution: [
        'Por definición: log₃(1/27) = y ⇔ 3ʸ = 1/27.',
        'Como 1/27 = 1/3³ = 3⁻³, igualamos exponentes.',
        'Por lo tanto, log₃(1/27) = −3.',
      ],
    },
    {
      id: 'log-sec1-q2',
      competencyId: 'logarithms.definition_existence_and_special_bases',
      prerequisiteIds: [],
      family: 'conversion_exp_log',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_exp_log_conversion'],
      type: 'number',
      prompt: 'Si `log₇(x) = 4`, convertí a forma exponencial y hallá el valor de `x`:',
      expected: 2401,
      placeholder: 'Ej: 343',
      spec: { problemType: 'conversion', base: 7, exponent: 4, swappedExpected: 16384, expected: 2401 },
      checkCorrect: (val) => checkNum(val, 2401),
      hints: [
        'Identificá cada pieza en log_a(x) = y: la base es 7, el exponente es 4 y la incógnita x es el argumento.',
        'Usá la equivalencia fundamental: log₇(x) = 4 ⇔ 7⁴ = x (no intercambies base con exponente).',
        'Calculá 7 · 7 · 7 · 7 multiplicando paso a paso (49 · 49).',
      ],
      solution: [
        'Aplicamos la definición log_a(x) = y ⇔ aʸ = x.',
        'Obtenemos x = 7⁴ = 49 · 49 = 2401.',
      ],
    },
    {
      id: 'log-sec1-q3',
      competencyId: 'logarithms.definition_existence_and_special_bases',
      prerequisiteIds: [],
      family: 'definicion_y_existencia',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['non_positive_argument_accepted', 'invalid_log_base_accepted'],
      type: 'choice',
      prompt: '¿Qué ocurre al intentar evaluar `log₃(0)` y `log₁(5)` en el conjunto de los números reales ℝ?',
      options: [
        'Ninguno existe en ℝ: el argumento debe cumplir x > 0 y la base a ≠ 1',
        'log₃(0) = 0 y log₁(5) = 5 porque 0 y 1 son neutros',
        'log₃(0) no existe en ℝ, pero log₁(5) = 1 porque 1 elevado a algo da 1',
      ],
      expected: 0,
      diagnosis: 'invalid_log_base_accepted',
      diagnosisMessage:
        '¡Atención en la aduana de definición! En ℝ se exige simultáneamente argumento x > 0 (nunca 0 ni negativo) y base a > 0 con a ≠ 1.',
      hints: [
        'Revisá las dos restricciones simultáneas de log_a(x): x ∈ ℝ⁺ y a ∈ ℝ⁺ − {1}.',
        'Ninguna potencia 3ʸ da 0, y para base 1 la expresión 1ʸ siempre vale 1, jamás 5.',
        'Elegí la afirmación que respeta tanto la restricción del argumento como la de la base.',
      ],
      solution: [
        'En log₃(0), la ecuación 3ʸ = 0 no tiene solución real porque 3ʸ > 0 siempre.',
        'En log₁(5), la ecuación 1ʸ = 5 es imposible porque 1ʸ = 1 para todo y ∈ ℝ.',
        'Ambos están fuera del dominio permitido en ℝ.',
      ],
    },
  ],

  'sec-2': [
    {
      id: 'log-sec2-q1',
      competencyId: 'logarithms.operative_properties_and_change_of_base',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'propiedades_unificacion',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['false_sum_identity_log_a_plus_b'],
      type: 'number',
      prompt: 'Para `a > 0, a ≠ 1`, si `2·log_a(4) + (1/2)·log_a(25) − (2/3)·log_a(8) = log_a(K)`, ¿cuánto vale `K`?',
      expected: 20,
      placeholder: 'Ej: 12',
      spec: { target: 'properties', expected: 20 },
      checkCorrect: (val) => checkNum(val, 20),
      hints: [
        'Subí primero cada coeficiente multiplicativo como exponente de su argumento: 4², 25^(1/2) y 8^(2/3).',
        'Evaluá cada potencia: 4² = 16, √25 = 5 y (∛8)² = 2² = 4.',
        'Combiná los tres términos en un único logaritmo multiplicando los dos primeros argumentos y dividiendo por el tercero.',
      ],
      solution: [
        'Aplicamos log_a(xⁿ) = n·log_a(x): log_a(4²) + log_a(25^(1/2)) − log_a(8^(2/3)).',
        'Simplificamos cada argumento: log_a(16) + log_a(5) − log_a(4).',
        'Por propiedades del producto y cociente: log_a((16 · 5) / 4) = log_a(20) ⇒ K = 20.',
      ],
    },
    {
      id: 'log-sec2-q2',
      competencyId: 'logarithms.operative_properties_and_change_of_base',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'propiedades_unificacion',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['false_quotient_or_product_of_logs'],
      type: 'choice',
      prompt: 'En un examen, un estudiante simplificó `log_a(√8) · log_a(4)` escribiendo `log_a(√8 · 4)`. ¿Es válido ese paso?',
      options: [
        'Falso: el producto de dos logaritmos NO equivale al logaritmo del producto',
        'Verdadero: multiplicar logaritmos equivale a multiplicar sus argumentos',
        'Verdadero, pero solo cuando a = 2',
      ],
      expected: 0,
      diagnosis: 'false_quotient_or_product_of_logs',
      diagnosisMessage:
        '¡Trampa clásica de parcial! Ninguna propiedad une un producto entre dos logaritmos sueltos: log₂(8)·log₂(4) = 3·2 = 6, mientras que log₂(32) = 5.',
      hints: [
        'Probá la afirmación con un contraejemplo numérico en base a = 2, tomando x = 8 e y = 4.',
        'Calculá log₂(8) · log₂(4) = 3 · 2 = 6 y comparalo con log₂(8 · 4) = log₂(32) = 5.',
        'Identificá la opción que rechaza fusionar productos externos de logaritmos.',
      ],
      solution: [
        'La propiedad del producto opera sobre suma de logaritmos: log_a(x) + log_a(y) = log_a(x · y).',
        'Con a = 2, x = 8, y = 4: log₂(8)·log₂(4) = 6 ≠ log₂(32) = 5.',
        'Por lo tanto la simplificación es falsa.',
      ],
    },
    {
      id: 'log-sec2-q3',
      competencyId: 'logarithms.operative_properties_and_change_of_base',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'cambio_de_base_exacto',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['inverted_change_of_base'],
      type: 'text',
      prompt: 'Con `b > 0, b ≠ 1`, si `log_(√b)(2) − log_b(27)/3 = log_b(K)`, escribí el valor exacto de `K` como fracción irreducible:',
      expected: '4/3',
      placeholder: 'Ej: 5/2',
      spec: { problemType: 'change_of_base', expected: 4 / 3 },
      checkCorrect: (val) => checkNum(val, 4 / 3, 1e-4),
      hints: [
        'Aplicá cambio de base a base b en el primer término: log_(√b)(2) = log_b(2) / log_b(b^(1/2)).',
        'Como log_b(b^(1/2)) = 1/2, ese primer término vale 2·log_b(2) = log_b(2²); y el segundo es log_b(∛27) = log_b(3).',
        'Unificá la resta log_b(4) − log_b(3) mediante la propiedad del cociente para obtener la razón fraccionaria K.',
      ],
      solution: [
        'Por cambio de base: log_(√b)(2) = log_b(2) / (1/2) = 2·log_b(2) = log_b(4).',
        'En el segundo término: (1/3)·log_b(27) = log_b(27^(1/3)) = log_b(3).',
        'Restamos usando propiedad del cociente: log_b(4) − log_b(3) = log_b(4/3) ⇒ K = 4/3.',
      ],
    },
  ],

  'sec-3': [
    {
      id: 'log-sec3-q1',
      competencyId: 'logarithms.equations_and_systems',
      prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
      family: 'ecuacion_log_con_filtro',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['accepted_extraneous_root_in_log_eq', 'non_positive_argument_accepted'],
      type: 'text',
      prompt: 'Resolvé en ℝ y escribí el conjunto solución `{ ... }`: `log₂(x + 1) + log₂(x − 2) = log₂(4)`',
      expected: '{3}',
      placeholder: 'Ej: {5}',
      spec: {
        target: 'equation_log',
        expected: '{3}',
        solutionSet: '{3}',
        rejectedRoots: [{ x: -2 }],
      },
      checkCorrect: (val) => checkInterval(val, '{3}'),
      hints: [
        'Establecé la condición de existencia previa: x + 1 > 0 y x − 2 > 0, es decir, x > 2.',
        'Unificando el producto e igualando argumentos resulta (x + 1)(x − 2) = 4 ⇒ x² − x − 6 = 0, cuyas raíces son 3 y −2.',
        'Aplicá el filtro x > 2 sobre las dos candidatas y anotá entre llaves solo la que conserva positivos ambos argumentos.',
      ],
      solution: [
        'Existencia: x + 1 > 0 ∧ x − 2 > 0 ⇒ x > 2.',
        'Unificamos: log₂((x + 1)(x − 2)) = log₂(4) ⇒ x² − x − 6 = 0 ⇒ x₁ = 3, x₂ = −2.',
        'Descartamos x = −2 por anular/negativizar argumentos: S = { 3 }.',
      ],
    },
    {
      id: 'log-sec3-q2',
      competencyId: 'logarithms.equations_and_systems',
      prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
      family: 'ecuacion_log_con_filtro',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['accepted_extraneous_root_in_log_eq'],
      type: 'text',
      prompt: 'Resolvé en ℝ usando sustitución `u = log₃(x − 1)` (notación `{ x₁; x₂ }`): `(log₃(x − 1))² + log₃(x − 1) = 6`',
      expected: '{28/27; 10}',
      placeholder: 'Ej: {10/9; 4}',
      spec: {
        target: 'equation_quad_sub_log',
        expected: '{28/27; 10}',
        solutionSet: '{28/27; 10}',
        rejectedRoots: [],
      },
      checkCorrect: (val) => checkInterval(val, '{28/27; 10}'),
      hints: [
        'Con x > 1, sustituí u = log₃(x − 1) para obtener u² + u − 6 = 0, cuyas raíces auxiliares son u₁ = 2 y u₂ = −3.',
        '¡Contraste clave! Como Im(log₃) = ℝ, u = −3 SÍ es válida (a diferencia de u = eˣ > 0): despejá x − 1 = 3² y x − 1 = 3⁻³.',
        'Calculá las dos raíces finales (una entera y una fracción con denominador 27) y separalas con punto y coma dentro de llaves.',
      ],
      solution: [
        'Existencia: x − 1 > 0 ⇒ x > 1.',
        'Sustitución u = log₃(x − 1) ∈ ℝ: u² + u − 6 = 0 ⇒ u = 2 o u = −3 (ambas válidas).',
        'Para u = 2: x = 3² + 1 = 10. Para u = −3: x = 3⁻³ + 1 = 1/27 + 1 = 28/27.',
        'Ambas cumplen x > 1 ⇒ S = { 28/27; 10 }.',
      ],
    },
    {
      id: 'log-sec3-q3',
      competencyId: 'logarithms.equations_and_systems',
      prerequisiteIds: ['logarithms.operative_properties_and_change_of_base'],
      family: 'sistema_logaritmico',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['non_positive_argument_accepted'],
      type: 'pair',
      prompt: 'Resolvé el sistema `2·log(x) + log(y) = 0  ∧  log(x) − log(y) = −3` e ingresá el par `(x; y)`:',
      expected: [0.1, 100],
      firstLabel: 'x',
      secondLabel: 'y',
      diagnosis: null,
      diagnosisMessage: 'Revisá u = log(x) = −1 ⇒ x = 10⁻¹ y v = log(y) = 2 ⇒ y = 10².',
      hints: [
        'Exigí x > 0 ∧ y > 0 y sustituí u = log(x), v = log(y) para armar el sistema lineal 2u + v = 0, u − v = −3.',
        'Sumando ambas ecuaciones cancelás v: 3u = −3 ⇒ u = −1, y luego v = 2.',
        'Volvé a x = 10^u e y = 10^v recordando que la base implícita de log es 10.',
      ],
      solution: [
        'Sustitución u = log(x), v = log(y): 2u + v = 0 y u − v = −3.',
        'Sumando: 3u = −3 ⇒ u = −1; luego v = u + 3 = 2.',
        'Despejando en base 10: x = 10⁻¹ = 1/10 (0,1) e y = 10² = 100.',
      ],
    },
  ],

  'sec-4': [
    {
      id: 'log-sec4-q1',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'inversa_explicita_exp_log',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'exploration',
      transferDistance: 'near',
      diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
      type: 'text',
      prompt: 'Dada `f(x) = 2·eˣ − 3`, ¿cuál es el dominio máximo de su inversa `Dom(f⁻¹)` en notación de Exactas?',
      expected: '(-3; +inf)',
      placeholder: 'Ej: (-1; +inf)',
      spec: { type: 'domain', target: 'domain', asymptoteX: -3, expected: '(-3; +inf)' },
      checkCorrect: (val) => checkInterval(val, '(-3; +inf)'),
      hints: [
        'El dominio de la función inversa f⁻¹ coincide con el conjunto imagen de la exponencial directa f.',
        'Como 2·eˣ > 0 para todo x ∈ ℝ, entonces 2·eˣ − 3 > −3 siempre (la asíntota horizontal es y = −3).',
        'Escribí el intervalo abierto hacia la derecha desde la asíntota usando paréntesis redondo y punto y coma.',
      ],
      solution: [
        'La exponencial f(x) = 2eˣ − 3 tiene A.H. y = −3 e imagen abierta Im(f) = (−3; +∞).',
        'Al reflejar respecto de y = x, Dom(f⁻¹) = Im(f) = (−3; +∞).',
      ],
    },
    {
      id: 'log-sec4-q2',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'inversa_explicita_exp_log',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['confused_exp_log_conversion'],
      type: 'text',
      prompt: 'Hallá la fórmula explícita `f⁻¹(x)` para la inversa de `f(x) = 2·eˣ − 3`:',
      expected: 'ln((x + 3) / 2)',
      placeholder: 'Ej: ln((x + 1)/2)',
      spec: { target: 'inverse_formula', expected: 'ln((x + 3) / 2)' },
      checkCorrect: (val) => {
        try {
          return equivalentLog(String(val), 'ln((x + 3) / 2)');
        } catch {
          return false;
        }
      },
      hints: [
        'Partí de y = 2·eˣ − 3 y aislá completamente eˣ sumando 3 y dividiendo por 2 antes de aplicar ln.',
        'Obtenés eˣ = (y + 3) / 2; recién ahora aplicás logaritmo natural en ambos miembros.',
        'Intercambiá las variables para expresar la función inversa logarítmica dependiendo de x.',
      ],
      solution: [
        'Despejamos x de y = 2eˣ − 3: y + 3 = 2eˣ ⇒ (y + 3)/2 = eˣ.',
        'Aplicamos logaritmo natural: x = ln((y + 3)/2).',
        'Escribimos la inversa: f⁻¹(x) = ln((x + 3)/2) para x ∈ (−3; +∞).',
      ],
    },
    {
      id: 'log-sec4-q3',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'inversa_explicita_exp_log',
      representation: 'graphical',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
      type: 'choice',
      prompt: 'Si una curva exponencial `f` pasa por `(0; 1)` y tiene asíntota horizontal `y = −1`, ¿qué elementos caracterizan a su inversa `f⁻¹` por simetría respecto de `y = x`?',
      options: [
        'Pasa por (1; 0) y tiene asíntota vertical x = −1',
        'Pasa por (0; −1) y conserva la asíntota horizontal y = −1',
        'Pasa por (1; 0) y tiene asíntota horizontal y = 1',
      ],
      expected: 0,
      diagnosis: 'closed_bracket_or_horizontal_asymptote_confusion',
      diagnosisMessage:
        'La reflexión sobre la diagonal y = x permuta las coordenadas (a; b) ↔ (b; a) y transforma toda recta horizontal y = c en una recta vertical x = c.',
      hints: [
        'En la reflexión respecto de y = x, las coordenadas x e y cambian de lugar en cada punto.',
        'El punto (0; 1) se refleja en (1; 0), y la recta horizontal y = −1 pasa a depender de x.',
        'Elegí la opción que intercambia tanto las coordenadas del punto como la variable de la asíntota.',
      ],
      solution: [
        'Intercambio de coordenadas: (0; 1) ∈ f ⇒ (1; 0) ∈ f⁻¹.',
        'Intercambio de ejes en la asíntota: A.H. y = −1 ⇒ A.V. x = −1.',
      ],
    },
  ],

  'sec-5': [
    {
      id: 'log-sec5-q1',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'radiografia_log_completa',
      representation: 'symbolic',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
      type: 'text',
      prompt: 'Determiná el dominio maximal `Dom(f)` de `f(x) = log₂(4 − x)` en notación de Exactas:',
      expected: '(-inf; 4)',
      placeholder: 'Ej: (-inf; 2)',
      spec: { type: 'domain', target: 'domain', asymptoteX: 4, expected: '(-inf; 4)' },
      checkCorrect: (val) => checkInterval(val, '(-inf; 4)'),
      hints: [
        'Exigí que el argumento completo sea estrictamente mayor que cero: 4 − x > 0.',
        'Despejá x con cuidado: 4 > x significa que x está estrictamente a la izquierda de 4.',
        'Escribí el intervalo abierto desde menos infinito hasta la asíntota vertical, separado con punto y coma.',
      ],
      solution: [
        'Planteamos la condición de argumento positivo: 4 − x > 0 ⇒ x < 4.',
        'Como x = 4 es asíntota vertical, queda excluido: Dom(f) = (−∞; 4).',
      ],
    },
    {
      id: 'log-sec5-q2',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'radiografia_log_completa',
      representation: 'graphical',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'near',
      diagnosticIds: ['closed_bracket_or_horizontal_asymptote_confusion'],
      type: 'choice',
      prompt: 'Para `f(x) = log_(1/2)(x + 1)`, ¿cuál es su monotonía, raíz `C₀` y conjunto de positividad `C⁺`?',
      options: [
        'Decreciente en (−1; +∞), raíz C₀ = { 0 } y C⁺ = (−1; 0)',
        'Creciente en (−1; +∞), raíz C₀ = { 0 } y C⁺ = (0; +∞)',
        'Decreciente en [−1; +∞), raíz C₀ = { 1 } y C⁺ = (−1; 1)',
      ],
      expected: 0,
      diagnosis: 'closed_bracket_or_horizontal_asymptote_confusion',
      diagnosisMessage:
        'Al tener base 0 < 1/2 < 1 y m = +1 > 0, la función es decreciente: corta en x = 0 y es positiva a la izquierda de la raíz dentro de su dominio (−1; 0).',
      hints: [
        'Como la base es 1/2 ∈ (0; 1), al aumentar el argumento (x + 1) el logaritmo disminuye.',
        'La raíz se obtiene haciendo x + 1 = (1/2)⁰ = 1 ⇒ x = 0.',
        'Si es decreciente y corta al eje X en 0, toma valores positivos entre la asíntota x = −1 y la raíz x = 0.',
      ],
      solution: [
        'Dominio: x + 1 > 0 ⇒ Dom(f) = (−1; +∞).',
        'Base 1/2 < 1 ⇒ estrictamente decreciente. Raíz: log_(1/2)(x + 1) = 0 ⇒ x = 0.',
        'Por decrecimiento, C⁺ = (−1; 0) y C⁻ = (0; +∞).',
      ],
    },
    {
      id: 'log-sec5-q3',
      competencyId: 'logarithms.function_inverse_and_analysis',
      prerequisiteIds: ['logarithms.definition_existence_and_special_bases'],
      family: 'radiografia_log_completa',
      representation: 'symbolic',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: ['accepted_extraneous_root_in_log_eq'],
      type: 'pair',
      prompt: 'Calculá las coordenadas del punto de intersección `(x; y)` entre `f(x) = log₂(4x + 8)` y `g(x) = 3 + log₂(x − 2)`:',
      expected: [6, 5],
      firstLabel: 'x',
      secondLabel: 'y',
      diagnosis: null,
      diagnosisMessage: 'Revisá 3 = log₂(8): al igualar 4x + 8 = 8(x − 2) despejás x, y luego evaluás y = f(x).',
      hints: [
        'El dominio común exige 4x + 8 > 0 y x − 2 > 0, es decir, x > 2.',
        'Escribí 3 = log₂(8) y unificá el segundo miembro: log₂(4x + 8) = log₂(8(x − 2)).',
        'Igualá argumentos para despejar x y reemplazá ese valor en f(x) para obtener la segunda coordenada y.',
      ],
      solution: [
        'Igualamos: log₂(4x + 8) = log₂(8) + log₂(x − 2) = log₂(8x − 16).',
        'Por inyectividad: 4x + 8 = 8x − 16 ⇒ 24 = 4x ⇒ x = 6 (> 2 válido).',
        'Evaluamos y = log₂(4·6 + 8) = log₂(32) = 5 ⇒ punto (6; 5).',
      ],
    },
  ],

  'sec-6': [
    {
      id: 'log-sec6-q1',
      competencyId: 'logarithms.real_world_time_and_scale_models',
      prerequisiteIds: ['logarithms.equations_and_systems'],
      family: 'modelo_tiempo_y_escala_richter',
      representation: 'verbal',
      difficulty: 2,
      stage: 'guided_practice',
      transferDistance: 'near',
      diagnosticIds: [],
      type: 'number',
      prompt: 'El nivel de contaminantes de un lago decrece según `y(t) = y₀ · e^(−0,231·t)` (t en años). ¿Cuántos años aproximados toma eliminar el 50% de los contaminantes?',
      expected: 3,
      placeholder: 'Ej: 4',
      spec: { target: 'model_time', expected: 3 },
      checkCorrect: (val) => checkNum(val, 3, 0.05),
      hints: [
        'Si se elimina el 50%, permanece y(t) = 0,5 · y₀; simplificá y₀ de ambos lados.',
        'Queda e^(−0,231·t) = 0,5. Aplicá logaritmo natural ln en ambos miembros.',
        'Despejá la variable t dividiendo ln(0,5) por la tasa negativa del exponente y redondeá al entero.',
      ],
      solution: [
        'Planteamos 0,5·y₀ = y₀·e^(−0,231t) ⇒ e^(−0,231t) = 0,5.',
        'Aplicamos ln: −0,231·t = ln(0,5) ≈ −0,6931 ⇒ t ≈ 0,6931 / 0,231 ≈ 3 años.',
      ],
    },
    {
      id: 'log-sec6-q2',
      competencyId: 'logarithms.real_world_time_and_scale_models',
      prerequisiteIds: ['logarithms.equations_and_systems'],
      family: 'modelo_tiempo_y_escala_richter',
      representation: 'verbal',
      difficulty: 2,
      stage: 'retrieval',
      transferDistance: 'far',
      diagnosticIds: ['linear_ratio_confusion_in_log_scale'],
      type: 'number',
      prompt: 'En la escala de Richter `M = log(p)`, ¿cuántas veces más potente es un terremoto de `8,2` grados respecto de otro de `4,1` grados? (Redondeá al entero más cercano)',
      expected: 12589,
      placeholder: 'Ej: 10000',
      spec: { problemType: 'richter_ratio', linearTrapVal: 2, expected: 12589 },
      checkCorrect: (val) => checkNum(val, 12589.25, 10),
      hints: [
        'No apliques proporción lineal (8,2 / 4,1 = 2 es falso porque M es un exponente base 10).',
        'Restá las magnitudes: M₂ − M₁ = log(p₂) − log(p₁) = log(p₂ / p₁) = 4,1.',
        'Convertí log₁₀(p₂ / p₁) = 4,1 a forma exponencial para calcular esa potencia de 10.',
      ],
      solution: [
        'Planteamos 8,2 − 4,1 = log(p₂) − log(p₁) = log(p₂ / p₁) = 4,1.',
        'Por definición de logaritmo decimal: p₂ / p₁ = 10^(4,1) ≈ 12.589 veces más potente.',
      ],
    },
    {
      id: 'log-sec6-q3',
      competencyId: 'logarithms.real_world_time_and_scale_models',
      prerequisiteIds: ['logarithms.equations_and_systems'],
      family: 'modelo_tiempo_y_escala_richter',
      representation: 'verbal',
      difficulty: 3,
      stage: 'transfer',
      transferDistance: 'far',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Tras el primer mes, la altura (en cm) de un árbol sigue `h(t) = 25 + 12·log_(1,5)(t)` (`t` en meses). ¿Cuántos meses aproximados deben transcurrir para que alcance `2 metros` de altura? (Redondeá al entero)',
      expected: 370,
      placeholder: 'Ej: 360',
      spec: { target: 'model_time', expected: 370 },
      checkCorrect: (val) => checkNum(val, 369.51, 1.5),
      hints: [
        'Atención a las unidades: h(t) se mide en centímetros, así que 2 metros equivalen a 200 cm.',
        'Aislá el logaritmo primero: 200 − 25 = 175 = 12·log_(1,5)(t) ⇒ log_(1,5)(t) = 175 / 12 ≈ 14,583.',
        'Convertí a forma exponencial elevando la base 1,5 al exponente fraccionario obtenido.',
      ],
      solution: [
        'Convertimos 2 m = 200 cm y planteamos 25 + 12·log_(1,5)(t) = 200.',
        'Aislamos: log_(1,5)(t) = 175 / 12 ≈ 14,5833.',
        'Despejamos t = 1,5^(175/12) ≈ 370 meses (30 años y 10 meses).',
      ],
    },
  ],
};

function initFadingExamples() {
  qsa('.log-worked-fading').forEach((box) => {
    const buttons = qsa('[data-fade-btn]', box);
    const panels = qsa('[data-fade-panel]', box);
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.fadeBtn;
        buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.fadeBtn === target));
        panels.forEach((p) => {
          p.hidden = p.dataset.fadePanel !== target;
        });
      });
    });
  });
}

function initBlackboardController() {
  const page = document.querySelector('.log-page');
  const content = document.querySelector('.seq-content');
  const sidebar = document.querySelector('.seq-sidebar');
  if (!content) return;

  const isNarrow = () => typeof window !== 'undefined' && window.innerWidth < 1280;
  let savedCollapsed = false;
  try {
    savedCollapsed = localStorage.getItem('logaritmicas:sidebar-collapsed') === '1';
  } catch {}
  const setSidebar = (collapsed, persist = true) => {
    if (!page) return;
    page.classList.toggle('is-sidebar-collapsed', collapsed);
    if (persist) {
      try {
        localStorage.setItem('logaritmicas:sidebar-collapsed', collapsed ? '1' : '0');
      } catch {}
    }
  };
  if (isNarrow() || savedCollapsed) setSidebar(true, false);

  const sidebarToggle = h(
    'button',
    {
      type: 'button',
      class: 'pr-sidebar-toggle',
      'aria-expanded': String(!page?.classList.contains('is-sidebar-collapsed')),
      on: {
        click: () => {
          const next = !page?.classList.contains('is-sidebar-collapsed');
          setSidebar(next, !isNarrow());
          sidebarToggle.setAttribute('aria-expanded', String(!next));
        },
      },
    },
    'Índice',
  );

  if (sidebar) {
    const closeBtn = h(
      'button',
      {
        type: 'button',
        class: 'pr-sidebar-close',
        'aria-label': 'Cerrar índice',
        on: { click: () => setSidebar(true, false) },
      },
      '×',
    );
    sidebar.prepend(closeBtn);
  }

  const badge = h('span', { class: 'seq-blackboard-toolbar__badge' }, 'Pizarrón 1 de 6');
  const title = h('strong', { class: 'seq-blackboard-toolbar__title' }, LESSON_SECTIONS[0].title);
  const toggle = h(
    'button',
    { type: 'button', class: 'chip is-active' },
    'Pizarrón por lección (activo)',
  );

  const toolbar = h(
    'div',
    { class: 'seq-blackboard-toolbar' },
    sidebarToggle,
    h('div', { class: 'seq-blackboard-toolbar__info' }, badge, title),
    h('div', { class: 'seq-blackboard-toolbar__actions' }, toggle),
  );
  content.prepend(toolbar);

  let current = LESSON_SECTIONS[0].id;
  let focused = true;

  const activate = (id, scroll = true) => {
    current = id;
    qsa('.seq-section, #sec-retos, #sec-repaso').forEach((s) =>
      s.classList.toggle('is-active', s.id === id),
    );
    qsa('.seq-sidebar__link').forEach((a) =>
      a.classList.toggle('is-active', a.dataset.sec === id),
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
      title.textContent = 'Hoja de Repaso Imprimible · Funciones Logarítmicas';
    }

    if (scroll && typeof window !== 'undefined') {
      const target = focused ? content : activeSection;
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  toggle.addEventListener('click', () => {
    focused = !focused;
    content.classList.toggle('mode-blackboard', focused);
    toggle.classList.toggle('is-active', focused);
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
            `← ${previous.short}`,
          )
        : h('span', { class: 'muted small' }, 'Primer pizarrón'),
      h('span', { class: 'seq-chalk-tray__info' }, `Pizarrón ${index + 1} de ${LESSON_SECTIONS.length} · ${item.chapter}`),
      next
        ? h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate(next.id) } },
            `${next.short} →`,
          )
        : h(
            'button',
            { type: 'button', class: 'btn seq-chalk-tray__btn', on: { click: () => activate('sec-retos') } },
            'Ir al Entrenador y Trampas →',
          ),
    );
    section.append(tray);
  });

  qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!focused) return;
      event.preventDefault();
      activate(link.dataset.sec);
      if (isNarrow()) {
        setSidebar(true, false);
        sidebarToggle.setAttribute('aria-expanded', 'false');
      }
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${link.dataset.sec}`);
    });
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      const isCollapsed = page?.classList.contains('is-sidebar-collapsed');
      if (isNarrow() && !isCollapsed) setSidebar(true, false);
      else if (!isNarrow() && isCollapsed && !savedCollapsed) setSidebar(false, false);
    });
    const initial = location.hash.slice(1);
    const validIds = [...LESSON_SECTIONS.map((s) => s.id), 'sec-retos', 'sec-repaso'];
    activate(validIds.includes(initial) ? initial : LESSON_SECTIONS[0].id, false);
    content.classList.add('mode-blackboard');
  }
}

const WIDGETS = [
  ['explorador-bases', './widgets/explorador-bases.js', 'initExploradorBasesWidget'],
  ['diagnostico-propiedades', './widgets/diagnostico-propiedades.js', 'initDiagnosticoPropiedadesWidget'],
  ['balanza-logaritmica', './widgets/balanza-logaritmica.js', 'initBalanzaLogaritmicaWidget'],
  ['espejo-exp-log', './widgets/espejo-exp-log.js', 'initEspejoExpLogWidget'],
  ['radiografia-log', './widgets/radiografia-log.js', 'initRadiografiaLogWidget'],
];

if (typeof document !== 'undefined') {
  renderNav();

  // 1. Montar los 5 widgets SVG
  for (const [name, modPath, fnName] of WIDGETS) {
    const hosts = document.querySelectorAll(`[data-widget="${name}"]`);
    if (hosts.length) {
      import(modPath)
        .then((mod) => {
          const fn = mod[fnName] || mod.initWidget || mod.default;
          if (typeof fn === 'function') {
            hosts.forEach((host) => {
              fn(host);
            });
          }
        })
        .catch((err) => console.warn(`[widget:${name}] error:`, err));
    }
  }

  // 2. Montar fórmulas anotadas interactivas
  qsa('[data-log-formula]').forEach((host) => {
    const sectionId = host.getAttribute('data-log-formula') || host.closest('section')?.id || 'sec-1';
    annotatedLogFormula(host, { sectionId });
  });

  // 3. Montar los 6 bloques de chequeo (18 preguntas)
  for (const [sectionId, questions] of Object.entries(CHECKS_DATA)) {
    const host = document.querySelector(`[data-check="${sectionId}"]`);
    if (host) {
      createCheckBlock(host, questions, sectionId, (doneId) => {
        markSectionCompleted(doneId);
      });
    }
  }

  // 4. Montar Entrenador PRNG + 5 Trampas
  const retosHost = document.getElementById('log-challenges');
  if (retosHost) mountLogRetos(retosHost);

  // 5. Panel de Competencias en #sec-repaso
  const dashboardHost = document.getElementById('log-competency-dashboard');
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
        const familySelect = document.querySelector('.log-family-select');
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
  mountProgress();
  initGlossary();
  initBlackboardController();
}

export {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
  mountLogRetos,
  initRetosModule,
  CHALLENGE_TYPES,
  generateLogChallenge,
  generateLogChallenges,
  selectAdaptiveLogFamily,
  TRAPS,
  mulberry32,
  LOG_COMPETENCIES,
  LOGARITHMS_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
  ERROR_TAXONOMY,
  DIAGNOSTIC_TO_TAXONOMY,
  PROGRESS_KEY,
  getProgress,
  saveProgress,
  markSectionCompleted,
  mountCompetencyDashboard,
  getCompetencyReport,
};
