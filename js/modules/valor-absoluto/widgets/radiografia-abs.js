/**
 * radiografia-abs.js — Widget 7 (Sección 7 - Nivel Exactas):
 * «Escáner de Radiografía Funcional y Láser Horizontal y = c».
 * Incluye 4 Lentes Visuales dibujadas directamente sobre el plano cartesiano SVG:
 *   1. Lente Imagen Im(f) (proyección y corchete sobre el Eje Y)
 *   2. Lente Monotonía I↑ / I↓ (flechas en ramas + intervalos sobre el Eje X cortando en h)
 *   3. Lente Ceros C₀, Positividad C⁺ y Negatividad C⁻ (intervalos pintados sobre el Eje X)
 *   4. Lente Láser Horizontal y = c (arrastrable en el SVG + resolución algebraica)
 * Además incluye el demostrador interactivo √(x²) = |x|.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard } from '../components.js';
import {
  approxEq,
  formatCanonicalAbs,
  analyzeAbs,
  solveAbsComparison,
} from '../logic.js';

export function initRadiografiaAbsWidget(container) {
  let state = {
    a: 1,
    h: 1,
    k: -2,
    laserY: 2,
    op: '=', // '=' | '<' | '>'
    lens: 'all', // 'all' | 'range' | 'monotonicity' | 'signs' | 'laser'
    sqrtSampleX: -4,
  };

  const LENSES = [
    { id: 'all', label: 'Vista General + Láser y = c' },
    { id: 'range', label: 'Lente 1: Imagen Im(f) en Eje Y' },
    { id: 'monotonicity', label: 'Lente 2: Monotonía I↑ / I↓ en Eje X' },
    { id: 'signs', label: 'Lente 3: C₀, C⁺ y C⁻ en Eje X' },
    { id: 'laser', label: 'Lente 4: Inecuaciones f(x) ⋚ c' },
  ];

  const lensBtnsRow = h('div', { class: 'seq-controls' });
  const boardSlot = h('div', { class: 'seq-plot-card' });
  const tableSlot = h('div', { style: 'margin-top: 10px;' });
  const laserCard = h('div', { class: 'seq-check__card', style: 'margin-top: 8px;' });
  const sqrtCard = h('div', { class: 'seq-check__card', style: 'margin-top: 10px; border-style: dashed;' });

  const valA = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.a));
  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' }, fmt(state.h));
  const valK = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, fmt(state.k));
  const valC = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.laserY));
  const valSqrtX = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.sqrtSampleX));

  const sliderA = h('input', {
    type: 'range',
    min: -2,
    max: 2,
    step: 0.5,
    value: state.a,
    'aria-label': 'Pendiente y apertura a',
  });
  const sliderH = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 1,
    value: state.h,
    'aria-label': 'Coordenada horizontal h del vértice',
  });
  const sliderK = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 1,
    value: state.k,
    'aria-label': 'Coordenada vertical k del vértice',
  });
  const sliderC = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.laserY,
    'aria-label': 'Altura c del láser horizontal',
  });
  const sliderSqrtX = h('input', {
    type: 'range',
    min: -6,
    max: 6,
    step: 1,
    value: state.sqrtSampleX,
    'aria-label': 'Valor de prueba x para raíz cuadrada de x al cuadrado',
  });

  const board = createAbsBoard(boardSlot, {
    a: state.a,
    h: state.h,
    k: state.k,
    xMin: -7,
    xMax: 7,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    draggableVertex: true,
    draggableSlope: true,
    showSymmetryAxis: true,
    showSlopeTriangle: false,
    showHorizontalLaser: true,
    laserY: state.laserY,
    customUnderRender(plane, props) {
      const { a, h: hVal, k: kVal } = props;
      const xZero = plane.sx(0);
      const yZero = plane.sy(0);
      const vx = plane.sx(hVal);
      const vy = plane.sy(kVal);

      // LENTE 1: IMAGEN / RANGO SOBRE EL EJE Y
      if (state.lens === 'range' || state.lens === 'all') {
        const yEnd = a > 0 ? plane.sy(6) : plane.sy(-6);
        const bandTop = Math.min(vy, yEnd);
        const bandHeight = Math.abs(vy - yEnd);

        plane.layers.under.append(
          // Proyección punteada desde el vértice hasta el eje Y
          s('line', {
            x1: vx,
            y1: vy,
            x2: xZero,
            y2: vy,
            stroke: 'var(--yellow)',
            'stroke-width': '1.8',
            'stroke-dasharray': '4 3',
          }),
          // Banda luminosa sobre el Eje Y desde k hasta +/- infinito
          s('rect', {
            x: xZero - 6,
            y: bandTop,
            width: 12,
            height: Math.max(2, bandHeight),
            fill: 'rgba(242, 214, 128, 0.34)',
            rx: 4,
          }),
          // Corchete en y = k sobre el Eje Y
          s('line', {
            x1: xZero - 9,
            y1: vy,
            x2: xZero + 9,
            y2: vy,
            stroke: 'var(--yellow)',
            'stroke-width': '3',
          }),
          s('text', {
            x: xZero + 14,
            y: (vy + yEnd) / 2,
            fill: 'var(--yellow)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 15px)',
            'font-weight': 'bold',
          }, a > 0 ? `Im(f) = [${fmt(kVal)}; +∞)` : `Im(f) = (−∞; ${fmt(kVal)}]`)
        );
      }

      // LENTE 2: MONOTONÍA (CRECIMIENTO / DECRECIMIENTO SOBRE EL EJE X CORTANDO EN x = h)
      if (state.lens === 'monotonicity') {
        const xLeft = plane.sx(-7);
        const xRight = plane.sx(7);
        const leftRising = a < 0; // Si a < 0, sube a la izquierda y baja a la derecha
        const leftColor = leftRising ? 'var(--green)' : 'var(--blue)';
        const rightColor = leftRising ? 'var(--blue)' : 'var(--green)';

        plane.layers.under.append(
          // Línea vertical desde el vértice al eje X en x = h
          s('line', {
            x1: vx,
            y1: vy,
            x2: vx,
            y2: yZero,
            stroke: 'var(--teal)',
            'stroke-width': '2.2',
            'stroke-dasharray': '4 3',
          }),
          // Semieje izquierdo (-inf, h) sobre el Eje X
          s('rect', {
            x: xLeft,
            y: yZero - 5,
            width: Math.max(0, vx - xLeft),
            height: 10,
            fill: leftRising ? 'rgba(166, 227, 161, 0.32)' : 'rgba(137, 180, 250, 0.32)',
          }),
          // Semieje derecho (h, +inf) sobre el Eje X
          s('rect', {
            x: vx,
            y: yZero - 5,
            width: Math.max(0, xRight - vx),
            height: 10,
            fill: leftRising ? 'rgba(137, 180, 250, 0.32)' : 'rgba(166, 227, 161, 0.32)',
          }),
          s('circle', {
            cx: vx,
            cy: yZero,
            r: 6,
            fill: 'var(--bg)',
            stroke: 'var(--teal)',
            'stroke-width': '2.4',
          }),
          s('text', {
            x: (xLeft + vx) / 2,
            y: yZero + 22,
            'text-anchor': 'middle',
            fill: leftColor,
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 15px)',
            'font-weight': 'bold',
          }, leftRising ? `I↑ = (−∞; ${fmt(hVal)})` : `I↓ = (−∞; ${fmt(hVal)})`),
          s('text', {
            x: (vx + xRight) / 2,
            y: yZero + 22,
            'text-anchor': 'middle',
            fill: rightColor,
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 15px)',
            'font-weight': 'bold',
          }, leftRising ? `I↓ = (${fmt(hVal)}; +∞)` : `I↑ = (${fmt(hVal)}; +∞)`),
          s('text', {
            x: vx,
            y: yZero - 12,
            'text-anchor': 'middle',
            fill: 'var(--teal)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, `Corte en Eje X: h = ${fmt(hVal)} (¡no uses k!)`)
        );
      }

      // LENTE 3: CEROS C₀, POSITIVIDAD C⁺ Y NEGATIVIDAD C⁻ SOBRE EL EJE X
      if (state.lens === 'signs' || state.lens === 'all') {
        const info = analyzeAbs(a, hVal, kVal);
        const xLeft = plane.sx(-7);
        const xRight = plane.sx(7);

        if (info.roots.length === 2) {
          const r1x = plane.sx(info.roots[0]);
          const r2x = plane.sx(info.roots[1]);
          const insideColor = a > 0 ? 'rgba(242, 143, 173, 0.35)' : 'rgba(166, 227, 161, 0.35)';
          const outsideColor = a > 0 ? 'rgba(166, 227, 161, 0.35)' : 'rgba(242, 143, 173, 0.35)';

          plane.layers.under.append(
            s('rect', { x: xLeft, y: yZero - 4, width: Math.max(0, r1x - xLeft), height: 8, fill: outsideColor }),
            s('rect', { x: r1x, y: yZero - 4, width: Math.max(0, r2x - r1x), height: 8, fill: insideColor }),
            s('rect', { x: r2x, y: yZero - 4, width: Math.max(0, xRight - r2x), height: 8, fill: outsideColor })
          );

          info.roots.forEach((rVal, idx) => {
            const rx = plane.sx(rVal);
            plane.layers.under.append(
              s('circle', {
                cx: rx,
                cy: yZero,
                r: 6,
                fill: 'var(--green)',
                stroke: 'var(--bg)',
                'stroke-width': '2',
              }),
              s('text', {
                x: rx,
                y: yZero - 12,
                'text-anchor': 'middle',
                fill: 'var(--green)',
                'font-family': 'var(--font-hand)',
                'font-size': 'var(--svg-scale-caveat, 14px)',
                'font-weight': 'bold',
              }, `x${idx + 1} = ${fmt(rVal)}`)
            );
          });
        } else {
          const allColor = (a > 0 && kVal >= 0) || (a < 0 && kVal > 0)
            ? 'rgba(166, 227, 161, 0.28)'
            : 'rgba(242, 143, 173, 0.28)';
          plane.layers.under.append(
            s('rect', { x: xLeft, y: yZero - 4, width: xRight - xLeft, height: 8, fill: allColor })
          );
        }
      }
    },
    onChange(next) {
      state.a = next.a;
      state.h = next.h;
      state.k = next.k;
      if (typeof next.laserY === 'number') {
        state.laserY = next.laserY;
      }
      sliderA.value = String(state.a);
      sliderH.value = String(state.h);
      sliderK.value = String(state.k);
      sliderC.value = String(state.laserY);
      syncUI(false);
    },
  });

  sliderA.addEventListener('input', (e) => {
    let v = parseFloat(e.target.value);
    if (approxEq(v, 0)) v = state.a >= 0 ? -0.5 : 0.5;
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
  sliderC.addEventListener('input', (e) => {
    state.laserY = parseFloat(e.target.value);
    syncUI(true);
  });
  sliderSqrtX.addEventListener('input', (e) => {
    state.sqrtSampleX = parseFloat(e.target.value);
    syncUI(false);
  });

  function syncUI(updateBoard = true) {
    valA.textContent = fmt(state.a);
    valH.textContent = fmt(state.h);
    valK.textContent = fmt(state.k);
    valC.textContent = fmt(state.laserY);
    valSqrtX.textContent = fmt(state.sqrtSampleX);

    mount(
      lensBtnsRow,
      ...LENSES.map((l) =>
        h('button', {
          type: 'button',
          class: ['chip', state.lens === l.id ? 'is-active' : ''],
          on: {
            click: () => {
              state.lens = l.id;
              syncUI(true);
            },
          },
        }, l.label)
      )
    );

    if (updateBoard) {
      board.update({
        a: state.a,
        h: state.h,
        k: state.k,
        laserY: state.laserY,
        showHorizontalLaser: state.lens === 'all' || state.lens === 'laser',
      });
    }

    const info = analyzeAbs(state.a, state.h, state.k);
    const canonStr = formatCanonicalAbs(state.a, state.h, state.k);
    const compSol = solveAbsComparison(state.a, state.h, state.k, state.op, state.laserY);

    mount(
      tableSlot,
      h('table', { class: 'seq-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Elemento del Estudio Completo'),
            h('th', null, `Resultado para f(x) = ${canonStr}`),
            h('th', null, 'Regla Geométrica (¡En qué eje leer!)')
          )
        ),
        h('tbody', null,
          h('tr', null,
            h('td', null, h('strong', null, 'Dominio Dom(f)')),
            h('td', { class: 'eq' }, info.domain),
            h('td', { class: 'small muted' }, 'Eje X: existe para todo número real')
          ),
          h('tr', { style: state.lens === 'range' ? 'background: rgba(242, 214, 128, 0.12);' : '' },
            h('td', null, h('strong', { style: 'color: var(--yellow);' }, 'Conjunto Imagen Im(f)')),
            h('td', { class: 'eq', style: 'color: var(--yellow); font-weight: bold;' }, info.range.text),
            h('td', { class: 'small muted' }, `Eje Y: depende de k = ${fmt(state.k)} y del signo de a = ${fmt(state.a)}`)
          ),
          h('tr', { style: state.lens === 'monotonicity' ? 'background: rgba(166, 227, 161, 0.10);' : '' },
            h('td', null, h('strong', { style: 'color: var(--green);' }, 'Crecimiento I↑')),
            h('td', { class: 'eq' }, info.increasing),
            h('td', { class: 'small muted' }, `Eje X: corta en la abscisa del vértice h = ${fmt(state.h)} (¡nunca k!)`)
          ),
          h('tr', { style: state.lens === 'monotonicity' ? 'background: rgba(137, 180, 250, 0.10);' : '' },
            h('td', null, h('strong', { style: 'color: var(--blue);' }, 'Decrecimiento I↓')),
            h('td', { class: 'eq' }, info.decreasing),
            h('td', { class: 'small muted' }, `Eje X: rama donde la altura baja al avanzar hacia la derecha`)
          ),
          h('tr', { style: state.lens === 'signs' ? 'background: rgba(166, 227, 161, 0.10);' : '' },
            h('td', null, h('strong', null, 'Ceros o Raíces C₀')),
            h('td', { class: 'eq' }, info.rootsText),
            h('td', { class: 'small muted' }, 'Cortes con el eje X (f(x) = 0)')
          ),
          h('tr', { style: state.lens === 'signs' ? 'background: rgba(166, 227, 161, 0.10);' : '' },
            h('td', null, h('strong', { style: 'color: var(--green);' }, 'Positividad C⁺')),
            h('td', { class: 'eq' }, info.positivity),
            h('td', { class: 'small muted' }, 'Valores de x donde la gráfica está ARRIBA del eje X (f(x) > 0)')
          ),
          h('tr', { style: state.lens === 'signs' ? 'background: rgba(242, 143, 173, 0.10);' : '' },
            h('td', null, h('strong', { style: 'color: var(--pink);' }, 'Negatividad C⁻')),
            h('td', { class: 'eq' }, info.negativity),
            h('td', { class: 'small muted' }, 'Valores de x donde la gráfica está DEBAJO del eje X (f(x) < 0)')
          )
        )
      )
    );

    mount(
      laserCard,
      h('div', { class: 'seq-controls', style: 'justify-content: space-between;' },
        h('strong', { class: 'eq', style: 'color: var(--pink); font-size: 1.05rem;' },
          `Resolución con Láser Horizontal: ${canonStr} ${state.op} ${fmt(state.laserY)}`
        ),
        h('div', { class: 'seq-controls' },
          ['=', '<', '>'].map((opSym) =>
            h('button', {
              type: 'button',
              class: ['chip', state.op === opSym ? 'is-active' : ''],
              on: {
                click: () => {
                  state.op = opSym;
                  syncUI(false);
                },
              },
            }, `f(x) ${opSym} c`)
          )
        )
      ),
      h('p', { class: 'eq', style: 'margin: 6px 0; font-size: 1.15rem; color: var(--yellow);' },
        `Conjunto Solución: S = ${compSol.solutionText}`
      ),
      h('div', { class: 'small muted' },
        ...compSol.steps.map((st, idx) => h('p', { style: 'margin: 2px 0;' }, `Paso ${idx + 1}: ${st}`))
      )
    );

    const sx = state.sqrtSampleX;
    const sq = sx * sx;
    const rootVal = Math.sqrt(sq);
    mount(
      sqrtCard,
      h('div', { style: 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;' },
        h('strong', { style: 'color: var(--teal); font-family: var(--font-hand); font-size: 1.25rem;' },
          'Demostrador Universitario: ¿Por qué √(x²) = |x| y NUNCA simplemente x?'
        ),
        h('label', { class: 'field__label' },
          'Probá con x = ',
          valSqrtX,
          sliderSqrtX
        )
      ),
      h('p', { class: 'eq', style: 'margin: 6px 0 0; font-size: 1.08rem;' },
        `Si x = ${fmt(sx)}  ⟹  x² = (${fmt(sx)})² = ${fmt(sq)}  ⟹  √(${fmt(sq)}) = `,
        h('strong', { style: 'color: var(--green);' }, fmt(rootVal)),
        sx < 0
          ? ` ≠ ${fmt(sx)} (¡Si hubieras tachado raíz con cuadrado daría ${fmt(sx)}, que es falso! Da |${fmt(sx)}| = ${fmt(rootVal)}).`
          : ` = |${fmt(sx)}| = ${fmt(rootVal)}.`
      )
    );
  }

  mount(
    container,
    lensBtnsRow,
    h('div', { class: 'abs-radio-controls' },
      h('div', { class: 'abs-radio-control-item' },
        h('div', { class: 'abs-radio-control-head' },
          h('span', { class: 'abs-radio-control-label' }, 'Apertura a'),
          valA
        ),
        sliderA
      ),
      h('div', { class: 'abs-radio-control-item' },
        h('div', { class: 'abs-radio-control-head' },
          h('span', { class: 'abs-radio-control-label' }, 'Vértice h (X)'),
          valH
        ),
        sliderH
      ),
      h('div', { class: 'abs-radio-control-item' },
        h('div', { class: 'abs-radio-control-head' },
          h('span', { class: 'abs-radio-control-label' }, 'Vértice k (Y)'),
          valK
        ),
        sliderK
      ),
      h('div', { class: 'abs-radio-control-item' },
        h('div', { class: 'abs-radio-control-head' },
          h('span', { class: 'abs-radio-control-label' }, 'Láser horizontal y = c'),
          valC
        ),
        sliderC
      )
    ),
    boardSlot,
    tableSlot,
    laserCard,
    sqrtCard
  );

  syncUI(false);
}
