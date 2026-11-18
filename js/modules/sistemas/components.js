/**
 * @file js/modules/sistemas/components.js
 * Componentes transversales para Unidad 04 · Sistemas de Ecuaciones Lineales 2×2:
 * annotatedSystemFormula, systemClassificationStrip, createCheckBlock (con bloqueo
 * independiente y diagnóstico 9-ID), bindTutorButtons, mountProgress y mountCompetencyDashboard.
 */

import { h, clear, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import {
  MINUS,
  fmtNumberEsAR,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
  equivalentSolutionSet2x2,
  diagnoseSystem,
} from './logic.js';
import { equivalentLineEquation } from '../lineal/logic.js';
import { VN_SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { SYS_COMPETENCIES, SYS_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';
import { recordSystemAttempt, getSystemsCompetencyReport } from './learning-adapter.js';

export const PROGRESS_KEY = 'sistemas:progreso:v1';

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
  if (vn && typeof vn.react === 'function') vn.react(pose, text);
  else react({ pose: pose || 'pensativa', tag, html: text });
}

function triggerVnScript(vn, script, title = '') {
  if (vn && typeof vn.play === 'function') vn.play(script, title);
  else playScript(script);
}

const SYS_TOKEN_NOTES = {
  a1: {
    label: 'Coeficiente a de x en r₁',
    note: 'Acompaña a la incógnita x en la primera ecuación. Si b ≠ 0, junto con b fija la pendiente m₁ = −a/b.',
  },
  b1: {
    label: 'Coeficiente b de y en r₁',
    note: 'Acompaña a y en la primera ecuación. Para sumar/restar por reducción se buscan múltiplos opuestos con b′.',
  },
  c1: {
    label: 'Término independiente c',
    note: 'Desplaza la recta verticalmente (junto con b define la ordenada c/b). Fundamental para distinguir SCI de SI cuando las rectas son paralelas.',
  },
  delta: {
    label: 'Indicador Δ = ab′ − a′b (Ampliación didáctica)',
    note: 'Si Δ ≠ 0 las pendientes son distintas (SCD, corte único). Si Δ = 0 las rectas son paralelas (revisar términos independientes para decidir entre SCI y SI).',
  },
};

export function annotatedSystemFormula(spec = {}) {
  const wrap = h('div', { class: 'sys-annotated-formula' });
  const eqLine = h('div', { class: 'sys-annotated-eq eq' });
  const readout = h('div', { class: 'sys-annotated-note' }, [
    chalkIcon('spark', 15),
    h('span', {}, ' Tocá o pasá el cursor sobre cada coeficiente del sistema 2×2 para ver su rol.'),
  ]);

  const makeToken = (key, text, colorClass) => {
    const info = SYS_TOKEN_NOTES[key] || SYS_TOKEN_NOTES.a1;
    const btn = h(
      'button',
      { type: 'button', class: `sys-formula-token ${colorClass}`, 'aria-label': info.label },
      text
    );
    const show = () => {
      clear(readout);
      readout.append(chalkIcon('bulb', 15), h('strong', {}, ` ${info.label}: `), h('span', {}, info.note));
    };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('click', () => {
      playClick();
      show();
    });
    return btn;
  };

  const a1 = spec.a1 ?? '2';
  const b1 = spec.b1 ?? '1';
  const c1 = spec.c1 ?? '3';
  const a2 = spec.a2 ?? '1';
  const b2 = spec.b2 ?? '−1';
  const c2 = spec.c2 ?? '0';

  eqLine.append(
    h('div', { class: 'sys-brace-rows' }, [
      h('div', {}, [
        makeToken('a1', String(a1), 'tok-blue'),
        h('span', {}, 'x + '),
        makeToken('b1', String(b1), 'tok-yellow'),
        h('span', {}, 'y = '),
        makeToken('c1', String(c1), 'tok-pink'),
      ]),
      h('div', {}, [
        h('span', {}, `${a2}x + (${b2})y = ${c2}   ·   `),
        makeToken('delta', 'Δ = a·b′ − a′·b', 'tok-green'),
      ]),
    ])
  );

  wrap.append(eqLine, readout);
  return wrap;
}

export function systemClassificationStrip() {
  const strip = h('div', { class: 'sys-rosetta-strip' });
  strip.append(
    h('div', { class: 'sys-rosetta-card is-scd' }, [
      h('div', { class: 'sys-rosetta-head' }, '1. Compatible Determinado (SCD)'),
      h('div', { class: 'sys-rosetta-eq eq' }, 'Rectas secantes · m₁ ≠ m₂'),
      h('div', { class: 'sys-rosetta-gift' }, 'Solución única S = {(x₀; y₀)}. Al despejar sale un único número real.'),
    ]),
    h('div', { class: 'sys-rosetta-card is-sci' }, [
      h('div', { class: 'sys-rosetta-head' }, '2. Compatible Indeterminado (SCI)'),
      h('div', { class: 'sys-rosetta-eq eq' }, 'Paralelas coincidentes · 0x = 0'),
      h('div', { class: 'sys-rosetta-gift' }, 'Infinitas soluciones: S = {(x; mx+b) / x ∈ ℝ}. Misma pendiente y misma ordenada.'),
    ]),
    h('div', { class: 'sys-rosetta-card is-si' }, [
      h('div', { class: 'sys-rosetta-head' }, '3. Incompatible (SI)'),
      h('div', { class: 'sys-rosetta-eq eq' }, 'Paralelas separadas · 0x = k ≠ 0'),
      h('div', { class: 'sys-rosetta-gift' }, 'Sin solución: S = ∅. Misma pendiente (m₁ = m₂) pero distinta ordenada (b₁ ≠ b₂).'),
    ])
  );
  return strip;
}

export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, sectionId = null, restoredStatus = null } = {}) {
  let hintCursor = 0;
  let solutionRevealed = false;
  let solved = false;

  const card = h('article', {
    class: 'pr-check-card sys-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId,
  });

  const head = h('div', { class: 'pr-check-head' }, [
    h('span', { class: 'pr-check-num' }, `Desafío ${idx + 1}`),
    h('span', { class: 'sys-comp-tag' }, item.competencyId),
  ]);

  const promptEl = h('p', { class: 'pr-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'sys-check-controls' });
  const hintsContainer = h('div', { class: 'sys-check-hints', hidden: '' });
  const feedbackEl = h('div', {
    class: 'pr-check-feedback',
    role: 'status',
    'aria-live': 'polite',
  });

  const hintBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary sys-hint-btn' }, [
    chalkIcon('bulb', 14),
    ` Pista (0/${item.hints.length})`,
  ]);
  const solutionBtn = h('button', { type: 'button', class: 'pr-btn pr-btn-secondary sys-solution-btn' }, [
    chalkIcon('spark', 14),
    ' Ver solución explicada',
  ]);

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      hintsContainer.appendChild(h('div', { class: 'sys-hint-item' }, item.hints[hintCursor]));
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
        recordSystemAttempt({
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
        recordSystemAttempt({
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
      ? DIAGNOSE_REACTIONS[diagId] || diagnoseSystem(rawVal, item.diagContext || {})
      : diagnoseSystem(rawVal, {
          ...(item.diagContext || {}),
          kind: item.kind,
          diagnosticMap: item.diagnosticMap,
        });

    const resolvedDiagId = diagId || (diag && SYS_DIAGNOSTIC_TAXONOMY[diag.id] ? diag.id : null);

    try {
      recordSystemAttempt({
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
      triggerVnReaction(vn, diag.pose || 'pensativa', msg, diag.tag || 'Revisemos el planteo');
    } else {
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Desplegá una pista progresiva para verificar tu despeje.';
    }
    notifyCompetencyDashboardUpdate();
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options sys-options' });
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

    controlsWrap.append(optGroup, h('div', { class: 'pr-chip-row sys-check-bar' }, [hintBtn, solutionBtn]));
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
        feedbackEl.textContent = 'Ingresá una respuesta antes de comprobar.';
        return;
      }

      if (item.kind === 'number') {
        try {
          const val = parseNumberOrFraction(raw);
          const expVal = parseNumberOrFraction(item.expected);
          if (Math.abs(val - expVal) < 1e-6) markSuccess();
          else markFailure(raw);
        } catch {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = 'Formato numérico inválido. Usá enteros, decimales o fracciones.';
        }
        return;
      }

      if (item.kind === 'pair') {
        try {
          const cleanRaw = raw.replace(/^S\s*=\s*/i, '').replace(/^\{|\}$/g, '').trim();
          const cleanExp = String(item.expected).replace(/^S\s*=\s*/i, '').replace(/^\{|\}$/g, '').trim();
          const pUser = parseOrderedPair(cleanRaw);
          const pExp = parseOrderedPair(cleanExp);
          if (Math.abs(pUser.x - pExp.x) < 1e-6 && Math.abs(pUser.y - pExp.y) < 1e-6) markSuccess();
          else markFailure(raw);
        } catch (err) {
          if (err.code === 'comma_instead_of_semicolon') markFailure(raw, 'comma_instead_of_semicolon');
          else {
            feedbackEl.className = 'pr-check-feedback is-warn';
            feedbackEl.textContent = err.message;
          }
        }
        return;
      }

      if (item.kind === 'solution') {
        try {
          if (equivalentSolutionSet2x2(raw, item.expected)) markSuccess();
          else markFailure(raw);
        } catch (err) {
          if (err.code === 'comma_instead_of_semicolon') markFailure(raw, 'comma_instead_of_semicolon');
          else {
            feedbackEl.className = 'pr-check-feedback is-warn';
            feedbackEl.textContent = err.message;
          }
        }
        return;
      }

      if (item.kind === 'set' || item.kind === 'interval') {
        try {
          if (equivalentSetExactas(raw, item.expected)) markSuccess();
          else markFailure(raw);
        } catch (err) {
          if (err.code === 'comma_instead_of_semicolon') markFailure(raw, 'comma_instead_of_semicolon');
          else {
            feedbackEl.className = 'pr-check-feedback is-warn';
            feedbackEl.textContent = err.message;
          }
        }
        return;
      }

      // expression
      const eq = equivalentLineEquation(raw, item.expected, item.requireForm || null);
      if (eq.status === 'syntax_error') {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = eq.error;
        return;
      }
      if (eq.equivalent && eq.sameForm) {
        markSuccess();
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
      h('div', { class: 'pr-chip-row sys-check-bar' }, [input, submitBtn, hintBtn, solutionBtn])
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

  const header = h('div', { class: 'sys-checks-header' }, [
    h('h3', { class: 'sys-checks-title' }, [chalkIcon('check', 16), ' Chequeo de comprensión paso a paso']),
    h('span', { class: 'sys-checks-progress' }, `0 / ${questions.length} completados`),
  ]);

  const updateProgressHeader = () => {
    const el = header.querySelector('.sys-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'sys-checks-grid' });
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
      if (script) triggerVnScript(vn, script, btn.textContent.trim());
    });
  }
}

export function mountProgress(progressEl, solvedSections = new Set(), totalSections = 4) {
  if (!progressEl) return;
  const count = solvedSections.size ?? 0;
  const pct = Math.round((count / totalSections) * 100);
  progressEl.textContent = `${count}/${totalSections} pizarrones (${pct}%)`;
}

export function getCompetencyReport() {
  const storeReport = getSystemsCompetencyReport();
  const rawComps = storeReport?.competencies || [];

  const list = SYS_COMPETENCIES.map((comp) => {
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
      total: SYS_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? SYS_COMPETENCIES.length,
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
    moduleId: 'sistemas',
    competencies: SYS_COMPETENCIES,
    diagnosticTaxonomy: SYS_DIAGNOSTIC_TAXONOMY,
    getReport: getCompetencyReport,
    classPrefix: 'sys-dashboard',
    subtitle:
      'Seguimiento en tiempo real de tu dominio conceptual e independencia analítica en las 4 competencias de Sistemas 2×2.',
    sectionLabelFn: (comp) => `Ir al Pizarrón ${comp.order}`,
    formatNumber: (n) => fmtNumberEsAR(n, 0),
    onNavigateSection: (comp) => {
      if (typeof onSelectSection === 'function') onSelectSection(comp.sectionId);
      else if (typeof document !== 'undefined') {
        const link = document.querySelector(`.seq-sidebar__link[data-sec="${comp.sectionId}"]`);
        if (link) link.click();
        else if (typeof location !== 'undefined') location.hash = `#${comp.sectionId}`;
      }
    },
    onPracticeFamily: (comp) => {
      if (typeof onPracticeCompetency === 'function') onPracticeCompetency(comp.id);
      else if (typeof document !== 'undefined') {
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
