/**
 * puente-continuo.js — Widget 3 (F15)
 * Definición formal f(x) = k · aˣ con a ∈ ℝ⁺ − {1} y k ∈ ℝ − {0}.
 * Muestra la densificación en ℝ (Z -> Q -> R) y el colapso con a < 0, a = 0 o a = 1.
 */

import {
  createCartesianBoard,
  createStore,
  addChips,
  addRange,
  renderReadout,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';

const BASES = [
  [2, 'a = 2 (Creciente)'],
  [0.5, 'a = 1/2 (Decreciente)'],
  [1, 'a = 1 (Recta constante)'],
  [0, 'a = 0 (División por cero)'],
  [-2, 'a = −2 (Colapso: √−2 ∉ ℝ)'],
];

const DENSITIES = [
  [1, '1. Enteros ℤ'],
  [2, '2. Medios x = 1/2'],
  [3, '3. Cuartos x = 1/4'],
  [4, '4. Continuo ℝ'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Puente Continuo: Densificación en ℝ',
    {
      width: 640,
      height: 340,
      xMin: -3.5,
      xMax: 3.5,
      yMin: -4,
      yMax: 8,
      xStep: 1,
      yStep: 2,
    },
  );

  const plane = board.plane;

  const store = createStore({
    a: options.a !== undefined ? options.a : 2,
    density: options.density || 2, // 1 to 4
    probeX: options.probeX !== undefined ? options.probeX : 1.5,
  });

  // 1. Controls
  const updateBaseChips = addChips(
    board.controls,
    BASES,
    store.get().a,
    (val) => store.set({ a: Number(val) }),
    'Base de la Exponencial',
  );

  const updateDensityChips = addChips(
    board.controls,
    DENSITIES,
    store.get().density,
    (val) => store.set({ density: Number(val) }),
    'Densidad de Muestreo',
  );

  const { input: probeSlider } = addRange(
    board.controls,
    store,
    'probeX',
    'Sonda de abscisa x',
    -3,
    3,
    store.get().probeX,
    0.25,
    (v) => `x = ${fmt(v)}`,
  );

  // 2. SVG Elements
  // Continuous curve path
  const curvePath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  plane.layers.curve.append(curvePath);

  // Constant line path for a = 1
  const constantLine = s('line', {
    x1: plane.sx(-3.5),
    y1: plane.sy(1),
    x2: plane.sx(3.5),
    y2: plane.sy(1),
    stroke: 'var(--blue)',
    'stroke-width': 2.5,
    visibility: 'hidden',
  });
  plane.layers.curve.append(constantLine);

  // Ray for a = 0 (x > 0, y = 0)
  const zeroRay = s('line', {
    x1: plane.sx(0),
    y1: plane.sy(0),
    x2: plane.sx(3.5),
    y2: plane.sy(0),
    stroke: 'var(--pink)',
    'stroke-width': 3,
    visibility: 'hidden',
  });
  plane.layers.curve.append(zeroRay);

  // Danger zone for a < 0 or a = 0
  const dangerZone = s('g', { class: 'exp-danger-zone', visibility: 'hidden' });
  const dangerBox = s('rect', {
    x: plane.sx(-3.5),
    y: plane.sy(8),
    width: plane.sx(0) - plane.sx(-3.5),
    height: plane.sy(-4) - plane.sy(8),
    fill: 'rgba(227, 161, 161, 0.12)',
    stroke: 'var(--pink)',
    'stroke-dasharray': '4 4',
  });
  const dangerText = s('text', {
    x: (plane.sx(-3.5) + plane.sx(0)) / 2,
    y: plane.sy(3),
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    fill: 'var(--pink)',
    'font-size': '12px',
    'font-weight': 'bold',
  }, '0⁻¹ = 1/0 Indefinido');
  dangerZone.append(dangerBox, dangerText);
  plane.layers.under.append(dangerZone);

  // Discrete points pool
  const maxDiscrete = 32;
  const pointDots = [];
  const pointsGroup = s('g', { class: 'exp-discrete-points' });
  for (let i = 0; i < maxDiscrete; i++) {
    const dot = s('circle', {
      cx: 0,
      cy: 0,
      r: 4.5,
      fill: 'var(--blue)',
      stroke: 'var(--bg)',
      'stroke-width': 1.5,
      visibility: 'hidden',
    });
    pointsGroup.append(dot);
    pointDots.push(dot);
  }
  plane.layers.marks.append(pointsGroup);

  // Probe indicator
  const probeGroup = s('g', { class: 'exp-probe-marker' });
  const probeLine = s('line', {
    x1: 0,
    y1: plane.sy(-4),
    x2: 0,
    y2: plane.sy(8),
    stroke: 'var(--accent)',
    'stroke-dasharray': '3 3',
    'stroke-width': 1.5,
  });
  const probeDot = s('circle', {
    cx: 0,
    cy: 0,
    r: 6.5,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 2,
  });
  const probeBadge = s('text', {
    x: 0,
    y: 0,
    class: 'exp-svg-label',
    fill: 'var(--text)',
    'font-size': '12px',
    'font-weight': 'bold',
  }, '');
  const probeAlertCross = s('g', {
    class: 'exp-svg-alert-cross',
    visibility: 'hidden',
  }, s('path', {
    d: 'M -7 -7 L 7 7 M 7 -7 L -7 7',
    stroke: 'var(--pink)',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
  }));

  probeGroup.append(probeLine, probeDot, probeBadge, probeAlertCross);
  plane.layers.marks.append(probeGroup);

  // 3. Render pipeline
  const render = (state) => {
    updateBaseChips(state.a);
    updateDensityChips(state.density);
    probeSlider.value = String(state.probeX);

    const a = state.a;
    const density = state.density;
    const pxVal = state.probeX;

    // Reset base visualizations
    setVisible(curvePath, false);
    setVisible(constantLine, false);
    setVisible(zeroRay, false);
    setVisible(dangerZone, false);

    // Hide all discrete dots initially
    pointDots.forEach((d) => setVisible(d, false));

    // Handle base cases
    let evalStatus = 'valid'; // 'valid' | 'invalid_neg' | 'invalid_zero' | 'degenerate_one'
    let probeY = null;

    if (a > 0 && a !== 1) {
      evalStatus = 'valid';
      // Continuous curve in density 4 or background
      const pathD = plane.fnPath((x) => Math.pow(a, x), -3.5, 3.5);
      curvePath.setAttribute('d', pathD);
      setVisible(curvePath, density === 4);

      // Discrete sampling according to density
      let step = 1;
      if (density === 1) step = 1;
      else if (density === 2) step = 0.5;
      else if (density === 3) step = 0.25;
      else step = 0; // continuous

      if (step > 0) {
        let dotIdx = 0;
        for (let x = -3; x <= 3.01 && dotIdx < maxDiscrete; x += step) {
          const y = Math.pow(a, x);
          if (y >= -4 && y <= 8) {
            const dot = pointDots[dotIdx++];
            dot.setAttribute('cx', String(plane.sx(x)));
            dot.setAttribute('cy', String(plane.sy(y)));
            dot.setAttribute('r', '4.5');
            dot.setAttribute('fill', step === 1 ? 'var(--blue)' : 'var(--yellow)');
            dot.setAttribute('stroke', 'var(--bg)');
            dot.setAttribute('stroke-width', '1.5');
            setVisible(dot, true);
          }
        }
      }

      probeY = Math.pow(a, pxVal);
    } else if (a === 1) {
      evalStatus = 'degenerate_one';
      let step = 1;
      if (density === 1) step = 1;
      else if (density === 2) step = 0.5;
      else if (density === 3) step = 0.25;
      else step = 0; // continuous

      if (step > 0) {
        let dotIdx = 0;
        for (let x = -3; x <= 3.01 && dotIdx < maxDiscrete; x += step) {
          const dot = pointDots[dotIdx++];
          dot.setAttribute('cx', String(plane.sx(x)));
          dot.setAttribute('cy', String(plane.sy(1)));
          dot.setAttribute('r', '4.5');
          dot.setAttribute('fill', step === 1 ? 'var(--blue)' : 'var(--yellow)');
          dot.setAttribute('stroke', 'var(--bg)');
          dot.setAttribute('stroke-width', '1.5');
          setVisible(dot, true);
        }
        setVisible(constantLine, false);
      } else {
        setVisible(constantLine, true);
      }
      probeY = 1;
    } else if (a === 0) {
      evalStatus = 'invalid_zero';
      let step = 1;
      if (density === 1) step = 1;
      else if (density === 2) step = 0.5;
      else if (density === 3) step = 0.25;
      else step = 0;

      if (step > 0) {
        let dotIdx = 0;
        for (let x = step; x <= 3.01 && dotIdx < maxDiscrete; x += step) {
          const dot = pointDots[dotIdx++];
          dot.setAttribute('cx', String(plane.sx(x)));
          dot.setAttribute('cy', String(plane.sy(0)));
          dot.setAttribute('r', '4.5');
          dot.setAttribute('fill', step === 1 ? 'var(--blue)' : 'var(--yellow)');
          dot.setAttribute('stroke', 'var(--bg)');
          dot.setAttribute('stroke-width', '1.5');
          setVisible(dot, true);
        }
        setVisible(zeroRay, false);
      } else {
        setVisible(zeroRay, true);
      }
      setVisible(dangerZone, true);
      setText(dangerText, 'x < 0: 0⁻¹ = 1/0 Indefinido');
      if (pxVal > 0) probeY = 0;
      else probeY = null;
    } else if (a < 0) {
      evalStatus = 'invalid_neg';
      let step = 1;
      if (density === 1) step = 1;
      else if (density === 2) step = 0.5;
      else if (density === 3) step = 0.25;
      else step = 0; // continuous mode

      let dotIdx = 0;
      if (step > 0) {
        for (let x = -3; x <= 3.01 && dotIdx < maxDiscrete; x += step) {
          const isInt = Math.abs(x - Math.round(x)) < 1e-6;
          if (isInt) {
            const y = Math.pow(a, Math.round(x));
            if (y >= -4 && y <= 8) {
              const dot = pointDots[dotIdx++];
              dot.setAttribute('cx', String(plane.sx(x)));
              dot.setAttribute('cy', String(plane.sy(y)));
              dot.setAttribute('r', '4.5');
              dot.setAttribute('fill', 'var(--pink)');
              dot.setAttribute('stroke', 'var(--bg)');
              dot.setAttribute('stroke-width', '1.5');
              setVisible(dot, true);
            }
          } else {
            // Fractional rational power collapses in R: show collapse marker on x-axis
            const dot = pointDots[dotIdx++];
            dot.setAttribute('cx', String(plane.sx(x)));
            dot.setAttribute('cy', String(plane.sy(0)));
            dot.setAttribute('r', '3');
            dot.setAttribute('fill', 'none');
            dot.setAttribute('stroke', 'var(--pink)');
            dot.setAttribute('stroke-width', '1.5');
            setVisible(dot, true);
          }
        }
      } else {
        // Continuous mode: show only valid integer points
        for (let x = -3; x <= 3 && dotIdx < maxDiscrete; x += 1) {
          const y = Math.pow(a, x);
          if (y >= -4 && y <= 8) {
            const dot = pointDots[dotIdx++];
            dot.setAttribute('cx', String(plane.sx(x)));
            dot.setAttribute('cy', String(plane.sy(y)));
            dot.setAttribute('r', '4.5');
            dot.setAttribute('fill', 'var(--pink)');
            dot.setAttribute('stroke', 'var(--bg)');
            dot.setAttribute('stroke-width', '1.5');
            setVisible(dot, true);
          }
        }
      }

      // Check if probe x is an integer
      if (Math.abs(pxVal - Math.round(pxVal)) < 1e-9) {
        probeY = Math.pow(a, Math.round(pxVal));
      } else {
        probeY = null;
      }
    }

    // Update probe position
    const probeSx = plane.sx(pxVal);
    probeLine.setAttribute('x1', String(probeSx));
    probeLine.setAttribute('x2', String(probeSx));

    const isNearRight = probeSx > 480;
    const badgeAnchor = isNearRight ? 'end' : 'start';
    const badgeX = isNearRight ? String(probeSx - 12) : String(probeSx + 12);

    if (probeY !== null && probeY >= -4 && probeY <= 8) {
      setVisible(probeDot, true);
      setVisible(probeAlertCross, false);
      const probeSy = plane.sy(probeY);
      probeDot.setAttribute('cx', String(probeSx));
      probeDot.setAttribute('cy', String(probeSy));
      probeBadge.setAttribute('x', badgeX);
      probeBadge.setAttribute('y', String(Math.max(35, probeSy - 10)));
      probeBadge.setAttribute('text-anchor', badgeAnchor);
      setText(probeBadge, `f(${fmt(pxVal)}) = ${fmt(probeY)}`);
    } else if (probeY !== null) {
      // Real value but out of visual scale [-4, 8]
      setVisible(probeDot, true);
      setVisible(probeAlertCross, false);
      const isAbove = probeY > 8;
      const clampedSy = plane.sy(isAbove ? 8 : -4);
      probeDot.setAttribute('cx', String(probeSx));
      probeDot.setAttribute('cy', String(clampedSy));
      probeBadge.setAttribute('x', badgeX);
      probeBadge.setAttribute('y', String(isAbove ? clampedSy + 16 : clampedSy - 8));
      probeBadge.setAttribute('text-anchor', badgeAnchor);
      setText(probeBadge, `f(${fmt(pxVal)}) = ${fmt(probeY)} (fuera de escala)`);
    } else {
      // Collapse or undefined in R: display formal cross alert
      setVisible(probeDot, false);
      setVisible(probeAlertCross, true);
      const alertSy = plane.sy(0);
      probeAlertCross.setAttribute('transform', `translate(${probeSx}, ${alertSy})`);
      probeBadge.setAttribute('x', badgeX);
      probeBadge.setAttribute('y', String(alertSy - 15));
      probeBadge.setAttribute('text-anchor', badgeAnchor);
      if (evalStatus === 'invalid_neg') {
        setText(probeBadge, `(${a})^(${fmt(pxVal)}) ∉ ℝ (Raíz no real)`);
      } else if (evalStatus === 'invalid_zero') {
        setText(probeBadge, `0^(${fmt(pxVal)}) = 1/0 Indefinido`);
      } else {
        setText(probeBadge, 'Indefinido en ℝ');
      }
    }

    // Readout rows
    const rows = [];
    if (evalStatus === 'valid') {
      rows.push([
        'Estado del Dominio',
        `Función Exponencial Válida en ℝ: f(x) = ${a === 0.5 ? '(1/2)' : a}ˣ. Dominio = ℝ, Imagen = (0; +∞).`,
      ]);
      rows.push([
        'Densificación de la Curva',
        density === 1
          ? 'Paso 1 (Enteros ℤ): Los puntos están aislados. ¿Qué pasa en el medio?'
          : density === 2
          ? `Paso 2 (Medios ℚ): Para x = 1/2, a^(1/2) = √${a} ≈ ${fmt(Math.sqrt(a))}. Las raíces aritméticas comienzan a rellenar los huecos.`
          : density === 3
          ? 'Paso 3 (Cuartos ℚ): Se calculan raíces cuartas a^(1/4) = ⁴√a densificando progresivamente la recta.'
          : 'Paso 4 (Continuo ℝ): Por el axioma de completitud de los números reales, el trazo se vuelve completamente continuo y fluido.',
      ]);
      rows.push([
        'Sonda Actual',
        `Para x = ${fmt(pxVal)}: f(${fmt(pxVal)}) = ${fmt(probeY)}. Curva estrictamente ${a > 1 ? 'creciente' : 'decreciente'}.`,
      ]);
    } else if (evalStatus === 'invalid_neg') {
      rows.push([
        'Colapso en ℝ: Base Negativa a < 0',
        '¡Atención! Si a < 0 (ej. a = −2), en x = 1/2 se tendría (−2)^(1/2) = √(−2) ∉ ℝ. No existe raíz real para índices pares.',
      ]);
      rows.push([
        'Consecuencia Geométrica',
        'La gráfica no forma una curva continua: solo existen puntos alternados para enteros, con infinitos agujeros vacíos en los racionales. Queda descartada de las funciones exponenciales.',
      ]);
    } else if (evalStatus === 'invalid_zero') {
      rows.push([
        'Indefinición en ℝ: Base Cero a = 0',
        'Para exponentes negativos x < 0, 0⁻¹ = 1/0 es una división por cero indefinida. Para x = 0, 0⁰ es indeterminación. Para x > 0 es 0 (no tiene crecimiento).',
      ]);
      rows.push([
        'Fallo de la Base',
        'Una función con base 0 carece de imagen para todo el semiplano x < 0 y de semivida.',
      ]);
    } else {
      rows.push([
        'Degeneración en ℝ: Base Unitaria a = 1',
        'Para todo x ∈ ℝ, 1ˣ = 1. La curva no sube ni baja: se convierte en la recta horizontal y = 1 (pendiente m = 0).',
      ]);
      rows.push([
        'Exclusión Formal',
        'Por definición formal, a = 1 se excluye porque carece de crecimiento exponencial, asíntota horizontal real o vida media.',
      ]);
    }

    renderReadout(board.readout, 'Puente de Densidad y Restricciones Formales', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ a: 2, density: 2, probeX: 1.5 }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initPuenteContinuoWidget };
