/**
 * @file js/modules/sistemas/widgets/clasificador-scd-sci-si.js
 * Widget 2 · Sec. 2 (sec-clasificacion-scd-sci-si):
 * Clasificador vivo SCD / SCI / SI comparando pendientes/ordenadas, reducción algebraica (0 = 0 vs 0 = k)
 * y un indicador didáctico Δ = ab' − a'b (etiquetado explícitamente como ampliación).
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  MINUS,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  classifySystem2x2,
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

export function initClasificadorScdSciSi(host) {
  if (!host) return null;

  const state = {
    m1: -2,
    b1: 3,
    m2: -2,
    b2: 3,
    activePreset: 'sci_int1',
  };

  const predictBox = createPredictBox({
    prompt:
      'Si las dos rectas tienen la misma pendiente m₁ = m₂ pero distinta ordenada al origen (b₁ ≠ b₂), ¿qué resultado aparece al restar o sustituir las ecuaciones?',
    options: [
      {
        label: 'Aparece 0 = 0 (Sistema Compatible Indeterminado, infinitas soluciones).',
        correct: false,
        explanation:
          '0 = 0 ocurre únicamente cuando también coinciden las ordenadas al origen (b₁ = b₂). Si b₁ ≠ b₂, las rectas están separadas.',
      },
      {
        label: 'Se cancelan las variables quedando un absurdo 0 = constante ≠ 0 (Sistema Incompatible, S = ∅).',
        correct: true,
        explanation:
          '¡Correcto! Misma pendiente y distinta ordenada son rectas paralelas separadas: nunca se tocan y el álgebra lo avisa con una contradicción 0 = k ≠ 0.',
      },
      {
        label: 'Queda x = 0 como única solución (SCD).',
        correct: false,
        explanation:
          'Cuando m₁ = m₂ los términos con x también se cancelan entre sí, no queda 1·x = 0 sino 0·x = constante.',
      },
    ],
    onVerify: () => {
      state.m1 = -2;
      state.b1 = 3;
      state.m2 = -2;
      state.b2 = -1;
      state.activePreset = 'si_ej11a';
      syncSliders();
      update();
    },
  });

  const presetsRow = h('div', { class: 'pr-presets' });
  const PRESETS = [
    { id: 'scd_sec', label: 'SCD · Secantes (2x+y=3, x−y=0)', m1: -2, b1: 3, m2: 1, b2: 0 },
    { id: 'sci_int1', label: 'SCI · Int. 1 Ej. 1c (2x+y=3, 4x−6=−2y)', m1: -2, b1: 3, m2: -2, b2: 3 },
    { id: 'si_ej11a', label: 'SI · Paralelas separadas (Ej. 11a)', m1: 1.5, b1: -1.5, m2: 1.5, b2: 0.5 },
  ];

  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.m1 = pr.m1;
      state.b1 = pr.b1;
      state.m2 = pr.m2;
      state.b2 = pr.b2;
      state.activePreset = pr.id;
      syncSliders();
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const sliderM2 = createSliderField({
    label: 'Pendiente de r₂ (m₂)',
    min: -3,
    max: 3,
    step: 0.5,
    value: state.m2,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.m2 = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderB2 = createSliderField({
    label: 'Ordenada de r₂ (b₂)',
    min: -4,
    max: 5,
    step: 0.5,
    value: state.b2,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.b2 = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  function syncSliders() {
    sliderM2.setValue(state.m2);
    sliderB2.setValue(state.b2);
  }

  const slidersGrid = h('div', { class: 'sys-sliders-grid' }, [sliderM2.root, sliderB2.root]);

  const board = createSysBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Clasificador geométrico SCD, SCI y SI',
  });
  const mapper = createCartesianMapper(board.plotBox, {
    xMin: -5,
    xMax: 5,
    yMin: -4,
    yMax: 6,
  });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

  const line1El = s('line', { stroke: 'var(--blue)', 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const line2Glow = s('line', { stroke: 'var(--green)', 'stroke-width': 7, 'stroke-opacity': 0.25, visibility: 'hidden' });
  const line2El = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.5, 'stroke-dasharray': '7 4', 'stroke-linecap': 'round' });
  const gapArrow = s('line', { stroke: 'var(--pink)', 'stroke-width': 2, 'stroke-dasharray': '3 3', visibility: 'hidden' });
  board.clippedLayer.append(line2Glow, line1El, line2El, gapArrow);

  const interDot = s('circle', { r: 6.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const interLabel = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });
  const handleB2 = s('circle', { r: 8, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const statusPill = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 20, 'font-size': 12.5, 'font-weight': 'bold' });
  const deltaBadge = s('text', { x: board.plotBox.x + board.plotBox.w - 12, y: board.plotBox.y + 20, 'text-anchor': 'end', fill: 'var(--purple)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(interDot, interLabel, handleB2, statusPill, deltaBadge);

  const readout = h('div', { class: 'pr-readout sys-readout', 'aria-live': 'polite' });

  function update() {
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.activePreset));

    const sys = {
      a1: -state.m1,
      b1: 1,
      c1: state.b1,
      a2: -state.m2,
      b2: 1,
      c2: state.b2,
    };
    const cls = classifySystem2x2(sys);

    const clip1 = clipLineToBox(sys.a1, sys.b1, -sys.c1, mapper);
    const clip2 = clipLineToBox(sys.a2, sys.b2, -sys.c2, mapper);
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
      line2Glow.setAttribute('x1', mapper.toX(clip2.x1).toFixed(2));
      line2Glow.setAttribute('y1', mapper.toY(clip2.y1).toFixed(2));
      line2Glow.setAttribute('x2', mapper.toX(clip2.x2).toFixed(2));
      line2Glow.setAttribute('y2', mapper.toY(clip2.y2).toFixed(2));
    }

    const hy = clampPx(mapper.toY(state.b2), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
    handleB2.setAttribute('cx', mapper.toX(0).toFixed(1));
    handleB2.setAttribute('cy', hy.toFixed(1));
    handleB2.setAttribute('aria-valuenow', String(state.b2));

    line2Glow.setAttribute('visibility', cls.status === 'SCI' ? 'visible' : 'hidden');
    gapArrow.setAttribute('visibility', cls.status === 'SI' ? 'visible' : 'hidden');
    if (cls.status === 'SI') {
      gapArrow.setAttribute('x1', mapper.toX(0).toFixed(1));
      gapArrow.setAttribute('y1', mapper.toY(state.b1).toFixed(1));
      gapArrow.setAttribute('x2', mapper.toX(0).toFixed(1));
      gapArrow.setAttribute('y2', mapper.toY(state.b2).toFixed(1));
    }

    if (cls.status === 'SCD' && cls.solution) {
      const ix = ratToNumber(cls.solution.x);
      const iy = ratToNumber(cls.solution.y);
      const inView = ix >= mapper.xMin && ix <= mapper.xMax && iy >= mapper.yMin && iy <= mapper.yMax;
      interDot.setAttribute('visibility', inView ? 'visible' : 'hidden');
      interLabel.setAttribute('visibility', inView ? 'visible' : 'hidden');
      if (inView) {
        const px = mapper.toX(ix);
        const py = mapper.toY(iy);
        interDot.setAttribute('cx', px.toFixed(1));
        interDot.setAttribute('cy', py.toFixed(1));
        interLabel.setAttribute('x', clampPx(px + 9, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 110).toFixed(1));
        interLabel.setAttribute('y', clampPx(py - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
        interLabel.textContent = `(${fmtRat(cls.solution.x)}; ${fmtRat(cls.solution.y)})`;
      }
      statusPill.setAttribute('fill', 'var(--green)');
      statusPill.textContent = 'SCD · Secantes (solución única)';
    } else if (cls.status === 'SCI') {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      statusPill.setAttribute('fill', 'var(--yellow)');
      statusPill.textContent = 'SCI · Coincidentes (0 = 0, infinitas)';
    } else {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      statusPill.setAttribute('fill', 'var(--pink)');
      statusPill.textContent = 'SI · Paralelas separadas (S = ∅)';
    }

    const deltaVal = state.m2 - state.m1;
    deltaBadge.textContent = `[Ampliación] Δ = ${fmtNumberEsAR(deltaVal, 2)}`;

    readout.replaceChildren(
      h('div', {}, [
        h('strong', {}, `${cls.geometricDescription} `),
        h('span', { class: 'muted' }, `S = ${cls.solutionText}`),
      ]),
      h(
        'div',
        { class: 'muted small' },
        `m₁ = ${fmtNumberEsAR(state.m1, 1)}, b₁ = ${fmtNumberEsAR(state.b1, 1)} vs m₂ = ${fmtNumberEsAR(state.m2, 1)}, b₂ = ${fmtNumberEsAR(state.b2, 1)} · ${cls.didacticDeterminantNote}`
      )
    );
  }

  attachSvgDrag(
    board.svg,
    handleB2,
    () => mapper,
    ({ y }) => {
      state.b2 = Math.max(-4, Math.min(5, Math.round(y * 2) / 2));
      sliderB2.setValue(state.b2);
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover ordenada al origen b₂ de r₂', stepX: 0, stepY: 0.5 }
  );

  host.replaceChildren(predictBox, presetsRow, slidersGrid, board.svg, readout);
  update();
  return { board, update };
}
