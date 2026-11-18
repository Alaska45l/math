/**
 * components.js — Componentes transversales para Unidad 09: Función Logarítmica.
 * - Persistencia UI en localStorage ('logaritmicas:progreso:v1') sin duplicar maestría
 * - Fórmulas interactivas anotadas (annotatedLogFormula)
 * - Bloques de chequeos con 3 pistas progresivas y solución paso a paso (createCheckBlock)
 * - Disparadores de tutoría de Alaska (bindTutorButtons)
 */

import { h, mount, chalkIcon } from '../../core/dom.js';
import { fmt, frac, MINUS } from '../../core/math-format.js';
import { playScript, react } from '../../core/vn.js';
import { STATUS_BADGES } from '../../core/learning/progress-store.js';
import { diagnoseLog } from './logic.js';
import {
  VN_SCRIPTS,
  DIAGNOSE_REACTIONS,
  STREAK_REACTIONS,
} from './vn-scripts.js';
import {
  LOG_COMPETENCIES,
  LOG_DIAGNOSTIC_TAXONOMY,
} from './competencies-map.js';
import {
  recordLogAttempt,
  getLogCompetencyReport,
  mountLogCompetencyDashboard,
} from './learning-adapter.js';

export { STREAK_REACTIONS, DIAGNOSE_REACTIONS, VN_SCRIPTS };

export const PROGRESS_KEY = 'logaritmicas:progreso:v1';

const dashboardRenderers = new Set();
export function notifyCompetencyDashboardUpdate() {
  dashboardRenderers.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

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

export function saveProgress(key, value = 'independent') {
  const state = getProgress();
  if (state[key] === 'assisted' && value === 'independent') {
    return state;
  }
  state[key] = value;
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {}
  updateProgressUI();
  notifyCompetencyDashboardUpdate();
  return state;
}

export function recordCompetencyAttempt({
  competencyId,
  correct,
  mode = 'independent',
  diagnosticId = null,
  exerciseId = null,
  hintsUsed = 0,
  solutionRevealed = false,
  stage = 'guided_practice',
  representation = 'symbolic',
  transferDistance = 'near',
}) {
  if (!competencyId) return null;

  const isCorrect = Boolean(correct);
  const solRevealed = Boolean(solutionRevealed);
  const hintsCount =
    typeof hintsUsed === 'number' && Number.isInteger(hintsUsed) && hintsUsed > 0
      ? hintsUsed
      : (mode === 'assisted' && !solRevealed ? 1 : 0);

  let result = null;
  try {
    result = recordLogAttempt({
      exerciseId: exerciseId || 'log-check',
      competencyId,
      correct: isCorrect,
      mode,
      hintsUsed: hintsCount,
      solutionRevealed: solRevealed,
      diagnosticId: !isCorrect ? diagnosticId : null,
      representation,
      stage,
      transferDistance,
    });
  } catch {}

  updateProgressUI();
  notifyCompetencyDashboardUpdate();
  return result?.updatedEntry || null;
}

export function getCompetencyReport() {
  const storeReport = getLogCompetencyReport();
  const storeComps = Array.isArray(storeReport?.competencies) ? storeReport.competencies : [];

  const report = {
    summary: {
      total: LOG_COMPETENCIES.length,
      durable: storeReport?.summary?.durable || 0,
      consolidating: storeReport?.summary?.consolidating || 0,
      developing: storeReport?.summary?.developing || 0,
      review_due: storeReport?.summary?.review_due || 0,
      needs_repair: storeReport?.summary?.needs_repair || 0,
      introduced: storeReport?.summary?.introduced || 0,
      unseen: storeReport?.summary?.unseen ?? LOG_COMPETENCIES.length,
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
    competencies: {},
    list: [],
  };

  LOG_COMPETENCIES.forEach((comp) => {
    const storeEntry = storeComps.find((c) => c.id === comp.id) || {};
    const status = storeEntry.status || 'unseen';
    const item = {
      id: comp.id,
      competency: comp,
      title: comp.title,
      sectionId: comp.sectionId,
      order: comp.order,
      independentCount: storeEntry.independentCount || 0,
      assistedCount: storeEntry.assistedCount || 0,
      errorCount: storeEntry.errorCount || 0,
      attempts:
        storeEntry.attempts ||
        (storeEntry.independentCount || 0) +
          (storeEntry.assistedCount || 0) +
          (storeEntry.errorCount || 0),
      diagnostics: Array.isArray(storeEntry.diagnostics)
        ? [...storeEntry.diagnostics]
        : Array.isArray(storeEntry.recentDiagnosticIds)
          ? [...storeEntry.recentDiagnosticIds]
          : [],
      status,
      badge: storeEntry.badge || STATUS_BADGES[status] || STATUS_BADGES.unseen,
    };
    report.competencies[comp.id] = item;
    report[comp.id] = item;
    report.list.push(item);
  });

  return report;
}

export function mountCompetencyDashboard(host, callbacks = {}) {
  if (!host) return null;
  const instance = mountLogCompetencyDashboard(host, callbacks);
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

export function markSectionCompleted(sectionId) {
  try {
    const state = getProgress();
    state[sectionId] = true;
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
    if (typeof document !== 'undefined') {
      const link = document.querySelector(`.seq-sidebar__link[data-sec="${sectionId}"] .seq-sidebar__status`);
      if (link) {
        link.classList.add('is-done');
        link.replaceChildren(chalkIcon('check', 14));
      }
    }
    updateProgressUI();
    notifyCompetencyDashboardUpdate();
  } catch {}
}

function updateProgressUI() {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
  const state = getProgress();
  const complete = Object.keys(state).filter((key) => /^sec-\d+$/.test(key) && state[key]).length;
  const label = document.getElementById('seq-progress-text');
  const fill = document.getElementById('seq-progress-fill');
  if (label) label.textContent = `Progreso: ${fmt(complete)}/6`;
  if (fill) fill.style.width = `${Math.min(100, Math.round((complete / 6) * 100))}%`;

  const totalAnswers = Object.keys(state).filter((key) => /^sec-\d+:\d+$/.test(key) && state[key]).length;
  document.querySelectorAll('[data-progress]').forEach((node) => {
    node.textContent = `Chequeos resueltos: ${totalAnswers}/18`;
  });
}

function inlineMathNodes(text) {
  if (typeof text !== 'string') return [String(text ?? '')];
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? h('span', { class: 'eq' }, part) : document.createTextNode(part),
  );
}

function makeToken(symbol, label, detail, noteBox, colour = 'yellow') {
  const isNode = typeof symbol === 'object' && symbol !== null;
  return h(
    'button',
    {
      type: 'button',
      class: `seq-annotated__token af-token af-token--${colour} seq-annotated__token--${colour}`,
      'aria-label': `${label}: ${typeof symbol === 'string' ? symbol : 'término'}`,
      on: {
        click: () => {
          mount(noteBox, h('strong', null, `${label}: `), ...inlineMathNodes(detail));
          noteBox.classList.remove('is-visible');
          void noteBox.offsetWidth;
          noteBox.classList.add('is-visible');
        },
      },
    },
    isNode ? symbol : h('span', { class: 'eq' }, symbol),
    h('span', { class: 'seq-annotated__label' }, label),
  );
}

/**
 * Ecuación interactiva anotada para cada sección de Logarítmicas.
 */
export function annotatedLogFormula(root, config = {}) {
  let state = {
    sectionId: config.sectionId || root.closest?.('section')?.id || null,
    k: config.k ?? 1,
    a: config.a ?? 2,
    m: config.m ?? 1,
    d: config.d ?? 0,
    c: config.c ?? 0,
  };

  const note = h('div', {
    class: 'seq-annotated__note-box',
    'aria-live': 'polite',
  });
  const formulaHost = h('div', { class: 'seq-annotated__formula log-annotated__formula' });
  const token = (symbol, label, detail, colour) => makeToken(symbol, label, detail, note, colour);

  function render() {
    const sId = state.sectionId;

    if (sId === 'sec-1') {
      const baseTok = token('a > 0, a ≠ 1', 'base admitida', 'Base positiva y distinta de 1: hereda la condición de la exponencial para mantener biyectividad y evitar constantes triviales (1ʸ = 1).', 'blue');
      const argTok = token('x > 0', 'argumento positivo', 'Aduana de existencia en ℝ: como aʸ > 0 para todo y real, x nunca puede ser cero ni negativo.', 'pink');
      const expTok = token('y ∈ ℝ', 'exponente resultado', 'El logaritmo devuelve el exponente y tal que aʸ = x. El resultado SÍ puede ser negativo, cero o positivo.', 'yellow');
      mount(
        formulaHost,
        h('span', { class: 'seq-annotated__equation' }, 'log', h('sub', null, baseTok), '(', argTok, ') = ', expTok, '  ⇔  aʸ = x'),
      );
      return;
    }

    if (sId === 'sec-2') {
      const prodTok = token('logₐ(x·y) = logₐx + logₐy', 'producto → suma', 'Multiplicar adentro del argumento suma logaritmos afuera. Jamás se separa logₐ(x + y).', 'yellow');
      const powTok = token('logₐ(xⁿ) = n·logₐx', 'potencia del argumento', 'Solo baja el exponente n si afecta al argumento x. En (logₐ x)² el cuadrado afecta a todo el logaritmo.', 'pink');
      const cobTok = token(h('span', null, 'logₐx = ', frac('log_b x', 'log_b a')), 'cambio de base', 'El argumento original va en el numerador y la base vieja queda siempre en el denominador.', 'blue');
      mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, prodTok, '   |   ', powTok, '   |   ', cobTok));
      return;
    }

    if (sId === 'sec-3') {
      const condTok = token('arg > 0', 'aduana previa', 'Antes de unificar términos, anotá las restricciones de cada argumento original en la ecuación o sistema.', 'pink');
      const subTok = token('u = logₐ(x) ∈ ℝ', 'sustitución sin restricción de signo', '¡Contraste vital! A diferencia de u = aˣ > 0, aquí la imagen del logaritmo es todo ℝ: u negativo SÍ produce raíces reales válidas.', 'green');
      const filterTok = token('descarte arg ≤ 0', 'control final', 'Toda candidata x que vuelva cero o negativo algún argumento original se rechaza como solución extraña.', 'yellow');
      mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, condTok, '  ⇒  ', subTok, '  ⇒  ', filterTok));
      return;
    }

    if (sId === 'sec-4') {
      const expTok = token('f(x) = 2eˣ − 3', 'exponencial', 'Dom(f) = ℝ, Im(f) = (−3; +∞) con asíntota horizontal y = −3.', 'blue');
      const mirrorTok = token('espejo y = x', 'simetría diagonal', 'Intercambia (t; f(t)) ↔ (f(t); t), convierte A.H. y = −3 en A.V. x = −3 y permuta Dominio por Imagen.', 'green');
      const invTok = token(h('span', null, 'f⁻¹(x) = ln(', frac('x + 3', '2'), ')'), 'inversa logarítmica', 'Definida en su dominio natural Dom(f⁻¹) = (−3; +∞) hacia ℝ.', 'yellow');
      mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, expTok, '  ↔  ', mirrorTok, '  ↔  ', invTok));
      return;
    }

    if (sId === 'sec-5') {
      const domTok = token('mx + d > 0', 'dominio abierto', 'Determina de qué lado de la asíntota vive la gráfica: si m > 0 va a la derecha; si m < 0 (ej. 4 − x > 0) va a la izquierda (−∞; 4).', 'pink');
      const avTok = token('A.V.: x = −d/m', 'asíntota vertical', 'Recta vertical inalcanzable donde el argumento se anula; siempre lleva paréntesis abierto en el dominio.', 'blue');
      const rootTok = token('C₀: mx + d = a^(−c/k)', 'raíz única', 'Como Im(f) = ℝ, toda función logarítmica corta al eje X exactamente en un punto.', 'yellow');
      mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, 'f(x) = k·logₐ(', domTok, ') + c   |   ', avTok, '   |   ', rootTok));
      return;
    }

    if (sId === 'sec-6') {
      const isoTok = token('e^(kt) = N/N₀', 'aislar potencia', 'Antes de aplicar ln o log, despejá el coeficiente inicial hasta dejar la potencia completamente sola.', 'blue');
      const timeTok = token(h('span', null, 't = ', frac('ln(N/N₀)', 'k')), 'bajar el tiempo', 'Al aplicar logaritmo en ambos miembros, la incógnita temporal t baja del exponente.', 'yellow');
      const richterTok = token('ΔM ⇒ × 10^ΔM', 'escala logarítmica', 'Subir ΔM puntos en Richter multiplica la potencia sísmica por 10^ΔM: nunca es una regla de tres lineal.', 'pink');
      mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, isoTok, '  ⇒  ', timeTok, '   |   ', richterTok));
      return;
    }

    const kTok = token(fmt(state.k), 'escala k', 'Factor vertical; si k < 0 invierte verticalmente la curva y cambia su monotonía.', 'pink');
    const aTok = token(state.a === Math.E ? 'e' : fmt(state.a), 'base a', 'Base positiva ≠ 1.', 'yellow');
    const argTok = token(`${fmt(state.m)}x ${state.d >= 0 ? '+ ' + fmt(state.d) : '− ' + fmt(-state.d)}`, 'argumento', 'Exige ser estrictamente positivo para definir el dominio abierto.', 'blue');
    mount(formulaHost, h('span', { class: 'seq-annotated__equation' }, 'f(x) = ', kTok, ' · log', h('sub', null, aTok), '(', argTok, ') + ', fmt(state.c)));
  }

  mount(root, formulaHost, note);
  render();

  return {
    update(newState) {
      state = { ...state, ...newState };
      render();
    },
    element: root,
  };
}

function mountQuestionPrompt(question) {
  return h('div', { class: 'log-check__prompt seq-check__prompt' }, ...inlineMathNodes(question.prompt));
}

function buildAnswerControl(question, questionIndex) {
  if (question.type === 'choice') {
    const selected = { value: null };
    const buttons = question.options.map((optionText, index) => {
      const btn = h(
        'button',
        {
          type: 'button',
          class: 'chip chip--ghost log-choice-btn',
          'aria-pressed': 'false',
        },
        ...inlineMathNodes(optionText),
      );
      btn.addEventListener('click', () => {
        selected.value = index;
        buttons.forEach((item, itemIndex) => {
          item.classList.toggle('is-active', itemIndex === index);
          item.classList.toggle('chip--ghost', itemIndex !== index);
          item.setAttribute('aria-pressed', String(itemIndex === index));
        });
      });
      return btn;
    });
    return {
      node: h(
        'div',
        {
          class: 'seq-controls log-choice',
          role: 'group',
          'aria-label': `Opciones del ejercicio ${questionIndex + 1}`,
        },
        buttons,
      ),
      value: () => selected.value,
      hasSelection: () => selected.value !== null && Number.isInteger(selected.value),
      preview: () => (selected.value === null ? 'Elegí una opción' : question.options[selected.value]),
      disable: () => {
        buttons.forEach((b) => { b.disabled = true; });
      },
    };
  }
  if (question.type === 'pair') {
    const first = h('input', {
      type: 'text',
      inputmode: 'decimal',
      'aria-label': question.firstLabel || 'Primer valor',
    });
    const second = h('input', {
      type: 'text',
      inputmode: 'decimal',
      'aria-label': question.secondLabel || 'Segundo valor',
    });
    return {
      node: h(
        'div',
        { class: 'log-pair-inputs' },
        h('label', null, question.firstLabel || 'x', first),
        h('label', null, question.secondLabel || 'y', second),
      ),
      value: () => [first.value, second.value],
      preview: () => `${question.firstLabel || 'x'}: ${first.value || '—'}; ${question.secondLabel || 'y'}: ${second.value || '—'}`,
      inputs: [first, second],
      disable: () => {
        first.disabled = true;
        second.disabled = true;
      },
    };
  }
  const answer = h('input', {
    type: 'text',
    inputmode: question.type === 'number' ? 'decimal' : 'text',
    autocomplete: 'off',
    placeholder: question.placeholder || 'Ingresá tu respuesta',
    'aria-label': `Respuesta del ejercicio ${questionIndex + 1}`,
  });
  return {
    node: answer,
    value: () => answer.value,
    preview: () => answer.value || '—',
    inputs: [answer],
    disable: () => {
      answer.disabled = true;
    },
  };
}

export function assess(question, value) {
  if (question.type === 'choice') {
    if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
      return {
        correct: false,
        empty: true,
        diagnostics: [{ id: null, message: 'Seleccioná una opción antes de revisar.' }],
      };
    }
    const numVal = typeof value === 'number' ? value : Number(String(value).trim());
    const correct = Number.isInteger(numVal) && numVal >= 0 && numVal === question.expected;
    return {
      correct,
      empty: false,
      diagnostics: correct
        ? []
        : [{ id: question.diagnosis, message: question.diagnosisMessage }],
    };
  }
  if (question.type === 'pair') {
    if (!Array.isArray(value) || value.some((entry) => String(entry ?? '').trim() === '')) {
      return {
        correct: false,
        empty: true,
        diagnostics: [{ id: null, message: 'Completá ambos casilleros antes de revisar.' }],
      };
    }
    const parseCell = (entry) => {
      const s = String(entry).trim().replace(',', '.');
      if (/^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(s)) {
        const [n, d] = s.split('/').map(Number);
        return d !== 0 ? n / d : NaN;
      }
      return Number(s);
    };
    const actual = value.map(parseCell);
    const correct =
      actual.every(Number.isFinite) &&
      actual.every((entry, index) => Math.abs(entry - question.expected[index]) < 1e-4);
    return {
      correct,
      empty: false,
      diagnostics: correct
        ? []
        : [
            {
              id: question.diagnosis !== undefined ? question.diagnosis : 'accepted_extraneous_root_in_log_eq',
              message:
                question.diagnosisMessage ||
                'Revisá cada coordenada por separado y verificá que tanto x como y sean positivas.',
            },
          ],
    };
  }
  const raw = String(value ?? '').trim();
  if (!raw) {
    return {
      correct: false,
      empty: true,
      diagnostics: [{ id: null, message: 'Ingresá una respuesta antes de revisar.' }],
    };
  }
  const diag = diagnoseLog(raw, { expected: question.expected, ...(question.spec || {}) });
  const passedCheck = typeof question.checkCorrect === 'function' ? Boolean(question.checkCorrect(raw)) : false;
  const isCorrect = diag === null && passedCheck;
  return {
    correct: isCorrect,
    empty: false,
    diagnostics: diag ? [diag] : [],
  };
}

export function createCheckBlock(host, questions, sectionId, onComplete) {
  let successStreak = 0;
  const cards = questions.map((question, index) => {
    let failStreak = 0;
    let hintStep = 0;
    let solutionRevealed = false;
    let solved = false;

    const answer = buildAnswerControl(question, index);
    const preview = h(
      'p',
      { class: 'log-check__preview seq-check__preview', 'aria-live': 'polite' },
      'Interpretado como: —',
    );
    const feedback = h('p', {
      class: 'log-check__feedback seq-check__feedback',
      'aria-live': 'polite',
    });
    const hintBox = h('p', {
      class: 'log-check__hint seq-check__hint',
      hidden: true,
    });
    const solutionBox = h('div', {
      class: 'log-check__solution seq-check__solution',
      hidden: true,
    });

    const updatePreview = () =>
      mount(preview, 'Interpretado como: ', ...inlineMathNodes(answer.preview()));
    answer.inputs?.forEach((input) => input.addEventListener('input', updatePreview));
    answer.node.querySelectorAll?.('button').forEach((button) =>
      button.addEventListener('click', updatePreview),
    );

    const review = h('button', { type: 'button', class: 'btn' }, chalkIcon('check'), ' Revisar');
    const hint = h('button', { type: 'button', class: 'btn btn--ghost' }, chalkIcon('hint'), ' Pista (0/3)');
    const show = h('button', { type: 'button', class: 'btn btn--ghost' }, chalkIcon('book'), ' Ver solución explicada');

    hint.addEventListener('click', () => {
      hintStep = Math.min(hintStep + 1, 3);
      hintBox.hidden = false;
      mount(hintBox, `Pista ${hintStep}/3: `, ...inlineMathNodes(question.hints[hintStep - 1]));
      mount(hint, chalkIcon('hint'), ` Pista (${hintStep}/3)`);
      hint.setAttribute('aria-label', `Mostrar pista ${Math.min(hintStep + 1, 3)} de 3`);
      if (hintStep >= 3) hint.disabled = true;
      react({
        pose: ['pensativa', 'explicando', 'evaluando'][hintStep - 1],
        tag: `Pista ${hintStep} de 3`,
        html: question.hints[hintStep - 1],
      });
    });

    show.addEventListener('click', () => {
      solutionRevealed = true;
      successStreak = 0;
      solutionBox.hidden = false;
      show.disabled = true;
      hint.disabled = true;
      mount(
        solutionBox,
        h('strong', null, 'Resolución paso a paso'),
        h('ol', null, ...question.solution.map((step) => h('li', null, ...inlineMathNodes(step)))),
      );
      playScript([STREAK_REACTIONS.showSolution, STREAK_REACTIONS.solutionAfter]);

      if (!solved) {
        solved = true;
        saveProgress(`${sectionId}:${index}`, 'assisted');
        card.classList.add('is-solved', 'is-assisted');
        card.classList.remove('is-independent');
        feedback.textContent = 'Solución revelada (resuelto con apoyo).';
        feedback.className = 'log-check__feedback seq-check__feedback is-correct is-assisted';
        review.disabled = true;
        answer.disable?.();
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintStep,
          solutionRevealed: true,
          diagnosticId: null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });

        if (questions.every((_, position) => getProgress()[`${sectionId}:${position}`])) {
          saveProgress(sectionId, true);
          markSectionCompleted(sectionId);
          onComplete?.(sectionId);
        }
      }
    });

    const card = h(
      'li',
      {
        class: 'log-check__item seq-check__card',
        'data-question-type': question.type,
        'data-question-id': question.id,
      },
      mountQuestionPrompt(question),
      h('div', { class: 'log-check__answer' }, answer.node),
      preview,
      h('div', { class: 'log-check__actions' }, review, hint, show),
      feedback,
      hintBox,
      solutionBox,
    );

    const savedStatus = getProgress()[`${sectionId}:${index}`];
    if (savedStatus) {
      solved = true;
      card.classList.add('is-solved', savedStatus === 'independent' ? 'is-independent' : 'is-assisted');
      feedback.textContent =
        savedStatus === 'independent'
          ? 'Resuelto de forma independiente.'
          : 'Resuelto con apoyo (asistido).';
      feedback.className = `log-check__feedback seq-check__feedback is-correct ${savedStatus === 'independent' ? 'is-independent' : 'is-assisted'}`;
      review.disabled = true;
      hint.disabled = true;
      show.disabled = true;
      answer.disable?.();
    }

    review.addEventListener('click', () => {
      if (question.type === 'choice') {
        const activeBtn = answer.node.querySelector?.('.log-choice-btn.is-active, button[aria-pressed="true"]');
        const hasSel = typeof answer.hasSelection === 'function' ? answer.hasSelection() : answer.value() !== null;
        if (!activeBtn || answer.value() === null || !hasSel) {
          feedback.textContent = 'Seleccioná una opción antes de revisar.';
          feedback.className = 'log-check__feedback seq-check__feedback is-warning';
          return;
        }
      }

      const result = assess(question, answer.value());
      if (result.empty) {
        feedback.textContent = result.diagnostics[0]?.message || 'Ingresá una respuesta antes de revisar.';
        feedback.className = 'log-check__feedback seq-check__feedback is-warning';
        return;
      }

      if (result.correct) {
        const isIndependent = hintStep === 0 && !solutionRevealed;
        const status = isIndependent ? 'independent' : 'assisted';
        solved = true;
        saveProgress(`${sectionId}:${index}`, status);
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: true,
          mode: status,
          hintsUsed: hintStep,
          solutionRevealed,
          diagnosticId: null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });

        card.classList.add('is-solved');
        card.classList.remove('is-independent', 'is-assisted');
        card.classList.add(isIndependent ? 'is-independent' : 'is-assisted');

        if (isIndependent) {
          feedback.textContent = 'Correcto: deducción independiente impecable.';
          feedback.className = 'log-check__feedback seq-check__feedback is-correct is-independent';
          if (failStreak > 0) {
            playScript([STREAK_REACTIONS.recovered]);
            successStreak = 1;
          } else {
            successStreak += 1;
            if (successStreak >= 3) playScript([STREAK_REACTIONS.flawlessRun]);
            else playScript([STREAK_REACTIONS.firstTry]);
          }
        } else {
          feedback.textContent = 'Resuelto con apoyo (asistido). El razonamiento quedó verificado.';
          feedback.className = 'log-check__feedback seq-check__feedback is-correct is-assisted';
        }

        failStreak = 0;
        review.disabled = true;
        hint.disabled = true;
        show.disabled = true;
        answer.disable?.();

        if (questions.every((_, position) => getProgress()[`${sectionId}:${position}`])) {
          saveProgress(sectionId, true);
          markSectionCompleted(sectionId);
          onComplete?.(sectionId);
        }
      } else {
        successStreak = 0;
        failStreak += 1;
        const diagnostic = result.diagnostics?.[0];
        recordCompetencyAttempt({
          competencyId: question.competencyId,
          correct: false,
          mode: hintStep === 0 && !solutionRevealed ? 'independent' : 'assisted',
          hintsUsed: hintStep,
          solutionRevealed,
          diagnosticId: diagnostic?.id || null,
          exerciseId: question.id,
          stage: question.stage || 'guided_practice',
          representation: question.representation || 'symbolic',
          transferDistance: question.transferDistance || 'near',
        });
        feedback.textContent =
          diagnostic?.message || 'Todavía no coincide: mirá las pistas y revisá la condición de existencia.';
        feedback.className = 'log-check__feedback seq-check__feedback is-error';
        const reaction = diagnostic?.id && DIAGNOSE_REACTIONS[diagnostic.id];
        if (reaction) {
          playScript([reaction]);
        } else if (failStreak >= 2) {
          playScript([STREAK_REACTIONS.repeatedError]);
        } else {
          react({
            pose: diagnostic?.pose || 'sospecha',
            tag: 'Revisemos el paso',
            html: feedback.textContent,
          });
        }
      }
    });

    return card;
  });

  mount(host, h('ol', { class: 'log-check seq-check' }, cards));
  return cards;
}

export const mountCheckBlock = createCheckBlock;

export function bindTutorButtons(root = document) {
  const shortNames = ['definicion', 'propiedades', 'ecuaciones', 'espejo', 'radiografia', 'modelos'];
  root.querySelectorAll('[data-tutor], .vn-trigger-btn').forEach((button) => {
    if (button.dataset.tutorReady) return;
    button.dataset.tutorReady = 'true';
    button.addEventListener('click', () => {
      const sectionNumber = Number(button.closest('section')?.id.match(/\d+/)?.[0]) || 1;
      const scriptType = button.dataset.tutor || 'why';
      const key =
        scriptType === 'base'
          ? `sec${sectionNumber}-base`
          : `sec${sectionNumber}-${shortNames[sectionNumber - 1]}`;
      if (VN_SCRIPTS[key]) playScript(VN_SCRIPTS[key]);
      else if (button.dataset.vnScript && VN_SCRIPTS[button.dataset.vnScript]) {
        playScript(VN_SCRIPTS[button.dataset.vnScript]);
      }
    });
  });
}

export function mountProgress() {
  if (typeof document !== 'undefined') {
    const state = getProgress();
    Object.keys(state).forEach((key) => {
      if (/^sec-\d+$/.test(key) && state[key]) {
        const statusEl = document.querySelector(`.seq-sidebar__link[data-sec="${key}"] .seq-sidebar__status`);
        if (statusEl) {
          statusEl.classList.add('is-done');
          statusEl.replaceChildren(chalkIcon('check', 14));
        }
      }
    });
  }
  updateProgressUI();
}
