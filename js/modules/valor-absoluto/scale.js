/**
 * scale.js — Utilidades de escala matemática adaptativa y formateo compacto
 * para planos cartesianos en el Laboratorio de Valor Absoluto y Funciones por Partes.
 */

import { fmt } from '../../core/math-format.js';

export function compactFmt(num, { currency = false } = {}) {
  if (!Number.isFinite(num)) return '';
  if (Math.abs(num) < 1e-9) return currency ? '$0' : '0';

  const abs = Math.abs(num);
  const sign = num < 0 ? '−' : '';
  const curr = currency ? '$' : '';

  if (abs >= 1e6) {
    const val = abs / 1e6;
    const str = val >= 100 || val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${curr}${sign}${str}M`;
  }
  if (abs >= 1e3) {
    const val = abs / 1e3;
    const str = val >= 100 || val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${curr}${sign}${str}k`;
  }
  if (abs >= 10) {
    return `${curr}${sign}${Math.round(abs)}`;
  }
  if (abs >= 1) {
    const rounded = Math.round(abs * 10) / 10;
    return `${curr}${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : fmt(rounded)}`;
  }
  return `${curr}${sign}${fmt(abs)}`;
}

export function calcSafeAxis({
  minVal = -8,
  maxVal = 8,
  targetTicks = 8,
  forceZero = true,
  padRatio = 0.1,
  currency = false,
} = {}) {
  let low = Number.isFinite(minVal) ? minVal : -8;
  let high = Number.isFinite(maxVal) ? maxVal : 8;

  if (forceZero) {
    low = Math.min(low, 0);
    high = Math.max(high, 0);
  }
  if (low > high) [low, high] = [high, low];

  let span = high - low;
  if (span < 1e-9) {
    high = low + 8;
    span = 8;
  }

  const pad = span * padRatio;
  const paddedMin = low - pad;
  const paddedMax = high + pad;
  const effSpan = Math.max(1e-9, paddedMax - paddedMin);

  let rawStep = effSpan / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let multiplier = 1;
  if (residual > 7.5) multiplier = 10;
  else if (residual > 3.5) multiplier = 5;
  else if (residual > 1.5) multiplier = 2;

  const step = Math.max(1, multiplier * magnitude);
  const yMin = Math.floor(paddedMin / step) * step;
  const yMax = Math.ceil(paddedMax / step) * step;

  return {
    yMin,
    yMax,
    yStep: step,
    ySpan: yMax - yMin,
    yFmt: (t) => compactFmt(t, { currency }),
  };
}
