import { fmt, fractionHtml } from '../../core/math-format.js';

export function initRetos(root) {
  function verifyTableHtml(indices, realVals, genVals, formulaLabel) {
    const headerCols = indices.map(idx => `<th>n = ${idx}</th>`).join('');
    const realCols = realVals.map(v => `<td><strong>${fmt(v, 2)}</strong></td>`).join('');
    const genCols = genVals.map((v, i) => {
      const match = typeof v === 'number' && Math.abs(v - realVals[i]) < 1e-4;
      const vStr = typeof v === 'number' ? fmt(v, 2) : v;
      const checkSvg = `<svg class="chalk-icon chalk-icon--check inline-mark" viewBox="0 0 16 16" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 8.5 L6 12 L14 3.5"/></svg><span class="sr-only">correcta</span>`;
      if (match) {
        return `<td class="seq-cell-good">${vStr} ${checkSvg}</td>`;
      } else {
        return `<td class="seq-cell-bad"><span class="tachado seq-verify-bad-val">${vStr}</span> <span class="encerrado">${fmt(realVals[i], 2)}</span></td>`;
      }
    }).join('');

    return `
      <div class="seq-verify-block">
        <p class="small seq-verify-label"><strong>Balanza de comprobación (primeros términos):</strong></p>
        <table class="seq-verify-table">
          <thead>
            <tr>
              <th class="seq-cell-left">Fórmula / Sucesión</th>
              ${headerCols}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="seq-cell-left"><b>Sucesión pedida:</b></td>
              ${realCols}
            </tr>
            <tr>
              <td class="seq-cell-left"><b>${formulaLabel}:</b></td>
              ${genCols}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  const tasks = [
    {
      title: 'Reto 1 · Woo-Jin o Kiran',
      desc: 'Sucesión pedida: <strong>64, 16, 4, 1</strong> comenzando en <i>n = 1</i> con <i>f(1) = 64</i>.',
      question: '¿Quién escribió la fórmula explícita correcta?',
      answers: [
        'Woo-Jin: 64 · (1/4)ⁿ',
        'Kiran: 16 · (1/4)ⁿ⁻¹',
        'Ambos escribieron fórmulas equivalentes'
      ],
      correctIndex: -1, // Ninguno de los dos
      realIndices: [1, 2, 3],
      realVals: [64, 16, 4],
      evalGen: (ansIdx) => {
        if (ansIdx === 0) {
          // Woo-Jin: 64 * (0.25^n)
          return { label: 'Woo-Jin: 64 · (1/4)ⁿ', vals: [64 * 0.25, 64 * (0.25 ** 2), 64 * (0.25 ** 3)] };
        } else if (ansIdx === 1) {
          // Kiran: 16 * (0.25^(n-1))
          return { label: 'Kiran: 16 · (1/4)ⁿ⁻¹', vals: [16, 16 * 0.25, 16 * (0.25 ** 2)] };
        } else {
          return { label: 'Ambos', vals: [16, 4, 1] };
        }
      },
      feedback: (ansIdx) => {
        return `
          <p><span class="seq-bad">¡Ninguno de los dos acertó!</span></p>
          <p>Al evaluar en <b>n = 1</b>:</p>
          <ul class="small seq-compact-list">
            <li><b>Woo-Jin</b> obtiene <code>64 · (1/4)¹ = 16</code>. Al poner exponente <i>n</i> en vez de <i>n − 1</i>, no llega al neutro 1 y da un salto de más antes de empezar.</li>
            <li><b>Kiran</b> obtiene <code>16 · (1/4)⁰ = 16</code>. Su exponente es correcto, pero partió de 16 en vez de 64.</li>
          </ul>
          <p>La fórmula correcta era: <strong>f(n) = 64 · (1/4)ⁿ⁻¹</strong>.</p>
        `;
      }
    },
    {
      title: 'Reto 2 · Ahorro e interés de Caden',
      desc: 'Caden deposita <strong>$70</strong> en el año 1. Cada año su saldo aumenta un <strong>10%</strong> de lo que tenía.',
      question: '¿Cómo se clasifica y modela el saldo anual?',
      answers: [
        'Aritmética: suma fija d = 10 cada año',
        'Geométrica: razón r = 1,1 (100% + 10%)',
        'Geométrica: razón r = 0,1'
      ],
      correctIndex: 1,
      realIndices: [1, 2, 3],
      realVals: [70, 77, 84.7],
      evalGen: (ansIdx) => {
        if (ansIdx === 0) return { label: 'Aritmética (+10)', vals: [70, 80, 90] };
        if (ansIdx === 1) return { label: 'Geométrica (×1,1)', vals: [70, 77, 84.7] };
        return { label: 'Geométrica (×0,1)', vals: [70, 7, 0.7] };
      },
      feedback: (ansIdx) => {
        const ok = ansIdx === 1;
        return `
          <p><span class="${ok ? 'seq-good' : 'seq-bad'}">${ok ? '¡Exacto!' : 'Revisá el concepto:'}</span>
          El 10% se calcula sobre el saldo acumulado en cada paso, no como una suma estática:
          <code>70 + 0,10 · 70 = 70 · (1 + 0,10) = 70 · 1,1</code>. Es geométrica con razón <b>r = 1,1</b>.
          </p>
        `;
      }
    },
    {
      title: 'Reto 3 · Razón negativa decimal',
      desc: 'Dada la definición recursiva: <i>h(1) = −5,3</i> con <i>h(n) = h(n − 1) · (−11)</i>.',
      question: '¿Cuál es la fórmula explícita correcta?',
      answers: [
        'h(n) = −5,3 · (−11)ⁿ⁻¹',
        'h(n) = −5,3 · (−11)ⁿ',
        'h(n) = 5,3 · (−11)ⁿ⁻¹'
      ],
      correctIndex: 0,
      realIndices: [1, 2, 3],
      realVals: [-5.3, 58.3, -641.3],
      evalGen: (ansIdx) => {
        if (ansIdx === 0) return { label: '−5,3 · (−11)ⁿ⁻¹', vals: [-5.3, 58.3, -641.3] };
        if (ansIdx === 1) return { label: '−5,3 · (−11)ⁿ', vals: [58.3, -641.3, 7054.3] };
        return { label: '5,3 · (−11)ⁿ⁻¹', vals: [5.3, -58.3, 641.3] };
      },
      feedback: (ansIdx) => {
        const ok = ansIdx === 0;
        return `
          <p><span class="${ok ? 'seq-good' : 'seq-bad'}">${ok ? '¡Perfecto!' : 'Atención al índice y signo:'}</span>
          Como arranca en <i>n = 1</i>, el exponente debe ser <b>n − 1</b> para que en <i>n = 1</i> el exponente sea 0 y <code>(−11)⁰ = 1</code> (neutro multiplicativo).
          Además, los <strong>paréntesis en (−11)</strong> son obligatorios para mantener el signo negativo dentro de la base elevada.
          </p>
        `;
      }
    },
    {
      title: 'Reto 4 · Dominio de Supriya',
      desc: 'Supriya escribe la regla: <i>t(n) = −11 + 5 · n</i> para generar <strong>−11, −6, −1, 4, …</strong> con <i>t(0) = −11</i>.',
      question: '¿Qué dominio corresponde al conjunto de índices de Supriya?',
      answers: [
        'n ≥ 1 · Dominio ℕ = {1, 2, 3, …}',
        'n ≥ 0 · Dominio ℕ₀ = {0, 1, 2, …}',
        'n > 0 · Dominio de enteros positivos estrictos'
      ],
      correctIndex: 1,
      realIndices: [0, 1, 2],
      realVals: [-11, -6, -1],
      evalGen: (ansIdx) => {
        if (ansIdx === 1) return { label: 'Dominio n ≥ 0 (arranca en 0)', vals: [-11, -6, -1] };
        return { label: 'Dominio n ≥ 1 (arranca en 1)', vals: [-6, -1, 4] };
      },
      feedback: (ansIdx) => {
        const ok = ansIdx === 1;
        return `
          <p><span class="${ok ? 'seq-good' : 'seq-bad'}">${ok ? '¡Muy bien!' : 'Cuidado con el punto de partida:'}</span>
          El enunciado dice explícitamente que el primer término es <b>t(0) = −11</b>. Por eso el dominio arranca en <b>0 (ℕ₀)</b>.
          Si usáramos <i>n ≥ 1</i>, el primer valor evaluado sería <code>t(1) = −11 + 5·1 = −6</code>, perdiéndose el −11 inicial.
          </p>
        `;
      }
    },
    {
      title: 'Reto 5 · Geométrica alternante',
      desc: 'Dada <i>d(1) = 8</i> y <i>d(n) = d(n − 1) · (−5)</i>. Sucesión: 8, −40, 200, …',
      question: '¿Cuál es el valor del término d(4)?',
      answers: [
        'd(4) = −1000',
        'd(4) = +1000',
        'd(4) = −125'
      ],
      correctIndex: 0,
      realIndices: [1, 2, 3, 4],
      realVals: [8, -40, 200, -1000],
      evalGen: (ansIdx) => {
        if (ansIdx === 0) return { label: 'Opción −1000: 8 · (−5)³', vals: [8, -40, 200, -1000] };
        if (ansIdx === 1) return { label: 'Opción +1000: signo invertido', vals: [8, 40, 200, 1000] };
        return { label: 'Opción −125: solo (−5)³ sin multiplicar por 8', vals: [1, -5, 25, -125] };
      },
      feedback: (ansIdx) => {
        const ok = ansIdx === 0;
        return `
          <p><span class="${ok ? 'seq-good' : 'seq-bad'}">${ok ? '¡Impecable!' : 'Atención al exponente impar:'}</span>
          La fórmula es <code>d(n) = 8 · (−5)ⁿ⁻¹</code>. En <i>n = 4</i> tenemos 3 saltos:
          <code>d(4) = 8 · (−5)³ = 8 · (−125) = −1000</code>.
          Como la potencia tiene exponente impar (3), la base negativa conserva el signo menos.
          </p>
        `;
      }
    }
  ];

  root.innerHTML = `
    <h2>Entrenador · cinco situaciones de la unidad</h2>
    <p>Elegí una respuesta en cada reto. Se desplegará la <strong>Balanza de Comprobación</strong> comparando los primeros términos reales contra la opción elegida, para que veas exactamente dónde encaja o dónde se desfasa.</p>
    <div class="seq-exercises">
      ${tasks.map((t, i) => `
        <article class="seq-exercise" data-task="${i}">
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
          <p><strong>${t.question}</strong></p>
          <div class="seq-options">
            ${t.answers.map((ans, j) => {
              const letter = String.fromCharCode(65 + j);
              return `
              <button type="button" class="btn" data-answer="${j}">
                <span class="quiz-opt-tag">${letter})</span> ${ans.replace('1/4', '<span class="seq-frac"></span>')}
              </button>
            `;}).join('')}
          </div>
          <div class="seq-feedback" aria-live="polite"></div>
        </article>
      `).join('')}
    </div>
  `;

  // Reemplazar fracciones tipográficas
  root.querySelectorAll('.seq-frac').forEach(slot => {
    slot.replaceWith(fractionHtml('1', '4'));
  });

  // Reto 2 interactivo adicional (fórmula de Caden)
  const cadenCard = root.querySelector('[data-task="1"]');
  cadenCard.insertAdjacentHTML('beforeend', `
    <div class="seq-caden-block">
      <p class="small"><b>Comprobá con tus propios valores de Caden:</b></p>
      <div class="seq-caden-controls">
        <label class="small">Saldo f(1): <input data-caden="start" class="seq-input-sm" type="number" value="70"></label>
        <label class="small">Factor anual r: <input data-caden="factor" class="seq-input-sm" type="number" step="0.1" value="1.1"></label>
        <button type="button" class="btn" data-caden-check>Verificar prueba</button>
      </div>
      <div class="seq-caden-feedback"></div>
    </div>
  `);

  cadenCard.querySelector('[data-caden-check]').onclick = () => {
    const aVal = +cadenCard.querySelector('[data-caden="start"]').value;
    const rVal = +cadenCard.querySelector('[data-caden="factor"]').value;
    const isGood = aVal === 70 && Math.abs(rVal - 1.1) < 1e-4;
    const gen = [aVal, aVal * rVal, aVal * (rVal ** 2)];
    const table = verifyTableHtml([1, 2, 3], [70, 77, 84.7], gen, `Tu fórmula: ${aVal} · (${rVal})ⁿ⁻¹`);

    cadenCard.querySelector('.seq-caden-feedback').innerHTML = `
      <p><span class="${isGood ? 'seq-good' : 'seq-bad'}">${isGood ? '¡Excelente configuración!' : 'Revisá los valores:'}</span>
      Saldo inicial = 70, factor multiplicador = 1,1 (100% de base + 10% de ganancia anual).
      </p>
      ${table}
    `;
  };

  // Manejador de clics en las opciones de retos
  root.querySelectorAll('.seq-exercise').forEach(card => {
    const taskIdx = Number(card.dataset.task);
    const task = tasks[taskIdx];

    card.querySelectorAll('[data-answer]').forEach(btn => {
      btn.onclick = () => {
        const ansIdx = Number(btn.dataset.answer);
        const isCorrect = ansIdx === task.correctIndex;
        card.querySelectorAll('[data-answer]').forEach(b => {
          b.classList.remove('is-active', 'is-correct', 'is-incorrect');
          const tag = b.querySelector('.quiz-opt-tag');
          if (tag) tag.classList.remove('encerrado', 'tachado');
        });
        btn.classList.add('is-active');
        btn.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
        const tag = btn.querySelector('.quiz-opt-tag');
        if (tag) tag.classList.add(isCorrect ? 'encerrado' : 'tachado');

        const { label, vals } = task.evalGen(ansIdx);
        const table = verifyTableHtml(task.realIndices, task.realVals, vals, label);
        const fbText = task.feedback(ansIdx);

        card.querySelector('.seq-feedback').innerHTML = `
          ${fbText}
          ${table}
          <p class="small muted seq-hint-text">
            Estrategia de examen: calcular <i>n = 1</i> y <i>n = 2</i> descarta al instante opciones desfasadas o con bases erróneas sin recurrir a adivinanzas.
          </p>
        `;
      };
    });
  });
}

