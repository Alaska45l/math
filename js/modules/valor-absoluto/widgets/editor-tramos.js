/**
 * widgets/editor-tramos.js — Widget interactivo para la Sección 9:
 * Constructor Visual de Tramos, alternancia al clic entre punto abierto (◦) y cerrado (•),
 * Detector de Unicidad en la Frontera y proyección de Sombras de Dominio y Rango.
 */

import { h, s, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane } from '../../../core/plot.js';
import { piecewiseBrace } from '../components.js';
import { validatePiecewiseFunction, formatLinearExpr } from '../logic.js';
import { react } from '../../../core/vn.js';
import { playClick, playError } from '../../../core/sound.js';

export function initEditorTramosWidget(container) {
  // 2 tramos en [-5, 1] y [1, 5] con frontera en x = 1
  const state = {
    splitX: 1,
    left: { m: 1, b: 1, minX: -5, minInc: true, maxInc: false }, // en x=1 vale 2 (abierto ◦)
    right: { m: -1, b: 4, maxX: 5, minInc: true, maxInc: true },  // en x=1 vale 3 (cerrado •)
    showDomainShadow: true,
    showRangeShadow: false,
  };

  function getPiecesForLogic() {
    const { splitX, left, right } = state;
    const condLeft = `${fmt(left.minX)} ${left.minInc ? '≤' : '<'} x ${left.maxInc ? '≤' : '<'} ${fmt(splitX)}`;
    const condRight = `${fmt(splitX)} ${right.minInc ? '≤' : '<'} x ${right.maxInc ? '≤' : '<'} ${fmt(right.maxX)}`;
    return [
      {
        m: left.m,
        b: left.b,
        minX: left.minX,
        maxX: splitX,
        minInclusive: left.minInc,
        maxInclusive: left.maxInc,
        exprText: formatLinearExpr(left.m, left.b),
        condition: condLeft,
        fn: (x) => left.m * x + left.b,
      },
      {
        m: right.m,
        b: right.b,
        minX: splitX,
        maxX: right.maxX,
        minInclusive: right.minInc,
        maxInclusive: right.maxInc,
        exprText: formatLinearExpr(right.m, right.b),
        condition: condRight,
        fn: (x) => right.m * x + right.b,
      },
    ];
  }

  function computeDomainText() {
    const { splitX, left, right } = state;
    const lBr = left.minInc ? '[' : '(';
    const rBr = right.maxInc ? ']' : ')';
    const hasSplitIncluded = left.maxInc || right.minInc;
    if (hasSplitIncluded) {
      return `${lBr}${fmt(left.minX)}; ${fmt(right.maxX)}${rBr}`;
    }
    return `${lBr}${fmt(left.minX)}; ${fmt(splitX)}) ∪ (${fmt(splitX)}; ${fmt(right.maxX)}${rBr}`;
  }

  function computeRangeText() {
    const { splitX, left, right } = state;
    const yL1 = left.m * left.minX + left.b;
    const yL2 = left.m * splitX + left.b;
    const yR1 = right.m * splitX + right.b;
    const yR2 = right.m * right.maxX + right.b;
    const minY = Math.min(yL1, yL2, yR1, yR2);
    const maxY = Math.max(yL1, yL2, yR1, yR2);
    return `[${fmt(minY)}; ${fmt(maxY)}] (ver sombra proyectada en el eje Y)`;
  }

  function toggleEndpoint(which) {
    if (which === 'left-min') state.left.minInc = !state.left.minInc;
    else if (which === 'left-max') state.left.maxInc = !state.left.maxInc;
    else if (which === 'right-min') state.right.minInc = !state.right.minInc;
    else if (which === 'right-max') state.right.maxInc = !state.right.maxInc;

    const pieces = getPiecesForLogic();
    const validation = validatePiecewiseFunction(pieces);
    if (!validation.isValidFunction) {
      playError(2);
      react({
        pose: 'enojada',
        tag: '¡Violación de Unicidad!',
        html: `¡Acabás de poner <strong>dos puntos cerrados (•)</strong> en la frontera <span class="eq">x = ${fmt(state.splitX)}</span> a distinta altura! Una recta vertical corta dos veces la gráfica: ¡deja de ser función!`,
      });
    } else {
      playClick();
    }
    render();
  }

  function render() {
    const pieces = getPiecesForLogic();
    const validation = validatePiecewiseFunction(pieces);
    const isCollision = !validation.isValidFunction;

    const topButtons = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', state.left.maxInc && !state.right.minInc ? 'is-active' : ''],
        on: {
          click: () => {
            state.left.maxInc = true;
            state.right.minInc = false;
            render();
          },
        },
      }, 'Frontera x = 1: Izquierda cerrada (•) / Derecha abierta (◦)'),
      h('button', {
        type: 'button',
        class: ['chip', !state.left.maxInc && state.right.minInc ? 'is-active' : ''],
        on: {
          click: () => {
            state.left.maxInc = false;
            state.right.minInc = true;
            render();
          },
        },
      }, 'Frontera x = 1: Izquierda abierta (◦) / Derecha cerrada (•)'),
      h('button', {
        type: 'button',
        class: ['chip', isCollision ? 'is-active' : ''],
        on: {
          click: () => {
            state.left.maxInc = true;
            state.right.minInc = true;
            playError(2);
            react({
              pose: 'enojada',
              tag: '¡Violación de Unicidad!',
              html: '¡Mirá esa línea vertical rosa en <span class="eq">x = 1</span>! Al cerrar ambos extremos en distinta altura, para <span class="eq">x = 1</span> habría dos salidas a la vez.',
            });
            render();
          },
        },
      }, '💥 Provocar Colisión (Ambos cerrados • y •)'),
      h('button', {
        type: 'button',
        class: ['chip', state.showDomainShadow ? 'is-active' : ''],
        on: {
          click: () => {
            state.showDomainShadow = !state.showDomainShadow;
            render();
          },
        },
      }, 'Sombra de Dominio (Eje X)'),
      h('button', {
        type: 'button',
        class: ['chip', state.showRangeShadow ? 'is-active' : ''],
        on: {
          click: () => {
            state.showRangeShadow = !state.showRangeShadow;
            render();
          },
        },
      }, 'Sombra de Rango (Eje Y)')
    );

    const svg = s('svg', {
      viewBox: '0 0 580 350',
      class: 'seq-plot abs-board-svg',
      role: 'img',
      'aria-label': 'Editor interactivo de tramos con puntos abiertos y cerrados clickeables',
    });

    const plane = createPlane(svg, {
      width: 580,
      height: 350,
      xMin: -6,
      xMax: 6,
      yMin: -5,
      yMax: 6,
      xStep: 1,
      yStep: 1,
    });

    // Sombra de Dominio en el eje X
    if (state.showDomainShadow) {
      plane.layers.over.append(
        s('line', {
          x1: plane.sx(state.left.minX),
          y1: plane.xAxisY,
          x2: plane.sx(state.splitX),
          y2: plane.xAxisY,
          stroke: 'var(--yellow)',
          'stroke-width': '6',
          opacity: '0.65',
        }),
        s('line', {
          x1: plane.sx(state.splitX),
          y1: plane.xAxisY,
          x2: plane.sx(state.right.maxX),
          y2: plane.xAxisY,
          stroke: 'var(--yellow)',
          'stroke-width': '6',
          opacity: '0.65',
        })
      );
    }

    // Sombra de Rango en el eje Y
    if (state.showRangeShadow) {
      const yLMin = Math.min(pieces[0].fn(state.left.minX), pieces[0].fn(state.splitX));
      const yLMax = Math.max(pieces[0].fn(state.left.minX), pieces[0].fn(state.splitX));
      const yRMin = Math.min(pieces[1].fn(state.splitX), pieces[1].fn(state.right.maxX));
      const yRMax = Math.max(pieces[1].fn(state.splitX), pieces[1].fn(state.right.maxX));
      const totalMinY = Math.min(yLMin, yRMin);
      const totalMaxY = Math.max(yLMax, yRMax);

      plane.layers.over.append(
        s('line', {
          x1: plane.yAxisX,
          y1: plane.sy(totalMinY),
          x2: plane.yAxisX,
          y2: plane.sy(totalMaxY),
          stroke: 'var(--green)',
          'stroke-width': '6',
          opacity: '0.65',
        })
      );
    }

    // Frontera vertical x = splitX
    const bx = plane.sx(state.splitX);
    plane.layers.under.append(
      s('line', {
        x1: bx,
        y1: plane.sy(-5),
        x2: bx,
        y2: plane.sy(6),
        stroke: isCollision ? 'var(--pink)' : 'var(--muted)',
        'stroke-width': isCollision ? '2.8' : '1.6',
        'stroke-dasharray': isCollision ? 'none' : '4 4',
      })
    );

    // Segmentos
    pieces.forEach((p, idx) => {
      const pts = [
        [p.minX, p.fn(p.minX)],
        [p.maxX, p.fn(p.maxX)],
      ];
      plane.layers.curve.append(
        s('path', {
          d: plane.linePath(pts),
          fill: 'none',
          stroke: isCollision ? 'var(--pink)' : (idx === 0 ? 'var(--blue)' : 'var(--yellow)'),
          'stroke-width': '3.2',
        })
      );
    });

    // Nodos de extremo clickeables para alternar ◦ vs •
    const endpoints = [
      { id: 'left-min', x: state.left.minX, y: pieces[0].fn(state.left.minX), inc: state.left.minInc, color: 'var(--blue)' },
      { id: 'left-max', x: state.splitX, y: pieces[0].fn(state.splitX), inc: state.left.maxInc, color: isCollision ? 'var(--pink)' : 'var(--blue)' },
      { id: 'right-min', x: state.splitX, y: pieces[1].fn(state.splitX), inc: state.right.minInc, color: isCollision ? 'var(--pink)' : 'var(--yellow)' },
      { id: 'right-max', x: state.right.maxX, y: pieces[1].fn(state.right.maxX), inc: state.right.maxInc, color: 'var(--yellow)' },
    ];

    endpoints.forEach((ep) => {
      const cx = plane.sx(ep.x);
      const cy = plane.sy(ep.y);
      const g = s('g', {
        class: 'abs-board__handle is-draggable',
        tabindex: '0',
        role: 'button',
        'aria-label': `Extremo en (${fmt(ep.x)}; ${fmt(ep.y)}): actualmente ${ep.inc ? 'cerrado (incluido)' : 'abierto (excluido)'}. Clic para alternar.`,
      },
        s('circle', { cx, cy, r: 14, fill: 'transparent' }),
        s('circle', {
          cx,
          cy,
          r: 7,
          fill: ep.inc ? ep.color : 'var(--bg)',
          stroke: ep.color,
          'stroke-width': '2.6',
        })
      );
      g.addEventListener('click', () => toggleEndpoint(ep.id));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleEndpoint(ep.id);
        }
      });
      plane.layers.marks.append(g);
    });

    const braceSlot = h('div', { style: 'flex: 1; min-width: 250px;' });
    piecewiseBrace(braceSlot, pieces, null, { fnName: 'f(x)' });

    const statusCard = h('div', { class: 'seq-check__card', style: 'flex: 1.2; min-width: 260px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Diagnóstico de Función, Dominio y Rango'),
      isCollision
        ? h('div', { class: 'notice notice--err' },
            chalkIcon('cross'),
            h('span', null, validation.collisions[0].reason)
          )
        : h('div', { class: 'notice notice--ok' },
            chalkIcon('check'),
            h('span', null, `Cumple unicidad en todo su dominio (en x = ${fmt(state.splitX)} a lo sumo un tramo tiene punto cerrado •).`)
          ),
      h('p', { class: 'small', style: 'margin-top: 10px;' },
        h('strong', { style: 'color: var(--yellow);' }, 'Dominio (Sombra en Eje X): '),
        h('span', { class: 'eq' }, computeDomainText())
      ),
      h('p', { class: 'small' },
        h('strong', { style: 'color: var(--green);' }, 'Rango / Imagen (Sombra en Eje Y): '),
        h('span', { class: 'eq' }, computeRangeText())
      ),
      h('p', { class: 'small muted' }, '💡 Tip: podés hacer clic directamente sobre cualquiera de los 4 círculos de los extremos en el gráfico para abrirlos (◦) o cerrarlos (•).')
    );

    mount(
      container,
      topButtons,
      svg,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, braceSlot, statusCard)
    );
  }

  render();
}
