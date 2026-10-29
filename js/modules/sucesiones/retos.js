/**
 * retos.js — Capítulo 4: Entrenador determinista por semilla y Trampas Clásicas de Examen.
 * 1. PRNG determinista mulberry32 con generador de los 8 tipos de problemas de Khan Academy.
 * 2. Banco de las 5 Trampas Clásicas de Examen (corregidas y enriquecidas con tablas de balanza).
 */

import { h, mount } from '../../core/dom.js';
import { fmt, fractionHtml, MINUS } from '../../core/math-format.js';
import { createCheckBlock } from './components.js';

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
function generateProblem(seed, typeFilter = -1) {
  const rand = mulberry32(seed);
  const choice = (arr) => arr[Math.floor(rand() * arr.length)];
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const type = typeFilter >= 0 && typeFilter <= 7 ? typeFilter : Math.floor(rand() * 8);

  switch (type) {
    case 0: {
      // 1. Extender la sucesión
      const k = randInt(-5, 15);
      const isAri = rand() > 0.4;
      if (isAri) {
        const d = choice([-5, -4, -3, 2, 3, 4, 5, 6, 7]);
        const seq = [k, k + d, k + 2 * d];
        const nextVal = k + 3 * d;
        return {
          id: `seed-ext-${seed}`,
          type: 'number',
          prompt: `Extiende la sucesión: <strong>${seq.join(', ')}, [___]</strong>.`,
          expected: nextVal,
          hints: [
            `Calculá la diferencia entre términos: ${seq[1]} − (${seq[0]}) = ${d}.`,
            `Sumale ${d} al último término: ${seq[2]} + (${d}).`,
          ],
          solution: `La diferencia es ${d}. Por lo tanto: ${seq[2]} + (${d}) = <strong>${nextVal}</strong>.`,
        };
      } else {
        const r = choice([2, 3, 0.5]);
        const start = choice([1, 2, 3, 4, 40]);
        const seq = [start, start * r, start * r * r];
        const nextVal = start * r * r * r;
        return {
          id: `seed-ext-${seed}`,
          type: 'number',
          prompt: `Extiende la sucesión: <strong>${seq.map((v) => fmt(v)).join(', ')}, [___]</strong>.`,
          expected: nextVal,
          hints: [
            `Calculá la razón entre términos: ${seq[1]} / ${seq[0]} = ${fmt(r)}.`,
            `Multiplicá ${fmt(seq[2])} por ${fmt(r)}.`,
          ],
          solution: `La razón es ${fmt(r)}. Por lo tanto: ${fmt(seq[2])} · ${fmt(r)} = <strong>${fmt(nextVal)}</strong>.`,
        };
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
      return {
        id: `seed-clas-${seed}`,
        type: 'choice',
        prompt: `¿Cómo se clasifica la sucesión <strong>${seq.join(', ')}…</strong>?`,
        options: ['Sucesión aritmética', 'Sucesión geométrica', 'Ninguna de las dos'],
        expected: ansIdx,
        explanation: expl,
        hints: ['Calculá las diferencias consecutivas y los cocientes consecutivos.'],
        solution: expl,
      };
    }

    case 2: {
      // 3. Extraer k y d (o r) para la recursiva
      const k = randInt(-8, 15);
      const d = choice([-6, -5, -3, 2, 4, 5, 7]);
      const seq = [k, k + d, k + 2 * d];
      return {
        id: `seed-rec-${seed}`,
        type: 'pair',
        prompt: `Escribe los valores de <strong>k</strong> y <strong>d</strong> en la fórmula recursiva de <strong>${seq.join(', ')}…</strong>: <br><code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>.`,
        kLabel: 'k = a(1)',
        stepLabel: 'd (diferencia)',
        kind: 'ari',
        expected: { k, d },
        hints: [
          `El primer término es el primer número de la lista: k = ${k}.`,
          `La diferencia común es ${seq[1]} − (${k}) = ${d}.`,
        ],
        solution: `El primer término es <strong>k = ${k}</strong> y la diferencia común es <strong>d = ${d}</strong>.`,
      };
    }

    case 3: {
      // 4. Escribir fórmula explícita
      const k = randInt(1, 10);
      const d = choice([3, 4, 5, 6, 7]);
      const seq = [k, k + d, k + 2 * d];
      return {
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
          `Primer término k = ${k}.`,
          `Diferencia común d = ${d}.`,
          `Fórmula estándar: k + d(n − 1).`,
        ],
        solution: `La fórmula estándar es: <strong>${k} + ${d}(n − 1)</strong>.`,
      };
    }

    case 4: {
      // 5. Convertir de recursiva a explícita
      const k = randInt(-10, 10);
      const d = randInt(2, 9);
      return {
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
          `Identificá k = ${k} y d = ${d}.`,
          `Sustituí en k + d(n − 1).`,
        ],
        solution: `Fórmula estándar: <strong>${k} + ${d}(n − 1)</strong>.`,
      };
    }

    case 5: {
      // 6. Convertir de explícita simplificada a recursiva
      const c0 = randInt(2, 12);
      const d = choice([-5, -4, 3, 4, 6]);
      const a1 = c0 + d;
      return {
        id: `seed-e2r-${seed}`,
        type: 'pair',
        prompt: `Dada la fórmula simplificada <strong>a(n) = ${c0} + ${d}n</strong>, encuentra los valores para su fórmula recursiva <code>{ a(1) = k ; a(n) = a(n − 1) + d }</code>:`,
        kLabel: 'k = a(1)',
        stepLabel: 'd',
        kind: 'ari',
        expected: { k: a1, d },
        hints: [
          `Evaluá en n = 1: a(1) = ${c0} + ${d}(1) = ${a1}.`,
          `El coeficiente de n es la diferencia común d = ${d}.`,
        ],
        solution: `a(1) = ${a1} (por lo tanto <strong>k = ${a1}</strong>), y <strong>d = ${d}</strong>.`,
      };
    }

    case 6: {
      // 7. Hallar qué término vale X
      const k = randInt(1, 8);
      const d = choice([3, 4, 5]);
      const nTarget = randInt(12, 35);
      const targetVal = k + (nTarget - 1) * d;
      return {
        id: `seed-find-${seed}`,
        type: 'number',
        prompt: `En la sucesión aritmética <strong>a(n) = ${k} + ${d}(n − 1)</strong>, ¿qué número de término es igual a <strong>${targetVal}</strong>?`,
        expected: nTarget,
        hints: [
          `Igualá la fórmula a ${targetVal}: ${k} + ${d}(n − 1) = ${targetVal}.`,
          `Restá ${k}: ${d}(n − 1) = ${targetVal - k}.`,
          `Dividí por ${d}: n − 1 = ${(targetVal - k) / d}. Luego sumá 1.`,
        ],
        solution: `n − 1 = ${(targetVal - k) / d} ⟹ n = <strong>${nTarget}</strong>.`,
      };
    }

    default: {
      // 8. Dos términos lejanos: hallar d
      const n1 = 1;
      const n2 = randInt(5, 12);
      const d = choice([3, 4, 5, 6, 8]);
      const a1 = randInt(2, 10);
      const a2 = a1 + (n2 - n1) * d;
      return {
        id: `seed-bridge-${seed}`,
        type: 'number',
        prompt: `En una sucesión aritmética, el primer término es <strong>a(1) = ${a1}</strong> y el término a(${n2}) es <strong>${a2}</strong>. ¿Cuál es la diferencia común d?`,
        expected: d,
        hints: [
          `Hay ${n2} − 1 = ${n2 - 1} saltos.`,
          `Distancia cubierta: ${a2} − ${a1} = ${a2 - a1}.`,
          `Dividí la distancia por los saltos: (${a2 - a1}) / ${n2 - 1}.`,
        ],
        solution: `d = (${a2} − ${a1}) / (${n2} − 1) = ${a2 - a1} / ${n2 - 1} = <strong>${d}</strong>.`,
      };
    }
  }
}

/**
 * Banco de las 5 «Trampas Clásicas de Examen» de Khan Academy.
 */
const TRAMPAS_CLASICAS = [
  {
    id: 'trampa-1',
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
      'Evaluá ambas fórmulas en n = 1 para ver si dan el primer término (64).',
      'Woo-Jin en n = 1: 64 · (1/4)¹ = 16.',
      'Kiran en n = 1: 16 · (1/4)⁰ = 16 · 1 = 16.',
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
      'El 10% no se calcula sobre el primer depósito, sino sobre el saldo acumulado en cada paso.',
      'Saldo nuevo = Saldo viejo + 0,10 · Saldo viejo = Saldo viejo · (1 + 0,10).',
    ],
    solution: 'Es una sucesión geométrica con <strong>r = 1,10</strong>.',
  },
  {
    id: 'trampa-3',
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
      'Recordá que en n = 1 no hay saltos: el exponente debe dar 0.',
      'Los paréntesis en (−11) son obligatorios para conservar la alternancia.',
    ],
    solution: 'Fórmula correcta: <strong>a(n) = −5,3 · (−11)ⁿ⁻¹</strong>.',
  },
  {
    id: 'trampa-4',
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
      'Fijate en qué número de índice arranca el primer valor dado en el enunciado.',
    ],
    solution: 'Como t(0) = −11, el conjunto de índices es <strong>n ≥ 0 (ℕ₀)</strong>.',
  },
  {
    id: 'trampa-5',
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
      'a(4) = 8 · (−5)³.',
      '(−5)³ = (−5) · (−5) · (−5) = 25 · (−5) = −125.',
      '8 · (−125) = −1000.',
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
        { id: 0, label: '1. Extender sucesión' },
        { id: 1, label: '2. Clasificar (ari, geo, none)' },
        { id: 2, label: '3. Armar recursiva (k y d/r)' },
        { id: 3, label: '4. Escribir explícita estándar' },
        { id: 4, label: '5. Recursiva a explícita' },
        { id: 5, label: '6. Explícita a recursiva' },
        { id: 6, label: '7. ¿Qué término vale X?' },
        { id: 7, label: '8. Dos términos lejanos (hallar d)' },
      ];

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
        generateProblem(currentSeed, typeFilter),
        generateProblem(currentSeed + 13, typeFilter),
        generateProblem(currentSeed + 97, typeFilter),
      ];

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, generatedQuestions, `seed-${currentSeed}`);

      contentArea = h('div', null, seedControls, checkSlot);
    } else {
      // Las 5 trampas clásicas
      const questions = TRAMPAS_CLASICAS.map((t) => ({
        id: t.id,
        type: 'choice',
        prompt: `<strong>${t.title}</strong><br>${t.desc}<br><p><strong>${t.question}</strong></p>`,
        options: t.options,
        expected: t.expected,
        explanation: t.explanation,
        hints: t.hints,
        solution: t.solution,
      }));

      const checkSlot = h('div', null);
      createCheckBlock(checkSlot, questions, 'trampas-clasicas');

      contentArea = h('div', null, checkSlot);
    }

    mount(container, tabs, contentArea);
  }

  render();
}
