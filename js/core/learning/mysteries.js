/**
 * @file js/core/learning/mysteries.js
 * Alaska Math Lab — Cuaderno de Misterios Abiertos (Open Mysteries Notebook)
 * Voluntary, non-blocking mathematical curiosities across Units 01–11.
 *
 * Strict Non-Mastery Invariant:
 * - saveMystery, exploreMystery, dismissMystery, closeMystery, and invalid/empty/non-evaluable
 *   submissions NEVER increment independentCount or alter competency mastery status.
 * - Only valid explicit-criteria submitMysteryAnswer calls emit `answer_submitted` events,
 *   enforcing an assistance lock if hint or formal explanation was viewed beforehand.
 *
 * ZERO imports from js/modules/*. Zero eval(). Zero Unicode emojis. Node-safe (no top-level DOM).
 * Complies with ORIGINAL_REQUEST §R6, PROJECT.md Contract 2, LEARNING_ARCHITECTURE.md §5.6, DESIGN_PHILOSOPHY.md §7.3.
 */

import { h, chalkIcon } from '../dom.js';
import { createLearningEvent } from './events.js';
import { MAX_OPEN_MYSTERIES, getProgressStore } from './progress-store.js';
import { normalizeTransferAnswer, validateTransferAnswer } from './transfer.js';

export { MAX_OPEN_MYSTERIES };

export const MYSTERY_STATUSES = Object.freeze({
  UNOPENED: 'unopened',
  OPEN: 'open',
  EXPLORED: 'explored',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
});

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const UNIT_LABELS = Object.freeze({
  1: 'U01 · Números reales',
  2: 'U02 · Funciones y sucesiones',
  3: 'U03 · Función lineal',
  4: 'U04 · Sistemas de ecuaciones',
  5: 'U05 · Función cuadrática',
  6: 'U06 · Polinomios',
  7: 'U07 · Racionales e irracionales',
  8: 'U08 · Función exponencial',
  9: 'U09 · Función logarítmica',
  10: 'U10 · Razones trigonométricas',
  11: 'U11 · Funciones trigonométricas',
});

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const val of Object.values(obj)) {
      deepFreeze(val);
    }
  }
  return obj;
}

export const OPEN_MYSTERIES = deepFreeze([
  {
    id: 'mys-u01-sqrt-x2',
    unit: 1,
    moduleId: 'potencias-raices',
    sectionId: 'sec-9',
    title: '¿Por qué √(x²) no es siempre x?',
    openProblem:
      'Si probás con x = 5 da 5, pero si probás con x = −5 da +5. ¿Dónde desapareció el signo menos al simplificar la raíz cuadrada de un cuadrado?',
    hint: 'Evaluá paso a paso primero el cuadrado interno (−5)² y recién después aplicá la raíz cuadrada principal no negativa.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Comparación numérica de x frente a √(x²)',
      rows: [
        { x: '−5', xSquared: '25', sqrtResult: '5', matchesX: false },
        { x: '0', xSquared: '0', sqrtResult: '0', matchesX: true },
        { x: '5', xSquared: '25', sqrtResult: '5', matchesX: true },
      ],
    },
    formalExplanation:
      'La raíz cuadrada principal devuelve siempre el único valor no negativo cuyo cuadrado es el radicando. Como (−5)² = 25 y √25 = 5 = −(−5), la identidad válida en todo ℝ es √(x²) = |x|.',
    competencyIds: [
      'powers.real_domain_restrictions_and_abs_root',
      'abs.distance_1d_and_equations',
    ],
    evaluation: {
      prompt: '¿Qué expresión con barras equivale exactamente a √((x − 3)²) para cualquier x real?',
      inputKind: 'text',
      criteriaLabel: 'Expresión exacta usando valor absoluto: |x − 3|',
      expected: '|x - 3|',
      acceptPatterns: ['|x-3|', '|3-x|', 'abs(x-3)', 'abs(3-x)'],
      representation: 'symbolic',
    },
  },
  {
    id: 'mys-u02-vertical-line',
    unit: 2,
    moduleId: 'funciones',
    sectionId: 'sec-1',
    title: 'Curva suave, ¿pero función?',
    openProblem:
      'Una circunferencia x² + y² = 25 es una curva perfectamente suave y simétrica. ¿Alcanza esa suavidad para que y sea función de x?',
    hint: 'Probá evaluar qué ocurre para x = 3: ¿cuántos valores posibles de y satisfacen 3² + y² = 25?',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Prueba de la recta vertical en x = 3 sobre x² + y² = 25',
      rows: [
        { x: '3', equation: '9 + y² = 25', solutionsY: 'y = 4 e y = −4', uniqueImage: false },
        { x: '5', equation: '25 + y² = 25', solutionsY: 'y = 0', uniqueImage: true },
      ],
    },
    formalExplanation:
      'La definición de función exige unicidad de imagen: a cada x del dominio le corresponde exactamente un único y. En x² + y² = 25, la recta vertical x = 3 corta a la curva en dos puntos (3; 4) y (3; −4), violando la unicidad.',
    competencyIds: ['functions.concept_and_uniqueness'],
    evaluation: {
      prompt: '¿La circunferencia completa x² + y² = 25 define a y como función de x? Respondé «si» o «no».',
      inputKind: 'text',
      criteriaLabel: 'Identificación de unicidad mediante la prueba de la recta vertical («no»)',
      expected: 'no',
      acceptPatterns: ['no', 'no es funcion'],
      representation: 'graphical',
    },
  },
  {
    id: 'mys-u02-negative-ratio-vs-diff',
    unit: 2,
    moduleId: 'sucesiones',
    sectionId: 'sec-5',
    title: 'Razón negativa vs. diferencia negativa',
    openProblem:
      '¿Por qué una sucesión geométrica con razón r = −2 alterna signos (+, −, +, −) mientras que una sucesión aritmética con diferencia d = −2 decrece siempre sin alternar?',
    hint: 'Observá qué operación se repite en cada paso: multiplicar por −2 invierte el signo cada vez, mientras sumar −2 solo resta 2 unidades fijas.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Comparación desde a₁ = 4 con paso −2 multiplicativo vs. aditivo',
      rows: [
        { n: '1', geometrica: '4', aritmetica: '4' },
        { n: '2', geometrica: '−8', aritmetica: '2' },
        { n: '3', geometrica: '16', aritmetica: '0' },
        { n: '4', geometrica: '−32', aritmetica: '−2' },
      ],
    },
    formalExplanation:
      'En una sucesión geométrica a_n = a₁ · r^(n−1), el factor (−2)^(n−1) cambia de signo según la paridad de n − 1. En cambio, en una aritmética a_n = a₁ + (n − 1)d, sumar −2 desplaza el valor de manera lineal y monótona decreciente.',
    competencyIds: [
      'sequences.pattern_recognition_and_classification',
      'sequences.geometric_explicit_and_models',
    ],
    evaluation: null,
  },
  {
    id: 'mys-u02-abs-no-solution',
    unit: 2,
    moduleId: 'valor-absoluto',
    sectionId: 'sec-1',
    title: '¿Cuándo una ecuación con módulo no tiene solución?',
    openProblem:
      'La ecuación |x − 4| = 5 tiene dos soluciones en la recta real, |x − 4| = 0 tiene una sola, y |x − 4| = k a veces queda vacía. ¿Qué condición sobre k deja el conjunto solución vacío?',
    hint: 'Pensá el valor absoluto |x − 4| como la distancia entre x y 4 en la recta numérica: ¿puede una distancia ser negativa?',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Cantidad de soluciones de |x − 4| = k según el parámetro k',
      rows: [
        { k: '5', geometricMeaning: 'Distancia 5 desde 4', solutions: '{−1; 9}' },
        { k: '0', geometricMeaning: 'Distancia 0 desde 4', solutions: '{4}' },
        { k: '−3', geometricMeaning: 'Distancia negativa (imposible)', solutions: '∅' },
      ],
    },
    formalExplanation:
      'Como |u| ≥ 0 para todo u ∈ ℝ, una ecuación de la forma |x − h| = k solo puede cumplirse si k ≥ 0. Cuando k < 0 no existe ningún número real cuya distancia a h sea negativa, por lo que S = ∅.',
    competencyIds: ['abs.distance_1d_and_equations'],
    evaluation: {
      prompt: '¿Qué desigualdad debe cumplir k para que |x − 4| = k tenga conjunto solución S = ∅?',
      inputKind: 'text',
      criteriaLabel: 'Condición exacta sobre el parámetro k: k < 0',
      expected: 'k < 0',
      acceptPatterns: ['k<0', 'k < 0', 'negativo', 'k negativo', 'menor que 0', 'menor a 0'],
      representation: 'symbolic',
    },
  },
  {
    id: 'mys-u03-vertical-segmentary',
    unit: 3,
    moduleId: 'lineal',
    sectionId: 'sec-4',
    title: '¿Por qué la forma segmentaria falla en rectas que pasan por (0; 0)?',
    openProblem:
      'Toda recta oblicua con cortes a ≠ 0 y b ≠ 0 se escribe x/a + y/b = 1. ¿Por qué ni y = 2x ni x = 4 admiten ecuación segmentaria?',
    hint: 'Intentá reemplazar las intersecciones con los ejes (a en X, b en Y) en los denominadores de x/a + y/b = 1.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Comportamiento de las intersecciones con los ejes',
      rows: [
        { recta: '2x + 3y = 6', corteX: 'a = 3', corteY: 'b = 2', segmentaria: 'x/3 + y/2 = 1' },
        { recta: 'y = 2x', corteX: 'a = 0', corteY: 'b = 0', segmentaria: 'Indefinida (divide por 0)' },
        { recta: 'x = 4', corteX: 'a = 4', corteY: 'No corta Y', segmentaria: 'No existe b real' },
      ],
    },
    formalExplanation:
      'La forma segmentaria x/a + y/b = 1 requiere dividir por ambas intersecciones con los ejes. Si la recta pasa por el origen (a = 0, b = 0) divide por cero; si es horizontal o vertical paralela a un eje, falta uno de los cortes.',
    competencyIds: ['linear.angle_and_three_equation_forms'],
    evaluation: null,
  },
  {
    id: 'mys-u04-sci-vs-si',
    unit: 4,
    moduleId: 'sistemas',
    sectionId: 'sec-3',
    title: '0·x = 0 frente a 0·x = 5 al reducir un sistema',
    openProblem:
      'Al resolver dos sistemas 2×2 por sustitución, en uno desaparecen las variables y queda 0 = 0; en el otro desaparecen y queda 0 = 5. ¿Por qué ambos pierden la incógnita pero significan rectas opuestas en geometría?',
    hint: 'Traducí cada igualdad reducida pensando qué pares (x; y) cumplen 0·x = 0 y cuáles cumplen 0·x = 5.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Interpretación algebraica y geométrica de la eliminación total',
      rows: [
        { reduccion: '0·x = 0', verdad: 'Identidad para todo x', rectas: 'Coincidentes (SCI · infinitas soluciones)' },
        { reduccion: '0·x = 5', verdad: 'Contradicción imposible', rectas: 'Paralelas disjuntas (SI · S = ∅)' },
      ],
    },
    formalExplanation:
      'Cuando ambas ecuaciones tienen igual pendiente, al eliminar una variable se anula el coeficiente de la otra. Si las ordenadas coinciden queda 0 = 0 (rectas superpuestas: Sistema Compatible Indeterminado); si difieren queda 0 = c ≠ 0 (rectas paralelas sin intersección: Sistema Incompatible).',
    competencyIds: ['systems.classification_scd_sci_si'],
    evaluation: null,
  },
  {
    id: 'mys-u05-false-quadratic',
    unit: 5,
    moduleId: 'cuadraticas',
    sectionId: 'sec-1',
    title: 'Parece parábola pero es una recta: la falsa cuadrática',
    openProblem:
      'La fórmula f(x) = (x + 2)² − x² muestra un cuadrado explícito a la vista. ¿Por qué su gráfico en el plano es una línea recta y no una parábola?',
    hint: 'Expandí el cuadrado del binomio (x + 2)² = x² + 4x + 4 antes de mirar el exponente 2.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Evaluación en tabla de f(x) = (x + 2)² − x²',
      rows: [
        { x: '0', valor: '4', deltaY: '—' },
        { x: '1', valor: '8', deltaY: '+4' },
        { x: '2', valor: '12', deltaY: '+4' },
        { x: '3', valor: '16', deltaY: '+4' },
      ],
    },
    formalExplanation:
      'Al desarrollar (x + 2)² − x² = (x² + 4x + 4) − x² = 4x + 4, el término cuadrático se cancela (a = 0). Una función es cuadrática solo cuando, tras simplificar, el coeficiente de x² es distinto de cero.',
    competencyIds: ['quadratics.area_model_and_notable_products'],
    evaluation: {
      prompt: 'Tras simplificar f(x) = (x + 2)² − x², ¿qué tipo de función resulta en todo ℝ? Escribí «lineal» o «cuadratica».',
      inputKind: 'text',
      criteriaLabel: 'Clasificación exacta tras reducir términos semejantes («lineal»)',
      expected: 'lineal',
      acceptPatterns: ['lineal', 'linear', 'funcion lineal'],
      representation: 'symbolic',
    },
  },
  {
    id: 'mys-u06-cubic-multiplicity',
    unit: 6,
    moduleId: 'polinomios',
    sectionId: 'sec-6',
    title: '¿Cómo distingue Ruffini una raíz simple de una raíz triple?',
    openProblem:
      'Tanto P(x) = (x − 2)(x² + 1) como Q(x) = (x − 2)³ se anulan en x = 2. ¿Cómo revela la división sucesiva por (x − 2) que tienen multiplicidades distintas?',
    hint: 'Aplicá la regla de Ruffini con r = 2 sobre el primer cociente obtenido, y repetí mientras el resto vuelva a ser 0.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Ruffini iterado en r = 2 sobre P(x) vs Q(x)',
      rows: [
        { paso: '1.a división por (x − 2)', restoP: '0', restoQ: '0' },
        { paso: '2.a división por (x − 2)', restoP: '5 ≠ 0 (se detiene)', restoQ: '0' },
        { paso: '3.a división por (x − 2)', restoP: '—', restoQ: '0 (multiplicidad 3)' },
      ],
    },
    formalExplanation:
      'Un número r es raíz de multiplicidad m de un polinomio P(x) si (x − r)^m divide exactamente a P(x) pero (x − r)^(m+1) ya deja resto no nulo. Por eso el número de divisiones consecutivas con resto cero en Ruffini mide exactamente la multiplicidad algebraica.',
    competencyIds: [
      'polynomials.division_ruffini_and_remainder',
      'polynomials.factoring_and_gauss_roots',
    ],
    evaluation: null,
  },
  {
    id: 'mys-u07-hole-vs-asymptote',
    unit: 7,
    moduleId: 'racionales-irracionales',
    sectionId: 'sec-3',
    title: 'Dos cocientes que dan 0/0 en x = 1: uno hace agujero y el otro explota',
    openProblem:
      'Si evaluás f(x) = (x² − 1)/(x − 1) y g(x) = (x − 1)/(x − 1)² en x = 1, ambas arrojan 0/0. Sin embargo, f se acerca a 2 mientras g diverge a ±∞. ¿Qué decide esa diferencia?',
    hint: 'Factorizá y compará cuántas veces aparece (x − 1) en el numerador frente al denominador en cada función.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Acercamiento a x = 1 desde la izquierda y derecha',
      rows: [
        { x: '0,99', f: '1,99', g: '−100' },
        { x: '1', f: 'Indefinida (agujero en 2)', g: 'Indefinida (polo)' },
        { x: '1,01', f: '2,01', g: '+100' },
      ],
    },
    formalExplanation:
      'Cuando la multiplicidad del factor (x − a) en el numerador es mayor o igual que en el denominador, el factor se cancela para x ≠ a y queda un agujero evitable. Si el denominador conserva al menos un factor (x − a) sin cancelar, la función diverge y hay asíntota vertical en x = a.',
    competencyIds: ['rational.domain_holes_and_asymptotes'],
    evaluation: {
      prompt: 'En f(x) = (x² − 1)/(x − 1), ¿qué tipo de discontinuidad hay en x = 1: «agujero» o «asintota»?',
      inputKind: 'text',
      criteriaLabel: 'Identificación exacta de discontinuidad evitable («agujero»)',
      expected: 'agujero',
      acceptPatterns: ['agujero', 'discontinuidad evitable', 'evitable'],
      representation: 'tabular',
    },
  },
  {
    id: 'mys-u08-exp-negative-k',
    unit: 8,
    moduleId: 'exponenciales',
    sectionId: 'sec-5',
    title: '¿Por qué g(x) = −3·(1/2)ˣ es CRECIENTE aunque su base sea 1/2 < 1?',
    openProblem:
      'Cuando la base está entre 0 y 1 solemos asociarla con decaimiento. Pero en g(x) = −3·(1/2)ˣ, al aumentar x la función sube. ¿Cómo puede una base fraccionaria producir una curva creciente?',
    hint: 'Pensá en una deuda de $3 que en cada paso se reduce a la mitad: deber $1,50 es estar más arriba que deber $3.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Tabla viva de g(x) = −3 · (1/2)ˣ',
      rows: [
        { x: '0', basePow: '1', gx: '−3' },
        { x: '1', basePow: '1/2', gx: '−1,5' },
        { x: '2', basePow: '1/4', gx: '−0,75' },
      ],
    },
    formalExplanation:
      'El factor (1/2)ˣ decrece hacia 0 cuando x aumenta, pero el coeficiente negativo k = −3 refleja la curva respecto del eje X. Acercarse a 0 desde los negativos significa aumentar de −3 a −1,5 a −0,75, por lo que g es estrictamente creciente en todo ℝ con imagen (−∞; 0).',
    competencyIds: ['exponentials.four_quadrants_monotonicity'],
    evaluation: {
      prompt: 'Para k = −3 < 0 y a = 1/2 ∈ (0; 1), ¿la función g(x) = −3·(1/2)ˣ es «creciente» o «decreciente» en ℝ?',
      inputKind: 'text',
      criteriaLabel: 'Clasificación de monotonía considerando el signo de k («creciente»)',
      expected: 'creciente',
      acceptPatterns: ['creciente', 'estrictamente creciente'],
      representation: 'tabular',
    },
  },
  {
    id: 'mys-u09-log-negative-u',
    unit: 9,
    moduleId: 'logaritmicas',
    sectionId: 'sec-4',
    title: 'Por qué descartar u = −3 en u = 3ˣ pero conservarlo en u = log₃(x − 1)',
    openProblem:
      'Al resolver una ecuación auxiliar cuadrática obtenemos dos valores: u₁ = 2 y u₂ = −3. ¿Por qué en una ecuación exponencial descartamos u₂ = −3 sin dudar, pero en una logarítmica sí produce solución real?',
    hint: 'Compará el conjunto imagen de la función exponencial 3ˣ con el conjunto imagen del logaritmo log₃(x − 1).',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Rango posible de la variable auxiliar u',
      rows: [
        { sustitucion: 'u = 3ˣ', imagen: '(0; +∞)', uNeg3: '3ˣ = −3 → imposible en ℝ' },
        { sustitucion: 'u = log₃(x − 1)', imagen: 'ℝ = (−∞; +∞)', uNeg3: 'log₃(x − 1) = −3 → x − 1 = 1/27 → x = 28/27' },
      ],
    },
    formalExplanation:
      'La imagen de toda exponencial aˣ (con a > 0) es (0; +∞), por lo que u = aˣ jamás puede ser ≤ 0. En cambio, la imagen de log_a(g(x)) es todo ℝ: un logaritmo puede valer −3 perfectamente, siempre que el argumento resultante cumpla g(x) > 0.',
    competencyIds: [
      'logarithms.equations_and_systems',
      'exponentials.equations_three_methods_in_reals',
    ],
    evaluation: null,
  },
  {
    id: 'mys-u10-radians-arc',
    unit: 10,
    moduleId: 'razones-trigonometricas',
    sectionId: 'sec-4',
    title: '¿Por qué el radián convierte la longitud de arco en s = r · θ sin constantes extra?',
    openProblem:
      'En grados sexagesimales la longitud de un arco exige escribir s = (π·r·α)/180°. En radianes desaparece toda fracción y queda simplemente s = r·θ. ¿Qué tiene de especial el radián?',
    hint: 'Pensá cómo se define 1 radián en una circunferencia de radio r: es el ángulo central que subtiende un arco de longitud exactamente igual al radio.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Comparación de fórmula de arco según el sistema angular',
      rows: [
        { sistema: 'Sexagesimal (α en °)', vuelta: '360°', formulaArco: 's = r · α · (π / 180°)' },
        { sistema: 'Circular (θ en rad)', vuelta: '2π rad', formulaArco: 's = r · θ' },
      ],
    },
    formalExplanation:
      'El radián se define geométricamente como el cociente adimensional θ = s / r entre la longitud de arco y el radio. Por propia definición de la unidad, despejar la longitud de arco produce de manera inmediata s = r · θ.',
    competencyIds: ['trig_ratios.angle_systems_and_arc_length'],
    evaluation: null,
  },
  {
    id: 'mys-u11-trig-poles',
    unit: 11,
    moduleId: 'funciones-trigonometricas',
    sectionId: 'sec-3',
    title: 'tg(x) y cotg(x) tienen el mismo período π, pero polos completamente disjuntos',
    openProblem:
      'Tanto la tangente como la cotangente repiten sus valores cada π radianes. Sin embargo, donde una tiene una asíntota vertical la otra vale exactamente 0. ¿Por qué sus dominios no coinciden?',
    hint: 'Escribí tg(x) = sen(x)/cos(x) y cotg(x) = cos(x)/sen(x) y buscá qué función anula cada denominador.',
    exploratoryRepresentation: {
      kind: 'comparison_table',
      caption: 'Ceros y polos cruzados en [0; π]',
      rows: [
        { x: '0', tan: '0', cot: 'Asíntota vertical (sen 0 = 0)' },
        { x: 'π/4', tan: '1', cot: '1' },
        { x: 'π/2', tan: 'Asíntota vertical (cos π/2 = 0)', cot: '0' },
      ],
    },
    formalExplanation:
      'tg(x) = sen(x)/cos(x) se indefine cuando cos(x) = 0 (x = π/2 + kπ), mientras cotg(x) = cos(x)/sen(x) se indefine cuando sen(x) = 0 (x = kπ). Como sen(x) y cos(x) nunca se anulan simultáneamente (sen²x + cos²x = 1), sus polos nunca se superponen.',
    competencyIds: ['trig_functions.six_functions_domains_graphs_and_bijectivity'],
    evaluation: {
      prompt: '¿Cuál de las dos funciones comparte las mismas asíntotas verticales x = kπ que cotg(x): «sec(x)» o «cosec(x)»?',
      inputKind: 'text',
      criteriaLabel: 'Identificación de denominador común sen(x) («cosec(x)»)',
      expected: 'cosec(x)',
      acceptPatterns: ['cosec(x)', 'cosec', 'csc(x)', 'csc', 'cosecante'],
      representation: 'symbolic',
    },
  },
]);

/**
 * Returns a mystery entry by ID or null if not found.
 * @param {string} id
 * @returns {object|null}
 */
export function getMysteryById(id) {
  if (!id || typeof id !== 'string') return null;
  return OPEN_MYSTERIES.find((m) => m.id === id) || null;
}

/**
 * Computes the current mystery status from mysteries state.
 */
function resolveMysteryStatus(mysteryId, mysteriesState) {
  const entry = mysteriesState?.entries?.[mysteryId];
  if (mysteriesState?.openIds?.includes(mysteryId)) return MYSTERY_STATUSES.OPEN;
  if (mysteriesState?.resolvedIds?.includes(mysteryId)) return MYSTERY_STATUSES.RESOLVED;
  if (mysteriesState?.dismissedIds?.includes(mysteryId)) return MYSTERY_STATUSES.DISMISSED;
  if (mysteriesState?.exploredIds?.includes(mysteryId)) return MYSTERY_STATUSES.EXPLORED;
  return entry?.status || MYSTERY_STATUSES.UNOPENED;
}

/**
 * Lists mysteries optionally filtered by unit, moduleId, or status, enriched with user state.
 *
 * @param {object} [options]
 * @returns {object[]}
 */
export function listMysteries({ unit = null, moduleId = null, status = null, store = null } = {}) {
  const progressStore = store || getProgressStore();
  const mysteriesState = progressStore.getMysteriesState();

  return OPEN_MYSTERIES.filter((m) => {
    if (unit !== null && unit !== undefined && m.unit !== unit) return false;
    if (moduleId && m.moduleId !== moduleId) return false;
    const currentStatus = resolveMysteryStatus(m.id, mysteriesState);
    if (status && currentStatus !== status) return false;
    return true;
  }).map((m) => ({
    ...m,
    unitLabel: UNIT_LABELS[m.unit] || `U${String(m.unit).padStart(2, '0')}`,
    status: resolveMysteryStatus(m.id, mysteriesState),
    entry: mysteriesState.entries?.[m.id] ? { ...mysteriesState.entries[m.id] } : null,
  }));
}

/**
 * Validates the curated mystery catalog for completeness, valid evaluation schema,
 * valid competency references, and zero Unicode emojis.
 *
 * @returns {{ valid: boolean, errors: string[], count: number }}
 */
export function validateMysteryCatalog() {
  const errors = [];
  const seenIds = new Set();

  for (const m of OPEN_MYSTERIES) {
    if (!m.id || typeof m.id !== 'string') {
      errors.push('Mystery missing valid id');
      continue;
    }
    if (seenIds.has(m.id)) {
      errors.push(`Duplicate mystery id: ${m.id}`);
    }
    seenIds.add(m.id);

    if (typeof m.unit !== 'number' || m.unit < 1 || m.unit > 11) {
      errors.push(`Invalid unit for ${m.id}`);
    }
    if (!m.moduleId || !m.sectionId) {
      errors.push(`Missing moduleId or sectionId in ${m.id}`);
    }
    for (const field of ['title', 'openProblem', 'hint', 'formalExplanation']) {
      if (typeof m[field] !== 'string' || m[field].trim().length < 5) {
        errors.push(`Missing or too-short ${field} in ${m.id}`);
      } else if (EMOJI_REGEX.test(m[field])) {
        errors.push(`Unicode emoji detected in ${m.id}.${field}`);
      }
    }
    if (!m.exploratoryRepresentation || typeof m.exploratoryRepresentation !== 'object') {
      errors.push(`Missing exploratoryRepresentation in ${m.id}`);
    }
    if (!Array.isArray(m.competencyIds) || m.competencyIds.length === 0) {
      errors.push(`Missing competencyIds in ${m.id}`);
    }
    if (m.evaluation !== null) {
      if (
        typeof m.evaluation !== 'object' ||
        typeof m.evaluation.prompt !== 'string' ||
        typeof m.evaluation.criteriaLabel !== 'string' ||
        typeof m.evaluation.expected !== 'string'
      ) {
        errors.push(`Invalid evaluation schema in ${m.id}`);
      } else if (EMOJI_REGEX.test(m.evaluation.prompt) || EMOJI_REGEX.test(m.evaluation.criteriaLabel)) {
        errors.push(`Unicode emoji detected in ${m.id}.evaluation`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: OPEN_MYSTERIES.length,
  };
}

/**
 * Saves an open mystery into the learner's bounded notebook (max MAX_OPEN_MYSTERIES = 5).
 * Strict Non-Mastery Invariant: NEVER emits answer_submitted or alters competencies.
 *
 * @param {string} mysteryId
 * @param {object} [options]
 * @returns {object}
 */
export function saveMystery(mysteryId, { store = null } = {}) {
  const mystery = getMysteryById(mysteryId);
  if (!mystery) {
    return { ok: false, reason: 'not_found' };
  }
  const progressStore = store || getProgressStore();
  const current = progressStore.getMysteriesState();

  if (current.openIds.includes(mysteryId)) {
    return {
      ok: true,
      alreadyOpen: true,
      status: MYSTERY_STATUSES.OPEN,
      entry: current.entries[mysteryId] || null,
      mysteries: current,
    };
  }

  if (current.openIds.length >= MAX_OPEN_MYSTERIES) {
    return {
      ok: false,
      reason: 'notebook_full',
      maxOpen: MAX_OPEN_MYSTERIES,
      openCount: current.openIds.length,
    };
  }

  const nowIso = new Date().toISOString();
  const updated = progressStore.updateMysteriesState((st) => {
    const prev = st.entries[mysteryId] || {};
    return {
      ...st,
      openIds: [...st.openIds, mysteryId],
      dismissedIds: st.dismissedIds.filter((id) => id !== mysteryId),
      resolvedIds: st.resolvedIds.filter((id) => id !== mysteryId),
      entries: {
        ...st.entries,
        [mysteryId]: {
          ...prev,
          mysteryId,
          status: MYSTERY_STATUSES.OPEN,
          savedAt: prev.savedAt || nowIso,
          hintViewed: Boolean(prev.hintViewed),
          explanationViewed: Boolean(prev.explanationViewed),
          evaluationRecorded: Boolean(prev.evaluationRecorded),
        },
      },
    };
  });

  return {
    ok: true,
    status: MYSTERY_STATUSES.OPEN,
    entry: updated.entries[mysteryId],
    mysteries: updated,
  };
}

/**
 * Records voluntary exploration (opening hint or formal explanation) of a mystery.
 * Strict Non-Mastery Invariant: NEVER emits answer_submitted or alters competencies.
 *
 * @param {string} mysteryId
 * @param {object} [options]
 * @returns {object}
 */
export function exploreMystery(
  mysteryId,
  { store = null, viewExplanation = false, viewHint = false } = {}
) {
  const mystery = getMysteryById(mysteryId);
  if (!mystery) {
    return { ok: false, reason: 'not_found' };
  }
  const progressStore = store || getProgressStore();
  const nowIso = new Date().toISOString();

  const updated = progressStore.updateMysteriesState((st) => {
    const prev = st.entries[mysteryId] || {};
    const isCurrentlyOpen = st.openIds.includes(mysteryId);
    const nextStatus = isCurrentlyOpen ? MYSTERY_STATUSES.OPEN : MYSTERY_STATUSES.EXPLORED;
    const exploredIds = st.exploredIds.includes(mysteryId)
      ? st.exploredIds
      : [...st.exploredIds, mysteryId];

    return {
      ...st,
      exploredIds,
      entries: {
        ...st.entries,
        [mysteryId]: {
          ...prev,
          mysteryId,
          status: nextStatus,
          exploredAt: prev.exploredAt || nowIso,
          hintViewed: Boolean(prev.hintViewed || viewHint),
          explanationViewed: Boolean(prev.explanationViewed || viewExplanation),
          evaluationRecorded: Boolean(prev.evaluationRecorded),
        },
      },
    };
  });

  return {
    ok: true,
    status: updated.entries[mysteryId].status,
    entry: updated.entries[mysteryId],
    mysteries: updated,
  };
}

/**
 * Dismisses a mystery from the open notebook.
 * Strict Non-Mastery Invariant: NEVER touches state.competencies.
 */
export function dismissMystery(mysteryId, { store = null } = {}) {
  const mystery = getMysteryById(mysteryId);
  if (!mystery) {
    return { ok: false, reason: 'not_found' };
  }
  const progressStore = store || getProgressStore();
  const nowIso = new Date().toISOString();

  const updated = progressStore.updateMysteriesState((st) => {
    const prev = st.entries[mysteryId] || {};
    return {
      ...st,
      openIds: st.openIds.filter((id) => id !== mysteryId),
      dismissedIds: st.dismissedIds.includes(mysteryId)
        ? st.dismissedIds
        : [...st.dismissedIds, mysteryId],
      entries: {
        ...st.entries,
        [mysteryId]: {
          ...prev,
          mysteryId,
          status: MYSTERY_STATUSES.DISMISSED,
          dismissedAt: nowIso,
        },
      },
    };
  });

  return {
    ok: true,
    status: MYSTERY_STATUSES.DISMISSED,
    entry: updated.entries[mysteryId],
    mysteries: updated,
  };
}

/**
 * Manually closes/archives a mystery without claiming mastery evidence.
 * Strict Non-Mastery Invariant: NEVER touches state.competencies.
 */
export function closeMystery(mysteryId, { store = null } = {}) {
  const mystery = getMysteryById(mysteryId);
  if (!mystery) {
    return { ok: false, reason: 'not_found' };
  }
  const progressStore = store || getProgressStore();
  const nowIso = new Date().toISOString();

  const updated = progressStore.updateMysteriesState((st) => {
    const prev = st.entries[mysteryId] || {};
    return {
      ...st,
      openIds: st.openIds.filter((id) => id !== mysteryId),
      resolvedIds: st.resolvedIds.includes(mysteryId)
        ? st.resolvedIds
        : [...st.resolvedIds, mysteryId],
      entries: {
        ...st.entries,
        [mysteryId]: {
          ...prev,
          mysteryId,
          status: MYSTERY_STATUSES.RESOLVED,
          closedAt: nowIso,
          evaluationRecorded: Boolean(prev.evaluationRecorded),
        },
      },
    };
  });

  return {
    ok: true,
    status: MYSTERY_STATUSES.RESOLVED,
    entry: updated.entries[mysteryId],
    mysteries: updated,
  };
}

function checkMysteryEvaluation(evaluation, rawInput) {
  const trimmed = String(rawInput ?? '').trim();
  const normUser = normalizeTransferAnswer(trimmed);
  const compactUser = normUser.replace(/\s+/g, '');

  if (Array.isArray(evaluation.acceptPatterns)) {
    for (const pattern of evaluation.acceptPatterns) {
      const normPat = normalizeTransferAnswer(pattern);
      if (normUser === normPat || compactUser === normPat.replace(/\s+/g, '')) {
        return { ok: true };
      }
    }
  }

  return validateTransferAnswer(evaluation, trimmed);
}

/**
 * Submits an answer for an optional evaluable mystery with explicit criteria.
 * Enforces 4 guards:
 * 1. Non-evaluable mystery (`evaluation === null`) -> returns `{ ok: false, evaluated: false, evidenceEmitted: false, reason: 'not_evaluable' }` without touching competencies.
 * 2. Empty input -> returns `{ ok: false, empty: true, evaluated: false, evidenceEmitted: false }` without touching competencies.
 * 3. Evaluates against explicit criteria (`acceptPatterns` + `validateTransferAnswer`).
 * 4. Assistance Lock: if `explanationViewed` was triggered beforehand, forces `solutionRevealed = true`;
 *    if `hintViewed` was triggered beforehand, forces `hintsUsed >= 1`.
 *
 * @param {string} mysteryId
 * @param {string} rawInput
 * @param {object} [options]
 * @returns {object}
 */
export function submitMysteryAnswer(
  mysteryId,
  rawInput,
  { store = null, hintsUsed = 0, solutionRevealed = false } = {}
) {
  const mystery = getMysteryById(mysteryId);
  if (!mystery) {
    return { ok: false, evaluated: false, evidenceEmitted: false, reason: 'not_found' };
  }

  if (!mystery.evaluation || typeof mystery.evaluation.criteriaLabel !== 'string' || !mystery.evaluation.criteriaLabel.trim()) {
    return {
      ok: false,
      evaluated: false,
      evidenceEmitted: false,
      reason: 'not_evaluable',
    };
  }

  const trimmed = String(rawInput ?? '').trim();
  if (!trimmed) {
    return {
      ok: false,
      empty: true,
      evaluated: false,
      evidenceEmitted: false,
      reason: 'empty_input',
    };
  }

  const progressStore = store || getProgressStore();
  const mysteriesState = progressStore.getMysteriesState();
  const prevEntry = mysteriesState.entries?.[mysteryId] || {};

  const effectiveSolutionRevealed = Boolean(solutionRevealed || prevEntry.explanationViewed);
  const effectiveHintsUsed = prevEntry.hintViewed
    ? Math.max(Number(hintsUsed) || 0, 1)
    : Math.max(0, Number(hintsUsed) || 0);

  const checkResult = checkMysteryEvaluation(mystery.evaluation, trimmed);
  const correct = Boolean(checkResult.ok);

  const event = createLearningEvent({
    type: 'answer_submitted',
    moduleId: mystery.moduleId,
    exerciseId: `mystery-${mystery.id}`,
    competencyIds: mystery.competencyIds,
    correct,
    hintsUsed: effectiveHintsUsed,
    solutionRevealed: effectiveSolutionRevealed,
    assistance: effectiveSolutionRevealed ? 'solution_revealed' : (effectiveHintsUsed > 0 ? 'hints' : 'none'),
    representation: mystery.evaluation.representation || 'symbolic',
    stage: 'transfer',
    transferDistance: 'far',
  });

  progressStore.recordLearningEvent(event);

  const nowIso = new Date().toISOString();
  progressStore.updateMysteriesState((st) => {
    const prev = st.entries[mysteryId] || {};
    if (correct) {
      return {
        ...st,
        openIds: st.openIds.filter((id) => id !== mysteryId),
        dismissedIds: st.dismissedIds.filter((id) => id !== mysteryId),
        resolvedIds: st.resolvedIds.includes(mysteryId) ? st.resolvedIds : [...st.resolvedIds, mysteryId],
        entries: {
          ...st.entries,
          [mysteryId]: {
            ...prev,
            mysteryId,
            status: MYSTERY_STATUSES.RESOLVED,
            resolvedAt: nowIso,
            evaluationRecorded: true,
          },
        },
      };
    }

    const keepStatus = st.openIds.includes(mysteryId)
      ? MYSTERY_STATUSES.OPEN
      : MYSTERY_STATUSES.EXPLORED;
    const exploredIds = st.exploredIds.includes(mysteryId)
      ? st.exploredIds
      : [...st.exploredIds, mysteryId];

    return {
      ...st,
      exploredIds,
      entries: {
        ...st.entries,
        [mysteryId]: {
          ...prev,
          mysteryId,
          status: keepStatus,
          lastAttemptAt: nowIso,
          evaluationRecorded: Boolean(prev.evaluationRecorded),
        },
      },
    };
  });

  return {
    ok: correct,
    correct,
    evaluated: true,
    evidenceEmitted: true,
    syntaxError: checkResult.syntaxError || null,
    assistance: event.assistance,
    event,
  };
}

function renderExploratoryPreview(rep) {
  if (!rep || !Array.isArray(rep.rows) || rep.rows.length === 0) {
    return null;
  }
  const cols = Object.keys(rep.rows[0]);
  return h(
    'div',
    { class: 'mystery-preview' },
    rep.caption ? h('p', { class: 'mystery-preview__caption muted small' }, rep.caption) : null,
    h(
      'div',
      { class: 'mystery-preview__table-wrap' },
      h(
        'table',
        { class: 'mystery-preview__table' },
        h(
          'thead',
          null,
          h('tr', null, ...cols.map((c) => h('th', { scope: 'col' }, c)))
        ),
        h(
          'tbody',
          null,
          ...rep.rows.map((row) =>
            h(
              'tr',
              null,
              ...cols.map((c) => h('td', null, String(row[c])))
            )
          )
        )
      )
    )
  );
}

/**
 * Mounts the Cuaderno de Misterios Abiertos UI onto a DOM container.
 * Node-safe: `document` is only accessed inside this function via `dom.js` helpers.
 *
 * @param {HTMLElement} container
 * @param {object} [options]
 * @returns {{ update: () => void, destroy: () => void }|null}
 */
export function mountMysteriesNotebook(
  container,
  { store = null, limit = MAX_OPEN_MYSTERIES, onNavigate = null } = {}
) {
  if (!container || typeof document === 'undefined') return null;

  const progressStore = store || getProgressStore();
  let activeTab = 'discover';
  const uiLocalFeedback = new Map();
  let destroyed = false;

  const render = () => {
    if (destroyed) return;

    const mysteriesState = progressStore.getMysteriesState();
    const allItems = listMysteries({ store: progressStore });
    const openCount = mysteriesState.openIds.length;

    if (activeTab === 'saved' && openCount === 0) {
      // Allow user to stay on saved tab showing clear empty state
    }

    let filtered = [];
    if (activeTab === 'saved') {
      filtered = allItems.filter((m) => m.status === MYSTERY_STATUSES.OPEN);
    } else if (activeTab === 'closed') {
      filtered = allItems.filter(
        (m) => m.status === MYSTERY_STATUSES.RESOLVED || m.status === MYSTERY_STATUSES.DISMISSED
      );
    } else {
      filtered = allItems.filter(
        (m) => m.status !== MYSTERY_STATUSES.RESOLVED && m.status !== MYSTERY_STATUSES.DISMISSED
      ).slice(0, Math.max(limit, allItems.length));
    }

    const header = h(
      'header',
      { class: 'mysteries-notebook__header' },
      h(
        'div',
        { class: 'mysteries-notebook__heading' },
        h('h2', { class: 'mysteries-notebook__title' }, chalkIcon('book', 20), ' Cuaderno de Misterios Abiertos'),
        h(
          'p',
          { class: 'mysteries-notebook__subtitle muted' },
          'Preguntas matemáticas voluntarias para explorar con calma. Guardar o leer explicaciones nunca afecta tu dominio.'
        )
      ),
      h(
        'div',
        { class: 'mysteries-notebook__meta' },
        h('span', { class: 'mysteries-notebook__counter' }, `Abiertos: ${openCount} / ${MAX_OPEN_MYSTERIES}`),
        h(
          'div',
          { class: 'mysteries-notebook__tabs', role: 'tablist', 'aria-label': 'Filtros del cuaderno' },
          ...[
            { id: 'saved', label: `Guardados (${openCount})` },
            { id: 'discover', label: 'Descubrir' },
            { id: 'closed', label: 'Cerrados' },
          ].map((tab) =>
            h(
              'button',
              {
                type: 'button',
                role: 'tab',
                'aria-selected': activeTab === tab.id ? 'true' : 'false',
                class: `btn btn--sm ${activeTab === tab.id ? 'is-active' : 'btn--subtle'}`,
                on: {
                  click: () => {
                    activeTab = tab.id;
                    render();
                  },
                },
              },
              tab.label
            )
          )
        )
      )
    );

    const listEl = h('div', { class: 'mysteries-notebook__list' });

    if (filtered.length === 0) {
      const emptyMsg =
        activeTab === 'saved'
          ? 'No tenés misterios guardados en este momento. Podés abrir cualquiera desde «Descubrir» cuando te dé curiosidad.'
          : activeTab === 'closed'
            ? 'Todavía no cerraste ni descartaste ningún misterio.'
            : 'No hay misterios disponibles en esta vista.';
      listEl.append(h('p', { class: 'mysteries-notebook__empty muted' }, emptyMsg));
    } else {
      for (const item of filtered) {
        const isOpen = item.status === MYSTERY_STATUSES.OPEN;
        const hintVisible = Boolean(item.entry?.hintViewed);
        const explanationVisible = Boolean(item.entry?.explanationViewed);
        const feedback = uiLocalFeedback.get(item.id) || null;

        const row = h('article', {
          class: `mystery-row is-${item.status}`,
          'data-mystery-id': item.id,
        });

        row.append(
          h(
            'div',
            { class: 'mystery-row__top' },
            h('span', { class: 'mystery-row__unit' }, item.unitLabel),
            h('h3', { class: 'mystery-row__title' }, item.title)
          ),
          h('p', { class: 'mystery-row__problem' }, item.openProblem)
        );

        const previewEl = renderExploratoryPreview(item.exploratoryRepresentation);
        if (previewEl) {
          row.append(previewEl);
        }

        if (hintVisible) {
          row.append(
            h('p', { class: 'mystery-row__hint' }, h('strong', null, 'Pista: '), item.hint)
          );
        }

        if (explanationVisible) {
          row.append(
            h(
              'p',
              { class: 'mystery-row__explanation' },
              h('strong', null, 'Explicación formal: '),
              item.formalExplanation
            )
          );
        }

        const actions = h('div', { class: 'mystery-row__actions' });

        if (!isOpen) {
          actions.append(
            h(
              'button',
              {
                type: 'button',
                class: 'btn btn--sm btn--subtle',
                on: {
                  click: () => {
                    const res = saveMystery(item.id, { store: progressStore });
                    if (!res.ok && res.reason === 'notebook_full') {
                      uiLocalFeedback.set(item.id, {
                        tone: 'info',
                        text: `Tu cuaderno alcanzó el máximo de ${MAX_OPEN_MYSTERIES} misterios abiertos. Cerrá o descartá uno para guardar este.`,
                      });
                    } else {
                      uiLocalFeedback.delete(item.id);
                    }
                    render();
                  },
                },
              },
              'Guardar'
            )
          );
        } else {
          actions.append(
            h(
              'button',
              {
                type: 'button',
                class: 'btn btn--sm btn--subtle',
                on: {
                  click: () => {
                    dismissMystery(item.id, { store: progressStore });
                    uiLocalFeedback.delete(item.id);
                    render();
                  },
                },
              },
              'Quitar del cuaderno'
            )
          );
        }

        actions.append(
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn--sm btn--subtle',
              on: {
                click: () => {
                  exploreMystery(item.id, { store: progressStore, viewHint: true });
                  render();
                },
              },
            },
            hintVisible ? 'Pista abierta' : 'Ver pista'
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'btn btn--sm btn--subtle',
              on: {
                click: () => {
                  exploreMystery(item.id, { store: progressStore, viewExplanation: true });
                  render();
                },
              },
            },
            explanationVisible ? 'Explicación abierta' : 'Ver explicación formal'
          )
        );

        if (item.status !== MYSTERY_STATUSES.RESOLVED) {
          actions.append(
            h(
              'button',
              {
                type: 'button',
                class: 'btn btn--sm btn--subtle',
                on: {
                  click: () => {
                    closeMystery(item.id, { store: progressStore });
                    uiLocalFeedback.delete(item.id);
                    render();
                  },
                },
              },
              'Cerrar misterio'
            )
          );
        }

        const labHref = `${item.moduleId}.html#${item.sectionId}`;
        actions.append(
          h(
            'a',
            {
              href: labHref,
              class: 'btn btn--sm btn--subtle mystery-row__lab-link',
              on: {
                click: (ev) => {
                  if (typeof onNavigate === 'function') {
                    ev.preventDefault();
                    onNavigate(item, labHref);
                  }
                },
              },
            },
            'Ir al laboratorio'
          )
        );

        row.append(actions);

        if (item.evaluation) {
          const inputId = `mystery-input-${item.id}`;
          const inputEl = h('input', {
            id: inputId,
            type: 'text',
            class: 'mystery-eval__input',
            placeholder: 'Tu respuesta (opcional)...',
            'aria-label': item.evaluation.prompt,
          });
          const form = h(
            'form',
            {
              class: 'mystery-eval',
              on: {
                submit: (ev) => {
                  ev.preventDefault();
                  const res = submitMysteryAnswer(item.id, inputEl.value, {
                    store: progressStore,
                  });
                  if (res.empty) {
                    uiLocalFeedback.set(item.id, {
                      tone: 'muted',
                      text: 'Ingresá una respuesta para comprobar (esta verificación es voluntaria).',
                    });
                  } else if (res.ok) {
                    uiLocalFeedback.set(item.id, {
                      tone: 'success',
                      text:
                        res.assistance === 'none'
                          ? 'Correcto sin ayudas: se registró evidencia de transferencia.'
                          : 'Correcto (con consulta previa de pista o explicación: registrado como práctica asistida).',
                    });
                  } else {
                    uiLocalFeedback.set(item.id, {
                      tone: 'info',
                      text: res.syntaxError || 'Todavía no coincide con el criterio esperado. Podés revisar la explicación formal cuando quieras.',
                    });
                  }
                  render();
                },
              },
            },
            h('label', { for: inputId, class: 'mystery-eval__prompt' }, item.evaluation.prompt),
            h(
              'p',
              { class: 'mystery-eval__criteria muted small' },
              `Criterio explícito: ${item.evaluation.criteriaLabel} (las exploraciones abiertas no alteran tu dominio)`
            ),
            h(
              'div',
              { class: 'mystery-eval__row' },
              inputEl,
              h('button', { type: 'submit', class: 'btn btn--sm' }, 'Comprobar')
            )
          );
          row.append(form);
        }

        if (feedback) {
          row.append(
            h('p', { class: `mystery-row__feedback is-${feedback.tone}`, role: 'status' }, feedback.text)
          );
        }

        listEl.append(row);
      }
    }

    container.replaceChildren(header, listEl);
  };

  const unsubscribe = progressStore.subscribe((payload) => {
    if (payload?.type === 'mysteries_updated' || payload?.type === 'store_reset' || payload?.type === 'state_imported') {
      render();
    }
  });

  render();

  return {
    update: render,
    destroy: () => {
      destroyed = true;
      if (typeof unsubscribe === 'function') unsubscribe();
    },
  };
}
