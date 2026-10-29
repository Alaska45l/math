/**
 * constructor-v.js — Widget 5 (Sección 5):
 * «Laboratorio Maestro f(x) = a|x - h| + k» con Modo Exploración Libre (arrastrando nodos
 * y sliders persistentes) + Modo Desafío Inverso con 6 gráficas misteriosas variadas.
 */

import { h, mount, chalkIcon } from '../../../core/dom.js';
import { fmt } from '../../../core/math-format.js';
import { tryParseExpr, toDisplay } from '../expr.js';
import { createAbsBoard, annotatedAbsFormula } from '../components.js';
import {
  approxEq,
  formatCanonicalAbs,
  equivalentFx,
  diagnoseAbs,
} from '../logic.js';
import { DIAGNOSE_REACTIONS } from '../vn-scripts.js';
import { react } from '../../../core/vn.js';
import { playSuccess, playError } from '../../../core/sound.js';

const MYSTERY_CHALLENGES = [
  { a: 2, h: -1, k: -3, hintPoint: '(0; −1)' },
  { a: -1, h: 2, k: 4, hintPoint: '(3; 3)' },
  { a: -2, h: -2, k: 3, hintPoint: '(−1; 1)' },
  { a: 0.5, h: 1, k: -2, hintPoint: '(3; −1)' },
  { a: 3, h: -3, k: -4, hintPoint: '(−2; −1)' },
  { a: -0.5, h: 2, k: 3, hintPoint: '(4; 2)' },
];

export function initConstructorVWidget(container) {
  let state = {
    mode: 'explore', // 'explore' | 'inverse'
    a: -2,
    h: 1,
    k: 3,
    challengeIdx: 0,
    invFeedback: null,
  };

  // Persistent DOM for Explore Mode
  const exploreWrap = h('div');
  const exploreBoardSlot = h('div', { class: 'seq-plot-card' });
  const exploreFormulaSlot = h('div', { style: 'margin-top: 8px;' });
  const exploreStepsCard = h('div', { class: 'seq-check__card', style: 'margin-top: 8px;' });

  const valH = h('strong', { class: 'eq', style: 'color: var(--teal);' }, fmt(state.h));
  const valK = h('strong', { class: 'eq', style: 'color: var(--yellow);' }, fmt(state.k));
  const valA = h('strong', { class: 'eq', style: 'color: var(--pink);' }, fmt(state.a));

  const sliderH = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.h,
    'aria-label': 'Vértice horizontal h',
  });
  const sliderK = h('input', {
    type: 'range',
    min: -5,
    max: 5,
    step: 0.5,
    value: state.k,
    'aria-label': 'Vértice vertical k',
  });
  const sliderA = h('input', {
    type: 'range',
    min: -4,
    max: 4,
    step: 0.5,
    value: state.a,
    'aria-label': 'Apertura y signo a',
  });

  const annotatedApi = annotatedAbsFormula(exploreFormulaSlot, {
    fnName: 'f',
    a: state.a,
    h: state.h,
    k: state.k,
  });

  const exploreBoard = createAbsBoard(exploreBoardSlot, {
    a: state.a,
    h: state.h,
    k: state.k,
    xMin: -7,
    xMax: 7,
    yMin: -7,
    yMax: 7,
    snapStep: 0.5,
    draggableVertex: true,
    draggableSlope: true,
    showSymmetryAxis: true,
    showSlopeTriangle: true,
    onChange(next) {
      state.a = next.a;
      state.h = next.h;
      state.k = next.k;
      sliderH.value = String(state.h);
      sliderK.value = String(state.k);
      sliderA.value = String(state.a);
      syncExploreUI(false);
    },
  });

  sliderH.addEventListener('input', (e) => {
    state.h = parseFloat(e.target.value);
    syncExploreUI(true);
  });
  sliderK.addEventListener('input', (e) => {
    state.k = parseFloat(e.target.value);
    syncExploreUI(true);
  });
  sliderA.addEventListener('input', (e) => {
    let v = parseFloat(e.target.value);
    if (approxEq(v, 0)) v = state.a >= 0 ? -0.5 : 0.5;
    state.a = v;
    sliderA.value = String(state.a);
    syncExploreUI(true);
  });

  function syncExploreUI(updateBoard = true) {
    valH.textContent = fmt(state.h);
    valK.textContent = fmt(state.k);
    valA.textContent = fmt(state.a);

    if (updateBoard) {
      exploreBoard.update({ a: state.a, h: state.h, k: state.k });
    }
    annotatedApi.update({ a: state.a, h: state.h, k: state.k });

    const rightPointY = state.k + state.a;
    const leftPointY = state.k + state.a;
    mount(
      exploreStepsCard,
      h('p', { class: 'eq', style: 'margin: 0 0 6px; font-size: 1.08rem;' },
        'Receta geométrica en 2 pasos para ',
        h('strong', { style: 'color: var(--yellow);' }, `f(x) = ${formatCanonicalAbs(state.a, state.h, state.k)}`),
        ':'
      ),
      h('p', { class: 'small', style: 'margin: 0 0 4px;' },
        `1. Anclá el vértice en V(${fmt(state.h)}; ${fmt(state.k)}) y trazá el eje de simetría vertical x = ${fmt(state.h)}.`
      ),
      h('p', { class: 'small muted', style: 'margin: 0;' },
        `2. Desde el vértice caminá Δx = +1 a la derecha hasta (${fmt(state.h + 1)}; ${fmt(rightPointY)}) y Δx = −1 a la izquierda hasta (${fmt(state.h - 1)}; ${fmt(leftPointY)}) usando Δy = a = ${fmt(state.a)}.`
      )
    );
  }

  mount(
    exploreWrap,
    h('div', { class: 'seq-controls' },
      h('label', { class: 'field__label' }, 'Vértice h = ', valH, sliderH),
      h('label', { class: 'field__label' }, 'Vértice k = ', valK, sliderK),
      h('label', { class: 'field__label' }, 'Apertura a = ', valA, sliderA)
    ),
    exploreBoardSlot,
    exploreFormulaSlot,
    exploreStepsCard
  );

  // Persistent DOM for Inverse Challenge Mode
  const inverseWrap = h('div');
  const mysteryBtnsRow = h('div', { class: 'seq-controls' });
  const invBoardSlot = h('div', { class: 'seq-plot-card', style: 'flex: 1.3; min-width: 280px;' });
  const invPromptText = h('p', { class: 'small', style: 'margin: 0 0 8px;' });

  const inH = h('input', {
    type: 'number',
    class: 'seq-check__input-sm',
    placeholder: 'h',
    step: '0.5',
    'aria-label': 'Coordenada h del vértice misterioso',
  });
  const inK = h('input', {
    type: 'number',
    class: 'seq-check__input-sm',
    placeholder: 'k',
    step: '0.5',
    'aria-label': 'Coordenada k del vértice misterioso',
  });
  const inA = h('input', {
    type: 'number',
    class: 'seq-check__input-sm',
    placeholder: 'a',
    step: '0.5',
    'aria-label': 'Pendiente derecha a',
  });
  const inExpr = h('input', {
    type: 'text',
    class: 'seq-check__input',
    placeholder: 'ej. 2|x + 1| - 3',
    style: 'width: 100%; margin-top: 4px;',
    'aria-label': 'Fórmula canónica completa',
  });
  const previewExprEl = h('div', { class: 'small muted', style: 'min-height: 1.3em; margin-top: 4px;' });

  inExpr.addEventListener('input', () => {
    const raw = inExpr.value.trim();
    if (!raw) {
      mount(previewExprEl);
      return;
    }
    const parsed = tryParseExpr(raw);
    if (parsed.ok) {
      mount(previewExprEl, 'Interpretado como: ', h('strong', { class: 'eq' }, toDisplay(parsed.ast)));
    } else {
      mount(previewExprEl, h('span', { class: 'text-warn' }, 'Fórmula incompleta...'));
    }
  });

  const invFeedbackSlot = h('div');

  const invBoard = createAbsBoard(invBoardSlot, {
    a: MYSTERY_CHALLENGES[0].a,
    h: MYSTERY_CHALLENGES[0].h,
    k: MYSTERY_CHALLENGES[0].k,
    xMin: -6,
    xMax: 6,
    yMin: -6,
    yMax: 6,
    draggableVertex: false,
    draggableSlope: false,
    showSymmetryAxis: true,
    showSlopeTriangle: true,
  });

  const checkInverse = () => {
    const target = MYSTERY_CHALLENGES[state.challengeIdx];
    const targetExpr = formatCanonicalAbs(target.a, target.h, target.k);
    const valHNum = parseFloat(String(inH.value).replace(',', '.'));
    const valKNum = parseFloat(String(inK.value).replace(',', '.'));
    const valANum = parseFloat(String(inA.value).replace(',', '.'));
    const rawExpr = inExpr.value.trim();

    const parsed = tryParseExpr(rawExpr);
    if (!parsed.ok) {
      state.invFeedback = {
        ok: false,
        msg: 'Escribí una fórmula válida en el Paso 3 (por ejemplo: 2|x + 1| - 3).',
      };
      playError(1);
      syncInverseUI();
      return;
    }

    const okH = approxEq(valHNum, target.h);
    const okK = approxEq(valKNum, target.k);
    const okA = approxEq(valANum, target.a);
    const okExpr = equivalentFx(parsed.ast, targetExpr);

    if (okH && okK && okA && okExpr) {
      state.invFeedback = {
        ok: true,
        msg: `¡Impecable! Vértice (${fmt(target.h)}; ${fmt(target.k)}), apertura a = ${fmt(target.a)} y ecuación f(x) = ${targetExpr}.`,
      };
      playSuccess('normal');
      react({
        pose: 'orgullosa',
        tag: '¡Lectura inversa perfecta!',
        html: `¡Así se deduce una función mirando el gráfico! Identificaste el vértice en <span class="eq">(${fmt(target.h)}; ${fmt(target.k)})</span> y la pendiente <span class="eq">a = ${fmt(target.a)}</span> sin caer en la trampa de signo.`,
      });
    } else {
      const diags = diagnoseAbs(parsed.ast, target);
      const errMsg =
        diags[0]?.message ||
        (!okH || !okK
          ? `Revisá las coordenadas del vértice: mirá dónde está la punta amarilla en el gráfico.`
          : !okA
            ? `Revisá el coeficiente de apertura a: desde el vértice avanzá 1 unidad a la derecha y contá cuánto sube o baja.`
            : `La fórmula final no coincide con el vértice (${fmt(target.h)}; ${fmt(target.k)}) y pendiente a = ${fmt(target.a)}.`);

      state.invFeedback = { ok: false, msg: errMsg };
      playError(1);
      if (diags[0]?.id && DIAGNOSE_REACTIONS[diags[0].id]) {
        react(DIAGNOSE_REACTIONS[diags[0].id]);
      } else {
        react({
          pose: 'base',
          tag: 'Mirá el triángulo de pendiente',
          html: errMsg,
        });
      }
    }
    syncInverseUI();
  };

  function selectMystery(idx) {
    state.challengeIdx = idx;
    state.invFeedback = null;
    inH.value = '';
    inK.value = '';
    inA.value = '';
    inExpr.value = '';
    mount(previewExprEl);
    syncInverseUI();
  }

  function syncInverseUI() {
    const target = MYSTERY_CHALLENGES[state.challengeIdx];
    invBoard.update({ a: target.a, h: target.h, k: target.k });

    mount(
      mysteryBtnsRow,
      ...MYSTERY_CHALLENGES.map((ch, idx) =>
        h('button', {
          type: 'button',
          class: ['chip', state.challengeIdx === idx ? 'is-active' : ''],
          on: { click: () => selectMystery(idx) },
        }, `Misterio ${idx + 1}`)
      ),
      h('button', {
        type: 'button',
        class: 'btn',
        on: {
          click: () => {
            const nextIdx = (state.challengeIdx + 1) % MYSTERY_CHALLENGES.length;
            selectMystery(nextIdx);
          },
        },
      }, chalkIcon('reset'), ' Nueva gráfica misteriosa')
    );

    invPromptText.textContent = `Observá el vértice amarillo y el punto de paso ${target.hintPoint} en la rama derecha para deducir la ecuación:`;

    mount(
      invFeedbackSlot,
      state.invFeedback
        ? h('div', { class: ['notice', state.invFeedback.ok ? 'notice--ok' : 'notice--err'], style: 'margin-top: 8px;' },
            state.invFeedback.ok ? chalkIcon('check') : chalkIcon('cross'),
            h('span', null, state.invFeedback.msg)
          )
        : null
    );
  }

  const invFormCard = h('div', { class: 'seq-check__card', style: 'flex: 1; min-width: 260px;' },
    invPromptText,
    h('div', { style: 'margin-bottom: 8px;' },
      h('strong', { class: 'small' }, 'Paso 1 · Coordenadas del vértice (h; k):'),
      h('div', { class: 'seq-check__pair-grid', style: 'margin-top: 4px;' },
        h('label', { class: 'seq-check__pair-label' }, 'h = ', inH),
        h('label', { class: 'seq-check__pair-label' }, 'k = ', inK)
      )
    ),
    h('div', { style: 'margin-bottom: 8px;' },
      h('strong', { class: 'small' }, 'Paso 2 · Pendiente derecha a = Δy / Δx: '),
      inA
    ),
    h('div', { style: 'margin-bottom: 10px;' },
      h('strong', { class: 'small' }, 'Paso 3 · Fórmula completa f(x) = a|x − h| + k:'),
      inExpr,
      previewExprEl
    ),
    h('button', {
      type: 'button',
      class: 'btn btn--check',
      on: { click: checkInverse },
    }, 'Verificar deducción inversa'),
    invFeedbackSlot
  );

  mount(
    inverseWrap,
    mysteryBtnsRow,
    h('div', { class: 'seq-controls', style: 'align-items: stretch;' }, invBoardSlot, invFormCard)
  );

  // Mode switcher
  const btnModeExplore = h('button', {
    type: 'button',
    class: 'chip is-active',
    on: {
      click: () => {
        state.mode = 'explore';
        updateModeView();
      },
    },
  }, 'Modo 1: Exploración Libre (Arrastrá V y P)');

  const btnModeInverse = h('button', {
    type: 'button',
    class: 'chip',
    on: {
      click: () => {
        state.mode = 'inverse';
        updateModeView();
      },
    },
  }, 'Modo 2: Desafío Inverso (6 Gráficas Misteriosas)');

  const modeContentSlot = h('div');

  function updateModeView() {
    btnModeExplore.classList.toggle('is-active', state.mode === 'explore');
    btnModeInverse.classList.toggle('is-active', state.mode === 'inverse');
    if (state.mode === 'explore') {
      mount(modeContentSlot, exploreWrap);
      syncExploreUI(true);
    } else {
      mount(modeContentSlot, inverseWrap);
      syncInverseUI();
    }
  }

  mount(
    container,
    h('div', { class: 'seq-controls' }, btnModeExplore, btnModeInverse),
    modeContentSlot
  );

  updateModeView();
}
