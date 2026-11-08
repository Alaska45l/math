/**
 * Alaska Math Lab · Función Cuadrática, Factorización y Parábolas
 * Kit de pizarrones SVG (.quad-board-svg) con recorte clipPath seguro,
 * escalado dinámico de coordenadas cartesianas, arrastre táctil/mouse y bloque de predicción 1-clic.
 */

import { h, s, clear, chalkIcon } from '../../../core/dom.js';
import { playClick, playSuccess } from '../../../core/sound.js';

let clipCounter = 0;

/**
 * Crea un lienzo SVG aislado con la clase obligatoria .quad-board-svg y un clipPath interno.
 */
export function createQuadBoardSvg({
  width = 680,
  height = 340,
  ariaLabel = 'Pizarrón interactivo de función cuadrática',
  pad = { top: 22, right: 24, bottom: 30, left: 38 },
} = {}) {
  clipCounter += 1;
  const clipId = `quad-plot-clip-${clipCounter}`;
  const plotBox = {
    x: pad.left,
    y: pad.top,
    w: width - pad.left - pad.right,
    h: height - pad.top - pad.bottom,
  };

  const defs = s('defs', {}, [
    s('clipPath', { id: clipId }, [
      s('rect', {
        x: plotBox.x,
        y: plotBox.y,
        width: plotBox.w,
        height: plotBox.h,
        rx: 6,
      }),
    ]),
  ]);

  const bgRect = s('rect', {
    x: plotBox.x,
    y: plotBox.y,
    width: plotBox.w,
    height: plotBox.h,
    rx: 6,
    fill: 'rgba(14, 22, 18, 0.55)',
    stroke: 'rgba(236, 242, 232, 0.18)',
    'stroke-width': 1,
  });

  const gridLayer = s('g', { class: 'quad-svg-grid' });
  const clippedLayer = s('g', {
    class: 'quad-svg-clipped',
    'clip-path': `url(#${clipId})`,
  });
  const overlayLayer = s('g', { class: 'quad-svg-overlay' });

  const svg = s(
    'svg',
    {
      class: 'quad-board-svg',
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': ariaLabel,
    },
    [defs, bgRect, gridLayer, clippedLayer, overlayLayer]
  );

  return {
    svg,
    plotBox,
    clipId,
    gridLayer,
    clippedLayer,
    overlayLayer,
    width,
    height,
  };
}

/**
 * Crea un transformador de coordenadas cartesianas (xMin..xMax, yMin..yMax) dentro de plotBox.
 */
export function createCartesianMapper(
  plotBox,
  { xMin = -8, xMax = 8, yMin = -10, yMax = 10 } = {}
) {
  const spanX = Math.max(1e-6, xMax - xMin);
  const spanY = Math.max(1e-6, yMax - yMin);

  const toX = (x) => plotBox.x + ((x - xMin) / spanX) * plotBox.w;
  const toY = (y) => plotBox.y + plotBox.h - ((y - yMin) / spanY) * plotBox.h;
  const fromX = (px) => xMin + ((px - plotBox.x) / plotBox.w) * spanX;
  const fromY = (py) => yMin + ((plotBox.y + plotBox.h - py) / plotBox.h) * spanY;

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    plotBox,
    toX,
    toY,
    fromX,
    fromY,
  };
}

/**
 * Dibuja grilla y ejes cartesianos con numeración limpia que nunca se sale del plotBox.
 */
export function drawCartesianAxes(
  gridLayer,
  mapper,
  { xStep = 2, yStep = 2, xLabel = 'x', yLabel = 'y' } = {}
) {
  clear(gridLayer);
  const { xMin, xMax, yMin, yMax, plotBox, toX, toY } = mapper;

  const firstX = Math.ceil(xMin / xStep) * xStep;
  for (let x = firstX; x <= xMax + 1e-6; x += xStep) {
    const px = toX(x);
    if (px < plotBox.x - 1 || px > plotBox.x + plotBox.w + 1) continue;
    gridLayer.appendChild(
      s('line', {
        x1: px,
        y1: plotBox.y,
        x2: px,
        y2: plotBox.y + plotBox.h,
        stroke: 'rgba(236, 242, 232, 0.08)',
        'stroke-width': 1,
      })
    );
    if (Math.abs(x) > 1e-6) {
      const axisY = Math.min(
        plotBox.y + plotBox.h + 13,
        Math.max(plotBox.y + 14, toY(0) + 14)
      );
      gridLayer.appendChild(
        s(
          'text',
          {
            x: px,
            y: axisY,
            fill: 'var(--muted)',
            'font-size': 10,
            'text-anchor': 'middle',
          },
          String(Math.round(x * 100) / 100)
        )
      );
    }
  }

  const firstY = Math.ceil(yMin / yStep) * yStep;
  for (let y = firstY; y <= yMax + 1e-6; y += yStep) {
    const py = toY(y);
    if (py < plotBox.y - 1 || py > plotBox.y + plotBox.h + 1) continue;
    gridLayer.appendChild(
      s('line', {
        x1: plotBox.x,
        y1: py,
        x2: plotBox.x + plotBox.w,
        y2: py,
        stroke: 'rgba(236, 242, 232, 0.08)',
        'stroke-width': 1,
      })
    );
    if (Math.abs(y) > 1e-6) {
      const axisX = Math.min(
        plotBox.x + plotBox.w - 18,
        Math.max(plotBox.x + 18, toX(0) - 6)
      );
      gridLayer.appendChild(
        s(
          'text',
          {
            x: axisX,
            y: py + 3,
            fill: 'var(--muted)',
            'font-size': 10,
            'text-anchor': 'end',
          },
          String(Math.round(y * 100) / 100)
        )
      );
    }
  }

  // Eje X
  if (yMin <= 0 && yMax >= 0) {
    const y0 = toY(0);
    gridLayer.appendChild(
      s('line', {
        x1: plotBox.x,
        y1: y0,
        x2: plotBox.x + plotBox.w,
        y2: y0,
        stroke: 'rgba(236, 242, 232, 0.45)',
        'stroke-width': 1.5,
      })
    );
    gridLayer.appendChild(
      s(
        'text',
        {
          x: plotBox.x + plotBox.w - 6,
          y: Math.max(plotBox.y + 12, y0 - 6),
          fill: 'var(--ink)',
          'font-size': 11,
          'font-weight': 'bold',
          'text-anchor': 'end',
        },
        xLabel
      )
    );
  }

  // Eje Y
  if (xMin <= 0 && xMax >= 0) {
    const x0 = toX(0);
    gridLayer.appendChild(
      s('line', {
        x1: x0,
        y1: plotBox.y,
        x2: x0,
        y2: plotBox.y + plotBox.h,
        stroke: 'rgba(236, 242, 232, 0.45)',
        'stroke-width': 1.5,
      })
    );
    gridLayer.appendChild(
      s(
        'text',
        {
          x: Math.min(plotBox.x + plotBox.w - 10, x0 + 8),
          y: plotBox.y + 13,
          fill: 'var(--ink)',
          'font-size': 11,
          'font-weight': 'bold',
        },
        yLabel
      )
    );
  }
}

/**
 * Genera el atributo d de un <path> muestreando f(x) sobre el rango de mapper.
 */
export function sampleCurvePath(fn, mapper, steps = 140, xStart = null, xEnd = null) {
  const x0 = xStart !== null ? xStart : mapper.xMin;
  const x1 = xEnd !== null ? xEnd : mapper.xMax;
  const dx = (x1 - x0) / steps;
  const parts = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + i * dx;
    const y = fn(x);
    if (!Number.isFinite(y)) continue;
    // Clamp extremo muy lejano para evitar artefactos numéricos de SVG
    const clampedY = Math.max(mapper.yMin - 80, Math.min(mapper.yMax + 80, y));
    const px = mapper.toX(x).toFixed(2);
    const py = mapper.toY(clampedY).toFixed(2);
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${px},${py}`);
  }
  return parts.join(' ');
}

/**
 * Conecta arrastre con PointerEvents sobre el SVG convirtiendo coordenadas de pantalla al viewBox.
 */
export function attachSvgDrag(svg, handleNode, getMapper, onMove) {
  let dragging = false;

  const clientToSvg = (e) => {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = vb.width / Math.max(1, rect.width);
    const scaleY = vb.height / Math.max(1, rect.height);
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const mapper = getMapper();
    return {
      px,
      py,
      x: mapper.fromX(px),
      y: mapper.fromY(py),
    };
  };

  handleNode.style.cursor = 'grab';
  handleNode.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    handleNode.style.cursor = 'grabbing';
    if (handleNode.setPointerCapture) {
      try {
        handleNode.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture error
      }
    }
  });

  handleNode.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    onMove(clientToSvg(e));
  });

  const stop = () => {
    dragging = false;
    handleNode.style.cursor = 'grab';
  };
  handleNode.addEventListener('pointerup', stop);
  handleNode.addEventListener('pointercancel', stop);
}

/**
 * Crea un control deslizante con etiqueta reactiva sin reemplazar nodos durante el arrastre.
 */
export function createSliderField({
  label,
  min,
  max,
  step = 1,
  value = 0,
  formatValue = (v) => String(v),
  onInput,
}) {
  const valSpan = h('span', { class: 'quad-slider-val' }, formatValue(value));
  const input = h('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
    'aria-label': label,
  });

  input.addEventListener('input', () => {
    const num = Number(input.value);
    valSpan.textContent = formatValue(num);
    if (typeof onInput === 'function') onInput(num);
  });

  const setValue = (newVal) => {
    input.value = String(newVal);
    valSpan.textContent = formatValue(Number(newVal));
  };

  const root = h('div', { class: 'quad-slider-field' }, [
    h('label', {}, [h('span', {}, label), valSpan]),
    input,
  ]);

  return { root, input, valSpan, setValue };
}

/**
 * Crea un bloque liviano de Predicción Previa (Predict-Observe-Explain) de 1 clic.
 */
export function createPredictBox({ prompt, options = [], onSelect } = {}) {
  const box = h('div', { class: 'quad-predict-box' });
  const titleEl = h('p', { class: 'quad-predict-prompt' }, [
    chalkIcon('spark', 15),
    ` Predicción rápida (1 clic): ${prompt}`,
  ]);
  const optionsRow = h('div', { class: 'pr-chip-row quad-predict-options' });
  const feedbackEl = h('div', {
    class: 'quad-predict-feedback',
    hidden: '',
    role: 'status',
    'aria-live': 'polite',
  });

  options.forEach((opt) => {
    const btn = h('button', { type: 'button', class: 'pr-chip' }, opt.label);
    btn.addEventListener('click', () => {
      for (const b of optionsRow.querySelectorAll('button')) {
        b.classList.remove('is-active');
      }
      btn.classList.add('is-active');
      feedbackEl.removeAttribute('hidden');
      if (opt.correct) {
        playSuccess();
        feedbackEl.textContent = `¡Bien anticipado! ${opt.explanation}`;
        feedbackEl.style.color = 'var(--green)';
      } else {
        playClick();
        feedbackEl.textContent = `Interesante apuesta: ${opt.explanation}`;
        feedbackEl.style.color = 'var(--yellow)';
      }
      if (typeof onSelect === 'function') onSelect(opt);
    });
    optionsRow.appendChild(btn);
  });

  box.append(titleEl, optionsRow, feedbackEl);
  return box;
}
