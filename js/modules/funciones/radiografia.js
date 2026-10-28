/**
 * radiografia.js — Submódulo 2: La Radiografía Cartesiana.
 * C₀, C⁺, C⁻, monotonía (↑/↓), extremos locales vs. absolutos,
 * la trampa "negativa pero creciente" y el Candado del Eje X.
 */
import { h, s, mount, byId, on, setPressed, chalkIcon } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';
import { createPlane } from '../../core/plot.js';

/* ------------------------------------------------------------------ */
/* Curva C¹ por tramos (Hermite cúbico)                                 */
/* ------------------------------------------------------------------ */
/**
 * Nodos [x, y, pendiente]. Entre nodos consecutivos se usa el polinomio
 * cúbico de Hermite que respeta valor y pendiente en ambos extremos, así
 * que la curva es continua y su derivada también (C¹): no hay quiebres.
 * Las pendientes cumplen la condición de Fritsch–Carlson (α, β ∈ [0; 3]),
 * por lo que cada tramo es estrictamente monótono: las raíces y los
 * extremos están exactamente donde se declaran.
 *
 *   (−4; 2,5) borde · máximo local (no absoluto)
 *   (−3; 0)   raíz
 *   (−1,8; −3) mínimo local (f' = 0)
 *   (0; 0)    raíz, pendiente 2,5 compartida por ambos lados
 *   (2; 4)    máximo local y absoluto (f' = 0)
 *   (4; 0)    raíz
 *   (5; −5)   borde · mínimo absoluto
 */
const KNOTS = [
  [-4, 2.5, -2],
  [-3, 0, -3.5],
  [-1.8, -3, 0],
  [0, 0, 2.5],
  [2, 4, 0],
  [4, 0, -3.5],
  [5, -5, -6],
];
const X0 = KNOTS[0][0], X1 = KNOTS[KNOTS.length - 1][0];

function segmentOf(x) {
  for (let i = 0; i < KNOTS.length - 1; i++) {
    if (x <= KNOTS[i + 1][0]) return i;
  }
  return KNOTS.length - 2;
}

export function evalWave(x) {
  const i = segmentOf(x);
  const [xa, ya, ma] = KNOTS[i];
  const [xb, yb, mb] = KNOTS[i + 1];
  const d = xb - xa, t = (x - xa) / d, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ya + (t3 - 2 * t2 + t) * d * ma + (-2 * t3 + 3 * t2) * yb + (t3 - t2) * d * mb;
}

export function slopeWave(x) {
  const i = segmentOf(x);
  const [xa, ya, ma] = KNOTS[i];
  const [xb, yb, mb] = KNOTS[i + 1];
  const d = xb - xa, t = (x - xa) / d, t2 = t * t;
  return ((6 * t2 - 6 * t) * ya + (3 * t2 - 4 * t + 1) * d * ma + (-6 * t2 + 6 * t) * yb + (3 * t2 - 2 * t) * d * mb) / d;
}

/* ------------------------------------------------------------------ */

const LENSES = [
  {
    id: 'signos',
    label: 'Lente 1: C₀, C⁺ y C⁻',
    title: '¿Arriba o abajo del eje X?',
    body: [
      h('p', null, 'Esta lente solo mira el ', h('strong', null, 'signo'), ' de la salida: si la curva anda por arriba del eje X, por abajo, o justo encima.'),
      h('ul', null,
        h('li', null, h('strong', null, 'Ceros o raíces: C₀ = {−3; 0; 4}. '), 'Son los x donde la curva toca el eje: ahí f(x) = 0.'),
        h('li', null, h('strong', null, 'Positividad: C⁺ = [−4; −3) ∪ (0; 4). '), 'Los x para los que la curva queda arriba del eje (f(x) > 0).'),
        h('li', null, h('strong', null, 'Negatividad: C⁻ = (−3; 0) ∪ (4; 5]. '), 'Los x para los que la curva queda abajo (f(x) < 0).'),
      ),
      h('p', { class: 'muted small rad-explain-note' }, 'Fijate que las tres respuestas son conjuntos de valores de x: las franjas de colores sobre el eje horizontal.'),
    ],
  },
  {
    id: 'monotonia',
    label: 'Lente 2: Crecimiento\u00A0(↑) y decrecimiento\u00A0(↓)',
    title: '¿Sube o baja mientras avanzás hacia la derecha?',
    body: [
      h('p', null, 'Ahora no importa a qué altura está la curva, sino ', h('strong', null, 'hacia dónde va'), '. Imaginá que la recorrés de izquierda a derecha: las flechas te muestran la dirección en cada tramo.'),
      h('ul', null,
        h('li', null, h('strong', null, 'Crece en I↑ = (−1,8; 2). '), 'Desde el valle en x = −1,8 hasta la cima en x = 2, cada paso a la derecha te lleva más arriba.'),
        h('li', null, h('strong', null, 'Decrece en I↓ = (−4; −1,8) y en (2; 5). '), 'En esos tramos, avanzar en x hace que f(x) baje.'),
      ),
      h('p', { class: 'muted small' }, 'Los intervalos se escriben abiertos en los extremos donde la curva "da la vuelta": en el punto exacto del valle o de la cima no está ni subiendo ni bajando.'),
    ],
  },
  {
    id: 'extremos',
    label: 'Lente 3: Extremos locales vs. absolutos',
    title: 'Cimas y valles: ¿del barrio o de todo el mapa?',
    body: [
      h('p', null, 'Un extremo ', h('strong', null, 'local'), ' es el más alto (o más bajo) comparado con sus vecinos cercanos. Uno ', h('strong', null, 'absoluto'), ' le gana a todo el dominio.'),
      h('ul', null,
        h('li', null, h('strong', null, '(2; 4): máximo local y absoluto. '), 'Es la cima de su zona y además ningún punto de la gráfica llega más alto.'),
        h('li', null, h('strong', null, '(−1,8; −3): mínimo solo local. '), 'Es el fondo de su valle, pero no del mapa entero: más a la derecha la curva cae todavía más.'),
        h('li', null, h('strong', null, '(5; −5): mínimo absoluto. '), 'Está en el borde del dominio. Los extremos absolutos pueden caer en los bordes, aunque ahí la curva no "dé la vuelta".'),
        h('li', null, h('strong', null, '(−4; 2,5): máximo local de borde. '), 'Es lo más alto de su vecindario inmediato, pero (2; 4) le gana.'),
      ),
    ],
  },
  {
    id: 'trampa',
    label: 'Lente 4: La trampa "negativa pero creciente"',
    title: 'Alerta de examen: negativa y creciente a la vez',
    body: [
      h('p', null, 'Mirá el tramo resaltado, ', h('strong', null, 'x ∈ (−1,8; 0)'), '. Ahí pasan dos cosas que muchos creen incompatibles:'),
      h('ul', null,
        h('li', null, 'La función es ', h('strong', null, 'NEGATIVA'), ' (está en C⁻): la curva va por debajo del eje X, como un submarino bajo el nivel del mar.'),
        h('li', null, 'Y al mismo tiempo es ', h('strong', null, 'CRECIENTE'), ' (está en I↑): ese submarino está subiendo hacia la superficie.'),
      ),
      h('p', null, 'Estar abajo no significa estar bajando. El signo de f(x) te dice ', h('em', null, 'dónde estás'), '; el crecimiento te dice ', h('em', null, 'hacia dónde vas'), '.'),
    ],
  },
];

export function initRadiografia(container) {
  const state = { lens: 'signos' };

  mount(container,
    h('div', { class: 'panel fn-lens-panel' },
      h('span', { class: 'label-sm' }, 'Elegí una lente de rayos X para mirar la misma curva, con Dom(f) = [−4; 5]:'),
      h('div', { class: 'fn-lens-bar', id: 'rad-lenses' },
        LENSES.map((l) => h('button', { type: 'button', class: 'toggle', dataset: { lens: l.id }, 'aria-pressed': l.id === state.lens ? 'true' : 'false' }, l.label)),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'rad-svg', class: 'plot', viewBox: '0 0 620 390', role: 'img', 'aria-label': 'Gráfica para analizar signo, crecimiento y extremos' }),
        h('div', { id: 'rad-sticky-note', class: 'rad-sticky-note' }),
      ),
      h('div', { class: 'fn-side' },
        h('div', { id: 'rad-explain', class: 'notice', 'aria-live': 'polite' }),
        h('div', { class: 'notice notice--warn' },
          h('strong', null, chalkIcon('lock'), ' Candado del eje X. '),
          'C⁺, C⁻, I↑ e I↓ responden siempre a la misma pregunta: ',
          h('em', null, '¿para qué valores de x pasa esto?'),
          ' Por eso se escriben leyendo el eje X (el "piso"), nunca las alturas del eje Y. Las líneas punteadas te bajan cada borde hasta el piso.',
        ),
        h('div', { class: 'fn-readout' },
          h('div', { class: 'fn-readout__title' }, 'Caza de errores: corregí la tarea de Guillermo'),
          h('p', { class: 'muted small' },
            'Guillermo miró el tramo que sube desde el valle (−1,8; −3) hasta la cima (2; 4) y escribió ',
            h('code', null, 'I↑ = (−3; 4)'), '. Le pusieron mal. ¿Por qué?'),
          h('div', { class: 'fn-quiz-options', id: 'rad-quiz' },
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'brackets' } },
              h('span', { class: 'quiz-opt-tag' }, 'A)'),
              ' Porque tenía que usar corchetes: [−3; 4].'),
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'correct' } },
              h('span', { class: 'quiz-opt-tag' }, 'B)'),
              ' Porque copió las alturas (y = −3 e y = 4) en vez de los valores de x. Lo correcto es (−1,8; 2).'),
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'negative' } },
              h('span', { class: 'quiz-opt-tag' }, 'C)'),
              ' Porque entre x = −1,8 y x = 0 la función es negativa, así que ahí no puede crecer.'),
          ),
          h('p', { id: 'rad-quiz-msg', class: 'status', 'aria-live': 'polite' }),
        ),
      ),
    ),
  );

  const svg = byId('rad-svg', container);
  const explain = byId('rad-explain', container);
  const quizMsg = byId('rad-quiz-msg', container);
  const lensesBar = byId('rad-lenses', container);
  const quizBox = byId('rad-quiz', container);

  const plane = createPlane(svg, {
    width: 620, height: 390, xMin: -4.5, xMax: 5.5, yMin: -5.5, yMax: 5.5,
    xFmt: (t) => fmt(t),
    yFmt: (t) => fmt(t),
  });
  const curve = (a, b, attrs) => s('path', { d: plane.fnPath(evalWave, a, b, { samples: Math.ceil((b - a) * 60) }), fill: 'none', ...attrs });
  const guide = (x, color) => s('line', {
    x1: plane.sx(x), y1: plane.sy(evalWave(x)), x2: plane.sx(x), y2: plane.xAxisY,
    stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': '4 4',
  });
  const bar = (a, b, mod = 'pos', offset = 0) => s('line', {
    x1: plane.sx(a), y1: plane.xAxisY + offset, x2: plane.sx(b), y2: plane.xAxisY + offset,
    class: `fn-shadow-x fn-shadow-x--${mod}`,
  });
  const dot = (x, y, color, r = 6) => {
    const rot = ((Math.round((x + 5) * 7) % 7) - 3) * 3;
    return s('ellipse', {
      cx: plane.sx(x), cy: plane.sy(y),
      rx: r * 1.05, ry: r * 0.95,
      fill: color, stroke: 'var(--card)', 'stroke-width': 1.5,
      transform: `rotate(${rot} ${plane.sx(x)} ${plane.sy(y)})`
    });
  };
  const label = (x, y, text, anchor = 'middle', color = null, id = null) => s('text', {
    x, y, id, class: `plot-label${color === 'var(--yellow)' ? ' plot-label--yellow' : ''}`,
    'text-anchor': anchor, fill: color,
  }, text);

  /** Flecha tangente en x, apuntando en el sentido de x creciente. */
  function tangentArrow(x, customColor = null) {
    const m = slopeWave(x);
    const px = plane.sx(x), py = plane.sy(evalWave(x));
    let dx = plane.sx(x + 0.01) - px, dy = plane.sy(evalWave(x) + m * 0.01) - py;
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const L = 22, color = customColor || (m > 0 ? 'var(--blue)' : 'var(--ink)');
    const ex = px + dx * L, ey = py + dy * L;
    const nx = -dy, ny = dx;
    return s('g', null,
      s('line', { x1: px - dx * L, y1: py - dy * L, x2: ex, y2: ey, stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
      s('path', { d: `M${ex + dx * 6} ${ey + dy * 6}L${ex + nx * 5} ${ey + ny * 5}L${ex - nx * 5} ${ey - ny * 5}Z`, fill: color }),
    );
  }

  function render() {
    const lens = LENSES.find((l) => l.id === state.lens);
    mount(explain, h('strong', null, lens.title), ...lens.body);
    plane.clear('shade', 'under', 'curve', 'marks', 'labels');
    const { shade, under, curve: cv, marks, labels } = plane.layers;

    const stickyNote = byId('rad-sticky-note', container);
    if (stickyNote) {
      if (state.lens === 'signos') {
        mount(stickyNote,
          s('svg', { class: 'rad-arrow-svg', viewBox: '0 0 240 70', width: '240', height: '70', 'aria-hidden': 'true' },
            s('path', { d: 'M120 62 Q 135 32, 120 8 M 112 18 L 120 8 L 128 18', fill: 'none', stroke: 'var(--yellow)', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
          ),
          h('p', { class: 'rad-sticky-note__text' },
            'Fijate que las tres respuestas son conjuntos de valores de x: las franjas de colores sobre el eje horizontal.'
          )
        );
      } else {
        mount(stickyNote);
      }
    }

    if (state.lens === 'signos') {
      const pos = { stroke: 'var(--blue)', 'stroke-width': 3.5 };
      const neg = { stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-dasharray': '5 4' };
      cv.append(curve(X0, -3, pos), curve(-3, 0, neg), curve(0, 4, pos), curve(4, X1, neg));
      under.append(
        bar(X0, -3, 'pos'), bar(0, 4, 'pos'),
        bar(-3, 0, 'neg'), bar(4, X1, 'neg'),
        guide(X0, 'var(--blue)'), guide(X1, 'var(--ink)'),
      );
      [-3, 0, 4].forEach((r) => {
        marks.append(dot(r, 0, 'var(--yellow)'));
      });
      const lx = plane.sx(-1.6), ly = plane.sy(0.7);
      labels.append(label(lx, ly, 'C₀', 'middle', 'var(--yellow)', 'rad-c0'));
    } else if (state.lens === 'monotonia') {
      const pos = { stroke: 'var(--blue)', 'stroke-width': 4 };
      const neg = { stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-dasharray': '5 4' };
      cv.append(
        curve(X0, -1.8, neg),
        curve(-1.8, 2, pos),
        curve(2, X1, neg),
      );
      under.append(
        bar(-1.8, 2, 'pos'),
        bar(X0, -1.8, 'neg'), bar(2, X1, 'neg'),
        guide(-1.8, 'var(--muted)'), guide(2, 'var(--muted)'),
      );
      [-3.5, -2.6, -1, 0.9, 3, 4.5].forEach((x) => marks.append(tangentArrow(x)));
      labels.append(label(plane.sx(0.1), plane.xAxisY + 36, 'I↑ = (−1,8; 2), leído en el eje X', 'middle', 'var(--blue)'));
    } else if (state.lens === 'extremos') {
      cv.append(curve(X0, X1, { class: 'plot-curve' }));
      under.append(guide(2, 'var(--muted)'), guide(-1.8, 'var(--muted)'), guide(X1, 'var(--muted)'), guide(X0, 'var(--muted)'));
      marks.append(
        dot(2, 4, 'var(--blue)', 7), dot(-1.8, -3, 'var(--yellow)', 7),
        dot(X1, -5, 'var(--yellow)', 7), dot(X0, 2.5, 'var(--blue)', 6),
      );
      labels.append(
        label(plane.sx(2), plane.sy(4) - 12, 'Máx. local y absoluto (2; 4)'),
        label(plane.sx(-1.8), plane.sy(-3) + 22, 'Mín. solo local (−1,8; −3)'),
        label(plane.sx(X1) - 10, plane.sy(-5) + 4, 'Mín. absoluto (5; −5)', 'end'),
        label(plane.sx(X0) + 10, plane.sy(2.5) - 8, 'Máx. local de borde', 'start'),
      );
    } else {
      cv.append(
        curve(X0, X1, { stroke: 'var(--border-strong)', 'stroke-width': 2.5 }),
        curve(-1.8, 0, { stroke: 'var(--pink)', 'stroke-width': 5 }),
      );
      under.append(bar(-1.8, 0, 'pink'), guide(-1.8, 'var(--pink)'));
      marks.append(dot(-1.8, -3, 'var(--pink)'), dot(0, 0, 'var(--pink)'), tangentArrow(-0.9, 'var(--pink)'));
      labels.append(label(plane.sx(-0.9), plane.sy(-3.6), 'Abajo del eje, pero subiendo', 'middle', 'var(--pink)'));
    }

    cv.querySelectorAll('path').forEach((p) => {
      p.setAttribute('pathLength', '1');
      p.classList.add('curve-anim');
    });
  }

  on(lensesBar, 'click', 'button[data-lens]', (_e, btn) => {
    state.lens = btn.dataset.lens;
    lensesBar.querySelectorAll('button').forEach((b) => setPressed(b, b.dataset.lens === state.lens));
    render();
  });

  const FEEDBACK = {
    correct: ['text-ok', '¡Exacto! ', '−3 y 4 son alturas, valores de y. Un intervalo de crecimiento contesta "¿para qué x sube?", así que hay que bajar al piso: la curva sube desde x = −1,8 hasta x = 2, o sea I↑ = (−1,8; 2).'],
    brackets: ['text-err', 'No es un tema de corchetes. ', 'El problema de fondo es que −3 y 4 ni siquiera son valores de x: son las alturas del valle y de la cima.'],
    negative: ['text-err', 'Cuidado, esa es justamente la trampa de la Lente 4: ', 'estar debajo del eje no impide estar subiendo. La función crece en todo (−1,8; 2).'],
  };
  on(quizBox, 'click', 'button[data-ans]', (_e, btn) => {
    const isCorrect = btn.dataset.ans === 'correct';
    quizBox.querySelectorAll('button[data-ans]').forEach((b) => {
      b.classList.remove('is-active', 'is-correct', 'is-incorrect');
      const tag = b.querySelector('.quiz-opt-tag');
      if (tag) tag.classList.remove('encerrado', 'tachado');
      const oldIcon = b.querySelector('.quiz-opt-icon');
      if (oldIcon) oldIcon.remove();
    });
    btn.classList.add('is-active');
    btn.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
    const tag = btn.querySelector('.quiz-opt-tag');
    if (tag) {
      tag.classList.add(isCorrect ? 'encerrado' : 'tachado');
      const icon = h('span', { class: 'quiz-opt-icon' },
        chalkIcon(isCorrect ? 'check' : 'cross'),
        h('span', { class: 'sr-only' }, isCorrect ? 'correcta' : 'incorrecta')
      );
      tag.after(icon);
    }
    const [cls, lead, text] = FEEDBACK[btn.dataset.ans];
    quizMsg.className = 'status';
    mount(quizMsg, h('strong', { class: cls }, lead), text);
  });

  render();
}
