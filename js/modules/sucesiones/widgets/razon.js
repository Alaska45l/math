/**
 * widgets/razon.js — Widget interactivo para la Sección 9:
 * El Radar de la razón r: signos negativos, bastones verticales y trampa de los paréntesis.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';
import { react } from '../../../core/vn.js';
import { calcSafeAxis } from '../scale.js';

const PRESETS = [
  { id: 'decay_pos', label: '64 · (1/4)ⁿ⁻¹ (Amortiguada a 0)', k: 64, r: 0.25, title: '0 < r < 1: Decaimiento positivo' },
  { id: 'decay_neg', label: '16 · (−0,5)ⁿ⁻¹ (Alternancia a 0)', k: 16, r: -0.5, title: '−1 < r < 0: Alternancia amortiguada' },
  { id: 'khan_neg', label: '8 · (−5)ⁿ⁻¹ (Caso Khan)', k: 8, r: -5, title: 'r < −1: Alternancia divergente' },
  { id: 'growth_pos', label: '3 · 2ⁿ⁻¹ (Crecimiento)', k: 3, r: 2, title: 'r > 1: Crecimiento exponencial' },
];

export function initRazonWidget(container) {
  let kVal = 8;
  let rVal = -5;
  let tryContinuous = false;

  function render() {
    const nList = [1, 2, 3, 4];
    const terms = nList.map((n) => {
      const withParen = kVal * Math.pow(rVal, n - 1);
      const withoutParen = -(kVal * Math.pow(Math.abs(rVal), n - 1));
      return { n, withParen, withoutParen };
    });

    // Botones de presets
    const presetButtons = h('div', { class: 'seq-controls' },
      PRESETS.map((item) => {
        const isActive = Math.abs(kVal - item.k) < 1e-4 && Math.abs(rVal - item.r) < 1e-4;
        const btn = h('button', {
          type: 'button',
          class: ['chip', isActive ? 'is-active' : ''],
          on: {
            click: () => {
              kVal = item.k;
              rVal = item.r;
              render();
            },
          },
        }, item.label);
        return btn;
      })
    );

    // Controles de sliders
    const controls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Primer término k: ',
        h('input', {
          type: 'number',
          min: -500,
          max: 500,
          class: 'seq-check__input-sm',
          value: kVal,
          on: {
            change: (e) => {
              const parsed = parseFloat(e.target.value);
              kVal = Number.isFinite(parsed) ? Math.max(-500, Math.min(500, parsed)) : 1;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label', style: 'min-width: 220px;' },
        `Razón común r: `,
        h('strong', { style: 'color: var(--yellow);' }, fmt(rVal)),
        h('input', {
          type: 'range',
          min: -3,
          max: 3,
          step: 0.1,
          value: Math.max(-3, Math.min(3, rVal)),
          class: 'seq-range',
          on: {
            input: (e) => {
              rVal = parseFloat(e.target.value);
              render();
            },
          },
        })
      ),
      h('label', { class: 'chip chip--toggle' },
        h('input', {
          type: 'checkbox',
          checked: tryContinuous,
          on: {
            change: (e) => {
              tryContinuous = e.target.checked;
              render();
              if (tryContinuous && rVal < 0) {
                react({
                  pose: 'colapso',
                  tag: '💧 Raíz prohibida en ℝ',
                  html: `¡Alerta de cortocircuito! Con razón negativa (<span class="eq">r = ${fmt(rVal)}</span>), en <span class="eq">n = 1,5</span> necesitarías calcular <span class="eq">(${fmt(rVal)})<sup>0,5</sup> = √(${fmt(rVal)}) ∉ ℝ</span>. ¡No existe ninguna curva continua real que conecte los puntos alternantes!`,
                });
              }
            },
          },
        }),
        'Intentar trazar curva continua en ℝ'
      )
    );

    // Tabla de valores
    const tableEl = h('div', { class: 'seq-table-wrap', style: 'flex: 1; min-width: 220px;' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'n'),
            h('th', null, 'Cálculo a(n)'),
            h('th', null, 'Valor')
          )
        ),
        h('tbody', null,
          terms.map((t) => {
            const isNeg = t.withParen < 0;
            return h('tr', null,
              h('td', null, `n = ${t.n}`),
              h('td', null, `${fmt(kVal)} · (${fmt(rVal)})^${t.n - 1}`),
              h('td', { style: isNeg ? 'color: var(--pink); font-weight: bold;' : 'color: var(--blue); font-weight: bold;' },
                fmt(t.withParen)
              )
            );
          })
        )
      )
    );

    // Gráfico Cartesiano SVG
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
      regimeText = `Régimen r > 1 (r = ${fmt(rVal)}): Crecimiento exponencial uniforme hacia +∞ sin cambio de signo.`;
    } else if (rVal > 0 && rVal < 1) {
      regimeText = `Régimen 0 < r < 1 (r = ${fmt(rVal)}): Amortiguación asintótica. Los términos son siempre positivos y se aproximan a 0.`;
    } else if (rVal < 0 && rVal > -1) {
      regimeText = `Régimen −1 < r < 0 (r = ${fmt(rVal)}): Alternancia de signos amortiguada. Rebota entre positivo y negativo acercándose a 0.`;
    } else if (rVal < -1) {
      regimeText = `Régimen r < −1 (r = ${fmt(rVal)}): Alternancia divergente. Rebota entre signos opuestos con oscilaciones cada vez más gigantescas.`;
    } else if (rVal === 1) {
      regimeText = 'r = 1: Sucesión constante.';
    } else if (rVal === -1) {
      regimeText = `r = −1: Oscilación infinita de amplitud fija entre +${fmt(Math.abs(kVal))} y −${fmt(Math.abs(kVal))}.`;
    } else {
      regimeText = 'r = 0: Se anula en todos los términos posteriores.';
    }

    const regimeNotice = h('div', { class: 'notice notice--info' },
      h('strong', null, 'Radar de la razón: '),
      h('span', null, regimeText)
    );

    // Alerta de no continuidad en reales si r < 0
    let continuityNotice = null;
    if (tryContinuous) {
      if (rVal < 0) {
        continuityNotice = h('div', { class: 'notice notice--err' },
          h('strong', null, '¡Bloqueado: Imposible trazar curva continua en ℝ! '),
          h('p', { style: 'margin: 4px 0;' },
            `Para evaluar en un punto no entero intermedio como n = 1,5 tendrías exponente n − 1 = 0,5 = 1/2. `,
            `Eso exigiría calcular (${fmt(rVal)})^(1/2) = √(${fmt(rVal)}), que es la raíz cuadrada de un número negativo (número imaginario ∉ ℝ). `,
            `Por esta razón matemática, las sucesiones con r < 0 solo pueden representarse como postes y puntos aislados.`
          )
        );
      } else {
        continuityNotice = h('div', { class: 'notice notice--ok' },
          h('strong', null, 'Curva continua válida en ℝ: '),
          h('span', null, 'Como r > 0, la base positiva permite evaluar para cualquier número real x, generando una curva suave.')
        );
      }
    }

    // Comparador en vivo: Con paréntesis vs Sin paréntesis (cuando r < 0)
    let liveParenComparator = null;
    if (rVal < 0) {
      liveParenComparator = h('div', { class: 'seq-block seq-block--caution' },
        h('strong', { class: 'seq-block__label' }, 'Comparador en vivo: La trampa de los paréntesis en base negativa:'),
        h('div', { class: 'seq-table-wrap' },
          h('table', { class: 'seq-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'n'),
                h('th', null, `Con paréntesis: ${fmt(kVal)} · (${fmt(rVal)})ⁿ⁻¹`),
                h('th', null, `Sin paréntesis: ${fmt(kVal)} · ${fmt(rVal)}ⁿ⁻¹`),
                h('th', null, '¿Por qué ocurre?')
              )
            ),
            h('tbody', null,
              terms.map((t) =>
                h('tr', null,
                  h('td', null, `n = ${t.n}`),
                  h('td', { style: 'color: var(--yellow); font-weight: bold;' }, fmt(t.withParen)),
                  h('td', { style: 'color: var(--pink); font-weight: bold;' }, fmt(t.withoutParen)),
                  h('td', { class: 'small' },
                    t.n % 2 === 1
                      ? 'Base negativa a potencia par es positiva (+), pero sin paréntesis el menos queda afuera.'
                      : 'Coinciden en signo negativo, pero por razones algebraicas distintas.'
                  )
                )
              )
            )
          )
        ),
        h('p', { class: 'small muted', style: 'margin-top: 6px;' },
          'Regla de oro: En JavaScript y en matemáticas, -5^2 = -(5^2) = -25. Para que la potencia afecte al signo negativo, los paréntesis (-5)^2 = 25 son obligatorios.'
        )
      );
    }

    const layoutGrid = h('div', { class: 'seq-fn-grid' },
      tableEl,
      plotCard
    );

    mount(container,
      presetButtons,
      controls,
      layoutGrid,
      regimeNotice,
      continuityNotice,
      liveParenComparator
    );

    // Configuración y dibujo del plano con escala adaptativa segura
    const allVals = terms.map((t) => t.withParen);
    const minVal = Math.min(...allVals, 0);
    const maxVal = Math.max(...allVals, 0);
    const axis = calcSafeAxis({ minVal, maxVal, targetTicks: 6, forceZero: true });

    const plane = createPlane(svgEl, {
      width: 540,
      height: 320,
      xMin: 0,
      xMax: 5,
      yMin: axis.yMin,
      yMax: axis.yMax,
      xStep: 1,
      yStep: axis.yStep,
      yFmt: axis.yFmt,
      xLabel: 'n (índice entero ∈ ℕ)',
      yLabel: 'a(n)',
    });

    const axisY0 = plane.sy(0);

    // Curva continua punteada si r > 0 y tryContinuous está activo
    if (tryContinuous && rVal > 0) {
      const curvePath = plane.fnPath((n) => kVal * Math.pow(rVal, n - 1), 0.5, 4.5, { samples: 150 });
      plane.layers.under.append(
        s('path', {
          d: curvePath,
          stroke: 'var(--blue)',
          'stroke-width': '2',
          'stroke-dasharray': '5 5',
          fill: 'none',
        })
      );
    }

    // Si tryContinuous y r < 0, dibujar marca de imposibilidad en n = 1.5
    if (tryContinuous && rVal < 0) {
      const midX = plane.sx(1.5);
      plane.layers.marks.append(
        s('line', {
          x1: midX,
          y1: plane.sy(axis.yMin),
          x2: midX,
          y2: plane.sy(axis.yMax),
          stroke: 'var(--pink)',
          'stroke-width': '1.5',
          'stroke-dasharray': '3 3',
        }),
        s('circle', {
          cx: midX,
          cy: axisY0,
          r: 9,
          fill: 'var(--pink)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        }),
        s('text', {
          x: midX,
          y: axisY0 - 16,
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
          'font-weight': 'bold',
          'text-anchor': 'middle',
        }, 'n=1,5 ⟹ √r ∉ ℝ')
      );
    }

    // Dibujar bastones verticales y puntos discretos
    terms.forEach((pt) => {
      const cx = plane.sx(pt.n);
      const cy = plane.sy(pt.withParen);
      const isNeg = pt.withParen < 0;

      // Bastón vertical (dropline) hacia el eje y = 0
      plane.layers.marks.append(
        s('line', {
          x1: cx,
          y1: axisY0,
          x2: cx,
          y2: cy,
          stroke: isNeg ? 'var(--pink)' : 'var(--blue)',
          'stroke-width': '2',
          'stroke-dasharray': '4 4',
          opacity: '0.75',
        })
      );

      // Círculo del punto discreto
      plane.layers.marks.append(
        s('circle', {
          cx,
          cy,
          r: 6.5,
          fill: isNeg ? 'var(--pink)' : 'var(--blue)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        })
      );

      // Etiqueta del punto
      plane.layers.labels.append(
        s('text', {
          x: cx,
          y: isNeg ? cy + 18 : cy - 10,
          class: 'seq-plot-point-label',
          'text-anchor': 'middle',
          fill: isNeg ? 'var(--pink)' : 'var(--ink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, fmt(pt.withParen))
      );
    });
  }

  render();
}
