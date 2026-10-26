/**
 * plot.js — Plano cartesiano SVG reutilizable (escalas, grilla, ejes,
 * capas y muestreo de curvas con cortes en discontinuidades).
 */
import { s, mount } from './dom.js';
import { fmt } from './math-format.js';

let uid = 0;

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
      markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
    }, s('path', { d: 'M0 0L10 5L0 10z', class: 'plot-arrowhead' })),
  );

  const layers = {};
  const order = ['bg', 'grid', 'shade', 'axes', 'under', 'curve', 'over', 'marks', 'labels'];
  const root = [];
  order.forEach((name) => {
    const clipped = ['bg', 'shade', 'under', 'curve', 'over'].includes(name);
    layers[name] = s('g', { class: `plot-layer plot-layer--${name}`, 'clip-path': clipped ? `url(#${clipId})` : null });
    root.push(layers[name]);
  });
  mount(svg, defs, ...root);

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
  axes.append(
    s('line', { x1: P.l, y1: xAxisY, x2: P.l + pw + 8, y2: xAxisY, class: 'plot-axis', 'marker-end': `url(#${clipId}-arrow)` }),
    s('line', { x1: yAxisX, y1: P.t + ph, x2: yAxisX, y2: P.t - 8, class: 'plot-axis', 'marker-end': `url(#${clipId}-arrow)` }),
    s('text', { x: P.l + pw + 6, y: xAxisY - 8, class: 'plot-axis-label', 'text-anchor': 'end' }, c.xLabel),
    s('text', { x: yAxisX + 8, y: P.t + 4, class: 'plot-axis-label' }, c.yLabel),
  );
  ticks(c.xMin, c.xMax, c.xStep).forEach((t) => {
    if (Math.abs(t) < 1e-9 && c.xMin < 0) return;
    axes.append(
      s('line', { x1: sx(t), y1: xAxisY - 3, x2: sx(t), y2: xAxisY + 3, class: 'plot-axis' }),
      s('text', { x: sx(t), y: xAxisY + 16, class: 'plot-tick', 'text-anchor': 'middle' }, c.xFmt(t)),
    );
  });
  ticks(c.yMin, c.yMax, c.yStep).forEach((t) => {
    if (Math.abs(t) < 1e-9 && c.yMin < 0) return;
    axes.append(
      s('line', { x1: yAxisX - 3, y1: sy(t), x2: yAxisX + 3, y2: sy(t), class: 'plot-axis' }),
      s('text', { x: yAxisX - 6, y: sy(t) + 4, class: 'plot-tick', 'text-anchor': 'end' }, c.yFmt(t)),
    );
  });
  if (c.xMin < 0 && c.yMin < 0) {
    axes.append(s('text', { x: yAxisX - 6, y: xAxisY + 16, class: 'plot-tick', 'text-anchor': 'end' }, '0'));
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
