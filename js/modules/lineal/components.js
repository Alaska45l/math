/**
 * @file js/modules/lineal/components.js
 * Componentes transversales para Unidad 03 · Función Lineal:
 * annotatedLinearFormula, threeFormsStrip, createPiecewiseLinearPreview,
 * createCheckBlock (8-tupla + diagnóstico + bloqueo independiente), bindTutorButtons,
 * mountProgress y mountCompetencyDashboard.
 */

import { h, s, clear, frac, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import {
  MINUS,
  ratToNumber,
  fmtRat,
  fmtNumberEsAR,
  convertLinearForms,
  equivalentLineEquation,
  parseNumberOrFraction,
  parseOrderedPair,
  parseExactRadical,
  exactRadicalEq,
  equivalentSetExactas,
  evalPiecewiseLinear,
  analyzePiecewiseLinear,
  diagnoseLinear,
} from './logic.js';
import { VN_SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { LIN_COMPETENCIES, LIN_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';
import { recordLinearAttempt, getLinearCompetencyReport } from './learning-adapter.js';
import {
  createLineBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  attachSvgDrag,
  createPredictBox,
  clampPx,
} from './widgets/board-kit.js';

export const PROGRESS_KEY = 'lineal:progreso:v1';

const dashboardRenderers = new Set();
export function notifyCompetencyDashboardUpdate() {
  dashboardRenderers.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

let globalStreak = 0;

export function getProgress() {
  try {
    if (typeof localStorage === 'undefined' || !localStorage.getItem) return {};
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return {};
  } catch {
    return {};
  }
}

export function saveProgress(itemId, status = 'independent') {
  const state = getProgress();
  state[itemId] = status;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {}
  notifyCompetencyDashboardUpdate();
  return state;
}

export function markSectionCompleted(sectionId) {
  try {
    const state = getProgress();
    state[sectionId] = true;
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {}
}

export function getGlobalStreak() {
  return globalStreak;
}

export function setGlobalStreak(val = 0) {
  globalStreak = val;
  return globalStreak;
}

function triggerVnReaction(vn, pose, text, tag = 'Modo Alaska') {
  if (vn && typeof vn.react === 'function') {
    vn.react(pose, text);
  } else {
    react({ pose: pose || 'pensativa', tag, html: text });
  }
}

function triggerVnScript(vn, script, title = '') {
  if (vn && typeof vn.play === 'function') {
    vn.play(script, title);
  } else {
    playScript(script);
  }
}

const TOKEN_NOTES = {
  m: {
    label: 'Pendiente m = Δy / Δx',
    note: 'Tasa de cambio constante: indica cuántas unidades sube (m > 0) o baja (m < 0) la recta por cada 1 unidad que avanzás en x hacia la derecha. También coincide con tg(α).',
  },
  b: {
    label: 'Ordenada al origen b = f(0)',
    note: 'Altura exacta donde la recta corta al eje vertical Y: punto (0; b). En problemas reales marca el valor inicial en t = 0.',
  },
  aSeg: {
    label: 'Abscisa al origen a (raíz C₀)',
    note: 'Corte exacto con el eje horizontal X: punto (a; 0). Solo aparece en la forma segmentaria x/a + y/b = 1 cuando la recta no es horizontal ni pasa por (0; 0).',
  },
  bSeg: {
    label: 'Ordenada al origen b en segmentaria',
    note: 'Corte exacto con el eje vertical Y: punto (0; b). En la segmentaria divide siempre a la variable y, igualado a 1.',
  },
  A: {
    label: 'Coeficiente A de x (implícita)',
    note: 'En Ax + By + C = 0 no es la pendiente directa: si B ≠ 0, la pendiente despejada resulta m = −A / B.',
  },
  B: {
    label: 'Coeficiente B de y (implícita)',
    note: 'Si B = 0 y A ≠ 0, la ecuación se reduce a Ax + C = 0, es decir una recta vertical x = −C/A (sin forma explícita).',
  },
  C: {
    label: 'Término independiente C (implícita)',
    note: 'Controla el paso por el origen: si C = 0, la recta cruza (0; 0) y no admite forma segmentaria.',
  },
};

export function annotatedLinearFormula(spec = {}) {
  const form = spec.form || 'explicit';
  const forms = convertLinearForms({
    m: spec.m ?? -2 / 3,
    b: spec.b ?? 2,
    ...(spec.A !== undefined ? { A: spec.A, B: spec.B, C: spec.C } : {}),
  });

  const wrap = h('div', { class: 'lin-annotated-formula' });
  const eqLine = h('div', { class: 'lin-annotated-eq eq' });
  const readout = h('div', { class: 'lin-annotated-note' }, [
    chalkIcon('spark', 15),
    h('span', {}, ' Tocá o pasá el cursor sobre cada pieza resaltada para ver su rol geométrico.'),
  ]);

  const makeToken = (key, contentNodes, colorClass = 'tok-yellow') => {
    const info = TOKEN_NOTES[key] || TOKEN_NOTES.m;
    const btn = h(
      'button',
      {
        type: 'button',
        class: `lin-formula-token ${colorClass}`,
        'data-token': key,
        'aria-label': info.label,
      },
      contentNodes
    );
    const show = () => {
      clear(readout);
      readout.append(
        chalkIcon('bulb', 15),
        h('strong', {}, ` ${info.label}: `),
        h('span', {}, info.note)
      );
    };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('click', () => {
      playClick();
      show();
    });
    return btn;
  };

  if (form === 'implicit') {
    const { A, B, C } = forms.canonical;
    eqLine.append(
      makeToken('A', [fmtRat(A)], 'tok-blue'),
      h('span', {}, 'x '),
      h('span', {}, B.n >= 0 ? '+ ' : `${MINUS} `),
      makeToken('B', [fmtRat({ n: Math.abs(B.n), d: B.d })], 'tok-yellow'),
      h('span', {}, 'y '),
      h('span', {}, C.n >= 0 ? '+ ' : `${MINUS} `),
      makeToken('C', [fmtRat({ n: Math.abs(C.n), d: C.d })], 'tok-pink'),
      h('span', {}, ' = 0')
    );
  } else if (form === 'segmentary' && forms.segmentary.valid) {
    eqLine.append(
      frac(h('span', {}, 'x'), makeToken('aSeg', [fmtRat(forms.segmentary.a)], 'tok-green')),
      h('span', {}, ' + '),
      frac(h('span', {}, 'y'), makeToken('bSeg', [fmtRat(forms.segmentary.b)], 'tok-pink')),
      h('span', {}, ' = 1')
    );
  } else {
    const m = forms.explicit.m;
    const b = forms.explicit.b;
    eqLine.append(
      h('span', {}, 'f(x) = '),
      makeToken('m', [fmtRat(m)], 'tok-yellow'),
      h('span', {}, '·x'),
      h('span', {}, b.n >= 0 ? ' + ' : ` ${MINUS} `),
      makeToken('b', [fmtRat({ n: Math.abs(b.n), d: b.d })], 'tok-pink')
    );
  }

  wrap.append(eqLine, readout);
  return wrap;
}

export function threeFormsStrip(spec = { A: 2, B: 3, C: -6 }) {
  const forms = convertLinearForms(spec);
  const strip = h('div', { class: 'lin-rosetta-strip' });

  strip.append(
    h('div', { class: 'lin-rosetta-card is-explicit' }, [
      h('div', { class: 'lin-rosetta-head' }, '1. Forma Explícita'),
      h('div', { class: 'lin-rosetta-eq eq' }, forms.explicit.text),
      h(
        'div',
        { class: 'lin-rosetta-gift' },
        forms.explicit.valid
          ? `Regala pendiente m = ${fmtRat(forms.explicit.m)} y ordenada b = ${fmtRat(forms.explicit.b)}`
          : forms.explicit.reason
      ),
    ]),
    h('div', { class: 'lin-rosetta-card is-implicit' }, [
      h('div', { class: 'lin-rosetta-head' }, '2. Forma Implícita'),
      h('div', { class: 'lin-rosetta-eq eq' }, forms.implicit.text),
      h(
        'div',
        { class: 'lin-rosetta-gift' },
        'Universal en ℝ²: representa cualquier recta, incluida vertical x = k y paso por (0; 0).'
      ),
    ]),
    h('div', { class: 'lin-rosetta-card is-segmentary' }, [
      h('div', { class: 'lin-rosetta-head' }, '3. Forma Segmentaria'),
      h('div', { class: 'lin-rosetta-eq eq' }, forms.segmentary.text),
      h(
        'div',
        { class: 'lin-rosetta-gift' },
        forms.segmentary.valid
          ? `Regala ambos cortes: raíz (${fmtRat(forms.segmentary.a)}; 0) y ordenada (0; ${fmtRat(forms.segmentary.b)})`
          : forms.segmentary.reason
      ),
    ])
  );

  return strip;
}

/**
 * Simulador interactivo de Modelización y Función Lineal por Tramos para Sec. 5 (tramos-lineal).
 */
export function createPiecewiseLinearPreview(host) {
  if (!host) return null;

  const PRESETS = [
    {
      id: 'ej10',
      label: 'UNMDP Ej. 10 (3 tramos)',
      desc: 'f(x) = −2x−1 (x<0) | 3 (0≤x<4) | (1/2)x+3 (x≥4)',
      bounds: { xMin: -4, xMax: 8, yMin: -3, yMax: 9 },
      pieces: [
        { m: -2, b: -1, minX: -Infinity, maxX: 0, minInclusive: false, maxInclusive: false },
        { m: 0, b: 3, minX: 0, maxX: 4, minInclusive: true, maxInclusive: false },
        { m: 0.5, b: 3, minX: 4, maxX: Infinity, minInclusive: true, maxInclusive: false },
      ],
      probeInit: 0,
    },
    {
      id: 'tariff_step',
      label: 'Ampliación: Tarifa escalonada con salto',
      desc: 'f(x) = 2 (0≤x<2) | 4 (2≤x<5) | x+1 (x≥5)',
      bounds: { xMin: -1, xMax: 8, yMin: -1, yMax: 9 },
      pieces: [
        { m: 0, b: 2, minX: 0, maxX: 2, minInclusive: true, maxInclusive: false },
        { m: 0, b: 4, minX: 2, maxX: 5, minInclusive: true, maxInclusive: false },
        { m: 1, b: 1, minX: 5, maxX: Infinity, minInclusive: true, maxInclusive: false },
      ],
      probeInit: 2,
    },
    {
      id: 'continuous_join',
      label: 'Ampliación: Tramos empalmados continuos',
      desc: 'f(x) = x+2 (x≤1) | −x+4 (x>1)',
      bounds: { xMin: -4, xMax: 8, yMin: -3, yMax: 7 },
      pieces: [
        { m: 1, b: 2, minX: -Infinity, maxX: 1, minInclusive: false, maxInclusive: true },
        { m: -1, b: 4, minX: 1, maxX: Infinity, minInclusive: false, maxInclusive: false },
      ],
      probeInit: 1,
    },
    {
      id: 'represa',
      label: 'UNMDP Ej. 9: Represa y = 1056 − 12x (en cientos L)',
      desc: 'Escala y en cientos de litros (10,56 = 1056 L; x en días/10): y = 10,56 − 1,2x en [0; 8,8]',
      bounds: { xMin: -1, xMax: 10, yMin: -1, yMax: 12 },
      pieces: [
        { m: -1.2, b: 10.56, minX: 0, maxX: 8.8, minInclusive: true, maxInclusive: true },
      ],
      probeInit: 4,
    },
  ];

  const state = {
    presetId: 'ej10',
    probeX: 0,
  };

  const predictBox = createPredictBox({
    prompt:
      'En el Ejercicio 10 del apunte (−2x−1 si x<0; 3 si 0≤x<4; x/2+3 si x≥4), ¿el número −1 pertenece a la Imagen de f?',
    options: [
      {
        label: 'Sí, pertenece porque el tramo izquierdo llega a −1 en x = 0, así que Im = [−1; +∞).',
        correct: false,
        explanation:
          '¡Cuidado! El tramo izquierdo vale solo para x < 0 (estricto), así que en (0; −1) hay un círculo hueco y ningún x alcanza exactamente altura −1.',
      },
      {
        label: 'No pertenece: como x < 0 es estricto, −1 es un extremo abierto y la imagen es (−1; +∞).',
        correct: true,
        explanation:
          '¡Exacto! f(0) salta al tramo del medio dando f(0) = 3. El valor −1 queda excluido como borde abierto: Im(f) = (−1; +∞).',
      },
      {
        label: 'La imagen es solo [3; +∞) porque en x = 0 vale 3.',
        correct: false,
        explanation:
          'El tramo izquierdo −2x − 1 para x < 0 toma valores entre −1 y +∞ (por ejemplo f(−0,2) = −0,6), así que cubre (−1; +∞).',
      },
    ],
    onVerify: () => {
      state.presetId = 'ej10';
      state.probeX = 0;
      update();
    },
  });

  const presetsRow = h('div', { class: 'pr-presets' });
  const presetBtns = PRESETS.map((pr) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, pr.label);
    btn.addEventListener('click', () => {
      playClick();
      state.presetId = pr.id;
      state.probeX = pr.probeInit;
      predictBox.notifyInteraction();
      update();
    });
    presetsRow.appendChild(btn);
    return { id: pr.id, btn };
  });

  const board = createLineBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Visualizador interactivo de función lineal por tramos con sonda vertical',
  });

  const probeLine = s('line', { stroke: 'rgba(230, 211, 138, 0.5)', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' });
  const piecesGroup = s('g', { class: 'lin-pieces-group' });
  const endpointsGroup = s('g', { class: 'lin-endpoints-group' });
  const probeDot = s('circle', { r: 6.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const probeHandle = s('circle', { r: 9, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const probeLabel = s('text', { fill: 'var(--yellow)', 'font-size': 11.5, 'font-weight': 'bold' });

  board.clippedLayer.append(probeLine, piecesGroup);
  board.overlayLayer.append(endpointsGroup, probeDot, probeHandle, probeLabel);

  const readout = h('div', { class: 'pr-readout lin-readout', 'aria-live': 'polite' });
  let currentMapper = createCartesianMapper(board.plotBox, PRESETS[0].bounds);

  function update() {
    const preset = PRESETS.find((p) => p.id === state.presetId) || PRESETS[0];
    presetBtns.forEach(({ id, btn }) => btn.classList.toggle('is-active', id === preset.id));

    currentMapper = createCartesianMapper(board.plotBox, preset.bounds);
    drawCartesianAxes(board.gridLayer, currentMapper, { xStep: 1, yStep: 1 });

    clear(piecesGroup);
    clear(endpointsGroup);
    const colors = ['var(--blue)', 'var(--green)', 'var(--pink)'];

    preset.pieces.forEach((p, idx) => {
      const col = colors[idx % colors.length];
      const xStart = Number.isFinite(p.minX) ? p.minX : currentMapper.xMin;
      const xEnd = Number.isFinite(p.maxX) ? p.maxX : currentMapper.xMax;
      if (xEnd >= currentMapper.xMin && xStart <= currentMapper.xMax) {
        const yStart = p.m * xStart + p.b;
        const yEnd = p.m * xEnd + p.b;
        piecesGroup.appendChild(
          s('line', {
            x1: currentMapper.toX(xStart).toFixed(2),
            y1: currentMapper.toY(yStart).toFixed(2),
            x2: currentMapper.toX(xEnd).toFixed(2),
            y2: currentMapper.toY(yEnd).toFixed(2),
            stroke: col,
            'stroke-width': 2.8,
            'stroke-linecap': 'round',
          })
        );
      }

      if (Number.isFinite(p.minX)) {
        const py = p.m * p.minX + p.b;
        endpointsGroup.appendChild(
          s('circle', {
            cx: currentMapper.toX(p.minX).toFixed(1),
            cy: currentMapper.toY(py).toFixed(1),
            r: 5,
            fill: p.minInclusive ? col : 'var(--bg)',
            stroke: col,
            'stroke-width': 2.2,
          })
        );
      }
      if (Number.isFinite(p.maxX)) {
        const py = p.m * p.maxX + p.b;
        endpointsGroup.appendChild(
          s('circle', {
            cx: currentMapper.toX(p.maxX).toFixed(1),
            cy: currentMapper.toY(py).toFixed(1),
            r: 5,
            fill: p.maxInclusive ? col : 'var(--bg)',
            stroke: col,
            'stroke-width': 2.2,
          })
        );
      }
    });

    const probePx = clampPx(currentMapper.toX(state.probeX), board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 8);
    probeLine.setAttribute('x1', probePx.toFixed(1));
    probeLine.setAttribute('y1', board.plotBox.y);
    probeLine.setAttribute('x2', probePx.toFixed(1));
    probeLine.setAttribute('y2', board.plotBox.y + board.plotBox.h);

    probeHandle.setAttribute('cx', probePx.toFixed(1));
    probeHandle.setAttribute('cy', (board.plotBox.y + board.plotBox.h - 10).toFixed(1));
    probeHandle.setAttribute('aria-valuenow', String(state.probeX));

    const evalRes = evalPiecewiseLinear(preset.pieces, state.probeX);
    if (evalRes.defined) {
      const py = clampPx(currentMapper.toY(evalRes.y), board.plotBox.y + 8, board.plotBox.y + board.plotBox.h - 8);
      probeDot.setAttribute('cx', probePx.toFixed(1));
      probeDot.setAttribute('cy', py.toFixed(1));
      probeDot.setAttribute('visibility', 'visible');
      probeLabel.setAttribute('x', clampPx(probePx + 10, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 110).toFixed(1));
      probeLabel.setAttribute('y', clampPx(py - 8, board.plotBox.y + 14, board.plotBox.y + board.plotBox.h - 14).toFixed(1));
      probeLabel.textContent = `f(${fmtNumberEsAR(state.probeX, 1)}) = ${fmtNumberEsAR(evalRes.y, 2)}`;
    } else {
      probeDot.setAttribute('visibility', 'hidden');
      probeLabel.setAttribute('x', clampPx(probePx + 10, board.plotBox.x + 8, board.plotBox.x + board.plotBox.w - 110).toFixed(1));
      probeLabel.setAttribute('y', (board.plotBox.y + 22).toFixed(1));
      probeLabel.textContent = `x = ${fmtNumberEsAR(state.probeX, 1)} fuera de Dom`;
    }

    const study = analyzePiecewiseLinear(preset.pieces);
    readout.replaceChildren(
      h('div', {}, [
        h('strong', {}, `${preset.desc} · `),
        h(
          'span',
          { style: 'color: var(--yellow)' },
          evalRes.defined ? `Tramo ${evalRes.pieceIndex + 1} ⇒ f(${fmtNumberEsAR(state.probeX, 1)}) = ${fmtNumberEsAR(evalRes.y, 2)}` : 'Fuera de dominio'
        ),
      ]),
      h(
        'div',
        { class: 'muted small' },
        `Dom = ${study.domain} · Im = ${study.image} · C₀ = ${study.C0} · C⁺ = ${study.CPlus} · C⁻ = ${study.CMinus} · Biyectiva: ${study.isBijective ? 'Sí' : 'No'}`
      )
    );
  }

  attachSvgDrag(
    board.svg,
    probeHandle,
    () => currentMapper,
    ({ x }) => {
      state.probeX = Math.max(currentMapper.xMin + 0.5, Math.min(currentMapper.xMax - 0.5, Math.round(x * 2) / 2));
      predictBox.notifyInteraction();
      update();
    },
    { ariaLabel: 'Mover sonda x sobre función por tramos', stepX: 0.5, stepY: 0 }
  );

  host.replaceChildren(predictBox, presetsRow, board.svg, readout);
  update();

  return { board, update };
}

/* ==========================================================================
   Bloques de Chequeo de Comprensión (8-tupla + 3 pistas + Solución Lock)
   ========================================================================== */

export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, sectionId = null, restoredStatus = null } = {}) {
  let hintCursor = 0;
  let solutionRevealed = false;
  let solved = false;

  const card = h('article', {
    class: 'pr-check-card lin-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId,
  });

  const head = h('div', { class: 'pr-check-head' }, [
    h('span', { class: 'pr-check-num' }, `Desafío ${idx + 1}`),
    h('span', { class: 'lin-comp-tag' }, item.competencyId),
  ]);

  const promptEl = h('p', { class: 'pr-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'lin-check-controls' });
  const hintsContainer = h('div', { class: 'lin-check-hints', hidden: '' });
  const feedbackEl = h('div', {
    class: 'pr-check-feedback',
    role: 'status',
    'aria-live': 'polite',
  });

  const hintBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary lin-hint-btn' },
    [chalkIcon('bulb', 14), ` Pista (0/${item.hints.length})`]
  );

  const solutionBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary lin-solution-btn' },
    [chalkIcon('spark', 14), ' Ver solución explicada']
  );

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      hintsContainer.appendChild(h('div', { class: 'lin-hint-item' }, item.hints[hintCursor]));
      hintCursor += 1;
      hintBtn.textContent =
        hintCursor < item.hints.length ? `Pista (${hintCursor}/${item.hints.length})` : 'Pistas completas';
    }
  });

  let disableControls = () => {};

  const markSuccess = () => {
    playSuccess();
    const isIndependent = hintCursor === 0 && !solutionRevealed;
    const status = isIndependent ? 'independent' : 'assisted';
    if (isIndependent) globalStreak += 1;

    card.classList.add('is-solved', isIndependent ? 'is-independent' : 'is-assisted');
    feedbackEl.className = 'pr-check-feedback is-ok';
    feedbackEl.replaceChildren(
      chalkIcon(isIndependent ? 'spark' : 'bulb', 14),
      h('strong', {}, isIndependent ? ' Logro independiente: ' : ' Logro asistido: '),
      h('span', {}, item.solution)
    );
    hintBtn.disabled = true;
    solutionBtn.disabled = true;
    disableControls();

    if (!solved) {
      solved = true;
      saveProgress(item.id, status);
      try {
        recordLinearAttempt({
          exerciseId: item.id,
          competencyId: item.competencyId,
          correct: true,
          mode: status,
          hintsUsed: hintCursor,
          solutionRevealed: false,
          diagnosticId: null,
          representation: item.representation || 'symbolic',
          stage: item.stage || 'guided_practice',
          transferDistance: item.transferDistance || 'near',
        });
      } catch {}
      if (typeof onItemSolved === 'function') onItemSolved(item.id, status);
    }

    if (isIndependent && STREAK_REACTIONS[globalStreak]) {
      const r = STREAK_REACTIONS[globalStreak];
      triggerVnReaction(vn, r.pose, r.text, r.tag);
    }
  };

  const revealSolution = () => {
    playClick();
    solutionRevealed = true;
    globalStreak = 0;
    card.classList.add('is-solved', 'is-assisted');
    feedbackEl.className = 'pr-check-feedback is-ok is-solution';
    feedbackEl.replaceChildren(
      chalkIcon('spark', 14),
      h('strong', {}, ' Solución explicada: '),
      h('span', {}, item.solution)
    );
    hintBtn.disabled = true;
    solutionBtn.disabled = true;
    disableControls();

    if (!solved) {
      solved = true;
      saveProgress(item.id, 'assisted');
      try {
        recordLinearAttempt({
          exerciseId: item.id,
          competencyId: item.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintCursor,
          solutionRevealed: true,
          diagnosticId: null,
          representation: item.representation || 'symbolic',
          stage: item.stage || 'guided_practice',
          transferDistance: item.transferDistance || 'near',
        });
      } catch {}
      if (typeof onItemSolved === 'function') onItemSolved(item.id, 'assisted');
    }
  };

  solutionBtn.addEventListener('click', revealSolution);

  const markFailure = (rawVal, explicitDiagnosticId = null) => {
    playError();
    globalStreak = 0;
    const diagId =
      explicitDiagnosticId ||
      (item.diagnosticMap && item.diagnosticMap[rawVal]) ||
      null;
    const diag = diagId
      ? DIAGNOSE_REACTIONS[diagId] || diagnoseLinear(rawVal, item.diagContext || {})
      : diagnoseLinear(rawVal, {
          ...(item.diagContext || {}),
          kind: item.kind,
          requireForm: item.requireForm,
          diagnosticMap: item.diagnosticMap,
        });

    const resolvedDiagId = diagId || (diag && LIN_DIAGNOSTIC_TAXONOMY[diag.id] ? diag.id : null);

    try {
      recordLinearAttempt({
        exerciseId: item.id,
        competencyId: item.competencyId,
        correct: false,
        mode: hintCursor === 0 && !solutionRevealed ? 'independent' : 'assisted',
        hintsUsed: hintCursor,
        solutionRevealed: false,
        diagnosticId: resolvedDiagId,
        representation: item.representation || 'symbolic',
        stage: item.stage || 'guided_practice',
        transferDistance: item.transferDistance || 'near',
      });
    } catch {}

    if (diag) {
      const msg = diag.message || diag.text;
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent = msg;
      triggerVnReaction(vn, diag.pose || 'pensativa', msg, diag.tag || 'Revisemos el paso');
    } else {
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Desplegá una pista progresiva para revisar el cálculo intermedio.';
    }
    notifyCompetencyDashboardUpdate();
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options lin-options' });
    item.options.forEach((opt, optIdx) => {
      const optText = typeof opt === 'string' ? opt : opt.label;
      const optBtn = h('button', { type: 'button', class: 'pr-option' }, optText);
      optBtn.addEventListener('click', () => {
        for (const b of optGroup.querySelectorAll('.pr-option')) {
          b.classList.remove('is-selected', 'is-correct', 'is-wrong');
        }
        optBtn.classList.add('is-selected');
        const isCorrect =
          typeof opt === 'object' && 'correct' in opt ? Boolean(opt.correct) : optIdx === item.correctIndex;
        if (isCorrect) {
          optBtn.classList.add('is-correct');
          markSuccess();
        } else {
          optBtn.classList.add('is-wrong');
          const dId =
            typeof opt === 'object' && opt.diagnosticId
              ? opt.diagnosticId
              : item.diagnosticMap?.[String(optIdx)] || item.diagnosticMap?.[optText];
          markFailure(optText, dId);
        }
      });
      optGroup.appendChild(optBtn);
    });

    disableControls = () => {
      optGroup.querySelectorAll('.pr-option').forEach((b, bIdx) => {
        b.disabled = true;
        const opt = item.options[bIdx];
        const isCorrect =
          typeof opt === 'object' && 'correct' in opt ? Boolean(opt.correct) : bIdx === item.correctIndex;
        if (isCorrect) b.classList.add('is-correct');
      });
    };

    controlsWrap.append(optGroup, h('div', { class: 'pr-chip-row lin-check-bar' }, [hintBtn, solutionBtn]));
  } else {
    const input = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: item.placeholder || 'Escribí tu respuesta...',
      'aria-label': item.prompt,
    });
    const submitBtn = h('button', { type: 'button', class: 'pr-btn pr-check-submit' }, [
      chalkIcon('check', 14),
      ' Comprobar',
    ]);

    disableControls = () => {
      if (item.expected != null) input.value = String(item.expected);
      input.disabled = true;
      submitBtn.disabled = true;
    };

    const checkInput = () => {
      const raw = input.value.trim();
      if (!raw) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = 'Ingresá un valor antes de comprobar.';
        return;
      }

      if (item.kind === 'radical') {
        try {
          const userRad = parseExactRadical(raw);
          const expRad = parseExactRadical(item.expected);
          if (exactRadicalEq(userRad, expRad)) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = 'Formato inválido. Usá radicales exactos como sqrt(5), √5 o 2√10.';
        }
        return;
      }

      if (item.kind === 'number') {
        try {
          const val = parseNumberOrFraction(raw);
          const expVal = parseNumberOrFraction(item.expected);
          if (Math.abs(val - expVal) < 1e-6) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = 'Formato numérico inválido. Usá enteros, decimales o fracciones como 15/4.';
        }
        return;
      }

      if (item.kind === 'pair') {
        try {
          const pUser = parseOrderedPair(raw);
          const pExp = parseOrderedPair(item.expected);
          if (Math.abs(pUser.x - pExp.x) < 1e-6 && Math.abs(pUser.y - pExp.y) < 1e-6) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch (err) {
          if (err.code === 'comma_instead_of_semicolon') {
            markFailure(raw, 'comma_instead_of_semicolon');
          } else {
            feedbackEl.className = 'pr-check-feedback is-warn';
            feedbackEl.textContent = err.message;
          }
        }
        return;
      }

      if (item.kind === 'set' || item.kind === 'interval') {
        try {
          if (equivalentSetExactas(raw, item.expected)) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch (err) {
          if (err.code === 'comma_instead_of_semicolon') {
            markFailure(raw, 'comma_instead_of_semicolon');
          } else {
            feedbackEl.className = 'pr-check-feedback is-warn';
            feedbackEl.textContent = err.message;
          }
        }
        return;
      }

      // expression (recta)
      const eq = equivalentLineEquation(raw, item.expected, item.requireForm || null);
      if (eq.status === 'syntax_error') {
        if (eq.errorCode === 'segmentary_zero_intercept') {
          markFailure(raw, 'segmentary_invalid_zero_case');
          return;
        }
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = eq.error;
        return;
      }
      if (eq.equivalent && eq.sameForm) {
        markSuccess();
        return;
      }
      if (eq.equivalent && !eq.sameForm) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = DIAGNOSE_REACTIONS.equivalent_form.text;
        triggerVnReaction(
          vn,
          DIAGNOSE_REACTIONS.equivalent_form.pose,
          DIAGNOSE_REACTIONS.equivalent_form.text,
          DIAGNOSE_REACTIONS.equivalent_form.tag
        );
        return;
      }
      markFailure(raw);
    };

    submitBtn.addEventListener('click', checkInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkInput();
      }
    });

    controlsWrap.appendChild(
      h('div', { class: 'pr-chip-row lin-check-bar' }, [input, submitBtn, hintBtn, solutionBtn])
    );
  }

  if (restoredStatus) {
    solved = true;
    card.classList.add('is-solved', restoredStatus === 'independent' ? 'is-independent' : 'is-assisted');
    hintBtn.disabled = true;
    solutionBtn.disabled = true;
    feedbackEl.className = 'pr-check-feedback is-ok';
    feedbackEl.replaceChildren(
      chalkIcon(restoredStatus === 'independent' ? 'spark' : 'bulb', 14),
      h('strong', {}, restoredStatus === 'independent' ? ' Logro independiente: ' : ' Logro asistido: '),
      h('span', {}, item.solution)
    );
    disableControls();
  }

  card.append(head, promptEl, controlsWrap, hintsContainer, feedbackEl);
  return card;
}

export function createCheckBlock(mountNode, questions = [], { vn, onSectionDone, sectionId = null } = {}) {
  if (!mountNode) return;
  clear(mountNode);
  const solvedIds = new Set();
  const progress = getProgress();

  const header = h('div', { class: 'lin-checks-header' }, [
    h('h3', { class: 'lin-checks-title' }, [chalkIcon('check', 16), ' Chequeo de comprensión paso a paso']),
    h('span', { class: 'lin-checks-progress' }, `0 / ${questions.length} completados`),
  ]);

  const updateProgressHeader = () => {
    const el = header.querySelector('.lin-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'lin-checks-grid' });
  questions.forEach((q, idx) => {
    const restoredStatus = progress[q.id] || null;
    if (restoredStatus) solvedIds.add(q.id);
    const card = buildSingleQuestionCard(q, idx, {
      vn,
      sectionId,
      restoredStatus,
      onItemSolved: (id) => {
        solvedIds.add(id);
        updateProgressHeader();
        const allSolved = questions.length > 0 && questions.every((it) => solvedIds.has(it.id));
        if (allSolved) {
          if (sectionId) markSectionCompleted(sectionId);
          if (typeof onSectionDone === 'function') onSectionDone(sectionId);
        }
      },
    });
    grid.appendChild(card);
  });

  updateProgressHeader();
  mountNode.append(header, grid);

  const allSolved = questions.length > 0 && questions.every((it) => solvedIds.has(it.id));
  if (allSolved) {
    if (sectionId) markSectionCompleted(sectionId);
    if (typeof onSectionDone === 'function') onSectionDone(sectionId);
  }
}

export const mountCheckBlock = createCheckBlock;

export function bindTutorButtons(root = document, { vn } = {}) {
  const buttons = root.querySelectorAll('[data-vn-trigger], [data-tutor], .vn-trigger-btn');
  for (const btn of buttons) {
    if (btn.dataset.vnBound === '1') continue;
    btn.dataset.vnBound = '1';
    btn.addEventListener('click', () => {
      playClick();
      const key = btn.getAttribute('data-vn-trigger') || btn.getAttribute('data-script-id');
      const script = VN_SCRIPTS[key];
      if (script) {
        triggerVnScript(vn, script, btn.textContent.trim());
      }
    });
  }
}

export function mountProgress(progressEl, solvedSections = new Set(), totalSections = 5) {
  if (!progressEl) return;
  const count = solvedSections.size ?? 0;
  const pct = Math.round((count / totalSections) * 100);
  progressEl.textContent = `${count}/${totalSections} pizarrones (${pct}%)`;
}

export function getCompetencyReport() {
  const storeReport = getLinearCompetencyReport();
  const rawComps = storeReport?.competencies || [];

  const list = LIN_COMPETENCIES.map((comp) => {
    const found = rawComps.find((c) => c.id === comp.id) || {
      id: comp.id,
      competencyId: comp.id,
      status: 'unseen',
      attempts: 0,
      independentCount: 0,
      assistedCount: 0,
      errorCount: 0,
      diagnostics: [],
      badge: STATUS_BADGES.unseen,
    };

    return {
      id: comp.id,
      competency: comp,
      title: comp.title,
      sectionId: comp.sectionId,
      order: comp.order,
      independentCount: found.independentCount || 0,
      assistedCount: found.assistedCount || 0,
      errorCount: found.errorCount || 0,
      attempts: found.attempts || 0,
      diagnostics: Array.isArray(found.diagnostics)
        ? [...found.diagnostics]
        : Array.isArray(found.recentDiagnosticIds)
          ? [...found.recentDiagnosticIds]
          : [],
      status: found.status || 'unseen',
      badge: found.badge || STATUS_BADGES[found.status] || STATUS_BADGES.unseen,
    };
  });

  return {
    summary: {
      total: LIN_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? LIN_COMPETENCIES.length,
      get mastered() {
        return this.consolidating + this.durable;
      },
      get assisted() {
        return this.developing;
      },
      get pending() {
        return this.unseen + this.introduced + this.needs_repair + this.review_due;
      },
    },
    competencies: Object.fromEntries(list.map((item) => [item.id, item])),
    list,
  };
}

export function mountCompetencyDashboard(host, { onSelectSection, onPracticeCompetency } = {}) {
  if (!host) return null;

  const instance = mountCoreCompetencyDashboard({
    container: host,
    moduleId: 'lineal',
    competencies: LIN_COMPETENCIES,
    diagnosticTaxonomy: LIN_DIAGNOSTIC_TAXONOMY,
    getReport: getCompetencyReport,
    classPrefix: 'lin-dashboard',
    subtitle:
      'Seguimiento en tiempo real de tu dominio conceptual e independencia analítica en las 5 competencias de Función Lineal.',
    sectionLabelFn: (comp) => `Ir al Pizarrón ${comp.order}`,
    formatNumber: (n) => fmtNumberEsAR(n, 0),
    onNavigateSection: (comp) => {
      if (typeof onSelectSection === 'function') {
        onSelectSection(comp.sectionId);
      } else if (typeof document !== 'undefined') {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${comp.sectionId}"]`);
        if (link) link.click();
        else if (typeof location !== 'undefined') location.hash = `#${comp.sectionId}`;
      }
    },
    onPracticeFamily: (comp) => {
      if (typeof onPracticeCompetency === 'function') {
        onPracticeCompetency(comp.id);
      } else if (typeof document !== 'undefined') {
        const link = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
        if (link) link.click();
        else if (typeof location !== 'undefined') location.hash = '#sec-retos';
      }
    },
  });

  const render = () => instance?.update();
  dashboardRenderers.add(render);

  return {
    update: render,
    destroy: () => {
      dashboardRenderers.delete(render);
      instance?.destroy();
    },
  };
}
