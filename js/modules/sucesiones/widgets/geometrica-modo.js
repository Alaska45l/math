/**
 * widgets/geometrica-modo.js — Widget interactivo para la Sección 8:
 * El espejo multiplicativo (Aritmética vs Geométrica).
 * Muestra el puente conceptual de dividir por b a multiplicar por 1/b,
 * el neutro multiplicativo ·1 en n = 1, y la acumulación de potencias.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';

const EXAMPLES = [
  {
    id: 'khan54',
    label: '54, 18, 6, 2… (Dividir por 3 es × 1/3)',
    k: 54,
    r: 1 / 3,
    rStr: '1/3',
    terms: [54, 18, 6, 2],
    desc: 'En cada salto dividís entre 3, lo cual se escribe algebraicamente como multiplicar por la fracción 1/3.',
    stdFormula: '54 · (1/3)^(n − 1)',
  },
  {
    id: 'khanHalf',
    label: '1/2, 2, 8, 32… (Razón r = 4)',
    k: 0.5,
    r: 4,
    rStr: '4',
    terms: [0.5, 2, 8, 32],
    desc: 'En cada salto multiplicás por 4. Al inicio tenés 0 saltos: 1/2 · 4⁰ = 1/2 · 1 = 1/2.',
    stdFormula: '1/2 · 4^(n − 1) = 1/8 · 4^n',
  },
];

export function initGeometricaModoWidget(container) {
  let exampleIdx = 0;

  function render() {
    const ex = EXAMPLES[exampleIdx];

    const controls = h('div', { class: 'seq-controls' },
      EXAMPLES.map((item, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === exampleIdx ? 'is-active' : ''],
          on: { click: () => { exampleIdx = idx; render(); } },
        }, item.label)
      )
    );

    const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
    createRibbon(ribbonSlot, {
      terms: ex.terms,
      startIndex: 1,
      hop: { op: '×', value: ex.rStr },
      travelled: 3,
    });

    // Tabla de desglose de factores y neutro multiplicativo (gemela a la de sumas)
    const breakdownRows = [
      { n: 1, factors: `${fmt(ex.k)}`, formula: `${fmt(ex.k)} · (${ex.rStr})⁰ = ${fmt(ex.k)} · 1`, jumps: '0 saltos (Neutro multiplicativo · 1)', res: ex.terms[0] },
      { n: 2, factors: `${fmt(ex.k)} · ${ex.rStr}`, formula: `${fmt(ex.k)} · (${ex.rStr})¹`, jumps: '1 salto', res: ex.terms[1] },
      { n: 3, factors: `${fmt(ex.k)} · ${ex.rStr} · ${ex.rStr}`, formula: `${fmt(ex.k)} · (${ex.rStr})²`, jumps: '2 saltos', res: ex.terms[2] },
      { n: 4, factors: `${fmt(ex.k)} · ${ex.rStr} · ${ex.rStr} · ${ex.rStr}`, formula: `${fmt(ex.k)} · (${ex.rStr})³`, jumps: '3 saltos', res: ex.terms[3] },
      { n: 'n', factors: `${fmt(ex.k)} · (${ex.rStr}) · … (n − 1 factores)`, formula: `${fmt(ex.k)} · (${ex.rStr})^(n − 1)`, jumps: 'n − 1 saltos', res: 'k · r^(n − 1)', isTarget: true },
    ];

    const table = h('div', { class: 'seq-table-wrap' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Poste (n)'),
            h('th', null, 'Multiplicación repetida'),
            h('th', null, 'Potencia k · r^(n − 1)'),
            h('th', null, 'Explicación del salto'),
            h('th', null, 'Término a(n)')
          )
        ),
        h('tbody', null,
          breakdownRows.map((r) =>
            h('tr', { class: r.isTarget ? 'is-active' : '' },
              h('td', null, String(r.n)),
              h('td', null, r.factors),
              h('td', null, r.formula),
              h('td', null, r.jumps),
              h('td', null, h('strong', null, typeof r.res === 'number' ? fmt(r.res) : r.res))
            )
          )
        )
      )
    );

    const bridgeCard = h('div', { class: 'notice notice--ok' },
      h('strong', null, 'El diccionario de traducción Aritmética ⇄ Geométrica:'),
      h('ul', { style: 'margin: 6px 0; padding-left: 20px;' },
        h('li', null, 'En aritmética sumamos d repetidamente ⟹ multiplicación ', h('code', null, 'd · (n − 1)'), '.'),
        h('li', null, 'En geométrica multiplicamos por r repetidamente ⟹ potencia ', h('code', null, 'r^(n − 1)'), '.'),
        h('li', null, 'En n = 1 diste 0 saltos: sumarle 0 no cambia nada (neutro aditivo +0); multiplicar por r⁰ = 1 no cambia nada (neutro multiplicativo ·1).')
      )
    );

    mount(container,
      controls,
      ribbonSlot,
      table,
      bridgeCard
    );
  }

  render();
}
