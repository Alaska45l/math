/**
 * Widget 2 · balanza-suma-producto.js
 * Balanza interactiva Suma-Producto conectada al rectángulo de área para factorizar x² + bx + c.
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick, playSuccess } from '../../../core/sound.js';
import { formatPolynomialString } from '../logic.js';
import {
  createQuadBoardSvg,
  createSliderField,
  createPredictBox,
} from './board-kit.js';

export function initBalanzaSumaProducto(host) {
  if (!host) return null;
  clear(host);

  const state = {
    targetM: 2,
    targetN: 3,
    candM: 1,
    candN: 6,
  };

  const predictBox = createPredictBox({
    prompt:
      'Para factorizar x² − 5x + 6 (donde el producto es c = +6 positivo y la suma es b = −5 negativa), ¿qué signos tendrán obligatoriamente m y n?',
    options: [
      {
        label: 'Ambos positivos (+2 y +3)',
        correct: false,
        explanation:
          'Si ambos fueran positivos, su suma sería +5 positiva en lugar de −5.',
      },
      {
        label: 'Ambos negativos (−2 y −3)',
        correct: true,
        explanation:
          '¡Exacto! Menos por menos da producto positivo (+6), y la suma de dos negativos da negativa (−5).',
      },
      {
        label: 'Uno positivo y otro negativo',
        correct: false,
        explanation:
          'Si tuvieran distinto signo, su producto m · n sería negativo (−6) en lugar de +6.',
      },
    ],
    onVerify: () => {
      state.targetM = -2;
      state.targetN = -3;
      state.candM = -2;
      state.candN = -3;
      sliderM.setValue(-2);
      sliderN.setValue(-3);
      for (const [i, b] of presetsRow.querySelectorAll('button').entries()) {
        b.classList.toggle('is-active', i === 1);
      }
      rebuildCandidateChips();
      render();
    },
  });

  const presetsRow = h('div', { class: 'pr-chip-row pr-presets' });
  const presets = [
    { label: 'x² + 5x + 6 (c > 0, b > 0)', m: 2, n: 3 },
    { label: 'x² − 5x + 6 (c > 0, b < 0)', m: -2, n: -3 },
    { label: 'x² − x − 6 (c < 0)', m: 2, n: -3 },
    { label: 'x² − x − 42 (c < 0)', m: -7, n: 6 },
    { label: 'x² + 4x − 12 (c < 0)', m: 6, n: -2 },
  ];

  const candidatePairsRow = h('div', { class: 'pr-chip-row' });

  const board = createQuadBoardSvg({
    width: 680,
    height: 300,
    ariaLabel: 'Balanza Suma-Producto para factorización de trinomios mónicos',
  });

  const sliderM = createSliderField({
    label: 'Candidato m',
    min: -10,
    max: 10,
    step: 1,
    value: state.candM,
    onInput: (v) => {
      state.candM = v;
      render();
    },
  });

  const sliderN = createSliderField({
    label: 'Candidato n',
    min: -10,
    max: 10,
    step: 1,
    value: state.candN,
    onInput: (v) => {
      state.candN = v;
      render();
    },
  });

  const slidersGrid = h('div', { class: 'quad-sliders-grid' }, [
    sliderM.root,
    sliderN.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  function rebuildCandidateChips() {
    clear(candidatePairsRow);
    const c = state.targetM * state.targetN;
    const absC = Math.abs(c);
    const pairs = [];
    for (let d = 1; d <= Math.min(absC, 14); d++) {
      if (absC % d === 0) {
        const q = absC / d;
        if (d <= q) {
          if (c > 0) {
            pairs.push([d, q], [-d, -q]);
          } else {
            pairs.push([d, -q], [-d, q]);
          }
        }
      }
    }
    candidatePairsRow.appendChild(
      h('span', { class: 'muted small' }, `Divisores de c = ${c}: `)
    );
    pairs.forEach(([pm, pn]) => {
      const btn = h(
        'button',
        {
          type: 'button',
          class: `pr-chip${
            (state.candM === pm && state.candN === pn) ||
            (state.candM === pn && state.candN === pm)
              ? ' is-active'
              : ''
          }`,
        },
        `(${pm}) y (${pn})`
      );
      btn.addEventListener('click', () => {
        playClick();
        state.candM = pm;
        state.candN = pn;
        sliderM.setValue(pm);
        sliderN.setValue(pn);
        rebuildCandidateChips();
        render();
      });
      candidatePairsRow.appendChild(btn);
    });
  }

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
      state.targetM = p.m;
      state.targetN = p.n;
      state.candM = p.m;
      state.candN = p.n;
      sliderM.setValue(p.m);
      sliderN.setValue(p.n);
      rebuildCandidateChips();
      render();
    });
    presetsRow.appendChild(btn);
  });

  function render() {
    clear(board.overlayLayer);

    const bTarget = state.targetM + state.targetN;
    const cTarget = state.targetM * state.targetN;
    const sumCand = state.candM + state.candN;
    const prodCand = state.candM * state.candN;

    const sumOk = sumCand === bTarget;
    const prodOk = prodCand === cTarget;
    const allOk = sumOk && prodOk;
    if (allOk) playSuccess();

    // Dibujar Balanza de Suma a la izquierda (x = 50..330)
    const pivotX = 185;
    const pivotY = 175;
    const tiltDeg = Math.max(-18, Math.min(18, (sumCand - bTarget) * 3));
    const rad = (tiltDeg * Math.PI) / 180;
    const armLen = 105;

    const leftX = pivotX - Math.cos(rad) * armLen;
    const leftY = pivotY - Math.sin(rad) * armLen;
    const rightX = pivotX + Math.cos(rad) * armLen;
    const rightY = pivotY + Math.sin(rad) * armLen;

    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: pivotX,
          y: 42,
          fill: 'var(--yellow)',
          'font-size': 14,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `Objetivo: ${formatPolynomialString({ a: 1, b: bTarget, c: cTarget })}`
      )
    );

    // Base de la balanza
    board.overlayLayer.appendChild(
      s('polygon', {
        points: `${pivotX - 24},${pivotY + 65} ${pivotX + 24},${pivotY + 65} ${pivotX},${pivotY}`,
        fill: 'rgba(236, 242, 232, 0.16)',
        stroke: 'var(--muted)',
        'stroke-width': 1.6,
      })
    );

    // Brazo de la balanza
    board.overlayLayer.appendChild(
      s('line', {
        x1: leftX,
        y1: leftY,
        x2: rightX,
        y2: rightY,
        stroke: sumOk ? 'var(--green)' : 'var(--yellow)',
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
      })
    );

    // Platillo izquierdo: m + n
    board.overlayLayer.appendChild(
      s('rect', {
        x: leftX - 48,
        y: leftY - 34,
        width: 96,
        height: 28,
        fill: 'rgba(20, 30, 25, 0.9)',
        stroke: sumOk ? 'var(--green)' : 'var(--blue)',
        'stroke-width': 1.6,
      })
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: leftX,
          y: leftY - 16,
          fill: 'var(--ink)',
          'font-size': 11.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `m + n = ${sumCand}`
      )
    );

    // Platillo derecho: b objetivo
    board.overlayLayer.appendChild(
      s('rect', {
        x: rightX - 48,
        y: rightY - 34,
        width: 96,
        height: 28,
        fill: 'rgba(20, 30, 25, 0.9)',
        stroke: sumOk ? 'var(--green)' : 'var(--yellow)',
        'stroke-width': 1.6,
      })
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: rightX,
          y: rightY - 16,
          fill: 'var(--ink)',
          'font-size': 11.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `b = ${bTarget}`
      )
    );

    // Derecha: Rectángulo de encastre (x + m)(x + n)
    const rx = 385;
    const ry = 65;
    const rw = 245;
    const rh = 185;

    board.overlayLayer.appendChild(
      s('rect', {
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        fill: allOk ? 'rgba(129, 178, 154, 0.16)' : 'rgba(20, 30, 25, 0.78)',
        stroke: allOk ? 'var(--green)' : 'var(--muted)',
        'stroke-width': 2,
      })
    );

    board.overlayLayer.appendChild(
      s('line', {
        x1: rx + 135,
        y1: ry,
        x2: rx + 135,
        y2: ry + rh,
        stroke: 'rgba(236, 242, 232, 0.28)',
        'stroke-dasharray': '4 4',
      })
    );
    board.overlayLayer.appendChild(
      s('line', {
        x1: rx,
        y1: ry + 100,
        x2: rx + rw,
        y2: ry + 100,
        stroke: 'rgba(236, 242, 232, 0.28)',
        'stroke-dasharray': '4 4',
      })
    );

    const fmtSide = (k) => (k >= 0 ? `x + ${k}` : `x − ${Math.abs(k)}`);
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: rx + rw / 2,
          y: ry - 10,
          fill: allOk ? 'var(--green)' : 'var(--yellow)',
          'font-size': 13.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `Base: (${fmtSide(state.candM)})`
      )
    );
    board.overlayLayer.appendChild(
      s(
        'text',
        {
          x: rx + rw / 2,
          y: ry + rh + 22,
          fill: allOk ? 'var(--green)' : 'var(--yellow)',
          'font-size': 13.5,
          'font-weight': 'bold',
          'text-anchor': 'middle',
        },
        `Altura: (${fmtSide(state.candN)})`
      )
    );

    const cells = [
      { x: rx + 67, y: ry + 54, t: 'x²' },
      { x: rx + 190, y: ry + 54, t: `${state.candM >= 0 ? '+' : '−'}${Math.abs(state.candM)}x` },
      { x: rx + 67, y: ry + 146, t: `${state.candN >= 0 ? '+' : '−'}${Math.abs(state.candN)}x` },
      {
        x: rx + 190,
        y: ry + 146,
        t: `${prodCand} (c = ${cTarget})`,
      },
    ];
    for (const cell of cells) {
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: cell.x,
            y: cell.y,
            fill: 'var(--ink)',
            'font-size': 13,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          cell.t
        )
      );
    }

    readoutLine1.textContent = allOk
      ? `¡Encastre exacto! ${formatPolynomialString({
          a: 1,
          b: bTarget,
          c: cTarget,
        })} = (${fmtSide(state.candM)}) · (${fmtSide(state.candN)})`
      : `Probando m = ${state.candM}, n = ${state.candN}: suma m + n = ${sumCand} (buscamos b = ${bTarget}) · producto m · n = ${prodCand} (buscamos c = ${cTarget})`;
    readoutLine2.textContent =
      cTarget > 0
        ? `Como c = +${cTarget} > 0, ambos números comparten el signo de b (${bTarget > 0 ? 'positivos' : 'negativos'}).`
        : `Como c = ${cTarget} < 0, tienen signos opuestos y gana en módulo el que tiene el signo de b = ${bTarget}.`;
  }

  state.candM = state.targetM;
  state.candN = state.targetN;
  sliderM.setValue(state.candM);
  sliderN.setValue(state.candN);
  rebuildCandidateChips();
  render();

  host.append(predictBox, presetsRow, candidatePairsRow, board.svg, slidersGrid, readout);
  return { state, render };
}

export const initWidget = initBalanzaSumaProducto;
export default initBalanzaSumaProducto;
