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
import { playClick, playError, playSliderTick, playSuccess } from '../../../core/sound.js';

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
  playClick,
  playError,
  playSliderTick,
  playSuccess,
};

let boardClipUid = 0;

/**
 * Applies a dedicated rectangular clipPath to layers or custom elements matching plane.box.
 */
export function applyPlaneClip(board, plane) {
  if (!board || !plane || !plane.box) return null;
  if (board.clipPath && typeof board.clipPath.remove === 'function') {
    board.clipPath.remove();
  } else if (board.clipId && board.svg) {
    const prev = board.svg.querySelector(`#${board.clipId}`);
    if (prev && typeof prev.remove === 'function') {
      prev.remove();
    }
  }
  const clipId = `exp-plane-clip-${++boardClipUid}`;
  const clipRect = s('rect', {
    x: plane.box.x,
    y: plane.box.y,
    width: plane.box.w,
    height: plane.box.h,
  });
  const clipPath = s('clipPath', { id: clipId }, clipRect);

  let defs = board.svg ? board.svg.querySelector('defs') : null;
  if (!defs) {
    defs = s('defs');
    if (board.svg) board.svg.prepend(defs);
  }
  defs.append(clipPath);

  if (plane.layers) {
    if (plane.layers.curve) {
      plane.layers.curve.setAttribute('clip-path', `url(#${clipId})`);
    }
    if (plane.layers.shade) {
      plane.layers.shade.setAttribute('clip-path', `url(#${clipId})`);
    }
    if (plane.layers.under) {
      plane.layers.under.setAttribute('clip-path', `url(#${clipId})`);
    }
  }

  board.clipId = clipId;
  board.clipPath = clipPath;
  board.clipRect = clipRect;
  return clipId;
}

/**
 * Standard Blackboard container for custom SVG scenes or hybrid cards.
 */
export function createBoard(host, title, viewBox = '0 0 600 320') {
  if (!host) throw new Error('[board-kit] Host container is required');

  const controls = h('div', { class: 'exp-widget__controls pr-widget__controls' });
  const defs = s('defs');
  const svg = s('svg', {
    class: 'exp-board-svg pr-board-svg',
    viewBox,
    role: 'img',
    'aria-label': title,
  });
  const drawing = s('g', { class: 'exp-board-scene pr-board-scene' });
  svg.append(defs, drawing);

  let readout = host.querySelector('.exp-readout, .pr-readout');
  if (!readout) {
    readout = h('div', { class: 'exp-readout pr-readout', 'aria-live': 'polite' });
  }

  const actions = h('div', { class: 'exp-widget__actions pr-widget__actions' });

  // Retain host element, avoiding nested wrapper explosion
  host.classList.add('exp-widget', 'pr-widget');
  host.replaceChildren(controls, svg, readout, actions);

  const boardObj = { host, frame: host, controls, svg, defs, drawing, readout, actions };

  boardObj.applyPlaneClip = (plane) => applyPlaneClip(boardObj, plane);
  boardObj.addClipPath = (id, x, y, width, height) => {
    const clipRect = s('rect', { x, y, width, height });
    const clipPath = s('clipPath', { id }, clipRect);
    defs.append(clipPath);
    return { clipPath, clipRect };
  };

  return boardObj;
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

  // Apply dedicated clipPath matching plane.box exactly: [x0, x1] x [y0, y1]
  applyPlaneClip(board, plane);

  // Alias drawing to the curve layer
  board.drawing = plane.layers.curve;
  board.plane = plane;

  return { ...board, plane, clipId: board.clipId, clipPath: board.clipPath };
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

  const header = h(
    'div',
    { class: 'field__header exp-control__header pr-control__header' },
    h('span', { class: 'field__label' }, label),
    output,
  );

  const labelEl = h(
    'label',
    { class: 'field seq-control exp-control pr-control' },
    header,
    input,
  );
  controls.append(labelEl);

  return { labelEl, input, output, header };
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
 * Returns safe plane bounds or fallback defaults.
 */
export function getPlaneBox(plane) {
  if (plane && plane.box) {
    return plane.box;
  }
  const w = (plane && plane.cfg && plane.cfg.width) || 600;
  const h = (plane && plane.cfg && plane.cfg.height) || 320;
  return { x: 44, y: 18, w: w - 64, h: h - 38 };
}

/**
 * Clamping estricto de coordenadas en píxeles al recuadro interior de plane.box.
 */
export function clampToPlane(plane, px, py, margin = 8) {
  const box = getPlaneBox(plane);
  const minX = box.x + margin;
  const maxX = box.x + box.w - margin;
  const minY = box.y + margin;
  const maxY = box.y + box.h - margin;

  let safePx = px;
  if (!Number.isFinite(px)) {
    safePx = px === Infinity ? maxX : minX;
  }
  let safePy = py;
  if (!Number.isFinite(py)) {
    safePy = py === -Infinity ? minY : maxY;
  }

  const cx = Math.max(minX, Math.min(maxX, safePx));
  const cy = Math.max(minY, Math.min(maxY, safePy));

  const isFiniteInput = Number.isFinite(px) && Number.isFinite(py);
  const isClampedX = !Number.isFinite(px) || px < minX || px > maxX;
  const isClampedY = !Number.isFinite(py) || py < minY || py > maxY;

  return {
    cx,
    cy,
    isClampedX,
    isClampedY,
    isClamped: isClampedX || isClampedY,
    isFinite: isFiniteInput,
  };
}

/**
 * Cálculo inteligente de posición y dynamic text-anchor para etiquetas en el plano cartesiano.
 * Evita cortes contra los bordes perimetrales de plane.box y del canvas SVG.
 */
export function anchorPlaneLabel(
  plane,
  px,
  py,
  labelWidthEst = 60,
  offset = { x: 10, y: 8 },
) {
  const box = getPlaneBox(plane);
  const rightBoundary = box.x + box.w - 8;
  const leftBoundary = box.x + 8;
  const topBoundary = box.y + 14;
  const bottomBoundary = box.y + box.h - 8;

  const safePx = Number.isFinite(px) ? px : leftBoundary;
  const safePy = Number.isFinite(py) ? py : bottomBoundary;

  let anchor = 'start';
  let lx = safePx + offset.x;

  // Si la etiqueta se sale por la derecha, anclar al final ('end') y ubicar hacia la izquierda
  if (safePx + offset.x + labelWidthEst > rightBoundary) {
    anchor = 'end';
    lx = safePx - offset.x;
  } else if (safePx - offset.x - labelWidthEst < leftBoundary) {
    anchor = 'start';
    lx = safePx + offset.x;
  }

  // Desplazamiento vertical: si está muy cerca del techo, posicionar la etiqueta debajo del marcador
  let ly = safePy - offset.y;
  if (safePy - offset.y < topBoundary) {
    ly = safePy + offset.y + 14;
  } else if (safePy + offset.y > bottomBoundary && ly > bottomBoundary) {
    ly = safePy - offset.y;
  }

  // Clamping perimetral de seguridad para no salirse jamás de plane.box
  if (anchor === 'end') {
    lx = Math.max(box.x + Math.min(labelWidthEst, 40), Math.min(box.x + box.w - 4, lx));
  } else if (anchor === 'start') {
    lx = Math.max(box.x + 4, Math.min(box.x + box.w - Math.min(labelWidthEst, 40), lx));
  } else {
    lx = Math.max(box.x + 10, Math.min(box.x + box.w - 10, lx));
  }
  ly = Math.max(box.y + 12, Math.min(box.y + box.h - 4, ly));

  return { lx, ly, anchor };
}

/**
 * Updates marker dot and label with boundary clamping and dynamic anchor.
 */
export function updateMarker(plane, dotNode, labelNode, x, y, labelText, radius = 5) {
  if (!plane) return;
  const px = plane.sx(x);
  const py = plane.sy(y);
  const { cx, cy } = clampToPlane(plane, px, py, radius + 2);

  if (dotNode) {
    dotNode.setAttribute('cx', String(cx));
    dotNode.setAttribute('cy', String(cy));
  }

  if (labelNode) {
    if (labelText !== undefined && labelText !== null) {
      labelNode.textContent = String(labelText);
    }
    const txt = labelNode.textContent || labelText || '';
    const labelEstWidth = Math.max(35, txt.length * 7.5);
    const { lx, ly, anchor } = anchorPlaneLabel(plane, cx, cy, labelEstWidth);
    labelNode.setAttribute('x', String(lx));
    labelNode.setAttribute('y', String(ly));
    labelNode.setAttribute('text-anchor', anchor);
  }
}

/**
 * Helper to plot point marker on plane marks layer with strict clamping and dynamic anchor.
 */
export function plotPointMarker(plane, x, y, label = '', attrs = {}) {
  const rawPx = plane.sx(x);
  const rawPy = plane.sy(y);
  const { cx, cy } = clampToPlane(plane, rawPx, rawPy, 6);

  const group = s('g', { class: 'exp-svg-point-marker' });
  const dot = s('circle', {
    cx,
    cy,
    r: 5,
    fill: 'var(--yellow)',
    stroke: 'var(--bg)',
    'stroke-width': 1.5,
    ...attrs,
  });
  group.append(dot);

  let textNode = null;
  if (label) {
    const labelEstWidth = Math.max(30, String(label).length * 7.5);
    const { lx, ly, anchor } = anchorPlaneLabel(plane, cx, cy, labelEstWidth);
    textNode = s(
      'text',
      {
        x: lx,
        y: ly,
        class: 'exp-svg-label',
        fill: 'var(--text)',
        'text-anchor': anchor,
      },
      label,
    );
    group.append(textNode);
  }

  plane.layers.marks.append(group);

  group.dot = dot;
  group.text = textNode;
  group.setPos = (nx, ny, newLabel) => {
    const npx = plane.sx(nx);
    const npy = plane.sy(ny);
    const c = clampToPlane(plane, npx, npy, 6);
    dot.setAttribute('cx', String(c.cx));
    dot.setAttribute('cy', String(c.cy));
    if (textNode) {
      if (newLabel !== undefined) textNode.textContent = String(newLabel);
      const lWidth = Math.max(30, (textNode.textContent || '').length * 7.5);
      const pos = anchorPlaneLabel(plane, c.cx, c.cy, lWidth);
      textNode.setAttribute('x', String(pos.lx));
      textNode.setAttribute('y', String(pos.ly));
      textNode.setAttribute('text-anchor', pos.anchor);
    }
  };

  return group;
}

/**
 * Creates an interactive draggable point marker on a Cartesian plane with strict boundary containment.
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
    r: radius + 14,
    fill: 'transparent',
    tabindex: '0',
    role: 'slider',
    'aria-label': label || 'Punto interactivo',
    'aria-valuemin': String(plane.cfg.xMin),
    'aria-valuemax': String(plane.cfg.xMax),
    'aria-valuenow': String(initialX),
    style: 'cursor: grab; touch-action: none; outline: none;',
  });
  const dot = s('circle', {
    r: radius,
    fill: color,
    stroke: 'var(--bg)',
    'stroke-width': 2,
    style: 'pointer-events: none;',
  });
  const badge = s('text', {
    class: 'exp-svg-label',
    fill: color,
    style: 'pointer-events: none;',
  });

  group.append(hitArea, dot, badge);
  plane.layers.marks.append(group);

  const setPos = (x, y) => {
    currentX = x;
    currentY = y;
    const rawPx = plane.sx(x);
    const rawPy = plane.sy(y);
    const { cx, cy } = clampToPlane(plane, rawPx, rawPy, radius + 2);

    hitArea.setAttribute('cx', String(cx));
    hitArea.setAttribute('cy', String(cy));
    dot.setAttribute('cx', String(cx));
    dot.setAttribute('cy', String(cy));
    hitArea.setAttribute('aria-valuenow', String(x));

    const labelText = label
      ? `${label}(${fmt(x)}; ${fmt(y)})`
      : `(${fmt(x)}; ${fmt(y)})`;
    badge.textContent = labelText;

    const labelEstWidth = Math.max(40, labelText.length * 7.5);
    const { lx, ly, anchor } = anchorPlaneLabel(plane, cx, cy, labelEstWidth, {
      x: 12,
      y: 10,
    });
    badge.setAttribute('x', String(lx));
    badge.setAttribute('y', String(ly));
    badge.setAttribute('text-anchor', anchor);
  };

  // Initial positioning with clamping and dynamic anchor
  setPos(initialX, initialY);

  let isDragging = false;

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

  hitArea.addEventListener('keydown', (e) => {
    let handled = false;
    let nextX = currentX;
    let nextY = currentY;
    const step = snapStep > 0 ? snapStep : 0.5;

    if (e.key === 'ArrowRight') {
      nextX += step;
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      nextX -= step;
      handled = true;
    } else if (e.key === 'ArrowUp') {
      nextY += step;
      handled = true;
    } else if (e.key === 'ArrowDown') {
      nextY -= step;
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      nextX = Math.max(plane.cfg.xMin, Math.min(plane.cfg.xMax, Number(nextX.toFixed(2))));
      nextY = Math.max(plane.cfg.yMin, Math.min(plane.cfg.yMax, Number(nextY.toFixed(2))));
      setPos(nextX, nextY);
      if (typeof playSliderTick === 'function') {
        try { playSliderTick(1); } catch {}
      }
      if (typeof onDrag === 'function') {
        onDrag({ x: nextX, y: nextY, phase: 'move' });
        onDrag({ x: nextX, y: nextY, phase: 'end' });
      }
    }
  });

  return {
    group,
    hitArea,
    dot,
    badge,
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


/**
 * Componente interactivo de predicción en 2 etapas (Predict-Observe-Explain).
 * 1. El estudiante selecciona su hipótesis (sin veredicto prematuro).
 * 2. Mueve el control en el pizarrón o pulsa "Comprobar en el pizarrón" para verificar.
 */
export function createPredictBox({ prompt, options = [], onSelect, onVerify } = {}) {
  const box = h('div', { class: 'exp-predict-box pr-predict-box quad-predict-box' });
  const titleEl = h('p', { class: 'exp-predict-prompt pr-predict-prompt quad-predict-prompt' }, [
    chalkIcon('spark', 15),
    ` Predicción previa: ${prompt}`,
  ]);
  const optionsRow = h('div', { class: 'pr-chip-row exp-predict-options quad-predict-options' });
  const actionsRow = h('div', { class: 'exp-predict-actions quad-predict-actions', style: 'margin-top: 8px;' });
  const verifyBtn = h(
    'button',
    {
      type: 'button',
      class: 'pr-chip exp-predict-verify-btn quad-predict-verify-btn',
      hidden: '',
      disabled: '',
    },
    'Comprobar en el pizarrón'
  );
  actionsRow.appendChild(verifyBtn);

  const feedbackEl = h('div', {
    class: 'exp-predict-feedback quad-predict-feedback',
    hidden: '',
    role: 'status',
    'aria-live': 'polite',
  });

  let selectedOpt = null;
  let verified = false;

  const runVerification = (opt = selectedOpt) => {
    if (!opt) return;
    verified = true;
    verifyBtn.disabled = true;
    verifyBtn.classList.remove('is-active');

    if (typeof onVerify === 'function') {
      onVerify(opt);
    } else if (typeof onSelect === 'function') {
      onSelect(opt);
    }

    feedbackEl.removeAttribute('hidden');
    if (opt.correct) {
      if (typeof playSuccess === 'function') {
        try { playSuccess(); } catch {}
      }
      feedbackEl.textContent = `¡Bien anticipado! ${opt.explanation}`;
      feedbackEl.style.color = 'var(--green)';
    } else {
      if (typeof playClick === 'function') {
        try { playClick(); } catch {}
      }
      feedbackEl.textContent = `Interesante apuesta: ${opt.explanation}`;
      feedbackEl.style.color = 'var(--yellow)';
    }
  };

  options.forEach((opt) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, opt.label);
    btn.addEventListener('click', () => {
      selectedOpt = opt;
      verified = false;
      for (const b of optionsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      btn.classList.add('is-active');

      feedbackEl.removeAttribute('hidden');
      feedbackEl.style.color = 'var(--muted, #a7b8ae)';
      feedbackEl.textContent =
        'Hipótesis registrada: ahora mové el control en el pizarrón o pulsá "Comprobar en el pizarrón" para verificar qué ocurre';

      verifyBtn.removeAttribute('hidden');
      verifyBtn.removeAttribute('disabled');
      verifyBtn.classList.add('is-active');
      if (typeof playClick === 'function') {
        try { playClick(); } catch {}
      }
    });
    optionsRow.appendChild(btn);
  });

  verifyBtn.addEventListener('click', () => {
    if (selectedOpt) {
      runVerification(selectedOpt);
    }
  });

  box.append(titleEl, optionsRow, actionsRow, feedbackEl);

  box.verify = runVerification;
  box.getSelectedOption = () => selectedOpt;
  box.isVerified = () => verified;

  return box;
}

export const createPredictorBanner = createPredictBox;
