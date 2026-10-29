/**
 * retos.js — Capítulo 4:
 * 1. Entrenador Infinito por Semilla PRNG (mulberry32) con los 8 tipos de problemas.
 * 2. Las 5 Trampas Clásicas de Examen (Khan Academy + Exactas).
 * 3. Minijuego / Modo Boss Cartesiano: «El Escudo Deflector V» (3 rondas).
 */

import { h, s, mount, chalkIcon } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';
import { createAbsBoard, createCheckBlock } from './components.js';
import {
  approxEq,
  formatCanonicalAbs,
  toPiecewise,
  analyzeAbs,
  solveAbsComparison,
} from './logic.js';
import { react } from '../../core/vn.js';
import { playSuccess, playError } from '../../core/sound.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Genera 1 de los 8 tipos de problemas reproducibles por semilla:
 * 0. hallar_vertice
 * 1. ecuacion_desde_grafica
 * 2. graficar_interactivo
 * 3. desarmar_en_partes
 * 4. rango_y_positividad
 * 5. evaluar_por_partes
 * 6. dominio_rango_partes
 * 7. resolver_modulo
 */
export function generateAbsProblem(seed, typeFilter = -1) {
  const rand = mulberry32(seed);
  const choice = (arr) => arr[Math.floor(rand() * arr.length)];
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const type = typeFilter >= 0 && typeFilter <= 7 ? typeFilter : Math.floor(rand() * 8);

  switch (type) {
    case 0: {
      // 1. hallar_vertice
      const a = choice([-3, -2, -1, 1, 2, 3]);
      const hVal = choice([-5, -4, -3, -2, 1, 2, 3, 4, 5]);
      const kVal = choice([-5, -3, -2, 2, 3, 4, 6]);
      const exprStr = formatCanonicalAbs(a, hVal, kVal);
      return {
        id: `seed-vert-${seed}`,
        type: 'vertex',
        prompt: `Dada la función <strong>f(x) = ${exprStr}</strong>, hallá las coordenadas exactas de su vértice <strong>(h; k)</strong>:`,
        firstLabel: 'h (coordenada X)',
        secondLabel: 'k (coordenada Y)',
        expected: { a, h: hVal, k: kVal },
        hints: [
          `Preguntate qué valor de x hace que el interior de las barras valga CERO: x − (${fmt(hVal)}) = 0.`,
          `Cuando x = ${fmt(hVal)}, el término con barras vale 0 y queda f(${fmt(hVal)}) = ${fmt(kVal)}.`,
        ],
        solution: `El interior de las barras se anula en <strong>h = ${fmt(hVal)}</strong> y el desplazamiento vertical es <strong>k = ${fmt(kVal)}</strong>. Vértice: <strong>(${fmt(hVal)}; ${fmt(kVal)})</strong>.`,
      };
    }

    case 1: {
      // 2. ecuacion_desde_grafica
      const a = choice([-2, -1, 1, 2, 3]);
      const hVal = choice([-3, -2, -1, 1, 2, 3]);
      const kVal = choice([-3, -2, 1, 2, 3]);
      const exprStr = formatCanonicalAbs(a, hVal, kVal);
      const pRightY = kVal + a;
      return {
        id: `seed-eq-${seed}`,
        type: 'expr',
        prompt: `Una función de valor absoluto tiene su vértice en <strong>V(${fmt(hVal)}; ${fmt(kVal)})</strong> y pasa por el punto <strong>(${fmt(hVal + 1)}; ${fmt(pRightY)})</strong>. Escribí su fórmula <strong>f(x) = a|x − h| + k</strong>:`,
        expected: { a, h: hVal, k: kVal, expr: exprStr },
        hints: [
          `Como el vértice está en (${fmt(hVal)}; ${fmt(kVal)}), la estructura es a|x ${hVal > 0 ? `− ${fmt(hVal)}` : `+ ${fmt(Math.abs(hVal))}`}| ${kVal >= 0 ? `+ ${fmt(kVal)}` : `− ${fmt(Math.abs(kVal))}`}.`,
          `Al avanzar 1 unidad a la derecha desde x = ${fmt(hVal)} hasta x = ${fmt(hVal + 1)}, la altura pasa de ${fmt(kVal)} a ${fmt(pRightY)}, por lo que a = ${fmt(a)}.`,
        ],
        solution: `Con vértice (${fmt(hVal)}; ${fmt(kVal)}) y pendiente derecha a = ${fmt(pRightY)} − (${fmt(kVal)}) = ${fmt(a)}, la ecuación es <strong>${exprStr}</strong>.`,
      };
    }

    case 2: {
      // 3. graficar_interactivo
      const a = choice([-2, -1, 1, 2]);
      const hVal = choice([-3, -2, 1, 2, 3]);
      const kVal = choice([-3, -2, 2, 3]);
      const exprStr = formatCanonicalAbs(a, hVal, kVal);
      return {
        id: `seed-graph-${seed}`,
        type: 'graph-target',
        prompt: `Arrastrá el <strong>Vértice (h; k)</strong> y el <strong>nodo de pendiente</strong> en el plano cartesiano hasta graficar <strong>f(x) = ${exprStr}</strong>:`,
        initial: { a: 1, h: 0, k: 0 },
        expected: { a, h: hVal, k: kVal },
        draggableVertex: true,
        draggableSlope: true,
        snapStep: 1,
        hints: [
          `Paso 1: Llevá el vértice amarillo a (${fmt(hVal)}; ${fmt(kVal)}).`,
          `Paso 2: En x = ${fmt(hVal + 1)}, colocá el nodo azul a la altura y = ${fmt(kVal + a)}.`,
        ],
        solution: `El vértice va en <strong>(${fmt(hVal)}; ${fmt(kVal)})</strong> y el nodo de pendiente derecha en <strong>(${fmt(hVal + 1)}; ${fmt(kVal + a)})</strong>.`,
      };
    }

    case 3: {
      // 4. desarmar_en_partes
      const a = choice([-2, 1, 2, 3]);
      const hVal = choice([-2, 1, 2, 3]);
      const kVal = choice([-3, 1, 2, 4]);
      const pw = toPiecewise(a, hVal, kVal);
      const askLeft = rand() > 0.5;
      const branch = askLeft ? pw.leftBranch : pw.rightBranch;
      const exprStr = formatCanonicalAbs(a, hVal, kVal);
      return {
        id: `seed-pw-${seed}`,
        type: 'pair',
        prompt: `Al desarmar <strong>f(x) = ${exprStr}</strong> como función por partes, la rama ${askLeft ? `izquierda (<strong>${branch.condition}</strong>)` : `derecha (<strong>${branch.condition}</strong>)`} es una recta <code>m·x + b</code>. ¿Cuánto valen su pendiente <strong>m</strong> y su ordenada <strong>b</strong>?`,
        firstLabel: 'Pendiente m',
        secondLabel: 'Ordenada b',
        expected: { first: branch.m, second: branch.b },
        hints: [
          askLeft
            ? `Para x < ${fmt(hVal)}, lo de adentro es negativo y las barras anteponen un signo menos: −(${fmt(a)})(x − (${fmt(hVal)})) + (${fmt(kVal)}).`
            : `Para x ≥ ${fmt(hVal)}, las barras se abren directamente: ${fmt(a)}(x − (${fmt(hVal)})) + (${fmt(kVal)}).`,
          `Aplicá propiedad distributiva para llevarlo a la forma m·x + b.`,
        ],
        solution: `Desarrollando la rama (${branch.condition}): ${branch.rawText} = <strong>${branch.simplifiedText}</strong>. Por lo tanto, <strong>m = ${fmt(branch.m)}</strong> y <strong>b = ${fmt(branch.b)}</strong>.`,
      };
    }

    case 4: {
      // 5. rango_y_positividad
      const a = choice([-2, 2]);
      const hVal = choice([-2, 1, 3]);
      const kVal = choice([-4, 4]);
      const info = analyzeAbs(a, hVal, kVal);
      const exprStr = formatCanonicalAbs(a, hVal, kVal);
      const wrongWithH = a > 0 ? `[${fmt(hVal)}; +∞)` : `(−∞; ${fmt(hVal)}]`;
      const wrongInverted = a > 0 ? `(−∞; ${fmt(kVal)}]` : `[${fmt(kVal)}; +∞)`;
      const rawItems = [
        { text: info.range.text, correct: true, diag: null },
        { text: wrongInverted, correct: false, diag: 'wrong_reflection_sign' },
        { text: wrongWithH, correct: false, diag: 'confused_x_and_y_in_intervals' },
        { text: 'ℝ = (−∞; +∞)', correct: false, diag: null },
      ];
      for (let i = rawItems.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [rawItems[i], rawItems[j]] = [rawItems[j], rawItems[i]];
      }
      const optionDiagnostics = {};
      rawItems.forEach((it, idx) => {
        if (it.diag) optionDiagnostics[idx] = it.diag;
      });
      return {
        id: `seed-rng-${seed}`,
        type: 'choice',
        prompt: `¿Cuál es el <strong>Conjunto Imagen (Rango)</strong> de la función <strong>f(x) = ${exprStr}</strong>?`,
        options: rawItems.map((it) => it.text),
        expected: rawItems.findIndex((it) => it.correct),
        optionDiagnostics,
        explanation: `¡Exacto! Como a = ${fmt(a)} ${a > 0 ? '> 0 (abre hacia arriba)' : '< 0 (abre hacia abajo)'} y el vértice tiene altura k = ${fmt(kVal)}, la imagen es ${info.range.text}.`,
        hints: [
          `Miramos la coordenada Y del vértice (k = ${fmt(kVal)}) y el signo de a = ${fmt(a)}.`,
        ],
        solution: `El conjunto imagen es <strong>${info.range.text}</strong>.`,
      };
    }

    case 5: {
      // 6. evaluar_por_partes
      const c = randInt(-1, 3);
      const m1 = 2, b1 = 1;
      const m2 = -1, b2 = 5;
      const leftClosed = rand() > 0.5;
      const expectedY = leftClosed ? (m1 * c + b1) : (m2 * c + b2);
      return {
        id: `seed-evalpw-${seed}`,
        type: 'number',
        prompt: `Dada la función por partes: <br><code>f(x) = { 2x + 1 si x ${leftClosed ? '≤' : '<'} ${c}  ;  −x + 5 si x ${leftClosed ? '>' : '≥'} ${c} }</code><br>¿Cuánto vale exactamente <strong>f(${c})</strong> en la frontera?`,
        expected: expectedY,
        hints: [
          `Fijate cuál de los dos renglones incluye el signo igual (${leftClosed ? '≤ en el primero' : '≥ en el segundo'}) para x = ${c}.`,
          `Reemplazá x = ${c} únicamente en ese renglón.`,
        ],
        solution: `En x = ${c} gobierna el ${leftClosed ? 'primer' : 'segundo'} tramo porque tiene la desigualdad inclusiva. Evaluando: <strong>f(${c}) = ${fmt(expectedY)}</strong>.`,
      };
    }

    case 6: {
      // 7. dominio_rango_partes
      const y1 = randInt(1, 3);
      const y2 = y1 + 2;
      const y3 = y2 + 2;
      const rawItems = [
        { text: `El conjunto discreto {${y1}; ${y2}; ${y3}}`, correct: true },
        { text: `El intervalo continuo [${y1}; ${y3}]`, correct: false },
        { text: 'El intervalo continuo [0; 6]', correct: false },
        { text: `El intervalo (${y1}; ${y3})`, correct: false },
      ];
      for (let i = rawItems.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [rawItems[i], rawItems[j]] = [rawItems[j], rawItems[i]];
      }
      return {
        id: `seed-step-${seed}`,
        type: 'choice',
        prompt: `Una función escalonada de paso vale <strong>${y1}</strong> para <code>0 ≤ x &lt; 2</code>, vale <strong>${y2}</strong> para <code>2 ≤ x &lt; 4</code> y vale <strong>${y3}</strong> para <code>4 ≤ x ≤ 6</code>. ¿Cuál es su <strong>Rango (Imagen)</strong>?`,
        options: rawItems.map((it) => it.text),
        expected: rawItems.findIndex((it) => it.correct),
        explanation: `¡Impecable! Como la función solo toma esos tres valores constantes aislados, su imagen es el conjunto discreto {${y1}; ${y2}; ${y3}}.`,
        hints: [
          'Proyectá los tres escalones horizontales contra el eje Y: ¿cubren todos los decimales intermedios o solo tres puntos?',
        ],
        solution: `El rango es el conjunto discreto entre llaves <strong>{${y1}; ${y2}; ${y3}}</strong> (mientras que [0; 6] es su dominio).`,
      };
    }

    default: {
      // 8. resolver_modulo
      const hVal = choice([-3, -1, 2, 4]);
      const kVal = choice([1, 2, 3]);
      const dist = choice([2, 3, 4]);
      const c = kVal + dist;
      const sol = solveAbsComparison(1, hVal, kVal, '=', c);
      const exprStr = formatCanonicalAbs(1, hVal, kVal);
      return {
        id: `seed-mod-${seed}`,
        type: 'number',
        prompt: `Resolvé la ecuación con valor absoluto <strong>${exprStr} = ${fmt(c)}</strong> e ingresá la <strong>mayor</strong> de sus dos soluciones reales:`,
        expected: Math.max(...sol.solutions),
        hints: [
          `Restá ${fmt(kVal)} a ambos lados: |x ${hVal > 0 ? `− ${fmt(hVal)}` : `+ ${fmt(Math.abs(hVal))}`}| = ${fmt(dist)}.`,
          `Los dos números a distancia ${fmt(dist)} de ${fmt(hVal)} son ${fmt(hVal - dist)} y ${fmt(hVal + dist)}.`,
        ],
        solution: `${sol.steps.join(' ')} La solución mayor es <strong>x = ${fmt(Math.max(...sol.solutions))}</strong>.`,
      };
    }
  }
}

/**
 * Las 5 Trampas Clásicas de Examen (Khan Academy + Ingreso Exactas).
 */
export const TRAMPAS_EXAMEN = [
  {
    id: 'trampa-abs-1',
    title: 'Trampa 1 · El espejismo del signo de h',
    desc: 'En un parcial piden marcar el vértice de <code>f(x) = |x + 3| − 2</code>. Un alumno recuerda «adentro es X y afuera es Y» y marca el vértice en <strong>(3; −2)</strong>.',
    question: '¿Por qué (3; −2) es falso y cuál es el razonamiento geométrico correcto?',
    options: [
      'Porque en valor absoluto ambas coordenadas siempre deben ser positivas: (3; 2).',
      'Porque el vértice ocurre donde la distancia dentro de las barras se hace CERO: x + 3 = 0 ⟹ x = −3, dando (−3; −2).',
      'Porque el −2 está adentro de las barras y el +3 afuera.',
    ],
    expected: 1,
    optionDiagnostics: { 0: 'inverted_h_sign', 2: 'swapped_h_k' },
    explanation: '¡Exacto! En x = 3 tendrías |3 + 3| − 2 = 4 (no estás en el pico). El pico ocurre en distancia cero: x + 3 = 0 ⟹ x = −3, donde f(−3) = |0| − 2 = −2.',
    hints: [
      'Evaluá f(3) y f(−3) para ver en cuál de los dos las barras valen 0.',
    ],
    solution: 'El vértice ocurre cuando el interior de las barras se anula: <code>x + 3 = 0 ⟺ x = −3</code>. En ese punto, <code>f(−3) = |0| − 2 = −2</code>. Vértice real: <strong>(−3; −2)</strong>.',
  },
  {
    id: 'trampa-abs-2',
    title: 'Trampa 2 · La paradoja de «−x es negativo»',
    desc: 'Al ver la definición por partes <code>|x| = −x si x &lt; 0</code>, un estudiante protesta: <em>«¡Esa fórmula está mal escrita! El valor absoluto es una distancia y nunca puede dar un resultado negativo como −x»</em>.',
    question: '¿Dónde está el error conceptual del estudiante?',
    options: [
      'En que el valor absoluto sí puede dar números negativos cuando graficamos en el tercer cuadrante.',
      'En que para x < 0 el valor absoluto no existe.',
      'En creer que la expresión «−x» es negativa: como x ya es negativo (x < 0), el signo menos delante actúa como inversor y hace que −x sea positivo (ej. si x = −4, −x = −(−4) = +4).',
    ],
    expected: 2,
    explanation: '¡Brillante! Cuando x = −4, la letra x guarda un número negativo adentro. Ponerle un menos adelante (−x) invierte su signo: −(−4) = +4 > 0.',
    hints: [
      'Reemplazá x = −4 en la expresión −x con paréntesis.',
    ],
    solution: 'Si <code>x = −4 &lt; 0</code>, entonces <code>−x = −(−4) = +4 &gt; 0</code>. El signo menos delante de <code>x</code> es el operador opuesto que neutraliza el signo negativo de <code>x</code>.',
  },
  {
    id: 'trampa-abs-3',
    title: 'Trampa 3 · Doble punto cerrado en la frontera',
    desc: 'En una hoja aparece escrito: <code>g(x) = { 2x + 1 si x ≤ 2  ;  x − 1 si x ≥ 2 }</code>.',
    question: '¿Por qué esta expresión escrita así ni siquiera define una función en x = 2?',
    options: [
      'Porque en la frontera x = 2 ambos tramos tienen signo igual (≤ y ≥) y asignan dos alturas distintas (y = 5 e y = 1), violando la unicidad.',
      'Porque las funciones por partes nunca pueden tener tramos con pendiente positiva.',
      'Porque en x = 2 ambos tramos dan el mismo valor y se superponen.',
    ],
    expected: 0,
    explanation: '¡Impecable! En x = 2 el primer renglón da 2(2)+1 = 5 (<span class="va-dot va-dot--closed" title="Punto cerrado"></span>) y el segundo da 2−1 = 1 (<span class="va-dot va-dot--closed" title="Punto cerrado"></span>). Una misma entrada x = 2 tendría dos salidas distintas, violando la definición de función.',
    hints: [
      'Evaluá el primer renglón en x = 2 y el segundo renglón en x = 2.',
    ],
    solution: 'Para que sea función, en <code>x = 2</code> solo uno de los dos tramos puede incluir la igualdad (por ejemplo, <code>x &lt; 2</code> con círculo abierto <span class="va-dot va-dot--open" title="Círculo abierto"></span> arriba y <code>x ≥ 2</code> con punto cerrado <span class="va-dot va-dot--closed" title="Punto cerrado"></span> abajo).',
  },
  {
    id: 'trampa-abs-4',
    title: 'Trampa 4 · El rango de una función de paso',
    desc: 'Una función escalonada tiene tres escalones horizontales a las alturas <strong>y = 1</strong>, <strong>y = 3</strong> e <strong>y = 5</strong> sobre el dominio <code>[0; 6]</code>.',
    question: '¿Cuál es el conjunto Imagen (Rango) correcto?',
    options: [
      'El intervalo continuo [1; 5] escrito entre corchetes.',
      'El conjunto discreto de tres elementos {1; 3; 5} escrito entre llaves.',
      'El intervalo continuo [0; 6].',
    ],
    expected: 1,
    explanation: '¡Exacto! El intervalo [1; 5] incluiría infinitos valores como 2 o 4,3 que la función jamás alcanza. La imagen son exclusivamente los tres números {1; 3; 5}.',
    hints: [
      '¿Existe algún x para el cual la función valga 2 o 3,5?',
    ],
    solution: 'En toda función de paso, al proyectar los escalones horizontales contra el eje Y se obtienen puntos aislados: <strong>Imagen = {1; 3; 5}</strong>.',
  },
  {
    id: 'trampa-abs-5',
    title: 'Trampa 5 · Cancelar √(x²) = x en el parcial de Exactas',
    desc: 'Para resolver la ecuación cuadrática <code>(x − 3)² = 4</code>, un alumno aplica raíz cuadrada en ambos miembros, tacha la raíz con el cuadrado escribiendo <code>x − 3 = 2</code> y entrega como única respuesta <code>x = 5</code>.',
    question: '¿Qué error cometió al simplificar y qué solución perdió en el camino?',
    options: [
      'Debería haber sumado 3 antes de sacar la raíz cuadrada.',
      'La ecuación (x − 3)² = 4 no tiene ninguna solución real.',
      'Olvidó que √((x − 3)²) = |x − 3| = 2, lo que abre dos ramas: x − 3 = 2 (x = 5) y x − 3 = −2 (perdió la segunda solución x = 1).',
    ],
    expected: 2,
    explanation: '¡Nivel universitario desbloqueado! Como √(u²) = |u|, queda |x − 3| = 2, es decir, los puntos a distancia 2 del 3: x = 5 y x = 1. En efecto, (1 − 3)² = (−2)² = 4.',
    hints: [
      'Probá reemplazar x = 1 en (x − 3)² = 4 y fijate cuánto da (−2)².',
    ],
    solution: 'La propiedad real es <code>√((x − 3)²) = |x − 3| = 2</code>, que entrega las dos soluciones simétricas: <strong>x₁ = 5</strong> y <strong>x₂ = 1</strong>.',
  },
];

/**
 * Minijuego / Modo Boss Cartesiano: «El Escudo Deflector V» (3 rondas).
 * El usuario posiciona el Vértice (h; k) y la apertura a de su escudo f(x) = a|x - h| + k
 * para que las ramas de la «V» pasen exactamente por los dos nodos receptores antes o durante la misión.
 */
const BOSS_ROUNDS = [
  {
    round: 1,
    title: 'Ronda 1 · Escudo Estándar en V',
    desc: 'Anclá el núcleo del escudo en el vértice (2; −1) con apertura hacia arriba (a = 1) para interceptar los receptores en (0; 1) y (4; 1).',
    target: { a: 1, h: 2, k: -1 },
    receptors: [
      { x: 0, y: 1 },
      { x: 4, y: 1 },
    ],
  },
  {
    round: 2,
    title: 'Ronda 2 · Cúpula Invertida de Alta Pendiente',
    desc: '¡Ataque desde abajo! Invertí el escudo hacia abajo (a = −2) con vértice en (−1; 4) para cubrir los receptores en (−3; 0) y (1; 0).',
    target: { a: -2, h: -1, k: 4 },
    receptors: [
      { x: -3, y: 0 },
      { x: 1, y: 0 },
    ],
  },
  {
    round: 3,
    title: 'Ronda 3 · Láser de Precisión Fraccionaria',
    desc: 'Ronda final: posicioná el vértice en (0; −3) y abrí las ramas con pendiente suave a = 0,5 (1/2) para pasar exactamente por (−4; −1) y (4; −1).',
    target: { a: 0.5, h: 0, k: -3 },
    receptors: [
      { x: -4, y: -1 },
      { x: 4, y: -1 },
    ],
  },
];

function createBossDeflector(root) {
  let roundIdx = 0;
  let userShield = { a: 1, h: 0, k: 0 };
  let clearedRounds = [false, false, false];
  let feedback = null;

  const roundSelector = h('div', { class: 'seq-controls' });
  const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.4; min-width: 280px;' });

  const titleEl = h('h3', { class: 'seq-sidebar__chapter-title' });
  const descEl = h('p', { class: 'small' });
  const readoutEl = h('p', { class: 'eq', style: 'font-size: 1.3rem; color: var(--yellow); margin: 6px 0;' });

  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' }, '0');
  const valK = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, '0');
  const valA = h('strong', { class: 'eq', style: 'color: var(--pink);' }, '1');

  const sliderH = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: userShield.h,
    'aria-label': 'Vértice h del escudo',
  });
  const sliderK = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: userShield.k,
    'aria-label': 'Vértice k del escudo',
  });
  const sliderA = h('input', {
    type: 'range',
    min: -3,
    max: 3,
    step: 0.5,
    value: userShield.a,
    'aria-label': 'Apertura a del escudo',
  });

  const actionRow = h('div', { class: 'seq-controls' });
  const feedbackSlot = h('div');
  const victorySlot = h('div');

  const board = createAbsBoard(boardSlot, {
    a: userShield.a,
    h: userShield.h,
    k: userShield.k,
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    draggableVertex: true,
    draggableSlope: true,
    customUnderRender(plane) {
      const rData = BOSS_ROUNDS[roundIdx];
      const isRoundCleared = clearedRounds[roundIdx];
      rData.receptors.forEach((rec) => {
        const rx = plane.sx(rec.x);
        const ry = plane.sy(rec.y);
        const beamStartY = rData.target.a > 0 ? plane.sy(6) : plane.sy(-6);

        plane.layers.under.append(
          s('line', {
            x1: rx,
            y1: beamStartY,
            x2: rx,
            y2: ry,
            stroke: isRoundCleared ? 'var(--green)' : 'var(--pink)',
            'stroke-width': '2.2',
            'stroke-dasharray': '5 4',
          }),
          s('circle', {
            cx: rx,
            cy: ry,
            r: 9,
            fill: 'none',
            stroke: isRoundCleared ? 'var(--green)' : 'var(--yellow)',
            'stroke-width': '2.6',
          }),
          s('circle', {
            cx: rx,
            cy: ry,
            r: 3.5,
            fill: isRoundCleared ? 'var(--green)' : 'var(--yellow)',
          }),
          s('text', {
            x: rx,
            y: ry - 14,
            'text-anchor': 'middle',
            fill: 'var(--yellow)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, `Receptor (${fmt(rec.x)}; ${fmt(rec.y)})`)
        );
      });
    },
    onChange(next) {
      userShield = { a: next.a, h: next.h, k: next.k };
      sliderH.value = String(userShield.h);
      sliderK.value = String(userShield.k);
      sliderA.value = String(userShield.a);
      syncReadout();
    },
  });

  function syncReadout() {
    valH.textContent = fmt(userShield.h);
    valK.textContent = fmt(userShield.k);
    valA.textContent = fmt(userShield.a);
    readoutEl.textContent = `Escudo actual: f(x) = ${formatCanonicalAbs(userShield.a, userShield.h, userShield.k)}`;
  }

  sliderH.addEventListener('input', (e) => {
    userShield.h = parseFloat(e.target.value);
    syncReadout();
    board.update({ h: userShield.h });
  });
  sliderK.addEventListener('input', (e) => {
    userShield.k = parseFloat(e.target.value);
    syncReadout();
    board.update({ k: userShield.k });
  });
  sliderA.addEventListener('input', (e) => {
    let v = parseFloat(e.target.value);
    if (approxEq(v, 0)) v = userShield.a >= 0 ? -0.5 : 0.5;
    userShield.a = v;
    sliderA.value = String(v);
    syncReadout();
    board.update({ a: userShield.a });
  });

  const fireCheck = () => {
    const rData = BOSS_ROUNDS[roundIdx];
    const t = rData.target;
    const ok =
      approxEq(userShield.a, t.a) &&
      approxEq(userShield.h, t.h) &&
      approxEq(userShield.k, t.k);

    if (ok) {
      clearedRounds[roundIdx] = true;
      playSuccess('section');
      feedback = {
        ok: true,
        msg: `¡Ataque desviado con éxito! El escudo f(x) = ${formatCanonicalAbs(t.a, t.h, t.k)} interceptó ambos receptores.`,
      };
      react({
        pose: 'feliz',
        tag: `¡Ronda ${rData.round} superada!`,
        html: roundIdx < 2
          ? '¡Tremendo reflejo! Clavaste el vértice y la pendiente justa para desviar los dos haces láser. ¡Pasá a la siguiente ronda!'
          : '¡VICTORIA TOTAL! Dominaste las 3 rondas del Escudo Deflector V. Ya estás blindada para cualquier parcial de Exactas.',
      });
    } else {
      playError(1);
      feedback = {
        ok: false,
        msg: `El escudo todavía no alinea con el objetivo. Pista: buscá vértice (${fmt(t.h)}; ${fmt(t.k)}) y apertura a = ${fmt(t.a)}.`,
      };
      react({
        pose: 'enojada',
        tag: '¡Escudo desalineado!',
        html: `¡Cuidado que pasa el láser! Ajustá el nodo amarillo en <span class="eq">(${fmt(t.h)}; ${fmt(t.k)})</span> y el nodo azul de apertura en <span class="eq">a = ${fmt(t.a)}</span>.`,
      });
    }
    updateBossUI();
  };

  function updateBossUI() {
    const rData = BOSS_ROUNDS[roundIdx];
    const isRoundCleared = clearedRounds[roundIdx];
    const allCleared = clearedRounds.every(Boolean);

    mount(
      roundSelector,
      ...BOSS_ROUNDS.map((r, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === roundIdx ? 'is-active' : ''],
          on: {
            click: () => {
              roundIdx = idx;
              feedback = null;
              updateBossUI();
            },
          },
        },
          clearedRounds[idx] ? chalkIcon('check', { width: 14, height: 14 }) : null,
          `Ronda ${r.round}`
        )
      )
    );

    titleEl.textContent = rData.title;
    descEl.textContent = rData.desc;
    syncReadout();
    board.update({ a: userShield.a, h: userShield.h, k: userShield.k });

    mount(
      actionRow,
      h('button', {
        type: 'button',
        class: 'btn btn--check',
        on: { click: fireCheck },
      }, chalkIcon('shield'), ' Activar Escudo Deflector'),
      roundIdx < BOSS_ROUNDS.length - 1 && isRoundCleared
        ? h('button', {
            type: 'button',
            class: 'btn',
            on: {
              click: () => {
                roundIdx++;
                feedback = null;
                updateBossUI();
              },
            },
          }, 'Siguiente Ronda →')
        : null
    );

    mount(
      feedbackSlot,
      feedback
        ? h('div', { class: ['notice', feedback.ok ? 'notice--ok' : 'notice--err'], style: 'margin-top: 8px;' },
            feedback.ok ? chalkIcon('check') : chalkIcon('cross'),
            h('span', null, feedback.msg)
          )
        : null
    );

    mount(
      victorySlot,
      allCleared
        ? h('div', { class: 'notice notice--ok', style: 'margin-top: 10px;' },
            chalkIcon('check'),
            h('strong', null, '¡Completaste las 3 rondas del Modo Boss «Escudo Deflector V»!')
          )
        : null
    );
  }

  const slidersBox = h('div', { style: 'display: grid; gap: 8px; margin: 10px 0;' },
    h('label', { class: 'field__label' }, 'Vértice h = ', valH, sliderH),
    h('label', { class: 'field__label' }, 'Vértice k = ', valK, sliderK),
    h('label', { class: 'field__label' }, 'Apertura a = ', valA, sliderA)
  );

  const missionCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 260px;' },
    titleEl,
    descEl,
    readoutEl,
    slidersBox,
    actionRow,
    feedbackSlot,
    victorySlot
  );

  mount(
    root,
    roundSelector,
    h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, missionCard)
  );

  updateBossUI();
}

export function initRetosAbsModule(container) {
  let activeTab = 'seed'; // 'seed' | 'trampas' | 'boss'
  let currentSeed = 2048;
  let typeFilter = -1;

  function render() {
    const tabs = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', activeTab === 'seed' ? 'is-active' : ''],
        on: { click: () => { activeTab = 'seed'; render(); } },
      }, '1. Entrenador Infinito por Semilla'),
      h('button', {
        type: 'button',
        class: ['chip', activeTab === 'trampas' ? 'is-active' : ''],
        on: { click: () => { activeTab = 'trampas'; render(); } },
      }, '2. Las 5 Trampas Clásicas de Examen'),
      h('button', {
        type: 'button',
        class: ['chip', activeTab === 'boss' ? 'is-active' : ''],
        on: { click: () => { activeTab = 'boss'; render(); } },
      }, '3. Modo Boss: «El Escudo Deflector V»')
    );

    let contentArea;

    if (activeTab === 'seed') {
      const typeOptions = [
        { id: -1, label: 'Todos los 8 tipos combinados' },
        { id: 0, label: '1. Hallar el vértice (h; k)' },
        { id: 1, label: '2. Ecuación desde datos de la gráfica' },
        { id: 2, label: '3. Graficar arrastrando nodos en el plano' },
        { id: 3, label: '4. Desarmar barras en función por partes' },
        { id: 4, label: '5. Imagen y conjuntos de positividad' },
        { id: 5, label: '6. Evaluar función por partes en la frontera' },
        { id: 6, label: '7. Rango discreto de función escalonada' },
        { id: 7, label: '8. Resolver ecuación con módulo a|x − h| + k = c' },
      ];

      const seedControls = h('div', { class: 'seq-controls' },
        h('label', { class: 'field__label' },
          'Semilla PRNG: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: currentSeed,
            on: {
              change: (e) => {
                currentSeed = parseInt(e.target.value, 10) || 1;
                render();
              },
            },
          })
        ),
        h('button', {
          type: 'button',
          class: 'btn',
          on: {
            click: () => {
              currentSeed = Math.floor(Math.random() * 90000) + 1000;
              render();
            },
          },
        }, 'Nueva semilla aleatoria'),
        h('label', { class: 'field__label' },
          'Tipo de reto: ',
          h('select', {
            class: 'seq-check__match-select',
            on: {
              change: (e) => {
                typeFilter = parseInt(e.target.value, 10);
                render();
              },
            },
          },
            typeOptions.map((opt) =>
              h('option', { value: opt.id, selected: typeFilter === opt.id }, opt.label)
            )
          )
        )
      );

      const generatedQuestions = [
        generateAbsProblem(currentSeed, typeFilter),
        generateAbsProblem(currentSeed + 19, typeFilter),
        generateAbsProblem(currentSeed + 83, typeFilter),
      ];

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, generatedQuestions, `abs-seed-${currentSeed}`);
      contentArea = h('div', null, seedControls, checkSlot);
    } else if (activeTab === 'trampas') {
      const questions = TRAMPAS_EXAMEN.map((t) => ({
        id: t.id,
        type: 'choice',
        prompt: `<strong>${t.title}</strong><br>${t.desc}<br><p><strong>${t.question}</strong></p>`,
        options: t.options,
        expected: t.expected,
        optionDiagnostics: t.optionDiagnostics,
        explanation: t.explanation,
        hints: t.hints,
        solution: t.solution,
      }));

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, questions, 'abs-trampas-clasicas');
      contentArea = h('div', null, checkSlot);
    } else {
      const bossSlot = h('div', null);
      createBossDeflector(bossSlot);
      contentArea = bossSlot;
    }

    mount(container, tabs, contentArea);
  }

  render();
}
