/**
 * scale.js — Utilidades de escala matemática adaptativa y formateo compacto
 * para planos cartesianos en el Laboratorio de Sucesiones.
 *
 * Evita explosiones de ticks en createPlane(), formatea valores grandes (k, M, B)
 * y garantiza que los gráficos respondan en milisegundos sin congelar el navegador.
 */

import { fmt } from '../../core/math-format.js';

/**
 * Formatea un número de forma compacta (ej. 10k, 2.5M, $15k) para que quepa
 * perfectamente en el margen izquierdo de 44px de los ejes cartesianos.
 *
 * @param {number} num
 * @param {object} [options]
 * @param {boolean} [options.currency=false]
 * @returns {string}
 */
export function compactFmt(num, { currency = false } = {}) {
  if (!Number.isFinite(num)) return '';
  if (Math.abs(num) < 1e-9) return currency ? '$0' : '0';

  const abs = Math.abs(num);
  const sign = num < 0 ? '−' : '';
  const curr = currency ? '$' : '';

  if (abs >= 1e9) {
    const val = abs / 1e9;
    const str = val >= 100 || val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${curr}${sign}${str}B`;
  }
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
    return `${curr}${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`;
  }

  // Decimales menores a 1
  return `${curr}${sign}${fmt(abs)}`;
}

/**
 * Calcula límites y paso adaptativos "bonitos" (nice numbers: 1, 2, 5 x 10^k)
 * para un eje cartesiano, garantizando un número controlado de marcas (3 a 8 ticks)
 * independientemente de la magnitud de los datos.
 *
 * @param {object} options
 * @param {number} options.minVal  Mínimo valor observado
 * @param {number} options.maxVal  Máximo valor observado
 * @param {number} [options.targetTicks=6]  Cantidad objetivo de divisiones
 * @param {boolean} [options.forceZero=true]  Garantiza incluir el origen 0
 * @param {number} [options.padRatio=0.12] Margen de holgura porcentual
 * @param {boolean} [options.currency=false] Si los valores representan dinero ($)
 * @returns {{ yMin: number, yMax: number, yStep: number, ySpan: number, tickCount: number, yFmt: Function }}
 */
export function calcSafeAxis({
  minVal,
  maxVal,
  targetTicks = 6,
  forceZero = true,
  padRatio = 0.12,
  currency = false,
} = {}) {
  let low = Number.isFinite(minVal) ? minVal : 0;
  let high = Number.isFinite(maxVal) ? maxVal : 10;

  if (forceZero) {
    low = Math.min(low, 0);
    high = Math.max(high, 0);
  }

  if (low > high) {
    const tmp = low;
    low = high;
    high = tmp;
  }

  let span = high - low;
  if (span < 1e-9) {
    high = low + 10;
    span = 10;
  }

  // Margen de holgura
  const pad = span * padRatio;
  const paddedMin = low < 0 ? low - pad : (forceZero ? 0 : low - pad);
  const paddedMax = high > 0 ? high + pad : (forceZero ? 0 : high + pad);
  const effSpan = Math.max(1e-9, paddedMax - paddedMin);

  // Cálculo de paso bonito (nice step)
  let rawStep = effSpan / targetTicks;
  if (rawStep <= 0 || !Number.isFinite(rawStep)) rawStep = 1;

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let multiplier = 1;
  if (residual > 7.5) {
    multiplier = 10;
  } else if (residual > 3.5) {
    multiplier = 5;
  } else if (residual > 1.5) {
    multiplier = 2;
  } else {
    multiplier = 1;
  }

  let step = multiplier * magnitude;
  if (step <= 0 || !Number.isFinite(step)) step = 1;

  let yMin = Math.floor(paddedMin / step) * step;
  let yMax = Math.ceil(paddedMax / step) * step;

  // Ajuste fino si hay demasiados o muy pocos ticks
  let tickCount = Math.round((yMax - yMin) / step);
  if (tickCount > 9) {
    step *= 2;
    yMin = Math.floor(paddedMin / step) * step;
    yMax = Math.ceil(paddedMax / step) * step;
    tickCount = Math.round((yMax - yMin) / step);
  } else if (tickCount < 3 && effSpan > 0) {
    step = Math.max(1e-6, step / 2);
    yMin = Math.floor(paddedMin / step) * step;
    yMax = Math.ceil(paddedMax / step) * step;
    tickCount = Math.round((yMax - yMin) / step);
  }

  return {
    yMin,
    yMax,
    yStep: step,
    ySpan: yMax - yMin,
    tickCount,
    yFmt: (t) => compactFmt(t, { currency }),
  };
}
