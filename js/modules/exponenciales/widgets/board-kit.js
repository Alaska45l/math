/**
 * board-kit.js — Thin domain wrapper over `js/core/board-kit.js` for Exponenciales Widgets.
 * Preserves 100% of existing exports and adds exponential-specific plot/format helpers.
 */

import {
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
  applyPlaneClip as coreApplyPlaneClip,
  createBoard as coreCreateBoard,
  createCartesianBoard as coreCreateCartesianBoard,
  addRange,
  addChips,
  addSelect,
  button,
  svgText,
  svgPath,
  svgCircle,
  setText,
  setVisible,
  renderReadout,
  getPlaneBox,
  clampToPlane,
  anchorPlaneLabel,
  updateMarker,
  plotPointMarker,
  addDraggableMarker,
  createPredictBox as coreCreatePredictBox,
} from '../../../core/board-kit.js';

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
  addRange,
  addChips,
  addSelect,
  button,
  svgText,
  svgPath,
  svgCircle,
  setText,
  setVisible,
  renderReadout,
  getPlaneBox,
  clampToPlane,
  anchorPlaneLabel,
  updateMarker,
  plotPointMarker,
  addDraggableMarker,
};

export function applyPlaneClip(board, plane) {
  return coreApplyPlaneClip(board, plane, 'exp');
}

export function createBoard(host, title, viewBox = '0 0 600 320') {
  return coreCreateBoard(host, title, viewBox, { prefix: 'exp', wrapFrame: false });
}

export function createCartesianBoard(host, title, planeCfg = {}) {
  return coreCreateCartesianBoard(host, title, planeCfg, { prefix: 'exp', wrapFrame: false });
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'exp', optionClass: 'chip chip--ghost pr-chip' });
}

export const createPredictorBanner = createPredictBox;

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
 * Formats canonical exponential formula string.
 */
export function formatExpFormula({ k, a, h = 0, c = 0, b = 1 }) {
  let str = '';
  if (k === -1) str += `${MINUS}`;
  else if (k !== 1) str += fmt(k);

  const baseStr = a === Math.E ? 'e' : paren(a);
  if (str && str !== MINUS) str += ' · ';
  str += baseStr;

  let exp = '';
  if (b !== 1) exp += fmt(b);
  exp += 'x';
  if (h > 0) exp += ` − ${fmt(h)}`;
  else if (h < 0) exp += ` + ${fmt(-h)}`;

  str += `^(${exp})`;
  if (c > 0) str += ` + ${fmt(c)}`;
  else if (c < 0) str += ` − ${fmt(-c)}`;

  return str;
}
