/**
 * @file js/modules/funciones-trigonometricas/components.js
 * Componentes transversales para Unidad 11 · Funciones Trigonométricas:
 * annotatedTrigFormula, sixFunctionsComparisonTable (dominios/imágenes/períodos/ceros/biyectividad estrictamente diferenciados),
 * createCheckBlock (8-tupla + 3 pistas + solución explicada separada + registro independiente vs asistido),
 * bindTutorButtons, mountProgress y mountCompetencyDashboard.
 */

import { h, clear, frac, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import {
  TRIG_FUNCTIONS_SPEC,
  fmtNumberEsAR,
  validateTrigFunctionsAttempt,
  diagnoseTrigFunctions,
} from './logic.js';
import { VN_SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import {
  TRIG_FUNCTIONS_COMPETENCIES,
  TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY,
} from './competencies-map.js';
import {
  recordTrigFunctionsAttempt,
  getTrigFunctionsCompetencyReport,
} from './learning-adapter.js';

export const PROGRESS_KEY = 'funciones-trigonometricas:progreso:v1';

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
  if (state[itemId] === 'assisted' && status === 'independent') {
    return state;
  }
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

const FORMULA_NOTES = {
  congruence: {
    tokens: [
      { key: 'alpha_hat', label: 'Representante principal α̂', text: 'Único ángulo de la clase elegido en [0; 2π) (sistema circular) o [0°; 360°) (sistema sexagesimal).', color: 'tok-yellow' },
      { key: 'k', label: 'Número de vueltas k ∈ ℤ', text: 'Entero positivo (giros antihorarios), negativo (horarios) o cero.', color: 'tok-blue' },
      { key: 'period', label: 'Giro completo 2π / 360°', text: 'Sumar o restar múltiplos enteros de 2π mantiene exactamente el mismo rayo terminal.', color: 'tok-green' },
    ],
  },
  cartesian: {
    tokens: [
      { key: 'ord', label: 'Ordenada (ord = y)', text: 'Coordenada vertical del punto P. Manda el signo de sen(α) y cosec(α).', color: 'tok-yellow' },
      { key: 'abs', label: 'Abscisa (abs = x)', text: 'Coordenada horizontal del punto P. Manda el signo de cos(α) y sec(α).', color: 'tok-blue' },
      { key: 'rv', label: 'Radio vector (r.v. = √(x²+y²))', text: 'Distancia al origen, estrictamente positiva (r.v. > 0) para todo P ≠ (0; 0).', color: 'tok-pink' },
    ],
  },
  pythagorean: {
    tokens: [
      { key: 'sin2', label: 'sen²(α)', text: 'Cuadrado de la razón vertical (ord/r.v.)²; siempre ≥ 0.', color: 'tok-yellow' },
      { key: 'cos2', label: 'cos²(α)', text: 'Cuadrado de la razón horizontal (abs/r.v.)²; siempre ≥ 0.', color: 'tok-blue' },
      { key: 'one', label: 'Identidad = 1', text: 'Equivale a (ord² + abs²)/r.v.² = 1 por Pitágoras. Al despejar ±√(...) el signo lo fija el cuadrante.', color: 'tok-green' },
    ],
  },
  sinusoid: {
    tokens: [
      { key: 'A', label: 'Amplitud |A|', text: 'Ampliación didáctica: estira verticalmente la onda entre D − |A| y D + |A|.', color: 'tok-yellow' },
      { key: 'B', label: 'Frecuencia angular B', text: 'Comprime horizontalmente el período a T = 2π / |B|.', color: 'tok-blue' },
      { key: 'C', label: 'Corrimiento de fase C/B', text: 'Desplaza la onda horizontalmente hacia la derecha si C/B > 0.', color: 'tok-pink' },
      { key: 'D', label: 'Desplazamiento vertical D', text: 'Sube o baja el eje de oscilación a y = D.', color: 'tok-green' },
    ],
  },
};

export function annotatedTrigFormula(kind = 'cartesian') {
  const cfg = FORMULA_NOTES[kind] || FORMULA_NOTES.cartesian;
  const wrap = h('div', { class: 'trigf-annotated-formula' });
  const eqLine = h('div', { class: 'trigf-annotated-eq eq' });
  const readout = h('div', { class: 'trigf-annotated-note' }, [
    chalkIcon('spark', 15),
    h('span', {}, ' Tocá o pasá el cursor sobre cada pieza resaltada para ver su rol matemático.'),
  ]);

  const makeToken = (tok) => {
    const btn = h(
      'button',
      {
        type: 'button',
        class: `trigf-formula-token ${tok.color}`,
        'data-token': tok.key,
        'aria-label': tok.label,
      },
      tok.short || tok.label
    );
    const show = () => {
      clear(readout);
      readout.append(
        chalkIcon('bulb', 15),
        h('strong', {}, ` ${tok.label}: `),
        h('span', {}, tok.text)
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

  if (kind === 'congruence') {
    const [ta, tk, tp] = cfg.tokens;
    eqLine.append(
      h('span', {}, 'C_α = { x ∈ ℝ / x = '),
      makeToken({ ...ta, short: 'α̂' }),
      h('span', {}, ' + '),
      makeToken({ ...tk, short: 'k' }),
      h('span', {}, ' · '),
      makeToken({ ...tp, short: '2π' }),
      h('span', {}, ', k ∈ ℤ }')
    );
  } else if (kind === 'pythagorean') {
    const [ts, tc, t1] = cfg.tokens;
    eqLine.append(
      makeToken({ ...ts, short: 'sen²(α)' }),
      h('span', {}, ' + '),
      makeToken({ ...tc, short: 'cos²(α)' }),
      h('span', {}, ' = '),
      makeToken({ ...t1, short: '1' })
    );
  } else if (kind === 'sinusoid') {
    const [ta, tb, tc, td] = cfg.tokens;
    eqLine.append(
      h('span', {}, 'f(x) = '),
      makeToken({ ...ta, short: 'A' }),
      h('span', {}, ' · sen('),
      makeToken({ ...tb, short: 'B' }),
      h('span', {}, 'x − '),
      makeToken({ ...tc, short: 'C' }),
      h('span', {}, ') + '),
      makeToken({ ...td, short: 'D' })
    );
  } else {
    const [to, ta, tr] = cfg.tokens;
    eqLine.append(
      h('span', {}, 'sen(α) = '),
      frac(makeToken({ ...to, short: 'ord' }), makeToken({ ...tr, short: 'r.v.' })),
      h('span', {}, ' · cos(α) = '),
      frac(makeToken({ ...ta, short: 'abs' }), makeToken({ ...tr, short: 'r.v.' })),
      h('span', {}, ' · tg(α) = '),
      frac(makeToken({ ...to, short: 'ord' }), makeToken({ ...ta, short: 'abs' }))
    );
  }

  wrap.append(eqLine, readout);
  return wrap;
}

/**
 * Renders the 6-function comparative matrix with STRICTLY DIFFERENTIATED domains,
 * images, zeros, periods, and bijectivity domain/codomain restrictions.
 */
export function sixFunctionsComparisonTable() {
  const order = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
  const table = h('table', { class: 'trigf-matrix-table' }, [
    h('thead', {}, [
      h('tr', {}, [
        h('th', { scope: 'col' }, 'Función'),
        h('th', { scope: 'col' }, 'Dominio (Polos excluidos)'),
        h('th', { scope: 'col' }, 'Imagen'),
        h('th', { scope: 'col' }, 'Ceros C₀'),
        h('th', { scope: 'col' }, 'Período'),
        h('th', { scope: 'col' }, 'Restricción Biyectiva (Dom → Cod)'),
      ]),
    ]),
    h(
      'tbody',
      {},
      order.map((key) => {
        const spec = TRIG_FUNCTIONS_SPEC[key];
        return h('tr', { 'data-fn': key }, [
          h('th', { scope: 'row', class: 'eq' }, spec.label),
          h('td', { class: 'eq' }, spec.domainText),
          h('td', { class: 'eq' }, spec.imageText),
          h('td', { class: 'eq' }, spec.zerosText),
          h('td', { class: 'eq' }, spec.periodText),
          h(
            'td',
            { class: 'eq' },
            `${spec.bijectiveRestriction.domainText} → ${spec.bijectiveRestriction.codomainText}`
          ),
        ]);
      })
    ),
  ]);

  return h('div', { class: 'trigf-matrix-scroll' }, table);
}

export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, restoredStatus = null } = {}) {
  const card = h('article', {
    class: 'pr-check-card trigf-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId || '',
  });

  const head = h('div', { class: 'trigf-check-head' }, [
    h('span', { class: 'trigf-check-num' }, `Chequeo ${idx + 1}`),
    h('span', { class: 'trigf-check-meta' }, item.representation || 'symbolic'),
  ]);

  const promptEl = h('p', { class: 'trigf-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'trigf-check-controls' });
  const hintsContainer = h('div', { class: 'trigf-hints-box', hidden: '' });
  const feedbackEl = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

  let hintCursor = 0;
  let solutionRevealed = false;
  let solved = Boolean(restoredStatus);
  let failCount = 0;

  const hintBtn = h('button', { type: 'button', class: 'pr-chip trigf-hint-btn' }, 'Pista (0/3)');
  const solutionBtn = h(
    'button',
    { type: 'button', class: 'pr-chip trigf-solution-btn' },
    'Ver solución explicada'
  );

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      hintsContainer.appendChild(h('div', { class: 'trigf-hint-item' }, item.hints[hintCursor]));
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
        recordTrigFunctionsAttempt({
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
        recordTrigFunctionsAttempt({
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

  const markFailure = (rawVal, explicitDiagnosticId = null, preComputedDiag = null) => {
    playError();
    globalStreak = 0;
    failCount += 1;
    const diagId =
      explicitDiagnosticId ||
      (item.diagnosticMap && item.diagnosticMap[rawVal]) ||
      preComputedDiag?.id ||
      null;
    const diag = diagId
      ? DIAGNOSE_REACTIONS[diagId] ||
        diagnoseTrigFunctions(rawVal, { ...(item.diagContext || {}), kind: item.kind, expected: item.expected })
      : diagnoseTrigFunctions(rawVal, {
          ...(item.diagContext || {}),
          kind: item.kind,
          expected: item.expected,
          tol: item.tol,
          tolDeg: item.tolDeg,
          tolRad: item.tolRad,
          requireExactPi: item.requireExactPi,
          requirePrincipal: item.requirePrincipal,
          requireRationalized: item.requireRationalized,
          defaultSystem: item.defaultSystem,
        });

    const resolvedDiagId = diagId || (diag && TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY[diag.id] ? diag.id : null);

    try {
      recordTrigFunctionsAttempt({
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
    } else if (failCount >= 2 && STREAK_REACTIONS.repeatedError) {
      const r = STREAK_REACTIONS.repeatedError;
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Desplegá una pista progresiva para revisar cuadrante, período o dominio.';
      triggerVnReaction(vn, r.pose, r.text, r.tag);
    } else {
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Revisá el signo del cuadrante, los polos excluidos o desplegá una pista.';
    }
    notifyCompetencyDashboardUpdate();
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options trigf-options' });
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

    controlsWrap.append(optGroup, h('div', { class: 'pr-chip-row trigf-check-bar' }, [hintBtn, solutionBtn]));
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
      const res = validateTrigFunctionsAttempt({
        kind: item.kind,
        input: raw,
        expected: item.expected,
        tol: item.tol ?? 1e-3,
        tolDeg: item.tolDeg ?? 0.05,
        tolRad: item.tolRad ?? 1e-3,
        requireExactPi: Boolean(item.requireExactPi),
        requirePrincipal: item.requirePrincipal !== false,
        requireRationalized: Boolean(item.requireRationalized),
        defaultSystem: item.defaultSystem || 'rad',
        diagContext: item.diagContext || {},
      });

      if (res.empty) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = 'Ingresá un valor antes de comprobar.';
        return;
      }
      if (res.ok) {
        markSuccess();
        return;
      }
      if (res.syntaxError) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = res.syntaxError;
        return;
      }
      if (res.needsExactPi) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = 'El valor numérico coincide, pero expresalo como múltiplo exacto de π (ej: 7π/18).';
        return;
      }
      markFailure(raw, res.diagnostic?.id || null, res.diagnostic);
    };

    submitBtn.addEventListener('click', checkInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkInput();
      }
    });

    controlsWrap.appendChild(
      h('div', { class: 'pr-chip-row trigf-check-bar' }, [input, submitBtn, hintBtn, solutionBtn])
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

  const header = h('div', { class: 'trigf-checks-header' }, [
    h('h3', { class: 'trigf-checks-title' }, [chalkIcon('check', 16), ' Chequeo de comprensión paso a paso']),
    h('span', { class: 'trigf-checks-progress' }, `0 / ${questions.length} completados`),
  ]);

  const updateProgressHeader = () => {
    const el = header.querySelector('.trigf-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'trigf-checks-grid' });
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

export function mountProgress(progressEl, solvedSections = new Set(), totalSections = 7) {
  if (!progressEl) return;
  const count = solvedSections.size ?? 0;
  const pct = Math.round((count / totalSections) * 100);
  progressEl.textContent = `${count}/${totalSections} pizarrones (${pct}%)`;
}

export function getCompetencyReport() {
  const storeReport = getTrigFunctionsCompetencyReport();
  const rawComps = storeReport?.competencies || [];

  const list = TRIG_FUNCTIONS_COMPETENCIES.map((comp) => {
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
      total: TRIG_FUNCTIONS_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? TRIG_FUNCTIONS_COMPETENCIES.length,
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
    moduleId: 'funciones-trigonometricas',
    competencies: TRIG_FUNCTIONS_COMPETENCIES,
    diagnosticTaxonomy: TRIG_FUNCTIONS_DIAGNOSTIC_TAXONOMY,
    getReport: getCompetencyReport,
    classPrefix: 'trigf-dashboard',
    subtitle:
      'Seguimiento en tiempo real de tu dominio conceptual e independencia analítica en las 4 competencias de Funciones Trigonométricas.',
    sectionLabelFn: (comp) => `Ir al Pizarrón ${comp.sectionId.replace('sec-', '')}`,
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
