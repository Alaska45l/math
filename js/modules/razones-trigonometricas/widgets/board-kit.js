/**
 * @file js/modules/razones-trigonometricas/widgets/board-kit.js
 * Wrapper delgado sobre `js/core/board-kit.js` para los 5 widgets SVG de Unidad 10 (prefijo 'trigr').
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
  createPredictBox as coreCreatePredictBox,
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

let trigrClipCounter = 0;

/**
 * Crea un pizarrón estándar 640×340 con clipPath protector y layer recortado.
 */
export function createBoard(host, title, viewBox = BOARD_VIEWBOX) {
  const board = coreCreateBoard(host, title, viewBox, { prefix: 'trigr', wrapFrame: false });
  const clipId = `trigr-clip-${++trigrClipCounter}`;
  board.addClipPath(clipId, 8, 8, BOARD_W - 16, BOARD_H - 16);
  const clipped = s('g', { class: 'trigr-svg-clipped', 'clip-path': `url(#${clipId})` });
  board.drawing.append(clipped);
  board.clipped = clipped;
  board.clipId = clipId;
  return board;
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({
    ...options,
    classPrefix: 'trigr',
    optionClass: 'chip chip--ghost pr-chip',
  });
}

/**
 * Mapper lineal 1:1 en coordenadas SVG [xMin..xMax, yMin..yMax] para attachSvgDrag.
 */
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
