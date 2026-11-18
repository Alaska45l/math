/**
 * @file js/modules/funciones-trigonometricas/widgets/board-kit.js
 * Wrapper delgado sobre `js/core/board-kit.js` para los 6 widgets SVG de Unidad 11 (prefijo 'trigf').
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
  fmt,
  frac,
  MINUS,
  playClick,
  playError,
  playSliderTick,
  playSuccess,
  createBoard as coreCreateBoard,
  createCartesianBoard as coreCreateCartesianBoard,
  createPredictBox as coreCreatePredictBox,
  applyPlaneClip as coreApplyPlaneClip,
  clampToPlane,
  anchorPlaneLabel,
  createPlane,
  attachSvgDrag,
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
} from '../../../core/board-kit.js';

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
  playClick,
  playError,
  playSliderTick,
  playSuccess,
  clampToPlane,
  anchorPlaneLabel,
  createPlane,
  attachSvgDrag,
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
};

export const BOARD_W = 640;
export const BOARD_H = 340;
export const BOARD_VIEWBOX = `0 0 ${BOARD_W} ${BOARD_H}`;

let trigfClipCounter = 0;

/**
 * Crea un pizarrón estándar 640×340 con clipPath protector y layer recortado.
 */
export function createBoard(host, title, viewBox = BOARD_VIEWBOX) {
  const board = coreCreateBoard(host, title, viewBox, { prefix: 'trigf', wrapFrame: false });
  const clipId = `trigf-clip-${++trigfClipCounter}`;
  board.addClipPath(clipId, 8, 8, BOARD_W - 16, BOARD_H - 16);
  const clipped = s('g', { class: 'trigf-svg-clipped', 'clip-path': `url(#${clipId})` });
  board.drawing.append(clipped);
  board.clipped = clipped;
  board.clipId = clipId;
  return board;
}

export function createCartesianBoard(host, title, planeCfg = {}, options = {}) {
  return coreCreateCartesianBoard(host, title, { width: BOARD_W, height: BOARD_H, ...planeCfg }, {
    prefix: 'trigf',
    wrapFrame: false,
    ...options,
  });
}

export function applyPlaneClip(board, plane) {
  return coreApplyPlaneClip(board, plane, 'trigf');
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({
    ...options,
    classPrefix: 'trigf',
    optionClass: 'chip chip--ghost pr-chip',
  });
}

export function createBoxMapper({
  xMin = 0,
  xMax = 10,
  yMin = 0,
  yMax = 10,
  pxLeft = 60,
  pxRight = 580,
  pxBottom = 290,
  pxTop = 40,
} = {}) {
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);
  const w = pxRight - pxLeft;
  const hPx = pxBottom - pxTop;
  return {
    xMin,
    xMax,
    yMin,
    yMax,
    toX: (x) => pxLeft + ((x - xMin) / spanX) * w,
    toY: (y) => pxBottom - ((y - yMin) / spanY) * hPx,
    fromX: (px) => xMin + ((px - pxLeft) / w) * spanX,
    fromY: (py) => yMin + ((pxBottom - py) / hPx) * spanY,
  };
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function formatPiTick(radVal) {
  const k = Math.round((radVal / Math.PI) * 2);
  if (Math.abs(radVal - (k * Math.PI) / 2) > 1e-3) return '';
  if (k === 0) return '0';
  if (k === 1) return 'π/2';
  if (k === -1) return `${MINUS}π/2`;
  if (k === 2) return 'π';
  if (k === -2) return `${MINUS}π`;
  if (k === 3) return '3π/2';
  if (k === -3) return `${MINUS}3π/2`;
  if (k === 4) return '2π';
  if (k === -4) return `${MINUS}2π`;
  return `${k % 2 === 0 ? k / 2 : `${k}/2`}π`;
}
