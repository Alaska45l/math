/**
 * board-kit.js — Shared Construction & Graphic Engine for Exponenciales Widgets.
 * Provides unified SVG chalkboard creation, Cartesian plane binding, reactive
 * controls with strict DOM persistence, and mathematical formatting.
 */

import {
  h,
  s,
  mount,
  createStore,
  connect,
  chalkIcon,
  svgPoint,
} from '../../../core/dom.js';
import {
  fmt,
  frac,
  MINUS,
  paren,
  signedTerm,
  iv,
  formatInterval,
  formatSet,
} from '../../../core/math-format.js';
import { createPlane, bindSvgDrag, snapTo } from '../../../core/plot.js';

export {
  h,
  s,
  mount,
  createStore,
  connect,
  chalkIcon,
  svgPoint,
  fmt,
  frac,
  MINUS,
  paren,
  signedTerm,
  iv,
  formatInterval,
  formatSet,
  createPlane,
  bindSvgDrag,
  snapTo,
};

/**
 * Standard Blackboard container for custom SVG scenes or hybrid cards.
 */
export function createBoard(host, title, viewBox = '0 0 600 320') {
  if (!host) throw new Error('[board-kit] Host container is required');

  const controls = h('div', { class: 'exp-widget__controls pr-widget__controls' });
  const svg = s('svg', {
    class: 'exp-board-svg pr-board-svg',
    viewBox,
    role: 'img',
    'aria-label': title,
  });
  const drawing = s('g', { class: 'exp-board-scene pr-board-scene' });
  svg.append(drawing);

  let readout = host.querySelector('.exp-readout, .pr-readout');
  if (!readout) {
    readout = h('div', { class: 'exp-readout pr-readout', 'aria-live': 'polite' });
  }

  const actions = h('div', { class: 'exp-widget__actions pr-widget__actions' });

  // Retain host element, avoiding nested wrapper explosion
  host.classList.add('exp-widget', 'pr-widget');
  host.replaceChildren(controls, svg, readout, actions);

  return { host, frame: host, controls, svg, drawing, readout, actions };
}

/**
 * Cartesian Blackboard with fully integrated createPlane (grid, axes, chalk noise, layers).
 */
export function createCartesianBoard(host, title, planeCfg = {}) {
  const width = planeCfg.width || 600;
  const height = planeCfg.height || 320;
  const board = createBoard(host, title, `0 0 ${width} ${height}`);

  const plane = createPlane(board.svg, {
    width,
    height,
    xMin: -6,
    xMax: 6,
    yMin: -4,
    yMax: 8,
    xStep: 1,
    yStep: 1,
    grid: true,
    ...planeCfg,
  });

  // Alias drawing to the curve layer
  board.drawing = plane.layers.curve;

  return { ...board, plane };
}

/**
 * Reactive slider with strict DOM persistence (range === ref).
 */
export function addRange(
  controls,
  store,
  key,
  label,
  min,
  max,
  initial,
  step = 1,
  formatFn = fmt,
) {
  const input = h('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(initial),
    'aria-label': label,
  });
  const output = h('output', { class: 'field__value' }, formatFn(Number(initial)));

  input.addEventListener('input', () => {
    const value = Number(input.value);
    output.textContent = formatFn(value);
    store.set({ [key]: value });
  });

  const labelEl = h(
    'label',
    { class: 'field seq-control exp-control pr-control' },
    h('span', { class: 'field__label' }, label),
    input,
    output,
  );
  controls.append(labelEl);

  return { labelEl, input, output };
}

/**
 * Segmented chip selector with accessible aria-pressed toggles.
 */
export function addChips(parent, options, active, onPick, groupLabel = 'Opciones') {
  const group = h('div', {
    class: 'pr-chip-group',
    role: 'group',
    'aria-label': groupLabel,
  });

  const chips = options.map(([value, label]) => {
    const isSelected = String(value) === String(active);
    const chip = h(
      'button',
      {
        type: 'button',
        class: `chip ${isSelected ? 'is-active' : 'chip--ghost'}`,
        'aria-pressed': String(isSelected),
        on: { click: () => onPick(value) },
      },
      label,
    );
    group.append(chip);
    return { value, chip };
  });

  parent.append(group);

  return (nextValue) => {
    chips.forEach(({ value: optionVal, chip }) => {
      const selected = String(optionVal) === String(nextValue);
      chip.classList.toggle('is-active', selected);
      chip.classList.toggle('chip--ghost', !selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
  };
}

/**
 * Accessible dropdown select.
 */
export function addSelect(controls, store, key, label, options, initial) {
  const select = h('select', { 'aria-label': label });
  options.forEach(([value, text]) => {
    select.append(
      h('option', { value: String(value), selected: String(value) === String(initial) }, text),
    );
  });

  select.addEventListener('change', () => {
    const raw = select.value;
    const num = Number(raw);
    store.set({ [key]: Number.isNaN(num) ? raw : num });
  });

  controls.append(
    h(
      'label',
      { class: 'field seq-control exp-control pr-control' },
      h('span', { class: 'field__label' }, label),
      select,
    ),
  );

  return select;
}

/**
 * Action button with protected chalkIcon or text-only / icon-only presentation.
 */
export function button(label, icon, onClick, className = 'chip', attrs = {}) {
  const children = [];
  if (icon) children.push(chalkIcon(icon));
  if (label) children.push(icon ? ` ${label}` : label);
  const accessibleLabel = attrs['aria-label'] || label || (icon === 'reset' ? 'Reiniciar' : null);
  const tooltip = attrs.title || label || (icon === 'reset' ? 'Reiniciar' : null);
  return h(
    'button',
    {
      type: 'button',
      class: className,
      on: { click: onClick },
      ...(accessibleLabel ? { 'aria-label': accessibleLabel } : {}),
      ...(tooltip ? { title: tooltip } : {}),
      ...attrs,
    },
    ...children,
  );
}

/**
 * SVG Text node builder.
 */
export function svgText(parent, x, y, value, attrs = {}) {
  const node = s('text', { x, y, class: 'exp-svg-label pr-svg-label', ...attrs }, value);
  parent.append(node);
  return node;
}

/**
 * SVG Path node builder.
 */
export function svgPath(parent, d, attrs = {}) {
  const node = s('path', {
    d,
    fill: 'none',
    class: 'exp-svg-curve pr-svg-neutral',
    ...attrs,
  });
  parent.append(node);
  return node;
}

/**
 * SVG Circle node builder.
 */
export function svgCircle(parent, cx, cy, r, attrs = {}) {
  const node = s('circle', { cx, cy, r, ...attrs });
  parent.append(node);
  return node;
}

export function setText(node, value) {
  if (node) node.textContent = String(value);
}

export function setVisible(node, visible) {
  if (node) node.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

/**
 * Layout-stable readout generator.
 */
export function renderReadout(readout, title, rows) {
  mount(
    readout,
    h('h4', null, title),
    h(
      'div',
      { class: 'exp-readout__grid pr-readout__grid' },
      ...rows.map(([label, nodes]) =>
        h(
          'div',
          { class: 'exp-readout__item pr-readout__item' },
          h('strong', null, label),
          h('p', null, ...(Array.isArray(nodes) ? nodes : [nodes])),
        ),
      ),
    ),
  );
}

/**
 * Plots or updates an exponential curve f(x) = k * a^(b*(x - h)) + c.
 */
export function plotExpCurve(plane, { k, a, h = 0, c = 0, b = 1 }, opts = {}) {
  if (!plane || !plane.fnPath) return '';
  if (a <= 0 || Math.abs(a - 1) < 1e-9) return '';
  return plane.fnPath(
    (x) => k * Math.pow(a, b * (x - h)) + c,
    plane.cfg.xMin,
    plane.cfg.xMax,
    opts,
  );
}

/**
 * Plots horizontal asymptote line y = c.
 */
export function plotAsymptote(plane, c, attrs = {}) {
  const y = plane.sy(c);
  const x1 = plane.box.x;
  const x2 = plane.box.x + plane.box.w;
  return s('line', {
    x1,
    y1: y,
    x2,
    y2: y,
    class: 'exp-svg-asymptote',
    ...attrs,
  });
}

/**
 * Helper to plot point marker on plane marks layer.
 */
export function plotPointMarker(plane, x, y, label = '', attrs = {}) {
  const px = plane.sx(x);
  const py = plane.sy(y);
  const group = s('g', { class: 'exp-svg-point-marker' });
  const dot = s('circle', {
    cx: px,
    cy: py,
    r: 5,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 1.5,
    ...attrs,
  });
  group.append(dot);
  if (label) {
    const text = s('text', {
      x: px + 8,
      y: py - 6,
      class: 'exp-svg-label',
      fill: 'var(--text)',
    }, label);
    group.append(text);
  }
  plane.layers.marks.append(group);
  return group;
}

/**
 * Creates an interactive draggable point marker on a Cartesian plane.
 */
export function addDraggableMarker(
  board,
  plane,
  initialX,
  initialY,
  options = {},
) {
  const {
    color = 'var(--yellow)',
    radius = 7,
    snapStep = 0.5,
    onDrag = null,
    label = '',
  } = options;

  let currentX = initialX;
  let currentY = initialY;

  const group = s('g', { class: 'exp-svg-point-group' });
  const hitArea = s('circle', {
    cx: plane.sx(currentX),
    cy: plane.sy(currentY),
    r: radius + 14,
    fill: 'transparent',
    style: 'cursor: grab; touch-action: none;',
  });
  const dot = s('circle', {
    cx: plane.sx(currentX),
    cy: plane.sy(currentY),
    r: radius,
    fill: color,
    stroke: 'var(--bg)',
    'stroke-width': 2,
    style: 'pointer-events: none;',
  });
  const badge = s(
    'text',
    {
      x: plane.sx(currentX) + 12,
      y: plane.sy(currentY) - 10,
      class: 'exp-svg-label',
      fill: color,
      style: 'pointer-events: none;',
    },
    label ? `${label}(${fmt(currentX)}; ${fmt(currentY)})` : `(${fmt(currentX)}; ${fmt(currentY)})`,
  );

  group.append(hitArea, dot, badge);
  plane.layers.marks.append(group);

  let isDragging = false;

  const setPos = (x, y) => {
    currentX = x;
    currentY = y;
    const px = plane.sx(x);
    const py = plane.sy(y);
    hitArea.setAttribute('cx', String(px));
    hitArea.setAttribute('cy', String(py));
    dot.setAttribute('cx', String(px));
    dot.setAttribute('cy', String(py));
    badge.setAttribute('x', String(px + 12));
    badge.setAttribute('y', String(py - 10));
    badge.textContent = label
      ? `${label}(${fmt(x)}; ${fmt(y)})`
      : `(${fmt(x)}; ${fmt(y)})`;
  };

  hitArea.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDragging = true;
    try { hitArea.setPointerCapture(e.pointerId); } catch (_) {}
    hitArea.style.cursor = 'grabbing';
    e.preventDefault();
    e.stopPropagation();
    if (typeof onDrag === 'function') {
      onDrag({ x: currentX, y: currentY, phase: 'start' });
    }
  });

  hitArea.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const p = svgPoint(board.svg, e);
    let x = plane.invX(p.x);
    let y = plane.invY(p.y);
    if (snapStep > 0) {
      x = Math.round(x / snapStep) * snapStep;
      y = Math.round(y / snapStep) * snapStep;
    }
    x = Math.max(plane.cfg.xMin, Math.min(plane.cfg.xMax, Number(x.toFixed(2))));
    y = Math.max(plane.cfg.yMin, Math.min(plane.cfg.yMax, Number(y.toFixed(2))));
    setPos(x, y);
    if (typeof onDrag === 'function') {
      onDrag({ x, y, phase: 'move' });
    }
  });

  const stopDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try { hitArea.releasePointerCapture(e.pointerId); } catch (_) {}
    hitArea.style.cursor = 'grab';
    if (typeof onDrag === 'function') {
      onDrag({ x: currentX, y: currentY, phase: 'end' });
    }
  };

  hitArea.addEventListener('pointerup', stopDrag);
  hitArea.addEventListener('pointercancel', stopDrag);

  return {
    group,
    setPos,
    getPos: () => ({ x: currentX, y: currentY }),
  };
}

/**
 * Formats canonical exponential formula string.
 */
export function formatExpFormula({ k, a, h = 0, c = 0, b = 1 }) {
  let s = '';
  if (k === -1) s += `${MINUS}`;
  else if (k !== 1) s += fmt(k);

  const baseStr = a === Math.E ? 'e' : paren(a);
  if (s && s !== MINUS) s += ' · ';
  s += baseStr;

  let exp = '';
  if (b !== 1) exp += fmt(b);
  exp += 'x';
  if (h > 0) exp += ` − ${fmt(h)}`;
  else if (h < 0) exp += ` + ${fmt(-h)}`;

  s += `^(${exp})`;
  if (c > 0) s += ` + ${fmt(c)}`;
  else if (c < 0) s += ` − ${fmt(-c)}`;

  return s;
}
