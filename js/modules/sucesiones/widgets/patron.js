/**
 * widgets/patron.js — Widget interactivo para la Sección 1:
 * Extensión de sucesiones a través de la identificación del patrón.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';

const PRESETS = [
  { id: 'suma2', label: 'Patrón +2', terms: [3, 5, 7], next: [9, 11], hop: { op: '+', value: 2 }, hint: 'Sumá 2 al término anterior en cada paso.' },
  { id: 'resta5', label: 'Patrón −5', terms: [21, 16, 11], next: [6, 1], hop: { op: '-', value: 5 }, hint: 'Restá 5 al término anterior en cada paso.' },
  { id: 'por2', label: 'Patrón ×2', terms: [3, 6, 12], next: [24, 48], hop: { op: '×', value: 2 }, hint: 'Multiplicá el término anterior por 2 en cada paso.' },
  { id: 'div2', label: 'Patrón ÷2', terms: [40, 20, 10], next: [5, 2.5], hop: { op: '÷', value: 2 }, hint: 'Dividí el término anterior entre 2 en cada paso.' },
];

export function initPatronWidget(container) {
  let presetIdx = 0;
  let userInputs = ['', ''];
  let feedback = null;

  function render() {
    const p = PRESETS[presetIdx];
    const fullTerms = [...p.terms, userInputs[0] !== '' ? userInputs[0] : '?', userInputs[1] !== '' ? userInputs[1] : '?'];

    const v1 = parseFloat(userInputs[0]);
    const v2 = parseFloat(userInputs[1]);
    const ok1 = !Number.isNaN(v1) && Math.abs(v1 - p.next[0]) < 1e-4;
    const ok2 = !Number.isNaN(v2) && Math.abs(v2 - p.next[1]) < 1e-4;
    const err1 = userInputs[0] !== '' && !ok1;
    const err2 = userInputs[1] !== '' && !ok2;

    const validities = {
      [p.terms.length]: ok1 ? 'ok' : err1 ? 'err' : 'none',
      [p.terms.length + 1]: ok2 ? 'ok' : err2 ? 'err' : 'none',
    };

    if (ok1 && ok2) {
      feedback = { ok: true, text: `¡Exacto! Siguiendo el ${p.label} completaste ${fmt(p.next[0])} y ${fmt(p.next[1])}.` };
    } else if (ok1 && !ok2 && userInputs[1] !== '') {
      feedback = { ok: false, text: `El 4.º término (${fmt(p.next[0])}) es correcto. Ahora completá el 5.º término.` };
    } else if (err1) {
      feedback = { ok: false, text: `El 4.º término no coincide. ${p.hint}` };
    }

    const selectorButtons = h('div', { class: 'seq-controls' },
      PRESETS.map((preset, idx) => {
        const btn = h('button', {
          type: 'button',
          class: ['chip', idx === presetIdx ? 'is-active' : ''],
        }, preset.label);
        btn.addEventListener('click', () => {
          presetIdx = idx;
          userInputs = ['', ''];
          feedback = null;
          render();
        });
        return btn;
      })
    );

    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms: fullTerms,
      startIndex: 1,
      hop: p.hop,
      editableFrom: p.terms.length,
      travelled: p.terms.length - 1 + (ok1 ? 1 : 0) + (ok1 && ok2 ? 1 : 0),
      validities,
      onEditTerm: (termIdx, val) => {
        const inputSlotIdx = termIdx - p.terms.length;
        if (inputSlotIdx >= 0 && inputSlotIdx < 2) {
          userInputs[inputSlotIdx] = val;
          render();
        }
      },
    });

    const inputRow = h('div', { class: 'seq-widget-inputs' },
      h('label', { class: 'field__label' },
        `4.º término: `,
        h('input', {
          type: 'number',
          class: ['seq-check__input-sm', ok1 ? 'is-correct' : err1 ? 'is-error' : ''],
          step: 'any',
          placeholder: '¿?',
          value: userInputs[0],
          on: {
            input: (e) => {
              userInputs[0] = e.target.value;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label' },
        `5.º término: `,
        h('input', {
          type: 'number',
          class: ['seq-check__input-sm', ok2 ? 'is-correct' : err2 ? 'is-error' : ''],
          step: 'any',
          placeholder: '¿?',
          value: userInputs[1],
          on: {
            input: (e) => {
              userInputs[1] = e.target.value;
              render();
            },
          },
        })
      )
    );

    const feedbackBox = h('div', { class: 'seq-widget-feedback', 'aria-live': 'polite' });
    if (feedback) {
      mount(feedbackBox,
        h('div', { class: ['notice', feedback.ok ? 'notice--ok' : 'notice--err'] }, feedback.text)
      );
    }

    mount(container,
      selectorButtons,
      ribbonSlot,
      inputRow,
      feedbackBox
    );
  }

  render();
}
