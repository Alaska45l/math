/**
 * desarmador-barras.js — Widget 6 (Sección 6):
 * «El Desarmador Algebraico de Barras» de f(x) = a|x - h| + k a función por partes.
 * Muestra el desarrollo algebraico completo en 3 pasos (apertura de barras, distributiva de a,
 * y agrupación m·x + b) y permite barrer con un escáner x persistente en slider o en el SVG.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard, piecewiseBrace } from '../components.js';
import { approxEq, formatCanonicalAbs, toPiecewise } from '../logic.js';

export function initDesarmadorBarrasWidget(container) {
  let state = {
    a: 2,
    h: 3,
    k: 1,
    scannerX: 1,
  };

  const boardSlot = h('div', { class: 'seq-plot-card' });
  const braceSlot = h('div', { style: 'margin-top: 10px;' });
  const stepsCard = h('div', { class: 'va-readout', style: 'margin-top: 12px;' });

  const valA = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.a));
  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' }, fmt(state.h));
  const valK = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, fmt(state.k));
  const valX = h('strong', { class: 'eq', style: 'color: var(--green);' }, fmt(state.scannerX));

  const sliderA = h('input', {
    type: 'range',
    min: -3,
    max: 3,
    step: 1,
    value: state.a,
    'aria-label': 'Coeficiente externo a',
  });

  const sliderH = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 1,
    value: state.h,
    'aria-label': 'Frontera de quiebre h',
  });

  const sliderK = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 1,
    value: state.k,
    'aria-label': 'Término independiente k',
  });

  const sliderX = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.scannerX,
    'aria-label': 'Escáner de dominio x',
  });

  const board = createAbsBoard(boardSlot, {
    a: state.a,
    h: state.h,
    k: state.k,
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    draggableVertex: true,
    draggableSlope: true,
    draggableExplorer: true,
    explorerX: state.scannerX,
    showSymmetryAxis: true,
    showSlopeTriangle: false,
    customUnderRender(plane, props) {
      const hx = plane.sx(props.h);
      const xLeft = plane.sx(-6);
      const xRight = plane.sx(6);
      const yTop = plane.sy(6);
      const yBot = plane.sy(-6);
      const isLeftActive = state.scannerX < props.h;

      // Sombreado de las dos zonas de dominio separadas por la frontera x = h
      plane.layers.under.append(
        s('rect', {
          x: xLeft,
          y: yTop,
          width: Math.max(0, hx - xLeft),
          height: yBot - yTop,
          fill: isLeftActive ? 'rgba(242, 143, 173, 0.11)' : 'rgba(242, 143, 173, 0.03)',
        }),
        s('rect', {
          x: hx,
          y: yTop,
          width: Math.max(0, xRight - hx),
          height: yBot - yTop,
          fill: !isLeftActive ? 'rgba(166, 227, 161, 0.11)' : 'rgba(166, 227, 161, 0.03)',
        }),
        s('text', {
          x: xLeft + 10,
          y: yTop + 18,
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, `Zona 1: x < ${fmt(props.h)} (interior < 0)`),
        s('text', {
          x: xRight - 10,
          y: yTop + 18,
          'text-anchor': 'end',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, `Zona 2: x ≥ ${fmt(props.h)} (interior ≥ 0)`)
      );
    },
    customOverRender(plane, props) {
      const sxVal = state.scannerX;
      const syVal = props.a * Math.abs(sxVal - props.h) + props.k;
      const px = plane.sx(sxVal);
      const py = plane.sy(syVal);
      const isLeft = sxVal < props.h;

      plane.layers.marks.append(
        s('line', {
          x1: px,
          y1: plane.sy(0),
          x2: px,
          y2: py,
          stroke: isLeft ? 'var(--pink)' : 'var(--green)',
          'stroke-width': '1.8',
          'stroke-dasharray': '4 3',
        }),
        s('g', { dataset: { handle: 'explorer' }, style: 'cursor: grab;' },
          s('circle', { cx: px, cy: py, r: 14, fill: 'transparent' }),
          s('circle', {
            cx: px,
            cy: py,
            r: 7.5,
            fill: isLeft ? 'var(--pink)' : 'var(--green)',
            stroke: 'var(--bg)',
            'stroke-width': '2',
          })
        ),
        s('text', {
          x: px + (isLeft ? -10 : 10),
          y: py - 10,
          'text-anchor': isLeft ? 'end' : 'start',
          fill: isLeft ? 'var(--pink)' : 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 15px)',
          'font-weight': 'bold',
        }, `(${fmt(sxVal)}; ${fmt(syVal)})`)
      );
    },
    onChange(next) {
      let changedParams = false;
      if (next.a !== state.a || next.h !== state.h || next.k !== state.k) {
        state.a = next.a;
        state.h = next.h;
        state.k = next.k;
        sliderA.value = String(state.a);
        sliderH.value = String(state.h);
        sliderK.value = String(state.k);
        changedParams = true;
      }
      if (typeof next.explorerX === 'number' && next.explorerX !== state.scannerX) {
        state.scannerX = next.explorerX;
        sliderX.value = String(state.scannerX);
      }
      syncUI(!changedParams);
    },
  });

  sliderA.addEventListener('input', (e) => {
    let v = parseFloat(e.target.value);
    if (approxEq(v, 0)) v = state.a >= 0 ? -1 : 1;
    state.a = v;
    sliderA.value = String(state.a);
    syncUI(true);
  });

  sliderH.addEventListener('input', (e) => {
    state.h = parseFloat(e.target.value);
    syncUI(true);
  });

  sliderK.addEventListener('input', (e) => {
    state.k = parseFloat(e.target.value);
    syncUI(true);
  });

  sliderX.addEventListener('input', (e) => {
    state.scannerX = parseFloat(e.target.value);
    syncUI(true);
  });

  function formatSignedTerm(val) {
    if (approxEq(val, 0)) return '+ 0';
    return val > 0 ? `+ ${fmt(val)}` : `− ${fmt(Math.abs(val))}`;
  }

  function syncUI(updateBoard = true) {
    valA.textContent = fmt(state.a);
    valH.textContent = fmt(state.h);
    valK.textContent = fmt(state.k);
    valX.textContent = fmt(state.scannerX);

    if (updateBoard) {
      board.update({
        a: state.a,
        h: state.h,
        k: state.k,
        explorerX: state.scannerX,
      });
    }

    const pw = toPiecewise(state.a, state.h, state.k);
    const isLeftActive = state.scannerX < state.h;
    const activeIdx = isLeftActive ? 0 : 1;
    const canonStr = formatCanonicalAbs(state.a, state.h, state.k);

    piecewiseBrace(
      braceSlot,
      [
        {
          exprText: `${pw.leftBranch.rawText}  =  ${pw.leftBranch.simplifiedText}`,
          condition: pw.leftBranch.condition,
        },
        {
          exprText: `${pw.rightBranch.rawText}  =  ${pw.rightBranch.simplifiedText}`,
          condition: pw.rightBranch.condition,
        },
      ],
      activeIdx,
      { fnName: `f(x) = ${canonStr}` }
    );

    const activeBranch = isLeftActive ? pw.leftBranch : pw.rightBranch;
    const yVal = activeBranch.m * state.scannerX + activeBranch.b;

    // 3 pasos algebraicos explícitos para ambas ramas
    const leftDistTerm = state.a * state.h;
    const rightDistTerm = -state.a * state.h;
    const leftStep2 = `${fmt(-state.a)}x ${formatSignedTerm(leftDistTerm)} ${formatSignedTerm(state.k)}`;
    const rightStep2 = `${fmt(state.a)}x ${formatSignedTerm(rightDistTerm)} ${formatSignedTerm(state.k)}`;

    mount(
      stepsCard,
      h('p', { class: 'eq', style: 'margin: 0 0 8px; font-size: 1.05rem;' },
        `Escáner en x = ${fmt(state.scannerX)}: como ${fmt(state.scannerX)} ${isLeftActive ? '<' : '≥'} ${fmt(state.h)}, `,
        `se activa la `,
        h('strong', { style: `color: ${isLeftActive ? 'var(--pink)' : 'var(--green)'};` },
          isLeftActive ? 'Rama Izquierda' : 'Rama Derecha'
        ),
        ` ⟹ f(${fmt(state.scannerX)}) = ${activeBranch.simplifiedText} = `,
        h('strong', { style: 'color: var(--yellow); font-size: 1.18rem;' }, fmt(yVal))
      ),
      h('div', { class: 'va-comparator-grid' },
        h('div', {
          class: 'va-comparator-col',
          style: `border-color: ${isLeftActive ? 'var(--pink)' : 'rgba(255,255,255,0.12)'}; background: ${isLeftActive ? 'rgba(242, 143, 173, 0.08)' : 'rgba(255,255,255,0.02)'};`,
        },
          h('strong', { class: 'eq', style: 'color: var(--pink); display: block; margin-bottom: 4px;' },
            `Rama 1 (Izquierda): si ${pw.leftBranch.condition}`
          ),
          h('p', { class: 'small eq', style: 'margin: 2px 0;' }, `Paso 1 (Abrir barras con −): ${pw.leftBranch.rawText}`),
          h('p', { class: 'small eq', style: 'margin: 2px 0;' }, `Paso 2 (Distribuir): ${leftStep2}`),
          h('p', { class: 'small eq', style: 'margin: 2px 0; color: var(--yellow); font-weight: bold;' },
            `Paso 3 (Recta m₁x + b₁): ${pw.leftBranch.simplifiedText}`
          )
        ),
        h('div', {
          class: 'va-comparator-col',
          style: `border-color: ${!isLeftActive ? 'var(--green)' : 'rgba(255,255,255,0.12)'}; background: ${!isLeftActive ? 'rgba(166, 227, 161, 0.08)' : 'rgba(255,255,255,0.02)'};`,
        },
          h('strong', { class: 'eq', style: 'color: var(--green); display: block; margin-bottom: 4px;' },
            `Rama 2 (Derecha): si ${pw.rightBranch.condition}`
          ),
          h('p', { class: 'small eq', style: 'margin: 2px 0;' }, `Paso 1 (Abrir barras con +): ${pw.rightBranch.rawText}`),
          h('p', { class: 'small eq', style: 'margin: 2px 0;' }, `Paso 2 (Distribuir): ${rightStep2}`),
          h('p', { class: 'small eq', style: 'margin: 2px 0; color: var(--yellow); font-weight: bold;' },
            `Paso 3 (Recta m₂x + b₂): ${pw.rightBranch.simplifiedText}`
          )
        )
      )
    );
  }

  mount(
    container,
    h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' }, 'Factor a = ', valA, sliderA),
      h('label', { class: 'field__label' }, 'Quiebre h = ', valH, sliderH),
      h('label', { class: 'field__label' }, 'Altura k = ', valK, sliderK),
      h('label', { class: 'field__label' }, 'Escáner x = ', valX, sliderX)
    ),
    boardSlot,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    braceSlot,
    stepsCard
  );

  syncUI(false);
}
