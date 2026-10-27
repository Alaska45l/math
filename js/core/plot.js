/**
 * plot.js — Plano cartesiano SVG reutilizable (escalas, grilla, ejes,
 * capas y muestreo de curvas con cortes en discontinuidades).
 */
import { s, mount, svgPoint } from './dom.js';
import { fmt } from './math-format.js';

let uid = 0;

/**
 * Interacción directa sobre un plano: clic o arrastre (mouse, lápiz o dedo).
 * Convierte la posición del puntero (coordenadas del viewBox) a coordenadas
 * matemáticas usando las escalas inversas del plano.
 *
 * @param {SVGSVGElement} svg
 * @param {object|Function} planeOrGetter  plano de createPlane() o función que lo devuelve
 *                                          (útil si el plano se recrea al cambiar de contexto)
 * @param {Function} onMove  ({ x, y, phase: 'start'|'move'|'end', event }) => void
 *                           x e y llegan recortados al rango visible del plano.
 * @returns {Function} función para desvincular los eventos
 */
export function bindSvgDrag(svg, planeOrGetter, onMove) {
  const getPlane = typeof planeOrGetter === 'function' ? planeOrGetter : () => planeOrGetter;
  let dragging = false;

  const emit = (event, phase) => {
    const plane = getPlane();
    if (!plane) return;
    const p = svgPoint(svg, event);
    const { xMin, xMax, yMin, yMax } = plane.cfg;
    const x = Math.min(xMax, Math.max(xMin, plane.invX(p.x)));
    const y = Math.min(yMax, Math.max(yMin, plane.invY(p.y)));
    onMove({ x, y, phase, event });
  };

  const down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    try { svg.setPointerCapture?.(e.pointerId); } catch (_) {}
    svg.classList.add('is-dragging');
    e.preventDefault();
    emit(e, 'start');
  };
  const move = (e) => { if (dragging) emit(e, 'move'); };
  const up = (e) => {
    if (!dragging) return;
    dragging = false;
    try { svg.releasePointerCapture?.(e.pointerId); } catch (_) {}
    svg.classList.remove('is-dragging');
    emit(e, 'end');
  };

  svg.classList.add('is-interactive');
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  return () => {
    svg.removeEventListener('pointerdown', down);
    svg.removeEventListener('pointermove', move);
    svg.removeEventListener('pointerup', up);
    svg.removeEventListener('pointercancel', up);
  };
}

/** Imán suave: si v está a menos de `radius` de algún valor clave, se pega a él. */
export function snapTo(v, keys = [], radius = 0.1) {
  let best = v, bestD = radius;
  keys.forEach((k) => {
    const d = Math.abs(v - k);
    if (d <= bestD) { best = k; bestD = d; }
  });
  return best;
}

/**
 * @param {SVGSVGElement} svg
 * @param {object} cfg { xMin, xMax, yMin, yMax, width, height, pad, xStep, yStep,
 *                       xLabel, yLabel, xFmt, yFmt, grid }
 */
export function createPlane(svg, cfg) {
  const c = {
    width: 600, height: 420, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y',
    xFmt: (t) => fmt(t), yFmt: (t) => fmt(t), grid: true, ...cfg,
  };
  c.pad = { l: 44, r: 20, t: 18, b: 34, ...(cfg.pad || {}) };
  const W = c.width, H = c.height, P = c.pad;
  const pw = W - P.l - P.r, ph = H - P.t - P.b;

  const sx = (x) => P.l + ((x - c.xMin) / (c.xMax - c.xMin)) * pw;
  const sy = (y) => P.t + ((c.yMax - y) / (c.yMax - c.yMin)) * ph;
  const invX = (px) => c.xMin + ((px - P.l) / pw) * (c.xMax - c.xMin);
  const invY = (py) => c.yMax - ((py - P.t) / ph) * (c.yMax - c.yMin);
  const clampY = (y) => Math.max(c.yMin - (c.yMax - c.yMin), Math.min(c.yMax + (c.yMax - c.yMin), y));

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.classList.add('plot');
  const clipId = `plot-clip-${++uid}`;

  const defs = s('defs', null,
    s('clipPath', { id: clipId }, s('rect', { x: P.l, y: P.t, width: pw, height: ph })),
    s('marker', {
      id: `${clipId}-arrow`, viewBox: '0 0 10 10', refX: 8, refY: 5,
      markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse',
    }, s('path', { d: 'M 1.5 1.5 L 8.5 5 L 1.5 8.5', class: 'plot-arrowhead' })),
    s('filter', {
      id: `${clipId}-chalk`, x: '-5%', y: '-5%', width: '110%', height: '110%',
      filterUnits: 'userSpaceOnUse',
    },
      s('feTurbulence', {
        id: `${clipId}-turb`, type: 'fractalNoise',
        baseFrequency: '0.9', numOctaves: '2', result: 'noise',
      }),
      s('feDisplacementMap', {
        in: 'SourceGraphic', in2: 'noise', scale: '1.4',
        xChannelSelector: 'R', yChannelSelector: 'G',
      })
    ),
  );

  const layers = {};
  const order = ['bg', 'grid', 'shade', 'axes', 'axisLabels', 'under', 'curve', 'over', 'marks', 'labels'];
  const root = [];
  order.forEach((name) => {
    const clipped = ['bg', 'shade', 'under', 'curve', 'over'].includes(name);
    const filtered = ['axes', 'curve'].includes(name);
    layers[name] = s('g', {
      class: `plot-layer plot-layer--${name}`,
      'clip-path': clipped ? `url(#${clipId})` : null,
      filter: filtered ? `url(#${clipId}-chalk)` : null,
    });
    root.push(layers[name]);
  });
  mount(svg, defs, ...root);

  /* ---------- Escala dinámica de fuentes SVG y compensación de grano ---------- */
  function updateSvgFontScale() {
    const clientW = svg.clientWidth || svg.getBoundingClientRect().width;
    if (!clientW || !W) return;
    const scale = clientW / W;
    if (scale <= 0) return;
    const caveatSize = Math.max(14, Math.round((14 / scale) * 10) / 10);
    const kalamSize = Math.max(12, Math.round((12 / scale) * 10) / 10);
    svg.style.setProperty('--svg-scale-caveat', `${caveatSize}px`);
    svg.style.setProperty('--svg-scale-kalam', `${kalamSize}px`);

    const turb = svg.querySelector(`#${clipId}-turb`);
    if (turb) {
      const baseFreq = (0.9 * (W / clientW)).toFixed(4);
      turb.setAttribute('baseFrequency', baseFreq);
    }
  }
  updateSvgFontScale();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(updateSvgFontScale);
    ro.observe(svg);
  }

  /* ---------- Grilla y ejes ---------- */
  const xAxisY = sy(Math.min(Math.max(0, c.yMin), c.yMax));
  const yAxisX = sx(Math.min(Math.max(0, c.xMin), c.xMax));

  function ticks(min, max, step) {
    const out = [];
    const start = Math.ceil(min / step) * step;
    for (let t = start; t <= max + 1e-9; t += step) out.push(Number(t.toFixed(6)));
    return out;
  }

  const grid = layers.grid;
  if (c.grid) {
    ticks(c.xMin, c.xMax, c.xStep).forEach((t) =>
      grid.append(s('line', { x1: sx(t), y1: P.t, x2: sx(t), y2: P.t + ph, class: 'plot-grid' })));
    ticks(c.yMin, c.yMax, c.yStep).forEach((t) =>
      grid.append(s('line', { x1: P.l, y1: sy(t), x2: P.l + pw, y2: sy(t), class: 'plot-grid' })));
  }
  const axes = layers.axes;
  const axisLabels = layers.axisLabels;
  axes.append(
    s('line', { x1: P.l, y1: xAxisY, x2: P.l + pw + 8, y2: xAxisY, class: 'plot-axis', 'marker-end': `url(#${clipId}-arrow)` }),
    s('line', { x1: yAxisX, y1: P.t + ph, x2: yAxisX, y2: P.t - 8, class: 'plot-axis', 'marker-end': `url(#${clipId}-arrow)` }),
  );
  axisLabels.append(
    s('text', { x: P.l + pw + 6, y: xAxisY - 8, class: 'plot-axis-label', 'text-anchor': 'end' }, c.xLabel),
    s('text', { x: yAxisX + 8, y: P.t + 4, class: 'plot-axis-label' }, c.yLabel),
  );
  const isMobileScreen = typeof window !== 'undefined' ? (window.innerWidth <= 600) : false;
  const helpers = { sx, sy, xAxisY, yAxisX };
  ticks(c.xMin, c.xMax, c.xStep).forEach((t) => {
    if (Math.abs(t) < 1e-9 && c.xMin < 0) return;
    axes.append(
      s('line', { x1: sx(t), y1: xAxisY - 3, x2: sx(t), y2: xAxisY + 3, class: 'plot-axis' }),
    );
    if (isMobileScreen && (c.xMax - c.xMin) >= 7 && c.xStep === 1 && Math.abs(t % 2) > 0.01) return;
    const txt = c.xFmt(t);
    if (!txt) return;
    const pos = (typeof c.xTickPos === 'function' && c.xTickPos(t, helpers)) || { x: sx(t), y: xAxisY + 26, anchor: 'middle' };
    axisLabels.append(
      s('text', { x: pos.x, y: pos.y, class: 'plot-tick', 'text-anchor': pos.anchor }, txt),
    );
  });
  ticks(c.yMin, c.yMax, c.yStep).forEach((t) => {
    if (Math.abs(t) < 1e-9 && c.yMin < 0) return;
    axes.append(
      s('line', { x1: yAxisX - 3, y1: sy(t), x2: yAxisX + 3, y2: sy(t), class: 'plot-axis' }),
    );
    if (isMobileScreen && (c.yMax - c.yMin) >= 7 && c.yStep === 1 && Math.abs(t % 2) > 0.01) return;
    const txt = c.yFmt(t);
    if (!txt) return;
    const pos = (typeof c.yTickPos === 'function' && c.yTickPos(t, helpers)) || { x: yAxisX - 8, y: sy(t) + 4, anchor: 'end' };
    axisLabels.append(
      s('text', { x: pos.x, y: pos.y, class: 'plot-tick', 'text-anchor': pos.anchor }, txt),
    );
  });
  if (c.xMin < 0 && c.yMin < 0) {
    const originTxt = c.xFmt ? c.xFmt(0) : '0';
    if (originTxt) {
      const pos = (typeof c.originPos === 'function' && c.originPos(helpers)) || c.originPos || { x: yAxisX - 8, y: xAxisY - 6, anchor: 'end' };
      axisLabels.append(s('text', { x: pos.x, y: pos.y, class: 'plot-tick', 'text-anchor': pos.anchor }, '0'));
    }
  }

  /* ---------- Curvas ---------- */

  /**
   * Path de y = f(x) en [a, b]. Corta el trazo cuando f no es finita,
   * en los x listados en `breaks`, o ante saltos verticales enormes.
   */
  function fnPath(f, a, b, { samples = 400, breaks = [] } = {}) {
    let d = '';
    let pen = false;
    const n = samples;
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(a + ((b - a) * i) / n);
    breaks.forEach((x0) => {
      if (x0 > a && x0 < b) pts.push(x0 - 1e-6 * (b - a), x0 + 1e-6 * (b - a));
    });
    pts.sort((p, q) => p - q);
    let prevX = null;
    for (const x of pts) {
      const y = f(x);
      const crossed = prevX !== null && breaks.some((x0) => prevX < x0 && x > x0);
      if (!Number.isFinite(y) || crossed) {
        pen = false;
        if (!Number.isFinite(y)) { prevX = x; continue; }
      }
      const X = sx(x).toFixed(2), Y = sy(clampY(y)).toFixed(2);
      d += pen ? `L${X} ${Y}` : `M${X} ${Y}`;
      pen = true;
      prevX = x;
    }
    return d;
  }

  /** Path de una lista de puntos [[x,y], ...] en coordenadas matemáticas. */
  function linePath(points, close = false) {
    return points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`).join('') + (close ? 'Z' : '');
  }

  /** Recta y = m x + b recortada al área visible. */
  function linePathMB(m, b) {
    return linePath([[c.xMin, m * c.xMin + b], [c.xMax, m * c.xMax + b]]);
  }

  return {
    cfg: c, sx, sy, invX, invY, layers, fnPath, linePath, linePathMB,
    box: { x: P.l, y: P.t, w: pw, h: ph }, xAxisY, yAxisX, arrowId: `${clipId}-arrow`,
    clear(...names) { names.forEach((nm) => layers[nm].replaceChildren()); },
  };
}
