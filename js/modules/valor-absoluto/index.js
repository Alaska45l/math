/**
 * index.js — Punto de entrada del Laboratorio de Valor Absoluto y Funciones por Partes.
 * Inicializa navegación, pizarrones cartesianos, 10 widgets interactivos,
 * chequeos con diagnóstico cognitivo, Modo Pizarrón y progreso en localStorage.
 */

import { byId, qsa, h, mount, chalkIcon } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import {
  createCheckBlock,
  annotatedAbsFormula,
  piecewiseBrace,
  getProgress,
} from './components.js';

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

// Inicializa barra superior global
renderNav();

/* ---------- Gestión de Progreso y Sidebar ---------- */
const TOTAL_SECTIONS = 10;

function updateSidebarProgress() {
  const progress = getProgress();
  const completedKeys = Object.keys(progress).filter((k) => progress[k] && k.startsWith('sec-'));
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

const CHECKS_DATA = {
  // CAPÍTULO 1
  'sec-1': [
    {
      id: 'sec1-q1',
      type: 'number',
      prompt: 'Calculá la distancia en la recta numérica entre los puntos <strong>x = −5</strong> y <strong>h = 4</strong>: ¿cuánto vale <strong>|(−5) − 4|</strong>?',
      expected: 9,
      hints: [
        'Primero resolvé la resta adentro de las barras: (−5) − 4 = −9.',
        'La distancia nunca es negativa: |−9| mide cuántas unidades hay desde −9 hasta el 0.',
      ],
      solution: 'Adentro de las barras tenemos (−5) − 4 = −9. Al tomar valor absoluto obtenemos |−9| = <strong>9</strong> unidades de distancia.',
    },
    {
      id: 'sec1-q2',
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
        'Desde el 3 podés caminar 5 pasos hacia la derecha o 5 pasos hacia la izquierda.',
      ],
      solution: '|x − 3| = 5 significa «distancia de x al 3 igual a 5». Las dos soluciones simétricas respecto a h = 3 son x = 3 + 5 = <strong>8</strong> y x = 3 − 5 = <strong>−2</strong>.',
    },
    {
      id: 'sec1-q3',
      type: 'pair',
      prompt: 'Hallá las dos soluciones de la ecuación de distancia <strong>|x + 2| = 6</strong> (ordenalas de menor a mayor):',
      firstLabel: 'x₁ (menor)',
      secondLabel: 'x₂ (mayor)',
      expected: { first: -8, second: 4 },
      hints: [
        'Reescribí |x + 2| como |x − (−2)|: el centro o ancla está en h = −2.',
        'Desde h = −2, caminá 6 unidades a la izquierda (−2 − 6) y 6 unidades a la derecha (−2 + 6).',
      ],
      solution: 'El centro está en h = −2. Moviéndonos 6 unidades hacia cada lado obtenemos x₁ = −2 − 6 = <strong>−8</strong> y x₂ = −2 + 6 = <strong>4</strong>.',
    },
  ],

  'sec-2': [
    {
      id: 'sec2-q1',
      type: 'number',
      prompt: 'Si la función madre es <strong>f(x) = |x|</strong>, ¿cuánto vale la salida <strong>f(−7)</strong>?',
      expected: 7,
      hints: [
        'En la recta identidad y = x, para x = −7 la altura sería −7 (bajo tierra).',
        'El espejo del eje X rebota esa altura negativa hacia el semiplano superior positivo.',
      ],
      solution: 'Al evaluar f(−7) = |−7|, el espejo del eje X refleja la altura negativa hacia arriba: <strong>f(−7) = 7</strong>.',
    },
    {
      id: 'sec2-q2',
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
        'Compará la fórmula cuando x ≥ 0 versus cuando x < 0.',
      ],
      solution: 'Para x ≥ 0 vale y = x (pendiente +1); para x < 0 las barras multiplican por −1 dando y = −x (pendiente −1). Ese cambio abrupto de pendiente en (0, 0) produce el vértice en V.',
    },
    {
      id: 'sec2-q3',
      type: 'vertex',
      prompt: '¿Cuáles son las coordenadas del vértice y cuál es el eje de simetría de la función madre <strong>f(x) = |x|</strong>? Ingresá las coordenadas del vértice <strong>(h, k)</strong>:',
      expected: { a: 1, h: 0, k: 0 },
      hints: [
        '¿En qué punto chocan la rama izquierda y = −x y la rama derecha y = x?',
      ],
      solution: 'La función madre f(x) = |x| tiene su vértice exactamente en el origen <strong>(0, 0)</strong> y su eje de simetría es la recta vertical x = 0 (el eje Y).',
    },
  ],

  'sec-3': [
    {
      id: 'sec3-q1',
      type: 'vertex',
      prompt: '¿Cuáles son las coordenadas del vértice <strong>(h, k)</strong> de la función trasladada <strong>f(x) = |x − 4| − 2</strong>?',
      expected: { a: 1, h: 4, k: -2 },
      hints: [
        'Preguntate: ¿qué valor de x anula el interior |x − 4| = 0? Ese valor es h.',
        'Cuando x = 4, queda f(4) = |0| − 2 = −2. Ese valor exterior es k.',
      ],
      solution: 'El interior |x − 4| se hace cero cuando x = 4 (por lo tanto <strong>h = 4</strong>). Al evaluar en x = 4 obtenemos la altura <strong>k = −2</strong>. El vértice es <strong>(4, −2)</strong>.',
    },
    {
      id: 'sec3-q2',
      type: 'expr',
      prompt: 'La gráfica de <strong>y = |x|</strong> se traslada <strong>3 unidades hacia la izquierda</strong> y <strong>5 unidades hacia arriba</strong>. Escribí la fórmula de la nueva función <strong>f(x)</strong>:',
      expected: { expr: '|x + 3| + 5', a: 1, h: -3, k: 5 },
      hints: [
        'Si el vértice se mueve 3 unidades a la izquierda del origen, su nueva coordenada horizontal es h = −3.',
        'Para que el interior valga 0 cuando x = −3, adentro de las barras necesitás escribir |x − (−3)| = |x + 3|.',
        'Subir 5 unidades suma +5 afuera de las barras: |x + 3| + 5.',
      ],
      solution: 'Con vértice en (h, k) = (−3, 5) y apertura intacta a = 1, la fórmula canónica es f(x) = |x − (−3)| + 5 = <strong>|x + 3| + 5</strong>.',
    },
    {
      id: 'sec3-q3',
      type: 'graph-target',
      prompt: '<strong>Pizarrón Interactivo:</strong> Arrastrá el vértice <strong>V(h, k)</strong> en el plano cartesiano para graficar la función <strong>g(x) = |x + 2| − 3</strong>.',
      expected: { a: 1, h: -2, k: -3 },
      initial: { a: 1, h: 2, k: 1 },
      draggableSlope: false,
      hints: [
        'Fijate en el interior |x + 2|: se anula cuando x = −2. Llevá el vértice V a x = −2.',
        'El término exterior es −3: llevá la altura del vértice V a y = −3, formando V(−2, −3).',
      ],
      solution: 'El vértice debe ubicarse en <strong>V(−2, −3)</strong> con apertura estándar a = 1.',
    },
  ],

  // CAPÍTULO 2
  'sec-4': [
    {
      id: 'sec4-q1',
      type: 'number',
      prompt: 'Una función de valor absoluto tiene su vértice en el origen <strong>(0, 0)</strong> y sus ramas pasan por el punto <strong>(2, −6)</strong>. ¿Cuánto vale el coeficiente de apertura <strong>a</strong> en <strong>f(x) = a|x|</strong>?',
      expected: -3,
      hints: [
        'Sustituí las coordenadas del punto (x = 2, y = −6) en la ecuación −6 = a·|2|.',
        'Como |2| = 2, despejá a dividiendo −6 entre 2.',
      ],
      solution: 'Reemplazando (2, −6) en f(x) = a|x| tenemos −6 = a·|2| ⇒ 2a = −6 ⇒ <strong>a = −3</strong> (la V se abre hacia abajo y es 3 veces más empinada).',
    },
    {
      id: 'sec4-q2',
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
        'Miramos dos cosas por separado en a = −<span class="fr"><span class="num">1</span><span class="den">2</span></span>: su signo (−) y su tamaño absoluto (<span class="fr"><span class="num">1</span><span class="den">2</span></span> &lt; 1).',
      ],
      solution: 'Como a = −<span class="fr"><span class="num">1</span><span class="den">2</span></span> &lt; 0, las ramas se reflejan hacia abajo (forma ∧). Además, como |a| = 0,5 &lt; 1, la pendiente es más suave y la V se abre más ancha.',
    },
    {
      id: 'sec4-q3',
      type: 'expr',
      prompt: 'Escribí la fórmula de una función de valor absoluto con vértice en <strong>(0, 0)</strong> que se abre <strong>hacia arriba</strong> y cuyas ramas pasan por <strong>(1, 4)</strong>:',
      expected: { expr: '4|x|', a: 4, h: 0, k: 0 },
      hints: [
        'Con vértice en (0, 0), la forma es f(x) = a|x|.',
        'Si en x = 1 vale y = 4, entonces a·|1| = 4 ⇒ a = 4.',
      ],
      solution: 'Sustituyendo (1, 4) en f(x) = a|x| obtenemos a = 4, por lo que la función es <strong>4|x|</strong>.',
    },
  ],

  'sec-5': [
    {
      id: 'sec5-q1',
      type: 'expr',
      prompt: 'Una gráfica en V tiene su vértice en <strong>(1, −3)</strong> y pasa por el punto <strong>(3, 1)</strong>. Escribí su fórmula canónica <strong>f(x) = a|x − h| + k</strong>:',
      expected: { expr: '2|x - 1| - 3', a: 2, h: 1, k: -3 },
      hints: [
        'Ya conocés el vértice (h, k) = (1, −3), así que la estructura es a|x − 1| − 3.',
        'Para hallar a: desde el vértice (1, −3) hasta (3, 1) avanzás Δx = 2 a la derecha y subís Δy = 1 − (−3) = 4. Calculá a = 4 / 2.',
      ],
      solution: 'Con h = 1 y k = −3 planteamos f(x) = a|x − 1| − 3. Evaluando en (3, 1): 1 = a|3 − 1| − 3 ⇒ 2a = 4 ⇒ a = 2. Queda <strong>2|x − 1| − 3</strong>.',
    },
    {
      id: 'sec5-q2',
      type: 'expr',
      prompt: 'Hallá la fórmula canónica de la función cuyo vértice es <strong>(−2, 4)</strong> y pasa por el punto <strong>(0, −2)</strong>:',
      expected: { expr: '-3|x + 2| + 4', a: -3, h: -2, k: 4 },
      hints: [
        'Con vértice en (−2, 4), el interior es |x + 2| y afuera suma +4.',
        'Reemplazá x = 0, y = −2: −2 = a|0 + 2| + 4 ⇒ 2a = −6 ⇒ a = −3.',
      ],
      solution: 'Planteamos f(x) = a|x + 2| + 4. Sustituyendo (0, −2): −2 = 2a + 4 ⇒ 2a = −6 ⇒ a = −3. La fórmula es <strong>−3|x + 2| + 4</strong>.',
    },
    {
      id: 'sec5-q3',
      type: 'graph-target',
      prompt: '<strong>Desafío Cartesiano:</strong> Construí en el pizarrón la gráfica de <strong>f(x) = −2|x − 1| + 3</strong> arrastrando el vértice <strong>V</strong> y el control de pendiente <strong>P</strong>.',
      expected: { a: -2, h: 1, k: 3 },
      initial: { a: 1, h: -1, k: -1 },
      draggableSlope: true,
      hints: [
        'El interior |x − 1| se anula en h = 1, y el término exterior es k = 3. Ubicá primero V en (1, 3).',
        'El coeficiente es a = −2: al avanzar 1 unidad a la derecha desde x = 1 hasta x = 2, la altura debe bajar 2 unidades desde y = 3 hasta y = 1. Llevá P a (2, 1).',
      ],
      solution: 'Ubicamos el vértice en <strong>V(1, 3)</strong> y, como la pendiente derecha es a = −2, colocamos el control de rama en <strong>P(2, 1)</strong>.',
    },
  ],

  'sec-6': [
    {
      id: 'sec6-q1',
      type: 'vertex',
      prompt: '<strong>¡Cuidado con el factor interno!</strong> ¿Cuáles son las coordenadas reales del vértice <strong>(h, k)</strong> de la función <strong>f(x) = |2x − 6| + 1</strong>?',
      expected: { a: 2, h: 3, k: 1 },
      hints: [
        '¡No leas h = 6 directamente! El vértice está donde el argumento completo adentro de las barras vale cero: 2x − 6 = 0.',
        'Despejá 2x = 6 ⇒ x = 3. También podés sacar factor común: |2(x − 3)| + 1 = 2|x − 3| + 1.',
      ],
      solution: 'Igualando el interior a cero: 2x − 6 = 0 ⇒ <strong>h = 3</strong>. Factorizando sale |2|·|x − 3| + 1 = 2|x − 3| + 1, por lo que el vértice real es <strong>(3, 1)</strong>.',
    },
    {
      id: 'sec6-q2',
      type: 'expr',
      prompt: 'Al abrir las barras de <strong>f(x) = |x − 3| + 2</strong> para la zona izquierda <strong>x &lt; 3</strong> (donde el interior x − 3 es negativo), ¿qué fórmula lineal simplificada queda para esa rama?',
      expected: '-x + 5',
      hints: [
        'Cuando x < 3, el interior (x − 3) es negativo, así que las barras se reemplazan anteponiendo un signo menos: −(x − 3) + 2.',
        'Distribuí el signo menos: −x + 3 + 2.',
      ],
      solution: 'Para x < 3 tenemos |x − 3| = −(x − 3) = −x + 3. Sumando el +2 exterior resulta −x + 3 + 2 = <strong>−x + 5</strong>.',
    },
    {
      id: 'sec6-q3',
      type: 'expr',
      prompt: '¿Y cuál es la fórmula lineal simplificada de la rama derecha (para <strong>x ≥ 3</strong>) de la misma función <strong>f(x) = |x − 3| + 2</strong>?',
      expected: 'x - 1',
      hints: [
        'Para x ≥ 3 el interior (x − 3) es positivo o cero, así que las barras salen directo: (x − 3) + 2.',
        'Agrupá los números: x − 3 + 2.',
      ],
      solution: 'Para x ≥ 3 las barras se quitan sin cambiar signos: (x − 3) + 2 = <strong>x − 1</strong>.',
    },
  ],

  'sec-7': [
    {
      id: 'sec7-q1',
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
        'El vértice es (h, k) = (3, 6) y como a = −2 < 0 es una montaña ∧ con altura máxima y = 6.',
        'Recordá la regla de oro de Exactas: Imagen se lee en Y (usa k = 6); Crecimiento se lee en X (usa h = 3).',
      ],
      solution: 'Con vértice en (3, 6) y a = −2 < 0, las alturas llegan como máximo a k = 6 ⇒ <strong>Im(f) = (−∞, 6]</strong>. Mirando de izquierda a derecha en X, la rama sube antes del vértice ⇒ <strong>I↑ = (−∞, 3)</strong>.',
    },
    {
      id: 'sec7-q2',
      type: 'pair',
      prompt: 'Hallá los dos ceros o raíces (donde f(x) = 0) de <strong>f(x) = −2|x − 3| + 6</strong> (de menor a mayor):',
      firstLabel: 'Raíz x₁ (menor)',
      secondLabel: 'Raíz x₂ (mayor)',
      expected: { first: 0, second: 6 },
      hints: [
        'Igualá a cero: −2|x − 3| + 6 = 0 ⇒ 2|x − 3| = 6 ⇒ |x − 3| = 3.',
        '¿Qué dos números están a 3 unidades de distancia del 3?',
      ],
      solution: 'Despejando |x − 3| = 6 / 2 = 3 obtenemos x − 3 = −3 ⇒ <strong>x₁ = 0</strong> y x − 3 = 3 ⇒ <strong>x₂ = 6</strong>.',
    },
    {
      id: 'sec7-q3',
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
        'Sumá 4 a ambos lados: |x − 1| < 4.',
        'Gráficamente, la punta de la V está en (1, −4) bajo el eje X y cruza el eje X en −3 y 5.',
      ],
      solution: 'Despejando queda |x − 1| < 4 ⇔ −4 < x − 1 < 4 ⇔ <strong>x ∈ (−3, 5)</strong>. En ese tramo central la V está por debajo del eje X.',
    },
  ],

  // CAPÍTULO 3
  'sec-8': [
    {
      id: 'sec8-q1',
      type: 'number',
      prompt: 'Dada la función por partes:<br><code>f(x) = { 2x + 5  si x &lt; 1 ;  −x + 8  si x ≥ 1 }</code><br>¿Cuánto vale <strong>f(−2)</strong>?',
      expected: 1,
      hints: [
        'Primero pasá por la aduana de condiciones: ¿dónde entra x = −2? Como −2 < 1, entra en el primer renglón.',
        'Evaluá únicamente la primera fórmula: 2(−2) + 5.',
      ],
      solution: 'Como −2 < 1, la aduana habilita el primer renglón: f(−2) = 2(−2) + 5 = −4 + 5 = <strong>1</strong>.',
    },
    {
      id: 'sec8-q2',
      type: 'number',
      prompt: 'En esa misma función <code>f(x) = { 2x + 5  si x &lt; 1 ;  −x + 8  si x ≥ 1 }</code>, ¿cuánto vale exactamente en la frontera <strong>f(1)</strong>?',
      expected: 7,
      hints: [
        'Mirá las desigualdades en x = 1: el primer renglón dice x &lt; 1 (estricto, círculo abierto <span class="va-dot va-dot--open" title="Círculo abierto"></span>) y el segundo dice x ≥ 1 (incluye el igual, punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span>).',
        'Evaluá el segundo renglón en x = 1: −(1) + 8.',
      ],
      solution: 'En la frontera x = 1, el signo «≥» está en el segundo tramo. Por lo tanto evaluamos −(1) + 8 = <strong>7</strong>.',
    },
    {
      id: 'sec8-q3',
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
      ],
      solution: 'En el gráfico, el punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span> en (2, 1) indica que para x = 2 la única salida asignada es <strong>f(2) = 1</strong>.',
    },
  ],

  'sec-9': [
    {
      id: 'sec9-q1',
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
        'Imaginá trazar la recta vertical x = 3: ¿cuántos puntos cerrados <span class="va-dot va-dot--closed" title="Punto cerrado"></span> tocaría?',
      ],
      solution: 'Si ambos tramos incluyen x = 3 (por ejemplo con ≤ y ≥) y dan alturas distintas, la recta vertical x = 3 corta dos veces a la gráfica: <strong>no es función</strong>.',
    },
    {
      id: 'sec9-q2',
      type: 'number',
      prompt: '<strong>Pegado continuo (Exactas):</strong> ¿Qué valor debe tomar la constante <strong>k</strong> para que la función por partes<br><code>f(x) = { 3x − 1  si x &lt; 2 ;  x + k  si x ≥ 2 }</code><br>no tenga un salto y sus dos ramas se unan en <strong>x = 2</strong>?',
      expected: 3,
      hints: [
        'Calculá a qué altura llega la rama izquierda cuando se acerca a x = 2: 3(2) − 1 = 5.',
        'Para que encajen sin salto, la rama derecha evaluada en x = 2 también debe valer 5: 2 + k = 5.',
      ],
      solution: 'Igualando las alturas laterales en la frontera x = 2: 3(2) − 1 = 2 + k ⇒ 5 = 2 + k ⇒ <strong>k = 3</strong>.',
    },
    {
      id: 'sec9-q3',
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
        '¿Alguna condición incluye el signo igual para x = 0?',
      ],
      solution: 'Ninguna rama toma a x = 0, así que no hay contradicción de unicidad: es una función con dominio <strong>Dom(f) = ℝ − {0}</strong>.',
    },
  ],

  'sec-10': [
    {
      id: 'sec10-q1',
      type: 'number',
      prompt: 'La función parte entera o piso <strong>⌊x⌋</strong> devuelve el mayor entero menor o igual que x. ¿Cuánto vale <strong>⌊2,9⌋</strong>?',
      expected: 2,
      hints: [
        'Ubicá el 2,9 en la recta numérica: está entre los enteros 2 y 3.',
        'El piso ⌊x⌋ siempre mira hacia el entero inmediatamente a la izquierda (el escalón donde estás parado).',
      ],
      solution: 'Como 2 ≤ 2,9 < 3, el mayor entero que no supera a 2,9 es <strong>⌊2,9⌋ = 2</strong>.',
    },
    {
      id: 'sec10-q2',
      type: 'number',
      prompt: '<strong>¡Trampa clásica con negativos!</strong> ¿Cuánto vale la función piso evaluada en un número negativo no entero: <strong>⌊−1,2⌋</strong>?',
      expected: -2,
      hints: [
        '¡No trunques hacia cero! Ubicá −1,2 en la recta numérica: a su derecha está −1 y a su izquierda está −2.',
        '¿Cuál de los dos enteros es MENOR o igual que −1,2? Como −2 < −1,2 < −1, el piso es el de la izquierda.',
      ],
      solution: 'En la recta numérica se cumple −2 ≤ −1,2 < −1. El mayor entero menor o igual que −1,2 está a su izquierda y es <strong>⌊−1,2⌋ = −2</strong> (no −1).',
    },
    {
      id: 'sec10-q3',
      type: 'number',
      prompt: 'Un estacionamiento cobra <strong>$500 por cada hora o fracción</strong> (modelado con la función techo <strong>500·⌈t⌉</strong> para t &gt; 0). Si dejás el auto durante <strong>t = 2,15 horas</strong>, ¿cuánto debés pagar en pesos?',
      expected: 1500,
      hints: [
        'Como superaste las 2 horas (aunque sea por 0,15 h), la función techo ⌈2,15⌉ sube al siguiente entero superior: ⌈2,15⌉ = 3.',
        'Multiplicá 3 horas cobradas por $500.',
      ],
      solution: 'La función techo redondea hacia el entero superior: ⌈2,15⌉ = 3 horas facturadas. El costo total es 500 × 3 = <strong>$1500</strong>.',
    },
  ],
};

/* ---------- Inicialización de Fórmulas Anotadas y Llaves por Partes ---------- */
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

/* ---------- Montaje de los 10 Widgets Interactivos ---------- */

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

// Montaje de Chequeos
Object.entries(CHECKS_DATA).forEach(([secId, questions]) => {
  const slot = document.querySelector(`[data-check="${secId}"]`);
  if (slot) {
    createCheckBlock(slot, questions, secId, () => {
      updateSidebarProgress();
    });
  }
});

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

// Inicializar sidebar, controlador de pizarrón y scroll spy
updateSidebarProgress();
initScrollSpy();
initBlackboardController();

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

initVNTriggers();
