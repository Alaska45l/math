/**
 * widgets/funcion.js — Widget interactivo para la Sección 3:
 * Las sucesiones son funciones de dominio discreto en ℕ.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';
import { react } from '../../../core/vn.js';

const PRESETS = [
  { id: 'impares', label: '3, 5, 7, 9…', fn: (n) => 3 + 2 * (n - 1), d: 2, isGeo: false, yMax: 14, yMin: 0 },
  { id: 'decrece', label: '21, 16, 11, 6…', fn: (n) => 21 - 5 * (n - 1), d: -5, isGeo: false, yMax: 25, yMin: -5 },
  { id: 'geom', label: '1, 2, 4, 8…', fn: (n) => Math.pow(2, n - 1), isGeo: true, r: 2, yMax: 18, yMin: 0 },
];

export function initFuncionWidget(container) {
  let presetIdx = 0;
  let cursorN = 2;
  let showSlopeLine = false;

  function render() {
    const p = PRESETS[presetIdx];
    const nList = [1, 2, 3, 4, 5];
    const termPoints = nList.map((n) => ({ n, val: p.fn(n) }));

    const controls = h('div', { class: 'seq-controls' },
      PRESETS.map((preset, idx) => {
        const btn = h('button', {
          type: 'button',
          class: ['chip', idx === presetIdx ? 'is-active' : ''],
        }, preset.label);
        btn.addEventListener('click', () => {
          presetIdx = idx;
          cursorN = 2;
          render();
        });
        return btn;
      }),
      h('label', { class: 'chip chip--toggle' },
        h('input', {
          type: 'checkbox',
          checked: showSlopeLine,
          on: {
            change: (e) => {
              showSlopeLine = e.target.checked;
              render();
            },
          },
        }),
        'Mostrar recta/curva guía punteada'
      )
    );

    // Tabla n | a(n)
    const tableEl = h('div', { class: 'seq-table-wrap' },
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'n (Entrada)'),
            h('th', null, 'a(n) (Salida)')
          )
        ),
        h('tbody', null,
          termPoints.map((pt) => {
            const isMatchCursor = Math.abs(cursorN - pt.n) < 0.1;
            return h('tr', { class: isMatchCursor ? 'is-active' : '' },
              h('td', null, String(pt.n)),
              h('td', null, fmt(pt.val))
            );
          })
        )
      )
    );

    // Gráfico cartesiano
    const svgEl = s('svg', {
      viewBox: '0 0 540 320',
      class: 'seq-plot',
      role: 'img',
      'aria-label': 'Gráfico de la sucesión con puntos aislados en números enteros',
    });

    const isIntegerN = Math.abs(cursorN - Math.round(cursorN)) < 0.05;
    const roundedN = Math.round(cursorN);

    // Mensaje de dominio
    const domainNotice = h('div', { class: 'notice notice--domain' },
      isIntegerN && roundedN >= 1 && roundedN <= 5
        ? h('span', null, `En n = ${roundedN} (entero positivo), el término está perfectamente definido: a(${roundedN}) = ${fmt(p.fn(roundedN))}.`)
        : h('span', { class: 'text-warn' },
            `En n = ${fmt(cursorN, 1)} hay vacío: el dominio son solo enteros positivos (ℕ = {1, 2, 3…}). No existe el término a(${fmt(cursorN, 1)}).`
          )
    );

    const layoutGrid = h('div', { class: 'seq-fn-grid' },
      tableEl,
      h('div', { class: 'seq-plot-card' },
        svgEl,
        domainNotice
      )
    );

    mount(container,
      controls,
      layoutGrid
    );

    const yStep = (p.yMax - p.yMin) > 20 ? 5 : (p.yMax - p.yMin) > 10 ? 2 : 1;
    const plane = createPlane(svgEl, {
      width: 540,
      height: 320,
      xMin: 0,
      xMax: 6,
      yMin: p.yMin,
      yMax: p.yMax,
      xStep: 1,
      yStep,
      xLabel: 'n (índice entero ∈ ℕ)',
      yLabel: 'a(n)',
    });

    // Curva punteada continua si está activa
    if (showSlopeLine) {
      const dPath = plane.fnPath(p.fn, 0.5, 5.5, { samples: 100 });
      plane.layers.under.append(
        s('path', {
          d: dPath,
          class: 'seq-guide-line',
          stroke: 'var(--muted)',
          'stroke-dasharray': '5 5',
          'stroke-width': '1.5',
          fill: 'none',
        })
      );
    }

    // Puntos discretos aislados
    termPoints.forEach((pt) => {
      const cx = plane.sx(pt.n);
      const cy = plane.sy(pt.val);
      const isCur = Math.abs(cursorN - pt.n) < 0.1;

      // Círculo del punto
      plane.layers.marks.append(
        s('circle', {
          cx,
          cy,
          r: isCur ? 7 : 5,
          fill: isCur ? 'var(--yellow)' : 'var(--blue)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        })
      );

      // Etiqueta del punto (n, a(n))
      plane.layers.labels.append(
        s('text', {
          x: cx,
          y: cy - 10,
          class: ['seq-plot-point-label', isCur ? 'is-highlight' : ''],
          'text-anchor': 'middle',
          fill: isCur ? 'var(--yellow)' : 'var(--ink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
        }, `(${pt.n}; ${fmt(pt.val)})`)
      );
    });

    // Indicador del cursor N
    const cursorX = plane.sx(cursorN);
    plane.layers.marks.append(
      s('line', {
        x1: cursorX,
        y1: plane.sy(p.yMin),
        x2: cursorX,
        y2: plane.sy(p.yMax),
        stroke: isIntegerN ? 'var(--yellow)' : 'var(--pink)',
        'stroke-width': '2',
        'stroke-dasharray': isIntegerN ? 'none' : '4 3',
        opacity: '0.85',
      })
    );

    if (!isIntegerN) {
      const midY = plane.sy(p.fn(cursorN));
      plane.layers.marks.append(
        s('circle', {
          cx: cursorX,
          cy: midY,
          r: 8,
          fill: 'var(--pink)',
          stroke: 'var(--ink)',
          'stroke-width': '2',
        }),
        s('text', {
          x: cursorX,
          y: midY + 4,
          fill: 'var(--ink)',
          'font-family': 'var(--font-hand)',
          'font-size': '12px',
          'font-weight': 'bold',
          'text-anchor': 'middle',
        }, '✕'),
        s('text', {
          x: cursorX,
          y: midY - 14,
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': '13px',
          'font-weight': 'bold',
          'text-anchor': 'middle',
        }, `n = ${fmt(cursorN, 1)} ∉ ℕ (Vacío)`)
      );
    }

    // Eventos de arrastre/clic en el plano
    bindSvgDrag(svgEl, plane, ({ x }) => {
      const prevN = cursorN;
      cursorN = Math.max(0.5, Math.min(5.5, Math.round(x * 10) / 10));
      render();

      const isDecimal = Math.abs(cursorN - Math.round(cursorN)) >= 0.05;
      if (isDecimal && cursorN !== prevN) {
        react({
          pose: 'enojada',
          tag: '💢 Dominio discreto',
          html: `¡En ℕ no existen términos con coma! Caíste en el vacío de <span class="eq">n = ${fmt(cursorN, 1)} ∉ ℕ</span>. Las sucesiones son funciones de dominio estrictamente entero.`,
        });
      }
    });
  }

  render();
}
