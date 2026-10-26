/**
 * radiografia.js — Submódulo 2: La Radiografía Cartesiana.
 * Inspección profunda de C₀, C⁺, C⁻, intervalos de monotonía (↑/↓),
 * extremos locales vs. absolutos y el "Candado del Eje X".
 */
import { h, s, mount, byId, on, setPressed } from '../../core/dom.js';
import { createPlane } from '../../core/plot.js';

/**
 * Curva continua suave en [−4; 5] armada por tramos C¹:
 * - Raíces exactas (C₀): x = −3, x = 0, x = 4
 * - Mínimo local en (−1,8; −3)
 * - Máximo local y absoluto en (2; 4)
 * - Mínimo absoluto en el borde derecho (5; −5)
 */
function evalWave(x) {
  if (x <= -1.8) {
    const d = x + 1.8;
    return (25 / 12) * d * d - 3;
  }
  if (x <= 2) {
    if (x <= 0) {
      const u = (x + 1.8) / 1.8;
      return -3 + 3 * (u * u * (2 - u));
    }
    const v = x / 2;
    return 4 * (v * (2 - v * v));
  }
  const d = x - 2;
  return 4 - d * d;
}

const LENSES = [
  {
    id: 'signos',
    label: 'Lente 1: C₀, C⁺ y C⁻',
    title: 'Conjuntos de Positividad (C⁺), Negatividad (C⁻) y Ceros (C₀)',
    desc: `
      <ul>
        <li><strong>Ceros o Raíces (C₀ = {−3; 0; 4}):</strong> valores de <em>x</em> donde la curva interseca al eje X (<em>f(x) = 0</em>).</li>
        <li><strong>Conjunto de Positividad (C⁺ = [−4; −3) ∪ (0; 4)):</strong> tramos sobre el eje horizontal (<em>f(x) &gt; 0</em>).</li>
        <li><strong>Conjunto de Negatividad (C⁻ = (−3; 0) ∪ (4; 5]):</strong> tramos bajo el eje horizontal (<em>f(x) &lt; 0</em>).</li>
      </ul>
    `,
  },
  {
    id: 'monotonia',
    label: 'Lente 2: Crecimiento (↑) y Decrecimiento (↓)',
    title: 'Intervalos de Crecimiento (I↑) y Decrecimiento (I↓)',
    desc: `
      <ul>
        <li><strong>Crecimiento (I↑ = (−1,8; 2)):</strong> al recorrer la curva de izquierda a derecha, la función sube desde el valle en <em>x = −1,8</em> hasta la cima en <em>x = 2</em>.</li>
        <li><strong>Decrecimiento (I↓ = (−4; −1,8) y (2; 5)):</strong> al aumentar <em>x</em>, la altura <em>f(x)</em> disminuye.</li>
      </ul>
    `,
  },
  {
    id: 'extremos',
    label: 'Lente 3: Extremos Locales vs. Absolutos',
    title: 'Puntos Máximos y Mínimos (Relativos vs. Absolutos)',
    desc: `
      <ul>
        <li><strong>Máximo local y absoluto en (2; 4):</strong> es la cima de su entorno y el techo absoluto de todo el dominio.</li>
        <li><strong>Mínimo local (relativo) en (−1,8; −3):</strong> es el punto más bajo de su vecindario, pero <strong>no es absoluto</strong> porque en el borde derecho la curva cae más abajo.</li>
        <li><strong>Mínimo absoluto en (5; −5):</strong> se alcanza en el borde del dominio con <em>f(5) = −5</em>.</li>
      </ul>
    `,
  },
  {
    id: 'trampa',
    label: 'Lente 4: Trampa "Negativa pero Creciente"',
    title: '¡Alerta de Examen! Negativa (f(x) < 0) pero Creciente (↑) en (−1,8; 0)',
    desc: `
      <p>En el intervalo <strong>x ∈ (−1,8; 0)</strong> ocurren las dos cosas al mismo tiempo:</p>
      <ul>
        <li>Es <strong>NEGATIVA (pertenece a C⁻)</strong> porque la curva está por debajo del eje X (entre <em>y = −3</em> e <em>y = 0</em>).</li>
        <li>Es <strong>CRECIENTE (pertenece a I↑)</strong> porque a medida que avanzás hacia la derecha, la gráfica está <strong>subiendo</strong> hacia la superficie.</li>
      </ul>
    `,
  },
];

export function initRadiografia(container) {
  const state = {
    lens: 'signos',
  };

  mount(container,
    h('div', { class: 'panel' },
      h('span', { class: 'label-sm' }, 'Seleccioná un Lente de Rayos X para inspeccionar la curva en Dom(f) = [−4; 5]:'),
      h('div', { class: 'fn-lens-bar', id: 'rad-lenses' },
        LENSES.map((l) => h('button', {
          type: 'button', class: 'toggle', dataset: { lens: l.id },
          'aria-pressed': l.id === state.lens ? 'true' : 'false',
        }, l.label)),
      ),
    ),
    h('div', { class: 'fn-grid' },
      h('div', { class: 'fn-canvas-card' },
        s('svg', { id: 'rad-svg', viewBox: '0 0 620 390', role: 'img', 'aria-label': 'Gráfica de análisis de positividad, crecimiento y extremos' }),
      ),
      h('div', { class: 'fn-side' },
        h('div', { id: 'rad-explain', class: 'notice notice--blue', 'aria-live': 'polite' }),
        h('div', { class: 'notice notice--warn' },
          h('strong', null, '🔒 Candado del Eje X (Regla de oro para parciales): '),
          'Los conjuntos ', h('em', null, 'C⁺, C⁻, I↑, I↓'), ' responden a ',
          h('em', null, '«¿para qué valores de x ocurre esto?»'),
          '. Se escriben ', h('strong', null, 'siempre leyendo las abscisas en el piso (Eje X)'),
          ', jamás las alturas del Eje Y.',
        ),
        h('div', { class: 'fn-readout' },
          h('div', { class: 'fn-readout__title' }, 'Caza de errores: «Corregí la tarea de Guillermo»'),
          h('p', { class: 'muted small' },
            'Observando el tramo donde la curva sube desde el valle (−1,8; −3) hasta la cima (2; 4), Guillermo escribió en su examen: ',
            h('code', null, 'I↑ = (−3; 4)'), '. ¿Por qué le pusieron Mal (M)?',
          ),
          h('div', { class: 'fn-quiz-options', id: 'rad-quiz' },
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'wrong1' } },
              'A) Porque tendría que haber puesto corchetes cerrados [−3; 4].',
            ),
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'correct' } },
              'B) Porque leyó las alturas en el Eje Y (de y = −3 a y = 4) en vez de leer las coordenadas del Eje X: el intervalo correcto es (−1,8; 2).',
            ),
            h('button', { type: 'button', class: 'fn-quiz-btn', dataset: { ans: 'wrong2' } },
              'C) Porque entre x = −1,8 y x = 0 la función es negativa, entonces ahí no crece.',
            ),
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
    width: 620, height: 390, xMin: -4.5, xMax: 5.5, yMin: -5.5, yMax: 5.5, xStep: 1, yStep: 1,
  });

  function render() {
    const active = LENSES.find((l) => l.id === state.lens);
    explain.innerHTML = `<strong>${active.title}</strong>${active.desc}`;

    plane.clear('shade', 'under', 'curve', 'marks', 'labels');

    if (state.lens === 'signos') {
      // Semiplano superior tintado de verde, inferior de rojo
      const yZero = plane.xAxisY;
      plane.layers.shade.append(
        s('rect', {
          x: plane.box.x, y: plane.box.y, width: plane.box.w, height: yZero - plane.box.y,
          fill: 'var(--greenbg)', opacity: 0.6,
        }),
        s('rect', {
          x: plane.box.x, y: yZero, width: plane.box.w, height: plane.box.y + plane.box.h - yZero,
          fill: 'var(--redbg)', opacity: 0.6,
        }),
      );

      const pPos1 = plane.fnPath(evalWave, -4, -3, { samples: 40 });
      const pNeg1 = plane.fnPath(evalWave, -3, 0, { samples: 60 });
      const pPos2 = plane.fnPath(evalWave, 0, 4, { samples: 80 });
      const pNeg2 = plane.fnPath(evalWave, 4, 5, { samples: 40 });

      plane.layers.curve.append(
        s('path', { d: pPos1, fill: 'none', stroke: 'var(--green-line)', 'stroke-width': 3.5 }),
        s('path', { d: pNeg1, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3.5 }),
        s('path', { d: pPos2, fill: 'none', stroke: 'var(--green-line)', 'stroke-width': 3.5 }),
        s('path', { d: pNeg2, fill: 'none', stroke: 'var(--red-line)', 'stroke-width': 3.5 }),
      );

      [-3, 0, 4].forEach((r) => {
        plane.layers.marks.append(
          s('circle', { cx: plane.sx(r), cy: plane.sy(0), r: 6, fill: 'var(--blue-line)' }),
        );
        plane.layers.labels.append(
          s('text', {
            x: plane.sx(r), y: plane.sy(0) - 10,
            class: 'plot-label', 'text-anchor': 'middle',
          }, `C₀ (${r}; 0)`),
        );
      });
    } else if (state.lens === 'monotonia') {
      const dec1 = plane.fnPath(evalWave, -4, -1.8, { samples: 50 });
      const inc = plane.fnPath(evalWave, -1.8, 2, { samples: 80 });
      const dec2 = plane.fnPath(evalWave, 2, 5, { samples: 70 });

      plane.layers.curve.append(
        s('path', { d: dec1, fill: 'none', stroke: 'var(--amber-line)', 'stroke-width': 3.5 }),
        s('path', { d: inc, fill: 'none', stroke: 'var(--green-line)', 'stroke-width': 4 }),
        s('path', { d: dec2, fill: 'none', stroke: 'var(--amber-line)', 'stroke-width': 3.5 }),
      );

      // Líneas guía que bajan al eje X (Candado del eje X)
      plane.layers.under.append(
        s('line', {
          x1: plane.sx(-1.8), y1: plane.sy(-3), x2: plane.sx(-1.8), y2: plane.xAxisY,
          stroke: 'var(--green-line)', 'stroke-width': 1.8, 'stroke-dasharray': '4 4',
        }),
        s('line', {
          x1: plane.sx(2), y1: plane.sy(4), x2: plane.sx(2), y2: plane.xAxisY,
          stroke: 'var(--green-line)', 'stroke-width': 1.8, 'stroke-dasharray': '4 4',
        }),
        s('line', {
          x1: plane.sx(-1.8), y1: plane.xAxisY, x2: plane.sx(2), y2: plane.xAxisY,
          class: 'fn-shadow-x', stroke: 'var(--green-line)',
        }),
      );

      plane.layers.labels.append(
        s('text', {
          x: plane.sx(0.1), y: plane.xAxisY + 28,
          class: 'plot-label', 'text-anchor': 'middle', fill: 'var(--green)',
        }, 'I↑ = (−1,8; 2) leído en el Eje X'),
      );
    } else if (state.lens === 'extremos') {
      const full = plane.fnPath(evalWave, -4, 5, { samples: 140 });
      plane.layers.curve.append(s('path', { d: full, class: 'plot-curve' }));

      plane.layers.marks.append(
        s('circle', { cx: plane.sx(2), cy: plane.sy(4), r: 7, fill: 'var(--green-line)' }),
        s('circle', { cx: plane.sx(-1.8), cy: plane.sy(-3), r: 7, fill: 'var(--amber-line)' }),
        s('circle', { cx: plane.sx(5), cy: plane.sy(-5), r: 7, fill: 'var(--red-line)' }),
      );

      plane.layers.labels.append(
        s('text', { x: plane.sx(2), y: plane.sy(4) - 12, class: 'plot-label', 'text-anchor': 'middle' }, 'Máx. local y absoluto (2; 4)'),
        s('text', { x: plane.sx(-1.8), y: plane.sy(-3) + 20, class: 'plot-label', 'text-anchor': 'middle' }, 'Mín. solo local (−1,8; −3)'),
        s('text', { x: plane.sx(5) - 60, y: plane.sy(-5) - 8, class: 'plot-label', 'text-anchor': 'middle' }, 'Mín. absoluto de borde (5; −5)'),
      );
    } else if (state.lens === 'trampa') {
      const full = plane.fnPath(evalWave, -4, 5, { samples: 140 });
      const trap = plane.fnPath(evalWave, -1.8, 0, { samples: 60 });

      plane.layers.curve.append(
        s('path', { d: full, fill: 'none', stroke: 'var(--border-strong)', 'stroke-width': 2.5 }),
        s('path', { d: trap, fill: 'none', stroke: 'var(--amber-line)', 'stroke-width': 5 }),
      );

      plane.layers.under.append(
        s('line', {
          x1: plane.sx(-1.8), y1: plane.xAxisY, x2: plane.sx(0), y2: plane.xAxisY,
          class: 'fn-shadow-x', stroke: 'var(--amber-line)',
        }),
        s('line', {
          x1: plane.sx(-1.8), y1: plane.sy(-3), x2: plane.sx(-1.8), y2: plane.xAxisY,
          stroke: 'var(--amber-line)', 'stroke-width': 1.8, 'stroke-dasharray': '4 4',
        }),
      );

      plane.layers.marks.append(
        s('circle', { cx: plane.sx(-1.8), cy: plane.sy(-3), r: 6, fill: 'var(--amber-line)' }),
        s('circle', { cx: plane.sx(0), cy: plane.sy(0), r: 6, fill: 'var(--amber-line)' }),
      );

      plane.layers.labels.append(
        s('text', {
          x: plane.sx(-0.9), y: plane.sy(-1.5) + 20,
          class: 'plot-label', 'text-anchor': 'middle', fill: 'var(--amber)',
        }, 'Subiendo (I↑) pero bajo el mar (C⁻)'),
      );
    }
  }

  on(lensesBar, 'click', 'button[data-lens]', (_e, btn) => {
    state.lens = btn.dataset.lens;
    lensesBar.querySelectorAll('button').forEach((b) => {
      setPressed(b, b.dataset.lens === state.lens);
    });
    render();
  });

  on(quizBox, 'click', 'button[data-ans]', (_e, btn) => {
    const ans = btn.dataset.ans;
    if (ans === 'correct') {
      quizMsg.className = 'status text-ok';
      quizMsg.textContent = '¡Exacto! (−3; 4) son valores en el Eje Y. Los intervalos de crecimiento se escriben siempre leyendo las coordenadas del Eje X: (−1,8; 2).';
    } else if (ans === 'wrong1') {
      quizMsg.className = 'status text-err';
      quizMsg.textContent = 'Incorrecto: el error fundamental es que −3 y 4 son alturas (y), no valores de x en el dominio.';
    } else {
      quizMsg.className = 'status text-err';
      quizMsg.textContent = 'Cuidado: que la función sea negativa (bajo el eje X) no le impide estar subiendo. Crece en todo (−1,8; 2).';
    }
  });

  render();
}
