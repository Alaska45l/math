/**
 * @file js/modules/dimensional/checks.js
 * Chequeos graduados (6 ejercicios en 2 bloques) para Análisis Dimensional.
 */

import { h, mount, chalkIcon } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';
import { react } from '../../core/vn.js';
import { playSuccess, playError } from '../../core/sound.js';
import { parseNumericAnswer, diagnoseDimensional } from './logic.js';
import { recordDimAttempt } from './learning-adapter.js';
import { UNITS_DIAGNOSTIC_TAXONOMY } from './competencies-map.js';

export const PROGRESS_KEY = 'unidades:progreso:v1';

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
  // Bloque 1: sec-neutro (units.unitary_factor_neutral_one)
  {
    id: 'dim-sec1-q1',
    sectionId: 'sec-neutro',
    competencyId: 'units.unitary_factor_neutral_one',
    prerequisiteIds: [],
    family: 'unitary_factor_conversion',
    representation: 'symbolic',
    difficulty: 1,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['inverted_conversion_factor', 'confused_prefix_scale_power10'],
    type: 'choice',
    prompt: 'En 90 km/h, la unidad km está en el numerador (pin). ¿Qué factor unitario igual a 1 la cancela para pasar a metros?',
    options: [
      '1.000 m / 1 km',
      '1 km / 1.000 m',
      '100 m / 1 km',
    ],
    expected: 0,
    trapMap: {
      1: 'inverted_conversion_factor',
      2: 'confused_prefix_scale_power10',
    },
    hints: [
      'Para que una unidad del numerador forme el neutro 1, necesitás la misma unidad en el denominador (hueco).',
      'Descartá las opciones que dejan km arriba o usan 100 m en lugar de la equivalencia real del prefijo kilo-.',
      'Elegí el cociente donde 1 km queda abajo y su equivalencia en metros queda arriba.',
    ],
    solution: [
      'Como km aparece en el numerador, el factor unitario debe llevar 1 km en el denominador.',
      'Por definición de prefijo kilo-, 1 km = 1.000 m.',
      'El neutro correcto es 1.000 m / 1 km.',
    ],
  },
  {
    id: 'dim-sec1-q2',
    sectionId: 'sec-neutro',
    competencyId: 'units.unitary_factor_neutral_one',
    prerequisiteIds: [],
    family: 'unitary_factor_conversion',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['inverted_conversion_factor', 'confused_prefix_scale_power10'],
    type: 'number',
    prompt: 'Convertí 18 L/min a mL/s (ingresá solo el valor numérico).',
    placeholder: 'Ej: número en mL/s',
    expected: 300,
    trapInverted: [1080000, 0.0003],
    trapPower10: [30, 3000],
    trapSingleUnitOnly: [18000, 0.3],
    hints: [
      'Tenés que transformar dos unidades: L -> mL (arriba) y min -> s (abajo).',
      'Multiplicá por (1.000 mL / 1 L) y por (1 min / 60 s) para cancelar L y min.',
      'Calculá (18 × 1.000) dividido por 60.',
    ],
    solution: [
      '18 L/min × (1.000 mL / 1 L) × (1 min / 60 s).',
      'Se cancelan L y min, quedando mL/s.',
      '18.000 / 60 = 300 mL/s.',
    ],
  },
  {
    id: 'dim-sec1-q3',
    sectionId: 'sec-neutro',
    competencyId: 'units.unitary_factor_neutral_one',
    prerequisiteIds: [],
    family: 'unitary_factor_conversion',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'retrieval',
    transferDistance: 'near',
    diagnosticIds: ['inverted_conversion_factor', 'omitted_target_unit_or_direction'],
    type: 'number',
    prompt: 'Convertí 36.000 mL/h a L/min (ingresá solo el valor numérico).',
    placeholder: 'Ej: número decimal',
    expected: 0.6,
    trapInverted: [2160, 2160000],
    trapPower10: [6, 60],
    trapSingleUnitOnly: [36, 600],
    hints: [
      'mL está arriba y debe cancelarse con 1.000 mL abajo; h está abajo y se cancela con 1 h arriba.',
      'El cálculo queda 36.000 × (1 / 1.000) × (1 / 60).',
      'Simplificá primero los mililitros a litros (da 36 L/h) y luego dividí por 60 minutos.',
    ],
    solution: [
      '36.000 mL/h × (1 L / 1.000 mL) × (1 h / 60 min).',
      '36.000 ÷ 1.000 = 36 L/h.',
      '36 ÷ 60 = 0,6 L/min.',
    ],
  },

  // Bloque 2: sec-compuestas (units.compound_rates_and_powers)
  {
    id: 'dim-sec2-q1',
    sectionId: 'sec-compuestas',
    competencyId: 'units.compound_rates_and_powers',
    prerequisiteIds: ['units.unitary_factor_neutral_one'],
    family: 'compound_rates_and_powers',
    representation: 'verbal',
    difficulty: 2,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['forgot_power_exponent_on_unit', 'inverted_conversion_factor'],
    type: 'choice',
    prompt: '¿Por qué hay que multiplicar 3 veces por (100 cm / 1 m) para pasar de g/cm³ a kg/m³?',
    options: [
      'Porque cm³ = cm · cm · cm requiere 3 neutros multiplicativos para cancelar las 3 dimensiones',
      'Porque 1 m equivale a 300 cm en volumen',
      'Porque hay que usar 1 m / 100 cm tres veces para cancelar el denominador',
    ],
    expected: 0,
    trapMap: {
      1: 'forgot_power_exponent_on_unit',
      2: 'inverted_conversion_factor',
    },
    hints: [
      'Pensá qué significa geométricamente un centímetro cúbico (cm³) como producto de unidades.',
      'Cada factor (100 cm / 1 m) aporta un único pin cm, que solo neutraliza uno de los tres huecos cm del denominador.',
      'Necesitás tantos neutros iguales como exponente tenga la unidad de volumen.',
    ],
    solution: [
      'cm³ significa cm · cm · cm (tres huecos en el denominador).',
      'Cada factor (100 cm / 1 m) cancela un solo cm y deja un m en el denominador.',
      'Aplicado 3 veces, cancela cm³ y deja m³, multiplicando por 100³ = 1.000.000.',
    ],
  },
  {
    id: 'dim-sec2-q2',
    sectionId: 'sec-compuestas',
    competencyId: 'units.compound_rates_and_powers',
    prerequisiteIds: ['units.unitary_factor_neutral_one'],
    family: 'compound_rates_and_powers',
    representation: 'symbolic',
    difficulty: 3,
    stage: 'guided_practice',
    transferDistance: 'near',
    diagnosticIds: ['forgot_power_exponent_on_unit', 'omitted_target_unit_or_direction'],
    type: 'number',
    prompt: 'Convertí una densidad de 2,5 g/cm³ a kg/m³ (ingresá solo el valor numérico).',
    placeholder: 'Ej: número en kg/m³',
    expected: 2500,
    trapLinearPower: [0.25, 25],
    trapSingleUnitOnly: [2500000, 0.0025],
    trapInverted: [0.0000025],
    hints: [
      'Pasá gramos a kilogramos dividiendo por 1.000, y cm³ a m³ multiplicando por 100³.',
      'El factor neto es 100³ / 1.000 = 1.000.000 / 1.000.',
      'Multiplicá 2,5 por la razón neta que quedó tras simplificar las potencias de 10.',
    ],
    solution: [
      '2,5 g/cm³ × (1 kg / 1.000 g) × (100 cm / 1 m)³.',
      '2,5 × 1.000.000 ÷ 1.000 = 2,5 × 1.000.',
      'Resultado: 2.500 kg/m³.',
    ],
  },
  {
    id: 'dim-sec2-q3',
    sectionId: 'sec-compuestas',
    competencyId: 'units.compound_rates_and_powers',
    prerequisiteIds: ['units.unitary_factor_neutral_one'],
    family: 'compound_rates_and_powers',
    representation: 'symbolic',
    difficulty: 2,
    stage: 'transfer',
    transferDistance: 'far',
    diagnosticIds: ['inverted_conversion_factor', 'confused_prefix_scale_power10'],
    type: 'number',
    prompt: 'Convertí una rapidez de 5 m/s a km/h (ingresá solo el valor numérico).',
    placeholder: 'Ej: número en km/h',
    expected: 18,
    trapInverted: [1.3889, 1.39],
    trapPower10: [0.3, 300],
    trapSingleUnitOnly: [0.005, 18000],
    hints: [
      'Cancelá m arriba con 1.000 m abajo, y s abajo con 60 s/min × 60 min/h arriba.',
      'Multiplicar por 3.600 y dividir por 1.000 equivale al factor compuesto 3,6.',
      'Multiplicá 5 por ese factor de conversión de m/s a km/h.',
    ],
    solution: [
      '5 m/s × (1 km / 1.000 m) × (60 s / 1 min) × (60 min / 1 h).',
      '5 × 3.600 ÷ 1.000 = 5 × 3,6.',
      'Resultado: 18 km/h.',
    ],
  },
]);

export function createCheckBlock(host, checks, sectionId, { onAttempt, onComplete } = {}) {
  if (!host) return null;

  const listEl = h('div', { class: 'dim-checks-list' });
  const cards = checks.map((q, idx) => {
    const storageKey = `${sectionId}:${idx}`;
    let hintStep = 0;
    let solutionRevealed = false;
    let recordedCorrect = false;
    let selectedChoice = null;

    let controlNode;
    let inputEl = null;
    let choiceBtns = [];
    const preview = h('p', { class: 'pr-check__preview dim-check__preview', 'aria-live': 'polite' }, 'Interpretado como: —');

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
      controlNode = h('div', { class: 'dim-choice-group', role: 'group', 'aria-label': `Opciones del chequeo ${idx + 1}` }, ...choiceBtns);
    } else {
      inputEl = h('input', {
        type: 'text',
        inputmode: 'decimal',
        class: 'dim-check__input',
        placeholder: q.placeholder || 'Ingresá un valor...',
        autocomplete: 'off',
        'aria-label': `Respuesta del chequeo ${idx + 1}: ${q.prompt}`,
      });
      inputEl.addEventListener('input', () => {
        const raw = inputEl.value.trim();
        if (!raw) {
          preview.textContent = 'Interpretado como: —';
          return;
        }
        const n = parseNumericAnswer(raw);
        preview.textContent = Number.isFinite(n)
          ? `Interpretado como: ${fmt(n, 4)}`
          : `Interpretado como: ${raw} (formato inválido)`;
      });
      controlNode = inputEl;
    }

    const feedback = h('p', { class: 'pr-check__feedback dim-check__feedback', 'aria-live': 'polite' });
    const hintBox = h('p', { class: 'pr-check__hint dim-check__hint', hidden: true });
    const solutionBox = h('div', { class: 'pr-check__solution dim-check__solution', hidden: true });
    const statusBadge = h('span', { class: 'dim-check__mode-badge', hidden: true });

    const btnReview = h('button', { type: 'button', class: 'btn dim-btn-review' }, chalkIcon('check'), ' Revisar');
    const btnHint = h('button', { type: 'button', class: 'btn btn--ghost dim-btn-hint' }, chalkIcon('hint'), ' Pista (1/3)');
    const btnShow = h('button', { type: 'button', class: 'btn btn--ghost dim-btn-show' }, chalkIcon('book'), ' Ver solución');

    const card = h(
      'article',
      { class: 'dim-check__card', 'data-check-id': q.id },
      h(
        'header',
        { class: 'dim-check__header' },
        h('span', { class: 'dim-check__num' }, `Chequeo ${idx + 1}`),
        statusBadge,
      ),
      h('p', { class: 'pr-check__prompt dim-check__prompt' }, q.prompt),
      h('div', { class: 'dim-check__control' }, controlNode),
      preview,
      h('div', { class: 'pr-check__actions dim-check__actions' }, btnReview, btnHint, btnShow),
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
      feedback.className = 'pr-check__feedback dim-check__feedback';

      if (firstReveal && !recordedCorrect) {
        recordedCorrect = true;
        const res = recordDimAttempt({
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
        feedback.textContent = q.type === 'choice' ? 'Elegí una opción antes de revisar.' : 'Ingresá un valor antes de revisar.';
        feedback.className = 'pr-check__feedback dim-check__feedback is-error';
        return;
      }

      let isCorrect = false;
      if (q.type === 'choice') {
        isCorrect = Number(rawVal) === q.expected;
      } else {
        const n = parseNumericAnswer(rawVal);
        isCorrect = Number.isFinite(n) && Math.abs(n - q.expected) <= Math.max(1e-4, Math.abs(q.expected) * 1e-3);
      }

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
        feedback.className = 'pr-check__feedback dim-check__feedback is-correct';
        try {
          playSuccess();
        } catch {}

        if (!recordedCorrect) {
          recordedCorrect = true;
          const res = recordDimAttempt({
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
        const diag = diagnoseDimensional(rawVal, { spec: q });
        const tax = diag ? UNITS_DIAGNOSTIC_TAXONOMY[diag.id] : null;
        feedback.textContent = diag
          ? diag.message
          : 'El resultado aún no coincide. Revisá el sentido de cada fracción unitaria y las potencias de 10.';
        feedback.className = 'pr-check__feedback dim-check__feedback is-error';
        try {
          playError(1);
        } catch {}
        if (diag && tax) {
          try {
            react({ pose: tax.pose, tag: 'Diagnóstico', html: diag.message });
          } catch {}
        }
        const res = recordDimAttempt({
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
