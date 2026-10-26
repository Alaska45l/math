/**
 * dimensional/index.js — Controlador del laboratorio de análisis dimensional.
 */
import { byId, h, mount, on, createStore, connect, setPressed } from '../../core/dom.js';
import { renderNav } from '../../core/nav.js';
import { PROBLEMS, MAX_STEPS, compute, makeStep } from './logic.js';
import {
  renderExpression, renderGoal, renderStatus, renderMiddle, renderLog, renderPowerNote, renderTools,
} from './render.js';

renderNav();

const el = {
  problem: byId('problem'), value: byId('value'), grow: byId('predict-up'), shrink: byId('predict-down'),
  goal: byId('goal'), expr: byId('expr'), status: byId('status'), error: byId('dim-error'),
  power: byId('power-note'), middleBtn: byId('show-middle'), middle: byId('middle'),
  tools: byId('tools'), undo: byId('undo'), reset: byId('reset'), solve: byId('solve'), log: byId('log'),
};

const store = createStore({ p: 0, v: PROBLEMS[0].v, steps: Object.freeze([]), prediction: null, middle: false, error: '' });

mount(el.problem, PROBLEMS.map((p, i) => h('option', { value: i }, p.t)));

let toolsFor = -1;
function render(state, c) {
  el.problem.value = String(state.p);
  if (document.activeElement !== el.value) el.value.value = state.v;
  if (toolsFor !== state.p) { renderTools(el.tools, state); toolsFor = state.p; }
  setPressed(el.grow, state.prediction === 'up');
  setPressed(el.shrink, state.prediction === 'down');
  setPressed(el.middleBtn, state.middle);
  el.error.textContent = state.error;
  renderGoal(el.goal, state, c);
  renderExpression(el.expr, state, c);
  renderStatus(el.status, state, c);
  renderMiddle(el.middle, state, c);
  renderLog(el.log, state, c);
  renderPowerNote(el.power, state, c);
}

connect(store, compute, render);

on(el.problem, 'change', (e) => {
  const p = Number(e.target.value);
  store.set({ p, v: PROBLEMS[p].v, steps: Object.freeze([]), prediction: null, error: '' });
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
on(el.reset, 'click', () => store.set({ steps: Object.freeze([]), prediction: null, error: '' }));
on(el.solve, 'click', () => store.set((st) => ({ steps: Object.freeze(PROBLEMS[st.p].sol.map(([k, o]) => makeStep(k, o))), error: '' })));
on(el.grow, 'click', () => store.set({ prediction: 'up' }));
on(el.shrink, 'click', () => store.set({ prediction: 'down' }));
on(el.middleBtn, 'click', () => store.set((st) => ({ middle: !st.middle })));
