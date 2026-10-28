/**
 * widgets/geometrica-modo.js — Widget interactivo para la Sección 8:
 * El espejo multiplicativo (Aritmética vs Geométrica).
 * Cubre:
 * 1. De dividir por b a multiplicar por la fracción 1/b.
 * 2. Equivalencia algebraica estándar (k · r^(n-1)) vs simplificada (c0 · r^n).
 * 3. Diccionario interactivo lado a lado (Modo Suma +d ⇄ Modo Multiplicación ×r).
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, fractionHtml } from '../../../core/math-format.js';
import { createRibbon } from '../components.js';

const MODES = [
  {
    id: 'div3',
    label: '54, 18, 6, 2… (÷3 es × 1/3)',
    k: 54,
    r: 1 / 3,
    rNum: 1,
    rDen: 3,
    terms: [54, 18, 6, 2],
    desc: 'En cada salto dividís entre 3. En álgebra esto se escribe como multiplicar por la fracción recíproca 1/3.',
    stdFormula: '54 · (1/3)^(n − 1)',
    simpFormula: '162 · (1/3)^n',
  },
  {
    id: 'div2',
    label: '40, 20, 10, 5… (÷2 es × 1/2)',
    k: 40,
    r: 0.5,
    rNum: 1,
    rDen: 2,
    terms: [40, 20, 10, 5],
    desc: 'En cada salto dividís entre 2. Algebraicamente multiplicás por la fracción 1/2.',
    stdFormula: '40 · (1/2)^(n − 1)',
    simpFormula: '80 · (1/2)^n',
  },
  {
    id: 'equiv4',
    label: '1/2, 2, 8, 32… (Equivalencia 1/2·4ⁿ⁻¹ = 1/8·4ⁿ)',
    k: 0.5,
    kNum: 1,
    kDen: 2,
    r: 4,
    rNum: 4,
    rDen: 1,
    terms: [0.5, 2, 8, 32],
    desc: 'Desglose algebraico: 4^(n − 1) = 4^n / 4 = 1/4 · 4^n. Al multiplicar por el primer término 1/2: (1/2 · 1/4) · 4^n = 1/8 · 4^n.',
    stdFormula: '1/2 · 4^(n − 1)',
    simpFormula: '1/8 · 4^n',
  },
  {
    id: 'dictionary',
    label: 'Diccionario: Modo Suma +d ⇄ Modo Multiplicación ×r',
    isDictionary: true,
  },
];

export function initGeometricaModoWidget(container) {
  let modeIdx = 0;

  function render() {
    const activeMode = MODES[modeIdx];

    const controls = h('div', { class: 'seq-controls' },
      MODES.map((item, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === modeIdx ? 'is-active' : ''],
          on: { click: () => { modeIdx = idx; render(); } },
        }, item.label)
      )
    );

    let mainContent;

    if (activeMode.isDictionary) {
      // Diccionario Interactivo
      mainContent = h('div', { class: 'seq-block seq-block--try' },
        h('strong', { class: 'seq-block__label' }, 'El Gran Espejo: Comparativa Lado a Lado'),
        h('div', { class: 'seq-table-wrap' },
          h('table', { class: 'seq-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Concepto'),
                h('th', null, 'Sucesión Aritmética (Modo Suma)'),
                h('th', null, 'Sucesión Geométrica (Modo Multiplicación)')
              )
            ),
            h('tbody', null,
              h('tr', null,
                h('td', null, h('strong', null, 'Paso de avance')),
                h('td', null, 'Suma constante: ', h('code', null, '+ d')),
                h('td', null, 'Multiplicación constante: ', h('code', null, '× r'), ' (÷b es × 1/b)')
              ),
              h('tr', null,
                h('td', null, h('strong', null, 'En n = 1 (0 saltos)')),
                h('td', null, 'Neutro aditivo: suma ', h('strong', null, '+0'), ' saltos (a(1) + 0·d)'),
                h('td', null, 'Neutro multiplicativo: multiplica por ', h('strong', { style: 'color: var(--green);' }, '· 1'), ' (r⁰ = 1, a(1)·1)')
              ),
              h('tr', null,
                h('td', null, h('strong', null, 'Acumulación en n')),
                h('td', null, 'Suma repetida (multiplicación): ', h('code', null, '(n − 1) · d')),
                h('td', null, 'Multiplicación repetida (potencia): ', h('code', null, 'r^(n − 1)'))
              ),
              h('tr', null,
                h('td', null, h('strong', null, 'Fórmula estándar')),
                h('td', null, h('code', null, 'a(n) = k + d(n − 1)')),
                h('td', null, h('code', null, 'a(n) = k · r^(n − 1)'))
              ),
              h('tr', null,
                h('td', null, h('strong', null, 'Fórmula simplificada')),
                h('td', null, h('code', null, 'a(n) = c₀ + d·n'), ' (con c₀ = k − d)'),
                h('td', null, h('code', null, 'a(n) = c₀ · rⁿ'), ' (con c₀ = k / r)')
              )
            )
          )
        )
      );
    } else {
      // Cinta SVG
      const ribbonSlot = h('div', { class: 'seq-ribbon-wrap' });
      createRibbon(ribbonSlot, {
        terms: activeMode.terms,
        startIndex: 1,
        hop: {
          op: '×',
          value: activeMode.rDen > 1 ? `${activeMode.rNum}/${activeMode.rDen}` : activeMode.r,
        },
        travelled: activeMode.terms.length - 1,
      });

      // Filas de desglose
      const breakdownRows = activeMode.terms.map((val, i) => {
        const n = i + 1;
        const jumps = n - 1;
        let multRep = '';
        let potCalc = '';

        const rFracHtml = activeMode.rDen > 1
          ? `(${activeMode.rNum}/${activeMode.rDen})`
          : `${activeMode.r}`;

        if (n === 1) {
          multRep = `${fmt(activeMode.k)}`;
          potCalc = `${fmt(activeMode.k)} · ${rFracHtml}⁰ = ${fmt(activeMode.k)} · 1`;
        } else {
          multRep = `${fmt(activeMode.k)}` + ` · ${rFracHtml}`.repeat(jumps);
          potCalc = `${fmt(activeMode.k)} · ${rFracHtml}^${jumps}`;
        }

        return h('tr', null,
          h('td', null, `n = ${n}`),
          h('td', null, multRep),
          h('td', null, potCalc),
          h('td', null, jumps === 0 ? h('span', { style: 'color: var(--green); font-weight: bold;' }, '0 saltos (Neutro multiplicativo · 1)') : `${jumps} saltos de × r`),
          h('td', null, h('strong', null, typeof val === 'number' ? fmt(val) : val))
        );
      });

      // Fila general n
      const rRepText = activeMode.rDen > 1 ? `(${activeMode.rNum}/${activeMode.rDen})` : `${activeMode.r}`;
      breakdownRows.push(
        h('tr', { class: 'is-active' },
          h('td', null, 'n (general)'),
          h('td', null, `${fmt(activeMode.k)} · ${rRepText} · … (n − 1 veces)`),
          h('td', null, h('strong', { style: 'color: var(--yellow);' }, `${fmt(activeMode.k)} · ${rRepText}^(n − 1)`)),
          h('td', null, 'n − 1 saltos acumulados'),
          h('td', null, h('strong', { style: 'color: var(--yellow);' }, 'a(n) = k · rⁿ⁻¹'))
        )
      );

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
          h('tbody', null, ...breakdownRows)
        )
      );

      // Tarjeta de puente conceptual y equivalencia
      let cardEl;
      if (activeMode.id === 'equiv4') {
        cardEl = h('div', { class: 'notice notice--ok' },
          h('strong', null, 'Equivalencia paso a paso: Forma estándar vs. simplificada:'),
          h('div', { class: 'eq', style: 'margin: 8px 0; font-size: 1.15rem;' },
            'a(n) = ', fractionHtml('1', '2'), ' · 4ⁿ⁻¹ = ',
            fractionHtml('1', '2'), ' · ', fractionHtml('4ⁿ', '4'), ' = (',
            fractionHtml('1', '2'), ' · ', fractionHtml('1', '4'), ') · 4ⁿ = ',
            h('strong', { style: 'color: var(--yellow);' }, fractionHtml('1', '8')), ' · 4ⁿ'
          ),
          h('p', { class: 'small' },
            'En forma estándar ves directamente k = 1/2 y r = 4. En forma simplificada 1/8 · 4ⁿ los números están compactados, pero ambas fórmulas generan exactamente los mismos términos 1/2, 2, 8, 32…'
          )
        );
      } else {
        cardEl = h('div', { class: 'notice notice--ok' },
          h('strong', null, 'Puente conceptual: De dividir entre b a multiplicar por 1/b:'),
          h('p', { style: 'margin: 6px 0;' }, activeMode.desc),
          h('p', { class: 'small muted' },
            `Fórmula estándar obtenida: `, h('code', null, activeMode.stdFormula),
            `. En n = 1 tenés r⁰ = 1, conservando intacto el punto de partida k = ${fmt(activeMode.k)}.`
          )
        );
      }

      mainContent = h('div', null, ribbonSlot, table, cardEl);
    }

    mount(container,
      controls,
      mainContent
    );
  }

  render();
}
