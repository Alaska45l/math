/**
 * widgets/razon.js — Widget interactivo para la Sección 9:
 * Radar de la razón común r: regímenes, alternancia de signos y base negativa entre paréntesis.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';

const REGIMES = [
  { label: 'r = 2 (Crecimiento)', r: 2, k: 1 },
  { label: 'r = 0,5 (Amortiguación a 0)', r: 0.5, k: 16 },
  { label: 'r = −0,5 (Alternancia hacia 0)', r: -0.5, k: 16 },
  { label: 'r = −2 (Alternancia divergente)', r: -2, k: 2 },
  { label: 'Caso Khan: 8 · (−5)^(n − 1)', r: -5, k: 8 },
];

export function initRazonWidget(container) {
  let kVal = 8;
  let rVal = -2;
  let tryContinuous = false;

  function render() {
    const nList = [1, 2, 3, 4, 5];
    const terms = nList.map((n) => ({ n, val: kVal * Math.pow(rVal, n - 1) }));

    const presetButtons = h('div', { class: 'seq-controls' },
      REGIMES.map((reg) =>
        h('button', {
          type: 'button',
          class: 'chip',
          on: { click: () => { kVal = reg.k; rVal = reg.r; render(); } },
        }, reg.label)
      )
    );

    const controls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Primer término k: ',
        h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          value: kVal,
          on: { change: (e) => { kVal = parseFloat(e.target.value) || 1; render(); } },
        })
      ),
      h('label', { class: 'field__label' },
        `Razón común r: `,
        h('strong', { style: 'color: var(--yellow);' }, fmt(rVal)),
        h('input', {
          type: 'range',
          min: -3,
          max: 3,
          step: 0.25,
          value: Math.max(-3, Math.min(3, rVal)),
          class: 'seq-range',
          on: { input: (e) => { rVal = parseFloat(e.target.value); render(); } },
        })
      ),
      h('label', { class: 'chip chip--toggle' },
        h('input', {
          type: 'checkbox',
          checked: tryContinuous,
          on: { change: (e) => { tryContinuous = e.target.checked; render(); } },
        }),
        'Intentar trazar curva continua en ℝ'
      )
    );

    // Tabla de valores con colores de alternancia de signo
    const tableEl = h('div', { class: 'seq-table-wrap', style: 'flex: 1; min-width: 200px;' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'n'),
            h('th', null, 'Cálculo'),
            h('th', null, 'a(n)')
          )
        ),
        h('tbody', null,
          terms.map((t) => {
            const isNeg = t.val < 0;
            return h('tr', null,
              h('td', null, `n = ${t.n}`),
              h('td', null, `${fmt(kVal)} · (${fmt(rVal)})^${t.n - 1}`),
              h('td', { style: isNeg ? 'color: var(--pink); font-weight: bold;' : 'color: var(--blue); font-weight: bold;' },
                fmt(t.val)
              )
            );
          })
        )
      )
    );

    // Gráfico Cartesiano
    const svgEl = s('svg', {
      viewBox: '0 0 540 320',
      class: 'seq-plot',
      role: 'img',
      'aria-label': 'Gráfico de alternancia de signos de la sucesión geométrica',
    });

    const plotCard = h('div', { class: 'seq-plot-card', style: 'flex: 1.5; min-width: 300px;' }, svgEl);

    // Diagnóstico del radar de la razón
    let regimeText = '';
    if (rVal > 1) {
      regimeText = `Régimen r > 1 (${fmt(rVal)}): Los términos son positivos y crecen exponencialmente hacia infinito.`;
    } else if (rVal > 0 && rVal < 1) {
      regimeText = `Régimen 0 < r < 1 (${fmt(rVal)}): Los términos son positivos y se achican asintóticamente hacia 0 sin tocarlo jamás.`;
    } else if (rVal < 0 && rVal > -1) {
      regimeText = `Régimen −1 < r < 0 (${fmt(rVal)}): ¡Alternancia de signos amortiguada! Rebota entre positivo y negativo acercándose a 0.`;
    } else if (rVal < -1) {
      regimeText = `Régimen r < −1 (${fmt(rVal)}): ¡Alternancia de signos divergente! Rebota entre positivo y negativo con oscilaciones cada vez más gigantescas.`;
    } else if (rVal === 1) {
      regimeText = 'r = 1: Sucesión constante.';
    } else if (rVal === -1) {
      regimeText = 'r = −1: Rebote permanente entre +k y −k.';
    } else {
      regimeText = 'r = 0: Todos los términos posteriores son 0.';
    }

    const regimeNotice = h('div', { class: 'notice notice--info' },
      h('strong', null, 'Radar de la razón: '),
      h('span', null, regimeText)
    );

    let continuityWarning = null;
    if (tryContinuous) {
      if (rVal < 0) {
        continuityWarning = h('div', { class: 'notice notice--err' },
          h('strong', null, '¡Imposible trazar curva continua en ℝ! '),
          h('p', { style: 'margin: 4px 0;' },
            `Para evaluar en un punto decimal intermedio como n = 1,5 tendrías exponente n − 1 = 0,5 = 1/2.`,
            ` Eso requeriría calcular (${fmt(rVal)})^(1/2) = √(${fmt(rVal)}), que es la raíz cuadrada de un número negativo (número imaginario ∉ ℝ).`,
            ` ¡En los números reales las sucesiones con r < 0 solo existen como puntos aislados!`
          )
        );
      }
    }

    // Alerta de paréntesis obligatorios en base negativa
    const parenAlert = rVal < 0
      ? h('div', { class: 'seq-block--caution' },
          h('strong', { class: 'seq-block__label' }, 'Cuidado con los paréntesis en la base negativa:'),
          h('p', null,
            `Escribir `, h('code', null, `${fmt(kVal)} · (${fmt(rVal)})^(n − 1)`),
            ` eleva toda la base con su signo menos y produce la alternancia correcta (+, −, +, −).`,
            ` Si olvidás los paréntesis y ponés `, h('code', null, `${fmt(kVal)} · ${fmt(rVal)}^(n − 1)`),
            `, por jerarquía de operaciones la potencia se calcula antes que el signo menos, ¡haciendo que todos los términos salgan negativos!`
          )
        )
      : null;

    const layoutGrid = h('div', { class: 'seq-fn-grid' },
      tableEl,
      plotCard
    );

    mount(container,
      presetButtons,
      controls,
      layoutGrid,
      regimeNotice,
      continuityWarning,
      parenAlert
    );

    // Render del plano
    const allVals = terms.map((t) => t.val);
    const minVal = Math.min(...allVals, 0);
    const maxVal = Math.max(...allVals, 0);
    const ySpan = Math.max(10, maxVal - minVal);
    const yMin = Math.floor(minVal - ySpan * 0.15);
    const yMax = Math.ceil(maxVal + ySpan * 0.15);

    const plane = createPlane(svgEl, {
      width: 540,
      height: 320,
      xMin: 0,
      xMax: 6,
      yMin,
      yMax,
      xStep: 1,
      xLabel: 'n (índice entero ∈ ℕ)',
      yLabel: 'a(n)',
    });

    // Curva continua solo si r > 0 y tryContinuous está activo
    if (tryContinuous && rVal > 0) {
      const curvePath = plane.fnPath((n) => kVal * Math.pow(rVal, n - 1), 0.5, 5.5, { samples: 150 });
      plane.layers.under.append(
        s('path', {
          d: curvePath,
          stroke: 'var(--blue)',
          'stroke-width': '2',
          fill: 'none',
        })
      );
    }

    // Dibujar puntos
    terms.forEach((pt) => {
      const cx = plane.sx(pt.n);
      const cy = plane.sy(pt.val);
      const isNeg = pt.val < 0;

      plane.layers.marks.append(
        s('circle', {
          cx,
          cy,
          r: 6,
          fill: isNeg ? 'var(--pink)' : 'var(--blue)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        })
      );

      plane.layers.labels.append(
        s('text', {
          x: cx,
          y: isNeg ? cy + 18 : cy - 10,
          class: 'seq-plot-point-label',
          'text-anchor': 'middle',
          fill: isNeg ? 'var(--pink)' : 'var(--ink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, fmt(pt.val))
      );
    });
  }

  render();
}
