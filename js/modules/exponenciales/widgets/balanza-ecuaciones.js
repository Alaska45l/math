/**
 * balanza-ecuaciones.js — Widget 10 (F22)
 * Balanza algebraica interactiva con los 3 métodos de ecuaciones en ℝ sin logaritmos:
 * 1. Igualación de bases (inyectividad en ℝ)
 * 2. Extracción de factor común
 * 3. Sustitución cuadrática (u = aˣ > 0) con descarte estricto de raíces no positivas.
 */

import {
  createBoard,
  createStore,
  addChips,
  button,
  renderReadout,
  h,
  s,
  setText,
  setVisible,
} from './board-kit.js';

const METHODS = [
  ['equal_base', '1. Igualación de Bases'],
  ['common_factor', '2. Factor Común'],
  ['quadratic_sub', '3. Sustitución Cuadrática (u > 0)'],
];

const EQUATIONS = {
  equal_base: [
    {
      id: 'ej12a',
      title: 'Ej. 12a: 2^(3x+1) : 16^(x−4) = 1',
      steps: [
        {
          lhs: '2^(3x + 1) : 16^(x − 4)',
          rhs: '1',
          rule: 'Ecuación original. Buscamos expresar todos los términos en base 2.',
        },
        {
          lhs: '2^(3x + 1) : (2⁴)^(x − 4)',
          rhs: '2⁰',
          rule: 'Escribimos 16 = 2⁴ y 1 = 2⁰. Potencia de potencia: (2⁴)^(x−4) = 2^(4x − 16).',
        },
        {
          lhs: '2^((3x + 1) − (4x − 16))',
          rhs: '2⁰',
          rule: 'Cociente de potencias de igual base: se restan los exponentes con paréntesis obligatorios.',
        },
        {
          lhs: '(3x + 1) − (4x − 16)',
          rhs: '0',
          rule: 'Igualación de exponentes por inyectividad de la base 2: f(u) = f(v) ⟹ u = v.',
        },
        {
          lhs: '3x + 1 − 4x + 16',
          rhs: '0',
          rule: 'Distribuimos el signo menos: −(4x − 16) = −4x + 16. Simplificamos: −x + 17 = 0.',
        },
        {
          lhs: 'x',
          rhs: '17',
          rule: '¡Solución única alcanzada! Conjunto solución S = { 17 }.',
        },
      ],
      solution: 'S = { 17 }',
    },
    {
      id: 'eq_simple',
      title: 'Exactas: 4 · 2ˣ = 8ˣ',
      steps: [
        {
          lhs: '4 · 2ˣ',
          rhs: '8ˣ',
          rule: 'Ecuación original. Expresamos 4 y 8 como potencias de 2.',
        },
        {
          lhs: '2² · 2ˣ',
          rhs: '(2³)ˣ',
          rule: '4 = 2² y 8 = 2³. Aplicamos producto y potencia de potencia.',
        },
        {
          lhs: '2^(x + 2)',
          rhs: '2^(3x)',
          rule: 'Bases idénticas a ambos lados: 2^(x+2) = 2^(3x).',
        },
        {
          lhs: 'x + 2',
          rhs: '3x',
          rule: 'Igualamos exponentes: x + 2 = 3x ⟹ 2 = 2x.',
        },
        {
          lhs: 'x',
          rhs: '1',
          rule: '¡Despeje completo! Conjunto solución S = { 1 }.',
        },
      ],
      solution: 'S = { 1 }',
    },
  ],
  common_factor: [
    {
      id: 'ej8h',
      title: 'Ej. 8h: 2^(x+1) + 2ˣ = 12',
      steps: [
        {
          lhs: '2^(x + 1) + 2ˣ',
          rhs: '12',
          rule: 'Ecuación original. Descomponemos 2^(x+1) = 2ˣ · 2¹ para extraer factor común.',
        },
        {
          lhs: '2ˣ · 2¹ + 2ˣ · 1',
          rhs: '12',
          rule: 'Extraemos 2ˣ como factor común de la suma.',
        },
        {
          lhs: '2ˣ · (2 + 1)',
          rhs: '12',
          rule: 'Sumamos los coeficientes numéricos dentro del paréntesis: 2 + 1 = 3.',
        },
        {
          lhs: '2ˣ · 3',
          rhs: '12',
          rule: 'Dividimos ambos miembros por 3: 2ˣ = 12 / 3 = 4.',
        },
        {
          lhs: '2ˣ',
          rhs: '4 = 2²',
          rule: 'Escribimos 4 en base 2: 2ˣ = 2².',
        },
        {
          lhs: 'x',
          rhs: '2',
          rule: '¡Solución única! Conjunto solución S = { 2 }.',
        },
      ],
      solution: 'S = { 2 }',
    },
  ],
  quadratic_sub: [
    {
      id: 'discard_trap',
      title: 'Parcial: 2^(2x) − 3 · 2ˣ − 4 = 0',
      steps: [
        {
          lhs: '(2ˣ)² − 3 · (2ˣ) − 4',
          rhs: '0',
          rule: 'Notamos la estructura cuadrática con (2ˣ)² y 2ˣ.',
        },
        {
          lhs: 'u² − 3u − 4 = 0',
          rhs: 'con u = 2ˣ > 0',
          rule: 'Sustitución de variable u = 2ˣ. ¡Condición obligatoria de cátedra: u DEBE ser > 0!',
        },
        {
          lhs: '(u − 4)(u + 1)',
          rhs: '0',
          rule: 'Factorizamos la resolvente: raíces auxiliares u₁ = 4 y u₂ = −1.',
        },
        {
          lhs: 'u₁ = 4 (válido) | u₂ = −1',
          rhs: '¡u₂ DESCARTADO!',
          rule: '¡ATENCIÓN DE EXAMEN! u₂ = −1 ≤ 0 se descarta obligatoriamente: 2ˣ = −1 carece de solución en ℝ.',
        },
        {
          lhs: '2ˣ = 4 = 2²',
          rhs: 'x = 2',
          rule: 'Retornamos a la variable original solo con la raíz positiva: 2ˣ = 4 ⟹ x = 2.',
        },
      ],
      solution: 'S = { 2 }',
      trapNote: 'Si hubieras aceptado u = −1, habrías intentado resolver 2ˣ = −1, lo cual es imposible en ℝ (2ˣ > 0 siempre).',
    },
    {
      id: 'ej8i',
      title: 'Ej. 8i: 3^(2x) − 4 · 3^(x+1) : 9 + 1/3 = 0',
      steps: [
        {
          lhs: '3^(2x) − (4/3) · 3ˣ + 1/3',
          rhs: '0',
          rule: 'Simplificamos 4 · 3^(x+1) : 9 = 4 · 3ˣ · 3 : 9 = (4/3) · 3ˣ.',
        },
        {
          lhs: '3 · (3ˣ)² − 4 · (3ˣ) + 1',
          rhs: '0',
          rule: 'Multiplicamos toda la ecuación por 3 para eliminar denominadores.',
        },
        {
          lhs: '3u² − 4u + 1 = 0',
          rhs: 'con u = 3ˣ > 0',
          rule: 'Sustitución u = 3ˣ > 0. Resolvente cuadrática: u = (4 ± √(16 − 12)) / 6.',
        },
        {
          lhs: 'u₁ = 1 (positivo) | u₂ = 1/3 (positivo)',
          rhs: 'Ambas raíces válidas',
          rule: 'Como 1 > 0 y 1/3 > 0, ambas soluciones son legítimas en ℝ.',
        },
        {
          lhs: '3ˣ = 1 ⟹ x = 0 | 3ˣ = 3⁻¹ ⟹ x = −1',
          rhs: 'S = { −1; 0 }',
          rule: '¡Dos soluciones reales verificadas! Conjunto solución S = { −1; 0 }.',
        },
      ],
      solution: 'S = { −1; 0 }',
    },
  ],
};

export function initWidget(container, options = {}) {
  const board = createBoard(container, 'Balanza de Ecuaciones Exponenciales', '0 0 640 340');

  const defaultMethod = options.method || 'equal_base';
  const store = createStore({
    method: defaultMethod,
    eqIndex: 0,
    step: 0,
    tiltTrap: false,
  });

  // 1. Controls
  const updateMethodChips = addChips(
    board.controls,
    METHODS,
    store.get().method,
    (m) => store.set({ method: m, eqIndex: 0, step: 0, tiltTrap: false }),
    'Métodos de Resolución en ℝ',
  );

  const eqGroupContainer = h('div', {
    class: 'pr-chip-group balanza-eq-chips',
    role: 'group',
    'aria-label': 'Selección de Ecuación del Método',
  });
  board.controls.append(eqGroupContainer);

  let currentMethodInEqChips = null;
  let eqChipButtons = [];

  const updateEqChips = (method, eqIndex) => {
    const list = EQUATIONS[method] || [];
    if (list.length <= 1) {
      eqGroupContainer.style.display = 'none';
      return;
    }
    eqGroupContainer.style.display = '';
    if (currentMethodInEqChips !== method) {
      currentMethodInEqChips = method;
      eqGroupContainer.replaceChildren();
      eqChipButtons = list.map((eq, idx) => {
        const chip = h(
          'button',
          {
            type: 'button',
            class: `chip ${idx === eqIndex ? 'is-active' : 'chip--ghost'}`,
            'aria-pressed': String(idx === eqIndex),
            on: {
              click: () => {
                store.set({ eqIndex: idx, step: 0, tiltTrap: false });
              },
            },
          },
          eq.title,
        );
        eqGroupContainer.append(chip);
        return chip;
      });
    } else {
      eqChipButtons.forEach((chip, idx) => {
        const isSelected = idx === eqIndex;
        chip.classList.toggle('is-active', isSelected);
        chip.classList.toggle('chip--ghost', !isSelected);
        chip.setAttribute('aria-pressed', String(isSelected));
      });
    }
  };

  // Stepper Controls
  const prevBtn = button('← Paso anterior', null, () => {
    const curStep = store.get().step;
    if (curStep > 0) store.set({ step: curStep - 1, tiltTrap: false });
  });

  const nextBtn = button('Paso siguiente →', null, () => {
    const eqList = EQUATIONS[store.get().method];
    const eq = eqList[store.get().eqIndex];
    const curStep = store.get().step;
    if (curStep < eq.steps.length - 1) {
      store.set({ step: curStep + 1, tiltTrap: false });
    }
  });

  const restartBtn = button('', 'reset', () => {
    store.set({ step: 0, tiltTrap: false });
  }, 'chip chip--icon-only', { title: 'Reiniciar paso a paso', 'aria-label': 'Reiniciar paso a paso' });

  const trapTriggerBtn = button('¿Y si acepto u = −1?', 'hint', () => {
    store.set({ tiltTrap: !store.get().tiltTrap });
  });

  board.actions.append(prevBtn, nextBtn, restartBtn, trapTriggerBtn);

  // 2. SVG Balance Scale Scene
  const scene = board.drawing;

  const fulcrumX = 320;
  const fulcrumY = 175;
  const beamLength = 260; // total width of beam

  // Balance Base & Pedestal
  scene.append(
    // Base platform
    s('polygon', {
      points: `${fulcrumX - 45},${fulcrumY + 115} ${fulcrumX + 45},${fulcrumY + 115} ${fulcrumX + 35},${fulcrumY + 105} ${fulcrumX - 35},${fulcrumY + 105}`,
      fill: 'var(--border)',
    }),
    // Vertical column
    s('rect', {
      x: fulcrumX - 6,
      y: fulcrumY,
      width: 12,
      height: 105,
      fill: 'var(--border)',
      rx: 3,
    }),
    // Center pivot jewel
    s('circle', {
      cx: fulcrumX,
      cy: fulcrumY,
      r: 9,
      fill: 'var(--accent)',
      stroke: 'var(--bg)',
      'stroke-width': 2,
    }),
  );

  // Beam and Pans Container (Rotatable around fulcrum)
  const beamGroup = s('g', { class: 'exp-balance-beam' });
  scene.append(beamGroup);

  // Horizontal Crossbeam
  const crossBeam = s('line', {
    x1: fulcrumX - beamLength / 2,
    y1: fulcrumY,
    x2: fulcrumX + beamLength / 2,
    y2: fulcrumY,
    stroke: 'var(--accent)',
    'stroke-width': 4.5,
    'stroke-linecap': 'round',
  });
  beamGroup.append(crossBeam);

  // Left Pan Assembly
  const leftX = fulcrumX - beamLength / 2;
  const leftPanGroup = s('g', { class: 'exp-left-pan' });
  const leftChainL = s('line', { x1: leftX, y1: fulcrumY, x2: leftX - 45, y2: fulcrumY + 65, stroke: 'var(--border)', 'stroke-width': 1.5 });
  const leftChainR = s('line', { x1: leftX, y1: fulcrumY, x2: leftX + 45, y2: fulcrumY + 65, stroke: 'var(--border)', 'stroke-width': 1.5 });
  const leftDish = s('path', {
    d: `M ${leftX - 55} ${fulcrumY + 65} Q ${leftX} ${fulcrumY + 85} ${leftX + 55} ${fulcrumY + 65}`,
    fill: 'rgba(255, 255, 255, 0.05)',
    stroke: 'var(--accent)',
    'stroke-width': 2.5,
  });
  const leftText = s('text', {
    x: leftX,
    y: fulcrumY + 55,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '12px',
    'font-weight': 'bold',
    fill: 'var(--blue)',
  }, '');
  leftPanGroup.append(leftChainL, leftChainR, leftDish, leftText);
  scene.append(leftPanGroup);

  // Right Pan Assembly
  const rightX = fulcrumX + beamLength / 2;
  const rightPanGroup = s('g', { class: 'exp-right-pan' });
  const rightChainL = s('line', { x1: rightX, y1: fulcrumY, x2: rightX - 45, y2: fulcrumY + 65, stroke: 'var(--border)', 'stroke-width': 1.5 });
  const rightChainR = s('line', { x1: rightX, y1: fulcrumY, x2: rightX + 45, y2: fulcrumY + 65, stroke: 'var(--border)', 'stroke-width': 1.5 });
  const rightDish = s('path', {
    d: `M ${rightX - 55} ${fulcrumY + 65} Q ${rightX} ${fulcrumY + 85} ${rightX + 55} ${fulcrumY + 65}`,
    fill: 'rgba(255, 255, 255, 0.05)',
    stroke: 'var(--accent)',
    'stroke-width': 2.5,
  });
  const rightText = s('text', {
    x: rightX,
    y: fulcrumY + 55,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '12px',
    'font-weight': 'bold',
    fill: 'var(--yellow)',
  }, '');
  rightPanGroup.append(rightChainL, rightChainR, rightDish, rightText);
  scene.append(rightPanGroup);

  // Equal Badge in Center
  const equalBadge = s('text', {
    x: fulcrumX,
    y: fulcrumY + 45,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '24px',
    'font-weight': 'bold',
    fill: 'var(--green)',
  }, '=');
  scene.append(equalBadge);

  // Top Title Banner
  const titleText = s('text', {
    x: fulcrumX,
    y: 35,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '14px',
    'font-weight': 'bold',
    fill: 'var(--accent)',
  }, '');
  scene.append(titleText);

  // Step Progress Badge
  const stepBadge = s('text', {
    x: fulcrumX,
    y: 60,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '12px',
    fill: 'var(--text-muted)',
  }, '');
  scene.append(stepBadge);

  // 3. Render pipeline
  const render = (state) => {
    updateMethodChips(state.method);
    updateEqChips(state.method, state.eqIndex);

    const eqList = EQUATIONS[state.method];
    const eq = eqList[state.eqIndex] || eqList[0];
    const step = Math.min(state.step, eq.steps.length - 1);
    const stepData = eq.steps[step];

    // Visibility of trap button
    const isTrapAvailable = state.method === 'quadratic_sub' && eq.id === 'discard_trap' && step >= 3;
    trapTriggerBtn.style.display = isTrapAvailable ? '' : 'none';

    // Tilt animation or equilibrium
    const isTilted = state.tiltTrap;
    const angle = isTilted ? 18 : 0; // degrees

    beamGroup.setAttribute('transform', `rotate(${angle} ${fulcrumX} ${fulcrumY})`);

    // Position pans according to beam tips
    const rad = (angle * Math.PI) / 180;
    const halfL = beamLength / 2;
    const curLeftX = fulcrumX - halfL * Math.cos(rad);
    const curLeftY = fulcrumY - halfL * Math.sin(rad);
    const curRightX = fulcrumX + halfL * Math.cos(rad);
    const curRightY = fulcrumY + halfL * Math.sin(rad);

    leftPanGroup.setAttribute('transform', `translate(${curLeftX - leftX}, ${curLeftY - fulcrumY})`);
    rightPanGroup.setAttribute('transform', `translate(${curRightX - rightX}, ${curRightY - fulcrumY})`);

    // Pan texts
    setText(leftText, isTilted ? '2ˣ = −1' : stepData.lhs);
    setText(rightText, isTilted ? '¡Imposible!' : stepData.rhs);
    setText(equalBadge, isTilted ? '≠' : '=');
    equalBadge.setAttribute('fill', isTilted ? 'var(--pink)' : 'var(--green)');

    setText(titleText, eq.title);
    setText(stepBadge, `Paso ${step + 1} de ${eq.steps.length}`);

    // Update buttons state
    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === eq.steps.length - 1;

    // Readout rows
    const rows = [
      ['Método Aplicado', `${METHODS.find((m) => m[0] === state.method)[1]}`],
      [`Paso ${step + 1}: Transformación Algebraica`, stepData.rule],
      [
        'Estado de la Balanza',
        isTilted
          ? '¡DESBALANCE TOTAL! Aceptar u = −1 implica resolver 2ˣ = −1. Como 2ˣ > 0 para todo x ∈ ℝ, no existe exponente real que dé un resultado negativo. La raíz se descarta obligatoriamente.'
          : step === eq.steps.length - 1
          ? `¡Ecuación resuelta con éxito! Solución final: ${eq.solution}.`
          : 'La balanza se mantiene en equilibrio horizontal: cada operación se aplica rigurosamente a ambos miembros.',
      ],
    ];

    renderReadout(board.readout, 'Demostración Paso a Paso sin Logaritmos', rows);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ method: 'equal_base', eqIndex: 0, step: 0, tiltTrap: false }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initBalanzaEcuacionesWidget };
