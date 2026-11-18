/**
 * @file js/modules/razones-trigonometricas/widgets/elevacion-depresion.js
 * Widget 3 · Sec. 3: Ángulos de elevación, depresión (alternos internos en Z) y doble observación.
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
import { solveElevationDepression, solveDoubleObservation, fmtNumberEsAR } from '../logic.js';

export function initElevacionDepresion(host) {
  if (!host) return null;

  const store = createStore({
    scenario: 'avion', // 'avion' | 'arbol_rio' | 'acantilado_faro' | 'montana_pueblos'
    height: 30,
    dist: 42,
  });

  const predictBox = createPredictBox({
    prompt: 'Desde la terraza ves un auto con ángulo de depresión de 35°. ¿Con qué ángulo de elevación te ve el conductor del auto?',
    options: [
      {
        label: 'Exactamente 35°, por ser alternos internos entre horizontales paralelas.',
        correct: true,
        explanation:
          'La horizontal de tus ojos y la horizontal del suelo son paralelas cortadas por la visual (forma de Z): depresión arriba = elevación abajo.',
      },
      {
        label: '55°, porque hay que restar 90° − 35°.',
        correct: false,
        explanation:
          '90° − 35° = 55° es el ángulo contra la pared vertical, no contra la horizontal. La elevación siempre se mide desde la horizontal.',
      },
    ],
    onVerify: () => {
      store.set({ scenario: 'avion', height: 28, dist: 40 });
      setScenarioChip('avion');
      sliderH.input.value = '28';
      sliderH.output.textContent = '28 m';
      sliderD.input.value = '40';
      sliderD.output.textContent = '40 m';
    },
  });

  const board = createBoard(host, 'Explorador de ángulos de elevación, depresión y doble observación');
  host.prepend(predictBox);

  const setScenarioChip = addChips(
    board.controls,
    [
      ['avion', 'Avión y pista (Z paralela)'],
      ['arbol_rio', 'Doble obs.: Árbol y río (mismo lado)'],
      ['acantilado_faro', 'Faro sobre acantilado (brecha vertical)'],
      ['montana_pueblos', 'Dos pueblos y montaña (lados opuestos)'],
    ],
    'avion',
    (sc) => {
      playClick();
      predictBox.notifyInteraction();
      if (sc === 'acantilado_faro') {
        store.set({ scenario: sc, height: 30, dist: 42 });
        sliderH.input.value = '30';
        sliderH.output.textContent = '30 m';
        sliderD.input.value = '42';
        sliderD.output.textContent = '42 m';
      } else if (sc === 'montana_pueblos') {
        store.set({ scenario: sc, height: 32.5, dist: 45 });
        sliderH.input.value = '32.5';
        sliderH.output.textContent = '33 m';
        sliderD.input.value = '45';
        sliderD.output.textContent = '45 m';
      } else {
        store.set({ scenario: sc });
      }
    },
    'Escenario topográfico'
  );

  const sliderH = addRange(board.controls, store, 'height', 'Altura / Parámetro vertical', 10, 60, 30, 1, (v) => `${fmtNumberEsAR(v, 0)} m`);
  const sliderD = addRange(board.controls, store, 'dist', 'Distancia / Base horizontal', 15, 80, 42, 1, (v) => `${fmtNumberEsAR(v, 0)} m`);
  sliderH.input.addEventListener('input', () => predictBox.notifyInteraction());
  sliderD.input.addEventListener('input', () => predictBox.notifyInteraction());

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ scenario: 'avion', height: 30, dist: 42 });
    setScenarioChip('avion');
    sliderH.input.value = '30';
    sliderH.output.textContent = '30 m';
    sliderD.input.value = '42';
    sliderD.output.textContent = '42 m';
  });
  board.actions.append(btnReset);

  // Persistent SVG layers
  const groundLine = s('line', { x1: 30, y1: 280, x2: 610, y2: 280, stroke: 'rgba(236, 242, 232, 0.45)', 'stroke-width': 2 });
  const topHorizon = s('line', { stroke: 'var(--blue)', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
  const vertObj = s('line', { stroke: 'var(--green)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const extraObj = s('line', { stroke: 'var(--orange, #f4a261)', 'stroke-width': 4, 'stroke-linecap': 'round' });
  const sight1 = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.2 });
  const sight2 = s('line', { stroke: 'var(--pink)', 'stroke-width': 2.2, 'stroke-dasharray': '6 4' });
  const arcTop = s('path', { fill: 'rgba(130, 198, 255, 0.2)', stroke: 'var(--blue)', 'stroke-width': 2 });
  const arcBot1 = s('path', { fill: 'rgba(246, 211, 101, 0.2)', stroke: 'var(--yellow)', 'stroke-width': 2 });
  const arcBot2 = s('path', { fill: 'rgba(255, 133, 179, 0.2)', stroke: 'var(--pink)', 'stroke-width': 2 });

  const lblTop = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)' });
  const lblBot1 = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)' });
  const lblBot2 = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' });
  const lblBase = s('text', { class: 'trigr-svg-label', fill: 'var(--ink)', 'text-anchor': 'middle' });
  const lblHeight = s('text', { class: 'trigr-svg-label', fill: 'var(--green)' });

  const dragHitObs = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const dragDotObs = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  board.clipped.append(
    groundLine,
    topHorizon,
    vertObj,
    extraObj,
    sight1,
    sight2,
    arcTop,
    arcBot1,
    arcBot2,
    lblTop,
    lblBot1,
    lblBot2,
    lblBase,
    lblHeight,
    dragDotObs,
    dragHitObs
  );

  const mapper = createBoxMapper({
    xMin: 15,
    xMax: 80,
    yMin: 10,
    yMax: 60,
    pxLeft: 80,
    pxRight: 520,
    pxBottom: 280,
    pxTop: 55,
  });

  attachSvgDrag(
    board.svg,
    dragHitObs,
    () => mapper,
    ({ x, y }) => {
      predictBox.notifyInteraction();
      const nextD = clamp(Math.round(x), 15, 80);
      const nextH = clamp(Math.round(y), 10, 60);
      store.set({ dist: nextD, height: nextH });
      sliderD.input.value = String(nextD);
      sliderD.output.textContent = `${nextD} m`;
      sliderH.input.value = String(nextH);
      sliderH.output.textContent = `${nextH} m`;
    },
    { ariaLabel: 'Mover posición horizontal/altura del observador', stepX: 3, stepY: 3 }
  );

  const render = () => {
    const st = store.get();
    const gy = 280;

    if (st.scenario === 'avion') {
      const obsX = 110;
      const obsY = gy - st.height * 3.2;
      const tgtX = obsX + st.dist * 5.2;
      const tgtY = gy;
      const alpha = (Math.atan2(st.height, st.dist) * 180) / Math.PI;
      const hyp = Math.hypot(st.height, st.dist);

      topHorizon.setAttribute('x1', String(obsX));
      topHorizon.setAttribute('y1', String(obsY));
      topHorizon.setAttribute('x2', String(obsX + 180));
      topHorizon.setAttribute('y2', String(obsY));
      topHorizon.setAttribute('visibility', 'visible');

      vertObj.setAttribute('x1', String(obsX));
      vertObj.setAttribute('y1', String(gy));
      vertObj.setAttribute('x2', String(obsX));
      vertObj.setAttribute('y2', String(obsY));
      extraObj.setAttribute('visibility', 'hidden');

      sight1.setAttribute('x1', String(obsX));
      sight1.setAttribute('y1', String(obsY));
      sight1.setAttribute('x2', String(tgtX));
      sight1.setAttribute('y2', String(tgtY));
      sight2.setAttribute('visibility', 'hidden');

      const rA = 42;
      const rad = (alpha * Math.PI) / 180;
      arcTop.setAttribute('d', `M ${obsX + rA} ${obsY} A ${rA} ${rA} 0 0 1 ${(obsX + rA * Math.cos(rad)).toFixed(1)} ${(obsY + rA * Math.sin(rad)).toFixed(1)}`);
      arcTop.setAttribute('visibility', 'visible');
      arcBot1.setAttribute('d', `M ${tgtX - rA} ${tgtY} A ${rA} ${rA} 0 0 1 ${(tgtX - rA * Math.cos(rad)).toFixed(1)} ${(tgtY - rA * Math.sin(rad)).toFixed(1)}`);
      arcBot2.setAttribute('visibility', 'hidden');

      lblTop.setAttribute('x', String(obsX + 52));
      lblTop.setAttribute('y', String(obsY + 18));
      lblTop.textContent = `Depresión ${fmtNumberEsAR(alpha, 1)}°`;
      lblTop.setAttribute('visibility', 'visible');

      lblBot1.setAttribute('x', String(tgtX - 105));
      lblBot1.setAttribute('y', String(tgtY - 12));
      lblBot1.textContent = `Elevación ${fmtNumberEsAR(alpha, 1)}°`;

      lblBot2.setAttribute('visibility', 'hidden');
      lblHeight.setAttribute('x', String(obsX - 10));
      lblHeight.setAttribute('y', String((obsY + gy) / 2));
      lblHeight.setAttribute('text-anchor', 'end');
      lblHeight.textContent = `h = ${st.height} m`;

      lblBase.setAttribute('x', String((obsX + tgtX) / 2));
      lblBase.setAttribute('y', String(gy + 22));
      lblBase.textContent = `Distancia horizontal d = ${st.dist} m`;

      dragHitObs.setAttribute('cx', String(tgtX));
      dragHitObs.setAttribute('cy', String(gy));
      dragHitObs.setAttribute('aria-valuenow', String(st.dist));
      dragDotObs.setAttribute('cx', String(tgtX));
      dragDotObs.setAttribute('cy', String(gy));

      const res = solveElevationDepression({ height: st.height, angleDeg: alpha });
      renderReadout(board.readout, 'Equivalencia Z: Depresión = Elevación', [
        ['Ángulo desde la horizontal', `${fmtNumberEsAR(alpha, 2)}° (alterno interno en paralelas)`],
        ['Visual (hipotenusa)', `${fmtNumberEsAR(hyp, 2)} m`],
        ['Base horizontal d', `${fmtNumberEsAR(res.distance, 2)} m`],
        ['Trampa evitada', `Nunca usar 90° − α = ${fmtNumberEsAR(90 - alpha, 1)}° contra la vertical`],
      ]);
    } else if (st.scenario === 'arbol_rio') {
      const treeX = 520;
      const treeH = 140;
      const p1X = 340;
      const p2X = clamp(340 - st.dist * 2.5, 90, 260);
      const alphaFar = (Math.atan2(treeH, treeX - p2X) * 180) / Math.PI;
      const betaNear = (Math.atan2(treeH, treeX - p1X) * 180) / Math.PI;
      const sys = solveDoubleObservation({
        distance: st.dist,
        alphaDeg: 30,
        betaDeg: 50,
        mode: 'same_side_horizontal',
      });

      topHorizon.setAttribute('visibility', 'hidden');
      extraObj.setAttribute('visibility', 'hidden');
      arcTop.setAttribute('visibility', 'hidden');
      lblTop.setAttribute('visibility', 'hidden');

      vertObj.setAttribute('x1', String(treeX));
      vertObj.setAttribute('y1', String(gy));
      vertObj.setAttribute('x2', String(treeX));
      vertObj.setAttribute('y2', String(gy - treeH));

      sight1.setAttribute('x1', String(p1X));
      sight1.setAttribute('y1', String(gy));
      sight1.setAttribute('x2', String(treeX));
      sight1.setAttribute('y2', String(gy - treeH));

      sight2.setAttribute('x1', String(p2X));
      sight2.setAttribute('y1', String(gy));
      sight2.setAttribute('x2', String(treeX));
      sight2.setAttribute('y2', String(gy - treeH));
      sight2.setAttribute('visibility', 'visible');

      arcBot1.setAttribute('d', `M ${p1X + 26} ${gy} A 26 26 0 0 0 ${p1X + 18} ${gy - 19}`);
      arcBot2.setAttribute('d', `M ${p2X + 32} ${gy} A 32 32 0 0 0 ${p2X + 27} ${gy - 16}`);
      arcBot2.setAttribute('visibility', 'visible');

      lblBot1.setAttribute('x', String(p1X + 30));
      lblBot1.setAttribute('y', String(gy - 10));
      lblBot1.textContent = `β = 50° (${fmtNumberEsAR(betaNear, 0)}°)`;

      lblBot2.setAttribute('x', String(p2X + 36));
      lblBot2.setAttribute('y', String(gy - 10));
      lblBot2.textContent = `α = 30° (${fmtNumberEsAR(alphaFar, 0)}°)`;
      lblBot2.setAttribute('visibility', 'visible');

      lblHeight.setAttribute('x', String(treeX + 10));
      lblHeight.setAttribute('y', String(gy - treeH / 2));
      lblHeight.setAttribute('text-anchor', 'start');
      lblHeight.textContent = `h = ${fmtNumberEsAR(sys.height, 2)} m`;

      lblBase.setAttribute('x', String((p2X + p1X) / 2));
      lblBase.setAttribute('y', String(gy + 22));
      lblBase.textContent = `Retroceso Δd = ${st.dist} m (resta cotg 30° − cotg 50°)`;

      dragHitObs.setAttribute('cx', String(p2X));
      dragHitObs.setAttribute('cy', String(gy));
      dragHitObs.setAttribute('aria-valuenow', String(st.dist));
      dragDotObs.setAttribute('cx', String(p2X));
      dragDotObs.setAttribute('cy', String(gy));

      renderReadout(board.readout, 'Doble observación mismo lado (Ej. Árbol y río)', [
        ['Fórmula del sistema', 'h = Δd / (cotg α − cotg β)'],
        ['Altura calculada h', `${fmtNumberEsAR(sys.height, 2)} m (para Δd = ${st.dist} m, α = 30°, β = 50°)`],
        ['Ancho del río d₁', `${fmtNumberEsAR(sys.dNear, 2)} m`],
        ['Distancia total d₂', `${fmtNumberEsAR(sys.dFar, 2)} m (= d₁ + Δd)`],
      ]);
    } else if (st.scenario === 'acantilado_faro') {
      const obsX = clamp(240 - st.dist * 2.8, 60, 200);
      const cliffX = 480;
      const cliffH = 110;
      const beaconGap = Number((st.height / 3).toFixed(1)); // default height=30 -> 10 m
      const faroH = clamp(beaconGap * 5.2, 25, 95);
      const sys = solveDoubleObservation({
        heightDiff: beaconGap,
        alphaDeg: 35,
        betaDeg: 42,
        mode: 'vertical_gap',
      });

      topHorizon.setAttribute('visibility', 'hidden');
      arcTop.setAttribute('visibility', 'hidden');
      lblTop.setAttribute('visibility', 'hidden');

      vertObj.setAttribute('x1', String(cliffX));
      vertObj.setAttribute('y1', String(gy));
      vertObj.setAttribute('x2', String(cliffX));
      vertObj.setAttribute('y2', String(gy - cliffH));

      extraObj.setAttribute('x1', String(cliffX));
      extraObj.setAttribute('y1', String(gy - cliffH));
      extraObj.setAttribute('x2', String(cliffX));
      extraObj.setAttribute('y2', String(gy - cliffH - faroH));
      extraObj.setAttribute('visibility', 'visible');

      sight1.setAttribute('x1', String(obsX));
      sight1.setAttribute('y1', String(gy));
      sight1.setAttribute('x2', String(cliffX));
      sight1.setAttribute('y2', String(gy - cliffH));

      sight2.setAttribute('x1', String(obsX));
      sight2.setAttribute('y1', String(gy));
      sight2.setAttribute('x2', String(cliffX));
      sight2.setAttribute('y2', String(gy - cliffH - faroH));
      sight2.setAttribute('visibility', 'visible');

      arcBot1.setAttribute('d', `M ${obsX + 45} ${gy} A 45 45 0 0 0 ${obsX + 42} ${gy - 14}`);
      arcBot2.setAttribute('d', `M ${obsX + 68} ${gy} A 68 68 0 0 0 ${obsX + 62} ${gy - 30}`);
      arcBot2.setAttribute('visibility', 'visible');

      lblBot1.setAttribute('x', String(obsX + 54));
      lblBot1.setAttribute('y', String(gy - 6));
      lblBot1.textContent = '35° (base faro)';

      lblBot2.setAttribute('x', String(obsX + 76));
      lblBot2.setAttribute('y', String(gy - 28));
      lblBot2.textContent = '42° (cima faro)';
      lblBot2.setAttribute('visibility', 'visible');

      lblHeight.setAttribute('x', String(cliffX + 12));
      lblHeight.setAttribute('y', String(gy - cliffH / 2));
      lblHeight.setAttribute('text-anchor', 'start');
      lblHeight.textContent = `Acantilado ≈ ${fmtNumberEsAR(sys.lowerHeight, 1)} m (+${fmtNumberEsAR(beaconGap, 1)} m)`;

      lblBase.setAttribute('x', String((obsX + cliffX) / 2));
      lblBase.setAttribute('y', String(gy + 22));
      lblBase.textContent = `Distancia horizontal d = ${fmtNumberEsAR(sys.horizontalDist, 2)} m`;

      dragHitObs.setAttribute('cx', String(obsX));
      dragHitObs.setAttribute('cy', String(gy));
      dragHitObs.setAttribute('aria-valuenow', String(st.dist));
      dragDotObs.setAttribute('cx', String(obsX));
      dragDotObs.setAttribute('cy', String(gy));

      renderReadout(board.readout, `Faro de ${fmtNumberEsAR(beaconGap, 1)} m sobre acantilado (35° y 42°)`, [
        ['Relación vertical', `d·tg(42°) − d·tg(35°) = ${fmtNumberEsAR(beaconGap, 1)} m`],
        ['Distancia a la base d', `${fmtNumberEsAR(sys.horizontalDist, 2)} m`],
        ['Altura del acantilado', `${fmtNumberEsAR(sys.lowerHeight, 2)} m`],
        ['Altura total (cima)', `${fmtNumberEsAR(sys.upperHeight, 2)} m`],
      ]);
    } else {
      // montana_pueblos: between_points
      const peakX = 330;
      const peakHm = Math.round(st.height * 20);
      const peakH = clamp(st.height * 3.8, 70, 210);
      const aX = clamp(240 - st.dist * 3.2, 60, 210);
      const bX = 545;
      const sys = solveDoubleObservation({
        height: peakHm,
        alphaDeg: 24,
        betaDeg: 36,
        mode: 'between_points',
      });

      topHorizon.setAttribute('visibility', 'hidden');
      extraObj.setAttribute('visibility', 'hidden');
      arcTop.setAttribute('visibility', 'hidden');
      lblTop.setAttribute('visibility', 'hidden');

      vertObj.setAttribute('x1', String(peakX));
      vertObj.setAttribute('y1', String(gy));
      vertObj.setAttribute('x2', String(peakX));
      vertObj.setAttribute('y2', String(gy - peakH));

      sight1.setAttribute('x1', String(aX));
      sight1.setAttribute('y1', String(gy));
      sight1.setAttribute('x2', String(peakX));
      sight1.setAttribute('y2', String(gy - peakH));

      sight2.setAttribute('x1', String(bX));
      sight2.setAttribute('y1', String(gy));
      sight2.setAttribute('x2', String(peakX));
      sight2.setAttribute('y2', String(gy - peakH));
      sight2.setAttribute('visibility', 'visible');

      arcBot1.setAttribute('d', `M ${aX + 36} ${gy} A 36 36 0 0 0 ${aX + 31} ${gy - 18}`);
      arcBot2.setAttribute('d', `M ${bX - 36} ${gy} A 36 36 0 0 1 ${bX - 28} ${gy - 22}`);
      arcBot2.setAttribute('visibility', 'visible');

      lblBot1.setAttribute('x', String(aX + 42));
      lblBot1.setAttribute('y', String(gy - 10));
      lblBot1.textContent = 'Pueblo A (24°)';

      lblBot2.setAttribute('x', String(bX - 115));
      lblBot2.setAttribute('y', String(gy - 10));
      lblBot2.textContent = 'Pueblo B (36°)';
      lblBot2.setAttribute('visibility', 'visible');

      lblHeight.setAttribute('x', String(peakX + 10));
      lblHeight.setAttribute('y', String(gy - peakH / 2));
      lblHeight.setAttribute('text-anchor', 'start');
      lblHeight.textContent = `h = ${peakHm} m`;

      lblBase.setAttribute('x', String((aX + bX) / 2));
      lblBase.setAttribute('y', String(gy + 22));
      lblBase.textContent = `Distancia total A–B = d₁ + d₂ = ${fmtNumberEsAR(sys.totalDistance, 2)} m`;

      dragHitObs.setAttribute('cx', String(aX));
      dragHitObs.setAttribute('cy', String(gy));
      dragHitObs.setAttribute('aria-valuenow', String(st.dist));
      dragDotObs.setAttribute('cx', String(aX));
      dragDotObs.setAttribute('cy', String(gy));

      renderReadout(board.readout, `Montaña de ${peakHm} m entre dos pueblos (24° y 36°)`, [
        ['Fórmula (lados opuestos)', 'd = h · (cotg 24° + cotg 36°)'],
        ['Tramo d₁ (desde A)', `${fmtNumberEsAR(sys.d1, 2)} m`],
        ['Tramo d₂ (desde B)', `${fmtNumberEsAR(sys.d2, 2)} m`],
        ['Distancia total A–B', `${fmtNumberEsAR(sys.totalDistance, 2)} m`],
      ]);
    }
  };

  store.subscribe(render);
  render();
  return { store, board };
}
