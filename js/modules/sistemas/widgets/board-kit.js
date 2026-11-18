/**
 * @file js/modules/sistemas/widgets/board-kit.js
 * Wrapper de compatibilidad sobre `js/core/board-kit.js` para Unidad 04 · Sistemas 2×2.
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
import { clipLineToBox, clampPx } from '../../lineal/widgets/board-kit.js';

export function createSysBoardSvg(options = {}) {
  return coreCreateBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Pizarrón interactivo de sistemas de ecuaciones lineales 2×2',
    className: 'sys-board-svg',
    ...options,
  });
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'sys' });
}

export {
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  attachSvgDrag,
  createSliderField,
  clipLineToBox,
  clampPx,
};
