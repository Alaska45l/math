/**
 * espejo-cartesiano.js — Widget 2 (Sección 2):
 * «El Espejo del Eje X: de y = x a f(x) = |x|».
 * Sombrea el semiplano superior (C+) y el semiplano inferior prohibido (C-),
 * dibuja triángulos de pendiente m = -1 y m = +1, y permite arrastrar el punto explorador
 * tanto desde el slider como directamente sobre el plano cartesiano.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard, piecewiseBrace } from '../components.js';

export function initEspejoCartesianoWidget(container) {
  let state = {
    mirrorActive: true,
    explorerX: -3,
  };

  const boardSlot = h('div', { class: 'seq-plot-card' });
  const braceSlot = h('div', { style: 'margin-top: 8px;' });
  const readoutCard = h('div', { class: 'seq-check__card', style: 'margin-top: 8px;' });

  const btnMirrorOn = h('button', {
    type: 'button',
    class: 'chip is-active',
    on: {
      click: () => {
        state.mirrorActive = true;
        syncUI();
      },
    },
  }, 'Espejo del Eje X: ACTIVADO  f(x) = |x|');

  const btnMirrorOff = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.mirrorActive = false;
        syncUI();
      },
    },
  }, 'Ver recta identidad sin doblar  y = x');

  const valX = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.explorerX));

  const sliderX = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.explorerX,
    'aria-label': 'Abscisa del punto explorador x',
  });

  const board = createAbsBoard(boardSlot, {
    a: 1,
    h: 0,
    k: 0,
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    showReflectionGhost: true,
    showSymmetryAxis: true,
    showSlopeTriangle: false,
    draggableExplorer: true,
    explorerX: state.explorerX,
    customUnderRender(plane) {
      const yZero = plane.sy(0);
      const xLeft = plane.sx(-6);
      const xRight = plane.sx(6);
      const yTop = plane.sy(6);
      const yBot = plane.sy(-6);

      // Semiplano superior C+ (y > 0) y semiplano inferior prohibido (y < 0)
      plane.layers.under.append(
        s('rect', {
          x: xLeft,
          y: yTop,
          width: xRight - xLeft,
          height: yZero - yTop,
          fill: 'rgba(166, 227, 161, 0.06)',
        }),
        s('rect', {
          x: xLeft,
          y: yZero,
          width: xRight - xLeft,
          height: yBot - yZero,
          fill: 'rgba(242, 143, 173, 0.09)',
        }),
        s('text', {
          x: xLeft + 10,
          y: yTop + 18,
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, 'Semiplano superior (y ≥ 0): salidas permitidas para |x|'),
        s('text', {
          x: xLeft + 10,
          y: yBot - 12,
          fill: 'var(--pink)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, 'Zona bajo tierra (y < 0): prohibida para |·| — ¡el espejo la rebota arriba!')
      );

      // Triángulos de pendiente m = -1 (izquierda) y m = +1 (derecha)
      if (state.mirrorActive) {
        plane.layers.under.append(
          // Triángulo derecho m = +1 entre x=2 y x=3
          s('polyline', {
            points: `${plane.sx(2)},${plane.sy(2)} ${plane.sx(3)},${plane.sy(2)} ${plane.sx(3)},${plane.sy(3)}`,
            fill: 'rgba(166, 227, 161, 0.14)',
            stroke: 'var(--green)',
            'stroke-width': '1.6',
            'stroke-dasharray': '3 2',
          }),
          s('text', {
            x: plane.sx(3.15),
            y: plane.sy(2.5),
            fill: 'var(--green)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, 'm = +1 (y = x)'),
          // Triángulo izquierdo m = -1 entre x=-2 y x=-3
          s('polyline', {
            points: `${plane.sx(-2)},${plane.sy(2)} ${plane.sx(-3)},${plane.sy(2)} ${plane.sx(-3)},${plane.sy(3)}`,
            fill: 'rgba(242, 143, 173, 0.14)',
            stroke: 'var(--pink)',
            'stroke-width': '1.6',
            'stroke-dasharray': '3 2',
          }),
          s('text', {
            x: plane.sx(-3.15),
            y: plane.sy(2.5),
            'text-anchor': 'end',
            fill: 'var(--pink)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, 'm = −1 (y = −x)')
        );
      }
    },
    customOverRender(plane) {
      const ex = state.explorerX;
      const rawY = ex;
      const absY = Math.abs(ex);
      const px = plane.sx(ex);
      const pyRaw = plane.sy(rawY);
      const pyAbs = plane.sy(absY);

      if (!state.mirrorActive) {
        plane.layers.curves.innerHTML = '';
        plane.layers.under.append(
          s('line', {
            x1: plane.sx(-6),
            y1: plane.sy(-6),
            x2: plane.sx(6),
            y2: plane.sy(6),
            stroke: 'var(--blue)',
            'stroke-width': '3.2',
          })
        );
      }

      // Si x < 0 y el espejo está activo, mostrar el punto fantasma bajo tierra (x, x) y la flecha de rebote
      if (ex < 0 && state.mirrorActive) {
        plane.layers.marks.append(
          s('line', {
            x1: px,
            y1: pyRaw,
            x2: px,
            y2: pyAbs,
            stroke: 'var(--pink)',
            'stroke-width': '2.2',
            'stroke-dasharray': '4 3',
          }),
          s('polygon', {
            points: `${px},${pyAbs + 8} ${px - 5},${pyAbs + 16} ${px + 5},${pyAbs + 16}`,
            fill: 'var(--pink)',
          }),
          s('circle', {
            cx: px,
            cy: pyRaw,
            r: 5.5,
            fill: 'none',
            stroke: 'var(--pink)',
            'stroke-width': '2',
          }),
          s('text', {
            x: px - 10,
            y: pyRaw + 16,
            'text-anchor': 'end',
            fill: 'var(--pink)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
          }, `(${fmt(ex)}; ${fmt(rawY)}) rebota ↑`)
        );
      }

      // Punto gemelo simétrico (-x; |x|) cuando x != 0 y espejo activo
      if (ex !== 0 && state.mirrorActive) {
        const twinX = plane.sx(-ex);
        plane.layers.marks.append(
          s('line', {
            x1: px,
            y1: pyAbs,
            x2: twinX,
            y2: pyAbs,
            stroke: 'var(--teal)',
            'stroke-width': '1.3',
            'stroke-dasharray': '3 4',
          }),
          s('circle', {
            cx: twinX,
            cy: pyAbs,
            r: 5.5,
            fill: 'var(--teal)',
            stroke: 'var(--bg)',
            'stroke-width': '1.8',
          }),
          s('text', {
            x: twinX + (ex < 0 ? 10 : -10),
            y: pyAbs - 10,
            'text-anchor': ex < 0 ? 'start' : 'end',
            fill: 'var(--teal)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 13px)',
          }, `Gemelo (${fmt(-ex)}; ${fmt(absY)})`)
        );
      }

      // Punto explorador principal (arrastrable en el plano)
      const finalY = state.mirrorActive ? pyAbs : pyRaw;
      const finalValY = state.mirrorActive ? absY : rawY;
      plane.layers.marks.append(
        s('g', { dataset: { handle: 'explorer' }, style: 'cursor: grab;' },
          s('circle', { cx: px, cy: finalY, r: 15, fill: 'transparent' }),
          s('circle', {
            cx: px,
            cy: finalY,
            r: 8,
            fill: 'var(--green)',
            stroke: 'var(--bg)',
            'stroke-width': '2.2',
          })
        ),
        s('text', {
          x: px + (ex >= 0 ? 12 : -12),
          y: finalY - 11,
          'text-anchor': ex >= 0 ? 'start' : 'end',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 15px)',
          'font-weight': 'bold',
        }, `P(${fmt(ex)}; ${fmt(finalValY)})`)
      );
    },
    onChange(next) {
      if (typeof next.explorerX === 'number' && next.explorerX !== state.explorerX) {
        state.explorerX = next.explorerX;
        sliderX.value = String(state.explorerX);
        syncUI(false);
      }
    },
  });

  sliderX.addEventListener('input', (e) => {
    state.explorerX = parseFloat(e.target.value);
    syncUI(true);
  });

  function syncUI(updateBoard = true) {
    btnMirrorOn.classList.toggle('is-active', state.mirrorActive);
    btnMirrorOff.classList.toggle('is-active', !state.mirrorActive);
    valX.textContent = fmt(state.explorerX);

    if (updateBoard) {
      board.update({ explorerX: state.explorerX });
    }

    const activeBranchIdx = state.explorerX < 0 ? 0 : 1;
    piecewiseBrace(
      braceSlot,
      [
        { exprText: '−x   (pendiente m = −1)', condition: 'x < 0  (rama izquierda reflejada)' },
        { exprText: 'x    (pendiente m = +1)', condition: 'x ≥ 0  (rama derecha intacta)' },
      ],
      state.mirrorActive ? activeBranchIdx : null,
      { fnName: '|x|' }
    );

    const isNegative = state.explorerX < 0;
    mount(
      readoutCard,
      h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.05rem;' },
        isNegative
          ? `Para x = ${fmt(state.explorerX)} < 0: la recta y = x daría ${fmt(state.explorerX)} (bajo el eje X). El espejo invierte el signo: |${fmt(state.explorerX)}| = −(${fmt(state.explorerX)}) = +${fmt(Math.abs(state.explorerX))}.`
          : `Para x = ${fmt(state.explorerX)} ≥ 0: el punto ya está en el semiplano superior (o en el origen), así que |${fmt(state.explorerX)}| = ${fmt(state.explorerX)}.`
      ),
      h('p', { class: 'small muted', style: 'margin: 0;' },
        `Simetría par: f(${fmt(state.explorerX)}) = f(${fmt(-state.explorerX)}) = ${fmt(Math.abs(state.explorerX))}. Eje de simetría en x = 0 (Eje Y) y vértice en V(0; 0).`
      )
    );
  }

  mount(
    container,
    h('div', { class: 'seq-controls' },
      btnMirrorOn,
      btnMirrorOff,
      h('label', { class: 'field__label' },
        'Explorar punto x = ',
        valX,
        sliderX
      )
    ),
    boardSlot,
    braceSlot,
    readoutCard
  );

  syncUI();
}
