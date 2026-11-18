/**
 * @file js/modules/sistemas/widgets/explorador-parametrico.js
 * Widget 3 · Sec. 3 (sec-sistemas-parametricos):
 * Explorador continuo del parámetro k ∈ ℝ − {0} (o a ∈ ℝ − {1}) en sistemas de UNMDP
 * (Ej. 12a, 12b, 21h), con recta 1D superior de parámetro mostrando huecos de dominio,
 * valores críticos SI/SCI e intervalos SCD, y giro de tijera en el plano cartesiano.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  analyzeParametricSystem,
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

export function initExploradorParametrico(host) {
  if (!host) return null;

  const PRESETS = [
    {
      id: 'ej12b',
      label: 'Ej. 12b: kx+y=7, (k+2)x+ky=14 (k ∈ ℝ−{0})',
      paramName: 'k',
      spec: {
        paramName: 'k',
        a1: { k: 1, c: 0 },
        b1: 1,
        c1: 7,
        a2: { k: 1, c: 2 },
        b2: { k: 1, c: 0 },
        c2: 14,
        excludedParams: [0],
      },
      initK: 1,
    },
    {
      id: 'ej12a',
      label: 'Ej. 12a: kx+y=2, x+y=1 (k ∈ ℝ−{0})',
      paramName: 'k',
      spec: {
        paramName: 'k',
        a1: { k: 1, c: 0 },
        b1: 1,
        c1: 2,
        a2: 1,
        b2: 1,
        c2: 1,
        excludedParams: [0],
      },
      initK: 2,
    },
    {
      id: 'ej21h',
      label: 'Ej. 21h: (a−1)y−4x=1, (a−1)x−y=1/2 (a ∈ ℝ−{1})',
      paramName: 'a',
      spec: {
        paramName: 'a',
        a1: 4,
        b1: { k: -1, c: 1 },
        c1: -1,
        a2: { k: 1, c: -1 },
        b2: -1,
        c2: 0.5,
        excludedParams: [1],
      },
      initK: -1,
    },
  ];

  const state = {
    presetId: 'ej12b',
    paramVal: 1,
  };

  const predictBox = createPredictBox({
    prompt:
      'Al mover el parámetro k en el sistema de Ej. 12b (kx + y = 7, (k + 2)x + ky = 14) con k ∈ ℝ − {0}, ¿cuántos valores críticos de k hacen que las rectas dejen de cruzarse?',
    options: [
      {
        label: 'Solo un valor (k = 2) y k = 0 también se clasifica como SCI.',
        correct: false,
        explanation:
          'k = 0 está excluido del dominio desde el enunciado, y la condición de paralelismo k² − k − 2 = 0 tiene dos raíces reales: k = 2 (SCI) y k = −1 (SI).',
      },
      {
        label: 'Dos valores críticos permitidos: k = 2 (da SCI, coincidentes) y k = −1 (da SI, paralelas separadas), además de k ≠ 0 por dominio.',
        correct: true,
        explanation:
          '¡Exacto! En k = 2 las dos ecuaciones son proporcionales (0 = 0, SCI); en k = −1 quedan paralelas separadas (0 = 21, SI); y k = 0 está prohibido por dominio.',
      },
      {
        label: 'Ninguno: siempre se cortan en un punto para cualquier k.',
        correct: false,
        explanation:
          'Cuando k² − k − 2 = 0 las pendientes coinciden y las rectas dejan de ser secantes.',
      },
    ],
    onVerify: () => {
      state.presetId = 'ej12b';
      state.paramVal = 2;
      sliderK.setValue(2);
      update();
    },
  });

  const presetsRow = h('div', { class: 'pr-presets' });
  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.presetId = pr.id;
      state.paramVal = pr.initK;
      sliderK.setValue(pr.initK);
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const snapRow = h('div', { class: 'pr-chip-row' });

  const sliderK = createSliderField({
    label: 'Parámetro k',
    min: -4,
    max: 4,
    step: 0.25,
    value: state.paramVal,
    formatValue: (v) => fmtNumberEsAR(v, 2),
    onInput: (val) => {
      state.paramVal = val;
      predictBox.notifyInteraction();
      update();
    },
  });

  const board = createSysBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Explorador de sistemas lineales con parámetro k y recta 1D de valores críticos',
  });
  // Dejamos espacio superior en pad o dibujamos la recta 1D arriba del plano
  const planeBox = { x: 42, y: 58, w: 614, h: 244 };
  const mapper = createCartesianMapper(planeBox, { xMin: -6, xMax: 6, yMin: -6, yMax: 10 });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 2 });

  // Strip 1D de parámetro en y = 12..46
  const stripGroup = s('g', { class: 'sys-param-strip' });
  const stripAxis = s('line', {
    x1: 60,
    y1: 28,
    x2: 620,
    y2: 28,
    stroke: 'rgba(236, 242, 232, 0.45)',
    'stroke-width': 2,
  });
  const stripMarkers = s('g', { class: 'sys-param-markers' });
  const stripCursor = s('circle', { r: 6.5, cy: 28, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const stripTitle = s('text', { x: 14, y: 32, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' }, 'k:');
  stripGroup.append(stripAxis, stripMarkers, stripCursor, stripTitle);

  const line1El = s('line', { stroke: 'var(--blue)', 'stroke-width': 2.7 });
  const line2El = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.7 });
  board.clippedLayer.append(line1El, line2El);

  const interDot = s('circle', { r: 6, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const interLabel = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });
  const statusBanner = s('text', { x: planeBox.x + 10, y: planeBox.y + 18, 'font-size': 12, 'font-weight': 'bold' });

  board.overlayLayer.append(stripGroup, interDot, interLabel, statusBanner);

  const readout = h('div', { class: 'pr-readout sys-readout', 'aria-live': 'polite' });

  const paramToX = (val) => 60 + ((val + 4) / 8) * (620 - 60);
  const xToParam = (px) => -4 + ((px - 60) / (620 - 60)) * 8;

  function renderSnapButtons(preset, analysis) {
    clear(snapRow);
    const pName = preset.paramName;
    const vals = new Set([-2, -1, 0, 1, 2, 3]);
    analysis.excludedParams.forEach((v) => vals.add(ratToNumber(v)));
    analysis.sciValues.forEach((v) => vals.add(ratToNumber(v)));
    analysis.siValues.forEach((v) => vals.add(ratToNumber(v)));

    [...vals]
      .sort((a, b) => a - b)
      .forEach((v) => {
        const isEx = analysis.excludedParams.some((e) => Math.abs(ratToNumber(e) - v) < 1e-6);
        const isSci = analysis.sciValues.some((e) => Math.abs(ratToNumber(e) - v) < 1e-6);
        const isSi = analysis.siValues.some((e) => Math.abs(ratToNumber(e) - v) < 1e-6);
        const tag = isEx ? ' (prohibido)' : isSci ? ' (SCI)' : isSi ? ' (SI)' : '';
        const btn = h(
          'button',
          {
            type: 'button',
            class: `pr-chip ${Math.abs(state.paramVal - v) < 1e-6 ? 'is-active' : ''}`,
          },
          `${pName} = ${fmtNumberEsAR(v, 0)}${tag}`
        );
        btn.addEventListener('click', () => {
          playClick();
          state.paramVal = v;
          sliderK.setValue(v);
          predictBox.notifyInteraction();
          update();
        });
        snapRow.appendChild(btn);
      });
  }

  function update() {
    const preset = PRESETS.find((p) => p.id === state.presetId) || PRESETS[0];
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === preset.id));

    const analysis = analyzeParametricSystem(preset.spec);
    renderSnapButtons(preset, analysis);
    stripTitle.textContent = `${preset.paramName}:`;

    // Actualiza marcadores en la recta 1D del parámetro
    clear(stripMarkers);
    for (let tick = -4; tick <= 4; tick += 1) {
      const tx = paramToX(tick);
      stripMarkers.appendChild(
        s('line', { x1: tx, y1: 24, x2: tx, y2: 32, stroke: 'rgba(236,242,232,0.35)', 'stroke-width': 1 })
      );
      stripMarkers.appendChild(
        s('text', { x: tx, y: 45, fill: 'var(--muted)', 'font-size': 10, 'text-anchor': 'middle' }, String(tick))
      );
    }
    analysis.excludedParams.forEach((ex) => {
      const cx = paramToX(ratToNumber(ex));
      stripMarkers.appendChild(s('circle', { cx, cy: 28, r: 5, fill: 'var(--bg)', stroke: 'var(--pink)', 'stroke-width': 2 }));
    });
    analysis.siValues.forEach((v) => {
      const cx = paramToX(ratToNumber(v));
      stripMarkers.appendChild(s('circle', { cx, cy: 28, r: 5, fill: 'var(--pink)' }));
    });
    analysis.sciValues.forEach((v) => {
      const cx = paramToX(ratToNumber(v));
      stripMarkers.appendChild(s('circle', { cx, cy: 28, r: 5, fill: 'var(--green)' }));
    });

    stripCursor.setAttribute('cx', clampPx(paramToX(state.paramVal), 60, 620).toFixed(1));
    stripCursor.setAttribute('aria-valuenow', String(state.paramVal));

    const res = analysis.evaluateAt(state.paramVal);
    if (res.excluded) {
      line1El.setAttribute('visibility', 'hidden');
      line2El.setAttribute('visibility', 'hidden');
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      statusBanner.setAttribute('fill', 'var(--pink)');
      statusBanner.textContent = `${preset.paramName} = ${fmtNumberEsAR(state.paramVal, 2)} EXCLUIDO DEL DOMINIO`;
      readout.replaceChildren(
        h('div', {}, [
          h('strong', { style: 'color: var(--pink)' }, `Valor prohibido por dominio: `),
          h('span', {}, res.reason),
        ]),
        h('div', { class: 'muted small' }, `Resumen global: SCD si ${analysis.scdCondition} · SCI: {${analysis.sciValues.map(fmtRat).join('; ') || '∅'}} · SI: {${analysis.siValues.map(fmtRat).join('; ') || '∅'}}`)
      );
      return;
    }

    line1El.setAttribute('visibility', 'visible');
    line2El.setAttribute('visibility', 'visible');

    const { line1, line2 } = res;
    if (line1) {
      const c1 = line1.canonical;
      const clip1 = clipLineToBox(ratToNumber(c1.A), ratToNumber(c1.B), ratToNumber(c1.C), mapper);
      if (clip1) {
        line1El.setAttribute('x1', mapper.toX(clip1.x1).toFixed(2));
        line1El.setAttribute('y1', mapper.toY(clip1.y1).toFixed(2));
        line1El.setAttribute('x2', mapper.toX(clip1.x2).toFixed(2));
        line1El.setAttribute('y2', mapper.toY(clip1.y2).toFixed(2));
      }
    }
    if (line2) {
      const c2 = line2.canonical;
      const clip2 = clipLineToBox(ratToNumber(c2.A), ratToNumber(c2.B), ratToNumber(c2.C), mapper);
      if (clip2) {
        line2El.setAttribute('x1', mapper.toX(clip2.x1).toFixed(2));
        line2El.setAttribute('y1', mapper.toY(clip2.y1).toFixed(2));
        line2El.setAttribute('x2', mapper.toX(clip2.x2).toFixed(2));
        line2El.setAttribute('y2', mapper.toY(clip2.y2).toFixed(2));
      }
    }

    if (res.status === 'SCD' && res.solution) {
      const ix = ratToNumber(res.solution.x);
      const iy = ratToNumber(res.solution.y);
      const inView = ix >= mapper.xMin && ix <= mapper.xMax && iy >= mapper.yMin && iy <= mapper.yMax;
      interDot.setAttribute('visibility', inView ? 'visible' : 'hidden');
      interLabel.setAttribute('visibility', inView ? 'visible' : 'hidden');
      if (inView) {
        const px = mapper.toX(ix);
        const py = mapper.toY(iy);
        interDot.setAttribute('cx', px.toFixed(1));
        interDot.setAttribute('cy', py.toFixed(1));
        interLabel.setAttribute('x', clampPx(px + 9, planeBox.x + 8, planeBox.x + planeBox.w - 110).toFixed(1));
        interLabel.setAttribute('y', clampPx(py - 8, planeBox.y + 14, planeBox.y + planeBox.h - 6).toFixed(1));
        interLabel.textContent = `(${fmtRat(res.solution.x)}; ${fmtRat(res.solution.y)})`;
      }
      statusBanner.setAttribute('fill', 'var(--green)');
      statusBanner.textContent = `SCD en ${preset.paramName} = ${fmtNumberEsAR(state.paramVal, 2)}`;
    } else if (res.status === 'SCI') {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      statusBanner.setAttribute('fill', 'var(--yellow)');
      statusBanner.textContent = `SCI en ${preset.paramName} = ${fmtNumberEsAR(state.paramVal, 2)} (coincidentes)`;
    } else {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
      statusBanner.setAttribute('fill', 'var(--pink)');
      statusBanner.textContent = `SI en ${preset.paramName} = ${fmtNumberEsAR(state.paramVal, 2)} (paralelas separadas)`;
    }

    readout.replaceChildren(
      h('div', {}, [
        h('strong', {}, `${preset.paramName} = ${fmtNumberEsAR(state.paramVal, 2)} ⇒ ${res.status} · `),
        h('span', {}, `S = ${res.solutionText}`),
      ]),
      h(
        'div',
        { class: 'muted small' },
        `Partición global: SCD si ${analysis.scdCondition} · SCI: {${analysis.sciValues.map(fmtRat).join('; ') || '∅'}} · SI: {${analysis.siValues.map(fmtRat).join('; ') || '∅'}}`
      )
    );
  }

  attachSvgDrag(
    board.svg,
    stripCursor,
    () => ({ fromX: xToParam, fromY: () => 0, toX: paramToX, toY: () => 28, xMin: -4, xMax: 4 }),
    ({ x }) => {
      state.paramVal = Math.max(-4, Math.min(4, Math.round(x * 4) / 4));
      sliderK.setValue(state.paramVal);
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Deslizar parámetro k sobre la recta real', stepX: 0.25, stepY: 0 }
  );

  host.replaceChildren(predictBox, presetsRow, snapRow, sliderK.root, board.svg, readout);
  update();
  return { board, update };
}
