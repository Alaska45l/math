/**
 * @file js/modules/circuitos/checks.js
 * Chequeos graduados (9 ejercicios en 3 bloques) y caja POE para Desigualdades.
 */

import { h, mount, chalkIcon } from '../../core/dom.js';
import { INF, iv, formatSet, MINUS } from '../../core/math-format.js';
import { react } from '../../core/vn.js';
import { playSuccess, playError } from '../../core/sound.js';
import {
  parseIntervalSet,
  equivalentIntervalSet,
  solveLinearInequality,
  solveChainedInequality,
  solveFactoredQuadratic,
  diagnoseInequality,
} from './logic.js';
import { recordCircuitosAttempt } from './learning-adapter.js';
import { CIRCUITOS_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';

export const PROGRESS_KEY = 'desigualdades:progreso:v1';

export function getProgress() {
  try {
    if (typeof localStorage === 'undefined' || !localStorage.getItem) return {};
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(key, mode = 'independent') {
  if (!key || typeof key !== 'string') return getProgress();
  const state = getProgress();
  const prev = state[key];
  state[key] = prev === 'assisted' || mode === 'assisted' ? 'assisted' : 'independent';
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    }
  } catch {}
  return state;
}

export const CHECKS_DATA = Object.freeze([
  // Bloque 1: sec-intervalos (inequalities.intervals_and_number_line)
  {
    id: 'circ-sec1-q1',
    sectionId: 'sec-intervalos',
    competencyId: 'inequalities.intervals_and_number_line',
    prerequisiteIds: [],
    family: 'intervals_translation',
    representation: 'symbolic',
    difficulty: 1,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['swapped_open_closed_bracket', 'swapped_interval_bounds'],
    type: 'interval',
    prompt: 'Escribí en notación de intervalo el conjunto A = {x ∈ ℝ / −3 ≤ x ≤ 2}.',
    placeholder: 'Ej: [a; b]',
    expectedSet: [iv(-3, 2, true, true)],
    hints: [
      'Identificá el extremo izquierdo (menor) y el extremo derecho (mayor) en la recta real.',
      'El signo ≤ indica que ambos extremos están incluidos en el conjunto.',
      'Usá corchetes en ambos lados, separando el menor y el mayor con punto y coma.',
    ],
    solution: [
      'El extremo menor es −3 y el mayor es 2.',
      'Como ambas desigualdades son ≤ (menor o igual), los dos puntos pertenecen al conjunto.',
      'Por lo tanto, el intervalo es [−3; 2].',
    ],
    diagnosticContext: {
      expectedSet: [iv(-3, 2, true, true)],
    },
  },
  {
    id: 'circ-sec1-q2',
    sectionId: 'sec-intervalos',
    competencyId: 'inequalities.intervals_and_number_line',
    prerequisiteIds: [],
    family: 'intervals_translation',
    representation: 'symbolic',
    difficulty: 1,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['closed_bracket_on_infinity', 'swapped_open_closed_bracket'],
    type: 'interval',
    prompt: 'Expresá como intervalo todos los números reales menores estrictos que 4 (x < 4).',
    placeholder: 'Ej: (-inf; a)',
    expectedSet: [iv(-INF, 4, false, false)],
    hints: [
      'Todos los x a la izquierda de 4 pertenecen al conjunto, sin tope inferior.',
      'El infinito negativo (−∞) siempre lleva paréntesis abierto porque no es un número real.',
      'Como la desigualdad es estricta (<), el 4 queda excluido con paréntesis abierto; podés escribir -inf para −∞.',
    ],
    solution: [
      'No hay límite inferior: el intervalo arranca en −∞ con paréntesis abierto.',
      'El límite superior es 4, y como dice x < 4 (sin el igual), el 4 no está incluido.',
      'El intervalo queda (−∞; 4).',
    ],
    diagnosticContext: {
      expectedSet: [iv(-INF, 4, false, false)],
    },
  },
  {
    id: 'circ-sec1-q3',
    sectionId: 'sec-intervalos',
    competencyId: 'inequalities.intervals_and_number_line',
    prerequisiteIds: [],
    family: 'intervals_translation',
    representation: 'symbolic',
    difficulty: 1,
    stage: 'retrieval',
    transferDistance: 'near',
    diagnosticIds: ['closed_bracket_on_infinity', 'swapped_open_closed_bracket', 'swapped_interval_bounds'],
    type: 'interval',
    prompt: 'Escribí como intervalo B = {x ∈ ℝ / x ≥ 1}.',
    placeholder: 'Ej: [a; +inf)',
    expectedSet: [iv(1, INF, true, false)],
    hints: [
      'Buscá todos los números reales mayores o iguales que 1.',
      'El extremo izquierdo es 1 y el derecho crece indefinidamente hacia +∞.',
      'El 1 lleva corchete por ser ≥, y +∞ lleva paréntesis abierto.',
    ],
    solution: [
      'El menor valor permitido es 1, incluido por el símbolo ≥: empieza con [1.',
      'Crece sin tope hacia la derecha: termina en +∞).',
      'La notación exacta es [1; +∞).',
    ],
    diagnosticContext: {
      expectedSet: [iv(1, INF, true, false)],
    },
  },

  // Bloque 2: sec-compuestas (inequalities.compound_and_or_sets)
  {
    id: 'circ-sec2-q1',
    sectionId: 'sec-compuestas',
    competencyId: 'inequalities.compound_and_or_sets',
    prerequisiteIds: ['inequalities.intervals_and_number_line'],
    family: 'compound_and_or_sets',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['confused_and_with_or', 'swapped_open_closed_bracket'],
    type: 'interval',
    prompt: 'Si A = (−2; 2) y B = [0; 5], calculá la intersección A ∩ B (circuito en serie AND).',
    placeholder: 'Ej: [a; b)',
    expectedSet: [iv(0, 2, true, false)],
    hints: [
      'La intersección A ∩ B reúne los valores de x que están en A y en B al mismo tiempo.',
      'El inicio común es el mayor de los extremos izquierdos (0 incluido) y el fin común es el menor de los derechos (2 abierto).',
      'Comprobá si el 0 está en ambos intervalos y si el 2 pertenece a A.',
    ],
    solution: [
      'En (−2; 2), x llega hasta antes de 2; en [0; 5], x arranca en 0 inclusive.',
      'La zona superpuesta empieza en 0 (presente en ambos, corchete) y termina en 2 (excluido de A, paréntesis).',
      'Resultado: A ∩ B = [0; 2).',
    ],
    diagnosticContext: {
      expectedSet: [iv(0, 2, true, false)],
      wrongAndOrSet: [iv(-2, 5, false, true)],
    },
  },
  {
    id: 'circ-sec2-q2',
    sectionId: 'sec-compuestas',
    competencyId: 'inequalities.compound_and_or_sets',
    prerequisiteIds: ['inequalities.intervals_and_number_line'],
    family: 'compound_and_or_sets',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['confused_and_with_or', 'swapped_open_closed_bracket'],
    type: 'interval',
    prompt: 'Con los mismos conjuntos A = (−2; 2) y B = [0; 5], calculá la unión A ∪ B (paralelo OR).',
    placeholder: 'Ej: (a; b]',
    expectedSet: [iv(-2, 5, false, true)],
    hints: [
      'La unión A ∪ B incluye todo x que pertenezca al menos a uno de los dos intervalos.',
      'Como [0; 5] se solapa con (−2; 2), los dos tramos se sueldan en un único intervalo.',
      'Tomá el extremo más a la izquierda de A y el más a la derecha de B respetando su apertura o cierre.',
    ],
    solution: [
      'Al superponerse entre 0 y 2, no queda ningún hueco entre A y B.',
      'El borde izquierdo lo fija A en −2 abierto, y el derecho lo fija B en 5 cerrado.',
      'Resultado: A ∪ B = (−2; 5].',
    ],
    diagnosticContext: {
      expectedSet: [iv(-2, 5, false, true)],
      wrongAndOrSet: [iv(0, 2, true, false)],
    },
  },
  {
    id: 'circ-sec2-q3',
    sectionId: 'sec-compuestas',
    competencyId: 'inequalities.compound_and_or_sets',
    prerequisiteIds: ['inequalities.intervals_and_number_line'],
    family: 'compound_and_or_sets',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'transfer',
    transferDistance: 'near',
    diagnosticIds: ['confused_and_with_or', 'closed_bracket_on_infinity', 'swapped_open_closed_bracket'],
    type: 'interval',
    prompt: 'Escribí el conjunto solución de la disyunción x ≤ −1 ∨ x > 3 usando el símbolo ∪ (o U).',
    placeholder: 'Ej: (-inf; a] U (b; +inf)',
    expectedSet: [iv(-INF, -1, false, true), iv(3, INF, false, false)],
    hints: [
      'Cada condición forma una semirrecta distinta que no se superpone con la otra.',
      'Traducí x ≤ −1 y x > 3 por separado antes de unirlos.',
      'Uní ambas semirrectas con U o ∪, cuidando qué extremo lleva corchete y cuál lleva paréntesis.',
    ],
    solution: [
      'x ≤ −1 corresponde a (−∞; −1] y x > 3 corresponde a (3; +∞).',
      'Como son disjuntos, queda un hueco en (−1; 3] donde ninguna condición se cumple.',
      'La unión es (−∞; −1] ∪ (3; +∞).',
    ],
    diagnosticContext: {
      expectedSet: [iv(-INF, -1, false, true), iv(3, INF, false, false)],
      wrongAndOrSet: [],
    },
  },

  // Bloque 3: sec-inecuaciones (inequalities.linear_and_factored_solving)
  {
    id: 'circ-sec3-q1',
    sectionId: 'sec-inecuaciones',
    competencyId: 'inequalities.linear_and_factored_solving',
    prerequisiteIds: ['inequalities.compound_and_or_sets'],
    family: 'linear_and_factored_solving',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['forgot_flip_on_negative_div', 'swapped_open_closed_bracket', 'closed_bracket_on_infinity'],
    type: 'interval',
    prompt: 'Resolvé en ℝ la inecuación lineal −2x + 4 < 10 y expresá el conjunto solución como intervalo.',
    placeholder: 'Ej: (a; +inf)',
    expectedSet: solveLinearInequality({ a: -2, b: 4, op: '<', c: 0, d: 10 }).set,
    hints: [
      'Restá 4 a ambos miembros para aislar el término con x: queda −2x < 6.',
      'Al dividir ambos miembros por −2 (número negativo), el sentido < debe invertirse a >.',
      'Calculá el cociente 6 ÷ (−2) y escribí la semirrecta abierta hacia +∞.',
    ],
    solution: [
      '−2x + 4 < 10 ⟺ −2x < 6.',
      'Dividiendo por −2 e invirtiendo la desigualdad: x > −3.',
      'En notación de intervalo: S = (−3; +∞).',
    ],
    diagnosticContext: {
      expectedSet: solveLinearInequality({ a: -2, b: 4, op: '<', c: 0, d: 10 }).set,
      wrongFlipSet: [iv(-INF, -3, false, false)],
    },
  },
  {
    id: 'circ-sec3-q2',
    sectionId: 'sec-inecuaciones',
    competencyId: 'inequalities.linear_and_factored_solving',
    prerequisiteIds: ['inequalities.compound_and_or_sets'],
    family: 'linear_and_factored_solving',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['swapped_open_closed_bracket', 'confused_and_with_or'],
    type: 'interval',
    prompt: 'Resolvé la inecuación doble −2 ≤ 4x − 6 < 10 y escribí su intervalo solución.',
    placeholder: 'Ej: [a; b)',
    expectedSet: solveChainedInequality({ lo: -2, loOp: '≤', a: 4, b: -6, hiOp: '<', hi: 10 }).set,
    hints: [
      'Una inecuación encadenada equivale a una conjunción AND entre dos desigualdades simultáneas.',
      'Sumá 6 en los tres miembros: queda 4 ≤ 4x < 16.',
      'Dividí los tres miembros por 4 (positivo, mantiene signos) y armá el intervalo con un extremo cerrado y otro abierto.',
    ],
    solution: [
      'Sumando 6: −2 + 6 ≤ 4x < 10 + 6 ⟺ 4 ≤ 4x < 16.',
      'Dividiendo por 4 > 0: 1 ≤ x < 4.',
      'El conjunto solución es S = [1; 4).',
    ],
    diagnosticContext: {
      expectedSet: solveChainedInequality({ lo: -2, loOp: '≤', a: 4, b: -6, hiOp: '<', hi: 10 }).set,
    },
  },
  {
    id: 'circ-sec3-q3',
    sectionId: 'sec-inecuaciones',
    competencyId: 'inequalities.linear_and_factored_solving',
    prerequisiteIds: ['inequalities.compound_and_or_sets'],
    family: 'linear_and_factored_solving',
    representation: 'symbolic',
    difficulty: 3,
    stage: 'transfer',
    transferDistance: 'far',
    diagnosticIds: ['factored_assumed_both_positive_only', 'confused_and_with_or', 'swapped_open_closed_bracket'],
    type: 'interval',
    prompt: 'Resolvé (x + 3)(x − 2) > 0 en ℝ aplicando regla de los signos para el producto.',
    placeholder: 'Ej: (-inf; a) U (b; +inf)',
    expectedSet: solveFactoredQuadratic({ a1: 1, r1: -3, a2: 1, r2: 2, op: '>' }).set,
    hints: [
      'Un producto A · B es positivo en dos situaciones: (+)(+) o (−)(−).',
      'Caso 1: x + 3 > 0 y x − 2 > 0 da x > 2. Caso 2: x + 3 < 0 y x − 2 < 0 da x < −3.',
      'Uní las dos semirrectas abiertas obtenidas en ambos casos usando ∪ (o U).',
    ],
    solution: [
      'Las raíces de los factores son x = −3 y x = 2.',
      'Ambos factores son positivos si x > 2, y ambos son negativos si x < −3.',
      'Uniendo ambos casos: S = (−∞; −3) ∪ (2; +∞).',
    ],
    diagnosticContext: {
      expectedSet: solveFactoredQuadratic({ a1: 1, r1: -3, a2: 1, r2: 2, op: '>' }).set,
      singleSignProductSet: [iv(2, INF, false, false)],
      wrongAndOrSet: [iv(-3, 2, false, false)],
    },
  },
]);

export function formatParsedPreview(parsed, raw) {
  if (!raw || !raw.trim()) return '—';
  if (parsed.rawFlags?.closedInfinity) {
    return `${raw.trim()} (atención: corchete sobre infinito)`;
  }
  if (parsed.rawFlags?.swappedBounds) {
    return `${raw.trim()} (atención: extremo mayor antes que el menor)`;
  }
  if (!parsed.ok) {
    return `${raw.trim()} (formato incompleto)`;
  }
  return formatSet(parsed.intervals);
}

export function createCheckBlock(host, checks, sectionId, { onAttempt, onComplete } = {}) {
  if (!host) return null;

  const listEl = h('div', { class: 'circ-checks-list' });
  const cards = checks.map((q, idx) => {
    const storageKey = `${sectionId}:${idx}`;
    let hintStep = 0;
    let solutionRevealed = false;
    let recordedCorrect = false;

    const input = h('input', {
      type: 'text',
      class: 'circ-check__input',
      placeholder: q.placeholder || 'Ingresá el conjunto...',
      autocomplete: 'off',
      'aria-label': `Respuesta del chequeo ${idx + 1}: ${q.prompt}`,
    });

    const preview = h('p', { class: 'pr-check__preview circ-check__preview', 'aria-live': 'polite' }, 'Interpretado como: —');
    const feedback = h('p', { class: 'pr-check__feedback circ-check__feedback', 'aria-live': 'polite' });
    const hintBox = h('p', { class: 'pr-check__hint circ-check__hint', hidden: true });
    const solutionBox = h('div', { class: 'pr-check__solution circ-check__solution', hidden: true });
    const statusBadge = h('span', { class: 'circ-check__mode-badge', hidden: true });

    const btnReview = h('button', { type: 'button', class: 'btn circ-btn-review' }, chalkIcon('check'), ' Revisar');
    const btnHint = h('button', { type: 'button', class: 'btn btn--ghost circ-btn-hint' }, chalkIcon('hint'), ' Pista (1/3)');
    const btnShow = h('button', { type: 'button', class: 'btn btn--ghost circ-btn-show' }, chalkIcon('book'), ' Ver solución');

    const card = h(
      'article',
      { class: 'circ-check__card', 'data-check-id': q.id },
      h(
        'header',
        { class: 'circ-check__header' },
        h('span', { class: 'circ-check__num' }, `Chequeo ${idx + 1}`),
        statusBadge,
      ),
      h('p', { class: 'pr-check__prompt circ-check__prompt' }, q.prompt),
      h('div', { class: 'circ-check__control' }, input),
      preview,
      h('div', { class: 'pr-check__actions circ-check__actions' }, btnReview, btnHint, btnShow),
      feedback,
      hintBox,
      solutionBox,
    );

    const setModeBadge = (mode) => {
      statusBadge.hidden = false;
      statusBadge.classList.remove('is-independent', 'is-assisted');
      if (mode === 'independent') {
        statusBadge.classList.add('is-independent');
        statusBadge.textContent = 'Resuelto de forma independiente';
      } else {
        statusBadge.classList.add('is-assisted');
        statusBadge.textContent = 'Resuelto con apoyo (asistido)';
      }
      card.classList.add('is-resolved');
    };

    const existing = getProgress()[storageKey];
    if (existing === 'independent' || existing === 'assisted') {
      setModeBadge(existing);
    }

    input.addEventListener('input', () => {
      const parsed = parseIntervalSet(input.value);
      preview.textContent = `Interpretado como: ${formatParsedPreview(parsed, input.value)}`;
    });

    btnHint.addEventListener('click', () => {
      hintStep = Math.min(hintStep + 1, 3);
      hintBox.hidden = false;
      hintBox.textContent = `Pista ${hintStep}/3: ${q.hints[hintStep - 1]}`;
      mount(btnHint, chalkIcon('hint'), ` Pista (${hintStep}/3)`);
    });

    btnShow.addEventListener('click', () => {
      const firstReveal = !solutionRevealed;
      solutionRevealed = true;
      solutionBox.hidden = false;
      mount(
        solutionBox,
        h('strong', null, 'Resolución paso a paso'),
        h('ol', null, ...q.solution.map((step) => h('li', null, step))),
      );
      input.disabled = true;
      btnReview.disabled = true;
      saveProgress(storageKey, 'assisted');
      setModeBadge('assisted');
      feedback.textContent = 'Solución revelada (intento asistido — no suma racha independiente).';
      feedback.className = 'pr-check__feedback circ-check__feedback';

      if (firstReveal && !recordedCorrect) {
        recordedCorrect = true;
        const res = recordCircuitosAttempt({
          exerciseId: q.id,
          competencyId: q.competencyId,
          correct: true,
          mode: 'assisted',
          hintsUsed: hintStep,
          solutionRevealed: true,
          representation: q.representation,
          stage: q.stage,
          transferDistance: q.transferDistance,
        });
        onAttempt?.(res);
      }
    });

    btnReview.addEventListener('click', () => {
      const raw = input.value.trim();
      if (!raw) {
        feedback.textContent = 'Escribí un conjunto solución antes de revisar.';
        feedback.className = 'pr-check__feedback circ-check__feedback is-error';
        return;
      }

      const eq = equivalentIntervalSet(raw, q.expectedSet);
      const isIndependent = hintStep === 0 && !solutionRevealed;
      const prevSaved = getProgress()[storageKey];

      if (eq.equivalent) {
        const finalMode = prevSaved === 'assisted' || !isIndependent ? 'assisted' : 'independent';
        saveProgress(storageKey, finalMode);
        setModeBadge(finalMode);
        feedback.textContent =
          finalMode === 'independent'
            ? 'Correcto (resuelto de forma independiente).'
            : 'Correcto (resuelto con apoyo asistido).';
        feedback.className = 'pr-check__feedback circ-check__feedback is-correct';
        try {
          playSuccess();
        } catch {}

        if (!recordedCorrect) {
          recordedCorrect = true;
          const res = recordCircuitosAttempt({
            exerciseId: q.id,
            competencyId: q.competencyId,
            correct: true,
            mode: finalMode,
            hintsUsed: hintStep,
            solutionRevealed,
            representation: q.representation,
            stage: q.stage,
            transferDistance: q.transferDistance,
          });
          onAttempt?.(res);
        }

        if (checks.every((_, i) => Boolean(getProgress()[`${sectionId}:${i}`]))) {
          onComplete?.(sectionId);
        }
      } else {
        const diag = diagnoseInequality(raw, q.diagnosticContext);
        const tax = diag ? CIRCUITOS_DIAGNOSTIC_TAXONOMY[diag.id] : null;
        feedback.textContent = diag
          ? diag.message
          : `Todavía no coincide con el conjunto solución esperado. Revisá extremos o formato (por ejemplo ${MINUS}∞ o U).`;
        feedback.className = 'pr-check__feedback circ-check__feedback is-error';
        try {
          playError(1);
        } catch {}
        if (diag && tax) {
          try {
            react({ pose: tax.pose, tag: 'Diagnóstico', html: diag.message });
          } catch {}
        }
        const res = recordCircuitosAttempt({
          exerciseId: q.id,
          competencyId: q.competencyId,
          correct: false,
          mode: isIndependent ? 'independent' : 'assisted',
          hintsUsed: hintStep,
          solutionRevealed,
          diagnosticId: diag?.id || null,
          representation: q.representation,
          stage: q.stage,
          transferDistance: q.transferDistance,
        });
        onAttempt?.(res);
      }
    });

    return card;
  });

  mount(listEl, ...cards);
  mount(host, listEl);
  return listEl;
}
