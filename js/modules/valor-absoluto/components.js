/**
 * components.js — Componentes transversales accesibles para el Laboratorio de Valor Absoluto y Funciones por Partes:
 * 1. createAbsBoard(root, props): Lienzo Cartesiano Dinámico de Valor Absoluto con arrastre directo y teclado.
 * 2. annotatedAbsFormula(root, config): Fórmula interactiva f(x) = a|x - h| + k con tokens explicados.
 * 3. piecewiseBrace(root, pieces, activePieceIdx): Llave matemática estilizada en CSS con resaltado en vivo.
 * 4. createCheckBlock(root, questions, sectionId, onComplete): Bloque de chequeo autocorregido con 'graph-target', 'vertex', 'expr', etc.
 */

import { h, s, mount, chalkIcon } from '../../core/dom.js';
import { fmt, frac, MINUS } from '../../core/math-format.js';
import { createPlane, bindSvgDrag, snapTo } from '../../core/plot.js';
import { react } from '../../core/vn.js';
import { playSuccess, playError, playSliderTick } from '../../core/sound.js';
import { tryParseExpr, toDisplay, equivalentFx } from './expr.js';
import {
  approxEq,
  evalAbs,
  solveAbsComparison,
  diagnoseAbs,
  formatCanonicalAbs,
} from './logic.js';
import { DIAGNOSE_REACTIONS } from './vn-scripts.js';

const PROGRESS_KEY = 'valor_absoluto:progreso:v1';

export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

export function saveSectionProgress(sectionId) {
  try {
    const current = getProgress();
    current[sectionId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  } catch (_) {}
}

/**
 * Helper visual para punto abierto vs cerrado inmune a la fuente (evita ○ vs ● idénticos).
 */
export function dotBadge(closed = false, extraClass = '') {
  return h('span', {
    class: ['va-dot', closed ? 'va-dot--closed' : 'va-dot--open', extraClass],
    'aria-label': closed ? 'punto cerrado' : 'punto abierto',
  });
}

/**
 * Formatea un número real devolviendo un nodo .fr si es una fracción racional simple
 * (ej. 1/2, -1/2, 1/3, -1/3, 2/3, 3/2, 1/4, 3/4), o texto limpio en caso contrario.
 */
export function formatNumOrFracNode(val, { forcePlus = false } = {}) {
  if (!Number.isFinite(val)) return document.createTextNode(String(val));
  const sign = val < -1e-9 ? `${MINUS}` : (forcePlus && val > 1e-9 ? '+' : '');
  const absV = Math.abs(val);
  if (Math.abs(absV - Math.round(absV)) < 1e-6) {
    return document.createTextNode(`${sign}${fmt(Math.round(absV))}`);
  }
  const denoms = [2, 3, 4, 5];
  for (const d of denoms) {
    const n = Math.round(absV * d);
    if (Math.abs(absV - n / d) < 1e-4 && n > 0) {
      return h('span', { style: 'display: inline-flex; align-items: center; gap: 2px;' },
        sign ? h('span', null, sign) : null,
        frac(String(n), String(d))
      );
    }
  }
  return document.createTextNode(`${sign}${fmt(absV)}`);
}

/**
 * 1. createAbsBoard(root, props)
 * Dibuja el plano cartesiano con la función f(x) = a|x - h| + k, eje de simetría x = h,
 * guías al vértice (h, k), prolongación fantasma opcional, láser horizontal y = c opcional,
 * y nodos arrastrables para el vértice (h, k), pendiente (h + 1, k + a) y explorador x.
 * Mantiene el nodo <svg> y la estructura base de createPlane persistentes durante el arrastre.
 */
export function createAbsBoard(root, initialProps = {}) {
  let props = {
    a: 1,
    h: 0,
    k: 0,
    laserY: 3,
    explorerX: null,
    xMin: -8,
    xMax: 8,
    yMin: -8,
    yMax: 8,
    width: 580,
    height: 360,
    snapStep: 0.5,
    draggableVertex: false,
    draggableSlope: false,
    draggableExplorer: false,
    showGhostLine: false,
    showHorizontalLaser: false,
    showSymmetryAxis: true,
    showSlopeTriangles: false,
    referenceCurve: null,
    customUnderRender: null,
    customOverRender: null,
    onChange: null,
    ...initialProps,
  };

  const svg = s('svg', {
    class: 'abs-board-svg abs-board__svg seq-plot',
    viewBox: `0 0 ${props.width} ${props.height}`,
    role: 'img',
    'aria-label': 'Plano cartesiano interactivo de valor absoluto',
  });

  mount(root, svg);

  let plane = null;
  let planeCfgKey = '';
  let activeDragMode = null; // 'vertex' | 'slope-right' | 'slope-left' | 'laser' | 'explorer'

  function snapVal(val, step = props.snapStep) {
    if (!step || step <= 0) return val;
    const rounded = Math.round(val / step) * step;
    return Number(rounded.toFixed(4));
  }

  function buildSnapKeys(min, max, step) {
    const keys = [];
    for (let v = min; v <= max + 1e-9; v += step) {
      keys.push(Number(v.toFixed(4)));
    }
    return keys;
  }

  function ensurePlane() {
    const { xMin, xMax, yMin, yMax, width, height } = props;
    const nextKey = `${width}:${height}:${xMin}:${xMax}:${yMin}:${yMax}`;
    if (!plane || planeCfgKey !== nextKey) {
      planeCfgKey = nextKey;
      plane = createPlane(svg, {
        width,
        height,
        xMin,
        xMax,
        yMin,
        yMax,
        xStep: (xMax - xMin) > 16 ? 2 : 1,
        yStep: (yMax - yMin) > 16 ? 2 : 1,
        xLabel: 'x',
        yLabel: 'y',
      });
    } else {
      plane.clear('shade', 'under', 'curve', 'over', 'marks', 'labels');
    }
  }

  function renderBoard() {
    const {
      a,
      h: hVal,
      k: kVal,
      laserY,
      xMin,
      xMax,
      yMin,
      yMax,
      width,
      height,
      draggableVertex,
      draggableSlope,
      showGhostLine,
      showHorizontalLaser,
      showSymmetryAxis,
      showSlopeTriangles,
      referenceCurve,
    } = props;

    ensurePlane();

    // Curva testigo de referencia opcional (ej. y = |x| en gris)
    if (referenceCurve) {
      const refFn = (x) => evalAbs(referenceCurve.a, referenceCurve.h, referenceCurve.k, x);
      const refPath = plane.fnPath(refFn, xMin, xMax, {
        samples: 200,
        breaks: [referenceCurve.h],
      });
      plane.layers.under.append(
        s('path', {
          d: refPath,
          fill: 'none',
          stroke: 'var(--muted)',
          'stroke-width': '2',
          'stroke-dasharray': '5 5',
          opacity: '0.65',
        })
      );
      if (referenceCurve.label) {
        plane.layers.labels.append(
          s('text', {
            x: plane.sx(referenceCurve.h + 2.2),
            y: plane.sy(evalAbs(referenceCurve.a, referenceCurve.h, referenceCurve.k, referenceCurve.h + 2.2)) - 8,
            fill: 'var(--muted)',
            'font-family': 'var(--font-hand)',
            'font-size': '13px',
          }, referenceCurve.label)
        );
      }
    }

    // Prolongación fantasma de la recta original sin rebotar
    if (showGhostLine && !approxEq(a, 0)) {
      const ghostPts = [
        [xMin, a * (xMin - hVal) + kVal],
        [hVal, kVal],
      ];
      plane.layers.under.append(
        s('path', {
          d: plane.linePath(ghostPts),
          fill: 'none',
          stroke: 'var(--muted)',
          'stroke-width': '2',
          'stroke-dasharray': '6 5',
          opacity: '0.75',
        })
      );

      const sampleX = Math.max(xMin + 1, hVal - 2.5);
      if (sampleX < hVal - 0.4) {
        const yRaw = a * (sampleX - hVal) + kVal;
        const yReflected = evalAbs(a, hVal, kVal, sampleX);
        if (yRaw >= yMin && yRaw <= yMax && yReflected >= yMin && yReflected <= yMax) {
          const sxSample = plane.sx(sampleX);
          const syRaw = plane.sy(yRaw);
          const syRef = plane.sy(yReflected);
          const ctrlX = sxSample - 22;
          const midY = (syRaw + syRef) / 2;
          plane.layers.under.append(
            s('path', {
              d: `M ${sxSample.toFixed(1)} ${syRaw.toFixed(1)} Q ${ctrlX.toFixed(1)} ${midY.toFixed(1)} ${sxSample.toFixed(1)} ${syRef.toFixed(1)}`,
              fill: 'none',
              stroke: 'var(--yellow)',
              'stroke-width': '1.8',
              'stroke-dasharray': '3 3',
              'marker-end': `url(#${plane.arrowId})`,
            })
          );
        }
      }
    }

    // Eje de simetría vertical x = h
    if (showSymmetryAxis) {
      const vx = plane.sx(hVal);
      plane.layers.under.append(
        s('line', {
          x1: vx,
          y1: plane.sy(yMin),
          x2: vx,
          y2: plane.sy(yMax),
          stroke: 'var(--yellow)',
          'stroke-width': '1.6',
          'stroke-dasharray': '5 5',
          opacity: '0.6',
        })
      );
    }

    // Guías punteadas de coordenadas del vértice (h, k) hacia los ejes
    if (!approxEq(hVal, 0) || !approxEq(kVal, 0)) {
      const vx = plane.sx(hVal);
      const vy = plane.sy(kVal);
      plane.layers.under.append(
        s('line', {
          x1: vx,
          y1: plane.xAxisY,
          x2: vx,
          y2: vy,
          stroke: 'var(--muted)',
          'stroke-width': '1.4',
          'stroke-dasharray': '3 3',
        }),
        s('line', {
          x1: plane.yAxisX,
          y1: vy,
          x2: vx,
          y2: vy,
          stroke: 'var(--muted)',
          'stroke-width': '1.4',
          'stroke-dasharray': '3 3',
        })
      );
    }

    // Triángulos de pendiente Δx = ±1, Δy = a
    if ((draggableSlope || showSlopeTriangles) && !approxEq(a, 0)) {
      const vx = plane.sx(hVal);
      const vy = plane.sy(kVal);
      const rx = plane.sx(hVal + 1);
      const ry = plane.sy(kVal + a);
      const lx = plane.sx(hVal - 1);
      const ly = plane.sy(kVal + a);

      plane.layers.under.append(
        s('path', {
          d: `M ${vx} ${vy} L ${rx} ${vy} L ${rx} ${ry}`,
          fill: 'color-mix(in srgb, var(--blue) 12%, transparent)',
          stroke: 'var(--blue)',
          'stroke-width': '1.8',
          'stroke-dasharray': '3 2',
        }),
        s('path', {
          d: `M ${vx} ${vy} L ${lx} ${vy} L ${lx} ${ly}`,
          fill: 'color-mix(in srgb, var(--blue) 8%, transparent)',
          stroke: 'var(--muted)',
          'stroke-width': '1.4',
          'stroke-dasharray': '3 2',
        }),
        s('text', {
          x: rx + 6,
          y: (vy + ry) / 2 + 4,
          fill: 'var(--blue)',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, `Δy = ${fmt(a)}`)
      );
    }

    if (typeof props.customUnderRender === 'function') {
      props.customUnderRender(plane, props);
    }

    // Curva principal f(x) = a|x - h| + k construida con precisión exacta pasando por el vértice
    const pts = [];
    if (hVal > xMin && hVal < xMax) {
      pts.push([xMin, evalAbs(a, hVal, kVal, xMin)]);
      pts.push([hVal, kVal]);
      pts.push([xMax, evalAbs(a, hVal, kVal, xMax)]);
    } else {
      pts.push([xMin, evalAbs(a, hVal, kVal, xMin)]);
      pts.push([xMax, evalAbs(a, hVal, kVal, xMax)]);
    }

    plane.layers.curve.append(
      s('path', {
        d: plane.linePath(pts),
        fill: 'none',
        stroke: 'var(--blue)',
        'stroke-width': '3.2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      })
    );

    // Láser horizontal arrastrable y = c
    if (showHorizontalLaser) {
      const ly = plane.sy(laserY);
      const sol = solveAbsComparison(a || 1, hVal, kVal, '=', laserY);
      const hasSols = sol.solutions.length > 0;
      const laserColor = hasSols ? 'var(--yellow)' : 'var(--pink)';

      plane.layers.over.append(
        s('line', {
          x1: plane.sx(xMin),
          y1: ly,
          x2: plane.sx(xMax),
          y2: ly,
          stroke: laserColor,
          'stroke-width': '2.4',
          'stroke-dasharray': hasSols ? 'none' : '6 4',
        })
      );

      sol.solutions.forEach((sxVal) => {
        if (sxVal >= xMin && sxVal <= xMax) {
          const px = plane.sx(sxVal);
          plane.layers.marks.append(
            s('line', {
              x1: px,
              y1: ly,
              x2: px,
              y2: plane.xAxisY,
              stroke: 'var(--yellow)',
              'stroke-width': '1.6',
              'stroke-dasharray': '3 3',
            }),
            s('circle', {
              cx: px,
              cy: ly,
              r: 6,
              fill: 'var(--yellow)',
              stroke: 'var(--bg)',
              'stroke-width': '2',
            }),
            s('circle', {
              cx: px,
              cy: plane.xAxisY,
              r: 4.5,
              fill: 'var(--yellow)',
            })
          );
        }
      });

      const laserHandle = s('g', {
        class: 'abs-board__handle abs-board__handle--laser',
        tabindex: '0',
        role: 'slider',
        'aria-label': `Altura del láser horizontal c = ${fmt(laserY)}`,
        'aria-valuenow': String(laserY),
        dataset: { handle: 'laser' },
      },
        s('rect', {
          x: plane.sx(xMax) - 76,
          y: ly - 13,
          width: 72,
          height: 24,
          rx: 4,
          fill: 'var(--bg)',
          stroke: laserColor,
          'stroke-width': '1.8',
        }),
        s('text', {
          x: plane.sx(xMax) - 40,
          y: ly + 4,
          fill: laserColor,
          'text-anchor': 'middle',
          'font-family': 'var(--font-hand)',
          'font-size': 'var(--svg-scale-caveat, 14px)',
          'font-weight': 'bold',
        }, `y = ${fmt(laserY)}`)
      );

      laserHandle.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 1 : 0.5;
        let nextC = props.laserY;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          nextC = Math.min(yMax, snapVal(props.laserY + step, 0.5));
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          nextC = Math.max(yMin, snapVal(props.laserY - step, 0.5));
        } else {
          return;
        }
        e.preventDefault();
        playSliderTick(1);
        props.laserY = nextC;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      });

      plane.layers.labels.append(laserHandle);
    }

    // Nodo de pendiente derecho (h + 1, k + a) y gemelo izquierdo (h - 1, k + a)
    if (draggableSlope) {
      const rx = plane.sx(hVal + 1);
      const ry = plane.sy(kVal + a);
      const lx = plane.sx(hVal - 1);
      const ly = plane.sy(kVal + a);

      const leftGroup = s('g', {
        class: 'abs-board__handle abs-board__handle--slope-left',
        dataset: { handle: 'slope-left' },
      },
        s('circle', { cx: lx, cy: ly, r: 13, fill: 'transparent' }),
        s('circle', {
          cx: lx,
          cy: ly,
          r: 6.5,
          fill: 'var(--bg)',
          stroke: 'var(--blue)',
          'stroke-width': '2.2',
        })
      );

      const slopeGroup = s('g', {
        class: 'abs-board__handle abs-board__handle--slope',
        tabindex: '0',
        role: 'slider',
        'aria-label': `Control de pendiente y apertura a = ${fmt(a)} en (${fmt(hVal + 1)}; ${fmt(kVal + a)})`,
        'aria-valuenow': String(a),
        dataset: { handle: 'slope-right' },
      },
        s('circle', {
          cx: rx,
          cy: ry,
          r: 13,
          fill: 'transparent',
        }),
        s('circle', {
          cx: rx,
          cy: ry,
          r: 7.5,
          fill: 'var(--blue)',
          stroke: 'var(--bg)',
          'stroke-width': '2.2',
        })
      );

      slopeGroup.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 1 : 0.5;
        let nextA = props.a;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          nextA = Math.min(5, snapVal(props.a + step, 0.5));
          if (approxEq(nextA, 0)) nextA = 0.5;
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          nextA = Math.max(-5, snapVal(props.a - step, 0.5));
          if (approxEq(nextA, 0)) nextA = -0.5;
        } else {
          return;
        }
        e.preventDefault();
        playSliderTick(1);
        props.a = nextA;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      });

      plane.layers.marks.append(leftGroup, slopeGroup);
    }

    // Nodo Vértice (h, k)
    const vx = plane.sx(hVal);
    const vy = plane.sy(kVal);

    const vertexGroup = s('g', {
      class: ['abs-board__handle', 'abs-board__handle--vertex', draggableVertex ? 'is-draggable' : ''],
      tabindex: draggableVertex ? '0' : null,
      role: draggableVertex ? 'slider' : null,
      'aria-label': draggableVertex ? `Vértice arrastrable en (${fmt(hVal)}; ${fmt(kVal)})` : null,
      dataset: { handle: 'vertex' },
    },
      draggableVertex ? s('circle', { cx: vx, cy: vy, r: 15, fill: 'transparent' }) : null,
      s('circle', {
        cx: vx,
        cy: vy,
        r: draggableVertex ? 8.5 : 6.5,
        fill: 'var(--yellow)',
        stroke: 'var(--bg)',
        'stroke-width': '2.4',
      })
    );

    if (draggableVertex) {
      vertexGroup.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 1 : props.snapStep || 1;
        let nextH = props.h;
        let nextK = props.k;
        if (e.key === 'ArrowRight') nextH = Math.min(xMax - 1, snapVal(props.h + step, step));
        else if (e.key === 'ArrowLeft') nextH = Math.max(xMin + 1, snapVal(props.h - step, step));
        else if (e.key === 'ArrowUp') nextK = Math.min(yMax - 1, snapVal(props.k + step, step));
        else if (e.key === 'ArrowDown') nextK = Math.max(yMin + 1, snapVal(props.k - step, step));
        else return;

        e.preventDefault();
        playSliderTick(1);
        props.h = nextH;
        props.k = nextK;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      });
    }

    plane.layers.marks.append(vertexGroup);

    // Etiqueta del vértice V(h; k) con halo de pizarra para evitar colisión con ejes
    const nearOrigin = Math.abs(hVal) < 0.6 && Math.abs(kVal) < 0.6;
    const labelOffsetX = nearOrigin ? 28 : 0;
    const labelOffsetY = a >= 0 ? 24 : -14;
    const clampedLabelY = Math.max(20, Math.min(height - 12, vy + labelOffsetY));
    plane.layers.labels.append(
      s('text', {
        x: Math.max(48, Math.min(width - 48, vx + labelOffsetX)),
        y: clampedLabelY,
        fill: 'var(--yellow)',
        'text-anchor': 'middle',
        'font-family': 'var(--font-hand)',
        'font-size': 'var(--svg-scale-caveat, 15px)',
        'font-weight': 'bold',
        style: 'paint-order: stroke; stroke: var(--bg); stroke-width: 4.5px; stroke-linejoin: round;',
      }, `V(${fmt(hVal)}; ${fmt(kVal)})`)
    );

    if (typeof props.customOverRender === 'function') {
      props.customOverRender(plane, props);
    }
  }

  // Vincular arrastre unificado en el SVG si alguna opción interactiva está activa
  bindSvgDrag(svg, () => plane, ({ x, y, phase, event }) => {
    const {
      draggableVertex,
      draggableSlope,
      draggableExplorer,
      showHorizontalLaser,
      xMin,
      xMax,
      yMin,
      yMax,
      snapStep,
    } = props;

    if (!draggableVertex && !draggableSlope && !showHorizontalLaser && !draggableExplorer) return;

    if (phase === 'start') {
      const targetHandle = event?.target?.closest?.('[data-handle]')?.dataset?.handle;
      if (targetHandle) {
        activeDragMode = targetHandle;
      } else {
        const distVertex = draggableVertex ? Math.hypot(x - props.h, y - props.k) : Infinity;
        const distSlopeR = draggableSlope ? Math.hypot(x - (props.h + 1), y - (props.k + props.a)) : Infinity;
        const distSlopeL = draggableSlope ? Math.hypot(x - (props.h - 1), y - (props.k + props.a)) : Infinity;
        const distLaser = showHorizontalLaser ? Math.abs(y - props.laserY) : Infinity;
        const distExplorer = draggableExplorer && props.explorerX !== null
          ? Math.abs(x - props.explorerX)
          : (draggableExplorer ? 0.5 : Infinity);

        const minD = Math.min(distVertex, distSlopeR, distSlopeL, distLaser, distExplorer);
        if (minD === distSlopeR) activeDragMode = 'slope-right';
        else if (minD === distSlopeL) activeDragMode = 'slope-left';
        else if (minD === distVertex) activeDragMode = 'vertex';
        else if (minD === distLaser) activeDragMode = 'laser';
        else if (minD === distExplorer) activeDragMode = 'explorer';
      }
    }

    if (!activeDragMode) return;

    const xKeys = buildSnapKeys(xMin + 1, xMax - 1, snapStep || 0.5);
    const yKeys = buildSnapKeys(yMin + 1, yMax - 1, snapStep || 0.5);

    if (activeDragMode === 'vertex' && draggableVertex) {
      const snappedH = snapTo(snapVal(x, snapStep), xKeys, 0.25);
      const snappedK = snapTo(snapVal(y, snapStep), yKeys, 0.25);
      const nextH = Math.max(xMin + 1, Math.min(xMax - 1, snappedH));
      const nextK = Math.max(yMin + 1, Math.min(yMax - 1, snappedK));
      if (nextH !== props.h || nextK !== props.k) {
        props.h = nextH;
        props.k = nextK;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      }
    } else if ((activeDragMode === 'slope-right' || activeDragMode === 'slope-left') && draggableSlope) {
      const rawA = y - props.k;
      let snappedA = snapVal(rawA, 0.5);
      if (Math.abs(snappedA) < 0.25) snappedA = rawA >= 0 ? 0.5 : -0.5;
      snappedA = Math.max(-5, Math.min(5, snappedA));
      if (snappedA !== props.a) {
        props.a = snappedA;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      }
    } else if (activeDragMode === 'laser' && showHorizontalLaser) {
      const nextC = Math.max(yMin, Math.min(yMax, snapVal(y, 0.5)));
      if (nextC !== props.laserY) {
        props.laserY = nextC;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      }
    } else if (activeDragMode === 'explorer' && draggableExplorer) {
      const nextX = Math.max(xMin + 0.5, Math.min(xMax - 0.5, snapVal(x, snapStep || 0.5)));
      if (nextX !== props.explorerX) {
        props.explorerX = nextX;
        renderBoard();
        props.onChange?.({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX });
      }
    }

    if (phase === 'end') {
      activeDragMode = null;
    }
  });

  renderBoard();

  return {
    svg,
    getPlane: () => plane,
    getState: () => ({ a: props.a, h: props.h, k: props.k, laserY: props.laserY, explorerX: props.explorerX }),
    update(newProps = {}) {
      props = { ...props, ...newProps };
      renderBoard();
    },
  };
}

/**
 * 2. annotatedAbsFormula(root, config)
 * Renderiza la ecuación general interactiva f(x) = a · |x - h| + k
 * donde cada token ('a', '−', 'h', 'k') despliega una nota explicativa al enfocar o hacer clic.
 */
export function annotatedAbsFormula(root, config = {}) {
  let state = {
    fnName: 'f',
    a: 1,
    h: 3,
    k: -2,
    ...config,
  };

  const noteArea = h('div', { class: 'seq-annotated__note-box', 'aria-live': 'polite' });
  const formulaWrap = h('div', { class: 'seq-annotated__formula abs-annotated__formula' });

  function showDefaultHint() {
    mount(
      noteArea,
      h('p', { class: 'seq-annotated__hint-text muted small' },
        'Tocá o pasá el mouse sobre cada pieza de la fórmula para descubrir qué controla en el gráfico:'
      )
    );
  }

  function showNote(text) {
    mount(noteArea, h('p', { class: 'seq-annotated__note annotated-Callout' }, text));
  }

  function makeToken(mainNode, subLabel, noteText, ariaDesc, colorMod = 'yellow') {
    const btn = h('button', {
      type: 'button',
      class: `seq-token abs-token af-token af-token--${colorMod}`,
      'aria-label': ariaDesc,
      tabindex: '0',
    },
      h('span', { class: 'abs-token__main af-token__main' }, mainNode),
      subLabel ? h('span', { class: 'abs-token__sub af-token__sub' }, subLabel) : null
    );

    btn.addEventListener('mouseenter', () => showNote(noteText));
    btn.addEventListener('mouseleave', () => showDefaultHint());
    btn.addEventListener('focus', () => showNote(noteText));
    btn.addEventListener('blur', () => showDefaultHint());
    btn.addEventListener('click', () => showNote(noteText));
    return btn;
  }

  function renderFormula() {
    const { fnName, a, h: hVal, k: kVal } = state;
    const aStr = fmt(a);
    const hInsideSign = hVal >= 0 ? MINUS : '+';
    const hAbsStr = fmt(Math.abs(hVal));
    const kSign = kVal >= 0 ? '+' : MINUS;
    const kAbsStr = fmt(Math.abs(kVal));

    const tokA = makeToken(
      formatNumOrFracNode(a),
      'apertura a',
      `← Coeficiente a = ${aStr}: controla la pendiente de las ramas (${a > 0 ? 'abre hacia arriba V' : 'se refleja hacia abajo Λ'}). A la derecha del vértice la pendiente es +${aStr} y a la izquierda es ${fmt(-a)}.`,
      `Coeficiente de apertura y reflexión a: ${aStr}`,
      'pink'
    );

    const tokMinus = makeToken(
      hInsideSign,
      'distancia',
      `← ¿Por qué lleva signo «${hInsideSign}»? Porque medimos la distancia |x − (${fmt(hVal)})|. El vértice ocurre cuando esa distancia vale CERO: x ${hInsideSign} ${hAbsStr} = 0 ⟹ x = ${fmt(hVal)}.`,
      `Operador de distancia dentro de las barras: ${hInsideSign}`,
      'teal'
    );

    const tokH = makeToken(
      formatNumOrFracNode(Math.abs(hVal)),
      `vértice X (h = ${fmt(hVal)})`,
      `← Coordenada X del vértice y Eje de Simetría (x = ${fmt(hVal)}): traslada toda la «V» horizontalmente hacia x = ${fmt(hVal)}.`,
      `Coordenada horizontal del vértice h: ${hAbsStr}`,
      'teal'
    );

    const tokK = makeToken(
      h('span', { style: 'display: inline-flex; align-items: center; gap: 4px;' },
        kSign,
        formatNumOrFracNode(Math.abs(kVal))
      ),
      `piso/techo Y (k = ${fmt(kVal)})`,
      `← Coordenada Y del vértice (k = ${fmt(kVal)}): cuando x = ${fmt(hVal)}, las barras se anulan (valen 0) y la altura resultante es exactamente f(${fmt(hVal)}) = ${fmt(kVal)}.`,
      `Desplazamiento vertical k: ${kSign} ${kAbsStr}`,
      'yellow'
    );

    mount(
      formulaWrap,
      h('span', { class: 'seq-annotated__eq' }, `${fnName}(x) = `),
      tokA,
      h('span', { class: 'abs-annotated__bar' }, ' · | x '),
      tokMinus,
      h('span', { class: 'seq-annotated__space' }, ' '),
      tokH,
      h('span', { class: 'abs-annotated__bar' }, ' | '),
      tokK
    );
  }

  showDefaultHint();
  renderFormula();
  mount(root, h('div', { class: 'seq-annotated abs-annotated' }, formulaWrap, noteArea));

  return {
    update(nextConfig = {}) {
      state = { ...state, ...nextConfig };
      renderFormula();
    },
  };
}

/**
 * 3. piecewiseBrace(root, pieces, activePieceIdx = null)
 * Renderiza una llave matemática vectorial escalable (.va-piecewise + .va-pw-brace-svg)
 * donde cada renglón muestra la expresión algebraica a la izquierda y la condición de dominio a la derecha.
 */
export function piecewiseBrace(root, pieces = [], activePieceIdx = null, options = {}) {
  const { fnName = 'f(x)', rejectedIndices = [] } = options;

  const rows = pieces.map((p, idx) => {
    const isActive = activePieceIdx === idx;
    const isRejected = rejectedIndices.includes(idx);

    const exprContent = p.exprNode || p.exprText || p.simplifiedText || p.label || '';

    return h('div', {
      class: [
        'va-pw-row',
        'abs-brace__row',
        isActive ? 'is-active' : '',
        isRejected ? 'is-rejected' : '',
      ],
      dataset: { pieceIndex: idx },
    },
      h('span', { class: 'va-pw-expr abs-brace__expr eq' }, exprContent),
      h('span', { class: 'va-pw-cond abs-brace__cond' }, p.condition ? `si ${p.condition.replace(/^si\s+/i, '')}` : '')
    );
  });

  const braceSvg = s('svg', {
    class: 'va-pw-brace-svg',
    viewBox: '0 0 24 100',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  },
    s('path', {
      d: 'M 22 2 Q 12 2 12 18 L 12 42 Q 12 50 3 50 Q 12 50 12 58 L 12 82 Q 12 98 22 98',
      stroke: 'var(--yellow)',
      'stroke-width': '2.5',
      fill: 'none',
      'vector-effect': 'non-scaling-stroke',
    })
  );

  const braceBox = h('div', { class: 'va-piecewise seq-annotated__brace-box abs-brace-box' },
    fnName ? h('span', { class: 'va-pw-lhs abs-brace__lhs eq' }, `${fnName} = `) : null,
    h('div', { class: 'va-pw-brace seq-annotated__brace abs-brace__symbol', 'aria-hidden': 'true' }, braceSvg),
    h('div', { class: 'va-pw-rows seq-annotated__cases abs-brace__cases abs-brace__rows' }, ...rows)
  );

  mount(root, braceBox);
  return braceBox;
}

function resolveExpectedChoiceIndex(q) {
  if (typeof q.expected === 'number') {
    return q.expected;
  }
  if (typeof q.expected === 'string') {
    const trimmed = q.expected.trim();
    if (/^[A-D]$/i.test(trimmed)) {
      return trimmed.toUpperCase().charCodeAt(0) - 65;
    }
    const idx = q.options.findIndex((opt) => {
      if (typeof opt === 'string') {
        const cleanOpt = opt.replace(/^(\([A-Za-z0-9]\)|[A-Za-z0-9][\)\.\-:])\s*/i, '').trim();
        const cleanExp = trimmed.replace(/^(\([A-Za-z0-9]\)|[A-Za-z0-9][\)\.\-:])\s*/i, '').trim();
        return cleanOpt === cleanExp || opt.trim() === trimmed;
      }
      return opt === q.expected;
    });
    if (idx !== -1) return idx;
  }
  return 0;
}

/**
 * 4. createCheckBlock(root, questions, sectionId, onComplete)
 * Soporta preguntas de tipo:
 * - 'number': input numérico
 * - 'expr': fórmula algebraica en x evaluada con equivalentFx() y diagnoseAbs()
 * - 'vertex' o 'pair': par ordenado (h; k) o (m; b)
 * - 'choice': selección múltiple
 * - 'match': emparejamiento
 * - 'graph-target': lienzo cartesiano interactivo donde el usuario arrastra (h; k) y pendiente 'a'
 */
export function createCheckBlock(root, questions = [], sectionId = '', onComplete = null) {
  let lastCorrectSlot = -1;
  const state = {
    answers: questions.map((q) => {
      let optionOrder = null;
      if (q.type === 'choice' && Array.isArray(q.options) && q.options.length > 1) {
        const n = q.options.length;
        const expectedIdx = resolveExpectedChoiceIndex(q);
        optionOrder = q.options.map((_, i) => i);
        for (let attempt = 0; attempt < 10; attempt++) {
          for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionOrder[i], optionOrder[j]] = [optionOrder[j], optionOrder[i]];
          }
          const correctSlot = optionOrder.indexOf(expectedIdx);
          if (correctSlot !== lastCorrectSlot || n <= 1) {
            lastCorrectSlot = correctSlot;
            break;
          }
        }
      }
      return {
        value: q.type === 'graph-target'
          ? { a: q.initial?.a ?? 1, h: q.initial?.h ?? 0, k: q.initial?.k ?? 0 }
          : null,
        ok: false,
        feedback: null,
        hintIndex: 0,
        showSolution: false,
        failCount: 0,
        optionOrder,
      };
    }),
    allCompletedReported: false,
  };

  const container = h('div', { class: 'seq-check-block abs-check-block', dataset: { section: sectionId } });

  function triggerVnReaction(q, qState, isOk, diagId = null) {
    if (isOk) {
      playSuccess('normal');
      if (diagId === 'unfactored_inner_coeff' && DIAGNOSE_REACTIONS.unfactored_inner_coeff) {
        react(DIAGNOSE_REACTIONS.unfactored_inner_coeff);
        return;
      }
      if ((qState.failCount || 0) === 0) {
        const phrases = [
          {
            pose: 'orgullosa',
            tag: '¡Clavadísimo!',
            html: '¡Impecable a la primera! Así se lee la geometría de una función sin memorizar reglitas sueltas.',
          },
          {
            pose: 'feliz',
            tag: '¡Bien ahí!',
            html: '¡Exacto! Fijate qué limpio sale cuando pensás en el punto de distancia cero y en la pendiente de las ramas.',
          },
          {
            pose: 'orgullosa',
            tag: 'Nivel Exactas',
            html: 'Je, nada mal. Con ese ojo para los bordes y los signos no te van a poder engañar en el parcial.',
          },
        ];
        const pick = phrases[Math.floor(Math.random() * phrases.length)];
        react(pick);
      } else {
        react({
          pose: 'feliz',
          tag: '¡Ahora sí!',
          html: '¡Eso mismo! Costó un par de ajustes, pero destrabaste la trampa conceptual. ¡Sigamos avanzando!',
        });
      }
      return;
    }

    qState.failCount = (qState.failCount || 0) + 1;
    playError(qState.failCount);

    if (diagId && DIAGNOSE_REACTIONS[diagId]) {
      react(DIAGNOSE_REACTIONS[diagId]);
      return;
    }

    if (qState.failCount === 1) {
      react({
        pose: 'base',
        tag: 'Revisá el planteo',
        html: 'Mmm, todavía no coincide. Mirá con cuidado dónde se anula lo de adentro de las barras o cómo están definidos los signos de cada tramo.',
      });
    } else if (qState.failCount === 2) {
      react({
        pose: 'enojada',
        tag: '¡Frená la mano!',
        html: '¡No me tires coordenadas o fórmulas al azar para ver si embocás! N-no es que me preocupe tu nota, ¿eh?, pero me da una bronca bárbara verte adivinar. ¡Tocá el botón de <strong>Pista</strong> y pensalo geométricamente!',
      });
    } else {
      react({
        pose: 'colapso',
        tag: '¡Colapso mental!',
        html: '¡Me vas a hacer dar un colapso nervioso! Evaluá un punto concreto en tu expresión (como el vértice <span class="eq">x = h</span>) y compará la altura que te da con la del gráfico.',
      });
    }
  }

  function checkCompletion() {
    const allOk = state.answers.every((a) => a.ok);
    if (allOk) {
      if (!state.allCompletedReported) {
        state.allCompletedReported = true;
        setTimeout(() => playSuccess('section'), 320);
      }
      saveSectionProgress(sectionId);
      onComplete?.(sectionId);
    }
  }

  function render() {
    const allDone = state.answers.every((a) => a.ok);

    const cards = questions.map((q, idx) => {
      const qState = state.answers[idx];
      const isResolved = qState.ok;

      const header = h('div', { class: 'seq-check__header' },
        h('span', { class: 'seq-check__badge' }, `Ejercicio ${idx + 1}`),
        isResolved ? chalkIcon('check', { class: 'seq-check__check-icon' }) : null
      );

      const promptEl = h('div', { class: 'seq-check__prompt' });
      if (typeof q.prompt === 'string') {
        promptEl.innerHTML = q.prompt;
      } else if (q.prompt instanceof Node) {
        promptEl.append(q.prompt);
      }

      const inputSlot = h('div', { class: 'seq-check__input-slot' });

      if (q.type === 'number') {
        const inputNum = h('input', {
          type: 'number',
          class: ['seq-check__input', isResolved ? 'is-valid' : ''],
          step: 'any',
          disabled: isResolved,
          placeholder: 'Ingresá un número',
          value: qState.value !== null ? qState.value : '',
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluateNumber = () => {
          const val = parseFloat(inputNum.value.replace(',', '.'));
          if (Number.isNaN(val)) {
            qState.feedback = { ok: false, message: 'Ingresá un número válido.' };
            triggerVnReaction(q, qState, false);
          } else {
            const isMatch = approxEq(val, q.expected);
            qState.value = val;
            qState.ok = isMatch;
            qState.feedback = isMatch
              ? { ok: true, message: q.explanation || '¡Excelente! Respuesta correcta.' }
              : { ok: false, message: `Obtuviste ${fmt(val)}, pero no coincide con el valor buscado.` };
            triggerVnReaction(q, qState, isMatch);
          }
          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluateNumber);
        inputNum.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') evaluateNumber();
        });

        mount(inputSlot, h('div', { class: 'seq-check__row' }, inputNum, btnCheck));
      } else if (q.type === 'expr') {
        const inputExpr = h('input', {
          type: 'text',
          class: ['seq-check__input', isResolved ? 'is-valid' : ''],
          disabled: isResolved,
          placeholder: q.placeholder || 'ej. -2|x - 1| + 4',
          value: qState.value || '',
        });

        const previewEl = h('div', { class: 'seq-check__preview muted small' });
        const updatePreview = () => {
          const raw = inputExpr.value.trim();
          if (!raw) {
            mount(previewEl);
            return;
          }
          const parsed = tryParseExpr(raw);
          if (parsed.ok) {
            mount(previewEl, 'Interpretado como: ', h('strong', { class: 'eq' }, toDisplay(parsed.ast)));
          } else {
            mount(previewEl, h('span', { class: 'text-warn' }, parsed.error?.message || 'Fórmula incompleta'));
          }
        };

        inputExpr.addEventListener('input', updatePreview);

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluateExprQuestion = () => {
          const raw = inputExpr.value.trim();
          const parsed = tryParseExpr(raw);
          if (!parsed.ok) {
            qState.feedback = { ok: false, message: parsed.error?.message || 'Error de sintaxis en la fórmula.' };
            triggerVnReaction(q, qState, false);
            render();
            return;
          }

          qState.value = raw;
          const ast = parsed.ast;
          const expObj = typeof q.expected === 'string' ? { expr: q.expected } : q.expected;
          const targetExpr = expObj.expr || formatCanonicalAbs(expObj.a ?? 1, expObj.h ?? 0, expObj.k ?? 0);
          const isEquiv = equivalentFx(ast, targetExpr);

          const diags = expObj.a !== undefined ? diagnoseAbs(ast, expObj) : [];
          const warnDiag = diags.find((d) => d.severity === 'warn');
          const errDiag = diags.find((d) => d.severity === 'error');

          if (isEquiv) {
            qState.ok = true;
            qState.feedback = {
              ok: true,
              message: warnDiag ? warnDiag.message : (q.explanation || '¡Perfecto! La expresión algebraica es correcta.'),
            };
            triggerVnReaction(q, qState, true, warnDiag?.id || null);
          } else {
            qState.ok = false;
            qState.feedback = {
              ok: false,
              message: errDiag?.message || 'La expresión ingresada no genera la gráfica o los valores pedidos.',
            };
            triggerVnReaction(q, qState, false, errDiag?.id || null);
          }

          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluateExprQuestion);
        inputExpr.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') evaluateExprQuestion();
        });

        mount(
          inputSlot,
          h('div', { class: 'seq-check__row' }, inputExpr, btnCheck),
          previewEl
        );
      } else if (q.type === 'vertex' || q.type === 'pair') {
        const firstLabel = q.firstLabel || (q.type === 'vertex' ? 'Coordenada X (h)' : 'Pendiente (m)');
        const secondLabel = q.secondLabel || (q.type === 'vertex' ? 'Coordenada Y (k)' : 'Ordenada (b)');

        const expFirst = q.expected.h !== undefined ? q.expected.h : q.expected.first;
        const expSecond = q.expected.k !== undefined ? q.expected.k : q.expected.second;

        const inputFirst = h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          disabled: isResolved,
          placeholder: q.type === 'vertex' ? 'h' : 'm',
          value: qState.value?.first !== undefined ? qState.value.first : '',
        });

        const inputSecond = h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          disabled: isResolved,
          placeholder: q.type === 'vertex' ? 'k' : 'b',
          value: qState.value?.second !== undefined ? qState.value.second : '',
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluateVertex = () => {
          const v1 = parseFloat(String(inputFirst.value).replace(',', '.'));
          const v2 = parseFloat(String(inputSecond.value).replace(',', '.'));

          if (Number.isNaN(v1) || Number.isNaN(v2)) {
            qState.feedback = { ok: false, message: 'Completá ambas coordenadas con números válidos.' };
            triggerVnReaction(q, qState, false);
          } else {
            const match1 = approxEq(v1, expFirst);
            const match2 = approxEq(v2, expSecond);
            qState.value = { first: v1, second: v2 };
            qState.ok = match1 && match2;

            let diagId = null;
            if (!qState.ok && q.type === 'vertex') {
              const diags = diagnoseAbs(
                { a: q.expected.a ?? 1, h: v1, k: v2 },
                { a: q.expected.a ?? 1, h: expFirst, k: expSecond }
              );
              if (diags.length > 0) diagId = diags[0].id;
            }

            if (qState.ok) {
              qState.feedback = { ok: true, message: q.explanation || `¡Excelente! (${fmt(expFirst)}; ${fmt(expSecond)}) es correcto.` };
            } else if (diagId) {
              const dObj = diagnoseAbs(
                { a: q.expected.a ?? 1, h: v1, k: v2 },
                { a: q.expected.a ?? 1, h: expFirst, k: expSecond }
              )[0];
              qState.feedback = { ok: false, message: dObj.message };
            } else if (!match1 && match2) {
              qState.feedback = { ok: false, message: `El segundo valor (${fmt(v2)}) está bien, pero revisá el primero.` };
            } else if (match1 && !match2) {
              qState.feedback = { ok: false, message: `El primer valor (${fmt(v1)}) está bien, pero revisá el segundo.` };
            } else {
              qState.feedback = { ok: false, message: 'Ninguno de los dos valores coincide. Revisá los signos.' };
            }

            triggerVnReaction(q, qState, qState.ok, diagId);
          }
          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluateVertex);
        mount(
          inputSlot,
          h('div', { class: 'seq-check__pair-grid' },
            h('label', { class: 'seq-check__pair-label' }, `${firstLabel}: `, inputFirst),
            h('label', { class: 'seq-check__pair-label' }, `${secondLabel}: `, inputSecond),
            btnCheck
          )
        );
      } else if (q.type === 'choice') {
        const expectedIdx = resolveExpectedChoiceIndex(q);
        const order = qState.optionOrder || q.options.map((_, i) => i);
        const optionsContainer = h('div', { class: 'seq-check__options' },
          order.map((origIdx, displayIdx) => {
            const rawOpt = q.options[origIdx];
            const opt = typeof rawOpt === 'string'
              ? rawOpt.replace(/^(\([A-Za-z0-9]\)|[A-Za-z0-9][\)\.\-:])\s*/i, '')
              : rawOpt;
            const letter = String.fromCharCode(65 + displayIdx);
            const isSelectedOpt = qState.value === origIdx;
            const isMatch = origIdx === expectedIdx;
            const btn = h('button', {
              type: 'button',
              class: [
                'seq-check__opt-btn',
                isSelectedOpt ? 'is-selected' : '',
                isResolved && isMatch ? 'is-correct' : '',
              ],
              dataset: { answer: displayIdx, origIndex: origIdx },
              disabled: isResolved,
            },
              h('strong', { class: 'seq-check__opt-tag' }, `${letter}) `),
              typeof opt === 'string' && opt.includes('<')
                ? (() => { const sp = h('span'); sp.innerHTML = opt; return sp; })()
                : opt
            );

            btn.addEventListener('click', () => {
              qState.value = origIdx;
              qState.ok = isMatch;
              const diagId = (!isMatch && q.optionDiagnostics?.[origIdx]) || null;
              qState.feedback = isMatch
                ? { ok: true, message: q.explanation || '¡Correcto! Opción acertada.' }
                : { ok: false, message: q.optionFeedback?.[origIdx] || 'Opción incorrecta. Analizá la definición y volvé a probar.' };
              triggerVnReaction(q, qState, isMatch, diagId);
              checkCompletion();
              render();
            });

            return btn;
          })
        );
        mount(inputSlot, optionsContainer);
      } else if (q.type === 'graph-target') {
        const curVal = qState.value || { a: 1, h: 0, k: 0 };
        const boardWrap = h('div', { class: 'abs-check-board-wrap' });
        const statusReadout = h('div', { class: 'abs-check-readout small muted' },
          `Tu gráfica actual: f(x) = ${formatCanonicalAbs(curVal.a, curVal.h, curVal.k)} · Vértice (${fmt(curVal.h)}; ${fmt(curVal.k)})`
        );

        createAbsBoard(boardWrap, {
          a: curVal.a,
          h: curVal.h,
          k: curVal.k,
          xMin: q.xMin ?? -7,
          xMax: q.xMax ?? 7,
          yMin: q.yMin ?? -7,
          yMax: q.yMax ?? 7,
          snapStep: q.snapStep ?? 0.5,
          draggableVertex: !isResolved && (q.draggableVertex !== false),
          draggableSlope: !isResolved && Boolean(q.draggableSlope),
          onChange(next) {
            qState.value = { a: next.a, h: next.h, k: next.k };
            statusReadout.textContent = `Tu gráfica actual: f(x) = ${formatCanonicalAbs(next.a, next.h, next.k)} · Vértice (${fmt(next.h)}; ${fmt(next.k)})`;
          },
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar gráfica en el plano');

        btnCheck.addEventListener('click', () => {
          const u = qState.value;
          const exp = q.expected;
          const matchA = approxEq(u.a, exp.a ?? 1);
          const matchH = approxEq(u.h, exp.h ?? 0);
          const matchK = approxEq(u.k, exp.k ?? 0);
          const isOk = matchA && matchH && matchK;
          qState.ok = isOk;

          const diags = diagnoseAbs(u, { a: exp.a ?? 1, h: exp.h ?? 0, k: exp.k ?? 0 });
          const diagId = diags[0]?.id || null;

          if (isOk) {
            qState.feedback = {
              ok: true,
              message: q.explanation || `¡Gráfica exacta! Clavaste el vértice en (${fmt(exp.h)}; ${fmt(exp.k)}) y la pendiente a = ${fmt(exp.a ?? 1)}.`,
            };
          } else {
            qState.feedback = {
              ok: false,
              message: diags[0]?.message || `Tu gráfica actual tiene vértice en (${fmt(u.h)}; ${fmt(u.k)}) y pendiente a = ${fmt(u.a)}. Ajustá los nodos sobre el plano.`,
            };
          }

          triggerVnReaction(q, qState, isOk, diagId);
          checkCompletion();
          render();
        });

        mount(
          inputSlot,
          boardWrap,
          h('div', { class: 'seq-check__row', style: 'justify-content: space-between; margin-top: 8px;' },
            statusReadout,
            btnCheck
          )
        );
      } else if (q.type === 'match') {
        const currentSelections = Array.isArray(qState.value)
          ? [...qState.value]
          : q.pairs.map(() => '');

        const rows = q.pairs.map((pair, pIdx) => {
          const selectEl = h('select', {
            class: 'seq-check__match-select',
            disabled: isResolved,
          },
            h('option', { value: '' }, '— Elegí —'),
            ...q.choices.map((ch, cIdx) =>
              h('option', {
                value: String(cIdx),
                selected: String(currentSelections[pIdx]) === String(cIdx),
              }, ch)
            )
          );

          selectEl.addEventListener('change', (e) => {
            currentSelections[pIdx] = e.target.value;
            qState.value = [...currentSelections];
          });

          return h('div', { class: 'seq-check__row' },
            h('span', { class: 'eq' }, pair.left),
            h('span', { class: 'muted' }, '→'),
            selectEl
          );
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar emparejamiento');

        btnCheck.addEventListener('click', () => {
          qState.value = [...currentSelections];
          if (currentSelections.some((v) => v === '')) {
            qState.feedback = { ok: false, message: 'Seleccioná una opción para cada fila antes de comprobar.' };
            triggerVnReaction(q, qState, false);
            render();
            return;
          }
          const allMatch = q.pairs.every((pair, pIdx) => Number(currentSelections[pIdx]) === pair.expectedIndex);
          qState.ok = allMatch;
          qState.feedback = allMatch
            ? { ok: true, message: q.explanation || '¡Todos los emparejamientos son correctos!' }
            : { ok: false, message: 'Alguno de los emparejamientos no coincide. Revisá cada fila.' };
          triggerVnReaction(q, qState, allMatch);
          checkCompletion();
          render();
        });

        mount(inputSlot, ...rows, btnCheck);
      }

      const feedbackEl = h('div', { class: 'seq-check__feedback', 'aria-live': 'polite' });
      if (qState.feedback) {
        const msgSpan = h('span');
        if (typeof qState.feedback.message === 'string' && qState.feedback.message.includes('<')) {
          msgSpan.innerHTML = qState.feedback.message;
        } else {
          msgSpan.textContent = qState.feedback.message;
        }
        mount(
          feedbackEl,
          h('div', { class: ['notice', qState.feedback.ok ? 'notice--ok' : 'notice--err'] },
            qState.feedback.ok ? chalkIcon('check') : chalkIcon('cross'),
            msgSpan
          )
        );
      }

      const toolsRow = h('div', { class: 'seq-check__tools' });

      if (q.hints && q.hints.length > 0 && !isResolved) {
        const currentHintLevel = qState.hintIndex;
        const btnHint = h('button', {
          type: 'button',
          class: 'chip',
        }, currentHintLevel < q.hints.length ? `Pista (${currentHintLevel + 1}/${q.hints.length})` : 'Pistas mostradas');

        btnHint.addEventListener('click', () => {
          if (qState.hintIndex < q.hints.length) {
            const hintText = q.hints[qState.hintIndex];
            qState.hintIndex++;
            render();
            react({
              pose: 'base',
              tag: 'Pista desbloqueada',
              html: `Mirá esta pista: <em>${hintText}</em>`,
            });
          }
        });
        toolsRow.append(btnHint);
      }

      if (q.solution && !isResolved) {
        const btnSol = h('button', {
          type: 'button',
          class: ['chip', qState.showSolution ? 'chip--active' : 'chip--ghost'],
        }, qState.showSolution ? 'Ocultar solución' : '¡Estoy atorado! Mostrame la solución');

        btnSol.addEventListener('click', () => {
          qState.showSolution = !qState.showSolution;
          render();
          if (qState.showSolution) {
            react({
              pose: 'colapso',
              tag: 'Suspiro...',
              html: 'Suspiro... bueno, no sufras de más. Mirá el desglose paso a paso para entender de dónde sale:',
            });
          }
        });
        toolsRow.append(btnSol);
      }

      let hintsDisplay = null;
      if (qState.hintIndex > 0 && q.hints) {
        hintsDisplay = h('div', { class: 'seq-check__hints-box' });
        for (let hIdx = 0; hIdx < qState.hintIndex; hIdx++) {
          const hintSpan = h('span');
          const hValStr = q.hints[hIdx];
          if (typeof hValStr === 'string' && hValStr.includes('<')) {
            hintSpan.innerHTML = hValStr;
          } else {
            hintSpan.textContent = hValStr;
          }
          hintsDisplay.append(
            h('div', { class: 'seq-check__hint-item small' },
              h('strong', null, `Pista ${hIdx + 1}: `),
              hintSpan
            )
          );
        }
      }

      let solutionDisplay = null;
      if (qState.showSolution && q.solution) {
        solutionDisplay = h('div', { class: 'seq-check__solution-box' });
        const solContent = h('div', { class: 'seq-check__solution small' },
          h('strong', null, 'Resolución paso a paso:'),
          h('div', null)
        );
        if (typeof q.solution === 'string') {
          solContent.lastChild.innerHTML = q.solution;
        } else {
          solContent.lastChild.append(q.solution);
        }
        solutionDisplay.append(solContent);
      }

      const cardChildren = [
        header,
        promptEl,
        inputSlot,
        qState.feedback ? feedbackEl : null,
        toolsRow.childNodes.length > 0 ? toolsRow : null,
        hintsDisplay,
        solutionDisplay,
      ].filter(Boolean);

      return h('article', { class: ['seq-check__card', isResolved ? 'is-resolved' : ''] }, ...cardChildren);
    });

    const completionBanner = allDone
      ? h('div', { class: 'notice notice--ok seq-check__all-done' },
          chalkIcon('check'),
          h('div', null,
            h('strong', null, '¡Sección completada con éxito!'),
            h('p', { class: 'small' }, 'Resolviste todos los desafíos de este pizarrón. Tu progreso quedó registrado.')
          )
        )
      : null;

    mount(container, ...cards, completionBanner);
  }

  render();
  mount(root, container);

  return {
    isCompleted: () => state.answers.every((a) => a.ok),
  };
}
