/**
 * scanner.js — Submódulo 1: Escáner de Unicidad, Dominio e Imagen.
 * Evalúa relaciones, proyecta sombras de Dom/Im sobre los ejes y aplica
 * la prueba de la recta vertical con diagnóstico en tiempo real.
 */
import { h, s, mount, byId, on, setPressed } from '../../core/dom.js';
import { fmt, MINUS } from '../../core/math-format.js';
import { createPlane } from '../../core/plot.js';

const fmtPt = (x, y) => `(${fmt(x)}; ${fmt(y)})`;

const CASES = [
  {
    id: 'hole',
    title: '1. Curva continua con agujero (Sí es función)',
    isFunction: true,
    formula: 'f(x) = 0,25·x² − 1 en [−3; 4], sin definir en x = 1',
    domText: '[−3; 1) ∪ (1; 4]',
    imText: '[−1; 3]',
    xShadows: [
      { x1: -3, x2: 1, open1: false, open2: true },
      { x1: 1, x2: 4, open1: true, open2: false },
    ],
    yShadows: [{ y1: -1, y2: 3, open1: false, open2: false }],
    evalAt(x) {
      if (x < -3 || x > 4) return { pts: [], reason: 'x está fuera del intervalo [−3; 4].' };
      if (Math.abs(x - 1) < 1e-4) {
        return { pts: [], holeY: -0.75, reason: 'En x = 1 hay un punto abierto (agujero): 1 ∉ Dom(f).' };
      }
      return { pts: [0.25 * x * x - 1], reason: 'Cada entrada del dominio tiene una única salida.' };
    },
    draw(plane) {
      const p1 = plane.fnPath((x) => 0.25 * x * x - 1, -3, 0.96, { samples: 60 });
      const p2 = plane.fnPath((x) => 0.25 * x * x - 1, 1.04, 4, { samples: 60 });
      plane.layers.curve.append(
        s('path', { d: p1, class: 'plot-curve' }),
        s('path', { d: p2, class: 'plot-curve' }),
        s('circle', { cx: plane.sx(-3), cy: plane.sy(1.25), r: 5, class: 'plot-dot' }),
        s('circle', { cx: plane.sx(4), cy: plane.sy(3), r: 5, class: 'plot-dot' }),
        s('circle', { cx: plane.sx(1), cy: plane.sy(-0.75), r: 6, class: 'plot-dot--open' }),
      );
    },
  },
  {
    id: 'parabola_h',
    title: '2. Parábola horizontal: x = y² − 2 (NO es función)',
    isFunction: false,
    formula: 'x = y² − 2  ⟺  y = ±√(x + 2)',
    domText: '[−2; +∞)',
    imText: 'ℝ (todos los reales)',
    xShadows: [{ x1: -2, x2: 5, open1: false, open2: true }],
    yShadows: [{ y1: -4, y2: 4, open1: true, open2: true }],
    evalAt(x) {
      if (x < -2) return { pts: [], reason: 'Para x < −2 el radicando x + 2 es negativo (sin imagen real).' };
      if (Math.abs(x + 2) < 1e-4) return { pts: [0], reason: 'En el vértice x = −2 hay un solo punto, pero para x > −2 falla la unicidad.' };
      const r = Math.sqrt(x + 2);
      return {
        pts: [r, -r],
        reason: `Para la misma entrada x = ${fmt(x)} existen dos salidas: y = +${fmt(r)} e y = ${MINUS}${fmt(r)}. Viola la unicidad.`,
      };
    },
    draw(plane) {
      const top = plane.fnPath((x) => Math.sqrt(x + 2), -2, 5, { samples: 80 });
      const bot = plane.fnPath((x) => -Math.sqrt(x + 2), -2, 5, { samples: 80 });
      plane.layers.curve.append(
        s('path', { d: top, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3 }),
        s('path', { d: bot, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3 }),
        s('circle', { cx: plane.sx(-2), cy: plane.sy(0), r: 5, fill: 'var(--red-line)' }),
      );
    },
  },
  {
    id: 'circle',
    title: '3. Circunferencia: (x − 2)² + (y − 2)² = 1 (NO es función)',
    isFunction: false,
    formula: '(x − 2)² + (y − 2)² = 1 (Centro (2; 2), radio 1)',
    domText: '[1; 3]',
    imText: '[1; 3]',
    xShadows: [{ x1: 1, x2: 3, open1: false, open2: false }],
    yShadows: [{ y1: 1, y2: 3, open1: false, open2: false }],
    evalAt(x) {
      if (x < 1 || x > 3) return { pts: [], reason: 'La recta vertical no interseca a la circunferencia fuera de [1; 3].' };
      const inside = Math.max(0, 1 - (x - 2) * (x - 2));
      const dy = Math.sqrt(inside);
      if (dy < 1e-4) return { pts: [2], reason: `En el borde x = ${fmt(x)} toca en un punto tangente, pero en el interior (1; 3) corta dos veces.` };
      return {
        pts: [2 + dy, 2 - dy],
        reason: `Colisión vertical: a la entrada x = ${fmt(x)} le corresponden dos salidas distintas y₁ = ${fmt(2 + dy)} e y₂ = ${fmt(2 - dy)}.`,
      };
    },
    draw(plane) {
      const top = plane.fnPath((x) => 2 + Math.sqrt(Math.max(0, 1 - (x - 2) ** 2)), 1, 3, { samples: 60 });
      const bot = plane.fnPath((x) => 2 - Math.sqrt(Math.max(0, 1 - (x - 2) ** 2)), 1, 3, { samples: 60 });
      plane.layers.curve.append(
        s('path', { d: top, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3 }),
        s('path', { d: bot, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3 }),
      );
    },
  },
  {
    id: 'abs',
    title: '4. Valor absoluto: f(x) = |x| − 1 (Sí es función, no inyectiva)',
    isFunction: true,
    formula: 'f(x) = |x| − 1',
    domText: 'ℝ',
    imText: '[−1; +∞)',
    xShadows: [{ x1: -5, x2: 5, open1: true, open2: true }],
    yShadows: [{ y1: -1, y2: 4, open1: false, open2: true }],
    evalAt(x) {
      return {
        pts: [Math.abs(x) - 1],
        reason: 'Dos entradas opuestas (como x = −2 y x = 2) comparten la misma salida y = 1; esto NO viola la definición de función (solo indica que no es inyectiva).',
      };
    },
    draw(plane) {
      const p = plane.linePath([[-5, 4], [0, -1], [5, 4]]);
      plane.layers.curve.append(s('path', { d: p, class: 'plot-curve' }));
    },
  },
  {
    id: 'rational',
    title: '5. Racional con asíntota: f(x) = 1/(x − 2) + 1 (Restricción algebraica)',
    isFunction: true,
    formula: 'f(x) = 1 / (x − 2) + 1  (Denominador x − 2 ≠ 0)',
    domText: 'ℝ − {2}',
    imText: 'ℝ − {1}',
    xShadows: [
      { x1: -5, x2: 2, open1: true, open2: true },
      { x1: 2, x2: 5, open1: true, open2: true },
    ],
    yShadows: [
      { y1: -4, y2: 1, open1: true, open2: true },
      { y1: 1, y2: 4, open1: true, open2: true },
    ],
    evalAt(x) {
      if (Math.abs(x - 2) < 1e-4) {
        return {
          pts: [],
          reason: '¡Restricción algebraica! En x = 2 el denominador vale 0. Como la división por 0 está indefinida en ℝ, x = 2 queda excluido del dominio (asíntota vertical).',
        };
      }
      return {
        pts: [1 / (x - 2) + 1],
        reason: 'Para cualquier x ≠ 2 la cuenta está bien definida y produce una única salida real.',
      };
    },
    draw(plane) {
      const left = plane.fnPath((x) => 1 / (x - 2) + 1, -5, 1.75, { samples: 60 });
      const right = plane.fnPath((x) => 1 / (x - 2) + 1, 2.25, 5, { samples: 60 });
      plane.layers.under.append(
        s('line', {
          x1: plane.sx(2), y1: plane.sy(-4), x2: plane.sx(2), y2: plane.sy(4),
          stroke: 'var(--amber-line)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4',
        }),
        s('line', {
          x1: plane.sx(-5), y1: plane.sy(1), x2: plane.sx(5), y2: plane.sy(1),
          stroke: 'var(--muted)', 'stroke-width': 1.4, 'stroke-dasharray': '4 4',
        }),
      );
      plane.layers.curve.append(
        s('path', { d: left, class: 'plot-curve' }),
        s('path', { d: right, class: 'plot-curve' }),
      );
    },
  },
  {
    id: 'discrete',
    title: '6. Contexto Discreto: Entradas de cine (n ∈ {0, 1, 2, 3, 4})',
    isFunction: true,
    formula: 'Costo C(n) = 0,8·n − 1 (Escala en miles de $, n entradas)',
    domText: '{0; 1; 2; 3; 4} (Discreto ⊂ ℕ₀)',
    imText: '{−1; −0,2; 0,6; 1,4; 2,2}',
    xShadows: [],
    yShadows: [],
    evalAt(x) {
      const isInt = Math.abs(x - Math.round(x)) < 1e-4;
      const n = Math.round(x);
      if (!isInt || n < 0 || n > 4) {
        return {
          pts: [],
          reason: `x = ${fmt(x)} no pertenece al dominio discreto: no se pueden vender entradas a una fracción de persona ni a cantidades negativas.`,
        };
      }
      return {
        pts: [0.8 * n - 1],
        reason: `Para n = ${n} personas exactas, hay una única imagen asignada.`,
      };
    },
    draw(plane) {
      for (let n = 0; n <= 4; n++) {
        plane.layers.curve.append(
          s('circle', { cx: plane.sx(n), cy: plane.sy(0.8 * n - 1), r: 6, fill: 'var(--blue-line)' }),
        );
      }
    },
  },
];

export function initScanner(container) {
  const state = {
    caseIdx: 0,
    x: 0.5,
    showDom: true,
    showIm: false,
  };

  mount(container,
    h('div', { class: 'panel' },
      h('div', { class: 'row' },
        h('label', { for: 'sc-case', class: 'label-sm' }, 'Caso de estudio'),
        h('select', { id: 'sc-case' },
          CASES.map((c, i) => h('option', { value: i }, c.title)),
        ),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'sc-x', class: 'field__label' }, 'Láser en x ='),
        h('input', { type: 'range', id: 'sc-x', min: '-4.5', max: '4.5', step: '0.1', value: state.x }),
        h('output', { id: 'sc-x-val', for: 'sc-x', class: 'field__out' }, fmt(state.x)),
        h('div', { class: 'btn-group' },
          h('button', { type: 'button', id: 'sc-dom-btn', class: 'toggle', 'aria-pressed': 'true' }, 'Sombra Dominio (Eje X)'),
          h('button', { type: 'button', id: 'sc-im-btn', class: 'toggle', 'aria-pressed': 'false' }, 'Sombra Imagen (Eje Y)'),
        ),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'sc-svg', viewBox: '0 0 600 380', role: 'img', 'aria-label': 'Plano cartesiano con el escáner de la recta vertical' }),
      ),
      h('div', { class: 'fn-side' },
        h('div', { id: 'sc-verdict', class: 'notice', 'aria-live': 'polite' }),
        h('div', { class: 'fn-readout' },
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Expresión / Regla'),
            h('strong', { id: 'sc-formula' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, '¿Es función?'),
            h('span', { id: 'sc-isfn' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Dominio · Dom(f)'),
            h('strong', { id: 'sc-dom', style: 'color:var(--blue)' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Rango / Imagen · Im(f)'),
            h('strong', { id: 'sc-im', style: 'color:var(--green)' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Intersecciones con x = ', h('span', { id: 'sc-x-inline' })),
            h('strong', { id: 'sc-pts' }),
          ),
        ),
      ),
    ),
  );

  const selCase = byId('sc-case', container);
  const rngX = byId('sc-x', container);
  const valX = byId('sc-x-val', container);
  const btnDom = byId('sc-dom-btn', container);
  const btnIm = byId('sc-im-btn', container);
  const svg = byId('sc-svg', container);
  const verdictEl = byId('sc-verdict', container);
  const formulaEl = byId('sc-formula', container);
  const isFnEl = byId('sc-isfn', container);
  const domEl = byId('sc-dom', container);
  const imEl = byId('sc-im', container);
  const xInline = byId('sc-x-inline', container);
  const ptsEl = byId('sc-pts', container);

  const plane = createPlane(svg, {
    width: 600, height: 380, xMin: -5, xMax: 5, yMin: -4, yMax: 4, xStep: 1, yStep: 1,
  });

  function render() {
    const c = CASES[state.caseIdx];
    const res = c.evalAt(state.x);

    valX.textContent = fmt(state.x);
    xInline.textContent = fmt(state.x);
    formulaEl.textContent = c.formula;
    domEl.textContent = c.domText;
    imEl.textContent = c.imText;
    isFnEl.innerHTML = c.isFunction
      ? '<span class="badge badge--ok badge--sm">SÍ (Unicidad global)</span>'
      : '<span class="badge badge--err badge--sm">NO (Falla unicidad)</span>';

    setPressed(btnDom, state.showDom);
    setPressed(btnIm, state.showIm);

    plane.clear('shade', 'under', 'curve', 'marks', 'labels');

    // Sombras de Dominio e Imagen
    if (state.showDom) {
      if (c.id === 'discrete') {
        for (let n = 0; n <= 4; n++) {
          plane.layers.shade.append(
            s('circle', { cx: plane.sx(n), cy: plane.xAxisY, r: 5, fill: 'var(--blue-line)' }),
          );
        }
      } else {
        c.xShadows.forEach((sh) => {
          plane.layers.shade.append(
            s('line', {
              x1: plane.sx(sh.x1), y1: plane.xAxisY, x2: plane.sx(sh.x2), y2: plane.xAxisY,
              class: 'fn-shadow-x',
            }),
            s('circle', {
              cx: plane.sx(sh.x1), cy: plane.xAxisY, r: 4.5,
              class: sh.open1 ? 'plot-dot--open' : 'plot-dot',
            }),
            s('circle', {
              cx: plane.sx(sh.x2), cy: plane.xAxisY, r: 4.5,
              class: sh.open2 ? 'plot-dot--open' : 'plot-dot',
            }),
          );
        });
      }
    }

    if (state.showIm) {
      if (c.id === 'discrete') {
        for (let n = 0; n <= 4; n++) {
          plane.layers.shade.append(
            s('circle', { cx: plane.yAxisX, cy: plane.sy(0.8 * n - 1), r: 5, fill: 'var(--green-line)' }),
          );
        }
      } else {
        c.yShadows.forEach((sh) => {
          plane.layers.shade.append(
            s('line', {
              x1: plane.yAxisX, y1: plane.sy(sh.y1), x2: plane.yAxisX, y2: plane.sy(sh.y2),
              class: 'fn-shadow-y',
            }),
            s('circle', {
              cx: plane.yAxisX, cy: plane.sy(sh.y1), r: 4.5,
              fill: sh.open1 ? 'var(--card)' : 'var(--green-line)',
              stroke: 'var(--green-line)', 'stroke-width': 2,
            }),
            s('circle', {
              cx: plane.yAxisX, cy: plane.sy(sh.y2), r: 4.5,
              fill: sh.open2 ? 'var(--card)' : 'var(--green-line)',
              stroke: 'var(--green-line)', 'stroke-width': 2,
            }),
          );
        });
      }
    }

    // Dibujo de la curva
    c.draw(plane);

    // Láser vertical
    const laserStroke = res.pts.length === 1
      ? 'var(--green-line)'
      : res.pts.length > 1
        ? 'var(--red-line)'
        : 'var(--amber-line)';

    plane.layers.marks.append(
      s('line', {
        x1: plane.sx(state.x), y1: plane.sy(-4), x2: plane.sx(state.x), y2: plane.sy(4),
        class: 'fn-laser', stroke: laserStroke,
      }),
    );
    plane.layers.labels.append(
      s('text', {
        x: plane.sx(state.x), y: plane.box.y + 16,
        class: 'plot-label', 'text-anchor': 'middle',
      }, `x = ${fmt(state.x)}`),
    );

    // Puntos de corte
    res.pts.forEach((y) => {
      if (y >= -4 && y <= 4) {
        plane.layers.marks.append(
          s('line', {
            x1: plane.sx(state.x), y1: plane.sy(y), x2: plane.yAxisX, y2: plane.sy(y),
            stroke: 'var(--muted)', 'stroke-width': 1.2, 'stroke-dasharray': '3 3',
          }),
          s('circle', { cx: plane.sx(state.x), cy: plane.sy(y), r: 6, fill: laserStroke, stroke: 'var(--card)', 'stroke-width': 1.5 }),
        );
      }
    });

    if (res.holeY !== undefined) {
      plane.layers.marks.append(
        s('circle', { cx: plane.sx(state.x), cy: plane.sy(res.holeY), r: 7, class: 'plot-dot--open', stroke: 'var(--amber-line)' }),
      );
    }

    // Diagnóstico
    if (res.pts.length === 1) {
      verdictEl.className = 'notice notice--ok';
      verdictEl.innerHTML = `<strong>✓ Unicidad cumplida en x = ${fmt(state.x)}:</strong> el láser corta a la gráfica en exactamente un punto ${fmtPt(state.x, res.pts[0])}. ${res.reason}`;
      ptsEl.textContent = fmtPt(state.x, res.pts[0]);
    } else if (res.pts.length > 1) {
      verdictEl.className = 'notice notice--err';
      verdictEl.innerHTML = `<strong>✗ Colisión de salidas en x = ${fmt(state.x)}:</strong> el láser corta en ${res.pts.length} puntos. ${res.reason}`;
      ptsEl.textContent = res.pts.map((y) => fmtPt(state.x, y)).join(' y ');
    } else {
      verdictEl.className = 'notice notice--warn';
      verdictEl.innerHTML = `<strong>Fuera del dominio en x = ${fmt(state.x)}:</strong> el láser no corta ningún punto definido. ${res.reason}`;
      ptsEl.textContent = '∅ (Sin imagen asignada)';
    }
  }

  on(selCase, 'change', (e) => {
    state.caseIdx = Number(e.target.value);
    render();
  });
  on(rngX, 'input', (e) => {
    state.x = Number(e.target.value);
    render();
  });
  on(btnDom, 'click', () => {
    state.showDom = !state.showDom;
    render();
  });
  on(btnIm, 'click', () => {
    state.showIm = !state.showIm;
    render();
  });

  render();
}
