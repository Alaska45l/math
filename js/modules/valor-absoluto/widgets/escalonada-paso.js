/**
 * escalonada-paso.js — Widget 10 (Sección 10):
 * «Simulador de Escalera: Piso ⌊x⌋, Techo ⌈x⌉, Tarifa Postal y Proyección de Rango Discreto».
 * Proyecta los escalones horizontales contra el Eje Y como puntos aislados brillantes
 * para demostrar por qué el Rango se escribe entre llaves {…} y no como intervalo continuo.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../../core/plot.js';
import { dotBadge } from '../components.js';

export function initEscalonadaPasoWidget(container) {
  let state = {
    mode: 'floor', // 'floor' | 'ceil' | 'postal'
    x: -1.4,
    showRangeProjection: true,
  };

  const modesRow = h('div', { class: 'seq-controls' });
  const controlsRow = h('div', { class: 'seq-controls' });
  const plotCard = h('div', { class: 'seq-plot-card' });
  const readoutCard = h('div', { class: 'seq-check__card', style: 'margin-top: 8px;' });

  const valX = h('strong', { class: 'eq', style: 'color: var(--yellow);' });
  const labelPrefix = h('span', null, 'Entrada x = ');

  const sliderX = h('input', {
    type: 'range',
    min: -2.8,
    max: 3.8,
    step: 0.1,
    value: state.x,
    'aria-label': 'Valor de entrada x en la función escalonada',
  });

  const btnRangeProj = h('button', {
    type: 'button',
    class: 'chip is-active',
    on: {
      click: () => {
        state.showRangeProjection = !state.showRangeProjection;
        syncUI();
      },
    },
  });

  const btnTrapNeg = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.x = -1.4;
        sliderX.value = '-1.4';
        syncUI();
      },
    },
  }, 'Probar trampa negativa: x = −1,4');

  const btnQuickInt = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.x = 2;
        sliderX.value = '2';
        syncUI();
      },
    },
  }, 'Probar entero exacto: x = 2');

  const svg = s('svg', {
    class: 'seq-svg abs-board__svg',
    style: 'width: 100%; height: auto; max-height: 360px; display: block; touch-action: none; cursor: grab;',
    role: 'img',
    'aria-label': 'Gráfico de función escalonada con proyección de rango discreto sobre el eje Y',
  });
  plotCard.append(svg);

  let activePlane = null;
  let lastPlaneMode = null;

  bindSvgDrag(
    svg,
    () => activePlane,
    ({ x: mathX }) => {
      const isPostal = state.mode === 'postal';
      const minX = isPostal ? 0.1 : -2.8;
      const maxX = isPostal ? 3.9 : 3.8;
      const rounded = Math.round(mathX * 10) / 10;
      const clamped = Math.max(minX, Math.min(maxX, rounded));
      if (clamped !== state.x) {
        state.x = clamped;
        sliderX.value = String(state.x);
        syncUI();
      }
    }
  );

  sliderX.addEventListener('input', (e) => {
    state.x = parseFloat(e.target.value);
    syncUI();
  });

  function renderPlane() {
    const isPostal = state.mode === 'postal';
    const planeKey = isPostal ? 'postal' : 'math';

    if (!activePlane || lastPlaneMode !== planeKey) {
      lastPlaneMode = planeKey;
      activePlane = createPlane(svg, {
        xMin: isPostal ? 0 : -3,
        xMax: 4,
        yMin: isPostal ? 0 : -3,
        yMax: isPostal ? 10 : 4,
        width: 560,
        height: 340,
        yStep: isPostal ? 2 : 1,
        xLabel: isPostal ? 'peso (kg)' : 'x',
        yLabel: isPostal ? 'costo ($×100)' : 'y',
      });
    } else {
      activePlane.clear('under', 'curves', 'marks', 'labels');
    }

    const plane = activePlane;
    const xZero = plane.sx(0);

    if (!isPostal) {
      for (let n = -3; n <= 3; n++) {
        const yStepVal = state.mode === 'floor' ? n : n + 1;
        if (yStepVal < -3 || yStepVal > 4) continue;

        const x1 = plane.sx(n);
        const x2 = plane.sx(n + 1);
        const yPx = plane.sy(yStepVal);
        const isCurrentStep =
          state.mode === 'floor'
            ? state.x >= n && state.x < n + 1
            : state.x > n && state.x <= n + 1;

        const strokeCol = isCurrentStep ? 'var(--yellow)' : 'var(--teal)';

        // Proyección punteada hacia el Eje Y (Sombra de Rango Discreto)
        if (state.showRangeProjection) {
          plane.layers.under.append(
            s('line', {
              x1: x1,
              y1: yPx,
              x2: xZero,
              y2: yPx,
              stroke: isCurrentStep ? 'var(--yellow)' : 'var(--pink)',
              'stroke-width': isCurrentStep ? '2' : '1.3',
              'stroke-dasharray': '3 4',
              opacity: isCurrentStep ? '0.95' : '0.55',
            }),
            s('circle', {
              cx: xZero,
              cy: yPx,
              r: isCurrentStep ? 6.5 : 5,
              fill: isCurrentStep ? 'var(--yellow)' : 'var(--pink)',
              stroke: 'var(--bg)',
              'stroke-width': '1.8',
            })
          );
        }

        plane.layers.curves.append(
          s('line', {
            x1,
            y1: yPx,
            x2,
            y2: yPx,
            stroke: strokeCol,
            'stroke-width': isCurrentStep ? '4' : '2.8',
          })
        );

        const leftClosed = state.mode === 'floor';
        const rightClosed = state.mode === 'ceil';

        plane.layers.marks.append(
          s('circle', {
            cx: x1,
            cy: yPx,
            r: 6,
            fill: leftClosed ? strokeCol : 'var(--bg)',
            stroke: strokeCol,
            'stroke-width': '2.4',
          }),
          s('circle', {
            cx: x2,
            cy: yPx,
            r: 6,
            fill: rightClosed ? strokeCol : 'var(--bg)',
            stroke: strokeCol,
            'stroke-width': '2.4',
          })
        );
      }

      if (state.showRangeProjection) {
        plane.layers.labels.append(
          s('text', {
            x: xZero + 10,
            y: plane.sy(3.6),
            fill: 'var(--pink)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, 'Rango en Eje Y: puntos aislados {−3; −2; −1; 0; 1; 2; 3}')
        );
      }
    } else {
      // Tarifa postal escalonada: (0,1] -> 3 ($300), (1,2] -> 5 ($500), (2,3] -> 7 ($700), (3,4] -> 9 ($900)
      const rates = [
        { min: 0, max: 1, y: 3, label: '$300' },
        { min: 1, max: 2, y: 5, label: '$500' },
        { min: 2, max: 3, y: 7, label: '$700' },
        { min: 3, max: 4, y: 9, label: '$900' },
      ];
      rates.forEach((r) => {
        const x1 = plane.sx(r.min);
        const x2 = plane.sx(r.max);
        const yPx = plane.sy(r.y);
        const isCurrent = state.x > r.min && state.x <= r.max;
        const col = isCurrent ? 'var(--yellow)' : 'var(--green)';

        if (state.showRangeProjection) {
          plane.layers.under.append(
            s('line', {
              x1: x1,
              y1: yPx,
              x2: xZero,
              y2: yPx,
              stroke: isCurrent ? 'var(--yellow)' : 'var(--pink)',
              'stroke-width': isCurrent ? '2' : '1.4',
              'stroke-dasharray': '3 4',
            }),
            s('circle', {
              cx: xZero,
              cy: yPx,
              r: isCurrent ? 6.5 : 5,
              fill: isCurrent ? 'var(--yellow)' : 'var(--pink)',
              stroke: 'var(--bg)',
              'stroke-width': '1.8',
            })
          );
        }

        plane.layers.curves.append(
          s('line', {
            x1,
            y1: yPx,
            x2,
            y2: yPx,
            stroke: col,
            'stroke-width': isCurrent ? '4' : '2.8',
          })
        );
        plane.layers.marks.append(
          s('circle', { cx: x1, cy: yPx, r: 6, fill: 'var(--bg)', stroke: col, 'stroke-width': '2.4' }),
          s('circle', { cx: x2, cy: yPx, r: 6, fill: col, stroke: col, 'stroke-width': '2.4' })
        );
      });

      if (state.showRangeProjection) {
        plane.layers.labels.append(
          s('text', {
            x: xZero + 12,
            y: plane.sy(9.5),
            fill: 'var(--pink)',
            'font-family': 'var(--font-hand)',
            'font-size': 'var(--svg-scale-caveat, 14px)',
            'font-weight': 'bold',
          }, 'Rango discreto en Eje Y: {$300; $500; $700; $900}')
        );
      }
    }

    // Punto evaluado actual
    let yEval = 0;
    if (state.mode === 'floor') yEval = Math.floor(state.x);
    else if (state.mode === 'ceil') yEval = Math.ceil(state.x);
    else {
      const kStep = Math.max(1, Math.ceil(state.x));
      yEval = 1 + 2 * kStep;
    }

    const px = plane.sx(state.x);
    const py = plane.sy(yEval);

    plane.layers.marks.append(
      s('line', {
        x1: px,
        y1: plane.sy(0),
        x2: px,
        y2: py,
        stroke: 'var(--yellow)',
        'stroke-width': '1.8',
        'stroke-dasharray': '4 3',
      }),
      s('circle', {
        cx: px,
        cy: py,
        r: 8,
        fill: 'var(--yellow)',
        stroke: 'var(--bg)',
        'stroke-width': '2.4',
      }),
      s('text', {
        x: Math.max(60, Math.min(500, px + 10)),
        y: Math.max(22, py - 12),
        fill: 'var(--yellow)',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 15px)',
        'font-weight': 'bold',
      }, isPostal ? `(${fmt(state.x)} kg; $${yEval * 100})` : `(${fmt(state.x)}; ${fmt(yEval)})`)
    );
  }

  function syncUI() {
    const isPostal = state.mode === 'postal';
    sliderX.min = isPostal ? '0.1' : '-2.8';
    sliderX.max = isPostal ? '3.9' : '3.8';

    labelPrefix.textContent = isPostal ? 'Peso del paquete x (kg) = ' : 'Entrada x = ';
    valX.textContent = fmt(state.x);

    btnRangeProj.classList.toggle('is-active', state.showRangeProjection);
    btnRangeProj.textContent = state.showRangeProjection
      ? 'Proyectar Rango contra Eje Y: ACTIVO'
      : 'Proyectar Rango contra Eje Y: OCULTO';

    mount(
      modesRow,
      h('button', {
        type: 'button',
        class: ['chip', state.mode === 'floor' ? 'is-active' : ''],
        on: {
          click: () => {
            state.mode = 'floor';
            state.x = -1.4;
            sliderX.value = '-1.4';
            syncUI();
          },
        },
      }, '1. Función Piso  f(x) = ⌊x⌋'),
      h('button', {
        type: 'button',
        class: ['chip', state.mode === 'ceil' ? 'is-active' : ''],
        on: {
          click: () => {
            state.mode = 'ceil';
            state.x = 1.3;
            sliderX.value = '1.3';
            syncUI();
          },
        },
      }, '2. Función Techo  g(x) = ⌈x⌉'),
      h('button', {
        type: 'button',
        class: ['chip', state.mode === 'postal' ? 'is-active' : ''],
        on: {
          click: () => {
            state.mode = 'postal';
            state.x = 1.4;
            sliderX.value = '1.4';
            syncUI();
          },
        },
      }, '3. Aplicación Real: Tarifa Postal por Tramos')
    );

    if (isPostal) {
      if (btnTrapNeg.parentNode === controlsRow) btnTrapNeg.remove();
      if (btnQuickInt.parentNode === controlsRow) btnQuickInt.remove();
    } else {
      if (btnTrapNeg.parentNode !== controlsRow) controlsRow.append(btnTrapNeg);
      if (btnQuickInt.parentNode !== controlsRow) controlsRow.append(btnQuickInt);
    }

    renderPlane();

    const floorVal = Math.floor(state.x);
    const ceilVal = Math.ceil(state.x);

    mount(
      readoutCard,
      !isPostal
        ? h('div', null,
            h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.1rem;' },
              state.mode === 'floor'
                ? `Función Piso (mayor entero ≤ x):  ⌊${fmt(state.x)}⌋ = ${fmt(floorVal)}`
                : `Función Techo (menor entero ≥ x):  ⌈${fmt(state.x)}⌉ = ${fmt(ceilVal)}`
            ),
            state.x < 0 && !Number.isInteger(state.x)
              ? h('p', { class: 'small', style: 'margin: 0 0 6px; color: var(--pink);' },
                  `¡Ojo con los negativos! En la recta numérica, ${fmt(state.x)} está entre ${fmt(floorVal)} (a la izquierda) y ${fmt(ceilVal)} (a la derecha). Por eso el piso ⌊${fmt(state.x)}⌋ baja al entero de la izquierda (${fmt(floorVal)}) y NO es ${fmt(ceilVal)}.`
                )
              : null,
            h('p', { class: 'small muted', style: 'margin: 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;' },
              state.mode === 'floor'
                ? [
                    'Cada escalón tiene punto cerrado a la izquierda',
                    dotBadge(true),
                    'y círculo abierto a la derecha',
                    dotBadge(false),
                    '. Su Imagen en el Eje Y es el conjunto discreto entre llaves ℤ = {…, −2, −1, 0, 1, 2, …}.',
                  ]
                : [
                    'Cada escalón tiene círculo abierto a la izquierda',
                    dotBadge(false),
                    'y punto cerrado a la derecha',
                    dotBadge(true),
                    '. Su Imagen en el Eje Y es el conjunto discreto entre llaves ℤ = {…, −2, −1, 0, 1, 2, …}.',
                  ]
            )
          )
        : h('div', null,
            h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.1rem;' },
              `Paquete de ${fmt(state.x)} kg  ⟹  entra en el escalón (${Math.ceil(state.x) - 1}; ${Math.ceil(state.x)}] kg  ⟹  Tarifa = $${(1 + 2 * Math.ceil(state.x)) * 100}`
            ),
            h('p', { class: 'small muted', style: 'margin: 0;' },
              'Dominio continuo: (0; 4] kg · Conjunto Imagen (Rango) discreto entre llaves: {$300; $500; $700; $900} (nunca cobra valores intermedios como $415).'
            )
          )
    );
  }

  mount(
    controlsRow,
    h('label', { class: 'field__label' },
      labelPrefix,
      valX,
      sliderX
    ),
    btnRangeProj,
    btnTrapNeg,
    btnQuickInt
  );

  mount(
    container,
    modesRow,
    controlsRow,
    plotCard,
    readoutCard
  );

  syncUI();
}
