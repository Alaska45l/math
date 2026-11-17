/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Wrapper de compatibilidad sobre el kit compartido `js/core/board-kit.js`.
 */

import {
  createQuadBoardSvg as coreCreateQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
  createPredictBox as coreCreatePredictBox,
} from '../../../core/board-kit.js';

export function createQuadBoardSvg(options = {}) {
  return coreCreateQuadBoardSvg({
    ariaLabel: 'Pizarrón interactivo de función cuadrática',
    className: 'quad-board-svg',
    ...options,
  });
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'quad' });
}

export const createPredictorBanner = createPredictBox;

export {
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
};
