/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Componentes transversales: annotatedQuadFormula, threeFormsRosettaStrip,
 * createCheckBlock, bindTutorButtons y mountProgress.
 */

import { h, clear, frac, chalkIcon } from '../../core/dom.js';
import { playClick, playSuccess, playError } from '../../core/sound.js';
import { playScript, react } from '../../core/vn.js';
import {
  fromPolynomial,
  diagnoseQuad,
  equivalentQuadExpr,
  parseNumberOrFraction,
  parseOrderedPair,
  equivalentSetExactas,
  fmtNumClean,
} from './logic.js';
import { SCRIPTS, DIAGNOSE_REACTIONS, STREAK_REACTIONS } from './vn-scripts.js';

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

export const PROGRESS_KEY = 'cuadraticas:progreso:v1';

let globalStreak = 0;

export function getProgress() {
  try {
    if (typeof localStorage === 'undefined' || !localStorage.getItem) return {};
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
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
  } catch {
    // La sesión continúa aunque se exceda la cuota de almacenamiento
  }
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

const TOKEN_NOTES = {
  a: {
    label: 'Coeficiente principal a',
    note: 'Decide la concavidad (a > 0 abre hacia arriba ∪ con mínimo; a < 0 abre hacia abajo ∩ con máximo) y la velocidad de apertura vertical en escalones 1a, 4a, 9a.',
  },
  b: {
    label: 'Coeficiente lineal b',
    note: 'Inclinación al cruzar el eje Y; combinado con "a" determina la posición del eje de simetría xᵥ = −b / (2a).',
  },
  c: {
    label: 'Ordenada al origen c = f(0)',
    note: 'Altura exacta donde la parábola corta al eje vertical Y cuando reemplazás x = 0: punto (0; c).',
  },
  xv: {
    label: 'Abscisa del vértice xᵥ (Eje de simetría)',
    note: 'Coordenada horizontal donde la parábola pega la vuelta y punto de quiebre de los intervalos de crecimiento y decrecimiento. En la forma canónica (x − xᵥ)² se lee con signo cambiado.',
  },
  yv: {
    label: 'Ordenada del vértice yᵥ = f(xᵥ)',
    note: 'Altura mínima (si a > 0) o máxima (si a < 0) que alcanza la parábola. Define el borde con corchete cerrado de la Imagen: [yᵥ; +∞) o (−∞; yᵥ].',
  },
  x1: {
    label: 'Primera raíz real x₁',
    note: 'Abscisa donde la parábola corta o toca el eje horizontal X: f(x₁) = 0 porque anula el factor (x − x₁).',
  },
  x2: {
    label: 'Segunda raíz real x₂',
    note: 'Segunda abscisa donde f(x₂) = 0. El eje de simetría xᵥ cae siempre en el promedio exacto (x₁ + x₂) / 2.',
  },
  delta: {
    label: 'Discriminante Δ = b² − 4ac',
    note: 'Radar bajo la raíz cuadrada: si Δ > 0 hay 2 raíces reales distintas; si Δ = 0 hay 1 raíz doble (rebota en el eje X); si Δ < 0 no corta al eje X en ℝ.',
  },
};

/**
 * Renderiza una fórmula cuadrática anotada con tokens interactivos que explican
 * el rol geométrico de cada parámetro al tocar o pasar el mouse.
 */
export function annotatedQuadFormula(spec = {}) {
  const form = spec.form || 'canonical';
  const a = spec.a ?? 1;
  const b = spec.b ?? -6;
  const c = spec.c ?? 5;
  const model = fromPolynomial({ a, b, c });

  const wrap = h('div', { class: 'quad-annotated-formula' });
  const eqLine = h('div', { class: 'quad-annotated-eq eq' });
  const readout = h('div', { class: 'quad-annotated-note' }, [
    chalkIcon('spark', 15),
    h(
      'span',
      {},
      ' Tocá o pasá el cursor sobre cada pieza resaltada de la fórmula para ver qué controla en el dibujo.'
    ),
  ]);

  const makeToken = (key, contentNodes, colorClass = 'tok-yellow') => {
    const info = TOKEN_NOTES[key] || TOKEN_NOTES.a;
    const btn = h(
      'button',
      {
        type: 'button',
        class: `quad-formula-token ${colorClass}`,
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

  if (form === 'polynomial') {
    eqLine.append(
      h('span', {}, 'f(x) = '),
      makeToken('a', [fmtNumClean(model.a)], 'tok-pink'),
      h('span', {}, 'x'),
      h('sup', {}, '2')
    );
    if (Math.abs(model.b) > 1e-9) {
      eqLine.append(
        h('span', {}, model.b >= 0 ? ' + ' : ' − '),
        makeToken('b', [fmtNumClean(Math.abs(model.b))], 'tok-blue'),
        h('span', {}, 'x')
      );
    }
    if (Math.abs(model.c) > 1e-9) {
      eqLine.append(
        h('span', {}, model.c >= 0 ? ' + ' : ' − '),
        makeToken('c', [fmtNumClean(Math.abs(model.c))], 'tok-green')
      );
    }
  } else if (form === 'factored' && model.roots.length >= 1) {
    const r1 = model.roots[0];
    const r2 = model.roots.length === 2 ? model.roots[1] : model.roots[0];
    eqLine.append(
      h('span', {}, 'f(x) = '),
      makeToken('a', [fmtNumClean(model.a)], 'tok-pink'),
      h('span', {}, ' · (x '),
      h('span', {}, r1 >= 0 ? '− ' : '+ '),
      makeToken('x1', [fmtNumClean(Math.abs(r1))], 'tok-green'),
      h('span', {}, ') · (x '),
      h('span', {}, r2 >= 0 ? '− ' : '+ '),
      makeToken('x2', [fmtNumClean(Math.abs(r2))], 'tok-green'),
      h('span', {}, ')')
    );
  } else if (form === 'resolvente') {
    eqLine.append(
      h('span', {}, 'x'),
      h('sub', {}, '1,2'),
      h('span', {}, ' = '),
      makeToken('xv', ['−', frac('b', '2a')], 'tok-yellow'),
      h('span', {}, ' ± '),
      frac(
        h('span', {}, ['√', makeToken('delta', ['b² − 4ac'], 'tok-green')]),
        h('span', {}, ['2', makeToken('a', ['a'], 'tok-pink')])
      )
    );
  } else {
    // canonical
    const { xv, yv } = model.vertex;
    eqLine.append(
      h('span', {}, 'f(x) = '),
      makeToken('a', [fmtNumClean(model.a)], 'tok-pink')
    );
    if (Math.abs(xv) > 1e-9) {
      eqLine.append(
        h('span', {}, ' · (x '),
        h('span', {}, xv >= 0 ? '− ' : '+ '),
        makeToken('xv', [fmtNumClean(Math.abs(xv))], 'tok-yellow'),
        h('span', {}, ')'),
        h('sup', {}, '2')
      );
    } else {
      eqLine.append(
        h('span', {}, ' · x'),
        h('sup', {}, '2')
      );
    }
    if (Math.abs(yv) > 1e-9) {
      eqLine.append(
        h('span', {}, yv >= 0 ? ' + ' : ' − '),
        makeToken('yv', [fmtNumClean(Math.abs(yv))], 'tok-blue')
      );
    }
  }

  wrap.append(eqLine, readout);
  return wrap;
}

/**
 * Barra traductora en vivo que muestra las 3 vestimentas equivalentes de la misma parábola
 * (Polinómica <-> Canónica <-> Factorizada) y qué dato regala cada una a simple vista.
 */
export function threeFormsRosettaStrip(state = { a: 1, b: -6, c: 5 }) {
  const model = fromPolynomial({
    a: state.a ?? 1,
    b: state.b ?? -6,
    c: state.c ?? 5,
  });

  const strip = h('div', { class: 'quad-rosetta-strip' });

  const polyCard = h('div', { class: 'quad-rosetta-card is-poly' }, [
    h('div', { class: 'quad-rosetta-head' }, '1. Forma Polinómica'),
    h('div', { class: 'quad-rosetta-eq eq' }, `f(x) = ${model.forms.polynomial}`),
    h(
      'div',
      { class: 'quad-rosetta-gift' },
      `Regala la ordenada al origen: f(0) = ${fmtNumClean(model.c)} → (0; ${fmtNumClean(model.c)})`
    ),
  ]);

  const canonCard = h('div', { class: 'quad-rosetta-card is-canon' }, [
    h('div', { class: 'quad-rosetta-head' }, '2. Forma Canónica'),
    h('div', { class: 'quad-rosetta-eq eq' }, `f(x) = ${model.forms.canonical}`),
    h(
      'div',
      { class: 'quad-rosetta-gift' },
      `Regala el vértice y el eje: V(${fmtNumClean(model.vertex.xv)}; ${fmtNumClean(
        model.vertex.yv
      )}) · Eje x = ${fmtNumClean(model.vertex.xv)}`
    ),
  ]);

  let factEqText = '';
  let factGiftText = '';
  if (model.discriminant < -1e-9) {
    factEqText = 'No factorizable en ℝ (Δ < 0)';
    factGiftText = `Sin raíces reales (Δ = ${fmtNumClean(model.discriminant)} < 0 → C₀ = ∅)`;
  } else if (
    model.radicalDecomposition &&
    !model.radicalDecomposition.isExactRational
  ) {
    const rMinus = model.radicalDecomposition.formattedMinus;
    const rPlus = model.radicalDecomposition.formattedPlus;
    const aStr =
      model.a === 1 ? '' : model.a === -1 ? '−' : `${fmtNumClean(model.a)}·`;
    factEqText = `f(x) = ${aStr}(x − (${rMinus}))(x − (${rPlus}))`;
    factGiftText = `Regala las raíces irracionales exactas: x₁ = ${rMinus}, x₂ = ${rPlus}`;
  } else {
    factEqText = `f(x) = ${model.forms.factored}`;
    factGiftText =
      model.roots.length === 1
        ? `Regala la raíz doble (rebote): x₁ = x₂ = ${fmtNumClean(model.roots[0])}`
        : `Regala las raíces en el eje X: x₁ = ${fmtNumClean(
            model.roots[0]
          )}, x₂ = ${fmtNumClean(model.roots[1])}`;
  }

  const factCard = h('div', { class: 'quad-rosetta-card is-fact' }, [
    h('div', { class: 'quad-rosetta-head' }, '3. Forma Factorizada'),
    h('div', { class: 'quad-rosetta-eq eq' }, factEqText),
    h('div', { class: 'quad-rosetta-gift' }, factGiftText),
  ]);

  strip.append(polyCard, canonCard, factCard);
  return strip;
}

/**
 * Crea un bloque de pregunta individual dentro de los chequeos de cada sección.
 */
export function buildSingleQuestionCard(item, idx, { vn, onItemSolved, sectionId = null, restoredStatus = null } = {}) {
  let hintCursor = 0;
  let solutionRevealed = false;
  let solved = false;

  const card = h('article', {
    class: 'pr-check-card quad-check-card',
    'data-check-id': item.id,
    'data-competency': item.competencyId,
  });

  const head = h('div', { class: 'pr-check-head' }, [
    h('span', { class: 'pr-check-num' }, `Desafío ${idx + 1}`),
    h('span', { class: 'quad-comp-tag' }, item.competencyId),
  ]);

  const promptEl = h('p', { class: 'pr-check-prompt' }, item.prompt);
  const controlsWrap = h('div', { class: 'quad-check-controls' });
  const hintsContainer = h('div', { class: 'quad-check-hints', hidden: '' });
  const feedbackEl = h('div', {
    class: 'pr-check-feedback',
    role: 'status',
    'aria-live': 'polite',
  });

  const hintBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary quad-hint-btn' },
    [chalkIcon('bulb', 14), ` Pista (0/${item.hints.length})`]
  );

  const solutionBtn = h(
    'button',
    { type: 'button', class: 'pr-btn pr-btn-secondary quad-solution-btn' },
    [chalkIcon('spark', 14), ' Ver solución explicada']
  );

  hintBtn.addEventListener('click', () => {
    playClick();
    if (hintCursor < item.hints.length) {
      hintsContainer.removeAttribute('hidden');
      const hintLine = h('div', { class: 'quad-hint-item' }, item.hints[hintCursor]);
      hintsContainer.appendChild(hintLine);
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
    if (isIndependent) {
      globalStreak += 1;
    }
    card.classList.add('is-solved');
    card.classList.add(isIndependent ? 'is-independent' : 'is-assisted');
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
      ? DIAGNOSE_REACTIONS[diagId] || diagnoseQuad(rawVal, item.diagContext || {})
      : diagnoseQuad(rawVal, {
          ...(item.diagContext || {}),
          diagnosticMap: item.diagnosticMap,
        });

    if (diag) {
      const msg = diag.message || diag.text;
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent = msg;
      triggerVnReaction(vn, diag.pose || 'pensativa', msg, diag.tag || diag.shortLabel || 'Revisemos el paso');
    } else {
      feedbackEl.className = 'pr-check-feedback is-error';
      feedbackEl.textContent =
        'Todavía no coincide. Desplegá una pista progresiva para revisar el paso algebraico intermedio.';
    }
  };

  if (item.kind === 'choice' && Array.isArray(item.options)) {
    const optGroup = h('div', { class: 'pr-options quad-options' });
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

    const actionBar = h('div', { class: 'pr-chip-row quad-check-bar' }, [hintBtn, solutionBtn]);
    controlsWrap.append(optGroup, actionBar);
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
      if (item.expected != null) {
        input.value = String(item.expected);
      }
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

      if (item.kind === 'number') {
        try {
          const val = parseNumberOrFraction(raw);
          if (Math.abs(val - Number(item.expected)) < 1e-6) {
            markSuccess();
          } else {
            markFailure(raw);
          }
        } catch {
          feedbackEl.className = 'pr-check-feedback is-warn';
          feedbackEl.textContent = 'Formato numérico inválido. Usá enteros, decimales o fracciones como -3/2.';
        }
        return;
      }

      if (item.kind === 'pair') {
        try {
          const pUser = parseOrderedPair(raw);
          const pExp = parseOrderedPair(item.expected);
          if (
            Math.abs(pUser.x - pExp.x) < 1e-6 &&
            Math.abs(pUser.y - pExp.y) < 1e-6
          ) {
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

      if (item.kind === 'set' || item.kind === 'interval') {
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

      // expression
      const eq = equivalentQuadExpr(raw, item.expected, item.requireForm || null);
      if (eq.status === 'syntax_error') {
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

    const row = h('div', { class: 'pr-chip-row quad-check-bar' }, [
      input,
      submitBtn,
      hintBtn,
      solutionBtn,
    ]);
    controlsWrap.appendChild(row);
  }

  if (restoredStatus) {
    solved = true;
    card.classList.add('is-solved');
    card.classList.add(restoredStatus === 'independent' ? 'is-independent' : 'is-assisted');
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

  const header = h('div', { class: 'quad-checks-header' }, [
    h('h3', { class: 'quad-checks-title' }, [
      chalkIcon('check', 16),
      ' Chequeo de comprensión paso a paso',
    ]),
    h(
      'span',
      { class: 'quad-checks-progress' },
      `0 / ${questions.length} completados`
    ),
  ]);

  const updateProgressHeader = () => {
    const el = header.querySelector('.quad-checks-progress');
    if (el) el.textContent = `${solvedIds.size} / ${questions.length} completados`;
  };

  const grid = h('div', { class: 'quad-checks-grid' });
  questions.forEach((q, idx) => {
    const restoredStatus = progress[q.id] || null;
    if (restoredStatus) {
      solvedIds.add(q.id);
    }
    const card = buildSingleQuestionCard(q, idx, {
      vn,
      sectionId,
      restoredStatus,
      onItemSolved: (id, status) => {
        solvedIds.add(id);
        updateProgressHeader();
        const allSolved = questions.length > 0 && questions.every((it) => solvedIds.has(it.id));
        if (allSolved) {
          if (sectionId) {
            markSectionCompleted(sectionId);
          }
          if (typeof onSectionDone === 'function') {
            onSectionDone(sectionId);
          }
        }
      },
    });
    grid.appendChild(card);
  });

  updateProgressHeader();
  mountNode.append(header, grid);

  const allSolved = questions.length > 0 && questions.every((it) => solvedIds.has(it.id));
  if (allSolved) {
    if (sectionId) {
      markSectionCompleted(sectionId);
    }
    if (typeof onSectionDone === 'function') {
      onSectionDone(sectionId);
    }
  }
}

export const mountCheckBlock = createCheckBlock;

/**
 * Conecta los botones de tutoría de Alaska ([data-vn-trigger], [data-tutor]) con el controlador VN.
 */
export function bindTutorButtons(root = document, { vn } = {}) {
  const buttons = root.querySelectorAll('[data-vn-trigger], [data-tutor], .vn-trigger-btn');
  for (const btn of buttons) {
    if (btn.dataset.vnBound === '1') continue;
    btn.dataset.vnBound = '1';
    btn.addEventListener('click', () => {
      playClick();
      const key = btn.getAttribute('data-vn-trigger') || btn.getAttribute('data-script-id');
      const script = SCRIPTS[key];
      if (script) {
        triggerVnScript(vn, script, btn.textContent.trim());
      }
    });
  }
}

export function mountProgress(progressEl, solvedSections = new Set(), totalSections = 10) {
  if (!progressEl) return;
  const count = solvedSections.size ?? 0;
  const pct = Math.round((count / totalSections) * 100);
  progressEl.textContent = `${count}/${totalSections} pizarrones (${pct}%)`;
}
