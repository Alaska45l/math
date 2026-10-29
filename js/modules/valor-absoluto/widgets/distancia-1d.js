/**
 * widgets/distancia-1d.js — Widget interactivo para la Sección 1:
 * Cinta Métrica Láser en 1D, faro desplazable h y el mito de «−x es negativo».
 */

import { h, s, mount, svgPoint } from '../../../core/dom.js';
import { fmt, paren, MINUS } from '../../../core/math-format.js';
import { piecewiseBrace } from '../components.js';
import { playSliderTick } from '../../../core/sound.js';

export function initDistancia1DWidget(container) {
  let xVal = -4;
  let hVal = 0;
  let customAnchorMode = false;

  function render() {
    const diff = xVal - hVal;
    const dist = Math.abs(diff);
    const isNegativeBranch = diff < 0;

    // Controles superiores
    const topControls = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', !customAnchorMode ? 'is-active' : ''],
        on: {
          click: () => {
            customAnchorMode = false;
            hVal = 0;
            render();
          },
        },
      }, 'Faro en el origen (h = 0 → |x|)'),
      h('button', {
        type: 'button',
        class: ['chip', customAnchorMode ? 'is-active' : ''],
        on: {
          click: () => {
            customAnchorMode = true;
            if (hVal === 0) hVal = 2;
            render();
          },
        },
      }, 'Mover el faro a h (|x − h|)'),
      h('button', {
        type: 'button',
        class: 'chip',
        on: {
          click: () => {
            xVal = -5;
            render();
          },
        },
      }, 'Probar x = −5 (activar inversor −x)'),
      h('button', {
        type: 'button',
        class: 'chip',
        on: {
          click: () => {
            xVal = 5;
            render();
          },
        },
      }, 'Probar x = +5')
    );

    const sliderRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Posición del punto x (${fmt(xVal)}): `,
        h('input', {
          type: 'range',
          min: '-8',
          max: '8',
          step: '0.5',
          value: String(xVal),
          on: {
            input: (e) => {
              xVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      customAnchorMode
        ? h('label', { class: 'field__label' },
            `Posición del faro fijo h (${fmt(hVal)}): `,
            h('input', {
              type: 'range',
              min: '-5',
              max: '5',
              step: '1',
              value: String(hVal),
              on: {
                input: (e) => {
                  hVal = parseFloat(e.target.value) || 0;
                  render();
                },
              },
            })
          )
        : null
    );

    // SVG de Cinta Métrica Láser 1D
    const W = 640;
    const H = 175;
    const padL = 42;
    const padR = 42;
    const axisY = 115;
    const sx = (v) => padL + ((v - -8) / 16) * (W - padL - padR);
    const invX = (px) => -8 + ((px - padL) / (W - padL - padR)) * 16;

    const svg = s('svg', {
      viewBox: `0 0 ${W} ${H}`,
      class: 'abs-1d-svg seq-plot',
      role: 'img',
      'aria-label': `Recta numérica mostrando la distancia entre x = ${fmt(xVal)} y el faro h = ${fmt(hVal)}`,
    });

    // Línea base y marcas de -8 a 8
    svg.append(
      s('line', {
        x1: padL - 10,
        y1: axisY,
        x2: W - padR + 10,
        y2: axisY,
        stroke: 'var(--ink)',
        'stroke-width': '2.2',
      })
    );

    for (let t = -8; t <= 8; t++) {
      const tx = sx(t);
      const isAnchor = Math.abs(t - hVal) < 1e-6;
      svg.append(
        s('line', {
          x1: tx,
          y1: axisY - (isAnchor ? 8 : 5),
          x2: tx,
          y2: axisY + (isAnchor ? 8 : 5),
          stroke: isAnchor ? 'var(--yellow)' : 'var(--ink)',
          'stroke-width': isAnchor ? '2.5' : '1.5',
        }),
        s('text', {
          x: tx,
          y: axisY + 26,
          'text-anchor': 'middle',
          fill: isAnchor ? 'var(--yellow)' : 'var(--muted)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 15px)',
          'font-weight': isAnchor ? 'bold' : 'normal',
        }, fmt(t))
      );
    }

    const pxX = sx(xVal);
    const pxH = sx(hVal);
    const midPx = (pxX + pxH) / 2;

    // Arco y barra láser de distancia (siempre >= 0 en amarillo)
    if (dist > 0.01) {
      svg.append(
        s('line', {
          x1: pxH,
          y1: axisY,
          x2: pxX,
          y2: axisY,
          stroke: 'var(--yellow)',
          'stroke-width': '5',
          'stroke-linecap': 'round',
        }),
        s('path', {
          d: `M ${pxH.toFixed(1)} ${axisY - 12} Q ${midPx.toFixed(1)} 26 ${pxX.toFixed(1)} ${axisY - 12}`,
          fill: 'none',
          stroke: 'var(--yellow)',
          'stroke-width': '2.4',
          'stroke-dasharray': '5 4',
        }),
        s('text', {
          x: midPx,
          y: 38,
          'text-anchor': 'middle',
          fill: 'var(--yellow)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 17px)',
          'font-weight': 'bold',
        }, `Distancia física = ${fmt(dist)} unidades`)
      );
    } else {
      svg.append(
        s('text', {
          x: pxH,
          y: 44,
          'text-anchor': 'middle',
          fill: 'var(--green)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 17px)',
          'font-weight': 'bold',
        }, '¡Distancia CERO! Estás parado exactamente sobre el faro.')
      );
    }

    // Faro en h
    svg.append(
      s('polygon', {
        points: `${pxH - 7},${axisY} ${pxH + 7},${axisY} ${pxH},${axisY - 22}`,
        fill: 'var(--yellow)',
        opacity: '0.85',
      }),
      s('text', {
        x: pxH,
        y: axisY + 46,
        'text-anchor': 'middle',
        fill: 'var(--yellow)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 14px)',
      }, `Faro h = ${fmt(hVal)}`)
    );

    // Nodo arrastrable x
    svg.append(
      s('circle', {
        cx: pxX,
        cy: axisY,
        r: 9,
        fill: 'var(--blue)',
        stroke: 'var(--bg)',
        'stroke-width': '2.4',
        class: 'abs-board__handle is-draggable',
      }),
      s('text', {
        x: pxX,
        y: axisY - 18,
        'text-anchor': 'middle',
        fill: 'var(--blue)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 16px)',
        'font-weight': 'bold',
      }, `x = ${fmt(xVal)}`)
    );

    // Arrastre directo sobre el SVG 1D
    let dragging = false;
    const updateFromEvt = (e) => {
      const pt = svgPoint(svg, e);
      const raw = invX(pt.x);
      const snapped = Math.max(-8, Math.min(8, Math.round(raw * 2) / 2));
      if (snapped !== xVal) {
        xVal = snapped;
        playSliderTick(1);
        render();
      }
    };
    svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { svg.setPointerCapture?.(e.pointerId); } catch (_) {}
      updateFromEvt(e);
    });
    svg.addEventListener('pointermove', (e) => {
      if (dragging) updateFromEvt(e);
    });
    svg.addEventListener('pointerup', () => { dragging = false; });
    svg.addEventListener('pointercancel', () => { dragging = false; });

    // Panel inferior: Llave por partes + Desglose del inversor de signo
    const braceSlot = h('div', { style: 'flex: 1; min-width: 240px;' });
    const insideVar = hVal === 0 ? 'x' : hVal > 0 ? `x ${MINUS} ${fmt(hVal)}` : `x + ${fmt(Math.abs(hVal))}`;
    piecewiseBrace(
      braceSlot,
      [
        {
          exprText: insideVar,
          condition: `${insideVar} ≥ 0  (a la derecha del faro)`,
        },
        {
          exprText: hVal === 0 ? `${MINUS}x` : `${MINUS}(${insideVar})`,
          condition: `${insideVar} < 0  (a la izquierda: ¡activa el inversor!)`,
        },
      ],
      isNegativeBranch ? 1 : 0,
      { fnName: `|${insideVar}|` }
    );

    const explanationCard = h('div', { class: 'seq-check__card', style: 'flex: 1.3; min-width: 260px;' },
      h('h3', { class: 'seq-sidebar__chapter-title' }, 'Radiografía del Signo en Vivo'),
      isNegativeBranch
        ? h('div', null,
            h('p', { class: 'small' },
              `Como estás a la izquierda del faro (${insideVar} = ${fmt(diff)} < 0), se activa el segundo renglón con el `,
              h('strong', { style: 'color: var(--yellow);' }, 'operador inversor (−)'),
              ' adelante:'
            ),
            h('p', { class: 'eq', style: 'font-size: 1.35rem; margin: 8px 0; color: var(--green);' },
              `|${fmt(diff)}| = ${MINUS}${paren(diff)} = +${fmt(dist)}`
            ),
            h('p', { class: 'small muted' },
              '¡El signo menos delante de la expresión NO hace negativo al resultado: choca contra el signo negativo de adentro y lo vuelve positivo!'
            )
          )
        : h('div', null,
            h('p', { class: 'small' },
              `Como ${insideVar} = ${fmt(diff)} ≥ 0, se activa el primer renglón sin alterar el signo:`
            ),
            h('p', { class: 'eq', style: 'font-size: 1.35rem; margin: 8px 0; color: var(--green);' },
              `|${fmt(diff)}| = ${fmt(dist)}`
            ),
            h('p', { class: 'small muted' },
              diff === 0
                ? 'En el faro exacto, la distancia es el neutro aditivo 0.'
                : 'Cuando lo de adentro ya es positivo, las barras simplemente devuelven ese mismo número.'
            )
          )
    );

    mount(
      container,
      topControls,
      sliderRow,
      svg,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, braceSlot, explanationCard)
    );
  }

  render();
}
