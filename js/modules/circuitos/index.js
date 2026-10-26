/**
 * circuitos/index.js — Controlador del simulador de desigualdades compuestas.
 * Flujo: eventos → store.set() → compute(state) → render(state, computed).
 */
import { byId, h, mount, on, createStore, connect, setPressed } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';
import { renderNav } from '../../core/nav.js';
import { compute, OPS, PRESETS, RETOS } from './logic.js';
import { buildCircuit, renderCircuit, renderNumberLine } from './render.js';

renderNav();

const V_MIN = -12, V_MAX = 12;

const store = createStore({
  mode: 'or',
  A: Object.freeze({ op: '>', v: -7 }),
  B: Object.freeze({ op: '≤', v: -3 }),
  x: -5,
  reto: -1,
  error: '',
});

const el = {
  bAnd: byId('mode-and'), bOr: byId('mode-or'),
  oA: byId('op-a'), vA: byId('val-a'), oB: byId('op-b'), vB: byId('val-b'),
  err: byId('cond-error'), circ: byId('circuit'), nl: byId('number-line'),
  xs: byId('x-slider'), xv: byId('x-value'),
  lA: byId('lab-a'), tA: byId('truth-a'), lB: byId('lab-b'), tB: byId('truth-b'), tL: byId('truth-lamp'),
  sol: byId('solution'), ver: byId('verdict'),
  presets: byId('presets'), reto: byId('reto'), retoS: byId('reto-status'),
};

/* ---------- Construcción única de controles a partir de datos ---------- */
[el.oA, el.oB].forEach((sel) => mount(sel, OPS.map((o) => h('option', { value: o }, o))));
mount(el.presets, PRESETS.map((p, i) => h('button', { type: 'button', class: 'chip', dataset: { preset: i } }, p.label)));
mount(el.reto,
  h('option', { value: '-1' }, 'Sin reto'),
  RETOS.map((r, i) => h('option', { value: i }, r.label)));

/* ---------- Render ---------- */
let circuitRefs = null;

function render(state, c) {
  setPressed(el.bAnd, state.mode === 'and');
  setPressed(el.bOr, state.mode === 'or');
  el.oA.value = state.A.op;
  el.oB.value = state.B.op;
  if (document.activeElement !== el.vA) el.vA.value = state.A.v;
  if (document.activeElement !== el.vB) el.vB.value = state.B.v;
  el.err.textContent = state.error;
  el.xs.value = state.x;
  el.xv.textContent = fmt(state.x);

  if (!circuitRefs || circuitRefs.mode !== state.mode) circuitRefs = buildCircuit(el.circ, state.mode);
  renderCircuit(circuitRefs, state, c);

  el.lA.textContent = `A · x ${state.A.op} ${fmt(state.A.v)}`;
  el.lB.textContent = `B · x ${state.B.op} ${fmt(state.B.v)}`;
  const truth = (node, val) => {
    node.textContent = val ? 'V' : 'F';
    node.classList.toggle('text-ok', val);
    node.classList.toggle('text-err', !val);
  };
  truth(el.tA, c.a);
  truth(el.tB, c.b);
  el.tL.textContent = c.lit ? 'Encendida' : 'Apagada';

  el.sol.textContent = c.setStr;
  el.ver.textContent = c.verdict;
  renderNumberLine(el.nl, state, c);

  el.reto.value = String(state.reto);
  el.retoS.textContent = c.reto ? c.reto.text : '';
  el.retoS.classList.toggle('text-ok', !!c.reto?.ok);
}

connect(store, compute, render);

/* ---------- Eventos ---------- */
on(el.bAnd, 'click', () => store.set({ mode: 'and' }));
on(el.bOr, 'click', () => store.set({ mode: 'or' }));

const setOp = (key) => (e) => store.set((st) => ({ [key]: Object.freeze({ ...st[key], op: e.target.value }) }));
on(el.oA, 'change', setOp('A'));
on(el.oB, 'change', setOp('B'));

const setVal = (key) => (e) => {
  const raw = e.target.value.trim();
  const n = parseFloat(raw);
  if (raw === '' || Number.isNaN(n)) return store.set({ error: `Ingresá un número para ${key}.` });
  if (n < V_MIN || n > V_MAX) return store.set({ error: `Usá un valor entre ${fmt(V_MIN)} y ${fmt(V_MAX)} para que entre en la recta.` });
  store.set((st) => ({ error: '', [key]: Object.freeze({ ...st[key], v: n }) }));
};
on(el.vA, 'input', setVal('A'));
on(el.vB, 'input', setVal('B'));

on(el.xs, 'input', (e) => store.set({ x: parseFloat(e.target.value) }));
on(el.reto, 'change', (e) => store.set({ reto: parseInt(e.target.value, 10) }));
on(el.presets, 'click', 'button[data-preset]', (_e, btn) => {
  const p = PRESETS[Number(btn.dataset.preset)];
  store.set({ mode: p.mode, A: Object.freeze({ ...p.A }), B: Object.freeze({ ...p.B }), error: '' });
});
