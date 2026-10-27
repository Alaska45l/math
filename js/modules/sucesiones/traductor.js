import { fmt } from '../../core/math-format.js';

export function initTraductor(root) {
  root.innerHTML = `
    <h2>Escalera recursiva vs. teletransportador explícito</h2>
    <p>La fórmula recursiva describe cómo subir de un peldaño al siguiente paso a paso; la explícita calcula directamente cualquier término en un solo salto.</p>
    <div class="seq-controls">
      <label>Tipo
        <select id="tr-kind">
          <option value="ari">Aritmética · suma constante d</option>
          <option value="geo">Geométrica · multiplicación constante r</option>
        </select>
      </label>
      <label>Primer término a₁
        <input id="tr-a" type="number" value="3" step="any">
      </label>
      <label>Paso (d o r)
        <input id="tr-c" type="number" value="2" step="0.25">
      </label>
      <label>Calcular término n
        <input id="tr-n" type="number" value="4" min="1" max="25">
      </label>
    </div>
    <div class="seq-grid">
      <article class="seq-card">
        <h3>La llave recursiva</h3>
        <div class="seq-cases">
          <strong>inicio</strong><span>f(1) = <b class="seq-token" id="tr-a-token">3</b></span>
          <strong>paso</strong><span id="tr-rec"></span>
        </div>
        <h3 class="seq-title-spaced">El teletransportador explícito</h3>
        <p id="tr-exp" class="seq-equation"></p>
        <div id="tr-pedagogy-slot"></div>
      </article>
      <article class="seq-readout" id="tr-cost"></article>
    </div>
    <div class="seq-card seq-card--spaced">
      <h3>Sucesiones generales recursivas</h3>
      <p class="small muted">Cuando la regla involucra multiplicaciones y sumas combinadas, potencias o términos anteriores múltiples.</p>
      <div class="seq-controls">
        <label>Caso
          <select id="tr-general">
            <option value="a">A · Multiplica y suma: f(n) = 2 · f(n−1) + 1</option>
            <option value="b">B · No lineal: f(n) = [f(n−1)]² − 5</option>
            <option value="c">C · Dos términos previos: Fibonacci f(n) = f(n−1) + f(n−2)</option>
          </select>
        </label>
      </div>
      <div id="tr-general-out"></div>
    </div>
  `;

  const $ = s => root.querySelector(s);

  function renderRussianDolls(isGeo, a, c, dollN) {
    const n = Math.max(2, Math.min(dollN, 4));
    let steps = [];

    if (isGeo) {
      const cStr = c < 0 ? `(${fmt(c)})` : fmt(c);
      steps.push(`<b>Paso 1:</b> f(${n}) = f(${n - 1}) · ${cStr}`);
      if (n === 4) {
        steps.push(`<b>Paso 2:</b> Sustituyo f(3) = [f(2) · ${cStr}] &implies; f(4) = [f(2) · ${cStr}] · ${cStr} = f(2) · ${cStr}²`);
        steps.push(`<b>Paso 3:</b> Sustituyo f(2) = [f(1) · ${cStr}] &implies; f(4) = [f(1) · ${cStr}] · ${cStr}² = f(1) · ${cStr}³`);
      } else if (n === 3) {
        steps.push(`<b>Paso 2:</b> Sustituyo f(2) = [f(1) · ${cStr}] &implies; f(3) = [f(1) · ${cStr}] · ${cStr} = f(1) · ${cStr}²`);
      } else {
        steps.push(`<b>Paso 2:</b> Sustituyo f(1) = ${fmt(a)} &implies; f(2) = ${fmt(a)} · ${cStr}¹`);
      }
      return `
        <details class="seq-doll-box" open>
          <summary>Desarmar la "Muñeca Rusa" (Sustitución Regresiva para n = ${n})</summary>
          <div class="seq-doll-steps">
            ${steps.map(s => `<div class="seq-doll-step">${s}</div>`).join('')}
          </div>
          <div class="seq-doll-conclusion">
            ¡Mirá cómo la recursión fabrica el exponente: al sustituir escalón por escalón hasta el ancla inicial f(1), se acumularon exactamente (${n} − 1) = ${n - 1} factores ${cStr}!
          </div>
        </details>
      `;
    } else {
      const cStr = c >= 0 ? `+ ${fmt(c)}` : `− ${fmt(Math.abs(c))}`;
      const cPure = fmt(c);
      steps.push(`<b>Paso 1:</b> f(${n}) = f(${n - 1}) ${cStr}`);
      if (n === 4) {
        steps.push(`<b>Paso 2:</b> Sustituyo f(3) = [f(2) ${cStr}] &implies; f(4) = [f(2) ${cStr}] ${cStr} = f(2) + 2 · (${cPure})`);
        steps.push(`<b>Paso 3:</b> Sustituyo f(2) = [f(1) ${cStr}] &implies; f(4) = [f(1) ${cStr}] + 2 · (${cPure}) = f(1) + 3 · (${cPure})`);
      } else if (n === 3) {
        steps.push(`<b>Paso 2:</b> Sustituyo f(2) = [f(1) ${cStr}] &implies; f(3) = [f(1) ${cStr}] ${cStr} = f(1) + 2 · (${cPure})`);
      } else {
        steps.push(`<b>Paso 2:</b> Sustituyo f(1) = ${fmt(a)} &implies; f(2) = ${fmt(a)} + 1 · (${cPure})`);
      }
      return `
        <details class="seq-doll-box" open>
          <summary>Desarmar la "Muñeca Rusa" (Sustitución Regresiva para n = ${n})</summary>
          <div class="seq-doll-steps">
            ${steps.map(s => `<div class="seq-doll-step">${s}</div>`).join('')}
          </div>
          <div class="seq-doll-conclusion">
            ¡Mirá cómo la suma repetida de d fabrica la multiplicación: al sustituir hasta f(1), sumás la diferencia (${n} − 1) = ${n - 1} veces!
          </div>
        </details>
      `;
    }
  }

  function show() {
    const a = +$('#tr-a').value;
    const c = +$('#tr-c').value;
    const n = Math.max(1, Math.min(25, +$('#tr-n').value));
    const isGeo = $('#tr-kind').value === 'geo';

    $('#tr-a-token').textContent = fmt(a);

    // Recursiva
    if (isGeo) {
      const cLabel = c < 0 ? `(${fmt(c)})` : fmt(c);
      $('#tr-rec').innerHTML = `f(n) = f(n − 1) · <b>${cLabel}</b>`;
    } else {
      const cLabel = c >= 0 ? `+ ${fmt(c)}` : `− ${fmt(Math.abs(c))}`;
      $('#tr-rec').innerHTML = `f(n) = f(n − 1) <b>${cLabel}</b>`;
    }

    // Explícita con atención especial a paréntesis
    const needsParen = isGeo && (c < 0 || !Number.isInteger(c));
    const expBaseHtml = needsParen
      ? `<span class="seq-token-paren">(${fmt(c)})</span>`
      : fmt(c);

    if (isGeo) {
      $('#tr-exp').innerHTML = `f(n) = ${fmt(a)} · ${expBaseHtml}<sup>n − 1</sup>`;
    } else {
      const stepHtml = c >= 0 ? `+ ${fmt(c)}` : `− ${fmt(Math.abs(c))}`;
      $('#tr-exp').innerHTML = `f(n) = ${fmt(a)} ${stepHtml} · (n − 1)`;
    }

    // Slot pedagógico: Función Lineal (Aritmética) o Alerta de Paréntesis (Geométrica con r < 0 o fracción)
    const slot = $('#tr-pedagogy-slot');
    if (!isGeo) {
      // Puente con Función Lineal
      const b0 = a - c; // Poste 0 (ordenada al origen)
      const b0Str = b0 >= 0 ? `+ ${fmt(b0)}` : `− ${fmt(Math.abs(b0))}`;
      slot.innerHTML = `
        <div class="seq-linear-bridge">
          <h4>Puente con Función Lineal: y = m · x + b</h4>
          <p>Al aplicar propiedad distributiva en la fórmula explícita:</p>
          <p class="seq-equation">f(n) = ${fmt(a)} + ${fmt(c)} · (n − 1) = <strong>${fmt(c)} · n ${b0Str}</strong></p>
          <p>¡Es exactamente la ecuación de una recta <i>y = m · x + b</i> restringida a valores enteros de <i>n</i>!</p>
          <ul class="small seq-sublist">
            <li><strong>Pendiente m = ${fmt(c)}:</strong> Es la diferencia común <i>d</i>. Como entre términos contiguos avanzás <i>Δn = 1</i>, la tasa de cambio es <i>m = Δy / Δn = ${fmt(c)} / 1 = ${fmt(c)}</i>.</li>
            <li><strong>Ordenada al origen b = ${fmt(b0)}:</strong> Es el valor del <strong>"Poste 0"</strong> <i>(f(0) = a₁ − d)</i> si retrocedieras un paso antes de <i>f(1)</i>.</li>
          </ul>
        </div>
      `;
    } else if (c < 0) {
      slot.innerHTML = `
        <div class="seq-paren-alert">
          <strong>¡Alerta de Paréntesis Obligatorios!</strong><br>
          Como la razón es negativa (<i>r = ${fmt(c)}</i>), es fundamental escribir <code>(${fmt(c)})ⁿ⁻¹</code> con paréntesis:
          <ul class="seq-sublist">
            <li><strong>Con paréntesis (${fmt(c)})ⁿ⁻¹:</strong> Toda la base negativa se eleva. En exponentes pares da positivo y en impares da negativo, produciendo la alternancia de signos.</li>
            <li><strong>Sin paréntesis −${Math.abs(c)}ⁿ⁻¹:</strong> Por precedencia algebraica, la potencia afecta únicamente al ${Math.abs(c)} y el signo menos queda afuera: <code>−(${Math.abs(c)}ⁿ⁻¹)</code>. ¡Todos los términos darían negativos, invalidando el ejercicio!</li>
          </ul>
        </div>
      `;
    } else if (!Number.isInteger(c)) {
      slot.innerHTML = `
        <div class="seq-alert">
          <strong>Base fraccionaria:</strong> Al escribir bases racionales o decimales (como <i>${fmt(c)}</i>), los paréntesis <code>(${fmt(c)})ⁿ⁻¹</code> evitan confundir si la potencia eleva al numerador o a toda la fracción.
        </div>
      `;
    } else {
      slot.innerHTML = '';
    }

    // Cálculo y cadena de costos
    let v = a;
    let chain = [`f(1) = ${fmt(a)}`];
    for (let i = 2; i <= n; i++) {
      v = isGeo ? v * c : v + c;
      chain.push(`f(${i}) ← f(${i - 1}) ${isGeo ? '·' : '+'} ${fmt(c)}`);
    }

    const evalExpStr = isGeo
      ? `${fmt(a)} · (${fmt(c)})<sup>${n - 1}</sup>`
      : `${fmt(a)} + ${fmt(c)} · (${n - 1})`;

    $('#tr-cost').innerHTML = `
      <h3>Comparación de costos para calcular f(${n})</h3>
      <p><b>Escalera recursiva (${n - 1} cálculos encadenados):</b><br>
        <span class="small">${chain.slice(-5).reverse().join(' ← ')}${n > 5 ? ' ← …' : ''}</span>
      </p>
      <p><b>Teletransportador explícito (1 solo cálculo directo):</b><br>
        ${evalExpStr} = <strong class="seq-eval-out">${fmt(v, 2)}</strong>
      </p>
      ${renderRussianDolls(isGeo, a, c, n)}
    `;

    renderGeneral();
  }

  function renderGeneral() {
    const mode = $('#tr-general').value;
    const arr = mode === 'a' ? [2] : mode === 'b' ? [3] : [1, 1];
    const rows = [];

    for (let i = arr.length + 1; i <= 5; i++) {
      const prev = arr.at(-1);
      const val = mode === 'a' ? 2 * prev + 1 : mode === 'b' ? (prev ** 2) - 5 : arr.at(-1) + arr.at(-2);
      arr.push(val);

      const replaceStr = mode === 'a'
        ? `2 · ${fmt(prev)} + 1`
        : mode === 'b'
          ? `(${fmt(prev)})² − 5`
          : `${fmt(arr.at(-2))} + ${fmt(arr.at(-3))}`;

      rows.push(`
        <tr>
          <td><strong>f(${i})</strong></td>
          <td>${replaceStr}</td>
          <td><strong class="seq-good">${fmt(val)}</strong></td>
        </tr>
      `);
    }

    const formulaTitle = mode === 'a'
      ? 'f(1) = 2; &nbsp; f(n) = 2 · f(n − 1) + 1'
      : mode === 'b'
        ? 'f(1) = 3; &nbsp; f(n) = [f(n − 1)]² − 5'
        : 'f(1) = 1; &nbsp; f(2) = 1; &nbsp; f(n) = f(n − 1) + f(n − 2)';

    $('#tr-general-out').innerHTML = `
      <p class="seq-equation seq-equation--highlight">${formulaTitle}</p>
      <table class="seq-table">
        <thead>
          <tr>
            <th>Término objetivo</th>
            <th>Sustitución recursiva</th>
            <th>Resultado numérico</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
    `;
  }

  root.querySelectorAll('input, select').forEach(x => x.addEventListener('input', show));
  $('#tr-general').addEventListener('change', renderGeneral);
  show();
}

