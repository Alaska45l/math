/**
 * @file js/modules/sistemas/widgets/traductor-problemas.js
 * Widget 4 · Sec. 4 (sec-modelizacion-reconstruccion):
 * Tablero dual:
 *  - Modo A: Reconstrucción de sistemas desde gráfica (Ej. 14 & Ej. 15 con candado perpendicular)
 *  - Modo B: Modelizador de enunciados verbales (Simulacro 2019 Heladera y Cocina,
 *            Ej. 13b Micro y Auto, Global 2025 Reactivos A y B, Ej. 13c Rectángulo Imposible SI).
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  reconstructSystemFromLines,
  solveSystem2x2,
} from '../logic.js';
import {
  createSysBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  attachSvgDrag,
  createPredictBox,
  clipLineToBox,
  clampPx,
} from './board-kit.js';

export function initTraductorProblemas(host) {
  if (!host) return null;

  const state = {
    mode: 'graph', // 'graph' | 'word'
    perpLock: true,
    p1A: { x: 0, y: -2 },
    p1B: { x: 4, y: 0 },
    p2A: { x: 0, y: 10 },
    p2B: { x: 5, y: 0 },
    wordPreset: 'simulacro_2019',
  };

  const predictBox = createPredictBox({
    prompt:
      'En una liquidación pagás 10% de descuento en una heladera (h) y 5% de descuento en una cocina (c). Si en caja abonás $36.400 en total, ¿qué porcentaje multiplica a cada precio de lista?',
    options: [
      {
        label: '0,10·h + 0,05·c = 36400 (porque esos son los porcentajes del anuncio).',
        correct: false,
        explanation:
          '0,10·h + 0,05·c suma lo que te AHORRASTE de descuento, no lo que pagaste en caja.',
      },
      {
        label: '0,90·h + 0,95·c = 36400 (lo efectivamente pagado es 100% menos el descuento).',
        correct: true,
        explanation:
          '¡Exacto! Con 10% de descuento pagás el 90% (0,90·h) y con 5% de descuento pagás el 95% (0,95·c).',
      },
      {
        label: '1,10·h + 1,05·c = 36400.',
        correct: false,
        explanation:
          '1,10 y 1,05 representan recargos (aumentos), no descuentos.',
      },
    ],
    onVerify: () => {
      state.mode = 'word';
      state.wordPreset = 'simulacro_2019';
      update();
    },
  });

  const modeBar = h('div', { class: 'pr-chip-row' });
  const btnGraph = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Modo A · Reconstrucción desde Gráfica');
  const btnWord = h('button', { type: 'button', class: 'pr-chip' }, 'Modo B · Modelizador de Enunciados');
  modeBar.append(btnGraph, btnWord);

  const graphControls = h('div', { class: 'pr-presets' });
  const btnEj14 = h('button', { type: 'button', class: 'pr-chip' }, 'Ej. 14: y=−2x+4 y y=½x−3');
  const btnEj15 = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Ej. 15: Perpendiculares → (24/5; 2/5)');
  const btnPerpToggle = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Candado r₂ ⊥ r₁: ON');
  graphControls.append(btnEj14, btnEj15, btnPerpToggle);

  const WORD_SCENARIOS = [
    {
      id: 'simulacro_2019',
      label: 'Simulacro 2019: Heladera y Cocina (Descuento)',
      eq1Text: 'h − 5500 = c  (h excede en $5500 a c)',
      eq2Text: '0,90h + 0,95c = 36400  (se paga 90% y 95%)',
      sys: { a1: 1, b1: -1, c1: 5500, a2: 0.9, b2: 0.95, c2: 36400 },
      scale: { xDiv: 5000, yDiv: 5000, xLabel: 'h (miles $)', yLabel: 'c (miles $)' },
      bounds: { xMin: 0, xMax: 8, yMin: 0, yMax: 8 },
      interpretation: 'h = $22.500 y c = $17.000 (verifican diferencia de $5.500 y pago total $36.400).',
    },
    {
      id: 'ej13b_encuentro',
      label: 'Ej. 13b: Micro y Auto (Encuentro)',
      eq1Text: 'd = 90·t  (micro sale a las 10 hs a 90 km/h)',
      eq2Text: 'd = 120·(t − 1)  (auto sale a las 11 hs a 120 km/h)',
      sys: { a1: 90, b1: -1, c1: 0, a2: 120, b2: -1, c2: 120 },
      scale: { xDiv: 1, yDiv: 100, xLabel: 't (horas desde 10h)', yLabel: 'd (×100 km)' },
      bounds: { xMin: 0, xMax: 6, yMin: 0, yMax: 6 },
      interpretation: 'Se encuentran a las t = 4 h (14:00 hs) y a 360 km del punto de partida.',
    },
    {
      id: 'global2025_reactivos',
      label: 'Global 2025: Reactivos A y B',
      eq1Text: '2A + 4B = 120  (lote 1)',
      eq2Text: '5A + 3B = 195  (lote 2)',
      sys: { a1: 2, b1: 4, c1: 120, a2: 5, b2: 3, c2: 195 },
      scale: { xDiv: 10, yDiv: 10, xLabel: 'A (×10)', yLabel: 'B (×10)' },
      bounds: { xMin: 0, xMax: 7, yMin: 0, yMax: 7 },
      interpretation: 'A = 30 unidades y B = 15 unidades (ambas enteras y positivas: factible).',
    },
    {
      id: 'ej13c_imposible',
      label: 'Ej. 13c: Rectángulo Imposible (SI)',
      eq1Text: '2x + 2y = 20  (perímetro 20 cm)',
      eq2Text: 'x + y = 14  (contradicción de semiperímetro)',
      sys: { a1: 1, b1: 1, c1: 10, a2: 1, b2: 1, c2: 14 },
      scale: { xDiv: 2, yDiv: 2, xLabel: 'base (×2)', yLabel: 'altura (×2)' },
      bounds: { xMin: 0, xMax: 8, yMin: 0, yMax: 8 },
      interpretation: 'Sistema Incompatible (S = ∅): rectas paralelas separadas. No es posible construir el rectángulo.',
    },
  ];

  const wordControls = h('div', { class: 'pr-presets', hidden: '' });
  const wordBtns = WORD_SCENARIOS.map((sc) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, sc.label);
    btn.addEventListener('click', () => {
      playClick();
      state.wordPreset = sc.id;
      predictBox.notifyInteraction();
      update();
    });
    wordControls.appendChild(btn);
    return { id: sc.id, btn };
  });

  const board = createSysBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Reconstrucción gráfica y modelizador de problemas 2×2',
  });

  const line1El = s('line', { stroke: 'var(--blue)', 'stroke-width': 2.8 });
  const line2El = s('line', { stroke: 'var(--yellow)', 'stroke-width': 2.8 });
  board.clippedLayer.append(line1El, line2El);

  const interDot = s('circle', { r: 6.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const interLabel = s('text', { fill: 'var(--green)', 'font-size': 11.5, 'font-weight': 'bold' });
  const h1A = s('circle', { r: 7.5, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const h1B = s('circle', { r: 7.5, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const h2A = s('circle', { r: 7.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const h2B = s('circle', { r: 7.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const eq1Tag = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 18, fill: 'var(--blue)', 'font-size': 11.5, 'font-weight': 'bold' });
  const eq2Tag = s('text', { x: board.plotBox.x + 12, y: board.plotBox.y + 34, fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.overlayLayer.append(interDot, interLabel, h1A, h1B, h2A, h2B, eq1Tag, eq2Tag);

  const readout = h('div', { class: 'pr-readout sys-readout', 'aria-live': 'polite' });
  let mapper = createCartesianMapper(board.plotBox, { xMin: -4, xMax: 8, yMin: -5, yMax: 11 });

  function update() {
    const isGraph = state.mode === 'graph';
    btnGraph.classList.toggle('is-active', isGraph);
    btnWord.classList.toggle('is-active', !isGraph);
    graphControls.hidden = !isGraph;
    wordControls.hidden = isGraph;

    [h1A, h1B, h2A].forEach((n) => n.setAttribute('visibility', isGraph ? 'visible' : 'hidden'));
    h2B.setAttribute('visibility', isGraph && !state.perpLock ? 'visible' : 'hidden');
    btnPerpToggle.classList.toggle('is-active', state.perpLock);
    btnPerpToggle.textContent = `Candado r₂ ⊥ r₁: ${state.perpLock ? 'ON' : 'OFF'}`;

    if (isGraph) {
      mapper = createCartesianMapper(board.plotBox, { xMin: -4, xMax: 8, yMin: -5, yMax: 11 });
      drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 2 });

      if (Math.abs(state.p1A.x - state.p1B.x) < 1e-6 && Math.abs(state.p1A.y - state.p1B.y) < 1e-6) {
        state.p1B.x += 1;
      }

      const l2Spec = state.perpLock
        ? { perpendicularToLine1: true, point: state.p2A }
        : { p1: state.p2A, p2: state.p2B };

      const rec = reconstructSystemFromLines({ p1: state.p1A, p2: state.p1B }, l2Spec);
      const c1 = rec.line1.canonical;
      const c2 = rec.line2.canonical;

      const clip1 = clipLineToBox(ratToNumber(c1.A), ratToNumber(c1.B), ratToNumber(c1.C), mapper);
      const clip2 = clipLineToBox(ratToNumber(c2.A), ratToNumber(c2.B), ratToNumber(c2.C), mapper);
      if (clip1) {
        line1El.setAttribute('x1', mapper.toX(clip1.x1).toFixed(2));
        line1El.setAttribute('y1', mapper.toY(clip1.y1).toFixed(2));
        line1El.setAttribute('x2', mapper.toX(clip1.x2).toFixed(2));
        line1El.setAttribute('y2', mapper.toY(clip1.y2).toFixed(2));
      }
      if (clip2) {
        line2El.setAttribute('x1', mapper.toX(clip2.x1).toFixed(2));
        line2El.setAttribute('y1', mapper.toY(clip2.y1).toFixed(2));
        line2El.setAttribute('x2', mapper.toX(clip2.x2).toFixed(2));
        line2El.setAttribute('y2', mapper.toY(clip2.y2).toFixed(2));
      }

      [
        [h1A, state.p1A],
        [h1B, state.p1B],
        [h2A, state.p2A],
        [h2B, state.p2B],
      ].forEach(([node, pt]) => {
        node.setAttribute('cx', clampPx(mapper.toX(pt.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8).toFixed(1));
        node.setAttribute('cy', clampPx(mapper.toY(pt.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8).toFixed(1));
        node.setAttribute('aria-valuenow', String(pt.x));
      });

      const r1Txt = rec.line1.explicit.valid ? rec.line1.explicit.text : rec.line1.implicit.text;
      const r2Txt = rec.line2.explicit.valid ? rec.line2.explicit.text : rec.line2.implicit.text;
      eq1Tag.textContent = `r₁: ${r1Txt}`;
      eq2Tag.textContent = `r₂: ${r2Txt}${state.perpLock ? ' (⊥ r₁)' : ''}`;

      if (rec.solved.solution) {
        const ix = ratToNumber(rec.solved.solution.x);
        const iy = ratToNumber(rec.solved.solution.y);
        const inView = ix >= mapper.xMin && ix <= mapper.xMax && iy >= mapper.yMin && iy <= mapper.yMax;
        interDot.setAttribute('visibility', inView ? 'visible' : 'hidden');
        interLabel.setAttribute('visibility', inView ? 'visible' : 'hidden');
        if (inView) {
          const px = mapper.toX(ix);
          const py = mapper.toY(iy);
          interDot.setAttribute('cx', px.toFixed(1));
          interDot.setAttribute('cy', py.toFixed(1));
          interLabel.setAttribute('x', clampPx(px + 8, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 105).toFixed(1));
          interLabel.setAttribute('y', clampPx(py - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
          interLabel.textContent = `(${fmtRat(rec.solved.solution.x)}; ${fmtRat(rec.solved.solution.y)})`;
        }
      } else {
        interDot.setAttribute('visibility', 'hidden');
        interLabel.setAttribute('visibility', 'hidden');
      }

      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `Sistema reconstruido: { ${r1Txt} ; ${r2Txt} } · `),
          h('span', { style: 'color: var(--green)' }, `S = ${rec.solved.solutionText}`),
        ]),
        h(
          'div',
          { class: 'muted small' },
          `Arrastrá los puntos de paso azules (r₁) o amarillos (r₂). Con el candado ⊥ ON, r₂ gira automáticamente a 90° de r₁.`
        )
      );
      return;
    }

    // Modo B · Modelizador de enunciados
    const sc = WORD_SCENARIOS.find((s) => s.id === state.wordPreset) || WORD_SCENARIOS[0];
    wordBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === sc.id));

    mapper = createCartesianMapper(board.plotBox, sc.bounds);
    drawCartesianAxes(board.gridLayer, mapper, {
      xStep: 1,
      yStep: 1,
      xLabel: sc.scale.xLabel,
      yLabel: sc.scale.yLabel,
    });

    // Escalamos coeficientes a unidades gráficas del escenario
    const { a1, b1, c1, a2, b2, c2 } = sc.sys;
    const clip1 = clipLineToBox(a1 * sc.scale.xDiv, b1 * sc.scale.yDiv, -c1, mapper);
    const clip2 = clipLineToBox(a2 * sc.scale.xDiv, b2 * sc.scale.yDiv, -c2, mapper);
    if (clip1) {
      line1El.setAttribute('x1', mapper.toX(clip1.x1).toFixed(2));
      line1El.setAttribute('y1', mapper.toY(clip1.y1).toFixed(2));
      line1El.setAttribute('x2', mapper.toX(clip1.x2).toFixed(2));
      line1El.setAttribute('y2', mapper.toY(clip1.y2).toFixed(2));
    }
    if (clip2) {
      line2El.setAttribute('x1', mapper.toX(clip2.x1).toFixed(2));
      line2El.setAttribute('y1', mapper.toY(clip2.y1).toFixed(2));
      line2El.setAttribute('x2', mapper.toX(clip2.x2).toFixed(2));
      line2El.setAttribute('y2', mapper.toY(clip2.y2).toFixed(2));
    }

    eq1Tag.textContent = sc.eq1Text;
    eq2Tag.textContent = sc.eq2Text;

    const solved = solveSystem2x2(sc.sys);
    if (solved.solution) {
      const gx = ratToNumber(solved.solution.x) / sc.scale.xDiv;
      const gy = ratToNumber(solved.solution.y) / sc.scale.yDiv;
      const px = clampPx(mapper.toX(gx), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
      const py = clampPx(mapper.toY(gy), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
      interDot.setAttribute('cx', px.toFixed(1));
      interDot.setAttribute('cy', py.toFixed(1));
      interDot.setAttribute('visibility', 'visible');
      interLabel.setAttribute('x', clampPx(px + 9, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 110).toFixed(1));
      interLabel.setAttribute('y', clampPx(py - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      interLabel.textContent = `(${fmtRat(solved.solution.x)}; ${fmtRat(solved.solution.y)})`;
      interLabel.setAttribute('visibility', 'visible');
    } else {
      interDot.setAttribute('visibility', 'hidden');
      interLabel.setAttribute('visibility', 'hidden');
    }

    readout.replaceChildren(
      h('div', {}, [
        h('strong', {}, `${sc.label} · `),
        h('span', { style: 'color: var(--green)' }, `S = ${solved.solutionText}`),
      ]),
      h('div', { class: 'muted small' }, sc.interpretation)
    );
  }

  const bindPt = (node, ptObj, label) => {
    attachSvgDrag(
      board.svg,
      node,
      () => mapper,
      ({ x, y }) => {
        ptObj.x = Math.max(-3.5, Math.min(7.5, Math.round(x * 2) / 2));
        ptObj.y = Math.max(-4.5, Math.min(10.5, Math.round(y * 2) / 2));
        predictBox.notifyInteraction();
        update();
      },
      { ariaLabel: label, stepX: 0.5, stepY: 0.5 }
    );
  };

  bindPt(h1A, state.p1A, 'Mover primer punto de r₁');
  bindPt(h1B, state.p1B, 'Mover segundo punto de r₁');
  bindPt(h2A, state.p2A, 'Mover punto de paso de r₂');
  bindPt(h2B, state.p2B, 'Mover segundo punto de r₂');

  btnGraph.addEventListener('click', () => {
    playClick();
    state.mode = 'graph';
    update();
  });
  btnWord.addEventListener('click', () => {
    playClick();
    state.mode = 'word';
    update();
  });
  btnPerpToggle.addEventListener('click', () => {
    playClick();
    state.perpLock = !state.perpLock;
    update();
  });
  btnEj14.addEventListener('click', () => {
    playClick();
    state.perpLock = false;
    state.p1A = { x: 0, y: 4 };
    state.p1B = { x: 2, y: 0 };
    state.p2A = { x: 0, y: -3 };
    state.p2B = { x: 6, y: 0 };
    btnEj14.classList.add('is-active');
    btnEj15.classList.remove('is-active');
    update();
  });
  btnEj15.addEventListener('click', () => {
    playClick();
    state.perpLock = true;
    state.p1A = { x: 0, y: -2 };
    state.p1B = { x: 4, y: 0 };
    state.p2A = { x: 0, y: 10 };
    btnEj15.classList.add('is-active');
    btnEj14.classList.remove('is-active');
    update();
  });

  host.replaceChildren(predictBox, modeBar, graphControls, wordControls, board.svg, readout);
  update();
  return { board, update };
}
