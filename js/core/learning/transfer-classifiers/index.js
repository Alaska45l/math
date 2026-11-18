/**
 * @file js/core/learning/transfer-classifiers/index.js
 * Deterministic registration index of all 8 model family classifiers.
 * ZERO imports from js/modules/*. Zero DOM. Zero eval. Zero emojis.
 */

import { linearClassifier } from './linear.js';
import { quadraticClassifier } from './quadratic.js';
import { polynomialClassifier } from './polynomial.js';
import { rationalClassifier } from './rational.js';
import { radicalClassifier } from './radical.js';
import { exponentialClassifier } from './exponential.js';
import { logarithmicClassifier } from './logarithmic.js';
import { trigonometricClassifier } from './trigonometric.js';

export const BUILTIN_MODEL_CLASSIFIERS = Object.freeze([
  linearClassifier,
  quadraticClassifier,
  polynomialClassifier,
  rationalClassifier,
  radicalClassifier,
  exponentialClassifier,
  logarithmicClassifier,
  trigonometricClassifier,
]);

export {
  linearClassifier,
  quadraticClassifier,
  polynomialClassifier,
  rationalClassifier,
  radicalClassifier,
  exponentialClassifier,
  logarithmicClassifier,
  trigonometricClassifier,
};
