/**
 * cultivo-amebas.js — Widget 2 (F14)
 * Simulación de bipartición celular y crecimiento exponencial con factor inicial k.
 * Compara f(t) = 2ᵗ (1 ameba) vs g(t) = 3 · 2ᵗ (3 amebas), explica el neutro a⁰ = 1,
 * y desarma visualmente la falacia 3 · 2ᵗ ≠ 6ᵗ.
 */

import {
  createBoard,
  createPredictBox,
  createStore,
  addChips,
  addRange,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';

export function initWidget(container, options = {}) {
  const board = createBoard(container, 'Cultivo de Amebas: Duplicación Celular', '0 0 640 340');

  const store = createStore({
    t: options.t !== undefined ? options.t : 2,
    mode: options.mode || 'both', // 1 | 3 | 'both'
    showFallacy: false,
  });

  // 0. Predict-Observe-Explain
  const predictBox = createPredictBox({
    prompt: 'En un cultivo con f(t) = 3 · 2ᵗ amebas, ¿cuántas amebas habrá a las 2 horas?',
    options: [
      {
        label: '36 amebas, porque 3 · 2 = 6 y 6² = 36',
        correct: false,
        explanation: '¡Colapso algebraico! La potencia tiene prioridad: 2² = 4, y 3 · 4 = 12 amebas.',
      },
      {
        label: '12 amebas, porque 2² = 4 y 3 · 4 = 12',
        correct: true,
        explanation: '¡Exacto! El coeficiente inicial k = 3 espera afuera y multiplica al final.',
      },
    ],
    onVerify: () => {
      store.set({ t: 2 });
      timeSlider.value = '2';
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controls
  const modeOptions = [
    [1, '1 ameba: 2ᵗ'],
    [3, '3 amebas: 3 · 2ᵗ'],
    ['both', 'Comparar 1 vs 3 amebas'],
  ];
  const updateModeChips = addChips(
    board.controls,
    modeOptions,
    store.get().mode,
    (m) => store.set({ mode: m }),
    'Experimento',
  );

  const fallacyOptions = [
    [false, 'Curvas reales'],
    [true, 'Desarmar trampa 6ᵗ (colapso)'],
  ];
  const updateFallacyChips = addChips(
    board.controls,
    fallacyOptions,
    store.get().showFallacy,
    (f) => store.set({ showFallacy: f }),
    'Trampa de Examen',
  );

  const { input: timeSlider } = addRange(
    board.controls,
    store,
    't',
    'Tiempo transcurrido (horas)',
    0,
    10,
    store.get().t,
    1,
    (v) => `${v} h`,
  );

  // 2. SVG Scene Layout
  // Left: Petri Dish (x: 20 to 240)
  // Right: Coordinate Growth Graph (x: 270 to 620)
  const scene = board.drawing;

  // Petri dish background & glass ring
  const dishGroup = s('g', { class: 'exp-petri-dish' });
  scene.append(dishGroup);

  const dishCenterX = 130;
  const dishCenterY = 170;
  const dishRadius = 100;

  dishGroup.append(
    // Glass outer lip
    s('circle', {
      cx: dishCenterX,
      cy: dishCenterY,
      r: dishRadius + 6,
      fill: 'none',
      stroke: 'var(--border)',
      'stroke-width': 4,
      opacity: 0.5,
    }),
    // Agar nutrient gel
    s('circle', {
      cx: dishCenterX,
      cy: dishCenterY,
      r: dishRadius,
      fill: 'rgba(174, 209, 162, 0.08)',
      stroke: 'var(--border)',
      'stroke-width': 1.5,
    }),
    // Title label
    s('text', {
      x: dishCenterX,
      y: 35,
      class: 'exp-svg-label',
      'text-anchor': 'middle',
      'font-weight': 'bold',
      fill: 'var(--accent)',
    }, 'Plato de Petri (Microscopio)'),
  );

  // Container for amoeba cells in dish (instantiate persistent cells)
  const amoebaGroup = s('g', { class: 'exp-amoeba-cells' });
  dishGroup.append(amoebaGroup);

  // Max 48 visible amoeba dots to prevent visual overcrowding
  const maxCells = 64;
  const cellNodes = [];
  for (let i = 0; i < maxCells; i++) {
    // Generate pseudo-organic distributed points
    const angle = (i * 137.5 * Math.PI) / 180;
    const r = Math.min(dishRadius - 15, 12 * Math.sqrt(i + 1));
    const cx = dishCenterX + r * Math.cos(angle);
    const cy = dishCenterY + r * Math.sin(angle);

    const cell = s('circle', {
      cx: cx.toFixed(1),
      cy: cy.toFixed(1),
      r: 4.5,
      fill: 'var(--blue)',
      stroke: 'var(--bg)',
      'stroke-width': 1.5,
      opacity: 0.9,
    });
    amoebaGroup.append(cell);
    cellNodes.push(cell);
  }

  // Right: Coordinate Growth Graph
  const graphGroup = s('g', { class: 'exp-ameba-graph' });
  scene.append(graphGroup);

  const graphX = 270;
  const graphY = 35;
  const graphW = 350;
  const graphH = 265;

  // Graph background
  graphGroup.append(
    s('rect', {
      x: graphX,
      y: graphY,
      width: graphW,
      height: graphH,
      fill: 'rgba(0, 0, 0, 0.2)',
      stroke: 'var(--border)',
      rx: 6,
    }),
  );

  // Axes ticks and grid
  const yMax = 100;
  const tMax = 10;

  const mapT = (t) => graphX + 40 + (t / tMax) * (graphW - 60);
  const mapY = (y) => graphY + graphH - 30 - (Math.min(y, yMax) / yMax) * (graphH - 50);

  // Grid lines
  for (let t = 0; t <= tMax; t++) {
    const gx = mapT(t);
    graphGroup.append(
      s('line', {
        x1: gx,
        y1: graphY + 10,
        x2: gx,
        y2: graphY + graphH - 25,
        stroke: 'var(--border)',
        opacity: 0.25,
      }),
      s('text', {
        x: gx,
        y: graphY + graphH - 10,
        class: 'exp-svg-label',
        'text-anchor': 'middle',
        'font-size': '11px',
      }, `${t}h`),
    );
  }

  for (let v = 0; v <= yMax; v += 25) {
    const gy = mapY(v);
    graphGroup.append(
      s('line', {
        x1: graphX + 35,
        y1: gy,
        x2: graphX + graphW - 15,
        y2: gy,
        stroke: 'var(--border)',
        opacity: 0.25,
      }),
      s('text', {
        x: graphX + 30,
        y: gy + 4,
        class: 'exp-svg-label',
        'text-anchor': 'end',
        'font-size': '11px',
      }, String(v)),
    );
  }

  // Curve 1: f(t) = 2^t (Blue)
  const curve1 = s('path', {
    fill: 'none',
    stroke: 'var(--blue)',
    'stroke-width': 2.5,
  });
  // Curve 3: g(t) = 3 * 2^t (Yellow)
  const curve3 = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  // Fallacy Curve: h(t) = 6^t (Pink dashed)
  const curveFallacy = s('path', {
    fill: 'none',
    stroke: 'var(--pink)',
    'stroke-width': 2,
    'stroke-dasharray': '5 4',
  });

  graphGroup.append(curve1, curve3, curveFallacy);

  // Time tracker vertical probe line
  const timeProbeLine = s('line', {
    x1: 0,
    y1: graphY + 10,
    x2: 0,
    y2: graphY + graphH - 25,
    stroke: 'var(--accent)',
    'stroke-dasharray': '3 3',
    'stroke-width': 1.5,
  });
  graphGroup.append(timeProbeLine);

  // Point markers at current t
  const pt1 = s('circle', { r: 6, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const pt3 = s('circle', { r: 6, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const ptFallacy = s('circle', { r: 6, fill: 'var(--pink)', stroke: 'var(--bg)', 'stroke-width': 2 });
  graphGroup.append(pt1, pt3, ptFallacy);

  // Floating label badges for points
  const label1 = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--blue)' }, '');
  const label3 = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--yellow)' }, '');
  const labelFallacy = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--pink)' }, '');
  graphGroup.append(label1, label3, labelFallacy);

  // Pre-generate curve paths
  const samples = 80;
  const path1 = [];
  const path3 = [];
  const pathF = [];
  for (let sIdx = 0; sIdx <= samples; sIdx++) {
    const curT = (sIdx / samples) * tMax;
    const yVal1 = Math.pow(2, curT);
    const yVal3 = 3 * Math.pow(2, curT);
    const yValF = Math.pow(6, curT);

    const sx = mapT(curT).toFixed(1);
    path1.push(`${sIdx === 0 ? 'M' : 'L'} ${sx} ${mapY(yVal1).toFixed(1)}`);
    path3.push(`${sIdx === 0 ? 'M' : 'L'} ${sx} ${mapY(yVal3).toFixed(1)}`);
    if (yValF <= yMax * 1.5) {
      pathF.push(`${pathF.length === 0 ? 'M' : 'L'} ${sx} ${mapY(yValF).toFixed(1)}`);
    }
  }
  curve1.setAttribute('d', path1.join(' '));
  curve3.setAttribute('d', path3.join(' '));
  curveFallacy.setAttribute('d', pathF.join(' '));

  // 3. Render pipeline
  const render = (state) => {
    updateModeChips(state.mode);
    updateFallacyChips(state.showFallacy);
    timeSlider.value = String(state.t);

    const t = state.t;
    const y1 = Math.pow(2, t);
    const y3 = 3 * Math.pow(2, t);
    const yF = Math.pow(6, t);

    // Visibility of curves based on mode
    const show1 = state.mode === 1 || state.mode === 'both';
    const show3 = state.mode === 3 || state.mode === 'both';
    const showF = state.showFallacy;

    setVisible(curve1, show1);
    setVisible(curve3, show3);
    setVisible(curveFallacy, showF);

    // Update time probe line
    const px = mapT(t);
    timeProbeLine.setAttribute('x1', String(px));
    timeProbeLine.setAttribute('x2', String(px));

    const isOver3 = y3 > yMax;
    const isOverF = yF > yMax;

    const text1 = `2^${t} = ${y1}`;
    const text3 = isOver3 ? `↑ 3·2^${t} = ${y3} (fuera de escala)` : `3·2^${t} = ${y3}`;
    const textF = isOverF ? `↑ 6^${t} = ${yF} (fuera de escala)` : `6^${t} = ${yF}`;

    const anchorRight = px > 540;
    const labelX = anchorRight ? String(px - 10) : String(px + 8);
    const textAnchor = anchorRight ? 'end' : 'start';

    const py1 = mapY(y1);
    const py3 = mapY(y3);
    const pyF = mapY(yF);

    let pyLabel1 = py1 - 6;
    let pyLabel3 = py3 - 6;
    let pyLabelF = pyF - 6;

    if (show1 && show3 && Math.abs(py1 - py3) < 16) {
      pyLabel1 = py1 + 14;
      pyLabel3 = py3 - 6;
    }

    if (isOver3 && isOverF) {
      pyLabel3 = py3 - 6;
      pyLabelF = pyF + 14;
    } else if (show3 && showF && Math.abs(py3 - pyF) < 16) {
      pyLabel3 = py3 - 6;
      pyLabelF = pyF + 14;
    }

    // Update point 1
    if (show1) {
      setVisible(pt1, true);
      setVisible(label1, true);
      pt1.setAttribute('cx', String(px));
      pt1.setAttribute('cy', String(py1));
      label1.setAttribute('x', labelX);
      label1.setAttribute('y', String(pyLabel1));
      label1.setAttribute('text-anchor', textAnchor);
      setText(label1, text1);
    } else {
      setVisible(pt1, false);
      setVisible(label1, false);
    }

    // Update point 3
    if (show3) {
      setVisible(pt3, true);
      setVisible(label3, true);
      pt3.setAttribute('cx', String(px));
      pt3.setAttribute('cy', String(py3));
      label3.setAttribute('x', labelX);
      label3.setAttribute('y', String(pyLabel3));
      label3.setAttribute('text-anchor', textAnchor);
      setText(label3, text3);
    } else {
      setVisible(pt3, false);
      setVisible(label3, false);
    }

    // Update fallacy point
    if (showF) {
      setVisible(ptFallacy, true);
      setVisible(labelFallacy, true);
      ptFallacy.setAttribute('cx', String(px));
      ptFallacy.setAttribute('cy', String(pyF));
      labelFallacy.setAttribute('x', labelX);
      labelFallacy.setAttribute('y', String(pyLabelF));
      labelFallacy.setAttribute('text-anchor', textAnchor);
      setText(labelFallacy, textF);
    } else {
      setVisible(ptFallacy, false);
      setVisible(labelFallacy, false);
    }

    // Update petri dish cells
    const effectiveCount = state.mode === 1 ? y1 : y3;
    const clampedCount = Math.min(maxCells, effectiveCount);

    cellNodes.forEach((cell, idx) => {
      if (idx < clampedCount) {
        setVisible(cell, true);
        if (state.mode === 3 || state.mode === 'both') {
          // Tint in 3 distinct shades to show the 3 independent colonies
          const colony = idx % 3;
          cell.setAttribute('fill', colony === 0 ? 'var(--blue)' : colony === 1 ? 'var(--yellow)' : 'var(--green)');
        } else {
          cell.setAttribute('fill', 'var(--blue)');
        }
      } else {
        setVisible(cell, false);
      }
    });

    // Readout content
    const rows = [];
    if (t === 0) {
      rows.push([
        'Neutro Multiplicativo a⁰ = 1',
        'En t = 0 h: f(0) = 2⁰ = 1 ameba, y g(0) = 3 · 2⁰ = 3 · 1 = 3 amebas. La ordenada al origen revela siempre la cantidad inicial k.',
      ]);
    } else {
      rows.push([
        `Población a las ${t} horas`,
        `1 colonia: 2^${t} = ${y1} amebas | 3 colonias: 3 · 2^${t} = ${y3} amebas.`,
      ]);
    }

    if (showF) {
      const discrepancy = Math.round(yF / y3);
      if (t === 1) {
        rows.push([
          '¡Coincidencia engañosa en t = 1!',
          'En t = 1: 3 · 2¹ = 6 y 6¹ = 6 coinciden accidentalmente. Pero mirá qué pasa en t = 2...',
        ]);
      } else {
        rows.push([
          'Desarme de la Falacia: 3 · 2ᵗ ≠ 6ᵗ',
          `En t = ${t}: 3 · 2^${t} = ${y3}, pero (3·2)^${t} = 6^${t} = ${yF}. ¡La trampa sobrestima la población real por un factor de ${discrepancy}x!`,
        ]);
      }
    } else {
      rows.push([
        'Principio Biológico',
        'Las 3 colonias se dividen en paralelo. Jamás multipliques el 3 por la base 2: la potencia precede a la multiplicación exterior.',
      ]);
    }

    renderReadout(board.readout, 'Monitoreo del Cultivo', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ t: 2, mode: 'both', showFallacy: false }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initCultivoAmebasWidget };
