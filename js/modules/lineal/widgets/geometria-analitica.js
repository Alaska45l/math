/**
 * @file js/modules/lineal/widgets/geometria-analitica.js
 * Widget 4 · Sec. 4 (sec-geometria-analitica):
 * Laboratorio de Geometría Analítica en el plano con 3 modos integrados:
 *  - Modo A: Punto medio M, distancia exacta d(P; Q), colinealidad y clasificación de triángulos (Ej. 7b–c)
 *  - Modo B: Mediatriz de PQ como lugar geométrico equidistante d(X; P) = d(X; Q) (Ej. 8a)
 *  - Modo C: Distancia punto-recta con proyección ortogonal H y radical exacto (Ej. 21a: √5)
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  midpoint,
  distancePoints,
  classifyTriangleBySides,
  perpendicularBisector,
  pointLineDistance,
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

export function initGeometriaAnalitica(host) {
  if (!host) return null;

  const state = {
    mode: 'mediatriz', // 'triangle' | 'mediatriz' | 'point_line'
    p: { x: 1, y: 0 },
    q: { x: -1, y: 6 },
    r: { x: -2, y: 5 },
    testT: 1.5, // parámetro sobre la mediatriz en Modo B
    lineM: 2,
    lineB: -1,
    activePreset: 'ej8a_mediatriz',
  };

  const predictBox = createPredictBox({
    prompt:
      'Si movés un punto X sobre la mediatriz de PQ, ¿cómo cambian las distancias d(X; P) y d(X; Q)?',
    options: [
      {
        label: 'Solo son iguales cuando X coincide con el punto medio M; si te alejás, una es mayor.',
        correct: false,
        explanation:
          'M es la distancia mínima, pero al moverte a lo largo de toda la recta perpendicular por M mantenés simetría exacta con P y Q.',
      },
      {
        label: 'Cambian de valor numérico al mover X, pero d(X; P) y d(X; Q) permanecen exactamente iguales en todo punto de la mediatriz.',
        correct: true,
        explanation:
          '¡Correcto! La mediatriz es justamente el lugar geométrico de todos los puntos del plano equidistantes de P y de Q.',
      },
      {
        label: 'd(X; P) + d(X; Q) se mantiene constante.',
        correct: false,
        explanation:
          'Suma constante define una elipse, no la mediatriz. En la mediatriz lo que se conserva es la igualdad d(X; P) = d(X; Q).',
      },
    ],
    onVerify: () => {
      state.mode = 'mediatriz';
      state.p = { x: 1, y: 0 };
      state.q = { x: -1, y: 6 };
      state.testT = 2.0;
      state.activePreset = 'ej8a_mediatriz';
      update();
    },
  });

  const modeBar = h('div', { class: 'pr-chip-row' });
  const btnModeTri = h('button', { type: 'button', class: 'pr-chip' }, 'Modo A · Punto Medio y Triángulos');
  const btnModeMed = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Modo B · Mediatriz Equidistante');
  const btnModeDist = h('button', { type: 'button', class: 'pr-chip' }, 'Modo C · Distancia Punto-Recta');
  modeBar.append(btnModeTri, btnModeMed, btnModeDist);

  const presetsRow = h('div', { class: 'pr-presets' });
  const PRESETS = [
    {
      id: 'ej8a_mediatriz',
      label: 'Ej. 8a: Mediatriz P(1;0), Q(−1;6)',
      apply: () => {
        state.mode = 'mediatriz';
        state.p = { x: 1, y: 0 };
        state.q = { x: -1, y: 6 };
        state.testT = 1.5;
      },
    },
    {
      id: 'ej7c_tri',
      label: 'Ej. 7c: Triángulo A(3;0), B(−3;4), C(−2;5)',
      apply: () => {
        state.mode = 'triangle';
        state.p = { x: 3, y: 0 };
        state.q = { x: -3, y: 4 };
        state.r = { x: -2, y: 5 };
      },
    },
    {
      id: 'ej7b_col',
      label: 'Ej. 7b: Puntos colineales (−1;−1), (1;1), (3;3)',
      apply: () => {
        state.mode = 'triangle';
        state.p = { x: -1, y: -1 };
        state.q = { x: 1, y: 1 };
        state.r = { x: 3, y: 3 };
      },
    },
    {
      id: 'ej21a_dist',
      label: 'Ej. 21a: d(P(4;2), y = 2x − 1) = √5',
      apply: () => {
        state.mode = 'point_line';
        state.p = { x: 4, y: 2 };
        state.lineM = 2;
        state.lineB = -1;
        sliderLineM.setValue(2);
        sliderLineB.setValue(-1);
      },
    },
  ];

  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      pr.apply();
      state.activePreset = pr.id;
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const sliderTestT = createSliderField({
    label: 'Deslizar punto X sobre la mediatriz',
    min: -3.5,
    max: 3.5,
    step: 0.25,
    value: state.testT,
    formatValue: (v) => fmtNumberEsAR(v, 2),
    onInput: (val) => {
      state.testT = val;
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderLineM = createSliderField({
    label: 'Pendiente recta r (m)',
    min: -3,
    max: 3,
    step: 0.5,
    value: state.lineM,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.lineM = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderLineB = createSliderField({
    label: 'Ordenada recta r (b)',
    min: -4,
    max: 5,
    step: 0.5,
    value: state.lineB,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.lineB = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const extraControls = h('div', { class: 'lin-sliders-grid' }, [
    sliderTestT.root,
    sliderLineM.root,
    sliderLineB.root,
  ]);

  const board = createLineBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Pizarrón interactivo de geometría analítica: distancias, mediatriz y proyección ortogonal',
  });
  const mapper = createCartesianMapper(board.plotBox, {
    xMin: -5,
    xMax: 7,
    yMin: -3,
    yMax: 8,
  });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

  // Elementos SVG persistentes
  const triPoly = s('polygon', {
    fill: 'rgba(130, 180, 255, 0.12)',
    stroke: 'var(--blue)',
    'stroke-width': 2,
  });
  const segPQ = s('line', { stroke: 'var(--blue)', 'stroke-width': 2.6 });
  const auxLine = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.5 });
  const rayXP = s('line', { stroke: 'var(--green)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4' });
  const rayXQ = s('line', { stroke: 'var(--green)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4' });
  const pythLegX = s('line', { stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
  const pythLegY = s('line', { stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });

  board.clippedLayer.append(triPoly, pythLegX, pythLegY, rayXP, rayXQ, segPQ, auxLine);

  const midDot = s('circle', { r: 5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const midLabel = s('text', { fill: 'var(--yellow)', 'font-size': 11, 'font-weight': 'bold' });
  const footDot = s('circle', { r: 5.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const footLabel = s('text', { fill: 'var(--green)', 'font-size': 11, 'font-weight': 'bold' });
  const xDot = s('circle', { r: 6.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const xLabel = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });

  const handleP = s('circle', { r: 8, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelP = s('text', { fill: 'var(--blue)', 'font-size': 11.5, 'font-weight': 'bold' });
  const handleQ = s('circle', { r: 8, fill: 'var(--pink)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelQ = s('text', { fill: 'var(--pink)', 'font-size': 11.5, 'font-weight': 'bold' });
  const handleR = s('circle', { r: 8, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const labelR = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(
    midDot,
    midLabel,
    footDot,
    footLabel,
    xDot,
    xLabel,
    handleP,
    labelP,
    handleQ,
    labelQ,
    handleR,
    labelR
  );

  const readout = h('div', { class: 'pr-readout lin-readout', 'aria-live': 'polite' });

  function placePoint(dot, lbl, pt, name) {
    const px = clampPx(mapper.toX(pt.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
    const py = clampPx(mapper.toY(pt.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
    dot.setAttribute('cx', px.toFixed(1));
    dot.setAttribute('cy', py.toFixed(1));
    dot.setAttribute('aria-valuenow', String(pt.x));
    lbl.setAttribute('x', clampPx(px + 9, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 86).toFixed(1));
    lbl.setAttribute('y', clampPx(py - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
    lbl.textContent = `${name}(${fmtNumberEsAR(pt.x, 1)}; ${fmtNumberEsAR(pt.y, 1)})`;
  }

  function update() {
    btnModeTri.classList.toggle('is-active', state.mode === 'triangle');
    btnModeMed.classList.toggle('is-active', state.mode === 'mediatriz');
    btnModeDist.classList.toggle('is-active', state.mode === 'point_line');
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.activePreset));

    sliderTestT.root.hidden = state.mode !== 'mediatriz';
    sliderLineM.root.hidden = state.mode !== 'point_line';
    sliderLineB.root.hidden = state.mode !== 'point_line';

    const showTri = state.mode === 'triangle';
    const showMed = state.mode === 'mediatriz';
    const showDist = state.mode === 'point_line';

    triPoly.setAttribute('visibility', showTri ? 'visible' : 'hidden');
    pythLegX.setAttribute('visibility', showTri ? 'visible' : 'hidden');
    pythLegY.setAttribute('visibility', showTri ? 'visible' : 'hidden');
    handleR.setAttribute('visibility', showTri ? 'visible' : 'hidden');
    labelR.setAttribute('visibility', showTri ? 'visible' : 'hidden');

    handleQ.setAttribute('visibility', showDist ? 'hidden' : 'visible');
    labelQ.setAttribute('visibility', showDist ? 'hidden' : 'visible');
    segPQ.setAttribute('visibility', showDist ? 'hidden' : 'visible');
    midDot.setAttribute('visibility', showDist ? 'hidden' : 'visible');
    midLabel.setAttribute('visibility', showDist ? 'hidden' : 'visible');

    auxLine.setAttribute('visibility', showMed || showDist ? 'visible' : 'hidden');
    rayXP.setAttribute('visibility', showMed || showDist ? 'visible' : 'hidden');
    rayXQ.setAttribute('visibility', showMed ? 'visible' : 'hidden');
    xDot.setAttribute('visibility', showMed ? 'visible' : 'hidden');
    xLabel.setAttribute('visibility', showMed ? 'visible' : 'hidden');
    footDot.setAttribute('visibility', showDist ? 'visible' : 'hidden');
    footLabel.setAttribute('visibility', showDist ? 'visible' : 'hidden');

    placePoint(handleP, labelP, state.p, showTri ? 'A' : 'P');

    if (!showDist) {
      if (Math.abs(state.p.x - state.q.x) < 1e-6 && Math.abs(state.p.y - state.q.y) < 1e-6) {
        state.q.x += 1;
      }
      placePoint(handleQ, labelQ, state.q, showTri ? 'B' : 'Q');
      segPQ.setAttribute('x1', mapper.toX(state.p.x).toFixed(1));
      segPQ.setAttribute('y1', mapper.toY(state.p.y).toFixed(1));
      segPQ.setAttribute('x2', mapper.toX(state.q.x).toFixed(1));
      segPQ.setAttribute('y2', mapper.toY(state.q.y).toFixed(1));

      const mid = midpoint(state.p, state.q);
      const mx = ratToNumber(mid.x);
      const my = ratToNumber(mid.y);
      const mpx = mapper.toX(mx);
      const mpy = mapper.toY(my);
      midDot.setAttribute('cx', mpx.toFixed(1));
      midDot.setAttribute('cy', mpy.toFixed(1));
      midLabel.setAttribute('x', clampPx(mpx + 8, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 86).toFixed(1));
      midLabel.setAttribute('y', clampPx(mpy + 15, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      midLabel.textContent = `M(${fmtRat(mid.x)}; ${fmtRat(mid.y)})`;
    }

    if (showTri) {
      placePoint(handleR, labelR, state.r, 'C');
      triPoly.setAttribute(
        'points',
        `${mapper.toX(state.p.x)},${mapper.toY(state.p.y)} ${mapper.toX(state.q.x)},${mapper.toY(state.q.y)} ${mapper.toX(state.r.x)},${mapper.toY(state.r.y)}`
      );
      pythLegX.setAttribute('x1', mapper.toX(state.p.x).toFixed(1));
      pythLegX.setAttribute('y1', mapper.toY(state.p.y).toFixed(1));
      pythLegX.setAttribute('x2', mapper.toX(state.q.x).toFixed(1));
      pythLegX.setAttribute('y2', mapper.toY(state.p.y).toFixed(1));
      pythLegY.setAttribute('x1', mapper.toX(state.q.x).toFixed(1));
      pythLegY.setAttribute('y1', mapper.toY(state.p.y).toFixed(1));
      pythLegY.setAttribute('x2', mapper.toX(state.q.x).toFixed(1));
      pythLegY.setAttribute('y2', mapper.toY(state.q.y).toFixed(1));

      const distAB = distancePoints(state.p, state.q);
      const midAB = midpoint(state.p, state.q);
      const tri = classifyTriangleBySides(state.p, state.q, state.r);
      const typeMap = {
        collinear: 'Colineales (área = 0, no forman triángulo)',
        scalene: 'Triángulo escaleno',
        isosceles: 'Triángulo isósceles',
        equilateral: 'Triángulo equilátero',
      };
      const rightTag = tri.isRightTriangle ? ' · Rectángulo (Pitágoras exacto)' : '';

      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `${typeMap[tri.type]}${rightTag} · `),
          h('span', {}, `M(AB) = (${fmtRat(midAB.x)}; ${fmtRat(midAB.y)})`),
        ]),
        h(
          'div',
          { class: 'muted small' },
          `d(A; B) = ${distAB.text} · d(B; C) = ${tri.sides[1].text} · d(C; A) = ${tri.sides[2].text}`
        )
      );
    } else if (showMed) {
      const med = perpendicularBisector(state.p, state.q);
      const { A, B, C } = med.canonical;
      const clip = clipLineToBox(ratToNumber(A), ratToNumber(B), ratToNumber(C), mapper);
      if (clip) {
        auxLine.setAttribute('x1', mapper.toX(clip.x1).toFixed(2));
        auxLine.setAttribute('y1', mapper.toY(clip.y1).toFixed(2));
        auxLine.setAttribute('x2', mapper.toX(clip.x2).toFixed(2));
        auxLine.setAttribute('y2', mapper.toY(clip.y2).toFixed(2));
      }

      // Vector unitario a lo largo de la mediatriz: (-dy, dx) / |(dx, dy)|
      const dx = state.q.x - state.p.x;
      const dy = state.q.y - state.p.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = -dy / len;
      const uy = dx / len;
      const mx = ratToNumber(med.midpoint.x);
      const my = ratToNumber(med.midpoint.y);
      const Xpt = { x: mx + state.testT * ux, y: my + state.testT * uy };

      const xpx = clampPx(mapper.toX(Xpt.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
      const xpy = clampPx(mapper.toY(Xpt.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
      xDot.setAttribute('cx', xpx.toFixed(1));
      xDot.setAttribute('cy', xpy.toFixed(1));
      xLabel.setAttribute('x', clampPx(xpx + 8, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 60).toFixed(1));
      xLabel.setAttribute('y', clampPx(xpy - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      xLabel.textContent = 'X';

      rayXP.setAttribute('x1', xpx.toFixed(1));
      rayXP.setAttribute('y1', xpy.toFixed(1));
      rayXP.setAttribute('x2', mapper.toX(state.p.x).toFixed(1));
      rayXP.setAttribute('y2', mapper.toY(state.p.y).toFixed(1));

      rayXQ.setAttribute('x1', xpx.toFixed(1));
      rayXQ.setAttribute('y1', xpy.toFixed(1));
      rayXQ.setAttribute('x2', mapper.toX(state.q.x).toFixed(1));
      rayXQ.setAttribute('y2', mapper.toY(state.q.y).toFixed(1));

      const dXP = Math.hypot(Xpt.x - state.p.x, Xpt.y - state.p.y);
      const dXQ = Math.hypot(Xpt.x - state.q.x, Xpt.y - state.q.y);
      const medEq = med.explicit.valid ? med.explicit.text : med.implicit.text;

      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `Mediatriz: ${medEq} · `),
          h('span', { style: 'color: var(--green)' }, `d(X; P) = d(X; Q) = ${fmtNumberEsAR(dXP, 2)}`),
        ]),
        h(
          'div',
          { class: 'muted small' },
          `M = (${fmtRat(med.midpoint.x)}; ${fmtRat(med.midpoint.y)}) · d(X; Q) = ${fmtNumberEsAR(dXQ, 2)} · Lugar geométrico equidistante verificado.`
        )
      );
    } else {
      // Modo C: Distancia punto-recta
      const lineSpec = { m: state.lineM, b: state.lineB };
      const distRes = pointLineDistance(state.p, lineSpec);
      const clip = clipLineToBox(state.lineM, -1, state.lineB, mapper);
      if (clip) {
        auxLine.setAttribute('x1', mapper.toX(clip.x1).toFixed(2));
        auxLine.setAttribute('y1', mapper.toY(clip.y1).toFixed(2));
        auxLine.setAttribute('x2', mapper.toX(clip.x2).toFixed(2));
        auxLine.setAttribute('y2', mapper.toY(clip.y2).toFixed(2));
      }

      const hx = ratToNumber(distRes.foot.x);
      const hy = ratToNumber(distRes.foot.y);
      const hpx = mapper.toX(hx);
      const hpy = mapper.toY(hy);

      rayXP.setAttribute('x1', mapper.toX(state.p.x).toFixed(1));
      rayXP.setAttribute('y1', mapper.toY(state.p.y).toFixed(1));
      rayXP.setAttribute('x2', hpx.toFixed(1));
      rayXP.setAttribute('y2', hpy.toFixed(1));

      footDot.setAttribute('cx', hpx.toFixed(1));
      footDot.setAttribute('cy', hpy.toFixed(1));
      footLabel.setAttribute('x', clampPx(hpx + 8, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 86).toFixed(1));
      footLabel.setAttribute('y', clampPx(hpy + 16, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      footLabel.textContent = `H(${fmtRat(distRes.foot.x)}; ${fmtRat(distRes.foot.y)})`;

      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `d(P; r) = ${distRes.text} `),
          h('span', { class: 'muted' }, `(≈ ${fmtNumberEsAR(distRes.numeric, 3)})`),
        ]),
        h(
          'div',
          { class: 'muted small' },
          `Pie ortogonal H = (${fmtRat(distRes.foot.x)}; ${fmtRat(distRes.foot.y)}) sobre y = ${fmtNumberEsAR(state.lineM, 1)}x + (${fmtNumberEsAR(state.lineB, 1)})`
        )
      );
    }
  }

  attachSvgDrag(
    board.svg,
    handleP,
    () => mapper,
    ({ x, y }) => {
      state.p.x = Math.max(-4.5, Math.min(6.5, Math.round(x * 2) / 2));
      state.p.y = Math.max(-2.5, Math.min(7.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover punto P o A', stepX: 0.5, stepY: 0.5 }
  );

  attachSvgDrag(
    board.svg,
    handleQ,
    () => mapper,
    ({ x, y }) => {
      state.q.x = Math.max(-4.5, Math.min(6.5, Math.round(x * 2) / 2));
      state.q.y = Math.max(-2.5, Math.min(7.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover punto Q o B', stepX: 0.5, stepY: 0.5 }
  );

  attachSvgDrag(
    board.svg,
    handleR,
    () => mapper,
    ({ x, y }) => {
      state.r.x = Math.max(-4.5, Math.min(6.5, Math.round(x * 2) / 2));
      state.r.y = Math.max(-2.5, Math.min(7.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover tercer vértice C', stepX: 0.5, stepY: 0.5 }
  );

  btnModeTri.addEventListener('click', () => {
    playClick();
    state.mode = 'triangle';
    update();
  });
  btnModeMed.addEventListener('click', () => {
    playClick();
    state.mode = 'mediatriz';
    update();
  });
  btnModeDist.addEventListener('click', () => {
    playClick();
    state.mode = 'point_line';
    update();
  });

  host.replaceChildren(predictBox, modeBar, presetsRow, extraControls, board.svg, readout);
  update();

  return { board, update };
}
