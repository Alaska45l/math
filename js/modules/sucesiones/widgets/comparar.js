/**
 * widgets/comparar.js — Widget interactivo para la Sección 10:
 * Modelado verbal: Ahorro fijo (+d) vs. Interés compuesto (×(1 + i)) (El dilema de Caden).
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';
import { calcSafeAxis } from '../scale.js';

export function initCompararWidget(container) {
  let initialDeposit = 70;
  let fixedAdd = 10;
  let interestPct = 10; // 10%
  let yearsCount = 8;

  function render() {
    const rate = 1 + interestPct / 100;

    const data = [];
    for (let yr = 1; yr <= yearsCount; yr++) {
      const ariVal = initialDeposit + (yr - 1) * fixedAdd;
      const geoVal = initialDeposit * Math.pow(rate, yr - 1);
      data.push({ year: yr, ari: ariVal, geo: geoVal });
    }

    const controls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Depósito inicial f(1): $',
        h('input', {
          type: 'number',
          min: 1,
          max: 10000,
          class: 'seq-check__input-sm',
          value: initialDeposit,
          on: { change: (e) => {
            const p = parseFloat(e.target.value);
            initialDeposit = Number.isFinite(p) ? Math.max(1, Math.min(10000, p)) : 70;
            render();
          } },
        })
      ),
      h('label', { class: 'field__label' },
        'Ahorro fijo anual (+d): $',
        h('input', {
          type: 'number',
          min: 0,
          max: 5000,
          class: 'seq-check__input-sm',
          value: fixedAdd,
          on: { change: (e) => {
            const p = parseFloat(e.target.value);
            fixedAdd = Number.isFinite(p) ? Math.max(0, Math.min(5000, p)) : 10;
            render();
          } },
        })
      ),
      h('label', { class: 'field__label' },
        'Interés compuesto anual (+%): ',
        h('input', {
          type: 'number',
          min: 1,
          max: 50,
          class: 'seq-check__input-sm',
          value: interestPct,
          on: { change: (e) => {
            const p = parseFloat(e.target.value);
            interestPct = Number.isFinite(p) ? Math.max(1, Math.min(50, p)) : 10;
            render();
          } },
        }),
        '%'
      ),
      h('label', { class: 'field__label' },
        'Años de simulación: ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          min: 3,
          max: 15,
          value: yearsCount,
          on: { change: (e) => {
            const p = parseInt(e.target.value, 10);
            yearsCount = Number.isFinite(p) ? Math.max(3, Math.min(15, p)) : 8;
            render();
          } },
        })
      )
    );

    // Tabla comparativa de las dos alcancías
    const tableEl = h('div', { class: 'seq-table-wrap', style: 'flex: 1; min-width: 220px;' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Año'),
            h('th', { style: 'color: var(--blue);' }, 'Aritmética (+fijo)'),
            h('th', { style: 'color: var(--yellow);' }, 'Geométrica (10%)')
          )
        ),
        h('tbody', null,
          data.map((d) =>
            h('tr', null,
              h('td', null, `Año ${d.year}`),
              h('td', null, `$${fmt(d.ari, 1)}`),
              h('td', null, h('strong', { style: 'color: var(--yellow);' }, `$${fmt(d.geo, 1)}`))
            )
          )
        )
      )
    );

    // Gráfico Cartesiano
    const svgEl = s('svg', {
      viewBox: '0 0 540 320',
      class: 'seq-plot',
      role: 'img',
      'aria-label': 'Comparación gráfica entre crecimiento aritmético lineal y crecimiento geométrico exponencial',
    });

    const plotCard = h('div', { class: 'seq-plot-card', style: 'flex: 1.5; min-width: 300px;' }, svgEl);

    // Explicación didáctica distributiva
    const explanation = h('div', { class: 'notice notice--ok' },
      h('strong', null, 'Desglose distributivo de la cuenta de Caden:'),
      h('p', { style: 'margin: 6px 0;' },
        'Conservar el saldo anterior (100% = 1) más ganar el 10% de interés (0,10) se calcula factorizando:',
        h('br'),
        h('span', { class: 'eq', style: 'color: var(--yellow); font-size: 1.15rem;' },
          `Saldo = 70 + 0,10 · 70 = 70 · (1 + 0,10) = 70 · 1,10`
        )
      ),
      h('p', { class: 'small' },
        '¡Es una sucesión geométrica con razón común ',
        h('strong', null, 'r = 1,10'),
        '! Multiplicar por 0,10 sólo daría la ganancia aislada, destruyendo el capital original.'
      )
    );

    const layoutGrid = h('div', { class: 'seq-fn-grid' },
      tableEl,
      plotCard
    );

    mount(container,
      controls,
      layoutGrid,
      explanation
    );

    // Render del plano con escala adaptativa monetaria segura
    const maxVal = Math.max(data[data.length - 1].ari, data[data.length - 1].geo);
    const axis = calcSafeAxis({ minVal: 0, maxVal, targetTicks: 6, forceZero: true, currency: true });
    const plane = createPlane(svgEl, {
      width: 540,
      height: 320,
      xMin: 0,
      xMax: yearsCount + 1,
      yMin: axis.yMin,
      yMax: axis.yMax,
      xStep: 1,
      yStep: axis.yStep,
      yFmt: axis.yFmt,
      xLabel: 'Año (n)',
      yLabel: 'Saldo ($)',
    });

    // Curva lineal aritmética
    plane.layers.under.append(
      s('path', {
        d: plane.fnPath((n) => initialDeposit + (n - 1) * fixedAdd, 1, yearsCount, { samples: 50 }),
        stroke: 'var(--blue)',
        'stroke-width': '2',
        'stroke-dasharray': '4 4',
        fill: 'none',
      })
    );

    // Curva exponencial geométrica
    plane.layers.under.append(
      s('path', {
        d: plane.fnPath((n) => initialDeposit * Math.pow(rate, n - 1), 1, yearsCount, { samples: 100 }),
        stroke: 'var(--yellow)',
        'stroke-width': '2.5',
        fill: 'none',
      })
    );

    // Puntos discretos
    data.forEach((d) => {
      // Punto aritmético
      plane.layers.marks.append(
        s('circle', {
          cx: plane.sx(d.year),
          cy: plane.sy(d.ari),
          r: 4,
          fill: 'var(--blue)',
          stroke: 'var(--ink)',
          'stroke-width': '1.5',
        })
      );

      // Punto geométrico
      plane.layers.marks.append(
        s('circle', {
          cx: plane.sx(d.year),
          cy: plane.sy(d.geo),
          r: 5,
          fill: 'var(--yellow)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        })
      );
    });
  }

  render();
}
