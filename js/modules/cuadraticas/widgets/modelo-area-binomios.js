/**
 * Widget 1 · modelo-area-binomios.js
 * Modelo de área interactivo de 4 cuadrantes para (Ax + B)(Cx + D),
 * productos notables y detector de falsas cuadráticas por cancelación.
 */

import { h, s, clear, chalkIcon } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { formatPolynomialString } from '../logic.js';
import {
  createQuadBoardSvg,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initModeloAreaBinomios(host) {
  if (!host) return null;
  clear(host);

  const state = {
    A: 1,
    B: 3,
    C: 1,
    D: 2,
    extraX2: 0, // usado en el preset de Falsa Cuadrática 2(x - 1)^2 - 2x^2
    scaleLead: 1,
  };

  const predictBox = createPredictBox({
    prompt:
      'Si en el rectángulo de lados (x + 3) y (x + 3) cambiamos un lado a (x − 3), ¿qué ocurrirá con las dos parcelas rectangulares cruzadas +3x y −3x?',
    options: [
      {
        label: 'Se suman dando +6x',
        correct: false,
        explanation:
          'Uno de los lados tiene signo positivo (+3x) y el otro signo negativo (−3x). Probá el preset «Diferencia de cuadrados» para ver cómo se anulan.',
      },
      {
        label: 'Son opuestas (+3x y −3x) y se cancelan sumando 0',
        correct: true,
        explanation:
          'Exacto: +3x − 3x = 0, por lo que desaparece el término lineal y queda limpia la diferencia de cuadrados x² − 9.',
      },
      {
        label: 'Se multiplican dando −9x²',
        correct: false,
        explanation:
          'Al reunir las cuatro parcelas del área sumamos sus superficies, no las multiplicamos entre sí.',
      },
    ],
    onVerify: () => {
      state.A = 1;
      state.B = 3;
      state.C = 1;
      state.D = -3;
      state.scaleLead = 1;
      state.extraX2 = 0;
      sliderA.setValue(1);
      sliderB.setValue(3);
      sliderC.setValue(1);
      sliderD.setValue(-3);
      for (const b of presetsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      render();
    },
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'Terreno (x + 3)(x + 2)', A: 1, B: 3, C: 1, D: 2, scaleLead: 1, extraX2: 0 },
    { label: 'Con resta (x − 4)(x + 7)', A: 1, B: -4, C: 1, D: 7, scaleLead: 1, extraX2: 0 },
    { label: 'Cuadrado (x + 3)²', A: 1, B: 3, C: 1, D: 3, scaleLead: 1, extraX2: 0 },
    { label: 'Diferencia (x + 4)(x − 4)', A: 1, B: 4, C: 1, D: -4, scaleLead: 1, extraX2: 0 },
    { label: 'Falsa cuadrática 2(x − 1)² − 2x²', A: 1, B: -1, C: 1, D: -1, scaleLead: 2, extraX2: -2 },
  ];

  const board = createQuadBoardSvg({
    width: 680,
    height: 310,
    ariaLabel: 'Modelo de área de 4 cuadrantes para multiplicación de binomios',
  });

  const sliderA = createSliderField({
    label: 'Coeficiente A (base Ax + B)',
    min: 1,
    max: 3,
    step: 1,
    value: state.A,
    onInput: (v) => {
      state.A = v;
      state.scaleLead = 1;
      state.extraX2 = 0;
      render();
    },
  });
  const sliderB = createSliderField({
    label: 'Término B (base Ax + B)',
    min: -7,
    max: 7,
    step: 1,
    value: state.B,
    onInput: (v) => {
      state.B = v;
      state.scaleLead = 1;
      state.extraX2 = 0;
      render();
    },
  });
  const sliderC = createSliderField({
    label: 'Coeficiente C (altura Cx + D)',
    min: 1,
    max: 3,
    step: 1,
    value: state.C,
    onInput: (v) => {
      state.C = v;
      state.scaleLead = 1;
      state.extraX2 = 0;
      render();
    },
  });
  const sliderD = createSliderField({
    label: 'Término D (altura Cx + D)',
    min: -7,
    max: 7,
    step: 1,
    value: state.D,
    onInput: (v) => {
      state.D = v;
      state.scaleLead = 1;
      state.extraX2 = 0;
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderA.root,
    sliderB.root,
    sliderC.root,
    sliderD.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  presets.forEach((p, idx) => {
    const btn = h(
      'button',
      { type: 'button', class: `pr-chip${idx === 0 ? ' is-active' : ''}` },
      p.label
    );
    btn.addEventListener('click', () => {
      playClick();
      for (const b of presetsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      btn.classList.add('is-active');
      state.A = p.A;
      state.B = p.B;
      state.C = p.C;
      state.D = p.D;
      state.scaleLead = p.scaleLead;
      state.extraX2 = p.extraX2;
      sliderA.setValue(p.A);
      sliderB.setValue(p.B);
      sliderC.setValue(p.C);
      sliderD.setValue(p.D);
      render();
    });
    presetsRow.appendChild(btn);
  });

  function render() {
    clear(board.clippedLayer);
    clear(board.overlayLayer);

    const { A, B, C, D, scaleLead, extraX2 } = state;
    const q1 = scaleLead * A * C; // x^2
    const q2 = scaleLead * B * C; // x
    const q3 = scaleLead * A * D; // x
    const q4 = scaleLead * B * D; // const

    const totalA = q1 + extraX2;
    const totalB = q2 + q3;
    const totalC = q4;

    // Proporción visual de las 4 parcelas dentro del tablero
    const boxX = 85;
    const boxY = 48;
    const totalW = 330;
    const totalH = 225;

    const ratioW = Math.min(0.75, Math.max(0.38, (A * 3) / (A * 3 + Math.abs(B) + 1)));
    const ratioH = Math.min(0.75, Math.max(0.38, (C * 3) / (C * 3 + Math.abs(D) + 1)));
    const splitW = Math.round(totalW * ratioW);
    const splitH = Math.round(totalH * ratioH);

    const drawCell = (x, y, w, hRect, title, sub, isNeg) => {
      const fill = isNeg
        ? 'rgba(242, 132, 130, 0.22)'
        : 'rgba(132, 165, 157, 0.22)';
      const stroke = isNeg ? 'var(--pink)' : 'var(--blue)';
      board.overlayLayer.appendChild(
        s('rect', {
          x,
          y,
          width: w,
          height: hRect,
          rx: 5,
          fill,
          stroke,
          'stroke-width': 1.8,
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: x + w / 2,
            y: y + hRect / 2 - 4,
            fill: 'var(--ink)',
            'font-size': 16,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          title
        )
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: x + w / 2,
            y: y + hRect / 2 + 15,
            fill: 'var(--muted)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          sub
        )
      );
    };

    const aTerm = A === 1 ? 'x' : `${A}x`;
    const cTerm = C === 1 ? 'x' : `${C}x`;
    const bTerm = B >= 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
    const dTerm = D >= 0 ? `+ ${D}` : `− ${Math.abs(D)}`;

    // Etiquetas superiores e izquierdas de los lados del rectángulo
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: boxX + splitW / 2,
          y: boxY - 12,
          fill: 'var(--yellow)',
          'font-size': 14,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        aTerm
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: boxX + splitW + (totalW - splitW) / 2,
          y: boxY - 12,
          fill: B >= 0 ? 'var(--green)' : 'var(--pink)',
          'font-size': 14,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        bTerm
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: boxX - 12,
          y: boxY + splitH / 2 + 4,
          fill: 'var(--yellow)',
          'font-size': 14,
          'font-weight': 'bold',
          'text-anchor': 'end',
        },
        cTerm
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: boxX - 12,
          y: boxY + splitH + (totalH - splitH) / 2 + 4,
          fill: D >= 0 ? 'var(--green)' : 'var(--pink)',
          'font-size': 14,
          'font-weight': 'bold',
          'text-anchor': 'end',
        },
        dTerm
      )
    );

    // 4 celdas
    drawCell(
      boxX,
      boxY,
      splitW,
      splitH,
      `${q1 === 1 ? '' : q1}x²`,
      `(${aTerm})·(${cTerm})`,
      q1 < 0
    );
    drawCell(
      boxX + splitW,
      boxY,
      totalW - splitW,
      splitH,
      `${q2 >= 0 ? '+' : '−'}${Math.abs(q2)}x`,
      `(${B})·(${cTerm})`,
      q2 < 0
    );
    drawCell(
      boxX,
      boxY + splitH,
      splitW,
      totalH - splitH,
      `${q3 >= 0 ? '+' : '−'}${Math.abs(q3)}x`,
      `(${aTerm})·(${D})`,
      q3 < 0
    );
    drawCell(
      boxX + splitW,
      boxY + splitH,
      totalW - splitW,
      totalH - splitH,
      `${q4 >= 0 ? '+' : '−'}${Math.abs(q4)}`,
      `(${B})·(${D})`,
      q4 < 0
    );

    // Panel derecho de síntesis dentro del SVG
    const rightX = 435;
    board.overlayLayer.appendChild(
      s(
        'rect',
        {
          x: rightX,
          y: boxY,
          width: 220,
          height: totalH,
          rx: 8,
          fill: 'rgba(20, 30, 25, 0.85)',
          stroke: 'rgba(236, 242, 232, 0.22)',
        }
      )
    );

    const statusTitle =
      totalA === 0
        ? '¡Falsa cuadrática! (a = 0)'
        : B === D && A === C
        ? 'Cuadrado de un binomio'
        : B === -D && A === C
        ? 'Diferencia de cuadrados'
        : 'Trinomio cuadrático (a ≠ 0)';

    const lines = [
      { text: statusTitle, y: boxY + 30, color: 'var(--yellow)', bold: true },
      {
        text: `Parcela x²: ${q1}x²${extraX2 ? ` − ${Math.abs(extraX2)}x² = ${totalA}x²` : ''}`,
        y: boxY + 66,
        color: 'var(--ink)',
      },
      {
        text: `Cruces en x: (${q2}x) + (${q3}x) = ${totalB}x`,
        y: boxY + 98,
        color: totalB === 0 ? 'var(--green)' : 'var(--blue)',
      },
      {
        text: `Esquina numérica: ${totalC}`,
        y: boxY + 130,
        color: 'var(--ink)',
      },
      {
        text: 'Polinomio reducido:',
        y: boxY + 172,
        color: 'var(--muted)',
      },
      {
        text: formatPolynomialString({ a: totalA, b: totalB, c: totalC }),
        y: boxY + 198,
        color: 'var(--green)',
        bold: true,
      },
    ];

    for (const l of lines) {
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: rightX + 14,
            y: l.y,
            fill: l.color,
            'font-size': l.bold ? 13.5 : 12,
            'font-weight': l.bold ? 'bold' : 'normal',
          },
          l.text
        )
      );
    }

    const prefix = scaleLead !== 1 ? `${scaleLead}` : '';
    const suffix = extraX2 !== 0 ? ` − ${Math.abs(extraX2)}x²` : '';
    readoutLine1.textContent = `Desarrollo: ${prefix}(${aTerm} ${bTerm})(${cTerm} ${dTerm})${suffix} = ${formatPolynomialString(
      { a: totalA, b: totalB, c: totalC }
    )}`;
    readoutLine2.textContent =
      totalA === 0
        ? 'Al abrir el cuadrado perfecto, +2x² se cancela con −2x² (a = 0): queda una función lineal, no una parábola.'
        : totalB === 0
        ? 'Las dos franjas cruzadas son opuestas y suman 0: queda una diferencia de cuadrados sin término lineal.'
        : `Las dos franjas cruzadas (${q2}x y ${q3}x) se reúnen en el término lineal ${totalB}x.`;
  }

  render();
  host.append(predictBox, presetsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initModeloAreaBinomios;
export default initModeloAreaBinomios;
