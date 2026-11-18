/**
 * @file js/modules/razones-trigonometricas/widgets/laboratorio-sohcahtoa.js
 * Widget 2 · Sec. 2: Laboratorio SOHCAHTOA con cambio dinámico de vértice de referencia (B ↔ C)
 * y cofunciones complementarias en tiempo real.
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
import { solveRightTriangle, fmtNumberEsAR } from '../logic.js';

export function initLaboratorioSohcahtoa(host) {
  if (!host) return null;

  const store = createStore({
    vertex: 'B', // 'B' | 'C'
    angleB: 36.87,
    hyp: 10,
  });

  const predictBox = createPredictBox({
    prompt: '¿Por qué sen(B) siempre coincide exactamente con cos(C) en un triángulo rectángulo?',
    options: [
      {
        label: 'Porque el cateto AC que es opuesto a B es exactamente el adyacente al ángulo complementario C.',
        correct: true,
        explanation:
          'Al cambiar el observador de B hacia C, la hipotenusa BC queda igual pero los catetos intercambian rol: sen(B) = AC/BC = cos(C).',
      },
      {
        label: 'Porque en todo triángulo rectángulo los dos catetos miden lo mismo.',
        correct: false,
        explanation:
          'Los catetos solo miden igual cuando B = C = 45°. Para cualquier ángulo agudo, la igualdad sen(B) = cos(C) se cumple por el intercambio de roles opuesto ↔ adyacente.',
      },
    ],
    onVerify: () => {
      store.set({ vertex: 'C', angleB: 37 });
      setVertexChip('C');
      sliderB.input.value = '37';
      sliderB.output.textContent = '37°';
    },
  });

  const board = createBoard(host, 'Laboratorio SOHCAHTOA y cofunciones complementarias');
  host.prepend(predictBox);

  const setVertexChip = addChips(
    board.controls,
    [
      ['B', 'Mirar desde ángulo B'],
      ['C', 'Mirar desde ángulo C (90° − B)'],
    ],
    'B',
    (v) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ vertex: v });
    },
    'Vértice de referencia'
  );

  const sliderB = addRange(board.controls, store, 'angleB', 'Ángulo agudo B (°)', 15, 75, 36.87, 1, (v) => `${fmtNumberEsAR(v, 1)}°`);
  sliderB.input.addEventListener('input', () => predictBox.notifyInteraction());

  const btnReset = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ vertex: 'B', angleB: 36.87, hyp: 10 });
    setVertexChip('B');
    sliderB.input.value = '36.87';
    sliderB.output.textContent = '36,9°';
  });
  board.actions.append(btnReset);

  // Persistent SVG elements
  const triPoly = s('polygon', {
    fill: 'rgba(236, 242, 232, 0.04)',
    stroke: 'none',
  });
  const sideAB = s('line', { 'stroke-width': 4, 'stroke-linecap': 'round' });
  const sideAC = s('line', { 'stroke-width': 4, 'stroke-linecap': 'round' });
  const sideBC = s('line', { stroke: 'var(--pink)', 'stroke-width': 4, 'stroke-linecap': 'round' });
  const rightMark = s('polyline', { fill: 'none', stroke: 'var(--green)', 'stroke-width': 2 });
  const activeArc = s('path', { fill: 'rgba(246, 211, 101, 0.16)', stroke: 'var(--yellow)', 'stroke-width': 2 });

  const lblAB = s('text', { class: 'trigr-svg-label', 'text-anchor': 'middle' });
  const lblAC = s('text', { class: 'trigr-svg-label', 'text-anchor': 'end' });
  const lblBC = s('text', { class: 'trigr-svg-label', fill: 'var(--pink)' });
  const lblRef = s('text', { class: 'trigr-svg-label', fill: 'var(--yellow)', 'font-weight': '700' });

  const eyeRing = s('circle', { r: 10, fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2, 'stroke-dasharray': '3 3' });
  const dragHitB = s('circle', { r: 16, fill: 'transparent', style: 'cursor: grab; touch-action: none;' });
  const dragDotB = s('circle', { r: 7, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2, style: 'pointer-events: none;' });

  board.clipped.append(
    triPoly,
    sideAB,
    sideAC,
    sideBC,
    rightMark,
    activeArc,
    eyeRing,
    lblAB,
    lblAC,
    lblBC,
    lblRef,
    dragDotB,
    dragHitB
  );

  const mapper = createBoxMapper({
    xMin: 15,
    xMax: 75,
    yMin: 0,
    yMax: 10,
    pxLeft: 230,
    pxRight: 550,
    pxBottom: 270,
    pxTop: 50,
  });

  attachSvgDrag(
    board.svg,
    dragHitB,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const nextB = clamp(Math.round(x), 15, 75);
      store.set({ angleB: nextB });
      sliderB.input.value = String(nextB);
      sliderB.output.textContent = `${fmtNumberEsAR(nextB, 1)}°`;
    },
    { ariaLabel: 'Ajustar el ángulo agudo B del triángulo SOHCAHTOA', stepX: 2, stepY: 1 }
  );

  const render = () => {
    const st = store.get();
    const tri = solveRightTriangle({ c: st.hyp, B: st.angleB });

    const ax = 155;
    const ay = 275;
    const scale = 25;
    const bx = ax + tri.a * scale;
    const by = ay;
    const cx = ax;
    const cy = ay - tri.b * scale;

    triPoly.setAttribute('points', `${ax},${ay} ${bx},${by} ${cx},${cy}`);
    sideAB.setAttribute('x1', String(ax));
    sideAB.setAttribute('y1', String(ay));
    sideAB.setAttribute('x2', String(bx));
    sideAB.setAttribute('y2', String(by));

    sideAC.setAttribute('x1', String(ax));
    sideAC.setAttribute('y1', String(ay));
    sideAC.setAttribute('x2', String(cx));
    sideAC.setAttribute('y2', String(cy));

    sideBC.setAttribute('x1', String(bx));
    sideBC.setAttribute('y1', String(by));
    sideBC.setAttribute('x2', String(cx));
    sideBC.setAttribute('y2', String(cy));

    rightMark.setAttribute('points', `${ax + 14},${ay} ${ax + 14},${ay - 14} ${ax},${ay - 14}`);

    const isB = st.vertex === 'B';
    // Opposite = yellow, Adjacent = blue
    sideAC.setAttribute('stroke', isB ? 'var(--yellow)' : 'var(--blue)');
    sideAB.setAttribute('stroke', isB ? 'var(--blue)' : 'var(--yellow)');

    lblAB.setAttribute('x', String((ax + bx) / 2));
    lblAB.setAttribute('y', String(ay + 22));
    lblAB.setAttribute('fill', isB ? 'var(--blue)' : 'var(--yellow)');
    lblAB.textContent = `${isB ? 'Adyacente' : 'Opuesto'} AB = ${fmtNumberEsAR(tri.a, 2)}`;

    lblAC.setAttribute('x', String(ax - 12));
    lblAC.setAttribute('y', String((ay + cy) / 2 + 4));
    lblAC.setAttribute('fill', isB ? 'var(--yellow)' : 'var(--blue)');
    lblAC.textContent = `${isB ? 'Opuesto' : 'Adyacente'} AC = ${fmtNumberEsAR(tri.b, 2)}`;

    lblBC.setAttribute('x', String((bx + cx) / 2 + 12));
    lblBC.setAttribute('y', String((by + cy) / 2 - 8));
    lblBC.textContent = `Hipotenusa BC = ${fmtNumberEsAR(tri.c, 2)}`;

    const rArc = 30;
    const radB = (tri.B * Math.PI) / 180;
    if (isB) {
      const p2x = bx - rArc * Math.cos(radB);
      const p2y = by - rArc * Math.sin(radB);
      activeArc.setAttribute('d', `M ${bx} ${by} L ${bx - rArc} ${by} A ${rArc} ${rArc} 0 0 1 ${p2x.toFixed(1)} ${p2y.toFixed(1)} Z`);
      eyeRing.setAttribute('cx', String(bx));
      eyeRing.setAttribute('cy', String(by));
      lblRef.setAttribute('x', String(bx + 10));
      lblRef.setAttribute('y', String(by + 16));
      lblRef.textContent = `B = ${fmtNumberEsAR(tri.B, 1)}°`;
    } else {
      const p2x = cx + rArc * Math.cos(radB);
      const p2y = cy + rArc * Math.sin(radB);
      activeArc.setAttribute('d', `M ${cx} ${cy} L ${cx} ${cy + rArc} A ${rArc} ${rArc} 0 0 0 ${p2x.toFixed(1)} ${p2y.toFixed(1)} Z`);
      eyeRing.setAttribute('cx', String(cx));
      eyeRing.setAttribute('cy', String(cy));
      lblRef.setAttribute('x', String(cx + 14));
      lblRef.setAttribute('y', String(cy - 6));
      lblRef.textContent = `C = ${fmtNumberEsAR(tri.C, 1)}°`;
    }

    dragHitB.setAttribute('cx', String(bx));
    dragHitB.setAttribute('cy', String(by));
    dragHitB.setAttribute('aria-valuenow', String(st.angleB));
    dragDotB.setAttribute('cx', String(bx));
    dragDotB.setAttribute('cy', String(by));

    const curAngle = isB ? tri.B : tri.C;
    const opp = isB ? tri.b : tri.a;
    const adj = isB ? tri.a : tri.b;
    const sinV = opp / tri.c;
    const cosV = adj / tri.c;
    const tanV = opp / adj;

    renderReadout(board.readout, `Mirando desde vértice ${st.vertex} (${fmtNumberEsAR(curAngle, 1)}°)`, [
      [`SOH · sen(${st.vertex})`, `${fmtNumberEsAR(opp, 2)} / ${fmtNumberEsAR(tri.c, 2)} = ${fmtNumberEsAR(sinV, 4)}`],
      [`CAH · cos(${st.vertex})`, `${fmtNumberEsAR(adj, 2)} / ${fmtNumberEsAR(tri.c, 2)} = ${fmtNumberEsAR(cosV, 4)}`],
      [`TOA · tg(${st.vertex})`, `${fmtNumberEsAR(opp, 2)} / ${fmtNumberEsAR(adj, 2)} = ${fmtNumberEsAR(tanV, 4)}`],
      ['Dualidad complementaria', `sen(B) = cos(C) = ${fmtNumberEsAR(tri.sinB, 4)} · cos(B) = sen(C) = ${fmtNumberEsAR(tri.cosB, 4)}`],
    ]);
  };

  store.subscribe(render);
  render();
  return { store, board };
}
