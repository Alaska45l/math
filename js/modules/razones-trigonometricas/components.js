/**
 * @file js/modules/razones-trigonometricas/components.js
 * Componentes transversales para Unidad 10 · Razones Trigonométricas:
 * annotatedTrigRatioFormula, createCheckBlock (8-tupla + 3 pistas + solución explicada separada
 * + registro independiente vs asistido), bindTutorButtons, mountProgress y mountCompetencyDashboard.
 */

import { h, clear, frac, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import {
  fmtNumberEsAR,
  parseNumberOrFraction,
  equivalentNumber,
  equivalentAngle,
  equivalentSetExactas,
  diagnoseTrigRatios,
} from './logic.js';
import { VN_SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import {
  TRIG_RATIOS_COMPETENCIES,
  TRIG_RATIOS_DIAGNOSTIC_TAXONOMY,
} from './competencies-map.js';
import {
  recordTrigRatiosAttempt,
  getTrigRatiosCompetencyReport,
} from './learning-adapter.js';

export const PROGRESS_KEY = 'razones-trigonometricas:progreso:v1';

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
  pythagoras: {
    tokens: [
      { key: 'c', label: 'Hipotenusa BC', text: 'Lado opuesto al ángulo recto de 90°. Es siempre el lado de mayor longitud en el triángulo rectángulo.', color: 'tok-pink' },
      { key: 'a', label: 'Cateto AB', text: 'Uno de los dos lados que forman el ángulo recto en A. Es adyacente al ángulo B y opuesto al ángulo C.', color: 'tok-blue' },
      { key: 'b', label: 'Cateto AC', text: 'El segundo lado que forma el ángulo recto en A. Es opuesto al ángulo B y adyacente al ángulo C.', color: 'tok-yellow' },
    ],
  },
  sohcahtoa: {
    tokens: [
      { key: 'opp', label: 'Cateto opuesto a B (AC)', text: 'Es el cateto ubicado enfrente del vértice B (no forma parte de los lados del ángulo B).', color: 'tok-yellow' },
      { key: 'adj', label: 'Cateto adyacente a B (AB)', text: 'Es el cateto que toca al vértice B junto con la hipotenusa.', color: 'tok-blue' },
      { key: 'hyp', label: 'Hipotenusa (BC)', text: 'Siempre está opuesta al ángulo recto A = 90°; nunca cambia de rol al cambiar entre B y C.', color: 'tok-pink' },
    ],
  },
  arc: {
    tokens: [
      { key: 's', label: 'Longitud de arco s', text: 'Distancia curvilínea recorrida sobre el borde de la circunferencia (en la misma unidad lineal que el radio r).', color: 'tok-yellow' },
      { key: 'r', label: 'Radio r', text: 'Distancia fija del centro a cualquier punto del arco.', color: 'tok-blue' },
      { key: 'theta', label: 'Ángulo central θ (en radianes)', text: '¡Atención! Debe expresarse obligatoriamente en radianes (sistema circular), jamás en grados sexagesimales.', color: 'tok-green' },
    ],
  },
  cosine_law: {
    tokens: [
      { key: 'c2', label: 'Lado buscado c', text: 'Lado opuesto al ángulo comprendido γ en cualquier triángulo (rectángulo u oblicuángulo).', color: 'tok-pink' },
      { key: 'ab', label: 'Lados conocidos a, b', text: 'Los dos lados que encierran al ángulo γ (deben estar en la misma unidad de longitud).', color: 'tok-blue' },
      { key: 'corr', label: 'Corrector −2ab·cos(γ)', text: 'Cuando γ = 90°, cos(90°) = 0 y recuperás Pitágoras. Si γ > 90°, cos(γ) < 0 y el término suma; si γ < 90°, resta.', color: 'tok-green' },
    ],
  },
};

export function annotatedTrigRatioFormula(kind = 'sohcahtoa') {
  const cfg = FORMULA_NOTES[kind] || FORMULA_NOTES.sohcahtoa;
  const wrap = h('div', { class: 'trigr-annotated-formula' });
  const eqLine = h('div', { class: 'trigr-annotated-eq eq' });
  const readout = h('div', { class: 'trigr-annotated-note' }, [
    chalkIcon('spark', 15),
    h('span', {}, ' Tocá o pasá el cursor sobre cada pieza resaltada para ver su rol geométrico.'),
  ]);

  const makeToken = (tok) => {
    const btn = h(
      'button',
      {
        type: 'button',
        class: `trigr-formula-token ${tok.color}`,
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

  if (kind === 'pythagoras') {
    const [tc, ta, tb] = cfg.tokens;
    eqLine.append(
      makeToken({ ...tc, short: 'BC²' }),
      h('span', {}, ' = '),
      makeToken({ ...ta, short: 'AB²' }),
      h('span', {}, ' + '),
      makeToken({ ...tb, short: 'AC²' })
    );
  } else if (kind === 'arc') {
    const [ts, tr, tt] = cfg.tokens;
    eqLine.append(
      makeToken({ ...ts, short: 's' }),
      h('span', {}, ' = '),
      makeToken({ ...tr, short: 'r' }),
      h('span', {}, ' · '),
      makeToken({ ...tt, short: 'θ (rad)' })
    );
  } else if (kind === 'cosine_law') {
    const [tc, tab, tcorr] = cfg.tokens;
    eqLine.append(
      makeToken({ ...tc, short: 'c²' }),
      h('span', {}, ' = '),
      makeToken({ ...tab, short: 'a² + b²' }),
      h('span', {}, ' '),
      makeToken({ ...tcorr, short: '− 2·a·b·cos(γ)' })
    );
  } else {
    const [topp, tadj, thyp] = cfg.tokens;
    eqLine.append(
      h('span', {}, 'sen(B) = '),
      frac(makeToken({ ...topp, short: 'Op' }), makeToken({ ...thyp, short: 'Hip' })),
      h('span', {}, ' · cos(B) = '),
      frac(makeToken({ ...tadj, short: 'Ady' }), makeToken({ ...thyp, short: 'Hip' })),
      h('span', {}, ' · tg(B) = '),
      frac(makeToken({ ...topp, short: 'Op' }), makeToken({ ...tadj, short: 'Ady' }))
    );
  }

  wrap.append(eqLine, readout);
  return wrap;
}

export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, restoredStatus = null } = {}) {
  const card = h('article', {
    class: 'pr-check-card trigr-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId || '',
  });

  const head = h('div', { class: 'trigr-check-head' }, [
    h('span', { class: 'trigr-check-num' }, `Chequeo ${idx + 1}`),
    h('span', { class: 'trigr-check-meta' }, item.representation || 'symbolic'),
  ]);

  const promptEl = h('p', { class: 'trigr-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'trigr-check-controls' });
  const hintsContainer = h('div', { class: 'trigr-hints-box', hidden: '' });
  const feedbackEl = h('div', { class: 'pr-check-feedback', role: 'status', 'aria-live': 'polite' });

  let hintCursor = 0;
  let solutionRevealed = false;
  let solved = Boolean(restoredStatus);

  const hintBtn = h('button', { type: 'button', class: 'pr-chip trigr-hint-btn' }, 'Pista (0/3)');
  const solutionBtn = h(
    'button',
    { type: 'button', class: 'pr-chip trigr-solution-btn' },
    'Ver solución explicada'
  );

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      hintsContainer.appendChild(h('div', { class: 'trigr-hint-item' }, item.hints[hintCursor]));
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
        recordTrigRatiosAttempt({
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
        recordTrigRatiosAttempt({
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
      ? DIAGNOSE_REACTIONS[diagId] || diagnoseTrigRatios(rawVal, item.diagContext || {})
      : diagnoseTrigRatios(rawVal, {
          ...(item.diagContext || {}),
          kind: item.kind,
          expected: item.expected,
          tol: item.tol,
          tolDeg: item.tolDeg,
          requireExactPi: item.requireExactPi,
          defaultSystem: item.defaultSystem,
        });

    const resolvedDiagId = diagId || (diag && TRIG_RATIOS_DIAGNOSTIC_TAXONOMY[diag.id] ? diag.id : null);

    try {
      recordTrigRatiosAttempt({
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
        'Todavía no coincide. Desplegá una pista progresiva para revisar las razones o las unidades.';
    }
    notifyCompetencyDashboardUpdate();
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options trigr-options' });
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

    controlsWrap.append(optGroup, h('div', { class: 'pr-chip-row trigr-check-bar' }, [hintBtn, solutionBtn]));
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

      if (item.kind === 'angle') {
        const res = equivalentAngle(raw, item.expected, {
          tolDeg: item.tolDeg ?? 0.05,
          tolRad: item.tolRad ?? 1e-3,
          requireExactPi: Boolean(item.requireExactPi),
          defaultSystem: item.defaultSystem || 'deg',
        });
        if (res.equivalent) {
          markSuccess();
        } else if (item.requireExactPi && res.approxMatch) {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = 'El valor numérico coincide, pero expresalo como fracción exacta de π (ej: 7π/18).';
        } else {
          markFailure(raw);
        }
        return;
      }

      if (item.kind === 'set' || item.kind === 'interval' || item.kind === 'set_or_interval' || item.kind === 'solution_set') {
        try {
          if (equivalentSetExactas(raw, item.expected)) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch (err) {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = err.message;
        }
        return;
      }

      // number
      try {
        parseNumberOrFraction(raw);
        if (equivalentNumber(raw, item.expected, item.tol ?? 0.05)) {
          markSuccess();
        } else {
          markFailure(raw);
        }
      } catch {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = 'Formato numérico inválido. Usá enteros, decimales con coma/punto o fracciones.';
      }
    };

    submitBtn.addEventListener('click', checkInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkInput();
      }
    });

    controlsWrap.appendChild(
      h('div', { class: 'pr-chip-row trigr-check-bar' }, [input, submitBtn, hintBtn, solutionBtn])
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

  const header = h('div', { class: 'trigr-checks-header' }, [
    h('h3', { class: 'trigr-checks-title' }, [chalkIcon('check', 16), ' Chequeo de comprensión paso a paso']),
    h('span', { class: 'trigr-checks-progress' }, `0 / ${questions.length} completados`),
  ]);

  const updateProgressHeader = () => {
    const el = header.querySelector('.trigr-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'trigr-checks-grid' });
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

export function mountProgress(progressEl, solvedSections = new Set(), totalSections = 6) {
  if (!progressEl) return;
  const count = solvedSections.size ?? 0;
  const pct = Math.round((count / totalSections) * 100);
  progressEl.textContent = `${count}/${totalSections} pizarrones (${pct}%)`;
}

export function getCompetencyReport() {
  const storeReport = getTrigRatiosCompetencyReport();
  const rawComps = storeReport?.competencies || [];

  const list = TRIG_RATIOS_COMPETENCIES.map((comp) => {
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
      total: TRIG_RATIOS_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? TRIG_RATIOS_COMPETENCIES.length,
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
    moduleId: 'razones-trigonometricas',
    competencies: TRIG_RATIOS_COMPETENCIES,
    diagnosticTaxonomy: TRIG_RATIOS_DIAGNOSTIC_TAXONOMY,
    getReport: getCompetencyReport,
    classPrefix: 'trigr-dashboard',
    subtitle:
      'Seguimiento en tiempo real de tu dominio conceptual e independencia analítica en las 4 competencias de Razones Trigonométricas.',
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
