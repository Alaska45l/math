/**
 * Widget 7 · discriminante-vieta.js
 * Laboratorio del Discriminante Δ = b² − 4ac, distancia simétrica ±√Δ/(2a) y Cardano-Vieta.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { fromPolynomial, fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initDiscriminanteVieta(host) {
  if (!host) return null;
  clear(host);

  const state = {
    a: 1,
    b: -6,
    c: 2,
  };

  const predictBox = createPredictBox({
    prompt:
      'En f(x) = x² − 6x + c (donde b² = 36), ¿para qué valor exacto de c el discriminante Δ = 36 − 4c se hace cero y las dos raíces se funden en una única raíz doble?',
    options: [
      {
        label: 'Para c = 6 (porque 6 · 6 = 36)',
        correct: false,
        explanation:
          'En Δ = 36 − 4c el coeficiente c está multiplicado por 4, no por 6.',
      },
      {
        label: 'Para c = 9 (porque 36 − 4·9 = 0)',
        correct: true,
        explanation:
          '¡Exacto! Cuando c = 9 queda x² − 6x + 9 = (x − 3)² = 0, con Δ = 0 y raíz doble en x = 3.',
      },
      {
        label: 'Para c = 0',
        correct: false,
        explanation:
          'Si c = 0 queda Δ = 36 > 0, con dos raíces reales distintas (x = 0 y x = 6).',
      },
    ],
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'x² − 6x + 2 (Δ = 28 > 0, irracionales 3 ± √7)', a: 1, b: -6, c: 2 },
    { label: 'x² − 6x + 9 (Δ = 0, raíz doble x = 3)', a: 1, b: -6, c: 9 },
    { label: 'x² − 6x + 11 (Δ = −8 < 0, sin raíces reales)', a: 1, b: -6, c: 11 },
    { label: 'x² − 2x − 1 (Δ = 8 > 0, raíces 1 ± √2)', a: 1, b: -2, c: -1 },
    { label: '2x² − 10x + 12 (Δ = 4 > 0, raíces 2 y 3)', a: 2, b: -10, c: 12 },
  ];

  const board = createQuadBoardSvg({
    width: 680,
    height: 320,
    ariaLabel: 'Radar del discriminante y propiedades de Cardano-Vieta',
  });

  const sliderA = createSliderField({
    label: 'Coeficiente a',
    min: -3,
    max: 3,
    step: 1,
    value: state.a,
    onInput: (v) => {
      state.a = v === 0 ? 1 : v;
      sliderA.setValue(state.a);
      render();
    },
  });
  const sliderB = createSliderField({
    label: 'Coeficiente lineal b',
    min: -10,
    max: 10,
    step: 1,
    value: state.b,
    onInput: (v) => {
      state.b = v;
      render();
    },
  });
  const sliderC = createSliderField({
    label: 'Término independiente c (o parámetro k)',
    min: -6,
    max: 14,
    step: 1,
    value: state.c,
    onInput: (v) => {
      state.c = v;
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderA.root,
    sliderB.root,
    sliderC.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  presets.forEach((p, idx) => {
    const btn = h(
      'button',
      { type: 'button', class: `pr-chip${idx === 0 ? ' is-active' : ''}` },
      p.label
    );
    btn.addEventListener('click', () => {
      playClick();
      for (const b of presetsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      btn.classList.add('is-active');
      state.a = p.a;
      state.b = p.b;
      state.c = p.c;
      sliderA.setValue(p.a);
      sliderB.setValue(p.b);
      sliderC.setValue(p.c);
      render();
    });
    presetsRow.appendChild(btn);
  });

  function render() {
    const model = fromPolynomial(state);
    const { xv, yv } = model.vertex;
    const disc = model.discriminant;

    const yLim = Math.max(10, Math.min(20, Math.ceil((Math.abs(yv) + 4) / 2) * 2));
    const mapper = createCartesianMapper(board.plotBox, {
      xMin: -6,
      xMax: 8,
      yMin: -yLim,
      yMax: yLim,
    });

    drawCartesianAxes(board.gridLayer, mapper, {
      xStep: 2,
      yStep: yLim > 12 ? 4 : 2,
    });

    clear(board.clippedLayer);
    clear(board.overlayLayer);

    const pxV = mapper.toX(xv);
    const py0 = mapper.toY(0);
    const pyV = mapper.toY(yv);

    // Eje de simetría x = xv
    board.clippedLayer.appendChild(
      s('line', {
        x1: pxV,
        y1: board.plotBox.y,
        x2: pxV,
        y2: board.plotBox.y + board.plotBox.h,
        stroke: 'var(--yellow)',
        'stroke-width': 1.5,
        'stroke-dasharray': '5 4',
      })
    );

    // Parábola
    board.clippedLayer.appendChild(
      s('path', {
        d: sampleCurvePath(
          (x) => state.a * x * x + state.b * x + state.c,
          mapper,
          150
        ),
        fill: 'none',
        stroke: disc > 0 ? 'var(--blue)' : disc === 0 ? 'var(--yellow)' : 'var(--pink)',
        'stroke-width': 2.8,
      })
    );

    // Brazos ±√Δ / (2a) sobre el eje X cuando Δ > 0
    if (disc > 0 && model.roots.length === 2) {
      const px1 = mapper.toX(model.roots[0]);
      const px2 = mapper.toX(model.roots[1]);
      board.clippedLayer.appendChild(
        s('line', {
          x1: px1,
          y1: py0,
          x2: px2,
          y2: py0,
          stroke: 'var(--green)',
          'stroke-width': 3,
        })
      );
      for (const px of [px1, px2]) {
        board.clippedLayer.appendChild(
          s('circle', {
            cx: px,
            cy: py0,
            r: 5.5,
            fill: 'var(--green)',
            stroke: '#111',
            'stroke-width': 1.6,
          })
        );
      }
    } else if (disc === 0) {
      board.clippedLayer.appendChild(
        s('circle', {
          cx: pxV,
          cy: py0,
          r: 6.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );
    }

    // Vértice
    board.clippedLayer.appendChild(
      s('circle', {
        cx: pxV,
        cy: pyV,
        r: 5,
        fill: 'var(--pink)',
        stroke: '#111',
        'stroke-width': 1.5,
      })
    );

    // Tarjeta flotante del Radar Δ arriba a la izquierda del lienzo
    const badgeColor =
      disc > 0 ? 'var(--green)' : disc === 0 ? 'var(--yellow)' : 'var(--pink)';
    const verdict =
      disc > 0
        ? `Δ = ${fmtNumClean(disc)} > 0 → 2 raíces reales distintas`
        : disc === 0
        ? 'Δ = 0 → 1 raíz real doble (tangente al eje X)'
        : `Δ = ${fmtNumClean(disc)} < 0 → 0 raíces reales (C₀ = ∅)`;

    board.overlayLayer.appendChild(
      s('rect', {
        x: board.plotBox.x + 10,
        y: board.plotBox.y + 8,
        width: 315,
        height: 54,
        rx: 6,
        fill: 'rgba(16, 24, 20, 0.88)',
        stroke: badgeColor,
        'stroke-width': 1.5,
      })
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: board.plotBox.x + 20,
          y: board.plotBox.y + 28,
          fill: badgeColor,
          'font-size': 12,
          'font-weight': 'bold',
        },
        verdict
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: board.plotBox.x + 20,
          y: board.plotBox.y + 48,
          fill: 'var(--ink)',
          'font-size': 11.5,
        },
        `Cardano-Vieta: x₁ + x₂ = −b/a = ${fmtNumClean(model.vieta.sum)}  |  x₁·x₂ = c/a = ${fmtNumClean(
          model.vieta.product
        )}`
      )
    );

    const rootsDetail =
      disc < 0
        ? 'No corta al eje X en ℝ (radicando negativo)'
        : disc === 0
        ? `Raíz doble única x₁ = x₂ = xᵥ = ${fmtNumClean(xv)}`
        : `Raíces exactas: x₁ = ${model.radicalDecomposition.formattedMinus}, x₂ = ${model.radicalDecomposition.formattedPlus}`;

    readoutLine1.textContent = `f(x) = ${model.forms.polynomial} · Δ = (${state.b})² − 4·(${state.a})·(${state.c}) = ${
      state.b * state.b
    } − (${4 * state.a * state.c}) = ${fmtNumClean(disc)}`;
    readoutLine2.textContent = `Eje xᵥ = ${fmtNumClean(xv)} · ${rootsDetail}`;
  }

  render();
  host.append(predictBox, presetsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initDiscriminanteVieta;
export default initDiscriminanteVieta;
