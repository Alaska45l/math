/**
 * widgets/radiografia-abs.js — Widget interactivo para la Sección 7:
 * Radiografía Completa para Exactas: Imagen, Crecimiento/Decrecimiento, C₀/C⁺/C⁻,
 * Láser Horizontal de Ecuaciones a|x - h| + k = c y demostrador √(x²) = |x|.
 */

import { h, mount } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { createAbsBoard } from '../components.js';
import { analyzeAbs, solveAbsComparison, formatCanonicalAbs, approxEq } from '../logic.js';

const PRESETS = [
  { label: 'Sin solución en c=3: |x − 1| + 5', a: 1, h: 1, k: 5, laserY: 3 },
  { label: 'Dos raíces: |x − 1| − 3', a: 1, h: 1, k: -3, laserY: 0 },
  { label: 'Techo máximo: −2|x − 3| + 4', a: -2, h: 3, k: 4, laserY: 0 },
];

export function initRadiografiaAbsWidget(container) {
  let aVal = 1;
  let hVal = 1;
  let kVal = 5;
  let laserY = 3;
  let activeLens = 'laser'; // 'laser' | 'imagen' | 'monotonia' | 'signos' | 'raiz'
  let testXForSq = -5;

  function render() {
    const info = analyzeAbs(aVal, hVal, kVal);
    const eqSol = solveAbsComparison(aVal, hVal, kVal, '=', laserY);

    const presetBar = h('div', { class: 'seq-controls' },
      PRESETS.map((p) =>
        h('button', {
          type: 'button',
          class: ['chip', approxEq(p.a, aVal) && approxEq(p.h, hVal) && approxEq(p.k, kVal) ? 'is-active' : ''],
          on: {
            click: () => {
              aVal = p.a;
              hVal = p.h;
              kVal = p.k;
              laserY = p.laserY;
              render();
            },
          },
        }, p.label)
      )
    );

    const lenses = [
      { id: 'laser', label: 'Láser de Ecuación f(x) = c' },
      { id: 'imagen', label: 'Dominio e Imagen (Rango)' },
      { id: 'monotonia', label: 'Crecimiento I↑ y Decrecimiento I↓' },
      { id: 'signos', label: 'Ceros C₀, Positividad C⁺ y C⁻' },
      { id: 'raiz', label: 'Identidad √(x²) = |x|' },
    ];

    const lensBar = h('div', { class: 'seq-controls' },
      lenses.map((l) =>
        h('button', {
          type: 'button',
          class: ['chip', activeLens === l.id ? 'is-active' : ''],
          on: {
            click: () => {
              activeLens = l.id;
              render();
            },
          },
        }, l.label)
      )
    );

    const slidersRow = h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' },
        `Altura del láser horizontal c (${fmt(laserY)}): `,
        h('input', {
          type: 'range',
          min: '-6',
          max: '7',
          step: '0.5',
          value: String(laserY),
          on: {
            input: (e) => {
              laserY = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      ),
      h('label', { class: 'field__label' },
        `Piso/Techo k (${fmt(kVal)}): `,
        h('input', {
          type: 'range',
          min: '-5',
          max: '6',
          step: '1',
          value: String(kVal),
          on: {
            input: (e) => {
              kVal = parseFloat(e.target.value) || 0;
              render();
            },
          },
        })
      )
    );

    const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.35; min-width: 280px;' });
    createAbsBoard(boardSlot, {
      a: aVal,
      h: hVal,
      k: kVal,
      laserY,
      xMin: -6,
      xMax: 8,
      yMin: -6,
      yMax: 8,
      snapStep: 0.5,
      draggableVertex: true,
      draggableSlope: true,
      showHorizontalLaser: true,
      onChange(next) {
        aVal = next.a;
        hVal = next.h;
        kVal = next.k;
        laserY = next.laserY;
        render();
      },
    });

    // Tarjeta lateral según lente activo
    let lensDetail;
    if (activeLens === 'laser') {
      lensDetail = h('div', null,
        h('h3', { class: 'seq-sidebar__chapter-title' }, `Ecuación con Módulo: ${formatCanonicalAbs(aVal, hVal, kVal)} = ${fmt(laserY)}`),
        h('p', { class: 'small', style: eqSol.solutions.length > 0 ? 'color: var(--green); font-weight: bold;' : 'color: var(--pink); font-weight: bold;' },
          eqSol.caseType === 'no_solution'
            ? '0 intersecciones (Conjunto vacío ∅): el láser pasa sin tocar la «V».'
            : eqSol.caseType === 'vertex_only'
            ? `1 única solución en el vértice: S = ${eqSol.intervalText}`
            : `2 soluciones simétricas respecto de x = ${fmt(hVal)}: S = ${eqSol.intervalText}`
        ),
        h('div', { class: 'seq-steps-box small' },
          ...eqSol.steps.map((st) => h('p', { style: 'margin: 4px 0;' }, `• ${st}`))
        )
      );
    } else if (activeLens === 'imagen') {
      lensDetail = h('div', null,
        h('h3', { class: 'seq-sidebar__chapter-title' }, 'Dominio e Imagen (Rango en Eje Y)'),
        h('p', { class: 'small' }, h('strong', null, 'Dominio: '), 'Todos los reales ℝ = (−∞; +∞).'),
        h('p', { class: 'small' },
          h('strong', { style: 'color: var(--yellow);' }, 'Imagen (Rango): '),
          h('span', { class: 'eq', style: 'font-size: 1.2rem;' }, info.range.text)
        ),
        h('p', { class: 'small muted' },
          aVal > 0
            ? `Como a = ${fmt(aVal)} > 0, el vértice k = ${fmt(kVal)} es el piso mínimo absoluto.`
            : `Como a = ${fmt(aVal)} < 0, el vértice k = ${fmt(kVal)} es el techo máximo absoluto.`
        )
      );
    } else if (activeLens === 'monotonia') {
      lensDetail = h('div', null,
        h('h3', { class: 'seq-sidebar__chapter-title' }, 'Crecimiento y Decrecimiento (¡Siempre en Eje X!)'),
        h('p', { class: 'small' },
          h('strong', { style: 'color: var(--blue);' }, 'Intervalo de Crecimiento (I↑): '),
          h('span', { class: 'eq' }, info.increasing)
        ),
        h('p', { class: 'small' },
          h('strong', null, 'Intervalo de Decrecimiento (I↓): '),
          h('span', { class: 'eq' }, info.decreasing)
        ),
        h('div', { class: 'notice notice--err small', style: 'margin-top: 8px;' },
          `¡Atención de examen! El cambio de pendiente ocurre en la coordenada X del vértice (h = ${fmt(hVal)}), jamás en la altura k = ${fmt(kVal)}.`
        )
      );
    } else if (activeLens === 'signos') {
      lensDetail = h('div', null,
        h('h3', { class: 'seq-sidebar__chapter-title' }, 'Raíces (C₀), Positividad (C⁺) y Negatividad (C⁻)'),
        h('p', { class: 'small' },
          h('strong', { style: 'color: var(--yellow);' }, 'Conjunto de Ceros (C₀): '),
          info.roots.length === 0 ? '∅ (no corta al eje X)' : `{${info.roots.map((r) => fmt(r)).join('; ')}}`
        ),
        h('p', { class: 'small' },
          h('strong', { style: 'color: var(--blue);' }, 'Conjunto de Positividad C⁺ (f(x) > 0): '),
          h('span', { class: 'eq' }, info.positivity)
        ),
        h('p', { class: 'small' },
          h('strong', null, 'Conjunto de Negatividad C⁻ (f(x) < 0): '),
          h('span', { class: 'eq' }, info.negativity)
        )
      );
    } else {
      const sqVal = testXForSq * testXForSq;
      const rootVal = Math.sqrt(sqVal);
      lensDetail = h('div', null,
        h('h3', { class: 'seq-sidebar__chapter-title' }, 'La Identidad Universal: √(x²) = |x|'),
        h('label', { class: 'field__label small' },
          `Probá un número negativo o positivo x (${fmt(testXForSq)}): `,
          h('input', {
            type: 'range',
            min: '-8',
            max: '8',
            step: '1',
            value: String(testXForSq),
            on: {
              input: (e) => {
                testXForSq = parseFloat(e.target.value) || -5;
                render();
              },
            },
          })
        ),
        h('p', { class: 'eq', style: 'font-size: 1.25rem; margin: 10px 0; color: var(--green);' },
          `√((${fmt(testXForSq)})²) = √(${fmt(sqVal)}) = +${fmt(rootVal)} = |${fmt(testXForSq)}|`
        ),
        h('p', { class: 'small muted' },
          testXForSq < 0
            ? `¡Viste! Si hubieras simplificado el cuadrado con la raíz diciendo que da x = ${fmt(testXForSq)}, habrías dicho que una raíz cuadrada real da negativa. Por eso √(x²) = |x|.`
            : 'Para valores positivos o cero coincide con x, pero las barras son obligatorias para cubrir todo ℝ.'
        )
      );
    }

    const sideCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 260px;' }, lensDetail);

    mount(
      container,
      presetBar,
      lensBar,
      slidersRow,
      h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, sideCard)
    );
  }

  render();
}
