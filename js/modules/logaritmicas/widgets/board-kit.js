/**
 * board-kit.js — Envoltorio de dominio sobre `js/core/board-kit.js` para Widgets de Logarítmicas.
 * Reutiliza createPredictBox (POE 2 etapas), attachSvgDrag / addDraggableMarker accesibles por teclado,
 * applyPlaneClip y clampToPlane sin duplicar código del core.
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
  button as coreButton,
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
  button as coreButton,
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

export function button(label, iconOrOnClick, onClick, className = 'chip', attrs = {}) {
  if (typeof iconOrOnClick === 'function') {
    const fn = iconOrOnClick;
    const cls = typeof onClick === 'string' ? onClick : 'chip';
    const extra = typeof className === 'object' && className !== null ? className : attrs;
    return coreButton(label, null, fn, cls, extra);
  }
  return coreButton(label, iconOrOnClick, onClick, className, attrs);
}

export function applyPlaneClip(board, plane) {
  return coreApplyPlaneClip(board, plane, 'log');
}

export function createBoard(host, title, viewBox = '0 0 640 340') {
  return coreCreateBoard(host, title, viewBox, { prefix: 'log', wrapFrame: false });
}

export function createCartesianBoard(host, title, planeCfg = {}) {
  return coreCreateCartesianBoard(host, title, { width: 640, height: 340, ...planeCfg }, { prefix: 'log', wrapFrame: false });
}

export function createPredictBox(options = {}) {
  return coreCreatePredictBox({ ...options, classPrefix: 'log', optionClass: 'chip chip--ghost pr-chip' });
}

export const createPredictorBanner = createPredictBox;

/**
 * Genera el path SVG de una función logarítmica f(x) = k * log_a(m*x + d) + c
 * con muestreo denso cerca de la asíntota vertical x = -d/m para evitar saltos.
 */
export function plotLogCurve(plane, { k = 1, a = 2, m = 1, d = 0, c = 0 } = {}) {
  if (!plane || !plane.cfg) return '';
  if (a <= 0 || Math.abs(a - 1) < 1e-9 || Math.abs(m) < 1e-9 || Math.abs(k) < 1e-9) return '';

  const xAs = -d / m;
  const { xMin, xMax, yMin, yMax } = plane.cfg;
  const spanY = yMax - yMin;
  const yFloor = yMin - spanY;
  const yCeil = yMax + spanY;

  const xs = [];
  const steps = 160;

  if (m > 0) {
    const startX = Math.max(xMin, xAs + 1e-4);
    if (startX >= xMax) return '';
    // Muestreo logarítmico cerca de la asíntota + muestreo uniforme en el resto
    const nearSpan = Math.min(xMax - startX, 0.8);
    for (let i = 0; i < 36; i++) {
      const fracStep = i / 35;
      xs.push(xAs + 1e-4 + Math.pow(fracStep, 3) * nearSpan);
    }
    const restStart = startX + (xAs + 1e-4 >= xMin ? nearSpan : 0);
    if (restStart < xMax) {
      for (let i = 0; i <= steps; i++) {
        xs.push(restStart + (i / steps) * (xMax - restStart));
      }
    }
  } else {
    const endX = Math.min(xMax, xAs - 1e-4);
    if (endX <= xMin) return '';
    const nearSpan = Math.min(endX - xMin, 0.8);
    const leftEnd = endX - (xAs - 1e-4 <= xMax ? nearSpan : 0);
    if (xMin < leftEnd) {
      for (let i = 0; i <= steps; i++) {
        xs.push(xMin + (i / steps) * (leftEnd - xMin));
      }
    }
    for (let i = 35; i >= 0; i--) {
      const fracStep = i / 35;
      xs.push(xAs - 1e-4 - Math.pow(fracStep, 3) * nearSpan);
    }
  }

  xs.sort((u, v) => u - v);
  const commands = [];
  let penDown = false;

  for (const x of xs) {
    if (x < xMin - 1e-6 || x > xMax + 1e-6) continue;
    const arg = m * x + d;
    if (arg <= 0) {
      penDown = false;
      continue;
    }
    const y = k * (Math.log(arg) / Math.log(a)) + c;
    if (!Number.isFinite(y)) {
      penDown = false;
      continue;
    }
    const clampedY = Math.max(yFloor, Math.min(yCeil, y));
    const px = plane.sx(x);
    const py = plane.sy(clampedY);
    commands.push(`${penDown ? 'L' : 'M'} ${px.toFixed(2)} ${py.toFixed(2)}`);
    penDown = true;
  }

  return commands.join(' ');
}

export function plotVerticalAsymptote(plane, xAs, attrs = {}) {
  const x = plane.sx(xAs);
  const y1 = plane.box.y;
  const y2 = plane.box.y + plane.box.h;
  return s('line', {
    x1: x,
    y1,
    x2: x,
    y2,
    class: 'log-svg-asymptote',
    ...attrs,
  });
}

export function formatLogFormula({ k = 1, a = 2, m = 1, d = 0, c = 0 } = {}) {
  let prefix = '';
  if (k === -1) prefix = MINUS;
  else if (k !== 1) prefix = `${fmt(k)} · `;

  let logName;
  if (Math.abs(a - Math.E) < 1e-9) logName = 'ln';
  else if (Math.abs(a - 10) < 1e-9) logName = 'log';
  else if (Math.abs(a - 0.5) < 1e-9) logName = 'log_(1/2)';
  else if (Math.abs(a - 1 / 3) < 1e-9) logName = 'log_(1/3)';
  else logName = `log_${fmt(a)}`;

  let inner = '';
  if (m === -1) inner += MINUS;
  else if (m !== 1) inner += fmt(m);
  inner += 'x';
  if (d > 0) inner += ` + ${fmt(d)}`;
  else if (d < 0) inner += ` ${MINUS} ${fmt(-d)}`;

  let str = `${prefix}${logName}(${inner})`;
  if (c > 0) str += ` + ${fmt(c)}`;
  else if (c < 0) str += ` ${MINUS} ${fmt(-c)}`;
  return str;
}
