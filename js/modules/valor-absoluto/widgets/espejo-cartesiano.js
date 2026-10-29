/**
 * widgets/espejo-cartesiano.js — Widget interactivo para la Sección 2:
 * El Espejo Tectónico del Eje X (plegado de 0% a 100% de y = g(x) hacia y = |g(x)|)
 * y explorador de puntos simétricos (-x, |x|) vs (x, |x|).
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';

const PRESETS = [
  {
    id: 'identidad',
    label: 'Recta identidad: g(x) = x  →  y = |x|',
    g: (x) => x,
    rootDesc: 'Vértice en el origen (0; 0). Eje de simetría x = 0.',
  },
  {
    id: 'corrida',
    label: 'Recta desplazada: g(x) = x − 2  →  y = |x − 2|',
    g: (x) => x - 2,
    rootDesc: 'La recta cortaba al eje X en x = 2: ahí nace el nuevo vértice (2; 0).',
  },
  {
    id: 'parabola',
    label: 'Bonus Exactas: Parábola g(x) = x² − 4  →  y = |x² − 4|',
    g: (x) => (x * x) - 4,
    rootDesc: '¡El espejo funciona con cualquier función! La panza negativa entre −2 y 2 rebota hacia arriba.',
  },
];

export function initEspejoCartesianoWidget(container) {
  let presetIdx = 0;
  let foldPct = 100; // 0 a 100%
  let probeX = 3;

  function render() {
    const p = PRESETS[presetIdx];
    const t = foldPct / 100; // 0 = sin reflejar (g(x)), 1 = reflejado total (|g(x)|)

    // Función interpolada durante el plegado del tramo negativo:
    // Si g(x) >= 0 queda igual; si g(x) < 0 se interpola entre g(x) (t=0) y -g(x) (t=1)
    const foldedFn = (x) => {
      const y = p.g(x);
      if (y >= 0) return y;
      return y * (1 - 2 * t);
    };

    const presetRow = h('div', { class: 'seq-controls' },
      PRESETS.map((item, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === presetIdx ? 'is-active' : ''],
          on: {
            click: () => {
              presetIdx = idx;
              render();
            },
          },
        }, item.label)
      )
    );

    const sliderControls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Plegar con el Espejo |·| (${foldPct}%): `,
        h('input', {
          type: 'range',
          min: '0',
          max: '100',
          step: '5',
          value: String(foldPct),
          on: {
            input: (e) => {
              foldPct = parseInt(e.target.value, 10) || 0;
              render();
            },
          },
        })
      ),
      h('button', {
        type: 'button',
        class: 'chip',
        on: {
          click: () => {
            foldPct = foldPct < 100 ? 100 : 0;
            render();
          },
        },
      }, foldPct < 100 ? 'Activar espejo al 100%' : 'Ver recta original sin espejo (0%)'),
      h('label', { class: 'field__label' },
        `Explorar par simétrico x = ±${fmt(Math.abs(probeX))}: `,
        h('input', {
          type: 'range',
          min: '0.5',
          max: '5',
          step: '0.5',
          value: String(Math.abs(probeX)),
          on: {
            input: (e) => {
              probeX = parseFloat(e.target.value) || 2;
              render();
            },
          },
        })
      )
    );

    const svg = s('svg', {
      viewBox: '0 0 580 350',
      class: 'seq-plot abs-board-svg',
      role: 'img',
      'aria-label': 'Plano cartesiano mostrando cómo el eje X actúa como espejo reflejando la parte negativa',
    });

    const plane = createPlane(svg, {
      width: 580,
      height: 350,
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 6,
      xStep: 1,
      yStep: 1,
    });

    // Zona sombreada del semiplano inferior C- (bajo tierra)
    plane.layers.shade.append(
      s('rect', {
        x: plane.sx(-6),
        y: plane.sy(0),
        width: plane.sx(6) - plane.sx(-6),
        height: plane.sy(-6) - plane.sy(0),
        fill: 'color-mix(in srgb, var(--pink) 7%, transparent)',
      })
    );

    // Espejo sobre el eje X
    plane.layers.axes.append(
      s('line', {
        x1: plane.sx(-6),
        y1: plane.sy(0),
        x2: plane.sx(6),
        y2: plane.sy(0),
        stroke: 'var(--yellow)',
        'stroke-width': '2.6',
        opacity: '0.75',
      })
    );

    // Rastro original fantasma debajo del eje X (g(x) original)
    const ghostPath = plane.fnPath(p.g, -6, 6, { samples: 200 });
    plane.layers.under.append(
      s('path', {
        d: ghostPath,
        fill: 'none',
        stroke: 'var(--muted)',
        'stroke-width': '2',
        'stroke-dasharray': '5 5',
        opacity: '0.7',
      })
    );

    // Curva plegada actual
    const foldedPath = plane.fnPath(foldedFn, -6, 6, { samples: 240, breaks: [0, 2, -2] });
    plane.layers.curve.append(
      s('path', {
        d: foldedPath,
        fill: 'none',
        stroke: 'var(--blue)',
        'stroke-width': '3.2',
      })
    );

    // Puntos simétricos (-probeX, yL) y (+probeX, yR)
    const xPos = Math.abs(probeX);
    const xNeg = -xPos;
    const yPos = foldedFn(xPos);
    const yNeg = foldedFn(xNeg);
    const yNegOrig = p.g(xNeg);

    // Flecha desde el punto negativo original hasta el reflejado
    if (yNegOrig < 0 && t > 0.05) {
      plane.layers.under.append(
        s('line', {
          x1: plane.sx(xNeg),
          y1: plane.sy(yNegOrig),
          x2: plane.sx(xNeg),
          y2: plane.sy(yNeg),
          stroke: 'var(--yellow)',
          'stroke-width': '1.8',
          'stroke-dasharray': '3 3',
          'marker-end': `url(#${plane.arrowId})`,
        }),
        s('circle', {
          cx: plane.sx(xNeg),
          cy: plane.sy(yNegOrig),
          r: 4.5,
          fill: 'var(--muted)',
        })
      );
    }

    plane.layers.marks.append(
      s('circle', {
        cx: plane.sx(xPos),
        cy: plane.sy(yPos),
        r: 6.5,
        fill: 'var(--yellow)',
        stroke: 'var(--bg)',
        'stroke-width': '2',
      }),
      s('circle', {
        cx: plane.sx(xNeg),
        cy: plane.sy(yNeg),
        r: 6.5,
        fill: 'var(--yellow)',
        stroke: 'var(--bg)',
        'stroke-width': '2',
      })
    );

    plane.layers.labels.append(
      s('text', {
        x: plane.sx(xPos),
        y: plane.sy(yPos) - 12,
        'text-anchor': 'middle',
        fill: 'var(--yellow)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
        'font-weight': 'bold',
      }, `(${fmt(xPos)}; ${fmt(yPos)})`),
      s('text', {
        x: plane.sx(xNeg),
        y: plane.sy(yNeg) - 12,
        'text-anchor': 'middle',
        fill: 'var(--yellow)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
        'font-weight': 'bold',
      }, `(${fmt(xNeg)}; ${fmt(yNeg)})`)
    );

    bindSvgDrag(svg, plane, ({ x }) => {
      const next = Math.max(0.5, Math.min(5.5, Math.round(Math.abs(x) * 2) / 2));
      if (next !== probeX) {
        probeX = next;
        render();
      }
    });

    const infoCard = h('div', { class: 'notice', style: 'margin-top: 10px;' },
      h('div', null,
        h('strong', { style: 'color: var(--yellow);' }, p.rootDesc),
        h('p', { class: 'small', style: 'margin: 4px 0 0;' },
          `En x = ${fmt(xNeg)}, antes del espejo la altura era ${fmt(yNegOrig)}. Al plegar al ${foldPct}%, la salida vale ${fmt(yNeg)}. `,
          presetIdx === 0 && foldPct === 100
            ? `Fijate que (${fmt(xNeg)}; ${fmt(yNeg)}) y (${fmt(xPos)}; ${fmt(yPos)}) dan la misma altura: la rama izquierda tiene pendiente ${MINUS}1 y la derecha tiene pendiente +1.`
            : ''
        )
      )
    );

    mount(container, presetRow, sliderControls, svg, infoCard);
  }

  render();
}
