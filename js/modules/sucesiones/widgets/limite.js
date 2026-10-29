/**
 * widgets/limite.js — Widget interactivo para la Sección 11:
 * Puente a Análisis Matemático I: Comportamiento asintótico hacia infinito (lim n→∞ a(n)).
 */

import { h, s, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';
import { calcSafeAxis } from '../scale.js';

const PRESETS = [
  { label: 'Caso Khan: 64, 16, 4, 1, 1/4… (r = 1/4)', k: 64, r: 0.25, title: 'Convergencia rápida a 0' },
  { label: '40, 20, 10, 5, 2,5… (r = 1/2)', k: 40, r: 0.5, title: 'Convergencia suave a 0' },
  { label: 'Oscilante: 10, −5, 2,5, −1,25… (r = −1/2)', k: 10, r: -0.5, title: 'Convergencia oscilante a 0' },
  { label: 'Divergente: 1, 2, 4, 8… (r = 2)', k: 1, r: 2, title: 'Divergencia a +∞' },
];

export function initLimiteWidget(container) {
  let presetIdx = 0;
  let maxN = 12;

  const presetButtonsSlot = h('div', { class: 'seq-controls' });
  const maxNLabel = h('strong', { style: 'color: var(--yellow);' }, String(maxN));
  const sliderN = h('input', {
    type: 'range',
    min: 6,
    max: 30,
    value: maxN,
    class: 'seq-range',
    on: {
      input: (e) => {
        maxN = parseInt(e.target.value, 10);
        updateDynamic();
      },
    },
  });

  const controls = h('div', { class: 'seq-controls' },
    h('label', { class: 'field__label' },
      'Evaluar hasta el término n = ',
      maxNLabel,
      sliderN
    )
  );

  const tableSlot = h('div', { class: 'seq-table-wrap', style: 'flex: 1; min-width: 200px;' });
  const svgEl = s('svg', {
    viewBox: '0 0 540 300',
    class: 'seq-plot',
    role: 'img',
    'aria-label': 'Gráfico de convergencia de la sucesión hacia el límite',
  });
  const plotCard = h('div', { class: 'seq-plot-card', style: 'flex: 1.5; min-width: 300px;' }, svgEl);
  const layoutGrid = h('div', { class: 'seq-fn-grid' }, tableSlot, plotCard);
  const limitNoticeSlot = h('div');

  mount(container, presetButtonsSlot, controls, layoutGrid, limitNoticeSlot);

  function updateDynamic() {
    maxNLabel.textContent = String(maxN);

    const p = PRESETS[presetIdx];
    const absR = Math.abs(p.r);
    const isConvergent = absR < 1;

    const data = [];
    for (let n = 1; n <= maxN; n++) {
      data.push({ n, val: p.k * Math.pow(p.r, n - 1) });
    }

    const lastVal = data[data.length - 1].val;

    mount(presetButtonsSlot,
      ...PRESETS.map((pr, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === presetIdx ? 'is-active' : ''],
          on: {
            click: () => {
              presetIdx = idx;
              updateDynamic();
            },
          },
        }, pr.label)
      )
    );

    const previewIndices = [1, 2, 3, 5, 10, maxN].filter((v, i, a) => v <= maxN && a.indexOf(v) === i);
    mount(tableSlot,
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Término'),
            h('th', null, 'Valor numérico')
          )
        ),
        h('tbody', null,
          previewIndices.map((n) => {
            const v = p.k * Math.pow(p.r, n - 1);
            let displayVal = fmt(v, 4);
            if (Math.abs(v) < 1e-4 && v !== 0) displayVal = v.toExponential(3).replace('.', ',');
            return h('tr', { class: n === maxN ? 'is-active' : '' },
              h('td', null, `a(${n})`),
              h('td', null, h('strong', null, displayVal))
            );
          })
        )
      )
    );

    mount(limitNoticeSlot,
      h('div', { class: ['notice', isConvergent ? 'notice--ok' : 'notice--err'] },
        h('strong', { style: 'display: inline-flex; align-items: center; gap: 5px;' },
          chalkIcon(isConvergent ? 'check' : 'cross', { width: 16, height: 16 }),
          isConvergent ? 'Sucesión Convergente: ' : 'Sucesión Divergente: '
        ),
        h('span', null,
          isConvergent
            ? `Como |r| = ${fmt(absR)} < 1, cada término es una fracción del anterior. A medida que n → ∞, los términos tienden a 0 (límite = 0).`
            : `Como |r| = ${fmt(absR)} > 1, los términos se multiplican indefinidamente y la sucesión diverge hacia ±∞ (no tiene límite finito).`
        ),
        h('p', { class: 'small muted', style: 'margin-top: 6px;' },
          `En n = ${maxN}, el término vale a(${maxN}) = ${typeof lastVal === 'number' && Math.abs(lastVal) < 1e-4 ? lastVal.toExponential(4).replace('.', ',') : fmt(lastVal, 4)}. ¡Se acerca infinitesimalmente a 0 sin ser exactamente 0!`
        )
      )
    );

    const allVals = data.map((d) => d.val);
    const minVal = Math.min(...allVals, 0);
    const maxValPl = Math.max(...allVals, 0);
    const axis = calcSafeAxis({ minVal, maxVal: maxValPl, targetTicks: 6, forceZero: true });

    const plane = createPlane(svgEl, {
      width: 540,
      height: 300,
      xMin: 0,
      xMax: maxN + 1,
      yMin: axis.yMin,
      yMax: axis.yMax,
      xStep: Math.ceil(maxN / 8),
      yStep: axis.yStep,
      yFmt: axis.yFmt,
      xLabel: 'n → ∞',
      yLabel: 'a(n)',
    });

    plane.layers.under.append(
      s('line', {
        x1: plane.sx(0),
        y1: plane.sy(0),
        x2: plane.sx(maxN + 1),
        y2: plane.sy(0),
        stroke: 'var(--yellow)',
        'stroke-width': '1.5',
        'stroke-dasharray': '5 4',
        opacity: '0.6',
      })
    );

    data.forEach((d) => {
      plane.layers.marks.append(
        s('circle', {
          cx: plane.sx(d.year || d.n),
          cy: plane.sy(d.val),
          r: d.n === maxN ? 5 : 3.5,
          fill: d.n === maxN ? 'var(--yellow)' : 'var(--blue)',
          stroke: 'var(--ink)',
          'stroke-width': '1',
        })
      );
    });
  }

  updateDynamic();
}
