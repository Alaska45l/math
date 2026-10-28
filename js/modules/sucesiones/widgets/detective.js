/**
 * widgets/detective.js — Widget interactivo para la Sección 2:
 * Detective de patrones: compara diferencias consecutivas vs. razones consecutivas.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';
import { classify } from '../logic.js';

const CASES = [
  { id: 'ari1', label: '3, 5, 7, 9', terms: [3, 5, 7, 9], title: 'Aritmética creciente (+2)' },
  { id: 'ari2', label: '21, 16, 11, 6', terms: [21, 16, 11, 6], title: 'Aritmética decreciente (−5)' },
  { id: 'geo1', label: '1, 2, 4, 8', terms: [1, 2, 4, 8], title: 'Geométrica (×2)' },
  { id: 'cuad', label: '1, 4, 9, 16', terms: [1, 4, 9, 16], title: 'Cuadrados (ninguna de las dos)' },
  { id: 'fibo', label: '1, 1, 2, 3, 5, 8', terms: [1, 1, 2, 3, 5, 8], title: 'Fibonacci (ninguna de las dos)' },
  { id: 'both', label: '5, 5, 5, 5', terms: [5, 5, 5, 5], title: 'Constante (aritmética y geométrica)' },
];

export function initDetectiveWidget(container) {
  let caseIdx = 0;

  function render() {
    const c = CASES[caseIdx];
    const cl = classify(c.terms);

    const selectorButtons = h('div', { class: 'seq-controls' },
      CASES.map((item, idx) => {
        const btn = h('button', {
          type: 'button',
          class: ['chip', idx === caseIdx ? 'is-active' : ''],
        }, item.label);
        btn.addEventListener('click', () => {
          caseIdx = idx;
          render();
        });
        return btn;
      })
    );

    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms: c.terms,
      startIndex: 1,
    });

    const isDiffConst = cl.kind === 'ari' || cl.kind === 'both';
    const isRatioConst = cl.kind === 'geo' || cl.kind === 'both';

    // Fila de diferencias
    const diffCells = cl.differences.map((d, i) => {
      const dSign = d >= 0 ? `+${fmt(d)}` : fmt(d);
      return h('div', { class: ['seq-detective__cell', isDiffConst ? 'is-highlight' : ''] },
        h('span', { class: 'seq-detective__sub' }, `a(${i + 2}) − a(${i + 1}): `),
        h('strong', null, dSign)
      );
    });

    // Fila de razones
    const ratioCells = cl.ratios.map((r, i) => {
      const rStr = r === null ? 'indef' : `× ${fmt(r)}`;
      return h('div', { class: ['seq-detective__cell', isRatioConst ? 'is-highlight' : ''] },
        h('span', { class: 'seq-detective__sub' }, `a(${i + 2}) / a(${i + 1}): `),
        h('strong', null, rStr)
      );
    });

    const comparisonTable = h('div', { class: 'seq-detective__grid' },
      h('div', { class: ['seq-detective__row', isDiffConst ? 'is-constant' : ''] },
        h('div', { class: 'seq-detective__header' },
          h('strong', null, 'Diferencias consecutivas:'),
          h('span', { class: 'small' }, isDiffConst ? '✓ Constantes (diferencia común)' : '✗ Variables (no aritmética)')
        ),
        h('div', { class: 'seq-detective__values' }, ...diffCells)
      ),
      h('div', { class: ['seq-detective__row', isRatioConst ? 'is-constant' : ''] },
        h('div', { class: 'seq-detective__header' },
          h('strong', null, 'Razones o cocientes:'),
          h('span', { class: 'small' }, isRatioConst ? '✓ Constantes (razón común)' : '✗ Variables (no geométrica)')
        ),
        h('div', { class: 'seq-detective__values' }, ...ratioCells)
      )
    );

    const verdictBox = h('div', { class: 'notice notice--info' },
      h('strong', null, `Diagnóstico del detective: `),
      h('span', null, cl.why)
    );

    mount(container,
      selectorButtons,
      ribbonSlot,
      comparisonTable,
      verdictBox
    );
  }

  render();
}
