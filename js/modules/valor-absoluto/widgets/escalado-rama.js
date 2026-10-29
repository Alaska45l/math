/**
 * widgets/escalado-rama.js — Widget interactivo para la Sección 4:
 * Escalar y reflejar funciones de valor absoluto (f(x) = a|x|) y comparador -|x| vs |-x|.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml, MINUS } from '../../../core/math-format.js';
import { createAbsBoard } from '../components.js';
import { approxEq } from '../logic.js';

const PRESETS_A = [
  { label: 'y = |x| (a = 1)', a: 1 },
  { label: 'y = 3|x| (a = 3)', a: 3 },
  { label: 'y = 1/2 |x| (a = 0,5)', a: 0.5 },
  { label: 'y = −|x| (a = −1)', a: -1 },
  { label: 'y = −2|x| (a = −2)', a: -2 },
  { label: 'y = −1/3 |x|', a: -1 / 3 },
];

export function initEscaladoRamaWidget(container) {
  let aVal = 3;
  let compareSignMode = false;

  function renderCoeffNode(a) {
    if (approxEq(a, 0.5)) return fractionHtml('1', '2');
    if (approxEq(a, -0.5)) return h('span', null, MINUS, fractionHtml('1', '2'));
    if (approxEq(a, -1 / 3)) return h('span', null, MINUS, fractionHtml('1', '3'));
    if (approxEq(a, 1)) return '';
    if (approxEq(a, -1)) return MINUS;
    return fmt(a);
  }

  function render() {
    const presetRow = h('div', { class: 'seq-controls' },
      PRESETS_A.map((p) =>
        h('button', {
          type: 'button',
          class: ['chip', approxEq(p.a, aVal) && !compareSignMode ? 'is-active' : ''],
          on: {
            click: () => {
              compareSignMode = false;
              aVal = p.a;
              render();
            },
          },
        }, p.label)
      ),
      h('button', {
        type: 'button',
        class: ['chip', compareSignMode ? 'is-active' : ''],
        on: {
          click: () => {
            compareSignMode = !compareSignMode;
            if (compareSignMode) aVal = -1;
            render();
          },
        },
      }, '¿Menos afuera −|x| vs. Menos adentro |−x|?')
    );

    const sliderRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Factor de apertura y sentido a (${fmt(aVal)}): `,
        h('input', {
          type: 'range',
          min: '-4',
          max: '4',
          step: '0.5',
          value: String(approxEq(aVal, -1 / 3) ? -0.5 : aVal),
          on: {
            input: (e) => {
              let v = parseFloat(e.target.value);
              if (Math.abs(v) < 0.1) v = 0.5;
              aVal = v;
              render();
            },
          },
        })
      )
    );

    const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.4; min-width: 280px;' });
    createAbsBoard(boardSlot, {
      a: aVal,
      h: 0,
      k: 0,
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      snapStep: 0.5,
      draggableSlope: true,
      showSlopeTriangles: true,
      referenceCurve: { a: 1, h: 0, k: 0 },
      onChange(next) {
        aVal = next.a;
        render();
      },
    });

    const absA = Math.abs(aVal);
    const scaleDesc = approxEq(absA, 1)
      ? 'Misma abertura que la función madre |x| (45°).'
      : absA > 1
      ? `Estiramiento vertical (|a| = ${fmt(absA)} > 1): la «V» es más cerrada y empinada.`
      : `Compresión vertical (0 < |a| = ${fmt(absA)} < 1): la «V» es más ancha y abierta.`;

    const dirDesc = aVal > 0
      ? 'Abre hacia arriba (forma de V): tiene un mínimo absoluto en (0; 0).'
      : 'Reflejada verticalmente hacia abajo (forma de Λ): tiene un máximo absoluto en (0; 0).';

    const sideCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 250px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' },
        compareSignMode ? 'Duelo de Signos: −|x| vs. |−x|' : 'Anatomía del Coeficiente a'
      ),
      h('div', { class: 'eq', style: 'font-size: 1.45rem; margin: 8px 0; color: var(--yellow); display: flex; align-items: center; gap: 4px;' },
        'y = ',
        renderCoeffNode(aVal),
        '|x|'
      ),
      compareSignMode
        ? h('div', null,
            h('p', { class: 'small' },
              h('strong', { style: 'color: var(--pink);' }, '• Menos AFUERA: y = −|x|'),
              h('br'),
              'Primero calculás |x| (siempre ≥ 0) y al resultado final lo multiplicás por −1. Por ejemplo, para x = 3: −|3| = −3. ¡Vuelca toda la gráfica hacia abajo!'
            ),
            h('p', { class: 'small' },
              h('strong', { style: 'color: var(--green);' }, '• Menos ADENTRO: y = |−x|'),
              h('br'),
              'El signo menos queda atrapado dentro de las barras: como la distancia de −x al 0 es idéntica a la de x al 0, ',
              h('span', { class: 'eq' }, '|−x| = |x|'),
              '. ¡La gráfica gris punteada arriba queda intacta!'
            )
          )
        : h('div', null,
            h('p', { class: 'small' },
              h('strong', null, 'Puntos testigo en x = ±1: '),
              `(${fmt(1)}; ${fmt(aVal)}) y (${fmt(-1)}; ${fmt(aVal)}).`
            ),
            h('p', { class: 'small' }, scaleDesc),
            h('p', { class: 'small', style: 'color: var(--yellow);' }, dirDesc)
          )
    );

    mount(
      container,
      presetRow,
      sliderRow,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, sideCard)
    );
  }

  render();
}
