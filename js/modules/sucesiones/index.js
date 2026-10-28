/**
 * index.js — Punto de entrada del Laboratorio de Sucesiones (Lección Lineal).
 * Inicializa navegación, widgets interactivos y gestión de progreso en localStorage.
 */

import { byId, qsa, mount, h } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { createCheckBlock, annotatedFormula, getProgress } from './components.js';

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

// Sistema Visual Novel (Modo Tutora Alaska)
import { playScript } from '../../core/vn.js';
import { VN_SCRIPTS } from './vn-scripts.js';

// Inicializa barra superior global
renderNav();

/* ---------- Gestión de Progreso y Sidebar ---------- */
const TOTAL_SECTIONS = 11;

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
        statusEl.textContent = '✓';
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

const CHECKS_DATA = {
  // CAPÍTULO 1
  'sec-1': [
    {
      id: 'sec1-q1',
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>3, 8, 13, [___]</strong>. (Patrón: suma 5 al término anterior).',
      expected: 18,
      hints: [
        'Fijate cuánto hay que sumar entre 3 y 8, y entre 8 y 13.',
        '3 + 5 = 8 y 8 + 5 = 13. El patrón es sumar 5 al término anterior.',
        'Calculá 13 + 5.',
      ],
      solution: 'En la sucesión 3, 8, 13, …, la diferencia entre términos consecutivos es +5 (8 − 3 = 5 y 13 − 8 = 5). Para hallar el siguiente término sumamos 5 al último término conocido: 13 + 5 = <strong>18</strong>.',
    },
    {
      id: 'sec1-q2',
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>20, 17, 14, [___]</strong>. (Patrón: resta 3 al término anterior).',
      expected: 11,
      hints: [
        '20 − 3 = 17 y 17 − 3 = 14.',
        'Calculá 14 − 3.',
      ],
      solution: 'Cada término se obtiene restando 3 al anterior: 14 − 3 = <strong>11</strong>.',
    },
    {
      id: 'sec1-q3',
      type: 'number',
      prompt: 'Extiende la sucesión: <strong>3, 6, 12, [___]</strong>. (Patrón: multiplica por 2 al término anterior).',
      expected: 24,
      hints: [
        '3 × 2 = 6 y 6 × 2 = 12.',
        'Calculá 12 × 2.',
      ],
      solution: 'Cada término se multiplica por 2: 12 × 2 = <strong>24</strong>.',
    },
    {
      id: 'sec1-q4',
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
        'Para cada lista, compará los dos primeros números: ¿aumenta o disminuye? ¿es por suma o por multiplicación?',
      ],
      solution: '<ul><li>4 a 11: +7</li><li>40 a 20: ÷2</li><li>100 a 96: −4</li><li>4 a 12: ×3</li></ul>',
    },
  ],

  'sec-2': [
    {
      id: 'sec2-q1',
      type: 'number',
      prompt: '¿Cuál es la diferencia común de la sucesión aritmética <strong>2, 8, 14, 20…</strong>?',
      expected: 6,
      hints: [
        'La diferencia común se calcula restando cualquier término menos el anterior: d = a(n) − a(n − 1).',
        'Probá restar 8 − 2 o 14 − 8.',
      ],
      solution: 'La diferencia común es la resta entre dos términos consecutivos: 8 − 2 = 6 (o 14 − 8 = 6). Por lo tanto, <strong>d = 6</strong>.',
    },
    {
      id: 'sec2-q2',
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
        'Pensá en un ejemplo: si arrancás en 10 y d = −3, ¿cuáles son los siguientes términos?',
      ],
      solution: 'Al sumarle una cantidad negativa término a término (como d = −5), el valor se va achicando: la sucesión decrece.',
    },
    {
      id: 'sec2-q3',
      type: 'number',
      prompt: 'Desafío: El primer término de una sucesión aritmética es <strong>10</strong> y su diferencia común es <strong>−7</strong>. ¿Cuál es el <strong>cuarto término a(4)</strong>?',
      expected: -11,
      hints: [
        'Primer término: a(1) = 10.',
        'Segundo término: a(2) = 10 + (−7) = 3. Tercer término: a(3) = 3 + (−7) = −4.',
        'Calculá el cuarto término: a(4) = −4 + (−7).',
      ],
      solution: 'Extendiendo término por término: a(1) = 10, a(2) = 10 − 7 = 3, a(3) = 3 − 7 = −4, a(4) = −4 − 7 = <strong>−11</strong>.',
    },
  ],

  'sec-3': [
    {
      id: 'sec3-q1',
      type: 'number',
      prompt: 'En la sucesión dada por la función <strong>a(n)</strong> con términos <strong>3, 5, 7…</strong>, ¿cuánto vale <strong>a(4)</strong>?',
      expected: 9,
      hints: [
        'a(1) = 3, a(2) = 5, a(3) = 7. El patrón es sumar 2.',
        'Calculá a(4) = 7 + 2.',
      ],
      solution: 'La notación a(4) significa «el cuarto término de la sucesión». Como cada paso suma 2, a(4) = 7 + 2 = <strong>9</strong>.',
    },
    {
      id: 'sec3-q2',
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
        'Fijate que el −1 está dentro del paréntesis junto al índice n, no afuera restando al término.',
      ],
      solution: 'La notación funcional a(n − 1) refiere al término cuyo índice es n − 1, es decir, el término que está justo un escalón antes que a(n).',
    },
  ],

  // CAPÍTULO 2
  'sec-4': [
    {
      id: 'sec4-q1',
      type: 'number',
      prompt: 'Encuentra <strong>b(4)</strong> en la sucesión recursiva dada por: <br><code>{ b(1) = −5 ; b(n) = b(n − 1) + 9 }</code>.',
      expected: 22,
      hints: [
        'Arrancás en b(1) = −5 y sumás 9 en cada escalón.',
        'b(2) = −5 + 9 = 4. b(3) = 4 + 9 = 13.',
        'Calculá b(4) = 13 + 9.',
      ],
      solution: 'b(1) = −5, b(2) = 4, b(3) = 13, b(4) = 13 + 9 = <strong>22</strong>.',
    },
    {
      id: 'sec4-q2',
      type: 'pair',
      prompt: 'Completa <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de la sucesión <strong>12, 7, 2…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: 12, d: -5 },
      hints: [
        'El primer número que ves en la lista es k.',
        'Para hallar d, restá el segundo término menos el primero: 7 − 12.',
      ],
      solution: 'El primer término es <strong>k = 12</strong>. La diferencia común es 7 − 12 = <strong>d = −5</strong>.',
    },
    {
      id: 'sec4-q3',
      type: 'pair',
      prompt: 'Completa <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de la sucesión <strong>−1, −4, −7…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: -1, d: -3 },
      hints: [
        'k es el primer término: −1.',
        'd = −4 − (−1) = −4 + 1.',
      ],
      solution: 'El primer término es <strong>k = −1</strong>. La diferencia común es <strong>d = −3</strong>.',
    },
  ],

  'sec-5a': [
    {
      id: 'sec5a-q1',
      type: 'pair',
      prompt: 'En la fórmula explícita estándar <strong>f(n) = −6 + 2(n − 1)</strong>, ¿cuál es el primer término k y cuál la diferencia común d?',
      kLabel: 'k = f(1)',
      stepLabel: 'd (diferencia)',
      kind: 'ari',
      expected: { k: -6, d: 2 },
      hints: [
        'Compará con la estructura estándar: A + B(n − 1).',
        'El número sumado fuera del paréntesis es el primer término, y el que multiplica a (n − 1) es la diferencia.',
      ],
      solution: 'En la forma estándar k + d(n − 1), vemos directamente que <strong>k = −6</strong> y <strong>d = 2</strong>.',
    },
    {
      id: 'sec5a-q2',
      type: 'expr',
      prompt: 'Escribe una fórmula explícita para la sucesión aritmética <strong>2, 9, 16…</strong>:',
      expected: {
        expr: '2 + 7*(n - 1)',
        kind: 'ari',
        k: 2,
        step: 7,
      },
      hints: [
        'Identificá el primer término: k = 2.',
        'Calculá la diferencia común: d = 9 − 2 = 7.',
        'Armá la fórmula estándar: k + d(n − 1).',
      ],
      solution: 'k = 2 y d = 7. La fórmula explícita estándar es: <strong>2 + 7(n − 1)</strong> (o simplificada −5 + 7n).',
    },
    {
      id: 'sec5a-q3',
      type: 'number',
      prompt: 'Encuentra el <strong>124.º término</strong> de la sucesión aritmética <strong>199, 196, 193…</strong>:',
      expected: -170,
      hints: [
        'Primer término k = 199. Diferencia común d = 196 − 199 = −3.',
        'En n = 124 hay 123 saltos de −3.',
        'Calculá 199 + 123 × (−3).',
      ],
      solution: 'a(124) = 199 + (−3) · (124 − 1) = 199 + (−3) · 123 = 199 − 369 = <strong>−170</strong>.',
    },
  ],

  'sec-5b': [
    {
      id: 'sec5b-q1',
      type: 'number',
      prompt: 'La fórmula explícita de una sucesión es <strong>a(n) = 3 − 4(n − 1)</strong>. ¿Qué número de término es igual a <strong>−65</strong>?',
      expected: 18,
      hints: [
        'Igualá la fórmula a −65: 3 − 4(n − 1) = −65.',
        'Restá 3 a ambos lados: −4(n − 1) = −68.',
        'Dividí por −4: n − 1 = 17. Luego sumá 1.',
      ],
      solution: '−68 = −4(n − 1) ⟹ n − 1 = 17 ⟹ n = 17 + 1 = <strong>18</strong>.',
    },
    {
      id: 'sec5b-q2',
      type: 'number',
      prompt: 'El primer término de una sucesión aritmética es <strong>5</strong> y el décimo término es <strong>59</strong>. ¿Cuál es la diferencia común d?',
      expected: 6,
      hints: [
        'Entre el poste 1 y el poste 10 hay exactamente 10 − 1 = 9 saltos.',
        'La distancia cubierta es 59 − 5 = 54.',
        'Dividí 54 entre 9.',
      ],
      solution: 'd = (59 − 5) / (10 − 1) = 54 / 9 = <strong>6</strong>.',
    },
  ],

  'sec-6': [
    {
      id: 'sec6-q1',
      type: 'pair',
      prompt: 'Dada la fórmula simplificada <strong>a(n) = 10 + 2n</strong>, ¿cuánto valen el primer término a(1) y la diferencia común d?',
      kLabel: 'a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 12, d: 2 },
      hints: [
        '¡Cuidado! 10 NO es el primer término porque la fórmula no está en forma estándar con (n − 1).',
        'Evaluá en n = 1: a(1) = 10 + 2(1).',
        'El coeficiente que multiplica a n es la diferencia común.',
      ],
      solution: 'a(1) = 10 + 2(1) = <strong>12</strong>. La diferencia común es el coeficiente de n: <strong>d = 2</strong>.',
    },
    {
      id: 'sec6-q2',
      type: 'expr',
      prompt: 'Escribe la fórmula equivalente simplificada (sin paréntesis) de <strong>−5, −1, 3, 7…</strong>:',
      expected: {
        expr: '-9 + 4n',
        kind: 'ari',
        k: -5,
        step: 4,
      },
      hints: [
        'El primer término es −5 y la diferencia es 4. La estándar es −5 + 4(n − 1).',
        'Quitá paréntesis: −5 + 4n − 4.',
        'Simplificá los números: −5 − 4 = −9.',
      ],
      solution: '−5 + 4(n − 1) = −5 + 4n − 4 = <strong>−9 + 4n</strong> (o 4n − 9).',
    },
  ],

  'sec-7': [
    {
      id: 'sec7-q1',
      type: 'pair',
      prompt: 'Convierte la fórmula estándar <strong>a(n) = 5 + 12(n − 1)</strong> a su forma recursiva <code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>:',
      kLabel: 'k',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 5, d: 12 },
      hints: [
        'En la forma estándar k + d(n − 1), k y d se leen directamente.',
      ],
      solution: '<strong>k = 5</strong> y <strong>d = 12</strong>.',
    },
    {
      id: 'sec7-q2',
      type: 'pair',
      prompt: 'Convierte <strong>a(n) = −11 − 8(n − 1)</strong> a recursiva:',
      kLabel: 'k',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: -11, d: -8 },
      hints: [
        'Atención a los signos negativos.',
      ],
      solution: '<strong>k = −11</strong> y <strong>d = −8</strong>.',
    },
    {
      id: 'sec7-q3',
      type: 'pair',
      prompt: 'Convierte la fórmula simplificada <strong>a(n) = 1 + 4n</strong> a su forma recursiva:',
      kLabel: 'k = a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 5, d: 4 },
      hints: [
        'Calculá a(1) = 1 + 4(1) para hallar k.',
        'La diferencia d es el número que acompaña a n.',
      ],
      solution: 'a(1) = 1 + 4 = <strong>5</strong>, y <strong>d = 4</strong>.',
    },
    {
      id: 'sec7-q4',
      type: 'pair',
      prompt: 'Convierte la fórmula simplificada <strong>a(n) = 23 − 6n</strong> a su forma recursiva:',
      kLabel: 'k = a(1)',
      stepLabel: 'd',
      kind: 'ari',
      expected: { k: 17, d: -6 },
      hints: [
        'a(1) = 23 − 6(1) = 17.',
        'd = −6.',
      ],
      solution: 'a(1) = 23 − 6 = <strong>17</strong>, y <strong>d = −6</strong>.',
    },
  ],

  // CAPÍTULO 3
  'sec-8': [
    {
      id: 'sec8-q1',
      type: 'number',
      prompt: '¿Cuál es el siguiente término en la sucesión geométrica <strong>1/2, 2, 8, [___]</strong>?',
      expected: 32,
      hints: [
        'Fijate cuánto multiplica en cada salto: 2 / (1/2) = 4, y 8 / 2 = 4.',
        'Calculá 8 × 4.',
      ],
      solution: 'La razón común es r = 4. Por lo tanto: 8 × 4 = <strong>32</strong>.',
    },
    {
      id: 'sec8-q2',
      type: 'pair',
      prompt: 'Encuentra <strong>k</strong> y <strong>r</strong> en la fórmula recursiva de <strong>1/2, 2, 8…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) · r }</code>.',
      kLabel: 'k = a(1)',
      stepLabel: 'r (razón)',
      kind: 'geo',
      expected: { k: 0.5, r: 4 },
      hints: [
        'El primer término es 1/2 = 0,5.',
        'La razón es 2 / (1/2) = 4.',
      ],
      solution: '<strong>k = 0,5</strong> (o 1/2) y <strong>r = 4</strong>.',
    },
    {
      id: 'sec8-q3',
      type: 'expr',
      prompt: 'Escribe una fórmula explícita estándar para <strong>54, 18, 6…</strong>:',
      expected: {
        expr: '54 * (1/3)^(n - 1)',
        kind: 'geo',
        k: 54,
        step: 1 / 3,
      },
      hints: [
        'Primer término k = 54.',
        'Razón común: dividir por 3 es multiplicar por 1/3 (r = 1/3).',
        'Fórmula estándar: k · r^(n − 1).',
      ],
      solution: 'k = 54 y r = 1/3. La fórmula explícita estándar es: <strong>54 · (1/3)^(n − 1)</strong>.',
    },
    {
      id: 'sec8-q4',
      type: 'expr',
      prompt: 'Escribe una fórmula explícita para <strong>1/2, 2, 8…</strong>:',
      expected: {
        expr: '1/2 * 4^(n - 1)',
        kind: 'geo',
        k: 0.5,
        step: 4,
      },
      hints: [
        'k = 1/2 y r = 4.',
        'Fórmula: 1/2 · 4^(n − 1) (o equivalente 1/8 · 4^n).',
      ],
      solution: 'Fórmula estándar: <strong>1/2 · 4^(n − 1)</strong> (o equivalente 1/8 · 4^n).',
    },
  ],

  'sec-9': [
    {
      id: 'sec9-q1',
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
        'Primer término k = 8.',
        'Razón r = −5.',
        '¡Recordá poner paréntesis en (−5) para no alterar la jerarquía de potencias!',
      ],
      solution: 'Fórmula correcta: <strong>8 · (−5)^(n − 1)</strong>.',
    },
    {
      id: 'sec9-q2',
      type: 'number',
      prompt: 'Calcula el valor numérico exacto de <strong>a(4)</strong> para esa misma sucesión:',
      expected: -1000,
      hints: [
        'a(4) = 8 · (−5)^(4 − 1) = 8 · (−5)³.',
        '(−5)³ = −125.',
        '8 × (−125) = −1000.',
      ],
      solution: 'a(4) = 8 · (−5)³ = 8 · (−125) = <strong>−1000</strong>.',
    },
  ],

  'sec-10': [
    {
      id: 'sec10-q1',
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
        'El 10% se calcula sobre el saldo del año anterior, no como un monto estático.',
        'Saldo = Saldo viejo · (1 + 0,10).',
      ],
      solution: 'Es una sucesión geométrica con factor multiplicador <strong>r = 1,10</strong>.',
    },
    {
      id: 'sec10-q2',
      type: 'pair',
      prompt: 'Completa <strong>k = a(1)</strong> y la razón común <strong>r</strong> para la cuenta de Caden:',
      kLabel: 'k = Saldo año 1',
      stepLabel: 'r = Factor anual',
      kind: 'geo',
      expected: { k: 70, r: 1.1 },
      hints: [
        'Depósito inicial k = 70.',
        'Factor anual r = 1 + 0,10 = 1,1.',
      ],
      solution: '<strong>k = 70</strong> y <strong>r = 1,1</strong>.',
    },
  ],

  'sec-11': [
    {
      id: 'sec11-q1',
      type: 'number',
      prompt: 'Para la sucesión geométrica <strong>64, 16, 4, 1, 1/4…</strong>, ¿hacia qué número tienden los términos a medida que n tiende a infinito (<strong>lim n→∞ a(n)</strong>)?',
      expected: 0,
      hints: [
        'Observá cómo cada número es la cuarta parte del anterior: 64, 16, 4, 1, 0.25, 0.0625, 0.0156...',
        'Se van haciendo infinitesimalmente pequeños acercándose a un valor límite.',
      ],
      solution: 'Como la razón es 1/4 (|r| < 1), los términos se achican indefinidamente aproximándose a <strong>0</strong>.',
    },
    {
      id: 'sec11-q2',
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
        'Pensá qué pasa con (1/2)ⁿ vs 2ⁿ a medida que n se hace gigante.',
      ],
      solution: 'Una sucesión geométrica converge a 0 si y solo si <strong>|r| &lt; 1</strong>.',
    },
  ],
};

/* ---------- Inicialización de Fórmulas Anotadas ---------- */
const an4 = document.getElementById('annotated-sec-4') || document.querySelector('[data-annotated="sec-4"]');
if (an4) annotatedFormula(an4, { type: 'recursive', seqName: 'a', k: 3, step: 2, kind: 'ari' });

const an5a = document.getElementById('annotated-sec-5a') || document.querySelector('[data-annotated="sec-5a"]');
if (an5a) annotatedFormula(an5a, { type: 'explicit', seqName: 'a', k: 3, step: 2, kind: 'ari' });

const an8 = document.getElementById('annotated-sec-8') || document.querySelector('[data-annotated="sec-8"]');
if (an8) annotatedFormula(an8, { type: 'explicit', seqName: 'a', k: 54, step: 1 / 3, stepStr: '1/3', kind: 'geo' });

/* ---------- Montaje de Widgets ---------- */

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
