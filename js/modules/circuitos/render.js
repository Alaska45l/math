/**
 * circuitos/render.js — Vista SVG del circuito y de la recta numérica.
 * El esqueleto del circuito se construye una vez por modo; luego render()
 * solo conmuta clases, para conservar las transiciones de las palancas.
 */
import { s, mount } from '../../core/dom.js';
import { fmt } from '../../core/math-format.js';

const condText = (c) => `x ${c.op} ${fmt(c.v)}`;

/* ---------------- Circuito ---------------- */

function wire(refs, id, x1, y1, x2, y2) {
  const flow = s('line', { x1, y1, x2, y2, class: 'wire-flow' });
  refs.wires[id] = flow;
  return [s('line', { x1, y1, x2, y2, class: 'wire-base' }), flow];
}

function switchNode(refs, id, x1, x2, y) {
  const m = (x1 + x2) / 2;
  const blade = s('line', { x1, y1: y, x2, y2: y, class: 'lever' });
  const label = s('text', { class: 'svg-th', x: m, y: y - 72, 'text-anchor': 'middle' });
  const state = s('text', { class: 'svg-ts', x: m, y: y + 32, 'text-anchor': 'middle' });
  refs.sw[id] = { blade, label, state };
  return [
    blade,
    s('circle', { cx: x1, cy: y, r: 5, class: 'pivot' }),
    s('circle', { cx: x2, cy: y, r: 5, class: 'pivot' }),
    label, state,
  ];
}

const terminal = (x, y, t) => [
  s('circle', { cx: x, cy: y, r: 5, class: 'terminal' }),
  s('text', { class: 'svg-ts', x, y: y + 32, 'text-anchor': 'middle' }, t),
];

const junction = (x, y) => s('circle', { cx: x, cy: y, r: 4, class: 'junction' });

function lamp(refs, cx, y) {
  const rays = s('g', { class: 'lamp-rays' });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8, c = Math.cos(a), sn = Math.sin(a);
    rays.append(s('line', {
      x1: (cx + 27 * c).toFixed(1), y1: (y + 27 * sn).toFixed(1),
      x2: (cx + 35 * c).toFixed(1), y2: (y + 35 * sn).toFixed(1),
    }));
  }
  const bulb = s('circle', { cx, cy: y, r: 20, class: 'lamp-bulb' });
  const cross = s('g', { class: 'lamp-x' },
    s('line', { x1: cx - 10, y1: y - 10, x2: cx + 10, y2: y + 10 }),
    s('line', { x1: cx - 10, y1: y + 10, x2: cx + 10, y2: y - 10 }));
  refs.lamp = s('g', { class: 'lamp' }, rays, bulb, cross,
    s('text', { class: 'svg-ts', x: cx, y: y + 56, 'text-anchor': 'middle' }, 'lámpara'));
  return refs.lamp;
}

function bindSvgScale(svg, viewBoxW = 680) {
  function update() {
    const clientW = svg.clientWidth || svg.getBoundingClientRect().width;
    if (!clientW) return;
    const scale = clientW / viewBoxW;
    if (scale <= 0) return;
    const isDesktop = typeof window !== 'undefined' ? window.matchMedia('(min-width: 821px)').matches : false;
    const rootPx = typeof window !== 'undefined' ? (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) : 16;
    const targetCaveat = isDesktop ? (1.1 * rootPx) : (0.875 * rootPx);
    const caveatSize = Math.max(14, Math.round((targetCaveat / scale) * 10) / 10);
    svg.style.setProperty('--svg-scale-caveat', `${caveatSize}px`);
  }
  update();
  if (typeof ResizeObserver !== 'undefined' && !svg._roBound) {
    svg._roBound = true;
    new ResizeObserver(update).observe(svg);
  }
}

/** Construye el esqueleto del circuito para el modo dado. */
export function buildCircuit(svg, mode) {
  bindSvgScale(svg, 680);
  const refs = { mode, wires: {}, sw: {}, lamp: null };
  if (mode === 'and') {
    svg.setAttribute('viewBox', '0 0 680 200');
    const y = 125;
    mount(svg,
      wire(refs, 'w0', 45, y, 100, y), wire(refs, 'w1', 250, y, 290, y),
      wire(refs, 'w2', 440, y, 510, y), wire(refs, 'w3', 560, y, 635, y),
      switchNode(refs, 'A', 105, 245, y), switchNode(refs, 'B', 295, 435, y),
      lamp(refs, 535, y), terminal(40, y, 'entrada'), terminal(640, y, 'salida'));
  } else {
    svg.setAttribute('viewBox', '0 0 680 340');
    const m = 180, t = 90, b = 270;
    mount(svg,
      wire(refs, 'w0', 55, m, 140, m),
      wire(refs, 'vTL', 140, m, 140, t), wire(refs, 'vBL', 140, m, 140, b),
      wire(refs, 'hTL', 140, t, 195, t), wire(refs, 'hTR', 385, t, 440, t),
      wire(refs, 'hBL', 140, b, 195, b), wire(refs, 'hBR', 385, b, 440, b),
      wire(refs, 'vTR', 440, t, 440, m), wire(refs, 'vBR', 440, b, 440, m),
      wire(refs, 'p1', 440, m, 505, m), wire(refs, 'p2', 545, m, 635, m),
      junction(140, m), junction(440, m),
      switchNode(refs, 'A', 200, 380, t), switchNode(refs, 'B', 200, 380, b),
      lamp(refs, 525, m), terminal(50, m, 'entrada'), terminal(640, m, 'salida'));
  }
  return refs;
}

/** Actualiza el circuito existente según el estado/cálculo. */
export function renderCircuit(refs, state, { a, b, lit }) {
  const flow = (id, onState) => refs.wires[id]?.classList.toggle('is-on', !!onState);
  const lever = (id, closed, powered) => {
    const sw = refs.sw[id];
    sw.blade.classList.toggle('is-open', !closed);
    sw.blade.classList.toggle('is-powered', !!powered);
    sw.state.textContent = closed ? 'V · conduce' : 'F · no conduce';
  };
  refs.sw.A.label.textContent = `¿${condText(state.A)}?`;
  refs.sw.B.label.textContent = `¿${condText(state.B)}?`;

  if (state.mode === 'and') {
    flow('w0', true); flow('w1', a); flow('w2', lit); flow('w3', lit);
    lever('A', a, a); lever('B', b, lit);
  } else {
    flow('w0', true);
    ['vTL', 'hTL', 'hTR', 'vTR'].forEach((id) => flow(id, a));
    ['vBL', 'hBL', 'hBR', 'vBR'].forEach((id) => flow(id, b));
    flow('p1', lit); flow('p2', lit);
    lever('A', a, a); lever('B', b, b);
  }
  refs.lamp.classList.toggle('is-lit', lit);
}

/* ---------------- Recta numérica ---------------- */

const X_MIN = -15, X_MAX = 15;
const px = (x) => 60 + ((x - X_MIN) / (X_MAX - X_MIN)) * 560;

function endpoint(x, y, cls, closed) {
  return s('circle', { cx: x, cy: y, r: 5, class: `nl-end ${cls}${closed ? ' is-closed' : ''}` });
}

function row(list, y, cls, label, thick = false) {
  const out = [
    s('text', { class: 'svg-ts', x: 60, y: y - 14 }, label),
    s('line', { x1: 60, y1: y, x2: 620, y2: y, class: 'nl-track' }),
  ];
  if (!list.length) out.push(s('text', { class: 'svg-ts', x: 340, y: y + 4, 'text-anchor': 'middle' }, 'conjunto vacío'));
  list.forEach((v) => {
    const x1 = px(Math.max(v.lo, X_MIN)), x2 = px(Math.min(v.hi, X_MAX));
    let l = x1, r = x2;
    if (Number.isFinite(v.lo) && !v.loC) l += 5;
    if (Number.isFinite(v.hi) && !v.hiC) r -= 5;
    if (r > l) out.push(s('line', { x1: l, y1: y, x2: r, y2: y, class: `nl-seg ${cls}${thick ? ' is-thick' : ''}` }));
    out.push(Number.isFinite(v.lo)
      ? endpoint(x1, y, cls, v.loC)
      : s('path', { d: `M${x1 + 7} ${y - 6}L${x1} ${y}L${x1 + 7} ${y + 6}`, class: `nl-arrow ${cls}` }));
    out.push(Number.isFinite(v.hi)
      ? endpoint(x2, y, cls, v.hiC)
      : s('path', { d: `M${x2 - 7} ${y - 6}L${x2} ${y}L${x2 - 7} ${y + 6}`, class: `nl-arrow ${cls}` }));
  });
  return out;
}

export function renderNumberLine(svg, state, { iA, iB, res }) {
  svg.setAttribute('viewBox', '0 0 680 256');
  bindSvgScale(svg, 680);
  const ticks = [];
  for (let t = X_MIN; t <= X_MAX; t += 5) {
    ticks.push(
      s('line', { x1: px(t), y1: 208, x2: px(t), y2: 213, class: 'nl-axis' }),
      s('text', { class: 'svg-ts', x: px(t), y: 238, 'text-anchor': 'middle' }, fmt(t)),
    );
  }
  const mx = px(state.x);
  mount(svg,
    row([iA], 76, 'nl--a', `A · ${condText(state.A)}`),
    row([iB], 120, 'nl--b', `B · ${condText(state.B)}`),
    row(res, 164, 'nl--res', `Resultado · ${state.mode === 'and' ? 'A ∧ B' : 'A ∨ B'}`, true),
    s('line', { x1: 60, y1: 208, x2: 620, y2: 208, class: 'nl-axis' }),
    ticks,
    s('line', { x1: mx, y1: 68, x2: mx, y2: 82, class: 'nl-cursor' }),
    s('line', { x1: mx, y1: 112, x2: mx, y2: 126, class: 'nl-cursor' }),
    s('line', { x1: mx, y1: 156, x2: mx, y2: 170, class: 'nl-cursor' }),
    s('line', { x1: mx, y1: 202, x2: mx, y2: 212, class: 'nl-cursor' }),
    s('text', { class: 'svg-ts', x: mx, y: 14, 'text-anchor': 'middle' }, `x = ${fmt(state.x)}`),
  );
}
