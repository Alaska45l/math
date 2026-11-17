/**
 * Shared construction helpers for Potencias y Raíces.
 * Thin wrapper delegating to `js/core/board-kit.js`.
 */
import {
  h,
  s,
  mount,
  createStore,
  connect,
  chalkIcon,
  fmt,
  frac,
  createBoard as coreCreateBoard,
  addRange as coreAddRange,
  addSelect as coreAddSelect,
  addChips,
  svgText as coreSvgText,
  svgPath as coreSvgPath,
  setText,
  setVisible,
  renderReadout as coreRenderReadout,
  button,
  compactFraction,
  createPredictBox as coreCreatePredictBox,
  attachSvgDrag,
} from '../../../core/board-kit.js';

export {
  h,
  s,
  mount,
  createStore,
  connect,
  chalkIcon,
  fmt,
  frac,
  addChips,
  setText,
  setVisible,
  button,
  compactFraction,
  attachSvgDrag,
};

export function createBoard(host, title, viewBox = '0 0 600 340') {
  return coreCreateBoard(host, title, viewBox, { prefix: 'pr', wrapFrame: true });
}

export function addRange(controls, store, key, label, min, max, initial, step = 1) {
  return coreAddRange(controls, store, key, label, min, max, initial, step, fmt, { compact: true });
}

export function addSelect(controls, store, key, label, options, initial) {
  return coreAddSelect(controls, store, key, label, options, initial, { prefix: 'pr' });
}

export function svgText(parent, x, y, value, attrs = {}) {
  return coreSvgText(parent, x, y, value, { class: 'pr-svg-label', ...attrs });
}

export function svgPath(parent, d, attrs = {}) {
  return coreSvgPath(parent, d, { class: 'pr-svg-neutral', ...attrs });
}

export function renderReadout(readout, title, rows) {
  return coreRenderReadout(readout, title, rows);
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'pr' });
}

export const createPredictorBanner = createPredictBox;
