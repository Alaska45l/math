/**
 * Widget 5 · factorizada-simetria.js
 * Lienzo cartesiano con raíces x₁ y x₂ arrastrables sobre el eje X,
 * visualización en vivo del espejo de simetría xᵥ = (x₁ + x₂) / 2 y reconstrucción de "a".
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { fromFactored, fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initFactorizadaSimetria(host) {
  if (!host) return null;
  clear(host);

  const state = {
    a: -1,
    x1: -2,
    x2: 6,
  };

  const predictBox = createPredictBox({
    prompt:
      'Si una parábola corta al eje X en x₁ = −2 y en x₂ = 6, ¿en qué coordenada horizontal xᵥ cae exactamente su eje de simetría?',
    options: [
      {
        label: 'En xᵥ = 4 (porque 6 − 2 = 4)',
        correct: false,
        explanation:
          'El punto medio se calcula sumando ambas raíces y dividiendo por 2: (−2 + 6) / 2 = 2.',
      },
      {
        label: 'En xᵥ = 2 (a 4 unidades de distancia de cada raíz)',
        correct: true,
        explanation:
          '¡Exacto! El promedio (−2 + 6)/2 = 2 queda a 4 pasos de −2 y a 4 pasos de 6.',
      },
      {
        label: 'Depende de cuánto valga el coeficiente principal a',
        correct: false,
        explanation:
          'Cambiar el coeficiente "a" estira la altura yᵥ del vértice, pero el eje de simetría xᵥ sigue clavado en el punto medio de las raíces.',
      },
    ],
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'Raíces −2 y 6 (a = −1)', a: -1, x1: -2, x2: 6 },
    { label: 'f(x) = −2(x + 1)(x − 3)', a: -2, x1: -1, x2: 3 },
    { label: 'Incompleta x(x − 4) (raíz en 0)', a: 1, x1: 0, x2: 4 },
    { label: 'Simétrica (x + 3)(x − 3)', a: 1, x1: -3, x2: 3 },
    { label: 'Raíz doble (x − 2)²', a: 1, x1: 2, x2: 2 },
  ];

  const board = createQuadBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Plano cartesiano de la forma factorizada con raíces arrastrables y eje de simetría',
  });

  const sliderX1 = createSliderField({
    label: 'Raíz x₁ (en eje X)',
    min: -6,
    max: 6,
    step: 1,
    value: state.x1,
    onInput: (v) => {
      state.x1 = v;
      render();
    },
  });

  const sliderX2 = createSliderField({
    label: 'Raíz x₂ (en eje X)',
    min: -6,
    max: 6,
    step: 1,
    value: state.x2,
    onInput: (v) => {
      state.x2 = v;
      render();
    },
  });

  const sliderA = createSliderField({
    label: 'Coeficiente principal a',
    min: -3,
    max: 3,
    step: 0.5,
    value: state.a,
    onInput: (v) => {
      state.a = Math.abs(v) < 0.25 ? (v >= 0 ? 0.5 : -0.5) : v;
      sliderA.setValue(state.a);
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderX1.root,
    sliderX2.root,
    sliderA.root,
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
      state.x1 = p.x1;
      state.x2 = p.x2;
      sliderA.setValue(p.a);
      sliderX1.setValue(p.x1);
      sliderX2.setValue(p.x2);
      render();
    });
    presetsRow.appendChild(btn);
  });

  let currentMapper = createCartesianMapper(board.plotBox, {
    xMin: -8,
    xMax: 8,
    yMin: -12,
    yMax: 12,
  });

  const rootHandle1 = s('circle', {
    r: 7,
    fill: 'var(--green)',
    stroke: '#111',
    'stroke-width': 2,
  });
  const rootHandle2 = s('circle', {
    r: 7,
    fill: 'var(--green)',
    stroke: '#111',
    'stroke-width': 2,
  });

  attachSvgDrag(
    board.svg,
    rootHandle1,
    () => currentMapper,
    ({ x }) => {
      state.x1 = Math.max(-6, Math.min(6, Math.round(x)));
      sliderX1.setValue(state.x1);
      render();
    }
  );

  attachSvgDrag(
    board.svg,
    rootHandle2,
    () => currentMapper,
    ({ x }) => {
      state.x2 = Math.max(-6, Math.min(6, Math.round(x)));
      sliderX2.setValue(state.x2);
      render();
    }
  );

  function render() {
    const model = fromFactored(state);
    const { xv, yv } = model.vertex;
    const yBound = Math.max(10, Math.min(24, Math.ceil((Math.abs(yv) + 4) / 2) * 2));

    currentMapper = createCartesianMapper(board.plotBox, {
      xMin: -8,
      xMax: 8,
      yMin: -yBound,
      yMax: yBound,
    });

    drawCartesianAxes(board.gridLayer, currentMapper, {
      xStep: 2,
      yStep: yBound > 14 ? 4 : 2,
    });

    clear(board.clippedLayer);
    clear(board.overlayLayer);

    const px1 = currentMapper.toX(state.x1);
    const px2 = currentMapper.toX(state.x2);
    const pxV = currentMapper.toX(xv);
    const py0 = currentMapper.toY(0);
    const pyV = currentMapper.toY(yv);

    // Eje de simetría x = xv
    board.clippedLayer.appendChild(
      s('line', {
        x1: pxV,
        y1: board.plotBox.y,
        x2: pxV,
        y2: board.plotBox.y + board.plotBox.h,
        stroke: 'var(--yellow)',
        'stroke-width': 1.6,
        'stroke-dasharray': '5 4',
      })
    );

    // Arco de distancia simétrica entre x1, xv y x2 sobre el eje X
    board.clippedLayer.appendChild(
      s('line', {
        x1: px1,
        y1: py0,
        x2: px2,
        y2: py0,
        stroke: 'var(--yellow)',
        'stroke-width': 2.5,
      })
    );

    // Parábola
    board.clippedLayer.appendChild(
      s('path', {
        d: sampleCurvePath(
          (x) => state.a * (x - state.x1) * (x - state.x2),
          currentMapper,
          150
        ),
        fill: 'none',
        stroke: 'var(--blue)',
        'stroke-width': 2.8,
      })
    );

    // Nodo del vértice
    board.clippedLayer.appendChild(
      s('circle', {
        cx: pxV,
        cy: pyV,
        r: 5.5,
        fill: 'var(--pink)',
        stroke: '#111',
        'stroke-width': 1.6,
      })
    );

    rootHandle1.setAttribute('cx', String(px1));
    rootHandle1.setAttribute('cy', String(py0));
    rootHandle2.setAttribute('cx', String(px2));
    rootHandle2.setAttribute('cy', String(py0));

    board.overlayLayer.append(rootHandle1, rootHandle2);

    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: pxV + 8,
          y: Math.max(board.plotBox.y + 16, Math.min(board.plotBox.y + board.plotBox.h - 10, pyV)),
          fill: 'var(--yellow)',
          'font-size': 11.5,
          'font-weight': 'bold',
        },
        `V(${fmtNumClean(xv)}; ${fmtNumClean(yv)})`
      )
    );

    const dist = Math.abs(state.x2 - state.x1) / 2;
    readoutLine1.textContent = `Factorizada: f(x) = ${model.forms.factored} · Raíces x₁ = ${fmtNumClean(
      state.x1
    )}, x₂ = ${fmtNumClean(state.x2)}`;
    readoutLine2.textContent = `Promedio del espejo: xᵥ = (${fmtNumClean(state.x1)} + (${fmtNumClean(
      state.x2
    )})) / 2 = ${fmtNumClean(xv)} (a distancia ${fmtNumClean(dist)} de cada raíz) ⇒ Altura yᵥ = f(${fmtNumClean(
      xv
    )}) = ${fmtNumClean(yv)}.`;
  }

  render();
  host.append(predictBox, presetsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initFactorizadaSimetria;
export default initFactorizadaSimetria;
