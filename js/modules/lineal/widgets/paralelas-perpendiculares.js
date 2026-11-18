/**
 * @file js/modules/lineal/widgets/paralelas-perpendiculares.js
 * Widget 3 · Sec. 3 (sec-paralelas-perpendiculares):
 * Laboratorio de posiciones relativas en el plano: secantes perpendiculares, secantes oblicuas,
 * paralelas coincidentes y paralelas no coincidentes, incluyendo el caso singular horizontal perp vertical.
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  MINUS,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  classifyLinePair,
  parallelLineThrough,
  perpendicularLineThrough,
  convertLinearForms,
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

export function initParalelasPerpendiculares(host) {
  if (!host) return null;

  const state = {
    r1Type: 'oblique', // 'oblique' | 'horizontal' | 'vertical'
    m1: 2,
    b1: -1,
    x1Const: 2,
    relMode: 'perp', // 'parallel' | 'perp' | 'free'
    m2: -0.5,
    r2Vertical: false,
    p: { x: 2, y: 3 },
    activePreset: 'free_m2',
  };

  const predictBox = createPredictBox({
    prompt:
      'Si la recta r₁ tiene pendiente m₁ = 2, ¿qué relación tiene que cumplir m₂ para formar exactamente 90° — y qué pasa si r₁ es horizontal (m₁ = 0)?',
    options: [
      {
        label: 'm₂ debe ser 1/2 (inversa positiva); si m₁ = 0, la perpendicular tiene pendiente 0.',
        correct: false,
        explanation:
          '1/2 mantiene pendiente positiva (sube igual que r₁, no forma 90°). Falta el signo opuesto: m₁·m₂ debe dar −1.',
      },
      {
        label: 'm₂ = −1/2 (opuesta e inversa, m₁·m₂ = −1); y si r₁ es horizontal (m₁ = 0), su perpendicular es una recta vertical x = k sin usar −1/0.',
        correct: true,
        explanation:
          '¡Exacto! Para rectas oblicuas vale m₁·m₂ = −1; para horizontal (m = 0) y vertical (x = k) el ángulo recto es geométrico sin dividir por cero.',
      },
      {
        label: 'm₂ = −2 (solo cambiar el signo de m₁).',
        correct: false,
        explanation:
          'Cambiar solo el signo refleja la pendiente (−2), pero 2 · (−2) = −4 ≠ −1: el ángulo no es de 90°.',
      },
    ],
    onVerify: () => {
      state.r1Type = 'oblique';
      state.m1 = 2;
      state.b1 = -1;
      state.relMode = 'perp';
      state.p = { x: 2, y: 1 };
      state.activePreset = 'verify_perp';
      syncSliders();
      update();
    },
  });

  const relRow = h('div', { class: 'pr-chip-row' });
  const btnPar = h('button', { type: 'button', class: 'pr-chip' }, 'Construir paralela r₂ ∥ r₁ por P');
  const btnPerp = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Construir perpendicular r₂ ⊥ r₁ por P');
  const btnFree = h('button', { type: 'button', class: 'pr-chip' }, 'Modo Libre (mover m₂)');
  relRow.append(btnPar, btnPerp, btnFree);

  const presetsRow = h('div', { class: 'pr-presets' });
  const PRESETS = [
    {
      id: 'ej6g',
      label: 'Ej. 6g: ∥ a 2x+3y+4=0 por A(−2;4)',
      apply: () => {
        state.r1Type = 'oblique';
        state.m1 = -2 / 3;
        state.b1 = -4 / 3;
        state.relMode = 'parallel';
        state.p = { x: -2, y: 4 };
      },
    },
    {
      id: 'ej6h',
      label: 'Ej. 6h: ⊥ a y+2x−6=0 por B(2;3)',
      apply: () => {
        state.r1Type = 'oblique';
        state.m1 = -2;
        state.b1 = 6;
        state.relMode = 'perp';
        state.p = { x: 2, y: 3 };
      },
    },
    {
      id: 'simulacro_6',
      label: 'Simulacro 2019: ⊥ a x/2+y/3=1, raíz 6',
      apply: () => {
        state.r1Type = 'oblique';
        state.m1 = -1.5;
        state.b1 = 3;
        state.relMode = 'perp';
        state.p = { x: 6, y: 0 };
      },
    },
    {
      id: 'horiz_vert',
      label: 'Singular: Horizontal y = 1 ⊥ Vertical',
      apply: () => {
        state.r1Type = 'horizontal';
        state.b1 = 1;
        state.relMode = 'perp';
        state.p = { x: 2, y: 3 };
      },
    },
  ];

  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      pr.apply();
      state.activePreset = pr.id;
      syncSliders();
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const sliderM1 = createSliderField({
    label: 'Pendiente r₁ (m₁)',
    min: -3,
    max: 3,
    step: 0.25,
    value: state.m1,
    formatValue: (v) => fmtNumberEsAR(v, 2),
    onInput: (val) => {
      state.r1Type = Math.abs(val) < 1e-6 ? 'horizontal' : 'oblique';
      state.m1 = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderB1 = createSliderField({
    label: 'Ordenada r₁ (b₁)',
    min: -4,
    max: 6,
    step: 0.5,
    value: state.b1,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.b1 = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderM2 = createSliderField({
    label: 'Pendiente libre r₂ (m₂)',
    min: -3,
    max: 3,
    step: 0.25,
    value: state.m2,
    formatValue: (v) => fmtNumberEsAR(v, 2),
    onInput: (val) => {
      state.r2Vertical = false;
      state.m2 = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  function syncSliders() {
    sliderM1.setValue(state.r1Type === 'horizontal' ? 0 : state.m1);
    sliderB1.setValue(state.b1);
    sliderM2.setValue(state.m2);
    sliderM2.root.hidden = state.relMode !== 'free';
  }

  const slidersGrid = h('div', { class: 'lin-sliders-grid' }, [
    sliderM1.root,
    sliderB1.root,
    sliderM2.root,
  ]);

  const board = createLineBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Laboratorio de rectas paralelas y perpendiculares',
  });
  const mapper = createCartesianMapper(board.plotBox, {
    xMin: -6,
    xMax: 8,
    yMin: -5,
    yMax: 7,
  });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

  const line1El = s('line', { stroke: 'var(--blue)', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const line2El = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const rightAngleMark = s('path', {
    fill: 'rgba(142, 219, 159, 0.22)',
    stroke: 'var(--green)',
    'stroke-width': 2,
    visibility: 'hidden',
  });
  board.clippedLayer.append(rightAngleMark, line1El, line2El);

  const interDot = s('circle', { r: 5.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const interLabel = s('text', { fill: 'var(--green)', 'font-size': 11, 'font-weight': 'bold' });
  const handleP = s('circle', { r: 8, fill: 'var(--pink)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelP = s('text', { fill: 'var(--pink)', 'font-size': 11.5, 'font-weight': 'bold' });
  const legendR1 = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 18, fill: 'var(--blue)', 'font-size': 11.5, 'font-weight': 'bold' });
  const legendR2 = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 34, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(interDot, interLabel, handleP, labelP, legendR1, legendR2);

  const readout = h('div', { class: 'pr-readout lin-readout', 'aria-live': 'polite' });

  function getLine1Spec() {
    if (state.r1Type === 'vertical') return { isVertical: true, x0: state.x1Const };
    if (state.r1Type === 'horizontal') return { m: 0, b: state.b1 };
    return { m: state.m1, b: state.b1 };
  }

  function update() {
    btnPar.classList.toggle('is-active', state.relMode === 'parallel');
    btnPerp.classList.toggle('is-active', state.relMode === 'perp');
    btnFree.classList.toggle('is-active', state.relMode === 'free');
    sliderM2.root.hidden = state.relMode !== 'free';
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.activePreset));

    const l1Spec = getLine1Spec();
    const l1Forms = convertLinearForms(l1Spec);

    let l2Forms;
    if (state.relMode === 'parallel') {
      l2Forms = parallelLineThrough(l1Spec, state.p);
    } else if (state.relMode === 'perp') {
      l2Forms = perpendicularLineThrough(l1Spec, state.p);
    } else {
      const m2 = state.m2;
      const b2 = state.p.y - m2 * state.p.x;
      l2Forms = convertLinearForms({ m: m2, b: b2 });
    }

    const c1 = l1Forms.canonical;
    const c2 = l2Forms.canonical;
    const clip1 = clipLineToBox(ratToNumber(c1.A), ratToNumber(c1.B), ratToNumber(c1.C), mapper);
    const clip2 = clipLineToBox(ratToNumber(c2.A), ratToNumber(c2.B), ratToNumber(c2.C), mapper);

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

    const pPx = clampPx(mapper.toX(state.p.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
    const pPy = clampPx(mapper.toY(state.p.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
    handleP.setAttribute('cx', pPx.toFixed(1));
    handleP.setAttribute('cy', pPy.toFixed(1));
    handleP.setAttribute('aria-valuenow', String(state.p.x));
    labelP.setAttribute('x', clampPx(pPx + 10, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 92).toFixed(1));
    labelP.setAttribute('y', clampPx(pPy - 10, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
    labelP.textContent = `P(${fmtNumberEsAR(state.p.x, 1)}; ${fmtNumberEsAR(state.p.y, 1)})`;

    const pair = classifyLinePair(l1Forms, l2Forms);
    legendR1.textContent = `r₁: ${l1Forms.explicit.valid ? l1Forms.explicit.text : l1Forms.implicit.text}`;
    legendR2.textContent = `r₂: ${l2Forms.explicit.valid ? l2Forms.explicit.text : `x = ${fmtRat(l2Forms.explicit.x0)}`}`;

    if (pair.intersection) {
      const ix = ratToNumber(pair.intersection.x);
      const iy = ratToNumber(pair.intersection.y);
      const inView = ix >= mapper.xMin && ix <= mapper.xMax && iy >= mapper.yMin && iy <= mapper.yMax;
      interDot.setAttribute('visibility', inView ? 'visible' : 'hidden');
      interLabel.setAttribute('visibility', inView ? 'visible' : 'hidden');
      if (inView) {
        const ipx = mapper.toX(ix);
        const ipy = mapper.toY(iy);
        interDot.setAttribute('cx', ipx.toFixed(1));
        interDot.setAttribute('cy', ipy.toFixed(1));
        interLabel.setAttribute('x', clampPx(ipx + 8, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 95).toFixed(1));
        interLabel.setAttribute('y', clampPx(ipy + 16, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
        interLabel.textContent = `I(${fmtRat(pair.intersection.x)}; ${fmtRat(pair.intersection.y)})`;

        if (pair.isPerpendicular) {
          // Dibuja escuadra de 90° en la intersección en coordenadas de pantalla
          const a1 = ratToNumber(c1.A);
          const b1 = ratToNumber(c1.B);
          // Vector dirección en pantalla (dx_px, dy_px)
          const u1x = b1 * (mapper.plotBox.w / (mapper.xMax - mapper.xMin));
          const u1y = -(-a1) * (mapper.plotBox.h / (mapper.yMax - mapper.yMin));
          const n1 = Math.hypot(u1x, u1y) || 1;
          const v1x = (u1x / n1) * 14;
          const v1y = (u1y / n1) * 14;

          const a2 = ratToNumber(c2.A);
          const b2 = ratToNumber(c2.B);
          const u2x = b2 * (mapper.plotBox.w / (mapper.xMax - mapper.xMin));
          const u2y = -(-a2) * (mapper.plotBox.h / (mapper.yMax - mapper.yMin));
          const n2 = Math.hypot(u2x, u2y) || 1;
          const v2x = (u2x / n2) * 14;
          const v2y = (u2y / n2) * 14;

          const p1x = ipx + v1x;
          const p1y = ipy + v1y;
          const p2x = p1x + v2x;
          const p2y = p1y + v2y;
          const p3x = ipx + v2x;
          const p3y = ipy + v2y;
          rightAngleMark.setAttribute(
            'd',
            `M ${ipx.toFixed(1)} ${ipy.toFixed(1)} L ${p1x.toFixed(1)} ${p1y.toFixed(1)} L ${p2x.toFixed(1)} ${p2y.toFixed(1)} L ${p3x.toFixed(1)} ${p3y.toFixed(1)} Z`
          );
          rightAngleMark.setAttribute('visibility', 'visible');
        } else {
          rightAngleMark.setAttribute('visibility', 'hidden');
        }
      } else {
        rightAngleMark.setAttribute('visibility', 'hidden');
      }
    } else {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      rightAngleMark.setAttribute('visibility', 'hidden');
    }

    const relNames = {
      secant_perpendicular: 'Secantes perpendiculares (90°)',
      secant_oblique: 'Secantes oblicuas',
      parallel_coincident: 'Paralelas coincidentes (misma recta)',
      parallel_distinct: 'Paralelas no coincidentes (S = ∅)',
    };
    const m1Txt = l1Forms.isVertical ? 'no existe (vertical)' : fmtRat(l1Forms.explicit.m);
    const m2Txt = l2Forms.isVertical ? 'no existe (vertical)' : fmtRat(l2Forms.explicit.m);
    const prodTxt = pair.slopeProduct
      ? `m₁ · m₂ = ${fmtRat(pair.slopeProduct)}`
      : 'Horizontal (m = 0) ⊥ Vertical (x = k)';
    const interTxt = pair.intersection
      ? `Corte I = (${fmtRat(pair.intersection.x)}; ${fmtRat(pair.intersection.y)})`
      : pair.isCoincident
        ? 'Infinitos puntos en común'
        : 'Sin intersección en ℝ²';

    readout.replaceChildren(
      h('div', {}, [
        h('strong', {}, `${relNames[pair.relation]} · `),
        h('span', {}, `${prodTxt}`),
      ]),
      h(
        'div',
        { class: 'muted small' },
        `m₁ = ${m1Txt} · m₂ = ${m2Txt} · ${interTxt}`
      )
    );
  }

  attachSvgDrag(
    board.svg,
    handleP,
    () => mapper,
    ({ x, y }) => {
      state.p.x = Math.max(-5.5, Math.min(7.5, Math.round(x * 2) / 2));
      state.p.y = Math.max(-4.5, Math.min(6.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Arrastrar punto de paso P para r₂', stepX: 0.5, stepY: 0.5 }
  );

  btnPar.addEventListener('click', () => {
    playClick();
    state.relMode = 'parallel';
    predictBox.notifyInteraction();
    update();
  });
  btnPerp.addEventListener('click', () => {
    playClick();
    state.relMode = 'perp';
    predictBox.notifyInteraction();
    update();
  });
  btnFree.addEventListener('click', () => {
    playClick();
    state.relMode = 'free';
    predictBox.notifyInteraction();
    update();
  });

  host.replaceChildren(predictBox, relRow, presetsRow, slidersGrid, board.svg, readout);
  syncSliders();
  update();

  return { board, update };
}
