/**
 * index.js — Punto de entrada del Laboratorio de Valor Absoluto y Funciones por Partes.
 * Inicializa navegación, pizarrones cartesianos, 10 widgets interactivos,
 * chequeos con diagnóstico cognitivo, Modo Pizarrón y progreso en localStorage.
 */

import { byId, qsa, h, mount, chalkIcon } from '../../core/dom.js';
import { renderNav, initLessonDock } from '../../core/nav.js';
import {
  REPRESENTATION_TYPES,
  LEARNING_STAGES,
  TRANSFER_DISTANCES,
} from '../../core/learning/events.js';
import { isMigrationNeeded, migrateLegacyProgress } from '../../core/learning/migrations.js';
import {
  createCheckBlock,
  annotatedAbsFormula,
  piecewiseBrace,
  PROGRESS_KEY,
  getProgress,
  saveSectionProgress,
  recordCompetencyAttempt,
  getCompetencyReport,
  mountCompetencyDashboard,
} from './components.js';
import {
  ABS_COMPETENCIES,
  ABS_DIAGNOSTIC_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
} from './competencies-map.js';
import { initAbsLearning, getAbsCompetencyReport } from './learning-adapter.js';

// Widgets Capítulo 1: El Origen Físico: Distancia y Espejo
import { initDistancia1DWidget } from './widgets/distancia-1d.js';
import { initEspejoCartesianoWidget } from './widgets/espejo-cartesiano.js';
import { initTraslacionVHWidget } from './widgets/traslacion-vh.js';

// Widgets Capítulo 2: Transformaciones Dinámicas f(x) = a|x - h| + k
import { initEscaladoRamaWidget } from './widgets/escalado-rama.js';
import { initConstructorVWidget } from './widgets/constructor-v.js';
import { initDesarmadorBarrasWidget } from './widgets/desarmador-barras.js';
import { initRadiografiaAbsWidget } from './widgets/radiografia-abs.js';

// Widgets Capítulo 3: Funciones Definidas por Partes y Escalones
import { initAduanaPartesWidget } from './widgets/aduana-partes.js';
import { initEditorTramosWidget } from './widgets/editor-tramos.js';
import { initEscalonadaPasoWidget } from './widgets/escalonada-paso.js';

// Capítulo 4: Entrenador de Semillas, 5 Trampas y Boss «Escudo Deflector V»
import { initRetosAbsModule } from './retos.js';

// Sistema Visual Novel (Modo Alaska)
import { playScript } from '../../core/vn.js';
import { VN_SCRIPTS } from './vn-scripts.js';

/* ---------- Gestión de Progreso y Sidebar ---------- */
const TOTAL_SECTIONS = 10;
const SECTION_KEY_REGEX = /^sec-(?:[1-9]|10)$/;

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
        mount(statusEl);
        statusEl.classList.remove('is-done');
      }
    }
  });
}

function initScrollSpy() {
  const links = qsa('.seq-sidebar__link[data-sec]');
  const sections = links.map((l) => document.getElementById(l.dataset.sec)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
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

/* ---------- Bancos de Preguntas de Chequeo (Khan Academy + Exactas) ---------- */

export const CHECKS_DATA = {
  // CAPÍTULO 1
  'sec-1': [
    {
      id: 'sec1-q1',
      competencyId: 'abs.distance_1d_and_equations',
      prerequisiteIds: [],
      exerciseFamily: 'resolver_modulo',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'numerical_distance_evaluation',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Calculá la distancia en la recta numérica entre los puntos <strong>x = −5</strong> y <strong>h = 4</strong>: ¿cuánto vale <strong>|(−5) − 4|</strong>?',
      expected: 9,
      hints: [
        'Identificá el orden de operaciones: primero resolvé la resta dentro de las barras.',
        'Al restar 4 a un número negativo (−5), te desplazás 4 lugares más hacia la izquierda en la recta.',
        'El valor absoluto mide una longitud sin signo: tomá la magnitud positiva del entero que obtuviste adentro.',
      ],
      solution: 'Adentro de las barras tenemos (−5) − 4 = −9. Al tomar valor absoluto obtenemos |−9| = <strong>9</strong> unidades de distancia.',
    },
    {
      id: 'sec1-q2',
      competencyId: 'abs.distance_1d_and_equations',
      prerequisiteIds: [],
      exerciseFamily: 'resolver_modulo',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'distance_equation_interpretation',
      diagnosticIds: [],
      type: 'choice',
      prompt: '¿Qué representa geométricamente la ecuación con valor absoluto <strong>|x − 3| = 5</strong> en la recta numérica?',
      options: [
        'Únicamente el número x = 8, porque el valor absoluto elimina los negativos.',
        'Todos los números x que están a exactamente 5 unidades de distancia del punto 3 (es decir, x = 8 y x = −2).',
        'Todos los números x cuya distancia al origen 0 es igual a 2.',
        'No tiene solución porque adentro de las barras hay una resta.',
      ],
      expected: 1,
      explanation: '¡Exacto! |x − 3| mide la distancia al ancla h = 3. Estar a 5 pasos del 3 te lleva a 3 + 5 = 8 (derecha) y a 3 − 5 = −2 (izquierda).',
      hints: [
        'Recordá que |x − h| se lee como «la distancia entre x y el centro h».',
        'Identificá el centro h que aparece restando dentro de las barras.',
        'Desde ese centro, una distancia fija se alcanza caminando esa cantidad de pasos hacia ambos lados de la recta.',
      ],
      solution: '|x − 3| = 5 significa «distancia de x al 3 igual a 5». Las dos soluciones simétricas respecto a h = 3 son x = 3 + 5 = <strong>8</strong> y x = 3 − 5 = <strong>−2</strong>.',
    },
    {
      id: 'sec1-q3',
      competencyId: 'abs.distance_1d_and_equations',
      prerequisiteIds: [],
      exerciseFamily: 'resolver_modulo',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'symmetric_two_branch_solution',
      diagnosticIds: [],
      type: 'pair',
      prompt: 'Hallá las dos soluciones de la ecuación de distancia <strong>|x + 2| = 6</strong> (ordenalas de menor a mayor):',
      firstLabel: 'x₁ (menor)',
      secondLabel: 'x₂ (mayor)',
      expected: { first: -8, second: 4 },
      hints: [
        'Reescribí |x + 2| como |x − (−2)| para identificar el punto de ancla h.',
        'La ecuación pide todos los números cuya distancia a ese centro es exactamente 6.',
        'Restá 6 al centro para obtener la solución menor y sumale 6 para obtener la mayor.',
      ],
      solution: 'El centro está en h = −2. Moviéndonos 6 unidades hacia cada lado obtenemos x₁ = −2 − 6 = <strong>−8</strong> y x₂ = −2 + 6 = <strong>4</strong>.',
    },
  ],

  'sec-2': [
    {
      id: 'sec2-q1',
      competencyId: 'abs.cartesian_mirror_parent',
      prerequisiteIds: ['abs.distance_1d_and_equations'],
      exerciseFamily: 'ecuacion_desde_grafica',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'parent_abs_point_evaluation',
      diagnosticIds: ['missing_abs_bars'],
      type: 'number',
      prompt: 'Si la función madre es <strong>f(x) = |x|</strong>, ¿cuánto vale la salida <strong>f(−7)</strong>?',
      expected: 7,
      hints: [
        'En la recta identidad y = x, evaluá primero qué altura correspondería al signo del argumento x = −7.',
        'Recordá que el espejo del eje X refleja hacia arriba los tramos que quedarían por debajo del eje horizontal.',
        'El resultado mide la distancia entre −7 y el origen 0, por lo que debe ser positivo.',
      ],
      solution: 'Al evaluar f(−7) = |−7|, el espejo del eje X refleja la altura negativa hacia arriba: <strong>f(−7) = 7</strong>.',
    },
    {
      id: 'sec2-q2',
      competencyId: 'abs.cartesian_mirror_parent',
      prerequisiteIds: ['abs.distance_1d_and_equations'],
      exerciseFamily: 'ecuacion_desde_grafica',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'piecewise_slope_change_explanation',
      diagnosticIds: ['missing_abs_bars'],
      type: 'choice',
      prompt: '¿Por qué la gráfica de <strong>f(x) = |x|</strong> tiene un «quiebre» (vértice en punta) en el origen <strong>(0, 0)</strong> en lugar de seguir bajando como una recta?',
      options: [
        'Porque en x = 0 la función no está definida y tiene una asíntota.',
        'Porque para x < 0 la función vale constantemente 0.',
        'Porque para x < 0 la recta y = x intenta cruzar hacia alturas negativas, pero las barras invierten su signo transformando ese tramo en la semirrecta y = −x de pendiente −1.',
        'Porque las barras elevan los números al cuadrado como una parábola.',
      ],
      expected: 2,
      explanation: '¡Clarísimo! A la derecha de 0 actúa y = x (pendiente +1) y a la izquierda actúa y = −x (pendiente −1). El cambio brusco de pendiente en x = 0 forma la «V».',
      hints: [
        'Compará la fórmula cuando x ≥ 0 frente a la fórmula cuando x < 0.',
        'Pensá qué pendiente tiene cada semirrecta a la izquierda y a la derecha de x = 0.',
        'Descartá las opciones que hablan de asíntotas, valores constantes o curvas cuadráticas: ambos tramos son lineales.',
      ],
      solution: 'Para x ≥ 0 vale y = x (pendiente +1); para x < 0 las barras multiplican por −1 dando y = −x (pendiente −1). Ese cambio abrupto de pendiente en (0, 0) produce el vértice en V.',
    },
    {
      id: 'sec2-q3',
      competencyId: 'abs.cartesian_mirror_parent',
      prerequisiteIds: ['abs.distance_1d_and_equations'],
      exerciseFamily: 'ecuacion_desde_grafica',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'parent_vertex_identification',
      diagnosticIds: ['missing_abs_bars'],
      type: 'vertex',
      prompt: '¿Cuáles son las coordenadas del vértice y cuál es el eje de simetría de la función madre <strong>f(x) = |x|</strong>? Ingresá las coordenadas del vértice <strong>(h, k)</strong>:',
      expected: { a: 1, h: 0, k: 0 },
      hints: [
        'Buscá dónde se anula el argumento dentro de las barras |x| = 0.',
        'En ese valor de x chocan la rama izquierda y = −x y la rama derecha y = x.',
        'Evaluá f(h) para obtener la segunda coordenada k del vértice (h, k).',
      ],
      solution: 'La función madre f(x) = |x| tiene su vértice exactamente en el origen <strong>(0, 0)</strong> y su eje de simetría es la recta vertical x = 0 (el eje Y).',
    },
  ],

  'sec-3': [
    {
      id: 'sec3-q1',
      competencyId: 'abs.translations_vertex_hk',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'hallar_vertice',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'canonical_vertex_extraction',
      diagnosticIds: ['inverted_h_sign', 'swapped_h_k'],
      type: 'vertex',
      prompt: '¿Cuáles son las coordenadas del vértice <strong>(h, k)</strong> de la función trasladada <strong>f(x) = |x − 4| − 2</strong>?',
      expected: { a: 1, h: 4, k: -2 },
      hints: [
        'Preguntate qué valor de x anula el interior |x − 4| = 0; ese valor es h.',
        'Con el interior igualado a 0, observá qué término queda afuera de las barras para hallar k.',
        'Cuidado con el signo: adentro se lee el valor que anula la resta, mientras que afuera k conserva su propio signo.',
      ],
      solution: 'El interior |x − 4| se hace cero cuando x = 4 (por lo tanto <strong>h = 4</strong>). Al evaluar en x = 4 obtenemos la altura <strong>k = −2</strong>. El vértice es <strong>(4, −2)</strong>.',
    },
    {
      id: 'sec3-q2',
      competencyId: 'abs.translations_vertex_hk',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'hallar_vertice',
      representation: REPRESENTATION_TYPES.VERBAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'translation_to_symbolic_formula',
      diagnosticIds: ['inverted_h_sign', 'swapped_h_k'],
      type: 'expr',
      prompt: 'La gráfica de <strong>y = |x|</strong> se traslada <strong>3 unidades hacia la izquierda</strong> y <strong>5 unidades hacia arriba</strong>. Escribí la fórmula de la nueva función <strong>f(x)</strong>:',
      expected: { expr: '|x + 3| + 5', a: 1, h: -3, k: 5 },
      hints: [
        'Si el vértice se mueve 3 unidades a la izquierda del origen, su nueva coordenada horizontal es h = −3.',
        'Para que el interior valga 0 cuando x = −3, adentro de las barras necesitás escribir |x − (−3)| = |x + 3|.',
        'Sumar 5 unidades hacia arriba agrega el corrimiento vertical k = +5 afuera de las barras.',
      ],
      solution: 'Con vértice en (h, k) = (−3, 5) y apertura intacta a = 1, la fórmula canónica es f(x) = |x − (−3)| + 5 = <strong>|x + 3| + 5</strong>.',
    },
    {
      id: 'sec3-q3',
      competencyId: 'abs.translations_vertex_hk',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'hallar_vertice',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'interactive_vertex_drag',
      diagnosticIds: ['inverted_h_sign', 'swapped_h_k'],
      type: 'graph-target',
      prompt: '<strong>Pizarrón Interactivo:</strong> Arrastrá el vértice <strong>V(h, k)</strong> en el plano cartesiano para graficar la función <strong>g(x) = |x + 2| − 3</strong>.',
      expected: { a: 1, h: -2, k: -3 },
      initial: { a: 1, h: 2, k: 1 },
      draggableSlope: false,
      hints: [
        'Fijate en el interior |x + 2|: planteá x + 2 = 0 para ubicar la coordenada horizontal h.',
        'El término exterior (−3) determina el desplazamiento vertical k del vértice.',
        'Arrastrá el punto V en el pizarrón hasta hacer coincidir sus coordenadas (h; k) en el tercer cuadrante.',
      ],
      solution: 'El vértice debe ubicarse en <strong>V(−2, −3)</strong> con apertura estándar a = 1.',
    },
  ],

  // CAPÍTULO 2
  'sec-4': [
    {
      id: 'sec4-q1',
      competencyId: 'abs.vertical_scale_and_reflection',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'graficar_interactivo',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'solve_scale_coefficient_a',
      diagnosticIds: ['wrong_reflection_sign', 'inverted_slope_fraction'],
      type: 'number',
      prompt: 'Una función de valor absoluto tiene su vértice en el origen <strong>(0, 0)</strong> y sus ramas pasan por el punto <strong>(2, −6)</strong>. ¿Cuánto vale el coeficiente de apertura <strong>a</strong> en <strong>f(x) = a|x|</strong>?',
      expected: -3,
      hints: [
        'Sustituí las coordenadas del punto (x = 2, y = −6) en la ecuación y = a·|x|.',
        'Evaluá primero el valor absoluto |2| y dejá planteada una ecuación lineal en a.',
        'Despejá a dividiendo la ordenada y por |x|; verificá que su signo coincida con una V abierta hacia abajo.',
      ],
      solution: 'Reemplazando (2, −6) en f(x) = a|x| tenemos −6 = a·|2| ⇒ 2a = −6 ⇒ <strong>a = −3</strong> (la V se abre hacia abajo y es 3 veces más empinada).',
    },
    {
      id: 'sec4-q2',
      competencyId: 'abs.vertical_scale_and_reflection',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'graficar_interactivo',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'scale_and_reflection_description',
      diagnosticIds: ['wrong_reflection_sign', 'inverted_slope_fraction'],
      type: 'choice',
      prompt: 'Comparando las gráficas de <strong>f(x) = |x|</strong> y <strong>g(x) = −<span class="fr"><span class="num">1</span><span class="den">2</span></span>|x|</strong>, ¿cuál de las siguientes afirmaciones describe correctamente la transformación?',
      options: [
        'La gráfica de g se refleja hacia abajo y es más angosta (empinada) que f.',
        'La gráfica de g se desplaza <span class="fr"><span class="num">1</span><span class="den">2</span></span> unidad hacia abajo sin cambiar la apertura.',
        'La gráfica de g abre hacia arriba pero desplazada hacia la izquierda.',
        'La gráfica de g se refleja hacia abajo (abre como ∧) y es más ancha (achatada verticalmente) que f.',
      ],
      expected: 3,
      explanation: '¡Exacto! El signo menos en a = −<span class="fr"><span class="num">1</span><span class="den">2</span></span> invierte la V hacia abajo (∧), y como |a| = <span class="fr"><span class="num">1</span><span class="den">2</span></span> &lt; 1, por cada paso horizontal la rama solo baja medio paso vertical (más ancha).',
      hints: [
        'Analizá por separado el signo de a y su magnitud |a| respecto de 1.',
        'Un coeficiente negativo refleja la V hacia abajo; un |a| entre 0 y 1 reduce la pendiente vertical.',
        'Menor pendiente por cada paso en x significa que las ramas se separan del eje vertical y lucen más abiertas.',
      ],
      solution: 'Como a = −<span class="fr"><span class="num">1</span><span class="den">2</span></span> &lt; 0, las ramas se reflejan hacia abajo (forma ∧). Además, como |a| = 0,5 &lt; 1, la pendiente es más suave y la V se abre más ancha.',
    },
    {
      id: 'sec4-q3',
      competencyId: 'abs.vertical_scale_and_reflection',
      prerequisiteIds: ['abs.cartesian_mirror_parent'],
      exerciseFamily: 'graficar_interactivo',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'construct_scaled_parent_formula',
      diagnosticIds: ['wrong_reflection_sign', 'inverted_slope_fraction'],
      type: 'expr',
      prompt: 'Escribí la fórmula de una función de valor absoluto con vértice en <strong>(0, 0)</strong> que se abre <strong>hacia arriba</strong> y cuyas ramas pasan por <strong>(1, 4)</strong>:',
      expected: { expr: '4|x|', a: 4, h: 0, k: 0 },
      hints: [
        'Con vértice en (0, 0), la estructura general se reduce a f(x) = a|x|.',
        'Reemplazá x = 1 e y = 4 para despejar la pendiente a de la rama derecha.',
        'Verificá que a sea positivo (abre hacia arriba) y escribí el producto a|x|.',
      ],
      solution: 'Sustituyendo (1, 4) en f(x) = a|x| obtenemos a = 4, por lo que la función es <strong>4|x|</strong>.',
    },
  ],

  'sec-5': [
    {
      id: 'sec5-q1',
      competencyId: 'abs.canonical_form_synthesis',
      prerequisiteIds: ['abs.translations_vertex_hk', 'abs.vertical_scale_and_reflection'],
      exerciseFamily: 'ecuacion_desde_grafica',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'canonical_formula_from_vertex_and_point',
      diagnosticIds: ['inverted_h_sign', 'wrong_reflection_sign', 'inverted_slope_fraction'],
      type: 'expr',
      prompt: 'Una gráfica en V tiene su vértice en <strong>(1, −3)</strong> y pasa por el punto <strong>(3, 1)</strong>. Escribí su fórmula canónica <strong>f(x) = a|x − h| + k</strong>:',
      expected: { expr: '2|x - 1| - 3', a: 2, h: 1, k: -3 },
      hints: [
        'Usando el vértice (h, k) = (1, −3), planteá la estructura f(x) = a|x − h| + k.',
        'Calculá la pendiente de la rama derecha desde el vértice hasta (3, 1) usando Δy / Δx.',
        'Comprobá tu fórmula sustituyendo x = 3 y verificando que arroje y = 1.',
      ],
      solution: 'Con h = 1 y k = −3 planteamos f(x) = a|x − 1| − 3. Evaluando en (3, 1): 1 = a|3 − 1| − 3 ⇒ 2a = 4 ⇒ a = 2. Queda <strong>2|x − 1| − 3</strong>.',
    },
    {
      id: 'sec5-q2',
      competencyId: 'abs.canonical_form_synthesis',
      prerequisiteIds: ['abs.translations_vertex_hk', 'abs.vertical_scale_and_reflection'],
      exerciseFamily: 'ecuacion_desde_grafica',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.RETRIEVAL,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'canonical_formula_inverted_v',
      diagnosticIds: ['inverted_h_sign', 'wrong_reflection_sign', 'inverted_slope_fraction'],
      type: 'expr',
      prompt: 'Hallá la fórmula canónica de la función cuyo vértice es <strong>(−2, 4)</strong> y pasa por el punto <strong>(0, −2)</strong>:',
      expected: { expr: '-3|x + 2| + 4', a: -3, h: -2, k: 4 },
      hints: [
        'Con vértice (h, k) = (−2, 4), recordá que x − (−2) se escribe como x + 2 dentro de las barras.',
        'Reemplazá el punto de paso (0, −2) en la estructura canónica para despejar a.',
        'Como el punto de paso está debajo del vértice, el coeficiente a debe resultar negativo.',
      ],
      solution: 'Planteamos f(x) = a|x + 2| + 4. Sustituyendo (0, −2): −2 = 2a + 4 ⇒ 2a = −6 ⇒ a = −3. La fórmula es <strong>−3|x + 2| + 4</strong>.',
    },
    {
      id: 'sec5-q3',
      competencyId: 'abs.canonical_form_synthesis',
      prerequisiteIds: ['abs.translations_vertex_hk', 'abs.vertical_scale_and_reflection'],
      exerciseFamily: 'graficar_interactivo',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.RETRIEVAL,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'interactive_vertex_and_slope_drag',
      diagnosticIds: ['inverted_h_sign', 'wrong_reflection_sign'],
      type: 'graph-target',
      prompt: '<strong>Desafío Cartesiano:</strong> Construí en el pizarrón la gráfica de <strong>f(x) = −2|x − 1| + 3</strong> arrastrando el vértice <strong>V</strong> y el control de pendiente <strong>P</strong>.',
      expected: { a: -2, h: 1, k: 3 },
      initial: { a: 1, h: -1, k: -1 },
      draggableSlope: true,
      hints: [
        'Identificá primero el vértice (h, k) anulando |x − 1| y leyendo el término independiente exterior.',
        'Ubicá el nodo amarillo V en (h, k) antes de ajustar la inclinación de las ramas.',
        'Desde V, la pendiente derecha vale a = −2: por cada unidad que avanzás en x, bajá 2 unidades en y para ubicar P.',
      ],
      solution: 'Ubicamos el vértice en <strong>V(1, 3)</strong> y, como la pendiente derecha es a = −2, colocamos el control de rama en <strong>P(2, 1)</strong>.',
    },
  ],

  'sec-6': [
    {
      id: 'sec6-q1',
      competencyId: 'abs.piecewise_decomposition',
      prerequisiteIds: ['abs.canonical_form_synthesis'],
      exerciseFamily: 'desarmar_en_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'unfactored_inner_coeff_vertex',
      diagnosticIds: ['inverted_h_sign', 'unfactored_inner_coeff'],
      type: 'vertex',
      prompt: '<strong>¡Cuidado con el factor interno!</strong> ¿Cuáles son las coordenadas reales del vértice <strong>(h, k)</strong> de la función <strong>f(x) = |2x − 6| + 1</strong>?',
      expected: { a: 2, h: 3, k: 1 },
      hints: [
        'No leas h = 6 directamente: el vértice ocurre donde el argumento completo dentro de las barras se anula (2x − 6 = 0).',
        'También podés factorizar el 2 fuera de las barras: |2(x − 3)| + 1 = 2|x − 3| + 1.',
        'Una vez hallado x = h, evaluá la función en ese punto para confirmar la altura k.',
      ],
      solution: 'Igualando el interior a cero: 2x − 6 = 0 ⇒ <strong>h = 3</strong>. Factorizando sale |2|·|x − 3| + 1 = 2|x − 3| + 1, por lo que el vértice real es <strong>(3, 1)</strong>.',
    },
    {
      id: 'sec6-q2',
      competencyId: 'abs.piecewise_decomposition',
      prerequisiteIds: ['abs.canonical_form_synthesis'],
      exerciseFamily: 'desarmar_en_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'piecewise_left_branch_formula',
      diagnosticIds: ['inverted_h_sign'],
      type: 'expr',
      prompt: 'Al abrir las barras de <strong>f(x) = |x − 3| + 2</strong> para la zona izquierda <strong>x &lt; 3</strong> (donde el interior x − 3 es negativo), ¿qué fórmula lineal simplificada queda para esa rama?',
      expected: '-x + 5',
      hints: [
        'Cuando x < 3, la expresión interior (x − 3) toma valores negativos.',
        'Al quitar las barras de una cantidad negativa, anteponé un signo menos a todo el paréntesis: −(x − 3) + 2.',
        'Aplicá propiedad distributiva del signo menos y combiná los términos numéricos para obtener mx + b.',
      ],
      solution: 'Para x < 3 tenemos |x − 3| = −(x − 3) = −x + 3. Sumando el +2 exterior resulta −x + 3 + 2 = <strong>−x + 5</strong>.',
    },
    {
      id: 'sec6-q3',
      competencyId: 'abs.piecewise_decomposition',
      prerequisiteIds: ['abs.canonical_form_synthesis'],
      exerciseFamily: 'desarmar_en_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'piecewise_right_branch_formula',
      diagnosticIds: ['inverted_h_sign'],
      type: 'expr',
      prompt: '¿Y cuál es la fórmula lineal simplificada de la rama derecha (para <strong>x ≥ 3</strong>) de la misma función <strong>f(x) = |x − 3| + 2</strong>?',
      expected: 'x - 1',
      hints: [
        'Para x ≥ 3 el interior (x − 3) es mayor o igual que cero.',
        'Cuando el argumento dentro de las barras no es negativo, las barras se quitan sin cambiar signos.',
        'Agrupá las constantes del paréntesis con el +2 exterior.',
      ],
      solution: 'Para x ≥ 3 las barras se quitan sin cambiar signos: (x − 3) + 2 = <strong>x − 1</strong>.',
    },
  ],

  'sec-7': [
    {
      id: 'sec7-q1',
      competencyId: 'abs.full_analytical_study_and_inequalities',
      prerequisiteIds: ['abs.piecewise_decomposition'],
      exerciseFamily: 'rango_y_positividad',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.INTERLEAVING,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'range_and_monotonicity_intervals',
      diagnosticIds: ['confused_x_and_y_in_intervals'],
      type: 'choice',
      prompt: 'Para la función invertida <strong>f(x) = −2|x − 3| + 6</strong>, ¿cuáles son su <strong>Conjunto Imagen Im(f)</strong> y su <strong>Intervalo de Crecimiento I↑</strong>?',
      options: [
        'Im(f) = [6, +∞)  e  I↑ = (3, +∞)',
        'Im(f) = (−∞, 6]  e  I↑ = (−∞, 3)',
        'Im(f) = (−∞, 3]  e  I↑ = (−∞, 6)',
        'Im(f) = ℝ        e  I↑ = (3, 6)',
      ],
      expected: 1,
      optionDiagnostics: {
        2: 'confused_x_and_y_in_intervals',
      },
      explanation: '¡Impecable! La Imagen se lee en el eje Y: como abre hacia abajo desde el pico k = 6, es (−∞, 6]. El crecimiento se lee en el eje X: sube desde la izquierda hasta h = 3, es decir (−∞, 3).',
      hints: [
        'Identificá el vértice (h, k) = (3, 6) y notá que a = −2 < 0 hace abrir la gráfica hacia abajo.',
        'Recordá la regla de oro de Exactas: la Imagen se lee en el eje Y (hasta k) y el crecimiento en el eje X (respecto de h).',
        'Observá si la rama a la izquierda de x = 3 sube o baja al avanzar hacia el pico máximo.',
      ],
      solution: 'Con vértice en (3, 6) y a = −2 < 0, las alturas llegan como máximo a k = 6 ⇒ <strong>Im(f) = (−∞, 6]</strong>. Mirando de izquierda a derecha en X, la rama sube antes del vértice ⇒ <strong>I↑ = (−∞, 3)</strong>.',
    },
    {
      id: 'sec7-q2',
      competencyId: 'abs.full_analytical_study_and_inequalities',
      prerequisiteIds: ['abs.piecewise_decomposition'],
      exerciseFamily: 'resolver_modulo',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'roots_of_canonical_abs_function',
      diagnosticIds: ['inverted_h_sign'],
      type: 'pair',
      prompt: 'Hallá los dos ceros o raíces (donde f(x) = 0) de <strong>f(x) = −2|x − 3| + 6</strong> (de menor a mayor):',
      firstLabel: 'Raíz x₁ (menor)',
      secondLabel: 'Raíz x₂ (mayor)',
      expected: { first: 0, second: 6 },
      hints: [
        'Igualá la fórmula a cero y despejá el término con barras |x − 3|.',
        '¿Qué dos números reales están a exactamente esa distancia del centro h = 3?',
        '¿Duda con los signos? Tocá el botón «¿Por qué no cambia de signo el −3?» para que Alaska te muestre el paso a paso.',
      ],
      solution: 'Despejando |x − 3| = 6 / 2 = 3 obtenemos x − 3 = −3 ⇒ <strong>x₁ = 0</strong> y x − 3 = 3 ⇒ <strong>x₂ = 6</strong>.',
    },
    {
      id: 'sec7-q3',
      competencyId: 'abs.full_analytical_study_and_inequalities',
      prerequisiteIds: ['abs.piecewise_decomposition'],
      exerciseFamily: 'rango_y_positividad',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'negativity_set_from_abs_inequality',
      diagnosticIds: ['confused_x_and_y_in_intervals'],
      type: 'choice',
      prompt: '¿Para qué valores de x se cumple la inecuación de positividad <strong>|x − 1| − 4 &lt; 0</strong> (Conjunto de Negatividad C⁻ de f(x) = |x − 1| − 4)?',
      options: [
        'La unión (−∞, −3) ∪ (5, +∞).',
        'Únicamente los puntos x = −3 y x = 5.',
        'El intervalo abierto (−3, 5), es decir, todos los x cuya distancia al 1 es menor que 4.',
        'El conjunto vacío ∅ porque un valor absoluto nunca es negativo.',
      ],
      expected: 2,
      explanation: '¡Exacto! |x − 1| − 4 < 0 equivale a |x − 1| < 4: estar a menos de 4 pasos del centro h = 1 nos deja entre 1 − 4 = −3 y 1 + 4 = 5.',
      hints: [
        'Sumá 4 a ambos miembros para comparar la distancia |x − 1| con el número 4.',
        'Interpretar |x − 1| < 4 geométricamente equivale a buscar puntos cuya distancia a h = 1 sea estrictamente menor que 4.',
        'Gráficamente, la punta de la V está debajo del eje X y corta al eje horizontal en sus dos raíces.',
      ],
      solution: 'Despejando queda |x − 1| < 4 ⇔ −4 < x − 1 < 4 ⇔ <strong>x ∈ (−3, 5)</strong>. En ese tramo central la V está por debajo del eje X.',
    },
  ],

  // CAPÍTULO 3
  'sec-8': [
    {
      id: 'sec8-q1',
      competencyId: 'abs.piecewise_domain_customs',
      prerequisiteIds: ['abs.full_analytical_study_and_inequalities'],
      exerciseFamily: 'evaluar_por_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'piecewise_interior_evaluation',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Dada la función por partes:<br><code>f(x) = { 2x + 5  si x &lt; 1 ;  −x + 8  si x ≥ 1 }</code><br>¿Cuánto vale <strong>f(−2)</strong>?',
      expected: 1,
      hints: [
        'Primero pasá por la aduana de condiciones: verificá en qué intervalo cae x = −2.',
        'Como −2 < 1, solo se habilita la primera fórmula y se descarta la segunda.',
        'Evaluá únicamente la fórmula de ese primer renglón reemplazando x = −2.',
      ],
      solution: 'Como −2 < 1, la aduana habilita el primer renglón: f(−2) = 2(−2) + 5 = −4 + 5 = <strong>1</strong>.',
    },
    {
      id: 'sec8-q2',
      competencyId: 'abs.piecewise_domain_customs',
      prerequisiteIds: ['abs.full_analytical_study_and_inequalities'],
      exerciseFamily: 'evaluar_por_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'piecewise_boundary_evaluation',
      diagnosticIds: [],
      type: 'number',
      prompt: 'En esa misma función <code>f(x) = { 2x + 5  si x &lt; 1 ;  −x + 8  si x ≥ 1 }</code>, ¿cuánto vale exactamente en la frontera <strong>f(1)</strong>?',
      expected: 7,
      hints: [
        'Mirá las desigualdades en x = 1: una es estricta (<) y la otra incluye el signo igual (≥).',
        'El círculo abierto (<span class="va-dot va-dot--open" title="Círculo abierto"></span>) excluye la frontera y el punto cerrado (<span class="va-dot va-dot--closed" title="Punto cerrado"></span>) la incluye.',
        'Evaluá únicamente el renglón que contiene la condición inclusiva para x = 1.',
      ],
      solution: 'En la frontera x = 1, el signo «≥» está en el segundo tramo. Por lo tanto evaluamos −(1) + 8 = <strong>7</strong>.',
    },
    {
      id: 'sec8-q3',
      competencyId: 'abs.piecewise_domain_customs',
      prerequisiteIds: ['abs.full_analytical_study_and_inequalities'],
      exerciseFamily: 'evaluar_por_partes',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'open_vs_closed_endpoint_reading',
      diagnosticIds: [],
      type: 'choice',
      prompt: 'Si en otra función por partes el tramo izquierdo termina en <strong>(2, 5) con círculo abierto <span class="va-dot va-dot--open" title="Círculo abierto"></span></strong> y el tramo derecho arranca en <strong>(2, 1) con punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span></strong>, ¿cuánto vale <strong>f(2)</strong> mirando el gráfico?',
      options: [
        'f(2) = 5, porque siempre manda el tramo que viene desde la izquierda.',
        'f(2) = 3, porque se promedian las dos alturas en el salto.',
        'f(2) tiene dos valores al mismo tiempo: 1 y 5.',
        'f(2) = 1, porque el punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span> indica qué altura incluye realmente a la frontera x = 2.',
      ],
      expected: 3,
      explanation: '¡Perfecto! El punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span> es el dueño del valor en la frontera; el círculo abierto <span class="va-dot va-dot--open" title="Círculo abierto"></span> solo marca hasta dónde se acerca la otra rama sin tocar.',
      hints: [
        'Recordá qué significa <span class="va-dot va-dot--open" title="Círculo abierto"></span> (no incluye el borde) frente a <span class="va-dot va-dot--closed" title="Punto cerrado"></span> (sí incluye el borde).',
        'El punto cerrado indica que ese par ordenado pertenece efectivamente al gráfico de f.',
        'Por unicidad funcional, en x = 2 existe un único valor asignado por la rama que incluye la frontera.',
      ],
      solution: 'En el gráfico, el punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span> en (2, 1) indica que para x = 2 la única salida asignada es <strong>f(2) = 1</strong>.',
    },
  ],

  'sec-9': [
    {
      id: 'sec9-q1',
      competencyId: 'abs.boundary_continuity_and_uniqueness',
      prerequisiteIds: ['abs.piecewise_domain_customs'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'vertical_line_test_at_boundary',
      diagnosticIds: ['both_endpoints_closed_violation'],
      type: 'choice',
      prompt: 'Si al graficar una definición por partes en la frontera <strong>x = 3</strong> ambos tramos tienen un <strong>punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span></strong> a distinta altura —por ejemplo en (3, 2) y en (3, 6)—, ¿qué ocurre matemáticamente?',
      options: [
        'Es una función continua con un segmento vertical que une (3, 2) con (3, 6).',
        'Viola la unicidad y la prueba de la recta vertical en x = 3: una misma entrada x tendría dos salidas distintas, por lo que NO es una función.',
        'Es una función válida cuyo valor en x = 3 es la suma 2 + 6 = 8.',
        'Simplemente se anulan ambos puntos y x = 3 queda fuera del dominio.',
      ],
      expected: 1,
      explanation: '¡Exacto! Una función exige que cada x del dominio tenga una única imagen. Dos puntos cerrados <span class="va-dot va-dot--closed" title="Punto cerrado"></span> en la misma vertical x = 3 rompen la definición de función.',
      hints: [
        'Imaginá trazar la recta vertical x = 3 sobre el plano cartesiano.',
        'Contá cuántos puntos cerrados <span class="va-dot va-dot--closed" title="Punto cerrado"></span> toca esa recta vertical en x = 3.',
        'Recordá la condición de unicidad: cada entrada x del dominio puede tener a lo sumo una imagen.',
      ],
      solution: 'Si ambos tramos incluyen x = 3 (por ejemplo con ≤ y ≥) y dan alturas distintas, la recta vertical x = 3 corta dos veces a la gráfica: <strong>no es función</strong>.',
    },
    {
      id: 'sec9-q2',
      competencyId: 'abs.boundary_continuity_and_uniqueness',
      prerequisiteIds: ['abs.piecewise_domain_customs'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.INTERLEAVING,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'continuous_gluing_parameter_k',
      diagnosticIds: [],
      type: 'number',
      prompt: '<strong>Pegado continuo (Exactas):</strong> ¿Qué valor debe tomar la constante <strong>k</strong> para que la función por partes<br><code>f(x) = { 3x − 1  si x &lt; 2 ;  x + k  si x ≥ 2 }</code><br>no tenga un salto y sus dos ramas se unan en <strong>x = 2</strong>?',
      expected: 3,
      hints: [
        'Calculá a qué altura se acerca la rama izquierda cuando x tiende a la frontera x = 2.',
        'Evaluá la expresión de la rama derecha en x = 2 dejándola expresada en función de k.',
        'Igualá ambas alturas laterales para que no haya salto y despejá el valor de k.',
      ],
      solution: 'Igualando las alturas laterales en la frontera x = 2: 3(2) − 1 = 2 + k ⇒ 5 = 2 + k ⇒ <strong>k = 3</strong>.',
    },
    {
      id: 'sec9-q3',
      competencyId: 'abs.boundary_continuity_and_uniqueness',
      prerequisiteIds: ['abs.piecewise_domain_customs'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.GRAPHICAL,
      stage: LEARNING_STAGES.INTERLEAVING,
      difficulty: 2,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'domain_hole_from_open_endpoints',
      diagnosticIds: [],
      type: 'choice',
      prompt: 'En una función por partes donde el tramo 1 vale para <strong>x &lt; 0</strong> y el tramo 2 vale para <strong>x &gt; 0</strong> (ambos con círculo abierto <span class="va-dot va-dot--open" title="Círculo abierto"></span> en x = 0), ¿qué pasa con <strong>x = 0</strong>?',
      options: [
        'Deja de ser función porque una función no puede tener huecos en el dominio.',
        'En x = 0 la función vale automáticamente 0.',
        'Sigue siendo una función válida, pero x = 0 no pertenece a su dominio: Dom(f) = ℝ − {0}.',
        'Ambos círculos abiertos se fusionan formando un punto cerrado.',
      ],
      expected: 2,
      explanation: '¡Muy bien! Dos círculos abiertos <span class="va-dot va-dot--open" title="Círculo abierto"></span> no violan la unicidad (la recta vertical x = 0 corta 0 veces, que es ≤ 1). Simplemente x = 0 queda fuera del dominio.',
      hints: [
        'Revisá si alguna de las dos condiciones incluye el signo igual para x = 0.',
        'Preguntate si la recta vertical x = 0 corta más de una vez a la gráfica (criterio de función).',
        'Si no hay contradicción de unicidad, sigue siendo función pero excluyendo ese valor del dominio.',
      ],
      solution: 'Ninguna rama toma a x = 0, así que no hay contradicción de unicidad: es una función con dominio <strong>Dom(f) = ℝ − {0}</strong>.',
    },
  ],

  'sec-10': [
    {
      id: 'sec10-q1',
      competencyId: 'abs.step_floor_and_ceiling',
      prerequisiteIds: ['abs.boundary_continuity_and_uniqueness'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.EXPLORATION,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'positive_floor_evaluation',
      diagnosticIds: [],
      type: 'number',
      prompt: 'La función parte entera o piso <strong>⌊x⌋</strong> devuelve el mayor entero menor o igual que x. ¿Cuánto vale <strong>⌊2,9⌋</strong>?',
      expected: 2,
      hints: [
        'Ubicá el número 2,9 en la recta numérica entre los enteros 2 y 3.',
        'La función piso ⌊x⌋ devuelve el mayor entero menor o igual que x.',
        'En la recta horizontal, mirá hacia el entero inmediatamente a la izquierda de 2,9.',
      ],
      solution: 'Como 2 ≤ 2,9 < 3, el mayor entero que no supera a 2,9 es <strong>⌊2,9⌋ = 2</strong>.',
    },
    {
      id: 'sec10-q2',
      competencyId: 'abs.step_floor_and_ceiling',
      prerequisiteIds: ['abs.boundary_continuity_and_uniqueness'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.SYMBOLIC,
      stage: LEARNING_STAGES.GUIDED_PRACTICE,
      difficulty: 1,
      transferDistance: TRANSFER_DISTANCES.NEAR,
      expectedEvidence: 'negative_floor_evaluation',
      diagnosticIds: [],
      type: 'number',
      prompt: '<strong>¡Trampa clásica con negativos!</strong> ¿Cuánto vale la función piso evaluada en un número negativo no entero: <strong>⌊−1,2⌋</strong>?',
      expected: -2,
      hints: [
        'No trunques la parte decimal hacia cero: ubicá −1,2 en la recta entre −2 y −1.',
        'Entre −2 y −1, identificá cuál de los dos números enteros es menor que −1,2.',
        'El piso siempre elige el entero situado a la izquierda del valor dado en la recta real.',
      ],
      solution: 'En la recta numérica se cumple −2 ≤ −1,2 < −1. El mayor entero menor o igual que −1,2 está a su izquierda y es <strong>⌊−1,2⌋ = −2</strong> (no −1).',
    },
    {
      id: 'sec10-q3',
      competencyId: 'abs.step_floor_and_ceiling',
      prerequisiteIds: ['abs.boundary_continuity_and_uniqueness'],
      exerciseFamily: 'dominio_rango_partes',
      representation: REPRESENTATION_TYPES.VERBAL,
      stage: LEARNING_STAGES.TRANSFER,
      difficulty: 3,
      transferDistance: TRANSFER_DISTANCES.FAR,
      expectedEvidence: 'ceiling_billing_application',
      diagnosticIds: [],
      type: 'number',
      prompt: 'Un estacionamiento cobra <strong>$500 por cada hora o fracción</strong> (modelado con la función techo <strong>500·⌈t⌉</strong> para t &gt; 0). Si dejás el auto durante <strong>t = 2,15 horas</strong>, ¿cuánto debés pagar en pesos?',
      expected: 1500,
      hints: [
        'La función techo ⌈t⌉ devuelve el menor entero mayor o igual que t.',
        'Como t = 2,15 supera las 2 horas completas, identificá el siguiente entero hacia la derecha en la recta.',
        'Multiplicá esa cantidad entera de horas facturadas por la tarifa unitaria de $500.',
      ],
      solution: 'La función techo redondea hacia el entero superior: ⌈2,15⌉ = 3 horas facturadas. El costo total es 500 × 3 = <strong>$1500</strong>.',
    },
  ],
};

/* ---------- Arquitectura de Pizarrón Escolar (Modo Pizarrón) ---------- */

export const LESSON_SECTIONS = [
  { id: 'sec-1', chapter: 'Capítulo 1', title: 'Distancia en la recta numérica |x − h|', short: '1. Distancia |x − h|' },
  { id: 'sec-2', chapter: 'Capítulo 1', title: 'El espejo cartesiano y la función madre |x|', short: '2. Espejo cartesiano |x|' },
  { id: 'sec-3', chapter: 'Capítulo 1', title: 'Traslaciones y el vértice (h, k)', short: '3. Vértice (h, k)' },
  { id: 'sec-4', chapter: 'Capítulo 2', title: 'Pendiente de las ramas y apertura a', short: '4. Apertura y signo a' },
  { id: 'sec-5', chapter: 'Capítulo 2', title: 'Laboratorio maestro f(x) = a|x − h| + k', short: '5. Laboratorio a|x − h| + k' },
  { id: 'sec-6', chapter: 'Capítulo 2', title: 'Abriendo las barras: de |u| a función por partes', short: '6. Abriendo las barras' },
  { id: 'sec-7', chapter: 'Capítulo 2', title: 'Radiografía completa (Nivel Exactas)', short: '7. Radiografía Exactas' },
  { id: 'sec-8', chapter: 'Capítulo 3', title: 'La aduana de dominios: evaluar por partes', short: '8. Aduana por partes' },
  { id: 'sec-9', chapter: 'Capítulo 3', title: 'Fronteras abierta vs cerrada y prueba de la recta vertical', short: '9. Fronteras abierta vs cerrada' },
  { id: 'sec-10', chapter: 'Capítulo 3', title: 'Funciones escalonadas: piso ⌊x⌋ y techo ⌈x⌉', short: '10. Piso ⌊x⌋ y techo ⌈x⌉' },
  { id: 'sec-retos', chapter: 'Capítulo 4', title: 'Entrenador, 5 Trampas y Escudo Deflector V', short: 'Entrenador y Deflector V' },
  { id: 'sec-repaso', chapter: 'Capítulo 4', title: 'Hoja de Repaso Imprimible', short: 'Hoja de Repaso' },
];

export function initBlackboardController() {
  const contentEl = document.querySelector('.seq-content');
  if (!contentEl) return;

  let isBlackboardMode = true;
  let currentSectionId = 'sec-1';

  const badgeEl = h('span', { class: 'seq-blackboard-toolbar__badge', id: 'seq-board-badge' }, `Pizarrón 1 de ${LESSON_SECTIONS.length}`);
  const titleEl = h('strong', { id: 'seq-board-title' }, LESSON_SECTIONS[0].title);
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
    h('div', { class: 'seq-blackboard-toolbar__actions' }, modeBtn),
  );

  contentEl.prepend(toolbarEl);
  initLessonDock();
  contentEl.classList.add('mode-blackboard');

  function setActiveBoard(secId, { scroll = true, updateHash = true } = {}) {
    const secInfo = LESSON_SECTIONS.find((s) => s.id === secId);
    if (!secInfo) return;
    currentSectionId = secId;

    LESSON_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) el.classList.toggle('is-active', s.id === secId);
    });

    qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.sec === secId);
    });

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
      `Pizarrón ${idx + 1} de ${LESSON_SECTIONS.length} · ${secInfo.chapter}`,
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
      btnNext,
    );

    secEl.append(trayEl);
  });

  qsa('.seq-sidebar__link[data-sec]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const secId = link.dataset.sec;
      if (secId && isBlackboardMode) {
        e.preventDefault();
        setActiveBoard(secId, { scroll: true, updateHash: true });
      }
    });
  });

  window.addEventListener('hashchange', () => {
    const hashId = window.location.hash.slice(1);
    if (hashId && LESSON_SECTIONS.some((s) => s.id === hashId)) {
      setActiveBoard(hashId, { scroll: true, updateHash: false });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!isBlackboardMode) return;
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (document.activeElement && document.activeElement.classList.contains('abs-board__handle')) return;

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

  const initialHash = window.location.hash.slice(1);
  const startSec = LESSON_SECTIONS.some((s) => s.id === initialHash) ? initialHash : 'sec-1';
  setActiveBoard(startSec, { scroll: false, updateHash: false });
}

// Inicializar disparadores de Visual Novel
function initVNTriggers() {
  qsa('.vn-trigger[data-vn-script], .seq-doubt-btn[data-vn-script]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scriptId = btn.dataset.vnScript;
      if (VN_SCRIPTS[scriptId]) {
        playScript(VN_SCRIPTS[scriptId]);
      }
    });
  });
}

export function initValorAbsolutoPage() {
  if (typeof document === 'undefined') return;

  renderNav();

  if (typeof localStorage !== 'undefined' && isMigrationNeeded(localStorage)) {
    migrateLegacyProgress(localStorage);
  }
  initAbsLearning();

  const an3 = byId('annotated-sec-3');
  if (an3) annotatedAbsFormula(an3, { a: 1, h: 4, k: -2 });

  const an4 = byId('annotated-sec-4');
  if (an4) annotatedAbsFormula(an4, { a: -2, h: 0, k: 0 });

  const an5 = byId('annotated-sec-5');
  if (an5) annotatedAbsFormula(an5, { a: -2, h: 3, k: 4 });

  const brace6 = byId('brace-sec-6');
  if (brace6) {
    piecewiseBrace(
      brace6,
      [
        { exprText: '−x + 5', condition: 'x < 3 (interior negativo)' },
        { exprText: 'x − 1', condition: 'x ≥ 3 (interior ≥ 0)' },
      ],
      1,
      { fnName: 'f(x) = |x − 3| + 2' },
    );
  }

  const brace8 = byId('brace-sec-8');
  if (brace8) {
    piecewiseBrace(
      brace8,
      [
        { exprText: 'x + 3', condition: 'x < −1' },
        { exprText: '−x + 1', condition: '−1 ≤ x < 2' },
        { exprText: '2', condition: 'x ≥ 2' },
      ],
      1,
      { fnName: 'f(x)' },
    );
  }

  // Capítulo 1
  const w1 = document.querySelector('[data-widget="distancia-1d"]');
  if (w1) initDistancia1DWidget(w1);

  const w2 = document.querySelector('[data-widget="espejo-cartesiano"]');
  if (w2) initEspejoCartesianoWidget(w2);

  const w3 = document.querySelector('[data-widget="traslacion-vh"]');
  if (w3) initTraslacionVHWidget(w3);

  // Capítulo 2
  const w4 = document.querySelector('[data-widget="escalado-rama"]');
  if (w4) initEscaladoRamaWidget(w4);

  const w5 = document.querySelector('[data-widget="constructor-v"]');
  if (w5) initConstructorVWidget(w5);

  const w6 = document.querySelector('[data-widget="desarmador-barras"]');
  if (w6) initDesarmadorBarrasWidget(w6);

  const w7 = document.querySelector('[data-widget="radiografia-abs"]');
  if (w7) initRadiografiaAbsWidget(w7);

  // Capítulo 3
  const w8 = document.querySelector('[data-widget="aduana-partes"]');
  if (w8) initAduanaPartesWidget(w8);

  const w9 = document.querySelector('[data-widget="editor-tramos"]');
  if (w9) initEditorTramosWidget(w9);

  const w10 = document.querySelector('[data-widget="escalonada-paso"]');
  if (w10) initEscalonadaPasoWidget(w10);

  // Capítulo 4: Entrenador, Trampas y Modo Deflector
  const retosContainer = document.querySelector('[data-widget="retos-abs"]');
  if (retosContainer) initRetosAbsModule(retosContainer);

  let dashboardCtrl = null;
  const dashSlot = byId('abs-competency-dashboard');
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
        const retosWidget = document.querySelector('[data-widget="retos-abs"]');
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
  initValorAbsolutoPage();
}

export {
  ABS_COMPETENCIES,
  ABS_DIAGNOSTIC_TAXONOMY,
  getCompetencyById,
  getCompetenciesForSection,
  getCompetencyReport,
  getAbsCompetencyReport,
  mountCompetencyDashboard,
  PROGRESS_KEY,
  getProgress,
  saveSectionProgress,
  recordCompetencyAttempt,
};
