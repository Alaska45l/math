/**
 * inversa.js — Submódulo 4: La Máquina Inversa y el Espejo y = x.
 * Tubería reversible con valores numéricos vivos intermedios y propiedad uniforme,
 * detección y explicación rigurosa de la falla de inyectividad con m = 0,
 * reflexión ortonormal 1:1 en el espejo y = x con arrastre directo sobre SVG,
 * y traductor verbal con inversión de unidades físicas en voseo rioplatense.
 */
import { h, s, mount, byId, on, setPressed } from '../../core/dom.js';
import { fmt, frac, signedTerm, MINUS } from '../../core/math-format.js';
import { createPlane, bindSvgDrag, snapTo } from '../../core/plot.js';

const VERBAL_CONTEXTS = [
  {
    name: 'A. Costo de viaje en taxi: C(d) según distancia d',
    inVar: 'd',
    outVar: 'C',
    inUnit: 'km',
    outUnit: '$',
    defM: 1.5,
    defB: 2,
    defA: 2,
    directStory: (d, cVal) => `Para un viaje de ${fmt(d)} km, el costo es de $${fmt(cVal)}.`,
    invStory: (cVal, d) => `Con $${fmt(cVal)} de presupuesto, podés viajar exactamente ${fmt(d)} km.`,
  },
  {
    name: 'B. Temperatura y dilatación: L(T) según incremento T',
    inVar: 'T',
    outVar: 'L',
    inUnit: '°C',
    outUnit: 'mm',
    defM: 0.5,
    defB: 1,
    defA: 4,
    directStory: (t, lVal) => `Si la temperatura sube ${fmt(t)} °C, el material se dilata ${fmt(lVal)} mm.`,
    invStory: (lVal, t) => `Si medís una dilatación de ${fmt(lVal)} mm, la temperatura subió ${fmt(t)} °C.`,
  },
  {
    name: 'C. Relación matemática pura: y = f(x)',
    inVar: 'x',
    outVar: 'y',
    inUnit: 'u',
    outUnit: 'u',
    defM: 2,
    defB: -1,
    defA: 1.5,
    directStory: (x, yVal) => `A la entrada x = ${fmt(x)} le corresponde la salida y = ${fmt(yVal)}.`,
    invStory: (yVal, x) => `Para obtener la salida y = ${fmt(yVal)}, la entrada original tuvo que ser x = ${fmt(x)}.`,
  },
];

const round1 = (v) => Math.round(v * 10) / 10;

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
        h('label', { for: 'inv-ctx', class: 'label-sm' }, 'Contexto y unidades'),
        h('select', { id: 'inv-ctx' },
          VERBAL_CONTEXTS.map((c, i) => h('option', { value: i }, c.name)),
        ),
        h('button', { type: 'button', id: 'inv-zero-m', class: 'chip' }, 'Probar trampa m = 0 (Falla inyectividad)'),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'inv-m', class: 'field__label' }, 'Pendiente m'),
        h('input', { type: 'range', id: 'inv-m', min: '-3', max: '3', step: '0.1', value: state.m }),
        h('output', { id: 'inv-m-val', for: 'inv-m', class: 'field__out' }),

        h('label', { for: 'inv-b', class: 'field__label' }, 'Ordenada al origen b'),
        h('input', { type: 'range', id: 'inv-b', min: '-4', max: '4', step: '0.1', value: state.b }),
        h('output', { id: 'inv-b-val', for: 'inv-b', class: 'field__out' }),

        h('label', { for: 'inv-a', class: 'field__label' }, 'Entrada a'),
        h('input', { type: 'range', id: 'inv-a', min: '-4', max: '4', step: '0.1', value: state.a }),
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
        s('svg', {
          id: 'inv-svg',
          viewBox: '0 0 500 460',
          role: 'img',
          'aria-label': 'Plano cartesiano con la recta f, su simétrica f⁻¹ y el espejo y = x; arrastrá el punto o su reflejo',
        }),
        h('p', { class: 'fn-hint' }, 'Tip: arrastrá el punto P o su reflejo P\' directamente sobre el plano cartesiano, o regulá la entrada «a» con el slider.'),
      ),
    ),
  );

  const el = {
    selCtx: byId('inv-ctx', container),
    btnZeroM: byId('inv-zero-m', container),
    rngM: byId('inv-m', container),
    rngB: byId('inv-b', container),
    rngA: byId('inv-a', container),
    valM: byId('inv-m-val', container),
    valB: byId('inv-b-val', container),
    valA: byId('inv-a-val', container),
    btnToggle: byId('inv-toggle', container),
    pipe: byId('inv-pipe', container),
    alg: byId('inv-algebra', container),
    verbal: byId('inv-verbal', container),
    svg: byId('inv-svg', container),
  };

  // Plano 1:1 ortonormal: pw = 500 - 44 - 56 = 400, ph = 460 - 30 - 30 = 400.
  // Espejo y = x a 45° exactos y perpendiculares a 90°.
  const plane = createPlane(el.svg, {
    width: 500,
    height: 460,
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    xStep: 1,
    yStep: 1,
    pad: { l: 44, r: 56, t: 30, b: 30 },
    xTickPos: (t, { sx, xAxisY }) => (t === -1 ? { x: sx(-1) - 8, y: xAxisY + 26, anchor: 'end' } : null),
    yTickPos: (t, { yAxisX, sy }) => (t === -1 ? { x: yAxisX - 8, y: sy(-1) - 6, anchor: 'end' } : null),
  });

  function setA(rawA) {
    const clamped = Math.max(-4, Math.min(4, rawA));
    const snapped = snapTo(round1(clamped), [-4, -3, -2, -1, 0, 1, 2, 3, 4], 0.12);
    state.a = snapped;
    el.rngA.value = String(snapped);
    render();
  }

  function render() {
    const { m, b, a, invertedView } = state;
    const fa = round1(m * a + b);
    const ctx = VERBAL_CONTEXTS[state.ctxIdx];

    el.valM.textContent = fmt(m);
    el.valB.textContent = fmt(b);
    el.valA.textContent = fmt(a);
    setPressed(el.btnToggle, invertedView);

    const bSign = signedTerm(b);
    const bOpp = signedTerm(-b);

    // 1. Tubería de operaciones viva
    if (Math.abs(m) < 1e-4) {
      mount(el.pipe,
        h('div', { class: 'notice notice--err' },
          h('strong', null, '¡Falla de inyectividad: la trampa de la función constante (m = 0)!'),
          h('p', null,
            `Fijate en la recta horizontal f(x) = ${fmt(b)}: todos los valores de entrada dan exactamente ${fmt(b)}. `,
            'Si querés dar marcha atrás y te preguntan: «¿qué entrada produjo la salida ',
            fmt(b),
            '?», no hay respuesta única: ¡cualquiera de los infinitos números reales sirve! ',
            'Por eso no es inyectiva y no existe una función inversa.',
          ),
          h('p', null,
            `En el espejo y = x, la recta se refleja como la recta vertical x = ${fmt(b)}: `,
            'un solo valor de x tiene infinitas imágenes a la vez, violando la condición de unicidad (no pasa el escáner vertical). ',
            'Además, al intentar despejar algebraicamente tendrías que dividir por m = 0, operación prohibida en ℝ.',
          ),
        ),
      );

      mount(el.alg,
        h('strong', null, 'Sin función inversa: '),
        h('span', null, 'f no es inyectiva (todas las entradas colapsan en la misma salida).'),
      );
    } else if (!invertedView) {
      const midVal = round1(m * a);
      mount(el.pipe,
        h('div', { class: 'fn-pipeline' },
          h('span', { class: 'fn-pipe-box fn-pipe-box--io' },
            h('small', null, `Entrada ${ctx.inVar}`),
            fmt(a),
          ),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-op' }, `· (${fmt(m)})`),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-box fn-pipe-box--mid' },
            h('small', null, 'Paso intermedio'),
            fmt(midVal),
          ),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-op' }, bSign),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-box fn-pipe-box--io' },
            h('small', null, `Salida ${ctx.outVar}`),
            fmt(fa),
          ),
        ),
      );

      const formulaInv = frac(['x ', bOpp], fmt(m));
      mount(el.alg,
        h('strong', null, 'Directa: '),
        h('span', null, `f(x) = ${fmt(m)}·x ${bSign}`),
        h('span', { class: 'op' }, '│'),
        h('strong', null, 'Inversa: '),
        h('span', null, 'f⁻¹(x) = '),
        formulaInv,
      );
    } else {
      const midInv = round1(fa - b);
      mount(el.pipe,
        h('div', { class: 'fn-pipeline fn-pipeline--inv' },
          h('span', { class: 'fn-pipe-box fn-pipe-box--io' },
            h('small', null, `Entrada ${ctx.outVar}`),
            fmt(fa),
          ),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-op fn-pipe-op--inv' }, `${bOpp} a ambos miembros`),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-box fn-pipe-box--mid' },
            h('small', null, 'Paso intermedio'),
            fmt(midInv),
          ),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-op fn-pipe-op--inv' }, `÷ (${fmt(m)}) a ambos miembros`),
          h('span', { class: 'fn-pipe-arrow', 'aria-hidden': 'true' }, '→'),
          h('span', { class: 'fn-pipe-box fn-pipe-box--io' },
            h('small', null, `Salida recuperada ${ctx.inVar}`),
            fmt(a),
          ),
        ),
      );

      const step3 = frac(['y ', bOpp], fmt(m));
      const finalInv = frac(['x ', bOpp], fmt(m));
      mount(el.alg,
        h('strong', null, 'Despeje paso a paso: '),
        h('span', null, `y = ${fmt(m)}·x ${bSign}`),
        h('span', { class: 'op' }, '⟺'),
        h('span', null, `y ${bOpp} = ${fmt(m)}·x`),
        h('span', { class: 'op' }, '⟺'),
        step3,
        h('span', null, ' = x'),
        h('span', { class: 'op' }, '⟺'),
        h('span', null, 'f⁻¹(x) = '),
        finalInv,
      );
    }

    // 2. Traductor verbal en contexto
    if (Math.abs(m) < 1e-4) {
      el.verbal.className = 'notice notice--warn';
      mount(el.verbal,
        h('strong', null, 'Lectura en contexto: '),
        `Acá la salida vale siempre ${fmt(b)} ${ctx.outUnit}, hagas lo que hagas con ${ctx.inVar}. `,
        `Si te dan el valor final ${fmt(b)} ${ctx.outUnit}, es imposible adivinar cuál fue la entrada original porque se borró toda huella de ella. Por eso la inversa no existe.`,
      );
    } else {
      el.verbal.className = 'notice notice--blue';
      mount(el.verbal,
        h('strong', null, 'Traductor de unidades e inversión de roles:'),
        h('ul', null,
          h('li', null,
            h('strong', null, 'Camino directo: '),
            `A la entrada `, h('code', null, `${ctx.inVar} = ${fmt(a)} ${ctx.inUnit}`),
            ` le corresponde la salida `, h('code', null, `${ctx.outVar} = ${fmt(fa)} ${ctx.outUnit}`),
            `. ${ctx.directStory(a, fa)}`,
          ),
          h('li', null,
            h('strong', null, 'Camino inverso: '),
            `La función inversa `, h('code', null, `${ctx.outVar}⁻¹`),
            ` invierte los roles: sabiendo que la salida es `, h('code', null, `${fmt(fa)} ${ctx.outUnit}`),
            ` (nueva entrada), recuperás la entrada original `, h('code', null, `${fmt(a)} ${ctx.inUnit}`),
            ` (nueva salida). ${ctx.invStory(fa, a)}`,
          ),
        ),
        h('p', { class: 'muted small' },
          'Fijate cómo se intercambian las variables y sus unidades físicas. En el plano cartesiano, esto equivale geométricamente a reflejar cada punto (x; y) de manera perpendicular a través del espejo y = x hacia (y; x).',
        ),
      );
    }

    // 3. Plano cartesiano
    plane.clear('under', 'curve', 'marks', 'labels');

    // Espejo y = x
    plane.layers.under.append(s('path', { d: plane.linePathMB(1, 0), class: 'fn-mirror' }));

    // Recta f(x) = mx + b
    plane.layers.curve.append(
      s('path', { d: plane.linePathMB(m, b), fill: 'none', stroke: 'var(--blue)', 'stroke-width': 3 }),
    );

    // Recta inversa f⁻¹(x)
    if (Math.abs(m) < 1e-4) {
      plane.layers.curve.append(
        s('line', {
          x1: plane.sx(b), y1: plane.sy(-5), x2: plane.sx(b), y2: plane.sy(5),
          stroke: 'var(--pink)', 'stroke-width': 3, 'stroke-dasharray': '5 4',
        }),
      );
    } else {
      const invM = 1 / m;
      const invB = -b / m;
      plane.layers.curve.append(
        s('path', { d: plane.linePathMB(invM, invB), fill: 'none', stroke: 'var(--green)', 'stroke-width': 3 }),
      );
    }

    // Segmento perpendicular entre (a, f(a)) y (f(a), a)
    plane.layers.marks.append(
      s('line', {
        x1: plane.sx(a), y1: plane.sy(fa),
        x2: plane.sx(fa), y2: plane.sy(a),
        class: 'fn-normal',
      }),
    );

    // Manija del punto directo (a, f(a))
    const cxA = plane.sx(a), cyA = plane.sy(fa);
    plane.layers.marks.append(
      s('ellipse', { cx: cxA, cy: cyA, rx: 13.5, ry: 12.5, class: 'fn-handle-ring fn-handle-ring--p1', transform: `rotate(12 ${cxA} ${cyA})` }),
      s('ellipse', { cx: cxA, cy: cyA, rx: 7.2, ry: 6.8, fill: 'var(--blue)', stroke: 'var(--card)', 'stroke-width': 2, transform: `rotate(12 ${cxA} ${cyA})` }),
      s('circle', { cx: cxA, cy: cyA, r: 22, class: 'fn-handle' }),
    );

    // Manija del punto reflejado (f(a), a)
    const cxInv = plane.sx(fa), cyInv = plane.sy(a);
    plane.layers.marks.append(
      s('ellipse', { cx: cxInv, cy: cyInv, rx: 13.5, ry: 12.5, class: 'fn-handle-ring fn-handle-ring--p2', transform: `rotate(-14 ${cxInv} ${cyInv})` }),
      s('ellipse', {
        cx: cxInv, cy: cyInv, rx: 7.2, ry: 6.8,
        fill: Math.abs(m) < 1e-4 ? 'var(--pink)' : 'var(--green)',
        stroke: 'var(--card)', 'stroke-width': 2,
        transform: `rotate(-14 ${cxInv} ${cyInv})`
      }),
      s('circle', { cx: cxInv, cy: cyInv, r: 22, class: 'fn-handle' }),
    );

    // Etiquetas en el gráfico
    plane.layers.labels.append(
      s('text', {
        x: plane.sx(2.0),
        y: plane.sy(3.5),
        class: 'plot-label',
        fill: 'var(--muted)',
        'text-anchor': 'middle',
      }, 'Espejo y = x'),
      s('text', {
        x: plane.sx(-4.4),
        y: plane.sy(Math.max(-4.2, Math.min(4.2, m * (-4.4) + b))) + 22,
        class: 'plot-label',
        fill: 'var(--blue)',
        'text-anchor': 'start',
      }, 'f(x)'),
      s('text', {
        x: cxA,
        y: cyA + 24,
        class: 'plot-label',
        'text-anchor': 'middle',
        fill: 'var(--blue)',
      }, `P(${fmt(a)}; ${fmt(fa)})`),
      s('text', {
        x: cxInv - 14,
        y: cyInv + 4,
        class: 'plot-label',
        'text-anchor': 'end',
        fill: Math.abs(m) < 1e-4 ? 'var(--pink)' : 'var(--green)',
      }, `P'(${fmt(fa)}; ${fmt(a)})`),
    );

    if (Math.abs(m) < 1e-4) {
      plane.layers.labels.append(
        s('text', {
          x: plane.sx(b) - 12,
          y: plane.sy(3.5),
          class: 'plot-label',
          fill: 'var(--pink)',
          'text-anchor': 'end',
        }, 'Recta x = b (NO es función)'),
      );
    } else {
      const invM = 1 / m;
      const invB = -b / m;
      plane.layers.labels.append(
        s('text', {
          x: plane.sx(3.8),
          y: plane.sy(Math.max(-4.5, Math.min(4.5, invM * 3.8 + invB))) - 10,
          class: 'plot-label',
          fill: 'var(--green)',
        }, 'f⁻¹(x)'),
      );
    }
  }

  /* ---------- Eventos ---------- */
  on(el.rngM, 'input', (e) => {
    state.m = round1(Number(e.target.value));
    render();
  });
  on(el.rngB, 'input', (e) => {
    state.b = round1(Number(e.target.value));
    render();
  });
  on(el.rngA, 'input', (e) => {
    state.a = round1(Number(e.target.value));
    render();
  });

  on(el.btnToggle, 'click', () => {
    state.invertedView = !state.invertedView;
    render();
  });

  on(el.btnZeroM, 'click', () => {
    state.m = 0;
    el.rngM.value = '0';
    render();
  });

  on(el.selCtx, 'change', (e) => {
    state.ctxIdx = Number(e.target.value);
    const ctx = VERBAL_CONTEXTS[state.ctxIdx];
    state.m = ctx.defM;
    state.b = ctx.defB;
    state.a = ctx.defA;
    el.rngM.value = String(state.m);
    el.rngB.value = String(state.b);
    el.rngA.value = String(state.a);
    render();
  });

  /* Arrastre directo sobre el SVG: proyecta al punto directo o al reflejado */
  let dragTarget = 'p1';
  bindSvgDrag(el.svg, () => plane, ({ x, y, phase }) => {
    if (phase === 'start') {
      const { m, b, a } = state;
      const fa = m * a + b;
      const d1 = Math.hypot(plane.sx(a) - plane.sx(x), plane.sy(fa) - plane.sy(y));
      const d2 = Math.hypot(plane.sx(fa) - plane.sx(x), plane.sy(a) - plane.sy(y));
      dragTarget = d2 < d1 ? 'p2' : 'p1';
    }
    if (phase === 'end') return;

    const { m, b } = state;
    const denom = m * m + 1;
    // Proyección ortogonal continua:
    // P₁(a) = (a, m·a + b)  =>  a = (x + m·(y − b)) / (m² + 1)
    // P₂(a) = (m·a + b, a)  =>  a = (m·(x − b) + y) / (m² + 1)
    const targetA = dragTarget === 'p1'
      ? (x + m * (y - b)) / denom
      : (m * (x - b) + y) / denom;

    setA(targetA);
  });

  // Carga inicial
  el.selCtx.value = String(state.ctxIdx);
  el.rngM.value = String(state.m);
  el.rngB.value = String(state.b);
  el.rngA.value = String(state.a);
  render();
}
