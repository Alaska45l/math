/**
 * @file js/modules/razones-trigonometricas/widgets/geometria-poligonos-arcos.js
 * Widget 5 · Sec. 5 & Sec. 6: Polígonos regulares (n lados, semiángulo 180°/n, apotema, radio),
 * cuerdas, prisma 3D y puente oblicuángulo (Teorema del Coseno c² = a² + b² − 2ab·cos γ).
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
  solveRegularPolygon,
  solveChord,
  solvePrism3D,
  solveObliqueCosineLaw,
  fmtNumberEsAR,
} from '../logic.js';

export function initGeometriaPoligonosArcos(host) {
  if (!host) return null;

  const store = createStore({
    mode: 'polygon', // 'polygon' | 'chord' | 'prism3d' | 'oblique'
    n: 8,
    side: 20,
    chordAngle: 70,
    prismA: 6,
    gammaDeg: 125,
  });

  const predictBox = createPredictBox({
    prompt: 'En un octógono regular de lado 20 m, ¿qué ángulo agudo entra al triángulo rectángulo formado por apotema, radio y medio lado?',
    options: [
      {
        label: '22,5° = 360° / (2 · 8), porque la apotema parte a la mitad el ángulo central de 45°.',
        correct: true,
        explanation:
          'El ángulo central de un lado es 360°/8 = 45°, pero la apotema corta el triángulo isósceles al medio: cada triángulo rectángulo trabaja con 180°/8 = 22,5° y L/2 = 10 m.',
      },
      {
        label: '45° = 360° / 8, el ángulo central completo de un lado.',
        correct: false,
        explanation:
          '45° es el ángulo completo entre dos radios consecutivos; si usás 45° dentro del triángulo rectángulo duplicás el ángulo real de la apotema.',
      },
    ],
    onVerify: () => {
      store.set({ mode: 'polygon', n: 8, side: 20 });
      setModeChip('polygon');
      sliderPrimary.input.value = '8';
      sliderPrimary.output.textContent = '8';
      sliderSecondary.input.value = '20';
      sliderSecondary.output.textContent = '20';
    },
  });

  const board = createBoard(host, 'Geometría de polígonos regulares, cuerdas, cuerpos 3D y puente oblicuángulo');
  host.prepend(predictBox);

  const setModeChip = addChips(
    board.controls,
    [
      ['polygon', 'Polígonos n-lados'],
      ['chord', 'Cuerda y ángulo central'],
      ['prism3d', 'Prisma 3D'],
      ['oblique', 'Puente Oblicuángulo: Teorema del Coseno'],
    ],
    'polygon',
    (m) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ mode: m });
      syncSlidersForMode(m);
    },
    'Modo geométrico'
  );

  const sliderPrimary = addRange(
    board.controls,
    store,
    'n',
    'Lados del polígono (n)',
    3,
    12,
    8,
    1,
    (v) => fmtNumberEsAR(v, 0)
  );
  const sliderSecondary = addRange(
    board.controls,
    store,
    'gammaDeg',
    'Ángulo comprendido γ (°) / Lado',
    15,
    165,
    125,
    5,
    (v) => `${fmtNumberEsAR(v, 0)}°`
  );

  function syncSlidersForMode(m) {
    const st = store.get();
    if (m === 'polygon') {
      sliderPrimary.labelEl.querySelector('.field__label').textContent = 'Lados del polígono (n)';
      sliderPrimary.input.min = '3';
      sliderPrimary.input.max = '12';
      sliderPrimary.input.step = '1';
      sliderPrimary.input.value = String(st.n);
      sliderPrimary.output.textContent = `${st.n} lados`;

      sliderSecondary.labelEl.querySelector('.field__label').textContent = 'Longitud del lado L (m)';
      sliderSecondary.input.min = '4';
      sliderSecondary.input.max = '30';
      sliderSecondary.input.step = '2';
      sliderSecondary.input.value = String(st.side);
      sliderSecondary.output.textContent = `${st.side} m`;
    } else if (m === 'chord') {
      sliderPrimary.labelEl.querySelector('.field__label').textContent = 'Ángulo central θ (°)';
      sliderPrimary.input.min = '20';
      sliderPrimary.input.max = '160';
      sliderPrimary.input.step = '5';
      sliderPrimary.input.value = String(st.chordAngle);
      sliderPrimary.output.textContent = `${st.chordAngle}°`;

      sliderSecondary.labelEl.querySelector('.field__label').textContent = 'Radio r (cm)';
      sliderSecondary.input.min = '4';
      sliderSecondary.input.max = '30';
      sliderSecondary.input.step = '2';
      sliderSecondary.input.value = String(st.side);
      sliderSecondary.output.textContent = `${st.side} cm`;
    } else if (m === 'prism3d') {
      sliderPrimary.labelEl.querySelector('.field__label').textContent = 'Arista base a (cm)';
      sliderPrimary.input.min = '3';
      sliderPrimary.input.max = '12';
      sliderPrimary.input.step = '1';
      sliderPrimary.input.value = String(st.prismA);
      sliderPrimary.output.textContent = `${st.prismA} cm`;

      sliderSecondary.labelEl.querySelector('.field__label').textContent = 'Altura c (cm)';
      sliderSecondary.input.min = '4';
      sliderSecondary.input.max = '24';
      sliderSecondary.input.step = '2';
      sliderSecondary.input.value = String(clamp(st.side, 4, 24));
      sliderSecondary.output.textContent = `${clamp(st.side, 4, 24)} cm`;
    } else {
      sliderPrimary.labelEl.querySelector('.field__label').textContent = 'Lado a (km / m)';
      sliderPrimary.input.min = '3';
      sliderPrimary.input.max = '12';
      sliderPrimary.input.step = '1';
      sliderPrimary.input.value = String(st.prismA);
      sliderPrimary.output.textContent = `${st.prismA}`;

      sliderSecondary.labelEl.querySelector('.field__label').textContent = 'Ángulo comprendido γ (°)';
      sliderSecondary.input.min = '15';
      sliderSecondary.input.max = '165';
      sliderSecondary.input.step = '5';
      sliderSecondary.input.value = String(st.gammaDeg);
      sliderSecondary.output.textContent = `${st.gammaDeg}°`;
    }
  }

  sliderPrimary.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    const val = Number(sliderPrimary.input.value);
    const m = store.get().mode;
    if (m === 'polygon') {
      store.set({ n: clamp(Math.round(val), 3, 12) });
      sliderPrimary.output.textContent = `${Math.round(val)} lados`;
    } else if (m === 'chord') {
      store.set({ chordAngle: clamp(val, 20, 160) });
      sliderPrimary.output.textContent = `${val}°`;
    } else {
      store.set({ prismA: clamp(val, 3, 12) });
      sliderPrimary.output.textContent = `${val}`;
    }
  });

  sliderSecondary.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    const val = Number(sliderSecondary.input.value);
    const m = store.get().mode;
    if (m === 'oblique') {
      store.set({ gammaDeg: clamp(val, 15, 165) });
      sliderSecondary.output.textContent = `${val}°`;
    } else {
      store.set({ side: clamp(val, 4, 30) });
      sliderSecondary.output.textContent = `${val}`;
    }
  });

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ mode: 'polygon', n: 8, side: 20, chordAngle: 70, prismA: 6, gammaDeg: 125 });
    setModeChip('polygon');
    syncSlidersForMode('polygon');
  });
  board.actions.append(btnReset);

  // Persistent SVG primitives inside board.clipped
  const mainShape = s('polygon', {
    fill: 'rgba(236, 242, 232, 0.04)',
    stroke: 'rgba(236, 242, 232, 0.35)',
    'stroke-width': 2,
  });
  const auxCircle = s('circle', {
    fill: 'none',
    stroke: 'rgba(130, 198, 255, 0.28)',
    'stroke-width': 1.5,
    'stroke-dasharray': '4 4',
  });
  const rightTriFill = s('polygon', {
    fill: 'rgba(246, 211, 101, 0.16)',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
    'stroke-linejoin': 'round',
  });
  const apothemLine = s('line', { stroke: 'var(--green)', 'stroke-width': 3 });
  const radiusLine = s('line', { stroke: 'var(--pink)', 'stroke-width': 3 });
  const halfSideLine = s('line', { stroke: 'var(--blue)', 'stroke-width': 3.5 });
  const extraEdge1 = s('line', { stroke: 'rgba(236, 242, 232, 0.4)', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' });
  const extraEdge2 = s('line', { stroke: 'rgba(236, 242, 232, 0.4)', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' });
  const rightMark = s('polyline', { fill: 'none', stroke: 'var(--green)', 'stroke-width': 2 });

  const lbl1 = s('text', { class: 'trigr-svg-label', fill: 'var(--green)' });
  const lbl2 = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' });
  const lbl3 = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)' });
  const lbl4 = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)' });
  const lblInfo = s('text', { class: 'trigr-svg-label', fill: 'var(--ink)', x: 355, y: 74 });
  const lblInfo2 = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)', x: 355, y: 106 });
  const lblInfo3 = s('text', { class: 'trigr-svg-label', fill: 'var(--green)', x: 355, y: 138 });
  const lblInfo4 = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)', x: 355, y: 170 });

  // Horizontal slider track inside SVG for keyboard/pointer handle so ArrowRight/Left always behaves monotonically
  const handleTrack = s('line', {
    x1: 355,
    y1: 268,
    x2: 595,
    y2: 268,
    stroke: 'rgba(236, 242, 232, 0.25)',
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  const lblHandle = s('text', { class: 'trigr-svg-label', fill: 'var(--muted)', x: 355, y: 248 });
  const dragHit = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const dragDot = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  board.clipped.append(
    auxCircle,
    mainShape,
    extraEdge1,
    extraEdge2,
    rightTriFill,
    apothemLine,
    radiusLine,
    halfSideLine,
    rightMark,
    lbl1,
    lbl2,
    lbl3,
    lbl4,
    lblInfo,
    lblInfo2,
    lblInfo3,
    lblInfo4,
    handleTrack,
    lblHandle,
    dragDot,
    dragHit
  );

  const getMapper = () => {
    const m = store.get().mode;
    if (m === 'polygon') {
      return createBoxMapper({ xMin: 3, xMax: 12, yMin: 0, yMax: 10, pxLeft: 355, pxRight: 595, pxBottom: 268, pxTop: 268 });
    }
    if (m === 'chord') {
      return createBoxMapper({ xMin: 20, xMax: 160, yMin: 0, yMax: 10, pxLeft: 355, pxRight: 595, pxBottom: 268, pxTop: 268 });
    }
    if (m === 'prism3d') {
      return createBoxMapper({ xMin: 3, xMax: 12, yMin: 0, yMax: 10, pxLeft: 355, pxRight: 595, pxBottom: 268, pxTop: 268 });
    }
    return createBoxMapper({ xMin: 15, xMax: 165, yMin: 0, yMax: 10, pxLeft: 355, pxRight: 595, pxBottom: 268, pxTop: 268 });
  };

  attachSvgDrag(
    board.svg,
    dragHit,
    getMapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const m = store.get().mode;
      if (m === 'polygon') {
        const nextN = clamp(Math.round(x), 3, 12);
        store.set({ n: nextN });
      } else if (m === 'chord') {
        const nextA = clamp(Math.round(x / 5) * 5, 20, 160);
        store.set({ chordAngle: nextA });
      } else if (m === 'prism3d') {
        const nextP = clamp(Math.round(x), 3, 12);
        store.set({ prismA: nextP });
      } else {
        const nextG = clamp(Math.round(x / 5) * 5, 15, 165);
        store.set({ gammaDeg: nextG });
      }
      syncSlidersForMode(m);
    },
    { ariaLabel: 'Ajustar parámetro geométrico (lados n, ángulo central, arista o ángulo γ)', stepX: 5, stepY: 1 }
  );

  const render = () => {
    const st = store.get();
    const m = st.mode;
    const mapper = getMapper();

    const cx = 175;
    const cy = 170;
    const visR = 112;

    if (m === 'polygon') {
      const poly = solveRegularPolygon({ n: st.n, side: st.side });
      const pts = [];
      const startAngle = Math.PI / 2 - Math.PI / st.n;
      for (let i = 0; i < st.n; i++) {
        const ang = startAngle + (i * 2 * Math.PI) / st.n;
        pts.push(`${(cx + visR * Math.cos(ang)).toFixed(1)},${(cy + visR * Math.sin(ang)).toFixed(1)}`);
      }
      mainShape.setAttribute('points', pts.join(' '));
      mainShape.setAttribute('visibility', 'visible');

      auxCircle.setAttribute('cx', String(cx));
      auxCircle.setAttribute('cy', String(cy));
      auxCircle.setAttribute('r', String(visR));
      auxCircle.setAttribute('visibility', 'visible');

      // Bottom horizontal side vertices:
      const a0 = Math.PI / 2 - Math.PI / st.n;
      const a1 = Math.PI / 2 + Math.PI / st.n;
      const vx1 = cx + visR * Math.cos(a0);
      const vy1 = cy + visR * Math.sin(a0);
      const mx = cx;
      const my = vy1;

      rightTriFill.setAttribute('points', `${cx},${cy} ${mx.toFixed(1)},${my.toFixed(1)} ${vx1.toFixed(1)},${vy1.toFixed(1)}`);
      apothemLine.setAttribute('x1', String(cx));
      apothemLine.setAttribute('y1', String(cy));
      apothemLine.setAttribute('x2', String(mx));
      apothemLine.setAttribute('y2', my.toFixed(1));
      apothemLine.setAttribute('visibility', 'visible');

      radiusLine.setAttribute('x1', String(cx));
      radiusLine.setAttribute('y1', String(cy));
      radiusLine.setAttribute('x2', vx1.toFixed(1));
      radiusLine.setAttribute('y2', vy1.toFixed(1));
      radiusLine.setAttribute('visibility', 'visible');

      halfSideLine.setAttribute('x1', String(mx));
      halfSideLine.setAttribute('y1', my.toFixed(1));
      halfSideLine.setAttribute('x2', vx1.toFixed(1));
      halfSideLine.setAttribute('y2', vy1.toFixed(1));
      halfSideLine.setAttribute('visibility', 'visible');

      extraEdge1.setAttribute('visibility', 'hidden');
      extraEdge2.setAttribute('visibility', 'hidden');
      rightMark.setAttribute('points', `${mx + 10},${my} ${mx + 10},${my - 10} ${mx},${my - 10}`);
      rightMark.setAttribute('visibility', 'visible');

      lbl1.setAttribute('x', String(cx - 10));
      lbl1.setAttribute('y', String((cy + my) / 2));
      lbl1.setAttribute('text-anchor', 'end');
      lbl1.textContent = `ap = ${fmtNumberEsAR(poly.apothem, 2)}`;

      lbl2.setAttribute('x', String((cx + vx1) / 2 + 12));
      lbl2.setAttribute('y', String((cy + vy1) / 2));
      lbl2.textContent = `r = ${fmtNumberEsAR(poly.radius, 2)}`;

      lbl3.setAttribute('x', String((mx + vx1) / 2));
      lbl3.setAttribute('y', String(my + 18));
      lbl3.setAttribute('text-anchor', 'middle');
      lbl3.textContent = `L/2 = ${fmtNumberEsAR(st.side / 2, 1)}`;

      lbl4.setAttribute('x', String(cx + 8));
      lbl4.setAttribute('y', String(cy + 36));
      lbl4.textContent = `${fmtNumberEsAR(poly.halfAngleDeg, 1)}°`;

      lblInfo.textContent = `Polígono regular de n = ${st.n} lados (L = ${st.side} m)`;
      lblInfo2.textContent = `Semiángulo central: 180° / ${st.n} = ${fmtNumberEsAR(poly.halfAngleDeg, 2)}°`;
      lblInfo3.textContent = `Apotema: (L/2) / tg(${fmtNumberEsAR(poly.halfAngleDeg, 1)}°) = ${fmtNumberEsAR(poly.apothem, 2)} m`;
      lblInfo4.textContent = `Área total: (P · ap) / 2 = ${fmtNumberEsAR(poly.area, 2)} m²`;

      lblHandle.textContent = 'Deslizador de lados n (3..12) · ← / →';
      const hx = mapper.toX(st.n);
      dragHit.setAttribute('cx', hx.toFixed(1));
      dragHit.setAttribute('cy', '268');
      dragHit.setAttribute('aria-valuenow', String(st.n));
      dragDot.setAttribute('cx', hx.toFixed(1));
      dragDot.setAttribute('cy', '268');

      renderReadout(board.readout, `Polígono regular de ${st.n} lados (lado L = ${st.side} m)`, [
        ['Semiángulo rectángulo', `180° / ${st.n} = ${fmtNumberEsAR(poly.halfAngleDeg, 2)}° (mitad de ${fmtNumberEsAR(poly.centralAngleDeg, 2)}°)`],
        ['Apotema (cateto adyacente)', `${fmtNumberEsAR(poly.apothem, 2)} m`],
        ['Radio circunscripto (hip.)', `${fmtNumberEsAR(poly.radius, 2)} m`],
        ['Perímetro y Área', `P = ${fmtNumberEsAR(poly.perimeter, 1)} m · Área = ${fmtNumberEsAR(poly.area, 2)} m²`],
      ]);
    } else if (m === 'chord') {
      const ch = solveChord({ r: st.side, centralAngleDeg: st.chordAngle });
      const halfRad = ((st.chordAngle / 2) * Math.PI) / 180;
      const p1x = cx - visR * Math.sin(halfRad);
      const p1y = cy + visR * Math.cos(halfRad);
      const p2x = cx + visR * Math.sin(halfRad);
      const p2y = p1y;
      const mx = cx;
      const my = p1y;

      mainShape.setAttribute('visibility', 'hidden');
      auxCircle.setAttribute('cx', String(cx));
      auxCircle.setAttribute('cy', String(cy));
      auxCircle.setAttribute('r', String(visR));
      auxCircle.setAttribute('visibility', 'visible');

      rightTriFill.setAttribute('points', `${cx},${cy} ${mx},${my.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`);
      apothemLine.setAttribute('x1', String(cx));
      apothemLine.setAttribute('y1', String(cy));
      apothemLine.setAttribute('x2', String(mx));
      apothemLine.setAttribute('y2', my.toFixed(1));
      apothemLine.setAttribute('visibility', 'visible');

      radiusLine.setAttribute('x1', String(cx));
      radiusLine.setAttribute('y1', String(cy));
      radiusLine.setAttribute('x2', p2x.toFixed(1));
      radiusLine.setAttribute('y2', p2y.toFixed(1));
      radiusLine.setAttribute('visibility', 'visible');

      halfSideLine.setAttribute('x1', p1x.toFixed(1));
      halfSideLine.setAttribute('y1', p1y.toFixed(1));
      halfSideLine.setAttribute('x2', p2x.toFixed(1));
      halfSideLine.setAttribute('y2', p2y.toFixed(1));
      halfSideLine.setAttribute('visibility', 'visible');

      extraEdge1.setAttribute('x1', String(cx));
      extraEdge1.setAttribute('y1', String(cy));
      extraEdge1.setAttribute('x2', p1x.toFixed(1));
      extraEdge1.setAttribute('y2', p1y.toFixed(1));
      extraEdge1.setAttribute('visibility', 'visible');
      extraEdge2.setAttribute('visibility', 'hidden');

      rightMark.setAttribute('points', `${mx + 10},${my} ${mx + 10},${my - 10} ${mx},${my - 10}`);
      rightMark.setAttribute('visibility', 'visible');

      lbl1.setAttribute('x', String(cx - 8));
      lbl1.setAttribute('y', String((cy + my) / 2));
      lbl1.setAttribute('text-anchor', 'end');
      lbl1.textContent = `d = ${fmtNumberEsAR(ch.apothem, 2)}`;

      lbl2.setAttribute('x', String((cx + p2x) / 2 + 10));
      lbl2.setAttribute('y', String((cy + p2y) / 2));
      lbl2.textContent = `r = ${st.side}`;

      lbl3.setAttribute('x', String(cx));
      lbl3.setAttribute('y', String(my + 20));
      lbl3.setAttribute('text-anchor', 'middle');
      lbl3.textContent = `Cuerda = ${fmtNumberEsAR(ch.chord, 2)}`;

      lbl4.setAttribute('x', String(cx + 8));
      lbl4.setAttribute('y', String(cy + 34));
      lbl4.textContent = `θ/2 = ${fmtNumberEsAR(st.chordAngle / 2, 1)}°`;

      lblInfo.textContent = `Cuerda con r = ${st.side} cm y θ = ${st.chordAngle}°`;
      lblInfo2.textContent = `Semiángulo: θ/2 = ${fmtNumberEsAR(st.chordAngle / 2, 1)}°`;
      lblInfo3.textContent = `Cuerda: 2·r·sen(θ/2) = ${fmtNumberEsAR(ch.chord, 2)} cm`;
      lblInfo4.textContent = `Distancia al centro: r·cos(θ/2) = ${fmtNumberEsAR(ch.apothem, 2)} cm`;

      lblHandle.textContent = 'Deslizador de ángulo central θ (20°..160°) · ← / →';
      const hx = mapper.toX(st.chordAngle);
      dragHit.setAttribute('cx', hx.toFixed(1));
      dragHit.setAttribute('cy', '268');
      dragHit.setAttribute('aria-valuenow', String(st.chordAngle));
      dragDot.setAttribute('cx', hx.toFixed(1));
      dragDot.setAttribute('cy', '268');

      renderReadout(board.readout, `Cuerda en circunferencia (r = ${st.side} cm, θ = ${st.chordAngle}°)`, [
        ['Semiángulo central', `${fmtNumberEsAR(st.chordAngle / 2, 1)}°`],
        ['Longitud de la cuerda', `${fmtNumberEsAR(ch.chord, 2)} cm`],
        ['Distancia centro-cuerda', `${fmtNumberEsAR(ch.apothem, 2)} cm`],
        ['Relación clave', 'Cuerda / 2 = r · sen(θ / 2)'],
      ]);
    } else if (m === 'prism3d') {
      const bVal = 8;
      const cVal = clamp(st.side, 4, 24);
      const pr = solvePrism3D({ a: st.prismA, b: bVal, c: cVal });

      auxCircle.setAttribute('visibility', 'hidden');
      mainShape.setAttribute('visibility', 'hidden');

      // Draw 3D box projection
      const bx0 = 100;
      const by0 = 245;
      const wPx = 115;
      const dPxX = 55;
      const dPxY = -36;
      const hPx = clamp(cVal * 6, 48, 140);

      // Base corners: FBL(bx0,by0), FBR(bx0+wPx,by0), BBR(bx0+wPx+dPxX, by0+dPxY), BBL(bx0+dPxX, by0+dPxY)
      const fbl = [bx0, by0];
      const fbr = [bx0 + wPx, by0];
      const bbr = [bx0 + wPx + dPxX, by0 + dPxY];
      const bbl = [bx0 + dPxX, by0 + dPxY];
      const tbr = [bbr[0], bbr[1] - hPx];
      const tbl = [bbl[0], bbl[1] - hPx];
      const tfl = [fbl[0], fbl[1] - hPx];
      const tfr = [fbr[0], fbr[1] - hPx];

      rightTriFill.setAttribute('points', `${fbl[0]},${fbl[1]} ${bbr[0]},${bbr[1]} ${tbr[0]},${tbr[1]}`);
      extraEdge1.setAttribute(
        'x1', String(fbl[0])
      );
      extraEdge1.setAttribute('y1', String(fbl[1]));
      extraEdge1.setAttribute('x2', String(fbr[0]));
      extraEdge1.setAttribute('y2', String(fbr[1]));
      extraEdge1.setAttribute('visibility', 'visible');

      extraEdge2.setAttribute('x1', String(fbr[0]));
      extraEdge2.setAttribute('y1', String(fbr[1]));
      extraEdge2.setAttribute('x2', String(bbr[0]));
      extraEdge2.setAttribute('y2', String(bbr[1]));
      extraEdge2.setAttribute('visibility', 'visible');

      mainShape.setAttribute(
        'points',
        `${fbl[0]},${fbl[1]} ${fbr[0]},${fbr[1]} ${tfr[0]},${tfr[1]} ${tfl[0]},${tfl[1]}`
      );
      mainShape.setAttribute('visibility', 'visible');

      halfSideLine.setAttribute('x1', String(fbl[0]));
      halfSideLine.setAttribute('y1', String(fbl[1]));
      halfSideLine.setAttribute('x2', String(bbr[0]));
      halfSideLine.setAttribute('y2', String(bbr[1]));
      halfSideLine.setAttribute('visibility', 'visible');

      apothemLine.setAttribute('x1', String(bbr[0]));
      apothemLine.setAttribute('y1', String(bbr[1]));
      apothemLine.setAttribute('x2', String(tbr[0]));
      apothemLine.setAttribute('y2', String(tbr[1]));
      apothemLine.setAttribute('visibility', 'visible');

      radiusLine.setAttribute('x1', String(fbl[0]));
      radiusLine.setAttribute('y1', String(fbl[1]));
      radiusLine.setAttribute('x2', String(tbr[0]));
      radiusLine.setAttribute('y2', String(tbr[1]));
      radiusLine.setAttribute('visibility', 'visible');

      rightMark.setAttribute('points', `${bbr[0] - 10},${bbr[1]} ${bbr[0] - 10},${bbr[1] - 10} ${bbr[0]},${bbr[1] - 10}`);
      rightMark.setAttribute('visibility', 'visible');

      lbl1.setAttribute('x', String(bbr[0] + 10));
      lbl1.setAttribute('y', String((bbr[1] + tbr[1]) / 2));
      lbl1.setAttribute('text-anchor', 'start');
      lbl1.textContent = `c = ${cVal}`;

      lbl2.setAttribute('x', String((fbl[0] + tbr[0]) / 2 - 12));
      lbl2.setAttribute('y', String((fbl[1] + tbr[1]) / 2 - 8));
      lbl2.textContent = `D = ${fmtNumberEsAR(pr.spaceDiagonal, 2)}`;

      lbl3.setAttribute('x', String((fbl[0] + bbr[0]) / 2));
      lbl3.setAttribute('y', String((fbl[1] + bbr[1]) / 2 + 16));
      lbl3.setAttribute('text-anchor', 'middle');
      lbl3.textContent = `d_base = ${fmtNumberEsAR(pr.baseDiagonal, 2)}`;

      lbl4.setAttribute('x', String(fbl[0] + 28));
      lbl4.setAttribute('y', String(fbl[1] - 10));
      lbl4.textContent = `α = ${fmtNumberEsAR(pr.angleWithBaseDeg, 1)}°`;

      lblInfo.textContent = `Prisma rectangular a=${st.prismA}, b=${bVal}, c=${cVal}`;
      lblInfo2.textContent = `1. Diagonal base: d = √(a² + b²) = ${fmtNumberEsAR(pr.baseDiagonal, 2)}`;
      lblInfo3.textContent = `2. Diagonal espacial: D = √(d² + c²) = ${fmtNumberEsAR(pr.spaceDiagonal, 2)}`;
      lblInfo4.textContent = `3. Ángulo con la base: ${pr.dmsAngle.formatted}`;

      lblHandle.textContent = 'Deslizador de arista base a (3..12) · ← / →';
      const hx = mapper.toX(st.prismA);
      dragHit.setAttribute('cx', hx.toFixed(1));
      dragHit.setAttribute('cy', '268');
      dragHit.setAttribute('aria-valuenow', String(st.prismA));
      dragDot.setAttribute('cx', hx.toFixed(1));
      dragDot.setAttribute('cy', '268');

      renderReadout(board.readout, `Prisma rectangular (${st.prismA} × ${bVal} × ${cVal} cm)`, [
        ['Diagonal de la base', `√(${st.prismA}² + ${bVal}²) = ${fmtNumberEsAR(pr.baseDiagonal, 2)} cm`],
        ['Diagonal espacial D', `√(${st.prismA}² + ${bVal}² + ${cVal}²) = ${fmtNumberEsAR(pr.spaceDiagonal, 2)} cm`],
        ['Ángulo D con el piso', `${pr.dmsAngle.formatted} (tg α = c / d_base)`],
        ['Dos Pitágoras en cadena', 'Nunca sumes sin raíz cuadrada ni olvides el 2.º triángulo vertical'],
      ]);
    } else {
      // oblique bridge: Law of Cosines
      const aVal = st.prismA; // 3..12
      const bVal = 8;
      const obl = solveObliqueCosineLaw({ sideA: aVal, sideB: bVal, angleIncludedDeg: st.gammaDeg });

      auxCircle.setAttribute('visibility', 'hidden');
      mainShape.setAttribute('visibility', 'hidden');
      extraEdge1.setAttribute('visibility', 'hidden');
      extraEdge2.setAttribute('visibility', 'hidden');
      rightMark.setAttribute('visibility', 'hidden');

      const ox = 165;
      const oy = 235;
      const scalePx = 12;
      const bx = ox + bVal * scalePx;
      const by = oy;
      const radG = (st.gammaDeg * Math.PI) / 180;
      const ax = ox + aVal * scalePx * Math.cos(radG);
      const ay = oy - aVal * scalePx * Math.sin(radG);

      rightTriFill.setAttribute('points', `${ox},${oy} ${bx},${by} ${ax.toFixed(1)},${ay.toFixed(1)}`);

      halfSideLine.setAttribute('x1', String(ox));
      halfSideLine.setAttribute('y1', String(oy));
      halfSideLine.setAttribute('x2', String(bx));
      halfSideLine.setAttribute('y2', String(by));
      halfSideLine.setAttribute('visibility', 'visible');

      apothemLine.setAttribute('x1', String(ox));
      apothemLine.setAttribute('y1', String(oy));
      apothemLine.setAttribute('x2', ax.toFixed(1));
      apothemLine.setAttribute('y2', ay.toFixed(1));
      apothemLine.setAttribute('visibility', 'visible');

      radiusLine.setAttribute('x1', String(bx));
      radiusLine.setAttribute('y1', String(by));
      radiusLine.setAttribute('x2', ax.toFixed(1));
      radiusLine.setAttribute('y2', ay.toFixed(1));
      radiusLine.setAttribute('visibility', 'visible');

      lbl1.setAttribute('x', String((ox + ax) / 2 - 12));
      lbl1.setAttribute('y', String((oy + ay) / 2));
      lbl1.setAttribute('text-anchor', 'end');
      lbl1.textContent = `a = ${aVal}`;

      lbl2.setAttribute('x', String((bx + ax) / 2 + 12));
      lbl2.setAttribute('y', String((by + ay) / 2 - 6));
      lbl2.textContent = `c = ${fmtNumberEsAR(obl.sideC, 2)}`;

      lbl3.setAttribute('x', String((ox + bx) / 2));
      lbl3.setAttribute('y', String(oy + 20));
      lbl3.setAttribute('text-anchor', 'middle');
      lbl3.textContent = `b = ${bVal}`;

      lbl4.setAttribute('x', String(ox + 16));
      lbl4.setAttribute('y', String(oy - 14));
      lbl4.textContent = `γ = ${st.gammaDeg}°`;

      const pythOnly = Math.hypot(aVal, bVal);
      const isRight = st.gammaDeg === 90;
      lblInfo.textContent = `Puente Oblicuángulo · Teorema del Coseno`;
      lblInfo2.textContent = `c² = a² + b² − 2ab·cos(${st.gammaDeg}°)`;
      lblInfo3.textContent = isRight
        ? `γ = 90° ⇒ cos(90°) = 0 ⇒ ¡Pitágoras exacto!`
        : `Corrector: −2ab·cos(γ) = ${fmtNumberEsAR(-2 * aVal * bVal * Math.cos(radG), 2)}`;
      lblInfo4.textContent = `c = ${fmtNumberEsAR(obl.sideC, 2)} (Pitágoras daría ${fmtNumberEsAR(pythOnly, 2)})`;

      lblHandle.textContent = 'Deslizador de ángulo γ (15°..165°, probá 90°) · ← / →';
      const hx = mapper.toX(st.gammaDeg);
      dragHit.setAttribute('cx', hx.toFixed(1));
      dragHit.setAttribute('cy', '268');
      dragHit.setAttribute('aria-valuenow', String(st.gammaDeg));
      dragDot.setAttribute('cx', hx.toFixed(1));
      dragDot.setAttribute('cy', '268');

      renderReadout(board.readout, `Puente Oblicuángulo (a = ${aVal}, b = ${bVal}, γ = ${st.gammaDeg}°)`, [
        ['Teorema del Coseno', `c = √(${aVal}² + ${bVal}² − 2·${aVal}·${bVal}·cos ${st.gammaDeg}°) = ${fmtNumberEsAR(obl.sideC, 2)}`],
        ['Ángulos restantes (Seno)', `A = ${fmtNumberEsAR(obl.angleA, 1)}° · B = ${fmtNumberEsAR(obl.angleB, 1)}°`],
        ['Área ½ a·b·sen(γ)', `${fmtNumberEsAR(obl.area, 2)}`],
        ['Caso frontera γ = 90°', isRight ? 'El corrector se anula y coincide con Pitágoras' : 'Si γ ≠ 90°, Pitágoras directo es inválido'],
      ]);
    }
  };

  store.subscribe(render);
  syncSlidersForMode('polygon');
  render();
  return { store, board };
}
