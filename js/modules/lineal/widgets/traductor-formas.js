/**
 * @file js/modules/lineal/widgets/traductor-formas.js
 * Widget 2 · Sec. 2 (sec-formas-angulo):
 * Traductor vivo entre Explícita (y = mx + b), Implícita (ax + by + c = 0) y Segmentaria (x/a + y/b = 1),
 * con transportador visual de ángulo α ∈ [0°, 180°), manijas arrastrables en los interceptos (a; 0) y (0; b)
 * y demostración explícita de los 3 casos degenerados (c = 0, horizontal a = 0, vertical b = 0).
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  MINUS,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  convertLinearForms,
  angleFromSlope,
} from '../logic.js';
import {
  createLineBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  attachSvgDrag,
  createSliderField,
  createPredictBox,
  clipLineToBox,
  clampPx,
} from './board-kit.js';

export function initTraductorFormas(host) {
  if (!host) return null;

  const state = {
    A: 2,
    B: 3,
    C: -6,
    activePreset: 'simulacro_2019',
  };

  const predictBox = createPredictBox({
    prompt:
      '¿Cuál de estas rectas NO puede escribirse en forma segmentaria x/a + y/b = 1 aunque sí tenga ecuación implícita ax + by + c = 0?',
    options: [
      {
        label: '2x + 3y − 6 = 0 (corta al eje X en 3 y al eje Y en 2).',
        correct: false,
        explanation:
          '2x + 3y − 6 = 0 corta ambos ejes fuera del origen: su forma segmentaria es x/3 + y/2 = 1.',
      },
      {
        label: '2x − 3y = 0 (pasa por el origen), y también las rectas horizontales o verticales.',
        correct: true,
        explanation:
          '¡Exacto! Cuando c = 0 (pasa por (0; 0)), o cuando falta una variable (horizontal/vertical), no hay dos cortes distintos del origen y dividir por 0 es ilegal.',
      },
      {
        label: 'Cualquier recta con pendiente negativa m < 0.',
        correct: false,
        explanation:
          'La pendiente negativa no impide la segmentaria: por ejemplo x/3 + y/2 = 1 tiene pendiente −2/3.',
      },
    ],
    onVerify: () => {
      state.A = 2;
      state.B = -3;
      state.C = 0;
      state.activePreset = 'deg_origin';
      syncSliders();
      update();
    },
  });

  const presetsRow = h('div', { class: 'pr-presets' });
  const PRESETS = [
    { id: 'simulacro_2019', label: 'Simulacro 2019: x/2 + y/3 = 1', A: 3, B: 2, C: -6 },
    { id: 'alpha_45', label: 'α = 45° (m = 1)', A: 1, B: -1, C: 2 },
    { id: 'alpha_135', label: 'α = 135° (m = −1)', A: 1, B: 1, C: -4 },
    { id: 'deg_origin', label: 'Degenerado: pasa por (0;0)', A: 2, B: -1, C: 0 },
    { id: 'deg_horiz', label: 'Degenerado: horizontal y = 3', A: 0, B: 1, C: -3 },
    { id: 'deg_vert', label: 'Degenerado: vertical x = −2', A: 1, B: 0, C: 2 },
  ];

  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.A = pr.A;
      state.B = pr.B;
      state.C = pr.C;
      state.activePreset = pr.id;
      syncSliders();
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const sliderA = createSliderField({
    label: 'Coeficiente A (de x)',
    min: -5,
    max: 5,
    step: 1,
    value: state.A,
    formatValue: (v) => fmtNumberEsAR(v, 0),
    onInput: (val) => {
      if (val === 0 && state.B === 0) {
        sliderA.setValue(state.A);
        return;
      }
      state.A = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderB = createSliderField({
    label: 'Coeficiente B (de y)',
    min: -5,
    max: 5,
    step: 1,
    value: state.B,
    formatValue: (v) => fmtNumberEsAR(v, 0),
    onInput: (val) => {
      if (val === 0 && state.A === 0) {
        sliderB.setValue(state.B);
        return;
      }
      state.B = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderC = createSliderField({
    label: 'Término C',
    min: -8,
    max: 8,
    step: 1,
    value: state.C,
    formatValue: (v) => fmtNumberEsAR(v, 0),
    onInput: (val) => {
      state.C = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  function syncSliders() {
    sliderA.setValue(state.A);
    sliderB.setValue(state.B);
    sliderC.setValue(state.C);
  }

  const slidersGrid = h('div', { class: 'lin-sliders-grid' }, [sliderA.root, sliderB.root, sliderC.root]);

  const board = createLineBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Traductor geométrico de formas explícita, implícita y segmentaria',
  });
  const mapper = createCartesianMapper(board.plotBox, {
    xMin: -6,
    xMax: 6,
    yMin: -5,
    yMax: 6,
  });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

  const mainLine = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });
  const protractorArc = s('path', { fill: 'rgba(142, 219, 159, 0.16)', stroke: 'var(--green)', 'stroke-width': 1.8 });
  board.clippedLayer.append(protractorArc, mainLine);

  const handleXInt = s('circle', { r: 8, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelXInt = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });
  const handleYInt = s('circle', { r: 8, fill: 'var(--pink)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelYInt = s('text', { fill: 'var(--pink)', 'font-size': 11.5, 'font-weight': 'bold' });
  const angleBadge = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(handleXInt, labelXInt, handleYInt, labelYInt, angleBadge);

  const readout = h('div', { class: 'pr-readout lin-readout', 'aria-live': 'polite' });

  function update() {
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.activePreset));
    if (state.A === 0 && state.B === 0) state.A = 1;

    const forms = convertLinearForms({ A: state.A, B: state.B, C: state.C });
    const clipped = clipLineToBox(state.A, state.B, state.C, mapper);
    if (clipped) {
      mainLine.setAttribute('x1', mapper.toX(clipped.x1).toFixed(2));
      mainLine.setAttribute('y1', mapper.toY(clipped.y1).toFixed(2));
      mainLine.setAttribute('x2', mapper.toX(clipped.x2).toFixed(2));
      mainLine.setAttribute('y2', mapper.toY(clipped.y2).toFixed(2));
    }

    const segOk = forms.segmentary.valid;
    const xInt = !forms.isHorizontal ? -state.C / state.A : null;
    const yInt = !forms.isVertical ? -state.C / state.B : null;

    if (xInt !== null && xInt >= mapper.xMin && xInt <= mapper.xMax) {
      const cx = mapper.toX(xInt);
      const cy = mapper.toY(0);
      handleXInt.setAttribute('cx', cx.toFixed(1));
      handleXInt.setAttribute('cy', cy.toFixed(1));
      handleXInt.setAttribute('visibility', segOk ? 'visible' : 'visible');
      handleXInt.setAttribute('aria-valuenow', String(xInt));
      labelXInt.setAttribute('x', clampPx(cx + 8, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 76).toFixed(1));
      labelXInt.setAttribute('y', (cy + 16).toFixed(1));
      labelXInt.textContent = `a = ${fmtNumberEsAR(xInt, 2)}`;
      labelXInt.setAttribute('visibility', 'visible');

      // Arco transportador en el corte X
      const alpha = forms.isVertical ? 90 : angleFromSlope(forms.explicit.m);
      if (alpha > 1) {
        const rad = (alpha * Math.PI) / 180;
        const R = 30;
        const ex = cx + R * Math.cos(rad);
        const ey = cy - R * Math.sin(rad);
        protractorArc.setAttribute(
          'd',
          `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${(cx + R).toFixed(1)} ${cy.toFixed(1)} A ${R} ${R} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)} Z`
        );
        protractorArc.setAttribute('visibility', 'visible');
        angleBadge.setAttribute('x', clampPx(cx + 22, board.plotBox.x + 12, board.plotBox.x + board.plotBox.w - 84).toFixed(1));
        angleBadge.setAttribute('y', clampPx(cy - 22, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 10).toFixed(1));
        angleBadge.textContent = `α = ${fmtNumberEsAR(alpha, 1)}°`;
        angleBadge.setAttribute('visibility', 'visible');
      } else {
        protractorArc.setAttribute('visibility', 'hidden');
        angleBadge.setAttribute('visibility', 'hidden');
      }
    } else {
      handleXInt.setAttribute('visibility', 'hidden');
      labelXInt.setAttribute('visibility', 'hidden');
      protractorArc.setAttribute('visibility', 'hidden');
      angleBadge.setAttribute('visibility', 'hidden');
    }

    if (yInt !== null && yInt >= mapper.yMin && yInt <= mapper.yMax) {
      const cx = mapper.toX(0);
      const cy = mapper.toY(yInt);
      handleYInt.setAttribute('cx', cx.toFixed(1));
      handleYInt.setAttribute('cy', cy.toFixed(1));
      handleYInt.setAttribute('visibility', 'visible');
      handleYInt.setAttribute('aria-valuenow', String(yInt));
      labelYInt.setAttribute('x', (cx + 10).toFixed(1));
      labelYInt.setAttribute('y', clampPx(cy - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      labelYInt.textContent = `b = ${fmtNumberEsAR(yInt, 2)}`;
      labelYInt.setAttribute('visibility', 'visible');
    } else {
      handleYInt.setAttribute('visibility', 'hidden');
      labelYInt.setAttribute('visibility', 'hidden');
    }

    // Tabla comparativa en vivo de las 3 formas
    const expBadge = forms.explicit.valid ? 'var(--green)' : 'var(--pink)';
    const segBadge = forms.segmentary.valid ? 'var(--green)' : 'var(--pink)';
    const expDetail = forms.explicit.valid ? forms.explicit.text : forms.explicit.reason;
    const segDetail = forms.segmentary.valid ? forms.segmentary.text : forms.segmentary.reason;

    readout.replaceChildren(
      h('div', { class: 'lin-forms-grid' }, [
        h('div', { class: 'lin-form-pill' }, [
          h('strong', { style: `color: ${expBadge}` }, 'Explícita: '),
          h('span', {}, expDetail),
        ]),
        h('div', { class: 'lin-form-pill' }, [
          h('strong', { style: 'color: var(--yellow)' }, 'Implícita: '),
          h('span', {}, forms.implicit.text),
        ]),
        h('div', { class: 'lin-form-pill' }, [
          h('strong', { style: segBadge ? `color: ${segBadge}` : '' }, 'Segmentaria: '),
          h('span', {}, segDetail),
        ]),
      ])
    );
  }

  // Arrastrar intercepto a = (a; 0) o b = (0; b) reconstruye ecuación b*x + a*y - a*b = 0
  attachSvgDrag(
    board.svg,
    handleXInt,
    () => mapper,
    ({ x }) => {
      const aVal = Math.max(-5, Math.min(5, Math.round(x * 2) / 2));
      if (Math.abs(aVal) < 0.25) return;
      const bVal = !state.B ? 2 : -state.C / state.B || 2;
      state.A = Math.round(bVal * 2);
      state.B = Math.round(aVal * 2);
      state.C = Math.round(-aVal * bVal * 2);
      state.activePreset = 'custom';
      syncSliders();
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover corte con el eje X (a; 0)', stepX: 0.5, stepY: 0.5 }
  );

  attachSvgDrag(
    board.svg,
    handleYInt,
    () => mapper,
    ({ y }) => {
      const bVal = Math.max(-4, Math.min(5, Math.round(y * 2) / 2));
      if (Math.abs(bVal) < 0.25) return;
      const aVal = !state.A ? 2 : -state.C / state.A || 2;
      state.A = Math.round(bVal * 2);
      state.B = Math.round(aVal * 2);
      state.C = Math.round(-aVal * bVal * 2);
      state.activePreset = 'custom';
      syncSliders();
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover ordenada al origen (0; b)', stepX: 0.5, stepY: 0.5 }
  );

  host.replaceChildren(predictBox, presetsRow, slidersGrid, board.svg, readout);
  update();

  return { board, update };
}
