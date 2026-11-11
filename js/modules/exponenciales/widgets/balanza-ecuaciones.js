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
  createPredictBox,
} from './board-kit.js';

function toSuperscripts(str) {
  if (!str) return '';
  const SUP = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'x': 'ˣ', 'u': 'ᵘ', 'n': 'ⁿ', 't': 'ᵗ'
  };
  let res = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '^') {
      let exp = '';
      if (str[i + 1] === '(') {
        let depth = 1;
        let j = i + 2;
        while (j < str.length && depth > 0) {
          if (str[j] === '(') depth++;
          else if (str[j] === ')') depth--;
          if (depth > 0) exp += str[j];
          j++;
        }
        i = j - 1;
      } else {
        let j = i + 1;
        while (j < str.length && /[0-9a-z+\-−]/i.test(str[j])) {
          exp += str[j];
          j++;
        }
        i = j - 1;
      }
      res += exp
        .replace(/\s+/g, '')
        .split('')
        .map((ch) => SUP[ch] || ch)
        .join('');
    } else {
      res += str[i];
    }
  }
  return res;
}

const METHODS = [
  ['equal_base', '1. Igualación de Bases'],
  ['common_factor', '2. Factor Común'],
  ['quadratic_sub', '3. Sustitución Cuadrática (u > 0)'],
];

const EQUATIONS = {
  equal_base: [
    {
      id: 'ej12a',
      title: '2^(3x+1) : 16^(x−4) = 1',
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
      title: '4 · 2ˣ = 8ˣ',
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
    {
      id: 'contrast_prod',
      title: '2^(x+1) · 2ˣ = 32 (Contraste: Producto)',
      steps: [
        { lhs: '2^(x + 1) · 2ˣ', rhs: '32', rule: 'Ecuación original. Hay un PRODUCTO (·) de potencias de igual base 2.' },
        { lhs: '2^(x + 1 + x)', rhs: '2⁵', rule: 'En un producto de igual base se SUMAN exponentes: (x+1) + x = 2x+1. 32 = 2⁵.' },
        { lhs: '2^(2x + 1)', rhs: '2⁵', rule: 'Bases idénticas igualadas: 2^(2x+1) = 2⁵.' },
        { lhs: '2x + 1', rhs: '5', rule: 'Por inyectividad de la base 2 en ℝ, igualamos exponentes: 2x + 1 = 5.' },
        { lhs: 'x', rhs: '2', rule: '¡Solución única! S = { 2 }. (Contraste: en una suma 2^(x+1) + 2ˣ = 24 NO se suman exponentes, se saca factor común).' },
      ],
      solution: 'S = { 2 }',
    },
  ],
  common_factor: [
    {
      id: 'ej8h',
      title: '2^(x+1) + 2ˣ = 12',
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
    {
      id: 'contrast_sum',
      title: '2^(x+1) + 2ˣ = 24 (Contraste: Suma)',
      steps: [
        { lhs: '2^(x + 1) + 2ˣ', rhs: '24', rule: 'Ecuación original. Hay una SUMA (+) entre potencias: NO se pueden sumar exponentes.' },
        { lhs: '2ˣ · 2¹ + 2ˣ · 1', rhs: '24', rule: 'Descomponemos 2^(x+1) = 2ˣ · 2¹ y extraemos 2ˣ como factor común.' },
        { lhs: '2ˣ · (2 + 1)', rhs: '24', rule: 'Sumamos los coeficientes: 2 + 1 = 3 ⟹ 2ˣ · 3 = 24.' },
        { lhs: '2ˣ', rhs: '8 = 2³', rule: 'Dividimos ambos miembros por 3: 2ˣ = 8 = 2³.' },
        { lhs: 'x', rhs: '3', rule: '¡Solución única! S = { 3 }. (Contraste: en un producto 2^(x+1) · 2ˣ = 32 se suman exponentes dando x = 2).' },
      ],
      solution: 'S = { 3 }',
    },
  ],
  quadratic_sub: [
    {
      id: 'discard_trap',
      title: '2^(2x) − 3 · 2ˣ − 4 = 0',
      steps: [
        {
          lhs: '(2ˣ)² − 3 · (2ˣ) − 4',
          rhs: '0',
          rule: 'Notamos la estructura cuadrática con (2ˣ)² y 2ˣ.',
        },
        {
          lhs: 'u² − 3u − 4 = 0',
          rhs: 'con u = 2ˣ > 0',
          rule: 'Sustitución de variable u = 2ˣ. ¡Condición obligatoria: u DEBE ser > 0!',
        },
        {
          lhs: '(u − 4)(u + 1)',
          rhs: '0',
          rule: 'Factorizamos la resolvente: raíces auxiliares u₁ = 4 y u₂ = −1.',
        },
        {
          lhs: 'u₁ = 4 (válido) | u₂ = −1',
          rhs: '¡u₂ DESCARTADO!',
          rule: '¡ATENCIÓN! u₂ = −1 ≤ 0 se descarta obligatoriamente: 2ˣ = −1 carece de solución en ℝ.',
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
      title: '3^(2x) − 4 · 3^(x+1) : 9 + 1/3 = 0',
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
    {
      id: 'case3_no_roots',
      title: '2^(2x) + 3 · 2ˣ + 2 = 0 (Caso 3: Ninguna u > 0, S = ∅)',
      steps: [
        { lhs: '(2ˣ)² + 3 · (2ˣ) + 2', rhs: '0', rule: 'Estructura cuadrática con u = 2ˣ > 0 estricto en ℝ.' },
        { lhs: 'u² + 3u + 2 = 0', rhs: 'con u = 2ˣ > 0', rule: 'Factorizamos: (u + 1)(u + 2) = 0 ⟹ u₁ = −1 y u₂ = −2.' },
        { lhs: 'u₁ = −1 ≤ 0 | u₂ = −2 ≤ 0', rhs: '¡AMBAS DESCARTADAS!', rule: 'Como 2ˣ > 0 para todo x ∈ ℝ, ni 2ˣ = −1 ni 2ˣ = −2 tienen solución real.' },
        { lhs: 'Solución en ℝ', rhs: 'S = ∅ (vacío)', rule: '¡Ninguna raíz auxiliar sobrevive! La ecuación carece de soluciones reales: S = ∅.' },
      ],
      solution: 'S = ∅',
    },
    {
      id: 'case4_null_root',
      title: '2^(2x) − 4 · 2ˣ = 0 (Caso 4: Raíz u = 0 descartada)',
      steps: [
        { lhs: '(2ˣ)² − 4 · (2ˣ)', rhs: '0', rule: 'Ecuación cuadrática sin término independiente: factorizamos u.' },
        { lhs: 'u² − 4u = 0', rhs: 'con u = 2ˣ > 0', rule: 'u(u − 4) = 0 ⟹ u₁ = 4 y u₂ = 0.' },
        { lhs: 'u₁ = 4 (válido) | u₂ = 0', rhs: '¡u₂ = 0 DESCARTADO!', rule: '¡Atención! 2ˣ jamás es igual a 0 en ℝ (la asíntota y = 0 no se toca): u = 0 se descarta.' },
        { lhs: '2ˣ = 4 = 2²', rhs: 'x = 2', rule: 'Solo sobrevive u₁ = 4 ⟹ 2ˣ = 4 ⟹ x = 2.' },
      ],
      solution: 'S = { 2 }',
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

  // 0. Predict-Observe-Explain
  const predictBox = createPredictBox({
    prompt: 'Si al aplicar sustitución u = 3ˣ obtenés u₁ = 9 y u₂ = −3, ¿cuál es el conjunto solución S?',
    options: [
      {
        label: 'S = { 2 } (se descarta u₂ = −3 porque 3ˣ > 0 siempre en ℝ)',
        correct: true,
        explanation: '¡Exacto! 3ˣ nunca puede ser negativo ni cero en ℝ. La rama 3ˣ = −3 carece de solución real; sólo sobrevive u = 9 = 3² ⟹ x = 2.',
      },
      {
        label: 'S = { 2; −1 } (asumiendo que 3⁻¹ = −3)',
        correct: false,
        explanation: '¡Cuidado! 3⁻¹ = 1/3, jamás un número negativo. La función exponencial con base positiva nunca corta ni cruza el eje horizontal.',
      },
      {
        label: 'S = ∅ (se anula toda la ecuación si una raíz auxiliar da negativa)',
        correct: false,
        explanation: 'No, que una raíz auxiliar quede fuera de Im(f) = (0; +∞) sólo anula a esa rama particular, no a la solución positiva u = 9.',
      },
    ],
    onVerify: () => {
      store.set({ method: 'quadratic_sub', eqIndex: 0, step: 3, tiltTrap: false });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controls
  const updateMethodChips = addChips(
    board.controls,
    METHODS,
    store.get().method,
    (m) => {
      predictBox.notifyInteraction();
      store.set({ method: m, eqIndex: 0, step: 0, tiltTrap: false });
    },
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
                predictBox.notifyInteraction();
                store.set({ eqIndex: idx, step: 0, tiltTrap: false });
              },
            },
          },
          toSuperscripts(eq.title),
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
  const prevBtn = button('Paso anterior', null, () => {
    predictBox.notifyInteraction();
    const curStep = store.get().step;
    if (curStep > 0) store.set({ step: curStep - 1, tiltTrap: false });
  });

  const nextBtn = button('Siguiente paso', null, () => {
    predictBox.notifyInteraction();
    const eqList = EQUATIONS[store.get().method];
    const eq = eqList[store.get().eqIndex];
    const curStep = store.get().step;
    if (curStep < eq.steps.length - 1) {
      store.set({ step: curStep + 1, tiltTrap: false });
    }
  });

  const restartBtn = button('', 'reset', () => {
    predictBox.notifyInteraction();
    store.set({ step: 0, tiltTrap: false });
  }, 'chip chip--icon-only', { title: 'Reiniciar paso a paso', 'aria-label': 'Reiniciar paso a paso' });

  const trapTriggerBtn = button('¿Y si acepto u = −1?', 'hint', () => {
    predictBox.notifyInteraction();
    store.set({ tiltTrap: !store.get().tiltTrap });
  });

  board.actions.append(prevBtn, nextBtn, restartBtn, trapTriggerBtn);

  // 2. SVG Balance Scale Scene
  const scene = board.drawing;

  const fulcrumX = 320;
  const fulcrumY = 175;
  const beamLength = 320; // total width of beam: widened to prevent pan text overlap with center

  // Balance Base & Pedestal
  scene.append(
    // Base platform
    s('polygon', {
      points: `${fulcrumX - 45},${fulcrumY + 115} ${fulcrumX + 45},${fulcrumY + 115} ${fulcrumX + 35},${fulcrumY + 105} ${fulcrumX - 35},${fulcrumY + 105}`,
      fill: 'var(--muted, #a7b8ae)',
      stroke: 'var(--accent, var(--yellow))',
      'stroke-width': 1.5,
      opacity: 0.85,
    }),
    // Vertical column
    s('rect', {
      x: fulcrumX - 6,
      y: fulcrumY,
      width: 12,
      height: 105,
      fill: 'var(--muted, #a7b8ae)',
      stroke: 'var(--border, rgba(236, 242, 232, 0.28))',
      'stroke-width': 1,
      rx: 3,
      opacity: 0.9,
    }),
    // Center pivot jewel
    s('circle', {
      cx: fulcrumX,
      cy: fulcrumY,
      r: 9,
      fill: 'var(--accent, var(--yellow))',
      stroke: 'var(--bg, #1c2024)',
      'stroke-width': 2.5,
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
    stroke: 'var(--accent, var(--yellow))',
    'stroke-width': 4.5,
    'stroke-linecap': 'round',
  });
  beamGroup.append(crossBeam);

  // Left Pan Assembly
  const leftX = fulcrumX - beamLength / 2;
  const leftPanGroup = s('g', { class: 'exp-left-pan' });
  const leftChainL = s('line', { x1: leftX, y1: fulcrumY, x2: leftX - 55, y2: fulcrumY + 65, stroke: 'var(--muted, #a7b8ae)', 'stroke-width': 1.5, opacity: 0.8 });
  const leftChainR = s('line', { x1: leftX, y1: fulcrumY, x2: leftX + 55, y2: fulcrumY + 65, stroke: 'var(--muted, #a7b8ae)', 'stroke-width': 1.5, opacity: 0.8 });
  const leftDish = s('path', {
    d: `M ${leftX - 65} ${fulcrumY + 65} Q ${leftX} ${fulcrumY + 88} ${leftX + 65} ${fulcrumY + 65}`,
    fill: 'rgba(230, 211, 138, 0.12)',
    stroke: 'var(--accent, var(--yellow))',
    'stroke-width': 2.5,
  });
  const leftText = s('text', {
    x: leftX,
    y: fulcrumY + 54,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '14.5px',
    'font-weight': 'bold',
    fill: 'var(--blue)',
  }, '');
  leftPanGroup.append(leftChainL, leftChainR, leftDish, leftText);
  scene.append(leftPanGroup);

  // Right Pan Assembly
  const rightX = fulcrumX + beamLength / 2;
  const rightPanGroup = s('g', { class: 'exp-right-pan' });
  const rightChainL = s('line', { x1: rightX, y1: fulcrumY, x2: rightX - 55, y2: fulcrumY + 65, stroke: 'var(--muted, #a7b8ae)', 'stroke-width': 1.5, opacity: 0.8 });
  const rightChainR = s('line', { x1: rightX, y1: fulcrumY, x2: rightX + 55, y2: fulcrumY + 65, stroke: 'var(--muted, #a7b8ae)', 'stroke-width': 1.5, opacity: 0.8 });
  const rightDish = s('path', {
    d: `M ${rightX - 65} ${fulcrumY + 65} Q ${rightX} ${fulcrumY + 88} ${rightX + 65} ${fulcrumY + 65}`,
    fill: 'rgba(230, 211, 138, 0.12)',
    stroke: 'var(--accent, var(--yellow))',
    'stroke-width': 2.5,
  });
  const rightText = s('text', {
    x: rightX,
    y: fulcrumY + 54,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '14.5px',
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
    'font-size': '15px',
    'font-weight': 'bold',
    fill: 'var(--accent, var(--yellow))',
  }, '');
  scene.append(titleText);

  // Step Progress Badge
  const stepBadge = s('text', {
    x: fulcrumX,
    y: 58,
    class: 'exp-svg-label',
    'text-anchor': 'middle',
    'font-size': '12.5px',
    fill: 'var(--text-muted, #a7b8ae)',
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
    const leftStr = isTilted ? '2ˣ = −1' : toSuperscripts(stepData.lhs);
    const rightStr = isTilted ? '¡Imposible!' : toSuperscripts(stepData.rhs);
    setText(leftText, leftStr);
    setText(rightText, rightStr);

    const calcFontSize = (str) => {
      if (str.length > 22) return '11px';
      if (str.length > 16) return '12.5px';
      return '14.5px';
    };
    leftText.setAttribute('font-size', calcFontSize(leftStr));
    rightText.setAttribute('font-size', calcFontSize(rightStr));

    setText(equalBadge, isTilted ? '≠' : '=');
    equalBadge.setAttribute('fill', isTilted ? 'var(--pink)' : 'var(--green)');

    setText(titleText, toSuperscripts(eq.title));
    setText(stepBadge, `Paso ${step + 1} de ${eq.steps.length}`);

    // Update buttons state
    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === eq.steps.length - 1;

    // Readout rows
    const rows = [
      ['Método Aplicado', `${METHODS.find((m) => m[0] === state.method)[1]}`],
      [`Paso ${step + 1}: Transformación Algebraica`, toSuperscripts(stepData.rule)],
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
