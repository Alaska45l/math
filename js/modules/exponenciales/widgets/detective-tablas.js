/**
 * detective-tablas.js — Widget 1 (F13)
 * Comparación interactiva de tablas: Lineal vs Exponencial vs Cuadrática.
 * Incluye los casos canónicos de Khan Academy y cátedra de Exactas UNMDP.
 */

import {
  createBoard,
  createStore,
  addChips,
  addRange,
  renderReadout,
  fmt,
  MINUS,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { classifyTable } from '../logic.js';

const PRESETS = {
  khan_linear: {
    label: '1. Lineal (Khan Δx = 3)',
    xs: [12, 15, 18, 21],
    ys: [-2, 5, 12, 19],
    model: 'Lineal: y = (7/3)x − 30',
    type: 'linear',
    note: 'El paso horizontal es Δx = +3 constante y las diferencias son Δy = +7 constantes. Pendiente m = 7/3.',
  },
  khan_exp: {
    label: '2. Exponencial (Khan ×3)',
    xs: [0, 1, 2, 3],
    ys: [1, 3, 9, 27],
    model: 'Exponencial: y = 1 · 3ˣ',
    type: 'exponential',
    note: 'El paso horizontal es Δx = +1 y las razones consecutivas son yᵢ₊₁/yᵢ = 3 constantes.',
  },
  khan_quad: {
    label: '3. Cuadrática (Khan Δ²y = 2)',
    xs: [2, 4, 6, 8],
    ys: [4, 9, 16, 25],
    model: 'Cuadrática: y = (x/2 + 1)²',
    type: 'quadratic',
    note: 'Las diferencias crecen (+5, +7, +9), pero las segundas diferencias son constantes (+2). No es exponencial.',
  },
  exactas_dup: {
    label: '4. Duplicación (Exactas 2ˣ⁺¹)',
    xs: [0, 1, 2, 3],
    ys: [2, 4, 8, 16],
    model: 'Exponencial: y = 2 · 2ˣ',
    type: 'exponential',
    note: 'Razón multiplicativa ×2 fija con ancla en f(0) = 2. Cada hora se duplica la población.',
  },
  constant: {
    label: '5. Constante (y = 4)',
    xs: [0, 1, 2, 3],
    ys: [4, 4, 4, 4],
    model: 'Lineal degenerada: y = 4',
    type: 'constant',
    note: 'Diferencia Δy = 0 fija. No es exponencial porque la base unitaria a = 1 está prohibida en ℝ.',
  },
};

export function initWidget(container, options = {}) {
  const board = createBoard(container, 'Detective de Tablas: Lineal vs Exponencial', '0 0 640 340');

  const store = createStore({
    presetKey: options.preset || 'khan_exp',
    analysisMode: 'all', // 'diff' | 'ratio' | 'second_diff' | 'all'
    revealedRows: 4,     // 2 a 4
  });

  // 1. Controls
  const presetOptions = Object.entries(PRESETS).map(([k, p]) => [k, p.label]);
  const updatePresetChips = addChips(
    board.controls,
    presetOptions,
    store.get().presetKey,
    (key) => store.set({ presetKey: key }),
    'Datasets Canónicos',
  );

  const modeOptions = [
    ['diff', '1. Diferencias Δy'],
    ['ratio', '2. Razones yᵢ₊₁/yᵢ'],
    ['second_diff', '3. Segundas difs Δ²y'],
    ['all', 'Ver análisis completo'],
  ];
  const updateModeChips = addChips(
    board.controls,
    modeOptions,
    store.get().analysisMode,
    (mode) => store.set({ analysisMode: mode }),
    'Herramienta Analítica',
  );

  const { input: rangeInput } = addRange(
    board.controls,
    store,
    'revealedRows',
    'Puntos visibles en la tabla',
    2,
    4,
    store.get().revealedRows,
    1,
    (v) => `${v} puntos`,
  );

  // 2. SVG Scene Setup (Left: Table + Arcs, Right: Mini Coordinate Plane)
  const scene = board.drawing;

  // Background divider
  scene.append(
    s('line', {
      x1: 310,
      y1: 15,
      x2: 310,
      y2: 325,
      stroke: 'var(--border)',
      'stroke-dasharray': '4 4',
      opacity: 0.6,
    }),
  );

  // Left panel table structure
  const tableGroup = s('g', { class: 'exp-detective-table' });
  scene.append(tableGroup);

  // Table header box
  tableGroup.append(
    s('rect', {
      x: 20,
      y: 20,
      width: 170,
      height: 36,
      fill: 'rgba(255, 255, 255, 0.05)',
      stroke: 'var(--border)',
      rx: 6,
    }),
    s('text', { x: 55, y: 44, class: 'exp-svg-label', 'font-weight': 'bold', fill: 'var(--accent)' }, 'x'),
    s('text', { x: 135, y: 44, class: 'exp-svg-label', 'font-weight': 'bold', fill: 'var(--accent)' }, 'y'),
  );

  // 4 rows in table
  const rowNodes = [];
  for (let i = 0; i < 4; i++) {
    const yPos = 85 + i * 55;
    const bgRect = s('rect', {
      x: 20,
      y: yPos - 22,
      width: 170,
      height: 44,
      fill: i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
      rx: 4,
    });
    const xText = s('text', { x: 55, y: yPos + 6, class: 'exp-svg-label', 'text-anchor': 'middle' }, '');
    const yText = s('text', { x: 135, y: yPos + 6, class: 'exp-svg-label', 'text-anchor': 'middle', 'font-weight': 'bold' }, '');
    tableGroup.append(bgRect, xText, yText);
    rowNodes.push({ bgRect, xText, yText, yPos });
  }

  // 3 Step Arcs & Badges (Connecting row i to i+1)
  const arcNodes = [];
  for (let i = 0; i < 3; i++) {
    const yStart = rowNodes[i].yPos;
    const yEnd = rowNodes[i + 1].yPos;
    const yMid = (yStart + yEnd) / 2;

    const path = s('path', {
      d: `M 175 ${yStart} Q 215 ${yMid} 175 ${yEnd}`,
      fill: 'none',
      stroke: 'var(--yellow)',
      'stroke-width': 2,
    });
    const badgeBg = s('rect', {
      x: 205,
      y: yMid - 13,
      width: 85,
      height: 26,
      fill: 'var(--panel)',
      stroke: 'var(--yellow)',
      rx: 13,
    });
    const badgeText = s('text', {
      x: 247,
      y: yMid + 4,
      class: 'exp-svg-label',
      'text-anchor': 'middle',
      'font-size': '12px',
      fill: 'var(--text)',
    }, '');

    // Second difference arc (outer, connecting step 0-1 with 1-2)
    const arcGroup = s('g', { class: 'exp-detective-step' });
    arcGroup.append(path, badgeBg, badgeText);
    tableGroup.append(arcGroup);
    arcNodes.push({ arcGroup, path, badgeBg, badgeText });
  }

  // Second difference badge (between arcs 0 and 1)
  const secDiffGroup = s('g', { class: 'exp-detective-sec-diff' });
  const secPath = s('path', {
    d: 'M 285 112 Q 310 140 285 168',
    fill: 'none',
    stroke: 'var(--pink)',
    'stroke-width': 2,
  });
  const secBadgeBg = s('rect', {
    x: 245,
    y: 195,
    width: 60,
    height: 22,
    fill: 'var(--panel)',
    stroke: 'var(--pink)',
    rx: 6,
  });
  const secBadgeText = s('text', {
    x: 275,
    y: 210,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '11px',
    fill: 'var(--pink)',
  }, '');
  secDiffGroup.append(secPath, secBadgeBg, secBadgeText);
  tableGroup.append(secDiffGroup);

  // Right panel: mini Cartesian Plane
  const planeGroup = s('g', { class: 'exp-detective-plane' });
  scene.append(planeGroup);

  // Plane frame & axes
  planeGroup.append(
    s('rect', {
      x: 330,
      y: 20,
      width: 295,
      height: 295,
      fill: 'rgba(0, 0, 0, 0.25)',
      stroke: 'var(--border)',
      rx: 6,
    }),
  );

  // Grid lines inside plane
  for (let g = 1; g < 5; g++) {
    planeGroup.append(
      s('line', {
        x1: 330 + g * 59,
        y1: 20,
        x2: 330 + g * 59,
        y2: 315,
        stroke: 'var(--border)',
        opacity: 0.25,
      }),
      s('line', {
        x1: 330,
        y1: 20 + g * 59,
        x2: 625,
        y1: 20 + g * 59,
        stroke: 'var(--border)',
        opacity: 0.25,
      }),
    );
  }

  // Curve path and points
  const curvePath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  planeGroup.append(curvePath);

  // 4 point markers on plane
  const pointMarkers = [];
  for (let i = 0; i < 4; i++) {
    const ptGroup = s('g', { class: 'exp-detective-point' });
    const circle = s('circle', {
      cx: 0,
      cy: 0,
      r: 6,
      fill: 'var(--blue)',
      stroke: 'var(--bg)',
      'stroke-width': 2,
    });
    const label = s('text', {
      x: 0,
      y: 0,
      class: 'exp-svg-label',
      'font-size': '11px',
      fill: 'var(--text)',
    }, '');
    ptGroup.append(circle, label);
    planeGroup.append(ptGroup);
    pointMarkers.push({ ptGroup, circle, label });
  }

  // Plane title / legend
  const planeLegend = s('text', {
    x: 345,
    y: 42,
    class: 'exp-svg-label',
    'font-size': '12px',
    'font-weight': 'bold',
    fill: 'var(--accent)',
  }, '');
  planeGroup.append(planeLegend);

  // 3. Render function
  const render = (state) => {
    const preset = PRESETS[state.presetKey] || PRESETS.khan_exp;
    const n = Math.max(2, Math.min(4, state.revealedRows));

    // Update chips active states
    updatePresetChips(state.presetKey);
    updateModeChips(state.analysisMode);
    rangeInput.value = String(n);

    const activeXs = preset.xs.slice(0, n);
    const activeYs = preset.ys.slice(0, n);

    // Populate rows
    for (let i = 0; i < 4; i++) {
      const node = rowNodes[i];
      if (i < n) {
        setText(node.xText, fmt(preset.xs[i]));
        setText(node.yText, fmt(preset.ys[i]));
        node.bgRect.setAttribute('opacity', '1');
        setVisible(node.xText, true);
        setVisible(node.yText, true);
      } else {
        setText(node.xText, '?');
        setText(node.yText, '?');
        node.bgRect.setAttribute('opacity', '0.3');
        setVisible(node.xText, true);
        setVisible(node.yText, true);
      }
    }

    // Step calculations
    const deltas = [];
    const ratios = [];
    for (let i = 0; i < n - 1; i++) {
      const dy = Number((activeYs[i + 1] - activeYs[i]).toFixed(4));
      deltas.push(dy);
      if (activeYs[i] !== 0) {
        const r = Number((activeYs[i + 1] / activeYs[i]).toFixed(4));
        ratios.push(r);
      } else {
        ratios.push(null);
      }
    }

    const secDeltas = [];
    for (let i = 0; i < deltas.length - 1; i++) {
      secDeltas.push(Number((deltas[i + 1] - deltas[i]).toFixed(4)));
    }

    // Update arcs
    for (let i = 0; i < 3; i++) {
      const arc = arcNodes[i];
      if (i < n - 1) {
        setVisible(arc.arcGroup, true);
        let badgeStr = '';
        let strokeColor = 'var(--yellow)';

        if (state.analysisMode === 'diff') {
          badgeStr = `Δy = ${deltas[i] >= 0 ? '+' : ''}${fmt(deltas[i])}`;
          strokeColor = deltas.every((d) => d === deltas[0]) ? 'var(--green)' : 'var(--pink)';
        } else if (state.analysisMode === 'ratio') {
          if (ratios[i] !== null) {
            badgeStr = `× ${fmt(ratios[i])}`;
            strokeColor = ratios.every((r) => r === ratios[0]) ? 'var(--blue)' : 'var(--pink)';
          } else {
            badgeStr = 'Indef. (div 0)';
            strokeColor = 'var(--pink)';
          }
        } else if (state.analysisMode === 'second_diff') {
          badgeStr = `Δy = ${deltas[i] >= 0 ? '+' : ''}${fmt(deltas[i])}`;
          strokeColor = 'var(--text-muted)';
        } else {
          // 'all'
          if (preset.type === 'exponential') {
            badgeStr = `× ${fmt(ratios[i])}`;
            strokeColor = 'var(--blue)';
          } else if (preset.type === 'linear' || preset.type === 'constant') {
            badgeStr = `+${fmt(deltas[i])}`;
            strokeColor = 'var(--green)';
          } else {
            badgeStr = `Δy = +${fmt(deltas[i])}`;
            strokeColor = 'var(--yellow)';
          }
        }

        setText(arc.badgeText, badgeStr);
        arc.path.setAttribute('stroke', strokeColor);
        arc.badgeBg.setAttribute('stroke', strokeColor);
      } else {
        setVisible(arc.arcGroup, false);
      }
    }

    // Second diff badge
    if ((state.analysisMode === 'second_diff' || state.analysisMode === 'all') && secDeltas.length > 0) {
      setVisible(secDiffGroup, true);
      setText(secBadgeText, `Δ²y = ${secDeltas[0] >= 0 ? '+' : ''}${fmt(secDeltas[0])}`);
    } else {
      setVisible(secDiffGroup, false);
    }

    // Map points to right-side mini-plane
    // Bounding box for mapping
    const minX = Math.min(...preset.xs);
    const maxX = Math.max(...preset.xs);
    const minY = Math.min(0, ...preset.ys);
    const maxY = Math.max(...preset.ys) * 1.1;

    const mapX = (x) => 355 + ((x - minX) / (maxX - minX || 1)) * 245;
    const mapY = (y) => 290 - ((y - minY) / (maxY - minY || 1)) * 250;

    for (let i = 0; i < 4; i++) {
      const pt = pointMarkers[i];
      if (i < n) {
        setVisible(pt.ptGroup, true);
        const px = mapX(preset.xs[i]);
        const py = mapY(preset.ys[i]);
        pt.circle.setAttribute('cx', String(px));
        pt.circle.setAttribute('cy', String(py));
        pt.label.setAttribute('x', String(px + 8));
        pt.label.setAttribute('y', String(py - 6));
        setText(pt.label, `(${preset.xs[i]}; ${preset.ys[i]})`);
      } else {
        setVisible(pt.ptGroup, false);
      }
    }

    // Interpolate curve
    let curveD = '';
    const numSamples = 60;
    const curvePoints = [];

    for (let sIdx = 0; sIdx <= numSamples; sIdx++) {
      const cx = minX + (sIdx / numSamples) * (maxX - minX);
      let cy = 0;
      if (preset.type === 'linear') {
        const m = (preset.ys[1] - preset.ys[0]) / (preset.xs[1] - preset.xs[0]);
        cy = preset.ys[0] + m * (cx - preset.xs[0]);
      } else if (preset.type === 'exponential') {
        const dx = preset.xs[1] - preset.xs[0];
        const a = Math.pow(preset.ys[1] / preset.ys[0], 1 / dx);
        const k = preset.ys[0] / Math.pow(a, preset.xs[0]);
        cy = k * Math.pow(a, cx);
      } else if (preset.type === 'quadratic') {
        cy = Math.pow(cx / 2 + 1, 2);
      } else {
        cy = preset.ys[0];
      }
      curvePoints.push(`${sIdx === 0 ? 'M' : 'L'} ${mapX(cx).toFixed(1)} ${mapY(cy).toFixed(1)}`);
    }
    curveD = curvePoints.join(' ');
    curvePath.setAttribute('d', curveD);
    setText(planeLegend, preset.model);

    // Readout
    const classification = classifyTable(activeXs, activeYs);
    const rows = [
      ['Modelo Detectado', `${preset.model} (${classification.type.toUpperCase()})`],
      ['Comprobación Rápida', preset.note],
      [
        'Pistas del Detective',
        n === 2
          ? 'Con solo 2 puntos no podés distinguir con certeza una recta de una exponencial: ambos modelos pueden pasar por ellos. Revelá el 3° punto para desempatar.'
          : n === 3
          ? 'Con 3 puntos ya es posible confirmar el patrón: compará si el incremento aditivo es constante o si el cociente se mantiene idéntico.'
          : 'Con los 4 puntos completos la prueba es contundente y el modelo queda totalmente sellado.',
      ],
    ];
    renderReadout(board.readout, 'Diagnóstico de Progresión', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ presetKey: 'khan_exp', analysisMode: 'all', revealedRows: 4 }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initDetectiveTablasWidget };
