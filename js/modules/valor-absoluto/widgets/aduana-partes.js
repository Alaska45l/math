/**
 * aduana-partes.js — Widget 8 (Sección 8):
 * «La Aduana de Dominios: Evaluar Funciones por Partes».
 * Soporta arrastre continuo en el slider o directamente sobre el plano SVG,
 * muestra la llave escalable piecewiseBrace y las 3 tarjetas de Inspección de Aduana.
 */

import { h, s, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag, snapTo } from '../../../core/plot.js';
import { piecewiseBrace, dotBadge } from '../components.js';
import { evaluatePiecewise } from '../logic.js';

const PRESETS = [
  {
    name: 'Aduana 1: 3 tramos con saltos en x = −1 y x = 2',
    boundaries: [-1, 2],
    pieces: [
      {
        label: 'x + 3',
        condition: 'x < −1',
        condDesc: (x) => `${fmt(x)} < −1`,
        min: -Infinity,
        max: -1,
        leftClosed: false,
        rightClosed: false,
        fn: (x) => x + 3,
        color: 'var(--blue)',
      },
      {
        label: '−x + 1',
        condition: '−1 ≤ x < 2',
        condDesc: (x) => `−1 ≤ ${fmt(x)} < 2`,
        min: -1,
        max: 2,
        leftClosed: true,
        rightClosed: false,
        fn: (x) => -x + 1,
        color: 'var(--yellow)',
      },
      {
        label: '2',
        condition: 'x ≥ 2',
        condDesc: (x) => `${fmt(x)} ≥ 2`,
        min: 2,
        max: Infinity,
        leftClosed: true,
        rightClosed: false,
        fn: () => 2,
        color: 'var(--green)',
      },
    ],
  },
  {
    name: 'Aduana 2: Frontera en x = 1 (Parábola y Recta)',
    boundaries: [1],
    pieces: [
      {
        label: 'x²',
        condition: 'x ≤ 1',
        condDesc: (x) => `${fmt(x)} ≤ 1`,
        min: -Infinity,
        max: 1,
        leftClosed: false,
        rightClosed: true,
        fn: (x) => x * x,
        color: 'var(--teal)',
      },
      {
        label: '2x − 3',
        condition: 'x > 1',
        condDesc: (x) => `${fmt(x)} > 1`,
        min: 1,
        max: Infinity,
        leftClosed: false,
        rightClosed: false,
        fn: (x) => 2 * x - 3,
        color: 'var(--pink)',
      },
    ],
  },
];

export function initAduanaPartesWidget(container) {
  let state = {
    presetIdx: 0,
    x: -1,
  };

  const presetBtnsRow = h('div', { class: 'seq-controls' });
  const quickJumpRow = h('div', { class: 'seq-controls' });
  const plotCard = h('div', { class: 'seq-plot-card' });
  const braceSlot = h('div', { style: 'margin-top: 8px;' });
  const customsGrid = h('div', { class: 'va-customs-grid' });
  const readoutCard = h('div', { class: 'va-readout', style: 'margin-top: 10px;' });

  const valX = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, fmt(state.x));
  const sliderX = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.x,
    'aria-label': 'Entrada x que llega a la aduana',
  });

  const svg = s('svg', {
    class: 'seq-svg abs-board__svg',
    style: 'width: 100%; height: auto; max-height: 360px; display: block; touch-action: none; cursor: grab;',
    role: 'img',
    'aria-label': 'Gráfico de función definida por partes con aduana de dominios',
  });
  plotCard.append(svg);

  let activePlane = null;
  const snapKeys = [];
  for (let v = -5; v <= 5; v += 0.5) snapKeys.push(v);

  bindSvgDrag(
    svg,
    () => activePlane,
    ({ x: mathX }) => {
      const snapped = snapTo(Math.round(mathX * 2) / 2, snapKeys, 0.25);
      const clamped = Math.max(-5, Math.min(5, snapped));
      if (clamped !== state.x) {
        state.x = clamped;
        sliderX.value = String(state.x);
        syncUI();
      }
    }
  );

  sliderX.addEventListener('input', (e) => {
    state.x = parseFloat(e.target.value);
    syncUI();
  });

  function renderPlane() {
    const preset = PRESETS[state.presetIdx];
    const evalRes = evaluatePiecewise(preset.pieces, state.x);

    if (!activePlane) {
      activePlane = createPlane(svg, {
        xMin: -6,
        xMax: 6,
        yMin: -4,
        yMax: 6,
        width: 560,
        height: 340,
        xLabel: 'x',
        yLabel: 'y',
      });
    } else {
      activePlane.clear('under', 'curves', 'marks', 'labels');
    }

    const plane = activePlane;

    // Líneas verticales punteadas de frontera de aduana
    preset.boundaries.forEach((bVal) => {
      const bx = plane.sx(bVal);
      plane.layers.under.append(
        s('line', {
          x1: bx,
          y1: plane.sy(6),
          x2: bx,
          y2: plane.sy(-4),
          stroke: 'var(--teal)',
          'stroke-width': '1.6',
          'stroke-dasharray': '5 4',
        }),
        s('text', {
          x: bx + 6,
          y: plane.sy(5.4),
          fill: 'var(--teal)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, `Frontera x = ${fmt(bVal)}`)
      );
    });

    // Dibujar cada tramo con sus extremos abiertos (○) o cerrados (●)
    preset.pieces.forEach((p, idx) => {
      const isWinner = evalRes.pieceIndex === idx;
      const xStart = Math.max(-6, p.min);
      const xEnd = Math.min(6, p.max);
      const steps = 60;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const xv = xStart + ((xEnd - xStart) * i) / steps;
        const yv = p.fn(xv);
        pts.push(`${plane.sx(xv).toFixed(1)},${plane.sy(yv).toFixed(1)}`);
      }

      plane.layers.curves.append(
        s('polyline', {
          points: pts.join(' '),
          fill: 'none',
          stroke: p.color,
          'stroke-width': isWinner ? '3.8' : '2.2',
          opacity: isWinner ? '1' : '0.45',
        })
      );

      // Extremo izquierdo finito
      if (Number.isFinite(p.min)) {
        const ex = plane.sx(p.min);
        const ey = plane.sy(p.fn(p.min));
        plane.layers.marks.append(
          s('circle', {
            cx: ex,
            cy: ey,
            r: 6.5,
            fill: p.leftClosed ? p.color : 'var(--bg)',
            stroke: p.color,
            'stroke-width': '2.5',
          })
        );
      }

      // Extremo derecho finito
      if (Number.isFinite(p.max)) {
        const ex = plane.sx(p.max);
        const ey = plane.sy(p.fn(p.max));
        plane.layers.marks.append(
          s('circle', {
            cx: ex,
            cy: ey,
            r: 6.5,
            fill: p.rightClosed ? p.color : 'var(--bg)',
            stroke: p.color,
            'stroke-width': '2.5',
          })
        );
      }
    });

    // Escáner vertical en state.x y punto evaluado
    const sxPx = plane.sx(state.x);
    plane.layers.under.append(
      s('line', {
        x1: sxPx,
        y1: plane.sy(-4),
        x2: sxPx,
        y2: plane.sy(6),
        stroke: 'var(--yellow)',
        'stroke-width': '1.6',
        'stroke-dasharray': '3 3',
      })
    );

    if (evalRes.defined) {
      const syPx = plane.sy(evalRes.value);
      plane.layers.marks.append(
        s('circle', {
          cx: sxPx,
          cy: syPx,
          r: 8.5,
          fill: 'var(--yellow)',
          stroke: 'var(--bg)',
          'stroke-width': '2.4',
        }),
        s('text', {
          x: Math.max(55, Math.min(505, sxPx + 12)),
          y: Math.max(22, syPx - 10),
          fill: 'var(--yellow)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 15px)',
          'font-weight': 'bold',
        }, `f(${fmt(state.x)}) = ${fmt(evalRes.value)}`)
      );
    }
  }

  function syncUI() {
    const preset = PRESETS[state.presetIdx];
    const evalRes = evaluatePiecewise(preset.pieces, state.x);
    valX.textContent = fmt(state.x);

    mount(
      presetBtnsRow,
      ...PRESETS.map((pr, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', state.presetIdx === idx ? 'is-active' : ''],
          on: {
            click: () => {
              state.presetIdx = idx;
              state.x = pr.boundaries[0];
              sliderX.value = String(state.x);
              syncUI();
            },
          },
        }, pr.name)
      )
    );

    mount(
      quickJumpRow,
      h('label', { class: 'field__label' },
        'Entrada que llega a la aduana: x = ',
        valX,
        sliderX
      ),
      ...preset.boundaries.map((bVal) =>
        h('button', {
          type: 'button',
          class: ['chip', state.x === bVal ? 'is-active' : ''],
          on: {
            click: () => {
              state.x = bVal;
              sliderX.value = String(state.x);
              syncUI();
            },
          },
        }, `Probar frontera exacta x = ${fmt(bVal)}`)
      )
    );

    renderPlane();

    const rejectedIdxList = preset.pieces
      .map((_, i) => i)
      .filter((i) => i !== evalRes.pieceIndex);

    piecewiseBrace(
      braceSlot,
      preset.pieces.map((p) => ({
        exprText: p.label,
        condition: p.condition,
      })),
      evalRes.pieceIndex,
      { fnName: 'f(x)', rejectedIndices: rejectedIdxList }
    );

    // Tarjetas de Inspección de Aduana por cada renglón
    mount(
      customsGrid,
      ...preset.pieces.map((p, idx) => {
        const isWinner = evalRes.pieceIndex === idx;
        const isAtBoundary = preset.boundaries.includes(state.x);
        return h('div', {
          class: ['va-customs-card', isWinner ? 'is-winner' : 'is-rejected'],
        },
          h('div', { style: 'display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;' },
            h('strong', { class: 'eq', style: `color: ${p.color};` }, `Tramo ${idx + 1}: ${p.label}`),
            h('span', {
              class: 'small',
              style: `display: inline-flex; align-items: center; gap: 4px; font-weight: bold; color: ${isWinner ? 'var(--green)' : 'var(--pink)'};`,
            },
              isWinner ? chalkIcon('check', { width: 15, height: 15 }) : chalkIcon('cross', { width: 15, height: 15 }),
              isWinner ? 'VERDADERO' : 'FALSO'
            )
          ),
          h('p', { class: 'small eq', style: 'margin: 2px 0;' },
            `Condición (${p.condition}): ¿${p.condDesc(state.x)}?`
          ),
          h('p', { class: 'small muted', style: 'margin: 4px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
            isWinner
              ? [
                  `¡Habilitado! Evaluamos aquí: f(${fmt(state.x)}) = ${fmt(p.fn(state.x))}`,
                  isAtBoundary ? dotBadge(true) : null,
                ]
              : [
                  'Rechazado por la aduana (no se evalúa esta fórmula)',
                  isAtBoundary ? dotBadge(false) : null,
                ]
          )
        );
      })
    );

    const activePiece = preset.pieces[evalRes.pieceIndex];
    const isBoundary = preset.boundaries.includes(state.x);

    mount(
      readoutCard,
      h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.08rem;' },
        `Inspección de Aduana para x = ${fmt(state.x)}: entra únicamente en el `,
        h('strong', { style: `color: ${activePiece.color};` },
          `Tramo ${evalRes.pieceIndex + 1} (${activePiece.condition})`
        ),
        ' ⟹ evaluamos ',
        h('code', null, activePiece.label),
        ' y obtenemos ',
        h('strong', { style: 'color: var(--yellow); font-size: 1.2rem;' }, `f(${fmt(state.x)}) = ${fmt(evalRes.value)}`)
      ),
      isBoundary
        ? h('p', { class: 'small', style: 'margin: 0; color: var(--teal); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
            `¡Atención en la frontera x = ${fmt(state.x)}! El tramo con el signo igual (≤ o ≥) tiene el punto cerrado`,
            dotBadge(true),
            'y es el único dueño del valor; el otro tramo tiene círculo abierto',
            dotBadge(false),
            'y no se toca.'
          )
        : h('p', { class: 'small muted', style: 'margin: 0;' },
            'Arrastrá el punto directamente en el gráfico o tocá los botones de frontera exacta para ver quién gobierna en el borde.'
          )
    );
  }

  mount(
    container,
    presetBtnsRow,
    quickJumpRow,
    plotCard,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    braceSlot,
    customsGrid,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    readoutCard
  );

  syncUI();
}
