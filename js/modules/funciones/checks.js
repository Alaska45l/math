/**
 * @file js/modules/funciones/checks.js
 * Chequeos graduados (10 ejercicios, 2 por competencia en las 4 pestañas) para Funciones.
 */

import { h, mount, chalkIcon } from '../../core/dom.js';
import { fmt, INF, iv, formatSet } from '../../core/math-format.js';
import { react } from '../../core/vn.js';
import { playSuccess, playError } from '../../core/sound.js';
import { parseIntervalSet, parseNumberToken } from '../circuitos/logic.js';
import {
  equivalentFnAnswer,
  diagnoseFunction,
  parseLinearExpr,
} from './logic.js';
import { recordFnAttempt } from './learning-adapter.js';
import { FUNCTIONS_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';

export const PROGRESS_KEY = 'funciones:progreso:v1';

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
  // Tab 1: panel-scanner (3 checks)
  {
    id: 'fn-check-1',
    sectionId: 'panel-scanner',
    competencyId: 'functions.concept_and_uniqueness',
    prerequisiteIds: [],
    family: 'function_uniqueness',
    representation: 'graphical',
    difficulty: 1,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['vertical_line_two_outputs_ignored'],
    type: 'choice',
    prompt: 'En la parábola horizontal x = y² − 2, para x = −2 la recta vertical corta una sola vez (y = 0), pero para x = 2 corta dos veces. ¿Es función?',
    options: [
      'No es función, porque basta que una sola entrada x tenga más de una salida para violar la unicidad',
      'Sí es función, porque en el vértice x = −2 corta una sola vez',
      'Sí es función, porque para x < −2 no corta ninguna vez',
    ],
    expected: 0,
    trapMap: {
      1: 'vertical_line_two_outputs_ignored',
      2: 'vertical_line_two_outputs_ignored',
    },
    hints: [
      'Recordá las dos condiciones de función: existencia en el dominio y unicidad de la imagen.',
      'La unicidad exige que TODA entrada del dominio tenga exactamente una única salida, sin excepciones.',
      'Con un solo valor de x que devuelva dos alturas distintas ya alcanza para descartarla como función.',
    ],
    solution: [
      'Para x = 2, y² − 2 = 2 da dos salidas reales: y = 2 y y = −2.',
      'Aunque en el vértice x = −2 haya un único corte, la condición de unicidad falla en todo x > −2.',
      'Por lo tanto, x = y² − 2 NO es función.',
    ],
  },
  {
    id: 'fn-check-2',
    sectionId: 'panel-scanner',
    competencyId: 'functions.concept_and_uniqueness',
    prerequisiteIds: [],
    family: 'function_uniqueness',
    representation: 'graphical',
    difficulty: 2,
    stage: 'transfer',
    transferDistance: 'near',
    diagnosticIds: ['vertical_line_two_outputs_ignored'],
    type: 'choice',
    prompt: 'En f(x) = |x| − 1, dos entradas distintas (x = −2 y x = 2) tienen la misma salida y = 1. ¿Eso impide que sea función?',
    options: [
      'No lo impide: es función porque cada x tiene una única salida (solo falla la inyectividad)',
      'Sí lo impide: una función nunca puede repetir valores de y',
      'Solo deja de ser función si se repite el vértice',
    ],
    expected: 0,
    trapMap: {
      1: 'vertical_line_two_outputs_ignored',
      2: 'vertical_line_two_outputs_ignored',
    },
    hints: [
      'Distinguí unicidad (prueba vertical) de inyectividad (prueba horizontal).',
      'La definición de función prohíbe que una misma entrada x dé dos salidas, no que dos x distintas compartan una salida.',
      'Verificá cuántas veces corta una recta vertical a la gráfica en V de |x| − 1.',
    ],
    solution: [
      'Cada recta vertical corta exactamente una vez a la gráfica de f(x) = |x| − 1.',
      'Que f(−2) = f(2) = 1 significa únicamente que f no es inyectiva, no que deje de ser función.',
      'Es función de dominio ℝ e imagen [−1; +∞).',
    ],
  },
  {
    id: 'fn-check-3',
    sectionId: 'panel-scanner',
    competencyId: 'functions.domain_image_and_sign_sets',
    prerequisiteIds: ['functions.concept_and_uniqueness'],
    family: 'domain_image_and_signs',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['closed_bracket_on_excluded_point_or_extremum', 'read_y_axis_instead_of_x_for_sets'],
    type: 'interval',
    prompt: 'Escribí el dominio Dom(f) de la hipérbola f(x) = 1/(x − 2) + 1 (por ejemplo R - {a} o como unión de intervalos).',
    placeholder: 'Ej: R - {a}',
    expectedSet: [iv(-INF, 2, false, false), iv(2, INF, false, false)],
    trapIncludedAsymptote: true,
    hints: [
      'Observá el denominador x − 2: la división por cero no está definida en ℝ.',
      'Igualá el denominador a cero para hallar el único valor real excluido del dominio.',
      'Escribí todos los reales quitando ese valor puntual con la forma R - {valor} o como unión abierta en ese punto.',
    ],
    solution: [
      'La única restricción algebraica es x − 2 ≠ 0, es decir x ≠ 2.',
      'En x = 2 aparece una asíntota vertical donde la función no existe.',
      'Por lo tanto, Dom(f) = ℝ − {2} = (−∞; 2) ∪ (2; +∞).',
    ],
  },

  // Tab 2: panel-radiografia (3 checks)
  {
    id: 'fn-check-4',
    sectionId: 'panel-radiografia',
    competencyId: 'functions.domain_image_and_sign_sets',
    prerequisiteIds: ['functions.concept_and_uniqueness'],
    family: 'domain_image_and_signs',
    representation: 'graphical',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['closed_bracket_on_excluded_point_or_extremum', 'read_y_axis_instead_of_x_for_sets'],
    type: 'interval',
    prompt: 'Con la Lente 1 de Radiografía (Dom(f) = [−4; 5], raíces en −3, 0 y 4), escribí el conjunto de positividad C⁺.',
    placeholder: 'Ej: [a; b) U (c; d)',
    expectedSet: [iv(-4, -3, true, false), iv(0, 4, false, false)],
    trapClosedExtremumSet: [iv(-4, -3, true, true), iv(0, 4, true, true)],
    hints: [
      'C⁺ reúne los valores de x donde la gráfica queda estrictamente por encima del eje X (f(x) > 0).',
      'En el borde x = −4 la curva vale 2,5 > 0 (va incluido); en las raíces −3, 0 y 4 vale 0 (van excluidas).',
      'Uní los dos tramos positivos sobre el eje X usando U, cuidando el corchete en el borde y los paréntesis en las raíces.',
    ],
    solution: [
      'En [−4; −3), f(x) > 0; en x = −4 vale 2,5 > 0, por lo que −4 pertenece a C⁺.',
      'En x = −3, x = 0 y x = 4 la función vale 0 (no > 0), así que esas raíces quedan abiertas.',
      'Por lo tanto, C⁺ = [−4; −3) ∪ (0; 4).',
    ],
  },
  {
    id: 'fn-check-5',
    sectionId: 'panel-radiografia',
    competencyId: 'functions.monotonicity_extrema_and_continuity',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    family: 'monotonicity_and_extrema',
    representation: 'graphical',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['read_y_axis_instead_of_x_for_sets', 'closed_bracket_on_excluded_point_or_extremum'],
    type: 'interval',
    prompt: 'Observando la Lente 2 de Radiografía (valle en (−1,8; −3) y cima en (2; 4)), escribí el intervalo de crecimiento I↑.',
    placeholder: 'Ej: (a; b)',
    expectedSet: [iv(-1.8, 2, false, false)],
    trapYAxisSet: [iv(-3, 4, false, false)],
    trapClosedExtremumSet: [iv(-1.8, 2, true, true)],
    hints: [
      'Aplicá el Candado del eje X: I↑ pregunta para qué valores de x la gráfica sube al avanzar hacia la derecha.',
      'No copies las alturas y = −3 e y = 4; proyectá el valle y la cima sobre el eje horizontal X.',
      'Usá paréntesis abiertos en ambos extremos donde la pendiente se anula (coma decimal o punto).',
    ],
    solution: [
      'La curva crece desde la abscisa del valle (x = −1,8) hasta la abscisa de la cima (x = 2).',
      'En los extremos de giro la función no está subiendo ni bajando, por lo que el intervalo se escribe abierto.',
      'Resultado: I↑ = (−1,8; 2).',
    ],
  },
  {
    id: 'fn-check-6',
    sectionId: 'panel-radiografia',
    competencyId: 'functions.monotonicity_extrema_and_continuity',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    family: 'monotonicity_and_extrema',
    representation: 'graphical',
    difficulty: 2,
    stage: 'retrieval',
    transferDistance: 'near',
    diagnosticIds: ['confused_negative_with_decreasing', 'read_y_axis_instead_of_x_for_sets'],
    type: 'choice',
    prompt: 'En el tramo x ∈ (−1,8; 0) de la Radiografía, la curva está por debajo del eje X y sube de (−1,8; −3) hacia (0; 0). ¿Cómo se clasifica ahí?',
    options: [
      'Es negativa (está en C⁻) y creciente (está en I↑) al mismo tiempo',
      'Es negativa y por lo tanto decreciente (está en I↓)',
      'Es positiva porque está subiendo hacia el origen',
    ],
    expected: 0,
    trapMap: {
      1: 'confused_negative_with_decreasing',
      2: 'confused_negative_with_decreasing',
    },
    hints: [
      'Separar dos preguntas distintas: ¿en qué zona vertical está (signo)? vs ¿hacia dónde va (monotonía)?',
      'Que f(x) < 0 ubica la curva bajo el eje X, pero al avanzar a la derecha las alturas pasan de −3 a 0.',
      'Elegí la opción que combina correctamente la ubicación bajo el eje con el ascenso de las alturas.',
    ],
    solution: [
      'El signo indica ubicación respecto del eje X: como f(x) < 0, el tramo pertenece a C⁻.',
      'La monotonía indica dirección: al aumentar x de −1,8 a 0, f(x) sube de −3 a 0, por lo que pertenece a I↑.',
      'Por lo tanto, es negativa y creciente a la vez.',
    ],
  },

  // Tab 3: panel-secante (2 checks)
  {
    id: 'fn-check-7',
    sectionId: 'panel-secante',
    competencyId: 'functions.average_rate_of_change',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    family: 'average_rate_of_change',
    representation: 'tabular',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['inverted_tcp_ratio_dx_over_dy'],
    type: 'number',
    prompt: 'En el modelo T(t) = −0,5·(t − 4)² + 26, en t₁ = 1 h la temperatura es 21,5 °C y en t₂ = 3 h es 25,5 °C. Calculá la TCP en °C/h.',
    placeholder: 'Ej: número en °C/h',
    expected: 2,
    trapInvertedTcp: 0.5,
    hints: [
      'La Tasa de Cambio Promedio (TCP) es la pendiente de la secante: variación de salida dividida variación de entrada.',
      'Calculá ΔT = 25,5 − 21,5 y Δt = 3 − 1.',
      'Dividí ΔT por Δt (cuidado de no invertir el cociente).',
    ],
    solution: [
      'ΔT = T(3) − T(1) = 25,5 − 21,5 = 4 °C.',
      'Δt = 3 − 1 = 2 h.',
      'TCP = ΔT / Δt = 4 / 2 = 2 °C/h.',
    ],
  },
  {
    id: 'fn-check-8',
    sectionId: 'panel-secante',
    competencyId: 'functions.average_rate_of_change',
    prerequisiteIds: ['functions.domain_image_and_sign_sets'],
    family: 'average_rate_of_change',
    representation: 'conceptual',
    difficulty: 2,
    stage: 'transfer',
    transferDistance: 'far',
    diagnosticIds: ['inverted_tcp_ratio_dx_over_dy'],
    type: 'choice',
    prompt: '¿Qué diferencia matemática hay entre Δy = 0 (con Δx ≠ 0) y Δx = 0 al calcular la TCP?',
    options: [
      'Con Δy = 0 la TCP vale 0 (secante horizontal); con Δx = 0 no está definida por división por cero',
      'Ambos casos dan TCP = 0 porque no hubo cambio neto',
      'Con Δy = 0 no existe TCP, mientras que con Δx = 0 vale Δx / Δy',
    ],
    expected: 0,
    trapMap: {
      1: 'inverted_tcp_ratio_dx_over_dy',
      2: 'inverted_tcp_ratio_dx_over_dy',
    },
    hints: [
      'Mirá el numerador y el denominador de la fórmula TCP = Δy / Δx.',
      'Cero dividido un número distinto de cero existe y da 0; dividir por cero en el denominador es imposible en ℝ.',
      'Distinguí el caso de dos instantes con la misma altura (tasa cero) del caso de dos instantes idénticos.',
    ],
    solution: [
      'Si Δy = 0 y Δx ≠ 0, entonces TCP = 0 / Δx = 0 (por ejemplo, cuando una pelota sube y vuelve a la misma altura).',
      'Si Δx = 0 (x₁ = x₂), el denominador es 0 y la fracción Δy / 0 no está definida.',
      'Por eso hacen falta dos instantes distintos para medir una tasa promedio.',
    ],
  },

  // Tab 4: panel-inversa (2 checks)
  {
    id: 'fn-check-9',
    sectionId: 'panel-inversa',
    competencyId: 'functions.bijectivity_and_inverse',
    prerequisiteIds: ['functions.monotonicity_extrema_and_continuity'],
    family: 'bijectivity_and_inverse',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['inverted_inverse_operations_wrong_order'],
    type: 'linear_expr',
    prompt: 'Para f(x) = 2x − 1, escribí la fórmula de su función inversa f⁻¹(x) (por ejemplo (x + a)/b o ax + b).',
    placeholder: 'Ej: (x + a)/b',
    expectedM: 0.5,
    expectedB: 0.5,
    hints: [
      'Partí de y = 2x − 1 y aplicá propiedad uniforme para despejar x.',
      'Primero deshacé la resta sumando 1 a ambos miembros: y + 1 = 2x.',
      'Luego dividí ambos miembros por 2 y renombrá la variable independiente como x.',
    ],
    solution: [
      'y = 2x − 1 ⟺ y + 1 = 2x.',
      'Dividiendo ambos miembros por 2: x = (y + 1) / 2.',
      'Intercambiando variables: f⁻¹(x) = (x + 1)/2 = 0,5x + 0,5.',
    ],
  },
  {
    id: 'fn-check-10',
    sectionId: 'panel-inversa',
    competencyId: 'functions.bijectivity_and_inverse',
    prerequisiteIds: ['functions.monotonicity_extrema_and_continuity'],
    family: 'bijectivity_and_inverse',
    representation: 'graphical',
    difficulty: 3,
    stage: 'transfer',
    transferDistance: 'far',
    diagnosticIds: ['inverted_inverse_operations_wrong_order', 'vertical_line_two_outputs_ignored'],
    type: 'choice',
    prompt: '¿Por qué una función lineal constante f(x) = b (pendiente m = 0) no posee función inversa en ℝ?',
    options: [
      'Porque no es inyectiva (todas las x colapsan en b) y su reflejo x = b falla la prueba de la recta vertical',
      'Porque su gráfica no corta al eje X',
      'Porque al invertirla da f⁻¹(x) = x − b',
    ],
    expected: 0,
    trapMap: {
      1: 'inverted_inverse_operations_wrong_order',
      2: 'inverted_inverse_operations_wrong_order',
    },
    hints: [
      'Preguntate si dada la salida y = b podés recuperar de manera única qué entrada x la generó.',
      'En el espejo y = x, la recta horizontal y = b se refleja en una recta vertical x = b.',
      'Conectá la falta de inyectividad de f con la pérdida de unicidad en la relación reflejada.',
    ],
    solution: [
      'Si m = 0, infinitos valores de x producen exactamente la misma salida b: f no es inyectiva.',
      'Al reflejar y = b respecto de y = x se obtiene la recta vertical x = b, donde una sola entrada tiene infinitas salidas.',
      'Además, despejar x requeriría dividir por m = 0, lo cual es imposible en ℝ.',
    ],
  },
]);

export function createCheckBlock(host, checks, sectionId, { onAttempt, onComplete } = {}) {
  if (!host) return null;

  const listEl = h('div', { class: 'fn-checks-list' });
  const cards = checks.map((q, idx) => {
    const storageKey = `${sectionId}:${idx}`;
    let hintStep = 0;
    let solutionRevealed = false;
    let recordedCorrect = false;
    let selectedChoice = null;

    let controlNode;
    let inputEl = null;
    let choiceBtns = [];
    const preview = h('p', { class: 'pr-check__preview fn-check__preview', 'aria-live': 'polite' }, 'Interpretado como: —');

    if (q.type === 'choice') {
      choiceBtns = q.options.map((opt, optIdx) => {
        const btn = h('button', { type: 'button', class: 'chip chip--ghost', 'aria-pressed': 'false' }, opt);
        btn.addEventListener('click', () => {
          selectedChoice = optIdx;
          choiceBtns.forEach((b, j) => {
            b.classList.toggle('is-active', j === optIdx);
            b.classList.toggle('chip--ghost', j !== optIdx);
            b.setAttribute('aria-pressed', String(j === optIdx));
          });
          preview.textContent = `Interpretado como: ${opt}`;
        });
        return btn;
      });
      controlNode = h('div', { class: 'fn-choice-group', role: 'group', 'aria-label': `Opciones del chequeo ${idx + 1}` }, ...choiceBtns);
    } else {
      inputEl = h('input', {
        type: 'text',
        inputmode: q.type === 'number' ? 'decimal' : 'text',
        class: 'fn-check__input',
        placeholder: q.placeholder || 'Ingresá tu respuesta...',
        autocomplete: 'off',
        'aria-label': `Respuesta del chequeo ${idx + 1}: ${q.prompt}`,
      });
      inputEl.addEventListener('input', () => {
        const raw = inputEl.value.trim();
        if (!raw) {
          preview.textContent = 'Interpretado como: —';
          return;
        }
        if (q.type === 'number') {
          const n = parseNumberToken(raw.replace(',', '.'));
          preview.textContent = Number.isFinite(n)
            ? `Interpretado como: ${fmt(n, 4)}`
            : `Interpretado como: ${raw} (formato inválido)`;
        } else if (q.type === 'linear_expr') {
          const lin = parseLinearExpr(raw);
          preview.textContent = lin
            ? `Interpretado como: ${fmt(lin.m, 3)}·x ${lin.b >= 0 ? '+' : '−'} ${fmt(Math.abs(lin.b), 3)}`
            : `Interpretado como: ${raw} (expresión incompleta)`;
        } else {
          const parsed = parseIntervalSet(raw);
          preview.textContent = parsed.ok
            ? `Interpretado como: ${formatSet(parsed.intervals)}`
            : `Interpretado como: ${raw} (formato incompleto)`;
        }
      });
      controlNode = inputEl;
    }

    const feedback = h('p', { class: 'pr-check__feedback fn-check__feedback', 'aria-live': 'polite' });
    const hintBox = h('p', { class: 'pr-check__hint fn-check__hint', hidden: true });
    const solutionBox = h('div', { class: 'pr-check__solution fn-check__solution', hidden: true });
    const statusBadge = h('span', { class: 'fn-check__mode-badge', hidden: true });

    const btnReview = h('button', { type: 'button', class: 'btn fn-btn-review' }, chalkIcon('check'), ' Revisar');
    const btnHint = h('button', { type: 'button', class: 'btn btn--ghost fn-btn-hint' }, chalkIcon('hint'), ' Pista (1/3)');
    const btnShow = h('button', { type: 'button', class: 'btn btn--ghost fn-btn-show' }, chalkIcon('book'), ' Ver solución');

    const card = h(
      'article',
      { class: 'fn-check__card', 'data-check-id': q.id },
      h(
        'header',
        { class: 'fn-check__header' },
        h('span', { class: 'fn-check__num' }, `Chequeo ${idx + 1}`),
        statusBadge,
      ),
      h('p', { class: 'pr-check__prompt fn-check__prompt' }, q.prompt),
      h('div', { class: 'fn-check__control' }, controlNode),
      preview,
      h('div', { class: 'pr-check__actions fn-check__actions' }, btnReview, btnHint, btnShow),
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
      if (inputEl) inputEl.disabled = true;
      choiceBtns.forEach((b) => { b.disabled = true; });
      btnReview.disabled = true;
      saveProgress(storageKey, 'assisted');
      setModeBadge('assisted');
      feedback.textContent = 'Solución revelada (intento asistido — no suma racha independiente).';
      feedback.className = 'pr-check__feedback fn-check__feedback';

      if (firstReveal && !recordedCorrect) {
        recordedCorrect = true;
        const res = recordFnAttempt({
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
      const rawVal = q.type === 'choice' ? (selectedChoice === null ? '' : String(selectedChoice)) : inputEl.value.trim();
      if (rawVal === '') {
        feedback.textContent = q.type === 'choice' ? 'Elegí una opción antes de revisar.' : 'Ingresá una respuesta antes de revisar.';
        feedback.className = 'pr-check__feedback fn-check__feedback is-error';
        return;
      }

      const isCorrect = equivalentFnAnswer(rawVal, q);
      const isIndependent = hintStep === 0 && !solutionRevealed;
      const prevSaved = getProgress()[storageKey];

      if (isCorrect) {
        const finalMode = prevSaved === 'assisted' || !isIndependent ? 'assisted' : 'independent';
        saveProgress(storageKey, finalMode);
        setModeBadge(finalMode);
        feedback.textContent =
          finalMode === 'independent'
            ? 'Correcto (resuelto de forma independiente).'
            : 'Correcto (resuelto con apoyo asistido).';
        feedback.className = 'pr-check__feedback fn-check__feedback is-correct';
        try {
          playSuccess();
        } catch {}

        if (!recordedCorrect) {
          recordedCorrect = true;
          const res = recordFnAttempt({
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
        const diag = diagnoseFunction(rawVal, { spec: q });
        const tax = diag ? FUNCTIONS_DIAGNOSTIC_TAXONOMY[diag.id] : null;
        feedback.textContent = diag
          ? diag.message
          : 'Todavía no coincide. Revisá la lectura sobre el eje X, los extremos o el despeje.';
        feedback.className = 'pr-check__feedback fn-check__feedback is-error';
        try {
          playError(1);
        } catch {}
        if (diag && tax) {
          try {
            react({ pose: tax.pose, tag: 'Diagnóstico', html: diag.message });
          } catch {}
        }
        const res = recordFnAttempt({
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
