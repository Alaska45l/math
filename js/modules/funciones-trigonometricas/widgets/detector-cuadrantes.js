/**
 * @file js/modules/funciones-trigonometricas/widgets/detector-cuadrantes.js
 * Widget 4 · Sec. 5: Detector de cuadrantes, relaciones pitagóricas exactas (exactTrigFromGiven),
 * reducción al primer cuadrante y valores exactos con radicales racionalizados.
 * 2-stage POE + keyboard-accessible attachSvgDrag + persistent DOM nodes.
 */

import {
  s,
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
  exactTrigFromGiven,
  exactTrigAtSpecialAngle,
  reduceToFirstQuadrant,
  rat,
  fmtNumberEsAR,
  MINUS_CHAR,
} from '../logic.js';

const PRESETS = [
  { id: 'global2022', label: 'sen α = −3/4, tg α > 0', fn: 'sin', value: '-3/4', secondCondition: 'tan > 0', quadrant: 3 },
  { id: 'ej18a', label: 'sen α = −3/5 (III)', fn: 'sin', value: '-3/5', quadrant: 3 },
  { id: 'ej18b', label: 'cos α = −1/5 (II)', fn: 'cos', value: '-1/5', quadrant: 2 },
  { id: 'ej18c', label: 'tg α = −2 (IV)', fn: 'tan', value: '-2', quadrant: 4 },
  { id: 'ej18d', label: 'sec α = −2√2 (III)', fn: 'sec', value: '-2√2', quadrant: 3 },
  { id: 'notable_2pi3', label: 'Notable: 2π/3 (II)', specialPi: rat(2, 3), quadrant: 2 },
  { id: 'notable_7pi4', label: 'Notable: 7π/4 (IV)', specialPi: rat(7, 4), quadrant: 4 },
];

export function initDetectorCuadrantes(host) {
  if (!host) return null;

  const store = createStore({
    preset: 'global2022',
    customDeg: 228.59,
    showMirrorQI: true,
  });

  const predictBox = createPredictBox({
    prompt: 'Si sabemos que sen(α) = −3/4 y tg(α) > 0, ¿en qué cuadrante vive α y qué signo tiene sec(α)?',
    options: [
      {
        label: 'Cuadrante III; cos(α) < 0 y sec(α) = −4√7/7 (negativa).',
        correct: true,
        explanation:
          'sen(α) < 0 ubica α en III o IV; tg(α) > 0 ocurre en I o III. La intersección es III, donde cos(α) = −√(1 − 9/16) = −√7/4 y sec(α) = −4√7/7.',
      },
      {
        label: 'Cuadrante IV; sec(α) = +4√7/7 (positiva).',
        correct: false,
        explanation:
          'En el cuadrante IV la tangente es negativa (ord < 0, abs > 0), contradiciendo tg(α) > 0.',
      },
      {
        label: 'Cuadrante II; sec(α) negativa.',
        correct: false,
        explanation:
          'En el cuadrante II el seno es positivo (+), pero aquí sen(α) = −3/4 < 0.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'global2022', customDeg: 228.59, showMirrorQI: true });
      setPresetChip('global2022');
    },
  });

  const board = createBoard(host, 'Detector de cuadrantes, relaciones pitagóricas y reducción al I cuadrante');
  host.prepend(predictBox);

  const setPresetChip = addChips(
    board.controls,
    PRESETS.map((p) => [p.id, p.label]),
    'global2022',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      const p = PRESETS.find((x) => x.id === id);
      if (!p) return;
      let deg = 228.59;
      if (p.specialPi) {
        deg = (p.specialPi.n / p.specialPi.d) * 180;
      } else {
        const res = exactTrigFromGiven({ fn: p.fn, value: p.value, quadrant: p.quadrant, secondCondition: p.secondCondition });
        deg = ((Math.atan2(res.sin.num, res.cos.num) * 180) / Math.PI + 360) % 360;
      }
      store.set({ preset: id, customDeg: deg });
    },
    'Casos pitagóricos y notables'
  );

  const mirrorBtn = button('Espejo reducción al I cuadrante (Activo)', 'target', () => {
    playClick();
    predictBox.notifyInteraction();
    const next = !store.get().showMirrorQI;
    store.set({ showMirrorQI: next });
    mirrorBtn.classList.toggle('is-active', next);
    mirrorBtn.textContent = next ? 'Espejo reducción al I cuadrante (Activo)' : 'Espejo reducción al I cuadrante (Oculto)';
  }, 'chip is-active');

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ preset: 'global2022', customDeg: 228.59, showMirrorQI: true });
    setPresetChip('global2022');
    mirrorBtn.classList.add('is-active');
    mirrorBtn.textContent = 'Espejo reducción al I cuadrante (Activo)';
  });
  board.actions.append(mirrorBtn, btnReset);

  // Persistent SVG nodes (640x340)
  const cx = 178;
  const cy = 170;
  const rPx = 104;

  const axisX = s('line', { x1: cx - 130, y1: cy, x2: cx + 130, y2: cy, stroke: 'rgba(236, 242, 232, 0.35)', 'stroke-width': 1.4 });
  const axisY = s('line', { x1: cx, y1: cy - 130, x2: cx, y2: cy + 130, stroke: 'rgba(236, 242, 232, 0.35)', 'stroke-width': 1.4 });
  const circle = s('circle', { cx, cy, r: rPx, fill: 'rgba(236, 242, 232, 0.03)', stroke: 'rgba(236, 242, 232, 0.28)', 'stroke-width': 1.4 });

  // Active quadrant shading
  const quadRect = s('rect', { fill: 'rgba(230, 211, 138, 0.08)', stroke: 'none' });

  // Reference QI mirror triangle
  const mirrorRay = s('line', { x1: cx, y1: cy, stroke: 'rgba(142, 219, 159, 0.65)', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
  const mirrorDrop = s('line', { stroke: 'rgba(142, 219, 159, 0.5)', 'stroke-width': 1.6, 'stroke-dasharray': '3 3' });
  const mirrorDot = s('circle', { r: 4.5, fill: 'var(--green)' });

  // Active triangle
  const legCos = s('line', { stroke: 'var(--blue)', 'stroke-width': 3.2 });
  const legSin = s('line', { stroke: 'var(--yellow)', 'stroke-width': 3.2 });
  const rayHyp = s('line', { x1: cx, y1: cy, stroke: 'var(--pink)', 'stroke-width': 2.8 });
  const ptHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const ptDot = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  const lblTitle = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 342, y: 46, 'font-weight': '700' });
  const lblRed = s('text', { class: 'trigf-svg-label', fill: 'var(--green)', x: 342, y: 74 });
  const lblSin = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 342, y: 110 });
  const lblCos = s('text', { class: 'trigf-svg-label', fill: 'var(--blue)', x: 342, y: 138 });
  const lblTan = s('text', { class: 'trigf-svg-label', fill: 'var(--ink)', x: 342, y: 166 });
  const lblCsc = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 342, y: 198 });
  const lblSec = s('text', { class: 'trigf-svg-label', fill: 'var(--blue)', x: 342, y: 226 });
  const lblCot = s('text', { class: 'trigf-svg-label', fill: 'var(--ink)', x: 342, y: 254 });
  const lblHint = s('text', { class: 'trigf-svg-label', fill: 'var(--muted)', x: 342, y: 298 }, 'Arrastrá el punto o usá ← / → (pasos de 15°)');

  board.clipped.append(
    quadRect,
    axisX,
    axisY,
    circle,
    mirrorRay,
    mirrorDrop,
    mirrorDot,
    legCos,
    legSin,
    rayHyp,
    ptDot,
    ptHit,
    lblTitle,
    lblRed,
    lblSin,
    lblCos,
    lblTan,
    lblCsc,
    lblSec,
    lblCot,
    lblHint
  );

  const mapper = {
    xMin: 0,
    xMax: 345,
    yMin: 0,
    yMax: 1,
    toX: (d) => cx + rPx * Math.cos((d * Math.PI) / 180),
    toY: (d) => cy - rPx * Math.sin((d * Math.PI) / 180),
    fromX: (px) => px,
    fromY: (py) => py,
  };

  attachSvgDrag(
    board.svg,
    ptHit,
    () => mapper,
    ({ px, py, x }) => {
      predictBox.notifyInteraction();
      const st = store.get();
      let deg;
      if (px !== undefined && py !== undefined && Math.abs(px - x) > 0.01) {
        deg = ((Math.atan2(cy - py, px - cx) * 180) / Math.PI + 360) % 360;
      } else {
        const delta = x - mapper.fromX(parseFloat(ptHit.getAttribute('cx')) || cx + rPx);
        deg = ((st.customDeg + (delta >= 0 ? 15 : -15)) % 360 + 360) % 360;
      }
      const snapped = clamp(Math.round(deg / 15) * 15, 0, 345);
      store.set({ preset: 'custom', customDeg: snapped });
      setPresetChip('custom');
    },
    { ariaLabel: 'Rotar ángulo α para explorar reducción al primer cuadrante', stepX: 15, stepY: 15 }
  );

  const render = () => {
    const st = store.get();
    const pObj = PRESETS.find((x) => x.id === st.preset);

    let exactObj = null;
    let deg = st.customDeg;
    let redFormula = '';

    if (pObj && pObj.specialPi) {
      exactObj = exactTrigAtSpecialAngle(pObj.specialPi);
      const red = reduceToFirstQuadrant(pObj.specialPi);
      redFormula = red.reductionFormula;
      deg = exactObj.deg;
    } else if (pObj && !pObj.specialPi) {
      exactObj = exactTrigFromGiven({
        fn: pObj.fn,
        value: pObj.value,
        quadrant: pObj.quadrant,
        secondCondition: pObj.secondCondition,
      });
      deg = ((Math.atan2(exactObj.sin.num, exactObj.cos.num) * 180) / Math.PI + 360) % 360;
      const q = exactObj.quadrant;
      const refDeg = q === 1 ? deg : q === 2 ? 180 - deg : q === 3 ? deg - 180 : 360 - deg;
      redFormula =
        q === 1
          ? `Ya en QI (α_I ≈ ${fmtNumberEsAR(refDeg, 1)}°)`
          : q === 2
            ? `QII → 180° − α ≈ ${fmtNumberEsAR(refDeg, 1)}°`
            : q === 3
              ? `QIII → α − 180° ≈ ${fmtNumberEsAR(refDeg, 1)}°`
              : `QIV → 360° − α ≈ ${fmtNumberEsAR(refDeg, 1)}°`;
    } else {
      const piRat = rat(Math.round(deg), 180);
      exactObj = exactTrigAtSpecialAngle(piRat);
      const red = reduceToFirstQuadrant(piRat);
      redFormula = red.reductionFormula;
    }

    const rad = (deg * Math.PI) / 180;
    const cosV = exactObj ? exactObj.cos.num : Math.cos(rad);
    const sinV = exactObj ? exactObj.sin.num : Math.sin(rad);
    const px = cx + rPx * cosV;
    const py = cy - rPx * sinV;

    // Quadrant highlight rect
    const q = exactObj?.quadrant || (deg < 90 ? 1 : deg < 180 ? 2 : deg < 270 ? 3 : 4);
    quadRect.setAttribute('x', q === 1 || q === 4 ? String(cx) : String(cx - 120));
    quadRect.setAttribute('y', q === 1 || q === 2 ? String(cy - 120) : String(cy));
    quadRect.setAttribute('width', '120');
    quadRect.setAttribute('height', '120');

    legCos.setAttribute('x1', String(cx));
    legCos.setAttribute('y1', String(cy));
    legCos.setAttribute('x2', px.toFixed(1));
    legCos.setAttribute('y2', String(cy));

    legSin.setAttribute('x1', px.toFixed(1));
    legSin.setAttribute('y1', String(cy));
    legSin.setAttribute('x2', px.toFixed(1));
    legSin.setAttribute('y2', py.toFixed(1));

    rayHyp.setAttribute('x2', px.toFixed(1));
    rayHyp.setAttribute('y2', py.toFixed(1));
    ptHit.setAttribute('cx', px.toFixed(1));
    ptHit.setAttribute('cy', py.toFixed(1));
    ptHit.setAttribute('aria-valuenow', String(Math.round(deg)));
    ptDot.setAttribute('cx', px.toFixed(1));
    ptDot.setAttribute('cy', py.toFixed(1));

    // Mirror QI reference angle
    if (st.showMirrorQI) {
      const mx = cx + rPx * Math.abs(cosV);
      const my = cy - rPx * Math.abs(sinV);
      mirrorRay.removeAttribute('visibility');
      mirrorDrop.removeAttribute('visibility');
      mirrorDot.removeAttribute('visibility');
      mirrorRay.setAttribute('x2', mx.toFixed(1));
      mirrorRay.setAttribute('y2', my.toFixed(1));
      mirrorDrop.setAttribute('x1', mx.toFixed(1));
      mirrorDrop.setAttribute('y1', String(cy));
      mirrorDrop.setAttribute('x2', mx.toFixed(1));
      mirrorDrop.setAttribute('y2', my.toFixed(1));
      mirrorDot.setAttribute('cx', mx.toFixed(1));
      mirrorDot.setAttribute('cy', my.toFixed(1));
    } else {
      mirrorRay.setAttribute('visibility', 'hidden');
      mirrorDrop.setAttribute('visibility', 'hidden');
      mirrorDot.setAttribute('visibility', 'hidden');
    }

    const fmt6 = (k) => {
      if (exactObj && exactObj[k]) {
        return exactObj[k].defined === false ? '∄' : exactObj[k].formatted;
      }
      const val =
        k === 'sin'
          ? Math.sin(rad)
          : k === 'cos'
            ? Math.cos(rad)
            : k === 'tan'
              ? Math.abs(Math.cos(rad)) < 1e-9
                ? NaN
                : Math.tan(rad)
              : k === 'csc'
                ? Math.abs(Math.sin(rad)) < 1e-9
                  ? NaN
                  : 1 / Math.sin(rad)
                : k === 'sec'
                  ? Math.abs(Math.cos(rad)) < 1e-9
                    ? NaN
                    : 1 / Math.cos(rad)
                  : Math.abs(Math.sin(rad)) < 1e-9
                    ? NaN
                    : Math.cos(rad) / Math.sin(rad);
      return Number.isFinite(val) ? fmtNumberEsAR(val, 4) : '∄';
    };

    const qName = ['I', 'II', 'III', 'IV'][q - 1] || 'Eje';
    lblTitle.textContent = pObj ? `${pObj.label} → Cuadrante ${qName}` : `Ángulo ${fmtNumberEsAR(deg, 0)}° (Cuadrante ${qName})`;
    lblRed.textContent = `Reducción: ${redFormula}`;
    lblSin.textContent = `sen α = ${fmt6('sin')}`;
    lblCos.textContent = `cos α = ${fmt6('cos')}`;
    lblTan.textContent = `tg α = ${fmt6('tan')}`;
    lblCsc.textContent = `cosec α = ${fmt6('csc')}`;
    lblSec.textContent = `sec α = ${fmt6('sec')}`;
    lblCot.textContent = `cotg α = ${fmt6('cot')}`;

    renderReadout(board.readout, `Valores Exactos en Cuadrante ${qName}`, [
      ['Identidad pitagórica', `(${fmt6('sin')})² + (${fmt6('cos')})² = 1`],
      ['Fundamentales', `sen α = ${fmt6('sin')} · cos α = ${fmt6('cos')} · tg α = ${fmt6('tan')}`],
      ['Recíprocas racionalizadas', `cosec α = ${fmt6('csc')} · sec α = ${fmt6('sec')} · cotg α = ${fmt6('cot')}`],
      ['Reducción al I cuadrante', redFormula],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
