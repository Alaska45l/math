/**
 * widgets/rosetta.js — Widget interactivo para la Sección 7:
 * La Piedra de Rosetta de las sucesiones aritméticas.
 * Sincronización en vivo entre la cinta, la tabla n | a(n), la llave recursiva,
 * la explícita estándar y la explícita simplificada.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';
import { parse } from '../expr.js';
import { fromExplicit } from '../logic.js';

const PRESETS = [
  { label: '5 + 12(n − 1)', k: 5, d: 12 },
  { label: '−11 − 8(n − 1)', k: -11, d: -8 },
  { label: '1 + 4n (Simplificada)', k: 5, d: 4 },
  { label: '23 − 6n (Simplificada)', k: 17, d: -6 },
];

export function initRosettaWidget(container) {
  let kVal = 5;
  let dVal = 4;
  let formulaInput = '1 + 4n';

  function render() {
    const c0 = kVal - dVal;
    const terms = [1, 2, 3, 4, 5].map((n) => kVal + (n - 1) * dVal);

    const presetButtons = h('div', { class: 'seq-controls' },
      PRESETS.map((p) =>
        h('button', {
          type: 'button',
          class: 'chip',
          on: {
            click: () => {
              kVal = p.k;
              dVal = p.d;
              formulaInput = p.label.split(' ')[0];
              render();
            },
          },
        }, p.label)
      )
    );

    // Controles directos de k y d
    const controls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Primer término k: ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          value: kVal,
          on: {
            change: (e) => {
              kVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label' },
        'Diferencia común d: ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          value: dVal,
          on: {
            change: (e) => {
              dVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label' },
        'O ingresar cualquier fórmula explícita: ',
        h('input', {
          type: 'text',
          class: 'seq-check__input',
          value: formulaInput,
          placeholder: 'ej. 23 - 6n',
          on: {
            change: (e) => {
              formulaInput = e.target.value;
              const parsed = parse(formulaInput);
              if (parsed.ok) {
                const extracted = fromExplicit(parsed.ast, 'ari');
                if (extracted) {
                  kVal = extracted.k;
                  dVal = extracted.step;
                  render();
                }
              }
            },
          },
        })
      )
    );

    // 1. Cinta de términos y saltos
    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms,
      startIndex: 1,
      hop: { op: dVal >= 0 ? '+' : '-', value: Math.abs(dVal) },
      travelled: 4,
    });

    // 2. Tabla n | a(n)
    const tableEl = h('div', { class: 'seq-table-wrap', style: 'flex: 1; min-width: 180px;' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'n'),
            h('th', null, 'a(n)')
          )
        ),
        h('tbody', null,
          terms.map((t, idx) =>
            h('tr', null,
              h('td', null, `n = ${idx + 1}`),
              h('td', null, h('strong', null, fmt(t)))
            )
          )
        )
      )
    );

    // 3. Llave recursiva
    const dRecSign = dVal >= 0 ? `+ ${fmt(dVal)}` : `${MINUS} ${fmt(Math.abs(dVal))}`;
    const recursivePanel = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 220px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Llave Recursiva'),
      h('div', { class: 'seq-annotated__brace-box' },
        h('div', { class: 'seq-annotated__brace' }, '{'),
        h('div', { class: 'seq-annotated__cases' },
          h('div', null, `a(1) = `, h('strong', { style: 'color: var(--yellow);' }, fmt(kVal))),
          h('div', null, `a(n) = a(n − 1) `, h('strong', { style: 'color: var(--blue);' }, dRecSign))
        )
      )
    );

    // 4. Explícita Estándar y Simplificada
    const dStdSign = dVal >= 0 ? `+ ${fmt(dVal)}` : `${MINUS} ${fmt(Math.abs(dVal))}`;
    const dSimpSign = dVal >= 0 ? `+ ${fmt(dVal)}n` : `${MINUS} ${fmt(Math.abs(dVal))}n`;

    const explicitPanel = h('div', { class: 'seq-check__card', style: 'flex: 1.2; min-width: 260px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Fórmulas Explícitas'),
      h('div', { style: 'margin-bottom: 10px;' },
        h('span', { class: 'small muted' }, 'Forma estándar k + d(n − 1):'),
        h('p', { class: 'eq', style: 'font-size: 1.25rem; margin: 4px 0;' },
          `a(n) = `,
          h('strong', { style: 'color: var(--yellow);' }, fmt(kVal)),
          ` ${dStdSign} · (n − 1)`
        )
      ),
      h('div', null,
        h('span', { class: 'small muted' }, 'Forma simplificada c₀ + d·n:'),
        h('p', { class: 'eq', style: 'font-size: 1.25rem; margin: 4px 0;' },
          `a(n) = `,
          h('strong', null, fmt(c0)),
          ` ${dSimpSign}`
        ),
        h('span', { class: 'small muted' }, `(donde c₀ = k − d = ${fmt(kVal)} − (${fmt(dVal)}) = ${fmt(c0)})`)
      )
    );

    const panelsRow = h('div', { class: 'seq-controls', style: 'align-items: stretch;' },
      tableEl,
      recursivePanel,
      explicitPanel
    );

    mount(container,
      presetButtons,
      controls,
      ribbonSlot,
      panelsRow
    );
  }

  render();
}
