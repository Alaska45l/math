/**
 * @file js/modules/polinomios/components.js
 * Componentes transversales de Unidad 06: annotatedPolyFormula, createCheckBlock,
 * persistencia local + puente a ProgressStore y montaje del panel de competencias.
 */

import { h, clear, frac, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import {
  diagnosePolynomial,
  validatePolynomialAttempt,
  parsePolynomialExpr,
  inspectPolynomial,
  ratToString,
  ratAbs,
} from './logic.js';
import { SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';
import { POLY_COMPETENCIES, POLY_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { mountCompetencyDashboard as mountCoreCompetencyDashboard } from '../../core/learning/dashboard.js';
import { recordPolyAttempt, getPolyCompetencyReport } from './learning-adapter.js';
import { fmt } from '../../core/math-format.js';

export const PROGRESS_KEY = 'polinomios:progreso:v1';

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
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
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

const POLY_TOKEN_NOTES = {
  lead: {
    label: 'Coeficiente principal (a_n)',
    note: 'Multiplica a la potencia más alta de x. Si vale 1, el polinomio es mónico. En cualquier factorización completa debe quedar multiplicando adelante.',
  },
  deg: {
    label: 'Grado del polinomio gr(P)',
    note: 'Es el mayor exponente de x con coeficiente no nulo. P(x) = 0 es el único polinomio sin grado.',
  },
  mid: {
    label: 'Término intermedio',
    note: 'Aunque falte una potencia (coeficiente 0), su casillero sigue existiendo: hay que rellenarlo con 0 al armar la regla de Ruffini.',
  },
  const: {
    label: 'Término independiente (a₀ = P(0))',
    note: 'Es el término de grado 0. Si a₀ ≠ 0 y los coeficientes son enteros, sus divisores forman los numeradores p del Teorema de Gauss.',
  },
};

export function annotatedPolyFormula(exprStr = '2x^4 - 3x^2 + 1/2 x - 2') {
  let coeffs;
  try {
    coeffs = parsePolynomialExpr(exprStr).coeffs;
  } catch {
    coeffs = parsePolynomialExpr('2x^4 - 3x^2 + 1/2 x - 2').coeffs;
  }
  const info = inspectPolynomial(coeffs);

  const wrap = h('div', { class: 'poly-annotated-formula' });
  const eqLine = h('div', { class: 'poly-annotated-eq eq' }, h('span', {}, 'P(x) = '));
  const readout = h('div', { class: 'poly-annotated-note' }, [
    chalkIcon('spark', 15),
    h('span', {}, ' Tocá cada pieza marcada de la fórmula para ver qué lugar ocupa en la estructura polinómica.'),
  ]);

  const makeToken = (key, nodes, colorClass) => {
    const meta = POLY_TOKEN_NOTES[key] || POLY_TOKEN_NOTES.mid;
    const btn = h(
      'button',
      {
        type: 'button',
        class: `poly-formula-token ${colorClass}`,
        'data-token': key,
        'aria-label': meta.label,
      },
      nodes
    );
    const show = () => {
      clear(readout);
      readout.append(
        chalkIcon('bulb', 15),
        h('strong', {}, ` ${meta.label}: `),
        h('span', {}, meta.note)
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

  info.orderedDesc.forEach(({ deg, coeff }, idx) => {
    const isFirst = idx === 0;
    const isLast = deg === 0;
    const isNeg = coeff.n < 0;
    const absC = ratAbs(coeff);

    if (idx > 0) {
      eqLine.append(h('span', {}, isNeg ? ' \u2212 ' : ' + '));
    } else if (isNeg) {
      eqLine.append(h('span', {}, '\u2212'));
    }

    const cNode = absC.d === 1
      ? (absC.n === 1 && deg > 0 ? '' : String(absC.n))
      : frac(String(absC.n), String(absC.d));

    const varNodes = deg === 0
      ? []
      : deg === 1
        ? [h('span', {}, 'x')]
        : [h('span', {}, 'x'), makeToken(isFirst ? 'deg' : 'mid', [h('sup', {}, String(deg))], 'tok-blue')];

    if (isFirst) {
      const leadVal = absC.d === 1 ? String(absC.n) : frac(String(absC.n), String(absC.d));
      eqLine.append(makeToken('lead', [leadVal], 'tok-yellow'), ...varNodes);
    } else if (isLast) {
      eqLine.append(makeToken('const', [ratToString(absC)], 'tok-green'));
    } else {
      eqLine.append(
        makeToken('mid', [cNode || '1', ...(deg === 1 ? ['x'] : [h('span', {}, 'x'), h('sup', {}, String(deg))])], 'tok-blue')
      );
    }
  });

  wrap.append(eqLine, readout);
  return wrap;
}

export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, restoredStatus = null } = {}) {
  let hintCursor = 0;
  let solved = false;
  let solutionRevealed = false;

  const card = h('div', {
    class: 'pr-check-card poly-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId,
  });

  const head = h('div', { class: 'pr-check-head' }, [
    h('span', { class: 'pr-check-num' }, `Desafío ${idx + 1}`),
    h('span', { class: 'poly-comp-tag' }, item.competencyId),
  ]);

  const promptEl = h('p', { class: 'pr-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'poly-check-controls' });
  const hintsContainer = h('div', { class: 'poly-check-hints', hidden: '' });
  const feedbackEl = h('div', {
    class: 'pr-check-feedback',
    role: 'status',
    'aria-live': 'polite',
  });

  const hintBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary poly-hint-btn' },
    [chalkIcon('bulb', 14), ` Pista (0/${item.hints.length})`]
  );

  const solutionBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary poly-solution-btn' },
    [chalkIcon('spark', 14), ' Ver solución explicada']
  );

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      hintsContainer.appendChild(h('div', { class: 'poly-hint-item' }, item.hints[hintCursor]));
      hintCursor += 1;
      hintBtn.textContent =
        hintCursor < item.hints.length
          ? `Pista (${hintCursor}/${item.hints.length})`
          : 'Pistas completas';
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
        recordPolyAttempt({
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
      triggerVnReaction(
        vn,
        STREAK_REACTIONS[globalStreak].pose,
        STREAK_REACTIONS[globalStreak].text,
        STREAK_REACTIONS[globalStreak].tag
      );
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
        recordPolyAttempt({
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
      ? POLY_DIAGNOSTIC_TAXONOMY[diagId]
        ? { ...POLY_DIAGNOSTIC_TAXONOMY[diagId], message: DIAGNOSE_REACTIONS[diagId]?.text || POLY_DIAGNOSTIC_TAXONOMY[diagId].shortLabel }
        : diagnosePolynomial(rawVal, item.diagContext || {})
      : diagnosePolynomial(rawVal, {
          ...(item.diagContext || {}),
          diagnosticMap: item.diagnosticMap,
        });

    try {
      recordPolyAttempt({
        exerciseId: item.id,
        competencyId: item.competencyId,
        correct: false,
        mode: hintCursor === 0 && !solutionRevealed ? 'independent' : 'assisted',
        hintsUsed: hintCursor,
        solutionRevealed: false,
        diagnosticId: diagId || diag?.id || null,
        representation: item.representation || 'symbolic',
        stage: item.stage || 'guided_practice',
        transferDistance: item.transferDistance || 'near',
      });
    } catch {}

    if (diag) {
      const msg = diag.message || diag.text || diag.shortLabel;
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent = msg;
      triggerVnReaction(vn, diag.pose || 'pensativa', msg, diag.shortLabel || 'Revisemos el paso');
    } else {
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Desplegá una pista progresiva para revisar el procedimiento paso a paso.';
    }
    notifyCompetencyDashboardUpdate();
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options poly-options' });
    item.options.forEach((opt, optIdx) => {
      const optText = typeof opt === 'string' ? opt : opt.label;
      const optBtn = h('button', { type: 'button', class: 'pr-option' }, optText);
      optBtn.addEventListener('click', () => {
        for (const b of optGroup.querySelectorAll('.pr-option')) {
          b.classList.remove('is-selected', 'is-correct', 'is-wrong');
        }
        optBtn.classList.add('is-selected');
        const isCorrect =
          typeof opt === 'object' && 'correct' in opt
            ? Boolean(opt.correct)
            : optIdx === item.correctIndex;
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
          typeof opt === 'object' && 'correct' in opt
            ? Boolean(opt.correct)
            : bIdx === item.correctIndex;
        if (isCorrect) b.classList.add('is-correct');
      });
    };

    controlsWrap.append(optGroup, h('div', { class: 'pr-chip-row poly-check-bar' }, [hintBtn, solutionBtn]));
  } else {
    const input = h('input', {
      type: 'text',
      class: 'pr-check-input',
      placeholder: item.placeholder || 'Escribí tu respuesta...',
      'aria-label': item.prompt,
    });
    const submitBtn = h(
      'button',
      { type: 'button', class: 'pr-btn pr-check-submit' },
      [chalkIcon('check', 14), ' Comprobar']
    );

    disableControls = () => {
      if (item.expected != null) input.value = String(item.expected);
      input.disabled = true;
      submitBtn.disabled = true;
    };

    const checkInput = () => {
      const res = validatePolynomialAttempt({
        kind: item.kind,
        input: input.value,
        expected: item.expected,
        requireForm: item.requireForm || null,
        diagContext: item.diagContext || {},
      });
      if (res.empty) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = 'Ingresá un valor o expresión antes de comprobar.';
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
      if (res.equivalentWrongForm) {
        feedbackEl.className = 'pr-check-feedback is-warn';
        feedbackEl.textContent = res.incompleteFactorization
          ? 'Tu producto es equivalente, pero todavía quedan factores reducibles (ej. diferencias de cuadrados o cuadráticas con raíces reales). Factorizá hasta factores primos.'
          : DIAGNOSE_REACTIONS.equivalent_form.text;
        triggerVnReaction(
          vn,
          DIAGNOSE_REACTIONS.equivalent_form.pose,
          feedbackEl.textContent,
          DIAGNOSE_REACTIONS.equivalent_form.tag
        );
        return;
      }
      if (res.diagnostic) {
        markFailure(input.value, res.diagnostic.id);
      } else {
        markFailure(input.value);
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
      h('div', { class: 'pr-chip-row poly-check-bar' }, [input, submitBtn, hintBtn, solutionBtn])
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

  const header = h('div', { class: 'poly-checks-header' }, [
    h('h3', { class: 'poly-checks-title' }, [
      chalkIcon('check', 16),
      ' Chequeo de comprensión paso a paso',
    ]),
    h('span', { class: 'poly-checks-progress' }, `0 / ${questions.length} completados`),
  ]);

  const updateHeader = () => {
    const el = header.querySelector('.poly-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'poly-checks-grid' });
  questions.forEach((q, idx) => {
    const restoredStatus = progress[q.id] || null;
    if (restoredStatus) solvedIds.add(q.id);

    const card = buildSingleQuestionCard(q, idx, {
      vn,
      restoredStatus,
      onItemSolved: (id) => {
        solvedIds.add(id);
        updateHeader();
        if (questions.length > 0 && questions.every((it) => solvedIds.has(it.id))) {
          if (sectionId) markSectionCompleted(sectionId);
          if (typeof onSectionDone === 'function') onSectionDone(sectionId);
        }
      },
    });
    grid.appendChild(card);
  });

  updateHeader();
  mountNode.append(header, grid);

  if (questions.length > 0 && questions.every((it) => solvedIds.has(it.id))) {
    if (sectionId) markSectionCompleted(sectionId);
    if (typeof onSectionDone === 'function') onSectionDone(sectionId);
  }
}

export function bindTutorButtons(root = document, { vn } = {}) {
  const buttons = root.querySelectorAll('[data-vn-trigger], [data-tutor], .vn-trigger-btn');
  for (const btn of buttons) {
    if (btn.dataset.vnBound === '1') continue;
    btn.dataset.vnBound = '1';
    btn.addEventListener('click', () => {
      playClick();
      const key = btn.getAttribute('data-vn-trigger') || btn.getAttribute('data-script-id');
      const script = SCRIPTS[key];
      if (script) triggerVnScript(vn, script, btn.textContent.trim());
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
  const storeReport = getPolyCompetencyReport();
  const rawComps = storeReport?.competencies || [];

  const list = POLY_COMPETENCIES.map((comp) => {
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
      diagnostics: Array.isArray(found.diagnostics) ? [...found.diagnostics] : [],
      status: found.status || 'unseen',
      badge: found.badge || STATUS_BADGES[found.status] || STATUS_BADGES.unseen,
    };
  });

  return {
    summary: {
      total: POLY_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? POLY_COMPETENCIES.length,
    },
    competencies: Object.fromEntries(list.map((item) => [item.id, item])),
    list,
  };
}

export function mountCompetencyDashboard(host, { onSelectSection, onPracticeCompetency } = {}) {
  if (!host) return null;
  const instance = mountCoreCompetencyDashboard({
    container: host,
    moduleId: 'polinomios',
    competencies: POLY_COMPETENCIES,
    diagnosticTaxonomy: POLY_DIAGNOSTIC_TAXONOMY,
    getReport: getCompetencyReport,
    classPrefix: 'poly-dashboard',
    extraClassPrefixes: ['quad-dashboard'],
    subtitle:
      'Seguimiento conservador de las 5 competencias de Polinomios: el dominio se consolida únicamente al resolver ejercicios sin pistas ni solución revelada.',
    sectionLabelFn: (comp) => `Ir al Pizarrón ${comp.order}`,
    formatNumber: (n) => fmt(n, 0),
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
