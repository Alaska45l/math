/**
 * @file js/modules/lineal/widgets/board-kit.js
 * Wrapper de compatibilidad sobre el kit compartido `js/core/board-kit.js` para Unidad 03 (lineal).
 */

import {
  createQuadBoardSvg as coreCreateBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
  createPredictBox as coreCreatePredictBox,
} from '../../../core/board-kit.js';

export function createLineBoardSvg(options = {}) {
  return coreCreateBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Pizarrón interactivo de función lineal',
    className: 'lin-board-svg',
    ...options,
  });
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'lin' });
}

export function clampPx(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calcula los extremos de una recta Ax + By + C = 0 (en números reales) dentro del rectángulo [xMin..xMax, yMin..yMax].
 */
export function clipLineToBox(A, B, C, mapper) {
  const { xMin, xMax, yMin, yMax } = mapper;
  if (Math.abs(B) < 1e-9 && Math.abs(A) < 1e-9) return null;

  if (Math.abs(B) < 1e-9) {
    const x0 = -C / A;
    if (x0 < xMin - 1 || x0 > xMax + 1) return null;
    return { x1: x0, y1: yMin, x2: x0, y2: yMax };
  }

  const m = -A / B;
  const b = -C / B;
  const yAtMin = m * xMin + b;
  const yAtMax = m * xMax + b;
  return {
    x1: xMin - 0.5,
    y1: m * (xMin - 0.5) + b,
    x2: xMax + 0.5,
    y2: m * (xMax + 0.5) + b,
    yAtMin,
    yAtMax,
  };
}

export {
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
};
