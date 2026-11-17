/**
 * secante.js — Submódulo 3: El Puente Secante y la Tasa de Cambio Promedio.
 * Los puntos P₁ y P₂ se arrastran directamente sobre el gráfico (o con teclado / sliders).
 * Los manejadores SVG viven en una capa persistente para conservar foco durante keydown.
 */
import { h, s, mount, byId, on } from '../../core/dom.js';
import { fmt, paren, frac } from '../../core/math-format.js';
import { createPlane, bindSvgDrag } from '../../core/plot.js';
import { createPredictBox } from '../../core/board-kit.js';
import { computeSecantTcp } from './logic.js';
import { CHECKS_DATA, createCheckBlock } from './checks.js';
import { recordFnPrediction } from './learning-adapter.js';

const CONTEXTS = [
  {
    title: 'A. Temperatura en la playa a lo largo de la mañana',
    rule: 'T(t) = −0,5·(t − 4)² + 26',
    xLabel: 't (h)', yLabel: 'T (°C)', xUnit: 'h', yUnit: '°C',
    qty: 'la temperatura', up: 'subió', down: 'bajó', rateText: 'grados por hora',
    fn: (t) => -0.5 * (t - 4) ** 2 + 26,
    xMin: 0, xMax: 8, yMin: 14, yMax: 28, yStep: 2,
    zeroPair: [2, 6], defaultPair: [1, 4],
  },
  {
    title: 'B. Altura de un tiro de básquet',
    rule: 'h(t) = −1,2·(t − 3)² + 12',
    xLabel: 't (s)', yLabel: 'h (m)', xUnit: 's', yUnit: 'm',
    qty: 'la altura de la pelota', up: 'subió', down: 'bajó', rateText: 'metros por segundo',
    fn: (t) => -1.2 * (t - 3) ** 2 + 12,
    xMin: 0, xMax: 6, yMin: 0, yMax: 14, yStep: 2,
    zeroPair: [1, 5], defaultPair: [1, 3],
  },
  {
    title: 'C. Tanque de reserva: se vacía y se vuelve a llenar',
    rule: 'V(t) = 0,8·(t − 3,5)² + 4',
    xLabel: 't (min)', yLabel: 'V (L)', xUnit: 'min', yUnit: 'L',
    qty: 'el volumen de agua', up: 'aumentó', down: 'disminuyó', rateText: 'litros por minuto',
    fn: (t) => 0.8 * (t - 3.5) ** 2 + 4,
    xMin: 0, xMax: 7, yMin: 0, yMax: 16, yStep: 2,
    zeroPair: [1.5, 5.5], defaultPair: [0.5, 3.5],
  },
];

const round1 = (v) => Math.round(v * 10) / 10;
const unitSpan = (u) => h('span', { class: 'unit' }, ` ${u}`);

export function initSecante(container) {
  const state = { ctxIdx: 0, x1: 1, x2: 4 };
  let dragTarget = null;

  mount(container,
    h('div', { id: 'sec-poe', class: 'fn-poe-host' }),
    h('div', { class: 'panel' },
      h('div', { class: 'row' },
        h('label', { for: 'sec-ctx', class: 'label-sm' }, 'Contexto'),
        h('select', { id: 'sec-ctx' }, CONTEXTS.map((c, i) => h('option', { value: i }, c.title))),
        h('button', { type: 'button', id: 'sec-zero-btn', class: 'chip' }, 'Probar el caso tasa cero (Δy = 0)'),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'sec-x1', class: 'field__label' }, 'Instante x₁'),
        h('input', { type: 'range', id: 'sec-x1', step: '0.1' }),
        h('output', { id: 'sec-x1-val', for: 'sec-x1', class: 'field__out' }),
        h('label', { for: 'sec-x2', class: 'field__label' }, 'Instante x₂'),
        h('input', { type: 'range', id: 'sec-x2', step: '0.1' }),
        h('output', { id: 'sec-x2-val', for: 'sec-x2', class: 'field__out' }),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'sec-svg', class: 'plot', viewBox: '0 0 600 380', role: 'img', 'aria-label': 'Curva con recta secante y triángulo de incrementos; arrastrá P₁ o P₂' }),
        h('p', { class: 'fn-hint' }, 'Tip: agarrá P₁ o P₂ y arrastralos sobre el gráfico, o enfocalos y usá las flechas del teclado.'),
      ),
      h('div', { class: 'fn-side' },
        h('p', { id: 'sec-rule', class: 'muted small' }),
        h('div', { class: 'fn-formula-box', id: 'sec-math', 'aria-live': 'polite' }),
        h('div', { id: 'sec-verdict', class: 'notice', 'aria-live': 'polite' }),
      ),
    ),
    h('section', { class: 'fn-checks-section', 'aria-label': 'Chequeos de Tasa de Cambio Promedio' },
      h('h3', null, 'Chequeos: Tasa de Cambio Promedio (TCP)'),
      h('div', { id: 'sec-checks' }),
    ),
  );

  const el = {
    poe: byId('sec-poe', container),
    ctx: byId('sec-ctx', container), r1: byId('sec-x1', container), r2: byId('sec-x2', container),
    v1: byId('sec-x1-val', container), v2: byId('sec-x2-val', container), zero: byId('sec-zero-btn', container),
    svg: byId('sec-svg', container), math: byId('sec-math', container), verdict: byId('sec-verdict', container),
    rule: byId('sec-rule', container),
    checks: byId('sec-checks', container),
  };

  // Manejadores persistentes (nunca se destruyen al re-renderizar o cambiar contexto)
  const handleP1 = s('circle', {
    r: 20,
    class: 'fn-handle',
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Punto P₁ de la recta secante',
    'data-handle': 'p1',
  });
  const handleP2 = s('circle', {
    r: 20,
    class: 'fn-handle',
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Punto P₂ de la recta secante',
    'data-handle': 'p2',
  });
  const handlesLayer = s('g', { class: 'plot-layer plot-layer--handles' }, handleP1, handleP2);

  let plane = null;
  function buildPlane() {
    const c = CONTEXTS[state.ctxIdx];
    [el.r1, el.r2].forEach((r) => { r.min = String(c.xMin); r.max = String(c.xMax); });
    plane = createPlane(el.svg, {
      width: 600, height: 380, xMin: c.xMin, xMax: c.xMax, yMin: c.yMin, yMax: c.yMax,
      yStep: c.yStep, xLabel: c.xLabel, yLabel: c.yLabel,
    });
    plane.layers.curve.append(s('path', { d: plane.fnPath(c.fn, c.xMin, c.xMax, { samples: 200 }), class: 'plot-curve curve-anim', pathLength: '1' }));
    el.svg.append(handlesLayer);
  }

  function setPoint(which, x) {
    const c = CONTEXTS[state.ctxIdx];
    state[which] = Math.min(c.xMax, Math.max(c.xMin, round1(x)));
    render();
  }

  const bindHandleKeys = (handleEl, which) => {
    handleEl.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      const c = CONTEXTS[state.ctxIdx];
      const step = e.shiftKey ? 0.5 : 0.1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPoint(which, state[which] + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPoint(which, state[which] - step);
      else if (e.key === 'Home') setPoint(which, c.xMin);
      else if (e.key === 'End') setPoint(which, c.xMax);
    });
  };
  bindHandleKeys(handleP1, 'x1');
  bindHandleKeys(handleP2, 'x2');

  let poePredicted = false;
  if (el.poe) {
    const poeBox = createPredictBox({
      prompt: 'Si la temperatura sube de 24 °C (t = 2 h) hasta 26 °C y luego vuelve a 24 °C (t = 6 h), ¿cuánto vale la TCP entre t = 2 h y t = 6 h?',
      classPrefix: 'fn',
      optionClass: 'chip chip--ghost pr-chip',
      options: [
        {
          label: 'A) Positiva, porque en el medio alcanzó 26 °C',
          correct: false,
          explanation: 'La TCP solo compara el inicio y el final (f(6) − f(2) = 0); no mide el pico intermedio.',
        },
        {
          label: 'B) Cero (0 °C/h), porque el cambio neto ΔT es 0',
          correct: true,
          explanation: 'Exacto: aunque en el medio subió y bajó, ΔT = 24 − 24 = 0, por lo que la secante es horizontal y TCP = 0.',
        },
      ],
      onVerify: () => {
        [state.x1, state.x2] = CONTEXTS[state.ctxIdx].zeroPair;
        render();
      },
    });
    poeBox.addEventListener('click', (evt) => {
      if (evt.target?.closest?.('.fn-predict-options button') && !poePredicted) {
        poePredicted = true;
        recordFnPrediction({
          exerciseId: 'fn-poe-secante',
          competencyId: 'functions.average_rate_of_change',
          representation: 'graphical',
        });
      }
    });
    mount(el.poe, poeBox);
  }

  createCheckBlock(
    el.checks,
    CHECKS_DATA.filter((q) => q.sectionId === 'panel-secante'),
    'panel-secante',
  );

  /* ---------- Render ---------- */
  function renderMath(c, x1, x2, y1, y2, tcpRes) {
    const { dx, dy, tcp, defined, zeroRate } = tcpRes;
    if (!defined) {
      mount(el.math, h('strong', null, 'Separá los dos instantes'), ': con x₁ = x₂ no hay "puente" que trazar.');
      el.verdict.className = 'notice notice--err';
      mount(el.verdict,
        h('strong', null, 'Así no se puede calcular. '),
        `Si los dos puntos coinciden, Δx = 0 ${c.xUnit} y la fracción quedaría con un 0 en el denominador, que no está definido. Hacen falta dos instantes distintos para medir un cambio.`);
      return;
    }
    const row1 = h('div', { class: 'tcp-row' },
      h('span', { class: 'math' }, 'TCP'), ' = ',
      frac('f(x₂) − f(x₁)', 'x₂ − x₁'),
    );
    const row2 = h('div', { class: 'tcp-row' },
      '= ',
      frac(['(', fmt(y2), ' − ', paren(y1), ')', unitSpan(c.yUnit)], ['(', fmt(x2), ' − ', paren(x1), ')', unitSpan(c.xUnit)]), ' = ',
      frac([fmt(dy), unitSpan(c.yUnit)], [fmt(dx), unitSpan(c.xUnit)]), ' = ',
      h('strong', null, fmt(tcp)), ' ', frac(c.yUnit, c.xUnit, { className: 'fr--sm' }),
    );
    mount(el.math, row1, row2);

    const span = `Entre ${fmt(Math.min(x1, x2))} ${c.xUnit} y ${fmt(Math.max(x1, x2))} ${c.xUnit}`;
    const swapped = x1 > x2
      ? h('p', { class: 'muted small' }, 'Pusiste x₁ después de x₂. No pasa nada: el numerador y el denominador cambian de signo juntos, y la TCP da exactamente lo mismo.')
      : null;

    if (zeroRate) {
      el.verdict.className = 'notice notice--warn';
      mount(el.verdict,
        h('strong', null, 'Tasa cero, aunque en el medio pasaron cosas. '),
        `${span}, ${c.qty} empezó y terminó en el mismo valor: f(${fmt(x1)}) = f(${fmt(x2)}) = ${fmt(y1)} ${c.yUnit}. `,
        'En el camino subió y bajó (mirá la curva), pero el cambio neto es Δy = 0. Por eso la secante queda horizontal: su pendiente es 0. ',
        'La TCP solo compara el principio con el final; no ve lo que pasó entre medio.',
        swapped);
      return;
    }
    const grew = (y2 - y1) * Math.sign(x2 - x1) > 0;
    el.verdict.className = 'notice';
    mount(el.verdict,
      h('strong', null, `${span}, ${c.qty} ${grew ? c.up : c.down} `),
      h('span', { style: 'color: var(--yellow); font-weight: bold;' }, `${fmt(Math.abs(dy))} ${c.yUnit}`),
      ' en ',
      h('span', { style: 'color: var(--yellow); font-weight: bold;' }, `${fmt(Math.abs(dx))} ${c.xUnit}`),
      '. ',
      `En promedio, es como si hubiera ${grew ? 'subido' : 'bajado'} a un ritmo parejo de ${fmt(Math.abs(tcp))} ${c.rateText}. `,
      grew ? '' : 'El signo negativo de la TCP te avisa justamente eso: la magnitud disminuyó. ',
      'Esa es la pendiente de la secante: la recta que une los dos instantes como si el cambio hubiera sido constante.',
      swapped);
  }

  function render() {
    const c = CONTEXTS[state.ctxIdx];
    const { x1, x2 } = state;
    const y1 = c.fn(x1), y2 = c.fn(x2);
    const tcpRes = computeSecantTcp(c.fn, x1, x2);
    const { dx, dy } = tcpRes;

    el.ctx.value = String(state.ctxIdx);
    el.r1.value = String(x1);
    el.r2.value = String(x2);
    el.v1.textContent = `${fmt(x1)} ${c.xUnit}`;
    el.v2.textContent = `${fmt(x2)} ${c.xUnit}`;
    el.rule.textContent = `Modelo: ${c.rule}`;

    plane.clear('under', 'marks', 'labels');
    const { under, marks, labels } = plane.layers;

    if (tcpRes.defined) {
      const m = dy / dx, sec = (x) => y1 + m * (x - x1);
      under.append(s('path', { d: plane.linePath([[c.xMin, sec(c.xMin)], [c.xMax, sec(c.xMax)]]), class: 'fn-secant' }));
      marks.append(
        s('line', { x1: plane.sx(x1), y1: plane.sy(y1), x2: plane.sx(x2), y2: plane.sy(y1), class: 'fn-triangle-dx' }),
        s('line', { x1: plane.sx(x2), y1: plane.sy(y1), x2: plane.sx(x2), y2: plane.sy(y2), class: 'fn-triangle-dy' }),
      );
      labels.append(
        s('text', {
          x: plane.sx((x1 + x2) / 2), y: plane.sy(y1) - 12,
          class: 'plot-label', 'text-anchor': 'middle', fill: 'var(--ink)',
        }, `Δx = ${fmt(dx)} ${c.xUnit}`),
        s('text', {
          x: plane.sx(x2) + 14, y: plane.sy((y1 + y2) / 2),
          class: 'plot-label', 'text-anchor': 'start', fill: 'var(--ink)',
        }, `Δy = ${fmt(dy)} ${c.yUnit}`),
      );
    }

    const updateHandle = (handleNode, x, y, name, key) => {
      const cx = plane.sx(x), cy = plane.sy(y);
      const rot = key === 'p1' ? 12 : -15;
      marks.append(
        s('ellipse', { cx, cy, rx: 13.5, ry: 12.5, class: `fn-handle-ring fn-handle-ring--${key}`, transform: `rotate(${rot} ${cx} ${cy})` }),
        s('ellipse', { cx, cy, rx: 7.2, ry: 6.8, fill: 'var(--blue)', stroke: 'var(--card)', 'stroke-width': 2, transform: `rotate(${rot} ${cx} ${cy})`, style: 'pointer-events: none;' }),
      );
      handleNode.setAttribute('cx', String(cx));
      handleNode.setAttribute('cy', String(cy));
      handleNode.setAttribute('aria-valuemin', String(c.xMin));
      handleNode.setAttribute('aria-valuemax', String(c.xMax));
      handleNode.setAttribute('aria-valuenow', String(x));
      handleNode.setAttribute('aria-valuetext', `${name}: x = ${fmt(x)}, y = ${fmt(y)}`);

      const isP1 = key === 'p1';
      const labelX = isP1 ? cx + 16 : cx - 14;
      const labelY = isP1 ? cy + 28 : cy - 14;
      const anchor = isP1 ? 'start' : 'end';
      labels.append(s('text', { x: labelX, y: labelY, class: 'plot-label', 'text-anchor': anchor }, `${name}(${fmt(x)}; ${fmt(y)})`));
    };

    updateHandle(handleP1, x1, y1, 'P₁', 'p1');
    updateHandle(handleP2, x2, y2, 'P₂', 'p2');

    renderMath(c, x1, x2, y1, y2, tcpRes);
  }

  /* ---------- Eventos ---------- */
  on(el.ctx, 'change', (e) => {
    state.ctxIdx = Number(e.target.value);
    [state.x1, state.x2] = CONTEXTS[state.ctxIdx].defaultPair;
    buildPlane();
    render();
  });
  on(el.r1, 'input', (e) => setPoint('x1', Number(e.target.value)));
  on(el.r2, 'input', (e) => setPoint('x2', Number(e.target.value)));
  on(el.zero, 'click', () => {
    [state.x1, state.x2] = CONTEXTS[state.ctxIdx].zeroPair;
    render();
  });

  bindSvgDrag(el.svg, () => plane, ({ x, y, phase }) => {
    if (phase === 'start') {
      const c = CONTEXTS[state.ctxIdx];
      const dist = (xi) => Math.hypot(plane.sx(xi) - plane.sx(x), plane.sy(c.fn(xi)) - plane.sy(y));
      dragTarget = dist(state.x1) <= dist(state.x2) ? 'x1' : 'x2';
    }
    if (phase === 'end') { dragTarget = null; return; }
    if (dragTarget) setPoint(dragTarget, x);
  });

  buildPlane();
  render();
}
