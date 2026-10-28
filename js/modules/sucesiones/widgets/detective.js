/**
 * widgets/detective.js — Widget interactivo para la Sección 2:
 * Detective de patrones: clasificación rigurosa «Aritmética, geométrica o ninguna».
 * Analiza simultáneamente dos filas: diferencias consecutivas y cocientes consecutivos.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';
import { classify } from '../logic.js';

const PRESETS = [
  { id: 'ari1', label: '3, 5, 7, 9', terms: [3, 5, 7, 9], title: 'Aritmética creciente (+2)' },
  { id: 'ari2', label: '21, 16, 11, 6', terms: [21, 16, 11, 6], title: 'Aritmética decreciente (−5)' },
  { id: 'geo1', label: '1, 2, 4, 8', terms: [1, 2, 4, 8], title: 'Geométrica (×2)' },
  { id: 'cuad', label: '1, 4, 9, 16', terms: [1, 4, 9, 16], title: 'Cuadrados (ninguna de las dos)' },
  { id: 'fibo', label: '1, 1, 2, 3, 5, 8', terms: [1, 1, 2, 3, 5, 8], title: 'Fibonacci (ninguna de las dos)' },
  { id: 'both', label: '5, 5, 5, 5', terms: [5, 5, 5, 5], title: 'Constante (ambas)' },
];

function formatRatioCell(curr, prev) {
  if (prev === 0) return h('span', null, 'indef (div 0)');
  const quotient = curr / prev;
  if (Number.isInteger(quotient)) {
    return h('span', null, `× ${fmt(quotient)}`);
  }
  // Simplificar fracción si ambos son enteros
  if (Number.isInteger(curr) && Number.isInteger(prev)) {
    const gcd = (a, b) => (!b ? a : gcd(b, a % b));
    const g = Math.abs(gcd(curr, prev));
    const num = curr / g;
    const den = prev / g;
    const sign = (num * den < 0) ? '−' : '';
    const fracEl = fractionHtml(`${Math.abs(num)}`, `${Math.abs(den)}`);
    return h('span', { style: 'display: inline-flex; align-items: center; gap: 4px;' },
      `× ${sign}`, fracEl
    );
  }
  return h('span', null, `× ${fmt(quotient, 2)}`);
}

export function initDetectiveWidget(container) {
  let presetIdx = 0;
  let customTerms = null;
  let customInputRaw = '';

  function render() {
    const activeTerms = customTerms !== null ? customTerms : PRESETS[presetIdx].terms;
    const cl = classify(activeTerms);

    const isDiffConst = cl.kind === 'ari' || cl.kind === 'both';
    const isRatioConst = cl.kind === 'geo' || cl.kind === 'both';

    // Botones de presets
    const presetButtons = h('div', { class: 'seq-controls' },
      PRESETS.map((item, idx) => {
        const btn = h('button', {
          type: 'button',
          class: ['chip', customTerms === null && idx === presetIdx ? 'is-active' : ''],
        }, item.label);
        btn.addEventListener('click', () => {
          customTerms = null;
          presetIdx = idx;
          render();
        });
        return btn;
      })
    );

    // Entrada personalizada
    const customRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label', style: 'flex: 1; max-width: 480px;' },
        'O ingresá tus propios números: ',
        h('input', {
          type: 'text',
          class: 'seq-check__input',
          placeholder: 'Ej: 2, 8, 14, 20  o  10, 3, -4, -11',
          value: customInputRaw,
          style: 'margin-top: 4px;',
          on: {
            input: (e) => {
              customInputRaw = e.target.value;
              const parts = customInputRaw
                .split(/[,;\s]+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .map((s) => parseFloat(s));
              if (parts.length >= 2 && parts.every((n) => !Number.isNaN(n))) {
                customTerms = parts;
              } else if (customInputRaw.trim() === '') {
                customTerms = null;
              }
              render();
            },
          },
        })
      )
    );

    // Cinta SVG
    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms: activeTerms,
      startIndex: 1,
      travelled: activeTerms.length - 1,
    });

    // Fila 1: Diferencias consecutivas: a(n) - a(n-1)
    const diffCells = cl.differences.map((d, i) => {
      const dSign = d >= 0 ? `+${fmt(d)}` : fmt(d);
      return h('div', { class: ['seq-detective__cell', isDiffConst ? 'is-highlight' : ''] },
        h('span', { class: 'seq-detective__sub' }, `a(${i + 2}) − a(${i + 1}) = `),
        h('strong', null, dSign)
      );
    });

    // Fila 2: Razones consecutivas: a(n) / a(n-1)
    const ratioCells = cl.ratios.map((_, i) => {
      const prev = activeTerms[i];
      const curr = activeTerms[i + 1];
      const cellContent = formatRatioCell(curr, prev);
      return h('div', { class: ['seq-detective__cell', isRatioConst ? 'is-highlight' : ''] },
        h('span', { class: 'seq-detective__sub' }, `a(${i + 2}) / a(${i + 1}) = `),
        h('strong', null, cellContent)
      );
    });

    const diffHeaderTitle = isDiffConst
      ? `✓ Diferencia constante (d = ${fmt(cl.d)}) ⟹ Sucesión Aritmética`
      : '✗ Diferencias variables (no es aritmética)';

    const ratioHeaderTitle = isRatioConst
      ? `✓ Razón o cociente constante (r = ${fmt(cl.r)}) ⟹ Sucesión Geométrica`
      : '✗ Cocientes variables (no es geométrica)';

    const comparisonTable = h('div', { class: 'seq-detective__grid' },
      h('div', { class: ['seq-detective__row', isDiffConst ? 'is-constant' : ''] },
        h('div', { class: 'seq-detective__header' },
          h('strong', null, '1. Análisis de Diferencias: a(n) − a(n − 1)'),
          h('span', { class: ['small', isDiffConst ? 'text-ok' : 'muted'] }, diffHeaderTitle)
        ),
        h('div', { class: 'seq-detective__values' }, ...diffCells)
      ),
      h('div', { class: ['seq-detective__row', isRatioConst ? 'is-constant' : ''] },
        h('div', { class: 'seq-detective__header' },
          h('strong', null, '2. Análisis de Cocientes (Razones): a(n) / a(n − 1)'),
          h('span', { class: ['small', isRatioConst ? 'text-ok' : 'muted'] }, ratioHeaderTitle)
        ),
        h('div', { class: 'seq-detective__values' }, ...ratioCells)
      )
    );

    // Veredicto final
    let verdictHtml = '';
    let noticeClass = 'notice--info';

    if (cl.kind === 'both') {
      verdictHtml = `<strong>Veredicto: Ambos tipos (Constante)</strong>. Como todos los términos son iguales, la diferencia constante es <code>d = 0</code> y el cociente constante es <code>r = 1</code>.`;
      noticeClass = 'notice--ok';
    } else if (cl.kind === 'ari') {
      const trend = cl.d > 0 ? 'creciente (cada término es mayor que el anterior)' : cl.d < 0 ? 'decreciente (cada término es menor que el anterior)' : 'constante';
      verdictHtml = `<strong>Veredicto: Sucesión Aritmética</strong> con diferencia común <strong>d = ${fmt(cl.d)}</strong>. La sucesión es ${trend}.`;
      noticeClass = 'notice--ok';
    } else if (cl.kind === 'geo') {
      verdictHtml = `<strong>Veredicto: Sucesión Geométrica</strong> con razón común <strong>r = ${fmt(cl.r)}</strong>. En cada paso multiplicás por ${fmt(cl.r)}.`;
      noticeClass = 'notice--ok';
    } else {
      verdictHtml = `<strong>Veredicto: Ninguna de las dos</strong>. Las diferencias no son constantes (no suma una cantidad fija) y los cocientes tampoco (no multiplica por un factor fijo).`;
      noticeClass = 'notice--warn';
    }

    const verdictBox = h('div', { class: ['notice', noticeClass] });
    verdictBox.innerHTML = verdictHtml;

    mount(container,
      presetButtons,
      customRow,
      ribbonSlot,
      comparisonTable,
      verdictBox
    );
  }

  render();
}
