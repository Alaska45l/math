/**
 * @file js/modules/lineal/widgets/constructor-rectas.js
 * Widget 1 · Sec. 1 (sec-pendiente-estudio):
 * Constructor interactivo de rectas por 2 puntos (P, Q) o por pendiente y ordenada (m, b),
 * con triángulo de escalera Δx / Δy, arco de ángulo α, detección de recta vertical sin pendiente
 * y estudio analítico completo (Dom, Im, C0, C+, C-, biyectividad).
 */

import { h, s } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import {
  MINUS,
  ratFromNumber,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  analyzeLinear,
} from '../logic.js';
import {
  createLineBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  attachSvgDrag,
  createSliderField,
  createPredictBox,
  clipLineToBox,
  clampPx,
} from './board-kit.js';

export function initConstructorRectas(host) {
  if (!host) return null;

  const state = {
    mode: 'points', // 'points' | 'mb'
    p1: { x: 0, y: 4 },
    p2: { x: 1.5, y: 0 },
    m: -8 / 3,
    b: 4,
    activePreset: 'f_ej2',
  };

  const predictBox = createPredictBox({
    prompt:
      'Si movés Q verticalmente mientras P queda fijo, ¿qué le pasa a la pendiente m, y qué ocurre si colocás Q exactamente encima de P en vertical (x₂ = x₁)?',
    options: [
      {
        label: 'La pendiente cambia de valor y al igualar x₂ = x₁ se vuelve cero (m = 0).',
        correct: false,
        explanation:
          'Cuando x₂ = x₁ el denominador Δx = x₂ − x₁ vale 0. No da m = 0 (eso pasa cuando y₂ = y₁), sino división por cero: recta vertical sin pendiente.',
      },
      {
        label: 'La pendiente cambia al variar Δy, y cuando x₂ = x₁ (Δx = 0) no existe pendiente y la recta vertical deja de ser función.',
        correct: true,
        explanation:
          'Exacto: m = Δy / Δx requiere x₂ ≠ x₁. Cuando x₂ = x₁ obtenés una recta vertical x = k que asigna infinitas alturas a un mismo x y no es función.',
      },
      {
        label: 'La recta gira siempre manteniendo la misma pendiente m mientras P no se mueva.',
        correct: false,
        explanation:
          'Un único punto P deja girar la recta como una bisagra; mover Q cambia el cociente Δy / Δx y altera la inclinación.',
      },
    ],
    onVerify: () => {
      state.mode = 'points';
      state.p1 = { x: 2, y: -1 };
      state.p2 = { x: 2, y: 4 };
      state.activePreset = 'vertical_x2';
      syncModeVisibility();
      update();
    },
  });

  const modeBar = h('div', { class: 'pr-chip-row' });
  const btnModePoints = h('button', { type: 'button', class: 'pr-chip is-active' }, 'Modo 2 puntos (P y Q)');
  const btnModeMb = h('button', { type: 'button', class: 'pr-chip' }, 'Modo Pendiente (m y b)');
  modeBar.append(btnModePoints, btnModeMb);

  const presetsRow = h('div', { class: 'pr-presets' });
  const PRESETS = [
    { id: 'f_ej2', label: 'f(x) = −(8/3)x + 4', mode: 'points', p1: { x: 0, y: 4 }, p2: { x: 1.5, y: 0 } },
    { id: 'parcial_2025', label: 'Parcial 2025: 5 − (3/2)x', mode: 'mb', m: -1.5, b: 5 },
    { id: 'ej6f', label: 'P(−2; 1) y Q(−3; −2)', mode: 'points', p1: { x: -2, y: 1 }, p2: { x: -3, y: -2 } },
    { id: 'horizontal_y3', label: 'Horizontal y = 3', mode: 'mb', m: 0, b: 3 },
    { id: 'vertical_x2', label: 'Vertical x = 2 (no función)', mode: 'points', p1: { x: 2, y: -2 }, p2: { x: 2, y: 3 } },
  ];

  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.mode = pr.mode;
      state.activePreset = pr.id;
      if (pr.mode === 'points') {
        state.p1 = { ...pr.p1 };
        state.p2 = { ...pr.p2 };
      } else {
        state.m = pr.m;
        state.b = pr.b;
        sliderM.setValue(pr.m);
        sliderB.setValue(pr.b);
      }
      predictBox.notifyInteraction();
      syncModeVisibility();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const sliderM = createSliderField({
    label: 'Pendiente m',
    min: -4,
    max: 4,
    step: 0.25,
    value: state.m,
    formatValue: (v) => fmtNumberEsAR(v, 2),
    onInput: (val) => {
      state.m = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const sliderB = createSliderField({
    label: 'Ordenada al origen b',
    min: -5,
    max: 6,
    step: 0.5,
    value: state.b,
    formatValue: (v) => fmtNumberEsAR(v, 1),
    onInput: (val) => {
      state.b = val;
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
  });

  const slidersWrap = h('div', { class: 'lin-sliders-grid', hidden: '' }, [sliderM.root, sliderB.root]);

  const board = createLineBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Constructor cartesiano de rectas con triángulo de pendiente',
  });
  const mapper = createCartesianMapper(board.plotBox, {
    xMin: -6,
    xMax: 6,
    yMin: -5,
    yMax: 7,
  });
  drawCartesianAxes(board.gridLayer, mapper, { xStep: 1, yStep: 1 });

  // Nodos SVG persistentes (misma referencia DOM en todo momento)
  const mainLine = s('line', {
    stroke: 'var(--yellow)',
    'stroke-width': 2.8,
    'stroke-linecap': 'round',
  });
  const dxLeg = s('line', {
    stroke: 'var(--blue)',
    'stroke-width': 2,
    'stroke-dasharray': '5 4',
  });
  const dyLeg = s('line', {
    stroke: 'var(--pink)',
    'stroke-width': 2,
    'stroke-dasharray': '5 4',
  });
  const angleArc = s('path', {
    fill: 'none',
    stroke: 'var(--green)',
    'stroke-width': 1.8,
  });

  board.clippedLayer.append(dxLeg, dyLeg, angleArc, mainLine);

  const rootDot = s('circle', { r: 5.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const rootLabel = s('text', { fill: 'var(--green)', 'font-size': 11, 'font-weight': 'bold' });
  const yIntDot = s('circle', { r: 5.5, fill: 'var(--pink)', stroke: 'var(--bg)', 'stroke-width': 1.8 });
  const yIntLabel = s('text', { fill: 'var(--pink)', 'font-size': 11, 'font-weight': 'bold' });

  const dxLabel = s('text', { fill: 'var(--blue)', 'font-size': 11, 'font-weight': 'bold', 'text-anchor': 'middle' });
  const dyLabel = s('text', { fill: 'var(--pink)', 'font-size': 11, 'font-weight': 'bold' });

  const handleP = s('circle', {
    r: 8,
    fill: 'var(--blue)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const labelP = s('text', { fill: 'var(--blue)', 'font-size': 11.5, 'font-weight': 'bold' });

  const handleQ = s('circle', {
    r: 8,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const labelQ = s('text', { fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' });

  const verticalBadge = s('text', {
    x: board.plotBox.x + 12,
    y: board.plotBox.y + 22,
    fill: 'var(--pink)',
    'font-size': 12.5,
    'font-weight': 'bold',
    visibility: 'hidden',
  }, 'Recta vertical: no es función (un x con infinitas y)');

  board.overlayLayer.append(
    dxLabel,
    dyLabel,
    rootDot,
    rootLabel,
    yIntDot,
    yIntLabel,
    handleP,
    labelP,
    handleQ,
    labelQ,
    verticalBadge
  );

  const readout = h('div', { class: 'pr-readout lin-readout', 'aria-live': 'polite' });

  function syncModeVisibility() {
    const isPts = state.mode === 'points';
    btnModePoints.classList.toggle('is-active', isPts);
    btnModeMb.classList.toggle('is-active', !isPts);
    slidersWrap.hidden = isPts;
    handleP.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    labelP.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    handleQ.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    labelQ.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    dxLeg.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    dyLeg.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    dxLabel.setAttribute('visibility', isPts ? 'visible' : 'hidden');
    dyLabel.setAttribute('visibility', isPts ? 'visible' : 'hidden');
  }

  function update() {
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === state.activePreset));

    let spec;
    if (state.mode === 'points') {
      if (Math.abs(state.p1.x - state.p2.x) < 1e-6 && Math.abs(state.p1.y - state.p2.y) < 1e-6) {
        state.p2.y = Math.min(6, state.p1.y + 2);
      }
      spec = { p1: state.p1, p2: state.p2 };
    } else {
      spec = { m: state.m, b: state.b };
    }

    const study = analyzeLinear(spec);
    const { A, B, C } = study.forms.canonical;
    const clipped = clipLineToBox(ratToNumber(A), ratToNumber(B), ratToNumber(C), mapper);

    if (clipped) {
      mainLine.setAttribute('x1', mapper.toX(clipped.x1).toFixed(2));
      mainLine.setAttribute('y1', mapper.toY(clipped.y1).toFixed(2));
      mainLine.setAttribute('x2', mapper.toX(clipped.x2).toFixed(2));
      mainLine.setAttribute('y2', mapper.toY(clipped.y2).toFixed(2));
    }

    // Handles P, Q y triángulo de pendiente
    if (state.mode === 'points') {
      const px1 = clampPx(mapper.toX(state.p1.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
      const py1 = clampPx(mapper.toY(state.p1.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
      const px2 = clampPx(mapper.toX(state.p2.x), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
      const py2 = clampPx(mapper.toY(state.p2.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);

      handleP.setAttribute('cx', px1.toFixed(1));
      handleP.setAttribute('cy', py1.toFixed(1));
      handleP.setAttribute('aria-valuenow', String(state.p1.x));
      labelP.setAttribute('x', clampPx(px1 + 10, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 92).toFixed(1));
      labelP.setAttribute('y', clampPx(py1 - 10, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      labelP.textContent = `P(${fmtNumberEsAR(state.p1.x, 1)}; ${fmtNumberEsAR(state.p1.y, 1)})`;

      handleQ.setAttribute('cx', px2.toFixed(1));
      handleQ.setAttribute('cy', py2.toFixed(1));
      handleQ.setAttribute('aria-valuenow', String(state.p2.x));
      labelQ.setAttribute('x', clampPx(px2 + 10, board.plotBox.x + 6, board.plotBox.x + board.plotBox.w - 92).toFixed(1));
      labelQ.setAttribute('y', clampPx(py2 + 16, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
      labelQ.textContent = `Q(${fmtNumberEsAR(state.p2.x, 1)}; ${fmtNumberEsAR(state.p2.y, 1)})`;

      // Catetos Δx y Δy
      dxLeg.setAttribute('x1', px1.toFixed(1));
      dxLeg.setAttribute('y1', py1.toFixed(1));
      dxLeg.setAttribute('x2', px2.toFixed(1));
      dxLeg.setAttribute('y2', py1.toFixed(1));

      dyLeg.setAttribute('x1', px2.toFixed(1));
      dyLeg.setAttribute('y1', py1.toFixed(1));
      dyLeg.setAttribute('x2', px2.toFixed(1));
      dyLeg.setAttribute('y2', py2.toFixed(1));

      const dxVal = state.p2.x - state.p1.x;
      const dyVal = state.p2.y - state.p1.y;
      dxLabel.setAttribute('x', ((px1 + px2) / 2).toFixed(1));
      dxLabel.setAttribute('y', clampPx(py1 + 14, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 4).toFixed(1));
      dxLabel.textContent = `Δx=${fmtNumberEsAR(dxVal, 1)}`;

      dyLabel.setAttribute('x', clampPx(px2 + 8, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 65).toFixed(1));
      dyLabel.setAttribute('y', ((py1 + py2) / 2).toFixed(1));
      dyLabel.textContent = `Δy=${fmtNumberEsAR(dyVal, 1)}`;
    }

    // Interceptos y arco de ángulo α
    if (study.yIntercept) {
      const yIntVal = ratToNumber(study.yIntercept.y);
      const inRange = yIntVal >= mapper.yMin && yIntVal <= mapper.yMax;
      yIntDot.setAttribute('visibility', inRange ? 'visible' : 'hidden');
      yIntLabel.setAttribute('visibility', inRange ? 'visible' : 'hidden');
      if (inRange) {
        const cx = mapper.toX(0);
        const cy = mapper.toY(yIntVal);
        yIntDot.setAttribute('cx', cx.toFixed(1));
        yIntDot.setAttribute('cy', cy.toFixed(1));
        yIntLabel.setAttribute('x', (cx + 9).toFixed(1));
        yIntLabel.setAttribute('y', clampPx(cy - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 6).toFixed(1));
        yIntLabel.textContent = `(0; ${fmtRat(study.yIntercept.y)})`;
      }
    } else {
      yIntDot.setAttribute('visibility', 'hidden');
      yIntLabel.setAttribute('visibility', 'hidden');
    }

    if (study.xIntercept && typeof study.xIntercept === 'object') {
      const xIntVal = ratToNumber(study.xIntercept.x);
      const inRange = xIntVal >= mapper.xMin && xIntVal <= mapper.xMax;
      rootDot.setAttribute('visibility', inRange ? 'visible' : 'hidden');
      rootLabel.setAttribute('visibility', inRange ? 'visible' : 'hidden');
      if (inRange) {
        const cx = mapper.toX(xIntVal);
        const cy = mapper.toY(0);
        rootDot.setAttribute('cx', cx.toFixed(1));
        rootDot.setAttribute('cy', cy.toFixed(1));
        rootLabel.setAttribute('x', clampPx(cx + 8, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 90).toFixed(1));
        rootLabel.setAttribute('y', (cy - 9).toFixed(1));
        rootLabel.textContent = `C₀(${fmtRat(study.xIntercept.x)}; 0)`;

        // Arco α con semieje +X
        if (!study.isHorizontal && study.angleDeg > 1) {
          const rad = (study.angleDeg * Math.PI) / 180;
          const R = 24;
          const endX = cx + R * Math.cos(rad);
          const endY = cy - R * Math.sin(rad);
          angleArc.setAttribute('d', `M ${(cx + R).toFixed(1)} ${cy.toFixed(1)} A ${R} ${R} 0 0 0 ${endX.toFixed(1)} ${endY.toFixed(1)}`);
          angleArc.setAttribute('visibility', 'visible');
        } else {
          angleArc.setAttribute('visibility', 'hidden');
        }
      } else {
        angleArc.setAttribute('visibility', 'hidden');
      }
    } else {
      rootDot.setAttribute('visibility', 'hidden');
      rootLabel.setAttribute('visibility', 'hidden');
      angleArc.setAttribute('visibility', 'hidden');
    }

    verticalBadge.setAttribute('visibility', study.isVertical ? 'visible' : 'hidden');

    // Readout fijo con estudio analítico completo
    if (study.isVertical) {
      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `Recta vertical x = ${fmtRat(study.x0)} · `),
          h('span', { style: 'color: var(--pink)' }, 'Sin pendiente (Δx = 0) · No es función'),
        ]),
        h('div', { class: 'muted small' }, `Dom = ${study.domain} · Im = ℝ · α = 90° · Inversa: no aplica (no es función).`)
      );
    } else {
      const mStr = fmtRat(study.slope);
      const bijStr = study.isBijective
        ? `Biyectiva en ℝ · f⁻¹(x): ${study.inverse.text}`
        : 'No inyectiva ni suryectiva en ℝ (constante horizontal)';
      readout.replaceChildren(
        h('div', {}, [
          h('strong', {}, `${study.forms.explicit.text} · `),
          h('span', {}, `m = ${mStr} · α ≈ ${fmtNumberEsAR(study.angleDeg, 1)}° · C₀ = ${study.C0}`),
        ]),
        h(
          'div',
          { class: 'muted small' },
          `Dom = ${study.domain} · Im = ${study.image} · C⁺ = ${study.CPlus} · C⁻ = ${study.CMinus} · ${bijStr}`
        )
      );
    }
  }

  attachSvgDrag(
    board.svg,
    handleP,
    () => mapper,
    ({ x, y }) => {
      state.p1.x = Math.max(-5.5, Math.min(5.5, Math.round(x * 2) / 2));
      state.p1.y = Math.max(-4.5, Math.min(6.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Arrastrar punto P de la recta', stepX: 0.5, stepY: 0.5 }
  );

  attachSvgDrag(
    board.svg,
    handleQ,
    () => mapper,
    ({ x, y }) => {
      state.p2.x = Math.max(-5.5, Math.min(5.5, Math.round(x * 2) / 2));
      state.p2.y = Math.max(-4.5, Math.min(6.5, Math.round(y * 2) / 2));
      state.activePreset = 'custom';
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Arrastrar punto Q de la recta', stepX: 0.5, stepY: 0.5 }
  );

  btnModePoints.addEventListener('click', () => {
    playClick();
    state.mode = 'points';
    syncModeVisibility();
    update();
  });

  btnModeMb.addEventListener('click', () => {
    playClick();
    state.mode = 'mb';
    const study = analyzeLinear({ p1: state.p1, p2: state.p2 });
    if (!study.isVertical) {
      state.m = Math.max(-4, Math.min(4, Number(ratToNumber(study.slope).toFixed(2))));
      state.b = Math.max(-5, Math.min(6, Number(ratToNumber(study.yIntercept.y).toFixed(2))));
      sliderM.setValue(state.m);
      sliderB.setValue(state.b);
    }
    syncModeVisibility();
    update();
  });

  host.replaceChildren(predictBox, modeBar, presetsRow, slidersWrap, board.svg, readout);
  syncModeVisibility();
  update();

  return { board, update };
}
