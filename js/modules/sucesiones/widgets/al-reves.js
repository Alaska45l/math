/**
 * widgets/al-reves.js — Widget interactivo para la Sección 5B:
 * Usar el teletransportador al revés:
 * 1. Sub-modo 1: ¿Pertenece este número a la sucesión? (El filtro de ℕ).
 * 2. Sub-modo 2: Puente entre dos postes lejanos (Tasa de cambio promedio d = Δa / Δn).
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml, MINUS } from '../../../core/math-format.js';
import { isTerm, stepFromTwo } from '../logic.js';

export function initAlRevesWidget(container) {
  let submode = 'filter'; // 'filter' | 'bridge'

  // Estado sub-modo 1 (Filtro)
  let fK = 3;
  let fStep = -4;
  let fTarget = -65;

  // Estado sub-modo 2 (Puente)
  let bN1 = 1;
  let bA1 = 5;
  let bN2 = 10;
  let bA2 = 59;

  function render() {
    const tabs = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', submode === 'filter' ? 'is-active' : ''],
        on: { click: () => { submode = 'filter'; render(); } },
      }, 'Sub-modo 1 · ¿Pertenece al riel? (El filtro de ℕ)'),
      h('button', {
        type: 'button',
        class: ['chip', submode === 'bridge' ? 'is-active' : ''],
        on: { click: () => { submode = 'bridge'; render(); } },
      }, 'Sub-modo 2 · Puente entre postes lejanos (Δa / Δn)')
    );

    let contentArea;

    if (submode === 'filter') {
      const result = isTerm('ari', fK, fStep, fTarget);

      const presets = h('div', { class: 'seq-controls' },
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { fK = 3; fStep = -4; fTarget = -65; render(); } },
        }, 'Caso Khan: a(n) = 3 − 4(n − 1) con target −65'),
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { fK = 3; fStep = 2; fTarget = 100; render(); } },
        }, 'Caso Khan: 3, 5, 7… con target 100 (vacío)'),
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { fK = 3; fStep = 2; fTarget = 101; render(); } },
        }, 'Caso Khan: 3, 5, 7… con target 101 (poste 50)')
      );

      const inputs = h('div', { class: 'seq-controls' },
        h('label', { class: 'field__label' },
          'Primer término k: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: fK,
            on: { change: (e) => { fK = parseFloat(e.target.value) || 0; render(); } },
          })
        ),
        h('label', { class: 'field__label' },
          'Diferencia común d: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: fStep,
            on: { change: (e) => { fStep = parseFloat(e.target.value) || 0; render(); } },
          })
        ),
        h('label', { class: 'field__label' },
          'Valor objetivo a verificar: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: fTarget,
            on: { change: (e) => { fTarget = parseFloat(e.target.value) || 0; render(); } },
          })
        )
      );

      // Despeje algebraico paso a paso
      const stepsView = h('div', { class: 'seq-check__solution-box' },
        h('strong', null, 'Despeje algebraico por propiedad uniforme:'),
        h('ol', { style: 'margin: 8px 0; padding-left: 20px;' },
          result.steps.map((st) =>
            h('li', { style: 'margin-bottom: 6px;' },
              h('div', null, st.text),
              st.expr ? h('div', { class: 'eq', style: 'color: var(--yellow);' }, st.expr) : null
            )
          )
        )
      );

      // Veredicto
      const verdict = h('div', { class: ['notice', result.isTerm ? 'notice--ok' : 'notice--err'] },
        h('strong', null, result.isTerm ? '✓ Sí pertenece a la sucesión:' : '✗ NO pertenece a la sucesión:'),
        h('p', { style: 'margin: 4px 0;' },
          result.isTerm
            ? `El valor ${fmt(fTarget)} cae exactamente en el poste entero n = ${result.n}.`
            : `El despeje arrojó n = ${fmt(result.n, 2)}. Como n ∉ ℕ (no es un entero positivo), cae en el vacío entre los postes más cercanos.`
        )
      );

      contentArea = h('div', null, presets, inputs, stepsView, verdict);
    } else {
      // Sub-modo 2: Puente
      const jumps = bN2 - bN1;
      let bridgeResult;
      try {
        bridgeResult = stepFromTwo('ari', bN1, bA1, bN2, bA2);
      } catch (err) {
        bridgeResult = { error: err.message };
      }

      const presets = h('div', { class: 'seq-controls' },
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { bN1 = 1; bA1 = 5; bN2 = 10; bA2 = 59; render(); } },
        }, 'Caso Khan: a(1) = 5 y a(10) = 59 (d = 6)'),
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { bN1 = 2; bA1 = 8; bN2 = 6; bA2 = 32; render(); } },
        }, 'Caso: a(2) = 8 y a(6) = 32 (d = 6)')
      );

      const inputs = h('div', { class: 'seq-controls' },
        h('label', { class: 'field__label' },
          'Poste 1 (n₁): ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: bN1,
            min: 1,
            on: { change: (e) => { bN1 = parseInt(e.target.value, 10) || 1; render(); } },
          })
        ),
        h('label', { class: 'field__label' },
          'Valor a(n₁): ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: bA1,
            on: { change: (e) => { bA1 = parseFloat(e.target.value) || 0; render(); } },
          })
        ),
        h('label', { class: 'field__label' },
          'Poste 2 (n₂): ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: bN2,
            min: 1,
            on: { change: (e) => { bN2 = parseInt(e.target.value, 10) || 1; render(); } },
          })
        ),
        h('label', { class: 'field__label' },
          'Valor a(n₂): ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: bA2,
            on: { change: (e) => { bA2 = parseFloat(e.target.value) || 0; render(); } },
          })
        )
      );

      let calculationView;
      if (bridgeResult.error) {
        calculationView = h('div', { class: 'notice notice--err' }, bridgeResult.error);
      } else {
        const deltaA = bA2 - bA1;
        const fracFormula = fractionHtml('a(n₂) − a(n₁)', 'n₂ − n₁');
        const fracNumbers = fractionHtml(`${fmt(bA2)} − (${fmt(bA1)})`, `${bN2} − ${bN1}`);
        const fracSimplified = fractionHtml(fmt(deltaA), fmt(jumps));

        calculationView = h('div', { class: 'notice notice--ok' },
          h('strong', null, 'Deducción de la diferencia común como tasa de cambio promedio:'),
          h('p', null,
            'Entre el poste ',
            h('strong', null, String(bN1)),
            ' y el poste ',
            h('strong', null, String(bN2)),
            ' hay exactamente ',
            h('strong', null, `${jumps} saltos iguales`),
            ' que cubren una distancia total de ',
            h('strong', null, `${fmt(deltaA)} unidades`),
            '.'
          ),
          h('div', { class: 'eq', style: 'font-size: 1.25rem; margin: 12px 0; display: flex; align-items: center; gap: 8px;' },
            'd = ', fracFormula, ' = ', fracNumbers, ' = ', fracSimplified, ' = ',
            h('span', { style: 'color: var(--yellow); font-weight: bold;' }, fmt(bridgeResult.d))
          ),
          h('p', { class: 'small muted' },
            'Conexión: Este cociente es idéntico a la pendiente m = Δy / Δx y a la Tasa de Cambio Promedio explorada en el Laboratorio de Funciones.'
          )
        );
      }

      contentArea = h('div', null, presets, inputs, calculationView);
    }

    mount(container, tabs, contentArea);
  }

  render();
}
