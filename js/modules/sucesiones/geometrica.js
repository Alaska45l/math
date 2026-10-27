import { fmt, fractionHtml } from '../../core/math-format.js';

export function initGeometrica(root) {
  root.innerHTML = `
    <h2>Radar geométrico · dominio discreto y límite</h2>
    <p>Observá el comportamiento según la razón <i>r</i>. En regímenes explosivos (<i>r &lt; −1</i>), usá la lupa para ver el rebote sin que los términos finales aplasten el gráfico.</p>
    <div class="seq-controls">
      <label>Régimen
        <select id="geo-preset">
          <option value="1.1|70">r &gt; 1 · interés compuesto de Caden (crecimiento continuo)</option>
          <option value=".25|64">0 &lt; r &lt; 1 · convergencia a 0 (Woo-Jin y Kiran)</option>
          <option value="-.5|16">−1 &lt; r &lt; 0 · rebote amortiguado (límite = 0)</option>
          <option value="-5|8">r &lt; −1 · rebote explosivo d(n) = 8 · (−5)ⁿ⁻¹</option>
          <option value="-11|-5.3">r &lt; −1 · rebote explosivo h(n) = −5,3 · (−11)ⁿ⁻¹</option>
        </select>
      </label>
      <label>Cantidad de términos (Zoom)
        <div class="seq-zoom-group" role="group" aria-label="Cantidad de términos en el gráfico">
          <button type="button" class="seq-zoom-btn" data-terms="3">3 términos (lupa)</button>
          <button type="button" class="seq-zoom-btn" data-terms="4">4 términos</button>
          <button type="button" class="seq-zoom-btn is-active" data-terms="6">6 términos (completo)</button>
        </div>
      </label>
      <label>Unir como curva real <input id="geo-cont" type="checkbox"></label>
    </div>
    <div class="seq-grid">
      <article class="seq-card">
        <svg id="geo-svg" class="seq-chart" viewBox="0 0 620 310" role="img" aria-label="Gráfico de términos discretos"></svg>
        <div id="geo-legend"></div>
      </article>
      <aside class="seq-readout" id="geo-note"></aside>
    </div>
  `;

  const $ = s => root.querySelector(s);
  let termsCount = 6;

  const geoSvg = $('#geo-svg');
  function updateGeoScale() {
    const clientW = geoSvg.clientWidth || geoSvg.getBoundingClientRect().width;
    if (!clientW) return;
    const scale = clientW / 620;
    if (scale <= 0) return;
    const caveatSize = Math.max(14, Math.round((14 / scale) * 10) / 10);
    geoSvg.style.setProperty('--svg-scale-caveat', `${caveatSize}px`);
  }
  updateGeoScale();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateGeoScale).observe(geoSvg);

  function updateZoomButtons() {
    root.querySelectorAll('.seq-zoom-btn').forEach(btn => {
      btn.classList.toggle('is-active', Number(btn.dataset.terms) === termsCount);
    });
  }

  root.querySelectorAll('.seq-zoom-btn').forEach(btn => {
    btn.onclick = () => {
      termsCount = Number(btn.dataset.terms);
      updateZoomButtons();
      draw();
    };
  });

  function draw() {
    const [r, a] = $('#geo-preset').value.split('|').map(Number);
    const cont = $('#geo-cont').checked;
    const vals = Array.from({ length: termsCount }, (_, i) => a * (r ** i));
    const isAlternating = r < 0;
    const absMax = Math.max(...vals.map(Math.abs), 1);

    const svg = $('#geo-svg');
    const W = 620, H = 310;
    const leftPad = 60, rightPad = 570;
    const X = n => leftPad + (n - 1) * ((rightPad - leftPad) / Math.max(1, termsCount - 1));

    // Si alterna signos, colocamos el eje cero en el medio (y = 155). Si son todos del mismo signo, damos más rango vertical.
    const zeroY = isAlternating ? 155 : (a >= 0 ? 260 : 50);
    const scaleY = isAlternating ? 125 : 205;
    const Y = v => isAlternating ? zeroY - (v / absMax) * scaleY : zeroY - (v / absMax) * scaleY;

    let elements = [];

    // Ejes cartesianos
    elements.push(`<line x1="40" y1="${zeroY}" x2="600" y2="${zeroY}" stroke="currentColor" stroke-width="1.5"/>`);
    elements.push(`<line x1="40" y1="20" x2="40" y2="285" stroke="currentColor" stroke-width="1.5"/>`);
    elements.push(`<text x="592" y="${zeroY - 8}" class="seq-index" font-weight="bold">n</text>`);
    elements.push(`<text x="45" y="32" class="seq-index" text-anchor="start">y</text>`);

    // Asíntota y = 0 cuando converge
    if (Math.abs(r) < 1) {
      elements.push(`<line x1="40" y1="${zeroY}" x2="600" y2="${zeroY}" stroke="var(--amber-line)" stroke-dasharray="6 4" stroke-width="2"/>`);
    }

    // Guía visual quebrada punteada para el zig-zag cuando r < 0
    if (isAlternating) {
      const zigzagPts = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${X(i + 1)} ${Y(v)}`).join(' ');
      elements.push(`<path d="${zigzagPts}" class="seq-bounce-line"/>`);
    }

    // Curva continua opcional (solo válida para r > 0)
    if (cont && r > 0) {
      const stepCount = 80;
      const pts = Array.from({ length: stepCount + 1 }, (_, i) => {
        const n = 1 + i * (termsCount - 1) / stepCount;
        const val = a * (r ** (n - 1));
        return `${i === 0 ? 'M' : 'L'}${X(n)} ${Y(val)}`;
      }).join(' ');
      elements.push(`<path d="${pts}" fill="none" stroke="var(--green-line)" stroke-width="2.5"/>`);
    }

    // Términos discretos (postes y puntos)
    vals.forEach((v, i) => {
      const x = X(i + 1);
      const y = Y(v);
      const isNeg = v < 0;
      const labelY = isAlternating ? (isNeg ? y + 16 : y - 10) : (y < 40 ? y + 18 : y - 10);

      elements.push(`<line x1="${x}" y1="${zeroY}" x2="${x}" y2="${y}" stroke="var(--blue-line)" stroke-dasharray="2 2" stroke-width="1.2"/>`);
      elements.push(`
        <g class="seq-point" data-n="${i + 1}" tabindex="0" role="button" aria-label="Término n=${i+1}, valor ${fmt(v, 2)}">
          <circle class="seq-post" cx="${x}" cy="${y}" r="7"/>
          <text class="seq-index" x="${x}" y="298">${i + 1}</text>
          <text class="seq-chart-val" x="${x}" y="${labelY}">${fmt(v, 2)}</text>
        </g>
      `);
    });

    svg.innerHTML = elements.join('');

    // Leyenda inferior
    $('#geo-legend').innerHTML = isAlternating
      ? `<p class="small muted" style="margin-top:8px">Línea punteada violeta: guía visual del rebote secuencial P₁ → P₂ → P₃ (no es una función continua; la sucesión solo existe en los puntos enteros).</p>`
      : (r === 0.25 ? `<p class="small muted" style="margin-top:8px">Línea de trazos ámbar en y = 0: asíntota horizontal (límite al infinito).</p>` : '');

    // Interacción al hacer clic en los puntos
    svg.querySelectorAll('[data-n]').forEach(p => {
      const selectTerm = () => {
        const n = Number(p.dataset.n);
        const val = vals[n - 1];
        const hops = n - 1;
        const rDisplay = r < 0 ? `(${fmt(r)})` : fmt(r);
        $('#geo-note').innerHTML = `
          <h3>Término n = ${n}</h3>
          <p class="seq-equation">f(${n}) = ${fmt(a)} · ${rDisplay}<sup>${hops}</sup> = <strong>${fmt(val, 2)}</strong></p>
          <p>${hops === 0 ? '<strong>Salto Cero:</strong> el exponente es 0, la razón queda elevada a la 0 (= 1, elemento neutro), dejando intacto al primer término.' : `Se aplicaron <strong>${hops} salto${hops > 1 ? 's' : ''} multiplicativo${hops > 1 ? 's' : ''}</strong> por ${fmt(r)} desde el término inicial.`}</p>
        `;
      };
      p.onclick = selectTerm;
      p.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTerm(); } };
    });

    // Explicación pedagógica según régimen
    let note = '';
    if (r > 1) {
      note = `<strong>Crecimiento exponencial (r = ${fmt(r)}):</strong> Cada paso multiplica el valor acumulado. En el interés de Caden: 70 + 10% de 70 = 70 · (1 + 0,10) = 70 · 1,1.`;
    } else if (r > 0) {
      note = `<strong>Convergencia (0 &lt; r &lt; 1):</strong> Los términos se acercan cada vez más a 0. Aunque ningún término finito da exactamente cero, decimos que <span class="math">lim<sub>n→∞</sub> f(n) = 0</span>. Razón: ${fractionHtml('1', '4').outerHTML}`;
    } else if (Math.abs(r) < 1) {
      note = `<strong>Rebote amortiguado (−1 &lt; r &lt; 0):</strong> Al multiplicar por un negativo, los signos alternan (+, −, +, −) y la distancia a cero disminuye a la mitad en cada paso. Límite: <span class="math">lim<sub>n→∞</sub> f(n) = 0</span>.`;
    } else {
      note = `<strong>Rebote explosivo (r &lt; −1):</strong> Al elevar una base negativa, el signo alterna en cada paso y el valor absoluto crece vertiginosamente. ${termsCount < 6 ? `<em>Estás viendo los primeros ${termsCount} términos con escala optimizada. Si querés ver la explosión a ±${fmt(Math.abs(a * (r ** 5)), 0)}, cambiá a 6 términos.</em>` : `<em>A escala completa, los primeros términos quedan casi pegados al eje 0 porque el término 6 llega a ${fmt(vals[termsCount - 1], 1)}. Usá la lupa para ver el rebote inicial.</em>`}`;
    }

    $('#geo-note').innerHTML = `
      <h3>Régimen r = ${fmt(r)}</h3>
      <p>${note}</p>
      ${cont && isAlternating ? `
        <div class="seq-alert">
          <strong>No existe una curva exponencial real continua</strong> que extienda esta regla en ℝ: entre n = 1 y n = 2 (por ejemplo en n = 1,5), el exponente sería 0,5 = 1/2, lo que exigiría calcular la raíz cuadrada de una base negativa: √(${fmt(r)}) ∉ ℝ. La sucesión geométrica con base negativa vive pura y exclusivamente en los números naturales discretos.
        </div>
      ` : cont ? `
        <p class="small muted">La curva continua verde sirve de extensión porque la base es positiva (r &gt; 0). Aun así, la sucesión solo toma los puntos discretos enteros.</p>
      ` : ''}
    `;
  }

  $('#geo-preset').onchange = () => {
    const [r] = $('#geo-preset').value.split('|').map(Number);
    // Para r < -1, activar por defecto la vista de 4 términos para evitar el aplastamiento de escala
    if (r < -1) {
      termsCount = 4;
    } else {
      termsCount = 6;
    }
    updateZoomButtons();
    draw();
  };

  $('#geo-cont').onchange = draw;

  // Si arranca en r < -1, inicializar zoom adecuado
  const [initialR] = $('#geo-preset').value.split('|').map(Number);
  if (initialR < -1) termsCount = 4;
  updateZoomButtons();
  draw();
}

