/**
 * traslacion-vh.js — Widget 3 (Sección 3):
 * «Desplazamiento del Vértice (h, k) en Vivo» para f(x) = |x - h| + k.
 * Incluye referencia fantasma y = |x|, vectores de traslación con flechas (Δx = h, Δy = k),
 * y medidor interactivo de distancia cero «¿Por qué h lleva el signo contrario adentro?».
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard, annotatedAbsFormula } from '../components.js';
import { formatCanonicalAbs } from '../logic.js';

export function initTraslacionVHWidget(container) {
  let state = {
    h: 3,
    k: -2,
    testX: 3,
  };

  const boardSlot = h('div', { class: 'seq-plot-card' });
  const formulaSlot = h('div', { style: 'margin-top: 8px;' });
  const trapCard = h('div', { class: 'va-readout', style: 'margin-top: 10px;' });

  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' }, fmt(state.h));
  const valK = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, fmt(state.k));

  const sliderH = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.h,
    'aria-label': 'Coordenada horizontal h del vértice',
  });

  const sliderK = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.k,
    'aria-label': 'Coordenada vertical k del vértice',
  });

  const btnReset = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.h = 0;
        state.k = 0;
        state.testX = 0;
        sliderH.value = '0';
        sliderK.value = '0';
        syncUI(true);
      },
    },
  }, 'Centrar en el origen (0; 0)');

  const annotatedApi = annotatedAbsFormula(formulaSlot, {
    fnName: 'f',
    a: 1,
    h: state.h,
    k: state.k,
  });

  const board = createAbsBoard(boardSlot, {
    a: 1,
    h: state.h,
    k: state.k,
    xMin: -7,
    xMax: 7,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    draggableVertex: true,
    draggableSlope: false,
    showSymmetryAxis: true,
    showReflectionGhost: false,
    showSlopeTriangle: false,
    customUnderRender(plane, props) {
      // Referencia fantasma: función madre y = |x| en el origen
      const ox = plane.sx(0);
      const oy = plane.sy(0);
      plane.layers.under.append(
        s('polyline', {
          points: `${plane.sx(-6)},${plane.sy(6)} ${ox},${oy} ${plane.sx(6)},${plane.sy(6)}`,
          fill: 'none',
          stroke: 'var(--chalk-dim)',
          'stroke-width': '1.8',
          'stroke-dasharray': '4 4',
        }),
        s('circle', {
          cx: ox,
          cy: oy,
          r: 4.5,
          fill: 'var(--chalk-dim)',
        }),
        s('text', {
          x: plane.sx(-4.3),
          y: plane.sy(4.8),
          fill: 'var(--muted)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, 'Madre y = |x|')
      );

      // Vectores de traslación: horizontal Δx = h y vertical Δy = k con flechas
      const vx = plane.sx(props.h);
      const vy = plane.sy(props.k);

      if (props.h !== 0) {
        const dirX = props.h > 0 ? 1 : -1;
        plane.layers.under.append(
          s('line', {
            x1: ox,
            y1: oy,
            x2: vx,
            y2: oy,
            stroke: 'var(--teal)',
            'stroke-width': '2.6',
          }),
          s('polygon', {
            points: `${vx},${oy} ${vx - dirX * 8},${oy - 4.5} ${vx - dirX * 8},${oy + 4.5}`,
            fill: 'var(--teal)',
          }),
          s('text', {
            x: (ox + vx) / 2,
            y: oy + (props.k >= 0 ? 19 : -9),
            'text-anchor': 'middle',
            fill: 'var(--teal)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 15px)',
            'font-weight': 'bold',
          }, `Δx = h = ${props.h > 0 ? `+${fmt(props.h)}` : fmt(props.h)}`)
        );
      }

      if (props.k !== 0) {
        const dirY = props.k > 0 ? -1 : 1; // en SVG arriba es -1
        plane.layers.under.append(
          s('line', {
            x1: vx,
            y1: oy,
            x2: vx,
            y2: vy,
            stroke: 'var(--yellow)',
            'stroke-width': '2.6',
          }),
          s('polygon', {
            points: `${vx},${vy} ${vx - 4.5},${vy - dirY * 8} ${vx + 4.5},${vy - dirY * 8}`,
            fill: 'var(--yellow)',
          }),
          s('text', {
            x: vx + (props.h >= 0 ? 12 : -12),
            y: (oy + vy) / 2 + 4,
            'text-anchor': props.h >= 0 ? 'start' : 'end',
            fill: 'var(--yellow)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 15px)',
            'font-weight': 'bold',
          }, `Δy = k = ${props.k > 0 ? `+${fmt(props.k)}` : fmt(props.k)}`)
        );
      }
    },
    onChange(next) {
      state.h = next.h;
      state.k = next.k;
      state.testX = next.h;
      sliderH.value = String(state.h);
      sliderK.value = String(state.k);
      syncUI(false);
    },
  });

  sliderH.addEventListener('input', (e) => {
    state.h = parseFloat(e.target.value);
    state.testX = state.h;
    syncUI(true);
  });

  sliderK.addEventListener('input', (e) => {
    state.k = parseFloat(e.target.value);
    syncUI(true);
  });

  function syncUI(updateBoard = true) {
    valH.textContent = fmt(state.h);
    valK.textContent = fmt(state.k);

    if (updateBoard) {
      board.update({ h: state.h, k: state.k });
    }
    annotatedApi.update({ a: 1, h: state.h, k: state.k });

    const hInside = state.h === 0
      ? '|x|'
      : state.h > 0
        ? `|x − ${fmt(state.h)}|`
        : `|x + ${fmt(Math.abs(state.h))}|`;

    const wrongX = -state.h;
    const distAtVertex = 0;
    const distAtWrong = Math.abs(wrongX - state.h);

    mount(
      trapCard,
      h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.12rem;' },
        'Fórmula actual: ',
        h('strong', { style: 'color: var(--yellow);' }, `f(x) = ${formatCanonicalAbs(1, state.h, state.k)}`),
        '  ·  Vértice en ',
        h('strong', { style: 'color: var(--teal);' }, `V(${fmt(state.h)}; ${fmt(state.k)})`)
      ),
      h('div', { class: 'va-chalk-callout' },
        h('strong', { style: 'color: var(--teal); display: block; margin-bottom: 4px;' },
          `¿Por qué h = ${fmt(state.h)} lleva el signo contrario adentro de ${hInside}? (Medidor de Distancia Cero)`
        ),
        state.h === 0
          ? h('p', { class: 'small', style: 'margin: 0;' },
              'En el origen (h = 0), el interior |x − 0| = |x| se hace cero exactamente en x = 0. Mové h hacia la derecha o izquierda para ver cómo actúa el punto de distancia cero.'
            )
          : h('div', { style: 'display: grid; gap: 4px;' },
              h('p', { class: 'small', style: 'margin: 0;' },
                '• Si evaluamos en ',
                h('strong', { class: 'eq', style: 'color: var(--green);' }, `x = ${fmt(state.h)}`),
                `: la distancia interna es `,
                h('strong', { class: 'eq', style: 'color: var(--green);' },
                  `|${fmt(state.h)} ${state.h > 0 ? `− ${fmt(state.h)}` : `+ ${fmt(Math.abs(state.h))}`}| = |${fmt(distAtVertex)}| = 0`
                ),
                ` ⟹ ¡Vértice alcanzado! Altura f(${fmt(state.h)}) = 0 + (${fmt(state.k)}) = ${fmt(state.k)}.`
              ),
              h('p', { class: 'small muted', style: 'margin: 0;' },
                '• Si cayeras en la trampa de signo y probaras ',
                h('strong', { class: 'eq', style: 'color: var(--pink);' }, `x = ${fmt(wrongX)}`),
                `: adentro daría `,
                h('strong', { class: 'eq', style: 'color: var(--pink);' },
                  `|${fmt(wrongX)} ${state.h > 0 ? `− ${fmt(state.h)}` : `+ ${fmt(Math.abs(state.h))}`}| = ${fmt(distAtWrong)} ≠ 0`
                ),
                ' (estás a ',
                `${fmt(distAtWrong)} pasos del vértice, no en la punta).`
              )
            )
      )
    );
  }

  mount(
    container,
    h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Traslación horizontal h = ',
        valH,
        sliderH
      ),
      h('label', { class: 'field__label' },
        'Traslación vertical k = ',
        valK,
        sliderK
      ),
      btnReset
    ),
    boardSlot,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    formulaSlot,
    trapCard
  );

  syncUI(false);
}
