/**
 * secante.js — Submódulo 3: El Puente Secante y Tasa de Cambio Promedio (TCP).
 * Conecta la pendiente lineal, el análisis dimensional (unidades físicas reales)
 * y el cálculo riguroso con fracciones horizontales de dos pisos (.fr).
 */
import { h, s, mount, byId, on } from '../../core/dom.js';
import { fmt, paren, frac, MINUS } from '../../core/math-format.js';
import { createPlane } from '../../core/plot.js';

const CONTEXTS = [
  {
    id: 'playa',
    title: 'A. Temperatura en la playa: T(t) en °C vs. tiempo t en horas (h)',
    xLabel: 't (h)',
    yLabel: 'T (°C)',
    xUnit: 'h',
    yUnit: '°C',
    rateUnit: '°C/h',
    fn: (t) => -0.5 * (t - 4) * (t - 4) + 26,
    xMin: 0,
    xMax: 8,
    yMin: 14,
    yMax: 28,
    zeroPair: [2, 6],
    defaultPair: [1, 4],
  },
  {
    id: 'basquet',
    title: 'B. Tiro de básquetbol: Altura h(t) en m vs. tiempo t en segundos (s)',
    xLabel: 't (s)',
    yLabel: 'h (m)',
    xUnit: 's',
    yUnit: 'm',
    rateUnit: 'm/s',
    fn: (t) => -1.2 * (t - 3) * (t - 3) + 12,
    xMin: 0,
    xMax: 6,
    yMin: 0,
    yMax: 14,
    zeroPair: [1, 5],
    defaultPair: [1, 3],
  },
  {
    id: 'tanque',
    title: 'C. Vaciado de reserva: Volumen V(t) en L vs. tiempo t en minutos (min)',
    xLabel: 't (min)',
    yLabel: 'V (L)',
    xUnit: 'min',
    yUnit: 'L',
    rateUnit: 'L/min',
    fn: (t) => 0.8 * (t - 3.5) * (t - 3.5) + 4,
    xMin: 0,
    xMax: 7,
    yMin: 0,
    yMax: 16,
    zeroPair: [1.5, 5.5],
    defaultPair: [0.5, 3.5],
  },
];

export function initSecante(container) {
  const state = {
    ctxIdx: 0,
    x1: 1,
    x2: 4,
  };

  mount(container,
    h('div', { class: 'panel' },
      h('div', { class: 'row' },
        h('label', { for: 'sec-ctx', class: 'label-sm' }, 'Contexto físico'),
        h('select', { id: 'sec-ctx' },
          CONTEXTS.map((c, i) => h('option', { value: i }, c.title)),
        ),
        h('button', { type: 'button', id: 'sec-zero-btn', class: 'chip' }, 'Preset: Caso Tasa Cero (Δy = 0)'),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'sec-x1', class: 'field__label' }, 'Instante x₁'),
        h('input', { type: 'range', id: 'sec-x1', min: '0', max: '8', step: '0.5', value: state.x1 }),
        h('output', { id: 'sec-x1-val', for: 'sec-x1', class: 'field__out' }),

        h('label', { for: 'sec-x2', class: 'field__label' }, 'Instante x₂'),
        h('input', { type: 'range', id: 'sec-x2', min: '0', max: '8', step: '0.5', value: state.x2 }),
        h('output', { id: 'sec-x2-val', for: 'sec-x2', class: 'field__out' }),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'sec-svg', viewBox: '0 0 600 380', role: 'img', 'aria-label': 'Curva con recta secante y triángulo de incrementos' }),
      ),
      h('div', { class: 'fn-side' },
        h('div', { class: 'fn-formula-box', id: 'sec-math', 'aria-live': 'polite' }),
        h('div', { id: 'sec-verdict', class: 'notice', 'aria-live': 'polite' }),
      ),
    ),
  );

  const selCtx = byId('sec-ctx', container);
  const rngX1 = byId('sec-x1', container);
  const rngX2 = byId('sec-x2', container);
  const valX1 = byId('sec-x1-val', container);
  const valX2 = byId('sec-x2-val', container);
  const btnZero = byId('sec-zero-btn', container);
  const svg = byId('sec-svg', container);
  const mathBox = byId('sec-math', container);
  const verdictEl = byId('sec-verdict', container);

  let plane = null;

  function syncPlane() {
    const c = CONTEXTS[state.ctxIdx];
    rngX1.min = String(c.xMin);
    rngX1.max = String(c.xMax);
    rngX2.min = String(c.xMin);
    rngX2.max = String(c.xMax);
    rngX1.value = String(state.x1);
    rngX2.value = String(state.x2);

    plane = createPlane(svg, {
      width: 600, height: 380, xMin: c.xMin, xMax: c.xMax, yMin: c.yMin, yMax: c.yMax,
      xLabel: c.xLabel, yLabel: c.yLabel,
    });
  }

  function render() {
    const c = CONTEXTS[state.ctxIdx];
    const x1 = state.x1;
    const x2 = state.x2;
    const y1 = c.fn(x1);
    const y2 = c.fn(x2);
    const dx = x2 - x1;
    const dy = y2 - y1;

    valX1.textContent = `${fmt(x1)} ${c.xUnit}`;
    valX2.textContent = `${fmt(x2)} ${c.xUnit}`;

    plane.clear('under', 'curve', 'marks', 'labels');

    // Trazo de la curva
    const curvePath = plane.fnPath(c.fn, c.xMin, c.xMax, { samples: 100 });
    plane.layers.curve.append(s('path', { d: curvePath, class: 'plot-curve' }));

    if (Math.abs(dx) > 1e-4) {
      const m = dy / dx;
      const secFn = (x) => y1 + m * (x - x1);
      const secPath = plane.linePath([[c.xMin, secFn(c.xMin)], [c.xMax, secFn(c.xMax)]]);
      plane.layers.under.append(s('path', { d: secPath, class: 'fn-secant' }));

      // Triángulo rectángulo de incrementos: cateto horizontal (Δx) y vertical (Δy)
      plane.layers.marks.append(
        s('line', {
          x1: plane.sx(x1), y1: plane.sy(y1), x2: plane.sx(x2), y2: plane.sy(y1),
          class: 'fn-triangle-dx',
        }),
        s('line', {
          x1: plane.sx(x2), y1: plane.sy(y1), x2: plane.sx(x2), y2: plane.sy(y2),
          class: 'fn-triangle-dy',
        }),
      );

      const dXSign = dx < 0 ? `${MINUS} ` : '';
      const dYSign = dy < 0 ? `${MINUS} ` : '';

      plane.layers.labels.append(
        s('text', {
          x: plane.sx((x1 + x2) / 2), y: plane.sy(y1) + (y1 < (c.yMin + c.yMax) / 2 ? -10 : 20),
          class: 'plot-label', 'text-anchor': 'middle', fill: 'var(--green)',
        }, `Δx = ${dXSign}${fmt(Math.abs(dx))} ${c.xUnit}`),
        s('text', {
          x: plane.sx(x2) + (x2 < (c.xMin + c.xMax) / 2 ? 8 : -8), y: plane.sy((y1 + y2) / 2),
          class: 'plot-label', 'text-anchor': x2 < (c.xMin + c.xMax) / 2 ? 'start' : 'end', fill: 'var(--amber)',
        }, `Δy = ${dYSign}${fmt(Math.abs(dy))} ${c.yUnit}`),
      );
    }

    // Puntos P1 y P2
    plane.layers.marks.append(
      s('circle', { cx: plane.sx(x1), cy: plane.sy(y1), r: 6, fill: 'var(--blue-line)' }),
      s('circle', { cx: plane.sx(x2), cy: plane.sy(y2), r: 6, fill: 'var(--amber-line)' }),
    );
    plane.layers.labels.append(
      s('text', { x: plane.sx(x1), y: plane.sy(y1) - 10, class: 'plot-label', 'text-anchor': 'middle' }, `P₁(${fmt(x1)}; ${fmt(y1)})`),
      s('text', { x: plane.sx(x2), y: plane.sy(y2) - 10, class: 'plot-label', 'text-anchor': 'middle' }, `P₂(${fmt(x2)}; ${fmt(y2)})`),
    );

    // Panel de cálculo con fracción horizontal .fr
    if (Math.abs(dx) < 1e-4) {
      mount(mathBox,
        h('strong', null, 'Elegí dos instantes distintos (x₁ ≠ x₂)'),
        ' para que el denominador Δx no sea 0.',
      );
      verdictEl.className = 'notice notice--err';
      verdictEl.innerHTML = `<strong>Indefinición:</strong> Con x₁ = x₂ el incremento es <strong>Δx = 0 ${c.xUnit}</strong>. La división por cero está indefinida (no existe pendiente de una secante sin dos puntos separados).`;
      return;
    }

    const tcp = dy / dx;

    // Desarrollo en 4 pasos con fracciones horizontales estrictas
    const f1 = frac('f(x₂) − f(x₁)', 'x₂ − x₁');
    const f2 = frac(
      [fmt(y2), ' − ', paren(y1), h('span', { class: 'unit' }, ` ${c.yUnit}`)],
      [fmt(x2), ' − ', paren(x1), h('span', { class: 'unit' }, ` ${c.xUnit}`)],
    );
    const f3 = frac(
      [fmt(dy), h('span', { class: 'unit' }, ` ${c.yUnit}`)],
      [fmt(dx), h('span', { class: 'unit' }, ` ${c.xUnit}`)],
    );
    const fUnit = frac(c.yUnit, c.xUnit, { className: 'fr--sm' });

    mount(mathBox,
      h('span', { class: 'math' }, 'TCP'), ' = ',
      f1, ' = ', f2, ' = ', f3, ' = ',
      h('strong', null, fmt(tcp)), ' ', fUnit,
    );

    if (Math.abs(dy) < 1e-4) {
      verdictEl.className = 'notice notice--warn';
      verdictEl.innerHTML = `
        <strong>Tasa de Cambio Promedio NULA (m = 0):</strong>
        Aunque la magnitud subió y bajó en el medio, como <em>f(${fmt(x1)}) = f(${fmt(x2)}) = ${fmt(y1)} ${c.yUnit}</em>,
        el cambio neto total entre ambos instantes es <strong>Δy = 0 ${c.yUnit}</strong>.
        Por eso la recta secante es perfectamente horizontal (pendiente 0).
      `;
    } else {
      verdictEl.className = tcp > 0 ? 'notice notice--ok' : 'notice notice--blue';
      const dir = tcp > 0 ? 'creció' : 'disminuyó';
      verdictEl.innerHTML = `
        <strong>Interpretación dimensional:</strong> Entre ${fmt(x1)} ${c.xUnit} y ${fmt(x2)} ${c.xUnit}, la magnitud ${dir} a un ritmo promedio equivalente a
        <strong>${fmt(tcp)} ${c.rateUnit}</strong> (la velocidad constante que conectaría ambos puntos en línea recta).
      `;
    }
  }

  on(selCtx, 'change', (e) => {
    state.ctxIdx = Number(e.target.value);
    const c = CONTEXTS[state.ctxIdx];
    state.x1 = c.defaultPair[0];
    state.x2 = c.defaultPair[1];
    syncPlane();
    render();
  });

  on(rngX1, 'input', (e) => {
    state.x1 = Number(e.target.value);
    render();
  });
  on(rngX2, 'input', (e) => {
    state.x2 = Number(e.target.value);
    render();
  });

  on(btnZero, 'click', () => {
    const c = CONTEXTS[state.ctxIdx];
    state.x1 = c.zeroPair[0];
    state.x2 = c.zeroPair[1];
    rngX1.value = String(state.x1);
    rngX2.value = String(state.x2);
    render();
  });

  syncPlane();
  render();
}
