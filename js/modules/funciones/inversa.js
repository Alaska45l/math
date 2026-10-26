/**
 * inversa.js — Submódulo 4: La Máquina Inversa y el Espejo y = x.
 * Tubería reversible paso a paso con propiedad uniforme, detección de falla
 * de inyectividad en m = 0, reflexión cartesiana (a, f(a)) ↔ (f(a), a) y traductor verbal.
 */
import { h, s, mount, byId, on, setPressed } from '../../core/dom.js';
import { fmt, frac, MINUS } from '../../core/math-format.js';
import { createPlane } from '../../core/plot.js';

const VERBAL_CONTEXTS = [
  {
    name: 'Costo de viaje: C(d) en dólares según distancia d en km',
    inVar: 'd',
    outVar: 'C',
    inUnit: 'km',
    outUnit: '$',
    defM: 2.5,
    defB: 5,
    defA: 4,
  },
  {
    name: 'Personas en la playa: P(T) en cientos según temperatura T en °C',
    inVar: 'T',
    outVar: 'P',
    inUnit: '°C',
    outUnit: 'cientos',
    defM: 0.5,
    defB: -5,
    defA: 20,
  },
  {
    name: 'Relación matemática abstracta: y = f(x)',
    inVar: 'x',
    outVar: 'y',
    inUnit: 'u',
    outUnit: 'u',
    defM: 2,
    defB: -1,
    defA: 1.5,
  },
];

export function initInversa(container) {
  const state = {
    m: 2,
    b: -1,
    a: 1.5,
    invertedView: false,
    ctxIdx: 2,
  };

  mount(container,
    h('div', { class: 'panel' },
      h('div', { class: 'row' },
        h('label', { for: 'inv-ctx', class: 'label-sm' }, 'Contexto verbal'),
        h('select', { id: 'inv-ctx' },
          VERBAL_CONTEXTS.map((c, i) => h('option', { value: i }, c.name)),
        ),
        h('button', { type: 'button', id: 'inv-zero-m', class: 'chip' }, 'Probar trampa m = 0 (Falla inyectividad)'),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'inv-m', class: 'field__label' }, 'Pendiente m'),
        h('input', { type: 'range', id: 'inv-m', min: '-3', max: '3', step: '0.5', value: state.m }),
        h('output', { id: 'inv-m-val', for: 'inv-m', class: 'field__out' }),

        h('label', { for: 'inv-b', class: 'field__label' }, 'Ordenada b'),
        h('input', { type: 'range', id: 'inv-b', min: '-4', max: '4', step: '0.5', value: state.b }),
        h('output', { id: 'inv-b-val', for: 'inv-b', class: 'field__out' }),

        h('label', { for: 'inv-a', class: 'field__label' }, 'Entrada a'),
        h('input', { type: 'range', id: 'inv-a', min: '-3', max: '3', step: '0.5', value: state.a }),
        h('output', { id: 'inv-a-val', for: 'inv-a', class: 'field__out' }),
      ),
      h('div', { class: 'row' },
        h('button', { type: 'button', id: 'inv-toggle', class: 'toggle', 'aria-pressed': 'false' },
          'Invertir flujo de la tubería (f⁻¹)',
        ),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-side' },
        h('div', { class: 'fn-readout' },
          h('div', { class: 'fn-readout__title' }, '1. Tubería de Operaciones (Propiedad Uniforme)'),
          h('div', { id: 'inv-pipe' }),
          h('div', { id: 'inv-algebra', class: 'fn-formula-box' }),
        ),
        h('div', { id: 'inv-verbal', class: 'notice notice--blue', 'aria-live': 'polite' }),
      ),
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'inv-svg', viewBox: '0 0 520 420', role: 'img', 'aria-label': 'Plano cartesiano con la recta f, su inversa y el espejo y = x' }),
      ),
    ),
  );

  const rngM = byId('inv-m', container);
  const rngB = byId('inv-b', container);
  const rngA = byId('inv-a', container);
  const valM = byId('inv-m-val', container);
  const valB = byId('inv-b-val', container);
  const valA = byId('inv-a-val', container);
  const btnToggle = byId('inv-toggle', container);
  const btnZeroM = byId('inv-zero-m', container);
  const selCtx = byId('inv-ctx', container);
  const pipeEl = byId('inv-pipe', container);
  const algEl = byId('inv-algebra', container);
  const verbalEl = byId('inv-verbal', container);
  const svg = byId('inv-svg', container);

  const plane = createPlane(svg, {
    width: 520, height: 420, xMin: -5, xMax: 5, yMin: -5, yMax: 5, xStep: 1, yStep: 1,
  });

  function render() {
    const { m, b, a, invertedView } = state;
    const fa = m * a + b;
    const ctx = VERBAL_CONTEXTS[state.ctxIdx];

    valM.textContent = fmt(m);
    valB.textContent = fmt(b);
    valA.textContent = fmt(a);
    setPressed(btnToggle, invertedView);

    const bSign = b >= 0 ? `+ ${fmt(b)}` : `${MINUS} ${fmt(Math.abs(b))}`;
    const bOpp = b >= 0 ? `${MINUS} ${fmt(b)}` : `+ ${fmt(Math.abs(b))}`;

    // 1. Tubería de operaciones
    if (Math.abs(m) < 1e-4) {
      pipeEl.innerHTML = `
        <div class="notice notice--err">
          <strong>✗ ¡Falla de Inyectividad (m = 0)!</strong><br>
          La recta horizontal constante <em>f(x) = ${fmt(b)}</em> asigna la misma salida a infinitas entradas distintas.
          Al reflejarla sobre el espejo <em>y = x</em>, se convierte en la <strong>recta vertical x = ${fmt(b)}</strong>,
          que viola la unicidad y <strong>NO es función</strong> (además de exigir dividir por m = 0 en el despeje algebraico).
        </div>
      `;
      mount(algEl,
        h('strong', null, 'Sin función inversa: '),
        h('span', null, 'f no es inyectiva (por lo tanto no es biyectiva).'),
      );
    } else if (!invertedView) {
      pipeEl.innerHTML = `
        <div class="fn-pipeline">
          <span class="fn-pipe-box fn-pipe-box--io">Entrada x = ${fmt(a)}</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--op">Multiplicar por ${fmt(m)}</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--op">${b >= 0 ? 'Sumar' : 'Restar'} ${fmt(Math.abs(b))}</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--io">Salida y = ${fmt(fa)}</span>
        </div>
      `;

      const formulaInv = frac(`x ${bOpp}`, fmt(m));
      mount(algEl,
        h('strong', null, 'Directa: '),
        h('span', null, `f(x) = ${fmt(m)}·x ${bSign}`),
        h('span', { class: 'op' }, '|'),
        h('strong', null, 'Inversa: '),
        h('span', null, 'f⁻¹(x) = '),
        formulaInv,
      );
    } else {
      pipeEl.innerHTML = `
        <div class="fn-pipeline">
          <span class="fn-pipe-box fn-pipe-box--io">Entrada y = ${fmt(fa)}</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--inv">Prop. uniforme: ${bOpp} a ambos miembros</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--inv">Dividir por ${fmt(m)} (multiplicar por 1/${fmt(m)})</span>
          <span class="fn-pipe-arrow">→</span>
          <span class="fn-pipe-box fn-pipe-box--io">Salida x = ${fmt(a)}</span>
        </div>
      `;

      const formulaInv = frac(`y ${bOpp}`, fmt(m));
      mount(algEl,
        h('strong', null, 'Despeje en orden inverso: '),
        h('span', null, `y = ${fmt(m)}·x ${bSign}`),
        h('span', { class: 'op' }, '⟺'),
        h('span', null, `y ${bOpp} = ${fmt(m)}·x`),
        h('span', { class: 'op' }, '⟺'),
        h('span', null, 'x = '),
        formulaInv,
      );
    }

    // Traductor verbal
    if (Math.abs(m) < 1e-4) {
      verbalEl.innerHTML = `
        <strong>Enunciado verbal:</strong>
        Para cualquier valor de entrada, el resultado es siempre ${fmt(b)} ${ctx.outUnit}.
        No se puede invertir porque no se puede saber qué entrada produjo ese valor de salida.
      `;
    } else {
      verbalEl.innerHTML = `
        <strong>Traductor de Unidades en Contexto:</strong><br>
        • <strong>Directa:</strong> Si <code>${ctx.outVar}(${fmt(a)}) = ${fmt(fa)}</code>, significa que para una entrada de <strong>${fmt(a)} ${ctx.inUnit}</strong>, la salida es <strong>${fmt(fa)} ${ctx.outUnit}</strong>.<br>
        • <strong>Inversa:</strong> Entonces <code>${ctx.outVar}⁻¹(${fmt(fa)}) = ${fmt(a)}</code> invierte los roles: teniendo <strong>${fmt(fa)} ${ctx.outUnit}</strong> (nueva entrada), le corresponden exactamente <strong>${fmt(a)} ${ctx.inUnit}</strong> (nueva salida).
      `;
    }

    // Gráfico cartesiano
    plane.clear('under', 'curve', 'marks', 'labels');

    // Espejo y = x
    const mirrorPath = plane.linePathMB(1, 0);
    plane.layers.under.append(s('path', { d: mirrorPath, class: 'fn-mirror' }));
    plane.layers.labels.append(
      s('text', { x: plane.sx(3.6), y: plane.sy(4.2), class: 'plot-label', 'text-anchor': 'middle' }, 'Espejo y = x'),
    );

    // Recta f(x) = mx + b
    const fPath = plane.linePathMB(m, b);
    plane.layers.curve.append(
      s('path', { d: fPath, fill: 'none', stroke: 'var(--blue-line)', 'stroke-width': 3 }),
    );

    // Recta inversa f⁻¹(x)
    if (Math.abs(m) < 1e-4) {
      // Recta vertical x = b (violación de unicidad)
      plane.layers.curve.append(
        s('line', {
          x1: plane.sx(b), y1: plane.sy(-5), x2: plane.sx(b), y2: plane.sy(5),
          stroke: 'var(--red-line)', 'stroke-width': 3, 'stroke-dasharray': '5 4',
        }),
      );
      plane.layers.labels.append(
        s('text', { x: plane.sx(b) + 8, y: plane.sy(-4), class: 'plot-label', fill: 'var(--red)', 'text-anchor': 'start' }, 'Recta vertical x = b (NO es función)'),
      );
    } else {
      const invM = 1 / m;
      const invB = -b / m;
      const invPath = plane.linePathMB(invM, invB);
      plane.layers.curve.append(
        s('path', { d: invPath, fill: 'none', stroke: 'var(--green-line)', 'stroke-width': 3 }),
      );
    }

    // Segmento perpendicular entre (a, f(a)) y (f(a), a)
    plane.layers.marks.append(
      s('line', {
        x1: plane.sx(a), y1: plane.sy(fa), x2: plane.sx(fa), y2: plane.sy(a),
        class: 'fn-normal',
      }),
      s('circle', { cx: plane.sx(a), cy: plane.sy(fa), r: 6, fill: 'var(--blue-line)' }),
      s('circle', {
        cx: plane.sx(fa), cy: plane.sy(a), r: 6,
        fill: Math.abs(m) < 1e-4 ? 'var(--red-line)' : 'var(--green-line)',
      }),
    );

    plane.layers.labels.append(
      s('text', { x: plane.sx(a) + 8, y: plane.sy(fa) - 8, class: 'plot-label', 'text-anchor': 'start' }, `(a; f(a)) = (${fmt(a)}; ${fmt(fa)})`),
      s('text', { x: plane.sx(fa) + 8, y: plane.sy(a) + 16, class: 'plot-label', 'text-anchor': 'start' }, `(f(a); a) = (${fmt(fa)}; ${fmt(a)})`),
    );
  }

  on(rngM, 'input', (e) => {
    state.m = Number(e.target.value);
    render();
  });
  on(rngB, 'input', (e) => {
    state.b = Number(e.target.value);
    render();
  });
  on(rngA, 'input', (e) => {
    state.a = Number(e.target.value);
    render();
  });

  on(btnToggle, 'click', () => {
    state.invertedView = !state.invertedView;
    render();
  });

  on(btnZeroM, 'click', () => {
    state.m = 0;
    rngM.value = '0';
    render();
  });

  on(selCtx, 'change', (e) => {
    state.ctxIdx = Number(e.target.value);
    const ctx = VERBAL_CONTEXTS[state.ctxIdx];
    state.m = ctx.defM;
    state.b = ctx.defB;
    state.a = ctx.defA;
    rngM.value = String(state.m);
    rngB.value = String(state.b);
    rngA.value = String(state.a);
    render();
  });

  render();
}
