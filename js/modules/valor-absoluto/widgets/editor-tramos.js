/**
 * editor-tramos.js — Widget 9 (Sección 9):
 * «Constructor de Tramos, Fronteras Abierta/Cerrada y Prueba de la Recta Vertical».
 * Permite alternar extremos haciendo clic en los botones o directamente sobre los círculos
 * de frontera en el SVG en x = 1, proyecta sombras de Dominio (Eje X) y Rango (Eje Y)
 * con corchetes/paréntesis, y dispara el Láser Vertical de Colisión si hay doble punto cerrado.
 */

import { h, s, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';
import { piecewiseBrace, dotBadge } from '../components.js';
import { approxEq } from '../logic.js';
import { DIAGNOSE_REACTIONS } from '../vn-scripts.js';
import { react } from '../../../core/vn.js';
import { playError, playSuccess } from '../../../core/sound.js';

export function initEditorTramosWidget(container) {
  let state = {
    // Tramo 1 en [-4, 1]: y = m1 * x + b1
    m1: 1,
    b1: 1,
    leftClosedAtBoundary: false, // en x = 1: false => '<', true => '≤'
    // Tramo 2 en [1, 5]: y = m2 * x + b2
    m2: -1,
    b2: 5,
    rightClosedAtBoundary: true, // en x = 1: false => '>', true => '≥'
    showShadows: true,
  };

  const BOUNDARY_X = 1;
  const X_START = -4;
  const X_END = 5;

  const topControlsRow = h('div', { class: 'seq-controls' });
  const slidersRow = h('div', { class: 'seq-controls' });
  const plotCard = h('div', { class: 'seq-plot-card' });
  const braceSlot = h('div', { style: 'margin-top: 8px;' });
  const statusCard = h('div', { class: 'va-readout', style: 'margin-top: 10px;' });

  const valB1 = h('strong', { class: 'eq', style: 'color: var(--blue);' }, fmt(state.b1));
  const valM2 = h('strong', { class: 'eq', style: 'color: var(--green);' }, fmt(state.m2));
  const valB2 = h('strong', { class: 'eq', style: 'color: var(--green);' }, fmt(state.b2));

  const sliderB1 = h('input', {
    type: 'range',
    min: -2,
    max: 4,
    step: 1,
    value: state.b1,
    'aria-label': 'Ordenada b1 del tramo izquierdo',
  });
  const sliderM2 = h('input', {
    type: 'range',
    min: -2,
    max: 2,
    step: 1,
    value: state.m2,
    'aria-label': 'Pendiente m2 del tramo derecho',
  });
  const sliderB2 = h('input', {
    type: 'range',
    min: -1,
    max: 6,
    step: 1,
    value: state.b2,
    'aria-label': 'Ordenada b2 del tramo derecho',
  });

  const svg = s('svg', {
    class: 'seq-svg abs-board__svg',
    style: 'width: 100%; height: auto; max-height: 360px; display: block;',
    role: 'img',
    'aria-label': 'Editor de tramos con fronteras abiertas o cerradas y sombras de dominio e imagen',
  });
  plotCard.append(svg);

  let activePlane = null;

  function triggerCollisionIfNeeded() {
    const yL = state.m1 * BOUNDARY_X + state.b1;
    const yR = state.m2 * BOUNDARY_X + state.b2;
    const isCollision =
      state.leftClosedAtBoundary &&
      state.rightClosedAtBoundary &&
      !approxEq(yL, yR);

    if (isCollision) {
      playError(2);
      if (DIAGNOSE_REACTIONS.both_endpoints_closed_violation) {
        react(DIAGNOSE_REACTIONS.both_endpoints_closed_violation);
      }
    } else {
      playSuccess('normal');
    }
  }

  sliderB1.addEventListener('input', (e) => {
    state.b1 = parseFloat(e.target.value);
    syncUI();
  });
  sliderM2.addEventListener('input', (e) => {
    state.m2 = parseFloat(e.target.value);
    syncUI();
  });
  sliderB2.addEventListener('input', (e) => {
    state.b2 = parseFloat(e.target.value);
    syncUI();
  });

  function renderPlane() {
    const yLeftBoundary = state.m1 * BOUNDARY_X + state.b1;
    const yRightBoundary = state.m2 * BOUNDARY_X + state.b2;
    const yStartLeft = state.m1 * X_START + state.b1;
    const yEndRight = state.m2 * X_END + state.b2;

    const isCollision =
      state.leftClosedAtBoundary &&
      state.rightClosedAtBoundary &&
      !approxEq(yLeftBoundary, yRightBoundary);

    if (!activePlane) {
      activePlane = createPlane(svg, {
        xMin: -5,
        xMax: 6,
        yMin: -4,
        yMax: 6,
        width: 560,
        height: 340,
        xLabel: 'x',
        yLabel: 'y',
      });
    } else {
      activePlane.clear('under', 'curves', 'marks', 'labels');
    }

    const plane = activePlane;
    const bx = plane.sx(BOUNDARY_X);
    const yZero = plane.sy(0);
    const xZero = plane.sx(0);

    // Sombras de Dominio (sobre eje X) y Rango (sobre eje Y) con corchetes
    if (state.showShadows) {
      const domLeftPx = plane.sx(X_START);
      const domRightPx = plane.sx(X_END);
      plane.layers.under.append(
        s('rect', {
          x: domLeftPx,
          y: yZero - 5,
          width: domRightPx - domLeftPx,
          height: 10,
          fill: 'rgba(148, 226, 213, 0.30)',
          rx: 3,
        }),
        // Corchetes de dominio en X_START y X_END
        s('line', { x1: domLeftPx, y1: yZero - 8, x2: domLeftPx, y2: yZero + 8, stroke: 'var(--teal)', 'stroke-width': '2.6' }),
        s('line', { x1: domRightPx, y1: yZero - 8, x2: domRightPx, y2: yZero + 8, stroke: 'var(--teal)', 'stroke-width': '2.6' }),
        s('text', {
          x: (domLeftPx + domRightPx) / 2,
          y: yZero + 22,
          'text-anchor': 'middle',
          fill: 'var(--teal)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, !state.leftClosedAtBoundary && !state.rightClosedAtBoundary
          ? 'Dom(f) = [−4; 1) ∪ (1; 5]'
          : 'Dom(f) = [−4; 5]')
      );

      // Sombra de Rango en el eje Y para cada tramo
      const y1Min = Math.min(yStartLeft, yLeftBoundary);
      const y1Max = Math.max(yStartLeft, yLeftBoundary);
      const y2Min = Math.min(yRightBoundary, yEndRight);
      const y2Max = Math.max(yRightBoundary, yEndRight);

      plane.layers.under.append(
        s('rect', {
          x: xZero - 6,
          y: plane.sy(y1Max),
          width: 6,
          height: Math.max(3, plane.sy(y1Min) - plane.sy(y1Max)),
          fill: 'rgba(137, 180, 250, 0.38)',
          rx: 2,
        }),
        s('rect', {
          x: xZero,
          y: plane.sy(y2Max),
          width: 6,
          height: Math.max(3, plane.sy(y2Min) - plane.sy(y2Max)),
          fill: 'rgba(166, 227, 161, 0.38)',
          rx: 2,
        }),
        s('text', {
          x: xZero - 10,
          y: plane.sy(Math.max(y1Max, y2Max)) - 6,
          'text-anchor': 'end',
          fill: 'var(--yellow)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
          'font-weight': 'bold',
        }, 'Sombra Im(f) en Eje Y')
      );
    }

    // Recta vertical en la frontera x = 1 (Láser de colisión rosa si ambos están cerrados a distinta altura)
    plane.layers.under.append(
      s('line', {
        x1: bx,
        y1: plane.sy(6),
        x2: bx,
        y2: plane.sy(-4),
        stroke: isCollision ? 'var(--pink)' : 'var(--chalk-dim)',
        'stroke-width': isCollision ? '3.4' : '1.6',
        'stroke-dasharray': isCollision ? 'none' : '5 4',
      }),
      s('text', {
        x: bx + 8,
        y: plane.sy(5.3),
        fill: isCollision ? 'var(--pink)' : 'var(--muted)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 15px)',
        'font-weight': 'bold',
      }, isCollision ? '¡COLISIÓN VERTICAL EN x = 1! (2 salidas)' : 'Recta vertical x = 1')
    );

    // Segmento Tramo 1: [-4, 1]
    plane.layers.curves.append(
      s('line', {
        x1: plane.sx(X_START),
        y1: plane.sy(yStartLeft),
        x2: bx,
        y2: plane.sy(yLeftBoundary),
        stroke: 'var(--blue)',
        'stroke-width': '3.4',
      }),
      // Segmento Tramo 2: [1, 5]
      s('line', {
        x1: bx,
        y1: plane.sy(yRightBoundary),
        x2: plane.sx(X_END),
        y2: plane.sy(yEndRight),
        stroke: 'var(--green)',
        'stroke-width': '3.4',
      })
    );

    // Extremos exteriores cerrados en x = -4 y x = 5
    plane.layers.marks.append(
      s('circle', {
        cx: plane.sx(X_START),
        cy: plane.sy(yStartLeft),
        r: 6,
        fill: 'var(--blue)',
        stroke: 'var(--bg)',
        'stroke-width': '2',
      }),
      s('circle', {
        cx: plane.sx(X_END),
        cy: plane.sy(yEndRight),
        r: 6,
        fill: 'var(--green)',
        stroke: 'var(--bg)',
        'stroke-width': '2',
      })
    );

    // Extremos interactivos en la frontera x = 1 (clicables directamente en el SVG)
    const leftEndpointGroup = s('g', {
      style: 'cursor: pointer;',
      role: 'button',
      tabindex: '0',
      'aria-label': 'Alternar extremo del tramo izquierdo en x = 1 entre abierto y cerrado',
    },
      s('circle', { cx: bx, cy: plane.sy(yLeftBoundary), r: 15, fill: 'transparent' }),
      s('circle', {
        cx: bx,
        cy: plane.sy(yLeftBoundary),
        r: 8,
        fill: state.leftClosedAtBoundary ? 'var(--blue)' : 'var(--bg)',
        stroke: isCollision ? 'var(--pink)' : 'var(--blue)',
        'stroke-width': '3',
      }),
      s('text', {
        x: bx - 12,
        y: plane.sy(yLeftBoundary) - 10,
        'text-anchor': 'end',
        fill: 'var(--blue)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
        'font-weight': 'bold',
      }, `(1; ${fmt(yLeftBoundary)}) ${state.leftClosedAtBoundary ? '[Cerrado]' : '(Abierto)'}`)
    );

    leftEndpointGroup.addEventListener('click', () => {
      state.leftClosedAtBoundary = !state.leftClosedAtBoundary;
      triggerCollisionIfNeeded();
      syncUI();
    });

    const rightEndpointGroup = s('g', {
      style: 'cursor: pointer;',
      role: 'button',
      tabindex: '0',
      'aria-label': 'Alternar extremo del tramo derecho en x = 1 entre abierto y cerrado',
    },
      s('circle', { cx: bx, cy: plane.sy(yRightBoundary), r: 15, fill: 'transparent' }),
      s('circle', {
        cx: bx,
        cy: plane.sy(yRightBoundary),
        r: 8,
        fill: state.rightClosedAtBoundary ? 'var(--green)' : 'var(--bg)',
        stroke: isCollision ? 'var(--pink)' : 'var(--green)',
        'stroke-width': '3',
      }),
      s('text', {
        x: bx + 12,
        y: plane.sy(yRightBoundary) + 18,
        'text-anchor': 'start',
        fill: 'var(--green)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
        'font-weight': 'bold',
      }, `(1; ${fmt(yRightBoundary)}) ${state.rightClosedAtBoundary ? '[Cerrado]' : '(Abierto)'}`)
    );

    rightEndpointGroup.addEventListener('click', () => {
      state.rightClosedAtBoundary = !state.rightClosedAtBoundary;
      triggerCollisionIfNeeded();
      syncUI();
    });

    plane.layers.marks.append(leftEndpointGroup, rightEndpointGroup);
  }

  function syncUI() {
    valB1.textContent = fmt(state.b1);
    valM2.textContent = fmt(state.m2);
    valB2.textContent = fmt(state.b2);

    const yLeftBoundary = state.m1 * BOUNDARY_X + state.b1;
    const yRightBoundary = state.m2 * BOUNDARY_X + state.b2;
    const isContinuous = approxEq(yLeftBoundary, yRightBoundary);
    const isCollision =
      state.leftClosedAtBoundary &&
      state.rightClosedAtBoundary &&
      !isContinuous;
    const isHoleAtBoundary =
      !state.leftClosedAtBoundary && !state.rightClosedAtBoundary;

    mount(
      topControlsRow,
      h('button', {
        type: 'button',
        class: ['chip', state.leftClosedAtBoundary ? 'is-active' : ''],
        style: 'display: inline-flex; align-items: center; gap: 6px;',
        on: {
          click: () => {
            state.leftClosedAtBoundary = !state.leftClosedAtBoundary;
            triggerCollisionIfNeeded();
            syncUI();
          },
        },
      },
        'Borde Tramo 1 en x = 1:',
        dotBadge(state.leftClosedAtBoundary),
        state.leftClosedAtBoundary ? '(x ≤ 1)' : '(x < 1)'
      ),
      h('button', {
        type: 'button',
        class: ['chip', state.rightClosedAtBoundary ? 'is-active' : ''],
        style: 'display: inline-flex; align-items: center; gap: 6px;',
        on: {
          click: () => {
            state.rightClosedAtBoundary = !state.rightClosedAtBoundary;
            triggerCollisionIfNeeded();
            syncUI();
          },
        },
      },
        'Borde Tramo 2 en x = 1:',
        dotBadge(state.rightClosedAtBoundary),
        state.rightClosedAtBoundary ? '(x ≥ 1)' : '(x > 1)'
      ),
      h('button', {
        type: 'button',
        class: ['chip', state.showShadows ? 'is-active' : ''],
        on: {
          click: () => {
            state.showShadows = !state.showShadows;
            syncUI();
          },
        },
      }, state.showShadows ? 'Sombras Dom/Rango: VISIBLES' : 'Sombras Dom/Rango: OCULTAS')
    );

    renderPlane();

    const leftExpr = `x ${state.b1 >= 0 ? `+ ${fmt(state.b1)}` : `− ${fmt(Math.abs(state.b1))}`}`;
    const rightExpr = `${state.m2 === 0 ? '' : state.m2 === 1 ? 'x ' : state.m2 === -1 ? '−x ' : `${fmt(state.m2)}x `}${state.b2 >= 0 ? `+ ${fmt(state.b2)}` : `− ${fmt(Math.abs(state.b2))}`}`;

    piecewiseBrace(
      braceSlot,
      [
        {
          exprText: leftExpr,
          condition: `−4 ≤ x ${state.leftClosedAtBoundary ? '≤' : '<'} 1`,
        },
        {
          exprText: rightExpr,
          condition: `1 ${state.rightClosedAtBoundary ? '≤' : '<'} x ≤ 5`,
        },
      ],
      null,
      { fnName: isCollision ? 'Relación (NO función)' : 'f(x)' }
    );

    mount(
      statusCard,
      isCollision
        ? h('div', { class: 'notice notice--err' },
            chalkIcon('cross'),
            h('div', null,
              h('strong', null, '¡VIOLACIÓN DE LA RECTA VERTICAL EN x = 1! No es una función.'),
              h('p', { class: 'small', style: 'margin: 4px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
                `Ambos tramos tienen punto cerrado`,
                dotBadge(true),
                `en x = 1 y asignan dos alturas distintas: y = ${fmt(yLeftBoundary)} e y = ${fmt(yRightBoundary)}. Una función exige una única salida por cada entrada.`
              )
            )
          )
        : isContinuous && (state.leftClosedAtBoundary || state.rightClosedAtBoundary)
          ? h('div', { class: 'notice notice--ok' },
              chalkIcon('check'),
              h('div', null,
                h('strong', null, '¡Pegado continuo perfecto en x = 1! Es función sin salto.'),
                h('p', { class: 'small', style: 'margin: 4px 0 0;' },
                  `Ambas ramas llegan a la misma altura y = ${fmt(yLeftBoundary)} en la frontera x = 1. Dominio: [−4; 5].`
                )
              )
            )
          : isHoleAtBoundary
            ? h('div', { class: 'notice notice--ok' },
                chalkIcon('check'),
                h('div', null,
                  h('strong', null, 'Es una función válida, pero con un hueco de dominio en x = 1.'),
                  h('p', { class: 'small', style: 'margin: 4px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
                    'Como ambos extremos son abiertos',
                    dotBadge(false),
                    ', la recta vertical x = 1 corta 0 veces (≤ 1). Dom(f) = [−4; 1) ∪ (1; 5].'
                  )
                )
              )
            : h('div', { class: 'notice notice--ok' },
                chalkIcon('check'),
                h('div', null,
                  h('strong', null, `Es una función válida con salto en x = 1. Valor oficial: f(1) = ${fmt(state.leftClosedAtBoundary ? yLeftBoundary : yRightBoundary)}.`),
                  h('p', { class: 'small', style: 'margin: 4px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
                    'Un solo tramo tiene punto cerrado',
                    dotBadge(true),
                    'en x = 1 y el otro tiene círculo abierto',
                    dotBadge(false),
                    '. Consejo: ajustá b₁ o b₂ para lograr un pegado continuo sin salto.'
                  )
                )
              )
    );
  }

  mount(
    slidersRow,
    h('label', { class: 'field__label' },
      'Ordenada Tramo 1 (b₁ = ',
      valB1,
      ')',
      sliderB1
    ),
    h('label', { class: 'field__label' },
      'Pendiente Tramo 2 (m₂ = ',
      valM2,
      ')',
      sliderM2
    ),
    h('label', { class: 'field__label' },
      'Ordenada Tramo 2 (b₂ = ',
      valB2,
      ')',
      sliderB2
    )
  );

  mount(
    container,
    topControlsRow,
    slidersRow,
    plotCard,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    braceSlot,
    statusCard
  );

  syncUI();
}
