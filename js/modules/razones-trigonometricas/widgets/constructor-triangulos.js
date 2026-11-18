/**
 * @file js/modules/razones-trigonometricas/widgets/constructor-triangulos.js
 * Widget 1 · Sec. 1: Constructor de triángulos rectángulos (Pitágoras, complementarios e invariancia por semejanza).
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
import { solveRightTriangle, fmtNumberEsAR, degToDms } from '../logic.js';

export function initConstructorTriangulos(host) {
  if (!host) return null;

  const store = createStore({
    preset: '345',
    legA: 4, // AB horizontal
    legB: 3, // AC vertical
    scaleFactor: 1,
    ratioMode: false,
  });

  const predictBox = createPredictBox({
    prompt: 'Si duplicamos ambos catetos de un triángulo rectángulo, ¿qué ocurre con el seno de sus ángulos agudos?',
    options: [
      {
        label: 'Permanece exactamente igual (invariante por semejanza).',
        correct: true,
        explanation:
          'Al multiplicar ambos catetos por 2, por Pitágoras la hipotenusa también se multiplica por 2 y el factor se cancela en el cociente b/c = (2b)/(2c).',
      },
      {
        label: 'Se duplica junto con los lados.',
        correct: false,
        explanation:
          'Duplicar ambos lados agranda el triángulo pero conserva su forma y sus ángulos: el cociente opuesto/hipotenusa no cambia.',
      },
      {
        label: 'Se reduce a la mitad porque la hipotenusa crece más rápido.',
        correct: false,
        explanation:
          '√((2a)² + (2b)²) = 2√(a² + b²) = 2c: la hipotenusa escala exactamente por el mismo factor 2.',
      },
    ],
    onVerify: () => {
      store.set({ preset: '345', legA: 4, legB: 3, scaleFactor: 2, ratioMode: false });
      sliderA.input.value = '4';
      sliderA.output.textContent = fmtNumberEsAR(4, 1);
      sliderB.input.value = '3';
      sliderB.output.textContent = fmtNumberEsAR(3, 1);
      setActivePreset('345');
    },
  });

  const board = createBoard(host, 'Constructor de triángulo rectángulo e invariancia por semejanza');
  host.prepend(predictBox);

  const PRESETS = [
    ['345', 'Clásico 3-4-5'],
    ['ej2', 'c = 15, B = 46°'],
    ['ej8', 'Razón catetos 3:1'],
    ['int2', 'Altura h = 1,9 y cateto 2'],
  ];

  const setActivePreset = addChips(
    board.controls,
    PRESETS,
    '345',
    (id) => {
      playClick();
      predictBox.notifyInteraction();
      if (id === '345') {
        store.set({ preset: id, legA: 4, legB: 3, scaleFactor: 1, ratioMode: false });
      } else if (id === 'ej2') {
        const tri = solveRightTriangle({ c: 15, B: 46 });
        store.set({
          preset: id,
          legA: Number((tri.a / 2).toFixed(2)),
          legB: Number((tri.b / 2).toFixed(2)),
          scaleFactor: 2,
          ratioMode: false,
        });
      } else if (id === 'ej8') {
        store.set({ preset: id, legA: 2, legB: 6, scaleFactor: 1, ratioMode: true });
      } else if (id === 'int2') {
        const tri = solveRightTriangle({ hAlt: 1.9, leg: 2 });
        store.set({
          preset: id,
          legA: Number(tri.a.toFixed(2)),
          legB: Number(tri.b.toFixed(2)),
          scaleFactor: 1,
          ratioMode: false,
        });
      }
      const st = store.get();
      sliderA.input.value = String(clamp(st.legA, 1, 8));
      sliderA.output.textContent = fmtNumberEsAR(st.legA, 1);
      sliderB.input.value = String(clamp(st.legB, 1, 8));
      sliderB.output.textContent = fmtNumberEsAR(st.legB, 1);
    },
    'Casos del triángulo rectángulo'
  );

  const sliderA = addRange(board.controls, store, 'legA', 'Cateto base AB (a)', 1, 8, 4, 0.2, (v) => fmtNumberEsAR(v, 1));
  const sliderB = addRange(board.controls, store, 'legB', 'Cateto altura AC (b)', 1, 8, 3, 0.2, (v) => fmtNumberEsAR(v, 1));

  sliderA.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom', ratioMode: false });
    setActivePreset('custom');
  });
  sliderB.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom', ratioMode: false });
    setActivePreset('custom');
  });

  const btnScale = button('Duplicar escala (×2)', 'spark', () => {
    playClick();
    predictBox.notifyInteraction();
    const cur = store.get().scaleFactor;
    store.set({ scaleFactor: cur === 1 ? 2 : 1 });
  });
  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ preset: '345', legA: 4, legB: 3, scaleFactor: 1, ratioMode: false });
    sliderA.input.value = '4';
    sliderA.output.textContent = fmtNumberEsAR(4, 1);
    sliderB.input.value = '3';
    sliderB.output.textContent = fmtNumberEsAR(3, 1);
    setActivePreset('345');
  });
  board.actions.append(btnScale, btnReset);

  // Persistent SVG nodes
  const ghostTri = s('polygon', {
    fill: 'rgba(130, 198, 255, 0.08)',
    stroke: 'var(--blue)',
    'stroke-width': 1.6,
    'stroke-dasharray': '5 4',
    visibility: 'hidden',
  });
  const mainTri = s('polygon', {
    fill: 'rgba(246, 211, 101, 0.10)',
    stroke: 'var(--yellow)',
    'stroke-width': 2.6,
    'stroke-linejoin': 'round',
  });
  const rightAngleMark = s('polyline', {
    fill: 'none',
    stroke: 'var(--green)',
    'stroke-width': 2,
  });
  const arcB = s('path', { fill: 'none', stroke: 'var(--pink)', 'stroke-width': 2 });
  const arcC = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2 });

  const lblA = s('text', { class: 'trigr-svg-label', fill: 'var(--ink)' }, 'A (90°)');
  const lblB = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' }, 'B');
  const lblC = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)' }, 'C');
  const lblSideA = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)', 'text-anchor': 'middle' });
  const lblSideB = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)', 'text-anchor': 'end' });
  const lblSideC = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' });
  const lblAngleB = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' });
  const lblAngleC = s('text', { class: 'trigr-svg-label', fill: 'var(--blue)' });

  const dragHitC = s('circle', {
    r: 16,
    fill: 'transparent',
    style: 'cursor: grab; touch-action: none;',
  });
  const dragDotC = s('circle', {
    r: 7,
    fill: 'var(--blue)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    style: 'pointer-events: none;',
  });

  board.clipped.append(
    ghostTri,
    mainTri,
    rightAngleMark,
    arcB,
    arcC,
    lblSideA,
    lblSideB,
    lblSideC,
    lblAngleB,
    lblAngleC,
    lblA,
    lblB,
    lblC,
    dragDotC,
    dragHitC
  );

  // Coordinate mapper for dragging vertex B/C or scaling legs directly
  const mapper = createBoxMapper({
    xMin: 0,
    xMax: 16,
    yMin: 0,
    yMax: 16,
    pxLeft: 130,
    pxRight: 560,
    pxBottom: 290,
    pxTop: 36,
  });

  attachSvgDrag(
    board.svg,
    dragHitC,
    () => mapper,
    ({ x, y }) => {
      predictBox.notifyInteraction();
      const st = store.get();
      const nextA = clamp(Number((x / st.scaleFactor).toFixed(1)), 1, 8);
      const nextB = clamp(Number((y / st.scaleFactor).toFixed(1)), 1, 8);
      store.set({ legA: nextA, legB: nextB, preset: 'custom', ratioMode: false });
      sliderA.input.value = String(nextA);
      sliderA.output.textContent = fmtNumberEsAR(nextA, 1);
      sliderB.input.value = String(nextB);
      sliderB.output.textContent = fmtNumberEsAR(nextB, 1);
      setActivePreset('custom');
    },
    { ariaLabel: 'Mover vértice C para ajustar los catetos del triángulo rectángulo', stepX: 0.5, stepY: 0.5 }
  );

  const render = () => {
    const st = store.get();
    const a = st.legA * st.scaleFactor;
    const b = st.legB * st.scaleFactor;
    const tri = solveRightTriangle({ a, b });

    // Anchor A at (0,0) in visual box, scale visually so largest triangle fits neatly
    const maxDim = Math.max(a, b, 8);
    const visScale = 12 / maxDim;
    const va = a * visScale;
    const vb = b * visScale;

    const ax = mapper.toX(0);
    const ay = mapper.toY(0);
    const bx = mapper.toX(va);
    const by = ay;
    const cx = ax;
    const cy = mapper.toY(vb);

    mainTri.setAttribute('points', `${ax},${ay} ${bx},${by} ${cx},${cy}`);

    if (st.scaleFactor > 1) {
      const a0 = st.legA * visScale;
      const b0 = st.legB * visScale;
      ghostTri.setAttribute('points', `${ax},${ay} ${mapper.toX(a0)},${ay} ${ax},${mapper.toY(b0)}`);
      ghostTri.setAttribute('visibility', 'visible');
    } else {
      ghostTri.setAttribute('visibility', 'hidden');
    }

    const sq = 14;
    rightAngleMark.setAttribute('points', `${ax + sq},${ay} ${ax + sq},${ay - sq} ${ax},${ay - sq}`);

    // Angle B arc at (bx, by)
    const rArc = 26;
    const radB = (tri.B * Math.PI) / 180;
    const abx = bx - rArc * Math.cos(radB);
    const aby = by - rArc * Math.sin(radB);
    arcB.setAttribute('d', `M ${bx - rArc} ${by} A ${rArc} ${rArc} 0 0 1 ${abx.toFixed(1)} ${aby.toFixed(1)}`);

    // Angle C arc at (cx, cy)
    const acx = cx + rArc * Math.cos(radB);
    const acy = cy + rArc * Math.sin(radB);
    arcC.setAttribute('d', `M ${cx} ${cy + rArc} A ${rArc} ${rArc} 0 0 0 ${acx.toFixed(1)} ${acy.toFixed(1)}`);

    lblA.setAttribute('x', String(ax - 8));
    lblA.setAttribute('y', String(ay + 20));
    lblA.setAttribute('text-anchor', 'end');

    lblB.setAttribute('x', String(Math.min(615, bx + 10)));
    lblB.setAttribute('y', String(by + 18));

    lblC.setAttribute('x', String(cx + 14));
    lblC.setAttribute('y', String(Math.max(24, cy - 6)));

    lblSideA.setAttribute('x', String((ax + bx) / 2));
    lblSideA.setAttribute('y', String(ay + 22));
    lblSideA.textContent = st.ratioMode ? 'AB = k' : `AB = ${fmtNumberEsAR(a, 2)}`;

    lblSideB.setAttribute('x', String(ax - 10));
    lblSideB.setAttribute('y', String((ay + cy) / 2 + 4));
    lblSideB.textContent = st.ratioMode ? 'AC = 3k' : `AC = ${fmtNumberEsAR(b, 2)}`;

    lblSideC.setAttribute('x', String((bx + cx) / 2 + 12));
    lblSideC.setAttribute('y', String((by + cy) / 2 - 6));
    lblSideC.textContent = st.ratioMode ? 'BC = k√10 (indet.)' : `BC = ${fmtNumberEsAR(tri.c, 2)}`;

    lblAngleB.setAttribute('x', String(bx - 48));
    lblAngleB.setAttribute('y', String(by - 10));
    lblAngleB.textContent = `${fmtNumberEsAR(tri.B, 1)}°`;

    lblAngleC.setAttribute('x', String(cx + 12));
    lblAngleC.setAttribute('y', String(cy + 36));
    lblAngleC.textContent = `${fmtNumberEsAR(tri.C, 1)}°`;

    dragHitC.setAttribute('cx', String(cx));
    dragHitC.setAttribute('cy', String(cy));
    dragHitC.setAttribute('aria-valuenow', String(st.legB));
    dragDotC.setAttribute('cx', String(cx));
    dragDotC.setAttribute('cy', String(cy));

    btnScale.textContent = st.scaleFactor === 1 ? 'Duplicar escala (×2)' : 'Volver a escala ×1';

    const sumDeg = degToDms(tri.B + tri.C, { precisionSec: 0 });
    renderReadout(board.readout, `Triángulo rectángulo en A (Escala ×${st.scaleFactor})`, [
      ['Pitágoras BC² = AB² + AC²', st.ratioMode ? 'Solo razón 3:1 → BC depende de k (no único)' : `${fmtNumberEsAR(a * a, 2)} + ${fmtNumberEsAR(b * b, 2)} = ${fmtNumberEsAR(tri.c * tri.c, 2)} ⇒ c = ${fmtNumberEsAR(tri.c, 2)}`],
      ['Ángulos complementarios', `B = ${tri.dmsB.formatted} · C = ${tri.dmsC.formatted} (B + C = ${sumDeg.formatted})`],
      ['Invariante sen(B) = AC / BC', `${fmtNumberEsAR(tri.sinB, 4)} (idéntico en escala ×1 y ×${st.scaleFactor})`],
      ['Perímetro y Área', st.ratioMode ? 'Requiere al menos 1 longitud real' : `P = ${fmtNumberEsAR(tri.perimeter, 2)} · Área = ${fmtNumberEsAR(tri.area, 2)}`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
