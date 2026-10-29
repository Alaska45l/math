/**
 * widgets/aduana-partes.js — Widget interactivo para la Sección 8:
 * Introducción y evaluación de funciones definidas por partes con «Aduana de Dominio» en vivo.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt, paren } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';
import { piecewiseBrace } from '../components.js';
import { evalPiecewise } from '../logic.js';

const PRESETS = [
  {
    id: 'khan1',
    label: 'Preset 1 · Dos tramos lineales con salto en x = 2',
    boundaries: [2],
    pieces: [
      {
        exprText: '2x + 1',
        condition: 'x < 2',
        minX: -Infinity,
        maxX: 2,
        minInclusive: false,
        maxInclusive: false,
        fn: (x) => 2 * x + 1,
        evalDetail: (x) => `2 · ${paren(x)} + 1 = ${fmt(2 * x + 1)}`,
      },
      {
        exprText: 'x − 1',
        condition: 'x ≥ 2',
        minX: 2,
        maxX: Infinity,
        minInclusive: true,
        maxInclusive: false,
        fn: (x) => x - 1,
        evalDetail: (x) => `${fmt(x)} − 1 = ${fmt(x - 1)}`,
      },
    ],
  },
  {
    id: 'khan2',
    label: 'Preset 2 · Parábola + Recta (Frontera en x = 0)',
    boundaries: [0],
    pieces: [
      {
        exprText: 'x² − 2',
        condition: 'x ≤ 0',
        minX: -Infinity,
        maxX: 0,
        minInclusive: false,
        maxInclusive: true,
        fn: (x) => x * x - 2,
        evalDetail: (x) => `${paren(x)}² − 2 = ${fmt(x * x - 2)}`,
      },
      {
        exprText: '−x + 3',
        condition: 'x > 0',
        minX: 0,
        maxX: Infinity,
        minInclusive: false,
        maxInclusive: false,
        fn: (x) => -x + 3,
        evalDetail: (x) => `−${paren(x)} + 3 = ${fmt(-x + 3)}`,
      },
    ],
  },
  {
    id: 'khan3',
    label: 'Preset 3 · Tres territorios (−2 y 1)',
    boundaries: [-2, 1],
    pieces: [
      {
        exprText: '−3',
        condition: 'x < −2',
        minX: -Infinity,
        maxX: -2,
        minInclusive: false,
        maxInclusive: false,
        fn: () => -3,
        evalDetail: () => '−3 (constante)',
      },
      {
        exprText: 'x + 2',
        condition: '−2 ≤ x ≤ 1',
        minX: -2,
        maxX: 1,
        minInclusive: true,
        maxInclusive: true,
        fn: (x) => x + 2,
        evalDetail: (x) => `${fmt(x)} + 2 = ${fmt(x + 2)}`,
      },
      {
        exprText: '−2x + 5',
        condition: 'x > 1',
        minX: 1,
        maxX: Infinity,
        minInclusive: false,
        maxInclusive: false,
        fn: (x) => -2 * x + 5,
        evalDetail: (x) => `−2 · ${paren(x)} + 5 = ${fmt(-2 * x + 5)}`,
      },
    ],
  },
];

export function initAduanaPartesWidget(container) {
  let presetIdx = 0;
  let cursorX = 2; // empieza justo en la frontera para mostrar la diferencia entre < y >=

  function render() {
    const p = PRESETS[presetIdx];
    const ev = evalPiecewise(p.pieces, cursorX);
    const activeIdx = ev.activePieceIndex;
    const rejectedIndices = p.pieces.map((_, idx) => idx).filter((idx) => idx !== activeIdx);

    const presetRow = h('div', { class: 'seq-controls' },
      PRESETS.map((item, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === presetIdx ? 'is-active' : ''],
          on: {
            click: () => {
              presetIdx = idx;
              cursorX = item.boundaries[0];
              render();
            },
          },
        }, item.label)
      )
    );

    const controlsRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Entrada a evaluar x (${fmt(cursorX)}): `,
        h('input', {
          type: 'range',
          min: '-5',
          max: '5',
          step: '0.5',
          value: String(cursorX),
          on: {
            input: (e) => {
              cursorX = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      ...p.boundaries.map((bx) =>
        h('button', {
          type: 'button',
          class: 'chip',
          on: {
            click: () => {
              cursorX = bx;
              render();
            },
          },
        }, `Probar frontera exacta x = ${fmt(bx)}`)
      )
    );

    const braceSlot = h('div', { style: 'flex: 1; min-width: 260px;' });
    piecewiseBrace(braceSlot, p.pieces, activeIdx, {
      fnName: 'f(x)',
      rejectedIndices,
    });

    const activePiece = activeIdx >= 0 ? p.pieces[activeIdx] : null;
    const aduanaCard = h('div', { class: 'seq-check__card', style: 'flex: 1.2; min-width: 260px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, `Aduana de Dominio para x = ${fmt(cursorX)}`),
      ...p.pieces.map((piece, idx) => {
        const isOk = idx === activeIdx;
        return h('div', {
          class: 'small',
          style: `padding: 4px 8px; margin: 4px 0; border-left: 3px solid ${isOk ? 'var(--yellow)' : 'var(--pink)'};`,
        },
          h('strong', { style: `color: ${isOk ? 'var(--yellow)' : 'var(--pink)'};` },
            isOk ? `✓ Tramo ${idx + 1} (${piece.condition}): ACEPTADO` : `✗ Tramo ${idx + 1} (${piece.condition}): RECHAZADO`
          ),
          isOk
            ? h('div', { class: 'eq', style: 'color: var(--green); margin-top: 2px;' },
                `Reemplazamos en f(x) = ${piece.exprText}  ⟹  f(${fmt(cursorX)}) = ${piece.evalDetail(cursorX)}`
              )
            : h('div', { class: 'muted' }, `x = ${fmt(cursorX)} no cumple ${piece.condition}. ¡Prohibido reemplazar acá!`)
        );
      })
    );

    // Gráfico cartesiano con puntos abiertos (◦) y cerrados (•)
    const svg = s('svg', {
      viewBox: '0 0 580 340',
      class: 'seq-plot abs-board-svg',
      role: 'img',
      'aria-label': 'Gráfico de la función definida por partes con puntos abiertos y cerrados en la frontera',
    });

    const plane = createPlane(svg, {
      width: 580,
      height: 340,
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 7,
      xStep: 1,
      yStep: 1,
    });

    // Fronteras verticales punteadas
    p.boundaries.forEach((bx) => {
      plane.layers.under.append(
        s('line', {
          x1: plane.sx(bx),
          y1: plane.sy(-6),
          x2: plane.sx(bx),
          y2: plane.sy(7),
          stroke: 'var(--muted)',
          'stroke-width': '1.5',
          'stroke-dasharray': '4 4',
        })
      );
    });

    // Dibujar cada tramo y sus puntos de borde
    p.pieces.forEach((piece, idx) => {
      const a = Math.max(-6, piece.minX);
      const b = Math.min(6, piece.maxX);
      const isSelected = idx === activeIdx;
      const d = plane.fnPath(piece.fn, a, b, { samples: 120 });

      plane.layers.curve.append(
        s('path', {
          d,
          fill: 'none',
          stroke: isSelected ? 'var(--yellow)' : 'var(--blue)',
          'stroke-width': isSelected ? '3.6' : '2.4',
        })
      );

      // Extremo izquierdo finito
      if (Number.isFinite(piece.minX)) {
        const yMinPt = piece.fn(piece.minX);
        plane.layers.marks.append(
          s('circle', {
            cx: plane.sx(piece.minX),
            cy: plane.sy(yMinPt),
            r: 5.5,
            fill: piece.minInclusive ? (isSelected ? 'var(--yellow)' : 'var(--blue)') : 'var(--bg)',
            stroke: isSelected ? 'var(--yellow)' : 'var(--blue)',
            'stroke-width': '2.4',
          })
        );
      }

      // Extremo derecho finito
      if (Number.isFinite(piece.maxX)) {
        const yMaxPt = piece.fn(piece.maxX);
        plane.layers.marks.append(
          s('circle', {
            cx: plane.sx(piece.maxX),
            cy: plane.sy(yMaxPt),
            r: 5.5,
            fill: piece.maxInclusive ? (isSelected ? 'var(--yellow)' : 'var(--blue)') : 'var(--bg)',
            stroke: isSelected ? 'var(--yellow)' : 'var(--blue)',
            'stroke-width': '2.4',
          })
        );
      }
    });

    // Cursor vertical y punto evaluado
    if (ev.defined && activePiece) {
      const cx = plane.sx(cursorX);
      const cy = plane.sy(ev.y);
      plane.layers.over.append(
        s('line', {
          x1: cx,
          y1: plane.xAxisY,
          x2: cx,
          y2: cy,
          stroke: 'var(--green)',
          'stroke-width': '2',
          'stroke-dasharray': '3 3',
        }),
        s('circle', {
          cx,
          cy,
          r: 7.5,
          fill: 'var(--green)',
          stroke: 'var(--bg)',
          'stroke-width': '2.2',
        })
      );
      plane.layers.labels.append(
        s('text', {
          x: cx,
          y: cy - 12,
          'text-anchor': 'middle',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 15px)',
          'font-weight': 'bold',
        }, `(${fmt(cursorX)}; ${fmt(ev.y)})`)
      );
    }

    bindSvgDrag(svg, plane, ({ x }) => {
      const next = Math.max(-5, Math.min(5, Math.round(x * 2) / 2));
      if (next !== cursorX) {
        cursorX = next;
        render();
      }
    });

    mount(
      container,
      presetRow,
      controlsRow,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, braceSlot, aduanaCard),
      svg
    );
  }

  render();
}
