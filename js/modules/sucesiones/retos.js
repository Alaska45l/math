/**
 * retos.js — Capítulo 4: Entrenador determinista por semilla y Trampas Clásicas de Examen.
 * 1. PRNG determinista mulberry32 con generador de los 8 tipos de problemas de Khan Academy.
 * 2. Banco de las 5 Trampas Clásicas de Examen (corregidas y enriquecidas con tablas de balanza).
 */

import { h, mount, chalkIcon } from '../../core/dom.js';
import { fmt, fractionHtml, MINUS } from '../../core/math-format.js';
import {
  REPRESENTATION_TYPES,
  LEARNING_STAGES,
  TRANSFER_DISTANCES,
} from '../../core/learning/events.js';
import { selectAdaptiveExercise } from '../../core/learning/exercise-selector.js';
import { SEQ_COMPETENCIES } from './competencies-map.js';
import { getProgressStore } from './learning-adapter.js';
import { createCheckBlock } from './components.js';

export const CHALLENGE_FAMILY_META = Object.freeze([
  {
    typeIndex: 0,
    exerciseFamily: 'extend',
    competencyId: 'sequences.pattern_recognition_and_classification',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.GUIDED_PRACTICE,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'extend_sequence_next_term',
    diagnosticIds: [],
  },
  {
    typeIndex: 1,
    exerciseFamily: 'classify',
    competencyId: 'sequences.pattern_recognition_and_classification',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.GUIDED_PRACTICE,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'classify_arithmetic_geometric_or_neither',
    diagnosticIds: [],
  },
  {
    typeIndex: 2,
    exerciseFamily: 'recursive',
    competencyId: 'sequences.recursive_formulas',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.GUIDED_PRACTICE,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'extract_recursive_parameters',
    diagnosticIds: ['wrong_anchor_a2'],
  },
  {
    typeIndex: 3,
    exerciseFamily: 'arithmetic_explicit',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.RETRIEVAL,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'write_standard_arithmetic_explicit',
    diagnosticIds: ['off_by_one', 'sign_of_step', 'swapped_k_step', 'not_standard_but_equivalent'],
  },
  {
    typeIndex: 4,
    exerciseFamily: 'rosetta_arithmetic',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'convert_recursive_to_explicit',
    diagnosticIds: ['off_by_one', 'sign_of_step', 'swapped_k_step'],
  },
  {
    typeIndex: 5,
    exerciseFamily: 'rosetta_arithmetic',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'convert_simplified_explicit_to_recursive',
    diagnosticIds: ['wrong_anchor_a2', 'sign_of_step'],
  },
  {
    typeIndex: 6,
    exerciseFamily: 'membership_solve',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.FAR,
    expectedEvidence: 'solve_term_index_for_target_value',
    diagnosticIds: ['off_by_one'],
  },
  {
    typeIndex: 7,
    exerciseFamily: 'arithmetic_explicit',
    competencyId: 'sequences.arithmetic_explicit_and_membership',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.TRANSFER,
    transferDistance: TRANSFER_DISTANCES.FAR,
    expectedEvidence: 'infer_common_difference_from_distant_terms',
    diagnosticIds: ['off_by_one', 'sign_of_step'],
  },
]);

/**
 * PRNG determinista mulberry32.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generador determinista de los 8 tipos de problemas de Khan Academy.
 */
export function generateProblem(seed, typeFilter = -1) {
  const rand = mulberry32(seed);
  const choice = (arr) => arr[Math.floor(rand() * arr.length)];
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const type = typeFilter >= 0 && typeFilter <= 7 ? typeFilter : Math.floor(rand() * 8);
  const meta = CHALLENGE_FAMILY_META[type];
  const withMeta = (problem) => ({
    ...problem,
    competencyId: meta.competencyId,
    exerciseFamily: meta.exerciseFamily,
    representation: meta.representation,
    stage: meta.stage,
    transferDistance: meta.transferDistance,
    expectedEvidence: meta.expectedEvidence,
    diagnosticIds: meta.diagnosticIds,
  });

  switch (type) {
    case 0: {
      // 1. Extender la sucesión
      const k = randInt(-5, 15);
      const isAri = rand() > 0.4;
      if (isAri) {
        const d = choice([-5, -4, -3, 2, 3, 4, 5, 6, 7]);
        const seq = [k, k + d, k + 2 * d];
        const nextVal = k + 3 * d;
        return withMeta({
          id: `seed-ext-${seed}`,
          type: 'number',
          prompt: `Extiende la sucesión: <strong>${seq.join(', ')}, [___]</strong>.`,
          expected: nextVal,
          hints: [
            `Compará los términos consecutivos: restá ${seq[1]} − (${seq[0]}) y comprobá si se repite en el siguiente salto.`,
            'Confirmá que la variación entre cada término y el anterior es una suma o resta constante d.',
            `Sumá esa diferencia común al último término conocido (${seq[2]}) para obtener el cuarto poste.`,
          ],
          solution: `La diferencia es ${d}. Por lo tanto: ${seq[2]} + (${d}) = <strong>${nextVal}</strong>.`,
        });
      } else {
        const r = choice([2, 3, 0.5]);
        const start = choice([1, 2, 3, 4, 40]);
        const seq = [start, start * r, start * r * r];
        const nextVal = start * r * r * r;
        return withMeta({
          id: `seed-ext-${seed}`,
          type: 'number',
          prompt: `Extiende la sucesión: <strong>${seq.map((v) => fmt(v)).join(', ')}, [___]</strong>.`,
          expected: nextVal,
          hints: [
            `Calculá el cociente entre dos términos seguidos: ${fmt(seq[1])} / ${fmt(seq[0])}.`,
            'Verificá que la misma razón multiplicativa r lleva del segundo al tercer término.',
            `Multiplicá el último término conocido (${fmt(seq[2])}) por esa razón r.`,
          ],
          solution: `La razón es ${fmt(r)}. Por lo tanto: ${fmt(seq[2])} · ${fmt(r)} = <strong>${fmt(nextVal)}</strong>.`,
        });
      }
    }

    case 1: {
      // 2. Clasificar (ari, geo, none)
      const kindPick = choice(['ari', 'geo', 'none']);
      let seq, ansIdx, expl;
      if (kindPick === 'ari') {
        const k = randInt(2, 10);
        const d = randInt(-4, 6);
        seq = [k, k + d, k + 2 * d, k + 3 * d];
        ansIdx = 0;
        expl = `Es aritmética porque la diferencia entre términos es constante: d = ${d}.`;
      } else if (kindPick === 'geo') {
        const k = choice([1, 2, 3]);
        const r = choice([2, 3, -2]);
        seq = [k, k * r, k * r * r, k * r * r * r];
        ansIdx = 1;
        expl = `Es geométrica porque el cociente entre términos es constante: r = ${r}.`;
      } else {
        seq = choice([
          [1, 4, 9, 16],
          [1, 1, 2, 3, 5],
          [2, 3, 5, 8, 12],
        ]);
        ansIdx = 2;
        expl = 'No es ni aritmética ni geométrica porque ni sus diferencias ni sus razones son constantes.';
      }
      return withMeta({
        id: `seed-clas-${seed}`,
        type: 'choice',
        prompt: `¿Cómo se clasifica la sucesión <strong>${seq.join(', ')}…</strong>?`,
        options: ['Sucesión aritmética', 'Sucesión geométrica', 'Ninguna de las dos'],
        expected: ansIdx,
        explanation: expl,
        hints: [
          'Restá términos consecutivos (a(2) − a(1), a(3) − a(2)) para probar si la diferencia es constante.',
          'Si las diferencias cambian, dividí términos consecutivos (a(2) / a(1), a(3) / a(2)) para probar si la razón es constante.',
          'Si ni las diferencias ni los cocientes se mantienen constantes, descartá aritmética y geométrica.',
        ],
        solution: expl,
      });
    }

    case 2: {
      // 3. Extraer k y d (o r) para la recursiva
      const k = randInt(-8, 15);
      const d = choice([-6, -5, -3, 2, 4, 5, 7]);
      const seq = [k, k + d, k + 2 * d];
      return withMeta({
        id: `seed-rec-${seed}`,
        type: 'pair',
        prompt: `Escribe los valores de <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de <strong>${seq.join(', ')}…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.`,
        kLabel: 'k = a(1)',
        stepLabel: 'd (diferencia)',
        kind: 'ari',
        expected: { k, d },
        hints: [
          'En la definición recursiva, k representa el valor inicial a(1) de la lista.',
          'Para hallar d, calculá la resta entre el segundo término y el primero (respetando signos negativos).',
          'Verificá que sumar d al segundo término produzca exactamente el tercero de la lista.',
        ],
        solution: `El primer término es <strong>k = ${k}</strong> y la diferencia común es <strong>d = ${d}</strong>.`,
      });
    }

    case 3: {
      // 4. Escribir fórmula explícita
      const k = randInt(1, 10);
      const d = choice([3, 4, 5, 6, 7]);
      const seq = [k, k + d, k + 2 * d];
      return withMeta({
        id: `seed-exp-${seed}`,
        type: 'expr',
        prompt: `Escribe la fórmula explícita estándar de la sucesión <strong>${seq.join(', ')}…</strong>:`,
        expected: {
          expr: `${k} + ${d}*(n - 1)`,
          kind: 'ari',
          k,
          step: d,
        },
        hints: [
          'Identificá primero el término de arranque k = a(1) en el primer poste.',
          'Calculá el salto constante d restando dos términos consecutivos.',
          'Armá la fórmula explícita estándar multiplicando d por (n − 1) saltos desde k.',
        ],
        solution: `La fórmula estándar es: <strong>${k} + ${d}(n − 1)</strong>.`,
      });
    }

    case 4: {
      // 5. Convertir de recursiva a explícita
      const k = randInt(-10, 10);
      const d = randInt(2, 9);
      return withMeta({
        id: `seed-r2e-${seed}`,
        type: 'expr',
        prompt: `Dada la fórmula recursiva <code>{ a(1) = ${k} ; a(n) = a(n − 1) + ${d} }</code>, escribe su fórmula explícita estándar:`,
        expected: {
          expr: `${k} + ${d}*(n - 1)`,
          kind: 'ari',
          k,
          step: d,
        },
        hints: [
          'Leé directamente del caso base cuál es el valor inicial k = a(1).',
          'Leé de la regla recursiva el paso aditivo d que se suma en cada escalón.',
          'Recordá que desde el poste 1 al poste n hay (n − 1) saltos de tamaño d.',
        ],
        solution: `Fórmula estándar: <strong>${k} + ${d}(n − 1)</strong>.`,
      });
    }

    case 5: {
      // 6. Convertir de explícita simplificada a recursiva
      const c0 = randInt(2, 12);
      const d = choice([-5, -4, 3, 4, 6]);
      const a1 = c0 + d;
      return withMeta({
        id: `seed-e2r-${seed}`,
        type: 'pair',
        prompt: `Dada la fórmula simplificada <strong>a(n) = ${c0} + ${d}n</strong>, encuentra los valores para su fórmula recursiva <code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>:`,
        kLabel: 'k = a(1)',
        stepLabel: 'd',
        kind: 'ari',
        expected: { k: a1, d },
        hints: [
          'Atención: el término independiente no es a(1) porque esta fórmula no usa (n − 1).',
          'Evaluá explícitamente la expresión en n = 1 para obtener k = a(1).',
          'El coeficiente que multiplica a n indica cuánto cambia la sucesión por cada paso (d).',
        ],
        solution: `a(1) = ${a1} (por lo tanto <strong>k = ${a1}</strong>), y <strong>d = ${d}</strong>.`,
      });
    }

    case 6: {
      // 7. Hallar qué término vale X
      const k = randInt(1, 8);
      const d = choice([3, 4, 5]);
      const nTarget = randInt(12, 35);
      const targetVal = k + (nTarget - 1) * d;
      return withMeta({
        id: `seed-find-${seed}`,
        type: 'number',
        prompt: `En la sucesión aritmética <strong>a(n) = ${k} + ${d}(n − 1)</strong>, ¿qué número de término es igual a <strong>${targetVal}</strong>?`,
        expected: nTarget,
        hints: [
          `Planteá la ecuación ${k} + ${d}(n − 1) = ${targetVal}.`,
          `Despejá primero el término con paréntesis restando ${k} y luego dividiendo por ${d}.`,
          'Una vez obtenido el valor de (n − 1), no te olvides de sumar 1 para hallar la posición n.',
        ],
        solution: `n − 1 = ${(targetVal - k) / d} ⟹ n = <strong>${nTarget}</strong>.`,
      });
    }

    default: {
      // 8. Dos términos lejanos: hallar d
      const n1 = 1;
      const n2 = randInt(5, 12);
      const d = choice([3, 4, 5, 6, 8]);
      const a1 = randInt(2, 10);
      const a2 = a1 + (n2 - n1) * d;
      return withMeta({
        id: `seed-bridge-${seed}`,
        type: 'number',
        prompt: `En una sucesión aritmética, el primer término es <strong>a(1) = ${a1}</strong> y el término a(${n2}) es <strong>${a2}</strong>. ¿Cuál es la diferencia común d?`,
        expected: d,
        hints: [
          `Contá cuántos saltos separan al poste 1 del poste ${n2}: hay ${n2} − 1 saltos.`,
          `Calculá la diferencia total de valor entre a(${n2}) y a(1).`,
          'Dividí esa variación total por la cantidad de saltos (n − 1) para hallar d.',
        ],
        solution: `d = (${a2} − ${a1}) / (${n2} − 1) = ${a2 - a1} / ${n2 - 1} = <strong>${d}</strong>.`,
      });
    }
  }
}

/**
 * Banco de las 5 «Trampas Clásicas de Examen» de Khan Academy.
 */
export const TRAMPAS_CLASICAS = [
  {
    id: 'trampa-1',
    competencyId: 'sequences.geometric_explicit_and_models',
    exerciseFamily: 'geometric_explicit',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'detect_off_by_one_and_wrong_anchor_a2',
    diagnosticIds: ['exponent_n', 'wrong_anchor_a2'],
    title: 'Trampa 1 · Woo-Jin y Kiran en 64, 16, 4, 1…',
    desc: 'Sucesión pedida: <strong>64, 16, 4, 1</strong> comenzando en <i>n = 1</i> con <i>f(1) = 64</i>.<br>Woo-Jin propone: <code>f(n) = 64 · (1/4)ⁿ</code>.<br>Kiran propone: <code>f(n) = 16 · (1/4)ⁿ⁻¹</code>.',
    question: '¿Quién escribió la fórmula explícita correcta para esta sucesión?',
    options: [
      'Solo Woo-Jin escribió la fórmula correcta',
      'Solo Kiran escribió la fórmula correcta',
      'Ambos escribieron fórmulas equivalentes y correctas',
      'Ni Woo-Jin ni Kiran (ninguno acertó)',
    ],
    expected: 3, // D: Ni Woo-Jin ni Kiran
    explanation: '¡Exacto! Ninguno de los dos acertó. Evaluando en n = 1: Woo-Jin obtiene 64 · (1/4)¹ = 16 (usó exponente n en vez de n − 1). Kiran obtiene 16 · (1/4)⁰ = 16 (partió del segundo término en lugar del primero). La fórmula correcta era 64 · (1/4)^(n − 1).',
    hints: [
      'Evaluá ambas fórmulas propuestas en n = 1 para ver si reproducen el primer término f(1) = 64.',
      'Observá qué exponente usó Woo-Jin en n = 1 y qué valor inicial tomó Kiran como base.',
      'Compará el resultado numérico de ambos intentos contra el valor requerido f(1) = 64.',
    ],
    solution: `
      <p><strong>Balanza de comprobación en n = 1:</strong></p>
      <table class="seq-table" style="margin: 8px 0;">
        <tr><th>Fórmula</th><th>Evaluación en n = 1</th><th>Resultado</th><th>¿Coincide con a(1)=64?</th></tr>
        <tr><td>Sucesión pedida</td><td>Poste inicial</td><td><b>64</b></td><td>—</td></tr>
        <tr><td>Woo-Jin: 64 · (1/4)ⁿ</td><td>64 · (1/4)¹</td><td>16</td><td><span class="text-err">× Falsa</span></td></tr>
        <tr><td>Kiran: 16 · (1/4)ⁿ⁻¹</td><td>16 · (1/4)⁰</td><td>16</td><td><span class="text-err">× Falsa</span></td></tr>
      </table>
      <p>Ambos obtuvieron 16 en vez de 64. La opción correcta es <strong>Ni Woo-Jin ni Kiran (ninguno acertó)</strong>.</p>
    `,
  },
  {
    id: 'trampa-2',
    competencyId: 'sequences.geometric_explicit_and_models',
    exerciseFamily: 'compound_growth',
    representation: REPRESENTATION_TYPES.VERBAL,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.FAR,
    expectedEvidence: 'percentage_growth_multiplier_1_plus_p',
    diagnosticIds: [],
    title: 'Trampa 2 · La cuenta de ahorros de Caden',
    desc: 'Caden deposita <strong>$70</strong> en el año 1. Cada año su saldo aumenta un <strong>10%</strong> del saldo del año anterior.',
    question: '¿Cómo se clasifica y cuál es el factor de multiplicación anual correcto?',
    options: [
      'Aritmética: suma fija d = 10 cada año',
      'Geométrica: razón r = 1,10 (100% + 10%)',
      'Geométrica: razón r = 0,10',
    ],
    expected: 1, // B: r = 1,10
    explanation: '¡Excelente! Sumar 10% equivale a multiplicar por (1 + 0,10) = 1,10. Multiplicar por 0,10 destruiría el 90% del dinero.',
    hints: [
      'El 10% no se calcula siempre sobre los $70 iniciales, sino sobre el saldo acumulado cada año.',
      'Planteá: Saldo nuevo = Saldo previo + 0,10 · Saldo previo.',
      'Sacá factor común Saldo previo para leer qué factor incluye el 100% original más el 10% de aumento.',
    ],
    solution: 'Es una sucesión geométrica con <strong>r = 1,10</strong>.',
  },
  {
    id: 'trampa-3',
    competencyId: 'sequences.geometric_explicit_and_models',
    exerciseFamily: 'alternating_parentheses',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'negative_base_parentheses_and_n_minus_1',
    diagnosticIds: ['neg_pow_precedence', 'exponent_n'],
    title: 'Trampa 3 · Decimal y base negativa',
    desc: 'Dada la definición recursiva: <code>{ a(1) = −5,3 ; a(n) = a(n − 1) · (−11) }</code>.',
    question: '¿Cuál es la fórmula explícita estándar?',
    options: [
      'a(n) = −5,3 · (−11)ⁿ⁻¹',
      'a(n) = −5,3 · (−11)ⁿ',
      'a(n) = 5,3 · (−11)ⁿ⁻¹',
    ],
    expected: 0,
    explanation: '¡Correcto! En n = 1 el exponente debe ser n − 1 para que (−11)⁰ = 1 sea el neutro multiplicativo y sobreviva el −5,3.',
    hints: [
      'Leé el primer término exacto k = a(1) con su signo original.',
      'Recordá que en n = 1 no hay saltos todavía: evaluá el exponente en n = 1 para que el factor valga 1.',
      'Conservá los paréntesis alrededor de (−11) para que la potencia alterne signos paso a paso.',
    ],
    solution: 'Fórmula correcta: <strong>a(n) = −5,3 · (−11)ⁿ⁻¹</strong>.',
  },
  {
    id: 'trampa-4',
    competencyId: 'sequences.discrete_domain_and_notation',
    exerciseFamily: 'extend',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'identify_non_negative_integer_domain',
    diagnosticIds: [],
    title: 'Trampa 4 · El dominio de Supriya',
    desc: 'Supriya escribe la regla: <code>t(n) = −11 + 5·n</code> para generar <strong>−11, −6, −1, 4…</strong> aclarando que <code>t(0) = −11</code>.',
    question: '¿Qué conjunto de números debe ser el dominio de la función de Supriya?',
    options: [
      'n ≥ 1 · Dominio estándar ℕ = {1, 2, 3…}',
      'n ≥ 0 · Dominio de enteros no negativos ℕ₀ = {0, 1, 2…}',
      'Todos los números reales ℝ',
    ],
    expected: 1, // B: n >= 0
    explanation: '¡Exacto! El enunciado dice explícitamente que arranca en t(0) = −11. Por lo tanto el dominio comienza en n = 0 (ℕ₀).',
    hints: [
      'Observá si una sucesión admite números decimales intermedios o solo posiciones enteras.',
      'Fijate en qué valor de índice arranca el primer término dado explícitamente en el enunciado.',
      'Como incluye el índice cero antes de 1, 2, 3…, distinguí entre ℕ (desde 1) y ℕ₀ (desde 0).',
    ],
    solution: 'Como t(0) = −11, el conjunto de índices es <strong>n ≥ 0 (ℕ₀)</strong>.',
  },
  {
    id: 'trampa-5',
    competencyId: 'sequences.geometric_explicit_and_models',
    exerciseFamily: 'alternating_parentheses',
    representation: REPRESENTATION_TYPES.SYMBOLIC,
    stage: LEARNING_STAGES.INTERLEAVING,
    transferDistance: TRANSFER_DISTANCES.NEAR,
    expectedEvidence: 'evaluate_alternating_geometric_term',
    diagnosticIds: ['neg_pow_precedence'],
    title: 'Trampa 5 · Alternancia de signos y potencias',
    desc: 'Dada la regla: <code>{ a(1) = 8 ; a(n) = a(n − 1) · (−5) }</code>. Términos: <code>8, −40, 200…</code>.',
    question: '¿Cuánto vale exactamente el término a(4)?',
    options: [
      'a(4) = −1000',
      'a(4) = +1000',
      'a(4) = −125',
    ],
    expected: 0, // A: -1000
    explanation: '¡Impecable! a(4) = 8 · (−5)³ = 8 · (−125) = −1000. Al ser exponente impar (3), la potencia conserva el signo negativo.',
    hints: [
      'Contá cuántos saltos multiplicativos hay desde a(1) = 8 hasta a(4): son 4 − 1 = 3 pasos.',
      'Planteá 8 · (−5)³ y prestá atención al signo de una base negativa elevada a exponente impar.',
      'Multiplicá el resultado de (−5)³ por el primer término a(1) = 8.',
    ],
    solution: 'a(4) = 8 · (−5)³ = 8 · (−125) = <strong>−1000</strong>.',
  },
];

export function initRetosModule(container) {
  let activeTab = 'seed'; // 'seed' | 'trampas'
  let currentSeed = 1042;
  let typeFilter = -1; // -1: todos

  function render() {
    const tabs = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', activeTab === 'seed' ? 'is-active' : ''],
        on: { click: () => { activeTab = 'seed'; render(); } },
      }, 'Generador por Semilla Determinista'),
      h('button', {
        type: 'button',
        class: ['chip', activeTab === 'trampas' ? 'is-active' : ''],
        on: { click: () => { activeTab = 'trampas'; render(); } },
      }, 'Las 5 Trampas Clásicas de Examen')
    );

    let contentArea;

    if (activeTab === 'seed') {
      const typeOptions = [
        { id: -1, label: 'Todos los tipos combinados' },
        { id: -2, label: 'Adaptativo (recomendado por competencias)' },
        { id: 0, label: '1. Extender sucesión' },
        { id: 1, label: '2. Clasificar (ari, geo, none)' },
        { id: 2, label: '3. Armar recursiva (k y d/r)' },
        { id: 3, label: '4. Escribir explícita estándar' },
        { id: 4, label: '5. Recursiva a explícita' },
        { id: 5, label: '6. Explícita a recursiva' },
        { id: 6, label: '7. ¿Qué término vale X?' },
        { id: 7, label: '8. Dos términos lejanos (hallar d)' },
      ];

      let effectiveTypeFilter = typeFilter;
      let adaptiveBanner = null;
      if (typeFilter === -2) {
        const selection = selectAdaptiveExercise({
          moduleId: 'sucesiones',
          availableExercises: CHALLENGE_FAMILY_META,
          store: getProgressStore(),
        });
        if (selection?.exercise && typeof selection.exercise.typeIndex === 'number') {
          effectiveTypeFilter = selection.exercise.typeIndex;
          const comp = SEQ_COMPETENCIES.find((c) => c.id === selection.targetCompetencyId);
          adaptiveBanner = h('div', { class: 'notice small', style: 'margin-bottom: 10px;' },
            chalkIcon('sparkles'),
            h('span', null,
              comp ? h('strong', null, `${comp.title}: `) : null,
              selection.selectionReason
            )
          );
        } else {
          effectiveTypeFilter = -1;
        }
      }

      const seedControls = h('div', { class: 'seq-controls' },
        h('label', { class: 'field__label' },
          'Semilla actual: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: currentSeed,
            on: {
              change: (e) => {
                currentSeed = parseInt(e.target.value, 10) || 1;
                render();
              },
            },
          })
        ),
        h('button', {
          type: 'button',
          class: 'btn',
          on: {
            click: () => {
              currentSeed = Math.floor(Math.random() * 90000) + 1000;
              render();
            },
          },
        }, 'Generar nueva semilla aleatoria'),
        h('label', { class: 'field__label' },
          'Filtrar tipo: ',
          h('select', {
            class: 'seq-check__match-select',
            on: {
              change: (e) => {
                typeFilter = parseInt(e.target.value, 10);
                render();
              },
            },
          },
            typeOptions.map((opt) =>
              h('option', { value: opt.id, selected: typeFilter === opt.id }, opt.label)
            )
          )
        )
      );

      // Generar 3 ejercicios deterministas basados en la semilla
      const generatedQuestions = [
        generateProblem(currentSeed, effectiveTypeFilter),
        generateProblem(currentSeed + 13, effectiveTypeFilter),
        generateProblem(currentSeed + 97, effectiveTypeFilter),
      ];

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, generatedQuestions, `seed-${currentSeed}`, null, { persistSection: false });

      contentArea = h('div', null, seedControls, adaptiveBanner, checkSlot);
    } else {
      // Las 5 trampas clásicas
      const questions = TRAMPAS_CLASICAS.map((t) => ({
        id: t.id,
        competencyId: t.competencyId,
        exerciseFamily: t.exerciseFamily,
        representation: t.representation,
        stage: t.stage,
        transferDistance: t.transferDistance,
        expectedEvidence: t.expectedEvidence,
        diagnosticIds: t.diagnosticIds,
        type: 'choice',
        prompt: `<strong>${t.title}</strong><br>${t.desc}<br><p><strong>${t.question}</strong></p>`,
        options: t.options,
        expected: t.expected,
        explanation: t.explanation,
        hints: t.hints,
        solution: t.solution,
      }));

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, questions, 'trampas-clasicas', null, { persistSection: false });

      contentArea = h('div', null, checkSlot);
    }

    mount(container, tabs, contentArea);
  }

  render();
}
