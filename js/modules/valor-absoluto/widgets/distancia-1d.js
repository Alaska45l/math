/**
 * distancia-1d.js — Widget 1 (Sección 1):
 * «Cinta Métrica en la Recta Numérica |x - h|» + «Máquina Inversora del Signo Menos».
 * Soporta arrastre continuo en los sliders y arrastre directo sobre el SVG 1D sin perder foco.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { bindSvgDrag, snapTo } from '../../../core/plot.js';

export function initDistancia1DWidget(container) {
  let state = {
    x: -3,
    h: 2,
    symmetricMode: false,
    targetD: 4,
    activeDragTarget: 'x', // 'x' | 'h'
  };

  const X_MIN = -10;
  const X_MAX = 10;
  const WIDTH = 620;
  const HEIGHT = 185;
  const PAD_X = 42;
  const AXIS_Y = 112;

  const sx = (val) => PAD_X + ((val - X_MIN) / (X_MAX - X_MIN)) * (WIDTH - 2 * PAD_X);
  const ix = (px) => X_MIN + ((px - PAD_X) / (WIDTH - 2 * PAD_X)) * (X_MAX - X_MIN);

  const svg = s('svg', {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: 'seq-svg abs-board__svg',
    style: 'width: 100%; height: auto; max-height: 215px; display: block; margin: 10px 0; touch-action: none; cursor: grab;',
    role: 'img',
    'aria-label': 'Recta numérica interactiva con distancia entre x y el centro h',
  });

  // Persistent controls
  const btnModeExplore = h('button', {
    type: 'button',
    class: 'chip is-active',
    on: {
      click: () => {
        state.symmetricMode = false;
        syncUI();
      },
    },
  }, 'Modo 1: Explorar distancia |x − h|');

  const btnModeSym = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.symmetricMode = true;
        syncUI();
      },
    },
  }, 'Modo 2: Ecuación simétrica |x − h| = d');

  const valX = h('strong', { class: 'eq', style: 'color: var(--pink);' });
  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' });
  const valD = h('strong', { class: 'eq', style: 'color: var(--yellow);' });

  const sliderX = h('input', {
    type: 'range',
    min: -9,
    max: 9,
    step: 0.5,
    value: state.x,
    'aria-label': 'Posición del punto móvil x',
  });

  const sliderH = h('input', {
    type: 'range',
    min: -6,
    max: 6,
    step: 0.5,
    value: state.h,
    'aria-label': 'Posición del centro o ancla h',
  });

  const sliderD = h('input', {
    type: 'range',
    min: 1,
    max: 6,
    step: 0.5,
    value: state.targetD,
    'aria-label': 'Radio de distancia d',
  });

  const labelWrapX = h('label', { class: 'field__label' },
    'Punto móvil x = ',
    valX,
    sliderX
  );
  const labelWrapH = h('label', { class: 'field__label' },
    'Centro (ancla) h = ',
    valH,
    sliderH
  );
  const labelWrapD = h('label', { class: 'field__label' },
    'Radio de distancia d = ',
    valD,
    sliderD
  );

  const controlsSlot = h('div', { class: 'seq-controls' });
  const readoutCard = h('div', { class: 'va-readout' });
  const signMachineWrap = h('div', { style: 'margin-top: 8px;' });

  sliderX.addEventListener('input', (e) => {
    state.x = parseFloat(e.target.value);
    syncUI();
  });

  sliderH.addEventListener('input', (e) => {
    state.h = parseFloat(e.target.value);
    syncUI();
  });

  sliderD.addEventListener('input', (e) => {
    state.targetD = parseFloat(e.target.value);
    syncUI();
  });

  // Direct drag on the 1D SVG ruler
  const snapKeys = [];
  for (let v = -9; v <= 9; v += 0.5) snapKeys.push(v);

  bindSvgDrag(
    svg,
    () => ({
      cfg: { xMin: X_MIN, xMax: X_MAX, yMin: -1, yMax: 1 },
      invX: ix,
      invY: () => 0,
    }),
    ({ x: mathX, phase, event }) => {
      if (phase === 'start') {
        const handleAttr = event?.target?.closest?.('[data-ruler-handle]')?.dataset?.rulerHandle;
        if (handleAttr) {
          state.activeDragTarget = handleAttr;
        } else if (state.symmetricMode) {
          state.activeDragTarget = 'h';
        } else {
          const distToX = Math.abs(mathX - state.x);
          const distToH = Math.abs(mathX - state.h);
          state.activeDragTarget = distToX <= distToH ? 'x' : 'h';
        }
      }

      const raw = Math.round(mathX * 2) / 2;
      const snapped = snapTo(raw, snapKeys, 0.25);

      if (state.activeDragTarget === 'h' || state.symmetricMode) {
        const clampedH = Math.max(-6, Math.min(6, snapped));
        if (clampedH !== state.h) {
          state.h = clampedH;
          sliderH.value = String(state.h);
          syncUI();
        }
      } else {
        const clampedX = Math.max(-9, Math.min(9, snapped));
        if (clampedX !== state.x) {
          state.x = clampedX;
          sliderX.value = String(state.x);
          syncUI();
        }
      }
    }
  );

  function renderSvg() {
    mount(svg);

    const haloStyle = 'paint-order: stroke; stroke: var(--bg); stroke-width: 5px; stroke-linejoin: round;';

    // Recta base con puntas de flecha en ambos extremos
    const lineLeft = PAD_X - 18;
    const lineRight = WIDTH - PAD_X + 18;
    svg.append(
      s('line', {
        x1: lineLeft,
        y1: AXIS_Y,
        x2: lineRight,
        y2: AXIS_Y,
        stroke: 'var(--ink)',
        'stroke-width': '2.2',
        'stroke-linecap': 'round',
      }),
      s('path', {
        d: `M ${lineLeft + 7} ${AXIS_Y - 5} L ${lineLeft} ${AXIS_Y} L ${lineLeft + 7} ${AXIS_Y + 5}`,
        fill: 'none',
        stroke: 'var(--ink)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
      s('path', {
        d: `M ${lineRight - 7} ${AXIS_Y - 5} L ${lineRight} ${AXIS_Y} L ${lineRight - 7} ${AXIS_Y + 5}`,
        fill: 'none',
        stroke: 'var(--ink)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      })
    );

    // Marcas de graduación (ticks) y etiquetas numéricas
    for (let t = X_MIN; t <= X_MAX; t++) {
      const tx = sx(t);
      const isZero = t === 0;
      const isMajor = t % 2 === 0 || isZero;
      svg.append(
        s('line', {
          x1: tx,
          y1: AXIS_Y - (isZero ? 10 : isMajor ? 7 : 4.5),
          x2: tx,
          y2: AXIS_Y + (isZero ? 10 : isMajor ? 7 : 4.5),
          stroke: isZero ? 'var(--ink)' : 'var(--muted)',
          'stroke-width': isZero ? '2.4' : isMajor ? '1.6' : '1.1',
        }),
        isMajor
          ? s('text', {
              x: tx,
              y: AXIS_Y + 26,
              'text-anchor': 'middle',
              fill: isZero ? 'var(--ink)' : 'var(--muted)',
              'font-family': 'var(--font-hand)',
              'font-size': isZero ? '16px' : '15px',
              'font-weight': isZero ? 'bold' : 'normal',
              style: haloStyle,
            }, fmt(t))
          : null
      );
    }

    const hx = sx(state.h);

    if (!state.symmetricMode) {
      const xx = sx(state.x);
      const dist = Math.abs(state.x - state.h);
      const midX = (hx + xx) / 2;
      const arcY = AXIS_Y - 50;
      const closeLabels = Math.abs(xx - hx) < 96;
      const labelY_H = AXIS_Y + 48;
      const labelY_X = closeLabels ? AXIS_Y + 68 : AXIS_Y + 48;

      // Sombra y cota de distancia entre h y x
      svg.append(
        s('rect', {
          x: Math.min(hx, xx),
          y: AXIS_Y - 12,
          width: Math.max(2, Math.abs(xx - hx)),
          height: 24,
          fill: 'rgba(230, 211, 138, 0.16)',
          rx: 4,
        }),
        s('line', {
          x1: hx,
          y1: AXIS_Y - 10,
          x2: hx,
          y2: arcY,
          stroke: 'var(--blue)',
          'stroke-dasharray': '4 3',
          'stroke-width': '1.8',
        }),
        s('line', {
          x1: xx,
          y1: AXIS_Y - 10,
          x2: xx,
          y2: arcY,
          stroke: 'var(--pink)',
          'stroke-dasharray': '4 3',
          'stroke-width': '1.8',
        }),
        // Barra horizontal de cota con topes verticales
        s('line', {
          x1: hx,
          y1: arcY,
          x2: xx,
          y2: arcY,
          stroke: 'var(--yellow)',
          'stroke-width': '3.2',
          'stroke-linecap': 'round',
        }),
        s('line', {
          x1: hx,
          y1: arcY - 6,
          x2: hx,
          y2: arcY + 6,
          stroke: 'var(--yellow)',
          'stroke-width': '2.4',
          'stroke-linecap': 'round',
        }),
        s('line', {
          x1: xx,
          y1: arcY - 6,
          x2: xx,
          y2: arcY + 6,
          stroke: 'var(--yellow)',
          'stroke-width': '2.4',
          'stroke-linecap': 'round',
        }),
        s('text', {
          x: Math.max(95, Math.min(WIDTH - 95, midX)),
          y: arcY - 12,
          'text-anchor': 'middle',
          fill: 'var(--yellow)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 17px)',
          'font-weight': 'bold',
          style: haloStyle,
        }, `|${fmt(state.x)} − (${fmt(state.h)})| = ${fmt(dist)} pasos`),
        // Punto centro h (arrastrable)
        s('g', { dataset: { rulerHandle: 'h' }, style: 'cursor: grab;' },
          s('circle', { cx: hx, cy: AXIS_Y, r: 14, fill: 'transparent' }),
          s('circle', {
            cx: hx,
            cy: AXIS_Y,
            r: 7.5,
            fill: 'var(--blue)',
            stroke: 'var(--bg)',
            'stroke-width': '2.2',
          }),
          s('text', {
            x: Math.max(55, Math.min(WIDTH - 55, hx)),
            y: labelY_H,
            'text-anchor': 'middle',
            fill: 'var(--blue)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 16px)',
            'font-weight': 'bold',
            style: haloStyle,
          }, `Centro h = ${fmt(state.h)}`)
        ),
        // Punto explorador x (arrastrable)
        s('g', { dataset: { rulerHandle: 'x' }, style: 'cursor: grab;' },
          s('circle', { cx: xx, cy: AXIS_Y, r: 14, fill: 'transparent' }),
          s('circle', {
            cx: xx,
            cy: AXIS_Y,
            r: 8.5,
            fill: 'var(--pink)',
            stroke: 'var(--bg)',
            'stroke-width': '2.2',
          }),
          s('text', {
            x: Math.max(45, Math.min(WIDTH - 45, xx)),
            y: labelY_X,
            'text-anchor': 'middle',
            fill: 'var(--pink)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 16px)',
            'font-weight': 'bold',
            style: haloStyle,
          }, `x = ${fmt(state.x)}`)
        )
      );
    } else {
      const xLeft = state.h - state.targetD;
      const xRight = state.h + state.targetD;
      const lx = sx(xLeft);
      const rx = sx(xRight);
      const arcY = AXIS_Y - 50;

      svg.append(
        // Intervalo bola cerrada [h - d, h + d]
        s('rect', {
          x: lx,
          y: AXIS_Y - 11,
          width: Math.max(2, rx - lx),
          height: 22,
          fill: 'rgba(155, 191, 217, 0.18)',
          rx: 4,
        }),
        // Líneas punteadas verticales de referencia
        s('line', {
          x1: lx,
          y1: AXIS_Y - 10,
          x2: lx,
          y2: arcY,
          stroke: 'var(--pink)',
          'stroke-dasharray': '4 3',
          'stroke-width': '1.6',
        }),
        s('line', {
          x1: hx,
          y1: AXIS_Y - 10,
          x2: hx,
          y2: arcY,
          stroke: 'var(--yellow)',
          'stroke-dasharray': '4 3',
          'stroke-width': '1.6',
        }),
        s('line', {
          x1: rx,
          y1: AXIS_Y - 10,
          x2: rx,
          y2: arcY,
          stroke: 'var(--green)',
          'stroke-dasharray': '4 3',
          'stroke-width': '1.6',
        }),
        // Brazo izquierdo -d
        s('line', {
          x1: hx,
          y1: arcY,
          x2: lx,
          y2: arcY,
          stroke: 'var(--pink)',
          'stroke-width': '3',
          'stroke-linecap': 'round',
        }),
        s('line', {
          x1: lx,
          y1: arcY - 6,
          x2: lx,
          y2: arcY + 6,
          stroke: 'var(--pink)',
          'stroke-width': '2.2',
        }),
        s('text', {
          x: (hx + lx) / 2,
          y: arcY - 11,
          'text-anchor': 'middle',
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 16px)',
          'font-weight': 'bold',
          style: haloStyle,
        }, `−${fmt(state.targetD)} pasos`),
        // Brazo derecho +d
        s('line', {
          x1: hx,
          y1: arcY,
          x2: rx,
          y2: arcY,
          stroke: 'var(--green)',
          'stroke-width': '3',
          'stroke-linecap': 'round',
        }),
        s('line', {
          x1: rx,
          y1: arcY - 6,
          x2: rx,
          y2: arcY + 6,
          stroke: 'var(--green)',
          'stroke-width': '2.2',
        }),
        s('line', {
          x1: hx,
          y1: arcY - 6,
          x2: hx,
          y2: arcY + 6,
          stroke: 'var(--yellow)',
          'stroke-width': '2.4',
        }),
        s('text', {
          x: (hx + rx) / 2,
          y: arcY - 11,
          'text-anchor': 'middle',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 16px)',
          'font-weight': 'bold',
          style: haloStyle,
        }, `+${fmt(state.targetD)} pasos`),
        // Solución izquierda x1
        s('circle', {
          cx: lx,
          cy: AXIS_Y,
          r: 7.5,
          fill: 'var(--pink)',
          stroke: 'var(--bg)',
          'stroke-width': '2.2',
        }),
        s('text', {
          x: Math.max(42, lx),
          y: AXIS_Y + 48,
          'text-anchor': 'middle',
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 16px)',
          'font-weight': 'bold',
          style: haloStyle,
        }, `x₁ = ${fmt(xLeft)}`),
        // Solución derecha x2
        s('circle', {
          cx: rx,
          cy: AXIS_Y,
          r: 7.5,
          fill: 'var(--green)',
          stroke: 'var(--bg)',
          'stroke-width': '2.2',
        }),
        s('text', {
          x: Math.min(WIDTH - 42, rx),
          y: AXIS_Y + 48,
          'text-anchor': 'middle',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 16px)',
          'font-weight': 'bold',
          style: haloStyle,
        }, `x₂ = ${fmt(xRight)}`),
        // Ancla central h (arrastrable)
        s('g', { dataset: { rulerHandle: 'h' }, style: 'cursor: grab;' },
          s('circle', { cx: hx, cy: AXIS_Y, r: 14, fill: 'transparent' }),
          s('circle', {
            cx: hx,
            cy: AXIS_Y,
            r: 8,
            fill: 'var(--yellow)',
            stroke: 'var(--bg)',
            'stroke-width': '2.2',
          }),
          s('text', {
            x: hx,
            y: Math.abs(rx - hx) < 75 ? AXIS_Y + 68 : AXIS_Y + 48,
            'text-anchor': 'middle',
            fill: 'var(--yellow)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 16px)',
            'font-weight': 'bold',
            style: haloStyle,
          }, `Centro h = ${fmt(state.h)}`)
        )
      );
    }
  }

  function syncUI() {
    btnModeExplore.classList.toggle('is-active', !state.symmetricMode);
    btnModeSym.classList.toggle('is-active', state.symmetricMode);

    valX.textContent = fmt(state.x);
    valH.textContent = fmt(state.h);
    valD.textContent = fmt(state.targetD);

    if (!state.symmetricMode) {
      if (labelWrapD.parentNode === controlsSlot) labelWrapD.remove();
      if (labelWrapX.parentNode !== controlsSlot) controlsSlot.prepend(labelWrapX);
      if (labelWrapH.parentNode !== controlsSlot) controlsSlot.append(labelWrapH);
    } else {
      if (labelWrapX.parentNode === controlsSlot) labelWrapX.remove();
      if (labelWrapH.parentNode !== controlsSlot) controlsSlot.append(labelWrapH);
      if (labelWrapD.parentNode !== controlsSlot) controlsSlot.append(labelWrapD);
    }

    renderSvg();

    const diff = state.x - state.h;
    const dist = Math.abs(diff);
    const isNeg = diff < 0;

    if (!state.symmetricMode) {
      mount(
        readoutCard,
        h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.05rem;' },
          `Resta con signo (desplazamiento): x − h = (${fmt(state.x)}) − (${fmt(state.h)}) = `,
          h('strong', { style: `color: ${diff < 0 ? 'var(--pink)' : 'var(--green)'};` }, fmt(diff)),
          diff < 0
            ? ' (a la izquierda del centro)'
            : diff > 0
              ? ' (a la derecha del centro)'
              : ' (exactamente en el centro)'
        ),
        h('p', { class: 'eq', style: 'margin: 0; font-size: 1.05rem;' },
          `Distancia absoluta: |x − h| = |${fmt(diff)}| = `,
          h('strong', { style: 'color: var(--yellow); font-size: 1.25rem;' }, `${fmt(dist)} unidades`)
        )
      );
    } else {
      const x1 = state.h - state.targetD;
      const x2 = state.h + state.targetD;
      const hExpr = state.h === 0 ? 'x' : state.h > 0 ? `x − ${fmt(state.h)}` : `x + ${fmt(Math.abs(state.h))}`;
      mount(
        readoutCard,
        h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.08rem;' },
          `Ecuación: |${hExpr}| = ${fmt(state.targetD)}  ⟺  puntos a distancia ${fmt(state.targetD)} del centro h = ${fmt(state.h)}`
        ),
        h('p', { class: 'small', style: 'margin: 0;' },
          'Dos soluciones simétricas: ',
          h('strong', { class: 'eq', style: 'color: var(--pink);' }, `x₁ = ${fmt(state.h)} − ${fmt(state.targetD)} = ${fmt(x1)}`),
          '  y  ',
          h('strong', { class: 'eq', style: 'color: var(--green);' }, `x₂ = ${fmt(state.h)} + ${fmt(state.targetD)} = ${fmt(x2)}`),
          ' · Bola cerrada: ',
          h('strong', { class: 'eq', style: 'color: var(--teal);' }, `|${hExpr}| ≤ ${fmt(state.targetD)} ⟺ [${fmt(x1)}; ${fmt(x2)}]`)
        )
      );
    }

    // Máquina Inversora del Signo Menos (flujo pedagógico sobre pizarrón)
    mount(
      signMachineWrap,
      h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
      h('div', { class: 'va-machine-header' },
        h('strong', { class: 'va-machine-title' },
          'La Máquina Inversora del Signo Menos: ¿por qué |u| = −u cuando u < 0?'
        ),
        h('span', { class: 'va-machine-subtitle' }, '¡El signo «−» adelante NO significa negativo, significa OPUESTO!')
      ),
      h('div', { class: 'va-sign-machine' },
        h('div', { class: 'va-sign-step' },
          h('span', { class: 'va-sign-step__label' }, '1. Interior u = x − h'),
          h('span', {
            class: 'va-sign-step__val',
            style: `color: ${isNeg ? 'var(--pink)' : 'var(--teal)'};`,
          }, `u = ${fmt(diff)}`),
          h('span', { class: 'small muted' }, isNeg ? 'Negativo (u < 0)' : 'No negativo (u ≥ 0)')
        ),
        h('span', { class: 'va-sign-arrow', 'aria-hidden': 'true' }, '⟶'),
        h('div', { class: ['va-sign-step', isNeg ? 'va-sign-step--active' : ''] },
          h('span', { class: 'va-sign-step__label' }, isNeg ? '2. Se activa inversor −(u)' : '2. Pasa directo +(u)'),
          h('span', {
            class: 'va-sign-step__val',
            style: 'color: var(--yellow);',
          }, isNeg ? `−(${fmt(diff)})` : `+${fmt(diff)}`),
          h('span', { class: 'small muted' }, isNeg ? 'Menos por menos = más' : 'No requiere inversión')
        ),
        h('span', { class: 'va-sign-arrow', 'aria-hidden': 'true' }, '⟶'),
        h('div', { class: 'va-sign-step' },
          h('span', { class: 'va-sign-step__label' }, '3. Distancia final |x − h|'),
          h('span', {
            class: 'va-sign-step__val',
            style: 'color: var(--green);',
          }, `+${fmt(dist)}`),
          h('span', { class: 'small muted' }, 'Siempre ≥ 0')
        )
      )
    );
  }

  mount(
    container,
    h('div', { class: 'seq-controls' }, btnModeExplore, btnModeSym),
    controlsSlot,
    svg,
    h('div', { class: 'chalk-stroke', 'aria-hidden': 'true' }),
    readoutCard,
    signMachineWrap
  );

  syncUI();
}
