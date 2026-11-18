/**
 * @file js/modules/razones-trigonometricas/widgets/conversor-angulos.js
 * Widget 4 · Sec. 4: Sistemas sexagesimal (° ' ") y circular (radianes),
 * puente curricular hacia Funciones Trigonométricas y longitud de arco s = r · θ.
 */

import {
  s,
  h,
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
  degToDms,
  degToRadExact,
  radToDeg,
  arcLength,
  fmtNumberEsAR,
} from '../logic.js';
import { formatPiRat, rat } from '../expr.js';

const ONE_RAD_DEG = 180 / Math.PI;

export function initConversorAngulos(host) {
  if (!host) return null;

  const store = createStore({
    mode: 'deg_to_rad', // 'deg_to_rad' | 'rad_to_deg' | 'arc'
    angleDeg: 30,
    radius: 3,
  });

  const predictBox = createPredictBox({
    prompt: 'Un arco mide exactamente lo mismo que el radio de la circunferencia (s = r). ¿Cuánto mide el ángulo central en grados?',
    options: [
      {
        label: 'Aproximadamente 57° 17\' 45" (un radián = 180° / π).',
        correct: true,
        explanation:
          'Como la circunferencia completa mide 2π·r y equivale a 360°, un arco igual a r corresponde a 360°/(2π) = 180°/π ≈ 57° 17\' 45".',
      },
      {
        label: '60° exactos.',
        correct: false,
        explanation:
          '60° corresponde a la cuerda igual al radio (triángulo equilátero), pero el arco curvo es más largo que la cuerda: 1 radián ≈ 57° 17\' 45" < 60°.',
      },
      {
        label: '1° exacto.',
        correct: false,
        explanation:
          'Un grado es 1/360 del giro completo (un arco muy pequeño); 1 radián barre s = r, casi un sexto de vuelta.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'arc', angleDeg: ONE_RAD_DEG, radius: 4 });
      setModeChip('arc');
      sliderAngle.input.value = String(Math.round(ONE_RAD_DEG));
      sliderAngle.output.textContent = '57,3° (1 rad)';
      sliderR.input.value = '4';
      sliderR.output.textContent = '4 cm';
    },
  });

  const board = createBoard(host, 'Conversor angular sexagesimal-circular y longitud de arco');
  host.prepend(predictBox);

  const bridgeBadge = h(
    'div',
    { class: 'trigr-bridge-badge' },
    'Puente curricular desde Funciones Trigonométricas · Equivalencia π rad ↔ 180°'
  );
  board.controls.append(bridgeBadge);

  const setModeChip = addChips(
    board.controls,
    [
      ['deg_to_rad', 'Grados DMS → Radianes'],
      ['rad_to_deg', 'Radianes exactos → DMS'],
      ['arc', 'Longitud de arco s = r · θ'],
    ],
    'deg_to_rad',
    (m) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ mode: m });
    },
    'Modo de conversión angular'
  );

  const PRESETS = [
    ['p30', '30° (π/6)'],
    ['p70', '70° (7π/18)'],
    ['p120', '120° 30\' (241π/360)'],
    ['p1rad', '1 rad (s = r)'],
    ['p3rad', '3 rad (171° 53\' 14")'],
  ];

  const setPresetChip = addChips(
    board.controls,
    PRESETS,
    'p30',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      if (id === 'p30') {
        store.set({ angleDeg: 30, radius: 3 });
      } else if (id === 'p70') {
        store.set({ angleDeg: 70 });
      } else if (id === 'p120') {
        store.set({ angleDeg: 120.5 });
      } else if (id === 'p1rad') {
        store.set({ mode: 'arc', angleDeg: ONE_RAD_DEG });
        setModeChip('arc');
      } else if (id === 'p3rad') {
        store.set({ mode: 'rad_to_deg', angleDeg: (3 * 180) / Math.PI });
        setModeChip('rad_to_deg');
      }
      const st = store.get();
      sliderAngle.input.value = String(clamp(Math.round(st.angleDeg), 0, 360));
      sliderAngle.output.textContent = `${fmtNumberEsAR(st.angleDeg, 1)}°`;
    },
    'Ángulos notables y de referencia'
  );

  const sliderAngle = addRange(
    board.controls,
    store,
    'angleDeg',
    'Ángulo central θ (°)',
    0,
    360,
    30,
    1,
    (v) => `${fmtNumberEsAR(v, 1)}°`
  );
  const sliderR = addRange(
    board.controls,
    store,
    'radius',
    'Radio r (cm)',
    1,
    10,
    3,
    0.5,
    (v) => `${fmtNumberEsAR(v, 1)} cm`
  );
  sliderAngle.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    setPresetChip('custom');
  });
  sliderR.input.addEventListener('input', () => predictBox.notifyInteraction());

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'deg_to_rad', angleDeg: 30, radius: 3 });
    setModeChip('deg_to_rad');
    setPresetChip('p30');
    sliderAngle.input.value = '30';
    sliderAngle.output.textContent = '30°';
    sliderR.input.value = '3';
    sliderR.output.textContent = '3 cm';
  });
  board.actions.append(btnReset);

  // Persistent SVG layers inside board.clipped (640 x 340)
  const cx = 165;
  const cy = 148;
  const maxRpx = 96;

  const circleOutline = s('circle', {
    cx,
    cy,
    r: maxRpx,
    fill: 'rgba(236, 242, 232, 0.03)',
    stroke: 'rgba(236, 242, 232, 0.3)',
    'stroke-width': 1.5,
  });
  const baseRadiusLine = s('line', {
    x1: cx,
    y1: cy,
    x2: cx + maxRpx,
    y2: cy,
    stroke: 'var(--blue)',
    'stroke-width': 3,
    'stroke-linecap': 'round',
  });
  const termRadiusLine = s('line', {
    stroke: 'var(--ink)',
    'stroke-width': 2.2,
    'stroke-linecap': 'round',
  });
  const sectorFill = s('path', { fill: 'rgba(246, 211, 101, 0.14)', stroke: 'none' });
  const arcPath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 4.5,
    'stroke-linecap': 'round',
  });
  const circleTip = s('circle', { r: 6, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });

  // Unwrapped arc ruler (bottom) + Reference radius bar r (top-right comparison)
  const rulerTrack = s('line', {
    x1: 70,
    y1: 292,
    x2: 570,
    y2: 292,
    stroke: 'rgba(236, 242, 232, 0.25)',
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  const rulerArc = s('line', {
    x1: 70,
    y1: 292,
    x2: 70,
    y2: 292,
    stroke: 'var(--yellow)',
    'stroke-width': 5,
    'stroke-linecap': 'round',
  });
  const oneRadTick = s('line', {
    stroke: 'var(--green)',
    'stroke-width': 2,
    'stroke-dasharray': '3 3',
  });
  const lblOneRad = s('text', { class: 'trigr-svg-label', fill: 'var(--green)', 'text-anchor': 'middle' }, '1 rad (s = r)');

  // Right-side conversion card text nodes inside SVG
  const lblCircleCenter = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)', x: cx + 22, y: cy + 16 });
  const lblArcCircle = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)' });
  const lblConvTitle = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)', x: 320, y: 58, 'font-weight': '700' });
  const lblConvLine1 = s('text', { class: 'trigr-svg-label', fill: 'var(--ink)', x: 320, y: 88 });
  const lblConvLine2 = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)', x: 320, y: 118 });
  const lblConvLine3 = s('text', { class: 'trigr-svg-label', fill: 'var(--green)', x: 320, y: 148 });
  const lblConvLine4 = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)', x: 320, y: 178 });
  const lblRulerTitle = s('text', { class: 'trigr-svg-label', fill: 'var(--muted)', x: 70, y: 274 });

  const dragHitAngle = s('circle', {
    r: 16,
    fill: 'transparent',
    style: 'cursor: grab; touch-action: none;',
  });
  const dragDotAngle = s('circle', {
    r: 7,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    style: 'pointer-events: none;',
  });

  board.clipped.append(
    sectorFill,
    circleOutline,
    baseRadiusLine,
    termRadiusLine,
    arcPath,
    circleTip,
    rulerTrack,
    rulerArc,
    oneRadTick,
    lblOneRad,
    lblCircleCenter,
    lblArcCircle,
    lblConvTitle,
    lblConvLine1,
    lblConvLine2,
    lblConvLine3,
    lblConvLine4,
    lblRulerTitle,
    dragDotAngle,
    dragHitAngle
  );

  const mapper = createBoxMapper({
    xMin: 0,
    xMax: 360,
    yMin: 0,
    yMax: 10,
    pxLeft: 70,
    pxRight: 570,
    pxBottom: 292,
    pxTop: 292,
  });

  attachSvgDrag(
    board.svg,
    dragHitAngle,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const nextDeg = clamp(Math.round(x), 0, 360);
      store.set({ angleDeg: nextDeg });
      sliderAngle.input.value = String(nextDeg);
      sliderAngle.output.textContent = `${fmtNumberEsAR(nextDeg, 1)}°`;
      setPresetChip('custom');
    },
    { ariaLabel: 'Deslizar el arco desenrollado para variar el ángulo central en grados y radianes', stepX: 15, stepY: 15 }
  );

  const render = () => {
    const st = store.get();
    const deg = clamp(st.angleDeg, 0, 360);
    const rad = (deg * Math.PI) / 180;
    const visR = 46 + (st.radius / 10) * 50; // 51..96 px

    circleOutline.setAttribute('r', String(visR));
    baseRadiusLine.setAttribute('x2', String(cx + visR));

    const tipX = cx + visR * Math.cos(rad);
    const tipY = cy - visR * Math.sin(rad);
    termRadiusLine.setAttribute('x1', String(cx));
    termRadiusLine.setAttribute('y1', String(cy));
    termRadiusLine.setAttribute('x2', tipX.toFixed(1));
    termRadiusLine.setAttribute('y2', tipY.toFixed(1));
    circleTip.setAttribute('cx', tipX.toFixed(1));
    circleTip.setAttribute('cy', tipY.toFixed(1));

    if (deg <= 0.1) {
      arcPath.setAttribute('d', '');
      sectorFill.setAttribute('d', '');
    } else if (deg >= 359.9) {
      arcPath.setAttribute(
        'd',
        `M ${cx + visR} ${cy} A ${visR} ${visR} 0 1 0 ${cx - visR} ${cy} A ${visR} ${visR} 0 1 0 ${cx + visR} ${cy}`
      );
      sectorFill.setAttribute(
        'd',
        `M ${cx + visR} ${cy} A ${visR} ${visR} 0 1 0 ${cx - visR} ${cy} A ${visR} ${visR} 0 1 0 ${cx + visR} ${cy} Z`
      );
    } else {
      const largeArc = deg > 180 ? 1 : 0;
      arcPath.setAttribute(
        'd',
        `M ${cx + visR} ${cy} A ${visR} ${visR} 0 ${largeArc} 0 ${tipX.toFixed(1)} ${tipY.toFixed(1)}`
      );
      sectorFill.setAttribute(
        'd',
        `M ${cx} ${cy} L ${cx + visR} ${cy} A ${visR} ${visR} 0 ${largeArc} 0 ${tipX.toFixed(1)} ${tipY.toFixed(1)} Z`
      );
    }

    // Ruler mapping: 0..360 deg on [70..570]
    const handleX = mapper.toX(deg);
    const handleY = 292;
    rulerArc.setAttribute('x2', handleX.toFixed(1));
    dragHitAngle.setAttribute('cx', handleX.toFixed(1));
    dragHitAngle.setAttribute('cy', String(handleY));
    dragHitAngle.setAttribute('aria-valuenow', String(Math.round(deg)));
    dragDotAngle.setAttribute('cx', handleX.toFixed(1));
    dragDotAngle.setAttribute('cy', String(handleY));

    const oneRadX = mapper.toX(ONE_RAD_DEG);
    oneRadTick.setAttribute('x1', oneRadX.toFixed(1));
    oneRadTick.setAttribute('y1', '278');
    oneRadTick.setAttribute('x2', oneRadX.toFixed(1));
    oneRadTick.setAttribute('y2', '306');
    lblOneRad.setAttribute('x', oneRadX.toFixed(1));
    lblOneRad.setAttribute('y', '324');

    const dms = degToDms(deg, { precisionSec: 0 });
    let exactPiStr = `${fmtNumberEsAR(rad / Math.PI, 3)}π`;
    try {
      const halfSteps = Math.round(deg * 2);
      if (Math.abs(halfSteps / 2 - deg) < 1e-6) {
        exactPiStr = degToRadExact(rat(halfSteps, 2)).formattedPi;
      }
    } catch {}
    const arcLenNum = st.radius * rad;
    const isOneRad = Math.abs(deg - ONE_RAD_DEG) < 0.6;

    lblCircleCenter.textContent = `r = ${fmtNumberEsAR(st.radius, 1)} cm`;
    const midRad = rad / 2;
    lblArcCircle.setAttribute('x', (cx + (visR + 14) * Math.cos(midRad)).toFixed(1));
    lblArcCircle.setAttribute('y', (cy - (visR + 14) * Math.sin(midRad)).toFixed(1));
    lblArcCircle.setAttribute('text-anchor', Math.cos(midRad) < -0.2 ? 'end' : 'start');
    lblArcCircle.textContent = `s = ${fmtNumberEsAR(arcLenNum, 2)}`;

    lblRulerTitle.textContent = 'Arco desenrollado sobre la recta (0° a 360°): arrastrá o usá ← / →';

    if (st.mode === 'deg_to_rad') {
      lblConvTitle.textContent = 'Conversión Sexagesimal → Circular';
      lblConvLine1.textContent = `Ángulo DMS: ${dms.formatted}`;
      lblConvLine2.textContent = `Factor exacto: θ · (π / 180°) = ${exactPiStr} rad`;
      lblConvLine3.textContent = `Valor decimal: ${fmtNumberEsAR(rad, 4)} rad`;
      lblConvLine4.textContent = isOneRad ? '¡Justo 1 radián (s = r)!' : `Equivalencia: 180° ↔ π rad`;
    } else if (st.mode === 'rad_to_deg') {
      const approxBack = radToDeg(rad);
      lblConvTitle.textContent = 'Conversión Circular → Sexagesimal';
      lblConvLine1.textContent = `Radianes: ${exactPiStr} rad (${fmtNumberEsAR(rad, 4)})`;
      lblConvLine2.textContent = `Factor: θ_rad · (180° / π)`;
      lblConvLine3.textContent = `En DMS: ${approxBack.formatted}`;
      lblConvLine4.textContent = `Grados decimales: ${fmtNumberEsAR(deg, 2)}°`;
    } else {
      lblConvTitle.textContent = 'Longitud de Arco: s = r · θ_rad';
      lblConvLine1.textContent = `r = ${fmtNumberEsAR(st.radius, 1)} cm · θ = ${fmtNumberEsAR(rad, 4)} rad`;
      lblConvLine2.textContent = `s = ${fmtNumberEsAR(st.radius, 1)} · ${fmtNumberEsAR(rad, 4)} = ${fmtNumberEsAR(arcLenNum, 2)} cm`;
      lblConvLine3.textContent = `En grados: ${dms.formatted} (≠ ${fmtNumberEsAR(st.radius * deg, 1)} cm)`;
      lblConvLine4.textContent = isOneRad ? '¡s = r exacto en 1 radián!' : '¡Jamás uses grados en s = r · θ!';
    }

    const arcExact =
      Math.abs(Math.round(deg * 2) / 2 - deg) < 1e-6 && Number.isInteger(st.radius * 2)
        ? arcLength({ r: st.radius, angleDeg: deg }).formattedS
        : fmtNumberEsAR(arcLenNum, 2);

    renderReadout(board.readout, `Sistema Sexagesimal ↔ Circular (${dms.formatted})`, [
      ['Sexagesimal (DMS)', `${dms.formatted} (${fmtNumberEsAR(deg, 2)}°)`],
      ['Circular exacto', `${exactPiStr} rad (≈ ${fmtNumberEsAR(rad, 4)} rad)`],
      ['Arco s = r · θ_rad', `s = ${fmtNumberEsAR(arcLenNum, 2)} cm (exacto: ${arcExact} cm)`],
      ['Puente a U11', isOneRad ? 's = r ⇔ θ = 1 rad ≈ 57° 17\' 45"' : 'π rad = 180° · nunca metas grados directos en s = r·θ'],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
