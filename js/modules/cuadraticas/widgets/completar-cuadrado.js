/**
 * Widget 6 · completar-cuadrado.js
 * Simulador sincronizado del Rompecabezas Geométrico de Completar el Cuadrado
 * (+0 neutro aditivo) y traductor en vivo threeFormsRosettaStrip.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { completeTheSquareSteps, fmtNumClean } from '../logic.js';
import { threeFormsRosettaStrip } from '../components.js';
import { createQuadBoardSvg, createPredictBox } from './board-kit.js';

const EXAMPLES = [
  { label: 'x² − 6x + 2 (a = 1)', a: 1, b: -6, c: 2 },
  { label: '3x² − 6x − 1 (a = 3)', a: 3, b: -6, c: -1 },
  { label: '−1/2 x² + 2x − 9/2 (a = −1/2)', a: -0.5, b: 2, c: -4.5 },
  { label: '−x² + 2x − 9/2 (a = −1)', a: -1, b: 2, c: -4.5 },
  { label: 'x² + 4x − 5 (a = 1)', a: 1, b: 4, c: -5 },
];

export function initCompletarCuadrado(host) {
  if (!host) return null;
  clear(host);

  const state = {
    exIdx: 0,
    stepIdx: 3, // 0..3
  };

  const predictBox = createPredictBox({
    prompt:
      'Para completar el cuadrado en x² − 6x + 2, partimos −6x en dos alas de −3x. ¿Qué número exacto debemos sumar y restar para fabricar el neutro aditivo +0 y cerrar el cuadrado?',
    options: [
      {
        label: 'Sumar y restar 6 (porque el coeficiente lineal es −6)',
        correct: false,
        explanation:
          'La esquina faltante tiene como lados las dos mitades (−3 y −3), por lo que su área es (−3)² = 9.',
      },
      {
        label: 'Sumar y restar 9 (porque (−6 / 2)² = (−3)² = 9)',
        correct: true,
        explanation:
          '¡Exacto! Sumando +9 y restando −9 formás (x² − 6x + 9) − 9 + 2 = (x − 3)² − 7 sin alterar la función.',
      },
      {
        label: 'Sumar 9 sin restar nada',
        correct: false,
        explanation:
          'Si solo sumás 9 sin restar 9, estás cambiando la altura de toda la parábola en 9 unidades.',
      },
    ],
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const stepsRow = h('div', { class: 'pr-chip-row' });

  EXAMPLES.forEach((ex, i) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${i === 0 ? ' is-active' : ''}` },
      ex.label
    );
    b.addEventListener('click', () => {
      playClick();
      state.exIdx = i;
      for (const btn of presetsRow.querySelectorAll('button')) {
        btn.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    presetsRow.appendChild(b);
  });

  const stepNames = [
    'Paso 1: Polinómica inicial',
    'Paso 2: Partir en dos alas (b/2a)',
    'Paso 3: Sumar neutro (+0)',
    'Paso 4: Plegar cuadrado canónico',
  ];
  stepNames.forEach((lbl, idx) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${idx === state.stepIdx ? ' is-active' : ''}` },
      lbl
    );
    b.addEventListener('click', () => {
      playClick();
      state.stepIdx = idx;
      for (const btn of stepsRow.querySelectorAll('button')) {
        btn.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    stepsRow.appendChild(b);
  });

  const board = createQuadBoardSvg({
    width: 680,
    height: 290,
    ariaLabel: 'Rompecabezas geométrico y algebraico de completar el cuadrado',
  });

  const rosettaContainer = h('div', { class: 'quad-rosetta-live-wrap' });
  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  function render() {
    clear(board.overlayLayer);
    const ex = EXAMPLES[state.exIdx];
    const data = completeTheSquareSteps(ex);
    const halfAbs = fmtNumClean(Math.abs(data.halfLinear));
    const sqStr = fmtNumClean(data.squareAdded);

    // Izquierda del SVG (x = 45..285): Rompecabezas Geométrico del Cuadrado
    const gx = 55;
    const gy = 50;
    const mainS = 120;
    const wingS = 54;

    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: gx + (mainS + wingS) / 2,
          y: 36,
          fill: 'var(--yellow)',
          'font-size': 12.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `Geometría del corchete (mitad = ${fmtNumClean(data.halfLinear)})`
      )
    );

    // Cuadrado x^2
    board.overlayLayer.appendChild(
      s('rect', {
        x: gx,
        y: gy,
        width: mainS,
        height: mainS,
        rx: 5,
        fill: 'rgba(132, 165, 157, 0.25)',
        stroke: 'var(--blue)',
        'stroke-width': 2,
      })
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: gx + mainS / 2,
          y: gy + mainS / 2 + 5,
          fill: 'var(--ink)',
          'font-size': 18,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        'x²'
      )
    );

    if (state.stepIdx >= 1) {
      // Dos alas iguales (b/2a)x
      const wingText = `${data.halfLinear >= 0 ? '+' : '−'}${halfAbs}x`;
      board.overlayLayer.appendChild(
        s('rect', {
          x: gx + mainS,
          y: gy,
          width: wingS,
          height: mainS,
          rx: 4,
          fill: 'rgba(246, 189, 96, 0.2)',
          stroke: 'var(--yellow)',
          'stroke-width': 1.8,
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: gx + mainS + wingS / 2,
            y: gy + mainS / 2 + 4,
            fill: 'var(--yellow)',
            'font-size': 12.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          wingText
        )
      );

      board.overlayLayer.appendChild(
        s('rect', {
          x: gx,
          y: gy + mainS,
          width: mainS,
          height: wingS,
          rx: 4,
          fill: 'rgba(246, 189, 96, 0.2)',
          stroke: 'var(--yellow)',
          'stroke-width': 1.8,
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: gx + mainS / 2,
            y: gy + mainS + wingS / 2 + 4,
            fill: 'var(--yellow)',
            'font-size': 12.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          wingText
        )
      );
    }

    if (state.stepIdx >= 2) {
      // Esquina que completa el cuadrado: +(b/2a)^2 y su gemelo negativo -(b/2a)^2
      board.overlayLayer.appendChild(
        s('rect', {
          x: gx + mainS,
          y: gy + mainS,
          width: wingS,
          height: wingS,
          rx: 4,
          fill: 'rgba(129, 178, 154, 0.32)',
          stroke: 'var(--green)',
          'stroke-width': 2,
          'stroke-dasharray': state.stepIdx === 2 ? '4 3' : '',
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: gx + mainS + wingS / 2,
            y: gy + mainS + wingS / 2 - 2,
            fill: 'var(--green)',
            'font-size': 12,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `+${sqStr}`
        )
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: gx + mainS + wingS / 2,
            y: gy + mainS + wingS / 2 + 13,
            fill: 'var(--pink)',
            'font-size': 10.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `(−${sqStr})`
        )
      );
    }

    // Derecha del SVG (x = 255..635): Escalera de los 4 pasos algebraicos
    data.steps.forEach((st, idx) => {
      if (idx > state.stepIdx) return;
      const sy = 32 + idx * 58;
      const isCurrent = idx === state.stepIdx;
      board.overlayLayer.appendChild(
        s('rect', {
          x: 252,
          y: sy,
          width: 386,
          height: 50,
          rx: 6,
          fill: isCurrent ? 'rgba(246, 189, 96, 0.15)' : 'rgba(20, 30, 25, 0.65)',
          stroke: isCurrent ? 'var(--yellow)' : 'rgba(236, 242, 232, 0.16)',
          'stroke-width': isCurrent ? 1.8 : 1,
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: 264,
            y: sy + 18,
            fill: isCurrent ? 'var(--yellow)' : 'var(--muted)',
            'font-size': 11,
            'font-weight': 'bold',
          },
          st.title
        )
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: 264,
            y: sy + 38,
            fill: 'var(--ink)',
            'font-size': 13,
            'font-weight': 'bold',
          },
          st.formula
        )
      );
    });

    const activeStep = data.steps[state.stepIdx];
    readoutLine1.textContent = `${activeStep.title}: ${activeStep.formula}`;
    readoutLine2.textContent = activeStep.explanation;

    rosettaContainer.replaceChildren(
      threeFormsRosettaStrip({ a: ex.a, b: ex.b, c: ex.c })
    );
  }

  render();
  host.append(predictBox, presetsRow, stepsRow, board.svg, readout, rosettaContainer);
  return { state, render };
}

export const initWidget = initCompletarCuadrado;
export default initCompletarCuadrado;
