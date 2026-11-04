/**
 * constructor-puntos.js — Widget 6 (F18)
 * Reconstrucción analítica y geométrica de f(x) = k · aˣ con dos puntos arrastrables P y Q.
 * Demuestra f(x₂)/f(x₁) = a^(x₂ - x₁) y cubre presets canónicos de reconstrucción de fórmulas.
 */

import {
  createCartesianBoard,
  createStore,
  addChips,
  renderReadout,
  addDraggableMarker,
  fmt,
  s,
  setText,
  setVisible,
} from './board-kit.js';
import { fitExponentialFromPoints } from '../logic.js';

const PRESETS = {
  '7a': {
    label: '(−1; 3/2) y k=2',
    p1: { x: -1, y: 1.5 },
    p2: { x: 0, y: 2 },
    note: 'Como f(0) = 2, k = 2 inmediatamente. Razón a = 2 / 1,5 = 4/3.',
  },
  '7b': {
    label: 'a=1/2 y O(0; 4)',
    p1: { x: 0, y: 4 },
    p2: { x: 1, y: 2 },
    note: 'Ordenada al origen f(0) = 4 y razón 1/2: en x = 1 vale 2.',
  },
  '7c': {
    label: 'P(1; 1) y Q(2; 3)',
    p1: { x: 1, y: 1 },
    p2: { x: 2, y: 3 },
    note: 'Paso Δx = 1, razón 3/1 = 3 ⟹ a = 3. Coeficiente k = 1 / 3¹ = 1/3.',
  },
  '7d': {
    label: 'P(0; 1) y Q(−2; 25/9)',
    p1: { x: 0, y: 1 },
    p2: { x: -2, y: 25 / 9 },
    note: 'Paso Δx = −2, razón 25/9 ⟹ a = (25/9)^(−1/2) = 3/5 = 0,6.',
  },
  parcial: {
    label: '(0; −3) y (2; −0.75)',
    p1: { x: 0, y: -3 },
    p2: { x: 2, y: -0.75 },
    note: 'Ambos puntos en y < 0. Razón (−0,75)/(−3) = 1/4 con Δx = 2 ⟹ a = 1/2, k = −3. ¡Creciente!',
  },
};

export function initWidget(container, options = {}) {
  const board = createCartesianBoard(
    container,
    'Constructor de Exponenciales por 2 Puntos',
    {
      width: 640,
      height: 340,
      xMin: -4,
      xMax: 4,
      yMin: -5,
      yMax: 6,
      xStep: 1,
      yStep: 1,
    },
  );

  const plane = board.plane;

  const defaultPreset = options.preset || '7c';
  const initialData = PRESETS[defaultPreset] || PRESETS['7c'];

  const store = createStore({
    preset: defaultPreset,
    p1: { ...initialData.p1 },
    p2: { ...initialData.p2 },
  });

  // 1. Controls
  const presetOptions = [
    ...Object.entries(PRESETS).map(([k, p]) => [k, p.label]),
    ['custom', 'Puntos Libres (Arrastrar)'],
  ];

  const updatePresetChips = addChips(
    board.controls,
    presetOptions,
    store.get().preset,
    (key) => {
      if (PRESETS[key]) {
        const p = PRESETS[key];
        markerP.setPos(p.p1.x, p.p1.y);
        markerQ.setPos(p.p2.x, p.p2.y);
        store.set({ preset: key, p1: { ...p.p1 }, p2: { ...p.p2 } });
      } else {
        store.set({ preset: 'custom' });
      }
    },
    'Casos Clásicos de Reconstrucción',
  );

  // 2. SVG Elements
  // Curve path
  const curvePath = s('path', {
    fill: 'none',
    stroke: 'var(--yellow)',
    'stroke-width': 2.5,
  });
  plane.layers.curve.append(curvePath);

  // Projection dashed lines for P
  const projLinePX = s('line', { stroke: 'var(--blue)', 'stroke-dasharray': '3 3', opacity: 0.6 });
  const projLinePY = s('line', { stroke: 'var(--blue)', 'stroke-dasharray': '3 3', opacity: 0.6 });
  // Projection dashed lines for Q
  const projLineQX = s('line', { stroke: 'var(--yellow)', 'stroke-dasharray': '3 3', opacity: 0.6 });
  const projLineQY = s('line', { stroke: 'var(--yellow)', 'stroke-dasharray': '3 3', opacity: 0.6 });
  plane.layers.under.append(projLinePX, projLinePY, projLineQX, projLineQY);

  // Draggable Markers P and Q
  const markerP = addDraggableMarker(board, plane, store.get().p1.x, store.get().p1.y, {
    label: 'P',
    color: 'var(--blue)',
    radius: 7,
    snapStep: 0.5,
    onDrag: ({ x, y, phase }) => {
      store.set({ preset: 'custom', p1: { x, y } });
    },
  });

  const markerQ = addDraggableMarker(board, plane, store.get().p2.x, store.get().p2.y, {
    label: 'Q',
    color: 'var(--yellow)',
    radius: 7,
    snapStep: 0.5,
    onDrag: ({ x, y, phase }) => {
      store.set({ preset: 'custom', p2: { x, y } });
    },
  });

  // 3. Render pipeline
  const render = (state) => {
    updatePresetChips(state.preset);

    const p1 = state.p1;
    const p2 = state.p2;

    const curP = markerP.getPos();
    if (curP.x !== p1.x || curP.y !== p1.y) {
      markerP.setPos(p1.x, p1.y);
    }
    const curQ = markerQ.getPos();
    if (curQ.x !== p2.x || curQ.y !== p2.y) {
      markerQ.setPos(p2.x, p2.y);
    }

    // Update projections
    const sx1 = plane.sx(p1.x);
    const sy1 = plane.sy(p1.y);
    const sx2 = plane.sx(p2.x);
    const sy2 = plane.sy(p2.y);
    const sy0 = plane.sy(0);
    const sx0 = plane.sx(0);

    projLinePX.setAttribute('x1', String(sx1));
    projLinePX.setAttribute('y1', String(sy1));
    projLinePX.setAttribute('x2', String(sx1));
    projLinePX.setAttribute('y2', String(sy0));

    projLinePY.setAttribute('x1', String(sx1));
    projLinePY.setAttribute('y1', String(sy1));
    projLinePY.setAttribute('x2', String(sx0));
    projLinePY.setAttribute('y2', String(sy1));

    projLineQX.setAttribute('x1', String(sx2));
    projLineQX.setAttribute('y1', String(sy2));
    projLineQX.setAttribute('x2', String(sx2));
    projLineQX.setAttribute('y2', String(sy0));

    projLineQY.setAttribute('x1', String(sx2));
    projLineQY.setAttribute('y1', String(sy2));
    projLineQY.setAttribute('x2', String(sx0));
    projLineQY.setAttribute('y2', String(sy2));

    // Try analytical reconstruction
    let fit = null;
    let errorMsg = null;

    if (Math.abs(p1.x - p2.x) < 1e-6) {
      errorMsg = 'Los dos puntos están en la misma vertical (x₁ = x₂): no definen una función en ℝ.';
    } else if (p1.y === 0 || p2.y === 0) {
      errorMsg = 'Una exponencial elemental k · aˣ jamás corta el eje X (y ≠ 0 para todo punto real).';
    } else if (Math.sign(p1.y) !== Math.sign(p2.y)) {
      errorMsg = 'Los puntos tienen signos de y opuestos. La razón y₂/y₁ es negativa y carece de base real.';
    } else if (Math.abs(p1.y - p2.y) < 1e-6) {
      errorMsg = 'Los puntos tienen la misma ordenada y₁ = y₂: produce la recta constante f(x) = k (a = 1).';
    } else {
      try {
        fit = fitExponentialFromPoints(p1, p2);
      } catch (err) {
        errorMsg = err.message;
      }
    }

    if (fit && fit.a > 0 && Math.abs(fit.a - 1) > 1e-6) {
      setVisible(curvePath, true);
      const pathD = plane.fnPath((x) => fit.k * Math.pow(fit.a, x), -4, 4);
      curvePath.setAttribute('d', pathD);

      const deltaX = p2.x - p1.x;
      const ratioY = p2.y / p1.y;

      const rows = [
        [
          '1. Cociente de Ordenadas',
          `f(x₂) / f(x₁) = (${fmt(p2.y)}) / (${fmt(p1.y)}) = ${fmt(ratioY)}. Como k se cancela: a^(x₂ − x₁) = ${fmt(ratioY)}.`,
        ],
        [
          '2. Despeje de la Base a',
          `Paso horizontal Δx = x₂ − x₁ = ${fmt(deltaX)} ⟹ a = (${fmt(ratioY)})^(1/${fmt(deltaX)}) = ${fmt(fit.a)}.`,
        ],
        [
          '3. Coeficiente y Modelo Final',
          `k = y₁ / a^(x₁) = ${fmt(p1.y)} / (${fmt(fit.a)})^(${fmt(p1.x)}) = ${fmt(fit.k)} ⟹ f(x) = ${fmt(fit.k)} · ${fit.a === 0.5 ? '(1/2)' : fmt(fit.a)}ˣ.`,
        ],
      ];
      renderReadout(board.readout, 'Reconstrucción Analítica Completa', rows);
    } else {
      setVisible(curvePath, false);
      const rows = [
        ['Imposibilidad en ℝ', errorMsg || 'Configuración no válida para una exponencial elemental.'],
        ['Condición de Existencia', 'Para f(x) = k · aˣ se requiere x₁ ≠ x₂, y₁ · y₂ > 0 (mismo signo) e y₁ ≠ y₂.'],
      ];
      renderReadout(board.readout, 'Error de Reconstrucción', rows);
    }
  };

  const unsub = store.subscribe(render);
  render(store.get());

  return {
    destroy: () => unsub(),
    reset: () => {
      const p = PRESETS['7c'];
      markerP.setPos(p.p1.x, p.p1.y);
      markerQ.setPos(p.p2.x, p.p2.y);
      store.set({ preset: '7c', p1: { ...p.p1 }, p2: { ...p.p2 } });
    },
    update: (patch) => store.set(patch),
    getState: () => store.get(),
  };
}

export { initWidget as initConstructorPuntosWidget };
