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
      travelled: p.terms.length - 1,
    });

    const inputRow = h('div', { class: 'seq-widget-inputs' },
      h('label', { class: 'field__label' },
        `4.º término: `,
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          placeholder: '¿?',
          value: userInputs[0],
          on: {
            input: (e) => { userInputs[0] = e.target.value; },
          },
        })
      ),
      h('label', { class: 'field__label' },
        `5.º término: `,
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          placeholder: '¿?',
          value: userInputs[1],
          on: {
            input: (e) => { userInputs[1] = e.target.value; },
          },
        })
      ),
      h('button', {
        type: 'button',
        class: 'btn btn--check',
        on: {
          click: () => {
            const v1 = parseFloat(userInputs[0]);
            const v2 = parseFloat(userInputs[1]);
            const ok1 = !Number.isNaN(v1) && Math.abs(v1 - p.next[0]) < 1e-4;
            const ok2 = !Number.isNaN(v2) && Math.abs(v2 - p.next[1]) < 1e-4;

            if (ok1 && ok2) {
              feedback = { ok: true, text: `¡Exacto! Siguiendo el patrón obtenés ${fmt(p.next[0])} y ${fmt(p.next[1])}.` };
            } else if (ok1 && !ok2) {
              feedback = { ok: false, text: `El 4.º término es correcto (${fmt(p.next[0])}), pero revisá el 5.º término.` };
            } else {
              feedback = { ok: false, text: `${p.hint} Probá de nuevo.` };
            }
            render();
          },
        },
      }, 'Comprobar extensión')
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
