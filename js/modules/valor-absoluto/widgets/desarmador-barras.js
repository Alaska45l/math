/**
 * widgets/desarmador-barras.js — Widget interactivo para la Sección 6:
 * Desenmascarar las barras |·|: convierte f(x) = a|x - h| + k en vivo a su llave definida por partes
 * con un Escáner x deslizable que recorre ambas ramas y hace clic al cruzar la frontera x = h.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';
import { piecewiseBrace } from '../components.js';
import { toPiecewise, evalAbs, formatCanonicalAbs, approxEq } from '../logic.js';
import { playClick } from '../../../core/sound.js';

const PRESETS = [
  { label: 'f(x) = |x − 2| + 1', a: 1, h: 2, k: 1 },
  { label: 'f(x) = 2|x + 1| − 3', a: 2, h: -1, k: -3 },
  { label: 'f(x) = −2|x − 3| + 5', a: -2, h: 3, k: 5 },
];

export function initDesarmadorBarrasWidget(container) {
  let aVal = 2;
  let hVal = -1;
  let kVal = -3;
  let scanX = -3;

  function render() {
    const pw = toPiecewise(aVal, hVal, kVal);
    const isRightBranch = scanX >= hVal - 1e-9;
    const currentY = evalAbs(aVal, hVal, kVal, scanX);

    const presetRow = h('div', { class: 'seq-controls' },
      PRESETS.map((p) =>
        h('button', {
          type: 'button',
          class: ['chip', approxEq(p.a, aVal) && approxEq(p.h, hVal) && approxEq(p.k, kVal) ? 'is-active' : ''],
          on: {
            click: () => {
              aVal = p.a;
              hVal = p.h;
              kVal = p.k;
              scanX = hVal - 2;
              render();
            },
          },
        }, p.label)
      )
    );

    const scannerControls = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Escáner en eje X (x = ${fmt(scanX)}): `,
        h('input', {
          type: 'range',
          min: '-6',
          max: '6',
          step: '0.5',
          value: String(scanX),
          on: {
            input: (e) => {
              const prevRight = scanX >= hVal;
              scanX = parseFloat(e.target.value) || 0;
              const nowRight = scanX >= hVal;
              if (prevRight !== nowRight) playClick();
              render();
            },
          },
        })
      ),
      h('button', {
        type: 'button',
        class: 'chip',
        on: {
          click: () => {
            scanX = hVal;
            playClick();
            render();
          },
        },
      }, `Saltar a la frontera exacta (x = ${fmt(hVal)})`)
    );

    // Lienzo cartesiano coloreando rama izquierda vs rama derecha
    const svg = s('svg', {
      viewBox: '0 0 560 330',
      class: 'seq-plot abs-board-svg',
      role: 'img',
      'aria-label': 'Gráfica de valor absoluto dividida en dos ramas lineales en la frontera x = h',
    });

    const plane = createPlane(svg, {
      width: 560,
      height: 330,
      xMin: -6,
      xMax: 6,
      yMin: -6,
      yMax: 7,
      xStep: 1,
      yStep: 1,
    });

    // Frontera vertical x = h
    const bx = plane.sx(hVal);
    plane.layers.under.append(
      s('line', {
        x1: bx,
        y1: plane.sy(-6),
        x2: bx,
        y2: plane.sy(7),
        stroke: 'var(--yellow)',
        'stroke-width': '2',
        'stroke-dasharray': '5 4',
      }),
      s('text', {
        x: bx + 6,
        y: plane.sy(6.2),
        fill: 'var(--yellow)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
        'font-weight': 'bold',
      }, `Frontera x = ${fmt(hVal)}`)
    );

    // Rama izquierda (x < h) y Rama derecha (x >= h)
    const leftPts = [
      [-6, evalAbs(aVal, hVal, kVal, -6)],
      [hVal, kVal],
    ];
    const rightPts = [
      [hVal, kVal],
      [6, evalAbs(aVal, hVal, kVal, 6)],
    ];

    plane.layers.curve.append(
      s('path', {
        d: plane.linePath(leftPts),
        fill: 'none',
        stroke: !isRightBranch ? 'var(--yellow)' : 'var(--muted)',
        'stroke-width': !isRightBranch ? '3.8' : '2.2',
      }),
      s('path', {
        d: plane.linePath(rightPts),
        fill: 'none',
        stroke: isRightBranch ? 'var(--yellow)' : 'var(--blue)',
        'stroke-width': isRightBranch ? '3.8' : '2.2',
      })
    );

    // Punto del escáner
    const sxPx = plane.sx(scanX);
    const syPx = plane.sy(currentY);
    plane.layers.marks.append(
      s('line', {
        x1: sxPx,
        y1: plane.xAxisY,
        x2: sxPx,
        y2: syPx,
        stroke: 'var(--yellow)',
        'stroke-width': '1.6',
        'stroke-dasharray': '3 3',
      }),
      s('circle', {
        cx: sxPx,
        cy: syPx,
        r: 7,
        fill: 'var(--yellow)',
        stroke: 'var(--bg)',
        'stroke-width': '2.2',
      }),
      s('circle', {
        cx: bx,
        cy: plane.sy(kVal),
        r: 5.5,
        fill: 'var(--green)',
        stroke: 'var(--bg)',
        'stroke-width': '1.8',
      })
    );

    bindSvgDrag(svg, plane, ({ x }) => {
      const next = Math.max(-6, Math.min(6, Math.round(x * 2) / 2));
      if (next !== scanX) {
        const prevRight = scanX >= hVal;
        scanX = next;
        if (prevRight !== (scanX >= hVal)) playClick();
        render();
      }
    });

    // Llave definida por partes con desarrollo distributivo y forma simplificada
    const braceSlot = h('div', null);
    piecewiseBrace(
      braceSlot,
      [
        {
          exprText: `${pw.rightBranch.rawText}  =  ${pw.rightBranch.simplifiedText}`,
          condition: `${pw.rightBranch.condition}  (Rama derecha · m = ${fmt(pw.rightBranch.m)})`,
        },
        {
          exprText: `${pw.leftBranch.rawText}  =  ${pw.leftBranch.simplifiedText}`,
          condition: `${pw.leftBranch.condition}  (Rama izquierda · m = ${fmt(pw.leftBranch.m)})`,
        },
      ],
      isRightBranch ? 0 : 1,
      { fnName: formatCanonicalAbs(aVal, hVal, kVal) }
    );

    const activeBranch = isRightBranch ? pw.rightBranch : pw.leftBranch;
    const statusBox = h('div', { class: 'seq-check__card', style: 'margin-top: 10px;' },
      h('p', { class: 'small', style: 'margin: 0;' },
        `En `,
        h('strong', { style: 'color: var(--yellow);' }, `x = ${fmt(scanX)}`),
        ` (${scanX >= hVal ? `x ≥ ${fmt(hVal)}, territorio derecho` : `x < ${fmt(hVal)}, territorio izquierdo`}), gobierna la recta `,
        h('strong', { class: 'eq', style: 'color: var(--yellow);' }, `y = ${activeBranch.simplifiedText}`),
        ` → f(${fmt(scanX)}) = `,
        h('strong', { style: 'color: var(--green);' }, fmt(currentY)),
        '.'
      )
    );

    mount(
      container,
      presetRow,
      scannerControls,
      braceSlot,
      svg,
      statusBox
    );
  }

  render();
}
