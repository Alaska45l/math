/**
 * dimensional/index.js — Controlador del laboratorio de análisis dimensional.
 */
import { byId, h, mount, on, createStore, connect, setPressed } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';
import { renderNav } from '../../core/nav.js';
import { PROBLEMS, MAX_STEPS, CUBE_PROBLEM, compute, makeStep } from './logic.js';
import {
  renderExpression, renderGoal, renderStatus, renderMiddle, renderLog, renderPowerNote, renderTools,
} from './render.js';
import { CHECKS_DATA, createCheckBlock } from './checks.js';
import {
  initDimLearning,
  recordDimAttempt,
  recordDimPrediction,
  mountDimCompetencyDashboard,
} from './learning-adapter.js';

renderNav();
initDimLearning();

const el = {
  problem: byId('problem'), value: byId('value'), grow: byId('predict-up'), shrink: byId('predict-down'),
  poeBox: byId('poe-box'), poeFeedback: byId('poe-feedback'), poeVerify: byId('poe-verify'),
  goal: byId('goal'), expr: byId('expr'), status: byId('status'), error: byId('dim-error'),
  power: byId('power-note'), middleBtn: byId('show-middle'), middle: byId('middle'),
  tools: byId('tools'), undo: byId('undo'), reset: byId('reset'), solve: byId('solve'), log: byId('log'),
  checksNeutro: byId('dim-checks-neutro'),
  checksComp: byId('dim-checks-compuestas'),
  dashboard: byId('dim-dashboard'),
};

const store = createStore({
  p: 0,
  v: PROBLEMS[0].v,
  steps: Object.freeze([]),
  prediction: null,
  poeVerified: false,
  solutionRevealed: false,
  middle: false,
  error: '',
});

mount(el.problem, PROBLEMS.map((p, i) => h('option', { value: i }, p.t)));

let dashboardHandle = null;
const bySection = (sec) => CHECKS_DATA.filter((q) => q.sectionId === sec);
createCheckBlock(el.checksNeutro, bySection('sec-neutro'), 'sec-neutro');
createCheckBlock(el.checksComp, bySection('sec-compuestas'), 'sec-compuestas');
if (el.dashboard) {
  dashboardHandle = mountDimCompetencyDashboard(el.dashboard);
}

const compForProblem = (pIdx) =>
  pIdx === CUBE_PROBLEM ? 'units.compound_rates_and_powers' : 'units.unitary_factor_neutral_one';

let runCounter = 0;
let recordedRunAutonomous = false;
let recordedRunReveal = false;
let recordedRunPoe = false;

function resetRunGuards() {
  runCounter += 1;
  recordedRunAutonomous = false;
  recordedRunReveal = false;
  recordedRunPoe = false;
}

function renderPoe(state, c) {
  if (!el.poeBox || !el.poeFeedback) return;
  if (!state.prediction) {
    el.poeBox.hidden = true;
    el.poeBox.classList.remove('is-verified');
    if (el.poeVerify) el.poeVerify.hidden = true;
    return;
  }

  el.poeBox.hidden = false;
  const verified = Boolean(state.poeVerified || c.solved);
  el.poeBox.classList.toggle('is-verified', verified);

  if (!verified) {
    el.poeFeedback.textContent =
      'Hipótesis registrada: ahora encastrá los factores unitarios en el pizarrón para comprobar si el número crece o se achica.';
    if (el.poeVerify) el.poeVerify.hidden = !c.solved;
  } else {
    const dirMsg = c.actual === 'up'
      ? `Como el numerador acumulado (${fmt(c.N, 6)}) es mayor que el denominador (${fmt(c.D, 6)}), multiplicás por un factor > 1 y el valor numérico crece.`
      : `Como el numerador acumulado (${fmt(c.N, 6)}) es menor que el denominador (${fmt(c.D, 6)}), dividís por un factor > 1 y el valor numérico se achica.`;
    const matchMsg = state.prediction === c.actual
      ? 'Tu predicción coincidió con la observación en el pizarrón.'
      : 'Tu predicción fue al revés: al observar las fracciones unitarias encastradas se invierte la escala.';
    el.poeFeedback.textContent = `${matchMsg} ${dirMsg}`;
    if (el.poeVerify) el.poeVerify.hidden = true;
  }
}

let toolsFor = -1;
function render(state, c) {
  el.problem.value = String(state.p);
  if (document.activeElement !== el.value) el.value.value = state.v;
  if (toolsFor !== state.p) { renderTools(el.tools, state); toolsFor = state.p; }
  setPressed(el.grow, state.prediction === 'up');
  setPressed(el.shrink, state.prediction === 'down');
  setPressed(el.middleBtn, state.middle);
  el.error.textContent = state.error;
  renderPoe(state, c);
  renderGoal(el.goal, state, c);
  renderExpression(el.expr, state, c);
  renderStatus(el.status, state, c);
  renderMiddle(el.middle, state, c);
  renderLog(el.log, state, c);
  renderPowerNote(el.power, state, c);

  if (c.solvedAutonomous && !recordedRunAutonomous) {
    recordedRunAutonomous = true;
    recordDimAttempt({
      exerciseId: `dim-workbench-p${state.p}-run${runCounter}`,
      competencyId: compForProblem(state.p),
      correct: true,
      mode: 'independent',
      hintsUsed: 0,
      solutionRevealed: false,
      representation: 'manipulative',
      stage: 'guided_practice',
      transferDistance: 'near',
    });
    dashboardHandle?.update();
  }
}

connect(store, compute, render);

on(el.problem, 'change', (e) => {
  const p = Number(e.target.value);
  resetRunGuards();
  store.set({
    p,
    v: PROBLEMS[p].v,
    steps: Object.freeze([]),
    prediction: null,
    poeVerified: false,
    solutionRevealed: false,
    error: '',
  });
});

on(el.value, 'input', (e) => {
  const n = Number(e.target.value);
  if (e.target.value.trim() === '' || !Number.isFinite(n) || n <= 0 || n > 1e9) {
    store.set({ error: 'Ingresá un número mayor que 0 y menor que 1.000.000.000.' });
    return;
  }
  store.set({ v: n, error: '' });
});

on(el.tools, 'click', 'button[data-k]', (_e, btn) => {
  const { steps } = store.get();
  if (steps.length >= MAX_STEPS) {
    store.set({ error: `Máximo ${MAX_STEPS} fichas: deshacé alguna antes de seguir.` });
    return;
  }
  store.set({ steps: Object.freeze([...steps, makeStep(btn.dataset.k, Number(btn.dataset.o))]), error: '' });
});

on(el.undo, 'click', () => store.set((st) => ({ steps: Object.freeze(st.steps.slice(0, -1)), error: '' })));

on(el.reset, 'click', () => {
  resetRunGuards();
  store.set({
    steps: Object.freeze([]),
    prediction: null,
    poeVerified: false,
    solutionRevealed: false,
    error: '',
  });
});

on(el.solve, 'click', () => {
  const st = store.get();
  store.set((cur) => ({
    steps: Object.freeze(PROBLEMS[cur.p].sol.map(([k, o]) => makeStep(k, o))),
    solutionRevealed: true,
    error: '',
  }));
  if (!recordedRunReveal) {
    recordedRunReveal = true;
    recordDimAttempt({
      exerciseId: `dim-workbench-p${st.p}`,
      competencyId: compForProblem(st.p),
      correct: true,
      mode: 'assisted',
      hintsUsed: 0,
      solutionRevealed: true,
      representation: 'manipulative',
      stage: 'guided_practice',
      transferDistance: 'near',
    });
    dashboardHandle?.update();
  }
});

const commitPrediction = (dir) => {
  const st = store.get();
  store.set({ prediction: dir, poeVerified: false });
  if (!recordedRunPoe) {
    recordedRunPoe = true;
    recordDimPrediction({
      exerciseId: `dim-poe-p${st.p}`,
      competencyId: compForProblem(st.p),
      representation: 'manipulative',
    });
  }
};

on(el.grow, 'click', () => commitPrediction('up'));
on(el.shrink, 'click', () => commitPrediction('down'));
if (el.poeVerify) {
  on(el.poeVerify, 'click', () => store.set({ poeVerified: true }));
}
on(el.middleBtn, 'click', () => store.set((st) => ({ middle: !st.middle })));
