/**
 * index.js — Punto de entrada del Laboratorio de Sucesiones (Lección Lineal).
 * Inicializa navegación, widgets interactivos y gestión de progreso en localStorage.
 */

import { byId, qsa, mount, h, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import {
  REPRESENTATION_TYPES,
  LEARNING_STAGES,
  TRANSFER_DISTANCES,
} from '../../core/learning/events.js';
import { isMigrationNeeded, migrateLegacyProgress } from '../../core/learning/migrations.js';
import {
  createCheckBlock,
  annotatedFormula,
  PROGRESS_KEY,
  getProgress,
  saveSectionProgress,
  recordCompetencyAttempt,
  getCompetencyReport,
  mountCompetencyDashboard,
} from './components.js';
import {
  SEQ_COMPETENCIES,
  SEQ_DIAGNOSTIC_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
} from './competencies-map.js';
import { initSeqLearning, getSeqCompetencyReport } from './learning-adapter.js';

// Widgets Capítulo 1
import { initPatronWidget } from './widgets/patron.js';
import { initDetectiveWidget } from './widgets/detective.js';
import { initFuncionWidget } from './widgets/funcion.js';

// Widgets Capítulo 2
import { initEscaleraWidget } from './widgets/escalera.js';
import { initTeletransportadorWidget } from './widgets/teletransportador.js';
import { initAlRevesWidget } from './widgets/al-reves.js';
import { initEquivalentesWidget } from './widgets/equivalentes.js';
import { initRosettaWidget } from './widgets/rosetta.js';

// Widgets Capítulo 3
import { initGeometricaModoWidget } from './widgets/geometrica-modo.js';
import { initRazonWidget } from './widgets/razon.js';
import { initCompararWidget } from './widgets/comparar.js';
import { initLimiteWidget } from './widgets/limite.js';

// Capítulo 4: Entrenador y Trampas
import { initRetosModule } from './retos.js';

// Sistema Visual Novel (Modo Alaska)
import { playScript } from '../../core/vn.js';
import { VN_SCRIPTS } from './vn-scripts.js';

/* ---------- Gestión de Progreso y Sidebar ---------- */
const TOTAL_SECTIONS = 11;
const SECTION_KEY_REGEX = /^sec-(?:[1-9]|1[01]|5[ab])$/;

function updateSidebarProgress() {
  const progress = getProgress();
  const completedKeys = Object.keys(progress).filter((k) => progress[k] && SECTION_KEY_REGEX.test(k));
  const count = completedKeys.length;

  const textEl = byId('seq-progress-text');
  const fillEl = byId('seq-progress-fill');

  if (textEl) textEl.textContent = `Progreso: ${count}/${TOTAL_SECTIONS}`;
  if (fillEl) {
    const pct = Math.min(100, Math.round((count / TOTAL_SECTIONS) * 100));
    fillEl.style.width = `${pct}%`;
  }

  qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
    const secId = link.dataset.sec;
    const statusEl = link.querySelector('.seq-sidebar__status');
    if (statusEl) {
      if (progress[secId]) {
        mount(statusEl, chalkIcon('check', { width: 14, height: 14 }));
        statusEl.classList.add('is-done');
      } else {
        statusEl.textContent = '';
        statusEl.classList.remove('is-done');
      }
    }
  });
}

function initScrollSpy() {
  const links = qsa('.seq-sidebar__link[data-sec]');
  const sections = links.map((l) => document.getElementById(l.dataset.sec)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    // Si el modo pizarrón está activo, la selección es explícita y no por scroll
    if (document.querySelector('.seq-content.mode-blackboard')) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach((l) => l.classList.toggle('is-active', l.dataset.sec === id));
      }
    });
  }, { threshold: 0.2 });

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------- Bancos de Preguntas de Chequeo (Khan Academy) ---------- */

export const CHECKS_DATA = {
  // CAPÍTULO 1
  'sec-1': [
    {
      id: 'sec1-q1',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extend_increasing_arithmetic_sequence',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>3, 8, 13, [___]</strong>. (Patrón: suma 5 al término anterior).',
      expected: 18,
      hints: [
        'Fijate cuánto se suma entre 3 y 8, y verificá si se repite entre 8 y 13.',
        'Identificá la regla de avance constante que genera la lista.',
        'Aplicá esa misma variación al último término conocido (13) para hallar el cuarto.',
      ],
      solution: 'En la sucesión 3, 8, 13, …, la diferencia entre términos consecutivos es +5 (8 − 3 = 5 y 13 − 8 = 5). Para hallar el siguiente término sumamos 5 al último término conocido: 13 + 5 = <strong>18</strong>.',
    },
    {
      id: 'sec1-q2',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extend_decreasing_arithmetic_sequence',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>20, 17, 14, [___]</strong>. (Patrón: resta 3 al término anterior).',
      expected: 11,
      hints: [
        'Observá que los términos van disminuyendo de manera uniforme de izquierda a derecha.',
        'Confirmá qué cantidad se resta para ir de 20 a 17 y de 17 a 14.',
        'Restá esa misma diferencia constante al tercer término (14).',
      ],
      solution: 'Cada término se obtiene restando 3 al anterior: 14 − 3 = <strong>11</strong>.',
    },
    {
      id: 'sec1-q3',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extend_geometric_sequence',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>3, 6, 12, [___]</strong>. (Patrón: multiplica por 2 al término anterior).',
      expected: 24,
      hints: [
        'Probá primero si las restas consecutivas son iguales: 6 − 3 frente a 12 − 6.',
        'Como los saltos aditivos cambian, comprobá el factor multiplicativo entre términos seguidos.',
        'Multiplicá el último término conocido (12) por esa razón constante.',
      ],
      solution: 'Cada término se multiplica por 2: 12 × 2 = <strong>24</strong>.',
    },
    {
      id: 'sec1-q4',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'classify',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'match_sequences_to_step_rules',
      diagnosticIds: [],
      type: 'match',
      prompt: 'Relacioná cada sucesión con su patrón de avance correspondiente:',
      patterns: [
        'Suma 7 al término previo',
        'Divide el término previo entre 2',
        'Resta 4 al término previo',
        'Multiplica el término previo por 3',
      ],
      pairs: [
        { seq: '4, 11, 18, 25…', pattern: 'Suma 7 al término previo' },
        { seq: '40, 20, 10, 5…', pattern: 'Divide el término previo entre 2' },
        { seq: '100, 96, 92, 88…', pattern: 'Resta 4 al término previo' },
        { seq: '4, 12, 36, 108…', pattern: 'Multiplica el término previo por 3' },
      ],
      hints: [
        'Observá primero si cada lista crece o decrece al avanzar hacia la derecha.',
        'Verificá si el cambio entre el primer y segundo término coincide con sumar/restar la misma cantidad en el salto siguiente.',
        'Si los saltos cambian de tamaño, compará el cociente entre términos consecutivos.',
      ],
      solution: '<ul><li>4 a 11: +7</li><li>40 a 20: ÷2</li><li>100 a 96: −4</li><li>4 a 12: ×3</li></ul>',
    },
  ],

  'sec-2': [
    {
      id: 'sec2-q1',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'classify',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'compute_common_difference_d',
      diagnosticIds: ['sign_of_step'],
      type: 'number',
      prompt: '¿Cuál es la diferencia común de la sucesión aritmética <strong>2, 8, 14, 20…</strong>?',
      expected: 6,
      hints: [
        'La diferencia común se define restando un término menos su inmediato anterior: d = a(n) − a(n − 1).',
        'Elegí cualquier par de términos consecutivos, por ejemplo 2 y 8, o 8 y 14.',
        'Respetá el orden: término posterior menos término anterior para obtener el signo correcto de d.',
      ],
      solution: 'La diferencia común es la resta entre dos términos consecutivos: 8 − 2 = 6 (o 14 − 8 = 6). Por lo tanto, <strong>d = 6</strong>.',
    },
    {
      id: 'sec2-q2',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'classify',
      representation: REPRESENTATION_TYPES.VERBAL,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'monotonicity_negative_common_difference',
      diagnosticIds: ['sign_of_step'],
      type: 'choice',
      prompt: '¿Qué debe ser cierto acerca de una sucesión aritmética cuya diferencia común d es <strong>negativa</strong>?',
      options: [
        'Los términos aumentan en cada paso.',
        'Los términos decrecen en cada paso.',
        'Los términos permanecen siempre constantes.',
        'Los signos alternan entre positivo y negativo.',
      ],
      expected: 1,
      explanation: '¡Exacto! Al sumar repetidamente un número negativo, cada término es menor que el anterior (ej. 21, 16, 11, 6… con d = −5).',
      hints: [
        'Construí un ejemplo breve: arrancá en 10 y sumá d = −3 en cada paso.',
        'Recordá que sumar un número negativo equivale a restar su valor absoluto en cada salto.',
        'Descartá la alternancia de signos: eso ocurre al multiplicar por razones negativas, no al sumar.',
      ],
      solution: 'Al sumarle una cantidad negativa término a término (como d = −5), el valor se va achicando: la sucesión decrece.',
    },
    {
      id: 'sec2-q3',
      competencyId: 'sequences.pattern_recognition_and_classification',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'compute_fourth_term_with_negative_d',
      diagnosticIds: ['sign_of_step'],
      type: 'number',
      prompt: 'Desafío: El primer término de una sucesión aritmética es <strong>10</strong> y su diferencia común es <strong>−7</strong>. ¿Cuál es el <strong>cuarto término a(4)</strong>?',
      expected: -11,
      hints: [
        'Partí de a(1) = 10 y contá cuántos saltos de −7 necesitás para llegar hasta a(4).',
        'Avanzá paso a paso: desde a(1) hasta a(2) y a(3) restando 7 en cada escalón.',
        'Desde el tercer término, aplicá el último salto de −7 cuidando los signos negativos.',
      ],
      solution: 'Extendiendo término por término: a(1) = 10, a(2) = 10 − 7 = 3, a(3) = 3 − 7 = −4, a(4) = −4 − 7 = <strong>−11</strong>.',
    },
  ],

  'sec-3': [
    {
      id: 'sec3-q1',
      competencyId: 'sequences.discrete_domain_and_notation',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'read_functional_index_notation_a4',
      diagnosticIds: [],
      type: 'number',
      prompt: 'En la sucesión dada por la función <strong>a(n)</strong> con términos <strong>3, 5, 7…</strong>, ¿cuánto vale <strong>a(4)</strong>?',
      expected: 9,
      hints: [
        'Recordá qué significa la notación funcional a(n): el número entre paréntesis indica la posición en la lista.',
        'Identificá a(1) = 3, a(2) = 5, a(3) = 7 y observá cuánto aumenta en cada posición.',
        'Aplicá esa variación constante al tercer término para calcular el de la cuarta posición.',
      ],
      solution: 'La notación a(4) significa «el cuarto término de la sucesión». Como cada paso suma 2, a(4) = 7 + 2 = <strong>9</strong>.',
    },
    {
      id: 'sec3-q2',
      competencyId: 'sequences.discrete_domain_and_notation',
      exerciseFamily: 'extend',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'interpret_predecessor_notation_a_n_minus_1',
      diagnosticIds: [],
      type: 'choice',
      prompt: 'Para cualquier número de término n, ¿qué representa la expresión matemática <strong>a(n − 1)</strong>?',
      options: [
        'El resultado de restarle 1 al valor numérico del término a(n).',
        'El término anterior al n-ésimo término en la sucesión.',
        'El primer término donde arranca la sucesión.',
        'La diferencia común entre los términos.',
      ],
      expected: 1,
      explanation: '¡Muy bien! (n − 1) indica la posición inmediatamente anterior a n. Por eso a(n − 1) es el término precedente.',
      hints: [
        'Fijate que el «− 1» está adentro del paréntesis junto al índice n, no afuera restando al valor.',
        'Probá con un valor concreto, por ejemplo n = 5: ¿qué posición representa a(5 − 1)?',
        'Como n − 1 es un lugar antes que n, a(n − 1) nombra al término ubicado justo detrás de a(n).',
      ],
      solution: 'La notación funcional a(n − 1) refiere al término cuyo índice es n − 1, es decir, el término que está justo un escalón antes que a(n).',
    },
  ],

  // CAPÍTULO 2
  'sec-4': [
    {
      id: 'sec4-q1',
      competencyId: 'sequences.recursive_formulas',
      exerciseFamily: 'recursive',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'evaluate_recursive_step_by_step',
      diagnosticIds: ['wrong_anchor_a2'],
      type: 'number',
      prompt: 'Encuentra <strong>b(4)</strong> en la sucesión recursiva dada por: <br><code>{ b(1) = −5 ; b(n) = b(n − 1) + 9 }</code>.',
      expected: 22,
      hints: [
        'Comenzá en el caso base b(1) = −5 y notá que la regla suma 9 en cada paso.',
        'Calculá en orden los escalones intermedios b(2) y b(3) a partir del término anterior.',
        'Sumá 9 al valor obtenido para b(3) y verificá la suma algebraica.',
      ],
      solution: 'b(1) = −5, b(2) = 4, b(3) = 13, b(4) = 13 + 9 = <strong>22</strong>.',
    },
    {
      id: 'sec4-q2',
      competencyId: 'sequences.recursive_formulas',
      exerciseFamily: 'recursive',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extract_recursive_k_and_negative_d',
      diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
      type: 'pair',
      prompt: 'Completa <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de la sucesión <strong>12, 7, 2…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: 12, d: -5 },
      hints: [
        'El parámetro k representa el caso base: es el primer número que aparece en la lista.',
        'Para hallar d, restá el segundo término menos el primero (cuidado con el signo cuando decrece).',
        'Comprobá que sumando ese d al segundo término se obtiene el tercero (2).',
      ],
      solution: 'El primer término es <strong>k = 12</strong>. La diferencia común es 7 − 12 = <strong>d = −5</strong>.',
    },
    {
      id: 'sec4-q3',
      competencyId: 'sequences.recursive_formulas',
      exerciseFamily: 'recursive',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extract_recursive_negative_k_and_d',
      diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
      type: 'pair',
      prompt: 'Completa <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de la sucesión <strong>−1, −4, −7…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: -1, d: -3 },
      hints: [
        'Leé el primer valor de la lista con su signo negativo para completar k = a(1).',
        'Para calcular d, planteá con paréntesis: segundo término menos primer término.',
        'Recordá que restar un número negativo equivale a sumar su opuesto.',
      ],
      solution: 'El primer término es <strong>k = −1</strong>. La diferencia común es <strong>d = −3</strong>.',
    },
  ],

  'sec-5a': [
    {
      id: 'sec5a-q1',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'arithmetic_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'identify_k_and_d_from_standard_form',
      diagnosticIds: ['swapped_k_step'],
      type: 'pair',
      prompt: 'En la fórmula explícita estándar <strong>f(n) = −6 + 2(n − 1)</strong>, ¿cuál es el primer término k y cuál la diferencia común d?',
      kLabel: 'k = f(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: -6, d: 2 },
      hints: [
        'Compará la expresión con la estructura estándar k + d(n − 1).',
        'Evaluá en n = 1 para confirmar qué término sobrevive cuando (n − 1) se anula.',
        'El número que multiplica al bloque (n − 1) es la diferencia común d.',
      ],
      solution: 'En la forma estándar k + d(n − 1), vemos directamente que <strong>k = −6</strong> y <strong>d = 2</strong>.',
    },
    {
      id: 'sec5a-q2',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'arithmetic_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'write_explicit_arithmetic_formula',
      diagnosticIds: ['off_by_one', 'sign_of_step', 'swapped_k_step', 'not_standard_but_equivalent'],
      type: 'expr',
      prompt: 'Escribe una fórmula explícita para la sucesión aritmética <strong>2, 9, 16…</strong>:',
      expected: {
        expr: '2 + 7*(n - 1)',
        kind: 'ari',
        k: 2,
        step: 7,
      },
      hints: [
        'Identificá primero el poste de partida k = a(1) al comienzo de la sucesión.',
        'Calculá la diferencia común d restando dos términos consecutivos.',
        'Armá la fórmula explícita multiplicando d por los (n − 1) saltos desde k.',
      ],
      solution: 'k = 2 y d = 7. La fórmula explícita estándar es: <strong>2 + 7(n − 1)</strong> (o simplificada −5 + 7n).',
    },
    {
      id: 'sec5a-q3',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'arithmetic_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'teletransport_to_124th_term',
      diagnosticIds: ['off_by_one', 'sign_of_step'],
      type: 'number',
      prompt: 'Encuentra el <strong>124.º término</strong> de la sucesión aritmética <strong>199, 196, 193…</strong>:',
      expected: -170,
      hints: [
        'Identificá el primer término k = 199 y el signo negativo de la diferencia común d.',
        'Para llegar del poste 1 al poste 124 se realizan exactamente (124 − 1) saltos.',
        'Multiplicá la diferencia d por esa cantidad de saltos y sumala al valor inicial 199.',
      ],
      solution: 'a(124) = 199 + (−3) · (124 − 1) = 199 + (−3) · 123 = 199 − 369 = <strong>−170</strong>.',
    },
  ],

  'sec-5b': [
    {
      id: 'sec5b-q1',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'membership_solve',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'solve_index_n_from_target_value',
      diagnosticIds: ['off_by_one'],
      type: 'number',
      prompt: 'La fórmula explícita de una sucesión es <strong>a(n) = 3 − 4(n − 1)</strong>. ¿Qué número de término es igual a <strong>−65</strong>?',
      expected: 18,
      hints: [
        'Igualá la fórmula al valor buscado: 3 − 4(n − 1) = −65.',
        'Restá 3 a ambos lados y luego dividí por −4 para despejar la cantidad de saltos (n − 1).',
        'Recordá sumar 1 al valor obtenido para (n − 1) y así encontrar el índice n.',
      ],
      solution: '−68 = −4(n − 1) ⟹ n − 1 = 17 ⟹ n = 17 + 1 = <strong>18</strong>.',
    },
    {
      id: 'sec5b-q2',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'arithmetic_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'find_d_between_a1_and_a10',
      diagnosticIds: ['off_by_one'],
      type: 'number',
      prompt: 'El primer término de una sucesión aritmética es <strong>5</strong> y el décimo término es <strong>59</strong>. ¿Cuál es la diferencia común d?',
      expected: 6,
      hints: [
        'Entre el primer poste y el décimo poste hay exactamente 10 − 1 saltos.',
        'Calculá cuánto subió en total la sucesión entre a(1) = 5 y a(10) = 59.',
        'Dividí esa distancia total por el número de saltos para obtener el tamaño de cada salto d.',
      ],
      solution: 'd = (59 − 5) / (10 − 1) = 54 / 9 = <strong>6</strong>.',
    },
  ],

  'sec-6': [
    {
      id: 'sec6-q1',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extract_a1_and_d_from_simplified_form',
      diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
      type: 'pair',
      prompt: 'Dada la fórmula simplificada <strong>a(n) = 10 + 2n</strong>, ¿cuánto valen el primer término a(1) y la diferencia común d?',
      kLabel: 'a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 12, d: 2 },
      hints: [
        'Cuidado: 10 no es el primer término porque esta fórmula no está escrita con (n − 1).',
        'Evaluá explícitamente a(1) sustituyendo n = 1 en la expresión.',
        'Observá cuánto cambia la fórmula cada vez que n aumenta en 1 (el coeficiente de n).',
      ],
      solution: 'a(1) = 10 + 2(1) = <strong>12</strong>. La diferencia común es el coeficiente de n: <strong>d = 2</strong>.',
    },
    {
      id: 'sec6-q2',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'simplify_arithmetic_formula_without_parentheses',
      diagnosticIds: ['off_by_one', 'not_standard_but_equivalent'],
      type: 'expr',
      prompt: 'Escribe la fórmula equivalente simplificada (sin paréntesis) de <strong>−5, −1, 3, 7…</strong>:',
      expected: {
        expr: '-9 + 4n',
        kind: 'ari',
        k: -5,
        step: 4,
      },
      hints: [
        'Identificá primero el primer término k = −5 y la diferencia común d = 4 para armar la forma estándar.',
        'Aplicá propiedad distributiva para eliminar los paréntesis de (n − 1).',
        'Agrupá las constantes numéricas para llegar a la forma simplificada c₀ + d·n.',
      ],
      solution: '−5 + 4(n − 1) = −5 + 4n − 4 = <strong>−9 + 4n</strong> (o 4n − 9).',
    },
  ],

  'sec-7': [
    {
      id: 'sec7-q1',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'rosetta_standard_explicit_to_recursive_positive',
      diagnosticIds: ['swapped_k_step'],
      type: 'pair',
      prompt: 'Convierte la fórmula estándar <strong>a(n) = 5 + 12(n − 1)</strong> a su forma recursiva <code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>:',
      kLabel: 'k',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 5, d: 12 },
      hints: [
        'Compará con el molde estándar k + d(n − 1).',
        'Evaluá en n = 1 para verificar cuál número es el caso base k = a(1).',
        'El factor que multiplica a (n − 1) coincide con el paso aditivo d de la recursión.',
      ],
      solution: '<strong>k = 5</strong> y <strong>d = 12</strong>.',
    },
    {
      id: 'sec7-q2',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'rosetta_standard_explicit_to_recursive_negative',
      diagnosticIds: ['sign_of_step', 'swapped_k_step'],
      type: 'pair',
      prompt: 'Convierte <strong>a(n) = −11 − 8(n − 1)</strong> a recursiva:',
      kLabel: 'k',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: -11, d: -8 },
      hints: [
        'Atención a los signos negativos de ambos parámetros en la estructura k + d(n − 1).',
        'El valor que sobrevive en n = 1 es el término inicial k = a(1).',
        'La resta − 8(n − 1) equivale a sumar una diferencia d negativa en cada paso.',
      ],
      solution: '<strong>k = −11</strong> y <strong>d = −8</strong>.',
    },
    {
      id: 'sec7-q3',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'rosetta_simplified_explicit_to_recursive_1',
      diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
      type: 'pair',
      prompt: 'Convierte la fórmula simplificada <strong>a(n) = 1 + 4n</strong> a su forma recursiva:',
      kLabel: 'k = a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 5, d: 4 },
      hints: [
        'Como no tiene (n − 1), el 1 no es el primer término.',
        'Calculá a(1) sustituyendo n = 1 en la fórmula para hallar el caso base k.',
        'La diferencia común d es el coeficiente que multiplica a n.',
      ],
      solution: 'a(1) = 1 + 4 = <strong>5</strong>, y <strong>d = 4</strong>.',
    },
    {
      id: 'sec7-q4',
      competencyId: 'sequences.arithmetic_explicit_and_membership',
      exerciseFamily: 'rosetta_arithmetic',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'rosetta_simplified_explicit_to_recursive_2',
      diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
      type: 'pair',
      prompt: 'Convierte la fórmula simplificada <strong>a(n) = 23 − 6n</strong> a su forma recursiva:',
      kLabel: 'k = a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 17, d: -6 },
      hints: [
        'Como la fórmula está simplificada, necesitás evaluar n = 1 para conocer a(1).',
        'Calculá 23 − 6(1) para determinar el arranque k.',
        'Leé el coeficiente de n con su signo incluido para obtener la diferencia d.',
      ],
      solution: 'a(1) = 23 − 6 = <strong>17</strong>, y <strong>d = −6</strong>.',
    },
  ],

  // CAPÍTULO 3
  'sec-8': [
    {
      id: 'sec8-q1',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'geometric_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extend_geometric_sequence_fractional_start',
      diagnosticIds: ['sign_of_step'],
      type: 'number',
      prompt: '¿Cuál es el siguiente término en la sucesión geométrica <strong>1/2, 2, 8, [___]</strong>?',
      expected: 32,
      hints: [
        'Dividí el segundo término por el primero: 2 / (1/2) y comprobá el cociente 8 / 2.',
        'Confirmá que la sucesión multiplica por una razón constante r en cada salto.',
        'Multiplicá el último término conocido (8) por esa razón común.',
      ],
      solution: 'La razón común es r = 4. Por lo tanto: 8 × 4 = <strong>32</strong>.',
    },
    {
      id: 'sec8-q2',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'geometric_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'extract_geometric_recursive_k_and_r',
      diagnosticIds: ['wrong_anchor_a2'],
      type: 'pair',
      prompt: 'Encuentra <strong>k</strong> y <strong>r</strong> en la fórmula recursiva de <strong>1/2, 2, 8…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) · r }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'r (razón)',
      kind: 'geo',
      expected: { k: 0.5, r: 4 },
      hints: [
        'El parámetro k es el primer término de la lista (podés expresarlo en decimal como 0,5).',
        'Para hallar la razón r, dividí cualquier término por su inmediato anterior.',
        'Verificá que multiplicando el segundo término por r obtengas el tercero (8).',
      ],
      solution: '<strong>k = 0,5</strong> (o 1/2) y <strong>r = 4</strong>.',
    },
    {
      id: 'sec8-q3',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'geometric_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'write_decreasing_geometric_explicit',
      diagnosticIds: ['exponent_n', 'wrong_anchor_a2'],
      type: 'expr',
      prompt: 'Escribe una fórmula explícita estándar para <strong>54, 18, 6…</strong>:',
      expected: {
        expr: '54 * (1/3)^(n - 1)',
        kind: 'geo',
        k: 54,
        step: 1 / 3,
      },
      hints: [
        'Identificá el primer término k = a(1) al inicio de la lista.',
        'Dividir por 3 en cada paso equivale a multiplicar por una razón fraccionaria menor que 1.',
        'Escribí la fórmula estándar k · r^(n − 1) usando paréntesis alrededor de la fracción.',
      ],
      solution: 'k = 54 y r = 1/3. La fórmula explícita estándar es: <strong>54 · (1/3)^(n − 1)</strong>.',
    },
    {
      id: 'sec8-q4',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'geometric_explicit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'write_increasing_geometric_explicit',
      diagnosticIds: ['exponent_n', 'wrong_anchor_a2'],
      type: 'expr',
      prompt: 'Escribe una fórmula explícita para <strong>1/2, 2, 8…</strong>:',
      expected: {
        expr: '1/2 * 4^(n - 1)',
        kind: 'geo',
        k: 0.5,
        step: 4,
      },
      hints: [
        'Identificá el primer término k = 1/2 y calculá la razón r = a(2) / a(1).',
        'En el primer término (n = 1), la razón se multiplica 0 veces: el exponente es (n − 1).',
        'Combiná k y r en la estructura k · r^(n − 1).',
      ],
      solution: 'Fórmula estándar: <strong>1/2 · 4^(n − 1)</strong> (o equivalente 1/8 · 4^n).',
    },
  ],

  'sec-9': [
    {
      id: 'sec9-q1',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'alternating_parentheses',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'write_alternating_geometric_with_parentheses',
      diagnosticIds: ['neg_pow_precedence', 'exponent_n'],
      type: 'expr',
      prompt: 'Dada la definición recursiva: <code>{ a(1) = 8 ; a(n) = a(n − 1) · (−5) }</code>, escribe su fórmula explícita estándar:',
      expected: {
        expr: '8 * (-5)^(n - 1)',
        kind: 'geo',
        k: 8,
        step: -5,
        requireStandard: true,
      },
      hints: [
        'Leé el caso base k = a(1) y la razón negativa r = −5 desde la definición recursiva.',
        'Recordá que en la forma estándar el exponente es (n − 1) para que en n = 1 dé exponente cero.',
        'Encerrá la base negativa entre paréntesis (−5) antes de elevarla a la potencia para respetar la jerarquía.',
      ],
      solution: 'Fórmula correcta: <strong>8 · (−5)^(n − 1)</strong>.',
    },
    {
      id: 'sec9-q2',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'alternating_parentheses',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'evaluate_alternating_geometric_a4',
      diagnosticIds: ['neg_pow_precedence'],
      type: 'number',
      prompt: 'Calcula el valor numérico exacto de <strong>a(4)</strong> para esa misma sucesión:',
      expected: -1000,
      hints: [
        'Reemplazá n = 4 en la fórmula estándar: la base negativa queda elevada al exponente (4 − 1) = 3.',
        'Calculá primero la potencia (−5)³ prestando atención al signo de un exponente impar.',
        'Multiplicá el resultado de esa potencia por el término inicial a(1) = 8.',
      ],
      solution: 'a(4) = 8 · (−5)³ = 8 · (−125) = <strong>−1000</strong>.',
    },
  ],

  'sec-10': [
    {
      id: 'sec10-q1',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'compound_growth',
      representation: REPRESENTATION_TYPES.VERBAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'classify_compound_interest_growth',
      diagnosticIds: [],
      type: 'choice',
      prompt: 'Caden deposita <strong>$70</strong> y cada año gana el <strong>10%</strong> sobre su saldo acumulado. ¿Cómo se clasifica el saldo año a año?',
      options: [
        'Sucesión aritmética: suma $10 fijos cada año',
        'Sucesión geométrica: multiplica por r = 1,10 cada año',
        'Sucesión geométrica: multiplica por r = 0,10 cada año',
      ],
      expected: 1,
      explanation: '¡Exacto! Conservar el 100% más el 10% de ganancia equivale al factor multiplicador (1 + 0,10) = 1,10.',
      hints: [
        'El 10% se calcula sobre el saldo acumulado del año anterior, no como un monto fijo en pesos.',
        'Planteá: Saldo nuevo = Saldo previo + 0,10 · Saldo previo.',
        'Sacá factor común Saldo previo para distinguir entre 0,10 (solo ganancia) y 1 + 0,10 (capital + ganancia).',
      ],
      solution: 'Es una sucesión geométrica con factor multiplicador <strong>r = 1,10</strong>.',
    },
    {
      id: 'sec10-q2',
      competencyId: 'sequences.geometric_explicit_and_models',
      exerciseFamily: 'compound_growth',
      representation: REPRESENTATION_TYPES.VERBAL,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'extract_compound_interest_k_and_r',
      diagnosticIds: [],
      type: 'pair',
      prompt: 'Completa <strong>k = a(1)</strong> y la razón común <strong>r</strong> para la cuenta de Caden:',
      kLabel: 'k = Saldo año 1',
      stepLabel: 'r = Factor anual',
      kind: 'geo',
      expected: { k: 70, r: 1.1 },
      hints: [
        'El depósito inicial del año 1 determina directamente k = a(1).',
        'Para el factor multiplicativo r, sumá el 100% original (1) más el 10% anual (0,10).',
        'Comprobá que multiplicar k por r produce un saldo mayor que el inicial ($77 en el año 2).',
      ],
      solution: '<strong>k = 70</strong> y <strong>r = 1,1</strong>.',
    },
  ],

  'sec-11': [
    {
      id: 'sec11-q1',
      competencyId: 'sequences.asymptotic_behavior_intuition',
      exerciseFamily: 'asymptotic_limit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'asymptotic_limit_decaying_geometric',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Para la sucesión geométrica <strong>64, 16, 4, 1, 1/4…</strong>, ¿hacia qué número tienden los términos a medida que n tiende a infinito (<strong>lim n→∞ a(n)</strong>)?',
      expected: 0,
      hints: [
        'Observá la tendencia de la lista: 64, 16, 4, 1, 0,25, 0,0625, 0,0156…',
        'Cada término positivo es la cuarta parte del anterior, haciéndose cada vez más pequeño sin volverse negativo.',
        'Preguntate a qué valor frontera se acercan indefinidamente números positivos cada vez más diminutos.',
      ],
      solution: 'Como la razón es 1/4 (|r| < 1), los términos se achican indefinidamente aproximándose a <strong>0</strong>.',
    },
    {
      id: 'sec11-q2',
      competencyId: 'sequences.asymptotic_behavior_intuition',
      exerciseFamily: 'asymptotic_limit',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'convergence_condition_abs_r_lt_1',
      diagnosticIds: [],
      type: 'choice',
      prompt: '¿Para qué valores de la razón común r una sucesión geométrica converge a 0 cuando n → ∞?',
      options: [
        'Para cualquier r > 1',
        'Únicamente cuando r es un número entero positivo',
        'Cuando el valor absoluto de r es menor a 1 (|r| < 1, es decir −1 < r < 1)',
        'Cuando r es negativa menor a −1',
      ],
      expected: 2,
      explanation: '¡Perfecto! Cuando |r| < 1, elevar r a potencias cada vez mayores produce fracciones cada vez más pequeñas que tienden a 0.',
      hints: [
        'Compará qué sucede con potencias grandes de un número como 2ⁿ frente a (1/2)ⁿ.',
        'Pensá también qué ocurre si r es negativo pero con tamaño pequeño, como (−1/2)ⁿ.',
        'La condición requiere que la magnitud |r| achique el término en cada multiplicación.',
      ],
      solution: 'Una sucesión geométrica converge a 0 si y solo si <strong>|r| &lt; 1</strong>.',
    },
  ],
};

/* ---------- Arquitectura de Pizarrón Escolar (Modo Pizarrón) ---------- */

export const LESSON_SECTIONS = [
  { id: 'sec-1', chapter: 'Capítulo 1', title: '¿Qué es una sucesión?', short: '1. ¿Qué es una sucesión?' },
  { id: 'sec-2', chapter: 'Capítulo 1', title: 'Aritmética y diferencia común', short: '2. Aritmética y dif. común' },
  { id: 'sec-3', chapter: 'Capítulo 1', title: 'Función y Dominio ℕ', short: '3. Dominio discreto ℕ' },
  { id: 'sec-4', chapter: 'Capítulo 2', title: 'La escalera recursiva', short: '4. Escalera recursiva' },
  { id: 'sec-5a', chapter: 'Capítulo 2', title: 'El teletransportador explícito', short: '5A. Teletransportador' },
  { id: 'sec-5b', chapter: 'Capítulo 2', title: 'Despejes y puentes', short: '5B. Despejes y puentes' },
  { id: 'sec-6', chapter: 'Capítulo 2', title: 'Fórmulas equivalentes', short: '6. Fórmulas equivalentes' },
  { id: 'sec-7', chapter: 'Capítulo 2', title: 'La Piedra de Rosetta', short: '7. Piedra de Rosetta' },
  { id: 'sec-8', chapter: 'Capítulo 3', title: 'El espejo multiplicativo', short: '8. Espejo multiplicativo' },
  { id: 'sec-9', chapter: 'Capítulo 3', title: 'Radar de la razón r', short: '9. Radar de la razón r' },
  { id: 'sec-10', chapter: 'Capítulo 3', title: 'Modelado: Ahorro vs Interés', short: '10. Ahorro vs Interés' },
  { id: 'sec-11', chapter: 'Capítulo 3', title: 'Hacia el infinito (Límite)', short: '11. Límite al infinito' },
  { id: 'sec-retos', chapter: 'Capítulo 4', title: 'Entrenador de semillas y Trampas', short: 'Entrenador y Trampas' },
  { id: 'sec-repaso', chapter: 'Capítulo 4', title: 'Hoja de Repaso Imprimible', short: 'Hoja de Repaso' },
];

export function initBlackboardController() {
  const contentEl = document.querySelector('.seq-content');
  if (!contentEl) return;

  let isBlackboardMode = true;
  let currentSectionId = 'sec-1';

  // Toolbar superior de pizarrón
  const badgeEl = h('span', { class: 'seq-blackboard-toolbar__badge', id: 'seq-board-badge' }, 'Pizarrón 1 de 14');
  const titleEl = h('strong', { id: 'seq-board-title' }, '¿Qué es una sucesión?');
  const modeBtn = h('button', {
    type: 'button',
    class: 'chip',
    id: 'seq-mode-toggle',
    title: 'Alternar entre ver un pizarrón enfocado a la vez o toda la lección continua',
  }, 'Pizarrón por lección (activo)');

  modeBtn.addEventListener('click', () => {
    isBlackboardMode = !isBlackboardMode;
    contentEl.classList.toggle('mode-blackboard', isBlackboardMode);
    modeBtn.textContent = isBlackboardMode
      ? 'Pizarrón por lección (activo)'
      : 'Pizarra continua (ver todo)';
    modeBtn.classList.toggle('chip--ghost', !isBlackboardMode);

    if (isBlackboardMode) {
      setActiveBoard(currentSectionId, { scroll: true, updateHash: true });
    } else {
      const activeEl = document.getElementById(currentSectionId);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  const toolbarEl = h('div', { class: 'seq-blackboard-toolbar', id: 'seq-board-toolbar' },
    h('div', { class: 'seq-blackboard-toolbar__info' }, badgeEl, titleEl),
    h('div', { class: 'seq-blackboard-toolbar__actions' }, modeBtn)
  );

  contentEl.prepend(toolbarEl);
  initLessonDock();
  contentEl.classList.add('mode-blackboard');

  function setActiveBoard(secId, { scroll = true, updateHash = true } = {}) {
    const secInfo = LESSON_SECTIONS.find((s) => s.id === secId);
    if (!secInfo) return;
    currentSectionId = secId;

    // Conmutación de visibilidad en secciones
    LESSON_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) el.classList.toggle('is-active', s.id === secId);
    });

    // Sincronización de enlaces de la barra lateral
    qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.sec === secId);
    });

    // Actualización de títulos en barra superior
    const idx = LESSON_SECTIONS.findIndex((s) => s.id === secId);
    badgeEl.textContent = `Pizarrón ${idx + 1} de ${LESSON_SECTIONS.length}`;
    titleEl.textContent = `${secInfo.chapter} · ${secInfo.title}`;

    if (updateHash && window.location.hash !== `#${secId}`) {
      history.replaceState(null, '', `#${secId}`);
    }

    if (scroll) {
      const targetEl = document.getElementById(secId);
      if (targetEl) {
        const yOffset = -24;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }

  // Bandeja de tizas inferior en cada sección
  LESSON_SECTIONS.forEach((secInfo, idx) => {
    const secEl = document.getElementById(secInfo.id);
    if (!secEl) return;

    const prevInfo = idx > 0 ? LESSON_SECTIONS[idx - 1] : null;
    const nextInfo = idx < LESSON_SECTIONS.length - 1 ? LESSON_SECTIONS[idx + 1] : null;

    const btnPrev = prevInfo
      ? h('button', {
          type: 'button',
          class: 'chip seq-chalk-tray__btn',
          on: { click: () => setActiveBoard(prevInfo.id) },
        }, `← ${prevInfo.short}`)
      : h('span', { class: 'muted small' }, 'Primer pizarrón');

    const infoText = h('span', { class: 'seq-chalk-tray__info' },
      `Pizarrón ${idx + 1} de ${LESSON_SECTIONS.length} · ${secInfo.chapter}`
    );

    const btnNext = nextInfo
      ? h('button', {
          type: 'button',
          class: 'btn seq-chalk-tray__btn',
          on: { click: () => setActiveBoard(nextInfo.id) },
        }, `${nextInfo.short} →`)
      : h('button', {
          type: 'button',
          class: 'btn seq-chalk-tray__btn',
          on: { click: () => setActiveBoard(LESSON_SECTIONS[0].id) },
        }, 'Volver al Inicio ↑');

    const trayEl = h('div', { class: 'seq-chalk-tray' },
      btnPrev,
      infoText,
      btnNext
    );

    secEl.append(trayEl);
  });

  // Interceptar clics en los enlaces de la barra lateral
  qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const secId = link.dataset.sec;
      if (secId && isBlackboardMode) {
        e.preventDefault();
        setActiveBoard(secId, { scroll: true, updateHash: true });
      }
    });
  });

  // Escuchar cambios de hash (Back/Forward del navegador)
  window.addEventListener('hashchange', () => {
    const hashId = window.location.hash.slice(1);
    if (hashId && LESSON_SECTIONS.some((s) => s.id === hashId)) {
      setActiveBoard(hashId, { scroll: true, updateHash: false });
    }
  });

  // Navegación accesible por teclado (Flechas izquierda / derecha)
  window.addEventListener('keydown', (e) => {
    if (!isBlackboardMode) return;
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      const idx = LESSON_SECTIONS.findIndex((s) => s.id === currentSectionId);
      if (idx < LESSON_SECTIONS.length - 1) {
        e.preventDefault();
        setActiveBoard(LESSON_SECTIONS[idx + 1].id, { scroll: true, updateHash: true });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      const idx = LESSON_SECTIONS.findIndex((s) => s.id === currentSectionId);
      if (idx > 0) {
        e.preventDefault();
        setActiveBoard(LESSON_SECTIONS[idx - 1].id, { scroll: true, updateHash: true });
      }
    }
  });

  // Activación inicial respetando hash o arrancando en sec-1
  const initialHash = window.location.hash.slice(1);
  const startSec = LESSON_SECTIONS.some((s) => s.id === initialHash) ? initialHash : 'sec-1';
  setActiveBoard(startSec, { scroll: false, updateHash: false });
}

// Inicializar disparadores de Visual Novel
function initVNTriggers() {
  qsa('.vn-trigger[data-vn-script]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scriptId = btn.dataset.vnScript;
      if (VN_SCRIPTS[scriptId]) {
        playScript(VN_SCRIPTS[scriptId]);
      }
    });
  });
}

export function initSucesionesPage() {
  if (typeof document === 'undefined') return;

  renderNav();

  if (typeof localStorage !== 'undefined' && isMigrationNeeded(localStorage)) {
    migrateLegacyProgress(localStorage);
  }
  initSeqLearning();

  const an4 = document.getElementById('annotated-sec-4') || document.querySelector('[data-annotated="sec-4"]');
  if (an4) annotatedFormula(an4, { type: 'recursive', seqName: 'a', k: 3, step: 2, kind: 'ari' });

  const an5a = document.getElementById('annotated-sec-5a') || document.querySelector('[data-annotated="sec-5a"]');
  if (an5a) annotatedFormula(an5a, { type: 'explicit', seqName: 'a', k: 3, step: 2, kind: 'ari' });

  const an8 = document.getElementById('annotated-sec-8') || document.querySelector('[data-annotated="sec-8"]');
  if (an8) annotatedFormula(an8, { type: 'explicit', seqName: 'a', k: 54, step: 1 / 3, stepStr: '1/3', kind: 'geo' });

  // Capítulo 1
  const patronContainer = document.querySelector('[data-widget="patron"]');
  if (patronContainer) initPatronWidget(patronContainer);

  const detectiveContainer = document.querySelector('[data-widget="detective"]');
  if (detectiveContainer) initDetectiveWidget(detectiveContainer);

  const funcionContainer = document.querySelector('[data-widget="funcion"]');
  if (funcionContainer) initFuncionWidget(funcionContainer);

  // Capítulo 2
  const escaleraContainer = document.querySelector('[data-widget="escalera"]');
  if (escaleraContainer) initEscaleraWidget(escaleraContainer);

  const teletransportadorContainer = document.querySelector('[data-widget="teletransportador"]');
  if (teletransportadorContainer) initTeletransportadorWidget(teletransportadorContainer);

  const alRevesContainer = document.querySelector('[data-widget="al-reves"]');
  if (alRevesContainer) initAlRevesWidget(alRevesContainer);

  const equivalentesContainer = document.querySelector('[data-widget="equivalentes"]');
  if (equivalentesContainer) initEquivalentesWidget(equivalentesContainer);

  const rosettaContainer = document.querySelector('[data-widget="rosetta"]');
  if (rosettaContainer) initRosettaWidget(rosettaContainer);

  // Capítulo 3
  const geomModoContainer = document.querySelector('[data-widget="geometrica-modo"]');
  if (geomModoContainer) initGeometricaModoWidget(geomModoContainer);

  const razonContainer = document.querySelector('[data-widget="razon"]');
  if (razonContainer) initRazonWidget(razonContainer);

  const compararContainer = document.querySelector('[data-widget="comparar"]');
  if (compararContainer) initCompararWidget(compararContainer);

  const limiteContainer = document.querySelector('[data-widget="limite"]');
  if (limiteContainer) initLimiteWidget(limiteContainer);

  // Capítulo 4
  const retosContainer = document.querySelector('[data-widget="retos"]');
  if (retosContainer) initRetosModule(retosContainer);

  let dashboardCtrl = null;
  const dashSlot = byId('seq-competency-dashboard');
  if (dashSlot) {
    dashboardCtrl = mountCompetencyDashboard(dashSlot, {
      onNavigateSection(secId) {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${secId}"]`);
        if (link) {
          link.click();
        } else if (typeof window !== 'undefined') {
          window.location.hash = `#${secId}`;
        }
      },
      onPracticeFamily(family) {
        const retosLink = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
        if (retosLink) retosLink.click();
        const retosWidget = document.querySelector('[data-widget="retos"]');
        const familyBtn = retosWidget?.querySelector(`button[data-family="${family}"]`);
        if (familyBtn) familyBtn.click();
      },
    });
  }

  // Montaje de Chequeos
  Object.entries(CHECKS_DATA).forEach(([secId, questions]) => {
    const slot = document.querySelector(`[data-check="${secId}"]`);
    if (slot) {
      createCheckBlock(slot, questions, secId, () => {
        updateSidebarProgress();
        dashboardCtrl?.refresh?.();
      });
    }
  });

  updateSidebarProgress();
  initScrollSpy();
  initBlackboardController();
  initVNTriggers();
}

if (typeof document !== 'undefined') {
  initSucesionesPage();
}

export {
  SEQ_COMPETENCIES,
  SEQ_DIAGNOSTIC_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
  getCompetencyReport,
  getSeqCompetencyReport,
  mountCompetencyDashboard,
  PROGRESS_KEY,
  getProgress,
  saveSectionProgress,
  recordCompetencyAttempt,
};
