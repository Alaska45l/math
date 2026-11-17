/**
 * @file js/core/board-kit.js
 * Shared SVG chalkboard, Cartesian plane, keyboard-accessible SVG drag,
 * reactive control builders, and 2-stage Predict-Observe-Explain box across Alaska Math Lab.
 * Pure Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import {
  h,
  s,
  mount,
  clear,
  createStore,
  connect,
  chalkIcon,
  svgPoint,
} from './dom.js';
import {
  fmt,
  frac,
  MINUS,
  paren,
  signedTerm,
  iv,
  formatInterval,
  formatSet,
} from './math-format.js';
import { createPlane, bindSvgDrag, snapTo } from './plot.js';
import { playClick, playError, playSliderTick, playSuccess } from './sound.js';

export {
  h,
  s,
  mount,
  clear,
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
 * Applies a dedicated rectangular clipPath to plane layers matching plane.box.
 */
export function applyPlaneClip(board, plane, prefix = 'exp') {
  if (!board || !plane || !plane.box) return null;
  if (board.clipPath && typeof board.clipPath.remove === 'function') {
    board.clipPath.remove();
  } else if (board.clipId && board.svg) {
    const prev = board.svg.querySelector(`#${board.clipId}`);
    if (prev && typeof prev.remove === 'function') {
      prev.remove();
    }
  }
  const clipId = `${prefix}-plane-clip-${++boardClipUid}`;
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
    if (plane.layers.curve) plane.layers.curve.setAttribute('clip-path', `url(#${clipId})`);
    if (plane.layers.shade) plane.layers.shade.setAttribute('clip-path', `url(#${clipId})`);
    if (plane.layers.under) plane.layers.under.setAttribute('clip-path', `url(#${clipId})`);
  }

  board.clipId = clipId;
  board.clipPath = clipPath;
  board.clipRect = clipRect;
  return clipId;
}

/**
 * Standard Blackboard container for custom SVG scenes.
 * Preserves host element when `wrapFrame = false` (default for exp/new labs)
 * or wraps inside `.pr-widget` frame when `wrapFrame = true` (potencias-raices).
 */
export function createBoard(host, title, viewBox = '0 0 600 320', { prefix = 'exp', wrapFrame = false } = {}) {
  if (!host) throw new Error('[board-kit] Host container is required');

  const controlsClass = prefix === 'pr' ? 'seq-controls pr-widget__controls' : `${prefix}-widget__controls pr-widget__controls`;
  const svgClass = prefix === 'pr' ? 'pr-board-svg' : `${prefix}-board-svg pr-board-svg`;
  const sceneClass = prefix === 'pr' ? 'pr-board-scene' : `${prefix}-board-scene pr-board-scene`;
  const readoutClass = prefix === 'pr' ? 'va-readout pr-readout' : `${prefix}-readout pr-readout`;
  const actionsClass = prefix === 'pr' ? 'pr-widget__actions' : `${prefix}-widget__actions pr-widget__actions`;

  const controls = h('div', { class: controlsClass });
  const defs = s('defs');
  const svg = s('svg', {
    class: svgClass,
    viewBox,
    role: 'img',
    'aria-label': title,
  });
  const drawing = s('g', { class: sceneClass });
  if (wrapFrame) {
    svg.append(drawing);
  } else {
    svg.append(defs, drawing);
  }

  let readout = !wrapFrame ? host.querySelector(`.${prefix}-readout, .pr-readout`) : null;
  if (!readout) {
    readout = h('div', { class: readoutClass, 'aria-live': 'polite' });
  }
  const actions = h('div', { class: actionsClass });

  let frame = host;
  if (wrapFrame) {
    frame = h('div', { class: 'pr-widget' }, controls, svg, readout, actions);
    mount(host, frame);
  } else {
    host.classList.add(`${prefix}-widget`, 'pr-widget');
    host.replaceChildren(controls, svg, readout, actions);
  }

  const boardObj = { host, frame, controls, svg, defs, drawing, readout, actions };
  boardObj.applyPlaneClip = (plane) => applyPlaneClip(boardObj, plane, prefix);
  boardObj.addClipPath = (id, x, y, width, height) => {
    const clipRect = s('rect', { x, y, width, height });
    const clipPath = s('clipPath', { id }, clipRect);
    defs.append(clipPath);
    return { clipPath, clipRect };
  };

  return boardObj;
}

/**
 * Cartesian Blackboard with integrated createPlane and clipPath protection.
 */
export function createCartesianBoard(host, title, planeCfg = {}, options = {}) {
  const width = planeCfg.width || 600;
  const height = planeCfg.height || 320;
  const board = createBoard(host, title, `0 0 ${width} ${height}`, options);

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

  applyPlaneClip(board, plane, options.prefix || 'exp');
  board.drawing = plane.layers.curve;
  board.plane = plane;

  return { ...board, plane, clipId: board.clipId, clipPath: board.clipPath };
}

/**
 * Creates an isolated SVG canvas with .quad-board-svg (or configured className) and clipPath.
 */
export function createQuadBoardSvg({
  width = 680,
  height = 340,
  ariaLabel = 'Pizarrón interactivo',
  className = 'quad-board-svg',
  pad = { top: 22, right: 24, bottom: 30, left: 38 },
} = {}) {
  boardClipUid += 1;
  const clipId = `quad-plot-clip-${boardClipUid}`;
  const plotBox = {
    x: pad.left,
    y: pad.top,
    w: width - pad.left - pad.right,
    h: height - pad.top - pad.bottom,
  };

  const defs = s('defs', {}, [
    s('clipPath', { id: clipId }, [
      s('rect', {
        x: plotBox.x,
        y: plotBox.y,
        width: plotBox.w,
        height: plotBox.h,
      }),
    ]),
  ]);

  const bgRect = s('rect', {
    x: plotBox.x,
    y: plotBox.y,
    width: plotBox.w,
    height: plotBox.h,
    fill: 'rgba(14, 22, 18, 0.55)',
    stroke: 'rgba(236, 242, 232, 0.18)',
    'stroke-width': 1,
  });

  const gridLayer = s('g', { class: 'quad-svg-grid' });
  const clippedLayer = s('g', {
    class: 'quad-svg-clipped',
    'clip-path': `url(#${clipId})`,
  });
  const overlayLayer = s('g', { class: 'quad-svg-overlay' });

  const svg = s(
    'svg',
    {
      class: className,
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': ariaLabel,
    },
    [defs, bgRect, gridLayer, clippedLayer, overlayLayer]
  );

  return {
    svg,
    defs,
    plotBox,
    clipId,
    gridLayer,
    clippedLayer,
    overlayLayer,
    width,
    height,
  };
}

/**
 * Creates a Cartesian coordinate mapper inside plotBox.
 */
export function createCartesianMapper(
  plotBox,
  { xMin = -8, xMax = 8, yMin = -10, yMax = 10 } = {}
) {
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);

  const toX = (x) => plotBox.x + ((x - xMin) / spanX) * plotBox.w;
  const toY = (y) => plotBox.y + plotBox.h - ((y - yMin) / spanY) * plotBox.h;
  const fromX = (px) => xMin + ((px - plotBox.x) / plotBox.w) * spanX;
  const fromY = (py) => yMin + ((plotBox.y + plotBox.h - py) / plotBox.h) * spanY;

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    plotBox,
    toX,
    toY,
    fromX,
    fromY,
  };
}

/**
 * Draws Cartesian grid and numbered axes strictly inside plotBox.
 */
export function drawCartesianAxes(
  gridLayer,
  mapper,
  { xStep = 2, yStep = 2, xLabel = 'x', yLabel = 'y' } = {}
) {
  clear(gridLayer);
  const { xMin, xMax, yMin, yMax, plotBox, toX, toY } = mapper;

  const firstX = Math.ceil(xMin / xStep) * xStep;
  for (let x = firstX; x <= xMax + 1e-6; x += xStep) {
    const px = toX(x);
    if (px < plotBox.x - 1 || px > plotBox.x + plotBox.w + 1) continue;
    gridLayer.appendChild(
      s('line', {
        x1: px,
        y1: plotBox.y,
        x2: px,
        y2: plotBox.y + plotBox.h,
        stroke: 'rgba(236, 242, 232, 0.08)',
        'stroke-width': 1,
      })
    );
    if (Math.abs(x) > 1e-6) {
      const axisY = Math.min(plotBox.y + plotBox.h + 13, Math.max(plotBox.y + 14, toY(0) + 14));
      gridLayer.appendChild(
        s(
          'text',
          { x: px, y: axisY, fill: 'var(--muted)', 'font-size': 10, 'text-anchor': 'middle' },
          String(Math.round(x * 100) / 100)
        )
      );
    }
  }

  const firstY = Math.ceil(yMin / yStep) * yStep;
  for (let y = firstY; y <= yMax + 1e-6; y += yStep) {
    const py = toY(y);
    if (py < plotBox.y - 1 || py > plotBox.y + plotBox.h + 1) continue;
    gridLayer.appendChild(
      s('line', {
        x1: plotBox.x,
        y1: py,
        x2: plotBox.x + plotBox.w,
        y2: py,
        stroke: 'rgba(236, 242, 232, 0.08)',
        'stroke-width': 1,
      })
    );
    if (Math.abs(y) > 1e-6) {
      const axisX = Math.min(plotBox.x + plotBox.w - 18, Math.max(plotBox.x + 18, toX(0) - 6));
      gridLayer.appendChild(
        s(
          'text',
          { x: axisX, y: py + 3, fill: 'var(--muted)', 'font-size': 10, 'text-anchor': 'end' },
          String(Math.round(y * 100) / 100)
        )
      );
    }
  }

  if (yMin <= 0 && yMax >= 0) {
    const y0 = toY(0);
    gridLayer.appendChild(
      s('line', {
        x1: plotBox.x,
        y1: y0,
        x2: plotBox.x + plotBox.w,
        y2: y0,
        stroke: 'rgba(236, 242, 232, 0.45)',
        'stroke-width': 1.5,
      })
    );
    gridLayer.appendChild(
      s(
        'text',
        {
          x: plotBox.x + plotBox.w - 6,
          y: Math.max(plotBox.y + 12, y0 - 6),
          fill: 'var(--ink)',
          'font-size': 11,
          'font-weight': 'bold',
          'text-anchor': 'end',
        },
        xLabel
      )
    );
  }

  if (xMin <= 0 && xMax >= 0) {
    const x0 = toX(0);
    gridLayer.appendChild(
      s('line', {
        x1: x0,
        y1: plotBox.y,
        x2: x0,
        y2: plotBox.y + plotBox.h,
        stroke: 'rgba(236, 242, 232, 0.45)',
        'stroke-width': 1.5,
      })
    );
    gridLayer.appendChild(
      s(
        'text',
        {
          x: Math.min(plotBox.x + plotBox.w - 10, x0 + 8),
          y: plotBox.y + 13,
          fill: 'var(--ink)',
          'font-size': 11,
          'font-weight': 'bold',
        },
        yLabel
      )
    );
  }
}

/**
 * Samples f(x) into an SVG <path> d string.
 */
export function sampleCurvePath(fn, mapper, steps = 140, xStart = null, xEnd = null) {
  const x0 = xStart !== null ? xStart : mapper.xMin;
  const x1 = xEnd !== null ? xEnd : mapper.xMax;
  const dx = (x1 - x0) / steps;
  const parts = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + i * dx;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    const clampedY = Math.max(mapper.yMin - 80, Math.min(mapper.yMax + 80, y));
    const px = mapper.toX(x).toFixed(2);
    const py = mapper.toY(clampedY).toFixed(2);
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${px},${py}`);
  }
  return parts.join(' ');
}

/**
 * Binds pointer dragging and full keyboard slider accessibility onto an SVG handle.
 */
export function attachSvgDrag(svg, handleNode, getMapper, onMove, options = {}) {
  let dragging = false;

  handleNode.setAttribute('tabindex', '0');
  handleNode.setAttribute('role', 'slider');
  if (!handleNode.getAttribute('aria-label')) {
    handleNode.setAttribute('aria-label', options.ariaLabel || 'Control deslizable');
  }

  const clientToSvg = (e) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = vb.width / Math.max(1, rect.width);
    const scaleY = vb.height / Math.max(1, rect.height);
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const mapper = getMapper();
    return { px, py, x: mapper.fromX(px), y: mapper.fromY(py) };
  };

  handleNode.style.cursor = 'grab';
  handleNode.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    handleNode.style.cursor = 'grabbing';
    if (handleNode.setPointerCapture) {
      try {
        handleNode.setPointerCapture(e.pointerId);
      } catch {}
    }
  });

  handleNode.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    onMove(clientToSvg(e));
  });

  const stop = () => {
    dragging = false;
    handleNode.style.cursor = 'grab';
  };
  handleNode.addEventListener('pointerup', stop);
  handleNode.addEventListener('pointercancel', stop);

  handleNode.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();

    const mapper = getMapper();
    let px = null;
    let py = null;
    if (handleNode.hasAttribute('cx') && handleNode.hasAttribute('cy')) {
      px = parseFloat(handleNode.getAttribute('cx'));
      py = parseFloat(handleNode.getAttribute('cy'));
    } else if (handleNode.hasAttribute('x') && handleNode.hasAttribute('y')) {
      px = parseFloat(handleNode.getAttribute('x'));
      py = parseFloat(handleNode.getAttribute('y'));
    } else {
      try {
        const rect = svg.getBoundingClientRect();
        const hRect = handleNode.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const scaleX = vb.width / Math.max(1, rect.width);
        const scaleY = vb.height / Math.max(1, rect.height);
        px = (hRect.left + hRect.width / 2 - rect.left) * scaleX;
        py = (hRect.top + hRect.height / 2 - rect.top) * scaleY;
      } catch {}
    }

    let curX = px !== null && !isNaN(px) ? mapper.fromX(px) : 0;
    let curY = py !== null && !isNaN(py) ? mapper.fromY(py) : 0;

    const stepX = options.stepX ?? 0.5;
    const stepY = options.stepY ?? 0.5;

    if (e.key === 'ArrowRight') curX += stepX;
    else if (e.key === 'ArrowLeft') curX -= stepX;
    else if (e.key === 'ArrowUp') curY += stepY;
    else if (e.key === 'ArrowDown') curY -= stepY;
    else if (e.key === 'Home') curX = mapper.xMin;
    else if (e.key === 'End') curX = mapper.xMax;

    const newPx = mapper.toX(curX);
    const newPy = mapper.toY(curY);
    handleNode.setAttribute('aria-valuenow', String(Math.round(curX * 100) / 100));

    if (typeof playSliderTick === 'function') {
      try {
        playSliderTick(1);
      } catch {}
    }

    onMove({ px: newPx, py: newPy, x: curX, y: curY });
    if (handleNode.isConnected && typeof handleNode.focus === 'function') {
      try {
        handleNode.focus({ preventScroll: true });
      } catch {
        handleNode.focus();
      }
    }
  });
}

/**
 * Creates a slider field with reactive output value.
 */
export function createSliderField({
  label,
  min,
  max,
  step = 1,
  value = 0,
  formatValue = (v) => String(v),
  onInput,
}) {
  const valSpan = h('span', { class: 'quad-slider-val' }, formatValue(value));
  const input = h('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
    'aria-label': label,
  });

  input.addEventListener('input', () => {
    const num = Number(input.value);
    valSpan.textContent = formatValue(num);
    if (typeof onInput === 'function') onInput(num);
  });

  const setValue = (newVal) => {
    input.value = String(newVal);
    valSpan.textContent = formatValue(Number(newVal));
  };

  const root = h('div', { class: 'quad-slider-field' }, [
    h('label', {}, [h('span', {}, label), valSpan]),
    input,
  ]);

  return { root, input, valSpan, setValue };
}

/**
 * Reactive slider bound to a store.
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
  { compact = false } = {}
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

  if (compact) {
    const labelEl = h(
      'label',
      { class: 'field seq-control' },
      h('span', { class: 'field__label' }, label),
      input,
      output
    );
    controls.append(labelEl);
    return { labelEl, input, output };
  }

  const header = h(
    'div',
    { class: 'field__header exp-control__header pr-control__header' },
    h('span', { class: 'field__label' }, label),
    output
  );
  const labelEl = h('label', { class: 'field seq-control exp-control pr-control' }, header, input);
  controls.append(labelEl);
  return { labelEl, input, output, header };
}

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
      label
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

export function addSelect(controls, store, key, label, options, initial, { prefix = 'exp' } = {}) {
  const select = h('select', { 'aria-label': label });
  options.forEach(([value, text]) => {
    select.append(
      h('option', { value: String(value), selected: String(value) === String(initial) }, text)
    );
  });

  select.addEventListener('change', () => {
    const raw = select.value;
    const num = Number(raw);
    store.set({ [key]: Number.isNaN(num) ? raw : num });
  });

  const cls = prefix === 'pr' ? 'field seq-control' : `field seq-control ${prefix}-control pr-control`;
  controls.append(h('label', { class: cls }, h('span', { class: 'field__label' }, label), select));
  return select;
}

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
    ...children
  );
}

export function svgText(parent, x, y, value, attrs = {}) {
  const node = s('text', { x, y, class: 'exp-svg-label pr-svg-label', ...attrs }, value);
  parent.append(node);
  return node;
}

export function svgPath(parent, d, attrs = {}) {
  const node = s('path', { d, fill: 'none', class: 'exp-svg-curve pr-svg-neutral', ...attrs });
  parent.append(node);
  return node;
}

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
          h('p', null, ...(Array.isArray(nodes) ? nodes : [nodes]))
        )
      )
    )
  );
}

export function compactFraction(numerator, denominator) {
  return frac(String(numerator), String(denominator));
}

export function getPlaneBox(plane) {
  if (plane && plane.box) return plane.box;
  const w = (plane && plane.cfg && plane.cfg.width) || 600;
  const hVal = (plane && plane.cfg && plane.cfg.height) || 320;
  return { x: 44, y: 18, w: w - 64, h: hVal - 38 };
}

export function clampToPlane(plane, px, py, margin = 8) {
  const box = getPlaneBox(plane);
  const minX = box.x + margin;
  const maxX = box.x + box.w - margin;
  const minY = box.y + margin;
  const maxY = box.y + box.h - margin;

  let safePx = px;
  if (!Number.isFinite(px)) safePx = px === Infinity ? maxX : minX;
  let safePy = py;
  if (!Number.isFinite(py)) safePy = py === -Infinity ? minY : maxY;

  const cx = Math.max(minX, Math.min(maxX, safePx));
  const cy = Math.max(minY, Math.min(maxY, safePy));

  const isFiniteInput = Number.isFinite(px) && Number.isFinite(py);
  const isClampedX = !Number.isFinite(px) || px < minX || px > maxX;
  const isClampedY = !Number.isFinite(py) || py < minY || py > maxY;

  return { cx, cy, isClampedX, isClampedY, isClamped: isClampedX || isClampedY, isFinite: isFiniteInput };
}

export function anchorPlaneLabel(
  plane,
  px,
  py,
  labelWidthEst = 60,
  offset = { x: 10, y: 8 }
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

  if (safePx + offset.x + labelWidthEst > rightBoundary) {
    anchor = 'end';
    lx = safePx - offset.x;
  } else if (safePx - offset.x - labelWidthEst < leftBoundary) {
    anchor = 'start';
    lx = safePx + offset.x;
  }

  let ly = safePy - offset.y;
  if (safePy - offset.y < topBoundary) {
    ly = safePy + offset.y + 14;
  } else if (safePy + offset.y > bottomBoundary && ly > bottomBoundary) {
    ly = safePy - offset.y;
  }

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
      label
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

export function addDraggableMarker(board, plane, initialX, initialY, options = {}) {
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

    const labelText = label ? `${label}(${fmt(x)}; ${fmt(y)})` : `(${fmt(x)}; ${fmt(y)})`;
    badge.textContent = labelText;

    const labelEstWidth = Math.max(40, labelText.length * 7.5);
    const { lx, ly, anchor } = anchorPlaneLabel(plane, cx, cy, labelEstWidth, { x: 12, y: 10 });
    badge.setAttribute('x', String(lx));
    badge.setAttribute('y', String(ly));
    badge.setAttribute('text-anchor', anchor);
  };

  setPos(initialX, initialY);

  let isDragging = false;
  hitArea.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDragging = true;
    try {
      hitArea.setPointerCapture(e.pointerId);
    } catch {}
    hitArea.style.cursor = 'grabbing';
    e.preventDefault();
    e.stopPropagation();
    if (typeof onDrag === 'function') onDrag({ x: currentX, y: currentY, phase: 'start' });
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
    if (typeof onDrag === 'function') onDrag({ x, y, phase: 'move' });
  });

  const stopDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      hitArea.releasePointerCapture(e.pointerId);
    } catch {}
    hitArea.style.cursor = 'grab';
    if (typeof onDrag === 'function') onDrag({ x: currentX, y: currentY, phase: 'end' });
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
        try {
          playSliderTick(1);
        } catch {}
      }
      if (typeof onDrag === 'function') {
        onDrag({ x: nextX, y: nextY, phase: 'move' });
        onDrag({ x: nextX, y: nextY, phase: 'end' });
      }
    }
  });

  return { group, hitArea, dot, badge, setPos, getPos: () => ({ x: currentX, y: currentY }) };
}

/**
 * 2-stage Predict-Observe-Explain box:
 * Stage 1: Commit hypothesis without prematurely revealing correctness.
 * Stage 2: Verify on board (via button click or notifyInteraction) and reveal explanation.
 */
export function createPredictBox({
  prompt,
  options = [],
  onSelect,
  onVerify,
  classPrefix = 'quad',
  optionClass = null,
} = {}) {
  const prefixes = Array.from(new Set(['learning', classPrefix, 'quad'].filter(Boolean)));
  const cx = (suffix) => prefixes.map((p) => `${p}${suffix}`).join(' ');

  const box = h('div', { class: cx('-predict-box') });
  const titleEl = h('p', { class: cx('-predict-prompt') }, [
    chalkIcon('spark', 15),
    ` Predicción previa: ${prompt}`,
  ]);
  const optionsRow = h('div', { class: `pr-chip-row ${cx('-predict-options')}` });
  const actionsRow = h('div', { class: cx('-predict-actions'), style: 'margin-top: 8px;' });
  const verifyBtn = h(
    'button',
    {
      type: 'button',
      class: `pr-chip ${cx('-predict-verify-btn')}`,
      hidden: '',
      disabled: '',
    },
    'Comprobar en el pizarrón'
  );
  actionsRow.appendChild(verifyBtn);

  const feedbackEl = h('div', {
    class: cx('-predict-feedback'),
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
      try {
        playSuccess();
      } catch {}
      feedbackEl.textContent = `¡Bien anticipado! ${opt.explanation}`;
      feedbackEl.style.color = 'var(--green)';
    } else {
      try {
        playClick();
      } catch {}
      feedbackEl.textContent = `Interesante apuesta: ${opt.explanation}`;
      feedbackEl.style.color = 'var(--yellow)';
    }
  };

  const btnCls = optionClass || (classPrefix === 'exp' ? 'chip chip--ghost pr-chip' : 'pr-chip');
  options.forEach((opt) => {
    const btn = h('button', { type: 'button', class: btnCls }, opt.label);
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
        'Hipótesis registrada: ahora probalo en el pizarrón o pulsá "Comprobar en el pizarrón" para verificar qué ocurre';

      verifyBtn.removeAttribute('hidden');
      verifyBtn.removeAttribute('disabled');
      verifyBtn.classList.add('is-active');
      try {
        playClick();
      } catch {}
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
  box.notifyInteraction = () => {
    if (selectedOpt && !verified) {
      runVerification(selectedOpt);
    }
  };
  box.getSelectedOption = () => selectedOpt;
  box.isVerified = () => verified;

  return box;
}

export const createPredictorBanner = createPredictBox;
