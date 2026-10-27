import { fmt, fractionHtml } from '../../core/math-format.js';

export function initPostes(root) {
  root.innerHTML = `
    <h2>El contador de postes y saltos</h2>
    <p>Un término es un poste de partida; cada salto aplica la regla una vez. Elegí desde qué índice arranca la sucesión para ver cómo se calculan los saltos.</p>
    <div class="seq-controls">
      <label>Tipo
        <select id="seq-kind">
          <option value="geo">Geométrica · × r</option>
          <option value="ari">Aritmética · + d</option>
        </select>
      </label>
      <label>Dominio
        <select id="seq-domain">
          <option value="1">Arranca en n = 1 · ℕ (n − 1 saltos)</option>
          <option value="0">Arranca en n = 0 · ℕ₀ (n saltos)</option>
        </select>
      </label>
      <label>Preset de situación
        <select id="seq-preset">
          <option value="woo">Woo-Jin y Kiran (Geométrica · 64, 16, 4, …)</option>
          <option value="sup">Supriya (Aritmética desde n = 0 · −11, −6, −1, …)</option>
          <option value="custom">Personalizado</option>
        </select>
      </label>
      <label>Primer término (a₁ o a₀) · <output id="seq-first-out">64</output>
        <input id="seq-first" type="range" min="-20" max="80" value="64" step="1" class="seq-range">
      </label>
      <label>Paso (d o r) · <output id="seq-change-out">0,25</output>
        <input id="seq-change" type="range" min="-11" max="11" value="0.25" step="0.25" class="seq-range">
      </label>
      <label>Término seleccionado (n) · <output id="seq-n-out">1</output>
        <input id="seq-n" type="range" min="1" max="7" value="1" class="seq-range">
      </label>
    </div>
    <div class="seq-grid">
      <div class="seq-card">
        <p class="small muted" style="margin-bottom:8px">Hacé clic sobre cualquier poste en el riel para seleccionarlo directamente:</p>
        <div class="seq-track-wrap">
          <svg id="seq-track" class="seq-track" viewBox="0 0 700 195" role="img" aria-label="Riel de postes y saltos"></svg>
        </div>
      </div>
      <aside class="seq-readout" id="seq-count"></aside>
    </div>
    <div id="seq-compare"></div>
  `;

  const $ = s => root.querySelector(s);
  const preset = $('#seq-preset');

  function draw() {
    const k = $('#seq-kind').value;
    const start = Number($('#seq-domain').value);
    const a = Number($('#seq-first').value);
    const c = Number($('#seq-change').value);
    const n = Number($('#seq-n').value);

    $('#seq-n-out').value = start === 1 ? n : n - 1;
    $('#seq-first-out').value = fmt(a);
    $('#seq-change-out').value = fmt(c);

    // 7 términos discretos
    const vals = Array.from({ length: 7 }, (_, i) => k === 'geo' ? a * (c ** i) : a + c * i);
    const hops = n - 1;
    const currentIdx = start + hops;
    const currentVal = vals[hops];

    // Render del SVG
    const svg = $('#seq-track');
    let svgHtml = `
      <defs>
        <marker id="seq-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="currentColor"/>
        </marker>
      </defs>
    `;

    // Arcos de saltos
    for (let i = 0; i < 6; i++) {
      const x = 75 + i * 92;
      const isTravelled = i < hops;
      const stepLabel = k === 'geo' ? `× ${fmt(c)}` : `${c >= 0 ? '+' : ''} ${fmt(c)}`;
      svgHtml += `
        <path class="seq-arc ${isTravelled ? 'is-travelled' : ''}" d="M${x + 12} 88 Q${x + 46} 28 ${x + 80} 88"/>
        <text class="seq-arc-label ${isTravelled ? 'is-travelled' : ''}" x="${x + 46}" y="42">${stepLabel}</text>
      `;
    }

    // Postes
    vals.forEach((v, i) => {
      const x = 75 + i * 92;
      const idx = start + i;
      const isActive = i === hops;
      svgHtml += `
        <g class="seq-point ${isActive ? 'is-active' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="Poste ${idx}, valor ${fmt(v, 2)}">
          <title>Hacé clic para seleccionar n = ${idx}</title>
          <circle class="seq-post ${isActive ? 'is-active' : ''}" cx="${x}" cy="92" r="${isActive ? 20 : 17}"/>
          <text class="seq-index" x="${x}" y="136">n = ${idx}</text>
          <text class="seq-post-val" x="${x}" y="97">${fmt(v, 2)}</text>
        </g>
      `;
    });

    svg.innerHTML = svgHtml;

    // Listeners de clic y teclado en los postes del SVG
    svg.querySelectorAll('[data-i]').forEach(el => {
      const selectPost = () => {
        $('#seq-n').value = Number(el.dataset.i) + 1;
        draw();
      };
      el.onclick = selectPost;
      el.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPost();
        }
      };
    });

    // Panel de lectura y Elementos Neutros
    const isZeroHop = hops === 0;
    const isGeo = k === 'geo';

    let neutralHtml = '';
    if (isGeo) {
      neutralHtml = `
        <div class="seq-neutral-box">
          <h4><span class="seq-neutral-badge seq-neutral-badge--mul">Neutro Multiplicativo (1)</span>El Salto Cero en la Geométrica</h4>
          <p>Al estar en el primer poste das <strong>0 saltos</strong>. Elevar la razón a la 0 genera el neutro multiplicativo <strong>1</strong>:</p>
          <p class="seq-equation">f(${currentIdx}) = ${fmt(a)} · (${fmt(c)})⁰ = ${fmt(a)} · <strong>1</strong> = ${fmt(a)}</p>
          <p class="small"><b>La trampa de Woo-Jin:</b> Al escribir <code>64 · (1/4)ⁿ</code>, en <i>n = 1</i> Woo-Jin calcula <code>(1/4)¹ = 1/4</code>, aplicando un salto de más que reduce el 64 a 16 antes de empezar. Kiran, en cambio, cuenta bien <i>(1/4)⁰ = 1</i>, pero se equivocó al tomar 16 como base.</p>
        </div>
      `;
    } else {
      neutralHtml = `
        <div class="seq-neutral-box">
          <h4><span class="seq-neutral-badge seq-neutral-badge--add">Neutro Aditivo (0)</span>El Salto Cero en la Aritmética</h4>
          <p>Al estar en el primer poste das <strong>0 saltos</strong>. Multiplicar la diferencia por 0 genera el neutro aditivo <strong>0</strong>:</p>
          <p class="seq-equation">f(${currentIdx}) = ${fmt(a)} + ${fmt(c)} · 0 = ${fmt(a)} + <strong>0</strong> = ${fmt(a)}</p>
          <p class="small">El neutro 0 garantiza que el valor inicial <i>a₁</i> quede exactamente intacto en el punto de partida.</p>
        </div>
      `;
    }

    const formulaExpl = start === 1
      ? (isGeo ? `f(n) = ${fmt(a)} · (${fmt(c)})ⁿ⁻¹` : `f(n) = ${fmt(a)} + ${fmt(c)} · (n − 1)`)
      : (isGeo ? `t(n) = ${fmt(a)} · (${fmt(c)})ⁿ` : `t(n) = ${fmt(a)} + ${fmt(c)} · n`);

    $('#seq-count').innerHTML = `
      <h3>Término en n = ${currentIdx} · ${fmt(currentVal, 2)}</h3>
      <p>Fórmula explícita: <strong>${formulaExpl}</strong></p>
      <p>Distancia desde el poste inicial: <strong>${hops} salto${hops === 1 ? '' : 's'}</strong> acumulado${hops === 1 ? '' : 's'}.</p>
      <p class="small muted">Dominio activo: ${start === 1 ? 'ℕ = {1, 2, 3, …} (primer poste en n = 1)' : 'ℕ₀ = {0, 1, 2, …} (primer poste en n = 0)'}</p>
      ${neutralHtml}
    `;

    // Comparativa contextual
    if (preset.value === 'woo') {
      $('#seq-compare').innerHTML = `
        <div class="seq-card">
          <h3>Trampa de Woo-Jin y Kiran · ¿Quién tiene razón?</h3>
          <p>Sucesión pedida: <strong>64, 16, 4, 1</strong> comenzando en <i>n = 1</i> con razón <i>r = 1/4</i>.</p>
          <table class="seq-table">
            <thead>
              <tr>
                <th>Índice n</th>
                <th>Sucesión real</th>
                <th>Fórmula correcta: 64 · (1/4)ⁿ⁻¹</th>
                <th>Woo-Jin: 64 · (1/4)ⁿ</th>
                <th>Kiran: 16 · (1/4)ⁿ⁻¹</th>
              </tr>
            </thead>
            <tbody>
              ${[1, 2, 3, 4].map(i => {
                const real = [64, 16, 4, 1][i - 1];
                const good = 64 * (0.25 ** (i - 1));
                const woo = 64 * (0.25 ** i);
                const kir = 16 * (0.25 ** (i - 1));
                return `
                  <tr>
                    <td><b>n = ${i}</b></td>
                    <td><strong>${real}</strong></td>
                    <td class="seq-good"><strong>${good}</strong> ✓</td>
                    <td class="${woo === real ? 'seq-good' : 'seq-bad'}">${woo} ${woo === real ? '✓' : '✗ (desfasado 1 salto)'}</td>
                    <td class="${kir === real ? 'seq-good' : 'seq-bad'}">${kir} ${kir === real ? '✓' : '✗ (base incorrecta)'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="margin-top:10px"><b>Lección de examen:</b> Al evaluar en <i>n = 1</i>, Woo-Jin da <code>64 · (1/4)¹ = 16</code> (da el segundo término en el primer casillero). Kiran calcula <code>16 · (1/4)⁰ = 16</code> (la potencia da el neutro 1, pero su base era 16 en vez de 64). ¡Ninguno de los dos escribió la fórmula correcta!</p>
        </div>
      `;
    } else if (preset.value === 'sup') {
      $('#seq-compare').innerHTML = `
        <div class="seq-card">
          <h3>Situación de Supriya · El primer poste está en n = 0</h3>
          <p>Supriya define: <i>t(0) = −11</i> y luego suma <i>+5</i> en cada paso: <strong>−11, −6, −1, 4, …</strong></p>
          <p>Como el índice inicial es <strong>0</strong> (dominio ℕ₀), para llegar al término <i>n</i> se dan exactamente <strong>n saltos</strong> (no n − 1):</p>
          <p class="seq-equation">t(n) = −11 + 5 · n &nbsp; para &nbsp; n ≥ 0</p>
          <p class="small muted">Si el dominio fuera n ≥ 1, el primer término evaluado sería t(1) = −11 + 5·1 = −6, perdiéndose el −11 inicial.</p>
        </div>
      `;
    } else {
      $('#seq-compare').innerHTML = '';
    }
  }

  preset.onchange = () => {
    if (preset.value === 'woo') {
      $('#seq-kind').value = 'geo';
      $('#seq-domain').value = '1';
      $('#seq-first').value = 64;
      $('#seq-change').value = 0.25;
      $('#seq-n').value = 1;
    } else if (preset.value === 'sup') {
      $('#seq-kind').value = 'ari';
      $('#seq-domain').value = '0';
      $('#seq-first').value = -11;
      $('#seq-change').value = 5;
      $('#seq-n').value = 1;
    } else {
      $('#seq-kind').value = 'ari';
      $('#seq-domain').value = '1';
      $('#seq-first').value = 3;
      $('#seq-change').value = 2;
      $('#seq-n').value = 1;
    }
    draw();
  };

  root.querySelectorAll('input, select').forEach(el => el.addEventListener('input', draw));
  draw();
}

