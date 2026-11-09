/**
 * Widget 9 · interseccion-recta-parabola.js
 * Simulador de doble vista sincronizada:
 * 1) Parábola f(x) y recta g(x) = mx + d
 * 2) Parábola diferencia h(x) = f(x) − g(x) mostrando coincidencia vertical con las raíces de h(x) = 0.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  intersectParabolaLine,
  formatPolynomialString,
  fmtNumClean,
} from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initInterseccionRectaParabola(host) {
  if (!host) return null;
  clear(host);

  const state = {
    a: 1,
    b: 2,
    c: 3,
    m: 6, // tangente cuando m = 6 o m = -2 con d = -1
    d: -1,
  };

  let applyPreset = null;

  const predictBox = createPredictBox({
    prompt:
      'Al igualar la parábola y = x² + 2x + 3 con la recta y = kx − 1, queda la ecuación diferencia x² + (2 − k)x + 4 = 0. ¿Qué condición sobre Δ_int hace que la recta sea tangente?',
    options: [
      {
        label: 'Δ_int > 0 (para que cruce con fuerza)',
        correct: false,
        presetIdx: 2,
        explanation:
          'Si Δ_int > 0 hay dos soluciones distintas y la recta corta en dos puntos (es secante).',
      },
      {
        label: 'Δ_int = (2 − k)² − 16 = 0 (un único punto de contacto)',
        correct: true,
        presetIdx: 0,
        explanation:
          '¡Exacto! Cuando Δ_int = 0 las dos intersecciones se funden en una sola (dando k = 6 o k = −2).',
      },
      {
        label: 'Que la pendiente k sea igual a 2',
        correct: false,
        presetIdx: 3,
        explanation:
          'Si k = 2 queda x² + 4 = 0 (Δ_int = −16 < 0), por lo que la recta pasa por debajo sin tocar la parábola.',
      },
    ],
    onVerify: (opt) => {
      if (typeof applyPreset === 'function') {
        applyPreset(opt.presetIdx ?? 0);
      }
    },
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'Tangente 1 (k = 6): y = 6x − 1', a: 1, b: 2, c: 3, m: 6, d: -1 },
    { label: 'Tangente 2 (k = −2): y = −2x − 1', a: 1, b: 2, c: 3, m: -2, d: -1 },
    { label: 'Secante (2 cruces): y = 2x + 3', a: 1, b: 2, c: 3, m: 2, d: 3 },
    { label: 'Exterior (0 cruces): y = 2x − 1', a: 1, b: 2, c: 3, m: 2, d: -1 },
    { label: 'Tangente en (2; 3): x² − 2x + 3 y 2x − 1', a: 1, b: -2, c: 3, m: 2, d: -1 },
  ];

  const board = createQuadBoardSvg({
    width: 680,
    height: 340,
    ariaLabel: 'Sistema parábola-recta y función diferencia sincronizada',
  });

  // Dos clipPath independientes para aislar estrictamente leftBox y rightBox
  board.defs.appendChild(
    s('clipPath', { id: 'inter-clip-left' }, [
      s('rect', { x: 38, y: 38, width: 288, height: 268, rx: 6 }),
    ])
  );
  board.defs.appendChild(
    s('clipPath', { id: 'inter-clip-right' }, [
      s('rect', { x: 368, y: 38, width: 288, height: 268, rx: 6 }),
    ])
  );

  const sliderM = createSliderField({
    label: 'Pendiente de la recta m (o parámetro k)',
    min: -6,
    max: 8,
    step: 0.5,
    value: state.m,
    onInput: (v) => {
      state.m = v;
      render();
    },
  });

  const sliderD = createSliderField({
    label: 'Ordenada de la recta d',
    min: -6,
    max: 8,
    step: 0.5,
    value: state.d,
    onInput: (v) => {
      state.d = v;
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderM.root,
    sliderD.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  const presetButtons = [];
  applyPreset = (idx) => {
    const p = presets[idx];
    if (!p) return;
    presetButtons.forEach((b, i) => {
      b.classList.toggle('is-active', i === idx);
    });
    state.a = p.a;
    state.b = p.b;
    state.c = p.c;
    state.m = p.m;
    state.d = p.d;
    sliderM.setValue(p.m);
    sliderD.setValue(p.d);
    render();
  };

  presets.forEach((p, idx) => {
    const btn = h(
      'button',
      { type: 'button', class: `pr-chip${idx === 0 ? ' is-active' : ''}` },
      p.label
    );
    btn.addEventListener('click', () => {
      playClick();
      applyPreset(idx);
    });
    presetsRow.appendChild(btn);
    presetButtons.push(btn);
  });

  function render() {
    clear(board.gridLayer);
    clear(board.clippedLayer);
    clear(board.overlayLayer);

    const inter = intersectParabolaLine(
      { a: state.a, b: state.b, c: state.c },
      { m: state.m, d: state.d }
    );

    // Dividimos el área en dos paneles sincronizados en X:
    // Izquierda: f(x) y g(x) (x = 38..330)
    // Derecha: h(x) = f(x) - g(x) (x = 365..656)
    const leftBox = { x: 38, y: 38, w: 288, h: 268 };
    const rightBox = { x: 368, y: 38, w: 288, h: 268 };

    const leftMapper = createCartesianMapper(leftBox, {
      xMin: -5,
      xMax: 5,
      yMin: -6,
      yMax: 16,
    });
    const rightMapper = createCartesianMapper(rightBox, {
      xMin: -5,
      xMax: 5,
      yMin: -8,
      yMax: 14,
    });

    const leftGrid = s('g');
    const rightGrid = s('g');
    drawCartesianAxes(leftGrid, leftMapper, { xStep: 2, yStep: 4, xLabel: 'x', yLabel: 'y' });
    drawCartesianAxes(rightGrid, rightMapper, { xStep: 2, yStep: 4, xLabel: 'x', yLabel: 'h(x)' });
    board.gridLayer.append(leftGrid, rightGrid);

    // Separador vertical central
    board.overlayLayer.appendChild(
      s('line', {
        x1: 348,
        y1: 22,
        x2: 348,
        y2: 312,
        stroke: 'rgba(236, 242, 232, 0.22)',
        'stroke-width': 1.5,
        'stroke-dasharray': '4 4',
      })
    );

    const fnF = (x) => state.a * x * x + state.b * x + state.c;
    const fnG = (x) => state.m * x + state.d;
    const fnH = (x) => fnF(x) - fnG(x);

    // Contenedores recortados independientemente para evitar desbordes sobre encabezados y divisor
    const leftClipped = s('g', { 'clip-path': 'url(#inter-clip-left)' });
    const rightClipped = s('g', { 'clip-path': 'url(#inter-clip-right)' });
    board.clippedLayer.append(leftClipped, rightClipped);

    // Curvas en el panel izquierdo: f(x) en azul y recta g(x) en amarillo/verde/rosa
    const lineColor =
      inter.classification === 'tangent'
        ? 'var(--yellow)'
        : inter.classification === 'secant'
        ? 'var(--green)'
        : 'var(--pink)';

    leftClipped.appendChild(
      s('path', {
        d: sampleCurvePath(fnF, leftMapper, 90),
        fill: 'none',
        stroke: 'var(--blue)',
        'stroke-width': 2.6,
      })
    );
    leftClipped.appendChild(
      s('path', {
        d: sampleCurvePath(fnG, leftMapper, 40),
        fill: 'none',
        stroke: lineColor,
        'stroke-width': 2.3,
      })
    );

    // Curva diferencia h(x) = f(x) - g(x) en el panel derecho
    rightClipped.appendChild(
      s('path', {
        d: sampleCurvePath(fnH, rightMapper, 90),
        fill: 'none',
        stroke: lineColor,
        'stroke-width': 2.6,
      })
    );

    // Puntos de intersección en el panel izquierdo y raíces en el panel derecho
    for (const pt of inter.points) {
      const lx = leftMapper.toX(pt.x);
      const ly = leftMapper.toY(pt.y);
      const rx = rightMapper.toX(pt.x);
      const ry0 = rightMapper.toY(0);

      leftClipped.appendChild(
        s('circle', {
          cx: lx,
          cy: ly,
          r: 5.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );
      rightClipped.appendChild(
        s('circle', {
          cx: rx,
          cy: ry0,
          r: 5.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );
    }

    // Títulos de cada vista
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: leftBox.x + 4,
          y: 26,
          fill: 'var(--yellow)',
          'font-size': 11.5,
          'font-weight': 'bold',
        },
        'Vista 1: Parábola f(x) y Recta g(x)'
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: rightBox.x + 4,
          y: 26,
          fill: 'var(--yellow)',
          'font-size': 11.5,
          'font-weight': 'bold',
        },
        `Vista 2: Resta h(x) = ${formatPolynomialString(inter.differenceCoeffs)}`
      )
    );

    const classLabel =
      inter.classification === 'tangent'
        ? 'RECTA TANGENTE (1 punto de contacto · Δ_int = 0)'
        : inter.classification === 'secant'
        ? 'RECTA SECANTE (2 puntos de cruce · Δ_int > 0)'
        : 'RECTA EXTERIOR (0 puntos de contacto · Δ_int < 0)';

    const ptsStr =
      inter.points.length === 0
        ? 'Vacío (∅)'
        : inter.points
            .map((p) => `(${fmtNumClean(p.x)}; ${fmtNumClean(p.y)})`)
            .join(' y ');

    readoutLine1.textContent = `Ecuación diferencia: ${inter.differenceEquation} · Δ_int = ${fmtNumClean(
      inter.discriminant
    )} → ${classLabel}`;
    readoutLine2.textContent = `Puntos de encuentro (x; y): ${ptsStr} · Pendientes tangentes desde d = ${fmtNumClean(
      state.d
    )}: ${
      inter.tangencyCondition.tangentSlopesFromD.length
        ? inter.tangencyCondition.tangentSlopesFromD.map(fmtNumClean).join(' y ')
        : 'ninguna'
    }`;
  }

  render();
  host.append(predictBox, presetsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initInterseccionRectaParabola;
export default initInterseccionRectaParabola;
