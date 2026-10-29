/**
 * widgets/constructor-v.js — Widget interactivo para la Sección 5:
 * El Laboratorio Maestro: Graficar f(x) = a|x - h| + k en dos pasos (con nodos Vértice y Pendiente)
 * y Modo Desafío Inverso (De la Gráfica a la Ecuación).
 */

import { h, mount, chalkIcon } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { createAbsBoard, annotatedAbsFormula } from '../components.js';
import { tryParseExpr, equivalentFx } from '../expr.js';
import { approxEq, diagnoseAbs, formatCanonicalAbs } from '../logic.js';
import { playSuccess, playError } from '../../../core/sound.js';
import { react } from '../../../core/vn.js';
import { DIAGNOSE_REACTIONS } from '../vn-scripts.js';

const LAB_PRESETS = [
  { label: 'Repaso Khan 1: f(x) = |x − 1| + 5', a: 1, h: 1, k: 5 },
  { label: 'Repaso Khan 2: f(x) = −2|x| + 4', a: -2, h: 0, k: 4 },
  { label: 'Khan 3: f(x) = −1/2 |x − 4| + 3', a: -0.5, h: 4, k: 3 },
  { label: 'Khan 4: f(x) = 2|x + 3| − 4', a: 2, h: -3, k: -4 },
];

const MYSTERY_GRAPHS = [
  { a: -2, h: 1, k: 4, hint: 'Mirando el pico: está en (1; 4). Si avanzás 1 a la derecha (x = 2), bajás 2 unidades hasta y = 2.' },
  { a: 3, h: -2, k: -3, hint: 'El vértice está en (−2; −3). Si avanzás 1 a la derecha (x = −1), subís 3 unidades hasta y = 0.' },
  { a: -1, h: -3, k: 2, hint: 'El vértice está en (−3; 2) y abre hacia abajo con pendiente −1.' },
];

export function initConstructorVWidget(container) {
  let mode = 'explore'; // 'explore' | 'inverse'
  let aVal = -2;
  let hVal = 0;
  let kVal = 4;

  let mysteryIdx = 0;
  let userFormula = '';
  let inverseFeedback = null;

  function render() {
    const modeTabs = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', mode === 'explore' ? 'is-active' : ''],
        on: {
          click: () => {
            mode = 'explore';
            render();
          },
        },
      }, 'Laboratorio Libre (Manipular Vértice y Bisagra)'),
      h('button', {
        type: 'button',
        class: ['chip', mode === 'inverse' ? 'is-active' : ''],
        on: {
          click: () => {
            mode = 'inverse';
            inverseFeedback = null;
            render();
          },
        },
      }, 'Desafío Inverso (De la Gráfica a la Ecuación)')
    );

    if (mode === 'explore') {
      const presetBar = h('div', { class: 'seq-controls' },
        LAB_PRESETS.map((p) =>
          h('button', {
            type: 'button',
            class: ['chip', approxEq(p.a, aVal) && approxEq(p.h, hVal) && approxEq(p.k, kVal) ? 'is-active' : ''],
            on: {
              click: () => {
                aVal = p.a;
                hVal = p.h;
                kVal = p.k;
                render();
              },
            },
          }, p.label)
        )
      );

      const annotatedSlot = h('div', null);
      const annotatedCtrl = annotatedAbsFormula(annotatedSlot, {
        fnName: 'f',
        a: aVal,
        h: hVal,
        k: kVal,
      });

      const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.4; min-width: 280px;' });
      const stepCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 250px;' });

      function updateStepCard() {
        mount(
          stepCard,
          h('h3', { class: 'seq-sidebar__chapter-title' }, 'Protocolo de 2 Pasos en Vivo'),
          h('p', { class: 'eq', style: 'font-size: 1.35rem; color: var(--yellow); margin: 4px 0 10px;' },
            `f(x) = ${formatCanonicalAbs(aVal, hVal, kVal)}`
          ),
          h('div', { style: 'margin-bottom: 10px;' },
            h('strong', { style: 'color: var(--yellow);' }, `Paso 1 · Clavar el Vértice (h; k):`),
            h('p', { class: 'small', style: 'margin: 2px 0;' },
              `Lo de adentro se anula en x = ${fmt(hVal)} y la altura de partida es k = ${fmt(kVal)} → `,
              h('strong', null, `V(${fmt(hVal)}; ${fmt(kVal)})`),
              '.'
            )
          ),
          h('div', null,
            h('strong', { style: 'color: var(--blue);' }, `Paso 2 · Medir la Pendiente a = ${fmt(aVal)}:`),
            h('p', { class: 'small', style: 'margin: 2px 0;' },
              `Desde V(${fmt(hVal)}; ${fmt(kVal)}), caminá 1 unidad a la derecha (x = ${fmt(hVal + 1)}) y ${aVal >= 0 ? 'subí' : 'bajá'} ${fmt(Math.abs(aVal))} hasta `,
              h('strong', null, `(${fmt(hVal + 1)}; ${fmt(kVal + aVal)})`),
              `. Por simetría, a la izquierda pasa por (${fmt(hVal - 1)}; ${fmt(kVal + aVal)}).`
            )
          )
        );
      }

      createAbsBoard(boardSlot, {
        a: aVal,
        h: hVal,
        k: kVal,
        xMin: -7,
        xMax: 7,
        yMin: -7,
        yMax: 8,
        snapStep: 0.5,
        draggableVertex: true,
        draggableSlope: true,
        showGhostLine: true,
        onChange(next) {
          aVal = next.a;
          hVal = next.h;
          kVal = next.k;
          annotatedCtrl.update({ a: aVal, h: hVal, k: kVal });
          updateStepCard();
        },
      });

      updateStepCard();

      mount(
        container,
        modeTabs,
        presetBar,
        annotatedSlot,
        h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, stepCard)
      );
    } else {
      // Modo Desafío Inverso
      const target = MYSTERY_GRAPHS[mysteryIdx];
      const boardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.3; min-width: 280px;' });

      createAbsBoard(boardSlot, {
        a: target.a,
        h: target.h,
        k: target.k,
        xMin: -7,
        xMax: 7,
        yMin: -7,
        yMax: 7,
        draggableVertex: false,
        draggableSlope: false,
        showSlopeTriangles: true,
      });

      const inputEl = h('input', {
        type: 'text',
        class: 'seq-check__input',
        placeholder: 'ej. -2|x - 1| + 4',
        value: userFormula,
        on: {
          input: (e) => {
            userFormula = e.target.value;
          },
        },
      });

      const checkInverse = () => {
        const parsed = tryParseExpr(userFormula);
        if (!parsed.ok) {
          inverseFeedback = { ok: false, msg: parsed.error?.message || 'Expresión incompleta.' };
          playError(1);
          render();
          return;
        }
        const targetStr = formatCanonicalAbs(target.a, target.h, target.k);
        const isOk = equivalentFx(parsed.ast, targetStr);
        const diags = diagnoseAbs(parsed.ast, target);
        if (isOk) {
          playSuccess('normal');
          inverseFeedback = {
            ok: true,
            msg: `¡Impecable! La ecuación exacta de la gráfica es f(x) = ${targetStr}.`,
          };
          react({
            pose: 'orgullosa',
            tag: 'Ojo clínico',
            html: `¡Exacto! Leíste el vértice <span class="eq">(${fmt(target.h)}; ${fmt(target.k)})</span> y el triángulo de pendiente <span class="eq">a = ${fmt(target.a)}</span> como una profesional.`,
          });
        } else {
          playError(1);
          const diag = diags[0];
          inverseFeedback = {
            ok: false,
            msg: diag?.message || `No coincide con la gráfica. Pista: ${target.hint}`,
          };
          if (diag?.id && DIAGNOSE_REACTIONS[diag.id]) {
            react(DIAGNOSE_REACTIONS[diag.id]);
          }
        }
        render();
      };

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkInverse();
      });

      const mysterySelector = h('div', { class: 'seq-controls' },
        MYSTERY_GRAPHS.map((_, i) =>
          h('button', {
            type: 'button',
            class: ['chip', i === mysteryIdx ? 'is-active' : ''],
            on: {
              click: () => {
                mysteryIdx = i;
                userFormula = '';
                inverseFeedback = null;
                render();
              },
            },
          }, `Gráfica Misteriosa #${i + 1}`)
        )
      );

      const challengeCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 250px;' },
        h('h3', { class: 'seq-sidebar__chapter-title' }, `Deducí la Ecuación #${mysteryIdx + 1}`),
        h('p', { class: 'small' },
          'Observá las coordenadas del vértice amarillo V(h; k) y el triángulo punteado Δy / Δx = a. Escribí la fórmula f(x):'
        ),
        h('div', { class: 'seq-check__row' },
          inputEl,
          h('button', { type: 'button', class: 'btn btn--check', on: { click: checkInverse } }, 'Verificar')
        ),
        inverseFeedback
          ? h('div', { class: ['notice', inverseFeedback.ok ? 'notice--ok' : 'notice--err'], style: 'margin-top: 8px;' },
              inverseFeedback.ok ? chalkIcon('check') : chalkIcon('cross'),
              h('span', null, inverseFeedback.msg)
            )
          : null
      );

      mount(
        container,
        modeTabs,
        mysterySelector,
        h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, boardSlot, challengeCard)
      );
    }
  }

  render();
}
