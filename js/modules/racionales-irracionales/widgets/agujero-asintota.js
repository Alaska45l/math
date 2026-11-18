/**
 * @file js/modules/racionales-irracionales/widgets/agujero-asintota.js
 * Widget 2 (Sec 3): Hole vs Vertical Asymptote Multiplicity Lab.
 * Contrasts (x^2 - 1)/(x - 1) vs (x - 1)/(x - 1)^2 via mult_P(a) vs mult_Q(a),
 * plus 2x^2/(x^2 + x) and (4x^2 - 8x)/((x-2)(x^2-5)), using fnPath with breaks and applyPlaneClip.
 * 2-stage POE + keyboard-accessible draggable probe (attachSvgDrag) + persistent DOM nodes.
 */

import {
  s,
  clear,
  createStore,
  createCartesianBoard,
  createPredictBox,
  createCartesianMapper,
  attachSvgDrag,
  addRange,
  addChips,
  button,
  renderReadout,
  clampToPlane,
  anchorPlaneLabel,
  playClick,
  fmt,
  MINUS,
} from '../../../core/board-kit.js';
import {
  polyFromDescending,
  polyMul,
  polyPow,
  polyScale,
  rat,
  analyzeRationalFunction,
  formatPoly,
} from '../logic.js';

const PRESETS = [
  ['hole_1', 'Contraste 1: (x²−1)/(x−1)'],
  ['va_1', 'Contraste 2: (x−1)/(x−1)²'],
  ['hole_axis', 'Agujero en eje X: 2x²/(x²+x)'],
  ['cubic_irred', 'Cúbica: (4x²−8x)/((x−2)(x²−5))'],
];

function buildPolyForPreset(st) {
  if (st.preset === 'hole_1') {
    return {
      P: polyFromDescending([1, 0, -1]),
      Q: polyFromDescending([1, -1]),
      focusX: 1,
      label: '(x² − 1) / (x − 1)',
      yBounds: [-4, 6],
    };
  }
  if (st.preset === 'va_1') {
    return {
      P: polyFromDescending([1, -1]),
      Q: polyPow(polyFromDescending([1, -1]), 2),
      focusX: 1,
      label: '(x − 1) / (x − 1)²',
      yBounds: [-6, 6],
    };
  }
  if (st.preset === 'hole_axis') {
    return {
      P: polyFromDescending([2, 0, 0]),
      Q: polyFromDescending([1, 1, 0]),
      focusX: 0,
      label: '2x² / (x² + x)',
      yBounds: [-6, 6],
    };
  }
  if (st.preset === 'cubic_irred') {
    return {
      P: polyFromDescending([4, -8, 0]),
      Q: polyMul(polyFromDescending([1, -2]), polyFromDescending([1, 0, -5])),
      focusX: 2,
      label: '(4x² − 8x) / ((x − 2)(x² − 5))',
      yBounds: [-12, 8],
    };
  }
  // custom multiplicity lab at a = 1: ((x - 1)^mP * (x + 1)) / (x - 1)^mQ
  const base = polyFromDescending([1, -1]);
  const P = polyMul(polyPow(base, st.multP), polyFromDescending([1, 1]));
  const Q = polyPow(base, st.multQ);
  return {
    P,
    Q,
    focusX: 1,
    label: `((x − 1)^${st.multP}·(x + 1)) / (x − 1)^${st.multQ}`,
    yBounds: [-6, 6],
  };
}

export function initAgujeroAsintota(host) {
  if (!host) return null;
  clear(host);

  const store = createStore({
    preset: 'hole_1',
    multP: 1,
    multQ: 1,
    probeX: 1.5,
  });

  const predictBox = createPredictBox({
    classPrefix: 'ri',
    prompt:
      'En f(x) = (x² − 1)/(x − 1) y g(x) = (x − 1)/(x − 1)², ambos numeradores y denominadores se anulan en x = 1. ¿Tienen el mismo tipo de discontinuidad?',
    options: [
      {
        label: 'Sí: siempre que da 0/0 aparece una asíntota vertical',
        correct: false,
        explanation:
          'No siempre: en (x² − 1)/(x − 1) el factor (x − 1) se cancela arriba y abajo por tener mult_P(1) = 1 ≥ mult_Q(1) = 1, dejando un punto agujero finito en (1; 2).',
      },
      {
        label: 'No: en la primera queda un agujero en (1; 2), y en la segunda hay asíntota vertical x = 1',
        correct: true,
        explanation:
          '¡Exacto! Manda la competencia de multiplicidades: si mult_P(1) ≥ mult_Q(1) el factor se cancela (agujero); si mult_P(1) < mult_Q(1) sobrevive (x − 1) abajo (asíntota vertical).',
      },
      {
        label: 'En ambas se simplifica todo y no hay ninguna discontinuidad',
        correct: false,
        explanation:
          'x = 1 anula el denominador original en ambos casos, así que x = 1 jamás pertenece al dominio.',
      },
    ],
    onVerify: () => {
      store.set({ preset: 'va_1', multP: 1, multQ: 2, probeX: 1.15 });
    },
  });

  const board = createCartesianBoard(
    host,
    'Laboratorio de agujeros vs. asíntotas verticales',
    {
      width: 640,
      height: 340,
      xMin: -5,
      xMax: 5,
      yMin: -10,
      yMax: 8,
      xStep: 1,
      yStep: 2,
    },
    { prefix: 'ri' }
  );
  host.prepend(predictBox);

  const updateChips = addChips(
    board.controls,
    PRESETS,
    store.get().preset,
    (preset) => {
      playClick();
      predictBox.notifyInteraction();
      const defaults =
        preset === 'hole_1'
          ? { multP: 1, multQ: 1, probeX: 1.5 }
          : preset === 'va_1'
            ? { multP: 1, multQ: 2, probeX: 1.25 }
            : preset === 'hole_axis'
              ? { multP: 2, multQ: 1, probeX: 0.5 }
              : { multP: 1, multQ: 1, probeX: 2.5 };
      store.set({ preset, ...defaults });
    },
    'Casos de discontinuidad'
  );

  const mpCtrl = addRange(board.controls, store, 'multP', 'Multiplicidad arriba mult_P(1)', 0, 3, 1, 1);
  const mqCtrl = addRange(board.controls, store, 'multQ', 'Multiplicidad abajo mult_Q(1)', 1, 3, 1, 1);
  mpCtrl.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom' });
  });
  mqCtrl.input.addEventListener('input', () => {
    predictBox.notifyInteraction();
    store.set({ preset: 'custom' });
  });

  const resetBtn = button('Reiniciar', 'reset', () => {
    playClick();
    store.set({ preset: 'hole_1', multP: 1, multQ: 1, probeX: 1.5 });
  }, 'chip chip--ghost');
  board.actions.append(resetBtn);

  // Persistent SVG layers & nodes
  const { plane } = board;
  const curvePath = s('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.8,
  });
  plane.layers.curve.append(curvePath);

  const asymptoteGroup = s('g', { class: 'ri-asymptote-lines' });
  plane.layers.under.append(asymptoteGroup);

  const holesGroup = s('g', { class: 'ri-holes-marks' });
  plane.layers.marks.append(holesGroup);

  const badgeBg = s('rect', {
    x: 416,
    y: 22,
    width: 198,
    height: 54,
    fill: 'rgba(12, 16, 20, 0.88)',
    stroke: 'var(--blue)',
    'stroke-width': 1.2,
  });
  const badgeLine1 = s('text', { x: 426, y: 42, fill: 'var(--yellow)', 'font-size': 12.5, 'font-weight': 'bold' }, '');
  const badgeLine2 = s('text', { x: 426, y: 62, fill: 'var(--ink)', 'font-size': 12 }, '');
  plane.layers.labels.append(badgeBg, badgeLine1, badgeLine2);

  // Persistent draggable probe
  const probeDot = s('circle', {
    cx: plane.sx(1.5),
    cy: plane.sy(2.5),
    r: 8,
    fill: 'var(--green)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
    class: 'ri-drag-handle',
    'aria-label': 'Sonda numérica x sobre la curva racional',
    'aria-valuemin': '-5',
    'aria-valuemax': '5',
    'aria-valuenow': '1.5',
  });
  const probeLabel = s('text', {
    x: plane.sx(1.5),
    y: plane.sy(2.5) - 12,
    fill: 'var(--green)',
    'font-size': 12,
    'font-weight': 'bold',
  }, '');
  plane.layers.marks.append(probeDot, probeLabel);

  const mapper = createCartesianMapper(plane.box, {
    xMin: plane.cfg.xMin,
    xMax: plane.cfg.xMax,
    yMin: plane.cfg.yMin,
    yMax: plane.cfg.yMax,
  });

  attachSvgDrag(
    board.svg,
    probeDot,
    () => mapper,
    ({ x }) => {
      predictBox.notifyInteraction();
      const clamped = Math.max(-4.8, Math.min(4.8, Math.round(x * 20) / 20));
      store.set({ probeX: clamped });
    },
    { stepX: 0.15, stepY: 0, ariaLabel: 'Sonda numérica x sobre la curva racional' }
  );

  const render = (st) => {
    updateChips(st.preset);
    mpCtrl.input.value = String(st.multP);
    mpCtrl.output.textContent = fmt(st.multP);
    mqCtrl.input.value = String(st.multQ);
    mqCtrl.output.textContent = fmt(st.multQ);

    const spec = buildPolyForPreset(st);
    const analysis = analyzeRationalFunction(spec.P, spec.Q);

    const breaks = analysis.verticalAsymptotes.map((va) => va.x);
    const dStr = plane.fnPath((x) => analysis.evalAt(x), -5, 5, { samples: 400, breaks });
    curvePath.setAttribute('d', dStr);

    clear(asymptoteGroup);
    analysis.verticalAsymptotes.forEach((va) => {
      const px = plane.sx(va.x);
      if (px >= plane.box.x && px <= plane.box.x + plane.box.w) {
        asymptoteGroup.append(
          s('line', {
            x1: px,
            y1: plane.box.y,
            x2: px,
            y2: plane.box.y + plane.box.h,
            stroke: 'var(--pink)',
            'stroke-width': 2,
            'stroke-dasharray': '6 4',
          }),
          s('text', { x: Math.min(plane.box.x + plane.box.w - 40, px + 6), y: plane.box.y + 18, fill: 'var(--pink)', 'font-size': 12, 'font-weight': 'bold' }, `A.V. ${va.equation}`)
        );
      }
    });

    if (analysis.horizontalAsymptote.hasHA) {
      const py = plane.sy(analysis.horizontalAsymptote.value);
      if (py >= plane.box.y && py <= plane.box.y + plane.box.h) {
        asymptoteGroup.append(
          s('line', {
            x1: plane.box.x,
            y1: py,
            x2: plane.box.x + plane.box.w,
            y2: py,
            stroke: 'var(--blue)',
            'stroke-width': 1.5,
            'stroke-dasharray': '5 5',
          })
        );
      }
    }

    clear(holesGroup);
    analysis.holes.forEach((h) => {
      const { cx, cy } = clampToPlane(plane, plane.sx(h.x), plane.sy(h.y), 6);
      const pos = anchorPlaneLabel(plane, cx, cy, 80, { x: 10, y: 10 });
      holesGroup.append(
        s('circle', {
          cx,
          cy,
          r: 6,
          fill: 'var(--bg)',
          stroke: 'var(--yellow)',
          'stroke-width': 2.5,
        }),
        s('text', { x: pos.lx, y: pos.ly, 'text-anchor': pos.anchor, fill: 'var(--yellow)', 'font-size': 12, 'font-weight': 'bold' }, `Agujero ${h.formatted}`)
      );
    });

    // Multiplicity badge around focusX
    const focusDiscont = analysis.discontinuities.find((d) => Math.abs(d.x - spec.focusX) < 1e-6);
    if (focusDiscont) {
      badgeLine1.textContent = `En x = ${fmt(spec.focusX)}: mult_P = ${focusDiscont.multP} vs mult_Q = ${focusDiscont.multQ}`;
      badgeLine2.textContent =
        focusDiscont.kind === 'hole'
          ? `mult_P ≥ mult_Q → Agujero ${focusDiscont.formatted}`
          : `mult_P < mult_Q → Asíntota ${focusDiscont.equation}`;
    } else {
      badgeLine1.textContent = `En x = ${fmt(spec.focusX)}: mult_Q = 0`;
      badgeLine2.textContent = 'Sin discontinuidad en x = 1';
    }

    // Update probe position
    const yProbe = analysis.evalAt(st.probeX);
    const safeY = Number.isFinite(yProbe) ? yProbe : 0;
    const clamped = clampToPlane(plane, plane.sx(st.probeX), plane.sy(safeY), 8);
    probeDot.setAttribute('cx', String(clamped.cx));
    probeDot.setAttribute('cy', String(clamped.cy));
    probeDot.setAttribute('aria-valuenow', String(st.probeX));
    const lblPos = anchorPlaneLabel(plane, clamped.cx, clamped.cy, 95, { x: 10, y: 12 });
    probeLabel.setAttribute('x', String(lblPos.lx));
    probeLabel.setAttribute('y', String(lblPos.ly));
    probeLabel.setAttribute('text-anchor', lblPos.anchor);
    probeLabel.textContent = Number.isFinite(yProbe)
      ? `(${fmt(st.probeX)}; ${fmt(Number(yProbe.toFixed(2)))})`
      : `x = ${fmt(st.probeX)} ∉ Dom`;

    // Side table near focusX: a - 0.1, a - 0.01, a + 0.01, a + 0.1
    const fx = spec.focusX;
    const nearLeft1 = analysis.evalAt(fx - 0.1);
    const nearLeft2 = analysis.evalAt(fx - 0.01);
    const nearRight2 = analysis.evalAt(fx + 0.01);
    const nearRight1 = analysis.evalAt(fx + 0.1);
    const fmtProbe = (v) => (Number.isFinite(v) ? fmt(Number(v.toFixed(2))) : 'indef.');

    renderReadout(board.readout, `Estudio en tiempo real · ${spec.label}`, [
      ['Dominio y C₀', `Dom = ${analysis.domain.domainFormatted} · C₀ = ${analysis.zerosFormatted}`],
      [
        'Discontinuidades',
        analysis.holes.length
          ? `Agujero(s): ${analysis.holes.map((h) => h.formatted).join('; ')}`
          : `A.V.: ${analysis.verticalAsymptotes.map((v) => v.equation).join('; ') || 'ninguna'}`,
      ],
      [
        `Sonda cerca de x = ${fmt(fx)}`,
        `x→${fmt(fx)}⁻: ${fmtProbe(nearLeft1)} → ${fmtProbe(nearLeft2)} | x→${fmt(fx)}⁺: ${fmtProbe(nearRight2)} ← ${fmtProbe(nearRight1)}`,
      ],
    ]);
  };

  store.subscribe(render);
  render(store.get());

  return { store, board, predictBox };
}
