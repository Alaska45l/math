/**
 * @file js/modules/sistemas/widgets/laboratorio-intersecciones.js
 * Widget 1 · Sec. 1 (sec-metodos-interseccion):
 * Sincroniza Sustitución, Igualación y Reducción paso a paso con la intersección (x₀; y₀)
 * de r₁ y r₂ en el plano cartesiano, incluyendo limpieza de fracciones y paréntesis (Ej. 11b, 21f, 14).
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  solveSystem2x2,
} from '../logic.js';
import {
  createSysBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  attachSvgDrag,
  createSliderField,
  createPredictBox,
  clipLineToBox,
  clampPx,
} from './board-kit.js';

export function initLaboratorioIntersecciones(host) {
  if (!host) return null;

  const PRESETS = [
    {
      id: 'ej11b',
      label: 'Ej. 11b: fracciones → {(6; 1)}',
      eq1: '(6x - 3)/3 + 3y = 14',
      eq2: 'x - 3(2y - 1) = 3y',
      sys: { a1: 2, b1: 3, c1: 15, a2: 1, b2: -9, c2: -3 },
      bounds: { xMin: -2, xMax: 10, yMin: -3, yMax: 7 },
    },
    {
      id: 'ej21f',
      label: 'Ej. 21f: fracciones → {(2; −1)}',
      eq1: '(3x + 9)/6 - 2y = 9/2',
      eq2: '(4x - 2)/3 + y = 1',
      sys: { a1: 0.5, b1: -2, c1: 3, a2: 4 / 3, b2: 1, c2: 5 / 3 },
      bounds: { xMin: -4, xMax: 6, yMin: -4, yMax: 5 },
    },
    {
      id: 'ej14',
      label: 'Ej. 14: {(14/5; −8/5)}',
      eq1: 'y = -2x + 4',
      eq2: 'y = 1/2 x - 3',
      sys: { a1: 2, b1: 1, c1: 4, a2: 1, b2: -2, c2: 6 },
      bounds: { xMin: -4, xMax: 7, yMin: -5, yMax: 6 },
    },
    {
      id: 'custom',
      label: 'Personalizado (arrastrar o deslizar)',
      eq1: '2x + y = 5',
      eq2: 'x - y = 1',
      sys: { a1: 2, b1: 1, c1: 5, a2: 1, b2: -1, c2: 1 },
      bounds: { xMin: -5, xMax: 7, yMin: -5, yMax: 7 },
    },
  ];

  const state = {
    presetId: 'ej11b',
    method: 'substitution', // 'substitution' | 'equalization' | 'reduction'
    stepIdx: 0,
    customC1: 5,
    customC2: 1,
    customM1: -2,
    customM2: 1,
  };

  const predictBox = createPredictBox({
    prompt:
      'Cuando sustituís y = mx + b de la recta r₁ dentro de r₂, ¿qué representa geométricamente el número x₀ que despejás?',
    options: [
      {
        label: 'La ordenada al origen donde r₂ corta al eje Y.',
        correct: false,
        explanation:
          'La ordenada al origen ocurre en x = 0; el número x₀ despejado al igualar o sustituir es el x donde ambas rectas comparten la misma altura y.',
      },
      {
        label: 'La abscisa exacta donde las dos rectas comparten la misma altura y₀ (la coordenada x del cruce).',
        correct: true,
        explanation:
          '¡Exacto! Sustituir y de r₁ en r₂ fuerza a que ambas ecuaciones valgan simultáneamente para el mismo (x₀; y₀): por eso el x despejado es la abscisa de la intersección.',
      },
      {
        label: 'La pendiente promedio de las dos rectas.',
        correct: false,
        explanation:
          'x₀ es una coordenada del punto de encuentro, no una pendiente.',
      },
    ],
    onVerify: () => {
      state.stepIdx = 3;
      update();
    },
  });

  const presetsRow = h('div', { class: 'pr-presets' });
  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.presetId = pr.id;
      state.stepIdx = 0;
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const methodRow = h('div', { class: 'pr-chip-row' });
  const METHODS = [
    ['substitution', 'Método: Sustitución'],
    ['equalization', 'Método: Igualación'],
    ['reduction', 'Método: Reducción (suma/resta)'],
  ];
  const methodBtns = METHODS.map(([id, label]) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, label);
    btn.addEventListener('click', () => {
      playClick();
      state.method = id;
      predictBox.notifyInteraction();
      update();
    });
    methodRow.appendChild(btn);
    return { id, btn };
  });

  const stepRow = h('div', { class: 'pr-chip-row' });
  const btnPrev = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary' }, 'Paso anterior');
  const stepBadge = h('span', { class: 'sys-step-badge' }, 'Paso 1 / 4');
  const btnNext = h('button', { type: 'button', class: 'pr-btn' }, 'Siguiente paso');
  stepRow.append(btnPrev, stepBadge, btnNext);

  const sliderC1 = createSliderField({
    label: 'Desplazar r₁ (c₁)',
    min: -4,
    max: 8,
    step: 1,
    value: state.customC1,
    formatValue: (v) => fmtNumberEsAR(v, 0),
    onInput: (val) => {
      state.customC1 = val;
      state.presetId = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });
  const sliderC2 = createSliderField({
    label: 'Desplazar r₂ (c₂)',
    min: -4,
    max: 6,
    step: 1,
    value: state.customC2,
    formatValue: (v) => fmtNumberEsAR(v, 0),
    onInput: (val) => {
      state.customC2 = val;
      state.presetId = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });
  const slidersWrap = h('div', { class: 'sys-sliders-grid', hidden: '' }, [sliderC1.root, sliderC2.root]);

  const board = createSysBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Laboratorio de intersección de rectas y métodos algebraicos 2×2',
  });

  const line1El = s('line', { stroke: 'var(--blue)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });
  const line2El = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });
  const projX = s('line', { stroke: 'var(--green)', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
  const projY = s('line', { stroke: 'var(--green)', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
  board.clippedLayer.append(projX, projY, line1El, line2El);

  const interDot = s('circle', { r: 7, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const interLabel = s('text', { fill: 'var(--green)', 'font-size': 12, 'font-weight': 'bold' });
  const dragHandle = s('circle', { r: 8, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, visibility: 'hidden' });
  const eqLegend1 = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 18, fill: 'var(--blue)', 'font-size': 11.5, 'font-weight': 'bold' });
  const eqLegend2 = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 34, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(interDot, interLabel, dragHandle, eqLegend1, eqLegend2);

  const readout = h('div', { class: 'pr-readout sys-readout', 'aria-live': 'polite' });
  let mapper = createCartesianMapper(board.plotBox, PRESETS[0].bounds);

  function getActiveSys() {
    if (state.presetId === 'custom') {
      return {
        id: 'custom',
        eq1: `2x + y = ${state.customC1}`,
        eq2: `x − y = ${state.customC2}`,
        sys: { a1: 2, b1: 1, c1: state.customC1, a2: 1, b2: -1, c2: state.customC2 },
        bounds: { xMin: -5, xMax: 7, yMin: -5, yMax: 7 },
      };
    }
    return PRESETS.find((p) => p.id === state.presetId) || PRESETS[0];
  }

  function update() {
    const active = getActiveSys();
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === active.id));
    methodBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.method));
    slidersWrap.hidden = active.id !== 'custom';
    dragHandle.setAttribute('visibility', active.id === 'custom' ? 'visible' : 'hidden');

    mapper = createCartesianMapper(board.plotBox, active.bounds);
    drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

    const solved = solveSystem2x2(active.sys);
    const { a1, b1, c1, a2, b2, c2 } = active.sys;

    const clip1 = clipLineToBox(a1, b1, -c1, mapper);
    const clip2 = clipLineToBox(a2, b2, -c2, mapper);
    if (clip1) {
      line1El.setAttribute('x1', mapper.toX(clip1.x1).toFixed(2));
      line1El.setAttribute('y1', mapper.toY(clip1.y1).toFixed(2));
      line1El.setAttribute('x2', mapper.toX(clip1.x2).toFixed(2));
      line1El.setAttribute('y2', mapper.toY(clip1.y2).toFixed(2));
    }
    if (clip2) {
      line2El.setAttribute('x1', mapper.toX(clip2.x1).toFixed(2));
      line2El.setAttribute('y1', mapper.toY(clip2.y1).toFixed(2));
      line2El.setAttribute('x2', mapper.toX(clip2.x2).toFixed(2));
      line2El.setAttribute('y2', mapper.toY(clip2.y2).toFixed(2));
    }

    eqLegend1.textContent = `r₁: ${active.eq1}`;
    eqLegend2.textContent = `r₂: ${active.eq2}`;

    const stepsArr = solved.steps[state.method] || solved.steps.substitution;
    const clampedIdx = Math.max(0, Math.min(stepsArr.length - 1, state.stepIdx));
    state.stepIdx = clampedIdx;
    stepBadge.textContent = `Paso ${clampedIdx + 1} / ${stepsArr.length}`;
    btnPrev.disabled = clampedIdx === 0;
    btnNext.disabled = clampedIdx >= stepsArr.length - 1;

    if (solved.solution) {
      const ix = ratToNumber(solved.solution.x);
      const iy = ratToNumber(solved.solution.y);
      const px = clampPx(mapper.toX(ix), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
      const py = clampPx(mapper.toY(iy), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
      const xAxisY = mapper.toY(0);
      const yAxisX = mapper.toX(0);

      const revealCross = clampedIdx >= 1;
      interDot.setAttribute('cx', px.toFixed(1));
      interDot.setAttribute('cy', py.toFixed(1));
      interDot.setAttribute('visibility', revealCross ? 'visible' : 'hidden');
      interLabel.setAttribute('x', clampPx(px + 10, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 115).toFixed(1));
      interLabel.setAttribute('y', clampPx(py - 10, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      interLabel.textContent = `S = {(${fmtRat(solved.solution.x)}; ${fmtRat(solved.solution.y)})}`;
      interLabel.setAttribute('visibility', clampedIdx >= stepsArr.length - 1 ? 'visible' : 'hidden');

      projX.setAttribute('x1', px.toFixed(1));
      projX.setAttribute('y1', py.toFixed(1));
      projX.setAttribute('x2', px.toFixed(1));
      projX.setAttribute('y2', clampPx(xAxisY, board.plotBox.y, board.plotBox.y + board.plotBox.h).toFixed(1));
      projX.setAttribute('visibility', revealCross ? 'visible' : 'hidden');

      projY.setAttribute('x1', px.toFixed(1));
      projY.setAttribute('y1', py.toFixed(1));
      projY.setAttribute('x2', clampPx(yAxisX, board.plotBox.x, board.plotBox.x + board.plotBox.w).toFixed(1));
      projY.setAttribute('y2', py.toFixed(1));
      projY.setAttribute('visibility', clampedIdx >= stepsArr.length - 1 ? 'visible' : 'hidden');
    }

    if (active.id === 'custom') {
      const hy = state.customC1; // ordenada de 2x + y = c1 en x = 0
      dragHandle.setAttribute('cx', mapper.toX(0).toFixed(1));
      dragHandle.setAttribute('cy', clampPx(mapper.toY(hy), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8).toFixed(1));
      dragHandle.setAttribute('aria-valuenow', String(state.customC1));
    }

    readout.replaceChildren(
      h('div', {}, [
        h('strong', { style: 'color: var(--yellow)' }, `Paso ${clampedIdx + 1}: `),
        h('span', {}, stepsArr[clampedIdx]),
      ]),
      h(
        'div',
        { class: 'muted small' },
        `Solución exacta: S = ${solved.solutionText} · Podés cambiar de método sin alterar el cruce.`
      )
    );
  }

  attachSvgDrag(
    board.svg,
    dragHandle,
    () => mapper,
    ({ y }) => {
      state.customC1 = Math.max(-4, Math.min(8, Math.round(y)));
      sliderC1.setValue(state.customC1);
      state.presetId = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover ordenada al origen de r₁', stepX: 0, stepY: 1 }
  );

  btnPrev.addEventListener('click', () => {
    playClick();
    state.stepIdx = Math.max(0, state.stepIdx - 1);
    update();
  });
  btnNext.addEventListener('click', () => {
    playClick();
    state.stepIdx += 1;
    predictBox.notifyInteraction();
    update();
  });

  host.replaceChildren(predictBox, presetsRow, methodRow, stepRow, slidersWrap, board.svg, readout);
  update();
  return { board, update };
}
