/**
 * widgets/teletransportador.js — Widget interactivo para la Sección 5A:
 * Fórmulas explícitas: «el teletransportador».
 * Muestra el desglose de sumas repetidas k + (n − 1)·d y permite teletransportarse
 * directamente a cualquier n lejano (ej. n = 124).
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';

export function initTeletransportadorWidget(container) {
  let kVal = 5;
  let dVal = 3;
  let nTarget = 5;

  function render() {
    const jumps = nTarget - 1;
    const resultVal = kVal + jumps * dVal;

    // Cinta de los primeros postes (hasta 6)
    const ribbonTerms = [];
    const maxRibbonPosts = Math.min(6, nTarget);
    for (let i = 1; i <= maxRibbonPosts; i++) {
      ribbonTerms.push(kVal + (i - 1) * dVal);
    }

    const controls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Primer término k = a(1): ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          value: kVal,
          on: { change: (e) => { kVal = parseFloat(e.target.value) || 0; render(); } },
        })
      ),
      h('label', { class: 'field__label' },
        'Diferencia común d: ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          value: dVal,
          on: { change: (e) => { dVal = parseFloat(e.target.value) || 0; render(); } },
        })
      ),
      h('label', { class: 'field__label' },
        'Destino de teletransportación (n): ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          min: 1,
          max: 500,
          value: nTarget,
          on: { change: (e) => { nTarget = Math.max(1, parseInt(e.target.value, 10) || 1); render(); } },
        })
      ),
      h('button', {
        type: 'button',
        class: 'chip',
        on: { click: () => { kVal = 199; dVal = -3; nTarget = 124; render(); } },
      }, 'Cargar caso Khan: 199, 196, 193… (n = 124)')
    );

    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms: ribbonTerms,
      startIndex: 1,
      hop: { op: dVal >= 0 ? '+' : '-', value: Math.abs(dVal) },
      travelled: Math.max(0, maxRibbonPosts - 1),
    });

    // Tabla de desglose paso a paso de saltos (Khan Academy)
    const breakdownRows = [
      { n: 1, sumText: `${kVal}`, formulaText: `${kVal} + 0 · (${fmt(dVal)})`, jumps: 0, res: kVal },
      { n: 2, sumText: `${kVal} + ${fmt(dVal)}`, formulaText: `${kVal} + 1 · (${fmt(dVal)})`, jumps: 1, res: kVal + dVal },
      { n: 3, sumText: `${kVal} + ${fmt(dVal)} + ${fmt(dVal)}`, formulaText: `${kVal} + 2 · (${fmt(dVal)})`, jumps: 2, res: kVal + 2 * dVal },
    ];

    if (nTarget > 3) {
      breakdownRows.push({
        n: nTarget,
        sumText: `${kVal} + ${fmt(dVal)} + … (${jumps} veces)`,
        formulaText: `${kVal} + (${nTarget} − 1) · (${fmt(dVal)})`,
        jumps,
        res: resultVal,
        isTarget: true,
      });
    }

    const table = h('div', { class: 'seq-table-wrap' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Poste (n)'),
            h('th', null, 'Sumas repetidas'),
            h('th', null, 'Fórmula estándar k + (n − 1)·d'),
            h('th', null, 'Saltos'),
            h('th', null, 'Resultado a(n)')
          )
        ),
        h('tbody', null,
          breakdownRows.map((r) =>
            h('tr', { class: r.isTarget ? 'is-active' : '' },
              h('td', null, String(r.n)),
              h('td', null, r.sumText),
              h('td', null, r.formulaText),
              h('td', null, `${r.jumps} saltos`),
              h('td', null, h('strong', null, fmt(r.res)))
            )
          )
        )
      )
    );

    // Caja de teletransportación directa
    const dSign = dVal >= 0 ? `+ ${fmt(dVal)}` : `${MINUS} ${fmt(Math.abs(dVal))}`;
    const teleportBox = h('div', { class: 'notice notice--ok' },
      h('strong', null, `Cálculo directo en un solo renglón para n = ${nTarget}:`),
      h('p', { class: 'eq', style: 'font-size: 1.35rem; margin: 8px 0;' },
        `a(${nTarget}) = ${fmt(kVal)} ${dSign} · (${nTarget} − 1) = ${fmt(kVal)} ${dSign} · ${jumps} = `,
        h('span', { style: 'color: var(--yellow); font-weight: bold;' }, fmt(resultVal))
      ),
      h('span', { class: 'small' }, `¡Sin necesidad de calcular ninguno de los ${jumps} términos intermedios!`)
    );

    // Recuadro lateral colapsable: Otro punto de partida (N0)
    const detailsN0 = h('details', { class: 'seq-block seq-block--caution' },
      h('summary', { style: 'cursor: pointer; font-weight: bold;' }, 'Otro punto de partida: ¿Qué pasa si arrancás en n = 0 (ℕ₀)?'),
      h('div', { style: 'margin-top: 10px;' },
        h('p', null,
          'En computación y en algunos problemas especiales (como el de Supriya), el primer poste se numera como ',
          h('code', null, 'a(0)'),
          '. En ese caso, para llegar al poste ',
          h('code', null, 'n'),
          ' diste exactamente ',
          h('strong', null, 'n saltos'),
          ' completos (porque de 0 a n hay n pasos). La fórmula pasa a ser ',
          h('code', null, 'k + d · n'),
          '.'
        ),
        h('p', { class: 'small muted' },
          'En matemática escolar y en Khan Academy, el dominio estándar siempre arranca en n = 1 (ℕ), por lo que siempre usamos (n − 1) saltos.'
        )
      )
    );

    mount(container,
      controls,
      ribbonSlot,
      table,
      teleportBox,
      detailsN0
    );
  }

  render();
}
