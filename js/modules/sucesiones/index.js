/**
 * index.js — Punto de entrada del Laboratorio de Sucesiones (Lección Lineal).
 * Inicializa navegación, widgets interactivos y gestión de progreso en localStorage.
 */

import { byId, qsa, mount, h } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { createCheckBlock, annotatedFormula, getProgress } from './components.js';
import { initPatronWidget } from './widgets/patron.js';
import { initDetectiveWidget } from './widgets/detective.js';
import { initFuncionWidget } from './widgets/funcion.js';

// Inicializa barra superior global
renderNav();

/* ---------- Gestión de Progreso y Sidebar ---------- */
const TOTAL_SECTIONS = 11;

function updateSidebarProgress() {
  const progress = getProgress();
  const completedKeys = Object.keys(progress).filter((k) => progress[k]);
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

// Resaltar sección activa al hacer scroll
function initScrollSpy() {
  const links = qsa('.seq-sidebar__link[data-sec]');
  const sections = links.map((l) => document.getElementById(l.dataset.sec)).filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach((l) => l.classList.toggle('is-active', l.dataset.sec === id));
      }
    });
  }, { threshold: 0.2 });

  sections.forEach((sec) => observer.observe(sec));
}

/* ---------- Preguntas de Chequeo · Capítulo 1 ---------- */

const CHECKS_DATA = {
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
};

/* ---------- Inicialización de Widgets y Bloques ---------- */

// Fórmulas Anotadas
const an1 = document.getElementById('annotated-sec-1');
if (an1) {
  annotatedFormula(an1, { type: 'explicit', seqName: 'a', k: 3, step: 2, kind: 'ari' });
}

// Widgets del Capítulo 1
const patronContainer = document.querySelector('[data-widget="patron"]');
if (patronContainer) initPatronWidget(patronContainer);

const detectiveContainer = document.querySelector('[data-widget="detective"]');
if (detectiveContainer) initDetectiveWidget(detectiveContainer);

const funcionContainer = document.querySelector('[data-widget="funcion"]');
if (funcionContainer) initFuncionWidget(funcionContainer);

// Montaje de Chequeos del Capítulo 1
Object.entries(CHECKS_DATA).forEach(([secId, questions]) => {
  const slot = document.querySelector(`[data-check="${secId}"]`);
  if (slot) {
    createCheckBlock(slot, questions, secId, () => {
      updateSidebarProgress();
    });
  }
});

// Inicializar sidebar y scroll spy
updateSidebarProgress();
initScrollSpy();
