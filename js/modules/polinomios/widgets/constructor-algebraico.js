/**
 * @file js/modules/polinomios/widgets/constructor-algebraico.js
 * Widget 2 (Sec 2): Suma, resta (con inversión visual de signos), producto y leyes del grado.
 */

import {
  s,
  clear,
  createStore,
  createBoard,
  createPredictBox,
  addChips,
  renderReadout,
  playClick,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyAdd,
  polySub,
  polyMul,
  polyNeg,
  polyDegree,
  formatPoly,
  ratToString,
  rat,
} from '../logic.js';

const PAIRS = [
  {
    id: 'cancel',
    label: 'Cancelación: (x³ + 2x) y (−x³ + 5)',
    P: polyFromDescending([1, 0, 2, 0]),
    Q: polyFromDescending([-1, 0, 0, 5]),
  },
  {
    id: 'booklet',
    label: 'Trinomios: (3x² − 2x + 1) y (x² + 4x − 5)',
    P: polyFromDescending([3, -2, 1]),
    Q: polyFromDescending([1, 4, -5]),
  },
  {
    id: 'cubic',
    label: 'Grado 3 × Grado 2: (x³ + x + 1) y (x² − 2x)',
    P: polyFromDescending([1, 0, 1, 1]),
    Q: polyFromDescending([1, -2, 0]),
  },
];

export function initConstructorAlgebraico(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    pairId: 'cancel',
    op: 'add', // 'add' | 'sub' | 'mul'
  });

  const predictBox = createPredictBox({
    classPrefix: 'poly',
    prompt: 'Si sumamos P(x) = x³ + 2x y Q(x) = −x³ + 5, ¿qué grado tiene P(x) + Q(x)?',
    options: [
      {
        label: 'Grado 6, porque 3 + 3 = 6',
        correct: false,
        explanation:
          'Solo se suman los grados al multiplicar polinomios. En la suma, nunca sube el grado por encima del máximo.',
      },
      {
        label: 'Grado 3, porque ambos tienen grado 3',
        correct: false,
        explanation:
          '¡Trampa de cancelación! +x³ y −x³ se anulan a 0x³. Sobrevive 2x + 5, que tiene grado 1.',
      },
      {
        label: 'Grado 1, porque los términos x³ se cancelan',
        correct: true,
        explanation:
          '¡Muy bien! Por eso la ley dice gr(P + Q) <= máx(gr(P), gr(Q)): cuando los coeficientes principales son opuestos, el grado baja.',
      },
    ],
    onVerify: () => {
      store.set({ pairId: 'cancel', op: 'add' });
    },
  });

  const board = createBoard(host, 'Constructor algebraico y leyes del grado', '0 0 640 270', {
    prefix: 'poly',
  });
  host.prepend(predictBox);

  const updatePairChips = addChips(
    board.controls,
    PAIRS.map((p) => [p.id, p.label]),
    store.get().pairId,
    (pairId) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ pairId });
    },
    'Par de polinomios'
  );

  const updateOpChips = addChips(
    board.controls,
    [
      ['add', 'P(x) + Q(x)'],
      ['sub', 'P(x) − Q(x)'],
      ['mul', 'P(x) · Q(x)'],
    ],
    store.get().op,
    (op) => {
      playClick();
      predictBox.notifyInteraction();
      store.set({ op });
    },
    'Operación algebraica'
  );

  const sceneGroup = s('g', { class: 'poly-op-scene' });
  board.drawing.append(sceneGroup);

  const render = (st) => {
    updatePairChips(st.pairId);
    updateOpChips(st.op);
    clear(sceneGroup);

    const pair = PAIRS.find((p) => p.id === st.pairId) || PAIRS[0];
    const P = pair.P;
    const Q = pair.Q;
    const degP = polyDegree(P);
    const degQ = polyDegree(Q);

    let res;
    let opLabel;
    let lawText;
    if (st.op === 'add') {
      res = polyAdd(P, Q);
      opLabel = 'P(x) + Q(x)';
      const dRes = polyDegree(res);
      lawText = `gr(P+Q) = ${dRes === null ? 'sin grado' : dRes} <= máx(${degP}, ${degQ}) = ${Math.max(degP, degQ)}`;
    } else if (st.op === 'sub') {
      res = polySub(P, Q);
      opLabel = 'P(x) − Q(x) = P(x) + (−Q(x))';
      const dRes = polyDegree(res);
      lawText = `Signo menos distribuido a cada término de Q. gr(P−Q) = ${dRes === null ? 'sin grado' : dRes} <= ${Math.max(degP, degQ)}`;
    } else {
      res = polyMul(P, Q);
      opLabel = 'P(x) · Q(x)';
      lawText = `gr(P·Q) = ${polyDegree(res)} = gr(P) + gr(Q) = ${degP} + ${degQ}`;
    }

    if (st.op === 'add' || st.op === 'sub') {
      const Qshown = st.op === 'sub' ? polyNeg(Q) : Q;
      const maxDeg = Math.max(degP ?? 0, degQ ?? 0);
      const colW = Math.min(110, Math.floor(470 / (maxDeg + 1)));
      const startX = 140;

      sceneGroup.append(
        s('text', { x: 24, y: 66, fill: 'var(--yellow)', 'font-size': 14, 'font-weight': 'bold' }, 'P(x)'),
        s(
          'text',
          { x: 24, y: 120, fill: st.op === 'sub' ? 'var(--pink)' : 'var(--blue)', 'font-size': 14, 'font-weight': 'bold' },
          st.op === 'sub' ? '−Q(x)' : '+Q(x)'
        ),
        s('line', { x1: 20, y1: 146, x2: 616, y2: 146, stroke: 'var(--ink)', 'stroke-width': 1.5 }),
        s('text', { x: 24, y: 184, fill: 'var(--green)', 'font-size': 14, 'font-weight': 'bold' }, 'Total')
      );

      for (let d = maxDeg; d >= 0; d--) {
        const colIdx = maxDeg - d;
        const cx = startX + colIdx * colW + colW / 2;
        const cp = d < P.length ? P[d] : rat(0);
        const cq = d < Qshown.length ? Qshown[d] : rat(0);
        const cr = d < res.length ? res[d] : rat(0);
        const varSuffix = d === 0 ? '' : d === 1 ? 'x' : `x^${d}`;

        sceneGroup.append(
          s('text', { x: cx, y: 28, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': 12 }, d === 0 ? 'x⁰' : varSuffix),
          s('text', { x: cx, y: 66, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 15 }, `${ratToString(cp)}${varSuffix}`),
          s(
            'text',
            { x: cx, y: 120, 'text-anchor': 'middle', fill: st.op === 'sub' ? 'var(--pink)' : 'var(--blue)', 'font-size': 15 },
            `${ratToString(cq)}${varSuffix}`
          ),
          s(
            'text',
            { x: cx, y: 184, 'text-anchor': 'middle', fill: cr.n === 0 && d === maxDeg ? 'var(--yellow)' : 'var(--green)', 'font-size': 16, 'font-weight': 'bold' },
            `${ratToString(cr)}${varSuffix}`
          )
        );
      }
    } else {
      // Multiplication area matrix
      const termsP = [];
      for (let i = P.length - 1; i >= 0; i--) if (P[i].n !== 0) termsP.push({ deg: i, coeff: P[i] });
      const termsQ = [];
      for (let j = Q.length - 1; j >= 0; j--) if (Q[j].n !== 0) termsQ.push({ deg: j, coeff: Q[j] });

      const cellW = Math.min(125, Math.floor(460 / Math.max(1, termsQ.length)));
      const cellH = 44;
      const gx = 135;
      const gy = 48;

      termsQ.forEach((tq, j) => {
        const vx = tq.deg === 0 ? '' : tq.deg === 1 ? 'x' : `x^${tq.deg}`;
        sceneGroup.append(
          s('text', { x: gx + j * cellW + cellW / 2, y: gy - 12, 'text-anchor': 'middle', fill: 'var(--blue)', 'font-size': 14, 'font-weight': 'bold' }, `${ratToString(tq.coeff)}${vx}`)
        );
      });

      termsP.forEach((tp, i) => {
        const vp = tp.deg === 0 ? '' : tp.deg === 1 ? 'x' : `x^${tp.deg}`;
        sceneGroup.append(
          s('text', { x: gx - 14, y: gy + i * cellH + cellH / 2 + 5, 'text-anchor': 'end', fill: 'var(--yellow)', 'font-size': 14, 'font-weight': 'bold' }, `${ratToString(tp.coeff)}${vp}`)
        );
        termsQ.forEach((tq, j) => {
          const degSum = tp.deg + tq.deg;
          const prodCoeff = tp.coeff.n * tq.coeff.n;
          const v = degSum === 0 ? '' : degSum === 1 ? 'x' : `x^${degSum}`;
          sceneGroup.append(
            s('rect', {
              x: gx + j * cellW,
              y: gy + i * cellH,
              width: cellW - 4,
              height: cellH - 4,
              fill: 'rgba(142, 219, 159, 0.08)',
              stroke: 'rgba(236, 242, 232, 0.28)',
            }),
            s(
              'text',
              { x: gx + j * cellW + (cellW - 4) / 2, y: gy + i * cellH + cellH / 2 + 4, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 13.5 },
              `${prodCoeff}${v}`
            )
          );
        });
      });
    }

    sceneGroup.append(
      s('text', { x: 320, y: 238, 'text-anchor': 'middle', fill: 'var(--yellow)', 'font-size': 13.5 }, lawText)
    );

    renderReadout(board.readout, opLabel, [
      ['Resultado', formatPoly(res)],
      ['Grado resultante', polyDegree(res) === null ? 'Sin grado' : String(polyDegree(res))],
      ['Regla verificada', lawText],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store };
}
