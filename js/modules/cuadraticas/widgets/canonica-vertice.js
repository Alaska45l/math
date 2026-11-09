/**
 * Widget 4 · canonica-vertice.js
 * Plano cartesiano interactivo para la forma canónica f(x) = a(x − xᵥ)² + yᵥ
 * con dos nodos arrastrables (Vértice V y Punto de Paso P), escalones 1a, 4a y despeje por raíz.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { fromCanonical, fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initCanonicaVertice(host) {
  if (!host) return null;
  clear(host);

  const state = {
    a: 1,
    xv: 2,
    yv: -4,
  };

  const predictBox = createPredictBox({
    prompt:
      'Si en f(x) = (x − 2)² − 4 cambiamos el paréntesis a (x + 2)² − 4, ¿hacia dónde se traslada el vértice de la parábola?',
    options: [
      {
        label: 'Se mueve hacia la derecha hasta xᵥ = +2',
        correct: false,
        explanation:
          'Recordá que adentro del paréntesis leemos el valor de x que lo hace cero: x + 2 = 0 ocurre en x = −2.',
      },
      {
        label: 'Se mueve hacia la izquierda hasta xᵥ = −2',
        correct: true,
        explanation:
          '¡Exacto! El cuadrado (x + 2)² se anula cuando x = −2, trasladando el eje de simetría a x = −2.',
      },
      {
        label: 'Sube 2 unidades sobre el eje Y',
        correct: false,
        explanation:
          'Los cambios dentro del paréntesis con x producen traslaciones horizontales; la altura yᵥ = −4 queda intacta.',
      },
    ],
    onVerify: () => {
      state.a = 1;
      state.xv = -2;
      state.yv = -4;
      sliderA.setValue(1);
      sliderXv.setValue(-2);
      sliderYv.setValue(-4);
      for (const b of presetsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      render();
    },
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'f(x) = (x − 2)² − 4', a: 1, xv: 2, yv: -4 },
    { label: 'f(x) = 3(x + 2)² + 1', a: 3, xv: -2, yv: 1 },
    { label: 'f(x) = −2(x − 1)² + 8', a: -2, xv: 1, yv: 8 },
    { label: 'f(x) = −5(x + 1)² − 6', a: -5, xv: -1, yv: -6 },
    { label: 'f(x) = 1/2 (x − 3)² − 2', a: 0.5, xv: 3, yv: -2 },
  ];

  const board = createQuadBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Plano cartesiano de la forma canónica con vértice arrastrable',
  });

  const sliderA = createSliderField({
    label: 'Coeficiente a (concavidad y escala)',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.a,
    onInput: (v) => {
      state.a = Math.abs(v) < 0.25 ? (v >= 0 ? 0.5 : -0.5) : v;
      sliderA.setValue(state.a);
      render();
    },
  });
  const sliderXv = createSliderField({
    label: 'Abscisa del vértice xᵥ',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.xv,
    onInput: (v) => {
      state.xv = v;
      render();
    },
  });
  const sliderYv = createSliderField({
    label: 'Altura del vértice yᵥ',
    min: -8,
    max: 8,
    step: 0.5,
    value: state.yv,
    onInput: (v) => {
      state.yv = v;
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderA.root,
    sliderXv.root,
    sliderYv.root,
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
      state.xv = p.xv;
      state.yv = p.yv;
      sliderA.setValue(p.a);
      sliderXv.setValue(p.xv);
      sliderYv.setValue(p.yv);
      render();
    });
    presetsRow.appendChild(btn);
  });

  let currentMapper = createCartesianMapper(board.plotBox, {
    xMin: -8,
    xMax: 8,
    yMin: -10,
    yMax: 10,
  });

  const vertexHandle = s('circle', {
    r: 7,
    fill: 'var(--yellow)',
    stroke: '#111',
    'stroke-width': 2,
  });

  const stepHandle = s('circle', {
    r: 6,
    fill: 'var(--pink)',
    stroke: '#111',
    'stroke-width': 2,
  });

  attachSvgDrag(
    board.svg,
    vertexHandle,
    () => currentMapper,
    ({ x, y }) => {
      state.xv = Math.max(-5, Math.min(5, Math.round(x * 2) / 2));
      state.yv = Math.max(-8, Math.min(8, Math.round(y * 2) / 2));
      sliderXv.setValue(state.xv);
      sliderYv.setValue(state.yv);
      render();
    }
  );

  attachSvgDrag(
    board.svg,
    stepHandle,
    () => currentMapper,
    ({ y }) => {
      const rawA = Math.round((y - state.yv) * 2) / 2;
      if (Math.abs(rawA) >= 0.5) {
        state.a = Math.max(-5, Math.min(5, rawA));
        sliderA.setValue(state.a);
        render();
      }
    }
  );

  function render() {
    const model = fromCanonical(state);
    // Escalado dinámico suave para que vértice, ordenada y escalones entren cómodos
    const spanY = Math.max(10, Math.abs(state.yv) + Math.abs(state.a) * 4 + 2);
    const yLim = Math.min(18, Math.ceil(spanY / 2) * 2);
    currentMapper = createCartesianMapper(board.plotBox, {
      xMin: -8,
      xMax: 8,
      yMin: -yLim,
      yMax: yLim,
    });

    drawCartesianAxes(board.gridLayer, currentMapper, {
      xStep: 2,
      yStep: yLim > 12 ? 4 : 2,
    });

    clear(board.clippedLayer);
    clear(board.overlayLayer);

    // Parábola matriz y = x^2 en --muted punteado
    board.clippedLayer.appendChild(
      s('path', {
        d: sampleCurvePath((x) => x * x, currentMapper, 120),
        fill: 'none',
        stroke: 'rgba(167, 184, 174, 0.35)',
        'stroke-width': 1.8,
        'stroke-dasharray': '4 4',
      })
    );

    // Eje de simetría x = xv
    const pxV = currentMapper.toX(state.xv);
    const pyV = currentMapper.toY(state.yv);
    board.clippedLayer.appendChild(
      s('line', {
        x1: pxV,
        y1: board.plotBox.y,
        x2: pxV,
        y2: board.plotBox.y + board.plotBox.h,
        stroke: 'var(--yellow)',
        'stroke-width': 1.4,
        'stroke-dasharray': '5 4',
      })
    );

    // Escalón 1a (x = xv + 1, y = yv + a)
    const pxStep1 = currentMapper.toX(state.xv + 1);
    const pyStep1 = currentMapper.toY(state.yv + state.a);
    board.clippedLayer.appendChild(
      s('polyline', {
        points: `${pxV},${pyV} ${pxStep1},${pyV} ${pxStep1},${pyStep1}`,
        fill: 'none',
        stroke: 'var(--pink)',
        'stroke-width': 1.8,
      })
    );

    // Escalón 4a (x = xv + 2, y = yv + 4a)
    const pxStep2 = currentMapper.toX(state.xv + 2);
    const pyStep2 = currentMapper.toY(state.yv + 4 * state.a);
    board.clippedLayer.appendChild(
      s('polyline', {
        points: `${pxV},${pyV} ${pxStep2},${pyV} ${pxStep2},${pyStep2}`,
        fill: 'none',
        stroke: 'rgba(242, 132, 130, 0.45)',
        'stroke-width': 1.3,
        'stroke-dasharray': '3 3',
      })
    );

    // Curva principal f(x) = a(x - xv)^2 + yv
    board.clippedLayer.appendChild(
      s('path', {
        d: sampleCurvePath(
          (x) => state.a * (x - state.xv) * (x - state.xv) + state.yv,
          currentMapper,
          150
        ),
        fill: 'none',
        stroke: 'var(--blue)',
        'stroke-width': 2.8,
      })
    );

    // Raíces reales en el eje X
    for (const r of model.roots) {
      board.clippedLayer.appendChild(
        s('circle', {
          cx: currentMapper.toX(r),
          cy: currentMapper.toY(0),
          r: 4.8,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.5,
        })
      );
    }

    // Ordenada al origen (0; c)
    board.clippedLayer.appendChild(
      s('circle', {
        cx: currentMapper.toX(0),
        cy: currentMapper.toY(model.c),
        r: 4.2,
        fill: 'var(--blue)',
        stroke: '#111',
        'stroke-width': 1.3,
      })
    );

    // Posicionar manijas arrastrables (dentro de plotBox)
    const clampX = (px) =>
      Math.max(board.plotBox.x + 8, Math.min(board.plotBox.x + board.plotBox.w - 8, px));
    const clampY = (py) =>
      Math.max(board.plotBox.y + 8, Math.min(board.plotBox.y + board.plotBox.h - 8, py));

    vertexHandle.setAttribute('cx', String(clampX(pxV)));
    vertexHandle.setAttribute('cy', String(clampY(pyV)));
    stepHandle.setAttribute('cx', String(clampX(pxStep1)));
    stepHandle.setAttribute('cy', String(clampY(pyStep1)));

    board.overlayLayer.append(vertexHandle, stepHandle);

    const lblY = clampY(pyV) > board.plotBox.y + board.plotBox.h - 24 ? clampY(pyV) - 12 : clampY(pyV) + 18;
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: clampX(pxV),
          y: lblY,
          fill: 'var(--yellow)',
          'font-size': 11.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `V(${fmtNumClean(state.xv)}; ${fmtNumClean(state.yv)})`
      )
    );

    const kSolve = -state.yv / state.a;
    const solveStr =
      kSolve < -1e-9
        ? `(x − (${fmtNumClean(state.xv)}))² = ${fmtNumClean(kSolve)} < 0 → Sin raíces reales (C₀ = ∅)`
        : Math.abs(kSolve) <= 1e-9
        ? `(x − (${fmtNumClean(state.xv)}))² = 0 → Raíz doble x = ${fmtNumClean(state.xv)}`
        : `(x − (${fmtNumClean(state.xv)}))² = ${fmtNumClean(kSolve)} ⇒ |x − (${fmtNumClean(
            state.xv
          )})| = √${fmtNumClean(kSolve)} ⇒ x₁ = ${model.radicalDecomposition.formattedMinus}, x₂ = ${
            model.radicalDecomposition.formattedPlus
          }`;

    readoutLine1.textContent = `Canónica: f(x) = ${model.forms.canonical} · Vértice V(${fmtNumClean(
      state.xv
    )}; ${fmtNumClean(state.yv)}) · Ordenada f(0) = ${fmtNumClean(model.c)}`;
    readoutLine2.textContent = `Despeje por raíz: ${solveStr}`;
  }

  render();
  host.append(predictBox, presetsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initCanonicaVertice;
export default initCanonicaVertice;
