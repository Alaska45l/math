/**
 * Widget 3 · agrupacion-estrategia.js
 * Visualizador paso a paso de factorización por agrupación (bx = mx + nx)
 * y modo Árbol de Decisión de 5 Pasos (Khan Academy).
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { factorQuadraticSteps, formatPolynomialString } from '../logic.js';
import { createQuadBoardSvg, createPredictBox } from './board-kit.js';

const GROUPING_EXAMPLES = [
  {
    id: '2x2+7x+3',
    label: '2x² + 7x + 3',
    a: 2,
    b: 7,
    c: 3,
    m: 1,
    n: 6,
    group1: 'x(2x + 1)',
    group2: '+ 3(2x + 1)',
    final: '(2x + 1)(x + 3)',
  },
  {
    id: '3x2-10x+8',
    label: '3x² − 10x + 8 (signo −)',
    a: 3,
    b: -10,
    c: 8,
    m: -6,
    n: -4,
    group1: '3x(x − 2)',
    group2: '− 4(x − 2)',
    final: '(3x − 4)(x − 2)',
  },
  {
    id: '6x2-5x-4',
    label: '6x² − 5x − 4',
    a: 6,
    b: -5,
    c: -4,
    m: -8,
    n: 3,
    group1: '2x(3x − 4)',
    group2: '+ 1(3x − 4)',
    final: '(2x + 1)(3x − 4)',
  },
];

const TREE_EXAMPLES = [
  { label: '5x² − 80', a: 5, b: 0, c: -80 },
  { label: '4x² + 12x + 9', a: 4, b: 12, c: 9 },
  { label: '3x² + 12x − 63 (12x − 63 + 3x²)', a: 3, b: 12, c: -63 },
  { label: '4x² + 18x − 10', a: 4, b: 18, c: -10 },
];

export function initAgrupacionEstrategia(host) {
  if (!host) return null;
  clear(host);

  const state = {
    mode: 'grouping', // 'grouping' | 'tree'
    groupIdx: 0,
    stepIdx: 3, // 0..3
    treeIdx: 0,
  };

  const predictBox = createPredictBox({
    prompt:
      'En 3x² − 6x − 4x + 8, la primera pareja es 3x(x − 2). ¿Qué factor debemos extraer de la segunda pareja (−4x + 8) para que el paréntesis quede idéntico a (x − 2)?',
    options: [
      {
        label: '+4 positivo, dejando +4(−x + 2)',
        correct: false,
        explanation:
          'Si sacás +4 positivo, adentro queda (−x + 2), que tiene los signos opuestos a (x − 2).',
      },
      {
        label: '−4 negativo, dejando −4(x − 2)',
        correct: true,
        explanation:
          '¡Impecable! Al dividir −4x por −4 queda +x, y al dividir +8 por −4 queda −2: −4(x − 2).',
      },
      {
        label: '−4x, dejando −4x(1 − 2)',
        correct: false,
        explanation:
          'El 8 no contiene la variable x, por lo que solo podemos extraer el factor numérico −4.',
      },
    ],
  });

  const modeRow = h('div', { class: 'pr-chip-row' });
  const btnModeGroup = h(
    'button',
    { type: 'button', class: 'pr-chip is-active' },
    'Modo 1 · Desarmador por Agrupación (a · c)'
  );
  const btnModeTree = h(
    'button',
    { type: 'button', class: 'pr-chip' },
    'Modo 2 · Brújula de 5 Pasos (4 Casos Integradores)'
  );
  modeRow.append(btnModeGroup, btnModeTree);

  const groupControlsWrap = h('div', { class: 'pr-chip-row pr-presets' });
  const stepButtonsWrap = h('div', { class: 'pr-chip-row' });
  const treeControlsWrap = h('div', { class: 'pr-chip-row pr-presets', hidden: '' });

  GROUPING_EXAMPLES.forEach((ex, i) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${i === 0 ? ' is-active' : ''}` },
      ex.label
    );
    b.addEventListener('click', () => {
      playClick();
      state.groupIdx = i;
      for (const el of groupControlsWrap.querySelectorAll('button')) {
        el.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    groupControlsWrap.appendChild(b);
  });

  const stepLabels = [
    'Paso 1: Producto a·c',
    'Paso 2: Partir bx = mx + nx',
    'Paso 3: Factor común por parejas',
    'Paso 4: Fusionar binomio común',
  ];
  stepLabels.forEach((lbl, sIdx) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${sIdx === state.stepIdx ? ' is-active' : ''}` },
      lbl
    );
    b.addEventListener('click', () => {
      playClick();
      state.stepIdx = sIdx;
      for (const el of stepButtonsWrap.querySelectorAll('button')) {
        el.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    stepButtonsWrap.appendChild(b);
  });

  TREE_EXAMPLES.forEach((tex, i) => {
    const b = h(
      'button',
      { type: 'button', class: `pr-chip${i === 0 ? ' is-active' : ''}` },
      tex.label
    );
    b.addEventListener('click', () => {
      playClick();
      state.treeIdx = i;
      for (const el of treeControlsWrap.querySelectorAll('button')) {
        el.classList.remove('is-active');
      }
      b.classList.add('is-active');
      render();
    });
    treeControlsWrap.appendChild(b);
  });

  btnModeGroup.addEventListener('click', () => {
    playClick();
    state.mode = 'grouping';
    btnModeGroup.classList.add('is-active');
    btnModeTree.classList.remove('is-active');
    groupControlsWrap.removeAttribute('hidden');
    stepButtonsWrap.removeAttribute('hidden');
    treeControlsWrap.setAttribute('hidden', '');
    render();
  });

  btnModeTree.addEventListener('click', () => {
    playClick();
    state.mode = 'tree';
    btnModeTree.classList.add('is-active');
    btnModeGroup.classList.remove('is-active');
    treeControlsWrap.removeAttribute('hidden');
    groupControlsWrap.setAttribute('hidden', '');
    stepButtonsWrap.setAttribute('hidden', '');
    render();
  });

  const board = createQuadBoardSvg({
    width: 680,
    height: 300,
    ariaLabel: 'Pizarrón de factorización por agrupación y árbol de decisión de 5 pasos',
  });

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  function render() {
    clear(board.overlayLayer);

    if (state.mode === 'grouping') {
      const ex = GROUPING_EXAMPLES[state.groupIdx];
      const ac = ex.a * ex.c;

      const drawStepCard = (y, active, badgeText, exprText, noteText) => {
        board.overlayLayer.appendChild(
          s('rect', {
            x: 48,
            y,
            width: 584,
            height: 54,
            rx: 7,
            fill: active ? 'rgba(246, 189, 96, 0.14)' : 'rgba(20, 30, 25, 0.65)',
            stroke: active ? 'var(--yellow)' : 'rgba(236, 242, 232, 0.16)',
            'stroke-width': active ? 2 : 1,
          })
        );
        board.overlayLayer.appendChild(
          s(
            'text',
            {
              x: 64,
              y: y + 22,
              fill: active ? 'var(--yellow)' : 'var(--muted)',
              'font-size': 11.5,
              'font-weight': 'bold',
            },
            badgeText
          )
        );
        board.overlayLayer.appendChild(
          s(
            'text',
            {
              x: 64,
              y: y + 42,
              fill: 'var(--ink)',
              'font-size': 14.5,
              'font-weight': 'bold',
            },
            exprText
          )
        );
        board.overlayLayer.appendChild(
          s(
            'text',
            {
              x: 618,
              y: y + 34,
              fill: 'var(--blue)',
              'font-size': 11.5,
              'text-anchor': 'end',
            },
            noteText
          )
        );
      };

      drawStepCard(
        26,
        state.stepIdx >= 0,
        '1. Producto Maestro a · c',
        `${ex.label}   →   a · c = (${ex.a}) · (${ex.c}) = ${ac}`,
        `m = ${ex.m}, n = ${ex.n} (suman ${ex.b})`
      );

      if (state.stepIdx >= 1) {
        drawStepCard(
          90,
          state.stepIdx === 1,
          '2. Desarmar el término central bx = mx + nx',
          `${ex.a}x² ${ex.m >= 0 ? '+ ' + ex.m : '− ' + Math.abs(ex.m)}x ${
            ex.n >= 0 ? '+ ' + ex.n : '− ' + Math.abs(ex.n)
          }x ${ex.c >= 0 ? '+ ' + ex.c : '− ' + Math.abs(ex.c)}`,
          `(${ex.m}x) + (${ex.n}x) = ${ex.b}x`
        );
      }

      if (state.stepIdx >= 2) {
        drawStepCard(
          154,
          state.stepIdx === 2,
          '3. Agrupar de a dos y extraer MCD en cada bloque',
          `${ex.group1} ${ex.group2}`,
          'El paréntesis queda idéntico en ambos grupos'
        );
      }

      if (state.stepIdx >= 3) {
        drawStepCard(
          218,
          state.stepIdx === 3,
          '4. Extraer el factor común binomial',
          `${ex.label} = ${ex.final}`,
          '¡Factorización completa!'
        );
      }

      readoutLine1.textContent = `${ex.label} = ${ex.group1} ${ex.group2} = ${ex.final}`;
      readoutLine2.textContent = `Producto maestro a·c = ${ac}; se parte ${ex.b}x en (${ex.m}x) + (${ex.n}x) para agrupar por parejas.`;
    } else {
      const tex = TREE_EXAMPLES[state.treeIdx];
      const info = factorQuadraticSteps(tex);

      info.checklist.forEach((chk, i) => {
        const y = 26 + i * 50;
        board.overlayLayer.appendChild(
          s('rect', {
            x: 46,
            y,
            width: 588,
            height: 44,
            rx: 6,
            fill: chk.matched
              ? 'rgba(129, 178, 154, 0.18)'
              : 'rgba(20, 30, 25, 0.55)',
            stroke: chk.matched ? 'var(--green)' : 'rgba(236, 242, 232, 0.14)',
            'stroke-width': chk.matched ? 1.8 : 1,
          })
        );
        board.overlayLayer.appendChild(
          s(
            'text',
            {
              x: 60,
              y: y + 18,
              fill: chk.matched ? 'var(--green)' : 'var(--muted)',
              'font-size': 11.5,
              'font-weight': 'bold',
            },
            `Paso ${chk.step}: ${chk.question}`
          )
        );
        board.overlayLayer.appendChild(
          s(
            'text',
            {
              x: 60,
              y: y + 35,
              fill: 'var(--ink)',
              'font-size': 12,
            },
            chk.detail
          )
        );
      });

      readoutLine1.textContent = `Resultado para ${formatPolynomialString(tex)}: ${info.factoredForm} (${info.strategyLabel})`;
      readoutLine2.textContent = `Raíces reales: ${info.roots.join(' y ')} · Factor común extraído: ${info.commonFactor}`;
    }
  }

  render();
  host.append(
    predictBox,
    modeRow,
    groupControlsWrap,
    stepButtonsWrap,
    treeControlsWrap,
    board.svg,
    readout
  );
  return { state, render };
}

export const initWidget = initAgrupacionEstrategia;
export default initAgrupacionEstrategia;
