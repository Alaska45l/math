/**
 * balanza-logaritmica.js — Widget 3 (sec-3)
 * Balanza algebraica paso a paso para:
 * 1. Ecuaciones logarítmicas con filtro de dominio (descartando x <= 0 en arg, conservando u < 0 en u = log_a x)
 * 2. Exponenciales no comunes (4^x = 9, e^(2x) - e^x - 6 = 0 descartando u <= 0)
 * 3. Sistemas logarítmicos 2x2
 * Incluye botón "¿Y si acepto la raíz extraña?" con inclinación física de la balanza.
 */

import {
  createBoard,
  createPredictBox,
  createStore,
  addChips,
  button,
  chalkIcon,
  renderReadout,
  s,
  setText,
} from './board-kit.js';

const FAMILIES = [
  ['log_filter', '1. Ecuaciones Logarítmicas'],
  ['exp_non_common', '2. Exponenciales No Comunes'],
  ['systems_2x2', '3. Sistemas 2×2'],
];

const CASES = {
  log_filter: [
    {
      id: 'eq_domain_filter',
      label: 'log₂(x+1) + log₂(x−2) = log₂(4)',
      domainNote: 'Condición previa: x + 1 > 0 ∧ x − 2 > 0 ⇒ x > 2',
      hasTrap: true,
      trapPanText: 'log₂(−1) ∉ ℝ',
      trapText: '¡Colapso! Si x = −2 ⇒ log₂(−1) + log₂(−4) ∉ ℝ (argumentos negativos).',
      steps: [
        { lhs: 'log₂(x+1) + log₂(x−2)', rhs: 'log₂(4)', note: 'Aduana previa: x + 1 > 0 ∧ x − 2 > 0 ⇒ x > 2.' },
        { lhs: 'log₂((x+1)(x−2))', rhs: 'log₂(4)', note: 'Propiedad del producto en base 2.' },
        { lhs: 'x² − x − 2', rhs: '4', note: 'Inyectividad del logaritmo: igualamos argumentos.' },
        { lhs: 'x² − x − 6 = 0', rhs: 'x₁ = 3, x₂ = −2', note: 'La cuadrática arroja dos candidatas algebraicas.' },
        { lhs: 'Control x > 2', rhs: 'S = { 3 }', note: 'x = 3 cumple (4 > 0 y 1 > 0); x = −2 se descarta por negativizar argumentos.' },
      ],
    },
    {
      id: 'eq_quad_sub_log',
      label: '(log₃(x−1))² + log₃(x−1) = 6',
      domainNote: 'Condición previa: x − 1 > 0 ⇒ x > 1 (u = log₃(x−1) ∈ ℝ)',
      hasTrap: false,
      trapPanText: 'u = −3 SÍ vale',
      trapText: '¡Atención! En u = log₃(x−1) ∈ ℝ, u = −3 SÍ genera x = 28/27 > 1.',
      steps: [
        { lhs: '(log₃(x−1))² + log₃(x−1)', rhs: '6', note: 'Condición de existencia: x − 1 > 0 ⇒ x > 1.' },
        { lhs: 'u = log₃(x−1) ∈ ℝ', rhs: 'u² + u − 6 = 0', note: 'La imagen del logaritmo es todo ℝ: u puede ser negativo.' },
        { lhs: 'Raíces auxiliares', rhs: 'u₁ = 2, u₂ = −3', note: '¡No descartes u = −3! Ambas pertenecen a la imagen de log₃.' },
        { lhs: 'x − 1 = 3²  ∨  3⁻³', rhs: 'S = { 28/27; 10 }', note: 'Ambas verifican x > 1: x = 10 y x = 28/27 son válidas.' },
      ],
    },
  ],
  exp_non_common: [
    {
      id: 'exp_4_9',
      label: '4ˣ = 9 (Bases no comunes)',
      domainNote: 'Dominio: x ∈ ℝ (aplicamos logaritmo para bajar el exponente)',
      hasTrap: false,
      trapPanText: 'x ≈ 1,585',
      trapText: 'x = ln(9)/ln(4) ≈ 1,585 porque 4^1,585 ≈ 9.',
      steps: [
        { lhs: '4ˣ', rhs: '9', note: '9 no es potencia racional inmediata de 4: usamos logaritmos.' },
        { lhs: 'ln(4ˣ)', rhs: 'ln(9)', note: 'Aplicamos logaritmo natural (o decimal) a ambos miembros.' },
        { lhs: 'x · ln(4)', rhs: 'ln(9)', note: 'Propiedad de potencia del argumento: baja el exponente x.' },
        { lhs: 'x = ln(9)/ln(4)', rhs: 'S = { log₄(9) }', note: 'Valor aproximado: x ≈ 1,58.' },
      ],
    },
    {
      id: 'exp_quad_e',
      label: 'e²ˣ − eˣ − 6 = 0',
      domainNote: 'Sustitución u = eˣ > 0 (descarta u ≤ 0)',
      hasTrap: true,
      trapPanText: 'eˣ = −2 ∉ ℝ',
      trapText: '¡Imposible! eˣ = −2 no tiene solución real porque eˣ > 0 siempre.',
      steps: [
        { lhs: 'e²ˣ − eˣ − 6', rhs: '0', note: 'Sustituimos u = eˣ con restricción obligatoria u > 0.' },
        { lhs: 'u² − u − 6', rhs: '0', note: 'Resolvemos la cuadrática auxiliar en u.' },
        { lhs: 'Raíces auxiliares', rhs: 'u₁ = 3, u₂ = −2', note: 'Descartamos u₂ = −2 ≤ 0 porque eˣ > 0 en todo ℝ.' },
        { lhs: 'eˣ = 3', rhs: 'S = { ln(3) }', note: 'Única solución real: x = ln(3) ≈ 1,10.' },
      ],
    },
  ],
  systems_2x2: [
    {
      id: 'sys_linear_logs',
      label: '2log(x) + log(y) = 0 ∧ log(x) − log(y) = −3',
      domainNote: 'Condición previa: x > 0 ∧ y > 0',
      hasTrap: false,
      trapPanText: 'x > 0 ∧ y > 0',
      trapText: 'Controlá x > 0 e y > 0 antes de aceptar el par solución.',
      steps: [
        { lhs: '2u + v = 0', rhs: 'u − v = −3', note: 'Condición: x > 0, y > 0. Sustituimos u = log(x), v = log(y).' },
        { lhs: '3u = −3', rhs: 'u = −1, v = 2', note: 'Sumando ambas ecuaciones despejamos u y luego v.' },
        { lhs: 'x = 10⁻¹, y = 10²', rhs: 'S = { (1/10; 100) }', note: 'Ambas coordenadas positivas verifican el sistema.' },
      ],
    },
    {
      id: 'sys_diff_ratio',
      label: 'x − y = 25 ∧ log(x) − log(y) = 1',
      domainNote: 'Condición previa: x > 0 ∧ y > 0',
      hasTrap: false,
      trapPanText: 'x > 0 ∧ y > 0',
      trapText: 'El cociente exige x > 0 e y > 0.',
      steps: [
        { lhs: 'log(x / y)', rhs: '1', note: 'Existencia: x > 0, y > 0. Unificamos la resta como cociente.' },
        { lhs: 'x / y = 10¹', rhs: 'x = 10y', note: 'Convertimos el logaritmo decimal a forma exponencial.' },
        { lhs: '10y − y = 25', rhs: 'S = { (250/9; 25/9) }', note: 'y = 25/9 > 0 y x = 250/9 > 0.' },
      ],
    },
  ],
};

export function initWidget(container, options = {}) {
  const board = createBoard(
    container,
    'Balanza Algebraica Logarítmica',
    '0 0 640 340',
  );

  const store = createStore({
    family: options.family || 'log_filter',
    caseIdx: 0,
    stepIdx: 0,
    showTrapTilt: false,
  });

  // 0. POE 2 etapas
  const predictBox = createPredictBox({
    prompt: 'Al resolver log₂(x+1) + log₂(x−2) = log₂(4), obtenemos x₁ = 3 y x₂ = −2. ¿Cuál es el conjunto solución real?',
    options: [
      {
        label: 'S = { 3 } porque x = −2 vuelve negativos los argumentos originales',
        correct: true,
        explanation: '¡Exacto! En x = −2 queda log₂(−1) + log₂(−4), que no existen en ℝ.',
      },
      {
        label: 'S = { −2; 3 } porque ambas satisfacen la ecuación cuadrática',
        correct: false,
        explanation: 'Unir dos logaritmos en producto introduce raíces extrañas: x = −2 falla la aduana del dominio.',
      },
    ],
    onVerify: () => {
      store.set({ family: 'log_filter', caseIdx: 0, stepIdx: 4, showTrapTilt: false });
    },
  });
  board.controls.prepend(predictBox);

  // 1. Controles
  const updateFamChips = addChips(
    board.controls,
    FAMILIES,
    store.get().family,
    (family) => {
      predictBox.notifyInteraction();
      store.set({ family, caseIdx: 0, stepIdx: 0, showTrapTilt: false });
    },
    'Método o Tipo',
  );

  let updateCaseChips = () => {};
  const caseHost = document.createElement('div');
  board.controls.append(caseHost);

  const rebuildCaseChips = (family, activeIdx) => {
    caseHost.replaceChildren();
    const list = (CASES[family] || CASES.log_filter).map((c, idx) => [idx, c.label]);
    updateCaseChips = addChips(
      caseHost,
      list,
      activeIdx,
      (idx) => {
        predictBox.notifyInteraction();
        store.set({ caseIdx: Number(idx), stepIdx: 0, showTrapTilt: false });
      },
      'Ecuación o Sistema',
    );
  };
  rebuildCaseChips(store.get().family, store.get().caseIdx);

  const btnPrev = button('Paso anterior', null, () => {
    predictBox.notifyInteraction();
    const cur = store.get();
    store.set({ stepIdx: Math.max(0, cur.stepIdx - 1), showTrapTilt: false });
  }, 'btn btn--ghost');
  const btnNext = button('Siguiente paso', null, () => {
    predictBox.notifyInteraction();
    const cur = store.get();
    const maxStep = (CASES[cur.family]?.[cur.caseIdx]?.steps.length || 1) - 1;
    store.set({ stepIdx: Math.min(maxStep, cur.stepIdx + 1), showTrapTilt: false });
  }, 'btn');
  const btnReset = button('', 'reset', () => {
    predictBox.notifyInteraction();
    store.set({ stepIdx: 0, showTrapTilt: false });
  }, 'chip btn--icon-only', { 'aria-label': 'Reiniciar pasos de la balanza' });

  const btnTrap = button('¿Y si acepto la raíz extraña?', 'warn', () => {
    predictBox.notifyInteraction();
    store.set({ showTrapTilt: !store.get().showTrapTilt });
  }, 'chip');

  board.actions.append(btnPrev, btnNext, btnReset, btnTrap);

  // 2. Escena SVG fija (sameNodeReference === true)
  const bg = s('rect', {
    x: 16, y: 14, width: 608, height: 312,
    fill: 'rgba(14, 22, 18, 0.5)',
    stroke: 'rgba(236, 242, 232, 0.18)',
  });
  const stepBadge = s('text', { x: 32, y: 42, class: 'log-svg-label', fill: 'var(--yellow)', 'font-size': '14px' }, '');
  const eqSubtitle = s('text', { x: 32, y: 66, class: 'log-svg-small', fill: 'var(--muted)', 'font-size': '13px' }, '');

  // Pedestal de balanza
  const pillar = s('path', { d: 'M 320 276 L 320 154 M 272 276 L 368 276', stroke: 'var(--muted)', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const fulcrum = s('polygon', { points: '308,162 332,162 320,144', fill: 'var(--yellow)' });
  const beamGroup = s('g', { transform: 'rotate(0 320 148)' });
  const beamBar = s('line', { x1: 110, y1: 148, x2: 530, y2: 148, stroke: 'var(--ink)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const panLeft = s('rect', { x: 52, y: 164, width: 226, height: 64, fill: 'rgba(92, 184, 255, 0.12)', stroke: 'var(--blue)', 'stroke-width': 1.8 });
  const panRight = s('rect', { x: 362, y: 164, width: 226, height: 64, fill: 'rgba(230, 211, 138, 0.12)', stroke: 'var(--yellow)', 'stroke-width': 1.8 });
  const lhsText = s('text', { x: 165, y: 201, class: 'log-svg-label', fill: 'var(--ink)', 'font-size': '14px', 'text-anchor': 'middle' }, '');
  const rhsText = s('text', { x: 475, y: 201, class: 'log-svg-label', fill: 'var(--yellow)', 'font-size': '14px', 'text-anchor': 'middle' }, '');
  beamGroup.append(beamBar, panLeft, panRight, lhsText, rhsText);

  const noteBox = s('rect', { x: 32, y: 286, width: 576, height: 32, fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(236,242,232,0.16)' });
  const noteText = s('text', { x: 44, y: 307, class: 'log-svg-small', fill: 'var(--ink)', 'font-size': '13px' }, '');

  board.drawing.append(bg, stepBadge, eqSubtitle, pillar, fulcrum, beamGroup, noteBox, noteText);

  // 3. Render
  let prevFam = store.get().family;
  const render = (state) => {
    updateFamChips(state.family);
    if (prevFam !== state.family) {
      rebuildCaseChips(state.family, state.caseIdx);
      prevFam = state.family;
    } else {
      updateCaseChips(state.caseIdx);
    }

    const activeCase = CASES[state.family]?.[state.caseIdx] || CASES.log_filter[0];
    const step = activeCase.steps[state.stepIdx] || activeCase.steps[0];
    const totalSteps = activeCase.steps.length;

    setText(stepBadge, `Paso ${state.stepIdx + 1} de ${totalSteps} · ${activeCase.label}`);
    setText(eqSubtitle, activeCase.domainNote || step.note);

    if (state.showTrapTilt) {
      beamGroup.setAttribute('transform', activeCase.hasTrap ? 'rotate(16 320 148)' : 'rotate(0 320 148)');
      panLeft.setAttribute('stroke', activeCase.hasTrap ? 'var(--pink)' : 'var(--green)');
      panLeft.setAttribute('fill', activeCase.hasTrap ? 'rgba(227, 161, 161, 0.22)' : 'rgba(142, 219, 159, 0.16)');
      setText(lhsText, activeCase.trapPanText || activeCase.trapText);
      setText(rhsText, activeCase.hasTrap ? 'Equilibrio roto en ℝ' : 'Válida en ℝ');
      setText(noteText, `${activeCase.hasTrap ? 'ALERTA: ' : 'CLAVE: '}${activeCase.trapText}`);
      noteText.setAttribute('fill', activeCase.hasTrap ? 'var(--pink)' : 'var(--green)');
    } else {
      beamGroup.setAttribute('transform', 'rotate(0 320 148)');
      panLeft.setAttribute('stroke', 'var(--blue)');
      panLeft.setAttribute('fill', 'rgba(92, 184, 255, 0.12)');
      setText(lhsText, step.lhs);
      setText(rhsText, step.rhs);
      setText(noteText, step.note);
      noteText.setAttribute('fill', 'var(--ink)');
    }

    btnPrev.disabled = state.stepIdx <= 0;
    btnNext.disabled = state.stepIdx >= totalSteps - 1;
    btnTrap.classList.toggle('is-active', state.showTrapTilt);

    renderReadout(board.readout, 'Balanza Algebraica', [
      ['Ecuación / Sistema', activeCase.label],
      ['Paso actual', `${step.lhs}  ⇔  ${step.rhs}`],
      ['Control de dominio', state.showTrapTilt ? activeCase.trapText : step.note],
    ]);
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => store.set({ family: 'log_filter', caseIdx: 0, stepIdx: 0, showTrapTilt: false }),
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initBalanzaLogaritmicaWidget };
