/**
 * escalado-rama.js — Widget 4 (Sección 4):
 * «Control de Apertura y Reflexión a·|x|» + Comparador «Menos afuera −|x| vs Menos adentro |−x|».
 * Mantiene persistentes todos los sliders y el pizarrón SVG durante el arrastre.
 */

import { h, s, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard, formatNumOrFracNode } from '../components.js';
import { approxEq, formatCanonicalAbs } from '../logic.js';

export function initEscaladoRamaWidget(container) {
  let state = {
    a: 2,
    sampleX: -3,
  };

  const presets = [
    { labelNode: 'a = 1 (estándar)', val: 1 },
    { labelNode: 'a = 3 (angosta ↑)', val: 3 },
    {
      labelNode: h('span', { style: 'display: inline-flex; align-items: center; gap: 4px;' },
        'a = ',
        formatNumOrFracNode(0.5),
        ' (ancha ↑)'
      ),
      val: 0.5,
    },
    { labelNode: 'a = −1 (espejo ↓)', val: -1 },
    { labelNode: 'a = −2 (angosta ↓)', val: -2 },
    {
      labelNode: h('span', { style: 'display: inline-flex; align-items: center; gap: 4px;' },
        'a = ',
        formatNumOrFracNode(-0.5),
        ' (ancha ↓)'
      ),
      val: -0.5,
    },
  ];

  const boardSlot = h('div', { class: 'seq-plot-card' });
  const readoutCard = h('div', { class: 'seq-check__card', style: 'margin-top: 8px;' });
  const comparatorWrap = h('div', { style: 'margin-top: 12px;' });

  const valA = h('strong', { class: 'eq', style: 'color: var(--pink); display: inline-flex; align-items: center; margin: 0 4px;' });
  const sliderA = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 0.5,
    value: state.a,
    'aria-label': 'Coeficiente de apertura y signo a',
  });

  const valSampleX = h('strong', { class: 'eq', style: 'color: var(--teal);' }, fmt(state.sampleX));
  const sliderSampleX = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 1,
    value: state.sampleX,
    'aria-label': 'Valor de prueba x para comparar −|x| versus |−x|',
  });

  const presetBtns = presets.map((p) =>
    h('button', {
      type: 'button',
      class: 'chip',
      on: {
        click: () => {
          state.a = p.val;
          sliderA.value = String(state.a);
          syncUI(true);
        },
      },
    }, p.labelNode)
  );

  const board = createAbsBoard(boardSlot, {
    a: state.a,
    h: 0,
    k: 0,
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    snapStep: 0.5,
    draggableVertex: false,
    draggableSlope: true,
    showSlopeTriangle: true,
    showSymmetryAxis: true,
    showReflectionGhost: false,
    customUnderRender(plane, props) {
      const ox = plane.sx(0);
      const oy = plane.sy(0);
      plane.layers.under.append(
        // Referencia madre |x|
        s('polyline', {
          points: `${plane.sx(-6)},${plane.sy(6)} ${ox},${oy} ${plane.sx(6)},${plane.sy(6)}`,
          fill: 'none',
          stroke: 'var(--chalk-dim)',
          'stroke-width': '1.6',
          'stroke-dasharray': '4 4',
        }),
        s('text', {
          x: plane.sx(4.3),
          y: plane.sy(4.8),
          fill: 'var(--muted)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, 'Ref: |x| (a = 1)'),
        // Triángulo unitario rama izquierda (Δx = -1, Δy = a => m_izq = -a)
        s('polyline', {
          points: `${ox},${oy} ${plane.sx(-1)},${oy} ${plane.sx(-1)},${plane.sy(props.a)}`,
          fill: 'rgba(137, 180, 250, 0.10)',
          stroke: 'var(--blue)',
          'stroke-width': '1.5',
          'stroke-dasharray': '3 3',
        }),
        s('text', {
          x: plane.sx(-1.15),
          y: (oy + plane.sy(props.a)) / 2 + 4,
          'text-anchor': 'end',
          fill: 'var(--blue)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 13px)',
        }, `m_izq = ${fmt(-props.a)}`)
      );
    },
    onChange(next) {
      state.a = next.a;
      sliderA.value = String(state.a);
      syncUI(false);
    },
  });

  sliderA.addEventListener('input', (e) => {
    let nextA = parseFloat(e.target.value);
    if (approxEq(nextA, 0)) {
      nextA = state.a >= 0 ? -0.5 : 0.5;
    }
    state.a = nextA;
    sliderA.value = String(state.a);
    syncUI(true);
  });

  sliderSampleX.addEventListener('input', (e) => {
    state.sampleX = parseFloat(e.target.value);
    syncUI(false);
  });

  function syncUI(updateBoard = true) {
    mount(valA, formatNumOrFracNode(state.a));
    valSampleX.textContent = fmt(state.sampleX);

    presetBtns.forEach((btn, idx) => {
      btn.classList.toggle('is-active', approxEq(state.a, presets[idx].val));
    });

    if (updateBoard) {
      board.update({ a: state.a });
    }

    const absA = Math.abs(state.a);
    const widthDesc = approxEq(absA, 1)
      ? 'apertura estándar (45° respecto a los ejes)'
      : absA > 1
        ? `más angosta y empinada (estiramiento vertical ×${fmt(absA)})`
        : `más ancha y suave (compresión vertical ×${fmt(absA)})`;

    const signDesc = state.a > 0
      ? 'abre hacia arriba (forma V) — el vértice (0; 0) es el MÍNIMO absoluto'
      : 'se refleja hacia abajo (forma ∧) — el vértice (0; 0) es el MÁXIMO absoluto';

    mount(
      readoutCard,
      h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.1rem;' },
        'Función actual: ',
        h('strong', { style: 'color: var(--yellow);' }, `f(x) = ${formatCanonicalAbs(state.a, 0, 0)}`),
        `  ·  Pendiente derecha: m = ${state.a > 0 ? `+${fmt(state.a)}` : fmt(state.a)}`,
        `  ·  Pendiente izquierda: m = ${-state.a > 0 ? `+${fmt(-state.a)}` : fmt(-state.a)}`
      ),
      h('p', { class: 'small muted', style: 'margin: 0;' },
        `Efecto geométrico: ${signDesc}; ${widthDesc}.`
      )
    );

    const sxVal = state.sampleX;
    const insideMinusVal = Math.abs(-sxVal);
    const outsideMinusVal = -Math.abs(sxVal);

    mount(
      comparatorWrap,
      h('div', { class: 'seq-check__card', style: 'border-style: dashed;' },
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;' },
          h('strong', { style: 'color: var(--yellow); font-family: var(--font-hand); font-size: 1.25rem;' },
            'Comparador de Signos: «Menos Adentro |−x|» vs. «Menos Afuera −|x|»'
          ),
          h('label', { class: 'field__label' },
            'Probar con x = ',
            valSampleX,
            sliderSampleX
          )
        ),
        h('div', { class: 'va-comparator-grid' },
          h('div', { class: 'va-comparator-col', style: 'border-color: rgba(148, 226, 213, 0.35);' },
            h('strong', { class: 'eq', style: 'color: var(--teal); font-size: 1.1rem; display: block; margin-bottom: 4px;' },
              'Caso A: Menos ADENTRO  g(x) = |−x|'
            ),
            h('p', { class: 'eq', style: 'margin: 4px 0;' },
              `g(${fmt(sxVal)}) = |−(${fmt(sxVal)})| = |${fmt(-sxVal)}| = `,
              h('strong', { style: 'color: var(--green); font-size: 1.15rem;' }, fmt(insideMinusVal))
            ),
            h('p', { class: 'small muted', style: 'margin: 0;' },
              'Las barras absorben el signo menos interno: |−x| = |x| ≥ 0 para todo x. ¡La «V» sigue abriendo hacia arriba!'
            )
          ),
          h('div', { class: 'va-comparator-col', style: 'border-color: rgba(242, 143, 173, 0.35);' },
            h('strong', { class: 'eq', style: 'color: var(--pink); font-size: 1.1rem; display: block; margin-bottom: 4px;' },
              'Caso B: Menos AFUERA  h(x) = −|x|'
            ),
            h('p', { class: 'eq', style: 'margin: 4px 0;' },
              `h(${fmt(sxVal)}) = −|${fmt(sxVal)}| = −(${fmt(Math.abs(sxVal))}) = `,
              h('strong', { style: 'color: var(--pink); font-size: 1.15rem;' }, fmt(outsideMinusVal))
            ),
            h('p', { class: 'small muted', style: 'margin: 0;' },
              'El menos está afuera esperando el resultado positivo de las barras y lo invierte hacia abajo: −|x| ≤ 0 (forma ∧).'
            )
          )
        )
      )
    );
  }

  mount(
    container,
    h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        'Coeficiente a = ',
        valA,
        sliderA
      ),
      ...presetBtns
    ),
    boardSlot,
    readoutCard,
    comparatorWrap
  );

  syncUI(false);
}
