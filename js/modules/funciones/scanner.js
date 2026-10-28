/**
 * scanner.js — Submódulo 1: El Escáner de Unicidad, Dominio e Imagen.
 *
 * El láser vertical se mueve con el slider o tocando/arrastrando directamente
 * sobre el gráfico. Tiene "imanes" suaves en los valores clave de cada caso
 * (agujeros, asíntotas, bordes) para que sea fácil clavarlo justo ahí.
 * El veredicto global (¿es función?) queda oculto hasta que el usuario lo
 * descubre escaneando o decide revelarlo.
 */
import { h, s, mount, byId, on, setPressed } from '../../core/dom.js';
import { fmt, frac } from '../../core/math-format.js';
import { createPlane, bindSvgDrag, snapTo } from '../../core/plot.js';

const X_MIN = -5, X_MAX = 5, Y_MIN = -4, Y_MAX = 4;
const SNAP_RADIUS = 0.12;
const fmtPt = (x, y) => `(${fmt(x)}; ${fmt(y)})`;
const round2 = (v) => Math.round(v * 100) / 100;

/* ------------------------------------------------------------------ */
/* Casos de estudio (definición declarativa con Dom/Im exactos)        */
/*   ends: 'closed' | 'open' | 'inf'                                    */
/* ------------------------------------------------------------------ */
const pieceA = (x) => 0.25 * x * x - 1;
const pieceB = (x) => 0.5 * x + 1;

const CASES = [
  {
    id: 'salto',
    title: '1. Parábola con un punto abierto (salto)',
    isFunction: true,
    verdict: 'Ninguna recta vertical corta dos veces: el punto abierto no cuenta, y en x = 1 la función vale 1,5.',
    formula: () => [
      'f(x) = 0,25·x² − 1   si −3 ≤ x < 1', h('br'),
      'f(x) = 0,5·x + 1   si 1 ≤ x ≤ 4',
    ],
    domText: '[−3; 4]',
    imText: '[−1; 1,25] ∪ [1,5; 3]',
    keys: [-3, 0, 1, 4],
    xShadows: [{ a: -3, b: 4, ea: 'closed', eb: 'closed' }],
    yShadows: [
      { a: -1, b: 1.25, ea: 'closed', eb: 'closed' },
      { a: 1.5, b: 3, ea: 'closed', eb: 'closed' },
    ],
    evalAt(x) {
      if (x < -3 || x > 4) {
        return { pts: [], note: 'La gráfica solo existe entre x = −3 y x = 4; afuera no hay nada que cortar.' };
      }
      if (x < 1) return { pts: [pieceA(x)] };
      if (x === 1) {
        return {
          pts: [pieceB(1)], holeY: pieceA(1),
          note: 'Fijate que el punto abierto (1; −0,75) no cuenta: es un agujero. Justo en x = 1 la función "salta" y su valor real es f(1) = 1,5. Por eso hay un hueco en la imagen: ningún x da alturas entre 1,25 y 1,5.',
        };
      }
      return { pts: [pieceB(x)] };
    },
    draw(plane) {
      plane.layers.curve.append(
        s('path', { d: plane.fnPath(pieceA, -3, 0.999, { samples: 80 }), class: 'plot-curve' }),
        s('path', { d: plane.fnPath(pieceB, 1, 4, { samples: 10 }), class: 'plot-curve' }),
        s('line', {
          x1: plane.sx(1), y1: plane.sy(pieceA(1)), x2: plane.sx(1), y2: plane.sy(pieceB(1)),
          stroke: 'var(--muted)', 'stroke-width': 1, 'stroke-dasharray': '2 3',
        }),
        s('circle', { cx: plane.sx(-3), cy: plane.sy(pieceA(-3)), r: 5, class: 'plot-dot' }),
        s('circle', { cx: plane.sx(4), cy: plane.sy(pieceB(4)), r: 5, class: 'plot-dot' }),
        s('circle', { cx: plane.sx(1), cy: plane.sy(pieceB(1)), r: 5, class: 'plot-dot' }),
        s('circle', { cx: plane.sx(1), cy: plane.sy(pieceA(1)), r: 5.5, class: 'plot-dot--open' }),
      );
    },
  },
  {
    id: 'parabola_h',
    title: '2. Parábola horizontal: x = y² − 2',
    isFunction: false,
    verdict: 'Para cualquier x mayor que −2 aparecen dos alturas (una positiva y otra negativa). Con una sola entrada con dos salidas ya alcanza para que no sea función.',
    formula: () => ['x = y² − 2   ⟺   y = ±√(x + 2)'],
    domText: '[−2; +∞)',
    imText: 'ℝ',
    keys: [-2, -1, 2],
    xShadows: [{ a: -2, b: X_MAX, ea: 'closed', eb: 'inf' }],
    yShadows: [{ a: Y_MIN, b: Y_MAX, ea: 'inf', eb: 'inf' }],
    evalAt(x) {
      if (x < -2) {
        return { pts: [], note: 'Para x < −2 habría que sacar la raíz cuadrada de un número negativo (x + 2 < 0), y eso no da ningún número real.' };
      }
      if (x === -2) {
        return { pts: [0], note: 'Ojo: que en el vértice corte una sola vez no alcanza. Para ser función, TODAS las entradas tienen que tener una única salida. Corré el láser un poquito a la derecha y mirá qué pasa.' };
      }
      const r = Math.sqrt(x + 2);
      return { pts: [r, -r] };
    },
    draw(plane) {
      const st = { fill: 'none', stroke: 'var(--pink)', 'stroke-width': 3, 'stroke-linecap': 'round' };
      plane.layers.curve.append(
        s('path', { d: plane.fnPath((x) => Math.sqrt(x + 2), -2, X_MAX, { samples: 200 }), ...st }),
        s('path', { d: plane.fnPath((x) => -Math.sqrt(x + 2), -2, X_MAX, { samples: 200 }), ...st }),
      );
    },
  },
  {
    id: 'circle',
    title: '3. Circunferencia: (x − 2)² + (y − 2)² = 1',
    isFunction: false,
    verdict: 'En todo el interior (1; 3) la recta vertical corta dos veces: arriba y abajo del centro. No es función.',
    formula: () => ['(x − 2)² + (y − 2)² = 1   (centro (2; 2), radio 1)'],
    domText: '[1; 3]',
    imText: '[1; 3]',
    keys: [1, 2, 3],
    xShadows: [{ a: 1, b: 3, ea: 'closed', eb: 'closed' }],
    yShadows: [{ a: 1, b: 3, ea: 'closed', eb: 'closed' }],
    evalAt(x) {
      if (x < 1 || x > 3) {
        return { pts: [], note: 'La circunferencia ocupa solo la franja 1 ≤ x ≤ 3. Fuera de ahí la recta vertical no la toca.' };
      }
      const dy = Math.sqrt(Math.max(0, 1 - (x - 2) ** 2));
      if (dy < 1e-9) {
        return { pts: [2], note: 'Estás justo en el borde: la recta es tangente y toca un solo punto. Pero eso es la excepción; adentro de la franja corta dos veces.' };
      }
      return { pts: [2 + dy, 2 - dy] };
    },
    draw(plane) {
      const r = Math.abs(plane.sx(1) - plane.sx(0));
      const ry = Math.abs(plane.sy(1) - plane.sy(0));
      plane.layers.curve.append(s('ellipse', {
        cx: plane.sx(2), cy: plane.sy(2), rx: r, ry,
        fill: 'none', stroke: 'var(--pink)', 'stroke-width': 3,
      }));
    },
  },
  {
    id: 'abs',
    title: '4. Valor absoluto: y = |x| − 1',
    isFunction: true,
    verdict: 'Cada recta vertical corta exactamente una vez. Que x = −2 y x = 2 compartan la salida y = 1 no rompe nada: solo dice que la función no es inyectiva.',
    formula: () => ['f(x) = |x| − 1'],
    domText: 'ℝ',
    imText: '[−1; +∞)',
    keys: [-2, 0, 2],
    xShadows: [{ a: X_MIN, b: X_MAX, ea: 'inf', eb: 'inf' }],
    yShadows: [{ a: -1, b: Y_MAX, ea: 'closed', eb: 'inf' }],
    evalAt(x) {
      if (x === 0) return { pts: [-1], note: 'En el vértice la función alcanza su valor más bajo: f(0) = −1. Por eso la imagen arranca en −1.' };
      return {
        pts: [Math.abs(x) - 1],
        note: `Fijate que x = ${fmt(-x)} también da y = ${fmt(Math.abs(x) - 1)}: dos entradas distintas pueden compartir la misma salida. Eso está permitido; lo prohibido es lo contrario.`,
      };
    },
    draw(plane) {
      plane.layers.curve.append(s('path', { d: plane.linePath([[X_MIN, 4], [0, -1], [X_MAX, 4]]), class: 'plot-curve' }));
    },
  },
  {
    id: 'rational',
    title: '5. Hipérbola con asíntota en x = 2',
    isFunction: true,
    verdict: 'Donde existe, la curva se corta una sola vez con cada vertical. El único x conflictivo es 2, y ahí directamente no hay salida: se excluye del dominio.',
    formula: () => ['f(x) = ', frac('1', 'x − 2', { className: 'fr--sm' }), ' + 1'],
    domText: 'ℝ − {2}',
    imText: 'ℝ − {1}',
    keys: [1, 2, 3],
    xShadows: [
      { a: X_MIN, b: 2, ea: 'inf', eb: 'open' },
      { a: 2, b: X_MAX, ea: 'open', eb: 'inf' },
    ],
    yShadows: [
      { a: Y_MIN, b: 1, ea: 'inf', eb: 'open' },
      { a: 1, b: Y_MAX, ea: 'open', eb: 'inf' },
    ],
    evalAt(x) {
      if (x === 2) {
        return { pts: [], note: 'Acá el denominador x − 2 vale 0, y dividir por cero no está definido. Por eso Dom(f) = ℝ − {2}: la curva se acerca a la asíntota cada vez más, pero nunca la toca.' };
      }
      const y = 1 / (x - 2) + 1;
      const note = Math.abs(y) > Y_MAX
        ? `La salida existe (y = ${fmt(y)}), solo que se va fuera de la pantalla: cerca de x = 2 la curva se dispara.`
        : 'Para cualquier x ≠ 2 la cuenta se puede hacer y da un único número. Ojo: la salida nunca llega a valer 1 (sería 1 ÷ (x − 2) = 0, imposible).';
      return { pts: [y], note };
    },
    draw(plane) {
      const f = (x) => 1 / (x - 2) + 1;
      plane.layers.under.append(
        s('line', {
          x1: plane.sx(2), y1: plane.sy(Y_MIN), x2: plane.sx(2), y2: plane.sy(Y_MAX),
          stroke: 'var(--yellow)', 'stroke-width': 1.8, 'stroke-dasharray': '5 4',
        }),
        s('line', {
          x1: plane.sx(X_MIN), y1: plane.sy(1), x2: plane.sx(X_MAX), y2: plane.sy(1),
          stroke: 'var(--muted)', 'stroke-width': 1.4, 'stroke-dasharray': '4 4',
        }),
      );
      plane.layers.curve.append(
        s('path', { d: plane.fnPath(f, X_MIN, 1.999, { samples: 300 }), class: 'plot-curve' }),
        s('path', { d: plane.fnPath(f, 2.001, X_MAX, { samples: 300 }), class: 'plot-curve' }),
      );
    },
  },
  {
    id: 'discrete',
    title: '6. Entradas de cine (contexto discreto)',
    isFunction: true,
    verdict: 'Cada cantidad de entradas tiene un único precio. Es función, pero su gráfica son puntos sueltos: entre uno y otro no hay nada.',
    formula: () => ['C(n) = 0,8·n   (miles de $, n entradas)'],
    domText: '{0; 1; 2; 3; 4} ⊂ ℕ₀',
    imText: '{0; 0,8; 1,6; 2,4; 3,2}',
    keys: [0, 1, 2, 3, 4],
    discrete: [0, 1, 2, 3, 4],
    xShadows: [],
    yShadows: [],
    evalAt(x) {
      const n = Math.round(x);
      if (Math.abs(x - n) > 1e-9) {
        return { pts: [], note: `No se pueden vender ${fmt(x)} entradas: n tiene que ser un número natural (o cero). Entre punto y punto la gráfica está vacía.` };
      }
      if (n < 0 || n > 4) {
        return { pts: [], note: 'En este ejemplo cada compra es de 0 a 4 entradas; otras cantidades no están en el dominio.' };
      }
      return { pts: [0.8 * n], note: `Comprar ${n} entrada${n === 1 ? '' : 's'} cuesta exactamente ${fmt(0.8 * n)} mil pesos.` };
    },
    draw(plane) {
      this.discrete.forEach((n) => plane.layers.curve.append(
        s('circle', { cx: plane.sx(n), cy: plane.sy(0.8 * n), r: 6, class: 'plot-dot' }),
      ));
    },
  },
];

/* ------------------------------------------------------------------ */

export function initScanner(container) {
  const state = {
    caseIdx: 0,
    x: 0.5,
    showDom: false,
    showIm: false,
    revealed: false,
    sawCollision: false,
  };

  mount(container,
    h('div', { class: 'panel' },
      h('div', { class: 'row' },
        h('label', { for: 'sc-case', class: 'label-sm' }, 'Caso de estudio'),
        h('select', { id: 'sc-case' }, CASES.map((c, i) => h('option', { value: i }, c.title))),
      ),
      h('div', { class: 'field' },
        h('label', { for: 'sc-x', class: 'field__label' }, 'Láser en x ='),
        h('input', { type: 'range', id: 'sc-x', min: X_MIN, max: X_MAX, step: '0.05', value: state.x }),
        h('output', { id: 'sc-x-val', for: 'sc-x', class: 'field__out' }),
      ),
      h('div', { class: 'btn-group' },
        h('button', { type: 'button', id: 'sc-dom-btn', class: 'toggle', 'aria-pressed': 'false' }, 'Proyectar sombra en X (Dominio)'),
        h('button', { type: 'button', id: 'sc-im-btn', class: 'toggle', 'aria-pressed': 'false' }, 'Proyectar sombra en Y (Imagen)'),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'sc-svg', viewBox: '0 0 600 380', role: 'img', 'aria-label': 'Plano cartesiano con el láser vertical; tocá o arrastrá para moverlo' }),
        h('p', { class: 'fn-hint' }, 'Tip: tocá o arrastrá sobre el gráfico para mover el láser. Cerca de los puntos clave se "imanta".'),
      ),
      h('div', { class: 'fn-side' },
        h('div', { id: 'sc-verdict', class: 'notice', 'aria-live': 'polite' }),
        h('div', { class: 'fn-readout' },
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Regla'),
            h('strong', { id: 'sc-formula' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, '¿Es función?'),
            h('span', { id: 'sc-isfn', 'aria-live': 'polite' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Dominio · Dom(f)'),
            h('strong', { id: 'sc-dom', class: 'fn-text-blue' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Rango / Imagen · Im(f)'),
            h('strong', { id: 'sc-im', class: 'fn-text-green' }),
          ),
          h('div', { class: 'fn-readout__row' },
            h('span', { class: 'stat__label' }, 'Cortes con x = ', h('span', { id: 'sc-x-inline' })),
            h('strong', { id: 'sc-pts' }),
          ),
        ),
        h('p', { id: 'sc-case-verdict', class: 'muted small', hidden: true }),
      ),
    ),
  );

  const el = {
    sel: byId('sc-case', container), rng: byId('sc-x', container), out: byId('sc-x-val', container),
    dom: byId('sc-dom-btn', container), im: byId('sc-im-btn', container), svg: byId('sc-svg', container),
    verdict: byId('sc-verdict', container), formula: byId('sc-formula', container),
    isFn: byId('sc-isfn', container), domText: byId('sc-dom', container), imText: byId('sc-im', container),
    xInline: byId('sc-x-inline', container), pts: byId('sc-pts', container),
    caseVerdict: byId('sc-case-verdict', container),
  };

  const plane = createPlane(el.svg, {
    width: 600, height: 380, xMin: X_MIN, xMax: X_MAX, yMin: Y_MIN, yMax: Y_MAX,
    xStep: 1, yStep: 1,
    xFmt: (t) => (Math.abs(t) > 4 ? '' : fmt(t)),
    yFmt: (t) => (Math.abs(t) > 4 ? '' : fmt(t)),
  });

  /* ---------- Actualización del estado ---------- */
  function setX(raw) {
    const c = CASES[state.caseIdx];
    state.x = snapTo(round2(raw), c.keys, SNAP_RADIUS);
    if (c.evalAt(state.x).pts.length > 1) state.sawCollision = true;
    render();
  }

  /* ---------- Render ---------- */
  function shadowX(sh) {
    const y = plane.xAxisY, x1 = plane.sx(sh.a), x2 = plane.sx(sh.b);
    const out = [s('line', { x1, y1: y, x2, y2: y, class: 'fn-shadow-x fn-shadow-x--pos' })];
    [[x1, sh.ea], [x2, sh.eb]].forEach(([x, e]) => {
      if (e !== 'inf') out.push(s('circle', { cx: x, cy: y, r: 4.5, class: e === 'open' ? 'plot-dot--open' : 'plot-dot' }));
    });
    return out;
  }
  function shadowY(sh) {
    const x = plane.yAxisX, y1 = plane.sy(sh.a), y2 = plane.sy(sh.b);
    const out = [s('line', { x1: x, y1, x2: x, y2, class: 'fn-shadow-y' })];
    [[y1, sh.ea], [y2, sh.eb]].forEach(([y, e]) => {
      if (e !== 'inf') {
        out.push(s('circle', {
          cx: x, cy: y, r: 4.5,
          fill: e === 'open' ? 'var(--card)' : 'var(--ink)', stroke: 'var(--ink)', 'stroke-width': 2,
        }));
      }
    });
    return out;
  }

  function renderVerdict(c, res) {
    const X = fmt(state.x);
    const note = res.note ? h('span', { class: 'muted' }, ' ', res.note) : null;
    if (res.pts.length === 1) {
      el.verdict.className = 'notice notice--ok';
      mount(el.verdict,
        h('strong', null, `En x = ${X}, la recta vertical corta una sola vez`),
        `, en ${fmtPt(state.x, res.pts[0])}. A esta entrada le corresponde una única salida: así se comporta una función.`,
        note);
    } else if (res.pts.length > 1) {
      el.verdict.className = 'notice notice--err';
      mount(el.verdict,
        h('strong', null, '¡Hay dos salidas para la misma entrada! '),
        `En x = ${X}, la gráfica te devuelve dos alturas distintas al mismo tiempo: y = ${fmt(res.pts[0])} e y = ${fmt(res.pts[1])}. `,
        'Como f(x) no puede valer dos cosas a la vez, esta relación ', h('span', { class: 'text-err' }, 'NO es función'), '.',
        note);
    } else {
      el.verdict.className = 'notice notice--warn';
      mount(el.verdict,
        h('strong', null, `En x = ${X} el láser pasa de largo`),
        ' sin tocar la curva (o pasa justo por un punto abierto). Ese valor de x está fuera del dominio.',
        note);
    }
  }

  function renderIsFunction(c) {
    const known = state.revealed || state.sawCollision;
    if (!known) {
      mount(el.isFn,
        h('span', { class: 'muted small' }, 'Escaneá y decidí vos '),
        h('button', { type: 'button', class: 'fn-reveal', id: 'sc-reveal' }, 'Revelar'));
      el.caseVerdict.hidden = true;
      return;
    }
    const isFn = c.isFunction && !state.sawCollision;
    if (isFn) {
      mount(el.isFn, h('span', { class: ['encerrado', 'text-ok'] }, 'Sí, es función'));
    } else {
      mount(el.isFn,
        h('span', { class: 'text-err' },
          'No es función ',
          s('svg', {
            class: 'chalk-icon chalk-icon--cross',
            viewBox: '0 0 16 16',
            width: '20',
            height: '20',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
            focusable: 'false',
          },
            s('line', { x1: '3', y1: '3', x2: '13', y2: '13' }),
            s('line', { x1: '13', y1: '3', x2: '3', y2: '13' }),
          ),
          h('span', { class: 'sr-only' }, 'incorrecta'),
        ),
      );
    }
    el.caseVerdict.hidden = false;
    el.caseVerdict.textContent = c.verdict;
  }

  function render() {
    const c = CASES[state.caseIdx];
    const res = c.evalAt(state.x);

    el.rng.value = String(state.x);
    el.out.textContent = fmt(state.x);
    el.xInline.textContent = fmt(state.x);
    mount(el.formula, c.formula());
    el.domText.textContent = c.domText;
    el.imText.textContent = c.imText;
    setPressed(el.dom, state.showDom);
    setPressed(el.im, state.showIm);

    plane.clear('shade', 'under', 'curve', 'marks', 'labels');

    if (state.showDom) {
      if (c.discrete) c.discrete.forEach((n) => plane.layers.shade.append(s('circle', { cx: plane.sx(n), cy: plane.xAxisY, r: 5, fill: 'var(--blue)' })));
      else c.xShadows.forEach((sh) => plane.layers.shade.append(...shadowX(sh)));
    }
    if (state.showIm) {
      if (c.discrete) c.discrete.forEach((n) => plane.layers.shade.append(s('circle', { cx: plane.yAxisX, cy: plane.sy(0.8 * n), r: 5, fill: 'var(--ink)' })));
      else c.yShadows.forEach((sh) => plane.layers.shade.append(...shadowY(sh)));
    }

    c.draw(plane);

    const laser = res.pts.length === 1 ? 'var(--green)' : res.pts.length > 1 ? 'var(--pink)' : 'var(--yellow)';
    const lx = plane.sx(state.x);
    plane.layers.marks.append(
      s('line', { x1: lx, y1: plane.sy(Y_MAX), x2: lx, y2: plane.xAxisY - 2, class: 'fn-laser', stroke: laser }),
      s('line', { x1: lx, y1: plane.xAxisY + 38, x2: lx, y2: plane.sy(Y_MIN), class: 'fn-laser', stroke: laser }),
    );
    plane.layers.labels.append(s('text', { x: lx + 8, y: plane.box.y + 14, class: 'plot-label', 'text-anchor': 'start' }, `x = ${fmt(state.x)}`));

    res.pts.forEach((y) => {
      if (y < Y_MIN || y > Y_MAX) return;
      plane.layers.marks.append(
        s('line', { x1: lx, y1: plane.sy(y), x2: plane.yAxisX, y2: plane.sy(y), stroke: 'var(--muted)', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }),
        s('circle', { cx: lx, cy: plane.sy(y), r: 6, fill: laser, stroke: 'var(--card)', 'stroke-width': 1.5 }),
      );
    });
    if (res.holeY !== undefined) {
      plane.layers.marks.append(s('circle', { cx: lx, cy: plane.sy(res.holeY), r: 8, fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2 }));
    }

    renderVerdict(c, res);
    el.pts.textContent = res.pts.length ? res.pts.map((y) => fmtPt(state.x, y)).join(' y ') : 'ninguno';
    renderIsFunction(c);
  }

  /* ---------- Eventos ---------- */
  on(el.sel, 'change', (e) => {
    state.caseIdx = Number(e.target.value);
    state.revealed = false;
    state.sawCollision = false;
    setX(state.x);
  });
  on(el.rng, 'input', (e) => setX(Number(e.target.value)));
  on(el.dom, 'click', () => { state.showDom = !state.showDom; render(); });
  on(el.im, 'click', () => { state.showIm = !state.showIm; render(); });
  on(el.isFn, 'click', '#sc-reveal', () => { state.revealed = true; render(); });
  bindSvgDrag(el.svg, plane, ({ x }) => setX(x));

  render();
}
