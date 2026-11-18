/**
 * @file js/modules/funciones-trigonometricas/widgets/explorador-congruencia.js
 * Widget 1 · Sec. 1: Explorador de congruencia angular, espirales de giros k·2π
 * y representante principal en [0; 2π) / [0°; 360°).
 * 2-stage POE + keyboard-accessible attachSvgDrag + persistent SVG nodes.
 */

import {
  s,
  createStore,
  createBoard,
  createPredictBox,
  attachSvgDrag,
  addRange,
  addChips,
  button,
  renderReadout,
  createBoxMapper,
  clamp,
  playClick,
} from './board-kit.js';
import {
  principalRepDeg,
  principalRepPi,
  areCongruent,
  formatCongruenceClass,
  formatPiRat,
  rat,
  fmtNumberEsAR,
  MINUS_CHAR,
} from '../logic.js';

function spiralPath(cx, cy, startDeg, endDeg, rStart, rEnd) {
  const steps = Math.max(24, Math.min(240, Math.ceil(Math.abs(endDeg - startDeg) / 6)));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const deg = startDeg + (endDeg - startDeg) * t;
    const r = rStart + (rEnd - rStart) * t;
    const rad = (deg * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy - r * Math.sin(rad);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export function initExploradorCongruencia(host) {
  if (!host) return null;

  const store = createStore({
    preset: 'compare_int2',
    principalDeg: 210,
    turnsK: -3,
    compareMode: true,
    compareDegB: 930, // 31π/6 = 930°
  });

  const predictBox = createPredictBox({
    prompt: '¿Pertenecen −870° y 31π/6 a la misma clase de congruencia C_α?',
    options: [
      {
        label: 'Sí, ambos tienen representante principal 210° (7π/6) y difieren en exactamente 5 vueltas completas.',
        correct: true,
        explanation:
          '−870° + 3·360° = 210° (= 7π/6) y 31π/6 − 2·(2π) = 7π/6 (= 210°). Su diferencia es 31π/6 − (−870°·π/180°) = 5·(2π), entero.',
      },
      {
        label: 'No, porque −870° es negativo y está en grados mientras 31π/6 está en radianes.',
        correct: false,
        explanation:
          'El sistema de unidades no impide la congruencia: al convertir −870° = −29π/6, la resta 31π/6 − (−29π/6) = 60π/6 = 10π = 5·(2π).',
      },
      {
        label: 'No, −870° termina en 150° y 31π/6 termina en 330°.',
        correct: false,
        explanation:
          '−870° + 1080° = 210° (cuadrante III, no 150°) y 31π/6 = 4π + 7π/6 = 7π/6 = 210°.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'compare_int2', principalDeg: 210, turnsK: -3, compareMode: true, compareDegB: 930 });
      setPresetChip('compare_int2');
      syncSliders();
    },
  });

  const board = createBoard(host, 'Explorador de congruencia angular y clases C_α');
  host.prepend(predictBox);

  const PRESETS = [
    ['compare_int2', '−870° vs 31π/6'],
    ['p2920', '2920° (40°)'],
    ['m500', '−500° (220°)'],
    ['p9pi2', '9π/2 (π/2)'],
    ['p8pi', '8π (0)'],
    ['p12pi5', '12π/5 (2π/5)'],
  ];

  const setPresetChip = addChips(
    board.controls,
    PRESETS,
    'compare_int2',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      if (id === 'compare_int2') {
        store.set({ preset: id, principalDeg: 210, turnsK: -3, compareMode: true, compareDegB: 930 });
      } else if (id === 'p2920') {
        store.set({ preset: id, principalDeg: 40, turnsK: 8, compareMode: false });
      } else if (id === 'm500') {
        store.set({ preset: id, principalDeg: 220, turnsK: -2, compareMode: false });
      } else if (id === 'p9pi2') {
        store.set({ preset: id, principalDeg: 90, turnsK: 2, compareMode: false });
      } else if (id === 'p8pi') {
        store.set({ preset: id, principalDeg: 0, turnsK: 4, compareMode: false });
      } else if (id === 'p12pi5') {
        store.set({ preset: id, principalDeg: 72, turnsK: 1, compareMode: false });
      }
      syncSliders();
    },
    'Casos de congruencia'
  );

  const sliderAngle = addRange(
    board.controls,
    store,
    'principalDeg',
    'Representante principal α̂ (°)',
    0,
    345,
    210,
    15,
    (v) => `${fmtNumberEsAR(v, 0)}°`
  );
  const sliderTurns = addRange(
    board.controls,
    store,
    'turnsK',
    'Vueltas completas k ∈ ℤ',
    -4,
    8,
    -3,
    1,
    (v) => `${v < 0 ? MINUS_CHAR : '+'}${Math.abs(v)} vueltas`
  );

  const syncSliders = () => {
    const st = store.get();
    sliderAngle.input.value = String(st.principalDeg);
    sliderAngle.output.textContent = `${fmtNumberEsAR(st.principalDeg, 0)}°`;
    sliderTurns.input.value = String(clamp(st.turnsK, -4, 8));
    sliderTurns.output.textContent = `${st.turnsK < 0 ? MINUS_CHAR : '+'}${Math.abs(st.turnsK)} vueltas`;
  };

  sliderAngle.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom', compareMode: false });
    setPresetChip('custom');
  });
  sliderTurns.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom', compareMode: false });
    setPresetChip('custom');
  });

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ preset: 'compare_int2', principalDeg: 210, turnsK: -3, compareMode: true, compareDegB: 930 });
    setPresetChip('compare_int2');
    syncSliders();
  });
  board.actions.append(btnReset);

  // Persistent SVG nodes inside board.clipped (640x340)
  const cx = 185;
  const cy = 170;
  const baseR = 96;

  const axisX = s('line', { x1: cx - 125, y1: cy, x2: cx + 125, y2: cy, stroke: 'rgba(236, 242, 232, 0.25)', 'stroke-width': 1.2 });
  const axisY = s('line', { x1: cx, y1: cy - 125, x2: cx, y2: cy + 125, stroke: 'rgba(236, 242, 232, 0.25)', 'stroke-width': 1.2 });
  const unitCircle = s('circle', { cx, cy, r: baseR, fill: 'rgba(236, 242, 232, 0.03)', stroke: 'rgba(236, 242, 232, 0.28)', 'stroke-width': 1.4 });
  const initialRay = s('line', { x1: cx, y1: cy, x2: cx + baseR + 12, y2: cy, stroke: 'rgba(236, 242, 232, 0.45)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' });

  const spiralA = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  const spiralB = s('path', { fill: 'none', stroke: 'var(--pink)', 'stroke-width': 2.2, 'stroke-dasharray': '5 3', 'stroke-linecap': 'round' });
  const principalArc = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const terminalRay = s('line', { x1: cx, y1: cy, stroke: 'var(--green)', 'stroke-width': 3, 'stroke-linecap': 'round' });

  const tipHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const tipDot = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  const lblPanelTitle = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 345, y: 54, 'font-weight': '700' });
  const lblLine1 = s('text', { class: 'trigf-svg-label', fill: 'var(--blue)', x: 345, y: 88 });
  const lblLine2 = s('text', { class: 'trigf-svg-label', fill: 'var(--pink)', x: 345, y: 120 });
  const lblLine3 = s('text', { class: 'trigf-svg-label', fill: 'var(--green)', x: 345, y: 152 });
  const lblLine4 = s('text', { class: 'trigf-svg-label', fill: 'var(--ink)', x: 345, y: 184 });
  const lblLine5 = s('text', { class: 'trigf-svg-label', fill: 'var(--yellow)', x: 345, y: 218, 'font-weight': '700' });
  const lblHintDrag = s('text', { class: 'trigf-svg-label', fill: 'var(--muted)', x: 345, y: 288 }, 'Arrastrá el punto o usá ← / → para rotar α̂');

  board.clipped.append(
    axisX,
    axisY,
    unitCircle,
    initialRay,
    spiralA,
    spiralB,
    principalArc,
    terminalRay,
    tipDot,
    tipHit,
    lblPanelTitle,
    lblLine1,
    lblLine2,
    lblLine3,
    lblLine4,
    lblLine5,
    lblHintDrag
  );

  // Circular angle mapper for attachSvgDrag
  const mapper = {
    xMin: 0,
    xMax: 345,
    yMin: 0,
    yMax: 1,
    toX: (deg) => cx + baseR * Math.cos((deg * Math.PI) / 180),
    toY: (deg) => cy - baseR * Math.sin((deg * Math.PI) / 180),
    fromX: (px) => px,
    fromY: (py) => py,
  };

  attachSvgDrag(
    board.svg,
    tipHit,
    () => mapper,
    ({ px, py, x }) => {
      predictBox.notifyInteraction();
      let deg;
      if (px !== undefined && py !== undefined && Math.abs(px - x) > 0.01) {
        const dx = px - cx;
        const dy = cy - py;
        deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      } else {
        // Keyboard arrow step arrives via x
        const prev = store.get().principalDeg;
        const delta = x - mapper.fromX(parseFloat(tipHit.getAttribute('cx')) || cx + baseR);
        deg = ((prev + (delta >= 0 ? 15 : -15)) % 360 + 360) % 360;
      }
      const snapped = clamp(Math.round(deg / 15) * 15, 0, 345);
      store.set({ preset: 'custom', principalDeg: snapped, compareMode: false });
      setPresetChip('custom');
      syncSliders();
    },
    { ariaLabel: 'Rotar representante principal en la circunferencia', stepX: 15, stepY: 15 }
  );

  const render = () => {
    const st = store.get();
    const pDeg = clamp(st.principalDeg, 0, 359);
    const totalDeg = pDeg + st.turnsK * 360;
    const pRad = (pDeg * Math.PI) / 180;

    const tipX = cx + baseR * Math.cos(pRad);
    const tipY = cy - baseR * Math.sin(pRad);
    terminalRay.setAttribute('x2', tipX.toFixed(1));
    terminalRay.setAttribute('y2', tipY.toFixed(1));
    tipHit.setAttribute('cx', tipX.toFixed(1));
    tipHit.setAttribute('cy', tipY.toFixed(1));
    tipHit.setAttribute('aria-valuenow', String(pDeg));
    tipDot.setAttribute('cx', tipX.toFixed(1));
    tipDot.setAttribute('cy', tipY.toFixed(1));

    // Principal arc on r = 42
    if (pDeg <= 0.1) {
      principalArc.setAttribute('d', '');
    } else {
      const rA = 42;
      const ax = cx + rA * Math.cos(pRad);
      const ay = cy - rA * Math.sin(pRad);
      const large = pDeg > 180 ? 1 : 0;
      principalArc.setAttribute('d', `M ${cx + rA} ${cy} A ${rA} ${rA} 0 ${large} 0 ${ax.toFixed(1)} ${ay.toFixed(1)}`);
    }

    // Spiral A for totalDeg
    const visualTurns = clamp(st.turnsK, -3, 3);
    const visDegA = pDeg + visualTurns * 360;
    spiralA.setAttribute('d', spiralPath(cx, cy, 0, visDegA, 22, 82));

    // Exact pi fraction for pDeg (multiples of 15° or special preset)
    let piRat;
    if (st.preset === 'p12pi5') piRat = rat(2, 5);
    else if (st.preset === 'p2920') piRat = rat(40, 180);
    else if (st.preset === 'm500') piRat = rat(220, 180);
    else piRat = rat(Math.round(pDeg), 180);

    const totalPiRat = rat(piRat.n + st.turnsK * 2 * piRat.d, piRat.d);
    const rep = principalRepPi(totalPiRat);
    const repD = principalRepDeg(totalDeg);
    const classLabel = formatCongruenceClass(rep.repRat, { system: 'rad' });

    if (st.compareMode) {
      spiralB.removeAttribute('visibility');
      spiralB.setAttribute('d', spiralPath(cx, cy, 0, 930, 30, 92));
      const congCheck = areCongruent('-870°', '31pi/6');
      lblPanelTitle.textContent = 'Comparación de Congruencia (Int. 2)';
      lblLine1.textContent = `Ángulo A: ${MINUS_CHAR}870° = ${MINUS_CHAR}29π/6 (k = ${MINUS_CHAR}3)`;
      lblLine2.textContent = `Ángulo B: 31π/6 = 930° (k = +2)`;
      lblLine3.textContent = `Diferencia: B − A = 1800° = 5 · 360° = 10π`;
      lblLine4.textContent = `Ambos caen en el mismo rayo terminal`;
      lblLine5.textContent = `Clase común: ${classLabel} = C_{210°} (${congCheck.congruent ? 'Congruentes' : 'Distintos'})`;
    } else {
      spiralB.setAttribute('visibility', 'hidden');
      spiralB.setAttribute('d', '');
      lblPanelTitle.textContent = 'Reducción al Representante Principal';
      lblLine1.textContent = `Ángulo: ${totalDeg < 0 ? MINUS_CHAR : ''}${Math.abs(totalDeg)}° = ${formatPiRat(totalPiRat)} rad`;
      lblLine2.textContent = `Vueltas completas: k = ${st.turnsK}`;
      lblLine3.textContent = `Rep. en [0°; 360°): ${repD.formatted}`;
      lblLine4.textContent = `Rep. en [0; 2π): ${rep.formatted}`;
      lblLine5.textContent = `Clase: ${classLabel} = C_{${repD.formatted}}`;
    }

    renderReadout(board.readout, `Clase de Congruencia ${classLabel}`, [
      ['Ángulo explorado', `${totalDeg < 0 ? MINUS_CHAR : ''}${Math.abs(totalDeg)}° (${formatPiRat(totalPiRat)} rad)`],
      ['Representante principal', `${rep.formatted} en [0; 2π) · ${repD.formatted} en [0°; 360°)`],
      ['Definición C_α', `{ x ∈ ℝ / x = ${rep.formatted} + 2kπ, k ∈ ℤ }`],
      ['Diferencia de giros', st.compareMode ? '31π/6 − (−29π/6) = 5 · (2π) ⇒ misma clase' : `α − α̂ = ${st.turnsK} · (2π)`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
