/**
 * @file js/modules/funciones-trigonometricas/widgets/circulo-trigonometrico.js
 * Widget 2 · Sec. 2: Definición cartesiana oficial (abs, ord, r.v.) y signos por cuadrante,
 * con conmutador explícito hacia la ampliación didáctica de circunferencia unitaria r = 1 y 6 segmentos.
 * 2-stage POE + keyboard-accessible attachSvgDrag + persistent DOM nodes.
 */

import {
  s,
  h,
  createStore,
  createBoard,
  createPredictBox,
  attachSvgDrag,
  addChips,
  button,
  renderReadout,
  clamp,
  playClick,
} from './board-kit.js';
import {
  cartesianSixRatios,
  fmtNumberEsAR,
  MINUS_CHAR,
} from '../logic.js';

export function initCirculoTrigonometrico(host) {
  if (!host) return null;

  const store = createStore({
    mode: 'cartesian', // 'cartesian' (Programa Oficial) | 'unit_segments' (Ampliación didáctica)
    abs: 3,
    ord: 4,
    angleDeg: 53.13,
  });

  const predictBox = createPredictBox({
    prompt: 'En el tercer cuadrante (III), ¿qué signos tienen el seno, el coseno y la tangente?',
    options: [
      {
        label: 'Seno negativo (−), coseno negativo (−) y tangente positiva (+).',
        correct: true,
        explanation:
          'En el III cuadrante abs < 0 y ord < 0 (y r.v. > 0). Por eso sen = ord/r.v. < 0, cos = abs/r.v. < 0 y tg = ord/abs = (−)/(−) > 0.',
      },
      {
        label: 'Las tres razones son negativas en el tercer cuadrante.',
        correct: false,
        explanation:
          'Seno y coseno son negativos porque abs < 0 y ord < 0, pero al dividir dos negativos en tg = ord/abs el resultado es positivo (+).',
      },
      {
        label: 'Seno positivo (+) y coseno negativo (−).',
        correct: false,
        explanation:
          'Eso ocurre en el II cuadrante (arriba a la izquierda). En el III cuadrante (abajo a la izquierda) ord también es negativa.',
      },
    ],
    onVerify: () => {
      store.set({ abs: -3, ord: -3, angleDeg: 225 });
      setPresetChip('q3');
    },
  });

  const board = createBoard(host, 'Definición cartesiana y circunferencia trigonométrica');
  host.prepend(predictBox);

  const badgeEl = h(
    'div',
    { class: 'trigf-mode-banner is-official' },
    'Programa Oficial UNMDP · Definición cartesiana por (abs; ord; r.v.)'
  );
  board.controls.append(badgeEl);

  const setModeChip = addChips(
    board.controls,
    [
      ['cartesian', 'Definición cartesiana r.v. general (Programa)'],
      ['unit_segments', 'Ampliación didáctica: Radio unitario r=1 y 6 segmentos'],
    ],
    'cartesian',
    (m) => {
      playClick();
      predictBox.notifyInteraction();
      if (m === 'unit_segments') {
        const ang = Math.atan2(store.get().ord, store.get().abs);
        const deg = ((ang * 180) / Math.PI + 360) % 360;
        store.set({ mode: m, angleDeg: deg, abs: Math.cos(ang), ord: Math.sin(ang) });
      } else {
        const st = store.get();
        const r = Math.hypot(st.abs, st.ord);
        if (r < 1.5) {
          const rad = (st.angleDeg * Math.PI) / 180;
          store.set({ mode: m, abs: Number((4 * Math.cos(rad)).toFixed(2)), ord: Number((4 * Math.sin(rad)).toFixed(2)) });
        } else {
          store.set({ mode: m });
        }
      }
    },
    'Modo de representación'
  );

  const setPresetChip = addChips(
    board.controls,
    [
      ['q1', 'QI (3; 4)'],
      ['q2', 'QII (−4; 3)'],
      ['q3', 'QIII (−3; −3 · 225°)'],
      ['q4', 'QIV (4; −3)'],
      ['axis_y', 'Eje +Y (0; 4)'],
    ],
    'q1',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      const map = {
        q1: { abs: 3, ord: 4, angleDeg: 53.13 },
        q2: { abs: -4, ord: 3, angleDeg: 143.13 },
        q3: { abs: -3, ord: -3, angleDeg: 225 },
        q4: { abs: 4, ord: -3, angleDeg: 323.13 },
        axis_y: { abs: 0, ord: 4, angleDeg: 90 },
      };
      const p = map[id];
      if (!p) return;
      if (store.get().mode === 'unit_segments') {
        const rad = (p.angleDeg * Math.PI) / 180;
        store.set({ abs: Math.cos(rad), ord: Math.sin(rad), angleDeg: p.angleDeg });
      } else {
        store.set(p);
      }
    },
    'Puntos y cuadrantes'
  );

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'cartesian', abs: 3, ord: 4, angleDeg: 53.13 });
    setModeChip('cartesian');
    setPresetChip('q1');
  });
  board.actions.append(btnReset);

  // Persistent SVG scene (640x340): Cartesian square on left, 6-ratio panel on right
  const cx = 185;
  const cy = 170;
  const scale = 24; // 5 units = 120px; in unit mode, 1 unit = 96px

  const gridGroup = s('g', { class: 'trigf-cart-grid' });
  for (let k = -5; k <= 5; k++) {
    gridGroup.append(
      s('line', { x1: cx + k * scale, y1: cy - 130, x2: cx + k * scale, y2: cy + 130, stroke: 'rgba(236, 242, 232, 0.08)', 'stroke-width': 1 }),
      s('line', { x1: cx - 130, y1: cy - k * scale, x2: cx + 130, y2: cy - k * scale, stroke: 'rgba(236, 242, 232, 0.08)', 'stroke-width': 1 })
    );
  }

  const axisX = s('line', { x1: cx - 136, y1: cy, x2: cx + 136, y2: cy, stroke: 'rgba(236, 242, 232, 0.4)', 'stroke-width': 1.5 });
  const axisY = s('line', { x1: cx, y1: cy - 136, x2: cx, y2: cy + 136, stroke: 'rgba(236, 242, 232, 0.4)', 'stroke-width': 1.5 });
  const refCircle = s('circle', { cx, cy, r: 96, fill: 'none', stroke: 'rgba(236, 242, 232, 0.25)', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' });

  const segAbs = s('line', { stroke: 'var(--blue)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const segOrd = s('line', { stroke: 'var(--yellow)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const segRv = s('line', { x1: cx, y1: cy, stroke: 'var(--pink)', 'stroke-width': 2.8, 'stroke-linecap': 'round' });

  // Extension segments for unit circle r = 1
  const tanGuide = s('line', { stroke: 'rgba(142, 219, 159, 0.35)', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' });
  const segTan = s('line', { stroke: 'var(--green)', 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const segCot = s('line', { stroke: 'var(--orange)', 'stroke-width': 3.2, 'stroke-linecap': 'round' });
  const secExt = s('line', { stroke: 'var(--purple)', 'stroke-width': 2.2, 'stroke-dasharray': '4 2' });

  const pointHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const pointDot = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });
  const lblP = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', 'font-weight': '700' });

  // Quadrant ASTC watermarks
  const lblQ1 = s('text', { class: 'trigf-svg-label', fill: 'rgba(236, 242, 232, 0.35)', x: cx + 82, y: cy - 102, 'text-anchor': 'middle' }, 'I (+ todas)');
  const lblQ2 = s('text', { class: 'trigf-svg-label', fill: 'rgba(236, 242, 232, 0.35)', x: cx - 82, y: cy - 102, 'text-anchor': 'middle' }, 'II (sen +)');
  const lblQ3 = s('text', { class: 'trigf-svg-label', fill: 'rgba(236, 242, 232, 0.35)', x: cx - 82, y: cy + 112, 'text-anchor': 'middle' }, 'III (tg +)');
  const lblQ4 = s('text', { class: 'trigf-svg-label', fill: 'rgba(236, 242, 232, 0.35)', x: cx + 82, y: cy + 112, 'text-anchor': 'middle' }, 'IV (cos +)');

  // Right readout inside SVG
  const lblTitle = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 350, y: 48, 'font-weight': '700' });
  const lblCoords = s('text', { class: 'trigf-svg-label', fill: 'var(--ink)', x: 350, y: 78 });
  const lblSin = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 350, y: 114 });
  const lblCos = s('text', { class: 'trigf-svg-label', fill: 'var(--blue)', x: 350, y: 142 });
  const lblTan = s('text', { class: 'trigf-svg-label', fill: 'var(--green)', x: 350, y: 170 });
  const lblCsc = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 350, y: 204 });
  const lblSec = s('text', { class: 'trigf-svg-label', fill: 'var(--blue)', x: 350, y: 232 });
  const lblCot = s('text', { class: 'trigf-svg-label', fill: 'var(--green)', x: 350, y: 260 });
  const lblNote = s('text', { class: 'trigf-svg-label', fill: 'var(--muted)', x: 350, y: 300 }, 'Arrastrá P o usá ←/→/↑/↓');

  board.clipped.append(
    gridGroup,
    axisX,
    axisY,
    refCircle,
    lblQ1,
    lblQ2,
    lblQ3,
    lblQ4,
    tanGuide,
    secExt,
    segAbs,
    segOrd,
    segRv,
    segTan,
    segCot,
    pointDot,
    pointHit,
    lblP,
    lblTitle,
    lblCoords,
    lblSin,
    lblCos,
    lblTan,
    lblCsc,
    lblSec,
    lblCot,
    lblNote
  );

  const getMapper = () => {
    const unitMode = store.get().mode === 'unit_segments';
    const sc = unitMode ? 96 : scale;
    return {
      xMin: unitMode ? -1 : -5,
      xMax: unitMode ? 1 : 5,
      yMin: unitMode ? -1 : -5,
      yMax: unitMode ? 1 : 5,
      toX: (x) => cx + x * sc,
      toY: (y) => cy - y * sc,
      fromX: (px) => (px - cx) / sc,
      fromY: (py) => (cy - py) / sc,
    };
  };

  attachSvgDrag(
    board.svg,
    pointHit,
    getMapper,
    ({ x, y }) => {
      predictBox.notifyInteraction();
      const st = store.get();
      if (st.mode === 'unit_segments') {
        const prevRad = (st.angleDeg * Math.PI) / 180;
        const dx = x - Math.cos(prevRad);
        const dy = y - Math.sin(prevRad);
        let rad = Math.atan2(y, x);
        if (Math.hypot(x, y) < 0.05) rad = prevRad;
        // If triggered via keyboard arrows on circle, rotate smoothly
        if (Math.abs(dx) === 0.5 || Math.abs(dy) === 0.5) {
          const stepDeg = dx > 0 || dy > 0 ? 15 : -15;
          const nextDeg = ((st.angleDeg + stepDeg) % 360 + 360) % 360;
          rad = (nextDeg * Math.PI) / 180;
        }
        const deg = ((rad * 180) / Math.PI + 360) % 360;
        store.set({ abs: Math.cos(rad), ord: Math.sin(rad), angleDeg: deg });
      } else {
        let nx = clamp(Math.round(x * 2) / 2, -5, 5);
        let ny = clamp(Math.round(y * 2) / 2, -5, 5);
        if (Math.abs(nx) < 0.1 && Math.abs(ny) < 0.1) nx = 1;
        const deg = ((Math.atan2(ny, nx) * 180) / Math.PI + 360) % 360;
        store.set({ abs: nx, ord: ny, angleDeg: deg });
      }
      setPresetChip('custom');
    },
    { ariaLabel: 'Mover punto P(abs; ord) en el plano cartesiano', stepX: 0.5, stepY: 0.5 }
  );

  const render = () => {
    const st = store.get();
    const isUnit = st.mode === 'unit_segments';
    const sc = isUnit ? 96 : scale;

    badgeEl.className = `trigf-mode-banner ${isUnit ? 'is-extension' : 'is-official'}`;
    badgeEl.textContent = isUnit
      ? 'Ampliación didáctica · Circunferencia trigonométrica unitaria r = 1 y 6 segmentos'
      : 'Programa Oficial UNMDP · Definición cartesiana general (abs, ord, r.v.)';

    const px = cx + st.abs * sc;
    const py = cy - st.ord * sc;
    const rVal = Math.hypot(st.abs, st.ord);

    refCircle.setAttribute('r', (rVal * sc).toFixed(1));
    segAbs.setAttribute('x1', String(cx));
    segAbs.setAttribute('y1', String(cy));
    segAbs.setAttribute('x2', px.toFixed(1));
    segAbs.setAttribute('y2', String(cy));

    segOrd.setAttribute('x1', px.toFixed(1));
    segOrd.setAttribute('y1', String(cy));
    segOrd.setAttribute('x2', px.toFixed(1));
    segOrd.setAttribute('y2', py.toFixed(1));

    segRv.setAttribute('x2', px.toFixed(1));
    segRv.setAttribute('y2', py.toFixed(1));

    pointHit.setAttribute('cx', px.toFixed(1));
    pointHit.setAttribute('cy', py.toFixed(1));
    pointHit.setAttribute('aria-valuenow', String(Math.round(st.angleDeg)));
    pointDot.setAttribute('cx', px.toFixed(1));
    pointDot.setAttribute('cy', py.toFixed(1));

    lblP.setAttribute('x', (px + (st.abs >= 0 ? 10 : -10)).toFixed(1));
    lblP.setAttribute('y', (py + (st.ord >= 0 ? -10 : 16)).toFixed(1));
    lblP.setAttribute('text-anchor', st.abs >= 0 ? 'start' : 'end');
    lblP.textContent = isUnit
      ? `P(${fmtNumberEsAR(st.abs, 2)}; ${fmtNumberEsAR(st.ord, 2)})`
      : `P(${fmtNumberEsAR(st.abs, 1)}; ${fmtNumberEsAR(st.ord, 1)})`;

    const ratios = cartesianSixRatios({ abs: st.abs, ord: st.ord });

    // Unit-circle geometric segments (extension)
    if (isUnit) {
      tanGuide.removeAttribute('visibility');
      segTan.removeAttribute('visibility');
      segCot.removeAttribute('visibility');
      secExt.removeAttribute('visibility');
      tanGuide.setAttribute('x1', String(cx + sc));
      tanGuide.setAttribute('y1', String(cy - 125));
      tanGuide.setAttribute('x2', String(cx + sc));
      tanGuide.setAttribute('y2', String(cy + 125));

      if (Number.isFinite(ratios.tan) && Math.abs(ratios.tan) <= 1.35) {
        segTan.setAttribute('x1', String(cx + sc));
        segTan.setAttribute('y1', String(cy));
        segTan.setAttribute('x2', String(cx + sc));
        segTan.setAttribute('y2', (cy - ratios.tan * sc).toFixed(1));
        secExt.setAttribute('x1', String(cx));
        secExt.setAttribute('y1', String(cy));
        secExt.setAttribute('x2', String(cx + sc));
        secExt.setAttribute('y2', (cy - ratios.tan * sc).toFixed(1));
      } else {
        segTan.setAttribute('visibility', 'hidden');
        secExt.setAttribute('visibility', 'hidden');
      }

      if (Number.isFinite(ratios.cot) && Math.abs(ratios.cot) <= 1.35) {
        segCot.setAttribute('x1', String(cx));
        segCot.setAttribute('y1', String(cy - sc));
        segCot.setAttribute('x2', (cx + ratios.cot * sc).toFixed(1));
        segCot.setAttribute('y2', String(cy - sc));
      } else {
        segCot.setAttribute('visibility', 'hidden');
      }
    } else {
      tanGuide.setAttribute('visibility', 'hidden');
      segTan.setAttribute('visibility', 'hidden');
      segCot.setAttribute('visibility', 'hidden');
      secExt.setAttribute('visibility', 'hidden');
    }

    const qLabel = ratios.quadrant ? `Cuadrante ${['I', 'II', 'III', 'IV'][ratios.quadrant - 1]}` : `Eje ${ratios.axis}`;
    const fmtVal = (exactObj, numVal) => {
      if (!Number.isFinite(numVal)) return '∄ (div. por 0)';
      if (exactObj && exactObj.defined && exactObj.formatted) {
        return `${exactObj.formatted} (${fmtNumberEsAR(numVal, 3)})`;
      }
      return fmtNumberEsAR(numVal, 3);
    };

    lblTitle.textContent = `${qLabel} · α ≈ ${fmtNumberEsAR(ratios.angleDeg, 1)}°`;
    lblCoords.textContent = `abs = ${fmtNumberEsAR(ratios.abs, 2)} · ord = ${fmtNumberEsAR(ratios.ord, 2)} · r.v. = ${
      ratios.exact?.rv ? ratios.exact.rv.formatted : fmtNumberEsAR(ratios.rv, 2)
    }`;
    lblSin.textContent = `sen α = ord/r.v. = ${fmtVal(ratios.exact?.sin, ratios.sin)}`;
    lblCos.textContent = `cos α = abs/r.v. = ${fmtVal(ratios.exact?.cos, ratios.cos)}`;
    lblTan.textContent = `tg α = ord/abs = ${fmtVal(ratios.exact?.tan, ratios.tan)}`;
    lblCsc.textContent = `cosec α = r.v./ord = ${fmtVal(ratios.exact?.csc, ratios.csc)}`;
    lblSec.textContent = `sec α = r.v./abs = ${fmtVal(ratios.exact?.sec, ratios.sec)}`;
    lblCot.textContent = `cotg α = abs/ord = ${fmtVal(ratios.exact?.cot, ratios.cot)}`;

    renderReadout(board.readout, `Definición Cartesiana (${qLabel})`, [
      ['Coordenadas y r.v.', `P(${fmtNumberEsAR(ratios.abs, 2)}; ${fmtNumberEsAR(ratios.ord, 2)}) · r.v. = ${ratios.exact?.rv ? ratios.exact.rv.formatted : fmtNumberEsAR(ratios.rv, 2)}`],
      ['Fundamentales', `sen α = ${fmtVal(ratios.exact?.sin, ratios.sin)} · cos α = ${fmtVal(ratios.exact?.cos, ratios.cos)} · tg α = ${fmtVal(ratios.exact?.tan, ratios.tan)}`],
      ['Recíprocas', `cosec α = ${fmtVal(ratios.exact?.csc, ratios.csc)} · sec α = ${fmtVal(ratios.exact?.sec, ratios.sec)} · cotg α = ${fmtVal(ratios.exact?.cot, ratios.cot)}`],
      ['Regla de signos', ratios.quadrant === 1 ? 'Todas positivas' : ratios.quadrant === 2 ? 'Solo sen y cosec (+)' : ratios.quadrant === 3 ? 'Solo tg y cotg (+)' : ratios.quadrant === 4 ? 'Solo cos y sec (+)' : `Sobre eje ${ratios.axis}: una coordenada vale 0`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
