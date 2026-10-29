/**
 * widgets/traslacion-vh.js — Widget interactivo para la Sección 3:
 * Desplazar la «V» sin recetas mágicas (f(x) = |x - h| + k) con el Buscador de Distancia Cero
 * y todos los ejemplos de Khan Academy como presets vivos.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, paren, MINUS } from '../../../core/math-format.js';
import { createAbsBoard } from '../components.js';
import { formatCanonicalAbs } from '../logic.js';

const KHAN_PRESETS = [
  { label: 'Base: y = |x|', h: 0, k: 0 },
  { label: 'Khan 1: y = |x + 3| − 2', h: -3, k: -2 },
  { label: 'Khan 2: f(x) = |x − 1| + 5', h: 1, k: 5 },
  { label: 'Khan 3: y = |x + 4|', h: -4, k: 0 },
];

export function initTraslacionVHWidget(container) {
  let hVal = -3;
  let kVal = -2;

  function render() {
    const insideRaw = hVal === 0
      ? 'x'
      : hVal > 0
      ? `x ${MINUS} ${fmt(hVal)}`
      : `x + ${fmt(Math.abs(hVal))}`;

    const presetBar = h('div', { class: 'seq-controls' },
      KHAN_PRESETS.map((p) =>
        h('button', {
          type: 'button',
          class: ['chip', p.h === hVal && p.k === kVal ? 'is-active' : ''],
          on: {
            click: () => {
              hVal = p.h;
              kVal = p.k;
              render();
            },
          },
        }, p.label)
      )
    );

    const slidersRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Desplazamiento horizontal h (${fmt(hVal)}): `,
        h('input', {
          type: 'range',
          min: '-6',
          max: '6',
          step: '1',
          value: String(hVal),
          on: {
            input: (e) => {
              hVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label' },
        `Desplazamiento vertical k (${fmt(kVal)}): `,
        h('input', {
          type: 'range',
          min: '-6',
          max: '6',
          step: '1',
          value: String(kVal),
          on: {
            input: (e) => {
              kVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      )
    );

    const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.4; min-width: 280px;' });
    createAbsBoard(boardSlot, {
      a: 1,
      h: hVal,
      k: kVal,
      xMin: -7,
      xMax: 7,
      yMin: -7,
      yMax: 7,
      snapStep: 1,
      draggableVertex: true,
      referenceCurve: { a: 1, h: 0, k: 0 },
      onChange(next) {
        hVal = next.h;
        kVal = next.k;
        render();
      },
    });

    // Tarjeta «Buscador de Distancia Cero»
    const zeroFinderCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 250px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Buscador de Distancia Cero'),
      h('p', { class: 'eq', style: 'font-size: 1.4rem; margin: 6px 0; color: var(--yellow);' },
        `f(x) = ${formatCanonicalAbs(1, hVal, kVal)}`
      ),
      h('p', { class: 'small' },
        h('strong', null, '1.º ¿Por qué el signo adentro de las barras parece al revés?'),
        h('br'),
        `Porque escribimos |x ${MINUS} h| = |x ${MINUS} ${paren(hVal)}| = `,
        h('strong', { class: 'eq' }, `|${insideRaw}|`),
        '.'
      ),
      h('p', { class: 'small' },
        h('strong', null, '2.º ¿Qué valor de x anula la distancia dentro de las barras?'),
        h('br'),
        h('span', { class: 'eq', style: 'color: var(--green); font-size: 1.15rem;' },
          `${insideRaw} = 0  ⟺  x = ${fmt(hVal)}`
        )
      ),
      h('p', { class: 'small' },
        h('strong', null, '3.º ¿Cuánto vale la altura f(x) en ese instante?'),
        h('br'),
        h('span', { class: 'eq', style: 'color: var(--yellow); font-size: 1.15rem;' },
          `f(${fmt(hVal)}) = |0| ${kVal >= 0 ? `+ ${fmt(kVal)}` : `${MINUS} ${fmt(Math.abs(kVal))}`} = ${fmt(kVal)}`
        )
      ),
      h('div', { class: 'notice notice--ok', style: 'margin-top: 10px;' },
        h('span', { class: 'small' },
          `Vértice clavado en V(${fmt(hVal)}; ${fmt(kVal)}) · Eje de simetría: x = ${fmt(hVal)}`
        )
      )
    );

    mount(
      container,
      presetBar,
      slidersRow,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, zeroFinderCard)
    );
  }

  render();
}
