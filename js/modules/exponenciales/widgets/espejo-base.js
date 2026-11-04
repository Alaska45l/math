/**
 * espejo-base.js — Widget 4 (F16)
 * Simulación del Problema 2 de Exactas (pág. 90: decaimiento radiactivo de 1 kg y 2 kg),
 * simetría espejo (1/a)ˣ = a⁻ˣ respecto al eje Y, asíntota y = 0, y comparación 2ˣ, eˣ, 3ˣ.
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

const MODES = [
  ['mirror', '1. Simetría Espejo'],
  ['decay', '2. Desintegración Radiactiva'],
  ['trio', '3. Trío 2ˣ, eˣ, 3ˣ'],
];

const BASES_MIRROR = [
  [2, 'Base 2 y 1/2'],
  [3, 'Base 3 y 1/3'],
];

const DECAY_MASSES = [
  [1, '1 kg inicial'],
  [2, '2 kg inicial'],
  ['both', 'Ambas masas'],
];

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Espejo de Base y Decaimiento Radiactivo',
    {
      width: 640,
      height: 340,
      xMin: -4,
      xMax: 4,
      yMin: -1,
      yMax: 8,
      xStep: 1,
      yStep: 1,
    },
  );

  const plane = board.plane;

  const store = createStore({
    mode: options.mode || 'mirror', // 'mirror' | 'decay' | 'trio'
    mirrorBase: 2,
    decayMass: 'both',
    decayYear: 2,
    probeX: 1,
  });

  // 1. Controls
  const updateModeChips = addChips(
    board.controls,
    MODES,
    store.get().mode,
    (m) => store.set({ mode: m }),
    'Modo de Análisis',
  );

  const updateMirrorBaseChips = addChips(
    board.controls,
    BASES_MIRROR,
    store.get().mirrorBase,
    (b) => store.set({ mirrorBase: Number(b) }),
    'Base Espejo',
  );
  const mirrorBaseGroup = board.controls.lastElementChild;

  const updateDecayMassChips = addChips(
    board.controls,
    DECAY_MASSES,
    store.get().decayMass,
    (m) => store.set({ decayMass: m === 'both' ? 'both' : Number(m) }),
    'Masa Inicial',
  );
  const decayMassGroup = board.controls.lastElementChild;

  const { labelEl: yearLabel, input: yearSlider } = addRange(
    board.controls,
    store,
    'decayYear',
    'Años transcurridos t',
    0,
    6,
    store.get().decayYear,
    1,
    (v) => `${v} años`,
  );

  const { labelEl: probeLabel, input: probeSlider } = addRange(
    board.controls,
    store,
    'probeX',
    'Sonda de abscisa x',
    -3,
    3,
    store.get().probeX,
    0.5,
    (v) => `x = ${fmt(v)}`,
  );

  // 2. SVG Elements
  // Horizontal Asymptote y = 0
  const asymptoteLine = s('line', {
    x1: plane.sx(-4),
    y1: plane.sy(0),
    x2: plane.sx(4),
    y2: plane.sy(0),
    stroke: 'var(--pink)',
    'stroke-dasharray': '5 4',
    'stroke-width': 1.8,
  });
  const asymptoteText = s('text', {
    x: plane.sx(3.7),
    y: plane.sy(0) - 8,
    class: 'exp-svg-label',
    fill: 'var(--pink)',
    'font-size': '11px',
    'text-anchor': 'end',
    'font-weight': 'bold',
  }, 'Asíntota y = 0');
  plane.layers.under.append(asymptoteLine, asymptoteText);

  // Mirror tie-line (connecting (x0, y) and (-x0, y))
  const mirrorTie = s('line', {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    stroke: 'var(--accent)',
    'stroke-dasharray': '3 3',
    'stroke-width': 1.5,
    visibility: 'hidden',
  });
  plane.layers.under.append(mirrorTie);

  // Curves
  const curveA = s('path', { fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.5 });
  const curveB = s('path', { fill: 'none', stroke: 'var(--yellow)', 'stroke-width': 2.5 });
  const curveC = s('path', { fill: 'none', stroke: 'var(--green)', 'stroke-width': 2.5, visibility: 'hidden' });
  plane.layers.curve.append(curveA, curveB, curveC);

  // Markers
  const ptA = s('circle', { r: 5.5, fill: 'var(--blue)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const ptB = s('circle', { r: 5.5, fill: 'var(--yellow)', stroke: 'var(--bg)', 'stroke-width': 2 });
  const ptC = s('circle', { r: 5.5, fill: 'var(--green)', stroke: 'var(--bg)', 'stroke-width': 2, visibility: 'hidden' });
  const labelA = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--blue)' }, '');
  const labelB = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--yellow)' }, '');
  const labelC = s('text', { class: 'exp-svg-label', 'font-size': '11px', fill: 'var(--green)', visibility: 'hidden' }, '');

  // Vertical probe line
  const vProbe = s('line', {
    x1: 0,
    y1: plane.sy(-1),
    x2: 0,
    y2: plane.sy(8),
    stroke: 'var(--border)',
    'stroke-dasharray': '3 3',
    'stroke-width': 1.5,
    visibility: 'hidden',
  });

  plane.layers.marks.append(vProbe, ptA, ptB, ptC, labelA, labelB, labelC);

  // 3. Render pipeline
  const render = (state) => {
    updateModeChips(state.mode);
    updateMirrorBaseChips(state.mirrorBase);
    updateDecayMassChips(state.decayMass);
    yearSlider.value = String(state.decayYear);
    probeSlider.value = String(state.probeX);

    // Toggle control visibilities based on mode
    const isMirror = state.mode === 'mirror';
    const isDecay = state.mode === 'decay';
    const isTrio = state.mode === 'trio';

    mirrorBaseGroup.style.display = isMirror ? '' : 'none';
    decayMassGroup.style.display = isDecay ? '' : 'none';
    yearLabel.style.display = isDecay ? '' : 'none';
    probeLabel.style.display = isDecay ? 'none' : '';

    setVisible(curveC, isTrio);
    setVisible(ptC, isTrio);
    setVisible(labelC, isTrio);
    setVisible(mirrorTie, isMirror);
    setVisible(vProbe, !isDecay);

    const rows = [];

    if (isMirror) {
      const a = state.mirrorBase;
      const x = state.probeX;

      // Curve A: a^x (blue)
      curveA.setAttribute('d', plane.fnPath((t) => Math.pow(a, t), -4, 4));
      curveA.setAttribute('stroke', 'var(--blue)');
      // Curve B: (1/a)^x = a^(-x) (yellow)
      curveB.setAttribute('d', plane.fnPath((t) => Math.pow(1 / a, t), -4, 4));
      curveB.setAttribute('stroke', 'var(--yellow)');

      // Points at probe x
      const yA = Math.pow(a, x);
      const yB = Math.pow(1 / a, x);

      const px = plane.sx(x);
      const pNegX = plane.sx(-x);
      const pyA = plane.sy(Math.min(8, yA));
      const pyB = plane.sy(Math.min(8, yB));

      vProbe.setAttribute('x1', String(px));
      vProbe.setAttribute('x2', String(px));

      // Mirror tie: joins (x, yA) on blue curve with (-x, yA) on yellow curve
      mirrorTie.setAttribute('x1', String(px));
      mirrorTie.setAttribute('y1', String(pyA));
      mirrorTie.setAttribute('x2', String(pNegX));
      mirrorTie.setAttribute('y2', String(pyA));

      ptA.setAttribute('cx', String(px));
      ptA.setAttribute('cy', String(pyA));
      labelA.setAttribute('x', String(px + 8));
      labelA.setAttribute('y', String(pyA - 6));
      setText(labelA, `${a}^(${fmt(x)}) = ${fmt(yA)}`);

      ptB.setAttribute('cx', String(px));
      ptB.setAttribute('cy', String(pyB));
      labelB.setAttribute('x', String(px + 8));
      labelB.setAttribute('y', String(pyB + 14));
      setText(labelB, `(1/${a})^(${fmt(x)}) = ${fmt(yB)}`);

      rows.push([
        'Teorema de Reflexión Axial',
        `Al sustituir x por −x: (1/${a})ˣ = (${a}⁻¹)ˣ = ${a}⁻ˣ. Invertir la base equivale geométricamente a reflejar la gráfica respecto al eje Y.`,
      ]);
      rows.push([
        'Asíntota Horizontal y = 0',
        `Cuando x crece hacia +∞, (1/${a})ˣ tiende a cero pero jamás toca la recta. Im = (0; +∞) con paréntesis abierto (nunca corchete cerrado).`,
      ]);
      rows.push([
        'Simetría de Alturas',
        `Para x = ${fmt(x)}: la curva ${a}ˣ tiene altura ${fmt(yA)}, exactamente igual a la altura de (1/${a})ˣ en x = ${fmt(-x)}.`,
      ]);
    } else if (isDecay) {
      // Radioactive decay: 1 kg vs 2 kg
      const t = state.decayYear;
      const show1 = state.decayMass === 1 || state.decayMass === 'both';
      const show2 = state.decayMass === 2 || state.decayMass === 'both';

      // Curve A: 1 * (1/2)^t
      curveA.setAttribute('d', plane.fnPath((val) => Math.pow(0.5, val), -1, 6));
      curveA.setAttribute('stroke', 'var(--blue)');
      setVisible(curveA, show1);

      // Curve B: 2 * (1/2)^t
      curveB.setAttribute('d', plane.fnPath((val) => 2 * Math.pow(0.5, val), -1, 6));
      curveB.setAttribute('stroke', 'var(--yellow)');
      setVisible(curveB, show2);

      const ptT = plane.sx(t);
      const m1 = Math.pow(0.5, t);
      const m2 = 2 * Math.pow(0.5, t);

      if (show1) {
        setVisible(ptA, true);
        setVisible(labelA, true);
        const py1 = plane.sy(m1);
        ptA.setAttribute('cx', String(ptT));
        ptA.setAttribute('cy', String(py1));
        labelA.setAttribute('x', String(ptT + 8));
        labelA.setAttribute('y', String(py1 - 6));
        setText(labelA, `1kg: ${fmt(m1)} kg`);
      } else {
        setVisible(ptA, false);
        setVisible(labelA, false);
      }

      if (show2) {
        setVisible(ptB, true);
        setVisible(labelB, true);
        const py2 = plane.sy(m2);
        ptB.setAttribute('cx', String(ptT));
        ptB.setAttribute('cy', String(py2));
        labelB.setAttribute('x', String(ptT + 8));
        labelB.setAttribute('y', String(py2 - 6));
        setText(labelB, `2kg: ${fmt(m2)} kg`);
      } else {
        setVisible(ptB, false);
        setVisible(labelB, false);
      }

      rows.push([
        'Desintegración al 50% Anual',
        `M₁(t) = (1/2)ᵗ y M₂(t) = 2 · (1/2)ᵗ = (1/2)ᵗ⁻¹. El cultivo de 2 kg tarda exactamente 1 año más en alcanzar la masa del cultivo de 1 kg.`,
      ]);
      rows.push([
        `Masa remanente a los ${t} años`,
        `1 kg inicial: ${fmt(m1)} kg (${fmt(m1 * 100)}%) | 2 kg inicial: ${fmt(m2)} kg (${fmt(m2 * 50)}% de su masa inicial).`,
      ]);
      rows.push([
        'Vida Media T = 1 año',
        'Cada año que transcurre, la masa restante se divide a la mitad: 1 -> 0,5 -> 0,25 -> 0,125...',
      ]);
    } else {
      // Trio: 2^x (blue), e^x (green), 3^x (yellow)
      const x = state.probeX;

      curveA.setAttribute('d', plane.fnPath((val) => Math.pow(2, val), -4, 4));
      curveA.setAttribute('stroke', 'var(--blue)');
      curveB.setAttribute('d', plane.fnPath((val) => Math.pow(3, val), -4, 4));
      curveB.setAttribute('stroke', 'var(--yellow)');
      curveC.setAttribute('d', plane.fnPath((val) => Math.pow(Math.E, val), -4, 4));
      curveC.setAttribute('stroke', 'var(--green)');

      const px = plane.sx(x);
      const y2 = Math.pow(2, x);
      const ye = Math.pow(Math.E, x);
      const y3 = Math.pow(3, x);

      vProbe.setAttribute('x1', String(px));
      vProbe.setAttribute('x2', String(px));

      const py2 = plane.sy(Math.min(8, y2));
      const pye = plane.sy(Math.min(8, ye));
      const py3 = plane.sy(Math.min(8, y3));

      ptA.setAttribute('cx', String(px));
      ptA.setAttribute('cy', String(py2));
      labelA.setAttribute('x', String(px + 8));
      labelA.setAttribute('y', String(py2 + 12));
      setText(labelA, `2ˣ = ${fmt(y2)}`);

      ptC.setAttribute('cx', String(px));
      ptC.setAttribute('cy', String(pye));
      labelC.setAttribute('x', String(px + 8));
      labelC.setAttribute('y', String(pye - 6));
      setText(labelC, `eˣ = ${fmt(ye)}`);

      ptB.setAttribute('cx', String(px));
      ptB.setAttribute('cy', String(py3));
      labelB.setAttribute('x', String(px + 8));
      labelB.setAttribute('y', String(py3 - 6));
      setText(labelB, `3ˣ = ${fmt(y3)}`);

      rows.push([
        'Decaimiento Rápido al 25%',
        'Comparación de las tres curvas canónicas: 2ˣ (azul), eˣ ≈ 2,718ˣ (verde) y 3ˣ (amarillo).',
      ]);

      if (x > 0) {
        rows.push([
          `Para x = ${fmt(x)} > 0: Orden 3ˣ > eˣ > 2ˣ`,
          `Como 3 > e > 2, las bases más grandes crecen más empinadas hacia la derecha: ${fmt(y3)} > ${fmt(ye)} > ${fmt(y2)}.`,
        ]);
      } else if (x === 0) {
        rows.push([
          'En x = 0: Intersección Universal (0; 1)',
          '2⁰ = e⁰ = 3⁰ = 1. Todas las curvas exponenciales sin desplazamiento vertical u horizontal se cortan en (0; 1).',
        ]);
      } else {
        rows.push([
          `Para x = ${fmt(x)} < 0: ¡Inversión de Orden! 2ˣ > eˣ > 3ˣ`,
          `Como los exponentes son negativos, las bases se invierten: 1/2 > 1/e > 1/3 (0,5 > 0,368 > 0,333). ¡Hacia la izquierda, las bases menores quedan por ARRIBA!`,
        ]);
      }
    }

    renderReadout(board.readout, 'Análisis de Espejo, Decaimiento y Crecimiento', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ mode: 'mirror', mirrorBase: 2, decayMass: 'both', decayYear: 2, probeX: 1 }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initEspejoBaseWidget };
