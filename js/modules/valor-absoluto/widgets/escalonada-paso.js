/**
 * widgets/escalonada-paso.js — Widget interactivo para la Sección 10:
 * Funciones de paso (escalonadas), tarifas del mundo real y por qué la Imagen es un conjunto discreto {y1, y2, ...}.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';
import { piecewiseBrace } from '../components.js';
import { evalPiecewise } from '../logic.js';

const CONTEXTS = [
  {
    id: 'parking',
    label: 'Contexto Real: Tarifa de Estacionamiento por Hora',
    xLabel: 't (Horas estacionado)',
    yLabel: 'Costo ($)',
    xMin: 0,
    xMax: 5,
    yMin: 0,
    yMax: 10,
    domainText: '(0; 4]',
    rangeText: '{2; 4; 6; 8}',
    wrongRangeText: '[2; 8]',
    pieces: [
      { exprText: '$2', condition: '0 < t ≤ 1', minX: 0, maxX: 1, minInclusive: false, maxInclusive: true, fn: () => 2 },
      { exprText: '$4', condition: '1 < t ≤ 2', minX: 1, maxX: 2, minInclusive: false, maxInclusive: true, fn: () => 4 },
      { exprText: '$6', condition: '2 < t ≤ 3', minX: 2, maxX: 3, minInclusive: false, maxInclusive: true, fn: () => 6 },
      { exprText: '$8', condition: '3 < t ≤ 4', minX: 3, maxX: 4, minInclusive: false, maxInclusive: true, fn: () => 8 },
    ],
  },
  {
    id: 'math-step',
    label: 'Función de Paso Matemática en [−3; 3]',
    xLabel: 'x',
    yLabel: 'f(x)',
    xMin: -4,
    xMax: 4,
    yMin: -2,
    yMax: 6,
    domainText: '[−3; 3]',
    rangeText: '{1; 3; 5}',
    wrongRangeText: '[1; 5]',
    pieces: [
      { exprText: '1', condition: '−3 ≤ x < −1', minX: -3, maxX: -1, minInclusive: true, maxInclusive: false, fn: () => 1 },
      { exprText: '3', condition: '−1 ≤ x < 1', minX: -1, maxX: 1, minInclusive: true, maxInclusive: false, fn: () => 3 },
      { exprText: '5', condition: '1 ≤ x ≤ 3', minX: 1, maxX: 3, minInclusive: true, maxInclusive: true, fn: () => 5 },
    ],
  },
];

export function initEscalonadaPasoWidget(container) {
  let ctxIdx = 0;
  let probeX = 1.5;
  let showRangeProjection = true;

  function render() {
    const ctx = CONTEXTS[ctxIdx];
    const ev = evalPiecewise(ctx.pieces, probeX);

    const topBar = h('div', { class: 'seq-controls' },
      CONTEXTS.map((c, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', idx === ctxIdx ? 'is-active' : ''],
          on: {
            click: () => {
              ctxIdx = idx;
              probeX = idx === 0 ? 1.5 : 0;
              render();
            },
          },
        }, c.label)
      ),
      h('button', {
        type: 'button',
        class: ['chip', showRangeProjection ? 'is-active' : ''],
        on: {
          click: () => {
            showRangeProjection = !showRangeProjection;
            render();
          },
        },
      }, 'Proyectar Escalones hacia el Eje Y (Ver Rango Discreto)')
    );

    const sliderBar = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Explorar entrada (${fmt(probeX)}): `,
        h('input', {
          type: 'range',
          min: String(ctx.xMin + 0.5),
          max: String(ctx.xMax - 0.5),
          step: '0.25',
          value: String(probeX),
          on: {
            input: (e) => {
              probeX = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      )
    );

    const svg = s('svg', {
      viewBox: '0 0 580 340',
      class: 'seq-plot abs-board-svg',
      role: 'img',
      'aria-label': 'Gráfico de función escalonada mostrando que su imagen son puntos aislados en el eje Y',
    });

    const plane = createPlane(svg, {
      width: 580,
      height: 340,
      xMin: ctx.xMin,
      xMax: ctx.xMax,
      yMin: ctx.yMin,
      yMax: ctx.yMax,
      xStep: 1,
      yStep: ctxIdx === 0 ? 2 : 1,
      xLabel: ctx.xLabel,
      yLabel: ctx.yLabel,
    });

    ctx.pieces.forEach((p, idx) => {
      const yVal = p.fn(p.minX);
      const isSelected = idx === ev.activePieceIndex;
      const color = isSelected ? 'var(--yellow)' : 'var(--blue)';

      // Escalón horizontal
      plane.layers.curve.append(
        s('line', {
          x1: plane.sx(p.minX),
          y1: plane.sy(yVal),
          x2: plane.sx(p.maxX),
          y2: plane.sy(yVal),
          stroke: color,
          'stroke-width': isSelected ? '4' : '3',
        })
      );

      // Extremos abierto/cerrado
      plane.layers.marks.append(
        s('circle', {
          cx: plane.sx(p.minX),
          cy: plane.sy(yVal),
          r: 5.5,
          fill: p.minInclusive ? color : 'var(--bg)',
          stroke: color,
          'stroke-width': '2.2',
        }),
        s('circle', {
          cx: plane.sx(p.maxX),
          cy: plane.sy(yVal),
          r: 5.5,
          fill: p.maxInclusive ? color : 'var(--bg)',
          stroke: color,
          'stroke-width': '2.2',
        })
      );

      // Proyección hacia el eje Y mostrando un ÚNICO punto aislado
      if (showRangeProjection) {
        plane.layers.under.append(
          s('line', {
            x1: plane.sx(p.minX),
            y1: plane.sy(yVal),
            x2: plane.yAxisX,
            y2: plane.sy(yVal),
            stroke: 'var(--green)',
            'stroke-width': '1.6',
            'stroke-dasharray': '4 4',
          })
        );
        plane.layers.marks.append(
          s('circle', {
            cx: plane.yAxisX,
            cy: plane.sy(yVal),
            r: 6.5,
            fill: 'var(--green)',
            stroke: 'var(--bg)',
            'stroke-width': '2',
          })
        );
      }
    });

    if (ev.defined && ev.y !== null) {
      plane.layers.over.append(
        s('line', {
          x1: plane.sx(probeX),
          y1: plane.xAxisY,
          x2: plane.sx(probeX),
          y2: plane.sy(ev.y),
          stroke: 'var(--yellow)',
          'stroke-width': '1.8',
          'stroke-dasharray': '3 3',
        }),
        s('circle', {
          cx: plane.sx(probeX),
          cy: plane.sy(ev.y),
          r: 7,
          fill: 'var(--yellow)',
          stroke: 'var(--bg)',
          'stroke-width': '2',
        })
      );
    }

    bindSvgDrag(svg, plane, ({ x }) => {
      const next = Math.max(ctx.xMin, Math.min(ctx.xMax, Math.round(x * 4) / 4));
      if (next !== probeX) {
        probeX = next;
        render();
      }
    });

    const braceSlot = h('div', { style: 'flex: 1; min-width: 240px;' });
    piecewiseBrace(braceSlot, ctx.pieces, ev.activePieceIndex, { fnName: 'f(x)' });

    const infoCard = h('div', { class: 'seq-check__card', style: 'flex: 1.25; min-width: 260px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Dominio Continuo vs. Imagen Discreta'),
      h('p', { class: 'small' },
        ev.defined
          ? `Para entrada ${fmt(probeX)}, estás en el escalón de altura ${fmt(ev.y)}.`
          : `Para entrada ${fmt(probeX)}, la función no está definida.`
      ),
      h('p', { class: 'small' },
        h('strong', { style: 'color: var(--yellow);' }, 'Dominio (Eje X): '),
        h('span', { class: 'eq' }, ctx.domainText),
        ' (intervalo continuo).'
      ),
      h('p', { class: 'small' },
        h('strong', { style: 'color: var(--green);' }, 'Rango / Imagen (Eje Y): '),
        h('span', { class: 'eq', style: 'font-size: 1.2rem; color: var(--green);' }, ctx.rangeText),
        ' (conjunto discreto entre llaves).'
      ),
      h('div', { class: 'notice notice--err small', style: 'margin-top: 8px;' },
        `¡Cuidado! Nunca escribas que el rango es el intervalo continuo ${ctx.wrongRangeText}, porque la función jamás toma valores intermedios con coma entre un escalón y el otro.`
      )
    );

    mount(
      container,
      topBar,
      sliderBar,
      svg,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, braceSlot, infoCard)
    );
  }

  render();
}
