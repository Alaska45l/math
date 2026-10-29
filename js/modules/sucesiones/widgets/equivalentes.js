/**
 * widgets/equivalentes.js — Widget interactivo para la Sección 6:
 * Fórmulas equivalentes y la trampa mortal de examen (2 + 6(n − 1) vs 2 + 6n).
 */

import { h, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { parse, evalRange, equivalent, toDisplay } from '../expr.js';

const PRESETS = [
  {
    label: 'Caso Khan: 2 + 6(n − 1) vs. 2 + 6n (Trampa común)',
    fA: '2 + 6(n - 1)',
    fB: '2 + 6n',
  },
  {
    label: 'Caso Khan: 2 + 6(n − 1) vs. −4 + 6n (Equivalente simplificada)',
    fA: '2 + 6(n - 1)',
    fB: '-4 + 6n',
  },
  {
    label: 'Caso: 3 + 2(n − 1) vs. 1 + 2n vs. 5 + 2(n − 2)',
    fA: '3 + 2(n - 1)',
    fB: '1 + 2n',
  },
];

export function initEquivalentesWidget(container) {
  let formA = '2 + 6(n - 1)';
  let formB = '2 + 6n';

  const presetButtons = h('div', { class: 'seq-controls' },
    PRESETS.map((pr) =>
      h('button', {
        type: 'button',
        class: 'chip',
        on: {
          click: () => {
            formA = pr.fA;
            formB = pr.fB;
            inputA.value = formA;
            inputB.value = formB;
            updateDynamic();
          },
        },
      }, pr.label)
    )
  );

  const inputA = h('input', {
    type: 'text',
    class: 'seq-check__input',
    value: formA,
    on: {
      input: (e) => {
        formA = e.target.value;
        updateDynamic();
      },
    },
  });

  const inputB = h('input', {
    type: 'text',
    class: 'seq-check__input',
    value: formB,
    on: {
      input: (e) => {
        formB = e.target.value;
        updateDynamic();
      },
    },
  });

  const parsedHintA = h('div', { class: 'muted small' });
  const parsedHintB = h('div', { class: 'muted small' });

  const inputRow = h('div', { class: 'seq-controls', style: 'align-items: flex-start;' },
    h('div', { style: 'flex: 1; min-width: 220px;' },
      h('label', { class: 'field__label' }, 'Fórmula A: ', inputA),
      parsedHintA
    ),
    h('div', { style: 'flex: 1; min-width: 220px;' },
      h('label', { class: 'field__label' }, 'Fórmula B: ', inputB),
      parsedHintB
    )
  );

  const dynamicSlot = h('div');

  mount(container, presetButtons, inputRow, dynamicSlot);

  function updateDynamic() {
    const parsedA = parse(formA);
    const parsedB = parse(formB);

    const valsA = parsedA.ok ? evalRange(parsedA.ast, 1, 5) : [];
    const valsB = parsedB.ok ? evalRange(parsedB.ast, 1, 5) : [];

    const isMatch = parsedA.ok && parsedB.ok && equivalent(parsedA.ast, parsedB.ast, { from: 1, to: 5 });

    parsedHintA.textContent = parsedA.ok ? `Interpretado como: ${toDisplay(parsedA.ast)}` : 'Sintaxis incompleta';
    parsedHintB.textContent = parsedB.ok ? `Interpretado como: ${toDisplay(parsedB.ast)}` : 'Sintaxis incompleta';

    // Tabla comparativa término a término
    const nList = [1, 2, 3, 4, 5];
    const table = h('div', { class: 'seq-table-wrap' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Poste n'),
            h('th', null, `Fórmula A: ${formA}`),
            h('th', null, `Fórmula B: ${formB}`),
            h('th', null, '¿Coinciden?')
          )
        ),
        h('tbody', null,
          nList.map((n, i) => {
            const vA = valsA[i];
            const vB = valsB[i];
            const cellMatch = typeof vA === 'number' && typeof vB === 'number' && Math.abs(vA - vB) < 1e-4;
            return h('tr', { class: cellMatch ? '' : 'is-mismatch' },
              h('td', null, `n = ${n}`),
              h('td', null, typeof vA === 'number' ? fmt(vA) : '?'),
              h('td', null, typeof vB === 'number' ? fmt(vB) : '?'),
              h('td', null,
                cellMatch
                  ? h('span', { style: 'color: var(--green); display: inline-flex; align-items: center; gap: 4px;' },
                      chalkIcon('check', { width: 14, height: 14 }),
                      'Idéntico'
                    )
                  : h('span', { style: 'color: var(--pink); font-weight: bold; display: inline-flex; align-items: center; gap: 4px;' },
                      chalkIcon('cross', { width: 14, height: 14 }),
                      'Desfasado'
                    )
              )
            );
          })
        )
      )
    );

    // Cartel explicativo
    const verdict = h('div', { class: ['notice', isMatch ? 'notice--ok' : 'notice--err'] },
      isMatch
        ? h('div', null,
            h('strong', { style: 'display: inline-flex; align-items: center; gap: 5px;' },
              chalkIcon('check', { width: 16, height: 16 }),
              'Fórmulas equivalentes: '
            ),
            h('span', null, 'Ambas expresiones generan exactamente los mismos números término a término en todo el dominio ℕ.')
          )
        : h('div', null,
            h('strong', { style: 'display: inline-flex; align-items: center; gap: 5px;' },
              chalkIcon('cross', { width: 16, height: 16 }),
              '¡Cuidado con el desfasaje! '
            ),
            h('p', { style: 'margin: 4px 0;' },
              'Al omitir los paréntesis en ',
              h('code', null, '(n − 1)'),
              ' y escribir ',
              h('code', null, '2 + 6n'),
              ', en n = 1 ya sumaste 6 una vez antes de empezar. El primer término obtenido es 8 en lugar de 2: ¡la sucesión quedó corrida un escalón hacia adelante!'
            )
          )
    );

    mount(dynamicSlot, table, verdict);
  }

  updateDynamic();
}
