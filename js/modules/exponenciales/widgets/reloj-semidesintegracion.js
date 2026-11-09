/**
 * reloj-semidesintegracion.js — Widget 7 (F19)
 * Modelos temporales del mundo real con tasas porcentuales (a = 1 ± r),
 * períodos compuestos (t/T) y base natural e (e^(kt)).
 * Cubre Talio radiactivo, Población, Cultivo bacteriano, Isótopo y Concentración de Fármaco.
 */

import {
  createCartesianBoard,
  createPredictBox,
  createStore,
  addChips,
  addRange,
  button,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';

const PRESETS = {
  talio: {
    label: 'Talio-206 (Desintegración)',
    name: 'Talio radiactivo',
    unitT: 'min',
    unitY: 'g',
    y0: 50,
    fn: (t) => 50 * Math.pow(0.5, t / 3),
    formulaStr: 'M(t) = 50 · (1/2)^(t/3)',
    tMax: 30,
    tStep: 1,
    targetT: 30,
    targetNote: 'A los 30 min (10 vidas medias): M(30) = 50 · (1/2)¹⁰ = 50/1024 ≈ 0,049 g.',
  },
  poblacion: {
    label: 'Población (+12% anual)',
    name: 'Crecimiento de población',
    unitT: 'años',
    unitY: 'M hab.',
    y0: 55,
    fn: (t) => 55 * Math.pow(1.12, t / 5),
    formulaStr: 'P(t) = 55 · (1,12)^(t/5)',
    tMax: 50,
    tStep: 5,
    targetT: 50,
    targetNote: 'A los 50 años (10 ciclos de 5 años): P(50) = 55 · (1,12)¹⁰ ≈ 170,82 millones.',
  },
  bacterias: {
    label: 'Bacterias (+3,5% cada 10h)',
    name: 'Cultivo bacteriano',
    unitT: 'horas',
    unitY: 'g',
    y0: 132.36,
    fn: (t) => 132.36 * Math.pow(1.035, t / 10),
    formulaStr: 'P(t) = 132,36 · (1,035)^(t/10)',
    tMax: 120,
    tStep: 10,
    targetT: 120,
    targetNote: 'A las 120 h (5 días = 12 ciclos de 10 h): P(120) = 200 g exactos.',
  },
  isotopo_e: {
    label: 'Isótopo (Base natural e)',
    name: 'Desintegración continua',
    unitT: 'horas',
    unitY: 'mg',
    y0: 120,
    fn: (t) => 120 * Math.exp(-0.05 * t),
    formulaStr: 'A(t) = 120 · e^(−0,05t)',
    tMax: 40,
    tStep: 2,
    targetT: 20,
    targetNote: 'A las 20 h: A(20) = 120 · e⁻¹ ≈ 44,15 mg.',
  },
  vacuna: {
    label: 'Concentración de Fármaco',
    name: 'Concentración en sangre',
    unitT: 'horas',
    unitY: 'mg',
    y0: 200,
    fn: (t) => 200 * Math.exp(-0.3 * t),
    formulaStr: 'C(t) = 200 · e^(−0,3t)',
    tMax: 15,
    tStep: 1,
    targetT: 5,
    targetNote: 'A las 5 h: C(5) = 200 · e^(−1,5) ≈ 44,63 mg.',
  },
};

function rebuildPlaneGridAndAxes(plane, unitT, unitY) {
  plane.clear('grid', 'axes', 'axisLabels');

  const c = plane.cfg;
  const W = c.width, H = c.height, P = c.pad;
  const pw = W - P.l - P.r, ph = H - P.t - P.b;

  function ticks(min, max, step) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0) return [];
    let effStep = step;
    if ((max - min) / effStep > 40) {
      effStep = Math.max(1e-6, (max - min) / 8);
    }
    const out = [];
    const start = Math.ceil(min / effStep) * effStep;
    for (let t = start; t <= max + 1e-9 && out.length < 50; t += effStep) out.push(Number(t.toFixed(6)));
    return out;
  }

  const xTicks = ticks(c.xMin, c.xMax, c.xStep);
  const yTicks = ticks(c.yMin, c.yMax, c.yStep);

  // Re-trazar grilla
  xTicks.forEach((t) => {
    plane.layers.grid.append(
      s('line', {
        x1: plane.sx(t),
        y1: P.t,
        x2: plane.sx(t),
        y2: P.t + ph,
        class: 'plot-grid',
      }),
    );
  });
  yTicks.forEach((t) => {
    plane.layers.grid.append(
      s('line', {
        x1: P.l,
        y1: plane.sy(t),
        x2: P.l + pw,
        y2: plane.sy(t),
        class: 'plot-grid',
      }),
    );
  });

  // Re-trazar ejes y flechas
  const xAxisY = plane.sy(0);
  const yAxisX = plane.sx(0);
  plane.layers.axes.append(
    s('line', {
      x1: P.l,
      y1: xAxisY,
      x2: P.l + pw + 8,
      y2: xAxisY,
      class: 'plot-axis',
      'marker-end': `url(#${plane.arrowId})`,
    }),
    s('line', {
      x1: yAxisX,
      y1: P.t + ph,
      x2: yAxisX,
      y2: P.t - 8,
      class: 'plot-axis',
      'marker-end': `url(#${plane.arrowId})`,
    }),
  );

  // Re-trazar etiquetas de ejes
  plane.layers.axisLabels.append(
    s('text', { x: P.l + pw + 6, y: xAxisY - 8, class: 'plot-axis-label', 'text-anchor': 'end' }, unitT ? `t (${unitT})` : 't'),
    s('text', { x: yAxisX + 8, y: P.t + 4, class: 'plot-axis-label' }, unitY ? `y (${unitY})` : 'y'),
  );

  // Re-trazar números de ticks y marcas
  xTicks.forEach((t) => {
    plane.layers.axes.append(
      s('line', { x1: plane.sx(t), y1: xAxisY - 3, x2: plane.sx(t), y2: xAxisY + 3, class: 'plot-axis' }),
    );
    plane.layers.axisLabels.append(
      s('text', { x: plane.sx(t), y: xAxisY + 20, class: 'plot-tick', 'text-anchor': 'middle' }, fmt(t)),
    );
  });
  yTicks.forEach((t) => {
    if (Math.abs(t) < 1e-9) return;
    plane.layers.axes.append(
      s('line', { x1: yAxisX - 3, y1: plane.sy(t), x2: yAxisX + 3, y2: plane.sy(t), class: 'plot-axis' }),
    );
    plane.layers.axisLabels.append(
      s('text', { x: yAxisX - 8, y: plane.sy(t) + 4, class: 'plot-tick', 'text-anchor': 'end' }, fmt(t)),
    );
  });
}

export function initWidget(container, options = {}) {
  const defaultPreset = options.preset || 'talio';
  const initialModel = PRESETS[defaultPreset] || PRESETS.talio;

  const board = createCartesianBoard(
    container,
    'Reloj de Semidesintegración y Modelos Temporales',
    {
      width: 640,
      height: 340,
      pad: { l: 52, r: 92, t: 22, b: 36 },
      xMin: 0,
      xMax: initialModel.tMax,
      yMin: 0,
      yMax: initialModel.y0 * 1.25,
      xStep: initialModel.tMax / 5,
      yStep: initialModel.y0 / 4,
    },
  );

  const plane = board.plane;

  const store = createStore({
    presetKey: defaultPreset,
    t: 0,
  });

  // 0. Predict-Observe-Explain
  const predictBox = createPredictBox({
    prompt: 'Una muestra de 50 g de talio tiene vida media T = 3 min. A los 30 min, ¿cuántos ciclos de decaimiento ocurrieron?',
    options: [
      {
        label: '90 ciclos, porque 30 · 3 = 90',
        correct: false,
        explanation: '¡Trampa de escala temporal! El tiempo total transcurrido se divide por la duración de cada ciclo: 30 / 3 = 10 ciclos.',
      },
      {
        label: '10 ciclos, porque 30 / 3 = 10',
        correct: true,
        explanation: '¡Exacto! El exponente t/T divide el tiempo por el período para contar cuántas veces se dividió a la mitad.',
      },
    ],
    onVerify: () => {
      store.set({ presetKey: 'talio', t: 30 });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controls
  const presetOptions = Object.entries(PRESETS).map(([k, p]) => [k, p.label]);
  const updatePresetChips = addChips(
    board.controls,
    presetOptions,
    store.get().presetKey,
    (key) => {
      const nextModel = PRESETS[key] || PRESETS.talio;
      // Reconfigure plane limits
      plane.cfg.xMax = nextModel.tMax;
      plane.cfg.yMax = nextModel.y0 * (key === 'poblacion' || key === 'bacterias' ? 3.3 : 1.25);
      plane.cfg.xStep = nextModel.tMax / 5;
      plane.cfg.yStep = plane.cfg.yMax / 4;
      timeSlider.max = String(nextModel.tMax);
      timeSlider.step = String(nextModel.tStep);
      rebuildPlaneGridAndAxes(plane, nextModel.unitT, nextModel.unitY);
      store.set({ presetKey: key, t: 0 });
    },
    'Modelos Temporales Canónicos',
  );

  const { input: timeSlider, output: timeOutput } = addRange(
    board.controls,
    store,
    't',
    'Tiempo transcurrido t',
    0,
    initialModel.tMax,
    store.get().t,
    initialModel.tStep,
    (v) => `${v} ${initialModel.unitT}`,
  );

  timeSlider.addEventListener('input', () => {
    const curModel = PRESETS[store.get().presetKey] || PRESETS.talio;
    timeOutput.textContent = `${timeSlider.value} ${curModel.unitT}`;
  });

  // Target Button
  const targetBtn = button('Ir al punto clave', 'target', () => {
    const curModel = PRESETS[store.get().presetKey];
    store.set({ t: curModel.targetT });
  });
  board.actions.append(targetBtn);

  // 2. SVG Elements
  // Curve path
  const curvePath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  plane.layers.curve.append(curvePath);

  // Time tracker line
  const timeLine = s('line', {
    x1: 0,
    y1: plane.sy(0),
    x2: 0,
    y2: plane.sy(initialModel.y0 * 1.2),
    stroke: 'var(--accent)',
    'stroke-dasharray': '3 3',
    'stroke-width': 1.5,
  });
  // Point marker
  const ptCurrent = s('circle', {
    r: 6,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const labelCurrent = s('text', {
    class: 'exp-svg-label',
    'font-size': '11px',
    'font-weight': 'bold',
    fill: 'var(--yellow)',
  }, '');
  plane.layers.marks.append(timeLine, ptCurrent, labelCurrent);

  // Right-side Level Gauge / Tank (x in [580, 620])
  const gaugeGroup = s('g', { class: 'exp-level-gauge' });
  const gaugeX = 575;
  const gaugeY = 45;
  const gaugeW = 38;
  const gaugeH = 220;

  gaugeGroup.append(
    // Frame
    s('rect', {
      x: gaugeX,
      y: gaugeY,
      width: gaugeW,
      height: gaugeH,
      fill: 'rgba(0, 0, 0, 0.3)',
      stroke: 'var(--border)',
      rx: 6,
    }),
  );

  // Liquid / Fill bar
  const gaugeFill = s('rect', {
    x: gaugeX + 3,
    y: gaugeY + gaugeH - 3,
    width: gaugeW - 6,
    height: 0,
    fill: 'var(--blue)',
    rx: 4,
    opacity: 0.8,
  });
  const gaugePercent = s('text', {
    x: gaugeX + gaugeW / 2,
    y: gaugeY + gaugeH + 16,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '11px',
    fill: 'var(--text)',
  }, '');
  const gaugeTitle = s('text', {
    x: gaugeX + gaugeW / 2,
    y: gaugeY - 10,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '11px',
    'font-weight': 'bold',
    fill: 'var(--accent)',
  }, 'Masa');

  gaugeGroup.append(gaugeFill, gaugePercent, gaugeTitle);
  plane.layers.marks.append(gaugeGroup);

  // 3. Render pipeline
  const render = (state) => {
    updatePresetChips(state.presetKey);
    const model = PRESETS[state.presetKey] || PRESETS.talio;

    timeSlider.max = String(model.tMax);
    timeSlider.step = String(model.tStep);
    timeSlider.value = String(state.t);
    timeOutput.textContent = `${state.t} ${model.unitT}`;

    const t = state.t;
    const yVal = model.fn(t);

    // Update curve
    const pathD = plane.fnPath((val) => model.fn(val), 0, model.tMax, { samples: 100 });
    curvePath.setAttribute('d', pathD);

    // Update tracker
    const sx = plane.sx(t);
    const sy = plane.sy(yVal);
    const syBase = plane.sy(0);

    timeLine.setAttribute('x1', String(sx));
    timeLine.setAttribute('y1', String(syBase));
    timeLine.setAttribute('x2', String(sx));
    timeLine.setAttribute('y2', String(sy));

    ptCurrent.setAttribute('cx', String(sx));
    ptCurrent.setAttribute('cy', String(sy));

    const isNearEnd = sx > plane.sx(model.tMax) - 70;
    labelCurrent.setAttribute('x', String(isNearEnd ? sx - 8 : sx + 8));
    labelCurrent.setAttribute('text-anchor', isNearEnd ? 'end' : 'start');
    labelCurrent.setAttribute('y', String(Math.max(plane.box.y + 16, sy - 8)));
    setText(labelCurrent, `${fmt(yVal)} ${model.unitY}`);

    // Update level gauge
    const ratio = Math.max(0, Math.min(1.5, yVal / model.y0));
    const fillH = Math.min(gaugeH - 6, (gaugeH - 6) * (ratio > 1 ? 1 : ratio));
    gaugeFill.setAttribute('y', String(gaugeY + gaugeH - 3 - fillH));
    gaugeFill.setAttribute('height', String(fillH));
    gaugeFill.setAttribute('fill', ratio < 0.2 ? 'var(--pink)' : ratio > 1 ? 'var(--yellow)' : 'var(--blue)');
    setText(gaugePercent, `${fmt(ratio * 100)}%`);
    setText(gaugeTitle, model.unitY);

    // Readout
    const rows = [
      ['Modelo Matemático', `${model.formulaStr} (${model.name})`],
      [
        `Instante t = ${t} ${model.unitT}`,
        `Cantidad remanente / actual: ${fmt(yVal)} ${model.unitY} (${fmt(ratio * 100)}% respecto al valor inicial ${model.y0} ${model.unitY}).`,
      ],
      ['Punto Clave', model.targetNote],
    ];
    renderReadout(board.readout, 'Análisis del Modelo Temporal', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => {
      const model = PRESETS.talio;
      plane.cfg.xMax = model.tMax;
      plane.cfg.yMax = model.y0 * 1.25;
      plane.cfg.xStep = model.tMax / 5;
      plane.cfg.yStep = model.y0 / 4;
      timeSlider.max = String(model.tMax);
      timeSlider.step = String(model.tStep);
      rebuildPlaneGridAndAxes(plane, model.unitT, model.unitY);
      store.set({ presetKey: 'talio', t: 0 });
    },
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initRelojSemidesintegracionWidget };
